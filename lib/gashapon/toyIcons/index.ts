/**
 * Toy icons registry (Nov 10 2026, owner: "update all these icons to the art style we talked about and match each to their toys").
 * One flat, pixel-edged, outlined icon per gashapon toy, drawn as inline SVG (no canvas, no images, no WebGL per tile). Shown by
 * components/ToyIcon.tsx on the Toy Shelf, the backpack's Toys, the gashapon panel and the machine face result card.
 *
 * HOW TO ADD A MACHINE'S ICONS (one file per machine, so agents never collide):
 *  1. Create lib/gashapon/toyIcons/<machine-id>.ts exporting `ICONS:ToyIconSet` keyed by the toy ids in lib/gashapon/toys.ts,
 *     then import it below and add it to SETS. tests/gashapon-icons.cjs checks every listed machine has all six.
 *  2. Read lib/gashapon/toyModels/<machine-id>.ts first: draw what the toy IS (its object, its signature parts), not a mascot.
 *  3. The rules (same family as FuelIcon in components/FuelCount.tsx and FruitArt in components/PocketArt.tsx):
 *     - Grid: viewBox 0 0 16 16, shape-rendering crispEdges (ToyIcon adds both). Keep ~1 unit of margin; fill the box.
 *     - Outline: INK #244d40 via the helpers in ./types.ts: `shape(d,fill,w)` / `dot(cx,cy,r,fill,w)`. Width 1.4 on the big main
 *       silhouette, 1.2 default, 0.8-1 on small parts. Inner details are plain `line()` strokes or unoutlined `fill()` patches.
 *     - Fills: flat and vibrant, from the toy's colours in toys.ts. NEVER black or near-black (owner): the test fails any fill
 *       under a luminance floor except INK itself. Where a toy is "black" (nori, a referee shirt, a puck) use a bright stand-in
 *       (nori #2f7a55, a blue shirt, a purple puck). No gradients, no shadows, no opacity tricks.
 *     - One small highlight: `hl(d)`, a short #fff6e4 stroke on the upper-left of the main shape.
 *     - No faces (no eyes or mouths). Must read at 56 px: one big silhouette plus two or three telling details.
 *     - Pixel machines may use `pix(rows,palette)` (true pixel art; the outline is added automatically).
 *  4. Example (a red daruma doll):
 *       'daruma-dash':shape('M8 1.4C12 1.4 14.2 4.8 14.2 8.8C14.2 12.6 11.6 14.8 8 14.8C4.4 14.8 1.8 12.6 1.8 8.8C1.8 4.8 4 1.4 8 1.4Z','#e0362c',1.4)
 *         +`<ellipse cx="8" cy="6.6" rx="3.8" ry="3" fill="#fff1d6" stroke="#244d40" stroke-width="1.1"/>`
 *         +line('M6 11.6C7 12.4 9 12.4 10 11.6','#ffd447',1.1)+hl('M3.6 6.6C3.8 4.8 4.6 3.6 5.6 2.8',1.1),
 *  5. Check the contact sheet: run the sheet script described in tests/gashapon-icons.cjs and look at 56 px.
 * Strings are static, built at module load from constants only (safe for dangerouslySetInnerHTML in ToyIcon).
 */
import type {ToyIconMarkup,ToyIconSet} from './types';
import {ICONS as SQUARE_SNACKS} from './gs-square-snacks';
import {ICONS as SQUARE_LUCKY} from './gs-square-lucky';
import {ICONS as CAY_SWEETS} from './gs-cay-sweets';
import {ICONS as CAY_BENTO} from './gs-cay-bento';
import {ICONS as ARCADE_HEROES} from './gs-arcade-heroes';
import {ICONS as ARCADE_PIXEL} from './gs-arcade-pixel';
import {ICONS as WESTBEACH} from './gs-westbeach';
import {ICONS as NORTHBEACH} from './gs-northbeach';
import {ICONS as ELEVEN} from './gs-eleven';
import {ICONS as OLDTOWN} from './gs-oldtown';
import {ICONS as JETTY} from './gs-jetty';
import {ICONS as CAYPLAZA} from './gs-cayplaza';
import {ICONS as SHARKS} from './gs-sharks';
import {ICONS as SUMMIT} from './gs-summit';

export type {ToyIconMarkup,ToyIconSet} from './types';

/** Per machine, in lib/gashapon/machines.ts order. Add new machines here. */
export const TOY_ICON_SETS:Readonly<Record<string,ToyIconSet>>={
 'gs-square-snacks':SQUARE_SNACKS,'gs-square-lucky':SQUARE_LUCKY,'gs-cay-sweets':CAY_SWEETS,'gs-cay-bento':CAY_BENTO,
 'gs-arcade-heroes':ARCADE_HEROES,'gs-arcade-pixel':ARCADE_PIXEL,'gs-westbeach':WESTBEACH,
 'gs-northbeach':NORTHBEACH,'gs-eleven':ELEVEN,'gs-oldtown':OLDTOWN,'gs-jetty':JETTY,'gs-cayplaza':CAYPLAZA,'gs-sharks':SHARKS,'gs-summit':SUMMIT,
};
/** Toy id -> inner SVG markup. */
export const TOY_ICONS:Readonly<Record<string,ToyIconMarkup>>=Object.assign({},...Object.values(TOY_ICON_SETS));
/** The icon markup for a toy, or null when it has none yet (ToyIcon then draws a neutral capsule). */
export const toyIconMarkup=(id:string):ToyIconMarkup|null=>Object.prototype.hasOwnProperty.call(TOY_ICONS,id)?TOY_ICONS[id]:null;
