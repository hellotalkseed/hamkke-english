import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    lessonId: string;
  }>;
}

const ALLOWED_STATUSES = [
  "scheduled",
  "completed",
  "rescheduled",
  "teacher_cancelled",
  "unexpected_circumstance",
];

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { lessonId } = await params;

  if (!lessonId) {
    return NextResponse.json(
      {
        error: "Lesson ID is required.",
      },
      {
        status: 400,
      }
    );
  }

  const formData = await request.formData();

  const attendanceStatus =
    String(
      formData.get("attendance_status") ?? ""
    );

  const notesValue =
    String(formData.get("notes") ?? "");

  const notes =
    notesValue.trim() || null;

  /*
   * Validate lesson status.
   */

  if (
    !ALLOWED_STATUSES.includes(
      attendanceStatus
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid lesson status.",
      },
      {
        status: 400,
      }
    );
  }

  const supabase =
    await createClient();

  /*
   * Make sure the lesson exists
   * and get its enrollment/student.
   */

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      enrollments (
        id,
        student_id
      )
    `)
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json(
      {
        error:
          lessonError?.message ??
          "Lesson not found.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * Update the lesson.
   */

  const {
    error: updateError,
  } = await supabase
    .from("lessons")
    .update({
      attendance_status:
        attendanceStatus,

      notes,
    })
    .eq("id", lessonId);

  if (updateError) {
    return NextResponse.json(
      {
        error:
          updateError.message,
      },
      {
        status: 500,
      }
    );
  }

  /*
   * Redirect back to the lesson page
   * after a successful update.
   */

  return NextResponse.redirect(
    new URL(
      `/en/admin/lessons/${lessonId}?saved=true`,
      request.url
    )
  );
}