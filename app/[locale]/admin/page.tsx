import Link from "next/link";
import { Users, HeartHandshake } from "lucide-react";

interface AdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminPage({
  params,
}: AdminPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}
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
        <div className="relative flex w-full items-center justify-between">
          <Link
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
            &larr; Hamkke
          </Link>

          <div
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              whitespace-nowrap
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
        </div>
      </header>

      {/* INTRO */}
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
          Administration
        </h1>

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
          Manage your students and student stories
          in one place.
        </p>
      </section>

      {/* ADMIN OPTIONS */}
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
        {/* STUDENTS */}
        <Link
          href={`/${locale}/admin/students`}
          className="
            group
            block
            border-t
            border-[#DCD8D2]
            py-10
            transition-colors
            hover:bg-[#F0F4ED]
          "
        >
          <div className="flex gap-6">
            <span
              className="
                pt-1
                font-sans
                text-[11px]
                font-medium
                tracking-[0.14em]
                text-[#8A8A84]
              "
            >
              01
            </span>

            <div
              className="
                flex
                min-w-0
                flex-1
                items-start
                justify-between
                gap-6
              "
            >
              <div>
                <h2
                  className="
                    font-serif
                    text-[34px]
                    font-normal
                    leading-tight
                    tracking-[-0.02em]
                  "
                >
                  Students
                </h2>

                <p
                  className="
                    mt-3
                    max-w-xl
                    font-serif
                    text-[17px]
                    leading-7
                    text-[#6B6B66]
                  "
                >
                  Manage student records, enrollments,
                  lessons, attendance, contracts,
                  and payments.
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#6F8F72]
                  transition-transform
                  group-hover:translate-x-1
                "
              >
                <Users
                  size={19}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </Link>

        {/* REFLECTIONS */}
        <Link
          href={`/${locale}/admin/reflections`}
          className="
            group
            block
            border-y
            border-[#DCD8D2]
            py-10
            transition-colors
            hover:bg-[#F0F4ED]
          "
        >
          <div className="flex gap-6">
            <span
              className="
                pt-1
                font-sans
                text-[11px]
                font-medium
                tracking-[0.14em]
                text-[#8A8A84]
              "
            >
              02
            </span>

            <div
              className="
                flex
                min-w-0
                flex-1
                items-start
                justify-between
                gap-6
              "
            >
              <div>
                <h2
                  className="
                    font-serif
                    text-[34px]
                    font-normal
                    leading-tight
                    tracking-[-0.02em]
                  "
                >
                  Reflections
                </h2>

                <p
                  className="
                    mt-3
                    max-w-xl
                    font-serif
                    text-[17px]
                    leading-7
                    text-[#6B6B66]
                  "
                >
                  Review and approve student stories
                  before they appear on the website.
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#6F8F72]
                  transition-transform
                  group-hover:translate-x-1
                "
              >
                <HeartHandshake
                  size={19}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
