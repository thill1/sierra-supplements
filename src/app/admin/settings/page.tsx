"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Bell, Shield, Mail, Globe } from "lucide-react";
import { toast } from "sonner";

type SettingsPayload = {
    siteName: string;
    baseUrl: string;
    adminNotificationEmail: string;
    notifyEmailLeads: boolean;
    notifySmsLeads: boolean;
    nurtureAuto: boolean;
};

const emptyForm: SettingsPayload = {
    siteName: "",
    baseUrl: "",
    adminNotificationEmail: "",
    notifyEmailLeads: true,
    notifySmsLeads: false,
    nurtureAuto: true,
};

export default function AdminSettingsPage() {
    const [form, setForm] = useState<SettingsPayload>(emptyForm);
    const [baseline, setBaseline] = useState<SettingsPayload>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/settings", {
                credentials: "include",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    typeof err?.error === "string"
                        ? err.error
                        : "Could not load settings",
                );
            }
            const data = (await res.json()) as SettingsPayload;
            setForm(data);
            setBaseline(data);
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Could not load settings",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg =
                    typeof data?.error === "string"
                        ? data.error
                        : "Save failed";
                throw new Error(msg);
            }
            const saved = data as SettingsPayload;
            setForm(saved);
            setBaseline(saved);
            toast.success("Settings saved");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    function handleDiscard() {
        setForm(baseline);
        toast.message("Changes discarded");
    }

    if (loading) {
        return (
            <div className="max-w-4xl py-12 text-sm text-[var(--color-text-muted)]">
                Loading settings…
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Globe className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">General Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Site Name
                        </label>
                        <input
                            className="input"
                            value={form.siteName}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    siteName: e.target.value,
                                }))
                            }
                            autoComplete="organization"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Base URL
                        </label>
                        <input
                            className="input"
                            type="url"
                            value={form.baseUrl}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, baseUrl: e.target.value }))
                            }
                            autoComplete="url"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                            <Mail className="w-4 h-4 opacity-70" />
                            Admin Notification Email
                        </label>
                        <input
                            className="input"
                            type="email"
                            value={form.adminNotificationEmail}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    adminNotificationEmail: e.target.value,
                                }))
                            }
                            autoComplete="email"
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                            Form submissions and system alerts will be sent here.
                        </p>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Bell className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">Lead Notifications</h2>
                </div>

                <div className="space-y-4">
                    {(
                        [
                            {
                                key: "notifyEmailLeads" as const,
                                label: "Email notifications for new leads",
                            },
                            {
                                key: "notifySmsLeads" as const,
                                label: "SMS notifications for urgent leads",
                            },
                            {
                                key: "nurtureAuto" as const,
                                label: "Auto-enroll leads in email nurture sequence",
                            },
                        ] as const
                    ).map((option) => (
                        <div
                            key={option.key}
                            className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-0"
                        >
                            <span className="text-sm">{option.label}</span>
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[var(--color-accent)]"
                                checked={form[option.key]}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        [option.key]: e.target.checked,
                                    }))
                                }
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-subtle)] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <h2 className="text-xl font-bold">Security & Auth</h2>
                </div>

                <div className="space-y-4 text-sm">
                    <p className="body-sm">
                        Current Auth Providers:{" "}
                        <span className="text-[var(--color-accent)]">
                            Resend (Magic Link), Google OAuth
                        </span>
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Saving these settings requires the{" "}
                        <strong>owner</strong> role. Managers and editors can view
                        but not update.
                    </p>
                    <button
                        type="button"
                        className="btn btn-secondary text-xs py-2 px-3"
                        disabled
                    >
                        Manage API Keys
                    </button>
                </div>
            </section>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    className="btn btn-secondary px-8"
                    onClick={handleDiscard}
                    disabled={saving}
                >
                    Discard
                </button>
                <button
                    type="button"
                    className="btn btn-primary px-12 inline-flex items-center gap-2"
                    data-testid="admin-settings-save"
                    onClick={() => void handleSave()}
                    disabled={saving}
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving…" : "Save All Settings"}
                </button>
            </div>
        </div>
    );
}
