"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import Navbar from "./Navbar";
import AssessmentModal from "./AssessmentModal";

export default function Hero() {

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);


  useEffect(() => {
    document.body.style.overflow = isVideoOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVideoOpen]);



  useEffect(() => {

    const handleEscape = (event: KeyboardEvent) => {

      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }

    };


    window.addEventListener("keydown", handleEscape);


    return () => {
      window.removeEventListener("keydown", handleEscape);
    };

  }, []);



  return (
    <>

      <Navbar />


      <main className="relative overflow-hidden bg-[#FAF8F5]">


        <section
          className="
            mx-auto
            grid
            min-h-[calc(100vh-88px)]
            max-w-7xl
            items-center
            gap-20
            px-6
            py-20
            lg:grid-cols-2
          "
        >


          <div>

            <p className="mb-8 text-[13px] font-medium uppercase tracking-[0.35em] text-[#6F8F72]">
              English Coaching
            </p>


            <h1 className="max-w-[620px] text-[58px] leading-[1.05] text-[#2B2B2B] lg:text-[76px] [font-family:var(--font-cormorant)]">
              Every meaningful conversation starts somewhere.
            </h1>


            <p className="mt-10 max-w-[500px] text-[20px] leading-[1.8] text-[#5B5B5B]">
              Build the confidence to express your ideas, share your thoughts,
              and connect naturally through meaningful English conversations.
            </p>


            <div className="mt-12 flex flex-wrap gap-6">


              <button
                onClick={() => setIsAssessmentOpen(true)}
                className="
                  rounded-full
                  bg-[#6F8F72]
                  px-9
                  py-4
                  text-lg
                  font-medium
                  text-white
                  shadow-lg
                  shadow-[#6F8F72]/20
                  transition
                  hover:-translate-y-1
                  hover:bg-[#5B7960]
                "
              >
                Start a Conversation
              </button>


              <a
                href="#lessons"
                className="
                  rounded-full
                  border
                  border-[#6F8F72]
                  px-9
                  py-4
                  text-lg
                  font-medium
                  text-[#6F8F72]
                  transition
                  hover:-translate-y-1
                  hover:bg-[#EEF5EE]
                "
              >
                Explore Lessons
              </a>


            </div>

          </div>
                    {/* IMAGE */}

          <div className="flex justify-center">


            <div
              className="
                relative
                h-[580px]
                w-[430px]
                overflow-hidden
                rounded-[2.5rem]
                border-8
                border-white
                bg-white
                shadow-[0_35px_80px_rgba(0,0,0,0.12)]
              "
            >


              <Image
                src="/jesica.jpg"
                alt="Jesica Abejaron"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 430px"
                className="object-cover object-top"
              />



              <button
                onClick={() => setIsVideoOpen(true)}
                className="
                  absolute
                  bottom-10
                  left-1/2
                  flex
                  -translate-x-1/2
                  items-center
                  gap-4
                  whitespace-nowrap
                  rounded-full
                  bg-white
                  px-6
                  py-4
                  shadow-xl
                  transition
                  hover:-translate-y-1
                  hover:shadow-2xl
                "
              >

                <span
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8F72]
                    text-white
                  "
                >
                  <Play size={18} fill="currentColor" />
                </span>


                <span className="text-lg font-medium text-[#2B2B2B]">
                  Meet Your Coach
                </span>


              </button>


            </div>


          </div>


        </section>





        {/* VIDEO MODAL */}

        {isVideoOpen && (

          <div
            onClick={() => setIsVideoOpen(false)}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/70
              px-6
              backdrop-blur-md
            "
          >


            <div
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                max-h-[90vh]
                w-full
                max-w-6xl
                overflow-y-auto
                rounded-[2.5rem]
                bg-[#FAF8F5]
                p-6
                shadow-2xl
                md:p-10
              "
            >


              <button
                onClick={() => setIsVideoOpen(false)}
                className="
                  absolute
                  right-6
                  top-6
                  z-20
                  rounded-full
                  bg-white
                  p-2
                  shadow-md
                  transition
                  hover:bg-gray-100
                "
              >
                <X size={20}/>
              </button>



              <div className="grid items-center gap-12 lg:grid-cols-2">


                {/* LEFT SIDE */}

                <div>


                  <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#6F8F72]">
                    Meet Your Coach
                  </p>



                  <h2 className="max-w-md text-4xl leading-tight text-[#2B2B2B] [font-family:var(--font-cormorant)] md:text-5xl">
                    Every meaningful conversation starts somewhere.
                  </h2>



                  <p className="mt-4 text-2xl italic text-[#6F8F72] [font-family:var(--font-cormorant)]">
                    Here's a little about mine.
                  </p>



                  <p className="mt-6 max-w-lg text-lg leading-7 text-[#5B5B5B]">
                    I started teaching English while studying business, and
                    over the years, I discovered that the best lessons are not
                    only about grammar. They are about helping people feel
                    confident enough to speak.
                  </p>



                  <p className="mt-10 text-[10px] uppercase tracking-[0.35em] text-[#6F8F72]">
                    My Background
                  </p>



                  <div className="mt-5 grid gap-4 sm:grid-cols-3">


                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A]">
                        Education
                      </p>

                      <p className="mt-3 text-sm leading-6 text-[#444]">
                        Bachelor's Degree
                        <br/>
                        Business
                        <br/>
                        Administration
                      </p>

                    </div>



                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A]">
                        Teaching
                      </p>

                      <p className="mt-3 text-sm leading-6 text-[#444]">
                        4+ Years
                        <br/>
                        Online English
                        <br/>
                        Coaching
                      </p>

                    </div>



                    <div className="rounded-2xl bg-white p-5 shadow-sm">

                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A8A8A]">
                        Certifications
                      </p>

                      <p className="mt-3 text-sm leading-6 text-[#444]">
                        Advanced TESOL
                        <br/>
                        Professional TEFL
                        <br/>
                        Young Learners
                      </p>

                    </div>


                  </div>


                </div>
                                {/* RIGHT SIDE VIDEO */}

                <div className="flex justify-center">


                  <div
                    className="
                      relative
                      h-[520px]
                      w-[380px]
                      overflow-hidden
                      rounded-[2.5rem]
                      border-8
                      border-white
                      bg-black
                      shadow-xl
                    "
                  >


                    <video
                      controls
                      autoPlay
                      playsInline
                      controlsList="nodownload"
                      disablePictureInPicture
                      className="h-full w-full object-cover scale-[1.08]"
                    >

                      <source
                        src="/videos/talkseed-introduction.mp4"
                        type="video/mp4"
                      />

                      Your browser does not support HTML5 video.

                    </video>


                  </div>


                </div>



              </div>


            </div>


          </div>

        )}






        {/* ASSESSMENT MODAL */}

        <AssessmentModal
          isOpen={isAssessmentOpen}
          onClose={() => setIsAssessmentOpen(false)}
        />






        {/* WAVE */}

        <div className="absolute bottom-0 left-0 w-full overflow-hidden">

          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="h-[90px] w-full"
          >

            <path
              d="M0,70 C360,130 1080,10 1440,70 L1440,120 L0,120 Z"
              fill="#EEF5EE"
            />

          </svg>

        </div>


      </main>


    </>
  );
} 