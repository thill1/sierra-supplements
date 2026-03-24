"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    autoPay: boolean | null;
    notes: string | null;
    status: string | null;
    stripeCheckoutSessionId: string | null;
    createdAt: string | null;
};

type LineItem = {
    id: number;
    productName: string;
    sku: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
};

const STATUSES = [
    "pending",
    "paid",
    "packed",
    "fulfilled",
    "cancelled",
    "refunded",
] as const;

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number.parseInt(String(params.id), 10);
    const [order, setOrder] = useState<Order | null>(null);
    const [lines, setLines] = useState<LineItem[]>([]);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [custName, setCustName] = useState("");
    const [custPhone, setCustPhone] = useState("");
    const [addr1, setAddr1] = useState("");
    const [addr2, setAddr2] = useState("");
    const [city, setCity] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [zip, setZip] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!Number.isFinite(id)) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/admin/orders/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = (await res.json()) as {
                    order: Order;
                    lineItems: LineItem[];
                };
                if (cancelled) return;
                setOrder(data.order);
                setLines(data.lineItems);
                const o = data.order;
                setStatus(o.status ?? "pending");
                setNotes(o.notes ?? "");
                setCustName(o.name ?? "");
                setCustPhone(o.phone ?? "");
                setAddr1(o.addressLine1 ?? "");
                setAddr2(o.addressLine2 ?? "");
                setCity(o.city ?? "");
                setStateVal(o.state ?? "");
                setZip(o.zip ?? "");
            } catch {
                toast.error("Order not found");
                router.push("/admin/orders");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    async function saveOrder() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    notes: notes.trim() === "" ? null : notes.trim(),
                    name: custName.trim() === "" ? null : custName.trim(),
                    phone: custPhone.trim() === "" ? null : custPhone.trim(),
                    addressLine1:
                        addr1.trim() === "" ? null : addr1.trim(),
                    addressLine2:
                        addr2.trim() === "" ? null : addr2.trim(),
                    city: city.trim() === "" ? null : city.trim(),
                    state: stateVal.trim() === "" ? null : stateVal.trim(),
                    zip: zip.trim() === "" ? null : zip.trim(),
                }),
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Order updated.");
            const data = await res.json();
            setOrder(data.order);
        } catch {
            toast.error("Could not save order.");
        } finally {
            setSaving(false);
        }
    }

    if (!Number.isFinite(id)) {
        return <p className="text-[var(--color-error)]">Invalid order.</p>;
    }

    if (loading || !order) {
        return (
            <p className="text-[var(--color-text-muted)] py-12">Loading…</p>
        );
    }

    let legacyItems: { name?: string; quantity?: number; price?: number }[] =
        [];
    try {
        legacyItems = JSON.parse(order.items) as typeof legacyItems;
    } catch {
        /* ignore */
    }

    const displayLines =
        lines.length > 0
            ? lines.map((l) => ({
                  name: l.productName,
                  qty: l.quantity,
                  unit: l.unitPrice,
                  total: l.lineTotal,
              }))
            : legacyItems.map((l) => ({
                  name: l.name ?? "Item",
                  qty: l.quantity ?? 0,
                  unit: l.price ?? 0,
                  total: (l.price ?? 0) * (l.quantity ?? 0),
              }));

    return (
        <div className="max-w-3xl space-y-8">
            <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
                <ArrowLeft className="w-4 h-4" /> All orders
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Order #{order.id}</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : ""}
                    </p>
                    {order.stripeCheckoutSessionId && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                            Stripe: {order.stripeCheckoutSessionId}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        className="input text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card p-6 space-y-4 text-sm">
                <p className="text-[var(--color-text-muted)]">
                    Email (checkout) is fixed:{" "}
                    <span className="text-[var(--color-text)] font-medium">
                        {order.email}
                    </span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Customer name
                        </label>
                        <input
                            className="input"
                            value={custName}
                            onChange={(e) => setCustName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Phone
                        </label>
                        <input
                            className="input"
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Address line 1
                    </label>
                    <input
                        className="input"
                        value={addr1}
                        onChange={(e) => setAddr1(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Address line 2
                    </label>
                    <input
                        className="input"
                        value={addr2}
                        onChange={(e) => setAddr2(e.target.value)}
                    />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            City
                        </label>
                        <input
                            className="input"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            State
                        </label>
                        <input
                            className="input"
                            value={stateVal}
                            onChange={(e) => setStateVal(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            ZIP
                        </label>
                        <input
                            className="input"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Internal notes
                    </label>
                    <textarea
                        className="input min-h-[100px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Fulfillment notes, gift messages, etc."
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary text-sm"
                    disabled={saving}
                    onClick={() => saveOrder()}
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
                <p className="text-xs text-[var(--color-text-muted)]">
                    Line items and payment totals are not editable here; they
                    come from checkout. See docs/ADMIN-OPERATIONS.md.
                </p>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-3 border-b border-[var(--color-border-subtle)] font-semibold">
                    Line items
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[var(--color-bg-muted)]/50 text-left">
                            <th className="px-6 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                Product
                            </th>
                            <th className="px-6 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                Qty
                            </th>
                            <th className="px-6 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                Unit
                            </th>
                            <th className="px-6 py-2 text-xs uppercase text-[var(--color-text-muted)] text-right">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {displayLines.map((l, i) => (
                            <tr key={i}>
                                <td className="px-6 py-3">{l.name}</td>
                                <td className="px-6 py-3 tabular-nums">{l.qty}</td>
                                <td className="px-6 py-3 tabular-nums">
                                    ${(l.unit / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-right tabular-nums font-medium">
                                    ${(l.total / 100).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>${((order.subtotal ?? 0) / 100).toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
