import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

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

/**
 * @returns 429 NextResponse if over limit, otherwise null
 */
export function checkRateLimit(
    request: Request,
    namespace: string,
    limit: number,
    windowMs: number,
): NextResponse | null {
    const ip = getClientIp(request);
    const key = `${namespace}:${ip}`;
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

    if (b.count > limit) {
        const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: { "Retry-After": String(retryAfter) },
            },
        );
    }

    return null;
}
