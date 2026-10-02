import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFileSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { encode } from "next-auth/jwt";
import pg from "pg";

// This test seeds and mutates its database. Refuse any non-local or shared DB.
const databaseUrl = process.env.SIERRA_CACHE_TEST_DATABASE_URL;
assert(
    databaseUrl,
    "Set SIERRA_CACHE_TEST_DATABASE_URL to an isolated local Postgres DB",
);
const parsed = new URL(databaseUrl);
assert(["127.0.0.1", "localhost"].includes(parsed.hostname));
assert.equal(parsed.pathname, "/sierra_cache_test");
const port = 3311;
const origin = `http://127.0.0.1:${port}`;
const secret = randomUUID() + randomUUID();
const email = "cache-admin@example.test";
const env = {
    ...process.env,
    // Prevent the existing Playwright helper from substituting a different DB.
    VERCEL: "1",
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: secret,
    NEXTAUTH_SECRET: secret,
    AUTH_URL: origin,
    NEXTAUTH_URL: origin,
    AUTH_TRUST_HOST: "true",
    ADMIN_EMAILS: email,
    SENTRY_AUTH_TOKEN: "",
    SENTRY_DSN: "",
    NEXT_PUBLIC_SENTRY_DSN: "",
};
const pool = new pg.Pool({ connectionString: databaseUrl });
let server;
const checks = [];
function pass(name, details = {}) {
    checks.push({ name, ...details });
    console.log(`PASS ${name}`);
}

