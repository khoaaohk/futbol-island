'use client';
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
import {CASE_FACTS,CHECKS,FOR_YOUR_GAME,IFAB_MOTTO,IFAB_QUOTE,PRACTICE_NOTE,QUIZ,REAL_CASE,SOURCES,TOURNAMENT_NUMBERS} from './content';
import {LAST,clipTruth,timecode,type Clip} from './goalline';
import {REPLAY_FPS,clipPoints,maxShift,shiftVerdict} from './scoring';
import {BALL_R,BALL_Y,LINE_W,MAST,SHIFT_N,actorItems,ballAt,benchParts,camOnBall,cameraFor,floorAt,makeShift,monitorOf,rng,type VarView} from './model';
import v from './var.module.css';

/**
 * var-2018 · "The VAR room" (Oct 12 2026 anatomy Paper rebuild; user: only the penalty kick stays pixel; every other exhibit is an
 * isometric technical illustration in the Paper theme, LARGE, filling the screen, a real mini-game). One big card: a goal-mouth
 * model on a bench (model.ts) seen from behind the attack, with the goal-line camera on its mast, and beside it the camera's
 * MONITOR (a frame within the frame) showing the line and the ball from above at true scale.
 *  1. Story sheet: Russia 2018, what VAR may check, France 2–1 Australia (Kazan, 16 June 2018): VAR spotted it, the referee
 *     decided it.
 *  2. Your shift: five practice replays. The replay rolls at half speed: FREEZE it when the ball is deepest (points for being
 *     close). Drag the frame strip (or ◀ ▶ / arrow keys) to find the deepest frame (each frame nudged costs a little), drag on
 *     the pitch to aim the goal-line camera at the ball (its monitor locks on), then call GOAL or NO GOAL. The referee jogs to
 *     the review screen: VAR advises, the referee decides. Then the truth, in cm.
 *  3. End of shift sheet: total, best, what VAR may check, a quick check, then the ending → onComplete (once, only then).
 * Heat: one frame loop (anatomy/paper-loop.ts useFrames) runs only while the replay rolls or the referee walks, pauses off-screen, is
 * cancelled on unmount. Reduced motion: no roll; the replay starts frozen on frame 0 and you step it (turn-based).
 */
