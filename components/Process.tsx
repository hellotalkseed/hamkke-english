import { Sprout, Leaf, TreePine } from "lucide-react";

const steps = [
  {
    icon: Sprout,
    title: "Start Where You Are",
    text: "Every learner begins with a different story. We take time to understand your goals, your current level, and the conversations you want to have with confidence.",
  },
  {
    icon: Leaf,
    title: "Learn Through Conversation",
    text: "Practice through meaningful discussions, real-life situations, and thoughtful feedback that helps you communicate naturally instead of simply memorizing grammar rules.",
  },
  {
    icon: TreePine,
    title: "Speak With Confidence",
    text: "As your confidence grows, conversations become easier, ideas become clearer, and English becomes a natural part of your everyday life.",
  },
];

export default function Process() {
  return (
    <section
      id="lessons"
      className="relative overflow-hidden bg-[#FAF8F5] py-32"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid items-start gap-24 lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT */}

          <div className="lg:sticky lg:top-32 self-start">

            <p className="mb-5 text-sm uppercase tracking-[0.35em] text-[#6F8F72]">
              The Learning Journey
            </p>

            <h2 className="text-5xl leading-tight text-[#2B2B2B] [font-family:var(--font-cormorant)]">
              From Small Talk to Big Ideas.
            </h2>

            <p className="mt-8 max-w-lg text-lg leading-8 text-[#5B5B5B]">
              Every learner starts somewhere. Through meaningful
              conversations, each lesson helps you grow naturally,
              one conversation at a time.
            </p>

          </div>

          {/* RIGHT */}

          <div className="justify-self-end w-full max-w-2xl">

            {steps.map((step, index) => {

              const Icon = step.icon;

              return (

                <div
                  key={step.title}
                  className="grid grid-cols-[110px_1fr] gap-8"
                >

                  {/* Plant */}

                  <div className="flex flex-col items-center">

                    <div
                      className="
                        floating
                        relative
                        flex
                        h-24
                        w-24
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#DDE9D8]
                        bg-white
                        shadow-lg
                        transition-all
                        duration-500
                        hover:scale-105
                      "
                    >

                      <Icon
                        className="h-11 w-11 text-[#6F8F72]"
                        strokeWidth={1.7}
                      />

                    </div>

                    {index !== steps.length - 1 && (

                      <div className="relative flex h-40 w-full justify-center">

                        {/* Vine */}

                        <div className="vine absolute top-0 h-full w-[2px] rounded-full bg-[#DDE9D8]" />

                        {/* Decorative Leaf */}

                        <Leaf
                          className="
                            leaf
                            absolute
                            top-16
                            -right-1
                            h-4
                            w-4
                            -rotate-45
                            text-[#A6BFA6]
                          "
                          strokeWidth={2}
                        />

                      </div>

                    )}

                  </div>

                  {/* Content */}

                  <div className="pt-6 pb-20">

                    <h3 className="text-3xl text-[#2B2B2B] [font-family:var(--font-cormorant)]">
                      {step.title}
                    </h3>

                    <p className="mt-5 leading-8 text-[#5B5B5B]">
                      {step.text}
                    </p>

                  </div>

                </div>

              );

            })}
                

          </div>

        </div>

      </div>

      {/* Organic Bottom Transition */}

      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          overflow-hidden
          leading-[0]
        "
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="block h-[70px] w-full"
        >
          <path
            d="
              M0,0
              C180,60 400,100 650,55
              C850,20 1050,90 1200,40
              L1200,120
              L0,120
              Z
            "
            fill="#FFFFFF"
          />
        </svg>
      </div>

    </section>
  );
}
