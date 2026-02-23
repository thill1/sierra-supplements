import { NextResponse } from "next/server";
import { z } from "zod/v4";

const eventSchema = z.object({
    type: z.enum(["view", "click", "submit", "book", "purchase"]),
    page: z.string().optional(),
    element: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    sessionId: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = eventSchema.parse(body);

        try {
            const { db } = await import("@/db");
            const { events } = await import("@/db/schema");
            await db.insert(events).values({
                type: data.type,
                page: data.page || null,
                element: data.element || null,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                sessionId: data.sessionId || null,
            });
        } catch (dbError) {
            console.warn("DB not available for event tracking:", dbError);
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
