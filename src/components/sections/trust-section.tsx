"use client";

import {
    Shield,
    Award,
    FlaskConical,
    BadgeCheck,
    Stethoscope,
    Star,
} from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { siteConfig } from "@/lib/site-config";

const badgeIcons = [Shield, Award, FlaskConical, BadgeCheck, Stethoscope, Star];

export function TrustSection() {
    return (
        <section className="border-y border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
            <div className="section-container py-8">
                <FadeIn>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        {siteConfig.trustBadges.map((badge, i) => {
                            const Icon = badgeIcons[i % badgeIcons.length];
                            return (
                                <div
                                    key={badge}
                                    className="flex items-center gap-2 text-[var(--color-text-muted)]"
                                >
                                    <Icon className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        {badge}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
