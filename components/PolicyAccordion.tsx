"use client";

import { useState } from "react";

type PolicySection = {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

interface PolicyAccordionProps {
  sections: PolicySection[];
}

export default function PolicyAccordion({
  sections,
}: PolicyAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(
    null
  );

  const handleToggle = (id: string) => {
    setOpenSection((current) =>
      current === id ? null : id
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <div className="border-t border-[#D8DED5]">
        {sections.map((section) => {
          const isOpen = openSection === section.id;

          return (
            <div
              key={section.id}
              className={`
                border-b
                border-[#D8DED5]
                transition-colors
                duration-300

                ${
                  isOpen
                    ? "bg-[#F5F8F3]"
                    : "bg-transparent"
                }
              `}
            >
              {/* =================================================
                  HEADER
                  ================================================= */}

              <button
                type="button"
                onClick={() => handleToggle(section.id)}
                aria-expanded={isOpen}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-4

                  px-2
                  py-6

                  text-left

                  transition-opacity
                  duration-200
                  hover:opacity-70

                  sm:gap-5
                  sm:px-4
                  sm:py-7

                  lg:px-6
                "
              >
                {/* LEFT SIDE */}

                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3

                    sm:gap-6
                  "
                >
                  {/* NUMBER */}

                  <span
                    className="
                      shrink-0

                      font-sans
                      text-[11px]
                      font-medium
                      tracking-[0.18em]

                      text-[#6F8F72]

                      sm:text-[12px]
                    "
                  >
                    {section.number}
                  </span>

                  {/* MAIN ICON */}

                  <span
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center

                      rounded-full

                      bg-[#E2EBDD]

                      text-[#6F8F72]

                      sm:h-10
                      sm:w-10
                    "
                    aria-hidden="true"
                  >
                    {section.icon}
                  </span>

                  {/* HEADING */}

                  <span
                    className="
                      min-w-0
                      whitespace-nowrap

                      font-serif
                      text-[17px]
                      font-normal
                      leading-tight
                      tracking-[-0.01em]

                      text-[#292929]

                      sm:text-[22px]

                      lg:text-[24px]
                    "
                  >
                    {section.title}
                  </span>
                </div>

                {/* PLUS / MINUS */}

                <span
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center

                    font-sans
                    text-[20px]
                    font-light
                    leading-none

                    text-[#6F8F72]

                    sm:text-[21px]
                  "
                  aria-hidden="true"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {/* =================================================
                  CONTENT
                  ================================================= */}

              <div
                className={`
                  grid
                  transition-[grid-template-rows]
                  duration-300
                  ease-out

                  ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }
                `}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="
                      max-w-[780px]

                      px-2
                      pb-9
                      pl-[3.35rem]
                      pr-4

                      font-serif
                      text-[16px]
                      font-normal
                      leading-7

                      text-[#4A4A4A]

                      sm:pl-[4.5rem]
                      sm:text-[17px]
                      sm:leading-8

                      lg:pl-[5rem]
                      lg:text-[18px]
                      lg:leading-8
                    "
                  >
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}