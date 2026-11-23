'use client';
import type {ReactNode} from 'react';
import GridDiagram from '@/lib/site/GridDiagram';
import type {Words} from '@/lib/coach/words';
import type {Lang,Store} from '@/lib/coach/store';
import type {Age} from '@/lib/coach/route';
import {planOfDay,usePlans,boardHref,scanHref} from './PlansTool';
import c from './coach.module.css';
import t from './tabs.module.css';
/**
 * The coach app's two tab pages (round 4A, Nov 22 2026; owner: "like the iPhone App Store"): a big feature card on top, then large
 * picture tiles (drawn here in the brand's flat colours, no icons in squares), and on Training a row of cards that scrolls sideways.
 * Game Day is the bold, match-focused one (ink and gold); Training is the bright, playful one (pitch green, sky, gold).
 * Pictures are inline SVG: no image requests, no animation loops (AGENTS.md, phone heat).
 */
type Tile={key:string;name:string;line:string;art:ReactNode;on?:()=>void;href?:string;wide?:boolean};
function Tiles({tiles,cls,intro,from=0}:{tiles:Tile[];cls:string;intro:boolean;from?:number}){
 return <ul className={`${t.tiles} ${cls}`}>{tiles.map((x,i)=>{const body=<><span className={t.art} aria-hidden="true">{x.art}</span><span className={t.tText}><b>{x.name}</b><small>{x.line}</small></span></>;
  return <li key={x.key} data-wide={x.wide?'':undefined} className={intro?'fi-in':undefined} style={intro?{'--i':from+i} as React.CSSProperties:undefined}>
   {x.href?<a className={t.tile} data-tool={x.key} href={x.href} onClick={rememberY}>{body}</a>:<button type="button" className={t.tile} data-tool={x.key} onClick={x.on}>{body}</button>}</li>;})}</ul>;
}
/** The tab page's scroll when a tile leaves for another page (/board, /scan, the field diagrams), restored on the way back. */
export const HOME_Y='fi-coach-home-y';
const rememberY=()=>{try{window.sessionStorage.setItem(HOME_Y,String(window.scrollY));}catch{/* optional */}};
/* ------------------------------------------------------------ the drawings (viewBox 160 x 100) ------------------------------ */
const Pitch=({children,bg='#1d6b55'}:{children?:ReactNode;bg?:string})=><svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill={bg}/>
 <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2"><rect x="10" y="8" width="140" height="84" rx="2"/><path d="M80 8v84"/><circle cx="80" cy="50" r="13"/><rect x="10" y="32" width="16" height="36"/><rect x="134" y="32" width="16" height="36"/></g>{children}</svg>;
