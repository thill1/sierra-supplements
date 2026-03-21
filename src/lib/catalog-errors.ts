/** Thrown when the storefront cannot load catalog data and hardcoded fallback is disabled. */
export class CatalogUnavailableError extends Error {
    override name = "CatalogUnavailableError";
    constructor() {
        super("STORE_CATALOG_UNAVAILABLE");
    }
}
