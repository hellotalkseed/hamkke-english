import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LessonActions from "@/components/admin/LessonActions";

interface LessonsPageProps {
  params: Promise<{
    locale: string;
    id: string;
    enrollmentId: string;
  }>;
}

interface Lesson {
  id: string;
  student_id: string | null;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: string;
  notes: string | null;
  original_lesson_date: string | null;
  rescheduled_at: string | null;
  consumes_lesson: boolean;
  resolution: string | null;
}

interface Participant {
  student_id: string;
}

interface Enrollment {
  id: string;
  package_name: string;
  number_of_lessons: number;
  lesson_duration: number | null;
  lessons_per_week: number | null;
  start_date: string | null;
  status: string;
  schedule_days: number[] | null;
  schedule_time: string | null;
  lessons: Lesson[];
}

export default async function LessonsPage({
  params,
}: LessonsPageProps) {
  const { locale, id, enrollmentId } = await params;

  const supabase = await createClient();

  /*
   * First verify that the current student belongs to this enrollment.
   *
   * This is important for shared enrollments because the participant
   * is stored in enrollment_students rather than relying only on
   * enrollments.student_id.
   */
  const { data: participant, error: participantError } =
    await supabase
      .from("enrollment_students")
      .select("student_id")
      .eq("enrollment_id", enrollmentId)
      .eq("student_id", id)
      .maybeSingle();

  if (participantError || !participant) {
    /*
     * For older individual enrollments that may not yet have an
     * enrollment_students row, fall back to the legacy student_id.
     */
    const { data: legacyEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("id", enrollmentId)
      .eq("student_id", id)
      .maybeSingle();

    if (!legacyEnrollment) {
      notFound();
    }
  }

  /*
   * Fetch the enrollment itself.
   *
   * IMPORTANT:
   * Do not filter the enrollment by student_id here.
   *
   * A shared enrollment belongs to multiple students, so filtering
   * with:
   *
   *   .eq("student_id", id)
   *
   * would cause the page to fail for shared enrollments whose
   * primary student_id does not match the student currently viewing it.
   */
  const { data: enrollmentData, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        status,
        schedule_days,
        schedule_time,
        lessons (
          id,
          student_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          notes,
          original_lesson_date,
          rescheduled_at,
          consumes_lesson,
          resolution
        )
      `)
      .eq("id", enrollmentId)
      .single();

  if (enrollmentError || !enrollmentData) {
    notFound();
  }

  const enrollment = enrollmentData as Enrollment;

  /*
   * Lessons belong to the enrollment as a whole.
   *
   * For shared enrollments, ALL participants should see the same
   * complete lesson track.
   *
   * Therefore, we intentionally do NOT filter lessons by student_id.
   */
  const lessons = [...(enrollment.lessons ?? [])].sort(
    (a, b) => a.lesson_number - b.lesson_number
  );

  /*
   * Consumption is calculated at the enrollment level.
   *
   * Example:
   * 20 shared lessons
   * Dasom consumes 8
   * Bin consumes 5
   *
   * Total consumed = 13
   * Remaining = 7
   *
   * It is NOT calculated separately for each participant.
   */
  const consumedLessons = lessons.filter(
    (lesson) => lesson.consumes_lesson === true
  ).length;

  const remainingLessons = Math.max(
    enrollment.number_of_lessons - consumedLessons,
    0
  );

  /*
   * Determine whether this is a shared enrollment.
   *
   * The package name check is retained as a fallback for older
   * records that may not have an explicit shared flag.
   */
  const { data: enrollmentParticipants } = await supabase
    .from("enrollment_students")
    .select("student_id")
    .eq("enrollment_id", enrollmentId);

  const isShared =
    (enrollmentParticipants?.length ?? 0) > 1 ||
    enrollment.package_name.toLowerCase().includes("shared");

  /*
   * Build a participant lookup so the lesson track can identify
   * who the scheduled lesson belongs to.
   */
  let participantNameById: Record<string, string> = {};

  if (isShared && enrollmentParticipants?.length) {
    const participantIds = enrollmentParticipants.map(
      (participant) => participant.student_id
    );

    const { data: students } = await supabase
      .from("students")
      .select("id, full_name")
      .in("id", participantIds);

    if (students) {
      participantNameById = Object.fromEntries(
        students.map((student) => [
          student.id,
          student.full_name,
        ])
      );
    }
  }

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
        <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between">
          <Link
            href={`/${locale}/admin/students/${id}`}
            className="
              flex
              items-center
              gap-2
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              hover:text-[#6F8F72]
            "
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Student
          </Link>

          <div
            className="
              hidden
              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]
              sm:block
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
          pt-12
          sm:px-8
          sm:pb-14
          sm:pt-20
          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        <div className="mb-5 text-center font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
          Lesson Record
        </div>

        <h1
          className="
            text-center
            font-serif
            text-[48px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]
            sm:text-[60px]
            lg:text-[68px]
          "
        >
          {enrollment.package_name}
        </h1>

        <p
          className="
            mt-5
            text-center
            font-sans
            text-[14px]
            text-[#777771]
          "
        >
          {enrollment.lesson_duration ?? "—"} minutes ·{" "}
          {enrollment.lessons_per_week ?? "—"} lessons per week
        </p>

        {isShared && (
          <p
            className="
              mt-3
              text-center
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            Shared lesson track · All participants share the same
            lesson pool
          </p>
        )}
      </section>

      {/* SUMMARY */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-10
          sm:px-8
          lg:px-10
        "
      >
        <div
          className="
            grid
            gap-4
            sm:grid-cols-3
          "
        >
          <Summary
            label="Total"
            value={enrollment.number_of_lessons}
            suffix="lessons"
          />

          <Summary
            label="Consumed"
            value={consumedLessons}
            suffix="lessons"
          />

          <Summary
            label="Remaining"
            value={remainingLessons}
            suffix="lessons"
          />
        </div>
      </section>

      {/* LESSONS */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-24
          sm:px-8
          lg:px-10
        "
      >
        <div className="border-t border-[#DCD8D2] py-10">
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#E2EBDD]
                text-[#6F8F72]
              "
            >
              <BookOpen size={17} strokeWidth={1.5} />
            </div>

            <div>
              <h2
                className="
                  font-serif
                  text-[30px]
                  font-normal
                  tracking-[-0.02em]
                "
              >
                Lessons
              </h2>

              {isShared && (
                <p className="mt-1 font-sans text-[12px] text-[#8A8A84]">
                  Shared across all participants
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  locale={locale}
                  studentId={id}
                  enrollmentId={enrollmentId}
                  isShared={isShared}
                  participantNameById={participantNameById}
                />
              ))
            ) : (
              <div
                className="
                  rounded-2xl
                  border
                  border-[#DCD8D2]
                  bg-white/40
                  px-6
                  py-12
                  text-center
                "
              >
                <p className="font-serif text-[20px] text-[#55544F]">
                  No lessons have been generated yet.
                </p>

                <p className="mt-2 font-sans text-[13px] text-[#8A8A84]">
                  Lessons will appear here once the enrollment is
                  activated.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Summary({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-[#F0F4ED]
        p-6
        sm:p-7
      "
    >
      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
        {label}
      </p>

      <p className="mt-2 font-serif text-[30px]">
        {value}
      </p>

      <p className="mt-1 font-sans text-[13px] text-[#777771]">
        {suffix}
      </p>
    </div>
  );
}

function LessonRow({
  lesson,
  locale,
  studentId,
  enrollmentId,
  isShared,
  participantNameById,
}: {
  lesson: Lesson;
  locale: string;
  studentId: string;
  enrollmentId: string;
  isShared: boolean;
  participantNameById: Record<string, string>;
}) {
  const isRescheduled =
    lesson.rescheduled_at !== null &&
    lesson.original_lesson_date !== lesson.lesson_date;

  const participantName =
    lesson.student_id
      ? participantNameById[lesson.student_id]
      : null;

  return (
    <div
      className="
        rounded-2xl
        border
        border-[#DCD8D2]
        bg-white/40
        p-5
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* LESSON INFO */}
        <div className="flex items-center gap-5">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F0F4ED]
              font-serif
              text-[17px]
              text-[#6F8F72]
            "
          >
            {lesson.lesson_number}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-serif text-[20px]">
                {formatDate(lesson.lesson_date)}
              </p>

              {isRescheduled && (
                <span
                  className="
                    rounded-full
                    bg-[#E8EFE5]
                    px-2.5
                    py-1
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.08em]
                    text-[#6F8F72]
                  "
                >
                  Rescheduled
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 font-sans text-[13px] text-[#777771]">
              <CalendarDays size={13} strokeWidth={1.5} />
              {lesson.duration ?? "—"} minutes
            </div>

            {isShared && participantName && (
              <p className="mt-2 font-sans text-[12px] text-[#6F8F72]">
                Scheduled for {participantName}
              </p>
            )}

            {isRescheduled &&
              lesson.original_lesson_date && (
                <p className="mt-2 font-sans text-[11px] text-[#99958F]">
                  Originally scheduled for{" "}
                  {formatDate(
                    lesson.original_lesson_date
                  )}
                </p>
              )}
          </div>
        </div>

        {/* STATUS + ACTION */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            sm:justify-end
          "
        >
          <div className="flex items-center gap-3">
            <StatusBadge
              status={lesson.attendance_status}
              resolution={lesson.resolution}
            />

            {lesson.consumes_lesson && (
              <span className="font-sans text-[11px] text-[#777771]">
                Consumed
              </span>
            )}
          </div>

          <LessonActions
            locale={locale}
            studentId={studentId}
            enrollmentId={enrollmentId}
            lessonId={lesson.id}
            currentStatus={lesson.attendance_status}
            currentResolution={lesson.resolution}
            currentLessonDate={lesson.lesson_date}
          />
        </div>
      </div>

      {lesson.notes && (
        <div
          className="
            mt-5
            border-t
            border-[#E5E1DB]
            pt-4
          "
        >
          <p className="font-sans text-[12px] leading-5 text-[#777771]">
            {lesson.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  resolution,
}: {
  status: string;
  resolution: string | null;
}) {
  let label = "Scheduled";

  switch (status) {
    case "scheduled":
      label = "Scheduled";
      break;

    case "completed":
      label = "Completed";
      break;

    case "no_show":
      label = "No-show";
      break;

    case "late_cancellation":
      label = "Late cancellation";
      break;

    case "student_cancelled_rescheduled":
      label = "Student cancelled · Rescheduled";
      break;

    case "student_cancelled_credit":
      label = "Student cancelled · Credit";
      break;

    case "unexpected_circumstance":
      if (resolution === "rescheduled") {
        label = "Unexpected · Rescheduled";
      } else if (resolution === "lesson_credit") {
        label = "Unexpected · Credit";
      } else if (
        resolution === "counted_as_completed"
      ) {
        label = "Unexpected · Completed";
      } else {
        label = "Unexpected circumstance";
      }
      break;

    case "teacher_cancelled":
      if (resolution === "rescheduled") {
        label = "Teacher cancelled · Rescheduled";
      } else if (resolution === "lesson_credit") {
        label = "Teacher cancelled · Credit";
      } else {
        label = "Teacher cancelled";
      }
      break;

    default:
      label = status;
  }

  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-[#F0F4ED]
        px-4
        py-2
        font-sans
        text-[11px]
        font-medium
        uppercase
        tracking-[0.08em]
        text-[#6F8F72]
      "
    >
      {label}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Date not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}