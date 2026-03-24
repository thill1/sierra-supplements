import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const sharedLimiters = new Map<string, Ratelimit>();

const MAX_MAP_SIZE = 5000;

/**
 * Best-effort per-IP rate limiting (in-memory). On serverless with many instances,
 * limits are approximate. For stricter limits, use Upstash Redis or Vercel KV.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return request.headers.get("x-real-ip") || "unknown";
}

export function isSharedRateLimitingConfigured(): boolean {
    return Boolean(
        process.env.UPSTASH_REDIS_REST_URL?.trim() &&
            process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
    );
}

function formatWindow(windowMs: number): `${number} s` {
    const seconds = Math.max(1, Math.ceil(windowMs / 1000));
    return `${seconds} s`;
}

function getSharedLimiter(
    namespace: string,
    limit: number,
    windowMs: number,
): Ratelimit | null {
    if (!isSharedRateLimitingConfigured()) return null;

    const key = `${namespace}:${limit}:${windowMs}`;
    const existing = sharedLimiters.get(key);
    if (existing) return existing;

    const limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, formatWindow(windowMs)),
        analytics: false,
        prefix: namespace,
    });
    sharedLimiters.set(key, limiter);
    return limiter;
}

function buildRateLimitResponse(resetAt: number): NextResponse {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
            status: 429,
            headers: { "Retry-After": String(retryAfter) },
        },
    );
}

/**
 * @returns 429 NextResponse if over limit, otherwise null
 */
export async function checkRateLimit(
    request: Request,
    namespace: string,
    limit: number,
    windowMs: number,
): Promise<NextResponse | null> {
    const ip = getClientIp(request);
    const key = `${namespace}:${ip}`;
    const sharedLimiter = getSharedLimiter(namespace, limit, windowMs);
    if (sharedLimiter) {
        const result = await sharedLimiter.limit(key);
        if (!result.success) {
            return buildRateLimitResponse(result.reset);
        }
        return null;
    }

    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now >= b.resetAt) {
        b = { count: 0, resetAt: now + windowMs };
        buckets.set(key, b);
    }

    b.count += 1;

    if (buckets.size > MAX_MAP_SIZE) {
        for (const [k, v] of buckets) {
            if (now >= v.resetAt) {
                buckets.delete(k);
            }
        }
    }

    if (b.count > limit) return buildRateLimitResponse(b.resetAt);

    return null;
}

export type RateRule = { namespace: string; limit: number; windowMs: number };

/**
 * Apply multiple windows (e.g. burst + hourly). First exceeded limit wins.
 */
export async function checkRateLimits(
    request: Request,
    rules: RateRule[],
): Promise<NextResponse | null> {
    for (const rule of rules) {
        const res = await checkRateLimit(
            request,
            rule.namespace,
            rule.limit,
            rule.windowMs,
        );
        if (res) return res;
    }
    return null;
}
