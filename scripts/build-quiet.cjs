#!/usr/bin/env node
// Quiet production build (Oct 15 2026): runs `next build` and prints only errors, warnings and a one-line result,
// instead of the full route table. Respects NEXT_DIST_DIR (agents: NEXT_DIST_DIR=.next-agent-<port>).
//   npm run build:quiet
//   npm run build:quiet -- --full   also print the route table
const { spawn } = require('child_process');
const path = require('path');
const full = process.argv.includes('--full'), t0 = Date.now(), out = [];
const p = spawn('npx', ['next', 'build'], { cwd: path.join(__dirname, '..'), env: { ...process.env, FORCE_COLOR: '0' } });
p.stdout.on('data', d => out.push(d)); p.stderr.on('data', d => out.push(d));
p.on('close', code => {
  const lines = Buffer.concat(out).toString().replace(/\x1b\[[0-9;]*m/g, '').split('\n');
  const route = lines.findIndex(l => /^Route \((app|pages)\)/.test(l));
  // Keep error/warning lines plus the few lines after each (file, location, message).
  const keep = new Set();
  lines.forEach((l, i) => { if (/error|warn|failed|Type error|Module not found|⚠|✖/i.test(l) && (route < 0 || i < route)) for (let k = i; k < Math.min(i + 6, lines.length); k++) keep.add(k); });
  const shown = [...keep].sort((a, b) => a - b).map(i => lines[i]).filter(l => l.trim());
  if (shown.length) console.log(shown.slice(0, 80).join('\n'));
  if (full && route >= 0) console.log(lines.slice(route).join('\n'));
  if (code !== 0 && !shown.length) console.log(lines.filter(l => l.trim()).slice(-40).join('\n'));
  console.log(`\nnext build ${code === 0 ? 'OK' : `FAILED (exit ${code})`} in ${Math.round((Date.now() - t0) / 1000)}s${process.env.NEXT_DIST_DIR ? ` → ${process.env.NEXT_DIST_DIR}` : ''}.`);
  process.exit(code);
});
