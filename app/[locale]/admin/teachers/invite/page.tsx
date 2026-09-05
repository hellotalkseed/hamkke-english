"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function InviteTeacherPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/teachers/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess("Teacher invitation sent successfully.");
      setFullName("");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 text-[#292929]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/en/admin/teachers"
          className="font-sans text-[14px] text-[#6F8F72] hover:underline"
        >
          ← Back to Teachers
        </Link>

        <div className="mt-8">
          <p className="font-sans text-[14px] font-medium tracking-[0.02em] text-[#6F8F72]">
            Hamkke │ 함께
          </p>

          <h1 className="mt-3 font-serif text-[42px] font-normal leading-tight tracking-[-0.03em]">
            Invite Teacher
          </h1>

          <p className="mt-3 font-serif text-[18px] leading-7 text-[#666]">
            Send an invitation to a teacher to join Hamkke.
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
              onChange={(event) => setFullName(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
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
            <p className="mt-5 rounded-xl bg-[#EAF1E7] px-4 py-3 font-sans text-[14px] leading-6 text-[#55705A]">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-full bg-[#6F8F72] px-6 py-3.5 font-sans text-[15px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending invitation..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </main>
  );
}