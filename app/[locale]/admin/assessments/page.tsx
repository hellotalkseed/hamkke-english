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
  searchParams: Promise<{ status?: string; followUp?: string }>;
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
  contact_method: string | null;
  contact_id: string | null;
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
    redirect(`/${locale}/portal/login`);
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
      contact_method,
      contact_id,
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

  const needsFollowUp = (assessment: AssessmentRow) => assessment.status === "completed" && !assessment.converted_student_id && assessment.follow_up_status !== "not_proceeding";
  const followUpFilter = filters.followUp === "pending";
  const filteredRows = assessmentRows.filter((assessment) =>
    (!statusFilter || assessment.status === statusFilter) && (!followUpFilter || needsFollowUp(assessment))
  );

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
      <section className="mx-auto w-full max-w-[1320px] px-8 pb-7 pt-[92px] sm:px-10 lg:px-14 xl:px-16">
        <div className="max-w-[820px]">
          <div className="mb-5 flex items-center gap-4">
            <span className="h-px w-12 bg-[#6F8F72]" />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F8F72]">
              Administration
            </span>
          </div>

          <h1 className="font-serif text-[46px] font-normal leading-[1] tracking-[-0.035em] sm:text-[54px] lg:text-[60px]">
            Assessments
          </h1>

          <p className="mt-4 max-w-[720px] font-serif text-[17px] leading-8 text-[#74716B] sm:text-[18px]">
            Manage Free Assessment bookings, learner details, schedules, and follow-up status in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1320px] px-8 pb-24 sm:px-10 lg:px-14 xl:px-16">
        <div className="grid grid-cols-3 border-y border-[#DCD8D2] py-6">
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
          <Link href={`/${locale}/admin/assessments?followUp=pending`}
            className={`rounded-full px-4 py-2 font-sans text-[11px] font-medium ${followUpFilter ? "bg-[#6F8F72] text-white" : "bg-[#EEEAE3] text-[#6F6B65]"}`}>
            Needs follow-up · {assessmentRows.filter(needsFollowUp).length}
          </Link>
          {statusOptions.map((option) => {
            const active = !followUpFilter && statusFilter === option.value;
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

        <p className="py-5 text-sm leading-6 text-[#74716B]">
          Review the teacher’s observations, contact the learner, then mark Interested to create their student record. Add their enrollment from the student profile.
        </p>
        {tableRows.length > 0 ? (
          <AssessmentsTable key={`${statusFilter}:${followUpFilter}`} locale={locale} assessments={tableRows} />
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
