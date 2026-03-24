import Papa from "papaparse";
import type { AdminProductCreateInput, AdminProductUpdateInput } from "@/lib/admin/schemas/product";
import { adminProductCreateSchema, adminProductUpdateSchema } from "@/lib/admin/schemas/product";

/** Canonical field keys after header normalization (snake_case). */
export type InventoryCsvCanonical = {
    slug?: string;
    name?: string;
    short_description?: string;
    description?: string;
    price?: string;
    compare_at_price?: string;
    category?: string;
    stock_quantity?: string;
    low_stock_threshold?: string;
    sku?: string;
    published?: string;
    featured?: string;
    status?: string;
    image?: string;
    primary_image_url?: string;
};

const HEADER_ALIASES: Record<string, keyof InventoryCsvCanonical> = {
    slug: "slug",
    product_slug: "slug",
    url_slug: "slug",
    name: "name",
    product_name: "name",
    title: "name",
    short_description: "short_description",
    short_desc: "short_description",
    subtitle: "short_description",
    description: "description",
    desc: "description",
    body: "description",
    price: "price",
    retail_price: "price",
    compare_at_price: "compare_at_price",
    compare_price: "compare_at_price",
    msrp: "compare_at_price",
    category: "category",
    cat: "category",
    stock_quantity: "stock_quantity",
    qty: "stock_quantity",
    quantity: "stock_quantity",
    stock: "stock_quantity",
    low_stock_threshold: "low_stock_threshold",
    low_stock: "low_stock_threshold",
    sku: "sku",
    published: "published",
    is_published: "published",
    featured: "featured",
    is_featured: "featured",
    status: "status",
    image: "image",
    image_url: "image",
    primary_image_url: "primary_image_url",
    hero_image: "primary_image_url",
};

export function normalizeInventoryCsvHeader(raw: string): string {
    return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function slugifyProductName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 200);
}

export function resolveInventoryLookupSlug(fields: InventoryCsvCanonical): string | null {
    const explicit = fields.slug?.trim();
    if (explicit) return explicit;
    const name = fields.name?.trim();
    if (!name) return null;
    const derived = slugifyProductName(name);
    return derived.length > 0 ? derived : null;
}

function trimOrUndef(s: string | undefined): string | undefined {
    if (s === undefined) return undefined;
    const t = s.trim();
    return t.length > 0 ? t : undefined;
}

function emptyToNull(s: string | undefined): string | null | undefined {
    if (s === undefined) return undefined;
    const t = s.trim();
    return t.length > 0 ? t : null;
}

/** When the cell is non-empty, require a valid non-negative int. */
function parseStockInt(
    s: string | undefined,
    label: string,
): { ok: true; value: number | undefined } | { ok: false; error: string } {
    if (s === undefined) return { ok: true, value: undefined };
    const t = s.trim();
    if (t.length === 0) return { ok: true, value: undefined };
    const n = parseInt(t, 10);
    if (Number.isNaN(n) || n < 0) {
        return { ok: false, error: `${label} must be a non-negative integer` };
    }
    return { ok: true, value: n };
}

function parseOptionalBool(s: string | undefined): boolean | undefined {
    const t = trimOrUndef(s)?.toLowerCase();
    if (t === undefined) return undefined;
    if (["true", "1", "yes", "y"].includes(t)) return true;
    if (["false", "0", "no", "n"].includes(t)) return false;
    return undefined;
}

function normalizeParsedRow(
    row: Record<string, unknown>,
    line: number,
): { line: number; fields: InventoryCsvCanonical } {
    const fields: InventoryCsvCanonical = {};
    for (const [rawKey, rawVal] of Object.entries(row)) {
        const nk = normalizeInventoryCsvHeader(rawKey);
        const canonical = HEADER_ALIASES[nk];
        if (!canonical) continue;
        if (rawVal === null || rawVal === undefined) continue;
        const str = String(rawVal).trim();
        if (str.length === 0) continue;
        fields[canonical] = str;
    }
    return { line, fields };
}

export type ParsedInventoryRow = {
    line: number;
    fields: InventoryCsvCanonical;
};

export type ParseInventoryCsvResult =
    | { ok: true; rows: ParsedInventoryRow[] }
    | { ok: false; error: string };

const MAX_ROWS = 500;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function getInventoryCsvLimits() {
    return { maxRows: MAX_ROWS, maxFileBytes: MAX_FILE_BYTES };
}

