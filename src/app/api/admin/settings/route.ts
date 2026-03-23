import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/db";
import { adminAppSettings } from "@/db/schema";
import { rateLimitAdminWrite } from "@/lib/admin-rate-limit";
import { requireMinRole } from "@/lib/admin-auth";
import { logAdminFailure } from "@/lib/observability";
import { requireAdmin } from "@/lib/require-admin";
import { siteConfig } from "@/lib/site-config";

const SETTINGS_ID = 1;

const updateSchema = z.object({
    siteName: z.string().min(1).max(200),
    baseUrl: z.string().min(1).max(500).url(),
    adminNotificationEmail: z.string().min(1).max(320).email(),
    notifyEmailLeads: z.boolean(),
    notifySmsLeads: z.boolean(),
    nurtureAuto: z.boolean(),
});

function defaultSettings() {
    return {
        id: SETTINGS_ID,
        siteName: siteConfig.name,
        baseUrl: siteConfig.url,
        adminNotificationEmail: siteConfig.adminEmail,
        notifyEmailLeads: true,
        notifySmsLeads: false,
        nurtureAuto: true,
        updatedAt: null as Date | null,
    };
}

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const [row] = await db
            .select()
            .from(adminAppSettings)
            .where(eq(adminAppSettings.id, SETTINGS_ID))
            .limit(1);

        if (!row) {
            return NextResponse.json(defaultSettings());
        }

        return NextResponse.json(row);
    } catch (error) {
        logAdminFailure("admin_settings_get", error);
        return NextResponse.json(
            { error: "Failed to load settings" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request) {
    const limited = rateLimitAdminWrite(request);
    if (limited) return limited;

    const { response, admin } = await requireAdmin();
    if (response || !admin) return response!;

    const forbidden = requireMinRole(admin, "owner");
    if (forbidden) return forbidden;

    try {
        const body = await request.json();
        const data = updateSchema.parse(body);
        const now = new Date();

        await db
            .insert(adminAppSettings)
            .values({
                id: SETTINGS_ID,
                siteName: data.siteName,
                baseUrl: data.baseUrl,
                adminNotificationEmail: data.adminNotificationEmail,
                notifyEmailLeads: data.notifyEmailLeads,
                notifySmsLeads: data.notifySmsLeads,
                nurtureAuto: data.nurtureAuto,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: adminAppSettings.id,
                set: {
                    siteName: data.siteName,
                    baseUrl: data.baseUrl,
                    adminNotificationEmail: data.adminNotificationEmail,
                    notifyEmailLeads: data.notifyEmailLeads,
                    notifySmsLeads: data.notifySmsLeads,
                    nurtureAuto: data.nurtureAuto,
                    updatedAt: now,
                },
            });

        const [row] = await db
            .select()
            .from(adminAppSettings)
            .where(eq(adminAppSettings.id, SETTINGS_ID))
            .limit(1);

        return NextResponse.json(row ?? defaultSettings());
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid body", details: error.flatten() },
                { status: 400 },
            );
        }
        logAdminFailure("admin_settings_put", error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 },
        );
    }
}
