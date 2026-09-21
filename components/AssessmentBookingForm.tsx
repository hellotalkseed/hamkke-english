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
    return translate(locale, "Audio · Camera off");
  }

  if (value === "video") {
    return translate(locale, "Video · Camera optional");
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
    "Booking Confirmed": "예약이 확정되었어요",
    "Your conversation starts here.": "우리의 첫 대화가 여기서 시작돼요.",
    "We'll send the meeting details and anything you need before your assessment.": "레벨 상담 전에 접속 방법과 필요한 안내를 보내드릴게요.",
    "Book a Free Assessment": "무료 레벨 상담 예약",
    "Let's start with": "먼저 편안하게",
    "a conversation.": "대화부터 시작해 볼까요?",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "편안한 30분 대화를 통해 현재 영어 실력과 목표를 알아보고, 어떤 도움이 잘 맞을지 함께 살펴봐요.",
    "30 minutes": "30분",
    "No payment": "결제 없이 무료로",
    "No account required": "회원가입 없이",
    "Myself": "본인",
    "My child": "자녀",
    "We'll use this email for your booking confirmation and assessment details.": "예약 확인과 레벨 상담 안내를 이 이메일로 보내드릴게요.",
    "Choose the closest description": "가장 가까운 설명을 골라 주세요",
    "Choose a goal": "목표를 선택해 주세요",
    "Loading teachers…": "선생님 정보를 불러오는 중이에요…",
    "There are no teachers available for assessment booking right now.": "현재 레벨 상담을 예약할 수 있는 선생님이 없어요.",
    "Your teacher": "함께할 선생님",
    "Your timezone": "시간대",
    "Detected automatically": "자동으로 감지했어요",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "기기의 설정을 바탕으로 시간대를 확인했어요. 다른 지역에서 참여할 예정이라면 변경해 주세요.",
    "Choose a teacher to see available assessment times.": "선생님을 선택하면 예약 가능한 시간이 표시돼요.",
    "Finding available times…": "예약 가능한 시간을 확인하고 있어요…",
    "There are no available assessment times in the current booking window.": "현재 예약 가능한 기간에 비어 있는 상담 시간이 없어요.",
    "Your Assessment": "레벨 상담",
    "Ready when you are.": "준비되셨다면 예약해 주세요.",
    "Choose an available date and time above to complete your booking.": "위에서 가능한 날짜와 시간을 선택한 후 예약해 주세요.",
    "No payment is required. Your booking is confirmed once you submit this form.": "결제는 필요하지 않아요. 양식 제출이 완료되면 예약이 확정돼요.",
    "Learner": "학습자",
    "Teacher": "선생님",
    "Date": "날짜",
    "Time": "시간",
    "Format": "진행 방식",
    "Platform": "사용 앱",
    "About You": "학습자 소개",
    "Tell us who we'll be talking with.": "누구와 이야기하게 될까요?",
    "Just enough information to make the conversation feel a little more personal.": "더 편안하게 대화를 시작할 수 있도록 간단히 알려 주세요.",
    "Who is the assessment for?": "누가 상담에 참여하나요?",
    "Preferred name or English name": "불리고 싶은 이름 또는 영어 이름",
    "Optional": "선택 사항",
    "The name you'd like us to use": "어떤 이름으로 불러드릴까요?",
    "Child's age": "자녀 나이",
    "Parent / guardian name": "학부모 / 보호자 이름",
    "Your English": "지금의 영어",
    "Where are you starting from?": "지금 영어가 얼마나 편하게 느껴지나요?",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "어떤 수준이든 괜찮아요. 선생님이 대화를 어디서 시작하면 좋을지 알아보는 질문이에요.",
    "How comfortable are you with English?": "영어로 대화하는 것이 얼마나 편한가요?",
    "What would you like to work on?": "어떤 부분을 함께 연습하고 싶나요?",
    "Anything you'd like us to know?": "미리 알려주고 싶은 것이 있나요?",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "목표나 지금까지의 학습 경험, 선생님께 미리 전하고 싶은 내용을 편하게 적어 주세요.",
    "Choose how you'd like to talk.": "편안한 대화 방식을 골라 주세요.",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "어떤 방식을 선택해도 대화 내용은 같아요. 가장 편하게 참여할 수 있는 방법을 골라 주세요.",
    "Assessment format": "상담 진행 방식",
    "Audio": "음성 통화",
    "Camera off": "카메라 끄고 참여",
    "Video": "영상 통화",
    "Camera optional": "카메라 사용은 자유롭게",
    "Preferred platform": "선호하는 앱",
    "Choose a Time": "시간 선택",
    "Find a time that works for you.": "편한 시간을 골라 주세요.",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "먼저 시간대를 선택해 주세요. 예약 가능한 날짜와 시간이 해당 시간대 기준으로 표시돼요.",
    "Choose your teacher": "선생님 선택",
    "Available dates": "예약 가능한 날짜",
    "Available times": "예약 가능한 시간",
    "Duration": "소요 시간",
    "Child's full name": "자녀 성명",
    "Full name": "성명",
    "Parent / guardian email": "학부모 / 보호자 이메일",
    "Email": "이메일",
    "Booking your assessment…": "예약을 진행하고 있어요…",
    "Book Free Assessment": "무료 레벨 상담 예약하기",
    "Please choose a teacher.": "선생님을 선택해 주세요.",
    "Please choose an assessment time.": "상담 시간을 선택해 주세요.",
    "Please enter the child's age.": "자녀의 나이를 입력해 주세요.",
    "That time was just booked. Please choose another available time.": "방금 다른 분이 예약한 시간이에요. 다른 시간을 선택해 주세요.",
    "We couldn't book your assessment.": "예약을 완료하지 못했어요. 입력 내용을 확인한 후 다시 시도해 주세요.",
    "We couldn't load the available teachers right now.": "지금은 선생님 정보를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.",
    "We couldn't load the available assessment times right now.": "지금은 예약 가능한 시간을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.",
    "Audio · Camera off": "음성 통화 · 카메라 끄기",
    "Video · Camera optional": "영상 통화 · 카메라 사용 자유",
    "I'm just getting started.": "이제 막 시작했어요.",
    "I understand some English, but speaking is difficult.": "영어를 조금 이해하지만 말하기는 어려워요.",
    "I can have simple conversations, but I often hesitate.": "간단한 대화는 할 수 있지만 말할 때 자주 망설여요.",
    "I can communicate well, but I want to sound more natural.": "의사소통은 잘 되지만 더 자연스럽게 말하고 싶어요.",
    "I'm comfortable speaking and want to improve my fluency.": "말하기가 편하고, 더 유창하게 말하고 싶어요.",
    "Speak more confidently": "더 자신 있게 말하기",
    "Improve everyday conversation": "일상 대화 연습",
    "English for work": "업무 영어",
    "Interview preparation": "면접 준비",
    "Travel English": "여행 영어",
    "Overall English": "전반적인 영어 실력",
    "Something else": "그 외",
    "Philippines — Manila (GMT+8)": "필리핀 · 마닐라 (GMT+8)",
    "South Korea — Seoul (GMT+9)": "대한민국 · 서울 (GMT+9)",
    "Japan — Tokyo (GMT+9)": "일본 · 도쿄 (GMT+9)",
    "China — Beijing (GMT+8)": "중국 · 베이징 (GMT+8)",
    "Vietnam — Ho Chi Minh City (GMT+7)": "베트남 · 호찌민 (GMT+7)",
    "Malaysia — Kuala Lumpur (GMT+8)": "말레이시아 · 쿠알라룸푸르 (GMT+8)",
    "Indonesia — Jakarta (GMT+7)": "인도네시아 · 자카르타 (GMT+7)",
    "Indonesia — Makassar / Bali (GMT+8)": "인도네시아 · 마카사르 / 발리 (GMT+8)",
    "Indonesia — Jayapura (GMT+9)": "인도네시아 · 자야푸라 (GMT+9)",
    "Detected": "자동 감지",
    "Confirmation email": "무료 레벨 상담이 예약되었어요. 예약 확인 이메일을 보낸 주소:",
    "Displayed timezone": "날짜와 시간은 다음 시간대 기준으로 표시돼요:"
  },
  "zh": {
    "Booking Confirmed": "预约已确认",
    "Your conversation starts here.": "从这里，开始我们的第一次对话。",
    "We'll send the meeting details and anything you need before your assessment.": "我们会在评估前发送会议信息和相关准备事项。",
    "Book a Free Assessment": "预约免费英语评估",
    "Let's start with": "让我们先",
    "a conversation.": "聊一聊吧。",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "通过30分钟的轻松交流，了解你的英语水平、学习目标，以及适合你的学习支持。",
    "30 minutes": "30分钟",
    "No payment": "无需付费",
    "No account required": "无需注册账号",
    "Myself": "我自己",
    "My child": "我的孩子",
    "We'll use this email for your booking confirmation and assessment details.": "我们会通过此邮箱发送预约确认和评估详情。",
    "Choose the closest description": "请选择最符合的描述",
    "Choose a goal": "请选择学习目标",
    "Loading teachers…": "正在加载老师信息…",
    "There are no teachers available for assessment booking right now.": "目前暂无可预约评估的老师。",
    "Your teacher": "你的老师",
    "Your timezone": "你的时区",
    "Detected automatically": "已自动识别",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "我们已根据你的设备识别时区。如果你将在其他地区参加，请更改时区。",
    "Choose a teacher to see available assessment times.": "选择老师后，即可查看可预约的评估时间。",
    "Finding available times…": "正在查找可预约时间…",
    "There are no available assessment times in the current booking window.": "当前开放预约的日期内暂无可用时段。",
    "Your Assessment": "你的英语评估",
    "Ready when you are.": "准备好了，就预约吧。",
    "Choose an available date and time above to complete your booking.": "请先在上方选择可用的日期和时间，再完成预约。",
    "No payment is required. Your booking is confirmed once you submit this form.": "无需付款。表单提交成功后，预约即确认。",
    "Learner": "学员",
    "Teacher": "老师",
    "Date": "日期",
    "Time": "时间",
    "Format": "交流方式",
    "Platform": "使用平台",
    "About You": "关于你",
    "Tell us who we'll be talking with.": "告诉我们，这次会和谁聊天。",
    "Just enough information to make the conversation feel a little more personal.": "简单介绍一下，让我们的第一次交流更亲切。",
    "Who is the assessment for?": "谁来参加评估？",
    "Preferred name or English name": "希望使用的称呼或英文名",
    "Optional": "选填",
    "The name you'd like us to use": "你希望我们怎么称呼你？",
    "Child's age": "孩子的年龄",
    "Parent / guardian name": "家长／监护人姓名",
    "Your English": "你的英语",
    "Where are you starting from?": "你现在的英语学习情况是怎样的？",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "无论什么水平，都可以开始。这只是帮助老师了解从哪里聊起更合适。",
    "How comfortable are you with English?": "用英语交流时，你感觉如何？",
    "What would you like to work on?": "你想重点提升哪方面？",
    "Anything you'd like us to know?": "还有什么想让我们了解的吗？",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "可以聊聊你的目标、以往的学习经历，或任何希望老师提前了解的事情。",
    "Choose how you'd like to talk.": "选择让你自在的交流方式。",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "无论选择哪种方式，交流内容都相同。选择让你最放松的设置就好。",
    "Assessment format": "评估交流方式",
    "Audio": "语音",
    "Camera off": "不开摄像头",
    "Video": "视频",
    "Camera optional": "可自行选择是否开启摄像头",
    "Preferred platform": "希望使用的平台",
    "Choose a Time": "选择时间",
    "Find a time that works for you.": "选一个适合你的时间。",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "请先选择时区。所有可预约的日期和时间都会按该时区显示。",
    "Choose your teacher": "选择老师",
    "Available dates": "可预约日期",
    "Available times": "可预约时间",
    "Duration": "时长",
    "Child's full name": "孩子的姓名",
    "Full name": "姓名",
    "Parent / guardian email": "家长／监护人邮箱",
    "Email": "邮箱",
    "Booking your assessment…": "正在提交预约…",
    "Book Free Assessment": "预约免费英语评估",
    "Please choose a teacher.": "请选择老师。",
    "Please choose an assessment time.": "请选择评估时间。",
    "Please enter the child's age.": "请输入孩子的年龄。",
    "That time was just booked. Please choose another available time.": "该时段刚刚被预约了，请选择其他可用时间。",
    "We couldn't book your assessment.": "预约未能完成，请检查填写内容后重试。",
    "We couldn't load the available teachers right now.": "暂时无法加载可预约的老师，请稍后再试。",
    "We couldn't load the available assessment times right now.": "暂时无法加载可预约的评估时间，请稍后再试。",
    "Audio · Camera off": "语音 · 不开摄像头",
    "Video · Camera optional": "视频 · 摄像头可选",
    "I'm just getting started.": "我刚开始学英语。",
    "I understand some English, but speaking is difficult.": "我能听懂一些英语，但开口说比较困难。",
    "I can have simple conversations, but I often hesitate.": "我能进行简单对话，但经常犹豫，不知道怎么说。",
    "I can communicate well, but I want to sound more natural.": "我能顺利交流，但想表达得更自然。",
    "I'm comfortable speaking and want to improve my fluency.": "我能自如地说英语，希望进一步提高流利度。",
    "Speak more confidently": "更自信地开口",
    "Improve everyday conversation": "提升日常会话能力",
    "English for work": "工作英语",
    "Interview preparation": "面试准备",
    "Travel English": "旅行英语",
    "Overall English": "全面提升英语",
    "Something else": "其他",
    "Philippines — Manila (GMT+8)": "菲律宾 · 马尼拉 (GMT+8)",
    "South Korea — Seoul (GMT+9)": "韩国 · 首尔 (GMT+9)",
    "Japan — Tokyo (GMT+9)": "日本 · 东京 (GMT+9)",
    "China — Beijing (GMT+8)": "中国 · 北京 (GMT+8)",
    "Vietnam — Ho Chi Minh City (GMT+7)": "越南 · 胡志明市 (GMT+7)",
    "Malaysia — Kuala Lumpur (GMT+8)": "马来西亚 · 吉隆坡 (GMT+8)",
    "Indonesia — Jakarta (GMT+7)": "印度尼西亚 · 雅加达 (GMT+7)",
    "Indonesia — Makassar / Bali (GMT+8)": "印度尼西亚 · 望加锡／巴厘岛 (GMT+8)",
    "Indonesia — Jayapura (GMT+9)": "印度尼西亚 · 查亚普拉 (GMT+9)",
    "Detected": "已识别",
    "Confirmation email": "免费英语评估已预约成功。确认邮件已发送至：",
    "Displayed timezone": "日期和时间按以下时区显示："
  },
  "ja": {
    "Booking Confirmed": "ご予約が確定しました",
    "Your conversation starts here.": "ここから、最初の会話が始まります。",
    "We'll send the meeting details and anything you need before your assessment.": "レベルチェックの前に、接続方法や必要なご案内をお送りします。",
    "Book a Free Assessment": "無料レベルチェックのご予約",
    "Let's start with": "まずは、気軽に",
    "a conversation.": "お話ししてみませんか。",
    "A relaxed 30-minute conversation to understand your English, your goals, and what kind of support may work best for you.": "30分のリラックスした会話を通して、今の英語力や目標、どんなサポートが合うかを一緒に見つけます。",
    "30 minutes": "30分",
    "No payment": "お支払い不要",
    "No account required": "アカウント登録不要",
    "Myself": "ご本人",
    "My child": "お子さま",
    "We'll use this email for your booking confirmation and assessment details.": "ご予約の確認やレベルチェックのご案内を、こちらのメールアドレスにお送りします。",
    "Choose the closest description": "最も近いものを選んでください",
    "Choose a goal": "目標を選んでください",
    "Loading teachers…": "講師情報を読み込んでいます…",
    "There are no teachers available for assessment booking right now.": "現在、レベルチェックを予約できる講師がいません。",
    "Your teacher": "担当講師",
    "Your timezone": "タイムゾーン",
    "Detected automatically": "自動で設定しました",
    "We detected your timezone from your device. Change it if you're booking for a different location.": "端末の設定からタイムゾーンを設定しました。別の地域から参加する場合は変更してください。",
    "Choose a teacher to see available assessment times.": "講師を選ぶと、予約できる日時が表示されます。",
    "Finding available times…": "予約できる時間を確認しています…",
    "There are no available assessment times in the current booking window.": "現在の予約受付期間には、空いている時間がありません。",
    "Your Assessment": "レベルチェック",
    "Ready when you are.": "準備ができたら、ご予約ください。",
    "Choose an available date and time above to complete your booking.": "上で空いている日時を選んでから、ご予約ください。",
    "No payment is required. Your booking is confirmed once you submit this form.": "お支払いは不要です。フォームの送信が完了すると、ご予約が確定します。",
    "Learner": "受講者",
    "Teacher": "講師",
    "Date": "日付",
    "Time": "時間",
    "Format": "参加形式",
    "Platform": "利用アプリ",
    "About You": "受講者について",
    "Tell us who we'll be talking with.": "お話しする方について教えてください。",
    "Just enough information to make the conversation feel a little more personal.": "会話をより身近に感じていただけるよう、少しだけ教えてください。",
    "Who is the assessment for?": "どなたが参加しますか？",
    "Preferred name or English name": "呼んでほしいお名前・英語名",
    "Optional": "任意",
    "The name you'd like us to use": "呼んでほしいお名前をご入力ください",
    "Child's age": "お子さまの年齢",
    "Parent / guardian name": "保護者のお名前",
    "Your English": "今の英語について",
    "Where are you starting from?": "今の英語の様子を教えてください。",
    "There is no right level to begin. This simply helps your teacher understand where the conversation can start.": "どのレベルからでも大丈夫です。講師が会話の始め方を考えるための目安としてお聞きします。",
    "How comfortable are you with English?": "英語で話すことに、どのくらい慣れていますか？",
    "What would you like to work on?": "どんなことを練習したいですか？",
    "Anything you'd like us to know?": "ほかに伝えておきたいことはありますか？",
    "You can share a little more about your goals, past learning experience, or anything you'd like your teacher to know.": "目標やこれまでの学習経験、講師に知っておいてほしいことなど、自由にお書きください。",
    "Choose how you'd like to talk.": "話しやすい方法を選んでください。",
    "The conversation stays the same. Choose the setup that feels most comfortable for you.": "どの方法でも会話の内容は同じです。いちばん安心して参加できる方法を選んでください。",
    "Assessment format": "参加形式",
    "Audio": "音声",
    "Camera off": "カメラはオフ",
    "Video": "ビデオ",
    "Camera optional": "カメラの使用は任意",
    "Preferred platform": "希望するアプリ",
    "Choose a Time": "日時を選ぶ",
    "Find a time that works for you.": "ご都合のよい時間を選んでください。",
    "Choose your timezone first. All available dates and times will be shown in that timezone.": "先にタイムゾーンを選んでください。予約できる日時は、そのタイムゾーンで表示されます。",
    "Choose your teacher": "講師を選ぶ",
    "Available dates": "予約できる日付",
    "Available times": "予約できる時間",
    "Duration": "所要時間",
    "Child's full name": "お子さまのお名前",
    "Full name": "お名前",
    "Parent / guardian email": "保護者のメールアドレス",
    "Email": "メールアドレス",
    "Booking your assessment…": "予約を送信しています…",
    "Book Free Assessment": "無料レベルチェックを予約する",
    "Please choose a teacher.": "講師を選んでください。",
    "Please choose an assessment time.": "レベルチェックの時間を選んでください。",
    "Please enter the child's age.": "お子さまの年齢を入力してください。",
    "That time was just booked. Please choose another available time.": "その時間は、ほかの方が予約されました。別の空いている時間を選んでください。",
    "We couldn't book your assessment.": "予約を完了できませんでした。入力内容をご確認のうえ、もう一度お試しください。",
    "We couldn't load the available teachers right now.": "現在、講師情報を読み込めません。しばらくしてからもう一度お試しください。",
    "We couldn't load the available assessment times right now.": "現在、予約できる時間を読み込めません。しばらくしてからもう一度お試しください。",
    "Audio · Camera off": "音声 · カメラはオフ",
    "Video · Camera optional": "ビデオ · カメラの使用は任意",
    "I'm just getting started.": "英語を学び始めたばかりです。",
    "I understand some English, but speaking is difficult.": "英語は少しわかりますが、話すのは難しいです。",
    "I can have simple conversations, but I often hesitate.": "簡単な会話はできますが、言葉に詰まることがよくあります。",
    "I can communicate well, but I want to sound more natural.": "意思は伝えられますが、もっと自然に話したいです。",
    "I'm comfortable speaking and want to improve my fluency.": "英語で話すことには慣れていて、さらに流暢に話せるようになりたいです。",
    "Speak more confidently": "もっと自信を持って話す",
    "Improve everyday conversation": "日常会話を上達させる",
    "English for work": "仕事で使う英語",
    "Interview preparation": "面接の準備",
    "Travel English": "旅行で使う英語",
    "Overall English": "英語力全体を伸ばす",
    "Something else": "その他",
    "Philippines — Manila (GMT+8)": "フィリピン · マニラ (GMT+8)",
    "South Korea — Seoul (GMT+9)": "韓国 · ソウル (GMT+9)",
    "Japan — Tokyo (GMT+9)": "日本 · 東京 (GMT+9)",
    "China — Beijing (GMT+8)": "中国 · 北京 (GMT+8)",
    "Vietnam — Ho Chi Minh City (GMT+7)": "ベトナム · ホーチミン (GMT+7)",
    "Malaysia — Kuala Lumpur (GMT+8)": "マレーシア · クアラルンプール (GMT+8)",
    "Indonesia — Jakarta (GMT+7)": "インドネシア · ジャカルタ (GMT+7)",
    "Indonesia — Makassar / Bali (GMT+8)": "インドネシア · マカッサル／バリ (GMT+8)",
    "Indonesia — Jayapura (GMT+9)": "インドネシア · ジャヤプラ (GMT+9)",
    "Detected": "自動検出",
    "Confirmation email": "無料レベルチェックの予約が完了しました。確認メールの送信先：",
    "Displayed timezone": "日時は次のタイムゾーンで表示しています："
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
        label: `${t("Detected")} · ${detectedTimezone}`,
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
                ✓
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
                ? "Booking your assessment…"
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