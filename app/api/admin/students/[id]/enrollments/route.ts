import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface Participant {
  studentId: string;
  scheduleDays: string[];
  scheduleTime: string | null;
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);

  if (value === null) {
    return "";
  }

  return String(value).trim();
}

function getNumber(
  formData: FormData,
  ...names: string[]
): number {
  for (const name of names) {
    const value = formData.get(name);

    if (value === null) {
      continue;
    }

    const text = String(value).trim();

    if (!text) {
      continue;
    }

    const cleaned = text
      .replace(/,/g, "")
      .replace(/[₩₱$]/g, "")
      .trim();

    const number = Number(cleaned);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return NaN;
}

function getScheduleDays(
  formData: FormData,
  name: string
): string[] {
  return Array.from(
    new Set(
      formData
        .getAll(name)
        .map((value) =>
          String(value).trim().toLowerCase()
        )
        .filter(Boolean)
    )
  );
}

function normalizeStudentIds(
  formData: FormData
): string[] {
  const values = [
    ...formData.getAll("student_ids"),
    ...formData.getAll("student_id"),
  ];

  return Array.from(
    new Set(
      values
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );
}

function getParticipantScheduleDays(
  formData: FormData,
  studentId: string
): string[] {
  const possibleNames = [
    `schedule_days_${studentId}`,
    `participant_schedule_days_${studentId}`,
    `schedule_days[${studentId}]`,
  ];

  for (const name of possibleNames) {
    const days = getScheduleDays(formData, name);

    if (days.length > 0) {
      return days;
    }
  }

  return [];
}

function getParticipantScheduleTime(
  formData: FormData,
  studentId: string
): string | null {
  const possibleNames = [
    `schedule_time_${studentId}`,
    `participant_schedule_time_${studentId}`,
    `schedule_time[${studentId}]`,
  ];

  for (const name of possibleNames) {
    const value = getString(formData, name);

    if (value) {
      return value;
    }
  }

  return null;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const formData = await request.formData();

  /* ======================================================================== */
  /* BASIC CONTEXT                                                            */
  /* ======================================================================== */

  const locale =
    getString(formData, "locale") || "en";

  /* ======================================================================== */
  /* ENROLLMENT TYPE                                                          */
  /* ======================================================================== */

  const enrollmentType =
    getString(
      formData,
      "enrollment_type"
    ).toLowerCase() || "individual";

  if (
    enrollmentType !== "individual" &&
    enrollmentType !== "shared"
  ) {
    return new NextResponse(
      "Invalid enrollment type.",
      { status: 400 }
    );
  }

  const isShared =
    enrollmentType === "shared";

  /* ======================================================================== */
  /* PARTICIPATING STUDENTS                                                   */
  /* ======================================================================== */

  let studentIds =
    normalizeStudentIds(formData);

  /*
   * Individual enrollment:
   *
   * The enrollment belongs to the student whose
   * record this page was opened from.
   */

  if (!isShared) {
    studentIds = [id];
  }

  /*
   * Shared enrollment:
   *
   * The originating student must always be included.
   */

  if (isShared && !studentIds.includes(id)) {
    studentIds.unshift(id);
  }

  studentIds = Array.from(
    new Set(studentIds)
  );

  if (studentIds.length === 0) {
    return new NextResponse(
      "At least one student is required.",
      { status: 400 }
    );
  }

  if (
    isShared &&
    studentIds.length < 2
  ) {
    return new NextResponse(
      "A shared enrollment requires at least two students.",
      { status: 400 }
    );
  }

  if (
    studentIds.some(
      (studentId) =>
        !isValidUuid(studentId)
    )
  ) {
    return new NextResponse(
      "One or more student IDs are invalid.",
      { status: 400 }
    );
  }

  /* ======================================================================== */
  /* ENROLLMENT DETAILS                                                       */
  /* ======================================================================== */

  const packageName =
    getString(
      formData,
      "package_name"
    );

  const numberOfLessons =
    getNumber(
      formData,
      "number_of_lessons"
    );

  const lessonDuration =
    getNumber(
      formData,
      "lesson_duration"
    );

  const lessonsPerWeek =
    getNumber(
      formData,
      "lessons_per_week"
    );

  const startDate =
    getString(
      formData,
      "start_date"
    );

  /* ======================================================================== */
  /* TUITION                                                                  */
  /* ======================================================================== */

  const tuitionAmountKrw =
    getNumber(
      formData,
      "tuition_amount_krw",
      "tuition_amount",
      "amount_krw"
    );

  const tuitionAmountPhp =
    getNumber(
      formData,
      "tuition_amount_php",
      "php_amount",
      "amount_php"
    );

  /* ======================================================================== */
  /* PAYMENT                                                                  */
  /* ======================================================================== */

  const paymentDateValue =
    getString(
      formData,
      "payment_date"
    );

  const paymentDate =
    paymentDateValue || null;

  const paymentMethodValue =
    getString(
      formData,
      "payment_method"
    );

  const paymentMethod =
    paymentMethodValue || "pending";

  const referenceValue =
    getString(
      formData,
      "reference"
    );

  const reference =
    referenceValue || null;

  /*
   * The form uses payment date and payment method to
   * describe the payment record.
   *
   * Payment status remains pending at creation.
   *
   * The existing payment_paid_activation trigger is
   * responsible for activation when status later changes
   * from pending to paid.
   */

  /* ======================================================================== */
  /* RENEWAL                                                                  */
  /* ======================================================================== */

  const renewalOfValue =
    getString(
      formData,
      "renewal_of"
    );

  const renewalOf =
    renewalOfValue || null;

  /* ======================================================================== */
  /* INDIVIDUAL SCHEDULE                                                      */
  /* ======================================================================== */

  const individualScheduleDays =
    getScheduleDays(
      formData,
      "schedule_days"
    );

  const individualScheduleTimeValue =
    getString(
      formData,
      "schedule_time"
    );

  const individualScheduleTime =
    individualScheduleTimeValue || null;

  /* ======================================================================== */
  /* PARTICIPANT SCHEDULES                                                    */
  /* ======================================================================== */

  const participants: Participant[] =
    studentIds.map((studentId) => {
      /*
       * Individual enrollment:
       *
       * The schedule is stored directly on the enrollment
       * and duplicated onto its participant row.
       */

      if (!isShared) {
        return {
          studentId,
          scheduleDays:
            individualScheduleDays,
          scheduleTime:
            individualScheduleTime,
        };
      }

      /*
       * Shared enrollment:
       *
       * Each participant must have their own schedule.
       */

      return {
        studentId,
        scheduleDays:
          getParticipantScheduleDays(
            formData,
            studentId
          ),
        scheduleTime:
          getParticipantScheduleTime(
            formData,
            studentId
          ),
      };
    });

  /* ======================================================================== */
  /* VALIDATION                                                               */
  /* ======================================================================== */

  if (!packageName) {
    return new NextResponse(
      "Package name is required.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      numberOfLessons
    ) ||
    numberOfLessons < 1
  ) {
    return new NextResponse(
      "Number of lessons must be at least 1.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      lessonDuration
    ) ||
    lessonDuration < 1
  ) {
    return new NextResponse(
      "Lesson duration must be at least 1 minute.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      lessonsPerWeek
    ) ||
    lessonsPerWeek < 1
  ) {
    return new NextResponse(
      "Lessons per week must be at least 1.",
      { status: 400 }
    );
  }

  if (!startDate) {
    return new NextResponse(
      "Lesson start date is required.",
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(
      tuitionAmountKrw
    ) ||
    tuitionAmountKrw < 0
  ) {
    return new NextResponse(
      "KRW tuition amount is required.",
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(
      tuitionAmountPhp
    ) ||
    tuitionAmountPhp < 0
  ) {
    return new NextResponse(
      "PHP tuition amount is required.",
      { status: 400 }
    );
  }

  /*
   * Individual schedule.
   */

  if (
    !isShared &&
    individualScheduleDays.length === 0
  ) {
    return new NextResponse(
      "At least one lesson day is required.",
      { status: 400 }
    );
  }

  if (
    !isShared &&
    !individualScheduleTime
  ) {
    return new NextResponse(
      "Lesson time is required.",
      { status: 400 }
    );
  }

  /*
   * Shared schedule.
   *
   * Every participant must have:
   *
   * - at least one lesson day
   * - a lesson time
   */

  if (isShared) {
    for (const participant of participants) {
      if (
        participant.scheduleDays.length === 0
      ) {
        return new NextResponse(
          `At least one lesson day is required for student ${participant.studentId}.`,
          { status: 400 }
        );
      }

      if (!participant.scheduleTime) {
        return new NextResponse(
          `Lesson time is required for student ${participant.studentId}.`,
          { status: 400 }
        );
      }
    }
  }

  /* ======================================================================== */
  /* SUPABASE                                                                 */
  /* ======================================================================== */

  const supabase =
    await createClient();

  /* ======================================================================== */
  /* STEP 1: VERIFY ORIGINATING STUDENT                                      */
  /* ======================================================================== */

  const {
    data: originatingStudent,
    error: originatingStudentError,
  } = await supabase
    .from("students")
    .select(
      "id, full_name, preferred_name"
    )
    .eq("id", id)
    .single();

  if (
    originatingStudentError ||
    !originatingStudent
  ) {
    console.error(
      "ORIGINATING STUDENT VERIFICATION ERROR:",
      {
        studentId: id,
        error:
          originatingStudentError,
      }
    );

    return new NextResponse(
      "Student not found.",
      { status: 404 }
    );
  }

  /* ======================================================================== */
  /* STEP 2: VERIFY ALL PARTICIPANTS                                         */
  /* ======================================================================== */

  const {
    data: students,
    error: studentsError,
  } = await supabase
    .from("students")
    .select(
      `
        id,
        full_name,
        preferred_name
      `
    )
    .in(
      "id",
      studentIds
    );

  if (
    studentsError ||
    !students ||
    students.length !==
      studentIds.length
  ) {
    console.error(
      "STUDENT VERIFICATION ERROR:",
      {
        studentIds,
        students,
        error:
          studentsError,
      }
    );

    return new NextResponse(
      "One or more selected students could not be found.",
      { status: 404 }
    );
  }

  /* ======================================================================== */
  /* STEP 3: VALIDATE RENEWAL                                                */
  /* ======================================================================== */

  if (renewalOf) {
    /*
     * A renewal belongs to the originating student's
     * enrollment history.
     *
     * This intentionally checks student_id rather than
     * attempting to infer ownership from participants.
     *
     * Shared enrollments have student_id = NULL, so a
     * shared enrollment should not currently be used as
     * the renewal target through this field.
     */

    const {
      data: previousEnrollment,
      error:
        previousEnrollmentError,
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
        renewalOf
      )
      .eq(
        "student_id",
        id
      )
      .single();

    if (
      previousEnrollmentError ||
      !previousEnrollment
    ) {
      console.error(
        "RENEWAL VALIDATION ERROR:",
        {
          renewalOf,
          studentId: id,
          code:
            previousEnrollmentError?.code,
          message:
            previousEnrollmentError?.message,
          details:
            previousEnrollmentError?.details,
          hint:
            previousEnrollmentError?.hint,
        }
      );

      return new NextResponse(
        "Previous enrollment not found.",
        { status: 400 }
      );
    }

    console.log(
      "RENEWAL VALIDATED:",
      previousEnrollment
    );
  }

  /* ======================================================================== */
  /* STEP 4: CREATE ONE ENROLLMENT                                            */
  /* ======================================================================== */

  /*
   * INDIVIDUAL:
   *
   * enrollments            = 1
   * enrollment_students    = 1
   * contracts              = 1
   * payments               = 1
   *
   * SHARED:
   *
   * enrollments            = 1
   * enrollment_students    = many
   * contracts              = 1
   * payments               = 1
   *
   * Shared enrollment:
   *
   * student_id = NULL
   *
   * Individual enrollment:
   *
   * student_id = originating student
   */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .insert({
      student_id:
        isShared
          ? null
          : id,

      package_name:
        packageName,

      number_of_lessons:
        numberOfLessons,

      lesson_duration:
        lessonDuration,

      lessons_per_week:
        lessonsPerWeek,

      start_date:
        startDate,

      status:
        "pending",

      tuition_amount:
        tuitionAmountKrw,

      currency:
        "KRW",

      /*
       * Individual enrollments keep the existing schedule
       * fields for compatibility.
       *
       * Shared enrollments keep these fields empty because
       * participant schedules live in enrollment_students.
       */

      schedule_days:
        isShared
          ? []
          : individualScheduleDays,

      schedule_time:
        isShared
          ? null
          : individualScheduleTime,

      renewal_of:
        renewalOf,
    })
    .select(
      `
        id,
        student_id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        status,
        tuition_amount,
        currency,
        schedule_days,
        schedule_time,
        renewal_of
      `
    )
    .single();

  if (
    enrollmentError ||
    !enrollment
  ) {
    console.error(
      "ENROLLMENT CREATION ERROR:",
      {
        code:
          enrollmentError?.code,
        message:
          enrollmentError?.message,
        details:
          enrollmentError?.details,
        hint:
          enrollmentError?.hint,
      }
    );

    return new NextResponse(
      `Unable to create enrollment.

Code: ${
        enrollmentError?.code ||
        "unknown"
      }

Message: ${
        enrollmentError?.message ||
        "unknown"
      }

Details: ${
        enrollmentError?.details ||
        "none"
      }

Hint: ${
        enrollmentError?.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  console.log(
    "ENROLLMENT CREATED:",
    {
      enrollmentId:
        enrollment.id,
      enrollmentType,
      studentIds,
    }
  );

  /* ======================================================================== */
  /* STEP 5: CREATE PARTICIPANTS                                             */
  /* ======================================================================== */

  /*
   * These rows are authoritative for participation.
   *
   * Shared:
   *   one row per participating student
   *   each row contains its own schedule
   *
   * Individual:
   *   one row for the originating student
   */

  const participantRows =
    participants.map(
      (participant) => ({
        enrollment_id:
          enrollment.id,

        student_id:
          participant.studentId,

        schedule_days:
          participant.scheduleDays,

        schedule_time:
          participant.scheduleTime,
      })
    );

  const {
    data: createdParticipants,
    error:
      participantError,
  } = await supabase
    .from("enrollment_students")
    .insert(
      participantRows
    )
    .select(
      `
        id,
        enrollment_id,
        student_id,
        schedule_days,
        schedule_time
      `
    );

  if (
    participantError ||
    !createdParticipants ||
    createdParticipants.length !==
      participants.length
  ) {
    console.error(
      "ENROLLMENT PARTICIPANT CREATION ERROR:",
      {
        code:
          participantError?.code,
        message:
          participantError?.message,
        details:
          participantError?.details,
        hint:
          participantError?.hint,
        participantRows,
      }
    );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return new NextResponse(
      `Unable to create enrollment participants.

Code: ${
        participantError?.code ||
        "unknown"
      }

Message: ${
        participantError?.message ||
        "unknown"
      }

Details: ${
        participantError?.details ||
        "none"
      }

Hint: ${
        participantError?.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  console.log(
    "ENROLLMENT PARTICIPANTS CREATED:",
    createdParticipants
  );

  /* ======================================================================== */
  /* STEP 6: CREATE ONE CONTRACT                                              */
  /* ======================================================================== */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id:
        enrollment.id,

      status:
        "for_review",
    })
    .select(
      "id, enrollment_id, status"
    )
    .single();

  if (
    contractError ||
    !contract
  ) {
    console.error(
      "CONTRACT CREATION ERROR:",
      {
        code:
          contractError?.code,
        message:
          contractError?.message,
        details:
          contractError?.details,
        hint:
          contractError?.hint,
      }
    );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return new NextResponse(
      `Unable to create enrollment contract.

Code: ${
        contractError?.code ||
        "unknown"
      }

Message: ${
        contractError?.message ||
        "unknown"
      }

Details: ${
        contractError?.details ||
        "none"
      }

Hint: ${
        contractError?.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  console.log(
    "CONTRACT CREATED:",
    contract
  );

  /* ======================================================================== */
  /* STEP 7: CREATE ONE PAYMENT                                               */
  /* ======================================================================== */

  /*
   * ONE payment belongs to ONE enrollment.
   *
   * This is true for both individual and shared
   * enrollments.
   *
   * The payment does NOT belong to individual
   * participants.
   *
   * The trigger later watches this payment:
   *
   * pending → paid
   *
   * and then:
   *
   * payment_paid_activation
   *        ↓
   * handle_payment_paid()
   *        ↓
   * enrollment → active
   * contract → active
   * lessons generated
   */

  const {
    data: payment,
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      enrollment_id:
        enrollment.id,

      amount:
        tuitionAmountKrw,

      currency:
        "KRW",

      amount_krw:
        tuitionAmountKrw,

      amount_php:
        tuitionAmountPhp,

      payment_date:
        paymentDate,

      payment_method:
        paymentMethod,

      status:
        "pending",

      reference,
    })
    .select(
      `
        id,
        enrollment_id,
        amount,
        currency,
        amount_krw,
        amount_php,
        status,
        payment_date,
        payment_method,
        reference
      `
    )
    .single();

  if (
    paymentError ||
    !payment
  ) {
    console.error(
      "PAYMENT CREATION ERROR:",
      {
        code:
          paymentError?.code,
        message:
          paymentError?.message,
        details:
          paymentError?.details,
        hint:
          paymentError?.hint,
      }
    );

    await supabase
      .from("contracts")
      .delete()
      .eq(
        "id",
        contract.id
      );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return new NextResponse(
      `Unable to create payment record.

Code: ${
        paymentError?.code ||
        "unknown"
      }

Message: ${
        paymentError?.message ||
        "unknown"
      }

Details: ${
        paymentError?.details ||
        "none"
      }

Hint: ${
        paymentError?.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  console.log(
    "PAYMENT CREATED:",
    payment
  );

  /* ======================================================================== */
  /* STEP 8: VERIFY ENROLLMENT                                                */
  /* ======================================================================== */

  const {
    data: enrollmentVerification,
    error:
      enrollmentVerificationError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        renewal_of,
        status,
        tuition_amount,
        currency,
        schedule_days,
        schedule_time,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date
      `
    )
    .eq(
      "id",
      enrollment.id
    )
    .single();

  if (
    enrollmentVerificationError ||
    !enrollmentVerification
  ) {
    console.error(
      "ENROLLMENT VERIFICATION FAILED:",
      {
        enrollmentId:
          enrollment.id,
        verification:
          enrollmentVerification,
        error:
          enrollmentVerificationError,
      }
    );

    return new NextResponse(
      "Enrollment was created, but could not be verified.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 9: VERIFY PARTICIPANTS                                             */
  /* ======================================================================== */

  const {
    data: participantVerification,
    error:
      participantVerificationError,
  } = await supabase
    .from("enrollment_students")
    .select(
      `
        id,
        enrollment_id,
        student_id,
        schedule_days,
        schedule_time
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    );

  if (
    participantVerificationError ||
    !participantVerification ||
    participantVerification.length !==
      studentIds.length
  ) {
    console.error(
      "PARTICIPANT VERIFICATION FAILED:",
      {
        enrollmentId:
          enrollment.id,
        expectedStudentIds:
          studentIds,
        actualParticipants:
          participantVerification,
        error:
          participantVerificationError,
      }
    );

    return new NextResponse(
      "Enrollment was created, but its participating students could not be verified.",
      { status: 500 }
    );
  }

  const verifiedStudentIds =
    participantVerification
      .map(
        (participant) =>
          participant.student_id
      )
      .sort();

  const expectedStudentIds =
    [...studentIds].sort();

  if (
    JSON.stringify(
      verifiedStudentIds
    ) !==
    JSON.stringify(
      expectedStudentIds
    )
  ) {
    console.error(
      "PARTICIPANT STUDENT RELATIONSHIP MISMATCH:",
      {
        expected:
          expectedStudentIds,
        actual:
          verifiedStudentIds,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the participating student relationships could not be verified.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 10: VERIFY INDIVIDUAL / SHARED STRUCTURE                           */
  /* ======================================================================== */

  if (!isShared) {
    if (
      enrollmentVerification.student_id !==
      id
    ) {
      console.error(
        "INDIVIDUAL STUDENT RELATIONSHIP VERIFICATION FAILED:",
        {
          expectedStudentId:
            id,
          actualStudentId:
            enrollmentVerification.student_id,
        }
      );

      return new NextResponse(
        "Enrollment was created, but the student relationship could not be verified.",
        { status: 500 }
      );
    }
  }

  if (
    isShared &&
    enrollmentVerification.student_id !==
      null
  ) {
    console.error(
      "SHARED ENROLLMENT STUDENT_ID VERIFICATION FAILED:",
      {
        enrollmentId:
          enrollment.id,
        studentId:
          enrollmentVerification.student_id,
      }
    );

    return new NextResponse(
      "Shared enrollment was created with an invalid student relationship.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 11: VERIFY PAYMENT                                                  */
  /* ======================================================================== */

  const {
    data: paymentVerification,
    error:
      paymentVerificationError,
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
        status,
        payment_date,
        payment_method,
        reference
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (
    paymentVerificationError ||
    !paymentVerification
  ) {
    console.error(
      "PAYMENT VERIFICATION FAILED:",
      {
        enrollmentId:
          enrollment.id,
        paymentVerification,
        paymentVerificationError,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the payment record could not be verified.",
      { status: 500 }
    );
  }

  if (
    Number(
      paymentVerification.amount
    ) !== tuitionAmountKrw
  ) {
    console.error(
      "PAYMENT AMOUNT MISMATCH:",
      {
        expected:
          tuitionAmountKrw,
        actual:
          paymentVerification.amount,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the payment amount could not be verified.",
      { status: 500 }
    );
  }

  if (
    Number(
      paymentVerification.amount_krw
    ) !== tuitionAmountKrw
  ) {
    console.error(
      "KRW PAYMENT AMOUNT MISMATCH:",
      {
        expected:
          tuitionAmountKrw,
        actual:
          paymentVerification.amount_krw,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the KRW payment amount could not be verified.",
      { status: 500 }
    );
  }

  if (
    Number(
      paymentVerification.amount_php
    ) !== tuitionAmountPhp
  ) {
    console.error(
      "PHP PAYMENT AMOUNT MISMATCH:",
      {
        expected:
          tuitionAmountPhp,
        actual:
          paymentVerification.amount_php,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the PHP payment amount could not be verified.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 12: FINAL LOG                                                       */
  /* ======================================================================== */

  console.log(
    "ENROLLMENT FULLY CREATED:",
    {
      enrollmentId:
        enrollment.id,

      enrollmentType,

      originatingStudent:
        id,

      participatingStudents:
        studentIds,

      participantCount:
        studentIds.length,

      contractId:
        contract.id,

      paymentId:
        payment.id,

      enrollmentStatus:
        enrollment.status,

      paymentStatus:
        payment.status,
    }
  );

  /* ======================================================================== */
  /* STEP 13: REDIRECT                                                        */
  /* ======================================================================== */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}