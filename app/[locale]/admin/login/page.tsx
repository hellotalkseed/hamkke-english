"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("The email or password is incorrect.");
      setLoading(false);
      return;
    }

    router.push(`/${window.location.pathname.split("/")[1]}/admin`);
    router.refresh();
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
          <div>
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

          <div className="mt-6">
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}