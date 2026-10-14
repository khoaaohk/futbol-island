'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import {ISO_CSS} from '../anatomy/iso-kit';
import type {ExperienceProps} from '../types';
import {exhibitState,galleryOf} from '@/lib/endgame/museum';
import {useMuseumCounts} from '@/lib/museum/useMuseumCounts';
import {museumSfx} from '@/lib/museum/museumSound';
import {passport,useMuseumVisits} from '@/lib/museum/museumVisits';
import {chapterOf,eras} from './eras';
import CoverArt from './CoverArt';
import {CHALLENGES,ERAS_PER_TURN,angleStep,clampN,crankToEras,direction,fracToPos,odometer,posToFrac,projectSnap,rubber,spring,stepSpring,tickXs,velocity,yearsBetween} from './machine';
import {HUB,WHEEL_R,benchCamera,benchItems,carriageItems,markRing,pxPerCase,slide,wheelAngle,wheelHandle} from './bench';
import {dated,toItem,type Item} from './orderRules';
import {useFrameLoop} from '../anatomy/paper-loop';
import {useSize} from '../anatomy/hooks';
import {useReduced} from '../modern/hooks';
import Draw from './Draw';
import Order from './Order';
import Ending from '../modern/Ending';
import {iso} from '../anatomy/iso-kit';
import s from './Experience.module.css';

/**
 * The story of football as a DISPLAY BENCH (Oct 12 2026, anatomy restyle: isometric technical illustration in the Paper theme,
 * one accent (blue); replaces the pixel time machine). The first screen is the game and fills the viewport. On the card: a long
 * bench (bench.ts) with twelve turntable stands, one artifact per museum case; a carriage runs on rails along the front. Turn
 * its HANDWHEEL (drag the handle round) or drag the bench sideways, and the bench slides under the carriage while the big year
 * counter rolls through the real years. Let go and it settles on a case (a flick carries on; past either end it resists).
 * Under the card: the case's label (the year as a big numeral, chapter, title, one fact quoted from the case, how many years
 * later, Visited, "Step inside" (props.onEnter) or "Find it in the hall" (props.onVisit), the lock text), the year rail (a
 * slider showing the real gaps), the Find-it missions (warmer / colder) and the passport.
 * THE GAME, "Order it" (Order.tsx): put dealt cases in order, oldest first, against the clock. Finishing the missions, or a
 * scored round and its check, calls onComplete (once); the shared Ending marks it.
 * Heat: the bench is built once per size and case; ONE frame loop runs only while the bench is moving (a spring or a flick),
 * parks off-screen / in a hidden tab, and is cancelled on unmount; a drag paints straight from pointer events; motion is a
 * transform on the bench and attribute writes on refs (no React render per frame). Reduced motion: it lands at once.
 */
type Mode='intro'|'travel'|'order';
const sfx=(c:'tick'|'click'|'reveal'|'look'|'spin'|'stamp')=>{try{museumSfx[c]();}catch{/* sound is optional */}};
const BEATS=[
 {n:'01',head:'It started with rules',text:'Football wasn’t invented in one go. People wrote rules, changed them, and added new ideas, one at a time.'},
 {n:'02',head:'Turn the wheel',text:'Crank the carriage’s handwheel (or drag the bench) to travel from the first Laws to today. Each stand is a museum case.'},
 {n:'03',head:'Order it',text:'Put the cases in the right order, oldest first, before the clock runs out.'},
] as const;

