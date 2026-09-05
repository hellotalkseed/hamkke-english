"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Your password has been updated successfully.");

    setTimeout(() => {
      router.push("/en/admin");
      router.refresh();
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 text-[#292929]">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="font-sans text-[14px] font-medium tracking-[0.02em] text-[#6F8F72]">
            Hamkke │ 함께
          </p>

          <h1 className="mt-3 font-serif text-[42px] font-normal leading-tight tracking-[-0.03em]">
            Reset Password
          </h1>

          <p className="mt-3 font-serif text-[18px] leading-7 text-[#666]">
            Create a new password for your Hamkke account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#E7DDD1] bg-white p-7 shadow-sm sm:p-9"
        >
          <div>
            <label
              htmlFor="password"
              className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
            >
              New Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-[#D8CCBE] bg-[#FAF8F5] px-4 py-3 font-sans text-[15px] outline-none transition focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="confirmPassword"
              className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              autoComplete="new-password"
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
            {loading ? "Updating password..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}