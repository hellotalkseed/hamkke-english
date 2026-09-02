import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface ScheduleTimes {
  [day: string]: string;
}

interface Participant {
  studentId: string;
  scheduleDays: string[];
  scheduleTime: string | null;
  scheduleTimes: ScheduleTimes;
}

interface DatabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const VALID_DAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

const VALID_PAYMENT_METHODS = [
  "pending",
  "bank_transfer",
  "paypal",
  "gcash",
  "cash",
  "other",
] as const;

type ValidDay = (typeof VALID_DAYS)[number];

/*
 * enrollment_schedules.day_of_week
 *
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 */
const DAY_TO_NUMBER: Record<ValidDay, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/* ========================================================================== */
/* BASIC HELPERS                                                              */
/* ========================================================================== */

function getString(
  formData: FormData,
  name: string
): string {
  const value = formData.get(name);

  if (value === null) {
    return "";
  }

  return String(value).trim();
}

function getNumber(
  formData: FormData,
  ...names: string[]
): number {
  for (const name of names) {
    const value = formData.get(name);

    if (value === null) {
      continue;
    }

    const text = String(value).trim();

    if (!text) {
      continue;
    }

    const cleaned = text
      .replace(/,/g, "")
      .replace(/[₩₱$]/g, "")
      .trim();

    const parsed = Number(cleaned);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return NaN;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    value
  );
}

/*
 * PostgreSQL TIME values can be returned as:
 *
 *   19:30
 *   19:30:00
 *
 * HTML time inputs normally send:
 *
 *   19:30
 *
 * Normalize both formats to HH:MM before comparing.
 */
function normalizeTime(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  return text.slice(0, 5);
}

function databaseErrorResponse(
  message: string,
  error: DatabaseError | null
) {
  console.error(message, error);

  return new NextResponse(
    `${message}

Code: ${error?.code || "unknown"}

Message: ${error?.message || "unknown"}

Details: ${error?.details || "none"}

Hint: ${error?.hint || "none"}`,
    {
      status: 500,
    }
  );
}

/* ========================================================================== */
/* SCHEDULE DAYS                                                              */
/* ========================================================================== */

function normalizeScheduleDays(
  values: unknown[]
): string[] {
  const normalized: string[] = [];

  const aliases: Record<string, string> = {
    monday: "mon",
    tuesday: "tue",
    wednesday: "wed",
    thursday: "thu",
    friday: "fri",
    saturday: "sat",
    sunday: "sun",
  };

  for (const value of values) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    let rawValues: unknown[] = [];

    if (Array.isArray(value)) {
      rawValues = value;
    } else {
      const text = String(value).trim();

      if (!text) {
        continue;
      }

      if (
        text.startsWith("[") &&
        text.endsWith("]")
      ) {
        try {
          const parsed = JSON.parse(text);

          if (Array.isArray(parsed)) {
            rawValues = parsed;
          } else {
            rawValues = [text];
          }
        } catch {
          rawValues = [text];
        }
      } else {
        rawValues = [text];
      }
    }

    for (const rawValue of rawValues) {
      const text = String(rawValue).trim();

      if (!text) {
        continue;
      }

      for (const splitValue of text.split(",")) {
        const day = splitValue
          .trim()
          .toLowerCase();

        if (!day) {
          continue;
        }

        const normalizedDay =
          aliases[day] || day;

        if (
          VALID_DAYS.includes(
            normalizedDay as ValidDay
          )
        ) {
          normalized.push(normalizedDay);
        }
      }
    }
  }

  return Array.from(
    new Set(normalized)
  ).sort(
    (a, b) =>
      VALID_DAYS.indexOf(
        a as ValidDay
      ) -
      VALID_DAYS.indexOf(
        b as ValidDay
      )
  );
}

function getScheduleDays(
  formData: FormData,
  name: string
): string[] {
  return normalizeScheduleDays(
    formData.getAll(name)
  );
}

/* ========================================================================== */
/* INDIVIDUAL SCHEDULE TIMES                                                  */
/* ========================================================================== */

