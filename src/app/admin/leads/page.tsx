"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Download, ExternalLink } from "lucide-react";

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

function escapeCsvCell(value: string | null | undefined): string {
    const s = value ?? "";
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function leadsToCsv(rows: Lead[]): string {
    const headers = [
        "id",
        "name",
        "email",
        "phone",
        "status",
        "source",
        "page",
        "message",
        "notes",
        "createdAt",
    ];
    const lines = [
        headers.join(","),
        ...rows.map((l) =>
            [
                l.id,
                escapeCsvCell(l.name),
                escapeCsvCell(l.email),
                escapeCsvCell(l.phone),
                escapeCsvCell(l.status),
                escapeCsvCell(l.source),
                escapeCsvCell(l.page),
                escapeCsvCell(l.message),
                escapeCsvCell(l.notes),
                escapeCsvCell(l.createdAt),
            ].join(","),
        ),
    ];
    return lines.join("\r\n");
}

export default function AdminLeadsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [sourceFilter, setSourceFilter] = useState<string>("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        fetch("/api/admin/leads")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch leads");
                return res.json();
            })
            .then(setLeads)
            .catch((e) =>
                setError(e instanceof Error ? e.message : "Unknown error"),
            )
            .finally(() => setLoading(false));
    }, []);

    const sourceOptions = useMemo(() => {
        const set = new Set<string>();
        for (const l of leads) {
            if (l.source) set.add(l.source);
        }
        return Array.from(set).sort();
    }, [leads]);

    const statusOptions = useMemo(() => {
        const set = new Set<string>();
        for (const l of leads) {
            set.add(l.status || "new");
        }
        return Array.from(set).sort();
    }, [leads]);

    const filteredLeads = useMemo(() => {
        let list = leads;
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (l) =>
                    l.name?.toLowerCase().includes(q) ||
                    l.email.toLowerCase().includes(q) ||
                    l.phone?.toLowerCase().includes(q),
            );
        }
        if (statusFilter) {
            list = list.filter(
                (l) => (l.status || "new") === statusFilter,
            );
        }
        if (sourceFilter) {
            list = list.filter((l) => (l.source || "") === sourceFilter);
        }
        return list;
    }, [leads, searchTerm, statusFilter, sourceFilter]);

    function exportCsv() {
        const csv = leadsToCsv(filteredLeads);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-[var(--color-text-muted)]">Loading leads…</p>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    <button
                        type="button"
                        onClick={() => setFilterOpen((o) => !o)}
                        className="btn btn-secondary text-sm py-2 px-3 inline-flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <button
                        type="button"
                        onClick={exportCsv}
                        className="btn btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {filterOpen ? (
                <div className="card p-4 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Status
                        </label>
                        <select
                            className="input text-sm min-w-[160px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Source
                        </label>
                        <select
                            className="input text-sm min-w-[200px]"
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                        >
                            <option value="">All sources</option>
                            {sourceOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost text-sm"
                        onClick={() => {
                            setStatusFilter("");
                            setSourceFilter("");
                        }}
                    >
                        Clear filters
                    </button>
                </div>
            ) : null}

            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Lead Information
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Source & Stage
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                                    >
                                        No leads match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-[var(--color-bg-muted)]/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-sm">
                                                {lead.name || "—"}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                ID: {lead.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">{lead.email}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                {lead.phone || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-2">
                                            <div className="flex gap-2">
                                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                                                    {(lead.source || "unknown").replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                                                <span className="text-sm font-medium">
                                                    {lead.status || "new"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                                            {lead.createdAt
                                                ? new Date(
                                                      lead.createdAt,
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/leads/${lead.id}`}
                                                className="inline-flex p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                                                title="Open lead"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
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
