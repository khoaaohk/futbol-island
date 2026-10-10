/**
 * IDP v2 state (docs/idp/DESIGN.md §5, Oct 9 2026). One plan per player with 1–2 "I can…" goals, weekly missions, picture
 * check-ins, a proud-moments journal, preset cheers from home or the coach, a 6-week review rhythm and a history of goals met.
 *
 * Two keys, so the privacy rule is structural rather than a filter:
 *  - IDP2_KEY  `fi2-idp-v2`      the plan: ids, dates and picture choices ONLY. No free text field exists in this shape, so it
 *                                may travel with a save code (lib/saves/snapshot.ts SYNC_KEYS; stripIdpText still runs on it).
 *  - TEXT_KEY  `fi2-idp-text-v1` free text typed on this device (player reflections, coach and home notes, the strength words).
 *                                A DEVICE key: it never leaves this device and a restore never overwrites it.
 * Migration: the P0/Lane-4 v1 plan (`fi2-idp-plan-v1`) is read once when no v2 plan exists; its notes' words move to TEXT_KEY,
 * its quick tags become check-ins. Every v2 save also writes a text-free v1 mirror so older tabs, older devices and v1 readers
 * (components/games/PassPuzzleGame.tsx childFormat) keep seeing the current focus.
 * No ranking, no scores: everything here is a dated record of trying, and "growth" only ever counts up.
 */
import type {Format} from '../../town/venues';
import {CORNERS,IDP_KEY,IDP_REVIEW_DAYS,goalById,sanitizeIdp,cleanNote,cleanStrength,type Corner,type IdpState} from '../idp';
import {CHEERS,FEELS,PLACES,STICKERS,missionById,type CheerId,type FeelId,type PlaceId,type StickerId} from './skills';

export const IDP2_KEY='fi2-idp-v2',IDP_TEXT_KEY='fi2-idp-text-v1';
export const MAX_GOALS=2,DAY=864e5,REVIEW_MS=IDP_REVIEW_DAYS*DAY;
const LOG_KEPT=120,HISTORY_KEPT=24,TEXT_KEPT=40;
const FORMATS:Format[]=['7v7','9v9','11v11','futsal'];

/** Who chose the goal. "together" is the default: the research's co-created plan. */
export type GoalSource='me'|'together'|'coach';
export type PlanGoal={goalId:string;setAt:number;source:GoalSource;
 /** Coach cue: index into SKILLS[skill].cues (from the coach's QR). */
 cue?:number;
 /** A Coaches Board play linked by the coach (lib/coaches/idp/board.ts BoardPlayRef id). */
 play?:string};
export type MissionDone={id:string;goalId:string;at:number};
export type CheckIn={at:number;goalId:string;feel:FeelId;where?:PlaceId;
 /** "I'd like some help with this": shown to grown-ups and the coach as a prompt to talk, never as a judgement. */
 help?:true};
export type Proud={at:number;sticker:StickerId;goalId?:string};
export type Cheer={at:number;id:CheerId;from:'home'|'coach'};
export type ReviewOutcome='keep'|'adapt'|'new';
export type Review={at:number;outcome:ReviewOutcome};
export type Plan2={goals:PlanGoal[];setAt:number;reviewAt:number;strength?:Corner;
 missions:MissionDone[];checkins:CheckIn[];proud:Proud[];cheers:Cheer[];reviews:Review[]};
export type GoalOutcome='met'|'changed'|'ended';
export type History2={goalId:string;setAt:number;closedAt:number;outcome:GoalOutcome;practice:number};
export type IdpState2={version:2;format:Format;plan:Plan2|null;history:History2[]};
export const emptyIdp2=(format:Format='7v7'):IdpState2=>({version:2,format,plan:null,history:[]});

const num=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>0;
const oneOf=<T extends string>(v:unknown,set:Record<T,unknown>):v is T=>typeof v==='string'&&Object.prototype.hasOwnProperty.call(set,v);
const SOURCES={me:1,together:1,coach:1},OUTCOMES={met:1,changed:1,ended:1},REVIEWS={keep:1,adapt:1,new:1},FROM={home:1,coach:1};
const PLAY_ID=/^[a-z0-9][a-z0-9-]{0,31}$/;

