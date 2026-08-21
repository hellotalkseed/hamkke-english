"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
}

interface Enrollment {
  id: string;
  package_name: string;
  tuition_amount: number;
  currency: string;
  students: Student | null;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [enrollments, setEnrollments] = useState<Enrollment[]>(
    []
  );

  const [loadingEnrollments, setLoadingEnrollments] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    enrollmentId: "",
    amount: "",
    currency: "KRW",
    paymentDate: new Date()
      .toISOString()
      .split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "paid",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    async function loadEnrollments() {
      setLoadingEnrollments(true);
      setError("");

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          package_name,
          tuition_amount,
          currency,
          students (
            id,
            full_name,
            preferred_name
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        setError(
          `Could not load enrollments: ${error.message}`
        );
        setLoadingEnrollments(false);
        return;
      }

      /*
       * Supabase may return the related student as an array
       * even though each enrollment belongs to one student.
       *
       * Normalize the response into the shape our component uses.
       */

      const normalizedEnrollments: Enrollment[] =
        (data ?? []).map((enrollment) => {
          const student = Array.isArray(enrollment.students)
            ? enrollment.students[0] ?? null
            : enrollment.students ?? null;

          return {
            id: enrollment.id,
            package_name: enrollment.package_name,
            tuition_amount: Number(
              enrollment.tuition_amount
            ),
            currency: enrollment.currency,
            students: student,
          };
        });

      setEnrollments(normalizedEnrollments);
      setLoadingEnrollments(false);
    }

    loadEnrollments();
  }, [supabase]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleEnrollmentChange(
    enrollmentId: string
  ) {
    const selected = enrollments.find(
      (enrollment) =>
        enrollment.id === enrollmentId
    );

    if (!selected) {
      updateField("enrollmentId", "");
      return;
    }

    setForm((current) => ({
      ...current,
      enrollmentId,
      amount: String(selected.tuition_amount),
      currency: selected.currency,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    if (!form.enrollmentId) {
      setError("Please select an enrollment.");
      setLoading(false);
      return;
    }

    if (!form.amount) {
      setError("Please enter a payment amount.");
      setLoading(false);
      return;
    }

    try {
      const { error: paymentError } =
        await supabase
          .from("payments")
          .insert({
            enrollment_id: form.enrollmentId,
            amount: Number(form.amount),
            currency: form.currency,
            payment_date: form.paymentDate,
            payment_method: form.paymentMethod,
            status: form.status,
            reference:
              form.reference || null,
            notes:
              form.notes || null,
          });

      if (paymentError) {
        throw new Error(
          `Could not record payment: ${paymentError.message}`
        );
      }

      router.push("/en/admin/payments");
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
      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push("/en/admin/payments")
          }
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Payments
        </button>

        {/* HEADER */}

        <div className="mt-10">
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
            Record Payment
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
            Record a tuition payment for an existing
            student enrollment.
          </p>
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
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            mt-12
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >

          {/* ENROLLMENT */}

          <div>
            <label
              htmlFor="enrollment"
              className="
                font-sans
                text-[12px]
                font-medium
                text-[#555]
              "
            >
              Student & Enrollment
            </label>

            <select
              id="enrollment"
              value={form.enrollmentId}
              onChange={(event) =>
                handleEnrollmentChange(
                  event.target.value
                )
              }
              disabled={
                loadingEnrollments || loading
              }
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3.5
                font-sans
                text-[14px]
                text-[#333]
                outline-none
                transition
                focus:border-[#6F8F72]
              "
            >
              <option value="">
                {loadingEnrollments
                  ? "Loading enrollments..."
                  : enrollments.length === 0
                    ? "No enrollments available"
                    : "Select a student enrollment"}
              </option>

              {enrollments.map((enrollment) => (
                <option
                  key={enrollment.id}
                  value={enrollment.id}
                >
                  {enrollment.students?.full_name ??
                    "Unknown Student"}{" "}
                  · {enrollment.package_name}
                </option>
              ))}
            </select>

            {enrollments.length === 0 &&
              !loadingEnrollments &&
              !error && (
                <p
                  className="
                    mt-2
                    font-sans
                    text-[12px]
                    text-[#888]
                  "
                >
                  No active enrollments were found.
                </p>
              )}
          </div>

          {/* PAYMENT DETAILS */}

          <div
            className="
              mt-8
              grid
              gap-6

              sm:grid-cols-2
            "
          >
            <div>
              <label
                htmlFor="amount"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Amount
              </label>

              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  updateField(
                    "amount",
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Currency
              </label>

              <select
                id="currency"
                value={form.currency}
                onChange={(event) =>
                  updateField(
                    "currency",
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              >
                <option value="KRW">
                  KRW
                </option>
                <option value="PHP">
                  PHP
                </option>
                <option value="USD">
                  USD
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentDate"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Payment Date
              </label>

              <input
                id="paymentDate"
                type="date"
                value={form.paymentDate}
                onChange={(event) =>
                  updateField(
                    "paymentDate",
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              />
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Payment Method
              </label>

              <select
                id="paymentMethod"
                value={form.paymentMethod}
                onChange={(event) =>
                  updateField(
                    "paymentMethod",
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              >
                <option value="Bank Transfer">
                  Bank Transfer
                </option>
                <option value="PayPal">
                  PayPal
                </option>
                <option value="GCash">
                  GCash
                </option>
                <option value="Cash">
                  Cash
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Status
              </label>

              <select
                id="status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value
                  )
                }
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              >
                <option value="paid">
                  Paid
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="partial">
                  Partial
                </option>
                <option value="refunded">
                  Refunded
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reference"
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  text-[#555]
                "
              >
                Reference
              </label>

              <input
                id="reference"
                type="text"
                value={form.reference}
                onChange={(event) =>
                  updateField(
                    "reference",
                    event.target.value
                  )
                }
                disabled={loading}
                placeholder="Optional"
                className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3.5
                  font-sans
                  text-[14px]
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              />
            </div>
          </div>

          {/* NOTES */}

          <div className="mt-6">
            <label
              htmlFor="notes"
              className="
                font-sans
                text-[12px]
                font-medium
                text-[#555]
              "
            >
              Notes
            </label>

            <textarea
              id="notes"
              rows={4}
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              disabled={loading}
              placeholder="Optional notes about this payment"
              className="
                mt-2
                w-full
                resize-none
                rounded-2xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3.5
                font-sans
                text-[14px]
                leading-6
                text-[#333]
                outline-none
                transition
                focus:border-[#6F8F72]
              "
            />
          </div>

          {/* ACTIONS */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push("/en/admin/payments")
              }
              disabled={loading}
              className="
                rounded-full
                border
                border-[#D8CCBE]
                px-6
                py-3
                font-sans
                text-[13px]
                font-medium
                text-[#666]
                transition
                hover:border-[#BFB1A2]
                hover:bg-[#FAF8F5]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingEnrollments ||
                enrollments.length === 0
              }
              className="
                rounded-full
                bg-[#6F8F72]
                px-7
                py-3
                font-sans
                text-[13px]
                font-medium
                text-white
                transition
                hover:bg-[#5F7F63]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Recording..."
                : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}