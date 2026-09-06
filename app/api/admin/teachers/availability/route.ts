import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export async function GET() {
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

    console.log("Teacher availability GET user:", user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.role !== "teacher" || profile.status !== "active") {
      return NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      );
    }

    const { data: availability, error } = await supabase
      .from("teacher_availability")
      .select(
        "id, teacher_id, day_of_week, start_time, end_time, created_at, updated_at"
      )
      .eq("teacher_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Availability fetch error:", error);

      return NextResponse.json(
        {
          error: "Failed to load availability",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: profile.id,
        full_name: profile.full_name,
      },
      availability: availability ?? [],
    });
  } catch (error) {
    console.error("Teacher availability GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    console.log("========================================");
    console.log("Teacher availability PUT");
    console.log("Authenticated user ID:", user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    console.log("Profile ID:", profile.id);
    console.log("Profile role:", profile.role);
    console.log("Profile status:", profile.status);

    if (profile.role !== "teacher" || profile.status !== "active") {
      return NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const availability = Array.isArray(body?.availability)
      ? body.availability
      : [];

    console.log("Availability blocks received:", availability);

    for (const block of availability as AvailabilityBlock[]) {
      if (
        !Number.isInteger(block.day_of_week) ||
        block.day_of_week < 0 ||
        block.day_of_week > 6
      ) {
        return NextResponse.json(
          { error: "Invalid day of week" },
          { status: 400 }
        );
      }

      if (
        typeof block.start_time !== "string" ||
        typeof block.end_time !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid time format" },
          { status: 400 }
        );
      }

      if (
        !isValidTime(block.start_time) ||
        !isValidTime(block.end_time)
      ) {
        return NextResponse.json(
          {
            error: `Invalid time format: ${block.start_time} - ${block.end_time}`,
          },
          { status: 400 }
        );
      }

      if (block.end_time <= block.start_time) {
        return NextResponse.json(
          {
            error: `End time must be after start time: ${block.start_time} - ${block.end_time}`,
          },
          { status: 400 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("teacher_availability")
      .delete()
      .eq("teacher_id", user.id);

    if (deleteError) {
      console.error("Availability delete error:", deleteError);

      return NextResponse.json(
        {
          error: "Failed to update availability",
          details: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint,
        },
        { status: 500 }
      );
    }

    if (availability.length > 0) {
      const rows = (availability as AvailabilityBlock[]).map((block) => ({
        teacher_id: user.id,
        day_of_week: block.day_of_week,
        start_time: block.start_time,
        end_time: block.end_time,
      }));

      console.log("Rows about to be inserted:", rows);
      console.log("Insert teacher_id:", user.id);
      console.log("========================================");

      const { data: savedAvailability, error: insertError } =
        await supabase
          .from("teacher_availability")
          .insert(rows)
          .select(
            "id, teacher_id, day_of_week, start_time, end_time, created_at, updated_at"
          );

      if (insertError) {
        console.error("Availability insert error:", insertError);

        return NextResponse.json(
          {
            error: insertError.message || "Failed to save availability",
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        availability: savedAvailability ?? [],
      });
    }

    return NextResponse.json({
      success: true,
      availability: [],
    });
  } catch (error) {
    console.error("Teacher availability PUT error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}