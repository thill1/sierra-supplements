"use client";

import { LogOut } from "lucide-react";

export function SignOutButton() {
    return (
        <button
            type="button"
            onClick={() => {
                const u = new URL("/api/auth/signout", window.location.origin);
                u.searchParams.set("callbackUrl", "/");
                window.location.href = u.toString();
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-red-500/10 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    );
}
