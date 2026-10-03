"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReflectionActions({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<
    "approve" | "reject" | null
  >(null);

  const approveReflection = async () => {
    if (loading) return;

    setLoading("approve");

    try {
      const response = await fetch(
        `/api/admin/reflections/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approved: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Approval failed.");
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Reflection approval failed:",
        error
      );
      alert("Could not approve reflection.");
    } finally {
      setLoading(null);
    }
  };

  const rejectReflection = async () => {
    if (loading) return;

    const confirmed = confirm(
      "Are you sure you want to delete this reflection?"
    );

    if (!confirmed) return;

    setLoading("reject");

    try {
      const response = await fetch(
        `/api/admin/reflections/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Rejection failed.");
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Reflection rejection failed:",
        error
      );
      alert("Could not delete reflection.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-8 flex gap-4">
      <button
        type="button"
        onClick={approveReflection}
        disabled={loading !== null}
        className="
          rounded-full
          bg-[#6F8F72]
          px-6
          py-3
          text-white
          transition
          hover:bg-[#5B7960]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading === "approve"
          ? "Approving..."
          : "Approve"}
      </button>

      <button
        type="button"
        onClick={rejectReflection}
        disabled={loading !== null}
        className="
          rounded-full
          border
          border-red-300
          px-6
          py-3
          text-red-500
          transition
          hover:bg-red-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading === "reject"
          ? "Rejecting..."
          : "Reject"}
      </button>
    </div>
  );
}