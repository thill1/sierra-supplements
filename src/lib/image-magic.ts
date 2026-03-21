/**
 * Validate that buffer magic bytes match an allowed image type (defense in depth vs Content-Type spoofing).
 */
export function validateImageMagicBytes(
    buf: Buffer,
    expectedMime: "image/jpeg" | "image/png" | "image/webp",
): boolean {
    if (buf.length < 12) return false;
    if (expectedMime === "image/png") {
        return (
            buf[0] === 0x89 &&
            buf[1] === 0x50 &&
            buf[2] === 0x4e &&
            buf[3] === 0x47
        );
    }
    if (expectedMime === "image/jpeg") {
        return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    }
    if (expectedMime === "image/webp") {
        const riff = buf.subarray(0, 4).toString("ascii");
        const webp = buf.subarray(8, 12).toString("ascii");
        return riff === "RIFF" && webp === "WEBP";
    }
    return false;
}
