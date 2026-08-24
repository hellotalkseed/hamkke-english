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
      {/* RENEW BUTTON */}
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

      {/* RENEWAL FORM */}
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
                "
              >
                Renew Enrollment
              </h3>

              <p
                className="
                  mt-2
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#777771]
                "
              >
                Create a new enrollment while keeping this
                student&apos;s previous enrollment history intact.
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
            className="mt-8 space-y-6"
          >
            {/* ---------------------------------------------------------------- */}
            {/* HIDDEN RENEWAL DATA                                             */}
            {/* ---------------------------------------------------------------- */}

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

            {/* PACKAGE */}
            <div>
              <label
                htmlFor="package_name"
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#6F8F72]
                "
              >
                Package
              </label>

              <input
                id="package_name"
                name="package_name"
                type="text"
                required
                defaultValue={packageName}
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
                  outline-none
                  focus:border-[#6F8F72]
                "
              />
            </div>

            {/* LESSON DETAILS */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* NUMBER OF LESSONS */}
              <div>
                <label
                  htmlFor="number_of_lessons"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Number of lessons
                </label>

                <input
                  id="number_of_lessons"
                  name="number_of_lessons"
                  type="number"
                  min="1"
                  required
                  defaultValue={numberOfLessons}
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
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>

              {/* LESSON DURATION */}
              <div>
                <label
                  htmlFor="lesson_duration"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Lesson duration
                </label>

                <input
                  id="lesson_duration"
                  name="lesson_duration"
                  type="number"
                  min="1"
                  required
                  defaultValue={lessonDuration ?? ""}
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
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>
            </div>

            {/* FREQUENCY + START DATE */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* LESSONS PER WEEK */}
              <div>
                <label
                  htmlFor="lessons_per_week"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Lessons per week
                </label>

                <input
                  id="lessons_per_week"
                  name="lessons_per_week"
                  type="number"
                  min="1"
                  required
                  defaultValue={lessonsPerWeek ?? ""}
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
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>

              {/* START DATE */}
              <div>
                <label
                  htmlFor="start_date"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  Start date
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
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
                    outline-none
                    focus:border-[#6F8F72]
                  "
                />
              </div>
            </div>

            {/* SCHEDULE */}
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
                Schedule
              </p>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {/* DAYS */}
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
                    Days
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["monday", "Mon"],
                      ["tuesday", "Tue"],
                      ["wednesday", "Wed"],
                      ["thursday", "Thu"],
                      ["friday", "Fri"],
                      ["saturday", "Sat"],
                      ["sunday", "Sun"],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className="cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="schedule_days"
                          value={value}
                          defaultChecked={
                            scheduleDays?.some(
                              (day) =>
                                day.toLowerCase() === value
                            ) ?? false
                          }
                          className="peer sr-only"
                        />

                        <span
                          className="
                            inline-flex
                            rounded-full
                            border
                            border-[#DCD8D2]
                            bg-[#FAF8F5]
                            px-4
                            py-2
                            font-sans
                            text-[12px]
                            text-[#777771]
                            transition-colors
                            peer-checked:border-[#6F8F72]
                            peer-checked:bg-[#E2EBDD]
                            peer-checked:text-[#5F655F]
                          "
                        >
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* TIME */}
                <div>
                  <label
                    htmlFor="schedule_time"
                    className="
                      font-sans
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[#6F8F72]
                    "
                  >
                    Time
                  </label>

                  <input
                    id="schedule_time"
                    name="schedule_time"
                    type="time"
                    defaultValue={scheduleTime ?? ""}
                    className="
                      mt-3
                      w-full
                      rounded-xl
                      border
                      border-[#DCD8D2]
                      bg-[#FAF8F5]
                      px-4
                      py-3
                      font-sans
                      text-sm
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  />
                </div>
              </div>

              <p
                className="
                  mt-3
                  font-sans
                  text-[12px]
                  leading-5
                  text-[#8A8A84]
                "
              >
                The current schedule is pre-filled, but you can
                change it for this renewal.
              </p>
            </div>

            {/* PAYMENT */}
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
                Payment
              </p>

              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {/* TUITION AMOUNT */}
                <div>
                  <label
                    htmlFor="tuition_amount"
                    className="
                      font-sans
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[#6F8F72]
                    "
                  >
                    Tuition amount
                  </label>

                  <input
                    id="tuition_amount"
                    name="tuition_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={tuitionAmount}
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
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  />
                </div>

                {/* CURRENCY */}
                <div>
                  <label
                    htmlFor="currency"
                    className="
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
                    id="currency"
                    name="currency"
                    required
                    defaultValue={currency}
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
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  >
                    <option value="KRW">KRW</option>
                    <option value="PHP">PHP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                {/* PAYMENT METHOD */}
                <div>
                  <label
                    htmlFor="payment_method"
                    className="
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
                    id="payment_method"
                    name="payment_method"
                    required
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
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  >
                    <option value="" disabled>
                      Select payment method
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

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <p
                className="
                  mt-3
                  font-sans
                  text-[12px]
                  leading-5
                  text-[#8A8A84]
                "
              >
                Payment remains pending until you confirm that
                the student&apos;s payment has been received.
              </p>
            </div>

            {/* ACTIONS */}
            <div
              className="
                flex
                justify-end
                border-t
                border-[#E2DED7]
                pt-6
              "
            >
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