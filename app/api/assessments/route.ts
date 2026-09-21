import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const SOURCE_TIMEZONE = "Asia/Manila";
const ASSESSMENT_DURATION_MINUTES = 30;

const VALID_LEARNER_TYPES = [
  "self",
  "child",
] as const;

const VALID_FORMATS = [
  "audio",
  "video",
] as const;

const VALID_PLATFORMS = [
  "microsoft_teams",
  "zoom",
  "google_meet",
  "voov",
  "kakaotalk",
] as const;

type LearnerType =
  (typeof VALID_LEARNER_TYPES)[number];

type AssessmentFormat =
  (typeof VALID_FORMATS)[number];

type PreferredPlatform =
  (typeof VALID_PLATFORMS)[number];

type AssessmentRequestBody = {
  locale?: unknown;
  teacherSlug?: unknown;

  learnerType?: unknown;
  learnerName?: unknown;
  preferredName?: unknown;
  learnerAge?: unknown;

  contactName?: unknown;
  email?: unknown;

  contactMethod?: unknown;
  contactId?: unknown;

  englishLevel?: unknown;
  learningGoal?: unknown;
  notes?: unknown;

  assessmentFormat?: unknown;
  preferredPlatform?: unknown;

  timezone?: unknown;

  assessmentDate?: unknown;
  assessmentTime?: unknown;
};

type AvailabilitySlot = {
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
  start_date?: string;
  end_date?: string;
  source_start_date?: string;
  source_end_date?: string;
  interval_minutes?: number;
  slots?: AvailabilitySlot[];
  error?: string;
};


type ConfirmationCopy = {
  subject: string;
  title: string;
  greeting: string;
  intro: string;
  childIntro: string;
  assessment: string;
  learner: string;
  teacher: string;
  duration: string;
  minutes: string;
  format: string;
  platform: string;
  audio: string;
  video: string;
  next: string;
  closing: string;
  sentTo: string;
};

