/** Full name first, with a distinct saved preferred name in parentheses. */
export function formatDocumentStudentName(student: {
  full_name?: string | null;
  preferred_name?: string | null;
}): string {
  const full = student.full_name?.trim() ?? "";
  const preferred = student.preferred_name?.trim() ?? "";
  if (!full) return preferred;
  if (!preferred || preferred.toLowerCase() === full.toLowerCase()) return full;
  return `${full} (${preferred})`;
}
