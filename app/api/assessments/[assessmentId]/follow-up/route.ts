import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type FollowUpStatus =
  | "awaiting_follow_up"
  | "contacted"
  | "interested"
  | "not_proceeding";

const ALLOWED_FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  "awaiting_follow_up",
  "contacted",
  "interested",
  "not_proceeding",
];

interface RouteContext {
  params: Promise<{
    assessmentId: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { assessmentId } = await params;

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

    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.status !== "active" ||
      !["owner", "admin"].includes(profile.role)
    ) {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const followUpStatus = body?.followUpStatus as
      | FollowUpStatus
      | undefined;

    if (
      !followUpStatus ||
      !ALLOWED_FOLLOW_UP_STATUSES.includes(followUpStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid follow-up status." },
        { status: 400 }
      );
    }

    const { data: assessment, error: assessmentError } =
      await admin
        .from("assessment_bookings")
        .select(
          "id, status, follow_up_status, converted_student_id"
        )
        .eq("id", assessmentId)
        .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    if (assessment.converted_student_id) {
      return NextResponse.json(
        {
          error:
            "This assessment has already been converted to a student.",
        },
        { status: 409 }
      );
    }

    if (assessment.status !== "completed") {
      return NextResponse.json(
        {
          error:
            "Follow-up status can only be changed after the assessment is completed.",
        },
        { status: 409 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from("assessment_bookings")
      .update({
        follow_up_status: followUpStatus,
      })
      .eq("id", assessmentId)
      .is("converted_student_id", null)
      .select("id, follow_up_status")
      .single();

    if (updateError || !updated) {
      console.error(
        "Error updating assessment follow-up status:",
        updateError
      );

      return NextResponse.json(
        { error: "Unable to update follow-up status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      followUpStatus: updated.follow_up_status,
    });
  } catch (error) {
    console.error(
      "Assessment follow-up PATCH error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to update follow-up status." },
      { status: 500 }
    );
  }
}