const CONFIRMATION_COPY: Record<Locale, ConfirmationCopy> = {
  "en": {
    "subject": "Your Hamkke Free Assessment is confirmed",
    "title": "Your Free Assessment is confirmed.",
    "greeting": "Hi {name},",
    "intro": "Thank you for booking a Free Assessment with Hamkke. We look forward to getting to know you and learning more about what you'd like to do with your English.",
    "childIntro": "Thank you for booking a Free Assessment for your child with Hamkke. We look forward to getting to know your child and learning how we can support their English journey.",
    "assessment": "Your Assessment",
    "learner": "Learner",
    "teacher": "Teacher",
    "duration": "Duration",
    "minutes": "{minutes} minutes",
    "format": "Format",
    "platform": "Platform",
    "audio": "Audio · Camera off",
    "video": "Video · Camera optional",
    "next": "We'll send the meeting details and anything else you need before your assessment.",
    "closing": "See you soon,",
    "sentTo": "This confirmation was sent to {email}."
  },
  "ko": {
    "subject": "Hamkke 무료 레벨 상담 예약이 확정되었어요",
    "title": "무료 레벨 상담 예약이 확정되었어요.",
    "greeting": "{name}님, 안녕하세요.",
    "intro": "Hamkke 무료 레벨 상담을 예약해 주셔서 감사해요. 만나서 이야기를 나누며, 영어로 어떤 것들을 해보고 싶으신지 알아갈 시간이 기대돼요.",
    "childIntro": "자녀의 Hamkke 무료 레벨 상담을 예약해 주셔서 감사해요. 자녀와 편안하게 이야기를 나누며, 영어를 배우는 과정에서 어떤 도움이 필요할지 함께 알아볼게요.",
    "assessment": "레벨 상담 안내",
    "learner": "학습자",
    "teacher": "선생님",
    "duration": "소요 시간",
    "minutes": "{minutes}분",
    "format": "진행 방식",
    "platform": "사용 앱",
    "audio": "음성 통화 · 카메라 끄기",
    "video": "영상 통화 · 카메라 사용 자유",
    "next": "상담 전에 접속 방법과 필요한 안내를 보내드릴게요.",
    "closing": "곧 만나요.",
    "sentTo": "이 예약 확인 메일은 {email} 주소로 발송되었어요."
  },
  "zh": {
    "subject": "Hamkke 免费英语评估预约已确认",
    "title": "你的免费英语评估预约已确认。",
    "greeting": "{name}，你好！",
    "intro": "感谢你预约 Hamkke 的免费英语评估。期待认识你，听听你希望用英语做些什么。",
    "childIntro": "感谢你为孩子预约 Hamkke 的免费英语评估。期待认识孩子，一起了解我们能如何支持孩子的英语学习。",
    "assessment": "评估详情",
    "learner": "学员",
    "teacher": "老师",
    "duration": "时长",
    "minutes": "{minutes}分钟",
    "format": "交流方式",
    "platform": "使用平台",
    "audio": "语音 · 不开摄像头",
    "video": "视频 · 摄像头可选",
    "next": "我们会在评估前发送会议信息和相关准备事项。",
    "closing": "期待与你见面！",
    "sentTo": "此确认邮件已发送至 {email}。"
  },
  "ja": {
    "subject": "Hamkke 無料レベルチェックのご予約が確定しました",
    "title": "無料レベルチェックのご予約が確定しました。",
    "greeting": "{name}様",
    "intro": "Hamkkeの無料レベルチェックをご予約いただき、ありがとうございます。お話ししながら、英語でどんなことをしてみたいか伺えるのを楽しみにしています。",
    "childIntro": "お子さまのHamkke無料レベルチェックをご予約いただき、ありがとうございます。お子さまとお話ししながら、英語の学びをどのようにサポートできるか、一緒に考えていきます。",
    "assessment": "レベルチェックのご案内",
    "learner": "受講者",
    "teacher": "講師",
    "duration": "所要時間",
    "minutes": "{minutes}分",
    "format": "参加形式",
    "platform": "利用アプリ",
    "audio": "音声 · カメラはオフ",
    "video": "ビデオ · カメラの使用は任意",
    "next": "レベルチェックの前に、接続方法や必要なご案内をお送りします。",
    "closing": "お話しできるのを楽しみにしています。",
    "sentTo": "この予約確認メールは {email} にお送りしました。"
  }
};

const EMAIL_TIMEZONES: Record<Exclude<Locale, "en">, Record<string, string>> = {
  "ko": {
    "Asia/Manila": "필리핀 · 마닐라 (GMT+8)",
    "Asia/Seoul": "대한민국 · 서울 (GMT+9)",
    "Asia/Tokyo": "일본 · 도쿄 (GMT+9)",
    "Asia/Shanghai": "중국 · 베이징 (GMT+8)",
    "Asia/Ho_Chi_Minh": "베트남 · 호찌민 (GMT+7)",
    "Asia/Kuala_Lumpur": "말레이시아 · 쿠알라룸푸르 (GMT+8)",
    "Asia/Jakarta": "인도네시아 · 자카르타 (GMT+7)",
    "Asia/Makassar": "인도네시아 · 마카사르 / 발리 (GMT+8)",
    "Asia/Jayapura": "인도네시아 · 자야푸라 (GMT+9)"
  },
  "zh": {
    "Asia/Manila": "菲律宾 · 马尼拉 (GMT+8)",
    "Asia/Seoul": "韩国 · 首尔 (GMT+9)",
    "Asia/Tokyo": "日本 · 东京 (GMT+9)",
    "Asia/Shanghai": "中国 · 北京 (GMT+8)",
    "Asia/Ho_Chi_Minh": "越南 · 胡志明市 (GMT+7)",
    "Asia/Kuala_Lumpur": "马来西亚 · 吉隆坡 (GMT+8)",
    "Asia/Jakarta": "印度尼西亚 · 雅加达 (GMT+7)",
    "Asia/Makassar": "印度尼西亚 · 望加锡／巴厘岛 (GMT+8)",
    "Asia/Jayapura": "印度尼西亚 · 查亚普拉 (GMT+9)"
  },
  "ja": {
    "Asia/Manila": "フィリピン · マニラ (GMT+8)",
    "Asia/Seoul": "韓国 · ソウル (GMT+9)",
    "Asia/Tokyo": "日本 · 東京 (GMT+9)",
    "Asia/Shanghai": "中国 · 北京 (GMT+8)",
    "Asia/Ho_Chi_Minh": "ベトナム · ホーチミン (GMT+7)",
    "Asia/Kuala_Lumpur": "マレーシア · クアラルンプール (GMT+8)",
    "Asia/Jakarta": "インドネシア · ジャカルタ (GMT+7)",
    "Asia/Makassar": "インドネシア · マカッサル／バリ (GMT+8)",
    "Asia/Jayapura": "インドネシア · ジャヤプラ (GMT+9)"
  }
};

