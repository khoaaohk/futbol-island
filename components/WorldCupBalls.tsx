'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {NavigationButton} from './DoneButton';
import styles from './WorldCupBalls.module.css';
import {COMPETITIONS,findBall,type WcBall,type WcCompetition} from '@/lib/museum/wcBalls/catalog';
import {ballDesign,DESIGN_IDS} from '@/lib/museum/wcBalls/designs';
import {ballSource} from '@/lib/museum/wcBalls/sources';
import BallStoryDrawer from './BallStoryDrawer';
import type {BallViewer} from '@/lib/museum/wcBalls/ballViewer';

/**
 * The museum's World Cup ball gallery (Oct 5 2026): full screen, a studio sweep with one ball you turn by dragging, and a
 * year timeline underneath (1930 → today) that you scrub, tap, scroll or arrow through. Tournaments with their own final ball
 * get a "Final ball" switch, and a Men's / Women's switch swaps the whole timeline. Opened from the ball plinth in the
 * museum's Balls and Kits gallery, or directly at /museum?balls (or ?balls=<ball id>).
 */
const LAST=Math.max(2026,new Date().getFullYear());
function timeline(c:WcCompetition){const set=COMPETITIONS[c].balls,first=COMPETITIONS[c].first;
 return {set,first,years:Array.from({length:LAST-first+1},(_,i)=>first+i),cup:new Map(set.map((b,i)=>[b.year,i])),
  nearest:(year:number)=>{let best=0,bd=Infinity;set.forEach((b,i)=>{const d=Math.abs(b.year-year);if(d<bd){bd=d;best=i;}});return best;}};}
/** Timeline years worth a word when you hover them (the gaps are tinted). */
const YEAR_NOTES:Record<WcCompetition,Record<number,string>>={men:{1942:'no World Cup',1946:'no World Cup'},women:{1991:'first Women’s World Cup',1995:'no special ball yet'}};
const TIMELINES={men:timeline('men'),women:timeline('women')};

