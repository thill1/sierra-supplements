import { parseAdminEmailAllowlist } from "@/lib/admin-allowlist";
import { isSharedRateLimitingConfigured } from "@/lib/rate-limit";
import { isStripeMockMode } from "@/lib/stripe/mock-mode";

/**
 * Fail fast when a production deployment is misconfigured.
 * Runs on Vercel (preview + production). Local `next build` is skipped unless
 * `FORCE_PRODUCTION_ENV_CHECK=true`. Set `SKIP_PRODUCTION_ENV_CHECK=true` only for emergencies.
 */
export function assertProductionEnv(): void {
    if (process.env.NODE_ENV !== "production") return;
    if (process.env.SKIP_PRODUCTION_ENV_CHECK === "true") return;

    const onVercel = process.env.VERCEL === "1";
    const forceLocal = process.env.FORCE_PRODUCTION_ENV_CHECK === "true";
    if (!onVercel && !forceLocal) return;

    const missing: string[] = [];

    if (!process.env.NEXTAUTH_SECRET?.trim()) {
        missing.push("NEXTAUTH_SECRET");
    }

    const siteUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
    if (!siteUrl?.trim()) {
        missing.push("NEXTAUTH_URL (or AUTH_URL)");
    }

    const dbUrl =
        process.env.DATABASE_URL ??
        process.env.POSTGRES_URL ??
        process.env.POSTGRES_URL_NON_POOLING;
    if (!dbUrl?.trim()) {
        missing.push("DATABASE_URL (or POSTGRES_URL from Vercel integration)");
    }

    const allow = parseAdminEmailAllowlist();
    if (allow.size === 0) {
        missing.push("ADMIN_EMAILS (comma-separated admin emails)");
    }

    if (process.env.STRIPE_MOCK_MODE?.trim() && !isStripeMockMode()) {
        missing.push("STRIPE_MOCK_MODE must be disabled in production");
    }

    if (!isSharedRateLimitingConfigured()) {
        missing.push(
            "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
        );
    }

    if (missing.length > 0) {
        throw new Error(
            `[production-env] Missing or invalid: ${missing.join(
                "; ",
            )}. See README and docs/DEPLOYMENT.md.`,
        );
    }
}
