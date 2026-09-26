import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyAdminLoginPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const destination = new URLSearchParams();

  for (const key of ["error", "actual"]) {
    const value = query[key];
    if (typeof value === "string" && value) {
      destination.set(key, value);
    }
  }

  const suffix = destination.toString();
  redirect(`/${locale}/portal/login${suffix ? `?${suffix}` : ""}`);
}
