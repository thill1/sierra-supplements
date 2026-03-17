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

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-lg text-center">
                <h1 className="heading-lg mb-4">Store temporarily unavailable</h1>
                <p className="body-lg text-[var(--color-text-muted)] mb-6">
                    We&apos;re having trouble loading the store. Please try again in a moment.
                </p>
                <div className="flex gap-4 justify-center">
                    <button onClick={reset} className="btn btn-primary">
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
