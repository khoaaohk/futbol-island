'use client';
import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {flushSync} from 'react-dom';
import {EDGE_SPRING,FLIP_SPRING,SNAP_SPRING,atRest,coast,project,rubber,rubberClamp,springEasing,stepSpring,velocity,type SpringState} from './motion';
import ExperienceBack from '../ExperienceBack';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import styles from './var.module.css';
import {CAMS,DEEP,FPS,KICK,LAST,TRUTH,camOf,drawFrame,groundZAt,snapLine,timecode,type CamId,type LineTarget} from './scene';
const Z_MIN=8,Z_MAX=26;
import Quiz from './Quiz';
import {CASE_FACTS,CHECKS,FOR_YOUR_GAME,IFAB_MOTTO,IFAB_QUOTE,OFFSIDE_LAW,PRACTICE_NOTE,REAL_CASE,SOURCES,TOURNAMENT_NUMBERS} from './content';

/**
 * var-2018 · "You are the VAR" (Oct 5 2026). A dark broadcast control room: one PRACTICE moment (made up, drawn live from four
 * camera angles by scene.ts). The visitor scrubs to the kick frame, drags the offside lines onto the right body parts (arms don't
 * count), judges whether the WHOLE ball crossed the WHOLE line, then swaps chairs: as the referee at the pitchside screen they
 * make the decision, because VAR only advises. Ends on the real 2018 case (France v Australia, the first VAR penalty), told one
 * beat at a time ("What happened next?", the monitor's slate follows: play on, look again, penalty), then a four-question quick
 * check (Quiz.tsx) whose payoff stamps the monitor "VAR CERTIFIED" (Oct 9 2026).
 *
 * Motion pass (Oct 9 2026, motion.ts): the offside lines are physical. A drag follows the finger, clicks onto a body part with a
 * magnet, rubber-bands past the 8–26 m ends, and on release keeps the finger's velocity: a flick glides, then a spring settles it
 * (onto the body part when it lands near one). Scrubbing the monitor works the same way: flick to coast through the frames, the
 * clip decelerates, and pulling past the first or last frame stretches the picture and springs it back. A camera switch is a FLIP:
 * the new feed grows out of the thumbnail you tapped into the monitor, on a spring-sampled linear() easing (no View Transitions).
 * One rAF loop drives all of it and stops the moment everything is at rest.
 *
 * Heat: nothing animates unless the visitor plays the clip or a line/scrub is still settling. Drawing happens on demand (one requestAnimationFrame per change, never
 * a loop); playback is a rAF loop that stops at the last frame, on pause, when the tab hides and on unmount. Canvas pixel ratio
 * is capped (1.5 on coarse pointers, 2 otherwise; thumbnails at 1). No WebGL, no audio nodes of our own (museumSfx one-shots).
 */
