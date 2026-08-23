import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id, enrollmentId } = await params;

  const supabase = await createClient();

  const formData = await request.formData();

  const locale = String(
    formData.get("locale") || "en"
  );

  /*
   * STEP 1
   * Verify that the enrollment belongs to this student.
   */
  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .eq("id", enrollmentId)
    .eq("student_id", id)
    .single();

  if (enrollmentError || !enrollment) {
    return new NextResponse(
      "Enrollment not found.",
      { status: 404 }
    );
  }

  /*
   * STEP 2
   * Find the payment belonging to this enrollment.
   */
  const {
    data: payment,
    error: paymentLookupError,
  } = await supabase
    .from("payments")
    .select("id, status")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentLookupError || !payment) {
    return new NextResponse(
      "Payment record not found.",
      { status: 404 }
    );
  }

  /*
   * STEP 3
   * Prevent duplicate payment confirmation.
   */
  if (payment.status === "paid") {
    return NextResponse.redirect(
      new URL(
        `/${locale}/admin/students/${id}`,
        request.url
      )
    );
  }

  /*
   * STEP 4
   * Mark the payment as paid.
   *
   * The database trigger `payment_paid_activation`
   * automatically:
   *
   * - activates the enrollment
   * - activates the contract
   * - generates the lessons
   */
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const {
    error: paymentUpdateError,
  } = await supabase
    .from("payments")
    .update({
      status: "paid",
      payment_date: today,
    })
    .eq("id", payment.id);

  if (paymentUpdateError) {
    console.error("PAYMENT UPDATE ERROR:", {
      code: paymentUpdateError.code,
      message: paymentUpdateError.message,
      details: paymentUpdateError.details,
      hint: paymentUpdateError.hint,
    });

    return new NextResponse(
      `Unable to confirm payment.

Code: ${paymentUpdateError.code || "unknown"}

Message: ${paymentUpdateError.message || "unknown"}

Details: ${paymentUpdateError.details || "none"}

Hint: ${paymentUpdateError.hint || "none"}`,
      { status: 500 }
    );
  }

  /*
   * The database trigger has handled
   * enrollment activation, contract activation,
   * and lesson generation.
   */
  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}