function emailLocale(value: unknown): Locale {
  const candidate = cleanString(value);
  return isValidLocale(candidate) ? candidate : "en";
}

function fillEmailText(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}

function cleanString(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function optionalString(
  value: unknown
) {
  const cleaned =
    cleanString(value);

  return cleaned || null;
}

function isValidEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidDate(
  value: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
}

function normalizeTime(
  value: string
) {
  const match =
    value.match(
      /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/
    );

  if (!match) {
    return null;
  }

  return `${match[1]}:${match[2]}`;
}

function isValidTimezone(
  value: string
) {
  try {
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: value,
      }
    ).format();

    return true;
  } catch {
    return false;
  }
}

function isValidLearnerType(
  value: string
): value is LearnerType {
  return (
    VALID_LEARNER_TYPES as readonly string[]
  ).includes(value);
}

function isValidFormat(
  value: string
): value is AssessmentFormat {
  return (
    VALID_FORMATS as readonly string[]
  ).includes(value);
}

function isValidPlatform(
  value: string
): value is PreferredPlatform {
  return (
    VALID_PLATFORMS as readonly string[]
  ).includes(value);
}

function escapeHtml(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function formatPlatform(
  platform: PreferredPlatform
) {
  switch (platform) {
    case "microsoft_teams":
      return "Microsoft Teams";

    case "zoom":
      return "Zoom";

    case "google_meet":
      return "Google Meet";

    case "voov":
      return "VooV Meeting";

    case "kakaotalk":
      return "KakaoTalk";
  }
}

function formatAssessmentFormat(
  format: AssessmentFormat
) {
  return format === "audio"
    ? "Audio · Camera off"
    : "Video · Camera optional";
}

function getTimezoneDisplayName(
  timezone: string,
  locale: Locale = "en"
) {
  const labels: Record<string, string> = {
    "Asia/Manila": "Philippines — Manila (GMT+8)",
    "Asia/Seoul": "South Korea — Seoul (GMT+9)",
    "Asia/Tokyo": "Japan — Tokyo (GMT+9)",
    "Asia/Shanghai": "China — Beijing (GMT+8)",
    "Asia/Ho_Chi_Minh": "Vietnam — Ho Chi Minh City (GMT+7)",
    "Asia/Kuala_Lumpur": "Malaysia — Kuala Lumpur (GMT+8)",
    "Asia/Jakarta": "Indonesia — Jakarta (GMT+7)",
    "Asia/Makassar": "Indonesia — Makassar / Bali (GMT+8)",
    "Asia/Jayapura": "Indonesia — Jayapura (GMT+9)",
  };

  return (locale === "en" ? labels[timezone] : EMAIL_TIMEZONES[locale][timezone]) || timezone;
}

function getTimeZoneParts(
  date: Date,
  timeZone: string
) {
  const formatter =
    new Intl.DateTimeFormat(
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

  const parts =
    formatter.formatToParts(date);

  const values =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ]
      )
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
  const [year, month, day] =
    date.split("-").map(Number);

  const [hour, minute] =
    time.slice(0, 5).split(":").map(Number);

  let guess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0
  );

  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    const actual =
      getTimeZoneParts(
        new Date(guess),
        timeZone
      );

    const actualAsUtc =
      Date.UTC(
        actual.year,
        actual.month - 1,
        actual.day,
        actual.hour,
        actual.minute,
        actual.second
      );

    const desiredAsUtc =
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        0
      );

    guess +=
      desiredAsUtc -
      actualAsUtc;
  }

  return new Date(guess);
}

