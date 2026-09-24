import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: account, error: accountError } = await admin
      .from("portal_accounts").select("user_id, account_type").eq("user_id", user.id).maybeSingle();
    if (accountError || !account || account.account_type !== "student") {
      return NextResponse.json({ error: "Student portal account not found." }, { status: 403 });
    }

    const { data: link, error: linkError } = await admin
      .from("portal_account_students").select("student_id").eq("account_user_id", user.id).maybeSingle();
    if (linkError || !link) return NextResponse.json({ error: "Student portal link not found." }, { status: 403 });

    const { data: student, error: studentError } = await admin
      .from("students").select("email").eq("id", link.student_id).single();
    const authEmail = user.email.trim().toLowerCase();
    const studentEmail = String(student?.email || "").trim().toLowerCase();
    if (studentError || !studentEmail || studentEmail !== authEmail) {
      return NextResponse.json({ error: "Portal account email does not match the student record." }, { status: 403 });
    }

    const { error: updateError } = await admin.from("portal_accounts")
      .update({ status: "active" }).eq("user_id", user.id);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("STUDENT PORTAL SETUP COMPLETE ERROR", error);
    return NextResponse.json({ error: "Unable to activate the student portal account." }, { status: 500 });
  }
}
