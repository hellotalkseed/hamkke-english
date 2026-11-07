import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QR_BUCKET, QR_METHODS, type ContactDetails } from "@/lib/assessments/contactDetails";

export async function GET(request: Request, context: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await context.params;
  const method = new URL(request.url).searchParams.get("method") || "";
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId) || !(QR_METHODS as readonly string[]).includes(method)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
  if (!profile || profile.status !== "active" || !["owner", "admin", "teacher"].includes(profile.role)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }
  const { data: booking } = await admin.from("assessment_bookings")
    .select("teacher_id,contact_details").eq("id", assessmentId).maybeSingle();
  if (!booking || (profile.role === "teacher" && booking.teacher_id !== user.id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const entry = (booking.contact_details as ContactDetails | null)?.[method];
  if (entry?.mode !== "qr" || !entry.qr_path) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { data, error } = await admin.storage.from(QR_BUCKET).download(entry.qr_path);
  if (error || !data || !["image/png", "image/jpeg", "image/webp"].includes(data.type)) {
    return NextResponse.json({ error: "QR image unavailable." }, { status: 404 });
  }
  return new Response(data, {
    headers: {
      "Content-Type": data.type,
      "Content-Disposition": 'inline; filename="contact-qr"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
