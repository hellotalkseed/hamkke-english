"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

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

const SUPPORTED_CURRENCIES = [
  "KRW",
  "CNY",
  "USD",
  "PHP",
] as const;

type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

function normalizeCurrency(
  value: string | null | undefined
): SupportedCurrency {
  const normalized =
    value?.toUpperCase() ?? "KRW";

  return SUPPORTED_CURRENCIES.includes(
    normalized as SupportedCurrency
  )
    ? (normalized as SupportedCurrency)
    : "KRW";
}

function getCurrencySymbol(
  currency: SupportedCurrency
) {
  switch (currency) {
    case "KRW":
      return "₩";

    case "CNY":
      return "¥";

    case "USD":
      return "$";

    case "PHP":
      return "₱";

    default:
      return "";
  }
}

function getCurrencyLabel(
  currency: SupportedCurrency
) {
  switch (currency) {
    case "KRW":
      return "Korean Won";

    case "CNY":
      return "Chinese Yuan (RMB)";

    case "USD":
      return "US Dollar";

    case "PHP":
      return "Philippine Peso";

    default:
      return currency;
  }
}

function getCurrencyStep(
  currency: SupportedCurrency
) {
  return currency === "KRW"
    ? "1"
    : "0.01";
}

function getCurrencyPlaceholder(
  currency: SupportedCurrency
) {
  switch (currency) {
    case "KRW":
      return "75000";

    case "CNY":
      return "900";

    case "USD":
      return "120";

    case "PHP":
      return "7000";

    default:
      return "";
  }
}

