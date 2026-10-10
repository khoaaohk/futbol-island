'use client';
/**
 * Individual Development Plan, v2 (Oct 9 2026; docs/idp/DESIGN.md). One plan, three views:
 *  - My plan     the player's story (components/idp/PlayerStory.tsx), or making the plan together (PlanBuilder)
 *  - Grown-ups   this week's story, conversation starters, 10 minutes at home, the fridge card (GrownUpWeek, lazy)
 *  - Coach       review, notes, "give a goal by QR", a Play–Practice–Play session (CoachTools, lazy)
 * It sits behind the ParentGate where it is opened (Coaches Centre, For grown-ups). Saved on this device; the plan's ids and
 * picture choices can travel with a save code, typed words never do (lib/coaches/idp/store.ts). No accounts, no ranking.
 * Heat: static DOM; entry motion is finite CSS / Web Animations; no rAF, timers or polling (tests/coaches-idp-browser.cjs).
 */
import {useEffect,useState} from 'react';
import dynamicImport from 'next/dynamic';
import {endPlan2} from '@/lib/coaches/idp/store';
import type {BeatId} from '@/lib/coaches/idp/journey';
import PlayerStory from './idp/PlayerStory';
import PlanBuilder from './idp/PlanBuilder';
import {useIdpState,useIslandSaves} from './idp/useIdp';
import styles from './IdpPlan.module.css';

const GrownUpWeek=dynamicImport(()=>import('./idp/GrownUpWeek'),{ssr:false});
const CoachTools=dynamicImport(()=>import('./idp/CoachTools'),{ssr:false});
export type IdpAudience='player'|'grownup'|'coach';
const TABS:{id:IdpAudience;label:string}[]=[{id:'player',label:'My plan'},{id:'grownup',label:'Grown-ups'},{id:'coach',label:'Coach'}];

export default function IdpPlan({onLaunch,audience='player'}:{onLaunch:()=>void;audience?:IdpAudience}){
 const {state,commit,text,commitText,ready}=useIdpState();
 const saves=useIslandSaves();
 const [tab,setTab]=useState<IdpAudience>(audience);
 const [building,setBuilding]=useState(false),[beat,setBeat]=useState<BeatId|undefined>();
 const [now,setNow]=useState(0);
 // "Now" is read when the plan opens and after each change (no clock ticking in the background).
 useEffect(()=>{setNow(Date.now());},[state]);
 useEffect(()=>{setTab(audience);},[audience]);
 if(!ready||!now)return <div className={styles.plan} aria-busy="true"/>;
 const rebuild=()=>{setTab('player');setBuilding(true);};
 return <div className={styles.plan} data-idp-plan data-idp-tab={tab}>
  <div className={styles.tabs} role="tablist" aria-label="Who is looking?">{TABS.map(t=><button key={t.id} type="button" role="tab" id={`idp-tab-${t.id}`} aria-controls="idp-tabpanel" aria-selected={tab===t.id} className={styles.tab} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>
  <div id="idp-tabpanel" role="tabpanel" aria-labelledby={`idp-tab-${tab}`}>
   {tab==='player'&&(!state.plan||building
    ?<PlanBuilder state={state} commit={commit} onDone={()=>{setBuilding(false);setBeat('goal');}} onCancel={state.plan?()=>setBuilding(false):undefined}/>
    :<PlayerStory key={state.plan.setAt+(beat??'')} state={state} commit={commit} saves={saves} onLaunch={onLaunch} now={now} onRebuild={()=>setBuilding(true)} initialBeat={beat}/>)}
   {tab==='grownup'&&<GrownUpWeek state={state} commit={commit} text={text} commitText={commitText} now={now} onRebuild={rebuild} onEnd={()=>commit(endPlan2(state,Date.now()))}/>}
   {tab==='coach'&&<CoachTools state={state} commit={commit} text={text} commitText={commitText} now={now}/>}
  </div>
  <p className={styles.local}>Saved on this device. With a save code, the plan’s choices travel with the island; anything typed stays here. No accounts, and nothing is sent to anyone.</p>
 </div>;
}
