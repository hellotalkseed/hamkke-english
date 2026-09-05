"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

interface AvailabilityResponse {
  teacher?: {
    id: string;
    full_name: string | null;
  };
  availability?: AvailabilityBlock[];
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

  /*
   * SUB CLASS AVAILABILITY
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
   * LOAD REGULAR AVAILABILITY
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

        const slots = new Set<string>();

        for (const block of data.availability || []) {
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

          while (
            currentMinutes < endMinutes
          ) {
            const hour =
              Math.floor(currentMinutes / 60);

            const minute =
              currentMinutes % 60;

            slots.add(
              createSlotKey(
                block.day_of_week,
                timeKey(hour, minute)
              )
            );

            currentMinutes += SLOT_MINUTES;
          }
        }

        setRegularSlots(slots);

        const firstAvailableDay = DAYS.find(
          (day) =>
            Array.from(slots).some(
              (key) =>
                key.startsWith(
                  `${day.value}-`
                )
            )
        );

        setSelectedDay(
          firstAvailableDay?.value ?? 1
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
   * SAVE REGULAR AVAILABILITY
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
          (!selected || !nextSlot);

        if (shouldEndBlock) {
          const endTime =
            selected && !nextSlot
              ? timeKey(
                  slot.hour +
                    (slot.minute === 30
                      ? 1
                      : 0),
                  slot.minute === 30
                    ? 0
                    : 30
                )
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
   * SUB DATE
   */

