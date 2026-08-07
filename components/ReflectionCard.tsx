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
        w-[320px]
        sm:w-[360px]
        lg:w-[380px]

        flex-shrink-0
        cursor-pointer

        rounded-[2rem]
        bg-white
        p-8

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
          mt-6
          italic
          leading-8
          text-[#555]

          line-clamp-5
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
            text-sm
            font-medium
            text-[#6F8F72]

            transition
            hover:underline
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
              h-14
              w-14
              rounded-full
              object-cover
            "
          />

        ) : (

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center

              rounded-full

              bg-[#EEF5EE]

              text-[#6F8F72]
              font-medium
            "
          >
            {reflection.name.charAt(0)}
          </div>

        )}



        <div>

          <h3
            className="
              font-medium
              text-[#2B2B2B]
            "
          >
            {reflection.name}
          </h3>


          <p
            className="
              text-sm
              text-gray-500
            "
          >
            {reflection.role}

            {reflection.country &&
              ` • ${reflection.country}`
            }

          </p>

        </div>

      </div>

    </article>
  );
}