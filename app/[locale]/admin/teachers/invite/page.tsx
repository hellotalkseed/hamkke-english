"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type InviteResponse = {
  success?: boolean;
  message?: string;
  teacherNumber?: string;
  status?: string;
  error?: string;
};

export default function InviteTeacherPage() {
  const params = useParams<{
    locale: string;
  }>();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/teachers/invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
          }),
        }
      );

      const data =
        (await response.json()) as InviteResponse;

      if (!response.ok) {
        setError(
          data.error ||
            "Something went wrong while inviting the teacher."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Teacher invitation sent successfully. The Teacher Agreement is ready for review."
      );

      setFullName("");
      setEmail("");
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}

      <header
        className="
          w-full
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-10
          xl:px-12
        "
      >
        <div className="flex w-full items-start justify-between gap-8">
          {/* Back to Teachers */}

          <Link
            href={`/${locale}/admin/teachers`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]
              sm:text-[16px]
            "
          >
            &larr; Teachers
          </Link>

          {/* Hamkke Brand */}

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              text-right
              transition-opacity
              duration-200
              hover:opacity-70
            "
          >
            <p
              className="
                font-sans
                text-[16px]
                font-semibold
                leading-none
                tracking-[0.18em]
                text-[#6F8F72]
              "
            >
              HAMKKE │ 함께
            </p>

            <p
              className="
                mt-2
                font-serif
                text-[13px]
                font-normal
                leading-none
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              From Small Talk to Big Ideas
            </p>
          </Link>
        </div>
      </header>

      {/* PAGE CONTENT */}

      <div className="mx-auto max-w-2xl px-6 pb-12 pt-12">
        <div>
          <h1 className="font-serif text-[42px] font-normal leading-tight tracking-[-0.03em]">
            Invite Teacher
          </h1>

          <p className="mt-3 font-serif text-[18px] leading-7 text-[#666]">
            Invite a teacher to join Hamkke and
            begin their onboarding.
          </p>

          <p className="mt-3 max-w-xl font-sans text-[13px] leading-6 text-[#8A8780]">
            The teacher will remain pending until
            they review and accept the Hamkke
            Teacher Agreement.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#E7DDD1] bg-white p-7 shadow-sm sm:p-9"
        >
          <div>
            <label
              htmlFor="fullName"
              className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-[#D8CCBE] bg-[#FAF8F5] px-4 py-3 font-sans text-[15px] outline-none transition focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="email"
              className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#D8CCBE] bg-[#FAF8F5] px-4 py-3 font-sans text-[15px] outline-none transition focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
            />
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-[#F8ECE8] px-4 py-3 font-sans text-[14px] leading-6 text-[#8A5148]">
              {error}
            </p>
          )}

          {success && (
            <div className="mt-5 rounded-xl bg-[#EAF1E7] px-4 py-4">
              <p className="font-sans text-[14px] leading-6 text-[#55705A]">
                {success}
              </p>

              <Link
                href={`/${locale}/admin/teachers`}
                className="mt-3 inline-block font-sans text-[12px] font-medium text-[#6F8F72] underline underline-offset-4"
              >
                View Teachers →
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-full bg-[#6F8F72] px-6 py-3.5 font-sans text-[15px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Preparing invitation..."
              : "Send Invitation"}
          </button>
        </form>
      </div>
    </main>
  );
}