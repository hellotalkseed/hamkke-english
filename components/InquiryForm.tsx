"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  ContactRound,
  ChartNoAxesColumnIncreasing,
  Target,
  Pencil,
  Send,
  LockKeyhole,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

export type InquirySource =
  | "experience"
  | "goals"
  | "stories"
  | "start-a-conversation";

interface InquiryFormProps {
  source: InquirySource;
  locale: Locale;
  onSubmitted?: () => void;
}

const iconClass =
  "h-[20px] w-[20px] shrink-0 text-[#6F8F72]";

export default function InquiryForm({
  source,
  locale,
  onSubmitted,
}: InquiryFormProps) {
  const t = getMessages(locale);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactMethod: "",
    contactId: "",
    level: "",
    goal: "",
    message: "",
  });

  /*
   * =========================================================
   * INQUIRY HEADING
   * =========================================================
   */

  const headingBySource: Record<InquirySource, string> = {
    experience: t.inquiry.headings.experience,

    goals: t.inquiry.headings.goals,

    stories: t.inquiry.headings.stories,

    "start-a-conversation":
      t.inquiry.headings.startAConversation,
  };

  const inquiryHeading = headingBySource[source];

  /*
   * =========================================================
   * RESET WHEN SOURCE OR LOCALE CHANGES
   * =========================================================
   */

  useEffect(() => {
    setSubmitted(false);
    setError("");
  }, [source, locale]);

  /*
   * =========================================================
   * FORM CHANGE
   * =========================================================
   */

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * =========================================================
   * FORM SUBMIT
   * =========================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          inquirySource: source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        onSubmitted?.();
      } else {
        setError(t.inquiry.errors.general);
      }
    } catch {
      setError(t.inquiry.errors.network);
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * SUCCESS STATE
   * =========================================================
   */

  if (submitted) {
    return (
      <div
        className="
          px-0
          py-12
          text-center

          sm:px-10
          sm:py-16
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#E7EEE5]
            text-[#6F8F72]
          "
        >
          <CheckCircle2
            size={32}
            strokeWidth={1.5}
          />
        </div>

        <h2
          className="
            mt-6
            text-[40px]
            leading-tight
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]

            sm:text-[46px]
          "
        >
          {t.inquiry.success.title}
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-md
            text-[15px]
            leading-8
            text-[#5B5B5B]
          "
        >
          {t.inquiry.success.message}
        </p>

        <p
          className="
            mt-7
            text-xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]
          "
        >
          {t.inquiry.success.closing}
        </p>
      </div>
    );
  }

  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  return (
    <div className="w-full">
      {/* HEADER */}

      <div
        className="
          px-0
          pb-5
          pt-7

          sm:pb-6
          sm:pt-10
        "
      >
        <p
          className="
            text-[11px]
            font-medium
            uppercase
            tracking-[0.28em]
            text-[#6F8F72]

            sm:text-[12px]
            sm:tracking-[0.32em]
          "
        >
          {t.inquiry.brand}
        </p>

        <h2
          id="inquiry-modal-title"
          className="
            mt-3
            max-w-[620px]

            text-[34px]
            leading-[1.02]
            tracking-[-0.015em]

            text-[#2B2B2B]

            [font-family:var(--font-cormorant)]

            sm:mt-4
            sm:text-[44px]
            sm:leading-[1.02]

            lg:text-[48px]
          "
        >
          {inquiryHeading}
        </h2>

        <div
          className="
            mt-4

            flex
            flex-wrap
            items-center
            justify-center

            gap-x-5
            gap-y-3

            text-center

            sm:mt-5
          "
        >
          <div className="flex items-center justify-center gap-2.5">
            <MessageCircle
              className={iconClass}
              strokeWidth={1.7}
            />

            <span
              className="
                text-[11px]
                text-[#777]

                sm:text-[13px]
              "
            >
              {t.inquiry.reassurance.personalReply}
            </span>
          </div>

          <span
            className="
              hidden
              h-5
              w-px
              bg-[#D9E2D6]

              sm:block
            "
          />

          <div className="flex items-center justify-center gap-2.5">
            <ShieldCheck
              className={iconClass}
              strokeWidth={1.7}
            />

            <span
              className="
                text-[11px]
                text-[#777]

                sm:text-[13px]
              "
            >
              {t.inquiry.reassurance.informationSafe}
            </span>
          </div>
        </div>

        <p
          className="
            mt-5
            max-w-[620px]

            text-[14px]
            leading-6

            text-[#686868]

            sm:mt-6
            sm:text-[16px]
            sm:leading-7
          "
        >
          {t.inquiry.intro}
        </p>
      </div>

      {/* FORM CONTENT */}

      <div
        className="
          px-0
          pb-8

          sm:pb-10
        "
      >
        <form
          onSubmit={handleSubmit}
          className="
            space-y-3

            sm:space-y-4
          "
        >
          {/* NAME */}

          <div className="relative">
            <UserRound
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.inquiry.fields.name}
              required
              className="
                h-[60px]
                w-full
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-10
                text-[14px]
                text-[#2B2B2B]
                placeholder:text-[#858585]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-[#6F8F72]
              "
            >
              *
            </span>
          </div>

          {/* EMAIL */}

          <div className="relative">
            <Mail
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.inquiry.fields.email}
              required
              className="
                h-[60px]
                w-full
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-10
                text-[14px]
                text-[#2B2B2B]
                placeholder:text-[#858585]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-[#6F8F72]
              "
            >
              *
            </span>
          </div>

          {/* CONTACT METHOD */}

          <div className="relative">
            <Phone
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <select
              id="contactMethod"
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              required
              className={`
                h-[60px]
                w-full
                appearance-none
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-16
                text-[14px]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]

                ${
                  formData.contactMethod
                    ? "text-[#2B2B2B]"
                    : "text-[#858585]"
                }
              `}
            >
              <option value="">
                {t.inquiry.fields.contactMethod}
              </option>

              <option value="KakaoTalk">
                {t.inquiry.options.contactMethod.kakaoTalk}
              </option>

              <option value="WhatsApp">
                {t.inquiry.options.contactMethod.whatsApp}
              </option>

              <option value="WeChat">
                {t.inquiry.options.contactMethod.weChat}
              </option>
            </select>

            <ChevronDown
              className="
                pointer-events-none
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-[#777]
              "
              size={19}
              strokeWidth={1.7}
            />

            <span
              className="
                pointer-events-none
                absolute
                right-10
                top-1/2
                -translate-y-1/2
                translate-x-8
                text-[#6F8F72]
              "
            >
              *
            </span>
          </div>

          {/* CONTACT ID */}

          <div className="relative">
            <ContactRound
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <input
              id="contactId"
              type="text"
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              placeholder={t.inquiry.fields.contactId}
              className="
                h-[60px]
                w-full
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-5
                text-[14px]
                text-[#2B2B2B]
                placeholder:text-[#858585]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]
              "
            />
          </div>

          {/* ENGLISH COMFORT */}

          <div className="relative">
            <ChartNoAxesColumnIncreasing
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className={`
                h-[60px]
                w-full
                appearance-none
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-16
                text-[14px]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]

                ${
                  formData.level
                    ? "text-[#2B2B2B]"
                    : "text-[#858585]"
                }
              `}
            >
              <option value="">
                {t.inquiry.fields.level}
              </option>

              <option value="Just getting started">
                {t.inquiry.options.level.justGettingStarted}
              </option>

              <option value="Understanding but speaking is difficult">
                {t.inquiry.options.level.understandingButSpeakingIsDifficult}
              </option>

              <option value="Simple conversations but hesitant">
                {t.inquiry.options.level.simpleConversationsButStillHesitate}
              </option>

              <option value="Communicate well but want to speak naturally">
                {t.inquiry.options.level.communicateWellButWantToSpeakMoreNaturally}
              </option>

              <option value="Comfortable speaking but want more fluency">
                {t.inquiry.options.level.comfortableSpeakingButWantToBecomeMoreFluent}
              </option>
            </select>

            <ChevronDown
              className="
                pointer-events-none
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-[#777]
              "
              size={19}
              strokeWidth={1.7}
            />

            <span
              className="
                pointer-events-none
                absolute
                right-10
                top-1/2
                -translate-y-1/2
                translate-x-8
                text-[#6F8F72]
              "
            >
              *
            </span>
          </div>

          {/* GOAL */}

          <div className="relative">
            <Target
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              className={`
                h-[60px]
                w-full
                appearance-none
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                pl-12
                pr-16
                text-[14px]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:h-[72px]
                sm:pl-14
                sm:text-[16px]

                ${
                  formData.goal
                    ? "text-[#2B2B2B]"
                    : "text-[#858585]"
                }
              `}
            >
              <option value="">
                {t.inquiry.fields.goal}
              </option>

              <option value="Speak more confidently">
                {t.inquiry.options.goal.speakMoreConfidently}
              </option>

              <option value="Improve everyday conversation">
                {t.inquiry.options.goal.improveEverydayConversation}
              </option>

              <option value="English for work">
                {t.inquiry.options.goal.englishForWork}
              </option>

              <option value="Interview preparation">
                {t.inquiry.options.goal.interviewPreparation}
              </option>

              <option value="Travel English">
                {t.inquiry.options.goal.travelMoreComfortably}
              </option>

              <option value="Overall English">
                {t.inquiry.options.goal.improveOverallEnglish}
              </option>

              <option value="Something else">
                {t.inquiry.options.goal.somethingElse}
              </option>
            </select>

            <ChevronDown
              className="
                pointer-events-none
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                text-[#777]
              "
              size={19}
              strokeWidth={1.7}
            />

            <span
              className="
                pointer-events-none
                absolute
                right-10
                top-1/2
                -translate-y-1/2
                translate-x-8
                text-[#6F8F72]
              "
            >
              *
            </span>
          </div>

          {/* MESSAGE */}

          <div className="relative">
            <Pencil
              className="
                pointer-events-none
                absolute
                left-4
                top-5
                text-[#6F8F72]

                sm:left-5
              "
              size={20}
              strokeWidth={1.6}
            />

            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder={t.inquiry.fields.message}
              className="
                min-h-[115px]
                w-full
                resize-y
                rounded-[15px]
                border
                border-[#DDE5D9]
                bg-white
                px-5
                py-5
                pl-12
                text-[14px]
                leading-6
                text-[#2B2B2B]
                placeholder:text-[#858585]
                outline-none
                transition
                duration-200
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#6F8F72]/10

                sm:min-h-[135px]
                sm:pl-14
                sm:text-[16px]
              "
            />
          </div>

          {/* ERROR */}

          {error && (
            <p
              className="
                rounded-xl
                bg-[#FDF0F0]
                px-4
                py-3
                text-center
                text-sm
                text-[#B65A5A]
              "
            >
              {error}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-2
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-full
              bg-[#6F8F72]
              px-6
              py-4
              text-[15px]
              font-medium
              text-white
              shadow-[0_8px_24px_rgba(111,143,114,0.18)]
              transition-all
              duration-200
              hover:bg-[#5B7960]
              hover:shadow-[0_10px_28px_rgba(111,143,114,0.25)]
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60

              sm:py-4.5
            "
          >
            {loading
              ? t.inquiry.sending
              : t.inquiry.submit}

            {!loading && (
              <Send
                size={18}
                strokeWidth={1.7}
              />
            )}
          </button>

          {/* PRIVACY */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              px-4
              pt-2
              pb-2
              text-center
              text-[11px]
              leading-5
              text-[#929292]

              sm:text-[12px]
            "
          >
            <LockKeyhole
              size={15}
              strokeWidth={1.6}
              className="shrink-0"
            />

            <span>
              {t.inquiry.privacy}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}