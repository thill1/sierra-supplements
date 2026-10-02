ALTER TABLE "admin_app_settings" ADD COLUMN "customer_lead_auto_reply" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_received_email" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_paid_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_packed_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_fulfilled_email" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_cancelled_email" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_app_settings" ADD COLUMN "customer_order_refunded_email" boolean DEFAULT false NOT NULL;
