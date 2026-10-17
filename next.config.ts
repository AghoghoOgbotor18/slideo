import type { NextConfig } from "next";

const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
