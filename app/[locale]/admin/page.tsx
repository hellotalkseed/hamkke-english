import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  HeartHandshake,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

interface AdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminPage({
  params,
}: AdminPageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  /*
   * --------------------------------
   * TEACHER ROUTING
   * --------------------------------
   *
   * Pending teachers must complete their
   * Teacher Agreement before receiving
   * access to the Teacher Dashboard.
   */

  if (
    profile?.role === "teacher" &&
    profile?.status === "pending"
  ) {
    redirect(`/${locale}/admin/teachers/agreement`);
  }

  if (
    profile?.role === "teacher" &&
    profile?.status === "active"
  ) {
    redirect(`/${locale}/admin/teachers`);
  }

  /*
   * --------------------------------
   * OWNER DASHBOARD
   * --------------------------------
   */

  if (
    profile?.role === "owner" &&
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
          <div
            className="
              flex
              w-full
              items-start
              justify-between
              gap-8
            "
          >
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

            <div className="shrink-0 text-right">
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
            Manage your students, teachers, and student
            stories in one place.
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
          {/* OVERVIEW */}

          <Link
            href={`/${locale}/admin/overview`}
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
                    Overview
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
                    Get a quick look at your students,
                    active enrollments, and income.
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
                  <LayoutDashboard
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </Link>

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

          {/* TEACHERS */}

          <Link
            href={`/${locale}/admin/teachers`}
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
                    Teachers
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
                    Manage teachers, assign students,
                    and view teaching information and payroll.
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
                  <UserRound
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
                04
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

  /*
   * --------------------------------
   * UNKNOWN / INACTIVE ROLE
   * --------------------------------
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6">
      <div className="max-w-md text-center">
        <div>
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
              text-[#6F8F72]
            "
          >
            From Small Talk to Big Ideas
          </p>
        </div>

        <h1
          className="
            mt-7
            font-serif
            text-[42px]
            font-normal
            tracking-[-0.03em]
          "
        >
          Access unavailable
        </h1>

        <p
          className="
            mt-5
            font-serif
            text-[18px]
            leading-7
            text-[#666]
          "
        >
          Your account does not currently have
          permission to access this area.
        </p>

        <Link
          href={`/${locale}/admin/login`}
          className="
            mt-8
            inline-flex
            rounded-full
            bg-[#6F8F72]
            px-6
            py-3
            font-sans
            text-[15px]
            font-medium
            text-white
            transition
            hover:bg-[#5F7F63]
          "
        >
          Return to sign in
        </Link>
      </div>
    </main>
  );
}
