import { describe, expect, it, vi, beforeEach } from "vitest";

const limitFn = vi.fn();

vi.mock("@/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: limitFn,
                })),
            })),
        })),
    },
}));

import { db } from "@/db";
import { resolveAdmin } from "@/lib/admin-auth";

describe("resolveAdmin", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
        limitFn.mockReset();
        vi.mocked(db.select).mockClear();
    });

    it("uses active DB row (role from DB)", async () => {
        vi.stubEnv("ADMIN_EMAILS", "other@example.com");
        limitFn.mockResolvedValue([
            {
                id: 1,
                email: "a@b.com",
                role: "editor",
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const r = await resolveAdmin("a@b.com");
        expect(r).toEqual({ id: 1, email: "a@b.com", role: "editor" });
    });

    it("denies inactive DB row even if on allowlist", async () => {
        vi.stubEnv("ADMIN_EMAILS", "a@b.com");
        limitFn.mockResolvedValue([
            {
                id: 1,
                email: "a@b.com",
                role: "owner",
                active: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const r = await resolveAdmin("a@b.com");
        expect(r).toBeNull();
    });

    it("grants owner from ADMIN_EMAILS when no DB row (other admins may exist)", async () => {
        vi.stubEnv("ADMIN_EMAILS", "newadmin@example.com");
        limitFn.mockResolvedValue([]);

        const r = await resolveAdmin("newadmin@example.com");
        expect(r).toEqual({
            id: null,
            email: "newadmin@example.com",
            role: "owner",
        });
    });
});
