"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

type Testimonial = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar: string | null;
    rating: number;
    sortOrder: number;
    published: boolean;
};

export default function AdminTestimonialsPage() {
    const canManage = useCanManageCatalog();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/testimonials", adminFetchInit)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(await getAdminApiErrorMessage(res));
                }
                return res.json();
            })
            .then(setTestimonials)
            .catch((e) => setError(e instanceof Error ? e.message : "Error"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                ...adminFetchInit,
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            setTestimonials((prev) => prev.filter((t) => t.id !== id));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading testimonials…</p>
            </div>
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Testimonials & Reviews</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Manage customer testimonials shown on the homepage.
                    </p>
                </div>
                {canManage ? (
                    <Link
                        href="/admin/testimonials/new"
                        className="btn btn-primary text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Testimonial
                    </Link>
                ) : (
                    <p className="text-xs text-[var(--color-text-muted)] max-w-xs text-right">
                        Managers can add or delete testimonials.
                    </p>
                )}
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Author
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Quote
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {testimonials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                        No testimonials yet. Add one to get started. The site will show testimonials from
                                        site-config until you add database entries.
                                    </td>
                                </tr>
                            ) : (
                                testimonials.map((t) => (
                                    <tr key={t.id} className="hover:bg-[var(--color-bg-muted)]/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-sm">{t.name}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{t.role}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">
                                            {t.quote}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: t.rating }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4 fill-[var(--color-accent)] text-[var(--color-accent)]"
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/testimonials/${t.id}`}
                                                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] inline-block"
                                            >
                                                <Pencil className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            </Link>
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(t.id)
                                                    }
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-error)]"
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
        </div>
    );
}
