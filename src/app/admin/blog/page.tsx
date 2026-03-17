"use client";

import Link from "next/link";
import { Plus, FileText, ExternalLink } from "lucide-react";

export default function AdminBlogPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Blog Posts</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Manage blog posts and articles.
                    </p>
                </div>
            </div>

            <div className="card p-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Blog content is currently in code</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                            Blog posts are defined in <code className="text-[var(--color-accent)]">src/app/blog/</code>.
                            To add or edit posts via the admin, we need to add a blog_posts table and wire up the editor.
                        </p>
                        <Link
                            href="/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
                        >
                            View blog <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
                    <h3 className="font-semibold">Current posts (from code)</h3>
                </div>
                <ul className="divide-y divide-[var(--color-border-subtle)]">
                    {[
                        { slug: "altitude-supplement-guide", title: "The Ultimate Guide to Supplements for High-Altitude Living" },
                        { slug: "protein-timing-myth", title: "Protein Timing: Does the 'Anabolic Window' Really Matter?" },
                    ].map((post) => (
                        <li key={post.slug} className="px-6 py-4 flex items-center justify-between">
                            <span className="text-sm">{post.title}</span>
                            <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--color-accent)] hover:underline"
                            >
                                View
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
