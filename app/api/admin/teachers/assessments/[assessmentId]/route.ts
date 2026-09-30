import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    assessmentId: string;
  }>;
}

async function getViewer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, full_name, role, status")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    profile.status !== "active" ||
    !["teacher", "owner", "admin"].includes(profile.role)
  ) {
    return {
      error: NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      ),
    };
  }

  return {
    admin,
    user,
    profile,
  };
}

async function loadAssessment(
  admin: ReturnType<typeof createAdminClient>,
  assessmentId: string
) {
  return admin
    .from("assessment_bookings")
    .select(`
      id,
      teacher_id,
      learner_type,
      learner_name,
      preferred_name,
      learner_age,
      contact_name,
      email,
      english_level,
      learning_goal,
      notes,
      assessment_format,
      preferred_platform,
      timezone,
      assessment_date,
      assessment_time,
      status,
      teacher_observation,
      follow_up_status,
      converted_student_id,
      converted_at,
      created_at,
      updated_at
    `)
    .eq("id", assessmentId)
    .single();
}

function canAccessAssessment(
  profile: {
    id: string;
    role: string;
  },
  teacherId: string
) {
  if (
    profile.role === "owner" ||
    profile.role === "admin"
  ) {
    return true;
  }

  return (
    profile.role === "teacher" &&
    profile.id === teacherId
  );
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { assessmentId } = await context.params;
    const viewer = await getViewer();

    if ("error" in viewer) {
      return viewer.error;
    }

    const { admin, profile } = viewer;

    const { data: assessment, error } =
      await loadAssessment(admin, assessmentId);

    if (error || !assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    if (
      !canAccessAssessment(
        profile,
        assessment.teacher_id
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this assessment.",
        },
        { status: 403 }
      );
    }

    const { data: teacher } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", assessment.teacher_id)
      .maybeSingle();

    return NextResponse.json({
      viewer: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
      },
      teacher: teacher ?? null,
      assessment: {
        ...assessment,
        duration: 30,
        philippine_date:
          assessment.assessment_date,
        philippine_time:
          assessment.assessment_time.slice(0, 5),
      },
    });
  } catch (error) {
    console.error(
      "Teacher assessment GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load assessment.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { assessmentId } = await context.params;
    const viewer = await getViewer();

    if ("error" in viewer) {
      return viewer.error;
    }

    const { admin, profile } = viewer;

    const {
      data: currentAssessment,
      error: loadError,
    } = await loadAssessment(
      admin,
      assessmentId
    );

    if (loadError || !currentAssessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    if (
      !canAccessAssessment(
        profile,
        currentAssessment.teacher_id
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update this assessment.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (currentAssessment.converted_student_id || currentAssessment.status === "cancelled") {
      return NextResponse.json({ error: "This assessment is read-only because it has been converted or cancelled." }, { status: 409 });
    }
    const update: {
      status?: "completed" | "no_show";
      teacher_observation?: string | null;
      follow_up_status?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (
        !["completed", "no_show"].includes(
          body.status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Teachers can mark an assessment only as completed or no-show.",
          },
          { status: 400 }
        );
      }

      if (
        currentAssessment.status ===
        "cancelled"
      ) {
        return NextResponse.json(
          {
            error:
              "A cancelled assessment cannot be updated from My Lessons.",
          },
          { status: 409 }
        );
      }

      update.status = body.status;
    }

    if (
      body.teacher_observation !==
      undefined
    ) {
      if (
        typeof body.teacher_observation !==
        "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Teacher observation must be text.",
          },
          { status: 400 }
        );
      }

      const observation =
        body.teacher_observation.trim();

      if (observation.length > 5000) {
        return NextResponse.json(
          {
            error:
              "Teacher observation is too long.",
          },
          { status: 400 }
        );
      }

      update.teacher_observation =
        observation || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    if (update.status) {
      // Stored booking times are Philippine time, independently of learner timezone.
      const endsAt = Date.parse(`${currentAssessment.assessment_date}T${currentAssessment.assessment_time.slice(0, 8)}+08:00`) + 30 * 60 * 1000;
      if (!Number.isFinite(endsAt) || Date.now() < endsAt) {
        return NextResponse.json({ error: "Record the outcome after the assessment has ended." }, { status: 409 });
      }
      const observation = update.teacher_observation === undefined
        ? currentAssessment.teacher_observation : update.teacher_observation;
      if (update.status === "completed" && !observation?.trim()) {
        return NextResponse.json({ error: "Add your observations and recommended starting point before completing the assessment." }, { status: 400 });
      }
      if (update.status !== currentAssessment.status) {
        update.follow_up_status = update.status === "completed" ? "awaiting_follow_up" : null;
      }
    }

    const { data: assessment, error } =
      await admin
        .from("assessment_bookings")
        .update(update)
        .eq("id", assessmentId)
        .eq("status", currentAssessment.status)
        .eq("updated_at", currentAssessment.updated_at)
        .is("converted_student_id", null)
        .eq(
          "teacher_id",
          currentAssessment.teacher_id
        )
        .select(`
          id,
          teacher_id,
          learner_type,
          learner_name,
          preferred_name,
          learner_age,
          contact_name,
          email,
          english_level,
          learning_goal,
          notes,
          assessment_format,
          preferred_platform,
          timezone,
          assessment_date,
          assessment_time,
          status,
          teacher_observation,
      follow_up_status,
          converted_student_id,
          converted_at,
          updated_at
        `)
        .maybeSingle();

    if (!error && !assessment) {
      return NextResponse.json({ error: "This assessment changed. Reload it before saving again." }, { status: 409 });
    }
    if (error || !assessment) {
      return NextResponse.json(
        { error: "Unable to save the assessment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assessment: {
        ...assessment,
        duration: 30,
        philippine_date:
          assessment.assessment_date,
        philippine_time:
          assessment.assessment_time.slice(0, 5),
      },
    });
  } catch (error) {
    console.error(
      "Teacher assessment PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update assessment.",
      },
      { status: 500 }
    );
  }
}
