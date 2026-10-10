'use client';
/**
 * "For grown-ups and coaches" (docs/idp/DESIGN.md §10): one short list, one tool per screen, each with Back bottom left.
 *   This week at home · Print the fridge card · Talk it through (the six-week review) · Cheers and notes · Coach: give a goal
 *   by QR · then "Change the goal" / "End this plan".
 * Opened from the player's plan ("For grown-ups and coaches": IdpPlan asks the ParentGate first; the kid's plan itself is not
 * gated, user decision Oct 10 2026) or straight from For grown-ups (already behind its gate). Lazy-loaded by IdpPlan.
 */
import {useEffect,useMemo,useState} from 'react';
import {FEELS} from '@/lib/coaches/idp/skills';
import {daysUntil,reviewDue2,type IdpState2,type IdpText} from '@/lib/coaches/idp/store';
import {goalsOf} from '@/lib/coaches/idp/journey';
import {countIdp} from '@/lib/coaches/idp/analytics';
import {Icon} from '../Icon';
import CoachTools from './CoachTools';
import Review from './Review';
import {FridgeScreen,NotesScreen,WeekScreen} from './GrownUpWeek';
import {Footer,Screen} from './Nav';
import s from './Idp.module.css';

type HubScreen='hub'|'week'|'fridge'|'review'|'notes'|'coach';
const day=(at:number)=>new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric'});

export default function GrownUpHub({state,commit,text,commitText,now,onBack,onChangeGoal,onEnd}:{state:IdpState2;commit:(s:IdpState2)=>void;text:IdpText;commitText:(t:IdpText)=>void;now:number;
 onBack:()=>void;onChangeGoal:()=>void;onEnd:()=>void}){
 const [screen,setScreen]=useState<HubScreen>('hub'),[status,setStatus]=useState<string|null>(null),[confirmEnd,setConfirmEnd]=useState(false);
 useEffect(()=>{countIdp('grown');},[]);
 const hub=(msg:string|null=null)=>{setStatus(msg);setScreen('hub');};
 const plan=state.plan,goals=plan?goalsOf(plan):[];
 const helpAsks=useMemo(()=>(plan?.checkins??[]).filter(c=>c.help).slice(-3).reverse(),[plan]);
 let body;
 if(screen==='week')body=<WeekScreen state={state} now={now} onBack={()=>hub()}/>;
 else if(screen==='fridge')body=<FridgeScreen state={state} now={now} onBack={()=>hub()}/>;
 else if(screen==='notes')body=<NotesScreen state={state} commit={commit} text={text} commitText={commitText} onBack={()=>hub()}/>;
 else if(screen==='coach')body=<CoachTools state={state} commit={commit} onBack={()=>hub()}/>;
 else if(screen==='review'&&plan)body=<Review state={state} commit={commit} now={now} onBack={()=>hub()} onDone={o=>{if(o==='keep')hub('Review saved. The next one is in six weeks.');else onChangeGoal();}}/>;
 else{
  const due=plan?reviewDue2(plan,now):false;
  const tiles:{id:HubScreen;icon:string;title:string;sub:string;due?:boolean}[]=[
   ...(plan&&goals.length?[{id:'week' as const,icon:'home',title:'This week at home',sub:'What to ask, and 10 minutes of practice together'},
    {id:'fridge' as const,icon:'clipboard',title:'Print the fridge card',sub:'One page, with a QR for your phone'},
    {id:'review' as const,icon:'people',title:'Talk it through',sub:due?'Due now: the six-week review':`The six-week review, in ${daysUntil(plan.reviewAt,now)} days`,due}]:[]),
   ...(plan?[{id:'notes' as const,icon:'heart',title:'Cheers and notes',sub:'Send a cheer; private notes stay on this device'}]:[]),
   {id:'coach',icon:'target',title:'Coach: give a goal by QR',sub:'For one player or the whole team'}];
  body=<Screen id="idp-hub" kicker="Football plan" title="Grown-ups and coaches" data-grown-hub>
   {status&&<p className={s.savedNote} role="status">{status}</p>}
   <div className={s.panel}>
    {goals.length?<p className={s.lead}>Your player is working on {goals.map(({goal},i)=><span key={goal.id}>{i?' and ':''}<b>“{goal.ican}”</b></span>)}.</p>
    :<p className={s.lead}>No goal yet. Open the plan together: it takes a minute, and your player chooses.</p>}
    {helpAsks.length>0&&<p className={s.wHelp}><b>They asked for some help</b> ({helpAsks.map(c=>`${day(c.at)}, ${FEELS[c.feel].kid.toLowerCase()}`).join('; ')}). A good moment for a quiet word.</p>}
   </div>
   <ul className={s.tiles}>{tiles.map(t=><li key={t.id}><button type="button" className={s.tile} data-hub-tile={t.id} data-due={t.due||undefined} onClick={()=>{setStatus(null);setScreen(t.id);}}>
    <span className={s.tileIcon} aria-hidden="true"><Icon name={t.icon} size={24}/></span><span><b>{t.title}</b><small>{t.sub}</small></span></button></li>)}</ul>
   {plan&&<div className={s.panel}>
    {confirmEnd?<div className={s.confirm} role="alertdialog" aria-labelledby="idp-end-q"><p id="idp-end-q"><b>End this plan?</b> The goals move to its history. Notes stay on this device.</p>
     <div className={s.row}><button type="button" className={s.ghost} autoFocus onClick={()=>setConfirmEnd(false)}>Keep the plan</button><button type="button" className={s.primary} onClick={()=>{setConfirmEnd(false);onEnd();}}>End plan</button></div></div>
    :<div className={s.row}><button type="button" className={s.textBtn} onClick={onChangeGoal}>Change the goal together</button><button type="button" className={s.textBtn} onClick={()=>setConfirmEnd(true)}>End this plan</button></div>}
   </div>}
   <p className={s.local}>Saved on this device. With a save code, the plan’s choices travel with the island; anything typed stays here. No accounts, and nothing is sent to anyone.</p>
   <Footer back={onBack} backLabel="My plan"/>
  </Screen>;
 }
 return <div className={s.idp} data-grown-area>{body}</div>;
}