function getIndividualScheduleTimes(
  formData: FormData,
  scheduleDays: string[]
): ScheduleTimes {
  const scheduleTimes: ScheduleTimes = {};

  /*
   * JSON representation.
   */
  const jsonValue = getString(
    formData,
    "schedule_times"
  );

  if (jsonValue) {
    try {
      const parsed = JSON.parse(jsonValue);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        for (const day of VALID_DAYS) {
          const value = parsed[day];

          if (
            typeof value === "string" &&
            value.trim()
          ) {
            scheduleTimes[day] =
              normalizeTime(value);
          }
        }
      }
    } catch {
      // Ignore malformed JSON.
    }
  }

  /*
   * Day-specific fields.
   */
  for (const day of VALID_DAYS) {
    const possibleNames = [
      `schedule_time_${day}`,
      `schedule_times_${day}`,
    ];

    for (const name of possibleNames) {
      const value = getString(
        formData,
        name
      );

      if (value) {
        scheduleTimes[day] =
          normalizeTime(value);
        break;
      }
    }
  }

  /*
   * Legacy single-time support.
   */
  const legacyTime = normalizeTime(
    getString(
      formData,
      "schedule_time"
    )
  );

  if (legacyTime) {
    for (const day of scheduleDays) {
      if (!scheduleTimes[day]) {
        scheduleTimes[day] =
          legacyTime;
      }
    }
  }

  /*
   * Keep only selected days.
   */
  const filtered: ScheduleTimes = {};

  for (const day of scheduleDays) {
    if (scheduleTimes[day]) {
      filtered[day] =
        normalizeTime(
          scheduleTimes[day]
        );
    }
  }

  return filtered;
}

/* ========================================================================== */
/* PARTICIPANT SCHEDULE                                                       */
/* ========================================================================== */

function getParticipantScheduleDays(
  formData: FormData,
  studentId: string
): string[] {
  const possibleNames = [
    `schedule_days_${studentId}`,
    `participant_schedule_days_${studentId}`,
    `schedule_days[${studentId}]`,
  ];

  for (const name of possibleNames) {
    const values =
      formData.getAll(name);

    if (values.length === 0) {
      continue;
    }

    const days =
      normalizeScheduleDays(values);

    if (days.length > 0) {
      return days;
    }
  }

  return [];
}

function getParticipantScheduleTimes(
  formData: FormData,
  studentId: string,
  scheduleDays: string[]
): ScheduleTimes {
  const scheduleTimes: ScheduleTimes = {};

  /*
   * JSON representation.
   */
  const jsonNames = [
    `schedule_times_${studentId}`,
    `participant_schedule_times_${studentId}`,
    `schedule_times[${studentId}]`,
  ];

  for (const name of jsonNames) {
    const value = getString(
      formData,
      name
    );

    if (!value) {
      continue;
    }

    try {
      const parsed = JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        for (const day of scheduleDays) {
          const time = parsed[day];

          if (
            typeof time === "string" &&
            time.trim()
          ) {
            scheduleTimes[day] =
              normalizeTime(time);
          }
        }
      }
    } catch {
      // Ignore malformed JSON.
    }
  }

  /*
   * Day-specific fields.
   */
  for (const day of scheduleDays) {
    const possibleNames = [
      `schedule_time_${studentId}_${day}`,
      `participant_schedule_time_${studentId}_${day}`,
      `schedule_times_${studentId}_${day}`,
      `schedule_time[${studentId}][${day}]`,
    ];

    for (const name of possibleNames) {
      const value = getString(
        formData,
        name
      );

      if (value) {
        scheduleTimes[day] =
          normalizeTime(value);
        break;
      }
    }
  }

  /*
   * Legacy participant single time.
   */
  const legacyNames = [
    `schedule_time_${studentId}`,
    `participant_schedule_time_${studentId}`,
    `schedule_time[${studentId}]`,
  ];

  let legacyTime = "";

  for (const name of legacyNames) {
    const value = getString(
      formData,
      name
    );

    if (value) {
      legacyTime =
        normalizeTime(value);
      break;
    }
  }

  if (legacyTime) {
    for (const day of scheduleDays) {
      if (!scheduleTimes[day]) {
        scheduleTimes[day] =
          legacyTime;
      }
    }
  }

  return scheduleTimes;
}

/* ========================================================================== */
/* LEGACY SCHEDULE TIME                                                       */
/* ========================================================================== */

function getLegacyScheduleTimeValue(
  scheduleDays: string[],
  scheduleTimes: ScheduleTimes
): string | null {
  if (scheduleDays.length === 0) {
    return null;
  }

  const firstTime =
    normalizeTime(
      scheduleTimes[scheduleDays[0]]
    );

  if (!firstTime) {
    return null;
  }

  const allSame =
    scheduleDays.every(
      (day) =>
        normalizeTime(
          scheduleTimes[day]
        ) === firstTime
    );

  return allSame
    ? firstTime
    : null;
}

/* ========================================================================== */
/* STUDENT IDS                                                                */
/* ========================================================================== */

function normalizeStudentIds(
  formData: FormData
): string[] {
  const values = [
    ...formData.getAll("student_ids"),
    ...formData.getAll("student_id"),
  ];

  return Array.from(
    new Set(
      values
        .map((value) =>
          String(value).trim()
        )
        .filter(Boolean)
    )
  );
}

