import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    locale: string;
    id: string;
    enrollmentId: string;
  }>;
}

const SUPPORTED_CURRENCIES = [
  "KRW",
  "CNY",
  "USD",
  "PHP",
] as const;

type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

const SUPPORTED_SCHEDULE_DAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

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
  if (
    value === null ||
    value.trim() === ""
  ) {
    return null;
  }

  const cleaned = value
    .replace(/,/g, "")
    .replace(/[₩₱$¥]/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
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

  const normalized = String(value)
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
  const { locale, id, enrollmentId } =
    await params;

  const studentId = id;

  const formData =
    await request.formData();

  /* ---------------------------------------------------------------------- */
  /* FORM DATA                                                              */
  /* ---------------------------------------------------------------------- */

  const packageName = String(
    formData.get("package_name") ?? ""
  ).trim();

  const numberOfLessons = Number(
    formData.get("number_of_lessons")
  );

  const lessonDuration = Number(
    formData.get("lesson_duration") || 25
  );

  const lessonsPerWeek = Number(
    formData.get("lessons_per_week") || 3
  );

  /*
   * Start date controls when lessons are
   * generated for this renewal.
   */
  const startDate = String(
    formData.get("start_date") ?? ""
  ).trim();

  /*
   * The renewal form carries the previous
   * schedule into editable fields.
   *
   * The submitted schedule belongs to the
   * NEW renewal enrollment.
   */
  const scheduleDays = formData
    .getAll("schedule_days")
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);

  const scheduleTimeValue =
    getFormValue(
      formData,
      "schedule_time"
    );

  const scheduleTime =
    scheduleTimeValue || null;

  /*
   * Generic agreed tuition amount.
   *
   * New renewal forms submit:
   *
   *   tuition_amount
   *
   * Older KRW-specific fields remain
   * supported for backward compatibility.
   */
  const submittedTuitionValue =
    getFormValue(
      formData,
      "tuition_amount",
      "tuition_amount_krw",
      "amount_krw"
    );

  const tuitionAmount = parseNumber(
    submittedTuitionValue
  );

  /*
   * PHP is stored separately as Hamkke's
   * actual / expected PHP receipt.
   */
  const submittedPhpValue =
    getFormValue(
      formData,
      "tuition_amount_php",
      "amount_php",
      "php_amount"
    );

  const tuitionAmountPhp =
    parseNumber(
      submittedPhpValue
    );

  const submittedCurrencyValue =
    getFormValue(
      formData,
      "currency"
    );

  /*
   * Payment date is ONLY the date the
   * payment was received.
   *
   * It does not affect lesson generation.
   */
  const paymentDate = String(
    formData.get("payment_date") ?? ""
  ).trim();

  const paymentMethod = String(
    formData.get("payment_method") ||
      "pending"
  ).trim();

  const referenceValue = String(
    formData.get("reference") ?? ""
  ).trim();

  const reference =
    referenceValue || null;

  /* ---------------------------------------------------------------------- */
  /* BASIC VALIDATION                                                       */
  /* ---------------------------------------------------------------------- */

  if (!packageName) {
    return NextResponse.json(
      {
        error:
          "Package name is required.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      numberOfLessons
    ) ||
    numberOfLessons < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Number of lessons must be at least 1.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      lessonDuration
    ) ||
    lessonDuration < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Lesson duration must be at least 1 minute.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(
      lessonsPerWeek
    ) ||
    lessonsPerWeek < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Lessons per week must be at least 1.",
      },
      { status: 400 }
    );
  }

  if (!startDate) {
    return NextResponse.json(
      {
        error:
          "Start date is required.",
      },
      { status: 400 }
    );
  }

  /*
   * A renewal needs at least one lesson day.
   */
  if (scheduleDays.length < 1) {
    return NextResponse.json(
      {
        error:
          "Please select at least one lesson day.",
      },
      { status: 400 }
    );
  }

  /*
   * Reject unexpected schedule values rather
   * than storing arbitrary strings.
   */
  const invalidScheduleDay =
    scheduleDays.find(
      (day) =>
        !SUPPORTED_SCHEDULE_DAYS.includes(
          day as
            (typeof SUPPORTED_SCHEDULE_DAYS)[number]
        )
    );

  if (invalidScheduleDay) {
    return NextResponse.json(
      {
        error:
          "Invalid lesson day selected.",
      },
      { status: 400 }
    );
  }

  /*
   * lessons_per_week should match the number
   * of selected lesson days.
   *
   * This prevents the renewal from saying
   * "3 lessons per week" while only having
   * two scheduled days, for example.
   */
  if (
    scheduleDays.length !==
    lessonsPerWeek
  ) {
    return NextResponse.json(
      {
        error:
          `Lessons per week is set to ${lessonsPerWeek}, but ${scheduleDays.length} lesson day${scheduleDays.length === 1 ? "" : "s"} ${scheduleDays.length === 1 ? "is" : "are"} selected.`,
      },
      { status: 400 }
    );
  }

  if (
    tuitionAmount === null ||
    !Number.isFinite(
      tuitionAmount
    ) ||
    tuitionAmount <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Agreed tuition amount is required.",
      },
      { status: 400 }
    );
  }

  if (
    tuitionAmountPhp === null ||
    !Number.isFinite(
      tuitionAmountPhp
    ) ||
    tuitionAmountPhp <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "PHP amount is required.",
      },
      { status: 400 }
    );
  }

  /*
   * Payment date remains optional because a
   * renewal may be created before payment is
   * actually received.
   */

  const supabase =
    await createClient();

  /* ---------------------------------------------------------------------- */
  /* STEP 1: GET PREVIOUS ENROLLMENT                                       */
  /* ---------------------------------------------------------------------- */

  /*
   * The previous enrollment supplies its
   * existing tuition currency as a fallback.
   *
   * Its schedule is loaded for reference only.
   * The submitted renewal schedule is what
   * will be saved to the new enrollment.
   *
   * The previous enrollment itself is never
   * modified by this route.
   */
  const {
    data: previousEnrollment,
    error: previousError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        schedule_days,
        schedule_time,
        tuition_amount,
        currency
      `
    )
    .eq(
      "id",
      enrollmentId
    )
    .eq(
      "student_id",
      studentId
    )
    .single();

  if (
    previousError ||
    !previousEnrollment
  ) {
    console.error(
      "RENEWAL PREVIOUS ENROLLMENT ERROR:",
      {
        enrollmentId,
        studentId,
        code:
          previousError?.code,
        message:
          previousError?.message,
        details:
          previousError?.details,
        hint:
          previousError?.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "Previous enrollment not found.",
      },
      { status: 404 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 2: DETERMINE RENEWAL CURRENCY                                    */
  /* ---------------------------------------------------------------------- */

  /*
   * Priority:
   *
   * 1. submitted currency
   * 2. previous enrollment currency
   *
   * This allows the renewal form to explicitly
   * choose another supported currency, while
   * preserving the student's existing currency
   * when an older form sends no currency field.
   */

  const previousCurrency =
    normalizeCurrency(
      previousEnrollment.currency
    );

  const submittedCurrency =
    submittedCurrencyValue
      ? normalizeCurrency(
          submittedCurrencyValue
        )
      : null;

  if (
    submittedCurrencyValue &&
    !submittedCurrency
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid tuition currency.",
      },
      { status: 400 }
    );
  }

  const currency =
    submittedCurrency ??
    previousCurrency;

  if (!currency) {
    return NextResponse.json(
      {
        error:
          "The renewal currency could not be determined.",
      },
      { status: 400 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 3: CREATE NEW RENEWAL ENROLLMENT                                 */
  /* ---------------------------------------------------------------------- */

  /*
   * The renewal is its own enrollment.
   *
   * Important:
   *
   * - status starts as pending
   * - start_date belongs to THIS renewal
   * - renewal_of points to the previous enrollment
   * - previous enrollment remains untouched
   * - tuition_amount is stored in currency
   * - submitted schedule belongs to THIS renewal
   */
  const {
    data: newEnrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .insert({
      student_id:
        studentId,

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
        tuitionAmount,

      currency,

      /*
       * IMPORTANT:
       *
       * Use the schedule submitted by the
       * renewal form, not the old enrollment's
       * schedule.
       */
      schedule_days:
        scheduleDays,

      schedule_time:
        scheduleTime,

      renewal_of:
        enrollmentId,
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
    !newEnrollment
  ) {
    console.error(
      "RENEWAL ENROLLMENT CREATION ERROR:",
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

    return NextResponse.json(
      {
        error:
          "Failed to create renewal.",
      },
      { status: 500 }
    );
  }

  console.log(
    "RENEWAL ENROLLMENT CREATED:",
    newEnrollment
  );

  /* ---------------------------------------------------------------------- */
  /* STEP 4: VERIFY ENROLLMENT DETAILS                                     */
  /* ---------------------------------------------------------------------- */

  if (
    Number(
      newEnrollment.tuition_amount
    ) !== tuitionAmount
  ) {
    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Renewal was created with an invalid tuition amount.",
      },
      { status: 500 }
    );
  }

  if (
    newEnrollment.currency !==
    currency
  ) {
    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Renewal was created with an invalid tuition currency.",
      },
      { status: 500 }
    );
  }

  /*
   * Verify that the NEW schedule was actually
   * stored on the renewal.
   */
  const storedScheduleDays =
    Array.isArray(
      newEnrollment.schedule_days
    )
      ? [
          ...newEnrollment
            .schedule_days,
        ].sort()
      : [];

  const expectedScheduleDays =
    [...scheduleDays].sort();

  if (
    JSON.stringify(
      storedScheduleDays
    ) !==
    JSON.stringify(
      expectedScheduleDays
    )
  ) {
    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Renewal was created with an invalid lesson schedule.",
      },
      { status: 500 }
    );
  }

  if (
    (newEnrollment.schedule_time ||
      null) !==
    scheduleTime
  ) {
    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Renewal was created with an invalid lesson time.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 5: CREATE CONTRACT                                                */
  /* ---------------------------------------------------------------------- */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id:
        newEnrollment.id,

      status:
        "for_review",
    })
    .select("id")
    .single();

  if (
    contractError ||
    !contract
  ) {
    console.error(
      "RENEWAL CONTRACT CREATION ERROR:",
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
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Failed to create renewal contract.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 6: CREATE PAYMENT RECORD                                          */
  /* ---------------------------------------------------------------------- */

  /*
   * Payment model:
   *
   * amount
   *     Agreed tuition amount in currency.
   *
   * currency
   *     KRW / CNY / USD / PHP.
   *
   * amount_krw
   *     Compatibility field only.
   *     Populated when currency is KRW.
   *
   * amount_php
   *     Actual / expected PHP amount.
   *
   * payment_date
   *     Actual payment date.
   *
   * start_date
   *     Lesson-generation date.
   */
  const {
    data: payment,
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      enrollment_id:
        newEnrollment.id,

      amount:
        tuitionAmount,

      currency,

      /*
       * payments.payment_date is NOT NULL.
       *
       * If the renewal payment has not been
       * received yet, use startDate only as
       * the pending record's temporary date.
       */
      payment_date:
        paymentDate ||
        startDate,

      payment_method:
        paymentMethod,

      status:
        "pending",

      reference,

      /*
       * Legacy compatibility field.
       *
       * Only KRW payments should populate it.
       */
      amount_krw:
        currency === "KRW"
          ? tuitionAmount
          : null,

      /*
       * Internal PHP accounting amount.
       */
      amount_php:
        tuitionAmountPhp,
    })
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
        status,
        reference
      `
    )
    .single();

  if (
    paymentError ||
    !payment
  ) {
    console.error(
      "RENEWAL PAYMENT CREATION ERROR:",
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
      .from("enrollments")
      .delete()
      .eq(
        "id",
        newEnrollment.id
      );

    return NextResponse.json(
      {
        error:
          "Failed to create renewal payment record.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 7: VERIFY PAYMENT RECORD                                          */
  /* ---------------------------------------------------------------------- */

  if (
    Number(
      payment.amount
    ) !== tuitionAmount
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but the payment amount could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    payment.currency !==
    currency
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but the payment currency could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    currency === "KRW" &&
    Number(
      payment.amount_krw
    ) !== tuitionAmount
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but the KRW compatibility amount could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    currency !== "KRW" &&
    payment.amount_krw !== null
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but a non-KRW payment contains an invalid KRW amount.",
      },
      { status: 500 }
    );
  }

  if (
    Number(
      payment.amount_php
    ) !== tuitionAmountPhp
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but the PHP amount could not be verified.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 8: VERIFY RENEWAL RELATIONSHIP                                   */
  /* ---------------------------------------------------------------------- */

  const {
    data: verification,
    error: verificationError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        renewal_of,
        start_date,
        tuition_amount,
        currency,
        lessons_per_week,
        schedule_days,
        schedule_time
      `
    )
    .eq(
      "id",
      newEnrollment.id
    )
    .single();

  if (
    verificationError ||
    !verification ||
    verification.renewal_of !==
      enrollmentId
  ) {
    console.error(
      "RENEWAL VERIFICATION FAILED:",
      {
        createdEnrollmentId:
          newEnrollment.id,

        expectedRenewalOf:
          enrollmentId,

        verification,

        verificationError,
      }
    );

    return NextResponse.json(
      {
        error:
          "Renewal was created, but the renewal relationship could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    Number(
      verification.tuition_amount
    ) !== tuitionAmount ||
    verification.currency !==
      currency
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but its tuition details could not be verified.",
      },
      { status: 500 }
    );
  }

  const verifiedScheduleDays =
    Array.isArray(
      verification.schedule_days
    )
      ? [
          ...verification
            .schedule_days,
        ].sort()
      : [];

  if (
    JSON.stringify(
      verifiedScheduleDays
    ) !==
    JSON.stringify(
      expectedScheduleDays
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but its lesson days could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    (verification.schedule_time ||
      null) !==
    scheduleTime
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but its lesson time could not be verified.",
      },
      { status: 500 }
    );
  }

  if (
    Number(
      verification.lessons_per_week
    ) !== lessonsPerWeek
  ) {
    return NextResponse.json(
      {
        error:
          "Renewal was created, but its weekly lesson frequency could not be verified.",
      },
      { status: 500 }
    );
  }

  console.log(
    "RENEWAL VERIFIED:",
    {
      ...verification,

      paymentId:
        payment.id,

      paymentCurrency:
        payment.currency,

      originalPaymentAmount:
        payment.amount,

      actualPhpAmount:
        payment.amount_php,

      scheduleDays:
        verification.schedule_days,

      scheduleTime:
        verification.schedule_time,
    }
  );

  /* ---------------------------------------------------------------------- */
  /* STEP 9: REDIRECT                                                       */
  /* ---------------------------------------------------------------------- */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${studentId}`,
      request.url
    )
  );
}