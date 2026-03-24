#!/usr/bin/env node
/**
 * Rasterize brand mountain (matches src/app/icon.svg) to:
 * - src/app/apple-icon.png (180×180, iOS home screen)
 * - src/app/favicon.ico (multi-size via png-to-ico)
 *
 * Run after changing icon.svg: pnpm icons:generate
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appDir = path.join(root, "src", "app");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <rect width="24" height="24" fill="#0C0F12"/>
  <path
    d="m8 3 4 8 5-5 5 15H2L8 3z"
    fill="none"
    stroke="#D97706"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

const svgBuf = Buffer.from(svg);

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sierra-icons-"));
  const png256 = path.join(tmpDir, "256.png");

  await sharp(svgBuf).resize(256, 256).png().toFile(png256);

  const icoBuf = await pngToIco(png256);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuf);

  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log("Wrote src/app/favicon.ico and src/app/apple-icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
