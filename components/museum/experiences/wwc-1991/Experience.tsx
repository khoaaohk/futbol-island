'use client';
import {flushSync} from 'react-dom';
import {useCallback,useEffect,useRef,useState,type CSSProperties,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {EDITIONS,WINNER_COLOR,titles,SOURCES,type Edition} from './data';
import {FinalPitch,FinalPanel,useReplay} from './FinalReplay';
import {DarkStage,DarkPanel,useDarkYears} from './DarkYears';
import {Chevron,Play} from './icons';
import styles from './wwc.module.css';

/**
 * wwc-1991 · "A Sky of Firsts" (Oct 5 2026, polished the same day). Every FIFA Women's World Cup is a star in one constellation;
 * the first one, China 1991, ignites first and brightest, then the line draws star to star to 2023 and a dashed promise to 2027.
 * Tap a star for its host, final and star player. "1991 final" replays USA 2–1 Norway as an animated goal map (Michelle Akers
 * scored both US goals). "Banned years" scrubs 1920 → 1991 through the decades when women's football was banned in England,
 * Brazil and West Germany, until the first star ignites. Real history, sourced in data.ts.
 * Heat: the night sky (far dust + nebulae, near stars) is drawn ONCE to two canvases (redrawn only on resize); mouse parallax is
 * event-driven CSS transforms (no loop); the only animation loops are the replay and the time-travel play button, both rAF that
 * stop when finished, paused, hidden or unmounted. Everything else is finite CSS (ignition, line draw, a few twinkles).
 */
type Mode='stars'|'final'|'dark';
const WIDE:[number,number][]=[[8,74],[18,52],[28,66],[37,40],[47,58],[56,32],[66,50],[75,24],[85,38],[93,70]];
const TALL:[number,number][]=[[22,90],[70,80],[26,69],[74,59],[28,48],[72,38],[26,28],[68,18],[30,8],[82,6]];
const color=(e:Edition)=>e.winner?WINNER_COLOR[e.winner]:'#c8d2ff';
const size=(e:Edition)=>e.year===1991?22:6+e.teams/3;
/** Ignition timeline (seconds): 1991 first, then the line reaches each star in turn. */
const T0=.35,T1=1.25,STEP=.26;
const lightAt=(i:number)=>i===0?T0:T1+(i-1)*STEP;

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [mode,setMode]=useState<Mode>('stars');
 const [sel,setSel]=useState(0);
 const [touched,setTouched]=useState(false);
 const [tall,setTall]=useState(false);
 const [skyKey,setSkyKey]=useState(0);
 const [seen,setSeen]=useState<ReadonlySet<number>>(()=>new Set([0]));
 /** True from the moment the last star is visited until the sky is re-lit (so a re-ignition draws its lines afresh). */
 const [complete,setComplete]=useState(false);
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),bg=useRef<HTMLCanvasElement>(null),near=useRef<HTMLCanvasElement>(null);
 const reduced=useRef(false);
 useEffect(()=>{reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;},[]);
 const replay=useReplay(reduced);
 const dark=useDarkYears(reduced);

 // The night sky: two layers drawn once, redrawn only when the screen size changes (no loop at all).
 useEffect(()=>{const c=bg.current,n=near.current,st=stage.current;if(!c||!n||!st)return;
  const draw=()=>{const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;const coarse=matchMedia('(pointer:coarse)').matches;
   const dpr=Math.min(window.devicePixelRatio||1,coarse?1.5:2);let seed=1991;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   const gauss=()=>(rnd()+rnd()+rnd()-1.5)/1.5;
   const prep=(cv:HTMLCanvasElement)=>{cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const g=cv.getContext('2d');if(!g)return null;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);return g;};
   const g=prep(c);if(!g)return;const portrait=w/h<1.05;
   // Nebulae: soft coloured clouds, low alpha, light from the lower left (where the first star sits).
   const cloud=(x:number,y:number,r:number,col:string,a:number)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col+a.toString(16).padStart(2,'0'));gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);};
   const D=Math.hypot(w,h);
   cloud(w*.12,h*.82,D*.42,'#6a4bff',0x22);cloud(w*.55,h*.35,D*.35,'#b04bd0',0x10);cloud(w*.85,h*.15,D*.3,'#2bb3c0',0x0e);cloud(w*.3,h*.25,D*.25,'#3a5bff',0x0c);
   // The milky band, rising like the constellation (bottom-left to top-right; bottom to top on tall screens).
   const ang=portrait?-Math.PI/2.4:-Math.atan2(h*.75,w),cx=w*.5,cy=h*.55;
   g.save();g.translate(cx,cy);g.rotate(ang);g.scale(1,.16);const band=g.createRadialGradient(0,0,0,0,0,D*.6);band.addColorStop(0,'#b9c4ff1c');band.addColorStop(.5,'#9fb0ff0c');band.addColorStop(1,'#9fb0ff00');
   g.fillStyle=band;g.beginPath();g.arc(0,0,D*.6,0,Math.PI*2);g.fill();g.restore();
   const dot=(x:number,y:number,r:number,a:number)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=`rgba(${215+rnd()*40|0},${222+rnd()*33|0},255,${a})`;g.fill();};
   const nField=Math.round(Math.min(380,w*h/2800));
   for(let i=0;i<nField;i++)dot(rnd()*w,rnd()*h,rnd()<.94?rnd()*.7+.2:rnd()*1.1+.7,.18+rnd()*.5);
   const nBand=Math.round(Math.min(520,w*h/2000)),ca=Math.cos(ang),sa=Math.sin(ang);
   for(let i=0;i<nBand;i++){const along=(rnd()-.5)*D,across=gauss()*D*.07;dot(cx+along*ca-across*sa,cy+along*sa+across*ca,rnd()*.55+.15,.12+rnd()*.38);}
   // Near layer: fewer, brighter stars with glow; a handful with soft cross spikes. It moves more with the mouse (depth).
   const k=prep(n);if(!k)return;
   const nNear=Math.round(Math.min(46,w*h/22000));
   for(let i=0;i<nNear;i++){const x=rnd()*w,y=rnd()*h,r=rnd()*1+.6,a=.45+rnd()*.45,hue=rnd();
    const col=hue<.2?'255,226,190':hue<.4?'190,210,255':'235,240,255';
    const gl=k.createRadialGradient(x,y,0,x,y,r*6);gl.addColorStop(0,`rgba(${col},${a*.5})`);gl.addColorStop(1,`rgba(${col},0)`);k.fillStyle=gl;k.fillRect(x-r*6,y-r*6,r*12,r*12);
    k.beginPath();k.arc(x,y,r,0,Math.PI*2);k.fillStyle=`rgba(${col},${a})`;k.fill();
    if(r>1.35){k.strokeStyle=`rgba(${col},${a*.35})`;k.lineWidth=.6;k.beginPath();k.moveTo(x-r*7,y);k.lineTo(x+r*7,y);k.moveTo(x,y-r*7);k.lineTo(x,y+r*7);k.stroke();}}
   // A vignette to give the sky a frame.
   const v=k.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,D*.62);v.addColorStop(0,'#03051600');v.addColorStop(1,'#030516b0');k.fillStyle=v;k.fillRect(0,0,w,h);
  };
  const measure=()=>{const r=st.getBoundingClientRect();setTall(r.width<600||r.width/Math.max(1,r.height)<1.05);draw();};
  measure();const ro=new ResizeObserver(measure);ro.observe(st);ro.observe(c);return()=>ro.disconnect();},[]);

 // Depth: with a mouse, the two sky layers drift a few pixels against each other. Event-driven, eased by a CSS transition.
 const parallax=useCallback((ev:RPointerEvent<HTMLElement>)=>{if(ev.pointerType!=='mouse'||reduced.current)return;const r=root.current;if(!r)return;
  r.style.setProperty('--px',(ev.clientX/innerWidth*2-1).toFixed(3));r.style.setProperty('--py',(ev.clientY/innerHeight*2-1).toFixed(3));},[]);

 const visit=useCallback((i:number)=>{setSel(i);setTouched(true);if(seen.has(i))return;const n=new Set(seen);n.add(i);setSeen(n);if(n.size===EDITIONS.length){museumSfx.reveal();setComplete(true);}},[seen]);
 const pick=useCallback((i:number)=>{visit(Math.max(0,Math.min(EDITIONS.length-1,i)));museumSfx.flap();},[visit]);
 // Views swap through a same-document View Transition where supported (Safari 18+, Chrome, Firefox 144+); otherwise the
 // .scene/.pane rise keyframes still ease the change in. Reduced motion: an instant swap.
 const go=useCallback((m:Mode)=>{const d=document as Document&{startViewTransition?:(cb:()=>void)=>unknown};
  if(d.startViewTransition&&!reduced.current)d.startViewTransition(()=>flushSync(()=>setMode(m)));else setMode(m);if(m==='final')replay.start();if(m!=='final')replay.pause();if(m!=='dark')dark.pause();},[replay,dark]);
 const backToSky=useCallback(()=>{setSel(0);setComplete(false);setSkyKey(k=>k+1);go('stars');},[go]);

 // Keyboard: Escape leaves, arrows walk the constellation.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();return;}
  if(mode!=='stars'||(e.target instanceof HTMLElement&&e.target.matches('input,summary,a')))return;
  if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();pick(sel+1);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();pick(sel-1);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[mode,onClose,pick,sel]);

 const pos=tall?TALL:WIDE,ar=tall?.75:5/3,e=EDITIONS[sel];
 return <section ref={root} className={styles.root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="wwc-1991" data-mode={mode} onPointerMove={parallax}>
  <canvas ref={bg} className={`${styles.bg} ${styles.far}`} aria-hidden="true"/>
  <canvas ref={near} className={`${styles.bg} ${styles.near}`} aria-hidden="true"/>
  <ExperienceBack onClose={onClose}/>
  <header className={styles.header}>
   <h1 className={styles.title}>A sky of <b>firsts</b></h1>
   <span className={styles.real}>Real history</span>
  </header>

  <div ref={stage} className={styles.stage}>
   <div key={mode} className={styles.scene}>
   {mode==='stars'&&<div key={skyKey+(tall?'t':'w')} className={styles.sky} data-complete={complete||undefined} style={{'--ar':ar} as CSSProperties} role="group" aria-label="Every FIFA Women’s World Cup as a star. Bigger stars had more teams.">
    <svg className={styles.lines} viewBox={`0 0 ${100*ar} 100`} aria-hidden="true">
     <defs><filter id="wwcGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".6"/></filter></defs>
     {pos.slice(1).map((p,i)=>{const a=pos[i],fut=EDITIONS[i+1].upcoming,on=sel===i||sel===i+1;
      const st={'--d':`${i===0?T0+.45:lightAt(i)}s`,'--t':`${i===0?T1-T0-.45:STEP}s`} as CSSProperties;
      return <g key={i} data-future={fut||undefined} data-on={on||undefined} className={styles.seg} style={{'--i':i} as CSSProperties}>
       <line className={styles.segGlow} pathLength={1} x1={a[0]*ar} y1={a[1]} x2={p[0]*ar} y2={p[1]} style={st} filter="url(#wwcGlow)"/>
       <line className={styles.segLine} pathLength={1} x1={a[0]*ar} y1={a[1]} x2={p[0]*ar} y2={p[1]} style={st}/>
      </g>;})}
    </svg>
    {EDITIONS.map((ed,i)=><button key={ed.year} type="button" className={styles.star} data-first={ed.year===1991||undefined} data-future={ed.upcoming||undefined} aria-pressed={i===sel} data-seen={seen.has(i)||undefined} data-museum-own-cue
      data-side={tall?(pos[i][0]<50?'l':'r'):'b'}
      aria-label={`${ed.year}, ${ed.host}. ${ed.upcoming?'Not played yet':`Won by ${ed.winner}`}. ${ed.teams} teams.`} onClick={()=>pick(i)}
      style={{left:`${pos[i][0]}%`,top:`${pos[i][1]}%`,'--r':`${size(ed)}px`,'--c':color(ed),'--d':`${lightAt(i)}s`,'--tw':`${2.6+(i%4)*.7}s`} as CSSProperties}>
     <span className={styles.glow}/><span className={styles.spikes}/><span className={styles.core}/>
     {ed.year===1991&&<span className={styles.wave}/>}
     <span className={styles.yr}>{ed.year}<small>{ed.upcoming?'next':ed.winner}</small></span></button>)}
    {complete&&<p className={styles.done} role="status"><b>Every star visited</b><span>9 World Cups played. One star still to light.</span></p>}
    {!touched&&<span className={styles.hint}><i aria-hidden="true"/>Tap any star to visit that World Cup</span>}
   </div>}
   {mode==='final'&&<FinalPitch r={replay}/>}
   {mode==='dark'&&<DarkStage d={dark} onLit={backToSky}/>}
   </div>
  </div>

  <aside className={styles.panel} aria-label="About this star">
   <div className={styles.tabs} role="tablist" aria-label="Views">
    {([['stars','Stars'],['final','1991 final'],['dark','Banned years']] as [Mode,string][]).map(([m,l])=><button key={m} type="button" role="tab" aria-selected={mode===m} onClick={()=>go(m)}>{l}</button>)}
   </div>
   <div key={mode} className={styles.pane}>
    {mode==='stars'&&<StarCard e={e} sel={sel} seen={seen.size} pick={pick} onReplay={()=>go('final')} onDark={()=>go('dark')}/>}
    {mode==='final'&&<FinalPanel r={replay} onSky={backToSky}/>}
    {mode==='dark'&&<DarkPanel d={dark} onLit={backToSky}/>}
   </div>
   <details className={styles.sources}><summary>Sources</summary>
    <p>Everything here is real football history, not part of the island’s story. The 1991 goal spots on the map are drawn to show how each goal happened.</p>
    <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul>
   </details>
  </aside>
 </section>;
}

