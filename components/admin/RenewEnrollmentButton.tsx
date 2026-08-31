"use client";

import { useState } from "react";

export default function RenewEnrollmentButton({
  studentId,
  enrollmentId,
  locale,
  packageName,
  numberOfLessons,
  lessonDuration,
  lessonsPerWeek,
  scheduleDays,
  scheduleTime,
  tuitionAmount,
  currency,
}: {
  studentId: string;
  enrollmentId: string;
  locale: string;
  packageName: string;
  numberOfLessons: number;
  lessonDuration: number | null;
  lessonsPerWeek: number | null;
  scheduleDays: string[] | null;
  scheduleTime: string | null;
  tuitionAmount: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          inline-flex
          items-center
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

      {open && (
        <div
          className="
            mt-8
            rounded-2xl
            border
            border-[#DCD8D2]
            bg-white
            p-6
            sm:p-8
          "
        >
          {/* HEADER */}
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
                  text-[#292929]
                "
              >
                Renew Enrollment
              </h3>

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
                Create a new enrollment while keeping the
                previous enrollment and its lessons unchanged.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                shrink-0
                font-sans
                text-sm
                text-[#777771]
                transition-colors
                hover:text-[#292929]
              "
            >
              Cancel
            </button>
          </div>

          <form
            method="POST"
            action={`/api/admin/students/${studentId}/enrollments`}
            className="mt-8 space-y-8"
          >
            {/* ============================================================ */}
            {/* HIDDEN WORKFLOW VALUES                                      */}
            {/* ============================================================ */}

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

            {/* ============================================================ */}
            {/* PACKAGE                                                      */}
            {/* ============================================================ */}

            <section>
              <SectionHeading
                eyebrow="Package"
                title="Lesson package"
                description="The previous package is copied here. You can change any details for the new enrollment."
              />

              <div className="mt-6 space-y-6">
                <Field
                  label="Package"
                  id="renewal_package_name"
                  name="package_name"
                  type="text"
                  required
                  defaultValue={packageName}
                />

                <div className="grid gap-6 sm:grid-cols-3">
                  <Field
                    label="Number of lessons"
                    id="renewal_number_of_lessons"
                    name="number_of_lessons"
                    type="number"
                    min="1"
                    required
                    defaultValue={String(numberOfLessons)}
                  />

                  <Field
                    label="Lesson duration"
                    id="renewal_lesson_duration"
                    name="lesson_duration"
                    type="number"
                    min="1"
                    required
                    defaultValue={String(
                      lessonDuration ?? 25
                    )}
                  />

                  <Field
                    label="Lessons per week"
                    id="renewal_lessons_per_week"
                    name="lessons_per_week"
                    type="number"
                    min="1"
                    required
                    defaultValue={String(
                      lessonsPerWeek ?? 3
                    )}
                  />
                </div>

                <Field
                  label="Start date"
                  id="renewal_start_date"
                  name="start_date"
                  type="date"
                  required
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* SCHEDULE                                                     */}
            {/* ============================================================ */}

            <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
              <SectionHeading
                eyebrow="Schedule"
                title="Lesson schedule"
                description="The current schedule is copied into the renewal. You can change it without affecting the previous enrollment."
              />

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
                  Lesson days
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
                        defaultChecked={
                          scheduleDays?.some(
                            (day) =>
                              day.toLowerCase() ===
                              value
                          ) ?? false
                        }
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

              <div className="mt-7">
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
                  Lesson time
                </label>

                <input
                  id="renewal_schedule_time"
                  name="schedule_time"
                  type="time"
                  defaultValue={scheduleTime ?? ""}
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-[#DCD8D2]
                    bg-white
                    px-4
                    py-3
                    font-sans
                    text-sm
                    text-[#292929]
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* PAYMENT                                                      */}
            {/* ============================================================ */}

            <section>
              <SectionHeading
                eyebrow="Payment"
                title="Renewal payment"
                description="This payment belongs only to the new enrollment. It remains pending until payment is confirmed."
              />

              <div className="mt-7 space-y-6">
                {/* TUITION */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Tuition amount"
                    id="renewal_tuition_amount"
                    name="tuition_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={String(
                      tuitionAmount ?? 0
                    )}
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
                        tracking-[0.12em]
                        text-[#6F8F72]
                      "
                    >
                      Currency
                    </label>

                    <select
                      id="renewal_currency"
                      name="currency"
                      required
                      defaultValue={currency || "KRW"}
                      className="
                        mt-2
                        w-full
                        rounded-xl
                        border
                        border-[#DCD8D2]
                        bg-[#FAF8F5]
                        px-4
                        py-3
                        font-sans
                        text-sm
                        text-[#292929]
                        outline-none
                        focus:border-[#6F8F72]
                      "
                    >
                      <option value="KRW">KRW</option>
                      <option value="PHP">PHP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                {/* PHP AMOUNT */}
                <Field
                  label="PHP amount received"
                  id="renewal_amount_php"
                  name="amount_php"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                />

                <p
                  className="
                    -mt-3
                    font-sans
                    text-[12px]
                    leading-5
                    text-[#8A8A84]
                  "
                >
                  Enter the actual PHP amount received if the
                  payment was converted from another currency.
                </p>

                {/* PAYMENT METHOD */}
                <div>
                  <label
                    htmlFor="renewal_payment_method"
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
                    Payment method
                  </label>

                  <select
                    id="renewal_payment_method"
                    name="payment_method"
                    defaultValue=""
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-[#DCD8D2]
                      bg-[#FAF8F5]
                      px-4
                      py-3
                      font-sans
                      text-sm
                      text-[#292929]
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  >
                    <option value="">
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

                {/* REFERENCE */}
                <Field
                  label="Reference number"
                  id="renewal_reference"
                  name="reference"
                  type="text"
                  placeholder="Optional"
                />

                {/* PAYMENT DATE */}
                <Field
                  label="Payment date"
                  id="renewal_payment_date"
                  name="payment_date"
                  type="date"
                />

                {/* INFO */}
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
                    The payment is created as{" "}
                    <strong className="font-medium">
                      pending
                    </strong>
                    . Confirming the payment later will
                    activate only this renewal enrollment and
                    generate its lessons.
                  </p>
                </div>
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

              <div className="mt-6 space-y-5">
                <WorkflowStep
                  number="01"
                  title="A new enrollment is created"
                  description="The renewal is created separately from the previous enrollment."
                />

                <WorkflowStep
                  number="02"
                  title="A new contract is created"
                  description="The new enrollment receives its own contract."
                />

                <WorkflowStep
                  number="03"
                  title="Payment remains pending"
                  description="The payment is linked only to this new enrollment."
                />

                <WorkflowStep
                  number="04"
                  title="Payment is confirmed"
                  description="Confirming payment changes this enrollment to active."
                />

                <WorkflowStep
                  number="05"
                  title="New lessons are generated"
                  description="Lessons are generated from this enrollment's own start date, schedule, duration, and lesson count."
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/* ACTIONS                                                       */}
            {/* ============================================================ */}

            <div
              className="
                flex
                justify-end
                gap-3
                border-t
                border-[#E2DED7]
                pt-6
              "
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  rounded-full
                  px-5
                  py-3
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
      )}
    </>
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
          mt-2
          w-full
          rounded-xl
          border
          border-[#DCD8D2]
          bg-[#FAF8F5]
          px-4
          py-3
          font-sans
          text-sm
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