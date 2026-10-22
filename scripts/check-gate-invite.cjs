// Headless check: first-time gate path (Start a party -> grown-up gate -> correct answer) must end on the Invite card with the code.
// Run: node scripts/check-gate-invite.cjs <appUrl> [outDir]   (app built with NEXT_PUBLIC_MULTIPLAYER=1 + a dev relay)
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8983', out = process.argv[3] || '/tmp/gate-invite';
require('fs').mkdirSync(out, { recursive: true });
(async () => {
  let fail = 0;
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['desktop', { width: 1280, height: 800 }]]) {
    const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--mute-audio'] });
    const p = await b.newPage({ viewport: vp, hasTouch: name === 'phone' });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(6000);
    if (process.env.START) { await p.click('text=Get my save code'); await p.waitForTimeout(2000); await p.click('button:has-text("Play")'); await p.waitForTimeout(15000); await p.click('button:has-text("Skip")').catch(() => {}); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/${name}-0-started.png` }); }
    await p.evaluate(() => {
      window.__log = [];
      const t = () => { const s = [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')).join('|') || 'none'; const l = window.__log; if (!l.length || l[l.length - 1][1] !== s) l.push([Math.round(performance.now()), s]); };
      new MutationObserver(t).observe(document.body, { childList: true, subtree: true });
      document.querySelector('[data-party-open]')?.click();
    });
    await p.waitForSelector('[role=dialog][aria-label="Play with friends"]', { timeout: 8000 }).catch(async (e) => {
      await p.screenshot({ path: `${out}/${name}-0-no-menu.png` });
      console.log('no menu; buttons:', await p.evaluate(() => [...document.querySelectorAll('button')].map((x) => x.getAttribute('aria-label') || x.innerText).slice(0, 20)));
      throw e;
    });
    await p.waitForTimeout(1500);
    for (let i = 0; i < 4 && !(await p.evaluate(() => document.querySelector('input[aria-label="First name"]').value)); i++) { await p.fill('input[aria-label="First name"]', 'Sam'); await p.waitForTimeout(800); console.log('fill try', i); }
    console.log('nick state', await p.evaluate(() => { const i = document.querySelector('input[aria-label="First name"]'); return [i.value, i.getAttribute('aria-invalid'), document.getElementById(i.getAttribute('aria-describedby'))?.innerText]; }));
    console.log('start disabled?', await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /Start a party/.test(x.innerText))?.disabled));
    await p.waitForTimeout(500); await p.screenshot({ path: `${out}/${name}-1-menu.png` });
    await p.click('text=Start a party');
    await p.waitForSelector('[data-parent-gate-answer]'); await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/${name}-2-gate.png` });
    const q = await p.textContent('[data-parent-gate] label');
    const w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
    const m = q.toLowerCase().match(/(\w+) times (\w+)/); let ans;
    if (m) ans = (w[m[1]] ?? +m[1]) * (w[m[2]] ?? +m[2]); else { const n = q.match(/\d+/g); ans = n ? +n[0] * +n[1] : 0; }
    console.log(name, 'question:', q, '->', ans);
    await p.fill('[data-parent-gate-answer]', String(ans));
    if (process.env.DELAY) await p.route('**/party', async (r) => { await new Promise((x) => setTimeout(x, +process.env.DELAY)); r.continue(); });
    if (name === 'phone') await p.tap('[data-parent-gate] button[type=submit]'); else await p.click('[data-parent-gate] button[type=submit]');
    await p.waitForTimeout(250); await p.screenshot({ path: `${out}/${name}-3-after-answer.png` });
    await p.waitForTimeout(2500); await p.screenshot({ path: `${out}/${name}-4-final.png` });
    const final = await p.evaluate(() => ({ dlg: [...document.querySelectorAll('[role=dialog]')].map((d) => d.getAttribute('aria-label')), text: document.querySelector('[role=dialog]')?.innerText?.slice(0, 120), log: window.__log }));
    console.log(name, JSON.stringify(final), errs.join(';'));
    if (!final.dlg.includes('Your party') || !/-/.test(final.text || '')) { fail++; console.log(name, 'FAIL: no party card with the code'); }
    if (final.dlg.includes('Your party')) {
      await p.waitForSelector('[data-party-sheet]'); await p.waitForTimeout(800);
      await p.screenshot({ path: `${out}/${name}-5-sheet.png` });
      const sheet = await p.evaluate(() => document.querySelector('[data-party-sheet]').innerText.replace(/\n+/g, ' | '));
      console.log(name, 'sheet:', sheet);
      const tabs = await p.evaluate(() => [...document.querySelectorAll('[role=tab]')].map((x) => [x.innerText, x.getAttribute('aria-selected')]));
      console.log(name, 'tabs:', JSON.stringify(tabs)); if (tabs.length !== 2 || tabs[0][1] !== 'true' || !/^Party \(1\)$/.test(tabs[1][0])) { fail++; console.log(name, 'FAIL: tabs / default Code'); }
      if (!/New code[\s\S]*Close to new friends/.test(sheet)) { fail++; console.log(name, 'FAIL: no code actions'); }
      const code1 = await p.textContent('[data-party-code]');
      await p.click('[data-party-new-code]'); await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/${name}-5b-newcode.png` });
      await p.waitForTimeout(1500);
      const code2 = await p.textContent('[data-party-code]');
      console.log(name, 'code', code1, '->', code2); if (code1 === code2) { fail++; console.log(name, 'FAIL: New code did not change the code'); }
      await p.click('[data-party-lock]'); await p.waitForTimeout(500);
      if (!(await p.evaluate(() => !!document.querySelector('[data-party-closed]')))) { fail++; console.log(name, 'FAIL: no Closed badge'); }
      await p.screenshot({ path: `${out}/${name}-5c-closed.png` });
      await p.click('[data-party-lock]'); await p.waitForTimeout(300);
      await p.focus('#party-tab-code'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400);
      const sel = await p.evaluate(() => [document.activeElement.id, document.activeElement.getAttribute('aria-selected'), document.querySelector('#party-panel-party').getAttribute('data-active') === 'true' ? false : true]);
      console.log(name, 'after ArrowRight', JSON.stringify(sel)); if (sel[0] !== 'party-tab-party' || sel[1] !== 'true' || sel[2]) { fail++; console.log(name, 'FAIL: arrow key tab switch'); }
      await p.screenshot({ path: `${out}/${name}-5d-party-tab.png` });
      // Same size: the card box is identical on both tabs, with 0, 1 and 8 members, and the toggle slides (3 frames).
      const box = () => p.evaluate(() => { const r = document.querySelector('[data-party-sheet]').getBoundingClientRect(); const st = document.querySelector('[data-party-stage]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height, st.height].map((v) => Math.round(v * 10) / 10).join(','); });
      const boxes = { party: await box() };
      await p.click('#party-tab-code'); await p.waitForTimeout(500); boxes.code = await box();
      const inert = await p.evaluate(() => [document.querySelector('#party-panel-party').hasAttribute('inert'), document.querySelector('#party-panel-party').getAttribute('aria-hidden'), getComputedStyle(document.querySelector('#party-panel-party')).visibility]);
      if (!inert[0] || inert[1] !== 'true' || inert[2] !== 'hidden') { fail++; console.log(name, 'FAIL: inactive panel not inert/aria-hidden/hidden', JSON.stringify(inert)); }
      const codeNow = (await p.textContent('[data-party-code]')).replace(/[^A-Z0-9]/gi, '');
      const bots = [];
      for (const [label, n, total] of [['m2', 1, 2], ['m8', 7, 8]]) {
        bots.push(require('child_process').spawn('node', ['--experimental-websocket', 'multiplayer/bots/bot.mjs', '--url', process.env.RELAY_URL || 'http://127.0.0.1:8871', '--code', codeNow, '--n', String(n), '--ms', '25000'], { stdio: 'ignore' }));
        await p.waitForFunction((t) => new RegExp('^Party \\(' + t + '\\)$').test(document.querySelector('#party-tab-party').innerText), total, { timeout: 15000 }).catch(() => { fail++; console.log(name, 'FAIL: bots did not join', label); });
        await p.waitForTimeout(600);
        boxes[label + 'code'] = await box();
        await p.click('#party-tab-party'); await p.waitForTimeout(500); boxes[label + 'party'] = await box();
        if (total === 8) await p.screenshot({ path: `${out}/${name}-5e-8members.png` });
        await p.click('#party-tab-code'); await p.waitForTimeout(500);
      }
      bots.forEach((b) => b.kill());
      const pill = () => p.evaluate(() => Math.round(document.querySelector('[data-party-pill]').getBoundingClientRect().x));
      const x0 = await pill();
      await p.evaluate(() => document.querySelector('#party-tab-party').click());
      for (let f = 1; f <= 3; f++) { await p.waitForTimeout(60); await p.screenshot({ path: `${out}/${name}-slide-${f}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 420) } }); }
      const xs = await pill(); await p.waitForTimeout(400); const x1 = await pill();
      console.log(name, 'pill x', x0, xs, x1, 'boxes', JSON.stringify(boxes));
      if (!(xs > x0 && xs < x1 + 1) || x1 <= x0) { fail++; console.log(name, 'FAIL: pill did not slide'); }
      if (new Set(Object.values(boxes)).size !== 1) { fail++; console.log(name, 'FAIL: card box differs between tabs / QR'); }
      if (!/End party for everyone/.test(await p.innerText('#party-panel-party')) || /End party/.test(await p.evaluate(() => document.querySelector('#party-panel-code').innerText))) { fail++; console.log(name, 'FAIL: no End party on Party tab'); }
      await p.click('[data-party-sheet] button:has-text("Done")'); await p.waitForTimeout(1200);
      await p.screenshot({ path: `${out}/${name}-6-hud.png` });
      await p.click('[data-party-open]'); await p.waitForTimeout(900);
      const again = await p.evaluate(() => document.querySelector('[role=dialog]')?.getAttribute('aria-label'));
      console.log(name, 'HUD button while live opens:', again); if (again === 'Play with friends') { fail++; console.log(name, 'FAIL: HUD opened Start menu'); }
    }
    await b.close();
  }
  process.exit(fail ? 1 : 0);
})();
