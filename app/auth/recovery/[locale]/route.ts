import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidLocale } from "@/lib/i18n";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : "en";
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}/forgot-password`;
  destination.search = "?error=invalid";
  const code = request.nextUrl.searchParams.get("code");
  if (isValidLocale(raw) && code && !request.nextUrl.searchParams.has("error")) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        destination.pathname = `/${locale}/reset-password`;
        destination.search = "";
      }
    } catch {
      // Never log callback URLs or codes. Offer a fresh request instead.
    }
  }
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
