import { notFound } from "next/navigation";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  HeartHandshake,
  RefreshCw,
  WalletCards,
  Zap,
} from "lucide-react";

import Navbar from "../../../components/Navbar";
import PolicyAccordion from "../../../components/PolicyAccordion";
import { getMessages } from "../../../lib/getMessages";
import {
  isValidLocale,
  type Locale,
} from "../../../lib/i18n";

interface PolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PolicyPage({
  params,
}: PolicyPageProps) {
  const { locale: localeParam } =
    await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale =
    localeParam as Locale;

  const messages =
    getMessages(locale);

  const policy =
    messages.policy;

  const sections = [
    {
      id: "cancellation",
      number: "01",
      title: policy.cancellation.title,
      icon: (
        <CalendarDays
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {policy.cancellation.intro}
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div
                className="
                  mt-1
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#718A73]
                "
              >
                <Clock3
                  size={16}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p
                  className="
                    font-sans
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#718A73]
                  "
                >
                  {
                    policy.cancellation
                      .notice.title
                  }
                </p>

                <p className="mt-2">
                  {
                    policy.cancellation
                      .notice.text
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className="
                  mt-1
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#718A73]
                "
              >
                <Clock3
                  size={16}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p
                  className="
                    font-sans
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#718A73]
                  "
                >
                  {
                    policy.cancellation
                      .lateNotice.title
                  }
                </p>

                <p className="mt-2">
                  {
                    policy.cancellation
                      .lateNotice.text
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className="
                  mt-1
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#718A73]
                "
              >
                <CircleAlert
                  size={16}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p
                  className="
                    font-sans
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#718A73]
                  "
                >
                  {
                    policy.cancellation
                      .noShow.title
                  }
                </p>

                <p className="mt-2">
                  {
                    policy.cancellation
                      .noShow.text
                  }
                </p>
              </div>
            </div>
          </div>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              italic
              text-[#607568]
            "
          >
            {policy.cancellation.note}
          </p>
        </div>
      ),
    },

    {
      id: "unexpected",
      number: "02",
      title: policy.unexpected.title,
      icon: (
        <Zap
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {policy.unexpected.intro}
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <Zap
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {policy.unexpected.text}
            </p>
          </div>

          <p className="italic">
            {policy.unexpected.action}
          </p>

          <p>
            {policy.unexpected.resolution}
          </p>

          <p>
            {policy.unexpected.teacher}
          </p>
        </div>
      ),
    },

    {
      id: "late-arrivals",
      number: "03",
      title:
        policy.lateArrivals.title,
      icon: (
        <Clock3
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {policy.lateArrivals.intro}
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <Clock3
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p className="italic">
              {policy.lateArrivals.rule}
            </p>
          </div>

          <div className="flex gap-4">
            <div
              className="
                mt-1
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#E2EBDD]
                text-[#718A73]
              "
            >
              <CircleAlert
                size={16}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {
                policy.lateArrivals
                  .example
              }
            </p>
          </div>

          <p>
            {
              policy.lateArrivals
                .noContact
            }
          </p>
        </div>
      ),
    },

    {
      id: "teacher-cancellations",
      number: "04",
      title:
        policy.teacherCancellations
          .title,
      icon: (
        <HeartHandshake
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {
              policy.teacherCancellations
                .intro
            }
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <HeartHandshake
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {
                policy
                  .teacherCancellations
                  .text
              }
            </p>
          </div>

          <p className="italic">
            {
              policy.teacherCancellations
                .resolution
            }
          </p>
        </div>
      ),
    },

    {
      id: "repeated-cancellations",
      number: "05",
      title:
        policy.repeatedCancellations
          .title,
      icon: (
        <RefreshCw
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {
              policy.repeatedCancellations
                .intro
            }
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <RefreshCw
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p className="italic">
              {
                policy
                  .repeatedCancellations
                  .rule
              }
            </p>
          </div>

          <p>
            {
              policy.repeatedCancellations
                .text
            }
          </p>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              italic
              text-[#607568]
            "
          >
            {
              policy.repeatedCancellations
                .note
            }
          </p>
        </div>
      ),
    },

    {
      id: "tuition",
      number: "06",
      title: policy.tuition.title,
      icon: (
        <WalletCards
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {policy.tuition.intro}
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <WalletCards
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {policy.tuition.rule}
            </p>
          </div>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              text-[#607568]
            "
          >
            {policy.tuition.notice}
          </p>
        </div>
      ),
    },

    {
      id: "refunds",
      number: "07",
      title: policy.refunds.title,
      icon: (
        <WalletCards
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {policy.refunds.intro}
          </p>

          <div
            className="
              flex
              gap-4
              rounded-2xl
              bg-[#EEF2EA]
              p-5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#DCE4D7]
                text-[#718A73]
              "
            >
              <WalletCards
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {policy.refunds.rule}
            </p>
          </div>

          <p>
            {policy.refunds.transfer}
          </p>

          <p>
            {policy.refunds.exception}
          </p>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              italic
              text-[#607568]
            "
          >
            {policy.refunds.note}
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar />

      <main
        className="
          min-h-screen
          bg-[#FFFDF8]
          text-[#293A30]
        "
      >
        {/* =====================================================
            HERO
            ===================================================== */}

        <section
          className="
            bg-[#FFFDF8]
            px-6
            pb-12
            pt-12

            sm:px-10
            sm:pb-14
            sm:pt-14

            lg:px-16
            lg:pb-16
            lg:pt-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1080px]
            "
          >
            <p
              className="
                font-sans
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#718A73]

                sm:text-[12px]
              "
            >
              {policy.eyebrow}
            </p>

            <h1
              className="
                mt-3
                font-serif
                text-[42px]
                font-normal
                leading-[1.05]
                tracking-[-0.03em]
                text-[#293A30]

                sm:text-[50px]

                lg:text-[56px]
              "
            >
              {policy.title}
            </h1>

            <p
              className="
                mt-5
                max-w-[680px]
                font-sans
                text-[16px]
                leading-7
                text-[#607066]

                sm:text-[17px]
                sm:leading-8
              "
            >
              {policy.intro}
            </p>
          </div>
        </section>

        {/* =====================================================
            QUICK GUIDE
            ===================================================== */}

        <section
          className="
            bg-[#F3EDDD]
            px-6
            py-10

            sm:px-10
            sm:py-12

            lg:px-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1080px]
            "
          >
            <p
              className="
                font-sans
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#718A73]

                sm:text-[12px]
              "
            >
              {policy.quickGuide.eyebrow}
            </p>

            <div
              className="
                mt-5
                overflow-hidden
                rounded-[16px]
                border
                border-[#D8CDB9]
                bg-[#FFFDF8]

                sm:grid
                sm:grid-cols-3
              "
            >
              {/* 2+ HOURS */}

              <div
                className="
                  flex
                  items-start
                  gap-4
                  border-b
                  border-[#E0D7C8]
                  px-5
                  py-5

                  sm:block
                  sm:border-b-0
                  sm:border-r
                  sm:px-6
                  sm:py-6
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EEF2EA]
                    text-[#718A73]
                  "
                  aria-hidden="true"
                >
                  <Clock3
                    size={17}
                    strokeWidth={1.6}
                  />
                </div>

                <div className="sm:mt-4">
                  <p
                    className="
                      font-sans
                      text-[12px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-[#718A73]
                    "
                  >
                    {
                      policy.quickGuide
                        .notice.title
                    }
                  </p>

                  <p
                    className="
                      mt-1.5
                      font-sans
                      text-[15px]
                      leading-6
                      text-[#46564B]

                      sm:mt-2
                    "
                  >
                    {
                      policy.quickGuide
                        .notice.text
                    }
                  </p>
                </div>
              </div>

              {/* UNDER 2 HOURS */}

              <div
                className="
                  flex
                  items-start
                  gap-4
                  border-b
                  border-[#E0D7C8]
                  px-5
                  py-5

                  sm:block
                  sm:border-b-0
                  sm:border-r
                  sm:px-6
                  sm:py-6
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EEF2EA]
                    text-[#718A73]
                  "
                  aria-hidden="true"
                >
                  <Clock3
                    size={17}
                    strokeWidth={1.6}
                  />
                </div>

                <div className="sm:mt-4">
                  <p
                    className="
                      font-sans
                      text-[12px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-[#718A73]
                    "
                  >
                    {
                      policy.quickGuide
                        .lateNotice.title
                    }
                  </p>

                  <p
                    className="
                      mt-1.5
                      font-sans
                      text-[15px]
                      leading-6
                      text-[#46564B]

                      sm:mt-2
                    "
                  >
                    {
                      policy.quickGuide
                        .lateNotice.text
                    }
                  </p>
                </div>
              </div>

              {/* NO-SHOW */}

              <div
                className="
                  flex
                  items-start
                  gap-4
                  px-5
                  py-5

                  sm:block
                  sm:px-6
                  sm:py-6
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EEF2EA]
                    text-[#718A73]
                  "
                  aria-hidden="true"
                >
                  <CircleAlert
                    size={17}
                    strokeWidth={1.6}
                  />
                </div>

                <div className="sm:mt-4">
                  <p
                    className="
                      font-sans
                      text-[12px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-[#718A73]
                    "
                  >
                    {
                      policy.quickGuide
                        .noShow.title
                    }
                  </p>

                  <p
                    className="
                      mt-1.5
                      font-sans
                      text-[15px]
                      leading-6
                      text-[#46564B]

                      sm:mt-2
                    "
                  >
                    {
                      policy.quickGuide
                        .noShow.text
                    }
                  </p>
                </div>
              </div>
            </div>

            <p
              className="
                mt-4
                font-sans
                text-[13px]
                leading-6
                text-[#758477]
              "
            >
              {policy.quickGuide.note}
            </p>
          </div>
        </section>

        {/* =====================================================
            POLICY DETAILS
            ===================================================== */}

        <section
          className="
            bg-[#FFFDF8]
            px-6
            py-14

            sm:px-10
            sm:py-16

            lg:px-16
            lg:py-20
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1080px]
            "
          >
            <div className="mb-7 sm:mb-9">
              <p
                className="
                  font-sans
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                {policy.details.eyebrow}
              </p>

              <p
                className="
                  mt-2
                  max-w-[620px]
                  font-sans
                  text-[15px]
                  leading-7
                  text-[#607066]

                  sm:text-[16px]
                "
              >
                {
                  policy.details
                    .description
                }
              </p>
            </div>

            <PolicyAccordion
              sections={sections}
            />
          </div>
        </section>

        {/* =====================================================
            CLOSING NOTE
            ===================================================== */}

        <section
          className="
            bg-[#EEF2EA]
            px-6
            py-12

            sm:px-10
            sm:py-14

            lg:px-16
            lg:py-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1080px]
            "
          >
            <div
              className="
                rounded-[20px]
                border
                border-[#D4DED0]
                bg-[#FFFDF8]
                px-6
                py-7

                sm:px-8
                sm:py-8

                lg:flex
                lg:items-start
                lg:gap-8
                lg:px-10
                lg:py-9
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#DCE4D7]
                  text-[#718A73]
                "
                aria-hidden="true"
              >
                <HeartHandshake
                  size={20}
                  strokeWidth={1.5}
                />
              </div>

              <div
                className="
                  mt-5
                  max-w-[760px]

                  lg:mt-0
                "
              >
                <p
                  className="
                    font-sans
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#718A73]
                  "
                >
                  {
                    policy.closing
                      .eyebrow
                  }
                </p>

                <h2
                  className="
                    mt-2
                    font-serif
                    text-[28px]
                    font-normal
                    leading-tight
                    tracking-[-0.02em]
                    text-[#293A30]

                    sm:text-[32px]
                  "
                >
                  {policy.closing.title}
                </h2>

                <div
                  className="
                    mt-4
                    space-y-3
                    font-sans
                    text-[15px]
                    leading-7
                    text-[#607066]

                    sm:text-[16px]
                  "
                >
                  <p>
                    {policy.closing.text}
                  </p>

                  <p>
                    {policy.closing.textTwo}
                  </p>

                  <p
                    className="
                      pt-1
                      font-medium
                      text-[#718A73]
                    "
                  >
                    {
                      policy.closing
                        .thankYou
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}