// Headless check (Oct 23 2026): the phone emote bar shows five per page (arrows disabled at the start / the end) and a court juggler answers
// Pass it with the two-ball duet (both balls in play). Phone 390x844 + landscape 844x390 (layout numbers only).
// Run: node scripts/check-npc-emote-bar.cjs <appUrl> [outDir]   (closes only its own browser)
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8975', out = process.argv[3] || '/tmp/npc-emote-bar';
require('fs').mkdirSync(out, { recursive: true });

async function boot(b, viewport) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url, { timeout: 300000 }); await p.waitForTimeout(6000);
  await p.click('button:has-text("Start")').catch(() => {}); await p.waitForTimeout(2500); await p.click('button:has-text("Play")').catch(() => {}); await p.waitForTimeout(2000);
  await p.waitForFunction(() => window.__fi2 && window.__fi2.selectRide, null, { timeout: 300000 }); await p.waitForTimeout(3000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__fi2.selectRide('walk')); await p.waitForTimeout(1500);
  return { p, ctx, errs };
}
/** Stand `gap` m in front of the juggler, facing it. */
async function nearJuggler(p, gap) {
  return p.evaluate((gap) => {
    const f = window.__fi2, e = f.islandNpcs.entries.find((q) => q.id === 'court-kei');
    const X = e.position.x, Z = e.position.z + gap;
    f.location.x = X; f.location.z = Z; f.rooftop.reset(X, Z); f.player.root.rotation.y = Math.PI; f.velocity.x = f.velocity.z = 0;
    return { x: X, z: Z };
  }, gap);
}
const barState = (p) => p.evaluate(() => {
  const w = document.querySelector('[data-emote-wheel]'); if (!w) return null;
  const s = w.querySelector('.emote-wheel-strip'), r = s.getBoundingClientRect(), [l, rt] = w.querySelectorAll('.emote-wheel-arrow');
  const vis = [...s.querySelectorAll('.emote-wheel-btn')].filter((b) => { const q = b.getBoundingClientRect(); return q.left >= r.left - 1 && q.right <= r.right + 1; });
  const xs = vis.map((b) => { const q = b.getBoundingClientRect(); return Math.round(q.left + q.width / 2); });
  const gaps = xs.slice(1).map((x, i) => x - xs[i]);
  return { total: s.querySelectorAll('.emote-wheel-btn').length, visible: vis.length, labels: vis.map((b) => b.getAttribute('aria-label')), gaps, size: vis[0] ? Math.round(vis[0].getBoundingClientRect().width) : 0,
    left: l ? l.getAttribute('aria-disabled') : 'none', right: rt ? rt.getAttribute('aria-disabled') : 'none', wheel: (() => { const q = w.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)]; })(), vw: innerWidth, npc: w.getAttribute('data-emote-npc') };
});

