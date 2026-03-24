import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { getPublishedBlogList } from "@/lib/blog-public";

export const metadata: Metadata = {
    title: "Blog",
    description: `Health, wellness, and performance insights from the ${siteConfig.name} team.`,
};

export default async function BlogPage() {
    const blogPosts = await getPublishedBlogList();
    const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

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
                        Evidence-based articles on supplements, nutrition, and
                        performance from our team.
                    </p>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="card group block"
                        >
                            <div className="h-48 bg-[var(--color-surface)] rounded-lg mb-4 flex items-center justify-center">
                                <span className="text-4xl opacity-20">📝</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                                    {post.category}
                                </span>
                                <span className="body-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{" "}
                                    {post.readTime}
                                </span>
                                {post.source === "db" ? (
                                    <span className="text-[10px] uppercase text-[var(--color-text-muted)]">
                                        CMS
                                    </span>
                                ) : null}
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
