import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: studentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles").select("role, status").eq("id", user.id).single();
    if (profileError || !profile || profile.role !== "owner" || profile.status !== "active") {
      return NextResponse.json({ error: "Only active owners can invite students to the portal." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action === "resend" ? "resend" : "invite";

    const { data: student, error: studentError } = await admin
      .from("students").select("id, full_name, preferred_name, email").eq("id", studentId).single();
    if (studentError || !student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    const email = String(student.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Add an email address to the student record first." }, { status: 400 });

    const [{ data: directActive }, { data: sharedLinks }] = await Promise.all([
      admin.from("enrollments").select("id").eq("student_id", studentId).eq("status", "active").limit(1),
      admin.from("enrollment_students").select("enrollment_id").eq("student_id", studentId),
    ]);
    let hasActiveEnrollment = Boolean(directActive?.length);
    if (!hasActiveEnrollment && sharedLinks?.length) {
      const ids = [...new Set(sharedLinks.map((row) => row.enrollment_id).filter(Boolean))];
      if (ids.length) {
        const { data, error } = await admin.from("enrollments").select("id").in("id", ids).eq("status", "active").limit(1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        hasActiveEnrollment = Boolean(data?.length);
      }
    }
    if (!hasActiveEnrollment) {
      return NextResponse.json({ error: "Only students with an active enrollment can be invited to the portal." }, { status: 400 });
    }

    const { data: existingLink, error: linkError } = await admin
      .from("portal_account_students").select("account_user_id").eq("student_id", studentId).maybeSingle();
    if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });

    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    const requestedLocale = requestUrl.searchParams.get("locale");
    const locale = requestedLocale && ["en", "ko", "zh", "ja"].includes(requestedLocale) ? requestedLocale : "en";
    const displayName = String(student.preferred_name || student.full_name || email).trim();
    const setupUrl = `${origin}/${locale}/portal/setup-password?email=${encodeURIComponent(email)}`;

    if (action === "resend") {
      if (!existingLink?.account_user_id) {
        return NextResponse.json({ error: "No portal account is linked to this student yet." }, { status: 409 });
      }
      const { data: linkedAuth, error: linkedAuthError } = await admin.auth.admin.getUserById(existingLink.account_user_id);
      if (linkedAuthError || !linkedAuth.user) {
        return NextResponse.json({ error: linkedAuthError?.message || "The linked portal user could not be found." }, { status: 404 });
      }
      const linkedEmail = String(linkedAuth.user.email || "").trim().toLowerCase();
      if (!linkedEmail || linkedEmail !== email) {
        return NextResponse.json({ error: "The student record email does not match the linked portal account." }, { status: 409 });
      }

      if (linkedAuth.user.email_confirmed_at) {
        // Server-side resetPasswordForEmail starts a PKCE recovery flow in the
        // server's context, so a different browser cannot finish it. Generate a
        // one-time recovery action link instead and deliver it through Hamkke's
        // verified Resend sender. The link authenticates the correct user before
        // returning to the student password-setup page.
        const { data: generated, error: generateError } = await admin.auth.admin.generateLink({
          type: "recovery",
          email,
        });
        const tokenHash = generated?.properties?.hashed_token;
        if (generateError || !tokenHash) {
          return NextResponse.json({ error: generateError?.message || "A new setup link could not be created." }, { status: 400 });
        }

        // Do not send Supabase's generated action_link directly. That link
        // normally returns the session in the browser URL, which is not
        // available to our server-rendered setup page. Instead, send the
        // hashed one-time token to our own callback. The callback verifies the
        // token server-side, stores the correct student's session in cookies,
        // and only then opens the password setup page.
        const callbackUrl = new URL(`/auth/portal-setup/${locale}`, origin);
        callbackUrl.searchParams.set("token_hash", tokenHash);
        callbackUrl.searchParams.set("type", "recovery");
        callbackUrl.searchParams.set("email", email);

        const { error: mailError } = await resend.emails.send({
          from: "Hamkke English <portal@hamkkeenglish.com>",
          to: email,
          subject: "Set up your Hamkke Student Portal password",
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#293A30"><h2>Hamkke Student Portal</h2><p>Hello ${escapeHtml(displayName)},</p><p>Use the secure link below to create a new password for your Hamkke Student Portal account.</p><p><a href="${callbackUrl.toString()}">Create your password</a></p><p>If you did not expect this email, you can ignore it.</p></div>`,
        });
        if (mailError) return NextResponse.json({ error: mailError.message }, { status: 400 });
      } else {
        const { error: reinviteError } = await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: setupUrl,
          data: { display_name: displayName, account_type: "student" },
        });
        if (reinviteError) return NextResponse.json({ error: reinviteError.message }, { status: 400 });
      }

      const { error: statusError } = await admin.from("portal_accounts")
        .update({ status: "invited" }).eq("user_id", existingLink.account_user_id);
      if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });
      return NextResponse.json({ ok: true, mode: "setup", message: "A new setup email was sent. Portal status will become Active after the student creates their password." });
    }

    if (existingLink) {
      return NextResponse.json({ error: "A portal account is already linked to this student. Use Resend Invitation instead." }, { status: 409 });
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: setupUrl,
      data: { display_name: displayName, account_type: "student" },
    });
    if (inviteError || !invited.user) {
      return NextResponse.json({ error: inviteError?.message || "Student account could not be created." }, { status: 400 });
    }

    const accountUserId = invited.user.id;
    const { error: accountError } = await admin.from("portal_accounts").insert({
      user_id: accountUserId, display_name: displayName, account_type: "student", status: "invited",
    });
    if (accountError) {
      await admin.auth.admin.deleteUser(accountUserId);
      return NextResponse.json({ error: accountError.message }, { status: 500 });
    }
    const { error: studentLinkError } = await admin.from("portal_account_students").insert({
      account_user_id: accountUserId, student_id: studentId,
    });
    if (studentLinkError) {
      await admin.from("portal_accounts").delete().eq("user_id", accountUserId);
      await admin.auth.admin.deleteUser(accountUserId);
      return NextResponse.json({ error: studentLinkError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, mode: "invite", message: "Invitation sent. Portal status will become Active after the student creates their password." });
  } catch (error) {
    console.error("STUDENT PORTAL INVITE ERROR", error);
    return NextResponse.json({ error: "Unable to send the portal invitation." }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
}
