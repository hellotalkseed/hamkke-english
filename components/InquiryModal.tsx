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

const iconClass = "h-[20px] w-[20px] shrink-0 text-[#6F8F72]";

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

  /*
  ============================================================
  BODY LOCK
  ============================================================

  We lock the page behind the modal, but we deliberately DO NOT
  use:

  - visualViewport
  - keyboard detection
  - viewport calculations
  - scrollIntoView()
  - window.scrollTo()
  - fixed body positioning

  The browser is allowed to handle input focus and the keyboard
  naturally.

  This is important on iOS Safari.
  ============================================================
  */

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior =
      body.style.overscrollBehavior;

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscrollBehavior =
      html.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior =
        previousBodyOverscrollBehavior;

      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior =
        previousHtmlOverscrollBehavior;
    };
  }, [isOpen]);

  /*
  ============================================================
  ESCAPE KEY
  ============================================================
  */

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

  /*
  ============================================================
  RESET SUCCESS / ERROR STATE WHEN OPENING
  ============================================================
  */

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError("");
    }
  }, [isOpen, source]);

  /*
  ============================================================
  FORM CHANGE
  ============================================================
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
  ============================================================
  FORM SUBMIT
  ============================================================
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
    /*
    ============================================================
    BACKDROP

    This is fixed to the viewport and sits above the entire
    website.

    Nothing underneath it can receive pointer interaction.
    ============================================================
    */
    <div
      className="
        fixed
        inset-0
        z-[100]

        h-[100svh]
        w-full

        overflow-hidden

        bg-[#253026]/45
        backdrop-blur-[4px]

        overscroll-none
      "
      role="presentation"
      onPointerDown={(event) => {
        /*
        Only the actual backdrop closes the modal.

        Clicking anything inside the modal cannot close it.
        */
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/*
      ============================================================
      MODAL SHELL

      IMPORTANT:

      Mobile:
        100svh
        stable height
        does NOT intentionally follow keyboard height

      Desktop:
        92vh
        max-width 680px
        rounded card
      ============================================================
      */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="
          relative
          mx-auto

          flex
          h-[100svh]
          max-h-[100svh]
          w-full
          flex-col

          overflow-hidden

          bg-[#FAF9F6]

          shadow-[0_24px_80px_rgba(40,55,42,0.22)]

          sm:my-[4vh]
          sm:h-[92vh]
          sm:max-h-[92vh]
          sm:max-w-[680px]

          sm:rounded-[30px]
        "
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/*
        ============================================================
        CLOSE BUTTON

        This is deliberately OUTSIDE the scrolling content.

        Therefore:

        - scrolling the form does not move the X
        - typing does not move the X
        - the student can always cancel
        - the heading/form can scroll independently
        ============================================================
        */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close inquiry form"
          className="
            absolute
            right-4
            top-4
            z-[60]

            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-full

            bg-[#EEF3EB]

            text-[#6F8F72]

            shadow-[0_4px_16px_rgba(40,55,42,0.06)]

            transition-colors
            duration-200

            hover:bg-[#E2EBDF]
            hover:text-[#4F6653]

            active:scale-95

            sm:right-7
            sm:top-7
            sm:h-11
            sm:w-11
          "
        >
          <X
            size={20}
            strokeWidth={1.8}
          />
        </button>

        {/*
        ============================================================
        SINGLE SCROLL CONTAINER

        This contains BOTH:

        - heading
        - introduction
        - reassurance
        - form

        So the heading can scroll away naturally.

        More importantly, the browser can scroll this container
        when an input receives focus without changing the modal's
        actual dimensions.
        ============================================================
        */}

        <div
          className="
            min-h-0
            flex-1

            overflow-x-hidden
            overflow-y-auto

            overscroll-contain

            [-webkit-overflow-scrolling:touch]

            [scrollbar-color:#DDE9D8_transparent]
            [scrollbar-width:thin]
          "
        >
          {!submitted ? (
            <>
              {/*
              ========================================================
              HEADER
              ========================================================
              */}

              <div
                className="
                  shrink-0

                  px-5
                  pb-5
                  pt-7

                  sm:px-10
                  sm:pb-6
                  sm:pt-10
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-2

                    pr-14

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

                  <div className="min-w-0">
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

              {/*
              ========================================================
              FORM
              ========================================================
              */}

              <div
                className="
                  px-5
                  pb-10

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
                  {/*
                  ======================================================
                  NAME
                  ======================================================
                  */}

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
                      autoComplete="name"
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

                        transition-colors
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

                  {/*
                  ======================================================
                  EMAIL
                  ======================================================
                  */}

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
                      autoComplete="email"
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

                        transition-colors
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

                  {/*
                  ======================================================
                  CONTACT METHOD
                  ======================================================
                  */}

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

                        transition-colors
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
                        right-4
                        top-1/2
                        -translate-y-1/2

                        text-[#6F8F72]
                      "
                    >
                      *
                    </span>
                  </div>

                  {/*
                  ======================================================
                  CONTACT ID
                  ======================================================
                  */}

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

                        transition-colors
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

                  {/*
                  ======================================================
                  LEVEL
                  ======================================================
                  */}

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

                        transition-colors
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
                        right-4
                        top-1/2
                        -translate-y-1/2

                        text-[#6F8F72]
                      "
                    >
                      *
                    </span>
                  </div>

                  {/*
                  ======================================================
                  GOAL
                  ======================================================
                  */}

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

                        transition-colors
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
                        right-4
                        top-1/2
                        -translate-y-1/2

                        text-[#6F8F72]
                      "
                    >
                      *
                    </span>
                  </div>

                  {/*
                  ======================================================
                  MESSAGE
                  ======================================================
                  */}

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

                        transition-colors
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

                  {/*
                  ======================================================
                  ERROR
                  ======================================================
                  */}

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

                  {/*
                  ======================================================
                  SUBMIT
                  ======================================================
                  */}

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

                  {/*
                  ======================================================
                  PRIVACY
                  ======================================================
                  */}

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
            </>
          ) : (
            /*
            ============================================================
            SUCCESS
            ============================================================
            */

            <div
              className="
                px-5
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
          )}
        </div>
      </div>
    </div>
  );
}