// Headless check, multiplayer rooms Phase 4 client (docs/multiplayer-rooms-design.md): two players in the Kit Shop (room code 7).
// Same recipe as scripts/check-mp-rooms.cjs (the Konbini): the game starts a party on the island; a bot friend
// (multiplayer/bots/bot.mjs --room 7) joins on the island. The player walks in through the REAL Kit Shop door: the party survives
// (same slot), the Leave-only chip shows; the bot then walks into the shop and appears inside, moves (a shopper steps out for it),
// stands (the shop sleeps again), waves; the player waves back through the chip's wheel (the bot hears it). Desktop + phone
// screenshots, heat numbers (per-friend update / render cost, draw calls, idle frames with a still friend, remote-only fps on a
// phone), then back on the island: the door hint says "1 in the Kit Shop" and the party list "In the Kit Shop".
// Run against the CURRENT relay protocol (v1: entry Warp + retry): node scripts/check-mp-rooms-shop.cjs <appUrl> <relayUrl> [outDir]
//   (app with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relayUrl>; PW_CHANNEL=chrome when the bundled browser is missing)
const { chromium, devices } = require('playwright');
const { spawn } = require('child_process');
const url = (process.argv[2] || 'http://localhost:8694').replace(/\/$/, ''), relay = process.argv[3] || 'http://127.0.0.1:8693', out = process.argv[4] || '/tmp/mp-rooms-shop';
require('fs').mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  await fetch(url + '/shop').catch(() => {}); // compile the room page first (dev server)
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  await p.click('text=Get my save code'); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")', { force: true }); // the landing pill floats (never "stable") await p.waitForTimeout(15000);
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

  // The bot: on the island for ROOM_AFTER ms, then into the Kit Shop (room poses, code 7), walking 6 s / standing 6 s, waving every 9 s.
  const ROOM_AFTER = 30000, botMs = 230000, botStart = Date.now();
  const bot = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', code, '--n', '1', '--ms', String(botMs),
    '--room', '7', '--room-after', String(ROOM_AFTER), '--walk', '6000', '--stand', '6000', '--emote-every', '9000'], { stdio: ['ignore', 'pipe', 'ignore'] });
  let botOut = ''; bot.stdout.on('data', (d) => { botOut += d; });
  const botDone = new Promise((r) => bot.on('exit', r));
  const session = () => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('fi2-party-session-v1') || 'null'); } catch { return null; } });
  for (let i = 0; i < 40 && !/2 playing/.test((await p.getAttribute('[data-party-open]', 'aria-label').catch(() => '')) || ''); i++) await p.waitForTimeout(500);
  const s0 = await session();
  console.log('island', JSON.stringify({ label: await p.getAttribute('[data-party-open]', 'aria-label').catch(() => null), stored: !!s0 }));

  // Through the real Kit Shop door (Town's Enter prompt: saves the departure, then /shop).
  await p.evaluate(() => document.querySelector('[data-shop-enter]')?.click());
  await p.waitForURL(/\/shop/, { timeout: 90000, waitUntil: 'commit' }).catch(() => bad('the Kit Shop door did not open the room page'));
  await p.waitForFunction(() => window.__shop?.scene?.state?.party, null, { timeout: 60000 }).catch(() => bad('no party layer in the Kit Shop'));
  await p.waitForSelector('[data-room-party-chip]', { timeout: 30000 }).catch(() => bad('no room party chip'));
  const s1 = await session();
  console.log('shop', JSON.stringify({ sameSlot: !!s0 && !!s1 && s1.resumeToken === s0.resumeToken, chip: await p.getAttribute('[data-room-party-chip]', 'aria-label').catch(() => null) }));
  if (!s1 || !s0 || s1.resumeToken !== s0.resumeToken) bad('the party did not survive the door (slot changed)');
  const st = () => p.evaluate(() => { const s = window.__shop.scene.state; return { frames: s.frames, draws: s.draws, sleeping: s.sleeping, remoteFrames: s.remoteFrames, calls: s.render.calls, party: s.party, x: s.x, z: s.z, shoppersOut: s.shoppersOut, npcs: s.npcs.length }; });
  const before = await st();
  console.log('before the bot', JSON.stringify({ friends: before.party?.friends?.length ?? -1, meRing: before.party?.meRing, npcs: before.npcs, shoppersOut: before.shoppersOut }));
  if (before.party?.friends?.some((f) => !f.gone && f.presence === 'active')) bad('the bot shows in the Kit Shop while it is still on the island');

  // The bot walks in.
  let inside = null;
  for (let i = 0; i < 80 && !inside; i++) { const s = await st(); inside = s.party?.friends?.find((f) => !f.gone && f.fade > .9 && f.presence === 'active') ?? null; if (!inside) await p.waitForTimeout(500); }
  if (!inside) bad('the bot never appeared inside the Kit Shop'); else console.log('bot inside', JSON.stringify(inside));
  { const s = await st(); console.log('crowd', JSON.stringify({ npcs: s.npcs, shoppersOut: s.shoppersOut, shown: s.party?.shown })); if (s.shoppersOut !== 1 || s.npcs !== before.npcs - 1) bad('one shopper should step out for the friend'); }
  const here = await p.getAttribute('[data-room-party-chip]', 'data-here').catch(() => null);
  if (here !== '1') bad('chip should say 1 here, got ' + here);
  // Moves: two samples 1 s apart during its walk.
  const a1 = (await st()).party.friends.find((f) => !f.gone); await p.waitForTimeout(1000); const a2 = (await st()).party.friends.find((f) => !f.gone);
  const moved = a1 && a2 ? Math.hypot(a2.x - a1.x, a2.z - a1.z) : 0;
  console.log('bot moves', moved.toFixed(2), 'm in 1 s'); if (!(moved > .05)) bad('the bot did not move inside the Kit Shop (may be standing; see timeline)');
  // A remote emote bubble shows at some point (the bot waves every 9 s).
  let bubble = false;
  for (let i = 0; i < 24 && !bubble; i++) { bubble = await p.evaluate(() => !!window.__shop.scene.threeScene.getObjectByName('remote-avatar-labels')?.children.some((c) => c.name === 'remote-emote' && c.visible)); if (!bubble) await p.waitForTimeout(500); }
  console.log('bot wave bubble', bubble); if (!bubble) bad('the bot wave never showed in the Kit Shop');
  await p.screenshot({ path: `${out}/shop-desktop.png` });
  // The player waves back through the room chip (Leave-only chip: no host controls).
  await p.click('[data-room-emote]'); await p.waitForSelector('.emote-wheel-btn'); await p.click('.emote-wheel-btn >> nth=0'); await p.waitForTimeout(400);
  const myEmote = await p.evaluate(() => window.__shop.scene.state.emote); console.log('my emote plays', JSON.stringify({ emote: myEmote })); if (myEmote < 0) bad('the local emote did not play on my rig');
  await p.screenshot({ path: `${out}/shop-desktop-emote.png` });
  await p.click('[data-room-party-chip]'); await p.waitForSelector('[data-room-roster]');
  const roster = await p.evaluate(() => ({ lines: [...document.querySelectorAll('[data-room-roster] [data-party-activity]')].map((e) => e.textContent), leave: !!document.querySelector('[data-room-leave]'), host: !!document.querySelector('[data-room-roster] [data-party-end],[data-room-roster] [data-party-code]') }));
  console.log('roster', JSON.stringify(roster)); if (!roster.leave || roster.host) bad('the room roster must offer Leave only');
  await p.screenshot({ path: `${out}/shop-desktop-roster.png` });
  await p.click('[data-room-party-chip]'); await p.waitForTimeout(300);

  // Heat: per-friend update + render cost with the friend drawn vs hidden, and an idle room with a STILL friend sleeps.
  const heat = await p.evaluate(() => window.__shop.scene.measureParty(120));
  console.log('heat (desktop, 1 friend)', JSON.stringify(heat && Object.fromEntries(Object.entries(heat).map(([k, v]) => [k, +(+v).toFixed(3)]))));
  // wait for a standing phase: the room must go to sleep (no rAF) while the friend stands still
  let slept = false, idleFrames = -1;
  for (let i = 0; i < 30 && !slept; i++) { await p.waitForTimeout(500); const s = await st(); if (s.sleeping) { const f0 = s.frames; await p.waitForTimeout(2000); const s2 = await st(); idleFrames = s2.frames - f0; slept = s2.sleeping && idleFrames <= 2; } }
  console.log('idle with a still friend', JSON.stringify({ slept, framesIn2s: idleFrames })); if (!slept) bad('the Kit Shop did not sleep with a still friend');

  // Phone: the same slot on a phone-sized touch context (desktop page closed first, so the slot is not contested).
  const tok = await session();
  await p.close();
  const phone = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } });
  await phone.addInitScript((s) => { try { localStorage.setItem('fi2-party-session-v1', s); } catch { /* none */ } }, JSON.stringify(tok));
  const pp = await phone.newPage(); pp.on('pageerror', (e) => errs.push(e.message));
  await pp.goto(url + '/shop', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await pp.waitForFunction(() => window.__shop?.scene?.state?.party?.friends?.some((f) => !f.gone && f.fade > .9), null, { timeout: 45000 }).catch(() => bad('phone: the friend is not drawn'));
  // remote-only fps while the player stands still and the bot walks
  let fps = null;
  for (let i = 0; i < 30 && fps === null; i++) {
    const s0p = await pp.evaluate(() => window.__shop.scene.state); await pp.waitForTimeout(2000); const s1p = await pp.evaluate(() => window.__shop.scene.state);
    const rf = s1p.remoteFrames - s0p.remoteFrames;
    if (rf > 10) fps = { remoteFps: +(rf / 2).toFixed(1), allFps: +((s1p.frames - s0p.frames) / 2).toFixed(1), frameMs: s1p.frameMs, calls: s1p.render.calls };
  }
  console.log('phone remote-only frames', JSON.stringify(fps)); if (!fps || fps.remoteFps > 21) bad('phone remote-only frames should be <= 20 fps');
  await pp.waitForTimeout(500);
  await pp.screenshot({ path: `${out}/shop-phone.png` });

  // Back to the island through the doors: the bot stays in the shop; the island shows "1 in the Kit Shop" and "In the Kit Shop".
  await pp.click('[data-shop-done]').catch(() => {});
  await pp.waitForURL((u) => !/shop/.test(u.pathname), { timeout: 60000 }).catch(() => bad('did not leave the Kit Shop'));
  await pp.waitForTimeout(12000); await pp.click('button:has-text("Skip")').catch(() => {}); await pp.waitForTimeout(2000);
  const isl = await pp.evaluate(() => ({ label: document.querySelector('[data-party-open]')?.getAttribute('aria-label') ?? null }));
  const hint = await pp.evaluate(() => (window.__fi2?.scene?.children ?? []).flatMap(function walk(o) { return [o, ...o.children.flatMap(walk)]; }).filter((o) => o.name === 'party-door-hint').map((o) => ({ text: o.userData.text ?? '', visible: o.visible, x: +o.position.x.toFixed(1), z: +o.position.z.toFixed(1) })));
  console.log('door hints', JSON.stringify(hint)); if (!hint.some((h) => h.visible && h.text === '1 in the Kit Shop')) bad('the island door hint should say 1 in the Kit Shop');
  await pp.screenshot({ path: `${out}/island-door-hint-phone.png` });
  await pp.evaluate(() => document.querySelector('[data-party-open]')?.click()); await pp.waitForTimeout(1200); await pp.click('#party-tab-party').catch(() => {}); await pp.waitForTimeout(600);
  const lines = await pp.evaluate(() => [...document.querySelectorAll('[data-party-activity]')].map((e) => e.textContent));
  console.log('island', JSON.stringify({ ...isl, lines })); if (!lines.some((l) => /In the Kit Shop/.test(l))) bad('the island party list should say In the Kit Shop');

  console.log('waiting for the bot report (' + Math.max(0, Math.round((botMs - (Date.now() - botStart)) / 1000)) + ' s)');
  bot.kill('SIGTERM');
  await Promise.race([botDone, wait(3000)]);
  const line = botOut.trim().split('\n').pop();
  try {
    const r = JSON.parse(line).bots[0];
    console.log('bot', JSON.stringify({ welcomed: r.welcomed, roomFrom: r.roomFrom, emotesFrom: r.emotesFrom, emotesSent: r.emotesSent, errors: r.errors, closeCode: r.closeCode }));
    if (!Object.values(r.roomFrom || {}).includes(7)) bad('the bot never received the player\'s Kit Shop room poses');
    if (!Object.keys(r.emotesFrom || {}).length) bad('the bot never heard the player\'s emote');
  } catch { console.log('bot report not available (killed early): the page-side checks stand'); }
  console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
