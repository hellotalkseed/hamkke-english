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
   * --------------------------------------------------------------------------
   * STEP 1
   * VERIFY ENROLLMENT
   * --------------------------------------------------------------------------
   *
   * Make sure this enrollment actually belongs to this student.
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
   * --------------------------------------------------------------------------
   * STEP 2
   * FIND PAYMENT
   * --------------------------------------------------------------------------
   *
   * Every enrollment should have a payment record.
   */

  const {
    data: payment,
    error: paymentLookupError,
  } = await supabase
    .from("payments")
    .select(`
      id,
      enrollment_id,
      amount,
      currency,
      payment_date,
      payment_method,
      reference,
      notes,
      status
    `)
    .eq("enrollment_id", enrollmentId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (paymentLookupError) {
    console.error(
      "PAYMENT LOOKUP ERROR:",
      paymentLookupError
    );

    return new NextResponse(
      `Unable to find payment record.

Message: ${
        paymentLookupError.message ||
        "Unknown error"
      }`,
      { status: 500 }
    );
  }

  if (!payment) {
    return new NextResponse(
      "Payment record not found.",
      { status: 404 }
    );
  }

  /*
   * --------------------------------------------------------------------------
   * STEP 3
   * PREVENT DUPLICATE CONFIRMATION
   * --------------------------------------------------------------------------
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
   * --------------------------------------------------------------------------
   * STEP 4
   * READ PAYMENT DETAILS FROM FORM
   * --------------------------------------------------------------------------
   *
   * These values come from the payment form.
   *
   * If a field is not submitted, we preserve the existing
   * value already stored in the payment record.
   */

  const amountValue = formData.get("amount");

  const currencyValue = formData.get("currency");

  const paymentDateValue =
    formData.get("payment_date");

  const paymentMethodValue =
    formData.get("payment_method");

  const referenceValue =
    formData.get("reference");

  const notesValue =
    formData.get("notes");

  /*
   * --------------------------------------------------------------------------
   * AMOUNT
   * --------------------------------------------------------------------------
   */

  let amount = payment.amount;

  if (
    amountValue !== null &&
    String(amountValue).trim() !== ""
  ) {
    const parsedAmount = Number(
      String(amountValue).trim()
    );

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount < 0
    ) {
      return new NextResponse(
        "Invalid payment amount.",
        { status: 400 }
      );
    }

    amount = parsedAmount;
  }

  /*
   * --------------------------------------------------------------------------
   * CURRENCY
   * --------------------------------------------------------------------------
   */

  const currency =
    currencyValue !== null &&
    String(currencyValue).trim() !== ""
      ? String(currencyValue)
          .trim()
          .toUpperCase()
      : payment.currency || "KRW";

  /*
   * --------------------------------------------------------------------------
   * PAYMENT DATE
   * --------------------------------------------------------------------------
   *
   * If the form does not provide a date, use today.
   */

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const paymentDate =
    paymentDateValue !== null &&
    String(paymentDateValue).trim() !== ""
      ? String(paymentDateValue).trim()
      : payment.payment_date || today;

  /*
   * --------------------------------------------------------------------------
   * PAYMENT METHOD
   * --------------------------------------------------------------------------
   */

  const paymentMethod =
    paymentMethodValue !== null &&
    String(paymentMethodValue).trim() !== ""
      ? String(paymentMethodValue).trim()
      : payment.payment_method || null;

  /*
   * --------------------------------------------------------------------------
   * REFERENCE
   * --------------------------------------------------------------------------
   */

  const reference =
    referenceValue !== null
      ? String(referenceValue).trim() || null
      : payment.reference || null;

  /*
   * --------------------------------------------------------------------------
   * NOTES
   * --------------------------------------------------------------------------
   */

  const notes =
    notesValue !== null
      ? String(notesValue).trim() || null
      : payment.notes || null;

  /*
   * --------------------------------------------------------------------------
   * STEP 5
   * UPDATE PAYMENT
   * --------------------------------------------------------------------------
   *
   * Setting status to "paid" is what activates the enrollment.
   *
   * The database trigger:
   *
   * payment_paid_activation
   *
   * should continue to handle:
   *
   * - enrollment activation
   * - contract activation
   * - lesson generation
   */

  const {
    error: paymentUpdateError,
  } = await supabase
    .from("payments")
    .update({
      amount,
      currency,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference,
      notes,
      status: "paid",
    })
    .eq("id", payment.id);

  /*
   * --------------------------------------------------------------------------
   * STEP 6
   * HANDLE UPDATE ERROR
   * --------------------------------------------------------------------------
   */

  if (paymentUpdateError) {
    console.error(
      "PAYMENT UPDATE ERROR:",
      {
        code: paymentUpdateError.code,
        message: paymentUpdateError.message,
        details: paymentUpdateError.details,
        hint: paymentUpdateError.hint,
      }
    );

    return new NextResponse(
      `Unable to confirm payment.

Code: ${
        paymentUpdateError.code ||
        "unknown"
      }

Message: ${
        paymentUpdateError.message ||
        "unknown"
      }

Details: ${
        paymentUpdateError.details ||
        "none"
      }

Hint: ${
        paymentUpdateError.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  /*
   * --------------------------------------------------------------------------
   * STEP 7
   * RETURN TO STUDENT RECORD
   * --------------------------------------------------------------------------
   */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}