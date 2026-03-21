import { describe, expect, it } from "vitest";
import { validateImageMagicBytes } from "@/lib/image-magic";

describe("validateImageMagicBytes", () => {
    it("accepts minimal valid JPEG", () => {
        const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(validateImageMagicBytes(buf, "image/jpeg")).toBe(true);
    });

    it("rejects JPEG magic with wrong bytes", () => {
        const buf = Buffer.from([0x00, 0xd8, 0xff]);
        expect(validateImageMagicBytes(buf, "image/jpeg")).toBe(false);
    });
});