/** Validates any value into a v2 state. Unknown goals, missions, stickers and fields are dropped; nothing throws. */
export function sanitizeIdp2(value:unknown):IdpState2{
 const v=(value&&typeof value==='object'?value:{}) as Partial<IdpState2>;
 const format=FORMATS.includes(v.format as Format)?v.format as Format:'7v7';
 const out=emptyIdp2(format);
 const p=v.plan as Partial<Plan2>|null|undefined;
 if(p&&typeof p==='object'&&num(p.setAt)&&num(p.reviewAt)){
  const goals=(Array.isArray(p.goals)?p.goals:[]).flatMap(g=>{
   if(!g||typeof g.goalId!=='string'||!goalById(g.goalId)||!num(g.setAt))return [];
   const x:PlanGoal={goalId:g.goalId,setAt:g.setAt,source:oneOf(g.source,SOURCES)?g.source:'together'};
   if(Number.isInteger(g.cue)&&(g.cue as number)>=0&&(g.cue as number)<3)x.cue=g.cue;
   if(typeof g.play==='string'&&PLAY_ID.test(g.play))x.play=g.play;
   return [x];
  }).filter((g,i,a)=>a.findIndex(o=>o.goalId===g.goalId)===i).slice(0,MAX_GOALS);
  // A plan may have no open goal for a moment (just after a celebration, before the next goal is chosen).
  {
   const hist=Array.isArray(v.history)?v.history.map(h=>h&&h.goalId):[];
   const ids=new Set([...goals.map(g=>g.goalId),...hist.filter((x):x is string=>typeof x==='string'&&!!goalById(x))]),known=(id:unknown)=>typeof id==='string'&&ids.has(id);
   const list=<T,>(x:unknown,f:(e:any)=>T|null)=>(Array.isArray(x)?x:[]).flatMap(e=>{const r=e&&typeof e==='object'?f(e):null;return r?[r]:[];}).slice(-LOG_KEPT);
   out.plan={goals,setAt:p.setAt,reviewAt:p.reviewAt,
    missions:list(p.missions,m=>typeof m.id==='string'&&missionById(m.id)&&known(m.goalId)&&num(m.at)?{id:m.id,goalId:m.goalId,at:m.at}:null),
    checkins:list(p.checkins,c=>known(c.goalId)&&num(c.at)&&oneOf(c.feel,FEELS)?{at:c.at,goalId:c.goalId,feel:c.feel,...(oneOf(c.where,PLACES)?{where:c.where}:{}),...(c.help===true?{help:true as const}:{})}:null),
    proud:list(p.proud,x=>num(x.at)&&oneOf(x.sticker,STICKERS)?{at:x.at,sticker:x.sticker,...(known(x.goalId)?{goalId:x.goalId}:{})}:null),
    cheers:list(p.cheers,x=>num(x.at)&&oneOf(x.id,CHEERS)&&oneOf(x.from,FROM)?{at:x.at,id:x.id,from:x.from}:null),
    reviews:list(p.reviews,r=>num(r.at)&&oneOf(r.outcome,REVIEWS)?{at:r.at,outcome:r.outcome}:null).slice(-HISTORY_KEPT)};
   if(oneOf(p.strength,CORNERS))out.plan.strength=p.strength;
  }
 }
 if(Array.isArray(v.history))out.history=v.history.flatMap(h=>h&&typeof h.goalId==='string'&&goalById(h.goalId)&&num(h.setAt)&&num(h.closedAt)?[{goalId:h.goalId,setAt:h.setAt,closedAt:h.closedAt,outcome:oneOf(h.outcome,OUTCOMES)?h.outcome:'changed',practice:Number.isInteger(h.practice)&&h.practice>=0?Math.min(999,h.practice):0}]:[]).slice(-HISTORY_KEPT);
 return out;
}

