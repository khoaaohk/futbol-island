// Kindness train wraps (Nov 24 2026): shots on ONE headless Chrome (--mute-audio, closed at the end).
// Per viewport (desktop, phone) and time (day, night): each train pinned at North's platform seen from the platform (the game
// camera), and an overview of all three (a high camera: the trains' update is fed that camera, so LOD and the wraps' fade run from
// it). Also prints the wraps' quad count and the frame's draw calls with the wraps hidden vs shown (the +1 draw).
// Needs: NEXT_DIST_DIR=.next-wrap npx next dev -p 9185     Run: node scripts/shot-train-wraps.cjs --port=9185 --out=<dir> [--vps=desktop,phone] [--times=day,night]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), vps = arg('vps', 'desktop,phone').split(','), times = arg('times', 'day,night').split(','), trains = arg('trains', '0,1,2').split(',').map(Number);
if (!port || port === '8092' || !out) { console.error('give --port=<n> (never 8092) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const url = `http://localhost:${port}`;
async function boot(b, vp, mobile, time) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((time) => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-time-of-day', time); } catch {} }, time);
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
    for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
    if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(2000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
  await p.waitForTimeout(3000); await p.keyboard.press('Escape').catch(() => {});
  return { ctx, p, errs };
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    for (const vpName of vps) for (const time of times) {
      const mobile = vpName === 'phone', c = await boot(b, mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, mobile, time), { p } = c;
      // North's platform: the spot, and the line's s there (a train centred on the platform)
      const north = await p.evaluate(() => { const f = window.__fi2, sp = f.trainRide.stationSpot(0, 0), st = f.trains.sched.stops.find((x) => x.station.id === 'north').station; return { x: sp.x, z: sp.z, yaw: sp.yaw, s: st.s }; });
      const LEN = 24.4, GAP = 14;
      for (const k of trains) {
        await p.evaluate(({ s }) => { window.__fi2.trains.cluster = s; }, { s: north.s + LEN / 2 + 1 - k * (LEN + GAP) });
        await p.evaluate(({ x, z, yaw }) => window.__fi2.teleport(x, z, yaw + Math.PI), north); await p.waitForTimeout(2500);
        const d = await p.evaluate(() => window.__fi2.trains.drawn); console.log(`${vpName} ${time} train ${k}: wraps ${d.wraps} quads, cars ${d.cars} (far ${d.far}), Drip FC masks in the atlas: ${d.wrapArt}`);
        if (d.wraps > 0 && !d.wrapArt) { console.log('FAIL: the wraps are on screen but the club art never reached the atlas'); process.exitCode = 1; }
        if (k === 0) await p.screenshot({ path: path.join(out, `play-cam-${time}-${vpName}.png`) });// the default play camera, once
        if (k === 0) {// the cab end: the kindness badge over the headmark
          const cab = await p.evaluate(({ s }) => { const f = window.__fi2, t = f.trains, a = t.sched.trackAt(s + 5), by = t.sched.bed(s) || 0, C = f.camera.constructor, cam = new C(45, f.camera.aspect, .1, 600);
            cam.position.set(a.x - a.tz * 1.6, by + 2.4, a.z + a.tx * 1.6); const b2 = t.sched.trackAt(s); cam.lookAt(b2.x, by + 2.2, b2.z); cam.updateMatrixWorld(true);
            f.renderer.render(f.scene, cam); return f.renderer.domElement.toDataURL('image/png'); }, { s: north.s + LEN / 2 + 1 });
          fs.writeFileSync(path.join(out, `cab-${time}-${vpName}.png`), Buffer.from(cab.split(',')[1], 'base64'));
        }
        // from the platform: eye height on the platform spot, looking across at the train's middle and a little along it
        const png = await p.evaluate(({ s }) => { const f = window.__fi2, t = f.trains, sp = f.trainRide.stationSpot(0, 0), a = t.sched.trackAt(s), by = t.sched.bed(s) || 0;
          const dx = sp.x - a.x, dz = sp.z - a.z, l = Math.hypot(dx, dz) || 1, C = f.camera.constructor, cam = new C(f.camera.aspect < 1 ? 70 : 58, f.camera.aspect, .1, 600);
          cam.position.set(sp.x + dx / l * 1.2 - a.tx * 3, (sp.y ?? by + 1) + 1.6, sp.z + dz / l * 1.2 - a.tz * 3); cam.lookAt(a.x + a.tx * 2, by + 2, a.z + a.tz * 2); cam.updateMatrixWorld(true);
          f.renderer.render(f.scene, cam); return f.renderer.domElement.toDataURL('image/png'); }, { s: north.s });
        fs.writeFileSync(path.join(out, `platform-${'abc'[k]}-${time}-${vpName}.png`), Buffer.from(png.split(',')[1], 'base64'));
      }
      // overview: all three pinned in a row along North Beach, a high camera off to the side
      const data = await p.evaluate(async ({ s }) => {
        const f = window.__fi2, t = f.trains; t.cluster = s;
        const a = t.sched.trackAt(s - 26), b2 = t.sched.trackAt(s + 78), mx = (a.x + b2.x) / 2, mz = (a.z + b2.z) / 2, tx = b2.x - a.x, tz = b2.z - a.z, l = Math.hypot(tx, tz), nx = -tz / l, nz = tx / l;
        const C = f.camera.constructor, cam = new C(50, f.camera.aspect, .5, 900), side = f.camera.aspect < 1 ? 120 : 62;
        cam.position.set(mx + nx * side, (t.sched.bed(s) || 0) + side * .55, mz + nz * side); cam.lookAt(mx, (t.sched.bed(s) || 0) + 1.5, mz); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
        const orig = t.update; t.update = (fr) => orig({ ...fr, camera: cam, camPos: undefined, viewProj: undefined });
        await new Promise((r) => setTimeout(r, 1500));
        // the draw-call A/B for this view: wraps shown, then hidden for one render
        const info = f.renderer.info; info.autoReset = false;
        const count = () => { info.reset(); f.renderer.render(f.scene, cam); return info.render.calls; };
        const wm = f.scene.getObjectByName('train-wraps'), withW = count(); const was = wm.visible; wm.visible = false; const without = count(); wm.visible = was; info.autoReset = true;
        f.renderer.render(f.scene, cam); const png = f.renderer.domElement.toDataURL('image/png');
        t.update = orig; return { png, wraps: t.drawn.wraps, withW, without };
      }, { s: north.s + 20 });
      console.log(`${vpName} ${time} overview: wraps ${data.wraps} quads, draws ${data.withW} (without the wraps ${data.without}: +${data.withW - data.without})`);
      fs.writeFileSync(path.join(out, `overview-${time}-${vpName}.png`), Buffer.from(data.png.split(',')[1], 'base64'));
      await p.evaluate(() => { window.__fi2.trains.cluster = NaN; });
      if (c.errs.length) console.log(`${vpName} ${time}: page errors: ${c.errs.slice(0, 3).join(' | ')}`);
      await c.ctx.close();
    }
  } finally { await b.close(); }
  console.log(`shots in ${out}`);
})().catch((e) => { console.error(e); process.exit(1); });
