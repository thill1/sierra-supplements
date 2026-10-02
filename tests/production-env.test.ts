import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertProductionEnv } from "@/lib/production-env";

describe("assertProductionEnv", () => {
    const envSnapshot = {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        FORCE_PRODUCTION_ENV_CHECK: process.env.FORCE_PRODUCTION_ENV_CHECK,
        SKIP_PRODUCTION_ENV_CHECK: process.env.SKIP_PRODUCTION_ENV_CHECK,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL: process.env.DATABASE_URL,
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
        VALOR_HOSTED_PAGE_URL: process.env.VALOR_HOSTED_PAGE_URL,
        VALOR_APP_ID: process.env.VALOR_APP_ID,
        VALOR_APP_KEY: process.env.VALOR_APP_KEY,
        VALOR_EPI: process.env.VALOR_EPI,
        STRIPE_MOCK_MODE: process.env.STRIPE_MOCK_MODE,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    };

    beforeEach(() => {
        process.env.NODE_ENV = "production";
        process.env.VERCEL = "1";
        delete process.env.FORCE_PRODUCTION_ENV_CHECK;
        delete process.env.SKIP_PRODUCTION_ENV_CHECK;
        process.env.NEXTAUTH_SECRET = "secret";
        process.env.NEXTAUTH_URL = "https://example.com";
        process.env.DATABASE_URL = "postgresql://example";
        process.env.ADMIN_EMAILS = "admin@example.com";
        process.env.PAYMENT_PROVIDER = "valor";
        process.env.VALOR_HOSTED_PAGE_URL =
            "https://securelink-prod.valorpaytech.com:4430/";
        process.env.VALOR_APP_ID = "app-id";
        process.env.VALOR_APP_KEY = "app-key";
        process.env.VALOR_EPI = "epi";
        delete process.env.STRIPE_MOCK_MODE;
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    afterEach(() => {
        process.env.NODE_ENV = envSnapshot.NODE_ENV;
        process.env.VERCEL = envSnapshot.VERCEL;
        process.env.FORCE_PRODUCTION_ENV_CHECK =
            envSnapshot.FORCE_PRODUCTION_ENV_CHECK;
        process.env.SKIP_PRODUCTION_ENV_CHECK =
            envSnapshot.SKIP_PRODUCTION_ENV_CHECK;
        process.env.NEXTAUTH_SECRET = envSnapshot.NEXTAUTH_SECRET;
        process.env.NEXTAUTH_URL = envSnapshot.NEXTAUTH_URL;
        process.env.DATABASE_URL = envSnapshot.DATABASE_URL;
        process.env.ADMIN_EMAILS = envSnapshot.ADMIN_EMAILS;
        process.env.PAYMENT_PROVIDER = envSnapshot.PAYMENT_PROVIDER;
        process.env.VALOR_HOSTED_PAGE_URL = envSnapshot.VALOR_HOSTED_PAGE_URL;
        process.env.VALOR_APP_ID = envSnapshot.VALOR_APP_ID;
        process.env.VALOR_APP_KEY = envSnapshot.VALOR_APP_KEY;
        process.env.VALOR_EPI = envSnapshot.VALOR_EPI;
        process.env.STRIPE_MOCK_MODE = envSnapshot.STRIPE_MOCK_MODE;
        process.env.UPSTASH_REDIS_REST_URL = envSnapshot.UPSTASH_REDIS_REST_URL;
        process.env.UPSTASH_REDIS_REST_TOKEN =
            envSnapshot.UPSTASH_REDIS_REST_TOKEN;
    });

    it("throws when Stripe mock mode is enabled on production deployments", () => {
        process.env.STRIPE_MOCK_MODE = "true";

        expect(() => assertProductionEnv()).toThrow(/STRIPE_MOCK_MODE/);
    });

    it("allows production startup without Upstash Redis credentials", () => {
        expect(() => assertProductionEnv()).not.toThrow();
    });
});
