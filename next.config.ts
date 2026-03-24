import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { siteConfig } from "./src/lib/site-config";

const nextConfig: NextConfig = {
    turbopack: {
        root: process.cwd(),
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    async headers() {
        const security = [
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            {
                key: "Permissions-Policy",
                value:
                    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
            },
        ];

        return [
            {
                source: "/:path*",
                headers: security,
            },
        ];
    },
    async redirects() {
        const base = siteConfig.url.replace(/\/$/, "");
        return siteConfig.redirectHosts.map((host) => ({
            source: "/:path*",
            has: [{ type: "host" as const, value: host }],
            destination: `${base}/:path*`,
            permanent: true,
        }));
    },
};

export default withSentryConfig(nextConfig, {
    silent: true,
    /** Avoid ad-blockers blocking ingest; same-origin tunnel forwards to Sentry. */
    tunnelRoute: "/monitoring",
    widenClientFileUpload: true,
});
