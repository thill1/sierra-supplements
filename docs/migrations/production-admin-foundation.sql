-- Sierra Strength production admin/store foundation migration.
-- Idempotent by design. No drops, truncates, or destructive rewrites.

BEGIN;

CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" serial PRIMARY KEY,
    "email" text NOT NULL UNIQUE,
    "role" text NOT NULL,
    "active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "events" (
    "id" serial PRIMARY KEY,
    "type" text NOT NULL,
    "page" text,
    "element" text,
    "metadata" text,
    "session_id" text,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" serial PRIMARY KEY,
    "actor_user_id" integer,
    "entity_type" text NOT NULL,
    "entity_id" text NOT NULL,
    "action" text NOT NULL,
    "before_json" jsonb,
    "after_json" jsonb,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "admin_app_settings" (
    "id" integer PRIMARY KEY DEFAULT 1,
    "site_name" text NOT NULL DEFAULT 'Sierra Strength',
    "base_url" text NOT NULL DEFAULT 'https://www.sierrastrengthsupplements.com',
    "admin_notification_email" text NOT NULL DEFAULT 'Lordsgymoutreach@gmail.com',
    "notify_email_leads" boolean NOT NULL DEFAULT true,
    "customer_lead_auto_reply" boolean NOT NULL DEFAULT true,
    "customer_order_received_email" boolean NOT NULL DEFAULT true,
    "customer_order_paid_email" boolean NOT NULL DEFAULT false,
    "customer_order_packed_email" boolean NOT NULL DEFAULT false,
    "customer_order_fulfilled_email" boolean NOT NULL DEFAULT true,
    "customer_order_cancelled_email" boolean NOT NULL DEFAULT false,
    "customer_order_refunded_email" boolean NOT NULL DEFAULT false,
    "notify_email_cal_bookings" boolean NOT NULL DEFAULT true,
    "notify_email_low_stock" boolean NOT NULL DEFAULT true,
    "notify_sms_leads" boolean NOT NULL DEFAULT false,
    "nurture_auto" boolean NOT NULL DEFAULT true,
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "admin_app_settings_singleton" CHECK ("id" = 1)
);

ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "site_name" text NOT NULL DEFAULT 'Sierra Strength';
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "base_url" text NOT NULL DEFAULT 'https://www.sierrastrengthsupplements.com';
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "admin_notification_email" text NOT NULL DEFAULT 'Lordsgymoutreach@gmail.com';
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "notify_email_leads" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_lead_auto_reply" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_received_email" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_paid_email" boolean NOT NULL DEFAULT false;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_packed_email" boolean NOT NULL DEFAULT false;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_fulfilled_email" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_cancelled_email" boolean NOT NULL DEFAULT false;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "customer_order_refunded_email" boolean NOT NULL DEFAULT false;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "notify_email_cal_bookings" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "notify_email_low_stock" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "notify_sms_leads" boolean NOT NULL DEFAULT false;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "nurture_auto" boolean NOT NULL DEFAULT true;
ALTER TABLE "admin_app_settings" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

