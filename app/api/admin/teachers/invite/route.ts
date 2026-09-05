import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
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
        { error: "Only active owners can invite teachers." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "Teacher email is required." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Teacher name is required." },
        { status: 400 }
      );
    }

    const {
      data: invitedUser,
      error: inviteError,
    } = await admin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    if (!invitedUser.user) {
      return NextResponse.json(
        { error: "Teacher account could not be created." },
        { status: 500 }
      );
    }

    // Find the highest existing teacher number
    const { data: lastTeacher, error: lastTeacherError } = await admin
      .from("profiles")
      .select("teacher_number")
      .eq("role", "teacher")
      .not("teacher_number", "is", null)
      .order("teacher_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastTeacherError) {
      await admin.auth.admin.deleteUser(invitedUser.user.id);

      return NextResponse.json(
        { error: lastTeacherError.message },
        { status: 500 }
      );
    }

    // Generate the next permanent teacher number
    let nextTeacherNumber = 1;

    if (lastTeacher?.teacher_number) {
      const match = lastTeacher.teacher_number.match(/^T-(\d+)$/);

      if (match) {
        nextTeacherNumber = Number(match[1]) + 1;
      }
    }

    const teacherNumber = `T-${String(nextTeacherNumber).padStart(3, "0")}`;

    // Create the teacher profile
    const { error: insertProfileError } = await admin
      .from("profiles")
      .insert({
        id: invitedUser.user.id,
        full_name: fullName,
        role: "teacher",
        status: "active",
        teacher_number: teacherNumber,
      });

    if (insertProfileError) {
      await admin.auth.admin.deleteUser(invitedUser.user.id);

      return NextResponse.json(
        { error: insertProfileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher invitation sent.",
      teacherNumber,
    });
  } catch (error) {
    console.error("Teacher invitation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while inviting the teacher.",
      },
      { status: 500 }
    );
  }
}