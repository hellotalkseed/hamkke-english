"use client";

import { useState } from "react";
import AssessmentModal from "./AssessmentModal";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#lessons", label: "Lessons" },
  { href: "#student-stories", label: "Stories" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);


  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E7DDD1] bg-[#FAF8F5]/90 backdrop-blur-md">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">


          {/* Logo */}

          <Link
            href="/"
            className="group flex items-center gap-2.5"
          >

            <Image
              src="/logo/talkseed-icon.svg"
              alt="TalkSeed logo"
              width={46}
              height={46}
              priority
              className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
            />


            <div>

              <h1
                className="
                  leading-none
                  text-2xl
                  font-semibold
                  text-[#2B2B2B]
                  [font-family:var(--font-cormorant)]
                "
              >
                TalkSeed
              </h1>


              <p
                className="
                  mt-1
                  text-[10px]
                  uppercase
                  tracking-[0.32em]
                  text-[#6F8F72]
                "
              >
                From Small Talk to Big Ideas
              </p>

            </div>

          </Link>



          {/* Navigation */}

          <nav className="hidden items-center gap-8 md:flex">


            {navLinks.map((link) => (

              <Link
                key={link.href}
                href={link.href}
                className="
                  relative
                  text-[15px]
                  font-medium
                  text-[#555]
                  transition-colors
                  duration-300
                  hover:text-[#6F8F72]

                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[1.5px]
                  after:w-0
                  after:bg-[#6F8F72]
                  after:transition-all
                  after:duration-300

                  hover:after:w-full
                "
              >
                {link.label}
              </Link>

            ))}



            {/* Start Learning Button */}

            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="
                ml-2
                rounded-full
                bg-[#6F8F72]
                px-7
                py-3
                font-medium
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#5B7960]
                hover:shadow-lg
              "
            >
              Start Learning
            </button>


          </nav>


        </div>

      </header>



      {/* Assessment Modal */}

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

    </>
  );
}