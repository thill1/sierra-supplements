import { NextResponse } from "next/server";
import { z } from "zod/v4";

// Schema validation for lead capture
const leadSchema = z.object({
    name: z.string().optional(),
    email: z.email(),
    phone: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
    page: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = leadSchema.parse(body);

        // Dynamically import DB to avoid build-time errors if DATABASE_URL isn't set
        let leadId: number | null = null;
        try {
            const { db } = await import("@/db");
            const { leads } = await import("@/db/schema");
            const result = await db
                .insert(leads)
                .values({
                    name: data.name || null,
                    email: data.email,
                    phone: data.phone || null,
                    message: data.message || null,
                    source: data.source || "unknown",
                    page: data.page || "/",
                    status: "new",
                })
                .returning({ id: leads.id });
            leadId = result[0]?.id ?? null;
        } catch (dbError) {
            console.warn("DB not available, lead stored in memory only:", dbError);
        }

        // Send notification email via Resend (if configured)
        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);

                // Notify admin
                await resend.emails.send({
                    from: "Sierra Supplements <noreply@sierrasupplements.com>",
                    to: process.env.ADMIN_EMAIL || "admin@sierrasupplements.com",
                    subject: `New Lead: ${data.name || data.email} (${data.source || "website"})`,
                    html: `
            <h2>New Lead Received</h2>
            <p><strong>Name:</strong> ${data.name || "Not provided"}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
            <p><strong>Source:</strong> ${data.source || "website"}</p>
            <p><strong>Page:</strong> ${data.page || "/"}</p>
            <p><strong>Message:</strong> ${data.message || "No message"}</p>
          `,
                });

                // Send confirmation to user
                await resend.emails.send({
                    from: "Sierra Supplements <noreply@sierrasupplements.com>",
                    to: data.email,
                    subject: "Thanks for reaching out to Sierra Supplements!",
                    html: `
            <h2>We received your message!</h2>
            <p>Hi ${data.name || "there"},</p>
            <p>Thank you for reaching out to Sierra Supplements. We've received your information and will be in touch within 2 hours during business hours.</p>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li><a href="https://sierrasupplements.com/book">Book a free consultation</a></li>
              <li><a href="https://sierrasupplements.com/blog">Read our latest articles</a></li>
            </ul>
            <p>– The Sierra Supplements Team</p>
          `,
                });
            } catch (emailError) {
                console.warn("Email sending failed:", emailError);
            }
        }

        return NextResponse.json(
            { success: true, id: leadId },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Lead capture error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
