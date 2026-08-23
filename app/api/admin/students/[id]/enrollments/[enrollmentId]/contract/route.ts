import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id, enrollmentId } = await params;

  const supabase = await createClient();

  // Make sure the enrollment belongs to this student.
  const { data: enrollment, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select("id, student_id")
      .eq("id", enrollmentId)
      .eq("student_id", id)
      .single();

  if (enrollmentError || !enrollment) {
    return new NextResponse(
      "Enrollment not found.",
      { status: 404 }
    );
  }

  // Check whether a contract already exists.
  const { data: existingContract } = await supabase
    .from("contracts")
    .select("id")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  if (existingContract) {
    return NextResponse.redirect(
      new URL(
        `/${await getLocale(request)}/admin/students/${id}/contracts/${existingContract.id}`,
        request.url
      )
    );
  }

  // Create the contract as a draft.
  const { data: contract, error: contractError } =
    await supabase
      .from("contracts")
      .insert({
        enrollment_id: enrollmentId,
        status: "draft",
      })
      .select("id")
      .single();

  if (contractError || !contract) {
    console.error("CONTRACT CREATION ERROR:", {
      code: contractError?.code,
      message: contractError?.message,
      details: contractError?.details,
      hint: contractError?.hint,
    });

    return new NextResponse(
      `Unable to create contract.

Code: ${contractError?.code || "unknown"}

Message: ${contractError?.message || "unknown"}

Details: ${contractError?.details || "none"}

Hint: ${contractError?.hint || "none"}`,
      { status: 500 }
    );
  }

  const locale = await getLocale(request);

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}/contracts/${contract.id}`,
      request.url
    )
  );
}

async function getLocale(request: Request): Promise<string> {
  const formData = await request.formData().catch(() => null);

  return String(
    formData?.get("locale") || "en"
  );
}