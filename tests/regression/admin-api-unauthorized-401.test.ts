/**
 * Regression — functional areas: admin-auth / admin API surface
 * Ensures unauthenticated requests never reach handler business logic (401 from requireAdmin).
 */
import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/admin-rate-limit", () => ({
    rateLimitAdminWrite: vi.fn(() => null),
    rateLimitAdminUpload: vi.fn(() => null),
}));

vi.mock("@/lib/require-admin", () => ({
    requireAdmin: vi.fn(() =>
        Promise.resolve({
            session: null,
            admin: null,
            response: NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            ),
        }),
    ),
}));

import { GET as leadsGET } from "@/app/api/admin/leads/route";
import {
    GET as leadByIdGET,
    PATCH as leadByIdPATCH,
    DELETE as leadByIdDELETE,
} from "@/app/api/admin/leads/[id]/route";
import { GET as ordersGET } from "@/app/api/admin/orders/route";
import { GET as orderByIdGET, PATCH as orderByIdPATCH } from "@/app/api/admin/orders/[id]/route";
import { GET as productsGET, POST as productsPOST } from "@/app/api/admin/products/route";
import {
    GET as productByIdGET,
    PUT as productByIdPUT,
    DELETE as productByIdDELETE,
} from "@/app/api/admin/products/[id]/route";
import { POST as productDuplicatePOST } from "@/app/api/admin/products/[id]/duplicate/route";
import {
    GET as productImagesGET,
    POST as productImagesPOST,
    PATCH as productImagesPATCH,
} from "@/app/api/admin/products/[id]/images/route";
import { GET as testimonialsGET, POST as testimonialsPOST } from "@/app/api/admin/testimonials/route";
import {
    GET as testimonialByIdGET,
    PUT as testimonialByIdPUT,
    DELETE as testimonialByIdDELETE,
} from "@/app/api/admin/testimonials/[id]/route";
import { POST as inventoryAdjustPOST } from "@/app/api/admin/inventory/adjust/route";
import { POST as inventoryInStorePOST } from "@/app/api/admin/inventory/in-store-sale/route";
import { POST as inventoryRestockPOST } from "@/app/api/admin/inventory/restock/route";
import { GET as inventoryMovementsGET } from "@/app/api/admin/inventory/movements/route";
import { POST as uploadPOST } from "@/app/api/admin/upload/route";
import { GET as settingsGET, PUT as settingsPUT } from "@/app/api/admin/settings/route";
import { GET as auditLogsGET } from "@/app/api/admin/audit-logs/route";
import {
    GET as homepageContentGET,
    PUT as homepageContentPUT,
} from "@/app/api/admin/homepage-content/route";
import { GET as adminEventsGET } from "@/app/api/admin/events/route";
import {
    GET as blogPostsGET,
    POST as blogPostsPOST,
} from "@/app/api/admin/blog-posts/route";
import {
    GET as blogPostByIdGET,
    PUT as blogPostByIdPUT,
    DELETE as blogPostByIdDELETE,
} from "@/app/api/admin/blog-posts/[id]/route";
import {
    GET as adminUsersGET,
    POST as adminUsersPOST,
} from "@/app/api/admin/users/route";
import { PATCH as adminUserPatch } from "@/app/api/admin/users/[id]/route";

const idParams = { params: Promise.resolve({ id: "1" }) };

