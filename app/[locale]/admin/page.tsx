import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  ClipboardCheck,
  CreditCard,
  BookOpen,
} from "lucide-react";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface AdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminPage({
  params,
}: AdminPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-6
        py-12
        text-[#292929]

        sm:px-8
        sm:py-16

        lg:px-10
        lg:py-20
      "
    >
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-8

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[14px]
                font-medium
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              Hamkke │ 함께
            </p>

            <h1
              className="
                mt-5
                font-serif
                text-[48px]
                font-normal
                leading-tight
                tracking-[-0.03em]

                sm:text-[56px]
              "
            >
              Admin
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                font-serif
                text-[20px]
                leading-8
                text-[#666]

                sm:text-[22px]
              "
            >
              Manage students, lessons, payments, and
              enrollment from one place.
            </p>
          </div>

          {/* NEW ENROLLMENT */}

          <Link
            href={`/${currentLocale}/admin/students/new`}
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#6F8F72]
              px-7
              py-3.5
              font-sans
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#5F7F63]
            "
          >
            + New Enrollment
          </Link>
        </div>

        {/* DASHBOARD */}

        <div
          className="
            mt-12
            grid
            gap-5

            sm:grid-cols-2

            lg:grid-cols-4
          "
        >
          <DashboardCard
            href={`/${currentLocale}/admin/students`}
            icon={<Users size={21} strokeWidth={1.5} />}
            title="Students"
            description="View and manage your students."
          />

          <DashboardCard
            href={`/${currentLocale}/admin/enrollments`}
            icon={
              <ClipboardCheck
                size={21}
                strokeWidth={1.5}
              />
            }
            title="Enrollments"
            description="Manage new and active enrollments."
          />

          <DashboardCard
            href={`/${currentLocale}/admin/payments`}
            icon={
              <CreditCard
                size={21}
                strokeWidth={1.5}
              />
            }
            title="Payments"
            description="Track tuition and payment status."
          />

          <DashboardCard
            href={`/${currentLocale}/admin/lessons`}
            icon={
              <BookOpen
                size={21}
                strokeWidth={1.5}
              />
            }
            title="Lessons"
            description="Track lessons and attendance."
          />
        </div>

        {/* EXISTING REFLECTIONS */}

        <div
          className="
            mt-12
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >
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
            Existing Admin
          </p>

          <h2
            className="
              mt-3
              font-serif
              text-[30px]
              font-normal
            "
          >
            Reflections
          </h2>

          <p
            className="
              mt-3
              max-w-2xl
              font-sans
              text-[15px]
              leading-7
              text-[#666]
            "
          >
            Review student reflections before they
            appear publicly on the Hamkke website.
          </p>

          <Link
            href={`/${currentLocale}/admin/reflections`}
            className="
              mt-6
              inline-flex
              rounded-full
              bg-[#6F8F72]
              px-6
              py-3
              font-sans
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#5F7F63]
            "
          >
            Open Reflections
          </Link>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-3xl
        border
        border-[#E7DDD1]
        bg-white
        p-7
        transition
        hover:-translate-y-0.5
        hover:border-[#CFC2B3]
        hover:shadow-sm
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          bg-[#E2EBDD]
          text-[#6F8F72]
          transition
          group-hover:bg-[#D9E5D6]
        "
      >
        {icon}
      </div>

      <h2
        className="
          mt-6
          font-serif
          text-[28px]
          font-normal
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          font-sans
          text-[14px]
          leading-6
          text-[#666]
        "
      >
        {description}
      </p>

      <span
        className="
          mt-5
          inline-block
          font-sans
          text-[12px]
          font-medium
          text-[#6F8F72]
          opacity-0
          transition
          group-hover:opacity-100
        "
      >
        Open →
      </span>
    </Link>
  );
}