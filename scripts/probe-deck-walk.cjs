// Headless probe (train POLISH 4): every bridge head, walk + scooter on / off the trestle deck; logs where the move stops and why.
// node scripts/probe-deck-walk.cjs --port=9187 [--mode=walk,scooter] [--phone=0]
const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const swimPart = arg('part', 'walk,swim').split(','), port = arg('port'), modes = arg('mode', 'walk,scooter').split(','), phone = arg('phone', '0') === '1', only = arg('head', '');
if (!port || port === '8092') { console.error('give --port'); process.exit(2); }
const url = `http://localhost:${port}`;
function keysToward(dx, dz) { const l = Math.hypot(dx, dz) || 1; let best = null;
  for (const sx of [-1, 0, 1]) for (const sy of [-1, 0, 1]) { if (!sx && !sy) continue; const ix = sx * .857 + sy * .515, iz = -sx * .515 + sy * .857, il = Math.hypot(ix, iz), a = Math.acos(Math.max(-1, Math.min(1, (ix * dx + iz * dz) / il / l))); if (!best || a < best.a) best = { a, keys: [sx > 0 ? 'd' : sx < 0 ? 'a' : '', sy > 0 ? 's' : sy < 0 ? 'w' : ''].filter(Boolean) }; }
  return best; }
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  let bad = 0;
  try {
    const ctx = await b.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: phone, hasTouch: phone });
    await ctx.addInitScript(() => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); } catch { /* */ } const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; });
    await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) { for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {}); if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2000); }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.trains && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
    await p.waitForTimeout(2500);
    // all bridge heads: land→sea transitions along the loop
    const heads = await p.evaluate(() => { const s = window.__fi2.trains.sched, out = []; for (let q = 0; q < 2700; q += 1) { const k0 = s.kind(q), k1 = s.kind(q + 1); if (k0 !== 1 && k1 === 1) out.push({ s: q + 1, dir: 1 }); else if (k0 === 1 && k1 !== 1) out.push({ s: q, dir: -1 }); } return out; });
    console.log('heads', JSON.stringify(heads));
    // trains far away for the whole probe: pin them in a cluster on the far side
    const st = (h) => p.evaluate((h) => { const f = window.__fi2, s = f.trains.sched, l = f.location; return { x: +l.x.toFixed(2), z: +l.z.toFixed(2), deck: s.deckAt(l.x, l.z), y: +f.rooftop.state.height.toFixed(2), top: +s.walkTop(l.x, l.z).toFixed(2), water: !!f.water.inWater, ph: f.water.state.phase, fall: !!f.rooftop.state.falling, bonk: !!f.trainBonk?.active, ride: f.rideRef.current }; }, h);
    const along = (h) => p.evaluate((h) => { const s = window.__fi2.trains.sched, l = window.__fi2.location; let b = 1e9, bs = 0; for (let q = h.s - 40; q < h.s + 40; q += .25) { const a = s.trackAt(q), d = Math.hypot(a.x - l.x, a.z - l.z); if (d < b) { b = d; bs = q; } } return { into: +((bs - h.s) * h.dir).toFixed(1), lat: +b.toFixed(2) }; }, h);
    for (const [hi, h] of heads.entries()) {
      if (!swimPart.includes('walk')) break;
      if (only && String(hi) !== only) continue;
      await p.evaluate((S) => { const f = window.__fi2; f.trains.cluster = (S + 1350) % 2700; }, h.s);
      for (const mode of modes) {
        const g = await p.evaluate(({ h }) => { const s = window.__fi2.trains.sched, a = s.trackAt(h.s - h.dir * 8), b = s.trackAt(h.s + h.dir * 14); return { ax: a.x, az: a.z, bx: b.x, bz: b.z, tx: a.tx * h.dir, tz: a.tz * h.dir, btx: b.tx * h.dir, btz: b.tz * h.dir, top: s.walkTop(b.x, b.z) }; }, { h });
        try { await p.evaluate(() => window.__fi2.selectRide('walk')); } catch { /* */ }
        // A) shore → deck: start 8 m inland on the centre line, push toward the sea for 4 s
        await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: g.ax, z: g.az }); await p.waitForTimeout(500);
        if (mode !== 'walk') { await p.evaluate((m) => window.__fi2.selectRide(m), mode).catch((e) => console.log('ride err', e.message)); await p.waitForTimeout(700); }
        const k = keysToward(g.tx, g.tz); for (const key of k.keys) await p.keyboard.down(key);
        const trace = []; for (let i = 0; i < 8; i++) { await p.waitForTimeout(500); trace.push({ ...(await along(h)), ...(await st()) }); }
        for (const key of k.keys) await p.keyboard.up(key);
        const last = trace[trace.length - 1], maxInto = Math.max(...trace.map((t) => t.into));
        const okA = maxInto > 6 && trace.some((t) => t.deck && !t.water);
        if (!okA) bad++;
        console.log(`${okA ? 'ok  ' : 'FAIL'} head ${hi} s=${h.s} ${mode} shore→deck (keys ${k.keys.join('+')} off ${k.a.toFixed(2)}): max ${maxInto} m in, top ${g.top.toFixed(2)}`);
        if (!okA || mode !== 'walk') console.log('   ' + trace.map((t) => `${t.into}/${t.lat} d${t.deck ? 1 : 0} y${t.y} w${t.water ? 1 : 0}${t.ph} f${t.fall ? 1 : 0} ${t.ride}`).join(' | '));
        // B) teleport onto the deck 14 m in, walk on toward the sea 2.5 s
        if (await p.evaluate(() => !!window.__fi2.water.inWater)) { await p.evaluate(() => window.__fi2.teleport(-150, -214)); await p.waitForTimeout(800); }
        await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: g.bx, z: g.bz }); await p.waitForTimeout(600);
        const s0 = await st(), a0 = await along(h);
        const k2 = keysToward(g.btx, g.btz); for (const key of k2.keys) await p.keyboard.down(key); await p.waitForTimeout(2500); for (const key of k2.keys) await p.keyboard.up(key);
        const s1 = await st(), a1 = await along(h); const okB = s0.deck && !s0.water && a1.into - a0.into > 3;
        if (!okB) bad++;
        console.log(`${okB ? 'ok  ' : 'FAIL'} head ${hi} ${mode} on deck walk: ${JSON.stringify({ s0, a0, s1, a1 })}`);
        if (await p.evaluate(() => !!window.__fi2.water.inWater)) { await p.evaluate(() => window.__fi2.teleport(-150, -214)); await p.waitForTimeout(800); }
      }
    }

    // SWIM: a swimmer meets each abutment's front / rip-rap as a wall or climbs out onto its top; never in the water inside them or
    // inside a low deck's girders near a head; under a high span open water is fine.
    if (swimPart.includes('swim')) {
      const H = await p.evaluate(() => window.__fi2.trains.sched.heads().map((h) => ({ ...h })));
      for (const [hi, h] of H.entries()) {
        if (only && String(hi) !== only) continue;
        await p.evaluate((S) => { window.__fi2.trains.cluster = (S + 1350) % 2700; }, h.s);
        const W = (u, v) => ({ x: h.x + h.tx * u + h.tz * v, z: h.z + h.tz * u - h.tx * v });
        for (const [name, from, to, ms] of [['at the abutment', [3.2, 5.5], [0.5, 0], 5000], ['across the deck 9 m out', [9, 5], [9, -5], 5000], ['along under the deck from 12 m', [12, 0.4], [0, 0.4], 5000]]) {
          await p.evaluate(() => window.__fi2.selectRide('walk')).catch(() => {});
          const a = W(...from), b = W(...to);
          await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), a); await p.waitForTimeout(1500);
          const k = keysToward(b.x - a.x, b.z - a.z); for (const key of k.keys) await p.keyboard.down(key);
          const bad1 = [], tr = [];
          for (let i = 0; i < ms / 250; i++) { await p.waitForTimeout(250);
            const r = await p.evaluate((h) => { const f = window.__fi2, s = f.trains.sched, l = f.location, dx = l.x - h.x, dz = l.z - h.z, u = dx * h.tx + dz * h.tz, v = Math.abs(dx * h.tz - dz * h.tx);
              let lat = 1e9; for (let q = h.s - 30; q < h.s + 30; q += .25) { const t = s.trackAt(q); lat = Math.min(lat, Math.hypot(t.x - l.x, t.z - l.z)); }
              return { u: +u.toFixed(2), v: +v.toFixed(2), lat: +lat.toFixed(2), w: !!f.water.inWater, y: +f.rooftop.state.height.toFixed(2), top: +s.walkTop(l.x, l.z).toFixed(2) }; }, h);
            tr.push(r);
            const inRocks = r.w && r.u > -1.1 && r.u < 2.65 && r.v < 3.5, lowDeck = r.w && r.lat < 1.3 && r.top + .43 > .8 && r.top + .43 < 1.45 && r.u > 0;
            if (inRocks || lowDeck) bad1.push(`${inRocks ? 'rocks' : 'lowdeck'} u${r.u} v${r.v} lat${r.lat} top${r.top}`); }
          for (const key of k.keys) await p.keyboard.up(key);
          const end = tr[tr.length - 1], started = tr[0].w;
          if (bad1.length) bad++;
          console.log(`${bad1.length ? 'FAIL' : 'ok  '} swim head ${hi} ${name}: start in water ${started}, end ${JSON.stringify(end)}${bad1.length ? ' BAD ' + bad1.slice(0, 3).join('; ') : ''}`);
          if (await p.evaluate(() => !!window.__fi2.water.inWater)) { for (let i = 0; i < 6 && await p.evaluate(() => !!window.__fi2.water.inWater); i++) { await p.evaluate(() => window.__fi2.teleport(-150, -214)); await p.waitForTimeout(500); } }
        }
      }
    }
    console.log('page errors', errs.length, errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
  console.log(bad ? `${bad} FAILED` : 'all ok'); process.exit(bad ? 1 : 0);
})();
