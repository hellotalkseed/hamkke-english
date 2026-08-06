import {
  Sprout,
  MessageCircle,
  Briefcase,
  Plane,
  GraduationCap,
  Target,
} from "lucide-react";

import SectionHeader from "./SectionHeader";
import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

const audiences = [
  {
    title: "Beginners",
    icon: Sprout,
    text: "Develop confidence through everyday conversations, practical vocabulary, and a strong foundation that makes speaking English feel natural.",
  },
  {
    title: "Everyday Conversation",
    icon: MessageCircle,
    text: "Express yourself more naturally through meaningful conversations that help you share your thoughts, opinions, and experiences with confidence.",
  },
  {
    title: "Professionals",
    icon: Briefcase,
    text: "Strengthen your English for meetings, presentations, interviews, and workplace communication while building confidence in professional settings.",
  },
  {
    title: "Travelers",
    icon: Plane,
    text: "Learn practical English for airports, hotels, restaurants, shopping, and everyday situations so you can travel with greater confidence.",
  },
  {
    title: "Students",
    icon: GraduationCap,
    text: "Improve your communication skills for school, presentations, interviews, and future opportunities while building confidence that lasts beyond the classroom.",
  },
  {
    title: "Goal-Focused Learners",
    icon: Target,
    text: "Prepare for specific goals, including aviation English, career opportunities, important interviews, or other personal milestones with lessons tailored to your journey.",
  },
];

export default function Audience() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-white
        py-20

        sm:py-24
        lg:py-32
      "
    >

      {/* Decorative Background */}

      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-24
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#EEF5EE]
          opacity-50
          blur-3xl

          sm:h-[380px]
          sm:w-[380px]
        "
      />


      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >

        {/* Section Header */}

        <SectionHeader
          title="Different goals. One conversation at a time."
          description="
            Whether you're building confidence, preparing for new
            opportunities, or simply looking to communicate more
            naturally, your lessons are designed around your goals,
            your pace, and the conversations that matter most to you.
          "
        />


        {/* Closing Statement */}

        <p
          className="
            -mt-12
            mb-16
            text-xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]

            sm:mb-20
          "
        >
          Wherever you're starting, we'll meet you there.
        </p>



        {/* Audience Cards */}

        <StaggerContainer
          className="
            grid
            gap-6

            md:grid-cols-2
            xl:grid-cols-3
            md:gap-8
          "
        >

          {audiences.map((item) => {

            const Icon = item.icon;

            return (
              <StaggerItem
                key={item.title}
              >

                <div
                  className="
                    h-full
                    rounded-[2rem]
                    border
                    border-white/70
                    bg-[#FCFBF9]
                    p-8
                    shadow-[0_12px_35px_rgba(0,0,0,0.05)]
                    backdrop-blur-sm
                    transition-all
                    duration-500

                    hover:-translate-y-1
                    hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]

                    sm:p-10
                  "
                >

                  <div
                    className="
                      mb-7
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#EEF5EE]
                      "
                    >

                      <Icon
                        className="
                          h-6
                          w-6
                          text-[#6F8F72]
                        "
                      />

                    </div>


                    <h3
                      className="
                        text-[24px]
                        leading-tight
                        text-[#2B2B2B]
                        [font-family:var(--font-cormorant)]

                        sm:text-[28px]
                      "
                    >
                      {item.title}
                    </h3>

                  </div>


                  <p
                    className="
                      text-[15px]
                      leading-7
                      text-[#5B5B5B]

                      sm:text-[16px]
                      sm:leading-8
                    "
                  >
                    {item.text}
                  </p>


                </div>

              </StaggerItem>
            );

          })}

        </StaggerContainer>


      </div>

    </section>
  );
}