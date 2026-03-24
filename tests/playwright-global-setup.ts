import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import "../src/db/load-local-env";
import { mergeAdminEmailsForPlaywright } from "./e2e-constants";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const E2E_DB_URL_DOCKER =
    "postgresql://postgres:sierra_e2e@127.0.0.1:54329/sierra_e2e";
const E2E_PG_PORT = 54329;

function waitForTcpPort(port: number, timeoutMs = 45_000): Promise<void> {
    const host = "127.0.0.1";
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const attempt = () => {
            const socket = net.createConnection({ port, host }, () => {
                socket.end();
                resolve();
            });
            socket.on("error", () => {
                socket.destroy();
                if (Date.now() - start > timeoutMs) {
                    reject(
                        new Error(
                            `Timed out waiting for Postgres on ${host}:${port}`,
                        ),
                    );
                } else {
                    setTimeout(attempt, 400);
                }
            });
        };
        attempt();
    });
}

async function waitForPostgresAcceptsQueries(root: string): Promise<void> {
    const deadline = Date.now() + 90_000;
    let lastErr: unknown;
    while (Date.now() < deadline) {
        try {
            execSync(
                "docker compose -f docker-compose.e2e.yml exec -T postgres pg_isready -U postgres -d sierra_e2e",
                { cwd: root, stdio: "pipe" },
            );
            return;
        } catch (e) {
            lastErr = e;
            await sleep(400);
        }
    }
    throw lastErr ?? new Error("Postgres did not become ready in time");
}

async function tryStartDockerPostgres(root: string): Promise<boolean> {
    try {
        execSync("docker compose -f docker-compose.e2e.yml up -d", {
            cwd: root,
            stdio: "inherit",
        });
        await waitForTcpPort(E2E_PG_PORT);
        await waitForPostgresAcceptsQueries(root);
        return true;
    } catch {
        return false;
    }
}

async function runDrizzlePushWithRetries(
    root: string,
    env: NodeJS.ProcessEnv,
): Promise<void> {
    const max = 4;
    let lastErr: unknown;
    for (let i = 0; i < max; i++) {
        try {
            execSync("pnpm exec drizzle-kit push --force", {
                cwd: root,
                stdio: "inherit",
                env,
            });
            return;
        } catch (e) {
            lastErr = e;
            if (i < max - 1) {
                await sleep(2000);
            }
        }
    }
    throw lastErr;
}

function writeRuntimeEnv(root: string, databaseUrl: string) {
    mkdirSync(path.join(root, ".playwright"), { recursive: true });
    const escaped = databaseUrl.replace(/'/g, "'\\''");
    writeFileSync(
        path.join(root, ".playwright", "e2e-runtime.env"),
        `DATABASE_URL='${escaped}'\n`,
        "utf8",
    );
}

/**
 * Upsert schema + admin_users. Ensures `.playwright/e2e-runtime.env` exists so the
 * webServer script can source DATABASE_URL (global setup runs in a separate process).
 */
export default async function globalSetup() {
    const root = path.resolve(__dirname, "..");
    let databaseUrl = process.env.DATABASE_URL?.trim();
    let startedDocker = false;

    if (!databaseUrl) {
        if (await tryStartDockerPostgres(root)) {
            databaseUrl = E2E_DB_URL_DOCKER;
            startedDocker = true;
        } else {
            throw new Error(
                "[playwright globalSetup] No DATABASE_URL and Docker Postgres could not start. " +
                    "Set DATABASE_URL in .env or install/start Docker and retry.",
            );
        }
    }

    writeRuntimeEnv(root, databaseUrl);
    if (startedDocker) {
        writeFileSync(path.join(root, ".playwright", "e2e-docker-started"), "", "utf8");
    }

    const adminEmails = mergeAdminEmailsForPlaywright();
    const env = { ...process.env, DATABASE_URL: databaseUrl, ADMIN_EMAILS: adminEmails };

    await runDrizzlePushWithRetries(root, env);

    execSync("pnpm exec tsx src/db/seed-admins.ts", {
        cwd: root,
        stdio: "inherit",
        env,
    });
}
