"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

import type { Locale } from "@/lib/i18n";

interface ReflectionFormProps {
  locale: Locale;
}

/* =========================================================
   COUNTRIES
   ========================================================= */

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {
  en: {
    ratingTitle:
      "How would you rate your learning experience?",
    ratingRequired: "Select a rating",
    ratingLabels: {
      1: "Needs Improvement",
      2: "Fair",
      3: "Good",
      4: "Great",
      5: "Excellent",
    },

    name: "Name",
    nameHelp:
      "Use your real name, English name, nickname, or initials. This is how your name will appear on the website.",
    namePlaceholder: "Enter your name",

    role: "I am a...",
    student: "Student",
    parent: "Parent / Guardian",

    country: "Country / Region",
    countryPlaceholder:
      "Start typing a country or region",
    noCountryFound: "No country found",

    reflection: "Share your story",
    reflectionPlaceholder: "What has learning with Hamkke been like for you?",

    photo: "Photo",
    photoOptional: "(Optional)",
    photoHelp:
      "If you'd like your photo to appear with your story, you can upload one here.",

    permission:
      "I give Hamkke permission to publish my story and uploaded photo (if provided) on the website.",

    submit: "Share My Story",
    sending: "Sending...",

    thankYou: "Thank you!",
    thankYouMessage:
      "Thank you for taking the time to share your experience with Hamkke. Your story may encourage someone else to begin their own English journey, and I'm truly grateful you've chosen to share it with us.",

    closing: "See you in our next conversation.",
    return: "Return to Hamkke",

    requiredFields:
      "Please complete all required fields before submitting.",

    permissionRequired:
      "Please give permission for your story to be published before submitting.",

    submissionError:
      "Something went wrong while submitting your story. Please try again.",
  },

  ko: {
    ratingTitle:
      "영어 학습 경험은 어떠셨나요?",
    ratingRequired: "별점을 선택해 주세요",
    ratingLabels: {
      1: "개선이 필요해요",
      2: "괜찮아요",
      3: "좋아요",
      4: "아주 좋아요",
      5: "최고예요",
    },

    name: "이름",
    nameHelp:
      "실명, 영어 이름, 별명 또는 이니셜을 사용해 주세요. 웹사이트에 표시될 이름입니다.",
    namePlaceholder: "이름을 입력해 주세요",

    role: "저는...",
    student: "학생",
    parent: "학부모 / 보호자",

    country: "국가 / 지역",
    countryPlaceholder:
      "국가 또는 지역을 입력해 주세요",
    noCountryFound:
      "일치하는 국가를 찾을 수 없습니다",

    reflection: "여러분의 이야기를 들려주세요",
    reflectionPlaceholder: "Hamkke와 함께 영어를 배우면서 어떤 경험을 하셨나요?",

    photo: "사진",
    photoOptional: "(선택 사항)",
    photoHelp:
      "여러분의 이야기와 함께 사진을 소개하고 싶다면 사진을 업로드해 주세요.",

    permission:
      "제가 작성한 이야기와 업로드한 사진(있는 경우)을 Hamkke 웹사이트에 게시하는 것에 동의합니다.",

    submit: "내 이야기 들려주기",
    sending: "보내는 중...",

    thankYou: "감사합니다.",
    thankYouMessage:
      "소중한 시간을 내어 Hamkke와 함께한 경험을 나누어 주셔서 감사합니다. 여러분의 이야기가 다른 누군가가 자신의 영어 여정을 시작하는 데 작은 용기가 될 수 있습니다. 함께 이야기를 나눠 주셔서 진심으로 감사합니다.",

    closing: "다음 대화에서 다시 만나요.",
    return: "Hamkke로 돌아가기",

    requiredFields:
      "필수 항목을 모두 작성한 후 제출해 주세요.",

    permissionRequired:
      "제출하기 전에 이야기를 웹사이트에 게시하는 것에 동의해 주세요.",

    submissionError:
      "이야기를 보내는 중 문제가 발생했습니다. 다시 시도해 주세요.",
  },

  zh: {
    ratingTitle:
      "你会如何评价自己的英语学习体验？",
    ratingRequired: "请选择评分",
    ratingLabels: {
      1: "需要改进",
      2: "还不错",
      3: "很好",
      4: "非常好",
      5: "非常棒",
    },

    name: "姓名",
    nameHelp:
      "你可以填写真实姓名、英文名、昵称或姓名首字母。这是之后显示在网站上的名字。",
    namePlaceholder: "请输入你的名字",

    role: "我是...",
    student: "学生",
    parent: "家长 / 监护人",

    country: "国家 / 地区",
    countryPlaceholder: "请输入国家或地区",
    noCountryFound: "没有找到匹配的国家或地区",

    reflection: "分享你的故事",
    reflectionPlaceholder: "和 Hamkke 一起学习英语，对你来说是什么样的体验？",

    photo: "照片",
    photoOptional: "（选填）",
    photoHelp:
      "如果你希望照片和你的故事一起出现在网站上，可以在这里上传。",

    permission:
      "我同意 Hamkke 在网站上发布我的故事，以及我上传的照片（如果有）。",

    submit: "分享我的故事",
    sending: "发送中...",

    thankYou: "谢谢你。",
    thankYouMessage:
      "谢谢你愿意花时间分享与 Hamkke 一起学习英语的经历。你的故事也许会鼓励另一个人开始自己的英语学习旅程。真的很感谢你愿意与我们分享。",

    closing: "期待在下一次交流中与你见面。",
    return: "返回 Hamkke",

    requiredFields:
      "请填写所有必填项目后再提交。",

    permissionRequired:
      "提交前，请先同意将你的故事发布在网站上。",

    submissionError:
      "提交故事时出现了一些问题，请再试一次。",
  },

  ja: {
    ratingTitle:
      "英語学習の体験はいかがでしたか？",
    ratingRequired: "評価を選んでください",
    ratingLabels: {
      1: "改善が必要",
      2: "まあまあ",
      3: "良かった",
      4: "とても良かった",
      5: "素晴らしかった",
    },

    name: "お名前",
    nameHelp:
      "本名、英語名、ニックネーム、またはイニシャルをご入力ください。こちらのお名前がウェブサイトに表示されます。",
    namePlaceholder: "お名前を入力してください",

    role: "私は...",
    student: "受講者",
    parent: "保護者",

    country: "国 / 地域",
    countryPlaceholder:
      "国または地域を入力してください",
    noCountryFound:
      "該当する国または地域が見つかりません",

    reflection:
      "あなたのストーリーを聞かせてください",
    reflectionPlaceholder: "Hamkkeで英語を学んでみて、いかがでしたか？",

    photo: "写真",
    photoOptional: "（任意）",
    photoHelp:
      "ストーリーと一緒に写真を掲載したい場合は、こちらからアップロードできます。",

    permission:
      "私が投稿したストーリーと、アップロードした写真（ある場合）をHamkkeのウェブサイトに掲載することに同意します。",

    submit: "ストーリーを送る",
    sending: "送信中...",

    thankYou: "ありがとうございます。",
    thankYouMessage:
      "Hamkkeでの体験を共有してくださり、ありがとうございます。あなたのストーリーが、これから英語を学び始める誰かの小さなきっかけになるかもしれません。大切な経験を私たちと共有してくださったことに、心より感謝しています。",

    closing:
      "また次の会話でお会いしましょう。",
    return: "Hamkkeに戻る",

    requiredFields:
      "必須項目をすべて入力してから送信してください。",

    permissionRequired:
      "送信する前に、ストーリーの掲載に同意してください。",

    submissionError:
      "ストーリーの送信中に問題が発生しました。もう一度お試しください。",
  },
} as const;


