import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, productVariants } from "@/db/schema";
import { resolveLineToVariantIds } from "@/lib/checkout/resolve-line-variant";
import { sendValorPendingPaymentEmails } from "@/lib/email/order-emails";
import { logServerError } from "@/lib/observability";
import type {
    CreatePaymentSessionParams,
    PaymentSessionResult,
} from "@/lib/payments/types";

type ValorResponse = {
    uid?: string;
    url?: string;
    payment_url?: string;
    paymentUrl?: string;
    hosted_url?: string;
    hostedUrl?: string;
    redirect_url?: string;
    redirectUrl?: string;
    link?: string;
    data?: ValorResponse;
};

type ResolvedValorLine = {
    productId: number;
    variantId: number;
    slug: string;
    quantity: number;
    name: string;
    unitPrice: number;
};

const VALOR_HOSTED_PAGE_PATH = "?hostedpage";

export function isValorPaymentReady(): boolean {
    return Boolean(
        process.env.VALOR_APP_ID?.trim() &&
            process.env.VALOR_APP_KEY?.trim() &&
            process.env.VALOR_EPI?.trim() &&
            process.env.VALOR_HOSTED_PAGE_URL?.trim(),
    );
}

function centsToDollars(cents: number): string {
    return (cents / 100).toFixed(2);
}

function normalizePhone(phone: string | undefined): string | undefined {
    const digits = phone?.replace(/\D/g, "");
    return digits ? digits.slice(0, 10) : undefined;
}

function hostedPageBaseUrl(): string {
    const raw = process.env.VALOR_HOSTED_PAGE_URL?.trim();
    if (!raw) throw new Error("VALOR_HOSTED_PAGE_URL is not configured");
    try {
        const url = new URL(raw);
        return url.origin;
    } catch {
        return raw.replace(/\?hostedpage$/, "").replace(/\/$/, "");
    }
}

function hostedPageSaleUrl(): string {
    return `${hostedPageBaseUrl()}/${VALOR_HOSTED_PAGE_PATH}`;
}

function hostedPaymentUrlFromUid(uid: string): string {
    return `${hostedPageBaseUrl()}/?redirect=1&uid=${encodeURIComponent(uid)}`;
}

function extractValorSession(response: ValorResponse): {
    url: string | null;
    uid: string | null;
} {
    const nested = response.data ? extractValorSession(response.data) : null;
    const url =
        response.url ??
        response.payment_url ??
        response.paymentUrl ??
        response.hosted_url ??
        response.hostedUrl ??
        response.redirect_url ??
        response.redirectUrl ??
        response.link ??
        nested?.url ??
        null;
    const uid = response.uid ?? nested?.uid ?? null;

    return {
        url: url ?? (uid ? hostedPaymentUrlFromUid(uid) : null),
        uid,
    };
}

async function buildValorLines(
    params: CreatePaymentSessionParams,
): Promise<ResolvedValorLine[]> {
    const resolved = [];
    for (const line of params.items) {
        const { productId, variantId } = await resolveLineToVariantIds(line);
        resolved.push({ productId, variantId, quantity: line.quantity });
    }

    const variantIds = [
        ...new Set(resolved.map((line) => line.variantId).filter((id) => id > 0)),
    ];
    const variantRows =
        variantIds.length > 0
            ? await db
                  .select({
                      variant: productVariants,
                      product: products,
                  })
                  .from(productVariants)
                  .innerJoin(products, eq(productVariants.productId, products.id))
                  .where(inArray(productVariants.id, variantIds))
            : [];
    const byVariantId = new Map(variantRows.map((row) => [row.variant.id, row]));

    const lines: ResolvedValorLine[] = [];
    for (const line of resolved) {
        if (line.variantId > 0) {
            const row = byVariantId.get(line.variantId);
            if (!row) throw new Error(`Unknown variant id ${line.variantId}`);
            const { product, variant } = row;
            if (
                !product.published ||
                product.status !== "active" ||
                variant.stockQuantity < line.quantity
            ) {
                throw new Error(`Product unavailable: ${product.name} - ${variant.label}`);
            }
            lines.push({
                ...line,
                slug: product.slug,
                name: `${product.name} - ${variant.label}`,
                unitPrice: variant.price,
            });
            continue;
        }

        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, line.productId))
            .limit(1);
        if (!product) throw new Error(`Unknown product id ${line.productId}`);
        if (
            !product.published ||
            product.status !== "active" ||
            product.stockQuantity < line.quantity
        ) {
            throw new Error(`Product unavailable: ${product.name}`);
        }
        lines.push({
            ...line,
            slug: product.slug,
            name: product.name,
            unitPrice: product.price,
        });
    }

    return lines;
}

