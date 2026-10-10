'use client';
/**
 * Picking a goal (docs/idp/DESIGN.md §10): two taps.
 *   1 "What do you want to get better at?"  tap an "I can…" goal (that tap is the choice: no separate Next)
 *   2 "Who helped you pick?"                  just me / me and my coach / me and a grown-up (the plan is co-created, and this
 *                                             tap saves it)
 * The same two screens make the first plan, add a second goal, pick the next goal after a celebration or a review, and swap
 * a goal. A strength is optional and lives on the plan's home ("I'm good at…"), not in the way of starting.
 */
import {useState} from 'react';
import {IDP_FORMATS,goalById,goalsFor,type IdpGoal} from '@/lib/coaches/idp';
import type {Format} from '@/lib/town/venues';
import {SKILLS} from '@/lib/coaches/idp/skills';
import {addGoal,removeGoal,startPlan,type GoalSource,type IdpState2} from '@/lib/coaches/idp/store';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {SkillGlyph} from './Art';
import {Footer,Screen} from './Nav';
import s from './Idp.module.css';

/** first: no plan yet · add: a second goal · next: after a goal is met or reviewed · change: swap `changeId` for another. */
export type PickMode='first'|'add'|'next'|'change';
const TITLE:Record<PickMode,string>={first:'What do you want to get better at?',add:'Pick a second goal',next:'Pick your next goal',change:'Pick a new goal'};
const WHO:[GoalSource,string][]=[['me','Just me'],['together','Me and my coach'],['together','Me and a grown-up']];

export default function PlanBuilder({state,commit,mode,changeId,onDone,onCancel}:{state:IdpState2;commit:(s:IdpState2)=>void;mode:PickMode;changeId?:string;onDone:()=>void;onCancel?:()=>void}){
 const [format,setFormat]=useState<Format>(state.format);
 const [picked,setPicked]=useState<IdpGoal|null>(null);
 const current=new Set((state.plan?.goals??[]).map(g=>g.goalId));
 const met=new Set(state.history.filter(h=>h.outcome==='met').map(h=>h.goalId));
 const options=goalsFor(format).filter(g=>!current.has(g.id)).sort((a,b)=>Number(met.has(a.id))-Number(met.has(b.id)));
 const finish=(source:GoalSource)=>{if(!picked)return;const now=Date.now();
  if(mode==='first'||!state.plan){commit(startPlan({...state,format},[picked.id],source,now,state.plan?.strength));countIdp('set');}
  else{const base=mode==='change'&&changeId?removeGoal(state,changeId,now):state;commit(addGoal(base,{goalId:picked.id,source},now));countIdp('goal');}
  onDone();};
 if(picked)return <div className={s.idp} data-idp-builder data-step="who">
  <Screen key="who" id="idp-pick-who" kicker="Your goal" title="Who helped you pick?">
   <div className={s.goalCard}>
    <div className={s.goalTop}><span className={s.canGlyph}><SkillGlyph skill={picked.skill} size={26}/></span><div><p className={s.ican}>{picked.ican}</p></div></div>
    <p className={s.why}>{picked.why}</p>
   </div>
   <div className={s.whoGrid}>{WHO.map(([src,label])=><button key={label} type="button" className={s.whoBtn} data-who={label} onClick={()=>finish(src)}>{label}</button>)}</div>
   <Footer back={()=>setPicked(null)}/>
  </Screen>
 </div>;
 const replacing=mode==='change'&&changeId?goalById(changeId):undefined;
 return <div className={s.idp} data-idp-builder data-step="pick">
  <Screen key="pick" id="idp-pick" kicker={mode==='first'?'Let’s make your plan':replacing?`Instead of “${replacing.ican}”`:undefined} title={TITLE[mode]}>
   <div className={s.formatRow} role="group" aria-label="Which game do you play?"><span aria-hidden="true">I play</span>{IDP_FORMATS.map(f=><button key={f.format} type="button" className={s.chip} aria-pressed={f.format===format} onClick={()=>setFormat(f.format)}>{f.label}</button>)}</div>
   <ul className={s.goalOptions} aria-label="Goals">{options.map(g=><li key={g.id}><button type="button" className={s.goalOption} data-goal-option={g.id} data-corner={g.corner} onClick={()=>setPicked(g)}>
    <span className={s.optGlyph}><SkillGlyph skill={g.skill} size={26}/></span><span><b>{g.ican}</b><small>{SKILLS[g.skill].kid}</small>{met.has(g.id)&&<em>You did this one before</em>}</span></button></li>)}</ul>
   <Footer back={onCancel}/>
  </Screen>
 </div>;
}
