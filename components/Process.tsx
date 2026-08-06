import FadeUp from "./animations/FadeUp";
import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

export default function Process() {
  const steps = [
    {
      number: "01",
      progress: 25,
      title: "We Start with a Conversation",
      text: "Every learner has a different story. We'll talk about your goals, your current level, and the situations where you'd like to use English so we can create lessons that truly fit you.",
    },
    {
      number: "02",
      progress: 50,
      title: "Lessons Designed Around You",
      text: "Your lessons are personalized to your pace, interests, and learning style. Rather than following a one-size-fits-all approach, each lesson is built around meaningful conversations that help you communicate naturally.",
    },
    {
      number: "03",
      progress: 75,
      title: "Confidence Through Practice",
      text: "Confidence doesn't come from memorizing grammar rules. It grows through regular conversations, thoughtful feedback, and practical language you can immediately use in everyday life.",
    },
    {
      number: "04",
      progress: 100,
      title: "Keep Growing",
      text: "Language learning is an ongoing journey. As your confidence grows, we'll continue refining your communication skills, celebrating your progress, and helping you express yourself with greater ease.",
    },
  ];

  return (
    <section
      id="lessons"
      className="
        relative
        bg-[#FCFBF9]
        py-20

        sm:py-24
        lg:py-32
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >

        <div
          className="
            grid
            gap-16

            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-24
          "
        >

          {/* LEFT */}

          <FadeUp>
            <div
              className="
                self-start

                lg:sticky
                lg:top-32
              "
            >

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


              <h2
                className="
                  text-[36px]
                  leading-[1.08]
                  tracking-[-0.02em]
                  text-[#2B2B2B]
                  [font-family:var(--font-cormorant)]

                  sm:text-[46px]
                  lg:text-[60px]
                "
              >
                From the first conversation
                to lasting confidence.
              </h2>


              <p
                className="
                  mt-8
                  max-w-lg
                  text-[16px]
                  leading-8
                  text-[#5B5B5B]

                  lg:text-lg
                  lg:leading-9
                "
              >
                Every learner begins somewhere different.
                Together, we'll build your confidence through
                meaningful conversations, personalized guidance,
                and consistent practice.
              </p>

            </div>
          </FadeUp>



          {/* RIGHT */}

          <StaggerContainer
            className="
              max-w-2xl
            "
          >

            {steps.map((step, index) => (

              <StaggerItem
                key={step.number}
              >

                <div
                  className="
                    grid
                    grid-cols-[50px_1fr]
                    gap-6

                    sm:grid-cols-[70px_1fr]
                    sm:gap-8
                  "
                >

                  {/* Timeline */}

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                    "
                  >

                    <div
                      className="
                        relative
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-[#6F8F72]
                        bg-white
                      "
                    >

                      <div
                        className="
                          h-6
                          w-6
                          rounded-full
                        "
                        style={{
                          background: `conic-gradient(
                            #6F8F72 ${step.progress}%,
                            #EEF5EE ${step.progress}% 100%
                          )`,
                        }}
                      />

                    </div>


                    {index !== steps.length - 1 && (
                      <div
                        className="
                          mt-2
                          w-[2px]
                          flex-1
                          bg-[#DCE7D8]
                        "
                      />
                    )}

                  </div>



                  {/* Content */}

                  <div
                    className="
                      pb-14

                      sm:pb-20
                    "
                  >

                    <p
                      className="
                        text-5xl
                        leading-none
                        text-[#D5E1D2]
                        [font-family:var(--font-cormorant)]

                        sm:text-6xl
                      "
                    >
                      {step.number}
                    </p>


                    <h3
                      className="
                        mt-3
                        text-[26px]
                        leading-tight
                        text-[#2B2B2B]
                        [font-family:var(--font-cormorant)]

                        sm:text-[34px]
                      "
                    >
                      {step.title}
                    </h3>


                    <p
                      className="
                        mt-5
                        text-[15px]
                        leading-7
                        text-[#5B5B5B]

                        sm:text-[16px]
                        sm:leading-8
                      "
                    >
                      {step.text}
                    </p>

                  </div>

                </div>

              </StaggerItem>

            ))}

          </StaggerContainer>

        </div>


        {/* Closing Statement */}

        <FadeUp>
          <p
            className="
              mt-4
              text-center
              text-2xl
              italic
              text-[#6F8F72]
              [font-family:var(--font-cormorant)]

              sm:mt-8
              sm:text-3xl
            "
          >
            Small conversations. Lasting confidence.
          </p>
        </FadeUp>


      </div>

    </section>
  );
}