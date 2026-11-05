/**
 * Live match analytics (Nov 5 2026, docs/join-live-game-design.md "Analytics"): how often players walk up to, join and play the
 * 7v7, futsal, 9v9, 11v11 and beach matches, and for how long. Ids: lib/analytics/countIds.ts LIVE_MATCH_COUNT_IDS. Shown in
 * /admin by app/admin/LiveMatchesSection.tsx (lib/analytics/liveMatchReport.ts builds it on the server).
 *
 * Every call is a tracker count() (a map increment that rides the next beat, lib/analytics/tracker.ts): no request, no timer,
 * no re-render and nothing per frame. The three transitions:
 *  - pitch visit: Town shows a live pitch's Learn + Play bar (components/FieldPathCard.tsx data-live-bar). Counted once per
 *    visit: the bar flickering while the HUD focus changes, or stepping off and back within VISIT_AWAY_MS, is the same visit.
 *  - join: lib/town/liveJoinRuntime.ts took the slot after Start; the role (gk / def / mid / fwd) and the other humans then on it.
 *  - leave: Leave / Esc / a refused spot ('leave'), Town pulling the player off ('forced'), or the tab closing mid-match
 *    ('hide', on the tracker's pagehide hook, before its final beat). Foreground seconds only (a hidden tab's time is not play),
 *    capped at LM_CAP_S; time so far is also banked as whole minutes when the tab is hidden, so a phone that kills the
 *    background tab keeps the minutes (only the leave, its band and < 60 s are lost).
 * While a match is open the module holds one visibilitychange listener (added on join, removed on leave): no timer.
 *
 * Privacy (a kids' game): totals per fixed id only. Never a name, nick, slot, side, score, party code, time of day or an order of
 * events; friends are a number band (0 / 1 / 2–3 / 4+), never who.
 */
import {count,onPageHide} from './tracker';
import {LIVE_MATCH_FORMATS,LM_LEN_BANDS,LM_REACH,LM_ROLES,lmId,type LiveMatchFormat,type LmRole} from './countIds';

/** One match never books more than this (2 h): a tab left on the pitch overnight is not play. */
export const LM_CAP_S=7200;
/** Stepping off a pitch for less than this and coming back is the same visit. */
export const VISIT_AWAY_MS=60_000;
export type LmEnd='leave'|'forced'|'hide';
/** What lib/town/liveJoinRuntime.ts raises (api.onMatch). Pure data: format, a coarse role and a head count, nothing else. */
export type LiveMatchEvent={type:'join';format:string;role:string|null;others:number}|{type:'others';others:number}|{type:'leave';reason:LmEnd;others:number};

export const isLmFormat=(f:unknown):f is LiveMatchFormat=>(LIVE_MATCH_FORMATS as readonly unknown[]).includes(f);
/** The length band for a match of `s` seconds (already capped). */
export function lenBand(s:number):string{for(const [id,,top] of LM_LEN_BANDS)if(s<top)return id;return LM_LEN_BANDS[LM_LEN_BANDS.length-1][0];}
/** Other humans on the match → its band. */
export const withBand=(n:number)=>n<=0?'with_0':n===1?'with_1':n<=3?'with_2_3':'with_4p';
/** The sim's role (matchSim players[slot].role) or a keeper → one of the four coarse roles; anything else is 'mid'. */
export const roleOf=(r:string|null|undefined,keeper=false):LmRole=>keeper?'gk':(LM_ROLES as readonly string[]).includes(r??'')?r as LmRole:'mid';

type Env={count:(id:string,n?:number)=>void;now:()=>number;visible:()=>boolean;
 /** Add / remove the visibility listener (only while a match is open). */listen:(fn:()=>void)=>()=>void};
type Open={format:LiveMatchFormat;fgMs:number;since:number|null;banked:number;others:number};

