/**
 * Loaded once on idle by islandPreload.ts (never part of the title screen's first load). Its only job is webpack's prefetch runtime:
 * when THIS chunk arrives, webpack adds <link rel="prefetch"> for every file of the game's chunk group (the magic comment below), so
 * the browser fetches them at idle priority into the HTTP cache. The import is never called here. Browsers without rel=prefetch
 * (Safari) get the same files from islandPreload.ts with low-priority fetches, using those links' URLs.
 */
import ballAtlas from '@/lib/graphics/vendingBallAtlas.json';
import {mediaUrl} from '@/lib/media/mediaUrl';
export const prefetchedGame=()=>import(/* webpackPrefetch: true */ './Game');
/** The island's only first-frame picture (lib/graphics/vendingProductArt.ts, vendingMachines.ts). Kept here, not in the title
 *  screen's first load (mediaUrl would pull Next's `process` polyfill into it). */
export const FIRST_FRAME_IMAGES=[mediaUrl((ballAtlas as {src:string}).src)];
