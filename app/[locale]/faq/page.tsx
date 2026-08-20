import { notFound } from "next/navigation";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";
import FAQClient from "./FAQClient";

interface FAQPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function FAQPage({
  params,
}: FAQPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);

  return (
    <FAQClient
      locale={locale}
      faq={t.faq}
    />
  );
}