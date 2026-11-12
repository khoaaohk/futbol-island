// Public island phase 3, headless (Nov 12 2026; docs/multiplayer/PHASE3-VERIFY.md). Never port 8092.
// Needs:  relay  MP_PORT=8805 MP_DEV=1 MP_WORLD_OPEN=1 node multiplayer/dev-relay/server.mjs
//         app    NEXT_DIST_DIR=.next-p3 NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_PUBLIC_WORLD=1 NEXT_PUBLIC_MULTIPLAYER_URL=http://127.0.0.1:8805 npx next dev -p 8156
// Run:    node --experimental-websocket scripts/check-mp-phase3-browser.cjs --port=8156 --relay=http://127.0.0.1:8805 [--profile=phone,desktop|off]
// The page's Date.now is moved to 2 minutes past the next hour (Match o'clock); one scripted stranger joins the world, scores 3 goals
// (C.Goal) and takes a slot on that hour's pitch (C.Match Join), so the panel line, the note and the glow can be checked.
// One headless Chrome (--mute-audio); closes only its own browser and socket. Screenshots: docs/qa/phase3-*.png.
const { chromium } = require('playwright');
const { createLoader } = require('../tests/summit-harness.cjs');
const { LIVE_VENUES: VENUES } = createLoader()('lib/town/venues.ts');
const path = require('path');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'), relay = (arg('relay', '') || '').replace(/\/$/, '');
if (!port || port === '8092') { console.error('give --port=<n> (never 8092)'); process.exit(2); }
const url = `http://localhost:${port}`, QA = path.join(__dirname, '../docs/qa');
const profiles = arg('profile', 'phone,desktop').split(',');
const FIELDS = ['7v7', 'beach', 'futsal', '9v9'], MATCH_FIELDS = ['7v7', 'futsal', '9v9', '11v11', 'beach'];
const results = [];
const check = (name, ok, extra = '') => { results.push(!!ok); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' (' + extra + ')' : ''}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// 2 minutes past the next hour (UTC) -> that hour's Match o'clock pitch
const real = Date.now(), target = (Math.floor(real / 3_600_000) + 1) * 3_600_000 + 120_000, offset = target - real, hour = Math.floor(target / 3_600_000);
const pitch = FIELDS[hour % 4];

