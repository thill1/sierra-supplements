import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Resolve from project root so Tailwind and deps are found when parent has lockfiles
    root: process.cwd(),
  },
};

export default nextConfig;
