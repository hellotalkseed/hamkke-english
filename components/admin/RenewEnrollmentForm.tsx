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
    <div className="mt-8 rounded-2xl border border-[#D8E1D3] bg-white/50 p-6 sm:p-8">
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
          Renew Enrollment
        </p>

        <h3 className="mt-2 font-serif text-[25px]">
          Create a new lesson package
        </h3>

        <p className="mt-2 max-w-[560px] font-sans text-[13px] leading-6 text-[#777771]">
          The previous enrollment has been carried over.
          Change anything that needs updating.
        </p>
      </div>

      <form
        action={`/api/admin/students/${studentId}/enrollments`}
        method="POST"
        className="mt-8 space-y-7"
      >
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

        <Field
          label="Package Name"
          id="renewal_package_name"
          name="package_name"
          type="text"
          defaultValue={packageName}
          required
        />

        <Field
          label="Number of Lessons"
          id="renewal_number_of_lessons"
          name="number_of_lessons"
          type="number"
          defaultValue={String(numberOfLessons)}
          min="1"
          required
        />

        <Field
          label="Lesson Duration"
          id="renewal_lesson_duration"
          name="lesson_duration"
          type="number"
          defaultValue={String(lessonDuration ?? 25)}
          min="1"
          required
        />

        <Field
          label="Lessons Per Week"
          id="renewal_lessons_per_week"
          name="lessons_per_week"
          type="number"
          defaultValue={String(lessonsPerWeek ?? 3)}
          min="1"
          required
        />

        <Field
          label="Start Date"
          id="renewal_start_date"
          name="start_date"
          type="date"
          required
        />

        <Field
          label="Tuition Amount"
          id="renewal_tuition_amount"
          name="tuition_amount"
          type="number"
          defaultValue={String(tuitionAmount ?? 2940)}
          min="0"
          step="0.01"
          required
        />

        <div>
          <label
            htmlFor="renewal_currency"
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
            id="renewal_currency"
            name="currency"
            defaultValue={currency || "KRW"}
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

        <div>
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
                scheduleDays?.includes(value) ?? false;

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
                    className="h-4 w-4 accent-[#6F8F72]"
                  />

                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
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
          />
        </div>

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-[#DCD8D2]
            pt-7
            sm:flex-row
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
              px-6
              py-2.5
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

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  id,
  name,
  type,
  defaultValue,
  min,
  step,
  required,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
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
          focus:border-[#6F8F72]
        "
      />
    </div>
  );
}