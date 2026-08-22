import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import ReflectionActions from "@/components/ReflectionActions";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface ReflectionsAdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ReflectionsAdminPage({
  params,
}: ReflectionsAdminPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const { data: reflections, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("approved", false)
    .order("created_at", {
      ascending: false,
    });

  console.log("Server", reflections);
  console.log("Server", error);

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-6
        py-20
      "
    >
      <div className="mx-auto max-w-4xl">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div>
          <p
            className="
              text-[12px]
              font-medium
              uppercase
              tracking-[0.3em]
              text-[#6F8F72]
            "
          >
            Hamkke Γöé φò¿Ω╗ÿ
          </p>

          <h1
            className="
              mt-4
              text-5xl
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
            "
          >
            Pending Reflections
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-[#6B6B6B]
            "
          >
            Review student reflections before they appear publicly
            on the Hamkke website.
          </p>
        </div>

        {/* =====================================================
            REFLECTIONS
            ===================================================== */}

        <div className="mt-12 space-y-8">

          {reflections?.map((item) => (
            <div
              key={item.id}
              className="
                rounded-3xl
                bg-white
                p-8
                shadow-lg
              "
            >

              {/* Student information */}

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >

                <div>
                  <h2
                    className="
                      text-xl
                      font-medium
                      text-[#2B2B2B]
                    "
                  >
                    {item.name}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    {item.role}
                    {item.country
                      ? ` ┬╖ ${item.country}`
                      : ""}
                  </p>
                </div>

                <div
                  className="
                    text-sm
                    font-medium
                    text-[#6F8F72]
                  "
                >
                  Γ¡É {item.rating}/5
                </div>

              </div>

              {/* Reflection */}

              <p
                className="
                  mt-6
                  leading-7
                  text-[#5B5B5B]
                "
              >
                {item.reflection}
              </p>

              {/* Photo */}

              {item.photo_url && (
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="
                    mt-6
                    h-48
                    w-full
                    rounded-2xl
                    object-cover
                    sm:w-72
                  "
                />
              )}

              {/* Actions */}

              <div className="mt-8">
                <ReflectionActions id={item.id} />
              </div>

            </div>
          ))}

          {/* Empty state */}

          {(!reflections || reflections.length === 0) && (
            <div
              className="
                rounded-3xl
                bg-white
                p-12
                text-center
                shadow-lg
              "
            >
              <p
                className="
                  text-lg
                  text-[#5B5B5B]
                "
              >
                No pending reflections right now.
              </p>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
