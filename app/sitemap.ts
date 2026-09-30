import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const siteUrl = "https://hamkkeenglish.com";

const publicPaths = [
  "",
  "/about",
  "/how-it-works",
  "/lessons",
  "/teachers",
  "/policy",
  "/reflections",
  "/assessment",
  "/inquiry",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${siteUrl}/${locale}${path}`,
      ])
    );

    return locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages,
      },
    }));
  });
}