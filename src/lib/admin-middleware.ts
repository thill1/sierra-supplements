type AdminToken = {
    isAdmin?: boolean;
} | null;

type AdminMiddlewareInput = {
    pathname: string;
    origin: string;
    href: string;
    token: AdminToken;
};

export type AdminMiddlewareDecision =
    | { type: "allow" }
    | { type: "redirect"; location: string }
    | { type: "json"; status: 401 | 403; body: { error: "Unauthorized" | "Forbidden" } };

export function getSessionCookieName(protocol: string): string {
    return protocol === "https:"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";
}

export function getAdminMiddlewareDecision({
    pathname,
    origin,
    href,
    token,
}: AdminMiddlewareInput): AdminMiddlewareDecision {
    const isLoggedIn = !!token;
    const isAdminUser = token?.isAdmin === true;
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminApiRoute = pathname.startsWith("/api/admin");
    const isAuthRoute =
        pathname.startsWith("/auth") || pathname.startsWith("/api/auth");

    if (isAuthRoute) {
        return { type: "allow" };
    }

    if (isAdminApiRoute) {
        if (!isLoggedIn) {
            return {
                type: "json",
                status: 401,
                body: { error: "Unauthorized" },
            };
        }
        if (!isAdminUser) {
            return {
                type: "json",
                status: 403,
                body: { error: "Forbidden" },
            };
        }
        return { type: "allow" };
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            const signInUrl = new URL("/auth/signin", origin);
            signInUrl.searchParams.set("callbackUrl", href);
            return { type: "redirect", location: signInUrl.toString() };
        }
        if (!isAdminUser) {
            const denied = new URL("/auth/error", origin);
            denied.searchParams.set("error", "AccessDenied");
            return { type: "redirect", location: denied.toString() };
        }
    }

    return { type: "allow" };
}
