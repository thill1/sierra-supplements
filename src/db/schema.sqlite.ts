import {
    sqliteTable,
    text,
    integer,
} from "drizzle-orm/sqlite-core";

// ─── Events ───────────────────────────────────────────────────
export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull(),
    page: text("page"),
    element: text("element"),
    metadata: text("metadata"),
    sessionId: text("session_id"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Leads ───────────────────────────────────────────────────
export const leads = sqliteTable("leads", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message"),
    source: text("source"),
    page: text("page"),
    status: text("status").default("new"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ─── Products ────────────────────────────────────────────────
export const productCategories = [
    "pre-workout",
    "creatine",
    "protein",
    "bcaas",
    "vitamins",
    "omega-3",
    "multivitamins",
    "collagen",
    "electrolytes",
    "fat-burners",
    "sleep-recovery",
    "joint-support",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    category: text("category").notNull(),
    image: text("image"),
    inStock: integer("in_stock", { mode: "boolean" }).default(true),
    published: integer("published", { mode: "boolean" }).default(false),
    featured: integer("featured", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
