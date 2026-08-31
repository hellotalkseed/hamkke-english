import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface PaymentsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface PaymentRow {
  id: string;
  amount: number | null;
  currency: string | null;
  amount_krw: number | null;
  amount_php: number | null;
  payment_date: string | null;
  payment_method: string | null;
  status: string | null;
  reference: string | null;
  notes: string | null;
  enrollments:
    | {
        id: string;
        package_name: string | null;
        students:
          | {
              id: string;
              full_name: string;
              preferred_name: string | null;
            }
          | {
              id: string;
              full_name: string;
              preferred_name: string | null;
            }[]
          | null;
      }
    | null;
}

export default async function PaymentsPage({
  params,
}: PaymentsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  const {
    data: payments,
    error,
  } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      currency,
      amount_krw,
      amount_php,
      payment_date,
      payment_method,
      status,
      reference,
      notes,
      enrollments (
        id,
        package_name,
        students (
          id,
          full_name,
          preferred_name
        )
      )
    `)
    .order("payment_date", {
      ascending: false,
    });

  const paymentRows =
    (payments ?? []) as unknown as PaymentRow[];

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
      <div className="mx-auto max-w-6xl">

        {/* BACK */}

        <Link
          href={`/${currentLocale}/admin`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Admin
        </Link>

        {/* HEADER */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-6

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[12px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-[#6F8F72]
              "
            >
              Payment Management
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-[48px]
                font-normal
                leading-tight
                tracking-[-0.03em]

                sm:text-[56px]
              "
            >
              Payments
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
              Track tuition payments in both KRW
              and PHP for each enrollment.
            </p>
          </div>

          <Link
            href={`/${currentLocale}/admin/payments/new`}
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#6F8F72]
              px-7
              py-3.5
              font-sans
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#5F7F63]
            "
          >
            + Record Payment
          </Link>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-10
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
            Could not load payments:{" "}
            {error.message}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && paymentRows.length === 0 && (
          <div
            className="
              mt-12
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              px-7
              py-14
              text-center
            "
          >
            <h2
              className="
                font-serif
                text-[30px]
                font-normal
              "
            >
              No payments yet
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                font-sans
                text-[14px]
                leading-6
                text-[#666]
              "
            >
              Payment records will appear here once
              you record a tuition payment.
            </p>

            <Link
              href={`/${currentLocale}/admin/payments/new`}
              className="
                mt-6
                inline-flex
                rounded-full
                bg-[#6F8F72]
                px-6
                py-3
                font-sans
                text-[13px]
                font-medium
                text-white
                transition
                hover:bg-[#5F7F63]
              "
            >
              Record First Payment
            </Link>
          </div>
        )}

        {/* PAYMENTS */}

        {paymentRows.length > 0 && (
          <div className="mt-12 space-y-4">

            {paymentRows.map((payment) => {
              const enrollment =
                payment.enrollments;

              const studentData =
                enrollment?.students;

              const student = Array.isArray(
                studentData
              )
                ? studentData[0] ?? null
                : studentData ?? null;

              return (
                <div
                  key={payment.id}
                  className="
                    rounded-3xl
                    border
                    border-[#E7DDD1]
                    bg-white
                    p-6

                    sm:p-7
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-7

                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    {/* STUDENT */}

                    <div>
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-x-3
                          gap-y-2
                        "
                      >
                        <h2
                          className="
                            font-serif
                            text-[28px]
                            font-normal
                          "
                        >
                          {student?.full_name ??
                            "Unknown Student"}
                        </h2>

                        <span
                          className="
                            rounded-full
                            bg-[#E2EBDD]
                            px-3
                            py-1
                            font-sans
                            text-[11px]
                            font-medium
                            capitalize
                            text-[#5F7F63]
                          "
                        >
                          {payment.status ??
                            "Unknown"}
                        </span>
                      </div>

                      {student?.preferred_name && (
                        <p
                          className="
                            mt-1
                            font-sans
                            text-[13px]
                            text-[#777]
                          "
                        >
                          “{student.preferred_name}”
                        </p>
                      )}

                      <p
                        className="
                          mt-4
                          font-sans
                          text-[13px]
                          text-[#666]
                        "
                      >
                        {enrollment?.package_name ??
                          "Unknown Enrollment"}
                      </p>
                    </div>

                    {/* PAYMENT DETAILS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-x-8
                        gap-y-5

                        sm:grid-cols-4
                      "
                    >

                      {/* KRW */}

                      <PaymentInfo
                        label="KRW"
                        value={formatKrw(
                          payment.amount_krw
                        )}
                      />

                      {/* PHP */}

                      <PaymentInfo
                        label="PHP"
                        value={formatPhp(
                          payment.amount_php
                        )}
                      />

                      {/* DATE */}

                      <PaymentInfo
                        label="Date"
                        value={formatDate(
                          payment.payment_date
                        )}
                      />

                      {/* METHOD */}

                      <PaymentInfo
                        label="Method"
                        value={
                          payment.payment_method
                        }
                      />
                    </div>
                  </div>

                  {/* REFERENCE */}

                  {payment.reference && (
                    <div
                      className="
                        mt-6
                        border-t
                        border-[#EEE7DF]
                        pt-5
                      "
                    >
                      <PaymentInfo
                        label="Reference"
                        value={payment.reference}
                      />
                    </div>
                  )}

                  {/* NOTES */}

                  {payment.notes && (
                    <div
                      className="
                        mt-5
                        border-t
                        border-[#EEE7DF]
                        pt-5
                      "
                    >
                      <p
                        className="
                          font-sans
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-[#999]
                        "
                      >
                        Notes
                      </p>

                      <p
                        className="
                          mt-2
                          font-sans
                          text-[13px]
                          leading-6
                          text-[#666]
                        "
                      >
                        {payment.notes}
                      </p>
                    </div>
                  )}

                  {/* VIEW STUDENT */}

                  {student?.id && (
                    <div className="mt-6">
                      <Link
                        href={`/${currentLocale}/admin/students/${student.id}`}
                        className="
                          inline-flex
                          rounded-full
                          border
                          border-[#D8CCBE]
                          px-5
                          py-2.5
                          font-sans
                          text-[12px]
                          font-medium
                          text-[#5F7F63]
                          transition
                          hover:border-[#6F8F72]
                          hover:bg-[#F4F7F2]
                        "
                      >
                        View Student →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function PaymentInfo({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p
        className="
          font-sans
          text-[10px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-sans
          text-[13px]
          text-[#444]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

function formatKrw(
  amount: number | null
) {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  return `₩${Number(amount).toLocaleString(
    "en-US"
  )}`;
}

function formatPhp(
  amount: number | null
) {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  return `₱${Number(amount).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}