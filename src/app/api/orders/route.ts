import { NextResponse } from "next/server";
import { z } from "zod/v4";

const orderSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    phone: z.string().optional(),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    items: z.array(
        z.object({
            slug: z.string(),
            name: z.string(),
            price: z.number().int().positive(),
            quantity: z.number().int().positive(),
        })
    ).min(1),
    subtotal: z.number().int().positive(),
    notes: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = orderSchema.parse(body);

        let orderId: number | null = null;
        try {
            const { db } = await import("@/db");
            const { orders } = await import("@/db/schema");
            const [order] = await db
                .insert(orders)
                .values({
                    email: data.email,
                    name: data.name,
                    phone: data.phone ?? null,
                    addressLine1: data.addressLine1,
                    addressLine2: data.addressLine2 ?? null,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    items: JSON.stringify(data.items),
                    subtotal: data.subtotal,
                    notes: data.notes ?? null,
                })
                .returning({ id: orders.id });
            orderId = order?.id ?? null;
        } catch (e) {
            console.warn("DB not available, order not persisted:", e);
        }

        // Email admin
        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                const adminEmail = process.env.ADMIN_EMAIL || "admin@sierrastrengthsupplements.com";

                const itemsHtml = data.items
                    .map(
                        (i: { name: string; price: number; quantity: number }) =>
                            `<tr><td>${i.name}</td><td>×${i.quantity}</td><td>$${((i.price * i.quantity) / 100).toFixed(2)}</td></tr>`
                    )
                    .join("");

                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: adminEmail,
                    subject: `New Order: ${data.name} – $${(data.subtotal / 100).toFixed(2)}`,
                    html: `
<h2>New Order Received</h2>
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Phone:</strong> ${data.phone || "—"}</p>
<p><strong>Shipping:</strong><br/>
${data.addressLine1}<br/>
${data.addressLine2 ? data.addressLine2 + "<br/>" : ""}
${data.city}, ${data.state} ${data.zip}</p>
<p><strong>Order total:</strong> $${(data.subtotal / 100).toFixed(2)}</p>
<h3>Items</h3>
<table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
<thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
<tbody>${itemsHtml}</tbody>
</table>
${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
                    `,
                });

                // Confirm to customer
                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: data.email,
                    subject: "Order confirmed – Sierra Strength",
                    html: `
<h2>Thanks for your order!</h2>
<p>Hi ${data.name},</p>
<p>We've received your order and will reach out shortly to confirm payment and shipping.</p>
<p><strong>Order total:</strong> $${(data.subtotal / 100).toFixed(2)}</p>
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
