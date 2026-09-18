"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Qualification = {
  title: string;
  institution: string;
  year: string;
};

type TeacherReflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
  created_at: string | null;
};

type PublicSlotStatus =
  | "available"
  | "regular_student"
  | "unavailable";

type PublicSlot = {
  date: string;
  time: string;
  status: PublicSlotStatus;
};

type AvailabilityResponse = {
  teacher_slug: string;
  source_timezone: string;
  start_date: string;
  end_date: string;
  source_start_date: string;
  source_end_date: string;
  interval_minutes: number;
  slots: PublicSlot[];
};

type TeacherProfileTabsProps = {
  about: string[];
  qualifications: Qualification[];
  reflections: TeacherReflection[];
  teacherSlug: string;
};

type Tab =
  | "about"
  | "qualifications"
  | "learner-stories"
  | "availability";

type TimezoneOption = {
  label: string;
  shortLabel: string;
  timezone: string;
};

type ConvertedSlot = PublicSlot & {
  sourceDate: string;
  sourceTime: string;
};

const INITIAL_STORIES = 6;
const LONG_STORY_LENGTH = 240;

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    label: "Philippines",
    shortLabel: "PHT",
    timezone: "Asia/Manila",
  },
  {
    label: "Korea",
    shortLabel: "KST",
    timezone: "Asia/Seoul",
  },
  {
    label: "Japan",
    shortLabel: "JST",
    timezone: "Asia/Tokyo",
  },
  {
    label: "China",
    shortLabel: "CST",
    timezone: "Asia/Shanghai",
  },
  {
    label: "Vietnam",
    shortLabel: "ICT",
    timezone: "Asia/Ho_Chi_Minh",
  },
];

function addDays(
  dateKey: string,
  days: number
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function getDayOfWeek(
  dateKey: string
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day)
  ).getUTCDay();
}

function formatDate(
  dateKey: string
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    )
  );
}

function formatWeekRange(
  startDate: string,
  endDate: string
) {
  const [
    startYear,
    startMonth,
    startDay,
  ] = startDate
    .split("-")
    .map(Number);

  const [
    endYear,
    endMonth,
    endDay,
  ] = endDate
    .split("-")
    .map(Number);

  const start = new Date(
    Date.UTC(
      startYear,
      startMonth - 1,
      startDay
    )
  );

  const end = new Date(
    Date.UTC(
      endYear,
      endMonth - 1,
      endDay
    )
  );

  const startLabel =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }
    ).format(start);

  const endLabel =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }
    ).format(end);

  return `${startLabel} – ${endLabel}`;
}

function formatTime(
  value: string
) {
  const [hour, minute] = value
    .split(":")
    .map(Number);

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
}

/*
 * Convert a date/time that represents wall-clock time
 * in a specific IANA timezone into a real UTC instant.
 */
function zonedDateTimeToUtc(
  dateKey: string,
  time: string,
  timezone: string
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const [hour, minute] = time
    .split(":")
    .map(Number);

  const probe = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0
  );

  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(
      new Date(probe)
    );

  const part = (
    type: string
  ) =>
    Number(
      parts.find(
        (item) =>
          item.type === type
      )?.value || 0
    );

  const timezoneAsUtc =
    Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second")
    );

  const offset =
    timezoneAsUtc - probe;

  return new Date(
    probe - offset
  );
}

function convertSlotTimezone(
  slot: PublicSlot,
  sourceTimezone: string,
  targetTimezone: string
): ConvertedSlot {
  const instant =
    zonedDateTimeToUtc(
      slot.date,
      slot.time,
      sourceTimezone
    );

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          targetTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(
      instant
    );

  const part = (
    type: string
  ) =>
    parts.find(
      (item) =>
        item.type === type
    )?.value || "";

  return {
    date: `${part(
      "year"
    )}-${part(
      "month"
    )}-${part("day")}`,

    time: `${part(
      "hour"
    )}:${part(
      "minute"
    )}`,

    status: slot.status,

    sourceDate:
      slot.date,

    sourceTime:
      slot.time,
  };
}

function getDateKeyInTimezone(
  date: Date,
  timezone: string
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const part = (
    type: string
  ) =>
    parts.find(
      (item) =>
        item.type === type
    )?.value || "";

  return `${part(
    "year"
  )}-${part(
    "month"
  )}-${part("day")}`;
}

function getWeekStart(
  dateKey: string
) {
  return addDays(
    dateKey,
    -getDayOfWeek(
      dateKey
    )
  );
}

