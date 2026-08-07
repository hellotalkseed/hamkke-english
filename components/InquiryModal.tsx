"use client";

import { useState } from "react";
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to send your message. Please try again.");
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
        px-6
        backdrop-blur-sm
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          max-h-[90vh]
          w-full
          max-w-xl
          overflow-y-auto
          rounded-[2rem]
          bg-[#FAF8F5]
          p-8
          shadow-2xl
          md:p-10
        "
      >
        <button
          onClick={onClose}
          className="
            absolute
            right-6
            top-6
            rounded-full
            bg-white
            p-2
            text-[#555]
            shadow-sm
            transition
            hover:bg-gray-100
          "
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <p
              className="
                text-sm
                uppercase
                tracking-[0.3em]
                text-[#6F8F72]
              "
            >
              Hamkke │ 함께
            </p>

            <h2
              className="
                mt-5
                text-4xl
                leading-tight
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]
              "
            >
              Let's Start the Conversation
            </h2>

            <p
              className="
                mt-5
                leading-7
                text-[#5B5B5B]
              "
            >
              Tell me a little about yourself and what you'd like to
              achieve with your English. I'll personally reply within
              24 hours, answer any questions you have, and we'll take
              it from there.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
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
    px-5
    py-3
    outline-none
    focus:border-[#6F8F72]
  "
/>

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
                  px-5
                  py-3
                  outline-none
                  focus:border-[#6F8F72]
                "
              />

              <select
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white
                  px-5
                  py-3
                  text-[#555]
                  outline-none
                  focus:border-[#6F8F72]
                "
              >
                <option value="">
                  How should I contact you? (Optional)
                </option>

                <option>KakaoTalk</option>
                <option>WhatsApp</option>
                <option>WeChat</option>
              </select>

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
                  px-5
                  py-3
                  outline-none
                  focus:border-[#6F8F72]
                "
              />

              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white
                  px-5
                  py-3
                  text-[#555]
                  outline-none
                  focus:border-[#6F8F72]
                "
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

              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white
                  px-5
                  py-3
                  text-[#555]
                  outline-none
                  focus:border-[#6F8F72]
                "
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

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Anything else you'd like me to know? (Optional)"
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#DDE9D8]
                  bg-white
                  px-5
                  py-3
                  outline-none
                  focus:border-[#6F8F72]
                "
              />

              {error && (
                <p className="text-center text-sm text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-full
                  bg-[#6F8F72]
                  py-4
                  font-medium
                  text-white
                  transition
                  hover:bg-[#5B7960]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Sending..."
                  : "Start the Conversation"}
              </button>
            </form>
          </>
        ) : (
          <div className="py-10 text-center">
            <h2
              className="
                text-4xl
                leading-tight
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]
              "
            >
              Thank you!
            </h2>

            <p
              className="
                mt-6
                leading-8
                text-[#5B5B5B]
              "
            >
              I've received your message and I'll personally get back
              to you within 24 hours. I look forward to learning more
              about you and helping you on your English journey.
            </p>

            <p
              className="
                mt-8
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
  );
}