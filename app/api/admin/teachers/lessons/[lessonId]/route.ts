import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ATTENDANCE_STATUSES = [
  "scheduled",
  "completed",
  "student_cancelled_credit",
  "teacher_cancelled",
  "unexpected_circumstance",
] as const;

type AttendanceStatus =
  (typeof VALID_ATTENDANCE_STATUSES)[number];

interface RouteContext {
  params: Promise<{
    lessonId: string;
  }>;
}

async function getActiveTeacher() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select("id, full_name, role, status")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    return {
      error: NextResponse.json(
        {
          error:
            "Only active teachers can access teacher lessons.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    profile,
    admin,
  };
}

async function getAssignedLesson(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string,
  lessonId: string
) {
  const {
    data: lesson,
    error: lessonError,
  } = await admin
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      lesson_number,
      lesson_date,
      duration,
      attendance_status,
      notes,
      teacher_observation,
      consumes_lesson,
      actual_teacher_id
    `)
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      ),
    };
  }

  const {
    data: enrollmentStudents,
    error: enrollmentStudentsError,
  } = await admin
    .from("enrollment_students")
    .select(`
      id,
      enrollment_id,
      student_id
    `)
    .eq("enrollment_id", lesson.enrollment_id);

  if (enrollmentStudentsError) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            enrollmentStudentsError.message,
        },
        { status: 500 }
      ),
    };
  }

  const enrollmentStudentIds =
    (enrollmentStudents || []).map(
      (item) => item.id
    );

  if (enrollmentStudentIds.length === 0) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            "No student is connected to this lesson.",
        },
        { status: 403 }
      ),
    };
  }

  const {
    data: assignments,
    error: assignmentsError,
  } = await admin
    .from("teacher_assignments")
    .select(`
      id,
      enrollment_student_id,
      start_date,
      end_date,
      status
    `)
    .eq("teacher_id", teacherId)
    .eq("status", "active")
    .in(
      "enrollment_student_id",
      enrollmentStudentIds
    );

  if (assignmentsError) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            assignmentsError.message,
        },
        { status: 500 }
      ),
    };
  }

  if (
    !assignments ||
    assignments.length === 0
  ) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            "You are not assigned to this lesson.",
        },
        { status: 403 }
      ),
    };
  }

  const assignedEnrollmentStudentId =
    assignments[0].enrollment_student_id;

  const enrollmentStudent =
    (enrollmentStudents || []).find(
      (item) =>
        item.id ===
        assignedEnrollmentStudentId
    );

  if (!enrollmentStudent) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            "The assigned student could not be found.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    lesson,
    enrollmentStudent,
    error: null,
  };
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await getActiveTeacher();

    if (auth.error) {
      return auth.error;
    }

    const { user, profile, admin } = auth;
    const { lessonId } = await context.params;

    const {
      lesson,
      enrollmentStudent,
      error,
    } = await getAssignedLesson(
      admin,
      user.id,
      lessonId
    );

    if (error) {
      return error;
    }

    if (!lesson || !enrollmentStudent) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    const {
      data: student,
      error: studentError,
    } = await admin
      .from("students")
      .select(`
        id,
        student_number,
        full_name,
        preferred_name
      `)
      .eq(
        "id",
        enrollmentStudent.student_id
      )
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          error:
            "Student information could not be loaded.",
        },
        { status: 500 }
      );
    }

    const {
      data: enrollment,
      error: enrollmentError,
    } = await admin
      .from("enrollments")
      .select(`
        id,
        package_name,
        status
      `)
      .eq(
        "id",
        lesson.enrollment_id
      )
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        {
          error:
            "Enrollment information could not be loaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: profile.id,
        full_name: profile.full_name,
      },

      lesson: {
        id: lesson.id,

        enrollment_id:
          lesson.enrollment_id,

        enrollment_student_id:
          enrollmentStudent.id,

        lesson_number:
          lesson.lesson_number,

        lesson_date:
          lesson.lesson_date,

        duration:
          lesson.duration,

        attendance_status:
          lesson.attendance_status,

        notes:
          lesson.notes,

        teacher_observation:
          lesson.teacher_observation,

        consumes_lesson:
          lesson.consumes_lesson,

        actual_teacher_id:
          lesson.actual_teacher_id,

        student,

        enrollment,
      },
    });
  } catch (error) {
    console.error(
      "Teacher lesson detail error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the lesson.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await getActiveTeacher();

    if (auth.error) {
      return auth.error;
    }

    const { user, admin } = auth;
    const { lessonId } = await context.params;

    const {
      lesson,
      error,
    } = await getAssignedLesson(
      admin,
      user.id,
      lessonId
    );

    if (error) {
      return error;
    }

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    let body: {
      attendance_status?: string;
      notes?: string | null;
      teacher_observation?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const hasAttendanceStatus =
      Object.prototype.hasOwnProperty.call(
        body,
        "attendance_status"
      );

    const hasNotes =
      Object.prototype.hasOwnProperty.call(
        body,
        "notes"
      );

    const hasTeacherObservation =
      Object.prototype.hasOwnProperty.call(
        body,
        "teacher_observation"
      );

    if (
      !hasAttendanceStatus &&
      !hasNotes &&
      !hasTeacherObservation
    ) {
      return NextResponse.json(
        {
          error:
            "No lesson information was provided.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------
     * ATTENDANCE UPDATE
     * --------------------------------
     */

    if (hasAttendanceStatus) {
      const attendanceStatus =
        body.attendance_status;

      if (
        typeof attendanceStatus !== "string" ||
        !VALID_ATTENDANCE_STATUSES.includes(
          attendanceStatus as AttendanceStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid attendance status.",
            allowed_statuses:
              VALID_ATTENDANCE_STATUSES,
          },
          { status: 400 }
        );
      }

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          attendance_status:
            attendanceStatus,

          actual_teacher_id:
            attendanceStatus === "completed"
              ? user.id
              : lesson.actual_teacher_id,
        })
        .eq("id", lessonId)
        .select(`
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id
        `)
        .single();

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Lesson attendance updated successfully.",

        lesson: updatedLesson,
      });
    }

    /*
     * --------------------------------
     * LESSON NOTES UPDATE
     * --------------------------------
     */

    if (hasNotes) {
      if (
        body.notes !== null &&
        typeof body.notes !== "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Lesson notes must be text or null.",
          },
          { status: 400 }
        );
      }

      const cleanedNotes =
        body.notes?.trim() || null;

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          notes: cleanedNotes,
        })
        .eq("id", lessonId)
        .select(`
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id
        `)
        .single();

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Lesson notes saved successfully.",

        lesson: updatedLesson,
      });
    }

    /*
     * --------------------------------
     * TEACHER OBSERVATION UPDATE
     * --------------------------------
     */

    if (hasTeacherObservation) {
      if (
        body.teacher_observation !== null &&
        typeof body.teacher_observation !==
          "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Teacher observation must be text or null.",
          },
          { status: 400 }
        );
      }

      const cleanedObservation =
        body.teacher_observation?.trim() || null;

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          teacher_observation:
            cleanedObservation,
        })
        .eq("id", lessonId)
        .select(`
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id
        `)
        .single();

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Teacher observation saved successfully.",

        lesson: updatedLesson,
      });
    }

    return NextResponse.json(
      {
        error:
          "Nothing was updated.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Teacher lesson update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the lesson.",
      },
      { status: 500 }
    );
  }
}