'use client';
import {useCallback,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import styles from './Experience.module.css';
import {CLIP_LEN,SPEED,START_CLOCK,clipAt,clipKeys,clockText,createWorld,loadInto,type Era,type Phase,type World} from './sim';
import {drawWorld} from './draw';
import Quiz from './Quiz';
import {angleDiff,angleOf,coast,rubber,settled,springSamples,springStep,type Spring} from './spring';

/**
 * backpass-1992 · "The tape" (Oct 9 2026, user: "make the exhibit interactive … the museum is a playground for different
 * styles"). The full view tells the back-pass story as an early-90s VHS tape on a home VCR, in five beats the visitor drives:
 *  1. PLAY the 1990 tape (a back-pass under the old law);
 *  2. PAUSE it the moment the keeper picks the ball up (he may hold it and nobody may tackle him);
 *  3. turn the JOG dial (the hall's zoetrope drum, now a VCR jog wheel) to rewind and roll it on: the "seconds wasted" climb
 *     and fall with the tape;
 *  4. swap in the 1992 tape: the deck rewinds (◀◀ REW, tracking noise) and plays the very same moment under the new law;
 *  5. the takeaway: same back-pass, 25 s wasted before, none after; then "Ref's call" (Quiz.tsx, a four-call quick check)
 *     and the two-pitch match.
 * The style is built in code: the VCR's on-screen display (blocky mono OSD, PLAY ▶ / ❚❚ PAUSE / ◀◀ REW, a tape counter, SP),
 * a CRT bezel, scanlines, a pre-rendered noise tile and a tracking band that shows only while the tape moves fast.
 *
 * Motion: the jog dial follows the finger's angle exactly, keeps momentum on release (exponential friction), rubber-bands past
 * either end of the tape and springs back (a velocity-aware damped spring, interruptible). The cassette slides into the slot on
 * a spring sampled into Web Animations keyframes; the swap rewinds the tape at 7× before the new tape plays.
 *
 * Heat: no loop at rest. One requestAnimationFrame loop runs only while the tape plays/winds, a hand is on the dial or a spring
 * settles; it stops when the tab hides (landing everything at rest) and is cancelled on unmount. The canvas is drawn once per
 * change at a pixel ratio ≤ 1.5 on touch and released on unmount. Reduced motion: PLAY and the winds step between the key frames
 * (no playback loop), no momentum, springs, tracking or slide; every frame, meter and message is still there.
 */
const TURN=1.6;// seconds of tape per full turn of the jog dial
const SLOTS=12;// zoetrope slots on the dial: one soft click per slot
const WIND=7;// rewind / fast-forward speed
const WASTE_FULL=26;
type Props={facts:readonly string[];forYourGame:string;onPlayMatch:(from:DOMRect|null)=>void;onStory:()=>void};
type Mode='idle'|'play'|'wind'|'drag'|'coast'|'spring';
type Beat=0|1|2|3|4|5;
const OLD_WASTE=Math.round(clipAt('old',CLIP_LEN).wasted),NEW_PASSES=clipAt('new',CLIP_LEN).goodPasses;
const LINES:Record<Era,Partial<Record<Phase,string>>>={
 old:{back:'Number 4 kicks it back to the keeper…',hold:'He picks it up. Nobody may tackle him. Tick, tock…',roll:'He rolls it out… and he could do it all again.',idle:'All that time, and nobody played football!'},
 new:{back:'1992: the same kick back to the keeper…',feet:'No hands now! He must use his feet, fast.',out:'A quick pass to the free team-mate.',reset:'The ball keeps moving. No time wasted.',idle:'The ball keeps moving. No time wasted.',stolen:'Too slow!'},
};
const BEATS:{big:string;small:string}[]=[
 {big:'Press PLAY',small:'An old tape from 1990: your team leads 1–0, two minutes to go.'},
 {big:'PAUSE it when the keeper picks it up!',small:'Watch number 1, the keeper. Press PAUSE the moment the ball is in his hands.'},
 {big:'Turn the JOG dial',small:'Rewind and roll it on. Watch the seconds wasted go up and down.'},
 {big:'Put in the 1992 tape',small:'Tap the 1992 tape. Same moment, new law.'},
 {big:'Press PLAY again',small:'Since 1992 the keeper may not pick up a kicked back-pass. What does he do now?'},
];
const svg=(d:string)=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={d} fill="currentColor"/></svg>;
const ICON={rew:svg('M11 6v12L2 12zM21 6v12l-9-6z'),play:svg('M7 5v14l12-7z'),pause:svg('M6 5h4v14H6zM14 5h4v14h-4z'),ff:svg('M3 6v12l9-6zM13 6v12l9-6z')};
/** The VCR's tape counter (H:MM:SS of match time on the tape). */
const tapeCounter=(t:number)=>{const s=Math.floor(t*SPEED);return `0:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};

/** One noise tile for the tape grain, made once (not per frame) and shared. */
let NOISE:string|null=null;
function noiseTile(){if(NOISE!==null)return NOISE;try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');if(!g)return NOISE='';
 let seed=1992;const r=()=>((seed=(seed*16807)%2147483647)/2147483647);const im=g.createImageData(96,96);
 for(let i=0;i<im.data.length;i+=4){const v=r()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=r()<.5?26:0;}
 g.putImageData(im,0,0);NOISE=c.toDataURL();}catch{NOISE='';}return NOISE;}

export default function Film({facts,forYourGame,onPlayMatch,onStory}:Props){
 const [era,setEra]=useState<Era>('old');
 const [phase,setPhase]=useState<Phase>('back');
 const [beat,setBeat]=useState<Beat>(0);
 const [status,setStatus]=useState<'STOP'|'PLAY'|'PAUSE'|'REW'|'FF'|'JOG'>('STOP');
 const [atEnd,setAtEnd]=useState(false);
 const [flash,setFlash]=useState<{id:number;text:string}|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),feed=useRef<HTMLDivElement>(null),wheel=useRef<SVGGElement>(null),dial=useRef<HTMLDivElement>(null);
 const counter=useRef<HTMLSpanElement>(null),clockEl=useRef<HTMLSpanElement>(null),vfd=useRef<HTMLSpanElement>(null),track=useRef<HTMLSpanElement>(null),cassette=useRef<HTMLSpanElement>(null),screen=useRef<HTMLDivElement>(null);
 const meters=useRef<Record<Era,{num:HTMLElement|null;bar:HTMLElement|null}>>({old:{num:null,bar:null},new:{num:null,bar:null}});
 const size=useRef({w:0,h:0}),dpr=useRef(1),reduced=useRef(false),raf=useRef(0),last=useRef(0),flashId=useRef(0);
 const disp=useRef<Record<Era,World>|null>(null);
 // Physics (refs: the loop mutates them without re-rendering React each frame).
 const tape=useRef<Spring>({x:0,v:0}),mode=useRef<Mode>('idle'),goal=useRef(0),wind=useRef(0),raw=useRef(0),samples=useRef<{t:number;x:number}[]>([]);
 const grab=useRef<{a:number;cx:number;cy:number;linear?:{x0:number;w:number}}|null>(null),pending=useRef<Era|null>(null),jogged=useRef(0);
 const eraRef=useRef<Era>('old');eraRef.current=era;
 const beatRef=useRef<Beat>(0);beatRef.current=beat;
 const slot=useRef(0),tickAt=useRef(0),newSeen=useRef(false);

 const say=useCallback((text:string)=>setFlash({id:++flashId.current,text}),[]);
 const hush=()=>setFlash(null);// a new move on the tape clears the last message
 const statusOf=():typeof status=>{const m=mode.current;if(m==='play')return 'PLAY';if(m==='wind')return wind.current<0?'REW':'FF';if(m==='drag'||m==='coast'||m==='spring')return 'JOG';return (tape.current.x<=0&&beatRef.current===0)||tape.current.x>=CLIP_LEN-.04?'STOP':'PAUSE';};

 // ---- Painting: one frame, straight to the canvas and the DOM -----------------------------------------------------------
 const paint=useCallback(()=>{
  const e=eraRef.current,x=tape.current.x,t=Math.max(0,Math.min(CLIP_LEN,x));
  if(!disp.current)disp.current={old:createWorld('old'),new:createWorld('new')};
  const w=loadInto(disp.current[e],clipAt(e,t));
  const c=canvas.current,ctx=c?.getContext('2d');
  if(c&&ctx&&size.current.w)drawWorld(ctx,w,size.current.w,size.current.h,dpr.current,t*1000,reduced.current,false);
  wheel.current?.setAttribute('transform',`rotate(${(x/TURN*360).toFixed(2)} 70 70)`);
  if(dial.current){dial.current.setAttribute('aria-valuenow',t.toFixed(1));dial.current.setAttribute('aria-valuetext',`Tape at ${tapeCounter(t)}, ${Math.round(clipAt(e,t).wasted)} seconds wasted`);}
  const tc=tapeCounter(t);if(counter.current)counter.current.textContent=tc;if(vfd.current)vfd.current.textContent=tc;
  if(clockEl.current)clockEl.current.textContent=clockText(START_CLOCK+t*SPEED);
  for(const m of ['old','new'] as Era[]){const r=meters.current[m],v=clipAt(m,t).wasted,show=m==='old'||newSeen.current;
   if(r.num)r.num.textContent=show?String(Math.round(v)):'?';if(r.bar)r.bar.style.transform=`scaleX(${show?Math.min(1,v/WASTE_FULL):0})`;}
  // tracking band: only while the tape moves fast (wind, quick jog); its place follows the tape, so no loop of its own
  const speed=mode.current==='wind'?Math.abs(wind.current):mode.current==='play'?0:Math.abs(tape.current.v);
  if(track.current){const k=reduced.current?0:Math.min(1,Math.max(0,(speed-1.2)/4));track.current.style.opacity=k.toFixed(2);track.current.style.transform=`translateY(${(((x*137)%1+1)%1*100).toFixed(1)}%)`;}
  // the zoetrope's soft click per slot while jogging by hand
  const s=Math.floor(x/TURN*SLOTS);if(s!==slot.current){slot.current=s;const now=performance.now();if((mode.current==='drag'||mode.current==='coast')&&now-tickAt.current>55){tickAt.current=now;museumSfx.tick();}}
  setPhase(p=>p===w.phase?p:w.phase);
  const end=t>=CLIP_LEN-.04;setAtEnd(a=>a===end?a:end);
  const st=statusOf();setStatus(p=>p===st?p:st);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 // Story beats that advance from the tape itself.
 const onTape=useCallback((ended:boolean)=>{
  const b=beatRef.current,e=eraRef.current;
  if(b===1&&ended&&e==='old'){setBeat(2);say('Missed it! Use the JOG dial to find where he holds the ball.');}
  if(b===2&&jogged.current>=1.2){setBeat(3);}
  if(b===4&&ended&&e==='new'){setBeat(5);museumSfx.reveal();}
 },[say]);

 // ---- The loop: only while the tape moves, a hand is on the dial or a spring settles ---------------------------------------
 const frame=useCallback((now:number)=>{
  raf.current=0;const dt=Math.min(1/30,Math.max(0,(now-last.current)/1000));last.current=now;
  let busy=false,ended=false;const m=mode.current;
  if(m==='play'){const x=tape.current.x+dt;if(x>=CLIP_LEN){tape.current={x:CLIP_LEN,v:0};mode.current='idle';ended=true;}else{tape.current={x,v:1};busy=true;}}
  else if(m==='wind'){const x=tape.current.x+dt*wind.current;
   if(x<=0||x>=CLIP_LEN){tape.current={x:x<=0?0:CLIP_LEN,v:0};mode.current='idle';ended=x>=CLIP_LEN;}else{tape.current={x,v:wind.current};busy=true;}}
  else if(m==='drag')busy=true;
  else if(m==='coast'){const n=coast(tape.current,dt);jogged.current+=Math.abs(n.x-tape.current.x);
   if(n.x<0||n.x>CLIP_LEN){mode.current='spring';goal.current=n.x<0?0:CLIP_LEN;}
   tape.current=n;busy=true;if(mode.current==='coast'&&Math.abs(n.v)<.02){mode.current='idle';tape.current={x:n.x,v:0};busy=false;}}
  if(mode.current==='spring'){const n=springStep(tape.current,goal.current,dt);tape.current=n;
   if(settled(n,goal.current)){tape.current={x:goal.current,v:0};mode.current='idle';}else busy=true;}
  if(pending.current&&mode.current==='idle')commitTape();
  paint();onTape(ended);
  if(busy&&document.visibilityState==='visible')raf.current=requestAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[paint,onTape]);
 const wake=useCallback(()=>{if(raf.current||document.visibilityState!=='visible')return;last.current=performance.now();raf.current=requestAnimationFrame(frame);},[frame]);

 /** The new tape drops into the slot (a sampled spring, WAAPI) and the screen blinks blue like a VCR changing input. */
 const commitTape=()=>{const to=pending.current;pending.current=null;if(!to)return;
  eraRef.current=to;setEra(to);if(to==='new')newSeen.current=true;museumSfx.stamp();
  if(beatRef.current<4&&to==='new')setBeat(4);
  if(reduced.current)return;
  const cs=cassette.current;if(cs&&typeof cs.animate==='function'){const {frames,ms}=springSamples(260,18);
   cs.animate(frames.map(f=>({transform:`translateY(${((1-f.p)*-70).toFixed(2)}%)`,offset:f.offset})),{duration:ms});}
  const sc=screen.current;if(sc&&typeof sc.animate==='function')sc.animate([{opacity:1},{opacity:1,offset:.5},{opacity:0}],{duration:420,easing:'steps(4,end)'});
 };
 const insert=(to:Era)=>{if(to===eraRef.current||pending.current)return;unlockMuseumAudio();museumSfx.flap();hush();
  pending.current=to;
  if(reduced.current){tape.current={x:0,v:0};mode.current='idle';commitTape();paint();return;}
  if(tape.current.x<=0){mode.current='idle';commitTape();paint();return;}
  museumSfx.spin();mode.current='wind';wind.current=-WIND;wake();// rewind first, then change tapes
 };

 // ---- Sizing, visibility, cleanup -----------------------------------------------------------------------------------------
 useEffect(()=>{
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;dpr.current=Math.min(window.devicePixelRatio||1,coarse?1.5:2);
  const n=noiseTile();if(n&&feed.current)feed.current.style.setProperty('--bp-noise',`url(${n})`);
  const c=canvas.current;
  const ro=new ResizeObserver(([en])=>{const {width,height}=en.contentRect;size.current={w:width,h:height};
   if(c){c.width=Math.max(1,Math.round(width*dpr.current));c.height=Math.max(1,Math.round(height*dpr.current));}paint();});
  if(c)ro.observe(c);
  const vis=()=>{if(document.visibilityState==='visible')return;cancelAnimationFrame(raf.current);raf.current=0;
   // hidden: pause the tape and land every spring now, so nothing is left running
   if(mode.current!=='drag'){tape.current={x:Math.max(0,Math.min(CLIP_LEN,tape.current.x)),v:0};mode.current='idle';}
   if(pending.current){tape.current={x:0,v:0};commitTape();}paint();};
  document.addEventListener('visibilitychange',vis);
  return()=>{ro.disconnect();document.removeEventListener('visibilitychange',vis);cancelAnimationFrame(raf.current);raf.current=0;if(c){c.width=1;c.height=1;}};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[paint]);
 useEffect(()=>{paint();},[era,beat,paint]);

 // ---- Transport ------------------------------------------------------------------------------------------------------------
 /** Reduced motion: no playback loop; PLAY and the winds step to the next/previous key frame of the story. */
 const stepKey=(dir:1|-1)=>{const keys=[0,...clipKeys(eraRef.current)],x=tape.current.x;
  const to=dir>0?keys.find(k=>k>x+.01)??CLIP_LEN:[...keys].reverse().find(k=>k<x-.01)??0;tape.current={x:to,v:0};mode.current='idle';paint();
  // the tape stands still on each key frame, so landing on the hold is the "pause" of beat 2
  if(beatRef.current<=1&&eraRef.current==='old'&&clipAt('old',to).phase==='hold'){setBeat(2);say('PAUSE · Got it! He holds the ball, and nobody may tackle him.');}
  onTape(to>=CLIP_LEN-.04);};
 const play=()=>{unlockMuseumAudio();if(pending.current)return;museumSfx.flap();hush();
  if(tape.current.x>=CLIP_LEN-.04)tape.current={x:0,v:0};// at the end: play from the top
  if(beatRef.current===0)setBeat(1);
  if(reduced.current){stepKey(1);return;}
  mode.current='play';paint();wake();};
 const pause=()=>{unlockMuseumAudio();if(pending.current)return;museumSfx.tick();
  const wasMoving=mode.current==='play'||mode.current==='wind';mode.current='idle';tape.current={x:Math.max(0,Math.min(CLIP_LEN,tape.current.x)),v:0};paint();
  if(beatRef.current===1&&eraRef.current==='old'){
   const p=clipAt('old',tape.current.x).phase;
   if(p==='hold'){setBeat(2);say('PAUSE · Got it! He holds the ball, and nobody may tackle him.');museumSfx.reveal();}
   else if(wasMoving)say(p==='back'?'Not yet: the ball is still rolling to him.':'Too late: he has already let it go.');
  }};
 const windBy=(dir:1|-1)=>{unlockMuseumAudio();if(pending.current)return;museumSfx.spin();hush();
  if(beatRef.current===0)setBeat(1);
  if(reduced.current){const x0=tape.current.x;stepKey(dir);jogged.current+=Math.abs(tape.current.x-x0);onTape(false);return;}
  const x0=tape.current.x;mode.current='wind';wind.current=dir*WIND;jogged.current+=1.2*(x0>0&&x0<CLIP_LEN?1:0);wake();};

 // ---- The JOG dial: drag around its centre (or along the tape on screen), arrows, Home/End -----------------------------------
 const sample=(x:number)=>{const now=performance.now(),a=samples.current;a.push({t:now,x});while(a.length>2&&now-a[0].t>90)a.shift();};
 const setRaw=(x:number)=>{jogged.current+=Math.abs(x-raw.current);raw.current=x;tape.current={x:reduced.current?Math.max(0,Math.min(CLIP_LEN,x)):rubber(x,0,CLIP_LEN),v:0};sample(x);};
 const begin=(e:ReactPointerEvent<Element>,linear:boolean)=>{
  if(pending.current)return;unlockMuseumAudio();hush();if(beatRef.current===0)setBeat(1);
  const el=e.currentTarget as Element,r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  grab.current={a:angleOf(e.clientX,e.clientY,cx,cy),cx,cy,linear:linear?{x0:e.clientX,w:r.width}:undefined};
  raw.current=tape.current.x;samples.current=[];sample(raw.current);mode.current='drag';// interrupts play, wind or a spring
  el.setPointerCapture(e.pointerId);paint();wake();
 };
 const drag=(e:ReactPointerEvent<Element>)=>{const g=grab.current;if(!g||mode.current!=='drag')return;
  if(g.linear){const dx=e.clientX-g.linear.x0;g.linear.x0=e.clientX;setRaw(raw.current+dx/g.linear.w*CLIP_LEN*.9);}
  else{const a=angleOf(e.clientX,e.clientY,g.cx,g.cy),d=angleDiff(a,g.a);g.a=a;setRaw(raw.current+d/(Math.PI*2)*TURN);}
 };
 const end=()=>{if(!grab.current)return;grab.current=null;if(mode.current!=='drag')return;
  const a=samples.current,v=a.length>1?(a[a.length-1].x-a[0].x)/Math.max(.016,(a[a.length-1].t-a[0].t)/1000):0,x=tape.current.x;
  if(reduced.current){mode.current='idle';tape.current={x:Math.max(0,Math.min(CLIP_LEN,x)),v:0};paint();onTape(false);return;}
  if(x<0||x>CLIP_LEN){mode.current='spring';goal.current=x<0?0:CLIP_LEN;tape.current={x,v:v*.3};}
  else{mode.current='coast';tape.current={x,v:Math.max(-6,Math.min(6,v))};}
  wake();};
 const nudge=(d:number)=>{if(pending.current)return;unlockMuseumAudio();hush();if(beatRef.current===0)setBeat(1);
  const to=Math.max(0,Math.min(CLIP_LEN,(mode.current==='spring'?goal.current:tape.current.x)+d));jogged.current+=Math.abs(d);
  if(reduced.current){tape.current={x:to,v:0};mode.current='idle';paint();onTape(false);return;}
  goal.current=to;mode.current='spring';wake();};
 const dialKey=(e:ReactKeyboardEvent)=>{const k=e.key,d=k==='ArrowRight'||k==='ArrowUp'?.25:k==='ArrowLeft'||k==='ArrowDown'?-.25:k==='PageUp'?1:k==='PageDown'?-1:k==='Home'?-99:k==='End'?99:0;
  if(!d)return;e.preventDefault();nudge(d);};

 // ---- Words ----------------------------------------------------------------------------------------------------------------
 const line=beat===0?'Tape 1 · 1990 · the old law':(atEnd&&era==='old'?`${OLD_WASTE} seconds wasted, and nobody played football!`:LINES[era][phase]??'');
 const prompt=beat<5?BEATS[beat]:null;
 const playMatch=()=>onPlayMatch(feed.current?.getBoundingClientRect()??null);
 const osd=status==='PLAY'?'PLAY ►':status==='PAUSE'?'PAUSE ‖':status==='REW'?'◄◄ REW':status==='FF'?'FF ►►':status==='JOG'?'◄ JOG ►':'STOP';

 return <div className={styles.film} data-era={era} data-beat={beat}>
  <div ref={feed} className={styles.tv} data-era={era} data-status={status}>
   <div className={styles.tvGlass}>
    <canvas ref={canvas} className={styles.filmCanvas} role="img" aria-label={`Tape ${era==='old'?'1, 1990, before the 1992 law':'2, 1992, after the new law'}: a back-pass to your keeper. ${line}`}
     onPointerDown={e=>begin(e,true)} onPointerMove={drag} onPointerUp={end} onPointerCancel={end}/>
    <span className={styles.grain} aria-hidden="true"/>
    <span className={styles.scanlines} aria-hidden="true"/>
    <span ref={track} className={styles.tracking} aria-hidden="true"/>
    <span className={styles.headSwitch} aria-hidden="true"/>
    <div className={styles.osd} aria-hidden="true">
     <span className={styles.osdStatus} key={status}>{osd}</span>
     <span className={styles.osdBug}><i>1–0</i><span ref={clockEl}>88:00</span></span>
     <span className={styles.osdCounter} ref={counter}>0:00:00</span>
     <span className={styles.osdTape}>{era==='old'?'TAPE 1 · 1990':'TAPE 2 · 1992'} <b>SP</b></span>
    </div>
    <div ref={screen} className={styles.blueScreen} aria-hidden="true"><span>VIDEO 1</span></div>
    {flash&&<div key={flash.id} className={styles.osdFlash} aria-hidden="true"><span>{flash.text}</span></div>}
    {beat===2&&<span className={styles.dragHint} aria-hidden="true">◀ drag the tape ▶</span>}
   </div>
   <p className={styles.filmLine} data-era={era} aria-live="polite">{flash?.text??line}</p>
  </div>

  <div className={styles.deckSide}>
   {prompt?<div className={styles.beat} key={beat}>
     <span className={styles.beatNo} aria-hidden="true">{beat+1}/5</span>
     <b>{prompt.big}</b><span>{prompt.small}</span>
    </div>
    :<div className={styles.takeaway}>
     <p className={styles.takeKicker}>What changed in 1992</p>
     <p className={styles.takeBig}>Same back-pass. Before 1992: {OLD_WASTE} seconds wasted. After 1992: none, and {NEW_PASSES===2?'two':NEW_PASSES} quick passes.</p>
     <p className={styles.takeFact}>{facts[1]} {facts[2]}</p>
     <p className={styles.takeGame}><b>Take it to your game</b>{forYourGame}</p>
    </div>}
   {beat===5&&<Quiz/>}

   <div className={styles.compare} role="group" aria-label="Seconds wasted at this point of the tape">
    {(['old','new'] as Era[]).map(m=><div key={m} className={styles.cmpRow} data-era={m} data-on={era===m||undefined}>
     <span className={styles.cmpLabel}>{m==='old'?'Before 1992':'After 1992'}</span>
     <span className={styles.cmpBar} aria-hidden="true"><i ref={el=>{meters.current[m].bar=el;}}/></span>
     <span className={styles.cmpNum}><b ref={el=>{meters.current[m].num=el;}}>{m==='old'?'0':'?'}</b>s wasted</span>
    </div>)}
   </div>

   <div className={styles.deck}>
    <div className={styles.deckTop}>
     <div className={styles.slot} aria-hidden="true"><span ref={cassette} className={styles.cassette} data-era={era}><i/><b>{era==='old'?'1990 · OLD LAW':'1992 · NEW LAW'}</b><i/></span></div>
     <span className={styles.vfd} aria-hidden="true"><em>{status}</em><span ref={vfd}>0:00:00</span></span>
    </div>
    <div className={styles.deckBody}>
     <div className={styles.transport} role="group" aria-label="Tape controls">
      <button type="button" className={styles.vcrBtn} onClick={()=>windBy(-1)} aria-label="Rewind" data-museum-own-cue data-on={status==='REW'||undefined}>{ICON.rew}</button>
      <button type="button" className={styles.vcrBtn} onClick={play} aria-label="Play" data-museum-own-cue data-on={status==='PLAY'||undefined} data-hint={beat===0||beat===4||undefined}>{ICON.play}</button>
      <button type="button" className={styles.vcrBtn} onClick={pause} aria-label="Pause" data-museum-own-cue data-on={status==='PAUSE'||undefined} data-hint={beat===1||undefined}>{ICON.pause}</button>
      <button type="button" className={styles.vcrBtn} onClick={()=>windBy(1)} aria-label="Fast forward" data-museum-own-cue data-on={status==='FF'||undefined}>{ICON.ff}</button>
      <div className={styles.tapes} role="group" aria-label="Choose a tape">
       {(['old','new'] as Era[]).map(m=><button key={m} type="button" className={styles.tapeBtn} data-era={m} aria-pressed={era===m} onClick={()=>insert(m)} data-museum-own-cue
        data-hint={(beat===3&&m==='new')||undefined}>{m==='old'?'1990 tape':'1992 tape'}</button>)}
      </div>
     </div>
     <div className={styles.jogWrap}>
      <div ref={dial} className={styles.jog} role="slider" tabIndex={0} aria-label="Jog dial: turn to rewind or roll the tape on" aria-valuemin={0} aria-valuemax={Number(CLIP_LEN.toFixed(1))} aria-valuenow={0}
       data-hint={beat===2||undefined} onKeyDown={dialKey} onPointerDown={e=>begin(e,false)} onPointerMove={drag} onPointerUp={end} onPointerCancel={end}>
       <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle cx="70" cy="70" r="66" className={styles.jogRim}/>
        <g ref={wheel}>
         {Array.from({length:SLOTS},(_,i)=><rect key={i} x="66" y="10" width="8" height="14" rx="2" className={styles.jogSlot} transform={`rotate(${i*360/SLOTS} 70 70)`}/>)}
         <circle cx="70" cy="70" r="44" className={styles.jogFace}/>
         <circle cx="70" cy="38" r="9" className={styles.jogDimple}/>
        </g>
        <circle cx="70" cy="70" r="7" className={styles.jogHub}/>
       </svg>
      </div>
      <span className={styles.jogLabel} aria-hidden="true">JOG</span>
     </div>
    </div>
   </div>

   <div className={styles.filmBtns}>
    <button type="button" className={`${styles.pass} ${beat===5?'':styles.passQuiet}`} onClick={playMatch}>{beat===5?'Now play the match':'Skip to the match'}</button>
    {beat===5&&<button type="button" className={styles.storyBtn} onClick={onStory}>The real story</button>}
   </div>
  </div>
 </div>;
}
