import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    /*
     * ---------------------------------------------------------
     * VERIFY ACTIVE OWNER
     * ---------------------------------------------------------
     */

    const { data: profile, error: profileError } =
      await admin
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
      return NextResponse.json(
        {
          error:
            "Only active owners can view available enrollments.",
        },
        { status: 403 }
      );
    }

    /*
     * ---------------------------------------------------------
     * LOAD ACTIVE ENROLLMENT PARTICIPANTS
     * ---------------------------------------------------------
     *
     * Every enrollment currently has an enrollment_students
     * record, including individual enrollments.
     *
     * We use enrollment_students as the assignment unit
     * because shared enrollments can contain multiple students.
     */

    const {
      data: enrollmentStudents,
      error: enrollmentStudentsError,
    } = await admin
      .from("enrollment_students")
      .select(`
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
      `)
      .order("id", { ascending: true });

    if (enrollmentStudentsError) {
      return NextResponse.json(
        {
          error:
            enrollmentStudentsError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * LOAD CURRENT ACTIVE TEACHER ASSIGNMENTS
     * ---------------------------------------------------------
     *
     * If an enrollment/student already has an active teacher,
     * it should not appear as available for another teacher.
     */

    const {
      data: activeAssignments,
      error: activeAssignmentsError,
    } = await admin
      .from("teacher_assignments")
      .select("enrollment_student_id")
      .eq("status", "active");

    if (activeAssignmentsError) {
      return NextResponse.json(
        {
          error:
            activeAssignmentsError.message,
        },
        { status: 500 }
      );
    }

    const assignedEnrollmentStudentIds =
      new Set(
        (activeAssignments || []).map(
          (assignment) =>
            assignment.enrollment_student_id
        )
      );

    /*
     * ---------------------------------------------------------
     * FORMAT AVAILABLE ENROLLMENTS
     * ---------------------------------------------------------
     */

    const availableEnrollments = (
      enrollmentStudents || []
    )
      .filter(
        (item) =>
          !assignedEnrollmentStudentIds.has(
            item.id
          )
      )
      .filter((item) => {
        const enrollment = Array.isArray(
          item.enrollments
        )
          ? item.enrollments[0]
          : item.enrollments;

        return enrollment?.status === "active";
      })
      .map((item) => {
        const student = Array.isArray(
          item.students
        )
          ? item.students[0]
          : item.students;

        const enrollment = Array.isArray(
          item.enrollments
        )
          ? item.enrollments[0]
          : item.enrollments;

        return {
          enrollment_student_id: item.id,
          enrollment_id: item.enrollment_id,
          student_id: item.student_id,

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
                status: enrollment.status,
              }
            : null,
        };
      });

    return NextResponse.json({
      enrollments: availableEnrollments,
    });
  } catch (error) {
    console.error(
      "Available enrollments error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading available enrollments.",
      },
      { status: 500 }
    );
  }
}