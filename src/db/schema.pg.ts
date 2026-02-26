import {
    pgTable,
    text,
    integer,
    timestamp,
    boolean,
    serial,
} from "drizzle-orm/pg-core";

// ─── Events ───────────────────────────────────────────────────
export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    page: text("page"),
    element: text("element"),
    metadata: text("metadata"),
    sessionId: text("session_id"),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─── Leads ───────────────────────────────────────────────────
export const leads = pgTable("leads", {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message"),
    source: text("source"),
    page: text("page"),
    status: text("status").default("new"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
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

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    category: text("category").notNull(),
    image: text("image"),
    inStock: boolean("in_stock").default(true),
    published: boolean("published").default(false),
    featured: boolean("featured").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
