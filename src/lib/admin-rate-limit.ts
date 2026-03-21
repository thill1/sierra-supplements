import { checkRateLimits, type RateRule } from "@/lib/rate-limit";

const WRITE_RULES: RateRule[] = [
    { namespace: "admin-write-1m", limit: 120, windowMs: 60_000 },
    { namespace: "admin-write-15m", limit: 800, windowMs: 15 * 60_000 },
];

const UPLOAD_RULES: RateRule[] = [
    { namespace: "admin-upload-1m", limit: 40, windowMs: 60_000 },
    { namespace: "admin-upload-1h", limit: 200, windowMs: 60 * 60_000 },
];

export function rateLimitAdminWrite(request: Request) {
    return checkRateLimits(request, WRITE_RULES);
}

export function rateLimitAdminUpload(request: Request) {
    return checkRateLimits(request, UPLOAD_RULES);
}
