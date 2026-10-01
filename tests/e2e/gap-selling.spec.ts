import { test, expect } from '@playwright/test';
import { expectNoErrors } from './helpers';
import { bootAt, marketSave, hudCoins, savedCoins, savedJson, hit, clearOffers } from './gap-helpers';
import { goodById } from '../../lib/town/market/goods';

/** lib/town/fishing/fishCatalog.ts MARKET_STAND and lib/town/jobs/jobScene.ts FARM_STAND_SELL (kept literal: those modules pull in three.js). */
const MARKET_STAND = { front: { x: 225.2, z: 35 } };
const FARM_STAND_SELL = { x: 611, z: -98.6 };

/* Selling (docs/sell-shop.md, docs/fishing.md): walk up to Rosa's stand → Sell → sell all fish and one banana → coins land on
   the coins bar once and the basket empties; the Coral Cay farm stand buys produce only. Node: tests/sell-shop.cjs,
   tests/fishing.cjs, tests/island-jobs.cjs (market rules). No browser test drove the stand before. */

test("Rosa's stand: the Sell prompt opens the stand; sell all fish, then one banana; coins and basket follow", async ({ page }, info) => {
  const issues = await bootAt(page, { x: MARKET_STAND.front.x, z: MARKET_STAND.front.z, ride: 'walk', storage: { 'fi2-market-v1': marketSave({ sardine: 2, banana: 3 }) } });
  const enter = page.locator('[data-market-enter]');
  await expect(enter, 'Sell prompt at the stand').toBeVisible({ timeout: 15_000 });
  const before = await hudCoins(page);
  await hit(page, '[data-market-enter]', info);
  const stand = page.locator('dialog[data-market-stand]');
  await expect(stand).toBeVisible();
  await expect(stand).toHaveAttribute('data-market-place', 'rosa');
  await expect(stand.getByRole('tab')).toHaveCount(3);
  await expect(stand.getByRole('tab', { name: /Fish/ })).toHaveAttribute('aria-selected', 'true');

  const sellFish = stand.locator('[data-market-sell-all="fish"]');
  const fishCoins = Number((await sellFish.textContent())!.match(/(\d+) coins/)![1]);
  expect(fishCoins).toBeGreaterThan(0);
  await sellFish.click();
  await expect(stand.locator('[data-market-note]')).toContainText(/Sardine.*sold/);
  // (The coins bar hides behind the stand; the stand shows its own balance.)
  // A first sale can also tick the Explore checklist (+5 learning coins), so the balance moves by the sale or the sale + 5.
  await expect.poll(async () => [0, 5].includes(await savedCoins(page) - before - fishCoins), { timeout: 15_000 }).toBe(true);
  const extra = await savedCoins(page) - before - fishCoins;
  info.annotations.push({ type: 'wallet runs', description: JSON.stringify(Object.entries((await savedJson(page, 'fi2-arcade-wallet-v1')).runs).map(([k, r]: any) => `${k}=${r.paid} ${r.reason}`)) });
  await expect(stand.locator('[data-market-balance] b')).toHaveText(String(before + fishCoins + extra));

  await stand.getByRole('tab', { name: /Produce/ }).click();
  const price = goodById('banana')!.price;
  await stand.getByRole('button', { name: new RegExp(`Sell one Banana for ${price} coins`) }).click();
  await expect(stand.locator('[data-market-balance] b')).toHaveText(String(before + fishCoins + extra + price));
  const m = await savedJson(page, 'fi2-market-v1');
  expect(m.basket).toEqual({ banana: 2 });
  expect(m.soldToday).toBe(fishCoins + price);
  await expect(stand.locator('[aria-label^="Full-price sales today"]')).toHaveAttribute('aria-label', new RegExp(`${fishCoins + price} of 40`));

  await stand.getByRole('button', { name: /done/i }).first().click();
  await expect(stand).toBeHidden();
  // The first sale completes the Explore item "Sell to Rosa": its card offer opens over the HUD.
  await page.waitForTimeout(1000); await clearOffers(page);
  await expect(page.locator('[data-job-wallet]')).toHaveAttribute('aria-label', new RegExp(`${before + fishCoins + extra + price} coins, 0 fish, 2 fruit`));
  expectNoErrors(issues, info);
});

test('selling with an empty basket says so kindly and pays nothing', async ({ page }, info) => {
  const issues = await bootAt(page, { x: MARKET_STAND.front.x, z: MARKET_STAND.front.z, ride: 'walk' });
  await expect(page.locator('[data-market-enter]')).toBeVisible({ timeout: 15_000 });
  const before = await hudCoins(page);
  await hit(page, '[data-market-enter]', info);
  const stand = page.locator('dialog[data-market-stand]');
  await expect(stand).toBeVisible();
  // No sell-all button for an empty basket, and the copy points to where goods come from.
  await expect(stand.locator('[data-market-sell-all]')).toHaveCount(0);
  await expect(stand).toContainText(/No fish in your basket yet/);
  await expect(stand.locator('[data-market-balance] b')).toHaveText(String(before));
  expectNoErrors(issues, info);
});

test('Coral Cay farm stand: on foot at the counter → Sell fruit & veg → produce only, same prices', async ({ page }, info) => {
  const issues = await bootAt(page, { x: FARM_STAND_SELL.x, z: FARM_STAND_SELL.z + 1, ride: 'walk', storage: { 'fi2-market-v1': marketSave({ mango: 2, sardine: 1 }) } });
  const btn = page.locator('[data-farm-stand-sell]');
  await expect(btn, 'farm stand sell button').toBeVisible({ timeout: 20_000 });
  const before = await hudCoins(page);
  await hit(page, '[data-farm-stand-sell]', info);
  const stand = page.locator('dialog[data-market-stand]');
  await expect(stand).toHaveAttribute('data-market-place', 'farm');
  await expect(stand.getByRole('tab')).toHaveCount(1);
  await expect(stand.locator('[data-market-sell-all="fish"]')).toHaveCount(0);
  const all = stand.locator('[data-market-sell-all="produce"]');
  const coins = Number((await all.textContent())!.match(/(\d+) coins/)![1]);
  expect(coins).toBe(2 * goodById('mango')!.price);
  await all.click();
  await expect.poll(async () => [0, 5].includes(await savedCoins(page) - before - coins), { timeout: 15_000 }).toBe(true);
  expect((await savedJson(page, 'fi2-market-v1')).basket).toEqual({ sardine: 1 });
  expectNoErrors(issues, info);
});
