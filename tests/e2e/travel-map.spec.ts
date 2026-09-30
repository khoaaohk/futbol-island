import { test, expect } from '@playwright/test';
import { openIsland, expectNoErrors, pointer } from './helpers';

test('travel map keeps its position when a drag is interrupted and accepts the next drag', async ({ page }, info) => {
  const issues = await openIsland(page);
  await page.keyboard.press('m');
  const map = page.getByRole('region', { name: /^Island map\./ });
  await expect(map).toBeVisible();
  const stage = map.locator(':scope > div');
  await page.waitForTimeout(400);
  const box = (await map.boundingBox())!;
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const p = await pointer(page, info);
  await p.down(start.x, start.y);
  await p.move(start.x + 30, start.y + 30);
  await expect(stage).toHaveAttribute('data-dragging', 'true');
  const before = await stage.evaluate(el => el.style.transform);
  // A second contact must not replace the pointer already moving the map.
  await map.dispatchEvent('pointerdown', { pointerId: 99, pointerType: 'touch', isPrimary: false, clientX: start.x, clientY: start.y });
  // OS/browser cancellation need not carry the final pointer coordinates.
  await map.evaluate(el => {
    let id = 1;
    for (let candidate = 0; candidate < 32; candidate++) if (el.hasPointerCapture(candidate)) id = candidate;
    el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: id }));
  });
  await expect(stage).not.toHaveAttribute('data-dragging', 'true');
  await expect.poll(() => stage.evaluate(el => el.style.transform)).toBe(before);
  await p.up();
  await p.down(start.x, start.y);
  await p.move(start.x - 30, start.y - 30);
  await expect(stage).toHaveAttribute('data-dragging', 'true');
  const beforeCaptureLoss = await stage.evaluate(el => el.style.transform);
  await map.evaluate(el => {
    for (let id = 0; id < 32; id++) if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
  });
  // The browser delivers lostpointercapture before the next pointer event.
  await p.up();
  await expect(stage).not.toHaveAttribute('data-dragging', 'true');
  await expect.poll(() => stage.evaluate(el => el.style.transform)).toBe(beforeCaptureLoss);
  await expect(page.getByRole('heading', { name: 'Pick your patch' })).toBeVisible();
  await p.dispose();
  await page.keyboard.press('Escape');
  await expect(map).not.toBeVisible();
  expectNoErrors(issues, info);
});
