import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENT_TEACHER_AGREEMENT } from "@/lib/teacher-agreements/versions";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

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
  agreement_content: string | null;
  agreement_content_hash: string | null;
  framework_version: string | null;
  policy_version: string | null;
  teacher_full_name: string | null;
  teacher_number_snapshot: string | null;
};

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function hashAgreementContent(
  content: string
) {
  return createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function hasValidAgreementSnapshot(
  contract: TeacherContract
) {
  if (
    !contract.teacher_full_name?.trim() ||
    !contract.agreement_content ||
    !contract.agreement_content_hash ||
    !contract.framework_version ||
    !contract.policy_version
  ) {
    return false;
  }

  return (
    hashAgreementContent(
      contract.agreement_content
    ) ===
    contract.agreement_content_hash
  );
}

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      profile: null as AuthenticatedProfile | null,
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  /*
   * Only load the currently authenticated user's own profile.
   *
   * This continues to use the authenticated Supabase client so
   * authentication and the user's own profile remain protected
   * by the normal application/RLS flow.
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
      user,
      profile: null as AuthenticatedProfile | null,
      error: NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      ),
    };
  }

  return {
    user,
    profile,
    error: null,
  };
}

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return request.headers.get(
    "x-real-ip"
  );
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
      currentProfile?.role ===
        "teacher" &&
      currentProfile?.status ===
        "active"
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
  sent_by,
  agreement_content,
  agreement_content_hash,
  framework_version,
  policy_version,
  teacher_full_name,
  teacher_number_snapshot
`;

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  const {
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
      {
        error:
          "Teacher ID is required.",
      },
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
    (profile.status === "pending" ||
      profile.status === "active");

  if (!isOwner && !isTeacher) {
    return NextResponse.json(
      { error: "Access denied." },
      { status: 403 }
    );
  }

  /*
   * A teacher may only access their own agreement.
   */
  if (
    isTeacher &&
    teacherId !== user.id
  ) {
    return NextResponse.json(
      {
        error:
          "You may only access your own agreement.",
      },
      { status: 403 }
    );
  }

  /*
   * Authorization has already been completed above.
   *
   * Use the server-side Admin client for the agreement
   * query so a pending teacher does not depend on a
   * broader teacher_contracts RLS SELECT policy.
   */
  const admin = createAdminClient();

  /* ----------------------------------------------------------------------- */
  /* LOAD CONTRACT                                                           */
  /* ----------------------------------------------------------------------- */

  let contractQuery = admin
    .from("teacher_contracts")
    .select(CONTRACT_SELECT)
    .eq(
      "teacher_id",
      teacherId
    );

  // A teacher may view only issued records, including their own history.
  if (isTeacher) {
    contractQuery = contractQuery.in("status", ["pending_acceptance", "accepted", "terminated"]);
  }
  const { data, error: contractError } = await contractQuery
    .order("created_at", { ascending: false }).order("id", { ascending: false });
  if (contractError) {
    console.error("Failed to load teacher agreements:", contractError);
    return NextResponse.json({ error: "Failed to load teacher agreements." }, { status: 500 });
  }
  const contracts = (data as TeacherContract[] ?? []).map((item) => ({
    ...item,
    snapshot_valid: hasValidAgreementSnapshot(item),
  }));
  const currentAccepted = [...contracts]
    .filter((item) => item.status === "accepted")
    .sort((a, b) => (b.accepted_at ?? "").localeCompare(a.accepted_at ?? "") || b.created_at.localeCompare(a.created_at))[0] ?? null;
  return NextResponse.json({
    contract: contracts[0] ?? null,
    contracts,
    currentAcceptedId: currentAccepted?.id ?? null,
    currentVersion: CURRENT_TEACHER_AGREEMENT.version,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

/* ========================================================================= */
/* POST                                                                      */
/* ========================================================================= */

export async function POST(
  request: Request,
  context: RouteContext
) {
  const {
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
      {
        error:
          "Teacher ID is required.",
      },
      { status: 400 }
    );
  }

  let body: {
    action?:
      | "create"
      | "send"
      | "accept"
      | "save_name";
    contractId?: string | null;
    fullName?: string;
    revision?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request body.",
      },
      { status: 400 }
    );
  }

  if (
    !body || typeof body !== "object" || Array.isArray(body) ||
    (body.contractId != null && typeof body.contractId !== "string")
  ) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  if (action && !["create", "send", "accept", "save_name"].includes(action)) {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  if (!action) {
    return NextResponse.json(
      {
        error:
          "Action is required.",
      },
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
    (profile.status === "pending" ||
      profile.status === "active");

  /* ----------------------------------------------------------------------- */
  /* AUTHORIZATION                                                           */
  /* ----------------------------------------------------------------------- */

  /*
   * CREATE and SEND are Owner-only.
   */
  if (
    action === "create" ||
    action === "send" || action === "save_name"
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

    if (
      teacherId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You may only accept your own agreement.",
        },
        { status: 403 }
      );
    }
  }

  /*
   * All access to teacher_contracts below this point is
   * performed with the server-side Admin client.
   *
   * The route itself has already enforced who may perform
   * each operation and which teacher ID they may access.
   */
  const admin =
    createAdminClient();

  /* ----------------------------------------------------------------------- */
  /* TEACHER ACCEPTANCE                                                      */
  /* ----------------------------------------------------------------------- */

  if (
    action === "accept"
  ) {
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
    } = await admin
      .from("teacher_contracts")
      .select(CONTRACT_SELECT)
      .eq(
        "id",
        body.contractId
      )
      .eq(
        "teacher_id",
        teacherId
      )
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

    const legacyAccepted =
      contract.status === "accepted" &&
      contract.version === "1.0" &&
      contract.agreement_content === null &&
      contract.agreement_content_hash === null &&
      contract.framework_version === null &&
      contract.policy_version === null;
    if (contract.status === "accepted" && !legacyAccepted && !hasValidAgreementSnapshot(contract)) {
      return NextResponse.json(
        { error: "Agreement snapshot integrity check failed." },
        { status: 409 }
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
    if (
      contract.status ===
      "accepted"
    ) {
      if (
        profile.status ===
        "pending"
      ) {
        const activation =
          await activatePendingTeacher(
            teacherId
          );

        if (
          !activation.success
        ) {
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
          teacherStatus:
            "active",
          recovered: true,
        });
      }

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
      contract.status ===
        "pending_acceptance" &&
      !hasValidAgreementSnapshot(
        contract
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Agreement snapshot integrity check failed. The agreement cannot be accepted.",
        },
        { status: 409 }
      );
    }

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

    if (!contract.sent_at) {
      return NextResponse.json(
        { error: "This agreement has no sending record. Please contact Hamkke." },
        { status: 409 }
      );
    }

    const acceptedAt =
      new Date().toISOString();

    const acceptedIp =
      getClientIp(request);

    const acceptedUserAgent =
      request.headers.get(
        "user-agent"
      );

    /* --------------------------------------------------------------------- */
    /* RECORD ACCEPTANCE                                                     */
    /* --------------------------------------------------------------------- */

    const {
      data: updatedContractData,
      error: updateError,
    } = await admin
      .from("teacher_contracts")
      .update({
        status: "accepted",
        accepted_at:
          acceptedAt,
        accepted_ip:
          acceptedIp,
        accepted_user_agent:
          acceptedUserAgent,
        updated_at:
          acceptedAt,
      })
      .eq(
        "id",
        contract.id
      )
      .eq(
        "teacher_id",
        teacherId
      )
      .eq(
        "status",
        "pending_acceptance"
      )
      .eq("updated_at", contract.updated_at)
      .eq("agreement_content_hash", contract.agreement_content_hash!)
      .select(
        CONTRACT_SELECT
      )
      .maybeSingle();

    if (!updateError && !updatedContractData) {
      return NextResponse.json(
        { error: "The agreement changed during acceptance. Reload and try again." },
        { status: 409 }
      );
    }

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
     * Existing active teachers may still accept a newly
     * issued agreement in the future without changing
     * their status.
     */
    if (
      profile.status ===
      "pending"
    ) {
      const activation =
        await activatePendingTeacher(
          teacherId
        );

      if (
        !activation.success
      ) {
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
            contract:
              updatedContract,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Teacher agreement accepted successfully.",
      contract:
        updatedContract,
      teacherStatus:
        "active",
    });
  }

  /* ----------------------------------------------------------------------- */
  /* OWNER CONTRACT MANAGEMENT                                               */
  /* ----------------------------------------------------------------------- */

  if (!isOwner) {
    return NextResponse.json(
      {
        error:
          "Access denied.",
      },
      { status: 403 }
    );
  }

  if (action === "save_name") {
    if (!body.contractId || typeof body.revision !== "string") {
      return NextResponse.json({ error: "Reload the draft before updating its name." }, { status: 400 });
    }
    const { data: identity, error: identityError } = await admin.from("teacher_document_profiles")
      .select("full_name").eq("teacher_id", teacherId).maybeSingle();
    if (identityError) return NextResponse.json({ error: "Unable to load the teacher's document full name." }, { status: 500 });
    const name = identity?.full_name?.trim();
    if (!name) return NextResponse.json({ error: "Ask the teacher to save their full name in My Profile first." }, { status: 409 });
    const { data, error } = await admin.from("teacher_contracts")
      .update({ teacher_full_name: name })
      .eq("id", body.contractId).eq("teacher_id", teacherId)
      .eq("status", "draft").is("sent_at", null).is("accepted_at", null)
      .eq("updated_at", body.revision).select(CONTRACT_SELECT).maybeSingle();
    if (error) return NextResponse.json({ error: "Unable to save the agreement name." }, { status: 500 });
    if (!data) return NextResponse.json({ error: "This draft changed or was already sent. Reload before editing." }, { status: 409 });
    return NextResponse.json({ contract: data });
  }

  /* ----------------------------------------------------------------------- */
  /* LOAD EXISTING CONTRACT                                                  */
  /* ----------------------------------------------------------------------- */

  const {
    data: existingContractData,
    error: existingError,
  } = await admin
    .from("teacher_contracts")
    .select(CONTRACT_SELECT)
    .eq(
      "teacher_id",
      teacherId
    )
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

  /* CREATE                                                                  */
  /* ----------------------------------------------------------------------- */

  if (
    action === "create"
  ) {
    const currentAgreement =
      CURRENT_TEACHER_AGREEMENT;

    if (
      !currentAgreement.version || !currentAgreement.content.trim() ||
      !currentAgreement.frameworkVersion || !currentAgreement.policyVersion ||
      hashAgreementContent(currentAgreement.content) !== currentAgreement.contentHash
    ) {
      return NextResponse.json({ error: "The current agreement source is invalid." }, { status: 500 });
    }

    const { data: targetTeacher, error: targetError } = await admin
      .from("profiles").select("id, role, status, full_name, teacher_number").eq("id", teacherId).maybeSingle();
    if (targetError) {
      return NextResponse.json({ error: "Failed to load teacher profile." }, { status: 500 });
    }
    if (!targetTeacher || targetTeacher.role !== "teacher") {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    const { data: documentProfile, error: documentError } = await admin.from("teacher_document_profiles")
      .select("full_name").eq("teacher_id", teacherId).maybeSingle();
    if (documentError) return NextResponse.json({ error: "Unable to load the teacher's document full name." }, { status: 500 });
    const teacherFullName = documentProfile?.full_name?.trim();
    if (!teacherFullName) {
      return NextResponse.json(
        { error: "Save the teacher's full name in their profile before creating an agreement." },
        { status: 409 }
      );
    }

    /*
     * Agreement versions are global Hamkke versions.
     * An older accepted agreement does not block the
     * teacher from receiving the current version.
     */
    const {
      data: currentVersionData,
      error: currentVersionError,
    } = await admin
      .from("teacher_contracts")
      .select(CONTRACT_SELECT)
      .eq(
        "teacher_id",
        teacherId
      )
      .eq(
        "version",
        currentAgreement.version
      )
      .maybeSingle();

    if (currentVersionError) {
      console.error(
        "Failed to check current agreement version:",
        currentVersionError
      );

      return NextResponse.json(
        {
          error:
            "Failed to check teacher agreement version.",
        },
        { status: 500 }
      );
    }

    const currentVersionContract =
      currentVersionData as TeacherContract | null;

    /*
     * One record per teacher per agreement version.
     */
    if (currentVersionContract) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        contract:
          currentVersionContract,
      });
    }

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const {
      data: contractNumberData,
      error: numberError,
    } = await admin.rpc(
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
    } = await admin
      .from("teacher_contracts")
      .insert({
        teacher_id:
          teacherId,
        teacher_full_name: teacherFullName,
        teacher_number_snapshot: targetTeacher.teacher_number ?? null,

        contract_number:
          contractNumber,

        version:
          currentAgreement.version,

        status:
          "draft",

        agreement_date:
          today,

        agreement_content:
          currentAgreement.content,

        agreement_content_hash:
          currentAgreement.contentHash,

        framework_version:
          currentAgreement.frameworkVersion,

        policy_version:
          currentAgreement.policyVersion,
      })
      .select(
        CONTRACT_SELECT
      )
      .single();

    // The database UNIQUE (teacher_id, version) resolves simultaneous creates.
    // Return only the same teacher/version winner, never an unrelated number conflict.
    if (createError?.code === "23505") {
      const { data: winner, error: winnerError } = await admin
        .from("teacher_contracts").select(CONTRACT_SELECT)
        .eq("teacher_id", teacherId).eq("version", currentAgreement.version)
        .maybeSingle();
      if (!winnerError && winner) {
        return NextResponse.json({ success: true, alreadyExists: true, contract: winner });
      }
      return NextResponse.json(
        { error: "An agreement creation conflict occurred. Reload and try again." },
        { status: 409 }
      );
    }

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
      contract:
        newContract,
    });
  }

  /* ----------------------------------------------------------------------- */
  /* SEND                                                                    */
  /* ----------------------------------------------------------------------- */

  if (
    action === "send"
  ) {
    let contractToSend =
      existingContract;

    /*
     * Prefer an explicitly requested contract version.
     */
    if (body.contractId) {
      const {
        data: requestedContractData,
        error: requestedContractError,
      } = await admin
        .from("teacher_contracts")
        .select(CONTRACT_SELECT)
        .eq(
          "id",
          body.contractId
        )
        .eq(
          "teacher_id",
          teacherId
        )
        .maybeSingle();

      if (requestedContractError) {
        console.error(
          "Failed to load agreement for sending:",
          requestedContractError
        );

        return NextResponse.json(
          {
            error:
              "Failed to load teacher agreement.",
          },
          { status: 500 }
        );
      }

      contractToSend =
        requestedContractData as TeacherContract | null;
    }

    if (!contractToSend) {
      return NextResponse.json(
        {
          error:
            "Create the teacher agreement before sending it.",
        },
        { status: 400 }
      );
    }

    if (
      contractToSend.status ===
      "accepted"
    ) {
      return NextResponse.json(
        {
          error:
            "An accepted agreement cannot be sent again.",
          contract:
            contractToSend,
        },
        { status: 409 }
      );
    }

    if (
      contractToSend.status !== "draft" &&
      contractToSend.status !==
        "pending_acceptance"
    ) {
      return NextResponse.json(
        {
          error:
            "This agreement cannot be sent in its current status.",
        },
        { status: 409 }
      );
    }

    /*
     * A new agreement may only be sent when the exact
     * stored content matches its stored SHA-256 hash.
     */
    if (
      !hasValidAgreementSnapshot(
        contractToSend
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Agreement snapshot integrity check failed. Create a new agreement version instead of sending this record.",
        },
        { status: 409 }
      );
    }

    // Retrying send must not overwrite the original sending evidence.
    if (contractToSend.status === "pending_acceptance") {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: "Teacher agreement is already available for acceptance.",
        contract: contractToSend,
      });
    }

    if (contractToSend.sent_at) {
      return NextResponse.json(
        { error: "This draft already has a sending record. Please review its history." },
        { status: 409 }
      );
    }

    const { data: documentProfile, error: documentError } = await admin.from("teacher_document_profiles")
      .select("full_name").eq("teacher_id", teacherId).maybeSingle();
    if (documentError) return NextResponse.json({ error: "Unable to verify the teacher's document full name." }, { status: 500 });
    if (!documentProfile?.full_name?.trim() || contractToSend.teacher_full_name !== documentProfile.full_name.trim()) {
      return NextResponse.json({ error: "The draft name does not match the teacher's document profile. Use profile full name, review the draft, then send again." }, { status: 409 });
    }

    const sentAt = new Date().toISOString();
    const updatePayload = {
      status: "pending_acceptance",
      sent_at: sentAt,
      sent_by: user.id,
      updated_at: sentAt,
    };

    const {
      data: updatedContractData,
      error: updateError,
    } = await admin
      .from("teacher_contracts")
      .update(
        updatePayload
      )
      .eq(
        "id",
        contractToSend.id
      )
      .eq(
        "teacher_id",
        teacherId
      )
      .eq("status", "draft")
      .is("sent_at", null)
      .eq("updated_at", contractToSend.updated_at)
      .eq("agreement_content_hash", contractToSend.agreement_content_hash!)
      .select(CONTRACT_SELECT)
      .maybeSingle();

    if (!updateError && !updatedContractData) {
      return NextResponse.json(
        { error: "The agreement changed during sending. Reload and try again." },
        { status: 409 }
      );
    }

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
      contract:
        updatedContract,
    });
  }

  /* ----------------------------------------------------------------------- */
  /* UNSUPPORTED                                                             */
  /* ----------------------------------------------------------------------- */

  return NextResponse.json(
    {
      error:
        "Unsupported action.",
    },
    { status: 400 }
  );
}