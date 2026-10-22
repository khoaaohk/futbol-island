/**
 * The admin "Friends & parties" and "Emotes" sections (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md), built on the
 * SERVER from the range's merged daily totals (core.ts mergeRollups: counts, countSessions). Pure and client-safe (the dashboard
 * imports the types and funnelMath).
 *
 * Small numbers (plan §2 rule 4):
 *  - a cell resting on fewer than MIN_SESSIONS (5) sessions is sent as null ("<5"), and a count is shown only when the sessions
 *    behind it reach 5;
 *  - a party-histogram band with fewer than MIN_PARTIES (5) parties is null, and the averages / medians need 5 parties in all.
 * Before PARTY_SINCE (the build that sends the mp: / em: ids) nothing can exist: status 'not_yet' ("Not tracked yet"), never a 0.
 * The party histograms come from the HOST's device at the party's end, so they are approximate (a host tab that was killed sends
 * none); the relay's own totals (Phase B) will be the authoritative ones.
 */
import type {DailyRollup,Merged} from './core';
import {MIN_SESSIONS,type Cell} from './learning';
import {EMOTE_CONTEXTS,EMOTE_REACH,EMOTE_VARIANT_COUNTS,EMOTE_WIRE_IDS,PARTY_COUNT_EVENTS,PARTY_FAIL_REASONS,PARTY_FF_BUCKETS,PARTY_LEN_BUCKETS,PARTY_MIN_REACH,PARTY_PEAK_BUCKETS,PARTY_SINCE,type EmoteVariantFamily} from './countIds';
import {funnelMath} from './startReport';
import type {EmoteGroup} from './emoteLabels';

export {funnelMath,PARTY_SINCE};
export const MIN_PARTIES=5;
const LABEL:Record<string,string>=Object.fromEntries(PARTY_COUNT_EVENTS.map(([e,l])=>['mp:'+e,l]));

export type PartyStatus='not_yet'|'empty'|'ok';
export type PartyStep={id:string;label:string;sessions:Cell};
export type PartyRow={id:string;label:string;value:Cell};
export type PartyReport={
 status:PartyStatus;since:string;partial:boolean;min:number;minParties:number;hidden:number;
 sessions:number;inParty:Cell;inShare:number|null;
 host:PartyStep[];guest:PartyStep[];failures:PartyRow[];
 parties:Cell;peak:PartyRow[];len:PartyRow[];firstFriend:PartyRow[];histParties:number;
 avgSize:number|null;medianSize:string|null;medianLen:string|null;joinsPerParty:number|null;
 minutes:Cell;islandMinutes:number;minuteShare:number|null;minReach:PartyStep[];
 daily:{day:string;party:Cell;solo:number}[];
 invites:{shared:Cell;copied:Cell;linkOpens:Cell;linkJoins:Cell;linkConv:number|null;perParty:number|null};
 controls:PartyRow[];
 /** Phase B (P1): lessons / quizzes while in a party; first party and first hosted party per device, and repeat hosting. */
 learning:PartyRow[];firsts:{party:Cell;host:Cell;repeatHosting:Cell};
};
export type EmoteRow={wire:number;label:string;group:EmoteGroup;value:Cell};
export type EmoteReport={
 status:PartyStatus;since:string;partial:boolean;min:number;hidden:number;
 picks:Cell;sessions:number;emotingSessions:Cell;emotingShare:number|null;perEmoter:number|null;npcRate:number|null;
 btnSessions:Cell;wheelOpens:Cell;wheelNoPick:Cell;wheelConv:number|null;
 byEmote:EmoteRow[];contexts:PartyRow[];targets:PartyRow[];reach:PartyStep[];
 /** Phase B (P1): streaks, emote-camera zooms, friends' emotes seen; which move of each multi-move emote (by table index). */
 streaks:Cell;cam:Cell;seen:Cell;variants:EmoteVariantTable[];
};
export type EmoteVariantTable={family:EmoteVariantFamily;title:string;rows:{key:string;label:string;value:Cell}[]};
const VARIANT_TITLE:Record<EmoteVariantFamily,string>={dance:'Dance moves',show:'Show-off skills',react:'Townsperson reactions to a show-off',hf:'High fives, thanks and well played',
 wave:'Wave moves',cheer:'Cheer moves',laugh:'Laugh moves',pass:'Pass it routines',juggle:'Juggle with me routines',keepup:'Solo keep-up routines',move:'Moving emotes (walking / running)'};

