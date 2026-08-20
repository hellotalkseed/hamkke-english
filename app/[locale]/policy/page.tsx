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

import PolicyAccordion from "../../../components/PolicyAccordion";
import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface PolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PolicyPage({
  params,
}: PolicyPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);

  const sections = [
    {
      id: "cancellation",
      number: "01",
      title: t.policy.cancellation.title,
      icon: (
        <CalendarDays
          size={22}
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
                  text-[#6F8F72]
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
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
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
                  text-[#6F8F72]
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
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
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
                  text-[#6F8F72]
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
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
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
              border-[#6F8F72]
              pl-5
              italic
              text-[#6F8F72]
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
          size={22}
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
              bg-[#F0F4ED]
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
                bg-[#E2EBDD]
                text-[#6F8F72]
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

          <p>{t.policy.unexpected.resolution}</p>

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
          size={22}
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
              bg-[#F0F4ED]
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
                bg-[#E2EBDD]
                text-[#6F8F72]
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
                text-[#6F8F72]
              "
            >
              <CircleAlert
                size={16}
                strokeWidth={1.6}
              />
            </div>

            <p>{t.policy.lateArrivals.example}</p>
          </div>

          <p>{t.policy.lateArrivals.noContact}</p>
        </div>
      ),
    },

    {
      id: "teacher-cancellations",
      number: "04",
      title: t.policy.teacherCancellations.title,
      icon: (
        <HeartHandshake
          size={22}
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
              bg-[#F0F4ED]
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
                bg-[#E2EBDD]
                text-[#6F8F72]
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
          size={22}
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
              bg-[#F0F4ED]
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
                bg-[#E2EBDD]
                text-[#6F8F72]
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
              border-[#6F8F72]
              pl-5
              italic
              text-[#6F8F72]
            "
          >
            {t.policy.repeatedCancellations.note}
          </p>
        </div>
      ),
    },

    {
      id: "refunds",
      number: "06",
      title: t.policy.refunds.title,
      icon: (
        <WalletCards
          size={22}
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
              bg-[#F0F4ED]
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
                bg-[#E2EBDD]
                text-[#6F8F72]
              "
            >
              <WalletCards
                size={17}
                strokeWidth={1.6}
              />
            </div>

            <p>
              {t.policy.refunds.rule}
            </p>
          </div>

          <p>
            {t.policy.refunds.transfer}
          </p>

          <p>
            {t.policy.refunds.exception}
          </p>

          <p
            className="
              border-l-2
              border-[#6F8F72]
              pl-5
              italic
              text-[#6F8F72]
            "
          >
            {t.policy.refunds.note}
          </p>
        </div>
      ),
    },
  ];

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="
          w-full
          px-6
          pt-7

          sm:px-8
          sm:pt-8

          lg:px-10

          xl:px-12
        "
      >
        <div
          className="
            relative
            flex
            w-full
            items-center
            justify-between
          "
        >
          {/* HAMKKE */}

          <a
            href={`/${locale}`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]

              sm:text-[16px]
            "
          >
            ← Hamkke
          </a>

          {/* DESKTOP BRAND */}

          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              whitespace-nowrap

              hidden

              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]

              sm:block
              sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>

          {/* LANGUAGE */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3

              font-sans
              text-[14px]
              text-[#5F655F]

              sm:gap-4
              sm:text-[15px]
            "
          >
            <a
              href="/en/policy"
              className={
                locale === "en"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </a>

            <a
              href="/ko/policy"
              className={
                locale === "ko"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </a>

            <a
              href="/zh/policy"
              className={
                locale === "zh"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              中文
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          INTRO
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-12
          pt-10

          sm:px-8
          sm:pb-14
          sm:pt-20

          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        {/* MOBILE BRAND EYEBROW */}

        <div
          className="
            mb-0
            text-center

            font-sans
            text-[14px]
            font-medium
            tracking-[0.02em]
            text-[#6F8F72]

            sm:hidden
          "
        >
          Hamkke │ 함께
        </div>

        {/* PAGE TITLE */}

        <h1
          className="
            text-center

            font-serif
            text-[52px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]

            text-[#292929]

            sm:text-[62px]

            lg:text-[70px]
          "
        >
          {t.policy.title}
        </h1>

        {/* INTRO */}

        <p
          className="
            mx-auto
            mt-8
            max-w-[850px]

            text-center

            font-serif
            text-[21px]
            font-normal
            leading-8

            text-[#4A4A4A]

            sm:text-[23px]
            sm:leading-9

            lg:text-[25px]
            lg:leading-10
          "
        >
          {t.policy.intro}
        </p>
      </section>

      {/* =====================================================
          ACCORDION + FINAL NOTE
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-20

          sm:px-8

          lg:px-10
          lg:pb-24
        "
      >
        <PolicyAccordion sections={sections} />

        {/* ===================================================
            FINAL NOTE
            =================================================== */}

        <div
          className="
            mt-20
            w-full

            sm:mt-24

            lg:mt-28
          "
        >
          {/* ICON + HEADING */}

          <div
            className="
              flex
              items-center
              gap-5

              sm:gap-6
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#E2EBDD]
                text-[#6F8F72]

                sm:h-14
                sm:w-14
              "
              aria-hidden="true"
            >
              <HeartHandshake
                size={21}
                strokeWidth={1.5}
              />
            </div>

            <h2
              className="
                font-serif
                text-[38px]
                font-normal
                leading-tight
                tracking-[-0.02em]

                text-[#292929]

                sm:text-[44px]

                lg:text-[50px]
              "
            >
              {t.policy.closing.title}
            </h2>
          </div>

          {/* BODY TEXT */}

          <div
            className="
              mt-8
              w-full

              font-serif
              text-[21px]
              font-normal
              leading-8

              text-[#4A4A4A]

              sm:mt-9
              sm:text-[23px]
              sm:leading-9

              lg:text-[25px]
              lg:leading-10
            "
          >
            <p>
              {t.policy.closing.text}
            </p>

            <p className="mt-5">
              {t.policy.closing.textTwo}
            </p>

            <p
              className="
                mt-8
                italic
                text-[#6F8F72]
              "
            >
              {t.policy.closing.thankYou}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}