export default function Experience({exhibit,onClose,onVisit,onEnter,onComplete}:ExperienceProps){
 const list=useMemo(()=>eras(),[]),n=list.length,years=useMemo(()=>list.map(x=>x.exhibit.year),[list]),ids=useMemo(()=>list.map(x=>x.exhibit.id),[list]);
 const xs=useMemo(()=>tickXs(years),[years]);
 const start=Math.max(0,list.findIndex(e=>e.exhibit.id===exhibit.id));
 const reduced=useReduced();
 const [mode,setMode]=useState<Mode>('intro');const modeRef=useRef(mode);modeRef.current=mode;
 const [idx,setIdx]=useState(start);
 const [announce,setAnnounce]=useState('');
 const [quest,setQuest]=useState<{k:number;found:boolean;moved:boolean}>({k:0,found:false,moved:false});const questRef=useRef(quest);questRef.current=quest;
 const counts=useMuseumCounts();
 const visits=useMuseumVisits(),pass=passport(visits),seenSet=new Set(visits.seen);
 const sp=useRef(spring(start)).current,dragging=useRef(false),idxRef=useRef(start),leaving=useRef(false),lastTick=useRef(0);
 const stage=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null),benchG=useRef<SVGGElement>(null),handleG=useRef<SVGGElement>(null),rail=useRef<HTMLDivElement>(null),yearEl=useRef<HTMLSpanElement>(null),readEl=useRef<HTMLSpanElement>(null);
 const size=useSize(stage);
 const completed=useRef(false),complete=useCallback(()=>{if(completed.current)return;completed.current=true;onComplete?.();},[onComplete]);
 const [done,setDone]=useState(false);
 const pool=useMemo<Item[]>(()=>list.filter(x=>dated(x.exhibit)).map(x=>toItem(x.exhibit,x.accent)),[list]);
 const back=useCallback(()=>{if(modeRef.current==='order'){setMode('travel');return;}onClose();},[onClose]);
 const ch=CHALLENGES[quest.k],target=ch?ids.indexOf(ch.id):-1;

 // ---- the bench: built once per size (and per current case, which is lit) ----
 const P=useMemo(()=>size.w>40&&size.h>40?benchCamera(size.w,size.h):null,[size.w,size.h]);
 const bench=useMemo(()=>P?<Draw items={[...benchItems(ids,P,idx),...markRing(P,idx)]}/>:null,[P,ids,idx]);
 const carriage=useMemo(()=>P?<Draw items={carriageItems(P)}/>:null,[P]);
 const [handle,setHandle]=useState(0);// the handle is redrawn only when the wheel turns by a visible step
 const handleItems=useMemo(()=>P?wheelHandle(P,handle):[],[P,handle]);

 // ---- painting from the spring: transforms and text on refs (no React render per frame) ----
 const paintAll=useCallback(()=>{if(!P)return;const [dx,dy]=slide(P,sp.x);benchG.current?.setAttribute('transform',`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
  const a=Math.round((-sp.x*2*Math.PI/ERAS_PER_TURN)*24)/24;setHandle(h=>h===a?h:a);
  const r=rail.current;if(r)r.style.setProperty('--p',posToFrac(clampN(sp.x,0,n-1),xs).toFixed(4));
  const yr=String(odometer(sp.x,years));if(yearEl.current&&yearEl.current.textContent!==yr)yearEl.current.textContent=yr;if(readEl.current)readEl.current.textContent=`Year ${yr}`;
  const i=Math.round(clampN(sp.x,0,n-1));if(i!==idxRef.current){idxRef.current=i;setIdx(i);const t=performance.now();if(t-lastTick.current>60){lastTick.current=t;sfx('tick');}}},[P,sp,n,xs,years]);
 useEffect(()=>{paintAll();},[paintAll,mode]);

 // A case settles: say it once for screen readers and check the mission.
 const rest=useCallback(()=>{const i=Math.round(clampN(sp.x,0,n-1)),x=list[i].exhibit;setAnnounce(`${x.year}: ${x.title}`);
  const q=questRef.current,c=CHALLENGES[q.k];if(c&&!q.found&&x.id===c.id&&modeRef.current==='travel'){setQuest({...q,found:true});sfx('reveal');if(q.k===CHALLENGES.length-1){complete();setDone(true);}}},[sp,n,list,complete]);
 const loop=useFrameLoop(dt=>{if(dragging.current)return false;const settled=stepSpring(sp,dt);paintAll();if(settled)rest();return !settled;},stage,reduced);
 const go=useCallback((to:number)=>{sp.target=clampN(Math.round(to),0,n-1);setQuest(q=>q.moved?q:{...q,moved:true});
  if(reduced){sp.x=sp.target;sp.v=0;paintAll();rest();}else loop.wake();},[sp,n,reduced,loop,paintAll,rest]);
 const step=useCallback((d:number)=>{sfx('click');go(Math.round(sp.target)+d);},[go,sp]);

 // ---- the stage: the handwheel (drag its handle round) or the bench (drag sideways) ----
 const grab=useRef<{mode:'crank'|'slide';id:number;a:number;x0:number;p0:number;s:[number,number][]}|null>(null);
 const local=(e:{clientX:number;clientY:number})=>{const r=svg.current!.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top] as const;};
 const down=(e:RPointerEvent<SVGSVGElement>)=>{if(!P||mode!=='travel'||e.button>0||grab.current)return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  const [x,y]=local(e),[hx,hy]=iso([HUB.x,HUB.y,HUB.z],P),near=Math.hypot(x-hx,y-hy)<Math.max(30,WHEEL_R*1.5*P.scale*1.26);
  dragging.current=true;loop.stop();sp.target=sp.x;sp.v=0;
  grab.current={mode:near?'crank':'slide',id:e.pointerId,a:wheelAngle(P,x,y),x0:x,p0:sp.x,s:[[performance.now(),sp.x]]};setQuest(q=>q.moved?q:{...q,moved:true});};
 const move=(e:RPointerEvent<SVGSVGElement>)=>{const g=grab.current;if(!g||g.id!==e.pointerId||!P)return;const [x,y]=local(e);let raw:number;
  if(g.mode==='crank'){const a=wheelAngle(P,x,y);raw=g.p0+crankToEras(angleStep(g.a,a));if(Math.floor(raw*4)!==Math.floor(g.p0*4))sfx('spin');g.p0=raw;g.a=a;}
  else raw=g.p0-(x-g.x0)/pxPerCase(P);
  sp.x=rubber(raw,n-1);sp.target=sp.x;const t=performance.now();g.s.push([t,raw]);while(g.s.length>2&&t-g.s[0][0]>100)g.s.shift();paintAll();};
 const up=(e:RPointerEvent<SVGSVGElement>)=>{const g=grab.current;if(!g||g.id!==e.pointerId)return;grab.current=null;dragging.current=false;
  const v=g.mode==='crank'?velocity(g.s)*.6:velocity(g.s);
  sp.v=reduced?0:v;sp.target=projectSnap(clampN(sp.x,0,n-1),v,n);if(reduced){sp.x=sp.target;paintAll();rest();}else loop.wake();};
 const onKey=(e:RKeyboardEvent)=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}else if(e.key==='ArrowRight'){e.preventDefault();step(1);}};
 useEffect(()=>{const key=(ev:KeyboardEvent)=>{if(ev.key==='Escape'){ev.preventDefault();back();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[back]);

 // ---- the year rail: a slider (drag, arrows, Home / End) ----
 const rd=useRef<{id:number;rect:DOMRect;s:[number,number][]}|null>(null);
 const railAt=(x:number,r:DOMRect)=>fracToPos(clampN((x-r.left)/r.width,0,1),xs);
 const railDown=(ev:RPointerEvent<HTMLDivElement>)=>{const r=rail.current?.getBoundingClientRect();if(!r)return;try{ev.currentTarget.setPointerCapture(ev.pointerId);}catch{/* fine */}
  dragging.current=true;loop.stop();const p=railAt(ev.clientX,r);rd.current={id:ev.pointerId,rect:r,s:[[performance.now(),p]]};sp.x=sp.target=p;sp.v=0;setQuest(q=>q.moved?q:{...q,moved:true});paintAll();};
 const railMove=(ev:RPointerEvent<HTMLDivElement>)=>{const d=rd.current;if(!d||d.id!==ev.pointerId)return;const p=railAt(ev.clientX,d.rect),t=performance.now();sp.x=sp.target=p;d.s.push([t,p]);while(d.s.length>2&&t-d.s[0][0]>100)d.s.shift();paintAll();};
 const railEnd=(ev:RPointerEvent<HTMLDivElement>)=>{const d=rd.current;if(!d||d.id!==ev.pointerId)return;rd.current=null;dragging.current=false;const v=velocity(d.s)*.5;
  sp.v=reduced?0:v;sp.target=projectSnap(sp.x,v,n);if(reduced){sp.x=sp.target;paintAll();rest();}else loop.wake();};
 const railKey=(ev:RKeyboardEvent)=>{const m:Record<string,number>={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1,PageDown:-3,PageUp:3};
  if(ev.key in m){ev.preventDefault();ev.stopPropagation();step(m[ev.key]);}else if(ev.key==='Home'){ev.preventDefault();go(0);}else if(ev.key==='End'){ev.preventDefault();go(n-1);}};

 // ---- Step inside / Find it in the hall ----
 const visit=(id:string,enter=false)=>{if(leaving.current)return;leaving.current=true;sfx('look');
  if(enter&&onEnter)onEnter(id);else if(onVisit)onVisit(id);else onClose();};

 const e=list[idx].exhibit,chap=chapterOf(e.id),st=counts.ready?exhibitState(e,counts):null,canEnter=!!onEnter&&!!st?.open,seen=seenSet.has(e.id);
 const prev=idx>0?list[idx-1].exhibit:null,later=prev?yearsBetween(prev.year,e.year):null;
 const tx=target>=0?list[target].exhibit:null,since=tx?yearsBetween(list[0].exhibit.year,tx.year):null;
 const dir=direction(idx,target);
 const questLine=!ch?'All three found! From the first Laws in 1863 to the video referee in 2018, football kept changing, one idea at a time.'
  :quest.found&&tx?`Found it! ${tx.title}: ${tx.year}.${since?` That’s ${since} years after the first Laws.`:''}`
  :!quest.moved?`Mission: travel to ${ch.ask}.`
  :dir==='later'?`Find ${ch.ask}: keep going, it’s later →`:dir==='earlier'?`Find ${ch.ask}: go back, it’s earlier ←`:`Find ${ch.ask}: you’re on it!`;
 const nextQuest=()=>{sfx('click');setQuest(q=>q.k>=CHALLENGES.length?{k:0,found:false,moved:false}:{k:q.k+1,found:false,moved:true});};
 const yearNow=String(odometer(sp.x,years));

 return <div className={s.root} data-museum-experience="timeline" role="dialog" aria-modal="true" aria-label="The story of football: a display bench" data-tl-mode={mode} data-reduced={reduced||undefined}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={back}/>
  <div className={s.scroll} data-tl-scroll>
   <div className={s.screen}>
    <header className={s.head}><WallLabel as="h1" title="The story of football" meta={`${list[0].exhibit.year} – Today · six chapters, ${n} cases`}/></header>
    <div className={s.card} data-mode={mode}>
     {mode==='intro'&&<div className={s.cover}>
      <CoverArt ids={ids}/>
      <div className={s.coverText}>
       <p className={s.kicker}>Timeline · the display bench</p>
       <h2 className={s.display}>Crank through football’s story.</h2>
       <p className={s.lead}>From the first written Laws in 1863 to today: twelve cases, six chapters, one bench.</p>
       <ol className={s.beats}>{BEATS.map(b=><li key={b.n}><span>{b.n}</span><div><b>{b.head}</b><p>{b.text}</p></div></li>)}</ol>
       <div className={s.row}><button type="button" className={s.btn} data-museum-own-cue data-tl-start onClick={()=>{sfx('click');setMode('travel');}}>Start the bench</button></div>
      </div>
     </div>}
     <div ref={stage} className={s.stage} hidden={mode!=='travel'}>
      {P&&mode==='travel'&&<svg ref={svg} className={`iso-svg ${s.bench}`} width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} tabIndex={0} role="img" data-tl-stage
       aria-label={`A long display bench with twelve stands. Under the carriage: ${e.title} (${e.year}). Turn the handwheel or drag the bench to travel.`}
       onKeyDown={onKey} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
       <g ref={benchG}>{bench}</g>{carriage}<g ref={handleG}><Draw items={handleItems}/></g></svg>}
      {mode==='travel'&&<div className={s.corners} aria-hidden="true">
       <span data-corner="fig">{chap?`Chapter ${chap.n} · ${chap.title}`:'Timeline'}</span>
       <span data-corner="title">{idx+1} / {n}</span>
       <span data-corner="hint">{reduced?'Drag the bench or tap ◂ ▸':'Turn the handwheel · or drag the bench'}</span>
       <span data-corner="readout" ref={readEl}>Year {yearNow}</span>
      </div>}
     </div>
     {mode==='order'&&<Order pool={pool} reduced={reduced} onFinish={sc=>{if(sc>0)complete();}} onClose={()=>setMode('travel')}/>}
    </div>
    {mode==='travel'&&<div className={s.dock}>
     <div className={s.label} data-tl-era={e.id}>
      <p className={s.year} aria-hidden="true"><span ref={yearEl}>{yearNow}</span></p>
      <div className={s.labelText}>
       {chap&&<p className={s.chapter} data-tl-chapter={chap.n}>Chapter {chap.n} · {chap.title}</p>}
       <h2 className={s.caseTitle}>{e.title} <span>{e.year}</span></h2>
       <p className={s.fact} data-tl-fact>{list[idx].fact}</p>
       <p className={s.meta}><span>{galleryOf(e.gallery).title}</span><span>{idx+1} / {n}</span>{!!later&&<span>{later} years later</span>}{seen&&<em className={s.seen} data-tl-seen={e.id}><i aria-hidden="true"/>Visited</em>}</p>
      </div>
      <div className={s.actions}>
       {canEnter&&<button type="button" className={s.btn} data-museum-own-cue data-tl-enter={e.id} onClick={()=>visit(e.id,true)}>{seen?'See exhibit again':'See exhibit'}</button>}
       <button type="button" className={canEnter?s.ghost:s.btn} data-tl-visit={e.id} onClick={()=>visit(e.id)}>{canEnter?'Find it in the hall':'Visit this case'}</button>
       {st&&!st.open&&<p className={s.lock} data-tl-lock={e.id}>{st.lockText}</p>}
      </div>
     </div>
     <nav className={s.nav} aria-label="Years">
      <button type="button" className={s.stepBtn} data-tl-step="prev" aria-label="Earlier" disabled={idx===0} onClick={()=>step(-1)}>◂</button>
      <div ref={rail} className={s.rail} role="slider" tabIndex={0} aria-label="Year rail" aria-valuemin={0} aria-valuemax={n-1} aria-valuenow={idx} aria-valuetext={`${e.year}: ${e.title}`}
       data-tl-scrubber onKeyDown={railKey} onPointerDown={railDown} onPointerMove={railMove} onPointerUp={railEnd} onPointerCancel={railEnd}>
       <span className={s.railLine} aria-hidden="true"/>
       {list.map((x,i)=><span key={x.exhibit.id} aria-hidden="true" className={s.tick} data-on={i===idx||undefined} data-seen={seenSet.has(x.exhibit.id)||undefined} data-target={i===target&&!quest.found||undefined}
        style={{'--x':xs[i]} as CSSProperties}><i/></span>)}
       <span className={s.thumbMark} aria-hidden="true"/>
       <span className={s.railEnds} aria-hidden="true"><b>1863</b><b>Today</b></span>
      </div>
      <button type="button" className={s.stepBtn} data-tl-step="next" aria-label="Later" disabled={idx===n-1} onClick={()=>step(1)}>▸</button>
     </nav>
     <div className={s.quest} data-tl-quest={!ch?'done':quest.found?'found':'seek'} aria-live="polite">
      <p className={s.questText}>{questLine}</p>
      <div className={s.row}>
       {(quest.found||!ch)&&<button type="button" className={s.ghost} data-tl-quest-next onClick={nextQuest}>{!ch?'Play again':quest.k===CHALLENGES.length-1?'Finish':'Next mission'}</button>}
       <button type="button" className={s.btn} data-museum-own-cue data-tl-order-open onClick={()=>{sfx('click');setMode('order');}}>Order it</button>
      </div>
      <p className={s.passport} data-tl-passport={pass.seen} aria-label={`${pass.seen} of ${pass.total} exhibits visited`}>
       <span className={s.passDots} aria-hidden="true">{ids.map(id=><i key={id} data-seen={seenSet.has(id)||undefined}/>)}</span>
       <span>{pass.all?'Every exhibit visited':`Passport: ${pass.seen} of ${pass.total} visited`}</span></p>
     </div>
    </div>}
   </div>
   {done&&mode==='travel'&&<section className={s.after}><Ending reached art={<span className={s.endDot}/>} seen="You’ve travelled football’s story, from the first Laws in 1863 to the video referee."
    take="Football keeps changing one idea at a time. Try one new idea in your next game."/></section>}
   <p className={s.srOnly} aria-live="polite">{announce}</p>
  </div>
 </div>;
}
