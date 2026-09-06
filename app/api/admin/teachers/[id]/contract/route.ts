import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* ========================================================================= */
/* AUTHENTICATION                                                            */
/* ========================================================================= */

async function getActiveOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
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
    return {
      supabase,
      user,
      error: NextResponse.json(
        {
          error:
            "Only active owners can manage teacher agreements.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    user,
    error: null,
  };
}

/* ========================================================================= */
/* GET                                                                       */
/* Load the teacher's current agreement.                                     */
/* ========================================================================= */

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const ownerResult = await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } = ownerResult;
    const { id: teacherId } = await context.params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required." },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY TEACHER                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, status, teacher_number"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error: "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* GET CURRENT AGREEMENT                                                 */
    /* --------------------------------------------------------------------- */

    const {
      data: contract,
      error: contractError,
    } = await supabase
      .from("teacher_contracts")
      .select(
        `
          id,
          teacher_id,
          contract_number,
          version,
          status,
          agreement_date,
          sent_at,
          sent_by,
          accepted_at,
          accepted_ip,
          accepted_user_agent,
          terminated_at,
          termination_reason,
          created_at,
          updated_at
        `
      )
      .eq("teacher_id", teacherId)
      .in("status", [
        "draft",
        "pending_acceptance",
        "accepted",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (contractError) {
      console.error(
        "Teacher contract GET error:",
        contractError
      );

      return NextResponse.json(
        { error: contractError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        role: teacher.role,
        status: teacher.status,
        teacher_number: teacher.teacher_number,
      },
      contract: contract || null,
    });
  } catch (error) {
    console.error(
      "Teacher contract GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the teacher agreement.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* POST                                                                      */
/* Create or send a teacher agreement.                                       */
/*                                                                           */
/* action:                                                                   */
/*   "create" → creates a draft agreement                                    */
/*   "send"   → creates/updates the agreement as pending acceptance          */
/* ========================================================================= */

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const ownerResult = await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const {
      supabase,
      user,
    } = ownerResult;

    const { id: teacherId } = await context.params;

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required." },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY TEACHER                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, status, teacher_number"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error: "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    if (teacher.status !== "active") {
      return NextResponse.json(
        {
          error:
            "An agreement cannot be sent to an inactive teacher.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* READ ACTION                                                           */
    /* --------------------------------------------------------------------- */

    let body: {
      action?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const action =
      String(body.action || "create")
        .trim()
        .toLowerCase();

    if (
      action !== "create" &&
      action !== "send"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use 'create' or 'send'.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CHECK EXISTING CURRENT AGREEMENT                                      */
    /* --------------------------------------------------------------------- */

    const {
      data: existingContract,
      error: existingContractError,
    } = await supabase
      .from("teacher_contracts")
      .select(
        `
          id,
          teacher_id,
          contract_number,
          version,
          status,
          agreement_date,
          sent_at,
          sent_by,
          accepted_at,
          accepted_ip,
          accepted_user_agent,
          terminated_at,
          termination_reason,
          created_at,
          updated_at
        `
      )
      .eq("teacher_id", teacherId)
      .in("status", [
        "draft",
        "pending_acceptance",
        "accepted",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (existingContractError) {
      console.error(
        "Existing teacher contract check error:",
        existingContractError
      );

      return NextResponse.json(
        {
          error:
            existingContractError.message,
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CREATE                                                                 */
    /* --------------------------------------------------------------------- */

    if (!existingContract) {
      const today = new Date()
        .toISOString()
        .split("T")[0];

      const {
        data: contract,
        error: insertError,
      } = await supabase
        .from("teacher_contracts")
        .insert({
          teacher_id: teacherId,
          version: "1.0",
          status:
            action === "send"
              ? "pending_acceptance"
              : "draft",
          agreement_date: today,
          sent_at:
            action === "send"
              ? new Date().toISOString()
              : null,
          sent_by:
            action === "send"
              ? user?.id
              : null,
        })
        .select(
          `
            id,
            teacher_id,
            contract_number,
            version,
            status,
            agreement_date,
            sent_at,
            sent_by,
            accepted_at,
            accepted_ip,
            accepted_user_agent,
            terminated_at,
            termination_reason,
            created_at,
            updated_at
          `
        )
        .single();

      if (insertError) {
        console.error(
          "Teacher contract insert error:",
          insertError
        );

        return NextResponse.json(
          {
            error:
              insertError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          action,
          teacher: {
            id: teacher.id,
            full_name: teacher.full_name,
            teacher_number:
              teacher.teacher_number,
          },
          contract,
        },
        { status: 201 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* PREVENT CHANGING AN ACCEPTED AGREEMENT                                */
    /* --------------------------------------------------------------------- */

    if (
      existingContract.status === "accepted"
    ) {
      return NextResponse.json(
        {
          error:
            "This teacher already has an accepted agreement. Create a new version instead of modifying the accepted agreement.",
          contract:
            existingContract,
        },
        { status: 409 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* EXISTING PENDING AGREEMENT                                             */
    /* --------------------------------------------------------------------- */

    if (
      action === "send" &&
      existingContract.status ===
        "pending_acceptance"
    ) {
      const {
        data: resentContract,
        error: resendError,
      } = await supabase
        .from("teacher_contracts")
        .update({
          sent_at:
            new Date().toISOString(),
          sent_by: user?.id,
        })
        .eq("id", existingContract.id)
        .select(
          `
            id,
            teacher_id,
            contract_number,
            version,
            status,
            agreement_date,
            sent_at,
            sent_by,
            accepted_at,
            accepted_ip,
            accepted_user_agent,
            terminated_at,
            termination_reason,
            created_at,
            updated_at
          `
        )
        .single();

      if (resendError) {
        console.error(
          "Teacher contract resend error:",
          resendError
        );

        return NextResponse.json(
          {
            error:
              resendError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "send",
        resent: true,
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          teacher_number:
            teacher.teacher_number,
        },
        contract: resentContract,
      });
    }

    /* --------------------------------------------------------------------- */
    /* SEND EXISTING DRAFT                                                   */
    /* --------------------------------------------------------------------- */

    if (
      action === "send" &&
      existingContract.status === "draft"
    ) {
      const {
        data: sentContract,
        error: sendError,
      } = await supabase
        .from("teacher_contracts")
        .update({
          status: "pending_acceptance",
          sent_at:
            new Date().toISOString(),
          sent_by: user?.id,
        })
        .eq("id", existingContract.id)
        .select(
          `
            id,
            teacher_id,
            contract_number,
            version,
            status,
            agreement_date,
            sent_at,
            sent_by,
            accepted_at,
            accepted_ip,
            accepted_user_agent,
            terminated_at,
            termination_reason,
            created_at,
            updated_at
          `
        )
        .single();

      if (sendError) {
        console.error(
          "Teacher contract send error:",
          sendError
        );

        return NextResponse.json(
          {
            error:
              sendError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "send",
        resent: false,
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          teacher_number:
            teacher.teacher_number,
        },
        contract: sentContract,
      });
    }

    /* --------------------------------------------------------------------- */
    /* EXISTING DRAFT / DEFAULT RESPONSE                                     */
    /* --------------------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      action: "create",
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        teacher_number:
          teacher.teacher_number,
      },
      contract: existingContract,
    });
  } catch (error) {
    console.error(
      "Teacher contract POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the teacher agreement.",
      },
      { status: 500 }
    );
  }
}