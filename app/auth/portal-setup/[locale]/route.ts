import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidLocale } from "@/lib/i18n";

const allowedTypes = new Set<EmailOtpType>(["invite", "recovery"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const expectedEmail = (request.nextUrl.searchParams.get("email") || "").trim().toLowerCase();

  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}/portal/setup-password`;
  destination.search = "?error=invalid";

  const supabase = await createClient();

  if (!isValidLocale(rawLocale) || !tokenHash || !rawType || !allowedTypes.has(rawType) || !expectedEmail) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return noStoreRedirect(destination);
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: rawType,
    });

    const verifiedEmail = (data.user?.email || "").trim().toLowerCase();
    if (error || !data.user || !verifiedEmail || verifiedEmail !== expectedEmail) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      return noStoreRedirect(destination);
    }

    destination.search = `?email=${encodeURIComponent(verifiedEmail)}`;
    return noStoreRedirect(destination);
  } catch {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    return noStoreRedirect(destination);
  }
}

function noStoreRedirect(destination: URL) {
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
