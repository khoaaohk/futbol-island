import { test, expect, type Page } from '@playwright/test';
import { expectNoErrors } from './helpers';
import { bootAt, fuelSave, marketSave, hudFuel, playDay, savedJson, hit } from './gap-helpers';

/* Day rollover: the first load of a new local day gives breakfast (a full tank), resets the market's full-price allowance and
   shows the welcome-back card once; a session that crosses midnight also gets breakfast. Node coverage pins each rule
   (tests/fuel.cjs, tests/island-jobs.cjs, tests/new-player-flow.cjs, tests/daily-play.cjs); none of it ran in a browser. */

const SQUARE = { x: 103, z: -8, ride: 'walk' };

/** Lets a test move the page's wall clock (Date only; performance.now and the frame loop are untouched). */
async function installClockShift(page: Page) {
  await page.addInitScript(() => {
    const Real = Date; let offset = 0;
    (window as any).__setClockOffset = (ms: number) => { offset = ms; };
    // A function shim (not a class) so `Date()` called without `new` still works; instances are real Dates.
    function Shifted(this: unknown, ...a: any[]) {
      if (!(this instanceof Shifted)) return new Real(Real.now() + offset).toString();
      return a.length ? new (Real as any)(...a) : new Real(Real.now() + offset);
    }
    Shifted.prototype = Real.prototype;
    Object.assign(Shifted, { now: () => Real.now() + offset, UTC: Real.UTC, parse: Real.parse });
    (window as any).Date = Shifted;
  });
}

test('new day on load: breakfast fills the tank, the market allowance resets, welcome back shows once', async ({ page }, info) => {
  await page.addInitScript(() => { (window as unknown as { __fi2WelcomeMs: number }).__fi2WelcomeMs = 60_000; }); // hold the card while the test interacts (dev-only hook)
  const yesterday = playDay(-1);
  const issues = await bootAt(page, { ...SQUARE, storage: {
    'fi2-fuel-v1': fuelSave(10, yesterday),
    'fi2-market-v1': marketSave({ sardine: 1 }, { day: yesterday, soldToday: 40 }),
    'fi2-last-visit-day-v1': yesterday,
  } });
  expect(await hudFuel(page), 'breakfast: a full tank on a new day').toEqual({ fuel: 100, level: 'full' });
  expect((await savedJson(page, 'fi2-fuel-v1')).day).toBe(playDay());

  const card = page.locator('[data-welcome-back]');
  await expect(card, 'welcome-back card on the first load of a new day').toBeVisible({ timeout: 20_000 });
  await card.click(); // a note since Oct 1 2026: no buttons, a tap hides it (it also hides on its own after 6 s)
  await expect(card).toBeHidden();

  // The stand's full-price allowance starts again today.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('fi2-open-market-stand', { detail: { tab: 'fish' } })));
  const stand = page.locator('dialog[data-market-stand]');
  await expect(stand).toBeVisible();
  await expect(stand.locator('[aria-label^="Full-price sales today"]')).toHaveAttribute('aria-label', /: 0 of 40 coins/);
  await stand.getByRole('button', { name: /done/i }).first().click();

  // Same day again: no second welcome-back card.
  await page.evaluate(s => sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({ version: 1, ...s, yaw: Math.PI, flightHeight: 0 })), SQUARE);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.travel-actions').waitFor({ state: 'visible', timeout: 120_000 });
  await page.waitForTimeout(4000);
  await expect(card).toHaveCount(0);
  expectNoErrors(issues, info);
});

test('a session that crosses midnight gets breakfast without a reload', async ({ page }, info) => {
  await installClockShift(page);
  const issues = await bootAt(page, { ...SQUARE, storage: { 'fi2-fuel-v1': fuelSave(10) } });
  expect((await hudFuel(page)).fuel).toBe(10);
  // Jump the wall clock to 00:00:05 tomorrow.
  await page.evaluate(() => { const n = new Date(); const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5).getTime(); (window as any).__setClockOffset(midnight - Date.now()); });
  // Standing still: does the bar show breakfast?
  const still = await expect.poll(async () => (await hudFuel(page)).fuel, { timeout: 8_000 }).toBe(100).then(() => true, () => false);
  // Then take a few steps (the HUD tick writes fuel on movement).
  if (!still) { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowUp'); }
  await expect.poll(async () => (await hudFuel(page)).fuel, { timeout: 8_000 }).toBeGreaterThanOrEqual(99);
  info.annotations.push({ type: 'midnight', description: still ? 'bar refilled while standing still' : 'bar refilled only after moving (stale while idle)' });
  expect(still, 'the bar refills at midnight even while the player stands still').toBe(true);
  expectNoErrors(issues, info);
});
