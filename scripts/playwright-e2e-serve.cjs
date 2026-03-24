/**
 * Playwright webServer entry: merges `.playwright/e2e-runtime.env` (written by
 * globalSetup after Docker/DB URL resolution) into process.env, then `next build` + `next start`.
 * Playwright's config is evaluated before globalSetup, so DATABASE_URL cannot live in playwright.config.ts alone.
 */
const { execSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

const envPath = path.join(root, ".playwright", "e2e-runtime.env");

if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq < 1) continue;
        const key = t.slice(0, eq).trim();
        let val = t.slice(eq + 1).trim();
        if (
            (val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith('"') && val.endsWith('"'))
        ) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
}

if (!fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
    execSync("pnpm exec next build", { cwd: root, stdio: "inherit", env: process.env });
}

process.env.PORT = process.env.PORT || "3001";
const result = spawnSync("pnpm", ["exec", "next", "start"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
});
process.exit(result.status ?? 1);
