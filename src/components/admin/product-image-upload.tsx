"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

type Props = {
    value: string;
    onChange: (url: string) => void;
};

export function ProductImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setError(null);
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: fd,
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }
            if (!data.url) {
                throw new Error("No URL returned");
            }
            onChange(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium">Product image</label>
            {value ? (
                <div className="rounded-lg border border-[var(--color-border-subtle)] overflow-hidden bg-[var(--color-bg-muted)] max-w-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Product preview" className="w-full h-40 object-contain" />
                </div>
            ) : (
                <p className="text-sm text-[var(--color-text-muted)]">No image yet</p>
            )}
            <input
                type="text"
                className="input w-full"
                placeholder="Image URL (or upload below)"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
                <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                        disabled={uploading}
                        onChange={handleFile}
                    />
                </label>
                <span className="text-xs text-[var(--color-text-muted)]">
                    JPEG, PNG, or HEIC (max 6 MB). Stored on Vercel Blob; optimized on
                    upload.
                </span>
            </div>
            {error && (
                <p className="text-sm text-[var(--color-error)]" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
