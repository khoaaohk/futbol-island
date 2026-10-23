// Headless check, multiplayer rooms Phase 3 (docs/multiplayer-rooms-design.md): two players in the Arcade hub.
// The game starts a party on the island; a bot friend (multiplayer/bots/bot.mjs --room 5) joins on the island. The player walks in
// through the REAL Arcade door: the party survives (same slot), the room chip shows, the bot walks into the Arcade and appears in the
// hub, moves, and ONE crowd NPC walks out for it; emotes both ways; the roster offers Leave only. The bot then plays Futbol Tennis
// (Busy at that cabinet's stand spot): a force field with "Playing Futbol Tennis" at the cabinet, and walking there bumps you out.
// The player then plays Pass Puzzles (the game REPLACES the hub): the bot receives "Busy at the Pass Puzzles cabinet"; back in the hub
// the friend is still drawn. Heat (desktop + phone), desktop + phone screenshots, then the island: "1 in the Arcade" over the door.
// Run: node scripts/check-mp-rooms-arcade.cjs <appUrl> <relayUrl> [outDir]
//   (app with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; PW_CHANNEL=chrome when the bundled browser is missing)
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const url = (process.argv[2] || 'http://localhost:8762').replace(/\/$/, ''), relay = process.argv[3] || 'http://127.0.0.1:8761', out = process.argv[4] || '/tmp/mp-rooms-arcade';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Cabinet stand spots (= lib/multiplayer/rooms/arcade.ts: the hub's walkTo destination 1.8 m in front of the angled cabinet).
const fs = require('fs'), path = require('path'), ts = require('typescript'), vm = require('vm');
function loadTs(file) {
  const m = { exports: {} }, code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module: m, exports: m.exports, require: () => ({}), Math, Object, Array }); return m.exports;
}
const cat = loadTs(path.join(__dirname, '../lib/arcade/arcadeCatalog.ts'));
const stand = (id) => { const c = cat.arcadeHubCabinets().find((k) => k.id === id); return { x: +(c.x + Math.sin(c.yaw) * 1.8).toFixed(2), z: +(c.z + Math.cos(c.yaw) * 1.8).toFixed(2) }; };
const TENNIS = stand('tennis'), PUZZLE = stand('puzzle');

