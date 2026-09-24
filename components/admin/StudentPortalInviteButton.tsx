"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentPortalInviteButton({
  studentId,
  email,
  hasEnrollment,
  existingStatus,
  locale,
}: {
  studentId: string;
  email: string | null;
  hasEnrollment: boolean;
  existingStatus: string | null;
  locale: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isExisting = Boolean(existingStatus);
  const isInvitationPending = existingStatus === "invited";

  const unavailableReason = !email
    ? "Add an email address to the student record before sending an invitation."
    : !hasEnrollment
      ? "An active enrollment is required before portal access can be enabled."
      : null;

  async function invite() {
    if (loading || unavailableReason) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/admin/students/${studentId}/portal-account/invite?locale=${encodeURIComponent(locale)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: isExisting ? "resend" : "invite" }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "Unable to send the portal invitation.");
        return;
      }
      setMessage(
        typeof payload.message === "string"
          ? payload.message
          : isExisting
            ? "A new portal access email was sent to the student."
            : "Invitation sent. The student can open the email and create their password."
      );
      router.refresh();
    } catch {
      setError("Unable to send the portal invitation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={invite}
        disabled={loading || Boolean(unavailableReason)}
        className="rounded-full bg-[#31463A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#465D4D] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading
          ? isExisting
            ? "Sending new invitation..."
            : "Sending invitation..."
          : isExisting
            ? "Resend Invitation"
            : "Invite to Student Portal"}
      </button>
      {isExisting && !unavailableReason && (
        <p className="mt-3 text-sm leading-6 text-[#7A746D]">
          A portal account is already linked to this student. Resend only if they need a new setup or access email.
        </p>
      )}
      {unavailableReason && <p className="mt-3 text-sm leading-6 text-[#7A746D]">{unavailableReason}</p>}
      {message && <p role="status" className="mt-3 text-sm leading-6 text-[#55705B]">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm leading-6 text-[#874C3D]">{error}</p>}
    </div>
  );
}
