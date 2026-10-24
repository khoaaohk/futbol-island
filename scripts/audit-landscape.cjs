// Landscape audit (Oct 23 2026, docs/LANDSCAPE_AUDIT_OCT23.md): drives the production build on phone-landscape viewports and
// prints, per screen x size, a compact defect line measured from the DOM of the active layer (the topmost open dialog, else the page):
//   off    interactive element partly outside the viewport          notch  inside the emulated safe-area inset (env() is overridden)
//   small  tap target under 44 px on its short side                 covered  centre point is hit by another element (unreachable)
//   cut    text clipped (scrollWidth > clientWidth with overflow hidden / ellipsis)   dlg  dialog box taller than the viewport / scrolls
// Safe areas: Chrome's CDP Emulation.setSafeAreaInsetsOverride, so env(safe-area-inset-*) resolves like an iPhone in landscape.
// Scenes: journey (title -> onboarding -> island HUD + popups -> party of 4 -> emote ask/bar -> rotate), places (fishing, dive, rooms,
// Strikers, each with a rotate), perf (same pose landscape vs portrait at 3 spots). Sizes: se, i15, max, ipad (port = rotate target).
// SHOTS=scene:size,... overrides which screens are saved as PNG.
// Run: PW_CHANNEL=chrome node --experimental-websocket scripts/audit-landscape.cjs <appUrl> <relayUrl> <outDir> [scene,scene] [size,size]
//   (production build with NEXT_PUBLIC_MULTIPLAYER=1 NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; dev relay MP_DEV=1; closes only its own browser)
const pw = require('playwright');
const fs = require('fs');
const path = require('path');
const url = (process.argv[2] || 'http://localhost:8962').replace(/\/$/, ''), relay = (process.argv[3] || 'http://127.0.0.1:8963').replace(/\/$/, '');
const out = process.argv[4] || '/tmp/landscape-audit';
const onlyScenes = process.argv[5] ? process.argv[5].split(',') : null, onlySizes = process.argv[6] ? process.argv[6].split(',') : null;
fs.mkdirSync(out, { recursive: true });
const SIZES = {
  se: { w: 667, h: 375, inset: { top: 0, left: 0, right: 0, bottom: 0 } },
  i15: { w: 852, h: 393, inset: { top: 0, left: 59, right: 59, bottom: 21 } },
  max: { w: 932, h: 430, inset: { top: 0, left: 59, right: 59, bottom: 21 } },
  ipad: { w: 1024, h: 768, inset: { top: 0, left: 0, right: 0, bottom: 20 } },
  port: { w: 393, h: 852, inset: { top: 59, left: 0, right: 0, bottom: 34 } },
  pmax: { w: 440, h: 956, inset: { top: 62, left: 0, right: 0, bottom: 34 } },
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(size) {
  const s = SIZES[size];
  const b = await pw.chromium.launch({ channel: process.env.PW_CHANNEL || undefined, headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const setInset = (i) => cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: i }).catch(() => {});
  await setInset(s.inset);
  p.errors = []; p.on('pageerror', (e) => p.errors.push(e.message.slice(0, 140)));
  return { b, ctx, p, cdp, setInset, s };
}
// Rotate mid-session: viewport + safe area + screen orientation (CDP device metrics keeps isMobile / DPR 3).
async function rotate(env, size) {
  const s = SIZES[size];
  await env.cdp.send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: 3, mobile: true,
    screenOrientation: s.w > s.h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } });
  await env.p.setViewportSize({ width: s.w, height: s.h });
  await env.setInset(s.inset); env.s = s;
  await env.p.evaluate(() => { window.dispatchEvent(new Event('orientationchange')); });
  await env.p.waitForTimeout(1500);
}