function getVisitorBookingDisplay(
  sourceDate: string,
  sourceTime: string,
  visitorTimezone: string,
  locale: Locale = "en"
) {
  const instant =
    zonedDateTimeToUtc(
      sourceDate,
      sourceTime,
      SOURCE_TIMEZONE
    );

  return {
    dateLabel:
      new Intl.DateTimeFormat(
        locale,
        {
          timeZone: visitorTimezone,
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      ).format(instant),

    timeLabel:
      new Intl.DateTimeFormat(
        locale,
        {
          timeZone: visitorTimezone,
          hour: "numeric",
          minute: "2-digit",
        }
      ).format(instant),

    timezoneLabel:
      getTimezoneDisplayName(
        visitorTimezone,
        locale
      ),
  };
}

function getPhtNowParts() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          SOURCE_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(
      new Date()
    );

  const values =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ]
      )
    );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function isPastSourceSlot(
  date: string,
  time: string
) {
  const now =
    getPhtNowParts();

  if (date < now.date) {
    return true;
  }

  if (
    date === now.date &&
    time <= now.time
  ) {
    return true;
  }

  return false;
}

function isUniqueViolation(
  error: {
    code?: string | null;
    message?: string | null;
  } | null
) {
  return (
    error?.code === "23505"
  );
}

