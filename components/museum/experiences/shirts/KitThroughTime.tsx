'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type Ref,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import styles from './decades.module.css';
import {PARTS,partOf,tooEarly,fallsOff,MILESTONES,YEAR_MIN,YEAR_MAX,eraOf,flickTarget,nearestMilestone,WATER_PER_100G,waterHeld,DECADE_SOURCES,type PartId} from './eras';
import {spring,stepSpring,settled,snap,rubber,velocityTracker,sleepyLoop,prefersReduced,type Spring} from './spring';

/**
 * shirts · beat 1, "Through the decades" (Oct 9 2026): a paper-doll kit builder told as a fashion-editorial collage.
 * The visitor slides a year tag along a timeline (drag with momentum, rubber-band at the ends, a spring that snaps to the
 * nearest sourced milestone), then drags paper parts (number, name, sponsor, man-made fabric, V-neck) onto a bean paper doll.
 * A part that hasn't been invented yet flutters off with a "Too early!" stamp; slide back in time and parts fall off.
 * The rain test soaks a cotton and a polyester shirt and tips a scale with the sourced numbers (7 g v 0.4 g per 100 g).
 *
 * Motion: one sleepy rAF loop (spring.ts) drives the scrubber spring, the doll's sway (a damped pendulum with a lagging hem),
 * the flip (a spring on rotateY), falling paper and the ghost part's spring home. It runs only while something moves and
 * stops when everything settles, when the tab is hidden and on unmount. Reduced motion: no loop at all, every state is shown
 * at once. React re-renders only when the whole year or a part changes; per-frame values go straight to the DOM.
 */
type Flyer={k:number;x:number;y:number;vx:number;vy:number;r:number;vr:number;t:number;id:PartId};
type Stamp={k:number;text:string;x:number;y:number};
const SPAN=YEAR_MAX-YEAR_MIN;
const frac=(y:number)=>(y-YEAR_MIN)/SPAN;
const SPONSOR='ISLAND JUICE';
/** Close-together stops keep a tick but no label, so the labels never overlap on a phone. */
const MINOR=new Set([1939,1954,1980]);
/** On a phone the 1973 label also hides (it sits close to 1953 and 1993). */
const NARROW_HIDE=new Set([1973]);

