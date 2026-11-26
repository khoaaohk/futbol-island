// Island Line LOOKS 2 shots (Nov 24 2026): the overhead wire from a roof / just above it and along a land-to-trestle joint, the
// round wheels close up, and both tunnel portals from above with a train half in the hill (owner shots 37, 43, 46, 49). The trains
// are pinned with window.__fi2.trains.cluster (all three at one track s, stopped) and the camera is posed for the drawn frame only.
// ONE headless Chrome (--mute-audio), closed at the end. Needs a dev server (NEXT_DIST_DIR=.next-look2 npx next dev -p 9177).
// Run: node scripts/check-train-looks2-shots.cjs --port=9177 --out=<dir> [--tag=after] [--views=a,b] [--phone=1]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), tag = arg('tag', 'after'), only = arg('views', ''), phone = arg('phone', '') === '1';
if (!port || ['8092', '9160', '8800'].includes(port) || !out) { console.error('give --port=<n> (not 8092 / 9160 / 8800) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
// [name, where (track s or a portal), cluster front offset (m past `where`), camera [u along, v lateral, y over the bed], target [u, v, y]]
const VIEWS = [
  ['portal-west-above', 'west', 10, [-9, 13, 17], [3, 0, 3]], ['portal-east-above', 'east', 12, [9, -13, 17], [-3, 0, 3]],
  ['portal-west-front', 'west', 10, [-22, 4, 7], [2, 0, 4]], ['portal-east-side', 'east', 12, [-9, 22, 13], [2, 0, 4]], ['portal-east-back', 'east', 12, [16, 3, 13], [0, 0, 5]],
  ['wire-roof', 'land', 0, [-4, .25, 5.0], [12, 0, 5.3]], ['wire-above', 'land', 0, [-9, .4, 5.5], [10, 0, 4.6]],
  ['wire-joint', 'joint', 40, [-6, 14, 7.5], [18, 0, 5]], ['wheels', 'land', 0, [-8.6, 2.7, .75], [-10.5, 0, .45]],
];
const want = (n) => !only || only.split(',').includes(n);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-time-of-day', 'day'); } catch {} });
    await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
    await p.goto(`http://localhost:${port}/play?from=arcade`, { timeout: 300000 }); await p.waitForTimeout(3000);
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
      for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
      if (i === 0) await p.click('[data-title-start]', { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
    await p.addStyleTag({ content: 'body *{visibility:hidden !important} canvas{visibility:visible !important}' });
    await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r); window.__pose = null;
      r.render = (s, c) => { const P = window.__pose; if (P && c === f.camera) { c.position.set(P.p[0], P.p[1], P.p[2]); c.up.set(0, 1, 0); c.lookAt(P.t[0], P.t[1], P.t[2]); c.updateMatrixWorld(); } return orig(s, c); };
      const t = f.trains.sched, near = (x, z) => { let best = 0, bd = 1e9; for (let s = 0; s < 2700; s += .25) { const a = t.trackAt(s), d = Math.hypot(a.x - x, a.z - z); if (d < bd) { bd = d; best = s; } } return best; };
      // a land row then a trestle (the first Land -> Sea joint) and a plain straight land stretch away from stations and crossings
      let joint = 0; for (let s = 0; s < 2700; s += 1) if (t.kind(s) === 0 && t.kind(s + 1) === 1) { joint = s; break; }
      window.__where = { west: near(538.5, 169.5), east: near(670.5, 43.1), joint, land: near(300, 242) }; });
    for (const [name, where, front, cam, tgt] of VIEWS) {
      if (!want(name)) continue;
      const pose = await p.evaluate(({ where, front, cam, tgt }) => { const f = window.__fi2, t = f.trains.sched, s0 = window.__where[where], dir = where === 'east' ? -1 : 1;
        f.trains.cluster = s0 + front;
        const at = (u, v, y) => { const s = s0 + dir * u, a = t.trackAt(s); return [a.x + a.tz * v, t.bed(s) + y, a.z - a.tx * v]; };
        const c = at(...cam), g = at(...tgt), q = at(cam[0], cam[1] + 6, 0); return { p: c, t: g, px: q[0], pz: q[2] }; }, { where, front, cam, tgt });
      await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: pose.px, z: pose.pz });
      await p.evaluate((P) => { window.__pose = P; }, pose); await p.waitForTimeout(2600);
      await p.screenshot({ path: path.join(out, `${tag}-${name}${phone ? '-phone' : ''}.png`) });
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