INSERT INTO "admin_app_settings" (
    "id",
    "site_name",
    "base_url",
    "admin_notification_email",
    "notify_email_leads",
    "customer_lead_auto_reply",
    "customer_order_received_email",
    "customer_order_paid_email",
    "customer_order_packed_email",
    "customer_order_fulfilled_email",
    "customer_order_cancelled_email",
    "customer_order_refunded_email",
    "notify_email_cal_bookings",
    "notify_email_low_stock",
    "notify_sms_leads",
    "nurture_auto"
)
VALUES (
    1,
    'Sierra Strength',
    'https://www.sierrastrengthsupplements.com',
    'Lordsgymoutreach@gmail.com',
    true,
    true,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    true,
    false,
    true
)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "homepage_content" (
    "id" integer PRIMARY KEY DEFAULT 1,
    "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "blog_posts" (
    "id" serial PRIMARY KEY,
    "slug" text NOT NULL UNIQUE,
    "title" text NOT NULL,
    "excerpt" text,
    "category" text NOT NULL DEFAULT 'General',
    "read_time" text NOT NULL DEFAULT '5 min',
    "body" text NOT NULL,
    "published" boolean NOT NULL DEFAULT false,
    "published_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock_quantity" integer NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer NOT NULL DEFAULT 2;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "primary_image_url" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stripe_price_id" text;

UPDATE "products"
SET "stock_quantity" = 1
WHERE "stock_quantity" = 0
  AND COALESCE("in_stock", false) IS TRUE;

CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" serial PRIMARY KEY,
    "product_id" integer NOT NULL,
    "label" text NOT NULL,
    "price" integer NOT NULL,
    "compare_at_price" integer,
    "sku" text,
    "stock_quantity" integer NOT NULL DEFAULT 0,
    "low_stock_threshold" integer NOT NULL DEFAULT 2,
    "stripe_price_id" text,
    "sort_order" integer NOT NULL DEFAULT 0,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "product_id" integer;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "label" text NOT NULL DEFAULT 'Default';
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "price" integer NOT NULL DEFAULT 0;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "compare_at_price" integer;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "sku" text;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "stock_quantity" integer NOT NULL DEFAULT 0;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer NOT NULL DEFAULT 2;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "stripe_price_id" text;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

INSERT INTO "product_variants" (
    "product_id",
    "label",
    "price",
    "compare_at_price",
    "sku",
    "stock_quantity",
    "low_stock_threshold",
    "stripe_price_id",
    "sort_order"
)
SELECT
    p."id",
    'Default',
    p."price",
    p."compare_at_price",
    p."sku",
    p."stock_quantity",
    p."low_stock_threshold",
    p."stripe_price_id",
    0
FROM "products" p
WHERE NOT EXISTS (
    SELECT 1 FROM "product_variants" pv WHERE pv."product_id" = p."id"
);

CREATE TABLE IF NOT EXISTS "product_images" (
    "id" serial PRIMARY KEY,
    "product_id" integer NOT NULL,
    "url" text NOT NULL,
    "kind" text NOT NULL,
    "sort_order" integer NOT NULL DEFAULT 0,
    "alt_text" text,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "inventory_movements" (
    "id" serial PRIMARY KEY,
    "product_id" integer NOT NULL,
    "variant_id" integer,
    "delta" integer NOT NULL,
    "reason" text NOT NULL,
    "source" text NOT NULL,
    "note" text,
    "actor_user_id" integer,
    "created_at" timestamp DEFAULT now()
);

ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "variant_id" integer;
ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "actor_user_id" integer;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_provider" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_session_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" text;

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" serial PRIMARY KEY,
    "order_id" integer NOT NULL,
    "product_id" integer,
    "variant_id" integer,
    "product_name" text NOT NULL,
    "sku" text,
    "unit_price" integer NOT NULL,
    "quantity" integer NOT NULL,
    "line_total" integer NOT NULL
);

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_id" integer;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_payment_provider_session_id_unique"
    ON "orders" ("payment_provider", "payment_session_id");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_checkout_session_id_unique"
    ON "orders" ("stripe_checkout_session_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "blog_posts_published_idx" ON "blog_posts" ("published");
CREATE INDEX IF NOT EXISTS "inventory_movements_product_id_idx" ON "inventory_movements" ("product_id");
CREATE INDEX IF NOT EXISTS "inventory_movements_variant_id_idx" ON "inventory_movements" ("variant_id");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" ("product_id");
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants" ("product_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_user_id_admin_users_id_fk') THEN
        ALTER TABLE "audit_logs"
            ADD CONSTRAINT "audit_logs_actor_user_id_admin_users_id_fk"
            FOREIGN KEY ("actor_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_product_id_products_id_fk') THEN
        ALTER TABLE "product_variants"
            ADD CONSTRAINT "product_variants_product_id_products_id_fk"
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_images_product_id_products_id_fk') THEN
        ALTER TABLE "product_images"
            ADD CONSTRAINT "product_images_product_id_products_id_fk"
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_movements_product_id_products_id_fk') THEN
        ALTER TABLE "inventory_movements"
            ADD CONSTRAINT "inventory_movements_product_id_products_id_fk"
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_movements_variant_id_product_variants_id_fk') THEN
        ALTER TABLE "inventory_movements"
            ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk"
            FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_movements_actor_user_id_admin_users_id_fk') THEN
        ALTER TABLE "inventory_movements"
            ADD CONSTRAINT "inventory_movements_actor_user_id_admin_users_id_fk"
            FOREIGN KEY ("actor_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_orders_id_fk') THEN
        ALTER TABLE "order_items"
            ADD CONSTRAINT "order_items_order_id_orders_id_fk"
            FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_products_id_fk') THEN
        ALTER TABLE "order_items"
            ADD CONSTRAINT "order_items_product_id_products_id_fk"
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_variant_id_product_variants_id_fk') THEN
        ALTER TABLE "order_items"
            ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk"
            FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
