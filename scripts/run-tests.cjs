#!/usr/bin/env node
// Test runner (Nov 10 2026): `npm test` and `npm run test:quiet` both land here. Prints only failures and a summary.
// Discovers tests/*.cjs + tests/*.mjs (plus manifest `extra`), minus manifest `skip` and tests/quarantine.json. Each
// test runs as `node -r scripts/test-ts-cache.cjs [flags] <file>` (on-disk TypeScript transpile cache) in a pool; a
// failure is retried once alone and reported as "flaky" if it then passes. Manifest `serial` tests run one at a time
// after the pool. Slowest tests start first (timings kept in node_modules/.cache/fi-test-times.json).
//   npm run test:quiet                       whole suite, 3 at a time
//   npm run test:quiet -- town zip           only tests whose path contains "town" or "zip" (same as --only town --only zip)
//   npm run test:quiet -- --jobs 6           pool size (default 3, or TEST_JOBS)
//   npm run test:quiet -- --core             only the set the old hand-kept npm test chain ran
//   npm run test:quiet -- --list             print the selected tests and exit
//   npm run test:quiet -- --quarantined      run only the quarantined tests (triage)
//   --tail 60 (failure lines shown, default 25)  --timeout 300 (seconds per test, default 240)  --no-retry  --no-cache
'use strict';
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const opt = (name, dflt) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, 2); return v; };
const onlyList = []; for (let i; (i = args.indexOf('--only')) >= 0;) { onlyList.push(args[i + 1]); args.splice(i, 2); }
const jobs = Math.max(1, Number(opt('--jobs', process.env.TEST_JOBS || 3)));
const tail = Math.max(1, Number(opt('--tail', 25)));
const timeoutS = Math.max(1, Number(opt('--timeout', 240)));
const list = flag('--list'), coreOnly = flag('--core'), quarantinedOnly = flag('--quarantined');
const noRetry = flag('--no-retry'), noCache = flag('--no-cache'), json = opt('--json', null);
const filters = [...onlyList, ...args.filter(a => !a.startsWith('--'))];

const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')); } catch { return d; } };
const manifest = readJson('tests/manifest.json', {});
const quarantine = readJson('tests/quarantine.json', {});
delete quarantine._doc;
const skip = manifest.skip || {}, flags = manifest.flags || {}, envs = manifest.env || {}, uncached = manifest.noCache || {}, serialSet = new Set(manifest.serial || []);
const found = fs.readdirSync(path.join(root, 'tests')).filter(f => /\.(c|m)js$/.test(f)).sort().map(f => 'tests/' + f);
const all = [...found, ...(manifest.extra || [])].filter(f => !skip[f]);
// Core = the files the package.json test script names (`node [--flags] tests/x.cjs`), i.e. the old hand-kept chain.
const chain = (readJson('package.json', {}).scripts || {}).test || '';
const core = [...chain.matchAll(/node\s+(?:--[\w-]+\s+)*((?:tests|scripts)\/[\w.\/-]+\.[cm]?js)/g)].map(m => m[1]).filter(f => f !== 'scripts/run-tests.cjs');
for (const f of core) if (!all.includes(f) && !skip[f] && fs.existsSync(path.join(root, f))) all.push(f);
let pool = coreOnly ? core.filter(f => all.includes(f)) : all;
// CI=true (GitHub Actions): drop manifest `ciSkip` tests (they need something a hosted runner lacks; reason per entry).
const ciSkip = process.env.CI === 'true' ? (manifest.ciSkip || {}) : {}, ciCount = pool.filter(f => ciSkip[f]).length;
pool = pool.filter(f => !ciSkip[f]);
if (ciCount) console.log(`CI=true: ${ciCount} tests skipped (tests/manifest.json ciSkip).`);
const qCount = pool.filter(f => quarantine[f]).length;
pool = quarantinedOnly ? pool.filter(f => quarantine[f]) : pool.filter(f => !quarantine[f]);
if (filters.length) pool = pool.filter(f => filters.some(s => f.includes(s)));
const cmdOf = f => [...Object.entries(envs[f] || {}).map(([k, v]) => `${k}=${v}`), 'node', ...(flags[f] || []), f].join(' ');
if (list) { for (const f of pool) console.log(cmdOf(f) + (serialSet.has(f) ? '   [serial]' : '')); console.log(`${pool.length} tests (${qCount} quarantined not listed)`); process.exit(0); }
if (!pool.length) { console.log(`No test matches ${filters.join(', ') || '(selection)'}.`); process.exit(1); }

