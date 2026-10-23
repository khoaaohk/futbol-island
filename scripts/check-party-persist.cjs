// Headless check (party persistence, docs/multiplayer-design.md "Party persistence"): once a party is live, nothing the player does
// ends it for them. A host starts a party, a bot friend joins, then the host: replays the walkthrough, opens the lesson picker,
// goes to a room page (Arcade) and back, reloads, goes back / forward. After each step the party must be live again with the SAME
// Konbini first (the owner's case). Same
// slot (same resume token in this tab's session, the bot never hears the host Leave / a new Join) and the bot's party never ends.
// LONG=1 adds a 70 s Indoors absence (Konbini page) to cross the old 60 s resume grace.
// Run: node scripts/check-party-persist.cjs <appUrl> [outDir]   (app with NEXT_PUBLIC_MULTIPLAYER=1 + NEXT_PUBLIC_MULTIPLAYER_URL=<relay>;
//      RELAY_URL=<relay http url> for the bot; PW_CHANNEL=chrome when the bundled browser is missing)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const url = (process.argv[2] || 'http://localhost:8641').replace(/\/$/, ''), out = process.argv[3] || '/tmp/party-persist';
const relay = process.env.RELAY_URL || 'http://127.0.0.1:8642';
require('fs').mkdirSync(out, { recursive: true });

