import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TEACHER_ID =
  "8e03f361-ba0d-4c4a-8f19-8807c3c73fff";

export async function POST(request: Request) {
  try {
    // Verify the currently signed-in user
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Verify that the signed-in user is an active owner
    const admin = createAdminClient();

    const { data: profile, error: profileError } =
      await admin
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
        {
          error:
            "Only active owners can reset this teacher password.",
        },
        { status: 403 }
      );
    }

    // Read the new password
    const body = await request.json();
    const password = body?.password;

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // Update the teacher's Auth password directly
    const { error: updateError } =
      await admin.auth.admin.updateUserById(
        TEACHER_ID,
        {
          password,
        }
      );

    if (updateError) {
      console.error(
        "Teacher password update error:",
        updateError
      );

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher password updated successfully.",
    });
  } catch (error) {
    console.error(
      "Teacher password reset error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}