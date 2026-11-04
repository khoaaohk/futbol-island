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
    /** Join a live game: the same pin as an always-on "this is you" chevron in your bib colour above the slot you play
     *  (depthTest off so teammates never hide it; a gentle bob, still under reduced motion). `null` hands it back. */
    pinAt(x: number, y: number, z: number, time: number, reduced: boolean, color: string | null) {
      if (color === null) { if (pin.userData.joined) { pin.userData.joined = false; material.color.copy(shownColor); pin.visible = false; pin.rotation.y = 0; } return; }
      if (!pin.userData.joined || pin.userData.color !== color) { pin.userData.joined = true; pin.userData.color = color; material.color.set(color); }
      pin.visible = true; material.opacity = .95; pin.rotation.y = Math.PI / 4;
      pin.position.set(x, y + 2.55 + (reduced ? 0 : Math.sin(time * Math.PI * 2) * .06), z);
    },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
