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
  status: string;
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
    amountKrw: "",
    amountPhp: "",
    paymentDate: new Date()
      .toISOString()
      .split("T")[0],
    paymentMethod: "Bank Transfer",
    status: "pending",
    reference: "",
    notes: "",
  });

  /* ---------------------------------------------------------------------- */
  /* LOAD ENROLLMENTS                                                       */
  /* ---------------------------------------------------------------------- */

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
          status,
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
            status: enrollment.status,
            students: student,
          };
        });

      setEnrollments(normalizedEnrollments);
      setLoadingEnrollments(false);
    }

    loadEnrollments();
  }, [supabase]);

  /* ---------------------------------------------------------------------- */
  /* FORM HELPERS                                                           */
  /* ---------------------------------------------------------------------- */

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
      setForm((current) => ({
        ...current,
        enrollmentId: "",
        amountKrw: "",
        amountPhp: "",
      }));

      return;
    }

    /*
     * Hamkke's primary enrollment tuition is stored in KRW.
     *
     * PHP is entered separately because it represents
     * the actual PHP value received.
     */

    const isKrw =
      selected.currency?.toUpperCase() === "KRW";

    setForm((current) => ({
      ...current,
      enrollmentId,
      amountKrw: isKrw
        ? String(selected.tuition_amount)
        : "",
      amountPhp: "",
    }));
  }

  /* ---------------------------------------------------------------------- */
  /* SUBMIT                                                                 */
  /* ---------------------------------------------------------------------- */

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

    if (!form.amountKrw) {
      setError("Please enter the KRW amount.");
      setLoading(false);
      return;
    }

    if (!form.amountPhp) {
      setError("Please enter the PHP amount.");
      setLoading(false);
      return;
    }

    if (!form.paymentDate) {
      setError("Please enter the payment date.");
      setLoading(false);
      return;
    }

    try {
      /*
       * --------------------------------------------------------------------
       * RECORD PAYMENT
       * --------------------------------------------------------------------
       *
       * IMPORTANT:
       *
       * This page records the payment only.
       *
       * The database trigger is responsible for activation.
       *
       * When a payment changes:
       *
       *     pending -> paid
       *
       * the database will:
       *
       * 1. Activate THIS payment's enrollment
       * 2. Activate THIS enrollment's contract
       * 3. Generate THIS enrollment's lessons
       *
       * We intentionally do NOT call the lesson-generation RPC
       * or update the enrollment status here.
       */

      const { error: paymentError } =
        await supabase
          .from("payments")
          .insert({
            enrollment_id: form.enrollmentId,

            /*
             * Existing compatibility fields.
             */
            amount: Number(form.amountKrw),
            currency: "KRW",

            /*
             * Permanent currency values.
             */
            amount_krw: Number(form.amountKrw),
            amount_php: Number(form.amountPhp),

            payment_date: form.paymentDate,
            payment_method: form.paymentMethod,
            status: form.status,

            reference:
              form.reference.trim() || null,

            notes:
              form.notes.trim() || null,
          });

      if (paymentError) {
        throw new Error(
          `Could not record payment: ${paymentError.message}`
        );
      }

      /*
       * --------------------------------------------------------------------
       * REDIRECT
       * --------------------------------------------------------------------
       *
       * If the payment was saved as pending:
       *
       *     enrollment remains pending
       *
       * If this page is later changed to create a paid payment directly,
       * an INSERT trigger would be required for automatic activation.
       *
       * The current database trigger intentionally handles
       * pending -> paid updates.
       */

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

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

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
            Record the tuition payment in both KRW
            and PHP for an existing enrollment.
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
                  {" · "}
                  {enrollment.status}
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
                  No enrollments were found.
                </p>
              )}
          </div>

          {/* PAYMENT AMOUNTS */}

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-[#E7DDD1]
              bg-[#FAF8F5]
              p-5
              sm:p-6
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
                Payment Amount
              </p>

              <p
                className="
                  mt-1
                  font-serif
                  text-[15px]
                  text-[#777]
                "
              >
                Record both the Korean payment amount
                and its PHP value.
              </p>
            </div>

            <div
              className="
                mt-5
                grid
                gap-5
                sm:grid-cols-2
              "
            >

              {/* KRW */}

              <div>
                <label
                  htmlFor="amountKrw"
                  className="
                    font-sans
                    text-[12px]
                    font-medium
                    text-[#555]
                  "
                >
                  KRW Amount
                </label>

                <div className="relative mt-2">
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      font-sans
                      text-[14px]
                      text-[#777]
                    "
                  >
                    ₩
                  </span>

                  <input
                    id="amountKrw"
                    type="number"
                    min="0"
                    step="1"
                    value={form.amountKrw}
                    onChange={(event) =>
                      updateField(
                        "amountKrw",
                        event.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="75,000"
                    className="
                      mt-0
                      w-full
                      rounded-2xl
                      border
                      border-[#D8CCBE]
                      bg-white
                      py-3.5
                      pl-9
                      pr-4
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

              {/* PHP */}

              <div>
                <label
                  htmlFor="amountPhp"
                  className="
                    font-sans
                    text-[12px]
                    font-medium
                    text-[#555]
                  "
                >
                  PHP Amount
                </label>

                <div className="relative mt-2">
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      font-sans
                      text-[14px]
                      text-[#777]
                    "
                  >
                    ₱
                  </span>

                  <input
                    id="amountPhp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountPhp}
                    onChange={(event) =>
                      updateField(
                        "amountPhp",
                        event.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="3,150"
                    className="
                      mt-0
                      w-full
                      rounded-2xl
                      border
                      border-[#D8CCBE]
                      bg-white
                      py-3.5
                      pl-9
                      pr-4
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
            </div>
          </div>

          {/* OTHER PAYMENT DETAILS */}

          <div
            className="
              mt-8
              grid
              gap-6

              sm:grid-cols-2
            "
          >

            {/* PAYMENT DATE */}

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

            {/* PAYMENT METHOD */}

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

            {/* STATUS */}

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
                <option value="pending">
                  Pending
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="partial">
                  Partial
                </option>

                <option value="refunded">
                  Refunded
                </option>
              </select>
            </div>

            {/* REFERENCE */}

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

          {/* PAYMENT CONFIRMATION NOTICE */}

          {form.status === "paid" && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-[#DCE6D9]
                bg-[#F4F7F2]
                px-5
                py-4
              "
            >
              <p
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#5F7F63]
                "
              >
                Payment confirmed
              </p>

              <p
                className="
                  mt-1.5
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#666]
                "
              >
                This payment will activate the
                selected enrollment, activate its
                contract, and generate its lessons
                automatically.
              </p>
            </div>
          )}

          {/* PENDING NOTICE */}

          {form.status !== "paid" && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-[#E7DDD1]
                bg-[#FAF8F5]
                px-5
                py-4
              "
            >
              <p
                className="
                  font-sans
                  text-[12px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#777]
                "
              >
                Payment not yet confirmed
              </p>

              <p
                className="
                  mt-1.5
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#666]
                "
              >
                The enrollment will remain pending
                until this payment is changed to
                Paid.
              </p>
            </div>
          )}

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
                : form.status === "paid"
                  ? "Confirm Payment"
                  : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}