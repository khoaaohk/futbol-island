'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {Padlock} from '@lucasmarkes/hairline/react';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {exhibitState,galleryOf} from '@/lib/endgame/museum';
import {useMuseumCounts} from '@/lib/museum/useMuseumCounts';
import {museumSfx} from '@/lib/museum/museumSound';
import FigureSlot from './FigureSlot';
import {chapterOf,eras} from './eras';
import {passport,useMuseumVisits} from '@/lib/museum/museumVisits';
import {register,reducedMotion,spring,stepS} from './hairline/engine';
import {CHALLENGES,clampN,decades,fracToPos,posToFrac,projectSnap,rubber,span,springEasing,tickXs,velocity,yearsBetween} from './wall';
import styles from './Experience.module.css';

/**
 * The timeline as an emaki (Oct 9 2026; user: "the museum is a playground for different styles … Japanese style"). Football's
 * story is one long horizontal hand-scroll: each museum case is a scene painted in ink (the hairline figures, drawn hakubyō
 * style), with its words beside it like an emaki's kotobagaki, its year pressed in as a vermilion seal, and gold kasumi clouds
 * drifting between the scenes to mark the passing of time. The visitor unrolls it: drag or flick the paper (it carries on with
 * the flick and settles on a scene; past either end it rubber-bands), drag the year rule, or use the arrows and keys. "Real
 * years" spreads the rule out to the true dates (a zoom out to the decades), and "Find it" asks the visitor to unroll to a
 * moment, with warmer/colder hints and a takeaway when they land on it. "Visit this case" rolls the scroll up and takes the hall
 * to that case (props.onVisit; without it, Back).
 *
 * Heat: SVG and DOM only (no canvas). The scroll's spring is a board on the hairline engine's ONE shared rAF loop, which runs
 * only while a spring moves and sleeps at rest; a drag paints straight from pointer events. Only the active scene and its two
 * neighbours have figures. One-shot Web Animations (unroll, seal stamp, roll-up); reduced motion lands everything at once.
 */
