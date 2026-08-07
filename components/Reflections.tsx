import { supabase } from "@/lib/supabase";
import FadeUp from "./animations/FadeUp";
import ReflectionCarousel from "./ReflectionCarousel";

export default async function Reflections() {
  const { data } = await supabase
    .from("reflections")
    .select("*")
    .eq("approved", true);

  const reflections =
    data
      ?.sort(() => Math.random() - 0.5)
      .slice(0, 10) ?? [];

  if (!reflections.length) return null;

  return (
    <section
      id="student-stories"
      className="
        bg-white
        py-24
        lg:py-32
      "
    >
      <div className="mx-auto max-w-7xl">

        <FadeUp>

          <div className="mb-16 px-6 lg:px-10">

            <p
              className="
                text-xs
                uppercase
                tracking-[0.35em]
                text-[#6F8F72]
              "
            >
              Hamkke │ 함께
            </p>

            <h2
              className="
                mt-5
                text-[42px]
                leading-tight
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]

                sm:text-[54px]
                lg:text-[62px]
              "
            >
              Small steps.
              <br />
              Meaningful milestones.
            </h2>

            <p
              className="
                mt-8
                max-w-2xl
                text-lg
                leading-8
                text-[#5B5B5B]
              "
            >
              Every learner begins somewhere different.
              <br />
              <br />
              These reflections celebrate the quiet progress that happens through 
              <br />meaningful conversations, 
              consistent practice, and the courage to keep speaking.
            </p>

          </div>

        </FadeUp>

        <ReflectionCarousel
          reflections={reflections}
        />

        <div className="mt-20 text-center">

          <a
            href="/reflections"
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-[#DDE9D8]
              px-8
              py-4
              transition
              hover:bg-[#EEF5EE]
            "
          >
            Read More Stories →
          </a>

          <p
            className="
              mt-5
              text-sm
              italic
              text-[#888]
            "
          >
            Because every milestone deserves to be remembered.
          </p>

        </div>

      </div>
    </section>
  );
}