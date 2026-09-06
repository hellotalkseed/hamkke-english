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
     * LOAD ENROLLMENT PARTICIPANTS
     * ---------------------------------------------------------
     *
     * enrollment_students is the assignment unit.
     * This is important for shared enrollments because each
     * participant can have their own recurring schedule.
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
          preferred_name,
          timezone
        ),
        enrollments (
          id,
          package_name,
          status,
          lesson_duration
        )
      `)
      .order("id", { ascending: true });

    if (enrollmentStudentsError) {
      return NextResponse.json(
        {
          error: enrollmentStudentsError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * LOAD ACTIVE TEACHER ASSIGNMENTS
     * ---------------------------------------------------------
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
          error: activeAssignmentsError.message,
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
     * FILTER ACTIVE + UNASSIGNED
     * ---------------------------------------------------------
     */

    const availableParticipants =
      (enrollmentStudents || [])
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
        });

    /*
     * ---------------------------------------------------------
     * LOAD EXACT RECURRING SCHEDULES
     * ---------------------------------------------------------
     *
     * enrollment_schedules is the source of truth.
     *
     * We intentionally do NOT use:
     *   enrollments.schedule_days
     *   enrollments.schedule_time
     *
     * because shared enrollment participants can have
     * different schedules.
     */

    const enrollmentIds = [
      ...new Set(
        availableParticipants.map(
          (item) => item.enrollment_id
        )
      ),
    ];

    const studentIds = [
      ...new Set(
        availableParticipants.map(
          (item) => item.student_id
        )
      ),
    ];

    let schedules: {
      enrollment_id: string;
      student_id: string;
      day_of_week: number;
      schedule_time: string;
    }[] = [];

    if (
      enrollmentIds.length > 0 &&
      studentIds.length > 0
    ) {
      const {
        data: scheduleRows,
        error: schedulesError,
      } = await admin
        .from("enrollment_schedules")
        .select(
          `
            enrollment_id,
            student_id,
            day_of_week,
            schedule_time
          `
        )
        .in("enrollment_id", enrollmentIds)
        .in("student_id", studentIds)
        .order("day_of_week", {
          ascending: true,
        })
        .order("schedule_time", {
          ascending: true,
        });

      if (schedulesError) {
        return NextResponse.json(
          {
            error: schedulesError.message,
          },
          { status: 500 }
        );
      }

      schedules = scheduleRows || [];
    }

    /*
     * ---------------------------------------------------------
     * FORMAT AVAILABLE ENROLLMENTS
     * ---------------------------------------------------------
     */

    const availableEnrollments =
      availableParticipants.map((item) => {
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

        const studentSchedules =
          schedules
            .filter(
              (schedule) =>
                schedule.enrollment_id ===
                  item.enrollment_id &&
                schedule.student_id ===
                  item.student_id
            )
            .map((schedule) => ({
              day_of_week:
                schedule.day_of_week,
              schedule_time:
                schedule.schedule_time,
            }));

        return {
          enrollment_student_id: item.id,

          enrollment_id:
            item.enrollment_id,

          student_id:
            item.student_id,

          student: student
            ? {
                id: student.id,
                student_number:
                  student.student_number,
                full_name:
                  student.full_name,
                preferred_name:
                  student.preferred_name,
                timezone:
                  student.timezone,
              }
            : null,

          enrollment: enrollment
            ? {
                id: enrollment.id,
                package_name:
                  enrollment.package_name,
                status:
                  enrollment.status,
                lesson_duration:
                  enrollment.lesson_duration,
              }
            : null,

          schedules:
            studentSchedules,
        };
      });

    return NextResponse.json({
      enrollments:
        availableEnrollments,
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