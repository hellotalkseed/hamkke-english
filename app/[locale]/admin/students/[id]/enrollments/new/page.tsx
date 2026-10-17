import { notFound } from "next/navigation";
import { requireOwnerDataClient } from "@/lib/supabase/owner-data";
import NewEnrollmentForm from "./NewEnrollmentForm";

interface NewEnrollmentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function NewEnrollmentPage({
  params,
}: NewEnrollmentPageProps) {
  const { locale, id } = await params;

  const supabase = await requireOwnerDataClient(locale);

  /* ================================================================ */
  /* LOAD CURRENT STUDENT                                             */
  /* ================================================================ */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id, full_name, preferred_name")
    .eq("id", id)
    .maybeSingle();

  if (studentError) {
    console.error("New enrollment student lookup failed:", studentError);
    throw new Error("Unable to load student for enrollment.");
  }
  if (!student) notFound();

  /* ================================================================ */
  /* LOAD ALL STUDENTS                                                 */
  /* ================================================================ */

  const {
    data: students,
    error: studentsError,
  } = await supabase
    .from("students")
    .select("id, full_name, preferred_name")
    .order("full_name", { ascending: true });

  if (studentsError) {
    console.error("New enrollment student list failed:", studentsError);
    throw new Error("Unable to load students for enrollment.");
  }

  /* ================================================================ */
  /* RETURN FORM                                                       */
  /* ================================================================ */

  return (
    <NewEnrollmentForm
      locale={locale}
      student={{
        id: student.id,
        full_name: student.full_name,
        preferred_name: student.preferred_name,
      }}
      students={
        students?.map((item) => ({
          id: item.id,
          full_name: item.full_name,
          preferred_name: item.preferred_name,
        })) ?? []
      }
    />
  );
}