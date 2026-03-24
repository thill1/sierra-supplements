import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Session } from "next-auth";

vi.mock("@/lib/admin-rate-limit", () => ({
    rateLimitAdminUpload: vi.fn(() => null),
}));

vi.mock("@/lib/require-admin", () => ({
    requireAdmin: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
    put: vi.fn(),
}));

import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/require-admin";
import { POST } from "@/app/api/admin/upload/route";

describe("POST /api/admin/upload", () => {
    const prevToken = process.env.BLOB_READ_WRITE_TOKEN;

    beforeEach(() => {
        process.env.BLOB_READ_WRITE_TOKEN = "test-token";
        vi.mocked(requireAdmin).mockResolvedValue({
            session: { user: { email: "admin@test.dev" } } as Session,
            admin: { id: 1, email: "admin@test.dev", role: "owner" },
            response: null,
        });
        vi.mocked(put).mockReset();
    });

    afterEach(() => {
        process.env.BLOB_READ_WRITE_TOKEN = prevToken;
    });

    it("returns 400 when file bytes do not match declared JPEG type", async () => {
        const pngHeader = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0,
        ]);
        const form = new FormData();
        form.append(
            "file",
            new File([pngHeader], "disguised.jpg", { type: "image/jpeg" }),
        );

        const res = await POST(
            new Request("http://localhost/api/admin/upload", {
                method: "POST",
                body: form,
            }),
        );

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error?: string };
        expect(body.error).toMatch(/allowed image type/i);
        expect(vi.mocked(put)).not.toHaveBeenCalled();
    });
});