const formCopy: Record<Locale, {
  experience: string;
  aboutYou: string;
  permission: string;
  required: string;
  optional: string;
  selectCountry: string;
  shared: string;
  thanks: string;
}> = {
  en: {
    experience: "Your experience",
    aboutYou: "A little about you",
    permission: "Before you share",
    required: "Fields marked * are required.",
    optional: "A photo, if you like",
    selectCountry: "Choose your country or region",
    shared: "Your story has been received",
    thanks: "Thank you for being part of our story.",
  },
  ko: {
    experience: "함께한 경험",
    aboutYou: "어떤 분인지 알려주세요",
    permission: "이야기를 보내기 전에",
    required: "* 표시가 있는 항목은 필수입니다.",
    optional: "사진도 함께 나누고 싶다면",
    selectCountry: "국가 또는 지역을 선택해 주세요",
    shared: "소중한 이야기가 잘 도착했어요",
    thanks: "Hamkke의 이야기를 함께 만들어 주셔서 감사합니다.",
  },
  zh: {
    experience: "你的学习体验",
    aboutYou: "简单介绍一下自己",
    permission: "分享之前",
    required: "标有 * 的项目为必填项。",
    optional: "如果愿意，也可以分享照片",
    selectCountry: "请选择国家或地区",
    shared: "我们已收到你的故事",
    thanks: "谢谢你成为 Hamkke 故事的一部分。",
  },
  ja: {
    experience: "あなたの学習体験",
    aboutYou: "あなたについて",
    permission: "送信する前に",
    required: "* は必須項目です。",
    optional: "よろしければ写真も",
    selectCountry: "国または地域を選んでください",
    shared: "ストーリーを受け取りました",
    thanks: "Hamkkeの物語を一緒につくってくださり、ありがとうございます。",
  },
};

