import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const AUDIO_BUCKET = "teacher-audio";
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

const ALLOWED_AUDIO_TYPES = new Map([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/webm", "webm"],
]);

type TeacherProfile = {
  id: string;
  role: string;
  status: string;
};

type TeacherPublicProfile = {
  teacher_id: string;
  audio_intro_path: string | null;
};

async function getAuthenticatedTeacher() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
      publicProfile: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .maybeSingle<TeacherProfile>();

  if (profileError) {
    console.error("Teacher audio profile lookup error:", profileError);
    return {
      error: NextResponse.json(
        { error: "We couldn't verify your teacher account." },
        { status: 500 }
      ),
      user: null,
      publicProfile: null,
    };
  }

  if (!profile || profile.role !== "teacher" || profile.status !== "active") {
    return {
      error: NextResponse.json(
        { error: "Only active teachers can manage an audio introduction." },
        { status: 403 }
      ),
      user: null,
      publicProfile: null,
    };
  }

  const admin = createAdminClient();
  const { data: publicProfile, error: publicProfileError } = await admin
    .from("teacher_public_profiles")
    .select("teacher_id, audio_intro_path")
    .eq("teacher_id", user.id)
    .maybeSingle<TeacherPublicProfile>();

  if (publicProfileError) {
    console.error("Teacher audio public profile lookup error:", publicProfileError);
    return {
      error: NextResponse.json(
        { error: "We couldn't load your public teacher profile." },
        { status: 500 }
      ),
      user: null,
      publicProfile: null,
    };
  }

  if (!publicProfile) {
    return {
      error: NextResponse.json(
        { error: "Your public teacher profile could not be found." },
        { status: 404 }
      ),
      user: null,
      publicProfile: null,
    };
  }

  return { error: null, user, publicProfile };
}

function getPublicAudioUrl(
  admin: ReturnType<typeof createAdminClient>,
  audioPath: string | null
) {
  if (!audioPath) return null;
  return admin.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath).data.publicUrl || null;
}

export async function GET() {
  try {
    const auth = await getAuthenticatedTeacher();
    if (auth.error) return auth.error;

    const admin = createAdminClient();
    return NextResponse.json({
      audio_intro_path: auth.publicProfile.audio_intro_path,
      audio_url: getPublicAudioUrl(admin, auth.publicProfile.audio_intro_path),
    });
  } catch (error) {
    console.error("Teacher audio GET error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the audio introduction.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedTeacher();
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose an audio file to upload." },
        { status: 400 }
      );
    }

    const extension = ALLOWED_AUDIO_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Please upload an MP3, M4A, WAV, or WebM audio file." },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "The selected audio file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio introductions must be 10 MB or smaller." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const audioPath = `${auth.user.id}/intro-${Date.now()}.${extension}`;
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(AUDIO_BUCKET)
      .upload(audioPath, fileBytes, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Teacher audio upload error:", uploadError);
      return NextResponse.json(
        { error: "We couldn't upload the audio introduction. Please try again." },
        { status: 500 }
      );
    }

    const { error: updateError } = await admin
      .from("teacher_public_profiles")
      .update({
        audio_intro_path: audioPath,
        updated_at: new Date().toISOString(),
      })
      .eq("teacher_id", auth.user.id);

    if (updateError) {
      console.error("Teacher audio profile update error:", updateError);
      const { error: rollbackError } = await admin.storage
        .from(AUDIO_BUCKET)
        .remove([audioPath]);
      if (rollbackError) {
        console.error("Teacher audio rollback error:", rollbackError);
      }

      return NextResponse.json(
        { error: "We couldn't save the audio introduction. Please try again." },
        { status: 500 }
      );
    }

    const oldAudioPath = auth.publicProfile.audio_intro_path;
    if (oldAudioPath && oldAudioPath !== audioPath) {
      const { error: cleanupError } = await admin.storage
        .from(AUDIO_BUCKET)
        .remove([oldAudioPath]);
      if (cleanupError) {
        console.error("Old teacher audio cleanup error:", cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      audio_intro_path: audioPath,
      audio_url: getPublicAudioUrl(admin, audioPath),
    });
  } catch (error) {
    console.error("Teacher audio POST error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while uploading the audio introduction.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const auth = await getAuthenticatedTeacher();
    if (auth.error) return auth.error;

    const admin = createAdminClient();
    const currentAudioPath = auth.publicProfile.audio_intro_path;

    if (!currentAudioPath) {
      return NextResponse.json({
        success: true,
        audio_intro_path: null,
        audio_url: null,
      });
    }

    const { error: updateError } = await admin
      .from("teacher_public_profiles")
      .update({
        audio_intro_path: null,
        updated_at: new Date().toISOString(),
      })
      .eq("teacher_id", auth.user.id);

    if (updateError) {
      console.error("Teacher audio removal profile update error:", updateError);
      return NextResponse.json(
        { error: "We couldn't remove the audio introduction. Please try again." },
        { status: 500 }
      );
    }

    const { error: deleteError } = await admin.storage
      .from(AUDIO_BUCKET)
      .remove([currentAudioPath]);

    if (deleteError) {
      console.error("Teacher audio storage delete error:", deleteError);
    }

    return NextResponse.json({
      success: true,
      audio_intro_path: null,
      audio_url: null,
    });
  } catch (error) {
    console.error("Teacher audio DELETE error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while removing the audio introduction.",
      },
      { status: 500 }
    );
  }
}
