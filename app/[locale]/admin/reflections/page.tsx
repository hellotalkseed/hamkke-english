import FeedbackReview from "@/components/feedback/FeedbackReview";
import { FeedbackError, staffIdentity } from "@/lib/feedback/server";
import { notFound, redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import LegacyReflectionReview from "@/components/feedback/LegacyReflectionReview";

import {
  isValidLocale,

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


  await staffIdentity("owner").catch(error => {
    if (error instanceof FeedbackError) redirect(`/${locale}/portal/login`);
    throw error;
  });

  const supabase = createAdminClient();

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
                Review learner feedback and manage what teachers and visitors can see.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1320px] px-8 pb-24 sm:px-10 lg:px-14 xl:px-16">
        <FeedbackReview />
        {error ? <p role="alert" className="mt-8 text-sm">Earlier submissions could not be loaded. Please reload.</p> : <LegacyReflectionReview rows={(reflections ?? []).map(item => ({ id: item.id, name: item.name, role: item.role, country: item.country, rating: item.rating, reflection: item.reflection, photo_url: item.photo_url, created_at: item.created_at }))} />}
      </section>
    </main>
  );
}
