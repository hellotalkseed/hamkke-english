"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  X,
} from "lucide-react";

type LessonStatus =
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

interface Lesson {
  id: string;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: LessonStatus;
  notes: string | null;
  original_lesson_date: string | null;
  rescheduled_at: string | null;
  consumes_lesson: boolean;
  resolution: Resolution;
}

interface LessonManagerProps {
  locale: string;
  studentId: string;
  enrollmentId: string;
  lessons: Lesson[];
}

const STATUS_LABELS: Record<LessonStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  no_show: "No-show",
  late_cancellation: "Late cancellation",
  student_cancelled_rescheduled:
    "Student cancelled · Rescheduled",
  student_cancelled_credit:
    "Student cancelled · Credit",
  unexpected_circumstance:
    "Unexpected circumstance",
  teacher_cancelled: "Teacher cancelled",
};

const RESOLUTION_LABELS: Record<
  Exclude<Resolution, null>,
  string
> = {
  rescheduled: "Reschedule",
  lesson_credit: "Lesson credit",
  counted_as_completed: "Count as completed",
};

export default function LessonManager({
  locale,
  studentId,
  enrollmentId,
  lessons,
}: LessonManagerProps) {
  const [items, setItems] = useState(lessons);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  return (
    <div className="space-y-3">
      {items.map((lesson) => (
        <LessonEditor
          key={lesson.id}
          lesson={lesson}
          locale={locale}
          studentId={studentId}
          enrollmentId={enrollmentId}
          isEditing={editingId === lesson.id}
          onEdit={() => setEditingId(lesson.id)}
          onCancel={() => setEditingId(null)}
          onSaved={(updated) => {
            setItems((current) =>
              current.map((item) =>
                item.id === updated.id
                  ? {
                      ...item,
                      ...updated,
                    }
                  : item
              )
            );

            setEditingId(null);
          }}
        />
      ))}
    </div>
  );
}