const dot=(x:number,y:number,n:string|number,fill='#e9c16b',ink='#14221d')=><g key={`${x}-${y}`}><circle cx={x} cy={y} r="7.5" fill={fill}/><text x={x} y={y+3.4} textAnchor="middle" fontSize="9" fontWeight="800" fill={ink} fontFamily="system-ui,sans-serif">{n}</text></g>;
const ART={
 lineup:<Pitch>{[[22,50,1],[48,26,2],[48,74,3],[70,50,6],[100,30,7],[100,70,8],[124,50,9]].map(([x,y,n])=>dot(x as number,y as number,n))}</Pitch>,
 minutes:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#f5e6c3"/>{[0,1,2,3,4].map(i=><g key={i}><rect x="18" y={14+i*16} width="124" height="9" rx="4.5" fill="#85621f" fillOpacity=".18"/><rect x={18+(i%2)*30} y={14+i*16} width={[70,64,76,60,72][i]} height="9" rx="4.5" fill="#85621f"/></g>)}</svg>,
 subs:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#dfe8fb"/><g fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"><path d="M56 78V24M40 40l16-16 16 16" stroke="#1f5fd1"/><path d="M104 22v54M88 60l16 16 16-16" stroke="#9a3b1c"/></g>{dot(56,86,4,'#1f5fd1','#fff')}{dot(104,12,11,'#9a3b1c','#fff')}</svg>,
 summary:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#e6e3d6"/>{[38,52,46,60,50,56,44].map((h,i)=><rect key={i} x={20+i*18} y={86-h} width="12" height={h} rx="3" fill={i===3?'#14221d':'#4f5b53'} fillOpacity={i===3?1:.55}/>)}</svg>,
 plans:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#ffd9a8"/><rect x="34" y="12" width="92" height="80" rx="8" fill="#fff"/><rect x="62" y="6" width="36" height="14" rx="5" fill="#14221d"/>
  {[0,1,2,3].map(i=><g key={i}><circle cx="50" cy={36+i*15} r="4.5" fill={['#1d6b55','#e9c16b','#3d8bd6','#e2725b'][i]}/><rect x="60" y={33+i*15} width={[50,40,54,34][i]} height="6" rx="3" fill="#14221d" fillOpacity=".7"/></g>)}</svg>,
 scan:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#cfe8ff"/><path d="M80 52 30 18v68z" fill="#fff" fillOpacity=".7"/><path d="M80 52l50-34v68z" fill="#fff" fillOpacity=".35"/>
  {dot(80,52,10,'#14221d','#fff')}<circle cx="34" cy="30" r="9" fill="#e2725b"/><circle cx="128" cy="74" r="9" fill="#1d6b55"/><circle cx="126" cy="26" r="9" fill="#e9c16b"/></svg>,
 board:<Pitch bg="#2d6f39">{dot(36,66,4)}{dot(76,30,8)}{dot(118,58,9)}<g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M42 61 70 35"/><path d="M83 33q30 2 32 18" strokeDasharray="5 5"/></g><path d="m66 33 6 0-1 6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"/></Pitch>,
 fields:<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#d9ebe1"/><g fill="none" stroke="#1d6b55" strokeWidth="3"><rect x="22" y="14" width="116" height="72" rx="3"/><path d="M80 14v72"/><circle cx="80" cy="50" r="12"/></g><path d="M22 94h116" stroke="#14221d" strokeWidth="2"/><path d="M22 90v8M138 90v8" stroke="#14221d" strokeWidth="2"/></svg>,
};
/* ------------------------------------------------------------ Game Day ------------------------------------------------------ */
type GD={w:Words;store:Store;place:number;fmt:string;ready:string;intro:boolean;live:{period:string;clock:string;change:string;team:string}|null;gameDone:boolean;
 onMatch:()=>void;onTool:(k:'team'|'lineup'|'minutes'|'subs'|'summary')=>void;onExample:()=>void};
