'use client';
import {useCallback,useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import styles from './shirts.module.css';
import Decades from './KitThroughTime';
import FullTime from './FullTime';
import {SPOTS,spotOf,nearestSpot,hintFor,EXTRA_FACTS,SOURCES,SWATCHES,swatch,lawChecks,DEFAULT_KITS,KIT_ROLES,scanScene,colourGap,CLASH_DE,type Kits,type Spot,type ScanScene} from './data';

/**
 * shirts · "Numbers and colours" (1928): the Kit Room, a full-screen installation told as a fashion-editorial collage in
 * three beats (Oct 9 2026). Beat 1 "Decades" (KitThroughTime.tsx) is a paper-doll kit builder through sourced milestones; the
 * two original halves follow:
 *  1. The formation loom: eleven shirts hang on a washing line; drag (or tap, then tap a spot) each one onto the 1928 2-3-5
 *     line-up. Right spots light up and a wool thread weaves 1 → 2 → … → 11 across the pitch, so you see the numbers count
 *     from the goalkeeper forwards, right to left along each line.
 *  2. The colour-clash tester: pick the kits for both teams, both keepers and the referee; the three Law 4 checks light up, and
 *     a scan test times how fast you find your free team-mate. Clashing kits make it slower: that's why the Law exists.
 * Beats 2 and 3 have no animation loop: dragging moves one element straight from pointer events, everything else is CSS transitions that
 * stop by themselves (and switch off under prefers-reduced-motion). Beat 1 has one sleepy rAF loop (spring.ts) that runs only
 * while something moves. Beats switch with FLIP (the tab ink) and a one-shot paste-in animation, never View Transitions. Sound is the museum's shared one-shots (mute respected).
 * Back is the shared ExperienceBack (fixed top-left); the header keeps that corner clear.
 */
type Mode='decades'|'numbers'|'colours'|'fulltime';
const MODES:readonly {id:Mode;label:string}[]=[{id:'decades',label:'Decades'},{id:'numbers',label:'Numbers'},{id:'colours',label:'Colours'},{id:'fulltime',label:'Full time'}];
type Note={text:string;tone:'info'|'ok'|'hint'};
type Run={avg:number;misses:number;clash:boolean;kits:string};
type Scan={phase:'idle'|'live'|'done';round:number;scene:ScanScene;times:number[];misses:number;flash:{id:string;kind:'ok'|'bad'}|null;say:string};
const ROUNDS=3;
const SHIRT='M13 3 L4 8.5 L7.5 17 L11.5 15 L11.5 37 L28.5 37 L28.5 15 L32.5 17 L36 8.5 L27 3 Q20 8.5 13 3 Z';
const RAIL_INK='#b8283a',KEEPER_INK='#1e8c4e';
const shirtInk=(n:number)=>n===1?KEEPER_INK:RAIL_INK;
const START_NOTE='Drag a shirt from the line onto its spot on the pitch. Start with number 1.';
const DONE_NOTE='All eleven! Follow the thread: it counts from the goalkeeper to the front, right to left along every line.';
const CHECK_SHORT={teams:'Teams',referee:'Referee',keepers:'Keepers'} as const;
/** The three new facts, shown one card at a time when the loom is woven. */
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A spring for one-shot Web Animations (overshoot, settle); plain ease-out where linear() isn't supported. */
const springEase=()=>typeof CSS!=='undefined'&&CSS.supports?.('transition-timing-function','linear(0,1)')
 ?'linear(0,.006,.025 2.8%,.101 6.1%,.539 18.9%,.721 25.3%,.849 31.5%,.937 38.1%,.968 41.8%,.991 45.7%,1.006 50.1%,1.015 55%,1.017 63.9%,1.001 85.9%,1)':'cubic-bezier(.2,.9,.3,1.2)';
const WOVEN=[{title:'The 1928 shape',text:EXTRA_FACTS.shape},{title:'The first day',text:EXTRA_FACTS.firstDay},{title:'Up to 22',text:EXTRA_FACTS.cupFinal}];

/** A shirt with soft cloth shading (light from the top left), a collar and cuffs. `outline` draws an empty dashed shirt. */
function ShirtArt({n,fill,ink='#fff7e6',outline,className}:{n?:number|string;fill:string;ink?:string;outline?:boolean;className?:string}){
 const g=useId().replace(/:/g,'');
 if(outline)return <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
  <path d={SHIRT} fill="rgba(22,24,29,.05)" stroke="rgba(22,24,29,.4)" strokeWidth="1" strokeDasharray="2 1.6" strokeLinejoin="round"/>
  {n!=null&&<text x="20" y="29" textAnchor="middle" fontSize="15" fontWeight="900" fill="rgba(22,24,29,.35)" fontFamily="Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif">{n}</text>}
 </svg>;
 return <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
  <defs><pattern id={`${g}w`} width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width=".55" height="1.6" fill="#fff" opacity=".09"/></pattern>
   <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22"/><stop offset=".55" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".22"/></linearGradient></defs>
  <path d={SHIRT} fill={fill}/>
  <path d={SHIRT} fill={`url(#${g}w)`}/>
  <path d={SHIRT} fill={`url(#${g})`} stroke="rgba(0,0,0,.4)" strokeWidth="1" strokeLinejoin="round"/>
  <path d="M7.5 17 L4 8.5 M32.5 17 L36 8.5" stroke="rgba(0,0,0,.18)" strokeWidth="1"/>
  <path d="M6 13.6 L9.3 15.6 M34 13.6 L30.7 15.6" stroke="rgba(255,255,255,.5)" strokeWidth="1.1" strokeLinecap="round"/>
  <path d="M13 3 Q20 8.5 27 3" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"/>
  {n!=null&&<text x="20" y="29" textAnchor="middle" fontSize={String(n).length>1?13:15} fontWeight="900" fill={ink} stroke="rgba(0,0,0,.25)" strokeWidth=".5" paintOrder="stroke" fontFamily="Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif">{n}</text>}
 </svg>;
}

/** The referee's spot and their keeper's spot in a scan scene: as far as possible from every player. */
function extras(scene:ScanScene){
 const pts=[...scene.players,{x:scene.you.x,y:scene.you.y}];let best={x:50,y:30},bd=-1;
 for(let x=8;x<=92;x+=6)for(let y=8;y<=54;y+=6){const d=Math.min(...pts.map(p=>Math.hypot(p.x-x,p.y-y)));if(d>bd){bd=d;best={x,y};}}
 return {ref:best,keeper:{x:50,y:3}};
}

export default function Experience({exhibit,onClose}:ExperienceProps){
 const root=useRef<HTMLElement>(null),pitch=useRef<HTMLDivElement>(null),ghost=useRef<HTMLDivElement>(null),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const drag=useRef<{n:number;id:number;x0:number;y0:number;x:number;y:number;moved:boolean}|null>(null);
 const gid=useId().replace(/:/g,'');
 const [mode,setMode]=useState<Mode>('decades');
 const [placed,setPlaced]=useState<ReadonlySet<number>>(()=>new Set());
 const [selected,setSelected]=useState<number|null>(null),[dragging,setDragging]=useState<number|null>(null);
 const [focusN,setFocusN]=useState<number|null>(null),[justN,setJustN]=useState<number|null>(null);
 const [tries,setTries]=useState<Record<number,number>>({});
 const [wrong,setWrong]=useState<{n:number;k:number}|null>(null);
 const [note,setNote]=useState<Note>({tone:'info',text:START_NOTE});
 const [factI,setFactI]=useState(0);
 const [kits,setKits]=useState<Kits>(DEFAULT_KITS),[role,setRole]=useState<keyof Kits>('home');
 const [scan,setScan]=useState<Scan>(()=>({phase:'idle',round:0,scene:scanScene(),times:[],misses:0,flash:null,say:''}));
 const [runs,setRuns]=useState<Run[]>([]),[grey,setGrey]=useState(false);
 const fly=useRef(new Map<number,{rect:{x:number;y:number;w:number};delay:number}>());
 const startAt=useRef(0),suppress=useRef<{n:number;until:number}|null>(null);
 const done=placed.size===SPOTS.length;
 const later=useCallback((fn:()=>void,ms:number)=>{const t=setTimeout(()=>{timers.current=timers.current.filter(x=>x!==t);fn();},ms);timers.current.push(t);},[]);
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current=[];drag.current=null;},[]);
 useEffect(()=>{root.current?.focus({preventScroll:true});},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;if(drag.current){drag.current=null;setDragging(null);return;}e.preventDefault();onClose();};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);

 // ---- Numbers: the loom ------------------------------------------------------------------------------------------------
 /** FLIP: remember where shirt n starts (its peg, or the dragged ghost), then fly it to its spot once it renders there. */
 const recordFlight=useCallback((n:number,delay:number)=>{
  if(reduced())return;
  const from=ghost.current??root.current?.querySelector(`[data-shirt="${n}"] svg`);const r=from?.getBoundingClientRect();
  if(r&&r.width)fly.current.set(n,{rect:{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width},delay});
 },[]);
 useLayoutEffect(()=>{
  if(!fly.current.size)return;const ease=springEase();
  fly.current.forEach(({rect,delay},n)=>{
   const el=root.current?.querySelector<SVGElement>(`[data-spot="${n}"] svg`);const r=el?.getBoundingClientRect();if(!el||!r?.width||!el.animate)return;
   const dx=rect.x-(r.left+r.width/2),dy=rect.y-(r.top+r.height/2),k=rect.w/r.width;
   el.animate([{transform:`translate(${dx}px,${dy}px) scale(${k}) rotate(-8deg)`,opacity:1},{transform:'none',opacity:1}],{duration:560,delay,easing:ease,fill:'backwards'});
  });
  fly.current.clear();
 },[placed]);
 const place=useCallback((n:number,spot:Spot)=>{
  if(placed.has(n))return;
  if(placed.has(spot.n)){setNote({tone:'hint',text:`Number ${spot.n} already hangs there. Try another spot for ${n}.`});return;}
  if(spot.n===n){
   const next=new Set(placed);next.add(n);recordFlight(n,0);setPlaced(next);setSelected(null);setFocusN(n);setJustN(n);
   if(next.size===SPOTS.length){setNote({tone:'ok',text:DONE_NOTE});setFactI(0);museumSfx.reveal();}
   else{setNote({tone:'ok',text:spot.say});museumSfx.flap();}
   return;
  }
  setTries(t=>({...t,[n]:(t[n]??0)+1}));const k=Date.now();setWrong({n:spot.n,k});later(()=>setWrong(w=>w?.k===k?null:w),520);
  setNote({tone:'hint',text:hintFor(n,spot)});museumSfx.tick();
 },[placed,later]);

 const onShirtDown=(n:number)=>(e:ReactPointerEvent<HTMLButtonElement>)=>{
  if(placed.has(n)||e.button>0)return;
  drag.current={n,id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,moved:false};
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
 };
 const onShirtMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{
  const d=drag.current;if(!d||d.id!==e.pointerId)return;d.x=e.clientX;d.y=e.clientY;
  if(!d.moved&&Math.hypot(d.x-d.x0,d.y-d.y0)>6){d.moved=true;setDragging(d.n);setSelected(d.n);setFocusN(d.n);setNote({tone:'info',text:`Number ${d.n} is in your hand. Drop it on the spot where it plays.`});}
  if(ghost.current)ghost.current.style.transform=`translate3d(${d.x}px,${d.y}px,0) translate(-50%,-60%) rotate(-6deg)`;
 };
 const onShirtUp=(n:number)=>(e:ReactPointerEvent<HTMLButtonElement>)=>{
  const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;
  if(!d.moved){return;}// a tap: the click handler selects it (keeps keyboard and pointer on one path)
  suppress.current={n,until:performance.now()+400};setDragging(null);setSelected(null);
  const r=pitch.current?.getBoundingClientRect();if(!r)return;
  const spot=nearestSpot((e.clientX-r.left)/r.width*68,(e.clientY-r.top)/r.height*105,12);
  if(spot)place(n,spot);else setNote({tone:'hint',text:`Drop number ${n} on a spot on the pitch.`});
 };
 const onShirtCancel=()=>{drag.current=null;setDragging(null);};
 useLayoutEffect(()=>{const d=drag.current;if(dragging!=null&&d&&ghost.current)ghost.current.style.transform=`translate3d(${d.x}px,${d.y}px,0) translate(-50%,-60%) rotate(-6deg)`;},[dragging]);
 const onShirtClick=(n:number)=>{
  if(suppress.current?.n===n&&performance.now()<suppress.current.until)return;
  if(placed.has(n))return;
  setSelected(s=>s===n?null:n);setFocusN(n);museumSfx.card();
  setNote({tone:'info',text:`Number ${n} is in your hand. Now tap the spot where it plays.`});
 };
 const onSpotClick=(s:Spot)=>{
  if(selected!=null){place(selected,s);return;}
  if(placed.has(s.n)){setFocusN(s.n);setNote({tone:'ok',text:s.say});return;}
  setNote({tone:'info',text:`This is the ${s.role.toLowerCase()}’s spot. Which number plays here? Pick a shirt from the line.`});
 };
 const hangAll=()=>{let k=0;SPOTS.forEach(s=>{if(!placed.has(s.n))recordFlight(s.n,(k++)*70);});setPlaced(new Set(SPOTS.map(s=>s.n)));setSelected(null);setFocusN(10);setJustN(null);setFactI(0);setNote({tone:'ok',text:DONE_NOTE});museumSfx.reveal();};
 const restart=()=>{setPlaced(new Set());setTries({});setSelected(null);setFocusN(null);setJustN(null);setNote({tone:'info',text:START_NOTE});};
 /** Switch beats with FLIP (no View Transitions): the ink pill behind the tabs slides from the old tab to the new one with a
  *  spring, and the new page is pasted in (a one-shot Web Animation). Reduced motion: an instant swap. */
 const inkFrom=useRef<DOMRect|null>(null);
 const switchMode=(m:Mode)=>{
  if(m===mode)return;museumSfx.card();
  inkFrom.current=reduced()?null:root.current?.querySelector('[data-tab-ink]')?.getBoundingClientRect()??null;
  setMode(m);
 };
 useLayoutEffect(()=>{
  const from=inkFrom.current;inkFrom.current=null;if(!from)return;const ease=springEase();
  const ink=root.current?.querySelector<HTMLElement>('[data-tab-ink]'),to=ink?.getBoundingClientRect();
  if(ink?.animate&&to?.width)ink.animate([{transform:`translate(${from.left-to.left}px,0) scaleX(${from.width/to.width})`},{transform:'none'}],{duration:520,easing:ease});
  const page=root.current?.querySelector<HTMLElement>('[data-stage]');
  page?.animate?.([{opacity:0,transform:'translateY(14px) rotate(-.6deg)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0% 0)'}],{duration:480,easing:'cubic-bezier(.2,.8,.2,1)'});
 },[mode]);
 const hold=dragging??selected;
 const big=hold??focusN;

 // the thread between consecutive numbers that are both on the pitch
 const threads=useMemo(()=>SPOTS.slice(0,-1).map((s,i)=>({a:s,b:SPOTS[i+1]})).filter(({a,b})=>placed.has(a.n)&&placed.has(b.n)),[placed]);

 // ---- Colours: the clash tester and the scan test -----------------------------------------------------------------------
 const checks=useMemo(()=>lawChecks(kits),[kits]);
 const allOk=checks.every(c=>c.ok),passed=checks.filter(c=>c.ok).length;
 const gap=colourGap(kits.home,kits.away);
 const pick=(id:string)=>{setKits(k=>({...k,[role]:id}));museumSfx.card();};
 const preset=(k:Kits)=>{setKits(k);museumSfx.card();};
 const startScan=()=>{museumSfx.whistle();const scene=scanScene();startAt.current=performance.now();setScan({phase:'live',round:1,scene,times:[],misses:0,flash:null,say:'Find your free team-mate. Tap them!'});};
 const tapPlayer=(id:string,what:'mate'|'opp'|'ref'|'keeper')=>{
  if(scan.phase!=='live'||scan.flash?.kind==='ok')return;
  const s=scan.scene;
  if(id===s.freeId){
   const t=(performance.now()-startAt.current)/1000,times=[...scan.times,t];museumSfx.kick();
   setScan(v=>({...v,times,flash:{id,kind:'ok'},say:`Free! Found in ${t.toFixed(1)} seconds.`}));
   later(()=>{
    if(times.length>=ROUNDS){
     const avg=times.reduce((a,b)=>a+b,0)/times.length,isClash=!allOk;
     setRuns(r=>[{avg,misses:scan.misses,clash:isClash,kits:`${swatch(kits.home).name} v ${swatch(kits.away).name}, referee in ${swatch(kits.referee).name.toLowerCase()}`},...r].slice(0,4));
     setScan(v=>({...v,phase:'done',flash:null,say:''}));museumSfx.reveal();
    }else{const scene=scanScene();startAt.current=performance.now();setScan(v=>({...v,round:v.round+1,scene,flash:null,say:'Next ball! Find the free team-mate.'}));}
   },650);
   return;
  }
  const say=what==='mate'?'That team-mate has an opponent right next to them. Look for one with space.':what==='ref'?'That’s the referee! A pass to them is a pass to nobody.':what==='keeper'?'That’s their goalkeeper!':'That’s the other team! Check the shirt colour.';
  museumSfx.tick();setScan(v=>({...v,misses:v.misses+1,flash:{id,kind:'bad'},say}));later(()=>setScan(v=>v.flash?.id===id&&v.flash.kind==='bad'?{...v,flash:null}:v),500);
 };
 const ext=useMemo(()=>extras(scan.scene),[scan.scene]);
 const keyAct=(fn:()=>void)=>(e:ReactKeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};
 const where=(x:number,y:number)=>`${y<24?'far':y<44?'middle':'near'} ${x<36?'left':x>64?'right':'centre'}`;
 // the lesson of the scan: clear kits against clashing kits, once the visitor has tried both
 const lastClear=runs.find(r=>!r.clash),lastClash=runs.find(r=>r.clash);
 const compare=lastClear&&lastClash?lastClash.avg-lastClear.avg:null;

 const facts=exhibit.facts;
 const fact=WOVEN[factI];
 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="shirts" data-mode={mode} data-dragging={dragging!=null||undefined} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <header className={styles.top}>
   <p className={styles.eyebrow}><b>{exhibit.year}</b> · The Kit Room</p>
   <div className={styles.tabs} role="tablist" aria-label="Kit Room beats">
    {MODES.map((t,i)=><button key={t.id} type="button" role="tab" aria-selected={mode===t.id} className={styles.tab} onClick={()=>switchMode(t.id)}>
     {mode===t.id&&<i className={styles.tabInk} data-tab-ink aria-hidden="true"/>}<span>{i+1}</span> <em>{t.label}</em></button>)}
   </div>
  </header>

  {mode==='decades'?<Decades key="decades" onNext={()=>switchMode('numbers')}/>
  :mode==='fulltime'?<FullTime key="fulltime" forYourGame={exhibit.forYourGame} onRestart={()=>switchMode('decades')}/>
  :mode==='numbers'?<div key="numbers" className={styles.stage} data-stage="numbers" data-done={done||undefined}>
   <div className={styles.story}>
    <h1 className={styles.title}>Numbers on&nbsp;the&nbsp;back</h1>
    <p className={styles.lede}>{facts[0]}</p>
    <div className={styles.readout} aria-live="polite">
     <div className={styles.bigShirt} key={big??'none'} data-has={big!=null||undefined}>
      {big!=null?<ShirtArt n={big} fill={shirtInk(big)}/>:<ShirtArt n="?" fill="none" outline/>}
     </div>
     <div className={styles.readText}>
      <p className={styles.role}>{big!=null?spotOf(big).role:'Eleven shirts'}</p>
      <p className={styles.note} data-tone={note.tone}>{note.text}</p>
     </div>
    </div>
    {done?<div className={styles.woven}>
     <div className={styles.factCard} key={factI}>
      <p className={styles.factTitle}>{fact.title}<span>{factI+1}/{WOVEN.length}</span></p>
      <p>{fact.text}</p>
     </div>
     <div className={styles.row}>
      {factI<WOVEN.length-1
       ?<button type="button" className={styles.primary} onClick={()=>{setFactI(i=>i+1);museumSfx.card();}}>Next fact →</button>
       :<button type="button" className={styles.primary} onClick={()=>switchMode('colours')}>Now try the colours →</button>}
      <button type="button" className={styles.ghostBtn} onClick={restart}>Hang them again</button>
     </div>
    </div>:<p className={styles.clue}>Clue from the case: <b>{facts[1]}</b></p>}
    <Sources/>
   </div>

   <div className={styles.pitchWrap}>
    <div ref={pitch} className={styles.pitch} data-done={done||undefined} data-holding={hold!=null||undefined}>
     <svg viewBox="0 0 68 105" className={styles.pitchSvg} aria-hidden="true" preserveAspectRatio="none">
      <defs><radialGradient id={`${gid}v`} cx=".5" cy=".45" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".28"/></radialGradient></defs>
      {Array.from({length:10},(_,i)=><rect key={i} x="0" y={i*10.5} width="68" height="10.5" fill={i%2?'#256f49':'#2b7c52'}/>)}
      <rect width="68" height="105" fill={`url(#${gid}v)`}/>
      <g fill="none" stroke="rgba(255,255,255,.8)" strokeWidth=".45">
       <rect x="2" y="2" width="64" height="101"/><line x1="2" y1="52.5" x2="66" y2="52.5"/><circle cx="34" cy="52.5" r="9.15"/>
       <rect x="13.85" y="86.5" width="40.3" height="16.5"/><rect x="24.85" y="97.5" width="18.3" height="5.5"/>
       <rect x="13.85" y="2" width="40.3" height="16.5"/><rect x="24.85" y="2" width="18.3" height="5.5"/>
       <path d="M26.7 86.5 A9.15 9.15 0 0 1 41.3 86.5"/><path d="M26.7 18.5 A9.15 9.15 0 0 0 41.3 18.5"/>
      </g>
      <circle cx="34" cy="52.5" r=".7" fill="rgba(255,255,255,.8)"/>
      <rect x="30.3" y="103" width="7.4" height="1.6" fill="#fff"/><rect x="30.3" y=".4" width="7.4" height="1.6" fill="#fff"/>
      <text x="34" y="26.5" textAnchor="middle" fontSize="2.3" fontWeight="700" fill="rgba(255,255,255,.6)" letterSpacing=".5" fontFamily="system-ui, sans-serif">ATTACKING THIS WAY ↑</text>
      {threads.map(({a,b})=><line key={a.n} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.thread}/>)}
      {done&&<polyline points={SPOTS.map(s=>`${s.x},${s.y}`).join(' ')} pathLength={200} className={styles.weave}/>}
     </svg>
     {SPOTS.map((s,i)=>{const on=placed.has(s.n),hint=!on&&hold!=null&&hold===s.n&&(tries[s.n]??0)>=2;
      return <button key={s.n} type="button" data-museum-own-cue className={styles.spot} style={{left:`${s.x/68*100}%`,top:`${s.y/105*100}%`,['--i' as string]:i}}
       data-on={on||undefined} data-hint={hint||undefined} data-wrong={wrong?.n===s.n||undefined} data-ready={hold!=null&&!on||undefined} data-spot={s.n}
       aria-label={on?`${s.role}: number ${s.n}`:`${s.role} spot, empty${selected!=null?`: place number ${selected} here`:''}`} onClick={()=>onSpotClick(s)}>
       {on?<ShirtArt n={s.n} fill={shirtInk(s.n)} className={styles.spotShirt}/>:<span className={styles.ring} aria-hidden="true"/>}
       {on&&justN===s.n&&<span className={styles.burst} aria-hidden="true"/>}
       <span className={styles.spotLabel} aria-hidden="true">{s.short}</span>
      </button>;})}
     {done&&<div className={styles.stamp} aria-hidden="true"><b>2-3-5</b><span>1928</span></div>}
    </div>
   </div>

   <div className={styles.rail}>
    <div className={styles.railHead}>
     <p className={styles.railLabel}>Shirt line<span aria-label={`${placed.size} of 11 hung`}>{placed.size}/11</span></p>
     {done?<span className={styles.allHung}>All on the pitch</span>:<button type="button" className={styles.smallBtn} onClick={hangAll}>Hang them all</button>}
    </div>
    <div className={styles.pips} aria-hidden="true">{SPOTS.map(s=><i key={s.n} data-on={placed.has(s.n)||undefined}/>)}</div>
    <div className={styles.line} role="group" aria-label="The shirt line: pick up a shirt">
     {SPOTS.map((s,i)=>{const on=placed.has(s.n);
      return <button key={s.n} type="button" data-museum-own-cue className={styles.peg} style={{['--tilt' as string]:`${(i%3-1)*3}deg`}} data-gone={on||undefined} data-held={hold===s.n||undefined} data-shirt={s.n}
       aria-label={on?`Number ${s.n} is on the pitch`:`Shirt number ${s.n}`} aria-pressed={selected===s.n} disabled={on}
       onPointerDown={onShirtDown(s.n)} onPointerMove={onShirtMove} onPointerUp={onShirtUp(s.n)} onPointerCancel={onShirtCancel} onClick={()=>onShirtClick(s.n)}>
       <span className={styles.clip} aria-hidden="true"/>
       <ShirtArt n={s.n} fill={shirtInk(s.n)} className={styles.pegShirt}/>
      </button>;})}
    </div>
   </div>
   {dragging!=null&&<div ref={ghost} className={styles.ghost} aria-hidden="true"><ShirtArt n={dragging} fill={shirtInk(dragging)}/></div>}
  </div>

  :<div key="colours" className={styles.stage} data-stage="colours">
   <div className={styles.story}>
    <h1 className={styles.title}>Colours you can’t mix&nbsp;up</h1>
    <p className={styles.lede}>{facts[2]}</p>
    <div className={styles.kitCard}>
     <p className={styles.cardLabel}>Kit designer · tap a shirt, then a colour</p>
     <div className={styles.roles} role="radiogroup" aria-label="Whose kit are you colouring?">
      {KIT_ROLES.map(r=><button key={r.key} type="button" role="radio" aria-checked={role===r.key} className={styles.roleBtn} onClick={()=>setRole(r.key)}>
       <ShirtArt fill={swatch(kits[r.key]).hex} className={styles.roleShirt}/><span>{r.label}</span>
      </button>)}
     </div>
     <div className={styles.palette} role="radiogroup" aria-label={`Colour for ${KIT_ROLES.find(r=>r.key===role)!.label.toLowerCase()}`}>
      {SWATCHES.map(c=><button key={c.id} type="button" role="radio" data-museum-own-cue aria-checked={kits[role]===c.id} aria-label={c.name} className={styles.swatch} style={{background:c.hex}} onClick={()=>pick(c.id)}/>)}
     </div>
     <div className={styles.meter} data-clash={gap<CLASH_DE||undefined} aria-label={`Colour gap between the teams: ${Math.round(gap)}, ${gap<CLASH_DE?'too close':'clear'}`} role="img">
      <span className={styles.meterLabel}>Team colour gap</span>
      <span className={styles.meterBar}><i style={{transform:`scaleX(${Math.min(1,gap/120)})`}}/><b style={{left:`${CLASH_DE/120*100}%`}}/></span>
      <span className={styles.meterValue}>{gap<CLASH_DE?'Too close':'Clear'}</span>
     </div>
    </div>
    <ul className={styles.checks} aria-live="polite" aria-label="Law 4 checks">
     {checks.map(c=><li key={c.id} data-ok={c.ok}><span key={String(c.ok)} className={styles.tick} aria-hidden="true">{c.ok?'✓':'✗'}</span><div><b><i>{CHECK_SHORT[c.id]}</i><em>{c.rule}</em></b><small>{c.why}</small></div></li>)}
    </ul>
    <Sources/>
   </div>

   <div className={styles.scanWrap}>
    <div className={styles.scanHead}>
     <p><b>Scan test.</b> <span className={styles.headTip}>{exhibit.forYourGame}</span></p>
     <button type="button" className={styles.greyBtn} aria-pressed={grey} onClick={()=>{setGrey(g=>!g);museumSfx.card();}}><span aria-hidden="true"/>{grey?'Colour':'Grey'}</button>
     <span className={styles.lawBadge} data-ok={allOk} key={passed}>Law 4 · {passed}/3</span>
    </div>
    <div className={styles.scanBox}><div className={styles.scan} data-live={scan.phase==='live'||undefined} data-clash={!allOk||undefined} data-grey={grey||undefined}>
     <svg viewBox="0 0 100 70" className={styles.scanSvg} role="group" aria-label={scan.phase==='live'?'The pitch in front of you. Find the free team-mate.':'The pitch in front of you'}>
      <defs><radialGradient id={`${gid}s`} cx=".5" cy=".6" r=".8"><stop offset=".5" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".3"/></radialGradient></defs>
      <rect width="100" height="70" fill="#2b7c52"/>
      {Array.from({length:5},(_,i)=><rect key={i} x="0" y={i*14} width="100" height="7" fill="#256f49"/>)}
      <rect width="100" height="70" fill={`url(#${gid}s)`}/>
      <g fill="none" stroke="rgba(255,255,255,.75)" strokeWidth=".4"><line x1="0" y1="66" x2="100" y2="66"/><circle cx="50" cy="66" r="12"/><rect x="25" y="0" width="50" height="12"/><rect x="38" y="0" width="24" height="4.5"/></g>
      {/* the ball, rolling to you */}
      <g aria-hidden="true"><line x1="50" y1="69.5" x2={scan.scene.you.x} y2={scan.scene.you.y+4} stroke="rgba(255,255,255,.5)" strokeWidth=".5" strokeDasharray="1 1"/><circle cx={scan.scene.you.x+3.5} cy={scan.scene.you.y+4} r="1.6" fill="#fff" stroke="#111" strokeWidth=".3"/></g>
      <Token x={scan.scene.you.x} y={scan.scene.you.y} fill={swatch(kits.home).hex} label="You" you/>
      <Token x={ext.keeper.x} y={ext.keeper.y} fill={swatch(kits.awayGk).hex} live={scan.phase==='live'} name="their-keeper" flash={scan.flash?.id==='their-keeper'?scan.flash.kind:undefined}
       aria={`Player in ${swatch(kits.awayGk).name.toLowerCase()}, in goal`} onTap={()=>tapPlayer('their-keeper','keeper')} onKey={keyAct(()=>tapPlayer('their-keeper','keeper'))}/>
      <Token x={ext.ref.x} y={ext.ref.y} fill={swatch(kits.referee).hex} live={scan.phase==='live'} name="ref" flash={scan.flash?.id==='ref'?scan.flash.kind:undefined}
       aria={`Person in ${swatch(kits.referee).name.toLowerCase()}, ${where(ext.ref.x,ext.ref.y)}`} onTap={()=>tapPlayer('ref','ref')} onKey={keyAct(()=>tapPlayer('ref','ref'))}/>
      {scan.scene.players.map(p=>{const fill=swatch(p.team==='mate'?kits.home:kits.away).hex,act=()=>tapPlayer(p.id,p.team);
       return <Token key={p.id} x={p.x} y={p.y} fill={fill} live={scan.phase==='live'} name={p.id} flash={scan.flash?.id===p.id?scan.flash.kind:undefined}
        aria={`Player in ${swatch(p.team==='mate'?kits.home:kits.away).name.toLowerCase()}, ${where(p.x,p.y)}`} onTap={act} onKey={keyAct(act)}/>;})}
     </svg>
     {grey&&<p className={styles.greyNote}>Grey view: can you still tell the teams apart?</p>}
     {scan.phase==='live'&&<p className={styles.round} aria-live="polite"><b>Ball {scan.round}/{ROUNDS}</b>{scan.say?<span key={scan.say+scan.misses}>{scan.say}</span>:null}</p>}
     {scan.phase!=='live'&&<div className={styles.scanCard} key={scan.phase+runs.length}>
      {scan.phase==='done'&&runs[0]?<>
       <p className={styles.result}><b>{runs[0].avg.toFixed(1)} s</b> per ball{runs[0].misses?`, ${runs[0].misses} wrong ${runs[0].misses===1?'pass':'passes'}`:', no wrong passes'}</p>
       <p>{runs[0].clash?'Those kits clash. Did you have to look twice? That is exactly why the Laws say teams must look different.':'Clear kits: one glance tells you who is free. Now press “Make a clash” and try again.'}</p>
       {compare!=null&&<p className={styles.compare} data-slower={compare>0||undefined}>{compare>0?`Clashing kits cost you ${compare.toFixed(1)} s a ball. In a real match, that’s when the ball gets taken.`:'You were just as quick with clashing kits. Sharp eyes! Most players need a second look.'}</p>}
      </>:<p><span className={styles.cardTip}>{exhibit.forYourGame} </span><span className={styles.cardLong}>You’re about to get the ball. <b>Look up</b>: which team-mate has space? </span>Your team wears <b style={{color:swatch(kits.home).hex}} className={styles.chip}>{swatch(kits.home).name.toLowerCase()}</b>.</p>}
      {runs.length>1&&<ol className={styles.runs} aria-label="Your scan times">
       {runs.map((r,i)=><li key={runs.length-i} data-clash={r.clash}><b>{r.avg.toFixed(1)} s</b> {r.kits}{r.clash?' · clash':''}</li>)}
      </ol>}
      <div className={styles.row}><button type="button" data-museum-own-cue className={scan.phase==='done'?styles.ghostBtn:styles.primary} onClick={startScan}>{scan.phase==='done'?'Scan again':'Start the scan test'} · {ROUNDS} balls</button>
       {scan.phase==='done'&&<button type="button" className={styles.primary} onClick={()=>switchMode('fulltime')}>Full time: kit quiz →</button>}</div>
     </div>}
    </div></div>
    <div className={styles.presets} role="group" aria-label="Try these kits"><span className={styles.tryLabel}>Try</span>
     <button type="button" data-museum-own-cue className={styles.ghostBtn} onClick={()=>preset({home:'red',away:'orange',homeGk:'green',awayGk:'yellow',referee:'black'})}>Make a clash</button>
     <button type="button" data-museum-own-cue className={styles.ghostBtn} onClick={()=>preset({home:'navy',away:'royal',homeGk:'amber',awayGk:'yellow',referee:'black'})}>Make it worse</button>
     <button type="button" data-museum-own-cue className={styles.ghostBtn} onClick={()=>preset(DEFAULT_KITS)}>Fix it</button>
    </div>
   </div>
  </div>}
 </section>;
}

