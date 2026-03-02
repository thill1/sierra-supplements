"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Store Error]", error);
    }, [error]);

    const isDbError =
        error.message?.includes("database") ||
        error.message?.includes("DATABASE_URL") ||
        error.message?.includes("connection") ||
        error.message?.includes("POSTGRES");

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-lg text-center">
                <h1 className="heading-lg mb-4">Store temporarily unavailable</h1>
                <p className="body-lg text-[var(--color-text-muted)] mb-6">
                    {error.message}
                </p>
                {isDbError && (
                    <div className="mb-6 p-4 rounded-lg bg-[var(--color-surface)] text-left text-sm">
                        <p className="font-medium mb-2">Database connection issue</p>
                        <ul className="list-disc list-inside space-y-1 text-[var(--color-text-muted)]">
                            <li>Check Vercel env vars: DATABASE_URL or POSTGRES_URL</li>
                            <li>For Supabase: use pooler URL (port 6543) with ?pgbouncer=true</li>
                            <li>Redeploy after changing env vars</li>
                        </ul>
                    </div>
                )}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="btn btn-primary"
                    >
                        Try again
                    </button>
                    <Link href="/" className="btn btn-secondary">
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
