import { Sprout, MessageCircle, Target } from "lucide-react";

const audiences = [
  {
    title: "Young Learners",
    icon: Sprout,
    text: "Build strong foundations through engaging conversations, vocabulary development, and confidence-building practice.",
    shape: "rounded-[55%_45%_60%_40%]",
  },
  {
    title: "Adults & Professionals",
    icon: MessageCircle,
    text: "Communicate more naturally for work, travel, presentations, and meaningful real-world conversations.",
    shape: "rounded-[45%_55%_50%_50%]",
  },
  {
    title: "Goal-Oriented Learners",
    icon: Target,
    text: "Prepare for specific goals, including aviation English, professional communication, and important milestones.",
    shape: "rounded-[50%_50%_40%_60%]",
  },
];

export default function Audience() {
  return (
    <section
      className="
        bg-white
        pt-20
        pb-32
        relative
        overflow-hidden
      "
    >

      <div className="max-w-7xl mx-auto px-6">


        {/* Heading */}
        <div className="max-w-3xl">


          <p className="
            uppercase
            tracking-[0.3em]
            text-[#6F8F72]
            mb-6
            text-sm
          ">
            Who It's For
          </p>



          <h2 className="
            text-5xl
            leading-tight
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
          ">
            Every learner begins somewhere.
          </h2>



          <p className="
            mt-8
            text-lg
            text-gray-600
            leading-8
          ">
            Whether you are building confidence from the beginning,
            improving everyday communication, or preparing for a specific
            goal, lessons are designed around your journey and what matters
            to you.
          </p>


        </div>





        {/* Audience Shapes */}
        <div className="
          grid
          md:grid-cols-3
          gap-10
          mt-16
        ">


          {audiences.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="flex justify-center"
              >

                <div
                  className={`
                    ${item.shape}
                    bg-[#EEF5EE]
                    border
                    border-[#DDE9D8]
                    w-full
                    max-w-sm
                    aspect-square
                    p-10
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    transition
                    duration-300
                    hover:-translate-y-2
                  `}
                >


                  <div className="
                    bg-white
                    rounded-full
                    w-14
                    h-14
                    flex
                    items-center
                    justify-center
                    mb-6
                    shadow-sm
                  ">

                    <Icon
                      className="
                        w-7
                        h-7
                        text-[#6F8F72]
                      "
                    />

                  </div>




                  <h3 className="
                    text-3xl
                    text-[#2B2B2B]
                    [font-family:var(--font-cormorant)]
                    mb-4
                  ">
                    {item.title}
                  </h3>




                  <p className="
                    text-gray-600
                    leading-7
                    max-w-xs
                  ">
                    {item.text}
                  </p>


                </div>

              </div>

            );

          })}


        </div>


      </div>






      {/* Organic Transition */}
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
          className="
            block
            w-full
            h-[70px]
          "
        >

          <path
            d="
              M0,0
              C250,90 450,20 700,70
              C900,110 1050,40 1200,80
              L1200,120
              L0,120
              Z
            "
            fill="#FAF8F5"
          />

        </svg>

      </div>


    </section>
  );
}