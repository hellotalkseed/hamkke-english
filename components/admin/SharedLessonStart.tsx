"use client";

import { useState } from "react";
import { getStartOptions, type StartSchedule } from "@/lib/enrollments/sharedLessonStart";

export default function SharedLessonStart({ startDate, participants }: {
  startDate: string;
  participants: (StartSchedule & { name: string })[];
}) {
  const [selected, setSelected] = useState("");
  const options = getStartOptions(startDate, participants);
  const value = options.some((option) => option.studentId === selected) ? selected : "";
  const chosen = options.find((option) => option.studentId === value);
  const displayName = (id: string) => participants.find((p) => p.studentId === id)?.name ?? "Student";
  return (
    <div className="mb-6 rounded-xl border border-[#DCD8D2] bg-[#FAF8F5] p-4 font-sans">
      <label className="block text-sm font-medium text-[#454D45]">
        Start with
        <select
          name="first_lesson_student_id"
          value={value}
          onChange={(event) => setSelected(event.target.value)}
          disabled={options.length === 0}
          className="mt-2 block w-full rounded-lg border border-[#DCD8D2] bg-white px-3 py-2.5 text-sm disabled:opacity-60"
        >
          <option value="">First scheduled class</option>
          {options.map((option) => (
            <option key={option.studentId} value={option.studentId}>
              {displayName(option.studentId)} · {option.time.slice(0, 5)}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs leading-5 text-[#777771]" aria-live="polite">
        {!startDate
          ? "Choose the enrollment start date and lesson schedules first."
          : chosen
            ? `Start at ${displayName(chosen.studentId)}'s ${chosen.time.slice(0, 5)} class on ${startDate}. Earlier classes that day are skipped. Both students' schedules continue normally afterward.`
            : options.length === 0
              ? "No participant is scheduled on this start date. Generation will begin with the next scheduled class."
              : "Generate from the earliest scheduled class. Or choose who starts the new term on this date."}
      </p>
    </div>
  );
}