try {
    await pool.query(
        "TRUNCATE testimonials, homepage_content, audit_logs RESTART IDENTITY",
    );
    await pool.query(
        "INSERT INTO testimonials (name, role, quote, published) VALUES ($1, $2, $3, true)",
        ["Initial client", "Client", "Cache test initial quote"],
    );
    const build = spawnSync("pnpm", ["build"], { env, stdio: "inherit" });
    assert.equal(build.status, 0, "Production build must succeed");
    server = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
        env,
        stdio: "inherit",
        detached: true,
    });
    for (let attempt = 0; ; attempt++) {
        try {
            const response = await fetch(origin);
            assert.equal(response.status, 200);
            await response.text();
            break;
        } catch (error) {
            if (attempt >= 50) throw error;
            await delay(200);
        }
    }
    const jwt = await encode({
        token: {
            email,
            sub: "cache-admin",
            name: "Cache test admin",
            isAdmin: true,
        },
        secret,
        salt: "authjs.session-token",
    });
    async function edit(path, method, body, authenticated = true) {
        const response = await fetch(origin + path, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(authenticated
                    ? { Cookie: `authjs.session-token=${jwt}` }
                    : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        return { status: response.status, body: await response.json() };
    }
    async function homepage() {
        const started = performance.now();
        const response = await fetch(origin);
        assert.equal(response.status, 200);
        const html = await response.text();
        return {
            html,
            cache: response.headers.get("x-nextjs-cache"),
            ms: Math.round(performance.now() - started),
        };
    }
    const warm = await homepage();
    assert.equal(warm.cache, "HIT");
    assert(warm.html.includes("Cache test initial quote"));
    pass("Warm homepage uses the full route cache", {
        cache: warm.cache,
        ms: warm.ms,
    });

    await pool.query(
        "INSERT INTO testimonials (name, role, quote, published) VALUES ($1, $2, $3, true)",
        ["Direct DB client", "Client", "Cache test direct database quote"],
    );
    assert(
        !(await homepage()).html.includes("Cache test direct database quote"),
    );
    pass("Database changes remain cached until invalidation");

    const created = await edit("/api/admin/testimonials", "POST", {
        name: "New client",
        role: "Client",
        quote: "Cache test created quote",
        published: true,
    });
    assert.equal(created.status, 201);
    const id = created.body.id;
    assert(Number.isInteger(id));
    const afterCreate = await homepage();
    assert(afterCreate.html.includes("Cache test created quote"));
    assert(afterCreate.html.includes("Cache test direct database quote"));
    pass(
        "Testimonial creation expires both data and HTML before the next visitor",
    );

    assert.equal(
        (
            await edit(`/api/admin/testimonials/${id}`, "PUT", {
                quote: "Cache test updated quote",
            })
        ).status,
        200,
    );
    assert((await homepage()).html.includes("Cache test updated quote"));
    assert(!(await homepage()).html.includes("Cache test created quote"));
    pass("Testimonial edits appear on the next request");
    assert.equal(
        (
            await edit(`/api/admin/testimonials/${id}`, "PUT", {
                published: false,
            })
        ).status,
        200,
    );
    assert(!(await homepage()).html.includes("Cache test updated quote"));
    pass("Unpublished testimonials disappear on the next request");
    assert.equal(
        (
            await edit(`/api/admin/testimonials/${id}`, "PUT", {
                published: true,
            })
        ).status,
        200,
    );
    assert((await homepage()).html.includes("Cache test updated quote"));
    assert.equal(
        (await edit(`/api/admin/testimonials/${id}`, "DELETE")).status,
        200,
    );
    assert(!(await homepage()).html.includes("Cache test updated quote"));
    pass("Republishing and deletion refresh the homepage");

    const current = await fetch(origin + "/api/admin/homepage-content", {
        headers: { Cookie: `authjs.session-token=${jwt}` },
    });
    assert.equal(current.status, 200);
    const content = await current.json();
    content.hero.primaryCtaLabel = "Cache test saved CTA";
    assert.equal(
        (await edit("/api/admin/homepage-content", "PUT", content)).status,
        200,
    );
    assert((await homepage()).html.includes("Cache test saved CTA"));
    pass("Homepage CMS save appears on the next request");

    assert.equal(
        (await edit("/api/admin/testimonials", "POST", {}, false)).status,
        401,
    );
    assert.equal(
        (await edit("/api/admin/testimonials", "POST", {})).status,
        400,
    );
    assert.equal(
        (
            await edit("/api/admin/testimonials/99999999", "PUT", {
                quote: "Missing",
            })
        ).status,
        404,
    );
    assert.equal((await homepage()).cache, "HIT");
    pass(
        "Unauthorized, invalid and missing-record writes leave the cache intact",
    );

    await pool.query(
        "ALTER TABLE testimonials RENAME TO testimonials_cache_test_hidden",
    );
    try {
        assert.equal(
            (
                await edit("/api/admin/testimonials", "POST", {
                    name: "Failed",
                    role: "Client",
                    quote: "Failed write",
                })
            ).status,
            500,
        );
        const retained = await homepage();
        assert.equal(retained.cache, "HIT");
        assert(retained.html.includes("Cache test saved CTA"));
        pass("Failed database writes retain the last successful cached page");
    } finally {
        await pool.query(
            "ALTER TABLE testimonials_cache_test_hidden RENAME TO testimonials",
        );
    }
    if (process.env.SIERRA_CACHE_TEST_REVALIDATION === "1") {
        const manifest = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8"));
        const seconds = manifest.routes["/"].initialRevalidateSeconds;
        assert.equal(seconds, 300);
        await pool.query("ALTER TABLE testimonials RENAME TO testimonials_cache_test_hidden");
        try {
            console.log(`Waiting ${seconds + 1}s for the real ISR refresh interval`);
            await delay((seconds + 1) * 1000);
            const stale = await homepage();
            assert.equal(stale.cache, "STALE");
            assert(stale.html.includes("Cache test saved CTA"));
            await delay(2000);
            const retained = await homepage();
            assert(retained.html.includes("Cache test saved CTA"));
            assert(retained.html.includes("Cache test direct database quote"));
            pass("Database read failure during timed refresh retains published content");
        } finally {
            await pool.query("ALTER TABLE testimonials_cache_test_hidden RENAME TO testimonials");
        }
    }
    if (process.env.SIERRA_CACHE_TEST_REPORT) {
        writeFileSync(
            process.env.SIERRA_CACHE_TEST_REPORT,
            JSON.stringify(
                {
                    checkedAt: new Date().toISOString(),
                    checks,
                },
                null,
                2,
            ) + "\n",
        );
    }
    console.log(`${checks.length} production-server cache checks passed`);
} finally {
    if (server?.pid) {
        process.kill(-server.pid, "SIGTERM");
        await once(server, "exit");
    }
    await pool.end();
}