(async () => {
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  let fail = 0; const bad = (m) => { fail++; console.log('FAIL: ' + m); };
  try {
    const { p, errs } = await boot(b, { width: 390, height: 844 });
    await nearJuggler(p, 3.6); await p.waitForTimeout(1500);
    await p.waitForSelector('[data-emote-btn]:not([data-hidden])', { timeout: 8000 }).catch(() => bad('emote button hidden near the juggler'));
    await p.click('[data-emote-btn]'); await p.waitForTimeout(700);
    const s0 = await barState(p); console.log('start', JSON.stringify(s0));
    if (!s0 || s0.total !== 10 || s0.visible !== 5 || s0.left !== 'true' || s0.right !== 'false') bad('start page: 10 emotes, 5 visible, left disabled, right live');
    if (s0 && Math.max(...s0.gaps) - Math.min(...s0.gaps) > 2) bad('evenly spaced: ' + s0.gaps);
    if (s0 && s0.size < 44) bad('44 px targets');
    await p.screenshot({ path: out + '/bar-start-phone.png' });
    await p.click('.emote-wheel-arrow[aria-label="More emotes"]'); await p.waitForTimeout(900);
    const s1 = await barState(p); console.log('end', JSON.stringify(s1));
    if (!s1 || s1.visible !== 5 || s1.left !== 'false' || s1.right !== 'true') bad('end page: 5 visible, right disabled, left live');
    await p.screenshot({ path: out + '/bar-end-phone.png' });
    await p.click('.emote-wheel-arrow[aria-label="More emotes"]', { force: true }).catch(() => {}); await p.waitForTimeout(500);
    const s2 = await barState(p); if (s2 && s2.labels.join() !== s1.labels.join()) bad('a disabled arrow moved the bar');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    // the juggler answers Pass it with the two-ball duet
    await nearJuggler(p, 3.6); await p.waitForTimeout(600);
    await p.evaluate(() => { const f = window.__fi2, e = f.islandNpcs.entries.find((q) => q.id === 'court-kei'), me = f.player.root.position; f.player.root.rotation.y = Math.atan2(e.position.x - me.x, e.position.z - me.z); f.emote(6); }); /* face the juggler (the game may have turned the player) */ await p.waitForTimeout(300);
    const d = await p.evaluate(() => { const f = window.__fi2, d = f.duet; return { on: d.on, npc: d.npc ? d.npc.id : null, kind: f.emoteFx.kind }; });
    console.log('duet', JSON.stringify(d)); if (!d.on || d.npc !== 'court-kei' || d.kind !== 6) bad('Pass it near the juggler starts the two-ball duet');
    let shot = false, maxNpcBall = 0, maxMine = 0, start = null;
    for (let i = 0; i < 40; i++) {
      const st = await p.evaluate(() => { const f = window.__fi2, e = f.islandNpcs.entries.find((q) => q.id === 'court-kei'), wb = e.freestyle.ball.getWorldPosition(new e.rig.root.position.constructor()); return { age: f.emoteFx.age, nb: [wb.x, wb.z], mb: [f.ball.position.x, f.ball.position.z], on: f.duet.on }; });
      if (!start) start = st;
      maxNpcBall = Math.max(maxNpcBall, Math.hypot(st.nb[0] - start.nb[0], st.nb[1] - start.nb[1])); maxMine = Math.max(maxMine, Math.hypot(st.mb[0] - start.mb[0], st.mb[1] - start.mb[1]));
      if (!shot && st.age > 1.5) { shot = true; await p.screenshot({ path: out + '/juggler-two-ball-phone.png' }); }
      if (!st.on) break; await p.waitForTimeout(250);
    }
    console.log('balls moved', maxMine.toFixed(2), maxNpcBall.toFixed(2)); if (maxMine < 1.5 || maxNpcBall < 1.5) bad('both balls travel');
    if (errs.length) bad('page errors: ' + errs.slice(0, 3).join(' | '));
    // landscape phone: five at a time, no overlap with the joystick
    const L = await boot(b, { width: 844, height: 390 });
    await nearJuggler(L.p, 3.6); await L.p.waitForTimeout(1500); await L.p.click('[data-emote-btn]').catch(() => bad('landscape: no emote button')); await L.p.waitForTimeout(700);
    const sl = await barState(L.p); const joy = await L.p.evaluate(() => { const j = document.querySelector('.touch-joystick, [data-joystick], .joystick'); if (!j) return null; const q = j.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)]; });
    console.log('landscape', JSON.stringify(sl), 'joystick', JSON.stringify(joy));
    if (!sl || sl.visible !== 5) bad('landscape: five at a time');
    if (sl && joy && !(sl.wheel[2] <= joy[0] || sl.wheel[0] >= joy[2] || sl.wheel[3] <= joy[1] || sl.wheel[1] >= joy[3])) bad('landscape: the bar overlaps the joystick');
  } catch (e) { bad(e.message); }
  await b.close();
  console.log(fail ? fail + ' failure(s)' : 'all ok'); process.exit(fail ? 1 : 0);
})();
