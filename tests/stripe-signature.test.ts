import { describe, expect, it } from "vitest";
import Stripe from "stripe";

describe("Stripe webhook signature verification", () => {
    it("throws on invalid signature", () => {
        const stripe = new Stripe("sk_test_fake_key_for_unit_tests");
        expect(() =>
            stripe.webhooks.constructEvent("{}", "bad_sig", "whsec_test_secret"),
        ).toThrow();
    });
});