export default function Experience({exhibit,onClose,onVisit,onEnter,onComplete}:ExperienceProps){
 const list=useMemo(()=>eras(),[]),n=list.length,years=useMemo(()=>list.map(x=>x.exhibit.year),[list]);
 const start=Math.max(0,list.findIndex(e=>e.exhibit.id===exhibit.id));
 const [idx,setIdx]=useState(start);
 const [real,setReal]=useState(false);
 const [hint,setHint]=useState(true);
 const [announce,setAnnounce]=useState('');
 const [quest,setQuest]=useState<{k:number;found:boolean;moved:boolean}>({k:0,found:false,moved:false});
 const counts=useMuseumCounts();
 // The museum passport: which cases the visitor has stepped inside (a stamp on the scene and a dot on the rule).
 const visits=useMuseumVisits(),pass=passport(visits),seenSet=new Set(visits.seen);
 const e=list[idx].exhibit;
 const first=list[0].exhibit;

 // ---- the scroll's springs and refs (no React state per frame) ----
 const sp=useRef(spring(start,{k:170,c:24,eps:.0008})).current;
 const mix=useRef(spring(0,{k:120,c:20,eps:.001})).current;
 const rootRef=useRef<HTMLDivElement>(null),paper=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
 const rollL=useRef<HTMLSpanElement>(null),rollR=useRef<HTMLSpanElement>(null);
 const W=useRef(600),idxRef=useRef(start),lastTick=useRef(0),dragging=useRef(false),stamped=useRef(start),leaving=useRef(false);
 const wakeRef=useRef<()=>void>(()=>{});
 const questRef=useRef(quest);questRef.current=quest;

 const paint=useCallback(()=>{
  const p=paper.current;if(!p)return;const pos=sp.x,w=W.current;
  for(const el of p.querySelectorAll<HTMLElement>('[data-i]')){const o=Number(el.dataset.i)-pos;el.style.transform=`translate3d(${(o*w).toFixed(1)}px,0,0)`;el.style.opacity=String(1-.32*Math.min(1,Math.abs(o)));}
  for(const el of p.querySelectorAll<HTMLElement>('[data-g]')){const o=Number(el.dataset.g)+.5-pos;el.style.transform=`translate3d(${(o*w*1.08).toFixed(1)}px,0,0)`;}
  p.parentElement?.style.setProperty('--roll',(pos*46).toFixed(1)+'px');
  const t=track.current;if(t){const xs=tickXs(years,mix.x);t.style.setProperty('--m',mix.x.toFixed(3));t.style.setProperty('--p',posToFrac(pos,xs).toFixed(4));
   t.querySelectorAll<HTMLElement>('[data-tick]').forEach((el,i)=>el.style.setProperty('--x',xs[i].toFixed(4)));}
  const i=Math.round(clampN(pos,0,n-1));
  if(i!==idxRef.current){idxRef.current=i;setIdx(i);const now=performance.now();if(now-lastTick.current>45){lastTick.current=now;museumSfx.tick();}}
 },[sp,mix,years,n]);
 useLayoutEffect(()=>{paint();});

 // A scene settles: say it once for screen readers, press its seal, and check the "Find it" challenge.
 const rest=useCallback(()=>{
  const i=Math.round(clampN(sp.x,0,n-1)),x=list[i].exhibit;
  if(stamped.current!==i){stamped.current=i;setAnnounce(`${x.year}: ${x.title}`);
   const seal=paper.current?.querySelector<HTMLElement>(`[data-i="${i}"] [data-tl-year]`);
   if(seal&&!reducedMotion()){const s=springEasing(300,16);seal.animate([{transform:'scale(1.5) rotate(-9deg)',opacity:0},{transform:'scale(1) rotate(-3deg)',opacity:1}],{duration:s.ms,easing:s.easing});
    // …then the scene's words unfold after it, one line at a time (transform/opacity one-shots on the same spring).
    const u=springEasing(220,22);paper.current?.querySelectorAll<HTMLElement>(`[data-i="${i}"] [data-tl-unfold]`).forEach((el,k)=>el.animate([{transform:'translate3d(0,10px,0)',opacity:.25},{transform:'none',opacity:1}],{duration:u.ms,easing:u.easing,delay:120+k*70,fill:'backwards'}));}}
  const q=questRef.current,c=CHALLENGES[q.k];
  if(c&&!q.found&&x.id===c.id){setQuest({...q,found:true});museumSfx.reveal();if(q.k===CHALLENGES.length-1)onComplete?.();}
 },[sp,list,n,onComplete]);

 // The scroll is a board on the shared hairline loop: it ticks only while a spring moves.
 useEffect(()=>{const p=paper.current;if(!p)return;
  const b=register(p,dt=>{if(dragging.current)return false;let m=stepS(sp,dt);m=stepS(mix,dt)||m;paint();if(!m)rest();return m;});
  wakeRef.current=b.wake;return()=>{wakeRef.current=()=>{};b.unregister();};},[sp,mix,paint,rest]);

 // The paper's width sets one scene's width; measured on resize only (ResizeObserver, no polling).
 useEffect(()=>{const p=paper.current;if(!p)return;const measure=()=>{const r=p.getBoundingClientRect();W.current=Math.max(220,r.width*(r.width>=760?.62:.9));p.style.setProperty('--w',W.current+'px');paint();};
  measure();const ro=new ResizeObserver(measure);ro.observe(p);return()=>ro.disconnect();},[paint]);

 // Hero moment on opening: the scroll unrolls from the middle, the rollers springing out to the edges.
 useEffect(()=>{const p=paper.current,l=rollL.current,r=rollR.current;if(!p||!l||!r||reducedMotion())return;
  const half=p.getBoundingClientRect().width/2,s=springEasing(90,17),o={duration:s.ms,easing:s.easing,delay:120,fill:'backwards' as const};
  const a=[p.animate([{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(0 0% 0 0%)'}],o),l.animate([{transform:`translateX(${half}px)`},{transform:'none'}],o),r.animate([{transform:`translateX(${-half}px)`},{transform:'none'}],o)];
  return()=>a.forEach(x=>x.cancel());},[]);

 const go=useCallback((to:number)=>{sp.t=clampN(Math.round(to),0,n-1);wakeRef.current();setHint(false);},[sp,n]);
 const step=useCallback((d:number)=>go(Math.round(sp.t)+d),[go,sp]);

 // Keys anywhere: Escape leaves; arrows walk the scroll (the year rule handles its own).
 useEffect(()=>{const key=(ev:KeyboardEvent)=>{if(ev.key==='Escape'){ev.preventDefault();onClose();return;}
   const t=ev.target as HTMLElement|null;if(t?.closest?.('[role="slider"]'))return;
   if(ev.key==='ArrowLeft'){ev.preventDefault();step(-1);}else if(ev.key==='ArrowRight'){ev.preventDefault();step(1);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose,step]);

 // ---- drag the paper: 1:1 under the finger, rubber-banded at the ends, flicks carry on and settle on a scene ----
 const pd=useRef<{id:number;x0:number;p0:number;moved:boolean;s:[number,number][]}|null>(null),swallow=useRef(false);
 const noteMoved=()=>{setHint(false);if(!questRef.current.moved)setQuest(q=>({...q,moved:true}));};
 const paperDown=(ev:ReactPointerEvent<HTMLDivElement>)=>{if(ev.button>0||leaving.current)return;sp.t=sp.x;sp.v=0;swallow.current=false;
  pd.current={id:ev.pointerId,x0:ev.clientX,p0:sp.x,moved:false,s:[[performance.now(),sp.x]]};};
 const paperMove=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=pd.current;if(!d||d.id!==ev.pointerId)return;const dx=ev.clientX-d.x0;
  if(!d.moved){if(Math.abs(dx)<7)return;d.moved=true;d.x0=ev.clientX;dragging.current=true;ev.currentTarget.setPointerCapture(ev.pointerId);ev.currentTarget.dataset.grab='1';noteMoved();return;}
  const raw=d.p0-dx/W.current,now=performance.now();sp.x=rubber(raw,n-1);sp.t=sp.x;sp.v=0;d.s.push([now,raw]);while(d.s.length>2&&now-d.s[0][0]>100)d.s.shift();paint();};
 const paperUp=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=pd.current;if(!d||d.id!==ev.pointerId)return;pd.current=null;ev.currentTarget.dataset.grab='';
  if(d.moved){dragging.current=false;swallow.current=true;const v=velocity(d.s);sp.v=v;sp.t=projectSnap(clampN(sp.x,0,n-1),v,n);wakeRef.current();}
  else{sp.t=clampN(Math.round(sp.x),0,n-1);wakeRef.current();}};

 // ---- the year rule: drag it (the scroll follows smoothly, eras between ticks), keys step ----
 const td=useRef<{id:number;rect:DOMRect;s:[number,number][]}|null>(null);
 const ruleAt=(x:number,r:DOMRect)=>fracToPos(clampN((x-r.left)/r.width,0,1),tickXs(years,mix.x));
 const scrubDown=(ev:ReactPointerEvent<HTMLDivElement>)=>{const r=track.current?.getBoundingClientRect();if(!r)return;ev.currentTarget.setPointerCapture(ev.pointerId);
  dragging.current=true;noteMoved();const p=ruleAt(ev.clientX,r);td.current={id:ev.pointerId,rect:r,s:[[performance.now(),p]]};sp.x=sp.t=p;sp.v=0;paint();};
 const scrubMove=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=td.current;if(!d||d.id!==ev.pointerId)return;const p=ruleAt(ev.clientX,d.rect),now=performance.now();
  sp.x=sp.t=p;d.s.push([now,p]);while(d.s.length>2&&now-d.s[0][0]>100)d.s.shift();paint();};
 const scrubEnd=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=td.current;if(!d||d.id!==ev.pointerId)return;td.current=null;dragging.current=false;
  const v=velocity(d.s)*.5;sp.v=v;sp.t=projectSnap(sp.x,v,n);wakeRef.current();};
 const scrubKey=(ev:ReactKeyboardEvent)=>{const k=ev.key,m:Record<string,number>={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1,PageDown:-3,PageUp:3};
  if(k in m){ev.preventDefault();step(m[k]);}else if(k==='Home'){ev.preventDefault();go(0);}else if(k==='End'){ev.preventDefault();go(n-1);}};
 const toggleReal=()=>{museumSfx.click();const on=!real;setReal(on);mix.t=on?1:0;wakeRef.current();};

 // ---- "Step inside" / "Find it in the hall": the scroll rolls up to the middle, then the host opens that exhibit's experience
 // (onEnter) or walks the hall to its case (onVisit) ----
 const visit=(id:string,enter=false)=>{if(leaving.current)return;leaving.current=true;museumSfx.look();
  const done=()=>{if(enter&&onEnter)onEnter(id);else if(onVisit)onVisit(id);else onClose();};
  const p=paper.current,l=rollL.current,r=rollR.current;if(!p||!l||!r||reducedMotion()){done();return;}
  const half=p.getBoundingClientRect().width/2,o={duration:460,easing:'cubic-bezier(.55,0,.7,.2)',fill:'forwards' as const};
  p.animate([{clipPath:'inset(0 0% 0 0%)'},{clipPath:'inset(0 50% 0 50%)'}],o);l.animate([{transform:'none'},{transform:`translateX(${half}px)`}],o);
  r.animate([{transform:'none'},{transform:`translateX(${-half}px)`}],o).finished.then(done,done);};

 // ---- the challenge copy ----
 const ch=CHALLENGES[quest.k],target=ch?list.findIndex(x=>x.exhibit.id===ch.id):-1,tx=target>=0?list[target].exhibit:null;
 const since=tx?yearsBetween(first.year,tx.year):null;
 const questLine=!ch?'You found all three! From the first Laws in 1863 to the video referee in 2018, football kept changing, one idea at a time.'
  :quest.found&&tx?`Found it! ${tx.title}: ${tx.year}.${since?` That’s ${since} years after the first Laws.`:''}`
  :!quest.moved?`Try it! Unroll the scroll and find ${ch.ask}.`
  :idx<target?`Find ${ch.ask}: keep going, it’s later →`:idx>target?`Find ${ch.ask}: go back, it’s earlier ←`:`Find ${ch.ask}: you’re on it, let go!`;
 const nextQuest=()=>{museumSfx.click();setQuest(q=>q.k>=CHALLENGES.length?{k:0,found:false,moved:false}:{k:q.k+1,found:false,moved:true});};

 const prev=idx>0?list[idx-1].exhibit:null,gap=prev?yearsBetween(prev.year,e.year):null;
 const ruleNote=real?(gap===null?'Spread out by real years':gap===0?`${e.year}: the same year as the one before`:`${e.year}: ${gap} years after ${prev!.year}`):'Drag the scroll or the rule, or flick it';
 const [y0,y1]=span();
 const lo=Math.max(0,idx-2),hi=Math.min(n-1,idx+2);

 return <div ref={rootRef} className={styles.root} data-museum-experience="timeline" role="dialog" aria-modal="true" aria-label="The story of football: a hand-scroll">
  <ExperienceBack onClose={onClose}/>
  <header className={styles.head}>
   <span className={styles.eyebrow}>A Japanese hand-scroll</span>
   <h1 className={styles.title}>The story of football</h1>
   <p className={styles.passport} data-tl-passport={pass.seen} aria-label={`${pass.seen} of ${pass.total} exhibits visited`}>
    <span className={styles.passDots} aria-hidden="true">{list.map(x=>x.exhibit.id).map(id=><i key={id} data-seen={seenSet.has(id)||undefined}/>)}</span>
    <span>{pass.all?'Every exhibit visited!':`${pass.seen} of ${pass.total} visited`}</span></p>
  </header>

  <div className={styles.quest} data-tl-quest={!ch?'done':quest.found?'found':'seek'} aria-live="polite">
   <span className={styles.questSeal} aria-hidden="true"/>
   <p className={styles.questText} key={`${quest.k}-${quest.found}`}>{questLine}</p>
   {(quest.found||!ch)&&<button type="button" className={styles.questBtn} data-tl-quest-next onClick={nextQuest}>{!ch?'Play again':quest.k===CHALLENGES.length-1?'Finish':'Next one'}</button>}
  </div>

  <div className={styles.scroll}>
   <span ref={rollL} className={`${styles.roller} ${styles.rollerL}`} aria-hidden="true"/>
   <div ref={paper} className={styles.paper} data-tl-paper onPointerDown={paperDown} onPointerMove={paperMove} onPointerUp={paperUp} onPointerCancel={paperUp}
    onClickCapture={ev=>{if(swallow.current){swallow.current=false;ev.stopPropagation();ev.preventDefault();}}}>
    <div className={styles.strip}>
     {list.map((_,g)=>g>=lo-1&&g<hi+1&&g<n-1?<Kasumi key={'g'+g} g={g}/>:null)}
     {list.map((x,i)=>{if(i<lo||i>hi)return null;const on=i===idx,xe=x.exhibit,st=counts.ready?exhibitState(xe,counts):null,words=x.fact;
      const ch=chapterOf(xe.id),before=i>0?list[i-1].exhibit:null,later=before?yearsBetween(before.year,xe.year):null,seen=seenSet.has(xe.id),canEnter=!!onEnter&&!!st?.open;
      return <article key={xe.id} data-i={i} className={styles.panel} data-on={on||undefined} aria-hidden={on?undefined:true}
       onClick={on?undefined:()=>{museumSfx.click();go(i);}} style={{'--g':galleryOf(xe.gallery).art} as CSSProperties}>
       <div className={styles.words} data-tl-era={on?xe.id:undefined}>
        {ch&&<p className={styles.chapter} data-tl-chapter={ch.n}>Chapter {ch.n} · {ch.title}</p>}
        <p className={styles.meta}><span className={styles.gallery}><i aria-hidden="true"/>{galleryOf(xe.gallery).title}</span><span className={styles.count}>{i+1} / {n}</span></p>
        <p className={styles.year} data-tl-year={on||undefined}><span>{xe.year}</span>{seen&&<em className={styles.seen} data-tl-seen={xe.id}>Visited</em>}{!!later&&<small className={styles.later}>{later} years later</small>}</p>
        <h2 className={styles.caseTitle} data-tl-unfold>{xe.title}</h2>
        <p className={styles.fact} data-tl-fact={on||undefined} data-tl-unfold>{words}</p>
        <div className={styles.actions} data-tl-unfold>
         {canEnter&&<button type="button" className={`${styles.visit} ${styles.enter}`} data-tl-enter={on?xe.id:undefined} tabIndex={on?0:-1} onClick={ev=>{ev.stopPropagation();visit(xe.id,true);}}>{seen?'Step inside again':'Step inside'}<span aria-hidden="true" className={styles.arrow}/></button>}
         <button type="button" className={`${styles.visit} ${canEnter?styles.quiet:''}`} data-tl-visit={on?xe.id:undefined} tabIndex={on?0:-1} onClick={ev=>{ev.stopPropagation();visit(xe.id);}}>{canEnter?'Find it in the hall':'Visit this case'}{!canEnter&&<span aria-hidden="true" className={styles.arrow}/>}</button>
         {st&&!st.open&&<div className={styles.lock} data-tl-lock={on?xe.id:undefined}><Padlock className={styles.padlock} theme="light" intensity={.6} label="Locked case"/><span>{st.lockText}</span></div>}
        </div>
       </div>
       <FigureSlot def={x.figure} live={Math.abs(i-idx)<=1} active={on} label={`${xe.year}: ${x.figure.label}`}/>
      </article>;})}
    </div>
    {hint&&<div className={styles.hint} aria-hidden="true" onAnimationEnd={ev=>{if(ev.animationName.includes('hand'))setHint(false);}}><span className={styles.hand}/><span className={styles.hintText}>Drag the scroll</span></div>}
   </div>
   <span ref={rollR} className={`${styles.roller} ${styles.rollerR}`} aria-hidden="true"/>
  </div>
  <p className={styles.srOnly} aria-live="polite">{announce}</p>

  <nav className={styles.scrub} aria-label="Years">
   <div className={styles.scrubTop}>
    <button type="button" className={styles.zoom} data-tl-real aria-pressed={real} onClick={toggleReal}><span className={styles.zoomBox} aria-hidden="true"/>Real years</button>
    <span className={styles.ruleNote} data-tl-gap>{ruleNote}</span>
   </div>
   <div className={styles.scrubRow}>
    <button type="button" className={styles.stepBtn} data-tl-step="prev" aria-label="Earlier era" disabled={idx===0} onClick={()=>{museumSfx.click();step(-1);}}><span aria-hidden="true" className={styles.chev}/></button>
    <div ref={track} className={styles.track} role="slider" tabIndex={0} aria-label="Timeline" aria-valuemin={0} aria-valuemax={n-1} aria-valuenow={idx}
     aria-valuetext={`${e.year}: ${e.title}`} data-tl-scrubber onKeyDown={scrubKey} onPointerDown={scrubDown} onPointerMove={scrubMove} onPointerUp={scrubEnd} onPointerCancel={scrubEnd} onLostPointerCapture={scrubEnd}>
     <span className={styles.rail} aria-hidden="true"><span className={styles.fill}/></span>
     {decades().map(y=><span key={y} aria-hidden="true" className={styles.decade} data-major={y%30===0||undefined} style={{'--x':(y-y0)/(y1-y0)} as CSSProperties}><b>{y}</b></span>)}
     {list.map((x,i)=><span key={x.exhibit.id} data-tick aria-hidden="true" className={styles.tick} data-on={i===idx||undefined} data-target={i===target&&!quest.found||undefined} data-seen={seenSet.has(x.exhibit.id)||undefined} data-end={i===0?'first':i===n-1?'last':undefined}>
      <i/><b>{x.tick}</b></span>)}
     <span aria-hidden="true" className={styles.thumb}><span>{e.year==='Today'?'Now':x4(e.year)}</span></span>
    </div>
    <button type="button" className={styles.stepBtn} data-tl-step="next" aria-label="Later era" disabled={idx===n-1} onClick={()=>{museumSfx.click();step(1);}}><span aria-hidden="true" className={`${styles.chev} ${styles.chevNext}`}/></button>
   </div>
  </nav>
 </div>;
}
/** The thumb's seal shows the year (or the decade for "Before the 1960s"). */
const x4=(y:string)=>y.match(/\d{4}/)?.[0]??y;

/** Suyari-gasumi: long gold mist bands with rounded, scalloped ends, stacked in steps, entering from the top and bottom edges
 *  between two scenes (back bands drawn first, so the overlaps read as layers). Sprinkled with cut gold leaf (kirihaku). */
function Kasumi({g}:{g:number}){
 const set=g%2?BANDS_B:BANDS_A;
 const side=(flip:boolean)=><svg className={flip?styles.kasumiB:styles.kasumiT} viewBox="0 0 200 120" aria-hidden="true">
  <g transform={flip?'matrix(1 0 0 -1 0 120)':undefined}>{set.map(([x,y,w,h],k)=>{const r=h/2,lobe=Math.min(w*.3,46);return <g key={k}>
   <path className={styles.band} d={`M${x+r} ${y}H${x+w-r}a${r} ${r} 0 0 1 0 ${h}H${x+r}a${r} ${r} 0 0 1 0 ${-h}Z`}/>
   <path className={styles.band} d={`M${x+w-lobe} ${y+h*.42}h${lobe-r*.6}a${r*.6} ${r*.6} 0 0 1 0 ${h*.6}h${-(lobe-r*.6)}`}/>
   <path className={styles.bandLine} d={`M${x+r+4} ${y+h*.34}H${x+w*.62}`}/>
   {[.22,.5,.76].map((f,j)=><rect key={f} className={styles.leaf} x={x+w*f} y={y+h*(.45+.15*((k+j)%2))} width={j===1?4:3} height={j===1?4:3} transform={`rotate(${k*23+j*31} ${x+w*f} ${y+h/2})`}/>)}
  </g>;})}</g>
 </svg>;
 return <div data-g={g} className={styles.kasumi} aria-hidden="true">{side(false)}{side(true)}</div>;
}
const BANDS_A:[number,number,number,number][]=[[60,-4,150,26],[10,18,150,24],[70,40,120,22],[24,62,90,18]];
const BANDS_B:[number,number,number,number][]=[[0,-4,160,26],[50,18,150,24],[16,40,120,22],[80,62,90,18]];
