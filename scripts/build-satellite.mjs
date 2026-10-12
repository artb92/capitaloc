// Builds public/satellite/{z}/{x}/{y}.webp: cloud-free satellite tiles for the "satellite"
// base map, self-hosted like the relief so the map never waits on a remote server.
// Source: NASA Blue Marble (shaded relief + bathymetry, public domain), as Web Mercator
// JPEG tiles packaged on npm by FreeTiler (@freetiler/nasa-bluemarble).
// Run: pnpm data:satellite
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const MAX_Z = 6;
const TARBALL =
  "https://registry.npmjs.org/@freetiler/nasa-bluemarble/-/nasa-bluemarble-1.0.17.tgz";
const OUT = new URL("../public/satellite/", import.meta.url).pathname;

const work = mkdtempSync(join(tmpdir(), "capitaloc-bluemarble-"));
console.log("Downloading Blue Marble tiles (~120 MB)…");
const res = await fetch(TARBALL);
if (!res.ok) throw new Error(`HTTP ${res.status} for ${TARBALL}`);
writeFileSync(join(work, "bm.tgz"), Buffer.from(await res.arrayBuffer()));
// Only the tiles, and only the zooms we serve.
const wanted = Array.from({ length: MAX_Z + 1 }, (_, z) => `package/tiles/${z}`);
execFileSync("tar", ["xzf", "bm.tgz", ...wanted], { cwd: work });

rmSync(OUT, { recursive: true, force: true });
for (let z = 0; z <= MAX_Z; z++) {
  let bytes = 0;
  let count = 0;
  const zDir = join(work, "package/tiles", String(z));
  for (const x of readdirSync(zDir)) {
    mkdirSync(join(OUT, `${z}/${x}`), { recursive: true });
    for (const file of readdirSync(join(zDir, x))) {
      const buf = await sharp(join(zDir, x, file))
        .webp({ quality: 72 })
        .toBuffer();
      writeFileSync(join(OUT, `${z}/${x}/${file.replace(/\.jpe?g$/, ".webp")}`), buf);
      bytes += buf.length;
      count++;
    }
  }
  console.log(`z${z}: ${count} tiles, ${Math.round(bytes / 1024)} kB`);
}
rmSync(work, { recursive: true, force: true });
