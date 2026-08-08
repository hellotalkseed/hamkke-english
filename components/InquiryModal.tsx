"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssessmentModal({
  isOpen,
  onClose,
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

  /*
   * Prevent the page behind the modal from scrolling.
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  /*
   * Close modal with Escape key.
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-black/40
        px-4
        py-4
        backdrop-blur-sm

        sm:px-6
        sm:py-6
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="
          relative

          flex
          w-full
          max-w-xl
          flex-col

          overflow-hidden

          rounded-[1.75rem]
          bg-[#FAF8F5]

          shadow-2xl

          max-h-[calc(100dvh-2rem)]

          sm:max-h-[90vh]
          sm:rounded-[2rem]
        "
      >
        {/* ================= HEADER ================= */}

        <div
          className="
            relative
            shrink-0

            px-6
            pb-5
            pt-7

            sm:px-10
            sm:pb-6
            sm:pt-9
          "
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inquiry form"
            className="
              absolute
              right-5
              top-5

              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full
              bg-white

              text-[#555]

              shadow-sm

              transition-all
              duration-200

              hover:bg-[#EEF5EE]
              hover:text-[#2B2B2B]

              active:scale-95

              sm:right-7
              sm:top-7
            "
          >
            <X size={18} />
          </button>

          {!submitted && (
            <>
              <p
                className="
                  pr-12

                  text-[11px]
                  uppercase
                  tracking-[0.3em]
                  text-[#6F8F72]

                  sm:text-xs
                "
              >
                Hamkke │ 함께
              </p>

              <h2
                id="inquiry-modal-title"
                className="
                  mt-4
                  pr-8

                  text-[34px]
                  leading-[1.05]
                  text-[#2B2B2B]

                  [font-family:var(--font-cormorant)]

                  sm:mt-5
                  sm:text-4xl
                "
              >
                Let&apos;s Start the Conversation
              </h2>

              <p
                className="
                  mt-4
                  max-w-lg

                  text-[15px]
                  leading-7
                  text-[#5B5B5B]

                  sm:mt-5
                  sm:text-base
                "
              >
                Tell me a little about yourself and what
                you&apos;d like to achieve with your English.
                I&apos;ll personally reply within 24 hours and
                we&apos;ll take it from there.
              </p>

              <div
                className="
                  mt-4

                  text-xs
                  text-[#7A7A7A]
                "
              >
                Personal reply within 24 hours
                <span className="mx-2 text-[#C8D6C4]">
                  ·
                </span>
                Your information is safe with me
              </div>
            </>
          )}
        </div>

        {/* ================= SCROLLABLE CONTENT ================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto

            overscroll-contain

            px-6
            pb-7

            sm:px-10
            sm:pb-9

            [scrollbar-width:thin]
            [scrollbar-color:#DDE9D8_transparent]
          "
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="
                space-y-4

                sm:space-y-5
              "
            >
              {/* Name */}

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="What should I call you? (English name or nickname)"
                required
                className="
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]
                  text-[#2B2B2B]

                  placeholder:text-[#888]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5
                "
              />

              {/* Email */}

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]
                  text-[#2B2B2B]

                  placeholder:text-[#888]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5
                "
              />

              {/* Contact Method */}

              <select
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className={`
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5

                  ${
                    formData.contactMethod
                      ? "text-[#2B2B2B]"
                      : "text-[#888]"
                  }
                `}
              >
                <option value="">
                  How should I contact you? (Optional)
                </option>

                <option>KakaoTalk</option>
                <option>WhatsApp</option>
                <option>WeChat</option>
              </select>

              {/* Contact ID */}

              <input
                type="text"
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                placeholder="Your ID / Username / Phone Number (Optional)"
                className="
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]
                  text-[#2B2B2B]

                  placeholder:text-[#888]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5
                "
              />

              {/* English Level */}

              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className={`
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5

                  ${
                    formData.level
                      ? "text-[#2B2B2B]"
                      : "text-[#888]"
                  }
                `}
              >
                <option value="">
                  How would you describe your English level?
                </option>

                <option>Beginner</option>
                <option>Elementary</option>
                <option>Intermediate</option>
                <option>Upper Intermediate</option>
                <option>Advanced</option>
                <option>Not sure</option>
              </select>

              {/* Goal */}

              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                className={`
                  w-full

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5

                  ${
                    formData.goal
                      ? "text-[#2B2B2B]"
                      : "text-[#888]"
                  }
                `}
              >
                <option value="">
                  What would you like to focus on?
                </option>

                <option>Everyday Conversation</option>
                <option>Business English</option>
                <option>Travel English</option>
                <option>Interview Preparation</option>
                <option>Pronunciation</option>
                <option>Grammar</option>
                <option>Vocabulary</option>
              </select>

              {/* Message */}

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Anything else you&apos;d like me to know? (Optional)"
                className="
                  min-h-[110px]
                  w-full
                  resize-y

                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white

                  px-4
                  py-3.5

                  text-[15px]
                  leading-6
                  text-[#2B2B2B]

                  placeholder:text-[#888]

                  outline-none

                  transition
                  duration-200

                  focus:border-[#6F8F72]
                  focus:ring-2
                  focus:ring-[#6F8F72]/10

                  sm:px-5
                "
              />

              {error && (
                <p
                  className="
                    rounded-xl
                    bg-[#FDF0F0]
                    px-4
                    py-3

                    text-center
                    text-sm
                    text-red-500
                  "
                >
                  {error}
                </p>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full

                  rounded-full
                  bg-[#6F8F72]

                  py-3.5

                  text-sm
                  font-medium
                  text-white

                  shadow-sm

                  transition-all
                  duration-200

                  hover:bg-[#5B7960]
                  hover:shadow-md

                  active:scale-[0.99]

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:py-4
                "
              >
                {loading
                  ? "Sending..."
                  : "Start the Conversation"}
              </button>

              <p
                className="
                  px-3
                  text-center

                  text-[11px]
                  leading-5
                  text-[#999]
                "
              >
                I&apos;ll only use your information to respond
                to your inquiry.
              </p>
            </form>
          ) : (
            /* ================= SUCCESS ================= */

            <div className="py-8 text-center sm:py-10">
              <h2
                className="
                  text-[38px]
                  leading-tight
                  text-[#2B2B2B]

                  [font-family:var(--font-cormorant)]

                  sm:text-4xl
                "
              >
                Thank you!
              </h2>

              <p
                className="
                  mt-5
                  leading-8
                  text-[#5B5B5B]
                "
              >
                I&apos;ve received your message and I&apos;ll
                personally get back to you within 24 hours. I
                look forward to learning more about you and
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