function StarCard({e,sel,seen,pick,onReplay,onDark}:{e:Edition;sel:number;seen:number;pick:(i:number)=>void;onReplay:()=>void;onDark:()=>void}){
 const eyebrow=e.year===1991?'The very first Women’s World Cup':e.upcoming?'The next Women’s World Cup':`Women’s World Cup number ${sel+1}`;
 return <div className={styles.starCard} style={{'--c':color(e)} as CSSProperties}>
  <div key={e.year} className={styles.card} aria-live="polite">
   <p className={styles.eyebrow}>{eyebrow}</p>
   <div className={styles.big}><span className={styles.bigYear}>{e.year}</span><span className={styles.host}><b>{e.host}</b><span>{e.teams} teams</span></span></div>
   <p className={styles.score}>{e.upcoming?e.final:<>Final: {e.final}</>}</p>
  </div>
  <div key={'b'+e.year} className={`${styles.card} ${styles.cardBody}`}>
   <p className={styles.who}><b>{e.upcoming?e.star:e.star+'.'}</b> {e.starWhy}</p>
   <p className={styles.note}>{e.note}</p>
  </div>
  <div className={styles.row}>
   <button type="button" className={`${styles.btn} ${styles.icon}`} aria-label="Earlier World Cup" disabled={sel===0} onClick={()=>pick(sel-1)}><Chevron left/></button>
   <span className={styles.count}>{seen} of {EDITIONS.length}<small>visited</small></span>
   <button type="button" className={`${styles.btn} ${styles.icon}`} aria-label="Later World Cup" disabled={sel===EDITIONS.length-1} onClick={()=>pick(sel+1)}><Chevron/></button>
   <span className={styles.grow}/>
   {e.year===1991?<button type="button" className={`${styles.btn} ${styles.gold}`} onClick={onReplay}><Play/>Replay the final</button>
    :<button type="button" className={styles.btn} onClick={onDark}>Before 1991</button>}
  </div>
  <div className={styles.extra}>
   <p className={styles.eyebrow}>Teams at each World Cup</p>
   <div className={styles.growth} role="img" aria-label="The number of teams grew from 12 in 1991 to 16 in 1999, 24 in 2015 and 32 in 2023.">
    {EDITIONS.map((ed,i)=><span key={ed.year} data-on={i===sel||undefined} data-future={ed.upcoming||undefined} style={{'--h':ed.teams/32,'--c':color(ed)} as CSSProperties}>
     <i/>{(i===0||EDITIONS[i-1].teams!==ed.teams)&&!ed.upcoming&&<em>{ed.teams}</em>}</span>)}
   </div>
   <div className={styles.growthAxis} aria-hidden="true"><span>1991</span><span>2027</span></div>
  </div>
  <div className={styles.titlesBox}>
   <p className={styles.eyebrow}>Titles so far</p>
   <ul className={styles.legend}>{titles().map(([t,n])=><li key={t} style={{'--c':WINNER_COLOR[t as keyof typeof WINNER_COLOR]} as CSSProperties}>
    <b>{t}</b><span className={styles.pips} aria-label={`${n} ${n===1?'title':'titles'}`}>{Array.from({length:n},(_,k)=><i key={k}/>)}</span></li>)}</ul>
  </div>
 </div>;
}
