"use client";

import { useState } from "react";
import { Save, RotateCcw, Eye, LayoutGrid } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function AdminContentPage() {
    const [activeSection, setActiveSection] = useState("hero");

    const sections = [
        { id: "hero", label: "Hero Section" },
        { id: "services", label: "Services Listing" },
        { id: "pricing", label: "Pricing Tiers" },
        { id: "faqs", label: "FAQs" },
        { id: "leadMagnet", label: "Lead Magnet" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Homepage Editor</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Modify the content blocks shown on your landing page.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary text-sm">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <button className="btn btn-primary text-sm px-6">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeSection === section.id
                                ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium"
                                : "hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border-subtle)]">
                            <h3 className="font-semibold capitalize">{activeSection} Content</h3>
                            <button className="text-[var(--color-accent)] hover:underline text-sm flex items-center gap-1">
                                <Eye className="w-4 h-4" /> Preview
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeSection === "hero" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Headline</label>
                                        <textarea
                                            className="input"
                                            defaultValue="Fuel Your Body Like a Mountain Fuels the Wild"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Subheadline</label>
                                        <textarea
                                            className="input"
                                            defaultValue={siteConfig.description}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Primary CTA</label>
                                            <input className="input" defaultValue="Book Free Consultation" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Secondary CTA</label>
                                            <input className="input" defaultValue="Explore Services" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSection === "leadMagnet" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Offer Title</label>
                                        <input className="input" defaultValue={siteConfig.leadMagnet.title} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Offer Subtitle</label>
                                        <textarea className="input" defaultValue={siteConfig.leadMagnet.subtitle} rows={2} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Button Text</label>
                                        <input className="input" defaultValue={siteConfig.leadMagnet.cta} />
                                    </div>
                                </>
                            )}

                            {(activeSection === "services" || activeSection === "pricing" || activeSection === "faqs") && (
                                <div className="bg-[var(--color-bg-muted)] p-8 rounded-xl border border-dashed border-[var(--color-border)] text-center">
                                    <p className="text-[var(--color-text-muted)] italic">
                                        {activeSection} are currently managed via <code className="text-[var(--color-accent)]">site-config.ts</code> for maximum performance. Database synchronization coming soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
