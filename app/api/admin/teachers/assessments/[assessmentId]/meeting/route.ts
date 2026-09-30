import { randomUUID, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ assessmentId: string }> };
const fields = "id,teacher_id,email,learner_name,preferred_platform,timezone,assessment_date,assessment_time,status,converted_student_id,meeting_link,meeting_instructions,meeting_revision,meeting_sent_revision,meeting_sent_at";
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
async function load(context: Context) {
  const { assessmentId } = await context.params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: fail("Please sign in.", 401) };
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id,role,status").eq("id", user.id).single();
  if (!profile || profile.status !== "active" || !["owner", "admin", "teacher"].includes(profile.role)) return { error: fail("Access denied.", 403) };
  const { data: booking, error } = await admin.from("assessment_bookings").select(fields).eq("id", assessmentId).maybeSingle();
  if (error) { console.error("Meeting details load failed", error); return { error: fail("Unable to load meeting details. Check that the meeting-details SQL migration has been applied.", 500) }; }
  if (!booking) return { error: fail("Assessment not found.", 404) };
  if (profile.role === "teacher" && booking.teacher_id !== user.id) return { error: fail("Access denied.", 403) };
  return { admin, booking };
}
function details(b: { meeting_link: string | null; meeting_instructions: string | null; meeting_revision: string; meeting_sent_revision: string | null; meeting_sent_at: string | null; email: string; preferred_platform: string; status: string; converted_student_id: string | null }) {
  return { link: b.meeting_link || "", instructions: b.meeting_instructions || "", revision: b.meeting_revision,
    sentRevision: b.meeting_sent_revision, sentAt: b.meeting_sent_at, email: b.email, platform: b.preferred_platform,
    editable: b.status === "confirmed" && !b.converted_student_id };
}
export async function GET(_request: Request, context: Context) {
  const result = await load(context);
  return "error" in result ? result.error : NextResponse.json(details(result.booking));
}
async function change(request: Request, context: Context, send: boolean) {
  try {
    const result = await load(context);
    if ("error" in result) return result.error;
    const { admin, booking: b } = result;
    if (b.status !== "confirmed" || b.converted_student_id) return fail("Meeting details can only be changed or sent for a confirmed assessment.", 409);
    const body = await request.json().catch(() => null);
    if (!body || body.revision !== b.meeting_revision) return fail("These details changed. Reload before continuing.", 409);
    if (!send) {
      if (typeof body.link !== "string" || typeof body.instructions !== "string") return fail("Enter a meeting link or connection instructions.");
      const link = body.link.trim(); const instructions = body.instructions.trim();
      if (link.length > 2048 || instructions.length > 3000) return fail("Use a link under 2,048 characters and instructions under 3,000 characters.");
      if (link) {
        try { const url = new URL(link); if (url.protocol !== "https:" || url.username || url.password) return fail("Use a complete HTTPS meeting link without embedded credentials."); }
        catch { return fail("Enter a valid HTTPS meeting link."); }
      }
      if (!link && !instructions) return fail("Add a meeting link or connection instructions.");
      if (link === (b.meeting_link || "") && instructions === (b.meeting_instructions || "")) return NextResponse.json(details(b));
      const { data, error } = await admin.from("assessment_bookings")
        .update({ meeting_link: link || null, meeting_instructions: instructions || null, meeting_revision: randomUUID() })
        .eq("id", b.id).eq("teacher_id", b.teacher_id).eq("status", "confirmed").is("converted_student_id", null)
        .eq("meeting_revision", b.meeting_revision).select(fields).maybeSingle();
      if (error) return fail("Unable to save meeting details.", 500);
      if (!data) return fail("The assessment changed. Reload before saving.", 409);
      return NextResponse.json(details(data));
    }
    if (!b.meeting_link && !b.meeting_instructions) return fail("Save meeting details before sending.");
    if (b.meeting_sent_revision === b.meeting_revision) return NextResponse.json({ ...details(b), message: "These saved details have already been emailed." });
    if (!process.env.RESEND_API_KEY) return fail("Email sending is not configured. Your saved details are safe.", 503);
    let schedule: string;
    try {
      schedule = new Intl.DateTimeFormat("en", { timeZone: b.timezone, dateStyle: "full", timeStyle: "short" })
        .format(new Date(`${b.assessment_date}T${b.assessment_time.slice(0, 8)}+08:00`));
    } catch { return fail("The assessment schedule or timezone needs to be corrected before sending."); }
    const text = `Hi,\n\nHere are the connection details for ${b.learner_name}'s Free Assessment with Hamkke.\n\n${schedule}\nTimezone: ${b.timezone}\nDuration: 30 minutes\nPlatform: ${b.preferred_platform}\n${b.meeting_link ? `\nMeeting link: ${b.meeting_link}\n` : ""}${b.meeting_instructions ? `\n${b.meeting_instructions}\n` : ""}\nPlease use these latest details to join your assessment. If you need help, reply to this email.\n\nSee you soon,\nHamkke │ 함께`;
    const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    const payload = { from: "Hamkke <hello@hamkkeenglish.com>", to: b.email, replyTo: "hamkke.english@gmail.com", subject: "Your Hamkke assessment meeting details", text,
      html: `<div style="background:#FFFDF8;padding:32px;font-family:Arial,sans-serif;color:#304638;max-width:600px"><h2>Hamkke │ 함께</h2><h1 style="font-family:Georgia,serif">Your assessment</h1><p style="white-space:pre-wrap;line-height:1.8">${escape(text)}</p>${b.meeting_link ? `<a href="${escape(b.meeting_link)}" style="display:inline-block;background:#6F8F72;color:white;padding:14px 24px;border-radius:24px">Join assessment</a>` : ""}</div>` };
    const key = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send(payload, { idempotencyKey: `assessment-meeting/${b.id}/${b.meeting_revision}/${key}` });
    if (error) { console.error("Meeting email failed", error); return fail("The email could not be sent. Your details are saved; please try again.", 502); }
    const sentAt = new Date().toISOString();
    const { data, error: saveError } = await admin.from("assessment_bookings")
      .update({ meeting_sent_at: sentAt, meeting_sent_revision: b.meeting_revision })
      .eq("id", b.id).eq("meeting_revision", b.meeting_revision).select(fields).maybeSingle();
    if (saveError || !data) return NextResponse.json({ ...details(b), sentAt, sentRevision: b.meeting_revision,
      message: "Email accepted for sending, but its saved status could not be updated. Reload and check Resend before trying again." });
    return NextResponse.json({ ...details(data), message: "Meeting details emailed to the booking contact." });
  } catch (error) { console.error("Assessment meeting error", error); return fail("Unable to process meeting details. Please try again.", 500); }
}
export const PATCH = (request: Request, context: Context) => change(request, context, false);
export const POST = (request: Request, context: Context) => change(request, context, true);
