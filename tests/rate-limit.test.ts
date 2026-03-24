import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fromEnvMock, limitMock, slidingWindowMock, ratelimitCtorMock } =
    vi.hoisted(() => {
        const fromEnvMock = vi.fn(() => ({ kind: "redis" }));
        const limitMock = vi.fn();
        const slidingWindowMock = vi.fn();
        const ratelimitCtorMock = vi.fn(() => ({
            limit: limitMock,
        }));
        return {
            fromEnvMock,
            limitMock,
            slidingWindowMock,
            ratelimitCtorMock,
        };
    });

vi.mock("@upstash/redis", () => ({
    Redis: {
        fromEnv: fromEnvMock,
    },
}));

vi.mock("@upstash/ratelimit", () => {
    const Ratelimit = ratelimitCtorMock as unknown as {
        new (...args: unknown[]): unknown;
        slidingWindow: typeof slidingWindowMock;
    };
    Ratelimit.slidingWindow = slidingWindowMock;
    return { Ratelimit };
});

describe("checkRateLimit", () => {
    const envSnapshot = {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    };

    beforeEach(() => {
        vi.resetModules();
        fromEnvMock.mockClear();
        limitMock.mockReset();
        slidingWindowMock.mockReset();
        ratelimitCtorMock.mockClear();
        delete process.env.UPSTASH_REDIS_REST_URL;
        delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    afterEach(() => {
        process.env.UPSTASH_REDIS_REST_URL = envSnapshot.UPSTASH_REDIS_REST_URL;
        process.env.UPSTASH_REDIS_REST_TOKEN =
            envSnapshot.UPSTASH_REDIS_REST_TOKEN;
    });

    it("falls back to in-memory limiting when Upstash is not configured", async () => {
        const { checkRateLimit } = await import("@/lib/rate-limit");
        const request = new Request("http://localhost/api/test", {
            headers: { "x-forwarded-for": "203.0.113.5" },
        });

        expect(await checkRateLimit(request, "test", 1, 60_000)).toBeNull();
        const blocked = await checkRateLimit(request, "test", 1, 60_000);

        expect(blocked?.status).toBe(429);
        expect(fromEnvMock).not.toHaveBeenCalled();
    });

    it("uses Upstash-backed limiting when the shared backend is configured", async () => {
        process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
        process.env.UPSTASH_REDIS_REST_TOKEN = "token";
        slidingWindowMock.mockReturnValue({ kind: "window" });
        limitMock.mockResolvedValue({
            success: false,
            reset: Date.now() + 2_000,
        });

        const { checkRateLimit } = await import("@/lib/rate-limit");
        const request = new Request("http://localhost/api/test", {
            headers: { "x-forwarded-for": "203.0.113.8" },
        });

        const blocked = await checkRateLimit(request, "checkout", 10, 15_000);

        expect(fromEnvMock).toHaveBeenCalledOnce();
        expect(slidingWindowMock).toHaveBeenCalledWith(10, "15 s");
        expect(limitMock).toHaveBeenCalledWith("checkout:203.0.113.8");
        expect(blocked?.status).toBe(429);
    });
});
