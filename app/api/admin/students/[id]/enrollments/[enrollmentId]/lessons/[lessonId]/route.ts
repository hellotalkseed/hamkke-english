import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
    lessonId: string;
  }>;
}

const VALID_STATUSES = [
  "scheduled",
  "completed",
  "no_show",
  "late_cancellation",
  "student_cancelled_rescheduled",
  "student_cancelled_credit",
  "unexpected_circumstance",
  "teacher_cancelled",
] as const;

const VALID_RESOLUTIONS = [
  "rescheduled",
  "lesson_credit",
  "counted_as_completed",
] as const;

type Status = (typeof VALID_STATUSES)[number];
type Resolution = (typeof VALID_RESOLUTIONS)[number];

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { id, enrollmentId, lessonId } = await params;

  const body = await request.json();

  const status = body.status as Status;
  const resolution =
    body.resolution === null ||
    body.resolution === undefined ||
    body.resolution === ""
      ? null
      : (body.resolution as Resolution);

  const lessonDate =
    body.lesson_date === null ||
    body.lesson_date === undefined ||
    body.lesson_date === ""
      ? null
      : String(body.lesson_date);

  const notes =
    body.notes === null ||
    body.notes === undefined ||
    body.notes === ""
      ? null
      : String(body.notes);

  /*
   * ------------------------------------------------------------
   * VALIDATE STATUS
   * ------------------------------------------------------------
   */

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid lesson status." },
      { status: 400 }
    );
  }

  /*
   * ------------------------------------------------------------
   * VALIDATE RESOLUTION
   * ------------------------------------------------------------
   */

  if (
    resolution !== null &&
    !VALID_RESOLUTIONS.includes(resolution)
  ) {
    return NextResponse.json(
      { error: "Invalid lesson resolution." },
      { status: 400 }
    );
  }

  /*
   * ------------------------------------------------------------
   * APPLY POLICY RULES
   * ------------------------------------------------------------
   */

  let consumesLesson = false;

  /*
   * These outcomes consume the lesson.
   */

  if (
    status === "completed" ||
    status === "no_show" ||
    status === "late_cancellation"
  ) {
    consumesLesson = true;
  }

  /*
   * Scheduled lessons have no resolution
   * and do not consume the lesson.
   */

  if (status === "scheduled") {
    if (resolution !== null) {
      return NextResponse.json(
        {
          error:
            "A scheduled lesson cannot have a resolution.",
        },
        { status: 400 }
      );
    }

    consumesLesson = false;
  }

  /*
   * Completed lessons do not require a resolution.
   */

  if (
    status === "completed" &&
    resolution !== null
  ) {
    return NextResponse.json(
      {
        error:
          "A completed lesson cannot have a resolution.",
      },
      { status: 400 }
    );
  }

  /*
   * No-shows consume the lesson.
   */

  if (
    status === "no_show" &&
    resolution !== null
  ) {
    return NextResponse.json(
      {
        error:
          "A no-show cannot have a resolution.",
      },
      { status: 400 }
    );
  }

  /*
   * Late cancellations consume the lesson.
   */

  if (
    status === "late_cancellation" &&
    resolution !== null
  ) {
    return NextResponse.json(
      {
        error:
          "A late cancellation cannot have a resolution.",
      },
      { status: 400 }
    );
  }

  /*
   * Student cancellation with rescheduling.
   */

  if (
    status === "student_cancelled_rescheduled"
  ) {
    if (resolution !== "rescheduled") {
      return NextResponse.json(
        {
          error:
            "Student cancellation with rescheduling requires the rescheduled resolution.",
        },
        { status: 400 }
      );
    }

    if (!lessonDate) {
      return NextResponse.json(
        {
          error:
            "A new lesson date is required when rescheduling.",
        },
        { status: 400 }
      );
    }

    consumesLesson = false;
  }

  /*
   * Student cancellation with lesson credit.
   */

  if (
    status === "student_cancelled_credit"
  ) {
    if (resolution !== "lesson_credit") {
      return NextResponse.json(
        {
          error:
            "Student cancellation with credit requires the lesson credit resolution.",
        },
        { status: 400 }
      );
    }

    consumesLesson = false;
  }

  /*
   * Unexpected circumstances require
   * an explicit resolution.
   */

  if (
    status === "unexpected_circumstance"
  ) {
    if (
      resolution !== "rescheduled" &&
      resolution !== "lesson_credit" &&
      resolution !== "counted_as_completed"
    ) {
      return NextResponse.json(
        {
          error:
            "Unexpected circumstance requires a resolution.",
        },
        { status: 400 }
      );
    }

    if (
      resolution === "rescheduled" &&
      !lessonDate
    ) {
      return NextResponse.json(
        {
          error:
            "A new lesson date is required when rescheduling.",
        },
        { status: 400 }
      );
    }

    consumesLesson =
      resolution === "counted_as_completed";
  }

  /*
 * Teacher cancellation.
 *
 * A teacher cancellation must either be rescheduled
 * or converted into lesson credit.
 *
 * It never consumes the student's lesson.
 */