// ---- Device-only free text ------------------------------------------------------------------------------------------------
export type TextKind='player'|'coach'|'home';
export type TextNote={id:string;kind:TextKind;at:number;text:string;goalId?:string};
export type IdpText={version:1;notes:TextNote[];strength?:string};
export const emptyText=():IdpText=>({version:1,notes:[]});
export function sanitizeText(value:unknown):IdpText{
 const v=(value&&typeof value==='object'?value:{}) as Partial<IdpText>,out=emptyText();
 out.notes=(Array.isArray(v.notes)?v.notes:[]).flatMap(n=>{const t=cleanNote(n?.text);return n&&typeof n.id==='string'&&(n.kind==='player'||n.kind==='coach'||n.kind==='home')&&num(n.at)&&t?[{id:n.id.slice(0,40),kind:n.kind,at:n.at,text:t,...(typeof n.goalId==='string'&&goalById(n.goalId)?{goalId:n.goalId}:{})}]:[];}).slice(-TEXT_KEPT);
 const s=cleanStrength(v.strength);if(s)out.strength=s;
 return out;
}
export function addText(t:IdpText,kind:TextKind,text:string,now:number,goalId?:string):IdpText{
 const clean=cleanNote(text);if(!clean)return t;
 return {...t,notes:[...t.notes,{id:`${kind}-${now}`,kind,at:now,text:clean,...(goalId?{goalId}:{})}].slice(-TEXT_KEPT)};
}
export const removeText=(t:IdpText,id:string):IdpText=>({...t,notes:t.notes.filter(n=>n.id!==id)});
export function setStrengthText(t:IdpText,text:string):IdpText{const s=cleanStrength(text);const {strength:_,...rest}=t;return s?{...rest,strength:s}:rest;}

// ---- Migration from v1 ----------------------------------------------------------------------------------------------------
const TAG_FEEL:Record<string,FeelId>={tried:'getting','no-chance':'nochance','want-help':'tricky'};
/** v1 → v2. Notes' words go to the device text store (returned separately); quick tags become check-ins. */
export function migrateV1(v1raw:unknown,fallbackFormat:Format='7v7'):{state:IdpState2;text:IdpText}{
 const v1=sanitizeIdp(v1raw),text=emptyText();
 const goal=v1.plan&&goalById(v1.plan.goalId);
 const state=emptyIdp2(goal?goal.format:fallbackFormat);
 if(v1.plan&&goal){
  const p=v1.plan;
  state.plan={goals:[{goalId:p.goalId,setAt:p.setAt,source:'together'}],setAt:p.setAt,reviewAt:p.reviewAt,
   missions:[],checkins:p.notes.filter(n=>n.kind==='player'&&n.tag).map(n=>({at:n.at,goalId:p.goalId,feel:TAG_FEEL[n.tag!],...(n.tag==='want-help'?{help:true as const}:{})})),
   proud:[],cheers:[],reviews:(p.reviews??[]).map(at=>({at,outcome:'keep' as const}))};
  if(p.strength){state.plan.strength=p.strength.corner;if(p.strength.text)text.strength=p.strength.text;}
  text.notes=p.notes.filter(n=>n.text).map(n=>({id:n.id,kind:n.kind,at:n.at,text:n.text,goalId:p.goalId}));
 }
 state.history=v1.history.map(h=>({goalId:h.goalId,setAt:h.setAt,closedAt:h.closedAt,outcome:'changed' as const,practice:h.homework?.done??0}));
 return {state,text};
}
/** The text-free v1 mirror written beside every v2 save (older tabs/devices and v1 readers keep the current focus). */
export function v1Mirror(s:IdpState2):IdpState{
 const p=s.plan,g=p?.goals[0];
 return {version:1,plan:p&&g?{goalId:g.goalId,setAt:g.setAt,reviewAt:p.reviewAt,notes:[],...(p.strength?{strength:{corner:p.strength,text:''}}:{}),...(p.reviews.length?{reviews:p.reviews.map(r=>r.at)}:{})}:null,
  history:s.history.map(h=>({goalId:h.goalId,setAt:h.setAt,closedAt:h.closedAt,...(h.practice?{homework:{done:h.practice,total:h.practice}}:{})}))};
}

// ---- Storage --------------------------------------------------------------------------------------------------------------
type Store=Pick<Storage,'getItem'|'setItem'>;
const ls=(s?:Store)=>s??window.localStorage;
const parse=(raw:string|null)=>{try{return raw?JSON.parse(raw):null;}catch{return null;}};
/** Loads the plan, migrating a v1 plan the first time (and moving its words to the device text store). */
export function loadIdp2(storage?:Store,fallbackFormat:Format='7v7'):IdpState2{
 try{
  const s=ls(storage),raw=parse(s.getItem(IDP2_KEY));
  if(raw&&raw.version===2)return sanitizeIdp2(raw);
  const v1=parse(s.getItem(IDP_KEY));
  if(v1&&typeof v1==='object'){
   const {state,text}=migrateV1(v1,fallbackFormat);
   const existing=loadText(s);const merged:IdpText={...existing,notes:[...existing.notes.filter(n=>!text.notes.some(m=>m.id===n.id)),...text.notes],...(existing.strength??text.strength?{strength:existing.strength??text.strength}:{})};
   saveText(merged,s);saveIdp2(state,s);
   return state;
  }
  return emptyIdp2(fallbackFormat);
 }catch{return emptyIdp2(fallbackFormat);}
}
export function saveIdp2(state:IdpState2,storage?:Store){
 try{const s=ls(storage);s.setItem(IDP2_KEY,JSON.stringify(state));s.setItem(IDP_KEY,JSON.stringify(v1Mirror(state)));}catch{}
}
export function loadText(storage?:Store):IdpText{try{return sanitizeText(parse(ls(storage).getItem(IDP_TEXT_KEY)));}catch{return emptyText();}}
export function saveText(t:IdpText,storage?:Store){try{ls(storage).setItem(IDP_TEXT_KEY,JSON.stringify(t));}catch{}}

