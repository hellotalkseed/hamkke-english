"use client";

import { useState } from "react";

interface RenewEnrollmentFormProps {
  studentId: string;
  enrollmentId: string;
  locale: string;
  packageName: string;
  numberOfLessons: number;
  lessonDuration: number | null;
  lessonsPerWeek: number | null;
  tuitionAmount: number | null;
  currency: string | null;
  scheduleDays: string[] | null;
  scheduleTime: string | null;
}

const DAYS = [
  ["Monday", "mon"],
  ["Tuesday", "tue"],
  ["Wednesday", "wed"],
  ["Thursday", "thu"],
  ["Friday", "fri"],
  ["Saturday", "sat"],
  ["Sunday", "sun"],
] as const;

export default function RenewEnrollmentForm({
  studentId,
  enrollmentId,
  locale,
  packageName,
  numberOfLessons,
  lessonDuration,
  lessonsPerWeek,
  tuitionAmount,
  currency,
  scheduleDays,
  scheduleTime,
}: RenewEnrollmentFormProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          rounded-full
          bg-[#6F8F72]
          px-5
          py-2.5
          font-sans
          text-sm
          font-medium
          text-white
          transition-opacity
          hover:opacity-85
        "
      >
        Renew Enrollment
      </button>
    );
  }

  return (
    <div
      className="
        mt-8
        overflow-hidden
        rounded-2xl
        border
        border-[#D8E1D3]
        bg-white
      "
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div
        className="
          border-b
          border-[#E5E2DC]
          px-6
          py-7
          sm:px-8
          sm:py-8
        "
      >
        <div className="flex items-start justify-between gap-6">
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

            <h3
              className="
                mt-2
                font-serif
                text-[28px]
                font-normal
                tracking-[-0.02em]
                text-[#292929]
              "
            >
              Create a new enrollment
            </h3>

            <p
              className="
                mt-3
                max-w-[620px]
                font-sans
                text-[13px]
                leading-6
                text-[#777771]
              "
            >
              The previous enrollment will remain unchanged.
              This creates a separate enrollment with its own
              contract, payment, status, schedule, and lessons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close renewal form"
            className="
              shrink-0
              font-sans
              text-[13px]
              text-[#8A8A84]
              transition-colors
              hover:text-[#292929]
            "
          >
            Close
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PREVIOUS ENROLLMENT                                                */}
      {/* ================================================================== */}

      <div
        className="
          border-b
          border-[#E5E2DC]
          bg-[#F0F4ED]
          px-6
          py-6
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
          Renewing from
        </p>

        <div className="mt-3">
          <p className="font-serif text-[20px] text-[#292929]">
            {packageName}
          </p>

          <p
            className="
              mt-2
              font-sans
              text-[13px]
              leading-6
              text-[#777771]
            "
          >
            {numberOfLessons} lessons
            {" · "}
            {lessonDuration ?? 25} minutes
            {" · "}
            {lessonsPerWeek ?? 3} lessons per week
          </p>

          {scheduleDays && scheduleDays.length > 0 && (
            <p
              className="
                mt-1
                font-sans
                text-[13px]
                leading-6
                text-[#777771]
              "
            >
              {formatScheduleDays(scheduleDays)}
              {scheduleTime
                ? ` at ${formatTime(scheduleTime)}`
                : ""}
            </p>
          )}
        </div>

        <div
          className="
            mt-5
            rounded-xl
            border
            border-[#D8E1D3]
            bg-white/60
            px-4
            py-3
          "
        >
          <p
            className="
              font-sans
              text-[12px]
              leading-5
              text-[#6B6B66]
            "
          >
            This enrollment is only used as the starting point
            for the renewal. Nothing from the previous enrollment
            will be changed.
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FORM                                                               */}
      {/* ================================================================== */}

      <form
        action={`/api/admin/students/${studentId}/enrollments`}
        method="POST"
        className="px-6 py-8 sm:px-8 sm:py-10"
      >
        {/* ================================================================= */}
        {/* HIDDEN WORKFLOW VALUES                                           */}
        {/* ================================================================= */}

        <input
          type="hidden"
          name="locale"
          value={locale}
        />

        <input
          type="hidden"
          name="renewal_of"
          value={enrollmentId}
        />

        <input
          type="hidden"
          name="enrollment_type"
          value="individual"
        />

        {/* ================================================================= */}
        {/* PACKAGE                                                           */}
        {/* ================================================================= */}

        <section>
          <SectionHeading
            eyebrow="Package"
            title="Lesson package"
            description="The previous package is copied here. Update anything that is changing for the new enrollment."
          />

          <div className="mt-7 space-y-7">
            <Field
              label="Package Name"
              id="renewal_package_name"
              name="package_name"
              type="text"
              defaultValue={packageName}
              required
            />

            <div className="grid gap-7 sm:grid-cols-3">
              <Field
                label="Number of Lessons"
                id="renewal_number_of_lessons"
                name="number_of_lessons"
                type="number"
                defaultValue={String(numberOfLessons)}
                min="1"
                step="1"
                required
              />

              <Field
                label="Lesson Duration"
                id="renewal_lesson_duration"
                name="lesson_duration"
                type="number"
                defaultValue={String(lessonDuration ?? 25)}
                min="1"
                step="1"
                required
              />

              <Field
                label="Lessons Per Week"
                id="renewal_lessons_per_week"
                name="lessons_per_week"
                type="number"
                defaultValue={String(lessonsPerWeek ?? 3)}
                min="1"
                step="1"
                required
              />
            </div>

            <Field
              label="Start Date"
              id="renewal_start_date"
              name="start_date"
              type="date"
              required
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* SCHEDULE                                                          */}
        {/* ================================================================= */}

        <section
          className="
            mt-12
            rounded-2xl
            bg-[#F0F4ED]
            p-6
            sm:p-8
          "
        >
          <SectionHeading
            eyebrow="Schedule"
            title="Lesson schedule"
            description="The previous schedule is pre-selected. Change it only if the student's schedule is changing."
          />

          <div className="mt-8">
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
              {DAYS.map(([label, value]) => {
                const selected =
                  scheduleDays?.some((day) => {
                    const normalized = day
                      .toLowerCase()
                      .trim();

                    return (
                      normalized === value ||
                      normalized === label.toLowerCase()
                    );
                  }) ?? false;

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

          <div className="mt-8">
            <label
              htmlFor="renewal_schedule_time"
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
              id="renewal_schedule_time"
              name="schedule_time"
              type="time"
              defaultValue={scheduleTime || ""}
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
              The previous lesson time is carried over
              automatically.
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* PAYMENT                                                           */}
        {/* ================================================================= */}

        <section className="mt-12">
          <SectionHeading
            eyebrow="Payment"
            title="Renewal payment"
            description="The payment belongs to the new enrollment. It will remain pending until you confirm that payment has been received."
          />

          <div className="mt-7 space-y-7">
            <div
              className="
                rounded-2xl
                border
                border-[#E7DDD1]
                bg-[#FAF8F5]
                p-5
                sm:p-6
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
                Payment Amount
              </p>

              <p
                className="
                  mt-1
                  font-serif
                  text-[15px]
                  text-[#777771]
                "
              >
                Record the renewal tuition in both KRW
                and PHP.
              </p>

              <div
                className="
                  mt-5
                  grid
                  gap-5
                  sm:grid-cols-2
                "
              >
                <Field
                  label="KRW Amount"
                  id="renewal_tuition_amount_krw"
                  name="tuition_amount_krw"
                  type="number"
                  defaultValue={
                    currency?.toUpperCase() === "KRW"
                      ? String(tuitionAmount ?? "")
                      : ""
                  }
                  min="0"
                  step="1"
                  placeholder="75,000"
                  required
                />

                <Field
                  label="PHP Amount"
                  id="renewal_tuition_amount_php"
                  name="tuition_amount_php"
                  type="number"
                  defaultValue=""
                  min="0"
                  step="0.01"
                  placeholder="3,150"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="renewal_payment_method"
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
                id="renewal_payment_method"
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
                  Not received yet
                </option>

                <option value="bank_transfer">
                  Bank Transfer
                </option>

                <option value="paypal">
                  PayPal
                </option>

                <option value="gcash">
                  GCash
                </option>

                <option value="cash">
                  Cash
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <Field
              label="Reference Number"
              id="renewal_payment_reference"
              name="payment_reference"
              type="text"
              placeholder="Optional"
            />

            <Field
              label="Payment Date"
              id="renewal_payment_date"
              name="payment_date"
              type="date"
            />

            <input
              type="hidden"
              name="payment_status"
              value="pending"
            />

            <div
              className="
                rounded-xl
                border
                border-[#E5E2DC]
                bg-[#FAF8F5]
                px-4
                py-4
              "
            >
              <p
                className="
                  font-sans
                  text-[12px]
                  leading-5
                  text-[#6B6B66]
                "
              >
                The new enrollment and its payment will be
                created as{" "}
                <strong className="font-medium text-[#4A4A4A]">
                  pending
                </strong>
                . The previous enrollment will not be changed.
                Once the payment is confirmed, the database can
                activate this enrollment and generate its lessons.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* WHAT HAPPENS NEXT                                                 */}
        {/* ================================================================= */}

        <section
          className="
            mt-12
            rounded-2xl
            bg-[#F0F4ED]
            p-6
            sm:p-8
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
            What happens next
          </p>

          <div className="mt-6 space-y-5">
            <WorkflowStep
              number="01"
              title="A new enrollment is created"
              description="The new package is created separately and linked to the previous enrollment through renewal_of."
            />

            <WorkflowStep
              number="02"
              title="A new contract is created"
              description="The renewal receives its own contract for review."
            />

            <WorkflowStep
              number="03"
              title="A new payment is created"
              description="The payment belongs only to this new enrollment and starts as pending."
            />

            <WorkflowStep
              number="04"
              title="The previous enrollment stays unchanged"
              description="Its status, contract, payment, schedule, and lessons remain untouched."
            />

            <WorkflowStep
              number="05"
              title="Payment is confirmed"
              description="Changing this payment from pending to paid activates only the new enrollment."
            />

            <WorkflowStep
              number="06"
              title="New lessons are generated"
              description="Lessons are generated only for this enrollment using its own start date, schedule, duration, and lesson count."
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* FINAL ACTIONS                                                     */}
        {/* ================================================================= */}

        <div
          className="
            mt-10
            flex
            flex-col-reverse
            gap-3
            border-t
            border-[#DCD8D2]
            pt-7
            sm:flex-row
            sm:items-center
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              rounded-full
              px-5
              py-2.5
              font-sans
              text-sm
              text-[#5F655F]
              transition-colors
              hover:text-[#6F8F72]
            "
          >
            Cancel
          </button>

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
    </div>
  );
}

/* ========================================================================== */
/* SECTION HEADING                                                            */
/* ========================================================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
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
        {eyebrow}
      </p>

      <h4
        className="
          mt-2
          font-serif
          text-[25px]
          font-normal
          tracking-[-0.02em]
          text-[#292929]
        "
      >
        {title}
      </h4>

      <p
        className="
          mt-2
          max-w-[620px]
          font-sans
          text-[13px]
          leading-6
          text-[#777771]
        "
      >
        {description}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* FIELD                                                                      */
/* ========================================================================== */

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

/* ========================================================================== */
/* WORKFLOW STEP                                                              */
/* ========================================================================== */

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
          pt-1
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
        <p
          className="
            font-serif
            text-[18px]
            text-[#292929]
          "
        >
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

/* ========================================================================== */
/* FORMATTERS                                                                 */
/* ========================================================================== */

function formatScheduleDays(days: string[]) {
  const labels: Record<string, string> = {
    mon: "Mon",
    monday: "Mon",
    tue: "Tue",
    tuesday: "Tue",
    wed: "Wed",
    wednesday: "Wed",
    thu: "Thu",
    thursday: "Thu",
    fri: "Fri",
    friday: "Fri",
    sat: "Sat",
    saturday: "Sat",
    sun: "Sun",
    sunday: "Sun",
  };

  return days
    .map((day) => {
      const normalized = day.toLowerCase().trim();

      return labels[normalized] || day;
    })
    .join(" · ");
}

function formatTime(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}