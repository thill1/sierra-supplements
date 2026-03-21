import { test, expect } from "@playwright/test";

test.describe("Public and admin API hardening", () => {
    test("GET /api/health returns structured payload", async ({ request }) => {
        const res = await request.get("/api/health");
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body).toMatchObject({ ok: true });
        expect(typeof body.database).toBe("boolean");
        expect(body.timestamp).toBeDefined();
    });

    test("admin products API returns 401 without session", async ({ request }) => {
        const res = await request.get("/api/admin/products");
        expect(res.status()).toBe(401);
    });

    test("admin upload API returns 401 without session", async ({ request }) => {
        const res = await request.post("/api/admin/upload");
        expect(res.status()).toBe(401);
    });

    test("POST /api/leads validates body", async ({ request }) => {
        const res = await request.post("/api/leads", {
            data: { email: "not-valid" },
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status()).toBe(400);
    });

    test("POST /api/events validates body", async ({ request }) => {
        const res = await request.post("/api/events", {
            data: { type: "invalid-event-type" },
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status()).toBe(400);
    });

    test("POST /api/orders validates body", async ({ request }) => {
        const res = await request.post("/api/orders", {
            data: { email: "x@y.com" },
            headers: { "Content-Type": "application/json" },
        });
        expect(res.status()).toBe(400);
    });
});
