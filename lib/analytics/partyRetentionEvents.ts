/**
 * Play with friends, Phase C (Oct 22 2026; docs/analytics-multiplayer-plan.md §6, §7 RTT, §10 Phase C). OFF BY DEFAULT: nothing
 * here sends anything unless the build sets NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1, which waits for the legal sign-off (the
 * retention report links party play to the anonymous player id on the server; see the [LAWYER] note in
 * components/privacy/PrivacyPolicy.tsx). With the switch unset the client sends exactly what Phase A sends.
 *
 * When on (each a tracker count(): a map increment that rides the next beat; no request, no timer, no per-frame work):
 *  - `mp:guest_new`  once per tab session: went live as a GUEST in a session whose start carried rt=0 (this device had not played
 *                    here before). Only the existing yes/no mark; never the code, link, host or who invited whom.
 *  - `mp:rtt_<band>` once per party per player at its end: the median heartbeat round trip, as a band PartyHost computes from the
 *                    party store (lib/multiplayer/store.ts partyStore.health()); the party code stays analytics-free.
 *  - `mp:reconnect`  the number of unexpected drops the connection recovered from in that party (capped at 20).
 *  - `mp:min_away`   whole minutes a live party spent with the game in the background (the relay shows the player away), measured
 *                    from two visibilitychange timestamps (no timer); one hidden stretch counts at most 30 minutes.
 */
import {count,onPageHide,sessionStartRt} from './tracker';
import {PARTY_RTT_BUCKETS} from './countIds';

/** The one switch (inlined at build time). Unset / anything but '1' = off. */
export const partyRetentionOn=():boolean=>process.env.NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION==='1';

const RTT=new Set<string>(PARTY_RTT_BUCKETS.map(([b])=>b));
const MIN=60_000;
export const AWAY_STRETCH_CAP_MS=30*MIN;
let guestNewSent=false,awayMs=0,hiddenAt:number|null=null;

/** Called by partyEvents.countParty for the Phase C event names (live_guest, rtt, reconnect). `on` is injectable for tests. */
export function countPartyRetention(event:string,bucket?:string,on=partyRetentionOn()){
 if(!on)return;
 if(event==='live_guest'){if(!guestNewSent&&sessionStartRt()===0){guestNewSent=true;count('mp:guest_new');}return;}
 if(event==='rtt'){if(bucket&&RTT.has(bucket))count('mp:'+bucket);return;}
 if(event==='reconnect'){const n=Number(bucket);if(Number.isInteger(n)&&n>0)count('mp:reconnect',Math.min(n,20));}
}

/** Background time while a party is live. `live` = partyEvents.partyLive (passed in, so this file never imports partyEvents). */
export function partyVisibility(hidden:boolean,t:number,live:boolean,on=partyRetentionOn()){
 if(!on){hiddenAt=null;return;}
 if(hidden){if(live&&hiddenAt===null)hiddenAt=t;return;}
 if(hiddenAt===null)return;
 const ms=Math.min(Math.max(0,t-hiddenAt),AWAY_STRETCH_CAP_MS);hiddenAt=null;
 if(!live)return;
 awayMs+=ms;
 while(awayMs>=MIN){awayMs-=MIN;count('mp:min_away');}
}

/** Town calls this once while the island is mounted (one visibilitychange listener; nothing when the switch is off). */
export function watchPartyAway(live:()=>boolean):()=>void{
 if(!partyRetentionOn()||typeof document==='undefined')return()=>{};
 const now=()=>Date.now();
 const onVis=()=>partyVisibility(document.visibilityState==='hidden',now(),live());
 // Closing the tab while away: the minutes so far go into the final beat.
 const offHide=onPageHide(()=>{if(hiddenAt!==null){partyVisibility(false,now(),live());}});
 document.addEventListener('visibilitychange',onVis);
 return()=>{document.removeEventListener('visibilitychange',onVis);offHide();};
}

/** Tests: forget everything. */
export function resetPartyRetention(){guestNewSent=false;awayMs=0;hiddenAt=null;}
