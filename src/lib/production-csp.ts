/**
 * Production Content-Security-Policy (allowlist). Applied in middleware so every
 * HTML/API response gets the current policy (avoids stale edge cache of headers
 * from older builds).
 */
export const PRODUCTION_CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com https://cal.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://app.cal.com https://cal.com https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
    "frame-src https://cal.com https://app.cal.com https://www.google.com https://maps.google.com",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
].join("; ");
