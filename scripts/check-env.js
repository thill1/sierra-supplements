#!/usr/bin/env node
/**
 * Validate environment for local dev and production.
 * Run: node scripts/check-env.js
 */

const required = {
    DATABASE_URL: "Postgres connection string (Supabase pooler port 6543 for Vercel)",
    NEXTAUTH_SECRET: "Run: openssl rand -base64 32",
    NEXTAUTH_URL: "http://localhost:3000 (local) or https://your-domain.vercel.app (prod)",
};

const recommended = {
    ADMIN_EMAILS:
        "Comma-separated admin emails — required on Vercel; restricts who can sign in and use /admin",
};

const optional = {
    NEXT_PUBLIC_APP_URL: "Same as NEXTAUTH_URL",
    RESEND_API_KEY: "For contact form email",
    GOOGLE_CLIENT_ID: "For Google auth",
    GOOGLE_CLIENT_SECRET: "For Google auth",
    NEXT_PUBLIC_SUPABASE_URL: "Admin image uploads – see docs/SUPABASE-STORAGE.md",
    SUPABASE_SERVICE_ROLE_KEY: "Server-only; pair with NEXT_PUBLIC_SUPABASE_URL",
    SUPABASE_STORAGE_BUCKET: "Optional; default store-images",
    ALLOW_HARDCODED_CATALOG: "Never in prod unless demo — see README",
};

const env = process.env;
const missing = [];
const warnings = [];

for (const [key, hint] of Object.entries(required)) {
    const val = env[key];
    if (!val || val === "your-secret-here" || val.startsWith("your-")) {
        missing.push({ key, hint });
    } else if (key === "DATABASE_URL") {
        if (val.includes("5432") && val.includes("supabase")) {
            warnings.push(
                `DATABASE_URL uses port 5432. For Vercel, use the pooler (port 6543) to avoid connection issues.`,
            );
        }
    }
}

for (const [key, hint] of Object.entries(recommended)) {
    const val = env[key];
    if (!val?.trim()) {
        warnings.push(`Set ${key}: ${hint}`);
    }
}

console.log("\n📋 Environment check\n");

if (missing.length) {
    console.log("❌ Missing required variables:\n");
    missing.forEach(({ key, hint }) => console.log(`   ${key}\n     → ${hint}\n`));
    console.log("   Add these to .env (local) or Vercel Project Settings → Environment Variables.\n");
}

if (warnings.length) {
    console.log("⚠️  Warnings:\n");
    warnings.forEach((w) => console.log(`   ${w}\n`));
}

const optionalMissing = Object.keys(optional).filter(
    (k) => !env[k] || env[k].startsWith("your-"),
);
if (optionalMissing.length && missing.length === 0) {
    console.log("ℹ️  Optional (for full features):\n");
    optionalMissing.forEach((k) => console.log(`   ${k} – ${optional[k]}\n`));
}

if (missing.length === 0 && warnings.length === 0) {
    console.log("✅ Required environment variables are set.\n");
}

if (missing.length === 0 && warnings.length === 0) {
    console.log("Run 'pnpm db:push' then 'pnpm db:seed' to sync the database.\n");
}

process.exit(missing.length > 0 ? 1 : 0);