(async () => {
  let fail = 0;
  const T0 = Date.now(), bad = (m) => { fail++; console.log('FAIL:', m, `(t+${Math.round((Date.now() - T0) / 1000)} s)`); };
  await fetch(url + '/arcade').catch(() => {}); // compile the room page first (dev server)
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code'); await p.waitForTimeout(2000);
  for (let i = 0; i < 30 && !(await p.evaluate(() => { const b = document.querySelector('[data-landing-play]') || [...document.querySelectorAll('button')].find((x) => /^\s*Play/.test(x.textContent)); b?.click(); return !!b; })); i++) await p.waitForTimeout(1000);
  await p.waitForTimeout(15000); // the landing button keeps animating: clicked from the page
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
  console.log('party', code.length === 6 ? 'made' : 'MISSING');

  // The bot: island for ROOM_AFTER ms, then the Arcade hub (walk 6 s / stand 6 s, wave every 9 s); Busy at the Tennis cabinet later.
  const ROOM_AFTER = 30000, BUSY_AFTER = 50000, BUSY_FOR = 40000, botMs = 300000, botStart = Date.now();
  const bot = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', code, '--n', '1', '--ms', String(botMs),
    '--room', '5', '--room-after', String(ROOM_AFTER), '--walk', '6000', '--stand', '6000', '--emote-every', '9000',
    '--busy-at', `${TENNIS.x},${TENNIS.z}`, '--busy-after', String(BUSY_AFTER), '--busy-for', String(BUSY_FOR)], { stdio: ['ignore', 'pipe', 'ignore'] });
  let botOut = ''; bot.stdout.on('data', (d) => { botOut += d; });
  const botDone = new Promise((r) => bot.on('exit', r));
  const session = () => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('fi2-party-session-v1') || 'null'); } catch { return null; } });
  for (let i = 0; i < 40 && !/2 playing/.test((await p.getAttribute('[data-party-open]', 'aria-label').catch(() => '')) || ''); i++) await p.waitForTimeout(500);
  const s0 = await session();
  console.log('island', JSON.stringify({ label: await p.getAttribute('[data-party-open]', 'aria-label').catch(() => null), stored: !!s0 }));

  // Through the real Arcade door.
  await p.evaluate(() => document.querySelector('[data-arcade-enter]')?.click());
  await p.waitForURL(/\/arcade/, { timeout: 90000, waitUntil: 'commit' }).catch(() => bad('the Arcade door did not open the room page'));
  await p.waitForFunction(() => window.__arcadeRoom?.state?.party, null, { timeout: 90000 }).catch(() => bad('no party layer in the Arcade'));
  await p.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => bad('no room party chip'));
  const s1 = await session();
  console.log('arcade', JSON.stringify({ sameSlot: !!s0 && !!s1 && s1.resumeToken === s0.resumeToken, chip: await p.getAttribute('[data-room-party-chip]', 'aria-label').catch(() => null) }));
  if (!s1 || !s0 || s1.resumeToken !== s0.resumeToken) bad('the party did not survive the door (slot changed)');
  const st = (pg = p) => pg.evaluate(() => { const s = window.__arcadeRoom.state; return { x: s.x, z: s.z, draws: s.draws, sleeping: s.sleeping, cadence: s.cadence, remoteFrames: s.remoteFrames, emote: s.emote, party: s.party, calls: s.render?.calls,
    crowdOut: s.crowd.filter((c) => /exit|away/i.test(c.phase)).length, crowdAway: s.crowd.filter((c) => c.phase === 'away').length }; });
  const before = await st();
  console.log('before the bot', JSON.stringify({ friends: before.party?.friends?.length ?? -1, slots: before.party?.slots, crowdOut: before.crowdOut }));
  if (before.party?.friends?.some((f) => !f.gone && f.presence === 'active')) bad('the bot shows in the Arcade while it is still on the island');

  // The bot walks in; a crowd NPC walks out for it.
  let inside = null;
  for (let i = 0; i < 90 && !inside; i++) { const s = await st(); inside = s.party?.friends?.find((f) => !f.gone && f.fade > .9 && f.presence === 'active') ?? null; if (!inside) await p.waitForTimeout(500); }
  if (!inside) bad('the bot never appeared in the Arcade hub'); else console.log('bot inside', JSON.stringify(inside));
  const here = await p.getAttribute('[data-room-party-chip]', 'data-here').catch(() => null);
  if (here !== '1') bad('chip should say 1 here, got ' + here);
  const a1 = (await st()).party.friends.find((f) => !f.gone); await p.waitForTimeout(1000); const a2 = (await st()).party.friends.find((f) => !f.gone);
  const moved = a1 && a2 ? Math.hypot(a2.x - a1.x, a2.z - a1.z) : 0;
  console.log('bot moves', moved.toFixed(2), 'm in 1 s'); if (!(moved > .05)) bad('the bot did not move in the hub');
  let crowd = null;
  for (let i = 0; i < 16; i++) { crowd = await st(); if (crowd.party?.slots === 1 && crowd.crowdOut >= 1) break; await p.waitForTimeout(500); }
  console.log('crowd', JSON.stringify({ slots: crowd.party?.slots, npcsOut: crowd.crowdOut, away: crowd.crowdAway })); if (!(crowd.party?.slots === 1 && crowd.crowdOut >= 1)) bad('a crowd NPC should walk out for the friend');
  let bubble = false;
  for (let i = 0; i < 24 && !bubble; i++) { bubble = await p.evaluate(() => !!window.__arcadeRoom.threeScene.getObjectByName('remote-avatar-labels')?.children.some((c) => c.name === 'remote-emote' && c.visible)); if (!bubble) await p.waitForTimeout(500); }
  console.log('bot wave bubble', bubble); if (!bubble) bad('the bot wave never showed in the Arcade');
  await p.screenshot({ path: `${out}/arcade-desktop.png` });
  await p.click('[data-room-emote]'); await p.waitForSelector('.emote-wheel-btn'); await p.click('.emote-wheel-btn >> nth=0'); 
  let myEmote = -1; // the bubbles load lazily on the first emote (dev compile): poll
  for (let i = 0; i < 20 && myEmote < 0; i++) { await p.waitForTimeout(250); myEmote = await p.evaluate(() => window.__arcadeRoom.state.emote); } console.log('my emote plays', myEmote); if (!(myEmote >= 0)) bad('the chip emote did not play on my rig');
  await p.click('[data-room-party-chip]'); await p.waitForSelector('[data-room-roster]');
  const roster = await p.evaluate(() => ({ lines: [...document.querySelectorAll('[data-room-roster] [data-party-activity]')].map((e) => e.textContent), leave: !!document.querySelector('[data-room-leave]'), host: !!document.querySelector('[data-room-roster] [data-party-end],[data-room-roster] [data-party-code],[data-room-roster] [data-party-kick]') }));
  console.log('roster', JSON.stringify(roster)); if (!roster.leave || roster.host) bad('the room roster must offer Leave only');
  await p.screenshot({ path: `${out}/arcade-desktop-roster.png` });
  await p.click('[data-room-party-chip]'); await p.waitForTimeout(300);

  // Heat (desktop): layer update cost and render cost with the friend drawn.
  const heat = await p.evaluate(() => ({ update: window.__arcadeRoom.measureParty(120)?.update, render: window.__arcadeRoom.measureRender(60) }));
  console.log('heat (desktop, 1 friend)', JSON.stringify({ updateMs: +(+heat.update).toFixed(3), renderMs: +(+heat.render).toFixed(3), calls: (await st()).calls }));

  // The bot plays Futbol Tennis: force field at the cabinet, "Playing Futbol Tennis", and walking there bumps you out.
  let busy = null; console.log('waiting for the busy bot at t+' + Math.round((Date.now() - botStart) / 1000) + ' s of the bot');
  for (let i = 0; i < 130 && !busy; i++) { const s = await st(); busy = s.party?.friends?.find((f) => !f.gone && f.presence === 'busy') ?? null; if (!busy) await p.waitForTimeout(500); }
  if (!busy) bad('the bot never showed busy at a cabinet'); else {
    const d = Math.hypot(busy.x - TENNIS.x, busy.z - TENNIS.z);
    await p.waitForTimeout(1200);
    const status = await p.evaluate(() => { const s = window.__arcadeRoom.threeScene.getObjectByName('remote-avatar-labels')?.children.find((c) => c.name === 'remote-status' && c.visible); return s ? { line: Object.keys(s.material.map?.userData ?? {}).length ? s.material.map.userData : null, visible: true } : null; });
    const line = await p.evaluate(() => { const st = window.__arcadeRoom.state.party?.friends; return st; });
    console.log('bot busy', JSON.stringify({ at: busy, fromStand: +d.toFixed(2), statusShown: !!status }));
    if (d > .35) bad('the busy friend is not at the Tennis stand spot'); if (!status) bad('no "Playing" status line over the busy friend');
    void line;
    await p.evaluate(() => window.__arcadeRoom.walkTo('tennis')); await p.waitForTimeout(10000);
    const me = await st(), gap = Math.hypot(me.x - TENNIS.x, me.z - TENNIS.z);
    console.log('walk into the field', JSON.stringify({ gap: +gap.toFixed(2) })); if (gap > 1.6) bad('the player did not reach the cabinet (gap ' + gap.toFixed(2) + ')'); if (gap < .85) bad('the force field did not keep the player out (gap ' + gap.toFixed(2) + ')');
    await p.screenshot({ path: `${out}/arcade-desktop-busy-field.png` });
  }

  // The player plays Pass Puzzles: the game replaces the hub; the party keeps going (Busy at the Pass Puzzles cabinet).
  const myId = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('fi2-party-session-v1') || 'null')?.you ?? null; } catch { return null; } });
  await p.click('button[aria-controls="arcade-coins-panel"]'); await p.waitForTimeout(600);
  await p.click('button[aria-label="Play Pass Puzzles"]');
  await p.waitForSelector('[data-arcade-room=playing]', { timeout: 20000 }).catch(() => bad('the game did not start'));
  await p.waitForTimeout(7000);
  const inGame = await p.evaluate(() => ({ hub: !!window.__arcadeRoom, status: document.querySelector('[data-arcade-room]')?.getAttribute('data-arcade-room') }));
  console.log('in the game', JSON.stringify(inGame));
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  if (!(await p.evaluate(() => !!document.querySelector('[data-arcade-room=room]')))) { await p.evaluate(() => { history.replaceState(null, '', '/arcade'); }); await p.goto(url + '/arcade', { waitUntil: 'domcontentloaded' }); }
  await p.waitForFunction(() => window.__arcadeRoom?.state?.party, null, { timeout: 60000 }).catch(() => bad('no party layer back in the hub'));
  let back = null;
  for (let i = 0; i < 30 && !back; i++) { const s = await st(); back = s.party?.friends?.find((f) => !f.gone && f.fade > .9) ?? null; if (!back) await p.waitForTimeout(500); }
  console.log('back in the hub', JSON.stringify({ friend: back, slots: (await st()).party?.slots })); if (!back) bad('the friend is not drawn after the game');

  // Phone: the same slot on a phone-sized touch context.
  const tok = await session();
  await p.close();
  const phone = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  await phone.addInitScript((s) => { try { localStorage.setItem('fi2-party-session-v1', s); } catch { /* none */ } }, JSON.stringify(tok));
  const pp = await phone.newPage(); pp.on('pageerror', (e) => errs.push(e.message));
  await pp.goto(url + '/arcade', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await pp.waitForFunction(() => window.__arcadeRoom?.state?.party?.friends?.some((f) => !f.gone && f.fade > .9), null, { timeout: 60000 }).catch(() => bad('phone: the friend is not drawn'));
  let fps = null;
  for (let i = 0; i < 30 && fps === null; i++) {
    const a = await pp.evaluate(() => ({ ...window.__arcadeRoom.state })); await pp.waitForTimeout(2000); const c = await pp.evaluate(() => ({ ...window.__arcadeRoom.state }));
    const rf = c.remoteFrames - a.remoteFrames;
    if (rf > 10) fps = { remoteFps: +(rf / 2).toFixed(1), allFps: +((c.draws - a.draws) / 2).toFixed(1), cadence: c.cadence, calls: c.render?.calls };
  }
  console.log('phone remote-only frames', JSON.stringify(fps)); if (!fps || fps.remoteFps > 21) bad('phone remote-only frames should be <= 20 fps');
  const pheat = await pp.evaluate(() => ({ update: window.__arcadeRoom.measureParty(60)?.update, render: window.__arcadeRoom.measureRender(30) }));
  console.log('heat (phone ctx, 1 friend)', JSON.stringify({ updateMs: +(+pheat.update).toFixed(3), renderMs: +(+pheat.render).toFixed(3) }));
  await pp.waitForTimeout(500);
  await pp.screenshot({ path: `${out}/arcade-phone.png` });

  // Back to the island through the Exit: the bot stays in the Arcade; the island shows "1 in the Arcade" over the door.
  await pp.click('[data-navigation]').catch(() => {});
  await pp.waitForURL((u) => !/arcade/.test(u.pathname), { timeout: 60000 }).catch(() => bad('did not leave the Arcade'));
  await pp.waitForTimeout(12000); await pp.click('button:has-text("Skip")').catch(() => {}); await pp.waitForTimeout(3000);
  const hint = await pp.evaluate(() => { const sc = window.__fi2?.scene; const out = []; sc?.traverse((o) => { if (o.name === 'party-door-hint') out.push({ text: o.userData.text, visible: o.visible }); }); return out; });
  console.log('island door hints', JSON.stringify(hint)); if (!hint.some((h) => h.visible && h.text === '1 in the Arcade')) bad('the island should show "1 in the Arcade"');
  await pp.evaluate(() => { const t = window.__fi2?.teleport; if (t) t(103, -40, Math.PI); }); await pp.waitForTimeout(2500);
  await pp.screenshot({ path: `${out}/island-arcade-door-hint-phone.png` });

  bot.kill('SIGTERM');
  await Promise.race([botDone, wait(3000)]);
  const line = botOut.trim().split('\n').pop();
  try {
    const r = JSON.parse(line).bots[0];
    const mine = Object.entries(r.busyFrom || {}).flatMap(([id, l]) => l.map(([x, z]) => ({ id: +id, x, z, fromPuzzle: +Math.hypot(x - PUZZLE.x, z - PUZZLE.z).toFixed(2) })));
    console.log('bot', JSON.stringify({ welcomed: r.welcomed, roomFrom: r.roomFrom, busyFrom: mine, emotesFrom: r.emotesFrom, emotesSent: r.emotesSent, errors: r.errors }));
    if (!mine.some((m) => m.fromPuzzle < .4)) bad('the bot never received my Busy pose at the Pass Puzzles cabinet (party during the game)');
    if (!Object.values(r.emotesFrom || {}).some((n) => n > 0)) bad('the bot never received my emote');
    void myId;
  } catch (e) { bad('bot report not available: ' + e.message); }
  console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
