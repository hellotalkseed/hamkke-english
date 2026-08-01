export default function Testimonials() {
  return (
    <section
      id="student-stories"
      className="bg-white py-28"
    >

      <div className="max-w-7xl mx-auto px-6">


        {/* Heading */}
        <div className="text-center mb-20">

          <p className="uppercase tracking-[0.3em] text-[#6F8F72] mb-5 text-sm">
            Student Stories
          </p>


          <h2 className="
            text-5xl
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
          ">
            Small steps. Meaningful milestones.
          </h2>

        </div>





        {/* Featured Story */}
        <div className="
          bg-[#EEF5EE]
          rounded-[2.5rem]
          p-10
          lg:p-16
          mb-16
        ">


          <div className="grid lg:grid-cols-2 gap-16 items-center">



            {/* Story */}
            <div>


              <p className="
                text-sm
                uppercase
                tracking-[0.25em]
                text-[#6F8F72]
                mb-6
              ">
                Aviation English
              </p>



              <h3 className="
                text-4xl
                leading-tight
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]
                mb-6
              ">
                From language practice to a professional milestone
              </h3>



              <p className="
                text-gray-700
                leading-8
                text-lg
              ">
                "Thanks to your help, I finally passed and joined Korean Air.
                You have a big part in my success."
              </p>



              <p className="mt-6 text-sm text-gray-500">
                — Pilot Applicant
              </p>


            </div>






            {/* Journey Timeline */}
            <div>


              <p className="
                uppercase
                tracking-[0.25em]
                text-[#6F8F72]
                text-sm
                mb-8
              ">
                Journey
              </p>



              <div className="space-y-8">


                <div className="flex gap-5">

                  <div className="
                    text-[#6F8F72]
                    font-medium
                  ">
                    01
                  </div>


                  <div>

                    <h4 className="font-medium text-[#2B2B2B]">
                      Starting Point
                    </h4>

                    <p className="text-gray-600 mt-1 leading-7">
                      Preparing for aviation English requirements and
                      professional communication.
                    </p>

                  </div>

                </div>





                <div className="flex gap-5">

                  <div className="
                    text-[#6F8F72]
                    font-medium
                  ">
                    02
                  </div>


                  <div>

                    <h4 className="font-medium text-[#2B2B2B]">
                      Growth
                    </h4>

                    <p className="text-gray-600 mt-1 leading-7">
                      Developing listening skills, organizing ideas through
                      audio summarization, and communicating with confidence.
                    </p>

                  </div>

                </div>





                <div className="flex gap-5">

                  <div className="
                    text-[#6F8F72]
                    font-medium
                  ">
                    03
                  </div>


                  <div>

                    <h4 className="font-medium text-[#2B2B2B]">
                      Milestone
                    </h4>

                    <p className="text-gray-600 mt-1 leading-7">
                      Successfully achieving a professional aviation goal.
                    </p>

                  </div>

                </div>


              </div>


            </div>


          </div>


        </div>







        {/* Supporting Stories */}
        <div className="grid md:grid-cols-2 gap-10">



          {/* Parent Story */}
          <div className="
            border
            border-[#DDE9D8]
            rounded-3xl
            p-8
          ">


            <p className="
              uppercase
              tracking-[0.25em]
              text-[#6F8F72]
              text-sm
              mb-5
            ">
              Parent Feedback
            </p>



            <h3 className="
              text-3xl
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
              mb-4
            ">
              Building confidence beyond the classroom
            </h3>



            <p className="text-gray-600 leading-8">
              "Flora and Emily's English skills have improved significantly
              thanks to you. They're even at a higher level than their peers
              at the academy."
            </p>



            <p className="mt-6 text-sm text-gray-500">
              — Parent of Flora and Emily
            </p>


          </div>







          {/* Young Learner Story */}
          <div className="
            border
            border-[#DDE9D8]
            rounded-3xl
            p-8
          ">


            <p className="
              uppercase
              tracking-[0.25em]
              text-[#6F8F72]
              text-sm
              mb-5
            ">
              Young Learner
            </p>



            <h3 className="
              text-3xl
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
              mb-4
            ">
              A trusted teacher for growing learners
            </h3>



            <p className="text-gray-600 leading-8">
              "Yes^^ you are Juju's best teacher.^^"
            </p>



            <p className="mt-6 text-sm text-gray-500">
              — Parent of Juju
            </p>


          </div>



        </div>


      </div>


    </section>
  );
}