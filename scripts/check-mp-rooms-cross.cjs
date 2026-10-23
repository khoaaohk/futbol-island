// Headless check, multiplayer rooms (verifier pass, Oct 22 2026): ONE party walks through every room in turn.
// The host starts a party on the island; five bot friends join: one stays on the island, one waits in each room (Konbini 8, Museum 6,
// Arcade 5, Kit Shop 7). The host goes island -> Konbini -> island -> Museum -> island -> Arcade (a game, back to the hub) -> island
// -> Kit Shop -> island, reloading once inside each room. At every stop: same slot (resume token + member id), exactly one avatar
// layer, only the friend of THIS room drawn (no ghosts), the chip says "1 here", the roster has one row per friend (no duplicates)
// with the right line, and on the island the four door hints + the party list say where everyone is. Then the bot friend in the
// room ends nothing; the host Leaves from inside the Kit Shop: the chip goes, a note shows, every avatar is gone.
// Run: node scripts/check-mp-rooms-cross.cjs <appUrl> <relayUrl> [outDir]   (PW_CHANNEL=chrome when the bundled browser is missing)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const url = (process.argv[2] || 'http://localhost:8615').replace(/\/$/, ''), relay = process.argv[3] || 'http://127.0.0.1:8616', out = process.argv[4] || '/tmp/mp-rooms-cross';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOMS = [
  { name: 'konbini', code: 8, enter: '[data-konbini-enter]', path: /\/konbini/, ready: () => window.__konbini?.state?.party, scene: 'window.__konbini.threeScene', state: 'window.__konbini.state', done: '[data-konbini-done]', line: 'In the Konbini', hint: '1 in the Konbini' },
  { name: 'museum', code: 6, enter: '[data-museum-enter]', path: /\/museum/, ready: () => window.__museum?.state?.party, scene: 'window.__museum.threeScene', state: 'window.__museum.state', done: '[data-museum-done]', line: 'In the museum', hint: '1 in the Museum' },
  { name: 'arcade', code: 5, enter: '[data-arcade-enter]', path: /\/arcade/, ready: () => window.__arcadeRoom?.state?.party, scene: 'window.__arcadeRoom.threeScene', state: 'window.__arcadeRoom.state', done: '[data-navigation]', line: 'arcade', hint: '1 in the Arcade' },
  { name: 'shop', code: 7, enter: '[data-shop-enter]', path: /\/shop/, ready: () => window.__shop?.scene?.state?.party, scene: 'window.__shop.scene.threeScene', state: 'window.__shop.scene.state', done: '[data-shop-done]', line: 'In the Kit Shop', hint: '1 in the Kit Shop' },
];

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code'); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")'); await p.waitForTimeout(15000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('[data-party-open]')?.click());
  await p.waitForSelector('input[aria-label="First name"]', { timeout: 10000 });
  for (let i = 0; i < 4 && !(await p.evaluate(() => document.querySelector('input[aria-label="First name"]').value)); i++) { await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(600); }
  await p.click('text=Start a party');
  await p.waitForSelector('[data-parent-gate-answer]'); await p.waitForTimeout(400);
  const q = (await p.textContent('[data-parent-gate]')).toLowerCase();
  const w = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/), nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : nn ? +nn[0] * +nn[1] : 0));
  await p.click('[data-parent-gate] button[type=submit]');
  await p.waitForSelector('[data-party-code]', { timeout: 15000 }); await p.waitForTimeout(1500);
  const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
  await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.waitForTimeout(1200);

  // Five friends: one on the island, one in each room (from the start, walking 6 s / standing 6 s).
  const bots = [];
  const botArgs = (room) => ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', code, '--n', '1', '--ms', '900000',
    ...(room >= 0 ? ['--room', String(room), '--room-after', '2000', '--walk', '6000', '--stand', '6000'] : [])];
  for (const r of [-1, ...ROOMS.map((x) => x.code)]) { bots.push(spawn('node', botArgs(r), { stdio: 'ignore' })); await wait(300); }
  for (let i = 0; i < 40 && !/6 playing/.test((await p.getAttribute('[data-party-open]', 'aria-label').catch(() => '')) || ''); i++) await p.waitForTimeout(500);
  const session = () => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('fi2-party-session-v1') || 'null'); } catch { return null; } });
  await p.waitForTimeout(9000); // the bots walk into their rooms 2 s after joining (+ the relay's 5.5 s entry-warp retry)
  const s0 = await session();
  console.log('party', code.length === 6 ? 'made' : 'MISSING', 'label', await p.getAttribute('[data-party-open]', 'aria-label').catch(() => null));
  const sameSlot = async (where) => { const s = await session(); if (!s || !s0 || s.resumeToken !== s0.resumeToken || s.you !== s0.you) bad(`${where}: slot changed`); };
  // Scene probe: avatar layers, visible names, ring instances.
  const probe = (sceneExpr) => p.evaluate((ex) => { const sc = eval(ex); let roots = 0, names = 0, rings = -1; sc?.traverse((o) => { if (o.name === 'remote-avatars') roots++; if (o.name === 'remote-name' && o.visible) names++; if (o.name === 'remote-avatar-rings') rings = o.count; }); return { roots, names, rings }; }, sceneExpr);

  const island = async (label) => {
    await p.waitForTimeout(12000); await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(4000);
    await sameSlot('island ' + label);
    const hints = await p.evaluate(() => { const out = []; window.__fi2?.scene?.traverse((o) => { if (o.name === 'party-door-hint' && o.userData.text) out.push(o.userData.text); }); return out; }); // hints show only within range: read the text
    const pr = await probe('window.__fi2.scene');
    await p.evaluate(() => document.querySelector('[data-party-open]')?.click()); await p.waitForTimeout(1200); await p.click('#party-tab-party').catch(() => {}); await p.waitForTimeout(600);
    const lines = await p.evaluate(() => [...document.querySelectorAll('[data-party-activity]')].map((e) => e.textContent));
    await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.keyboard.press('Escape').catch(() => {}); await p.waitForTimeout(600);
    console.log('island', label, JSON.stringify({ hints, lines, ...pr }));
    for (const r of ROOMS) { if (!hints.includes(r.hint)) bad(`island ${label}: no "${r.hint}" door hint`); if (!lines.some((l) => l.includes(r.line))) bad(`island ${label}: party list misses "${r.line}"`); }
    if (pr.roots !== 1) bad(`island ${label}: ${pr.roots} avatar layers`);
    if (pr.rings > 2) bad(`island ${label}: ${pr.rings} rings (island friend + me at most)`);
  };

  const visit = async (r) => {
    await p.evaluate((sel) => document.querySelector(sel)?.click(), r.enter);
    await p.waitForURL(r.path, { timeout: 90000, waitUntil: 'commit' }).catch(() => bad(`${r.name}: the door did not open the room`));
    await p.waitForFunction(r.ready, null, { timeout: 60000 }).catch(() => bad(`no party layer in the ${r.name}`));
    await p.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => bad(`${r.name}: no room chip`));
    await sameSlot(r.name);
    const check = async (tag) => {
      let fr = null;
      for (let i = 0; i < 40; i++) { fr = await p.evaluate((ex) => eval(ex).party?.friends ?? null, r.state); if (fr && fr.filter((f) => !f.gone && f.fade > .9).length === 1 && (await p.getAttribute('[data-room-party-chip]', 'data-here').catch(() => null)) === '1') break; await p.waitForTimeout(500); }
      const here = await p.getAttribute('[data-room-party-chip]', 'data-here').catch(() => null);
      const shownHere = fr ? fr.filter((f) => !f.gone && f.fade > .05) : [];
      const pr = await probe(r.scene);
      const meRing = await p.evaluate((ex) => eval(ex).party?.meRing ?? null, r.state);
      await p.click('[data-room-party-chip]'); await p.waitForSelector('[data-room-roster]').catch(() => {});
      const roster = await p.evaluate(() => [...document.querySelectorAll('[data-room-roster] li[data-room-member]')].map((li) => li.querySelector('[data-party-activity]')?.textContent ?? ''));
      await p.click('[data-room-party-chip]'); await p.waitForTimeout(300);
      console.log(r.name, tag, JSON.stringify({ here, drawn: shownHere.length, sampled: fr?.length, ...pr, meRing, roster }));
      if (here !== '1') bad(`${r.name} ${tag}: chip says ${here} here`);
      if (shownHere.length !== 1) bad(`${r.name} ${tag}: ${shownHere.length} friends drawn (want only this room's bot)`);
      if (pr.roots !== 1) bad(`${r.name} ${tag}: ${pr.roots} avatar layers`);
      if (pr.names > 1) bad(`${r.name} ${tag}: ${pr.names} name labels visible`);
      if (pr.rings > 2) bad(`${r.name} ${tag}: ${pr.rings} ring instances`);
      if (roster.length !== 5) bad(`${r.name} ${tag}: roster has ${roster.length} rows (want 5)`);
      if (roster.filter((l) => l === 'Here with you').length !== 1) bad(`${r.name} ${tag}: "Here with you" count wrong`);
      for (const o of ROOMS) if (o !== r && !roster.some((l) => l.includes(o.line) || (o.code === 8 && /Konbini/.test(l)))) bad(`${r.name} ${tag}: roster misses "${o.line}"`);
    };
    await check('enter');
    await p.screenshot({ path: `${out}/${r.name}-desktop.png` });
    if (r.name === 'arcade') {
      // A game replaces the hub, then back: the friend is drawn again.
      await p.click('button[aria-controls="arcade-coins-panel"]').catch(() => {}); await p.waitForTimeout(600);
      await p.click('button[aria-label="Play Pass Puzzles"]').catch(() => bad('arcade: no Play Pass Puzzles button'));
      await p.waitForSelector('[data-arcade-room=playing]', { timeout: 20000 }).catch(() => bad('arcade: the game did not start'));
      await p.waitForTimeout(3000); await p.keyboard.press('Escape'); await p.waitForTimeout(1000);
      if (!(await p.evaluate(() => !!document.querySelector('[data-arcade-room=room]')))) bad('arcade: Escape did not return to the hub');
      await p.waitForFunction(r.ready, null, { timeout: 30000 }).catch(() => bad('arcade: no layer after the game'));
      await check('after-game');
    }
    // Reload inside the room: the party resumes, the friend is drawn again.
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForFunction(r.ready, null, { timeout: 60000 }).catch(() => bad(`${r.name}: no layer after reload`));
    await p.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => bad(`${r.name}: no chip after reload`));
    await sameSlot(r.name + ' reload');
    await check('reload');
  };

  for (const r of ROOMS) {
    await visit(r);
    if (r.name === 'shop') break; // the Leave test below runs inside the Kit Shop
    await p.click(r.done).catch(() => bad(`${r.name}: no way out`));
    await p.waitForURL((u) => !r.path.test(u.pathname), { timeout: 60000 }).catch(() => bad(`did not leave the ${r.name}`));
    await island('after ' + r.name);
  }

  // Leave from inside the Kit Shop: chip gone, a note, no avatars left.
  await p.click('[data-room-party-chip]'); await p.click('[data-room-leave]'); await p.click('[data-room-leave-confirm]');
  await p.waitForTimeout(1500);
  const after = await p.evaluate(() => ({ chip: !!document.querySelector('[data-room-party-chip]'), note: document.querySelector('[data-room-party-note]')?.textContent ?? null }));
  const prL = await probe('window.__shop.scene.threeScene');
  console.log('left in the shop', JSON.stringify({ ...after, ...prL }));
  if (after.chip) bad('chip still shown after Leave'); if (prL.names > 0 || prL.rings > 0) bad('avatars left after Leave');
  if (!after.note) bad('no note after Leave in a room');
  await p.screenshot({ path: `${out}/shop-after-leave.png` });

  for (const bt of bots) bt.kill('SIGTERM');
  console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  await b.close();
  console.log(fail ? `FAILED (${fail})` : 'PASS');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
