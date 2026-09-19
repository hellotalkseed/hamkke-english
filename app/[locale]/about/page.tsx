import { notFound } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMessages } from "@/lib/getMessages";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type HighlightedTextProps = {
  text: string;
  highlights: string[];
  dark?: boolean;
};

function HighlightedText({
  text,
  highlights,
  dark = false,
}: HighlightedTextProps) {
  if (highlights.length === 0) {
    return <>{text}</>;
  }

  const validHighlights = highlights
    .filter(
      (highlight) =>
        highlight &&
        text.includes(highlight)
    )
    .sort(
      (a, b) =>
        text.indexOf(a) -
        text.indexOf(b)
    );

  if (validHighlights.length === 0) {
    return <>{text}</>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  validHighlights.forEach(
    (highlight, index) => {
      const start = text.indexOf(
        highlight,
        cursor
      );

      if (start === -1) {
        return;
      }

      if (start > cursor) {
        parts.push(
          text.slice(
            cursor,
            start
          )
        );
      }

      parts.push(
        <strong
          key={`${highlight}-${index}`}
          className={
            dark
              ? "font-semibold text-[#FFFDF8]"
              : "font-semibold text-[#304A39]"
          }
        >
          {highlight}
        </strong>
      );

      cursor =
        start +
        highlight.length;
    }
  );

  if (cursor < text.length) {
    parts.push(
      text.slice(cursor)
    );
  }

  return <>{parts}</>;
}

export default async function AboutPage({
  params,
}: AboutPageProps) {
  const { locale: localeParam } =
    await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale =
    localeParam as Locale;

  const messages =
    getMessages(locale);

  const content =
    messages.aboutPage;

  const beliefs = [
    content.beliefs.communication,
    content.beliefs.responsiveness,
    content.beliefs.independence,
  ];

  return (
    <>
      <Navbar />

      <main className="bg-[#FFFDF8] text-[#293A30]">
        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="bg-[#F3EDDD]">
          <div
            className="
              mx-auto
              max-w-[1440px]
              px-5
              pb-20
              pt-16

              sm:px-8
              sm:pb-24
              sm:pt-20

              lg:px-12
              lg:pb-28
              lg:pt-24
            "
          >
            <div className="max-w-[850px]">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]
                "
              >
                {content.hero.eyebrow}
              </p>

              <h1
                className="
                  mt-5
                  max-w-[800px]
                  font-serif
                  text-[44px]
                  leading-[0.98]
                  tracking-[-0.035em]
                  text-[#304A39]

                  sm:text-[58px]
                  lg:text-[68px]
                "
              >
                {content.hero.title}
              </h1>

              <p
                className="
                  mt-7
                  max-w-[650px]
                  text-[16px]
                  leading-7
                  text-[#536157]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                <HighlightedText
                  text={
                    content.hero.description
                      .text
                  }
                  highlights={
                    content.hero.description
                      .highlights
                  }
                />
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            THE NAME
            ===================================================== */}

        <section className="bg-[#FFFDF8]">
          <div
            className="
              mx-auto
              grid
              max-w-[1440px]
              gap-12
              px-5
              py-20

              sm:px-8
              sm:py-24

              lg:grid-cols-[0.7fr_1.3fr]
              lg:items-start
              lg:gap-24
              lg:px-12
              lg:py-28
            "
          >
            <div>
              <p
                className="
                  font-serif
                  text-[64px]
                  leading-none
                  tracking-[-0.04em]
                  text-[#718A73]

                  sm:text-[78px]
                "
              >
                {content.name.korean}
              </p>

              <p
                className="
                  mt-4
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#758477]
                "
              >
                {content.name.meaning}
              </p>
            </div>

            <div className="max-w-[680px]">
              <h2
                className="
                  font-serif
                  text-[34px]
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#304A39]

                  sm:text-[42px]
                "
              >
                {content.name.title}
              </h2>

              <div
                className="
                  mt-6
                  space-y-5
                  text-[15px]
                  leading-7
                  text-[#536157]

                  sm:text-[16px]
                  sm:leading-8
                "
              >
                {content.name.paragraphs.map(
                  (
                    paragraph,
                    index
                  ) => (
                    <p key={index}>
                      <HighlightedText
                        text={
                          paragraph.text
                        }
                        highlights={
                          paragraph.highlights
                        }
                      />
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY WE EXIST
            ===================================================== */}

        <section className="bg-[#EEF2EA]">
          <div
            className="
              mx-auto
              max-w-[1440px]
              px-5
              py-20

              sm:px-8
              sm:py-24

              lg:px-12
              lg:py-28
            "
          >
            <div
              className="
                grid
                gap-12

                lg:grid-cols-[0.9fr_1.1fr]
                lg:gap-24
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
                  "
                >
                  {content.purpose.eyebrow}
                </p>

                <h2
                  className="
                    mt-4
                    max-w-[500px]
                    font-serif
                    text-[36px]
                    leading-[1.08]
                    tracking-[-0.025em]
                    text-[#304A39]

                    sm:text-[46px]
                  "
                >
                  {content.purpose.title}
                </h2>
              </div>

              <div
                className="
                  max-w-[680px]
                  text-[15px]
                  leading-7
                  text-[#536157]

                  sm:text-[16px]
                  sm:leading-8
                "
              >
                {content.purpose.paragraphs.map(
                  (
                    paragraph,
                    index
                  ) => (
                    <p
                      key={index}
                      className={
                        index === 0
                          ? undefined
                          : "mt-5"
                      }
                    >
                      <HighlightedText
                        text={
                          paragraph.text
                        }
                        highlights={
                          paragraph.highlights
                        }
                      />
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            BELIEFS
            ===================================================== */}

        <section className="bg-[#FFFDF8]">
          <div
            className="
              mx-auto
              max-w-[1440px]
              px-5
              py-20

              sm:px-8
              sm:py-24

              lg:px-12
              lg:py-28
            "
          >
            <div
              className="
                grid
                gap-12

                lg:grid-cols-[0.8fr_1.2fr]
                lg:gap-24
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
                  "
                >
                  {content.beliefs.eyebrow}
                </p>

                <h2
                  className="
                    mt-4
                    max-w-[470px]
                    font-serif
                    text-[36px]
                    leading-[1.08]
                    tracking-[-0.025em]
                    text-[#304A39]

                    sm:text-[46px]
                  "
                >
                  {content.beliefs.title}
                </h2>
              </div>

              <div className="border-t border-[#304A39]/10">
                {beliefs.map(
                  (belief) => (
                    <div
                      key={belief.title}
                      className="
                        grid
                        gap-3
                        border-b
                        border-[#304A39]/10
                        py-7

                        sm:grid-cols-[180px_1fr]
                        sm:gap-8
                      "
                    >
                      <p
                        className="
                          font-serif
                          text-[21px]
                          leading-7
                          text-[#304A39]
                        "
                      >
                        {belief.title}
                      </p>

                      <p
                        className="
                          text-[14px]
                          leading-7
                          text-[#536157]
                        "
                      >
                        <HighlightedText
                          text={
                            belief.description
                              .text
                          }
                          highlights={
                            belief.description
                              .highlights
                          }
                        />
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SHARED STANDARD
            ===================================================== */}

        <section className="bg-[#F3EDDD]">
          <div
            className="
              mx-auto
              max-w-[1440px]
              px-5
              py-20

              sm:px-8
              sm:py-24

              lg:px-12
              lg:py-28
            "
          >
            <div
              className="
                grid
                gap-12

                lg:grid-cols-[1.05fr_0.95fr]
                lg:items-center
                lg:gap-24
              "
            >
              <div className="max-w-[650px]">
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#718A73]
                  "
                >
                  {
                    content.sharedStandard
                      .eyebrow
                  }
                </p>

                <h2
                  className="
                    mt-4
                    font-serif
                    text-[36px]
                    leading-[1.08]
                    tracking-[-0.025em]
                    text-[#304A39]

                    sm:text-[46px]
                  "
                >
                  {
                    content.sharedStandard
                      .title.lineOne
                  }
                  <br />

                  {
                    content.sharedStandard
                      .title.lineTwo
                  }
                  <br />

                  {
                    content.sharedStandard
                      .title.lineThree
                  }
                </h2>

                <p
                  className="
                    mt-6
                    max-w-[610px]
                    text-[15px]
                    leading-7
                    text-[#536157]

                    sm:text-[16px]
                    sm:leading-8
                  "
                >
                  <HighlightedText
                    text={
                      content.sharedStandard
                        .firstParagraph.text
                    }
                    highlights={
                      content.sharedStandard
                        .firstParagraph
                        .highlights
                    }
                  />
                </p>

                <p
                  className="
                    mt-4
                    max-w-[610px]
                    text-[15px]
                    leading-7
                    text-[#536157]

                    sm:text-[16px]
                    sm:leading-8
                  "
                >
                  <HighlightedText
                    text={
                      content.sharedStandard
                        .secondParagraph.text
                    }
                    highlights={
                      content.sharedStandard
                        .secondParagraph
                        .highlights
                    }
                  />
                </p>

                <div
                  className="
                    mt-8
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <Link
                    href={`/${locale}/how-it-works`}
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      bg-[#304A39]
                      px-5
                      py-2.5
                      text-[13px]
                      font-semibold
                      text-[#FFFDF8]
                      transition

                      hover:bg-[#3B5945]
                    "
                  >
                    {
                      content.sharedStandard
                        .approachButton
                    }
                  </Link>

                  <Link
                    href={`/${locale}/teachers`}
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-[#718A73]/40
                      px-5
                      py-2.5
                      text-[13px]
                      font-semibold
                      text-[#304A39]
                      transition

                      hover:bg-[#FFFDF8]
                    "
                  >
                    {
                      content.sharedStandard
                        .teachersButton
                    }
                  </Link>
                </div>
              </div>

              {/* Brand visual */}

              <div
                className="
                  flex
                  min-h-[320px]
                  items-center
                  justify-center
                  rounded-[32px]
                  border
                  border-[#718A73]/20
                  bg-[#FFFDF8]
                  px-8
                  py-12

                  sm:min-h-[380px]
                "
              >
                <div className="text-center">
                  <p
                    className="
                      font-serif
                      text-[76px]
                      leading-none
                      tracking-[-0.05em]
                      text-[#718A73]

                      sm:text-[96px]
                    "
                  >
                    {
                      content.sharedStandard
                        .visual.korean
                    }
                  </p>

                  <div
                    className="
                      mx-auto
                      mt-7
                      h-px
                      w-12
                      bg-[#718A73]/40
                    "
                  />

                  <p
                    className="
                      mt-6
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#758477]
                    "
                  >
                    {
                      content.sharedStandard
                        .visual.principles
                    }
                  </p>

                  <p
                    className="
                      mt-3
                      font-serif
                      text-[22px]
                      italic
                      text-[#304A39]
                    "
                  >
                    {
                      content.sharedStandard
                        .visual.together
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CLOSING
            ===================================================== */}

        <section className="bg-[#304A39]">
          <div
            className="
              mx-auto
              max-w-[1440px]
              px-5
              py-20

              sm:px-8
              sm:py-24

              lg:px-12
              lg:py-28
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#DCE4D7]
                "
              >
                {content.closing.eyebrow}
              </p>

              <h2
                className="
                  mt-5
                  font-serif
                  text-[38px]
                  leading-[1.05]
                  tracking-[-0.03em]
                  text-[#FFFDF8]

                  sm:text-[52px]

                  lg:whitespace-nowrap
                "
              >
                {content.closing.title}
              </h2>

              <p
                className="
                  mt-6
                  text-[15px]
                  leading-7
                  text-[#DCE4D7]

                  sm:text-[16px]
                  sm:leading-8

                  lg:whitespace-nowrap
                "
              >
                <HighlightedText
                  text={
                    content.closing
                      .firstParagraph.text
                  }
                  highlights={
                    content.closing
                      .firstParagraph
                      .highlights
                  }
                  dark
                />
              </p>

              <p
                className="
                  mt-3
                  max-w-[760px]
                  text-[15px]
                  leading-7
                  text-[#DCE4D7]/80

                  sm:text-[16px]
                  sm:leading-8
                "
              >
                <HighlightedText
                  text={
                    content.closing
                      .secondParagraph.text
                  }
                  highlights={
                    content.closing
                      .secondParagraph
                      .highlights
                  }
                  dark
                />
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}