type Step='booth'|'kick'|'lines'|'goal'|'ref'|'case';
const STEPS:readonly {id:Step;label:string}[]=[{id:'booth',label:'Booth'},{id:'kick',label:'Kick frame'},{id:'lines',label:'Offside'},{id:'goal',label:'Goal line'},{id:'ref',label:'Referee'},{id:'case',label:'2018'}];
type Lines={def:number;att:number};
const START_LINES:Lines={def:19.4,att:13.2};
const PLAY_FPS=FPS/2;
const ZOOM=2;// replays run at half speed, like slow motion on TV

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [step,setStep]=useState<Step>('booth');
 const [frame,setFrameState]=useState(0);
 const [cam,setCam]=useState<CamId>('wide');
 const [zoom,setZoom]=useState(false);
 const [playing,setPlaying]=useState(false);
 const [lines,setLines]=useState<Lines>(START_LINES);
 const [snap,setSnap]=useState<{def:LineTarget|null;att:LineTarget|null}>({def:null,att:null});
 const [kickMsg,setKickMsg]=useState<string|null>(null);
 const [goalCall,setGoalCall]=useState<'goal'|'nogoal'|null>(null);
 const [refCall,setRefCall]=useState<'goal'|'nogoal'|null>(null);
 const [checked,setChecked]=useState<readonly number[]>([]);
 // The real 2018 case unfolds one line at a time (0..2), then the quick check.
 const [caseBeat,setCaseBeat]=useState(0),[certified,setCertified]=useState<string|null>(null);
 const rangeEl=useRef<HTMLInputElement>(null);
 // The timeline's filled part (a CSS variable set after mount, so server and client markup match).
 useEffect(()=>{rangeEl.current?.style.setProperty('--p',`${frame/LAST*100}%`);},[frame]);
 const panel=useRef<HTMLDivElement>(null),monitorEl=useRef<HTMLDivElement>(null),flashEl=useRef<HTMLSpanElement>(null),main=useRef<HTMLCanvasElement>(null),thumbs=useRef<(HTMLCanvasElement|null)[]>([]),root=useRef<HTMLElement>(null);
 const raf=useRef(0),lastTick=useRef(0);
 // A big broadcast stamp on the monitor when the visitor gets a check right (CSS animation, finite; keyed so it replays).
 const [stamp,setStamp]=useState<{id:number;text:string;tone:'go'|'stop'|'info'}|null>(null);
 const stampNo=useRef(0);
 const showStamp=useCallback((text:string,tone:'go'|'stop'|'info')=>{stampNo.current+=1;setStamp({id:stampNo.current,text,tone});requestAnimationFrame(()=>punch());},[]);

 const scrubbable=step==='kick'||step==='goal';
 const linesShown=step==='lines'||(step!=='booth'&&step!=='kick'&&frame===KICK);
 const onside=snap.def?.id==='def'&&snap.att?.id==='att';
 const armTagged=snap.att?.id==='arm';
 useEffect(()=>{if(onside)showStamp(`ONSIDE · ${TRUTH.onsideCm} cm`,'go');},[onside,showStamp]);
 useEffect(()=>{setStamp(null);},[step]);

 // ---- Drawing: on demand only ----------------------------------------------------------------------------------------------
 const state=useRef({frame,cam,zoom,lines,snap,step,linesShown,goalCall,refCall});
 state.current={frame,cam,zoom,lines,snap,step,linesShown,goalCall,refCall};
 const drawAll=useCallback(()=>{
  const s=state.current,tags={def:s.snap.def?.label,att:s.snap.att?(s.snap.att.id==='arm'?'Arm: doesn’t count':s.snap.att.label):undefined,attBad:s.snap.att?.id==='arm'};
  const L=live.current&&s.linesShown?{...s.lines,[live.current.who]:live.current.z}:s.lines;
  const opts={lines:s.linesShown?L:undefined,active:live.current?.who??null,handles:s.step==='lines',grid:s.step==='lines',gridSkip:main.current?Math.min(.5,190/Math.max(1,main.current.clientWidth)):0,lineTags:s.linesShown?tags:undefined,measure:(s.goalCall==='nogoal'||s.step==='ref'||s.step==='case')&&s.frame===DEEP};
  const m=main.current,g=m?.getContext('2d');if(m&&g&&m.width>0)drawFrame(g,m.width,m.height,s.cam,s.frame,{...opts,zoom:s.zoom?ZOOM:1,dim:s.step==='booth'?.55:s.step==='case'?.8:0});
  CAMS.forEach((c,i)=>{const t=thumbs.current[i],tg=t?.getContext('2d');if(t&&tg&&t.width>0)drawFrame(tg,t.width,t.height,c.id,s.frame,{lines:opts.lines});});
  // Over-scrub: the picture stretches past the first/last frame (compositor transform, no repaint).
  if(m)m.style.transform=Math.abs(edge.current.x)>.3?`translateX(${edge.current.x.toFixed(1)}px)`:'';
 },[]);
 const requestDraw=useCallback(()=>{if(raf.current)return;raf.current=requestAnimationFrame(()=>{raf.current=0;drawAll();});},[drawAll]);
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 // Camera switch, FLIP: First = the thumbnail's box, Last = the monitor's box once the new angle is drawn, Invert = a transform that
 // puts the monitor back over the thumbnail, Play = a spring (sampled into a CSS linear() easing) back to identity. Compositor-
 // only (transform), finite, interruptible by the next tap. Reduced motion: a quick broadcast cut instead.
 const [cuts,setCuts]=useState(0);
 const flip=useRef<Animation|null>(null);
 const switchCam=(id:CamId,thumb:HTMLElement)=>{
  if(id===state.current.cam)return;
  const mon=monitorEl.current,first=thumb.getBoundingClientRect();
  flushSync(()=>setCam(id));drawAll();
  if(!mon||reduced()||typeof mon.animate!=='function'){if(!reduced())setCuts(n=>n+1);return;}
  flip.current?.cancel();
  const last=mon.getBoundingClientRect();if(!last.width||!last.height)return;
  const sx=first.width/last.width,sy=first.height/last.height,dx=first.left-last.left,dy=first.top-last.top;
  const e=springEasing(FLIP_SPRING),linearOk=typeof CSS!=='undefined'&&CSS.supports?.('animation-timing-function','linear(0, 1)');
  flip.current=mon.animate([{transformOrigin:'0 0',transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${sx.toFixed(4)},${sy.toFixed(4)})`},{transformOrigin:'0 0',transform:'none'}],
   {duration:linearOk?e.duration:420,easing:linearOk?e.easing:'cubic-bezier(.2,.9,.25,1.15)'});
  museumSfx.tick();
 };
 // The "got it" beat: a one-frame white flash and a tiny punch of the monitor (WAAPI, finite). Reduced motion: none; the stamp,
 // colour and sound still say it.
 const punch=useCallback(()=>{if(reduced())return;
  flashEl.current?.animate([{opacity:.32},{opacity:0}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)'});
  monitorEl.current?.animate([{transform:'scale(1)'},{transform:'scale(1.012)',offset:.35},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.34,1.56,.64,1)'});},[]);
 useEffect(()=>{requestDraw();},[frame,cam,zoom,lines,snap,step,linesShown,goalCall,refCall,requestDraw]);
 // Size every canvas to its box (pixel ratio capped); ResizeObserver, never polling.
 useEffect(()=>{
  const coarse=matchMedia('(pointer:coarse)').matches,dpr=Math.min(window.devicePixelRatio||1,coarse?1.5:2);
  const fit=(c:HTMLCanvasElement,ratio:number)=>{const r=c.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*ratio)),h=Math.max(1,Math.round(r.height*ratio));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}};
  const all=()=>{if(main.current)fit(main.current,dpr);thumbs.current.forEach(t=>t&&fit(t,1));drawAll();};
  const ro=new ResizeObserver(all);if(main.current)ro.observe(main.current);thumbs.current.forEach(t=>t&&ro.observe(t));all();
  return()=>{ro.disconnect();cancelAnimationFrame(raf.current);raf.current=0;};
 },[drawAll]);

 // ---- Frames and playback ----------------------------------------------------------------------------------------------------
 const setFrame=useCallback((f:number,user=false)=>{const n=Math.max(0,Math.min(LAST,Math.round(f)));
  if(user&&state.current.frame!==n){const now=performance.now();if(now-lastTick.current>45){lastTick.current=now;museumSfx.tick();}}setFrameState(n);},[]);
 useEffect(()=>{if(!playing)return;let id=0,last=performance.now(),acc=0;
  const tick=(now:number)=>{acc+=now-last;last=now;const steps=Math.floor(acc/(1000/PLAY_FPS));if(steps>0){acc-=steps*1000/PLAY_FPS;let done=false;
    setFrameState(f=>{const n=Math.min(LAST,f+steps);if(n>=LAST)done=true;return n;});if(done){setPlaying(false);return;}}
   id=requestAnimationFrame(tick);};
  id=requestAnimationFrame(tick);
  const hide=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',hide);
  return()=>{cancelAnimationFrame(id);document.removeEventListener('visibilitychange',hide);};
 },[playing]);
 const togglePlay=()=>{unlockMuseumAudio();if(!scrubbable)return;if(!playing&&frame>=LAST)setFrameState(step==='goal'?KICK:0);setPlaying(p=>!p);};
 useEffect(()=>{if(!scrubbable)setPlaying(false);},[scrubbable]);

 // Keep the newest feedback in view in the (scrolling) task panel; a new step starts at the top.
 useEffect(()=>{panel.current?.scrollTo({top:0});},[step]);
 useEffect(()=>{const all=panel.current?.querySelectorAll('[data-feedback]'),el=all?.[all.length-1];if(el)el.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});},[kickMsg,goalCall,refCall,onside,armTagged,caseBeat]);
 // ---- Keyboard: Escape leaves, arrows step frames, space plays ---------------------------------------------------------------
 useEffect(()=>{const key=(e:KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();onClose();return;}
  const t=e.target as HTMLElement|null,typing=t?.tagName==='INPUT'||t?.tagName==='TEXTAREA';
  if(typing||!scrubbable)return;
  if(e.key==='ArrowLeft'||e.key===','){e.preventDefault();setPlaying(false);setFrame(state.current.frame-1,true);}
  else if(e.key==='ArrowRight'||e.key==='.'){e.preventDefault();setPlaying(false);setFrame(state.current.frame+1,true);}
  else if(e.key===' '&&t?.tagName!=='BUTTON'&&t?.tagName!=='SUMMARY'){e.preventDefault();togglePlay();}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
 useEffect(()=>{root.current?.focus();},[]);

 // ---- Direct manipulation on the monitor: drag to scrub, or drag the offside lines -----------------------------------------
 type Sample={t:number;x:number};
 const drag=useRef<{kind:'scrub'|'line';who?:'def'|'att';x0:number;f0:number;dz?:number;per?:number;raw?:number;samples:Sample[]}|null>(null);
 const local=(e:ReactPointerEvent)=>{const c=main.current!,r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height,w:c.width,h:c.height,cssW:r.width};};
 const moveLine=useCallback((who:'def'|'att',z:number)=>{const s=snapLine(who,Math.max(Z_MIN,Math.min(Z_MAX,z)));
  if(s.target&&state.current.snap[who]?.id!==s.target.id)museumSfx.tick();
  setLines(l=>({...l,[who]:s.z}));setSnap(prev=>({...prev,[who]:s.target}));},[]);
 /** Mark which body part (if any) a line sits on: a tick when it clicks onto a new one. */
 const markSnap=useCallback((who:'def'|'att',t:LineTarget|null)=>{if(state.current.snap[who]?.id===(t?.id))return;if(t)museumSfx.tick();setSnap(prev=>({...prev,[who]:t}));},[]);

 // ---- The motion loop: one rAF while a line spring, a scrub coast or the over-scrub spring is still moving ------------------
 const live=useRef<{who:'def'|'att';z:number}|null>(null);
 const lineAnim=useRef<{who:'def'|'att';s:SpringState;to:number}|null>(null);
 const coastAnim=useRef<SpringState|null>(null);
 const edge=useRef<SpringState>({x:0,v:0});
 const loop=useRef(0),loopT=useRef(0),perPx=useRef(8);
 const [tried,setTried]=useState<{scrub?:boolean;lines?:boolean}>({});
 const settleAll=useCallback(()=>{// jump everything to where it was heading (tab hidden, unmount, reduced motion)
  const l=lineAnim.current;if(l){lineAnim.current=null;live.current=null;setLines(x=>({...x,[l.who]:l.to}));}
  const c=coastAnim.current;if(c){coastAnim.current=null;setFrameState(Math.max(0,Math.min(LAST,Math.round(c.x))));}
  edge.current={x:0,v:0};if(main.current)main.current.style.transform='';
 },[]);
 const tick=useCallback((now:number)=>{
  loop.current=0;const dt=Math.min(.05,(now-loopT.current)/1000||1/60);loopT.current=now;let moving=false;
  const l=lineAnim.current;
  if(l){stepSpring(l.s,l.to,dt,SNAP_SPRING);if(atRest(l.s,l.to)){lineAnim.current=null;live.current=null;const to=l.to;setLines(x=>({...x,[l.who]:to}));}else{live.current={who:l.who,z:l.s.x};moving=true;}}
  const c=coastAnim.current;
  if(c){coast(c,dt);
   if(c.x<0||c.x>LAST){// hit the first/last frame: the leftover speed becomes a bounce of the picture
    const per=perPx.current;edge.current.v+=Math.sign(c.v)*Math.min(1600,Math.abs(c.v)*per*.6);c.x=Math.max(0,Math.min(LAST,c.x));coastAnim.current=null;}
   else if(Math.abs(c.v)<3){coastAnim.current=null;c.x=Math.round(c.x);}else moving=true;
   setFrame(c.x,true);}
  const e=edge.current;
  if(Math.abs(e.x)>.3||Math.abs(e.v)>1){stepSpring(e,0,dt,EDGE_SPRING);if(atRest(e,0,.3,2)){e.x=0;e.v=0;}else moving=true;}
  drawAll();
  if(moving&&!document.hidden){loop.current=requestAnimationFrame(tick);}else if(moving)settleAll();
 },[drawAll,setFrame,settleAll]);
 const kick=useCallback(()=>{if(loop.current||document.hidden)return;loopT.current=performance.now();loop.current=requestAnimationFrame(tick);},[tick]);
 useEffect(()=>{const vis=()=>{if(document.hidden&&loop.current){cancelAnimationFrame(loop.current);loop.current=0;settleAll();}};
  document.addEventListener('visibilitychange',vis);
  return()=>{document.removeEventListener('visibilitychange',vis);cancelAnimationFrame(loop.current);loop.current=0;flip.current?.cancel();};},[settleAll]);

 const down=(e:ReactPointerEvent<HTMLDivElement>)=>{unlockMuseumAudio();const p=local(e);
  if(step==='lines'){const z=groundZAt(cam,p.w,p.h,p.x,p.y,zoom?ZOOM:1);if(z==null)return;
   // Grab whichever line is nearer (the one still moving counts where it is now): catching a gliding line stops it in your hand.
   const at=(w:'def'|'att')=>live.current?.who===w?live.current.z:lines[w];
   const who=Math.abs(z-at('def'))<=Math.abs(z-at('att'))?'def':'att';
   if(lineAnim.current){const l=lineAnim.current;lineAnim.current=null;if(l.who!==who){live.current=null;setLines(x=>({...x,[l.who]:l.to}));}}
   const z0=at(who);live.current={who,z:z0};
   drag.current={kind:'line',who,x0:p.x,f0:0,dz:z0-z,samples:[{t:e.timeStamp,x:z0}]};setTried(t=>t.lines?t:{...t,lines:true});requestDraw();}
  else if(scrubbable){setPlaying(false);coastAnim.current=null;
   drag.current={kind:'scrub',x0:e.clientX,f0:frame,per:Math.max(4,p.cssW/(LAST*1.2)),samples:[{t:e.timeStamp,x:frame}]};setTried(t=>t.scrub?t:{...t,scrub:true});}
  else return;
  e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d)return;const p=local(e);
  if(d.kind==='line'&&d.who){const g=groundZAt(cam,p.w,p.h,p.x,p.y,zoom?ZOOM:1);if(g==null)return;
   const raw=g+(d.dz??0);let z=rubberClamp(raw,Z_MIN,Z_MAX,1.2);
   const s=snapLine(d.who,z);if(s.target&&raw>=Z_MIN&&raw<=Z_MAX)z=s.target.z;// magnet: the line clicks onto a body part
   markSnap(d.who,raw>=Z_MIN&&raw<=Z_MAX?s.target:null);
   d.samples.push({t:e.timeStamp,x:z});if(d.samples.length>12)d.samples.shift();live.current={who:d.who,z};requestDraw();}
  else{const per=d.per??8,raw=d.f0+(e.clientX-d.x0)/per;d.raw=raw;d.samples.push({t:e.timeStamp,x:raw});if(d.samples.length>12)d.samples.shift();
   const over=raw<0?raw*per:raw>LAST?(raw-LAST)*per:0;edge.current={x:over?rubber(over,70):0,v:0};
   setFrame(raw,true);requestDraw();}};
 const up=(e:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;drag.current=null;if(!d)return;
  const v=velocity(d.samples),calm=reduced();
  if(d.kind==='line'&&d.who&&live.current){const z=live.current.z;
   // Release: keep the finger's speed. Project where the fling would stop, keep it on the pitch, and let it click onto a body part
   // if it lands near one. Then a spring carries it there, starting with the finger's velocity.
   const end=Math.max(Z_MIN,Math.min(Z_MAX,calm?z:project(z,v,.994))),s=snapLine(d.who,end);markSnap(d.who,s.target);
   if(calm){live.current=null;setLines(x=>({...x,[d.who!]:s.z}));requestDraw();return;}
   lineAnim.current={who:d.who,s:{x:z,v:Math.max(-40,Math.min(40,v))},to:s.z};kick();}
  else if(d.kind==='scrub'){
   if(calm){edge.current={x:0,v:0};requestDraw();return;}
   if(Math.abs(edge.current.x)>.3){kick();return;}// spring back from the over-scrub
   if(Math.abs(v)>6&&d.raw!=null){perPx.current=d.per??8;coastAnim.current={x:Math.max(0,Math.min(LAST,d.raw)),v:Math.max(-90,Math.min(90,v))};kick();}}
 };

 // ---- Step actions -------------------------------------------------------------------------------------------------------------
 const goStep=(s:Step)=>{setPlaying(false);setStep(s);
  if(s==='kick'){setCam('wide');setFrame(0);setKickMsg(null);}
  if(s==='lines'){setCam('offside');setFrame(KICK);setZoom((main.current?.getBoundingClientRect().width??999)<560);}
  if(s==='goal'){setCam('goal');setFrame(38);setGoalCall(null);setZoom(false);}
  if(s==='ref'){setCam('goal');setFrame(DEEP);setRefCall(null);setZoom(false);}
  if(s==='case'){setCam('wide');setFrame(DEEP);setCaseBeat(0);}};
 const nextCase=()=>{unlockMuseumAudio();setCaseBeat(b=>Math.min(REAL_CASE.story.length-1,b+1));museumSfx.flap();if(caseBeat===REAL_CASE.story.length-2){museumSfx.whistle();showStamp('PENALTY · after review','go');}};
 const onQuizDone=useCallback((score:number,of:number)=>{const t=`VAR CERTIFIED · ${score}/${of}`;setCertified(t);showStamp(t,'go');},[showStamp]);
 const markKick=()=>{
  if(frame===KICK){museumSfx.reveal();setKickMsg(null);goStep('lines');showStamp('KICK FRAME · F20','info');return;}
  museumSfx.card();
  setKickMsg(frame<KICK?(KICK-frame<=3?'Not yet: the foot hasn’t touched the ball. Step forward.':'Too early: #10 hasn’t passed yet. Scrub forward.')
   :(frame-KICK<=3?'Too late: the ball has already left the foot. Step back.':'Too late: the pass has gone. Scrub back to the kick.'));};
 const callGoal=(c:'goal'|'nogoal')=>{setGoalCall(c);setPlaying(false);if(c==='nogoal'){museumSfx.reveal();setFrame(DEEP);setCam('goal');showStamp(`NO GOAL · ${TRUTH.ballOnLineCm} cm on the line`,'stop');}else museumSfx.card();};
 const decide=(c:'goal'|'nogoal')=>{setRefCall(c);museumSfx.whistle();};
 const restart=()=>{setCertified(null);setLines(START_LINES);setSnap({def:null,att:null});setGoalCall(null);setRefCall(null);setKickMsg(null);goStep('kick');};
 const stepIndex=STEPS.findIndex(s=>s.id===step);
 const camInfo=camOf(cam);

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="var-title" data-museum-experience="var-2018" data-step={step} className={styles.root}>
  <header className={styles.top}>
   <div className={styles.titleBox}>
    <p className={styles.kicker}><span className={styles.rec} aria-hidden="true"/>VAR ROOM · {exhibit.year}</p>
    <p className={styles.stepBar}><span className={styles.segs} aria-hidden="true">{STEPS.map((s,i)=><i key={s.id} data-state={i<stepIndex?'done':i===stepIndex?'now':'todo'}/>)}</span>
     <span className={styles.stepName}>{stepIndex+1}/{STEPS.length} · {STEPS[stepIndex].label}</span></p>
    <h1 id="var-title" className={styles.title}>You are the VAR</h1>
   </div>
   <ol className={styles.steps} aria-label="Your checks">
    {STEPS.map((s,i)=><li key={s.id} data-state={i<stepIndex?'done':i===stepIndex?'now':'todo'} aria-current={i===stepIndex?'step':undefined}><span>{s.label}</span></li>)}
   </ol>
  </header>
  <ExperienceBack onClose={onClose}/>

  <div className={styles.stage}>
   <div className={styles.monitorCell}><div className={styles.rig}>
    <div ref={monitorEl} className={styles.monitor} data-mode={step==='lines'?'lines':scrubbable?'scrub':'still'} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
     role="img" aria-label={`${camInfo.label}, frame ${frame} of ${LAST}. ${PRACTICE_NOTE}`}>
     <canvas ref={main} className={styles.canvas}/>
     <span key={cuts} className={styles.cut} aria-hidden="true"/>
     <span ref={flashEl} className={styles.flash} aria-hidden="true"/>
     {stamp&&<div key={stamp.id} className={styles.stamp} data-tone={stamp.tone} role="status"><span>{stamp.text}</span></div>}
     {step!=='case'&&<span className={styles.camLabel}>{camInfo.label}{zoom?' · ZOOM':''}</span>}
     {step!=='case'&&<span className={styles.practice}>PRACTICE REPLAY</span>}
     {step!=='case'&&<span className={styles.tc}>{timecode(frame)} <b>F{String(frame).padStart(2,'0')}</b></span>}
     {frame===KICK&&step!=='booth'&&step!=='kick'&&step!=='lines'&&<span className={styles.badge}>KICK FRAME</span>}
     {step==='lines'&&!onside&&<span className={styles.hint} data-tried={tried.lines||undefined}><Hand/>Drag a line onto a foot</span>}
     {(step==='kick'||step==='goal')&&!tried.scrub&&<span className={styles.hint}><Hand/>Drag the picture to move time ⟷</span>}
     {step==='booth'&&<div className={styles.slate}><p className={styles.slateKicker}>Video operation room</p><p className={styles.slateBig}>Watch.<br/>Check.<br/>Advise.</p><p className={styles.slateSmall}>The referee decides.</p></div>}
     {step==='ref'&&refCall&&<div className={styles.decision} data-call={refCall}><p>Referee’s decision</p><strong>{refCall==='goal'?'GOAL':'NO GOAL'}</strong></div>}
     {step==='ref'&&!refCall&&<div className={styles.ofr}>ON-FIELD REVIEW</div>}
     {step==='case'&&<div className={styles.slate}><p className={styles.slateKicker}>Real history · {REAL_CASE.match}</p><p key={caseBeat} className={`${styles.slateBig} ${styles.slateBeat}`} data-beat={caseBeat}>{REAL_CASE.slates[caseBeat]}</p><p className={styles.slateSmall}>{certified??REAL_CASE.when}</p></div>}
    </div>

   <div className={styles.transport} data-off={!scrubbable||undefined}>
    <button type="button" className={styles.tbtn} onClick={togglePlay} disabled={!scrubbable} aria-label={playing?'Pause the replay':'Play the replay at half speed'} data-museum-own-cue>{playing?<PauseIcon/>:<PlayIcon/>}</button>
    <button type="button" className={styles.tbtn} onClick={()=>{setPlaying(false);setFrame(frame-1,true);}} disabled={!scrubbable||frame<=0} aria-label="Back one frame" data-museum-own-cue>‹</button>
    <div className={styles.scrub}>
     <input type="range" min={0} max={LAST} step={1} value={frame} disabled={!scrubbable} aria-label="Replay frame" aria-valuetext={`Frame ${frame} of ${LAST}`}
      onChange={e=>{setPlaying(false);setFrame(Number(e.target.value),true);}} className={styles.range} ref={rangeEl}/>
     {goalCall==='nogoal'&&<span className={styles.mark} style={{left:`${DEEP/LAST*100}%`}} aria-hidden="true" title="Deepest point"/>}
     {step!=='booth'&&step!=='kick'&&<span className={styles.mark} data-kick style={{left:`${KICK/LAST*100}%`}} aria-hidden="true"/>}
    </div>
    <button type="button" className={styles.tbtn} onClick={()=>{setPlaying(false);setFrame(frame+1,true);}} disabled={!scrubbable||frame>=LAST} aria-label="Forward one frame" data-museum-own-cue>›</button>
    <button type="button" className={styles.tbtn} onClick={()=>setZoom(z=>!z)} aria-pressed={zoom} aria-label={zoom?'Zoom out':'Zoom in'} disabled={step==='booth'||step==='case'}>{zoom?'1×':`${ZOOM}×`}</button>
   </div>
    <div className={styles.cams} role="group" aria-label="Camera angles">
    {CAMS.map((c,i)=><button key={c.id} type="button" className={styles.cam} aria-pressed={cam===c.id} aria-label={`Show ${c.label}`} onClick={e=>switchCam(c.id,e.currentTarget)} disabled={step==='booth'}>
     <canvas ref={el=>{thumbs.current[i]=el;}} className={styles.thumb} aria-hidden="true"/>
     <span>{i+1} · {c.short}</span>
    </button>)}
   </div>

   </div></div>

   <div className={styles.side}>
    <div ref={panel} className={styles.panel} aria-live="polite"><div key={step} className={styles.stepIn}>
     {step==='booth'&&<>
      <p className={styles.eyebrow}>Russia 2018</p>
      <p className={styles.lead}>{CASE_FACTS.first}</p>
      <p>Today you sit in the VAR room. But first: what is VAR allowed to check? Tap each one.</p>
      <ul className={styles.chips}>
       {CHECKS.map((c,i)=>{const on=checked.includes(i);return <li key={c.label}><button type="button" className={styles.chip} data-on={on} data-yes={c.yes} aria-pressed={on} data-museum-own-cue
        onClick={()=>{unlockMuseumAudio();if(!on){setChecked(x=>[...x,i]);c.yes?museumSfx.reveal():museumSfx.card();}}}>
        <span>{c.label}</span>{on&&<em>{c.yes?'✓ VAR can check':'✗ Not VAR'}</em>}</button></li>;})}
      </ul>
      {checked.length>=3&&<p className={styles.note}>{CASE_FACTS.checks}</p>}
      <button type="button" className={styles.primary} onClick={()=>goStep('kick')}>Start the check</button>
      <p className={styles.small}>{PRACTICE_NOTE}</p>
     </>}

     {step==='kick'&&<>
      <p className={styles.eyebrow}>Check 1 · Offside?</p>
      <p className={styles.lead}>The referee gave a goal. VAR checks every goal.</p>
      <p>Offside is judged at the moment a teammate plays the ball. Find the exact frame where #10’s foot touches the ball for the pass.</p>
      <button type="button" className={styles.primary} onClick={markKick} data-museum-own-cue>Freeze: this is the kick (F{String(frame).padStart(2,'0')})</button>
      {kickMsg&&<p className={styles.warn} role="status" data-feedback>{kickMsg}</p>}
      <p className={styles.small}>Drag the screen, use the slider, or the ‹ › buttons (← → keys) to move one frame at a time.</p>
     </>}

     {step==='lines'&&<>
      <p className={styles.eyebrow}>Check 1 · Offside lines</p>
      <p>Frozen on the kick. Drag the <b className={styles.blue}>blue line</b> to the part of defender #4 nearest his goal. Drag the <b className={styles.red}>red line</b> to the part of attacker #9 nearest the goal.</p>
      <label className={styles.slider}><span className={styles.blue}>Blue · defender #4</span>
       <input type="range" min={8} max={26} step={.02} value={lines.def} onChange={e=>moveLine('def',Number(e.target.value))} aria-valuetext={snap.def?snap.def.label:`${lines.def.toFixed(1)} m from the goal line`}/></label>
      <label className={styles.slider}><span className={styles.red}>Red · attacker #9</span>
       <input type="range" min={8} max={26} step={.02} value={lines.att} onChange={e=>moveLine('att',Number(e.target.value))} aria-valuetext={snap.att?snap.att.label:`${lines.att.toFixed(1)} m from the goal line`}/></label>
      {armTagged&&<p className={styles.warn} role="status" data-feedback>That’s his arm! Hands and arms don’t count for offside, because you can’t score with them. Find the part he could score with.</p>}
      {onside&&<div data-feedback className={styles.verdict} data-tone="go">
       <strong>ONSIDE · by {TRUTH.onsideCm} cm</strong>
       <p>His foot is behind the defender’s foot. His arm was {TRUTH.armAheadCm} cm ahead, but arms don’t count.</p>
       <p className={styles.small}>{OFFSIDE_LAW}</p>
       <button type="button" className={styles.primary} onClick={()=>goStep('goal')}>Check 2: the goal line</button>
      </div>}
     </>}

     {step==='goal'&&<>
      <p className={styles.eyebrow}>Check 2 · Goal or no goal?</p>
      <p className={styles.lead}>{CASE_FACTS.rule}</p>
      <p>#9 shoots and the keeper claws it back. Scrub to the frame where the ball is deepest, then make your call. Compare the cameras: which one shows it clearly?</p>
      <div className={styles.calls}>
       <button type="button" className={styles.call} onClick={()=>callGoal('goal')} data-museum-own-cue aria-pressed={goalCall==='goal'}>Goal</button>
       <button type="button" className={styles.call} onClick={()=>callGoal('nogoal')} data-museum-own-cue aria-pressed={goalCall==='nogoal'}>No goal</button>
      </div>
      {goalCall==='goal'&&<p className={styles.warn} role="status" data-feedback>Look again on CAM 3 at frame {DEEP}, where the ball is deepest. Is ALL of the ball past ALL of the line? Some angles can fool you: only a camera looking straight along the line shows it clearly.</p>}
      {goalCall==='nogoal'&&<div data-feedback className={styles.verdict} data-tone="stop">
       <strong>NO GOAL · {TRUTH.ballOnLineCm} cm still on the line</strong>
       <p>At its deepest, a slice of the ball (yellow) is still over the line. Not the whole ball, so it’s not a goal. The goal-line camera looks straight along the line, so it doesn’t fool you.</p>
       <p>The referee gave a goal, so this looks like a clear mistake. But VAR can’t change it. It can only tell the referee.</p>
       <button type="button" className={styles.primary} onClick={()=>goStep('ref')}>Call the referee to the screen</button>
      </div>}
     </>}

     {step==='ref'&&<>
      <p className={styles.eyebrow}>Swap chairs · You are the referee</p>
      <p className={styles.lead}>VAR says: “Possible no goal. Please look at the screen.”</p>
      <p>You run to the screen by the pitch and watch the replay. VAR only advises. Now you decide.</p>
      <div className={styles.calls}>
       <button type="button" className={styles.call} onClick={()=>decide('goal')} data-museum-own-cue aria-pressed={refCall==='goal'}>Goal stands</button>
       <button type="button" className={styles.call} onClick={()=>decide('nogoal')} data-museum-own-cue aria-pressed={refCall==='nogoal'}>No goal</button>
      </div>
      {refCall&&<div data-feedback className={styles.verdict} data-tone={refCall==='nogoal'?'stop':'warn'}>
       <strong>{CASE_FACTS.decides}</strong>
       {refCall==='nogoal'?<p>You saw it yourself and changed your mind. That is exactly how VAR is meant to work.</p>
        :<p>It’s your call, and it stands: VAR can’t overrule you. But the Law says the whole ball must cross the whole line, and the replay showed it hadn’t. That’s why referees look before they decide.</p>}
       <blockquote className={styles.quote}>“{IFAB_QUOTE}”<cite>IFAB, VAR protocol</cite></blockquote>
       <button type="button" className={styles.primary} onClick={()=>goStep('case')}>The real story: 2018</button>
      </div>}
     </>}

     {step==='case'&&<>
      <ol className={styles.done} aria-label="Your checks, all done">
       {[['Kick frame','F20'],['Offside',`Onside · ${TRUTH.onsideCm} cm`],['Goal line',`No goal · ${TRUTH.ballOnLineCm} cm`],['Decision','The referee']].map(([k,v],i)=>
        <li key={k} style={{['--i' as string]:i}}><span aria-hidden="true">✓</span><b>{k}</b><em>{v}</em></li>)}
      </ol>
      <p className={styles.eyebrow}>Real history · {REAL_CASE.when}</p>
      <p className={styles.lead}>{REAL_CASE.match}: the first VAR penalty</p>
      <ol className={styles.unfold} aria-label="What happened">
       {REAL_CASE.story.slice(0,caseBeat+1).map((s,i)=><li key={s} data-feedback={i===caseBeat||undefined} className={styles.unfoldLine}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><p>{s}</p></li>)}
      </ol>
      {caseBeat<REAL_CASE.story.length-1?<button type="button" className={styles.primary} onClick={nextCase} data-museum-own-cue>What happened next?</button>:<>
       <p className={`${styles.bigLine} ${styles.unfoldLine}`}>{REAL_CASE.lesson}</p>
       <p>{TOURNAMENT_NUMBERS} VAR’s motto: “{IFAB_MOTTO}”</p>
       <Quiz onDone={onQuizDone}/>
       <div className={styles.verdict} data-tone="go"><strong>Take it to your game</strong><p>{FOR_YOUR_GAME}</p></div>
      </>}
      <details className={styles.sources}><summary>Sources</summary><ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
       <p className={styles.small}>The replay in this room is a made-up practice moment drawn for the museum. The 2018 story is real.</p></details>
      <button type="button" className={styles.secondary} onClick={restart}>Run the check again</button>
     </>}
    </div></div>
   </div>
  </div>
 </section>;
}
/** The "try it" hand: a pointing finger that slides left and right a few times (finite CSS), then rests. */
const Hand=()=><svg className={styles.hand} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a5 5 0 0 1-3.9-1.9L4.2 15.6a1.5 1.5 0 0 1 2.3-1.9L9 16" fill="#fff" stroke="#0b1d33" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
const PlayIcon=()=><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>;
const PauseIcon=()=><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>;
