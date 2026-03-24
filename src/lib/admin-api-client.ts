/**
 * Shared helpers for browser fetch calls to /api/admin/*.
 * Always use credentials so session cookies are sent on same-origin requests.
 */
export const adminFetchInit: RequestInit = {
    credentials: "same-origin",
};

/**
 * Parse error message from a failed admin API response (consumes the body).
 * Call only when `!res.ok` and you have not read the body yet.
 */
export async function getAdminApiErrorMessage(res: Response): Promise<string> {
    const status = res.status;
    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    if (ct.includes("application/json")) {
        try {
            const j = (await res.json()) as { error?: string };
            if (typeof j?.error === "string" && j.error.trim()) {
                return j.error.trim();
            }
        } catch {
            /* fall through */
        }
    } else {
        try {
            const t = await res.text();
            if (t.trim()) return t.trim().slice(0, 280);
        } catch {
            /* fall through */
        }
    }

    if (status === 401) {
        return "Not signed in or session expired. Sign in again.";
    }
    if (status === 403) {
        return "You don’t have permission for this action.";
    }
    if (status === 429) {
        return "Too many requests. Wait a moment and try again.";
    }
    if (status === 503) {
        return "Service unavailable — check configuration (e.g. blob storage).";
    }
    if (status >= 500) {
        return "Server error. Try again or check logs.";
    }
    return `Request failed (${status}).`;
}
