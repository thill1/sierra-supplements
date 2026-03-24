import { NextResponse } from "next/server";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, productVariants } from "@/db/schema";
import {
    applyParentProductStockInTx,
    applyStockChangeInTx,
    type StockChangeResult,
} from "@/lib/inventory/adjust-stock";
import { notifyLowStockIfNeeded } from "@/lib/email/admin-notifications";
import { INVENTORY_SOURCE } from "@/lib/inventory/constants";
import { writeAuditLog } from "@/lib/audit/write-audit";
import { logServerError } from "@/lib/observability";
import type { PaymentProvider } from "@/lib/payments/types";

export type SettledCustomer = {
    email: string;
    name: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
};

export type SettledOrderLine = {
    productId: number;
    name: string;
    unitPrice: number;
    quantity: number;
};

type SettlementLineInput = {
    productId: number;
    variantId: number;
    quantity: number;
};

type BuiltSettlementLine = SettlementLineInput & {
    name: string;
    sku: string | null;
    unitPrice: number;
    lineTotal: number;
};

type BuildSettledOrderValuesParams = {
    provider: PaymentProvider;
    externalSessionId: string;
    customer: SettledCustomer;
    lines: SettledOrderLine[];
    subtotal: number;
    slugByProductId: Map<number, string>;
};

type SettleCompletedPaymentParams = {
    provider: PaymentProvider;
    externalSessionId: string;
    customer: SettledCustomer;
    items: SettlementLineInput[];
};

export function buildSettledOrderValues({
    provider,
    externalSessionId,
    customer,
    lines,
    subtotal,
    slugByProductId,
}: BuildSettledOrderValuesParams) {
    return {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        addressLine1: customer.addressLine1,
        addressLine2: customer.addressLine2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        items: JSON.stringify(
            lines.map((line) => ({
                slug: slugByProductId.get(line.productId) ?? null,
                name: line.name,
                price: line.unitPrice,
                quantity: line.quantity,
            })),
        ),
        subtotal,
        autoPay: false,
        notes: null,
        status: "paid",
        paymentProvider: provider,
        paymentSessionId: externalSessionId,
        stripeCheckoutSessionId:
            provider === "stripe" ? externalSessionId : null,
    };
}

function duplicatePaymentWhere(provider: PaymentProvider, externalSessionId: string) {
    if (provider === "stripe") {
        return or(
            and(
                eq(orders.paymentProvider, provider),
                eq(orders.paymentSessionId, externalSessionId),
            ),
            eq(orders.stripeCheckoutSessionId, externalSessionId),
        );
    }

    return and(
        eq(orders.paymentProvider, provider),
        eq(orders.paymentSessionId, externalSessionId),
    );
}

export async function settleCompletedPayment({
    provider,
    externalSessionId,
    customer,
    items,
}: SettleCompletedPaymentParams): Promise<NextResponse> {
    try {
        const [existing] = await db
            .select({ id: orders.id })
            .from(orders)
            .where(duplicatePaymentWhere(provider, externalSessionId))
            .limit(1);
        if (existing) {
            return NextResponse.json({ received: true, duplicate: true });
        }

        const variantIds = [
            ...new Set(items.map((item) => item.variantId).filter((id) => id > 0)),
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
        const productIds = [...new Set(items.map((item) => item.productId))];
        const productRows = await db
            .select({ id: products.id, slug: products.slug })
            .from(products)
            .where(inArray(products.id, productIds));
        const slugByProductId = new Map(productRows.map((row) => [row.id, row.slug]));

        if (variantIds.length > 0 && variantRows.length !== variantIds.length) {
            throw new Error("One or more variants are no longer available");
        }

        let subtotal = 0;
        const lines: BuiltSettlementLine[] = [];

        for (const item of items) {
            if (item.variantId > 0) {
                const row = byVariantId.get(item.variantId);
                if (!row) {
                    throw new Error(`Missing variant ${item.variantId}`);
                }
                const { variant, product } = row;
                if (product.id !== item.productId) {
                    throw new Error("Line product/variant mismatch");
                }
                const lineTotal = variant.price * item.quantity;
                subtotal += lineTotal;
                lines.push({
                    productId: product.id,
                    variantId: variant.id,
                    quantity: item.quantity,
                    name: `${product.name} — ${variant.label}`,
                    sku: variant.sku ?? null,
                    unitPrice: variant.price,
                    lineTotal,
                });
                continue;
            }

            const [product] = await db
                .select()
                .from(products)
                .where(eq(products.id, item.productId))
                .limit(1);
            if (!product || product.id !== item.productId) {
                throw new Error(`Missing product ${item.productId}`);
            }
            const lineTotal = product.price * item.quantity;
            subtotal += lineTotal;
            lines.push({
                productId: product.id,
                variantId: 0,
                quantity: item.quantity,
                name: product.name,
                sku: product.sku ?? null,
                unitPrice: product.price,
                lineTotal,
            });
        }

        const stockResults: StockChangeResult[] = [];

        await db.transaction(async (tx) => {
            const [order] = await tx
                .insert(orders)
                .values(
                    buildSettledOrderValues({
                        provider,
                        externalSessionId,
                        customer,
                        lines,
                        subtotal,
                        slugByProductId,
                    }),
                )
                .returning();

            if (!order) throw new Error("Order insert failed");

            for (const line of lines) {
                await tx.insert(orderItems).values({
                    orderId: order.id,
                    productId: line.productId,
                    variantId: line.variantId > 0 ? line.variantId : null,
                    productName: line.name,
                    sku: line.sku,
                    unitPrice: line.unitPrice,
                    quantity: line.quantity,
                    lineTotal: line.lineTotal,
                });

                const stock =
                    line.variantId > 0
                        ? await applyStockChangeInTx(tx, {
                              variantId: line.variantId,
                              delta: -line.quantity,
                              reason: `${provider}_checkout`,
                              source: INVENTORY_SOURCE.webSale,
                              note: `session ${externalSessionId}`,
                              actorUserId: null,
                          })
                        : await applyParentProductStockInTx(tx, {
                              productId: line.productId,
                              delta: -line.quantity,
                              reason: `${provider}_checkout`,
                              source: INVENTORY_SOURCE.webSale,
                              note: `session ${externalSessionId}`,
                              actorUserId: null,
                          });
                stockResults.push(stock);
            }

            await writeAuditLog(tx, {
                actorUserId: null,
                entityType: "order",
                entityId: String(order.id),
                action: `${provider}_checkout_completed`,
                after: { externalSessionId, subtotal, provider },
            });
        });

        for (const result of stockResults) {
            await notifyLowStockIfNeeded({
                previousQty: result.previousQuantity,
                newQty: result.newQuantity,
                lowStockThreshold: result.lowStockThreshold,
                productId: result.productId,
                variantId: result.variantId,
                variantLabel: result.variantLabel,
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        logServerError(`${provider}_payment_settlement`, error);
        return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
}
