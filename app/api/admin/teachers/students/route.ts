import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countConsumedEnrollmentLessons } from "@/lib/enrollmentLessonUsage";

type StudentRow = {
  id: string;
  student_number: string | null;
  full_name: string | null;
  preferred_name: string | null;
  timezone: string | null;
};

type EnrollmentRow = {
  id: string;
  package_name: string | null;
  status: string;
  number_of_lessons: number | null;
  lesson_duration: number | null;
  renewal_of: string | null;
  start_date: string | null;
  created_at: string | null;
};

type EnrollmentStudentRow = {
  id: string;
  enrollment_id: string;
  student_id: string;
  students: StudentRow | StudentRow[] | null;
  enrollments: EnrollmentRow | EnrollmentRow[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function convertStudentTimeToPht(date: string, time: string | null, timezone: string | null) {
  if (!time) return { date, time: null as string | null };
  const zone = timezone || "Asia/Manila";
  try {
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi, s = 0] = time.split(":").map(Number);
    let guess = Date.UTC(y, mo - 1, d, h, mi, s);
    const source = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    });
    const parts = source.formatToParts(new Date(guess));
    const part = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    const represented = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
    const actual = guess - (represented - guess);
    const pht = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(actual));
    const p = (type: string) => pht.find((x) => x.type === type)?.value || "";
    return { date: `${p("year")}-${p("month")}-${p("day")}`, time: `${p("hour")}:${p("minute")}` };
  } catch {
    return { date, time: time.slice(0, 5) };
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "teacher" || profile.status !== "active") {
      return NextResponse.json({ error: "Only active teachers can access My Students." }, { status: 403 });
    }

    const { data: assignments, error: assignmentError } = await admin
      .from("teacher_assignments")
      .select("id, enrollment_student_id, start_date, end_date, status")
      .eq("teacher_id", user.id)
      .eq("status", "active");

    if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    const ids = Array.from(new Set((assignments || []).map((a) => a.enrollment_student_id).filter(Boolean)));
    if (!ids.length) return NextResponse.json({ teacher: { id: profile.id, full_name: profile.full_name }, students: [] });

    const { data: participantData, error: participantError } = await admin
      .from("enrollment_students")
      .select(`
        id, enrollment_id, student_id,
        students ( id, student_number, full_name, preferred_name, timezone ),
        enrollments ( id, package_name, status, number_of_lessons, lesson_duration, renewal_of, start_date, created_at )
      `)
      .in("id", ids);

    if (participantError) return NextResponse.json({ error: participantError.message }, { status: 500 });
    const assignedParticipants = (participantData || []) as EnrollmentStudentRow[];
    const studentIds = Array.from(new Set(assignedParticipants.map((p) => p.student_id)));

    // Resolve renewals within each assigned student's enrollment chain.
    // An active renewal must wait while its previous term has lessons left.
    const { data: ownerParticipantData, error: ownerParticipantError } = await admin
      .from("enrollment_students")
      .select(`
        id, enrollment_id, student_id,
        students ( id, student_number, full_name, preferred_name, timezone ),
        enrollments ( id, package_name, status, number_of_lessons, lesson_duration, renewal_of, start_date, created_at )
      `)
      .in("student_id", studentIds);

    if (ownerParticipantError) {
      return NextResponse.json({ error: ownerParticipantError.message }, { status: 500 });
    }

    const ownerParticipants = (ownerParticipantData || []) as EnrollmentStudentRow[];
    const ownerByStudent = new Map<string, EnrollmentStudentRow[]>();
    for (const participant of ownerParticipants) {
      const list = ownerByStudent.get(participant.student_id) || [];
      list.push(participant);
      ownerByStudent.set(participant.student_id, list);
    }

    // Fetch complete lesson pools for assigned enrollments and their active or
    // completed renewal descendants. Never filter shared usage by student ID.
    const reachableEnrollmentIds = new Set(assignedParticipants.map((p) => p.enrollment_id));
    const queue = [...assignedParticipants];
    const visitedParticipants = new Set<string>();
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      if (visitedParticipants.has(current.id)) continue;
      visitedParticipants.add(current.id);
      for (const candidate of ownerByStudent.get(current.student_id) || []) {
        const enrollment = one(candidate.enrollments);
        if (enrollment?.renewal_of === current.enrollment_id &&
            (enrollment.status === "active" || enrollment.status === "completed")) {
          reachableEnrollmentIds.add(candidate.enrollment_id);
          queue.push(candidate);
        }
      }
    }
    const { data: lessons, error: lessonError } = await admin.from("lessons")
      .select("id, enrollment_id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, consumes_lesson, resolution")
      .in("enrollment_id", Array.from(reachableEnrollmentIds))
      .order("lesson_date", { ascending: true })
      .order("schedule_time", { ascending: true });
    if (lessonError) return NextResponse.json({ error: lessonError.message }, { status: 500 });

    const hasRemainingLessons = (participant: EnrollmentStudentRow) => {
      const enrollment = one(participant.enrollments);
      return enrollment?.status === "active" &&
        (enrollment.number_of_lessons ?? 0) > countConsumedEnrollmentLessons(
          (lessons || []).filter((lesson) => lesson.enrollment_id === participant.enrollment_id)
        );
    };
    const compareTerms = (a: EnrollmentStudentRow, b: EnrollmentStudentRow) => {
      const first = one(a.enrollments);
      const second = one(b.enrollments);
      return (first?.start_date || "9999-12-31").localeCompare(second?.start_date || "9999-12-31") ||
        (first?.created_at || "").localeCompare(second?.created_at || "") ||
        a.enrollment_id.localeCompare(b.enrollment_id);
    };

    const resolveOwnerCurrentParticipant = (assigned: EnrollmentStudentRow) => {
      const candidates = ownerByStudent.get(assigned.student_id) || [];
      let current = assigned;
      const visited = new Set<string>();

      while (!visited.has(current.enrollment_id)) {
        visited.add(current.enrollment_id);
        const currentEnrollment = one(current.enrollments);
        if (hasRemainingLessons(current)) break;
        if (currentEnrollment?.status !== "completed" && currentEnrollment?.status !== "active") break;

        const child = [...candidates].sort(compareTerms).find((candidate) => {
          const enrollment = one(candidate.enrollments);
          return (
            enrollment?.renewal_of === current.enrollment_id &&
            (enrollment.status === "active" || enrollment.status === "completed") &&
            !visited.has(candidate.enrollment_id)
          );
        });

        if (!child) break;
        current = child;
      }

      return current;
    };

    const resolvedByStudent = new Map<string, EnrollmentStudentRow>();
    for (const assigned of assignedParticipants) {
      const resolved = resolveOwnerCurrentParticipant(assigned);
      const existing = resolvedByStudent.get(assigned.student_id);

      if (!existing) {
        resolvedByStudent.set(assigned.student_id, resolved);
        continue;
      }

      const existingEnrollment = one(existing.enrollments);
      const resolvedEnrollment = one(resolved.enrollments);
      const existingUnfinished = hasRemainingLessons(existing);
      const resolvedUnfinished = hasRemainingLessons(resolved);
      if (
        (resolvedUnfinished && !existingUnfinished) ||
        (resolvedUnfinished && existingUnfinished && compareTerms(resolved, existing) < 0) ||
        (!resolvedUnfinished && !existingUnfinished &&
          ((existingEnrollment?.status !== "active" && resolvedEnrollment?.status === "active") ||
           (existingEnrollment?.status === resolvedEnrollment?.status && compareTerms(resolved, existing) > 0)))
      ) {
        resolvedByStudent.set(assigned.student_id, resolved);
      }
    }

    const participants = Array.from(resolvedByStudent.values());
    const enrollmentIds = Array.from(new Set(participants.map((p) => p.enrollment_id)));

    const { data: schedules, error: scheduleError } = await admin.from("enrollment_schedules")
      .select("id, enrollment_id, student_id, day_of_week, schedule_time")
      .in("enrollment_id", enrollmentIds)
      .in("student_id", studentIds)
      .order("day_of_week", { ascending: true })
      .order("schedule_time", { ascending: true });
    if (scheduleError) return NextResponse.json({ error: scheduleError.message }, { status: 500 });

    const nowParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const np = (type: string) => nowParts.find((x) => x.type === type)?.value || "";
    const today = `${np("year")}-${np("month")}-${np("day")}`;
    const nowMinutes = Number(np("hour")) * 60 + Number(np("minute"));

    const students = participants.map((participant) => {
      const student = one(participant.students);
      const enrollment = one(participant.enrollments);
      const enrollmentLessons = (lessons || []).filter(
        (l) => l.enrollment_id === participant.enrollment_id
      );
      const studentLessons = enrollmentLessons.filter(
        (l) => l.student_id === participant.student_id
      );

      // Owner/Admin Student Record is the source of truth for package usage.
      // Shared enrollments use the complete enrollment lesson pool; only
      // participant-specific schedule/next-lesson data is filtered by student.
      const consumed = countConsumedEnrollmentLessons(enrollmentLessons);
      const next = studentLessons
        .map((l) => ({ ...l, pht: convertStudentTimeToPht(l.lesson_date, l.schedule_time, student?.timezone || null) }))
        .filter((l) => {
          if (l.attendance_status !== "scheduled") return false;
          if (l.pht.date > today) return true;
          if (l.pht.date < today || !l.pht.time) return false;
          const [h, m] = l.pht.time.split(":").map(Number);
          return h * 60 + m + (l.duration || 0) > nowMinutes;
        })
        .sort((a, b) => a.pht.date.localeCompare(b.pht.date) || (a.pht.time || "").localeCompare(b.pht.time || ""))[0] || null;

      return {
        enrollment_student_id: participant.id,
        student: student ? {
          id: student.id, student_number: student.student_number, full_name: student.full_name,
          preferred_name: student.preferred_name, timezone: student.timezone,
        } : null,
        enrollment: enrollment ? {
          id: enrollment.id, package_name: enrollment.package_name, status: enrollment.status,
          number_of_lessons: enrollment.number_of_lessons, lesson_duration: enrollment.lesson_duration,
        } : null,
        progress: { used: consumed, total: enrollment?.number_of_lessons || enrollmentLessons.length || 0 },
        next_lesson: next ? {
          id: next.id, lesson_number: next.lesson_number, philippine_date: next.pht.date,
          philippine_time: next.pht.time, duration: next.duration,
        } : null,
        regular_schedule: (schedules || [])
          .filter((s) => s.enrollment_id === participant.enrollment_id && s.student_id === participant.student_id)
          .map((s) => ({ day_of_week: s.day_of_week, schedule_time: s.schedule_time })),
      };
    }).sort((a, b) => {
      const an = a.student?.preferred_name || a.student?.full_name || "";
      const bn = b.student?.preferred_name || b.student?.full_name || "";
      return an.localeCompare(bn);
    });

    return NextResponse.json({ teacher: { id: profile.id, full_name: profile.full_name }, students });
  } catch (error) {
    console.error("Teacher students error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load My Students." }, { status: 500 });
  }
}