export default function WorldCupBalls({onClose,initialId}:{onClose:()=>void;initialId?:string}){
 const canvas=useRef<HTMLCanvasElement>(null),viewer=useRef<BallViewer|null>(null),rail=useRef<HTMLDivElement>(null),root=useRef<HTMLElement>(null);
 const [comp,setComp]=useState<WcCompetition>(()=>findBall(initialId)?.competition??'men'),tl=TIMELINES[comp],WC_BALLS=tl.set,FIRST=tl.first,CUP=tl.cup;
 const [index,setIndex]=useState(()=>findBall(initialId)?.index??0),[final,setFinal]=useState(()=>!!findBall(initialId)?.final),[about,setAbout]=useState(false),storyOpen=useRef(false);storyOpen.current=about;
 const [hover,setHover]=useState<number|null>(null),[turned,setTurned]=useState(false),[failed,setFailed]=useState(false);
 const prevShown=useRef<{index:number;final:boolean;comp:WcCompetition}|null>(null);
 const ball=WC_BALLS[index],shown:WcBall=final&&ball.final?ball.final:ball;

 useEffect(()=>{if(!canvas.current)return;let cancelled=false;const node=canvas.current;
  import('@/lib/museum/wcBalls/ballViewer').then(({createBallViewer})=>{if(cancelled)return;try{
   viewer.current=createBallViewer(node,{reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,coarse:matchMedia('(pointer:coarse)').matches});
   (window as unknown as {__wcBalls?:unknown}).__wcBalls=viewer.current;(window as unknown as {__wcBallsWarmAll?:()=>number}).__wcBallsWarmAll=()=>{for(const id of DESIGN_IDS)viewer.current?.warm(ballSource(id));return DESIGN_IDS.length;};
   // Panel audit hook (scripts/audit-wc-balls.cjs): count a design's panels from its seams, lazily loaded.
   (window as unknown as {__wcSeamProbe?:unknown}).__wcSeamProbe=async(id:string,seamAt?:number)=>{const m=await import('@/lib/museum/wcBalls/seamProbe');const r=m.probeSeams(ballDesign(id));
    // A flat world-map view of the design (seams in red) for the audit's contact sheets.
    const c=document.createElement('canvas');c.width=r.w;c.height=r.h;const g=c.getContext('2d')!,img=g.createImageData(r.w,r.h);for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const src=(r.h-1-y)*r.w+x,o=(y*r.w+x)*4,seam=r.groove[src]>=(seamAt??128);
     img.data[o]=seam?230:r.color[src*3];img.data[o+1]=seam?20:r.color[src*3+1];img.data[o+2]=seam?40:r.color[src*3+2];img.data[o+3]=255;}g.putImageData(img,0,0);
    return {...m.countPanels(r.groove,r.w,r.h,seamAt),map:c.toDataURL('image/png')};};setIndex(i=>i);prevShown.current=null;show(true);}catch(err){console.error('ball gallery failed',err);setFailed(true);}}).catch(()=>!cancelled&&setFailed(true));
  return()=>{cancelled=true;viewer.current?.dispose();viewer.current=null;delete (window as unknown as {__wcBalls?:unknown}).__wcBalls;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // Show the current ball (whipping round in the direction of travel), then warm its neighbours' shaders while idle.
 const show=useCallback((first=false)=>{const v=viewer.current;if(!v)return;const p=prevShown.current,dir=first||!p?0:p.comp!==comp?-1:(index===p.index?(final?1:-1):(index>p.index?-1:1));
  v.show(ballSource(shown.id),dir as -1|0|1);prevShown.current={index,final,comp};
  const warm=[WC_BALLS[index+1],WC_BALLS[index-1],ball.final].filter(Boolean) as WcBall[];const idle=(window as unknown as {requestIdleCallback?:(f:()=>void)=>number}).requestIdleCallback??((f:()=>void)=>setTimeout(f,120));
  idle(()=>{for(const w of warm)viewer.current?.warm(ballSource(w.id));});},[index,final,comp,shown.id,ball.final,WC_BALLS]);
 useEffect(()=>{show();},[show]);
 useEffect(()=>{if(!ball.final)setFinal(false);},[ball.final]);

 const count=useRef(WC_BALLS.length);count.current=WC_BALLS.length;
 const go=useCallback((i:number)=>{setIndex(Math.max(0,Math.min(count.current-1,i)));},[]);
 /** Men's ↔ Women's: land on the nearest tournament year in the other timeline. */
 const switchTo=(c:WcCompetition)=>{if(c===comp)return;setComp(c);setFinal(false);setHover(null);setIndex(TIMELINES[c].nearest(ball.year));};
 // Keyboard: ←/→ (and ↑/↓) step through the years, Home/End jump, F flips the final ball, Escape closes.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(storyOpen.current)return;// the story drawer has its own keys (Escape slides it closed)
  if(e.target instanceof HTMLButtonElement&&(e.code==='Enter'||e.code==='Space'))return;
  if(e.code==='ArrowRight'||e.code==='ArrowDown'){e.preventDefault();setIndex(i=>Math.min(count.current-1,i+1));}
  else if(e.code==='ArrowLeft'||e.code==='ArrowUp'){e.preventDefault();setIndex(i=>Math.max(0,i-1));}
  else if(e.code==='Home'){e.preventDefault();go(0);}else if(e.code==='End'){e.preventDefault();go(count.current-1);}
  else if(e.code==='KeyF'){setFinal(f=>!f);}else if(e.code==='Escape'){e.preventDefault();onClose();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[go,onClose]);
 // Wheel / trackpad: one ball per notch, with a short cool-down so a trackpad swipe moves a few balls, not twenty.
 const wheel=useRef({acc:0,t:0});
 useEffect(()=>{const el=root.current;if(!el)return;const on=(e:WheelEvent)=>{if(storyOpen.current)return;e.preventDefault();const w=wheel.current,now=performance.now();if(now-w.t>260)w.acc=0;w.t=now;w.acc+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
   if(Math.abs(w.acc)>60){const d=Math.sign(w.acc);w.acc=0;setIndex(i=>Math.max(0,Math.min(count.current-1,i+d)));}};
  el.addEventListener('wheel',on,{passive:false});return()=>el.removeEventListener('wheel',on);},[]);

 // Turning the ball: trackball drag with a flick on release.
 const drag=useRef<{id:number;x:number;y:number;t:number;vx:number;vy:number}|null>(null);
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(drag.current)return;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0};e.currentTarget.setPointerCapture(e.pointerId);viewer.current?.grab();};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y,now=performance.now(),dt=Math.max(8,now-d.t)/1000;
  d.vx=d.vx*.5+dx/dt*.5;d.vy=d.vy*.5+dy/dt*.5;d.x=e.clientX;d.y=e.clientY;d.t=now;viewer.current?.drag(dx,dy);if(!turned&&Math.hypot(dx,dy)>2)setTurned(true);};
 const up=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;const still=performance.now()-d.t>90;viewer.current?.release(still?0:d.vx,still?0:d.vy);};

 // The timeline: every year a tick, World Cup years tall, magnified around the finger / the chosen year (a dock).
 const yearAt=(clientX:number)=>{const r=rail.current!.getBoundingClientRect(),t=Math.max(0,Math.min(1,(clientX-r.left)/r.width));return Math.round(FIRST+t*(LAST-FIRST));};
 const scrub=useRef<number|null>(null);
 const railDown=(e:ReactPointerEvent<HTMLDivElement>)=>{scrub.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);const y=yearAt(e.clientX);setHover(y);go(tl.nearest(y));};
 const railMove=(e:ReactPointerEvent<HTMLDivElement>)=>{const y=yearAt(e.clientX);if(e.pointerType==='mouse'||scrub.current===e.pointerId)setHover(y);if(scrub.current===e.pointerId)go(tl.nearest(y));};
 const railUp=(e:ReactPointerEvent<HTMLDivElement>)=>{if(scrub.current===e.pointerId)scrub.current=null;if(e.pointerType!=='mouse')setHover(null);};
 const focus=hover??ball.year;
 const notes=YEAR_NOTES[comp];
 const ticks=useMemo(()=>tl.years.map(y=>{const cup=tl.cup.has(y),d=(y-focus)/(comp==='men'?4.2:2.4),bump=Math.exp(-d*d);return {y,cup,h:(cup?12:6)+bump*(cup?30:12),gap:y in notes};}),[focus,tl,comp,notes]);

 return <section ref={root} className={styles.root} role="dialog" aria-modal="true" aria-label={`${COMPETITIONS[comp].label} balls`} data-wc-balls data-comp={comp} data-ball={shown.id}>
  <header className={styles.header}><NavigationButton back label="Back" data-wc-back onNavigate={onClose}/><span className={styles.switch} role="group" aria-label="Which World Cup">{(['men','women'] as const).map(c=><button key={c} type="button" data-wc-comp={c} aria-pressed={comp===c} onClick={()=>switchTo(c)}>{COMPETITIONS[c].short}</button>)}</span><span className={styles.count}>{index+1} / {WC_BALLS.length}</span></header>
  <canvas ref={canvas} className={styles.canvas} aria-label={`${shown.year} ${shown.name}. Drag to turn the ball.`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>
  {failed&&<p className={styles.error}>The ball gallery couldn’t load on this device.</p>}
  <div className={styles.label} aria-live="polite" key={shown.id}>
   {!turned&&!failed&&<span className={styles.hint} aria-hidden="true">Drag to turn the ball</span>}
   <b className={styles.year}>{shown.year}</b>
   <span className={styles.name}>{shown.name} <i>{shown.host}</i></span>
   {ball.final&&<button type="button" className={styles.finalToggle} data-wc-final aria-pressed={final} onClick={()=>setFinal(f=>!f)}>{final?'Back to the tournament ball':`${ball.finalLabel}: ${ball.final.name}`}</button>}
   {shown.facts.length>0&&<button type="button" className={styles.aboutToggle} data-wc-story aria-haspopup="dialog" onClick={()=>setAbout(true)}>The story of this ball</button>}
  </div>
  <div className={styles.timeline}>
   <button type="button" className={styles.step} aria-label="Earlier ball" disabled={index===0} onClick={()=>go(index-1)}>‹</button>
   <div ref={rail} className={styles.rail} role="slider" tabIndex={0} aria-label={`${COMPETITIONS[comp].label} year`} aria-valuemin={FIRST} aria-valuemax={LAST} aria-valuenow={ball.year} aria-valuetext={`${ball.year}, ${ball.name}`}
    onPointerDown={railDown} onPointerMove={railMove} onPointerUp={railUp} onPointerCancel={railUp} onPointerLeave={e=>{if(e.pointerType==='mouse'&&scrub.current===null)setHover(null);}}>
    {ticks.map(t=><i key={t.y} data-cup={t.cup||undefined} data-on={t.y===ball.year||undefined} data-gap={t.gap||undefined} style={{height:t.h}}/>)}
   </div>
   <button type="button" className={styles.step} aria-label="Later ball" disabled={index===WC_BALLS.length-1} onClick={()=>go(index+1)}>›</button>
   <span className={styles.ends}><span>{FIRST}</span>{hover!==null&&<b style={{left:`${(hover-FIRST)/(LAST-FIRST)*100}%`}}>{notes[hover]?`${hover} · ${notes[hover]}`:hover}</b>}<span data-on={index===WC_BALLS.length-1||undefined}>Today</span></span>
  </div>
 {about&&<BallStoryDrawer key={shown.id} ball={shown} onClose={()=>setAbout(false)}/>}
 </section>;
}

