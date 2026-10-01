import { test, expect } from '@playwright/test';
import { expectNoErrors } from './helpers';
import { bootAt, fuelSave, marketSave, hudFuel, hit, holdKey, where } from './gap-helpers';

/* Fuel in the browser (docs/economy/FUEL_2026-09-30.md): the empty tank refuses rides with a gentle note, walking always works,
   eating restores rides, flying drains, the low note shows once, and running dry in the air lands you on foot.
   Logic is pinned in tests/fuel.cjs; nothing drove the real HUD/ride wiring before. */

const SQUARE = { x: 103, z: -8 };

test('empty tank: a ride is refused with a note, walking still works, a banana brings rides back', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SQUARE, ride: 'walk', storage: { 'fi2-fuel-v1': fuelSave(0), 'fi2-market-v1': marketSave({ banana: 1 }) } });
  const travel = page.locator('button.travel-mode').first();
  expect(await hudFuel(page)).toEqual({ fuel: 0, level: 'empty' });
  await expect(page.locator('[data-job-wallet] [data-fuel]')).toContainText('Empty');
  await expect(travel).toHaveAttribute('aria-label', /Walk/);

  await hit(page, 'button.travel-mode', info);
  await expect(page.locator('[data-fuel-toast="blocked"]')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-fuel-toast="blocked"]')).toContainText(/needs fuel/);
  await page.waitForTimeout(1500);
  await expect(travel, 'the ride stays on walk').toHaveAttribute('aria-label', /Walk/);

  const a = await where(page);
  await holdKey(page, 'ArrowUp', 3000);
  const b = await where(page);
  expect(Math.hypot(b.x - a.x, b.z - a.z), 'walking works at 0 fuel').toBeGreaterThan(1); // headless frames run slow: ~0.7 m/s here at any fuel level

  await hit(page, '[data-job-wallet]', info);
  const pocket = page.locator('dialog[data-island-balances]');
  await pocket.locator('[data-fuel-eat="banana"] button').click();
  await expect(pocket.locator('[data-pocket-fuel]')).toContainText('30');
  await pocket.getByRole('button', { name: /done/i }).first().click();
  await expect(pocket).toBeHidden();
  await hit(page, 'button.travel-mode', info);
  await expect(travel, 'a ride starts again after a snack').not.toHaveAttribute('aria-label', /Walk/, { timeout: 15_000 });
  expectNoErrors(issues, info);
});

test('flying drains fuel and the low-fuel note shows once the bar reaches 25', async ({ page }, info) => {
  // 26.6: the bar shows 26 at boot and crosses 25 after ~10 s of flight (0.06/s), so the one-time note shows mid-test.
  const issues = await bootAt(page, { ...SQUARE, ride: 'jetpack', flightHeight: 14, storage: { 'fi2-fuel-v1': fuelSave(26.6) } });
  expect((await hudFuel(page)).fuel).toBe(26);
  const low = page.locator('[data-fuel-toast="low"]');
  await page.keyboard.down('ArrowUp');
  try { await expect(low).toBeVisible({ timeout: 40_000 }); } finally { await page.keyboard.up('ArrowUp'); }
  await expect(low).toContainText(/running low/i);
  expect(await hudFuel(page)).toEqual({ fuel: 25, level: 'low' });
  expectNoErrors(issues, info);
});

test('running dry in the air lands the player on foot with the out-of-fuel note', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SQUARE, ride: 'jetpack', flightHeight: 10, storage: { 'fi2-fuel-v1': fuelSave(1.6) } });
  // 1.6 → crosses below 1 after ~10 s of flight; the note shows while the jetpack lands.
  await page.keyboard.down('ArrowUp');
  try { await expect(page.locator('[data-fuel-toast="empty"]')).toBeVisible({ timeout: 40_000 }); } finally { await page.keyboard.up('ArrowUp'); }
  expect((await hudFuel(page)).level).toBe('empty');
  await expect(page.locator('button.travel-mode').first(), 'lands and walks').toHaveAttribute('aria-label', /Walk/, { timeout: 45_000 });
  expectNoErrors(issues, info);
});

test('standing still on foot uses no fuel', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SQUARE, ride: 'walk', storage: { 'fi2-fuel-v1': fuelSave(50.02) } });
  expect((await hudFuel(page)).fuel).toBe(50);
  await page.waitForTimeout(12_000);
  expect((await hudFuel(page)).fuel).toBe(50);
  expectNoErrors(issues, info);
});