function LessonEditor({
  lesson,
  locale,
  studentId,
  enrollmentId,
  isEditing,
  onEdit,
  onCancel,
  onSaved,
}: {
  lesson: Lesson;
  locale: string;
  studentId: string;
  enrollmentId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (lesson: {
    id: string;
    attendance_status: LessonStatus;
    consumes_lesson: boolean;
    resolution: Resolution;
    lesson_date: string | null;
  }) => void;
}) {
  const [status, setStatus] =
    useState<LessonStatus>(lesson.attendance_status);

  const [resolution, setResolution] =
    useState<Resolution>(lesson.resolution);

  const [lessonDate, setLessonDate] =
    useState<string>(lesson.lesson_date ?? "");

  const [notes, setNotes] =
    useState<string>(lesson.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const needsResolution =
    status === "student_cancelled_rescheduled" ||
    status === "student_cancelled_credit" ||
    status === "unexpected_circumstance" ||
    status === "teacher_cancelled";

  const needsDate =
    resolution === "rescheduled";

  function changeStatus(nextStatus: LessonStatus) {
    setStatus(nextStatus);
    setError("");

    if (
      nextStatus === "student_cancelled_rescheduled"
    ) {
      setResolution("rescheduled");
      return;
    }

    if (
      nextStatus === "student_cancelled_credit"
    ) {
      setResolution("lesson_credit");
      return;
    }

    if (
      nextStatus === "completed" ||
      nextStatus === "no_show" ||
      nextStatus === "late_cancellation" ||
      nextStatus === "scheduled"
    ) {
      setResolution(null);
    }
  }

  function changeResolution(
    nextResolution: Resolution
  ) {
    setResolution(nextResolution);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/enrollments/${enrollmentId}/lessons/${lesson.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            resolution,
            lesson_date:
              needsDate && lessonDate
                ? lessonDate
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

      onSaved({
        id: lesson.id,
        attendance_status: data.lesson.status,
        consumes_lesson:
          data.lesson.consumes_lesson,
        resolution: data.lesson.resolution,
        lesson_date:
          data.lesson.lesson_date,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update lesson."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#DCD8D2]
        bg-white/40
      "
    >
      {/* LESSON ROW */}

      <div
        className="
          flex
          flex-col
          gap-5
          p-5

          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-6
        "
      >
        <div className="flex items-center gap-5">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F0F4ED]
              font-serif
              text-[17px]
              text-[#6F8F72]
            "
          >
            {lesson.lesson_number}
          </div>

          <div>
            <p className="font-serif text-[20px]">
              {formatDate(lesson.lesson_date)}
            </p>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
                font-sans
                text-[13px]
                text-[#777771]
              "
            >
              <CalendarDays
                size={13}
                strokeWidth={1.5}
              />

              {lesson.duration ?? "—"} minutes

              {lesson.original_lesson_date &&
                lesson.lesson_date &&
                lesson.original_lesson_date !==
                  lesson.lesson_date && (
                  <span>
                    · originally{" "}
                    {formatDate(
                      lesson.original_lesson_date
                    )}
                  </span>
                )}
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            gap-4

            sm:justify-end
          "
        >
          <div className="flex items-center gap-3">
            <StatusBadge
              status={lesson.attendance_status}
            />

            {lesson.consumes_lesson && (
              <span
                className="
                  font-sans
                  text-[11px]
                  text-[#777771]
                "
              >
                Consumed
              </span>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={onEdit}
              className="
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-[#DCD8D2]
                text-[#6F8F72]
                transition
                hover:bg-[#F0F4ED]
              "
              aria-label={`Edit lesson ${lesson.lesson_number}`}
            >
              <Pencil
                size={14}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>
      </div>

      {/* EDITOR */}

      {isEditing && (
        <div
          className="
            border-t
            border-[#DCD8D2]
            bg-[#FAF8F5]
            p-5

            sm:p-6
          "
        >
          <div className="grid gap-6">
            {/* STATUS */}

            <div>
              <label
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                Outcome
              </label>

              <div className="relative mt-2">
                <select
                  value={status}
                  onChange={(event) =>
                    changeStatus(
                      event.target
                        .value as LessonStatus
                    )
                  }
                  className="
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-[#DCD8D2]
                    bg-white
                    px-4
                    py-3
                    pr-10
                    font-sans
                    text-[14px]
                    text-[#292929]
                    outline-none
                    focus:border-[#6F8F72]
                  "
                >
                  {Object.entries(
                    STATUS_LABELS
                  ).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#777771]
                  "
                />
              </div>
            </div>

            {/* RESOLUTION */}

            {needsResolution && (
              <div>
                <label
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
                </label>

                <div className="relative mt-2">
                  <select
                    value={resolution ?? ""}
                    onChange={(event) =>
                      changeResolution(
                        event.target
                          .value === ""
                          ? null
                          : (event.target
                              .value as Resolution)
                      )
                    }
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-[#DCD8D2]
                      bg-white
                      px-4
                      py-3
                      pr-10
                      font-sans
                      text-[14px]
                      text-[#292929]
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  >
                    <option value="">
                      Select resolution
                    </option>

                    {(
                      Object.entries(
                        RESOLUTION_LABELS
                      ) as [
                        Exclude<
                          Resolution,
                          null
                        >,
                        string
                      ][]
                    ).map(
                      ([value, label]) => (
                        <option
                          key={value}
                          value={value}
                        >
                          {label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#777771]
                    "
                  />
                </div>
              </div>
            )}

            {/* RESCHEDULE DATE */}

            {needsDate && (
              <div>
                <label
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
                  type="date"
                  value={lessonDate}
                  onChange={(event) =>
                    setLessonDate(
                      event.target.value
                    )
                  }
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-[#DCD8D2]
                    bg-white
                    px-4
                    py-3
                    font-sans
                    text-[14px]
                    text-[#292929]
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>
            )}

            {/* NOTES */}

            <div>
              <label
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
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={3}
                placeholder="Optional lesson note..."
                className="
                  mt-2
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[#DCD8D2]
                  bg-white
                  px-4
                  py-3
                  font-sans
                  text-[14px]
                  leading-6
                  text-[#292929]
                  outline-none
                  placeholder:text-[#AAA69F]
                  focus:border-[#6F8F72]
                "
              />
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-[#E4CFC9]
                  bg-[#F8EFEC]
                  px-4
                  py-3
                  font-sans
                  text-[13px]
                  text-[#8A6258]
                "
              >
                {error}
              </div>
            )}

            {/* ACTIONS */}

            <div
              className="
                flex
                flex-col
                gap-2

                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-[#DCD8D2]
                  px-5
                  py-2.5
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#5F655F]
                  transition
                  hover:bg-white
                  disabled:opacity-50
                "
              >
                <X
                  size={14}
                  strokeWidth={1.5}
                />
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#6F8F72]
                  px-5
                  py-2.5
                  font-sans
                  text-[12px]
                  font-medium
                  text-white
                  transition
                  hover:bg-[#5F7F63]
                  disabled:opacity-50
                "
              >
                {saving ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Saving
                  </>
                ) : (
                  <>
                    <Check
                      size={14}
                      strokeWidth={1.5}
                    />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: LessonStatus;
}) {
  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-[#F0F4ED]
        px-4
        py-2
        font-sans
        text-[11px]
        font-medium
        uppercase
        tracking-[0.08em]
        text-[#6F8F72]
      "
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Date not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}