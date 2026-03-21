"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Package, ArrowLeft } from "lucide-react";

type ProductOption = { id: number; name: string; stockQuantity: number };
type MovementRow = {
    id: number;
    productId: number;
    productName: string;
    delta: number;
    reason: string;
    source: string;
    note: string | null;
    createdAt: string | null;
};

export default function AdminInventoryPage() {
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [movements, setMovements] = useState<MovementRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [saleProductId, setSaleProductId] = useState("");
    const [saleQty, setSaleQty] = useState("1");
    const [salePay, setSalePay] = useState("");
    const [saleNote, setSaleNote] = useState("");

    const [adjProductId, setAdjProductId] = useState("");
    const [adjDelta, setAdjDelta] = useState("");
    const [adjNote, setAdjNote] = useState("");

    const [restProductId, setRestProductId] = useState("");
    const [restQty, setRestQty] = useState("");
    const [restNote, setRestNote] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pr, mv] = await Promise.all([
                fetch("/api/admin/products"),
                fetch("/api/admin/inventory/movements?limit=80"),
            ]);
            const plist = await pr.json();
            const mlist = await mv.json();
            setProducts(
                Array.isArray(plist)
                    ? plist.map((p: { id: number; name: string; stockQuantity: number }) => ({
                          id: p.id,
                          name: p.name,
                          stockQuantity: p.stockQuantity ?? 0,
                      }))
                    : [],
            );
            setMovements(Array.isArray(mlist) ? mlist : []);
        } catch {
            toast.error("Could not load inventory data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function postSale(e: React.FormEvent) {
        e.preventDefault();
        const pid = parseInt(saleProductId, 10);
        const q = parseInt(saleQty, 10);
        if (!Number.isFinite(pid) || !Number.isFinite(q)) {
            toast.error("Choose a product and quantity.");
            return;
        }
        try {
            const res = await fetch("/api/admin/inventory/in-store-sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: pid,
                    quantity: q,
                    paymentMethod: salePay || null,
                    note: saleNote || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed");
            toast.success(`Recorded sale. New stock: ${data.newQuantity}`);
            setSaleNote("");
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
        }
    }

    async function postAdjust(e: React.FormEvent) {
        e.preventDefault();
        const pid = parseInt(adjProductId, 10);
        const d = parseInt(adjDelta, 10);
        if (!Number.isFinite(pid) || !Number.isFinite(d) || d === 0) {
            toast.error("Product and non-zero delta required.");
            return;
        }
        try {
            const res = await fetch("/api/admin/inventory/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: pid,
                    delta: d,
                    note: adjNote || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed");
            toast.success(`Adjusted. New stock: ${data.newQuantity}`);
            setAdjDelta("");
            setAdjNote("");
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
        }
    }

    async function postRestock(e: React.FormEvent) {
        e.preventDefault();
        const pid = parseInt(restProductId, 10);
        const q = parseInt(restQty, 10);
        if (!Number.isFinite(pid) || !Number.isFinite(q) || q <= 0) {
            toast.error("Product and quantity required.");
            return;
        }
        try {
            const res = await fetch("/api/admin/inventory/restock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: pid,
                    quantity: q,
                    note: restNote || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed");
            toast.success(`Restocked. New stock: ${data.newQuantity}`);
            setRestQty("");
            setRestNote("");
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
        }
    }

    return (
        <div className="space-y-10 max-w-5xl">
            <div>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </Link>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6" /> Inventory
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Record in-gym sales, shipments, and corrections. Every change
                    writes to the movement log.
                </p>
            </div>

            {loading && products.length === 0 ? (
                <p className="text-[var(--color-text-muted)]">Loading…</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <form onSubmit={postSale} className="card p-5 space-y-3">
                        <h3 className="font-semibold">In-store sale</h3>
                        <select
                            className="input"
                            required
                            value={saleProductId}
                            onChange={(e) => setSaleProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.stockQuantity} on hand)
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min={1}
                            className="input"
                            placeholder="Quantity"
                            value={saleQty}
                            onChange={(e) => setSaleQty(e.target.value)}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Payment method (optional)"
                            value={salePay}
                            onChange={(e) => setSalePay(e.target.value)}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Note (optional)"
                            value={saleNote}
                            onChange={(e) => setSaleNote(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary w-full">
                            Record sale
                        </button>
                    </form>

                    <form onSubmit={postAdjust} className="card p-5 space-y-3">
                        <h3 className="font-semibold">Quick adjustment</h3>
                        <select
                            className="input"
                            required
                            value={adjProductId}
                            onChange={(e) => setAdjProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="input"
                            placeholder="Delta (+ or − units)"
                            value={adjDelta}
                            onChange={(e) => setAdjDelta(e.target.value)}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Note (optional)"
                            value={adjNote}
                            onChange={(e) => setAdjNote(e.target.value)}
                        />
                        <button type="submit" className="btn btn-secondary w-full">
                            Apply adjustment
                        </button>
                    </form>

                    <form onSubmit={postRestock} className="card p-5 space-y-3">
                        <h3 className="font-semibold">Shipment / restock</h3>
                        <select
                            className="input"
                            required
                            value={restProductId}
                            onChange={(e) => setRestProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min={1}
                            className="input"
                            placeholder="Units received"
                            value={restQty}
                            onChange={(e) => setRestQty(e.target.value)}
                        />
                        <input
                            type="text"
                            className="input"
                            placeholder="Note (optional)"
                            value={restNote}
                            onChange={(e) => setRestNote(e.target.value)}
                        />
                        <button type="submit" className="btn btn-secondary w-full">
                            Add stock
                        </button>
                    </form>
                </div>
            )}

            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border-subtle)]">
                    <h3 className="font-semibold">Movement history</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-muted)]/50">
                                <th className="px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                    When
                                </th>
                                <th className="px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                    Product
                                </th>
                                <th className="px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                    Δ
                                </th>
                                <th className="px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                    Source
                                </th>
                                <th className="px-4 py-2 text-xs uppercase text-[var(--color-text-muted)]">
                                    Note
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {movements.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                                    >
                                        No movements yet.
                                    </td>
                                </tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-2 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                            {m.createdAt
                                                ? new Date(
                                                      m.createdAt,
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-2">{m.productName}</td>
                                        <td
                                            className={`px-4 py-2 font-medium tabular-nums ${m.delta < 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}
                                        >
                                            {m.delta > 0 ? "+" : ""}
                                            {m.delta}
                                        </td>
                                        <td className="px-4 py-2 capitalize text-[var(--color-text-secondary)]">
                                            {m.source.replace(/_/g, " ")}
                                        </td>
                                        <td className="px-4 py-2 text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">
                                            {m.note ?? "—"}
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
