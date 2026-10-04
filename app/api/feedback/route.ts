import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eligibleTeachers, FeedbackError, portalIdentity, publishedTeacher } from "@/lib/feedback/server";
import { isValidLocale } from "@/lib/i18n";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text = (v: unknown) => typeof v === "string" ? v.trim() : "";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) throw new FeedbackError("Invalid request origin.", 403);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new FeedbackError("JSON required.");
    // Bound the actual body, rather than trusting Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new FeedbackError("Missing feedback.");
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 40000) { await reader.cancel(); throw new FeedbackError("Feedback is too large.", 413); } chunks.push(value); }
    const b = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!b || typeof b !== "object" || Array.isArray(b)) throw new FeedbackError("Invalid feedback.");
    const name = text(b.name), role = text(b.role), country = text(b.country), reflection = text(b.reflection), locale = text(b.locale);
    if (!uuid.test(text(b.requestId)) || !name || name.length > 100 || !reflection || reflection.length > 5000 || country.length > 100 || !["Student", "Parent / Guardian"].includes(role) || !Number.isInteger(b.rating) || b.rating < 1 || b.rating > 5 || !isValidLocale(locale) || typeof b.shareWithTeacher !== "boolean" || typeof b.publishConsent !== "boolean" || (b.publishConsent && !b.shareWithTeacher)) throw new FeedbackError("Please check the feedback fields.");
    let teacherId: string; let authorId: string | null = null; let studentId: string | null = null;
    let context: "hamkke" | "elsewhere";
    if (b.source === "portal") {
      studentId = text(b.studentId);
      if (!uuid.test(studentId) || !uuid.test(text(b.teacherId))) throw new FeedbackError("Invalid learner or teacher.");
      const identity = await portalIdentity(studentId); authorId = identity.user.id;
      const teachers = await eligibleTeachers(studentId);
      if (!teachers.some(t => t.id === b.teacherId)) throw new FeedbackError("Choose a teacher from your completed lessons.", 403);
      teacherId = b.teacherId; context = "hamkke";
    } else if (b.source === "public_link") {
      if (!["hamkke", "elsewhere"].includes(b.learningContext)) throw new FeedbackError("Choose where you learned with this teacher.");
      const slug = text(b.teacherSlug);
      if (!slug || slug.length > 150) throw new FeedbackError("Choose a teacher.");
      const token = text(b.turnstileToken);
      if (!token || token.length > 4096) throw new FeedbackError("Please complete the security check.");
      const secret = process.env.TURNSTILE_SECRET_KEY;
      if (!secret) throw new Error("Feedback Turnstile secret unavailable.");
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: token }), cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!verification.ok) throw new Error("Feedback security check unavailable.");
      const v = await verification.json();
      if (!v.success || v.hostname !== new URL(request.url).hostname) throw new FeedbackError("Please repeat the security check.", 403);
      const teacher = await publishedTeacher(slug);
      if (!teacher) throw new FeedbackError("This teacher is unavailable.", 404);
      teacherId = teacher.id; context = b.learningContext;
    } else throw new FeedbackError("Invalid feedback source.");
    const admin = createAdminClient();
    const row = {
      teacher_id: teacherId, author_user_id: authorId, student_id: studentId,
      source: b.source, learning_context: context, name, role, country: country || null,
      rating: b.rating, reflection, share_with_teacher: b.shareWithTeacher,
      publish_consent: b.publishConsent, consent_version: "feedback-sharing-v1", consent_locale: locale,
    };
    const hash = createHash("sha256").update(JSON.stringify(row)).digest("hex");
    const result = await admin.from("learner_feedback").insert({ ...row, request_id: b.requestId, payload_hash: hash });
    if (result.error?.code === "23505") {
      const old = await admin.from("learner_feedback").select("payload_hash").eq("request_id", b.requestId).maybeSingle();
      if (old.error || old.data?.payload_hash !== hash) throw new FeedbackError("This request has changed. Please try submitting again.", 409);
    } else if (result.error) throw result.error;
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof FeedbackError) && !(error instanceof SyntaxError)) console.error("Feedback submission failed", error);
    return NextResponse.json({ error: error instanceof FeedbackError ? error.message : "Unable to submit feedback. Please try again." }, { status: error instanceof FeedbackError ? error.status : error instanceof SyntaxError ? 400 : 500 });
  }
}
