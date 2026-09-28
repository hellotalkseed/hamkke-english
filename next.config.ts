import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/admin/teachers/*/contract": ["./lib/teacher-agreements/*.md"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xjkqwoprmqptcroqnycr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;