"use client";

import PortalSignOut from "@/components/admin/PortalSignOut";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarPlus, FileText, Home, UserRound, Users, Wallet } from "lucide-react";


function teacherPortalNav(locale: string) {
  return [
    { label: "Home", href: `/${locale}/admin/teachers`, icon: Home },
    { label: "My Lessons", href: `/${locale}/admin/teachers/lessons`, icon: CalendarDays },
    { label: "My Students", href: `/${locale}/admin/teachers/students`, icon: Users },
    { label: "Progress Reports", href: `/${locale}/admin/teachers/progress-reports`, icon: FileText },
    { label: "Availability", href: `/${locale}/admin/teachers/availability`, icon: CalendarDays },
    { label: "My Profile", href: `/${locale}/admin/teachers/profile`, icon: UserRound },
    { label: "Teacher Agreement", href: `/${locale}/admin/teachers/agreement`, icon: FileText },
    { label: "Payroll", href: `/${locale}/admin/teachers/payroll`, icon: Wallet },
  ];
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const START_HOUR = 5;
const END_HOUR = 24;
const SLOT_MINUTES = 30;

interface AvailabilityBlock {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface SubAvailabilityBlock {
  id?: string;
  availability_date: string;
  start_time: string;
  end_time: string;
}

interface AvailabilityResponse {
  teacher?: {
    id: string;
    full_name: string | null;
  };
  availability?: AvailabilityBlock[];
  sub_availability?: SubAvailabilityBlock[];
  error?: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
  key: string;
  label: string;
}

interface TimePeriod {
  label: string;
  startHour: number;
  endHour: number;
}

const TIME_PERIODS: TimePeriod[] = [
  {
    label: "Morning",
    startHour: 5,
    endHour: 12,
  },
  {
    label: "Afternoon",
    startHour: 12,
    endHour: 17,
  },
  {
    label: "Evening",
    startHour: 17,
    endHour: 24,
  },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeKey(hour: number, minute: number) {
  return `${pad(hour)}:${pad(minute)}`;
}

function formatTime(hour: number, minute: number) {
  if (hour === 24) {
    return `12:${pad(minute)} AM`;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${pad(minute)} ${suffix}`;
}

function getTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (
    let minutes = START_HOUR * 60;
    minutes < END_HOUR * 60;
    minutes += SLOT_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push({
      hour,
      minute,
      key: timeKey(hour, minute),
      label: formatTime(hour, minute),
    });
  }

  return slots;
}

function createSlotKey(day: number, time: string) {
  return `${day}-${time.slice(0, 5)}`;
}

function createDateSlotKey(date: string, time: string) {
  return `${date}-${time.slice(0, 5)}`;
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = pad(today.getMonth() + 1);
  const day = pad(today.getDate());

  return `${year}-${month}-${day}`;
}

function getSlotsForPeriod(
  timeSlots: TimeSlot[],
  period: TimePeriod
) {
  return timeSlots.filter(
    (slot) =>
      slot.hour >= period.startHour &&
      slot.hour < period.endHour
  );
}

function getEndTimeForSlot(slot: TimeSlot) {
  const totalMinutes =
    slot.hour * 60 + slot.minute + SLOT_MINUTES;

  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return timeKey(hour, minute);
}

export default function TeacherAvailabilityPage() {
  const params = useParams();
  const locale = params?.locale as string;

  const [teacherName, setTeacherName] = useState("");

  /*
   * REGULAR AVAILABILITY
   */

  const [selectedDay, setSelectedDay] =
    useState<number | null>(null);

  const [regularSlots, setRegularSlots] =
    useState<Set<string>>(new Set());

  const [availabilityView, setAvailabilityView] =
    useState<"regular" | "additional">("regular");

  const [quickDays, setQuickDays] =
    useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

  const [quickStart, setQuickStart] =
    useState("17:00");

  const [quickEnd, setQuickEnd] =
    useState("21:00");

  /*
   * ADDITIONAL / DATE-SPECIFIC AVAILABILITY
   */

  const [subDates, setSubDates] =
    useState<string[]>([]);

  const [selectedSubDate, setSelectedSubDate] =
    useState<string | null>(null);

  const [subSlots, setSubSlots] =
    useState<Set<string>>(new Set());

  /*
   * PAGE STATE
   */

  const [loading, setLoading] = useState(true);

  const [savingRegular, setSavingRegular] =
    useState(false);

  const [savingSub, setSavingSub] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const timeSlots = useMemo(
    () => getTimeSlots(),
    []
  );

  /*
   * LOAD AVAILABILITY
   */

  useEffect(() => {
    async function loadAvailability() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/teachers/availability",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: AvailabilityResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load availability."
          );
        }

        setTeacherName(
          data.teacher?.full_name || ""
        );

        /*
         * REGULAR AVAILABILITY
         */

        const loadedRegularSlots =
          new Set<string>();

        for (
          const block of data.availability || []
        ) {
          const startParts = block.start_time
            .slice(0, 5)
            .split(":");

          const endParts = block.end_time
            .slice(0, 5)
            .split(":");

          let currentMinutes =
            Number(startParts[0]) * 60 +
            Number(startParts[1]);

          const endMinutes =
            Number(endParts[0]) * 60 +
            Number(endParts[1]);

          while (currentMinutes < endMinutes) {
            const hour =
              Math.floor(currentMinutes / 60);

            const minute =
              currentMinutes % 60;

            loadedRegularSlots.add(
              createSlotKey(
                block.day_of_week,
                timeKey(hour, minute)
              )
            );

            currentMinutes += SLOT_MINUTES;
          }
        }

        setRegularSlots(loadedRegularSlots);

        const firstAvailableDay = DAYS.find(
          (day) =>
            Array.from(
              loadedRegularSlots
            ).some((key) =>
              key.startsWith(
                `${day.value}-`
              )
            )
        );

        setSelectedDay(
          firstAvailableDay?.value ?? 1
        );

        /*
         * ADDITIONAL / DATE-SPECIFIC AVAILABILITY
         */

        const loadedSubSlots =
          new Set<string>();

        const loadedSubDates =
          new Set<string>();

        for (
          const block of
            data.sub_availability || []
        ) {
          const date =
            block.availability_date;

          loadedSubDates.add(date);

          const startParts = block.start_time
            .slice(0, 5)
            .split(":");

          const endParts = block.end_time
            .slice(0, 5)
            .split(":");

          let currentMinutes =
            Number(startParts[0]) * 60 +
            Number(startParts[1]);

          const endMinutes =
            Number(endParts[0]) * 60 +
            Number(endParts[1]);

          while (currentMinutes < endMinutes) {
            const hour =
              Math.floor(currentMinutes / 60);

            const minute =
              currentMinutes % 60;

            loadedSubSlots.add(
              createDateSlotKey(
                date,
                timeKey(hour, minute)
              )
            );

            currentMinutes += SLOT_MINUTES;
          }
        }

        const sortedSubDates =
          Array.from(
            loadedSubDates
          ).sort();

        setSubSlots(loadedSubSlots);
        setSubDates(sortedSubDates);

        setSelectedSubDate(
          sortedSubDates[0] ?? null
        );
      } catch (err) {
        console.error(
          "Load availability error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load availability."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, []);

  /*
   * REGULAR SLOT TOGGLE
   */

  function toggleRegularSlot(
    day: number,
    time: string
  ) {
    setMessage("");
    setError("");

    setRegularSlots((current) => {
      const next = new Set(current);

      const key = createSlotKey(day, time);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  /*
   * GET SELECTED REGULAR SLOTS FOR A DAY
   */

  function getSelectedRegularSlots(
    day: number
  ) {
    return timeSlots.filter((slot) =>
      regularSlots.has(
        createSlotKey(day, slot.key)
      )
    );
  }

  /*
   * CONVERT REGULAR SLOTS TO BLOCKS
   */

  function convertSlotsToBlocks() {
    const blocks: AvailabilityBlock[] = [];

    for (const day of DAYS) {
      let blockStart: string | null = null;

      for (
        let i = 0;
        i < timeSlots.length;
        i++
      ) {
        const slot = timeSlots[i];

        const selected =
          regularSlots.has(
            createSlotKey(
              day.value,
              slot.key
            )
          );

        const nextSlot =
          timeSlots[i + 1];

        if (selected && !blockStart) {
          blockStart = slot.key;
        }

        const shouldEndBlock =
          blockStart &&
          (
            !selected ||
            !nextSlot
          );

        if (shouldEndBlock) {
          const endTime =
            selected && !nextSlot
              ? getEndTimeForSlot(slot)
              : slot.key;

          blocks.push({
            day_of_week: day.value,
            start_time:
              `${blockStart}:00`,
            end_time:
              `${endTime}:00`,
          });

          blockStart = null;
        }
      }
    }

    return blocks;
  }

  /*
   * SAVE REGULAR AVAILABILITY
   */

  async function saveRegularAvailability() {
    try {
      setSavingRegular(true);
      setMessage("");
      setError("");

      const availability =
        convertSlotsToBlocks();

      const response = await fetch(
        "/api/admin/teachers/availability",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            availability,
          }),
        }
      );

      const data: AvailabilityResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save availability."
        );
      }

      setMessage(
        "Your regular schedule has been saved."
      );
    } catch (err) {
      console.error(
        "Save regular availability error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save availability."
      );
    } finally {
      setSavingRegular(false);
    }
  }

  /*
   * ADD DATE
   */

  function addSubDate() {
    const today = getTodayString();

    setSubDates((current) => {
      if (current.includes(today)) {
        return current;
      }

      return [...current, today].sort();
    });

    setSelectedSubDate(today);
    setMessage("");
    setError("");
  }

  function removeSubDate(date: string) {
    setSubDates((current) =>
      current.filter(
        (item) => item !== date
      )
    );

    setSubSlots((current) => {
      const next = new Set(current);

      for (const slot of timeSlots) {
        next.delete(
          createDateSlotKey(
            date,
            slot.key
          )
        );
      }

      return next;
    });

    if (selectedSubDate === date) {
      const remainingDates =
        subDates.filter(
          (item) => item !== date
        );

      setSelectedSubDate(
        remainingDates[0] ?? null
      );
    }

    setMessage("");
    setError("");
  }

  function updateSubDate(date: string) {
    setSubDates((current) => {
      if (current.includes(date)) {
        return current;
      }

      return [...current, date].sort();
    });

    setSelectedSubDate(date);
    setMessage("");
    setError("");
  }

  /*
   * ADDITIONAL SLOT TOGGLE
   */

  function toggleSubSlot(
    date: string,
    time: string
  ) {
    setMessage("");
    setError("");

    setSubSlots((current) => {
      const next = new Set(current);

      const key = createDateSlotKey(
        date,
        time
      );

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  function getSelectedSubSlots(
    date: string
  ) {
    return timeSlots.filter((slot) =>
      subSlots.has(
        createDateSlotKey(
          date,
          slot.key
        )
      )
    );
  }

  /*
   * CONVERT DATE-SPECIFIC SLOTS TO BLOCKS
   */

  function convertSubSlotsToBlocks() {
    const blocks: SubAvailabilityBlock[] = [];

    const sortedDates = [...subDates].sort();

    for (const date of sortedDates) {
      let blockStart: string | null = null;

      for (
        let i = 0;
        i < timeSlots.length;
        i++
      ) {
        const slot = timeSlots[i];

        const selected =
          subSlots.has(
            createDateSlotKey(
              date,
              slot.key
            )
          );

        const nextSlot =
          timeSlots[i + 1];

        if (selected && !blockStart) {
          blockStart = slot.key;
        }

        const shouldEndBlock =
          blockStart &&
          (
            !selected ||
            !nextSlot
          );

        if (shouldEndBlock) {
          const endTime =
            selected && !nextSlot
              ? getEndTimeForSlot(slot)
              : slot.key;

          blocks.push({
            availability_date: date,
            start_time:
              `${blockStart}:00`,
            end_time:
              `${endTime}:00`,
          });

          blockStart = null;
        }
      }
    }

    return blocks;
  }

  /*
   * SAVE ADDITIONAL AVAILABILITY
   */

  async function saveSubAvailability() {
    try {
      setSavingSub(true);
      setMessage("");
      setError("");

      const subAvailability =
        convertSubSlotsToBlocks();

      const response = await fetch(
        "/api/admin/teachers/availability",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sub_availability:
              subAvailability,
          }),
        }
      );

      const data: AvailabilityResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save additional availability."
        );
      }

      /*
       * Remove empty date cards after saving.
       * A date with no selected slots has no
       * corresponding database record.
       */

      const savedDates = Array.from(
        new Set(
          subAvailability.map(
            (block) =>
              block.availability_date
          )
        )
      ).sort();

      setSubDates(savedDates);

      if (
        selectedSubDate &&
        !savedDates.includes(
          selectedSubDate
        )
      ) {
        setSelectedSubDate(
          savedDates[0] ?? null
        );
      }

      setMessage(
        subAvailability.length > 0
          ? "Your additional availability has been saved."
          : "Your additional availability has been cleared."
      );
    } catch (err) {
      console.error(
        "Save additional availability error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save additional availability."
      );
    } finally {
      setSavingSub(false);
    }
  }

  /*
   * QUICK APPLY
   *
   * This is intentionally only a UI convenience layer. It writes into the
   * same regularSlots Set used by individual 30-minute slot editing, so the
   * existing conversion and API save logic remain the source of truth.
   */

  function toggleQuickDay(day: number) {
    setQuickDays((current) => {
      const next = new Set(current);

      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }

      return next;
    });

    setMessage("");
    setError("");
  }

  function setQuickDayPreset(days: number[]) {
    setQuickDays(new Set(days));
    setMessage("");
    setError("");
  }

  function applyQuickAvailability() {
    setMessage("");
    setError("");

    if (quickDays.size === 0) {
      setError("Choose at least one day for Quick Apply.");
      return;
    }

    const startIndex = timeSlots.findIndex(
      (slot) => slot.key === quickStart
    );

    const endMinutes =
      quickEnd === "24:00"
        ? 24 * 60
        : Number(quickEnd.slice(0, 2)) * 60 +
          Number(quickEnd.slice(3, 5));

    const startMinutes =
      Number(quickStart.slice(0, 2)) * 60 +
      Number(quickStart.slice(3, 5));

    if (startIndex < 0 || endMinutes <= startMinutes) {
      setError("Choose an end time that is later than the start time.");
      return;
    }

    setRegularSlots((current) => {
      const next = new Set(current);

      for (const day of quickDays) {
        for (const slot of timeSlots) {
          const slotMinutes =
            slot.hour * 60 + slot.minute;

          if (
            slotMinutes >= startMinutes &&
            slotMinutes < endMinutes
          ) {
            next.add(
              createSlotKey(day, slot.key)
            );
          }
        }
      }

      return next;
    });

    const selectedLabels = DAYS
      .filter((day) => quickDays.has(day.value))
      .map((day) => day.label)
      .join(", ");

    setMessage(
      `Added ${formatTime(
        Number(quickStart.slice(0, 2)),
        Number(quickStart.slice(3, 5))
      )}–${
        quickEnd === "24:00"
          ? "12:00 AM"
          : formatTime(
              Number(quickEnd.slice(0, 2)),
              Number(quickEnd.slice(3, 5))
            )
      } to ${selectedLabels}. Existing hours were kept. Save the schedule when you're ready.`
    );
  }

  const quickEndOptions = [
    ...timeSlots.slice(1).map((slot) => ({
      key: slot.key,
      label: slot.label,
    })),
    {
      key: "24:00",
      label: "12:00 AM",
    },
  ];

  /*
   * PERIOD SLOT BUTTONS
   */

  function renderTimeSlots(
    slots: TimeSlot[],
    selected: (slot: TimeSlot) => boolean,
    onClick: (slot: TimeSlot) => void,
    selectedClassName: string,
    unselectedClassName: string
  ) {
    return (
      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-x-2
          gap-y-2
        "
      >
        {slots.map((slot) => {
          const isSelected = selected(slot);

          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => onClick(slot)}
              aria-pressed={isSelected}
              className={`
                flex
                min-w-0
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                px-2
                py-2.5
                font-sans
                text-[13px]
                font-normal
                whitespace-nowrap
                transition

                sm:px-2.5
                sm:text-[14px]

                ${
                  isSelected
                    ? selectedClassName
                    : unselectedClassName
                }
              `}
            >
              <span>{slot.label}</span>

              {isSelected && (
                <span className="shrink-0">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  const firstName = teacherName.trim().split(/\s+/)[0] || "T";

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col lg:overflow-y-auto">
          <div>
            <p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p>
            <p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p>
          </div>

          <nav className="mt-9 space-y-1.5">
            {teacherPortalNav(locale).map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
                  label === "Availability"
                    ? "bg-[#E2EBDD] font-medium text-[#49614D]"
                    : "text-[#5F5C57] hover:bg-[#ECE8E2]"
                }`}
              >
                <Icon size={16} strokeWidth={1.6} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#DED7CF] pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-medium">{teacherName || "Teacher"}</p>
                <p className="text-[11px] text-[#8A857E]">Teacher</p>
              </div>
            </div>
          </div>
        <PortalSignOut locale={locale} /></aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">
              Teacher Portal
            </p>
            <h1 className="mt-2 font-serif text-[28px] tracking-[-0.025em] sm:text-[40px]">
              Availability
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#817B74]">
              Set your regular teaching hours or add one-time openings.
            </p>
            <p className="mt-1 text-[11px] text-[#9A948C]">
              Philippine Time (PHT)
            </p>

            {loading ? (
              <div className="mt-12 text-center text-[13px] text-[#777]">
                Loading your availability...
              </div>
            ) : (
              <>
                <div className="mx-auto mt-7 grid max-w-[820px] gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityView("regular");
                      setMessage("");
                      setError("");
                    }}
                    aria-pressed={availabilityView === "regular"}
                    className={`flex min-h-[112px] flex-col items-center justify-center rounded-[20px] border px-6 py-5 text-center transition ${
                      availabilityView === "regular"
                        ? "border-[#8EAD91] bg-[#EEF4EB] text-[#55705A] shadow-[inset_0_0_0_1px_rgba(111,143,114,0.08)]"
                        : "border-[#DED5CA] bg-white text-[#454545] hover:border-[#B8C9B5] hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <CalendarDays size={28} strokeWidth={1.6} />
                    <span className="mt-3 text-[16px] font-semibold">
                      Regular Availability
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityView("additional");
                      setMessage("");
                      setError("");
                    }}
                    aria-pressed={availabilityView === "additional"}
                    className={`flex min-h-[112px] flex-col items-center justify-center rounded-[20px] border px-6 py-5 text-center transition ${
                      availabilityView === "additional"
                        ? "border-[#8EAD91] bg-[#EEF4EB] text-[#55705A] shadow-[inset_0_0_0_1px_rgba(111,143,114,0.08)]"
                        : "border-[#DED5CA] bg-white text-[#454545] hover:border-[#B8C9B5] hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <CalendarPlus size={28} strokeWidth={1.6} />
                    <span className="mt-3 text-[16px] font-semibold">
                      Additional Availability
                    </span>
                  </button>
                </div>

                {availabilityView === "regular" ? (
                  <section className="mt-7 rounded-[28px] border border-[#E5DDD3] bg-[#F3EFE8] p-5 sm:p-7 lg:p-8">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                        Regular Class Schedule
                      </p>
                      <h2 className="mt-2 font-serif text-[27px] tracking-[-0.02em]">
                        Weekly availability
                      </h2>
                      <p className="mt-1 text-[13px] leading-6 text-[#817B74]">
                        Repeats every week. Use Quick Apply to update several days at once.
                      </p>
                    </div>

                    <div className="mt-5 rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[14px] font-semibold">Quick apply</h3>
                          <p className="mt-1 text-[12px] text-[#8A857E]">
                            Choose days and add one time range to all of them.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Weekdays", days: [1, 2, 3, 4, 5] },
                            { label: "Weekend", days: [0, 6] },
                            { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setQuickDayPreset(preset.days)}
                              className="rounded-full border border-[#D8CCBE] px-3 py-2 text-[11px] font-medium text-[#5F7F63] transition hover:border-[#6F8F72] hover:bg-[#F4F7F2]"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                        {DAYS.map((day) => {
                          const selected = quickDays.has(day.value);

                          return (
                            <button
                              key={day.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleQuickDay(day.value)}
                              className={`rounded-xl border px-3 py-2.5 text-[12px] font-medium transition ${
                                selected
                                  ? "border-[#AFC2AC] bg-[#EAF1E7] text-[#55705A]"
                                  : "border-[#E4DDD4] bg-[#FCFBF9] text-[#777] hover:border-[#B8C9B5]"
                              }`}
                            >
                              {day.label.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <label className="text-[12px] font-medium text-[#5F5C57]">
                          From
                          <select
                            value={quickStart}
                            onChange={(event) => setQuickStart(event.target.value)}
                            className="mt-2 block w-full rounded-xl border border-[#D8CCBE] bg-white px-3 py-3 text-[14px] outline-none focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
                          >
                            {timeSlots.map((slot) => (
                              <option key={slot.key} value={slot.key}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[12px] font-medium text-[#5F5C57]">
                          To
                          <select
                            value={quickEnd}
                            onChange={(event) => setQuickEnd(event.target.value)}
                            className="mt-2 block w-full rounded-xl border border-[#D8CCBE] bg-white px-3 py-3 text-[14px] outline-none focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
                          >
                            {quickEndOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          type="button"
                          onClick={applyQuickAvailability}
                          className="rounded-xl bg-[#6F8F72] px-5 py-3 text-[13px] font-medium text-white transition hover:bg-[#5F7F63]"
                        >
                          Apply to selected days
                        </button>
                      </div>

                      <p className="mt-3 text-[11px] leading-5 text-[#999]">
                        Quick Apply adds these hours. It does not remove availability you already selected.
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h3 className="text-[14px] font-semibold">Your weekly schedule</h3>
                          <p className="mt-1 text-[12px] text-[#8A857E]">
                            Select a day to edit its individual 30-minute slots.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                        {DAYS.map((day) => {
                          const count = getSelectedRegularSlots(day.value).length;
                          const active = selectedDay === day.value;

                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => setSelectedDay(day.value)}
                              className={`rounded-xl border p-3 text-left transition ${
                                active
                                  ? "border-[#AFC2AC] bg-[#EAF1E7]"
                                  : "border-[#E7DDD1] bg-white hover:border-[#B8C9B5]"
                              }`}
                            >
                              <span className={`block text-[13px] font-medium ${active ? "text-[#55705A]" : "text-[#555]"}`}>
                                {day.label}
                              </span>
                              <span className="mt-1 block text-[11px] text-[#999]">
                                {count > 0 ? `${count} slots` : "Not set"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedDay !== null && (
                      <div className="mt-4 rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                              Editing day
                            </p>
                            <h3 className="mt-1 font-serif text-[22px]">
                              {DAYS.find((day) => day.value === selectedDay)?.label}
                            </h3>
                          </div>
                          <span className="text-[11px] text-[#999]">
                            {getSelectedRegularSlots(selectedDay).length} slots selected
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                          {TIME_PERIODS.map((period) => {
                            const periodSlots = getSlotsForPeriod(timeSlots, period);

                            return (
                              <div key={period.label} className="min-w-0">
                                <div className="flex items-baseline justify-between gap-2 border-b border-[#EEE8E1] pb-2">
                                  <p className="font-serif text-[17px]">{period.label}</p>
                                  <p className="text-[10px] text-[#AAA]">
                                    {formatTime(period.startHour, 0)} – {formatTime(period.endHour, 0)}
                                  </p>
                                </div>

                                {renderTimeSlots(
                                  periodSlots,
                                  (slot) =>
                                    regularSlots.has(
                                      createSlotKey(selectedDay, slot.key)
                                    ),
                                  (slot) =>
                                    toggleRegularSlot(selectedDay, slot.key),
                                  "border-[#B8C9B5] bg-[#EAF1E7] font-medium text-[#5F7F63]",
                                  "border-[#E7DDD1] bg-white text-[#666] hover:border-[#B8C9B5] hover:bg-[#F4F7F2]"
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#E7DDD1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-md text-[11px] leading-5 text-[#999]">
                        30-minute intervals work for both 25-minute and 50-minute classes.
                      </p>

                      <button
                        type="button"
                        onClick={saveRegularAvailability}
                        disabled={savingRegular}
                        className="rounded-full bg-[#6F8F72] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingRegular ? "Saving..." : "Save Schedule"}
                      </button>
                    </div>
                  </section>
                ) : (
                  <section className="mt-7 rounded-[28px] border border-[#E5DDD3] bg-[#F3EFE8] p-5 sm:p-7 lg:p-8">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                        One-time openings
                      </p>
                      <h2 className="mt-2 font-serif text-[27px] tracking-[-0.02em]">
                        Additional availability
                      </h2>
                      <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#817B74]">
                        Add availability for a specific date without changing your regular weekly schedule.
                      </p>
                    </div>

                    <div className="mt-5 rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
                      <label
                        htmlFor="sub-date"
                        className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6F8F72]"
                      >
                        Add a date
                      </label>

                      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <input
                          id="sub-date"
                          type="date"
                          min={getTodayString()}
                          onChange={(event) => {
                            if (event.target.value) {
                              updateSubDate(event.target.value);
                              event.target.value = "";
                            }
                          }}
                          className="rounded-xl border border-[#D8CCBE] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
                        />

                        <button
                          type="button"
                          onClick={addSubDate}
                          className="rounded-full border border-[#D8CCBE] px-5 py-3 text-[13px] font-medium text-[#5F7F63] transition hover:border-[#6F8F72] hover:bg-[#F4F7F2]"
                        >
                          + Add today
                        </button>
                      </div>
                    </div>

                    {subDates.length > 0 ? (
                      <>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {subDates.map((date) => {
                            const active = selectedSubDate === date;
                            const count = getSelectedSubSlots(date).length;

                            return (
                              <div
                                key={date}
                                className={`flex items-center gap-2 rounded-xl border p-2 ${
                                  active
                                    ? "border-[#AFC2AC] bg-[#EAF1E7]"
                                    : "border-[#E7DDD1] bg-white"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setSelectedSubDate(date)}
                                  className="min-w-0 flex-1 px-2 py-1.5 text-left"
                                >
                                  <span className="block truncate text-[12px] font-medium">
                                    {formatDate(date)}
                                  </span>
                                  <span className="mt-0.5 block text-[10px] text-[#999]">
                                    {count} slots
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeSubDate(date)}
                                  className="rounded-full px-2 py-1 text-[11px] text-[#A06A60] hover:bg-[#FBF1EE]"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {selectedSubDate && (
                          <div className="mt-4 rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                                  Editing date
                                </p>
                                <h3 className="mt-1 font-serif text-[21px]">
                                  {formatDate(selectedSubDate)}
                                </h3>
                              </div>
                              <span className="text-[11px] text-[#999]">
                                {getSelectedSubSlots(selectedSubDate).length} slots selected
                              </span>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                              {TIME_PERIODS.map((period) => {
                                const periodSlots = getSlotsForPeriod(timeSlots, period);

                                return (
                                  <div key={period.label} className="min-w-0">
                                    <div className="flex items-baseline justify-between gap-2 border-b border-[#EEE8E1] pb-2">
                                      <p className="font-serif text-[17px]">{period.label}</p>
                                      <p className="text-[10px] text-[#AAA]">
                                        {formatTime(period.startHour, 0)} – {formatTime(period.endHour, 0)}
                                      </p>
                                    </div>

                                    {renderTimeSlots(
                                      periodSlots,
                                      (slot) =>
                                        subSlots.has(
                                          createDateSlotKey(
                                            selectedSubDate,
                                            slot.key
                                          )
                                        ),
                                      (slot) =>
                                        toggleSubSlot(
                                          selectedSubDate,
                                          slot.key
                                        ),
                                      "border-[#B8C9B5] bg-[#EAF1E7] font-medium text-[#5F7F63]",
                                      "border-[#E7DDD1] bg-white text-[#666] hover:border-[#B8C9B5] hover:bg-[#F4F7F2]"
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex justify-end border-t border-[#E7DDD1] pt-5">
                          <button
                            type="button"
                            onClick={saveSubAvailability}
                            disabled={savingSub}
                            className="rounded-full bg-[#6F8F72] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingSub
                              ? "Saving..."
                              : "Save Additional Availability"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-5 rounded-[20px] border border-dashed border-[#D8CCBE] px-5 py-8 text-center">
                        <p className="text-[13px] text-[#777]">
                          No additional availability added yet.
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {message && (
                  <div className="mt-5 rounded-xl border border-[#D8E2D4] bg-[#F4F7F2] px-4 py-3 text-[12px] text-[#5F7F63]">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-xl border border-[#E5C8C0] bg-[#FBF1EE] px-4 py-3 text-[12px] text-[#9A5D50]">
                    {error}
                  </div>
                )}
              </>
            )}

            <div className="h-16" />
          </div>
        </section>
      </div>
    </main>
  );
}
