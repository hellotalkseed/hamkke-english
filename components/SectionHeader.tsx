import FadeUp from "./animations/FadeUp";

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <FadeUp>
      <div
        className="
          mb-16
          max-w-3xl

          lg:mb-24
        "
      >

        {/* Brand Label */}

        <p
          className="
            mb-5
            text-[12px]
            font-medium
            uppercase
            tracking-[0.35em]
            text-[#6F8F72]

            sm:mb-6
          "
        >
          Hamkke │ 함께
        </p>


        {/* Title */}

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
          {title}
        </h2>


        {/* Description */}

        {description && (
          <p
            className="
              mt-8
              max-w-[560px]
              text-[17px]
              leading-8
              text-[#5B5B5B]

              sm:mt-10
              sm:text-lg
              sm:leading-9
            "
          >
            {description}
          </p>
        )}

      </div>
    </FadeUp>
  );
}