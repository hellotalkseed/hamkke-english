import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type AuthenticatedProfile = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  teacher_number: string | null;
};

type TeacherContract = {
  id: string;
  teacher_id: string;
  contract_number: string;
  version: string;
  status:
    | "draft"
    | "pending_acceptance"
    | "accepted"
    | "terminated";
  agreement_date: string | null;
  accepted_at: string | null;
  accepted_ip: string | null;
  accepted_user_agent: string | null;
  terminated_at: string | null;
  termination_reason: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  sent_by: string | null;
};

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null as AuthenticatedProfile | null,
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  /*
   * Only load the currently authenticated user's profile.
   *
   * We intentionally do NOT load the target teacher's profile here.
   * The Owner may be able to authenticate successfully while RLS
   * prevents reading another teacher's profile row.
   */
  const {
    data: profileData,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, status, teacher_number"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Failed to load authenticated profile:",
      profileError
    );

    return {
      supabase,
      user,
      profile: null as AuthenticatedProfile | null,
      error: NextResponse.json(
        { error: "Failed to load your profile." },
        { status: 500 }
      ),
    };
  }

  const profile =
    profileData as AuthenticatedProfile | null;

  if (!profile) {
    return {
      supabase,
      user,
      profile: null as AuthenticatedProfile | null,
      error: NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      ),
    };
  }

  return {
    supabase,
    user,
    profile,
    error: null,
  };
}

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip");
}

/*
 * Activate a pending teacher using the server-side Admin client.
 *
 * This helper is only called after the route has already verified:
 *
 * 1. the authenticated user is a teacher,
 * 2. the teacher is accessing their own teacher ID, and
 * 3. their own Teacher Agreement is accepted.
 */
async function activatePendingTeacher(
  teacherId: string
) {
  const admin = createAdminClient();

  const {
    data: activatedProfile,
    error: activationError,
  } = await admin
    .from("profiles")
    .update({
      status: "active",
    })
    .eq("id", teacherId)
    .eq("role", "teacher")
    .eq("status", "pending")
    .select("id, role, status")
    .maybeSingle();

  if (activationError) {
    console.error(
      "Failed to activate teacher:",
      activationError
    );

    return {
      success: false,
      error: activationError,
    };
  }

  /*
   * If no row was updated, inspect the current profile.
   *
   * This makes the operation safe to retry. If the teacher
   * was already activated by an earlier request, we treat
   * that as success.
   */
  if (!activatedProfile) {
    const {
      data: currentProfile,
      error: currentProfileError,
    } = await admin
      .from("profiles")
      .select("id, role, status")
      .eq("id", teacherId)
      .maybeSingle();

    if (currentProfileError) {
      console.error(
        "Failed to verify teacher activation:",
        currentProfileError
      );

      return {
        success: false,
        error: currentProfileError,
      };
    }

    if (
      currentProfile?.role === "teacher" &&
      currentProfile?.status === "active"
    ) {
      return {
        success: true,
        error: null,
      };
    }

    return {
      success: false,
      error: new Error(
        "Teacher profile could not be activated."
      ),
    };
  }

  return {
    success: true,
    error: null,
  };
}

