"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    MessageSquare,
    LogOut,
    Mountain,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Leads", href: "/admin/leads", icon: Users },
    { label: "Content Blocks", href: "/admin/content", icon: FileText },
    { label: "Blog Editor", href: "/admin/blog", icon: MessageSquare },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] hidden md:flex flex-col">
                <div className="p-6 border-b border-[var(--color-border-subtle)]">
                    <Link href="/" className="flex items-center gap-2">
                        <Mountain className="w-6 h-6 text-[var(--color-accent)]" />
                        <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                            Admin Portal
                        </span>
                    </Link>
                </div>

                <nav className="flex-grow p-4 space-y-1">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === link.href
                                    ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)]"
                            )}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-border-subtle)]">
                    <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex items-center justify-between px-8">
                    <h1 className="font-semibold text-lg">
                        {sidebarLinks.find((l) => l.href === pathname)?.label || "Admin"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)]" />
                    </div>
                </header>

                <div className="flex-grow overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
