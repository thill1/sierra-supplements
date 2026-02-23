"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
    const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="pt-24 min-h-[60vh] flex items-center justify-center">
                <section className="section-container text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-[var(--color-accent)]" />
                    </div>
                    <h1 className="heading-lg mb-4">Your cart is empty</h1>
                    <p className="body-lg mb-8">
                        Add supplements from the store to get started.
                    </p>
                    <Link href="/store" className="btn btn-primary">
                        Browse Store <ArrowLeft className="w-4 h-4" />
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Store
                </Link>

                <h1 className="heading-xl mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.productId}
                                className="card flex gap-4 p-4"
                            >
                                <div className="w-24 h-24 rounded-lg bg-[var(--color-surface)] flex-shrink-0 overflow-hidden relative">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl opacity-30">💊</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/store/${item.slug}`}
                                        className="font-semibold hover:text-[var(--color-accent)] transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-[var(--color-accent)] mt-1">
                                        ${((item.price * item.quantity) / 100).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(
                                                item.productId,
                                                parseInt(e.target.value, 10)
                                            )
                                        }
                                        className="input w-16 py-2 text-center"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="p-2 rounded-lg hover:bg-[var(--color-error)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                                        aria-label="Remove from cart"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-28">
                            <h2 className="font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-muted)]">
                                        Subtotal ({itemCount} items)
                                    </span>
                                    <span className="font-medium">
                                        ${(subtotal / 100).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] mb-6">
                                Shipping & taxes calculated at checkout.
                            </p>
                            <Link
                                href="/store/checkout"
                                className="btn btn-primary w-full"
                            >
                                Proceed to Checkout
                            </Link>
                            <p className="text-xs text-center mt-4 text-[var(--color-text-muted)]">
                                Checkout coming soon — this is a placeholder.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
