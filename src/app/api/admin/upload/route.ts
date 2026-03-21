import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { validateImageMagicBytes } from "@/lib/image-magic";
import { logAdminFailure } from "@/lib/observability";
import { processProductImage } from "@/lib/media/process-product-image";
import { rateLimitAdminUpload } from "@/lib/admin-rate-limit";

const MAX_BYTES = 6 * 1024 * 1024;

const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "",
]);

export async function POST(request: Request) {
    const limited = rateLimitAdminUpload(request);
    if (limited) return limited;

    const { response } = await requireAdmin();
    if (response) return response;

    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
        return NextResponse.json(
            {
                error:
                    "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob).",
            },
            { status: 503 },
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file field" }, { status: 400 });
        }

        const buf = Buffer.from(await file.arrayBuffer());
        if (buf.length === 0) {
            return NextResponse.json({ error: "Empty file" }, { status: 400 });
        }
        if (buf.length > MAX_BYTES) {
            return NextResponse.json(
                { error: "File too large (max 6 MB)" },
                { status: 400 },
            );
        }

        const lowerName = file.name.toLowerCase();
        const mime = file.type || "";
        let payload: Buffer = buf;
        let treatAsMime: "image/jpeg" | "image/png" = "image/jpeg";

        const isHeic =
            mime === "image/heic" ||
            mime === "image/heif" ||
            lowerName.endsWith(".heic") ||
            lowerName.endsWith(".heif");

        if (isHeic) {
            try {
                const convert = (await import("heic-convert")).default;
                const jpegBuffer = await convert({
                    buffer: buf,
                    format: "JPEG",
                    quality: 0.92,
                });
                payload =
                    jpegBuffer instanceof ArrayBuffer
                        ? Buffer.from(new Uint8Array(jpegBuffer))
                        : Buffer.from(jpegBuffer);
                treatAsMime = "image/jpeg";
            } catch (e) {
                logAdminFailure("upload_heic_convert", e);
                return NextResponse.json(
                    { error: "Could not convert HEIC image. Try JPG or PNG." },
                    { status: 400 },
                );
            }
        } else {
            if (mime && !ALLOWED_MIME.has(mime)) {
                return NextResponse.json(
                    { error: "Only JPEG, PNG, or HEIC are allowed" },
                    { status: 400 },
                );
            }
            if (!mime) {
                if (lowerName.endsWith(".png")) treatAsMime = "image/png";
                else if (
                    lowerName.endsWith(".jpg") ||
                    lowerName.endsWith(".jpeg")
                ) {
                    treatAsMime = "image/jpeg";
                } else {
                    return NextResponse.json(
                        { error: "Unrecognized image type" },
                        { status: 400 },
                    );
                }
            } else if (mime === "image/png") {
                treatAsMime = "image/png";
            } else {
                treatAsMime = "image/jpeg";
            }
        }

        if (!validateImageMagicBytes(payload, treatAsMime)) {
            return NextResponse.json(
                { error: "File content does not match an allowed image type" },
                { status: 400 },
            );
        }

        let processed;
        try {
            processed = await processProductImage(payload);
        } catch (e) {
            logAdminFailure("upload_sharp_decode", e);
            return NextResponse.json(
                { error: "Could not read this image. Try another photo." },
                { status: 400 },
            );
        }

        const id = randomBytes(8).toString("hex");
        const prefix = `products/${Date.now()}-${id}`;
        const mainPath = `${prefix}-main.jpg`;
        const thumbPath = `${prefix}-thumb.jpg`;

        const [mainBlob, thumbBlob] = await Promise.all([
            put(mainPath, processed.mainJpeg, {
                access: "public",
                token: process.env.BLOB_READ_WRITE_TOKEN,
                contentType: "image/jpeg",
            }),
            put(thumbPath, processed.thumbJpeg, {
                access: "public",
                token: process.env.BLOB_READ_WRITE_TOKEN,
                contentType: "image/jpeg",
            }),
        ]);

        return NextResponse.json({
            url: mainBlob.url,
            thumbnailUrl: thumbBlob.url,
            maxBytes: MAX_BYTES,
        });
    } catch (e) {
        logAdminFailure("upload_unhandled", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
