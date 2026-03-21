-- Optional manual upgrade script for existing Postgres databases.
-- Prefer `pnpm db:push` when possible (Drizzle will diff schema).
-- Run in a transaction after backup.

BEGIN;

CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "role" text NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "actor_user_id" integer,
    "entity_type" text NOT NULL,
    "entity_id" text NOT NULL,
    "action" text NOT NULL,
    "before_json" jsonb,
    "after_json" jsonb,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "product_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "product_id" integer NOT NULL,
    "url" text NOT NULL,
    "kind" text NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "alt_text" text,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "inventory_movements" (
    "id" serial PRIMARY KEY NOT NULL,
    "product_id" integer NOT NULL,
    "delta" integer NOT NULL,
    "reason" text NOT NULL,
    "source" text NOT NULL,
    "note" text,
    "actor_user_id" integer,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "order_id" integer NOT NULL,
    "product_id" integer,
    "product_name" text NOT NULL,
    "sku" text,
    "unit_price" integer NOT NULL,
    "quantity" integer NOT NULL,
    "line_total" integer NOT NULL
);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock_quantity" integer DEFAULT 0 NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer DEFAULT 2 NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "primary_image_url" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stripe_price_id" text;

UPDATE "products"
SET "stock_quantity" = CASE WHEN "in_stock" IS TRUE THEN GREATEST("stock_quantity", 1) ELSE 0 END
WHERE "stock_quantity" = 0;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" text;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_checkout_session_id_unique"
    ON "orders" ("stripe_checkout_session_id");

CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "inventory_movements_product_id_idx" ON "inventory_movements" ("product_id");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" ("product_id");

-- Foreign keys (skip if already present — adjust for your DB)
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_actor_user_id_admin_users_id_fk";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_admin_users_id_fk"
    FOREIGN KEY ("actor_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL;

ALTER TABLE "inventory_movements" DROP CONSTRAINT IF EXISTS "inventory_movements_product_id_products_id_fk";
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;

ALTER TABLE "inventory_movements" DROP CONSTRAINT IF EXISTS "inventory_movements_actor_user_id_admin_users_id_fk";
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_user_id_admin_users_id_fk"
    FOREIGN KEY ("actor_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL;

ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_order_id_orders_id_fk";
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;

ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_product_id_products_id_fk";
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;

ALTER TABLE "product_images" DROP CONSTRAINT IF EXISTS "product_images_product_id_products_id_fk";
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;

COMMIT;
