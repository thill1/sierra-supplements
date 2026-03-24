import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod/v4";
import { db } from "@/db";
import { homepageContent } from "@/db/schema";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { requireAdmin } from "@/lib/require-admin";
import { mergeHomepageContent } from "@/lib/homepage-defaults";

const HOMEPAGE_ID = 1;

const updateSchema = z.object({
    leadMagnet: z.object({
        title: z.string().min(1).max(300),
        subtitle: z.string().min(1).max(2000),
        cta: z.string().min(1).max(120),
    }),
    hero: z.object({
        footerTagline: z.string().min(1).max(300),
        primaryCtaLabel: z.string().min(1).max(120),
        secondaryCtaLabel: z.string().min(1).max(120),
        servicesLinkLabel: z.string().min(1).max(120),
        stats: z
            .array(
                z.object({
                    value: z.string().max(40),
                    label: z.string().max(120),
                }),
            )
            .min(1)
            .max(12),
    }),
});

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const [row] = await db
            .select()
            .from(homepageContent)
            .where(eq(homepageContent.id, HOMEPAGE_ID))
            .limit(1);
        const merged = mergeHomepageContent(row?.data ?? null);
        return NextResponse.json(merged);
    } catch (error) {
        logAdminFailure("homepage_content_get", error);
        return NextResponse.json(
            { error: "Failed to load homepage content" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "manager");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = updateSchema.parse(body);
        const now = new Date();

        await db
            .insert(homepageContent)
            .values({
                id: HOMEPAGE_ID,
                data,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: homepageContent.id,
                set: { data, updatedAt: now },
            });

        revalidateTag("homepage-content", "max");

        return NextResponse.json(mergeHomepageContent(data));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid body", details: error.issues },
                { status: 400 },
            );
        }
        logAdminFailure("homepage_content_put", error);
        return NextResponse.json(
            { error: "Failed to save homepage content" },
            { status: 500 },
        );
    }
}
