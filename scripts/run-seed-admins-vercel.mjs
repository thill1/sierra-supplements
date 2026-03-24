import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

function parseEnvFile(p) {
    const out = {};
    if (!fs.existsSync(p)) return out;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq < 1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

const pullPath = process.env.SEED_VERCEL_ENV_PULL;
if (!pullPath?.trim()) {
    console.error("SEED_VERCEL_ENV_PULL must point to vercel env pull output file.");
    process.exit(1);
}

const env = {
    ...process.env,
    ...parseEnvFile(pullPath),
    ...parseEnvFile(path.join(root, ".env")),
};

if (!env.DATABASE_URL?.trim()) {
    console.error(
        "Missing DATABASE_URL in .env (use your Supabase pooler URI for the same DB Vercel uses).",
    );
    process.exit(1);
}
if (!env.ADMIN_EMAILS?.trim()) {
    console.error("Missing ADMIN_EMAILS in Vercel Production pull file.");
    process.exit(1);
}

const r = spawnSync("pnpm", ["db:seed-admins"], {
    env,
    stdio: "inherit",
    cwd: root,
});
process.exit(r.status ?? 1);
