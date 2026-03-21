import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { escapeHtml } from "@/lib/escape-html";
import { checkRateLimits } from "@/lib/rate-limit";
import { logServerError } from "@/lib/observability";

const leadSchema = z.object({
    name: z.string().max(200).optional(),
    email: z.string().email(),
    phone: z.string().max(50).optional(),
    message: z.string().max(2000).optional(),
    source: z.string().max(100).optional(),
    page: z.string().max(500).optional(),
});

const isProd = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
    const limited = checkRateLimits(request, [
        { namespace: "leads-15m", limit: 5, windowMs: 15 * 60 * 1000 },
        { namespace: "leads-1h", limit: 12, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    try {
        const body = await request.json();
        const data = leadSchema.parse(body);

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
            if (isProd) {
                logServerError("leads_db_insert", dbError);
                return NextResponse.json(
                    { error: "Service temporarily unavailable" },
                    { status: 503 },
                );
            }
            console.warn("DB not available, lead not persisted:", dbError);
        }

        if (isProd && leadId === null) {
            return NextResponse.json(
                { error: "Service temporarily unavailable" },
                { status: 503 },
            );
        }

        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);

                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: process.env.ADMIN_EMAIL || "admin@sierrastrengthsupplements.com",
                    subject: `New Lead: ${escapeHtml(data.name || data.email)} (${escapeHtml(data.source || "website")})`,
                    html: `
            <h2>New Lead Received</h2>
            <p><strong>Name:</strong> ${escapeHtml(data.name || "Not provided")}</p>
            <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(data.phone || "Not provided")}</p>
            <p><strong>Source:</strong> ${escapeHtml(data.source || "website")}</p>
            <p><strong>Page:</strong> ${escapeHtml(data.page || "/")}</p>
            <p><strong>Message:</strong> ${escapeHtml(data.message || "No message")}</p>
          `,
                });

                await resend.emails.send({
                    from: "Sierra Strength <noreply@sierrastrengthsupplements.com>",
                    to: data.email,
                    subject: "Thanks for reaching out to Sierra Strength!",
                    html: `
            <h2>We received your message!</h2>
            <p>Hi ${escapeHtml(data.name || "there")},</p>
            <p>Thank you for reaching out to Sierra Strength. We've received your information and will be in touch within 2 hours during business hours.</p>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li><a href="https://sierrastrengthsupplements.com/book">Book a free consultation</a></li>
              <li><a href="https://sierrastrengthsupplements.com/blog">Read our latest articles</a></li>
            </ul>
            <p>– The Sierra Strength Team</p>
          `,
                });
            } catch (emailError) {
                logServerError("leads_resend", emailError);
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
        logServerError("leads_post", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
