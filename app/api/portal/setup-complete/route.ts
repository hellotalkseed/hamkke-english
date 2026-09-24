import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: account, error: accountError } = await admin
      .from("portal_accounts")
      .select("user_id, account_type, status, display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (accountError || !account || account.account_type !== "student") {
      return NextResponse.json({ error: "Student portal account not found." }, { status: 403 });
    }

    const { data: link, error: linkError } = await admin
      .from("portal_account_students")
      .select("student_id")
      .eq("account_user_id", user.id)
      .maybeSingle();
    if (linkError || !link) return NextResponse.json({ error: "Student portal link not found." }, { status: 403 });

    const { data: student, error: studentError } = await admin
      .from("students")
      .select("email, full_name, preferred_name")
      .eq("id", link.student_id)
      .single();

    const authEmail = user.email.trim().toLowerCase();
    const studentEmail = String(student?.email || "").trim().toLowerCase();
    if (studentError || !studentEmail || studentEmail !== authEmail) {
      return NextResponse.json({ error: "Portal account email does not match the student record." }, { status: 403 });
    }

    // setup-complete may be called more than once by the browser. Only the
    // real invited -> active transition is allowed to trigger the welcome mail.
    if (account.status === "active") {
      return NextResponse.json({ ok: true, alreadyActive: true });
    }
    if (account.status !== "invited") {
      return NextResponse.json({ error: "This portal account cannot be activated from its current status." }, { status: 409 });
    }

    const { data: activated, error: updateError } = await admin
      .from("portal_accounts")
      .update({ status: "active" })
      .eq("user_id", user.id)
      .eq("status", "invited")
      .select("user_id")
      .maybeSingle();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Another request may have completed the transition first. In that case,
    // do not send a duplicate welcome email.
    if (!activated) {
      return NextResponse.json({ ok: true, alreadyActive: true });
    }

    const displayName = String(student.preferred_name || student.full_name || account.display_name || "there").trim();
    const origin = new URL(request.url).origin;
    const portalUrl = `${origin}/en/portal`;

    // Welcome email is helpful, but email delivery must never undo or block a
    // successfully activated portal account.
    try {
      const { error: mailError } = await resend.emails.send({
        from: "Hamkke English <portal@hamkkeenglish.com>",
        to: studentEmail,
        subject: "Welcome to Hamkke - Your Student Portal is ready",
        html: welcomeEmailHtml(displayName, portalUrl),
      });
      if (mailError) console.error("STUDENT PORTAL WELCOME EMAIL ERROR", mailError);
    } catch (mailError) {
      console.error("STUDENT PORTAL WELCOME EMAIL ERROR", mailError);
    }

    return NextResponse.json({ ok: true, activated: true });
  } catch (error) {
    console.error("STUDENT PORTAL SETUP COMPLETE ERROR", error);
    return NextResponse.json({ error: "Unable to activate the student portal account." }, { status: 500 });
  }
}

function welcomeEmailHtml(name: string, portalUrl: string) {
  const safeName = escapeHtml(name);
  const safePortalUrl = escapeHtml(portalUrl);

  return `
    <div style="margin:0;background:#FFFDF8;padding:32px 16px;font-family:Arial,sans-serif;color:#293A30;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E8E4DC;border-radius:18px;padding:36px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;letter-spacing:.14em;color:#6F8F72;">HAMKKE | 함께</p>
        <h1 style="margin:0 0 20px;font-size:28px;font-weight:600;color:#293A30;">Welcome to Hamkke, ${safeName} 🌱</h1>
        <p style="margin:0 0 16px;line-height:1.7;">Your Student Portal is ready.</p>
        <p style="margin:0 0 18px;line-height:1.7;">You can now use your portal to keep track of your lessons, attendance, enrollment details, and progress with Hamkke.</p>
        <p style="margin:0 0 10px;font-weight:700;">In your portal, you can:</p>
        <ul style="margin:0 0 22px;padding-left:22px;line-height:1.8;">
          <li>Check your next and upcoming lessons</li>
          <li>View your regular class schedule</li>
          <li>Review your attendance</li>
          <li>See your current and previous enrollments</li>
          <li>Access your lesson agreement</li>
          <li>View progress reports when they become available</li>
        </ul>
        <p style="margin:0 0 24px;line-height:1.7;">You can sign in anytime using the email address and password you just created.</p>
        <p style="margin:0 0 26px;line-height:1.7;">We're happy to have you learning with us.</p>
        <p style="margin:0 0 26px;"><a href="${safePortalUrl}" style="display:inline-block;background:#6F8F72;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">Open Student Portal</a></p>
        <div style="border-top:1px solid #EEEAE3;padding-top:20px;">
          <p style="margin:0;font-weight:700;color:#6F8F72;">Hamkke | 함께</p>
          <p style="margin:6px 0 0;font-family:Georgia,serif;font-style:italic;color:#6F8F72;">From Small Talk to Big Ideas.</p>
        </div>
      </div>
    </div>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
}
