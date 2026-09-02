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
    .replace(/[₩₱$]/g, "")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
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
   * IMPORTANT:
   *
   * Individual enrollment:
   *
   *   enrollments.student_id = originating student
   *
   * Shared enrollment:
   *
   *   enrollments.student_id = NULL
   *
   * Therefore we cannot simply use:
   *
   *   .eq("student_id", id)
   *
   * because that would reject shared enrollments.
   *
   * We first find the enrollment by ID, then determine whether
   * the originating student is allowed to manage it.
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
        status
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
    /*
     * Individual enrollment:
     *
     * The enrollment must belong directly to the
     * student whose record is being managed.
     */

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
    /*
     * Shared enrollment:
     *
     * The enrollment itself has no student_id.
     *
     * Therefore we verify that the student whose record
     * was opened is one of the participating students.
     */

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

  /*
   * For a shared enrollment, confirm that participant records actually exist.
   *
   * This is not strictly required for payment confirmation, but it protects
   * the enrollment structure and gives us a clear audit trail if something
   * is malformed.
   */

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

  /*
   * Every enrollment has its own payment record.
   *
   * IMPORTANT:
   *
   * We search ONLY by enrollment_id.
   *
   * This means:
   *
   * Enrollment A → Payment A
   * Enrollment B → Payment B
   *
   * A payment from another enrollment can never be confirmed
   * through this route.
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
      "amount"
    );

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
  /* STEP 9: DETERMINE KRW AMOUNT                                             */
  /* ======================================================================== */

  /*
   * Priority:
   *
   * 1. amount
   * 2. tuition_amount_krw
   * 3. amount_krw
   * 4. existing amount_krw
   * 5. existing amount
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
    submittedKrwValue.trim() !== ""
  ) {
    const parsedAmountKrw =
      parseNumber(
        submittedKrwValue
      );

    if (
      parsedAmountKrw === null ||
      parsedAmountKrw < 0
    ) {
      return new NextResponse(
        "Invalid KRW payment amount.",
        { status: 400 }
      );
    }

    amountKrw =
      parsedAmountKrw;
  }

  if (
    !Number.isFinite(amountKrw) ||
    amountKrw < 0
  ) {
    return new NextResponse(
      "Invalid KRW payment amount.",
      { status: 400 }
    );
  }

  /* ======================================================================== */
  /* STEP 10: DETERMINE PHP AMOUNT                                            */
  /* ======================================================================== */

  /*
   * PHP is stored independently from the primary KRW amount.
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
    submittedPhpValue !== null &&
    submittedPhpValue.trim() !== ""
  ) {
    const parsedAmountPhp =
      parseNumber(
        submittedPhpValue
      );

    if (
      parsedAmountPhp === null ||
      parsedAmountPhp < 0
    ) {
      return new NextResponse(
        "Invalid PHP payment amount.",
        { status: 400 }
      );
    }

    amountPhp =
      parsedAmountPhp;
  }

  /* ======================================================================== */
  /* STEP 11: PRIMARY PAYMENT AMOUNT                                         */
  /* ======================================================================== */

  /*
   * payments.amount represents the primary KRW amount.
   */

  const amount =
    amountKrw;

  /* ======================================================================== */
  /* STEP 12: CURRENCY                                                        */
  /* ======================================================================== */

  const currency =
    currencyValue &&
    currencyValue.trim() !== ""
      ? currencyValue
          .trim()
          .toUpperCase()
      : payment.currency ||
        "KRW";

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
   * If the submitted payment method is "pending", we preserve
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
  /* STEP 17: CONFIRM PAYMENT                                                */
  /* ======================================================================== */

  /*
   * IMPORTANT:
   *
   * This route ONLY changes:
   *
   *     payment.status
   *
   * from:
   *
   *     pending
   *
   * to:
   *
   *     paid
   *
   * It does NOT manually:
   *
   * - activate the enrollment
   * - activate the contract
   * - generate lessons
   * - modify another enrollment
   *
   * The database trigger:
   *
   *     payment_paid_activation
   *
   * watches the payment status update.
   *
   * It should call:
   *
   *     handle_payment_paid()
   *
   * which handles:
   *
   *     THIS enrollment
   *         ↓
   *     THIS contract
   *         ↓
   *     THIS enrollment's lessons
   *
   * This works for both individual and shared enrollments.
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
  /* STEP 18: HANDLE PAYMENT UPDATE ERROR                                    */
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

  /* ======================================================================== */
  /* STEP 20: VERIFY ENROLLMENT ACTIVATION                                    */
  /* ======================================================================== */

  /*
   * The trigger should have activated THIS enrollment.
   *
   * We do not manually activate it here.
   *
   * We only verify the result.
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
  /* STEP 21: VERIFY CONTRACT ACTIVATION                                     */
  /* ======================================================================== */

  /*
   * Payment activation should also activate THIS enrollment's contract.
   *
   * We verify it here.
   */

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
  /* STEP 22: VERIFY LESSON GENERATION                                       */
  /* ======================================================================== */

  /*
   * The database trigger/function should generate lessons for THIS
   * enrollment.
   *
   * We verify that the expected number of lessons exists.
   *
   * For a shared enrollment, lessons remain associated with the
   * enrollment and can be interpreted through enrollment_students.
   */

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

  /*
   * We do not require a hardcoded lesson count here because the database
   * trigger/function is the authority for lesson generation.
   *
   * We only ensure that lessons actually exist.
   */

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