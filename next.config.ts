import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["pptxgenjs"],
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
