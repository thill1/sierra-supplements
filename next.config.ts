import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { siteConfig } from "./src/lib/site-config";

const isDev = process.env.NODE_ENV !== "production";

const productionCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com https://cal.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://app.cal.com https://cal.com https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
    // Maps embed uses www.google.com; explicit hosts avoid wildcard parsing gaps in some UAs.
    "frame-src https://cal.com https://app.cal.com https://www.google.com https://maps.google.com",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
].join("; ");

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

        if (!isDev) {
            security.push({
                key: "Content-Security-Policy",
                value: productionCsp,
            });
        }

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