type M=Pick<Merged,'counts'|'countSessions'|'totals'|'areas'>;
const statusOf=(to:string,m:M,prefix:string):PartyStatus=>to<PARTY_SINCE?'not_yet':Object.keys(m.counts).some(k=>k.startsWith(prefix))?'ok':'empty';
function cells(m:M){
 const S=m.countSessions,C=m.counts;let hidden=0;
 const cell=(n:number|undefined):Cell=>{const v=n||0;if(v>=MIN_SESSIONS)return v;if(v>0){hidden++;return null;}return 0;};
 const guarded=(id:string):Cell=>{const s=S[id]||0;if(s>=MIN_SESSIONS)return C[id]||0;if(s>0){hidden++;return null;}return 0;};
 /** A party-histogram band: one increment per party, so the count IS the number of parties. */
 const party=(id:string):Cell=>{const v=C[id]||0;if(v>=MIN_PARTIES)return v;if(v>0){hidden++;return null;}return 0;};
 return {cell,guarded,party,hidden:()=>hidden};
}
const ratio=(a:Cell,b:Cell)=>a===null||b===null||!b?null:a/b;
const PEAK_MID:Record<string,number>={peak_1:1,peak_2:2,peak_3_4:3.5,peak_5_8:6.5,peak_9_12:10.5,peak_13_20:16.5};
/** The band holding the middle party (raw counts; only called with ≥ MIN_PARTIES parties). */
function medianBand(bands:readonly (readonly [string,string])[],C:Record<string,number>):string|null{
 const n=bands.reduce((a,[id])=>a+(C['mp:'+id]||0),0);if(n<MIN_PARTIES)return null;
 let acc=0;for(const [id,label] of bands){acc+=C['mp:'+id]||0;if(acc>=n/2)return label;}return null;
}

export function buildParty(m:M,range:{from:string;to:string},rollups:DailyRollup[]=[]):PartyReport{
 const {cell,guarded,party,hidden}=cells(m),S=m.countSessions,C=m.counts;
 const step=(id:string,label=LABEL[id]??id):PartyStep=>({id,label,sessions:cell(S[id])});
 const row=(id:string,label=LABEL[id]??id):PartyRow=>({id,label,value:guarded(id)});
 const sessions=m.totals.sessions,inParty=cell(S['mp:in']);
 const histParties=PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(C['mp:'+id]||0),0);
 const avgSize=histParties>=MIN_PARTIES?PARTY_PEAK_BUCKETS.reduce((a,[id])=>a+(C['mp:'+id]||0)*PEAK_MID[id],0)/histParties:null;
 const islandMs=m.areas.find(a=>a.area==='island')?.ms??0,islandMinutes=Math.round(islandMs/60000);
 const minutes=guarded('mp:min'),created=guarded('mp:created');
 const shared=guarded('mp:share_ok'),copied=guarded('mp:copy_ok'),linkOpens=cell(S['mp:open_link']),linkJoins=cell(S['mp:live_guest_link']);
 const r:PartyReport={
  status:statusOf(range.to,m,'mp:'),since:PARTY_SINCE,partial:range.from<PARTY_SINCE&&range.to>=PARTY_SINCE,min:MIN_SESSIONS,minParties:MIN_PARTIES,hidden:0,
  sessions,inParty,inShare:inParty!==null&&sessions>0?Math.min(1,inParty/sessions):null,
  host:[step('mp:open'),step('mp:gate_show'),step('mp:gate_ok'),step('mp:name_ok'),step('mp:create_tap'),step('mp:created'),step('mp:live_host'),
   {id:'mp:ff',label:'A friend joined',sessions:cell(PARTY_FF_BUCKETS.filter(([id])=>id!=='ff_none').reduce((a,[id])=>a+(S['mp:'+id]||0),0))}],
  guest:[{id:'mp:open_any',label:'Opened (HUD, invite link or title screen)',sessions:cell((S['mp:open']||0)+(S['mp:open_link']||0)+(S['st:friends']||0))},
   step('st:friends','Title screen: Join friends'),step('mp:open_link'),step('mp:join_tap'),step('mp:live_guest')],
  failures:[...PARTY_FAIL_REASONS.map(f=>row('mp:fail_'+f)),row('mp:fail_create_rate'),row('mp:fail_create_offline')],
  parties:created,
  peak:PARTY_PEAK_BUCKETS.map(([id,label])=>({id:'mp:'+id,label,value:party('mp:'+id)})),
  len:PARTY_LEN_BUCKETS.map(([id,label])=>({id:'mp:'+id,label,value:party('mp:'+id)})),
  firstFriend:PARTY_FF_BUCKETS.map(([id,label])=>({id:'mp:'+id,label,value:party('mp:'+id)})),
  histParties:histParties>=MIN_PARTIES?histParties:0,
  avgSize,medianSize:medianBand(PARTY_PEAK_BUCKETS,C),medianLen:medianBand(PARTY_LEN_BUCKETS,C),
  joinsPerParty:ratio(guarded('mp:live_guest'),created),
  minutes,islandMinutes,minuteShare:minutes!==null&&islandMinutes>0?Math.min(1,minutes/islandMinutes):null,
  minReach:PARTY_MIN_REACH.map(n=>step('mp:min_reach_'+n)),
  daily:rollups.map(d=>{const s=d.countSessions?.['mp:min']||0,p=d.counts?.['mp:min']||0,isl=Math.round((d.areaMs?.island||0)/60000);
   return {day:d.day,party:s>=MIN_SESSIONS?p:s>0?null:0,solo:Math.max(0,isl-(s>=MIN_SESSIONS?p:0))};}),
  invites:{shared,copied,linkOpens,linkJoins,linkConv:ratio(linkJoins,linkOpens),perParty:shared===null||copied===null?null:ratio(shared+copied,created)},
  controls:['new_code','lock','unlock','kick','name_reset','hide','mute','tab_code','tab_list','end_tap','end','leave','ended','kicked','sheet','share_tap','share_fail','gate_skip','gate_back','gate_wrong','name_bad','ping_meet','ping_follow']
   .map(id=>row('mp:'+id)),
  learning:['lesson','quiz','quiz_done'].map(id=>row('mp:'+id)),
  firsts:(()=>{const party=guarded('mp:first_party'),host=guarded('mp:first_host');return {party,host,repeatHosting:created===null||host===null?null:Math.max(0,created-host)};})(),
 };
 r.hidden=hidden();
 return r;
}

