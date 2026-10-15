'use client';
import {useEffect,useMemo,useReducer,useRef,useState,type KeyboardEvent as RKE,type PointerEvent as RPE} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {PaperRoom,PaperCard,ScoreCover,Pips,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,follow,clamp} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {Analyser,CRANK_Z,LEVER_LEN,layoutFor,leverHandle,projFor,type Ctl,type View} from './Analyser';
import {angleAt,toFrame} from './rig';
import {KNOB_ANGLES,LEVER_ANGLES,PASS_LENGTHS,STYLE_TEAM,TASKS,TURNS,fracOfCrank,frameAt,knobIndex,playOf,shapeOf,snapCrank,type Style,type TaskId} from './model';
import {GRAPHIC_QUOTE,MODEL_NOTE,QUIZ,SOURCES,STORY} from './content';
import a from './analyser.module.css';

/**
 * first-international-1872 · "The first international" (Oct 14 2026 redo; user: "make it possible to turn knobs and things to
 * make it do something", "more visually appealing and interactive", "like the stadiums"). Scotland 0–0 England, 30 November
 * 1872, Hamilton Crescent. ONE object fills the card: THE MATCH ANALYSER (Analyser.tsx), a brass-and-wood instrument.
 *  1. Intro over the card (IntroPanel); ONE centred start button (StartDock).
 *  2. The analyser. Every control does something:
 *     - the STYLE LEVER (drag or tap; arrows / Enter): DRIBBLE = England's 1-1-8 attack, PASS = Scotland's 2-2-6;
 *     - the CRANK (drag round; arrows step a quarter turn, Enter runs the clockwork): winds the move through; the ball and the
 *       pieces move, the GAIN and TIME dials read how far and how long;
 *     - the PASS-LENGTH KNOB (drag round, four detents; arrows): the longest pass Scotland try. 10 m reaches nobody, 20 m works,
 *       30 and 40 m are hopeful long kicks that England win (locked on DRIBBLE: England hardly passed);
 *     - the LIFT-THE-LINES SLIDER (drag; arrows): the attacking team's lines rise onto labelled rack bars (the breakdown);
 *     - the SCOREBOARD (tap; Enter): flips to the real full-time score, 0–0.
 *     Four tasks (one per idea) open the quick check.
 *  3. Quick check (StepCheck) → Ending → onComplete once (Ending `reached`).
 * Heat: SVG only. The one shared loop (anatomy/paper-loop.ts) runs while a control eases, the clockwork runs or a drag is
 * live, and stops at rest; parked off screen. Reduced motion: every move lands at once.
 */
