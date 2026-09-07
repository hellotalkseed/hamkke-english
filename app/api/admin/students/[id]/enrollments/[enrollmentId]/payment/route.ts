import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
  }>;
}

interface EnrollmentParticipant {
  student_id: string;
}

const SUPPORTED_CURRENCIES = [
  "KRW",
  "CNY",
  "USD",
  "PHP",
] as const;

type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function getFormValue(
  formData: FormData,
  ...names: string[]
): string | null {
  for (const name of names) {
    const value = formData.get(name);

    if (value === null) {
      continue;
    }

    const text = String(value).trim();

    if (text !== "") {
      return text;
    }
  }

  return null;
}

function parseNumber(
  value: string | null
): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  const cleaned = value
    .replace(/,/g, "")
    .replace(/[₩₱$¥]/g, "")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function normalizeCurrency(
  value: unknown
): SupportedCurrency | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized =
    String(value)
      .trim()
      .toUpperCase();

  if (
    SUPPORTED_CURRENCIES.includes(
      normalized as SupportedCurrency
    )
  ) {
    return normalized as SupportedCurrency;
  }

  return null;
}

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id, enrollmentId } = await params;

  const supabase = await createClient();
  const formData = await request.formData();

  const locale =
    getFormValue(formData, "locale") || "en";

  /* ======================================================================== */
  /* STEP 1: VERIFY ENROLLMENT                                                */
  /* ======================================================================== */

  /*
   * Individual enrollment:
   *
   *   enrollments.student_id = originating student
   *
   * Shared enrollment:
   *
   *   enrollments.student_id = NULL
   *
   * We therefore find the enrollment by ID first,
   * then verify whether the selected student may
   * manage it.
   */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        status,
        tuition_amount,
        currency
      `
    )
    .eq("id", enrollmentId)
    .single();

  if (enrollmentError || !enrollment) {
    console.error(
      "ENROLLMENT LOOKUP ERROR:",
      {
        enrollmentId,
        studentId: id,
        code: enrollmentError?.code,
        message: enrollmentError?.message,
        details: enrollmentError?.details,
        hint: enrollmentError?.hint,
      }
    );

    return new NextResponse(
      "Enrollment not found.",
      { status: 404 }
    );
  }

  const enrollmentCurrency =
    normalizeCurrency(
      enrollment.currency
    );

  if (!enrollmentCurrency) {
    return new NextResponse(
      "The enrollment has an unsupported tuition currency.",
      { status: 400 }
    );
  }

  /* ======================================================================== */
  /* STEP 2: DETERMINE ENROLLMENT TYPE                                        */
  /* ======================================================================== */

  const isIndividual =
    enrollment.student_id !== null;

  const isShared =
    enrollment.student_id === null;

  /* ======================================================================== */
  /* STEP 3: VERIFY STUDENT ACCESS                                            */
  /* ======================================================================== */

  if (isIndividual) {
    if (enrollment.student_id !== id) {
      console.error(
        "INDIVIDUAL ENROLLMENT OWNERSHIP MISMATCH:",
        {
          enrollmentId,
          enrollmentStudentId:
            enrollment.student_id,
          requestedStudentId: id,
        }
      );

      return new NextResponse(
        "This enrollment does not belong to the selected student.",
        { status: 403 }
      );
    }
  }

  if (isShared) {
    const {
      data: participant,
      error: participantError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          student_id
        `
      )
      .eq("enrollment_id", enrollmentId)
      .eq("student_id", id)
      .maybeSingle();

    if (participantError) {
      console.error(
        "SHARED ENROLLMENT PARTICIPANT LOOKUP ERROR:",
        {
          enrollmentId,
          studentId: id,
          code: participantError.code,
          message: participantError.message,
          details: participantError.details,
          hint: participantError.hint,
        }
      );

      return new NextResponse(
        "Unable to verify shared enrollment participation.",
        { status: 500 }
      );
    }

    if (!participant) {
      console.error(
        "SHARED ENROLLMENT PARTICIPATION DENIED:",
        {
          enrollmentId,
          studentId: id,
        }
      );

      return new NextResponse(
        "The selected student is not part of this shared enrollment.",
        { status: 403 }
      );
    }
  }

  /* ======================================================================== */
  /* STEP 4: VERIFY SHARED ENROLLMENT PARTICIPANTS                            */
  /* ======================================================================== */

  if (isShared) {
    const {
      data: participants,
      error: participantsError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          student_id
        `
      )
      .eq("enrollment_id", enrollmentId);

    if (participantsError) {
      console.error(
        "SHARED PARTICIPANTS LOOKUP ERROR:",
        {
          enrollmentId,
          code: participantsError.code,
          message: participantsError.message,
          details: participantsError.details,
          hint: participantsError.hint,
        }
      );

      return new NextResponse(
        "Unable to verify shared enrollment participants.",
        { status: 500 }
      );
    }

    if (
      !participants ||
      participants.length < 2
    ) {
      console.error(
        "INVALID SHARED ENROLLMENT:",
        {
          enrollmentId,
          participants,
        }
      );

      return new NextResponse(
        "This shared enrollment does not have enough participating students.",
        { status: 400 }
      );
    }
  }

  /* ======================================================================== */
  /* STEP 5: FIND PAYMENT FOR THIS ENROLLMENT                                 */
  /* ======================================================================== */

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
        enrollmentId,
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

  /* ======================================================================== */
  /* STEP 6: VERIFY PAYMENT OWNERSHIP                                         */
  /* ======================================================================== */

  if (
    payment.enrollment_id !==
    enrollmentId
  ) {
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

  /* ======================================================================== */
  /* STEP 7: PREVENT DUPLICATE CONFIRMATION                                   */
  /* ======================================================================== */

  if (payment.status === "paid") {
    return NextResponse.redirect(
      new URL(
        `/${locale}/admin/students/${id}`,
        request.url
      )
    );
  }

  /* ======================================================================== */
  /* STEP 8: READ FORM VALUES                                                 */
  /* ======================================================================== */

  const amountValue =
    getFormValue(
      formData,
      "amount",
      "tuition_amount"
    );

  /*
   * Legacy KRW-specific aliases remain accepted
   * so older forms can still confirm older payments.
   */
  const tuitionAmountKrwValue =
    getFormValue(
      formData,
      "tuition_amount_krw"
    );

  const amountKrwValue =
    getFormValue(
      formData,
      "amount_krw"
    );

  const amountPhpValue =
    getFormValue(
      formData,
      "amount_php"
    );

  const tuitionAmountPhpValue =
    getFormValue(
      formData,
      "tuition_amount_php"
    );

  const currencyValue =
    getFormValue(
      formData,
      "currency"
    );

  const paymentDateValue =
    getFormValue(
      formData,
      "payment_date"
    );

  const paymentMethodValue =
    getFormValue(
      formData,
      "payment_method"
    );

  const referenceValue =
    getFormValue(
      formData,
      "reference",
      "payment_reference"
    );

  const notesValue =
    getFormValue(
      formData,
      "notes"
    );

  /* ======================================================================== */
  /* STEP 9: DETERMINE PAYMENT CURRENCY                                       */
  /* ======================================================================== */

  /*
   * The enrollment is the authority for the agreed
   * tuition currency.
   *
   * A submitted currency is accepted only when it
   * matches the enrollment currency.
   */

  const submittedCurrency =
    currencyValue
      ? normalizeCurrency(
          currencyValue
        )
      : null;

  if (
    currencyValue &&
    !submittedCurrency
  ) {
    return new NextResponse(
      "Invalid payment currency.",
      { status: 400 }
    );
  }

  if (
    submittedCurrency &&
    submittedCurrency !==
      enrollmentCurrency
  ) {
    return new NextResponse(
      "The payment currency does not match the enrollment currency.",
      { status: 400 }
    );
  }

  const currency =
    enrollmentCurrency;

  /* ======================================================================== */
  /* STEP 10: DETERMINE ORIGINAL PAYMENT AMOUNT                              */
  /* ======================================================================== */

  /*
   * payments.amount is the agreed / original amount
   * in payments.currency.
   *
   * Priority:
   *
   * 1. submitted amount / tuition_amount
   * 2. legacy KRW aliases when currency is KRW
   * 3. existing payment.amount
   * 4. enrollment.tuition_amount
   */

  let amount =
    payment.amount !== null
      ? Number(payment.amount)
      : enrollment.tuition_amount !== null
        ? Number(
            enrollment.tuition_amount
          )
        : null;

  let submittedAmountValue =
    amountValue;

  if (
    submittedAmountValue === null &&
    currency === "KRW"
  ) {
    submittedAmountValue =
      tuitionAmountKrwValue ??
      amountKrwValue;
  }

  if (
    submittedAmountValue !== null
  ) {
    const parsedAmount =
      parseNumber(
        submittedAmountValue
      );

    if (
      parsedAmount === null ||
      parsedAmount <= 0
    ) {
      return new NextResponse(
        `Invalid ${currency} payment amount.`,
        { status: 400 }
      );
    }

    amount =
      parsedAmount;
  }

  if (
    amount === null ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return new NextResponse(
      `Invalid ${currency} payment amount.`,
      { status: 400 }
    );
  }

  /* ======================================================================== */
  /* STEP 11: DETERMINE PHP AMOUNT                                            */
  /* ======================================================================== */

  /*
   * amount_php is always Hamkke's actual PHP receipt.
   *
   * Priority:
   *
   * 1. tuition_amount_php
   * 2. amount_php
   * 3. existing amount_php
   */

  let amountPhp =
    payment.amount_php !== null
      ? Number(payment.amount_php)
      : null;

  const submittedPhpValue =
    tuitionAmountPhpValue ??
    amountPhpValue;

  if (
    submittedPhpValue !== null
  ) {
    const parsedAmountPhp =
      parseNumber(
        submittedPhpValue
      );

    if (
      parsedAmountPhp === null ||
      parsedAmountPhp <= 0
    ) {
      return new NextResponse(
        "Invalid PHP payment amount.",
        { status: 400 }
      );
    }

    amountPhp =
      parsedAmountPhp;
  }

  if (
    amountPhp === null ||
    !Number.isFinite(amountPhp) ||
    amountPhp <= 0
  ) {
    return new NextResponse(
      "Actual PHP amount received is required before confirming payment.",
      { status: 400 }
    );
  }

  /* ======================================================================== */
  /* STEP 12: LEGACY KRW COMPATIBILITY AMOUNT                                */
  /* ======================================================================== */

  /*
   * amount_krw is now a compatibility field only.
   *
   * KRW payment:
   *     amount_krw = amount
   *
   * CNY / USD / PHP payment:
   *     amount_krw = null
   */

  const amountKrw =
    currency === "KRW"
      ? amount
      : null;

  /* ======================================================================== */
  /* STEP 13: PAYMENT DATE                                                    */
  /* ======================================================================== */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const paymentDate =
    paymentDateValue &&
    paymentDateValue.trim() !== ""
      ? paymentDateValue.trim()
      : payment.payment_date ||
        today;

  /* ======================================================================== */
  /* STEP 14: PAYMENT METHOD                                                  */
  /* ======================================================================== */

  /*
   * "pending" is a payment status, not a payment method.
   *
   * If the submitted payment method is "pending", preserve
   * the existing payment method instead.
   */

  let paymentMethod =
    payment.payment_method ||
    null;

  if (
    paymentMethodValue &&
    paymentMethodValue.trim() !== ""
  ) {
    const submittedPaymentMethod =
      paymentMethodValue.trim();

    if (
      submittedPaymentMethod
        .toLowerCase() !==
      "pending"
    ) {
      paymentMethod =
        submittedPaymentMethod;
    }
  }

  /* ======================================================================== */
  /* STEP 15: REFERENCE                                                       */
  /* ======================================================================== */

  const reference =
    referenceValue !== null
      ? referenceValue.trim() || null
      : payment.reference ||
        null;

  /* ======================================================================== */
  /* STEP 16: NOTES                                                           */
  /* ======================================================================== */

  const notes =
    notesValue !== null
      ? notesValue.trim() || null
      : payment.notes ||
        null;

  /* ======================================================================== */
  /* STEP 17: CONFIRM PAYMENT                                                 */
  /* ======================================================================== */

  /*
   * This route changes this payment to paid.
   *
   * The database trigger handles:
   *
   * - enrollment activation
   * - contract activation
   * - lesson generation
   *
   * Only the selected enrollment is affected.
   */

  const {
    error: paymentUpdateError,
  } = await supabase
    .from("payments")
    .update({
      amount,
      currency,
      amount_krw:
        amountKrw,
      amount_php:
        amountPhp,
      payment_date:
        paymentDate,
      payment_method:
        paymentMethod,
      reference,
      notes,
      status:
        "paid",
    })
    .eq(
      "id",
      payment.id
    )
    .eq(
      "enrollment_id",
      enrollmentId
    );

  /* ======================================================================== */
  /* STEP 18: HANDLE PAYMENT UPDATE ERROR                                     */
  /* ======================================================================== */

  if (paymentUpdateError) {
    console.error(
      "PAYMENT UPDATE ERROR:",
      {
        enrollmentId,
        paymentId:
          payment.id,
        code:
          paymentUpdateError.code,
        message:
          paymentUpdateError.message,
        details:
          paymentUpdateError.details,
        hint:
          paymentUpdateError.hint,
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

  /* ======================================================================== */
  /* STEP 19: VERIFY PAYMENT                                                  */
  /* ======================================================================== */

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
    .eq(
      "id",
      payment.id
    )
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .single();

  if (
    updatedPaymentError ||
    !updatedPayment
  ) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
      {
        enrollmentId,
        paymentId:
          payment.id,
        error:
          updatedPaymentError,
      }
    );

    return new NextResponse(
      "Payment was updated, but the payment record could not be verified.",
      { status: 500 }
    );
  }

  if (
    updatedPayment.status !==
    "paid"
  ) {
    console.error(
      "PAYMENT STATUS VERIFICATION FAILED:",
      {
        enrollmentId,
        paymentId:
          payment.id,
        status:
          updatedPayment.status,
      }
    );

    return new NextResponse(
      "Payment confirmation could not be verified.",
      { status: 500 }
    );
  }

  if (
    Number(updatedPayment.amount) !==
    amount
  ) {
    return new NextResponse(
      "Payment was confirmed, but the original payment amount could not be verified.",
      { status: 500 }
    );
  }

  if (
    updatedPayment.currency !==
    currency
  ) {
    return new NextResponse(
      "Payment was confirmed, but the payment currency could not be verified.",
      { status: 500 }
    );
  }

  if (
    currency === "KRW" &&
    Number(
      updatedPayment.amount_krw
    ) !== amount
  ) {
    return new NextResponse(
      "Payment was confirmed, but the KRW compatibility amount could not be verified.",
      { status: 500 }
    );
  }

  if (
    currency !== "KRW" &&
    updatedPayment.amount_krw !==
      null
  ) {
    return new NextResponse(
      "Payment was confirmed, but a non-KRW payment contains an invalid KRW amount.",
      { status: 500 }
    );
  }

  if (
    Number(
      updatedPayment.amount_php
    ) !== amountPhp
  ) {
    return new NextResponse(
      "Payment was confirmed, but the PHP amount received could not be verified.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 20: VERIFY ENROLLMENT ACTIVATION                                    */
  /* ======================================================================== */

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
    .eq(
      "id",
      enrollmentId
    )
    .single();

  if (
    updatedEnrollmentError ||
    !updatedEnrollment
  ) {
    console.error(
      "ENROLLMENT ACTIVATION VERIFICATION ERROR:",
      {
        enrollmentId,
        error:
          updatedEnrollmentError,
      }
    );

    return new NextResponse(
      "Payment was confirmed, but the enrollment could not be verified.",
      { status: 500 }
    );
  }

  if (
    updatedEnrollment.status !==
    "active"
  ) {
    console.error(
      "ENROLLMENT ACTIVATION FAILED:",
      {
        enrollmentId,
        enrollmentType:
          isShared
            ? "shared"
            : "individual",
        status:
          updatedEnrollment.status,
      }
    );

    return new NextResponse(
      "Payment was confirmed, but the enrollment was not activated.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 21: VERIFY CONTRACT ACTIVATION                                      */
  /* ======================================================================== */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .select(
      `
        id,
        enrollment_id,
        status
      `
    )
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (contractError) {
    console.error(
      "CONTRACT VERIFICATION ERROR:",
      {
        enrollmentId,
        code:
          contractError.code,
        message:
          contractError.message,
        details:
          contractError.details,
        hint:
          contractError.hint,
      }
    );

    return new NextResponse(
      "Payment was confirmed and enrollment was activated, but the contract could not be verified.",
      { status: 500 }
    );
  }

  if (!contract) {
    console.error(
      "CONTRACT NOT FOUND AFTER ACTIVATION:",
      {
        enrollmentId,
      }
    );

    return new NextResponse(
      "Payment was confirmed and enrollment was activated, but its contract could not be found.",
      { status: 500 }
    );
  }

  if (
    contract.enrollment_id !==
    enrollmentId
  ) {
    console.error(
      "CONTRACT ENROLLMENT MISMATCH:",
      {
        contractId:
          contract.id,
        contractEnrollmentId:
          contract.enrollment_id,
        enrollmentId,
      }
    );

    return new NextResponse(
      "The activated contract does not belong to this enrollment.",
      { status: 500 }
    );
  }

  if (
    contract.status !==
    "active"
  ) {
    console.error(
      "CONTRACT ACTIVATION FAILED:",
      {
        enrollmentId,
        contractId:
          contract.id,
        status:
          contract.status,
      }
    );

    return new NextResponse(
      "Payment was confirmed and enrollment was activated, but the contract was not activated.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 22: VERIFY LESSON GENERATION                                        */
  /* ======================================================================== */

  const {
    count: lessonCount,
    error: lessonsError,
  } = await supabase
    .from("lessons")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "enrollment_id",
      enrollmentId
    );

  if (lessonsError) {
    console.error(
      "LESSON VERIFICATION ERROR:",
      {
        enrollmentId,
        code:
          lessonsError.code,
        message:
          lessonsError.message,
        details:
          lessonsError.details,
        hint:
          lessonsError.hint,
      }
    );

    return new NextResponse(
      "Payment was confirmed and enrollment was activated, but lessons could not be verified.",
      { status: 500 }
    );
  }

  if (
    lessonCount === null ||
    lessonCount < 1
  ) {
    console.error(
      "LESSONS WERE NOT GENERATED:",
      {
        enrollmentId,
        lessonCount,
      }
    );

    return new NextResponse(
      "Payment was confirmed and enrollment was activated, but no lessons were generated.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 23: FINAL LOG                                                       */
  /* ======================================================================== */

  console.log(
    "PAYMENT CONFIRMED AND ENROLLMENT ACTIVATED:",
    {
      enrollmentId,

      enrollmentType:
        isShared
          ? "shared"
          : "individual",

      originatingStudentId:
        id,

      enrollmentStudentId:
        updatedEnrollment.student_id,

      paymentId:
        updatedPayment.id,

      paymentStatus:
        updatedPayment.status,

      paymentCurrency:
        updatedPayment.currency,

      originalPaymentAmount:
        updatedPayment.amount,

      actualPhpReceived:
        updatedPayment.amount_php,

      contractId:
        contract.id,

      contractStatus:
        contract.status,

      lessonCount,
    }
  );

  /* ======================================================================== */
  /* STEP 24: RETURN TO STUDENT RECORD                                        */
  /* ======================================================================== */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}
