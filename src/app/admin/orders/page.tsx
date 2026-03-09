"use client";

import { useState, useEffect } from "react";

type OrderItem = { slug: string; name: string; price: number; quantity: number };

type Order = {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    items: string;
    subtotal: number;
    notes: string | null;
    status: string | null;
    createdAt: string | null;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/admin/orders");
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Could not load orders");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Orders</h2>
                <div className="card p-8 text-center">
                    <p className="text-[var(--color-text-muted)]">Loading orders…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="body-sm text-[var(--color-text-muted)]">
                Store orders from checkout. If the database or orders table is not set up, this list will be empty.
            </p>

            {error && (
                <div className="card border-[var(--color-error)]/50 bg-[var(--color-error)]/10 p-4">
                    <p className="text-sm text-[var(--color-error)]">{error}</p>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="body-lg text-[var(--color-text-muted)] mb-2">No orders yet</p>
                    <p className="body-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                        Orders will appear here once customers complete checkout. If you expected to see orders, ensure the database is configured and the orders table exists.
                    </p>
                </div>
            ) : (
                <div className="card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--color-bg-muted)]/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-subtle)]">
                                {orders.map((order) => {
                                    let items: OrderItem[] = [];
                                    try {
                                        items = JSON.parse(order.items) as OrderItem[];
                                    } catch {
                                        // ignore
                                    }
                                    const date = order.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—";
                                    return (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-[var(--color-bg-muted)]/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-sm">#{order.id}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    {items.length} item{items.length !== 1 ? "s" : ""}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">{order.name ?? "—"}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                    {order.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                ${((order.subtotal ?? 0) / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                                                    {order.status ?? "pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                                {date}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
