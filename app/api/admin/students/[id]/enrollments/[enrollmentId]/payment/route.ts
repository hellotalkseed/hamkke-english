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
   * Make sure this enrollment belongs to this student.
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
   * FIND THE PAYMENT FOR THIS ENROLLMENT
   * --------------------------------------------------------------------------
   *
   * The renewal form already creates the payment record.
   *
   * This route does NOT create a new payment.
   * It only confirms the existing one.
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
   * READ OPTIONAL PAYMENT DETAILS
   * --------------------------------------------------------------------------
   *
   * Normally the renewal form has already stored these values.
   *
   * If they are not submitted here, preserve the existing values.
   */

  const amountValue =
    formData.get("amount");

  const currencyValue =
    formData.get("currency");

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
   *
   * "pending" is a payment STATUS.
   * It should never be stored as a payment method.
   */

  let paymentMethod =
    payment.payment_method || null;

  if (
    paymentMethodValue !== null &&
    String(paymentMethodValue).trim() !== ""
  ) {
    const submittedPaymentMethod =
      String(paymentMethodValue).trim();

    if (
      submittedPaymentMethod.toLowerCase() !==
      "pending"
    ) {
      paymentMethod =
        submittedPaymentMethod;
    }
  }

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
   * CONFIRM PAYMENT
   * --------------------------------------------------------------------------
   *
   * The important change is:
   *
   * status: "paid"
   *
   * Your existing database trigger should then handle:
   *
   * - activating the enrollment
   * - activating the contract
   * - generating lessons
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