import * as T from 'three';
// "You are here" while a building hides the walking player (A7, Oct 4 2026). One small pin above the head and the
// existing foot ring draw through scenery only while hidden: no new draw call otherwise, no loop, no per-frame
// allocation. The host decides `hidden` (lib/town/walkControl.ts createOcclusionProbe).
export function createHiddenPlayerMarker(ring: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>) {
  const geometry = new T.ConeGeometry(.34, .7, 4);
  geometry.rotateX(Math.PI); // point down at the player
  const material = new T.MeshBasicMaterial({color: '#ffa51f', transparent: true, opacity: .95, depthTest: false, depthWrite: false});
  const pin = new T.Mesh(geometry, material);
  pin.name = 'hidden-player-pin'; pin.renderOrder = 11; pin.visible = false; pin.frustumCulled = false;
  const ringColor = ring.material.color.clone(), shownColor = new T.Color('#ffa51f');
  let hidden = false, fade = 0;
  return {
    root: pin,
    get hidden() { return hidden; },
    update(isHidden: boolean, x: number, y: number, z: number, dt: number, time: number, reduced: boolean) {
      if (isHidden !== hidden) {
        hidden = isHidden;
        ring.material.depthTest = !hidden; ring.renderOrder = hidden ? 10 : 0;
        ring.material.opacity = hidden ? 1 : .8; ring.material.color.copy(hidden ? shownColor : ringColor);
      }
      fade = reduced ? (hidden ? 1 : 0) : Math.max(0, Math.min(1, fade + (hidden ? dt / .2 : -dt / .15)));
      pin.visible = fade > 0;
      if (!pin.visible) return;
      material.opacity = .95 * fade;
      pin.position.set(x, y + 2.6 + (reduced ? 0 : Math.sin(time * 4) * .08), z);
      pin.rotation.y = reduced ? 0 : time * 1.5;
    },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
