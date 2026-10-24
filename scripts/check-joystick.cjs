// Phone movement stick (owner, Oct 23 2026): bigger ring, see-through knob, FLOATING base in the left zone.
// Live app + Playwright touch emulation (isMobile/hasTouch, CDP safe-area insets). Per size: ring/knob size and opacity, the resting
// ring's gap to every other control (>= 12 px), and the left zone never overlapping the right-side buttons, the minimap or the HUD row.
// At 393x852 and 852x393 it also drags real CDP touches from several zone points (the ring anchors there and the player walks the
// dragged way, screen-relative) and presses the emote button / emote bar / kick button (the stick must not start).
// Run: PW_CHANNEL=chrome node scripts/check-joystick.cjs <appUrl> [outDir]   (closes only its own browser)
const pw = require('playwright'), fs = require('fs'), path = require('path'), ts = require('typescript'), vm = require('vm');
const url = process.argv[2] || 'http://localhost:8247', out = process.argv[3] || '/tmp/check-joystick';
fs.mkdirSync(out, { recursive: true });
const load = (f) => { const m = { exports: {} }; vm.runInNewContext(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { module: m, exports: m.exports, Math }); return m.exports; };
const F = load(path.join(__dirname, '../lib/town/floatingStick.ts'));
const SIZES = [
  { n: '320', w: 320, h: 640, inset: { top: 20, bottom: 0, left: 0, right: 0 } },
  { n: '360', w: 360, h: 780, inset: { top: 24, bottom: 0, left: 0, right: 0 } },
  { n: '393', w: 393, h: 852, inset: { top: 59, bottom: 34, left: 0, right: 0 }, drag: true },
  { n: '440', w: 440, h: 956, inset: { top: 62, bottom: 34, left: 0, right: 0 } },
  { n: '667L', w: 667, h: 375, inset: { top: 0, bottom: 0, left: 20, right: 20 } },
  { n: '852L', w: 852, h: 393, inset: { top: 0, bottom: 21, left: 59, right: 59 }, drag: true },
  { n: '932L', w: 932, h: 430, inset: { top: 0, bottom: 21, left: 59, right: 59 } },
];
const fails = [], bad = (m) => { fails.push(m); console.log('FAIL ' + m); };
const gapOf = (a, b) => Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom);
const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

async function boot(b, s) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }), p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: s.inset }).catch(() => {});
  p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message.slice(0, 140)));
  await p.addInitScript(() => { for (const [k, v] of [['fi2-welcome-v1', 'completed'], ['fi2-sound-muted', 'true'], ['fi2-music-enabled', 'false'], ['fi2-voice-enabled', 'false']]) localStorage.setItem(k, v); });
  await p.goto(url, { timeout: 300000 }); await p.waitForTimeout(5000);
  await p.click('button:has-text("Start")').catch(() => {}); await p.waitForTimeout(2500); await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(2000);
  await p.waitForFunction(() => window.__fi2 && window.__fi2.selectRide, null, { timeout: 300000 }); await p.waitForTimeout(3000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__fi2.selectRide('walk')); await p.waitForTimeout(1500);
  return { ctx, p, cdp };
}
const layout = (p) => p.evaluate((S) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const j = document.querySelector('.joystick'), k = j.querySelector('span'), ins = getComputedStyle(document.querySelector('.stick-insets'));
  const controls = [];
  for (const [name, sel] of [['button', '.travel-actions button'], ['minimap', '.town-minimap'], ['hud', '.hud-stack'], ['hud', '.town-top-actions'], ['emote', '[data-emote-wheel]']])
    document.querySelectorAll(sel).forEach((e) => { if (vis(e)) controls.push({ name: name + ':' + (e.getAttribute('aria-label') || e.className).slice(0, 24), sel, ...R(e) }); });
  let hud = 0, buttons = innerWidth;
  for (const n of document.querySelectorAll(S.hud)) { const b = n.getBoundingClientRect().bottom; if (b <= S.max && b > hud && vis(n)) { hud = b; controls.push({ name: 'hud:' + (n.getAttribute('aria-label') || n.className).slice(0, 24), sel: S.hud, ...R(n) }); } }
  for (const n of document.querySelectorAll(S.right)) if (vis(n)) buttons = Math.min(buttons, n.getBoundingClientRect().left);
  return { ring: R(j), knob: R(k), ringOpacity: +getComputedStyle(j).opacity, knobOpacity: +getComputedStyle(k).opacity, floating: j.dataset.floating, controls, hud, buttons,
    insets: { top: parseFloat(ins.paddingTop), right: parseFloat(ins.paddingRight), bottom: parseFloat(ins.paddingBottom), left: parseFloat(ins.paddingLeft) } };
}, { hud: F.STICK_HUD_SELECTOR, right: F.STICK_RIGHT_SELECTOR, max: F.HUD_ROW_MAX });
const touch = (cdp, type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 7, radiusX: 8, radiusY: 8, force: 1 }] });
/** Screen-space direction of the player's ground velocity. */
const walkDir = (p) => p.evaluate(() => { const d = window.__fi2, c = d.camera, a = d.player.root.position.clone(), b = a.clone(); b.x += d.velocity.x; b.z += d.velocity.z; a.project(c); b.project(c);
  return { sx: (b.x - a.x) * innerWidth / 2, sy: -(b.y - a.y) * innerHeight / 2, speed: Math.hypot(d.velocity.x, d.velocity.z), anchored: !!document.querySelector('.joystick').dataset.anchored }; });
