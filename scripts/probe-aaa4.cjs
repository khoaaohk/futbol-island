// AAA 4 (Nov 25 2026): before / after evidence for the train-feel pass, on ONE headless Chrome (--mute-audio, closed at the end).
// Scenes (--parts, default all), each on desktop and phone (--dev=desktop,phone):
//   dwell    riding into Summit Isle, Inside view: a rider stands before the stop, walks off (frame sequence), boarders walk on
//   platform the same stop from the Left / Right view (the platform side): the walkers on the platform
//   seat     Seat view mid-run (idles: chat, kid legs, doze, phone glance), two frames 1 s apart
//   stadium  passing the West Coast Stadium (fans wave scarves), Inside view
//   tunnel   inside the Summit tunnel (the interior light), and the Front view at the west portal (the headlamp transition)
//   kenji    Front view at a stop (Kenji waves at the platform) and just after departure (cap tip / pointing)
//   night    (--time=night) outside, the pantograph spark / glow
// Needs: app  NEXT_DIST_DIR=.next-aaa4 npx next dev -p 9200    Run: node scripts/probe-aaa4.cjs --port=9200 --shots=<dir> --tag=before
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const port = arg('port'); if (!port || port === '8092') { console.error('give --port=<n>'); process.exit(2); }
const url = `http://localhost:${port}`, parts = arg('parts', 'dwell,platform,seat,stadium,tunnel,kenji').split(','), shots = arg('shots', ''), tag = arg('tag', 'after');
const devs = arg('dev', 'desktop,phone').split(','), tod = arg('time', '');
if (shots) fs.mkdirSync(shots, { recursive: true });
const res = []; const check = (n, ok, x = '') => { res.push(!!ok); console.log(`${ok ? 'ok  ' : 'FAIL'} ${n}${x ? ' (' + x + ')' : ''}`); };
let dev = 'desktop';
const shot = (p, n) => shots ? p.screenshot({ path: path.join(shots, `${n}-${dev}-${tag}.png`) }).catch(() => {}) : null;
async function boot(b, phone) {
  const vp = phone ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
  await ctx.addInitScript((tod) => { try { localStorage.setItem('fi2-welcome-v1', 'completed'); localStorage.setItem('fi2-public-hint-v1', 'card hint'); if (tod) localStorage.setItem('fi2-time-of-day', tod); } catch { /* */ } const n = Date.now.bind(Date); window.__skew = 0; Date.now = () => n() + window.__skew; }, tod);
  await ctx.route('**/api/build-id', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await p.goto(url + '/play?from=arcade', { timeout: 240000 }); await p.waitForTimeout(3000);
  for (let i = 0; i < 60 && !(await p.evaluate(() => !!window.__fi2?.trains)); i++) { for (const t of ['I saved it', 'Get my code', 'Play']) await p.click(`button:visible:has-text("${t}")`, { timeout: 300 }).catch(() => {}); await p.waitForTimeout(2000); }
  await p.waitForFunction(() => !!window.__fi2?.trains && !!window.__fi2.renderer && !!document.querySelector('[data-hud-triggers]') && !document.querySelector('[data-island-return-loading]'), null, { timeout: 240000 });
  await p.waitForTimeout(3000); return { ctx, p, errs };
}
const setLap = (p, k, T) => p.evaluate(({ k, T }) => { const s = window.__fi2.trains.sched, P = s.trainPhase(k, s.clock()); window.__skew += (((T - P) % 360) + 360) % 360 * 1000; }, { k, T });
const stop = (p, id) => p.evaluate((id) => { const s = window.__fi2.trains.sched.stops.find((x) => x.station.id === id); return { arrive: s.arrive, depart: s.depart }; }, id);
const view = async (p, v, ms = 1600) => { await p.evaluate((v) => window.__fi2.trainRide.setView(v), v); await p.waitForTimeout(ms); };
// board train 0 standing at South (doors open), seated
async function board(p) {
  const a = await stop(p, 'south'); await setLap(p, 0, a.arrive + 4); await p.waitForTimeout(600);
  await p.evaluate(() => { const sp = window.__fi2.trainRide.stationSpot(2, 0); window.__fi2.teleport(sp.x, sp.z, sp.yaw + Math.PI); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { document.querySelector('[data-train-board]')?.click(); if (!window.__fi2.trainRide.active) window.__fi2.trainRide.board(); }); await p.waitForTimeout(2500);
  const k = await p.evaluate(() => window.__fi2.trainRide.train); check(`${dev}: riding`, k === 0, `train ${k}`); return k === 0;
}
// the lap time at which train 0's middle passes nearest to (x, z)
const lapNear = (p, x, z, from = 0, to = 360, back = 12.4) => p.evaluate(({ x, z, from, to, back }) => { const s = window.__fi2.trains.sched; let best = 1e9, bt = 0;
  for (let t = from; t < to; t += .25) { const st = s.trainAt(0, t), q = s.trackAt(st.s - back), d = Math.hypot(q.x - x, q.z - z); if (d < best) { best = d; bt = t; } } return { t: bt, d: best }; }, { x, z, from, to, back });
// a fixed camera in a car's frame, applied just before each render (the ride camera is untouched; culling used the ride camera)
const setCam = (p, spec) => p.evaluate((spec) => { const f = window.__fi2, r = f.renderer; window.__cam = spec;
  if (!r.__wrapped) { const orig = r.render.bind(r); r.__wrapped = true; let M = null; r.render = (s, c) => { const q = window.__cam; if (q && c.isPerspectiveCamera) { M = M || new c.matrixWorld.constructor(); const V = c.position.constructor; f.trains.carMatrixOf(0, q.car, M); const a = new V(...q.at).applyMatrix4(M), b = new V(...q.look).applyMatrix4(M); c.position.copy(a); c.lookAt(b); c.updateMatrixWorld(); } orig(s, c); }; }
}, spec);
const pax = (p) => p.evaluate(() => { const t = window.__fi2.trainPassengers; return t ? t.shown : -1; });
async function scenes(p) {
  if (!(await board(p))) return;
  const sum = await stop(p, 'summit');
  if (parts.includes('platform')) {// a camera on the Summit Isle platform (car-local, set at render time), facing car 0's doors
    // a stop where someone gets off: the first changed slot's car and nearest door (roster prev vs now at the stop)
    let pick = null;
    for (const id of ['summit', 'cay', 'north', 'west', 'south']) { const a = await stop(p, id); await setLap(p, 0, a.arrive + 1); await p.waitForTimeout(700);
      pick = await p.evaluate((id) => { const f = window.__fi2, r = f.trainPassengers.roster(0), st = f.trains.sched.stops.find((x) => x.station.id === id), DOORS = [-3.7, -.2, 3.1];
        for (let i = 0; i < r.slots.length; i++) { const a = r.prev[i], b = r.slots[i]; if (a.on && (!b.on || a.cast !== b.cast)) { const car = Math.floor(i / 7); const z = a.standing ? 0 : null; return { id, i, car, side: st.station.side * (car % 2 ? -1 : 1), standing: a.standing, seat: a.seat, door: f.trainPassengers.restZ(i, a.standing, a.seat).door }; } } return null; }, id);
      if (pick) { pick.arrive = a.arrive; break; } }
    console.log('  platform pick: ' + JSON.stringify(pick));
    const info = await p.evaluate(() => { const f = window.__fi2, M = new f.camera.matrixWorld.constructor(), V = f.camera.position.constructor; f.trains.carMatrixOf(0, 0, M); return { top: f.trains.platformTop?.(0), floor: new V(1.4, 1.15, 0).applyMatrix4(M).y }; });
    console.log('  platform top vs car floor: ' + JSON.stringify(info));
    const side = pick ? pick.side : 1, car = pick ? pick.car : 0;
    const dz = pick ? pick.door : 0, al = dz >= 0 ? 1 : -1; await setCam(p, { car, at: [side * +arg('cx', '4.6'), +arg('cy', '2.9'), dz + al * +arg('cz', '3.6')], look: [side * 1.5, 1.0, dz - al * .6] });
    await setLap(p, 0, (pick ? pick.arrive : sum.arrive) + 3.2); await p.waitForTimeout(300);
    for (let i = 0; i < 10; i++) { await shot(p, `platform-off-${i}`); await p.waitForTimeout(330); }
    await setLap(p, 0, (pick ? pick.arrive : sum.arrive) + 5.6); await p.waitForTimeout(200);
    for (let i = 0; i < 8; i++) { await shot(p, `platform-on-${i}`); await p.waitForTimeout(500); }
    await setCam(p, null);
  }
  if (parts.includes('dwell')) {
    await view(p, 'inside', 400); await setLap(p, 0, sum.arrive - 3); await p.waitForTimeout(1800); await shot(p, 'dwell-0-approach');
    await setLap(p, 0, sum.arrive + 3.6); await p.waitForTimeout(200);
    for (let i = 0; i < 4; i++) { await shot(p, `dwell-${i + 1}-walk`); await p.waitForTimeout(450); }
    await setLap(p, 0, sum.arrive + 8); await p.waitForTimeout(300); await shot(p, 'dwell-5-board');
    check(`${dev}: dwell passengers drawn`, (await pax(p)) > 0, `shown ${await pax(p)}`);
  }
  if (parts.includes('seat')) {
    await view(p, 'seat', 300); await setLap(p, 0, sum.depart + 14); await p.waitForTimeout(1600); await shot(p, 'seat-0'); await p.waitForTimeout(1000); await shot(p, 'seat-1');
    await view(p, 'inside', 300); await setLap(p, 0, sum.depart + 20); await p.waitForTimeout(1600); await shot(p, 'inside-run');
  }
  if (parts.includes('stadium')) {
    const s = await lapNear(p, -205, -30); console.log(`  stadium nearest: T ${s.t} d ${s.d.toFixed(0)} m`);
    await view(p, 'inside', 300); await setLap(p, 0, s.t - 2); await p.waitForTimeout(2600); await shot(p, 'stadium-inside');
  }
  if (parts.includes('tunnel')) {
    const w = await p.evaluate(() => window.__fi2.trains.sched.tunnelS); const tIn = await p.evaluate(({ w }) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (Math.abs(st.s - 12 - (w[0] + w[1]) / 2) < 1.5) return t; } return 0; }, { w });
    await view(p, 'inside', 300); await setLap(p, 0, tIn); await p.waitForTimeout(1800); await shot(p, 'tunnel-inside');
    const tP = await p.evaluate(({ w }) => { const s = window.__fi2.trains.sched; for (let t = 0; t < 360; t += .1) { const st = s.trainAt(0, t); if (Math.abs(st.s - (w[0] - 4)) < 1) return t; } return 0; }, { w });
    await view(p, 'front', 300); await setLap(p, 0, tP); await p.waitForTimeout(250); await shot(p, 'tunnel-portal-a'); await p.waitForTimeout(500); await shot(p, 'tunnel-portal-b');
  }
  if (parts.includes('kenji')) {
    const no = await stop(p, 'north'); await view(p, 'front', 300); await setLap(p, 0, no.arrive + 5); await p.waitForTimeout(1800); await shot(p, 'kenji-stop');
    await setLap(p, 0, no.depart + .8); await p.waitForTimeout(900); await shot(p, 'kenji-depart');
  }
  if (parts.includes('kenjicam')) {// a camera just outside the windscreen on Kenji: wave at a stop, cap tip on departure, pointing before the next stop
    const no = await stop(p, 'north'), we = await stop(p, 'west'), ks = await p.evaluate(() => window.__fi2.kenji && window.__fi2.kenji.at);
    await setCam(p, { car: 0, at: [+arg('kx', '0.3'), 2.55, 7.6], look: [+arg('kx', '0.3'), 2.05, 5.0] });
    for (const [n, T] of [['wave', no.arrive + 4.6], ['cap', no.depart + .7], ['point', we.arrive - 7.2]]) { await setLap(p, 0, T); await p.waitForTimeout(1300); await shot(p, `kenjicam-${n}`); }
    await setCam(p, null);
  }
  if (parts.includes('night')) {
    await view(p, 'left', 300); await setLap(p, 0, sum.depart + 20); await p.waitForTimeout(2500); await shot(p, 'night-left');
  }
}
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    for (const d of devs) { dev = d; const { ctx, p, errs } = await boot(b, d === 'phone'); try { await scenes(p); } catch (e) { check(`${d}: scenes ran`, false, e.message.slice(0, 160)); } check(`${d}: no page errors`, errs.length === 0, errs.slice(0, 2).join(' | ')); await ctx.close(); }
  } finally { await b.close(); }
  const bad = res.filter((x) => !x).length; console.log(`probe-aaa4: ${res.length - bad} ok, ${bad} FAIL`); process.exit(bad ? 1 : 0);
})();
