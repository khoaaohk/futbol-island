/** Phone movement stick (Oct 23 2026, owner): a bigger ring, a see-through knob, and a FLOATING base — a press anywhere in the
 *  left control zone anchors the ring at the thumb. All steering math is relative to the live ring size, so a bigger ring keeps the
 *  same dead zone and full-tilt feel (lib/town/walkControl.ts works on the normalised vector). */

/** Phones only: coarse pointer and a phone-sized viewport (portrait width or landscape height). Tablets/desktop keep the fixed stick. */
export const PHONE_STICK_QUERY = '(pointer:coarse) and (max-width:600px),(pointer:coarse) and (max-height:500px)';
/** Knob diameter as a share of the ring diameter (CSS: .joystick>span is 45% of --stick-size). */
export const STICK_KNOB_RATIO = .62;
/** Max knob travel = ring radius − knob radius. At the old 132 px ring this is ~36 px, the previous fixed value. */
export const stickTravel = (diameter: number) => diameter * (1 - STICK_KNOB_RATIO) / 2;
/** Rim-glow threshold as a share of the travel (was 30 of 36 px). */
export const STICK_EDGE_RATIO = 30 / 36;

export type Rect = { left: number; top: number; right: number; bottom: number };
export type Insets = { top: number; right: number; bottom: number; left: number };

/** Pointer offset from the ring centre → knob offset in px (clamped to the travel) and the normalised stick vector (|v| ≤ 1). */
export function stickInput(dx: number, dy: number, travel: number) {
  const scale = Math.min(1, travel / Math.max(1, Math.hypot(dx, dy))), px = dx * scale, py = dy * scale;
  return { px, py, x: px / travel, y: py / travel };
}

/** The left control zone where a press anchors the stick: below the HUD row, above the bottom safe area, left of the screen
 *  middle (landscape) or of the right-side button column (portrait, where half the width is narrower than the ring). */
export function stickZone(vw: number, vh: number, insets: Insets, hudBottom: number, buttonsLeft: number): Rect {
  const portrait = vh >= vw, buttonEdge = buttonsLeft - 12;
  const right = portrait ? Math.max(vw * .5, buttonEdge) : Math.min(vw * .5, buttonEdge);
  return { left: insets.left + 8, top: Math.max(insets.top, hudBottom) + 12, right, bottom: vh - insets.bottom - 8 };
}

/** Clamp the ring centre so the whole ring (radius r) stays inside the zone; a zone smaller than the ring centres it. */
export function clampAnchor(x: number, y: number, zone: Rect, r: number) {
  const fit = (v: number, lo: number, hi: number) => lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v));
  return { x: fit(x, zone.left + r, zone.right - r), y: fit(y, zone.top + r, zone.bottom - r) };
}

/** The zone's DOM inputs: the HUD row (its stack plus any top-row button ending above HUD_ROW_MAX px) and the right-side column. */
export const STICK_HUD_SELECTOR = '.hud-stack,.town-top-actions,.town-app button', HUD_ROW_MAX = 160;
export const STICK_RIGHT_SELECTOR = '.travel-actions button,.town-minimap';

export const inRect = (x: number, y: number, r: Rect) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
