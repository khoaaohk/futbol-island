import {recordBugCatch,BUG_NEW_SPECIES_EVENT,BUG_BOOK_COMPLETE_EVENT,BUG_BOOK_KEY,type BugCatchRecord} from './jobs/bugBook';
import {bugSpeciesById} from './jobs/bugSpecies';

/**
 * The park pond's dragonflies, netted (Nov 13 2026, owner: "make the pond dragonflies catchable"). The two dragonflies over the
 * Stadium Park pond (parkPond.ts) are the Bug book's existing Midfield Dragonfly (bugSpecies.ts id `dragonfly`), not a new
 * species: the book stays 20 bugs + 8 fireflies, "the whole 20-bug squad" copy and the Full squad sticker are unchanged, and a
 * pond catch is recorded exactly like a shift catch (recordBugCatch: count, first-ever coin, squad page, completion).
 *
 * How it plays (no Bug squad shift needed): on foot (walking), within POND_NET.range m of a
 * dragonfly, a "Net it" prompt floats over it. A dragonfly darts off from anyone rushing about, but a still or slow player
 * (under POND_NET.calmSpeed m/s) is left alone, and every so often a dragonfly comes to hover near them (POND_NET.curious):
 * patience and a calm scan, like a midfielder waiting for the pass. A netted dragonfly is looked at and let go: it vanishes from
 * the pond for POND_NET.away s, then is back. Lite mode (heat tier 2+) draws no pond dragonflies, so there is nothing to net.
 * Heat: one distance check over two dragonflies per frame while the pond's life is awake (its own near gate), nothing else.
 */
export const POND_NET={range:3,calmSpeed:2.5,curious:.45,curiousRadius:1.8,away:40,key:'pond-net'} as const;
export const POND_DRAGONFLY_ID='dragonfly';
/** Fired (window) after a pond catch, for the HUD toast (IslandJobs). */
export const POND_BUG_CAUGHT='fi2-pond-bug-caught';
export type PondBugCaught={id:string;name:string;first:boolean;count:number};
/** The Bug book page's "where" for the dragonfly while it is not caught yet. */
export const POND_DRAGONFLY_WHERE='Or stand still by the Stadium Park pond: a dragonfly will come close enough to net.';
type Port={get:()=>string|null;set:(v:string)=>void};
const local:Port={get:()=>{try{return localStorage.getItem(BUG_BOOK_KEY);}catch{return null;}},set:v=>{try{localStorage.setItem(BUG_BOOK_KEY,v);}catch{/* private mode */}}};
/** May the player net right now? On foot (walking), on the ground, free to act (no lesson, panel or job). */
/** QA Nov 14 2026: the pond diver's pin (Town.tsx) shows once the head is under (the pond is painted on the ground, so the body
 *  itself cannot be seen there). */
export const pondDiverPinOn=(inPond:boolean,under:number)=>inPond&&under>.35;
/** `under`: the player is duck-diving (QA Nov 14 2026: Net it floated over the water while the kid was under it). */
/** On foot only: not riding, not in a job, not under water and not swimming (QA Nov 14 2026: a kid swimming in the middle of the
 *  pond was offered "Net the dragonfly"; wading at the edge still counts as on foot). */
export const pondNetAllowed=(o:{ride:string;onGround:boolean;canEnter:boolean;job:boolean;under?:boolean;swimming?:boolean})=>o.ride==='walk'&&o.onGround&&o.canEnter&&!o.job&&!o.under&&!o.swimming;
/** The Bug book catch of a pond dragonfly, plus the same events a shift catch fires (the first-ever coin, the completion bonus). */
export function netPondDragonfly(port:Port=local,fire:(target:'window'|'document',name:string,detail:unknown)=>void=dispatch):BugCatchRecord{
 return netIslandBug(POND_DRAGONFLY_ID,'Dragonfly',port,fire);
}
/** Nov 24 2026: the Half-Time Café garden's monarchs (seasideCafe.ts CAFE_BUTTERFLY_ID) are netted the same way: the Bug book's
 *  Captain Monarch, recorded exactly like a shift catch, and the same toast event (detail.id tells the toast which bug). */
export function netCafeButterfly(port:Port=local,fire:(target:'window'|'document',name:string,detail:unknown)=>void=dispatch):BugCatchRecord{
 return netIslandBug('monarch','Monarch',port,fire);
}
function netIslandBug(id:string,fallback:string,port:Port,fire:(target:'window'|'document',name:string,detail:unknown)=>void):BugCatchRecord{
 const rec=recordBugCatch('bug',id,port);
 if(rec.first)fire('document',BUG_NEW_SPECIES_EVENT,id);
 if(rec.completed)fire('document',BUG_BOOK_COMPLETE_EVENT,'complete');
 const detail:PondBugCaught={id,name:bugSpeciesById(id)?.name??fallback,first:rec.first,count:rec.count};
 fire('window',POND_BUG_CAUGHT,detail);
 return rec;
}
function dispatch(target:'window'|'document',name:string,detail:unknown){
 try{if(typeof CustomEvent==='undefined')return;const e=new CustomEvent(name,{detail});if(target==='window'&&typeof window!=='undefined')window.dispatchEvent(e);else if(typeof document!=='undefined')document.dispatchEvent(e);}catch{/* no DOM */}
}
/** The toast after a pond catch (kid copy). */
export function pondCatchToast(c:PondBugCaught){
 return {title:c.first?`New in your Bug book: ${c.name}!`:`${c.name} netted!`,
  detail:c.first?(c.id==='monarch'?'Bright orange that warns the birds, and a zigzag flight like a winger beating a defender. You looked, learned and let it go.':'Huge eyes that see almost all the way round: the best scanner on the pitch. You looked, learned and let it go.'):`Caught ${c.count} times now. You looked, learned and let it go.`};
}
