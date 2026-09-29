import { test, expect } from '@playwright/test';
import { capture, center, drag, expectDialogSurvivesStaleDvh, expectNoErrors, expectNoHorizontalScroll, openIsland, overlap, press } from './helpers';

/* Player cards: the Collect cards binder and the card offer (?cards=earn). */

const OWNED = ['Kylian Mbappé', 'Lionel Messi', 'Pelé', 'Lev Yashin', 'Alisson', 'Virgil van Dijk'];

test('binder: turn a page, search above the soft keyboard, open a card, flip and tilt', async ({ page }, info) => {
  const issues = await openIsland(page, { storage: { 'fi2-player-cards-v1': JSON.stringify(OWNED) } });
  await press(page.getByRole('button', { name: 'Paths', exact: true }), info);
  await press(page.getByRole('button', { name: /Collect cards/ }), info);
  const binder = page.locator('dialog[open] [aria-roledescription=binder]');
  await expect(binder.locator('li button').first()).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);
  await capture(page, info, 'binder');
  await expectNoHorizontalScroll(page, 'binder');
  const dock = page.locator('dialog[open] nav[aria-label=Binder]');
  const live = () => page.evaluate(() => [...document.querySelectorAll('dialog[open] p[aria-live=polite]')].map(p => p.textContent ?? '').find(t => /^Page /.test(t)) ?? '');
  const first = await live();
  await press(dock.getByRole('button', { name: 'Next page' }), info);
  await expect.poll(live, { timeout: 15_000 }).not.toBe(first);

  // Soft keyboard, the iOS way: the layout viewport keeps its height and only the visual viewport shrinks (and may be offset when
  // Safari scrolls to the field). Fake window.visualViewport's height/offsetTop, and paint a stand-in keyboard for the screenshots.
  // The search bar must sit at the top of the visible band with the result rows directly under it, all above the keyboard.
  const vp = page.viewportSize()!;
  await page.evaluate(() => {
    const w = window as any, fake = new EventTarget() as any;
    w.__vv = { h: innerHeight, t: 0 }; w.__realVV = window.visualViewport; w.__fakeVV = fake;
    const props: Record<string, () => number> = { height: () => w.__vv.h, offsetTop: () => w.__vv.t, pageTop: () => w.__vv.t, width: () => innerWidth, offsetLeft: () => 0, pageLeft: () => 0, scale: () => 1 };
    for (const [k, get] of Object.entries(props)) Object.defineProperty(fake, k, { get });
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
  });
  const keyboard = async (h: number, t: number) => page.evaluate(([h, t]) => {
    const w = window as any; w.__vv = { h, t };
    let kb = document.getElementById('e2e-keyboard');
    if (!kb) { kb = document.createElement('div'); kb.id = 'e2e-keyboard'; (document.querySelector('dialog[open]') ?? document.body).append(kb); }
    Object.assign(kb.style, { position: 'fixed', left: '0', right: '0', top: `${t + h}px`, bottom: '0', background: 'repeating-linear-gradient(0deg,#1c2b2b 0 46px,#324444 46px 50px)', zIndex: '2147483647', pointerEvents: 'none', opacity: '0.92' });
    w.__fakeVV.dispatchEvent(new Event('resize')); w.__fakeVV.dispatchEvent(new Event('scroll'));
  }, [h, t]);
  const input = page.locator('dialog[open]').getByRole('combobox', { name: 'Find a player' });
  const bar = page.locator('dialog[open] [class*=searchRow]');
  const options = page.locator('dialog[open] [role=listbox] [role=option]');
  const list = page.locator('dialog[open] [role=listbox]');
  const shot = async (name: string) => { await capture(page, info, name); await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' }); };
  const expectBelowBar = async (label: string, top: number, h: number) => {
    await page.waitForTimeout(300);
    const b = (await bar.boundingBox())!, o = (await options.first().boundingBox())!, l = (await list.boundingBox())!;
    expect(b.y, `${label}: search bar top ${b.y} is inside the visible band (from ${top})`).toBeGreaterThanOrEqual(top - 1);
    expect(o.y - (b.y + b.height), `${label}: first result starts right under the bar`).toBeGreaterThanOrEqual(0);
    expect(o.y - (b.y + b.height), `${label}: first result starts right under the bar`).toBeLessThanOrEqual(12);
    expect(o.y + Math.min(o.height, 44), `${label}: first result is above the keyboard (${top + h})`).toBeLessThanOrEqual(top + h + 1);
    expect(l.y + l.height, `${label}: results list ends above the keyboard (${top + h})`).toBeLessThanOrEqual(top + h + 1);
    expect(await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0), `${label}: page did not shift`).toBe(0);
  };
  try {
    const header = page.locator('dialog[open] > section > header');
    const headerBox = (await header.boundingBox())!;
    await press(dock.getByRole('button', { name: 'Search cards' }), info);
    await expect(input).toBeVisible();
    const phone = vp.width < 700;
    await page.waitForTimeout(300);
    const barBox = (await bar.boundingBox())!;
    if (phone) {
      // Phones: the bar takes the header row; Back and Done are covered, inert and hidden from screen readers.
      expect(Math.abs(barBox.y - headerBox.y), `search bar top ${barBox.y} sits in the header row (${headerBox.y})`).toBeLessThanOrEqual(16);
      expect(await header.evaluate(el => (el as HTMLElement).inert && el.getAttribute('aria-hidden') === 'true'), 'Back / Done are inert and aria-hidden during search').toBe(true);
      await expect(page.locator('dialog[open]').getByRole('button', { name: /^(Back|Done)$/ })).toHaveCount(0);
    } else {
      expect(barBox.y, 'tablet: the search bar starts under the header, which stays').toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
      await expect(header).not.toHaveAttribute('aria-hidden', 'true');
    }
    const h = Math.round(vp.height * 0.55);
    await keyboard(h, 0);
    await input.fill('mes');
    await expect(options.first()).toBeVisible({ timeout: 15_000 });
    await expectBelowBar('mes', 0, h);
    await shot('binder-search-keyboard-mes');
    await expectNoHorizontalScroll(page, 'binder search with keyboard');
    // Safari scrolled the visual viewport down to the field.
    await keyboard(h - 40, 40);
    await input.fill('ron');
    await expect(options.first()).toBeVisible({ timeout: 15_000 });
    await expectBelowBar('ron (offset viewport)', 40, h - 40);
    await shot('binder-search-keyboard-ron');
    await keyboard(h, 0);
    await input.fill('zqx');
    await expect(page.locator('dialog[open]').getByText('0 matches')).toBeVisible();
    await expect(options.first()).toHaveText(/No players match “zqx”/);
    await expectBelowBar('no match', 0, h);
    await shot('binder-search-keyboard-none');
    await input.fill('mbappe');
    await expect(options).toHaveCount(1, { timeout: 15_000 });
    await expectBelowBar('mbappe', 0, h);
    await input.press('Enter');
    if (phone) {
      await expect(header).not.toHaveAttribute('aria-hidden', 'true');
      expect(await header.evaluate(el => (el as HTMLElement).inert), 'Back / Done come back after search').toBe(false);
    }
  } finally {
    await page.evaluate(() => { const w = window as any; document.getElementById('e2e-keyboard')?.remove(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => w.__realVV }); });
  }

  // The found pocket lights up; open it.
  const pocket = binder.locator('li[data-spot] button').first();
  await expect(pocket).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(600);
  await press(pocket, info);
  const viewer = page.locator('dialog[open] [role=dialog][aria-modal=true]');
  await expect(viewer).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(900);
  await capture(page, info, 'card-viewer');
  await press(page.getByRole('button', { name: 'Flip', exact: true }), info);
  await expect(page.locator('dialog[open] [role=tablist] [role=tab]')).toHaveCount(3, { timeout: 15_000 });
  await press(page.getByRole('button', { name: 'Flip', exact: true }), info);
  await page.waitForTimeout(600);
  // Tilt: drag across the card face.
  const card = viewer.locator('[class*=cardHost]').first();
  const b = (await card.boundingBox())!, c = center(b);
  await drag(page, info, { x: c.x - b.width * 0.25, y: c.y - b.height * 0.2 }, { x: c.x + b.width * 0.25, y: c.y + b.height * 0.2 }, 14);
  await page.waitForTimeout(400);
  await expect(viewer, 'viewer stays open after the tilt drag').toBeVisible();
  await expectNoHorizontalScroll(page, 'card viewer');
  // Last, because it freezes the page's dvh values: the binder dialog still fills the screen with a stale 100dvh.
  if (info.project.use.isMobile) await expectDialogSurvivesStaleDvh(page, 'binder');
  expectNoErrors(issues, info);
});

