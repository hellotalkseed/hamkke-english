import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getManilaDate() {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const year =
    parts.find(
      (part) => part.type === "year"
    )?.value || "";

  const month =
    parts.find(
      (part) => part.type === "month"
    )?.value || "";

  const day =
    parts.find(
      (part) => part.type === "day"
    )?.value || "";

  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
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

    const admin = createAdminClient();

    /* --------------------------------------------------------------------- */
    /* OWNER AUTHORIZATION                                                   */
    /* --------------------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await admin
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
      return NextResponse.json(
        {
          error:
            "Only active owners can invite teachers.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* REQUEST                                                               */
    /* --------------------------------------------------------------------- */

    const body = await request.json();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const fullName = String(
      body.fullName || ""
    ).trim();

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Teacher email is required.",
        },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        {
          error:
            "Teacher name is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CREATE SUPABASE INVITATION                                            */
    /* --------------------------------------------------------------------- */

    const {
      data: invitedUser,
      error: inviteError,
    } =
      await admin.auth.admin.inviteUserByEmail(
        email
      );

    if (inviteError) {
      return NextResponse.json(
        {
          error: inviteError.message,
        },
        { status: 400 }
      );
    }

    if (!invitedUser.user) {
      return NextResponse.json(
        {
          error:
            "Teacher account could not be created.",
        },
        { status: 500 }
      );
    }

    const teacherId =
      invitedUser.user.id;

    /* --------------------------------------------------------------------- */
    /* GENERATE TEACHER NUMBER                                               */
    /* --------------------------------------------------------------------- */

    const {
      data: lastTeacher,
      error: lastTeacherError,
    } = await admin
      .from("profiles")
      .select("teacher_number")
      .eq("role", "teacher")
      .not("teacher_number", "is", null)
      .order("teacher_number", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (lastTeacherError) {
      await admin.auth.admin.deleteUser(
        teacherId
      );

      return NextResponse.json(
        {
          error:
            lastTeacherError.message,
        },
        { status: 500 }
      );
    }

    let nextTeacherNumber = 1;

    if (lastTeacher?.teacher_number) {
      const match =
        lastTeacher.teacher_number.match(
          /^T-(\d+)$/
        );

      if (match) {
        nextTeacherNumber =
          Number(match[1]) + 1;
      }
    }

    const teacherNumber = `T-${String(
      nextTeacherNumber
    ).padStart(3, "0")}`;

    /* --------------------------------------------------------------------- */
    /* CREATE PENDING PROFILE                                                */
    /* --------------------------------------------------------------------- */

    const {
      error: insertProfileError,
    } = await admin
      .from("profiles")
      .insert({
        id: teacherId,
        full_name: fullName,
        role: "teacher",
        status: "pending",
        teacher_number: teacherNumber,
      });

    if (insertProfileError) {
      await admin.auth.admin.deleteUser(
        teacherId
      );

      return NextResponse.json(
        {
          error:
            insertProfileError.message,
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* GENERATE TEACHER CONTRACT NUMBER                                      */
    /* --------------------------------------------------------------------- */

    const {
      data: contractNumberData,
      error: contractNumberError,
    } = await admin.rpc(
      "generate_teacher_contract_number"
    );

    if (
      contractNumberError ||
      !contractNumberData
    ) {
      /*
       * Remove the incomplete profile and Auth user.
       *
       * The invitation email may already have been
       * generated by Supabase, but deleting the Auth
       * user makes that incomplete invitation unusable.
       */
      await admin
        .from("profiles")
        .delete()
        .eq("id", teacherId);

      await admin.auth.admin.deleteUser(
        teacherId
      );

      console.error(
        "Failed to generate teacher contract number:",
        contractNumberError
      );

      return NextResponse.json(
        {
          error:
            "Teacher invitation could not be completed because the Teacher Agreement could not be prepared.",
        },
        { status: 500 }
      );
    }

    const contractNumber =
      contractNumberData as string;

    /* --------------------------------------------------------------------- */
    /* PREPARE TEACHER AGREEMENT                                             */
    /* --------------------------------------------------------------------- */

    const sentAt =
      new Date().toISOString();

    const agreementDate =
      getManilaDate();

    const {
      error: contractError,
    } = await admin
      .from("teacher_contracts")
      .insert({
        teacher_id: teacherId,
        contract_number:
          contractNumber,
        version: "1.0",
        status:
          "pending_acceptance",
        agreement_date:
          agreementDate,
        sent_at: sentAt,
        sent_by: user.id,
        updated_at: sentAt,
      });

    if (contractError) {
      /*
       * Do not leave behind a teacher who can
       * authenticate but has no onboarding agreement.
       */
      await admin
        .from("profiles")
        .delete()
        .eq("id", teacherId);

      await admin.auth.admin.deleteUser(
        teacherId
      );

      console.error(
        "Failed to prepare teacher agreement:",
        contractError
      );

      return NextResponse.json(
        {
          error:
            "Teacher invitation could not be completed because the Teacher Agreement could not be prepared.",
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* SUCCESS                                                               */
    /* --------------------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      message:
        "Teacher invitation sent. The Teacher Agreement is ready for review, and the teacher will remain pending until it is accepted.",
      teacherNumber,
      status: "pending",
    });
  } catch (error) {
    console.error(
      "Teacher invitation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while inviting the teacher.",
      },
      { status: 500 }
    );
  }
}