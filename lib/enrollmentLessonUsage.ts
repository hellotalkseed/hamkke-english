export type EnrollmentLessonUsage = {
  consumes_lesson?: boolean | null;
  attendance_status?: string | null;
  resolution?: string | null;
};

/**
 * Canonical lesson-consumption rule used by the Owner/Admin record.
 * Teacher-facing views must reference this helper instead of maintaining
 * their own package-balance interpretation.
 */
export function lessonConsumesPackage(lesson: EnrollmentLessonUsage): boolean {
  if (lesson.consumes_lesson === true) return true;

  if (
    lesson.attendance_status === "completed" ||
    lesson.attendance_status === "no_show" ||
    lesson.attendance_status === "late_cancellation"
  ) {
    return true;
  }

  return (
    lesson.attendance_status === "unexpected_circumstance" &&
    lesson.resolution === "counted_as_completed"
  );
}

export function countConsumedEnrollmentLessons(
  lessons: EnrollmentLessonUsage[]
): number {
  return lessons.filter(lessonConsumesPackage).length;
}