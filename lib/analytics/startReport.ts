/**
 * The "Start page" section of the admin report (Oct 9 2026), built on the SERVER from the range's merged totals (core.ts
 * mergeRollups: the /start subset, counts, countSessions). Small-number suppression happens here, as in learning.ts: every cell
 * resting on fewer than MIN_SESSIONS sessions in the range is sent as null (shown as "<5"), and `hidden` says how many.
 * Funnels are sessions per step (countSessions: sessions whose counter for that id is ≥ 1), so no per-session id is needed;
 * a step can exceed the one before it (e.g. a Play after a code made in an earlier session), and the share is then capped.
 * Pure and dependency-light: app/admin/StartSection.tsx imports the types and funnelMath.
 */
import type {Merged,Row,StartDim} from './core';
import {MIN_SESSIONS,type Cell} from './learning';
import {PRIVACY_SECTION_IDS,START_AMOUNTS} from './startIds';

export type StartStep={id:string;label:string;sessions:Cell};
export type StartFunnel={id:'new'|'restore'|'returning'|'break';title:string;steps:StartStep[];side:StartStep[]};
export type StartReport={
 hasData:boolean;min:number;hidden:number;
 /** visitors / sessions of the /start subset (null when the storage update is missing, `partial` when some days lack it). */
 visits:{visitors:number;sessions:number;pageviews:number;available:boolean;partial:boolean;entered:{visitors:number;sessions:number};viewed:Cell};
 dims:Record<StartDim,Row[]>|null;
 funnels:StartFunnel[];
 word:{answered:Cell;right:Cell};
 grown:{opened:Cell;links:{id:string;label:string;sessions:Cell;clicks:Cell}[];donate:StartStep[];gateNo:Cell;amounts:{amount:number;sessions:Cell;clicks:Cell}[];paid:Cell};
 privacy:{fromLink:Cell;fromGrown:Cell;sections:{id:string;label:string;sessions:Cell}[]};
 tilt:Cell;
};

export const PRIVACY_SECTION_LABEL:Record<(typeof PRIVACY_SECTION_IDS)[number],string>={short:'1. The short version',children:'2. Children and grown-ups',device:'3. What stays on the device',
 codes:'4. Save codes',plan:'5. The football plan and QR links',email:'6. Sending a code to a grown-up',visits:'7. Visit counts and learning statistics',tech:'8. Technical information',
 never:'9. What we never collect',use:'10. How we use information',cookies:'11. Cookies and browser storage',services:'12. Services that help run the game',sharing:'13. Sharing and selling',
 retention:'14. How long we keep things',security:'15. How we protect it',rights:'16. Your choices and rights',regions:'17. UK, EU and US states',changes:'18. Changes to this policy',contact:'19. Contact'};
const LINKS:[string,string][]=[['wsv','White Sports Ventures site'],['instagram','@jeremiahwhiteiii on Instagram'],['fc_yap','FC YAP'],['street_soccer_san_diego','Street Soccer San Diego'],
 ['ronin_futsal','Ronin Futsal'],['privacy','Read the privacy policy']];

/** Each step's share of the first step and the drop from the step before (null where a step is withheld or the base is 0). */
export function funnelMath(steps:Cell[]):{ofFirst:number|null;drop:number|null}[]{
 const first=steps[0];
 return steps.map((s,i)=>{
  const prev=i?steps[i-1]:null;
  return {ofFirst:s===null||!first?null:Math.min(1,s/first),drop:i===0||s===null||!prev?null:Math.max(0,1-s/prev)};
 });
}

/** `rangeDays`: days in the range (some may be frozen before the storage update and carry no /start subset → `partial`). */
export function buildStart(m:Pick<Merged,'counts'|'countSessions'|'start'|'dims'>,schema:number,rangeDays:number,storageNeeded=4):StartReport{
 const sessions=m.countSessions,counts=m.counts;let hidden=0;
 const cell=(n:number|undefined):Cell=>{const v=n||0;if(v>=MIN_SESSIONS)return v;if(v>0){hidden++;return null;}return 0;};
 const guarded=(c:number|undefined,s:number|undefined):Cell=>(s||0)>=MIN_SESSIONS?(c||0):(s||0)>0?(hidden++,null):0;
 const step=(id:string,label:string):StartStep=>({id,label,sessions:cell(sessions[id])});
 const entry=m.dims.entry.find(r=>r.key==='/start');
 const available=schema>=storageNeeded&&m.start.days>0;
 const funnels:StartFunnel[]=[
  {id:'new',title:'New player: Start',steps:[step('st:view','Saw the title screen'),step('st:start','Pressed Start'),step('st:created','Save code made'),
   step('st:saved','Passed the code check (“I saved it”)'),step('st:play_ready','Pressed Play')],side:[]},
  {id:'restore',title:'I have a save code',steps:[step('st:have','Pressed “I have a save code”'),step('st:restored','Code restored'),step('st:play_restored','Pressed Play')],
   side:[step('st:restore_fail','A try that failed (wrong code, offline or too many tries)')]},
  {id:'returning',title:'Returning (code already in this browser)',steps:[step('st:returning','Welcome back card shown'),step('st:play_returning','Pressed Play')],
   side:[step('st:other_code','Pressed “Use a different code”')]},
  {id:'break',title:'Saving break',steps:[step('st:break','“Saving is taking a break” card shown'),step('st:play_break','Pressed Play')],side:[]},
 ];
 const report:StartReport={
  hasData:false,min:MIN_SESSIONS,hidden:0,
  visits:{visitors:m.start.visitors,sessions:m.start.sessions,pageviews:m.start.pageviews,available,partial:available&&m.start.days<rangeDays,
   entered:{visitors:entry?.visitors||0,sessions:entry?.sessions||0},viewed:cell(sessions['st:view'])},
  dims:available?m.start.dims:null,
  funnels,
  word:{answered:cell(sessions['st:word']),right:cell(sessions['st:word_ok'])},
  grown:{opened:cell(sessions['sg:open']),
   links:LINKS.map(([id,label])=>({id,label,sessions:cell(sessions['sg:'+id]),clicks:guarded(counts['sg:'+id],sessions['sg:'+id])})),
   donate:[step('sg:open','Opened For grown-ups'),step('sg:donate','Pressed Donate'),step('sg:gate_ok','Passed the grown-up check')],gateNo:cell(sessions['sg:gate_no']),
   amounts:START_AMOUNTS.map(a=>({amount:a,sessions:cell(sessions['sg:amt_'+a]),clicks:guarded(counts['sg:amt_'+a],sessions['sg:amt_'+a])})),
   paid:cell(sessions['sg:paid'])},
  privacy:{fromLink:cell(sessions['sp:open']),fromGrown:cell(sessions['sg:privacy']),sections:PRIVACY_SECTION_IDS.map(id=>({id,label:PRIVACY_SECTION_LABEL[id],sessions:cell(sessions['sp:'+id])}))},
  tilt:cell(sessions['st:tilt']),
 };
 report.hidden=hidden;
 report.hasData=m.start.sessions>0||report.visits.entered.sessions>0||Object.keys(sessions).some(k=>/^s[tgp]:/.test(k));
 return report;
}
