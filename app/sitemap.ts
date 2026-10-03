import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { localizedAlternates, siteUrl } from "@/lib/seo/publicMetadata";

// Only canonical public pages; /inquiry redirects to /assessment.
const publicPaths = ["", "/about", "/how-it-works", "/lessons", "/teachers", "/policy", "/reflections", "/assessment", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap(path => locales.map(locale => ({
    url: `${siteUrl}/${locale}${path}`,
    alternates: { languages: localizedAlternates(path) },
  })));
}
