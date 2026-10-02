export function isPgMissingSchemaError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const code = "code" in error ? String((error as { code?: unknown }).code) : "";
    if (code === "42P01" || code === "42703") return true;

    const message =
        "message" in error ? String((error as { message?: unknown }).message) : "";
    return (
        /relation .* does not exist/i.test(message) ||
        /column .* does not exist/i.test(message)
    );
}