function Token({x,y,fill,you,label,aria,live,name,flash,onTap,onKey}:{x:number;y:number;fill:string;you?:boolean;label?:string;aria?:string;live?:boolean;name?:string;flash?:'ok'|'bad';onTap?:()=>void;onKey?:(e:ReactKeyboardEvent)=>void}){
 const art=<>
  <ellipse cx={x+.4} cy={y+3.6} rx="3.4" ry="1.3" fill="rgba(0,0,0,.28)"/>
  {you&&<circle cx={x} cy={y} r="5.4" fill="none" stroke="#fff3c4" strokeWidth=".5" strokeDasharray="1.2 .9"/>}
  <path d={SHIRT} transform={`translate(${x-3.6} ${y-3.4}) scale(.18)`} fill={fill} stroke="rgba(0,0,0,.45)" strokeWidth="2.2" strokeLinejoin="round"/>
  <path d="M13 3 Q20 8.5 27 3" transform={`translate(${x-3.6} ${y-3.4}) scale(.18)`} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.4"/>
  {flash&&<circle cx={x} cy={y} r="5.6" fill="none" stroke={flash==='ok'?'#ffe066':'#ff4d4d'} strokeWidth=".9" className={flash==='ok'?styles.flashOk:styles.flash}/>}
 </>;
 if(you)return <g aria-hidden="true">{art}<text x={x} y={y+7.6} textAnchor="middle" fontSize="2.6" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">{label}</text></g>;
 if(!live)return <g aria-hidden="true">{art}</g>;
 return <g role="button" tabIndex={0} aria-label={aria} data-museum-own-cue data-token={name} className={styles.token} onClick={onTap} onKeyDown={onKey}>
  <circle cx={x} cy={y} r="6.2" fill="transparent"/>{art}
 </g>;
}

function Sources(){
 return <details className={styles.sources}>
  <summary>Sources</summary>
  <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
  <p>Real history. The scan test is a practice game, not a real match.</p>
 </details>;
}
