import Document from "@/components/admin/contracts/EnrollmentContractDocument";
export default async function Page({ params }: { params: Promise<{ locale: string; id: string; enrollmentId: string }> }) {
  return <Document params={params} />;
}