  function addSubDate() {
    const today = getTodayString();

    if (!subDates.includes(today)) {
      setSubDates((current) => [
        ...current,
        today,
      ]);
    }

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
      setSelectedSubDate(null);
    }
  }

  function updateSubDate(date: string) {
    setSubDates((current) => {
      if (current.includes(date)) {
        return current;
      }

      return [...current, date];
    });

    setSelectedSubDate(date);
    setMessage("");
    setError("");
  }

  /*
   * SUB SLOT TOGGLE
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
   * SAVE SUB AVAILABILITY
   */

  async function saveSubAvailability() {
    setSavingSub(true);
    setMessage("");
    setError("");

    setTimeout(() => {
      setSavingSub(false);

      setMessage(
        "Your sub class availability is ready to be saved."
      );
    }, 400);
  }

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

  /*
   * RENDER
   */

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-5
        py-7
        text-[#292929]

        sm:px-8
        sm:py-8

        lg:px-10
        lg:py-8
      "
    >
      {/* TOP BAR */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-6
        "
      >
        <Link
          href={`/${locale}/admin/teachers`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#4F5960]
            transition
            hover:text-[#6F8F72]
          "
        >
          ← Hamkke
        </Link>

        <div className="text-right">
          <p
            className="
              font-sans
              text-[13px]
              font-semibold
              tracking-[0.18em]
              text-[#6F8F72]
            "
          >
            HAMKKE │ 함께
          </p>

          <p
            className="
              mt-1
              font-serif
              text-[14px]
              text-[#5F7F63]
            "
          >
            From Small Talk to Big Ideas
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px]">

        {/* PAGE HEADER */}

        <div
          className="
            mx-auto
            max-w-4xl
            pt-16
            text-center

            sm:pt-20
          "
        >
          <p
            className="
              font-sans
              text-[12px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-[#7D827F]
            "
          >
            Teacher Availability
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[44px]
              font-normal
              leading-[1.05]
              tracking-[-0.035em]
              text-[#292929]

              sm:text-[56px]

              lg:text-[64px]
            "
          >
            Availability
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-3xl
              font-serif
              text-[19px]
              leading-7
              text-[#4F5960]

              sm:text-[21px]
            "
          >
            Set your regular schedule and add
            extra availability when needed.
          </p>

          {teacherName && (
            <p
              className="
                mt-4
                font-sans
                text-[12px]
                text-[#999]
              "
            >
              {teacherName} · Philippine Time
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-12 text-center">
            <p
              className="
                font-sans
                text-[13px]
                text-[#777]
              "
            >
              Loading your availability...
            </p>
          </div>
        ) : (
          <>
            {/* ================================================= */}
            {/* REGULAR CLASS SCHEDULE */}
            {/* ================================================= */}

            <section
              className="
                mt-16
                rounded-[32px]
                border
                border-[#E5DDD3]
                bg-[#F1EDE6]
                p-6

                sm:mt-20
                sm:p-8

                lg:p-10
              "
            >
              <div className="max-w-4xl">

                {/* SECTION LABEL */}

                <p
                  className="
                    font-sans
                    text-[16px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#5F7F63]
                  "
                >
                  Regular Class Schedule
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[34px]
                    font-normal
                    leading-tight
                    tracking-[-0.025em]
                    text-[#292929]

                    sm:text-[38px]
                  "
                >
                  When are you available?
                </h2>

                <p
                  className="
                    mt-4
                    max-w-none
                    whitespace-nowrap
                    font-sans
                    text-[15px]
                    leading-7
                    text-[#777]

                    sm:text-[16px]
                  "
                >
                  Choose a day, then select the
                  30-minute periods when you can
                  teach. Your schedule repeats
                  every week.
                </p>
              </div>

              {/* DAYS */}

              <div className="mt-9">
                <p
                  className="
                    font-sans
                    text-[13px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Days
                </p>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2.5

                    sm:grid-cols-4

                    lg:grid-cols-7
                    lg:gap-3
                  "
                >
                  {DAYS.map((day) => {
                    const active =
                      selectedDay ===
                      day.value;

                    const hasAvailability =
                      getSelectedRegularSlots(
                        day.value
                      ).length > 0;

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          setSelectedDay(
                            day.value
                          )
                        }
                        className={`
                          flex
                          w-full
                          items-center
                          justify-center
                          rounded-full
                          border
                          px-3
                          py-3
                          font-sans
                          text-[14px]
                          font-medium
                          transition

                          ${
                            active
                              ? "border-[#6F8F72] bg-[#F4F7F2] text-[#5F7F63]"
                              : "border-[#D8CCBE] bg-white text-[#666] hover:border-[#6F8F72] hover:bg-[#F4F7F2]"
                          }
                        `}
                      >
                        {day.label}

                        {hasAvailability && (
                          <span
                            className="
                              ml-2
                              inline-block
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                              bg-[#6F8F72]
                            "
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DAY */}

              {selectedDay !== null && (
                <div
                  className="
                    mt-8
                    rounded-3xl
                    border
                    border-[#E7DDD1]
                    bg-white
                    p-6

                    sm:p-8
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <p
                        className="
                          font-sans
                          text-[12px]
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-[#6F8F72]
                        "
                      >
                        Selected Day
                      </p>

                      <h3
                        className="
                          mt-2
                          font-serif
                          text-[30px]
                          font-normal
                          tracking-[-0.02em]
                        "
                      >
                        {
                          DAYS.find(
                            (day) =>
                              day.value ===
                              selectedDay
                          )?.label
                        }
                      </h3>
                    </div>

                    <p
                      className="
                        font-sans
                        text-[13px]
                        text-[#999]
                      "
                    >
                      {
                        getSelectedRegularSlots(
                          selectedDay
                        ).length
                      }{" "}
                      slots
                    </p>
                  </div>

                  <p
                    className="
                      mt-4
                      font-sans
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    Select every 30-minute period
                    when you are available.
                  </p>

                  {/* TIME PERIODS */}

                  <div
                    className="
                      mt-8
                      grid
                      grid-cols-1
                      gap-5

                      md:grid-cols-3
                      md:gap-5

                      lg:gap-6
                    "
                  >
                    {TIME_PERIODS.map(
                      (period) => {
                        const periodSlots =
                          getSlotsForPeriod(
                            timeSlots,
                            period
                          );

                        return (
                          <div
                            key={period.label}
                            className="
                              min-w-0
                              rounded-2xl
                              border
                              border-[#E7DDD1]
                              bg-[#FCFBF9]
                              p-4

                              sm:p-5
                            "
                          >
                            {/* PERIOD HEADER */}

                            <div
                              className="
                                border-b
                                border-[#E7DDD1]
                                pb-3
                                text-center
                              "
                            >
                              <p
                                className="
                                  font-serif
                                  text-[23px]
                                  font-normal
                                  text-[#292929]
                                "
                              >
                                {period.label}
                              </p>

                              <p
                                className="
                                  mt-1
                                  font-sans
                                  text-[12px]
                                  text-[#999]
                                "
                              >
                                {formatTime(
                                  period.startHour,
                                  0
                                )}{" "}
                                –{" "}
                                {formatTime(
                                  period.endHour,
                                  0
                                )}
                              </p>
                            </div>

                            {/* TIME SLOTS */}

                            {renderTimeSlots(
                              periodSlots,
                              (slot) =>
                                regularSlots.has(
                                  createSlotKey(
                                    selectedDay,
                                    slot.key
                                  )
                                ),
                              (slot) =>
                                toggleRegularSlot(
                                  selectedDay,
                                  slot.key
                                ),
                              "border-[#B8C9B5] bg-[#EAF1E7] font-medium text-[#5F7F63]",
                              "border-[#E7DDD1] bg-white text-[#666] hover:border-[#B8C9B5] hover:bg-[#F4F7F2]"
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* SAVE */}

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#DDD4C8]
                  pt-6

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-md
                    font-sans
                    text-[12px]
                    leading-5
                    text-[#999]
                  "
                >
                  30-minute intervals work for
                  both 25-minute and 50-minute
                  classes.
                </p>

                <button
                  type="button"
                  onClick={
                    saveRegularAvailability
                  }
                  disabled={savingRegular}
                  className="
                    inline-flex
                    justify-center
                    rounded-full
                    bg-[#6F8F72]
                    px-7
                    py-3
                    font-sans
                    text-[13px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#5F7F63]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {savingRegular
                    ? "Saving..."
                    : "Save Schedule"}
                </button>
              </div>
            </section>

            {/* ================================================= */}
            {/* SUB CLASS AVAILABILITY */}
            {/* ================================================= */}

            <section
              className="
                mt-12
                rounded-[32px]
                border
                border-[#E5DDD3]
                bg-[#F3EFE8]
                p-6

                sm:mt-16
                sm:p-8

                lg:p-10
              "
            >
              <div className="max-w-4xl">

                {/* SECTION LABEL */}

                <p
                  className="
                    font-sans
                    text-[16px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#5F7F63]
                  "
                >
                  Sub Class Availability
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[30px]
                    font-normal
                    tracking-[-0.02em]
                    text-[#292929]
                  "
                >
                  Available on a specific day?
                </h2>

                <p
                  className="
                    mt-2.5
                    max-w-xl
                    font-sans
                    text-[13px]
                    leading-6
                    text-[#777]
                  "
                >
                  Add extra availability for a
                  specific date. These times do
                  not repeat every week.
                </p>
              </div>

              {/* ADD DATE */}

              <div className="mt-8">
                <label
                  htmlFor="sub-date"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Add a date
                </label>

                <div
                  className="
                    mt-3
                    flex
                    flex-col
                    gap-2.5

                    sm:flex-row
                    sm:items-center
                  "
                >
                  <input
                    id="sub-date"
                    type="date"
                    min={getTodayString()}
                    onChange={(event) => {
                      if (
                        event.target.value
                      ) {
                        updateSubDate(
                          event.target.value
                        );

                        event.target.value = "";
                      }
                    }}
                    className="
                      rounded-xl
                      border
                      border-[#D8CCBE]
                      bg-white
                      px-4
                      py-3
                      font-sans
                      text-[13px]
                      text-[#292929]
                      outline-none
                      focus:border-[#6F8F72]
                      focus:ring-2
                      focus:ring-[#E2EBDD]
                    "
                  />

                  <button
                    type="button"
                    onClick={addSubDate}
                    className="
                      inline-flex
                      justify-center
                      rounded-full
                      border
                      border-[#D8CCBE]
                      px-5
                      py-3
                      font-sans
                      text-[13px]
                      font-medium
                      text-[#5F7F63]
                      transition
                      hover:border-[#6F8F72]
                      hover:bg-[#F4F7F2]
                    "
                  >
                    + Add today
                  </button>
                </div>
              </div>

              {/* DATE LIST */}

              {subDates.length > 0 && (
                <div className="mt-7 space-y-3">
                  {subDates.map((date) => {
                    const active =
                      selectedSubDate === date;

                    const selectedCount =
                      getSelectedSubSlots(
                        date
                      ).length;

                    return (
                      <div
                        key={date}
                        className={`
                          rounded-3xl
                          border
                          p-5
                          transition

                          ${
                            active
                              ? "border-[#B8C9B5] bg-[#F4F7F2]"
                              : "border-[#E7DDD1] bg-white"
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-3

                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSubDate(
                                date
                              )
                            }
                            className="text-left"
                          >
                            <p
                              className="
                                font-serif
                                text-[23px]
                                font-normal
                                tracking-[-0.02em]
                              "
                            >
                              {formatDate(date)}
                            </p>

                            <p
                              className="
                                mt-0.5
                                font-sans
                                text-[12px]
                                text-[#999]
                              "
                            >
                              {selectedCount}{" "}
                              {selectedCount ===
                              1
                                ? "slot"
                                : "slots"}{" "}
                              selected
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeSubDate(
                                date
                              )
                            }
                            className="
                              self-start
                              font-sans
                              text-[12px]
                              text-[#999]
                              transition
                              hover:text-[#9A5D50]

                              sm:self-auto
                            "
                          >
                            Remove
                          </button>
                        </div>

                        {active && (
                          <div className="mt-7">
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
                              Available Hours
                            </p>

                            {/* TIME PERIODS */}

                            <div
                              className="
                                mt-6
                                grid
                                grid-cols-1
                                gap-5

                                md:grid-cols-3
                                md:gap-5

                                lg:gap-6
                              "
                            >
                              {TIME_PERIODS.map(
                                (period) => {
                                  const periodSlots =
                                    getSlotsForPeriod(
                                      timeSlots,
                                      period
                                    );

                                  return (
                                    <div
                                      key={
                                        period.label
                                      }
                                      className="
                                        min-w-0
                                        rounded-2xl
                                        border
                                        border-[#E7DDD1]
                                        bg-white
                                        p-4

                                        sm:p-5
                                      "
                                    >
                                      {/* PERIOD HEADER */}

                                      <div
                                        className="
                                          border-b
                                          border-[#E7DDD1]
                                          pb-3
                                          text-center
                                        "
                                      >
                                        <p
                                          className="
                                            font-serif
                                            text-[21px]
                                            font-normal
                                            text-[#292929]
                                          "
                                        >
                                          {
                                            period.label
                                          }
                                        </p>

                                        <p
                                          className="
                                            mt-1
                                            font-sans
                                            text-[11px]
                                            text-[#999]
                                          "
                                        >
                                          {formatTime(
                                            period.startHour,
                                            0
                                          )}{" "}
                                          –{" "}
                                          {formatTime(
                                            period.endHour,
                                            0
                                          )}
                                        </p>
                                      </div>

                                      {/* TIME SLOTS */}

                                      {renderTimeSlots(
                                        periodSlots,
                                        (slot) =>
                                          subSlots.has(
                                            createDateSlotKey(
                                              date,
                                              slot.key
                                            )
                                          ),
                                        (slot) =>
                                          toggleSubSlot(
                                            date,
                                            slot.key
                                          ),
                                        "border-[#D6B88C] bg-[#FBF4E8] font-medium text-[#8A6A3F]",
                                        "border-[#E7DDD1] bg-white text-[#666] hover:border-[#D6B88C] hover:bg-[#FBF4E8]"
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {subDates.length === 0 && (
                <div
                  className="
                    mt-7
                    rounded-3xl
                    border
                    border-dashed
                    border-[#D8CCBE]
                    bg-white
                    px-5
                    py-9
                    text-center
                  "
                >
                  <p
                    className="
                      font-serif
                      text-[21px]
                      text-[#666]
                    "
                  >
                    No extra dates yet.
                  </p>

                  <p
                    className="
                      mt-1.5
                      font-sans
                      text-[12px]
                      leading-5
                      text-[#999]
                    "
                  >
                    Add a date when you are
                    available for an extra or
                    substitute class.
                  </p>
                </div>
              )}

              {/* SUB SAVE */}

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#DDD4C8]
                  pt-6

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-md
                    font-sans
                    text-[12px]
                    leading-5
                    text-[#999]
                  "
                >
                  These dates are one-time
                  availability only.
                </p>

                <button
                  type="button"
                  onClick={
                    saveSubAvailability
                  }
                  disabled={
                    savingSub ||
                    subDates.length === 0
                  }
                  className="
                    inline-flex
                    justify-center
                    rounded-full
                    bg-[#6F8F72]
                    px-7
                    py-3
                    font-sans
                    text-[13px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#5F7F63]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {savingSub
                    ? "Saving..."
                    : "Save Sub Availability"}
                </button>
              </div>
            </section>
          </>
        )}

        {/* MESSAGE */}

        {message && (
          <div
            className="
              mt-7
              rounded-2xl
              border
              border-[#D8E2D4]
              bg-[#F4F7F2]
              px-5
              py-4
            "
          >
            <p
              className="
                font-sans
                text-[13px]
                text-[#5F7F63]
              "
            >
              {message}
            </p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-7
              rounded-2xl
              border
              border-[#E5C8C0]
              bg-[#FBF1EE]
              px-5
              py-4
            "
          >
            <p
              className="
                font-sans
                text-[13px]
                text-[#9A5D50]
              "
            >
              {error}
            </p>
          </div>
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}