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

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <section className="mx-auto w-full max-w-[1320px] px-8 pb-7 pt-[92px] sm:px-10 lg:px-14 xl:px-16">
        <div className="max-w-[820px]">
          <div className="mb-5 flex items-center gap-4">
            <span className="h-px w-12 bg-[#6F8F72]" />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F8F72]">
              Administration
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="font-serif text-[46px] font-normal leading-[1] tracking-[-0.035em] sm:text-[54px] lg:text-[60px]">
                Reflections
              </h1>
              <p className="mt-4 max-w-[720px] font-serif text-[17px] leading-8 text-[#74716B] sm:text-[18px]">
                Review student reflections before they appear publicly on the Hamkke website.
              </p>
            </div>

            <div className="pb-1 text-right">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-[#8A8A84]">
                Pending
              </p>
              <p className="mt-1 font-serif text-[30px] leading-none text-[#49614D]">
                {reflections?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1320px] px-8 pb-24 sm:px-10 lg:px-14 xl:px-16">
        <div className="border-t border-[#DED9D2] pt-8">
          {error && (
            <div className="mb-6 rounded-[18px] border border-[#E4D4CF] bg-white px-5 py-4">
              <p className="font-sans text-[13px] text-[#7A5149]">
                Reflections could not be loaded right now.
              </p>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-2">
            {reflections?.map((item) => (
              <article
                key={item.id}
                className="flex min-h-[300px] flex-col rounded-[20px] border border-[#E7DDD1] bg-white p-6 sm:p-7"
              >
                <div className="flex items-start justify-between gap-5 border-b border-[#EEE8E1] pb-5">
                  <div className="min-w-0">
                    <p className="font-serif text-[25px] leading-tight text-[#292929]">
                      {item.name}
                    </p>
                    <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.12em] text-[#8A8A84]">
                      {item.role}
                      {item.country ? ` · ${item.country}` : ""}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-[#E2EBDD] px-3 py-1.5 font-sans text-[11px] font-medium text-[#49614D]">
                    ★ {item.rating}/5
                  </div>
                </div>

                <div className={`mt-5 grid flex-1 gap-6 ${item.photo_url ? "sm:grid-cols-[1fr_150px]" : ""}`}>
                  <p className="font-serif text-[17px] leading-8 text-[#55534F]">
                    “{item.reflection}”
                  </p>

                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt=""
                      className="h-[150px] w-full rounded-[16px] object-cover sm:w-[150px]"
                    />
                  )}
                </div>

                <div className="mt-7 border-t border-[#EEE8E1] pt-5">
                  <ReflectionActions id={item.id} />
                </div>
              </article>
            ))}
          </div>

          {(!reflections || reflections.length === 0) && !error && (
            <div className="rounded-[20px] border border-[#E7DDD1] bg-white px-8 py-16 text-center">
              <p className="font-serif text-[25px] text-[#292929]">
                All caught up.
              </p>
              <p className="mt-2 font-sans text-[13px] leading-6 text-[#777771]">
                There are no student reflections waiting for review.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
