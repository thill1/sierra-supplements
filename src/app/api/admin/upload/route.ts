import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { createSupabaseAdmin, getSupabaseStorageBucket } from "@/lib/supabase-admin";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB (Supabase standard upload guidance)

const ALLOWED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "",
]);

function extensionForMime(mime: string): string {
    if (mime === "image/png") return "png";
    if (mime === "image/webp") return "webp";
    return "jpg";
}

export async function POST(request: Request) {
    const { response } = await requireAuth();
    if (response) return response;

    const supabase = createSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json(
            {
                error:
                    "Image storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
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
        let mime = file.type || "";
        let payload: Buffer = buf;
        let outMime = mime;

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
                outMime = "image/jpeg";
            } catch (e) {
                console.warn("HEIC conversion failed:", e);
                return NextResponse.json(
                    { error: "Could not convert HEIC image. Try JPG or PNG." },
                    { status: 400 },
                );
            }
        } else {
            if (mime && !ALLOWED_MIME.has(mime)) {
                return NextResponse.json(
                    { error: "Only JPEG, PNG, WebP, or HEIC are allowed" },
                    { status: 400 },
                );
            }
            if (!mime) {
                if (lowerName.endsWith(".png")) outMime = "image/png";
                else if (lowerName.endsWith(".webp")) outMime = "image/webp";
                else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
                    outMime = "image/jpeg";
                } else {
                    return NextResponse.json(
                        { error: "Unrecognized image type" },
                        { status: 400 },
                    );
                }
            }
        }

        const ext = extensionForMime(outMime);
        const objectPath = `products/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
        const bucket = getSupabaseStorageBucket();

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(objectPath, payload, {
                contentType: outMime,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json(
                {
                    error:
                        uploadError.message ||
                        "Upload failed. Ensure the Storage bucket exists and is public.",
                },
                { status: 502 },
            );
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);

        return NextResponse.json({ url: urlData.publicUrl });
    } catch (e) {
        console.error("Admin upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
