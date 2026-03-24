"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

export default function NewTestimonialPage() {
    const canManage = useCanManageCatalog();
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
                ...adminFetchInit,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar || null,
                }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            toast.success("Testimonial created.");
            router.push("/admin/testimonials");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to create",
            );
            setLoading(false);
        }
    };

    if (!canManage) {
        return (
            <div className="max-w-2xl space-y-6">
                <Link
                    href="/admin/testimonials"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Testimonials
                </Link>
                <div className="card p-6 space-y-2">
                    <h2 className="text-xl font-bold">New testimonial</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Creating testimonials requires a manager or owner.
                    </p>
                </div>
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

            <h2 className="text-xl font-bold">Add Testimonial</h2>

            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Name *
                    </label>
                    <input
                        type="text"
                        required
                        className="input"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Role / Title *
                    </label>
                    <input
                        type="text"
                        required
                        className="input"
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Quote *
                    </label>
                    <textarea
                        required
                        className="input min-h-[120px]"
                        value={form.quote}
                        onChange={(e) =>
                            setForm({ ...form, quote: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Avatar URL (optional)
                    </label>
                    <input
                        type="url"
                        className="input"
                        value={form.avatar}
                        onChange={(e) =>
                            setForm({ ...form, avatar: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Rating (1-5)
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={5}
                        className="input w-24"
                        value={form.rating}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                rating: parseInt(e.target.value, 10) || 5,
                            })
                        }
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Saving…" : "Save Testimonial"}
                    </button>
                    <Link
                        href="/admin/testimonials"
                        className="btn btn-secondary"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
