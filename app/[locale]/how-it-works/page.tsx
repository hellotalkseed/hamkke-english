import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import Navbar from "../../../components/Navbar";
import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface HowItWorksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function renderHighlightedText(
  text: string,
  highlights: readonly string[]
) {
  if (highlights.length === 0) {
    return text;
  }

  const pattern = new RegExp(
    `(${highlights
      .map((phrase) =>
        phrase.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )
      )
      .join("|")})`,
    "g"
  );

  return text
    .split(pattern)
    .map((part, index) => {
      if (highlights.includes(part)) {
        return (
          <strong
            key={`${part}-${index}`}
            className="font-semibold text-[#304A39]"
          >
            {part}
          </strong>
        );
      }

      return part;
    });
}

export default async function HowItWorksPage({
  params,
}: HowItWorksPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);
  const content = messages.approachPage;

  const approachSteps = [
    {
      ...content.framework.steps.talk,
      icon: MessageCircle,
    },
    {
      ...content.framework.steps.goDeeper,
      icon: MessagesSquare,
    },
    {
      ...content.framework.steps.refine,
      icon: Sparkles,
    },
    {
      ...content.framework.steps.tryAgain,
      icon: RefreshCw,
    },
  ];

  const teacherRoles = [
    content.teacherRole.roles.listen,
    content.teacherRole.roles.ask,
    content.teacherRole.roles.refine,
    content.teacherRole.roles.giveBack,
  ];

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#FFFDF8] text-[#293A30]">
        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="bg-[#FFFDF8]">
          <div
            className="
              mx-auto
              grid
              w-full
              max-w-[1180px]
              items-center
              gap-8
              px-6
              pb-12
              pt-12

              sm:px-10
              sm:pb-14
              sm:pt-14

              lg:grid-cols-[minmax(0,1fr)_300px]
              lg:gap-14
              lg:px-0
              lg:pb-16
              lg:pt-16
            "
          >
            <div className="max-w-[760px]">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                {content.hero.eyebrow}
              </p>

              <h1
                className="
                  mt-3
                  font-serif
                  text-[44px]
                  font-normal
                  leading-[1.03]
                  tracking-[-0.03em]
                  text-[#293A30]

                  sm:text-[52px]

                  lg:text-[58px]
                "
              >
                {content.hero.title}
              </h1>

              <p
                className="
                  mt-5
                  max-w-[650px]
                  text-[16px]
                  leading-7
                  text-[#607066]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {renderHighlightedText(
                  content.hero.description.text,
                  content.hero.description.highlights
                )}
              </p>
            </div>

            <div
              className="
                relative
                mx-auto
                hidden
                h-[250px]
                w-[280px]

                lg:block
              "
              aria-hidden="true"
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  h-[210px]
                  w-[210px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#F3EDDD]
                "
              />

              <Image
                src="/mascot/hamkkeapproach-pull.png"
                alt=""
                fill
                priority
                sizes="280px"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY CONVERSATION
            ===================================================== */}

        <section className="bg-[#F3EDDD]">
          <div
            className="
              mx-auto
              grid
              w-full
              max-w-[1180px]
              gap-7
              px-6
              py-14

              sm:px-10
              sm:py-16

              lg:grid-cols-[0.8fr_1.2fr]
              lg:gap-16
              lg:px-0
              lg:py-20
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                {content.whyConversation.eyebrow}
              </p>

              <h2
                className="
                  mt-3
                  max-w-[420px]
                  font-serif
                  text-[34px]
                  font-normal
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#293A30]

                  sm:text-[40px]
                "
              >
                {content.whyConversation.title}
              </h2>
            </div>

            <div
              className="
                rounded-[22px]
                border
                border-[#304A39]/10
                bg-[#FFFDF8]
                px-6
                py-6

                sm:px-8
                sm:py-7
              "
            >
              <p
                className="
                  text-[16px]
                  leading-8
                  text-[#526158]
                "
              >
                {renderHighlightedText(
                  content.whyConversation.firstParagraph.text,
                  [
                    content.whyConversation.firstParagraph
                      .highlight,
                  ]
                )}
              </p>

              <div
                className="
                  my-5
                  h-px
                  bg-[#304A39]/10
                "
              />

              <p
                className="
                  text-[15px]
                  leading-7
                  text-[#758477]
                "
              >
                {renderHighlightedText(
                  content.whyConversation.secondParagraph.text,
                  content.whyConversation.secondParagraph
                    .highlights
                )}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            APPROACH
            ===================================================== */}

        <section className="bg-[#FFFDF8]">
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
              px-6
              py-14

              sm:px-10
              sm:py-16

              lg:px-0
              lg:py-20
            "
          >
            <div className="max-w-[700px]">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                {content.framework.eyebrow}
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                  font-normal
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#293A30]

                  sm:text-[40px]
                "
              >
                {content.framework.title}
              </h2>

              <p
                className="
                  mt-3
                  max-w-[620px]
                  text-[15px]
                  leading-7
                  text-[#607066]
                "
              >
                {content.framework.description}
              </p>
            </div>

            {/* STEPS */}

            <div
              className="
                mt-9
                overflow-hidden
                rounded-[24px]
                border
                border-[#304A39]/10
                bg-[#FAF8F2]
              "
            >
              {approachSteps.map(
                (step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className={`
                        grid
                        gap-5
                        px-6
                        py-7

                        sm:grid-cols-[60px_minmax(0,1fr)]
                        sm:gap-6
                        sm:px-8

                        lg:grid-cols-[60px_210px_minmax(0,1fr)_250px]
                        lg:items-center
                        lg:gap-7
                        lg:px-9

                        ${
                          index !==
                          approachSteps.length -
                            1
                            ? "border-b border-[#304A39]/10"
                            : ""
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          bg-[#E7ECE2]
                          text-[#607568]
                        "
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.6}
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-[#9AA89C]
                          "
                        >
                          {step.number}
                        </p>

                        <h3
                          className="
                            mt-1
                            font-serif
                            text-[27px]
                            font-medium
                            leading-none
                            text-[#304A39]
                          "
                        >
                          {step.title}
                        </h3>
                      </div>

                      <p
                        className="
                          text-[14px]
                          leading-7
                          text-[#66736A]
                        "
                      >
                        {step.description}
                      </p>

                      <div
                        className="
                          rounded-[14px]
                          bg-[#EEF2EA]
                          px-4
                          py-3
                        "
                      >
                        <p
                          className="
                            text-[13px]
                            font-medium
                            leading-6
                            text-[#526459]
                          "
                        >
                          {step.short}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* CYCLE NOTE */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-4
                rounded-[18px]
                border
                border-[#C7D2C4]
                bg-[#EEF2EA]
                px-6
                py-5

                sm:flex-row
                sm:items-start
                sm:gap-5
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#FFFDF8]
                  text-[#607568]
                "
              >
                <RefreshCw
                  size={18}
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <h3
                  className="
                    text-[15px]
                    font-semibold
                    text-[#304A39]
                  "
                >
                  {content.framework.cycle.title}
                </h3>

                <p
                  className="
                    mt-1
                    max-w-[850px]
                    text-[14px]
                    leading-7
                    text-[#66736A]
                  "
                >
                  {
                    content.framework.cycle
                      .description
                  }
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TEACHER ROLE
            ===================================================== */}

        <section className="bg-[#EEF2EA]">
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
              px-6
              py-14

              sm:px-10
              sm:py-16

              lg:px-0
              lg:py-20
            "
          >
            <div
              className="
                grid
                gap-7

                lg:grid-cols-[0.7fr_1.3fr]
                lg:gap-16
              "
            >
              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#718A73]

                    sm:text-[12px]
                  "
                >
                  {content.teacherRole.eyebrow}
                </p>

                <h2
                  className="
                    mt-3
                    max-w-[390px]
                    font-serif
                    text-[34px]
                    font-normal
                    leading-[1.08]
                    tracking-[-0.025em]
                    text-[#293A30]

                    sm:text-[40px]
                  "
                >
                  {content.teacherRole.title}
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[390px]
                    text-[15px]
                    leading-7
                    text-[#607066]
                  "
                >
                  {renderHighlightedText(
                    content.teacherRole
                      .description.text,
                    [
                      content.teacherRole
                        .description
                        .highlight,
                    ]
                  )}
                </p>
              </div>

              <div
                className="
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-[#304A39]/10
                  bg-[#FFFDF8]
                "
              >
                {teacherRoles.map(
                  (role, index) => (
                    <div
                      key={role.number}
                      className={`
                        grid
                        gap-2
                        px-6
                        py-5

                        sm:grid-cols-[50px_130px_minmax(0,1fr)]
                        sm:items-start
                        sm:gap-5
                        sm:px-7

                        ${
                          index !==
                          teacherRoles.length -
                            1
                            ? "border-b border-[#304A39]/10"
                            : ""
                        }
                      `}
                    >
                      <span
                        className="
                          text-[11px]
                          font-semibold
                          tracking-[0.14em]
                          text-[#9AA89C]
                        "
                      >
                        {role.number}
                      </span>

                      <h3
                        className="
                          text-[15px]
                          font-semibold
                          text-[#304A39]
                        "
                      >
                        {role.title}
                      </h3>

                      <p
                        className="
                          text-[14px]
                          leading-6
                          text-[#66736A]
                        "
                      >
                        {role.description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            NEXT STEP
            ===================================================== */}

        <section className="bg-[#FFFDF8]">
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1180px]
              flex-col
              gap-7
              px-6
              py-12

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-10
              sm:py-14

              lg:px-0
              lg:py-16
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                {content.nextStep.eyebrow}
              </p>

              <h2
                className="
                  mt-3
                  max-w-[600px]
                  font-serif
                  text-[34px]
                  font-normal
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#293A30]

                  sm:text-[40px]
                "
              >
                {content.nextStep.title}
              </h2>

              <p
                className="
                  mt-3
                  max-w-[570px]
                  text-[14px]
                  leading-7
                  text-[#607066]
                "
              >
                {content.nextStep.description}
              </p>
            </div>

            <div
              className="
                relative
                w-fit
                shrink-0
                pb-[6px]
              "
            >
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-[calc(100%-6px)]
                  rounded-[10px]
                  bg-[#718A73]
                "
                aria-hidden="true"
              />

              <Link
                href={`/${locale}/lessons`}
                className="
                  group
                  relative
                  flex
                  min-h-[46px]
                  items-center
                  gap-3
                  rounded-[10px]
                  bg-[#DCE4D7]
                  px-6
                  py-3
                  text-[14px]
                  font-semibold
                  text-[#304A39]
                  transition-transform
                  duration-200

                  hover:-translate-y-[2px]

                  active:translate-y-[4px]
                "
              >
                <span>
                  {content.nextStep.button}
                </span>

                <ArrowRight
                  size={18}
                  strokeWidth={1.7}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}