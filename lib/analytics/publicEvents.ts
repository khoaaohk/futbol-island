/**
 * Public island analytics (Nov 11 2026, phase 1; docs/multiplayer-public-island-plan-2026-11-11.md). Like partyEvents.ts, the
 * multiplayer code never imports analytics (tests/mp-isolation.cjs): components/Town.tsx (or a room page) calls these helpers
 * when the client / UI raise their events. Every id is on lib/analytics/countIds.ts PUBLIC_COUNT_EVENTS (mp:pub_*).
 *
 * Silent unless the build flag is on (lib/multiplayer/publicFlag.ts publicWorldEnabled()) AND the visit counter is running
 * (tracker.count() drops everything otherwise, and Do Not Track / GPC send nothing). Each call is a map increment that rides the
 * next beat: no request, no timer, no re-render. Throttled per tab session: "once" ids at most once, the rest at most
 * PUBLIC_EVENT_CAP times, so a flapping connection or a tap loop cannot inflate a total.
 *
 * Privacy: never a name or made-up name, member id, world/shard, report target, position, time of day or who was near whom.
 */
import {count} from './tracker';
import {PUBLIC_REPORT_REASONS} from './countIds';
import {holdoutReadingEnabled,publicWorldEnabled} from '../multiplayer/publicFlag';

export type PublicReportReason=typeof PUBLIC_REPORT_REASONS[number];
/** At most this many of one id per tab session (the "once" ids: 1). */
export const PUBLIC_EVENT_CAP=10;
const ONCE=new Set(['mp:pub_arm_on','mp:pub_arm_hold','mp:pub_seen','mp:pub_hint']);
const sent=new Map<string,number>();
function emit(id:string){
 if(!publicWorldEnabled())return;
 const n=sent.get(id)||0,cap=ONCE.has(id)?1:PUBLIC_EVENT_CAP;
 if(n>=cap)return;
 sent.set(id,n+1);count(id);
}

/** The holdout arm this tab started with (lib/multiplayer/holdout.ts holdoutArm()), once per tab session. */
export function countPublicArm(arm:'on'|'hold',back=false){
 emit(arm==='hold'?'mp:pub_arm_hold':'mp:pub_arm_on');
 tabArm=arm;// phase 2: the arm the holdout reading files this tab's minutes under
 if(back&&holdoutReadingEnabled()&&!backSent){backSent=true;count(`mp:pub_hx_${arm}_back`);}
}
/** The world answered and this player is in (each connect, capped). */
export const countPublicConnect=()=>emit('mp:pub_connect');
/** Another player was first drawn near this one in this visit (once). */
export const countPublicSeen=()=>emit('mp:pub_seen');
/** The player chose "Just me" / "With other players" on the people button. */
export const countPublicSwitch=(to:'solo'|'public')=>emit(to==='solo'?'mp:pub_switch_solo':'mp:pub_switch_on');
/** A player was hidden (Hide, not Report). */
export const countPublicHide=()=>emit('mp:pub_hide');
/** A report was sent, by its reason only. An unknown reason counts as "other". */
export const countPublicReport=(reason:string)=>emit('mp:pub_report_'+((PUBLIC_REPORT_REASONS as readonly string[]).includes(reason)?reason:'other'));
/** The silent fallback to Just me: every world was full, or the service could not be reached / was switched off. */
export const countPublicFallback=(why:'full'|'unreachable')=>emit(why==='full'?'mp:pub_full':'mp:pub_unreachable');
/** The one-time "other kids are here" card was shown (once). */
export const countPublicHint=()=>emit('mp:pub_hint');
/** A shared live match was joined while in a public world. */
export const countPublicMatchJoin=()=>emit('mp:pub_match_join');

let tabArm:'on'|'hold'|null=null,backSent=false;
const MIN=60_000,SAMPLE_MS=5000,MAX_MIN=240;
let acc=0,lastAt=-1,nextAt=0,mins=0;
/**
 * Whole foreground minutes with at least one other player drawn nearby: call from Town's existing frame (never a loop of its own)
 * with whether others are around. A comparison per frame; every ~5 s it adds the visible time since the last sample, capped so a
 * hidden or frozen tab adds nothing. `mp:pub_min` per full minute, at most MAX_MIN per tab session.
 */
export function publicFrame(t:number,othersNear:boolean,visible=typeof document==='undefined'||document.visibilityState==='visible'){
 if(!othersNear||!publicWorldEnabled()){lastAt=-1;return;}
 if(t<nextAt)return;nextAt=t+SAMPLE_MS;
 if(lastAt>=0&&visible){acc+=Math.min(t-lastAt,SAMPLE_MS*2);while(acc>=MIN&&mins<MAX_MIN){acc-=MIN;mins++;count('mp:pub_min');}}
 lastAt=t;
}

let hAcc=0,hLast=-1,hNext=0,hMins=0;
/**
 * Phase 2, the holdout READING (OFF until legal sign-off: holdoutReadingEnabled()). Whole foreground island minutes for the arm this
 * tab started in (`mp:pub_hx_<arm>_min`), from Town's existing frame like publicFrame (a comparison per frame, a sample every ~5 s,
 * no loop, timer or request of its own), at most MAX_MIN per tab session. Silent before the arm is known.
 */
export function holdoutFrame(t:number,visible=typeof document==='undefined'||document.visibilityState==='visible'){
 if(!tabArm||!holdoutReadingEnabled())return;
 if(t<hNext)return;hNext=t+SAMPLE_MS;
 if(hLast>=0&&visible){hAcc+=Math.min(t-hLast,SAMPLE_MS*2);while(hAcc>=MIN&&hMins<MAX_MIN){hAcc-=MIN;hMins++;count(`mp:pub_hx_${tabArm}_min`);}}
 hLast=visible?t:-1;
}

/** Tests: forget the session's throttles. */
export function resetPublicEvents(){sent.clear();acc=0;lastAt=-1;nextAt=0;mins=0;tabArm=null;backSent=false;hAcc=0;hLast=-1;hNext=0;hMins=0;}
