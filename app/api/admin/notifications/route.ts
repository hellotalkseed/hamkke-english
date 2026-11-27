import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const body = await request.json();
    if (body.action === "read") {
      const ids = body.ids;
      const before = body.before;
      if ((ids !== undefined && (!Array.isArray(ids) || ids.length > 80 || ids.some(id => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)))) ||
        (before !== undefined && (typeof before !== "string" || !Number.isFinite(Date.parse(before)))) || (!ids && !before)) {
        return NextResponse.json({ error: "Invalid notification selection." }, { status: 400 });
      }
      const { error } = await db.rpc("staff_notifications_read", { p_ids: ids ?? null, p_before: before ?? null });
      if (error) throw error;
      return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action !== "feed") return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    const { data, error } = await db.rpc("staff_notification_feed");
    if (error) throw error;
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Staff notifications:", error);
    const forbidden = typeof error === "object" && error !== null && "code" in error && error.code === "42501";
    return NextResponse.json({ error: forbidden ? "Staff access required." : "Updates are temporarily unavailable. Retrying shortly." }, { status: forbidden ? 403 : 500 });
  }
}
