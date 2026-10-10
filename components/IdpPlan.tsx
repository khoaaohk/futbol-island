'use client';
/**
 * Football plan (the Individual Development Plan, v2; simplified Oct 10 2026, docs/idp/DESIGN.md §10). Two areas, no tabs:
 *  - the player's plan   pick a goal → practise → check in (components/idp/PlayerPlan.tsx, PlanBuilder, Review, Celebrate)
 *  - grown-ups & coaches one list of tools, one per screen (components/idp/GrownUpHub.tsx, lazy): this week at home, the
 *                        fridge card, talk it through, cheers and notes, give a goal by QR
 * Gate (user decision, Oct 10 2026): only the grown-up tools are gated. The kid's plan opens WITHOUT the ParentGate (Coaches Centre);
 * "For grown-ups and coaches" (fridge card, notes, coach QR, week page, change / end plan) asks the ParentGate first. For
 * grown-ups opens the tools with audience 'grownup', already behind its own gate.
 * Saved on this device; the plan's ids and picture choices can travel with a save code, typed words never do
 * (lib/coaches/idp/store.ts). No accounts, no ranking.
 * Heat: static DOM; entry motion is finite CSS (transform/opacity); no rAF, timers or polling (tests/coaches-idp-browser.cjs).
 */
import {useEffect,useState} from 'react';
import dynamicImport from 'next/dynamic';
import {endPlan2} from '@/lib/coaches/idp/store';
import PlayerPlan,{type PlayerScreen} from './idp/PlayerPlan';
import {useIdpState,useIslandSaves} from './idp/useIdp';
import ParentGate from './ParentGate';
import styles from './IdpPlan.module.css';

const GrownUpHub=dynamicImport(()=>import('./idp/GrownUpHub'),{ssr:false});
export type IdpAudience='player'|'grownup'|'coach';

export default function IdpPlan({onLaunch,audience='player'}:{onLaunch:()=>void;audience?:IdpAudience}){
 const {state,commit,text,commitText,ready}=useIdpState();
 const saves=useIslandSaves();
 const [area,setArea]=useState<'player'|'grown'>(audience==='player'?'player':'grown');
 const [entry,setEntry]=useState<{screen?:PlayerScreen;n:number}>({n:0});
 const [now,setNow]=useState(0);
 // "Now" is read when the plan opens and after each change (no clock ticking in the background).
 useEffect(()=>{setNow(Date.now());},[state]);
 useEffect(()=>{setArea(audience==='player'?'player':'grown');},[audience]);
 if(!ready||!now)return <div className={styles.plan} aria-busy="true"/>;
 const toPlayer=(screen?:PlayerScreen)=>{setEntry(e=>({screen,n:e.n+1}));setArea('player');};
 const goals=state.plan?.goals??[];
 const hub=<GrownUpHub state={state} commit={commit} text={text} commitText={commitText} now={now} onBack={()=>toPlayer()}
  onChangeGoal={()=>toPlayer(goals.length?{kind:'pick',mode:'change',changeId:goals[0].goalId}:{kind:'pick',mode:'next'})}
  onEnd={()=>commit(endPlan2(state,Date.now()))}/>;
 return <div className={styles.plan} data-idp-plan data-idp-area={area}>
  {area==='player'
   ?<PlayerPlan key={entry.n} state={state} commit={commit} text={text} commitText={commitText} saves={saves} now={now} onLaunch={onLaunch} initial={entry.screen} onGrownUps={()=>setArea('grown')}/>
   :audience==='player'?<ParentGate.Guard reason="These tools are for a parent, carer or coach." onCancel={()=>toPlayer()}>{hub}</ParentGate.Guard>:hub}
 </div>;
}
