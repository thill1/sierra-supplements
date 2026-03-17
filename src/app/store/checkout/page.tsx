"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, RefreshCw } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { qualifiesForFreeShipping, applyAutoPayDiscount } from "@/lib/shipping";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, itemCount, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoPay, setAutoPay] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
        notes: "",
    });

    if (items.length === 0 && !loading) {
        return (
            <div className="pt-24 min-h-[60vh] flex items-center justify-center">
                <section className="section-container text-center max-w-md">
                    <h1 className="heading-lg mb-4">Your cart is empty</h1>
                    <p className="body-lg mb-8">Add items from the store to checkout.</p>
                    <Link href="/store" className="btn btn-primary">
                        Browse Store <ArrowLeft className="w-4 h-4 inline ml-1" />
                    </Link>
                </section>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
                    autoPay,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Order failed");
            }
            clearCart();
            router.push("/store/thank-you");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <Link
                    href="/store/cart"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Cart
                </Link>

                <h1 className="heading-xl mb-8">Checkout</h1>

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)]">
                            {error}
                        </div>
                    )}

                    <div className="card mb-8 p-6 space-y-6">
                        <h2 className="font-semibold">Shipping & contact</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="input w-full"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    className="input w-full"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-2">Address line 1 *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={form.addressLine1}
                                    onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-2">Address line 2</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={form.addressLine2}
                                    onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">City *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">State *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">ZIP *</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={form.zip}
                                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-2">Order notes</label>
                                <textarea
                                    rows={3}
                                    className="input w-full"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Special instructions, delivery notes..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-8 p-6">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={autoPay}
                                onChange={(e) => setAutoPay(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-[var(--color-accent)]"
                            />
                            <div>
                                <span className="font-medium">Monthly Auto-Pay</span>
                                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                                    Save 10% on every order. We&apos;ll ship the same items monthly and charge your card automatically.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="card mb-8 p-6">
                        <h2 className="font-semibold mb-4">Order summary</h2>
                        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] mb-4">
                            {items.map((item) => (
                                <li key={item.productId} className="flex justify-between">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        {qualifiesForFreeShipping(subtotal) && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-success)] mb-2">
                                <Truck className="w-4 h-4" />
                                <span>Free shipping on this order</span>
                            </div>
                        )}
                        {autoPay && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-success)] mb-2">
                                <RefreshCw className="w-4 h-4" />
                                <span>10% Auto-Pay discount applied</span>
                            </div>
                        )}
                        {autoPay && (
                            <div className="flex justify-between text-sm text-[var(--color-text-muted)] mb-2">
                                <span>Subtotal</span>
                                <span>${(subtotal / 100).toFixed(2)}</span>
                            </div>
                        )}
                        {autoPay && (
                            <div className="flex justify-between text-sm text-[var(--color-success)] mb-2">
                                <span>Auto-Pay discount (10%)</span>
                                <span>-${((subtotal - applyAutoPayDiscount(subtotal)) / 100).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-4 flex justify-between font-semibold">
                            <span>Total ({itemCount} items)</span>
                            <span className="text-[var(--color-accent)]">${((autoPay ? applyAutoPayDiscount(subtotal) : subtotal) / 100).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary flex-1 sm:max-w-xs"
                        >
                            {loading ? "Submitting…" : "Place order"}
                        </button>
                        <Link href="/store/cart" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] mt-4">
                        We&apos;ll contact you to confirm payment and shipping details.
                    </p>
                </form>
            </section>
        </div>
    );
}
