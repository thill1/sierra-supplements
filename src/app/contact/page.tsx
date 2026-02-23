import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/forms/contact-form";
import { Phone, MessageSquare, Mail, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: `Get in touch with ${siteConfig.name}. Call, text, email, or visit our Auburn location.`,
};

export default function ContactPage() {
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
                                    href={`tel:${siteConfig.phone}`}
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
                                    href={`sms:${siteConfig.smsNumber}?body=Hi! I'm interested in Sierra Supplements.`}
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

                        {/* Map placeholder */}
                        <div className="card !p-0 overflow-hidden h-48">
                            <div className="w-full h-full bg-[var(--color-surface)] flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-2" />
                                    <p className="body-sm">
                                        {siteConfig.address.city}, {siteConfig.address.state}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="card">
                            <h3 className="heading-sm mb-6">Send Us a Message</h3>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
