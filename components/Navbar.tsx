"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import AssessmentModal from "./AssessmentModal";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#lessons", label: "Lessons" },
  { href: "#student-stories", label: "Stories" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleStartLearning = () => {
    setIsMobileMenuOpen(false);
    setIsAssessmentOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E7DDD1] bg-[#FAF8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          {/* Logo */}

          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3"
          >
            <Image
              src="/logo/talkseed-icon.svg"
              alt="TalkSeed logo"
              width={38}
              height={38}
              priority
              className="
                h-auto
                w-9
                shrink-0
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
              "
            />

            <div className="min-w-0">

              <h1
                className="
                  text-xl
                  leading-none
                  font-semibold
                  text-[#2B2B2B]
                  md:text-2xl
                  [font-family:var(--font-cormorant)]
                "
              >
                TalkSeed
              </h1>

              <p
                className="
                  mt-1
                  hidden
                  whitespace-nowrap
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#6F8F72]
                  sm:block
                  md:text-[10px]
                "
              >
                From Small Talk to Big Ideas
              </p>

            </div>

          </Link>



          {/* Desktop Navigation */}

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



         {/* Mobile Menu Button */}

<button
  type="button"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label="Toggle navigation"
  className="
    flex
    h-11
    w-11
    shrink-0
    items-center
    justify-center
    rounded-xl
    text-[#2B2B2B]
    transition-colors
    hover:bg-[#EFE8DE]
    md:hidden
  "
>
  {isMobileMenuOpen ? (
    <X size={26} />
  ) : (
    <Menu size={26} />
  )}
</button>

        </div>



        {/* Mobile Menu */}

        <div
          className={`
            overflow-hidden
            transition-all
            duration-300
            md:hidden
            ${
              isMobileMenuOpen
                ? "max-h-[500px] border-t border-[#E7DDD1]"
                : "max-h-0"
            }
          `}
        >
          <nav className="bg-[#FAF8F5] px-6 py-6">

            <div className="flex flex-col gap-5">

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    text-lg
                    font-medium
                    text-[#555]
                    transition-colors
                    hover:text-[#6F8F72]
                  "
                >
                  {link.label}
                </Link>
              ))}

              <button
                onClick={handleStartLearning}
                className="
                  mt-3
                  rounded-full
                  bg-[#6F8F72]
                  py-3.5
                  font-medium
                  text-white
                  transition
                  hover:bg-[#5B7960]
                "
              >
                Start Learning
              </button>

            </div>

          </nav>
        </div>

      </header>

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />
    </>
  );
}