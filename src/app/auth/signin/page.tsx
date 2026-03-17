import { signIn } from "@/lib/auth";
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
                    )}

                    {!process.env.RESEND_API_KEY && !process.env.GOOGLE_CLIENT_ID && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                            No sign-in providers configured. Set RESEND_API_KEY or GOOGLE_CLIENT_ID.
                        </p>
                    )}

                    <p className="text-xs text-center text-[var(--color-text-muted)]">
                        We&apos;ll send a magic link to your email, or use Google to sign in.
                    </p>
                </div>
            </div>
        </div>
    );
}
