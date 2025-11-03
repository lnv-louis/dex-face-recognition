import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable detailed logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Show detailed error pages
  reactStrictMode: true,
};

export default nextConfig;
