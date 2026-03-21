function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Admin identities: comma-separated emails in ADMIN_EMAILS.
 * Production requires a non-empty allowlist (enforced at startup via production-env).
 * In local dev with an empty allowlist, any authenticated user is treated as admin
 * so you can test without duplicating production config.
 */
export function parseAdminEmailAllowlist(): Set<string> {
    const raw = process.env.ADMIN_EMAILS ?? "";
    const set = new Set<string>();
    for (const part of raw.split(",")) {
        const e = normalizeEmail(part);
        if (e.includes("@")) set.add(e);
    }
    return set;
}

export function isProductionRuntime(): boolean {
    return process.env.NODE_ENV === "production";
}

export function isUserAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    const allow = parseAdminEmailAllowlist();
    const norm = normalizeEmail(email);
    if (allow.size > 0) return allow.has(norm);
    return !isProductionRuntime();
}
