import { test, expect, type Page } from '@playwright/test';
import { isTouch } from './helpers';
import { bootAt, fuelSave, walletSave, savedCoins, savedJson, where } from './gap-helpers';

/* Walk-in Konbini (docs/economy/ECONOMY_UPDATE_2026-09-29.md §7): the island door prompt → /konbini → zoom the rice case →
   buy one musubi (charged once) → reveal → eat it (+fuel) → Done walks back out to the island door, on foot.
   Node: tests/konbini.cjs; an ad-hoc browser script exists (scripts/check-konbini-browser.cjs) but nothing in the device suite. */

/** lib/konbini/konbiniDoors.ts KONBINI_DOORS.main */
const DOOR = { x: 71 - 0.55, front: -53 };

const settled = (page: Page) => page.waitForFunction(() => { const k = (window as any).__konbini; return k?.state.zoom?.arrived && !k.state.zooming; }, null, { timeout: 25_000 });

test('Konbini: enter from the island, buy and eat a musubi (charged once, +fuel), Done returns to the door', async ({ page }, info) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await bootAt(page, { x: DOOR.x, z: DOOR.front + 2, ride: 'walk', storage: { 'fi2-fuel-v1': fuelSave(20), 'fi2-arcade-wallet-v1': walletSave(100) } });
  const tap = async (sel: string) => { const l = page.locator(sel).first(); if (isTouch(info)) await l.tap(); else await l.click(); };

  const prompt = page.locator('[data-konbini-enter]');
  await expect(prompt, 'Enter prompt at the Konbini doors').toBeVisible({ timeout: 20_000 });
  // (The click starts a document navigation; the dev server may compile /konbini for a while, so don't wait inside the click.)
  if (isTouch(info)) await prompt.tap({ noWaitAfter: true }); else await prompt.click({ noWaitAfter: true });
  await page.waitForURL(/\/konbini\?door=main/, { timeout: 120_000 });
  await page.waitForFunction(() => (window as any).__konbini, null, { timeout: 90_000 });
  await expect(page.locator('[data-konbini-room]')).toBeVisible();
  const start = await savedCoins(page);

  await page.evaluate(() => (window as any).__konbini.walkTo('rice'));
  await settled(page);
  let id: string | null = null;
  for (let i = 0; i < 8 && !id; i++) {
    id = (await page.locator('[data-konbini-slot^="musubi-"],[data-konbini-slot^="onigiri"]').evaluateAll(bs => bs.map(b => (b as HTMLElement).dataset.konbiniSlot)))[0] ?? null;
    if (!id) { const next = page.locator('[data-konbini-next]'); if (await next.isDisabled()) break; await next.click(); await settled(page); }
  }
  expect(id, 'a rice item on the zoomed shelf').not.toBeNull();
  await tap(`[data-konbini-slot="${id}"]`);
  const buy = page.locator(`[data-konbini-buy="${id}"]`);
  await expect(buy).toBeVisible();
  const price = Number((await buy.textContent())!.match(/(\d+) coins/)![1]);
  await tap(`[data-konbini-buy="${id}"]`);
  await expect(page.locator(`[data-konbini-reveal="${id}"]`)).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-konbini-reveal][data-built=true]')).toBeVisible({ timeout: 15_000 });
  expect(await savedCoins(page), 'charged exactly once').toBe(start - price);

  const fuelBefore = (await savedJson(page, 'fi2-fuel-v1')).fuel;
  await tap('[data-konbini-eat]');
  await expect.poll(async () => (await savedJson(page, 'fi2-fuel-v1')).fuel, { timeout: 10_000 }).toBeGreaterThan(fuelBefore);
  await page.waitForFunction(() => !(window as any).__konbini.state.eating, null, { timeout: 15_000 });

  // Back out of the zoom, then Done walks out through the doors to the island.
  // (Eating ends the zoom by itself; zoom out if a shelf is still in view.)
  await page.waitForTimeout(800);
  await page.evaluate(() => { const k = (window as any).__konbini; if (k.state.zoom) k.zoomOut(); });
  await page.waitForFunction(() => !(window as any).__konbini.state.zoom, null, { timeout: 10_000 });
  await tap('header [data-konbini-done]');
  await page.waitForURL(u => !/konbini/.test(u.pathname), { timeout: 60_000 });
  await page.waitForFunction(() => (window as any).__fi2?.games?.entries?.length, null, { timeout: 120_000 });
  await page.locator('[data-island-return-loading]').waitFor({ state: 'detached', timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const at = await where(page);
  expect(Math.hypot(at.x - DOOR.x, at.z - DOOR.front), `back outside the Konbini door (at ${at.x.toFixed(1)}, ${at.z.toFixed(1)})`).toBeLessThan(8);
  expect(at.ride).toBe('walk');
  // The coins bar shows the spend and the fuel gained.
  const fuelNow = (await savedJson(page, 'fi2-fuel-v1')).fuel;
  await expect(page.locator('[data-job-wallet]')).toHaveAttribute('aria-label', new RegExp(`${start - price} coins.*fuel ${Math.floor(fuelNow)} of 100`));
  expect(errors.filter(e => !/ChunkLoadError|Loading chunk/.test(e))).toEqual([]);
});
