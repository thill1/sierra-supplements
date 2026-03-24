import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function resolvePlaywrightRuntimeEnvPath(): string | null {
    const roots = new Set<string>();
    const explicit = process.env.PLAYWRIGHT_PROJECT_ROOT?.trim();
    if (explicit) roots.add(path.resolve(explicit));
    roots.add(process.cwd());

    for (const root of roots) {
        const candidate = path.join(root, ".playwright", "e2e-runtime.env");
        if (existsSync(candidate)) return candidate;
    }

    let dir = process.cwd();
    for (let i = 0; i < 12; i++) {
        const candidate = path.join(dir, ".playwright", "e2e-runtime.env");
        if (existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

/**
 * Merge `.playwright/e2e-runtime.env` into `process.env` when present (Playwright e2e).
 * Walks up from `process.cwd()` because `next start` may not use the repo root as cwd.
 */
export function loadPlaywrightRuntimeEnvFile(): void {
    if (process.env.VERCEL === "1") return;
    const file = resolvePlaywrightRuntimeEnvPath();
    if (!file) return;
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
        if (
            key === "DATABASE_URL" ||
            cur === undefined ||
            cur === ""
        ) {
            process.env[key] = val;
        }
    }
}
