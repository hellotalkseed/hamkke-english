import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

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
        { error: "Failed to load availability" },
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
      { error: "Internal server error" },
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

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

    const body = await request.json();

    const availability = Array.isArray(body?.availability)
      ? body.availability
      : [];

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

      if (block.end_time <= block.start_time) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }
    }

    // Replace the teacher's complete weekly availability.
    const { error: deleteError } = await supabase
      .from("teacher_availability")
      .delete()
      .eq("teacher_id", user.id);

    if (deleteError) {
      console.error("Availability delete error:", deleteError);

      return NextResponse.json(
        { error: "Failed to update availability" },
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
          { error: "Failed to save availability" },
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}