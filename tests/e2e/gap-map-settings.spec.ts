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
  // Oct 9 2026: About now shares content with the title screen's For grown-ups sheet via components/landing/Donate.tsx
  // (components/about/AboutGrownUps.tsx), whose trigger is a `data-track="sg:donate"` "Donate" button, not the old
  // `data-donation-gate` button from the now-unused components/DonationLinks.tsx.
  await dialog.getByRole('button', { name: 'Donate', exact: true }).click();
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
  await expect(dialog.getByRole('button', { name: 'Donate', exact: true })).toHaveCount(0);
  expectNoErrors(issues, info);
});

test('first run: the welcome steps through to the island and pays the 40 welcome coins once', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.routeWebSocket(/webpack-hmr|_next\/.*hmr/, () => {});
  await page.addInitScript(m => { if (sessionStorage.getItem('gap-seeded')) return; sessionStorage.setItem('gap-seeded', '1'); localStorage.clear(); for (const [k, v] of Object.entries(m)) localStorage.setItem(k, v as string); }, MUTED);
  // Oct 9 2026 rootView rewrite (lib/rootView.ts): `/` always shows the title screen now; sessionStorage fi2-in-game is no
  // longer read by isInGame() (only an in-memory `entered` flag, <html data-island-handoff>, or a `from`/`panel` query key
  // are). A `from=` query key is what the game's own links use to land straight in the game (the same key tests/e2e/gap-helpers.ts
  // bootAt uses as `?from=konbini`), so use it here too instead of the dead flag.
  await page.goto('/?from=e2e-first-run', { waitUntil: 'domcontentloaded' });
  const welcome = page.locator('dialog[data-onboarding-step][open]');
  await expect(welcome).toBeVisible({ timeout: 150_000 });
  await expect(welcome).toHaveAttribute('data-onboarding-step', 'welcome');
  // Oct 6 2026 flow: Skip sits in the header (top right), Back bottom left from step 2, Next on every step but the last, whose button
  // is Explore: it just closes into the island (no lesson launch).
  const skip = welcome.locator('header').getByRole('button', { name: 'Skip' });
  await expect(skip, 'Skip in the header').toBeVisible();
  const vw = page.viewportSize()!.width;
  expect((await skip.boundingBox())!.x, 'Skip on the right').toBeGreaterThan(vw / 2);
  const seen: string[] = [];
  let explored = false;
  for (let i = 0; i < 8 && await welcome.isVisible(); i++) {
    seen.push((await welcome.getAttribute('data-onboarding-step'))!);
    const explore = welcome.getByRole('button', { name: 'Explore', exact: true });
    const getCode = welcome.locator('[data-get-code]');
    const next = welcome.getByRole('button', { name: 'Next', exact: true });
    // Save codes (Oct 10 2026): the save step's "Get my code" is a lazy-loaded chunk (SaveCodeCreate, dynamicImport in
    // IslandOnboarding.tsx), so right after Next moves onto it, the button can take longer to mount than the other steps'
    // Next/Explore. Poll for whichever of the three shows instead of a single non-waiting snapshot, which could race the chunk.
    for (let t = 0; t < 40; t++) {
      if (await getCode.isVisible().catch(() => false) || await explore.count() || await next.isVisible().catch(() => false)) break;
      await page.waitForTimeout(500);
    }
    // Save codes (Oct 9 2026): with saving switched on, a new player must make a code before the island (no Next, no Skip).
    if (await getCode.isVisible().catch(() => false)) {
      await expect(next, 'no way past the save step without a code').toHaveCount(0);
      await expect(welcome.locator('header').getByRole('button', { name: 'Skip' })).toHaveCount(0);
      await getCode.click();
      await welcome.locator('[data-saved-it]').click({ timeout: 30_000 }); // the code itself is made over the network
      await page.waitForTimeout(500);
      continue;
    }
    if (await explore.count()) {
      const back = welcome.getByRole('button', { name: 'Back', exact: true });
      await expect(back, 'Back on the last step').toBeVisible();
      expect((await back.boundingBox())!.x, 'Back bottom left').toBeLessThan((await explore.boundingBox())!.x);
      await explore.click(); explored = true;
    } else await next.click();
    await page.waitForTimeout(500);
  }
  expect(explored, 'the last step ends with Explore').toBe(true);
  await expect(welcome).toBeHidden();
  await page.waitForTimeout(1500);
  await expect(page.locator('footer[aria-label="Playback controls"]'), 'Explore launches no lesson').toHaveCount(0);
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
