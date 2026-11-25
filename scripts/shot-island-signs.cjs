// Island signs shot sheet (Nov 25 2026, signs audit: posts never cover the words). One desktop shot of every sign type, from a
// fixed camera a few metres in front of the board and a little to one side (so a post in front of the words would show), on ONE
// headless Chrome (--mute-audio, closed at the end), plus a contact sheet (sheet.png) of them all.
// The boards' centres and face normals come from the island scan: node scripts/sign-posts-scan.cjs --json=<boards.json>
// Needs a server on its own port (not 8092 / 9160 / 8800), e.g. NEXT_DIST_DIR=.next-signs npx next start -p 9195
// Run: node scripts/shot-island-signs.cjs --port=9195 --boards=<boards.json> --out=<dir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), out = arg('out', ''), boardsFile = arg('boards', '');
if (!port || ['8092', '9160', '8800'].includes(port) || !out || !boardsFile) { console.error('give --port=<n> (not 8092 / 9160 / 8800), --boards=<json> and --out=<dir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const boards = JSON.parse(fs.readFileSync(boardsFile, 'utf8'));
const SOUTH = [170, 220];// South station (the owner's shot 79)
const near = (b) => Math.hypot(b.at[0] - SOUTH[0], b.at[2] - SOUTH[1]);
const pick = (name, test) => { const b = boards.filter(test).sort((a, c) => near(a) - near(c))[0]; if (!b) console.error('no board for', name); return b && { name, b }; };
const byText = (t) => (b) => !b.train && b.text.startsWith(t);
const VIEWS = [
  pick('station-name-board', (b) => b.train && b.w > 2.5), pick('station-line-board', (b) => b.train && b.w < 2.5),
  ...[['district-arch', 'NORTH BEACH'], ['beach-volleyball', 'BEACH VOLLEYBALL'], ['lily-pond', 'LILY POND'], ['zipline-launch', 'ZIPLINE TO CORAL CAY'],
    ['zipline-landing', 'ZIPLINE FROM SUMMIT ISLE'], ['jetty-challenge', 'JETTY SHOOTING CHALLENGE'], ['summit-5s', 'SUMMIT 5s'], ['sandbar-post-sign', 'STARFISH SANDBAR'],
    ['teaching-board', 'BEACH SOCCER'], ['ferry-dock', 'FERRY DOCK'], ['post-match-tables', 'POST-MATCH TABLES'], ['community-garden', 'COMMUNITY GARDEN'],
    ['shuttle-stop', 'ISLAND SHUTTLE'], ['school-name', 'ISLAND HIGH SCHOOL'], ['konbini-match-day', 'MATCH DAY'], ['coaches-now-open', 'NOW OPEN'], ['shop-surf', 'SURF SHOP']]
    .map(([n, t]) => pick(n, byText(t))),
].filter(Boolean);
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
      if (i === 0) await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }
    await p.waitForFunction(() => !!window.__fi2 && !!window.__fi2.renderer && !document.querySelector('[data-island-return-loading]'), null, { timeout: 300000 });
    await p.addStyleTag({ content: 'body *{visibility:hidden !important} canvas{visibility:visible !important}' });
    await p.evaluate(() => { const f = window.__fi2, r = f.renderer, orig = r.render.bind(r); window.__pose = null;
      r.render = (s, c) => { const P = window.__pose; if (P && c === f.camera) { c.position.set(P.p[0], P.p[1], P.p[2]); c.up.set(0, 1, 0); c.lookAt(P.t[0], P.t[1], P.t[2]); c.updateMatrixWorld(); } return orig(s, c); }; });
    const shots = [];
    for (const { name, b: s } of VIEWS) {
      const [x, y, z] = s.at, [nx, , nz] = s.nrm, l = Math.hypot(nx, nz) || 1, ux = nx / l, uz = nz / l, tx = uz, tz = -ux;
      const d = Math.max(3.2, s.w * .95), side = d * .32;
      const pose = { p: [x + ux * d + tx * side, y + .35, z + uz * d + tz * side], t: [x, y, z] };
      await p.evaluate(({ x, z }) => window.__fi2.teleport(x, z, 0), { x: x + ux * (d + 4), z: z + uz * (d + 4) });
      await p.waitForTimeout(1500);
      await p.evaluate((P) => { window.__pose = P; }, pose);
      await p.waitForTimeout(1800);
      const file = path.join(out, `${name}.png`); await p.screenshot({ path: file }); shots.push({ name, file, text: s.text.slice(0, 40) });
    }
    // the contact sheet: every shot at 400 x 250, four across, captioned
    const cells = shots.map((s) => `<figure><img src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}"><figcaption>${s.name}</figcaption></figure>`).join('');
    const sheet = await ctx.newPage(); await sheet.setViewportSize({ width: 1640, height: 400 });
    await sheet.setContent(`<style>body{margin:0;padding:8px;background:#1d2522;font:600 13px system-ui;color:#e9e2cf;display:grid;grid-template-columns:repeat(4,400px);gap:8px}figure{margin:0}img{width:400px;height:250px;display:block}figcaption{padding:3px 0}</style>${cells}`);
    await sheet.screenshot({ path: path.join(out, 'sheet.png'), fullPage: true });
    console.log(`signs shots: ${shots.length} views + sheet.png in ${out}${errs.length ? `; page errors: ${errs.slice(0, 3).join(' | ')}` : ''}`);
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
