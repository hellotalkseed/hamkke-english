import Document from "@/components/admin/contracts/IndividualContractDocument";
export default async function Page({ params }: { params: Promise<{ locale: string; id: string; contractId: string }> }) {
  return <Document params={params} />;
}
