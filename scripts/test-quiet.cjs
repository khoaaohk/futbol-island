#!/usr/bin/env node
// Quiet test runner (Oct 15 2026): runs every command in the `npm test` script but prints only failures, so agents
// read a few lines instead of the whole suite's output. Unlike `npm test` (a && chain) it keeps going past a failure
// and lists them all.
//   npm run test:quiet                  run the whole suite, one test at a time
//   npm run test:quiet -- fishing zip   only tests whose command contains "fishing" or "zip"
//   npm run test:quiet -- --jobs 4      run 4 at a time (faster; use only when the machine is quiet)
//   npm run test:quiet -- --tail 60     show the last 60 lines of each failure (default 25)
const { spawn } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = Number(args[i + 1]); args.splice(i, 2); return v; };
const jobs = Math.max(1, opt('--jobs', 1)), tail = Math.max(1, opt('--tail', 25)), filters = args;
const all = require(path.join(root, 'package.json')).scripts.test.split('&&').map(s => s.trim()).filter(Boolean);
const cmds = filters.length ? all.filter(c => filters.some(f => c.includes(f))) : all;
if (!cmds.length) { console.log(`No test matches ${filters.join(', ')}.`); process.exit(1); }

const started = Date.now(), failed = [];
let next = 0, done = 0;
function run(cmd) {
  return new Promise(resolve => {
    const t0 = Date.now(), out = [];
    const p = spawn(cmd, { cwd: root, shell: true, env: { ...process.env, FORCE_COLOR: '0' } });
    p.stdout.on('data', d => out.push(d)); p.stderr.on('data', d => out.push(d));
    p.on('close', code => {
      done++;
      if (code !== 0) {
        const lines = Buffer.concat(out).toString().replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter(l => l.trim());
        failed.push({ cmd, code, lines: lines.slice(-tail), secs: ((Date.now() - t0) / 1000).toFixed(1) });
        console.log(`FAIL ${cmd} (exit ${code})`);
      }
      resolve();
    });
  });
}
async function worker() { while (next < cmds.length) await run(cmds[next++]); }
Promise.all(Array.from({ length: Math.min(jobs, cmds.length) }, worker)).then(() => {
  for (const f of failed) console.log(`\n── ${f.cmd} (exit ${f.code}, ${f.secs}s), last ${f.lines.length} lines:\n${f.lines.join('\n')}`);
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(`\n${done - failed.length}/${done} passed in ${secs}s${failed.length ? `; ${failed.length} failed: ${failed.map(f => f.cmd.replace(/^node tests\//, '')).join(', ')}` : '.'}`);
  process.exit(failed.length ? 1 : 0);
});
