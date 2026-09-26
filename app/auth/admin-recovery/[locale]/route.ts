import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidLocale } from "@/lib/i18n";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale: rawLocale } = await context.params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/portal/login?error=recovery_link_invalid`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/portal/login?error=recovery_link_invalid`,
        request.url
      )
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Admin recovery code exchange failed:", error);
    return NextResponse.redirect(
      new URL(
        `/${locale}/portal/login?error=recovery_link_invalid`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(`/${locale}/admin/reset-password`, request.url)
  );
}
