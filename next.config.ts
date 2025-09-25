import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add configuration options here
  reactStrictMode: true,
  
  // In newer Next.js versions, the appDir is no longer experimental
  // but enabled by default. We'll keep both app and pages directories.
};

export default nextConfig;