const timesFile = path.join(root, 'node_modules', '.cache', 'fi-test-times.json');
const times = (() => { try { return JSON.parse(fs.readFileSync(timesFile, 'utf8')); } catch { return {}; } })();
const byTime = (a, b) => (times[b] || 1) - (times[a] || 1);
const parallel = pool.filter(f => !serialSet.has(f)).sort(byTime), serial = pool.filter(f => serialSet.has(f));
const cache = path.join(__dirname, 'test-ts-cache.cjs');
const live = new Set();

function run(f) {
  return new Promise(resolve => {
    const t0 = Date.now(), out = [];
    const off = noCache || !!uncached[f];
    const argv = [...(off ? [] : ['-r', cache]), ...(flags[f] || []), f];
    const p = spawn(process.execPath, argv, { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0', ...(off ? { FI_TS_CACHE: '0' } : {}), ...(envs[f] || {}) } });
    live.add(p);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; try { process.kill(-p.pid, 'SIGKILL'); } catch {} }, timeoutS * 1000);
    p.stdout.on('data', d => out.push(d)); p.stderr.on('data', d => out.push(d));
    p.on('close', (code, sig) => {
      clearTimeout(timer); live.delete(p);
      try { process.kill(-p.pid, 'SIGKILL'); } catch {} // stray children (browsers, servers) die with their test
      const secs = (Date.now() - t0) / 1000;
      const lines = Buffer.concat(out).toString().replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter(l => l.trim());
      if (timedOut) lines.push(`[runner] killed after ${timeoutS}s timeout`);
      resolve({ f, code: timedOut ? 'timeout' : code ?? sig, ok: code === 0 && !timedOut, secs, lines: lines.slice(-tail) });
    });
  });
}
const kill = () => { for (const p of live) try { process.kill(-p.pid, 'SIGKILL'); } catch {} process.exit(130); };
process.on('SIGINT', kill); process.on('SIGTERM', kill);

(async () => {
  const started = Date.now(), results = new Map();
  let next = 0;
  const record = r => { results.set(r.f, r); times[r.f] = Math.round(r.secs * 10) / 10; if (!r.ok) console.log(`FAIL ${cmdOf(r.f)} (exit ${r.code}) — will retry alone`); };
  async function worker() { while (next < parallel.length) record(await run(parallel[next++])); }
  await Promise.all(Array.from({ length: Math.min(jobs, parallel.length) }, worker));
  for (const f of serial) record(await run(f));
  const flaky = [], failed = [];
  for (const r of [...results.values()].filter(r => !r.ok)) {
    const again = noRetry ? r : await run(r.f);
    if (again.ok) { flaky.push(r); console.log(`FLAKY ${cmdOf(r.f)} failed in the pool, passed alone (${again.secs.toFixed(1)}s)`); }
    else { failed.push(again); console.log(`FAIL ${cmdOf(r.f)} (exit ${again.code}) again alone`); }
  }
  try { fs.mkdirSync(path.dirname(timesFile), { recursive: true }); fs.writeFileSync(timesFile, JSON.stringify(times)); } catch {}
  for (const f of failed) console.log(`\n── ${cmdOf(f.f)} (exit ${f.code}, ${f.secs.toFixed(1)}s), last ${f.lines.length} lines:\n${f.lines.join('\n')}`);
  for (const f of flaky) console.log(`\n── flaky ${cmdOf(f.f)} (pool run exit ${f.code}), last ${Math.min(8, f.lines.length)} lines:\n${f.lines.slice(-8).join('\n')}`);
  const fx = path.join(root, 'tests/fixtures/live-match-summary.json'), want = 'ca9034feb4dd50e75c85dc2c7e07151d';
  let md5 = 'missing'; try { md5 = crypto.createHash('md5').update(fs.readFileSync(fx)).digest('hex'); } catch {}
  console.log(`\nfixture md5 tests/fixtures/live-match-summary.json: ${md5} ${md5 === want ? '(expected, OK)' : `(EXPECTED ${want})`}`);
  if (!quarantinedOnly && qCount) console.log(`${qCount} quarantined tests skipped (tests/quarantine.json; run them with --quarantined).`);
  const secs = Math.round((Date.now() - started) / 1000), done = results.size;
  console.log(`${done - failed.length}/${done} passed in ${secs}s (jobs ${jobs})${flaky.length ? `; ${flaky.length} flaky: ${flaky.map(f => f.f.replace(/^tests\//, '')).join(', ')}` : ''}${failed.length ? `; ${failed.length} failed: ${failed.map(f => f.f.replace(/^tests\//, '')).join(', ')}` : '.'}`);
  if (json) fs.writeFileSync(json, JSON.stringify([...results.values()].map(r => ({ f: r.f, ok: r.ok, code: r.code, secs: r.secs, retryFailed: failed.some(x => x.f === r.f), lines: r.ok ? [] : r.lines }))));
  process.exit(failed.length || md5 !== want ? 1 : 0);
})();
