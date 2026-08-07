"use client";

import { AnimatePresence, motion } from "framer-motion";

type Reflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
};

export default function ReflectionModal({
  reflection,
  open,
  onClose,
  onPrevious,
  onNext,
}: {
  reflection: Reflection | null;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <AnimatePresence>
      {open && reflection && (
        <motion.div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-6
          "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >

          <motion.div
            className="
              relative
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-[2.5rem]
              bg-white
              p-10
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >

            {/* Close Button */}

            <button
              onClick={onClose}
              className="
                absolute
                right-8
                top-8
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#EEF5EE]
                text-2xl
                text-[#6F8F72]
                transition
                hover:bg-[#DDE9D8]
              "
            >
              ×
            </button>


            {/* Rating */}

            <div className="flex gap-2 text-xl">
              {Array.from({ length: reflection.rating }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
            </div>


            {/* Profile */}

            <div className="mt-8 flex items-center gap-6">

              {reflection.photo_url ? (
                <img
                  src={reflection.photo_url}
                  alt={reflection.name}
                  className="
                    h-24
                    w-24
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EEF5EE]
                    text-3xl
                    text-[#6F8F72]
                  "
                >
                  {reflection.name.charAt(0)}
                </div>
              )}


              <div>

                <h2
                  className="
                    text-4xl
                    text-[#2B2B2B]
                    [font-family:var(--font-cormorant)]
                  "
                >
                  {reflection.name}
                </h2>


                <p className="mt-2 text-lg text-[#6F8F72]">
                  {reflection.role}
                  {reflection.country && ` • ${reflection.country}`}
                </p>

              </div>

            </div>


            {/* Divider */}

            <div className="mt-8 h-px bg-[#E7ECE5]" />


            {/* Quote Decoration */}

            <div
              className="
                mt-8
                text-7xl
                leading-none
                text-[#E6EEE4]
                [font-family:var(--font-cormorant)]
              "
            >
              "
            </div>


            {/* Reflection */}

            <blockquote
              className="
                -mt-4
                whitespace-pre-line
                text-[26px]
                leading-[1.8]
                italic
                text-[#4A4A4A]
                [font-family:var(--font-cormorant)]
              "
            >
              “{reflection.reflection}”
            </blockquote>


            {/* Navigation */}

            <div
              className="
                mt-14
                flex
                items-center
                justify-between
                border-t
                border-[#EEF1ED]
                pt-8
              "
            >

              <button
  onClick={onPrevious}
  className="
    text-[#6F8F72]
    transition
    hover:underline
  "
>
  ← Previous Story
</button>


<button
  onClick={onNext}
  className="
    text-[#6F8F72]
    transition
    hover:underline
  "
>
  Next Story →
</button>

            </div>

          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}