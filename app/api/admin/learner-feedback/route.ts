import { NextResponse } from "next/server";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";
export async function GET(request: Request) {
  try {
    const { admin } = await staffIdentity("owner");
    const page = Math.max(0, Math.min(100000, Math.floor(Number(new URL(request.url).searchParams.get("page")) || 0)));
    const result = await admin.from("learner_feedback").select("id, name, role, country, rating, reflection, teacher_id, source, learning_context, share_with_teacher, publish_consent, review_status, published_reflection_id, created_at", { count: "exact" }).order("created_at", { ascending: false }).order("id").range(page * 30, page * 30 + 29);
    if (result.error) throw result.error;
    const ids = [...new Set((result.data ?? []).map(r => r.teacher_id))];
    const teachers = ids.length ? await admin.from("profiles").select("id, full_name").in("id", ids) : { data: [], error: null };
    if (teachers.error) throw teachers.error;
    const names = new Map((teachers.data ?? []).map(t => [t.id, t.full_name]));
    return NextResponse.json({ feedback: (result.data ?? []).map(f => ({ ...f, teacher_name: names.get(f.teacher_id) || "Teacher" })), total: result.count ?? 0 }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "Unable to load feedback." }, { status: e instanceof FeedbackError ? e.status : 500 });
  }
}
