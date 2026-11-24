// Island Line small leftovers (Nov 24 2026): Summit tunnel portal shots (outside + inside the tube, east and west) and a night
// shot inside a car (standing eye along the aisle, looking at the ceiling). ONE headless Chrome (--mute-audio), closed at the end.
// Needs a dev server (NEXT_DIST_DIR=.next-small npx next dev -p 9174).
// Run: node scripts/check-train-portal-shots.cjs --port=9174 --out=<dir> [--tag=after] [--views=a,b] [--time=night]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), tag = arg('tag', 'after'), only = arg('views', ''), time = arg('time', 'day');
if (!port || ['8092', '9160', '8800'].includes(port) || !out) { console.error('give --port=<n> (not 8092 / 9160 / 8800) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
// [name, portal, along (+ = into the hill), lateral, height over the bed, look along, look lateral, look height]
const VIEWS = [// look target: [u, v, y] absolute (u along into the hill from the portal, v lateral, y over the bed)
  ['east-out', 'east', -14, 3, 4.5, 1.5, 0, 2.5], ['east-in', 'east', 9, .8, 2.4, -3, 0, 2.6], ['east-in-up', 'east', 4, -1.5, 1.6, 1, 2.5, 4.8], ['east-in-up2', 'east', 4, 1.5, 1.6, 1, -2.5, 4.8],
  ['west-out', 'west', -14, -3, 4.5, 1.5, 0, 2.5], ['west-in', 'west', 9, -.8, 2.4, -3, 0, 2.6], ['west-wing', 'west', -10, -9, 3.5, 2, -6, 1],
  ['west-wing-e', 'west', -10, 9, 3.5, 2, 6, 1],
];
const want = (n) => !only || only.split(',').includes(n);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    await ctx.addInitScript((tod) => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-time-of-day', tod); } catch {} const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; }, time);
    await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
    await p.goto(`http://localhost:${port}/play?from=arcade`, { timeout: 300000 }); await p.waitForTimeout(3000);
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
      for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
      if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
    await p.addStyleTag({ content: 'body *{visibility:hidden !important} canvas{visibility:visible !important}' });
    await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r); window.__pose = null;
      r.render = (s, c) => { const P = window.__pose; if (P && c === f.camera) { c.position.set(P.p[0], P.p[1], P.p[2]); c.up.set(0, 1, 0); c.lookAt(P.t[0], P.t[1], P.t[2]); c.updateMatrixWorld(); } return orig(s, c); };
      const t = f.trains.sched, near = (x, z) => { let best = 0, bd = 1e9; for (let s = 0; s < 2700; s += .25) { const a = t.trackAt(s), d = Math.hypot(a.x - x, a.z - z); if (d < bd) { bd = d; best = s; } } return best; };
      window.__portal = { west: near(538.5, 169.5), east: near(670.5, 43.1) }; });
    for (const [name, which, along, lat, h, la, ll, lh] of VIEWS) {
      if (!want(name)) continue;
      const pose = await p.evaluate(({ which, along, lat, h, la, ll, lh }) => { const t = window.__fi2.trains.sched, s0 = window.__portal[which], dir = which === 'west' ? 1 : -1;// + along = into the hill
        const at = (u, v, y) => { const a = t.trackAt(s0 + dir * u); return [a.x + a.tz * v, 2.2 + y, a.z - a.tx * v]; };
        const c = at(along, lat, h), tg = at(la, ll, lh), q = at(-14, 0, 0); return { p: c, t: tg, px: q[0], pz: q[2] }; }, { which, along, lat, h, la, ll, lh });
      await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: pose.px, z: pose.pz });
      await p.evaluate((P) => { window.__pose = P; }, pose); await p.waitForTimeout(2600);
      await p.screenshot({ path: path.join(out, `${tag}-${name}.png`) });
    }
    if (want('car-inside')) {// board at North, render from a standing eye looking along the car toward the ceiling middle
      await p.evaluate(() => { window.__pose = null; });
      await p.evaluate(() => { const s = window.__fi2.trains.sched, st = s.stops.find((x) => x.station.id === 'north'), P = s.trainPhase(0, s.clock()); window.__skew += (((st.arrive + 3.5 - P) % 360) + 360) % 360 * 1000; }); await p.waitForTimeout(600);
      await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(0, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(2500);
      await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(3000);
      const data = await p.evaluate(() => { const f = window.__fi2, t = f.trains, k = f.trainRide.train ?? 0, P = { x: 0, y: 0, z: 0, yaw: 0 }; t.seatPose(k, 1, P);
        const C = f.camera.constructor, cam = new C(64, f.camera.aspect, .05, 800), fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), ax = fz, az = -fx;
        const B = (k, a, y) => [P.x + fx * k + ax * a, P.y + y, P.z + fz * k + az * a], c0 = B(.6, -3.4, 1.45), c1 = B(.6, 4, 2.1); cam.position.set(...c0); cam.lookAt(...c1);
        cam.updateMatrixWorld(true); f.renderer.render(f.scene, cam); return f.renderer.domElement.toDataURL('image/png'); });
      fs.writeFileSync(path.join(out, `${tag}-car-inside-${time}.png`), Buffer.from(data.split(',')[1], 'base64'));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
