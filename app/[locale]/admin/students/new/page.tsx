import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface NewStudentPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    assessment?: string;
  }>;
}

interface AssessmentPrefillRow {
  id: string;
  learner_name: string;
  preferred_name: string | null;
  email: string;
  timezone: string;
  status: string;
  converted_student_id: string | null;
}

async function createStudent(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const locale = String(
    formData.get("locale") ?? "en"
  );

  const assessmentId = String(
    formData.get("assessment_id") ?? ""
  ).trim();

  const fullName = String(
    formData.get("full_name") ?? ""
  ).trim();

  const preferredName = String(
    formData.get("preferred_name") ?? ""
  ).trim();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const country = String(
    formData.get("country") ?? ""
  ).trim();

  const timezone = String(
    formData.get("timezone") ?? ""
  ).trim();

  const contactMethod = String(
    formData.get("contact_method") ?? ""
  ).trim();

  const preferredLanguage = String(
    formData.get("preferred_language") ?? ""
  ).trim();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (assessmentId) {
    const {
      data: assessment,
      error: assessmentError,
    } = await supabase
      .from("assessment_bookings")
      .select("id, converted_student_id")
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error(
        "Unable to verify assessment conversion:",
        assessmentError
      );
      throw new Error(
        "Unable to verify the assessment booking."
      );
    }

    if (assessment.converted_student_id) {
      redirect(
        `/${locale}/admin/students/${assessment.converted_student_id}`
      );
    }
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      full_name: fullName,
      preferred_name: preferredName || null,
      email: email || null,
      country: country || null,
      timezone: timezone || null,
      contact_method: contactMethod || null,
      preferred_language: preferredLanguage || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Unable to create student.");
  }

  if (assessmentId) {
    const { data: convertedAssessment, error: conversionError } =
      await supabase
        .from("assessment_bookings")
        .update({
          converted_student_id: data.id,
          converted_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)
        .is("converted_student_id", null)
        .select("id")
        .maybeSingle();

    if (conversionError || !convertedAssessment) {
      console.error(
        "Student was created but assessment conversion could not be recorded:",
        conversionError
      );

      await supabase
        .from("students")
        .delete()
        .eq("id", data.id);

      throw new Error(
        "Unable to complete assessment conversion."
      );
    }
  }

  redirect(`/${locale}/admin/students/${data.id}`);
}

