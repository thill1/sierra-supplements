"use client";

import { useEffect, useState } from "react";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

type EventRow = {
    id: number;
    type: string;
    page: string | null;
    element: string | null;
    metadata: string | null;
    sessionId: string | null;
    createdAt: string | null;
};

type ByType = { type: string; c: number };

export default function AdminEventsPage() {
    const [byType, setByType] = useState<ByType[]>([]);
    const [items, setItems] = useState<EventRow[]>([]);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const q = typeFilter
                    ? `?type=${encodeURIComponent(typeFilter)}`
                    : "";
                const res = await fetch(`/api/admin/events${q}`, adminFetchInit);
                if (!res.ok) {
                    throw new Error(await getAdminApiErrorMessage(res));
                }
                const json = (await res.json()) as {
                    byType: ByType[];
                    items: EventRow[];
                    retentionNote?: string;
                };
                if (cancelled) return;
                setByType(json.byType);
                setItems(json.items);
                setNote(json.retentionNote ?? "");
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Error");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [typeFilter]);

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
            <div>
                <h2 className="text-xl font-bold">Analytics events</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Recent client-side events (page views, clicks).{" "}
                    {note ? <span className="italic">{note}</span> : null}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-[var(--color-text-muted)]">
                    Filter by type:
                </span>
                <button
                    type="button"
                    className={`text-xs px-3 py-1 rounded-full border ${typeFilter === "" ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]" : "border-[var(--color-border-subtle)]"}`}
                    onClick={() => setTypeFilter("")}
                >
                    All
                </button>
                {byType.slice(0, 12).map((t) => (
                    <button
                        key={t.type}
                        type="button"
                        className={`text-xs px-3 py-1 rounded-full border ${typeFilter === t.type ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]" : "border-[var(--color-border-subtle)]"}`}
                        onClick={() => setTypeFilter(t.type)}
                    >
                        {t.type}{" "}
                        <span className="text-[var(--color-text-muted)]">
                            ({t.c})
                        </span>
                    </button>
                ))}
            </div>

            <div className="card p-4">
                <h3 className="font-semibold text-sm mb-3">Volume by type</h3>
                <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                    {byType.map((t) => (
                        <li key={t.type}>
                            <span className="font-mono">{t.type}</span>: {t.c}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] font-semibold text-sm">
                    Recent raw events
                </div>
                <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[var(--color-bg-elevated)]">
                            <tr>
                                <th className="px-3 py-2">When</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Page</th>
                                <th className="px-3 py-2">Element</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {items.map((e) => (
                                <tr key={e.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-[var(--color-text-muted)]">
                                        {e.createdAt
                                            ? new Date(
                                                  e.createdAt,
                                              ).toLocaleString()
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-2 font-mono">
                                        {e.type}
                                    </td>
                                    <td className="px-3 py-2 max-w-[180px] truncate">
                                        {e.page ?? "—"}
                                    </td>
                                    <td className="px-3 py-2 max-w-[160px] truncate">
                                        {e.element ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
