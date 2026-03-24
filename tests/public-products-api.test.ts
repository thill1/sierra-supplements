import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    orderByMock,
    limitMock,
    whereMock,
    fromMock,
    selectMock,
} = vi.hoisted(() => ({
    orderByMock: vi.fn(),
    limitMock: vi.fn(),
    whereMock: vi.fn(),
    fromMock: vi.fn(),
    selectMock: vi.fn(),
}));

vi.mock("@/db", () => ({
    db: {
        select: selectMock,
    },
}));

import { GET as getProducts } from "@/app/api/products/route";
import { GET as getProductBySlug } from "@/app/api/products/[slug]/route";

describe("Public product APIs", () => {
    const fullProductRow = {
        id: 1,
        slug: "pre-workout",
        name: "Pre Workout",
        shortDescription: "Fast energy",
        description: "Detailed description",
        price: 4999,
        compareAtPrice: 5999,
        category: "pre-workout",
        image: "/pre-workout.jpg",
        inStock: true,
        published: true,
        featured: true,
        sku: "PW-001",
        stockQuantity: 9,
        lowStockThreshold: 2,
        status: "active",
        primaryImageUrl: "https://cdn.example.com/pre-workout.jpg",
        seoTitle: "SEO title",
        seoDescription: "SEO description",
        stripePriceId: "price_123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };

    beforeEach(() => {
        orderByMock.mockReset();
        limitMock.mockReset();
        whereMock.mockReset();
        fromMock.mockReset();
        selectMock.mockReset();

        orderByMock.mockResolvedValue([fullProductRow]);
        limitMock.mockResolvedValue([fullProductRow]);
        whereMock.mockReturnValue({
            orderBy: orderByMock,
            limit: limitMock,
        });
        fromMock.mockReturnValue({ where: whereMock });
        selectMock.mockReturnValue({ from: fromMock });
    });

    it("omits internal catalog fields from product list responses", async () => {
        const response = await getProducts(
            new Request("http://localhost/api/products"),
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as Array<Record<string, unknown>>;
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({
            id: 1,
            slug: "pre-workout",
            name: "Pre Workout",
            price: 4999,
            category: "pre-workout",
            image: "/pre-workout.jpg",
            featured: true,
        });
        expect(body[0]).not.toHaveProperty("stripePriceId");
        expect(body[0]).not.toHaveProperty("sku");
        expect(body[0]).not.toHaveProperty("lowStockThreshold");
        expect(body[0]).not.toHaveProperty("status");
    });

    it("omits internal catalog fields from product detail responses", async () => {
        const response = await getProductBySlug(new Request("http://localhost/api/products/pre-workout"), {
            params: Promise.resolve({ slug: "pre-workout" }),
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as Record<string, unknown>;
        expect(body).toMatchObject({
            id: 1,
            slug: "pre-workout",
            name: "Pre Workout",
            description: "Detailed description",
            price: 4999,
        });
        expect(body).not.toHaveProperty("stripePriceId");
        expect(body).not.toHaveProperty("sku");
        expect(body).not.toHaveProperty("lowStockThreshold");
        expect(body).not.toHaveProperty("status");
    });
});
