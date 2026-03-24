"use client";

import { useCallback, useEffect, useState } from "react";
import { GripVertical, Loader2, Star, Upload } from "lucide-react";
import { toast } from "sonner";
import {
    adminFetchInit,
    getAdminApiErrorMessage,
} from "@/lib/admin-api-client";

type ProductImageKind = "hero" | "facts" | "label" | "gallery";

const KIND_LABELS: Record<ProductImageKind, string> = {
    hero: "Front of product",
    facts: "Supplement facts",
    label: "Ingredients / label",
    gallery: "Gallery",
};

const MAX_BYTES_LABEL = "6 MB";

type Row = {
    id: number;
    url: string;
    kind: ProductImageKind;
    sortOrder: number;
    altText: string | null;
};

type Props = {
    productId: number;
    primaryImageUrl: string | null;
    onPrimaryChange: (url: string | null) => void;
};

export function ProductImagesEditor({
    productId,
    primaryImageUrl,
    onPrimaryChange,
}: Props) {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<ProductImageKind | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/products/${productId}/images`,
                adminFetchInit,
            );
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            const data = (await res.json()) as Row[];
            setRows(data.sort((a, b) => a.sortOrder - b.sortOrder));
        } catch {
            toast.error("Could not load product images.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        load();
    }, [load]);

    async function uploadForKind(kind: ProductImageKind, file: File) {
        setUploading(kind);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const up = await fetch("/api/admin/upload", {
                ...adminFetchInit,
                method: "POST",
                body: fd,
            });
            if (!up.ok) {
                throw new Error(await getAdminApiErrorMessage(up));
            }
            const data = (await up.json()) as { error?: string; url?: string };
            if (!data.url) throw new Error("No URL");

            const cr = await fetch(`/api/admin/products/${productId}/images`, {
                ...adminFetchInit,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: data.url,
                    kind,
                    sortOrder: rows.filter((r) => r.kind === kind).length,
                }),
            });
            if (!cr.ok) {
                throw new Error(await getAdminApiErrorMessage(cr));
            }
            toast.success("Photo uploaded.");
            await load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(null);
        }
    }

    async function setPrimary(url: string) {
        try {
            const res = await fetch(`/api/admin/products/${productId}/images`, {
                ...adminFetchInit,
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ primaryImageUrl: url }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            onPrimaryChange(url);
            toast.success("Primary image updated.");
        } catch {
            toast.error("Could not set primary image.");
        }
    }

    async function saveOrder(next: Row[]) {
        setRows(next);
        try {
            const res = await fetch(`/api/admin/products/${productId}/images`, {
                ...adminFetchInit,
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order: next.map((r, i) => ({
                        id: r.id,
                        sortOrder: i,
                        kind: r.kind,
                    })),
                }),
            });
            if (!res.ok) {
                throw new Error(await getAdminApiErrorMessage(res));
            }
            toast.success("Order saved.");
        } catch {
            toast.error("Could not save order.");
            load();
        }
    }

    function moveGallery(localIdx: number, dir: -1 | 1) {
        const g = rows.filter((r) => r.kind === "gallery");
        const a = g[localIdx];
        const b = g[localIdx + dir];
        if (!a || !b) return;
        const iFull = rows.indexOf(a);
        const jFull = rows.indexOf(b);
        const next = [...rows];
        [next[iFull], next[jFull]] = [next[jFull], next[iFull]];
        void saveOrder(next);
    }

    const slots: ProductImageKind[] = ["hero", "facts", "label"];

    if (loading) {
        return (
            <p className="text-sm text-[var(--color-text-muted)]">Loading photos…</p>
        );
    }

    return (
        <div className="space-y-8">
            <p className="text-xs text-[var(--color-text-muted)]">
                JPEG, PNG, or iPhone HEIC — max {MAX_BYTES_LABEL} per file. Photos are
                optimized on the server.
            </p>

            {slots.map((kind) => (
                <div key={kind} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium">{KIND_LABELS[kind]}</label>
                        <label className="btn btn-secondary text-xs cursor-pointer inline-flex items-center gap-1">
                            {uploading === kind ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Upload className="w-3 h-3" />
                            )}
                            Upload
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                                disabled={uploading !== null}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    e.target.value = "";
                                    if (f) void uploadForKind(kind, f);
                                }}
                            />
                        </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {rows
                            .filter((r) => r.kind === kind)
                            .map((r) => (
                                <div
                                    key={r.id}
                                    className="relative rounded-lg border border-[var(--color-border-subtle)] overflow-hidden w-28 h-28 bg-[var(--color-bg-muted)]"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={r.url}
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 flex justify-center gap-0.5 p-1 bg-black/50">
                                        <button
                                            type="button"
                                            className="p-1 text-white"
                                            title="Primary"
                                            onClick={() => setPrimary(r.url)}
                                        >
                                            <Star
                                                className={`w-3.5 h-3.5 ${primaryImageUrl === r.url ? "fill-amber-400 text-amber-400" : ""}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{KIND_LABELS.gallery}</label>
                    <label className="btn btn-secondary text-xs cursor-pointer inline-flex items-center gap-1">
                        {uploading === "gallery" ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Upload className="w-3 h-3" />
                        )}
                        Add to gallery
                        <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                            disabled={uploading !== null}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                e.target.value = "";
                                if (f) void uploadForKind("gallery", f);
                            }}
                        />
                    </label>
                </div>
                <ul className="space-y-2">
                    {rows
                        .filter((r) => r.kind === "gallery")
                        .map((r, gIdx, arr) => (
                                <li
                                    key={r.id}
                                    className="flex items-center gap-2 p-2 rounded-lg border border-[var(--color-border-subtle)]"
                                >
                                    <GripVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={r.url}
                                        alt=""
                                        className="w-12 h-12 object-contain rounded"
                                    />
                                    <div className="flex-1 min-w-0 text-xs truncate">
                                        {r.url}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-ghost p-1"
                                        onClick={() => moveGallery(gIdx, -1)}
                                        disabled={gIdx <= 0}
                                    >
                                        Up
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-ghost p-1"
                                        onClick={() => moveGallery(gIdx, 1)}
                                        disabled={gIdx >= arr.length - 1}
                                    >
                                        Down
                                    </button>
                                    <button
                                        type="button"
                                        className="p-1 text-[var(--color-accent)]"
                                        title="Set as primary"
                                        onClick={() => setPrimary(r.url)}
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                </ul>
            </div>
        </div>
    );
}