const CONTRACT_SELECT = `
  id,
  teacher_id,
  contract_number,
  version,
  status,
  agreement_date,
  accepted_at,
  accepted_ip,
  accepted_user_agent,
  terminated_at,
  termination_reason,
  created_at,
  updated_at,
  sent_at,
  sent_by
`;

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  const {
    supabase,
    user,
    profile,
    error,
  } = await getAuthenticatedProfile();

  if (error) {
    return error;
  }

  if (!user || !profile) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id: teacherId } =
    await context.params;

  if (!teacherId) {
    return NextResponse.json(
      { error: "Teacher ID is required." },
      { status: 400 }
    );
  }

  const isOwner =
    profile.role === "owner" &&
    profile.status === "active";

  /*
   * Pending teachers may access their own agreement
   * during onboarding.
   *
   * Active teachers may continue viewing their
   * accepted agreement afterward.
   */
  const isTeacher =
    profile.role === "teacher" &&
    (
      profile.status === "pending" ||
      profile.status === "active"
    );

  if (!isOwner && !isTeacher) {
    return NextResponse.json(
      { error: "Access denied." },
      { status: 403 }
    );
  }

  /*
   * A teacher can only access their own agreement.
   */
  if (isTeacher && teacherId !== user.id) {
    return NextResponse.json(
      {
        error:
          "You may only access your own agreement.",
      },
      { status: 403 }
    );
  }

  /* ----------------------------------------------------------------------- */
  /* LOAD CONTRACT                                                           */
  /* ----------------------------------------------------------------------- */

  let contractQuery = supabase
    .from("teacher_contracts")
    .select(CONTRACT_SELECT)
    .eq("teacher_id", teacherId);

  /*
   * Teachers must never see drafts.
   */
  if (isTeacher) {
    contractQuery = contractQuery.in("status", [
      "pending_acceptance",
      "accepted",
    ]);
  } else {
    /*
     * Owners can see drafts, pending agreements,
     * and accepted agreements.
     */
    contractQuery = contractQuery.in("status", [
      "draft",
      "pending_acceptance",
      "accepted",
    ]);
  }

  const {
    data: contractData,
    error: contractError,
  } = await contractQuery
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (contractError) {
    console.error(
      "Failed to load teacher contract:",
      contractError
    );

    return NextResponse.json(
      {
        error:
          "Failed to load teacher agreement.",
      },
      { status: 500 }
    );
  }

  const contract =
    contractData as TeacherContract | null;

  return NextResponse.json({
    contract: contract ?? null,
  });
}

/* ========================================================================= */
/* POST                                                                      */
/* ========================================================================= */

