import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: `Terms of service for ${siteConfig.name}. Usage terms and conditions for our store and services.`,
};

export default function TermsPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="max-w-3xl mx-auto">
                    <h1 className="heading-xl mb-2">Terms of Service</h1>
                    <p className="body-sm text-[var(--color-text-muted)] mb-10">
                        Last updated: {new Date().toLocaleDateString("en-US")}
                    </p>

                    <div className="space-y-8">
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Acceptance of Terms</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                By using our website and placing orders, you agree to these terms. If you do not agree, please do not use our services.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Products & Orders</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Product availability and pricing are subject to change. We reserve the right to limit quantities and correct errors. Orders are subject to acceptance and availability.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Disclaimer</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Supplement statements have not been evaluated by the FDA. Our products are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare provider before use.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Contact</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Questions about these terms? Contact us at{" "}
                                <a href={`mailto:${siteConfig.email}`} className="text-[var(--color-accent)] hover:underline">
                                    {siteConfig.email}
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
