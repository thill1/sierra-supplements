"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
type AdminRole = "owner" | "manager" | "editor";

type AdminUserRow = {
    id: number;
    email: string;
    role: AdminRole;
    active: boolean;
    createdAt: string | null;
};

const ROLES: AdminRole[] = ["owner", "manager", "editor"];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [newRole, setNewRole] = useState<AdminRole>("editor");
    const [adding, setAdding] = useState(false);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("Only owners can manage team members.");
                }
                throw new Error("Failed to load");
            }
            setUsers(await res.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function addUser() {
        const em = email.trim().toLowerCase();
        if (!em) {
            toast.error("Enter an email.");
            return;
        }
        setAdding(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: em, role: newRole }),
            });
            if (!res.ok) {
                const j = (await res.json()) as { error?: string };
                throw new Error(j.error || "Failed");
            }
            toast.success("Admin added. They can sign in once their email matches.");
            setEmail("");
            await load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
        } finally {
            setAdding(false);
        }
    }

    async function patchUser(
        id: number,
        patch: { role?: AdminRole; active?: boolean },
    ) {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (!res.ok) {
                const j = (await res.json()) as { error?: string };
                throw new Error(j.error || "Update failed");
            }
            toast.success("Updated.");
            await load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Update failed");
        }
    }

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
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-bold">Team</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                    Owner-only: invite admins by email (they must sign in with
                    the same address).
                </p>
            </div>

            <div className="card p-6 space-y-4">
                <h3 className="font-semibold">Add admin</h3>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                            Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="coach@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                            Role
                        </label>
                        <select
                            className="input text-sm"
                            value={newRole}
                            onChange={(e) =>
                                setNewRole(e.target.value as AdminRole)
                            }
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary text-sm"
                        disabled={adding}
                        onClick={() => void addUser()}
                    >
                        {adding ? "Adding…" : "Add"}
                    </button>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--color-bg-muted)]/50">
                        <tr>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 font-mono text-xs">
                                    {u.email}
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="input text-xs py-1"
                                        value={u.role}
                                        onChange={(e) =>
                                            void patchUser(u.id, {
                                                role: e.target.value as AdminRole,
                                            })
                                        }
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={u.active}
                                            onChange={(e) =>
                                                void patchUser(u.id, {
                                                    active: e.target.checked,
                                                })
                                            }
                                        />
                                        <span className="text-xs text-[var(--color-text-muted)]">
                                            {u.active ? "Yes" : "No"}
                                        </span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
