'use client';
/**
 * The /plan landing (lib/coaches/idp/share.ts). Reads location.hash once on open:
 *  - #c=…  a coach's goal: show it in the player's words and offer "Add to my plan" (this device's plan only);
 *  - #p=…  this week's plan for a grown-up's own phone: the same calm week story as the in-game grown-up view.
 * Nothing is fetched or sent. Static DOM; the only motion is the week story's one-shot entry.
 */
import {useEffect,useState} from 'react';
import {goalById} from '@/lib/coaches/idp';
import {SKILLS} from '@/lib/coaches/idp/skills';
import {fromDayNumber,readFragment} from '@/lib/coaches/idp/share';
import {MAX_GOALS,addGoal,loadIdp2,saveIdp2,type IdpState2} from '@/lib/coaches/idp/store';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {SkillGlyph} from './Art';
import {WeekStory} from './GrownUpWeek';
import s from './Idp.module.css';
import page from './PlanLink.module.css';

type View=ReturnType<typeof readFragment>|{kind:'loading'};
export default function PlanLink(){
 const [view,setView]=useState<View>({kind:'loading'});
 const [state,setState]=useState<IdpState2|null>(null),[replace,setReplace]=useState<string|undefined>(),[added,setAdded]=useState(false);
 useEffect(()=>{const r=readFragment(window.location.hash);setView(r);if(r.kind==='coach'){const st=loadIdp2();setState(st);if(st.plan&&st.plan.goals.length>=MAX_GOALS)setReplace(st.plan.goals[st.plan.goals.length-1].goalId);}if(r.kind==='week')countIdp('week');},[]);
 return <main className={page.page}><div className={page.card}>
  <header className={page.head}><span className={page.mark} aria-hidden="true"/><div><p className={page.brand}>Futbol Island</p><h1>{view.kind==='coach'?'Your coach’s goal':view.kind==='week'?'This week’s football plan':'Football plan'}</h1></div></header>
  {view.kind==='loading'&&<p className={s.small}>Opening…</p>}
  {(view.kind==='bad'||view.kind==='none')&&<div className={s.story}><p className={s.lead}>This link doesn’t hold a plan we can read. Ask for the QR code again, or open the plan inside the game.</p><a className={page.link} href="/">Go to Futbol Island</a></div>}
  {view.kind==='coach'&&<div className={s.story} data-coach-link>
   {view.share.goals.map(id=>{const g=goalById(id)!;const sk=SKILLS[g.skill];return <article key={id} className={s.goalCard}>
    <div className={s.row}><span className={s.canGlyph}><SkillGlyph skill={g.skill} size={26}/></span><span className={s.cornerTag} data-corner={g.corner}>{sk.kid}</span></div>
    <h2 className={s.ican}>{g.ican}</h2><p className={s.why}>{g.why}</p>
    <div className={s.tryBand}><b>Try it</b><span>{g.tryIt}</span></div>
    {view.share.cue!==undefined&&<p className={s.coachSays}><b>Coach says:</b> “{sk.cues[view.share.cue]}”</p>}
   </article>;})}
   {added?<div className={s.panel} role="status"><h3 className={s.beatTitle}>Added!</h3><p className={s.lead}>It’s in your plan on this device. Open the Coaches Centre on the island to see your missions.</p><a className={page.link} href="/">Go to my island</a></div>
   :<div className={s.panel}>
    {state?.plan&&state.plan.goals.length>=MAX_GOALS&&!view.share.goals.every(id=>state.plan!.goals.some(g=>g.goalId===id))&&<><h4>You already have two goals. Swap which one?</h4>
     <div className={s.chips} role="group" aria-label="Swap which goal?">{state.plan.goals.map(g=><button key={g.goalId} type="button" className={s.chip} aria-pressed={replace===g.goalId} onClick={()=>setReplace(g.goalId)}>{goalById(g.goalId)!.ican}</button>)}</div></>}
    <p className={s.small}>This saves the goal on this phone or tablet only. Nothing about you is sent anywhere.</p>
    <div className={s.row}><button type="button" className={s.primary} data-add-coach-goal onClick={()=>{let st=loadIdp2();for(const id of view.share.goals)st=addGoal(st,{goalId:id,source:'coach',cue:view.share.cue,play:view.share.play},Date.now(),replace);saveIdp2(st);setState(st);setAdded(true);countIdp('coachadd');}}>Add to my plan</button><a className={page.link} href="/">Not now</a></div>
   </div>}
  </div>}
  {view.kind==='week'&&<><WeekStory week={view.share} reviewAt={view.share.reviewDay?fromDayNumber(view.share.reviewDay):undefined}/>
   <p className={page.note}>This page is made from the QR code’s link only. It holds goal and mission ids, never a name, and nothing about your child is stored on our server.</p></>}
 </div></main>;
}
