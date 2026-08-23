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

export default async function LessonsPage({
  params,
}: LessonsPageProps) {
  const { locale, id, enrollmentId } = await params;

  const supabase = await createClient();

  const { data: enrollment, error } = await supabase
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
    .eq("student_id", id)
    .single();

  if (error || !enrollment) {
    notFound();
  }

  const lessons = [...(enrollment.lessons ?? [])].sort(
    (a, b) => a.lesson_number - b.lesson_number
  );

  const consumedLessons = lessons.filter(
    (lesson) => lesson.consumes_lesson
  ).length;

  const remainingLessons =
    enrollment.number_of_lessons - consumedLessons;

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
          {enrollment.lesson_duration} minutes ·{" "}
          {enrollment.lessons_per_week} lessons per week
        </p>
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
          </div>

          <div className="mt-8 space-y-3">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                locale={locale}
                studentId={id}
                enrollmentId={enrollmentId}
              />
            ))}
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
}: {
  lesson: {
    id: string;
    lesson_number: number;
    lesson_date: string | null;
    duration: number | null;
    attendance_status: string;
    notes: string | null;
    original_lesson_date: string | null;
    rescheduled_at: string | null;
    consumes_lesson: boolean;
    resolution: string | null;
  };
  locale: string;
  studentId: string;
  enrollmentId: string;
}) {
  const isRescheduled =
    lesson.rescheduled_at !== null &&
    lesson.original_lesson_date !== lesson.lesson_date;

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
            <div className="flex items-center gap-3">
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