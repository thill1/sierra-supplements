import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: `Privacy policy for ${siteConfig.name}. How we collect, use, and protect your information.`,
};

export default function PrivacyPage() {
    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="max-w-3xl mx-auto">
                    <h1 className="heading-xl mb-2">Privacy Policy</h1>
                    <p className="body-sm text-[var(--color-text-muted)] mb-10">
                        Last updated: {new Date().toLocaleDateString("en-US")}
                    </p>

                    <div className="space-y-8">
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Information We Collect</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                We collect information you provide when placing orders, contacting us, or signing up for communications. This may include name, email, phone, and shipping address.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">How We Use Your Information</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                We use your information to process orders, respond to inquiries, send order confirmations, and improve our services. We do not sell your personal information to third parties.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Data Security</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                We take reasonable measures to protect your personal information. Payment processing is handled by secure third-party providers.
                            </p>
                        </div>
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-3">Contact</h2>
                            <p className="body-sm text-[var(--color-text-secondary)]">
                                Questions about this policy? Contact us at{" "}
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