async function stranger(tag) { // one scripted world member: 3 goals, then a slot on the pitch
  const label = 'p3' + tag + Date.now().toString(36);
  const a = await (await fetch(relay + '/world?devip=' + label)).json();
  const ws = new WebSocket(relay.replace(/^http/, 'ws') + '/world/' + a.shard + '/ws?devip=' + label);
  await new Promise((res, rej) => {
    ws.onerror = rej;
    ws.onmessage = (e) => { const m = JSON.parse(e.data);
      if (m[0] === 32) { ws.send(JSON.stringify([11, m[1]])); ws.send(JSON.stringify([1, 1, 1000, 0, 500, 0, 0, 1, 0, 0])); for (let i = 0; i < 3; i++) ws.send('[61]');
        ws.send(JSON.stringify([19, 0, MATCH_FIELDS.indexOf(pitch), 1, 2])); res(); } };
    ws.onopen = () => ws.send(JSON.stringify([0, 1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], null, null]));
  });
  return ws;
}
async function boot(b, vp, mobile, off) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  await ctx.addInitScript((o) => { const n = Date.now; Date.now = () => n() + o;
    try { if (!sessionStorage.getItem('__p3')) { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-since-v1', 'old'); localStorage.setItem('fi2-public-hint-v1', 'hint'); localStorage.setItem('fi2-presence-mode-v1', 'others'); } sessionStorage.setItem('__p3', '1'); } catch { /* */ } }, off ? 0 : offset);
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/DevTools|favicon|ERR_CONNECTION|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await p.goto(url + '/play'); await p.waitForTimeout(4000);
  for (let i = 0; i < 4 && !(await p.evaluate(() => !!window.__fi2)); i++) { // a cold dev compile: try the title steps again
    await p.click('text=Get my save code', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
    await p.click('button:has-text("Get my code")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2500);
    await p.click('button:has-text("I saved it")', { timeout: 6000 }).catch(() => {}); await p.waitForTimeout(1500);
    await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(15000);
  }
  await p.waitForFunction(() => !!window.__fi2 && !!document.querySelector('[data-hud-triggers]'), null, { timeout: 180000 })
    .catch(async (e) => { await p.screenshot({ path: path.join(require('os').tmpdir(), 'p3-boot-fail.png') }); console.log('boot errors:', errs.slice(0, 3).join(' | ')); throw e; });
  await p.waitForTimeout(2500);
  return { ctx, p, errs };
}
const glowState = (p) => p.evaluate(() => { const s = window.__fi2.scene, out = {}; s.traverse((o) => { if (o.userData && o.userData.activityGlow) out[o.userData.activityGlow] = o.visible; }); return out; });

(async () => {
  const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
  try {
    for (const name of profiles) {
      if (name === 'off') { // a FLAG-OFF server: today's island, none of this
        const { ctx, p, errs } = await boot(b, { width: 390, height: 844 }, true, true);
        const s = await p.evaluate(() => ({ btn: document.querySelector('[data-party-open]')?.getAttribute('aria-label'), life: !!document.querySelector('[data-island-life]'), count: !!document.querySelector('[data-public-count]') }));
        const g = await glowState(p);
        check('off: no public count, no note, no glow objects', !s.count && !s.life && Object.keys(g).length === 0, JSON.stringify(s));
        await p.click('[data-party-open]').catch(() => {}); await p.waitForTimeout(800);
        check('off: no island goal line, no errors', !(await p.$('[data-island-goal]')) && errs.length === 0, errs.slice(0, 2).join(' | '));
        await ctx.close(); continue;
      }
      const desk = name === 'desktop', tag = desk ? 'desktop' : 'phone';
      const ws = await stranger(tag); await wait(500);
      const { ctx, p, errs } = await boot(b, desk ? { width: 1440, height: 900 } : { width: 390, height: 844 }, !desk, false);
      await p.evaluate(() => { const f = window.__fi2; try { f.selectRide('walk'); } catch { /* */ } });
      if (desk) await p.keyboard.press('ArrowUp'); else await p.mouse.click(390 * 0.2, 844 * 0.3);
      await p.waitForFunction(() => !!document.querySelector('[data-public-count]'), null, { timeout: 40000 }).catch(() => {});
      check(`${name}: in the world`, !!(await p.$('[data-public-count]')));
      await p.waitForSelector('[data-island-life="clock"]', { timeout: 30000 }).catch(() => {});
      const note = await p.evaluate(() => { const e = document.querySelector('[data-island-life="clock"]'); return e ? e.textContent : null; });
      check(`${name}: the Match o'clock note names the pitch, then the goal or a tip`, !!note && /Match o’clock/.test(note) && note.includes(VENUES.find((x) => x.id === pitch).name) && /Island goal today: \d+ of 50 goals|Tip: /.test(note), note || 'none');
      const stacked = await p.evaluate(() => document.querySelectorAll('[data-hud-slot="toast"]:not([data-hud-exit]), [data-public-first-card], [data-public-hint], [data-welcome-back]').length);
      check(`${name}: one message at a time`, stacked <= 1, String(stacked));
      if (note) await p.screenshot({ path: `${QA}/phase3-match-oclock-${tag}.png` });
      const g = await glowState(p);
      check(`${name}: the Match o'clock pitch glows (a stranger is on it too)`, g[pitch] === true && Object.entries(g).filter(([, v]) => v).length === 1, JSON.stringify(g));
      await p.click('[data-island-life]').catch(() => {}); await wait(700);
      // the glow from nearby: stand next to the centre spot (the beam stands on it), then one screenshot
      const v = VENUES.find((x) => x.id === pitch);
      await p.evaluate(([x, z]) => { const f = window.__fi2; f.location.x = x; f.location.z = z; f.rooftop?.reset?.(x, z); f.velocity.x = f.velocity.z = 0; }, [v.x + 4, v.z + 4]);
      await wait(2500); await p.screenshot({ path: `${QA}/phase3-glow-${tag}.png` });
      await p.click('[data-party-open]'); await p.waitForSelector('[data-presence-panel]', { timeout: 8000 }).catch(() => {}); await wait(600);
      const line = await p.evaluate(() => document.querySelector('[data-island-goal]')?.textContent || null);
      check(`${name}: the panel shows the island goal (the stranger's 3 goals at least)`, !!line && /^Island goal today: \d+ of 50 goals$/.test(line) && +line.match(/\d+/)[0] >= 3, line || 'none');
      await p.screenshot({ path: `${QA}/phase3-goal-panel-${tag}.png` });
      await p.keyboard.press('Escape'); await wait(500);
      ws.send('[8]'); ws.close(); await wait(2500);
      const g2 = await glowState(p);
      check(`${name}: the stranger left: only the Match o'clock glow stays`, g2[pitch] === true, JSON.stringify(g2));
      check(`${name}: no console errors`, errs.length === 0, errs.slice(0, 2).join(' | '));
      await ctx.close();
    }
  } finally { await b.close(); }
  const bad = results.filter((r) => !r).length;
  console.log(`phase3 browser: ${results.length - bad}/${results.length} ok`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
