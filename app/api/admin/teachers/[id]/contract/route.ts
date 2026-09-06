import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  /*
   * Keep the error response handling explicit.
   *
   * Next.js route handlers must return a Response.
   * The previous `return error` pattern could be inferred
   * as returning `null`, which caused the production build
   * type error.
   */
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

  const isTeacher =
    profile.role === "teacher" &&
    profile.status === "active";

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

  /*
   * The TeacherAgreement component already receives the teacher
   * information from the page. It only needs the contract from
   * this endpoint.
   */
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

  /*
   * Keep the error response handling explicit.
   *
   * This guarantees that the POST handler also always returns
   * a valid Response and avoids the same Next.js route-handler
   * type error.
   */
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

  const isTeacher =
    profile.role === "teacher" &&
    profile.status === "active";

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
     * Do not accept an already accepted agreement.
     */
    if (contract.status === "accepted") {
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

    return NextResponse.json({
      success: true,
      message:
        "Teacher agreement accepted successfully.",
      contract: updatedContract,
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
  /* SEND                                                                     */
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
  /* UNSUPPORTED                                                              */
  /* ----------------------------------------------------------------------- */

  return NextResponse.json(
    { error: "Unsupported action." },
    { status: 400 }
  );
}