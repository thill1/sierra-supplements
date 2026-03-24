import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
    getAdminMiddlewareDecision,
    getAuthSessionCookieOptions,
} from "@/lib/admin-middleware";
import { logAuthDebug, logServerError } from "@/lib/observability";
import { PRODUCTION_CSP } from "@/lib/production-csp";

function withProductionCsp(response: NextResponse): NextResponse {
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Content-Security-Policy", PRODUCTION_CSP);
    }
    return response;
}

export default async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    const needsAdminAuth =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/auth");

    if (!needsAdminAuth) {
        return withProductionCsp(NextResponse.next());
    }

    const sessionCookieOpts = getAuthSessionCookieOptions(req);
    let token = null;
    try {
        token = await getToken({
            req,
            cookieName: sessionCookieOpts.cookieName,
            secureCookie: sessionCookieOpts.secureCookie,
            secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
        });
    } catch (error) {
        logServerError("middleware:getToken", error, {
            pathname: req.nextUrl.pathname,
        });
    }
    const decision = getAdminMiddlewareDecision({
        pathname: req.nextUrl.pathname,
        origin: req.nextUrl.origin,
        href: req.nextUrl.href,
        token: token
            ? {
                  isAdmin: token.isAdmin === true,
              }
            : null,
    });

    if (req.nextUrl.pathname.startsWith("/admin")) {
        logAuthDebug("middleware:admin_decision", {
            pathname: req.nextUrl.pathname,
            hasToken: Boolean(token),
            tokenIsAdmin: token?.isAdmin === true,
            sessionCookieName: sessionCookieOpts.cookieName,
            cookieNames: req.cookies.getAll().map((cookie) => cookie.name),
            decision: decision.type,
            location: decision.type === "redirect" ? decision.location : undefined,
        });
    }

    if (decision.type === "allow") {
        return withProductionCsp(NextResponse.next());
    }

    if (decision.type === "redirect") {
        return withProductionCsp(NextResponse.redirect(decision.location));
    }

    return withProductionCsp(NextResponse.json(decision.body, { status: decision.status }));
}

export const config = {
    matcher: [
        /*
         * Run on all paths except Next static assets and favicon so CSP is set on
         * every document (avoids stale frame-src from cached older deployments).
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
