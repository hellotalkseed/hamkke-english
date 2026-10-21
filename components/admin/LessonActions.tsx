"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  CalendarClock,
  CreditCard,
  Pencil,
  X,
} from "lucide-react";

interface LessonActionsProps {
  locale: string;
  studentId: string;
  enrollmentId: string;
  lessonId: string;
  currentStatus: string;
  currentNotes?: string | null;
  currentResolution: string | null;
  currentLessonDate: string | null;
  currentScheduleTime: string | null;
}

type Action =
  | "scheduled"
  | "completed"
  | "no_show"
  | "late_cancellation"
  | "student_cancelled_rescheduled"
  | "student_cancelled_credit"
  | "unexpected_circumstance"
  | "teacher_cancelled";

type Resolution =
  | "rescheduled"
  | "lesson_credit"
  | "counted_as_completed"
  | null;

export default function LessonActions({
  studentId,
  enrollmentId,
  lessonId,
  currentStatus,
  currentNotes = null,
  currentResolution,
  currentLessonDate,
  currentScheduleTime,
}: LessonActionsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const saveInFlight = useRef(false);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [unexpectedResolution, setUnexpectedResolution] =
    useState<Resolution>(null);

  const [lessonDate, setLessonDate] = useState(
    currentLessonDate ?? ""
  );
  const [lessonTime, setLessonTime] = useState(
    currentScheduleTime?.slice(0, 5) ?? ""
  );

  const [notes, setNotes] = useState(currentNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function openEditor() {
    if (saveInFlight.current) return;
    setAction(null);
    setUnexpectedResolution(null);
    setLessonDate(currentLessonDate ?? "");
    setLessonTime(currentScheduleTime?.slice(0, 5) ?? "");
    setNotes(currentNotes ?? "");
    setError("");
    setOpen(true);
  }

  function selectAction(nextAction: Action) {
    setError("");
    setUnexpectedResolution(null);
    setAction(nextAction);
  }

  function close() {
    if (saveInFlight.current) return;

    setOpen(false);
    setAction(null);
    setUnexpectedResolution(null);
    setError("");
    setNotes("");
  }

  async function save() {
    if (!action || saveInFlight.current) return;

    setError("");

    let resolution: Resolution = null;

    if (action === "student_cancelled_rescheduled") {
      resolution = "rescheduled";
    }

    if (action === "student_cancelled_credit") {
      resolution = "lesson_credit";
    }

    if (action === "unexpected_circumstance") {
      resolution = unexpectedResolution;

      if (!resolution) {
        setError(
          "Please choose whether the lesson will be rescheduled or credited."
        );
        return;
      }
    }

    if (action === "teacher_cancelled") {
      resolution = "lesson_credit";
    }

    if (
      resolution === "rescheduled" &&
      (!lessonDate || !lessonTime)
    ) {
      setError("Please select a new lesson date and time.");
      return;
    }

    saveInFlight.current = true;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/enrollments/${enrollmentId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: action,
            resolution,
            lesson_date:
              resolution === "rescheduled"
                ? lessonDate
                : null,
            schedule_time:
              resolution === "rescheduled"
                ? lessonTime
                : null,
            notes: notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update lesson."
        );
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update lesson."
      );

      saveInFlight.current = false;
      setLoading(false);
    }
  }

  const actionLabel: Record<Action, string> = {
    scheduled: "Mark scheduled",
    completed: "Mark completed",
    no_show: "Mark no-show",
    late_cancellation: "Mark late cancellation",
    student_cancelled_rescheduled:
      "Student cancelled · Reschedule",
    student_cancelled_credit:
      "Student cancelled · Credit",
    unexpected_circumstance:
      "Unexpected circumstance",
    teacher_cancelled: "Teacher cancelled",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openEditor}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#DCD8D2] px-3 py-2 font-sans text-xs text-[#5F7F63] hover:bg-[#F0F4ED]"
        aria-haspopup="dialog"
      >
        <Pencil size={14} strokeWidth={1.5} />
        Edit status
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`lesson-editor-title-${lessonId}`}
        onCancel={(event) => { event.preventDefault(); event.stopPropagation(); close(); }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#DCD8D2] bg-[#FAF8F5] p-5 text-[#292929] shadow-xl backdrop:bg-black/30"
      >
        <header className="mb-4 flex items-start justify-between gap-4 border-b border-[#DCD8D2] pb-4">
          <div>
            <h2 id={`lesson-editor-title-${lessonId}`} className="font-sans text-base font-medium">Edit lesson status</h2>
            <p className="mt-1 font-sans text-xs text-[#777771]">Current: {currentStatus.replaceAll("_", " ")}</p>
          </div>
          <button type="button" onClick={close} disabled={loading} aria-label="Close lesson editor" className="rounded-full p-2 hover:bg-[#F0F4ED]"><X size={18} /></button>
        </header>

      {open && !action && (
        <div className="w-full">
          <ActionButton
            icon={<CalendarClock size={15} strokeWidth={1.5} />}
            label="Scheduled"
            onClick={() => selectAction("scheduled")}
          />
          <ActionButton
            icon={<Check size={15} strokeWidth={1.5} />}
            label="Completed"
            onClick={() => selectAction("completed")}
          />

          <ActionButton
            icon={<X size={15} strokeWidth={1.5} />}
            label="No-show"
            onClick={() => selectAction("no_show")}
          />

          <ActionButton
            icon={
              <CalendarClock
                size={15}
                strokeWidth={1.5}
              />
            }
            label="Late cancellation"
            onClick={() =>
              selectAction("late_cancellation")
            }
          />

          <div className="my-2 border-t border-[#DCD8D2]" />

          <ActionButton
            icon={
              <CalendarClock
                size={15}
                strokeWidth={1.5}
              />
            }
            label="Student cancelled · Reschedule"
            onClick={() =>
              selectAction(
                "student_cancelled_rescheduled"
              )
            }
          />

          <ActionButton
            icon={
              <CreditCard
                size={15}
                strokeWidth={1.5}
              />
            }
            label="Student cancelled · Credit"
            onClick={() =>
              selectAction(
                "student_cancelled_credit"
              )
            }
          />

          <ActionButton
            icon={
              <CalendarClock
                size={15}
                strokeWidth={1.5}
              />
            }
            label="Unexpected circumstance"
            onClick={() =>
              selectAction(
                "unexpected_circumstance"
              )
            }
          />

          <ActionButton
            icon={<X size={15} strokeWidth={1.5} />}
            label="Teacher cancelled"
            onClick={() =>
              selectAction("teacher_cancelled")
            }
          />
        </div>
      )}

      {open && action && (
        <div className="w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-base font-medium">
                {actionLabel[action]}
              </p>

              <p className="mt-1 font-sans text-[12px] leading-5 text-[#777771]">
                This will update the lesson record.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAction(null)}
              disabled={loading}
              className="
                text-[#777771]
                transition-colors
                hover:text-[#292929]
              "
              aria-label="Back"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {action === "unexpected_circumstance" && (
            <div className="mt-5">
              <p
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                Resolution
              </p>

              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setUnexpectedResolution(
                      "rescheduled"
                    )
                  }
                  className={`
                    w-full
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-left
                    font-sans
                    text-[13px]
                    transition-colors
                    ${
                      unexpectedResolution ===
                      "rescheduled"
                        ? "border-[#6F8F72] bg-[#F0F4ED] text-[#6F8F72]"
                        : "border-[#DCD8D2] bg-white text-[#4F534F] hover:bg-[#F0F4ED]"
                    }
                  `}
                >
                  <span className="font-medium">
                    Reschedule
                  </span>

                  <span className="mt-0.5 block text-[11px] text-[#777771]">
                    The lesson keeps its number and moves
                    to a new date.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setUnexpectedResolution(
                      "lesson_credit"
                    )
                  }
                  className={`
                    w-full
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-left
                    font-sans
                    text-[13px]
                    transition-colors
                    ${
                      unexpectedResolution ===
                      "lesson_credit"
                        ? "border-[#6F8F72] bg-[#F0F4ED] text-[#6F8F72]"
                        : "border-[#DCD8D2] bg-white text-[#4F534F] hover:bg-[#F0F4ED]"
                    }
                  `}
                >
                  <span className="font-medium">
                    Lesson credit
                  </span>

                  <span className="mt-0.5 block text-[11px] text-[#777771]">
                    The lesson is not consumed and remains
                    available as credit.
                  </span>
                </button>
              </div>
            </div>
          )}

          {(action ===
            "student_cancelled_rescheduled" ||
            (action === "unexpected_circumstance" &&
              unexpectedResolution ===
                "rescheduled")) && (
            <div className="mt-5">
              <label
                htmlFor={`lesson-date-${lessonId}`}
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                New lesson date
              </label>

              <input
                id={`lesson-date-${lessonId}`}
                type="date"
                value={lessonDate}
                onChange={(event) =>
                  setLessonDate(event.target.value)
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-[#DCD8D2]
                  bg-white
                  px-3
                  py-2.5
                  font-sans
                  text-[13px]
                  text-[#292929]
                  outline-none
                  focus:border-[#6F8F72]
                "
              />

              <label
                htmlFor={`lesson-time-${lessonId}`}
                className="
                  mt-4
                  block
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                New lesson time
              </label>

              <input
                id={`lesson-time-${lessonId}`}
                type="time"
                value={lessonTime}
                onChange={(event) =>
                  setLessonTime(event.target.value)
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-[#DCD8D2]
                  bg-white
                  px-3
                  py-2.5
                  font-sans
                  text-[13px]
                  text-[#292929]
                  outline-none
                  focus:border-[#6F8F72]
                "
              />
            </div>
          )}

          {action === "student_cancelled_credit" && (
            <p className="mt-5 font-sans text-[12px] leading-5 text-[#777771]">
              The lesson will remain available as credit and
              will not be consumed.
            </p>
          )}

          {action === "teacher_cancelled" && (
            <p className="mt-5 font-sans text-[12px] leading-5 text-[#777771]">
              The lesson will not be consumed. You can
              reschedule it later if needed.
            </p>
          )}

          {action === "scheduled" && (
            <p className="mt-5 font-sans text-xs leading-5 text-[#777771]">This returns the lesson to scheduled without consuming a lesson. Its existing date and time are retained.</p>
          )}

          <div className="mt-5">
            <label
              htmlFor={`lesson-notes-${lessonId}`}
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#6F8F72]
              "
            >
              Notes
            </label>

            <textarea
              id={`lesson-notes-${lessonId}`}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={3}
              placeholder="Optional"
              className="
                mt-2
                w-full
                resize-none
                rounded-xl
                border
                border-[#DCD8D2]
                bg-white
                px-3
                py-2.5
                font-sans
                text-[13px]
                leading-5
                text-[#292929]
                outline-none
                placeholder:text-[#AAA69F]
                focus:border-[#6F8F72]
              "
            />
          </div>

          {error && (
            <p className="mt-4 font-sans text-[12px] leading-5 text-[#9A5A52]">
              {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={loading}
              className="
                rounded-full
                px-4
                py-2
                font-sans
                text-[12px]
                text-[#777771]
                transition-colors
                hover:bg-[#F0F4ED]
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={
                loading ||
                (action === "unexpected_circumstance" &&
                  !unexpectedResolution)
              }
              className="
                rounded-full
                bg-[#6F8F72]
                px-5
                py-2
                font-sans
                text-[12px]
                font-medium
                text-white
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
      </dialog>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-left
        font-sans
        text-[13px]
        text-[#4F534F]
        transition-colors
        hover:bg-[#F0F4ED]
        hover:text-[#6F8F72]
      "
    >
      <span className="text-[#6F8F72]">
        {icon}
      </span>

      {label}
    </button>
  );
}