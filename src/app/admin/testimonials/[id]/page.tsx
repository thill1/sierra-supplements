"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

export default function EditTestimonialPage() {
    const canManage = useCanManageCatalog();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        role: "",
        quote: "",
        avatar: "",
        rating: 5,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(
                    `/api/admin/testimonials/${id}`,
                    adminFetchInit,
                );
                if (!res.ok) {
                    throw new Error(await getAdminApiErrorMessage(res));
                }
                const data = await res.json();
                if (!cancelled) {
                    setForm({
                        name: data.name,
                        role: data.role,
                        quote: data.quote,
                        avatar: data.avatar || "",
                        rating: data.rating ?? 5,
                    });
                }
            } catch (e) {
                toast.error(
                    e instanceof Error ? e.message : "Could not load",
                );
                if (!cancelled) router.push("/admin/testimonials");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                ...adminFetchInit,
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar || null,
                }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            toast.success("Saved.");
            router.push("/admin/testimonials");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading…</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <Link
                href="/admin/testimonials"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Testimonials
            </Link>

            {!canManage && (
                <p className="text-xs rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-amber-950 dark:text-amber-100">
                    View only. Saving requires a manager or owner.
                </p>
            )}
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Edit Testimonial</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset
                        disabled={!canManage}
                        className="space-y-4 border-0 p-0 m-0 min-w-0 disabled:opacity-65"
                    >
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Name *</label>
                        <input
                            type="text"
                            required
                            className="input w-full"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Role *</label>
                        <input
                            type="text"
                            required
                            className="input w-full"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Quote *</label>
                        <textarea
                            required
                            rows={4}
                            className="input w-full"
                            value={form.quote}
                            onChange={(e) => setForm({ ...form, quote: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Avatar URL (optional)</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={form.avatar}
                            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Rating (1–5)</label>
                        <select
                            className="input w-full"
                            value={form.rating}
                            onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                        >
                            {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                    {n} star{n > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving || !canManage}
                            className="btn btn-primary"
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                        <Link href="/admin/testimonials" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