const place = (p) => p.evaluate(() => { const d = window.__fi2; d.rideRef.current = 'walk'; d.pendingRide.current = null; d.location.x = 51; d.location.z = 30; d.velocity.x = d.velocity.z = 0; d.rooftop.reset(51, 30); });

(async () => {
  const b = await pw.chromium.launch({ channel: process.env.PW_CHANNEL || undefined, headless: true, args: ['--mute-audio'] });
  try {
    for (const s of SIZES) {
      const { ctx, p, cdp } = await boot(b, s), L = await layout(p);
      const zone = F.stickZone(s.w, s.h, L.insets, L.hud, L.buttons), D = Math.round(L.ring.width);
      let minGap = Infinity, near = '';
      for (const c of L.controls) { if (c.sel === '[data-emote-wheel]') continue; const g = gapOf(L.ring, c); if (g < minGap) { minGap = g; near = c.name; } if (g < 12) bad(`${s.n}: resting ring ${Math.round(g)} px from ${c.name}`); }
      for (const c of L.controls) if (c.sel !== '[data-emote-wheel]' && overlap(zone, c)) bad(`${s.n}: zone overlaps ${c.name}`);
      if (L.floating !== 'true') bad(`${s.n}: stick is not floating on a phone`);
      if (D < 140 || D > 222) bad(`${s.n}: ring ${D} px`);
      if (Math.abs(L.knob.width / L.ring.width - 0.55) > 0.02) bad(`${s.n}: knob ${Math.round(L.knob.width)} px is not 55% of the ring`);
      const rest = L.ringOpacity * L.knobOpacity; if (rest < 0.4 || rest > 0.56) bad(`${s.n}: resting knob opacity ${rest.toFixed(2)}`);
      if (zone.right - zone.left < D || zone.bottom - zone.top < D) bad(`${s.n}: zone ${Math.round(zone.right - zone.left)}x${Math.round(zone.bottom - zone.top)} is smaller than the ring`);
      console.log(`${s.n} ${s.w}x${s.h}: ring ${D}px knob ${Math.round(L.knob.width)}px opacity rest ${rest.toFixed(2)} | zone x${Math.round(zone.left)}-${Math.round(zone.right)} y${Math.round(zone.top)}-${Math.round(zone.bottom)} | nearest ${near} ${Math.round(minGap)}px`);
      if (s.drag) {
        await p.screenshot({ path: path.join(out, `idle-${s.w}x${s.h}.png`) });
        const zw = zone.right - zone.left, zh = zone.bottom - zone.top, T = F.stickTravel(D);
        const tries = [[0.35, 0.45, 1, 0], [0.6, 0.7, 0, -1], [0.15, 0.95, -0.7, 0.7], [0.5, 0.25, 0.7, -0.7]];
        for (const [fx, fy, dx, dy] of tries) {
          await place(p); await p.waitForTimeout(400);
          const x = zone.left + zw * fx, y = zone.top + zh * fy;
          await touch(cdp, 'touchStart', x, y); await p.waitForTimeout(80);
          const ring = await p.evaluate(() => { const r = document.querySelector('.joystick').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
          const want = F.clampAnchor(x, y, zone, D / 2); if (Math.hypot(ring.x - want.x, ring.y - want.y) > 2) bad(`${s.n}: ring anchored at ${Math.round(ring.x)},${Math.round(ring.y)} not ${Math.round(want.x)},${Math.round(want.y)}`);
          for (let i = 1; i <= 6; i++) { await touch(cdp, 'touchMove', ring.x + dx * T * i / 6, ring.y + dy * T * i / 6); await p.waitForTimeout(30); }
          await p.waitForTimeout(700);
          if (s.n === '393' && fx === 0.35) await p.screenshot({ path: path.join(out, `active-${s.w}x${s.h}.png`) });
          const w = await walkDir(p), cos = (w.sx * dx + w.sy * dy) / Math.max(1e-6, Math.hypot(w.sx, w.sy) * Math.hypot(dx, dy));
          if (!w.anchored || w.speed < 3 || cos < 0.85) bad(`${s.n}: drag from ${Math.round(x)},${Math.round(y)} dir ${dx},${dy}: speed ${w.speed.toFixed(2)} cos ${cos.toFixed(2)} anchored ${w.anchored}`);
          await touch(cdp, 'touchEnd'); await p.waitForTimeout(500);
          const after = await walkDir(p); if (after.anchored) bad(`${s.n}: ring still anchored after release`);
        }
        // Presses that start on UI never start the stick.
        await place(p);
        const at = async (sel, label) => {
          const c = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }, sel);
          if (!c) { console.log(`${s.n}: (no ${label} to press)`); return; }
          await touch(cdp, 'touchStart', c.x, c.y); await p.waitForTimeout(60); await touch(cdp, 'touchMove', c.x + 30, c.y - 30); await p.waitForTimeout(300);
          const w = await walkDir(p); await touch(cdp, 'touchEnd'); await p.waitForTimeout(500);
          if (w.anchored) bad(`${s.n}: a press on the ${label} started the stick`); else console.log(`${s.n}: ${label} press leaves the stick alone`);
        };
        await at('.travel-actions .touch-shoot', 'kick button'); await at('[data-emote-btn]', 'emote button');
        // The emote bar opens beside an NPC (scripts/check-npc-emote-bar.cjs): stand 3.6 m from the court juggler first.
        await p.evaluate(() => { const f = window.__fi2, e = f.islandNpcs.entries.find((q) => q.id === 'court-kei'); if (!e) return; const X = e.position.x, Z = e.position.z + 3.6; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.PI; f.velocity.x = f.velocity.z = 0; });
        await p.waitForTimeout(1500); await p.click('[data-emote-btn]').catch(() => {}); await p.waitForTimeout(800);
        await at('[data-emote-wheel] .emote-wheel-btn', 'emote bar');
      }
      if (p.errs.length) bad(`${s.n}: page errors ${p.errs.slice(0, 2).join(' | ')}`);
      await ctx.close();
    }
  } finally { await b.close(); }
  console.log(fails.length ? `check-joystick: ${fails.length} failure(s)` : 'check-joystick: OK');
  process.exit(fails.length ? 1 : 0);
})();
