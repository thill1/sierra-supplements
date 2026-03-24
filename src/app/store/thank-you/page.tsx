import Link from "next/link";
import { ArrowRight, CheckCircle, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "Order Confirmed",
    description: "Thanks for your order. We'll be in touch shortly.",
};

export default function OrderThankYouPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[var(--color-accent)]" />
                </div>

                <h1 className="heading-xl mb-4">Order Confirmed! 🎉</h1>
                <p className="body-lg mb-10">
                    Thanks for your order. We&apos;ve received it and will reach out shortly to
                    confirm payment and shipping details.
                </p>

                <p className="body-sm text-[var(--color-text-muted)] mb-8">
                    Check your email for a confirmation. Questions? Call us at{" "}
                    <a href={`tel:${siteConfig.smsNumber}`} className="text-[var(--color-accent)] hover:underline">
                        {siteConfig.phone}
                    </a>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/store" className="btn btn-primary">
                        <ShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                    <Link href="/book" className="btn btn-secondary">
                        Book Consultation <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
