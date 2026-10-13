/**
 * Generates every raster icon the site needs from the one mark defined in
 * src/app/icon.svg.
 *
 * Run with `node scripts/generate-icons.mjs` after changing the geometry
 * below. It is deliberately not wired into `build` — the outputs are
 * committed, so a deploy does not depend on sharp being installable in
 * the build image, and the icons cannot silently change under a
 * dependency bump.
 *
 * WHY THE GEOMETRY IS REPEATED HERE rather than read out of icon.svg:
 * the favicon's F sits at one scale and the maskable and Apple cuts sit
 * at two others, so there is no single path to share. What is shared is
 * the construction — see `markPath` — and each output states its own
 * inset. Rendering with inline fills rather than icon.svg's <style>
 * block, because librsvg inside sharp does not reliably apply CSS
 * selectors and would hand back an unfilled mark.
 */

import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const INK = "#0A0A0A";
const PAPER = "#FFFFFF";

/**
 * The F from icon.svg, as one closed polygon on a 32-unit grid, scaled to
 * occupy `size` units and centred in a `canvas`-unit square.
 *
 * The source box is x 8..25, y 6..26 — 17 wide by 20 tall. It is scaled
 * on the taller axis so the letter's height is what `size` controls, and
 * the extra horizontal slack is split evenly; an F is visually
 * left-heavy, so centring its bounding box rather than its mass is the
 * correct call at these pixel sizes.
 */
function markPath(canvas, size) {
    const SRC = { x: 8, y: 6, w: 17, h: 20 };
    const scale = size / SRC.h;
    const offsetX = (canvas - SRC.w * scale) / 2;
    const offsetY = (canvas - size) / 2;

    const points = [
        [8, 6],
        [25, 6],
        [25, 12],
        [14, 12],
        [14, 15],
        [22, 15],
        [22, 20],
        [14, 20],
        [14, 26],
        [8, 26],
    ];

    const d = points
        .map(([x, y], index) => {
            const px = (offsetX + (x - SRC.x) * scale).toFixed(3);
            const py = (offsetY + (y - SRC.y) * scale).toFixed(3);
            return `${index === 0 ? "M" : "L"}${px} ${py}`;
        })
        .join("");

    return `${d}Z`;
}

/**
 * `inset` is the fraction of the canvas left clear above and below the
 * letter. The favicon cut runs tight because a tab strip renders it at
 * 16px and margin is the first thing that costs legibility; the maskable
 * cut runs loose because a launcher may crop it to a circle.
 */
function chip(canvas, inset, { ground = INK, mark = PAPER } = {}) {
    const size = canvas * (1 - inset * 2);
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">` +
            `<rect width="${canvas}" height="${canvas}" fill="${ground}"/>` +
            `<path d="${markPath(canvas, size)}" fill="${mark}"/>` +
            `</svg>`,
    );
}

/**
 * Every cut is drawn once at MASTER units and resampled down to the size
 * actually wanted.
 *
 * The geometry is proportional, so one master serves all of them — and
 * going through a downsample is what gives the 16px favicon its
 * antialiasing. Rasterising the SVG at 16 units directly produced a
 * harsh, half-pixel-snapped F.
 *
 * NOT `sharp(svg, { density })`: density scales an SVG render relative to
 * 72dpi against the width the markup declares, so a 48-unit chip at
 * density 384 silently came out 256px square. The .ico assembled from
 * those had directory entries claiming 48 and payloads that were 256,
 * which is a malformed file — Turbopack refused to decode it and the
 * build failed outright. Resizing explicitly makes the output size a
 * fact rather than an inference.
 */
const MASTER = 1024;

const png = (canvas, inset, options) =>
    sharp(chip(MASTER, inset, options))
        .resize(canvas, canvas, { kernel: "lanczos3" })
        .png({ compressionLevel: 9 })
        .toBuffer();

/**
 * Assembles a multi-resolution .ico around already-encoded PNGs.
 *
 * PNG-compressed ICO entries are read by every browser still in use and
 * by Windows Vista onward, and they keep the file a tenth of the size
 * the equivalent BMP entries would be. 16/32/48 is the set that actually
 * gets requested: the tab, the bookmark bar and HiDPI, and the Windows
 * shortcut respectively.
 */
function ico(images) {
    const HEADER = 6;
    const ENTRY = 16;
    const header = Buffer.alloc(HEADER);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // 1 = icon
    header.writeUInt16LE(images.length, 4);

    let offset = HEADER + ENTRY * images.length;
    const directory = images.map(({ size, data }) => {
        const entry = Buffer.alloc(ENTRY);
        entry.writeUInt8(size >= 256 ? 0 : size, 0); // 0 encodes 256
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt8(0, 2); // palette size, 0 for truecolour
        entry.writeUInt8(0, 3); // reserved
        entry.writeUInt16LE(1, 4); // colour planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += data.length;
        return entry;
    });

    return Buffer.concat([header, ...directory, ...images.map((image) => image.data)]);
}

const FAVICON_INSET = 0.1875; // 6/32, the geometry in icon.svg
const MASKABLE_INSET = 0.28; // keeps the letter inside the 80% safe circle
const APPLE_INSET = 0.22; // iOS rounds the corners off this itself

async function main() {
    await mkdir(path.join(ROOT, "public"), { recursive: true });

    const icoSizes = [16, 32, 48];
    const icoImages = await Promise.all(
        icoSizes.map(async (size) => ({ size, data: await png(size, FAVICON_INSET) })),
    );

    const outputs = [
        ["src/app/favicon.ico", ico(icoImages)],
        ["src/app/apple-icon.png", await png(180, APPLE_INSET)],
        ["public/icon-192.png", await png(192, FAVICON_INSET)],
        ["public/icon-512.png", await png(512, FAVICON_INSET)],
        ["public/icon-maskable-512.png", await png(512, MASKABLE_INSET)],
    ];

    for (const [relative, data] of outputs) {
        const destination = path.join(ROOT, relative);
        await writeFile(destination, data);
        console.log(`${relative.padEnd(30)} ${String(data.length).padStart(7)} bytes`);
    }
}

await main();
