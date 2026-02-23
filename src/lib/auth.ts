import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        // Email magic link via Resend
        ...(process.env.RESEND_API_KEY
            ? [
                Resend({
                    from: "Sierra Supplements <noreply@sierrasupplements.com>",
                }),
            ]
            : []),
        // Google OAuth (optional)
        ...(process.env.GOOGLE_CLIENT_ID
            ? [
                Google({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                }),
            ]
            : []),
    ],
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
