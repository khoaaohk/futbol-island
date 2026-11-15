/**
 * The returning "Welcome back" card's outcomes (Nov 15 2026, owner): totals only, through trackStart (startIds.ts allowlist).
 *  - st:play_returning (own island, the existing click count) · st:ret_friends ("Join friends" from this card) · st:other_code
 *    ("Use a different code", existing) · st:ret_left: the page was hidden or closed while the card was up (no tap), once per card,
 *    plus ONE coarse band of how long the card had been on screen: st:ret_t5 (< 5 s), st:ret_t15 (5–15 s), st:ret_t60 (15–60 s),
 *    st:ret_tmore (> 1 min).
 * The hide listener is a window capture listener, so it runs before the tracker's own document listener and the count rides the
 * hide's beat; pagehide also goes through it. Nothing but the band is measured: no times leave the device.
 */
import {trackStart} from './startEvents';

export const RET_BANDS=[[5e3,'st:ret_t5'],[15e3,'st:ret_t15'],[60e3,'st:ret_t60'],[Infinity,'st:ret_tmore']] as const;
export const retBand=(ms:number)=>RET_BANDS.find(([max])=>ms<max)![1];

type Win=Pick<Window,'addEventListener'|'removeEventListener'>;type Doc={visibilityState:string};
/** Watches the card while it is up; `end()` (a tap on the card, or the card going away) stops it without a count. */
export function watchReturningCard(w:Win,d:Doc,now:()=>number=()=>Date.now(),track:(id:string)=>void=trackStart){
 const shown=now();let done=false;
 const leave=()=>{if(done)return;if(d.visibilityState!=='hidden')return;done=true;track('st:ret_left');track(retBand(now()-shown));stop();};
 const onPageHide=()=>{if(done)return;done=true;track('st:ret_left');track(retBand(now()-shown));stop();};
 const stop=()=>{w.removeEventListener('visibilitychange',leave,{capture:true});w.removeEventListener('pagehide',onPageHide,{capture:true});};
 w.addEventListener('visibilitychange',leave,{capture:true});w.addEventListener('pagehide',onPageHide,{capture:true});
 return {end(){done=true;stop();}};
}
