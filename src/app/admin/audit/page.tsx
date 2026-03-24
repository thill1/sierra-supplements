"use client";

import { useCallback, useEffect, useState } from "react";

type AuditRow = {
    id: number;
    actorUserId: number | null;
    entityType: string;
    entityId: string;
    action: string;
    beforeJson: unknown;
    afterJson: unknown;
    createdAt: string | null;
};

type ResponsePayload = {
    items: AuditRow[];
    total: number;
    limit: number;
    offset: number;
};

export default function AdminAuditPage() {
    const [data, setData] = useState<ResponsePayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [entityType, setEntityType] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 50;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const q = new URLSearchParams();
            q.set("limit", String(limit));
            q.set("offset", String(offset));
            if (entityType.trim()) q.set("entityType", entityType.trim());
            if (from) q.set("from", new Date(from).toISOString());
            if (to) q.set("to", new Date(to).toISOString());
            const res = await fetch(`/api/admin/audit-logs?${q}`);
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("You need manager access to view audit logs.");
                }
                throw new Error("Failed to load audit logs");
            }
            setData((await res.json()) as ResponsePayload);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [entityType, from, to, offset]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">Audit log</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Admin actions on products, orders, inventory, and leads.
                </p>
            </div>

            <div className="card p-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Entity type
                    </label>
                    <input
                        className="input text-sm w-40"
                        placeholder="e.g. product"
                        value={entityType}
                        onChange={(e) => {
                            setEntityType(e.target.value);
                            setOffset(0);
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        From
                    </label>
                    <input
                        type="datetime-local"
                        className="input text-sm"
                        value={from}
                        onChange={(e) => {
                            setFrom(e.target.value);
                            setOffset(0);
                        }}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        To
                    </label>
                    <input
                        type="datetime-local"
                        className="input text-sm"
                        value={to}
                        onChange={(e) => {
                            setTo(e.target.value);
                            setOffset(0);
                        }}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-secondary text-sm"
                    onClick={() => {
                        setEntityType("");
                        setFrom("");
                        setTo("");
                        setOffset(0);
                    }}
                >
                    Reset
                </button>
            </div>

            {error ? (
                <div className="p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <p className="text-[var(--color-text-muted)] py-12">Loading…</p>
            ) : data ? (
                <>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Showing {data.items.length} of {data.total} entries
                    </p>
                    <div className="card !p-0 overflow-hidden">
                        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 bg-[var(--color-bg-elevated)] z-10 border-b border-[var(--color-border-subtle)]">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">
                                            When
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">
                                            Entity
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">
                                            Action
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">
                                            Actor
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-text-muted)]">
                                            Detail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                                    {data.items.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-[var(--color-bg-muted)]/30 align-top"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-muted)]">
                                                {row.createdAt
                                                    ? new Date(
                                                          row.createdAt,
                                                      ).toLocaleString()
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {row.entityType}
                                                </span>
                                                <span className="text-[var(--color-text-muted)]">
                                                    {" "}
                                                    #{row.entityId}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.action}
                                            </td>
                                            <td className="px-4 py-3 text-[var(--color-text-muted)]">
                                                {row.actorUserId ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 max-w-md">
                                                <pre className="text-xs whitespace-pre-wrap break-all font-mono text-[var(--color-text-secondary)] max-h-24 overflow-y-auto">
                                                    {JSON.stringify(
                                                        {
                                                            before: row.beforeJson,
                                                            after: row.afterJson,
                                                        },
                                                        null,
                                                        0,
                                                    )}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            className="btn btn-secondary text-sm"
                            disabled={offset === 0}
                            onClick={() =>
                                setOffset((o) => Math.max(0, o - limit))
                            }
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary text-sm"
                            disabled={offset + limit >= data.total}
                            onClick={() => setOffset((o) => o + limit)}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}