export async function POST(
  request: Request,
  context: RouteContext
) {
  const {
    supabase,
    user,
    profile,
    error,
  } = await getAuthenticatedProfile();

  if (error) {
    return error;
  }

  if (!user || !profile) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id: teacherId } =
    await context.params;

  if (!teacherId) {
    return NextResponse.json(
      { error: "Teacher ID is required." },
      { status: 400 }
    );
  }

  let body: {
    action?: "create" | "send" | "accept";
    contractId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const action = body.action;

  if (!action) {
    return NextResponse.json(
      { error: "Action is required." },
      { status: 400 }
    );
  }

  const isOwner =
    profile.role === "owner" &&
    profile.status === "active";

  /*
   * Pending teachers must be able to accept their
   * agreement during onboarding.
   */
  const isTeacher =
    profile.role === "teacher" &&
    (
      profile.status === "pending" ||
      profile.status === "active"
    );

  /* ----------------------------------------------------------------------- */
  /* AUTHORIZATION                                                           */
  /* ----------------------------------------------------------------------- */

  /*
   * CREATE and SEND are Owner-only.
   */
  if (
    action === "create" ||
    action === "send"
  ) {
    if (!isOwner) {
      return NextResponse.json(
        {
          error:
            "Only an active owner may manage teacher agreements.",
        },
        { status: 403 }
      );
    }
  }

  /*
   * ACCEPT is Teacher-only.
   */
  if (action === "accept") {
    if (!isTeacher) {
      return NextResponse.json(
        {
          error:
            "Only the teacher may accept their agreement.",
        },
        { status: 403 }
      );
    }

    if (teacherId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You may only accept your own agreement.",
        },
        { status: 403 }
      );
    }
  }

  /* ----------------------------------------------------------------------- */
  /* TEACHER ACCEPTANCE                                                      */
  /* ----------------------------------------------------------------------- */

  if (action === "accept") {
    if (!body.contractId) {
      return NextResponse.json(
        {
          error:
            "Contract ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: contractData,
      error: contractError,
    } = await supabase
      .from("teacher_contracts")
      .select(CONTRACT_SELECT)
      .eq("id", body.contractId)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (contractError) {
      console.error(
        "Failed to load teacher contract for acceptance:",
        contractError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load teacher agreement.",
        },
        { status: 500 }
      );
    }

    const contract =
      contractData as TeacherContract | null;

    if (!contract) {
      return NextResponse.json(
        {
          error:
            "Teacher agreement not found.",
        },
        { status: 404 }
      );
    }

    /*
     * ---------------------------------------------------------
     * RECOVERY FOR AN ALREADY ACCEPTED AGREEMENT
     * ---------------------------------------------------------
     *
     * Normally, an accepted agreement means the teacher is
     * already active.
     *
     * If agreement acceptance succeeded previously but profile
     * activation failed, however, the teacher could still be
     * pending.
     *
     * In that case, retry activation instead of permanently
     * trapping the teacher behind an "already accepted" error.
     */
    if (contract.status === "accepted") {
      if (profile.status === "pending") {
        const activation =
          await activatePendingTeacher(
            teacherId
          );

        if (!activation.success) {
          return NextResponse.json(
            {
              error:
                "Your agreement has been accepted, but we couldn't activate your teacher account. Please contact Hamkke.",
              contract,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message:
            "Teacher agreement accepted successfully.",
          contract,
          teacherStatus: "active",
          recovered: true,
        });
      }

      /*
       * An active teacher attempting to accept the same
       * agreement again receives the normal conflict response.
       */
      return NextResponse.json(
        {
          error:
            "This agreement has already been accepted.",
          contract,
        },
        { status: 409 }
      );
    }

    /*
     * Only a sent agreement can be accepted.
     */
    if (
      contract.status !==
      "pending_acceptance"
    ) {
      return NextResponse.json(
        {
          error:
            "This agreement is not currently available for acceptance.",
        },
        { status: 409 }
      );
    }

    const acceptedAt =
      new Date().toISOString();

    const acceptedIp =
      getClientIp(request);

    const acceptedUserAgent =
      request.headers.get("user-agent");

    /* --------------------------------------------------------------------- */
    /* RECORD ACCEPTANCE                                                     */
    /* --------------------------------------------------------------------- */

    const {
      data: updatedContractData,
      error: updateError,
    } = await supabase
      .from("teacher_contracts")
      .update({
        status: "accepted",
        accepted_at: acceptedAt,
        accepted_ip: acceptedIp,
        accepted_user_agent:
          acceptedUserAgent,
        updated_at: acceptedAt,
      })
      .eq("id", contract.id)
      .eq("teacher_id", teacherId)
      .eq("status", "pending_acceptance")
      .select(CONTRACT_SELECT)
      .single();

    if (
      updateError ||
      !updatedContractData
    ) {
      console.error(
        "Failed to accept teacher contract:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to accept teacher agreement.",
        },
        { status: 500 }
      );
    }

    const updatedContract =
      updatedContractData as TeacherContract;

    /* --------------------------------------------------------------------- */
    /* ACTIVATE PENDING TEACHER                                              */
    /* --------------------------------------------------------------------- */

    /*
     * Only pending teachers require activation.
     *
     * Existing active teachers may still accept a newly issued
     * agreement in the future without changing their status.
     */
    if (profile.status === "pending") {
      const activation =
        await activatePendingTeacher(
          teacherId
        );

      if (!activation.success) {
        /*
         * The agreement is already accepted at this point.
         *
         * The recovery branch above makes this state repairable:
         * another acceptance attempt can retry activation.
         */
        return NextResponse.json(
          {
            error:
              "Your agreement was accepted, but we couldn't activate your teacher account. Please try again or contact Hamkke.",
            contract: updatedContract,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Teacher agreement accepted successfully.",
      contract: updatedContract,
      teacherStatus: "active",
    });
  }

  /* ----------------------------------------------------------------------- */
  /* OWNER CONTRACT MANAGEMENT                                               */
  /* ----------------------------------------------------------------------- */

  if (!isOwner) {
    return NextResponse.json(
      { error: "Access denied." },
      { status: 403 }
    );
  }

  /* ----------------------------------------------------------------------- */
  /* LOAD EXISTING CONTRACT                                                  */
  /* ----------------------------------------------------------------------- */

  const {
    data: existingContractData,
    error: existingError,
  } = await supabase
    .from("teacher_contracts")
    .select(CONTRACT_SELECT)
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

  if (existingError) {
    console.error(
      "Failed to load existing teacher contract:",
      existingError
    );

    return NextResponse.json(
      {
        error:
          "Failed to load teacher agreement.",
      },
      { status: 500 }
    );
  }

  const existingContract =
    existingContractData as TeacherContract | null;

  /* ----------------------------------------------------------------------- */
  /* ACCEPTED CONTRACT PROTECTION                                            */
  /* ----------------------------------------------------------------------- */

  if (
    existingContract?.status ===
    "accepted"
  ) {
    return NextResponse.json(
      {
        error:
          "This agreement has already been accepted. Create a new version instead of modifying the accepted agreement.",
        contract: existingContract,
      },
      { status: 409 }
    );
  }

  /* ----------------------------------------------------------------------- */
  /* CREATE                                                                  */
  /* ----------------------------------------------------------------------- */

  if (action === "create") {
    /*
     * Do not create duplicates.
     */
    if (existingContract) {
      return NextResponse.json({
        success: true,
        contract: existingContract,
      });
    }

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const {
      data: contractNumberData,
      error: numberError,
    } = await supabase.rpc(
      "generate_teacher_contract_number"
    );

    if (numberError) {
      console.error(
        "Failed to generate teacher contract number:",
        numberError
      );

      return NextResponse.json(
        {
          error:
            "Failed to create teacher agreement.",
        },
        { status: 500 }
      );
    }

    const contractNumber =
      contractNumberData as string;

    const {
      data: newContractData,
      error: createError,
    } = await supabase
      .from("teacher_contracts")
      .insert({
        teacher_id: teacherId,
        contract_number:
          contractNumber,
        version: "1.0",
        status: "draft",
        agreement_date: today,
      })
      .select(CONTRACT_SELECT)
      .single();

    if (
      createError ||
      !newContractData
    ) {
      console.error(
        "Failed to create teacher contract:",
        createError
      );

      return NextResponse.json(
        {
          error:
            "Failed to create teacher agreement.",
        },
        { status: 500 }
      );
    }

    const newContract =
      newContractData as TeacherContract;

    return NextResponse.json({
      success: true,
      contract: newContract,
    });
  }

  /* ----------------------------------------------------------------------- */
  /* SEND                                                                    */
  /* ----------------------------------------------------------------------- */

  if (action === "send") {
    if (!existingContract) {
      return NextResponse.json(
        {
          error:
            "Create the teacher agreement before sending it.",
        },
        { status: 400 }
      );
    }

    const sentAt =
      new Date().toISOString();

    const updatePayload: Record<
      string,
      unknown
    > = {
      sent_at: sentAt,
      sent_by: user.id,
      updated_at: sentAt,
    };

    /*
     * A draft becomes pending acceptance
     * when first sent.
     *
     * Resending a pending agreement keeps
     * it pending.
     */
    if (
      existingContract.status ===
      "draft"
    ) {
      updatePayload.status =
        "pending_acceptance";
    }

    const {
      data: updatedContractData,
      error: updateError,
    } = await supabase
      .from("teacher_contracts")
      .update(updatePayload)
      .eq("id", existingContract.id)
      .eq("teacher_id", teacherId)
      .select(CONTRACT_SELECT)
      .single();

    if (
      updateError ||
      !updatedContractData
    ) {
      console.error(
        "Failed to send teacher contract:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to send teacher agreement.",
        },
        { status: 500 }
      );
    }

    const updatedContract =
      updatedContractData as TeacherContract;

    return NextResponse.json({
      success: true,
      message:
        "Teacher agreement sent successfully.",
      contract: updatedContract,
    });
  }

  /* ----------------------------------------------------------------------- */
  /* UNSUPPORTED                                                             */
  /* ----------------------------------------------------------------------- */

  return NextResponse.json(
    { error: "Unsupported action." },
    { status: 400 }
  );
}