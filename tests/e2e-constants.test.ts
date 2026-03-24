import { afterEach, describe, expect, it, vi } from "vitest";
import {
    mergeAdminEmailsForPlaywright,
    PLAYWRIGHT_DEFAULT_ADMIN_EMAIL,
} from "./e2e-constants";

describe("mergeAdminEmailsForPlaywright", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("returns default e2e email when ADMIN_EMAILS is unset", () => {
        vi.stubEnv("ADMIN_EMAILS", "");
        vi.stubEnv("PLAYWRIGHT_ADMIN_EMAIL", "");
        expect(mergeAdminEmailsForPlaywright()).toBe(PLAYWRIGHT_DEFAULT_ADMIN_EMAIL);
    });

    it("appends e2e email when missing from ADMIN_EMAILS", () => {
        vi.stubEnv("ADMIN_EMAILS", "owner@example.com");
        vi.stubEnv("PLAYWRIGHT_ADMIN_EMAIL", "");
        expect(mergeAdminEmailsForPlaywright()).toBe(
            `owner@example.com,${PLAYWRIGHT_DEFAULT_ADMIN_EMAIL}`,
        );
    });

    it("does not duplicate when e2e email already listed", () => {
        vi.stubEnv(
            "ADMIN_EMAILS",
            `owner@example.com, ${PLAYWRIGHT_DEFAULT_ADMIN_EMAIL}`,
        );
        vi.stubEnv("PLAYWRIGHT_ADMIN_EMAIL", "");
        expect(mergeAdminEmailsForPlaywright()).toBe(
            `owner@example.com, ${PLAYWRIGHT_DEFAULT_ADMIN_EMAIL}`,
        );
    });
});