const fieldClass =
  "w-full rounded-xl border border-[#D8D4CC] bg-[#FFFDF8] px-4 py-3.5 text-[15px] leading-6 text-[#304A39] outline-none transition placeholder:text-[#8A8A84] focus:border-[#718A73] focus:ring-2 focus:ring-[#718A73]/20";
const labelClass = "block text-sm font-medium leading-6 text-[#304A39]";
const helpClass = "mt-2 text-[13px] leading-6 text-[#758477]";

export default function ReflectionForm({ locale }: ReflectionFormProps) {
  const t = translations[locale];
  const copy = formCopy[locale];
  const submitting = useRef(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [reflection, setReflection] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [permission, setPermission] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setErrorMessage("");

    if (!rating || !name.trim() || !role || !countries.includes(country) || !reflection.trim()) {
      setErrorMessage(t.requiredFields);
      return;
    }
    if (!permission) {
      setErrorMessage(t.permissionRequired);
      return;
    }

    submitting.current = true;
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      if (photo) {
        const fileName = `${crypto.randomUUID()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("reflections")
          .upload(fileName, photo);
        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from("reflections").getPublicUrl(fileName).data.publicUrl;
      }

      // The database supplies created_at via DEFAULT now().
      // Keep the existing insert-only flow: public submissions may not have read access.
      const { error } = await supabase.from("reflections").insert({
        rating,
        name: name.trim(),
        role,
        country,
        reflection: reflection.trim(),
        photo_url: photoUrl,
        photo_name: photo ? photo.name : null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error("Reflection submission failed:", error);
      setErrorMessage(t.submissionError);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section aria-live="polite" className="border-y border-[#DCE4D7] py-14 text-center sm:py-20">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5EBDD] text-[#607D68]">
          <Check size={25} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-medium tracking-[0.12em] text-[#718A73]">{copy.shared}</p>
        <h2 tabIndex={-1} ref={(node) => { node?.focus(); }} className="mt-4 font-serif text-[40px] leading-tight tracking-[-0.03em] text-[#304A39] outline-none sm:text-[52px]">
          {t.thankYou}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-8 text-[#758477]">{t.thankYouMessage}</p>
        <p className="mt-8 font-serif text-[23px] italic text-[#718A73]">{copy.thanks}</p>
        <Link href={`/${locale}`} className="mt-9 inline-flex items-center gap-4 border-b border-[#718A73] pb-2 text-sm font-medium text-[#304A39] transition hover:text-[#718A73] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#718A73]">
          {t.return}<ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading}>
      <fieldset disabled={loading} className="min-w-0">
        <legend className="sr-only">{t.reflection}</legend>

        <section className="grid gap-5 pb-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xs font-semibold uppercase leading-6 tracking-[0.16em] text-[#718A73]">{copy.experience}</h2>
            <p className="text-[11px] leading-6 text-[#758477]">{copy.required}</p>
          </div>
          <div className="min-w-0 space-y-5">
            <fieldset>
              <legend className={labelClass}>{t.ratingTitle} <span aria-hidden="true">*</span></legend>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hover || rating);
                    const label = t.ratingLabels[star as 1 | 2 | 3 | 4 | 5];
                    return (
                      <label key={star} className="relative cursor-pointer" onMouseEnter={() => setHover(star)}>
                        <input type="radio" name="rating" value={star} required checked={rating === star} onChange={() => setRating(star)} className="peer sr-only" aria-label={`${star} / 5: ${label}`} />
                        <span className={`flex h-11 w-11 items-center justify-center rounded-lg transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#718A73] ${active ? "bg-[#E5EBDD] text-[#607D68]" : "text-[#B8C9B5] hover:bg-[#F3F4EB]"}`}>
                          <Star size={26} strokeWidth={1.35} fill={active ? "currentColor" : "none"} aria-hidden="true" />
                        </span>
                      </label>
                    );
                  })}
                </div>
                <span aria-live="polite" className="text-[13px] font-medium text-[#718A73]">
                  {hover || rating ? t.ratingLabels[(hover || rating) as 1 | 2 | 3 | 4 | 5] : t.ratingRequired}
                </span>
              </div>
            </fieldset>
            <div>
              <label htmlFor="reflection-story" className={labelClass}>{t.reflection} <span aria-hidden="true">*</span></label>
              <textarea id="reflection-story" rows={5} required value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder={t.reflectionPlaceholder} className={`${fieldClass} mt-2 min-h-[150px] resize-y leading-7`} />
            </div>
          </div>
        </section>

        <section className="grid gap-5 border-t border-[#DCE4D7] py-7">
          <h2 className="font-serif text-[24px] leading-tight tracking-[-0.02em] text-[#304A39]">{copy.aboutYou}</h2>
          <div className="min-w-0 space-y-5">
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="reflection-name" className={labelClass}>{t.name} <span aria-hidden="true">*</span></label>
              <input id="reflection-name" type="text" autoComplete="nickname" required aria-describedby="reflection-name-help" placeholder={t.namePlaceholder} value={name} onChange={(event) => setName(event.target.value)} className={`${fieldClass} mt-3`} />
              <p id="reflection-name-help" className={helpClass}>{t.nameHelp}</p>
            </div>
            <div>
              <label htmlFor="reflection-country" className={labelClass}>{t.country} <span aria-hidden="true">*</span></label>
              <select id="reflection-country" autoComplete="country-name" required value={country} onChange={(event) => setCountry(event.target.value)} className={`${fieldClass} mt-3`}>
                <option value="" disabled>{copy.selectCountry}</option>
                {countries.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            </div>
            <fieldset>
              <legend className={labelClass}>{t.role} <span aria-hidden="true">*</span></legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[{ value: "Student", label: t.student }, { value: "Parent / Guardian", label: t.parent }].map((option) => (
                  <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-[14px] leading-6 transition ${role === option.value ? "border-[#718A73] bg-[#E5EBDD] text-[#304A39]" : "border-[#D8D4CC] bg-[#FFFDF8] text-[#56645B] hover:border-[#718A73]"}`}>
                    <input type="radio" name="role" required value={option.value} checked={role === option.value} onChange={(event) => setRole(event.target.value)} className="h-4 w-4 shrink-0 accent-[#607D68]" />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="reflection-photo" className={labelClass}>{t.photo} <span className="font-normal text-[#758477]">{t.photoOptional}</span></label>
              <p id="reflection-photo-help" className={helpClass}>{t.photoHelp}</p>
              <input id="reflection-photo" type="file" accept="image/*" aria-describedby="reflection-photo-help" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="mt-3 block w-full min-w-0 rounded-xl border border-dashed border-[#B8C9B5] bg-[#F3F4EB] p-3 text-xs text-[#56645B] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#E5EBDD] file:px-4 file:py-2 file:text-xs file:font-medium file:text-[#304A39] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718A73]" />
            </div>
          </div>
        </section>

        <section aria-label={copy.permission} className="border-t border-[#DCE4D7] pb-3 pt-6">
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-7 text-[#56645B]">
              <input type="checkbox" required checked={permission} onChange={(event) => setPermission(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#607D68]" />
              <span>{t.permission} <span aria-hidden="true">*</span></span>
            </label>
            {errorMessage && <p role="alert" className="mt-5 rounded-lg border border-[#D9B8AF] bg-[#FBF0EC] px-4 py-3 text-sm leading-6 text-[#8B4137]">{errorMessage}</p>}
            <div className="relative mt-5 inline-block w-full sm:w-auto">
              <span aria-hidden="true" className="absolute inset-0 translate-y-[7px] rounded-[20px] bg-[#718A73]" />
              <button type="submit" disabled={loading} className="group relative flex min-h-[60px] w-full items-center justify-between gap-8 rounded-[20px] bg-[#304A39] px-7 py-4 text-sm font-semibold text-[#FFFDF8] transition-transform hover:-translate-y-0.5 active:translate-y-1 disabled:cursor-wait disabled:opacity-70 sm:min-w-[270px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#718A73]">
                {loading ? t.sending : t.submit}
                <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </fieldset>
    </form>
  );
}
