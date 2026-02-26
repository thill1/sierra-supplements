"use client";

import { useState } from "react";
import { Save, Bell, Shield, Mail, Globe, Palette } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="max-w-4xl space-y-8">
            {/* General Settings */}
            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Globe className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">General Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Site Name</label>
                        <input className="input" defaultValue="Sierra Strength" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Base URL</label>
                        <input className="input" defaultValue="https://sierrastrengthsupplements.com" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5">Admin Notification Email</label>
                        <input className="input" defaultValue="admin@sierrastrengthsupplements.com" />
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                            Form submissions and system alerts will be sent here.
                        </p>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Bell className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">Lead Notifications</h2>
                </div>

                <div className="space-y-4">
                    {[
                        { id: "email_leads", label: "Email notifications for new leads", defaultChecked: true },
                        { id: "sms_leads", label: "SMS notifications for urgent leads", defaultChecked: false },
                        { id: "nurture_auto", label: "Auto-enroll leads in email nurture sequence", defaultChecked: true },
                    ].map((option) => (
                        <div key={option.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-0">
                            <span className="text-sm">{option.label}</span>
                            <input type="checkbox" className="w-4 h-4 accent-[var(--color-accent)]" defaultChecked={option.defaultChecked} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Security */}
            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">Security & Auth</h2>
                </div>

                <div className="space-y-4 text-sm">
                    <p className="body-sm">
                        Current Auth Providers: <span className="text-[var(--color-accent)]">Resend (Magic Link), Google OAuth</span>
                    </p>
                    <button className="btn btn-secondary text-xs py-2 px-3">
                        Manage API Keys
                    </button>
                </div>
            </section>

            <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-secondary px-8">Discard</button>
                <button className="btn btn-primary px-12">Save All Settings</button>
            </div>
        </div>
    );
}
