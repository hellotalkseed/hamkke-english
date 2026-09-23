export interface PortalEnrollment {
  student_id: string;
  student_name: string;
  student_timezone: string | null;
  enrollment_id: string | null;
  enrollment_number: string | null;
  package_name: string | null;
  enrollment_status: string | null;
  start_date: string | null;
  lesson_duration: number | null;
  total_lessons: number | null;
  used_lessons: number;
  remaining_lessons: number;
  is_shared: boolean;
}

// Accept PostgreSQL bigint values represented as either numbers or strings.
export function parseOverview(value: unknown): PortalEnrollment[] {
  if (!Array.isArray(value)) throw new Error("Invalid portal response");
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid portal row");
    const row = item as Record<string, unknown>;
    function text(key: string): string {
      if (typeof row[key] !== "string") throw new Error(`Invalid ${key}`);
      return row[key];
    }
    function nullableText(key: string): string | null {
      return row[key] === null ? null : text(key);
    }
    function count(key: string): number {
      const raw = row[key];
      if (typeof raw !== "number" && !(typeof raw === "string" && /^\d+$/.test(raw))) throw new Error(`Invalid ${key}`);
      const result = Number(raw);
      if (!Number.isSafeInteger(result) || result < 0) throw new Error(`Invalid ${key}`);
      return result;
    }
    if (typeof row.is_shared !== "boolean") throw new Error("Invalid shared flag");
    return {
      student_id: text("student_id"), student_name: text("student_name"),
      student_timezone: nullableText("student_timezone"), enrollment_id: nullableText("enrollment_id"),
      enrollment_number: nullableText("enrollment_number"), package_name: nullableText("package_name"),
      enrollment_status: nullableText("enrollment_status"), start_date: nullableText("start_date"),
      lesson_duration: row.lesson_duration === null ? null : count("lesson_duration"),
      total_lessons: row.total_lessons === null ? null : count("total_lessons"),
      used_lessons: count("used_lessons"), remaining_lessons: count("remaining_lessons"),
      is_shared: row.is_shared,
    };
  });
}
