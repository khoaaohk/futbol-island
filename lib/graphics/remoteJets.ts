import * as T from 'three';

// Flying friends' jet plumes (Oct 23 2026): the local jetpack's blue downwash (jetExhaust.ts) for up to REMOTE_JET_MAX friends at once.
// Heat: ONE instanced mesh (one draw call) and one fixed particle pool shared by every friend, a lower emission rate than the local
// pack, nothing drawn when no friend flies (count 0, invisible), no allocation per frame, nothing under reduced motion.
export const REMOTE_JET_MAX = 3;
export const REMOTE_JET_POOL = 120;
/** Particles per second per flying friend (the local pack: 140, 200 boosting). */
export const REMOTE_JET_RATE = 60;
const COLORS = ['#48baff', '#46e6b2', '#83dcd2'];

export interface RemoteJets {
  readonly root: T.InstancedMesh;
  /** Starts a frame: forget last frame's emitters. */
  begin(): void;
  /** A flying friend this frame (nearest first; extra calls beyond REMOTE_JET_MAX are ignored). `slot` keeps each friend's emission credit apart. */
  emit(slot: number, x: number, y: number, z: number, yaw: number, floor: number, boost: boolean): void;
  /** Ages, moves and draws the particles. */
  end(dt: number, reduced: boolean): void;
  /** Live particles (heat checks / tests). */
  readonly live: number;
  dispose(): void;
}

export function createRemoteJets(): RemoteJets {
  const geometry = new T.IcosahedronGeometry(1, 0), material = new T.MeshBasicMaterial({ color: '#ffffff' });
  const root = new T.InstancedMesh(geometry, material, REMOTE_JET_POOL);
  root.name = 'remote-jet-plumes'; root.frustumCulled = false; root.castShadow = false; root.receiveShadow = false; root.count = 0; root.visible = false;
  root.raycast = () => {}; root.instanceMatrix.setUsage(T.DynamicDrawUsage);
  const p = { x: new Float32Array(REMOTE_JET_POOL), y: new Float32Array(REMOTE_JET_POOL), z: new Float32Array(REMOTE_JET_POOL), vx: new Float32Array(REMOTE_JET_POOL),
    vz: new Float32Array(REMOTE_JET_POOL), age: new Float32Array(REMOTE_JET_POOL).fill(1), life: new Float32Array(REMOTE_JET_POOL), size: new Float32Array(REMOTE_JET_POOL),
    drop: new Float32Array(REMOTE_JET_POOL), floor: new Float32Array(REMOTE_JET_POOL) };
  const colors = COLORS.map((c) => new T.Color(c)), dummy = new T.Object3D();
  const em = Array.from({ length: REMOTE_JET_MAX }, () => ({ on: false, x: 0, y: 0, z: 0, yaw: 0, floor: 0, boost: false }));
  const credit = new Float32Array(32);
  const slotOf = new Int32Array(REMOTE_JET_MAX);
  let n = 0, cursor = 0, live = 0;
  return {
    root,
    get live() { return live; },
    begin() { n = 0; },
    emit(slot, x, y, z, yaw, floor, boost) {
      if (n >= REMOTE_JET_MAX) return;
      const e = em[n]; e.on = true; e.x = x; e.y = y; e.z = z; e.yaw = yaw; e.floor = floor; e.boost = boost; slotOf[n] = slot & 31; n++;
    },
    end(dt, reduced) {
      if (reduced) { if (live) { p.age.fill(1); live = 0; root.count = 0; root.visible = false; } return; }
      if (dt > 0) for (let k = 0; k < n; k++) {
        const e = em[k], s = slotOf[k];
        credit[s] += dt * REMOTE_JET_RATE * (e.boost ? 1.4 : 1);
        const count = Math.min(12, Math.floor(credit[s])); credit[s] -= count;
        const back = .38;
        for (let i = 0; i < count; i++) {
          const j = cursor++ % REMOTE_JET_POOL, side = cursor % 2 ? 1 : -1, angle = cursor * 2.399, spread = e.boost ? 1.8 : 1.1;
          p.x[j] = e.x + Math.cos(e.yaw) * side * .3 - Math.sin(e.yaw) * back; p.z[j] = e.z - Math.sin(e.yaw) * side * .3 - Math.cos(e.yaw) * back; p.y[j] = e.y + .82;
          p.vx[j] = Math.cos(angle) * spread; p.vz[j] = Math.sin(angle) * spread; p.age[j] = 0; p.life[j] = e.boost ? .53 : .43; p.size[j] = e.boost ? .26 : .2;
          p.drop[j] = e.boost ? 14 : 10; p.floor[j] = e.floor + .06;
        }
      }
      for (let s = 0; s < 32; s++) { let used = false; for (let k = 0; k < n; k++) if (slotOf[k] === s) used = true; if (!used) credit[s] = 0; }
      if (n === 0 && live === 0) return;
      let visible = 0;
      for (let j = 0; j < REMOTE_JET_POOL; j++) {
        if (p.age[j] >= p.life[j]) continue;
        p.age[j] += dt; if (p.age[j] >= p.life[j]) continue;
        const t = p.age[j] / p.life[j];
        p.x[j] += p.vx[j] * dt; p.z[j] += p.vz[j] * dt; p.y[j] = Math.max(p.floor[j], p.y[j] - p.drop[j] * dt);
        const size = p.size[j] * (.45 + t * 2.5) * (1 - t);
        dummy.position.set(p.x[j], p.y[j], p.z[j]); dummy.scale.set(size, size * (t < .3 ? 1.8 : .8), size); dummy.updateMatrix();
        root.setMatrixAt(visible, dummy.matrix); root.setColorAt(visible++, colors[t < .3 ? 0 : t < .65 ? 1 : 2]);
      }
      live = visible; root.count = visible; root.visible = visible > 0;
      if (visible) {
        root.instanceMatrix.clearUpdateRanges(); root.instanceMatrix.addUpdateRange(0, visible * 16); root.instanceMatrix.needsUpdate = true;
        if (root.instanceColor) { root.instanceColor.setUsage(T.DynamicDrawUsage); root.instanceColor.clearUpdateRanges(); root.instanceColor.addUpdateRange(0, visible * 3); root.instanceColor.needsUpdate = true; }
      }
    },
    dispose() { root.removeFromParent(); root.dispose(); geometry.dispose(); material.dispose(); },
  };
}
