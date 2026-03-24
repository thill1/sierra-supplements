"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { HomepageContentStored } from "@/lib/homepage-defaults";

function emptyContent(): HomepageContentStored {
    return {
        leadMagnet: { title: "", subtitle: "", cta: "" },
        hero: {
            footerTagline: "",
            primaryCtaLabel: "",
            secondaryCtaLabel: "",
            servicesLinkLabel: "",
            stats: [{ value: "", label: "" }],
        },
    };
}

export default function AdminContentPage() {
    const [data, setData] = useState<HomepageContentStored>(emptyContent);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/homepage-content");
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error("Manager access required.");
                }
                throw new Error("Failed to load");
            }
            const json = (await res.json()) as HomepageContentStored;
            setData(json);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Load failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function save() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/homepage-content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                throw new Error(err.error || "Save failed");
            }
            const json = (await res.json()) as HomepageContentStored;
            setData(json);
            toast.success("Homepage content saved. Public site updates within ~1 minute.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    function updateStat(
        index: number,
        field: "value" | "label",
        value: string,
    ) {
        setData((d) => {
            const stats = [...d.hero.stats];
            const row = { ...stats[index], [field]: value };
            stats[index] = row;
            return { ...d, hero: { ...d.hero, stats } };
        });
    }

    function addStat() {
        setData((d) => {
            if (d.hero.stats.length >= 12) return d;
            return {
                ...d,
                hero: {
                    ...d.hero,
                    stats: [...d.hero.stats, { value: "", label: "" }],
                },
            };
        });
    }

    function removeStat(index: number) {
        setData((d) => {
            if (d.hero.stats.length <= 1) return d;
            const stats = d.hero.stats.filter((_, i) => i !== index);
            return { ...d, hero: { ...d.hero, stats } };
        });
    }

    if (loading) {
        return (
            <p className="text-[var(--color-text-muted)] py-12">
                Loading homepage content…
            </p>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold">Homepage content</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Hero CTAs, stats bar, and lead magnet (cached ~60s on
                        the public site).
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary text-sm inline-flex items-center gap-2"
                        onClick={() => void load()}
                    >
                        <RotateCcw className="w-4 h-4" /> Reload
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary text-sm px-6 inline-flex items-center gap-2"
                        disabled={saving}
                        onClick={() => void save()}
                    >
                        <Save className="w-4 h-4" />{" "}
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>

            <div className="card p-6 space-y-6">
                <h3 className="font-semibold">Lead magnet</h3>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Title
                    </label>
                    <input
                        className="input"
                        value={data.leadMagnet.title}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                leadMagnet: {
                                    ...d.leadMagnet,
                                    title: e.target.value,
                                },
                            }))
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Subtitle
                    </label>
                    <textarea
                        className="input min-h-[80px]"
                        value={data.leadMagnet.subtitle}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                leadMagnet: {
                                    ...d.leadMagnet,
                                    subtitle: e.target.value,
                                },
                            }))
                        }
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Button label
                    </label>
                    <input
                        className="input"
                        value={data.leadMagnet.cta}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                leadMagnet: {
                                    ...d.leadMagnet,
                                    cta: e.target.value,
                                },
                            }))
                        }
                    />
                </div>
            </div>

            <div className="card p-6 space-y-6">
                <h3 className="font-semibold">Hero</h3>
                <div>
                    <label className="block text-sm font-medium mb-1.5">
                        Footer tagline (under CTAs)
                    </label>
                    <input
                        className="input"
                        value={data.hero.footerTagline}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                hero: {
                                    ...d.hero,
                                    footerTagline: e.target.value,
                                },
                            }))
                        }
                    />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Primary CTA
                        </label>
                        <input
                            className="input"
                            value={data.hero.primaryCtaLabel}
                            onChange={(e) =>
                                setData((d) => ({
                                    ...d,
                                    hero: {
                                        ...d.hero,
                                        primaryCtaLabel: e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Secondary CTA
                        </label>
                        <input
                            className="input"
                            value={data.hero.secondaryCtaLabel}
                            onChange={(e) =>
                                setData((d) => ({
                                    ...d,
                                    hero: {
                                        ...d.hero,
                                        secondaryCtaLabel: e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">
                            Services link
                        </label>
                        <input
                            className="input"
                            value={data.hero.servicesLinkLabel}
                            onChange={(e) =>
                                setData((d) => ({
                                    ...d,
                                    hero: {
                                        ...d.hero,
                                        servicesLinkLabel: e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Stats bar</label>
                        <button
                            type="button"
                            className="text-sm text-[var(--color-accent)] hover:underline"
                            onClick={addStat}
                        >
                            + Add stat
                        </button>
                    </div>
                    <div className="space-y-2">
                        {data.hero.stats.map((stat, i) => (
                            <div
                                key={i}
                                className="flex gap-2 items-center flex-wrap"
                            >
                                <input
                                    className="input flex-1 min-w-[100px]"
                                    placeholder="Value"
                                    value={stat.value}
                                    onChange={(e) =>
                                        updateStat(i, "value", e.target.value)
                                    }
                                />
                                <input
                                    className="input flex-[2] min-w-[140px]"
                                    placeholder="Label"
                                    value={stat.label}
                                    onChange={(e) =>
                                        updateStat(i, "label", e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost text-sm text-[var(--color-error)]"
                                    onClick={() => removeStat(i)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
