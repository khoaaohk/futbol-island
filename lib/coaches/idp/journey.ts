/**
 * The story data behind the player's plan (docs/idp/DESIGN.md §2.3): pure functions that turn the plan, the island saves and
 * the clock into beats. Everything here only counts UP ("practice moments", "stops on the path"); nothing becomes a score,
 * a level or a comparison. Lesson and arcade evidence means "explored on the island", never "can do it on the pitch".
 */
import type {Format} from '../../town/venues';
import {goalById,homeworkStatus,type IdpGoal} from '../idp';
import {ARCADE_NAMES,SKILLS,type ArcadeId,type FeelId,type LinkKind,type Mission,type Skill} from './skills';
import {DAY,practiceCount,type IdpState2,type Plan2,type PlanGoal} from './store';

/** Monday 00:00 local time of the week containing `now`. */
export function weekStart(now:number){const d=new Date(now);d.setHours(0,0,0,0);const dow=(d.getDay()+6)%7;return d.getTime()-dow*DAY;}

/** This week's missions: one goal → its three; two goals → two from one and one from the other, alternating weekly. */
export function weekMissions(plan:Plan2,now:number):{mission:Mission;goal:IdpGoal;skill:Skill}[]{
 const goals=plan.goals.map(g=>goalById(g.goalId)!).filter(Boolean);if(!goals.length)return [];
 const week=Math.max(0,Math.round((weekStart(now)-weekStart(plan.setAt))/(7*DAY)));
 const pick=(g:IdpGoal,n:number,offset:number)=>{const ms=SKILLS[g.skill].missions;return Array.from({length:n},(_,i)=>({mission:ms[(i+offset)%3],goal:g,skill:SKILLS[g.skill]}));};
 if(goals.length===1)return pick(goals[0],3,0);
 const [a,b]=week%2?[goals[1],goals[0]]:[goals[0],goals[1]];
 return [...pick(a,2,week%3),...pick(b,1,(week+2)%3)];
}
export const doneThisWeek=(plan:Plan2,missionId:string,goalId:string,now:number)=>plan.missions.some(m=>m.id===missionId&&m.goalId===goalId&&m.at>=weekStart(now));

export type Evidence={kind:LinkKind;key:string;label:string;detail:string;done:boolean;
 /** What tapping it opens. */
 open:{kind:'lesson';format:Format;lessonId:string}|{kind:'arcade';game:ArcadeId}|{kind:'card';name:string}|{kind:'story';format:Format}};
export type IslandSaves={steps:ReadonlySet<string>;answers:ReadonlySet<string>;arcadePlayed:ReadonlySet<ArcadeId>;cards:ReadonlySet<string>;stories:ReadonlySet<string>};

/** The island things that train a goal, with what this device has explored. */
export function goalEvidence(goal:IdpGoal,saves:IslandSaves):Evidence[]{
 const skill=SKILLS[goal.skill],out:Evidence[]=[];
 for(const l of homeworkStatus(goal,saves.steps,saves.answers).lessons)out.push({kind:'lesson',key:'l:'+l.lesson.id,label:l.lesson.name,detail:l.complete?'Lesson done':'Island lesson',done:l.complete,open:{kind:'lesson',format:goal.format,lessonId:l.lesson.id}});
 if(skill.arcade)out.push({kind:'arcade',key:'a:'+skill.arcade,label:ARCADE_NAMES[skill.arcade].name,detail:saves.arcadePlayed.has(skill.arcade)?'Played':'Arcade game',done:saves.arcadePlayed.has(skill.arcade),open:{kind:'arcade',game:skill.arcade}});
 if(skill.card)out.push({kind:'card',key:'c:'+skill.card.name,label:skill.card.name,detail:skill.card.role+' card',done:saves.cards.has(skill.card.name),open:{kind:'card',name:skill.card.name}});
 if(skill.story)out.push({kind:'story',key:'s:'+skill.story.id,label:skill.story.title,detail:saves.stories.has(skill.story.id)?'Story watched':'Story',done:saves.stories.has(skill.story.id),open:{kind:'story',format:skill.story.format}});
 return out;
}
/** Where a mission's link goes for this goal (the goal's own format-specific lesson first). */
export function missionTarget(m:Mission,goal:IdpGoal,saves?:IslandSaves):Evidence|undefined{
 const ev=goalEvidence(goal,saves??{steps:new Set(),answers:new Set(),arcadePlayed:new Set(),cards:new Set(),stories:new Set()});
 return ev.find(e=>e.kind===m.link)??ev[0];
}

