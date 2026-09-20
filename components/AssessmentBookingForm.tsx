"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale } from "@/lib/i18n";

type AssessmentBookingFormProps = {
  locale: Locale;
};

type Teacher = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  card_label: string | null;
  learner_groups: string[];
};

type SourceSlot = {
  date: string;
  time: string;
  status:
    | "available"
    | "regular_student"
    | "unavailable";
};

type AvailabilityResponse = {
  teacher_slug?: string;
  source_timezone?: string;
  interval_minutes?: number;
  slots?: SourceSlot[];
};

type LocalSlot = {
  sourceDate: string;
  sourceTime: string;
  localDate: string;
  localTime: string;
  timestamp: number;
};

type BookingResult = {
  id: string;

  teacher: {
    slug: string;
    name: string;
  };

  learnerName: string;
  preferredName: string | null;

  date: string;
  time: string;

  sourceTimezone: string;
  visitorTimezone: string;

  durationMinutes: number;

  format: string;
  platform: string;
  status: string;
};

type TimezoneOption = {
  value: string;
  label: string;
};

const SOURCE_TIMEZONE = "Asia/Manila";

const COMMON_TIMEZONES: TimezoneOption[] = [
  {
    value: "Asia/Manila",
    label: "Philippines — Manila (GMT+8)",
  },
  {
    value: "Asia/Seoul",
    label: "South Korea — Seoul (GMT+9)",
  },
  {
    value: "Asia/Tokyo",
    label: "Japan — Tokyo (GMT+9)",
  },
  {
    value: "Asia/Shanghai",
    label: "China — Beijing (GMT+8)",
  },
  {
    value: "Asia/Ho_Chi_Minh",
    label: "Vietnam — Ho Chi Minh City (GMT+7)",
  },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Malaysia — Kuala Lumpur (GMT+8)",
  },
  {
    value: "Asia/Jakarta",
    label: "Indonesia — Jakarta (GMT+7)",
  },
  {
    value: "Asia/Makassar",
    label: "Indonesia — Makassar / Bali (GMT+8)",
  },
  {
    value: "Asia/Jayapura",
    label: "Indonesia — Jayapura (GMT+9)",
  },
];

const PLATFORM_OPTIONS = [
  {
    value: "microsoft_teams",
    label: "Microsoft Teams",
  },
  {
    value: "zoom",
    label: "Zoom",
  },
  {
    value: "google_meet",
    label: "Google Meet",
  },
  {
    value: "voov",
    label: "VooV Meeting",
  },
  {
    value: "kakaotalk",
    label: "KakaoTalk",
  },
];

const LEVEL_OPTIONS = [
  {
    value: "getting_started",
    label: "I'm just getting started.",
  },
  {
    value: "understand_but_speaking_is_difficult",
    label:
      "I understand some English, but speaking is difficult.",
  },
  {
    value: "simple_conversations",
    label:
      "I can have simple conversations, but I often hesitate.",
  },
  {
    value: "communicate_well",
    label:
      "I can communicate well, but I want to sound more natural.",
  },
  {
    value: "comfortable_speaking",
    label:
      "I'm comfortable speaking and want to improve my fluency.",
  },
];

const GOAL_OPTIONS = [
  {
    value: "speaking_confidence",
    label: "Speak more confidently",
  },
  {
    value: "everyday_conversation",
    label: "Improve everyday conversation",
  },
  {
    value: "work",
    label: "English for work",
  },
  {
    value: "interview",
    label: "Interview preparation",
  },
  {
    value: "travel",
    label: "Travel English",
  },
  {
    value: "overall",
    label: "Overall English",
  },
  {
    value: "other",
    label: "Something else",
  },
];

function getVisitorTimezone() {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      SOURCE_TIMEZONE
    );
  } catch {
    return SOURCE_TIMEZONE;
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKeyFromParts(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getTimeZoneParts(
  date: Date,
  timeZone: string
) {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }
  );

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string
) {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const [hour, minute] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  let guess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0
  );

  for (let i = 0; i < 3; i += 1) {
    const actual = getTimeZoneParts(
      new Date(guess),
      timeZone
    );

    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );

    const desiredAsUtc = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0
    );

    guess += desiredAsUtc - actualAsUtc;
  }

  return new Date(guess);
}

