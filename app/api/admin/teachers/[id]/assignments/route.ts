import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* ========================================================================= */
/* AUTHENTICATION                                                            */
/* ========================================================================= */

async function getActiveOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "owner" ||
    profile.status !== "active"
  ) {
    return {
      supabase,
      error: NextResponse.json(
        {
          error:
            "Only active owners can manage teacher assignments.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    error: null,
  };
}

/* ========================================================================= */
/* GET                                                                       */
/* Load this teacher's active assignments.                                   */
/* ========================================================================= */

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const ownerResult = await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } = ownerResult;
    const { id: teacherId } = await context.params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required." },
        { status: 400 }
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
      .select(
        "id, full_name, role, status, teacher_number, created_at"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error: "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* GET ACTIVE ASSIGNMENTS                                                */
    /* --------------------------------------------------------------------- */

    const {
      data: assignments,
      error: assignmentsError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        `
          id,
          enrollment_student_id,
          teacher_id,
          start_date,
          end_date,
          status,
          created_at
        `
      )
      .eq("teacher_id", teacherId)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (assignmentsError) {
      console.error(
        "Teacher assignments fetch error:",
        assignmentsError
      );

      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* GET ENROLLMENT-STUDENT RECORDS                                        */
    /* --------------------------------------------------------------------- */

    const enrollmentStudentIds =
      (assignments || []).map(
        (assignment) =>
          assignment.enrollment_student_id
      );

    if (enrollmentStudentIds.length === 0) {
      return NextResponse.json({
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          role: teacher.role,
          status: teacher.status,
          teacher_number: teacher.teacher_number,
          created_at: teacher.created_at,
        },
        assignments: [],
      });
    }

    const {
      data: enrollmentStudents,
      error: enrollmentStudentsError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          id,
          enrollment_id,
          student_id,
          students (
            id,
            student_number,
            full_name,
            preferred_name
          ),
          enrollments (
            id,
            package_name,
            status
          )
        `
      )
      .in("id", enrollmentStudentIds);

    if (enrollmentStudentsError) {
      console.error(
        "Enrollment students fetch error:",
        enrollmentStudentsError
      );

      return NextResponse.json(
        {
          error:
            enrollmentStudentsError.message,
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* FORMAT ASSIGNMENTS                                                   */
    /* --------------------------------------------------------------------- */

    const formattedAssignments =
      (assignments || []).map(
        (assignment) => {
          const enrollmentStudent =
            enrollmentStudents?.find(
              (item) =>
                item.id ===
                assignment.enrollment_student_id
            );

          const student = Array.isArray(
            enrollmentStudent?.students
          )
            ? enrollmentStudent.students[0]
            : enrollmentStudent?.students;

          const enrollment = Array.isArray(
            enrollmentStudent?.enrollments
          )
            ? enrollmentStudent.enrollments[0]
            : enrollmentStudent?.enrollments;

          return {
            id: assignment.id,

            enrollment_student_id:
              assignment.enrollment_student_id,

            teacher_id:
              assignment.teacher_id,

            start_date:
              assignment.start_date,

            end_date:
              assignment.end_date,

            status:
              assignment.status,

            student: student
              ? {
                  id: student.id,
                  student_number:
                    student.student_number,
                  full_name:
                    student.full_name,
                  preferred_name:
                    student.preferred_name,
                }
              : null,

            enrollment: enrollment
              ? {
                  id: enrollment.id,
                  package_name:
                    enrollment.package_name,
                  status:
                    enrollment.status,
                }
              : null,
          };
        }
      );

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        role: teacher.role,
        status: teacher.status,
        teacher_number:
          teacher.teacher_number,
        created_at:
          teacher.created_at,
      },

      assignments:
        formattedAssignments,
    });
  } catch (error) {
    console.error(
      "Teacher assignments GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading teacher assignments.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* POST                                                                      */
/* Assign an enrollment/student to this teacher.                            */
/* ========================================================================= */

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const ownerResult = await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } = ownerResult;
    const { id: teacherId } = await context.params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required." },
        { status: 400 }
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
      .single();

    if (
      teacherError ||
      !teacher ||
      teacher.role !== "teacher"
    ) {
      return NextResponse.json(
        {
          error:
            "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    if (teacher.status !== "active") {
      return NextResponse.json(
        {
          error:
            "This teacher is inactive.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* READ SELECTED ENROLLMENT/STUDENT                                      */
    /* --------------------------------------------------------------------- */

    const body = await request.json();

    const enrollmentStudentId =
      String(
        body.enrollmentStudentId || ""
      ).trim();

    if (!enrollmentStudentId) {
      return NextResponse.json(
        {
          error:
            "Enrollment student ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: enrollmentStudent,
      error: enrollmentStudentError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          id,
          enrollment_id,
          student_id,
          enrollments (
            id,
            package_name,
            status
          ),
          students (
            id,
            student_number,
            full_name,
            preferred_name
          )
        `
      )
      .eq("id", enrollmentStudentId)
      .single();

    if (
      enrollmentStudentError ||
      !enrollmentStudent
    ) {
      return NextResponse.json(
        {
          error:
            "The selected student enrollment could not be found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY ENROLLMENT                                                     */
    /* --------------------------------------------------------------------- */

    const enrollment = Array.isArray(
      enrollmentStudent.enrollments
    )
      ? enrollmentStudent.enrollments[0]
      : enrollmentStudent.enrollments;

    if (!enrollment) {
      return NextResponse.json(
        {
          error:
            "The selected enrollment could not be found.",
        },
        { status: 404 }
      );
    }

    if (enrollment.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Only active enrollments can be assigned to a teacher.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CHECK EXISTING ACTIVE ASSIGNMENT                                      */
    /* --------------------------------------------------------------------- */

    const {
      data: existingAssignment,
      error: existingAssignmentError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        `
          id,
          teacher_id
        `
      )
      .eq(
        "enrollment_student_id",
        enrollmentStudentId
      )
      .eq("status", "active")
      .maybeSingle();

    if (existingAssignmentError) {
      console.error(
        "Existing assignment check error:",
        existingAssignmentError
      );

      return NextResponse.json(
        {
          error:
            existingAssignmentError.message,
        },
        { status: 500 }
      );
    }

    if (existingAssignment) {
      /* ------------------------------------------------------------------- */
      /* ALREADY ASSIGNED TO THIS TEACHER                                    */
      /* ------------------------------------------------------------------- */

      if (
        existingAssignment.teacher_id ===
        teacherId
      ) {
        return NextResponse.json(
          {
            error:
              "This student is already assigned to this teacher.",
          },
          { status: 409 }
        );
      }

      /* ------------------------------------------------------------------- */
      /* ASSIGNED TO ANOTHER TEACHER                                         */
      /* ------------------------------------------------------------------- */

      const {
        data: existingTeacher,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq(
          "id",
          existingAssignment.teacher_id
        )
        .maybeSingle();

      return NextResponse.json(
        {
          error: `This student is already assigned to ${
            existingTeacher?.full_name ||
            "another teacher"
          }.`,
        },
        { status: 409 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CREATE ASSIGNMENT                                                     */
    /* --------------------------------------------------------------------- */

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from("teacher_assignments")
      .insert({
        enrollment_student_id:
          enrollmentStudentId,

        teacher_id:
          teacherId,

        start_date:
          today,

        status:
          "active",
      })
      .select(
        `
          id,
          enrollment_student_id,
          teacher_id,
          start_date,
          end_date,
          status
        `
      )
      .single();

    if (assignmentError) {
      console.error(
        "Teacher assignment insert error:",
        assignmentError
      );

      return NextResponse.json(
        {
          error:
            assignmentError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(
      "Teacher assignment POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while assigning the student.",
      },
      { status: 500 }
    );
  }
}