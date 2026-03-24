import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

export default async function globalTeardown() {
    const root = path.resolve(__dirname, "..");
    const marker = path.join(root, ".playwright", "e2e-docker-started");
    const runtimeEnv = path.join(root, ".playwright", "e2e-runtime.env");

    if (existsSync(marker)) {
        try {
            execSync("docker compose -f docker-compose.e2e.yml down -v", {
                cwd: root,
                stdio: "inherit",
            });
        } catch {
            /* best-effort */
        }
        unlinkSync(marker);
    }

    if (existsSync(runtimeEnv)) {
        try {
            unlinkSync(runtimeEnv);
        } catch {
            /* best-effort */
        }
    }
}
