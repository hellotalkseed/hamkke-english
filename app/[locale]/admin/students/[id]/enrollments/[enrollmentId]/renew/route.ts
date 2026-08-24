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

  const packageName =
    String(formData.get("package_name") ?? "").trim();

  const numberOfLessons = Number(
    formData.get("number_of_lessons")
  );

  const lessonDuration = Number(
    formData.get("lesson_duration")
  );

  const lessonsPerWeek = Number(
    formData.get("lessons_per_week")
  );

  const startDate =
    String(formData.get("start_date") ?? "").trim();

  if (
    !packageName ||
    !numberOfLessons ||
    !lessonDuration ||
    !lessonsPerWeek ||
    !startDate
  ) {
    return NextResponse.json(
      {
        error: "Please complete all required fields.",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  /*
   * Get the existing enrollment.
   *
   * The existing schedule information is copied
   * into the new renewal so the student does not
   * have to enter it again.
   */
  const {
    data: previousEnrollment,
    error: previousError,
  } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      schedule_days,
      schedule_time
    `)
    .eq("id", enrollmentId)
    .eq("student_id", studentId)
    .single();

  if (previousError || !previousEnrollment) {
    return NextResponse.json(
      {
        error: "Previous enrollment not found.",
      },
      { status: 404 }
    );
  }

  /*
   * Create the new enrollment as pending.
   *
   * The previous enrollment is not modified.
   * This preserves the student's enrollment history.
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
      start_date: startDate,
      status: "pending",
      schedule_days:
        previousEnrollment.schedule_days,
      schedule_time:
        previousEnrollment.schedule_time,
    })
    .select("id")
    .single();

  if (enrollmentError || !newEnrollment) {
    console.error(
      "Failed to create renewal:",
      enrollmentError
    );

    return NextResponse.json(
      {
        error: "Failed to create renewal.",
      },
      { status: 500 }
    );
  }

  /*
   * Redirect back to the student's record.
   */
  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${studentId}`,
      request.url
    )
  );
}