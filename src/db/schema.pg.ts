import {
    pgTable,
    text,
    integer,
    timestamp,
    boolean,
    serial,
    jsonb,
    uniqueIndex,
    index,
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

// ─── Admin RBAC ────────────────────────────────────────────────
export const adminRoles = ["owner", "manager", "editor"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const adminUsers = pgTable("admin_users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    role: text("role").notNull().$type<AdminRole>(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

/** Single-row app settings editable from Admin → Settings (id must remain 1). */
export const adminAppSettings = pgTable("admin_app_settings", {
    id: integer("id").primaryKey().default(1),
    siteName: text("site_name").notNull(),
    baseUrl: text("base_url").notNull(),
    adminNotificationEmail: text("admin_notification_email").notNull(),
    notifyEmailLeads: boolean("notify_email_leads").notNull().default(true),
    notifySmsLeads: boolean("notify_sms_leads").notNull().default(false),
    nurtureAuto: boolean("nurture_auto").notNull().default(true),
    updatedAt: timestamp("updated_at").defaultNow(),
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
    "bars",
    "carbs",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const productStatuses = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export const productImageKinds = ["hero", "facts", "label", "gallery"] as const;
export type ProductImageKind = (typeof productImageKinds)[number];

// ─── Orders ────────────────────────────────────────────────────
export const orders = pgTable(
    "orders",
    {
        id: serial("id").primaryKey(),
        email: text("email").notNull(),
        name: text("name"),
        phone: text("phone"),
        addressLine1: text("address_line1"),
        addressLine2: text("address_line2"),
        city: text("city"),
        state: text("state"),
        zip: text("zip"),
        items: text("items").notNull(), // JSON legacy: [{ slug, name, price, quantity }]
        subtotal: integer("subtotal").notNull(),
        autoPay: boolean("auto_pay").default(false),
        notes: text("notes"),
        status: text("status").default("pending"),
        stripeCheckoutSessionId: text("stripe_checkout_session_id"),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [
        uniqueIndex("orders_stripe_checkout_session_id_unique").on(
            t.stripeCheckoutSessionId,
        ),
    ],
);

// ─── Testimonials ──────────────────────────────────────────────
export const testimonials = pgTable("testimonials", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    quote: text("quote").notNull(),
    avatar: text("avatar"),
    rating: integer("rating").default(5),
    sortOrder: integer("sort_order").default(0),
    published: boolean("published").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

// ─── Products ──────────────────────────────────────────────────
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
    sku: text("sku"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(2),
    status: text("status").notNull().default("active").$type<ProductStatus>(),
    primaryImageUrl: text("primary_image_url"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    stripePriceId: text("stripe_price_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const productImages = pgTable(
    "product_images",
    {
        id: serial("id").primaryKey(),
        productId: integer("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        url: text("url").notNull(),
        kind: text("kind").notNull().$type<ProductImageKind>(),
        sortOrder: integer("sort_order").notNull().default(0),
        altText: text("alt_text"),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [index("product_images_product_id_idx").on(t.productId)],
);

export const inventoryMovements = pgTable(
    "inventory_movements",
    {
        id: serial("id").primaryKey(),
        productId: integer("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        delta: integer("delta").notNull(),
        reason: text("reason").notNull(),
        source: text("source").notNull(),
        note: text("note"),
        actorUserId: integer("actor_user_id").references(() => adminUsers.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [index("inventory_movements_product_id_idx").on(t.productId)],
);

export const orderItems = pgTable(
    "order_items",
    {
        id: serial("id").primaryKey(),
        orderId: integer("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        productId: integer("product_id").references(() => products.id, {
            onDelete: "set null",
        }),
        productName: text("product_name").notNull(),
        sku: text("sku"),
        unitPrice: integer("unit_price").notNull(),
        quantity: integer("quantity").notNull(),
        lineTotal: integer("line_total").notNull(),
    },
    (t) => [index("order_items_order_id_idx").on(t.orderId)],
);

export const auditLogs = pgTable(
    "audit_logs",
    {
        id: serial("id").primaryKey(),
        actorUserId: integer("actor_user_id").references(() => adminUsers.id, {
            onDelete: "set null",
        }),
        entityType: text("entity_type").notNull(),
        entityId: text("entity_id").notNull(),
        action: text("action").notNull(),
        beforeJson: jsonb("before_json"),
        afterJson: jsonb("after_json"),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (t) => [index("audit_logs_created_at_idx").on(t.createdAt)],
);

/** Single-row homepage copy editable from Admin → Content (id must remain 1). */
export const homepageContent = pgTable("homepage_content", {
    id: integer("id").primaryKey().default(1),
    data: jsonb("data").notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPosts = pgTable(
    "blog_posts",
    {
        id: serial("id").primaryKey(),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        excerpt: text("excerpt"),
        category: text("category").notNull().default("General"),
        readTime: text("read_time").notNull().default("5 min"),
        body: text("body").notNull(),
        published: boolean("published").notNull().default(false),
        publishedAt: timestamp("published_at"),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (t) => [index("blog_posts_published_idx").on(t.published)],
);
