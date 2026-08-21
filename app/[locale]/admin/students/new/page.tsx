"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function NewEnrollmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    preferredName: "",
    email: "",
    contactMethod: "",
    country: "",
    preferredLanguage: "",
    timezone: "",

    packageName: "20 Lessons",
    numberOfLessons: "20",
    lessonDuration: "25",
    lessonsPerWeek: "2",
    tuitionAmount: "130000",
    currency: "KRW",
    startDate: "",
    status: "pending",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      /*
       * STEP 1
       * Create the student
       */

      const { data: student, error: studentError } =
        await supabase
          .from("students")
          .insert({
            full_name: form.fullName.trim(),
            preferred_name:
              form.preferredName.trim() || null,
            email:
              form.email.trim() || null,
            contact_method:
              form.contactMethod.trim() || null,
            country:
              form.country.trim() || null,
            preferred_language:
              form.preferredLanguage.trim() || null,
            timezone:
              form.timezone.trim() || null,
          })
          .select("id")
          .single();

      if (studentError) {
        throw new Error(
          `Could not create student: ${studentError.message}`
        );
      }

      if (!student) {
        throw new Error(
          "Student was created, but no student ID was returned."
        );
      }

      /*
       * STEP 2
       * Create the enrollment
       */

      const { data: enrollment, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .insert({
            student_id: student.id,

            package_name:
              form.packageName.trim(),

            number_of_lessons:
              Number(form.numberOfLessons),

            lesson_duration:
              Number(form.lessonDuration),

            lessons_per_week:
              Number(form.lessonsPerWeek),

            tuition_amount:
              Number(form.tuitionAmount),

            currency:
              form.currency,

            start_date:
              form.startDate,

            status:
              form.status,
          })
          .select("id")
          .single();

      if (enrollmentError) {
        /*
         * The student already exists at this point.
         * We tell the user exactly what failed.
         */

        throw new Error(
          `Student was created, but the enrollment could not be created: ${enrollmentError.message}`
        );
      }

      if (!enrollment) {
        throw new Error(
          "Enrollment was created, but no enrollment ID was returned."
        );
      }

      /*
       * STEP 3
       * Go directly to the new student's page.
       *
       * This lets us immediately verify that:
       * - the student exists
       * - the enrollment exists
       * - the relationship between them works
       */

      router.push(
        `/en/admin/students/${student.id}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-6
        py-12
        text-[#292929]

        sm:px-8
        sm:py-16

        lg:px-10
        lg:py-20
      "
    >
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="
              font-sans
              text-[13px]
              font-medium
              text-[#6F8F72]
              transition
              hover:opacity-70
            "
          >
            ← Back
          </button>

          <p
            className="
              mt-8
              font-sans
              text-[14px]
              font-medium
              tracking-[0.02em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>

          <h1
            className="
              mt-5
              font-serif
              text-[48px]
              font-normal
              leading-tight
              tracking-[-0.03em]

              sm:text-[56px]
            "
          >
            New Enrollment
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              font-serif
              text-[20px]
              leading-8
              text-[#666]

              sm:text-[22px]
            "
          >
            Add a student and their enrollment
            details in one place.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8"
        >

          {/* STUDENT INFORMATION */}

          <section
            className="
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              p-7

              sm:p-9
            "
          >
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
                01
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[32px]
                  font-normal
                "
              >
                Student Information
              </h2>

              <p
                className="
                  mt-2
                  font-sans
                  text-[14px]
                  leading-6
                  text-[#666]
                "
              >
                Enter the student's information once.
                It will be connected to their enrollment.
              </p>
            </div>

            <div
              className="
                mt-8
                grid
                gap-6

                sm:grid-cols-2
              "
            >
              <Field
                label="Full name"
                required
              >
                <input
                  required
                  value={form.fullName}
                  onChange={(e) =>
                    updateField(
                      "fullName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Preferred name">
                <input
                  value={form.preferredName}
                  onChange={(e) =>
                    updateField(
                      "preferredName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Contact method">
                <input
                  placeholder="KakaoTalk, email, etc."
                  value={form.contactMethod}
                  onChange={(e) =>
                    updateField(
                      "contactMethod",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Country">
                <input
                  value={form.country}
                  onChange={(e) =>
                    updateField(
                      "country",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Preferred language">
                <input
                  placeholder="Korean, Chinese, etc."
                  value={form.preferredLanguage}
                  onChange={(e) =>
                    updateField(
                      "preferredLanguage",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Timezone">
                <input
                  placeholder="Asia/Seoul"
                  value={form.timezone}
                  onChange={(e) =>
                    updateField(
                      "timezone",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* ENROLLMENT DETAILS */}

          <section
            className="
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              p-7

              sm:p-9
            "
          >
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
                02
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[32px]
                  font-normal
                "
              >
                Enrollment Details
              </h2>

              <p
                className="
                  mt-2
                  font-sans
                  text-[14px]
                  leading-6
                  text-[#666]
                "
              >
                Set the student's current lesson package
                and enrollment terms.
              </p>
            </div>

            <div
              className="
                mt-8
                grid
                gap-6

                sm:grid-cols-2
              "
            >
              <Field
                label="Package"
                required
              >
                <input
                  required
                  value={form.packageName}
                  onChange={(e) =>
                    updateField(
                      "packageName",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Number of lessons"
                required
              >
                <input
                  required
                  type="number"
                  min="1"
                  value={form.numberOfLessons}
                  onChange={(e) =>
                    updateField(
                      "numberOfLessons",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Lesson duration (minutes)"
                required
              >
                <input
                  required
                  type="number"
                  min="1"
                  value={form.lessonDuration}
                  onChange={(e) =>
                    updateField(
                      "lessonDuration",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Lessons per week"
                required
              >
                <input
                  required
                  type="number"
                  min="1"
                  value={form.lessonsPerWeek}
                  onChange={(e) =>
                    updateField(
                      "lessonsPerWeek",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Tuition amount"
                required
              >
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.tuitionAmount}
                  onChange={(e) =>
                    updateField(
                      "tuitionAmount",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Currency"
                required
              >
                <select
                  required
                  value={form.currency}
                  onChange={(e) =>
                    updateField(
                      "currency",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="KRW">
                    KRW
                  </option>

                  <option value="USD">
                    USD
                  </option>

                  <option value="CNY">
                    CNY
                  </option>
                </select>
              </Field>

              <Field
                label="Start date"
                required
              >
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    updateField(
                      "startDate",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Status"
                required
              >
                <select
                  required
                  value={form.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="paused">
                    Paused
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>
              </Field>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div
              className="
                rounded-2xl
                border
                border-[#E7CFC8]
                bg-[#F8ECE8]
                px-5
                py-4
                font-sans
                text-[14px]
                leading-6
                text-[#8A5148]
              "
            >
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <div
            className="
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                max-w-md
                font-sans
                text-[13px]
                leading-6
                text-[#777]
              "
            >
              This will create the student and their
              enrollment together.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-full
                bg-[#6F8F72]
                px-8
                py-3.5
                font-sans
                text-[14px]
                font-medium
                text-white
                transition
                hover:bg-[#5F7F63]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Creating..."
                : "Create Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="
          font-sans
          text-[12px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#6F8F72]
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-[#A66A5B]">
            *
          </span>
        )}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

const inputClass = `
  w-full
  rounded-xl
  border
  border-[#D8CCBE]
  bg-[#FAF8F5]
  px-4
  py-3
  font-sans
  text-[15px]
  text-[#292929]
  outline-none
  transition
  placeholder:text-[#999]
  focus:border-[#6F8F72]
  focus:ring-2
  focus:ring-[#E2EBDD]
`;