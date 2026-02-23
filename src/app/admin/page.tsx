import { db } from "@/db";
import { leads } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
    Users,
    TrendingUp,
    MessageSquare,
    Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
    // Graceful fallback if DB isn't running yet during preview
    let recentLeads: any[] = [];
    try {
        recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5);
    } catch (e) {
        console.warn("Could not fetch leads for dashboard", e);
    }

    const stats = [
        { label: "Total Leads", value: "0", icon: Users, trend: "+0%" },
        { label: "Conversion Rate", value: "0%", icon: TrendingUp, trend: "+0%" },
        { label: "New Messages", value: "0", icon: MessageSquare, trend: "0" },
        { label: "Avg. Response", value: "2h", icon: Clock, trend: "-10m" },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-[var(--color-accent)]" />
                            </div>
                            <span className="text-xs font-medium text-[var(--color-success)] bg-green-500/10 px-2 py-1 rounded">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent Leads Table */}
            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                    <h2 className="font-semibold">Recent Leads</h2>
                    <button className="text-sm text-[var(--color-accent)] hover:underline">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Lead
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {recentLeads.length > 0 ? (
                                recentLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-sm">{lead.name || lead.email}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{lead.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border-subtle)] capitalize">
                                                {lead.source?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-[var(--color-accent)]">
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[var(--color-text-muted)]">
                                            {lead.createdAt?.toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                        No leads found yet. They will appear here once users submit forms.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
