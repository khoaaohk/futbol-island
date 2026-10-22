/**
 * Play with friends analytics (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md §3–§4). The party code never imports
 * analytics (tests/mp-isolation.cjs): components/party/PartyHost.tsx raises an EVENT NAME through its `onTrack` prop and
 * components/Town.tsx passes it here (`countParty`). Every id is on lib/analytics/countIds.ts PARTY_COUNT_EVENTS; an unknown event
 * is dropped. Each call is a tracker count() (a map increment that rides the next beat): no request, no timer, no re-render.
 *
 * Kept on the device only, and only while a party is live: the role (host / guest), the moment it went live, the peak member
 * count and whether a friend came. At the party's end the HOST sends one size band, one length band and (when nobody came)
 * mp:ff_none; guests send none of them, so each party is counted once. Party minutes accrue from Town's frame, sampled every
 * ~5 s (a comparison per frame), and are sent as whole minutes.
 *
 * Privacy: never a code, link, name, nick, nick length, member id, host key, network address, or a party's start/end time.
 */
import {count,onPageHide} from './tracker';
import {PARTY_FAIL_REASONS,PARTY_MIN_REACH} from './countIds';
import {countPartyRetention} from './partyRetentionEvents';

/** Every event name PartyHost may raise (tests/admin-analytics-party.cjs: equals PartyHost's `Track` union). */
export const PARTY_TRACK_EVENTS=['open','sheet','open_link','gate_show','gate_skip','gate_ok','gate_back','gate_wrong','name_ok',
 'create_tap','created','join_tap','live_host','live_guest','members','share_tap','share_ok','copy_ok','share_fail','new_code','lock','unlock',
 'kick','name_reset','hide','mute','tab_code','tab_list','end_tap','end','leave','ended','kicked','fail','fail_create',
 'rtt','reconnect'] as const;// Phase C (partyRetentionEvents.ts; sends nothing unless NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1)
export type PartyTrack=typeof PARTY_TRACK_EVENTS[number];
const KNOWN=new Set<string>(PARTY_TRACK_EVENTS);
/** Events that are simply `mp:<event>`. */
const DIRECT=new Set<string>(['open','sheet','open_link','gate_show','gate_skip','gate_ok','gate_back','gate_wrong','create_tap','created','join_tap',
 'share_tap','share_ok','copy_ok','share_fail','new_code','lock','unlock','kick','name_reset','hide','mute','end_tap']);
/** Counted at most once per tab session (the module lives as long as the tab's page). */
const ONCE=new Set<string>(['name_ok','tab_code','tab_list']);

const MIN=60_000;
/** Party size band from the largest member count the host saw (1 = nobody joined). */
export function peakBucket(n:number):string{return n<=1?'peak_1':n===2?'peak_2':n<=4?'peak_3_4':n<=8?'peak_5_8':n<=12?'peak_9_12':'peak_13_20';}
/** Party length band (ms live). 4:59 → len_5m, 5:00 → len_15m. */
export function lenBucket(ms:number):string{const m=ms/MIN;return m<5?'len_5m':m<15?'len_15m':m<30?'len_30m':m<60?'len_60m':m<180?'len_3h':'len_long';}
/** Time from the host going live to the first friend arriving. */
export function ffBucket(ms:number):string{const m=ms/MIN;return m<1?'ff_1m':m<5?'ff_5m':m<15?'ff_15m':m<60?'ff_60m':'ff_long';}

type Live={host:boolean;since:number;peak:number;friend:boolean};
let live:Live|null=null;
const sent=new Set<string>();
let partyMs=0,sessionMin=0,lastAt=-1,nextAt=0;
const once=(id:string)=>{if(sent.has(id))return;sent.add(id);count(id);};
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();

/** The live party ended (End, Leave, ended remotely, removed, or the tab closing): the host sends the size/length bands. */
function close(t:number){
 const p=live;if(!p)return;live=null;lastAt=-1;
 if(!p.host)return;
 count('mp:'+peakBucket(p.peak));count('mp:'+lenBucket(Math.max(0,t-p.since)));
 if(!p.friend)count('mp:ff_none');
}

/** One PartyHost event. `bucket`: a fixed string (fail reason, 'link' / 'typed', or the member count for 'members'). */
export function countParty(event:string,bucket?:string,t=now()){
 if(!KNOWN.has(event))return;
 if(event==='live_guest'||event==='rtt'||event==='reconnect')countPartyRetention(event,bucket);
 if(DIRECT.has(event)){count('mp:'+event);return;}
 if(ONCE.has(event)){once('mp:'+event);return;}
 switch(event){
  case 'live_host':case 'live_guest':{
   const host=event==='live_host';
   count('mp:'+event);if(!host)count(bucket==='link'?'mp:live_guest_link':'mp:live_guest_typed');
   once('mp:in');live={host,since:t,peak:1,friend:false};lastAt=-1;return;
  }
  case 'members':{
   const n=Number(bucket);if(!live||!Number.isInteger(n)||n<1)return;
   if(n>live.peak)live.peak=Math.min(n,99);
   if(live.host&&n>=2&&!live.friend){live.friend=true;count('mp:'+ffBucket(Math.max(0,t-live.since)));}
   return;
  }
  case 'fail':{const r=(PARTY_FAIL_REASONS as readonly string[]).includes(bucket??'')?bucket:'other';count('mp:fail_'+r);return;}
  case 'fail_create':count(bucket==='rate'?'mp:fail_create_rate':'mp:fail_create_offline');return;
  case 'end':case 'leave':count('mp:'+event);close(t);return;
  // Remote endings count only when this side had not already ended it (End / Leave above close it first).
  case 'ended':case 'kicked':if(live){count('mp:'+event);close(t);}return;
 }
}

/** True while this device is in a live party (Phase B: learnEvents' mp: twins). */
export const partyLive=()=>live!==null;

/** Whole foreground minutes in a party: `mp:min` per full minute, and the session thresholds (each once). */
export function accruePartyMs(ms:number){
 if(!live||!(ms>0))return;
 partyMs+=ms;
 while(partyMs>=MIN){partyMs-=MIN;sessionMin++;count('mp:min');for(const m of PARTY_MIN_REACH)if(sessionMin>=m)once('mp:min_reach_'+m);}
}
const SAMPLE_MS=5000;
/**
 * Called from Town's existing frame (never a loop of its own): a comparison per frame; every ~5 s it adds the visible time since
 * the last sample (capped, so a hidden or frozen tab adds nothing). Off-party it only resets.
 */
export function partyFrame(t:number,visible=typeof document==='undefined'||document.visibilityState==='visible'){
 if(!live){lastAt=-1;return;}
 if(t<nextAt)return;nextAt=t+SAMPLE_MS;
 if(lastAt>=0&&visible)accruePartyMs(Math.min(t-lastAt,SAMPLE_MS*2));
 lastAt=t;
}

/** The tab is closing with a party live: the host's bands go into the final (pagehide) beat. */
export function flushPartyEnd(t=now()){close(t);}
let unhook:(()=>void)|null=null;
/** Town calls this once while the island is mounted; returns the cleanup. */
export function watchPartyEnd(){unhook?.();unhook=onPageHide(()=>flushPartyEnd());return()=>{unhook?.();unhook=null;};}

/** Tests: forget everything. */
export function resetPartyEvents(){live=null;sent.clear();partyMs=0;sessionMin=0;lastAt=-1;nextAt=0;}
