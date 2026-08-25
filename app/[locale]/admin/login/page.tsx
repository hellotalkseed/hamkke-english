"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError) {
      setError(
        signInError.message ||
          "Unable to sign in. Please check your email and password."
      );

      setLoading(false);
      return;
    }

    router.replace(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header className="w-full px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12">
        <div className="flex items-center justify-center">
          <div className="font-sans text-[15px] font-medium text-[#6F8F72] sm:text-[16px]">
            Hamkke │ 함께
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-[520px] items-start justify-center px-6 pb-16 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
        <div className="w-full">
          <div className="text-center">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">
              Admin
            </p>

            <h1 className="mt-4 font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.035em] text-[#292929] sm:text-[54px]">
              Welcome back
            </h1>

            <p className="mx-auto mt-5 max-w-[390px] font-serif text-[18px] leading-7 text-[#6B6B66]">
              Sign in to manage your students,
              enrollments, lessons, and payments.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-12 rounded-2xl border border-[#DCD8D2] bg-[#FFFEFC] p-6 sm:p-8"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-[#DCD8D2] bg-[#FFFEFC] px-4 font-sans text-[14px] text-[#292929] outline-none transition-colors placeholder:text-[#A19F98] focus:border-[#6F8F72] focus:ring-1 focus:ring-[#6F8F72] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="mb-2 block font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                disabled={loading}
                placeholder="Your password"
                className="h-12 w-full rounded-xl border border-[#DCD8D2] bg-[#FFFEFC] px-4 font-sans text-[14px] text-[#292929] outline-none transition-colors placeholder:text-[#A19F98] focus:border-[#6F8F72] focus:ring-1 focus:ring-[#6F8F72] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-[#E1CFCB] bg-[#FBF3F1] px-4 py-3">
                <p className="font-sans text-[13px] leading-5 text-[#8A5148]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#6F8F72] px-5 font-sans text-[14px] font-medium text-white transition-colors hover:bg-[#5F805F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center font-sans text-[11px] leading-5 text-[#8A8A84]">
            Hamkke │ 함께 · Private English Lessons
          </p>
        </div>
      </section>
    </main>
  );
}
