/**
 * Start-page taps (Oct 9 2026): which buttons and links on the title screen (at `/` since Oct 9 2026; /start was removed) are used, as totals per fixed id
 * (startIds.ts). Everything is a tracker count() (a map increment that rides the next beat): no request, no timer, no state, no
 * re-render. When the tracker is off (dev, DNT/GPC, bots, preview, labs, admin, localhost) every call is a no-op.
 *
 *  - watchStart(): mounted by components/VisitTracker.tsx while `/` shows the title screen (not the game: lib/rootView.ts). Counts
 *    the view (st:view), a completed donation (Stripe's success URL is /?coffee=thanks, app/coffee/checkout/route.ts → sg:paid)
 *    and adds ONE passive
 *    capture-phase click listener on window (before ExternalLinkGate's document-level capture, which stops gated links). A click
 *    counts only the `data-track` id of the nearest marked element, and only if that id is on the allowlist; a Play button
 *    (data-landing-play) counts as st:play_<card> from the card it sits in (data-title-card: ready / returning / break).
 *    Nothing is read from the page but those attributes: never text, values, hrefs or positions.
 *  - Outcomes that are not clicks (a code made, a restore that worked or failed, the which-word check, the card shown) are one
 *    call at the moment they happen (saveCodeAdapter.tsx, TitleActions.tsx, SaveCodeCreate.tsx CodeShown, Donate.tsx), and only
 *    count while the title screen is showing, i.e. while watchStart is mounted (CodeShown is also used inside the game).
 */
import {count} from './tracker';
import {isStartId} from './startIds';

/** How many watchStart()s are mounted: > 0 exactly while the title screen is showing (and the tracker is on). */
let watching=0;
const onStartPage=()=>watching>0;
/** Count one start-page id (allowlisted, while the title screen is showing only). */
export function trackStart(id:string){if(isStartId(id)&&onStartPage())count(id);}

type Node={closest?:(sel:string)=>Node|null;getAttribute?:(name:string)=>string|null}|null;
/** The id a click on `target` stands for, or null. Exported for tests. */
export function clickId(target:unknown):string|null{
 const el=target as Node;if(!el||typeof el.closest!=='function')return null;
 const play=el.closest('[data-landing-play]');
 if(play){const id='st:play_'+(play.closest?.('[data-title-card]')?.getAttribute?.('data-title-card')??'');return isStartId(id)?id:null;}
 const id=el.closest('[data-track]')?.getAttribute?.('data-track');
 return isStartId(id)?id:null;
}

export function watchStart(w:Pick<Window,'addEventListener'|'removeEventListener'|'location'>):()=>void{
 count('st:view');watching++;
 try{if(new URLSearchParams(w.location.search).get('coffee')==='thanks')count('sg:paid');}catch{}
 const onClick=(e:Event)=>{const id=clickId(e.target);if(id)count(id);};
 w.addEventListener('click',onClick,{capture:true,passive:true});
 return()=>{watching=Math.max(0,watching-1);w.removeEventListener('click',onClick,{capture:true});};
}

/** Save-code sheet phases (SaveCodeCreate / SaveCodeRestore onPhase, which may repeat a phase on re-render): only a real
 *  change counts. A code is "created" on making → code; a restore "worked" on loading → welcome/swap and "failed" on
 *  loading → enter (wrong code or offline) / grownup / break (too many tries). */
let createPhase='',restorePhase='';
export function startCreatePhase(p:string){const prev=createPhase;if(p===prev)return;createPhase=p;if(prev==='making'&&p==='code')trackStart('st:created');}
export function startRestorePhase(p:string){
 const prev=restorePhase;if(p===prev)return;restorePhase=p;if(prev!=='loading')return;
 if(p==='welcome'||p==='swap')trackStart('st:restored');else if(p==='enter'||p==='grownup'||p==='break')trackStart('st:restore_fail');
}
/** "Which word comes first?": the first pick only, and whether it was right (a boolean, never the word). */
export function startWordPick(right:boolean){trackStart('st:word');if(right)trackStart('st:word_ok');}
/** The title card that is showing: the returning fast path and the saving-break card are counted when they appear. */
export function startTitleState(s:string){if(s==='returning')trackStart('st:returning');else if(s==='break')trackStart('st:break');}
