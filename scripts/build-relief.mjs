// Builds public/relief/{z}/{x}/{y}.webp: shaded-relief raster tiles for the base map, so the
// map never waits on a remote tile server. Land only: the sea and lakes are drawn on top from
// Natural Earth vectors, so coasts match the country shapes exactly.
// Source: AWS Open Data "Terrain Tiles" (Mapzen terrarium encoding), downloaded once at MAX_Z
// and averaged down for the lower zooms.
// Run: pnpm data:relief
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const MAX_Z = 6;
const TILE = 256;
const SRC = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium";
const CACHE = join(tmpdir(), "capitaloc-terrarium");
const OUT = new URL("../public/relief/", import.meta.url).pathname;

/** Hypsometric tints, muted: lowland green, dry plateaus, rock, snow. [elevation m, r, g, b] */
const RAMP = [
  [0, 169, 191, 143],
  [300, 195, 204, 152],
  [800, 221, 211, 166],
  [1500, 205, 180, 135],
  [2500, 179, 154, 124],
  [4000, 200, 190, 178],
  [5500, 236, 232, 226],
];

const fetchTile = async (x, y) => {
  const file = join(CACHE, `${MAX_Z}-${x}-${y}.png`);
  try {
    return readFileSync(file);
  } catch {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(`${SRC}/${MAX_Z}/${x}/${y}.png`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(file, buf);
        return buf;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }
};

/** Downloads every MAX_Z tile into one elevation mosaic (metres, sea floor clamped to 0). */
const loadMosaic = async () => {
  mkdirSync(CACHE, { recursive: true });
  const n = 2 ** MAX_Z;
  const size = n * TILE;
  const elev = new Float32Array(size * size);
  const jobs = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) jobs.push([x, y]);
  let done = 0;
  const worker = async () => {
    for (let job = jobs.pop(); job; job = jobs.pop()) {
      const [x, y] = job;
      const { data, info } = await sharp(await fetchTile(x, y))
        .raw()
        .toBuffer({ resolveWithObject: true });
      for (let py = 0; py < TILE; py++) {
        for (let px = 0; px < TILE; px++) {
          const i = (py * TILE + px) * info.channels;
          const e = data[i] * 256 + data[i + 1] + data[i + 2] / 256 - 32768;
          elev[(y * TILE + py) * size + x * TILE + px] = Math.max(0, e);
        }
      }
      if (++done % 128 === 0) console.log(`  ${done}/${n * n} source tiles`);
    }
  };
  await Promise.all(Array.from({ length: 16 }, worker));
  return { elev, size };
};

/** Halves a square mosaic by averaging 2x2 blocks. */
const downsample = ({ elev, size }) => {
  const half = size / 2;
  const out = new Float32Array(half * half);
  for (let y = 0; y < half; y++) {
    for (let x = 0; x < half; x++) {
      const i = 2 * y * size + 2 * x;
      out[y * half + x] = (elev[i] + elev[i + 1] + elev[i + size] + elev[i + size + 1]) / 4;
    }
  }
  return { elev: out, size: half };
};

const tint = (e) => {
  for (let k = 1; k < RAMP.length; k++) {
    if (e <= RAMP[k][0]) {
      const [e0, ...c0] = RAMP[k - 1];
      const [e1, ...c1] = RAMP[k];
      const t = (e - e0) / (e1 - e0);
      return c0.map((c, j) => c + (c1[j] - c) * t);
    }
  }
  return RAMP.at(-1).slice(1);
};

/** Colours and hill-shades one zoom level, then cuts it into tiles. */
const renderZoom = async (z, { elev, size }) => {
  const rgb = Buffer.alloc(size * size * 3);
  const metresPerPixel = 40075016 / size;
  // Slopes flatten as pixels grow, so low zooms get more vertical exaggeration.
  const exaggeration = 4 * 1.6 ** (MAX_Z - z);
  // Sun from the north-west, 45° up (the cartographic convention).
  const az = (315 * Math.PI) / 180;
  const alt = Math.PI / 4;
  const [sx, sy, sz] = [Math.sin(az) * Math.cos(alt), Math.cos(az) * Math.cos(alt), Math.sin(alt)];
  for (let y = 0; y < size; y++) {
    // Mercator pixels shrink towards the poles.
    const lat = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 0.5)) / size)));
    const scale = exaggeration / (2 * metresPerPixel * Math.cos(lat));
    const up = Math.max(0, y - 1) * size;
    const down = Math.min(size - 1, y + 1) * size;
    for (let x = 0; x < size; x++) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const row = y * size;
      const dx = (elev[row + right] - elev[row + left]) * scale;
      const dy = (elev[up + x] - elev[down + x]) * scale;
      // Lambert shading of the surface normal (-dx, -dy, 1), relative to flat ground.
      const shade = (-dx * sx - dy * sy + sz) / Math.hypot(dx, dy, 1) / sz;
      const light = Math.min(1.25, Math.max(0.45, 1 + 0.9 * (shade - 1)));
      const [r, g, b] = tint(elev[row + x]);
      const o = (row + x) * 3;
      rgb[o] = Math.min(255, r * light);
      rgb[o + 1] = Math.min(255, g * light);
      rgb[o + 2] = Math.min(255, b * light);
    }
  }
  const n = size / TILE;
  const tile = Buffer.alloc(TILE * TILE * 3);
  let bytes = 0;
  for (let x = 0; x < n; x++) {
    mkdirSync(join(OUT, `${z}/${x}`), { recursive: true });
    for (let y = 0; y < n; y++) {
      for (let row = 0; row < TILE; row++) {
        const from = ((y * TILE + row) * size + x * TILE) * 3;
        rgb.copy(tile, row * TILE * 3, from, from + TILE * 3);
      }
      const buf = await sharp(tile, { raw: { width: TILE, height: TILE, channels: 3 } })
        .webp({ quality: 78 })
        .toBuffer();
      writeFileSync(join(OUT, `${z}/${x}/${y}.webp`), buf);
      bytes += buf.length;
    }
  }
  console.log(`z${z}: ${n * n} tiles, ${Math.round(bytes / 1024)} kB`);
};

rmSync(OUT, { recursive: true, force: true });
console.log(`Downloading ${4 ** MAX_Z} terrain tiles at z${MAX_Z} (cached in ${CACHE})…`);
let level = await loadMosaic();
for (let z = MAX_Z; z >= 0; z--) {
  await renderZoom(z, level);
  if (z > 0) level = downsample(level);
}
