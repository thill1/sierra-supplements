import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { isUserAdmin } from "@/lib/admin-allowlist";

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
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        async signIn({ user }) {
            return isUserAdmin(user?.email ?? null);
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            if (typeof token.email === "string") {
                session.user.email = token.email;
            }
            session.user.isAdmin = Boolean(token.isAdmin);
            return session;
        },
        async jwt({ token, user }) {
            if (user?.email) {
                token.email = user.email;
            }
            token.isAdmin = isUserAdmin(
                typeof token.email === "string" ? token.email : null,
            );
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    trustHost: true,
});