if (status === "teacher_cancelled") {
  if (
    resolution !== "rescheduled" &&
    resolution !== "lesson_credit"
  ) {
    return NextResponse.json(
      {
        error:
          "Teacher cancellation requires either rescheduling or lesson credit.",
      },
      { status: 400 }
    );
  }

  if (
    resolution === "rescheduled" &&
    !lessonDate
  ) {
    return NextResponse.json(
      {
        error:
          "A new lesson date is required when rescheduling.",
      },
      { status: 400 }
    );
  }

  consumesLesson = false;
}

  /*
   * ------------------------------------------------------------
   * FIND LESSON
   * ------------------------------------------------------------
   */

  const supabase = await createClient();

  const {
    data: lesson,
    error: lessonLookupError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      lesson_number,
      lesson_date,
      original_lesson_date,
      rescheduled_at,
      attendance_status,
      consumes_lesson,
      resolution,
      enrollment:enrollments!inner (
        id,
        student_id
      )
    `)
    .eq("id", lessonId)
    .eq("enrollment_id", enrollmentId)
    .eq("enrollment.student_id", id)
    .single();

  if (lessonLookupError || !lesson) {
    return NextResponse.json(
      { error: "Lesson not found." },
      { status: 404 }
    );
  }

  /*
   * ------------------------------------------------------------
   * PRESERVE ORIGINAL DATE
   * ------------------------------------------------------------
   *
   * The first time a lesson is rescheduled, its original
   * lesson date is preserved permanently.
   *
   * Lesson number never changes.
   */

  const originalLessonDate =
    lesson.original_lesson_date ??
    lesson.lesson_date;

  /*
   * ------------------------------------------------------------
   * BUILD UPDATE
   * ------------------------------------------------------------
   */

  const updateData: {
    attendance_status: Status;
    consumes_lesson: boolean;
    resolution: Resolution | null;
    notes: string | null;
    original_lesson_date?: string | null;
    lesson_date?: string | null;
    rescheduled_at?: string | null;
  } = {
    attendance_status: status,
    consumes_lesson: consumesLesson,
    resolution,
    notes,
  };

  /*
   * Rescheduling changes the date but NEVER
   * changes the lesson number.
   */

  if (resolution === "rescheduled") {
    updateData.original_lesson_date =
      originalLessonDate;

    updateData.lesson_date = lessonDate;

    updateData.rescheduled_at =
      new Date().toISOString();
  }

  /*
   * If the lesson is not being rescheduled,
   * preserve its existing date/history.
   */

  if (resolution !== "rescheduled") {
    updateData.lesson_date =
      lesson.lesson_date;

    updateData.original_lesson_date =
      lesson.original_lesson_date ??
      lesson.lesson_date;

    updateData.rescheduled_at =
      lesson.rescheduled_at;
  }

  /*
   * ------------------------------------------------------------
   * UPDATE
   * ------------------------------------------------------------
   */

  const {
    error: updateError,
  } = await supabase
    .from("lessons")
    .update(updateData)
    .eq("id", lessonId);

  if (updateError) {
    console.error(
      "LESSON UPDATE ERROR:",
      {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "Unable to update lesson.",
        details:
          updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    lesson: {
      id: lesson.id,
      lesson_number:
        lesson.lesson_number,
      status,
      consumes_lesson:
        consumesLesson,
      resolution,
      original_lesson_date:
        originalLessonDate,
      lesson_date:
        resolution === "rescheduled"
          ? lessonDate
          : lesson.lesson_date,
    },
  });
}