// Live feel measurement (Oct 23 2026): one friend runs a circle through a dev relay, another page samples them every frame with the
// client's interpolator, and we report how even the drawn motion is (per-frame step vs the true step), how often the friend stalls /
// jumps, and the lag behind the truth.
// Run: node --experimental-websocket scripts/mp-live-measure.mjs [--root <tree>] [--jitter 30] [--secs 8]
//   --relay <tree>: use that tree's dev relay instead (e.g. this client against the deployed, old relay).
//   --root: a futbol-island tree whose dev relay + lib/multiplayer to use (the base tree = "before"). Kills only its own server.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(arg('root', HERE)), JITTER = Number(arg('jitter', 0)), SECS = Number(arg('secs', 8));
const SPEED = Number(arg('speed', 5)), RADIUS = 12; // m/s (a running kid), m
if (typeof WebSocket === 'undefined') { console.error('run with: node --experimental-websocket'); process.exit(2); }
const require = createRequire(path.join(ROOT, 'package.json'));
const { loadTs } = require(path.join(ROOT, 'multiplayer/dev-relay/loadTs.cjs'));
const P = loadTs(path.join(ROOT, 'multiplayer/protocol/index.ts'));
const { createInterp } = loadTs(path.join(ROOT, 'lib/multiplayer/interp.ts'));
const lcFile = path.join(ROOT, 'lib/multiplayer/liveClock.ts');
const LC = fs.existsSync(lcFile) ? loadTs(lcFile) : null;

const RELAY_ROOT = path.resolve(arg('relay', ROOT)); // --relay <tree>: run that tree's dev relay (new client vs an old relay)
const srv = spawn(process.execPath, [path.join(RELAY_ROOT, 'multiplayer/dev-relay/server.mjs')], { env: { ...process.env, MP_PORT: '0' }, stdio: ['ignore', 'pipe', 'inherit'] });
const kill = () => { try { srv.kill('SIGTERM'); } catch { /* gone */ } };
process.on('exit', kill);
setTimeout(() => { console.error('measure: timeout'); kill(); process.exit(1); }, (SECS + 20) * 1000).unref();
const port = await new Promise((res, rej) => { let a = ''; srv.stdout.on('data', (d) => { a += d; const m = /"listening":(\d+)/.exec(a); if (m) res(Number(m[1])); }); setTimeout(() => rej(new Error('no relay')), 8000); });
const base = 'http://127.0.0.1:' + port;
const { code, hostKey } = await (await fetch(base + '/party', { method: 'POST' })).json();
const LOOK = new Array(12).fill(0);
const now = () => performance.now();
const rnd = () => Math.random() * JITTER;
/** A WebSocket whose inbound and outbound frames are each delayed 0..JITTER ms (order kept, like TCP). */
function jittered(url, onMsg, onOpen, bw = null) {
  const ws = new WebSocket(url);
  let inAt = 0, outAt = 0;
  ws.onopen = () => onOpen();
  ws.onmessage = (ev) => { if (bw) { bw.bytes += ev.data.length; bw.frames++; } const at = Math.max(inAt, now() + rnd()); inAt = at; setTimeout(() => onMsg(JSON.parse(ev.data)), at - now()); };
  return { send(m) { const at = Math.max(outAt, now() + rnd()); outAt = at; const s = JSON.stringify(m); setTimeout(() => { if (ws.readyState === 1) ws.send(s); }, at - now()); }, close() { ws.close(); } };
}
const wsUrl = base.replace('http', 'ws') + '/party/' + code + '/ws';
const truth = (t) => { const a = (t * SPEED) / RADIUS; return { x: 100 + RADIUS * Math.cos(a), z: 100 + RADIUS * Math.sin(a), a }; };

// --- sender (the friend): the client's send rule (5 Hz; 10 Hz once the relay offers Cap.Live) ---
let senderCaps = 0, seq = 0, lastSent = -1e9, t0 = 0, senderTimer = null;
const sender = jittered(wsUrl, (m) => {
  if (m[0] === P.S.Welcome) {
    t0 = now();
    senderTimer = setInterval(() => {
      const t = now(), gap = senderCaps & 1 ? 90 : 200;
      if (t - lastSent < gap) return;
      lastSent = t;
      const p = truth((t - t0) / 1000), yaw = Math.round((((p.a + Math.PI / 2) % (2 * Math.PI)) / (2 * Math.PI)) * 256) & 255;
      sender.send([P.C.Pose, seq++, Math.round(p.x * 10), 0, Math.round(p.z * 10), yaw, Math.round(SPEED * 4), P.Mode.Run, P.Zone.Main, 0]);
    }, 16);
  } else if (P.S.Caps !== undefined && m[0] === P.S.Caps) { senderCaps = m[1]; sender.send([P.C.Caps, m[1]]); }
}, () => sender.send([P.C.Hello, 1, LOOK, null, hostKey]));
await new Promise((r) => setTimeout(r, 300));

