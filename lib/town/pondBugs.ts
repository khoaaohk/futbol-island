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
export const pondNetAllowed=(o:{ride:string;onGround:boolean;canEnter:boolean;job:boolean})=>o.ride==='walk'&&o.onGround&&o.canEnter&&!o.job;
/** The Bug book catch of a pond dragonfly, plus the same events a shift catch fires (the first-ever coin, the completion bonus). */
export function netPondDragonfly(port:Port=local,fire:(target:'window'|'document',name:string,detail:unknown)=>void=dispatch):BugCatchRecord{
 const rec=recordBugCatch('bug',POND_DRAGONFLY_ID,port);
 if(rec.first)fire('document',BUG_NEW_SPECIES_EVENT,POND_DRAGONFLY_ID);
 if(rec.completed)fire('document',BUG_BOOK_COMPLETE_EVENT,'complete');
 const detail:PondBugCaught={id:POND_DRAGONFLY_ID,name:bugSpeciesById(POND_DRAGONFLY_ID)?.name??'Dragonfly',first:rec.first,count:rec.count};
 fire('window',POND_BUG_CAUGHT,detail);
 return rec;
}
function dispatch(target:'window'|'document',name:string,detail:unknown){
 try{if(typeof CustomEvent==='undefined')return;const e=new CustomEvent(name,{detail});if(target==='window'&&typeof window!=='undefined')window.dispatchEvent(e);else if(typeof document!=='undefined')document.dispatchEvent(e);}catch{/* no DOM */}
}
/** The toast after a pond catch (kid copy). */
export function pondCatchToast(c:PondBugCaught){
 return {title:c.first?`New in your Bug book: ${c.name}!`:`${c.name} netted!`,
  detail:c.first?'Huge eyes that see almost all the way round: the best scanner on the pitch. You looked, learned and let it go.':`Caught ${c.count} times now. You looked, learned and let it go.`};
}
