// World in Numbers — a best-national-statistics-site-20261126-0539 entry (Node 22, standard library only).
// Verified 2026-11-27: running main.ts twice writes byte-identical /output.
//
// The site is this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step). Its content is its own files:
// 24 countries and 12 indicators from the World Bank, held in app/data.js.
// Nothing it runs, styles or shows loads over the network.
// This program hands the site in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge
// reads (the screenshots, the first load's files and bytes, and the source),
// with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it
// is: the scorer requires dossier.json to be byte for byte what its own copy
// writes.
//
// Serve it locally with any static server pointed at app/, then open index.html.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
