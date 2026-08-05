import {
  Sprout,
  MessageCircle,
  Briefcase,
  Plane,
  GraduationCap,
  Target,
} from "lucide-react";

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
        py-28
      "
    >
      {/* Decorative Background */}

      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-24
          h-[380px]
          w-[380px]
          rounded-full
          bg-[#EEF5EE]
          opacity-50
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6
          lg:px-10
        "
      >
        {/* Heading */}

        <div className="mb-24 max-w-2xl">

          <p
            className="
              mb-6
              text-sm
              font-medium
              uppercase
              tracking-[0.32em]
              text-[#6F8F72]
            "
          >
            WHO THIS IS FOR
          </p>

          <h2
            className="
              text-[42px]
              leading-[1.08]
              tracking-[-0.02em]
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
              sm:text-[52px]
              lg:text-[60px]
            "
          >
            Different goals. One conversation at a time.
          </h2>

          <p
            className="
              mt-10
              text-lg
              leading-9
              text-[#5B5B5B]
            "
          >
            Whether you're building confidence, preparing for new
            opportunities, or simply looking to communicate more
            naturally, your lessons are designed around your goals,
            your pace, and the conversations that matter most to you.
          </p>

          <p
            className="
              mt-8
              text-xl
              italic
              text-[#6F8F72]
              [font-family:var(--font-cormorant)]
            "
          >
            Wherever you're starting, we'll meet you there.
          </p>

        </div>

        {/* Audience Cards */}

        <div
          className="
            grid
            gap-8
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {audiences.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="
                  h-full
                  rounded-[2rem]
                  border
                  border-white/70
                  bg-[#FCFBF9]
                  p-10
                  shadow-[0_12px_35px_rgba(0,0,0,0.05)]
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]
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
                      text-[30px]
                      leading-none
                      text-[#2B2B2B]
                      [font-family:var(--font-cormorant)]
                    "
                  >
                    {item.title}
                  </h3>

                </div>

                <p
                  className="
                    text-[16px]
                    leading-8
                    text-[#5B5B5B]
                  "
                >
                  {item.text}
                </p>

              </div>

            );

          })}
        </div>

      </div>

    </section>
  );
}