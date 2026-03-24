ALTER TABLE "admin_app_settings" ADD COLUMN "notify_email_cal_bookings" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "notify_email_low_stock" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_provider" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_session_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_payment_provider_session_id_unique" ON "orders" USING btree ("payment_provider","payment_session_id");