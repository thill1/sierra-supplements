import Link from "next/link";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog",
    description: `Health, wellness, and performance insights from the ${siteConfig.name} team.`,
};

// Blog posts data (can later move to DB or MDX files)
const blogPosts = [
    {
        slug: "altitude-supplement-guide",
        title: "The Ultimate Guide to Supplements for High-Altitude Living",
        excerpt:
            "Living above 6,000 feet puts unique demands on your body. Here are the supplements that actually make a difference at altitude.",
        category: "Supplements",
        date: "2026-01-15",
        readTime: "8 min",
    },
    {
        slug: "protein-timing-myth",
        title: "Protein Timing: Does the 'Anabolic Window' Really Matter?",
        excerpt:
            "We break down the science behind protein timing and what really matters for muscle recovery and growth.",
        category: "Nutrition",
        date: "2026-01-08",
        readTime: "6 min",
    },
    {
        slug: "winter-immune-support",
        title: "5 Science-Backed Ways to Support Your Immune System This Winter",
        excerpt:
            "Cold temperatures, dry air, and indoor crowds — here's how to keep your immune system strong all season.",
        category: "Wellness",
        date: "2025-12-20",
        readTime: "5 min",
    },
    {
        slug: "magnesium-types",
        title: "Not All Magnesium Is Created Equal: A Guide to Forms & Doses",
        excerpt:
            "Glycinate, citrate, threonate, oxide — the type of magnesium you take matters. Here's how to choose.",
        category: "Supplements",
        date: "2025-11-28",
        readTime: "6 min",
    },
    {
        slug: "athlete-recovery-stack",
        title: "The Recovery Stack: What Pro Athletes Take After Training",
        excerpt:
            "Recover faster and train harder with this evidence-based supplement stack used by endurance athletes.",
        category: "Performance",
        date: "2025-11-15",
        readTime: "9 min",
    },
];

const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

export default function BlogPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="text-center mb-12">
                    <span className="label">Blog</span>
                    <h1 className="heading-xl mt-2 mb-4">
                        Insights from the{" "}
                        <span className="gradient-text">Summit</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        Evidence-based articles on supplements, nutrition, and performance from our team.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <span className="btn-ghost text-sm border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full px-4 py-1.5">
                        All
                    </span>
                    {categories.map((cat) => (
                        <span
                            key={cat}
                            className="btn-ghost text-sm border border-[var(--color-border)] rounded-full px-4 py-1.5 cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="card group block"
                        >
                            {/* Placeholder image area */}
                            <div className="h-48 bg-[var(--color-surface)] rounded-lg mb-4 flex items-center justify-center">
                                <span className="text-4xl opacity-20">📝</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                                    {post.category}
                                </span>
                                <span className="body-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {post.readTime}
                                </span>
                            </div>
                            <h2 className="font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                                {post.title}
                            </h2>
                            <p className="body-sm line-clamp-2">{post.excerpt}</p>
                            <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--color-accent)] group-hover:gap-2 transition-all">
                                Read More <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
