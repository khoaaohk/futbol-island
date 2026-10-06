import type {Decal} from '../decals';
/**
 * 2023 Oceaunz Final Pro (Women's World Cup semi-finals, third-place match and final), rebuilt Oct 6 2026.
 *
 * Construction and print layout: the Oceaunz's (wwc-2023-oceaunz.ts; same 20-panel SPEEDSHELL with the small triangles). Three
 * views of a real Final Oceaunz Pro (eBay listing photos, reference only) were registered onto the Oceaunz print map: the swirl
 * (dark-map correlation 0.79-0.85), the FIFA emblem, adidas bars, OFFICIAL MATCH BALL and the zigzag, dots, checker,
 * cross-hatch and SPEEDSHELL triangles all land on their Oceaunz positions, so the shapes are the Oceaunz's.
 * Inks (measured on those views; adidas: "earthy tones and shimmering shades of yellow and gold"): pearl-gold skin, navy swirl
 * with glitter, a deep-orange -> light-orange -> peach ramp in place of the sky-blue one, the Oceaunz lime keyline becomes
 * yellow where it edges the orange and pale sky blue where it stands alone, triangle patterns navy (checker, zigzag, dots,
 * tapa) or pale sky blue (rosette, SPEEDSHELL, cross-hatch, fishnet; the fishnet is not seen in any photo and follows the
 * Oceaunz light/deep split). 'OCEAUNZ PRO' becomes 'FINAL OCEAUNZ PRO' (traced from the listing photo). Faces drawn by
 * scripts/wwc-balls/oceaunz/oz2.py (one swirl mosaic for both balls, painted in each ball's inks).
 */
export {default} from './wwc-2023-oceaunz';
const CREDIT = 'Redrawn from the Oceaunz print (built from Wikimedia Commons photos by Steffen Prößdorf and Hmickey, CC BY-SA 4.0), recoloured and relettered after photographs of the Final Oceaunz Pro used as reference only; this image CC BY-SA 4.0. adidas, OCEAUNZ and the FIFA Women\'s World Cup emblem are trademarks of their owners';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2023-oceaunz-final-pro-${n}.webp`, dir, up, w: .74, h: .74, gloss: .62, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