// --- receiver (the watching page) ---
const rxBw = { bytes: 0, frames: 0 }, rxT0 = now();
const interp = createInterp();
const clock = LC ? LC.createLiveClock() : null;
let friend = -1, live = false;
const receiver = jittered(wsUrl, (m) => {
  const t = now();
  if (m[0] === P.S.Welcome) { for (const mi of m[7]) if (mi[0] !== m[2]) friend = mi[0]; receiver.send([P.C.Pose, 0, 1000, 0, 1000, 0, 0, P.Mode.Idle, P.Zone.Main, 0]); } // standing at the circle's centre
  else if (m[0] === P.S.Joined) friend = m[1][0];
  else if (P.S.Caps !== undefined && m[0] === P.S.Caps) receiver.send([P.C.Caps, m[1]]);
  else if (m[0] === P.S.Poses) { for (let i = 2; i + 8 < m.length; i += 9) if (m[i] === friend) interp.push(friend, m.slice(i + 1, i + 9), t); }
  else if (P.S.Live !== undefined && m[0] === P.S.Live) {
    live = true;
    const ps = m[2];
    for (let i = 0; i < ps.length; i += 10) if (ps[i] === friend) interp.push(friend, ps.slice(i + 1, i + 9), clock.map(m[1], ps[i + 9], t));
  }
}, () => receiver.send([P.C.Hello, 1, LOOK, null, null]), rxBw);

// --- the frame loop: sample at ~60 fps, compare with the truth ---
const out = { x: 0, y: 0, z: 0, yaw: 0, speed: 0, mode: 0, zone: 0, fade: 1 };
const steps = [], lags = [];
let prev = null, frames = 0;
await new Promise((r) => setTimeout(r, 1500)); // warm up
const end = now() + SECS * 1000;
await new Promise((resolve) => {
  const loop = setInterval(() => {
    const t = now();
    if (clock) interp.setDelay(clock.delay(t));
    if (friend < 0 || !interp.sample(friend, t, out)) return;
    if (prev) {
      const dt = t - prev.t;
      if (dt > 0) {
        const d = Math.hypot(out.x - prev.x, out.z - prev.z);
        steps.push((d / dt) * (1000 / 60)); // the step this frame, normalised to a 60 fps frame (m)
      }
    }
    const tr = truth((t - t0) / 1000), ang = Math.atan2(out.z - 100, out.x - 100);
    let da = tr.a - ang; da = ((da % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    lags.push((da * RADIUS) / SPEED * 1000);
    prev = { t, x: out.x, z: out.z }; frames++;
    if (t >= end) { clearInterval(loop); resolve(); }
  }, 16);
});
clearInterval(senderTimer); sender.close(); receiver.close(); kill();
const ideal = (SPEED / 60);
const sorted = steps.slice().sort((a, b) => a - b), q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
const mean = steps.reduce((a, b) => a + b, 0) / steps.length;
const dev = Math.sqrt(steps.reduce((a, b) => a + (b - ideal) ** 2, 0) / steps.length);
const stalls = steps.filter((s) => s < ideal * 0.5).length, jumps = steps.filter((s) => s > ideal * 1.5).length;
const ls = lags.slice().sort((a, b) => a - b);
const res = {
  tree: path.basename(ROOT), relayTree: path.basename(RELAY_ROOT), relay: live ? 'v1.2 live (10 Hz near, timestamped)' : 'legacy 5 Hz', jitterMs: JITTER, frames,
  idealStepM: +ideal.toFixed(4), meanStepM: +mean.toFixed(4), maxStepM: +sorted[sorted.length - 1].toFixed(4), p99StepM: +q(0.99).toFixed(4),
  stepRmsErrM: +dev.toFixed(4), stallFrames: stalls, jumpFrames: jumps, hitchPct: +((100 * (stalls + jumps)) / steps.length).toFixed(1),
  rxFramesPerS: +(rxBw.frames / ((now() - rxT0) / 1000)).toFixed(1), rxBytesPerS: Math.round(rxBw.bytes / ((now() - rxT0) / 1000)),
  lagMedianMs: Math.round(ls[Math.floor(ls.length / 2)]), lagP95Ms: Math.round(ls[Math.floor(ls.length * 0.95)]),
};
console.log(JSON.stringify(res));
process.exit(0);
