import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/admin/",
        "/portal/",
        "/en/admin/",
        "/ko/admin/",
        "/zh/admin/",
        "/ja/admin/",
        "/en/portal/",
        "/ko/portal/",
        "/zh/portal/",
        "/ja/portal/",
      ],
    },
    sitemap: "https://hamkkeenglish.com/sitemap.xml",
  };
}
