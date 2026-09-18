import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xjkqwoprmqptcroqnycr.supabase.co",
        pathname: "/storage/v1/object/public/teacher-avatars/**",
      },
    ],
  },
};

export default nextConfig;