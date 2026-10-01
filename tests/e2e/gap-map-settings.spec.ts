import { test, expect } from '@playwright/test';
import { expectNoErrors } from './helpers';
import { bootAt, fuelSave, hudFuel, where, hit, MUTED } from './gap-helpers';

/* Travel map fast travel, Settings → About / For grown-ups (parent gate), and the first-run welcome.
   tests/e2e/travel-map.spec.ts covers dragging and the legend; nothing travelled with the map. Gate logic: tests/parent-gate.cjs. */

const SQUARE = { x: 103, z: -8, ride: 'walk' };
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

test('map: tapping Coaches Centre travels there, closes the map and costs no fuel', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SQUARE, storage: { 'fi2-fuel-v1': fuelSave(60.5) } });
  const fuel0 = (await hudFuel(page)).fuel, a = await where(page);
  await hit(page, '[aria-label="View map"]', info);
  const map = page.getByRole('region', { name: /^Island map\./ });
  await expect(map).toBeVisible();
  const dest = page.getByRole('button', { name: 'Travel to Coaches Centre' });
  await expect(dest).toHaveCount(1);
  await dest.click();
  await expect(map).toBeHidden({ timeout: 10_000 });
  await expect.poll(async () => { const b = await where(page); return Math.hypot(b.x - a.x, b.z - a.z); }, { timeout: 30_000 }).toBeGreaterThan(30);
  await page.waitForTimeout(3000);
  expect((await hudFuel(page)).fuel, 'map travel is never charged').toBeGreaterThanOrEqual(fuel0 - 1);
  expectNoErrors(issues, info);
});

test('settings: About opens and goes back; no For grown-ups button in Settings (Oct 1 2026); the donation card needs the parent gate', async ({ page }, info) => {
  const issues = await bootAt(page, { ...SQUARE });
  await hit(page, '[aria-label="Settings"]', info);
  const dialog = page.locator('dialog[open]').first();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#island-settings-title')).toHaveText('Make it your island');
  await dialog.getByRole('button', { name: /About us/ }).click();
  await expect(page.locator('#island-settings-title')).toHaveText('About us');
  await dialog.locator('header').getByRole('button').first().click();
  await expect(page.locator('#island-settings-title')).toHaveText('Make it your island');

  await expect(dialog.locator('[data-open-grownups]'), 'Settings has no For grown-ups button (user, Oct 1 2026)').toHaveCount(0);
  await dialog.getByRole('button', { name: /About us/ }).click();
  await dialog.locator('[data-donation-gate]').click();
  const gate = page.locator('[data-parent-gate]').first();
  await expect(gate).toBeVisible({ timeout: 10_000 });
  const input = gate.locator('[data-parent-gate-answer]');
  await input.fill('1');
  await gate.getByRole('button', { name: 'Continue' }).click();
  await expect(gate.locator('[role=status]')).toContainText(/Not quite/);
  const q = (await gate.locator('label').first().textContent())!;
  const m = q.match(/What is ([a-z]+) times ([a-z]+)\?/);
  expect(m, `gate question in words: ${q}`).not.toBeNull();
  await input.fill(String(WORDS.indexOf(m![1]) * WORDS.indexOf(m![2])));
  await gate.getByRole('button', { name: 'Continue' }).click();
  await expect(gate).toHaveCount(0, { timeout: 10_000 });
  await expect(dialog.locator('[data-donation-gate]')).toHaveCount(0);
  expectNoErrors(issues, info);
});

test('first run: the welcome steps through to the island and pays the 40 welcome coins once', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.routeWebSocket(/webpack-hmr|_next\/.*hmr/, () => {});
  await page.addInitScript(m => { if (sessionStorage.getItem('gap-seeded')) return; sessionStorage.setItem('gap-seeded', '1'); localStorage.clear(); for (const [k, v] of Object.entries(m)) localStorage.setItem(k, v as string); }, MUTED);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const welcome = page.locator('dialog[data-onboarding-step][open]');
  await expect(welcome).toBeVisible({ timeout: 150_000 });
  await expect(welcome).toHaveAttribute('data-onboarding-step', 'welcome');
  const seen: string[] = [];
  for (let i = 0; i < 8 && await welcome.isVisible(); i++) {
    seen.push((await welcome.getAttribute('data-onboarding-step'))!);
    const next = welcome.getByRole('button', { name: /^(Next|Done)$/ }).last();
    await next.click();
    await page.waitForTimeout(500);
  }
  await expect(welcome).toBeHidden();
  expect(seen[0]).toBe('welcome');
  expect(seen).toContain('paths');
  expect(await page.evaluate(() => localStorage.getItem('fi2-welcome-v1'))).toBeTruthy();
  await expect(page.locator('[data-job-wallet]')).toHaveAttribute('aria-label', /: 40 coins/, { timeout: 20_000 });
  // Reload: the welcome does not come back and no second grant.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.travel-actions').waitFor({ state: 'visible', timeout: 120_000 });
  await page.waitForTimeout(2500);
  await expect(welcome).toHaveCount(0); // closed dialog stays in the DOM without [open]
  await expect(page.locator('[data-job-wallet]')).toHaveAttribute('aria-label', /: 40 coins/);
  info.annotations.push({ type: 'steps', description: seen.join(' → ') });
  expect(errors.filter(e => !/ChunkLoadError|Loading chunk/.test(e))).toEqual([]);
});