export default function NewPaymentPage() {
  const router = useRouter();

  const params = useParams<{
    locale?: string;
  }>();

  const locale =
    typeof params?.locale === "string"
      ? params.locale
      : "en";

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [
    loadingEnrollments,
    setLoadingEnrollments,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      enrollmentId: "",
      amountOriginal: "",
      amountPhp: "",
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
      paymentMethod: "Bank Transfer",
      status: "pending",
      reference: "",
      notes: "",
    });

  /* ========================================================================= */
  /* LOAD ENROLLMENTS                                                          */
  /* ========================================================================= */

  useEffect(() => {
    async function loadEnrollments() {
      setLoadingEnrollments(true);
      setError("");

      const { data, error } =
        await supabase
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
        console.error(
          "Error loading enrollments:",
          error
        );

        setError(
          `Could not load enrollments: ${error.message}`
        );

        setLoadingEnrollments(false);
        return;
      }

      const normalizedEnrollments: Enrollment[] =
        (data ?? []).map(
          (enrollment) => {
            const student =
              Array.isArray(
                enrollment.students
              )
                ? enrollment.students[0] ??
                  null
                : enrollment.students ??
                  null;

            return {
              id: enrollment.id,

              package_name:
                enrollment.package_name ??
                "Enrollment",

              tuition_amount: Number(
                enrollment.tuition_amount ??
                  0
              ),

              currency:
                normalizeCurrency(
                  enrollment.currency
                ),

              status:
                enrollment.status ??
                "pending",

              students: student,
            };
          }
        );

      setEnrollments(
        normalizedEnrollments
      );

      setLoadingEnrollments(false);
    }

    loadEnrollments();
  }, [supabase]);

  /* ========================================================================= */
  /* SELECTED ENROLLMENT                                                       */
  /* ========================================================================= */

  const selectedEnrollment =
    useMemo(() => {
      return enrollments.find(
        (enrollment) =>
          enrollment.id ===
          form.enrollmentId
      );
    }, [
      enrollments,
      form.enrollmentId,
    ]);

  const selectedCurrency =
    normalizeCurrency(
      selectedEnrollment?.currency
    );

  const selectedCurrencySymbol =
    getCurrencySymbol(
      selectedCurrency
    );

  const selectedCurrencyLabel =
    getCurrencyLabel(
      selectedCurrency
    );

  /* ========================================================================= */
  /* FORM HELPERS                                                              */
  /* ========================================================================= */

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
    const selected =
      enrollments.find(
        (enrollment) =>
          enrollment.id ===
          enrollmentId
      );

    if (!selected) {
      setForm((current) => ({
        ...current,
        enrollmentId: "",
        amountOriginal: "",
        amountPhp: "",
      }));

      return;
    }

    setForm((current) => ({
      ...current,

      enrollmentId,

      /*
       * The enrollment already stores the
       * agreed tuition in its own currency.
       */
      amountOriginal: String(
        selected.tuition_amount
      ),

      /*
       * PHP remains separate because this is
       * the actual amount Hamkke received.
       */
      amountPhp: "",
    }));
  }

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  function validateForm() {
    if (!form.enrollmentId) {
      return "Please select an enrollment.";
    }

    if (!selectedEnrollment) {
      return "The selected enrollment could not be found.";
    }

    if (
      !form.amountOriginal ||
      Number(form.amountOriginal) <= 0
    ) {
      return `Please enter the ${selectedCurrency} payment amount.`;
    }

    if (
      !form.amountPhp ||
      Number(form.amountPhp) <= 0
    ) {
      return "Please enter the actual PHP amount received.";
    }

    if (!form.paymentDate) {
      return "Please enter the payment date.";
    }

    return null;
  }

  /* ========================================================================= */
  /* SUBMIT                                                                    */
  /* ========================================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (!selectedEnrollment) {
      setError(
        "The selected enrollment could not be found."
      );
      setLoading(false);
      return;
    }

    try {
      const currency =
        normalizeCurrency(
          selectedEnrollment.currency
        );

      const originalAmount =
        Number(
          form.amountOriginal
        );

      const phpAmount =
        Number(form.amountPhp);

      /*
       * =======================================================================
       * PAYMENT STRUCTURE
       * =======================================================================
       *
       * amount
       *     Agreed amount in the enrollment's
       *     original payment currency.
       *
       * currency
       *     KRW / CNY / USD / PHP.
       *
       * amount_krw
       *     Legacy compatibility field.
       *     Populated only for KRW payments.
       *
       * amount_php
       *     Actual PHP amount received.
       *
       * The Overview page uses amount_php.
       */

      const paymentPayload = {
        enrollment_id:
          form.enrollmentId,

        amount:
          originalAmount,

        currency,

        amount_krw:
          currency === "KRW"
            ? originalAmount
            : null,

        amount_php:
          phpAmount,

        /*
         * Keep the legacy field empty rather
         * than writing conflicting data.
         */
        amount_received_php:
          null,

        payment_date:
          form.paymentDate,

        payment_method:
          form.paymentMethod,

        status:
          form.status,

        reference:
          form.reference.trim() ||
          null,

        notes:
          form.notes.trim() ||
          null,
      };

      console.log(
        "Recording payment:",
        paymentPayload
      );

      const {
        error: paymentError,
      } = await supabase
        .from("payments")
        .insert(
          paymentPayload
        );

      if (paymentError) {
        console.error(
          "Payment insert error:",
          paymentError
        );

        throw new Error(
          `Could not record payment: ${paymentError.message}`
        );
      }

      router.push(
        `/${locale}/admin/payments`
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Payment submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while recording the payment."
      );

      setLoading(false);
    }
  }

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

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

        {/* ================================================================= */}
        {/* BACK                                                              */}
        {/* ================================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/${locale}/admin/payments`
            )
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

        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}

        <div className="mt-10">
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.18em]
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
              leading-[1.05]
              tracking-[-0.035em]

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
              text-[19px]
              leading-8
              text-[#74716B]

              sm:text-[21px]
            "
          >
            Record the agreed tuition amount in the
            student's payment currency and the actual
            PHP amount received.
          </p>
        </div>

        {/* ================================================================= */}
        {/* ERROR                                                             */}
        {/* ================================================================= */}

        {error && (
          <div
            className="
              mt-10
              border
              border-[#E7CFC8]
              bg-[#F8ECE8]
              px-5
              py-4
              font-sans
              text-[13px]
              leading-6
              text-[#8A5148]
            "
          >
            {error}
          </div>
        )}

        {/* ================================================================= */}
        {/* FORM                                                              */}
        {/* ================================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            mt-12
            border-y
            border-[#DCD8D2]
            py-9

            sm:py-11
          "
        >

          {/* =============================================================== */}
          {/* STUDENT / ENROLLMENT                                            */}
          {/* =============================================================== */}

          <section>
            <div className="mb-4">
              <p
                className="
                  font-sans
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-[#8A8A84]
                "
              >
                Enrollment
              </p>

              <p
                className="
                  mt-1.5
                  font-serif
                  text-[15px]
                  text-[#74716B]
                "
              >
                Select the enrollment receiving this
                payment.
              </p>
            </div>

            <select
              id="enrollment"
              value={form.enrollmentId}
              onChange={(event) =>
                handleEnrollmentChange(
                  event.target.value
                )
              }
              disabled={
                loadingEnrollments ||
                loading
              }
              className="
                w-full
                border
                border-[#D8CCBE]
                bg-white
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
                  : enrollments.length ===
                      0
                    ? "No enrollments available"
                    : "Select a student enrollment"}
              </option>

              {enrollments.map(
                (enrollment) => {
                  const studentName =
                    enrollment.students
                      ?.preferred_name ||
                    enrollment.students
                      ?.full_name ||
                    "Unknown Student";

                  const currency =
                    normalizeCurrency(
                      enrollment.currency
                    );

                  const symbol =
                    getCurrencySymbol(
                      currency
                    );

                  return (
                    <option
                      key={enrollment.id}
                      value={enrollment.id}
                    >
                      {studentName}
                      {" · "}
                      {
                        enrollment.package_name
                      }
                      {" · "}
                      {currency}{" "}
                      {symbol}
                      {enrollment.tuition_amount.toLocaleString()}
                      {" · "}
                      {enrollment.status}
                    </option>
                  );
                }
              )}
            </select>

            {enrollments.length ===
              0 &&
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
          </section>

          {/* =============================================================== */}
          {/* PAYMENT AMOUNTS                                                 */}
          {/* =============================================================== */}

          <section
            className="
              mt-12
              border-t
              border-[#E7E1DA]
              pt-9
            "
          >
            <div>
              <p
                className="
                  font-sans
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-[#8A8A84]
                "
              >
                Amount
              </p>

              <p
                className="
                  mt-1.5
                  font-serif
                  text-[15px]
                  text-[#74716B]
                "
              >
                The first amount follows the
                enrollment's payment currency. PHP
                records what you actually received.
              </p>
            </div>

            <div
              className="
                mt-6
                grid
                gap-6
                sm:grid-cols-2
              "
            >

              {/* ORIGINAL CURRENCY */}

              <div>
                <label
                  htmlFor="amountOriginal"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#77736B]
                  "
                >
                  Tuition ·{" "}
                  {selectedEnrollment
                    ? selectedCurrency
                    : "Currency"}
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
                      text-[#77736B]
                    "
                  >
                    {selectedEnrollment
                      ? selectedCurrencySymbol
                      : "¤"}
                  </span>

                  <input
                    id="amountOriginal"
                    type="number"
                    min="0.01"
                    step={getCurrencyStep(
                      selectedCurrency
                    )}
                    value={
                      form.amountOriginal
                    }
                    onChange={(event) =>
                      updateField(
                        "amountOriginal",
                        event.target.value
                      )
                    }
                    disabled={
                      loading ||
                      !selectedEnrollment
                    }
                    placeholder={
                      selectedEnrollment
                        ? getCurrencyPlaceholder(
                            selectedCurrency
                          )
                        : "Select enrollment"
                    }
                    className="
                      w-full
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
                      disabled:bg-[#F3F1EE]
                      disabled:text-[#99958E]
                    "
                  />
                </div>

                <p
                  className="
                    mt-2
                    font-sans
                    text-[11px]
                    text-[#99958E]
                  "
                >
                  {selectedEnrollment
                    ? `Agreed tuition · ${selectedCurrencyLabel}`
                    : "Select an enrollment to load its tuition"}
                </p>
              </div>

              {/* PHP */}

              <div>
                <label
                  htmlFor="amountPhp"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#6F8F72]
                  "
                >
                  Amount Received · PHP
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
                      text-[#6F8F72]
                    "
                  >
                    ₱
                  </span>

                  <input
                    id="amountPhp"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      form.amountPhp
                    }
                    onChange={(event) =>
                      updateField(
                        "amountPhp",
                        event.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="7000"
                    className="
                      w-full
                      border
                      border-[#BFCDBD]
                      bg-[#F7F9F5]
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

                <p
                  className="
                    mt-2
                    font-sans
                    text-[11px]
                    text-[#8A8A84]
                  "
                >
                  Actual PHP received
                </p>
              </div>
            </div>
          </section>

          {/* =============================================================== */}
          {/* OTHER DETAILS                                                   */}
          {/* =============================================================== */}

          <section
            className="
              mt-12
              border-t
              border-[#E7E1DA]
              pt-9
            "
          >
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
              "
            >

              {/* DATE */}

              <div>
                <label
                  htmlFor="paymentDate"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#77736B]
                  "
                >
                  Payment Date
                </label>

                <input
                  id="paymentDate"
                  type="date"
                  value={
                    form.paymentDate
                  }
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
                    border
                    border-[#D8CCBE]
                    bg-white
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

              {/* METHOD */}

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#77736B]
                  "
                >
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  value={
                    form.paymentMethod
                  }
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
                    border
                    border-[#D8CCBE]
                    bg-white
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
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#77736B]
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
                    border
                    border-[#D8CCBE]
                    bg-white
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
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[#77736B]
                  "
                >
                  Reference
                </label>

                <input
                  id="reference"
                  type="text"
                  value={
                    form.reference
                  }
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
                    border
                    border-[#D8CCBE]
                    bg-white
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
          </section>

          {/* =============================================================== */}
          {/* NOTES                                                           */}
          {/* =============================================================== */}

          <section
            className="
              mt-8
              border-t
              border-[#E7E1DA]
              pt-8
            "
          >
            <label
              htmlFor="notes"
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.1em]
                text-[#77736B]
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
                border
                border-[#D8CCBE]
                bg-white
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
          </section>

          {/* =============================================================== */}
          {/* PAYMENT CONFIRMATION                                            */}
          {/* =============================================================== */}

          {form.status === "paid" && (
            <div
              className="
                mt-8
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
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#5F7F63]
                "
              >
                Payment confirmed
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
                This payment will activate the
                selected enrollment, activate its
                contract, and generate its lessons
                automatically.
              </p>
            </div>
          )}

          {form.status !== "paid" && (
            <div
              className="
                mt-8
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
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-[#777]
                "
              >
                Payment not yet confirmed
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
                The enrollment will remain pending
                until this payment is changed to
                Paid.
              </p>
            </div>
          )}

          {/* =============================================================== */}
          {/* ACTIONS                                                         */}
          {/* =============================================================== */}

          <div
            className="
              mt-9
              flex
              flex-col-reverse
              gap-3

              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/${locale}/admin/payments`
                )
              }
              disabled={loading}
              className="
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
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingEnrollments ||
                enrollments.length ===
                  0
              }
              className="
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