async function enter(p) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
  await p.click('text=Get my save code', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(2000);
  await p.click('button:has-text("Get my code")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(2500);
  await p.click('button:has-text("I saved it")', { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.click('button:has-text("Play")', { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => !!document.querySelector('[data-job-wallet]'), null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(9000);
  await p.click('button:has-text("Skip")', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1500);
  await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(800);
}

// The DOM measurement (active layer only).
const measure = (p, inset) => p.evaluate((inset) => {
  const vw = innerWidth, vh = innerHeight, vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .05) return null; return r; };
  const layers = [...document.querySelectorAll('dialog[open],[role=dialog],[role=alertdialog],[aria-modal=true]')].filter((e) => vis(e) && !e.closest('[hidden],[inert]'));
  const root = layers.length ? layers[layers.length - 1] : document.body;
  const name = (e) => (e.getAttribute('aria-label') || e.textContent || e.getAttribute('placeholder') || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 22);
  // Inside a scroller and not fully inside its visible box (scrolled partly out of view): skip covered / overlap for it.
  const scrolled = (e, r) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 2) { const ar = a.getBoundingClientRect(); if (r.top < ar.top - 1 || r.bottom > ar.bottom + 1) return true; } } return false; };
  const res = { layer: root === document.body ? 'page' : name(root).slice(0, 18), n: 0, off: [], notch: [], small: [], covered: [], cut: [] };
  for (const e of root.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=tab],[role=slider],[role=switch]')) {
    const r = vis(e); if (!r || e.closest('[hidden],[inert],[aria-hidden=true]')) continue; res.n++;
    const nm = name(e);
    if (r.left < -2 || r.top < -2 || r.right > vw + 2 || r.bottom > vh + 2) {
      // Below the fold of a scroller that is itself on screen: reachable by scrolling, not a defect.
      let a = e.parentElement, scroll = false; while (a && a !== document.body) { const cs = getComputedStyle(a); if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (a.scrollHeight > a.clientHeight + 2 || a.scrollWidth > a.clientWidth + 2)) { const ar = a.getBoundingClientRect(); scroll = ar.bottom <= vh + 2 && ar.top >= -2; break; } a = a.parentElement; }
      if (!scroll) res.off.push(nm); continue;
    }
    if (r.left < inset.left - 1 || r.right > vw - inset.right + 1 || r.bottom > vh - inset.bottom + 1 || r.top < inset.top - 1) res.notch.push(nm);
    if (Math.min(r.width, r.height) < 43.5) res.small.push(`${nm}(${Math.round(r.width)}x${Math.round(r.height)})`);
    if (scrolled(e, r)) continue; // partly scrolled out of its list: reachable by scrolling, not covered
    const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (h && !e.contains(h) && !h.contains(e) && !(h.closest('label') && h.closest('label').contains(e))) res.covered.push(`${nm}<${(h.getAttribute('aria-label') || h.className || h.tagName).toString().slice(0, 18)}`);
  }
  // Partial overlaps between two tappable things (neither inside the other), over 15 % of the smaller box.
  const taps = [...root.querySelectorAll('button,a[href],input,[role=button],[role=tab]')].filter((e) => vis(e) && !e.closest('[hidden],[inert],[aria-hidden=true]') && !scrolled(e, e.getBoundingClientRect())).map((e) => [e, e.getBoundingClientRect()]);
  res.overlap = [];
  for (let i = 0; i < taps.length; i++) for (let j = i + 1; j < taps.length; j++) {
    const [a, ra] = taps[i], [b, rb] = taps[j]; if (a.contains(b) || b.contains(a)) continue;
    const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ix > 0 && iy > 0 && ix * iy > .15 * Math.min(ra.width * ra.height, rb.width * rb.height)) res.overlap.push(`${name(a)}~${name(b)}`);
  }
  for (const e of root.querySelectorAll('h1,h2,h3,p,span,b,strong,em,small,label,button,li')) {
    const r = vis(e); if (!r || !e.textContent.trim() || e.children.length > 2) continue; const cs = getComputedStyle(e);
    if ((cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis') && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 3) && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') res.cut.push(name(e));
  }
  if (root !== document.body) {
    const r = root.getBoundingClientRect(); let sc = null;
    for (const e of [root, ...root.querySelectorAll('*')]) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 4) { sc = `${e.clientHeight}/${e.scrollHeight}`; break; } }
    res.dlg = `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.top)}${r.bottom > vh + 2 || r.top < -2 ? ' OVERFLOW' : ''}${sc ? ' scroll ' + sc : ''}`;
  }
  const pageScroll = document.scrollingElement.scrollHeight > vh + 4 || document.scrollingElement.scrollWidth > vw + 4; if (pageScroll) res.pageScroll = `${document.scrollingElement.scrollWidth}x${document.scrollingElement.scrollHeight}`;
  return res;
}, inset);

const fmt = (m) => { const l = (k) => (m[k] && m[k].length ? ` ${k}[${m[k].length}]: ${[...new Set(m[k])].slice(0, 5).join(', ')}` : ''); return `layer=${m.layer} n=${m.n}${m.dlg ? ' dlg=' + m.dlg : ''}${m.pageScroll ? ' pageScroll=' + m.pageScroll : ''}${l('off')}${l('notch')}${l('small')}${l('covered')}${l('overlap')}${l('cut')}`; };
const results = [];
async function audit(env, size, scene, shot) {
  const m = await measure(env.p, env.s.inset);
  const line = `${scene.padEnd(18)} ${size.padEnd(5)} ${fmt(m)}`; console.log(line); results.push({ scene, size, ...m });
  if (shot) await env.p.screenshot({ path: path.join(out, `${scene}-${size}.png`) });
  return m;
}
const clickText = (p, sel, t = 6000) => p.locator(sel).filter({ visible: true }).first().click({ timeout: t }).then(() => true).catch(() => false);
const esc = async (p, n = 2) => { for (let i = 0; i < n; i++) { await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(500); } };
const labels = (p) => p.evaluate(() => [...document.querySelectorAll('button,a[href],[role=button],[role=tab]')].filter((e) => e.getBoundingClientRect().width && !e.closest('[hidden]')).map((e) => (e.getAttribute('aria-label') || e.textContent).replace(/\s+/g, ' ').trim().slice(0, 26)).join(' | '));