/** The live-match counter on an injectable environment (tests drive it with a fake clock; the page uses `liveMatch` below). */
export function createLiveMatchAnalytics(env:Env){
 let open:Open|null=null,unlisten:(()=>void)|null=null,matches=0;
 /** Whole seconds not yet sent as minutes, per format (carried across matches in this tab). */
 const rest:Partial<Record<LiveMatchFormat,number>>={};
 /** Visit dedupe: the format whose visit is counted and, once the player stepped off it, when. */
 const visit:Partial<Record<LiveMatchFormat,{awayAt:number|null}>>={};
 let venue:LiveMatchFormat|null=null;
 const fg=(o:Open,t:number)=>Math.min(LM_CAP_S*1000,o.fgMs+(o.since===null?0:Math.max(0,t-o.since)));
 /** Send the whole minutes of the time played since the last bank; the leftover seconds wait for the next bank / the leave. */
 function bank(o:Open,t:number){
  const s=Math.floor(fg(o,t)/1000),d=s-o.banked;if(d<=0)return;o.banked=s;
  const r=(rest[o.format]||0)+d,m=Math.floor(r/60);rest[o.format]=r-m*60;if(m>0)env.count(lmId(o.format,'min'),m);
 }
 function onVisibility(){
  const o=open;if(!o)return;const t=env.now();
  if(env.visible()){if(o.since===null)o.since=t;}
  else if(o.since!==null){o.fgMs=fg(o,t);o.since=null;bank(o,t);}
 }
 const api={
  /** Town: the pitch Town's HUD would show a bar for changed (null = none). Only on a change, never per frame. */
  venue(f:string|null){
   const t=env.now(),next=isLmFormat(f)?f:null;if(next===venue)return;
   if(venue&&visit[venue])visit[venue]!.awayAt=t;
   venue=next;
   if(next&&visit[next]&&visit[next]!.awayAt!==null&&t-visit[next]!.awayAt!<VISIT_AWAY_MS)visit[next]!.awayAt=null;// back within a minute: same visit
  },
  /** Town: a live pitch's Learn + Play bar went from hidden to shown. Counts a visit unless this visit was already counted. */
  barShown(f:string){
   if(!isLmFormat(f))return false;const t=env.now(),v=visit[f];
   if(v&&(v.awayAt===null||t-v.awayAt<VISIT_AWAY_MS)){v.awayAt=null;return false;}
   visit[f]={awayAt:null};env.count(lmId(f,'visit'));return true;
  },
  /** The runtime's match events (liveJoinRuntime api.onMatch). */
  on(e:LiveMatchEvent){
   const t=env.now();
   if(e.type==='join'){
    if(!isLmFormat(e.format))return;if(open)api.on({type:'leave',reason:'forced',others:open.others});
    open={format:e.format,fgMs:0,since:env.visible()?t:null,banked:0,others:Math.max(0,e.others|0)};
    env.count(lmId(e.format,'join'));env.count(lmId(e.format,'role_'+roleOf(e.role,e.role==='gk')));
    matches++;for(const n of LM_REACH)if(matches===n)env.count('lm:reach_'+n);
    unlisten?.();unlisten=env.listen(onVisibility);
    return;
   }
   const o=open;if(!o)return;
   if(e.type==='others'){o.others=Math.max(o.others,e.others|0);return;}
   o.others=Math.max(o.others,e.others|0);
   o.fgMs=fg(o,t);o.since=null;bank(o,t);
   const r=rest[o.format]||0;if(r>0)env.count(lmId(o.format,'sec'),r);rest[o.format]=0;
   env.count(lmId(o.format,'leave'));env.count(lmId(o.format,lenBand(o.banked)));env.count(lmId(o.format,withBand(o.others)));
   env.count(lmId(o.format,e.reason==='hide'?'end_hide':e.reason==='forced'?'end_forced':'end_leave'));
   open=null;unlisten?.();unlisten=null;
  },
  /** Test hook. */
  state:()=>({open:open?{...open,fgMs:fg(open,env.now())}:null,venue,matches,rest:{...rest}}),
 };
 return api;
}

/** The page's one instance: counts through the tracker (a no-op when the tracker is off), the tab's real clock and visibility. */
const doc=()=>typeof document==='undefined'?null:document;
export const liveMatch=createLiveMatchAnalytics({count,now:()=>Date.now(),visible:()=>doc()?.visibilityState!=='hidden',
 listen:fn=>{const d=doc();if(!d)return()=>{};d.addEventListener('visibilitychange',fn);return()=>d.removeEventListener('visibilitychange',fn);}});
let unhook:(()=>void)|null=null;
/** Town, once per island mount: a tab closing mid-match books the match ('hide') before the tracker's final beat. */
export function watchLiveMatchEnd(){unhook?.();unhook=onPageHide(()=>{if(liveMatch.state().open)liveMatch.on({type:'leave',reason:'hide',others:0});});return()=>{unhook?.();unhook=null;};}
