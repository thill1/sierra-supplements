import { isProductionRuntime } from "@/lib/admin-allowlist";

/**
 * When false, the storefront must use the database only; hardcoded catalog is not used.
 * Production defaults to DB-only unless ALLOW_HARDCODED_CATALOG=true (demo / emergency only).
 */
export function allowHardcodedCatalogFallback(): boolean {
    if (!isProductionRuntime()) {
        return process.env.DISABLE_HARDCODED_CATALOG !== "true";
    }
    return process.env.ALLOW_HARDCODED_CATALOG === "true";
}
