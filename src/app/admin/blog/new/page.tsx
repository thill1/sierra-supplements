"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

export default function AdminBlogNewPage() {
    const canManage = useCanManageCatalog();
    const router = useRouter();
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("General");
    const [readTime, setReadTime] = useState("5 min");
    const [body, setBody] = useState("");
    const [published, setPublished] = useState(false);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/blog-posts", {
                ...adminFetchInit,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: slug.trim(),
                    title: title.trim(),
                    excerpt: excerpt.trim() || null,
                    category: category.trim(),
                    readTime: readTime.trim(),
                    body,
                    published,
                }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            const row = (await res.json()) as { id: number };
            toast.success("Post created.");
            router.push(`/admin/blog/${row.id}`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (!canManage) {
        return (
            <div className="space-y-6 max-w-xl">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                >
                    <ArrowLeft className="w-4 h-4" /> All posts
                </Link>
                <div className="card p-6 space-y-2">
                    <h2 className="text-xl font-bold">New blog post</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Creating posts requires a manager or owner.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <Link
                href="/admin/blog"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
                <ArrowLeft className="w-4 h-4" /> All posts
            </Link>
            <h2 className="text-xl font-bold">New blog post</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
                Use simple markdown-style lines:{" "}
                <code className="text-[var(--color-accent)]">##</code> headings,{" "}
                <code className="text-[var(--color-accent)]">###</code>{" "}
                subheadings, <code className="text-[var(--color-accent)]">-</code>{" "}
                list items.
            </p>

            <div className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Slug (kebab-case)
                        </label>
                        <input
                            className="input font-mono text-sm"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="my-new-post"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Category
                        </label>
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Title
                    </label>
                    <input
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Excerpt
                    </label>
                    <textarea
                        className="input min-h-[60px]"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Read time label
                    </label>
                    <input
                        className="input w-40"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Body
                    </label>
                    <textarea
                        className="input min-h-[280px] font-mono text-sm"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                    />
                    Published (visible on public blog)
                </label>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={() => void save()}
                >
                    {saving ? "Saving…" : "Create post"}
                </button>
            </div>
        </div>
    );
}
