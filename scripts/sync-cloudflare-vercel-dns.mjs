#!/usr/bin/env node
/**
 * Point Cloudflare DNS at Vercel for this site (A records).
 *
 * Prerequisites:
 *   - Domain on Cloudflare (current NS: Cloudflare).
 *   - API token with Zone → DNS → Edit on the zone (and Zone → Zone → Read to resolve zone id).
 *   - Optional: Zone → Zone Settings → Edit (to set SSL mode to strict via API).
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... node scripts/sync-cloudflare-vercel-dns.mjs
 *   CLOUDFLARE_ZONE_ID=... CLOUDFLARE_API_TOKEN=... node scripts/sync-cloudflare-vercel-dns.mjs
 *
 * Loads CLOUDFLARE_* from .env.local then .env if unset (simple KEY=value lines).
 *
 * Optional env:
 *   VERCEL_A_RECORD_IP — default 76.76.21.21 (must match Vercel → Domains for your project)
 *   DNS_PROXIED — "true" | "false" (default true = orange cloud)
 *   CLOUDFLARE_SET_SSL_STRICT — "false" to skip PATCH ssl=strict (default: attempt)
 */

import fs from "node:fs";
import path from "node:path";

const ZONE_NAME = "sierrastrengthsupplements.com";
const VERCEL_IPV4 = process.env.VERCEL_A_RECORD_IP || "76.76.21.21";
const PROXIED = process.env.DNS_PROXIED !== "false";
const TRY_SSL_STRICT = process.env.CLOUDFLARE_SET_SSL_STRICT !== "false";

function loadDotEnvFiles() {
  const root = process.cwd();
  for (const file of [".env.local", ".env"]) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadDotEnvFiles();

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneIdEnv = process.env.CLOUDFLARE_ZONE_ID?.trim();

if (!token) {
  console.error(`
Missing CLOUDFLARE_API_TOKEN.

Create a token at https://dash.cloudflare.com/profile/api-tokens
with: Zone → DNS → Edit (and Zone → Zone → Read), scoped to ${ZONE_NAME}.

Then run:
  CLOUDFLARE_API_TOKEN=your_token pnpm dns:cloudflare-vercel
`);
  process.exit(1);
}

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = body.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(msg);
  }
  return body;
}

async function resolveZoneId() {
  if (zoneIdEnv) return zoneIdEnv;
  const body = await cf(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
  const z = body.result?.[0];
  if (!z?.id) {
    throw new Error(`No Cloudflare zone found for ${ZONE_NAME}. Set CLOUDFLARE_ZONE_ID if the zone name differs.`);
  }
  return z.id;
}

async function listA(zoneId, name) {
  const q = new URLSearchParams({ type: "A", name });
  const body = await cf(`/zones/${zoneId}/dns_records?${q}`);
  return body.result || [];
}

async function setSslStrict(zoneId) {
  if (!TRY_SSL_STRICT) return;
  try {
    await cf(`/zones/${zoneId}/settings/ssl`, {
      method: "PATCH",
      body: JSON.stringify({ value: "strict" }),
    });
    console.log("Set zone SSL mode → strict (Full strict).");
  } catch (e) {
    console.warn(
      `Could not set SSL mode via API (${e.message}). Set Cloudflare → SSL/TLS → Full (strict) manually. Token may need Zone Settings → Edit.`,
    );
  }
}

async function upsertA(zoneId, recordName, content) {
  const existing = await listA(zoneId, recordName);
  const payload = {
    type: "A",
    name: recordName,
    content,
    ttl: 1,
    proxied: PROXIED,
  };

  if (existing.length === 0) {
    await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`Created A  ${recordName} → ${content} (proxied=${PROXIED})`);
    return;
  }

  const [primary, ...dupes] = existing;
  const needsUpdate =
    primary.content !== content || primary.proxied !== PROXIED || primary.ttl !== 1;
  if (needsUpdate) {
    await cf(`/zones/${zoneId}/dns_records/${primary.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    console.log(`Updated A  ${recordName} → ${content} (proxied=${PROXIED})`);
  } else {
    console.log(`OK      A  ${recordName} → ${content} (proxied=${PROXIED})`);
  }

  for (const rec of dupes) {
    await cf(`/zones/${zoneId}/dns_records/${rec.id}`, { method: "DELETE" });
    console.log(`Removed duplicate A for ${recordName} (${rec.id})`);
  }
}

async function main() {
  const zoneId = await resolveZoneId();
  console.log(`Zone ${ZONE_NAME} (${zoneId})\n`);

  await setSslStrict(zoneId);
  await upsertA(zoneId, ZONE_NAME, VERCEL_IPV4);
  await upsertA(zoneId, `www.${ZONE_NAME}`, VERCEL_IPV4);

  console.log(`
Done. If proxied=false, DNS points straight at Vercel (avoids Cloudflare 525 while certs settle).

Vercel will verify the domain within a few minutes. Redeploy if you changed env vars:
  vercel deploy --prod --scope troy-hills-projects --yes
`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
