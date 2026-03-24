import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Merge `.playwright/e2e-runtime.env` into `process.env` when present (Playwright e2e).
 * Ensures `DATABASE_URL` reaches Next even when the dev server subprocess drops env vars.
 */
export function loadPlaywrightRuntimeEnvFile(): void {
    if (process.env.VERCEL === "1") return;
    const file = path.join(process.cwd(), ".playwright", "e2e-runtime.env");
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, "utf8").split("\n")) {
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
        const cur = process.env[key];
        if (cur === undefined || cur === "") {
            process.env[key] = val;
        }
    }
}
