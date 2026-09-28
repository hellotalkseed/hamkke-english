import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "owner" ||
      profile.status !== "active"
    ) {
      return NextResponse.json(
        { error: "Only active owners can view admin navigation." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    const [studentsResult, teachersResult] = await Promise.all([
      admin
        .from("students")
        .select("id, student_number, full_name, preferred_name, created_at")
        .order("created_at", { ascending: true }),
      admin
        .from("profiles")
        .select("id, teacher_number, full_name, created_at")
        .eq("role", "teacher")
        .order("created_at", { ascending: true }),
    ]);

    if (studentsResult.error) {
      throw studentsResult.error;
    }

    if (teachersResult.error) {
      throw teachersResult.error;
    }

    return NextResponse.json({
      students: (studentsResult.data || []).map((student) => ({
        id: student.id,
        name:
          student.preferred_name?.trim() ||
          student.full_name?.trim() ||
          "Unnamed student",
        number:
          student.student_number === null ||
          student.student_number === undefined
            ? null
            : String(student.student_number),
      })),
      teachers: (teachersResult.data || []).map((teacher) => ({
        id: teacher.id,
        name: teacher.full_name?.trim() || "Unnamed teacher",
        number: teacher.teacher_number?.trim() || null,
      })),
    });
  } catch (error) {
    console.error("Owner navigation fetch error:", error);

    return NextResponse.json(
      { error: "Unable to load owner navigation." },
      { status: 500 }
    );
  }
}
