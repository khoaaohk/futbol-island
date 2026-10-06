import { test, expect, type Page } from '@playwright/test';
import { finishedPathsStorage, openIsland } from './helpers';

/* Heat pass 5, view-based work on phones: off-screen far fields do no work, and nothing on screen is ever culled. */
type Fi2 = Record<string, any>;
async function clearOffers(page: Page) {
  for (let i = 0; i < 3; i++) {
    const offer = page.getByRole('button', { name: 'Open this card' });
    if (!(await offer.count())) return;
    await offer.first().click(); await page.waitForTimeout(3500);
    const done = page.getByRole('button', { name: 'Done', exact: true }); if (await done.count()) await done.last().click();
    await page.waitForTimeout(1500);
  }
}
/** Over N rendered frames: every live player and townsperson whose body projects inside the screen is posed and drawn. */
async function onScreenNeverCulled(page: Page, N: number) {
  return page.evaluate((N) => new Promise<{ frames: number; checked: number; culled: string[] }>(done => {
    const f = (window as unknown as { __fi2: Fi2 }).__fi2, rd = f.renderer, orig = rd.render.bind(rd), V = f.camera.position.constructor;
    let frames = 0, checked = 0; const culled: string[] = [];
    const onScreen = (root: any, lift: number) => { const p = new V(); root.getWorldPosition(p); p.y += lift; const q = p.project(f.camera); return q.z < 1 && Math.abs(q.x) < .95 && Math.abs(q.y) < .95; };
    rd.render = function (scene: unknown, camera: unknown) {
      orig(scene, camera); if (scene !== f.scene) return; frames++;
      for (const e of f.games.entries) {
        // Only drawn fields: a dormant field is never in view (the frustum + 240 m test wakes it first), and fields beyond 240 m were
        // never drawn, before or after heat pass 5 (a wide desktop view can reach them on screen).
        if (!e.root.visible) continue;
        for (const [id, rig] of e.rigs as Map<string, any>) {
          if (!rig.root.visible || !onScreen(rig.root, .9)) continue;
          if (e.venue.elevation && f.camera.position.y < e.venue.elevation) continue; // rooftop court seen from below: hidden by the building
          checked++;
          if (e.dormant || rig.root.userData.poseSkipped) culled.push(`${e.venue.id}:${id}@${frames}`);
        }
      }
      for (const entry of f.islandNpcs.entries) {
        if (entry.distance > 60 || !onScreen(entry.rig.root, 1)) continue; // within the townsfolk draw distance
        checked++; if (!entry.rig.root.visible) culled.push(`npc:${entry.id}@${frames}`);
      }
      if (frames >= N) { rd.render = orig; done({ frames, checked, culled: culled.slice(0, 10) }); }
    };
  }), N);
}

test('far off-screen live fields are dormant and resume where they paused', async ({ page }) => {
  test.setTimeout(180_000);
  // Every pitch card opens the free live viewer once its path is finished (clear path, Oct 4 2026), so "watch" = the live match.
  await openIsland(page, { storage: finishedPathsStorage(['futsal', '7v7', '9v9', '11v11']) }); await clearOffers(page);
  type Snap = { id: string; dormant: boolean; time: number };
  const snap = (): Promise<Snap[]> => page.evaluate(() => (window as unknown as { __fi2: Fi2 }).__fi2.games.entries.map((e: any) => ({ id: e.venue.id as string, dormant: !!e.dormant, time: e.sim.stats.time as number })));
  await page.waitForTimeout(1500);
  const a = await snap(); await page.waitForTimeout(3000); const b = await snap();
  const dormant = a.filter((x, i) => x.dormant && b[i].dormant);
  expect(dormant.length, 'at least one field is far and off screen at the spawn').toBeGreaterThan(0);
  for (const x of dormant) expect(b.find(y => y.id === x.id)!.time, `${x.id} sim frozen while dormant`).toBe(x.time);
  const target = dormant[0].id;
  await page.evaluate(id => (document.querySelector(`[data-field="${id}"]`) as HTMLElement).click(), target);
  await page.waitForTimeout(3000);
  const c = await snap(); const d = c.find(y => y.id === target)!;
  expect(d.dormant, `${target} wakes when watched`).toBe(false);
  expect(d.time, `${target} resumes from where it paused (no jump)`).toBeGreaterThan(dormant[0].time);
  expect(d.time - dormant[0].time, 'resumed, not fast-forwarded').toBeLessThan(10);
});

test('nothing on screen is ever culled: flying across the fields and standing pitch-side', async ({ page }) => {
  test.setTimeout(240_000);
  await openIsland(page); await clearOffers(page);
  await page.evaluate(() => { const f = (window as unknown as { __fi2: Fi2 }).__fi2; f.location.x = 60; f.location.z = 60; });
  await page.waitForTimeout(2500); await page.keyboard.down('ArrowRight');
  const fly = await onScreenNeverCulled(page, 120); await page.keyboard.up('ArrowRight');
  expect(fly.checked, 'on-screen objects were checked while flying').toBeGreaterThan(50);
  expect(fly.culled, 'on-screen objects culled while flying').toEqual([]);
  await page.keyboard.press('r'); await page.waitForTimeout(2500);
  await page.evaluate(() => { const f = (window as unknown as { __fi2: Fi2 }).__fi2; f.location.x = 168; f.location.z = 100; f.rooftop.reset(168, 100, 0); });
  await page.waitForTimeout(4000); await clearOffers(page);
  const side = await onScreenNeverCulled(page, 120);
  expect(side.checked, 'on-screen objects were checked pitch-side').toBeGreaterThan(50);
  expect(side.culled, 'on-screen objects culled pitch-side').toEqual([]);
});
