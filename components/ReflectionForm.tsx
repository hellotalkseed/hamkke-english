"use client";

import { useState } from "react";
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
      "⭐ How would you rate your learning experience?",
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
    reflectionPlaceholder:
      "Tell us a little about your English journey. You can talk about your progress, a part of the lessons you enjoyed, or something you can do now that you couldn't do before.",

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
      "⭐ 영어 학습 경험은 어떠셨나요?",
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
    reflectionPlaceholder:
      "영어를 배우면서 어떤 변화가 있었는지, 수업에서 좋았던 점은 무엇인지, 또는 예전에는 할 수 없었지만 지금은 할 수 있게 된 것이 무엇인지 편하게 들려주세요.",

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
      "⭐ 你会如何评价自己的英语学习体验？",
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
    reflectionPlaceholder:
      "欢迎分享一些与你的英语学习经历有关的事情。你可以谈谈自己的进步、喜欢的课程部分，或者一些以前做不到、现在已经能够做到的事情。",

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
      "⭐ 英語学習の体験はいかがでしたか？",
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
    reflectionPlaceholder:
      "英語学習について少し聞かせてください。どのような成長を感じたか、レッスンで楽しかったこと、以前はできなかったけれど今はできるようになったことなど、自由にお書きください。",

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

export default function ReflectionForm({
  locale,
}: ReflectionFormProps) {
  const t = translations[locale];

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const [country, setCountry] = useState("");
  const [countrySearch, setCountrySearch] =
    useState("");
  const [showCountries, setShowCountries] =
    useState(false);

  const [reflection, setReflection] =
    useState("");
  const [photo, setPhoto] =
    useState<File | null>(null);
  const [permission, setPermission] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     COUNTRY FILTER
     ===================================================== */

  const filteredCountries =
    countrySearch.trim() === ""
      ? countries
      : countries.filter((item) =>
          item
            .toLowerCase()
            .includes(
              countrySearch.trim().toLowerCase()
            )
        );

  const selectCountry = (
    selectedCountry: string
  ) => {
    setCountry(selectedCountry);
    setCountrySearch(selectedCountry);
    setShowCountries(false);
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async () => {
    if (
      rating === 0 ||
      !name.trim() ||
      !role ||
      !country ||
      !reflection.trim()
    ) {
      alert(t.requiredFields);
      return;
    }

    if (!permission) {
      alert(t.permissionRequired);
      return;
    }

    try {
      setLoading(true);

      let photoUrl: string | null = null;

      if (photo) {
        const fileName = `${Date.now()}-${photo.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("reflections")
            .upload(fileName, photo);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("reflections")
          .getPublicUrl(fileName);

        photoUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("reflections")
        .insert({
          rating,
          name: name.trim(),
          role,
          country,
          reflection: reflection.trim(),
          photo_url: photoUrl,
          photo_name: photo ? photo.name : null,
        });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("SUPABASE ERROR:", error);
      alert(t.submissionError);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SUCCESS STATE
     ===================================================== */

  if (submitted) {
    return (
      <section
        className="
          rounded-[3rem]
          bg-white
          p-10
          text-center
          shadow-lg
          md:p-14
        "
      >
        <h2
          className="
            text-5xl
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
          "
        >
          {t.thankYou}
        </h2>

        <p
          className="
            mx-auto
            mt-8
            max-w-2xl
            text-lg
            leading-8
            text-[#5B5B5B]
          "
        >
          {t.thankYouMessage}
        </p>

        <p
          className="
            mt-10
            text-xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]
          "
        >
          {t.closing}
        </p>

        <a
          href={`/${locale}`}
          className="
            mt-12
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-[#6F8F72]
            px-8
            py-4
            text-white
            transition
            hover:bg-[#5B7960]
          "
        >
          {t.return}
        </a>
      </section>
    );
  }

  /* =====================================================
     FORM
     ===================================================== */

  return (
    <section
      className="
        rounded-[2.5rem]
        bg-white
        p-6
        shadow-lg
        sm:p-8
        md:p-12
      "
    >
      {/* RATING */}

      <div>
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.ratingTitle}{" "}
          <span className="text-red-500">*</span>
        </label>

        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:gap-4
          "
        >
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} stars`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="
                  cursor-pointer
                  text-[1.9rem]
                  leading-none
                  transition-all
                  duration-200
                  hover:scale-110
                  active:scale-95
                  sm:text-[2.2rem]
                "
              >
                <span
                  className={`inline-block transition-all duration-200 ${
                    star <= (hover || rating)
                      ? "opacity-100 saturate-100"
                      : "opacity-30 grayscale"
                  }`}
                >
                  ⭐
                </span>
              </button>
            ))}
          </div>

          <span
            className="
              min-h-[24px]
              text-sm
              font-medium
              text-[#6F8F72]
            "
          >
            {hover || rating
              ? t.ratingLabels[
                  (hover || rating) as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5
                ]
              : t.ratingRequired}
          </span>
        </div>
      </div>

      {/* NAME */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.name}{" "}
          <span className="text-red-500">*</span>
        </label>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[#6B6B6B]
          "
        >
          {t.nameHelp}
        </p>

        <input
          type="text"
          required
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            mt-4
            w-full
            rounded-xl
            border
            border-[#DDE9D8]
            bg-white
            px-5
            py-3
            text-[#2B2B2B]
            placeholder:text-[#858585]
            outline-none
            transition
            focus:border-[#6F8F72]
          "
        />
      </div>

      {/* ROLE */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.role}{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-[#DDE9D8]
              bg-white
              px-5
              py-4
              transition
              hover:border-[#6F8F72]
            "
          >
            <input
              type="radio"
              name="role"
              value="Student"
              checked={role === "Student"}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="accent-[#6F8F72]"
            />

            <span className="text-[#2B2B2B]">
              {t.student}
            </span>
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-[#DDE9D8]
              bg-white
              px-5
              py-4
              transition
              hover:border-[#6F8F72]
            "
          >
            <input
              type="radio"
              name="role"
              value="Parent / Guardian"
              checked={role === "Parent / Guardian"}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="accent-[#6F8F72]"
            />

            <span className="text-[#2B2B2B]">
              {t.parent}
            </span>
          </label>
        </div>
      </div>

      {/* COUNTRY */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.country}{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="relative mt-4">
          <input
            type="text"
            required
            placeholder={t.countryPlaceholder}
            value={countrySearch}
            autoComplete="off"
            onFocus={() => setShowCountries(true)}
            onChange={(e) => {
              setCountrySearch(e.target.value);

              // Clear the saved country while typing.
              // A valid country is saved only after selection.
              setCountry("");
              setShowCountries(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowCountries(false);

                // Don't allow arbitrary free-text countries.
                if (!country) {
                  setCountrySearch("");
                }
              }, 150);
            }}
            className="
              w-full
              rounded-xl
              border
              border-[#DDE9D8]
              bg-white
              px-5
              py-3
              text-[#2B2B2B]
              placeholder:text-[#858585]
              outline-none
              transition
              focus:border-[#6F8F72]
            "
          />

          {showCountries && (
            <div
              className="
                absolute
                left-0
                right-0
                z-30
                mt-2
                max-h-64
                overflow-y-auto
                rounded-xl
                border
                border-[#DDE9D8]
                bg-white
                py-2
                shadow-xl
              "
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectCountry(item);
                    }}
                    className="
                      block
                      w-full
                      px-5
                      py-3
                      text-left
                      text-sm
                      text-[#2B2B2B]
                      transition
                      hover:bg-[#F4F7F2]
                      hover:text-[#5B7960]
                    "
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p
                  className="
                    px-5
                    py-3
                    text-sm
                    text-[#858585]
                  "
                >
                  {t.noCountryFound}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REFLECTION */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.reflection}{" "}
          <span className="text-red-500">*</span>
        </label>

        <textarea
          rows={8}
          required
          placeholder={t.reflectionPlaceholder}
          value={reflection}
          onChange={(e) =>
            setReflection(e.target.value)
          }
          className="
            mt-4
            w-full
            rounded-xl
            border
            border-[#DDE9D8]
            bg-white
            px-5
            py-4
            text-[#2B2B2B]
            placeholder:text-[#858585]
            leading-7
            outline-none
            transition
            focus:border-[#6F8F72]
          "
        />
      </div>

      {/* PHOTO */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          {t.photo}{" "}
          <span className="font-normal text-[#6B6B6B]">
            {t.photoOptional}
          </span>
        </label>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[#6B6B6B]
          "
        >
          {t.photoHelp}
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setPhoto(
              e.target.files
                ? e.target.files[0]
                : null
            )
          }
          className="
            mt-5
            block
            w-full
            rounded-xl
            border
            border-[#DDE9D8]
            bg-white
            p-4

            file:mr-4
            file:cursor-pointer
            file:rounded-full
            file:border-0
            file:bg-[#6F8F72]
            file:px-4
            file:py-2
            file:text-white

            hover:file:bg-[#5B7960]
          "
        />
      </div>

      {/* PERMISSION */}

      <div className="mt-10">
        <label
          className="
            flex
            cursor-pointer
            items-start
            gap-3
            leading-7
            text-[#5B5B5B]
          "
        >
          <input
            type="checkbox"
            checked={permission}
            onChange={(e) =>
              setPermission(e.target.checked)
            }
            className="
              mt-1
              h-5
              w-5
              shrink-0
              accent-[#6F8F72]
            "
          />

          <span>{t.permission}</span>
        </label>
      </div>

      {/* SUBMIT */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="
          mt-12
          w-full
          rounded-full
          bg-[#6F8F72]
          py-4
          text-lg
          font-medium
          text-white
          transition
          hover:bg-[#5B7960]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading ? t.sending : t.submit}
      </button>
    </section>
  );
}