import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleInstant } from "./lessonRates";

export async function loadPayrollLessons(admin: ReturnType<typeof createAdminClient>, teacherId: string) {
  const rows: Record<string, any>[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await admin.from("lessons")
      .select("id, enrollment_id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, consumes_lesson, resolution, actual_teacher_id")
      .eq("actual_teacher_id", teacherId).order("id", { ascending: true }).range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Failed to load payroll lessons: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  const ids = [...new Set(rows.map(row => row.student_id).filter(Boolean).map(String))];
  const zones = new Map<string, string>();
  for (let offset = 0; offset < ids.length; offset += 200) {
    const { data, error } = await admin.from("students").select("id, timezone").in("id", ids.slice(offset, offset + 200));
    if (error) throw new Error(`Failed to load payroll timezones: ${error.message}`);
    for (const student of data ?? []) if (student.timezone) zones.set(String(student.id), String(student.timezone));
  }
  return rows.map(row => {
    let scheduledAt: number | undefined;
    if (["completed", "no_show", "late_cancellation"].includes(row.attendance_status)) {
      const timezone = zones.get(String(row.student_id));
      if (!timezone || !row.schedule_time) throw new Error(`Lesson ${row.id} needs a schedule time and student timezone before payroll can be calculated.`);
      try { scheduledAt = scheduleInstant(String(row.lesson_date), String(row.schedule_time), timezone); }
      catch { throw new Error(`Check the date, time and timezone for lesson ${row.id} before calculating payroll.`); }
    }
    return {
      id: String(row.id), enrollment_id: String(row.enrollment_id), student_id: row.student_id ? String(row.student_id) : null,
      lesson_number: Number(row.lesson_number), lesson_date: String(row.lesson_date), duration: Number(row.duration),
      attendance_status: String(row.attendance_status ?? ""), consumes_lesson: Boolean(row.consumes_lesson),
      resolution: row.resolution ? String(row.resolution) : null,
      actual_teacher_id: row.actual_teacher_id ? String(row.actual_teacher_id) : null,
      scheduled_at: scheduledAt,
    };
  }).sort((a, b) => (a.scheduled_at ?? Infinity) - (b.scheduled_at ?? Infinity) || a.id.localeCompare(b.id));
}

/** Read complete saved breakdowns as well as lesson metadata without API row caps. */
export async function loadPayrollRows(
  admin: ReturnType<typeof createAdminClient>, table: "teacher_payroll_lessons" | "lessons" | "students",
  columns: string, key: string, ids: string[], orderKey: string,
) {
  const rows: Record<string, any>[] = [];
  for (let start = 0; start < ids.length; start += 200) {
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await admin.from(table).select(columns)
        .in(key, ids.slice(start, start + 200)).order(orderKey, { ascending: true }).range(offset, offset + 499);
      if (error) throw new Error(`Unable to load payroll history: ${error.message}`);
      rows.push(...(data ?? []));
      if (!data || data.length < 500) break;
    }
  }
  return rows;
}
