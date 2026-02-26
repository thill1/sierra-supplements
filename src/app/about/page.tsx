import Link from "next/link";
import {
    Mountain,
    Heart,
    Target,
    Award,
    ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: `Learn about ${siteConfig.name} — our story, team, and mission to bring peak wellness to the Sierra Nevada community.`,
};

const values = [
    {
        icon: Mountain,
        title: "Mountain Tested",
        description:
            "We live, train, and play in the Sierra Nevada. Every product and protocol we recommend has been tested at altitude by our own team.",
    },
    {
        icon: Heart,
        title: "Genuine Care",
        description:
            "Your health is not a transaction. We build long-term relationships with our clients and celebrate every win, big or small.",
    },
    {
        icon: Target,
        title: "Science First",
        description:
            "No hype, no fads. We rely on peer-reviewed research and third-party testing to guide every recommendation.",
    },
    {
        icon: Award,
        title: "Quality Obsessed",
        description:
            "From the supplements we carry to the coaches we hire, we accept nothing less than the best.",
    },
];

const team = [
    {
        name: "Dr. Emily Chen",
        role: "Founder & Head of Nutrition",
        bio: "PhD in Nutritional Sciences, ultramarathon runner, and lifelong Sierra resident.",
    },
    {
        name: "Marcus Rivera",
        role: "Head Coach",
        bio: "Certified Sports Nutritionist and former collegiate athlete with 10+ years of coaching experience.",
    },
    {
        name: "Sarah Winters",
        role: "Wellness Director",
        bio: "RN with specialty in integrative medicine. Passionate about making wellness accessible.",
    },
    {
        name: "Jake Olmstead",
        role: "Operations & Community",
        bio: "Manages our retail space, events, and group programs. Local ski instructor and community advocate.",
    },
];

export default function AboutPage() {
    return (
        <div className="pt-24">
            {/* Story */}
            <section className="section-container section-padding">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="label">Our Story</span>
                    <h1 className="heading-xl mt-2 mb-6">
                        Born in the{" "}
                        <span className="gradient-text">Sierra Nevada</span>
                    </h1>
                    <p className="body-lg mb-6">
                        Sierra Strength was founded in 2025 after a clear need emerged
                        for a supplement company that truly understood the unique demands
                        of high-altitude living and training.
                    </p>
                    <p className="body-lg mb-6">
                        After years of seeing clients struggle with one-size-fits-all
                        programs, Sierra Strength was built on a different approach,
                        combining the science of supplementation with the practical wisdom
                        of mountain living. Today, Sierra Strength serves more than 500
                        clients across the Sierra Nevada and beyond.
                    </p>
                    <p className="body-lg">
                        The Auburn storefront is more than a retail space. It is a community
                        hub where athletes, families, and wellness seekers come together to
                        learn, grow, and perform at their best.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container">
                    <div className="text-center mb-12">
                        <span className="label">Our Values</span>
                        <h2 className="heading-lg mt-2">What Guides Us</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v) => (
                            <div key={v.title} className="card text-center">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                                    <v.icon className="w-6 h-6 text-[var(--color-accent)]" />
                                </div>
                                <h3 className="font-semibold mb-2">{v.title}</h3>
                                <p className="body-sm">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section-container section-padding">
                <div className="text-center mb-12">
                    <span className="label">The Team</span>
                    <h2 className="heading-lg mt-2">
                        Meet the <span className="gradient-text">Crew</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.map((t) => (
                        <div key={t.name} className="card text-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center mx-auto mb-4">
                                <span
                                    className="text-2xl font-bold text-[var(--color-accent)]"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    {t.name
                                        .split(" ")
                                        .map((w) => w[0])
                                        .join("")}
                                </span>
                            </div>
                            <h3 className="font-semibold">{t.name}</h3>
                            <p className="text-sm text-[var(--color-accent)] mb-2">
                                {t.role}
                            </p>
                            <p className="body-sm">{t.bio}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[var(--color-bg-elevated)] section-padding">
                <div className="section-container text-center">
                    <h2 className="heading-md mb-4">Ready to join the community?</h2>
                    <p className="body-lg mb-6 max-w-lg mx-auto">
                        Book a free consultation and meet the team.
                    </p>
                    <Link href="/book" className="btn btn-primary">
                        Book Free Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
