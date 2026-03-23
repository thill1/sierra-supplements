import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
    getAdminMiddlewareDecision,
    getSessionCookieName,
} from "@/lib/admin-middleware";
import { logAuthDebug, logServerError } from "@/lib/observability";

export default async function middleware(req: NextRequest) {
    let token = null;
    try {
        const cookieName = getSessionCookieName(req.nextUrl.protocol);
        token = await getToken({
            req,
            cookieName,
            secureCookie: req.nextUrl.protocol === "https:",
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
            sessionCookieName: getSessionCookieName(req.nextUrl.protocol),
            cookieNames: req.cookies.getAll().map((cookie) => cookie.name),
            decision: decision.type,
            location: decision.type === "redirect" ? decision.location : undefined,
        });
    }

    if (decision.type === "allow") {
        return NextResponse.next();
    }

    if (decision.type === "redirect") {
        return NextResponse.redirect(decision.location);
    }

    return NextResponse.json(decision.body, { status: decision.status });
}

export const config = {
    matcher: [
        "/admin",
        "/admin/:path+",
        "/api/admin/:path*",
        "/auth/:path*",
    ],
};
