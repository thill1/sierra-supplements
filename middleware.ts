import { auth } from "@/lib/auth";

export default auth((req) => {
    const pathname = req.nextUrl.pathname;
    const isLoggedIn = !!req.auth;
    const isAdminUser = req.auth?.user?.isAdmin === true;
    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminApiRoute = pathname.startsWith("/api/admin");
    const isAuthRoute =
        pathname.startsWith("/auth") || pathname.startsWith("/api/auth");

    if (isAuthRoute) return;

    if (isAdminApiRoute) {
        if (!isLoggedIn) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (!isAdminUser) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
        return;
    }

    if (isAdminRoute) {
        if (!isLoggedIn) {
            const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
            signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
            return Response.redirect(signInUrl);
        }
        if (!isAdminUser) {
            const denied = new URL("/auth/error", req.nextUrl.origin);
            denied.searchParams.set("error", "AccessDenied");
            return Response.redirect(denied);
        }
        return;
    }

    return;
});

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/auth/:path*"],
};
