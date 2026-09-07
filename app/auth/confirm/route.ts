import {
  type EmailOtpType,
} from "@supabase/supabase-js";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest
) {
  const { searchParams } =
    new URL(request.url);

  const tokenHash =
    searchParams.get("token_hash");

  const type =
    searchParams.get(
      "type"
    ) as EmailOtpType | null;

  const locale =
    searchParams.get("locale") || "en";

  /*
   * After a successful invitation verification,
   * the teacher already has an authenticated
   * Supabase session.
   *
   * Their next onboarding step is creating
   * their own password.
   */
  const successUrl =
    request.nextUrl.clone();

  successUrl.pathname =
    `/${locale}/admin/reset-password`;

  successUrl.search = "";

  successUrl.searchParams.set(
    "onboarding",
    "teacher"
  );

  /*
   * If the invitation cannot be verified,
   * return the teacher to the Hamkke login page
   * with a safe error indicator.
   */
  const errorUrl =
    request.nextUrl.clone();

  errorUrl.pathname =
    `/${locale}/admin/login`;

  errorUrl.search = "";

  errorUrl.searchParams.set(
    "error",
    "invalid_invitation"
  );

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      errorUrl
    );
  }

  /*
   * Hamkke uses this endpoint specifically for
   * invitation confirmation.
   *
   * Do not allow an unrelated OTP type to use
   * the teacher onboarding route.
   */
  if (type !== "invite") {
    return NextResponse.redirect(
      errorUrl
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

  if (error) {
    console.error(
      "Invitation verification error:",
      error
    );

    return NextResponse.redirect(
      errorUrl
    );
  }

  return NextResponse.redirect(
    successUrl
  );
}