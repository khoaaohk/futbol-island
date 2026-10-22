/** Phone/tablet defaults (user decision, Sep 26 2026, heat pass 4): pixel ratio 1.5 at all times and a 1024² sun shadow map. Phones and
 * tablets = coarse pointer or DPR > 2 (same detection as MotionResolution). Desktop is unchanged.
 * MSAA stays ON: the approved "antialias off at DPR ≥ 2" was checked at 390×844 DPR 3 and iPad and left thin pitch lines broken into
 * dashes (the centre circle read as dotted) and stair-stepped sign/roof edges, so it was kept on as the user asked in that case.
 * PHONE_ANTIALIAS_OFF_AT_DPR2 is the ready lever (read at renderer creation). */
// Quality pass (user decision Sep 26 2026): phones start at 1.75 while cool; the thermal governor (heatTier.ts) drops to 1.5, then 1.25.
// Budget pass (Sep 27 2026): with the shadow box now fitted to what is visible, a cool phone draws its shadows at 1536² (tier 0); the
// governor's tiers 1+ cap it at 1024² again (heatTier TIERS shadowSize).
export const PHONE_PIXEL_RATIO = 1.75, PHONE_SHADOW_SIZE = 1536, PHONE_ANTIALIAS_OFF_AT_DPR2 = false;
export function phoneGraphicsFor(devicePixelRatio: number, coarsePointer: boolean) {
  const phone = dynamicResolutionEnabled(devicePixelRatio, coarsePointer), dpr = devicePixelRatio || 1;
  return phone
    ? { phone, pixelRatio: Math.min(dpr, PHONE_PIXEL_RATIO), shadowSize: PHONE_SHADOW_SIZE, antialias: !(PHONE_ANTIALIAS_OFF_AT_DPR2 && dpr >= 2) }
    : { phone, pixelRatio: Math.min(dpr, 2), shadowSize: 2048, antialias: true };
}
export function graphicsQuality() {
  const dpr = window.devicePixelRatio || 1, coarse = window.matchMedia('(pointer: coarse)').matches;
  // Development-only A/B hook for before/after captures: the pre-Sep-26 phone defaults (DPR 2 when still, 2048², MSAA).
  if (process.env.NODE_ENV !== 'production' && (window as Window & { __fiLegacyQuality?: boolean }).__fiLegacyQuality)
    return { phone: dynamicResolutionEnabled(dpr, coarse), pixelRatio: Math.min(dpr, 2), shadowSize: 2048, antialias: true };
  return phoneGraphicsFor(dpr, coarse);
}
/** Phones and tablets draw the island at a lower pixel ratio while the view moves and return to full sharpness once it
 * has been still for `settleMs` (heat audit pass 2, user-approved proposal A). Moving drops immediately; going sharp
 * needs continuous stillness, so jittery input cannot thrash the drawing buffer. `sharpNow` (menus, quizzes: a frozen
 * or read-carefully frame) returns to full sharpness at once. Desktop (fine pointer, DPR ≤ 2) is never enabled. */
export const MOVING_PIXEL_RATIO = 1.5, SHARP_SETTLE_MS = 500;
/** Heat offsets Oct 19 2026: once a rest (Town's 20 fps idle cap: no input, nothing travelling) has held this long, a phone draws at the
 *  REST_PIXEL_RATIO (1.75 -> 1.5, 27 % fewer pixels) until the next input or movement. Works on phones whose moving step is off. Tier 1+ already caps at 1.5, so this only bites a
 *  cool phone at tier 0; desktop (never enabled) is untouched. */
export const REST_SOFT_MS = 8000, REST_PIXEL_RATIO = 1.5;
export function dynamicResolutionEnabled(devicePixelRatio: number, coarsePointer: boolean) { return coarsePointer || devicePixelRatio > 2; }
export class MotionResolution {
  readonly sharp: number; readonly moving: number; readonly enabled: boolean;
  /** Phones/tablets (the `enabled` device flag) whose sharp ratio is above REST_PIXEL_RATIO: the rest step applies (even with the moving step off). */
  readonly restEnabled: boolean;
  private current: number; private stillSince = -1; private restSince = -1; switches = 0;
  constructor(sharp: number, enabled: boolean, moving = MOVING_PIXEL_RATIO, private settleMs = SHARP_SETTLE_MS) {
    this.sharp = sharp; this.moving = Math.min(moving, sharp); this.enabled = enabled && this.moving < sharp; this.restEnabled = enabled && REST_PIXEL_RATIO < sharp; this.current = sharp;
  }
  get ratio() { return this.current; }
  /** Heat pass 4: a hot-phone tier (lib/graphics/heatTier) caps the ratio, on every device; Infinity = no cap (default). */
  private limit = Infinity;
  setLimit(max: number) { this.limit = max > 0 ? max : Infinity; }
  /** Call once per rendered frame before drawing. Returns the pixel ratio to switch to, or 0 when unchanged. `cap` (Explore life, Oct 2026):
   *  a scene's own ceiling (the reef room on a phone: lib/town/water/diveCurrent.ts divePixelCap). */
  update(now: number, moving: boolean, sharpNow = false, resting = false, cap = Infinity): number {
    if (!this.enabled && !this.restEnabled && this.limit === Infinity && cap === Infinity && this.current === this.sharp) return 0;
    let next = this.sharp;
    if (this.enabled) {
      next = this.current;
      if (sharpNow) { next = this.sharp; this.stillSince = -1; }
      else if (moving) { next = this.moving; this.stillSince = -1; }
      else { if (this.stillSince < 0) this.stillSince = now; if (now - this.stillSince >= this.settleMs) next = this.sharp; }
    }
    if (this.restEnabled) {
      if (resting && !sharpNow && !moving) { if (this.restSince < 0) this.restSince = now; if (now - this.restSince >= REST_SOFT_MS) next = Math.min(next, REST_PIXEL_RATIO); }
      else this.restSince = -1;
    }
    next = Math.min(next, this.limit, cap);
    if (next === this.current) return 0;
    this.current = next; this.switches++; return next;
  }
}
export class FrameBudget {
  private samples = 0;
  private total = 0;
  private cooldown = 240;
  sample(milliseconds: number, pixelRatio: number): number {
    if (this.cooldown-- > 0 || milliseconds > 150) return pixelRatio;
    this.total += milliseconds; this.samples++;
    if (this.samples < 120) return pixelRatio;
    const average = this.total / this.samples;
    this.samples = 0; this.total = 0; this.cooldown = 600;
    return average > 25 ? Math.max(1, pixelRatio - .25) : pixelRatio;
  }
}
