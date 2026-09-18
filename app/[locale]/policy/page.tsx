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

const tuitionPolicy: Record<
  Locale,
  {
    title: string;
    intro: string;
    rule: string;
    notice: string;
  }
> = {
  en: {
    title: "Tuition & Pricing",
    intro:
      "Tuition is set according to the selected lesson duration, term length, and displayed currency.",
    rule:
      "Tuition is reviewed annually and may be adjusted to reflect inflation and changes in operating costs.",
    notice:
      "Any tuition changes will be communicated in advance.",
  },

  ko: {
    title: "수업료 및 가격",
    intro:
      "수업료는 선택한 수업 시간, 수강 횟수 및 표시 통화에 따라 책정됩니다.",
    rule:
      "수업료는 매년 검토되며 물가 상승 및 운영 비용의 변동을 반영하여 조정될 수 있습니다.",
    notice:
      "수업료가 변경되는 경우 사전에 안내드립니다.",
  },

  zh: {
    title: "学费与价格",
    intro:
      "学费根据所选的课程时长、课程周期以及页面显示的货币进行定价。",
    rule:
      "学费每年进行审核，并可能根据通货膨胀和运营成本的变化进行调整。",
    notice:
      "如学费发生调整，我们会提前通知。",
  },

  ja: {
    title: "授業料・料金",
    intro:
      "授業料は、選択したレッスン時間、受講回数、表示通貨に基づいて設定されます。",
    rule:
      "授業料は毎年見直され、物価上昇や運営費の変動を反映して調整される場合があります。",
    notice:
      "授業料を変更する場合は、事前にお知らせします。",
  },
};

export default async function PolicyPage({
  params,
}: PolicyPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const tuition = tuitionPolicy[locale];

  const sections = [
    {
      id: "cancellation",
      number: "01",
      title: t.policy.cancellation.title,
      icon: (
        <CalendarDays
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>{t.policy.cancellation.intro}</p>

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
                  {t.policy.cancellation.notice.title}
                </p>

                <p className="mt-2">
                  {t.policy.cancellation.notice.text}
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
                  {t.policy.cancellation.lateNotice.title}
                </p>

                <p className="mt-2">
                  {t.policy.cancellation.lateNotice.text}
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
                  {t.policy.cancellation.noShow.title}
                </p>

                <p className="mt-2">
                  {t.policy.cancellation.noShow.text}
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
            {t.policy.cancellation.note}
          </p>
        </div>
      ),
    },

    {
      id: "unexpected",
      number: "02",
      title: t.policy.unexpected.title,
      icon: (
        <Zap
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>{t.policy.unexpected.intro}</p>

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

            <p>{t.policy.unexpected.text}</p>
          </div>

          <p className="italic">
            {t.policy.unexpected.action}
          </p>

          <p>
            {t.policy.unexpected.resolution}
          </p>

          <p>{t.policy.unexpected.teacher}</p>
        </div>
      ),
    },

    {
      id: "late-arrivals",
      number: "03",
      title: t.policy.lateArrivals.title,
      icon: (
        <Clock3
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>{t.policy.lateArrivals.intro}</p>

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
              {t.policy.lateArrivals.rule}
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
              {t.policy.lateArrivals.example}
            </p>
          </div>

          <p>
            {t.policy.lateArrivals.noContact}
          </p>
        </div>
      ),
    },

    {
      id: "teacher-cancellations",
      number: "04",
      title: t.policy.teacherCancellations.title,
      icon: (
        <HeartHandshake
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {t.policy.teacherCancellations.intro}
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
              {t.policy.teacherCancellations.text}
            </p>
          </div>

          <p className="italic">
            {t.policy.teacherCancellations.resolution}
          </p>
        </div>
      ),
    },

    {
      id: "repeated-cancellations",
      number: "05",
      title: t.policy.repeatedCancellations.title,
      icon: (
        <RefreshCw
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>
            {t.policy.repeatedCancellations.intro}
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
              {t.policy.repeatedCancellations.rule}
            </p>
          </div>

          <p>
            {t.policy.repeatedCancellations.text}
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
            {t.policy.repeatedCancellations.note}
          </p>
        </div>
      ),
    },

    {
      id: "tuition",
      number: "06",
      title: tuition.title,
      icon: (
        <WalletCards
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>{tuition.intro}</p>

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

            <p>{tuition.rule}</p>
          </div>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              text-[#607568]
            "
          >
            {tuition.notice}
          </p>
        </div>
      ),
    },

    {
      id: "refunds",
      number: "07",
      title: t.policy.refunds.title,
      icon: (
        <WalletCards
          size={21}
          strokeWidth={1.5}
        />
      ),

      content: (
        <div className="space-y-7">
          <p>{t.policy.refunds.intro}</p>

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

            <p>{t.policy.refunds.rule}</p>
          </div>

          <p>{t.policy.refunds.transfer}</p>

          <p>{t.policy.refunds.exception}</p>

          <p
            className="
              border-l-2
              border-[#718A73]
              pl-5
              italic
              text-[#607568]
            "
          >
            {t.policy.refunds.note}
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
              Hamkke Policy
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
              {t.policy.title}
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
              {t.policy.intro}
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
              Quick guide
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
                    2+ hours before class
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
                    Reschedule or receive lesson credit.
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
                    Less than 2 hours
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
                    The lesson is counted as completed.
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
                    No-show
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
                    The lesson is counted as completed.
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
              Please see the detailed policy below for exceptions
              and unexpected circumstances.
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
                Policy details
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
                Select a section to read the full guidelines.
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
                  A note from Hamkke
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
                  {t.policy.closing.title}
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
                    {t.policy.closing.text}
                  </p>

                  <p>
                    {t.policy.closing.textTwo}
                  </p>

                  <p
                    className="
                      pt-1
                      font-medium
                      text-[#718A73]
                    "
                  >
                    {t.policy.closing.thankYou}
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