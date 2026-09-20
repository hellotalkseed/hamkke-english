import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AssessmentsTable, {
  type AssessmentTableRow,
} from "@/components/admin/AssessmentsTable";

interface AssessmentsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

type AssessmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";
type FollowUpStatus =
  | "awaiting_follow_up"
  | "contacted"
  | "interested"
  | "not_proceeding"
  | "converted";

interface AssessmentRow {
  id: string;
  teacher_id: string;
  learner_type: "self" | "child";
  learner_name: string;
  preferred_name: string | null;
  learner_age: number | null;
  contact_name: string;
  email: string;
  english_level: string;
  learning_goal: string;
  notes: string | null;
  teacher_observation: string | null;
  assessment_format: "audio" | "video";
  preferred_platform: string;
  timezone: string;
  assessment_date: string;
  assessment_time: string;
  status: AssessmentStatus;
  follow_up_status: FollowUpStatus | null;
  converted_student_id: string | null;
  converted_at: string | null;
  created_at: string;
}

interface TeacherRow {
  id: string;
  full_name: string | null;
}

export default async function AssessmentsPage({
  params,
  searchParams,
}: AssessmentsPageProps) {
  const { locale } = await params;
  const filters = await searchParams;

  const requestedStatus = filters.status?.trim() ?? "";
  const validStatuses: AssessmentStatus[] = [
    "confirmed",
    "completed",
    "no_show",
    "cancelled",
  ];

  const statusFilter = validStatuses.includes(
    requestedStatus as AssessmentStatus
  )
    ? (requestedStatus as AssessmentStatus)
    : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.status !== "active" ||
    !["owner", "admin"].includes(profile.role)
  ) {
    redirect(`/${locale}/admin`);
  }

  const { data: assessments, error: assessmentsError } = await admin
    .from("assessment_bookings")
    .select(`
      id,
      teacher_id,
      learner_type,
      learner_name,
      preferred_name,
      learner_age,
      contact_name,
      email,
      english_level,
      learning_goal,
      notes,
      teacher_observation,
      assessment_format,
      preferred_platform,
      timezone,
      assessment_date,
      assessment_time,
      status,
      follow_up_status,
      converted_student_id,
      converted_at,
      created_at
    `)
    .order("assessment_date", { ascending: false })
    .order("assessment_time", { ascending: false });

  if (assessmentsError) {
    console.error("Error loading assessment bookings:", assessmentsError);
    throw new Error("Unable to load assessments.");
  }

  const assessmentRows = (assessments ?? []) as AssessmentRow[];
  const teacherIds = Array.from(
    new Set(assessmentRows.map((assessment) => assessment.teacher_id))
  );

  let teacherRows: TeacherRow[] = [];

  if (teacherIds.length > 0) {
    const { data: teachers, error: teachersError } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", teacherIds);

    if (teachersError) {
      console.error("Error loading assessment teachers:", teachersError);
      throw new Error("Unable to load assessment teachers.");
    }

    teacherRows = (teachers ?? []) as TeacherRow[];
  }

  const teacherNameById = new Map(
    teacherRows.map((teacher) => [
      teacher.id,
      teacher.full_name || "Hamkke Teacher",
    ])
  );

  const filteredRows = statusFilter
    ? assessmentRows.filter((assessment) => assessment.status === statusFilter)
    : assessmentRows;

  const tableRows: AssessmentTableRow[] = filteredRows.map((assessment) => ({
    ...assessment,
    follow_up_status: assessment.converted_student_id
      ? "converted"
      : assessment.follow_up_status,
    teacher_name:
      teacherNameById.get(assessment.teacher_id) ?? "Hamkke Teacher",
  }));

  const confirmedCount = assessmentRows.filter(
    (assessment) => assessment.status === "confirmed"
  ).length;

  const completedCount = assessmentRows.filter(
    (assessment) => assessment.status === "completed"
  ).length;

  const convertedCount = assessmentRows.filter(
    (assessment) => Boolean(assessment.converted_student_id)
  ).length;

  const statusOptions: Array<{
    value: "" | AssessmentStatus;
    label: string;
  }> = [
    { value: "", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "no_show", label: "No-show" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
        <div className="flex w-full items-start justify-between gap-8">
          <Link
            href={`/${locale}/admin`}
            className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
          >
            &larr; Administration
          </Link>

          <div className="shrink-0 text-right">
            <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
              HAMKKE │ 함께
            </p>
            <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
              From Small Talk to Big Ideas
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1120px] px-6 pb-12 pt-10 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10 lg:pb-16 lg:pt-24">
        <h1 className="text-center font-serif text-[52px] font-normal leading-[1.05] tracking-[-0.035em] sm:text-[62px] lg:text-[70px]">
          Assessments
        </h1>
        <p className="mx-auto mt-8 max-w-[850px] text-center font-serif text-[21px] font-normal leading-8 text-[#4A4A4A] sm:text-[23px] sm:leading-9 lg:text-[25px] lg:leading-10">
          Manage Free Assessment bookings, learner details, schedules, and
          follow-up status in one place.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1120px] px-6 pb-24 sm:px-8 lg:px-10">
        <div className="grid grid-cols-3 border-y border-[#DCD8D2] py-8">
          <div className="border-r border-[#E1DDD7] pr-5">
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
              Confirmed
            </p>
            <p className="mt-2 font-serif text-[29px] leading-none">
              {confirmedCount}
            </p>
          </div>
          <div className="border-r border-[#E1DDD7] px-5">
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
              Completed
            </p>
            <p className="mt-2 font-serif text-[29px] leading-none">
              {completedCount}
            </p>
          </div>
          <div className="pl-5">
            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
              Converted
            </p>
            <p className="mt-2 font-serif text-[29px] leading-none">
              {convertedCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#DCD8D2] py-6">
          {statusOptions.map((option) => {
            const active = statusFilter === option.value;
            return (
              <Link
                key={option.value || "all"}
                href={
                  option.value
                    ? `/${locale}/admin/assessments?status=${option.value}`
                    : `/${locale}/admin/assessments`
                }
                className={`rounded-full px-4 py-2 font-sans text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-[#6F8F72] text-white"
                    : "bg-[#EEEAE3] text-[#6F6B65] hover:bg-[#E2EBDD] hover:text-[#607963]"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        {tableRows.length > 0 ? (
          <AssessmentsTable locale={locale} assessments={tableRows} />
        ) : (
          <div className="border-b border-[#DCD8D2] py-20 text-center">
            <CalendarCheck2
              size={24}
              strokeWidth={1.4}
              className="mx-auto text-[#9AAA9B]"
            />
            <h2 className="mt-5 font-serif text-[27px] font-normal">
              No assessments found
            </h2>
            <p className="mx-auto mt-3 max-w-[420px] font-serif text-[16px] leading-7 text-[#74716B]">
              {statusFilter
                ? "There are no assessment bookings with this status."
                : "Free Assessment bookings will appear here once they are confirmed."}
            </p>
          </div>
        )}

        <div className="mt-20">
          <p className="text-center font-sans text-[12px] text-[#8A8A84]">
            Hamkke │ 함께 · Private English Lessons
          </p>
        </div>
      </section>
    </main>
  );
}
