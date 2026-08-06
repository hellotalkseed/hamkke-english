"use client";

import { useEffect, useState } from "react";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import VideoModal from "./VideoModal";
import AssessmentModal from "./AssessmentModal";
import Navbar from "./Navbar";

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
    max-w-[1400px]
    gap-10
    px-6
    pt-8
    pb-8
    md:px-8
    md:pt-14
    md:pb-20
    lg:min-h-[calc(100vh-88px)]
    lg:grid-cols-2
    lg:items-center
    lg:gap-10
    lg:px-10
  "
>

          <HeroContent
            onStartConversation={() =>
              setIsAssessmentOpen(true)
            }
          />


          <HeroImage
            onOpenVideo={() =>
              setIsVideoOpen(true)
            }
          />


        </section>


        {/* Soft background decoration */}

        <div
          className="
            pointer-events-none
            absolute
            right-[-120px]
            top-28
            h-[420px]
            w-[420px]
            rounded-full
            bg-[#E8F0E5]
            opacity-40
            blur-3xl
          "
        />


      </main>


      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />


      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

    </>
  );
}