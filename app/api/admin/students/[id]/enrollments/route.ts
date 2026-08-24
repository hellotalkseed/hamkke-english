import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  const formData = await request.formData();

  const packageName = String(
    formData.get("package_name") || ""
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

  const startDate = String(
    formData.get("start_date") || ""
  ).trim();

  const tuitionAmount = Number(
    formData.get("tuition_amount")
  );

  const currency = String(
    formData.get("currency") || "KRW"
  ).trim();

  const renewalOfValue = String(
    formData.get("renewal_of") || ""
  ).trim();

  const renewalOf = renewalOfValue || null;

  const scheduleDays = formData
    .getAll("schedule_days")
    .map((day) => String(day).trim())
    .filter(Boolean);

  const scheduleTimeValue = String(
    formData.get("schedule_time") || ""
  ).trim();

  const scheduleTime =
    scheduleTimeValue || null;

  const locale = String(
    formData.get("locale") || "en"
  ).trim();

  /* ---------------------------------------------------------------------- */
  /* VALIDATION                                                             */
  /* ---------------------------------------------------------------------- */

  if (!packageName) {
    return new NextResponse(
      "Package name is required.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(numberOfLessons) ||
    numberOfLessons < 1
  ) {
    return new NextResponse(
      "Number of lessons must be at least 1.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(lessonDuration) ||
    lessonDuration < 1
  ) {
    return new NextResponse(
      "Lesson duration must be at least 1 minute.",
      { status: 400 }
    );
  }

  if (
    !Number.isInteger(lessonsPerWeek) ||
    lessonsPerWeek < 1
  ) {
    return new NextResponse(
      "Lessons per week must be at least 1.",
      { status: 400 }
    );
  }

  if (!startDate) {
    return new NextResponse(
      "Start date is required.",
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(tuitionAmount) ||
    tuitionAmount < 0
  ) {
    return new NextResponse(
      "Tuition amount is required.",
      { status: 400 }
    );
  }

  if (!currency) {
    return new NextResponse(
      "Currency is required.",
      { status: 400 }
    );
  }

  const supabase = await createClient();

  /* ---------------------------------------------------------------------- */
  /* STEP 1: CONFIRM STUDENT                                               */
  /* ---------------------------------------------------------------------- */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    return new NextResponse(
      "Student not found.",
      { status: 404 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 2: VALIDATE PREVIOUS ENROLLMENT                                  */
  /* ---------------------------------------------------------------------- */

  if (renewalOf) {
    const {
      data: previousEnrollment,
      error: previousEnrollmentError,
    } = await supabase
      .from("enrollments")
      .select("id, student_id")
      .eq("id", renewalOf)
      .eq("student_id", id)
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
          code: previousEnrollmentError?.code,
          message:
            previousEnrollmentError?.message,
          details:
            previousEnrollmentError?.details,
          hint: previousEnrollmentError?.hint,
        }
      );

      return new NextResponse(
        "Previous enrollment not found.",
        { status: 400 }
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 3: CREATE ENROLLMENT                                              */
  /* ---------------------------------------------------------------------- */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .insert({
      student_id: id,
      package_name: packageName,
      number_of_lessons: numberOfLessons,
      lesson_duration: lessonDuration,
      lessons_per_week: lessonsPerWeek,
      start_date: startDate,
      status: "pending",
      tuition_amount: tuitionAmount,
      currency,
      schedule_days: scheduleDays,
      schedule_time: scheduleTime,
      renewal_of: renewalOf,
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

  if (enrollmentError || !enrollment) {
    console.error(
      "ENROLLMENT CREATION ERROR:",
      {
        code: enrollmentError?.code,
        message: enrollmentError?.message,
        details: enrollmentError?.details,
        hint: enrollmentError?.hint,
      }
    );

    return new NextResponse(
      `Unable to create enrollment.

Code: ${
        enrollmentError?.code || "unknown"
      }

Message: ${
        enrollmentError?.message || "unknown"
      }

Details: ${
        enrollmentError?.details || "none"
      }

Hint: ${
        enrollmentError?.hint || "none"
      }`,
      { status: 500 }
    );
  }

  console.log(
    "ENROLLMENT CREATED:",
    enrollment
  );

  /* ---------------------------------------------------------------------- */
  /* STEP 4: CREATE CONTRACT                                                */
  /* ---------------------------------------------------------------------- */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id: enrollment.id,
      status: "for_review",
    })
    .select("id")
    .single();

  if (contractError || !contract) {
    console.error(
      "CONTRACT CREATION ERROR:",
      {
        code: contractError?.code,
        message: contractError?.message,
        details: contractError?.details,
        hint: contractError?.hint,
      }
    );

    await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollment.id);

    return new NextResponse(
      `Unable to create contract.

Code: ${
        contractError?.code || "unknown"
      }

Message: ${
        contractError?.message || "unknown"
      }

Details: ${
        contractError?.details || "none"
      }

Hint: ${
        contractError?.hint || "none"
      }`,
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 5: CREATE PAYMENT                                                 */
  /* ---------------------------------------------------------------------- */

  const {
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      enrollment_id: enrollment.id,
      amount: tuitionAmount,
      currency,
      payment_date: startDate,
      payment_method: "pending",
      status: "pending",
    });

  if (paymentError) {
    console.error(
      "PAYMENT CREATION ERROR:",
      {
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint,
      }
    );

    await supabase
      .from("contracts")
      .delete()
      .eq("id", contract.id);

    await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollment.id);

    return new NextResponse(
      `Unable to create payment record.

Code: ${
        paymentError.code || "unknown"
      }

Message: ${
        paymentError.message || "unknown"
      }

Details: ${
        paymentError.details || "none"
      }

Hint: ${
        paymentError.hint || "none"
      }`,
      { status: 500 }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 6: VERIFY RENEWAL                                                */
  /* ---------------------------------------------------------------------- */

  if (renewalOf) {
    const {
      data: verification,
      error: verificationError,
    } = await supabase
      .from("enrollments")
      .select("id, renewal_of")
      .eq("id", enrollment.id)
      .single();

    if (
      verificationError ||
      !verification ||
      verification.renewal_of !== renewalOf
    ) {
      console.error(
        "RENEWAL VERIFICATION FAILED:",
        {
          createdEnrollmentId: enrollment.id,
          expectedRenewalOf: renewalOf,
          verification,
          verificationError,
        }
      );

      return new NextResponse(
        "Enrollment was created, but the renewal relationship could not be verified.",
        { status: 500 }
      );
    }

    console.log(
      "RENEWAL VERIFIED:",
      verification
    );
  }

  /* ---------------------------------------------------------------------- */
  /* STEP 7: REDIRECT                                                       */
  /* ---------------------------------------------------------------------- */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}