type Phase='intro'|'play'|'check';
type Note={kind:'good'|'bad'|'info';big:string;line:string}|null;
const wrap=(d:number)=>((d+540)%360)-180;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [style,setStyle]=useState<Style>('dribble'),[lenIdx,setLenIdx]=useState(2);
 const [done,setDone]=useState<TaskId[]>([]),[banner,setBanner]=useState<Note>(null),[focus,setFocus]=useState<Ctl|null>(null),[checked,setChecked]=useState(false);
 const [,bump]=useReducer((n:number)=>n+1,0);
 const cardRef=useRef<HTMLDivElement>(null),[stageRef,box]=useBox<HTMLDivElement>();
 const play=useMemo(()=>playOf(style,PASS_LENGTHS[lenIdx]),[style,lenIdx]);
 const MAX=360*TURNS;
 const m=useRef({crank:0,crankT:0,auto:false,lever:LEVER_ANGLES.dribble,leverT:LEVER_ANGLES.dribble,knob:KNOB_ANGLES[2],knobT:KNOB_ANGLES[2],lift:0,liftT:0,flip:0,flipT:0,
  drag:null as null|{c:Ctl;id:number;last:number;moved:boolean;x:number;y:number},lastQ:0,lastSnap:0,ended:'',lastDetent:2,lockSaid:false});
 const ui=useRef({play,style,lenIdx,done});ui.current={play,style,lenIdx,done};

 // ── the card and the camera
 const wide=box.w>=640&&box.w/Math.max(1,box.h)>1.08;
 const L=useMemo(()=>layoutFor(wide),[wide]);
 const [top,setTop]=useState(40);
 useEffect(()=>{setTop(noteSpace(cardRef.current,40));},[box.w,box.h,phase,banner]);
 const P=useMemo(()=>box.w>0?projFor(L,box.w,box.h,top,wide?30:22):null,[L,box.w,box.h,top,wide]);

 const tick=(task:TaskId)=>setDone(d=>d.includes(task)?d:(museumSfx.stamp(),[...d,task]));
 /** Side effects of where the crank is: detent clicks, the sounds of the move, and its ending. */
 const onFrame=()=>{const st=m.current,u=ui.current,f=fracOfCrank(st.crank),fr=frameAt(u.play,f);
  const q=Math.floor(st.crank/90+1e-6);if(q!==st.lastQ){st.lastQ=q;museumSfx.tick();}
  if(fr.i!==st.lastSnap){const fwd=fr.i>st.lastSnap;st.lastSnap=fr.i;const ev=u.play.snaps[Math.min(fr.i+1,u.play.snaps.length-1)].event;
   if(fwd&&(ev==='pass'||ev==='chance'||ev==='clear'||ev==='cut'))museumSfx.kick();else if(fwd&&(ev==='tackle'||ev==='stuck'))museumSfx.look();}
  const key=`${u.style}-${u.lenIdx}`;
  if(f>=1&&st.ended!==key){st.ended=key;const o=u.play.outcome;
   if(u.style==='dribble'){setBanner({kind:'info',big:`Dribbling: ${o.gain} m in ${o.seconds} s`,line:o.why});tick('dribble');}
   else if(o.kind==='chance'){setBanner({kind:'good',big:`${o.passes} passes, ${o.gain} m in ${o.seconds} s`,line:o.why});museumSfx.net();tick('pass');}
   else setBanner({kind:'bad',big:o.passes?'Cut out!':'Stuck!',line:`${o.why} Turn the knob and try again.`});}
  if(f<.98&&st.ended){st.ended='';setBanner(null);}
 };
 const loop=usePaperLoop(dt=>{const st=m.current;let mv=false;const dr=st.drag?.c;
  if(st.auto){const rate=MAX/Math.max(3,ui.current.play.T);st.crank=Math.min(st.crankT,st.crank+rate*dt);if(st.crank>=st.crankT)st.auto=false;else mv=true;}
  else if(dr!=='crank'&&st.crank!==st.crankT){st.crank=follow(st.crank,st.crankT,dt,.09,.1);mv=mv||st.crank!==st.crankT;}
  if(dr!=='lever'&&st.lever!==st.leverT){st.lever=follow(st.lever,st.leverT,dt,.08,.05);mv=mv||st.lever!==st.leverT;}
  if(dr!=='knob'&&st.knob!==st.knobT){st.knob=follow(st.knob,st.knobT,dt,.07,.05);mv=mv||st.knob!==st.knobT;}
  if(dr!=='slider'&&st.lift!==st.liftT){st.lift=follow(st.lift,st.liftT,dt,.12,.002);mv=mv||st.lift!==st.liftT;}
  if(st.flip!==st.flipT){st.flip=follow(st.flip,st.flipT,dt,.16,.004);mv=mv||st.flip!==st.flipT;if(st.flip===1&&st.flipT===1)landFlip();}
  onFrame();bump();return mv;},cardRef,reduced);
 const wake=()=>{loop.wake();bump();};
 const landFlip=()=>{setBanner({kind:'info',big:'Full time: Scotland 0, England 0',line:'The real match had no goals. About 4,000 people watched the first international.'});tick('score');museumSfx.crowd();};

 // ── what each control does
 const rewind=()=>{const st=m.current;st.auto=false;st.crankT=0;st.ended='';setBanner(null);};
 const pickStyle=(x:Style)=>{const st=m.current;st.leverT=LEVER_ANGLES[x];if(x!==ui.current.style){setStyle(x);rewind();museumSfx.flap();}wake();};
 const pickLen=(i:number)=>{const st=m.current,n=clamp(i,0,PASS_LENGTHS.length-1);st.knobT=KNOB_ANGLES[n];st.lastDetent=n;if(n!==ui.current.lenIdx){setLenIdx(n);rewind();museumSfx.tick();}wake();};
 const lockedKnob=()=>{setBanner({kind:'info',big:'The knob is locked',line:'England hardly passed in 1872. Push the lever to PASS to use the pass-length knob.'});museumSfx.look();};
 const setLift=(t:number,ease=false)=>{const st=m.current,v=clamp(t,0,1);st.liftT=v;if(!ease)st.lift=v;if(v>.05&&st.crankT>0)rewind();
  if(v>=.9&&!ui.current.done.includes('lines'))tick('lines');wake();};
 const runClock=()=>{const st=m.current;if(st.crank>=MAX-1){st.crank=0;st.crankT=0;st.ended='';setBanner(null);}st.crankT=MAX;st.auto=!reduced;if(reduced)st.crank=MAX;setLift(0,true);museumSfx.whistle();wake();};
 const stepCrank=(d:number)=>{const st=m.current;st.auto=false;st.crankT=clamp(snapCrank(st.crankT)+d,0,MAX);wake();};
 const flipBoard=()=>{const st=m.current;st.flipT=st.flipT>.5?0:1;if(st.flipT<.5)setBanner(null);museumSfx.flapBook();wake();};

 const svgOf=(e:{currentTarget:Element})=>(e.currentTarget as SVGElement).ownerSVGElement??(e.currentTarget as SVGSVGElement);
 const local=(e:{clientX:number;clientY:number},el:Element):[number,number]=>{const r=el.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 const svgEl=useRef<Element|null>(null);
 const read=(c:Ctl,sx:number,sy:number)=>{if(!P)return 0;const F=L.F;
  if(c==='crank')return angleAt(F,P,sx,sy,L.crank.a,L.crank.b,CRANK_Z+14,L.up,L.right);
  if(c==='knob')return angleAt(F,P,sx,sy,L.knob.a,L.knob.b,11.8,L.up,L.right);
  if(c==='lever'){const h=leverHandle(L,m.current.lever),[pa,pb]=toFrame(F,P,sx,sy,h[2]),d=(pa-L.lever.a)*L.right[0]+(pb-L.lever.b)*L.right[1];return Math.asin(clamp(d/LEVER_LEN,-.62,.62))*180/Math.PI;}
  if(c==='slider'){const sl=L.slider,[pa,pb]=toFrame(F,P,sx,sy,10),d=sl.axis==='a'?pa-sl.a:pb-sl.b;return (d-8)/(sl.len-16);}
  return 0;};
 const onDown=(c:Ctl,e:RPE<SVGElement>)=>{if(phase!=='play')return;e.preventDefault();const el=svgOf(e);svgEl.current=el;try{(e.currentTarget as Element).setPointerCapture?.(e.pointerId);}catch{/* synthetic */}
  const [sx,sy]=local(e,el),st=m.current;st.drag={c,id:e.pointerId,last:read(c,sx,sy),moved:false,x:sx,y:sy};
  if(c==='crank')st.auto=false;
  if(c==='knob'&&ui.current.style==='dribble'){st.drag=null;lockedKnob();}};
 const onMove=(e:RPE<HTMLDivElement>)=>{const st=m.current,d=st.drag;if(!d||d.id!==e.pointerId||!svgEl.current)return;const [sx,sy]=local(e,svgEl.current);
  if(Math.hypot(sx-d.x,sy-d.y)>4)d.moved=true;const v=read(d.c,sx,sy);
  if(d.c==='crank'){const dd=wrap(v-d.last);d.last=v;st.crank=clamp(st.crank+dd,0,MAX);st.crankT=st.crank;}
  else if(d.c==='knob'){st.knob=st.knobT=clamp(v,-125,125);let n=0;KNOB_ANGLES.forEach((x,i)=>{if(Math.abs(x-st.knob)<Math.abs(KNOB_ANGLES[n]-st.knob))n=i;});if(n!==st.lastDetent){st.lastDetent=n;museumSfx.tick();}}
  else if(d.c==='lever'){st.lever=st.leverT=clamp(v,-34,34);}
  else if(d.c==='slider'){setLift(v);return;}
  wake();};
 const onUp=(e:RPE<HTMLDivElement>)=>{const st=m.current,d=st.drag;if(!d||d.id!==e.pointerId)return;st.drag=null;
  if(d.c==='crank'){if(st.crank<MAX-1)st.crankT=snapCrank(st.crank);wake();}
  else if(d.c==='knob')pickLen(knobIndex(st.knob));
  else if(d.c==='lever')pickStyle(d.moved?(st.lever<0?'dribble':'pass'):(ui.current.style==='dribble'?'pass':'dribble'));
  else if(d.c==='board'&&!d.moved)flipBoard();
  else wake();};
 const onKey=(c:Ctl,e:RKE<SVGElement>)=>{if(phase!=='play')return;const k=e.key,inc=k==='ArrowRight'||k==='ArrowUp',dec=k==='ArrowLeft'||k==='ArrowDown',press=k==='Enter'||k===' ';
  if(!(inc||dec||press||k==='Home'||k==='End'))return;e.preventDefault();e.stopPropagation();
  if(c==='crank'){if(press)runClock();else if(k==='Home')rewind();else if(k==='End'){m.current.crankT=MAX;}else stepCrank(inc?90:-90);wake();}
  else if(c==='knob'){if(ui.current.style==='dribble'){lockedKnob();return;}if(inc||dec)pickLen(ui.current.lenIdx+(inc?1:-1));}
  else if(c==='lever')pickStyle(inc?'pass':dec?'dribble':ui.current.style==='dribble'?'pass':'dribble');
  else if(c==='slider'){const t=m.current.liftT;setLift(k==='Home'?0:k==='End'?1:press?(t>.5?0:1):t+(inc?.1:-.1),true);}
  else if(c==='board'&&press)flipBoard();};

 const start=()=>{setPhase('play');museumSfx.whistle();};
 // the view for this render
 const st=m.current,f=fracOfCrank(st.crank),fr=frameAt(play,f),team=STYLE_TEAM[style];
 const view:View={style,lenIdx,crankDeg:st.crank,leverDeg:st.lever,knobDeg:st.knob,lift:st.lift,flip:st.flip,pos:fr.pos,ball:fr.ball,air:fr.air,owner:fr.owner,gain:fr.gain,time:fr.time,focus};
 const task=TASKS.find(t=>!done.includes(t.id))??null,allDone=done.length>=TASKS.length;
 const teamName=team==='england'?'England':'Scotland';
 const readout=`${teamName.toUpperCase()} ${shapeOf(team)} · ${Math.round(fr.gain)} m · ${fr.time.toFixed(1)} s`;
 const aria={crank:{label:'Clockwork crank: turn it to play the move',text:`${Math.round(f*100)}% through the move`,now:Math.round(f*100),min:0,max:100},
  knob:{label:'Pass-length knob',text:style==='dribble'?'Locked: England dribble':`${PASS_LENGTHS[lenIdx]} metres`,now:PASS_LENGTHS[lenIdx],min:10,max:40},
  lever:{label:`Style lever: ${style==='dribble'?'dribble, England':'pass, Scotland'}`,text:style},
  slider:{label:'Lift the lines',text:`${Math.round(st.liftT*100)}% lifted`,now:Math.round(st.liftT*100),min:0,max:100},
  board:{label:st.flipT>.5?'Scoreboard: Scotland 0, England 0':'Scoreboard: tap to flip to the real result',text:''}};
 const sayNote=phase!=='play'?null:st.lift>.3?<><b>{teamName} · {shapeOf(team)}.</b> {team==='england'?'One back, one half-back and eight forwards: almost everyone attacks.':'Two backs, two half-backs, six forwards: more players behind the ball to pass to.'} Pull the lever to compare.</>
  :f<=0.001?<><b>{style==='dribble'?'England’s way: dribble.':`Scotland’s way: pass (${PASS_LENGTHS[lenIdx]} m).`}</b> Turn the crank to play the move.</>
  :<>{fr.snap.say}</>;
 const label=`The match analyser. ${teamName} attack, ${style==='dribble'?'dribbling':'passing'}. The move is ${Math.round(f*100)}% through: ${Math.round(fr.gain)} metres gained in ${fr.time.toFixed(1)} seconds.`;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...SOURCES,...exhibit.sources].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 const cover=phase==='intro'?<IntroPanel kicker="30 November 1872 · Partick, Glasgow" title={<>The first <em>international</em></>} deck={exhibit.facts[0]} beats={STORY}/>
  :phase==='check'?<ScoreCover kicker="Full time" score="0–0" unit="Scotland v England, 1872">
   {!checked?<StepCheck items={QUIZ.map(x=>({q:x.q,options:x.options,right:x.answer,why:x.why}))} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`}
     onPick={ok=>ok?museumSfx.reveal():museumSfx.tick()} doneLabel="Finish" onDone={()=>setChecked(true)}/>
    :<Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You’ve cranked both styles: the lone dribble and the passing move." take={exhibit.forYourGame}/>}
   <div className={s.row}><button type="button" className={s.ghost} data-back-to-board onClick={()=>setPhase('play')}>Back to the analyser</button></div>
  </ScoreCover>:null;

 const dock=phase==='intro'?<StartDock label="Open the analyser" line="England’s dribbling against Scotland’s passing, on a brass match machine." onStart={start}/>
  :phase==='play'?<div className={a.dock}>
   <p className={s.say} aria-live="polite"><Pips results={TASKS.map(t=>done.includes(t.id)?'good':undefined)} total={TASKS.length} label={`${done.length} of ${TASKS.length} tasks done`}/>{' '}
    {task?task.ask:<><b>All four done.</b> Take the quick check.</>}</p>
   <div className={s.row}>
    <button type="button" className={s.ghost} data-run onClick={runClock}>Run the clockwork</button>
    <button type="button" className={s.ghost} data-rewind onClick={()=>{rewind();wake();}}>Rewind</button>
    <button type="button" className={s.btn} data-tone="acc" data-to-check disabled={!allDone} onClick={()=>{setPhase('check');museumSfx.reveal();}}>Quick check</button>
   </div></div>
  :<p className={s.say}>“{GRAPHIC_QUOTE}” · The Graphic, 1872</p>;

 return <PaperRoom id="first-international-1872" accent="#c8372d" ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-style':style,'data-len':PASS_LENGTHS[lenIdx],'data-crank':Math.round(st.crank),'data-frac':f.toFixed(2),'data-lift':st.lift.toFixed(2),'data-flip':st.flip.toFixed(2),
   'data-tasks':done.join(' ')||undefined,'data-gain':Math.round(fr.gain),'data-outcome':f>=1?play.outcome.kind:undefined,'data-reduced':reduced||undefined,'data-wide':wide||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>30 November {exhibit.year} · Partick, Glasgow</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note="" fig="Fig. 1872" title={box.w>520?'The match analyser':''} hint={wide?'Turn the crank · pull the lever · lift the lines':'Turn the crank'} readout={readout}
   note={phase!=='play'?null:banner?<span data-result={banner.kind}><b className={a.big} data-kind={banner.kind}>{banner.big}.</b> {banner.line}</span>:sayNote} cover={cover}>
   <div ref={stageRef} className={`${s.stage} ${a.stage}`} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-stage>
    {P&&<Analyser L={L} P={P} w={box.w} h={box.h} v={view} label={label} onDown={onDown} onKey={onKey} onFocus={setFocus} aria={aria}/>}
   </div>
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="fi-story">
   <p className={g.kicker}>{exhibit.year} · Scotland v England</p>
   <h2 id="fi-story" className={g.h2}>Eight forwards against a passing game</h2>
   <ol className={g.steps}>{exhibit.facts.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{x}</p></li>)}</ol>
   <p className={g.body}><b>The Graphic, December 1872:</b> “{GRAPHIC_QUOTE}”</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: navy pieces joined by passes round a white one, into a goal of two posts and a tape. */
function EndArt(){
 return <svg viewBox="0 0 240 160" aria-hidden="true">
  <rect x="10" y="22" width="220" height="118" rx="4" fill="#b7cda3" stroke="#3a3a3c" strokeWidth="1"/>
  <path d="M222 66v30M228 66v30M222 66h6" stroke="#fbfbf6" strokeWidth="2"/>
  <path d="M50 110 98 58 150 96 214 80" fill="none" stroke="#c8372d" strokeWidth="2.4" strokeLinecap="round"/>
  <circle cx="114" cy="90" r="9" fill="#f6f4ec" stroke="#1d1d1b" strokeWidth="1.4"/>
  {[[50,110],[98,58],[150,96]].map(([x,y])=><circle key={x} cx={x} cy={y} r="9" fill="#2d3f78" stroke="#1d1d1b" strokeWidth="1.2"/>)}
  <circle cx="214" cy="80" r="5" fill="#b07a45" stroke="#1d1d1b"/>
 </svg>;
}
