import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import type { AdminRole } from "@/db/schema.pg";
import { isE2eCredentialsAdminAuthEnabled } from "@/lib/e2e-admin-auth";
import { logAuthDebug } from "@/lib/observability";

/**
 * No top-level `pg` / Drizzle here (middleware-safe graph). `signIn` / `jwt`
 * use a dynamic import of `@/lib/admin-auth` so token claims match
 * `resolveAdmin()` (DB row or bootstrap when `admin_users` is empty).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        ...(process.env.RESEND_API_KEY
            ? [
                  Resend({
                      from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                  }),
              ]
            : []),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                  Google({
                      clientId: process.env.GOOGLE_CLIENT_ID,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  }),
              ]
            : []),
        ...(isE2eCredentialsAdminAuthEnabled()
            ? [
                  Credentials({
                      id: "e2e-admin-credentials",
                      name: "E2E Admin",
                      credentials: {
                          email: { label: "Admin email", type: "email" },
                          secret: { label: "E2E secret", type: "password" },
                      },
                      authorize: async (credentials) => {
                          const expected =
                              process.env.E2E_ADMIN_CREDENTIALS_SECRET?.trim();
                          if (!expected || credentials?.secret !== expected) {
                              return null;
                          }
                          const email = (
                              credentials?.email as string | undefined
                          )
                              ?.trim()
                              .toLowerCase();
                          if (!email?.includes("@")) return null;
                          const { resolveAdmin } = await import(
                              "@/lib/admin-auth"
                          );
                          const admin = await resolveAdmin(email);
                          if (!admin) return null;
                          return {
                              id:
                                  admin.id != null
                                      ? String(admin.id)
                                      : `e2e-bootstrap-${email}`,
                              email,
                              name: "E2E Admin",
                          };
                      },
                  }),
              ]
            : []),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        async signIn({ user }) {
            const { resolveAdmin } = await import("@/lib/admin-auth");
            const email = user?.email ?? null;
            const admin = await resolveAdmin(email);
            logAuthDebug("callbacks:signIn", {
                email,
                adminResolved: Boolean(admin),
            });
            return admin != null;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            if (typeof token.email === "string") {
                session.user.email = token.email;
            }
            session.user.isAdmin = Boolean(token.isAdmin);
            session.user.adminRole = token.adminRole as AdminRole | undefined;
            session.user.adminDbId =
                typeof token.adminDbId === "number" ? token.adminDbId : null;
            logAuthDebug("callbacks:session", {
                email: session.user.email ?? null,
                isAdmin: session.user.isAdmin === true,
                adminDbId: session.user.adminDbId ?? null,
            });
            return session;
        },
        async jwt({ token, user }) {
            if (user?.email) {
                token.email = user.email;
            }
            const email =
                typeof token.email === "string" ? token.email : null;
            const { resolveAdmin } = await import("@/lib/admin-auth");
            const admin = await resolveAdmin(email);
            if (!admin) {
                token.isAdmin = false;
                token.adminRole = undefined;
                token.adminDbId = null;
                logAuthDebug("callbacks:jwt", {
                    email,
                    adminResolved: false,
                });
                return token;
            }
            token.isAdmin = true;
            token.adminRole = admin.role;
            token.adminDbId = admin.id;
            logAuthDebug("callbacks:jwt", {
                email,
                adminResolved: true,
                adminRole: admin.role,
                adminDbId: admin.id,
            });
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    trustHost: true,
});
