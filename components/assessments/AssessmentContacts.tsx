import { contactName, requiredContactMethods, type ContactDetails } from "@/lib/assessments/contactDetails";

export default function AssessmentContacts({ id, method, platform, details, legacyId }: {
  id: string; method: string | null; platform: string;
  details?: ContactDetails | null; legacyId?: string | null;
}) {
  const keys = details && Object.keys(details).length
    ? requiredContactMethods(method || "email", platform).filter(key => details[key])
    : [];
  return (
    <div className="space-y-2 break-words text-sm">
      <p>Preferred contact · {contactName(method || "email")}</p>
      {keys.map(key => (
        <div key={key}>
          <span className="font-medium">{contactName(key)} · </span>
          {details![key].mode === "qr" ? (
            <a href={`/api/admin/assessments/${id}/contact-qr?method=${encodeURIComponent(key)}`}
              target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">View QR code</a>
          ) : <span className="select-text break-all">{details![key].value}</span>}
        </div>
      ))}
      {!keys.length && legacyId && method !== "email" && (
        <p className="select-text break-all">{legacyId}</p>
      )}
    </div>
  );
}
