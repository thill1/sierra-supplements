import { auth } from "@/lib/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isAdminApiRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isAuthRoute =
        req.nextUrl.pathname.startsWith("/auth") ||
        req.nextUrl.pathname.startsWith("/api/auth");

    if (isAuthRoute) return;

    if (isAdminApiRoute && !isLoggedIn) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (isAdminRoute && !isLoggedIn) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
        return Response.redirect(signInUrl);
    }

    return;
});

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*", "/auth/:path*"],
};
