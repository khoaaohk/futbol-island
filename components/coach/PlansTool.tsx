'use client';
import {useEffect,useState} from 'react';
import GridDiagram from '@/lib/site/GridDiagram';
import type {CoachDrill,CoachPlan,CoachPlans} from '@/lib/coach/plansData';
import {AGES,type Age} from '@/lib/coach/route';
import type {Words} from '@/lib/coach/words';
import type {Lang} from '@/lib/coach/store';
import c from './coach.module.css';
import t from './tabs.module.css';
/**
 * Practice plans inside the coach app (round 4A, Nov 22 2026; owner: "keep them in the app"; UX audit C7). The same plans as the
 * site's /learn/soccer-practice-plans pages (lib/coach/plansData.ts), fetched once per language when first needed. The list opens at
 * the team's age (lib/coach/route.ts ageFor), the other ages one tap away; a plan shows its clock table, equipment, notes and each
 * drill with its diagram; Start session steps through the parts with a timer (a 1 s interval only while it runs); Print uses the
 * browser's own Print (coach.module.css noPrint). One way back: the header's Back (and the phone's Back) through the URL hash.
 */
const cache:Partial<Record<Lang,CoachPlans>>={};
const pending:Partial<Record<Lang,Promise<CoachPlans>>>={};
function loadPlans(lang:Lang,v:string){
 if(cache[lang])return Promise.resolve(cache[lang]!);
 return pending[lang]??=fetch(`/coach/plans-data/${lang}?v=${v}`).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json() as Promise<CoachPlans>;}).then(d=>{cache[lang]=d;return d;}).finally(()=>{delete pending[lang];});
}
/** The plans in a language: null while loading, 'fail' when the fetch failed (retry() tries again). */
export function usePlans(lang:Lang,v:string){
 const [data,setData]=useState<CoachPlans|null|'fail'>(()=>cache[lang]??null),[tryN,setTry]=useState(0);
 useEffect(()=>{let on=true;if(cache[lang]){setData(cache[lang]!);return;}setData(null);loadPlans(lang,v).then(d=>{if(on)setData(d);},()=>{if(on)setData('fail');});return ()=>{on=false;};},[lang,v,tryN]);
 return {data,retry:()=>setTry(n=>n+1)};
}
/** The plan of the day at an age (Training's feature card): the same one all day, the next one tomorrow. */
export function planOfDay(plans:readonly CoachPlan[],age:Age,day:number){const list=plans.filter(p=>p.age===age);return list.length?list[day%list.length]:plans[0];}
const SCAN=new Set(['scanning']),BOARD=new Set(['small-sided','passing','attacking-1v1','defending-1v1','first-touch','shooting']);
export const boardHref=(lang:Lang)=>`/board?from=coach${lang==='es'?'&lang=es':''}`;
export const scanHref=(lang:Lang)=>`/scan?from=coach${lang==='es'?'&lang=es':''}`;
type Props={w:Words;lang:Lang;version:string;teamAge:Age;age?:Age;plan?:string;run?:boolean;onAge:(a:Age)=>void;onPlan:(slug:string)=>void;onRun:(on:boolean)=>void};
export default function PlansTool(p:Props){
 const {data,retry}=usePlans(p.lang,p.version),w=p.w;
 if(data==='fail')return <div className={c.empty}><p className={c.emptyLine}>{w.plansFail}</p><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={retry}>{w.retry}</button></div>;
 if(!data)return <p className={c.note} aria-live="polite">{w.loadingPlans}</p>;
 const plan=p.plan?data.plans.find(x=>x.slug===p.plan):undefined;
 if(plan&&p.run)return <Session w={w} plan={plan} onEnd={()=>p.onRun(false)}/>;
 if(plan)return <PlanView w={w} lang={p.lang} onRun={p.onRun} plan={plan} drills={data.drills}/>;
 const age=p.age??p.teamAge,list=data.plans.filter(x=>x.age===age);
 return <>
  <h1 className={c.srOnly}>{w.plansTitle}</h1>
  <div className={t.ages} role="tablist" aria-label={w.plansTitle}>{AGES.map(a=><button key={a} type="button" role="tab" aria-selected={a===age} className={t.age} onClick={()=>p.onAge(a)}>{a}{a===p.teamAge&&<small>{w.teamAge}</small>}</button>)}</div>
  <ul className={t.planList}>{list.map((x,i)=>{const d=data.drills[x.drills[1]??x.drills[0]];return <li key={x.slug} className="fi-in" style={{'--i':i} as React.CSSProperties}>
   <button type="button" className={t.planCard} onClick={()=>p.onPlan(x.slug)} data-plan={x.slug}>
    <span className={t.planArt} aria-hidden="true">{d&&<GridDiagram id={`pl-${x.slug}`} scene={d.scene} small light/>}</span>
    <span className={t.planText}><b>{x.name}</b><span>{x.goal}</span><small>{w.minutesN(x.minutes)} · {x.players}</small></span>
   </button></li>;})}</ul>
 </>;
}
function PlanView({w,lang,plan,drills,onRun}:{w:Words;lang:Lang;onRun:(on:boolean)=>void;plan:CoachPlan;drills:Record<string,CoachDrill>}){
 const [open,setOpen]=useState<string|null>(null);
 const clock=(m:number)=>`${m}′`;
 return <article className={t.plan}>
  <h1 className={t.planH1}>{plan.h1}</h1>
  <p className={t.planMeta}>{w.minutesN(plan.minutes)} · {plan.players} · {plan.goal}</p>
  <div className={`${c.btnRow} ${c.noPrint}`}>
   <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>onRun(true)} data-plan-start="">{w.startSession}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>window.print()}>{w.print}</button>
  </div>
  <h2 className={c.h2}>{w.planClock}</h2>
  <ol className={t.clock}>{plan.rows.map((r,i)=><li key={i} data-stage={r.stage}><time>{clock(r.start)}–{clock(r.end)}</time><div><b>{r.activity}</b><span>{r.stage} · {r.purpose}</span></div></li>)}</ol>
  <div className={t.twoCol}>
   <section><h2 className={c.h2}>{w.equipment}</h2><ul className={t.bullets}>{plan.equipment.map(e=><li key={e}>{e}</li>)}</ul></section>
   <section><h2 className={c.h2}>{w.coachNotes}</h2><ul className={t.bullets}>{plan.notes.map(e=><li key={e}>{e}</li>)}</ul></section>
  </div>
  <h2 className={c.h2}>{w.goingBadly}</h2>
  <div className={t.swap}><b>{plan.swap.sign}</b><p>{plan.swap.instead}</p></div>
  <h2 className={`${c.h2} ${c.noPrint}`}>{w.drillsInPlan}</h2>
  <ul className={`${t.drills} ${c.noPrint}`}>{plan.drills.map(slug=>{const d=drills[slug];if(!d)return null;const more=open===slug;
   return <li key={slug} className={t.drill}>
    <div className={t.drillArt}><GridDiagram id={`dr-${slug}`} scene={d.scene} small light/></div>
    <div className={t.drillBody}><b>{d.name}</b><p>{d.desc}</p>
     <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnSmall}`} aria-expanded={more} onClick={()=>setOpen(more?null:slug)}>{w.howItWorks}</button>
     {more&&<><ol className={t.steps}>{d.steps.map(s=><li key={s}>{s}</li>)}</ol><p className={t.cueH}>{w.coachPoints}</p><ul className={t.bullets}>{d.cues.map(s=><li key={s}>{s}</li>)}</ul></>}
     <div className={t.drillLinks}>
      {BOARD.has(d.skill)&&<a className={`${c.btn} ${c.btnSmall}`} href={boardHref(lang)} data-drill-board="">{w.onBoard}</a>}
      {SCAN.has(d.skill)&&<a className={`${c.btn} ${c.btnSmall}`} href={scanHref(lang)} data-drill-scan="">{w.inScan}</a>}
     </div></div>
   </li>;})}</ul>
 </article>;
}
/** The session timer: one part of the plan at a time, its minutes counting down; Next moves on (it never moves on by itself). */
function Session({w,plan,onEnd}:{w:Words;plan:CoachPlan;onEnd:()=>void}){
 const [i,setI]=useState(0),[at,setAt]=useState(()=>Date.now()),[paused,setPaused]=useState<number|null>(null),[now,setNow]=useState(()=>Date.now());
 const done=i>=plan.rows.length,row=plan.rows[Math.min(i,plan.rows.length-1)];
 useEffect(()=>{if(done||paused!=null)return;const id=setInterval(()=>setNow(Date.now()),1000);return ()=>clearInterval(id);},[done,paused]);
 const go=(k:number)=>{setI(k);setAt(Date.now());setNow(Date.now());setPaused(null);};
 const used=((paused??now)-at)/1000,left=Math.round(row.minutes*60-used),over=left<0,abs=Math.abs(left);
 const fmt=`${over?'+':''}${Math.floor(abs/60)}:${String(abs%60).padStart(2,'0')}`;
 if(done)return <div className={t.session} data-session="done"><p className={t.sessBig}>{w.sessionDone}</p><button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={onEnd}>{w.endSession}</button></div>;
 const next=plan.rows[i+1];
 return <div className={t.session} data-session="" data-stage={row.stage}>
  <h1 className={c.srOnly}>{plan.h1}</h1>
  <p className={t.sessStep}>{row.stage} · {w.partOf(i+1,plan.rows.length)}</p>
  <p className={t.sessAct}>{row.activity}</p>
  <p className={t.sessClock} data-over={over?'':undefined} aria-live="off">{fmt}</p>
  <p className={t.sessWhy}>{row.purpose}</p>
  <div className={t.sessBar} aria-hidden="true">{plan.rows.map((r,k)=><i key={k} data-on={k<=i?'':undefined} style={{flexGrow:r.minutes}}/>)}</div>
  {next&&<p className={t.sessNext}>{w.upNext}: <b>{next.activity}</b> · {w.minutesN(next.minutes)}</p>}
  <div className={t.sessBtns}>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} disabled={i===0} onClick={()=>go(i-1)}>{w.prevPart}</button>
   <button type="button" className={`${c.btn} ${c.btnGhost}`} onClick={()=>{if(paused!=null){setAt(a=>a+(Date.now()-paused));setPaused(null);setNow(Date.now());}else setPaused(Date.now());}}>{paused!=null?w.resume:w.pause}</button>
   <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>go(i+1)} data-session-next="">{w.nextPart}</button>
  </div>
  <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnWide}`} onClick={onEnd}>{w.endSession}</button>
 </div>;
}
