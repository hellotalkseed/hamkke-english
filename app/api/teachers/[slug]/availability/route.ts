import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AvailabilityBlock = {
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type AdditionalAvailabilityBlock = {
  teacher_id: string;
  availability_date: string;
  start_time: string;
  end_time: string;
};

type AssignmentRow = {
  id: string;
  enrollment_student_id: string;
  teacher_id: string;
  start_date: string;
  end_date: string | null;
  status: string;
};

type EnrollmentStudentRow = {
  id: string;
  enrollment_id: string;
  student_id: string;
};

type EnrollmentScheduleRow = {
  enrollment_id: string;
  student_id: string;
  day_of_week: number;
  schedule_time: string;
};

type StudentRow = {
  id: string;
  timezone: string | null;
};

type RegularLessonRow = {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  substitute_teacher_id: string | null;
};

type SubstituteLessonRow = {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  substitute_teacher_id: string | null;
};

type AssessmentBookingRow = {
  teacher_id: string;
  assessment_date: string;
  assessment_time: string;
  status: string;
};

type PublicSlotStatus =
  | "available"
  | "regular_student"
  | "unavailable";

type PublicSlot = {
  date: string;
  time: string;
  status: PublicSlotStatus;
};

type OccupiedPeriod = {
  date: string;
  startMinutes: number;
  endMinutes: number;
  type: "regular" | "substitute" | "assessment";
};

const SOURCE_TIMEZONE = "Asia/Manila";
const START_HOUR = 5;
const END_HOUR = 24;
const INTERVAL_MINUTES = 30;

/*
 * One source-calendar day is included on either
 * side of the requested PHT week.
 *
 * This allows the client to convert the calendar
 * into another timezone without losing slots that
 * move across midnight.
 */
const BUFFER_DAYS = 1;

function normalizeTime(
  value: string | null | undefined
) {
  const match = String(value || "").match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) return "";

  return `${match[1].padStart(
    2,
    "0"
  )}:${match[2]}`;
}

function timeToMinutes(value: string) {
  const normalized =
    normalizeTime(value);

  if (!normalized) return NaN;

  const [hour, minute] =
    normalized
      .split(":")
      .map(Number);

  return hour * 60 + minute;
}

function addDays(
  dateKey: string,
  days: number
) {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function getDayOfWeek(
  dateKey: string
) {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  ).getUTCDay();
}

function getPhtToday() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          SOURCE_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(
      new Date()
    );

  const part = (
    type: string
  ) =>
    parts.find(
      (item) =>
        item.type === type
    )?.value || "";

  return `${part(
    "year"
  )}-${part(
    "month"
  )}-${part("day")}`;
}

function createTimeSlots() {
  const slots: string[] = [];

  for (
    let minutes =
      START_HOUR * 60;
    minutes <
    END_HOUR * 60;
    minutes +=
      INTERVAL_MINUTES
  ) {
    const hour =
      Math.floor(
        minutes / 60
      );

    const minute =
      minutes % 60;

    slots.push(
      `${String(
        hour
      ).padStart(
        2,
        "0"
      )}:${String(
        minute
      ).padStart(
        2,
        "0"
      )}`
    );
  }

  return slots;
}

function fitsBlock(
  time: string,
  block: {
    start_time: string;
    end_time: string;
  }
) {
  const start =
    timeToMinutes(time);

  const end =
    start +
    INTERVAL_MINUTES;

  return (
    start >=
      timeToMinutes(
        block.start_time
      ) &&
    end <=
      timeToMinutes(
        block.end_time
      )
  );
}

function slotOverlapsPeriod(
  time: string,
  period: OccupiedPeriod
) {
  const slotStart =
    timeToMinutes(time);

  const slotEnd =
    slotStart +
    INTERVAL_MINUTES;

  return (
    slotStart <
      period.endMinutes &&
    slotEnd >
      period.startMinutes
  );
}

