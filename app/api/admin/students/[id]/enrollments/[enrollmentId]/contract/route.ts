import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
  }>;
}

interface EnrollmentParticipant {
  student_id: string;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id, enrollmentId } = await params;

  const formData = await request.formData();

  const locale =
    String(
      formData.get("locale") || "en"
    ).trim();

  const supabase =
    await createClient();

  /* ======================================================================== */
  /* STEP 1: VERIFY ENROLLMENT                                                */
  /* ======================================================================== */

  /*
   * Individual enrollment:
   *
   *   enrollments.student_id = student ID
   *
   * Shared enrollment:
   *
   *   enrollments.student_id = NULL
   *
   * Therefore we cannot use:
   *
   *   .eq("student_id", id)
   *
   * because that would reject shared enrollments.
   *
   * We first find the enrollment by ID, then verify whether
   * the selected student is authorized to access it.
   */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        status
      `
    )
    .eq(
      "id",
      enrollmentId
    )
    .single();

  if (
    enrollmentError ||
    !enrollment
  ) {
    console.error(
      "ENROLLMENT LOOKUP ERROR:",
      {
        enrollmentId,
        studentId: id,
        code:
          enrollmentError?.code,
        message:
          enrollmentError?.message,
        details:
          enrollmentError?.details,
        hint:
          enrollmentError?.hint,
      }
    );

    return new NextResponse(
      "Enrollment not found.",
      { status: 404 }
    );
  }

  /* ======================================================================== */
  /* STEP 2: DETERMINE ENROLLMENT TYPE                                        */
  /* ======================================================================== */

  const isIndividual =
    enrollment.student_id !== null;

  const isShared =
    enrollment.student_id === null;

  /* ======================================================================== */
  /* STEP 3: VERIFY STUDENT ACCESS                                            */
  /* ======================================================================== */

  if (isIndividual) {
    /*
     * Individual enrollment:
     *
     * The enrollment must directly belong to the
     * student whose record is being managed.
     */

    if (
      enrollment.student_id !== id
    ) {
      console.error(
        "INDIVIDUAL ENROLLMENT OWNERSHIP MISMATCH:",
        {
          enrollmentId,
          enrollmentStudentId:
            enrollment.student_id,
          requestedStudentId:
            id,
        }
      );

      return new NextResponse(
        "This enrollment does not belong to the selected student.",
        { status: 403 }
      );
    }
  }

  if (isShared) {
    /*
     * Shared enrollment:
     *
     * The enrollment itself has no student_id.
     *
     * We therefore verify that the selected student
     * exists in enrollment_students.
     */

    const {
      data: participant,
      error: participantError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          student_id
        `
      )
      .eq(
        "enrollment_id",
        enrollmentId
      )
      .eq(
        "student_id",
        id
      )
      .maybeSingle();

    if (participantError) {
      console.error(
        "SHARED ENROLLMENT PARTICIPANT LOOKUP ERROR:",
        {
          enrollmentId,
          studentId: id,
          code:
            participantError.code,
          message:
            participantError.message,
          details:
            participantError.details,
          hint:
            participantError.hint,
        }
      );

      return new NextResponse(
        "Unable to verify shared enrollment participation.",
        { status: 500 }
      );
    }

    if (!participant) {
      console.error(
        "SHARED ENROLLMENT PARTICIPATION DENIED:",
        {
          enrollmentId,
          studentId: id,
        }
      );

      return new NextResponse(
        "The selected student is not part of this shared enrollment.",
        { status: 403 }
      );
    }
  }

  /* ======================================================================== */
  /* STEP 4: VERIFY SHARED ENROLLMENT STRUCTURE                               */
  /* ======================================================================== */

  if (isShared) {
    /*
     * A valid shared enrollment should have at least
     * two participating students.
     */

    const {
      data: participants,
      error: participantsError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          student_id
        `
      )
      .eq(
        "enrollment_id",
        enrollmentId
      );

    if (participantsError) {
      console.error(
        "SHARED PARTICIPANTS LOOKUP ERROR:",
        {
          enrollmentId,
          code:
            participantsError.code,
          message:
            participantsError.message,
          details:
            participantsError.details,
          hint:
            participantsError.hint,
        }
      );

      return new NextResponse(
        "Unable to verify shared enrollment participants.",
        { status: 500 }
      );
    }

    if (
      !participants ||
      participants.length < 2
    ) {
      console.error(
        "INVALID SHARED ENROLLMENT:",
        {
          enrollmentId,
          participants,
        }
      );

      return new NextResponse(
        "This shared enrollment does not have enough participating students.",
        { status: 400 }
      );
    }
  }

  /* ======================================================================== */
  /* STEP 5: CHECK WHETHER CONTRACT ALREADY EXISTS                            */
  /* ======================================================================== */

  /*
   * A contract belongs to the enrollment, not to an individual
   * participant.
   *
   * Therefore:
   *
   * Individual:
   *   enrollment → one contract
   *
   * Shared:
   *   enrollment → one contract
   *
   * We NEVER create one contract per participant.
   */

  const {
    data: existingContract,
    error: existingContractError,
  } = await supabase
    .from("contracts")
    .select(
      `
        id,
        enrollment_id,
        status
      `
    )
    .eq(
      "enrollment_id",
      enrollmentId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (existingContractError) {
    console.error(
      "EXISTING CONTRACT LOOKUP ERROR:",
      {
        enrollmentId,
        code:
          existingContractError.code,
        message:
          existingContractError.message,
        details:
          existingContractError.details,
        hint:
          existingContractError.hint,
      }
    );

    return new NextResponse(
      "Unable to check for an existing contract.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 6: REDIRECT TO EXISTING CONTRACT                                   */
  /* ======================================================================== */

  if (existingContract) {
    /*
     * Do not create duplicate contracts.
     *
     * Regardless of whether the enrollment is individual
     * or shared, there should be one contract for the
     * enrollment.
     */

    if (
      existingContract.enrollment_id !==
      enrollmentId
    ) {
      console.error(
        "CONTRACT ENROLLMENT MISMATCH:",
        {
          contractId:
            existingContract.id,
          contractEnrollmentId:
            existingContract.enrollment_id,
          enrollmentId,
        }
      );

      return new NextResponse(
        "The existing contract does not belong to this enrollment.",
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      new URL(
        `/${locale}/admin/students/${id}/contracts/${existingContract.id}`,
        request.url
      )
    );
  }

  /* ======================================================================== */
  /* STEP 7: CREATE CONTRACT                                                  */
  /* ======================================================================== */

  /*
   * IMPORTANT:
   *
   * The contract starts as:
   *
   *     for_review
   *
   * NOT:
   *
   *     draft
   *
   * Payment confirmation later changes the enrollment/contract
   * through the database activation workflow.
   *
   * Expected lifecycle:
   *
   *     enrollment
   *          ↓
   *     pending
   *          ↓
   *     contract = for_review
   *          ↓
   *     payment = pending
   *          ↓
   *     payment confirmed
   *          ↓
   *     payment = paid
   *          ↓
   *     database trigger
   *          ↓
   *     enrollment = active
   *     contract = active
   *     lessons generated
   */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id:
        enrollmentId,

      status:
        "for_review",
    })
    .select(
      `
        id,
        enrollment_id,
        status
      `
    )
    .single();

  /* ======================================================================== */
  /* STEP 8: HANDLE CONTRACT CREATION ERROR                                  */
  /* ======================================================================== */

  if (
    contractError ||
    !contract
  ) {
    console.error(
      "CONTRACT CREATION ERROR:",
      {
        enrollmentId,
        enrollmentType:
          isShared
            ? "shared"
            : "individual",
        code:
          contractError?.code,
        message:
          contractError?.message,
        details:
          contractError?.details,
        hint:
          contractError?.hint,
      }
    );

    return new NextResponse(
      `Unable to create contract.

Code: ${
        contractError?.code ||
        "unknown"
      }

Message: ${
        contractError?.message ||
        "unknown"
      }

Details: ${
        contractError?.details ||
        "none"
      }

Hint: ${
        contractError?.hint ||
        "none"
      }`,
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 9: VERIFY CREATED CONTRACT                                         */
  /* ======================================================================== */

  const {
    data: verifiedContract,
    error: verificationError,
  } = await supabase
    .from("contracts")
    .select(
      `
        id,
        enrollment_id,
        status
      `
    )
    .eq(
      "id",
      contract.id
    )
    .single();

  if (
    verificationError ||
    !verifiedContract
  ) {
    console.error(
      "CONTRACT VERIFICATION ERROR:",
      {
        enrollmentId,
        contractId:
          contract.id,
        code:
          verificationError?.code,
        message:
          verificationError?.message,
        details:
          verificationError?.details,
        hint:
          verificationError?.hint,
      }
    );

    return new NextResponse(
      "Contract was created, but could not be verified.",
      { status: 500 }
    );
  }

  if (
    verifiedContract.enrollment_id !==
    enrollmentId
  ) {
    console.error(
      "CREATED CONTRACT ENROLLMENT MISMATCH:",
      {
        contractId:
          verifiedContract.id,
        contractEnrollmentId:
          verifiedContract.enrollment_id,
        enrollmentId,
      }
    );

    return new NextResponse(
      "Contract was created, but it does not belong to the selected enrollment.",
      { status: 500 }
    );
  }

  if (
    verifiedContract.status !==
    "for_review"
  ) {
    console.error(
      "CONTRACT STATUS VERIFICATION FAILED:",
      {
        contractId:
          verifiedContract.id,
        status:
          verifiedContract.status,
      }
    );

    return new NextResponse(
      "Contract was created, but its status could not be verified.",
      { status: 500 }
    );
  }

  /* ======================================================================== */
  /* STEP 10: FINAL LOG                                                       */
  /* ======================================================================== */

  console.log(
    "CONTRACT CREATED:",
    {
      contractId:
        verifiedContract.id,

      enrollmentId,

      enrollmentType:
        isShared
          ? "shared"
          : "individual",

      originatingStudentId:
        id,

      enrollmentStudentId:
        enrollment.student_id,

      contractStatus:
        verifiedContract.status,
    }
  );

  /* ======================================================================== */
  /* STEP 11: REDIRECT TO CONTRACT                                            */
  /* ======================================================================== */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}/contracts/${verifiedContract.id}`,
      request.url
    )
  );
}