/** Shared defaults for Playwright + globalSetup (keep in sync with webServer env). */
export const PLAYWRIGHT_DEFAULT_ADMIN_EMAIL = "e2e-admin@sierra-supplements.local";
export const PLAYWRIGHT_DEFAULT_E2E_SECRET =
    "local-only-e2e-admin-credentials-secret-min-32___";

export function playwrightAdminEmail(): string {
    return (
        process.env.PLAYWRIGHT_ADMIN_EMAIL?.trim() || PLAYWRIGHT_DEFAULT_ADMIN_EMAIL
    );
}

export function playwrightE2eAdminSecret(): string {
    return (
        process.env.E2E_ADMIN_CREDENTIALS_SECRET?.trim() ||
        PLAYWRIGHT_DEFAULT_E2E_SECRET
    );
}

/** Ensures the Playwright admin email is on the allowlist for the dev server. */
export function mergeAdminEmailsForPlaywright(): string {
    const e2e = playwrightAdminEmail();
    const raw = process.env.ADMIN_EMAILS?.trim();
    if (!raw) return e2e;
    const parts = raw
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);
    if (parts.includes(e2e.toLowerCase())) return raw;
    return `${raw},${e2e}`;
}
