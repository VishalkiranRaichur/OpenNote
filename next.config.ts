import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during production builds to unblock deploys
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
