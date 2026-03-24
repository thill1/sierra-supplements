import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/admin-rate-limit", () => ({
    rateLimitAdminWrite: vi.fn(() => null),
}));

vi.mock("@/lib/require-admin", () => ({
    requireAdmin: vi.fn(),
    requireAdminOrRespond: vi.fn((result) => result.response ?? result),
}));

import { requireAdmin } from "@/lib/require-admin";
import { POST } from "@/app/api/admin/products/route";

describe("POST /api/admin/products", () => {
    beforeEach(() => {
        vi.mocked(requireAdmin).mockReset();
    });

    it("returns 401 when not authenticated", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: null,
            admin: null,
            response: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            ),
        });

        const res = await POST(
            new Request("http://localhost/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );

        expect(res.status).toBe(401);
    });

    it("returns 403 when forbidden", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: null,
            admin: null,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        });

        const res = await POST(
            new Request("http://localhost/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );

        expect(res.status).toBe(403);
    });
});