/* ========================================================================== */
/* VALIDATION                                                                 */
/* ========================================================================== */

function validateScheduleTimes(
  scheduleDays: string[],
  scheduleTimes: ScheduleTimes,
  studentLabel: string
): string | null {
  if (scheduleDays.length === 0) {
    return `At least one lesson day is required for ${studentLabel}.`;
  }

  for (const day of scheduleDays) {
    const time = normalizeTime(
      scheduleTimes[day]
    );

    if (!time) {
      return `Lesson time is required for ${studentLabel} on ${day}.`;
    }

    if (!isValidTime(time)) {
      return `Lesson time for ${studentLabel} on ${day} must use HH:MM format.`;
    }
  }

  return null;
}

/* ========================================================================== */
/* BUILD ENROLLMENT SCHEDULE ROWS                                             */
/* ========================================================================== */

function buildEnrollmentScheduleRows(
  enrollmentId: string,
  participants: Participant[]
) {
  return participants.flatMap(
    (participant) =>
      participant.scheduleDays.map(
        (day) => ({
          enrollment_id:
            enrollmentId,

          student_id:
            participant.studentId,

          day_of_week:
            DAY_TO_NUMBER[
              day as ValidDay
            ],

          schedule_time:
            normalizeTime(
              participant
                .scheduleTimes[day]
            ),
        })
      )
  );
}

