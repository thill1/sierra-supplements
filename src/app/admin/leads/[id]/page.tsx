"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCanManageCatalog } from "@/components/admin/admin-session-context";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

type Lead = {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    message: string | null;
    source: string | null;
    page: string | null;
    status: string | null;
    notes: string | null;
    createdAt: string | null;
};

const STATUS_PRESETS = ["new", "contacted", "qualified", "won", "lost"] as const;

export default function AdminLeadDetailPage() {
    const canManage = useCanManageCatalog();
    const params = useParams();
    const router = useRouter();
    const id = Number.parseInt(String(params.id), 10);
    const [lead, setLead] = useState<Lead | null>(null);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!Number.isFinite(id)) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/admin/leads/${id}`, adminFetchInit);
                if (!res.ok) {
                    throw new Error(await getAdminApiErrorMessage(res));
                }
                const data = (await res.json()) as Lead;
                if (cancelled) return;
                setLead(data);
                setStatus(data.status || "new");
                setNotes(data.notes || "");
            } catch (e) {
                toast.error(
                    e instanceof Error ? e.message : "Lead not found",
                );
                router.push("/admin/leads");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    async function save() {
        if (!Number.isFinite(id)) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/leads/${id}`, {
                ...adminFetchInit,
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: status.trim() || "new",
                    notes: notes.trim() === "" ? null : notes.trim(),
                }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            const updated = (await res.json()) as Lead;
            setLead(updated);
            toast.success("Lead updated.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not save.");
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!Number.isFinite(id)) return;
        if (!confirm("Permanently delete this lead? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/leads/${id}`, {
                ...adminFetchInit,
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            toast.success("Lead deleted.");
            router.push("/admin/leads");
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Could not delete lead.",
            );
        }
    }

    if (!Number.isFinite(id)) {
        return <p className="text-[var(--color-error)]">Invalid lead.</p>;
    }

    if (loading || !lead) {
        return (
            <p className="text-[var(--color-text-muted)] py-12">Loading…</p>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/leads"
                    className="btn btn-secondary text-sm inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
            </div>

            <div className="card p-6 space-y-6">
                {!canManage && (
                    <p className="text-xs rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-amber-950 dark:text-amber-100">
                        View only. Editing or deleting leads requires a manager or
                        owner.
                    </p>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">
                            {lead.name || "Unnamed lead"}
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            ID {lead.id} · {lead.email}
                        </p>
                    </div>
                    {canManage && (
                        <button
                            type="button"
                            onClick={remove}
                            className="btn btn-secondary text-sm text-[var(--color-error)] border-[var(--color-error)]/40 inline-flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                        <span className="text-[var(--color-text-muted)]">
                            Phone
                        </span>
                        <p className="font-medium">{lead.phone || "—"}</p>
                    </div>
                    <div>
                        <span className="text-[var(--color-text-muted)]">
                            Source
                        </span>
                        <p className="font-medium">
                            {(lead.source || "unknown").replace(/_/g, " ")}
                        </p>
                    </div>
                    <div>
                        <span className="text-[var(--color-text-muted)]">
                            Page
                        </span>
                        <p className="font-medium">{lead.page || "—"}</p>
                    </div>
                    <div>
                        <span className="text-[var(--color-text-muted)]">
                            Created
                        </span>
                        <p className="font-medium">
                            {lead.createdAt
                                ? new Date(lead.createdAt).toLocaleString()
                                : "—"}
                        </p>
                    </div>
                </div>

                {lead.message ? (
                    <div>
                        <span className="text-sm text-[var(--color-text-muted)]">
                            Message
                        </span>
                        <p className="mt-1 text-sm whitespace-pre-wrap rounded-lg bg-[var(--color-bg-muted)] p-4">
                            {lead.message}
                        </p>
                    </div>
                ) : null}

                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Status
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {STATUS_PRESETS.map((s) => (
                            <button
                                key={s}
                                type="button"
                                disabled={!canManage}
                                onClick={() => setStatus(s)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                    status === s
                                        ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                                        : "border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]/50"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <input
                        className="input"
                        value={status}
                        disabled={!canManage}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="Custom status"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Internal notes
                    </label>
                    <textarea
                        className="input min-h-[120px]"
                        value={notes}
                        disabled={!canManage}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes visible only to admins…"
                    />
                </div>

                <button
                    type="button"
                    onClick={save}
                    disabled={saving || !canManage}
                    className="btn btn-primary"
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </div>
        </div>
    );
}
