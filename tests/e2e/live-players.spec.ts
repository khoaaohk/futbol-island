import { test, expect } from '@playwright/test';
import { openIsland } from './helpers';

/* Deploy-4 hotfix guard ("the players on the live games are flashing"): in the live 11v11 watch view, every live player that is
 * on screen is drawn on every one of 300 consecutive rendered frames, at every heat tier: its rig stays posed and batched, the
 * bean batches keep their instance counts with no zero-scale matrices, and its body pixels are really on the canvas. */
test('live players never blink over 300 consecutive frames at heat tiers 0–4', async ({ page }) => {
  test.setTimeout(240_000);
  await openIsland(page);
  for (let i = 0; i < 3; i++) {
    const offer = page.getByRole('button', { name: 'Open this card' });
    if (!(await offer.count())) break;
    await offer.first().click(); await page.waitForTimeout(3500);
    const done = page.getByRole('button', { name: 'Done', exact: true }); if (await done.count()) await done.last().click();
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => (document.querySelector('[data-field="11v11"]') as HTMLElement).click());
  await page.waitForFunction(() => (window as unknown as { __fi2: { games: { stats: { visiblePlayers: number } } } }).__fi2.games.stats.visiblePlayers >= 20, null, { timeout: 30_000 });
  for (const tier of [0, 1, 2, 3, 4]) {
    const result = await page.evaluate(({ tier, N }) => new Promise<{ frames: number; toggles: number; countChanges: number; zero: number; pixelMisses: number; checks: number }>(done => {
      type Rig = { root: { visible: boolean; userData: Record<string, unknown>; scale: { y: number }; getWorldPosition(v: unknown): unknown } };
      const f = (window as unknown as { __fi2: Record<string, any> }).__fi2;
      f.heat.force(tier);
      const rd = f.renderer, gl = rd.getContext(), orig = rd.render.bind(rd), V = f.camera.position.constructor;
      const entry = f.games.entries.find((e: { venue: { id: string } }) => e.venue.id === '11v11');
      const batches: { count: number; visible: boolean; instanceMatrix: { array: Float32Array } }[] = [];
      f.scene.traverse((o: any) => { if (o.isInstancedMesh && o.material?.setBeanData) batches.push(o); });
      let frames = 0, toggles = 0, countChanges = 0, zero = 0, pixelMisses = 0, checks = 0, warm = 0;
      let prevDrawn: string | null = null, prevCounts: string | null = null;
      rd.render = function (scene: unknown, camera: unknown) {
        orig(scene, camera); if (scene !== f.scene) return;
        if (warm++ < 5) return; // let the tier's resolution switch settle
        frames++;
        const rigs = [...(entry.rigs as Map<string, Rig>).entries()].filter(([, r]) => r.root.visible);
        const drawn = rigs.map(([id, r]) => id + (r.root.userData.poseSkipped ? '0' : '1')).join(',');
        if (prevDrawn !== null && drawn !== prevDrawn) toggles++; prevDrawn = drawn;
        const counts = batches.map(b => (b.visible ? b.count : -1)).join(',');
        if (prevCounts !== null && counts !== prevCounts) countChanges++; prevCounts = counts;
        for (const b of batches) for (let i = 0; i < (b.visible ? b.count : 0); i++) { const a = b.instanceMatrix.array, s = Math.hypot(a[i * 16], a[i * 16 + 1], a[i * 16 + 2]); if (!(s > 1e-6)) zero++; }
        if (frames % 10 === 0) { // pixel truth every 10th frame (readPixels is slow)
          const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
          for (const [, r] of rigs) {
            const p = new V(); r.root.getWorldPosition(p); p.y += .9 * r.root.scale.y; const q = p.clone().project(f.camera);
            if (Math.abs(q.x) > .85 || Math.abs(q.y) > .85) continue;
            const cx = Math.round((q.x + 1) / 2 * W), cy = Math.round((q.y + 1) / 2 * H), R = Math.max(3, Math.round(H * .004)), n = R * 2 + 1;
            const box = new Uint8Array(n * n * 4), ring = new Uint8Array(4); gl.readPixels(cx - R, cy - R, n, n, gl.RGBA, gl.UNSIGNED_BYTE, box); gl.readPixels(cx + R * 6, cy, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ring);
            let max = 0; for (let i = 0; i < box.length; i += 4) max = Math.max(max, Math.abs(box[i] - ring[0]) + Math.abs(box[i + 1] - ring[1]) + Math.abs(box[i + 2] - ring[2]));
            checks++; if (max <= 60) pixelMisses++;
          }
        }
        if (frames >= N) { rd.render = orig; f.heat.force(null); done({ frames, toggles, countChanges, zero, pixelMisses, checks }); }
      };
    }), { tier, N: 300 });
    expect(result.frames, `tier ${tier}`).toBe(300);
    expect(result.toggles, `tier ${tier}: a live player's drawn state toggled`).toBe(0);
    expect(result.countChanges, `tier ${tier}: bean batch instance counts changed`).toBe(0);
    expect(result.zero, `tier ${tier}: zero-scale instance matrices`).toBe(0);
    expect(result.checks, `tier ${tier}: pixel checks ran`).toBeGreaterThan(100);
    expect(result.pixelMisses, `tier ${tier}: players missing from the canvas`).toBe(0);
  }
});
