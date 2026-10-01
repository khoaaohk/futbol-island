import { test, expect } from '@playwright/test';
import { expectNoErrors, isTouch } from './helpers';
import { bootAt, teleport, walletSave, savedCoins, hudCoins } from './gap-helpers';

/* Vending machine in the world (docs/vending-machines.md): walk up → Go → the face → press an item twice (arm, then coins) →
   drop → tap the tray → the reward; the coins bar is charged once. Node: tests/vending-machines.cjs (catalogue/ledger);
   ad-hoc browser scripts cover placement and art, not the buy loop. */

test('vending: walk up, Go, buy an item, take it from the tray, charged once', async ({ page }, info) => {
  test.setTimeout(300_000);
  const issues = await bootAt(page, { x: 11, z: -44, ride: 'walk', storage: { 'fi2-arcade-wallet-v1': walletSave(500) } });
  const front = await page.evaluate(() => { const e = (window as any).__fi2.vending.entries.find((x: any) => x.machine.id === 'oldtown'); return e.front ?? { x: e.machine.x + Math.sin(e.machine.yaw) * 2.2, z: e.machine.z + Math.cos(e.machine.yaw) * 2.2 }; });
  await teleport(page, front.x, front.z, 1500);
  const go = page.locator('[data-vending-go]');
  await expect(go, 'Go prompt at the machine').toBeVisible({ timeout: 15_000 });
  const tap = async (sel: string) => { const l = page.locator(sel).first(); if (isTouch(info)) await l.tap(); else await l.click(); };
  await tap('[data-vending-go]');
  const face = page.locator('[data-vending-face]');
  await expect(face).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(1200);
  const start = await savedCoins(page);

  // First page with something buyable (a book if that page has one: books open the pop-up book).
  let slot = face.locator('[data-vending-item][data-state="buy"]').first();
  for (let i = 0; i < 11 && !(await slot.count()); i++) {
    await face.locator('[aria-label*="Next row"]').first().click(); await page.waitForTimeout(700);
  }
  const book = face.locator('[data-vending-item^="book"][data-state="buy"]').first();
  if (await book.count()) slot = book;
  await expect(slot, 'a buyable item').toHaveCount(1);
  const id = (await slot.getAttribute('data-vending-item'))!;
  await slot.click();
  await page.waitForTimeout(400);
  await face.locator(`[data-vending-item="${id}"]`).click(); // second press inserts the coins
  const machine = page.locator('[data-vending-machine="oldtown"]');
  await expect(machine).toHaveAttribute('data-vending-phase', /coins|drop|tray/, { timeout: 10_000 });
  const tray = face.locator('[data-vending-tray]');
  await expect(machine).toHaveAttribute('data-vending-phase', 'tray', { timeout: 20_000 });
  await tray.click();
  await expect(page.locator(`[data-vending-reward="${id}"]`)).toBeVisible({ timeout: 15_000 });
  const spent = start - await savedCoins(page);
  expect(spent, `charged for ${id}`).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
  expect(start - await savedCoins(page), 'charged once').toBe(spent);
  info.annotations.push({ type: 'bought', description: `${id} for ${spent}` });
  // Leave: Escape walks away from the machine; the coins bar shows the new balance.
  for (let i = 0; i < 4 && await page.locator('[data-vending-face]').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(800); }
  await expect.poll(() => hudCoins(page), { timeout: 15_000 }).toBe(start - spent);
  expectNoErrors(issues, info);
});
