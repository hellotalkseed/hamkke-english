"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
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
    label: "Philippines - Manila (GMT+8)",
  },
  {
    value: "Asia/Seoul",
    label: "South Korea - Seoul (GMT+9)",
  },
  {
    value: "Asia/Tokyo",
    label: "Japan - Tokyo (GMT+9)",
  },
  {
    value: "Asia/Shanghai",
    label: "China - Beijing (GMT+8)",
  },
  {
    value: "Asia/Ho_Chi_Minh",
    label: "Vietnam - Ho Chi Minh City (GMT+7)",
  },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Malaysia - Kuala Lumpur (GMT+8)",
  },
  {
    value: "Asia/Jakarta",
    label: "Indonesia - Jakarta (GMT+7)",
  },
  {
    value: "Asia/Makassar",
    label: "Indonesia - Makassar / Bali (GMT+8)",
  },
  {
    value: "Asia/Jayapura",
    label: "Indonesia - Jayapura (GMT+9)",
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
      timeZone: "UTC",
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
      timeZone: "UTC",
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

function formatLabel(value: string, locale: Locale) {
  if (value === "audio") {
    return translate(locale, "Audio Â· Camera off");
  }

  if (value === "video") {
    return translate(locale, "Video Â· Camera optional");
  }

  return value;
}

function timezoneLabel(timezone: string, locale: Locale) {
  return translate(locale,
    COMMON_TIMEZONES.find(
      (option) => option.value === timezone
    )?.label || timezone
  );
}


const ASSESSMENT_TRANSLATIONS: Record<Exclude<Locale, "en">, Record<string, string>> = {
  "ko": {
    "Booking Confirmed": "ì˜ˆì•½ì´ í™•ì •ë˜ì—ˆì–´ìš”",
    "Your conversation starts here.": "ìš°ë¦¬ì˜ ì²« ëŒ€í™”ê°€ ì—¬ê¸°ì„œ ì‹œìž‘ë¼ìš”.",
    "We'll send the meeting details and anything you need before your assessment.": "ë ˆë²¨ ìƒë‹´ ì „ì— ì ‘ì† ë°©ë²•ê³¼ í•„ìš”í•œ ì•ˆë‚´ë¥¼ ë³´ë‚´ë“œë¦´ê²Œìš”.",
    "Book a Free Assessment": "ë¬´ë£Œ ë ˆë²¨ ìƒë‹´ ì˜ˆì•½",
    "Let's start with": "ë¨¼ì € íŽ¸ì•ˆí•˜ê²Œ",
    "a conversation.": "ëŒ€í™”ë¶€í„° ì‹œìž‘í•´ ë³¼ê¹Œìš”?",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "íŽ¸ì•ˆí•œ 30ë¶„ ëŒ€í™”ë¥¼ í†µí•´ í˜„ìž¬ ì˜ì–´ ì‹¤ë ¥ê³¼ ëª©í‘œë¥¼ ì•Œì•„ë³´ê³ , ì–´ë–¤ ë„ì›€ì´ ìž˜ ë§žì„ì§€ í•¨ê»˜ ì‚´íŽ´ë´ìš”.",
    "30 minutes": "30ë¶„",
    "No payment": "ê²°ì œ ì—†ì´ ë¬´ë£Œë¡œ",
    "No account required": "íšŒì›ê°€ìž… ì—†ì´",
    "Myself": "ë³¸ì¸",
    "My child": "ìžë…€",
    "We'll use this email for your booking confirmation and assessment details.": "ì˜ˆì•½ í™•ì¸ê³¼ ë ˆë²¨ ìƒë‹´ ì•ˆë‚´ë¥¼ ì´ ì´ë©”ì¼ë¡œ ë³´ë‚´ë“œë¦´ê²Œìš”.",
    "Choose the closest description": "ê°€ìž¥ ê°€ê¹Œìš´ ì„¤ëª…ì„ ê³¨ë¼ ì£¼ì„¸ìš”",
    "Choose a goal": "ëª©í‘œë¥¼ ì„ íƒí•´ ì£¼ì„¸ìš”",
    "Loading teachersâ€¦": "ì„ ìƒë‹˜ ì •ë³´ë¥¼ ë¶ˆëŸ¬ì˜¤ëŠ” ì¤‘ì´ì—ìš”â€¦",
    "There are no teachers available for assessment booking right now.": "í˜„ìž¬ ë ˆë²¨ ìƒë‹´ì„ ì˜ˆì•½í•  ìˆ˜ ìžˆëŠ” ì„ ìƒë‹˜ì´ ì—†ì–´ìš”.",
    "Your teacher": "í•¨ê»˜í•  ì„ ìƒë‹˜",
    "Your timezone": "ì‹œê°„ëŒ€",
    "Detected automatically": "ìžë™ìœ¼ë¡œ ê°ì§€í–ˆì–´ìš”",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "ê¸°ê¸°ì˜ ì„¤ì •ì„ ë°”íƒ•ìœ¼ë¡œ ì‹œê°„ëŒ€ë¥¼ í™•ì¸í–ˆì–´ìš”. ë‹¤ë¥¸ ì§€ì—­ì—ì„œ ì°¸ì—¬í•  ì˜ˆì •ì´ë¼ë©´ ë³€ê²½í•´ ì£¼ì„¸ìš”.",
    "Choose a teacher to see available assessment times.": "ì„ ìƒë‹˜ì„ ì„ íƒí•˜ë©´ ì˜ˆì•½ ê°€ëŠ¥í•œ ì‹œê°„ì´ í‘œì‹œë¼ìš”.",
    "Finding available timesâ€¦": "ì˜ˆì•½ ê°€ëŠ¥í•œ ì‹œê°„ì„ í™•ì¸í•˜ê³  ìžˆì–´ìš”â€¦",
    "There are no available assessment times in the current booking window.": "í˜„ìž¬ ì˜ˆì•½ ê°€ëŠ¥í•œ ê¸°ê°„ì— ë¹„ì–´ ìžˆëŠ” ìƒë‹´ ì‹œê°„ì´ ì—†ì–´ìš”.",
    "Your Assessment": "ë ˆë²¨ ìƒë‹´",
    "Ready when you are.": "ì¤€ë¹„ë˜ì…¨ë‹¤ë©´ ì˜ˆì•½í•´ ì£¼ì„¸ìš”.",
    "Choose an available date and time above to complete your booking.": "ìœ„ì—ì„œ ê°€ëŠ¥í•œ ë‚ ì§œì™€ ì‹œê°„ì„ ì„ íƒí•œ í›„ ì˜ˆì•½í•´ ì£¼ì„¸ìš”.",
    "No payment is required. Your booking is confirmed once you submit this form.": "ê²°ì œëŠ” í•„ìš”í•˜ì§€ ì•Šì•„ìš”. ì–‘ì‹ ì œì¶œì´ ì™„ë£Œë˜ë©´ ì˜ˆì•½ì´ í™•ì •ë¼ìš”.",
    "Learner": "í•™ìŠµìž",
    "Teacher": "ì„ ìƒë‹˜",
    "Date": "ë‚ ì§œ",
    "Time": "ì‹œê°„",
    "Format": "ì§„í–‰ ë°©ì‹",
    "Platform": "ì‚¬ìš© ì•±",
    "About You": "í•™ìŠµìž ì†Œê°œ",
    "Tell us who we'll be talking with.": "ëˆ„êµ¬ì™€ ì´ì•¼ê¸°í•˜ê²Œ ë ê¹Œìš”?",
    "Just enough information to make the conversation feel a little more personal.": "ë” íŽ¸ì•ˆí•˜ê²Œ ëŒ€í™”ë¥¼ ì‹œìž‘í•  ìˆ˜ ìžˆë„ë¡ ê°„ë‹¨ížˆ ì•Œë ¤ ì£¼ì„¸ìš”.",
    "Who is the assessment for?": "ëˆ„ê°€ ìƒë‹´ì— ì°¸ì—¬í•˜ë‚˜ìš”?",
    "Preferred name or English name": "ë¶ˆë¦¬ê³  ì‹¶ì€ ì´ë¦„ ë˜ëŠ” ì˜ì–´ ì´ë¦„",
    "Optional": "ì„ íƒ ì‚¬í•­",
    "The name you'd like us to use": "ì–´ë–¤ ì´ë¦„ìœ¼ë¡œ ë¶ˆëŸ¬ë“œë¦´ê¹Œìš”?",
    "Child's age": "ìžë…€ ë‚˜ì´",
    "Parent / guardian name": "í•™ë¶€ëª¨ / ë³´í˜¸ìž ì´ë¦„",
    "Your English": "ì§€ê¸ˆì˜ ì˜ì–´",
    "Where are you starting from?": "ì§€ê¸ˆ ì˜ì–´ê°€ ì–¼ë§ˆë‚˜ íŽ¸í•˜ê²Œ ëŠê»´ì§€ë‚˜ìš”?",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "ì–´ë–¤ ìˆ˜ì¤€ì´ë“  ê´œì°®ì•„ìš”. ì„ ìƒë‹˜ì´ ëŒ€í™”ë¥¼ ì–´ë””ì„œ ì‹œìž‘í•˜ë©´ ì¢‹ì„ì§€ ì•Œì•„ë³´ëŠ” ì§ˆë¬¸ì´ì—ìš”.",
    "How comfortable are you with English?": "ì˜ì–´ë¡œ ëŒ€í™”í•˜ëŠ” ê²ƒì´ ì–¼ë§ˆë‚˜ íŽ¸í•œê°€ìš”?",
    "What would you like to work on?": "ì–´ë–¤ ë¶€ë¶„ì„ í•¨ê»˜ ì—°ìŠµí•˜ê³  ì‹¶ë‚˜ìš”?",
    "Anything you'd like us to know?": "ë¯¸ë¦¬ ì•Œë ¤ì£¼ê³  ì‹¶ì€ ê²ƒì´ ìžˆë‚˜ìš”?",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "ëª©í‘œë‚˜ ì§€ê¸ˆê¹Œì§€ì˜ í•™ìŠµ ê²½í—˜, ì„ ìƒë‹˜ê»˜ ë¯¸ë¦¬ ì „í•˜ê³  ì‹¶ì€ ë‚´ìš©ì„ íŽ¸í•˜ê²Œ ì ì–´ ì£¼ì„¸ìš”.",
    "Choose how you'd like to talk.": "íŽ¸ì•ˆí•œ ëŒ€í™” ë°©ì‹ì„ ê³¨ë¼ ì£¼ì„¸ìš”.",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "ì–´ë–¤ ë°©ì‹ì„ ì„ íƒí•´ë„ ëŒ€í™” ë‚´ìš©ì€ ê°™ì•„ìš”. ê°€ìž¥ íŽ¸í•˜ê²Œ ì°¸ì—¬í•  ìˆ˜ ìžˆëŠ” ë°©ë²•ì„ ê³¨ë¼ ì£¼ì„¸ìš”.",
    "Assessment format": "ìƒë‹´ ì§„í–‰ ë°©ì‹",
    "Audio": "ìŒì„± í†µí™”",
    "Camera off": "ì¹´ë©”ë¼ ë„ê³  ì°¸ì—¬",
    "Video": "ì˜ìƒ í†µí™”",
    "Camera optional": "ì¹´ë©”ë¼ ì‚¬ìš©ì€ ìžìœ ë¡­ê²Œ",
    "Preferred platform": "ì„ í˜¸í•˜ëŠ” ì•±",
    "Choose a Time": "ì‹œê°„ ì„ íƒ",
    "Find a time that works for you.": "íŽ¸í•œ ì‹œê°„ì„ ê³¨ë¼ ì£¼ì„¸ìš”.",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "ë¨¼ì € ì‹œê°„ëŒ€ë¥¼ ì„ íƒí•´ ì£¼ì„¸ìš”. ì˜ˆì•½ ê°€ëŠ¥í•œ ë‚ ì§œì™€ ì‹œê°„ì´ í•´ë‹¹ ì‹œê°„ëŒ€ ê¸°ì¤€ìœ¼ë¡œ í‘œì‹œë¼ìš”.",
    "Choose your teacher": "ì„ ìƒë‹˜ ì„ íƒ",
    "Available dates": "ì˜ˆì•½ ê°€ëŠ¥í•œ ë‚ ì§œ",
    "Available times": "ì˜ˆì•½ ê°€ëŠ¥í•œ ì‹œê°„",
    "Duration": "ì†Œìš” ì‹œê°„",
    "Child's full name": "ìžë…€ ì„±ëª…",
    "Full name": "ì„±ëª…",
    "Parent / guardian email": "í•™ë¶€ëª¨ / ë³´í˜¸ìž ì´ë©”ì¼",
    "Email": "ì´ë©”ì¼",
    "Booking your assessmentâ€¦": "ì˜ˆì•½ì„ ì§„í–‰í•˜ê³  ìžˆì–´ìš”â€¦",
    "Book Free Assessment": "ë¬´ë£Œ ë ˆë²¨ ìƒë‹´ ì˜ˆì•½í•˜ê¸°",
    "Please choose a teacher.": "ì„ ìƒë‹˜ì„ ì„ íƒí•´ ì£¼ì„¸ìš”.",
    "Please choose an assessment time.": "ìƒë‹´ ì‹œê°„ì„ ì„ íƒí•´ ì£¼ì„¸ìš”.",
    "Please enter the child's age.": "ìžë…€ì˜ ë‚˜ì´ë¥¼ ìž…ë ¥í•´ ì£¼ì„¸ìš”.",
    "That time was just booked. Please choose another available time.": "ë°©ê¸ˆ ë‹¤ë¥¸ ë¶„ì´ ì˜ˆì•½í•œ ì‹œê°„ì´ì—ìš”. ë‹¤ë¥¸ ì‹œê°„ì„ ì„ íƒí•´ ì£¼ì„¸ìš”.",
    "We couldn't book your assessment.": "ì˜ˆì•½ì„ ì™„ë£Œí•˜ì§€ ëª»í–ˆì–´ìš”. ìž…ë ¥ ë‚´ìš©ì„ í™•ì¸í•œ í›„ ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
    "We couldn't load the available teachers right now.": "ì§€ê¸ˆì€ ì„ ìƒë‹˜ ì •ë³´ë¥¼ ë¶ˆëŸ¬ì˜¬ ìˆ˜ ì—†ì–´ìš”. ìž ì‹œ í›„ ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
    "We couldn't load the available assessment times right now.": "ì§€ê¸ˆì€ ì˜ˆì•½ ê°€ëŠ¥í•œ ì‹œê°„ì„ ë¶ˆëŸ¬ì˜¬ ìˆ˜ ì—†ì–´ìš”. ìž ì‹œ í›„ ë‹¤ì‹œ ì‹œë„í•´ ì£¼ì„¸ìš”.",
    "Audio Â· Camera off": "ìŒì„± í†µí™” Â· ì¹´ë©”ë¼ ë„ê¸°",
    "Video Â· Camera optional": "ì˜ìƒ í†µí™” Â· ì¹´ë©”ë¼ ì‚¬ìš© ìžìœ ",
    "I'm just getting started.": "ì´ì œ ë§‰ ì‹œìž‘í–ˆì–´ìš”.",
    "I understand some English, but speaking is difficult.": "ì˜ì–´ë¥¼ ì¡°ê¸ˆ ì´í•´í•˜ì§€ë§Œ ë§í•˜ê¸°ëŠ” ì–´ë ¤ì›Œìš”.",
    "I can have simple conversations, but I often hesitate.": "ê°„ë‹¨í•œ ëŒ€í™”ëŠ” í•  ìˆ˜ ìžˆì§€ë§Œ ë§í•  ë•Œ ìžì£¼ ë§ì„¤ì—¬ìš”.",
    "I can communicate well, but I want to sound more natural.": "ì˜ì‚¬ì†Œí†µì€ ìž˜ ë˜ì§€ë§Œ ë” ìžì—°ìŠ¤ëŸ½ê²Œ ë§í•˜ê³  ì‹¶ì–´ìš”.",
    "I'm comfortable speaking and want to improve my fluency.": "ë§í•˜ê¸°ê°€ íŽ¸í•˜ê³ , ë” ìœ ì°½í•˜ê²Œ ë§í•˜ê³  ì‹¶ì–´ìš”.",
    "Speak more confidently": "ë” ìžì‹  ìžˆê²Œ ë§í•˜ê¸°",
    "Improve everyday conversation": "ì¼ìƒ ëŒ€í™” ì—°ìŠµ",
    "English for work": "ì—…ë¬´ ì˜ì–´",
    "Interview preparation": "ë©´ì ‘ ì¤€ë¹„",
    "Travel English": "ì—¬í–‰ ì˜ì–´",
    "Overall English": "ì „ë°˜ì ì¸ ì˜ì–´ ì‹¤ë ¥",
    "Something else": "ê·¸ ì™¸",
    "Philippines - Manila (GMT+8)": "í•„ë¦¬í•€ Â· ë§ˆë‹ë¼ (GMT+8)",
    "South Korea - Seoul (GMT+9)": "ëŒ€í•œë¯¼êµ­ Â· ì„œìš¸ (GMT+9)",
    "Japan - Tokyo (GMT+9)": "ì¼ë³¸ Â· ë„ì¿„ (GMT+9)",
    "China - Beijing (GMT+8)": "ì¤‘êµ­ Â· ë² ì´ì§• (GMT+8)",
    "Vietnam - Ho Chi Minh City (GMT+7)": "ë² íŠ¸ë‚¨ Â· í˜¸ì°Œë¯¼ (GMT+7)",
    "Malaysia - Kuala Lumpur (GMT+8)": "ë§ë ˆì´ì‹œì•„ Â· ì¿ ì•Œë¼ë£¸í‘¸ë¥´ (GMT+8)",
    "Indonesia - Jakarta (GMT+7)": "ì¸ë„ë„¤ì‹œì•„ Â· ìžì¹´ë¥´íƒ€ (GMT+7)",
    "Indonesia - Makassar / Bali (GMT+8)": "ì¸ë„ë„¤ì‹œì•„ Â· ë§ˆì¹´ì‚¬ë¥´ / ë°œë¦¬ (GMT+8)",
    "Indonesia - Jayapura (GMT+9)": "ì¸ë„ë„¤ì‹œì•„ Â· ìžì•¼í‘¸ë¼ (GMT+9)",
    "Detected": "ìžë™ ê°ì§€",
    "Confirmation email": "ë¬´ë£Œ ë ˆë²¨ ìƒë‹´ì´ ì˜ˆì•½ë˜ì—ˆì–´ìš”. ì˜ˆì•½ í™•ì¸ ì´ë©”ì¼ì„ ë³´ë‚¸ ì£¼ì†Œ:",
    "Displayed timezone": "ë‚ ì§œì™€ ì‹œê°„ì€ ë‹¤ìŒ ì‹œê°„ëŒ€ ê¸°ì¤€ìœ¼ë¡œ í‘œì‹œë¼ìš”:"
  },
  "zh": {
    "Booking Confirmed": "é¢„çº¦å·²ç¡®è®¤",
    "Your conversation starts here.": "ä»Žè¿™é‡Œï¼Œå¼€å§‹æˆ‘ä»¬çš„ç¬¬ä¸€æ¬¡å¯¹è¯ã€‚",
    "We'll send the meeting details and anything you need before your assessment.": "æˆ‘ä»¬ä¼šåœ¨è¯„ä¼°å‰å‘é€ä¼šè®®ä¿¡æ¯å’Œç›¸å…³å‡†å¤‡äº‹é¡¹ã€‚",
    "Book a Free Assessment": "é¢„çº¦å…è´¹è‹±è¯­è¯„ä¼°",
    "Let's start with": "è®©æˆ‘ä»¬å…ˆ",
    "a conversation.": "èŠä¸€èŠå§ã€‚",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "é€šè¿‡30åˆ†é’Ÿçš„è½»æ¾äº¤æµï¼Œäº†è§£ä½ çš„è‹±è¯­æ°´å¹³ã€å­¦ä¹ ç›®æ ‡ï¼Œä»¥åŠé€‚åˆä½ çš„å­¦ä¹ æ”¯æŒã€‚",
    "30 minutes": "30åˆ†é’Ÿ",
    "No payment": "æ— éœ€ä»˜è´¹",
    "No account required": "æ— éœ€æ³¨å†Œè´¦å·",
    "Myself": "æˆ‘è‡ªå·±",
    "My child": "æˆ‘çš„å­©å­",
    "We'll use this email for your booking confirmation and assessment details.": "æˆ‘ä»¬ä¼šé€šè¿‡æ­¤é‚®ç®±å‘é€é¢„çº¦ç¡®è®¤å’Œè¯„ä¼°è¯¦æƒ…ã€‚",
    "Choose the closest description": "è¯·é€‰æ‹©æœ€ç¬¦åˆçš„æè¿°",
    "Choose a goal": "è¯·é€‰æ‹©å­¦ä¹ ç›®æ ‡",
    "Loading teachersâ€¦": "æ­£åœ¨åŠ è½½è€å¸ˆä¿¡æ¯â€¦",
    "There are no teachers available for assessment booking right now.": "ç›®å‰æš‚æ— å¯é¢„çº¦è¯„ä¼°çš„è€å¸ˆã€‚",
    "Your teacher": "ä½ çš„è€å¸ˆ",
    "Your timezone": "ä½ çš„æ—¶åŒº",
    "Detected automatically": "å·²è‡ªåŠ¨è¯†åˆ«",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "æˆ‘ä»¬å·²æ ¹æ®ä½ çš„è®¾å¤‡è¯†åˆ«æ—¶åŒºã€‚å¦‚æžœä½ å°†åœ¨å…¶ä»–åœ°åŒºå‚åŠ ï¼Œè¯·æ›´æ”¹æ—¶åŒºã€‚",
    "Choose a teacher to see available assessment times.": "é€‰æ‹©è€å¸ˆåŽï¼Œå³å¯æŸ¥çœ‹å¯é¢„çº¦çš„è¯„ä¼°æ—¶é—´ã€‚",
    "Finding available timesâ€¦": "æ­£åœ¨æŸ¥æ‰¾å¯é¢„çº¦æ—¶é—´â€¦",
    "There are no available assessment times in the current booking window.": "å½“å‰å¼€æ”¾é¢„çº¦çš„æ—¥æœŸå†…æš‚æ— å¯ç”¨æ—¶æ®µã€‚",
    "Your Assessment": "ä½ çš„è‹±è¯­è¯„ä¼°",
    "Ready when you are.": "å‡†å¤‡å¥½äº†ï¼Œå°±é¢„çº¦å§ã€‚",
    "Choose an available date and time above to complete your booking.": "è¯·å…ˆåœ¨ä¸Šæ–¹é€‰æ‹©å¯ç”¨çš„æ—¥æœŸå’Œæ—¶é—´ï¼Œå†å®Œæˆé¢„çº¦ã€‚",
    "No payment is required. Your booking is confirmed once you submit this form.": "æ— éœ€ä»˜æ¬¾ã€‚è¡¨å•æäº¤æˆåŠŸåŽï¼Œé¢„çº¦å³ç¡®è®¤ã€‚",
    "Learner": "å­¦å‘˜",
    "Teacher": "è€å¸ˆ",
    "Date": "æ—¥æœŸ",
    "Time": "æ—¶é—´",
    "Format": "äº¤æµæ–¹å¼",
    "Platform": "ä½¿ç”¨å¹³å°",
    "About You": "å…³äºŽä½ ",
    "Tell us who we'll be talking with.": "å‘Šè¯‰æˆ‘ä»¬ï¼Œè¿™æ¬¡ä¼šå’Œè°èŠå¤©ã€‚",
    "Just enough information to make the conversation feel a little more personal.": "ç®€å•ä»‹ç»ä¸€ä¸‹ï¼Œè®©æˆ‘ä»¬çš„ç¬¬ä¸€æ¬¡äº¤æµæ›´äº²åˆ‡ã€‚",
    "Who is the assessment for?": "è°æ¥å‚åŠ è¯„ä¼°ï¼Ÿ",
    "Preferred name or English name": "å¸Œæœ›ä½¿ç”¨çš„ç§°å‘¼æˆ–è‹±æ–‡å",
    "Optional": "é€‰å¡«",
    "The name you'd like us to use": "ä½ å¸Œæœ›æˆ‘ä»¬æ€Žä¹ˆç§°å‘¼ä½ ï¼Ÿ",
    "Child's age": "å­©å­çš„å¹´é¾„",
    "Parent / guardian name": "å®¶é•¿ï¼ç›‘æŠ¤äººå§“å",
    "Your English": "ä½ çš„è‹±è¯­",
    "Where are you starting from?": "ä½ çŽ°åœ¨çš„è‹±è¯­å­¦ä¹ æƒ…å†µæ˜¯æ€Žæ ·çš„ï¼Ÿ",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "æ— è®ºä»€ä¹ˆæ°´å¹³ï¼Œéƒ½å¯ä»¥å¼€å§‹ã€‚è¿™åªæ˜¯å¸®åŠ©è€å¸ˆäº†è§£ä»Žå“ªé‡ŒèŠèµ·æ›´åˆé€‚ã€‚",
    "How comfortable are you with English?": "ç”¨è‹±è¯­äº¤æµæ—¶ï¼Œä½ æ„Ÿè§‰å¦‚ä½•ï¼Ÿ",
    "What would you like to work on?": "ä½ æƒ³é‡ç‚¹æå‡å“ªæ–¹é¢ï¼Ÿ",
    "Anything you'd like us to know?": "è¿˜æœ‰ä»€ä¹ˆæƒ³è®©æˆ‘ä»¬äº†è§£çš„å—ï¼Ÿ",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "å¯ä»¥èŠèŠä½ çš„ç›®æ ‡ã€ä»¥å¾€çš„å­¦ä¹ ç»åŽ†ï¼Œæˆ–ä»»ä½•å¸Œæœ›è€å¸ˆæå‰äº†è§£çš„äº‹æƒ…ã€‚",
    "Choose how you'd like to talk.": "é€‰æ‹©è®©ä½ è‡ªåœ¨çš„äº¤æµæ–¹å¼ã€‚",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "æ— è®ºé€‰æ‹©å“ªç§æ–¹å¼ï¼Œäº¤æµå†…å®¹éƒ½ç›¸åŒã€‚é€‰æ‹©è®©ä½ æœ€æ”¾æ¾çš„è®¾ç½®å°±å¥½ã€‚",
    "Assessment format": "è¯„ä¼°äº¤æµæ–¹å¼",
    "Audio": "è¯­éŸ³",
    "Camera off": "ä¸å¼€æ‘„åƒå¤´",
    "Video": "è§†é¢‘",
    "Camera optional": "å¯è‡ªè¡Œé€‰æ‹©æ˜¯å¦å¼€å¯æ‘„åƒå¤´",
    "Preferred platform": "å¸Œæœ›ä½¿ç”¨çš„å¹³å°",
    "Choose a Time": "é€‰æ‹©æ—¶é—´",
    "Find a time that works for you.": "é€‰ä¸€ä¸ªé€‚åˆä½ çš„æ—¶é—´ã€‚",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "è¯·å…ˆé€‰æ‹©æ—¶åŒºã€‚æ‰€æœ‰å¯é¢„çº¦çš„æ—¥æœŸå’Œæ—¶é—´éƒ½ä¼šæŒ‰è¯¥æ—¶åŒºæ˜¾ç¤ºã€‚",
    "Choose your teacher": "é€‰æ‹©è€å¸ˆ",
    "Available dates": "å¯é¢„çº¦æ—¥æœŸ",
    "Available times": "å¯é¢„çº¦æ—¶é—´",
    "Duration": "æ—¶é•¿",
    "Child's full name": "å­©å­çš„å§“å",
    "Full name": "å§“å",
    "Parent / guardian email": "å®¶é•¿ï¼ç›‘æŠ¤äººé‚®ç®±",
    "Email": "é‚®ç®±",
    "Booking your assessmentâ€¦": "æ­£åœ¨æäº¤é¢„çº¦â€¦",
    "Book Free Assessment": "é¢„çº¦å…è´¹è‹±è¯­è¯„ä¼°",
    "Please choose a teacher.": "è¯·é€‰æ‹©è€å¸ˆã€‚",
    "Please choose an assessment time.": "è¯·é€‰æ‹©è¯„ä¼°æ—¶é—´ã€‚",
    "Please enter the child's age.": "è¯·è¾“å…¥å­©å­çš„å¹´é¾„ã€‚",
    "That time was just booked. Please choose another available time.": "è¯¥æ—¶æ®µåˆšåˆšè¢«é¢„çº¦äº†ï¼Œè¯·é€‰æ‹©å…¶ä»–å¯ç”¨æ—¶é—´ã€‚",
    "We couldn't book your assessment.": "é¢„çº¦æœªèƒ½å®Œæˆï¼Œè¯·æ£€æŸ¥å¡«å†™å†…å®¹åŽé‡è¯•ã€‚",
    "We couldn't load the available teachers right now.": "æš‚æ—¶æ— æ³•åŠ è½½å¯é¢„çº¦çš„è€å¸ˆï¼Œè¯·ç¨åŽå†è¯•ã€‚",
    "We couldn't load the available assessment times right now.": "æš‚æ—¶æ— æ³•åŠ è½½å¯é¢„çº¦çš„è¯„ä¼°æ—¶é—´ï¼Œè¯·ç¨åŽå†è¯•ã€‚",
    "Audio Â· Camera off": "è¯­éŸ³ Â· ä¸å¼€æ‘„åƒå¤´",
    "Video Â· Camera optional": "è§†é¢‘ Â· æ‘„åƒå¤´å¯é€‰",
    "I'm just getting started.": "æˆ‘åˆšå¼€å§‹å­¦è‹±è¯­ã€‚",
    "I understand some English, but speaking is difficult.": "æˆ‘èƒ½å¬æ‡‚ä¸€äº›è‹±è¯­ï¼Œä½†å¼€å£è¯´æ¯”è¾ƒå›°éš¾ã€‚",
    "I can have simple conversations, but I often hesitate.": "æˆ‘èƒ½è¿›è¡Œç®€å•å¯¹è¯ï¼Œä½†ç»å¸¸çŠ¹è±«ï¼Œä¸çŸ¥é“æ€Žä¹ˆè¯´ã€‚",
    "I can communicate well, but I want to sound more natural.": "æˆ‘èƒ½é¡ºåˆ©äº¤æµï¼Œä½†æƒ³è¡¨è¾¾å¾—æ›´è‡ªç„¶ã€‚",
    "I'm comfortable speaking and want to improve my fluency.": "æˆ‘èƒ½è‡ªå¦‚åœ°è¯´è‹±è¯­ï¼Œå¸Œæœ›è¿›ä¸€æ­¥æé«˜æµåˆ©åº¦ã€‚",
    "Speak more confidently": "æ›´è‡ªä¿¡åœ°å¼€å£",
    "Improve everyday conversation": "æå‡æ—¥å¸¸ä¼šè¯èƒ½åŠ›",
    "English for work": "å·¥ä½œè‹±è¯­",
    "Interview preparation": "é¢è¯•å‡†å¤‡",
    "Travel English": "æ—…è¡Œè‹±è¯­",
    "Overall English": "å…¨é¢æå‡è‹±è¯­",
    "Something else": "å…¶ä»–",
    "Philippines - Manila (GMT+8)": "è²å¾‹å®¾ Â· é©¬å°¼æ‹‰ (GMT+8)",
    "South Korea - Seoul (GMT+9)": "éŸ©å›½ Â· é¦–å°” (GMT+9)",
    "Japan - Tokyo (GMT+9)": "æ—¥æœ¬ Â· ä¸œäº¬ (GMT+9)",
    "China - Beijing (GMT+8)": "ä¸­å›½ Â· åŒ—äº¬ (GMT+8)",
    "Vietnam - Ho Chi Minh City (GMT+7)": "è¶Šå— Â· èƒ¡å¿—æ˜Žå¸‚ (GMT+7)",
    "Malaysia - Kuala Lumpur (GMT+8)": "é©¬æ¥è¥¿äºš Â· å‰éš†å¡ (GMT+8)",
    "Indonesia - Jakarta (GMT+7)": "å°åº¦å°¼è¥¿äºš Â· é›…åŠ è¾¾ (GMT+7)",
    "Indonesia - Makassar / Bali (GMT+8)": "å°åº¦å°¼è¥¿äºš Â· æœ›åŠ é”¡ï¼å·´åŽ˜å²› (GMT+8)",
    "Indonesia - Jayapura (GMT+9)": "å°åº¦å°¼è¥¿äºš Â· æŸ¥äºšæ™®æ‹‰ (GMT+9)",
    "Detected": "å·²è¯†åˆ«",
    "Confirmation email": "å…è´¹è‹±è¯­è¯„ä¼°å·²é¢„çº¦æˆåŠŸã€‚ç¡®è®¤é‚®ä»¶å·²å‘é€è‡³ï¼š",
    "Displayed timezone": "æ—¥æœŸå’Œæ—¶é—´æŒ‰ä»¥ä¸‹æ—¶åŒºæ˜¾ç¤ºï¼š"
  },
  "ja": {
    "Booking Confirmed": "ã”äºˆç´„ãŒç¢ºå®šã—ã¾ã—ãŸ",
    "Your conversation starts here.": "ã“ã“ã‹ã‚‰ã€æœ€åˆã®ä¼šè©±ãŒå§‹ã¾ã‚Šã¾ã™ã€‚",
    "We'll send the meeting details and anything you need before your assessment.": "ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã®å‰ã«ã€æŽ¥ç¶šæ–¹æ³•ã‚„å¿…è¦ãªã”æ¡ˆå†…ã‚’ãŠé€ã‚Šã—ã¾ã™ã€‚",
    "Book a Free Assessment": "ç„¡æ–™ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã®ã”äºˆç´„",
    "Let's start with": "ã¾ãšã¯ã€æ°—è»½ã«",
    "a conversation.": "ãŠè©±ã—ã—ã¦ã¿ã¾ã›ã‚“ã‹ã€‚",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "30åˆ†ã®ãƒªãƒ©ãƒƒã‚¯ã‚¹ã—ãŸä¼šè©±ã‚’é€šã—ã¦ã€ä»Šã®è‹±èªžåŠ›ã‚„ç›®æ¨™ã€ã©ã‚“ãªã‚µãƒãƒ¼ãƒˆãŒåˆã†ã‹ã‚’ä¸€ç·’ã«è¦‹ã¤ã‘ã¾ã™ã€‚",
    "30 minutes": "30åˆ†",
    "No payment": "ãŠæ”¯æ‰•ã„ä¸è¦",
    "No account required": "ã‚¢ã‚«ã‚¦ãƒ³ãƒˆç™»éŒ²ä¸è¦",
    "Myself": "ã”æœ¬äºº",
    "My child": "ãŠå­ã•ã¾",
    "We'll use this email for your booking confirmation and assessment details.": "ã”äºˆç´„ã®ç¢ºèªã‚„ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã®ã”æ¡ˆå†…ã‚’ã€ã“ã¡ã‚‰ã®ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹ã«ãŠé€ã‚Šã—ã¾ã™ã€‚",
    "Choose the closest description": "æœ€ã‚‚è¿‘ã„ã‚‚ã®ã‚’é¸ã‚“ã§ãã ã•ã„",
    "Choose a goal": "ç›®æ¨™ã‚’é¸ã‚“ã§ãã ã•ã„",
    "Loading teachersâ€¦": "è¬›å¸«æƒ…å ±ã‚’èª­ã¿è¾¼ã‚“ã§ã„ã¾ã™â€¦",
    "There are no teachers available for assessment booking right now.": "ç¾åœ¨ã€ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã‚’äºˆç´„ã§ãã‚‹è¬›å¸«ãŒã„ã¾ã›ã‚“ã€‚",
    "Your teacher": "æ‹…å½“è¬›å¸«",
    "Your timezone": "ã‚¿ã‚¤ãƒ ã‚¾ãƒ¼ãƒ³",
    "Detected automatically": "è‡ªå‹•ã§è¨­å®šã—ã¾ã—ãŸ",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "ç«¯æœ«ã®è¨­å®šã‹ã‚‰ã‚¿ã‚¤ãƒ ã‚¾ãƒ¼ãƒ³ã‚’è¨­å®šã—ã¾ã—ãŸã€‚åˆ¥ã®åœ°åŸŸã‹ã‚‰å‚åŠ ã™ã‚‹å ´åˆã¯å¤‰æ›´ã—ã¦ãã ã•ã„ã€‚",
    "Choose a teacher to see available assessment times.": "è¬›å¸«ã‚’é¸ã¶ã¨ã€äºˆç´„ã§ãã‚‹æ—¥æ™‚ãŒè¡¨ç¤ºã•ã‚Œã¾ã™ã€‚",
    "Finding available timesâ€¦": "äºˆç´„ã§ãã‚‹æ™‚é–“ã‚’ç¢ºèªã—ã¦ã„ã¾ã™â€¦",
    "There are no available assessment times in the current booking window.": "ç¾åœ¨ã®äºˆç´„å—ä»˜æœŸé–“ã«ã¯ã€ç©ºã„ã¦ã„ã‚‹æ™‚é–“ãŒã‚ã‚Šã¾ã›ã‚“ã€‚",
    "Your Assessment": "ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯",
    "Ready when you are.": "æº–å‚™ãŒã§ããŸã‚‰ã€ã”äºˆç´„ãã ã•ã„ã€‚",
    "Choose an available date and time above to complete your booking.": "ä¸Šã§ç©ºã„ã¦ã„ã‚‹æ—¥æ™‚ã‚’é¸ã‚“ã§ã‹ã‚‰ã€ã”äºˆç´„ãã ã•ã„ã€‚",
    "No payment is required. Your booking is confirmed once you submit this form.": "ãŠæ”¯æ‰•ã„ã¯ä¸è¦ã§ã™ã€‚ãƒ•ã‚©ãƒ¼ãƒ ã®é€ä¿¡ãŒå®Œäº†ã™ã‚‹ã¨ã€ã”äºˆç´„ãŒç¢ºå®šã—ã¾ã™ã€‚",
    "Learner": "å—è¬›è€…",
    "Teacher": "è¬›å¸«",
    "Date": "æ—¥ä»˜",
    "Time": "æ™‚é–“",
    "Format": "å‚åŠ å½¢å¼",
    "Platform": "åˆ©ç”¨ã‚¢ãƒ—ãƒª",
    "About You": "å—è¬›è€…ã«ã¤ã„ã¦",
    "Tell us who we'll be talking with.": "ãŠè©±ã—ã™ã‚‹æ–¹ã«ã¤ã„ã¦æ•™ãˆã¦ãã ã•ã„ã€‚",
    "Just enough information to make the conversation feel a little more personal.": "ä¼šè©±ã‚’ã‚ˆã‚Šèº«è¿‘ã«æ„Ÿã˜ã¦ã„ãŸã ã‘ã‚‹ã‚ˆã†ã€å°‘ã—ã ã‘æ•™ãˆã¦ãã ã•ã„ã€‚",
    "Who is the assessment for?": "ã©ãªãŸãŒå‚åŠ ã—ã¾ã™ã‹ï¼Ÿ",
    "Preferred name or English name": "å‘¼ã‚“ã§ã»ã—ã„ãŠåå‰ãƒ»è‹±èªžå",
    "Optional": "ä»»æ„",
    "The name you'd like us to use": "å‘¼ã‚“ã§ã»ã—ã„ãŠåå‰ã‚’ã”å…¥åŠ›ãã ã•ã„",
    "Child's age": "ãŠå­ã•ã¾ã®å¹´é½¢",
    "Parent / guardian name": "ä¿è­·è€…ã®ãŠåå‰",
    "Your English": "ä»Šã®è‹±èªžã«ã¤ã„ã¦",
    "Where are you starting from?": "ä»Šã®è‹±èªžã®æ§˜å­ã‚’æ•™ãˆã¦ãã ã•ã„ã€‚",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "ã©ã®ãƒ¬ãƒ™ãƒ«ã‹ã‚‰ã§ã‚‚å¤§ä¸ˆå¤«ã§ã™ã€‚è¬›å¸«ãŒä¼šè©±ã®å§‹ã‚æ–¹ã‚’è€ƒãˆã‚‹ãŸã‚ã®ç›®å®‰ã¨ã—ã¦ãŠèžãã—ã¾ã™ã€‚",
    "How comfortable are you with English?": "è‹±èªžã§è©±ã™ã“ã¨ã«ã€ã©ã®ãã‚‰ã„æ…£ã‚Œã¦ã„ã¾ã™ã‹ï¼Ÿ",
    "What would you like to work on?": "ã©ã‚“ãªã“ã¨ã‚’ç·´ç¿’ã—ãŸã„ã§ã™ã‹ï¼Ÿ",
    "Anything you'd like us to know?": "ã»ã‹ã«ä¼ãˆã¦ãŠããŸã„ã“ã¨ã¯ã‚ã‚Šã¾ã™ã‹ï¼Ÿ",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "ç›®æ¨™ã‚„ã“ã‚Œã¾ã§ã®å­¦ç¿’çµŒé¨“ã€è¬›å¸«ã«çŸ¥ã£ã¦ãŠã„ã¦ã»ã—ã„ã“ã¨ãªã©ã€è‡ªç”±ã«ãŠæ›¸ããã ã•ã„ã€‚",
    "Choose how you'd like to talk.": "è©±ã—ã‚„ã™ã„æ–¹æ³•ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "ã©ã®æ–¹æ³•ã§ã‚‚ä¼šè©±ã®å†…å®¹ã¯åŒã˜ã§ã™ã€‚ã„ã¡ã°ã‚“å®‰å¿ƒã—ã¦å‚åŠ ã§ãã‚‹æ–¹æ³•ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "Assessment format": "å‚åŠ å½¢å¼",
    "Audio": "éŸ³å£°",
    "Camera off": "ã‚«ãƒ¡ãƒ©ã¯ã‚ªãƒ•",
    "Video": "ãƒ“ãƒ‡ã‚ª",
    "Camera optional": "ã‚«ãƒ¡ãƒ©ã®ä½¿ç”¨ã¯ä»»æ„",
    "Preferred platform": "å¸Œæœ›ã™ã‚‹ã‚¢ãƒ—ãƒª",
    "Choose a Time": "æ—¥æ™‚ã‚’é¸ã¶",
    "Find a time that works for you.": "ã”éƒ½åˆã®ã‚ˆã„æ™‚é–“ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "å…ˆã«ã‚¿ã‚¤ãƒ ã‚¾ãƒ¼ãƒ³ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚äºˆç´„ã§ãã‚‹æ—¥æ™‚ã¯ã€ãã®ã‚¿ã‚¤ãƒ ã‚¾ãƒ¼ãƒ³ã§è¡¨ç¤ºã•ã‚Œã¾ã™ã€‚",
    "Choose your teacher": "è¬›å¸«ã‚’é¸ã¶",
    "Available dates": "äºˆç´„ã§ãã‚‹æ—¥ä»˜",
    "Available times": "äºˆç´„ã§ãã‚‹æ™‚é–“",
    "Duration": "æ‰€è¦æ™‚é–“",
    "Child's full name": "ãŠå­ã•ã¾ã®ãŠåå‰",
    "Full name": "ãŠåå‰",
    "Parent / guardian email": "ä¿è­·è€…ã®ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹",
    "Email": "ãƒ¡ãƒ¼ãƒ«ã‚¢ãƒ‰ãƒ¬ã‚¹",
    "Booking your assessmentâ€¦": "äºˆç´„ã‚’é€ä¿¡ã—ã¦ã„ã¾ã™â€¦",
    "Book Free Assessment": "ç„¡æ–™ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã‚’äºˆç´„ã™ã‚‹",
    "Please choose a teacher.": "è¬›å¸«ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "Please choose an assessment time.": "ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã®æ™‚é–“ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "Please enter the child's age.": "ãŠå­ã•ã¾ã®å¹´é½¢ã‚’å…¥åŠ›ã—ã¦ãã ã•ã„ã€‚",
    "That time was just booked. Please choose another available time.": "ãã®æ™‚é–“ã¯ã€ã»ã‹ã®æ–¹ãŒäºˆç´„ã•ã‚Œã¾ã—ãŸã€‚åˆ¥ã®ç©ºã„ã¦ã„ã‚‹æ™‚é–“ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
    "We couldn't book your assessment.": "äºˆç´„ã‚’å®Œäº†ã§ãã¾ã›ã‚“ã§ã—ãŸã€‚å…¥åŠ›å†…å®¹ã‚’ã”ç¢ºèªã®ã†ãˆã€ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
    "We couldn't load the available teachers right now.": "ç¾åœ¨ã€è¬›å¸«æƒ…å ±ã‚’èª­ã¿è¾¼ã‚ã¾ã›ã‚“ã€‚ã—ã°ã‚‰ãã—ã¦ã‹ã‚‰ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
    "We couldn't load the available assessment times right now.": "ç¾åœ¨ã€äºˆç´„ã§ãã‚‹æ™‚é–“ã‚’èª­ã¿è¾¼ã‚ã¾ã›ã‚“ã€‚ã—ã°ã‚‰ãã—ã¦ã‹ã‚‰ã‚‚ã†ä¸€åº¦ãŠè©¦ã—ãã ã•ã„ã€‚",
    "Audio Â· Camera off": "éŸ³å£° Â· ã‚«ãƒ¡ãƒ©ã¯ã‚ªãƒ•",
    "Video Â· Camera optional": "ãƒ“ãƒ‡ã‚ª Â· ã‚«ãƒ¡ãƒ©ã®ä½¿ç”¨ã¯ä»»æ„",
    "I'm just getting started.": "è‹±èªžã‚’å­¦ã³å§‹ã‚ãŸã°ã‹ã‚Šã§ã™ã€‚",
    "I understand some English, but speaking is difficult.": "è‹±èªžã¯å°‘ã—ã‚ã‹ã‚Šã¾ã™ãŒã€è©±ã™ã®ã¯é›£ã—ã„ã§ã™ã€‚",
    "I can have simple conversations, but I often hesitate.": "ç°¡å˜ãªä¼šè©±ã¯ã§ãã¾ã™ãŒã€è¨€è‘‰ã«è©°ã¾ã‚‹ã“ã¨ãŒã‚ˆãã‚ã‚Šã¾ã™ã€‚",
    "I can communicate well, but I want to sound more natural.": "æ„æ€ã¯ä¼ãˆã‚‰ã‚Œã¾ã™ãŒã€ã‚‚ã£ã¨è‡ªç„¶ã«è©±ã—ãŸã„ã§ã™ã€‚",
    "I'm comfortable speaking and want to improve my fluency.": "è‹±èªžã§è©±ã™ã“ã¨ã«ã¯æ…£ã‚Œã¦ã„ã¦ã€ã•ã‚‰ã«æµæš¢ã«è©±ã›ã‚‹ã‚ˆã†ã«ãªã‚ŠãŸã„ã§ã™ã€‚",
    "Speak more confidently": "ã‚‚ã£ã¨è‡ªä¿¡ã‚’æŒã£ã¦è©±ã™",
    "Improve everyday conversation": "æ—¥å¸¸ä¼šè©±ã‚’ä¸Šé”ã•ã›ã‚‹",
    "English for work": "ä»•äº‹ã§ä½¿ã†è‹±èªž",
    "Interview preparation": "é¢æŽ¥ã®æº–å‚™",
    "Travel English": "æ—…è¡Œã§ä½¿ã†è‹±èªž",
    "Overall English": "è‹±èªžåŠ›å…¨ä½“ã‚’ä¼¸ã°ã™",
    "Something else": "ãã®ä»–",
    "Philippines - Manila (GMT+8)": "ãƒ•ã‚£ãƒªãƒ”ãƒ³ Â· ãƒžãƒ‹ãƒ© (GMT+8)",
    "South Korea - Seoul (GMT+9)": "éŸ“å›½ Â· ã‚½ã‚¦ãƒ« (GMT+9)",
    "Japan - Tokyo (GMT+9)": "æ—¥æœ¬ Â· æ±äº¬ (GMT+9)",
    "China - Beijing (GMT+8)": "ä¸­å›½ Â· åŒ—äº¬ (GMT+8)",
    "Vietnam - Ho Chi Minh City (GMT+7)": "ãƒ™ãƒˆãƒŠãƒ  Â· ãƒ›ãƒ¼ãƒãƒŸãƒ³ (GMT+7)",
    "Malaysia - Kuala Lumpur (GMT+8)": "ãƒžãƒ¬ãƒ¼ã‚·ã‚¢ Â· ã‚¯ã‚¢ãƒ©ãƒ«ãƒ³ãƒ—ãƒ¼ãƒ« (GMT+8)",
    "Indonesia - Jakarta (GMT+7)": "ã‚¤ãƒ³ãƒ‰ãƒã‚·ã‚¢ Â· ã‚¸ãƒ£ã‚«ãƒ«ã‚¿ (GMT+7)",
    "Indonesia - Makassar / Bali (GMT+8)": "ã‚¤ãƒ³ãƒ‰ãƒã‚·ã‚¢ Â· ãƒžã‚«ãƒƒã‚µãƒ«ï¼ãƒãƒª (GMT+8)",
    "Indonesia - Jayapura (GMT+9)": "ã‚¤ãƒ³ãƒ‰ãƒã‚·ã‚¢ Â· ã‚¸ãƒ£ãƒ¤ãƒ—ãƒ© (GMT+9)",
    "Detected": "è‡ªå‹•æ¤œå‡º",
    "Confirmation email": "ç„¡æ–™ãƒ¬ãƒ™ãƒ«ãƒã‚§ãƒƒã‚¯ã®äºˆç´„ãŒå®Œäº†ã—ã¾ã—ãŸã€‚ç¢ºèªãƒ¡ãƒ¼ãƒ«ã®é€ä¿¡å…ˆï¼š",
    "Displayed timezone": "æ—¥æ™‚ã¯æ¬¡ã®ã‚¿ã‚¤ãƒ ã‚¾ãƒ¼ãƒ³ã§è¡¨ç¤ºã—ã¦ã„ã¾ã™ï¼š"
  }
};

const ENGLISH_LABELS: Record<string, string> = {
  "Confirmation email": "Your Free Assessment has been booked. We've also sent a confirmation to:",
  "Displayed timezone": "Dates and times are shown in:"
};

function translate(locale: Locale, text: string): string {
  if (locale === "en") return ENGLISH_LABELS[text] ?? text;
  return ASSESSMENT_TRANSLATIONS[locale][text] ?? ENGLISH_LABELS[text] ?? text;
}

export default function AssessmentBookingForm({
  locale,
}: AssessmentBookingFormProps) {
  const searchParams = useSearchParams();

  const requestedTeacherSlug =
    searchParams.get("teacher")?.trim() || "";

  const t = useMemo(() => (text: string) => translate(locale, text), [locale]);
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
            t("We couldn't load the available teachers right now.")
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
  }, [t]);

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
            t("We couldn't load the available assessment times right now.")
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
  }, [selectedTeacherSlug, t]);

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

  useEffect(() => {
    if (!requestedTeacherSlug || teachers.length === 0) {
      return;
    }

    const requestedTeacher = teachers.find(
      (teacher) => teacher.slug === requestedTeacherSlug
    );

    if (!requestedTeacher) {
      return;
    }

    setSelectedTeacherSlug((current) =>
      current === requestedTeacher.slug
        ? current
        : requestedTeacher.slug
    );
  }, [requestedTeacherSlug, teachers]);

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
        label: `${t("Detected")} Â· ${detectedTimezone}`,
      },
      ...COMMON_TIMEZONES,
    ];
  }, [detectedTimezone, t]);

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
        t("Please choose a teacher.")
      );
      return;
    }

    if (!selectedSlot) {
      setSubmitError(
        t("Please choose an assessment time.")
      );
      return;
    }

    if (
      learnerType === "child" &&
      !learnerAge
    ) {
      setSubmitError(
        t("Please enter the child's age.")
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
            locale,
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
            t("That time was just booked. Please choose another available time.")
          );
        }

        throw new Error(
          t("We couldn't book your assessment.")
        );
      }

      setBooking(data.booking);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error &&
        error.message === t("That time was just booked. Please choose another available time.")
          ? error.message
          : t("We couldn't book your assessment.")
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
      <div lang={locale} className="min-h-screen bg-[#F4F1EB]">
        <section className="px-5 pb-24 pt-36 sm:px-8 sm:pb-32 sm:pt-44">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-[30px] border border-[#DDD8CF] bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(101,130,105,0.08)] sm:px-12 sm:py-14">
              <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#E3ECE4] text-2xl text-[#658269]">
                âœ“
              </div>

              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#6F8F72]">{t("Booking Confirmed")}</p>

              <h1 className="font-serif text-4xl leading-tight text-[#2D342F] sm:text-5xl">{t("Your conversation starts here.")}</h1>

              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6B6B66] sm:text-base">
                {t("Confirmation email")}{" "}
                <span className="font-medium text-[#3D4740]">
                  {email}
                </span>
              </p>

              <div className="mt-10 rounded-[22px] border border-[#E3DFD7] bg-[#FAF8F5] p-6 text-left sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <SummaryItem
                    label={t("Learner")}
                    value={
                      booking.preferredName ||
                      booking.learnerName
                    }
                  />

                  <SummaryItem
                    label={t("Teacher")}
                    value={booking.teacher.name}
                  />

                  <SummaryItem
                    label={t("Date")}
                    value={formatLongDate(
                      localBookingDate,
                      locale
                    )}
                  />

                  <SummaryItem
                    label={t("Time")}
                    value={formatTime(
                      localBookingTime,
                      locale
                    )}
                  />

                  <SummaryItem
                    label={t("Format")}
                    value={formatLabel(booking.format, locale)}
                  />

                  <SummaryItem
                    label={t("Platform")}
                    value={platformLabel(
                      booking.platform
                    )}
                  />
                </div>

                <div className="mt-6 border-t border-[#DEDAD2] pt-5">
                  <p className="text-sm leading-6 text-[#77756F]">
                    {t("Displayed timezone")}{" "}
                    <span className="font-medium text-[#4C554F]">
                      {timezoneLabel(booking.visitorTimezone, locale)}
                    </span>
              </p>
                </div>
              </div>

              <p className="mx-auto mt-8 max-w-xl text-sm leading-6 text-[#77756F]">{t("We'll send the meeting details and anything you need before your assessment.")}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <form
      lang={locale}
      onSubmit={handleSubmit}
      className="bg-[#F4F1EB]"
    >
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#6F8F72] px-5 pb-20 pt-36 text-center sm:px-8 sm:pb-24 sm:pt-44">
        <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/[0.035]" />

        <div className="pointer-events-none absolute left-1/2 top-[-170px] h-[360px] w-[360px] -translate-x-1/2 rounded-full border border-white/[0.03]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#E3E9E2]">{t("Book a Free Assessment")}</p>

          <h1 className="font-serif text-[46px] leading-[1.04] tracking-[-0.02em] text-[#FAF8F5] sm:text-6xl lg:text-[68px]">{t("Let's start with")}<br className="hidden sm:block" />{" "}
            {t("a conversation.")}
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-[#EEF1EC] sm:text-[17px] sm:leading-8">{t("A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.")}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#F1F4EF] sm:text-sm">
            <span>{t("30 minutes")}</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#C9D8CA]"
            />

            <span>{t("No payment")}</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#C9D8CA]"
            />

            <span>{t("No account required")}</span>
          </div>
        </div>

        {/* Subtle transition instead of the large curve */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#F4F1EB]" />
      </section>

      {/* FORM */}
      <div className="mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8 sm:pb-36 sm:pt-12">
        <FormSection
          number="01"
          eyebrow={t("About You")}
          title={t("Tell us who we'll be talking with.")}
          description={t("Just enough information to make the conversation feel a little more personal.")}
        >
          <FieldGroup label={t("Who is the assessment for?")}>
            <div className="grid grid-cols-2 gap-3">
              <ChoiceButton
                active={learnerType === "self"}
                onClick={() =>
                  setLearnerType("self")
                }
              >{t("Myself")}</ChoiceButton>

              <ChoiceButton
                active={learnerType === "child"}
                onClick={() =>
                  setLearnerType("child")
                }
              >{t("My child")}</ChoiceButton>
            </div>
          </FieldGroup>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label={
                learnerType === "child"
                  ? t("Child's full name")
                  : t("Full name")
              }
              value={learnerName}
              onChange={setLearnerName}
              required
              autoComplete="name"
            />

            <InputField
              label={t("Preferred name or English name")}
              hint={t("Optional")}
              value={preferredName}
              onChange={setPreferredName}
              placeholder={t("The name you'd like us to use")}
            />
          </div>

          {learnerType === "child" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label={t("Child's age")}
                value={learnerAge}
                onChange={setLearnerAge}
                required
                type="number"
                min="1"
                max="120"
              />

              <InputField
                label={t("Parent / guardian name")}
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
                ? t("Parent / guardian email")
                : t("Email")
            }
            value={email}
            onChange={setEmail}
            required
            type="email"
            autoComplete="email"
          />

          <p className="-mt-2 text-xs leading-5 text-[#8A8A83]">{t("We'll use this email for your booking confirmation and assessment details.")}</p>
        </FormSection>

        <FormSection
          number="02"
          eyebrow={t("Your English")}
          title={t("Where are you starting from?")}
          description={t("There is no right level to begin. This simply helps your teacher understand where the conversation can start.")}
        >
          <SelectField
            label={t("How comfortable are you with English?")}
            value={englishLevel}
            onChange={setEnglishLevel}
            required
          >
            <option value="">{t("Choose the closest description")}</option>

            {LEVEL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {t(option.label)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t("What would you like to work on?")}
            value={learningGoal}
            onChange={setLearningGoal}
            required
          >
            <option value="">{t("Choose a goal")}</option>

            {GOAL_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {t(option.label)}
              </option>
            ))}
          </SelectField>

          <TextAreaField
            label={t("Anything you'd like us to know?")}
            hint={t("Optional")}
            value={notes}
            onChange={setNotes}
            placeholder={t("You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.")}
          />
        </FormSection>

        <FormSection
          number="03"
          eyebrow={t("Your Assessment")}
          title={t("Choose how you'd like to talk.")}
          description={t("The conversation stays the same. Choose the setup that feels most comfortable for you.")}
        >
          <FieldGroup label={t("Assessment format")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton
                active={
                  assessmentFormat === "audio"
                }
                onClick={() =>
                  setAssessmentFormat("audio")
                }
                title={t("Audio")}
                description={t("Camera off")}
              />

              <ChoiceButton
                active={
                  assessmentFormat === "video"
                }
                onClick={() =>
                  setAssessmentFormat("video")
                }
                title={t("Video")}
                description={t("Camera optional")}
              />
            </div>
          </FieldGroup>

          <FieldGroup label={t("Preferred platform")}>
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
          eyebrow={t("Choose a Time")}
          title={t("Find a time that works for you.")}
          description={t("Choose your timezone first. All available dates and times will be shown in that timezone.")}
          last
        >
          {teachersLoading ? (
            <SoftMessage>{t("Loading teachers\u2026")}</SoftMessage>
          ) : teacherError ? (
            <ErrorMessage>
              {teacherError}
            </ErrorMessage>
          ) : teachers.length === 0 ? (
            <SoftMessage>{t("There are no teachers available for assessment booking right now.")}</SoftMessage>
          ) : (
            <>
              {teachers.length > 1 && (
                <FieldGroup label={t("Choose your teacher")}>
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8A83]">{t("Your teacher")}</p>

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
                  <p className="text-sm font-medium text-[#414A44]">{t("Your timezone")}</p>

                  {visitorTimezone ===
                    detectedTimezone && (
                    <span className="text-xs text-[#6F8F72]">{t("Detected automatically")}</span>
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
                        {t(timezone.label)}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2.5 text-xs leading-5 text-[#8A8A83]">{t("We detected your timezone from your device. Change it if you're booking for a different location.")}</p>
              </div>

              <div className="flex items-start gap-3 rounded-[16px] bg-[#E8ECE7] px-4 py-3.5">
                <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F8F72]" />

                <p className="text-sm leading-6 text-[#626B65]">
                  {t("Displayed timezone")}{" "}
                  <span className="font-medium text-[#3E4A42]">
                    {timezoneLabel(visitorTimezone, locale)}
                  </span>
              </p>
              </div>

              {!selectedTeacherSlug ? (
                <SoftMessage>{t("Choose a teacher to see available assessment times.")}</SoftMessage>
              ) : availabilityLoading ? (
                <SoftMessage>{t("Finding available times\u2026")}</SoftMessage>
              ) : availabilityError ? (
                <ErrorMessage>
                  {availabilityError}
                </ErrorMessage>
              ) : localSlots.length === 0 ? (
                <SoftMessage>{t("There are no available assessment times in the current booking window.")}</SoftMessage>
              ) : (
                <>
                  <FieldGroup label={t("Available dates")}>
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

                  <FieldGroup label={t("Available times")}>
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

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F8F72]">{t("Your Assessment")}</p>
            </div>

            <h2 className="mt-3 font-serif text-3xl text-[#2D342F] sm:text-[34px]">{t("Ready when you are.")}</h2>
          </div>

          <div className="p-6 sm:p-9">
            {selectedSlot &&
            selectedTeacher ? (
              <>
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <SummaryItem
                    label={t("Teacher")}
                    value={selectedTeacher.name}
                  />

                  <SummaryItem
                    label={t("Duration")}
                    value={t("30 minutes")}
                  />

                  <SummaryItem
                    label={t("Date")}
                    value={formatLongDate(
                      selectedSlot.localDate,
                      locale
                    )}
                  />

                  <SummaryItem
                    label={t("Time")}
                    value={formatTime(
                      selectedSlot.localTime,
                      locale
                    )}
                  />

                  <SummaryItem
                    label={t("Format")}
                    value={formatLabel(assessmentFormat, locale)}
                  />

                  <SummaryItem
                    label={t("Platform")}
                    value={platformLabel(
                      preferredPlatform
                    )}
                  />
                </div>

                <p className="mt-7 border-t border-[#E6E2DB] pt-5 text-sm leading-6 text-[#77756F]">
                  {t("Displayed timezone")}{" "}
                  <span className="font-medium text-[#4C554F]">
                    {timezoneLabel(visitorTimezone, locale)}
                  </span>
              </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#77756F]">{t("Choose an available date and time above to complete your booking.")}</p>
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
                ? "Booking your assessmentâ€¦"
                : t("Book Free Assessment")}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#8A8A83]">{t("No payment is required. Your booking is confirmed once you submit this form.")}</p>
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


