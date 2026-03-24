import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/forms/contact-form";
import { Phone, MessageSquare, Mail, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: `Get in touch with ${siteConfig.name}. Call, text, email, or visit our Auburn location.`,
};

type Props = { searchParams: Promise<{ form?: string }> };

const QUOTE_PROMPT =
    "I'm interested in a custom supplement or coaching quote. Please reach out with next steps.";

export default async function ContactPage({ searchParams }: Props) {
    const q = await searchParams;
    const quoteIntent = q.form === "quote";

    return (
        <div className="pt-24">
            <section className="section-container section-padding">
                <div className="text-center mb-12">
                    <span className="label">Get in Touch</span>
                    <h1 className="heading-xl mt-2 mb-4">
                        We&apos;d Love to{" "}
                        <span className="gradient-text">Hear From You</span>
                    </h1>
                    <p className="body-lg max-w-2xl mx-auto">
                        Have a question, want to schedule a visit, or ready to get started?
                        Reach out — we respond within 2 hours during business hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="card">
                            <h3 className="font-semibold mb-4">Quick Contact</h3>
                            <div className="space-y-4">
                                <a
                                    href={`tel:${siteConfig.smsNumber}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-[var(--color-accent)]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Call Us</div>
                                        <div className="body-sm">{siteConfig.phone}</div>
                                    </div>
                                </a>

                                <a
                                    href={`sms:${siteConfig.smsNumber}?body=Hi! I'm interested in Sierra Strength.`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-[var(--color-accent)]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Text Us</div>
                                        <div className="body-sm">{siteConfig.smsNumber}</div>
                                    </div>
                                </a>

                                <a
                                    href={`mailto:${siteConfig.email}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[var(--color-accent)]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Email</div>
                                        <div className="body-sm">{siteConfig.email}</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="card">
                            <h3 className="font-semibold mb-4">Visit Us</h3>
                            <div className="flex items-start gap-3 mb-4">
                                <MapPin className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium">Location</div>
                                    <div className="body-sm">{siteConfig.address.full}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium mb-1">Hours</div>
                                    {siteConfig.hours.map((h) => (
                                        <div key={h.day} className="body-sm">
                                            <span className="text-[var(--color-text-secondary)]">
                                                {h.day}:
                                            </span>{" "}
                                            {h.time}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Google Maps embed */}
                        <div className="card !p-0 overflow-hidden h-48 rounded-xl bg-[var(--color-bg-muted)]">
                            <iframe
                                title={`${siteConfig.name} location`}
                                src={siteConfig.mapsEmbedSrc}
                                width="100%"
                                height="100%"
                                className="block min-h-[12rem]"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="card" id="contact-form-panel">
                            <h3 className="heading-sm mb-6">
                                {quoteIntent ? "Request a quote" : "Send Us a Message"}
                            </h3>
                            <ContactForm
                                defaultMessage={quoteIntent ? QUOTE_PROMPT : ""}
                                leadSource={
                                    quoteIntent ? "contact_form_quote" : "contact_form"
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
