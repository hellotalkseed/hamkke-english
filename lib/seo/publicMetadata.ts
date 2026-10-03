import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type Locale } from "@/lib/i18n";

export const siteUrl = "https://hamkkeenglish.com";
const content = {
  "en": {
    "home": {
      "title": "One-to-One Online English Lessons | Hamkke",
      "description": "Build confidence in English through one-to-one online lessons with Hamkke. Explore our teachers, lesson packages, and conversation-focused approach."
    },
    "about": {
      "title": "About Hamkke | Hamkke",
      "description": "Get to know Hamkke and our approach to meaningful English learning through conversation, personal guidance, and steady practice."
    },
    "how-it-works": {
      "title": "How Our English Lessons Work | Hamkke",
      "description": "Learn how to get started with Hamkke, from your English assessment to choosing lessons and learning one-to-one with a teacher."
    },
    "lessons": {
      "title": "English Lessons and Packages | Hamkke",
      "description": "Explore Hamkke’s online English lessons and packages. Find learning options that suit your goals, interests, and stage of learning."
    },
    "teachers": {
      "title": "Meet Our English Teachers | Hamkke",
      "description": "Meet Hamkke’s English teachers. Explore their teaching backgrounds, interests, and approaches to one-to-one online lessons."
    },
    "policy": {
      "title": "Lesson Policies | Hamkke",
      "description": "Read Hamkke’s lesson policies, including scheduling, attendance, cancellations, and package terms."
    },
    "reflections": {
      "title": "Learner Stories and Reflections | Hamkke",
      "description": "Read reflections from Hamkke learners and families about their English lessons and learning experiences."
    },
    "assessment": {
      "title": "Book an English Assessment | Hamkke",
      "description": "Book an English assessment with Hamkke. Share your learning goals and find a starting point for your one-to-one English lessons."
    },
    "contact": {
      "title": "Contact Hamkke | Hamkke",
      "description": "Have a question about Hamkke’s online English lessons? Contact us about lesson options, enrollment, and getting started."
    }
  },
  "ko": {
    "home": {
      "title": "일대일 온라인 영어회화 | Hamkke",
      "description": "함께 Hamkke의 일대일 온라인 영어 수업으로 영어 말하기를 연습해 보세요. 선생님, 수업 패키지, 대화 중심의 학습 방법을 만나보세요."
    },
    "about": {
      "title": "함께 Hamkke 소개 | Hamkke",
      "description": "대화와 꾸준한 연습, 개인별 지도를 통해 의미 있는 영어 학습을 만들어가는 함께 Hamkke를 소개합니다."
    },
    "how-it-works": {
      "title": "영어 수업 이용 안내 | Hamkke",
      "description": "영어 레벨 확인부터 수업 선택과 선생님과의 일대일 학습까지, 함께 Hamkke에서 영어 공부를 시작하는 방법을 알아보세요."
    },
    "lessons": {
      "title": "영어 수업 및 패키지 | Hamkke",
      "description": "함께 Hamkke의 온라인 영어 수업과 패키지를 살펴보세요. 학습 목표와 관심사, 현재 수준에 맞는 수업을 찾아보세요."
    },
    "teachers": {
      "title": "영어 선생님 소개 | Hamkke",
      "description": "함께 Hamkke의 영어 선생님을 만나보세요. 선생님의 경력, 관심사, 일대일 온라인 수업 방식을 확인할 수 있습니다."
    },
    "policy": {
      "title": "수업 정책 안내 | Hamkke",
      "description": "함께 Hamkke의 수업 일정, 출석, 취소 및 패키지 이용에 관한 정책을 확인하세요."
    },
    "reflections": {
      "title": "수강생 이야기와 후기 | Hamkke",
      "description": "함께 Hamkke 수강생과 가족들이 전하는 영어 수업과 학습 경험을 읽어보세요."
    },
    "assessment": {
      "title": "영어 레벨 확인 예약 | Hamkke",
      "description": "함께 Hamkke의 영어 레벨 확인을 예약하세요. 학습 목표를 나누고 일대일 영어 수업의 시작점을 찾아보세요."
    },
    "contact": {
      "title": "함께 Hamkke 문의 | Hamkke",
      "description": "온라인 영어 수업에 대해 궁금한 점이 있으신가요? 수업 선택, 등록 및 시작 방법에 대해 함께 Hamkke에 문의하세요."
    }
  },
  "zh": {
    "home": {
      "title": "一对一在线英语课程 | Hamkke",
      "description": "通过 Hamkke 的一对一在线课程练习英语表达。了解我们的教师、课程套餐和以对话为中心的学习方式。"
    },
    "about": {
      "title": "关于 Hamkke | Hamkke",
      "description": "了解 Hamkke 如何通过对话、个性化指导和持续练习，创造有意义的英语学习体验。"
    },
    "how-it-works": {
      "title": "英语课程学习流程 | Hamkke",
      "description": "了解如何开始 Hamkke 课程：从英语水平评估、选择课程，到与教师进行一对一学习。"
    },
    "lessons": {
      "title": "英语课程与套餐 | Hamkke",
      "description": "探索 Hamkke 的在线英语课程和套餐，寻找适合您的学习目标、兴趣和当前水平的课程。"
    },
    "teachers": {
      "title": "认识英语教师 | Hamkke",
      "description": "认识 Hamkke 的英语教师，了解他们的教学背景、兴趣和一对一在线教学方式。"
    },
    "policy": {
      "title": "课程政策 | Hamkke",
      "description": "查看 Hamkke 关于课程安排、出勤、取消课程和套餐使用的政策。"
    },
    "reflections": {
      "title": "学员故事与感想 | Hamkke",
      "description": "阅读 Hamkke 学员和家人分享的英语课程感想与学习经历。"
    },
    "assessment": {
      "title": "预约英语水平评估 | Hamkke",
      "description": "预约 Hamkke 英语水平评估，分享您的学习目标，为一对一英语学习找到合适的起点。"
    },
    "contact": {
      "title": "联系 Hamkke | Hamkke",
      "description": "对 Hamkke 在线英语课程有疑问？欢迎咨询课程选择、报名及开始学习的方式。"
    }
  },
  "ja": {
    "home": {
      "title": "マンツーマンのオンライン英会話 | Hamkke",
      "description": "Hamkkeのマンツーマンオンラインレッスンで英語を話す練習を。講師、レッスンプラン、会話を中心とした学び方をご紹介します。"
    },
    "about": {
      "title": "Hamkkeについて | Hamkke",
      "description": "対話、一人ひとりに合わせた指導、継続的な練習を通じて、意味のある英語学習を目指すHamkkeをご紹介します。"
    },
    "how-it-works": {
      "title": "英語レッスンの始め方 | Hamkke",
      "description": "英語レベルの確認からレッスン選び、講師とのマンツーマン学習まで、Hamkkeでの学習の流れをご案内します。"
    },
    "lessons": {
      "title": "英語レッスンとプラン | Hamkke",
      "description": "Hamkkeのオンライン英語レッスンとプランをご覧ください。目標や興味、現在のレベルに合った学び方を探せます。"
    },
    "teachers": {
      "title": "英語講師の紹介 | Hamkke",
      "description": "Hamkkeの英語講師をご紹介します。講師の経歴、興味、マンツーマンオンラインレッスンの進め方をご覧ください。"
    },
    "policy": {
      "title": "レッスンポリシー | Hamkke",
      "description": "Hamkkeのスケジュール、出席、キャンセル、レッスンプランの利用に関するポリシーをご確認ください。"
    },
    "reflections": {
      "title": "受講生の声と学習体験 | Hamkke",
      "description": "Hamkkeの受講生やご家族による、英語レッスンの感想や学習体験をご覧ください。"
    },
    "assessment": {
      "title": "英語レベルチェックの予約 | Hamkke",
      "description": "Hamkkeの英語レベルチェックをご予約ください。学習目標を共有し、マンツーマン英語学習のスタート地点を見つけましょう。"
    },
    "contact": {
      "title": "Hamkkeへのお問い合わせ | Hamkke",
      "description": "オンライン英語レッスンについてのご質問はHamkkeへ。レッスン選び、お申し込み、学習の始め方についてお問い合わせいただけます。"
    }
  }
} as const;
export type PublicPage = keyof typeof content.en;
const ogLocales: Record<Locale, string> = { en: "en_US", ko: "ko_KR", zh: "zh_CN", ja: "ja_JP" };

export function localizedAlternates(path: string) {
  return Object.fromEntries(locales.map(locale => [locale, `${siteUrl}/${locale}${path}`]));
}

export function buildPublicMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const url = `${siteUrl}/${locale}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: localizedAlternates(path) },
    openGraph: {
      type: "website", siteName: "Hamkke", title, description, url,
      locale: ogLocales[locale],
      alternateLocale: locales.filter(value => value !== locale).map(value => ogLocales[value]),
    },
    twitter: { card: "summary", title, description },
  };
}

export async function publicPageMetadata(params: Promise<{ locale: string }>, page: PublicPage): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const { title, description } = content[locale][page];
  return buildPublicMetadata(locale, page === "home" ? "" : `/${page}`, title, description);
}
