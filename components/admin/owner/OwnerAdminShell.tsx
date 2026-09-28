"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  HeartHandshake,
  LayoutDashboard,
  Plus,
  Search,
  UserRoundCog,
  Users,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type StudentNavItem = {
  id: string;
  name: string;
  number: string | null;
};

type TeacherNavItem = {
  id: string;
  name: string;
  number: string | null;
};

type NavigationResponse = {
  students?: StudentNavItem[];
  teachers?: TeacherNavItem[];
  error?: string;
};

const NAV_ITEMS = [
  { key: "overview", label: "Overview", path: "overview", icon: LayoutDashboard },
  { key: "daily-schedule", label: "Daily Schedule", path: "daily-schedule", icon: CalendarDays },
  { key: "assessments", label: "Assessments", path: "assessments", icon: ClipboardCheck },
  { key: "students", label: "Students", path: "students", icon: Users },
  { key: "teachers", label: "Teachers", path: "teachers", icon: UserRoundCog },
  { key: "reflections", label: "Reflections", path: "reflections", icon: HeartHandshake },
] as const;

export default function OwnerAdminShell({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [students, setStudents] = useState<StudentNavItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherNavItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const overviewOpen =
    pathname === `/${locale}/admin/overview` ||
    pathname.startsWith(`/${locale}/admin/overview/`) ||
    pathname === `/${locale}/admin/income` ||
    pathname.startsWith(`/${locale}/admin/income/`);

  const studentsOpen =
    pathname === `/${locale}/admin/students` ||
    pathname.startsWith(`/${locale}/admin/students/`);

  const teachersOpen =
    pathname === `/${locale}/admin/teachers` ||
    pathname.startsWith(`/${locale}/admin/teachers/`);

  const collectionOpen = overviewOpen || studentsOpen || teachersOpen;

  useEffect(() => {
    let cancelled = false;

    async function loadNavigation() {
      try {
        const response = await fetch("/api/admin/owner-navigation", {
          cache: "no-store",
        });
        const data = (await response.json()) as NavigationResponse;

        if (!response.ok) {
          throw new Error(data.error || "Unable to load admin navigation.");
        }

        if (!cancelled) {
          setStudents(data.students || []);
          setTeachers(data.teachers || []);
        }
      } catch (error) {
        console.error("Owner navigation error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNavigation();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearch("");
  }, [studentsOpen, teachersOpen]);

  const records = studentsOpen ? students : teachers;
  const sectionLabel = studentsOpen ? "Students" : "Teachers";

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter(
      (record) =>
        record.name.toLowerCase().includes(query) ||
        (record.number || "").toLowerCase().includes(query)
    );
  }, [records, search]);

  function isNavActive(path: string) {
    const href = `/${locale}/admin/${path}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isRecordActive(type: "students" | "teachers", id: string) {
    return pathname === `/${locale}/admin/${type}/${id}` ||
      pathname.startsWith(`/${locale}/admin/${type}/${id}/`);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <aside className="group/adminrail fixed inset-y-0 left-0 z-50 w-[64px] overflow-hidden border-r border-[#E4DDD4] bg-[#F4F1EC] shadow-[4px_0_18px_rgba(41,41,41,0)] transition-[width,box-shadow] duration-200 ease-out hover:w-[228px] hover:shadow-[4px_0_18px_rgba(41,41,41,0.08)]">
        <div className="flex h-full w-[228px] flex-col">
          <Link
            href={`/${locale}/admin`}
            className="mx-2 mt-4 flex min-h-[54px] items-center rounded-xl px-2 text-[#292929] transition hover:bg-[#EBE7E1]"
            aria-label="Hamkke Home"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <img
                src="/logo/hamkke-icon.svg"
                alt=""
                className="h-9 w-9 object-contain"
              />
            </span>

            <span className="ml-3 min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/adminrail:opacity-100">
              <span className="block font-serif text-[16px] font-semibold leading-[1.15] tracking-[-0.01em] text-[#292929]">
                Hamkke │ 함께
              </span>
              <span className="mt-1 block text-[9.5px] font-normal tracking-[0.01em] text-[#7D786F]">
                From Small Talk to Big Ideas.
              </span>
            </span>
          </Link>

          <nav className="mt-[116px] flex w-full flex-1 flex-col gap-1.5 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
          item.key === "overview"
            ? overviewOpen
            : isNavActive(item.path);

              return (
                <Link
                  key={item.key}
                  href={`/${locale}/admin/${item.path}`}
                  aria-label={item.label}
                  className={`flex h-11 w-full items-center rounded-xl px-3 transition ${
                    active
                      ? "bg-[#E2EBDD] text-[#49614D]"
                      : "text-[#77736B] hover:bg-[#EBE7E1] hover:text-[#49614D]"
                  }`}
                >
                  <span className="flex w-7 shrink-0 items-center justify-center">
                    <Icon size={19} strokeWidth={1.65} />
                  </span>
                  <span className="ml-3 whitespace-nowrap text-[13px] font-medium opacity-0 transition-opacity duration-150 group-hover/adminrail:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-2 mb-4 flex h-10 items-center rounded-xl px-3 text-[#55705A]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDE7D9] text-[11px] font-semibold">
              JA
            </span>
            <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 transition-opacity duration-150 group-hover/adminrail:opacity-100">
              Jesica · Owner
            </span>
          </div>
        </div>
      </aside>

      {overviewOpen && (
        <aside className="fixed inset-y-0 left-[64px] z-40 hidden w-[190px] border-r border-[#E4DDD4] bg-[#FAF8F5] md:flex md:flex-col print:hidden">
          <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-[186px]">
            <Link
              href={`/${locale}/admin/overview`}
              className={`mb-1 flex min-h-10 items-center rounded-lg border-l-2 px-3 py-2 text-[12px] font-medium transition ${
                pathname === `/${locale}/admin/overview`
                  ? "border-[#6F8F72] bg-[#E8EFE4] text-[#334B37]"
                  : "border-transparent text-[#494642] hover:bg-[#F0ECE6]"
              }`}
            >
              Overview
            </Link>

            <Link
              href={`/${locale}/admin/income`}
              className={`mb-1 flex min-h-10 items-center rounded-lg border-l-2 px-3 py-2 text-[12px] font-medium transition ${
                pathname === `/${locale}/admin/income` ||
                pathname.startsWith(`/${locale}/admin/income/`)
                  ? "border-[#6F8F72] bg-[#E8EFE4] text-[#334B37]"
                  : "border-transparent text-[#494642] hover:bg-[#F0ECE6]"
              }`}
            >
              Monthly Income
            </Link>
          </nav>
        </aside>
      )}

      {(studentsOpen || teachersOpen) && (
        <aside className="fixed inset-y-0 left-[64px] z-40 hidden w-[286px] border-r border-[#E4DDD4] bg-[#FAF8F5] md:flex md:flex-col print:hidden">
          <div className="border-b border-[#E7E0D8] px-5 pb-4 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A857E]">
                  Administration
                </p>
                <h2 className="mt-1 font-serif text-[24px] text-[#292929]">
                  {sectionLabel}
                </h2>
              </div>

              <Link
                href={
                  studentsOpen
                    ? `/${locale}/admin/students/new`
                    : `/${locale}/admin/teachers/invite`
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D9D1C7] bg-white text-[#5F7F63] transition hover:border-[#AFC2AC] hover:bg-[#F1F5EF]"
                aria-label={studentsOpen ? "Add student" : "Add teacher"}
              >
                <Plus size={17} strokeWidth={1.8} />
              </Link>
            </div>

            <div className="relative mt-4">
              <Search
                size={15}
                strokeWidth={1.6}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#99938B]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${sectionLabel.toLowerCase()}...`}
                className="h-10 w-full rounded-xl border border-[#DED7CE] bg-white pl-9 pr-3 text-[12px] text-[#333] outline-none transition placeholder:text-[#AAA49C] focus:border-[#9DB39C]"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A857E]">
                All {sectionLabel}
              </span>
              <span className="text-[10px] text-[#A19B94]">
                {records.length}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-5">
              {loading ? (
                <p className="px-3 py-4 text-[12px] text-[#99938B]">
                  Loading...
                </p>
              ) : filteredRecords.length === 0 ? (
                <p className="px-3 py-4 text-[12px] text-[#99938B]">
                  No {sectionLabel.toLowerCase()} found.
                </p>
              ) : (
                filteredRecords.map((record) => {
                  const type = studentsOpen ? "students" : "teachers";
                  const active = isRecordActive(type, record.id);

                  return (
                    <Link
                      key={record.id}
                      href={`/${locale}/admin/${type}/${record.id}`}
                      className={`mb-0.5 flex min-h-10 items-center justify-between gap-3 rounded-lg border-l-2 px-3 py-2 text-[12px] transition ${
                        active
                          ? "border-[#6F8F72] bg-[#E8EFE4] text-[#334B37]"
                          : "border-transparent text-[#494642] hover:bg-[#F0ECE6]"
                      }`}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {record.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-normal tracking-[0.01em] text-[#A09A92]">
                        {record.number || "—"}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      )}

      <div
        className={`min-h-screen transition-[margin] ${
          overviewOpen
      ? "ml-[64px] md:ml-[254px]"
      : collectionOpen
        ? "ml-[64px] md:ml-[350px]"
        : "ml-[64px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
