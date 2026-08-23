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

  // Multiple checkboxes can submit multiple schedule_days values.
  const scheduleDays = formData
    .getAll("schedule_days")
    .map((day) => String(day).trim())
    .filter(Boolean);

  // Time is optional because it may not have been confirmed yet.
  const scheduleTimeValue = String(
    formData.get("schedule_time") || ""
  ).trim();

  const scheduleTime = scheduleTimeValue || null;

  const locale = String(
    formData.get("locale") || "en"
  ).trim();

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

  /*
   * STEP 1
   * Confirm that the student exists.
   */
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

  /*
   * STEP 2
   * Create the enrollment in pending status.
   *
   * schedule_days contains the selected recurring days.
   * schedule_time is nullable because the lesson time
   * may still be "To be confirmed".
   */
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
    })
    .select("id")
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

Code: ${enrollmentError?.code || "unknown"}

Message: ${enrollmentError?.message || "unknown"}

Details: ${enrollmentError?.details || "none"}

Hint: ${enrollmentError?.hint || "none"}`,
      { status: 500 }
    );
  }

  /*
   * STEP 3
   * Create the contract in for_review status.
   */
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

    // Roll back the enrollment if contract creation fails.
    await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollment.id);

    return new NextResponse(
      `Unable to create contract.

Code: ${contractError?.code || "unknown"}

Message: ${contractError?.message || "unknown"}

Details: ${contractError?.details || "none"}

Hint: ${contractError?.hint || "none"}`,
      { status: 500 }
    );
  }

  /*
   * STEP 4
   * Create the payment record in pending status.
   *
   * payment_date is required by the database, so the
   * enrollment start date is used as the initial date.
   * This does NOT mean payment has been confirmed.
   */
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

    // Roll back the contract.
    await supabase
      .from("contracts")
      .delete()
      .eq("id", contract.id);

    // Roll back the enrollment.
    await supabase
      .from("enrollments")
      .delete()
      .eq("id", enrollment.id);

    return new NextResponse(
      `Unable to create payment record.

Code: ${paymentError.code || "unknown"}

Message: ${paymentError.message || "unknown"}

Details: ${paymentError.details || "none"}

Hint: ${paymentError.hint || "none"}`,
      { status: 500 }
    );
  }

  /*
   * Lessons are intentionally NOT created here.
   *
   * They should be generated only when payment is confirmed
   * and the enrollment becomes active.
   */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}