#!/usr/bin/env node
// Checks the admin SEO tab's Search Console snapshot (docs/seo-snapshot.md) before the daily run commits and pushes it.
//   node scripts/seo-snapshot.mjs                    check data/seo/snapshot.json
//   node scripts/seo-snapshot.mjs path/to/file.json  check another file
//   --quiet                                          print nothing when it passes
// Exit 0 = valid (warnings are printed but do not fail), 1 = errors (the tab would show its empty state), 2 = cannot read.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateSnapshot, summarize } from '../lib/seo/snapshotSchema.mjs';

const args = process.argv.slice(2), quiet = args.includes('--quiet');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = args.find(a => !a.startsWith('--')) || path.join(root, 'data/seo/snapshot.json');

let data;
try { data = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error(`seo-snapshot: cannot read ${file}: ${e.message}`); process.exit(2); }

const { errors, warnings } = validateSnapshot(data);
for (const w of warnings) console.warn('warning: ' + w);
if (errors.length) {
  for (const e of errors) console.error('error: ' + e);
  console.error(`seo-snapshot: ${errors.length} error(s) in ${path.relative(process.cwd(), file) || file}`);
  process.exit(1);
}
if (!quiet) {
  console.log(`seo-snapshot: OK (as of ${data.asOf}, Google data through ${data.gscDataThrough}, ${data.history.length} history rows, ${data.workLog.length} work-log entries)`);
  for (const l of summarize(data)) console.log('  ' + l);
}
