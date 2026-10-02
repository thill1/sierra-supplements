import { escapeHtml } from "@/lib/escape-html";
import { logServerError } from "@/lib/observability";
import { siteConfig } from "@/lib/site-config";
import {
    getAdminAppSettings,
    resolveAdminNotificationEmail,
    type AdminAppSettingsRow,
} from "@/lib/email/admin-notifications";

const FROM = "Sierra Strength Supplements <noreply@lordsgymoutreach.com>";

export type EmailOrderLine = {
    name: string;
    price: number;
    quantity: number;
};

export type EmailOrderCustomer = {
    email: string;
    name?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
};

export type EmailOrder = EmailOrderCustomer & {
    id?: number | null;
    subtotal: number;
    status?: string | null;
    paymentProvider?: string | null;
    paymentSessionId?: string | null;
    notes?: string | null;
    autoPay?: boolean | null;
    lines: EmailOrderLine[];
};

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
};

function money(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function customerName(order: Pick<EmailOrder, "name">): string {
    return order.name?.trim() || "there";
}

function orderLabel(order: Pick<EmailOrder, "id">): string {
    return order.id ? `#${order.id}` : "";
}

function renderLines(lines: EmailOrderLine[]): string {
    return lines
        .map(
            (line) => `
                <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">${escapeHtml(line.name)}</td>
                    <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${line.quantity}</td>
                    <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${money(line.price * line.quantity)}</td>
                </tr>`,
        )
        .join("");
}

function shell(params: {
    preview: string;
    heading: string;
    body: string;
    cta?: { href: string; label: string };
}): string {
    const cta = params.cta
        ? `<p style="margin:28px 0;"><a href="${params.cta.href}" style="background:#d97706;color:#111827;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;display:inline-block;">${escapeHtml(params.cta.label)}</a></p>`
        : "";

    return `<!doctype html>
<html>
<body style="margin:0;background:#f8fafc;color:#111827;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preview)}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:24px 0;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
<tr><td style="background:#111827;color:#ffffff;padding:24px 28px;">
<div style="font-size:20px;font-weight:800;letter-spacing:.02em;">Sierra Strength Supplements</div>
<div style="color:#f59e0b;font-size:13px;margin-top:4px;">${escapeHtml(siteConfig.tagline)}</div>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;">${escapeHtml(params.heading)}</h1>
${params.body}
${cta}
<p style="margin:28px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
Questions? Reply to this email or call <a href="tel:${siteConfig.smsNumber}" style="color:#d97706;">${escapeHtml(siteConfig.phone)}</a>.
</p>
</td></tr>
<tr><td style="padding:18px 28px;background:#f3f4f6;color:#64748b;font-size:12px;">
${escapeHtml(siteConfig.address.full)}<br />
You are receiving this because you placed an order or requested updates from Sierra Strength Supplements.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function orderTable(order: EmailOrder): string {
    return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0;border-collapse:collapse;">
<thead>
<tr>
<th align="left" style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Item</th>
<th style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Qty</th>
<th align="right" style="padding-bottom:8px;color:#64748b;font-size:12px;text-transform:uppercase;">Total</th>
</tr>
</thead>
<tbody>${renderLines(order.lines)}</tbody>
<tfoot><tr><td colspan="2" style="padding-top:14px;font-weight:700;">Order total</td><td align="right" style="padding-top:14px;font-weight:700;">${money(order.subtotal)}</td></tr></tfoot>
</table>`;
}

function adminOrderUrl(order: EmailOrder): string {
    return order.id ? `${siteConfig.url}/admin/orders/${order.id}` : `${siteConfig.url}/admin/orders`;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
    if (!process.env.RESEND_API_KEY) return;
    try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: FROM,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });
    } catch (error) {
        logServerError("order_email", error);
    }
}

async function adminRecipient(): Promise<string> {
    return resolveAdminNotificationEmail(await getAdminAppSettings());
}

