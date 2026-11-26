// Island Line clearance + bridge-head shots (Nov 24 2026): fixed desktop cameras on ONE headless Chrome (--mute-audio, closed at
// the end). The camera is pinned by wrapping renderer.render (the game's own camera, posed just before each draw), the player is
// teleported near so the chunk gates show the area, and the trains are clustered at the spot for the palm views.
// Views: palm-cay (owner shot 34, Coral Cay farm beach), palm-cay-east, palm-west; head-<s> for the six land/trestle transitions;
// low-<s> for a fly-along pass of the line (--fly).
// Needs: NEXT_DIST_DIR=.next-clear npx next dev -p 9171     Run: node scripts/check-train-clearance-shots.cjs --port=9171 --out=<dir> [--tag=after] [--views=a,b] [--fly]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), tag = arg('tag', 'after'), only = arg('views', ''), fly = process.argv.includes('--fly');
if (!port || ['8092', '9160', '8800'].includes(port) || !out) { console.error('give --port=<n> (not 8092 / 9160 / 8800) and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const HEADS = [1324, 1578, 1884, 1958, 2182, 2462];
// [name, s of the look point, lateral camera offset, camera height, along offset (+ = ahead), cluster trains at s?]
let VIEWS = [['palm-cay', 2160, 7, 5.5, -22, true], ['palm-cay-east', 1973, -7, 5.5, -22, true], ['palm-west', 954, 7, 5, -20, true],
  ...HEADS.map((s) => [`head-${s}`, s, 13, 6, 9, false])];
if (fly) VIEWS = []; const FLY = []; if (fly) for (let s = 40; s < 2540; s += 200) FLY.push([`low-${s}`, s, 10, 7, -26, false]);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
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
      r.render = (s, c) => { const P = window.__pose; if (P && c === f.camera) { c.position.set(P.p[0], P.p[1], P.p[2]); c.up.set(0, 1, 0); c.lookAt(P.t[0], P.t[1], P.t[2]); c.updateMatrixWorld(); } return orig(s, c); }; });
    const stats = [];
    for (const [name, s, lat, h, along, cluster] of [...VIEWS, ...FLY]) {
      if (only && !only.split(',').includes(name)) continue;
      const pose = await p.evaluate(({ s, lat, h, along }) => { const t = window.__fi2.trains.sched, a = t.trackAt(s), c = t.trackAt(s + along), bed = t.bed(s), bc = t.bed(s + along);
        const n = { x: c.tz, z: -c.tx }; return { p: [c.x + n.x * lat, bc + h, c.z + n.z * lat], t: [a.x, bed + .8, a.z], px: c.x + n.x * (lat + 4), pz: c.z + n.z * (lat + 4) }; }, { s, lat, h, along });
      await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: pose.px, z: pose.pz });
      await p.evaluate((c) => { window.__fi2.trains.cluster = c; }, cluster ? s - 18 : NaN);
      await p.evaluate((P) => { window.__pose = P; }, pose); await p.waitForTimeout(2600);
      const info = await p.evaluate(() => { const i = window.__fi2.renderer.info.render; return { calls: i.calls, tris: i.triangles }; });
      stats.push(`${name}: ${info.calls} draws, ${(info.tris / 1000).toFixed(1)}k tris`);
      await p.screenshot({ path: path.join(out, `${tag}-${name}.png`) });
    }
    fs.writeFileSync(path.join(out, `${tag}-stats.txt`), stats.join('\n') + '\n');
    console.log(stats.join('\n')); if (errs.length) console.log('page errors:', errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
