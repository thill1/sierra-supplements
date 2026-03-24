/**
 * Regression — functional area: admin-settings
 * Covers GET/PUT /api/admin/settings (authz and happy paths with mocked DB).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { siteConfig } from "@/lib/site-config";

vi.mock("@/lib/admin-rate-limit", () => ({
    rateLimitAdminWrite: vi.fn(() => null),
}));

vi.mock("@/lib/require-admin", () => ({
    requireAdmin: vi.fn(),
}));

const dbHarness = vi.hoisted(() => {
    let limitRows: unknown[] = [];
    const limit = vi.fn(() => Promise.resolve(limitRows));
    const onConflictDoUpdate = vi.fn(() => Promise.resolve());
    const db = {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit,
                })),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                onConflictDoUpdate,
            })),
        })),
    };
    return {
        db,
        limit,
        onConflictDoUpdate,
        setLimitRows(rows: unknown[]) {
            limitRows = rows;
        },
    };
});

vi.mock("@/db", () => ({
    db: dbHarness.db,
}));

import { requireAdmin } from "@/lib/require-admin";
import { GET, PUT } from "@/app/api/admin/settings/route";

const editorSession = { user: { email: "editor@test.com" } } as Session;
const ownerSession = { user: { email: "owner@test.com" } } as Session;

describe("Regression: admin-settings — GET /api/admin/settings", () => {
    beforeEach(() => {
        vi.mocked(requireAdmin).mockReset();
        dbHarness.setLimitRows([]);
        vi.mocked(dbHarness.limit).mockClear();
        vi.mocked(dbHarness.onConflictDoUpdate).mockClear();
    });

    it("returns 401 when requireAdmin rejects", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: null,
            admin: null,
            response: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            ),
        });

        const res = await GET();
        expect(res.status).toBe(401);
    });

    it("returns site defaults when no DB row exists", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: editorSession,
            admin: { id: 1, email: "editor@test.com", role: "editor" },
            response: null,
        });
        dbHarness.setLimitRows([]);

        const res = await GET();
        expect(res.status).toBe(200);
        const body = (await res.json()) as { siteName: string; baseUrl: string };
        expect(body.siteName).toBe(siteConfig.name);
        expect(body.baseUrl).toBe(siteConfig.url);
    });

    it("returns persisted row when present", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: editorSession,
            admin: { id: 1, email: "editor@test.com", role: "editor" },
            response: null,
        });
        dbHarness.setLimitRows([
            {
                id: 1,
                siteName: "Custom Site",
                baseUrl: "https://custom.example.com",
                adminNotificationEmail: "notify@example.com",
                notifyEmailLeads: false,
                notifySmsLeads: true,
                nurtureAuto: false,
                updatedAt: "2025-01-01T00:00:00.000Z",
            },
        ]);

        const res = await GET();
        expect(res.status).toBe(200);
        const body = (await res.json()) as { siteName: string };
        expect(body.siteName).toBe("Custom Site");
    });
});

describe("Regression: admin-settings — PUT /api/admin/settings", () => {
    beforeEach(() => {
        vi.mocked(requireAdmin).mockReset();
        dbHarness.setLimitRows([]);
        vi.mocked(dbHarness.limit).mockClear();
        vi.mocked(dbHarness.onConflictDoUpdate).mockClear();
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

        const res = await PUT(
            new Request("http://localhost/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteName: "X",
                    baseUrl: "https://x.com",
                    adminNotificationEmail: "a@x.com",
                    notifyEmailLeads: true,
                    notifySmsLeads: false,
                    nurtureAuto: true,
                }),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("returns 403 for manager (owner only)", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: editorSession,
            admin: { id: 2, email: "mgr@test.com", role: "manager" },
            response: null,
        });

        const res = await PUT(
            new Request("http://localhost/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteName: "X",
                    baseUrl: "https://x.com",
                    adminNotificationEmail: "a@x.com",
                    notifyEmailLeads: true,
                    notifySmsLeads: false,
                    nurtureAuto: true,
                }),
            }),
        );
        expect(res.status).toBe(403);
    });

    it("returns 400 on invalid body", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: ownerSession,
            admin: { id: 1, email: "owner@test.com", role: "owner" },
            response: null,
        });

        const res = await PUT(
            new Request("http://localhost/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteName: "",
                    baseUrl: "not-a-url",
                    adminNotificationEmail: "bad",
                }),
            }),
        );
        expect(res.status).toBe(400);
    });

    it("upserts and returns saved settings for owner", async () => {
        vi.mocked(requireAdmin).mockResolvedValue({
            session: ownerSession,
            admin: { id: 1, email: "owner@test.com", role: "owner" },
            response: null,
        });

        const saved = {
            id: 1,
            siteName: "Saved Co",
            baseUrl: "https://saved.example.com",
            adminNotificationEmail: "saved@example.com",
            notifyEmailLeads: true,
            notifyEmailCalBookings: true,
            notifyEmailLowStock: true,
            notifySmsLeads: false,
            nurtureAuto: true,
            updatedAt: "2025-06-01T12:00:00.000Z",
        };
        dbHarness.setLimitRows([saved]);

        const res = await PUT(
            new Request("http://localhost/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteName: "Saved Co",
                    baseUrl: "https://saved.example.com",
                    adminNotificationEmail: "saved@example.com",
                    notifyEmailLeads: true,
                    notifyEmailCalBookings: true,
                    notifyEmailLowStock: true,
                    notifySmsLeads: false,
                    nurtureAuto: true,
                }),
            }),
        );

        expect(res.status).toBe(200);
        expect(dbHarness.onConflictDoUpdate).toHaveBeenCalled();
        const body = (await res.json()) as { siteName: string };
        expect(body.siteName).toBe("Saved Co");
    });
});
