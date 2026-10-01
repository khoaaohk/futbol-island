import { test, expect } from '@playwright/test';
import { expectNoErrors } from './helpers';
import { bootAt, fuelSave, marketSave, hudFuel, savedJson, hit } from './gap-helpers';

/* Island pocket + fuel refuel by eating (docs/economy/FUEL_2026-09-30.md §2.2, components/IslandBalanceDrawer.tsx).
   Node coverage exists for the store logic (tests/island-pocket.cjs, tests/fuel.cjs); this is the first browser pass.
   On foot at the usual spawn: the default jetpack HOVER drains fuel while idle (by design, FUEL doc §2.1), which would move the numbers. */
const SPAWN = { x: 103, z: -8, ride: 'walk' };

test('pocket: counts match the coins bar; eating a banana refuels, empties the basket slot and survives a reload', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SPAWN, storage: { 'fi2-fuel-v1': fuelSave(40), 'fi2-market-v1': marketSave({ banana: 2, sardine: 1 }) } });
  const wallet = page.locator('[data-job-wallet]');
  await expect(wallet).toHaveAttribute('aria-label', /1 fish, 2 fruit and vegetables, fuel 40 of 100/);
  expect((await hudFuel(page)).fuel).toBe(40);

  await hit(page, '[data-job-wallet]', info);
  const pocket = page.locator('dialog[data-island-balances]');
  await expect(pocket).toBeVisible();
  await expect(pocket.locator('[data-pocket-fuel]')).toContainText('40');
  await expect(pocket.locator('[data-pocket-fish]')).toHaveText('1');
  await expect(pocket.locator('[data-pocket-fruit]')).toHaveText('2');
  await expect(pocket.locator('[data-pocket-item="banana"]')).toHaveAttribute('data-count', '2');
  await expect(pocket.locator('[data-pocket-space]')).toHaveText('3 / 20');

  await pocket.locator('[data-fuel-eat="banana"] button').click();
  await expect(pocket.locator('[data-fuel-ate]')).toContainText('+30 fuel');
  await expect(pocket.locator('[data-pocket-fuel]')).toContainText('70');
  await expect(pocket.locator('[data-pocket-item="banana"]')).toHaveAttribute('data-count', '1');
  await expect(pocket.locator('[data-pocket-space]')).toHaveText('2 / 20');
  await pocket.getByRole('button', { name: /done/i }).first().click();
  await expect(pocket).toBeHidden();
  // The coins bar follows at once.
  await expect(wallet).toHaveAttribute('aria-label', /1 fruit and vegetables, fuel 70 of 100/);
  expect((await savedJson(page, 'fi2-market-v1')).basket.banana).toBe(1);

  // Reload: fuel and the basket persist (no re-seed: storage was seeded once for this tab).
  // (Re-arm the on-foot return spot: the island consumes it on boot, and the default hover would drain fuel meanwhile.)
  await page.evaluate(s => sessionStorage.setItem('fi2-arcade-departure-v1', JSON.stringify({ version: 1, ...s, yaw: Math.PI, flightHeight: 0 })), SPAWN);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.travel-actions').waitFor({ state: 'visible', timeout: 120_000 });
  await expect(wallet).toHaveAttribute('aria-label', /1 fruit and vegetables, fuel 70 of 100/);
  expectNoErrors(issues, info);
});

test('pocket: a full tank refuses to eat and keeps the fruit; an empty basket explains the free garden path', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SPAWN, storage: { 'fi2-fuel-v1': fuelSave(100), 'fi2-market-v1': marketSave({ orange: 1 }) } });
  await hit(page, '[data-job-wallet]', info);
  const pocket = page.locator('dialog[data-island-balances]');
  await expect(pocket.locator('[data-pocket-fuel-section]')).toHaveAttribute('data-fuel-level', 'full');
  await pocket.locator('[data-fuel-eat="orange"] button').click();
  await expect(pocket.locator('[data-fuel-ate]')).toContainText(/tank is full/i);
  await expect(pocket.locator('[data-pocket-item="orange"]')).toHaveAttribute('data-count', '1');
  // Sell it... no, the basket keeps it. Now empty the basket via storage and reopen: the free path is named.
  await pocket.getByRole('button', { name: /done/i }).first().click();
  await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('fi2-market-v1')!); m.basket = {}; localStorage.setItem('fi2-market-v1', JSON.stringify(m)); });
  await hit(page, '[data-job-wallet]', info);
  await expect(pocket.locator('[data-pocket-fuel-section]')).toContainText(/Pick fruit in the Community Garden/);
  await expect(pocket.locator('[data-fuel-eat-list]')).toHaveCount(0);
  expectNoErrors(issues, info);
});