export async function createValorPaymentSession(
    params: CreatePaymentSessionParams,
): Promise<PaymentSessionResult> {
    if (!isValorPaymentReady()) {
        throw new Error("Valor payment gateway is not configured");
    }

    const lines = await buildValorLines(params);
    if (lines.length === 0) throw new Error("Cart is empty");

    const totalCents = lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
    );
    const invoiceNumber = `ss-${randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const successUrl = params.successUrl.replace(
        "{CHECKOUT_SESSION_ID}",
        invoiceNumber,
    );
    const description = lines
        .map((line) => `${line.name} x${line.quantity}`)
        .join(", ")
        .slice(0, 50);

    const body = {
        appid: process.env.VALOR_APP_ID?.trim(),
        appkey: process.env.VALOR_APP_KEY?.trim(),
        epi: process.env.VALOR_EPI?.trim(),
        txn_type: "sale",
        amount: centsToDollars(totalCents),
        invoicenumber: invoiceNumber,
        orderdescription: description || "Sierra Supplements order",
        surcharge: "0",
        phone: normalizePhone(params.customerPhone),
        email: params.customerEmail,
        tax: "0.00",
        epage: 1,
        redirect_url: successUrl,
        success_url: successUrl,
        failure_url: params.cancelUrl,
        shipping_country: "US",
        is_sync_qb: "0",
        customer_name: params.customerName?.trim() || "Customer",
        never_expire: "0",
        notification_status: "0",
        is_customer_info_avail: "1",
    };

    const response = await fetch(hostedPageSaleUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    const json = (await response.json().catch(() => ({}))) as ValorResponse;
    if (!response.ok) {
        throw new Error(`Valor hosted page request failed: ${response.status}`);
    }

    const session = extractValorSession(json);
    if (!session.url) {
        throw new Error("Valor hosted page response did not include a payment URL");
    }

    const externalSessionId = session.uid ?? invoiceNumber;
    const orderLines = lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        slug: line.slug,
        name: line.name,
        price: line.unitPrice,
        quantity: line.quantity,
    }));
    const baseOrderValues = {
        email: params.customerEmail ?? "unknown@customer.local",
        name: params.customerName ?? null,
        phone: params.customerPhone ?? null,
        addressLine1: params.shippingAddress?.line1 ?? null,
        addressLine2: params.shippingAddress?.line2 ?? null,
        city: params.shippingAddress?.city ?? null,
        state: params.shippingAddress?.state ?? null,
        zip: params.shippingAddress?.zip ?? null,
        items: JSON.stringify(orderLines),
        subtotal: totalCents,
        autoPay: false,
        notes: `Valor invoice ${invoiceNumber}; Valor session ${externalSessionId}`,
        status: "pending_payment",
    };

    let order: { id: number } | undefined;
    try {
        [order] = await db
            .insert(orders)
            .values({
                ...baseOrderValues,
                paymentProvider: "valor",
                paymentSessionId: externalSessionId,
            })
            .returning({ id: orders.id });
    } catch (error) {
        logServerError("valor_order_insert_payment_columns", error);
        const result = await db.execute<{ id: number }>(sql`
            insert into orders
                (email, name, phone, address_line1, address_line2, city, state, zip, items, subtotal, auto_pay, notes, status)
            values
                (${baseOrderValues.email}, ${baseOrderValues.name}, ${baseOrderValues.phone},
                 ${baseOrderValues.addressLine1}, ${baseOrderValues.addressLine2},
                 ${baseOrderValues.city}, ${baseOrderValues.state}, ${baseOrderValues.zip},
                 ${baseOrderValues.items}, ${baseOrderValues.subtotal}, ${baseOrderValues.autoPay},
                 ${baseOrderValues.notes}, ${baseOrderValues.status})
            returning id
        `);
        order = result.rows?.[0];
    }

    if (params.customerEmail) {
        await sendValorPendingPaymentEmails({
            id: order?.id ?? null,
            email: params.customerEmail,
            name: params.customerName ?? null,
            phone: params.customerPhone ?? null,
            addressLine1: params.shippingAddress?.line1 ?? null,
            addressLine2: params.shippingAddress?.line2 ?? null,
            city: params.shippingAddress?.city ?? null,
            state: params.shippingAddress?.state ?? null,
            zip: params.shippingAddress?.zip ?? null,
            subtotal: totalCents,
            status: "pending_payment",
            paymentProvider: "valor",
            paymentSessionId: externalSessionId,
            lines: orderLines,
        });
    }

    return {
        provider: "valor",
        url: session.url,
        externalSessionId,
    };
}
