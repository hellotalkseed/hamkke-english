"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { getMessages } from "@/lib/getMessages";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

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
  key:
    | "philippines"
    | "korea"
    | "japan"
    | "china"
    | "vietnam";
  shortLabel: string;
  timezone: string;
};

type ConvertedSlot = PublicSlot & {
  sourceDate: string;
  sourceTime: string;
};

const INITIAL_STORIES = 6;

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    key: "philippines",
    shortLabel: "PHT",
    timezone: "Asia/Manila",
  },
  {
    key: "korea",
    shortLabel: "KST",
    timezone: "Asia/Seoul",
  },
  {
    key: "japan",
    shortLabel: "JST",
    timezone: "Asia/Tokyo",
  },
  {
    key: "china",
    shortLabel: "CST",
    timezone: "Asia/Shanghai",
  },
  {
    key: "vietnam",
    shortLabel: "ICT",
    timezone: "Asia/Ho_Chi_Minh",
  },
];

const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  ko: "ko-KR",
  zh: "zh-CN",
  ja: "ja-JP",
};

function interpolate(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) =>
      values[key] !== undefined
        ? String(values[key])
        : `{${key}}`
  );
}

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
  dateKey: string,
  locale: Locale
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    INTL_LOCALES[locale],
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
  endDate: string,
  locale: Locale
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
      INTL_LOCALES[locale],
      {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }
    ).format(start);

  const endLabel =
    new Intl.DateTimeFormat(
      INTL_LOCALES[locale],
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
  value: string,
  locale: Locale
) {
  const [hour, minute] = value
    .split(":")
    .map(Number);

  const date = new Date(
    Date.UTC(
      2000,
      0,
      1,
      hour,
      minute
    )
  );

  return new Intl.DateTimeFormat(
    INTL_LOCALES[locale],
    {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }
  ).format(date);
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

  /*
   * en-CA is intentionally retained here.
   * This value is an internal YYYY-MM-DD key,
   * not visitor-facing text.
   */
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
  /*
   * en-CA is intentionally retained here.
   * This creates an internal YYYY-MM-DD key.
   */
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
  const params = useParams<{
    locale?: string;
  }>();

  const localeParam =
    typeof params?.locale === "string"
      ? params.locale
      : "en";

  const locale: Locale =
    isValidLocale(localeParam)
      ? localeParam
      : "en";

  const messages = getMessages(locale);
  const content = messages.teacherProfile;

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
    selectedStory,
    setSelectedStory,
  ] =
    useState<TeacherReflection | null>(
      null
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

  /* =====================================================
     LEARNER STORY MODAL
     ===================================================== */

  useEffect(() => {
    if (!selectedStory) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedStory]);

  const visibleReflections =
    showAllStories
      ? safeReflections
      : safeReflections.slice(
          0,
          INITIAL_STORIES
        );

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
            content.availability.error
          );
        }

        if (!cancelled) {
          setAvailabilityData(
            result
          );
        }
      } catch {
        if (!cancelled) {
          setAvailabilityError(
            content.availability.error
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
    content.availability.error,
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

  const timezoneLabels = {
    philippines:
      content.availability.timezone.philippines,
    korea:
      content.availability.timezone.korea,
    japan:
      content.availability.timezone.japan,
    china:
      content.availability.timezone.china,
    vietnam:
      content.availability.timezone.vietnam,
  };

  const dayLabels = [
    content.days.sun,
    content.days.mon,
    content.days.tue,
    content.days.wed,
    content.days.thu,
    content.days.fri,
    content.days.sat,
  ];

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
      {/* =====================================================
          TABS
          ===================================================== */}

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
            {content.tabs.about}

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
            {content.tabs.qualifications}

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
            {content.tabs.learnerStories}

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
            {content.tabs.availability}

            {activeTab ===
              "availability" && (
              <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[#718A73]" />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          ABOUT
          ===================================================== */}

      {activeTab === "about" && (
        <div className="pt-8">
          <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
            {content.about.title}
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

      {/* =====================================================
          QUALIFICATIONS
          ===================================================== */}

      {activeTab ===
        "qualifications" && (
        <div className="pt-8">
          <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
            {content.qualifications.title}
          </h2>

          <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-[#758477]">
            {content.qualifications.description}
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
                {content.qualifications.empty}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          LEARNER STORIES
          ===================================================== */}

      {activeTab ===
        "learner-stories" && (
        <div className="pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
                {content.stories.title}
              </h2>

              <p className="mt-2 text-[13px] text-[#758477]">
                {safeReflections.length}{" "}
                {safeReflections.length ===
                1
                  ? content.stories.story
                  : content.stories.stories}{" "}
                {content.stories.shared}
              </p>
            </div>
          </div>

          {safeReflections.length >
          0 ? (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {visibleReflections.map(
                  (reflection) => (
                    <article
                      key={reflection.id}
                      className="
                        flex
                        h-[260px]
                        flex-col
                        rounded-[22px]
                        border
                        border-[#718A73]/25
                        bg-[#F1F4ED]
                        p-5
                        shadow-[0_5px_18px_rgba(48,74,57,0.035)]
                        transition
                        hover:border-[#718A73]/45
                      "
                    >
                      {/* RATING */}

                      <div
                        className="
                          shrink-0
                          text-[14px]
                          tracking-[0.1em]
                          text-[#C69A3B]
                        "
                        aria-label={interpolate(
                          content.stories.rating,
                          {
                            rating:
                              reflection.rating,
                          }
                        )}
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

                      {/* STORY PREVIEW */}

                      <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                        <p
                          className="
                            line-clamp-4
                            text-[14px]
                            leading-6
                            text-[#536157]
                          "
                        >
                          “{reflection.reflection}”
                        </p>
                      </div>

                      {/* READ MORE */}

                      <div className="shrink-0 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStory(
                              reflection
                            );
                          }}
                          className="
                            relative
                            z-10
                            text-[12px]
                            font-semibold
                            text-[#718A73]
                            transition
                            hover:text-[#304A39]
                          "
                        >
                          {content.stories.readMore}
                        </button>
                      </div>

                      {/* LEARNER */}

                      <div className="shrink-0 pt-4">
                        <div className="h-px bg-[#304A39]/10" />

                        <div className="mt-3">
                          <p className="text-[13px] font-semibold text-[#304A39]">
                            {reflection.name}
                          </p>

                          <p className="mt-1 text-[11px] text-[#758477]">
                            {[
                              reflection.role,
                              reflection.country,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
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
                      ? content.stories.showFewer
                      : interpolate(
                          content.stories.showAll,
                          {
                            count:
                              safeReflections.length,
                          }
                        )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-[22px] border border-[#304A39]/10 bg-white px-5 py-8">
              <p className="text-[14px] leading-6 text-[#758477]">
                {content.stories.empty}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          AVAILABILITY
          ===================================================== */}

      {activeTab ===
        "availability" && (
        <div className="pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-[29px] tracking-[-0.02em] text-[#304A39]">
                {content.availability.title}
              </h2>

              <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[#758477]">
                {content.availability.description}
              </p>
            </div>

            {availabilityData && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    goToPreviousWeek
                  }
                  aria-label={
                    content.availability
                      .previousWeek
                  }
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
                  {content.availability.today}
                </button>

                <button
                  type="button"
                  onClick={
                    goToNextWeek
                  }
                  aria-label={
                    content.availability
                      .nextWeek
                  }
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
                {content.availability.loading}
              </p>
            </div>
          )}

          {!availabilityLoading &&
            availabilityError && (
              <div className="mt-6 rounded-[22px] border border-[#D6AAA4]/50 bg-[#FFF8F6] px-5 py-8">
                <p className="text-[13px] leading-6 text-[#8A5C56]">
                  {availabilityError}
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
                        displayWeekEnd,
                        locale
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
                        {
                          content.availability
                            .timezone.label
                        }
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
                                timezoneLabels[
                                  option.key
                                ]
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

                        {
                          content.availability
                            .status.available
                        }
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#E8D8A9]" />

                        {
                          content.availability
                            .status.regularStudent
                        }
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
                                  dayLabels[
                                    index
                                  ]
                                }
                              </p>

                              <p className="mt-1 text-[12px] font-medium text-[#304A39]">
                                {formatDate(
                                  date,
                                  locale
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
                                time,
                                locale
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
                                        title={
                                          content
                                            .availability
                                            .status
                                            .available
                                        }
                                      >
                                        {
                                          content
                                            .availability
                                            .status
                                            .available
                                        }
                                      </div>
                                    )}

                                    {status ===
                                      "regular_student" && (
                                      <div
                                        className="flex h-full min-h-[34px] w-full items-center justify-center rounded-[8px] bg-[#F2E8C9] px-1 text-center text-[10px] font-medium text-[#75673F]"
                                        title={
                                          content
                                            .availability
                                            .status
                                            .regularStudent
                                        }
                                      >
                                        {
                                          content
                                            .availability
                                            .status
                                            .regularShort
                                        }
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
                      {content.availability.empty}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-[11px] leading-5 text-[#8A958C]">
                  {interpolate(
                    content.availability.note,
                    {
                      timezone:
                        timezoneLabels[
                          selectedTimezoneOption.key
                        ],
                    }
                  )}
                </p>
              </>
            )}
        </div>
      )}

      {/* =====================================================
          LEARNER STORY MODAL
          ===================================================== */}

      {selectedStory && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#203329]/45
            px-4
            py-8
            backdrop-blur-[3px]
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedStory(
                null
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={interpolate(
              content.stories.modal.ariaLabel,
              {
                name:
                  selectedStory.name,
              }
            )}
            className="
              relative
              max-h-[85vh]
              w-full
              max-w-[680px]
              overflow-y-auto
              rounded-[28px]
              bg-[#FFFDF8]
              px-6
              py-7
              shadow-[0_24px_80px_rgba(32,51,41,0.20)]

              sm:px-9
              sm:py-9
            "
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setSelectedStory(
                  null
                )
              }
              aria-label={
                content.stories.modal.close
              }
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-[#758477]
                transition
                hover:bg-[#EEF2EA]
                hover:text-[#304A39]
              "
            >
              <X
                size={18}
                strokeWidth={1.7}
              />
            </button>

            {/* LABEL */}

            <p
              className="
                pr-12
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#718A73]
              "
            >
              {content.stories.modal.label}
            </p>

            {/* RATING */}

            <div
              className="
                mt-5
                text-[14px]
                tracking-[0.1em]
                text-[#C69A3B]
              "
              aria-label={interpolate(
                content.stories.rating,
                {
                  rating:
                    selectedStory.rating,
                }
              )}
            >
              {"★".repeat(
                Math.max(
                  0,
                  Math.min(
                    5,
                    selectedStory.rating
                  )
                )
              )}
            </div>

            {/* FULL STORY */}

            <p
              className="
                mt-5
                whitespace-pre-wrap
                text-[15px]
                leading-7
                text-[#536157]

                sm:text-[16px]
                sm:leading-8
              "
            >
              “
              {
                selectedStory.reflection
              }
              ”
            </p>

            {/* LEARNER */}

            <div className="mt-7 border-t border-[#304A39]/10 pt-5">
              <p className="text-[14px] font-semibold text-[#304A39]">
                {
                  selectedStory.name
                }
              </p>

              <p className="mt-1 text-[12px] text-[#758477]">
                {[
                  selectedStory.role,
                  selectedStory.country,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}