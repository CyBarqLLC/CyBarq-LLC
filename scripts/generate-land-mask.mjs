/**
 * Rebuilds src/components/brand/land-mask.ts: Natural Earth land (world-atlas
 * land-50m) rasterised to a one degree equirectangular grid, one bit per cell,
 * packed base64. The globe reads this to decide which lattice points carry a
 * Graphite blade (land) and which carry a CyBarq Blue one (sea).
 *
 *   npm i --no-save world-atlas@2 topojson-client
 *   node scripts/generate-land-mask.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as topojson from "topojson-client";

const W = 360;
const H = 180;
const topo = JSON.parse(readFileSync("node_modules/world-atlas/land-50m.json", "utf8"));
const land = topojson.feature(topo, topo.objects.land);

const rings = [];
const walk = (geom) => {
  if (!geom) return;
  if (geom.type === "Polygon") rings.push(...geom.coordinates);
  else if (geom.type === "MultiPolygon") for (const poly of geom.coordinates) rings.push(...poly);
  else if (geom.type === "GeometryCollection") geom.geometries.forEach(walk);
};
for (const f of land.features ?? [land]) walk(f.geometry ?? f);

const edges = [];
for (const ring of rings) {
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    if (y0 !== y1) edges.push([y0, y1, x0, x1]);
  }
}

const bits = new Uint8Array(Math.ceil((W * H) / 8));
for (let row = 0; row < H; row++) {
  const lat = 90 - (row + 0.5) * (180 / H);
  const xs = [];
  for (const [y0, y1, x0, x1] of edges) {
    if (lat >= Math.min(y0, y1) && lat < Math.max(y0, y1)) xs.push(x0 + ((lat - y0) / (y1 - y0)) * (x1 - x0));
  }
  xs.sort((a, b) => a - b);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const a = Math.ceil(((xs[k] + 180) / 360) * W - 0.5);
    const b = Math.floor(((xs[k + 1] + 180) / 360) * W - 0.5);
    for (let col = Math.max(0, a); col <= Math.min(W - 1, b); col++) {
      const idx = row * W + col;
      bits[idx >> 3] |= 1 << (idx & 7);
    }
  }
}

const b64 = Buffer.from(bits).toString("base64");
const chunks = [];
for (let i = 0; i < b64.length; i += 96) chunks.push(`  "${b64.slice(i, i + 96)}",`);
const file = readFileSync("src/components/brand/land-mask.ts", "utf8");
const next = file.replace(/const PACKED = \[[\s\S]*?\]\.join\(""\);/, `const PACKED = [\n${chunks.join("\n")}\n].join("");`);
writeFileSync("src/components/brand/land-mask.ts", next);
console.log(`land mask rebuilt: ${b64.length} base64 characters`);
