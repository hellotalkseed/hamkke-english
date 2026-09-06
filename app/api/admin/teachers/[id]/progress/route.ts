import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type TeacherAssignment = {
  id: string;
  enrollment_student_id: string;
  teacher_id: string;
  status: string;
};

type EnrollmentStudent = {
  id: string;
  enrollment_id: string;
};

type LessonProgress = {
  enrollment_id: string;
  lesson_number: number;
  consumes_lesson: boolean;
};

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const supabase = await createClient();

    const { id: teacherId } = await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error: "Teacher ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* AUTHENTICATION                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Error getting authenticated user:",
        userError
      );

      return NextResponse.json(
        {
          error: "Unable to verify your account.",
        },
        {
          status: 500,
        }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* PROFILE                                                               */
    /* --------------------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Error loading current profile:",
        profileError
      );

      return NextResponse.json(
        {
          error: "Unable to verify your permissions.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Your profile could not be found.",
        },
        {
          status: 403,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* OWNER / ADMIN ACCESS                                                  */
    /* --------------------------------------------------------------------- */

    const role = String(
      profile.role || ""
    ).toLowerCase();

    if (
      role !== "owner" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "Only owners and administrators can access teacher progress.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      profile.status &&
      String(profile.status).toLowerCase() !==
        "active"
    ) {
      return NextResponse.json(
        {
          error: "Your account is not active.",
        },
        {
          status: 403,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY TEACHER                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", teacherId)
      .maybeSingle();

    if (teacherError) {
      console.error(
        "Error loading teacher:",
        teacherError
      );

      return NextResponse.json(
        {
          error: "Unable to load teacher.",
        },
        {
          status: 500,
        }
      );
    }

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher could not be found.",
        },
        {
          status: 404,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* ACTIVE ASSIGNMENTS                                                    */
    /* --------------------------------------------------------------------- */

    const {
      data: rawAssignments,
      error: assignmentsError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        "id, enrollment_student_id, teacher_id, status"
      )
      .eq("teacher_id", teacherId)
      .eq("status", "active");

    if (assignmentsError) {
      console.error(
        "Error loading teacher assignments:",
        assignmentsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load teacher assignments.",
        },
        {
          status: 500,
        }
      );
    }

    const assignments: TeacherAssignment[] =
      Array.isArray(rawAssignments)
        ? rawAssignments
            .filter(
              (
                assignment: unknown
              ): assignment is Record<
                string,
                unknown
              > =>
                Boolean(
                  assignment &&
                    typeof assignment ===
                      "object"
                )
            )
            .map(
              (
                assignment: Record<
                  string,
                  unknown
                >
              ): TeacherAssignment => ({
                id: String(
                  assignment.id || ""
                ),
                enrollment_student_id:
                  String(
                    assignment.enrollment_student_id ||
                      ""
                  ),
                teacher_id: String(
                  assignment.teacher_id ||
                    ""
                ),
                status: String(
                  assignment.status || ""
                ),
              })
            )
            .filter(
              (
                assignment: TeacherAssignment
              ) =>
                assignment.id &&
                assignment.enrollment_student_id &&
                assignment.teacher_id
            )
        : [];

    /* --------------------------------------------------------------------- */
    /* NO ASSIGNMENTS                                                        */
    /* --------------------------------------------------------------------- */

    if (assignments.length === 0) {
      return NextResponse.json({
        lessons: [],
      });
    }

    /* --------------------------------------------------------------------- */
    /* ENROLLMENT STUDENTS                                                   */
    /* --------------------------------------------------------------------- */

    const enrollmentStudentIds =
      assignments.map(
        (
          assignment: TeacherAssignment
        ) =>
          assignment.enrollment_student_id
      );

    const {
      data: rawEnrollmentStudents,
      error: enrollmentStudentsError,
    } = await supabase
      .from("enrollment_students")
      .select("id, enrollment_id")
      .in(
        "id",
        enrollmentStudentIds
      );

    if (enrollmentStudentsError) {
      console.error(
        "Error loading enrollment students:",
        enrollmentStudentsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load enrollment information.",
        },
        {
          status: 500,
        }
      );
    }

    const enrollmentStudents: EnrollmentStudent[] =
      Array.isArray(
        rawEnrollmentStudents
      )
        ? rawEnrollmentStudents
            .filter(
              (
                item: unknown
              ): item is Record<
                string,
                unknown
              > =>
                Boolean(
                  item &&
                    typeof item ===
                      "object"
                )
            )
            .map(
              (
                item: Record<
                  string,
                  unknown
                >
              ): EnrollmentStudent => ({
                id: String(
                  item.id || ""
                ),
                enrollment_id: String(
                  item.enrollment_id ||
                    ""
                ),
              })
            )
            .filter(
              (
                item: EnrollmentStudent
              ) =>
                item.id &&
                item.enrollment_id
            )
        : [];

    /* --------------------------------------------------------------------- */
    /* MAP ASSIGNMENT -> ENROLLMENT                                          */
    /* --------------------------------------------------------------------- */

    const enrollmentIds =
      enrollmentStudents.map(
        (
          item: EnrollmentStudent
        ) => item.enrollment_id
      );

    const uniqueEnrollmentIds =
      Array.from(
        new Set(enrollmentIds)
      );

    if (
      uniqueEnrollmentIds.length === 0
    ) {
      return NextResponse.json({
        lessons: [],
      });
    }

    /* --------------------------------------------------------------------- */
    /* ACTUAL LESSON RECORDS                                                 */
    /* --------------------------------------------------------------------- */

    const {
      data: rawLessons,
      error: lessonsError,
    } = await supabase
      .from("lessons")
      .select(
        "enrollment_id, lesson_number, consumes_lesson"
      )
      .in(
        "enrollment_id",
        uniqueEnrollmentIds
      )
      .order(
        "enrollment_id",
        {
          ascending: true,
        }
      )
      .order(
        "lesson_number",
        {
          ascending: true,
        }
      );

    if (lessonsError) {
      console.error(
        "Error loading lesson progress:",
        lessonsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load lesson progress.",
        },
        {
          status: 500,
        }
      );
    }

    /* --------------------------------------------------------------------- */
    /* NORMALIZE LESSONS                                                     */
    /* --------------------------------------------------------------------- */

    const lessons: LessonProgress[] =
      Array.isArray(rawLessons)
        ? rawLessons
            .filter(
              (
                item: unknown
              ): item is Record<
                string,
                unknown
              > =>
                Boolean(
                  item &&
                    typeof item ===
                      "object"
                )
            )
            .map(
              (
                item: Record<
                  string,
                  unknown
                >
              ): LessonProgress => ({
                enrollment_id:
                  String(
                    item.enrollment_id ||
                      ""
                  ),
                lesson_number:
                  Number(
                    item.lesson_number ||
                      0
                  ),
                consumes_lesson:
                  item.consumes_lesson ===
                  true,
              })
            )
            .filter(
              (
                item: LessonProgress
              ) =>
                item.enrollment_id &&
                item.lesson_number > 0
            )
        : [];

    /* --------------------------------------------------------------------- */
    /* RETURN                                                               */
    /* --------------------------------------------------------------------- */

    return NextResponse.json({
      lessons,
    });
  } catch (error) {
    console.error(
      "Unexpected error loading teacher progress:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load teacher progress.",
      },
      {
        status: 500,
      }
    );
  }
}