function shouldSendCustomerOrderEmail(
    settings: AdminAppSettingsRow | null,
    kind:
        | "received"
        | "paid"
        | "packed"
        | "fulfilled"
        | "cancelled"
        | "refunded",
): boolean {
    switch (kind) {
        case "received":
            return settings?.customerOrderReceivedEmail ?? true;
        case "paid":
            return settings?.customerOrderPaidEmail ?? false;
        case "packed":
            return settings?.customerOrderPackedEmail ?? false;
        case "fulfilled":
            return settings?.customerOrderFulfilledEmail ?? true;
        case "cancelled":
            return settings?.customerOrderCancelledEmail ?? false;
        case "refunded":
            return settings?.customerOrderRefundedEmail ?? false;
    }
}

export async function sendOfflineOrderEmails(order: EmailOrder): Promise<void> {
    const settings = await getAdminAppSettings();
    const jobs: Promise<void>[] = [
        sendEmail({
            to: await adminRecipient(),
            subject: `New offline order ${orderLabel(order)} - ${money(order.subtotal)}`,
            html: shell({
                preview: "A new offline order needs review.",
                heading: "New order received",
                body: `
<p style="line-height:1.6;">${escapeHtml(order.name ?? "A customer")} placed an offline order.</p>
${orderTable(order)}
<p><strong>Email:</strong> ${escapeHtml(order.email)}<br />
<strong>Phone:</strong> ${order.phone ? escapeHtml(order.phone) : "N/A"}</p>
<p><strong>Ship to:</strong><br />${escapeHtml(order.addressLine1 ?? "")}<br />${order.addressLine2 ? `${escapeHtml(order.addressLine2)}<br />` : ""}${escapeHtml(order.city ?? "")}, ${escapeHtml(order.state ?? "")} ${escapeHtml(order.zip ?? "")}</p>
${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}`,
                cta: { href: adminOrderUrl(order), label: "Review order" },
            }),
        }),
    ];

    if (shouldSendCustomerOrderEmail(settings, "received")) {
        jobs.push(
            sendEmail({
                to: order.email,
                subject: "We received your Sierra Strength order",
                html: shell({
                    preview:
                        "Your order is in and our team will follow up with the next step soon.",
                    heading: `Thanks, ${customerName(order)}. Your order is in.`,
                    body: `
<p style="line-height:1.6;">We received your order and a member of our team will review it shortly.</p>
${orderTable(order)}
<p style="line-height:1.6;"><strong>What happens next:</strong> we will confirm payment, review any pickup or shipping details, and send your next update as soon as everything is ready.</p>
<p style="line-height:1.6;">Our goal is to keep this personal and helpful, not generic. If you have a question about your order or want product guidance, just reply to this email.</p>`,
                    cta: {
                        href: `${siteConfig.url}/store`,
                        label: "Visit the store",
                    },
                }),
            }),
        );
    }

    await Promise.all(jobs);
}

export async function sendValorPendingPaymentEmails(order: EmailOrder): Promise<void> {
    const settings = await getAdminAppSettings();
    const jobs: Promise<void>[] = [
        sendEmail({
            to: await adminRecipient(),
            subject: `Valor checkout started ${orderLabel(order)} - ${money(order.subtotal)}`,
            html: shell({
                preview: "A customer started a Valor checkout.",
                heading: "Valor checkout started",
                body: `
<p style="line-height:1.6;">${escapeHtml(order.name ?? "A customer")} started a Valor hosted checkout. Reconcile this order against Valor before marking it paid or adjusting inventory.</p>
${orderTable(order)}
<p><strong>Valor session:</strong> ${escapeHtml(order.paymentSessionId ?? "N/A")}</p>`,
                cta: { href: adminOrderUrl(order), label: "Open pending order" },
            }),
        }),
    ];

    if (shouldSendCustomerOrderEmail(settings, "received")) {
        jobs.push(
            sendEmail({
                to: order.email,
                subject: "Your Sierra Strength order is pending payment",
                html: shell({
                    preview:
                        "Your order is waiting for payment confirmation and our team will follow up after review.",
                    heading: "Your order is waiting for payment confirmation",
                    body: `
<p style="line-height:1.6;">Thanks, ${escapeHtml(customerName(order))}. Your order has been started and is currently waiting for payment confirmation through Valor.</p>
${orderTable(order)}
<p style="line-height:1.6;"><strong>What happens next:</strong> once payment is confirmed, our team will review the order, make sure everything looks right, and send your next update.</p>
<p style="line-height:1.6;">If you completed payment and want us to double-check anything, reply to this email and we will help.</p>`,
                }),
            }),
        );
    }

    await Promise.all(jobs);
}

