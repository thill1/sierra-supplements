"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    MessageSquare,
    Mountain,
    Package,
    ShoppingBag,
    Star,
    Boxes,
    Activity,
    BarChart3,
    UserCog,
} from "lucide-react";
import { Toaster } from "sonner";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { useAdminSession } from "@/components/admin/admin-session-context";
import type { AdminRole } from "@/db/schema";
import { roleMeetsMinimum } from "@/lib/admin-role";
import { cn } from "@/lib/utils";

const sidebarLinks: Array<{
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    minRole: AdminRole;
}> = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, minRole: "editor" },
    { label: "Products", href: "/admin/products", icon: Package, minRole: "editor" },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes, minRole: "manager" },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag, minRole: "editor" },
    { label: "Leads", href: "/admin/leads", icon: Users, minRole: "editor" },
    { label: "Audit log", href: "/admin/audit", icon: Activity, minRole: "manager" },
    { label: "Analytics", href: "/admin/events", icon: BarChart3, minRole: "manager" },
    { label: "Content", href: "/admin/content", icon: FileText, minRole: "editor" },
    { label: "Testimonials", href: "/admin/testimonials", icon: Star, minRole: "editor" },
    { label: "Blog", href: "/admin/blog", icon: MessageSquare, minRole: "editor" },
    { label: "Team", href: "/admin/users", icon: UserCog, minRole: "owner" },
    { label: "Settings", href: "/admin/settings", icon: Settings, minRole: "editor" },
];

export function AdminAppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { role } = useAdminSession();
    const visibleLinks = sidebarLinks.filter((l) =>
        roleMeetsMinimum(role, l.minRole),
    );

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)]">
            <Toaster richColors position="top-right" closeButton />
            <aside className="w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] hidden md:flex flex-col">
                <div className="p-6 border-b border-[var(--color-border-subtle)]">
                    <Link href="/" className="flex items-center gap-2">
                        <Mountain className="w-6 h-6 text-[var(--color-accent)]" />
                        <span
                            className="font-bold text-lg"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Admin Portal
                        </span>
                    </Link>
                </div>

                <nav className="flex-grow p-4 space-y-1">
                    {visibleLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === link.href
                                    ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text)]",
                            )}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-border-subtle)]">
                    <SignOutButton />
                </div>
            </aside>

            <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex items-center justify-between px-8">
                    <h1 className="font-semibold text-lg">
                        {sidebarLinks.find((l) => l.href === pathname)?.label ||
                            "Admin"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)]" />
                    </div>
                </header>

                <div className="flex-grow overflow-auto p-8">{children}</div>
            </main>
        </div>
    );
}
