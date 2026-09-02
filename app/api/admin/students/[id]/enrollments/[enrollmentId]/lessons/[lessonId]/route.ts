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

  /*
   * ------------------------------------------------------------
   * REQUEST BODY
   * ------------------------------------------------------------
   */

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
      {
        error: "Invalid lesson status.",
      },
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
      {
        error: "Invalid lesson resolution.",
      },
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
   * Scheduled lessons do not consume a lesson
   * and cannot have a resolution.
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
   * No-shows consume the lesson and cannot have
   * a resolution.
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
   * Late cancellations consume the lesson and
   * cannot have a resolution.
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
   * ------------------------------------------------------------
   * STUDENT CANCELLATION WITH RESCHEDULING
   * ------------------------------------------------------------
   */

  if (
    status ===
    "student_cancelled_rescheduled"
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
   * ------------------------------------------------------------
   * STUDENT CANCELLATION WITH LESSON CREDIT
   * ------------------------------------------------------------
   */

  if (
    status ===
    "student_cancelled_credit"
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
   * ------------------------------------------------------------
   * UNEXPECTED CIRCUMSTANCE
   * ------------------------------------------------------------
   */

  if (
    status ===
    "unexpected_circumstance"
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
      resolution ===
      "counted_as_completed";
  }

  /*
   * ------------------------------------------------------------
   * TEACHER CANCELLATION
   * ------------------------------------------------------------
   *
   * A teacher cancellation must either be:
   *
   *   - rescheduled
   *   - converted to lesson credit
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
   * CREATE SUPABASE CLIENT
   * ------------------------------------------------------------
   */

  const supabase = await createClient();

  /*
   * ------------------------------------------------------------
   * VERIFY ENROLLMENT ACCESS
   * ------------------------------------------------------------
   *
   * IMPORTANT FOR SHARED ENROLLMENTS
   *
   * We cannot use:
   *
   *   enrollments.student_id = id
   *
   * because shared enrollments use the
   * enrollment_students table.
   *
   * The current student is authorized if they
   * belong to the enrollment through
   * enrollment_students.
   *
   * This works for:
   *
   *   Individual enrollment
   *   Shared enrollment
   */

  const {
    data: enrollmentParticipant,
    error: enrollmentParticipantError,
  } = await supabase
    .from("enrollment_students")
    .select("student_id")
    .eq("enrollment_id", enrollmentId)
    .eq("student_id", id)
    .maybeSingle();

  if (
    enrollmentParticipantError
  ) {
    console.error(
      "ENROLLMENT PARTICIPANT LOOKUP ERROR:",
      {
        code:
          enrollmentParticipantError.code,
        message:
          enrollmentParticipantError.message,
        details:
          enrollmentParticipantError.details,
        hint:
          enrollmentParticipantError.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify enrollment access.",
      },
      { status: 500 }
    );
  }

  /*
   * If the student is not connected to this enrollment,
   * they cannot update its lessons.
   */

  if (!enrollmentParticipant) {
    return NextResponse.json(
      {
        error:
          "You are not a participant in this enrollment.",
      },
      { status: 403 }
    );
  }

  /*
   * ------------------------------------------------------------
   * FIND LESSON
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We identify the lesson by:
   *
   *   lesson.id
   *   lesson.enrollment_id
   *
   * We intentionally DO NOT filter by:
   *
   *   enrollment.student_id
   *
   * because that does not correctly support
   * shared enrollments.
   *
   * Once the current student has been verified
   * as a participant of the enrollment, they can
   * update the shared lesson track.
   */

  const {
    data: lesson,
    error: lessonLookupError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      student_id,
      lesson_number,
      lesson_date,
      original_lesson_date,
      rescheduled_at,
      attendance_status,
      consumes_lesson,
      resolution,
      notes
    `)
    .eq("id", lessonId)
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  if (
    lessonLookupError
  ) {
    console.error(
      "LESSON LOOKUP ERROR:",
      {
        code:
          lessonLookupError.code,
        message:
          lessonLookupError.message,
        details:
          lessonLookupError.details,
        hint:
          lessonLookupError.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "Unable to find lesson.",
        details:
          lessonLookupError.message,
      },
      { status: 500 }
    );
  }

  if (!lesson) {
    return NextResponse.json(
      {
        error: "Lesson not found.",
      },
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
   * ------------------------------------------------------------
   * RESCHEDULING
   * ------------------------------------------------------------
   *
   * Rescheduling changes the date but NEVER
   * changes the lesson number.
   */

  if (resolution === "rescheduled") {
    updateData.original_lesson_date =
      originalLessonDate;

    updateData.lesson_date =
      lessonDate;

    updateData.rescheduled_at =
      new Date().toISOString();
  }

  /*
   * ------------------------------------------------------------
   * NON-RESCHEDULED UPDATE
   * ------------------------------------------------------------
   *
   * Preserve the existing lesson date/history.
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
   * UPDATE LESSON
   * ------------------------------------------------------------
   *
   * The update is performed using the actual lesson ID.
   *
   * This means:
   *
   *   Dasom viewing lesson #2
   *        ↓
   *   lesson.id = ABC
   *        ↓
   *   update lesson ABC
   *
   * and:
   *
   *   Bin viewing lesson #2
   *        ↓
   *   lesson.id = ABC
   *        ↓
   *   update the SAME lesson ABC
   *
   * This is what we want for the shared lesson pool.
   */

  const {
    error: updateError,
  } = await supabase
    .from("lessons")
    .update(updateData)
    .eq("id", lessonId)
    .eq("enrollment_id", enrollmentId);

  if (updateError) {
    console.error(
      "LESSON UPDATE ERROR:",
      {
        code:
          updateError.code,
        message:
          updateError.message,
        details:
          updateError.details,
        hint:
          updateError.hint,
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

  /*
   * ------------------------------------------------------------
   * RETURN UPDATED LESSON
   * ------------------------------------------------------------
   */

  return NextResponse.json({
    success: true,

    lesson: {
      id: lesson.id,

      enrollment_id:
        lesson.enrollment_id,

      student_id:
        lesson.student_id,

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