export async function sendOrderStatusEmail(order: EmailOrder): Promise<void> {
    const status = order.status ?? "";
    const settings = await getAdminAppSettings();
    const enabled = {
        paid: shouldSendCustomerOrderEmail(settings, "paid"),
        packed: shouldSendCustomerOrderEmail(settings, "packed"),
        fulfilled: shouldSendCustomerOrderEmail(settings, "fulfilled"),
        cancelled: shouldSendCustomerOrderEmail(settings, "cancelled"),
        refunded: shouldSendCustomerOrderEmail(settings, "refunded"),
    } as const;
    const templates: Record<string, { subject: string; heading: string; body: string }> = {
        paid: {
            subject: "Payment confirmed - Sierra Strength Supplements",
            heading: "Payment confirmed",
            body: `<p style="line-height:1.6;">We confirmed your payment and accepted your order. Our team will prepare it next.</p>${orderTable(order)}`,
        },
        packed: {
            subject: "Your Sierra Strength order is being prepared",
            heading: "Your order is being prepared",
            body: `<p style="line-height:1.6;">Your order is packed or nearly ready. We will follow up with pickup or delivery details.</p>${orderTable(order)}`,
        },
        fulfilled: {
            subject: "Your Sierra Strength order is complete",
            heading: "Your order is complete",
            body: `<p style="line-height:1.6;">Your Sierra Strength order has been completed and we hope everything landed exactly the way it should.</p>
<p style="line-height:1.6;">After you have had a chance to use your products, feel free to reply with feedback, questions, or what you are working toward next. We use that to make better recommendations for you.</p>
<p style="line-height:1.6;">If anything about the order needs attention, reply directly and we will make it right.</p>${orderTable(order)}`,
        },
        cancelled: {
            subject: "Your Sierra Strength order was cancelled",
            heading: "Order cancelled",
            body: `<p style="line-height:1.6;">This order has been cancelled. If that does not look right, reply and we will help.</p>${orderTable(order)}`,
        },
        refunded: {
            subject: "Refund update from Sierra Strength Supplements",
            heading: "Refund update",
            body: `<p style="line-height:1.6;">We updated your order as refunded. Depending on the payment method, funds may take a little time to appear.</p>${orderTable(order)}`,
        },
    };

    const template = templates[status];
    if (!template) return;
    if (
        (status === "paid" && !enabled.paid) ||
        (status === "packed" && !enabled.packed) ||
        (status === "fulfilled" && !enabled.fulfilled) ||
        (status === "cancelled" && !enabled.cancelled) ||
        (status === "refunded" && !enabled.refunded)
    ) {
        return;
    }

    await Promise.all([
        sendEmail({
            to: order.email,
            subject: template.subject,
            html: shell({
                preview: template.subject,
                heading: template.heading,
                body: template.body,
                cta:
                    status === "fulfilled"
                        ? { href: `${siteConfig.url}/store`, label: "Shop again" }
                        : undefined,
            }),
        }),
        sendEmail({
            to: await adminRecipient(),
            subject: `Order ${orderLabel(order)} status changed to ${status}`,
            html: shell({
                preview: "An order status changed.",
                heading: `Order status: ${status}`,
                body: `
<p style="line-height:1.6;">Customer notification sent for order ${escapeHtml(orderLabel(order))}.</p>
${orderTable(order)}`,
                cta: { href: adminOrderUrl(order), label: "Open order" },
            }),
        }),
    ]);
}

export function parseOrderLines(raw: string | null | undefined): EmailOrderLine[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const row = item as Record<string, unknown>;
            const name = typeof row.name === "string" ? row.name : "Product";
            const price = Number(row.price);
            const quantity = Number(row.quantity);
            if (!Number.isFinite(price) || !Number.isFinite(quantity)) return [];
            return [{ name, price, quantity }];
        });
    } catch {
        return [];
    }
}
