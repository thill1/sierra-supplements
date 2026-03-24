import { describe, expect, it } from "vitest";
import { getAdminApiErrorMessage } from "@/lib/admin-api-client";

describe("getAdminApiErrorMessage", () => {
    it("reads error string from JSON body", async () => {
        const res = new Response(JSON.stringify({ error: "Custom" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
        expect(await getAdminApiErrorMessage(res)).toBe("Custom");
    });

    it("falls back by status when JSON has no error", async () => {
        const res = new Response(JSON.stringify({}), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
        expect(await getAdminApiErrorMessage(res)).toMatch(/sign in/i);
    });
});
