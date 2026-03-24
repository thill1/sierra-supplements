import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminAppSettings, products } from "@/db/schema";
import { shouldNotifyLowStockEdge } from "@/lib/inventory/low-stock-edge";
import { logServerError } from "@/lib/observability";
import { escapeHtml } from "@/lib/escape-html";
import { siteConfig } from "@/lib/site-config";

export const ADMIN_APP_SETTINGS_ID = 1;

const RESEND_FROM = "Sierra Strength <noreply@sierrastrengthsupplements.com>";

export type AdminAppSettingsRow = typeof adminAppSettings.$inferSelect;

export async function getAdminAppSettings(): Promise<AdminAppSettingsRow | null> {
    try {
        const [row] = await db
            .select()
            .from(adminAppSettings)
            .where(eq(adminAppSettings.id, ADMIN_APP_SETTINGS_ID))
            .limit(1);
        return row ?? null;
    } catch (e) {
        logServerError("admin_app_settings_load", e);
        return null;
    }
}

export function resolveAdminNotificationEmail(
    settings: Pick<AdminAppSettingsRow, "adminNotificationEmail"> | null | undefined,
): string {
    const fromDb = settings?.adminNotificationEmail?.trim();
    if (fromDb) return fromDb;
    const env = process.env.ADMIN_EMAIL?.trim();
    if (env) return env;
    return siteConfig.adminEmail;
}

/**
 * Sends a transactional email to the configured admin inbox. Does not throw;
 * logs failures. No-op without RESEND_API_KEY.
 */
export async function sendAdminNotificationEmail(params: {
    subject: string;
    html: string;
    /** When set, skips DB load for recipient */
    to?: string;
}): Promise<void> {
    if (!process.env.RESEND_API_KEY) return;
    const to =
        params.to?.trim() ||
        resolveAdminNotificationEmail(await getAdminAppSettings());
    try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: RESEND_FROM,
            to,
            subject: params.subject,
            html: params.html,
        });
    } catch (e) {
        logServerError("admin_notification_email", e);
    }
}

export type LowStockNotifyContext = {
    previousQty: number;
    newQty: number;
    lowStockThreshold: number;
    productId: number;
    variantId: number;
    variantLabel: string;
};

export async function notifyLowStockIfNeeded(
    ctx: LowStockNotifyContext,
): Promise<void> {
    if (!shouldNotifyLowStockEdge(ctx)) return;

    const settings = await getAdminAppSettings();
    if (settings?.notifyEmailLowStock === false) return;

    const [product] = await db
        .select({ name: products.name })
        .from(products)
        .where(eq(products.id, ctx.productId))
        .limit(1);

    const productName = product?.name ?? `Product #${ctx.productId}`;
    const adminProductUrl = `${siteConfig.url}/admin/products/${ctx.productId}`;

    await sendAdminNotificationEmail({
        to: resolveAdminNotificationEmail(settings),
        subject: `Low stock: ${productName} (${ctx.variantLabel})`,
        html: `
<h2>Low stock alert</h2>
<p>A variant dropped to at or below its low-stock threshold.</p>
<p><strong>Product:</strong> ${escapeHtml(productName)} — <a href="${adminProductUrl}">Edit in admin</a></p>
<p><strong>Variant:</strong> ${escapeHtml(ctx.variantLabel)}</p>
<p><strong>Remaining quantity:</strong> ${ctx.newQty}</p>
<p><strong>Threshold:</strong> ${ctx.lowStockThreshold}</p>
`,
    });
}
