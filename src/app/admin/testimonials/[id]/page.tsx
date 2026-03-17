"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditTestimonialPage() {
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
        fetch(`/api/admin/testimonials/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((data) =>
                setForm({
                    name: data.name,
                    role: data.role,
                    quote: data.quote,
                    avatar: data.avatar || "",
                    rating: data.rating ?? 5,
                })
            )
            .catch(() => router.push("/admin/testimonials"))
            .finally(() => setLoading(false));
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to update");
            }
            router.push("/admin/testimonials");
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed");
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

            <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Edit Testimonial</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                        <Link href="/admin/testimonials" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
