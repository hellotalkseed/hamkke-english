import {
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const values = [
  {
    icon: MessageCircle,
    title: "Real Conversations",
    text: "Practice English the way it is used in real life, from everyday conversations to deeper discussions about your experiences, goals, and ideas.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coaching",
    text: "Every learner has a different journey. Lessons are designed around your level, interests, goals, and the areas where you want to grow.",
  },
  {
    icon: TrendingUp,
    title: "Confidence Through Practice",
    text: "Confidence comes from using English. Through consistent practice and meaningful conversations, you will gradually become more comfortable expressing yourself.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-[#EEF5EE] pt-24 pb-32 relative overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-6">


        {/* Heading */}
        <div className="max-w-3xl mb-16">


          <p className="
            uppercase
            tracking-[0.3em]
            text-[#6F8F72]
            mb-6
            text-sm
          ">
            About TalkSeed
          </p>



          <h2 className="
            text-5xl
            leading-tight
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
          ">
            English is more than speaking correctly.
            <br />
            It is about expressing who you are.
          </h2>



          <p className="
            mt-8
            text-lg
            text-gray-600
            leading-8
          ">
            At TalkSeed, every lesson begins with a simple conversation and
            grows into something meaningful. Through real discussions,
            practical expressions, and personalized coaching, learners develop
            the confidence to share their thoughts, express their ideas, and
            communicate naturally in English.
          </p>


        </div>





        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8">


          {values.map((value, index) => {

            const Icon = value.icon;

            return (

              <div
                key={index}
                className="
                  bg-white
                  rounded-3xl
                  p-8
                  border
                  border-[#DDE9D8]
                  text-center
                  transition
                  duration-300
                  hover:-translate-y-2
                "
              >


                <div className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#EEF5EE]
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-6
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
                  {value.title}
                </h3>





                <p className="
                  text-gray-600
                  leading-7
                ">
                  {value.text}
                </p>


              </div>

            );

          })}


        </div>


      </div>






      {/* Organic Wave Transition */}
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
            relative
            block
            w-full
            h-[70px]
          "
        >

          <path
            d="
              M0,0
              C200,80 400,100 600,60
              C800,20 1000,40 1200,90
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