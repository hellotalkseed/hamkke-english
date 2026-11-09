import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string; enrollmentId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function handle(request: NextRequest, context: Context, write: boolean) {
  if (write && request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Please submit from this website." }, 403);
  const { id, enrollmentId } = await context.params;
  if (!uuid.test(id) || !uuid.test(enrollmentId)) return reply({ error: "Invalid enrollment." }, 400);
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return reply({ error: "Please sign in again." }, 401);
  const { data: profile, error: profileError } = await client.from("profiles").select("role,status").eq("id", user.id).single();
  if (profileError || profile?.role !== "owner" || profile.status !== "active") return reply({ error: "Owner access required." }, 403);
  let body: Record<string, unknown> = {};
  if (write) {
    try { body = await request.json(); } catch { return reply({ error: "Invalid request." }, 400); }
    if (!body || Array.isArray(body) || typeof body !== "object") return reply({ error: "Invalid request." }, 400);
  }
  const { data: state, error: stateError } = await client.rpc("manage_enrollment_pause", { p_enrollment_id: enrollmentId, p_action: "state" });
  if (stateError) return reply({ error: stateError.message }, 400);
  if (!state?.participants?.some((p: { id: string }) => p.id === id)) return reply({ error: "Enrollment not found for this student." }, 404);
  if (!write) return reply(state);
  if (!["freeze_preview", "freeze", "resume_preview", "resume"].includes(String(body.action))) return reply({ error: "Invalid action." }, 400);
  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return reply({ error: "Choose a valid date." }, 400);
  for (const key of ["studentId", "pauseId"]) if (body[key] != null && (typeof body[key] !== "string" || !uuid.test(body[key] as string))) return reply({ error: "Invalid participant or pause." }, 400);
  if (body.hash != null && (typeof body.hash !== "string" || !/^[a-f0-9]{32}$/.test(body.hash))) return reply({ error: "Preview the schedule again." }, 400);
  const { data, error } = await client.rpc("manage_enrollment_pause", {
    p_enrollment_id: enrollmentId, p_action: body.action, p_date: body.date,
    p_student_id: body.studentId ?? null, p_pause_id: body.pauseId ?? null, p_expected_hash: body.hash ?? null,
  });
  if (error) return reply({ error: error.message }, 400);
  return reply(data);
}
export function GET(request: NextRequest, context: Context) { return handle(request, context, false); }
export function POST(request: NextRequest, context: Context) { return handle(request, context, true); }
