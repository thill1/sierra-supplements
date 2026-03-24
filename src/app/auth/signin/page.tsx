import { signIn } from "@/lib/auth";
import { isE2eCredentialsAdminAuthEnabled } from "@/lib/e2e-admin-auth";
import { siteConfig } from "@/lib/site-config";
import { Mountain } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <Mountain className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-4" />
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                        {siteConfig.name}
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Admin sign in
                    </p>
                </div>

                <div className="card p-6 space-y-4">
                    {process.env.RESEND_API_KEY && (
                        <form
                            action={async (formData) => {
                                "use server";
                                await signIn("resend", {
                                    redirectTo: "/admin",
                                    email: formData.get("email") as string,
                                });
                            }}
                        >
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="input w-full mb-4"
                            />
                            <button type="submit" className="btn btn-primary w-full">
                                Sign in with Email
                            </button>
                        </form>
                    )}

                    {process.env.GOOGLE_CLIENT_ID && (
                        <div className="space-y-2">
                            <form
                                action={async () => {
                                    "use server";
                                    await signIn("google", { redirectTo: "/admin" });
                                }}
                            >
                                <button type="submit" className="btn btn-secondary w-full">
                                    Sign in with Google
                                </button>
                            </form>
                            {process.env.RESEND_API_KEY ? (
                                <p className="text-xs text-center text-[var(--color-text-muted)]">
                                    If Google says the app is restricted to an organization, use{" "}
                                    <strong>Sign in with Email</strong> above instead.
                                </p>
                            ) : null}
                        </div>
                    )}

                    {!process.env.RESEND_API_KEY && !process.env.GOOGLE_CLIENT_ID && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                            No sign-in providers configured. Set RESEND_API_KEY or GOOGLE_CLIENT_ID.
                        </p>
                    )}

                    {isE2eCredentialsAdminAuthEnabled() ? (
                        <div
                            className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3"
                            data-testid="e2e-admin-signin-section"
                        >
                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                                Local E2E (not on Vercel)
                            </p>
                            <form
                                className="space-y-3"
                                action={async (formData) => {
                                    "use server";
                                    await signIn("e2e-admin-credentials", {
                                        email: formData.get("email") as string,
                                        secret: formData.get("secret") as string,
                                        redirectTo: "/admin",
                                    });
                                }}
                            >
                                <label
                                    htmlFor="e2e-admin-email"
                                    className="block text-sm font-medium"
                                >
                                    Admin email
                                </label>
                                <input
                                    id="e2e-admin-email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="username"
                                    data-testid="e2e-admin-email"
                                    className="input w-full"
                                />
                                <label
                                    htmlFor="e2e-admin-secret"
                                    className="block text-sm font-medium"
                                >
                                    E2E secret
                                </label>
                                <input
                                    id="e2e-admin-secret"
                                    name="secret"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    data-testid="e2e-admin-secret"
                                    className="input w-full"
                                />
                                <button
                                    type="submit"
                                    data-testid="e2e-admin-submit"
                                    className="btn btn-secondary w-full text-sm"
                                >
                                    Sign in (E2E credentials)
                                </button>
                            </form>
                        </div>
                    ) : null}

                    <p className="text-xs text-center text-[var(--color-text-muted)]">
                        We&apos;ll send a magic link to your email, or use Google to sign in.
                    </p>
                </div>
            </div>
        </div>
    );
}
