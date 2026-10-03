import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TurnstileVerification = {
  success: boolean;
  "error-codes"?: string[];
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_ROLES = new Set([
  "Student",
  "Parent / Guardian",
]);

function cleanText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let uploadedFileName: string | null = null;

  try {
    const formData = await request.formData();

    const ratingText = cleanText(formData.get("rating"));
    const name = cleanText(formData.get("name"));
    const role = cleanText(formData.get("role"));
    const country = cleanText(formData.get("country"));
    const reflection = cleanText(formData.get("reflection"));
    const permission = cleanText(formData.get("permission"));
    const turnstileToken = cleanText(formData.get("turnstileToken"));
    const photoEntry = formData.get("photo");

    const rating = Number(ratingText);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !name ||
      !role ||
      !country ||
      !reflection ||
      permission !== "true" ||
      !turnstileToken
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid submission.",
        },
        { status: 400 }
      );
    }

    if (
      name.length > 100 ||
      role.length > 100 ||
      country.length > 100 ||
      reflection.length > 5000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more fields are too long.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role.",
        },
        { status: 400 }
      );
    }

    let photo: File | null = null;

    if (photoEntry instanceof File && photoEntry.size > 0) {
      photo = photoEntry;

      if (photo.size > MAX_PHOTO_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: "Photo is too large.",
          },
          { status: 400 }
        );
      }

      if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
        return NextResponse.json(
          {
            success: false,
            error: "Unsupported photo type.",
          },
          { status: 400 }
        );
      }

      const photoBytes = new Uint8Array(
        await photo.arrayBuffer()
      );

      const isJpeg =
        photoBytes.length >= 3 &&
        photoBytes[0] === 0xff &&
        photoBytes[1] === 0xd8 &&
        photoBytes[2] === 0xff;

      const isPng =
        photoBytes.length >= 8 &&
        photoBytes[0] === 0x89 &&
        photoBytes[1] === 0x50 &&
        photoBytes[2] === 0x4e &&
        photoBytes[3] === 0x47 &&
        photoBytes[4] === 0x0d &&
        photoBytes[5] === 0x0a &&
        photoBytes[6] === 0x1a &&
        photoBytes[7] === 0x0a;

      const isWebp =
        photoBytes.length >= 12 &&
        photoBytes[0] === 0x52 &&
        photoBytes[1] === 0x49 &&
        photoBytes[2] === 0x46 &&
        photoBytes[3] === 0x46 &&
        photoBytes[8] === 0x57 &&
        photoBytes[9] === 0x45 &&
        photoBytes[10] === 0x42 &&
        photoBytes[11] === 0x50;

      const matchesDeclaredType =
        (photo.type === "image/jpeg" && isJpeg) ||
        (photo.type === "image/png" && isPng) ||
        (photo.type === "image/webp" && isWebp);

      if (!matchesDeclaredType) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid photo file.",
          },
          { status: 400 }
        );
      }
    }

    const turnstileSecret =
      process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileSecret) {
      console.error(
        "TURNSTILE_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    const verificationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
        }),
        cache: "no-store",
      }
    );

    if (!verificationResponse.ok) {
      console.error(
        "Turnstile verification request failed:",
        verificationResponse.status
      );

      return NextResponse.json(
        { success: false },
        { status: 502 }
      );
    }

    const verification =
      (await verificationResponse.json()) as
        TurnstileVerification;

    if (!verification.success) {
      console.warn(
        "Turnstile verification rejected the request.",
        verification["error-codes"] ?? []
      );

      return NextResponse.json(
        {
          success: false,
          error: "Security verification failed.",
        },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    let photoUrl: string | null = null;
    let originalPhotoName: string | null = null;

    if (photo) {
      const extension =
        photo.type === "image/png"
          ? "png"
          : photo.type === "image/webp"
            ? "webp"
            : "jpg";

      uploadedFileName = `${crypto.randomUUID()}.${extension}`;
      originalPhotoName = photo.name.slice(0, 255);

      const { error: uploadError } = await supabase.storage
        .from("reflections")
        .upload(uploadedFileName, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(
          "Reflection photo upload error:",
          uploadError
        );

        return NextResponse.json(
          {
            success: false,
            error: "Unable to upload photo.",
          },
          { status: 500 }
        );
      }

      photoUrl = supabase.storage
        .from("reflections")
        .getPublicUrl(uploadedFileName).data.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("reflections")
      .insert({
        rating,
        name,
        role,
        country,
        reflection,
        photo_url: photoUrl,
        photo_name: originalPhotoName,
        approved: false,
      });

    if (insertError) {
      console.error(
        "Reflection insert error:",
        insertError
      );

      if (uploadedFileName) {
        const { error: cleanupError } =
          await supabase.storage
            .from("reflections")
            .remove([uploadedFileName]);

        if (cleanupError) {
          console.error(
            "Reflection upload cleanup error:",
            cleanupError
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Unable to submit reflection.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Reflection API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to submit reflection.",
      },
      { status: 500 }
    );
  }
}
