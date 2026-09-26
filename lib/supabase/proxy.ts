import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const pathname = request.nextUrl.pathname;
  const match = pathname.match(/^\/(en|ko|zh|ja)\/(admin|portal)(?:\/|$)/);
  if (!match) return response;
  const [, locale, area] = match;
  // Refresh cookies on login pages too, but don't redirect those pages.
  const { data, error } = await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  function go(path: string) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  const isLogin = new RegExp(`^/${locale}/${area}/login(?:/|$)`).test(pathname);
  const isPortalSetup = area === "portal" && new RegExp(`^/${locale}/portal/setup-password(?:/|$)`).test(pathname);
  if (isLogin || isPortalSetup) return response;
  if (error || !data?.claims?.sub) return go(`/${locale}/portal/login`);

  if (area === "admin") {
    const { data: profile, error: profileError } = await supabase.from("profiles")
      .select("role,status").eq("id", data.claims.sub).maybeSingle();
    const allowed = !profileError && (
      (profile?.role === "owner" && profile.status === "active") ||
      (profile?.role === "teacher" && ["active", "pending"].includes(profile.status))
    );
    if (!allowed) return go(`/${locale}/portal/login`);
  }
  // Portal account status and learner authorization are checked in the page/RPC.
  // API handlers must continue to perform their own authorization.
  return response;
}