/* ========================================================================== */
/* POST                                                                       */
/* ========================================================================== */

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  /* ======================================================================== */
  /* BASIC VALIDATION                                                         */
  /* ======================================================================== */

  if (!isValidUuid(id)) {
    return new NextResponse(
      "Invalid student ID.",
      {
        status: 400,
      }
    );
  }

  const formData =
    await request.formData();

  const locale =
    getString(
      formData,
      "locale"
    ) || "en";

  /* ======================================================================== */
  /* ENROLLMENT TYPE                                                          */
  /* ======================================================================== */

  const enrollmentType =
    (
      getString(
        formData,
        "enrollment_type"
      ) || "individual"
    ).toLowerCase();

  if (
    enrollmentType !==
      "individual" &&
    enrollmentType !==
      "shared"
  ) {
    return new NextResponse(
      "Invalid enrollment type.",
      {
        status: 400,
      }
    );
  }

  const isShared =
    enrollmentType === "shared";

  /* ======================================================================== */
  /* STUDENTS                                                                 */
  /* ======================================================================== */

  let studentIds =
    normalizeStudentIds(
      formData
    );

  if (!isShared) {
    studentIds = [id];
  }

  if (
    isShared &&
    !studentIds.includes(id)
  ) {
    studentIds.unshift(id);
  }

  studentIds =
    Array.from(
      new Set(studentIds)
    );

  if (
    studentIds.length === 0
  ) {
    return new NextResponse(
      "At least one student is required.",
      {
        status: 400,
      }
    );
  }

  if (
    isShared &&
    studentIds.length < 2
  ) {
    return new NextResponse(
      "A shared enrollment requires at least two students.",
      {
        status: 400,
      }
    );
  }

  if (
    studentIds.some(
      (studentId) =>
        !isValidUuid(studentId)
    )
  ) {
    return new NextResponse(
      "One or more student IDs are invalid.",
      {
        status: 400,
      }
    );
  }

  /* ======================================================================== */
  /* ENROLLMENT DETAILS                                                       */
  /* ======================================================================== */

  const packageName =
    getString(
      formData,
      "package_name"
    );

  const numberOfLessons =
    getNumber(
      formData,
      "number_of_lessons"
    );

  const lessonDuration =
    getNumber(
      formData,
      "lesson_duration"
    );

  const startDate =
    getString(
      formData,
      "start_date"
    );

  /* ======================================================================== */
  /* TUITION                                                                  */
  /* ======================================================================== */

  const tuitionAmountKrw =
    getNumber(
      formData,
      "tuition_amount_krw",
      "tuition_amount",
      "amount_krw"
    );

  const tuitionAmountPhp =
    getNumber(
      formData,
      "tuition_amount_php",
      "php_amount",
      "amount_php"
    );

  /* ======================================================================== */
  /* PAYMENT                                                                  */
  /* ======================================================================== */

  const submittedPaymentDate =
    getString(
      formData,
      "payment_date"
    );

  /*
   * payments.payment_date is NOT NULL.
   *
   * If the payment has not actually been made yet
   * and the form leaves the field blank, we still need
   * a database value.
   *
   * We use today's date as the date the pending
   * payment record was created.
   */
  const paymentDate =
    submittedPaymentDate &&
    isValidDate(
      submittedPaymentDate
    )
      ? submittedPaymentDate
      : new Date()
          .toISOString()
          .slice(0, 10);

  const paymentMethod =
    (
      getString(
        formData,
        "payment_method"
      ) || "pending"
    ).toLowerCase();

  if (
    !VALID_PAYMENT_METHODS.includes(
      paymentMethod as (typeof VALID_PAYMENT_METHODS)[number]
    )
  ) {
    return new NextResponse(
      "Invalid payment method.",
      {
        status: 400,
      }
    );
  }

  const reference =
    getString(
      formData,
      "payment_reference"
    ) ||
    getString(
      formData,
      "reference"
    ) ||
    null;

  /*
   * New enrollments always begin with
   * a pending payment.
   */
  const paymentStatus =
    "pending";

  /* ======================================================================== */
  /* RENEWAL                                                                  */
  /* ======================================================================== */

  const renewalOf =
    getString(
      formData,
      "renewal_of"
    ) || null;

  if (
    renewalOf &&
    !isValidUuid(renewalOf)
  ) {
    return new NextResponse(
      "Invalid previous enrollment ID.",
      {
        status: 400,
      }
    );
  }

  /* ======================================================================== */
  /* BUILD INDIVIDUAL SCHEDULE                                                */
  /* ======================================================================== */

  const individualScheduleDays =
    getScheduleDays(
      formData,
      "schedule_days"
    );

  const individualScheduleTimes =
    getIndividualScheduleTimes(
      formData,
      individualScheduleDays
    );

  const individualLegacyScheduleTime =
    getLegacyScheduleTimeValue(
      individualScheduleDays,
      individualScheduleTimes
    );

  /* ======================================================================== */
  /* BUILD PARTICIPANT SCHEDULES                                              */
  /* ======================================================================== */

  const participants: Participant[] =
    studentIds.map(
      (studentId) => {
        if (!isShared) {
          return {
            studentId,

            scheduleDays:
              individualScheduleDays,

            scheduleTime:
              individualLegacyScheduleTime,

            scheduleTimes:
              individualScheduleTimes,
          };
        }

        const scheduleDays =
          getParticipantScheduleDays(
            formData,
            studentId
          );

        const scheduleTimes =
          getParticipantScheduleTimes(
            formData,
            studentId,
            scheduleDays
          );

        const legacyScheduleTime =
          getLegacyScheduleTimeValue(
            scheduleDays,
            scheduleTimes
          );

        return {
          studentId,

          scheduleDays,

          scheduleTime:
            legacyScheduleTime,

          scheduleTimes,
        };
      }
    );

  /* ======================================================================== */
  /* VALIDATE SCHEDULES                                                       */
  /* ======================================================================== */

  for (const participant of participants) {
    const studentLabel =
      isShared
        ? `student ${participant.studentId}`
        : "this student";

    const scheduleError =
      validateScheduleTimes(
        participant.scheduleDays,
        participant.scheduleTimes,
        studentLabel
      );

    if (scheduleError) {
      return new NextResponse(
        scheduleError,
        {
          status: 400,
        }
      );
    }
  }

  /* ======================================================================== */
  /* DERIVE LESSONS PER WEEK                                                  */
  /* ======================================================================== */

  const lessonsPerWeek =
    isShared
      ? Math.max(
          ...participants.map(
            (participant) =>
              participant
                .scheduleDays
                .length
          ),
          0
        )
      : individualScheduleDays.length;

  if (
    lessonsPerWeek < 1
  ) {
    return new NextResponse(
      "At least one lesson day is required.",
      {
        status: 400,
      }
    );
  }

  /* ======================================================================== */
  /* OTHER VALIDATION                                                         */
  /* ======================================================================== */

  if (!packageName) {
    return new NextResponse(
      "Package name is required.",
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isInteger(
      numberOfLessons
    ) ||
    numberOfLessons < 1
  ) {
    return new NextResponse(
      "Number of lessons must be at least 1.",
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isInteger(
      lessonDuration
    ) ||
    lessonDuration < 1
  ) {
    return new NextResponse(
      "Lesson duration must be at least 1 minute.",
      {
        status: 400,
      }
    );
  }

  if (!startDate) {
    return new NextResponse(
      "Lesson start date is required.",
      {
        status: 400,
      }
    );
  }

  if (!isValidDate(startDate)) {
    return new NextResponse(
      "Start date must use a valid YYYY-MM-DD date.",
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isFinite(
      tuitionAmountKrw
    ) ||
    tuitionAmountKrw < 0
  ) {
    return new NextResponse(
      "KRW tuition amount is required.",
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isFinite(
      tuitionAmountPhp
    ) ||
    tuitionAmountPhp < 0
  ) {
    return new NextResponse(
      "PHP tuition amount is required.",
      {
        status: 400,
      }
    );
  }

  /* ======================================================================== */
  /* SUPABASE                                                                 */
  /* ======================================================================== */

  const supabase =
    await createClient();

  /* ======================================================================== */
  /* VERIFY ORIGINATING STUDENT                                              */
  /* ======================================================================== */

  const {
    data: originatingStudent,
    error:
      originatingStudentError,
  } = await supabase
    .from("students")
    .select(
      "id, full_name, preferred_name"
    )
    .eq("id", id)
    .single();

  if (
    originatingStudentError ||
    !originatingStudent
  ) {
    console.error(
      "ORIGINATING STUDENT VERIFICATION ERROR:",
      originatingStudentError
    );

    return new NextResponse(
      "Student not found.",
      {
        status: 404,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY ALL STUDENTS                                                      */
  /* ======================================================================== */

  const {
    data: students,
    error: studentsError,
  } = await supabase
    .from("students")
    .select(
      "id, full_name, preferred_name"
    )
    .in("id", studentIds);

  if (
    studentsError ||
    !students ||
    students.length !==
      studentIds.length
  ) {
    console.error(
      "STUDENT VERIFICATION ERROR:",
      {
        studentIds,
        students,
        error: studentsError,
      }
    );

    return new NextResponse(
      "One or more selected students could not be found.",
      {
        status: 404,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY RENEWAL                                                          */
  /* ======================================================================== */

  if (renewalOf) {
    const {
      data: previousEnrollment,
      error:
        previousEnrollmentError,
    } = await supabase
      .from("enrollments")
      .select(
        "id, student_id, status"
      )
      .eq("id", renewalOf)
      .maybeSingle();

    if (
      previousEnrollmentError ||
      !previousEnrollment
    ) {
      return new NextResponse(
        "Previous enrollment not found.",
        {
          status: 400,
        }
      );
    }

    if (
      previousEnrollment.student_id &&
      previousEnrollment.student_id !==
        id
    ) {
      return new NextResponse(
        "The previous enrollment does not belong to this student.",
        {
          status: 400,
        }
      );
    }

    /*
     * Shared enrollment:
     * the originating student is stored
     * in enrollment_students.
     */
    if (
      previousEnrollment.student_id ===
      null
    ) {
      const {
        data: previousParticipant,
        error:
          previousParticipantError,
      } = await supabase
        .from("enrollment_students")
        .select(
          "id, enrollment_id, student_id"
        )
        .eq(
          "enrollment_id",
          renewalOf
        )
        .eq(
          "student_id",
          id
        )
        .maybeSingle();

      if (
        previousParticipantError ||
        !previousParticipant
      ) {
        return new NextResponse(
          "The previous shared enrollment does not include this student.",
          {
            status: 400,
          }
        );
      }
    }
  }

  /* ======================================================================== */
  /* CREATE ENROLLMENT                                                        */
  /* ======================================================================== */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .insert({
      /*
       * Individual enrollment:
       * student_id = originating student
       *
       * Shared enrollment:
       * student_id = null
       * participants live in enrollment_students.
       */
      student_id:
        isShared
          ? null
          : id,

      package_name:
        packageName,

      number_of_lessons:
        numberOfLessons,

      lesson_duration:
        lessonDuration,

      lessons_per_week:
        lessonsPerWeek,

      start_date:
        startDate,

      status:
        "pending",

      tuition_amount:
        tuitionAmountKrw,

      currency:
        "KRW",

      /*
       * Legacy summary fields.
       *
       * Exact daily schedules are stored in
       * enrollment_schedules.
       */
      schedule_days:
        isShared
          ? []
          : individualScheduleDays,

      schedule_time:
        isShared
          ? null
          : individualLegacyScheduleTime,

      renewal_of:
        renewalOf,
    })
    .select(
      `
        id,
        student_id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        status,
        tuition_amount,
        currency,
        schedule_days,
        schedule_time,
        renewal_of
      `
    )
    .single();

  if (
    enrollmentError ||
    !enrollment
  ) {
    console.error(
      "ENROLLMENT CREATION ERROR:",
      {
        code:
          enrollmentError?.code,
        message:
          enrollmentError?.message,
        details:
          enrollmentError?.details,
        hint:
          enrollmentError?.hint,
      }
    );

    return databaseErrorResponse(
      "Unable to create enrollment.",
      enrollmentError
    );
  }

  /* ======================================================================== */
  /* CREATE ENROLLMENT PARTICIPANTS                                           */
  /* ======================================================================== */

  const participantRows =
    participants.map(
      (participant) => ({
        enrollment_id:
          enrollment.id,

        student_id:
          participant.studentId,

        schedule_days:
          participant.scheduleDays,

        /*
         * Legacy field.
         *
         * If Monday = 19:00 and Wednesday = 20:00,
         * this is null.
         *
         * The exact times are in enrollment_schedules.
         */
        schedule_time:
          participant.scheduleTime,
      })
    );

  const {
    data: createdParticipants,
    error:
      participantError,
  } = await supabase
    .from("enrollment_students")
    .insert(
      participantRows
    )
    .select(
      `
        id,
        enrollment_id,
        student_id,
        schedule_days,
        schedule_time
      `
    );

  if (
    participantError ||
    !createdParticipants ||
    createdParticipants.length !==
      participants.length
  ) {
    console.error(
      "ENROLLMENT PARTICIPANT CREATION ERROR:",
      {
        code:
          participantError?.code,
        message:
          participantError?.message,
        details:
          participantError?.details,
        hint:
          participantError?.hint,
        participantRows,
      }
    );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return databaseErrorResponse(
      "Unable to create enrollment participants.",
      participantError
    );
  }

  /* ======================================================================== */
  /* CREATE NORMALIZED ENROLLMENT SCHEDULES                                  */
  /* ======================================================================== */

  const enrollmentScheduleRows =
    buildEnrollmentScheduleRows(
      enrollment.id,
      participants
    );

  if (
    enrollmentScheduleRows.length ===
    0
  ) {
    console.error(
      "NO ENROLLMENT SCHEDULE ROWS CREATED."
    );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return new NextResponse(
      "Enrollment could not be created because no lesson schedules were found.",
      {
        status: 500,
      }
    );
  }

  const {
    data: createdSchedules,
    error:
      scheduleError,
  } = await supabase
    .from("enrollment_schedules")
    .insert(
      enrollmentScheduleRows
    )
    .select(
      `
        id,
        enrollment_id,
        student_id,
        day_of_week,
        schedule_time
      `
    );

  if (
    scheduleError ||
    !createdSchedules ||
    createdSchedules.length !==
      enrollmentScheduleRows.length
  ) {
    console.error(
      "ENROLLMENT SCHEDULE CREATION ERROR:",
      {
        code:
          scheduleError?.code,
        message:
          scheduleError?.message,
        details:
          scheduleError?.details,
        hint:
          scheduleError?.hint,
        enrollmentScheduleRows,
      }
    );

    await supabase
      .from("enrollment_schedules")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return databaseErrorResponse(
      "Unable to create enrollment schedules.",
      scheduleError
    );
  }

  console.log(
    "ENROLLMENT SCHEDULES CREATED:",
    createdSchedules
  );

  /* ======================================================================== */
  /* CREATE CONTRACT                                                          */
  /* ======================================================================== */

  const {
    data: contract,
    error: contractError,
  } = await supabase
    .from("contracts")
    .insert({
      enrollment_id:
        enrollment.id,

      status:
        "for_review",
    })
    .select(
      "id, enrollment_id, status"
    )
    .single();

  if (
    contractError ||
    !contract
  ) {
    console.error(
      "CONTRACT CREATION ERROR:",
      contractError
    );

    await supabase
      .from("enrollment_schedules")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return databaseErrorResponse(
      "Unable to create enrollment contract.",
      contractError
    );
  }

  /* ======================================================================== */
  /* CREATE PAYMENT                                                           */
  /* ======================================================================== */

  const {
    data: payment,
    error: paymentError,
  } = await supabase
    .from("payments")
    .insert({
      enrollment_id:
        enrollment.id,

      amount:
        tuitionAmountKrw,

      currency:
        "KRW",

      amount_krw:
        tuitionAmountKrw,

      amount_php:
        tuitionAmountPhp,

      /*
       * ALWAYS populated because payments.payment_date
       * is NOT NULL.
       */
      payment_date:
        paymentDate,

      payment_method:
        paymentMethod,

      status:
        paymentStatus,

      reference,
    })
    .select(
      `
        id,
        enrollment_id,
        amount,
        currency,
        amount_krw,
        amount_php,
        status,
        payment_date,
        payment_method,
        reference
      `
    )
    .single();

  if (
    paymentError ||
    !payment
  ) {
    console.error(
      "PAYMENT CREATION ERROR:",
      {
        code:
          paymentError?.code,
        message:
          paymentError?.message,
        details:
          paymentError?.details,
        hint:
          paymentError?.hint,
        paymentDate,
      }
    );

    await supabase
      .from("contracts")
      .delete()
      .eq(
        "id",
        contract.id
      );

    await supabase
      .from("enrollment_schedules")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollment_students")
      .delete()
      .eq(
        "enrollment_id",
        enrollment.id
      );

    await supabase
      .from("enrollments")
      .delete()
      .eq(
        "id",
        enrollment.id
      );

    return databaseErrorResponse(
      "Unable to create payment record.",
      paymentError
    );
  }

  /* ======================================================================== */
  /* VERIFY ENROLLMENT                                                        */
  /* ======================================================================== */

  const {
    data: enrollmentVerification,
    error:
      enrollmentVerificationError,
  } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        student_id,
        renewal_of,
        status,
        tuition_amount,
        currency,
        schedule_days,
        schedule_time,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date
      `
    )
    .eq(
      "id",
      enrollment.id
    )
    .single();

  if (
    enrollmentVerificationError ||
    !enrollmentVerification
  ) {
    return new NextResponse(
      "Enrollment was created, but could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    Number(
      enrollmentVerification
        .lessons_per_week
    ) !== lessonsPerWeek
  ) {
    return new NextResponse(
      "Enrollment was created, but lessons per week could not be verified.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY PARTICIPANTS                                                      */
  /* ======================================================================== */

  const {
    data: participantVerification,
    error:
      participantVerificationError,
  } = await supabase
    .from("enrollment_students")
    .select(
      `
        id,
        enrollment_id,
        student_id,
        schedule_days,
        schedule_time
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    );

  if (
    participantVerificationError ||
    !participantVerification ||
    participantVerification.length !==
      participants.length
  ) {
    console.error(
      "PARTICIPANT VERIFICATION ERROR:",
      participantVerificationError
    );

    return new NextResponse(
      "Enrollment was created, but its participating students could not be verified.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY NORMALIZED SCHEDULES                                              */
  /* ======================================================================== */

  const {
    data: scheduleVerification,
    error:
      scheduleVerificationError,
  } = await supabase
    .from("enrollment_schedules")
    .select(
      `
        id,
        enrollment_id,
        student_id,
        day_of_week,
        schedule_time
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    );

  if (
    scheduleVerificationError ||
    !scheduleVerification
  ) {
    console.error(
      "SCHEDULE VERIFICATION ERROR:",
      scheduleVerificationError
    );

    return new NextResponse(
      "Enrollment was created, but its normalized schedules could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    scheduleVerification.length !==
    enrollmentScheduleRows.length
  ) {
    console.error(
      "SCHEDULE COUNT MISMATCH:",
      {
        expected:
          enrollmentScheduleRows.length,
        actual:
          scheduleVerification.length,
      }
    );

    return new NextResponse(
      "Enrollment was created, but the number of saved schedules could not be verified.",
      {
        status: 500,
      }
    );
  }

  /*
   * Verify every participant/day/time.
   *
   * IMPORTANT:
   * We normalize BOTH sides before comparing the time.
   *
   * Example:
   *
   * expected = 19:30
   * database = 19:30:00
   *
   * Both become:
   *
   * 19:30
   */
  for (
    const expectedSchedule of
      enrollmentScheduleRows
  ) {
    const actualSchedule =
      scheduleVerification.find(
        (row) =>
          row.student_id ===
            expectedSchedule.student_id &&
          Number(row.day_of_week) ===
            Number(
              expectedSchedule.day_of_week
            )
      );

    if (!actualSchedule) {
      console.error(
        "MISSING SCHEDULE:",
        expectedSchedule
      );

      return new NextResponse(
        "Enrollment was created, but one or more lesson schedules could not be verified.",
        {
          status: 500,
        }
      );
    }

    const expectedTime =
      normalizeTime(
        expectedSchedule.schedule_time
      );

    const actualTime =
      normalizeTime(
        actualSchedule.schedule_time
      );

    console.log(
      "VERIFYING SCHEDULE TIME:",
      {
        studentId:
          expectedSchedule.student_id,

        day:
          expectedSchedule.day_of_week,

        expectedTime,

        actualTime,
      }
    );

    if (
      actualTime !==
      expectedTime
    ) {
      console.error(
        "SCHEDULE TIME MISMATCH:",
        {
          expected:
            expectedSchedule,

          actual:
            actualSchedule,

          expectedTime,

          actualTime,
        }
      );

      return new NextResponse(
        "Enrollment was created, but one or more lesson times could not be verified.",
        {
          status: 500,
        }
      );
    }
  }

  /* ======================================================================== */
  /* VERIFY INDIVIDUAL / SHARED STRUCTURE                                    */
  /* ======================================================================== */

  if (!isShared) {
    if (
      enrollmentVerification.student_id !==
      id
    ) {
      return new NextResponse(
        "Enrollment was created, but the student relationship could not be verified.",
        {
          status: 500,
        }
      );
    }

    const storedDays =
      normalizeScheduleDays(
        Array.isArray(
          enrollmentVerification
            .schedule_days
        )
          ? enrollmentVerification
              .schedule_days
          : []
      );

    if (
      JSON.stringify(
        storedDays
      ) !==
      JSON.stringify(
        individualScheduleDays
      )
    ) {
      console.error(
        "INDIVIDUAL DAY MISMATCH:",
        {
          expected:
            individualScheduleDays,
          actual:
            storedDays,
        }
      );

      return new NextResponse(
        "Enrollment was created, but its lesson days could not be verified.",
        {
          status: 500,
        }
      );
    }
  }

  if (
    isShared &&
    enrollmentVerification
      .student_id !== null
  ) {
    return new NextResponse(
      "Shared enrollment was created with an invalid student relationship.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY RENEWAL                                                           */
  /* ======================================================================== */

  if (
    renewalOf &&
    enrollmentVerification
      .renewal_of !==
      renewalOf
  ) {
    return new NextResponse(
      "Enrollment was created, but the renewal relationship could not be verified.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY INITIAL STATUS                                                    */
  /* ======================================================================== */

  if (
    enrollmentVerification.status !==
    "pending"
  ) {
    return new NextResponse(
      "Enrollment was created, but its initial status is invalid.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY PAYMENT                                                           */
  /* ======================================================================== */

  const {
    data: paymentVerification,
    error:
      paymentVerificationError,
  } = await supabase
    .from("payments")
    .select(
      `
        id,
        enrollment_id,
        amount,
        currency,
        amount_krw,
        amount_php,
        status,
        payment_date,
        payment_method,
        reference
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (
    paymentVerificationError ||
    !paymentVerification
  ) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
      paymentVerificationError
    );

    return new NextResponse(
      "Enrollment was created, but the payment record could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    Number(
      paymentVerification.amount
    ) !==
    tuitionAmountKrw
  ) {
    return new NextResponse(
      "Enrollment was created, but the payment amount could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    Number(
      paymentVerification.amount_krw
    ) !==
    tuitionAmountKrw
  ) {
    return new NextResponse(
      "Enrollment was created, but the KRW payment amount could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    Number(
      paymentVerification.amount_php
    ) !==
    tuitionAmountPhp
  ) {
    return new NextResponse(
      "Enrollment was created, but the PHP payment amount could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    paymentVerification.currency !==
    "KRW"
  ) {
    return new NextResponse(
      "Enrollment was created, but the payment currency is invalid.",
      {
        status: 500,
      }
    );
  }

  if (
    paymentVerification.status !==
    "pending"
  ) {
    return new NextResponse(
      "Enrollment was created, but its payment status is invalid.",
      {
        status: 500,
      }
    );
  }

  /*
   * payment_date must never be null.
   */
  if (
    !paymentVerification.payment_date
  ) {
    return new NextResponse(
      "Enrollment was created, but the payment date could not be verified.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* VERIFY CONTRACT                                                          */
  /* ======================================================================== */

  const {
    data: contractVerification,
    error:
      contractVerificationError,
  } = await supabase
    .from("contracts")
    .select(
      `
        id,
        enrollment_id,
        status
      `
    )
    .eq(
      "enrollment_id",
      enrollment.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (
    contractVerificationError ||
    !contractVerification
  ) {
    console.error(
      "CONTRACT VERIFICATION ERROR:",
      contractVerificationError
    );

    return new NextResponse(
      "Enrollment was created, but its contract could not be verified.",
      {
        status: 500,
      }
    );
  }

  if (
    contractVerification.status !==
    "for_review"
  ) {
    return new NextResponse(
      "Enrollment was created, but its contract status is invalid.",
      {
        status: 500,
      }
    );
  }

  /* ======================================================================== */
  /* FINAL LOG                                                                */
  /* ======================================================================== */

  console.log(
    "ENROLLMENT FULLY CREATED:",
    {
      enrollmentId:
        enrollment.id,

      enrollmentType,

      originatingStudent:
        id,

      participatingStudents:
        studentIds,

      participantCount:
        studentIds.length,

      renewalOf,

      lessonsPerWeek,

      contractId:
        contract.id,

      paymentId:
        payment.id,

      paymentDate:
        paymentDate,

      enrollmentStatus:
        enrollment.status,

      paymentStatus:
        payment.status,

      contractStatus:
        contract.status,

      normalizedSchedules:
        enrollmentScheduleRows,
    }
  );

  /* ======================================================================== */
  /* REDIRECT                                                                 */
  /* ======================================================================== */

  return NextResponse.redirect(
    new URL(
      `/${locale}/admin/students/${id}`,
      request.url
    )
  );
}