import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    /^\/(en|ko|zh)\/admin(?:\/|$)/.test(pathname);

  const isApiRoute = pathname.startsWith("/api/");

  const isLoginPage =
    /^\/(en|ko|zh)\/admin\/login(?:\/|$)/.test(
      pathname
    );

  if (isAdminRoute && !isLoginPage && !isApiRoute) {
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
      const locale =
        pathname.match(/^\/(en|ko|zh)/)?.[1] ?? "en";

      const loginUrl = request.nextUrl.clone();

      loginUrl.pathname = `/${locale}/admin/login`;

      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}