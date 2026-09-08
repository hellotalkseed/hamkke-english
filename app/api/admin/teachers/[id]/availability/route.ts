// app/api/admin/teachers/[id]/availability/route.ts

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface AvailabilityBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface SubAvailabilityBlock {
  availability_date: string;
  start_time: string;
  end_time: string;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(
    value
  );
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/* ========================================================================= */
/* AUTH                                                                      */
/* ========================================================================= */

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, status"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      user,
      profile: null,
    };
  }

  return {
    supabase,
    user,
    profile,
  };
}

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "Teacher ID is required",
        },
        { status: 400 }
      );
    }

    const {
      supabase,
      user,
      profile,
    } =
      await getAuthenticatedProfile();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Profile not found",
        },
        { status: 404 }
      );
    }

    if (profile.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your account is inactive",
        },
        { status: 403 }
      );
    }

    const isOwner =
      profile.role === "owner";

    const isTeacher =
      profile.role === "teacher";

    if (!isOwner && !isTeacher) {
      return NextResponse.json(
        {
          error: "Access denied",
        },
        { status: 403 }
      );
    }

    /*
     * Teachers may view only themselves.
     * Owners may view any teacher.
     */

    if (
      isTeacher &&
      teacherId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only view your own availability",
        },
        { status: 403 }
      );
    }

    /*
     * Verify the requested profile really is
     * a teacher.
     */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, status"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error:
            "Teacher not found",
        },
        { status: 404 }
      );
    }

    /*
     * Authorization is complete.
     *
     * We intentionally use the admin client
     * below because teacher_sub_availability
     * is protected by self-only teacher RLS.
     *
     * This lets the authorized owner read a
     * teacher's availability without adding
     * a broad owner SELECT policy.
     */

    const admin =
      createAdminClient();

    /* --------------------------------------------------------------------- */
    /* REGULAR AVAILABILITY                                                  */
    /* --------------------------------------------------------------------- */

    const {
      data: availability,
      error: availabilityError,
    } = await admin
      .from("teacher_availability")
      .select(
        `
          id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
          created_at,
          updated_at
        `
      )
      .eq("teacher_id", teacherId)
      .order("day_of_week", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (availabilityError) {
      console.error(
        "Availability fetch error:",
        availabilityError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load availability",
          details:
            availabilityError.message,
          code:
            availabilityError.code,
          hint:
            availabilityError.hint,
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* DATE-SPECIFIC / ADDITIONAL AVAILABILITY                               */
    /* --------------------------------------------------------------------- */

    const {
      data: subAvailability,
      error: subAvailabilityError,
    } = await admin
      .from(
        "teacher_sub_availability"
      )
      .select(
        `
          id,
          teacher_id,
          availability_date,
          start_time,
          end_time,
          created_at,
          updated_at
        `
      )
      .eq("teacher_id", teacherId)
      .order("availability_date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (subAvailabilityError) {
      console.error(
        "Sub availability fetch error:",
        subAvailabilityError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load additional availability",
          details:
            subAvailabilityError.message,
          code:
            subAvailabilityError.code,
          hint:
            subAvailabilityError.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name:
          teacher.full_name,
        role: teacher.role,
        status: teacher.status,
      },

      availability:
        availability ?? [],

      sub_availability:
        subAvailability ?? [],
    });
  } catch (error) {
    console.error(
      "Teacher availability GET error:",
      error
    );

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

/* ========================================================================= */
/* PUT                                                                       */
/*                                                                           */
/* Supports either or both:                                                  */
/*                                                                           */
/* { availability: [...] }                                                   */
/* { sub_availability: [...] }                                               */
/*                                                                           */
/* They remain completely independent.                                       */
/* ========================================================================= */

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "Teacher ID is required",
        },
        { status: 400 }
      );
    }

    const {
      supabase,
      user,
      profile,
    } =
      await getAuthenticatedProfile();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Profile not found",
        },
        { status: 404 }
      );
    }

    if (profile.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your account is inactive",
        },
        { status: 403 }
      );
    }

    const isOwner =
      profile.role === "owner";

    const isTeacher =
      profile.role === "teacher";

    if (!isOwner && !isTeacher) {
      return NextResponse.json(
        {
          error: "Access denied",
        },
        { status: 403 }
      );
    }

    /*
     * Teachers may update only themselves.
     * Owners retain the existing ability to
     * manage any teacher.
     */

    if (
      isTeacher &&
      teacherId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only update your own availability",
        },
        { status: 403 }
      );
    }

    /*
     * Verify target teacher.
     */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, status"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error:
            "Teacher not found",
        },
        { status: 404 }
      );
    }

    const body =
      await request.json();

    const hasRegularAvailability =
      Array.isArray(
        body?.availability
      );

    const hasSubAvailability =
      Array.isArray(
        body?.sub_availability
      );

    if (
      !hasRegularAvailability &&
      !hasSubAvailability
    ) {
      return NextResponse.json(
        {
          error:
            "No availability data was provided.",
        },
        { status: 400 }
      );
    }

    const admin =
      createAdminClient();

    let savedRegularAvailability:
      unknown[] | null = null;

    let savedSubAvailability:
      unknown[] | null = null;

    /* --------------------------------------------------------------------- */
    /* REGULAR AVAILABILITY                                                  */
    /* --------------------------------------------------------------------- */

    if (hasRegularAvailability) {
      const availability =
        body.availability as AvailabilityBlock[];

      for (
        const block of availability
      ) {
        if (
          !Number.isInteger(
            block.day_of_week
          ) ||
          block.day_of_week < 0 ||
          block.day_of_week > 6
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid day of week",
            },
            { status: 400 }
          );
        }

        if (
          typeof block.start_time !==
            "string" ||
          typeof block.end_time !==
            "string"
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid time format",
            },
            { status: 400 }
          );
        }

        if (
          !isValidTime(
            block.start_time
          ) ||
          !isValidTime(
            block.end_time
          )
        ) {
          return NextResponse.json(
            {
              error:
                `Invalid time format: ${block.start_time} - ${block.end_time}`,
            },
            { status: 400 }
          );
        }

        if (
          block.end_time <=
          block.start_time
        ) {
          return NextResponse.json(
            {
              error:
                "End time must be after start time",
            },
            { status: 400 }
          );
        }
      }

      const {
        error: deleteError,
      } = await admin
        .from(
          "teacher_availability"
        )
        .delete()
        .eq(
          "teacher_id",
          teacherId
        );

      if (deleteError) {
        console.error(
          "Availability delete error:",
          deleteError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update availability",
            details:
              deleteError.message,
          },
          { status: 500 }
        );
      }

      if (
        availability.length > 0
      ) {
        const rows =
          availability.map(
            (block) => ({
              teacher_id:
                teacherId,

              day_of_week:
                block.day_of_week,

              start_time:
                block.start_time,

              end_time:
                block.end_time,
            })
          );

        const {
          data,
          error: insertError,
        } = await admin
          .from(
            "teacher_availability"
          )
          .insert(rows)
          .select(
            `
              id,
              teacher_id,
              day_of_week,
              start_time,
              end_time,
              created_at,
              updated_at
            `
          );

        if (insertError) {
          console.error(
            "Availability insert error:",
            insertError
          );

          return NextResponse.json(
            {
              error:
                "Failed to save availability",
              details:
                insertError.message,
            },
            { status: 500 }
          );
        }

        savedRegularAvailability =
          data ?? [];
      } else {
        savedRegularAvailability =
          [];
      }
    }

    /* --------------------------------------------------------------------- */
    /* ADDITIONAL / DATE-SPECIFIC AVAILABILITY                               */
    /* --------------------------------------------------------------------- */

    if (hasSubAvailability) {
      const subAvailability =
        body.sub_availability as SubAvailabilityBlock[];

      for (
        const block of
          subAvailability
      ) {
        if (
          typeof block.availability_date !==
            "string" ||
          !isValidDate(
            block.availability_date
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid availability date",
            },
            { status: 400 }
          );
        }

        if (
          typeof block.start_time !==
            "string" ||
          typeof block.end_time !==
            "string"
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid time format",
            },
            { status: 400 }
          );
        }

        if (
          !isValidTime(
            block.start_time
          ) ||
          !isValidTime(
            block.end_time
          )
        ) {
          return NextResponse.json(
            {
              error:
                `Invalid time format: ${block.start_time} - ${block.end_time}`,
            },
            { status: 400 }
          );
        }

        if (
          block.end_time <=
          block.start_time
        ) {
          return NextResponse.json(
            {
              error:
                "End time must be after start time",
            },
            { status: 400 }
          );
        }
      }

      /*
       * Replace only this teacher's
       * date-specific availability.
       *
       * This does NOT touch:
       *
       * - teacher_availability
       * - teacher assignments
       * - student recurring schedules
       */

      const {
        error: deleteSubError,
      } = await admin
        .from(
          "teacher_sub_availability"
        )
        .delete()
        .eq(
          "teacher_id",
          teacherId
        );

      if (deleteSubError) {
        console.error(
          "Sub availability delete error:",
          deleteSubError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update additional availability",
            details:
              deleteSubError.message,
          },
          { status: 500 }
        );
      }

      if (
        subAvailability.length > 0
      ) {
        const rows =
          subAvailability.map(
            (block) => ({
              teacher_id:
                teacherId,

              availability_date:
                block.availability_date,

              start_time:
                block.start_time,

              end_time:
                block.end_time,
            })
          );

        const {
          data,
          error: insertSubError,
        } = await admin
          .from(
            "teacher_sub_availability"
          )
          .insert(rows)
          .select(
            `
              id,
              teacher_id,
              availability_date,
              start_time,
              end_time,
              created_at,
              updated_at
            `
          );

        if (insertSubError) {
          console.error(
            "Sub availability insert error:",
            insertSubError
          );

          return NextResponse.json(
            {
              error:
                "Failed to save additional availability",
              details:
                insertSubError.message,
            },
            { status: 500 }
          );
        }

        savedSubAvailability =
          data ?? [];
      } else {
        savedSubAvailability =
          [];
      }
    }

    return NextResponse.json({
      success: true,

      teacher: {
        id: teacher.id,
        full_name:
          teacher.full_name,
      },

      ...(hasRegularAvailability
        ? {
            availability:
              savedRegularAvailability,
          }
        : {}),

      ...(hasSubAvailability
        ? {
            sub_availability:
              savedSubAvailability,
          }
        : {}),
    });
  } catch (error) {
    console.error(
      "Teacher availability PUT error:",
      error
    );

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