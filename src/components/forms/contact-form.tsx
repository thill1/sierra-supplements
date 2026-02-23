"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface FormState {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export function ContactForm() {
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    source: "contact_form",
                    page: "/contact",
                }),
            });

            if (res.ok) {
                setStatus("success");
                setForm({ name: "", email: "", phone: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent-subtle)] flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-[var(--color-accent)]" />
                </div>
                <h3 className="heading-sm mb-2">Message Sent!</h3>
                <p className="body-sm">
                    Thank you! We&apos;ll get back to you within 2 hours during business hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                        Name *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input"
                        placeholder="Your name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Email *
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input"
                        placeholder="you@example.com"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Phone
                </label>
                <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="(555) 555-0000"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    Message *
                </label>
                <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input min-h-[120px] resize-y"
                    placeholder="How can we help you?"
                    required
                />
            </div>

            {status === "error" && (
                <p className="text-sm text-[var(--color-error)]">
                    Something went wrong. Please try again or call us directly.
                </p>
            )}

            <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
                disabled={status === "loading"}
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </>
                ) : (
                    <>
                        Send Message <Send className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>
    );
}