export function buildEmotes(m:M,range:{from:string;to:string},labels:Record<number,{label:string;group:EmoteGroup}>={},variantLabels:Partial<Record<EmoteVariantFamily,string[]>>={}):EmoteReport{
 const {cell,guarded,hidden}=cells(m),S=m.countSessions;
 const row=(id:string,label:string):PartyRow=>({id,label,value:guarded(id)});
 const picks=guarded('em:pick'),emoting=cell(S['em:reach_1']),sessions=m.totals.sessions;
 const wheel=guarded('em:wheel'),noPick=guarded('em:wheel_close');
 const CTX_LABEL:Record<string,string>={ground:'On foot',scooter:'Scooter',bike:'Bike',moped:'Moped',fly:'Flying',swim:'Swimming',walk:'Walking / running'};
 const r:EmoteReport={
  status:statusOf(range.to,m,'em:'),since:PARTY_SINCE,partial:range.from<PARTY_SINCE&&range.to>=PARTY_SINCE,min:MIN_SESSIONS,hidden:0,
  picks,sessions,emotingSessions:emoting,emotingShare:emoting!==null&&sessions>0?Math.min(1,emoting/sessions):null,
  perEmoter:ratio(picks,emoting),npcRate:ratio(guarded('em:to_npc'),picks),
  btnSessions:cell(S['em:btn']),wheelOpens:wheel,wheelNoPick:noPick,wheelConv:wheel===null||noPick===null||!wheel?null:Math.max(0,1-noPick/wheel),
  byEmote:EMOTE_WIRE_IDS.map(n=>({wire:n,label:labels[n]?.label??`Emote ${n}`,group:labels[n]?.group??(n<10?'wheel':n<20?'ride':n<30?'fly':n<40?'swim':n<50?'npc':'walk'),value:guarded('em:e'+n)})),
  contexts:EMOTE_CONTEXTS.map(c=>row('em:ctx_'+c,CTX_LABEL[c])),
  targets:[row('em:to_npc','A townsperson answered'),row('em:to_party','Sent to friends in a party'),row('em:solo','Nobody near'),row('em:refused','A field player said “not now”')],
  reach:EMOTE_REACH.map(n=>({id:'em:reach_'+n,label:`${n}+ emotes in a visit`,sessions:cell(S['em:reach_'+n])})),
  streaks:guarded('em:streak'),cam:guarded('em:cam'),seen:guarded('em:seen'),
  variants:(Object.entries(EMOTE_VARIANT_COUNTS) as [EmoteVariantFamily,number][]).map(([family,n])=>({family,title:VARIANT_TITLE[family],
   rows:Array.from({length:n},(_,i)=>({key:`em:${family}_${i}`,label:variantLabels[family]?.[i]??`Move ${i+1}`,value:guarded(`em:${family}_${i}`)}))})),
 };
 r.hidden=hidden();
 return r;
}