function sourceSlotToLocal(
  slot: SourceSlot,
  visitorTimezone: string
): LocalSlot | null {
  if (slot.status !== "available") {
    return null;
  }

  const instant = zonedDateTimeToUtc(
    slot.date,
    slot.time,
    SOURCE_TIMEZONE
  );

  const parts = getTimeZoneParts(
    instant,
    visitorTimezone
  );

  return {
    sourceDate: slot.date,
    sourceTime: slot.time.slice(0, 5),

    localDate: dateKeyFromParts(
      parts.year,
      parts.month,
      parts.day
    ),

    localTime: `${pad(parts.hour)}:${pad(
      parts.minute
    )}`,

    timestamp: instant.getTime(),
  };
}

function getIntlLocale(locale: Locale) {
  const localeMap: Record<Locale, string> = {
    en: "en-US",
    ko: "ko-KR",
    zh: "zh-CN",
    ja: "ja-JP",
  };

  return localeMap[locale];
}

function formatDate(
  dateKey: string,
  locale: Locale
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12
    )
  );

  return new Intl.DateTimeFormat(
    getIntlLocale(locale),
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatLongDate(
  dateKey: string,
  locale: Locale
) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12
    )
  );

  return new Intl.DateTimeFormat(
    getIntlLocale(locale),
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatTime(
  time: string,
  locale: Locale
) {
  const [hour, minute] = time
    .split(":")
    .map(Number);

  const date = new Date(
    Date.UTC(
      2026,
      0,
      1,
      hour,
      minute
    )
  );

  return new Intl.DateTimeFormat(
    getIntlLocale(locale),
    {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }
  ).format(date);
}

function platformLabel(value: string) {
  return (
    PLATFORM_OPTIONS.find(
      (option) => option.value === value
    )?.label || value
  );
}

function formatLabel(value: string) {
  if (value === "audio") {
    return "Audio · Camera off";
  }

  if (value === "video") {
    return "Video · Camera optional";
  }

  return value;
}

function timezoneLabel(timezone: string) {
  return (
    COMMON_TIMEZONES.find(
      (option) => option.value === timezone
    )?.label || timezone
  );
}

export default function AssessmentBookingForm({
  locale,
}: AssessmentBookingFormProps) {
  const [
    visitorTimezone,
    setVisitorTimezone,
  ] = useState(SOURCE_TIMEZONE);

  const [
    detectedTimezone,
    setDetectedTimezone,
  ] = useState(SOURCE_TIMEZONE);

  const [
    timezoneReady,
    setTimezoneReady,
  ] = useState(false);

  const [teachers, setTeachers] = useState<
    Teacher[]
  >([]);

  const [
    selectedTeacherSlug,
    setSelectedTeacherSlug,
  ] = useState("");

  const [
    teachersLoading,
    setTeachersLoading,
  ] = useState(true);

  const [
    teacherError,
    setTeacherError,
  ] = useState("");

  const [
    learnerType,
    setLearnerType,
  ] = useState<"self" | "child">("self");

  const [
    learnerName,
    setLearnerName,
  ] = useState("");

  const [
    preferredName,
    setPreferredName,
  ] = useState("");

  const [
    learnerAge,
    setLearnerAge,
  ] = useState("");

  const [
    contactName,
    setContactName,
  ] = useState("");

  const [email, setEmail] = useState("");

  const [
    englishLevel,
    setEnglishLevel,
  ] = useState("");

  const [
    learningGoal,
    setLearningGoal,
  ] = useState("");

  const [notes, setNotes] = useState("");

  const [
    assessmentFormat,
    setAssessmentFormat,
  ] = useState<"audio" | "video">("video");

  const [
    preferredPlatform,
    setPreferredPlatform,
  ] = useState("microsoft_teams");

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] = useState(false);

  const [
    availabilityError,
    setAvailabilityError,
  ] = useState("");

  const [
    sourceSlots,
    setSourceSlots,
  ] = useState<SourceSlot[]>([]);

  const [
    selectedLocalDate,
    setSelectedLocalDate,
  ] = useState("");

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState<LocalSlot | null>(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    booking,
    setBooking,
  ] = useState<BookingResult | null>(null);

  useEffect(() => {
    const detected = getVisitorTimezone();

    setDetectedTimezone(detected);
    setVisitorTimezone(detected);
    setTimezoneReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      setTeachersLoading(true);
      setTeacherError("");

      try {
        const response = await fetch(
          "/api/teachers",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load teachers."
          );
        }

        const data = await response.json();

        const teacherList = Array.isArray(data)
          ? data
          : Array.isArray(data.teachers)
            ? data.teachers
            : [];

        if (cancelled) {
          return;
        }

        setTeachers(teacherList);

        if (teacherList.length === 1) {
          setSelectedTeacherSlug(
            teacherList[0].slug
          );
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setTeacherError(
            "We couldn't load the available teachers right now."
          );
        }
      } finally {
        if (!cancelled) {
          setTeachersLoading(false);
        }
      }
    }

    loadTeachers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedTeacherSlug) {
      setSourceSlots([]);
      setSelectedLocalDate("");
      setSelectedSlot(null);
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      setSelectedSlot(null);

      try {
        const today = new Date();

        const startDate = dateKeyFromParts(
          today.getFullYear(),
          today.getMonth() + 1,
          today.getDate()
        );

        const response = await fetch(
          `/api/teachers/${encodeURIComponent(
            selectedTeacherSlug
          )}/availability?start_date=${encodeURIComponent(
            startDate
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load availability."
          );
        }

        const data =
          (await response.json()) as AvailabilityResponse;

        if (
          data.source_timezone !== SOURCE_TIMEZONE
        ) {
          throw new Error(
            "Unexpected availability timezone."
          );
        }

        if (cancelled) {
          return;
        }

        setSourceSlots(data.slots || []);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setSourceSlots([]);
          setSelectedLocalDate("");

          setAvailabilityError(
            "We couldn't load the available assessment times right now."
          );
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedTeacherSlug]);

  const localSlots = useMemo(() => {
    if (
      !timezoneReady ||
      !visitorTimezone
    ) {
      return [];
    }

    const converted = sourceSlots
      .map((slot) =>
        sourceSlotToLocal(
          slot,
          visitorTimezone
        )
      )
      .filter(
        (
          slot
        ): slot is LocalSlot => Boolean(slot)
      )
      .filter(
        (slot) => slot.timestamp > Date.now()
      )
      .sort(
        (a, b) => a.timestamp - b.timestamp
      );

    return converted.filter(
      (slot, index, array) =>
        array.findIndex(
          (item) =>
            item.sourceDate ===
              slot.sourceDate &&
            item.sourceTime === slot.sourceTime
        ) === index
    );
  }, [
    sourceSlots,
    visitorTimezone,
    timezoneReady,
  ]);

  useEffect(() => {
    setSelectedSlot(null);

    const firstDate =
      localSlots[0]?.localDate || "";

    setSelectedLocalDate(firstDate);
  }, [
    visitorTimezone,
    sourceSlots,
  ]);

  useEffect(() => {
    if (learnerType === "self") {
      setLearnerAge("");

      if (
        !contactName.trim() ||
        contactName === learnerName
      ) {
        setContactName(learnerName);
      }
    }
  }, [
    learnerType,
    learnerName,
    contactName,
  ]);

  const selectedTeacher = useMemo(
    () =>
      teachers.find(
        (teacher) =>
          teacher.slug === selectedTeacherSlug
      ) || null,
    [
      teachers,
      selectedTeacherSlug,
    ]
  );

  const availableDates = useMemo(() => {
    return Array.from(
      new Set(
        localSlots.map(
          (slot) => slot.localDate
        )
      )
    );
  }, [localSlots]);

  const slotsForSelectedDate = useMemo(
    () =>
      localSlots.filter(
        (slot) =>
          slot.localDate === selectedLocalDate
      ),
    [
      localSlots,
      selectedLocalDate,
    ]
  );

  const timezoneOptions = useMemo(() => {
    const detectedExists =
      COMMON_TIMEZONES.some(
        (option) =>
          option.value === detectedTimezone
      );

    if (
      detectedExists ||
      !detectedTimezone
    ) {
      return COMMON_TIMEZONES;
    }

    return [
      {
        value: detectedTimezone,
        label: `Detected — ${detectedTimezone}`,
      },
      ...COMMON_TIMEZONES,
    ];
  }, [detectedTimezone]);

  function handleTimezoneChange(
    timezone: string
  ) {
    setSelectedSlot(null);
    setSelectedLocalDate("");
    setSubmitError("");
    setVisitorTimezone(timezone);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitError("");

    if (!selectedTeacherSlug) {
      setSubmitError(
        "Please choose a teacher."
      );
      return;
    }

    if (!selectedSlot) {
      setSubmitError(
        "Please choose an assessment time."
      );
      return;
    }

    if (
      learnerType === "child" &&
      !learnerAge
    ) {
      setSubmitError(
        "Please enter the child's age."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/assessments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            teacherSlug:
              selectedTeacherSlug,

            learnerType,
            learnerName,
            preferredName,

            learnerAge:
              learnerType === "child"
                ? Number(learnerAge)
                : null,

            contactName:
              learnerType === "self"
                ? learnerName
                : contactName,

            email,

            // Kept compatible with the current API.
            contactMethod: "",
            contactId: "",

            englishLevel,
            learningGoal,
            notes,
            assessmentFormat,
            preferredPlatform,

            timezone: visitorTimezone,

            assessmentDate:
              selectedSlot.sourceDate,

            assessmentTime:
              selectedSlot.sourceTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data.code === "SLOT_UNAVAILABLE"
        ) {
          setSelectedSlot(null);

          throw new Error(
            "That time was just booked. Please choose another available time."
          );
        }

        throw new Error(
          data.error ||
            "We couldn't book your assessment."
        );
      }

      setBooking(data.booking);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't book your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    const localBookingInstant =
      zonedDateTimeToUtc(
        booking.date,
        booking.time,
        booking.sourceTimezone
      );

    const localBookingParts =
      getTimeZoneParts(
        localBookingInstant,
        booking.visitorTimezone
      );

    const localBookingDate =
      dateKeyFromParts(
        localBookingParts.year,
        localBookingParts.month,
        localBookingParts.day
      );

    const localBookingTime = `${pad(
      localBookingParts.hour
    )}:${pad(
      localBookingParts.minute
    )}`;

    return (
      <div className="min-h-screen bg-[#F4F1EB]">
        <section className="px-5 pb-24 pt-36 sm:px-8 sm:pb-32 sm:pt-44">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[30px] border border-[#DDD8CF] bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(101,130,105,0.08)] sm:px-12 sm:py-14">
              <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#E3ECE4] text-2xl text-[#658269]">
                ✓
              </div>

              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#6F8F72]">
                Booking Confirmed
              </p>

              <h1 className="font-serif text-4xl leading-tight text-[#2D342F] sm:text-5xl">
                Your conversation starts here.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6B6B66] sm:text-base">
                Your Free Assessment has been
                booked. We&apos;ve also sent a
                confirmation to{" "}
                <span className="font-medium text-[#3D4740]">
                  {email}
                </span>
                .
              </p>

              <div className="mt-10 rounded-[22px] border border-[#E3DFD7] bg-[#FAF8F5] p-6 text-left sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <SummaryItem
                    label="Learner"
                    value={
                      booking.preferredName ||
                      booking.learnerName
                    }
                  />

                  <SummaryItem
                    label="Teacher"
                    value={booking.teacher.name}
                  />

                  <SummaryItem
                    label="Date"
                    value={formatLongDate(
                      localBookingDate,
                      locale
                    )}
                  />

                  <SummaryItem
                    label="Time"
                    value={formatTime(
                      localBookingTime,
                      locale
                    )}
                  />

                  <SummaryItem
                    label="Format"
                    value={formatLabel(
                      booking.format
                    )}
                  />

                  <SummaryItem
                    label="Platform"
                    value={platformLabel(
                      booking.platform
                    )}
                  />
                </div>

                <div className="mt-6 border-t border-[#DEDAD2] pt-5">
                  <p className="text-sm leading-6 text-[#77756F]">
                    Times are shown in{" "}
                    <span className="font-medium text-[#4C554F]">
                      {timezoneLabel(
                        booking.visitorTimezone
                      )}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-[#77756F]">
                We&apos;ll send the meeting
                details and anything you need
                before your assessment.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F4F1EB]"
    >
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#6F8F72] px-5 pb-20 pt-36 text-center sm:px-8 sm:pb-24 sm:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/[0.035]" />

        <div className="pointer-events-none absolute left-1/2 top-[-170px] h-[360px] w-[360px] -translate-x-1/2 rounded-full border border-white/[0.03]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#E3E9E2]">
            Book a Free Assessment
          </p>

          <h1 className="font-serif text-[46px] leading-[1.04] tracking-[-0.02em] text-[#FAF8F5] sm:text-6xl lg:text-[68px]">
            Let&apos;s start with
            <br className="hidden sm:block" />{" "}
            a conversation.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-[#EEF1EC] sm:text-[17px] sm:leading-8">
            A relaxed 30-minute conversation
            to understand your English, your
            goals, and what kind of support
            may work best for you.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#F1F4EF] sm:text-sm">
            <span>30 minutes</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#C9D8CA]"
            />

            <span>No payment</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#C9D8CA]"
            />

            <span>No account required</span>
          </div>
        </div>

        {/* Subtle transition instead of the large curve */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#F4F1EB]" />
      </section>

      {/* FORM */}
      <div className="mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8 sm:pb-36 sm:pt-12">
        <FormSection
          number="01"
          eyebrow="About You"
          title="Tell us who we'll be talking with."
          description="Just enough information to make the conversation feel a little more personal."
        >
          <FieldGroup label="Who is the assessment for?">
            <div className="grid grid-cols-2 gap-3">
              <ChoiceButton
                active={learnerType === "self"}
                onClick={() =>
                  setLearnerType("self")
                }
              >
                Myself
              </ChoiceButton>

              <ChoiceButton
                active={learnerType === "child"}
                onClick={() =>
                  setLearnerType("child")
                }
              >
                My child
              </ChoiceButton>
            </div>
          </FieldGroup>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label={
                learnerType === "child"
                  ? "Child's full name"
                  : "Full name"
              }
              value={learnerName}
              onChange={setLearnerName}
              required
              autoComplete="name"
            />

            <InputField
              label="Preferred name or English name"
              hint="Optional"
              value={preferredName}
              onChange={setPreferredName}
              placeholder="The name you'd like us to use"
            />
          </div>

          {learnerType === "child" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Child's age"
                value={learnerAge}
                onChange={setLearnerAge}
                required
                type="number"
                min="1"
                max="120"
              />

              <InputField
                label="Parent / guardian name"
                value={contactName}
                onChange={setContactName}
                required
                autoComplete="name"
              />
            </div>
          )}

          <InputField
            label={
              learnerType === "child"
                ? "Parent / guardian email"
                : "Email"
            }
            value={email}
            onChange={setEmail}
            required
            type="email"
            autoComplete="email"
          />

          <p className="-mt-2 text-xs leading-5 text-[#8A8A83]">
            We&apos;ll use this email for your
            booking confirmation and assessment
            details.
          </p>
        </FormSection>

        <FormSection
          number="02"
          eyebrow="Your English"
          title="Where are you starting from?"
          description="There is no right level to begin. This simply helps your teacher understand where the conversation can start."
        >
          <SelectField
            label="How comfortable are you with English?"
            value={englishLevel}
            onChange={setEnglishLevel}
            required
          >
            <option value="">
              Choose the closest description
            </option>

            {LEVEL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="What would you like to work on?"
            value={learningGoal}
            onChange={setLearningGoal}
            required
          >
            <option value="">
              Choose a goal
            </option>

            {GOAL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </SelectField>

          <TextAreaField
            label="Anything you'd like us to know?"
            hint="Optional"
            value={notes}
            onChange={setNotes}
            placeholder="You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know."
          />
        </FormSection>

        <FormSection
          number="03"
          eyebrow="Your Assessment"
          title="Choose how you'd like to talk."
          description="The conversation stays the same. Choose the setup that feels most comfortable for you."
        >
          <FieldGroup label="Assessment format">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                active={
                  assessmentFormat === "audio"
                }
                onClick={() =>
                  setAssessmentFormat("audio")
                }
                title="Audio"
                description="Camera off"
              />

              <ChoiceButton
                active={
                  assessmentFormat === "video"
                }
                onClick={() =>
                  setAssessmentFormat("video")
                }
                title="Video"
                description="Camera optional"
              />
            </div>
          </FieldGroup>

          <FieldGroup label="Preferred platform">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PLATFORM_OPTIONS.map(
                (platform) => (
                  <ChoiceButton
                    key={platform.value}
                    active={
                      preferredPlatform ===
                      platform.value
                    }
                    onClick={() =>
                      setPreferredPlatform(
                        platform.value
                      )
                    }
                  >
                    {platform.label}
                  </ChoiceButton>
                )
              )}
            </div>
          </FieldGroup>
        </FormSection>

        <FormSection
          number="04"
          eyebrow="Choose a Time"
          title="Find a time that works for you."
          description="Choose your timezone first. All available dates and times will be shown in that timezone."
          last
        >
          {teachersLoading ? (
            <SoftMessage>
              Loading teachers…
            </SoftMessage>
          ) : teacherError ? (
            <ErrorMessage>
              {teacherError}
            </ErrorMessage>
          ) : teachers.length === 0 ? (
            <SoftMessage>
              There are no teachers available for
              assessment booking right now.
            </SoftMessage>
          ) : (
            <>
              {teachers.length > 1 && (
                <FieldGroup label="Choose your teacher">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {teachers.map((teacher) => (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() =>
                          setSelectedTeacherSlug(
                            teacher.slug
                          )
                        }
                        className={`rounded-[20px] border p-5 text-left transition ${
                          selectedTeacherSlug ===
                          teacher.slug
                            ? "border-[#6F8F72] bg-[#EDF3EE] shadow-[0_8px_24px_rgba(101,130,105,0.06)]"
                            : "border-[#D9D5CD] bg-[#FAF8F5] hover:border-[#AEBBAF] hover:bg-white"
                        }`}
                      >
                        <p className="font-serif text-2xl text-[#2D342F]">
                          {teacher.name}
                        </p>

                        {teacher.card_label && (
                          <p className="mt-1 text-sm text-[#77756F]">
                            {teacher.card_label}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </FieldGroup>
              )}

              {selectedTeacher && (
                <div className="flex items-center gap-4 rounded-[20px] border border-[#D9D5CD] bg-[#FAF8F5] p-5">
                  {selectedTeacher.avatar_url ? (
                    <img
                      src={selectedTeacher.avatar_url}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E3ECE4] font-serif text-xl text-[#658269]">
                      {selectedTeacher.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A83]">
                      Your teacher
                    </p>

                    <p className="mt-1 font-serif text-2xl text-[#2D342F]">
                      {selectedTeacher.name}
                    </p>

                    {selectedTeacher.card_label && (
                      <p className="mt-0.5 text-sm text-[#77756F]">
                        {selectedTeacher.card_label}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-[#414A44]">
                    Your timezone
                  </p>

                  {visitorTimezone ===
                    detectedTimezone && (
                    <span className="text-xs text-[#6F8F72]">
                      Detected automatically
                    </span>
                  )}
                </div>

                <select
                  value={visitorTimezone}
                  onChange={(event) =>
                    handleTimezoneChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-[16px] border border-[#D8D4CC] bg-[#FAF8F5] px-4 py-3.5 text-[15px] text-[#333B36] outline-none transition hover:border-[#C7C3BB] focus:border-[#7F9782] focus:bg-white focus:ring-2 focus:ring-[#DDE7DE]"
                >
                  {timezoneOptions.map(
                    (timezone) => (
                      <option
                        key={timezone.value}
                        value={timezone.value}
                      >
                        {timezone.label}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2.5 text-xs leading-5 text-[#8A8A83]">
                  We detected your timezone from
                  your device. Change it if
                  you&apos;re booking for a
                  different location.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-[16px] bg-[#E8ECE7] px-4 py-3.5">
                <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F8F72]" />

                <p className="text-sm leading-6 text-[#626B65]">
                  Available dates and times below
                  are shown in{" "}
                  <span className="font-medium text-[#3E4A42]">
                    {timezoneLabel(
                      visitorTimezone
                    )}
                  </span>
                  .
                </p>
              </div>

              {!selectedTeacherSlug ? (
                <SoftMessage>
                  Choose a teacher to see available
                  assessment times.
                </SoftMessage>
              ) : availabilityLoading ? (
                <SoftMessage>
                  Finding available times…
                </SoftMessage>
              ) : availabilityError ? (
                <ErrorMessage>
                  {availabilityError}
                </ErrorMessage>
              ) : localSlots.length === 0 ? (
                <SoftMessage>
                  There are no available assessment
                  times in the current booking
                  window.
                </SoftMessage>
              ) : (
                <>
                  <FieldGroup label="Available dates">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {availableDates.map(
                        (date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => {
                              setSelectedLocalDate(
                                date
                              );

                              setSelectedSlot(null);
                            }}
                            className={`shrink-0 rounded-[16px] border px-5 py-3 text-sm transition ${
                              selectedLocalDate ===
                              date
                                ? "border-[#658269] bg-[#658269] text-white shadow-[0_8px_20px_rgba(101,130,105,0.12)]"
                                : "border-[#D8D4CC] bg-[#FAF8F5] text-[#4F5752] hover:border-[#AEBBAF] hover:bg-white"
                            }`}
                          >
                            {formatDate(
                              date,
                              locale
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Available times">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {slotsForSelectedDate.map(
                        (slot) => {
                          const active =
                            selectedSlot?.sourceDate ===
                              slot.sourceDate &&
                            selectedSlot?.sourceTime ===
                              slot.sourceTime;

                          return (
                            <button
                              key={`${slot.sourceDate}-${slot.sourceTime}`}
                              type="button"
                              onClick={() =>
                                setSelectedSlot(slot)
                              }
                              className={`rounded-[15px] border px-4 py-3 text-sm font-medium transition ${
                                active
                                  ? "border-[#658269] bg-[#658269] text-white shadow-[0_8px_20px_rgba(101,130,105,0.12)]"
                                  : "border-[#D8D4CC] bg-[#FAF8F5] text-[#465149] hover:border-[#8FA391] hover:bg-white"
                              }`}
                            >
                              {formatTime(
                                slot.localTime,
                                locale
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </FieldGroup>
                </>
              )}
            </>
          )}
        </FormSection>

        {/* FINAL SUMMARY */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#D7D3CB] bg-white shadow-[0_22px_65px_rgba(101,130,105,0.09)]">
          <div className="border-b border-[#E6E2DB] px-6 py-7 sm:px-9">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#C9D8CA]" />

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F8F72]">
                Your Assessment
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl text-[#2D342F] sm:text-[34px]">
              Ready when you are.
            </h2>
          </div>

          <div className="p-6 sm:p-9">
            {selectedSlot &&
            selectedTeacher ? (
              <>
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <SummaryItem
                    label="Teacher"
                    value={selectedTeacher.name}
                  />

                  <SummaryItem
                    label="Duration"
                    value="30 minutes"
                  />

                  <SummaryItem
                    label="Date"
                    value={formatLongDate(
                      selectedSlot.localDate,
                      locale
                    )}
                  />

                  <SummaryItem
                    label="Time"
                    value={formatTime(
                      selectedSlot.localTime,
                      locale
                    )}
                  />

                  <SummaryItem
                    label="Format"
                    value={formatLabel(
                      assessmentFormat
                    )}
                  />

                  <SummaryItem
                    label="Platform"
                    value={platformLabel(
                      preferredPlatform
                    )}
                  />
                </div>

                <p className="mt-7 border-t border-[#E6E2DB] pt-5 text-sm leading-6 text-[#77756F]">
                  Date and time shown in{" "}
                  <span className="font-medium text-[#4C554F]">
                    {timezoneLabel(
                      visitorTimezone
                    )}
                  </span>
                  .
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#77756F]">
                Choose an available date and time
                above to complete your booking.
              </p>
            )}

            {submitError && (
              <div className="mt-6 rounded-[16px] border border-[#E3C7C2] bg-[#FCF4F2] px-4 py-3 text-sm leading-6 text-[#8A4940]">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                !selectedSlot ||
                !selectedTeacher
              }
              className="mt-8 flex w-full items-center justify-center rounded-full bg-[#658269] px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(101,130,105,0.14)] transition hover:bg-[#58755D] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              {submitting
                ? "Booking your assessment…"
                : "Book Free Assessment"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#8A8A83]">
              No payment is required. Your booking
              is confirmed once you submit this
              form.
            </p>
          </div>
        </section>
      </div>
    </form>
  );
}

function FormSection({
  number,
  eyebrow,
  title,
  description,
  children,
  last = false,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={`grid gap-8 py-12 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 ${
        last
          ? ""
          : "border-b border-[#D8D4CC]"
      }`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-[0.18em] text-[#A09E97]">
            {number}
          </span>

          <span className="h-px w-6 bg-[#A7B7A8]" />

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F8F72]">
            {eyebrow}
          </p>
        </div>

        <h2 className="mt-4 font-serif text-[30px] leading-[1.12] text-[#2D342F] sm:text-[34px]">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-7 text-[#77756F]">
          {description}
        </p>
      </div>

      <div className="min-w-0 space-y-6">
        {children}
      </div>
    </section>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-[#414A44]">
        {label}
      </p>

      {children}
    </div>
  );
}

function InputField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
  min,
  max,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 flex items-center gap-2 text-sm font-medium text-[#414A44]">
        {label}

        {hint && (
          <span className="text-xs font-normal text-[#9A9B94]">
            {hint}
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        className="w-full rounded-[16px] border border-[#D8D4CC] bg-[#FAF8F5] px-4 py-3.5 text-[15px] text-[#333B36] outline-none transition placeholder:text-[#AAA9A3] hover:border-[#C7C3BB] focus:border-[#7F9782] focus:bg-white focus:ring-2 focus:ring-[#DDE7DE]"
      />
    </label>
  );
}

function SelectField({
  label,
  hint,
  value,
  onChange,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 flex items-center gap-2 text-sm font-medium text-[#414A44]">
        {label}

        {hint && (
          <span className="text-xs font-normal text-[#9A9B94]">
            {hint}
          </span>
        )}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        required={required}
        className="w-full rounded-[16px] border border-[#D8D4CC] bg-[#FAF8F5] px-4 py-3.5 text-[15px] text-[#333B36] outline-none transition hover:border-[#C7C3BB] focus:border-[#7F9782] focus:bg-white focus:ring-2 focus:ring-[#DDE7DE]"
      >
        {children}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 flex items-center gap-2 text-sm font-medium text-[#414A44]">
        {label}

        {hint && (
          <span className="text-xs font-normal text-[#9A9B94]">
            {hint}
          </span>
        )}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-[16px] border border-[#D8D4CC] bg-[#FAF8F5] px-4 py-3.5 text-[15px] leading-7 text-[#333B36] outline-none transition placeholder:text-[#AAA9A3] hover:border-[#C7C3BB] focus:border-[#7F9782] focus:bg-white focus:ring-2 focus:ring-[#DDE7DE]"
      />
    </label>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[17px] border px-5 py-4 text-left transition ${
        active
          ? "border-[#6F8F72] bg-[#E9F0EA] shadow-[0_6px_20px_rgba(101,130,105,0.05)]"
          : "border-[#D8D4CC] bg-[#FAF8F5] hover:border-[#AEBBAF] hover:bg-white"
      }`}
    >
      {title ? (
        <>
          <span className="block text-[15px] font-medium text-[#364039]">
            {title}
          </span>

          {description && (
            <span className="mt-1 block text-xs text-[#81817B]">
              {description}
            </span>
          )}
        </>
      ) : (
        <span className="block text-sm font-medium text-[#414A44]">
          {children}
        </span>
      )}
    </button>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#92928C]">
        {label}
      </p>

      <p className="mt-1.5 text-[15px] font-medium leading-6 text-[#3D4740]">
        {value}
      </p>
    </div>
  );
}

function SoftMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#DDD9D1] bg-[#EDEAE4] px-5 py-5 text-sm leading-6 text-[#6B6B66]">
      {children}
    </div>
  );
}

function ErrorMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#E3C7C2] bg-[#FCF4F2] px-5 py-4 text-sm leading-6 text-[#8A4940]">
      {children}
    </div>
  );
}