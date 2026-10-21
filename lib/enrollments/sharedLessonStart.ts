export interface StartSchedule {
  studentId: string;
  scheduleDays: string[];
  scheduleTimes: Record<string, string>;
}

export function getStartOptions(startDate: string, participants: StartSchedule[]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return [];
  const date = new Date(`${startDate}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== startDate) return [];
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getUTCDay()];
  return participants.flatMap((participant) => {
    const time = participant.scheduleTimes[day];
    return participant.scheduleDays.includes(day) && time && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)
      ? [{ studentId: participant.studentId, time }]
      : [];
  }).sort((a, b) => a.time.localeCompare(b.time) || a.studentId.localeCompare(b.studentId));
}
