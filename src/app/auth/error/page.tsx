import Link from "next/link";
import { Mountain } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type SearchParams = Promise<{ error?: string }>;

export default async function AuthErrorPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const { error } = await searchParams;

    const messages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "Access denied. You do not have permission to sign in.",
        Verification:
            "The sign-in link has expired or has already been used.",
        Default: "An error occurred during sign in.",
    };

    const message = error && error in messages ? messages[error] : messages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <Mountain className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-4" />
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                        {siteConfig.name}
                    </h1>
                </div>

                <div className="card p-6 text-center space-y-4">
                    <p className="text-[var(--color-text-secondary)]">{message}</p>
                    <Link href="/auth/signin" className="btn btn-primary w-full inline-block">
                        Try again
                    </Link>
                    <Link href="/" className="block text-sm text-[var(--color-text-muted)] hover:underline">
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
