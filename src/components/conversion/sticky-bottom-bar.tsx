"use client";

import { Phone, MessageSquare, Calendar, FileText } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { formatPhone } from "@/lib/utils";

export function StickyBottomBar() {
    const actions = [
        {
            label: "Call",
            icon: Phone,
            href: `tel:${formatPhone(siteConfig.phone)}`,
            id: "sticky-call",
        },
        {
            label: "Text",
            icon: MessageSquare,
            href: `sms:${siteConfig.smsNumber}?body=Hi! I'm interested in learning more about Sierra Supplements.`,
            id: "sticky-text",
        },
        {
            label: "Book",
            icon: Calendar,
            href: "/book",
            id: "sticky-book",
        },
        {
            label: "Quote",
            icon: FileText,
            href: "/contact?form=quote",
            id: "sticky-quote",
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-[var(--color-border)]">
            <div className="grid grid-cols-4 gap-0">
                {actions.map(({ label, icon: Icon, href, id }) => (
                    <a
                        key={id}
                        id={id}
                        href={href}
                        className="flex flex-col items-center justify-center py-3 gap-1 hover:bg-[var(--color-bg-muted)] transition-colors active:bg-[var(--color-accent-subtle)]"
                    >
                        <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {label}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
