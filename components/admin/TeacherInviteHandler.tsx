"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface TeacherInviteHandlerProps {
  locale: string;
}

export default function TeacherInviteHandler({
  locale,
}: TeacherInviteHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function handleInvitation() {
      const hash = window.location.hash;

      if (!hash) {
        return;
      }

      const params = new URLSearchParams(
        hash.startsWith("#")
          ? hash.slice(1)
          : hash
      );

      const type = params.get("type");

      if (type !== "invite") {
        return;
      }

      const accessToken =
        params.get("access_token");

      const refreshToken =
        params.get("refresh_token");

      // Remove the tokens from the visible URL immediately.
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          window.location.search
      );

      if (
        !accessToken ||
        !refreshToken
      ) {
        router.replace(
          `/${locale}/admin/login?error=invalid_invitation`
        );
        return;
      }

      const supabase = createClient();

      const { error } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Teacher invitation session error:",
          error
        );

        await supabase.auth.signOut();

        router.replace(
          `/${locale}/admin/login?error=invalid_invitation`
        );

        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        cancelled
      ) {
        return;
      }

      if (
        userError ||
        !user
      ) {
        console.error(
          "Teacher invitation user verification error:",
          userError
        );

        await supabase.auth.signOut();

        router.replace(
          `/${locale}/admin/login?error=invalid_invitation`
        );

        return;
      }

      router.replace(
        `/${locale}/admin/reset-password?onboarding=teacher`
      );

      router.refresh();
    }

    void handleInvitation();

    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  return null;
}