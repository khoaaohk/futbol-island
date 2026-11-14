// Relay v1.7 (Cap.Kit, Oct 26 2026): the worn Kit Shop gear <-> the wire Kit (multiplayer/protocol/types.ts). Pure, no storage, no three.
// The sender turns its IslandGear (lib/shop/islandGear.ts, read by Town) into a Kit; friends dress that member's avatar from it with the
// same outfit slots as gearOutfit (shirt / trim / shorts / socks / sock tops / number / boots) and skin their ball from the design's
// panels, colours, pattern and finish. Never the kid's drawing, filled panels, decals, crest or printed name.
// Cap.KitClub (Nov 13 2026): a kit that carries Drip FC club kit (lib/shop/dripKit.ts: the shirt's club crest / wordmark, where the
// boots' club stickers sit, up to three ball club stickers, all chosen from the club's fixed art) is KIT_CLUB_LEN long; anything
// else stays KIT_LEN long, byte for byte as before. Still never the kid's own drawing, decals, crest or name.
import { KIT_CLUB_LEN, KIT_LEN, isKit, type Kit } from '../../multiplayer/protocol';
import { FINISHES, LAYOUTS, PATTERNS, validateBall, type BallDecal, type BallDesign } from '../shop/ball';
import { bootClubBits } from '../shop/boots';
import { jerseyClubCode, jerseyClubFrom, packBallClub, unpackBallClub, MAX_CLUB_BALL, isClubArt } from '../shop/dripKit';
import type { IslandGear } from '../shop/islandGear';
import type { Outfit } from '../graphics/beanLook';

const TARGETS = ['all', 'a', 'b', 'c'] as const;
const col = (h: string | undefined): number => { const n = typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h) ? parseInt(h.slice(1), 16) : NaN; return Number.isFinite(n) ? n : 0; };
export const kitHex = (n: number): string => '#' + (n & 0xffffff).toString(16).padStart(6, '0');
const idx = (list: readonly { id: string }[], id: string): number => { const i = list.findIndex((x) => x.id === id); return i >= 0 && i <= 63 ? i : 0; };

/** My worn gear as a Kit (null = nothing from the Kit Shop). Mirrors gearOutfit's slots, so friends see what I see. */
export function kitFromGear(g: IslandGear | null | undefined): Kit | null {
  if (!g || (!g.jersey && !g.boots && !g.ball)) return null;
  const k: number[] = new Array(KIT_LEN).fill(-1);
  const j = g.jersey;
  if (j) {
    k[0] = col(j.primary); k[1] = col(j.secondary); k[2] = col(j.accent); k[3] = col(j.primary); k[4] = col(j.accent);
    k[5] = typeof j.number === 'number' && Number.isInteger(j.number) && j.number >= 0 && j.number <= 99 ? j.number : -1;
  }
  if (g.boots) k[6] = col(g.boots.colors.mid); // lib/shop/islandGear.ts bootColour: the boot's side panels
  const b = g.ball;
  if (b) {
    k[7] = idx(LAYOUTS, b.layout); k[8] = col(b.colors.a); k[9] = col(b.colors.b); k[10] = col(b.colors.c);
    k[11] = idx(PATTERNS, b.pattern.kind); k[12] = col(b.pattern.c1); k[13] = col(b.pattern.c2);
    k[14] = Math.max(0, TARGETS.indexOf(b.pattern.on)); k[15] = Math.max(0, Math.min(9999, Math.round(b.pattern.seed) || 0)); k[16] = idx(FINISHES, b.finish);
  }
  // Drip FC club kit: five more slots, only when something club is worn (an ordinary kit keeps its old length and key).
  const club = [j ? jerseyClubCode(j.club) : 0, g.boots ? bootClubBits(g.boots) : 0, -1, -1, -1];
  if (b) { let n = 0; for (const d of b.decals) if (d.kind === 'club' && isClubArt(d.ref) && n < MAX_CLUB_BALL) club[2 + n++] = packBallClub(d.ref, d.dir, d.rot, d.size); }
  if (club[0] || club[1] || club[2] >= 0) { const long = [...k, ...club]; if (long.length === KIT_CLUB_LEN && isKit(long)) return long; }
  return isKit(k) ? k : null;
}
/** The short (KIT_LEN) form, for a relay that never offered Cap.KitClub. */
export const kitShort = (k: Kit | null): Kit | null => (k && k.length > KIT_LEN ? k.slice(0, KIT_LEN) : k);

/** One string per kit (change checks); '' for none. */
export const kitKey = (k: Kit | null | undefined): string => (k ? k.join(',') : '');
/** The ball part's key ('' = no shop ball): friends wearing the same ball share one baked skin. */
export const kitBallKey = (k: Kit | null | undefined): string => (k && k[7] >= 0 ? k.slice(7, KIT_LEN).join(',') + (k.length > KIT_LEN ? '|' + k.slice(19, 22).join(',') : '') : '');

/** A friend's outfit with their kit on top (the base itself when they wear nothing from the shop: no allocation). */
export function kitOutfit(base: Outfit, k: Kit | null | undefined): Outfit {
  if (!k || (k[0] < 0 && k[6] < 0)) return base;
  const out: Outfit = { ...base };
  if (k[0] >= 0) { out.kind = 'kit'; out.shirt = kitHex(k[0]); out.shirt2 = kitHex(k[1]); out.shorts = kitHex(k[2]); out.socks = kitHex(k[3]); out.socks2 = kitHex(k[4]); out.number = k[5] >= 0 ? k[5] : null; }
  if (k[6] >= 0) out.boots = kitHex(k[6]);
  if (k.length > KIT_LEN) { // Drip FC: the shirt's club crest spot and the boots' club marks (lib/graphics/beanSkin.ts draws them)
    const c = k[0] >= 0 ? jerseyClubFrom(k[17])?.crest : null; if (c) out.club = c === 'chest' ? 1 : 2;
    if (k[6] >= 0 && k[18] > 0) out.bootClub = k[18] & 3;
  }
  return out;
}

/** A friend's ball design (validated; no drawing, fills or decals), or null when they wear no shop ball. Unknown indexes -> defaults. */
export function kitBall(k: Kit | null | undefined): BallDesign | null {
  if (!k || k[7] < 0) return null;
  return validateBall({
    v: 1, layout: LAYOUTS[k[7]]?.id, colors: { a: kitHex(k[8]), b: kitHex(k[9]), c: kitHex(k[10]) },
    pattern: { kind: PATTERNS[k[11]]?.id ?? 'none', c1: kitHex(k[12]), c2: kitHex(k[13]), on: TARGETS[k[14]] ?? 'all', seed: k[15] },
    finish: FINISHES[k[16]]?.id, decals: k.length > KIT_LEN ? clubDecals(k) : [], art: { id: '', fills: [] },
  });
}
/** The Drip FC ball stickers of a long kit (only the club's fixed art ever travels). */
function clubDecals(k: Kit): BallDecal[] {
  const out: BallDecal[] = [];
  for (let i = 19; i <= 21; i++) { const c = unpackBallClub(k[i]); if (c) out.push({ id: 'c' + i, kind: 'club', ref: c.ref, color: '#ffffff', dir: c.dir, rot: c.rot, size: c.size }); }
  return out;
}
