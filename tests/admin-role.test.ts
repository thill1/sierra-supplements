import { describe, expect, it } from "vitest";
import { roleMeetsMinimum } from "@/lib/admin-role";

describe("roleMeetsMinimum", () => {
    it("ranks owner above manager and editor", () => {
        expect(roleMeetsMinimum("owner", "manager")).toBe(true);
        expect(roleMeetsMinimum("manager", "owner")).toBe(false);
        expect(roleMeetsMinimum("editor", "manager")).toBe(false);
        expect(roleMeetsMinimum("manager", "editor")).toBe(true);
    });
});
