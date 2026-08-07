import { supabase } from "@/lib/supabase";
import ReflectionsGallery from "@/components/ReflectionsGallery";

export default async function ReflectionsPage() {
  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (
    <main className="bg-[#FAF8F5] py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <p
            className="
              mb-5
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>

          <h1
            className="
              text-[54px]
              leading-none
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
            "
          >
            Stories From
            <br />
            Our Conversations
          </h1>

          <p
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-lg
              leading-8
              text-[#5B5B5B]
            "
          >
            Every reflection here was written by a student or parent who
            chose to share part of their English journey with Hamkke.
          </p>

          <p
            className="
              mt-5
              text-sm
              uppercase
              tracking-[0.25em]
              text-[#8B8B8B]
            "
          >
            {reflections?.length ?? 0} Stories Shared
          </p>

        </div>

        <div className="mt-20">

  <ReflectionsGallery
    reflections={reflections ?? []}
  />

</div>

      </div>

    </main>
  );
}