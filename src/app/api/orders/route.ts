import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { inArray } from "drizzle-orm";
import { escapeHtml } from "@/lib/escape-html";

const orderItemSchema = z.object({
    slug: z.string().min(1).max(200),
    quantity: z.number().int().positive().max(99),
});

const orderSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(200),
    phone: z.string().max(50).optional(),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(50),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP format"),
    items: z.array(orderItemSchema).min(1).max(50),
    autoPay: z.boolean().optional(),
    notes: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = orderSchema.parse(body);

        const { db } = await import("@/db");
        const { orders, products } = await import("@/db/schema");

        const slugs = [...new Set(parsed.items.map((i) => i.slug))];
        const dbProducts = await db
            .select({ slug: products.slug, name: products.name, price: products.price })
            .from(products)
            .where(inArray(products.slug, slugs));

        const productMap = new Map(dbProducts.map((p) => [p.slug, p]));

        const validatedItems: { slug: string; name: string; price: number; quantity: number }[] = [];
        let subtotal = 0;

        for (const item of parsed.items) {
            const product = productMap.get(item.slug);
            if (!product) {
                return NextResponse.json(
                    { error: "Invalid product", slug: item.slug },
                    { status: 400 }
                );
            }
            const lineTotal = product.price * item.quantity;
            subtotal += lineTotal;
            validatedItems.push({
                slug: product.slug,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        const autoPay = !!parsed.autoPay;
        const finalSubtotal = autoPay ? Math.round(subtotal * 0.9) : subtotal;

        const [order] = await db
            .insert(orders)
            .values({
                email: parsed.email,
                name: parsed.name,
                phone: parsed.phone ?? null,
                addressLine1: parsed.addressLine1,
                addressLine2: parsed.addressLine2 ?? null,
                city: parsed.city,
                state: parsed.state,
                zip: parsed.zip,
                items: JSON.stringify(validatedItems),
                subtotal: finalSubtotal,
                autoPay,
                notes: parsed.notes ?? null,
            })
            .returning({ id: orders.id });

        const orderId = order?.id ?? null;

        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                const adminEmail = process.env.ADMIN_EMAIL || "admin@sierrastrengthsupplements.com";

                const itemsHtml = validatedItems
                    .map(
                        (i) =>
                            `<tr><td>${escapeHtml(i.name)}</td><td>×${i.quantity}</td><td>$${((i.price * i.quantity) / 100).toFixed(2)}</td></tr>`
                    )
                    .join("");

                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: adminEmail,
                    subject: `New Order: ${escapeHtml(parsed.name)} – $${(finalSubtotal / 100).toFixed(2)}${autoPay ? " (Auto-Pay)" : ""}`,
                    html: `
<h2>New Order Received</h2>
<p><strong>Name:</strong> ${escapeHtml(parsed.name)}</p>
<p><strong>Email:</strong> ${escapeHtml(parsed.email)}</p>
<p><strong>Phone:</strong> ${parsed.phone ? escapeHtml(parsed.phone) : "—"}</p>
<p><strong>Shipping:</strong><br/>
${escapeHtml(parsed.addressLine1)}<br/>
${parsed.addressLine2 ? escapeHtml(parsed.addressLine2) + "<br/>" : ""}
${escapeHtml(parsed.city)}, ${escapeHtml(parsed.state)} ${parsed.zip}</p>
${autoPay ? `<p><strong>Monthly Auto-Pay:</strong> Yes (10% discount applied)</p>` : ""}
<p><strong>Order total:</strong> $${(finalSubtotal / 100).toFixed(2)}</p>
<h3>Items</h3>
<table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
<thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
<tbody>${itemsHtml}</tbody>
</table>
${parsed.notes ? `<p><strong>Notes:</strong> ${escapeHtml(parsed.notes)}</p>` : ""}
                    `,
                });

                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: parsed.email,
                    subject: "Order confirmed – Sierra Strength",
                    html: `
<h2>Thanks for your order!</h2>
<p>Hi ${escapeHtml(parsed.name)},</p>
<p>We've received your order and will reach out shortly to confirm payment and shipping.</p>
<p><strong>Order total:</strong> $${(finalSubtotal / 100).toFixed(2)}</p>
${autoPay ? `<p>You're signed up for monthly auto-pay — we'll reach out to set up your recurring order.</p>` : ""}
<p>Questions? Reply to this email or call us.</p>
<p>– The Sierra Strength Team</p>
                    `,
                });
            } catch (e) {
                console.warn("Order email failed:", e);
            }
        }

        return NextResponse.json({ success: true, orderId }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Order error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
