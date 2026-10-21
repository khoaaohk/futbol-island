'use client';
import StepIcon from '../StepIcon';
import {useEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import * as k from '../anatomy/iso-kit';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import {Corners,Items,PaperDefs,Parts,Room,Shadow,Sheet,useBox,useFrames} from '../anatomy/PaperStage';
import s from '../anatomy/PaperStage.module.css';
import {STATION,CASE_FACTS,CHECKS,FOR_YOUR_GAME,IFAB_MOTTO,IFAB_QUOTE,PRACTICE_NOTE,QUIZ,REAL_CASE,SOURCES,TOURNAMENT_NUMBERS} from './content';
import {LAST,clipTruth,timecode,type Clip} from './goalline';
import {REPLAY_FPS,clipPoints,maxShift,shiftVerdict} from './scoring';
import {SHIFT_N,ZOOMS,ballItems,benchParts,cameraFor,hitFrame,makeShift,monitorOf,rng,signalPath,type Cam,type VarView} from './model';
import {MonitorPicture} from './Monitor';
import {FigureStage,type FigureHandle} from '../anatomy/FigureStage';
import {STEPS,makeStation} from './station';
import v from './var.module.css';

/**
 * var-2018 · "The goal-line desk" (Oct 12 2026 rebuild; user: "rebuild the video assistant referee. the characters don't look
 * good moving. don't use the characters."). No people anywhere: the ball is the star. One big card: a goal-mouth model on a
 * bench (model.ts) with the VAR's instruments on it (a LINE CAM on a mast at the end of the goal line, a TOP CAM on a boom over
 * the mouth, a cable to the pitchside review screen), and beside it the VAR's MONITOR (Monitor.tsx), a frame within the frame,
 * showing the chosen camera at true scale in cm.
 *  1. Story sheet: Russia 2018, what VAR may check, France 2–1 Australia (Kazan, 16 June 2018): VAR spotted it, the referee
 *     decided it. How to play, in four steps.
 *  2. Your shift: five practice replays. A shot hits the underside of the bar, drops and spins back out. The replay rolls at
 *     half speed: FREEZE it when the ball is deepest (points for being close). Scrub the frame strip (or ◀ ▶) to the deepest
 *     frame (each frame nudged costs a little), switch cameras (LINE / TOP, or tap a camera on the model) and zoom the magnifier
 *     (×1 ×2 ×4), then call GOAL or NO GOAL. The review screen lights and the TV signal is drawn: VAR advises, the referee
 *     decides. Then the truth, measured on the monitor in cm.
 *  The review chain (Oct 21 2026, figure kit v2): from the story sheet, a table-top model of how one review travels (cameras →
 *     fibre → video room → replay operator → VAR → radio → review monitor). Turn it all the way round, see through the room's
 *     walls, read the labels; "Run a review" lights the chain step by step: camera angle → replay → check → decision.
 *  3. End of shift sheet: total, best, what VAR may check, a quick check, then the ending → onComplete (once, only then).
 * Heat: one frame loop (anatomy/paper-loop.ts useFrames) runs only while the replay rolls or the review signal is drawn, pauses
 * off-screen, is cancelled on unmount. Reduced motion: no roll; the replay starts frozen on frame 0 and you step it (turn-based).
 */
const BEST_KEY='futbol.museum.var-2018.shiftBest';
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const writeBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};
const BEATS=[
 {when:'Russia · 2018',head:'A new helper',text:`${CASE_FACTS.first} ${CASE_FACTS.checks}`},
 {when:REAL_CASE.when,head:REAL_CASE.match,text:`${REAL_CASE.story[0]} ${REAL_CASE.story[1]}`},
 {when:'The first VAR penalty',head:REAL_CASE.lesson,text:`${REAL_CASE.story[2]} ${CASE_FACTS.decides}`},
];
const HOW=[['Freeze','Stop the replay when the ball is deepest.'],['Find it','Scrub frame by frame to the deepest moment.'],['Look','Switch cameras and zoom the magnifier.'],['Call it','Goal or no goal? The referee decides.']] as const;
type Phase='intro'|'roll'|'frozen'|'review'|'verdict'|'score'|'station';
type Res={pts:number;right:boolean;off:number|null;nudges:number;call:'goal'|'nogoal'};
const CAMS:{cam:Cam;label:string;key:string}[]=[{cam:'line',label:'Line cam',key:'l'},{cam:'top',label:'Top cam',key:'t'}];

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [clips,setClips]=useState<Clip[]>(()=>makeShift(rng(2018))),[ci,setCi]=useState(0),[phase,setPhase]=useState<Phase>('intro');
 const [res,setRes]=useState<Res[]>([]),[best,setBest]=useState(0),[games,setGames]=useState(0),[frame,setFrameS]=useState(0),[checked,setChecked]=useState(false);
 const [cam,setCamS]=useState<Cam>('line'),[zoom,setZoomS]=useState(1);
 const clip=clips[Math.min(ci,clips.length-1)];
 const view=useRef<VarView>({clip,frame:0,cam:'line',zoom:1,review:0,call:null}),[,setTick]=useState(0);
 const rollT=useRef(0),off=useRef<number|null>(null),nudges=useRef(0),phaseRef=useRef(phase);phaseRef.current=phase;
 const done=useRef(false),cb=useRef(onComplete);cb.current=onComplete;
 const readout=useRef<HTMLSpanElement>(null),say=(t:string)=>{if(readout.current)readout.current.textContent=t;};
 useEffect(()=>{setBest(readBest());},[]);
 // The review chain (figure kit v2): made once; a review lights one link set per step (timers, no frame loop of its own).
 const station=useMemo(()=>makeStation(),[]),fig=useRef<FigureHandle|null>(null),stTimers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const [stStep,setStStep]=useState(-1),[stLit,setStLit]=useState<string[]>([]);
 useEffect(()=>()=>stTimers.current.forEach(clearTimeout),[]);
 const runReview=()=>{stTimers.current.forEach(clearTimeout);stTimers.current=[];fig.current?.setSeeThrough(true);fig.current?.setLabels(true);
  STEPS.forEach((st,i)=>stTimers.current.push(setTimeout(()=>{setStStep(i);setStLit([...st.lit]);i===STEPS.length-1?museumSfx.reveal():museumSfx.tick();},i*1900)));
  stTimers.current.push(setTimeout(()=>setStLit([]),STEPS.length*1900+1400));};
 const touchLink=(id:string)=>{setStLit([id]);museumSfx.tick();};
 const openStation=()=>{setStStep(-1);setStLit([]);setPhase('station');museumSfx.look();};
 const closeStation=()=>{stTimers.current.forEach(clearTimeout);stTimers.current=[];setStLit([]);setPhase('intro');};
 const [boxRef,box]=useBox<HTMLDivElement>(),[scrRef,scr]=useBox<HTMLDivElement>();
 const draw=()=>setTick(t=>t+1);
 const setFrame=(f:number)=>{const n=Math.max(0,Math.min(LAST,Math.round(f)));view.current.frame=n;setFrameS(n);say(timecode(n));};
 const setCam=(c:Cam)=>{view.current.cam=c;setCamS(c);};
 const setZoom=(z:number)=>{view.current.zoom=z;setZoomS(z);};

 const loop=useFrames(dt=>{const vv=view.current;
  if(phaseRef.current==='roll'){rollT.current+=dt;const f=Math.min(LAST,Math.floor(rollT.current*REPLAY_FPS));
   if(f!==vv.frame){if(vv.frame<hitFrame(vv.clip)&&f>=hitFrame(vv.clip))museumSfx.stamp();setFrame(f);}
   if(f>=LAST){off.current=LAST-vv.clip.deep;setPhase('frozen');phaseRef.current='frozen';say('END · FROZEN');return false;}return true;}
  if(phaseRef.current==='review'){vv.review=Math.min(1,vv.review+dt/1.6);draw();
   if(vv.review>=1){toVerdict();return false;}return true;}
  return false;},boxRef);
 const ciRef=useRef(ci);ciRef.current=ci;
 const toVerdict=()=>{const vv=view.current;setRes(r=>{const x=r[ciRef.current];x?.right?museumSfx.reveal():museumSfx.look();say(x?`+${x.pts}`:'');return r;});
  setFrame(vv.clip.deep);setPhase('verdict');phaseRef.current='verdict';};

 const startClip=(n:number,list=clips)=>{const cl=list[n];view.current={clip:cl,frame:0,cam:view.current.cam,zoom:1,review:0,call:null};
  off.current=null;nudges.current=0;rollT.current=0;setCi(n);setFrame(0);setZoomS(1);
  if(reduced){setPhase('frozen');phaseRef.current='frozen';draw();return;}setPhase('roll');phaseRef.current='roll';museumSfx.kick();loop.wake();};
 const freeze=()=>{if(phase!=='roll')return;loop.stop();off.current=view.current.frame-clip.deep;museumSfx.tick();setPhase('frozen');phaseRef.current='frozen';say(`FREEZE ${timecode(view.current.frame)}`);};
 const step=(d:number)=>{if(phase==='roll'){freeze();return;}if(phase!=='frozen')return;const f=view.current.frame+d;if(f<0||f>LAST)return;if(!reduced)nudges.current++;setFrame(f);museumSfx.tick();};
 const pickCam=(c:Cam)=>{if(phase!=='frozen'&&phase!=='verdict')return;if(c!==cam)museumSfx.flap();setCam(c);};
 const zoomBy=(d:number)=>{if(phase!=='frozen'&&phase!=='verdict')return;const i=ZOOMS.indexOf(zoom as typeof ZOOMS[number]),n=ZOOMS[Math.max(0,Math.min(ZOOMS.length-1,i+d))];if(n!==zoom){museumSfx.tick();setZoom(n);}};
 const call=(g:'goal'|'nogoal')=>{if(phase!=='frozen')return;const t=clipTruth(clip),right=(g==='goal')===t.goal;
  if(off.current==null)off.current=view.current.frame-clip.deep;// reduced motion: the frame you call on is your freeze
  const pts=clipPoints(off.current,right,reduced?0:nudges.current);view.current.call=g;museumSfx.whistle();
  setRes(r=>{const n=[...r];n[ci]={pts,right,off:off.current,nudges:nudges.current,call:g};return n;});
  if(reduced){view.current.review=1;right?museumSfx.reveal():museumSfx.look();setFrame(clip.deep);setPhase('verdict');phaseRef.current='verdict';draw();return;}
  setPhase('review');phaseRef.current='review';view.current.review=0;loop.wake();};
 const scored=useRef(false);
 const next=()=>{if(phase!=='verdict')return;if(ci+1<clips.length){startClip(ci+1);return;}
  if(!scored.current){scored.current=true;const total=res.reduce((a,r)=>a+(r?.pts??0),0);if(total>best){setBest(total);writeBest(total);}museumSfx.crowd();}setPhase('score');};
 const again=()=>{const l=makeShift(rng(Date.now()));scored.current=false;setClips(l);setRes([]);setChecked(false);setGames(g=>g+1);startClip(0,l);};
 const finish=()=>{if(!done.current){done.current=true;cb.current?.();}};

 // ── drawing: the bench fits beside (desktop) or under (phone) the monitor ──
 const side=box.w>=box.h*1.05,monW=side?Math.min(box.w*.4,520)+24:0,monH=side?0:Math.round(box.h*.42)+40;
 const P=useMemo(()=>{const p=cameraFor(Math.max(1,box.w-monW),Math.max(1,box.h-monH),!side);return {...p,origin:[p.origin[0],p.origin[1]+monH] as k.Flat};},[box.w,box.h,monW,monH,side]);
 const vv=view.current,live=phase==='frozen'||phase==='verdict';
 const bench=useMemo(()=>box.w?benchParts(P,{...vv,cam},live):[],[P,box.w,cam,live,vv.review>0]);// eslint-disable-line react-hooks/exhaustive-deps
 const act=box.w?ballItems(P,{...vv,cam}):null;
 // Tap the model: while it rolls, freeze; when frozen, tap a camera on the model to switch to it.
 const onPitch=(e:RPointerEvent<SVGSVGElement>)=>{if(e.button>0)return;if(phase==='roll'){e.preventDefault();freeze();return;}
  if(!live||!act)return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  const near=(c:Cam)=>{const p=ballItems(P,{...vv,cam:c}).camAt;return Math.hypot(p[0]-x,p[1]-y);};
  const l=near('line'),t=near('top');if(Math.min(l,t)<44)pickCam(l<t?'line':'top');};
 // The strip: drag along it to scrub (one frame per tick); grabbing it while the replay rolls freezes it.
 const stripRef=useRef<HTMLDivElement>(null),scrub=useRef(false);
 const scrubTo=(e:RPointerEvent<HTMLDivElement>)=>{const r=stripRef.current!.getBoundingClientRect(),u=(e.clientX-r.left-14)/Math.max(1,r.width-28),f=Math.round(Math.max(0,Math.min(1,u))*LAST);
  if(f!==vv.frame){if(!reduced)nudges.current+=Math.abs(f-vv.frame);setFrame(f);museumSfx.tick();}};

 const onKey=(e:KeyboardEvent)=>{const key=e.key,btn=e.target instanceof HTMLButtonElement,low=key.toLowerCase();
  if(key==='ArrowLeft'||key==='ArrowRight'){e.preventDefault();step(key==='ArrowLeft'?-1:1);return;}
  const c=CAMS.find(x=>x.key===low);if(c){e.preventDefault();pickCam(c.cam);return;}
  if(key==='+'||key==='='){e.preventDefault();zoomBy(1);return;}if(key==='-'||key==='_'){e.preventDefault();zoomBy(-1);return;}
  if(phase==='frozen'&&low==='g'){e.preventDefault();call('goal');return;}
  if(phase==='frozen'&&low==='n'){e.preventDefault();call('nogoal');return;}
  if((key===' '||key==='Enter')&&!btn){e.preventDefault();if(phase==='roll')freeze();else if(phase==='verdict')next();}};

 const total=res.reduce((a,r)=>a+(r?.pts??0),0),right=res.filter(r=>r?.right).length;
 const offs=res.filter(r=>r&&r.off!=null).map(r=>Math.abs(r.off!)),avgOff=offs.length?offs.reduce((a,b)=>a+b,0)/offs.length:null;
 const last=phase==='verdict'?res[ci]:null,truth=clipTruth(clip),mon=monitorOf(vv);
 const banner=last?{kind:last.right?'good':'bad',big:truth.goal?'Goal':'No goal',line:truth.goal?`The whole ball was over the whole line, by ${truth.cm} cm.`:`${truth.cm} cm of the ball was still on the line.`}
  :phase==='review'?{kind:'info',big:'Referee review',line:'The screen lights up. VAR advises, the referee decides.'}:null;
 const sayLine=phase==='roll'?<><b>Replay rolling.</b> Off the bar… Freeze it when the ball is deepest in the goal.</>
  :phase==='frozen'?<><span className={s.tag}>{timecode(frame)}</span>Find the deepest frame, switch cameras, zoom in. Is ALL of the ball past ALL of the line?</>
  :phase==='verdict'&&last?<><b>{last.right?'Right call.':'Not this time.'}</b> Deepest on frame {clip.deep}{last.off===0?', you froze it spot on':last.off!=null?`, you froze ${Math.abs(last.off)} frame${Math.abs(last.off)===1?'':'s'} ${last.off<0?'early':'late'}`:''}. {CASE_FACTS.rule}</>
  :phase==='review'?<>{IFAB_QUOTE}</>:phase==='intro'?<>Five replays. Freeze, look closely, make the call.</>:null;
 const camLabel=cam==='line'?'Line cam · along the line':'Top cam · from above';
 const status=phase==='verdict'?`${truth.cm} cm ${truth.goal?'over':'on the line'}`:phase==='roll'?'rolling':`×${zoom} · ${mon.over?'past the line?':'on the line?'}`;

 const monitor=<div className={v.monitor} data-pos={side?'side':'top'} data-var-monitor data-cam={cam}>
  <div className={v.monTop}>
   <div className={v.tabs} role="group" aria-label="Camera">{CAMS.map(c=><button key={c.cam} type="button" className={v.tab} aria-pressed={cam===c.cam} data-var-cam={c.cam}
    disabled={!live} onClick={()=>pickCam(c.cam)}>{c.label}</button>)}</div>
   <span className={v.tc}>{timecode(frame)}</span></div>
  <div className={v.screen} ref={scrRef}>
   {scr.w>0&&<MonitorPicture clip={clip} frame={frame} cam={cam} zoom={zoom} aspect={scr.w/Math.max(1,scr.h)} measure={phase==='verdict'} idle={phase==='intro'}/>}
   {phase==='roll'&&<div className={v.aim} data-var-aim><span>Rolling · freeze to look closely</span></div>}
   {zoom>1&&<span className={v.zoomChip} aria-hidden="true">×{zoom}</span>}
  </div>
  <div className={v.monBottom}>
   <div className={v.zoom} role="group" aria-label="Magnifier">
    <button type="button" className={v.zbtn} aria-label="Zoom out" data-var-zoom="-1" disabled={!live||zoom<=1} onClick={()=>zoomBy(-1)}>−</button>
    <span aria-live="polite">{live?`Zoom ×${zoom}`:camLabel}</span>
    <button type="button" className={v.zbtn} aria-label="Zoom in" data-var-zoom="1" disabled={!live||zoom>=4} onClick={()=>zoomBy(1)}>+</button></div>
   <span className={v.status}>{status}</span></div>
 </div>;

 const stage=<div className={v.stage} ref={boxRef}>
  {box.w>0&&<svg className={`iso-svg ${s.svg}`} viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h} tabIndex={0} role="img" data-var-pitch
   aria-label={`A goal-mouth model on a bench, practice replay frame ${frame} of ${LAST}: the ball hits the bar and drops near the goal line. The ${cam==='line'?'line camera, at the end of the goal line,':'top camera, over the goal mouth,'} feeds the monitor.`}
   onPointerDown={onPitch}>
   <PaperDefs id="var"/>
   <Parts parts={bench} id="var"/>
   {act&&<>
    <Shadow id="var" {...act.shadow}/>
    {act.bounce&&<path className="iso-line" data-tone="mid" d={k.ring(act.bounce.x,act.bounce.y,16,.4,P,28)}/>}
    <Items items={act.items}/>
    {act.hit&&<g data-var-hit>{[0,1,2,3,4].map(i=>{const a=Math.PI*(.15+i*.175);return <path key={i} d={`M${act.hit![0]+Math.cos(a)*7} ${act.hit![1]+Math.sin(a)*7}l${Math.cos(a)*9} ${Math.sin(a)*9}`} stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round"/>;})}</g>}
    {live&&<circle cx={act.ball[0]} cy={act.ball[1]} r={act.ballR+7} fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="2 3" data-var-ring/>}
    {live&&<path className="iso-line" data-dotted d={k.pathOf([act.camAt,act.ball])} style={{stroke:'var(--accent)'}} data-var-sight/>}
    {phase==='review'||phase==='verdict'?<path d={signalPath(P,vv.review)} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" data-var-signal/>:null}
   </>}
  </svg>}
  {monitor}
  {phase==='station'&&<FigureStage spec={station.spec} active={stLit} reduced={reduced} onLabel={touchLink} handle={fig} top={24} label="A table-top model of a VAR review: camera masts, the video room, the review monitor on its stand and the radio link"/>}
  {banner&&<div className={v.banner} data-kind={banner.kind} role="status"><b>{banner.big}</b><span>{banner.line}</span></div>}
  <Corners fig={`Fig. ${exhibit.year}`} title={side?'The goal-line desk':''} hint={live?'Tap a camera · ± zoom':'Freeze · look · call'} readoutRef={readout} readout="00:00:00:00"/>
  {phase==='intro'&&<Sheet label="The story" wide>
   <p className={s.kicker}>Russia · 2018</p>
   <h2 className={s.big}>You are the <em>VAR</em>.</h2>
   <p className={s.lead}>{CASE_FACTS.rule} {PRACTICE_NOTE}</p>
   <ol className={v.how}>{HOW.map(([h,t],i)=><li key={h}><i>{i+1}</i><b>{h}</b><span>{t}</span></li>)}</ol>
   <div className={s.buttons} style={{justifyContent:'flex-start'}}><button type="button" className={s.btn} data-accent data-start onClick={()=>startClip(0)}>Start the shift ▸</button>
    <button type="button" className={s.ghost} data-station onClick={openStation}>See the review chain</button></div>
   <p className={s.kicker}>The real story</p>
   <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><p style={{margin:0}}><b>{b.head.replace(/\.$/,'')}.</b> {b.text}</p></li>)}</ol>
  </Sheet>}
  {phase==='score'&&<Sheet label="End of shift" wide>
   <p className={s.kicker}>End of shift · {clips.length} replays</p>
   <div className={s.score}><b>{total}</b><span>of {maxShift(clips.length)} points</span></div>
   <p className={s.note}><b>{right} of {clips.length} right.</b> {shiftVerdict(right,clips.length,avgOff)}{best?` Best: ${best}.`:''}</p>
   <p className={s.note}><b>What can VAR check?</b> {CHECKS.filter(x=>x.yes).map(x=>x.label).join(', ')}. Not: {CHECKS.filter(x=>!x.yes).map(x=>x.label.toLowerCase()).join(', ')}.</p>
   <p className={s.note}><b>{IFAB_MOTTO}</b> {TOURNAMENT_NUMBERS}</p>
   {!checked?<StepCheck key={games} items={[{q:QUIZ[games%QUIZ.length].q,options:QUIZ[games%QUIZ.length].options,right:QUIZ[games%QUIZ.length].answer,why:QUIZ[games%QUIZ.length].why}]} kicker={()=>'Quick check'}
     onPick={ok=>ok?museumSfx.reveal():museumSfx.look()} doneLabel="Finish" onDone={()=>setChecked(true)}/>
    :<Ending reached onComplete={finish} art={<svg className={v.endArt} viewBox="0 0 120 90" aria-hidden="true"><g stroke="#3a3a37" strokeWidth=".8">
      <path d="M14 70 60 48 106 70 60 92Z" fill="#00000010" style={{filter:'blur(3px)'}}/>
      <path d="M20 22 92 10 92 60 20 72Z" fill="#f7f7f3"/><path d="M30 28 82 19 82 54 30 63Z" fill="#e9e9e4"/>
      <path d="M52 24 58 23 58 58 52 59Z" fill="#fbfbf8"/><circle cx="64" cy="41" r="7" fill="#f7f7f3"/><circle cx="64" cy="41" r="2" fill="#2a5bd7" stroke="none"/></g></svg>}
     seen={<>You’ve worked a shift at the goal-line desk: freeze, look closely, then let the referee decide.</>} take={FOR_YOUR_GAME}/>}
   <div className={s.buttons} style={{justifyContent:'flex-start'}}>
    <button type="button" className={s.btn} data-museum-own-cue data-again onClick={again}>Another shift</button>
    <button type="button" className={s.ghost} onClick={()=>setPhase('verdict')}>Look at the replay</button></div>
  </Sheet>}
 </div>;

 const dock=<>
  {(phase==='roll'||phase==='frozen')?<>
   <p className={`${s.say} ${v.sayWide}`} aria-live="polite">{sayLine}</p>
   <div ref={stripRef} className={v.strip} role="slider" tabIndex={0} aria-label="Replay frame" aria-valuemin={0} aria-valuemax={LAST} aria-valuenow={frame} aria-valuetext={timecode(frame)} data-var-strip
    onPointerDown={e=>{if(phase==='roll')freeze();scrub.current=true;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}if(phase==='frozen')scrubTo(e);}}
    onPointerMove={e=>{if(scrub.current&&phaseRef.current==='frozen')scrubTo(e);}} onPointerUp={()=>{scrub.current=false;}} onPointerCancel={()=>{scrub.current=false;}}>
    <div className={v.ticks} aria-hidden="true">{Array.from({length:LAST+1},(_,i)=><i key={i}/>)}</div>
    <div className={v.head} style={{left:`calc(14px + (100% - 28px) * ${frame/LAST})`}} aria-hidden="true"/>
   </div>
   <div className={v.calls}>
    <button type="button" className={`${s.ghost} ${v.step}`} aria-label="Back one frame" data-step="-1" onClick={()=>step(-1)}><StepIcon kind="prev"/></button>
    <button type="button" className={`${s.ghost} ${v.step}`} aria-label="Forward one frame" data-step="1" onClick={()=>step(1)}><StepIcon kind="next"/></button>
    {phase==='roll'?<button type="button" className={s.btn} data-accent data-freeze onClick={freeze}>Freeze</button>
     :<><button type="button" className={s.btn} data-call="goal" onClick={()=>call('goal')}>Goal</button>
      <button type="button" className={s.ghost} data-call="nogoal" onClick={()=>call('nogoal')}>No goal</button></>}
   </div></>
  :phase==='station'?<><p className={s.say} style={{flexBasis:"100%"}} aria-live="polite" data-station-say>{stStep<0?STATION.intro:STATION.steps[STEPS[stStep].id]} {stStep===STEPS.length-1?STATION.room:''}</p>
   <div className={s.buttons}><button type="button" className={s.btn} data-accent data-run-review onClick={runReview}>Run a review</button>
    <button type="button" className={s.ghost} data-station-back onClick={closeStation}>Back to the story</button></div></>
  :<><p className={s.say} aria-live="polite">{sayLine}</p>
   <div className={s.buttons}>{phase==='verdict'&&<button type="button" className={s.btn} data-next onClick={next}>{ci+1<clips.length?'Next replay ▸':'End shift ▸'}</button>}</div></>}
 </>;

 return <Room id="var-2018" label={`${exhibit.year} · ${exhibit.title}: the goal-line desk`} onClose={onClose} onKeyDown={onKey} accent="#2a5bd7"
  data={{'data-phase':phase,'data-clip':clip.id,'data-frame':frame,'data-cam':cam,'data-zoom':zoom,'data-result':last?(last.right?'right':'wrong'):undefined,'data-points':total,'data-reduced':reduced||undefined}}
  head={<><WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Russia · Law 10</>}/>
   <div className={s.headStats} aria-label="Score"><span><b>{total}</b><i>Points</i></span><span><b>{right}/{res.filter(Boolean).length}</b><i>Right</i></span><span><b>{best}</b><i>Best</i></span></div></>}
  stage={stage} dock={dock}>
  <p className={s.kicker}>{exhibit.year} · Russia</p>
  <h2 className={s.h2}>VAR spotted it. The referee decided it.</h2>
  <ol className={s.facts}>{[CASE_FACTS.first,CASE_FACTS.checks,CASE_FACTS.decides,CASE_FACTS.rule].map((f,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p style={{margin:0}}>{f}</p></li>)}</ol>
  <ul className={v.list}>{CHECKS.map(x=><li key={x.label}><b>{x.yes?'Yes':'No'}</b> · {x.label}: {x.why}</li>)}<li>{TOURNAMENT_NUMBERS}</li><li>{STATION.room}</li><li>“{IFAB_QUOTE}”</li></ul>
  <p className={s.small}>Take it to your game: {FOR_YOUR_GAME} {PRACTICE_NOTE} (the {SHIFT_N} practice replays are made-up, played on a goal-mouth model).</p>
  <Sources list={[...SOURCES,...exhibit.sources]}/>
 </Room>;
}

function Sources({list}:{list:readonly {title:string;url:string}[]}){const seen=new Set<string>();const l=list.filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));
 return <details className={s.sources}><summary>Sources</summary><ul>{l.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul></details>;}
