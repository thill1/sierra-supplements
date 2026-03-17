"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, ExternalLink } from "lucide-react";

type Lead = {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    message: string | null;
    source: string | null;
    page: string | null;
    status: string | null;
    createdAt: string | null;
};

export default function AdminLeadsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/leads")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch leads");
                return res.json();
            })
            .then(setLeads)
            .catch((e) => setError(e instanceof Error ? e.message : "Unknown error"))
            .finally(() => setLoading(false));
    }, []);

    const filteredLeads = searchTerm
        ? leads.filter(
            (l) =>
                l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : leads;

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
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="btn btn-secondary text-sm py-2 px-3 flex-grow sm:flex-grow-0">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="btn btn-primary text-sm py-2 px-4 flex-grow sm:flex-grow-0">
                        Export CSV
                    </button>
                </div>
            </div>

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
                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                        No leads found yet. They will appear here once users submit forms.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-sm">{lead.name || "—"}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">ID: {lead.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{lead.email}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">{lead.phone || "—"}</div>
                                    </td>
                                    <td className="px-6 py-4 space-y-2">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                                                {(lead.source || "unknown").replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                                            <span className="text-sm font-medium">{lead.status || "new"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors opacity-0 group-hover:opacity-100">
                                            <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors">
                                            <MoreVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
                                        </button>
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