(async () => {
  let fail = 0;
  const bad = (m) => { fail++; console.log('FAIL:', m); };
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(6000);
  // New player: take a save code, play, skip the walkthrough.
  await p.click('text=Get my save code'); await p.waitForTimeout(2000);
  await p.click('button:has-text("Play")'); await p.waitForTimeout(15000);
  await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500);
  // Start a party (first name, grown-up gate).
  await p.evaluate(() => document.querySelector('[data-party-open]')?.click());
  await p.waitForSelector('input[aria-label="First name"]', { timeout: 10000 });
  for (let i = 0; i < 4 && !(await p.evaluate(() => document.querySelector('input[aria-label="First name"]').value)); i++) { await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(600); }
  await p.click('text=Start a party');
  await p.waitForSelector('[data-parent-gate-answer]'); await p.waitForTimeout(400);
  const q = (await p.textContent('[data-parent-gate]')).toLowerCase();
  const w = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
  const mm = q.match(/(\w+) times (\w+)/); const nn = q.match(/\d+/g);
  await p.fill('[data-parent-gate-answer]', String(mm ? (w[mm[1]] ?? +mm[1]) * (w[mm[2]] ?? +mm[2]) : nn ? +nn[0] * +nn[1] : 0));
  await p.click('[data-parent-gate] button[type=submit]');
  await p.waitForSelector('[data-party-code]', { timeout: 15000 });
  await p.waitForTimeout(1500);
  const code = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
  await p.click('[data-party-sheet] button:has-text("Done")').catch(() => {}); await p.waitForTimeout(1200);
  console.log('party', code.length === 6 ? 'made' : 'MISSING');

  // A bot friend that stays for the whole run and reports what it heard.
  const botMs = process.env.LONG ? 330000 : 240000; // outlives every step; the run waits for its report at the end
  const botStart = Date.now();
  const bot = spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', relay, '--code', code, '--n', '1', '--ms', String(botMs)], { stdio: ['ignore', 'pipe', 'ignore'] });
  let botOut = ''; bot.stdout.on('data', (d) => { botOut += d; });
  const botDone = new Promise((r) => bot.on('exit', r));

  const state = () => p.evaluate(() => {
    const btn = document.querySelector('[data-party-open]');
    let s = null; try { s = JSON.parse(localStorage.getItem('fi2-party-session-v1') || 'null'); } catch { /* none */ }
    return { live: btn?.getAttribute('data-party-live') === 'true', label: btn?.getAttribute('aria-label') || null, token: s?.resumeToken || null, code: s?.code || null };
  }).catch(() => ({ live: false, label: null, token: null, code: null }));
  const waitLive = async (n = 2, ms = 30000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const s = await state(); if (s.live && new RegExp(`${n} playing`).test(s.label || '')) return s; await p.waitForTimeout(500); }
    return state();
  };
  const s0 = await waitLive(2);
  console.log('start', JSON.stringify({ live: s0.live, label: s0.label }));
  if (!s0.live) bad('the party is not live with the bot');
  const token0 = s0.token;
  const check = async (step) => {
    const s = await waitLive(2);
    const ok = s.live && s.token === token0 && s.code === code;
    console.log(step.padEnd(14), ok ? 'kept' : 'LOST', JSON.stringify({ live: s.live, label: s.label, sameSlot: s.token === token0 }));
    if (!ok) bad(step + ': the party did not survive with the same slot');
    await p.screenshot({ path: `${out}/${step}.png` });
  };
  const back = async (path) => { await p.goto(url + path, { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(8000); await p.click('button:has-text("Skip")').catch(() => {}); };

  // Through the island's own Konbini door (the real departure: Busy + Zone.Indoors pose, then a full page load), then back.
  const konbini = async (stayMs) => {
    await p.evaluate(() => document.querySelector('[data-konbini-enter]')?.click());
    await p.waitForURL(/\/konbini/, { timeout: 90000, waitUntil: 'commit' }).catch(() => bad('the Konbini door did not open the room page'));
    await p.waitForTimeout(stayMs);
    await back('/?from=konbini');
  };
  // 0. Konbini round trip (owner report: "going into the konbini clears the party").
  await konbini(5000); await check('konbini-trip');
  // 1. Settings -> See walkthrough (stay in it a while, then Skip).
  await p.evaluate(() => document.querySelector('[aria-label="Settings"],[aria-label="Open settings"],[data-settings-open]')?.click());
  await p.waitForTimeout(800);
  const walk = await p.$('button:has-text("See walkthrough")');
  if (!walk) bad('no See walkthrough button'); else {
    await walk.click(); await p.waitForTimeout(4000); await check('walkthrough');
    // Walk every step (Next ... Explore), as a child replaying the tour does.
    for (let i = 0; i < 12; i++) {
      const nx = await p.$('dialog[open] button:has-text("Next"), dialog[open] button:has-text("Explore")');
      if (!nx) break; await nx.click().catch(() => {}); await p.waitForTimeout(2500);
    }
    await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500); await check('walk-done');
  }
  // 2. Room page round trip (a full page navigation, as the doors do), then reload, then back / forward.
  await p.goto(url + '/arcade', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(5000);
  await back('/?from=arcade'); await check('arcade-trip');
  await p.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(8000); await p.click('button:has-text("Skip")').catch(() => {}); await check('reload');
  await p.goto(url + '/museum', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(4000);
  await p.goBack({ waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(8000); await check('back');
  await p.goForward({ waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(3000); await p.goBack({ waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(8000); await check('forward-back');
  // 3. Optional: a 70 s Indoors absence (longer than the 60 s plain resume grace).
  if (process.env.LONG) {
    await konbini(70000); await check('indoors-70s');
  }
  // Explicit ending still works: End party for everyone (tap twice) clears the stored session; a reload does not bring it back.
  await p.click('[data-party-open]'); await p.waitForSelector('[data-party-sheet]'); await p.click('#party-tab-party').catch(() => {}); await p.waitForTimeout(500);
  await p.click('[data-party-end]'); await p.waitForTimeout(300); await p.click('[data-party-end]'); await p.waitForTimeout(2000);
  const ended = await state();
  console.log('end-party    ', JSON.stringify({ live: ended.live, stored: !!ended.code }));
  if (ended.live || ended.code) bad('End party did not end / clear the stored session');
  await p.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForTimeout(8000);
  if ((await state()).live) bad('an ended party came back after a reload');
  console.log('waiting for the bot report (' + Math.max(0, Math.round((botMs - (Date.now() - botStart)) / 1000)) + ' s)');
  await Promise.race([botDone, new Promise((r) => setTimeout(r, botMs + 8000))]);
  const line = botOut.trim().split('\n').pop();
  try {
    const r = JSON.parse(line).bots[0];
    console.log('bot', JSON.stringify({ welcomed: r.welcomed, left: r.left, ended: r.ended, errors: r.errors }));
    if (r.left.length) bad('the bot heard the host leave');
    if (r.ended !== 0) bad('the party should end for the bot only by the host End (HostEnded), got ' + r.ended);
  } catch { console.log('bot report not available (killed early); relying on the host checks'); }
  console.log('page errors:', errs.length ? errs.slice(0, 3).join(' ; ') : 'none');
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
