import { NextResponse } from "next/server";
import { verifyCalWebhookSignature } from "@/lib/calcom/verify-webhook";
import { escapeHtml } from "@/lib/escape-html";
import {
    getAdminAppSettings,
    resolveAdminNotificationEmail,
    sendAdminNotificationEmail,
} from "@/lib/email/admin-notifications";
import { logServerError } from "@/lib/observability";

export const runtime = "nodejs";

function parseBookingPayload(body: unknown): {
    triggerEvent: string;
    payload: Record<string, unknown> | null;
} {
    const obj =
        body && typeof body === "object"
            ? (body as Record<string, unknown>)
            : null;
    const triggerEvent =
        obj && typeof obj.triggerEvent === "string" ? obj.triggerEvent : "";
    const rawPayload = obj?.payload;
    const payload =
        rawPayload && typeof rawPayload === "object"
            ? (rawPayload as Record<string, unknown>)
            : null;
    return { triggerEvent, payload };
}

export async function POST(request: Request) {
    const secret = process.env.CALCOM_WEBHOOK_SECRET?.trim();
    if (!secret) {
        logServerError(
            "calcom_webhook_no_secret",
            new Error("CALCOM_WEBHOOK_SECRET is not set"),
        );
        return NextResponse.json(
            { error: "Webhook not configured" },
            { status: 503 },
        );
    }

    const rawBody = await request.text();
    const sig = request.headers.get("x-cal-signature-256");
    if (!verifyCalWebhookSignature(rawBody, secret, sig)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawBody) as unknown;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { triggerEvent, payload } = parseBookingPayload(parsed);
    if (triggerEvent !== "BOOKING_CREATED" || !payload) {
        return NextResponse.json({ received: true });
    }

    const settings = await getAdminAppSettings();
    if (settings?.notifyEmailCalBookings === false) {
        return NextResponse.json({ received: true });
    }

    const title =
        typeof payload.title === "string" ? payload.title : "Consultation";
    const startTime =
        typeof payload.startTime === "string" ? payload.startTime : "—";
    const uid = typeof payload.uid === "string" ? payload.uid : "";
    const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
    const first =
        attendees[0] && typeof attendees[0] === "object"
            ? (attendees[0] as Record<string, unknown>)
            : null;
    const guestEmail =
        first && typeof first.email === "string" ? first.email : "—";
    const guestName = first && typeof first.name === "string" ? first.name : "—";

    const subjectTitle =
        title.length > 120 ? `${title.slice(0, 117)}…` : title;

    await sendAdminNotificationEmail({
        to: resolveAdminNotificationEmail(settings),
        subject: `New Cal.com booking: ${subjectTitle}`,
        html: `
<h2>New consultation booked</h2>
<p><strong>Event:</strong> ${escapeHtml(title)}</p>
<p><strong>Start:</strong> ${escapeHtml(startTime)}</p>
<p><strong>Guest:</strong> ${escapeHtml(guestName)}</p>
<p><strong>Email:</strong> ${escapeHtml(guestEmail)}</p>
${uid ? `<p><strong>Booking UID:</strong> ${escapeHtml(uid)}</p>` : ""}
`,
    });

    return NextResponse.json({ received: true });
}