function convertStudentTimeToPht(
  scheduleDate: string,
  scheduleTime: string,
  studentTimezone:
    | string
    | null
) {
  const timezone =
    studentTimezone ||
    SOURCE_TIMEZONE;

  try {
    const [
      year,
      month,
      day,
    ] = scheduleDate
      .split("-")
      .map(Number);

    const [
      hours,
      minutes,
      seconds = 0,
    ] = scheduleTime
      .split(":")
      .map(Number);

    const probe = Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

    const formatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }
      );

    const parts =
      formatter.formatToParts(
        new Date(probe)
      );

    const part = (
      type: string
    ) =>
      Number(
        parts.find(
          (item) =>
            item.type ===
            type
        )?.value || 0
      );

    const asUtc =
      Date.UTC(
        part("year"),
        part("month") - 1,
        part("day"),
        part("hour"),
        part("minute"),
        part("second")
      );

    const actualUtc =
      probe -
      (asUtc - probe);

    const pht =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            SOURCE_TIMEZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }
      ).formatToParts(
        new Date(
          actualUtc
        )
      );

    const p = (
      type: string
    ) =>
      pht.find(
        (item) =>
          item.type ===
          type
      )?.value || "";

    return {
      date: `${p(
        "year"
      )}-${p(
        "month"
      )}-${p("day")}`,

      time: `${p(
        "hour"
      )}:${p(
        "minute"
      )}`,
    };
  } catch {
    return {
      date:
        scheduleDate,

      time:
        normalizeTime(
          scheduleTime
        ),
    };
  }
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } =
      await context.params;

    const url =
      new URL(
        request.url
      );

    const requestedStartDate =
      url.searchParams.get(
        "start_date"
      );

    const requestedDate =
      requestedStartDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        requestedStartDate
      )
        ? requestedStartDate
        : getPhtToday();

    /*
     * Requested public week remains
     * Sunday-Saturday.
     */
    const startDate =
      addDays(
        requestedDate,
        -getDayOfWeek(
          requestedDate
        )
      );

    const endDate =
      addDays(
        startDate,
        6
      );

    /*
     * Source range includes one extra
     * PHT day before and after the
     * requested week.
     */
    const sourceStartDate =
      addDays(
        startDate,
        -BUFFER_DAYS
      );

    const sourceEndDate =
      addDays(
        endDate,
        BUFFER_DAYS
      );

    const admin =
      createAdminClient();

    /*
     * -------------------------------------------------------
     * Published teacher
     * -------------------------------------------------------
     */

    const {
      data: publicTeacher,
      error: teacherError,
    } = await admin
      .from(
        "teacher_public_profiles"
      )
      .select(
        "teacher_id, slug, is_published"
      )
      .eq(
        "slug",
        slug
      )
      .eq(
        "is_published",
        true
      )
      .maybeSingle();

    if (teacherError) {
      throw new Error(
        teacherError.message
      );
    }

    if (!publicTeacher) {
      return NextResponse.json(
        {
          error:
            "Teacher not found.",
        },
        {
          status: 404,
        }
      );
    }

    const teacherId =
      publicTeacher.teacher_id;

    /*
     * -------------------------------------------------------
     * Teacher calendar sources
     * -------------------------------------------------------
     */

    const [
      availabilityResult,
      additionalAvailabilityResult,
      assignmentsResult,
      substituteLessonsResult,
      assessmentBookingsResult,
    ] = await Promise.all([
      admin
        .from(
          "teacher_availability"
        )
        .select(
          "teacher_id, day_of_week, start_time, end_time"
        )
        .eq(
          "teacher_id",
          teacherId
        ),

      admin
        .from(
          "teacher_sub_availability"
        )
        .select(
          "teacher_id, availability_date, start_time, end_time"
        )
        .eq(
          "teacher_id",
          teacherId
        )
        .gte(
          "availability_date",
          sourceStartDate
        )
        .lte(
          "availability_date",
          sourceEndDate
        ),

      admin
        .from(
          "teacher_assignments"
        )
        .select(
          "id, enrollment_student_id, teacher_id, start_date, end_date, status"
        )
        .eq(
          "teacher_id",
          teacherId
        )
        .eq(
          "status",
          "active"
        ),

      admin
        .from("lessons")
        .select(`
          id,
          enrollment_id,
          lesson_date,
          schedule_time,
          duration,
          student_id,
          substitute_teacher_id
        `)
        .eq(
          "substitute_teacher_id",
          teacherId
        ),

      admin
        .from(
          "assessment_bookings"
        )
        .select(
          "teacher_id, assessment_date, assessment_time, status"
        )
        .eq(
          "teacher_id",
          teacherId
        )
        .eq(
          "status",
          "confirmed"
        )
        .gte(
          "assessment_date",
          sourceStartDate
        )
        .lte(
          "assessment_date",
          sourceEndDate
        ),
    ]);

    if (
      availabilityResult.error
    ) {
      throw new Error(
        availabilityResult
          .error.message
      );
    }

    if (
      additionalAvailabilityResult.error
    ) {
      throw new Error(
        additionalAvailabilityResult
          .error.message
      );
    }

    if (
      assignmentsResult.error
    ) {
      throw new Error(
        assignmentsResult
          .error.message
      );
    }

    if (
      substituteLessonsResult.error
    ) {
      throw new Error(
        substituteLessonsResult
          .error.message
      );
    }

    if (
      assessmentBookingsResult.error
    ) {
      throw new Error(
        assessmentBookingsResult
          .error.message
      );
    }

    const availability =
      (availabilityResult.data ||
        []) as AvailabilityBlock[];

    const additionalAvailability =
      (additionalAvailabilityResult.data ||
        []) as AdditionalAvailabilityBlock[];

    const assignments =
      (assignmentsResult.data ||
        []) as AssignmentRow[];

    const substituteLessons =
      (substituteLessonsResult.data ||
        []) as SubstituteLessonRow[];

    const assessmentBookings =
      (assessmentBookingsResult.data ||
        []) as AssessmentBookingRow[];

    /*
     * -------------------------------------------------------
     * Resolve regular assignment data
     * -------------------------------------------------------
     */

    const enrollmentStudentIds =
      [
        ...new Set(
          assignments.map(
            (
              assignment
            ) =>
              assignment.enrollment_student_id
          )
        ),
      ];

    let enrollmentStudents:
      EnrollmentStudentRow[] =
      [];

    if (
      enrollmentStudentIds.length
    ) {
      const result =
        await admin
          .from(
            "enrollment_students"
          )
          .select(
            "id, enrollment_id, student_id"
          )
          .in(
            "id",
            enrollmentStudentIds
          );

      if (result.error) {
        throw new Error(
          result.error.message
        );
      }

      enrollmentStudents =
        (result.data ||
          []) as EnrollmentStudentRow[];
    }

    const enrollmentIds =
      [
        ...new Set(
          enrollmentStudents.map(
            (item) =>
              item.enrollment_id
          )
        ),
      ];

    const regularStudentIds =
      [
        ...new Set(
          enrollmentStudents.map(
            (item) =>
              item.student_id
          )
        ),
      ];

    const substituteStudentIds =
      [
        ...new Set(
          substituteLessons
            .map(
              (lesson) =>
                lesson.student_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            )
        ),
      ];

    const allStudentIds =
      [
        ...new Set([
          ...regularStudentIds,
          ...substituteStudentIds,
        ]),
      ];

    /*
     * -------------------------------------------------------
     * Recurring enrollment schedules
     * -------------------------------------------------------
     */

    let schedules:
      EnrollmentScheduleRow[] =
      [];

    if (
      enrollmentIds.length &&
      regularStudentIds.length
    ) {
      const result =
        await admin
          .from(
            "enrollment_schedules"
          )
          .select(
            "enrollment_id, student_id, day_of_week, schedule_time"
          )
          .in(
            "enrollment_id",
            enrollmentIds
          )
          .in(
            "student_id",
            regularStudentIds
          );

      if (result.error) {
        throw new Error(
          result.error.message
        );
      }

      schedules =
        (result.data ||
          []) as EnrollmentScheduleRow[];
    }

    /*
     * -------------------------------------------------------
     * Actual regular lesson records
     * -------------------------------------------------------
     *
     * These provide the real duration of generated
     * lessons. The recurring schedule is still kept
     * as a fallback when a generated lesson does not
     * yet exist.
     */

    let regularLessons:
      RegularLessonRow[] =
      [];

    if (
      enrollmentIds.length
    ) {
      const result =
        await admin
          .from("lessons")
          .select(`
            id,
            enrollment_id,
            student_id,
            lesson_date,
            schedule_time,
            duration,
            substitute_teacher_id
          `)
          .in(
            "enrollment_id",
            enrollmentIds
          )
          .gte(
            "lesson_date",
            sourceStartDate
          )
          .lte(
            "lesson_date",
            sourceEndDate
          );

      if (result.error) {
        throw new Error(
          result.error.message
        );
      }

      regularLessons =
        (result.data ||
          []) as RegularLessonRow[];
    }

    /*
     * -------------------------------------------------------
     * Student timezones
     * -------------------------------------------------------
     */

    let students:
      StudentRow[] =
      [];

    if (
      allStudentIds.length
    ) {
      const result =
        await admin
          .from(
            "students"
          )
          .select(
            "id, timezone"
          )
          .in(
            "id",
            allStudentIds
          );

      if (result.error) {
        throw new Error(
          result.error.message
        );
      }

      students =
        (result.data ||
          []) as StudentRow[];
    }

    const studentTimezoneMap =
      new Map(
        students.map(
          (student) => [
            student.id,
            student.timezone,
          ]
        )
      );

    const enrollmentStudentMap =
      new Map(
        enrollmentStudents.map(
          (item) => [
            item.id,
            item,
          ]
        )
      );

    /*
     * -------------------------------------------------------
     * Build occupied periods
     * -------------------------------------------------------
     */

    const occupiedPeriods:
      OccupiedPeriod[] =
      [];

    const sourceDates =
      Array.from(
        {
          length:
            7 +
            BUFFER_DAYS *
              2,
        },
        (_, index) =>
          addDays(
            sourceStartDate,
            index
          )
      );

    /*
     * Keep track of recurring occurrences that have
     * an actual generated lesson. This prevents us
     * from adding both the real lesson and the
     * 30-minute recurring fallback.
     */
    const actualRegularOccurrences =
      new Set<string>();

    /*
     * -------------------------------------------------------
     * Actual regular lessons
     * -------------------------------------------------------
     *
     * Use the real lesson duration.
     */

    for (
      const lesson of
      regularLessons
    ) {
      if (
        !lesson.student_id ||
        !lesson.schedule_time
      ) {
        continue;
      }

      /*
       * If this lesson has been assigned to this
       * teacher as a substitute, it is handled by
       * the substitute section instead.
       */
      if (
        lesson.substitute_teacher_id ===
        teacherId
      ) {
        continue;
      }

      /*
       * Make sure this lesson actually belongs to
       * one of this teacher's regular assignments.
       */
      const matchingEnrollmentStudent =
        enrollmentStudents.find(
          (item) =>
            item.enrollment_id ===
              lesson.enrollment_id &&
            item.student_id ===
              lesson.student_id
        );

      if (
        !matchingEnrollmentStudent
      ) {
        continue;
      }

      const assignment =
        assignments.find(
          (item) =>
            item.enrollment_student_id ===
            matchingEnrollmentStudent.id
        );

      if (!assignment) {
        continue;
      }

      const studentTimezone =
        studentTimezoneMap.get(
          lesson.student_id
        ) || null;

      const converted =
        convertStudentTimeToPht(
          lesson.lesson_date,
          lesson.schedule_time,
          studentTimezone
        );

      if (
        converted.date <
          sourceStartDate ||
        converted.date >
          sourceEndDate
      ) {
        continue;
      }

      if (
        converted.date <
        assignment.start_date
      ) {
        continue;
      }

      if (
        assignment.end_date &&
        converted.date >
          assignment.end_date
      ) {
        continue;
      }

      const startMinutes =
        timeToMinutes(
          converted.time
        );

      if (
        Number.isNaN(
          startMinutes
        )
      ) {
        continue;
      }

      const duration =
        Math.max(
          1,
          Number(
            lesson.duration
          ) ||
            INTERVAL_MINUTES
        );

      occupiedPeriods.push({
        date:
          converted.date,

        startMinutes,

        endMinutes:
          startMinutes +
          duration,

        type: "regular",
      });

      /*
       * The key uses the stored student date/time,
       * because those are the same values used by
       * enrollment_schedules.
       */
      actualRegularOccurrences.add(
        [
          lesson.enrollment_id,
          lesson.student_id,
          lesson.lesson_date,
          normalizeTime(
            lesson.schedule_time
          ),
        ].join("|")
      );
    }

    /*
     * -------------------------------------------------------
     * Recurring regular schedule fallback
     * -------------------------------------------------------
     *
     * If no generated lesson exists for an occurrence,
     * preserve the existing 30-minute recurring
     * representation.
     */

    for (
      const assignment of
      assignments
    ) {
      const enrollmentStudent =
        enrollmentStudentMap.get(
          assignment.enrollment_student_id
        );

      if (
        !enrollmentStudent
      ) {
        continue;
      }

      const studentSchedules =
        schedules.filter(
          (schedule) =>
            schedule.enrollment_id ===
              enrollmentStudent.enrollment_id &&
            schedule.student_id ===
              enrollmentStudent.student_id
        );

      const studentTimezone =
        studentTimezoneMap.get(
          enrollmentStudent.student_id
        ) || null;

      for (
        const schedule of
        studentSchedules
      ) {
        const matchingDates =
          sourceDates.filter(
            (date) =>
              getDayOfWeek(
                date
              ) ===
              Number(
                schedule.day_of_week
              )
          );

        for (
          const studentDate of
          matchingDates
        ) {
          /*
           * If an actual generated lesson exists,
           * its real duration already controls this
           * occurrence.
           */
          const occurrenceKey =
            [
              enrollmentStudent.enrollment_id,
              enrollmentStudent.student_id,
              studentDate,
              normalizeTime(
                schedule.schedule_time
              ),
            ].join("|");

          if (
            actualRegularOccurrences.has(
              occurrenceKey
            )
          ) {
            continue;
          }

          const converted =
            convertStudentTimeToPht(
              studentDate,
              schedule.schedule_time,
              studentTimezone
            );

          if (
            converted.date <
              sourceStartDate ||
            converted.date >
              sourceEndDate
          ) {
            continue;
          }

          if (
            converted.date <
            assignment.start_date
          ) {
            continue;
          }

          if (
            assignment.end_date &&
            converted.date >
              assignment.end_date
          ) {
            continue;
          }

          const startMinutes =
            timeToMinutes(
              converted.time
            );

          if (
            Number.isNaN(
              startMinutes
            )
          ) {
            continue;
          }

          occupiedPeriods.push({
            date:
              converted.date,

            startMinutes,

            endMinutes:
              startMinutes +
              INTERVAL_MINUTES,

            type: "regular",
          });
        }
      }
    }

    /*
     * -------------------------------------------------------
     * Substitute occupied periods
     * -------------------------------------------------------
     *
     * Substitute lessons already use the real lesson
     * duration and are public-facing as unavailable.
     */

    for (
      const lesson of
      substituteLessons
    ) {
      if (
        !lesson.schedule_time ||
        !lesson.student_id
      ) {
        continue;
      }

      const studentTimezone =
        studentTimezoneMap.get(
          lesson.student_id
        ) || null;

      const converted =
        convertStudentTimeToPht(
          lesson.lesson_date,
          lesson.schedule_time,
          studentTimezone
        );

      if (
        converted.date <
          sourceStartDate ||
        converted.date >
          sourceEndDate
      ) {
        continue;
      }

      const startMinutes =
        timeToMinutes(
          converted.time
        );

      if (
        Number.isNaN(
          startMinutes
        )
      ) {
        continue;
      }

      occupiedPeriods.push({
        date:
          converted.date,

        startMinutes,

        endMinutes:
          startMinutes +
          Math.max(
            1,
            Number(
              lesson.duration
            ) ||
              INTERVAL_MINUTES
          ),

        type:
          "substitute",
      });
    }

    /*
     * -------------------------------------------------------
     * Confirmed assessment occupied periods
     * -------------------------------------------------------
     *
     * Free assessments use one 30-minute calendar slot.
     * They are public-facing only as unavailable.
     */

    for (
      const booking of
      assessmentBookings
    ) {
      const startMinutes =
        timeToMinutes(
          booking.assessment_time
        );

      if (
        Number.isNaN(
          startMinutes
        )
      ) {
        continue;
      }

      occupiedPeriods.push({
        date:
          booking.assessment_date,

        startMinutes,

        endMinutes:
          startMinutes +
          INTERVAL_MINUTES,

        type: "assessment",
      });
    }

    /*
     * -------------------------------------------------------
     * Generate privacy-safe buffered source calendar
     * -------------------------------------------------------
     *
     * Priority:
     *
     * 1. Substitute lesson       -> unavailable
     * 2. Confirmed assessment    -> unavailable
     * 3. Regular student         -> regular_student
     * 4. Additional availability -> available
     * 5. Recurring availability  -> available
     * 6. Everything else         -> unavailable
     */

    const timeSlots =
      createTimeSlots();

    const slots:
      PublicSlot[] = [];

    for (
      const date of
      sourceDates
    ) {
      const day =
        getDayOfWeek(
          date
        );

      for (
        const time of
        timeSlots
      ) {
        const overlappingPeriods =
          occupiedPeriods.filter(
            (period) =>
              period.date ===
                date &&
              slotOverlapsPeriod(
                time,
                period
              )
          );

        const hasUnavailableBooking =
          overlappingPeriods.some(
            (period) =>
              period.type ===
                "substitute" ||
              period.type ===
                "assessment"
          );

        if (
          hasUnavailableBooking
        ) {
          slots.push({
            date,
            time,
            status:
              "unavailable",
          });

          continue;
        }

        const hasRegularStudent =
          overlappingPeriods.some(
            (period) =>
              period.type ===
              "regular"
          );

        if (
          hasRegularStudent
        ) {
          slots.push({
            date,
            time,
            status:
              "regular_student",
          });

          continue;
        }

        const additionalAvailable =
          additionalAvailability.some(
            (block) =>
              block.availability_date ===
                date &&
              fitsBlock(
                time,
                block
              )
          );

        if (
          additionalAvailable
        ) {
          slots.push({
            date,
            time,
            status:
              "available",
          });

          continue;
        }

        const regularlyAvailable =
          availability.some(
            (block) =>
              Number(
                block.day_of_week
              ) ===
                day &&
              fitsBlock(
                time,
                block
              )
          );

        slots.push({
          date,
          time,
          status:
            regularlyAvailable
              ? "available"
              : "unavailable",
        });
      }
    }

    return NextResponse.json({
      teacher_slug:
        slug,

      source_timezone:
        SOURCE_TIMEZONE,

      /*
       * Visible requested PHT week.
       */
      start_date:
        startDate,

      end_date:
        endDate,

      /*
       * Actual range represented by slots.
       */
      source_start_date:
        sourceStartDate,

      source_end_date:
        sourceEndDate,

      interval_minutes:
        INTERVAL_MINUTES,

      slots,
    });
  } catch (error) {
    console.error(
      "Public teacher availability GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load teacher availability.",
      },
      {
        status: 500,
      }
    );
  }
}