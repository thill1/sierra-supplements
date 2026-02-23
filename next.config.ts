import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/sierra-supplements" : undefined,
  assetPrefix: process.env.NODE_ENV === "production" ? "/sierra-supplements/" : undefined,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
