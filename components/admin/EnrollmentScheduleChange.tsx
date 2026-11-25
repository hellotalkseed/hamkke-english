"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Move = { id: string; number: number; old_date: string; old_time: string; date: string; time: string };
type Preview = { hash: string; plan: Move[] };
type Props = {
  enrollment: string;
  student: string;
  name: string;
  timezone: string;
  current: { day_of_week: number; schedule_time: string }[];
};

export default function EnrollmentScheduleChange({ enrollment, student, name, timezone, current }: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState<Record<number, string>>(() =>
    Object.fromEntries(current.map(slot => [slot.day_of_week, slot.schedule_time.slice(0, 5)]))
  );
  const [date, setDate] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function clearPreview() { setPreview(null); setMessage(""); }

  async function request(confirm: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await createClient().rpc("change_enrollment_schedule", {
        p_enrollment: enrollment, p_student: student, p_date: date,
        p_slots: Object.entries(slots).map(([day, time]) => ({ day: Number(day), time })),
        p_confirm: confirm ? preview?.hash : null,
      });
      if (error) throw new Error(error.message);
      if (confirm) {
        setPreview(null);
        setMessage("Weekly schedule updated for " + name + ".");
        router.refresh();
      } else {
        setPreview(data as Preview);
      }
    } catch (error) {
      setPreview(null);
      setMessage(error instanceof Error ? error.message : "Unable to update the schedule. Please try again.");
    } finally { setBusy(false); }
  }

  return <details className="my-4 rounded-xl border border-[#DCD8D2] bg-white px-4 py-3">
    <summary className="cursor-pointer font-semibold">Change weekly schedule</summary>
    <p className="my-3 text-sm">Choose the new weekly times for {name} in {timezone}. Earlier lessons keep their dates. The new weekly pattern will appear in the package summary as soon as you confirm.</p>
    <fieldset disabled={busy} className="space-y-3">
      <label className="block text-sm">Effective from <input type="date" value={date} className="rounded border p-1" onChange={e => { setDate(e.target.value); clearPreview(); }} /></label>
      <div className="grid gap-2 sm:grid-cols-2">{weekdays.map((day, i) => <div key={day} className="flex items-center gap-2">
        <label><input type="checkbox" checked={i in slots} onChange={e => {
          const next = { ...slots };
          if (e.target.checked) next[i] = ""; else delete next[i];
          setSlots(next); clearPreview();
        }} /> {day}</label>
        {i in slots && <input aria-label={day + " time"} type="time" className="rounded border p-1" value={slots[i]} onChange={e => {
          setSlots({ ...slots, [i]: e.target.value }); clearPreview();
        }} />}
      </div>)}</div>
      <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={!date || !Object.keys(slots).length || Object.values(slots).some(time => !time)} onClick={() => request(false)}>Preview lesson dates</button>
      {preview && <div className="space-y-2"><p className="text-sm">Review the remaining regular lessons. Previously arranged makeups, substitutes, and lessons with teacher records keep their bookings.</p>
        <table className="w-full text-left text-sm"><thead><tr><th>Lesson</th><th>Current booking</th><th>New booking</th></tr></thead>
          <tbody>{preview.plan.map(move => <tr key={move.id}><td>{move.number}</td><td>{move.old_date} {move.old_time.slice(0,5)}</td><td>{move.date} {move.time.slice(0,5)}</td></tr>)}</tbody></table>
        <button type="button" className="rounded bg-[#364C42] px-3 py-2 text-white" onClick={() => request(true)}>Confirm schedule change</button>
      </div>}
    </fieldset><p className="mt-2 text-sm" role="status">{busy ? "Checking the lesson schedule…" : message}</p>
  </details>;
}
