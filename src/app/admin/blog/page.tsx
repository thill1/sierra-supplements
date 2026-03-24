"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";
import { legacyBlogSummaries } from "@/lib/blog-legacy";

type BlogPostRow = {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string;
    readTime: string;
    published: boolean;
    publishedAt: string | null;
};

export default function AdminBlogPage() {
    const canManage = useCanManageCatalog();
    const [posts, setPosts] = useState<BlogPostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/blog-posts", adminFetchInit);
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            setPosts(await res.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function remove(id: number) {
        if (!confirm("Delete this post?")) return;
        try {
            const res = await fetch(`/api/admin/blog-posts/${id}`, {
                ...adminFetchInit,
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            toast.success("Deleted.");
            await load();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Could not delete.",
            );
        }
    }

    if (loading) {
        return (
            <p className="text-[var(--color-text-muted)] py-12">Loading…</p>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold">Blog posts</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Database posts override legacy slugs. Built-in articles
                        remain until you add a post with the same slug.
                    </p>
                </div>
                {canManage ? (
                    <Link
                        href="/admin/blog/new"
                        className="btn btn-primary text-sm"
                    >
                        <Plus className="w-4 h-4" /> New post
                    </Link>
                ) : (
                    <p className="text-xs text-[var(--color-text-muted)] max-w-xs text-right">
                        Managers can create and delete posts.
                    </p>
                )}
            </div>

            <div className="card p-4">
                <h3 className="font-semibold text-sm mb-2">
                    Legacy slugs (from repo)
                </h3>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    {legacyBlogSummaries.map((p) => (
                        <li key={p.slug} className="flex items-center gap-2">
                            <code className="text-xs">{p.slug}</code>
                            <Link
                                href={`/blog/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-accent)] inline-flex items-center gap-1"
                            >
                                View <ExternalLink className="w-3 h-3" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card !p-0 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-bg-muted)]/50">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Published</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {posts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                                >
                                    No CMS posts yet. Legacy articles still show
                                    on the public blog.
                                </td>
                            </tr>
                        ) : (
                            posts.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 font-medium">
                                        {p.title}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        {p.slug}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.published ? "Yes" : "Draft"}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Link
                                            href={`/admin/blog/${p.id}`}
                                            className="inline-flex p-2 rounded-lg hover:bg-[var(--color-bg-muted)]"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/blog/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex p-2 rounded-lg hover:bg-[var(--color-bg-muted)]"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        {canManage && (
                                            <button
                                                type="button"
                                                className="inline-flex p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-error)]"
                                                onClick={() => void remove(p.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
