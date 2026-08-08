"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
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

type InquirySource =
  | "get-in-touch"
  | "start-learning"
  | "book-a-lesson"
  | "start-a-conversation";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: InquirySource;
}

const inquiryHeadings: Record<InquirySource, string> = {
  "get-in-touch": "Let’s get in touch.",
  "start-learning": "Let’s start your English journey.",
  "book-a-lesson": "Let’s find the right lesson for you.",
  "start-a-conversation": "Let’s start with a conversation.",
};

const iconClass =
  "h-[20px] w-[20px] shrink-0 text-[#6F8F72]";

export default function AssessmentModal({
  isOpen,
  onClose,
  source,
}: AssessmentModalProps) {
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
     LOCK BACKGROUND PAGE
     ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollY = window.scrollY;

    const originalBodyPosition = body.style.position;
    const originalBodyTop = body.style.top;
    const originalBodyLeft = body.style.left;
    const originalBodyRight = body.style.right;
    const originalBodyWidth = body.style.width;
    const originalBodyOverflow = body.style.overflow;

    const originalHtmlOverflow = html.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    html.style.overflow = "hidden";

    return () => {
      body.style.position = originalBodyPosition;
      body.style.top = originalBodyTop;
      body.style.left = originalBodyLeft;
      body.style.right = originalBodyRight;
      body.style.width = originalBodyWidth;
      body.style.overflow = originalBodyOverflow;

      html.style.overflow = originalHtmlOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  /* =========================================================
     RESET STATE WHEN MODAL OPENS
     ========================================================= */

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError("");
      setLoading(false);
    }
  }, [isOpen, source]);

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

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-stretch
        justify-center

        bg-[#253026]/45
        backdrop-blur-[4px]

        overscroll-none

        p-0

        sm:items-center
        sm:p-6
      "
      onClick={onClose}
      role="presentation"
    >
      {/* =====================================================
          FIXED MODAL

          IMPORTANT:
          The modal itself NEVER grows or shrinks according
          to the form contents.

          Mobile:
          exactly 100dvh

          Desktop:
          exactly 92vh
          max-width: 680px
          ===================================================== */}

      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="
          relative
          isolate

          flex
          h-[100dvh]
          max-h-[100dvh]

          w-full
          min-w-0
          max-w-none

          flex-col

          overflow-hidden

          bg-[#FAF9F6]

          shadow-[0_24px_80px_rgba(40,55,42,0.22)]

          sm:h-[92vh]
          sm:max-h-[92vh]
          sm:w-[680px]
          sm:max-w-[680px]

          sm:rounded-[30px]
        "
      >
        {/* ===================================================
            CLOSE BUTTON
            =================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close inquiry form"
          className="
            absolute
            right-4
            top-4
            z-50

            flex
            h-9
            w-9
            shrink-0

            items-center
            justify-center

            rounded-full

            bg-[#EEF3EB]

            text-[#6F8F72]

            transition-colors
            duration-200

            hover:bg-[#E2EBDF]
            hover:text-[#4F6653]

            active:scale-95

            sm:right-7
            sm:top-7
            sm:h-10
            sm:w-10
          "
        >
          <X
            size={19}
            strokeWidth={1.8}
          />
        </button>

        {/* ===================================================
            FIXED HEADER

            This never scrolls and never changes height
            while the user fills in the form.
            =================================================== */}

        {!submitted && (
          <div
            className="
              relative
              z-10

              shrink-0
              grow-0

              overflow-hidden

              px-5
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
                min-w-0
                items-start

                gap-2

                pr-12

                sm:gap-3
                sm:pr-14
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

              <div className="min-w-0 flex-1">
                <h2
                  id="inquiry-modal-title"
                  className="
                    mt-1

                    max-w-full

                    text-[29px]
                    leading-[1.08]
                    tracking-[-0.01em]

                    text-[#2B2B2B]

                    [font-family:var(--font-cormorant)]

                    sm:text-[40px]
                    sm:leading-[1.05]
                    sm:tracking-normal

                    lg:text-[42px]
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

                max-w-[570px]

                text-[14px]
                leading-6

                text-[#686868]

                sm:ml-[60px]
                sm:mt-5
                sm:text-[16px]
                sm:leading-7
              "
            >
              I&apos;d love to learn more about you and
              what you&apos;d like to achieve with your
              English.
            </p>

            {/* Reassurance */}

            <div
              className="
                mt-4

                flex
                flex-wrap
                items-center

                gap-x-5
                gap-y-3

                sm:ml-[60px]
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
        )}

        {/* ===================================================
            FIXED SCROLL VIEWPORT

            This area gets a FIXED available height from
            flexbox.

            Nothing inside this section can make the modal
            itself grow.

            Only this area scrolls.
            =================================================== */}

        <div
          className="
            min-h-0
            min-w-0

            flex-1
            shrink
            grow

            overflow-y-auto
            overflow-x-hidden

            overscroll-contain

            px-5
            pb-8

            [-webkit-overflow-scrolling:touch]

            [scrollbar-color:#DDE9D8_transparent]
            [scrollbar-width:thin]

            sm:px-10
            sm:pb-10
          "
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="
                min-w-0

                space-y-3

                sm:space-y-4
              "
            >
              {/* =================================================
                  NAME
                  ================================================= */}

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

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

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

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

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

                    appearance-none

                    rounded-[15px]
                    border
                    border-[#DDE5D9]

                    bg-white

                    pl-12
                    pr-16

                    text-[14px]

                    outline-none

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
                    right-3
                    top-1/2

                    -translate-y-1/2

                    text-[#6F8F72]
                  "
                >
                  *
                </span>
              </div>

              {/* =================================================
                  CONTACT ID
                  ================================================= */}

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

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

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

                    appearance-none

                    rounded-[15px]
                    border
                    border-[#DDE5D9]

                    bg-white

                    pl-12
                    pr-16

                    text-[14px]

                    outline-none

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
                    right-3
                    top-1/2

                    -translate-y-1/2

                    text-[#6F8F72]
                  "
                >
                  *
                </span>
              </div>

              {/* =================================================
                  GOAL
                  ================================================= */}

              <div className="relative min-w-0">
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
                    block
                    h-[60px]
                    w-full
                    min-w-0
                    shrink-0

                    appearance-none

                    rounded-[15px]
                    border
                    border-[#DDE5D9]

                    bg-white

                    pl-12
                    pr-16

                    text-[14px]

                    outline-none

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
                    right-3
                    top-1/2

                    -translate-y-1/2

                    text-[#6F8F72]
                  "
                >
                  *
                </span>
              </div>

              {/* =================================================
                  MESSAGE
                  ================================================= */}

              <div className="relative min-w-0">
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
                    block
                    min-h-[115px]
                    w-full
                    min-w-0
                    shrink-0

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
                    shrink-0

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
                  min-h-[52px]
                  w-full
                  shrink-0

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

                  transition-colors
                  duration-200

                  hover:bg-[#5B7960]

                  active:scale-[0.99]

                  disabled:cursor-not-allowed
                  disabled:opacity-60
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
                  shrink-0

                  items-center
                  justify-center
                  gap-2

                  px-4
                  pb-2
                  pt-2

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
          ) : (
            /* =================================================
               SUCCESS
               ================================================= */

            <div
              className="
                min-w-0

                py-8
                text-center

                sm:py-12
              "
            >
              <div
                className="
                  mx-auto

                  flex
                  h-16
                  w-16
                  shrink-0

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
          )}
        </div>
      </div>
    </div>
  );
}