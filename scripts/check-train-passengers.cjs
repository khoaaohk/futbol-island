// Island Line passengers look pass (Nov 24 2026): close-up shots of the NPC passengers on ONE headless Chrome (--mute-audio, closed at
// the end). Views: platform (North, train 0 in with its doors open, the game camera), window (a platform eye 2.6 m from car 0's side,
// looking in through the windows), seated (a seated eye across the aisle of the car I ride), standing (an aisle eye looking down the
// car; both strap spots of car 0 are filled for the shot). Each desktop + phone.
// Needs: NEXT_DIST_DIR=.next-pass npx next dev -p 9170     Run: node scripts/check-train-passengers.cjs --port=9170 --out=<dir> [--tag=after]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), tag = arg('tag', 'after'), vps = arg('vps', 'desktop,phone').split(',');
if (!port || port === '8092' || !out) { console.error('give --port=<n> (never 8092) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const url = `http://localhost:${port}`;
async function boot(b, vp, mobile) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch {}
    const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew;
  });
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('[data-title-start]', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trainRide && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  await p.waitForTimeout(3000);
  return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
// render the scene once from a camera given in car c's frame of train k (eye and target car-local) and save the canvas
const carShot = (p, file, k, c, eye, at, fov) => p.evaluate(({ k, c, eye, at, fov }) => {
  const f = window.__fi2, M = f.camera.matrixWorld.constructor, V = f.camera.position.constructor, m = new M(); f.trains.carMatrixOf(k, c, m);
  const cam = new f.camera.constructor(fov, f.camera.aspect, .05, 800); cam.position.copy(new V(...eye).applyMatrix4(m)); cam.up.set(0, 1, 0); cam.lookAt(new V(...at).applyMatrix4(m));
  cam.updateMatrixWorld(true); f.trainPassengers.update(f.trains, f.trains.sched.clock(), cam, f.trainRide.active ? f.trainRide.train : -1, 0, false);
  // draws / triangles with and without the passengers (the group: every passenger part), then the shot
  const R = f.renderer, info = () => ({ calls: R.info.render.calls, tris: R.info.render.triangles }), g = f.scene.getObjectByName('train-passengers');
  if (g) g.visible = false; R.render(f.scene, cam); const off = info(); if (g) g.visible = true;
  R.render(f.scene, cam); const on = info(), shown = f.trainPassengers.shown, data = R.domElement.toDataURL('image/png');
  return { data, on, off, shown };
}, { k, c, eye, at, fov }).then((d) => { fs.writeFileSync(path.join(out, file), Buffer.from(d.data.split(',')[1], 'base64'));
  console.log(`${file}: ${d.shown} passengers  draws ${d.off.calls} -> ${d.on.calls} (+${d.on.calls - d.off.calls})  tris ${d.off.tris} -> ${d.on.tris} (+${d.on.tris - d.off.tris})`); });
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    for (const vpName of vps) {
      const mobile = vpName === 'phone', c = await boot(b, mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile), { p } = c;
      await p.keyboard.press('Escape').catch(() => {});
      const T = await p.evaluate(() => { const s = window.__fi2.trains.sched, st = s.stops.find((x) => x.station.id === 'north'); return st.arrive + 3.5; });
      await setLap(p, 0, T); await p.waitForTimeout(600);
      await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(0, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(2500);
      await p.screenshot({ path: path.join(out, `${tag}-platform-${vpName}.png`) });
      // through the windows from the platform: which side of car 0 faces the platform at this stop
      const side = await p.evaluate(() => { const s = window.__fi2.trains.states[0]; return s.at >= 0 ? window.__fi2.trains.sched.stops[s.at].station.side : 1; });
      await carShot(p, `${tag}-window-${vpName}.png`, 0, 0, mobile ? [side * 3.4, 2.7, 1.2] : [side * 3.9, 2.75, 1.6], mobile ? [0, 1.95, 3.2] : [0, 1.95, -1.2], mobile ? 70 : 55);
      await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(2500);
      for (let i = 0; i < 40; i++) { const at = await p.evaluate(() => window.__fi2.trains.states[window.__fi2.trainRide.train]?.at ?? -1); if (at < 0) break; await p.waitForTimeout(500); }
      await p.waitForTimeout(3000);
      const k = await p.evaluate(() => window.__fi2.trainRide.train);
      // fill both strap spots of car 0 for the standing view (cast people not already on this train)
      await p.evaluate((k) => { const P = window.__fi2.trainPassengers, r = P.roster(k); if (!r) return; const on = new Set(r.slots.filter((s) => s.on).map((s) => s.cast));
        let ci = 0; for (const i of [5, 6]) { while (on.has(ci)) ci++; Object.assign(r.slots[i], { on: true, cast: ci, standing: true, seat: -1 }); Object.assign(r.prev[i], r.slots[i]); on.add(ci); } }, k);
      await p.waitForTimeout(300);
      const F = 1.15;// CAR_FLOOR_Y
      await carShot(p, `${tag}-seated-${vpName}.png`, k, 0, [-.85, F + 1.2, 1.2], mobile ? [1.0, F + .95, -2.4] : [1.0, F + .95, -.6], mobile ? 72 : 58);
      await carShot(p, `${tag}-standing-${vpName}.png`, k, 0, [0, F + 1.62, 4.6], [0, F + 1.0, -2.4], mobile ? 72 : 60);
      if (c.errs.length) console.log(`${vpName}: page errors: ${c.errs.slice(0, 3).join(' | ')}`);
      await c.ctx.close();
    }
  } finally { await b.close(); }
  console.log(`shots in ${out}`);
})().catch((e) => { console.error(e); process.exit(1); });
