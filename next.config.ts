import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "your-production-domain.com"],
  },
};

export default nextConfig;
