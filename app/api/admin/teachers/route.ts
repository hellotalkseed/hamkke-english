import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    /* --------------------------------------------------------------------- */
    /* AUTHENTICATION                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* OWNER CHECK                                                           */
    /* --------------------------------------------------------------------- */

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
      return NextResponse.json(
        {
          error:
            "Only active owners can view teachers.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* ADMIN CLIENT                                                          */
    /* --------------------------------------------------------------------- */

    const admin = createAdminClient();

    /* --------------------------------------------------------------------- */
    /* GET TEACHERS                                                          */
    /* --------------------------------------------------------------------- */

    const {
      data: profiles,
      error: teachersError,
    } = await admin
      .from("profiles")
      .select(
        "id, full_name, role, status, created_at, teacher_number"
      )
      .eq("role", "teacher")
      .order("created_at", {
        ascending: true,
      });

    if (teachersError) {
      console.error(
        "Teacher profiles fetch error:",
        teachersError
      );

      return NextResponse.json(
        { error: teachersError.message },
        { status: 500 }
      );
    }

    const teacherIds = (profiles || []).map(
      (teacher) => teacher.id
    );

    /* --------------------------------------------------------------------- */
    /* NO TEACHERS                                                           */
    /* --------------------------------------------------------------------- */

    if (teacherIds.length === 0) {
      return NextResponse.json({
        teachers: [],
      });
    }

    /* --------------------------------------------------------------------- */
    /* GET AUTH EMAILS                                                       */
    /* --------------------------------------------------------------------- */

    const teacherEmails = new Map<
      string,
      string | null
    >();

    for (const teacherId of teacherIds) {
      try {
        const {
          data: authUser,
          error: authUserError,
        } = await admin.auth.admin.getUserById(
          teacherId
        );

        if (authUserError) {
          console.error(
            `Unable to load auth email for teacher ${teacherId}:`,
            authUserError
          );

          teacherEmails.set(
            teacherId,
            null
          );

          continue;
        }

        teacherEmails.set(
          teacherId,
          authUser.user?.email || null
        );
      } catch (error) {
        console.error(
          `Unexpected error loading auth email for teacher ${teacherId}:`,
          error
        );

        teacherEmails.set(
          teacherId,
          null
        );
      }
    }

    /* --------------------------------------------------------------------- */
    /* GET ACTIVE TEACHER ASSIGNMENTS                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: assignments,
      error: assignmentsError,
    } = await admin
      .from("teacher_assignments")
      .select(
        `
          teacher_id,
          enrollment_student_id
        `
      )
      .in("teacher_id", teacherIds)
      .eq("status", "active");

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

    const enrollmentStudentIds = (
      assignments || []
    ).map(
      (assignment) =>
        assignment.enrollment_student_id
    );

    let enrollmentStudents: {
      id: string;
      student_id: string;
    }[] = [];

    if (enrollmentStudentIds.length > 0) {
      const {
        data,
        error: enrollmentStudentsError,
      } = await admin
        .from("enrollment_students")
        .select("id, student_id")
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

      enrollmentStudents = data || [];
    }

    /* --------------------------------------------------------------------- */
    /* GET TEACHER LESSONS                                                   */
    /* --------------------------------------------------------------------- */

    const {
      data: lessons,
      error: lessonsError,
    } = await admin
      .from("lessons")
      .select("id, actual_teacher_id")
      .in("actual_teacher_id", teacherIds);

    if (lessonsError) {
      console.error(
        "Teacher lessons fetch error:",
        lessonsError
      );

      return NextResponse.json(
        { error: lessonsError.message },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* BUILD TEACHER STATISTICS                                              */
    /* --------------------------------------------------------------------- */

    const teachers = (profiles || []).map(
      (teacher) => {
        const teacherAssignments =
          (assignments || []).filter(
            (assignment) =>
              assignment.teacher_id ===
              teacher.id
          );

        const assignedEnrollmentStudentIds =
          teacherAssignments.map(
            (assignment) =>
              assignment.enrollment_student_id
          );

        const studentIds =
          enrollmentStudents
            .filter((enrollmentStudent) =>
              assignedEnrollmentStudentIds.includes(
                enrollmentStudent.id
              )
            )
            .map(
              (enrollmentStudent) =>
                enrollmentStudent.student_id
            );

        const uniqueStudentIds = [
          ...new Set(studentIds),
        ];

        const totalLessons =
          (lessons || []).filter(
            (lesson) =>
              lesson.actual_teacher_id ===
              teacher.id
          ).length;

        return {
          id: teacher.id,
          full_name: teacher.full_name,
          role: teacher.role,
          status: teacher.status,
          created_at: teacher.created_at,
          email:
            teacherEmails.get(
              teacher.id
            ) || null,
          teacher_number:
            teacher.teacher_number,
          student_count:
            uniqueStudentIds.length,
          total_lessons:
            totalLessons,
          payable: 0,
        };
      }
    );

    /* --------------------------------------------------------------------- */
    /* RESPONSE                                                              */
    /* --------------------------------------------------------------------- */

    return NextResponse.json({
      teachers,
    });
  } catch (error) {
    console.error(
      "Teacher list error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading teachers.",
      },
      { status: 500 }
    );
  }
}