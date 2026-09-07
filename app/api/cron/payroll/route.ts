import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  finalizeTeacherPayroll,
  type PayrollPeriod,
} from "@/lib/payroll/finalizeTeacherPayroll";

export const runtime = "nodejs";

function getPhilippineDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
  };
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getPeriodToFinalize(date = new Date()): PayrollPeriod | null {
  const { year, month, day } = getPhilippineDateParts(date);

  /*
   * On the 16th in Philippine Time,
   * finalize the 1st–15th payroll period.
   */
  if (day === 16) {
    const monthString = String(month).padStart(2, "0");

    return {
      periodStart: `${year}-${monthString}-01`,
      periodEnd: `${year}-${monthString}-15`,
    };
  }

  /*
   * On the 1st in Philippine Time,
   * finalize the 16th–end of the previous month.
   */
  if (day === 1) {
    const previousMonthDate = new Date(
      Date.UTC(year, month - 2, 15)
    );

    const previousYear =
      previousMonthDate.getUTCFullYear();

    const previousMonth =
      previousMonthDate.getUTCMonth() + 1;

    const lastDay = getLastDayOfMonth(
      previousYear,
      previousMonth
    );

    const monthString = String(previousMonth).padStart(
      2,
      "0"
    );

    return {
      periodStart: `${previousYear}-${monthString}-16`,
      periodEnd: `${previousYear}-${monthString}-${String(
        lastDay
      ).padStart(2, "0")}`,
    };
  }

  return null;
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return {
      ok: false,
      status: 500,
      error: "CRON_SECRET is not configured.",
    };
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${secret}`) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized.",
    };
  }

  return {
    ok: true,
    status: 200,
    error: null,
  };
}

export async function GET(request: Request) {
  try {
    const auth = isAuthorized(request);

    if (!auth.ok) {
      return NextResponse.json(
        {
          error: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const period = getPeriodToFinalize();

    /*
     * Vercel calls this route every day.
     *
     * Payroll generation only happens when the
     * Philippine date is either:
     *
     * - the 1st
     * - the 16th
     */
    if (!period) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason:
          "Today is not a payroll finalization date in Philippine Time.",
      });
    }

    const admin = createAdminClient();

    const {
      data: teachers,
      error: teachersError,
    } = await admin
      .from("profiles")
      .select("id, full_name, teacher_number")
      .eq("role", "teacher")
      .eq("status", "active")
      .order("full_name", {
        ascending: true,
      });

    if (teachersError) {
      console.error(
        "Payroll cron teacher lookup error:",
        teachersError
      );

      return NextResponse.json(
        {
          error: teachersError.message,
        },
        {
          status: 500,
        }
      );
    }

    const results = [];

    for (const teacher of teachers || []) {
      try {
        const result = await finalizeTeacherPayroll(
          String(teacher.id),
          period
        );

        /*
         * result already includes teacher_id.
         *
         * Spread it first, then add the display-only
         * teacher fields so no property is duplicated.
         */
        results.push({
          ...result,

          teacher_name: teacher.full_name
            ? String(teacher.full_name)
            : null,

          teacher_number: teacher.teacher_number
            ? String(teacher.teacher_number)
            : null,
        });
      } catch (error) {
        /*
         * Failed finalization does not produce a result,
         * so teacher_id must be supplied manually here.
         *
         * One teacher failing should not prevent the
         * remaining teachers from being processed.
         */
        results.push({
          teacher_id: String(teacher.id),

          teacher_name: teacher.full_name
            ? String(teacher.full_name)
            : null,

          teacher_number: teacher.teacher_number
            ? String(teacher.teacher_number)
            : null,

          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown payroll finalization error.",
        });
      }
    }

    const failed = results.filter(
      (result) => !result.success
    );

    const finalizedCount = results.filter(
      (result) =>
        result.success &&
        !(
          "already_finalized" in result &&
          result.already_finalized
        )
    ).length;

    const alreadyFinalizedCount = results.filter(
      (result) =>
        result.success &&
        "already_finalized" in result &&
        result.already_finalized
    ).length;

    return NextResponse.json(
      {
        success: failed.length === 0,

        skipped: false,

        period: {
          start: period.periodStart,
          end: period.periodEnd,
        },

        teacher_count: results.length,

        finalized_count: finalizedCount,

        already_finalized_count: alreadyFinalizedCount,

        failed_count: failed.length,

        results,
      },
      {
        /*
         * 207 means the cron itself ran successfully,
         * but one or more teacher payrolls failed.
         */
        status: failed.length > 0 ? 207 : 200,
      }
    );
  } catch (error) {
    console.error("Payroll cron error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}