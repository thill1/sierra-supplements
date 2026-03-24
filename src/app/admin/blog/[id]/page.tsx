"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Row = {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string;
    readTime: string;
    body: string;
    published: boolean;
};

export default function AdminBlogEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number.parseInt(String(params.id), 10);
    const [row, setRow] = useState<Row | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!Number.isFinite(id)) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/admin/blog-posts/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = (await res.json()) as Row;
                if (!cancelled) setRow(data);
            } catch {
                toast.error("Post not found");
                router.push("/admin/blog");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    async function save() {
        if (!row || !Number.isFinite(id)) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/blog-posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: row.slug.trim(),
                    title: row.title.trim(),
                    excerpt: row.excerpt?.trim() || null,
                    category: row.category.trim(),
                    readTime: row.readTime.trim(),
                    body: row.body,
                    published: row.published,
                }),
            });
            if (!res.ok) {
                const j = (await res.json()) as { error?: string };
                throw new Error(j.error || "Save failed");
            }
            const updated = (await res.json()) as Row;
            setRow(updated);
            toast.success("Saved.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (!Number.isFinite(id)) {
        return <p className="text-[var(--color-error)]">Invalid post.</p>;
    }

    if (loading || !row) {
        return (
            <p className="text-[var(--color-text-muted)] py-12">Loading…</p>
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
            <h2 className="text-xl font-bold">Edit post</h2>

            <div className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Slug
                        </label>
                        <input
                            className="input font-mono text-sm"
                            value={row.slug}
                            onChange={(e) =>
                                setRow((r) =>
                                    r ? { ...r, slug: e.target.value } : r,
                                )
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">
                            Category
                        </label>
                        <input
                            className="input"
                            value={row.category}
                            onChange={(e) =>
                                setRow((r) =>
                                    r ? { ...r, category: e.target.value } : r,
                                )
                            }
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Title
                    </label>
                    <input
                        className="input"
                        value={row.title}
                        onChange={(e) =>
                            setRow((r) =>
                                r ? { ...r, title: e.target.value } : r,
                            )
                        }
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Excerpt
                    </label>
                    <textarea
                        className="input min-h-[60px]"
                        value={row.excerpt ?? ""}
                        onChange={(e) =>
                            setRow((r) =>
                                r ? { ...r, excerpt: e.target.value } : r,
                            )
                        }
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Read time
                    </label>
                    <input
                        className="input w-40"
                        value={row.readTime}
                        onChange={(e) =>
                            setRow((r) =>
                                r ? { ...r, readTime: e.target.value } : r,
                            )
                        }
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Body
                    </label>
                    <textarea
                        className="input min-h-[320px] font-mono text-sm"
                        value={row.body}
                        onChange={(e) =>
                            setRow((r) =>
                                r ? { ...r, body: e.target.value } : r,
                            )
                        }
                    />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={row.published}
                        onChange={(e) =>
                            setRow((r) =>
                                r ? { ...r, published: e.target.checked } : r,
                            )
                        }
                    />
                    Published
                </label>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={() => void save()}
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </div>
        </div>
    );
}
