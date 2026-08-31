import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

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
    .single();

  if (studentError || !student) {
    throw new Error("Student not found.");
  }

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
    throw new Error(
      `Unable to load students: ${studentsError.message}`
    );
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