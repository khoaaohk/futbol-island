// Island Line Phase 4 (Nov 23 2026): what the station islanders, the station drink machine and the crossing machines cost, per
// view. One headless phone (390x844, DPR 1, SwiftShader, --mute-audio). At each station (standing on the platform, the follow
// camera) and at the new footpath crossings: draw calls / triangles with everything on, then with that station's two islanders
// hidden (islandNpcs.setAway) and its machine hidden, so each feature's own cost reads off directly. Counts are exact; ms are not
// heat. Never port 8092.
// Run:    node scripts/check-train-phase4-draws.cjs --port=9157
const { chromium } = require('playwright');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('fi-staff', '1'); localStorage.setItem('fi2-welcome-v1', 'completed'); sessionStorage.setItem('fi2-in-game', '1'); localStorage.setItem('fi2-holdout-v1', 'f'.repeat(32)); } catch { /* */ } });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${port}/play?from=arcade`, { timeout: 240000 });
    for (let i = 0; i < 90 && !(await p.evaluate(() => !!window.__fi2)); i++) { for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {}); if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2000); }
    await p.waitForFunction(() => !!window.__fi2?.trainRide && !!window.__fi2.renderer, null, { timeout: 240000 });
    await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r), log = window.__gfx = { on: false, rows: [] };
      r.render = (scene, camera) => { orig(scene, camera); if (log.on && scene === f.scene && r.getRenderTarget() === null) log.rows.push([r.info.render.calls, r.info.render.triangles]); }; });
    const gfx = async () => { await p.evaluate(() => { window.__gfx.rows.length = 0; window.__gfx.on = true; }); await p.waitForTimeout(2600);
      const rows = await p.evaluate(() => { window.__gfx.on = false; return window.__gfx.rows; }); const med = (i) => { const s = rows.map((r) => r[i]).sort((a, c) => a - c); return s[s.length >> 1] ?? 0; }; return { c: med(0), t: med(1), n: rows.length }; };
    const IDS = ['north', 'west', 'south', 'summit', 'cay'];
    console.log('| view | all on: draws / tris | islanders hidden | machine hidden too | crossings drawn |');
    console.log('|---|---|---|---|---|');
    for (let si = 0; si < 5; si++) {
      const id = IDS[si];
      await p.evaluate((si) => { const sp = window.__fi2.trainRide.stationSpot(si, -4); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }, si);
      await p.waitForTimeout(3500);
      const on = await gfx();
      await p.evaluate((id) => { const n = window.__fi2.islandNpcs; for (const e of n.entries) if (e.definition.station === id) n.setAway(e.id, true); }, id);
      await p.waitForTimeout(600); const noNpc = await gfx();
      await p.evaluate((id) => { const v = window.__fi2.scene.getObjectByName('vending-drinkst' + id); if (v) v.visible = false; }, id);
      await p.waitForTimeout(300); const none = await gfx();
      const x = await p.evaluate((id) => { const n = window.__fi2.islandNpcs; for (const e of n.entries) if (e.definition.station === id) n.setAway(e.id, false); const v = window.__fi2.scene.getObjectByName('vending-drinkst' + id); if (v) v.visible = true; return window.__fi2.trains.drawn.crossings; }, id);
      console.log(`| ${id} station | ${on.c} / ${on.t} (${on.n} fr) | ${noNpc.c} / ${noNpc.t} | ${none.c} / ${none.t} | ${x} |`);
    }
    for (const [name, x, z] of [['park-west-trail crossing', -296, 5.5], ['beach-kitchen-square crossing', -59.5, 98], ['park-south-east-trail crossing', -99, 108]]) {
      await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x, z }); await p.waitForTimeout(3500);
      const g = await gfx(); const xd = await p.evaluate(() => window.__fi2.trains.drawn.crossings);
      console.log(`| ${name} | ${g.c} / ${g.t} (${g.n} fr) | | | ${xd} |`);
    }
  } finally { await b.close(); }
})();
