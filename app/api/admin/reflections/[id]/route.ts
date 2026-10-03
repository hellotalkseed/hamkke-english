import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function authorizeOwner() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Reflection moderation authorization error:",
      profileError
    );

    return {
      error: NextResponse.json(
        { error: "Unable to verify access." },
        { status: 500 }
      ),
    };
  }

  const role = String(profile?.role || "").toLowerCase();
  const status = String(profile?.status || "").toLowerCase();

  if (
    !profile ||
    role !== "owner" ||
    status !== "active"
  ) {
    return {
      error: NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      ),
    };
  }

  return { error: null };
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const authorization = await authorizeOwner();

  if (authorization.error) {
    return authorization.error;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid reflection." },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("approved" in body) ||
    (body as { approved?: unknown }).approved !== true
  ) {
    return NextResponse.json(
      { error: "Invalid moderation action." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("reflections")
    .update({ approved: true })
    .eq("id", id)
    .eq("approved", false)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Reflection approval error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to approve reflection." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Reflection not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const authorization = await authorizeOwner();

  if (authorization.error) {
    return authorization.error;
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid reflection." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const {
    data: reflection,
    error: lookupError,
  } = await admin
    .from("reflections")
    .select("id, photo_url")
    .eq("id", id)
    .eq("approved", false)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Reflection rejection lookup error:",
      lookupError
    );

    return NextResponse.json(
      { error: "Unable to reject reflection." },
      { status: 500 }
    );
  }

  if (!reflection) {
    return NextResponse.json(
      { error: "Reflection not found." },
      { status: 404 }
    );
  }

  const { error: deleteError } = await admin
    .from("reflections")
    .delete()
    .eq("id", id)
    .eq("approved", false);

  if (deleteError) {
    console.error(
      "Reflection rejection error:",
      deleteError
    );

    return NextResponse.json(
      { error: "Unable to reject reflection." },
      { status: 500 }
    );
  }

  if (reflection.photo_url) {
    try {
      const url = new URL(reflection.photo_url);
      const marker =
        "/storage/v1/object/public/reflections/";
      const markerIndex = url.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        const objectName = decodeURIComponent(
          url.pathname.slice(
            markerIndex + marker.length
          )
        );

        if (objectName) {
          const { error: photoDeleteError } =
            await admin.storage
              .from("reflections")
              .remove([objectName]);

          if (photoDeleteError) {
            console.error(
              "Rejected reflection photo cleanup error:",
              photoDeleteError
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Rejected reflection photo URL error:",
        error
      );
    }
  }

  return NextResponse.json({
    success: true,
  });
}