export default async function NewStudentPage({
  params,
  searchParams,
}: NewStudentPageProps) {
  const { locale } = await params;
  const filters = await searchParams;
  const assessmentId =
    filters.assessment?.trim() ?? "";

  const supabase = await createClient();

  let assessment: AssessmentPrefillRow | null = null;

  if (assessmentId) {
    const {
      data: assessmentData,
      error: assessmentError,
    } = await supabase
      .from("assessment_bookings")
      .select(`
        id,
        learner_name,
        preferred_name,
        email,
        timezone,
        status,
        converted_student_id
      `)
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessmentError) {
      console.error(
        "Error loading assessment for student conversion:",
        assessmentError
      );

      throw new Error(
        "Unable to load assessment details."
      );
    }

    assessment =
      (assessmentData as AssessmentPrefillRow | null) ??
      null;

    if (assessment?.converted_student_id) {
      redirect(
        `/${locale}/admin/students/${assessment.converted_student_id}`
      );
    }
  }

  const convertingAssessment = Boolean(assessment);

  const countryByTimezone: Record<string, string> = {
    "Asia/Manila": "Philippines",
    "Asia/Seoul": "South Korea",
    "Asia/Tokyo": "Japan",
    "Asia/Shanghai": "China",
    "Asia/Ho_Chi_Minh": "Vietnam",
    "Asia/Kuala_Lumpur": "Malaysia",
    "Asia/Jakarta": "Indonesia",
    "Asia/Makassar": "Indonesia",
    "Asia/Jayapura": "Indonesia",
  };

  const prefilledCountry = assessment
    ? countryByTimezone[assessment.timezone] ?? ""
    : "";

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
        <div className="relative flex w-full items-center justify-between">
          <Link
            href={
              convertingAssessment
                ? `/${locale}/admin/assessments`
                : `/${locale}/admin/students`
            }
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]
              sm:text-[16px]
            "
          >
            {convertingAssessment
              ? "← Assessments"
              : "← Students"}
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

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
              font-sans
              text-[14px]
              text-[#5F655F]
              sm:gap-4
              sm:text-[15px]
            "
          >
            <span className="font-medium text-[#6F8F72]">
              EN
            </span>

            <span>한국어</span>
            <span>中文</span>
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
            text-center
            font-sans
            text-[14px]
            font-medium
            tracking-[0.02em]
            text-[#6F8F72]
            sm:hidden
          "
        >
          Hamkke │ 함께
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
          {convertingAssessment
            ? "Convert to Student"
            : "New Student"}
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
          {convertingAssessment
            ? "Review the assessment details, complete any missing information, and create the student record."
            : "Create a student record before setting up their lesson enrollment."}
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
          action={createStudent}
          className="space-y-12"
        >
          <input
            type="hidden"
            name="locale"
            value={locale}
          />

          {assessment && (
            <input
              type="hidden"
              name="assessment_id"
              value={assessment.id}
            />
          )}

          {assessment && (
            <div
              className="
                border-y
                border-[#DCD8D2]
                py-5
                font-serif
                text-[15px]
                leading-7
                text-[#66635D]
              "
            >
              This student record is being created from a
              completed Free Assessment. Assessment details
              have been prefilled where available. You can
              review or edit them before creating the student.
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div>
            <div
              className="
                mb-8
                flex
                items-center
                gap-4
              "
            >
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
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#6F8F72]
                "
              >
                01
              </div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  font-normal
                  tracking-[-0.02em]
                "
              >
                Student Information
              </h2>
            </div>

            <div className="space-y-7">
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="full_name"
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
                  Full Name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  defaultValue={assessment?.learner_name ?? ""}
                  placeholder="Student's full name"
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

              {/* PREFERRED NAME */}
              <div>
                <label
                  htmlFor="preferred_name"
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
                  Preferred Name
                </label>

                <input
                  id="preferred_name"
                  name="preferred_name"
                  type="text"
                  defaultValue={assessment?.preferred_name ?? ""}
                  placeholder="Name used during lessons"
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

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
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
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={assessment?.email ?? ""}
                  placeholder="student@example.com"
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
            </div>
          </div>

          {/* LOCATION & COMMUNICATION */}
          <div
            className="
              rounded-2xl
              bg-[#F0F4ED]
              p-6
              sm:p-8
            "
          >
            <div
              className="
                mb-8
                flex
                items-center
                gap-4
              "
            >
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
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#6F8F72]
                "
              >
                02
              </div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  font-normal
                  tracking-[-0.02em]
                "
              >
                Location & Communication
              </h2>
            </div>

            <div className="space-y-7">
              {/* COUNTRY */}
              <div>
                <label
                  htmlFor="country"
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
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue={prefilledCountry}
                  placeholder="South Korea"
                  className="
                    mt-3
                    w-full
                    border-b
                    border-[#C4CFC0]
                    bg-transparent
                    px-0
                    py-3
                    font-serif
                    text-[19px]
                    outline-none
                    placeholder:text-[#8F958D]
                    focus:border-[#6F8F72]
                  "
                />
              </div>

              {/* TIMEZONE */}
              <div>
                <label
                  htmlFor="timezone"
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
                  Timezone
                </label>

                <input
                  id="timezone"
                  name="timezone"
                  type="text"
                  defaultValue={assessment?.timezone ?? ""}
                  placeholder="Asia/Seoul"
                  className="
                    mt-3
                    w-full
                    border-b
                    border-[#C4CFC0]
                    bg-transparent
                    px-0
                    py-3
                    font-serif
                    text-[19px]
                    outline-none
                    placeholder:text-[#8F958D]
                    focus:border-[#6F8F72]
                  "
                />
              </div>

              {/* CONTACT METHOD */}
              <div>
                <label
                  htmlFor="contact_method"
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
                  Preferred Contact Method
                </label>

                <select
                  id="contact_method"
                  name="contact_method"
                  defaultValue=""
                  className="
                    mt-3
                    w-full
                    border-b
                    border-[#C4CFC0]
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
                  <option value="" disabled>
                    Select a method
                  </option>

                  <option value="kakao">
                    KakaoTalk
                  </option>

                  <option value="email">
                    Email
                  </option>

                  <option value="messenger">
                    Messenger
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* LANGUAGE */}
          <div>
            <div
              className="
                mb-8
                flex
                items-center
                gap-4
              "
            >
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
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#6F8F72]
                "
              >
                03
              </div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  font-normal
                  tracking-[-0.02em]
                "
              >
                Language
              </h2>
            </div>

            <div>
              <label
                htmlFor="preferred_language"
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
                Preferred Language
              </label>

              <input
                id="preferred_language"
                name="preferred_language"
                type="text"
                placeholder="Korean"
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
                  outline-none
                  placeholder:text-[#A09D96]
                  focus:border-[#6F8F72]
                "
              />
            </div>
          </div>

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
              href={
                convertingAssessment
                  ? `/${locale}/admin/assessments`
                  : `/${locale}/admin/students`
              }
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
              {convertingAssessment
                ? "Create Student"
                : "Create Student"}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <div className="mt-20">
          <p
            className="
              text-center
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            Hamkke │ 함께 · Private English Lessons
          </p>
        </div>
      </section>
    </main>
  );
}