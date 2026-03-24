import { describe, expect, it } from "vitest";
import { buildSettledOrderValues } from "@/lib/payments/settlement";

describe("buildSettledOrderValues", () => {
    it("stores generic payment identifiers while preserving the legacy Stripe session field", () => {
        const values = buildSettledOrderValues({
            provider: "stripe",
            externalSessionId: "cs_test_123",
            customer: {
                email: "buyer@example.com",
                name: "Buyer",
                phone: "555-0100",
                addressLine1: "123 Main St",
                addressLine2: "Suite A",
                city: "Austin",
                state: "TX",
                zip: "78701",
            },
            lines: [
                {
                    productId: 1,
                    name: "Pre Workout",
                    unitPrice: 4999,
                    quantity: 2,
                },
            ],
            subtotal: 9998,
            slugByProductId: new Map([[1, "pre-workout"]]),
        });

        expect(values).toMatchObject({
            email: "buyer@example.com",
            name: "Buyer",
            phone: "555-0100",
            addressLine1: "123 Main St",
            addressLine2: "Suite A",
            city: "Austin",
            state: "TX",
            zip: "78701",
            subtotal: 9998,
            status: "paid",
            paymentProvider: "stripe",
            paymentSessionId: "cs_test_123",
            stripeCheckoutSessionId: "cs_test_123",
        });

        expect(JSON.parse(values.items)).toEqual([
            {
                slug: "pre-workout",
                name: "Pre Workout",
                price: 4999,
                quantity: 2,
            },
        ]);
    });
});
