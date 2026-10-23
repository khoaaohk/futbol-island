// Headless check for the ride splash (Oct 23 2026, lib/graphics/rideSplash.ts): a phone page (390 x 844) rides a bike along the
// beach's swash line, samples the pool (live particles, wet riders, draw calls / triangles) and times the splash's own CPU work
// (rider() + end() wrapped with performance.now), then rides the same line on dry sand (must stay at 0) and saves one screenshot.
// Run: node scripts/check-ride-splash.cjs <appUrl> [outDir]   (a production build; closes only its own browser)
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8977', out = process.argv[3] || '/tmp/ride-splash';
require('fs').mkdirSync(out, { recursive: true });

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0;
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(6000);
    await p.click('text=Get my save code').catch(() => {}); await p.waitForTimeout(2000);
    await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(15000);
    await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
    await p.evaluate(() => window.__fi2.selectRide('bike')); await p.waitForTimeout(2500);
    // A straight stretch of swash: a point ~0.7 m up the sand from the drawn waterline whose along-shore line stays in the wet band for 14 m.
    const spot = await p.evaluate(() => {
      const f = window.__fi2.islandWater.field; if (!f) return null; let best = null;
      // ArrowUp drives toward the top of the screen: pick a stretch that runs that way (the camera's forward on the ground).
      const e = window.__fi2.lessonPass.camera.matrixWorld.elements, cl = Math.hypot(e[8], e[10]), cfx = -e[8] / cl, cfz = -e[10] / cl;
      for (let x = -500; x <= 500; x += 2) for (let z = -300; z <= 300; z += 2) {
        const d = f.distance(x, z); if (d > -.4 || d < -1) continue; if (f.lift(x, z) > .36) continue;
        const gx = f.distance(x + 1, z) - f.distance(x - 1, z), gz = f.distance(x, z + 1) - f.distance(x, z - 1), g = Math.hypot(gx, gz); if (g < .5) continue;
        for (const s of [1, -1]) { const ax = -gz / g * s, az = gx / g * s; let okN = 0, dry = 0;
          for (let t = 1; t <= 14; t++) { const dd = f.distance(x + ax * t, z + az * t); if (dd > -1.1 && dd < 0 && f.lift(x + ax * t, z + az * t) < .36) okN++; const dy = f.distance(x + ax * t - gx / g * 6, z + az * t - gz / g * 6); if (dy < -3) dry++; }
          const along = ax * cfx + az * cfz, score = okN + dry * .2 + along * 4 - Math.hypot(x, z) * .002; if (along > .97 && okN >= 13 && dry >= 12 && (!best || score > best.score)) best = { x, z, ax, az, nx: gx / g, nz: gz / g, score }; } }
      return best;
    });
    if (!spot) { console.log('FAIL: no shore spot found'); fail++; }
    else {
      console.log('shore spot', spot.x, spot.z);
      const install = () => p.evaluate(() => { const s = window.__fi2.rideSplash; if (s.__timed) return; const r = s.rider.bind(s), e = s.end.bind(s);
        const st = window.__splashT = { ms: 0, frames: 0, peak: 0, wet: 0, calls: 0, tris: 0, samples: 0 };
        s.rider = (...a) => { const t = performance.now(); const v = r(...a); st.ms += performance.now() - t; return v; };
        s.end = () => { const t = performance.now(); e(); st.ms += performance.now() - t; st.frames++; st.peak = Math.max(st.peak, s.alive); if (s.wetRiders) st.wet++; };
        s.__timed = true; });
      await install();
      const ride = async (offset, ms, shotAt) => {
        await p.evaluate(({ spot, offset }) => { const f = window.__fi2, X = spot.x - spot.nx * offset, Z = spot.z - spot.nz * offset; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.atan2(spot.ax, spot.az); f.velocity.x = f.velocity.z = 0;
          Object.assign(window.__splashT, { ms: 0, frames: 0, peak: 0, wet: 0, calls: 0, tris: 0, samples: 0 }); }, { spot, offset });
        await p.waitForTimeout(600); await p.keyboard.down('ArrowUp'); let shot = false;
        const t0 = Date.now(); while (Date.now() - t0 < ms) { await p.waitForTimeout(150);
          const st = await p.evaluate(() => { const s = window.__fi2.rideSplash, i = window.__fi2.renderer.info.render, st = window.__splashT; if (s.mesh.visible) { st.calls += i.calls; st.tris += i.triangles; st.samples++; } return { alive: s.alive }; });
          if (shotAt && !shot && st.alive > 12 && Date.now() - t0 > shotAt) { await p.screenshot({ path: out + '/ride-splash-phone.png' }); shot = true; } }
        await p.keyboard.up('ArrowUp'); await p.waitForTimeout(1200);
        return p.evaluate(() => { const st = window.__splashT, s = window.__fi2.rideSplash, pos = window.__fi2.location; return { ...st, msPerFrame: st.frames ? st.ms / st.frames : 0, aliveAfter: s.alive, visibleAfter: s.mesh.visible, at: [pos.x, pos.z] }; });
      };
      const wet = await ride(0, 2600, 700);
      console.log('wet ride: frames', wet.frames, 'wet frames', wet.wet, 'peak live', wet.peak, 'splash CPU', wet.msPerFrame.toFixed(4), 'ms/frame', 'scene calls/tris while splashing', wet.samples ? (wet.calls / wet.samples).toFixed(0) + ' / ' + (wet.tris / wet.samples).toFixed(0) : '-', 'after: alive', wet.aliveAfter, 'visible', wet.visibleAfter);
      if (!wet.wet || wet.peak < 8) { console.log('FAIL: no splash riding the swash'); fail++; }
      if (wet.aliveAfter || wet.visibleAfter) { console.log('FAIL: pool did not empty after stopping'); fail++; }
      const dry = await ride(6, 1800, 0);
      console.log('dry ride: frames', dry.frames, 'wet frames', dry.wet, 'peak live', dry.peak);
      if (dry.wet || dry.peak) { console.log('FAIL: splash on dry sand'); fail++; }
    }
    console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none'); if (errs.length) fail++;
    await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? 'check-ride-splash: ' + fail + ' failures' : 'check-ride-splash: ok');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
