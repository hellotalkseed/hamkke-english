import Link from "next/link";
import {
  HeartHandshake,
  LayoutDashboard,
  UserRound,
  Users,
} from "lucide-react";

interface OwnerDashboardProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function OwnerDashboard({
  params,
}: OwnerDashboardProps) {
  const { locale } = await params;

  const items = [
    {
      number: "01",
      title: "Overview",
      description:
        "View your teaching activity and the current state of Hamkke English.",
      href: `/${locale}/admin/overview`,
      icon: LayoutDashboard,
    },
    {
      number: "02",
      title: "Students",
      description:
        "Manage student records, enrollments, lessons, and payments.",
      href: `/${locale}/admin/students`,
      icon: Users,
    },
    {
      number: "03",
      title: "Teachers",
      description:
        "Manage teachers and their teaching information.",
      href: `/${locale}/admin/teachers`,
      icon: UserRound,
    },
    {
      number: "04",
      title: "Reflections",
      description:
        "View and manage student reflections and stories.",
      href: `/${locale}/admin/reflections`,
      icon: HeartHandshake,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}

      <header className="border-b border-[#E7DDD1]">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-5">
          <Link
            href={`/${locale}`}
            className="
              font-sans
              text-[13px]
              font-medium
              tracking-[0.02em]
              text-[#6F8F72]
              transition
              hover:opacity-70
            "
          >
            ← Back to Hamkke
          </Link>

          <p
            className="
              font-sans
              text-[13px]
              font-medium
              tracking-[0.02em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1040px] px-6 py-20 sm:py-24">
        <div className="max-w-[700px]">
          <p
            className="
              font-sans
              text-[12px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-[#6F8F72]
            "
          >
            Administration
          </p>

          <h1
            className="
              mt-5
              font-serif
              text-[48px]
              font-normal
              leading-[1.05]
              tracking-[-0.035em]
              sm:text-[60px]
            "
          >
            Owner Dashboard
          </h1>

          <p
            className="
              mt-6
              max-w-[600px]
              font-serif
              text-[19px]
              leading-8
              text-[#666]
            "
          >
            Manage your students, teachers, and student stories
            in one place.
          </p>
        </div>

        {/* OWNER OPTIONS */}

        <div className="mt-16">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.number}
                href={item.href}
                className="
                  block
                  border-t
                  border-[#E7DDD1]
                  transition
                  hover:bg-[#F0F4ED]
                  last:border-b
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-5
                    py-7
                    sm:gap-7
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
                    "
                  >
                    <Icon size={20} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-4">
                      <span
                        className="
                          font-sans
                          text-[11px]
                          font-medium
                          tracking-[0.14em]
                          text-[#A49A8D]
                        "
                      >
                        {item.number}
                      </span>

                      <h2
                        className="
                          font-serif
                          text-[25px]
                          font-normal
                          tracking-[-0.02em]
                        "
                      >
                        {item.title}
                      </h2>
                    </div>

                    <p
                      className="
                        mt-2
                        max-w-[600px]
                        font-sans
                        text-[14px]
                        leading-6
                        text-[#777]
                      "
                    >
                      {item.description}
                    </p>
                  </div>

                  <span
                    className="
                      hidden
                      font-sans
                      text-[20px]
                      text-[#6F8F72]
                      sm:block
                    "
                  >
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}