// ---- Reducers (pure) ------------------------------------------------------------------------------------------------------
/** Creates (or replaces) the plan with 1–2 goals of one format. Closes any open goals into history as "changed". */
export function startPlan(s:IdpState2,goalIds:string[],source:GoalSource,now:number,strength?:Corner):IdpState2{
 const ids=[...new Set(goalIds)].filter(id=>goalById(id)).slice(0,MAX_GOALS);if(!ids.length)return s;
 const format=goalById(ids[0])!.format;
 const closed=closeAll(s,now,'changed');
 return {...closed,format,plan:{goals:ids.map(goalId=>({goalId,setAt:now,source})),setAt:now,reviewAt:now+REVIEW_MS,missions:[],checkins:[],proud:[],cheers:[],reviews:[],...(strength?{strength}:{})}};
}
/** Adds a goal (from a coach QR, or the next goal after a celebration). With two already, `replace` names the one to swap. */
export function addGoal(s:IdpState2,goal:{goalId:string;source:GoalSource;cue?:number;play?:string},now:number,replace?:string):IdpState2{
 const g=goalById(goal.goalId);if(!g)return s;
 if(!s.plan){const base=startPlan(s,[goal.goalId],goal.source,now);return {...base,plan:{...base.plan!,goals:[cleanGoal(goal,now)]}};}
 const p=s.plan;
 if(p.goals.some(x=>x.goalId===goal.goalId))return {...s,plan:{...p,goals:p.goals.map(x=>x.goalId===goal.goalId?{...x,...cleanGoal(goal,x.setAt),source:goal.source==='coach'?'coach':x.source}:x)}};
 let goals=p.goals,history=s.history;
 if(goals.length>=MAX_GOALS){const out=goals.find(x=>x.goalId===replace)??goals[goals.length-1];goals=goals.filter(x=>x!==out);history=[...history,closeRecord(s,out,now,'changed')].slice(-HISTORY_KEPT);}
 // A goal in another format switches the plan's wording to that format (the coach knows the team's game).
 const sameFormat=goals.filter(x=>goalById(x.goalId)!.format===g.format);
 for(const x of goals)if(!sameFormat.includes(x))history=[...history,closeRecord(s,x,now,'changed')].slice(-HISTORY_KEPT);
 return {...s,format:g.format,history,plan:{...p,goals:[...sameFormat,cleanGoal(goal,now)]}};
}
const cleanGoal=(goal:{goalId:string;source:GoalSource;cue?:number;play?:string},now:number):PlanGoal=>({goalId:goal.goalId,setAt:now,source:goal.source,
 ...(Number.isInteger(goal.cue)&&goal.cue!>=0&&goal.cue!<3?{cue:goal.cue}:{}),...(goal.play&&PLAY_ID.test(goal.play)?{play:goal.play}:{})});
