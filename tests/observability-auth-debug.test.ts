import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logAuthDebug } from "@/lib/observability";

describe("logAuthDebug", () => {
    const envSnapshot = {
        NODE_ENV: process.env.NODE_ENV,
        AUTH_DEBUG_LOGS: process.env.AUTH_DEBUG_LOGS,
    };

    beforeEach(() => {
        vi.spyOn(console, "info").mockImplementation(() => undefined);
    });

    afterEach(() => {
        process.env.NODE_ENV = envSnapshot.NODE_ENV;
        process.env.AUTH_DEBUG_LOGS = envSnapshot.AUTH_DEBUG_LOGS;
        vi.restoreAllMocks();
    });

    it("does not emit auth debug logs in production by default", () => {
        process.env.NODE_ENV = "production";
        delete process.env.AUTH_DEBUG_LOGS;

        logAuthDebug("callbacks:jwt", { email: "admin@example.com" });

        expect(console.info).not.toHaveBeenCalled();
    });

    it("can emit auth debug logs when explicitly enabled", () => {
        process.env.NODE_ENV = "production";
        process.env.AUTH_DEBUG_LOGS = "true";

        logAuthDebug("callbacks:jwt", { email: "admin@example.com" });

        expect(console.info).toHaveBeenCalledOnce();
    });
});
