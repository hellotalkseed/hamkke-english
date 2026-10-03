import type { NextConfig } from "next";

const supabaseOrigin = "https://xjkqwoprmqptcroqnycr.supabase.co";
const turnstileOrigin = "https://challenges.cloudflare.com";

const contentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  script-src 'self' 'unsafe-inline' ${turnstileOrigin};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: ${supabaseOrigin};
  font-src 'self' data:;
  connect-src 'self' ${supabaseOrigin} ${turnstileOrigin};
  frame-src ${turnstileOrigin};
  media-src 'self' ${supabaseOrigin};
  worker-src 'self' blob:;
  manifest-src 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
