-- Admin → Settings persistence (singleton row id = 1).
-- Apply on environments that do not use `pnpm db:push`, or run `pnpm db:push` after schema change.

CREATE TABLE IF NOT EXISTS admin_app_settings (
    id integer PRIMARY KEY DEFAULT 1,
    site_name text NOT NULL,
    base_url text NOT NULL,
    admin_notification_email text NOT NULL,
    notify_email_leads boolean NOT NULL DEFAULT true,
    notify_sms_leads boolean NOT NULL DEFAULT false,
    nurture_auto boolean NOT NULL DEFAULT true,
    updated_at timestamp DEFAULT now(),
    CONSTRAINT admin_app_settings_singleton CHECK (id = 1)
);

INSERT INTO admin_app_settings (
    id,
    site_name,
    base_url,
    admin_notification_email
)
VALUES (
    1,
    'Sierra Strength',
    'https://sierrastrengthsupplements.com',
    'admin@sierrastrengthsupplements.com'
)
ON CONFLICT (id) DO NOTHING;