/** Ring pieces for a goal: one per practice moment (missions done, tries checked in, island lessons finished). Only grows. */
export const RING_PIECES=12;
export function goalGrowth(plan:Plan2,goal:IdpGoal,saves:IslandSaves){
 const lessons=homeworkStatus(goal,saves.steps,saves.answers).done;
 const missions=plan.missions.filter(m=>m.goalId===goal.id).length,tries=plan.checkins.filter(c=>c.goalId===goal.id&&c.feel!=='nochance').length;
 const moments=missions+tries+lessons;
 return {moments,missions,tries,lessons,pieces:Math.min(RING_PIECES,moments)};
}
/** "Ready to celebrate" needs a few real practice moments, so a tap-through can't skip the trying. */
export const READY_MOMENTS=3;
export const readyToCelebrate=(plan:Plan2,goal:IdpGoal,saves:IslandSaves)=>goalGrowth(plan,goal,saves).moments>=READY_MOMENTS;

/** Stops on the journey path: dated moments, oldest first (the last `max`). */
export type Stop={at:number;kind:'start'|'mission'|'checkin'|'proud'|'cheer'|'review';label:string;goalId?:string};
export function journeyStops(state:IdpState2,max=10):Stop[]{
 const p=state.plan;if(!p)return [];
 const start:Stop={at:p.setAt,kind:'start',label:'Plan started'},stops:Stop[]=[];
 for(const m of p.missions)stops.push({at:m.at,kind:'mission',label:'Mission done',goalId:m.goalId});
 for(const c of p.checkins)stops.push({at:c.at,kind:'checkin',label:'Checked in',goalId:c.goalId});
 for(const x of p.proud)stops.push({at:x.at,kind:'proud',label:'Proud moment',goalId:x.goalId});
 for(const x of p.cheers)stops.push({at:x.at,kind:'cheer',label:'A cheer'});
 for(const r of p.reviews)stops.push({at:r.at,kind:'review',label:'Talked it through'});
 stops.sort((a,b)=>a.at-b.at);
 // The start is always the first stop (a moment logged with an earlier clock still sits after it).
 return [start,...stops.slice(-(max-1))];
}
/** How trying felt over time: 0 still tricky, 1 getting there, 2 I can. "No chance" is left out (it isn't a feeling about the skill). */
export const FEEL_LEVEL:Record<Exclude<FeelId,'nochance'>,number>={tricky:0,getting:1,cando:2};
export function feelLine(plan:Plan2,goalId:string,max=8){
 return plan.checkins.filter(c=>c.goalId===goalId&&c.feel!=='nochance').slice(-max).map(c=>({at:c.at,feel:c.feel,level:FEEL_LEVEL[c.feel as keyof typeof FEEL_LEVEL]}));
}
/** This week's numbers for the grown-up story (counts of the child's own actions; never compared with anyone). */
export function weekSummary(state:IdpState2,now:number){
 const p=state.plan,since=weekStart(now);if(!p)return {missions:0,checkins:0,proud:[],help:false,latestFeel:undefined as FeelId|undefined};
 const checkins=p.checkins.filter(c=>c.at>=since);
 return {missions:p.missions.filter(m=>m.at>=since).length,checkins:checkins.length,proud:p.proud.filter(x=>x.at>=since).map(x=>x.sticker),
  help:checkins.some(c=>c.help),latestFeel:checkins.at(-1)?.feel};
}
/** Total practice moments across the plan's open goals (for review and the grown-up summary). */
export const planMoments=(p:Plan2)=>p.goals.reduce((n,g)=>n+practiceCount(p,g.goalId),0);
/** Which beat the story opens on: celebrate/next first, then review, else practice (the everyday beat). */
export type BeatId='start'|'goal'|'practice'|'feel'|'next';
export const BEATS:{id:BeatId;label:string}[]=[{id:'start',label:'Start'},{id:'goal',label:'My goal'},{id:'practice',label:'Practise'},{id:'feel',label:'How it feels'},{id:'next',label:'What’s next'}];
export function openingBeat(state:IdpState2,now:number):BeatId{
 const p=state.plan;if(!p)return 'start';
 if(!p.goals.length||now>=p.reviewAt)return 'next';
 if(!p.missions.length&&!p.checkins.length)return 'goal';
 return 'practice';
}
export const goalsOf=(p:Plan2):{pg:PlanGoal;goal:IdpGoal}[]=>p.goals.flatMap(pg=>{const goal=goalById(pg.goalId);return goal?[{pg,goal}]:[];});