export function parseInventoryCsvText(text: string): ParseInventoryCsvResult {
    const normalized = text.replace(/^\uFEFF/, "");
    const parsed = Papa.parse<Record<string, unknown>>(normalized, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h) => normalizeInventoryCsvHeader(h),
    });

    if (parsed.errors.length > 0) {
        const first = parsed.errors[0];
        return {
            ok: false,
            error: first?.message ?? "Invalid CSV",
        };
    }

    const data = parsed.data ?? [];
    if (data.length === 0) {
        return { ok: false, error: "CSV has no data rows" };
    }
    if (data.length > MAX_ROWS) {
        return {
            ok: false,
            error: `Too many rows (max ${MAX_ROWS})`,
        };
    }

    const baseLine = 2;
    const rows: ParsedInventoryRow[] = data.map((row, i) =>
        normalizeParsedRow(row, baseLine + i),
    );

    return { ok: true, rows };
}

function buildRawProductPayload(fields: InventoryCsvCanonical): {
    slug: string;
    payload: Record<string, unknown>;
} | { error: string } {
    const name = trimOrUndef(fields.name);
    if (!name) {
        return { error: "name is required" };
    }

    const lookup = resolveInventoryLookupSlug(fields);
    if (!lookup) {
        return { error: "slug is required (or provide name to derive slug)" };
    }

    const slug = fields.slug?.trim() || slugifyProductName(name);
    if (!slug || slug.length < 1) {
        return { error: "could not determine slug" };
    }

    const description = trimOrUndef(fields.description);
    if (!description) {
        return { error: "description is required" };
    }

    const priceStr = trimOrUndef(fields.price);
    if (priceStr === undefined) {
        return { error: "price is required" };
    }
    const price = Number(priceStr);
    if (Number.isNaN(price) || price < 0) {
        return { error: "price must be a non-negative number (dollars)" };
    }

    const category = trimOrUndef(fields.category);
    if (!category) {
        return { error: "category is required" };
    }

    let compareAtPrice: number | null | undefined;
    if (
        fields.compare_at_price !== undefined &&
        trimOrUndef(fields.compare_at_price) !== undefined
    ) {
        const n = Number(fields.compare_at_price.trim());
        if (Number.isNaN(n) || n < 0) {
            return { error: "compare_at_price must be a non-negative number" };
        }
        compareAtPrice = n;
    }

    const stockParsed = parseStockInt(fields.stock_quantity, "stock_quantity");
    if (!stockParsed.ok) return { error: stockParsed.error };
    const lowParsed = parseStockInt(
        fields.low_stock_threshold,
        "low_stock_threshold",
    );
    if (!lowParsed.ok) return { error: lowParsed.error };
    const stockQty = stockParsed.value;
    const lowThresh = lowParsed.value;
    const published = parseOptionalBool(fields.published);
    const featured = parseOptionalBool(fields.featured);
    const status = trimOrUndef(fields.status);
    const image = emptyToNull(fields.image);
    const primaryImageUrl = emptyToNull(fields.primary_image_url);
    const shortDescription = emptyToNull(fields.short_description);
    const sku = emptyToNull(fields.sku);

    const payload: Record<string, unknown> = {
        slug,
        name,
        shortDescription: shortDescription ?? null,
        description,
        price,
        category,
        compareAtPrice:
            compareAtPrice === undefined ? null : compareAtPrice,
        sku: sku ?? null,
        published: published ?? false,
        featured: featured ?? false,
        status: status ?? "active",
        image: image ?? null,
        primaryImageUrl: primaryImageUrl ?? null,
    };

    if (stockQty !== undefined) {
        payload.stockQuantity = stockQty;
    }
    if (lowThresh !== undefined) {
        payload.lowStockThreshold = lowThresh;
    }

    return { slug, payload };
}

export function csvRowToCreateInput(
    fields: InventoryCsvCanonical,
):
    | { ok: true; lookupSlug: string; data: AdminProductCreateInput }
    | { ok: false; message: string } {
    const built = buildRawProductPayload(fields);
    if ("error" in built) {
        return { ok: false, message: built.error };
    }

    const parsed = adminProductCreateSchema.safeParse(built.payload);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return {
            ok: false,
            message: issue
                ? `${issue.path.join(".")}: ${issue.message}`
                : "Validation failed",
        };
    }

    return {
        ok: true,
        lookupSlug: parsed.data.slug,
        data: parsed.data,
    };
}

/**
 * Update payload for CSV import: omits slug so the lookup slug stays stable.
 */
export function csvRowToUpdateInput(
    fields: InventoryCsvCanonical,
):
    | { ok: true; data: AdminProductUpdateInput }
    | { ok: false; message: string } {
    const built = buildRawProductPayload(fields);
    if ("error" in built) {
        return { ok: false, message: built.error };
    }

    const updatePayload = { ...built.payload };
    delete updatePayload.slug;
    const parsed = adminProductUpdateSchema.safeParse(updatePayload);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return {
            ok: false,
            message: issue
                ? `${issue.path.join(".")}: ${issue.message}`
                : "Validation failed",
        };
    }

    return { ok: true, data: parsed.data };
}

export { INVENTORY_CSV_TEMPLATE } from "@/lib/admin/inventory-csv-template";
