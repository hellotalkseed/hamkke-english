"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  Camera,
  LoaderCircle,
  Trash2,
} from "lucide-react";

type TeacherAvatarManagerProps = {
  fullName: string | null;
  initialAvatarUrl: string | null;
};

type AvatarResponse = {
  success?: boolean;
  avatar_path?: string | null;
  avatar_url?: string | null;
  error?: string;
};

function getInitials(fullName: string | null) {
  if (!fullName?.trim()) {
    return "T";
  }

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function TeacherAvatarManager({
  fullName,
  initialAvatarUrl,
}: TeacherAvatarManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(initialAvatarUrl);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isRemoving, setIsRemoving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const initials = getInitials(fullName);
  const isBusy = isUploading || isRemoving;

  function openFilePicker() {
    if (!isBusy) {
      inputRef.current?.click();
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/teachers/avatar",
        {
          method: "POST",
          body: formData,
        }
      );

      const result =
        (await response.json()) as AvatarResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "We couldn't upload the profile photo."
        );
      }

      setAvatarUrl(result.avatar_url ?? null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't upload the profile photo."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!avatarUrl || isBusy) {
      return;
    }

    setError(null);
    setIsRemoving(true);

    try {
      const response = await fetch(
        "/api/admin/teachers/avatar",
        {
          method: "DELETE",
        }
      );

      const result =
        (await response.json()) as AvatarResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "We couldn't remove the profile photo."
        );
      }

      setAvatarUrl(null);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "We couldn't remove the profile photo."
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="
          relative
          flex
          h-[132px]
          w-[132px]
          items-center
          justify-center
          overflow-hidden
          rounded-full
          border
          border-[#D8D7D1]
          bg-[#EEF1EB]
          shadow-[0_1px_8px_rgba(0,0,0,0.05)]
          sm:h-[142px]
          sm:w-[142px]
        "
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={
              fullName
                ? `${fullName}'s profile`
                : "Teacher profile"
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="
              font-serif
              text-[40px]
              font-normal
              tracking-[-0.03em]
              text-[#6F8F72]
              sm:text-[44px]
            "
          >
            {initials}
          </span>
        )}

        {isBusy ? (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-[#FAF8F5]/75
            "
          >
            <LoaderCircle
              size={26}
              strokeWidth={1.6}
              className="animate-spin text-[#6F8F72]"
            />
          </div>
        ) : null}
      </div>

      <div
        className="
          mt-4
          flex
          flex-wrap
          items-center
          justify-end
          gap-x-4
          gap-y-2
        "
      >
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isBusy}
          className="
            inline-flex
            items-center
            gap-1.5
            font-sans
            text-[12px]
            font-medium
            text-[#6F8F72]
            transition-colors
            hover:text-[#526B55]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Camera
            size={14}
            strokeWidth={1.7}
          />
          {avatarUrl ? "Change photo" : "Add photo"}
        </button>

        {avatarUrl ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isBusy}
            className="
              inline-flex
              items-center
              gap-1.5
              font-sans
              text-[12px]
              text-[#8A7772]
              transition-colors
              hover:text-[#765F59]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2
              size={13}
              strokeWidth={1.7}
            />
            Remove
          </button>
        ) : null}
      </div>

      <p
        className="
          mt-2
          text-right
          font-sans
          text-[10px]
          text-[#9A9892]
        "
      >
        JPG, PNG or WebP · up to 5 MB
      </p>

      {error ? (
        <p
          role="alert"
          className="
            mt-3
            max-w-[360px]
            text-right
            font-sans
            text-[12px]
            leading-5
            text-[#9B5F58]
          "
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