const BEST_KEY='futbol.museum.var-2018.shiftBest';
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const writeBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};
const BEATS=[
 {when:'Russia · 2018',head:'A new helper',text:`${CASE_FACTS.first} ${CASE_FACTS.checks}`},
 {when:REAL_CASE.when,head:REAL_CASE.match,text:`${REAL_CASE.story[0]} ${REAL_CASE.story[1]}`},
 {when:'The first VAR penalty',head:REAL_CASE.lesson,text:`${REAL_CASE.story[2]} ${CASE_FACTS.decides}`},
];
type Phase='intro'|'roll'|'frozen'|'review'|'verdict'|'score';
type Res={pts:number;right:boolean;off:number|null;nudges:number;call:'goal'|'nogoal'};
const CAM0={x:420,y:BALL_Y+260};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [clips,setClips]=useState<Clip[]>(()=>makeShift(rng(2018))),[ci,setCi]=useState(0),[phase,setPhase]=useState<Phase>('intro');
 const [res,setRes]=useState<Res[]>([]),[best,setBest]=useState(0),[games,setGames]=useState(0),[frame,setFrameS]=useState(0),[locked,setLocked]=useState(false),[checked,setChecked]=useState(false);
 const clip=clips[Math.min(ci,clips.length-1)];
 const view=useRef<VarView>({clip,frame:0,cam:{...CAM0},review:0,call:null}),[,setTick]=useState(0);
 const rollT=useRef(0),off=useRef<number|null>(null),nudges=useRef(0),phaseRef=useRef(phase);phaseRef.current=phase;
 const done=useRef(false),cb=useRef(onComplete);cb.current=onComplete;
 const readout=useRef<HTMLSpanElement>(null),say=(t:string)=>{if(readout.current)readout.current.textContent=t;};
 useEffect(()=>{setBest(readBest());},[]);
 const [boxRef,box]=useBox<HTMLDivElement>();
 const draw=()=>setTick(t=>t+1);
 const setFrame=(f:number)=>{const n=Math.max(0,Math.min(LAST,Math.round(f)));view.current.frame=n;setFrameS(n);setLocked(camOnBall(view.current));say(timecode(n));};

 const loop=useFrames(dt=>{const vv=view.current;
  if(phaseRef.current==='roll'){rollT.current+=dt;const f=Math.min(LAST,Math.floor(rollT.current*REPLAY_FPS));if(f!==vv.frame)setFrame(f);
   if(f>=LAST){off.current=LAST-vv.clip.deep;setPhase('frozen');phaseRef.current='frozen';say('END · FROZEN');return false;}return true;}
  if(phaseRef.current==='review'){vv.review=Math.min(1,vv.review+dt/1.4);draw();
   if(vv.review>=1){setRes(r=>{const x=r[ciRef.current];x?.right?museumSfx.reveal():museumSfx.look();say(x?`+${x.pts}`:'');return r;});setPhase('verdict');phaseRef.current='verdict';return false;}return true;}
  return false;},boxRef);
 const ciRef=useRef(ci);ciRef.current=ci;

 const startClip=(n:number,list=clips)=>{const cl=list[n];view.current={clip:cl,frame:0,cam:{...CAM0},review:0,call:null};
  off.current=null;nudges.current=0;rollT.current=0;setCi(n);setFrame(0);
  if(reduced){setPhase('frozen');phaseRef.current='frozen';draw();return;}setPhase('roll');phaseRef.current='roll';museumSfx.kick();loop.wake();};
 const freeze=()=>{if(phase!=='roll')return;loop.stop();off.current=view.current.frame-clip.deep;museumSfx.tick();setPhase('frozen');phaseRef.current='frozen';say(`FREEZE ${timecode(view.current.frame)}`);};
 const step=(d:number)=>{if(phase==='roll'){freeze();return;}if(phase!=='frozen')return;const f=view.current.frame+d;if(f<0||f>LAST)return;if(!reduced)nudges.current++;setFrame(f);museumSfx.tick();};
 const call=(g:'goal'|'nogoal')=>{if(phase!=='frozen')return;const t=clipTruth(clip),right=(g==='goal')===t.goal;
  if(off.current==null)off.current=view.current.frame-clip.deep;// reduced motion: the frame you call on is your freeze
  const pts=clipPoints(off.current,right,reduced?0:nudges.current);view.current.call=g;museumSfx.whistle();
  setRes(r=>{const n=[...r];n[ci]={pts,right,off:off.current,nudges:nudges.current,call:g};return n;});
  if(reduced){view.current.review=1;right?museumSfx.reveal():museumSfx.look();setPhase('verdict');phaseRef.current='verdict';draw();return;}
  setPhase('review');phaseRef.current='review';view.current.review=0;loop.wake();};
 const scored=useRef(false);
 const next=()=>{if(phase!=='verdict')return;if(ci+1<clips.length){startClip(ci+1);return;}
  if(!scored.current){scored.current=true;const total=res.reduce((a,r)=>a+(r?.pts??0),0);if(total>best){setBest(total);writeBest(total);}museumSfx.crowd();}setPhase('score');};
 const again=()=>{const l=makeShift(rng(Date.now()));scored.current=false;setClips(l);setRes([]);setChecked(false);setGames(g=>g+1);startClip(0,l);};
 const finish=()=>{if(!done.current){done.current=true;cb.current?.();}};

 // ── drawing: the bench fits beside (desktop) or under (phone) the monitor ──
 const side=box.w>=box.h*1.05,monW=side?Math.min(box.w*.36,460)+22:0,monH=side?0:Math.round(box.h*.3)+34;
 const P=useMemo(()=>{const p=cameraFor(Math.max(1,box.w-monW),Math.max(1,box.h-monH));return {...p,origin:[p.origin[0],p.origin[1]+monH] as k.Flat};},[box.w,box.h,monW,monH]);
 const vv=view.current;
 const bench=box.w?benchParts(P,vv):[];
 const act=box.w?actorItems(P,vv):null;
 const aimAt=(e:RPointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect(),w=floorAt(P,e.clientX-r.left,e.clientY-r.top);
  vv.cam={x:Math.max(-180,Math.min(800,w.x)),y:Math.max(-480,Math.min(480,w.y))};const on=camOnBall(vv);if(on&&!locked)museumSfx.tick();setLocked(on);say(on?'CAM LOCKED':'AIM AT THE BALL');draw();};
 const aiming=useRef(false);
 const snapCam=()=>{if(phase!=='frozen')return;const b=ballAt(clip,vv.frame);vv.cam={x:b.x,y:b.y};setLocked(true);say('CAM LOCKED');draw();};
 // The strip: drag along it to scrub (one frame per tick); grabbing it while the replay rolls freezes it.
 const stripRef=useRef<HTMLDivElement>(null),scrub=useRef(false);
 const scrubTo=(e:RPointerEvent<HTMLDivElement>)=>{const r=stripRef.current!.getBoundingClientRect(),u=(e.clientX-r.left-14)/Math.max(1,r.width-28),f=Math.round(Math.max(0,Math.min(1,u))*LAST);
  if(f!==vv.frame){if(!reduced)nudges.current+=Math.abs(f-vv.frame);setFrame(f);museumSfx.tick();}};

 const onKey=(e:KeyboardEvent)=>{const key=e.key,btn=e.target instanceof HTMLButtonElement;
  if(key==='ArrowLeft'||key==='ArrowRight'){e.preventDefault();step(key==='ArrowLeft'?-1:1);return;}
  if(key==='c'||key==='C'){e.preventDefault();snapCam();return;}
  if(phase==='frozen'&&(key==='g'||key==='G')){e.preventDefault();call('goal');return;}
  if(phase==='frozen'&&(key==='n'||key==='N')){e.preventDefault();call('nogoal');return;}
  if((key===' '||key==='Enter')&&!btn){e.preventDefault();if(phase==='roll')freeze();else if(phase==='verdict')next();}};

 const total=res.reduce((a,r)=>a+(r?.pts??0),0),right=res.filter(r=>r?.right).length;
 const offs=res.filter(r=>r&&r.off!=null).map(r=>Math.abs(r.off!)),avgOff=offs.length?offs.reduce((a,b)=>a+b,0)/offs.length:null;
 const last=phase==='verdict'?res[ci]:null,truth=clipTruth(clip),mon=monitorOf(vv);
 const banner=last?{kind:last.right?'good':'bad',big:truth.goal?'Goal':'No goal',line:truth.goal?`The whole ball was over the whole line, by ${truth.cm} cm.`:`${truth.cm} cm of the ball was still on the line.`}
  :phase==='review'?{kind:'info',big:'Referee review',line:'The referee goes to the screen. VAR advises, the referee decides.'}:null;
 const sayLine=phase==='roll'?<><b>Replay rolling.</b> Freeze it when the ball is deepest in the goal.</>
  :phase==='frozen'?<><span className={s.tag}>{timecode(frame)}</span>{locked?'Camera on the ball. Is ALL of the ball past ALL of the line? Drag the strip to find the deepest frame.':'Drag on the pitch to aim the goal-line camera at the ball (or press C).'}</>
  :phase==='verdict'&&last?<><b>{last.right?'Right call.':'Not this time.'}</b> Deepest on frame {clip.deep}{last.off!=null?`, you froze ${Math.abs(last.off)} frame${Math.abs(last.off)===1?'':'s'} ${last.off<0?'early':last.off>0?'late':'spot on'}`:''}. {CASE_FACTS.rule}</>
  :phase==='review'?<>{IFAB_QUOTE}</>:phase==='intro'?<>Five replays. Freeze, aim the goal-line camera, make the call.</>:null;

 // The monitor: the line and the ball from above at true scale (cm), centred on the line.
 const mw=100,mh=60,ball=ballAt(clip,vv.frame),cx=-6;
 const monitor=<div className={v.monitor} data-pos={side?'side':'top'} data-locked={locked||undefined} data-var-monitor>
  <div className={v.monTop}><i>Goal-line cam</i><span>{timecode(frame)}</span></div>
  <div className={v.screen}>
   <svg viewBox={`${cx-mw/2} ${-mh/2} ${mw} ${mh}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-idle={!locked||undefined}>
    <rect x={cx-mw} y={-mh} width={mw*2} height={mh*2} fill="#f3f3ee"/>
    {Array.from({length:12},(_,i)=><rect key={i} x={0} y={-mh+i*12} width={mw} height={6} fill="#ecece6"/>)}
    <rect x={-mw-12} y={-mh} width={mw} height={mh*2} fill="#deded7"/>
    {Array.from({length:10},(_,i)=><rect key={'m'+i} x={-mw-12} y={-mh+i*12} width={mw} height={6} fill="#d6d6cf" opacity=".55"/>)}
    {Array.from({length:22},(_,i)=><line key={i} x1={-16-i*4} y1={-mh} x2={-16-i*4} y2={mh} stroke="#c9c9c2" strokeWidth=".25"/>)}
    <rect x={-LINE_W*100} y={-mh} width={LINE_W*100} height={mh*2} fill="#fbfbf8" stroke="#3a3a37" strokeWidth=".3"/>
    {locked&&<g>
     <ellipse cx={ball.x+3} cy={4} rx={BALL_R*100} ry={BALL_R*100*.5} fill="#00000018"/>
     <circle cx={ball.x} cy={0} r={BALL_R*100} fill="#f7f7f3" stroke="#3a3a37" strokeWidth=".45"/>
     <circle cx={ball.x-2.5} cy={-3} r={BALL_R*100*.62} fill="#fbfbf8"/>
     {[0,1,2,3,4].map(i=>{const a=i*1.256+frame*.2;return <path key={i} d={`M${ball.x+Math.cos(a)*7} ${Math.sin(a)*7}l${Math.cos(a+2)*2.4} ${Math.sin(a+2)*2.4}`} stroke="#3a3a37" strokeWidth=".35"/>;})}
     <circle cx={ball.x} cy={0} r={BALL_R*100} fill="none" stroke="var(--accent)" strokeWidth=".7"/>
     <circle cx={ball.x} cy={0} r={1.6} fill="var(--accent)"/>
    </g>}
    {Array.from({length:81},(_,i)=>{const cm=i-34,x=-12+cm;return <line key={i} x1={x} y1={mh/2} x2={x} y2={mh/2-(cm%10===0?5:cm%5===0?3:1.6)} stroke={cm===0?'var(--accent)':'#3a3a37'} strokeWidth={cm===0?.5:.25}/>;})}
   </svg>
   {!locked&&<div className={v.aim} data-var-aim><span>{phase==='roll'?'Rolling… freeze first':'Aim the camera at the ball'}</span></div>}
  </div>
  <div className={v.monBottom}><span>1 tick = 1 cm</span><span>{phase==='verdict'?`${truth.cm} cm ${truth.goal?'over':'on the line'}`:locked?'locked':'no lock'}</span></div>
 </div>;

 const stage=<div className={v.stage} ref={boxRef}>
  {box.w>0&&<svg className={`iso-svg ${s.svg}`} viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h} tabIndex={0} role="img" data-var-pitch
   aria-label={`A goal-mouth model, practice replay frame ${frame} of ${LAST}. The goal-line camera ${locked?'is on the ball: its monitor shows the line and the ball from above at true size':'is not on the ball yet'}.`}
   onPointerDown={e=>{if(phase!=='frozen'||e.button>0)return;aiming.current=true;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}aimAt(e);}}
   onPointerMove={e=>{if(aiming.current&&phase==='frozen')aimAt(e);}} onPointerUp={()=>{aiming.current=false;}} onPointerCancel={()=>{aiming.current=false;}}>
   <PaperDefs id="var"/>
   <Parts parts={bench} id="var"/>
   {phase!=='intro'&&phase!=='roll'&&<g data-var-reticle>
    <path className="iso-line" data-tone="hi" d={k.ring(vv.cam.x,vv.cam.y,48,0,P,40)} style={{stroke:'var(--accent)',strokeWidth:1.4}}/>
    <path className="iso-line" d={k.lineOnTop([vv.cam.x-70,vv.cam.y],[vv.cam.x+70,vv.cam.y],0,P)+k.lineOnTop([vv.cam.x,vv.cam.y-70],[vv.cam.x,vv.cam.y+70],0,P)} style={{stroke:'var(--accent)'}}/>
    <path className="iso-line" data-dotted d={k.segment([MAST.x+34,MAST.y,299],[vv.cam.x,vv.cam.y,0],P)} style={{stroke:'var(--accent)'}}/>
   </g>}
   {act&&<>{act.shadows.map((h,i)=><Shadow key={i} id="var" {...h}/>)}<Items items={act.items}/></>}
  </svg>}
  {box.w>0&&monitor}
  {banner&&<div className={v.banner} data-kind={banner.kind} role="status"><b>{banner.big}</b><span>{banner.line}</span></div>}
  <Corners fig={`Fig. ${exhibit.year}`} title={side?'The VAR room':''} hint={phase==='frozen'?'Drag the pitch to aim · C locks':'Freeze · aim · call'} readoutRef={readout} readout="00:00:00:00"/>
  {phase==='intro'&&<Sheet label="The story" wide>
   <p className={s.kicker}>Russia · 2018</p>
   <h2 className={s.big}>You are the <em>VAR</em>.</h2>
   <p className={s.lead}>{CASE_FACTS.rule} {PRACTICE_NOTE}</p>
   <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><p style={{margin:0}}><b>{b.head}.</b> {b.text}</p></li>)}</ol>
   <div className={s.buttons} style={{justifyContent:'flex-start'}}><button type="button" className={s.btn} data-accent data-start onClick={()=>startClip(0)}>Start the shift ▸</button></div>
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
     seen={<>You’ve worked a shift in the VAR room: freeze, look closely, then let the referee decide.</>} take={FOR_YOUR_GAME}/>}
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
    <button type="button" className={`${s.ghost} ${v.step}`} aria-label="Back one frame" data-step="-1" onClick={()=>step(-1)}>◀</button>
    <button type="button" className={`${s.ghost} ${v.step}`} aria-label="Forward one frame" data-step="1" onClick={()=>step(1)}>▶</button>
    {phase==='roll'?<button type="button" className={s.btn} data-accent data-freeze onClick={freeze}>Freeze</button>
     :<><button type="button" className={s.btn} data-call="goal" onClick={()=>call('goal')}>Goal</button>
      <button type="button" className={s.ghost} data-call="nogoal" onClick={()=>call('nogoal')}>No goal</button></>}
   </div></>
  :<><p className={s.say} aria-live="polite">{sayLine}</p>
   <div className={s.buttons}>{phase==='verdict'&&<button type="button" className={s.btn} data-next onClick={next}>{ci+1<clips.length?'Next replay ▸':'End shift ▸'}</button>}</div></>}
 </>;

 return <Room id="var-2018" label={`${exhibit.year} · ${exhibit.title}: the VAR room`} onClose={onClose} onKeyDown={onKey} accent="#2a5bd7"
  data={{'data-phase':phase,'data-clip':clip.id,'data-frame':frame,'data-locked':locked||undefined,'data-result':last?(last.right?'right':'wrong'):undefined,'data-points':total,'data-reduced':reduced||undefined}}
  head={<><WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Russia · Law 10</>}/>
   <div className={s.headStats} aria-label="Score"><span><b>{total}</b><i>Points</i></span><span><b>{right}/{res.filter(Boolean).length}</b><i>Right</i></span><span><b>{best}</b><i>Best</i></span></div></>}
  stage={stage} dock={dock}>
  <p className={s.kicker}>{exhibit.year} · Russia</p>
  <h2 className={s.h2}>VAR spotted it. The referee decided it.</h2>
  <ol className={s.facts}>{[CASE_FACTS.first,CASE_FACTS.checks,CASE_FACTS.decides,CASE_FACTS.rule].map((f,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p style={{margin:0}}>{f}</p></li>)}</ol>
  <ul className={v.list}>{CHECKS.map(x=><li key={x.label}><b>{x.yes?'Yes':'No'}</b> · {x.label}: {x.why}</li>)}<li>{TOURNAMENT_NUMBERS}</li><li>“{IFAB_QUOTE}”</li></ul>
  <p className={s.small}>Take it to your game: {FOR_YOUR_GAME} {PRACTICE_NOTE} (the practice replays are made-up, drawn as paper players).</p>
  <Sources list={[...SOURCES,...exhibit.sources]}/>
 </Room>;
}

function Sources({list}:{list:readonly {title:string;url:string}[]}){const seen=new Set<string>();const l=list.filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));
 return <details className={s.sources}><summary>Sources</summary><ul>{l.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul></details>;}
