import type {BookData} from './types';
import type {PlayerBookId} from './catalog';
import type {SpreadDef} from './popupEngine';
import {REGISTRY_BOOKS,REGISTRY_SPREADS} from './registry.generated';

/** Every readable pop-up book (text only; artwork modules load on demand). Generated from the files on disk by
 * scripts/gen-book-registry.cjs: a book appears once its story, spreads and narration all exist. */
export const BOOKS=REGISTRY_BOOKS as Record<PlayerBookId,BookData>;
/** True when a catalog book's story, spreads and narration are all on disk (so it can be sold and read). */
export const hasBook=(id:string)=>Object.prototype.hasOwnProperty.call(REGISTRY_BOOKS,id);
/** Each book's paper spreads live in their own chunk, fetched when that book opens. */
export function loadSpreads(id:PlayerBookId):Promise<Record<string,SpreadDef>>{const load=REGISTRY_SPREADS[id];return load?load().then(m=>m.SPREADS):Promise.resolve({});}
