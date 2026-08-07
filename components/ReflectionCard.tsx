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

export default function ReflectionCard({
  reflection,
  onClick,
}: {
  reflection: Reflection;
  onClick?: () => void;
}) {
  const preview =
    reflection.reflection.length > 180
      ? reflection.reflection.slice(0, 180) + "..."
      : reflection.reflection;

  return (
    <article
      onClick={onClick}
      className="
        w-[88vw]
        max-w-[380px]

        sm:w-[360px]
        lg:w-[380px]

        flex-shrink-0
        cursor-pointer

        rounded-[2rem]
        bg-white

        p-6
        sm:p-7
        lg:p-8

        shadow-md

        transition-all
        duration-500

        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      {/* Rating */}

      <div className="text-lg tracking-wide text-[#D8A437]">
        {"★".repeat(reflection.rating)}
      </div>

      {/* Preview */}

      <blockquote
        className="
          mt-5

          line-clamp-5

          text-[16px]
          leading-7

          italic
          text-[#555]

          sm:mt-6
          sm:text-[17px]
          sm:leading-8
        "
      >
        "{preview}"
      </blockquote>

      {/* Read More */}

      {onClick && (
  <button
    type="button"
    className="
      mt-6

      inline-flex
      items-center
      justify-center

      rounded-full

      bg-[#6F8F72]
      px-6
      py-3

      text-sm
      font-medium
      text-white

      shadow-sm

      transition-all
      duration-300

      hover:bg-[#5F7F62]
      hover:shadow-md

      active:scale-95
    "
  >
    Read More →
  </button>
)}

      {/* Profile */}

      <div className="mt-8 flex items-center gap-4">
        {reflection.photo_url ? (
          <img
            src={reflection.photo_url}
            alt={reflection.name}
            className="
              h-12
              w-12

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

              items-center
              justify-center

              rounded-full

              bg-[#EEF5EE]

              text-[#6F8F72]
              font-medium

              sm:h-14
              sm:w-14
            "
          >
            {reflection.name.charAt(0)}
          </div>
        )}

        <div>
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
              text-gray-500
            "
          >
            {reflection.role}
            {reflection.country && ` • ${reflection.country}`}
          </p>
        </div>
      </div>
    </article>
  );
}