import { test, expect } from '@playwright/test';
import { capture, expectNoErrors, expectNoHorizontalScroll, openIsland, pointer, press } from './helpers';

/* Pass Puzzles: open the arcade card, draw a pass by touch and see the predicted path. */

type PP = { __passPuzzle: { world: { state: { phase: string; ball: { p: { x: number; z: number } }; attackers: { p: { x: number; z: number } }[]; carrier: number } }; scene: { toScreen(x: number, y: number, z: number): { x: number; y: number }; debug(): { pathDots: number; receiverRing?: unknown; end?: unknown } }; solution?: (id: string) => { target: { x: number; z: number } }[] | undefined } };

test('Pass Puzzles: draw a stroke and see the path', async ({ page }, info) => {
  const issues = await openIsland(page, { storage: { 'fi2-pass-puzzles-v1': '' } });
  await page.goto('/arcade?game=puzzle');
  await page.waitForFunction(() => (window as unknown as Partial<PP>).__passPuzzle?.world, null, { timeout: 60_000 });
  await press(page.locator('[data-level]').first(), info);
  const freeze = page.getByRole('button', { name: 'Start puzzle' });
  await expect(freeze).toBeVisible();
  await press(freeze, info);
  await page.waitForFunction(() => (window as unknown as PP).__passPuzzle.world.state.phase === 'aiming', null, { timeout: 30_000 });
  const canvas = page.locator('[data-arcade-kind="pass-puzzle"] canvas');
  // Guards against the iOS long-press callout on the drawing surface (see tests/device-guards.cjs check 1).
  const guard = await canvas.evaluate(el => { const cs = getComputedStyle(el) as CSSStyleDeclaration & { webkitTouchCallout?: string }; return { action: cs.touchAction, callout: cs.webkitTouchCallout ?? '', supported: CSS.supports('-webkit-touch-callout', 'none') }; });
  info.annotations.push({ type: 'canvas guards', description: JSON.stringify(guard) });
  const plan = await page.evaluate(() => {
    const g = (window as unknown as PP).__passPuzzle, s = g.world.state, b = s.ball.p;
    let best = s.attackers[0].p, d = 1e9;
    s.attackers.forEach((a, i) => { if (i === s.carrier) return; const dd = Math.hypot(a.p.x - b.x, a.p.z - b.z); if (dd < d) { d = dd; best = a.p; } });
    return { from: g.scene.toScreen(b.x, 0, b.z), to: g.scene.toScreen(best.x, 0, best.z) };
  });
  const box = (await canvas.boundingBox())!, at = (p: { x: number; y: number }) => ({ x: box.x + p.x, y: box.y + p.y });
  const a = at(plan.from), c = at(plan.to);
  const p = await pointer(page, info);
  await p.down(a.x, a.y);
  for (let i = 1; i <= 14; i++) { const t = i / 14; await p.move(a.x + (c.x - a.x) * t + Math.sin(t * Math.PI) * 18, a.y + (c.y - a.y) * t); await page.waitForTimeout(16); }
  await page.waitForTimeout(150);
  const aim = await page.evaluate(() => (window as unknown as PP).__passPuzzle.scene.debug());
  await capture(page, info, 'pass-puzzle-stroke');
  expect(aim.pathDots, `predicted path drawn (${aim.pathDots} dots)`).toBeGreaterThan(3);
  expect(!!(aim.receiverRing || aim.end), 'path shows a receiver or end marker').toBe(true);
  // Back to the ball and release: too short to kick, the puzzle stays in aiming.
  for (let i = 1; i <= 8; i++) { await p.move(c.x + (a.x - c.x) * i / 8, c.y + (a.y - c.y) * i / 8); await page.waitForTimeout(16); }
  await p.up(); await p.dispose();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as PP).__passPuzzle.world.state.phase)).toBe('aiming');
  expect(await page.evaluate(() => document.getSelection()?.toString() ?? '')).toBe('');
  await expectNoHorizontalScroll(page, 'Pass Puzzles');
  expectNoErrors(issues, info);
});
