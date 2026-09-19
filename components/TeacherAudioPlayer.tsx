"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { getMessages } from "@/lib/getMessages";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type TeacherAudioPlayerProps = {
  src: string;
  firstName: string;
};

function interpolate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) =>
      values[key] ?? `{${key}}`
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  const remainingSeconds = Math.floor(
    seconds % 60
  );

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export default function TeacherAudioPlayer({
  src,
  firstName,
}: TeacherAudioPlayerProps) {
  const params = useParams<{
    locale?: string;
  }>();

  const localeParam =
    typeof params?.locale === "string"
      ? params.locale
      : "en";

  const locale: Locale =
    isValidLocale(localeParam)
      ? localeParam
      : "en";

  const messages = getMessages(locale);
  const content =
    messages.teacherProfilePage.audio;

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(0);

  const greeting = interpolate(
    content.greeting,
    {
      name: firstName,
    }
  );

  const playLabel = interpolate(
    content.play,
    {
      name: firstName,
    }
  );

  const pauseLabel = interpolate(
    content.pause,
    {
      name: firstName,
    }
  );

  /* =====================================================
     AUDIO EVENTS
     ===================================================== */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const updateDuration = () => {
      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        setDuration(audio.duration);
      }
    };

    const updateCurrentTime = () => {
      if (
        Number.isFinite(
          audio.currentTime
        )
      ) {
        setCurrentTime(
          audio.currentTime
        );
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener(
      "loadedmetadata",
      updateDuration
    );

    audio.addEventListener(
      "durationchange",
      updateDuration
    );

    audio.addEventListener(
      "timeupdate",
      updateCurrentTime
    );

    audio.addEventListener(
      "seeked",
      updateCurrentTime
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "play",
      handlePlay
    );

    if (audio.readyState >= 1) {
      updateDuration();
      updateCurrentTime();
    }

    return () => {
      audio.removeEventListener(
        "loadedmetadata",
        updateDuration
      );

      audio.removeEventListener(
        "durationchange",
        updateDuration
      );

      audio.removeEventListener(
        "timeupdate",
        updateCurrentTime
      );

      audio.removeEventListener(
        "seeked",
        updateCurrentTime
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "play",
        handlePlay
      );
    };
  }, []);

  /* =====================================================
     PLAY / PAUSE
     ===================================================== */

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error(
          "Audio playback failed:",
          error
        );
      }
    } else {
      audio.pause();
    }
  };

  /* =====================================================
     SEEK
     ===================================================== */

  const seekTo = (
    nextTime: number
  ) => {
    const audio = audioRef.current;

    if (
      !audio ||
      !Number.isFinite(nextTime)
    ) {
      return;
    }

    const actualDuration =
      Number.isFinite(
        audio.duration
      ) &&
      audio.duration > 0
        ? audio.duration
        : duration;

    if (
      !Number.isFinite(
        actualDuration
      ) ||
      actualDuration <= 0
    ) {
      return;
    }

    const safeTime = Math.min(
      Math.max(nextTime, 0),
      actualDuration
    );

    audio.currentTime = safeTime;

    setCurrentTime(
      safeTime
    );
  };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    seekTo(
      Number(
        event.currentTarget.value
      )
    );
  };

  const handleSeekInput = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    seekTo(
      Number(
        event.currentTarget.value
      )
    );
  };

  /* =====================================================
     SAFE DISPLAY VALUES
     ===================================================== */

  const safeDuration =
    Number.isFinite(duration) &&
    duration > 0
      ? duration
      : 0;

  const safeCurrentTime =
    safeDuration > 0
      ? Math.min(
          Math.max(
            currentTime,
            0
          ),
          safeDuration
        )
      : 0;

  return (
    <div className="rounded-[22px] border border-[#304A39]/10 bg-white px-4 py-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />

      <div className="flex items-center gap-3">
        {/* =================================================
            PLAY / PAUSE BUTTON
            ================================================= */}

        <button
          type="button"
          onClick={
            togglePlayback
          }
          aria-label={
            isPlaying
              ? pauseLabel
              : playLabel
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#304A39] text-white transition hover:bg-[#243B2E]"
        >
          {isPlaying ? (
            <span
              aria-hidden="true"
              className="flex items-center gap-[3px]"
            >
              <span className="h-3 w-[3px] rounded-full bg-white" />
              <span className="h-3 w-[3px] rounded-full bg-white" />
            </span>
          ) : (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-0.5 h-[13px] w-[13px]"
              aria-hidden="true"
            >
              <path
                d="M4.5 3.25L12.25 8L4.5 12.75V3.25Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

        {/* =================================================
            AUDIO INFORMATION
            ================================================= */}

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-5 text-[#304A39]">
            {greeting}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {/* =============================================
                SEEK BAR
                ============================================= */}

            <input
              type="range"
              min={0}
              max={safeDuration}
              step={0.1}
              value={
                safeCurrentTime
              }
              disabled={
                safeDuration <= 0
              }
              onInput={
                handleSeekInput
              }
              onChange={
                handleSeek
              }
              aria-label={
                content.progress
              }
              aria-valuemin={0}
              aria-valuemax={
                safeDuration
              }
              aria-valuenow={
                safeCurrentTime
              }
              className="
                h-1
                min-w-0
                flex-1
                cursor-pointer
                accent-[#718A73]
                disabled:cursor-default
                disabled:opacity-50
              "
            />

            {/* =============================================
                TIME
                ============================================= */}

            <span className="shrink-0 text-[10px] tabular-nums text-[#758477]">
              {formatTime(
                safeCurrentTime
              )}
              {" / "}
              {formatTime(
                safeDuration
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}