export default function Decades({onNext}:{onNext:()=>void}){
 const [year,setYear]=useState(YEAR_MIN);
 const [on,setOn]=useState<ReadonlySet<PartId>>(()=>new Set());
 const [side,setSide]=useState<'front'|'back'>('front');
 const [say,setSay]=useState('');
 const [flyers,setFlyers]=useState<Flyer[]>([]),[stamps,setStamps]=useState<Stamp[]>([]);
 const [hadEarly,setHadEarly]=useState(false),[stuck,setStuck]=useState(false),[built,setBuilt]=useState(false);
 const [dragId,setDragId]=useState<PartId|null>(null),[overDoll,setOverDoll]=useState(false);
 const [wetShown,setWetShown]=useState(0),[raining,setRaining]=useState(false);
 const rm=useRef(false);
 const stage=useRef<HTMLDivElement>(null),doll=useRef<HTMLDivElement>(null),swayEl=useRef<HTMLDivElement>(null),hemEls=useRef<SVGGElement[]>([]),flipEl=useRef<HTMLDivElement>(null);
 const track=useRef<HTMLDivElement>(null),thumb=useRef<HTMLDivElement>(null),fill=useRef<HTMLSpanElement>(null),ghost=useRef<HTMLDivElement>(null),beam=useRef<SVGGElement>(null),dropsEl=useRef<SVGGElement>(null);
 const flyEls=useRef(new Map<number,HTMLDivElement>());
 // springs and per-frame state
 const yr=useRef(spring(YEAR_MIN,90,.82)),sway=useRef(spring(0,60,.26)),hem=useRef(spring(0,140,.3)),flip=useRef(spring(0,120,.62)),wet=useRef(spring(0,30,1));
 const gx=useRef(spring(0,180,.7)),gy=useRef(spring(0,180,.7)),ghostHome=useRef(false);
 const scrub=useRef<{id:number;x0:number;y0:number;dragging:boolean}|null>(null),scrubV=useRef(velocityTracker());
 const partDrag=useRef<{id:PartId;pid:number;x0:number;y0:number;moved:boolean;ox:number;oy:number}|null>(null),partV=useRef(velocityTracker());
 const dollDrag=useRef<{pid:number;x0:number;last:number}|null>(null),dollV=useRef(velocityTracker());
 const flyRef=useRef<Flyer[]>([]),drops=useRef<{x:number;y:number;v:number}[]>([]),rainRef=useRef(false),onRef=useRef(on);onRef.current=on;
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),fk=useRef(0),yearRef=useRef(year);yearRef.current=year;
 const loop=useRef<ReturnType<typeof sleepyLoop>|null>(null);
 const fabric:'cotton'|'polyester'=on.has('synthetic')?'polyester':'cotton';
 const fabricRef=useRef(fabric);fabricRef.current=fabric;

 /** Paint one frame from the springs (also used once, statically, under reduced motion). */
 const paint=useCallback(()=>{
  const y=yr.current.x,f=Math.max(-.04,Math.min(1.04,frac(y)));
  if(thumb.current)thumb.current.style.transform=`translateX(${(f*(track.current?.clientWidth??0)).toFixed(1)}px) translateX(-50%) rotate(${Math.max(-12,Math.min(12,-3+yr.current.v*.02)).toFixed(2)}deg)`;
  if(fill.current)fill.current.style.transform=`scaleX(${Math.max(0,Math.min(1,f)).toFixed(4)})`;
  const sag=wet.current.x*(fabricRef.current==='cotton'?1:.06);
  if(swayEl.current)swayEl.current.style.transform=`rotate(${rubber(sway.current.x,-7,7,.5,5).toFixed(2)}deg)`;
  for(const h of hemEls.current)if(h)h.setAttribute('transform',`translate(100 64) skewX(${(-hem.current.x*.9).toFixed(2)}) scale(1 ${(1+sag*.07).toFixed(3)}) translate(-100 -64)`);
  if(flipEl.current)flipEl.current.style.transform=`rotateY(${flip.current.x.toFixed(1)}deg)`;
  if(beam.current){const a=waterHeld('cotton',wet.current.x)-waterHeld('polyester',wet.current.x);beam.current.setAttribute('transform',`rotate(${(-a*2.4).toFixed(2)} 80 30)`);}
  if(dropsEl.current){const kids=dropsEl.current.children;for(let i=0;i<kids.length;i++){const d=drops.current[i];(kids[i] as SVGElement).setAttribute('transform',d?`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`:'translate(-50 -50)');}}
  for(const fl of flyRef.current){const el=flyEls.current.get(fl.k);if(el)el.style.transform=`translate(${fl.x.toFixed(1)}px,${fl.y.toFixed(1)}px) rotate(${fl.r.toFixed(1)}deg)`;}
  if(ghost.current&&ghostHome.current)ghost.current.style.transform=`translate(${gx.current.x.toFixed(1)}px,${gy.current.x.toFixed(1)}px) translate(-50%,-50%) rotate(-4deg)`;
 },[]);

 const tick=useCallback((dt:number)=>{
  let moving=false;
  // the year tag: follows the finger while dragging, otherwise a spring toward its milestone
  if(!scrub.current?.dragging&&!settled(yr.current,.02)){stepSpring(yr.current,dt);moving=true;}else if(!scrub.current?.dragging)snap(yr.current);
  const whole=Math.round(Math.max(YEAR_MIN,Math.min(YEAR_MAX,yr.current.x)));if(whole!==yearRef.current){yearRef.current=whole;setYear(whole);}
  for(const s of [sway.current,hem.current,flip.current]){if(!settled(s,.04)){stepSpring(s,dt);moving=true;}else snap(s);}
  // the hem lags behind the doll's sway: it chases the sway angle
  hem.current.to=sway.current.x;
  if(dollDrag.current)moving=true;
  // rain: the shirt soaks up while the button is held
  if(rainRef.current){wet.current.to=1;moving=true;const ds=drops.current;if(ds.length<14&&Math.random()<.5)ds.push({x:40+Math.random()*120,y:-10,v:220+Math.random()*120});
   for(const d of ds){d.y+=d.v*dt;if(d.y>230){d.y=-10-Math.random()*30;d.x=40+Math.random()*120;}}}
  else if(drops.current.length){for(const d of drops.current)d.y+=d.v*dt;drops.current=drops.current.filter(d=>d.y<230);moving=true;}
  if(!settled(wet.current,.004)){stepSpring(wet.current,dt);moving=true;}
  // falling paper: gravity, air drag and a side-to-side flutter
  if(flyRef.current.length){const H=window.innerHeight+160;
   for(const f of flyRef.current){f.t+=dt;f.vy+=900*dt;f.vy*=1-1.6*dt;f.vx*=1-1.2*dt;f.x+=(f.vx+Math.sin(f.t*7)*60)*dt;f.y+=f.vy*dt;f.r+=f.vr*dt;}
   const gone=flyRef.current.filter(f=>f.y>H);if(gone.length){flyRef.current=flyRef.current.filter(f=>f.y<=H);setFlyers(flyRef.current.slice());}
   if(flyRef.current.length)moving=true;}
  if(ghostHome.current){stepSpring(gx.current,dt);stepSpring(gy.current,dt);if(settled(gx.current,.5)&&settled(gy.current,.5)){ghostHome.current=false;setDragId(null);}else moving=true;}
  paint();
  return moving;
 },[paint]);

 useEffect(()=>{rm.current=prefersReduced();loop.current=sleepyLoop(tick);paint();
  const vis=()=>{if(!document.hidden)loop.current?.kick();};document.addEventListener('visibilitychange',vis);
  return()=>{loop.current?.stop();document.removeEventListener('visibilitychange',vis);timers.current.forEach(clearTimeout);timers.current=[];};},[tick,paint]);
 const kick=()=>{if(rm.current){// reduced motion: jump every spring to its end, paint once
  for(const s of [yr.current,sway.current,hem.current,flip.current,wet.current,gx.current,gy.current])snap(s);flyRef.current=[];drops.current=[];
  const whole=Math.round(yr.current.x);if(whole!==yearRef.current){yearRef.current=whole;setYear(whole);}
  if(ghostHome.current){ghostHome.current=false;setDragId(null);}paint();return;}
  loop.current?.kick();};
 const later=(fn:()=>void,ms:number)=>{const t=setTimeout(()=>{timers.current=timers.current.filter(x=>x!==t);fn();},ms);timers.current.push(t);};

 /** A paper part flutters off the doll and a "Too early!" stamp lands. */
 const knockOff=useCallback((id:PartId,text:string,from?:{x:number;y:number})=>{
  const d=doll.current?.getBoundingClientRect();if(!d)return;const W=window.innerWidth;
  // viewport coordinates: the falling paper and the stamp live in a fixed, clipped layer (they never widen the page)
  const x=from?.x??d.left+d.width/2,y=from?.y??d.top+d.height*.42,k=++fk.current;
  if(!rm.current){const f:Flyer={k,x,y,vx:(Math.random()<.5?-1:1)*(160+Math.random()*120),vy:-420,r:0,vr:(Math.random()-.5)*540,t:0,id};flyRef.current=[...flyRef.current,f];setFlyers(flyRef.current.slice());
   sway.current.v=Math.max(-90,Math.min(90,sway.current.v+(f.vx>0?-1:1)*60));}
  setStamps(s=>[...s.slice(-1),{k,text,x:Math.max(110,Math.min(W-110,x)),y:Math.max(60,y-40)}]);later(()=>setStamps(s=>s.filter(q=>q.k!==k)),1900);
  museumSfx.stamp();kick();
 },[]);

 const tryPut=(id:PartId,from?:{x:number;y:number})=>{
  const p=partOf(id),early=tooEarly(id,yearRef.current);
  if(on.has(id)){// already on: take it off
   const next=new Set(on);next.delete(id);setOn(next);setSay(`${p.short} off.`);museumSfx.card();sway.current.v+=50;kick();return;}
  if(early){setHadEarly(true);setSay(`Too early! It’s ${eraOf(yearRef.current).tag==='Today'?'today':yearRef.current}. ${p.short}: ${p.why}`);knockOff(id,`Too early! Arrived in ${p.when}`,from);return;}
  const next=new Set(on);next.add(id);setOn(next);setStuck(true);setSay(`${p.label}: it fits ${yearRef.current}. ${p.why}`);
  const want=p.side;if(want!==side)turn(want,true);
  if(next.size===PARTS.length&&!built){setBuilt(true);museumSfx.reveal();}else museumSfx.card();
  sway.current.v+=(Math.random()<.5?-1:1)*70;kick();
  // the new part presses on with a spring (a one-shot Web Animation)
  later(()=>{const el=doll.current?.querySelector(`[data-part="${id}"]`);if(el&&!rm.current)(el as SVGElement).animate?.([{transform:'scale(1.35)',opacity:.2},{transform:'scale(1)',opacity:1}],{duration:520,easing:'linear(0,.25 9%,.86 22%,1.07 32%,1.03 45%,.99 60%,1)',fill:'backwards'});},0);
 };
 const turn=(to:'front'|'back',auto=false)=>{setSide(to);flip.current.to=to==='back'?180:0;if(!auto)museumSfx.card();kick();};

 // scrubbing back in time knocks off any part that hasn't been invented yet
 useEffect(()=>{const off=fallsOff(onRef.current,year);if(!off.length)return;
  const next=new Set(onRef.current);off.forEach(id=>next.delete(id));setOn(next);
  off.forEach((id,i)=>later(()=>knockOff(id,`${partOf(id).short} falls off! Arrived in ${partOf(id).when}`),i*140));
  setSay(`${off.map(id=>partOf(id).short).join(' and ')} ${off.length>1?'fall':'falls'} off: before ${partOf(off[0]).when}, ${off.length>1?'they':'it'} hadn’t been invented yet.`);
 },[year,knockOff]);

 // ---- the timeline scrubber ----
 const xToYear=(clientX:number)=>{const r=track.current!.getBoundingClientRect();const raw=YEAR_MIN+(clientX-r.left)/r.width*SPAN;return rubber(raw,YEAR_MIN,YEAR_MAX,.6,8);};
 const onTrackDown=(e:ReactPointerEvent<HTMLDivElement>)=>{if(e.button>0)return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
  setSay('');  scrub.current={id:e.pointerId,x0:e.clientX,y0:e.clientY,dragging:true};scrubV.current.reset();scrubV.current.add(xToYear(e.clientX),0);
  yr.current.x=xToYear(e.clientX);yr.current.v=0;kick();paint();};
 const onTrackMove=(e:ReactPointerEvent<HTMLDivElement>)=>{const s=scrub.current;if(!s||s.id!==e.pointerId)return;const y=xToYear(e.clientX);scrubV.current.add(y,0);yr.current.x=y;
  const whole=Math.round(Math.max(YEAR_MIN,Math.min(YEAR_MAX,y)));if(whole!==yearRef.current){yearRef.current=whole;setYear(whole);}paint();};
 const onTrackUp=(e:ReactPointerEvent<HTMLDivElement>)=>{const s=scrub.current;if(!s||s.id!==e.pointerId)return;scrub.current=null;
  const v=Math.max(-300,Math.min(300,scrubV.current.get().x)),m=flickTarget(yr.current.x,v);yr.current.v=v;yr.current.to=m.year;museumSfx.tick();kick();};
 const goTo=(y:number)=>{setSay('');yr.current.to=y;museumSfx.tick();kick();};
 const stepMilestone=(dir:1|-1)=>{const cur=nearestMilestone(yr.current.to),i=MILESTONES.indexOf(cur),n=MILESTONES[Math.max(0,Math.min(MILESTONES.length-1,i+dir))];goTo(n.year);};
 const onThumbKey=(e:ReactKeyboardEvent)=>{const k=e.key;
  if(k==='ArrowRight'||k==='ArrowUp'){e.preventDefault();stepMilestone(1);}else if(k==='ArrowLeft'||k==='ArrowDown'){e.preventDefault();stepMilestone(-1);}
  else if(k==='Home'){e.preventDefault();goTo(YEAR_MIN);}else if(k==='End'){e.preventDefault();goTo(YEAR_MAX);}};

 // ---- dragging a paper part onto the doll (a tap or Enter puts it on too) ----
 const overDollAt=(x:number,y:number)=>{const r=doll.current?.getBoundingClientRect();return !!r&&x>r.left-16&&x<r.right+16&&y>r.top-16&&y<r.bottom+16;};
 const onPartDown=(id:PartId)=>(e:ReactPointerEvent<HTMLButtonElement>)=>{if(e.button>0)return;const r=e.currentTarget.getBoundingClientRect();
  partDrag.current={id,pid:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,ox:r.left+r.width/2,oy:r.top+r.height/2};partV.current.reset();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}};
 const onPartMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{const d=partDrag.current;if(!d||d.pid!==e.pointerId)return;partV.current.add(e.clientX,e.clientY);
  if(!d.moved&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>8){d.moved=true;ghostHome.current=false;setDragId(d.id);}
  if(d.moved){if(ghost.current)ghost.current.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%) rotate(-4deg) scale(1.08)`;gx.current.x=e.clientX;gy.current.x=e.clientY;
   const o=overDollAt(e.clientX,e.clientY);if(o!==overDoll)setOverDoll(o);}};
 const suppress=useRef(0);
 const onPartUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{const d=partDrag.current;if(!d||d.pid!==e.pointerId)return;partDrag.current=null;setOverDoll(false);if(!d.moved)return;
  suppress.current=performance.now()+400;
  if(overDollAt(e.clientX,e.clientY)){setDragId(null);tryPut(d.id,{x:e.clientX,y:e.clientY});return;}
  // missed: the paper springs home, carrying the finger's speed
  const v=partV.current.get();gx.current={...gx.current,x:e.clientX,v:v.x,to:d.ox};gy.current={...gy.current,x:e.clientY,v:v.y,to:d.oy};ghostHome.current=true;
  setSay(`Drop the ${partOf(d.id).short.toLowerCase()} on the paper doll.`);kick();};
 const onPartCancel=()=>{partDrag.current=null;setDragId(null);setOverDoll(false);};
 const onPartClick=(id:PartId)=>{if(performance.now()<suppress.current)return;tryPut(id);};
 useLayoutEffect(()=>{if(dragId&&ghost.current)ghost.current.style.transform=`translate(${gx.current.x}px,${gy.current.x}px) translate(-50%,-50%) rotate(-4deg) scale(1.08)`;},[dragId]);

 // ---- flick the doll: it rocks on its stand, the hem catches up ----
 const onDollDown=(e:ReactPointerEvent<HTMLDivElement>)=>{if(e.button>0||rm.current)return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}dollDrag.current={pid:e.pointerId,x0:e.clientX,last:e.clientX};dollV.current.reset();kick();};
 const onDollMove=(e:ReactPointerEvent<HTMLDivElement>)=>{const d=dollDrag.current;if(!d||d.pid!==e.pointerId)return;dollV.current.add(e.clientX,0);
  sway.current.x=rubber((e.clientX-d.x0)*.12,-10,10,.5,8);sway.current.v=0;paint();};
 const onDollUp=(e:ReactPointerEvent<HTMLDivElement>)=>{const d=dollDrag.current;if(!d||d.pid!==e.pointerId)return;dollDrag.current=null;
  sway.current.v=Math.max(-160,Math.min(160,dollV.current.get().x*.12));if(Math.abs(e.clientX-d.x0)<6){turn(side==='front'?'back':'front');}kick();};

 // ---- rain test ----
 const rainOn=()=>{if(rainRef.current)return;rainRef.current=true;setRaining(true);if(rm.current){wet.current.x=wet.current.to=1;setWetShown(1);paint();return;}museumSfx.hush();kick();};
 const rainOff=()=>{if(!rainRef.current)return;rainRef.current=false;setRaining(false);setWetShown(Math.round(wet.current.x*100)/100);if(rm.current)return;kick();};
 const dryOff=()=>{wet.current.to=0;setWetShown(0);if(rm.current){wet.current.x=0;paint();}museumSfx.card();kick();};
 const soaked=raining?1:wetShown;
 const era=eraOf(year);
 const mission=built?null:!hadEarly&&!stuck?'Try it! Drag the Number onto the paper doll.':!stuck?'Too early! Slide the year tag to 1928, then try the Number again.':`Now go to 1993 or later and put all five parts on.`;
 const digits=(era.tag==='Today'?'Today':String(year)).split('');

 return <div ref={stage} className={styles.stage} data-stage="decades">
  <div className={styles.story}>
   <h1 className={styles.title}><span>Kits</span> <em>through</em> <span>time</span></h1>
   <div className={styles.clip} key={era.year}>
    <span className={styles.tape} aria-hidden="true"/>
    <p className={styles.clipYear}>{era.tag}</p>
    <p className={styles.clipTitle}>{era.title}</p>
    <p className={styles.clipText}>{era.text}</p>
   </div>
   {mission&&<p className={styles.mission} key={mission}><b aria-hidden="true">✂</b>{mission}</p>}
   {built&&<div className={styles.takeaway}>
    <p className={styles.takeTitle}>Every part has a birthday</p>
    <p>Numbers 1928 · V-necks the 1950s · man-made fabric 1953 · sponsors 1973 · names 1993. Now slide back to the 1880s and watch them fall off!</p>
    <button type="button" data-museum-own-cue className={styles.primary} onClick={onNext}>Next: numbers on the pitch →</button>
   </div>}
   <div className={styles.rain}>
    <p className={styles.rainHead}><b>Rain test.</b> Which shirt gets heavier?</p>
    <div className={styles.rainRow}>
     <button type="button" data-museum-own-cue className={styles.rainBtn} aria-pressed={raining}
      onPointerDown={e=>{e.preventDefault();rainOn();}} onPointerUp={rainOff} onPointerLeave={rainOff} onPointerCancel={rainOff}
      onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();rainOn();}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter')rainOff();}} onBlur={rainOff}
      onContextMenu={e=>e.preventDefault()}>☂ Hold for rain</button>
     {soaked>0&&!raining&&<button type="button" data-museum-own-cue className={styles.ghostBtn} onClick={dryOff}>Dry off</button>}
    </div>
    <svg viewBox="0 0 160 70" className={styles.scale} role="img" aria-label={`Scale: cotton fibres hold ${waterHeld('cotton',soaked).toFixed(1)} grams of water per 100 grams, polyester ${waterHeld('polyester',soaked).toFixed(1)} grams.`}>
     <path d="M80 30 L80 64 M64 66 L96 66" stroke="#16181d" strokeWidth="3" strokeLinecap="round"/>
     <g ref={beam}>
      <path d="M18 30 L142 30" stroke="#16181d" strokeWidth="3" strokeLinecap="round"/>
      <path d="M22 30 L12 46 M22 30 L32 46 M138 30 L128 46 M138 30 L148 46" stroke="#16181d" strokeWidth="1"/>
      <path d="M8 46 Q22 54 36 46 Z" fill="#c9b48f" stroke="#16181d" strokeWidth="1.2"/><path d="M124 46 Q138 54 152 46 Z" fill="#c9b48f" stroke="#16181d" strokeWidth="1.2"/>
      <text x="22" y="20" textAnchor="middle" className={styles.scaleLabel}>Cotton</text><text x="138" y="20" textAnchor="middle" className={styles.scaleLabel}>Polyester</text>
     </g>
     <circle cx="80" cy="30" r="3" fill="#b8283a"/>
    </svg>
    <p className={styles.grams} aria-live="polite">{soaked>0
     ?<>Water drunk into the fibres, for every 100 g of shirt: cotton <b>{waterHeld('cotton',soaked).toFixed(1)} g</b>, polyester <b>{waterHeld('polyester',soaked).toFixed(1)} g</b>.{soaked>=1&&!raining?' Cotton fibres soak up sweat and rain; polyester fibres hardly do.':''}</>
     :<>Cotton fibres drink in about {WATER_PER_100G.cotton} g of water for every 100 g of shirt. Polyester fibres take in only about {WATER_PER_100G.polyester} g.</>}</p>
   </div>
   <details className={styles.sources}><summary>Sources</summary><ul>{DECADE_SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
    <p>Real history. The paper doll and its sponsor are made up for the museum.</p></details>
  </div>

  <div className={styles.dollWrap}>
   <div className={styles.cutYear} aria-hidden="true">{digits.map((c,i)=><span key={i+c} style={{['--r' as string]:`${((i*37)%9-4)*1.2}deg`,['--h' as string]:String((i*53)%5)}}>{c}</span>)}</div>
   <div ref={doll} className={styles.doll} data-over={overDoll||undefined} data-wet={soaked>0||undefined}
    onPointerDown={onDollDown} onPointerMove={onDollMove} onPointerUp={onDollUp} onPointerCancel={onDollUp}
    role="img" aria-label={`Paper doll in a ${year} kit, showing the ${side}. Wearing: ${fabric} shirt with a ${on.has('vneck')?'V-neck':'collar'}${PARTS.filter(p=>on.has(p.id)&&p.id!=='vneck'&&p.id!=='synthetic').map(p=>', '+p.short.toLowerCase()).join('')}.`}>
    <div ref={swayEl} className={styles.sway}><div ref={flipEl} className={styles.flipper}>
     <div className={styles.face} data-face="front"><DollArt side="front" on={on} hem={el=>{hemEls.current[0]=el!;}} drops={dropsEl} wet={soaked}/></div>
     <div className={styles.face} data-face="back"><DollArt side="back" on={on} hem={el=>{hemEls.current[1]=el!;}} wet={soaked}/></div>
    </div></div>
   </div>
   {say&&<p className={styles.say} key={say} aria-hidden="true">{say}</p>}
   <div className={styles.dollBar}>
    <button type="button" className={styles.ghostBtn} onClick={()=>turn(side==='front'?'back':'front')} aria-label={`Turn the doll round to see the ${side==='front'?'back':'front'}`}>↻ {side==='front'?'See the back':'See the front'}</button>
   </div>
  </div>

  <div className={styles.tray} role="group" aria-label="Paper parts: drag one onto the doll, or press it">
   {PARTS.map((p,i)=>{const has=on.has(p.id);
    return <button key={p.id} type="button" data-museum-own-cue data-part-btn={p.id} className={styles.part} data-on={has||undefined} data-held={dragId===p.id||undefined} aria-pressed={has}
     aria-label={has?`Take off: ${p.label}`:`Put on: ${p.label}`} style={{['--tilt' as string]:`${(i%2?2:-2)}deg`}}
     onPointerDown={onPartDown(p.id)} onPointerMove={onPartMove} onPointerUp={onPartUp} onPointerCancel={onPartCancel} onClick={()=>onPartClick(p.id)}>
     <PartIcon id={p.id}/><span>{p.short}</span>{has&&<i aria-hidden="true">✓</i>}
    </button>;})}
  </div>

  <div className={styles.timeline}>
   <button type="button" className={styles.stepBtn} onClick={()=>stepMilestone(-1)} aria-label="Earlier">‹</button>
   <div ref={track} className={styles.track} onPointerDown={onTrackDown} onPointerMove={onTrackMove} onPointerUp={onTrackUp} onPointerCancel={onTrackUp}>
    <span className={styles.rail}><span ref={fill} className={styles.railFill}/></span>
    {MILESTONES.map(m=><button key={m.year} type="button" tabIndex={-1} aria-hidden="true" className={styles.tick} data-past={year>=m.year||undefined} data-minor={MINOR.has(m.year)||undefined} data-narrow-hide={NARROW_HIDE.has(m.year)||undefined} style={{left:`${frac(m.year)*100}%`}}
     onPointerDown={e=>e.stopPropagation()} onClick={()=>goTo(m.year)}><span>{m.tag}</span></button>)}
    <div ref={thumb} className={styles.thumb} role="slider" tabIndex={0} aria-label="Year" aria-valuemin={YEAR_MIN} aria-valuemax={YEAR_MAX} aria-valuenow={year} aria-valuetext={`${era.tag==='Today'?'Today':year}: ${era.title}`} onKeyDown={onThumbKey}>
     <span>{era.tag==='Today'?'Now':year}</span>
    </div>
   </div>
   <button type="button" className={styles.stepBtn} onClick={()=>stepMilestone(1)} aria-label="Later">›</button>
  </div>
  <p className={styles.sr} aria-live="polite">{say}</p>

  <div className={styles.fx} aria-hidden="true">
  {flyers.map(f=><div key={f.k} ref={el=>{if(el)flyEls.current.set(f.k,el);else flyEls.current.delete(f.k);}} className={styles.flyer} aria-hidden="true"><PartIcon id={f.id}/></div>)}
  {stamps.map(s=><div key={s.k} className={styles.stamp} style={{left:s.x,top:s.y}}>{s.text}</div>)}
  </div>
  {dragId&&<div ref={ghost} className={styles.ghost} aria-hidden="true"><PartIcon id={dragId}/></div>}
 </div>;
}

/** The bean paper doll: a round body, a small head, little legs on a card stand, and a paper shirt with white fold tabs. */
function DollArt({side,on,hem,drops,wet}:{side:'front'|'back';on:ReadonlySet<PartId>;hem:(el:SVGGElement|null)=>void;drops?:Ref<SVGGElement>;wet:number}){
 const syn=on.has('synthetic'),v=on.has('vneck'),cotton=!syn;
 const shirt=syn?'#d3243a':'#a8263a';
 const body='M100 58 C 66 58 48 86 48 126 C 48 170 70 196 100 196 C 130 196 152 170 152 126 C 152 86 134 58 100 58 Z';
 const tee='M72 66 L46 80 L36 112 L54 120 L60 104 L60 176 Q100 186 140 176 L140 104 L146 120 L164 112 L154 80 L128 66 Q100 80 72 66 Z';
 return <svg viewBox="0 0 200 250" className={styles.dollSvg} aria-hidden="true" focusable="false">
  <defs>
   <pattern id={`weave-${side}`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5 H3 M1.5 0 V3" stroke="#000" strokeOpacity=".16" strokeWidth=".6"/></pattern>
   <pattern id={`mesh-${side}`} width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#fff" fillOpacity=".22"/></pattern>
  </defs>
  {/* the card stand */}
  <path d="M60 238 L140 238 L150 246 L50 246 Z" fill="#c9b48f" stroke="#16181d" strokeWidth="1.2"/>
  <g>
   {/* white paper margin all round the cut-out (the scissors line) */}
   <g fill="#fffdf6" stroke="#fffdf6" strokeWidth="9" strokeLinejoin="round">
    <circle cx="100" cy="36" r="24"/><path d={body}/><rect x="78" y="190" width="16" height="44" rx="8"/><rect x="106" y="190" width="16" height="44" rx="8"/>
   </g>
   <rect x="78" y="190" width="16" height="44" rx="8" fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/><rect x="106" y="190" width="16" height="44" rx="8" fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/>
   <path d="M74 226 h22 v10 h-26 z M104 226 h22 l4 10 h-26 z" fill="#16181d"/>
   <path d={body} fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/>
   <circle cx="100" cy="36" r="22" fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/>
   {side==='front'?<g><circle cx="92" cy="34" r="2.4" fill="#16181d"/><circle cx="108" cy="34" r="2.4" fill="#16181d"/><path d="M93 44 Q100 49 107 44" fill="none" stroke="#16181d" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="86" cy="42" r="3" fill="#e58a7a" opacity=".6"/><circle cx="114" cy="42" r="3" fill="#e58a7a" opacity=".6"/></g>
    :<path d="M80 26 Q100 6 120 26 Q118 18 100 16 Q82 18 80 26 Z" fill="#3b2a1e"/>}
   <path d="M78 22 Q100 2 122 22 Q114 12 100 12 Q86 12 78 22 Z" fill="#3b2a1e"/>
   {/* the paper shirt: white fold tabs first, then the shirt; the hem group sags when wet and lags the sway */}
   <g ref={hem}>
    <g fill="#fffdf6" stroke="#16181d" strokeWidth=".8" strokeDasharray="2 1.5">
     <path d="M58 70 l-6 -12 l14 -2 z"/><path d="M142 70 l6 -12 l-14 -2 z"/><path d="M60 150 l-12 4 l12 8 z"/><path d="M140 150 l12 4 l-12 8 z"/>
    </g>
    <path d={tee} fill="#fffdf6" stroke="#fffdf6" strokeWidth="7" strokeLinejoin="round"/>
    <path d={tee} fill={shirt} stroke="#16181d" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d={tee} fill={`url(#${cotton?'weave':'mesh'}-${side})`}/>
    {cotton&&<path d="M60 104 L60 176 Q100 186 140 176 L140 104" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="5"/>}
    {/* neck: a buttoned collar (early) or a V-neck */}
    {side==='front'&&(v
     ?<g data-part="vneck"><path d="M84 68 L100 92 L116 68" fill="none" stroke="#fffdf6" strokeWidth="5" strokeLinejoin="round"/><path d="M84 68 L100 92 L116 68" fill="none" stroke="#16181d" strokeWidth="1"/></g>
     :<g><path d="M72 66 L86 84 L100 74 L114 84 L128 66 Q100 80 72 66 Z" fill="#fffdf6" stroke="#16181d" strokeWidth="1.2"/><path d="M100 74 V104" stroke="#16181d" strokeWidth="1"/><circle cx="100" cy="86" r="1.6" fill="#16181d"/><circle cx="100" cy="98" r="1.6" fill="#16181d"/></g>)}
    {side==='back'&&<path d="M76 68 Q100 80 124 68" fill="none" stroke="#fffdf6" strokeWidth="4"/>}
    {syn&&<g data-part="synthetic"><path d="M64 110 L136 110" stroke="#fffdf6" strokeOpacity=".5" strokeWidth="2" strokeDasharray="1 3"/><path d="M64 160 L136 160" stroke="#fffdf6" strokeOpacity=".5" strokeWidth="2" strokeDasharray="1 3"/></g>}
    {side==='front'&&on.has('sponsor')&&<g data-part="sponsor"><rect x="68" y="120" width="64" height="20" rx="3" fill="#f2c94c" stroke="#16181d" strokeWidth="1.2" transform="rotate(-3 100 130)"/>
     <text x="100" y="134" textAnchor="middle" fontSize="10" fontWeight="900" textLength="56" lengthAdjust="spacingAndGlyphs" fill="#16181d" transform="rotate(-3 100 130)" fontFamily="system-ui, sans-serif">{SPONSOR}</text></g>}
    {side==='back'&&on.has('name')&&<text data-part="name" x="100" y="102" textAnchor="middle" fontSize="13" fontWeight="900" letterSpacing="2" fill="#fffdf6" fontFamily="system-ui, sans-serif">BEAN</text>}
    {side==='back'&&on.has('number')&&<text data-part="number" x="100" y="158" textAnchor="middle" fontSize="50" fill="#fffdf6" stroke="#16181d" strokeWidth="1" paintOrder="stroke" fontFamily="Impact, 'Arial Narrow Bold', sans-serif">9</text>}
    {wet>0&&<path d={tee} fill="#1d3a5c" fillOpacity={(cotton?.32:.06)*Math.min(1,wet)} style={{mixBlendMode:'multiply'}}/>}
   </g>
   {/* arms over the sleeves */}
   <circle cx="42" cy="118" r="8" fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/><circle cx="158" cy="118" r="8" fill="#e9c39b" stroke="#16181d" strokeWidth="1.4"/>
  </g>
  {drops&&<g ref={drops} fill="#5ab0e6">{Array.from({length:14},(_,i)=><path key={i} d="M0 -6 Q3 0 0 3 Q-3 0 0 -6 Z" transform="translate(-50 -50)"/>)}</g>}
 </svg>;
}

/** Little paper cut-outs for the tray (and the falling pieces). */
function PartIcon({id}:{id:PartId}){
 return <svg viewBox="0 0 48 40" className={styles.partSvg} aria-hidden="true" focusable="false">
  {id==='number'&&<><rect x="10" y="2" width="28" height="36" rx="3" fill="#a8263a" stroke="#16181d" strokeWidth="1.2"/><text x="24" y="31" textAnchor="middle" fontSize="28" fill="#fffdf6" fontFamily="Impact, 'Arial Narrow Bold', sans-serif">9</text></>}
  {id==='name'&&<><rect x="2" y="12" width="44" height="16" rx="3" fill="#a8263a" stroke="#16181d" strokeWidth="1.2"/><text x="24" y="24.5" textAnchor="middle" fontSize="11" fontWeight="900" letterSpacing="1.5" fill="#fffdf6" fontFamily="system-ui, sans-serif">BEAN</text></>}
  {id==='sponsor'&&<><rect x="2" y="11" width="44" height="18" rx="3" fill="#f2c94c" stroke="#16181d" strokeWidth="1.2" transform="rotate(-4 24 20)"/><text x="24" y="23.5" textAnchor="middle" fontSize="7.4" fontWeight="900" textLength="38" lengthAdjust="spacingAndGlyphs" fill="#16181d" transform="rotate(-4 24 20)" fontFamily="system-ui, sans-serif">{SPONSOR}</text></>}
  {id==='synthetic'&&<><rect x="6" y="4" width="36" height="32" fill="#d3243a" stroke="#16181d" strokeWidth="1.2"/>{Array.from({length:30},(_,i)=><circle key={i} cx={10+(i%6)*5.6} cy={8+Math.floor(i/6)*6} r="1.1" fill="#fff" opacity=".6"/>)}</>}
  {id==='vneck'&&<><path d="M6 6 L18 6 L24 22 L30 6 L42 6 L42 34 L6 34 Z" fill="#a8263a" stroke="#16181d" strokeWidth="1.2"/><path d="M18 6 L24 22 L30 6" fill="none" stroke="#fffdf6" strokeWidth="3"/></>}
 </svg>;
}
