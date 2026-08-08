"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

export type InquirySource =
  | "get-in-touch"
  | "start-learning"
  | "book-a-lesson"
  | "start-a-conversation";

interface InquiryFormProps {
  source: InquirySource;
  onSubmitted?: () => void;
}

const inquiryHeadings: Record<InquirySource, string> = {
  "get-in-touch": "Let’s get in touch.",
  "start-learning": "Let’s start your English journey.",
  "book-a-lesson": "Let’s find the right lesson for you.",
  "start-a-conversation": "Let’s start with a conversation.",
};

const iconClass =
  "h-[20px] w-[20px] shrink-0 text-[#6F8F72]";

export default function InquiryForm({
  source,
  onSubmitted,
}: InquiryFormProps) {
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

  const heading = inquiryHeadings[source];

  /* =========================================================
     RESET WHEN SOURCE CHANGES
     ========================================================= */

  useEffect(() => {
    setSubmitted(false);
    setError("");
  }, [source]);

  /* =========================================================
     FORM CHANGE
     ========================================================= */

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

  /* =========================================================
     FORM SUBMIT
     ========================================================= */

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
        setError(
          "Something went wrong. Please try again."
        );
      }
    } catch {
      setError(
        "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUCCESS STATE
     ========================================================= */

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
          Thank you.
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
          I&apos;ve received your message and I&apos;ll
          personally get back to you within 24 hours.
          I look forward to learning more about you and
          helping you on your English journey.
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
          See you soon.
        </p>
      </div>
    );
  }

  /* =========================================================
     FORM
     ========================================================= */

  return (
    <div className="w-full">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          px-0
          pb-5
          pt-7

          sm:px-10
          sm:pb-6
          sm:pt-10
        "
      >
        {/* Logo + Heading */}

        <div
          className="
            flex
            items-start
            gap-2

            pr-2

            sm:gap-3
            sm:pr-12
          "
        >
          <Image
            src="/logo/hamkke-icon.svg"
            alt="Hamkke"
            width={48}
            height={48}
            priority
            className="
              mt-1

              h-10
              w-10
              shrink-0

              sm:h-12
              sm:w-12
            "
          />

          <div className="min-w-0">
            <h2
  id="inquiry-modal-title"
  className="
    mt-1

    max-w-full

    whitespace-normal

    text-[29px]
    leading-[1.08]
    tracking-[-0.01em]

    text-[#2B2B2B]

    [font-family:var(--font-cormorant)]

    sm:whitespace-nowrap
    sm:text-[36px]
    sm:leading-[1.05]
    sm:tracking-[-0.01em]

    lg:text-[38px]
  "
>
  {heading}
</h2>
          </div>
        </div>

        {/* Intro */}

        <p
  className="
    mt-4
    w-full

    text-center

    text-[14px]
    leading-6

    text-[#686868]

    sm:mt-5
    sm:text-[16px]
    sm:leading-7
  "
>
  Tell me a little about you and what you&apos;d like to work on.
</p>

        {/* Reassurance */}

        <div
  className="
    mt-4

    flex
    flex-wrap
    items-center
    justify-center

    gap-x-5
    gap-y-3

    sm:mt-5
  "
>
  <div className="flex items-center gap-2.5">
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
      Personal reply within 24 hours
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

  <div className="flex items-center gap-2.5">
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
      Your information is safe with me
    </span>
  </div>
</div>
      </div>

      {/* =====================================================
          FORM CONTENT

          IMPORTANT:
          This component itself does NOT control height.
          It does NOT use:
          - fixed
          - absolute
          - h-screen
          - h-dvh
          - visualViewport
          - keyboard calculations
          - overflow-hidden

          The parent decides whether this is displayed inside
          a desktop modal or as a normal mobile page.
          ===================================================== */}

      <div
        className="
          px-0
          pb-8

          sm:px-10
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
          {/* =================================================
              NAME
              ================================================= */}

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
              placeholder="What should I call you? (English name)"
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

          {/* =================================================
              EMAIL
              ================================================= */}

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
              placeholder="Email Address"
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

          {/* =================================================
              CONTACT METHOD
              ================================================= */}

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
                How should I contact you?
              </option>

              <option value="KakaoTalk">
                KakaoTalk
              </option>

              <option value="WhatsApp">
                WhatsApp
              </option>

              <option value="WeChat">
                WeChat
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

          {/* =================================================
              CONTACT ID
              ================================================= */}

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
              placeholder="Your ID / Username / Phone Number"
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

          {/* =================================================
              LEVEL
              ================================================= */}

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
                How would you describe your English level?
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Elementary">
                Elementary
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Upper Intermediate">
                Upper Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>

              <option value="Not sure">
                I&apos;m not sure
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

          {/* =================================================
              GOAL
              ================================================= */}

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
                What would you like to focus on?
              </option>

              <option value="Everyday Conversation">
                Everyday Conversation
              </option>

              <option value="Business English">
                Business English
              </option>

              <option value="Travel English">
                Travel English
              </option>

              <option value="Interview Preparation">
                Interview Preparation
              </option>

              <option value="Pronunciation">
                Pronunciation
              </option>

              <option value="Grammar">
                Grammar
              </option>

              <option value="Vocabulary">
                Vocabulary
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

          {/* =================================================
              MESSAGE
              ================================================= */}

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
              placeholder="Anything else you&apos;d like me to know? (Optional)"
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

          {/* =================================================
              ERROR
              ================================================= */}

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

          {/* =================================================
              SUBMIT
              ================================================= */}

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
            {loading ? "Sending..." : "Send Inquiry"}

            {!loading && (
              <Send
                size={18}
                strokeWidth={1.7}
              />
            )}
          </button>

          {/* =================================================
              PRIVACY
              ================================================= */}

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
              I respect your privacy and will never
              share your information.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}