import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface RenewalPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

interface Enrollment {
  id: string;
  package_name: string;
  number_of_lessons: number;
  lesson_duration: number | null;
  lessons_per_week: number | null;
  start_date: string | null;
  status: string;
  tuition_amount: number | null;
  currency: string | null;
  schedule_days: string[] | null;
  schedule_time: string | null;
}

export default async function NewRenewalPage({
  params,
}: RenewalPageProps) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(
      `
        id,
        full_name,
        preferred_name,
        enrollments (
          id,
          package_name,
          number_of_lessons,
          lesson_duration,
          lessons_per_week,
          start_date,
          status,
          tuition_amount,
          currency,
          schedule_days,
          schedule_time
        )
      `
    )
    .eq("id", id)
    .single();

  if (error || !student) {
    notFound();
  }

  const enrollments =
    (student.enrollments ?? []) as unknown as Enrollment[];

  /*
   * Use the most recent enrollment as the enrollment
   * being renewed.
   *
   * This is intentionally based on start_date rather
   * than simply using the first record returned by
   * Supabase.
   */
  const previousEnrollment =
    [...enrollments].sort((a, b) => {
      const dateA = a.start_date
        ? new Date(a.start_date).getTime()
        : 0;

      const dateB = b.start_date
        ? new Date(b.start_date).getTime()
        : 0;

      return dateB - dateA;
    })[0] ?? null;

  if (!previousEnrollment) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
        <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
          <div className="relative mx-auto flex w-full max-w-[1040px] items-center">
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
              <ArrowLeft
                size={16}
                strokeWidth={1.5}
              />
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
          </div>
        </header>

        <section
          className="
            mx-auto
            w-full
            max-w-[760px]
            px-6
            pb-24
            pt-24
            text-center
            sm:px-8
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
            Renewal
          </p>

          <h1
            className="
              mt-5
              font-serif
              text-[42px]
              font-normal
              tracking-[-0.03em]
              sm:text-[52px]
            "
          >
            No previous enrollment
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-[560px]
              font-serif
              text-[19px]
              leading-8
              text-[#66635D]
            "
          >
            This student does not have an enrollment
            that can be renewed yet.
          </p>

          <Link
            href={`/${locale}/admin/students/${student.id}/enrollments/new`}
            className="
              mt-8
              inline-flex
              rounded-full
              bg-[#6F8F72]
              px-6
              py-3
              font-sans
              text-sm
              font-medium
              text-white
              transition-opacity
              hover:opacity-85
            "
          >
            Create First Enrollment
          </Link>
        </section>
      </main>
    );
  }

  const studentName =
    student.preferred_name || student.full_name;

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
        <div className="relative mx-auto flex w-full max-w-[1040px] items-center">
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
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
            />
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

          <div className="ml-auto font-sans text-[14px] text-[#5F655F]">
            <span className="font-medium text-[#6F8F72]">
              EN
            </span>
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
          Renew Enrollment
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
          {studentName}
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
          Create a new lesson package based on the
          student's previous enrollment.
        </p>
      </section>

      {/* FORM */}
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

          {/* ============================================================ */}
          {/* RENEWAL RELATIONSHIP                                         */}
          {/* ============================================================ */}

          <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
            <div className="flex items-center gap-4">
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
                <RefreshCw
                  size={17}
                  strokeWidth={1.5}
                />
              </div>

              <div>
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
                  Renewal
                </p>

                <h2 className="mt-1 font-serif text-[24px]">
                  Renewing previous enrollment
                </h2>
              </div>
            </div>

            <div className="mt-7 border-t border-[#D8E1D3] pt-6">
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
                Previous Package
              </p>

              <p className="mt-2 font-serif text-[20px]">
                {previousEnrollment.package_name}
              </p>

              <p
                className="
                  mt-2
                  font-sans
                  text-[13px]
                  text-[#777771]
                "
              >
                {previousEnrollment.number_of_lessons}{" "}
                lessons
                {" · "}
                {previousEnrollment.lesson_duration ??
                  "—"}{" "}
                minutes
                {" · "}
                {formatDate(
                  previousEnrollment.start_date
                )}
              </p>
            </div>

            <input
              type="hidden"
              name="renewal_of"
              value={previousEnrollment.id}
            />
          </section>

          {/* ============================================================ */}
          {/* LESSON PACKAGE                                                */}
          {/* ============================================================ */}

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
                <BookOpen
                  size={17}
                  strokeWidth={1.5}
                />
              </div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  font-normal
                  tracking-[-0.02em]
                "
              >
                New Lesson Package
              </h2>
            </div>

            <div className="space-y-7">
              {/* PACKAGE NAME */}

              <Field
                label="Package Name"
                id="package_name"
                name="package_name"
                type="text"
                defaultValue={
                  previousEnrollment.package_name
                }
                required
              />

              {/* NUMBER OF LESSONS */}

              <Field
                label="Number of Lessons"
                id="number_of_lessons"
                name="number_of_lessons"
                type="number"
                defaultValue={String(
                  previousEnrollment.number_of_lessons
                )}
                min="1"
                required
              />

              {/* LESSON DURATION */}

              <Field
                label="Lesson Duration"
                id="lesson_duration"
                name="lesson_duration"
                type="number"
                defaultValue={String(
                  previousEnrollment.lesson_duration ??
                    25
                )}
                min="1"
                required
              />

              {/* LESSONS PER WEEK */}

              <Field
                label="Lessons Per Week"
                id="lessons_per_week"
                name="lessons_per_week"
                type="number"
                defaultValue={String(
                  previousEnrollment.lessons_per_week ??
                    3
                )}
                min="1"
                required
              />

              {/* ======================================================== */}
              {/* LESSON START DATE                                         */}
              {/* ======================================================== */}

              <div>
                <label
                  htmlFor="start_date"
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
                  Lesson Start Date
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
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
                  This is the date the renewed lessons begin.
                  Lesson dates are generated from this date,
                  the selected schedule, and the number of
                  lessons. It is independent of the payment
                  date.
                </p>
              </div>

              {/* ======================================================== */}
              {/* TUITION                                                   */}
              {/* ======================================================== */}

              <div>
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
                  Tuition
                </p>

                <p
                  className="
                    mt-2
                    font-sans
                    text-[12px]
                    leading-5
                    text-[#777771]
                  "
                >
                  Record the agreed tuition in both KRW and
                  PHP. The KRW amount is the Korean payment
                  amount, while the PHP amount records its
                  equivalent for your bookkeeping.
                </p>

                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Tuition Amount (KRW)"
                    id="tuition_amount_krw"
                    name="tuition_amount_krw"
                    type="number"
                    placeholder="75000"
                    min="0"
                    step="1"
                    required
                  />

                  <Field
                    label="Tuition Amount (PHP)"
                    id="tuition_amount_php"
                    name="tuition_amount_php"
                    type="number"
                    placeholder="2940"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* PAYMENT DETAILS                                           */}
              {/* ======================================================== */}

              <div
                className="
                  rounded-2xl
                  bg-[#F0F4ED]
                  p-6
                  sm:p-8
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E2EBDD]
                      text-[#6F8F72]
                    "
                  >
                    <CreditCard
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>

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
                    Payment Details
                  </p>
                </div>

                <p
                  className="
                    mt-3
                    font-sans
                    text-[13px]
                    leading-6
                    text-[#6B6B66]
                  "
                >
                  Payment information is recorded separately
                  from the lesson schedule. The payment date
                  records when the payment was actually received
                  or recorded. It does not determine when the
                  renewed lessons begin.
                </p>

                <div className="mt-7 space-y-7">
                  {/* PAYMENT DATE */}

                  <div>
                    <label
                      htmlFor="payment_date"
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
                      Payment Date
                    </label>

                    <input
                      id="payment_date"
                      name="payment_date"
                      type="date"
                      required
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
                      Enter the actual date the renewal payment
                      was received or recorded. This date is for
                      payment records only and does not change
                      the lesson start date.
                    </p>
                  </div>

                  {/* PAYMENT METHOD */}

                  <div>
                    <label
                      htmlFor="payment_method"
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
                      Payment Method
                    </label>

                    <select
                      id="payment_method"
                      name="payment_method"
                      defaultValue="pending"
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
                      <option value="pending">
                        Pending
                      </option>

                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>

                      <option value="PayPal">
                        PayPal
                      </option>

                      <option value="GCash">
                        GCash
                      </option>

                      <option value="Cash">
                        Cash
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* REFERENCE NUMBER */}

                  <Field
                    label="Reference Number"
                    id="reference"
                    name="reference"
                    type="text"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SCHEDULE                                                      */}
          {/* ============================================================ */}

          <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#6F8F72]
                "
              >
                <CalendarDays
                  size={16}
                  strokeWidth={1.5}
                />
              </div>

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
                Lesson Schedule
              </p>
            </div>

            <p
              className="
                mt-3
                font-sans
                text-[13px]
                leading-6
                text-[#6B6B66]
              "
            >
              The previous schedule has been carried over.
              Change anything that needs updating. This
              schedule is used together with the lesson start
              date to generate the renewed lessons.
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
                ].map(([label, value]) => {
                  const selected =
                    previousEnrollment.schedule_days?.includes(
                      value
                    ) ?? false;

                  return (
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
                        defaultChecked={selected}
                        className="
                          h-4
                          w-4
                          accent-[#6F8F72]
                        "
                      />

                      <span>{label}</span>
                    </label>
                  );
                })}
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
                defaultValue={
                  previousEnrollment.schedule_time ||
                  ""
                }
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
                Leave blank if the lesson time has not been
                confirmed yet. The contract will show
                "To be confirmed."
              </p>
            </div>
          </section>

          {/* ============================================================ */}
          {/* WORKFLOW                                                      */}
          {/* ============================================================ */}

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
                title="Renewal created"
                description="A new pending enrollment is created and linked to the previous enrollment."
              />

              <WorkflowStep
                number="02"
                title="Contract for review"
                description="A new contract is created for the renewed package, including its own lesson start date and schedule."
              />

              <WorkflowStep
                number="03"
                title="Payment recorded"
                description="The payment record stores the KRW amount, PHP amount, payment date, payment method, and reference number. The payment date is kept separately from the lesson start date."
              />

              <WorkflowStep
                number="04"
                title="New package becomes active"
                description="Once payment is confirmed, the renewal becomes active and a fresh set of lessons is generated from the lesson start date and schedule."
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* ACTIONS                                                       */}
          {/* ============================================================ */}

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
              Create Renewal
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

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* WORKFLOW                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* FORMATTERS                                                                 */
/* -------------------------------------------------------------------------- */

function formatDate(date: string | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}