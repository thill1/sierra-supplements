"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTestimonialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        role: "",
        quote: "",
        avatar: "",
        rating: 5,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/admin/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create");
            }
            router.push("/admin/testimonials");
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <Link
                href="/admin/testimonials"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Testimonials
            </Link>

            <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Add Testimonial</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Name *</label>
                        <input
                            type="text"
                            required
                            className="input w-full"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Jake R."
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
                            placeholder="Trail Runner"
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
                            placeholder="Sierra Strength completely changed my recovery game..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Avatar URL (optional)</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={form.avatar}
                            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                            placeholder="/images/testimonials/jake.jpg"
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
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? "Saving…" : "Save Testimonial"}
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
