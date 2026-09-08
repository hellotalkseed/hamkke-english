import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const AVATAR_BUCKET = "teacher-avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type TeacherProfile = {
  id: string;
  role: string;
  status: string;
  avatar_path: string | null;
};

async function getAuthenticatedTeacher() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      user: null,
      profile: null,
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, role, status, avatar_path")
    .eq("id", user.id)
    .maybeSingle<TeacherProfile>();

  if (profileError) {
    console.error(
      "Teacher avatar profile lookup error:",
      profileError
    );

    return {
      error: NextResponse.json(
        {
          error:
            "We couldn't verify your teacher account.",
        },
        { status: 500 }
      ),
      user: null,
      profile: null,
    };
  }

  if (
    !profile ||
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    return {
      error: NextResponse.json(
        {
          error:
            "Only active teachers can manage a profile photo.",
        },
        { status: 403 }
      ),
      user: null,
      profile: null,
    };
  }

  return {
    error: null,
    user,
    profile,
  };
}

function getPublicAvatarUrl(
  admin: ReturnType<typeof createAdminClient>,
  avatarPath: string | null
) {
  if (!avatarPath) {
    return null;
  }

  const {
    data,
  } = admin.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(avatarPath);

  return data.publicUrl || null;
}

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET() {
  try {
    const auth = await getAuthenticatedTeacher();

    if (auth.error) {
      return auth.error;
    }

    const admin = createAdminClient();

    return NextResponse.json({
      avatar_path: auth.profile.avatar_path,
      avatar_url: getPublicAvatarUrl(
        admin,
        auth.profile.avatar_path
      ),
    });
  } catch (error) {
    console.error(
      "Teacher avatar GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the profile photo.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* POST                                                                      */
/* Upload or replace the authenticated teacher's profile photo.              */
/* ========================================================================= */

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedTeacher();

    if (auth.error) {
      return auth.error;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please choose an image to upload.",
        },
        { status: 400 }
      );
    }

    const extension = ALLOWED_IMAGE_TYPES.get(
      file.type
    );

    if (!extension) {
      return NextResponse.json(
        {
          error:
            "Please upload a JPG, PNG, or WebP image.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          error:
            "The selected image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        {
          error:
            "Profile photos must be 5 MB or smaller.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    /*
     * Use a new filename for each upload instead of overwriting
     * the same object path. This prevents an old profile image
     * from being shown because of browser/CDN caching.
     */
    const avatarPath =
      `${auth.user.id}/avatar-${Date.now()}.${extension}`;

    const fileBytes = new Uint8Array(
      await file.arrayBuffer()
    );

    const {
      error: uploadError,
    } = await admin.storage
      .from(AVATAR_BUCKET)
      .upload(
        avatarPath,
        fileBytes,
        {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        }
      );

    if (uploadError) {
      console.error(
        "Teacher avatar upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't upload the profile photo. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * Update only avatar_path using the server-side admin client.
     * Teachers are not given general UPDATE access to profiles.
     */
    const {
      error: profileUpdateError,
    } = await admin
      .from("profiles")
      .update({
        avatar_path: avatarPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id)
      .eq("role", "teacher");

    if (profileUpdateError) {
      console.error(
        "Teacher avatar profile update error:",
        profileUpdateError
      );

      /*
       * Roll back the newly uploaded file if the profile
       * record could not be updated.
       */
      const {
        error: rollbackError,
      } = await admin.storage
        .from(AVATAR_BUCKET)
        .remove([avatarPath]);

      if (rollbackError) {
        console.error(
          "Teacher avatar rollback error:",
          rollbackError
        );
      }

      return NextResponse.json(
        {
          error:
            "We couldn't save the profile photo. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * Once the new avatar path is safely stored, remove the
     * previous image. A cleanup failure does not invalidate
     * the successful profile update.
     */
    if (
      auth.profile.avatar_path &&
      auth.profile.avatar_path !== avatarPath
    ) {
      const {
        error: oldAvatarDeleteError,
      } = await admin.storage
        .from(AVATAR_BUCKET)
        .remove([
          auth.profile.avatar_path,
        ]);

      if (oldAvatarDeleteError) {
        console.error(
          "Old teacher avatar cleanup error:",
          oldAvatarDeleteError
        );
      }
    }

    return NextResponse.json({
      success: true,
      avatar_path: avatarPath,
      avatar_url: getPublicAvatarUrl(
        admin,
        avatarPath
      ),
    });
  } catch (error) {
    console.error(
      "Teacher avatar POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while uploading the profile photo.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* DELETE                                                                    */
/* Remove the authenticated teacher's profile photo.                         */
/* ========================================================================= */

export async function DELETE() {
  try {
    const auth = await getAuthenticatedTeacher();

    if (auth.error) {
      return auth.error;
    }

    const admin = createAdminClient();
    const currentAvatarPath =
      auth.profile.avatar_path;

    if (!currentAvatarPath) {
      return NextResponse.json({
        success: true,
        avatar_path: null,
        avatar_url: null,
      });
    }

    /*
     * Clear the database reference first. If Storage cleanup fails,
     * the teacher still no longer has a visible profile photo.
     */
    const {
      error: profileUpdateError,
    } = await admin
      .from("profiles")
      .update({
        avatar_path: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id)
      .eq("role", "teacher");

    if (profileUpdateError) {
      console.error(
        "Teacher avatar removal profile update error:",
        profileUpdateError
      );

      return NextResponse.json(
        {
          error:
            "We couldn't remove the profile photo. Please try again.",
        },
        { status: 500 }
      );
    }

    const {
      error: deleteError,
    } = await admin.storage
      .from(AVATAR_BUCKET)
      .remove([
        currentAvatarPath,
      ]);

    if (deleteError) {
      console.error(
        "Teacher avatar storage delete error:",
        deleteError
      );
    }

    return NextResponse.json({
      success: true,
      avatar_path: null,
      avatar_url: null,
    });
  } catch (error) {
    console.error(
      "Teacher avatar DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while removing the profile photo.",
      },
      { status: 500 }
    );
  }
}
