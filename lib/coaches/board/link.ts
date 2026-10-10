import {BOARD_OPEN_PLAY,BOARD_PLAYS_GLOBAL,isBoardPlayId,type BoardPlayRef} from '@/lib/coaches/idp/board';
import {EXAMPLE_PLAYS} from './examples';
import {loadLibrary} from './storage';

/**
 * The board's side of the IDP link (docs/idp/BOARD-LINK.md, lib/coaches/idp/board.ts). Loaded with the Coaches Centre:
 *  - window.__fiBoardPlays lists the example plays (with the skill each teaches) and the coach's saved plays, read from
 *    storage only when the IDP asks (no loop, no timer);
 *  - a goal's "See the play on the board" (BOARD_OPEN_PLAY {id}) is remembered here until the board mounts and takes it.
 */
export const EXAMPLE_SKILLS:Record<string,string>={exgiveandgo:'pass',exoverlap:'space',express:'recover',excorner:'runs'};
export function boardPlayRefs():BoardPlayRef[]{
 const ex=EXAMPLE_PLAYS.map(p=>({id:p.id,title:p.name,format:p.format,skill:EXAMPLE_SKILLS[p.id]}));
 const own=loadLibrary().plays.filter(p=>isBoardPlayId(p.id)).map(p=>({id:p.id,title:p.name,format:p.format}));
 return [...ex,...own];
}
let pending:string|null=null;
/** The play id a goal asked to show, once (the board takes it when it mounts). */
export function takePendingPlay():string|null{const id=pending;pending=null;return id;}
export const PENDING_PLAY_EVENT='fi2-board-pending-play';
/** Registers the IDP hooks. `onOpen` brings the Coaches Board up; returns a cleanup. */
export function registerBoardLink(onOpen:(id:string)=>void):()=>void{
 if(typeof window==='undefined')return ()=>{};
 const w=window as unknown as Record<string,unknown>;w[BOARD_PLAYS_GLOBAL]=boardPlayRefs;
 const open=(e:Event)=>{const id=(e as CustomEvent<{id?:unknown}>).detail?.id;if(!isBoardPlayId(id))return;pending=id;onOpen(id);window.dispatchEvent(new CustomEvent(PENDING_PLAY_EVENT));};
 window.addEventListener(BOARD_OPEN_PLAY,open);
 return ()=>{window.removeEventListener(BOARD_OPEN_PLAY,open);if(w[BOARD_PLAYS_GLOBAL]===boardPlayRefs)delete w[BOARD_PLAYS_GLOBAL];};
}
