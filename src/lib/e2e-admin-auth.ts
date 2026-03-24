/**
 * Headless E2E admin sign-in via Credentials. Never active on Vercel.
 * Requires matching ADMIN_EMAILS / admin_users (see pnpm db:seed-admins).
 */
export function isE2eCredentialsAdminAuthEnabled(): boolean {
    if (process.env.VERCEL === "1") return false;
    if (!process.env.E2E_ADMIN_CREDENTIALS_SECRET?.trim()) return false;
    if (
        process.env.NODE_ENV === "production" &&
        process.env.ALLOW_E2E_CREDENTIALS_ADMIN !== "true"
    ) {
        return false;
    }
    return true;
}
