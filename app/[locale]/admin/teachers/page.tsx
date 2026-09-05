import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
} from "lucide-react";

import TeachersManagement from "./TeachersManagement";
import { createClient } from "@/lib/supabase/server";

interface TeachersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function TeachersPage({
  params,
}: TeachersPageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  /* ----------------------------------------------------------------------- */
  /* AUTHENTICATION + ROLE                                                   */
  /* ----------------------------------------------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
        <section className="mx-auto flex min-h-screen max-w-[1040px] items-center justify-center px-6">
          <div className="text-center">
            <h1 className="font-serif text-[32px] font-normal">
              Access unavailable
            </h1>

            <p className="mt-4 font-serif text-[17px] leading-7 text-[#74716B]">
              Please sign in to continue.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user.id)
    .maybeSingle();

  /* ----------------------------------------------------------------------- */
  /* OWNER                                                                    */
  /* ----------------------------------------------------------------------- */

  if (
    profile?.role === "owner" &&
    profile?.status === "active"
  ) {
    return <TeachersManagement locale={locale} />;
  }

  /* ----------------------------------------------------------------------- */
  /* TEACHER                                                                  */
  /* ----------------------------------------------------------------------- */

  if (
    profile?.role === "teacher" &&
    profile?.status === "active"
  ) {
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
          <div className="flex w-full items-start justify-between gap-8">

            {/* Back to Hamkke */}

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

            {/* Hamkke Brand */}

            <Link
              href={`/${locale}`}
              className="
                shrink-0
                text-right
                transition-opacity
                duration-200
                hover:opacity-70
              "
            >
              <p
                className="
                  font-sans
                  text-[16px]
                  font-semibold
                  leading-none
                  tracking-[0.18em]
                  text-[#6F8F72]
                "
              >
                HAMKKE │ 함께
              </p>

              <p
                className="
                  mt-2
                  font-serif
                  text-[13px]
                  font-normal
                  leading-none
                  tracking-[0.02em]
                  text-[#6F8F72]
                "
              >
                From Small Talk to Big Ideas
              </p>
            </Link>

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
          <p
            className="
              text-center
              font-sans
              text-[13px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Teacher
          </p>

          <h1
            className="
              mt-4
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
            Teacher Dashboard
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
            Your students, lessons, and teaching information in one place.
          </p>
        </section>

        {/* TEACHER OPTIONS */}

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

          {/* MY LESSONS */}

          <Link
            href={`/${locale}/admin/teachers/lessons`}
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
                    My Lessons
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
                    View your assigned students, lessons,
                    schedules, and attendance.
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
                  <BookOpen
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

              </div>

            </div>
          </Link>

          {/* SET AVAILABILITY */}

          <Link
            href={`/${locale}/admin/teachers/availability`}
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
                    Set Availability
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
                    Set the days and times when you are
                    available for teaching.
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
                  <CalendarDays
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

              </div>

            </div>
          </Link>

          {/* PAYROLL */}

          <div
            className="
              border-y
              border-[#DCD8D2]
              py-10
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
                03
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
                    Payroll
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
                    Your teaching records and payroll
                    information will appear here.
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
                  "
                >
                  <LayoutDashboard
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

              </div>

            </div>
          </div>

        </section>
      </main>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* UNKNOWN / INACTIVE ROLE                                                 */
  /* ----------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <section className="mx-auto flex min-h-screen max-w-[1040px] items-center justify-center px-6">
        <div className="text-center">
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Hamkke
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[34px]
              font-normal
            "
          >
            Access unavailable
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-[460px]
              font-serif
              text-[17px]
              leading-7
              text-[#74716B]
            "
          >
            Your account does not currently have access
            to this area.
          </p>

          <Link
            href={`/${locale}/admin`}
            className="
              mt-7
              inline-block
              font-sans
              text-[13px]
              text-[#6F8F72]
              underline
              underline-offset-4
              transition-colors
              hover:text-[#526B55]
            "
          >
            Back to Administration
          </Link>
        </div>
      </section>
    </main>
  );
}