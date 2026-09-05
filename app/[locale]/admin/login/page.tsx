"use client";

import { FormEvent, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LoginRole = "owner" | "teacher";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const locale =
    typeof params.locale === "string" ? params.locale : "en";

  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<LoginRole>("teacher");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const urlError = searchParams.get("error");
  const actualRole = searchParams.get("actual");

  const roleMismatchMessage =
    urlError === "role_mismatch" &&
    (actualRole === "owner" || actualRole === "teacher")
      ? `This account is registered as a ${
          actualRole === "owner" ? "Owner" : "Teacher"
        }. Please select ${
          actualRole === "owner" ? "Owner" : "Teacher"
        } to continue.`
      : "";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      console.error("Supabase login error:", error);
      setError(error?.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    // Get the user's actual role and account status
    // from the profiles table.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      setError("We couldn't verify your account. Please try again.");
      setLoading(false);
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();

      setError("Your account profile could not be found.");
      setLoading(false);
      return;
    }

    // Only active accounts can access the admin area.
    if (profile.status !== "active") {
      await supabase.auth.signOut();

      setError("Your account is not currently active.");
      setLoading(false);
      return;
    }

    // Only Owner and Teacher accounts are allowed.
    if (profile.role !== "owner" && profile.role !== "teacher") {
      await supabase.auth.signOut();

      setError(
        "Your account does not have permission to access the admin area."
      );

      setLoading(false);
      return;
    }

    // Make sure the role selected on the login screen
    // matches the user's actual registered role.
    if (profile.role !== role) {
      await supabase.auth.signOut();

      router.push(
        `/${locale}/admin/login?error=role_mismatch&actual=${profile.role}`
      );

      return;
    }

    // Send each role to its correct dashboard.
    if (profile.role === "teacher") {
      router.push(`/${locale}/admin/teachers`);
    } else {
      router.push(`/${locale}/admin`);
    }

    router.refresh();
  }

  async function handleForgotPassword() {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    const redirectTo =
      `${window.location.origin}/${locale}/admin/reset-password`;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo,
        }
      );

    if (error) {
      setError(error.message);
      setResetLoading(false);
      return;
    }

    setSuccess(
      "If an account exists with this email, a password reset link has been sent."
    );

    setResetLoading(false);
  }

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#FAF8F5]
        px-6
        py-16
        text-[#292929]
      "
    >
      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="text-center">
          <p
            className="
              font-sans
              text-[14px]
              font-medium
              tracking-[0.02em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>

          <h1
            className="
              mt-5
              font-serif
              text-[48px]
              font-normal
              leading-tight
              tracking-[-0.03em]
            "
          >
            Admin
          </h1>

          <p
            className="
              mt-4
              font-serif
              text-[19px]
              leading-7
              text-[#666]
            "
          >
            Sign in to manage your students and lessons.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="
            mt-10
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7
            shadow-sm
            sm:p-9
          "
        >

          {/* ROLE SELECTOR */}

          <div>
            <p
              className="
                font-sans
                text-[12px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[#6F8F72]
              "
            >
              Sign in as
            </p>

            <div
              className="
                mt-3
                grid
                grid-cols-2
                gap-2
                rounded-2xl
                bg-[#F3F0EB]
                p-1
              "
            >
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`
                  rounded-xl
                  px-4
                  py-3
                  font-sans
                  text-[14px]
                  font-medium
                  transition
                  ${
                    role === "owner"
                      ? "bg-white text-[#292929] shadow-sm"
                      : "text-[#777] hover:text-[#292929]"
                  }
                `}
              >
                Owner
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`
                  rounded-xl
                  px-4
                  py-3
                  font-sans
                  text-[14px]
                  font-medium
                  transition
                  ${
                    role === "teacher"
                      ? "bg-white text-[#292929] shadow-sm"
                      : "text-[#777] hover:text-[#292929]"
                  }
                `}
              >
                Teacher
              </button>
            </div>
          </div>

          {/* EMAIL */}

          <div className="mt-7">
            <label
              htmlFor="email"
              className="
                font-sans
                text-[12px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[#6F8F72]
              "
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
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[15px]
                outline-none
                transition
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#E2EBDD]
              "
            />
          </div>

          {/* PASSWORD */}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#6F8F72]
                "
              >
                Password
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="
                  font-sans
                  text-[13px]
                  text-[#6F8F72]
                  transition
                  hover:underline
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {resetLoading
                  ? "Sending..."
                  : "Forgot password?"}
              </button>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[15px]
                outline-none
                transition
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#E2EBDD]
              "
            />
          </div>

          {/* ROLE MISMATCH */}

          {roleMismatchMessage && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-[#D8E3D4]
                bg-[#EAF1E7]
                px-4
                py-3
              "
            >
              <p
                className="
                  font-sans
                  text-[14px]
                  font-medium
                  leading-6
                  text-[#55705A]
                "
              >
                {roleMismatchMessage}
              </p>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <p
              className="
                mt-5
                rounded-xl
                bg-[#F8ECE8]
                px-4
                py-3
                font-sans
                text-[14px]
                leading-6
                text-[#8A5148]
              "
            >
              {error}
            </p>
          )}

          {/* SUCCESS */}

          {success && (
            <p
              className="
                mt-5
                rounded-xl
                bg-[#EAF1E7]
                px-4
                py-3
                font-sans
                text-[14px]
                leading-6
                text-[#55705A]
              "
            >
              {success}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-7
              w-full
              rounded-full
              bg-[#6F8F72]
              px-6
              py-3.5
              font-sans
              text-[15px]
              font-medium
              text-white
              transition
              hover:bg-[#5F7F63]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Signing in..."
              : `Sign in as ${
                  role === "owner"
                    ? "Owner"
                    : "Teacher"
                }`}
          </button>
        </form>
      </div>
    </main>
  );
}