test('card offer (?cards=earn): face-down deck, pick, reveal, "Added to your binder!" clear of the card', async ({ page }, info) => {
  const offer = { version: 1, offers: [{ id: 'e2e-offer', kind: 'quiz', source: 'e2e', reason: 'Device test reward', cards: ['Lionel Messi', 'Pelé', 'Lev Yashin'], at: Date.now(), seen: false }], paid: [], npcDay: { day: '', ids: [] } };
  const issues = await openIsland(page, { query: '?cards=earn', storage: { 'fi2-player-cards-v1': '[]', 'fi2-card-offers-v1': JSON.stringify(offer) } });
  const dialog = page.locator('dialog[open]');
  const choose = dialog.getByRole('button', { name: 'Open this card' });
  await expect(choose).toBeVisible({ timeout: 60_000 });
  const deck = dialog.locator('[data-card]');
  expect(await deck.count(), 'three face-down cards').toBe(3);
  await page.waitForTimeout(800);
  await capture(page, info, 'card-offer-deck');
  await expectNoHorizontalScroll(page, 'card offer deck');
  const next = dialog.getByRole('button', { name: 'Next card' });
  if (await next.isVisible()) { await press(next, info); await page.waitForTimeout(500); }
  await press(choose, info);
  const added = dialog.getByRole('heading', { name: 'Added to your binder!' });
  await expect(added).toBeVisible({ timeout: 30_000 });
  // Let the flight land.
  await expect(dialog.getByRole('button', { name: 'See it in my binder' })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  const boxes = await page.evaluate(() => {
    const h = document.querySelector('dialog[open] h2[class*=added]'), host = h?.parentElement;
    const card = host ? [...host.children].find(el => el !== h && !el.hasAttribute('data-sparkles')) : null;
    const r = (el: Element | null | undefined) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
    return { heading: r(h), card: r(card), inner: [innerWidth, innerHeight] };
  });
  expect(boxes.card, 'the revealed card is rendered').not.toBeNull();
  const area = overlap(boxes.heading!, boxes.card!);
  expect(area, `"Added to your binder!" overlaps the card by ${Math.round(area)}px²`).toBeLessThanOrEqual(4);
  expect(boxes.heading!.y, 'heading is on screen').toBeGreaterThanOrEqual(0);
  expect(boxes.card!.y + boxes.card!.height, 'card bottom is on screen').toBeLessThanOrEqual(boxes.inner[1] + 1);
  await capture(page, info, 'card-offer-reveal');
  await expectNoHorizontalScroll(page, 'card offer reveal');
  if (info.project.use.isMobile) await expectDialogSurvivesStaleDvh(page, 'card offer reveal');
  const owned = await page.evaluate(() => JSON.parse(localStorage.getItem('fi2-player-cards-v1') ?? '[]'));
  // Every save also holds the Backpack starter kit's 3 cards (lib/town/backpack.ts STARTER_CARDS), so exactly one card beyond those.
  const starter = ['Mary Earps', 'Martin Ødegaard', 'Ada Hegerberg'];
  const earned = (owned as string[]).filter(name => !starter.includes(name));
  expect(earned.length, 'the picked card is saved to the collection').toBe(1);
  expectNoErrors(issues, info);
});
