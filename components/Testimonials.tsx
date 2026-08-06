import FadeUp from "./animations/FadeUp";
import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

const journeys = [
  {
    number: "01",
    title: "Starting Point",
    text: "Preparing for aviation English requirements and professional communication.",
  },
  {
    number: "02",
    title: "Growth",
    text: "Developing listening skills, organizing ideas, and communicating with greater confidence.",
  },
  {
    number: "03",
    title: "Milestone",
    text: "Successfully achieving a professional aviation goal.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="student-stories"
      className="
        bg-white
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


        {/* Heading */}

        <FadeUp>

          <div
            className="
              mb-16
              max-w-3xl

              lg:mb-20
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
                text-[40px]
                leading-[1.05]
                tracking-[-0.02em]
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]

                sm:text-[52px]
                lg:text-[60px]
              "
            >
              Small steps.
              <br />
              Meaningful milestones.
            </h2>


            <p
              className="
                mt-8
                max-w-xl
                text-[17px]
                leading-8
                text-[#5B5B5B]

                sm:text-lg
              "
            >
              Every learner begins somewhere different.
              These are stories of confidence built through
              meaningful conversations and consistent practice.
            </p>

          </div>

        </FadeUp>





        {/* Featured Story */}

        <FadeUp>

          <div
            className="
              rounded-[2.5rem]
              bg-[#EEF5EE]
              p-8

              sm:p-10
              lg:p-16
            "
          >

            <div
              className="
                grid
                gap-12

                lg:grid-cols-2
                lg:gap-16
              "
            >

              {/* Story */}

              <div>

                <p
                  className="
                    mb-6
                    text-[12px]
                    font-medium
                    uppercase
                    tracking-[0.3em]
                    text-[#6F8F72]
                  "
                >
                  Aviation English
                </p>


                <h3
                  className="
                    text-[32px]
                    leading-tight
                    text-[#2B2B2B]
                    [font-family:var(--font-cormorant)]

                    sm:text-[42px]
                  "
                >
                  From language practice
                  to a professional milestone.
                </h3>


                <p
                  className="
                    mt-6
                    text-lg
                    leading-8
                    text-[#5B5B5B]
                  "
                >
                  "Thanks to your help, I finally passed and joined
                  Korean Air. You have a big part in my success."
                </p>


                <p
                  className="
                    mt-6
                    text-sm
                    text-gray-500
                  "
                >
                  — Pilot Applicant
                </p>

              </div>





              {/* Journey */}

              <div>

                <p
                  className="
                    mb-8
                    text-[12px]
                    font-medium
                    uppercase
                    tracking-[0.3em]
                    text-[#6F8F72]
                  "
                >
                  Journey
                </p>


                <div className="space-y-8">

                  {journeys.map((item) => (

                    <div
                      key={item.number}
                      className="
                        flex
                        gap-5
                      "
                    >

                      <span
                        className="
                          text-[#6F8F72]
                          font-medium
                        "
                      >
                        {item.number}
                      </span>


                      <div>

                        <h4
                          className="
                            font-medium
                            text-[#2B2B2B]
                          "
                        >
                          {item.title}
                        </h4>


                        <p
                          className="
                            mt-1
                            leading-7
                            text-gray-600
                          "
                        >
                          {item.text}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </FadeUp>





        {/* Supporting Stories */}

        <StaggerContainer
          className="
            mt-10
            grid
            gap-8

            md:grid-cols-2
          "
        >

          <StaggerItem>

            <div
              className="
                rounded-[2rem]
                border
                border-[#DDE9D8]
                bg-[#FCFBF9]
                p-8

                sm:p-10
              "
            >

              <p className="
                text-[12px]
                font-medium
                uppercase
                tracking-[0.3em]
                text-[#6F8F72]
              ">
                Parent Feedback
              </p>


              <h3
                className="
                  mt-5
                  text-[30px]
                  leading-tight
                  text-[#2B2B2B]
                  [font-family:var(--font-cormorant)]
                "
              >
                Confidence beyond the classroom.
              </h3>


              <p
                className="
                  mt-5
                  leading-8
                  text-gray-600
                "
              >
                "Flora and Emily's English skills have improved
                significantly thanks to you. They're even at a higher
                level than their peers at the academy."
              </p>


              <p className="mt-6 text-sm text-gray-500">
                — Parent of Flora and Emily
              </p>

            </div>

          </StaggerItem>





          <StaggerItem>

            <div
              className="
                rounded-[2rem]
                border
                border-[#DDE9D8]
                bg-[#FCFBF9]
                p-8

                sm:p-10
              "
            >

              <p className="
                text-[12px]
                font-medium
                uppercase
                tracking-[0.3em]
                text-[#6F8F72]
              ">
                Young Learner
              </p>


              <h3
                className="
                  mt-5
                  text-[30px]
                  leading-tight
                  text-[#2B2B2B]
                  [font-family:var(--font-cormorant)]
                "
              >
                A trusted teacher for growing learners.
              </h3>


              <p
                className="
                  mt-5
                  leading-8
                  text-gray-600
                "
              >
                "Yes^^ you are Juju's best teacher.^^"
              </p>


              <p className="mt-6 text-sm text-gray-500">
                — Parent of Juju
              </p>

            </div>

          </StaggerItem>


        </StaggerContainer>


      </div>

    </section>
  );
}