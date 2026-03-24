import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping & Delivery",
    description: `Shipping and delivery information for ${siteConfig.name}. Rates, timeframes, and policies.`,
};

export default function ShippingPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="max-w-3xl mx-auto">
                    <h1 className="heading-xl mb-2">Shipping & Delivery</h1>
                    <p className="body-sm text-[var(--color-text-muted)] mb-10">
                        How we ship and when you can expect your order.
                    </p>

                    <div className="space-y-8">
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Free Shipping</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Free shipping on orders over $80. Orders under $80 are subject to standard shipping rates at checkout.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Processing Time</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Orders are typically processed within 1–2 business days. You will receive a confirmation email when your order ships.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Delivery Areas</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                We ship within the continental United States. Delivery times vary by carrier and destination, usually 3–7 business days after shipment.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Local Pickup</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Visiting the Sierra? You can pick up your order at our Auburn location. Select local pickup at checkout and we&apos;ll confirm availability.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Questions</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Contact us at{" "}
                                <a href={`mailto:${siteConfig.email}`} className="text-[var(--color-accent)] hover:underline">
                                    {siteConfig.email}
                                </a>{" "}
                                or{" "}
                                <a href={`tel:${siteConfig.smsNumber}`} className="text-[var(--color-accent)] hover:underline">
                                    {siteConfig.phone}
                                </a>{" "}
                                for shipping questions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