export async function POST(
  request: Request
) {
  try {
    let body: AssessmentRequestBody;

    try {
      body =
        (await request.json()) as AssessmentRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const locale = emailLocale(body.locale);
    const emailCopy = CONFIRMATION_COPY[locale];

    const teacherSlug =
      cleanString(
        body.teacherSlug
      );

    const learnerType =
      cleanString(
        body.learnerType
      );

    const learnerName =
      cleanString(
        body.learnerName
      );

    const preferredName =
      optionalString(
        body.preferredName
      );

    const contactName =
      cleanString(
        body.contactName
      );

    const email =
      cleanString(
        body.email
      ).toLowerCase();

    const contactMethod =
      optionalString(
        body.contactMethod
      );

    const contactId =
      optionalString(
        body.contactId
      );

    const englishLevel =
      cleanString(
        body.englishLevel
      );

    const learningGoal =
      cleanString(
        body.learningGoal
      );

    const notes =
      optionalString(
        body.notes
      );

    const assessmentFormat =
      cleanString(
        body.assessmentFormat
      );

    const preferredPlatform =
      cleanString(
        body.preferredPlatform
      );

    const timezone =
      cleanString(
        body.timezone
      );

    const assessmentDate =
      cleanString(
        body.assessmentDate
      );

    const rawAssessmentTime =
      cleanString(
        body.assessmentTime
      );

    /*
     * -------------------------------------------------------
     * Required fields
     * -------------------------------------------------------
     */

    if (
      !teacherSlug ||
      !learnerType ||
      !learnerName ||
      !contactName ||
      !email ||
      !englishLevel ||
      !learningGoal ||
      !assessmentFormat ||
      !preferredPlatform ||
      !timezone ||
      !assessmentDate ||
      !rawAssessmentTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please complete all required fields.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Enumerated values
     * -------------------------------------------------------
     */

    if (
      !isValidLearnerType(
        learnerType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid learner type.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidFormat(
        assessmentFormat
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid assessment format.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidPlatform(
        preferredPlatform
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid preferred platform.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Email
     * -------------------------------------------------------
     */

    if (
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Timezone
     * -------------------------------------------------------
     */

    if (
      !isValidTimezone(
        timezone
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid timezone.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Date + time
     * -------------------------------------------------------
     */

    if (
      !isValidDate(
        assessmentDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid assessment date.",
        },
        {
          status: 400,
        }
      );
    }

    const assessmentTime =
      normalizeTime(
        rawAssessmentTime
      );

    if (!assessmentTime) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid assessment time.",
        },
        {
          status: 400,
        }
      );
    }

    const [
      hourString,
      minuteString,
    ] =
      assessmentTime.split(
        ":"
      );

    const minute =
      Number(
        minuteString
      );

    if (
      minute !== 0 &&
      minute !== 30
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Assessment times must use a 30-minute scheduling interval.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(
        Number(hourString)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid assessment time.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isPastSourceSlot(
        assessmentDate,
        assessmentTime
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please choose a future assessment time.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Child age
     * -------------------------------------------------------
     */

    let learnerAge:
      | number
      | null = null;

    if (
      learnerType ===
      "child"
    ) {
      if (
        body.learnerAge ===
          undefined ||
        body.learnerAge ===
          null ||
        body.learnerAge ===
          ""
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please enter the child's age.",
          },
          {
            status: 400,
          }
        );
      }

      const parsedAge =
        Number(
          body.learnerAge
        );

      if (
        !Number.isInteger(
          parsedAge
        ) ||
        parsedAge < 1 ||
        parsedAge > 120
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please enter a valid learner age.",
          },
          {
            status: 400,
          }
        );
      }

      learnerAge =
        parsedAge;
    }

    /*
     * -------------------------------------------------------
     * Length limits
     * -------------------------------------------------------
     */

    if (
      teacherSlug.length >
        120 ||
      learnerName.length >
        200 ||
      (preferredName &&
        preferredName.length >
          200) ||
      contactName.length >
        200 ||
      email.length > 320 ||
      englishLevel.length >
        500 ||
      learningGoal.length >
        500 ||
      (contactMethod &&
        contactMethod.length >
          100) ||
      (contactId &&
        contactId.length >
          200) ||
      (notes &&
        notes.length >
          3000)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more fields are too long.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      createAdminClient();

    /*
     * -------------------------------------------------------
     * Resolve teacher
     * -------------------------------------------------------
     */

    const {
      data: publicTeacher,
      error: teacherError,
    } = await admin
      .from(
        "teacher_public_profiles"
      )
      .select(`
        teacher_id,
        slug,
        is_published,
        profiles!teacher_public_profiles_teacher_id_fkey!inner (
          full_name,
          role,
          status
        )
      `)
      .eq(
        "slug",
        teacherSlug
      )
      .eq(
        "is_published",
        true
      )
      .eq(
        "profiles.role",
        "teacher"
      )
      .eq(
        "profiles.status",
        "active"
      )
      .maybeSingle();

    if (teacherError) {
      console.error(
        "Assessment teacher lookup error:",
        teacherError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify the selected teacher.",
        },
        {
          status: 500,
        }
      );
    }

    if (!publicTeacher) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The selected teacher is not available for public booking.",
        },
        {
          status: 404,
        }
      );
    }

    const profile =
      Array.isArray(
        publicTeacher.profiles
      )
        ? publicTeacher
            .profiles[0]
        : publicTeacher.profiles;

    const teacherName =
      profile?.full_name ||
      "Hamkke Teacher";

    /*
     * -------------------------------------------------------
     * Revalidate availability
     * -------------------------------------------------------
     */

    const requestUrl =
      new URL(
        request.url
      );

    const availabilityUrl =
      new URL(
        `/api/teachers/${encodeURIComponent(
          teacherSlug
        )}/availability`,
        requestUrl.origin
      );

    availabilityUrl.searchParams.set(
      "start_date",
      assessmentDate
    );

    let availabilityResponse:
      Response;

    try {
      availabilityResponse =
        await fetch(
          availabilityUrl,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );
    } catch (error) {
      console.error(
        "Assessment availability request error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify this assessment time right now.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !availabilityResponse.ok
    ) {
      console.error(
        "Assessment availability response error:",
        availabilityResponse.status
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify this assessment time right now.",
        },
        {
          status: 500,
        }
      );
    }

    const availability =
      (await availabilityResponse.json()) as AvailabilityResponse;

    if (
      availability.source_timezone !==
      SOURCE_TIMEZONE
    ) {
      console.error(
        "Unexpected assessment availability timezone:",
        availability.source_timezone
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify this assessment time right now.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      availability.interval_minutes !==
      ASSESSMENT_DURATION_MINUTES
    ) {
      console.error(
        "Unexpected assessment availability interval:",
        availability.interval_minutes
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify this assessment time right now.",
        },
        {
          status: 500,
        }
      );
    }

    const requestedSlot =
      availability.slots?.find(
        (slot) =>
          slot.date ===
            assessmentDate &&
          normalizeTime(
            slot.time
          ) ===
            assessmentTime
      );

    if (
      !requestedSlot ||
      requestedSlot.status !==
        "available"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "That assessment time is no longer available. Please choose another time.",
          code:
            "SLOT_UNAVAILABLE",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Create booking
     * -------------------------------------------------------
     */

    const {
      data: booking,
      error: bookingError,
    } = await admin
      .from(
        "assessment_bookings"
      )
      .insert({
        teacher_id:
          publicTeacher.teacher_id,

        learner_type:
          learnerType,

        learner_name:
          learnerName,

        preferred_name:
          preferredName,

        learner_age:
          learnerAge,

        contact_name:
          contactName,

        email,

        contact_method:
          contactMethod,

        contact_id:
          contactId,

        english_level:
          englishLevel,

        learning_goal:
          learningGoal,

        notes,

        assessment_format:
          assessmentFormat,

        preferred_platform:
          preferredPlatform,

        timezone,

        assessment_date:
          assessmentDate,

        assessment_time:
          assessmentTime,

        status:
          "confirmed",
      })
      .select(`
        id,
        preferred_name,
        assessment_date,
        assessment_time,
        assessment_format,
        preferred_platform,
        timezone,
        status,
        created_at
      `)
      .single();

    if (bookingError) {
      if (
        isUniqueViolation(
          bookingError
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "That assessment time was just booked. Please choose another time.",
            code:
              "SLOT_UNAVAILABLE",
          },
          {
            status: 409,
          }
        );
      }

      console.error(
        "Assessment booking insert error:",
        bookingError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to book the assessment.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * Email
     * -------------------------------------------------------
     */

    const platformLabel =
      formatPlatform(
        preferredPlatform
      );

    const formatLabel =
      formatAssessmentFormat(
        assessmentFormat
      );

    const visitorBookingDisplay =
      getVisitorBookingDisplay(
        assessmentDate,
        assessmentTime,
        timezone,
        locale
      );

    const safeVisitorDate =
      escapeHtml(
        visitorBookingDisplay.dateLabel
      );

    const safeVisitorTime =
      escapeHtml(
        visitorBookingDisplay.timeLabel
      );

    const safeTimezoneLabel =
      escapeHtml(
        visitorBookingDisplay.timezoneLabel
      );

    const safeTeacherName =
      escapeHtml(
        teacherName
      );

    const safeLearnerName =
      escapeHtml(
        learnerName
      );

    const safePreferredName =
      escapeHtml(
        preferredName
      );

    const safeContactName =
      escapeHtml(
        contactName
      );

    const safeEmail =
      escapeHtml(email);

    const safeLevel =
      escapeHtml(
        englishLevel
      );

    const safeGoal =
      escapeHtml(
        learningGoal
      );

    const safeNotes =
      escapeHtml(notes);

    const safeContactMethod =
      escapeHtml(
        contactMethod
      );

    const safeContactId =
      escapeHtml(
        contactId
      );

    const safeTimezone =
      escapeHtml(
        timezone
      );

    const greetingName =
      learnerType === "self"
        ? (
            safePreferredName ||
            safeLearnerName
          )
        : safeContactName;

    const internalEmail =
      resend.emails.send({
        from:
          "Hamkke <hello@hamkkeenglish.com>",

        to:
          "hamkke.english@gmail.com",

        replyTo: email,

        subject:
          `New Free Assessment Booking — ${
            preferredName ||
            learnerName
          }`,

        html: `
          <h2>
            New Free Assessment Booking
          </h2>

          <p>
            A new Free Assessment has been confirmed.
          </p>

          <hr />

          <h3>Assessment</h3>

          <p>
            <strong>Teacher:</strong>
            ${safeTeacherName}
          </p>

          <p>
            <strong>Date:</strong>
            ${escapeHtml(
              assessmentDate
            )}
          </p>

          <p>
            <strong>Time:</strong>
            ${escapeHtml(
              assessmentTime
            )}
            (${SOURCE_TIMEZONE})
          </p>

          <p>
            <strong>Visitor timezone:</strong>
            ${safeTimezone}
          </p>

          <p>
            <strong>Duration:</strong>
            ${ASSESSMENT_DURATION_MINUTES} minutes
          </p>

          <p>
            <strong>Format:</strong>
            ${escapeHtml(
              formatLabel
            )}
          </p>

          <p>
            <strong>Preferred platform:</strong>
            ${escapeHtml(
              platformLabel
            )}
          </p>

          <hr />

          <h3>Learner</h3>

          <p>
            <strong>Assessment for:</strong>
            ${
              learnerType ===
              "child"
                ? "My child"
                : "Myself"
            }
          </p>

          <p>
            <strong>Full name:</strong>
            ${safeLearnerName}
          </p>

          <p>
            <strong>Preferred / English name:</strong>
            ${
              safePreferredName ||
              "Not provided"
            }
          </p>

          ${
            learnerType ===
              "child"
              ? `
                <p>
                  <strong>Age:</strong>
                  ${learnerAge}
                </p>
              `
              : ""
          }

          <hr />

          <h3>Contact</h3>

          <p>
            <strong>${
              learnerType ===
              "child"
                ? "Parent / guardian"
                : "Contact name"
            }:</strong>
            ${safeContactName}
          </p>

          <p>
            <strong>Email:</strong>
            ${safeEmail}
          </p>

          ${
            contactMethod
              ? `
                <p>
                  <strong>Preferred contact:</strong>
                  ${safeContactMethod}
                </p>
              `
              : ""
          }

          ${
            contactId
              ? `
                <p>
                  <strong>Contact ID:</strong>
                  ${safeContactId}
                </p>
              `
              : ""
          }

          <hr />

          <h3>English</h3>

          <p>
            <strong>English comfort:</strong>
            ${safeLevel}
          </p>

          <p>
            <strong>Learning goal:</strong>
            ${safeGoal}
          </p>

          <p>
            <strong>Additional note:</strong>
          </p>

          <p>
            ${
              safeNotes ||
              "No additional note provided."
            }
          </p>

          <hr />

          <p>
            <strong>Booking ID:</strong>
            ${escapeHtml(
              booking.id
            )}
          </p>
        `,
      });

    const learnerEmail =
      resend.emails.send({
        from:
          "Hamkke <hello@hamkkeenglish.com>",

        to: email,

        replyTo:
          "hamkke.english@gmail.com",

        subject:
          emailCopy.subject,

        html: `
          <div lang="${locale}" style="margin:0;padding:0;background:#f4f1eb;font-family:Arial,Helvetica,sans-serif;color:#3d4740;">
            <div style="max-width:620px;margin:0 auto;padding:40px 20px;">
              <div style="overflow:hidden;border:1px solid #ded9d0;border-radius:24px;background:#ffffff;">
                <div style="background:#6f8f72;padding:34px 34px 30px;text-align:center;">
                  <div style="margin-bottom:12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#e3e9e2;">
                    Hamkke │ 함께
                  </div>
                  <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:400;color:#faf8f5;">
                    ${escapeHtml(emailCopy.title)}
                  </h1>
                  <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#eef1ec;">
                    From Small Talk to Big Ideas.
                  </p>
                </div>

                <div style="padding:34px;">
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4c554f;">
                    ${fillEmailText(emailCopy.greeting, { name: greetingName })}
                  </p>

                  <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#626b65;">
                    ${escapeHtml(learnerType === "child" ? emailCopy.childIntro : emailCopy.intro)}
                  </p>

                  <div style="margin:0 0 28px;padding:24px;border:1px solid #e3dfd7;border-radius:18px;background:#faf8f5;">
                    <div style="margin-bottom:18px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#6f8f72;">
                      ${escapeHtml(emailCopy.assessment)}
                    </div>

                    <div style="margin-bottom:6px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:#2d342f;">
                      ${safeVisitorDate} · ${safeVisitorTime}
                    </div>

                    <div style="margin-bottom:22px;font-size:13px;line-height:1.6;color:#77756f;">
                      ${safeTimezoneLabel}
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:9px 0;border-top:1px solid #e6e2db;font-size:13px;color:#8a8a83;">${escapeHtml(emailCopy.learner)}</td>
                        <td align="right" style="padding:9px 0;border-top:1px solid #e6e2db;font-size:14px;font-weight:600;color:#3d4740;">
                          ${safePreferredName || safeLearnerName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-top:1px solid #e6e2db;font-size:13px;color:#8a8a83;">${escapeHtml(emailCopy.teacher)}</td>
                        <td align="right" style="padding:9px 0;border-top:1px solid #e6e2db;font-size:14px;font-weight:600;color:#3d4740;">
                          ${safeTeacherName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-top:1px solid #e6e2db;font-size:13px;color:#8a8a83;">${escapeHtml(emailCopy.duration)}</td>
                        <td align="right" style="padding:9px 0;border-top:1px solid #e6e2db;font-size:14px;font-weight:600;color:#3d4740;">
                          ${fillEmailText(emailCopy.minutes, { minutes: String(ASSESSMENT_DURATION_MINUTES) })}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-top:1px solid #e6e2db;font-size:13px;color:#8a8a83;">${escapeHtml(emailCopy.format)}</td>
                        <td align="right" style="padding:9px 0;border-top:1px solid #e6e2db;font-size:14px;font-weight:600;color:#3d4740;">
                          ${escapeHtml(emailCopy[assessmentFormat])}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-top:1px solid #e6e2db;font-size:13px;color:#8a8a83;">${escapeHtml(emailCopy.platform)}</td>
                        <td align="right" style="padding:9px 0;border-top:1px solid #e6e2db;font-size:14px;font-weight:600;color:#3d4740;">
                          ${escapeHtml(platformLabel)}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <p style="margin:0 0 22px;font-size:14px;line-height:1.7;color:#626b65;">
                    ${escapeHtml(emailCopy.next)}
                  </p>

                  <p style="margin:0;font-size:14px;line-height:1.7;color:#4c554f;">
  ${escapeHtml(emailCopy.closing)}<br />
  <strong>Hamkke │ 함께</strong><br />
  <span style="font-size:12px;font-style:italic;color:#8a8a83;">
    From Small Talk to Big Ideas.
  </span>
</p>
                </div>
              </div>

              <p style="margin:18px 0 0;text-align:center;font-size:11px;line-height:1.6;color:#96958f;">
                ${fillEmailText(emailCopy.sentTo, { email: safeEmail })}
              </p>
            </div>
          </div>
        `,
      });

    const emailResults =
      await Promise.allSettled([
        internalEmail,
        learnerEmail,
      ]);

    for (
      const result of
      emailResults
    ) {
      if (
        result.status ===
        "rejected"
      ) {
        console.error(
          "Assessment confirmation email error:",
          result.reason
        );
      }
    }

    /*
     * -------------------------------------------------------
     * Success
     * -------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        booking: {
          id:
            booking.id,

          teacher: {
            slug:
              publicTeacher.slug,

            name:
              teacherName,
          },

          learnerName,

          preferredName:
            booking.preferred_name,

          date:
            booking.assessment_date,

          time:
            normalizeTime(
              booking.assessment_time
            ) ||
            assessmentTime,

          sourceTimezone:
            SOURCE_TIMEZONE,

          visitorTimezone:
            booking.timezone,

          durationMinutes:
            ASSESSMENT_DURATION_MINUTES,

          format:
            booking.assessment_format,

          platform:
            booking.preferred_platform,

          status:
            booking.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Assessment booking POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while booking the assessment.",
      },
      {
        status: 500,
      }
    );
  }
}