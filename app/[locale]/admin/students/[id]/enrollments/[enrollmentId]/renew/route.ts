import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    locale: string;
    id: string;
    enrollmentId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { locale, id, enrollmentId } = await params;

  const studentId = id;

  const formData = await request.formData();

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
   * IMPORTANT:
   * Start date controls when lessons are generated.
   */
  const startDate = String(
    formData.get("start_date") ?? ""
  ).trim();

  /*
   * Tuition is recorded separately in KRW and PHP.
   */
  const tuitionAmountKrw = Number(
    formData.get("tuition_amount_krw")
  );

  const tuitionAmountPhp = Number(
    formData.get("tuition_amount_php")
  );

  /*
   * Payment date is ONLY the date the payment was received.
   * It does not affect lesson generation.
   */
  const paymentDate = String(
    formData.get("payment_date") ?? ""
  ).trim();

  const paymentMethod = String(
    formData.get("payment_method") || "pending"
  ).trim();

  const referenceValue = String(
    formData.get("reference") ?? ""
  ).trim();

  const reference = referenceValue || null;

  /* ---------------------------------------------------------------------- */
  /* VALIDATION                                                             */
  /* ---------------------------------------------------------------------- */

  if (!packageName) {
    return NextResponse.json(
      {
        error: "Package name is required.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(numberOfLessons) ||
    numberOfLessons < 1
  ) {
    return NextResponse.json(
      {
        error: "Number of lessons must be at least 1.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(lessonDuration) ||
    lessonDuration < 1
  ) {
    return NextResponse.json(
      {
        error: "Lesson duration must be at least 1 minute.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(lessonsPerWeek) ||
    lessonsPerWeek < 1
  ) {
    return NextResponse.json(
      {
        error: "Lessons per week must be at least 1.",
      },
      { status: 400 }
    );
  }

  if (!startDate) {
    return NextResponse.json(
      {
        error: "Start date is required.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(tuitionAmountKrw) ||
    tuitionAmountKrw < 0
  ) {
    return NextResponse.json(
      {
        error: "KRW tuition amount is required.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(tuitionAmountPhp) ||
    tuitionAmountPhp < 0
  ) {
    return NextResponse.json(
      {
        error: "PHP tuition amount is required.",
      },
      { status: 400 }
    );
  }

  /*
   * Payment date is optional because the enrollment may be created
   * before payment is actually received.
   *
   * If payment is already being recorded, the form can provide it.
   */

  const supabase = await createClient();

  /* ---------------------------------------------------------------------- */
  /* STEP 1: GET PREVIOUS ENROLLMENT                                       */
  /* ---------------------------------------------------------------------- */

  /*
   * The previous enrollment supplies the existing schedule.
   *
   * We intentionally do NOT modify the previous enrollment.
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
        schedule_time
      `
    )
    .eq("id", enrollmentId)
    .eq("student_id", studentId)
    .single();

  if (previousError || !previousEnrollment) {
    console.error(
      "RENEWAL PREVIOUS ENROLLMENT ERROR:",
      {
        enrollmentId,
        studentId,
        code: previousError?.code,
        message: previousError?.message,
        details: previousError?.details,
        hint: previousError?.hint,
      }
    );

    return NextResponse.json(
      {
        error: "Previous enrollment not found.",
      },
      { status: 404 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 2: CREATE NEW RENEWAL ENROLLMENT                                 */
  /* ---------------------------------------------------------------------- */

  /*
   * The renewal is its own enrollment.
   *
   * Important:
   * - status starts as pending
   * - start_date belongs to THIS renewal
   * - renewal_of points to the previous enrollment
   * - previous enrollment remains untouched
   */
  const {
    data: newEnrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .insert({
      student_id: studentId,

      package_name: packageName,

      number_of_lessons: numberOfLessons,

      lesson_duration: lessonDuration,

      lessons_per_week: lessonsPerWeek,

      /*
       * Lessons will eventually be generated from this date.
       */
      start_date: startDate,

      status: "pending",

      /*
       * Keep the two currencies together on the enrollment.
       *
       * The enrollment table has one tuition_amount field,
       * so KRW is used as the primary enrollment tuition amount.
       *
       * The PHP amount is stored on the payment record below.
       */
      tuition_amount: tuitionAmountKrw,

      currency: "KRW",

      schedule_days:
        previousEnrollment.schedule_days,

      schedule_time:
        previousEnrollment.schedule_time,

      /*
       * This is what identifies this enrollment as a renewal.
       */
      renewal_of: enrollmentId,
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

  if (enrollmentError || !newEnrollment) {
    console.error(
      "RENEWAL ENROLLMENT CREATION ERROR:",
      {
        code: enrollmentError?.code,
        message: enrollmentError?.message,
        details: enrollmentError?.details,
        hint: enrollmentError?.hint,
      }
    );

    return NextResponse.json(
      {
        error: "Failed to create renewal.",
      },
      { status: 500 }
    );
  }

  console.log(
    "RENEWAL ENROLLMENT CREATED:",
    newEnrollment
  );

  /* ---------------------------------------------------------------------- */
  /* STEP 3: CREATE CONTRACT                                                */
  /* ---------------------------------------------------------------------- */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id: newEnrollment.id,
      status: "for_review",
    })
    .select("id")
    .single();

  if (contractError || !contract) {
    console.error(
      "RENEWAL CONTRACT CREATION ERROR:",
      {
        code: contractError?.code,
        message: contractError?.message,
        details: contractError?.details,
        hint: contractError?.hint,
      }
    );

    /*
     * Roll back the renewal enrollment because its
     * required contract could not be created.
     */
    await supabase
      .from("enrollments")
      .delete()
      .eq("id", newEnrollment.id);

    return NextResponse.json(
      {
        error: "Failed to create renewal contract.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 4: CREATE PAYMENT RECORD                                          */
  /* ---------------------------------------------------------------------- */

  /*
   * Payment is kept separate from the enrollment.
   *
   * KRW:
   *   amount_krw
   *
   * PHP:
   *   amount_php
   *
   * payment_date:
   *   actual payment date
   *
   * start_date:
   *   lesson-generation date
   *
   * These two dates are intentionally independent.
   */
  const {
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      enrollment_id: newEnrollment.id,

      /*
       * Keep amount as the primary payment amount in KRW.
       */
      amount: tuitionAmountKrw,

      currency: "KRW",

      /*
       * This is the actual date the payment was received.
       * If blank, use the enrollment start date only as a
       * fallback for the initial pending record.
       *
       * It can later be edited to the precise payment date.
       */
      payment_date:
        paymentDate || startDate,

      payment_method: paymentMethod,

      status: "pending",

      reference,

      /*
       * Store both currency amounts explicitly.
       */
      amount_krw: tuitionAmountKrw,

      amount_php: tuitionAmountPhp,
    });

  if (paymentError) {
    console.error(
      "RENEWAL PAYMENT CREATION ERROR:",
      {
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint,
      }
    );

    /*
     * Roll back the contract and renewal enrollment
     * if the payment record cannot be created.
     */
    await supabase
      .from("contracts")
      .delete()
      .eq("id", contract.id);

    await supabase
      .from("enrollments")
      .delete()
      .eq("id", newEnrollment.id);

    return NextResponse.json(
      {
        error: "Failed to create renewal payment record.",
      },
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 5: VERIFY RENEWAL RELATIONSHIP                                   */
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
        start_date
      `
    )
    .eq("id", newEnrollment.id)
    .single();

  if (
    verificationError ||
    !verification ||
    verification.renewal_of !== enrollmentId
  ) {
    console.error(
      "RENEWAL VERIFICATION FAILED:",
      {
        createdEnrollmentId: newEnrollment.id,
        expectedRenewalOf: enrollmentId,
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

  console.log(
    "RENEWAL VERIFIED:",
    verification
  );

  /* ---------------------------------------------------------------------- */
  /* STEP 6: REDIRECT                                                       */
  /* ---------------------------------------------------------------------- */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${studentId}`,
      request.url
    )
  );
}