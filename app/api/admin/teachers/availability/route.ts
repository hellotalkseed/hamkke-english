import { NextResponse } from "next/server";
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

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(
    value
  );
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getAuthenticatedTeacher() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

  if (profileError) {
    console.error(
      "Teacher availability profile fetch error:",
      profileError
    );
  }

  if (profileError || !profile) {
    return {
      supabase,
      user,
      profile: null,
      errorResponse: NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      ),
    };
  }

  if (
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    return {
      supabase,
      user,
      profile,
      errorResponse: NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    user,
    profile,
    errorResponse: null,
  };
}

/* ======================================================================== */
/* GET                                                                      */
/* Loads both recurring availability and one-time additional availability.  */
/* ======================================================================== */

export async function GET() {
  try {
    const {
      supabase,
      user,
      profile,
      errorResponse,
    } = await getAuthenticatedTeacher();

    if (errorResponse) {
      return errorResponse;
    }

    if (!user || !profile) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * REGULAR / RECURRING AVAILABILITY
     */

    const {
      data: availability,
      error: availabilityError,
    } = await supabase
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
      .eq("teacher_id", user.id)
      .order("day_of_week", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (availabilityError) {
      console.error(
        "Regular availability fetch error:",
        availabilityError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load regular availability",
          details: availabilityError.message,
          code: availabilityError.code,
          hint: availabilityError.hint,
        },
        { status: 500 }
      );
    }

    /*
     * DATE-SPECIFIC / SUB AVAILABILITY
     */

    const {
      data: subAvailability,
      error: subAvailabilityError,
    } = await supabase
      .from("teacher_sub_availability")
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
      .eq("teacher_id", user.id)
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
            "Failed to load sub availability",
          details: subAvailabilityError.message,
          code: subAvailabilityError.code,
          hint: subAvailabilityError.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: profile.id,
        full_name: profile.full_name,
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

/* ======================================================================== */
/* PUT                                                                      */
/*                                                                          */
/* Supports either:                                                         */
/*                                                                          */
/* { availability: [...] }                                                  */
/*                                                                          */
/* or                                                                       */
/*                                                                          */
/* { sub_availability: [...] }                                              */
/*                                                                          */
/* They are deliberately independent so saving one does not overwrite the   */
/* other.                                                                   */
/* ======================================================================== */

export async function PUT(request: Request) {
  try {
    const {
      supabase,
      user,
      errorResponse,
    } = await getAuthenticatedTeacher();

    if (errorResponse) {
      return errorResponse;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const hasRegularAvailability =
      Array.isArray(body?.availability);

    const hasSubAvailability =
      Array.isArray(body?.sub_availability);

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

    /*
     * ================================================================
     * REGULAR / RECURRING AVAILABILITY
     * ================================================================
     */

    let savedRegularAvailability = null;

    if (hasRegularAvailability) {
      const availability =
        body.availability as AvailabilityBlock[];

      for (const block of availability) {
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
          !isValidTime(block.end_time)
        ) {
          return NextResponse.json(
            {
              error:
                `Invalid time format: ` +
                `${block.start_time} - ` +
                `${block.end_time}`,
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
                `End time must be after start time: ` +
                `${block.start_time} - ` +
                `${block.end_time}`,
            },
            { status: 400 }
          );
        }
      }

      const {
        error: deleteRegularError,
      } = await supabase
        .from("teacher_availability")
        .delete()
        .eq("teacher_id", user.id);

      if (deleteRegularError) {
        console.error(
          "Regular availability delete error:",
          deleteRegularError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update regular availability",
            details:
              deleteRegularError.message,
            code: deleteRegularError.code,
            hint: deleteRegularError.hint,
          },
          { status: 500 }
        );
      }

      if (availability.length > 0) {
        const rows = availability.map(
          (block) => ({
            teacher_id: user.id,
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
          error: insertRegularError,
        } = await supabase
          .from("teacher_availability")
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

        if (insertRegularError) {
          console.error(
            "Regular availability insert error:",
            insertRegularError
          );

          return NextResponse.json(
            {
              error:
                insertRegularError.message ||
                "Failed to save regular availability",
              details:
                insertRegularError.details,
              hint:
                insertRegularError.hint,
              code:
                insertRegularError.code,
            },
            { status: 500 }
          );
        }

        savedRegularAvailability =
          data ?? [];
      } else {
        savedRegularAvailability = [];
      }
    }

    /*
     * ================================================================
     * DATE-SPECIFIC / SUB AVAILABILITY
     * ================================================================
     */

    let savedSubAvailability = null;

    if (hasSubAvailability) {
      const subAvailability =
        body.sub_availability as SubAvailabilityBlock[];

      for (
        const block of subAvailability
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
          !isValidTime(block.end_time)
        ) {
          return NextResponse.json(
            {
              error:
                `Invalid time format: ` +
                `${block.start_time} - ` +
                `${block.end_time}`,
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
                `End time must be after start time: ` +
                `${block.start_time} - ` +
                `${block.end_time}`,
            },
            { status: 400 }
          );
        }
      }

      /*
       * Replace only this teacher's date-specific
       * availability.
       *
       * This does NOT touch teacher_availability
       * and does NOT touch recurring student
       * assignments.
       */

      const {
        error: deleteSubError,
      } = await supabase
        .from(
          "teacher_sub_availability"
        )
        .delete()
        .eq("teacher_id", user.id);

      if (deleteSubError) {
        console.error(
          "Sub availability delete error:",
          deleteSubError
        );

        return NextResponse.json(
          {
            error:
              "Failed to update sub availability",
            details:
              deleteSubError.message,
            code:
              deleteSubError.code,
            hint:
              deleteSubError.hint,
          },
          { status: 500 }
        );
      }

      if (subAvailability.length > 0) {
        const rows =
          subAvailability.map(
            (block) => ({
              teacher_id: user.id,

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
        } = await supabase
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
                insertSubError.message ||
                "Failed to save sub availability",
              details:
                insertSubError.details,
              hint:
                insertSubError.hint,
              code:
                insertSubError.code,
            },
            { status: 500 }
          );
        }

        savedSubAvailability =
          data ?? [];
      } else {
        savedSubAvailability = [];
      }
    }

    /*
     * RESPONSE
     */

    return NextResponse.json({
      success: true,

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