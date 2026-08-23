import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface NewEnrollmentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function NewEnrollmentPage({
  params,
}: NewEnrollmentPageProps) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("id, full_name, preferred_name")
    .eq("id", id)
    .single();

  if (error || !student) {
    throw new Error("Student not found.");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
        <div className="relative flex w-full items-center justify-between">
          <Link
            href={`/${locale}/admin/students/${student.id}`}
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

          <div className="flex items-center gap-3 font-sans text-[14px] text-[#5F655F] sm:gap-4 sm:text-[15px]">
            <span className="font-medium text-[#6F8F72]">
              EN
            </span>
          </div>
        </div>
      </header>

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
            mb-5
            text-center
            font-sans
            text-[11px]
            font-medium
            uppercase
            tracking-[0.14em]
            text-[#6F8F72]
          "
        >
          New Enrollment
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
          {student.preferred_name || student.full_name}
        </h1>

        <p
          className="
            mx-auto
            mt-8
            max-w-[760px]
            text-center
            font-serif
            text-[21px]
            leading-8
            text-[#4A4A4A]
            sm:text-[23px]
            sm:leading-9
            lg:text-[25px]
            lg:leading-10
          "
        >
          Set up a new lesson package for this student.
        </p>
      </section>

      <section
        className="
          mx-auto
          w-full
          max-w-[760px]
          px-6
          pb-24
          sm:px-8
          lg:px-10
        "
      >
        <form
          action={`/api/admin/students/${student.id}/enrollments`}
          method="POST"
          className="space-y-12"
        >
          <input
            type="hidden"
            name="locale"
            value={locale}
          />

          {/* LESSON PACKAGE */}
          <section>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
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
                Lesson Package
              </h2>
            </div>

            <div className="space-y-7">
              <Field
                label="Package Name"
                id="package_name"
                name="package_name"
                type="text"
                placeholder="20 Private English Lessons"
                required
              />

              <Field
                label="Number of Lessons"
                id="number_of_lessons"
                name="number_of_lessons"
                type="number"
                defaultValue="20"
                min="1"
                required
              />

              <Field
                label="Lesson Duration"
                id="lesson_duration"
                name="lesson_duration"
                type="number"
                defaultValue="25"
                min="1"
                required
              />

              <Field
                label="Lessons Per Week"
                id="lessons_per_week"
                name="lessons_per_week"
                type="number"
                defaultValue="3"
                min="1"
                required
              />

              <Field
                label="Start Date"
                id="start_date"
                name="start_date"
                type="date"
                required
              />

              <Field
                label="Tuition Amount"
                id="tuition_amount"
                name="tuition_amount"
                type="number"
                defaultValue="2940"
                min="0"
                step="0.01"
                required
              />

              <div>
                <label
                  htmlFor="currency"
                  className="
                    block
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Currency
                </label>

                <select
                  id="currency"
                  name="currency"
                  defaultValue="KRW"
                  className="
                    mt-3
                    w-full
                    border-b
                    border-[#CFCBC4]
                    bg-transparent
                    px-0
                    py-3
                    font-serif
                    text-[19px]
                    text-[#292929]
                    outline-none
                    focus:border-[#6F8F72]
                  "
                >
                  <option value="PHP">PHP</option>
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </section>

          {/* SCHEDULE */}
          <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
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
              Schedule
            </p>

            <p
              className="
                mt-2
                font-sans
                text-[13px]
                leading-6
                text-[#6B6B66]
              "
            >
              Select the student's usual lesson days.
              The lesson time can be confirmed later.
            </p>

            {/* DAYS */}
            <div className="mt-7">
              <p
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                Lesson Days
              </p>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-x-6
                  gap-y-4
                  sm:grid-cols-4
                "
              >
                {[
                  ["Monday", "mon"],
                  ["Tuesday", "tue"],
                  ["Wednesday", "wed"],
                  ["Thursday", "thu"],
                  ["Friday", "fri"],
                  ["Saturday", "sat"],
                  ["Sunday", "sun"],
                ].map(([label, value]) => (
                  <label
                    key={value}
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      font-sans
                      text-sm
                      text-[#4A4A4A]
                    "
                  >
                    <input
                      type="checkbox"
                      name="schedule_days"
                      value={value}
                      className="
                        h-4
                        w-4
                        accent-[#6F8F72]
                      "
                    />

                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* TIME */}
            <div className="mt-8">
              <label
                htmlFor="schedule_time"
                className="
                  block
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                Lesson Time
              </label>

              <input
                id="schedule_time"
                name="schedule_time"
                type="time"
                className="
                  mt-3
                  w-full
                  border-b
                  border-[#CFCBC4]
                  bg-transparent
                  px-0
                  py-3
                  font-serif
                  text-[19px]
                  text-[#292929]
                  outline-none
                  transition-colors
                  focus:border-[#6F8F72]
                "
              />

              <p
                className="
                  mt-3
                  font-sans
                  text-[12px]
                  leading-5
                  text-[#777771]
                "
              >
                Leave blank if the lesson time has not
                been confirmed yet. The contract will show
                "To be confirmed."
              </p>
            </div>
          </section>

          {/* WORKFLOW */}
          <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
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
              What happens next
            </p>

            <div className="mt-5 space-y-4">
              <WorkflowStep
                number="01"
                title="Enrollment created"
                description="The enrollment begins as pending."
              />

              <WorkflowStep
                number="02"
                title="Contract for review"
                description="The contract can then be prepared and sent."
              />

              <WorkflowStep
                number="03"
                title="Payment"
                description="Payment remains pending until confirmed."
              />

              <WorkflowStep
                number="04"
                title="Enrollment becomes active"
                description="Once payment is marked as paid, the enrollment becomes active and lessons can be generated."
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div
            className="
              flex
              flex-col-reverse
              gap-4
              border-t
              border-[#DCD8D2]
              pt-8
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <Link
              href={`/${locale}/admin/students/${student.id}`}
              className="
                text-center
                font-sans
                text-sm
                text-[#5F655F]
                transition-colors
                hover:text-[#6F8F72]
                sm:text-left
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="
                rounded-full
                bg-[#6F8F72]
                px-7
                py-3
                font-sans
                text-sm
                font-medium
                text-white
                transition-opacity
                hover:opacity-85
              "
            >
              Create Enrollment
            </button>
          </div>
        </form>

        <div className="mt-20">
          <p
            className="
              text-center
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            Hamkke │ 함께
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  id,
  name,
  type,
  placeholder,
  defaultValue,
  min,
  step,
  required,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          block
          font-sans
          text-[11px]
          font-medium
          uppercase
          tracking-[0.14em]
          text-[#6F8F72]
        "
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        step={step}
        required={required}
        className="
          mt-3
          w-full
          border-b
          border-[#CFCBC4]
          bg-transparent
          px-0
          py-3
          font-serif
          text-[19px]
          text-[#292929]
          outline-none
          transition-colors
          placeholder:text-[#A09D96]
          focus:border-[#6F8F72]
        "
      />
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <span
        className="
          shrink-0
          font-sans
          text-[11px]
          font-medium
          tracking-[0.12em]
          text-[#8A8A84]
        "
      >
        {number}
      </span>

      <div>
        <p className="font-serif text-[18px]">
          {title}
        </p>

        <p
          className="
            mt-1
            font-sans
            text-[13px]
            leading-6
            text-[#6B6B66]
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}