import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Check the currently signed-in user
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

    // Use the server-only Supabase admin client
    const admin = createAdminClient();

    // Check that the signed-in user is an active owner
    const { data: profile, error: profileError } = await admin
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
        { error: "Only active owners can view teachers." },
        { status: 403 }
      );
    }

    // Get teacher profiles
    const { data: profiles, error: teachersError } = await admin
      .from("profiles")
      .select(
        "id, full_name, role, status, created_at, teacher_number"
      )
      .eq("role", "teacher")
      .order("created_at", { ascending: true });

    if (teachersError) {
      return NextResponse.json(
        { error: teachersError.message },
        { status: 500 }
      );
    }

    const teacherIds = (profiles || []).map((teacher) => teacher.id);

    // Get active teacher assignments
    const { data: assignments, error: assignmentsError } = await admin
      .from("teacher_assignments")
      .select(`
        teacher_id,
        enrollment_student_id
      `)
      .in("teacher_id", teacherIds)
      .eq("status", "active");

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 }
      );
    }

    // Get enrollment-student records so we can identify unique students
    const enrollmentStudentIds = (assignments || []).map(
      (assignment) => assignment.enrollment_student_id
    );

    let enrollmentStudents: {
      id: string;
      student_id: string;
    }[] = [];

    if (enrollmentStudentIds.length > 0) {
      const { data, error: enrollmentStudentsError } = await admin
        .from("enrollment_students")
        .select("id, student_id")
        .in("id", enrollmentStudentIds);

      if (enrollmentStudentsError) {
        return NextResponse.json(
          { error: enrollmentStudentsError.message },
          { status: 500 }
        );
      }

      enrollmentStudents = data || [];
    }

    // Get all lessons attributed to each teacher
    const { data: lessons, error: lessonsError } = await admin
      .from("lessons")
      .select("id, actual_teacher_id")
      .in("actual_teacher_id", teacherIds);

    if (lessonsError) {
      return NextResponse.json(
        { error: lessonsError.message },
        { status: 500 }
      );
    }

    // Build teacher statistics
    const teachers = (profiles || []).map((teacher) => {
      const teacherAssignments = (assignments || []).filter(
        (assignment) => assignment.teacher_id === teacher.id
      );

      const assignedEnrollmentStudentIds =
        teacherAssignments.map(
          (assignment) => assignment.enrollment_student_id
        );

      const studentIds = enrollmentStudents
        .filter((enrollmentStudent) =>
          assignedEnrollmentStudentIds.includes(enrollmentStudent.id)
        )
        .map((enrollmentStudent) => enrollmentStudent.student_id);

      const uniqueStudentIds = [...new Set(studentIds)];

      const totalLessons = (lessons || []).filter(
        (lesson) => lesson.actual_teacher_id === teacher.id
      ).length;

      return {
        id: teacher.id,
        full_name: teacher.full_name,
        role: teacher.role,
        status: teacher.status,
        created_at: teacher.created_at,
        teacher_number: teacher.teacher_number,
        student_count: uniqueStudentIds.length,
        total_lessons: totalLessons,
        payable: 0,
      };
    });

    return NextResponse.json({
      teachers,
    });
  } catch (error) {
    console.error("Teacher list error:", error);

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