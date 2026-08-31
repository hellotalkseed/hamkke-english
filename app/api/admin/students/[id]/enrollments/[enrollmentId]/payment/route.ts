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
  ).trim();

  /* -------------------------------------------------------------------------- */
  /* STEP 1: VERIFY ENROLLMENT                                                  */
  /* -------------------------------------------------------------------------- */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        status
      `
    )
    .eq("id", enrollmentId)
    .eq("student_id", id)
    .single();

  if (enrollmentError || !enrollment) {
    return new NextResponse(
      "Enrollment not found.",
      { status: 404 }
    );
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 2: FIND PAYMENT FOR THIS ENROLLMENT                                   */
  /* -------------------------------------------------------------------------- */

  /*
   * Every enrollment has its own payment record.
   *
   * We ONLY search by enrollment_id.
   *
   * This prevents one enrollment from accidentally confirming
   * another enrollment's payment.
   */

  const {
    data: payment,
    error: paymentLookupError,
  } = await supabase
    .from("payments")
    .select(
      `
        id,
        enrollment_id,
        amount,
        currency,
        amount_krw,
        amount_php,
        payment_date,
        payment_method,
        reference,
        notes,
        status
      `
    )
    .eq("enrollment_id", enrollmentId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (paymentLookupError) {
    console.error(
      "PAYMENT LOOKUP ERROR:",
      {
        code: paymentLookupError.code,
        message: paymentLookupError.message,
        details: paymentLookupError.details,
        hint: paymentLookupError.hint,
      }
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

  /* -------------------------------------------------------------------------- */
  /* STEP 3: VERIFY PAYMENT OWNERSHIP                                           */
  /* -------------------------------------------------------------------------- */

  if (payment.enrollment_id !== enrollmentId) {
    console.error(
      "PAYMENT ENROLLMENT MISMATCH:",
      {
        paymentId: payment.id,
        paymentEnrollmentId:
          payment.enrollment_id,
        requestedEnrollmentId:
          enrollmentId,
      }
    );

    return new NextResponse(
      "This payment does not belong to the selected enrollment.",
      { status: 400 }
    );
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 4: PREVENT DUPLICATE CONFIRMATION                                     */
  /* -------------------------------------------------------------------------- */

  if (payment.status === "paid") {
    return NextResponse.redirect(
      new URL(
        `/${locale}/admin/students/${id}`,
        request.url
      )
    );
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 5: READ FORM VALUES                                                   */
  /* -------------------------------------------------------------------------- */

  /*
   * The confirmation form may use either the original payment field names
   * or the newer renewal field names.
   *
   * We support both so the workflow remains compatible.
   */

  const amountValue =
    formData.get("amount");

  const tuitionAmountKrwValue =
    formData.get("tuition_amount_krw");

  const amountKrwValue =
    formData.get("amount_krw");

  const amountPhpValue =
    formData.get("amount_php");

  const tuitionAmountPhpValue =
    formData.get("tuition_amount_php");

  const currencyValue =
    formData.get("currency");

  const paymentDateValue =
    formData.get("payment_date");

  const paymentMethodValue =
    formData.get("payment_method");

  /*
   * Support both:
   *
   * reference
   * payment_reference
   *
   * The database column remains:
   *
   * reference
   */
  const referenceValue =
    formData.get("reference") ??
    formData.get("payment_reference");

  const notesValue =
    formData.get("notes");

  /* -------------------------------------------------------------------------- */
  /* STEP 6: KRW AMOUNT                                                        */
  /* -------------------------------------------------------------------------- */

  /*
   * KRW is the primary amount for the enrollment.
   *
   * Priority:
   *
   * 1. amount
   * 2. tuition_amount_krw
   * 3. amount_krw
   * 4. existing payment amount_krw
   * 5. existing payment amount
   */

  let amountKrw =
    payment.amount_krw !== null
      ? Number(payment.amount_krw)
      : payment.amount !== null
        ? Number(payment.amount)
        : 0;

  const submittedKrwValue =
    amountValue ??
    tuitionAmountKrwValue ??
    amountKrwValue;

  if (
    submittedKrwValue !== null &&
    String(submittedKrwValue).trim() !== ""
  ) {
    const parsedAmountKrw = Number(
      String(submittedKrwValue).trim()
    );

    if (
      !Number.isFinite(parsedAmountKrw) ||
      parsedAmountKrw < 0
    ) {
      return new NextResponse(
        "Invalid KRW payment amount.",
        { status: 400 }
      );
    }

    amountKrw = parsedAmountKrw;
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 7: PHP AMOUNT                                                        */
  /* -------------------------------------------------------------------------- */

  /*
   * PHP is stored independently from the primary KRW amount.
   *
   * Priority:
   *
   * 1. tuition_amount_php
   * 2. amount_php
   * 3. existing payment amount_php
   *
   * We NEVER replace an existing PHP value with null
   * simply because the confirmation form did not submit it.
   */

  let amountPhp =
    payment.amount_php !== null
      ? Number(payment.amount_php)
      : null;

  const submittedPhpValue =
    tuitionAmountPhpValue ??
    amountPhpValue;

  if (
    submittedPhpValue !== null &&
    String(submittedPhpValue).trim() !== ""
  ) {
    const parsedAmountPhp = Number(
      String(submittedPhpValue).trim()
    );

    if (
      !Number.isFinite(parsedAmountPhp) ||
      parsedAmountPhp < 0
    ) {
      return new NextResponse(
        "Invalid PHP payment amount.",
        { status: 400 }
      );
    }

    amountPhp = parsedAmountPhp;
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 8: PRIMARY PAYMENT AMOUNT                                             */
  /* -------------------------------------------------------------------------- */

  /*
   * The payments.amount column represents the primary KRW amount.
   */
  const amount = amountKrw;

  /* -------------------------------------------------------------------------- */
  /* STEP 9: CURRENCY                                                           */
  /* -------------------------------------------------------------------------- */

  const currency =
    currencyValue !== null &&
    String(currencyValue).trim() !== ""
      ? String(currencyValue)
          .trim()
          .toUpperCase()
      : payment.currency || "KRW";

  /* -------------------------------------------------------------------------- */
  /* STEP 10: PAYMENT DATE                                                      */
  /* -------------------------------------------------------------------------- */

  /*
   * If a payment date is supplied during confirmation,
   * use it.
   *
   * Otherwise preserve the existing date.
   *
   * If neither exists, use today's date because payment is
   * being confirmed now.
   */

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const paymentDate =
    paymentDateValue !== null &&
    String(paymentDateValue).trim() !== ""
      ? String(paymentDateValue).trim()
      : payment.payment_date || today;

  /* -------------------------------------------------------------------------- */
  /* STEP 11: PAYMENT METHOD                                                    */
  /* -------------------------------------------------------------------------- */

  /*
   * "pending" is a status, not a payment method.
   *
   * If the confirmation form supplies a real payment method,
   * use it.
   *
   * Otherwise preserve the existing method.
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

  /* -------------------------------------------------------------------------- */
  /* STEP 12: REFERENCE                                                        */
  /* -------------------------------------------------------------------------- */

  /*
   * The form may submit:
   *
   * payment_reference
   *
   * or:
   *
   * reference
   *
   * Both are saved to:
   *
   * payments.reference
   */

  const reference =
    referenceValue !== null
      ? String(referenceValue).trim() || null
      : payment.reference || null;

  /* -------------------------------------------------------------------------- */
  /* STEP 13: NOTES                                                            */
  /* -------------------------------------------------------------------------- */

  const notes =
    notesValue !== null
      ? String(notesValue).trim() || null
      : payment.notes || null;

  /* -------------------------------------------------------------------------- */
  /* STEP 14: CONFIRM PAYMENT                                                   */
  /* -------------------------------------------------------------------------- */

  /*
   * IMPORTANT:
   *
   * This route does NOT:
   *
   * - activate the enrollment
   * - activate the contract
   * - generate lessons
   *
   * It ONLY changes the payment:
   *
   *     pending → paid
   *
   * The existing database trigger:
   *
   *     payment_paid_activation
   *
   * should then call:
   *
   *     handle_payment_paid()
   *
   * and handle:
   *
   * 1. THIS enrollment
   * 2. THIS enrollment's contract
   * 3. THIS enrollment's lessons
   *
   * This keeps activation centralized in the database.
   */

  const {
    error: paymentUpdateError,
  } = await supabase
    .from("payments")
    .update({
      /*
       * Primary KRW amount.
       */
      amount,

      /*
       * Primary currency.
       */
      currency,

      /*
       * Explicit KRW amount.
       */
      amount_krw: amountKrw,

      /*
       * Explicit PHP equivalent.
       */
      amount_php: amountPhp,

      /*
       * Actual payment date.
       */
      payment_date: paymentDate,

      /*
       * Actual payment method.
       */
      payment_method: paymentMethod,

      /*
       * Payment reference.
       */
      reference,

      /*
       * Optional notes.
       */
      notes,

      /*
       * This is the ONLY activation event.
       */
      status: "paid",
    })
    .eq("id", payment.id)
    .eq("enrollment_id", enrollmentId);

  /* -------------------------------------------------------------------------- */
  /* STEP 15: HANDLE UPDATE ERROR                                               */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* STEP 16: VERIFY PAYMENT                                                    */
  /* -------------------------------------------------------------------------- */

  /*
   * Verify that the payment itself was actually changed to paid.
   */

  const {
    data: updatedPayment,
    error: updatedPaymentError,
  } = await supabase
    .from("payments")
    .select(
      `
        id,
        enrollment_id,
        status,
        amount,
        currency,
        amount_krw,
        amount_php,
        payment_date,
        payment_method,
        reference,
        notes
      `
    )
    .eq("id", payment.id)
    .eq("enrollment_id", enrollmentId)
    .single();

  if (
    updatedPaymentError ||
    !updatedPayment
  ) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
      updatedPaymentError
    );

    return new NextResponse(
      "Payment was updated, but the payment record could not be verified.",
      { status: 500 }
    );
  }

  if (updatedPayment.status !== "paid") {
    console.error(
      "PAYMENT STATUS VERIFICATION FAILED:",
      {
        paymentId: payment.id,
        status:
          updatedPayment.status,
      }
    );

    return new NextResponse(
      "Payment confirmation could not be verified.",
      { status: 500 }
    );
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 17: VERIFY ENROLLMENT ACTIVATION                                      */
  /* -------------------------------------------------------------------------- */

  /*
   * The database trigger should now have activated THIS enrollment.
   *
   * We verify it.
   *
   * We do not manually activate it.
   */

  const {
    data: updatedEnrollment,
    error: updatedEnrollmentError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        status
      `
    )
    .eq("id", enrollmentId)
    .eq("student_id", id)
    .single();

  if (updatedEnrollmentError) {
    console.error(
      "ENROLLMENT VERIFICATION ERROR:",
      updatedEnrollmentError
    );

    return new NextResponse(
      "Payment was confirmed, but the enrollment could not be verified.",
      { status: 500 }
    );
  }

  if (
    !updatedEnrollment ||
    updatedEnrollment.status !== "active"
  ) {
    console.error(
      "ENROLLMENT ACTIVATION FAILED:",
      {
        enrollmentId,
        status:
          updatedEnrollment?.status,
      }
    );

    return new NextResponse(
      "Payment was confirmed, but the enrollment was not activated.",
      { status: 500 }
    );
  }

  /* -------------------------------------------------------------------------- */
  /* STEP 18: RETURN TO STUDENT RECORD                                          */
  /* -------------------------------------------------------------------------- */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}