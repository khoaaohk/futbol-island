// The Island Line chapter's screenshots (Nov 25 2026, lib/site/trainDeck.ts): ONE headless Chrome (--mute-audio, closed at the end),
// 1600 x 900, day, the trains pinned at North's platform (the same pins as scripts/shot-train-wraps.cjs). Writes PNGs to --out; turn
// them into public/marketing/train/<name>.webp at 1280 x 720 (sharp or cwebp).
// Needs a production build served:   NEXT_DIST_DIR=.next-mk npx next build && NEXT_DIST_DIR=.next-mk npx next start -p <port>
// Run: node scripts/shot-marketing-train.cjs --port=<n> --out=<dir>        (never 8092)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), only = arg('only', '');
if (!port || port === '8092' || !out) { console.error('give --port=<n> (never 8092) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const url = `http://localhost:${port}`, LEN = 24.4, GAP = 14;
const want = (n) => !only || only.split(',').includes(n);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); localStorage.setItem('fi2-time-of-day', 'day'); } catch {} });
    await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
    await p.goto(url + '/play?from=arcade', { timeout: 300000 }); await p.waitForTimeout(3000);
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) {
      for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {});
      if (i === 0) await p.click('[data-title-start]', { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
    await p.waitForTimeout(3000); await p.keyboard.press('Escape').catch(() => {});
    const north = await p.evaluate(() => { const f = window.__fi2, sp = f.trainRide.stationSpot(0, 0), st = f.trains.sched.stops.find((x) => x.station.id === 'north').station; return { x: sp.x, z: sp.z, yaw: sp.yaw, s: st.s }; });
    const pin = async (k) => { await p.evaluate(({ s }) => { window.__fi2.trains.cluster = s; }, { s: north.s + LEN / 2 + 1 - k * (LEN + GAP) }); await p.evaluate(({ x, z, yaw }) => window.__fi2.teleport(x, z, yaw + Math.PI), north); await p.waitForTimeout(2500); };
    const save = (name, data) => { fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(data.split(',')[1], 'base64')); console.log('shot', name); };
    // a camera: from the platform spot pushed `back` m off the track and `along` m along it, at `up` m, looking at the track point
    // `look` m along at `lookUp` m; fov in degrees. The trains' update is fed this camera, so the wraps' LOD fade runs from it.
    const cam = (o) => p.evaluate(async (o) => {
      const f = window.__fi2, t = f.trains, sp = f.trainRide.stationSpot(0, 0), a = t.sched.trackAt(o.s), by = t.sched.bed(o.s) || 0;
      const dx = sp.x - a.x, dz = sp.z - a.z, l = Math.hypot(dx, dz) || 1, C = f.camera.constructor, c = new C(o.fov, f.camera.aspect, .1, 900);
      c.position.set(a.x + dx / l * o.back + a.tx * o.along, by + o.up, a.z + dz / l * o.back + a.tz * o.along);
      const L = t.sched.trackAt(o.s + o.look); c.lookAt(L.x, by + o.lookUp, L.z); c.updateMatrixWorld(true); c.updateProjectionMatrix();
      const orig = t.update; t.update = (fr) => orig({ ...fr, camera: c, camPos: undefined, viewProj: undefined });
      await new Promise((r) => setTimeout(r, 1800)); f.renderer.render(f.scene, c); const png = f.renderer.domElement.toDataURL('image/png'); t.update = orig; return png;
    }, o);
    // the player stands well away for the camera shots (never in front of a wrap)
    const away = () => p.evaluate(({ x, z, yaw }) => window.__fi2.teleport(x - 40, z + 40, yaw), north);
    if (want('hero')) { await pin(0); await p.evaluate(({ s }) => { window.__fi2.trains.cluster = s; }, { s: north.s + 20 }); await away(); save('hero', await cam({ s: north.s, back: -15, along: -13, up: 7, look: 1, lookUp: 1.6, fov: 45 })); }
    if (want('wrap')) { await pin(0); await p.waitForTimeout(500);// from the platform at eye height (scripts/shot-train-wraps.cjs's platform view): the crest panel and its Sponsor tag nearest
      save('wrap', await p.evaluate(({ s }) => { const f = window.__fi2, t = f.trains, sp = f.trainRide.stationSpot(0, 0), a = t.sched.trackAt(s), by = t.sched.bed(s) || 0;
        const dx = sp.x - a.x, dz = sp.z - a.z, l = Math.hypot(dx, dz) || 1, C = f.camera.constructor, cam = new C(58, f.camera.aspect, .1, 600);
        cam.position.set(sp.x + dx / l * 1.2 - a.tx * 3, (sp.y ?? by + 1) + 1.6, sp.z + dz / l * 1.2 - a.tz * 3); cam.lookAt(a.x + a.tx * 2, by + 2, a.z + a.tz * 2); cam.updateMatrixWorld(true);
        f.renderer.render(f.scene, cam); return f.renderer.domElement.toDataURL('image/png'); }, { s: north.s })); }
    if (want('badge')) { await pin(0); await away(); save('badge', await cam({ s: north.s + LEN / 2 + 1, back: 1.2, along: 7.5, up: 2.3, look: 0, lookUp: 1.9, fov: 42 })); }
    if (want('slogan')) { await pin(1); await away(); save('slogan', await cam({ s: north.s - 3.3, back: 5, along: 0, up: 2.1, look: -1.6, lookUp: 1.6, fov: 34 })); }
    if (want('ride')) { await pin(2); await p.waitForTimeout(1500); save('ride', await cam({ s: north.s, back: -15, along: 15, up: 4.5, look: -2, lookUp: 1.8, fov: 50 })); }
    const d = await p.evaluate(() => window.__fi2.trains.drawn); console.log(`wraps ${d.wraps} quads, Drip FC masks in the atlas: ${d.wrapArt}`);
    await p.evaluate(() => { window.__fi2.trains.cluster = NaN; });
    if (errs.length) console.log('page errors: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