export function GameDayTab({w,store,place,fmt,ready,intro,live,gameDone,onMatch,onTool,onExample}:GD){
 const s=store.settings,team=store.team,has=team.players.length>0,name=team.name||w.teamN(place);
 return <div className={t.gameday} data-tab-page="gameday">
  <h1 className={c.srOnly}>{w.navGameDay}</h1>
  <section className={`${t.feature} ${t.featureGame} ${intro?'fi-in':''}`} aria-labelledby="gd-feature" data-live={live?'':undefined}>
   <p className={t.fKicker} id="gd-feature">{live?w.gameOn:w.nextGame}</p>
   <p className={t.fTitle}>{name}</p>
   {live?<p className={t.fLive}><span className={t.liveDot} aria-hidden="true"/>{live.period}{live.clock&&<> · <b>{live.clock}</b></>}{live.change&&<> · {live.change}</>}</p>
    :<p className={t.fMeta}>{fmt} · {s.periods} × {s.periodMin} {w.min}{has?<> · {ready}</>:null}</p>}
   {has||live?<div className={t.fBtns}>
     <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={onMatch} data-coach-match="">{live?w.backToGame:w.startMatch}</button>
     {!live&&<button type="button" className={`${c.btn} ${t.fGhost}`} onClick={()=>onTool('team')}>{w.editSquad}</button>}
    </div>
    :<><p className={t.fMeta}>{w.homeEmpty}</p><div className={t.fBtns}><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>onTool('team')}>{w.setupTeam}</button>
     <button type="button" className={`${c.btn} ${t.fGhost}`} onClick={onExample}>{w.tryExample}</button></div></>}
   {gameDone&&!live&&<button type="button" className={t.fLink} onClick={()=>onTool('summary')}>{w.gameDone} · {w.seeSummary}</button>}
  </section>
  <h2 className={t.h2}>{w.gdMore}</h2>
  <Tiles intro={intro} from={1} cls={t.tilesGame} tiles={[
   {key:'lineup',name:w.titleLineup,line:w.lineLineup,art:ART.lineup,on:()=>onTool('lineup'),wide:true},
   {key:'minutes',name:w.titleMinutes,line:w.lineMinutes,art:ART.minutes,on:()=>onTool('minutes')},
   {key:'subs',name:w.titleSubs,line:w.lineSubs,art:ART.subs,on:()=>onTool('subs')},
   {key:'summary',name:w.titleSummary,line:w.lineSummary,art:ART.summary,on:()=>onTool('summary'),wide:true}]}/>
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </div>;
}
/* ------------------------------------------------------------ Training ------------------------------------------------------ */
type TR={w:Words;lang:Lang;version:string;age:Age;intro:boolean;onPlans:(plan?:string,run?:boolean)=>void};
export function TrainingTab({w,lang,version,age,intro,onPlans}:TR){
 const {data}=usePlans(lang,version);
 const plans=data&&data!=='fail'?data:null,day=Math.floor(Date.now()/864e5),plan=plans?planOfDay(plans.plans,age,day):null;
 const fields=lang==='es'?'/es/tools/soccer-field-diagrams':'/tools/soccer-field-diagrams';
 return <div className={t.training} data-tab-page="training">
  <h1 className={c.srOnly}>{w.navTraining}</h1>
  <section className={`${t.feature} ${t.featureTrain} ${intro?'fi-in':''}`} aria-labelledby="tr-feature">
   <div className={t.fArt} aria-hidden="true">{plan&&plans?.drills[plan.drills[1]??plan.drills[0]]?<GridDiagram id="tr-feature-art" scene={plans.drills[plan.drills[1]??plan.drills[0]].scene} small/>:ART.plans}</div>
   <p className={t.fKicker} id="tr-feature">{w.tonight} · {age}</p>
   <p className={t.fTitle}>{plan?plan.name:w.plansTitle}</p>
   <p className={t.fMeta}>{plan?<>{w.minutesN(plan.minutes)} · {plan.goal}</>:data==='fail'?w.plansFail:w.loadingPlans}</p>
   <div className={t.fBtns}>
    <button type="button" className={`${c.btn} ${t.fInk}`} disabled={!plan} onClick={()=>plan&&onPlans(plan.slug)} data-tonight-open="">{w.openPlan}</button>
    <button type="button" className={`${c.btn} ${c.btnGold}`} disabled={!plan} onClick={()=>plan&&onPlans(plan.slug,true)}>{w.startSession}</button>
   </div>
  </section>
  {plan&&plans&&<><h2 className={t.h2}>{w.inTonight}</h2>
   <ul className={t.rail} aria-label={w.inTonight}>{plan.drills.map(slug=>{const d=plans.drills[slug];return d?<li key={slug}><button type="button" className={t.railCard} onClick={()=>onPlans(plan.slug)}>
    <span className={t.railArt} aria-hidden="true"><GridDiagram id={`rail-${slug}`} scene={d.scene} small/></span><b>{d.name}</b></button></li>:null;})}</ul></>}
  <h2 className={t.h2}>{w.trMore}</h2>
  <Tiles intro={intro} from={1} cls={t.tilesTrain} tiles={[
   {key:'plans',name:w.plansTitle,line:w.lineDrills,art:ART.plans,on:()=>onPlans(),wide:true},
   {key:'scan',name:w.scanName,line:w.lineScan,art:ART.scan,href:scanHref(lang)},
   {key:'board',name:w.boardName,line:w.lineBoard,art:ART.board,href:boardHref(lang)},
   {key:'fields',name:w.fieldDiagrams,line:w.lineFieldDiagrams,art:ART.fields,href:fields,wide:true}]}/>
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </div>;
}
