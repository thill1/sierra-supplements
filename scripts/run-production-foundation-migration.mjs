#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.production.local");
const fallbackEnvPath = path.join(root, ".env.__bak__");
const sqlPath = path.join(root, "docs/migrations/production-admin-foundation.sql");
const backupDir = path.resolve(root, "..", "production-db-backups");

function loadEnv(file) {
    const raw = fs.readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (!match) continue;
        const key = match[1].trim();
        let value = match[2].trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

function dbUrl() {
    loadEnv(envPath);
    if (
        !process.env.POSTGRES_URL_NON_POOLING &&
        !process.env.DATABASE_URL &&
        !process.env.POSTGRES_URL &&
        fs.existsSync(fallbackEnvPath)
    ) {
        loadEnv(fallbackEnvPath);
    }
    let url =
        process.env.POSTGRES_URL_NON_POOLING ||
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL;
    if (!url && process.env.POSTGRES_HOST && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD) {
        const user = encodeURIComponent(process.env.POSTGRES_USER);
        const password = encodeURIComponent(process.env.POSTGRES_PASSWORD);
        const host = process.env.POSTGRES_HOST;
        const database = encodeURIComponent(process.env.POSTGRES_DATABASE || "postgres");
        url = `postgresql://${user}:${password}@${host}/${database}`;
    }
    if (!url) {
        throw new Error("Missing production database URL in .env.production.local");
    }
    return url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");
}

function sslFor(url) {
    const lower = url.toLowerCase();
    const local = lower.includes("localhost") || lower.includes("127.0.0.1");
    return local ? undefined : { rejectUnauthorized: false };
}

async function connect() {
    const url = dbUrl();
    const client = new Client({ connectionString: url, ssl: sslFor(url) });
    await client.connect();
    return client;
}

const requiredTables = [
    "admin_users",
    "admin_app_settings",
    "audit_logs",
    "events",
    "homepage_content",
    "blog_posts",
    "products",
    "product_variants",
    "product_images",
    "inventory_movements",
    "orders",
    "order_items",
    "leads",
    "testimonials",
];

const requiredColumns = [
    ["products", "sku"],
    ["products", "stock_quantity"],
    ["products", "low_stock_threshold"],
    ["products", "status"],
    ["products", "primary_image_url"],
    ["products", "seo_title"],
    ["products", "seo_description"],
    ["products", "stripe_price_id"],
    ["orders", "payment_provider"],
    ["orders", "payment_session_id"],
    ["orders", "stripe_checkout_session_id"],
    ["inventory_movements", "variant_id"],
    ["order_items", "variant_id"],
    ["admin_app_settings", "customer_lead_auto_reply"],
    ["admin_app_settings", "customer_order_received_email"],
    ["admin_app_settings", "customer_order_paid_email"],
    ["admin_app_settings", "customer_order_packed_email"],
    ["admin_app_settings", "customer_order_fulfilled_email"],
    ["admin_app_settings", "customer_order_cancelled_email"],
    ["admin_app_settings", "customer_order_refunded_email"],
    ["admin_app_settings", "notify_email_cal_bookings"],
    ["admin_app_settings", "notify_email_low_stock"],
];

const backupTables = [
    "admin_users",
    "admin_app_settings",
    "audit_logs",
    "events",
    "homepage_content",
    "blog_posts",
    "products",
    "product_variants",
    "product_images",
    "inventory_movements",
    "orders",
    "order_items",
    "leads",
    "testimonials",
];

async function tableExists(client, table) {
    const res = await client.query(
        `select exists (
            select 1 from information_schema.tables
            where table_schema = 'public' and table_name = $1
        ) as exists`,
        [table],
    );
    return Boolean(res.rows[0]?.exists);
}

async function preflight(client) {
    const tables = await client.query(
        `select table_name from information_schema.tables
         where table_schema = 'public'
         order by table_name`,
    );
    const columns = await client.query(
        `select table_name, column_name
         from information_schema.columns
         where table_schema = 'public'
         order by table_name, ordinal_position`,
    );
    const indexes = await client.query(
        `select tablename, indexname from pg_indexes
         where schemaname = 'public'
         order by tablename, indexname`,
    );
    const constraints = await client.query(
        `select conname from pg_constraint
         where connamespace = 'public'::regnamespace
         order by conname`,
    );
    const rowCounts = {};
    for (const table of backupTables) {
        if (await tableExists(client, table)) {
            const count = await client.query(`select count(*)::int as count from "${table}"`);
            rowCounts[table] = count.rows[0].count;
        } else {
            rowCounts[table] = null;
        }
    }
    return {
        capturedAt: new Date().toISOString(),
        tables: tables.rows.map((r) => r.table_name),
        columns: columns.rows,
        indexes: indexes.rows,
        constraints: constraints.rows.map((r) => r.conname),
        rowCounts,
    };
}

async function backup(client) {
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const out = path.join(backupDir, `sierra-strength-prod-backup-${stamp}.json`);
    const manifest = {
        capturedAt: new Date().toISOString(),
        method: "node-pg-json-app-table-export",
        restoreNote:
            "Restore manually with INSERT/ON CONFLICT after inspecting schema, or use Supabase platform restore if a full database rollback is needed.",
        preflight: await preflight(client),
        tables: {},
    };

    for (const table of backupTables) {
        if (!(await tableExists(client, table))) {
            manifest.tables[table] = { exists: false, rows: [] };
            continue;
        }
        const res = await client.query(`select * from "${table}"`);
        manifest.tables[table] = { exists: true, rowCount: res.rowCount, rows: res.rows };
    }

    fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
    console.log(out);
    return out;
}

async function migrate(client) {
    const sql = fs.readFileSync(sqlPath, "utf8");
    await client.query(sql);
}

async function verify(client) {
    const report = await preflight(client);
    const tableSet = new Set(report.tables);
    const columnSet = new Set(report.columns.map((c) => `${c.table_name}.${c.column_name}`));

    const missingTables = requiredTables.filter((t) => !tableSet.has(t));
    const missingColumns = requiredColumns
        .filter(([table, column]) => !columnSet.has(`${table}.${column}`))
        .map(([table, column]) => `${table}.${column}`);

    const productVariants = tableSet.has("product_variants")
        ? await client.query(`
            select count(*)::int as missing
            from products p
            where not exists (
                select 1 from product_variants pv where pv.product_id = p.id
            )
        `)
        : { rows: [{ missing: null }] };

    const settingsRows = tableSet.has("admin_app_settings")
        ? await client.query(`select count(*)::int as count from admin_app_settings where id = 1`)
        : { rows: [{ count: 0 }] };

    const duplicatePayments = columnSet.has("orders.payment_provider") &&
        columnSet.has("orders.payment_session_id")
        ? await client.query(`
            select payment_provider, payment_session_id, count(*)::int as count
            from orders
            where payment_provider is not null and payment_session_id is not null
            group by payment_provider, payment_session_id
            having count(*) > 1
        `)
        : { rows: [] };

    return {
        capturedAt: new Date().toISOString(),
        missingTables,
        missingColumns,
        productRowsWithoutVariants: productVariants.rows[0]?.missing,
        adminSettingsSingletonRows: settingsRows.rows[0]?.count,
        duplicatePaymentSessions: duplicatePayments.rows,
        rowCounts: report.rowCounts,
        ok:
            missingTables.length === 0 &&
            missingColumns.length === 0 &&
            productVariants.rows[0]?.missing === 0 &&
            settingsRows.rows[0]?.count === 1 &&
            duplicatePayments.rows.length === 0,
    };
}

async function main() {
    const command = process.argv[2];
    if (!["backup", "preflight", "migrate", "verify"].includes(command)) {
        console.error("Usage: node scripts/run-production-foundation-migration.mjs <backup|preflight|migrate|verify>");
        process.exit(2);
    }
    const client = await connect();
    try {
        if (command === "backup") {
            await backup(client);
        } else if (command === "preflight") {
            console.log(JSON.stringify(await preflight(client), null, 2));
        } else if (command === "migrate") {
            await migrate(client);
            console.log("Migration applied.");
        } else if (command === "verify") {
            const result = await verify(client);
            console.log(JSON.stringify(result, null, 2));
            if (!result.ok) process.exit(1);
        }
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
