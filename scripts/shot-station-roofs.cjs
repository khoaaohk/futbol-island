// Station house roofs (owner shot 90, Nov 25 2026: "building roof here is missing" at Coral Cay): one headless Chrome (--mute-audio,
// closed at the end). Per station: stand on its platform, then render a high 3/4 view of the station house from 4 sides (the roof
// must show from every angle) into one 2×2 sheet per station, (the roof's winding on every station is checked headless by tests/train-station-roofs.cjs).
// Needs: NEXT_DIST_DIR=.next-x npx next dev -p <port>     Run: node scripts/shot-station-roofs.cjs --port=<port> --out=<dir> [--vp=desktop|phone]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), vpName = arg('vp', 'desktop');
if (!port || port === '8092' || !out) { console.error('give --port=<n> (never 8092) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
let bad = 0; const check = (name, ok, info = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? ' (' + info + ')' : ''}`); if (!ok) bad++; };
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const mobile = vpName === 'phone', vp = mobile ? { width: 390, height: 844 } : { width: 1200, height: 800 };
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-time-of-day', 'day'); } catch {} });
    await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
    await p.goto(`http://localhost:${port}/play?from=arcade`, { timeout: 300000 }); await p.waitForTimeout(3000);
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
      for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
      if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
    await p.waitForTimeout(3000); await p.keyboard.press('Escape').catch(() => {});
    const n = await p.evaluate(() => window.__fi2.trains.sched.stops.length);
    for (let i = 0; i < n; i++) {
      const sp = await p.evaluate((i) => { const f = window.__fi2, s = f.trainRide.stationSpot(i, 0); return { x: s.x, y: s.y || 0, z: s.z, yaw: s.yaw, id: ['north', 'west', 'south', 'summit', 'cay'][i] }; }, i);// lib/town/trainTrack.ts TRAIN_STATIONS order
      await p.evaluate((s) => window.__fi2.teleport(s.x, s.z, s.yaw), sp); await p.waitForTimeout(2500);
      const r = await p.evaluate(({ s, W, H }) => {
        const f = window.__fi2, T = f.camera.constructor, cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; const g = cv.getContext('2d');
        for (let k = 0; k < 4; k++) { const a = s.yaw + k * Math.PI / 2 + Math.PI / 4, cam = new T(45, W / H, .1, 600), y0 = s.y;
          cam.position.set(s.x + Math.sin(a) * 16, y0 + 14, s.z + Math.cos(a) * 16); cam.lookAt(s.x, y0 + 2, s.z); cam.updateMatrixWorld(true);
          f.renderer.setSize(W, H, false); f.renderer.render(f.scene, cam); g.drawImage(f.renderer.domElement, (k % 2) * W, Math.floor(k / 2) * H, W, H); }
        f.renderer.setSize(innerWidth, innerHeight, false);
        return { png: cv.toDataURL('image/png') };
      }, { s: sp, W: Math.round(vp.width / 2), H: Math.round(vp.height / 2) });
      fs.writeFileSync(path.join(out, `${sp.id}-${vpName}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
      console.log(`${sp.id}: 4 high 3/4 views → ${sp.id}-${vpName}.png`);
    }
    check('no page errors', !errs.length, errs.slice(0, 2).join(' | '));
  } catch (e) { check('ran', false, e.message.slice(0, 200)); }
  finally { await b.close(); }
  console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