/** Practice moments for one goal: missions done and check-ins where they tried (lesson evidence is added by journey.ts). */
export const practiceCount=(p:Plan2,goalId:string)=>p.missions.filter(m=>m.goalId===goalId).length+p.checkins.filter(c=>c.goalId===goalId&&c.feel!=='nochance').length;
const closeRecord=(s:IdpState2,g:PlanGoal,now:number,outcome:GoalOutcome):History2=>({goalId:g.goalId,setAt:g.setAt,closedAt:now,outcome,practice:s.plan?practiceCount(s.plan,g.goalId):0});
function closeAll(s:IdpState2,now:number,outcome:GoalOutcome):IdpState2{
 if(!s.plan)return s;return {...s,history:[...s.history,...s.plan.goals.map(g=>closeRecord(s,g,now,outcome))].slice(-HISTORY_KEPT)};
}
export function markMission(s:IdpState2,missionId:string,goalId:string,now:number):IdpState2{
 if(!s.plan||!missionById(missionId)||!s.plan.goals.some(g=>g.goalId===goalId))return s;
 return {...s,plan:{...s.plan,missions:[...s.plan.missions,{id:missionId,goalId,at:now}].slice(-LOG_KEPT)}};
}
/** Undo the most recent "I did it" for a mission this week (a mis-tap). */
export function unmarkMission(s:IdpState2,missionId:string,since:number):IdpState2{
 if(!s.plan)return s;const i=s.plan.missions.map(m=>m.id===missionId&&m.at>=since).lastIndexOf(true);if(i<0)return s;
 return {...s,plan:{...s.plan,missions:s.plan.missions.filter((_,j)=>j!==i)}};
}
export function checkIn(s:IdpState2,c:Omit<CheckIn,'at'>,now:number):IdpState2{
 if(!s.plan||!s.plan.goals.some(g=>g.goalId===c.goalId)||!oneOf(c.feel,FEELS))return s;
 return {...s,plan:{...s.plan,checkins:[...s.plan.checkins,{at:now,goalId:c.goalId,feel:c.feel,...(c.where&&oneOf(c.where,PLACES)?{where:c.where}:{}),...(c.help?{help:true as const}:{})}].slice(-LOG_KEPT)}};
}
export function addProud(s:IdpState2,sticker:StickerId,now:number,goalId?:string):IdpState2{
 if(!s.plan||!oneOf(sticker,STICKERS))return s;
 return {...s,plan:{...s.plan,proud:[...s.plan.proud,{at:now,sticker,...(goalId&&s.plan.goals.some(g=>g.goalId===goalId)?{goalId}:{})}].slice(-LOG_KEPT)}};
}
export function addCheer(s:IdpState2,id:CheerId,from:'home'|'coach',now:number):IdpState2{
 if(!s.plan||!oneOf(id,CHEERS))return s;
 return {...s,plan:{...s.plan,cheers:[...s.plan.cheers,{at:now,id,from}].slice(-LOG_KEPT)}};
}
export function setStrength2(s:IdpState2,corner:Corner|null):IdpState2{
 if(!s.plan)return s;const {strength:_,...rest}=s.plan;return {...s,plan:corner&&oneOf(corner,CORNERS)?{...rest,strength:corner}:rest};
}
/** The 6-week review: logs the outcome and restarts the window. "new" leaves the goals for the caller to replace. */
export function reviewPlan2(s:IdpState2,outcome:ReviewOutcome,now:number):IdpState2{
 if(!s.plan)return s;return {...s,plan:{...s.plan,reviewAt:now+REVIEW_MS,reviews:[...s.plan.reviews,{at:now,outcome}].slice(-HISTORY_KEPT)}};
}
/** A goal is met: it moves to "Things I can do now"; the plan stays (with its other goal) until the next goal is chosen. */
export function meetGoal(s:IdpState2,goalId:string,now:number):IdpState2{
 const g=s.plan?.goals.find(x=>x.goalId===goalId);if(!s.plan||!g)return s;
 const goals=s.plan.goals.filter(x=>x!==g);
 return {...s,history:[...s.history,closeRecord(s,g,now,'met')].slice(-HISTORY_KEPT),plan:goals.length?{...s.plan,goals}:{...s.plan,goals:[]}};
}
export function removeGoal(s:IdpState2,goalId:string,now:number):IdpState2{
 const g=s.plan?.goals.find(x=>x.goalId===goalId);if(!s.plan||!g)return s;
 return {...s,history:[...s.history,closeRecord(s,g,now,'changed')].slice(-HISTORY_KEPT),plan:{...s.plan,goals:s.plan.goals.filter(x=>x!==g)}};
}
export function endPlan2(s:IdpState2,now:number):IdpState2{return {...closeAll(s,now,'ended'),plan:null};}
export const reviewDue2=(p:Plan2,now:number)=>now>=p.reviewAt;
export const daysUntil=(at:number,now:number)=>Math.max(0,Math.ceil((at-now)/DAY));
/** A plan with no open goals (just after a celebration) is waiting for its next goal. */
export const needsNextGoal=(s:IdpState2)=>!!s.plan&&s.plan.goals.length===0;
export const formatOf=(s:IdpState2):Format=>{const g=s.plan?.goals[0];return g?goalById(g.goalId)!.format:s.format;};