// ---- scenes ------------------------------------------------------------------------------------------------------------------
const { loadTs } = require('../multiplayer/dev-relay/loadTs.cjs');
const P = loadTs(path.join(__dirname, '../multiplayer/protocol/index.ts'));
function friend(code, name, look) {
  const f = { me: -1, pid: -1, ws: null, seq: 0, pose: null };
  f.ws = new WebSocket(relay.replace(/^http/, 'ws') + '/party/' + code + '/ws');
  f.ws.onopen = () => f.ws.send(JSON.stringify([P.C.Hello, P.PROTOCOL_VERSION, look, null, null, null, name]));
  f.ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m[0] === P.S.Welcome) { f.me = m[2]; for (const mi of m[7]) if (mi[0] !== f.me) f.pid = mi[0]; } if (m[0] === P.S.Caps) f.ws.send(JSON.stringify([P.C.Caps, m[1]])); };
  f.send = (body) => { f.pose = body; f.ws.send(JSON.stringify([P.C.Pose, f.seq++, ...body])); };
  f.raw = (m) => f.ws.send(JSON.stringify(m));
  f.beat = setInterval(() => { if (f.ws.readyState === 1 && f.pose) f.send(f.pose); }, 1000);
  f.close = () => { clearInterval(f.beat); try { f.ws.close(); } catch { /* gone */ } };
  return f;
}
// Renderer cost over ~3 s at the current pose: draw calls, triangles, rAF frame time (headless, real GPU via ANGLE/Metal).
const perf = (p) => p.evaluate(async () => {
  const f = window.__fi2, i = f.renderer.info.render, ts = []; let calls = 0, tris = 0, n = 0;
  // CPU time inside renderer.render (scene traversal, culling, state, draw submission): the part the wider frustum grows.
  const r = f.renderer, real = r.render; let cpu = 0, renders = 0; r.render = function (...a) { const t = performance.now(); const v = real.apply(this, a); cpu += performance.now() - t; renders++; return v; };
  await new Promise((done) => { const t0 = performance.now(); const step = (t) => { ts.push(t); calls += i.calls; tris += i.triangles; n++; if (t - t0 < 3000) requestAnimationFrame(step); else done(); }; requestAnimationFrame(step); });
  r.render = real;
  const d = ts.slice(1).map((t, k) => t - ts[k]).sort((a, b) => a - b);
  return { renderCpuMs: renders ? +(cpu / renders).toFixed(2) : null, calls: Math.round(calls / n), tris: Math.round(tris / n), ms50: +d[d.length >> 1].toFixed(1), ms90: +d[Math.floor(d.length * .9)].toFixed(1), fps: Math.round(1000 / (d.reduce((a, b) => a + b, 0) / d.length)), aspect: +f.camera.aspect.toFixed(2), pr: f.renderer.getPixelRatio(), canvas: `${f.renderer.domElement.width}x${f.renderer.domElement.height}` };
});
// Visible world content: objects whose bounding sphere is in the frustum, split by kind (people rigs, lights, points/sprites).
const inView = (p) => p.evaluate(() => {
  const f = window.__fi2, cam = f.camera, Th = { Frustum: null };
  const proj = cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse);
  // Plane test on world-space bounding spheres (three's Frustum is not exported here; 6 planes from the matrix).
  const e = proj.elements, pl = [[e[3] - e[0], e[7] - e[4], e[11] - e[8], e[15] - e[12]], [e[3] + e[0], e[7] + e[4], e[11] + e[8], e[15] + e[12]], [e[3] + e[1], e[7] + e[5], e[11] + e[9], e[15] + e[13]], [e[3] - e[1], e[7] - e[5], e[11] - e[9], e[15] - e[13]], [e[3] - e[2], e[7] - e[6], e[11] - e[10], e[15] - e[14]], [e[3] + e[2], e[7] + e[6], e[11] + e[10], e[15] + e[14]]].map((q) => { const l = Math.hypot(q[0], q[1], q[2]); return q.map((v) => v / l); });
  let mesh = 0, skinned = 0, pts = 0, inst = 0; void Th;
  f.scene.traverseVisible((o) => {
    if (!o.isMesh && !o.isPoints && !o.isSprite) return; const g = o.geometry; if (!g) return; if (!g.boundingSphere) g.computeBoundingSphere(); const s = g.boundingSphere; if (!s) return;
    const c = s.center.clone().applyMatrix4(o.matrixWorld), r = s.radius * o.matrixWorld.getMaxScaleOnAxis();
    for (const q of pl) if (q[0] * c.x + q[1] * c.y + q[2] * c.z + q[3] < -r) return;
    mesh++; if (o.isSkinnedMesh) skinned++; if (o.isPoints || o.isSprite) pts++; if (o.isInstancedMesh) inst += o.count;
  });
  // People in view: NPC / traffic / friend roots whose position is inside the frustum.
  let people = 0; const inF = (v) => pl.every((q) => q[0] * v.x + q[1] * v.y + q[2] * v.z + q[3] > -1.5);
  for (const root of [f.islandNpcs?.root, f.streetTraffic?.root].filter(Boolean)) for (const c of root.children) if (c.visible && inF(c.getWorldPosition(c.position.clone()))) people++;
  const sun = []; f.scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow) sun.push(o); }); const sc = sun[0]?.shadow.camera;
  // The player's on-screen height (feet to 1.8 m) in CSS px, and the camera distance.
  const feet = f.player.root.position.clone(), head = feet.clone(); head.y += 1.8; feet.project(cam); head.project(cam);
  const playerPx = Math.round(Math.abs(head.y - feet.y) / 2 * innerHeight), camDist = Math.round(cam.position.distanceTo(f.player.root.position));
  return { playerPx, camDist, fov: cam.fov, inFrustum: mesh, skinned, particles: pts, instances: inst, people, shadowMap: sun[0]?.shadow.mapSize.x ?? 0, shadowBox: sc ? `${Math.round(sc.right - sc.left)}x${Math.round(sc.top - sc.bottom)}m` : null };
});
async function gate(p) {
  await p.waitForFunction(() => /times/.test(document.querySelector('[data-parent-gate] label')?.textContent || ''), null, { timeout: 8000 });
  const q = (await p.textContent('[data-parent-gate] label')).toLowerCase();
  const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/), nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : +nn[0] * +nn[1]));
  await p.click('[data-parent-gate] button[type=submit]');
}
const SHOTS = new Set((process.env.SHOTS || 'title:i15,welcome:i15,island:se,island:i15,island:max,island:ipad,emotes:i15,pocket:i15,paths:i15,lesson:i15,map:i15,settings:i15,gate:se,party-code:i15,party-list:se,island-party:i15,emote-ask:i15,rotate-back:i15,join:se,fishing:i15,dive:i15,konbini:i15,museum:i15,arcade:i15,shop:se,strikers:i15,minimap:i15').split(','));
const A = (env, size, scene) => audit(env, size, scene, SHOTS.has(`${scene}:${size}`));
const flow = async (env, size, scene, fn) => { try { await fn(); } catch (e) { console.log(`${scene.padEnd(18)} ${size.padEnd(5)} STEP-FAIL ${e.message.split('\n')[0].slice(0, 120)}`); } };
const SCENES = {
  // New player: title -> welcome -> island HUD -> every HUD popup -> party (host, 3 scripted friends) -> emote ask -> rotate mid-party.
  async journey(env, size) {
    const p = env.p;
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
    await A(env, size, 'title');
    await flow(env, size, 'join', async () => { if (await clickText(p, 'text=Join friends')) { await p.waitForTimeout(1500); await A(env, size, 'join'); await esc(p); } });
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(5000);
    await clickText(p, 'text=Get my save code', 20000); await p.waitForTimeout(2500);
    await A(env, size, 'welcome');
    await clickText(p, 'button:has-text("Get my code")', 4000); await p.waitForTimeout(2500);
    await A(env, size, 'save-code');
    await clickText(p, 'button:has-text("I saved it")', 4000); await p.waitForTimeout(1500);
    await clickText(p, 'button:has-text("Play")', 8000);
    await p.waitForFunction(() => !!document.querySelector('[data-job-wallet]'), null, { timeout: 120000 }).catch(() => {});
    await p.waitForTimeout(9000);
    await A(env, size, 'tutorial');
    await clickText(p, 'button:has-text("Skip")', 8000); await p.waitForTimeout(1500); await esc(p, 1);
    await A(env, size, 'island');
    await p.evaluate(() => window.__fi2.selectRide('walk')); await p.waitForTimeout(2500); await A(env, size, 'island-walk');
    await flow(env, size, 'pocket', async () => { await p.click('[aria-label^="Your island pocket"]', { timeout: 4000 }); await p.waitForTimeout(1500); await A(env, size, 'pocket'); await esc(p); });
    await flow(env, size, 'paths', async () => {
      await p.click('[data-tour="quests"]', { timeout: 4000 }); await p.waitForTimeout(2000); await A(env, size, 'paths');
      const opened = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog],dialog[open]')].pop(); const b = d && [...d.querySelectorAll('button')].find((x) => /^(start|play|go|continue|learn|begin)/i.test(x.textContent.trim())); if (b) { b.click(); return b.textContent.trim().slice(0, 30); } return null; });
      if (opened) {
        await p.waitForTimeout(5000); console.log(`lesson opened via "${opened}"`); await A(env, size, 'lesson');
        // Rotate mid-lesson and back: the field view and its controls must re-frame.
        await rotate(env, 'port'); await A(env, 'port', 'lesson-portrait'); await rotate(env, size); await A(env, size, 'lesson-back');
        await clickText(p, 'button:has-text("Done")', 3000); await p.waitForTimeout(3000);
      }
      await esc(p, 2);
    });
    await flow(env, size, 'minimap', async () => { await clickText(p, '[aria-label="Expand map"]', 4000); await p.waitForTimeout(1500); await A(env, size, 'minimap'); });
    await flow(env, size, 'map', async () => { await p.evaluate(() => document.getElementById('corner-map')?.click()); await p.waitForTimeout(2500); await A(env, size, 'map'); await esc(p); });
    await flow(env, size, 'settings', async () => {
      await p.click('[data-hud-triggers] button[aria-label="Settings"]', { timeout: 4000 }); await p.waitForTimeout(1500); await A(env, size, 'settings');
      if (await clickText(p, 'text=/grown-?ups/i', 3000)) { await p.waitForTimeout(1500); await A(env, size, 'gate'); }
      await esc(p, 3);
    });
    // Perf at a fixed pose (walk, plaza), then the party.
    await p.evaluate(() => { const f = window.__fi2; f.selectRide('walk'); }); await p.waitForTimeout(2500);
    await p.evaluate(() => { const f = window.__fi2; const X = 23, Z = -62; f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.velocity.x = f.velocity.z = 0; }); await p.waitForTimeout(3000);
    console.log(`${'perf'.padEnd(18)} ${size.padEnd(5)} ${JSON.stringify({ ...(await perf(p)), ...(await inView(p)) })}`);
    let friends = [];
    await flow(env, size, 'party', async () => {
      await p.click('button[aria-label="Play with friends"]'); await p.waitForSelector('[role=dialog][aria-label="Play with friends"]', { timeout: 10000 }); await p.waitForTimeout(800);
      await A(env, size, 'party-name');
      await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(500);
      await p.click('text=Start a party'); await p.waitForSelector('[data-parent-gate-answer]'); await A(env, size, 'party-gate');
      await gate(p); await p.waitForSelector('[data-party-code]', { timeout: 10000 }); await p.waitForTimeout(800);
      await A(env, size, 'party-code');
      const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
      friends = [['Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]], ['Leo', [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5]], ['Mia', [1, 4, 1, 4, 2, 1, 3, 5, 6, 2, 3, 7]]].map(([n, l]) => friend(code, n, l));
      await wait(2000);
      if (await clickText(p, '[role=tab]:has-text("List"), [role=tab]:has-text("Friends")', 3000)) { await p.waitForTimeout(800); await A(env, size, 'party-list'); }
      await p.click('[data-party-sheet] button:has-text("Done")', { timeout: 4000 }).catch(() => esc(p)); await p.waitForTimeout(1500);
      const me = await p.evaluate(() => { const f = window.__fi2; return { x: f.location.x, z: f.location.z, y: f.player.root.position.y }; });
      friends.forEach((fr, k) => fr.send([Math.round((me.x + 3 + k * 2.5) * 10), Math.round(me.y * 10), Math.round((me.z - 2) * 10), 128, 0, P.Mode.Idle, 0, 0]));
      await wait(2500); await A(env, size, 'island-party');
      console.log(`${'perf-party'.padEnd(18)} ${size.padEnd(5)} ${JSON.stringify({ ...(await perf(p)), ...(await inView(p)) })}`);
      if (friends[0].pid >= 0) { friends[0].raw([P.C.EmoteAsk, friends[0].pid, P.Emote.PassBall]); if (await p.waitForSelector('[data-emote-ask]', { timeout: 4000 }).catch(() => null)) { await p.waitForTimeout(500); await A(env, size, 'emote-ask'); } }
      await clickText(p, 'button:has-text("No thanks")', 2000); await p.waitForTimeout(800);
      // Emote bar: Ayako steps up close so the Emotes button shows (it fades out with nobody near).
      friends[0].send([Math.round((me.x + 1.6) * 10), Math.round(me.y * 10), Math.round(me.z * 10), 192, 0, P.Mode.Idle, 0, 0]); await wait(2500);
      if (await clickText(p, 'button[data-emote-btn]', 3000)) { await p.waitForTimeout(1000); await A(env, size, 'emotes'); } else console.log(`${'emotes'.padEnd(18)} ${size.padEnd(5)} no Emotes button shown`);
      // Rotate mid-party with the emote bar open: portrait, then back to landscape. Nothing may stick (bar, camera aspect, HUD).
      await rotate(env, 'port'); await p.waitForTimeout(1500); await A(env, 'port', 'rotate-portrait');
      console.log(`${'perf-party'.padEnd(18)} ${'port'.padEnd(5)} ${JSON.stringify({ ...(await perf(p)), ...(await inView(p)) })}`);
      const portState = await p.evaluate(() => ({ aspect: +window.__fi2.camera.aspect.toFixed(2), canvas: `${window.__fi2.renderer.domElement.clientWidth}x${window.__fi2.renderer.domElement.clientHeight}`, vv: `${innerWidth}x${innerHeight}` }));
      await rotate(env, size); await p.waitForTimeout(1000); await A(env, size, 'rotate-back');
      const backState = await p.evaluate(() => ({ aspect: +window.__fi2.camera.aspect.toFixed(2), canvas: `${window.__fi2.renderer.domElement.clientWidth}x${window.__fi2.renderer.domElement.clientHeight}`, vv: `${innerWidth}x${innerHeight}` }));
      console.log(`${'rotate-state'.padEnd(18)} ${size.padEnd(5)} portrait=${JSON.stringify(portState)} back=${JSON.stringify(backState)}`);
    });
    friends.forEach((f) => f.close());
  },
  // Heat proxy: the same pose in landscape and portrait (CDP rotate), at three spots: renderer cost + what the wider frustum adds.
  async perf(env, size) {
    const p = env.p;
    await p.addInitScript(() => { sessionStorage.setItem('fi2-in-game', '1'); localStorage.setItem('fi2-welcome-v1', 'completed'); sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({ version: 1, x: 23, z: -62, yaw: 0, ride: 'walk', flightHeight: 0 })); });
    await p.goto(url + '/?from=arcade', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(() => window.__fi2 && !document.querySelector('[data-island-return-loading]'), null, { timeout: 120000 }); await p.waitForTimeout(6000);
    for (const [spot, x, z] of [['plaza', 23, -62], ['harbour', 217, 200], ['town', 104, 40]]) {
      await p.evaluate(({ x, z }) => { const f = window.__fi2; f.location.x = x; f.location.z = z; f.rooftop.reset(x, z); f.velocity.x = f.velocity.z = 0; }, { x, z }); await p.waitForTimeout(3500);
      for (const o of [size, 'port']) {
        await rotate(env, o); await p.waitForTimeout(2500);
        console.log(`${('perf-' + spot).padEnd(18)} ${o.padEnd(5)} ${JSON.stringify({ ...(await perf(p)), ...(await inView(p)) })}`);
        // PERF_SHOTS=1: one plaza screenshot per orientation (camera framing before/after, docs/LANDSCAPE_AUDIT_OCT23.md batch 2).
        if (process.env.PERF_SHOTS && spot === 'plaza') await p.screenshot({ path: path.join(out, `perf-plaza-${o === 'port' ? 'port' : size}.png`), scale: 'css' });
      }
      await rotate(env, size);
    }
  },
  // Places reached directly (the arcade-return path drops the player at a spot): fishing, dive, rooms, Strikers.
  async places(env, size) {
    const p = env.p;
    const at = async (x, z, ride = 'walk') => {
      await p.addInitScript(({ x, z, ride }) => { sessionStorage.setItem('fi2-in-game', '1'); localStorage.setItem('fi2-welcome-v1', 'completed'); sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({ version: 1, x, z, yaw: 0, ride, flightHeight: 0 })); }, { x, z, ride });
      await p.goto(url + '/?from=arcade', { waitUntil: 'domcontentloaded', timeout: 120000 });
      await p.waitForFunction(() => window.__fi2 && !document.querySelector('[data-island-return-loading]'), null, { timeout: 120000 }); await p.waitForTimeout(4000);
    };
    await flow(env, size, 'fishing', async () => {
      await at(217, 211.4); await p.locator('[data-fish-enter]').tap({ timeout: 8000 }); await p.waitForTimeout(3000); await A(env, size, 'fishing');
      await p.locator('[data-fish-reel]').tap({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(2500); await A(env, size, 'fishing-cast');
      // Rotate mid-fishing (portrait and back): the reel and Back must stay reachable.
      await rotate(env, 'port'); await A(env, 'port', 'fishing-portrait'); await rotate(env, size); await A(env, size, 'fishing-back');
    });
    await flow(env, size, 'dive', async () => {
      await at(512, -256); for (const dz of [-10, -20, -30, -36]) { await p.evaluate(({ dz }) => { const l = window.__fi2.location; l.x = 512; l.z = -256 + dz; }, { dz }); await p.waitForTimeout(1200); }
      await A(env, size, 'swim');
      const go = await p.$('[data-dive-go]:not([hidden])'); if (go) { await go.tap(); await p.waitForTimeout(4000); }
      await A(env, size, 'dive');
      console.log(`${'perf-dive'.padEnd(18)} ${size.padEnd(5)} ${JSON.stringify(await perf(p))}`);
    });
    for (const [scene, page] of [['konbini', '/konbini?door=main'], ['museum', '/museum'], ['arcade', '/arcade'], ['shop', '/shop']]) await flow(env, size, scene, async () => {
      await p.goto(url + page, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(10000); await esc(p, 1); await A(env, size, scene);
    });
    await flow(env, size, 'strikers', async () => {
      await p.goto(url + '/arcade?game=live', { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(10000); await A(env, size, 'strikers');
      const card = await p.evaluate(() => { const k = [...document.querySelectorAll('button')].find((b) => /kick off/i.test(b.textContent)); let c = k; while (c && c.getBoundingClientRect().height < 220) c = c.parentElement; if (!c) return null; const r = c.getBoundingClientRect(), cs = getComputedStyle(c); return `card ${Math.round(r.top)}..${Math.round(r.bottom)} of ${innerHeight}, overflowY=${cs.overflowY}, scroll ${c.scrollHeight}/${c.clientHeight}, kickoff bottom ${Math.round(k.getBoundingClientRect().bottom)}`; });
      console.log(`${'strikers-card'.padEnd(18)} ${size.padEnd(5)} ${card}`);
      await rotate(env, 'port'); await p.waitForTimeout(1000); await A(env, 'port', 'strikers-portrait');
      const prompt = await p.evaluate(() => [...document.querySelectorAll('*')].some((e) => /rotate|turn your/i.test(e.textContent || '') && e.children.length < 3 && e.getBoundingClientRect().width > 0));
      await rotate(env, size); await p.waitForTimeout(1500); await A(env, size, 'strikers-back');
      console.log(`${'strikers-rotate'.padEnd(18)} ${size.padEnd(5)} portraitPrompt=${prompt}`);
    });
  },
  // Batch 1 blockers (landscape fix pass, Oct 23): title fold, Pick your player, party List (host; GUEST=1 adds a guest device),
  // fishing Back vs the friends button, Strikers start card. Prints one `b1-*` line per check with the measured boxes.
  async batch1(env, size) {
    const p = env.p, log = (k, v) => console.log(`${k.padEnd(18)} ${size.padEnd(5)} ${typeof v === 'string' ? v : JSON.stringify(v)}`);
    const portrait = env.s.h > env.s.w;
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(6000);
    log('b1-title', await p.evaluate(() => { const vh = innerHeight, at = (re) => { const e = [...document.querySelectorAll('a,button')].find((x) => re.test(x.textContent) && x.getBoundingClientRect().width); return e ? Math.round(e.getBoundingClientRect().bottom) : null; };
      return { vh, pageScroll: document.scrollingElement.scrollHeight - vh, grownups: at(/grown-?ups/i), privacy: at(/privacy/i) }; }));
    await A(env, size, 'title');
    await clickText(p, 'text=Get my save code', 20000); await p.waitForTimeout(2500);
    log('b1-welcome', await p.evaluate(() => ({ vh: innerHeight, pageScroll: document.scrollingElement.scrollHeight - innerHeight })));
    await clickText(p, 'button:has-text("Get my code")', 4000); await p.waitForTimeout(2500);
    await clickText(p, 'button:has-text("I saved it")', 4000); await p.waitForTimeout(1500);
    await clickText(p, 'button:has-text("Play")', 8000);
    await p.waitForFunction(() => !!document.querySelector('[data-job-wallet]'), null, { timeout: 120000 }).catch(() => {});
    await p.waitForTimeout(9000);
    log('b1-onboarding', await onboardingBoxes(p));
    await A(env, size, 'tutorial');
    await clickText(p, 'button:has-text("Skip")', 8000); await p.waitForTimeout(1500); await esc(p, 1);
    let friends = [];
    await flow(env, size, 'party', async () => {
      await p.click('button[aria-label="Play with friends"]'); await p.waitForSelector('[role=dialog][aria-label="Play with friends"]', { timeout: 10000 }); await p.waitForTimeout(800);
      await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(500);
      await p.click('text=Start a party'); await p.waitForSelector('[data-parent-gate-answer]'); await gate(p); await p.waitForSelector('[data-party-code]', { timeout: 10000 }); await p.waitForTimeout(800);
      const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
      friends = [['Ayako', [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]], ['Leo', [2, 7, 1, 8, 2, 8, 1, 8, 2, 8, 4, 5]], ['Mia', [1, 4, 1, 4, 2, 1, 3, 5, 6, 2, 3, 7]]].map(([n, l]) => friend(code, n, l));
      await wait(2500);
      await clickText(p, '[role=tab]:has-text("List")', 3000); await p.waitForTimeout(900);
      log('b1-party-host', await partyBoxes(p, env.s.inset)); await A(env, size, 'party-list');
      if (process.env.GUEST === '1') {
        const g = await env.b.newContext({ viewport: { width: env.s.w, height: env.s.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }); const gp = await g.newPage();
        await (await g.newCDPSession(gp)).send('Emulation.setSafeAreaInsetsOverride', { insets: env.s.inset }).catch(() => {});
        await gp.goto(url + '/?party=' + code, { waitUntil: 'domcontentloaded', timeout: 120000 }); await gp.waitForTimeout(6000);
        await clickText(gp, 'text=Get my save code', 20000); await gp.waitForTimeout(2500); await clickText(gp, 'button:has-text("Get my code")', 4000); await gp.waitForTimeout(2500);
        await clickText(gp, 'button:has-text("I saved it")', 4000); await gp.waitForTimeout(1500); await clickText(gp, 'button:has-text("Play")', 8000);
        await gp.waitForFunction(() => !!window.__fi2?.scene, null, { timeout: 120000 }).catch(() => {}); await gp.waitForTimeout(9000);
        await clickText(gp, 'button:has-text("Skip")', 8000); await gp.waitForTimeout(1200);
        await gp.waitForSelector('[data-party-join]', { timeout: 20000 }).catch(() => {});
        await gp.fill('input[aria-label="First name"]', 'Kai').catch(() => {}); await gp.waitForTimeout(500);
        await gp.click('[data-party-join] button:has-text("Join")').catch(() => {}); await gate(gp).catch(() => {});
        await gp.waitForFunction(() => document.querySelector('[data-party-open]')?.getAttribute('data-party-live') === 'true', null, { timeout: 20000 }).catch(() => {});
        await gp.waitForTimeout(1500); await gp.evaluate(() => document.querySelector('[data-party-open]')?.click()); await gp.waitForTimeout(1200);
        await clickText(gp, '[role=tab]:has-text("List")', 3000); await gp.waitForTimeout(900);
        log('b1-party-guest', await partyBoxes(gp, env.s.inset)); if (SHOTS.has(`party-guest:${size}`)) await gp.screenshot({ path: path.join(out, `party-guest-${size}.png`) });
        await g.close();
      }
    });
    friends.forEach((f) => f.close());
    await flow(env, size, 'fishing', async () => {
      await p.addInitScript(() => { sessionStorage.setItem('fi2-in-game', '1'); localStorage.setItem('fi2-welcome-v1', 'completed'); sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({ version: 1, x: 217, z: 211.4, yaw: 0, ride: 'walk', flightHeight: 0 })); });
      await p.goto(url + '/?from=arcade', { waitUntil: 'domcontentloaded', timeout: 120000 });
      await p.waitForFunction(() => window.__fi2 && !document.querySelector('[data-island-return-loading]'), null, { timeout: 120000 }); await p.waitForTimeout(4000);
      await p.locator('[data-fish-enter]').tap({ timeout: 8000 }); await p.waitForTimeout(3000);
      log('b1-fishing', await p.evaluate(() => { const rr = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? r : null; }, b = rr(document.querySelector('[data-fish-stop]')), f = rr([...document.querySelectorAll('button[aria-label="Play with friends"],[data-party-open]')].find((e) => e.getBoundingClientRect().width));
        const box = (r) => r && `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
        const ov = b && f ? Math.max(0, Math.min(b.right, f.right) - Math.max(b.left, f.left)) * Math.max(0, Math.min(b.bottom, f.bottom) - Math.max(b.top, f.top)) : 0;
        const hit = b && document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2), back = document.querySelector('[data-fish-stop]');
        const w = rr(document.querySelector('[data-job-wallet]')), wov = b && w ? Math.max(0, Math.min(b.right, w.right) - Math.max(b.left, w.left)) * Math.max(0, Math.min(b.bottom, w.bottom) - Math.max(b.top, w.top)) : 0;
        return { back: box(b), friends: box(f), wallet: box(w), overlapPx: Math.round(ov), walletOverlapPx: Math.round(wov), backHit: !!(hit && (back.contains(hit) || hit.contains(back))) }; }));
      await A(env, size, 'fishing');
    });
    if (!portrait) await flow(env, size, 'strikers', async () => {
      await p.goto(url + '/arcade?game=live', { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(10000);
      log('b1-strikers', await p.evaluate(() => { const k = [...document.querySelectorAll('button')].find((b) => /kick off/i.test(b.textContent)); const c = k && k.closest('[class*=card]'); if (!c) return null; const r = c.getBoundingClientRect();
        return { vh: innerHeight, card: `${Math.round(r.top)}..${Math.round(r.bottom)}`, fits: r.bottom <= innerHeight && r.top >= 0, scroll: `${c.clientHeight}/${c.scrollHeight}`, selects: [...c.querySelectorAll('select')].map((s) => Math.round(s.getBoundingClientRect().height)) }; }));
      await A(env, size, 'strikers');
    });
  },
};
// Pick your player: the scroller inside the card, and each control's box (COVERED / CLIPPED when not fully tappable).
const onboardingBoxes = (p) => p.evaluate(() => {
  const d = document.querySelector('dialog[open][data-onboarding-step]'); if (!d) return null; const card = d.querySelector('section');
  const sc = [card, ...card.querySelectorAll('*')].find((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 2);
  const cr = card.getBoundingClientRect(), pv = card.querySelector('[class*=preview]'), pr = pv && pv.getBoundingClientRect();
  const box = (re) => { const e = [...card.querySelectorAll('button,[role=radio]')].find((x) => re.test((x.getAttribute('aria-label') || x.textContent || '').trim()) && x.getBoundingClientRect().width); if (!e) return null; const r = e.getBoundingClientRect();
    const ok = (y) => { const h = document.elementFromPoint(r.left + r.width / 2, y); return !!h && (e.contains(h) || h.contains(e)); };
    let clip = false; for (let a = e.parentElement; a && a !== card.parentElement; a = a.parentElement) { if (getComputedStyle(a).overflowY !== 'visible') { const ar = a.getBoundingClientRect(); if (r.top < ar.top - 1 || r.bottom > ar.bottom + 1) clip = true; } }
    return `${Math.round(r.top)}-${Math.round(r.bottom)}${clip ? ' CLIPPED' : ''}${ok(r.top + 3) && ok(r.bottom - 3) ? '' : ' COVERED'}`; };
  return { step: d.dataset.onboardingStep, card: `${Math.round(cr.width)}x${Math.round(cr.height)}@${Math.round(cr.top)}`, scroll: sc ? `${sc.clientHeight}/${sc.scrollHeight}` : 'none', preview: pr ? `${Math.round(pr.width)}x${Math.round(pr.height)}` : null,
    male: box(/^Male$/), female: box(/^Female$/), shuffle: box(/shuffle/i), back: box(/^Back$/), next: box(/^Next$/) };
});
// Party List tab: every row action and the footer link, scrolled into view inside the list; reports any whose top or bottom edge
// is hit by something else (the footer) or that sits in the right safe-area inset.
const partyBoxes = (p, inset) => p.evaluate((inset) => {
  const sheet = document.querySelector('[data-party-sheet]'); if (!sheet) return null; const foot = sheet.querySelector('[data-party-panel=party] [data-party-foot]');
  const bad = [], btns = [...sheet.querySelectorAll('[data-party-panel=party] [data-row-actions] button, [data-party-panel=party] [data-party-foot] button')];
  for (const e of btns) { e.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); const r = e.getBoundingClientRect(); const nm = (e.textContent || '').trim().slice(0, 14);
    const hit = (y) => { const h = document.elementFromPoint(r.left + r.width / 2, y); return !!h && (e.contains(h) || h.contains(e)); };
    if (!hit(r.top + 3) || !hit(r.bottom - 3)) { const h = document.elementFromPoint(r.left + r.width / 2, r.bottom - 3); bad.push(`${nm}<${h ? (h.closest('[data-party-foot]') ? 'foot' : (h.className || h.tagName).toString().slice(0, 14)) : 'none'}`); }
    if (r.right > innerWidth - inset.right + 1 || r.left < inset.left - 1) bad.push(`${nm}@inset(${Math.round(r.right)}>${innerWidth - inset.right})`);
    if (Math.min(r.width, r.height) < 43.5) bad.push(`${nm}(${Math.round(r.width)}x${Math.round(r.height)})`); }
  const s = sheet.getBoundingClientRect(), f = foot && foot.getBoundingClientRect();
  return { sheet: `${Math.round(s.width)}x${Math.round(s.height)}@${Math.round(s.top)}`, foot: f ? `${Math.round(f.top)}..${Math.round(f.bottom)}` : null, buttons: btns.length, bad };
}, inset);

async function run() {
  const sizes = onlySizes || ['se', 'i15', 'max', 'ipad'];
  for (const scene of onlyScenes || Object.keys(SCENES)) for (const size of sizes) {
    const env = await open(size);
    try { await SCENES[scene](env, size); } catch (e) { console.log(`${scene} ${size} ERROR ${e.message.slice(0, 160)}`); }
    if (env.p.errors.length) console.log(`${scene} ${size} pageerrors: ${[...new Set(env.p.errors)].slice(0, 3).join(' / ')}`);
    await env.b.close();
  }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 1));
}
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