describe("Regression: admin API — 401 without session", () => {
    it("admin-leads: GET /api/admin/leads", async () => {
        const res = await leadsGET(
            new Request("http://localhost/api/admin/leads"),
        );
        expect(res.status).toBe(401);
    });

    it("admin-leads: GET /api/admin/leads/[id]", async () => {
        const res = await leadByIdGET(
            new Request("http://localhost/api/admin/leads/1"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-leads: PATCH /api/admin/leads/[id]", async () => {
        const res = await leadByIdPATCH(
            new Request("http://localhost/api/admin/leads/1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "contacted" }),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-leads: DELETE /api/admin/leads/[id]", async () => {
        const res = await leadByIdDELETE(
            new Request("http://localhost/api/admin/leads/1", {
                method: "DELETE",
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-orders: GET /api/admin/orders", async () => {
        const res = await ordersGET();
        expect(res.status).toBe(401);
    });

    it("admin-orders: GET /api/admin/orders/[id]", async () => {
        const res = await orderByIdGET(
            new Request("http://localhost/api/admin/orders/1"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-orders: PATCH /api/admin/orders/[id]", async () => {
        const res = await orderByIdPATCH(
            new Request("http://localhost/api/admin/orders/1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "paid", notes: null }),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: GET /api/admin/products", async () => {
        const res = await productsGET(
            new Request("http://localhost/api/admin/products"),
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: POST /api/admin/products", async () => {
        const res = await productsPOST(
            new Request("http://localhost/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: GET /api/admin/products/[id]", async () => {
        const res = await productByIdGET(
            new Request("http://localhost/api/admin/products/1"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: PUT /api/admin/products/[id]", async () => {
        const res = await productByIdPUT(
            new Request("http://localhost/api/admin/products/1", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: DELETE /api/admin/products/[id]", async () => {
        const res = await productByIdDELETE(
            new Request("http://localhost/api/admin/products/1", {
                method: "DELETE",
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-products: POST /api/admin/products/[id]/duplicate", async () => {
        const res = await productDuplicatePOST(
            new Request("http://localhost/api/admin/products/1/duplicate", {
                method: "POST",
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-product-images: GET /api/admin/products/[id]/images", async () => {
        const res = await productImagesGET(
            new Request("http://localhost/api/admin/products/1/images"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-product-images: POST /api/admin/products/[id]/images", async () => {
        const res = await productImagesPOST(
            new Request("http://localhost/api/admin/products/1/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-product-images: PATCH /api/admin/products/[id]/images", async () => {
        const res = await productImagesPATCH(
            new Request("http://localhost/api/admin/products/1/images", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-testimonials: GET /api/admin/testimonials", async () => {
        const res = await testimonialsGET();
        expect(res.status).toBe(401);
    });

    it("admin-testimonials: POST /api/admin/testimonials", async () => {
        const res = await testimonialsPOST(
            new Request("http://localhost/api/admin/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-testimonials: GET /api/admin/testimonials/[id]", async () => {
        const res = await testimonialByIdGET(
            new Request("http://localhost/api/admin/testimonials/1"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-testimonials: PUT /api/admin/testimonials/[id]", async () => {
        const res = await testimonialByIdPUT(
            new Request("http://localhost/api/admin/testimonials/1", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-testimonials: DELETE /api/admin/testimonials/[id]", async () => {
        const res = await testimonialByIdDELETE(
            new Request("http://localhost/api/admin/testimonials/1", {
                method: "DELETE",
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-inventory: POST /api/admin/inventory/adjust", async () => {
        const res = await inventoryAdjustPOST(
            new Request("http://localhost/api/admin/inventory/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-inventory: POST /api/admin/inventory/in-store-sale", async () => {
        const res = await inventoryInStorePOST(
            new Request("http://localhost/api/admin/inventory/in-store-sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-inventory: POST /api/admin/inventory/restock", async () => {
        const res = await inventoryRestockPOST(
            new Request("http://localhost/api/admin/inventory/restock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-inventory: GET /api/admin/inventory/movements", async () => {
        const res = await inventoryMovementsGET(
            new Request("http://localhost/api/admin/inventory/movements"),
        );
        expect(res.status).toBe(401);
    });

    it("admin-upload: POST /api/admin/upload", async () => {
        const body = new FormData();
        body.set("file", new Blob([Buffer.from("x")], { type: "image/jpeg" }));
        const res = await uploadPOST(
            new Request("http://localhost/api/admin/upload", {
                method: "POST",
                body,
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-audit-logs: GET /api/admin/audit-logs", async () => {
        const res = await auditLogsGET(
            new Request("http://localhost/api/admin/audit-logs"),
        );
        expect(res.status).toBe(401);
    });

    it("admin-settings: GET /api/admin/settings", async () => {
        const res = await settingsGET();
        expect(res.status).toBe(401);
    });

    it("admin-settings: PUT /api/admin/settings", async () => {
        const res = await settingsPUT(
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

    it("admin-homepage-content: GET /api/admin/homepage-content", async () => {
        const res = await homepageContentGET();
        expect(res.status).toBe(401);
    });

    it("admin-homepage-content: PUT /api/admin/homepage-content", async () => {
        const res = await homepageContentPUT(
            new Request("http://localhost/api/admin/homepage-content", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadMagnet: {
                        title: "t",
                        subtitle: "s",
                        cta: "c",
                    },
                    hero: {
                        footerTagline: "f",
                        primaryCtaLabel: "a",
                        secondaryCtaLabel: "b",
                        servicesLinkLabel: "c",
                        stats: [{ value: "1", label: "x" }],
                    },
                }),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-events: GET /api/admin/events", async () => {
        const res = await adminEventsGET(
            new Request("http://localhost/api/admin/events"),
        );
        expect(res.status).toBe(401);
    });

    it("admin-blog-posts: GET /api/admin/blog-posts", async () => {
        const res = await blogPostsGET();
        expect(res.status).toBe(401);
    });

    it("admin-blog-posts: POST /api/admin/blog-posts", async () => {
        const res = await blogPostsPOST(
            new Request("http://localhost/api/admin/blog-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: "x",
                    title: "T",
                    body: "B",
                }),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-blog-posts: GET /api/admin/blog-posts/[id]", async () => {
        const res = await blogPostByIdGET(
            new Request("http://localhost/api/admin/blog-posts/1"),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-blog-posts: PUT /api/admin/blog-posts/[id]", async () => {
        const res = await blogPostByIdPUT(
            new Request("http://localhost/api/admin/blog-posts/1", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "x" }),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-blog-posts: DELETE /api/admin/blog-posts/[id]", async () => {
        const res = await blogPostByIdDELETE(
            new Request("http://localhost/api/admin/blog-posts/1", {
                method: "DELETE",
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });

    it("admin-users: GET /api/admin/users", async () => {
        const res = await adminUsersGET();
        expect(res.status).toBe(401);
    });

    it("admin-users: POST /api/admin/users", async () => {
        const res = await adminUsersPOST(
            new Request("http://localhost/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "a@b.com",
                    role: "editor",
                }),
            }),
        );
        expect(res.status).toBe(401);
    });

    it("admin-users: PATCH /api/admin/users/[id]", async () => {
        const res = await adminUserPatch(
            new Request("http://localhost/api/admin/users/1", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: false }),
            }),
            idParams,
        );
        expect(res.status).toBe(401);
    });
});
