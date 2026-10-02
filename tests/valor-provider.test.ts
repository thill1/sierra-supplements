import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Valor provider", () => {
    const envSnapshot = {
        VALOR_HOSTED_PAGE_URL: process.env.VALOR_HOSTED_PAGE_URL,
        VALOR_APP_ID: process.env.VALOR_APP_ID,
        VALOR_APP_KEY: process.env.VALOR_APP_KEY,
        VALOR_EPI: process.env.VALOR_EPI,
    };

    beforeEach(() => {
        delete process.env.VALOR_HOSTED_PAGE_URL;
        delete process.env.VALOR_APP_ID;
        delete process.env.VALOR_APP_KEY;
        delete process.env.VALOR_EPI;
    });

    afterEach(() => {
        process.env.VALOR_HOSTED_PAGE_URL = envSnapshot.VALOR_HOSTED_PAGE_URL;
        process.env.VALOR_APP_ID = envSnapshot.VALOR_APP_ID;
        process.env.VALOR_APP_KEY = envSnapshot.VALOR_APP_KEY;
        process.env.VALOR_EPI = envSnapshot.VALOR_EPI;
    });

    it("reports not ready when required Valor env vars are missing", async () => {
        const { isValorPaymentReady } = await import(
            "@/lib/payments/providers/valor"
        );

        expect(isValorPaymentReady()).toBe(false);
    });

    it("reports ready when Valor hosted checkout credentials are configured", async () => {
        process.env.VALOR_HOSTED_PAGE_URL =
            "https://securelink-staging.valorpaytech.com:4430/";
        process.env.VALOR_APP_ID = "app-id";
        process.env.VALOR_APP_KEY = "app-key";
        process.env.VALOR_EPI = "2412333540";

        const { isValorPaymentReady } = await import(
            "@/lib/payments/providers/valor"
        );

        expect(isValorPaymentReady()).toBe(true);
    });
});
