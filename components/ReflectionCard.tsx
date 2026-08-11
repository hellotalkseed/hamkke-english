"use client";

type Reflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
};

interface ReflectionCardProps {
  reflection: Reflection;
  readMoreLabel: string;
  onClick?: () => void;
}

export default function ReflectionCard({
  reflection,
  readMoreLabel,
  onClick,
}: ReflectionCardProps) {
  const MAX_PREVIEW_LENGTH = 180;

  const isLongReflection =
    reflection.reflection.length > MAX_PREVIEW_LENGTH;

  const preview = isLongReflection
    ? reflection.reflection
        .slice(0, MAX_PREVIEW_LENGTH)
        .trimEnd() + "..."
    : reflection.reflection;

  const handleReadMore = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (onClick) {
      onClick();
    }
  };

  return (
    <article
      onClick={onClick}
      className="
        w-[88vw]
        max-w-[380px]
        flex-shrink-0

        cursor-pointer

        rounded-[2rem]
        bg-[#DDE9D8]

        p-6

        shadow-md

        transition-all
        duration-500

        hover:-translate-y-2
        hover:shadow-xl

        sm:w-[360px]
        sm:p-7

        lg:w-[380px]
        lg:p-8
      "
    >
      {/* =====================================================
          RATING
          ===================================================== */}

      <div
        className="
          text-lg
          tracking-wide
          text-[#D8A437]
        "
      >
        {"★".repeat(reflection.rating)}
      </div>

      {/* =====================================================
          REFLECTION
          ===================================================== */}

      <blockquote
        className="
          mt-5

          text-[16px]
          leading-7
          italic

          text-[#4A4A4A]

          [font-family:var(--font-cormorant)]

          sm:mt-6
          sm:text-[17px]
          sm:leading-8
        "
      >
        “{preview}”
      </blockquote>

      {/* =====================================================
          READ MORE
          ===================================================== */}

      {isLongReflection && onClick && (
        <button
          type="button"
          onClick={handleReadMore}
          className="
            mt-5

            inline-flex
            items-center

            text-sm
            font-medium

            text-[#6F8F72]

            transition-colors
            duration-300

            hover:text-[#5B7960]
            hover:underline
          "
        >
          {readMoreLabel} →
        </button>
      )}

      {/* =====================================================
          PROFILE
          ===================================================== */}

      <div
        className="
          mt-8

          flex
          items-center
          gap-4
        "
      >
        {reflection.photo_url ? (
          <img
            src={reflection.photo_url}
            alt={reflection.name}
            className="
              h-12
              w-12
              flex-shrink-0

              rounded-full
              object-cover

              sm:h-14
              sm:w-14
            "
          />
        ) : (
          <div
            className="
              flex
              h-12
              w-12
              flex-shrink-0

              items-center
              justify-center

              rounded-full

              bg-[#EEF5EE]

              text-base
              font-medium
              text-[#6F8F72]

              sm:h-14
              sm:w-14
              sm:text-lg
            "
          >
            {reflection.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <h3
            className="
              text-[17px]
              font-medium
              text-[#2B2B2B]

              sm:text-[18px]
            "
          >
            {reflection.name}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-[#6B6B6B]
            "
          >
            {reflection.role}
            {reflection.country &&
              ` • ${reflection.country}`}
          </p>
        </div>
      </div>
    </article>
  );
}