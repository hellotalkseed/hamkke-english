/** Shared by payroll previews, manual finalization and scheduled finalization. */
export type ProgressionRate = {
  id: string; level: number; min_teaching_minutes: number;
  rate_25: number; rate_50: number; is_active: boolean;
};
export type ProgressionLesson = {
  id: string; lesson_date: string; duration: number; attendance_status: string;
  scheduled_at?: number;
};

export function calculateLessonRates(lessons: ProgressionLesson[], rates: ProgressionRate[]) {
  const active = rates.filter(rate => rate.is_active).sort((a, b) => a.min_teaching_minutes - b.min_teaching_minutes);
  if (!active.length || active[0].min_teaching_minutes !== 0) throw new Error("Configure an active compensation rate starting at zero teaching minutes.");
  for (const rate of active) {
    if (![rate.min_teaching_minutes, rate.rate_25, rate.rate_50].every(value => Number.isFinite(value) && value >= 0)) throw new Error("Invalid compensation rate configuration.");
  }
  if (new Set(active.map(rate => rate.min_teaching_minutes)).size !== active.length) throw new Error("Multiple active compensation rates have the same threshold.");
  const payable = lessons.filter(lesson => ["completed", "no_show", "late_cancellation"].includes(lesson.attendance_status));
  const seen = new Set<string>();
  for (const lesson of payable) {
    if (seen.has(lesson.id)) throw new Error(`Duplicate payroll lesson: ${lesson.id}`);
    seen.add(lesson.id);
    if (![25, 50].includes(lesson.duration)) throw new Error(`Unsupported payroll duration for lesson ${lesson.id}.`);
    if (!Number.isFinite(lesson.scheduled_at)) throw new Error(`Lesson ${lesson.id} needs a valid schedule time and student timezone before payroll can be calculated.`);
  }
  const completions = payable.filter(lesson => lesson.attendance_status === "completed")
    .map(lesson => ({ end: lesson.scheduled_at! + lesson.duration * 60_000, minutes: lesson.duration }))
    .sort((a, b) => a.end - b.end);
  const byLesson = new Map<string, { rate: number; amount: number; level: number; qualifying_minutes_before: number }>();
  let minutes = 0, completedIndex = 0;
  for (const lesson of [...payable].sort((a, b) => a.scheduled_at! - b.scheduled_at! || a.id.localeCompare(b.id))) {
    // A lesson only contributes hours after it ends, never to its own starting rate.
    while (completedIndex < completions.length && completions[completedIndex].end <= lesson.scheduled_at!) {
      minutes += completions[completedIndex++].minutes;
    }
    const tier = [...active].reverse().find(rate => rate.min_teaching_minutes <= minutes)!;
    const amount = lesson.duration === 25 ? tier.rate_25 : tier.rate_50;
    byLesson.set(lesson.id, { rate: amount, amount, level: tier.level, qualifying_minutes_before: minutes });
  }
  return {
    forLesson(id: string) {
      const value = byLesson.get(id);
      if (!value) throw new Error(`Missing payroll calculation for lesson ${id}.`);
      return value;
    },
    total(items: { id: string }[]) {
      return items.reduce((sum, item) => sum + Math.round(this.forLesson(item.id).amount * 100), 0) / 100;
    },
  };
}

/** Convert the student's wall-clock schedule to UTC and reject invalid local times. */
export function scheduleInstant(date: string, time: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(time)) throw new Error("Invalid lesson schedule.");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min, sec = 0] = time.split(":").map(Number);
  if (h > 23 || min > 59 || sec >= 60) throw new Error("Invalid lesson time.");
  const wall = Date.UTC(y, m - 1, d, h, min, Math.floor(sec));
  const checkDate = new Date(wall);
  if (checkDate.getUTCFullYear() !== y || checkDate.getUTCMonth() !== m - 1 || checkDate.getUTCDate() !== d) throw new Error("Invalid lesson date.");
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const asWall = (instant: number) => {
    const p = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(part => [part.type, part.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  };
  let instant = wall;
  for (let i = 0; i < 4; i++) instant += wall - asWall(instant);
  if (asWall(instant) !== wall) throw new Error("Lesson schedule falls in an invalid local time.");
  // DST fall-back can make a wall time ambiguous. Do not guess the earning order.
  for (const offset of [-3_600_000, -1_800_000, 1_800_000, 3_600_000]) {
    if (asWall(instant + offset) === wall) throw new Error("Ambiguous lesson schedule during a timezone clock change.");
  }
  return instant;
}
