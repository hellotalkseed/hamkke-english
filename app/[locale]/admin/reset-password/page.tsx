"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{
    locale: string;
  }>();
  const searchParams =
    useSearchParams();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const onboarding =
    searchParams.get("onboarding") ===
    "teacher";

  const supabase = createClient();

  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  /* ----------------------------------------------------------------------- */
  /* VERIFY AUTHENTICATED SESSION                                            */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (!mounted) {
          return;
        }

        if (userError || !user) {
          router.replace(
            `/${locale}/admin/login?error=invalid_session`
          );

          router.refresh();
          return;
        }

        setCheckingSession(false);
      } catch {
        if (!mounted) {
          return;
        }

        router.replace(
          `/${locale}/admin/login?error=invalid_session`
        );

        router.refresh();
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [
    locale,
    router,
    supabase.auth,
  ]);

  /* ----------------------------------------------------------------------- */
  /* UPDATE PASSWORD                                                         */
  /* ----------------------------------------------------------------------- */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "The passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(
          updateError.message
        );
        return;
      }

      if (onboarding) {
        setSuccess(
          "Your password has been created successfully. Continuing to your Teacher Agreement..."
        );

        setTimeout(() => {
          router.replace(
            `/${locale}/admin/teachers/agreement`
          );

          router.refresh();
        }, 900);

        return;
      }

      setSuccess(
        "Your password has been updated successfully."
      );

      setTimeout(() => {
        router.replace(
          `/${locale}/admin`
        );

        router.refresh();
      }, 900);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* LOADING                                                                 */
  /* ----------------------------------------------------------------------- */

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6 text-[#292929]">
        <p className="font-serif text-[17px] text-[#74716B]">
          Preparing your Hamkke account...
        </p>
      </main>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* PAGE                                                                    */
  /* ----------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 text-[#292929]">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <p className="font-sans text-[14px] font-medium tracking-[0.02em] text-[#6F8F72]">
            Hamkke │ 함께
          </p>

          <h1 className="mt-3 font-serif text-[42px] font-normal leading-tight tracking-[-0.03em]">
            {onboarding
              ? "Create Your Password"
              : "Reset Password"}
          </h1>

          <p className="mt-3 font-serif text-[18px] leading-7 text-[#666]">
            {onboarding
              ? "Create a secure password for your Hamkke teacher account."
              : "Create a new password for your Hamkke account."}
          </p>

          {onboarding && (
            <p className="mx-auto mt-3 max-w-sm font-sans text-[13px] leading-6 text-[#8A8780]">
              After creating your
              password, you&apos;ll
              continue to the Hamkke
              Teacher Agreement.
            </p>
          )}
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
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-[#D8CCBE] bg-[#FAF8F5] px-4 py-3 font-sans text-[15px] outline-none transition focus:border-[#6F8F72] focus:ring-2 focus:ring-[#E2EBDD]"
            />

            <p className="mt-2 font-sans text-[11px] leading-5 text-[#99958D]">
              Use at least 8
              characters.
            </p>
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
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
              minLength={8}
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
            {loading
              ? onboarding
                ? "Creating password..."
                : "Updating password..."
              : onboarding
                ? "Create Password"
                : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}