function hasSlotPassed(
  dateKey: string,
  time: string,
  timezone: string
) {
  const slotInstant =
    zonedDateTimeToUtc(
      dateKey,
      time,
      timezone
    );

  return (
    slotInstant.getTime() <=
    Date.now()
  );
}

function detectInitialTimezone() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "Asia/Manila";
  }

  const browserTimezone =
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone;

  const supported =
    TIMEZONE_OPTIONS.find(
      (option) =>
        option.timezone ===
        browserTimezone
    );

  return supported
    ? supported.timezone
    : "Asia/Manila";
}

export default function TeacherProfileTabs({
  about,
  qualifications,
  reflections,
  teacherSlug,
}: TeacherProfileTabsProps) {
  const safeReflections =
    reflections ?? [];

  const safeQualifications =
    qualifications ?? [];

  const [activeTab, setActiveTab] =
    useState<Tab>("about");

  const [
    showAllStories,
    setShowAllStories,
  ] = useState(false);

  const [
    expandedStories,
    setExpandedStories,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    availabilityData,
    setAvailabilityData,
  ] =
    useState<AvailabilityResponse | null>(
      null
    );

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] = useState(false);

  const [
    availabilityError,
    setAvailabilityError,
  ] = useState<string | null>(
    null
  );

  const [
    requestedWeek,
    setRequestedWeek,
  ] = useState<string | null>(
    null
  );

  const [
    selectedTimezone,
    setSelectedTimezone,
  ] = useState(
    "Asia/Manila"
  );

  const [
    timezoneReady,
    setTimezoneReady,
  ] = useState(false);

  useEffect(() => {
    setSelectedTimezone(
      detectInitialTimezone()
    );

    setTimezoneReady(true);
  }, []);

  const visibleReflections =
    showAllStories
      ? safeReflections
      : safeReflections.slice(
          0,
          INITIAL_STORIES
        );

  const toggleStory = (
    id: string
  ) => {
    setExpandedStories(
      (current) => {
        const next =
          new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  };

  /*
   * -------------------------------------------------------
   * Load source availability
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (
      activeTab !==
      "availability"
    ) {
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      try {
        setAvailabilityLoading(
          true
        );

        setAvailabilityError(
          null
        );

        const query =
          requestedWeek
            ? `?start_date=${encodeURIComponent(
                requestedWeek
              )}`
            : "";

        const response =
          await fetch(
            `/api/teachers/${encodeURIComponent(
              teacherSlug
            )}/availability${query}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load availability."
          );
        }

        if (!cancelled) {
          setAvailabilityData(
            result
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityError(
            error instanceof Error
              ? error.message
              : "Unable to load availability."
          );
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(
            false
          );
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    requestedWeek,
    teacherSlug,
  ]);

  /*
   * -------------------------------------------------------
   * Convert source slots to visitor timezone
   * -------------------------------------------------------
   */

  const convertedSlots =
    useMemo(() => {
      if (
        !availabilityData
      ) {
        return [];
      }

      return availabilityData.slots.map(
        (slot) =>
          convertSlotTimezone(
            slot,
            availabilityData.source_timezone,
            selectedTimezone
          )
      );
    }, [
      availabilityData,
      selectedTimezone,
    ]);

  const displayWeekStart =
    useMemo(() => {
      if (
        !availabilityData
      ) {
        return null;
      }

      const sourceNoon =
        zonedDateTimeToUtc(
          availabilityData.start_date,
          "12:00",
          availabilityData.source_timezone
        );

      const localDate =
        getDateKeyInTimezone(
          sourceNoon,
          selectedTimezone
        );

      return getWeekStart(
        localDate
      );
    }, [
      availabilityData,
      selectedTimezone,
    ]);

  const displayWeekEnd =
    displayWeekStart
      ? addDays(
          displayWeekStart,
          6
        )
      : null;

  const weekDates =
    displayWeekStart
      ? Array.from(
          { length: 7 },
          (_, index) =>
            addDays(
              displayWeekStart,
              index
            )
        )
      : [];

  const visibleWeekSlots =
    useMemo(() => {
      if (
        !displayWeekStart ||
        !displayWeekEnd
      ) {
        return [];
      }

      return convertedSlots.filter(
        (slot) =>
          slot.date >=
            displayWeekStart &&
          slot.date <=
            displayWeekEnd
      );
    }, [
      convertedSlots,
      displayWeekStart,
      displayWeekEnd,
    ]);

  const availableTimes =
    useMemo(() => {
      return [
        ...new Set(
          visibleWeekSlots
            .filter(
              (slot) =>
                slot.status !==
                "unavailable"
            )
            .map(
              (slot) =>
                slot.time
            )
        ),
      ].sort();
    }, [
      visibleWeekSlots,
    ]);

  const selectedTimezoneOption =
    TIMEZONE_OPTIONS.find(
      (option) =>
        option.timezone ===
        selectedTimezone
    ) ||
    TIMEZONE_OPTIONS[0];

  const goToToday = () => {
    setRequestedWeek(
      null
    );
  };

  const goToPreviousWeek =
    () => {
      const base =
        availabilityData
          ?.start_date ||
        requestedWeek;

      if (!base) return;

      setRequestedWeek(
        addDays(base, -7)
      );
    };

  const goToNextWeek = () => {
    const base =
      availabilityData
        ?.start_date ||
      requestedWeek;

    if (!base) return;

    setRequestedWeek(
      addDays(base, 7)
    );
  };

  const getSlot = (
    date: string,
    time: string
  ) =>
    visibleWeekSlots.find(
      (slot) =>
        slot.date === date &&
        slot.time === time
    );

  return (
    <>
      {/* Tabs */}
      <div className="mt-8 overflow-x-auto border-b border-[#304A39]/15">
        <div className="flex min-w-max gap-7">
          <button
            type="button"
            onClick={() =>
              setActiveTab("about")
            }
            className={`relative shrink-0 pb-3 text-sm transition ${
              activeTab === "about"
                ? "font-semibold text-[#304A39]"
                : "text-[#758477] hover:text-[#304A39]"
            }`}
          >
            About

            {activeTab ===
              "about" && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#718A73]" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "qualifications"
              )
            }
            className={`relative shrink-0 pb-3 text-sm transition ${
              activeTab ===
              "qualifications"
                ? "font-semibold text-[#304A39]"
                : "text-[#758477] hover:text-[#304A39]"
            }`}
          >
            Qualifications

            {activeTab ===
              "qualifications" && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#718A73]" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "learner-stories"
              )
            }
            className={`relative shrink-0 pb-3 text-sm transition ${
              activeTab ===
              "learner-stories"
                ? "font-semibold text-[#304A39]"
                : "text-[#758477] hover:text-[#304A39]"
            }`}
          >
            Learner Stories

            {activeTab ===
              "learner-stories" && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#718A73]" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "availability"
              )
            }
            className={`relative shrink-0 pb-3 text-sm transition ${
              activeTab ===
              "availability"
                ? "font-semibold text-[#304A39]"
                : "text-[#758477] hover:text-[#304A39]"
            }`}
          >
            Availability

            {activeTab ===
              "availability" && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#718A73]" />
            )}
          </button>
        </div>
      </div>

      {/* About */}
      {activeTab === "about" && (
        <div className="pt-8">
          <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
            A little about me
          </h2>

          <div className="mt-5 max-w-[680px] space-y-4 text-[15px] leading-7 text-[#536157]">
            {about.map(
              (
                paragraph,
                index
              ) => (
                <p key={index}>
                  {paragraph}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* Qualifications */}
      {activeTab ===
        "qualifications" && (
        <div className="pt-8">
          <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
            Qualifications & experience
          </h2>

          <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-[#758477]">
            Training, education, and
            experience that support my
            work as an English teacher.
          </p>

          {safeQualifications.length >
          0 ? (
            <div className="mt-6 max-w-[680px] divide-y divide-[#304A39]/10 border-y border-[#304A39]/10">
              {safeQualifications.map(
                (
                  qualification,
                  index
                ) => (
                  <div
                    key={`${qualification.title}-${index}`}
                    className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_64px] sm:gap-6"
                  >
                    <div>
                      <h3 className="font-serif text-[20px] leading-[1.3] text-[#304A39]">
                        {
                          qualification.title
                        }
                      </h3>

                      {qualification.institution && (
                        <p className="mt-1.5 text-[13px] leading-5 text-[#758477]">
                          {
                            qualification.institution
                          }
                        </p>
                      )}
                    </div>

                    {qualification.year && (
                      <p className="text-[12px] font-semibold text-[#718A73] sm:pt-1 sm:text-right">
                        {
                          qualification.year
                        }
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-[#304A39]/10 bg-white px-5 py-8">
              <p className="text-[14px] leading-6 text-[#758477]">
                Qualifications are
                being prepared.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Learner Stories */}
      {activeTab ===
        "learner-stories" && (
        <div className="pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
                From my learners
              </h2>

              <p className="mt-2 text-[13px] text-[#758477]">
                {
                  safeReflections.length
                }{" "}
                {safeReflections.length ===
                1
                  ? "story"
                  : "stories"}{" "}
                shared
              </p>
            </div>
          </div>

          {safeReflections.length >
          0 ? (
            <>
              <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
                {visibleReflections.map(
                  (
                    reflection
                  ) => {
                    const isLong =
                      reflection
                        .reflection
                        .length >
                      LONG_STORY_LENGTH;

                    const isExpanded =
                      expandedStories.has(
                        reflection.id
                      );

                    return (
                      <article
                        key={
                          reflection.id
                        }
                        className="flex min-h-[220px] flex-col rounded-[22px] border border-[#718A73]/25 bg-[#F1F4ED] p-5 shadow-[0_5px_18px_rgba(48,74,57,0.035)] transition hover:border-[#718A73]/45"
                      >
                        <div
                          className="text-[14px] tracking-[0.1em] text-[#C69A3B]"
                          aria-label={`${reflection.rating} out of 5 stars`}
                        >
                          {"★".repeat(
                            Math.max(
                              0,
                              Math.min(
                                5,
                                reflection.rating
                              )
                            )
                          )}
                        </div>

                        <div className="mt-4">
                          <p
                            className={`text-[14px] leading-6 text-[#536157] ${
                              !isExpanded &&
                              isLong
                                ? "line-clamp-6"
                                : ""
                            }`}
                          >
                            “
                            {
                              reflection.reflection
                            }
                            ”
                          </p>

                          {isLong && (
                            <button
                              type="button"
                              onClick={() =>
                                toggleStory(
                                  reflection.id
                                )
                              }
                              aria-expanded={
                                isExpanded
                              }
                              className="mt-2 text-[12px] font-semibold text-[#718A73] transition hover:text-[#304A39]"
                            >
                              {isExpanded
                                ? "Show less"
                                : "Read more"}
                            </button>
                          )}
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="h-px bg-[#304A39]/10" />

                          <div className="mt-4">
                            <p className="text-[13px] font-semibold text-[#304A39]">
                              {
                                reflection.name
                              }
                            </p>

                            <p className="mt-1 text-[11px] text-[#758477]">
                              {[
                                reflection.role,
                                reflection.country,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " · "
                                )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              {safeReflections.length >
                INITIAL_STORIES && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setShowAllStories(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                    className="rounded-full border border-[#718A73]/35 px-5 py-2.5 text-[13px] font-semibold text-[#304A39] transition hover:bg-[#EEF2EA]"
                  >
                    {showAllStories
                      ? "Show fewer"
                      : `Show all ${safeReflections.length} stories`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-[22px] border border-[#304A39]/10 bg-white px-5 py-8">
              <p className="text-[14px] leading-6 text-[#758477]">
                No learner stories
                have been shared
                yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Availability */}
      {activeTab ===
        "availability" && (
        <div className="pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
                Weekly availability
              </h2>

              <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[#758477]">
                A simple view of
                currently open and
                regularly occupied
                lesson times.
              </p>
            </div>

            {availabilityData && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    goToPreviousWeek
                  }
                  aria-label="Previous week"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#304A39]/15 text-[#536157] transition hover:border-[#718A73]/45 hover:bg-[#EEF2EA]"
                >
                  <ChevronLeft
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    goToToday
                  }
                  className="h-9 rounded-full border border-[#304A39]/15 px-4 text-[11px] font-semibold text-[#536157] transition hover:border-[#718A73]/45 hover:bg-[#EEF2EA]"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={
                    goToNextWeek
                  }
                  aria-label="Next week"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#304A39]/15 text-[#536157] transition hover:border-[#718A73]/45 hover:bg-[#EEF2EA]"
                >
                  <ChevronRight
                    size={17}
                  />
                </button>
              </div>
            )}
          </div>

          {availabilityLoading && (
            <div className="mt-6 rounded-[22px] border border-[#304A39]/10 bg-[#FFFDF8] px-5 py-10 text-center">
              <p className="text-[13px] text-[#758477]">
                Loading
                availability...
              </p>
            </div>
          )}

          {!availabilityLoading &&
            availabilityError && (
              <div className="mt-6 rounded-[22px] border border-[#D6AAA4]/50 bg-[#FFF8F6] px-5 py-8">
                <p className="text-[13px] leading-6 text-[#8A5C56]">
                  {
                    availabilityError
                  }
                </p>
              </div>
            )}

          {!availabilityLoading &&
            !availabilityError &&
            availabilityData &&
            timezoneReady &&
            displayWeekStart &&
            displayWeekEnd && (
              <>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-semibold text-[#304A39]">
                      {formatWeekRange(
                        displayWeekStart,
                        displayWeekEnd
                      )}
                    </p>

                    <p className="mt-1 text-[11px] text-[#758477]">
                      {
                        selectedTimezoneOption.shortLabel
                      }{" "}
                      ·{" "}
                      {
                        selectedTimezoneOption.timezone
                      }
                    </p>
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <label className="block">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758477]">
                        Your timezone
                      </span>

                      <select
                        value={
                          selectedTimezone
                        }
                        onChange={(
                          event
                        ) =>
                          setSelectedTimezone(
                            event
                              .target
                              .value
                          )
                        }
                        className="h-9 rounded-full border border-[#304A39]/15 bg-[#FFFDF8] px-3 pr-8 text-[11px] font-medium text-[#304A39] outline-none transition hover:border-[#718A73]/45 focus:border-[#718A73]"
                      >
                        {TIMEZONE_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.timezone
                              }
                              value={
                                option.timezone
                              }
                            >
                              {
                                option.label
                              }{" "}
                              (
                              {
                                option.shortLabel
                              }
                              )
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <div className="flex flex-wrap items-center gap-4 pb-2 text-[11px] text-[#758477]">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#DCE4D7]" />
                        Available
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#E8D8A9]" />
                        Regular
                        Student
                      </div>
                    </div>
                  </div>
                </div>

                {availableTimes.length >
                0 ? (
                  <div className="mt-5 overflow-x-auto rounded-[22px] border border-[#304A39]/10 bg-[#FFFDF8]">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-[92px_repeat(7,minmax(82px,1fr))] border-b border-[#304A39]/10 bg-[#F8F6EF]">
                        <div />

                        {weekDates.map(
                          (
                            date,
                            index
                          ) => (
                            <div
                              key={
                                date
                              }
                              className="border-l border-[#304A39]/10 px-2 py-4 text-center"
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#758477]">
                                {
                                  DAYS[
                                    index
                                  ]
                                }
                              </p>

                              <p className="mt-1 text-[12px] font-medium text-[#304A39]">
                                {formatDate(
                                  date
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      {availableTimes.map(
                        (time) => (
                          <div
                            key={
                              time
                            }
                            className="grid grid-cols-[92px_repeat(7,minmax(82px,1fr))] border-b border-[#304A39]/[0.07] last:border-b-0"
                          >
                            <div className="flex min-h-[48px] items-center px-3 text-[11px] font-medium text-[#758477]">
                              {formatTime(
                                time
                              )}
                            </div>

                            {weekDates.map(
                              (
                                date
                              ) => {
                                const slot =
                                  getSlot(
                                    date,
                                    time
                                  );

                                const rawStatus =
                                  slot?.status ||
                                  "unavailable";

                                const isPast =
                                  hasSlotPassed(
                                    date,
                                    time,
                                    selectedTimezone
                                  );

                                const status =
                                  rawStatus ===
                                    "available" &&
                                  isPast
                                    ? "unavailable"
                                    : rawStatus;

                                return (
                                  <div
                                    key={`${date}-${time}`}
                                    className="flex min-h-[48px] items-center justify-center border-l border-[#304A39]/[0.07] p-1.5"
                                  >
                                    {status ===
                                      "available" && (
                                      <div
                                        className="flex h-full min-h-[34px] w-full items-center justify-center rounded-[8px] bg-[#DCE4D7] px-1 text-center text-[10px] font-semibold text-[#304A39]"
                                        title="Available"
                                      >
                                        Available
                                      </div>
                                    )}

                                    {status ===
                                      "regular_student" && (
                                      <div
                                        className="flex h-full min-h-[34px] w-full items-center justify-center rounded-[8px] bg-[#F2E8C9] px-1 text-center text-[10px] font-medium text-[#75673F]"
                                        title="Regular Student"
                                      >
                                        Regular
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[22px] border border-[#304A39]/10 bg-[#FFFDF8] px-5 py-10 text-center">
                    <p className="text-[13px] text-[#758477]">
                      No open lesson
                      times are shown
                      for this week.
                    </p>
                  </div>
                )}

                <p className="mt-4 text-[11px] leading-5 text-[#8A958C]">
                  Times are shown in{" "}
                  {
                    selectedTimezoneOption.label
                  }{" "}
                  time. Availability
                  can change as
                  lessons are assigned
                  or schedules are
                  updated.
                </p>
              </>
            )}
        </div>
      )}
    </>
  );
}