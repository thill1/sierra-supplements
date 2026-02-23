"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

// Mock data for display if DB isn't populated
const mockLeads = [
    { id: 1, name: "Jake Trail", email: "jake@example.com", phone: "555-0101", source: "contact_form", status: "New", date: "2026-02-10" },
    { id: 2, name: "Summit Sarah", email: "sarah@peak.com", phone: "555-0102", source: "lead_magnet", status: "Contacted", date: "2026-02-09" },
    { id: 3, name: "Mountain Mike", email: "mike@sierra.com", phone: "555-0103", source: "exit_intent", status: "Qualified", date: "2026-02-08" },
];

export default function AdminLeadsPage() {
    const [searchTerm, setSearchTerm] = useState("");

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
                            {mockLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-sm">{lead.name}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">ID: {lead.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{lead.email}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">{lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 space-y-2">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
                                                {lead.source.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                                            <span className="text-sm font-medium">{lead.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                                        {lead.date}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
