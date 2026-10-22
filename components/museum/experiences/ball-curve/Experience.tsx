'use client';
import {useEffect,useMemo,useReducer,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {PaperRoom,PaperCard,Banner,ScoreCover,Chips,Pips,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {local,toFloor,follow} from '../anatomy/paper-kit';
import {iso} from '../anatomy/iso-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {alongPath,knobValue} from '../free-kick-wall/rig-parts';
import {FigureStage,type FigureHandle} from '../anatomy/FigureStage';
import fs from '../anatomy/FigureStage.module.css';
import {STEPS as FIG_STEPS,makeCurveFigure} from './figure';
import {ACCENT,BEATS,CHALLENGES,CHECKS,FIGURE_INTRO,FIGURE_SAY,MODEL_NOTE,MORE,PART_NAME,PART_TEXT,SHOW,SOURCES,TASKS,VERDICT} from './content';
import {bendAt,fly,judge,spinOf,yEndOf,type Flight,type Strike} from './physics';
import {CRANK,SPINK,Tunnel,tunnelState,useTunnelProjection} from './Tunnel';
import {Lane,M,cockOf,goalYOf,hammerAt,useLaneProjection,type LaneView} from './Launcher';
import {BALL_PARTS,Exploded,partAnchors,useBallProjection,type BallPart} from './Exploded';
import {sphereRadius} from './ballgeom';
import bc from './bc.module.css';

/**
 * ball-curve · "How a ball curves" (Oct 14 2026 REDO; user: "make it possible to turn knobs and things to make it do something
 * … the stadiums did a great job of showing the breakdown of the layers"). Three crafted instruments, one after the other, each
 * filling the card (the anatomy Paper room):
 *  1. THE WIND TUNNEL (Tunnel.tsx): wind the fan CRANK, turn the SPIN knob. The smoke lines split round the ball, crowd on the side
 *     whose surface moves with the air and leave thrown the other way; the ball's sprung carriage slides and the gauge reads the
 *     push (the Magnus effect). Four little jobs: wind, spin, the other way, no wind = no push.
 *  2. THE CURL LAUNCHER (Launcher.tsx): turn the TURNTABLE to aim, pull the HAMMER back for power, drag the dot on the big CONTACT
 *     BALL to choose where it hits (that is the spin). The straight hairline, the dashed prediction and the flight. Two challenges:
 *     round the wall, and the knuckleball (no spin: it wobbles off the prediction).
 *  3. THE BALL TAKEN APART (Exploded.tsx, the breakdown like the stadiums): a slider lifts the cover, the bladder and the valve
 *     apart; five numbered parts with leader lines (or badges on a phone). Drag the ball to turn it.
 *  4. Score + quick check (StepCheck) → Ending → onComplete once.
 *  KICK IT (museum-figures-3, figure kit v2; figure.ts): from the intro or the breakdown, a spinning ball, a wall and a goal that
 *     turn all the way round; "Show the air" shows the air bent off one side and the force arrow; Labels; "Curl left / right";
 *     "Kick it" plays kick with spin, the air bends, the ball curves round the wall into the goal (the figure's own clock).
 * Heat: React redraws on a change. The shared Paper loop (anatomy/paper-loop.ts) runs only while a control is being turned and
 * for a short settle after it (the fan, the spinning ball, the smoke), while a kick flies, or while the ball comes apart; it parks
 * off-screen and in a hidden tab. 0 frames at rest. Reduced motion: everything lands at once and the smoke stands still.
 */
type Phase='intro'|'tunnel'|'launch'|'apart'|'score'|'figure';
type C2='wall'|'knuckle';
type Ctl='fan'|'spin'|'aim'|'power'|'contact';
type Task='wind'|'spin'|'flip'|'still';
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const SETTLE=1.6;
const ORDER:readonly C2[]=['wall','knuckle'];
type Shot={f:Flight;code:string;ok:boolean;strike:Strike};
const turnsWord=(n:number)=>`${Math.abs(n).toFixed(1)} turns/s`;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [,bump]=useReducer((n:number)=>n+1,0);
 // Kick it (figure kit v2): made once; `figFrom` is the phase to go back to. The steps report back through onStep.
 const curve=useMemo(()=>makeCurveFigure(),[]),figHandle=useRef<FigureHandle|null>(null),figFrom=useRef<Phase>('intro');
 const [figLit,setFigLit]=useState<string[]>([]),[figNote,setFigNote]=useState(FIGURE_INTRO),[figStep,setFigStep]=useState(-1),[curl,setCurl]=useState<1|-1>(1);
 useEffect(()=>{curve.onStep=i=>{setFigStep(i);const st=FIG_STEPS[i];if(st){setFigLit([...st.lit]);setFigNote(FIGURE_SAY[st.id]);sfx(i===0?museumSfx.kick:i===FIG_STEPS.length-1?museumSfx.net:museumSfx.tick);}};return()=>{curve.onStep=null;};},[curve]);
 const openFigure=(from:Phase)=>{figFrom.current=from;curve.reset();setFigStep(-1);setFigLit([]);setFigNote(FIGURE_INTRO);setPhase('figure');sfx(museumSfx.reveal);};
 const closeFigure=()=>{curve.reset();setFigStep(-1);setFigLit([]);setPhase(figFrom.current);};
 const touchCurve=(id:string)=>{if(curve.running)return;setFigLit([id]);setFigNote(FIGURE_SAY[id==='air'?'air_flow':id]??FIGURE_INTRO);sfx(museumSfx.tick);};
 const kickCurve=()=>{const h=figHandle.current;if(figStep>=FIG_STEPS.length-1&&!curve.running){curve.reset();setFigStep(-1);setFigLit([]);setFigNote(FIGURE_INTRO);h?.invalidate();return;}
  if(figStep<0){h?.setLabels(true);h?.setSeeThrough(true);}curve.kick(reduced);h?.invalidate();};
 const flipCurl=()=>{const n:1|-1=curl===1?-1:1;curve.reset();curve.setSide(n);setCurl(n);setFigStep(-1);setFigLit(['spin']);setFigNote(FIGURE_SAY[n===1?'right':'left']);sfx(museumSfx.tick);figHandle.current?.invalidate();};
 const cardRef=useRef<HTMLDivElement>(null),stageRef=useRef<HTMLDivElement>(null),readRef=useRef<HTMLSpanElement>(null);
 const [box,setBox]=useState({w:0,h:0});
 useEffect(()=>{const el=stageRef.current;if(!el)return;const read=()=>{const r=el.getBoundingClientRect();setBox(b=>Math.round(r.width)===b.w&&Math.round(r.height)===b.h?b:{w:Math.round(r.width),h:Math.round(r.height)});};read();
  if(typeof ResizeObserver==='undefined'){addEventListener('resize',read);return()=>removeEventListener('resize',read);}const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[]);
 const [top,setTop]=useState(40);
 const said=useRef('');const say=(t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;};
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k);},[onClose]);
 const [active,setActive]=useState<Ctl|null>(null);
 // 1. the tunnel
 const [fan,setFan]=useState(0),[spin,setSpin]=useState(0),[done,setDone]=useState<Task[]>([]),firstSign=useRef(0);
 const tv=useRef({left:0,phase:0,yaw:0,flow:0});
 // 2. the launcher
 const [c,setC]=useState<C2>('wall');const [strike,setStrike]=useState({cx:0,cy:-.2,power:.6});const [aims,setAims]=useState<Record<C2,number>>({wall:0,knuckle:0});
 const [tries,setTries]=useState<Record<C2,number>>({wall:0,knuckle:0}),[solved,setSolved]=useState<Record<C2,boolean>>({wall:false,knuckle:false});
 const [last,setLast]=useState<Shot|null>(null);const fl=useRef<{shot:Shot;t:number}|null>(null),kicks=useRef(0),dialYaw=useRef(0);
 // 3. the ball apart
 const [apart,setApart]=useState(0),[focus,setFocus]=useState<BallPart|null>(null);const ex=useRef({e:0,eT:0}),yaw=useRef(.3);
 const [checked,setChecked]=useState(false),[games,setGames]=useState(0);
 useEffect(()=>{if(cardRef.current?.querySelector('[data-paper-note]'))setTop(noteSpace(cardRef.current,40));},[phase,box.w,box.h,c,last,done.length]);
 const wide=box.w/Math.max(1,box.h)>1.1;
 const PT=useTunnelProjection(box.w,box.h,top,34),PL=useLaneProjection(c,box.w,box.h,top,34),PB=useBallProjection(box.w,box.h,top,34,wide);
 const st=tunnelState(fan,spin);

 // ── The one loop: the tunnel settling, a kick in flight, the ball coming apart ──
 const loop=usePaperLoop(dt=>{let more=false;
  const T=tv.current;if(T.left>0){T.left=Math.max(0,T.left-dt);const s0=tunnelState(fanRef.current,spinRef.current),ease=Math.min(1,T.left/.6);
   T.phase+=dt*s0.U*.35*ease;T.yaw-=dt*s0.n*2*Math.PI*.12*ease;T.flow+=dt*s0.U*3*ease;more=more||T.left>0;}
  const f=fl.current;if(f){f.t+=dt;dialYaw.current+=dt*f.shot.f.spin.side*.05;const end=f.shot.f.samples[f.shot.f.samples.length-1].t;if(f.t>=end+.4){fl.current=null;land(f.shot);}else more=true;}
  const X=ex.current;if(X.e!==X.eT){X.e=follow(X.e,X.eT,dt,.22,.002);if(X.e===X.eT)setApart(X.e);else more=true;}
  bump();return more;},stageRef,reduced);
 const fanRef=useRef(fan),spinRef=useRef(spin);fanRef.current=fan;spinRef.current=spin;
 const stir=()=>{tv.current.left=reduced?0:SETTLE;if(!reduced)loop.wake();};

 // ── The tunnel's jobs ──
 useEffect(()=>{if(phase!=='tunnel')return;const add=(t:Task)=>setDone(d=>d.includes(t)?d:(sfx(museumSfx.reveal),[...d,t]));
  const U=st.U*3.6;
  if(!done.includes('wind')&&U>=50&&Math.abs(spin)<.05)add('wind');
  if(done.includes('wind')&&!done.includes('spin')&&U>=40&&Math.abs(st.n)>=3){add('spin');firstSign.current=Math.sign(st.n);}
  if(done.includes('spin')&&!done.includes('flip')&&U>=40&&Math.abs(st.n)>=3&&Math.sign(st.n)===-firstSign.current)add('flip');
  if(done.includes('flip')&&!done.includes('still')&&U<6&&Math.abs(st.n)>=3)add('still');
 },[phase,fan,spin,st.U,st.n,done]);
 const task=TASKS.find(t=>!done.includes(t.id))??null,lastDone=done.length?TASKS.find(t=>t.id===done[done.length-1])!:null;

 // ── The launcher ──
 const aim=aims[c];
 const st2:Strike=useMemo(()=>({...strike,aim,seed:kicks.current}),[strike,aim]);
 const pred=useMemo(()=>fly(st2,{yEnd:yEndOf(c),wobble:false}).samples,[st2,c]);
 const kick=()=>{if(fl.current||phase!=='launch')return;unlockMuseumAudio();kicks.current++;const sk:Strike={...strike,aim,seed:kicks.current};
  const f=fly(sk,{yEnd:yEndOf(c)}),v=judge(c,sk,f);setLast(null);fl.current={shot:{f,code:v.code,ok:v.ok,strike:sk},t:0};sfx(museumSfx.kick);setTries(t=>({...t,[c]:t[c]+1}));loop.wake();};
 function land(shot:Shot){setLast(shot);if(shot.ok){setSolved(x=>({...x,[c]:true}));sfx(museumSfx.net);sfx(museumSfx.crowd);}else sfx(shot.code==='blocked'?museumSfx.stamp:museumSfx.look);}
 const showMe=()=>{const x=SHOW[c];setStrike({cx:x.cx,cy:x.cy,power:x.power});setAims(a=>({...a,[c]:x.aim}));setLast(null);sfx(museumSfx.tick);};
 const nextLaunch=()=>{if(c==='wall'){setC('knuckle');setLast(null);sfx(museumSfx.whistle);}else startApart();};

 // ── The ball apart ──
 const startApart=()=>{setPhase('apart');setFocus(null);ex.current={e:0,eT:0};setApart(0);sfx(museumSfx.reveal);
  if(reduced){ex.current={e:1,eT:1};setApart(1);}else{ex.current.eT=1;setTimeout(()=>loop.wake(),300);}};
 const setE=(x:number,ease:boolean)=>{const X=ex.current;X.eT=clamp(x,0,1);if(!ease||reduced){X.e=X.eT;setApart(X.e);}else loop.wake();};

 // ── Controls: drag (pointer) and arrow keys ──
 const ctl=useRef<{id:Ctl|'turnBall';pid:number;x0:number;y0:number;v0:number;v1:number;a0:number}|null>(null);
 const worldAngle=(sx:number,sy:number)=>{if(!PL)return 0;const B=[goalYOf(c)*M,0],[x,y]=toFloor(sx,sy,PL,2.6);return Math.atan2(y-B[1],x-B[0]);};
 const crankValue=(sx:number,sy:number)=>{if(!PT)return fan;const [wx,wy]=toFloor(sx,sy,PT,CRANK.z),a=Math.atan2(wx-CRANK.x,-(wy-CRANK.y)),span=(CRANK.span??300)*Math.PI/180;
  let rel=a-(Math.PI-span/2);rel=((rel%(2*Math.PI))+2*Math.PI)%(2*Math.PI);if(rel>span)rel=rel-span>(2*Math.PI-span)/2?0:span;return rel/span;};
 const setCtl=(id:Ctl,raw:number,raw2?:number)=>{
  if(id==='fan'){const v=clamp(Math.round(raw*20)/20,0,1);if(v!==fan){setFan(v);sfx(museumSfx.tick);}stir();return;}
  if(id==='spin'){let v=clamp(Math.round(raw*10)/10,-1,1);if(Math.abs(v)<.08)v=0;if(v!==spin){setSpin(v);sfx(museumSfx.tick);}stir();return;}
  if(fl.current)return;
  if(id==='aim'){const v=clamp(Math.round(raw*2)/2,-30,30);if(v!==aim){setAims(a=>({...a,[c]:v}));setLast(null);sfx(museumSfx.tick);}return;}
  if(id==='power'){const v=clamp(Math.round(raw*20)/20,0,1);if(v!==strike.power){setStrike(x=>({...x,power:v}));setLast(null);sfx(museumSfx.tick);}return;}
  let cx=raw,cy=raw2??strike.cy;const l=Math.hypot(cx,cy);if(l>1){cx/=l;cy/=l;}cx=Math.round(cx*20)/20;cy=Math.round(cy*20)/20;
  if(cx!==strike.cx||cy!==strike.cy){setStrike(x=>({...x,cx,cy}));setLast(null);sfx(museumSfx.tick);}};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{const t=(e.target as Element).closest?.('[data-ctl]');const [x,y]=local(e,e.currentTarget);
  if(phase==='apart'){ctl.current={id:'turnBall',pid:e.pointerId,x0:x,y0:y,v0:yaw.current,v1:0,a0:0};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}return;}
  if(!t)return;const id=t.getAttribute('data-ctl') as Ctl;if((id==='fan'||id==='spin')&&phase!=='tunnel')return;if(id!=='fan'&&id!=='spin'&&(phase!=='launch'||fl.current))return;
  unlockMuseumAudio();const v0=id==='fan'?fan:id==='spin'?spin:id==='aim'?aim:id==='power'?strike.power:strike.cx;
  ctl.current={id,pid:e.pointerId,x0:x,y0:y,v0,v1:strike.cy,a0:id==='aim'?worldAngle(x,y):0};setActive(id);
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}e.preventDefault();
  if(id==='fan')setCtl('fan',crankValue(x,y));if(id==='spin'&&PT)setCtl('spin',knobValue(SPINK,PT,x,y)*2-1);};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=ctl.current;if(!d||d.pid!==e.pointerId)return;const [x,y]=local(e,e.currentTarget),dx=x-d.x0,dy=y-d.y0;
  if(d.id==='turnBall'){yaw.current=d.v0+dx*.012;bump();return;}
  if(d.id==='fan')setCtl('fan',crankValue(x,y));
  else if(d.id==='spin'&&PT)setCtl('spin',knobValue(SPINK,PT,x,y)*2-1);
  else if(d.id==='aim'){let da=worldAngle(x,y)-d.a0;da=Math.atan2(Math.sin(da),Math.cos(da));setCtl('aim',d.v0+da*180/Math.PI);}
  else if(d.id==='power'&&PL){const v=alongPath(p=>iso(hammerAt(c,aim,cockOf(p),strike.cx,strike.cy),PL),d.v0,dx,dy);setCtl('power',v);}
  else if(d.id==='contact'&&PL){const R=sphereRadius(13,PL)*.8;setCtl('contact',d.v0+dx/R,d.v1-dy/R);}};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=ctl.current;if(!d||d.pid!==e.pointerId)return;ctl.current=null;setActive(null);};
 const onKey=(e:KeyboardEvent<HTMLElement>)=>{const k=e.key,el=e.target as Element;if(el instanceof HTMLButtonElement||el instanceof HTMLInputElement)return;
  const id=el.getAttribute?.('data-ctl') as Ctl|null;
  if(id&&k.startsWith('Arrow')){e.preventDefault();const dir=k==='ArrowLeft'||k==='ArrowDown'?-1:1,big=e.shiftKey?4:1;
   if(id==='fan')setCtl('fan',fan+dir*.05*big);else if(id==='spin')setCtl('spin',spin+dir*.1*big);else if(id==='aim')setCtl('aim',aim+dir*.5*big);
   else if(id==='power')setCtl('power',strike.power+dir*.05*big);
   else if(id==='contact'){if(k==='ArrowUp'||k==='ArrowDown')setCtl('contact',strike.cx,strike.cy+(k==='ArrowUp'?.1:-.1));else setCtl('contact',strike.cx+dir*.1,strike.cy);}return;}
  if(phase==='apart'&&(k==='ArrowLeft'||k==='ArrowRight')){e.preventDefault();yaw.current+=k==='ArrowLeft'?-.25:.25;bump();return;}
  if((k==='Enter'||k===' ')&&phase==='launch'&&!last?.ok){e.preventDefault();kick();}};

 // ── What each instrument shows right now ──
 const f=fl.current;
 const shown=f?f.shot:last;
 const upto=f?Math.floor(f.t*120)+1:shown?shown.f.samples.length:0;
 let dive=0;if(shown&&c==='wall'){const end=shown.f.samples[shown.f.samples.length-1],T=end.t,tt=f?clamp((f.t-.3)/Math.max(.2,T-.3),0,1):1;const want=clamp(end.x-3.4,-1.8,1.8);dive=shown.code==='blocked'?0:want*tt;}
 const lane:LaneView={c,strike,aim,hammer:f?(f.t<.12?cockOf(strike.power)*(1-f.t/.12):-18*Math.min(1,(f.t-.12)/.15)+(f.t>.45?18*Math.min(1,(f.t-.45)/.5)+cockOf(strike.power)*clamp((f.t-.95)/.6,0,1):0)):cockOf(strike.power),
  pred,actual:shown?{s:shown.f.samples,upto}:null,keeperDive:dive,yaw:dialYaw.current+strike.cx*.6,active};
 const sp=spinOf(st2),bend=last?bendAt(last.f,20,last.strike.aim):null;
 useEffect(()=>{if(fl.current)return;
  if(phase==='tunnel')say(`WIND ${Math.round(st.U*3.6)} KM/H · SPIN ${turnsWord(st.n).toUpperCase()} · PUSH ${Math.abs(st.F).toFixed(1)} N`);
  else if(phase==='launch')say(last?`${VERDICT[last.code].big.toUpperCase()}${bend!=null&&Math.abs(bend)>.3?` · BENT ${Math.abs(bend).toFixed(1)} M`:''}`:`AIM ${aim>0?'+':''}${aim}° · POWER ${Math.round(strike.power*100)}% · SPIN ${turnsWord(sp.total/(2*Math.PI)).toUpperCase()}`);
  else if(phase==='apart')say(`${Math.round(apart*100)}% APART`);});

 const solvedN=ORDER.filter(x=>solved[x]).length,ch=CHALLENGES.find(x=>x.id===c)!;
 const items:CheckItem[]=useMemo(()=>CHECKS.map(x=>({q:x.q,options:x.options,right:x.right,why:x.why})),[]);
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const misses=tries[c]-(solved[c]?1:0);

 const note=phase==='tunnel'&&task?<><span className={s.tag} data-tone="acc">{done.length+1} of 4 · {task.head}</span>{task.text}</>
  :phase==='launch'&&!f&&!last?<><span className={s.tag} data-tone="acc">{ORDER.indexOf(c)+1} of 2 · {ch.name}</span>{ch.goal}{misses>=2&&<> <b>Tip:</b> {ch.tip}</>}</>
    :phase==='apart'&&!wide?<><span className={s.tag} data-tone="acc">Take the ball apart</span>Slide it apart, tap a number to read each part, drag the ball to turn it.</>:null;
 const banner=phase==='tunnel'&&!task?<Banner kind="good" big="The Magnus effect" line="The spinning ball throws the air one way, so the air pushes the ball the other way. Now kick one."/>
  :phase==='tunnel'&&lastDone&&!f?null
  :phase==='launch'&&last?<Banner kind={VERDICT[last.code].kind} big={VERDICT[last.code].big} line={<>{VERDICT[last.code].line}{bend!=null&&Math.abs(bend)>.3?<> It bent {Math.abs(bend).toFixed(1)} m {bend<0?'left':'right'}.</>:null}</>}/>:null;

 const cover=phase==='intro'?<IntroPanel kicker={<>Skills &amp; science · the lab</>} title={<>How a ball <em>curves</em></>} deck={exhibit.facts[0]} beats={BEATS}/>
  :phase==='score'?<ScoreCover kicker="The curve lab" score={`${solvedN}/2`} unit="kicks done · 4 of 4 tunnel jobs"
    notes={<><p><b>{solvedN===2?'Lab complete!':'Good kicking.'}</b> {exhibit.facts[1]}</p><p>{exhibit.facts[2]}</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-bc-again onClick={()=>{setPhase('launch');setLast(null);setGames(n=>n+1);setChecked(false);}}>Back to the launcher</button>
     <button type="button" className={s.ghost} data-bc-retunnel onClick={()=>setPhase('tunnel')}>Back to the tunnel</button></>}>
    <StepCheck key={games} items={items} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You spun a ball in the wind tunnel, bent one round a wall and took one apart." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const fig=phase==='launch'?'Fig. 2':phase==='apart'?'Fig. 3':phase==='figure'?'Fig. 4':'Fig. 1';
 const title=phase==='figure'?'A curling free kick':phase==='launch'?'The curl launcher':phase==='apart'?'The ball, taken apart':'The wind tunnel';
 const hint=phase==='figure'?'Drag to turn':phase==='tunnel'?'Wind the crank · turn the spin knob':phase==='launch'?'Turn the table · pull the hammer · drag the dot':phase==='apart'?'Slide it apart · tap a number':'Magnus effect';
 const label=phase==='launch'?`The curl launcher. ${ch.name}: ${ch.goal} Aim ${aim} degrees, power ${Math.round(strike.power*100)}%, contact ${Math.abs(strike.cx)<.12?'in the middle':strike.cx>0?'right of the middle':'left of the middle'}.`
  :phase==='apart'?`A football taken apart: ${BALL_PARTS.map(p=>PART_NAME[p]).join(', ')}.`
  :`A wind tunnel with a ball on a spindle. Wind ${Math.round(st.U*3.6)} km/h, spin ${turnsWord(st.n)}. ${Math.abs(st.F)<.05?'No push.':`The ball is pushed ${st.F>0?'towards you':'away from you'} with ${Math.abs(st.F).toFixed(1)} newtons.`}`;

 // the breakdown's labels (wide) or badges + a caption (phone)
 const anchors=phase==='apart'&&PB?partAnchors(PB,ex.current.e,yaw.current):null,showParts=!!anchors&&ex.current.e>.35;
 const colX=box.w-Math.min(330,box.w*.3)+8,rowH=Math.max(70,Math.min(140,(box.h-top-50)/5)),labelY=(i:number)=>top+16+i*rowH;
 const order=anchors?[...BALL_PARTS].sort((a,b)=>anchors[a][1]-anchors[b][1]):BALL_PARTS;
 const overlay=showParts&&anchors?<svg className={bc.over} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">{order.map((id,i)=>{const a=anchors[id],n=BALL_PARTS.indexOf(id)+1;
  if(wide){const y=labelY(i)+11;return <g key={id}><path className={bc.leader} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${(colX-26).toFixed(1)} ${y.toFixed(1)}L${(colX+2).toFixed(1)} ${y.toFixed(1)}`}/><circle className={bc.leaderEnd} cx={a[0]} cy={a[1]} r={3.2}/></g>;}
  return <g key={id} className={bc.badge} data-on={focus===id||undefined}><circle cx={a[0]} cy={a[1]} r={14}/><text x={a[0]} y={a[1]+4.5}>{n}</text></g>;})}</svg>:null;
 const badges=showParts&&anchors&&!wide?order.map(id=>{const a=anchors[id];return <button key={id} type="button" className={bc.badgeHit} style={{left:a[0]-22,top:a[1]-22}} aria-label={`${BALL_PARTS.indexOf(id)+1}: ${PART_NAME[id]}`} aria-pressed={focus===id} data-part={id}
  onClick={()=>{setFocus(id);sfx(museumSfx.tick);}}/>;}):null;
 const labels=showParts&&wide?order.map((id,i)=><button key={id} type="button" className={bc.label} style={{left:colX+8,top:labelY(i),width:Math.min(310,box.w*.3)-24} as CSSProperties} data-part-label={id} aria-pressed={focus===id}
  onClick={()=>setFocus(x=>x===id?null:id)}><b><i>{BALL_PARTS.indexOf(id)+1}</i>{PART_NAME[id]}</b><span>{PART_TEXT[id]}</span></button>):null;

 const dock=phase==='intro'?<><StartDock label="Open the lab" line="A wind tunnel, a curl launcher, and a ball to take apart." onStart={()=>{unlockMuseumAudio();sfx(museumSfx.whistle);setPhase('tunnel');}}/>
   <div className={s.row}><button type="button" className={s.ghost} data-curve-figure onClick={()=>openFigure('intro')}>Kick with spin</button></div></>
  :phase==='figure'?<>
   <p className={s.say} aria-live="polite" data-fig-note>{figNote}</p>
   <div className={s.row}>
    <button type="button" className={s.btn} data-tone="acc" data-kick-it onClick={kickCurve}>{figStep>=FIG_STEPS.length-1&&!curve.running?'Kick again':reduced&&figStep>=0?'Next step':'Kick it'}</button>
    <button type="button" className={s.ghost} data-fig-back onClick={closeFigure}>{figFrom.current==='intro'?'Back to the start':'Back to the ball'}</button>
   </div></>
  :phase==='tunnel'?<>
   <div className={s.row}>
    <Pips results={TASKS.map(t=>done.includes(t.id)?'good':undefined)} total={4} label={`${done.length} of 4 tunnel jobs done`}/>
    <span className={s.grow}><Chips items={[{k:'wind',label:'Wind',value:`${Math.round(st.U*3.6)} km/h`},{k:'spin',label:'Spin',value:turnsWord(st.n)},{k:'push',label:'Push',value:`${Math.abs(st.F).toFixed(1)} N`}]}/></span>
   </div>
   <div className={s.row}>
    {!task?<button type="button" className={s.btn} data-tone="acc" data-bc-to-launch onClick={()=>{setPhase('launch');sfx(museumSfx.whistle);}}>To the launcher</button>
     :<p className={`${s.say} ${s.grow}`} aria-live="polite">{lastDone?<><b>{lastDone.head}:</b> {lastDone.done}</>:'Drag the crank round, or focus it and use the arrow keys.'}</p>}
   </div></>
  :phase==='launch'?<>
   <div className={s.row}>
    <Pips results={ORDER.map(x=>solved[x]?'good':undefined)} total={2} label={`${solvedN} of 2 kicks done`}/>
    <span className={s.grow}><Chips items={[{k:'aim',label:'Aim',value:`${aim>0?'+':''}${aim}°`},{k:'power',label:'Power',value:`${Math.round(strike.power*100)}%`},{k:'spin',label:'Spin',value:turnsWord(sp.total/(2*Math.PI))}]}/></span>
   </div>
   <div className={s.row}>
    {last?.ok?<button type="button" className={s.btn} data-tone="acc" data-bc-next onClick={nextLaunch}>{c==='wall'?'Next: the knuckleball':'Take the ball apart'}</button>
     :<button type="button" className={`${s.btn} ${bc.kick}`} data-tone="acc" data-bc-kick disabled={!!f} onClick={kick}>Kick</button>}
    {!last?.ok&&misses>=3&&<button type="button" className={s.ghost} data-bc-show disabled={!!f} onClick={showMe}>Show me</button>}
    {!last?.ok&&misses>=5&&<button type="button" className={s.ghost} data-bc-skip disabled={!!f} onClick={nextLaunch}>Skip</button>}
   </div></>
  :phase==='apart'?<>
   <div className={s.row}>
    <label className={bc.slider}><span>Take it apart</span><input type="range" min={0} max={100} step={1} value={Math.round(apart*100)} data-apart-slider aria-valuetext={`${Math.round(apart*100)}% apart`}
     onChange={e=>setE(Number(e.currentTarget.value)/100,false)}/></label>
    <button type="button" className={s.ghost} data-bc-explode onClick={()=>{setE(ex.current.eT>.5?0:1,true);sfx(museumSfx.reveal);}}>{apart>.5?'Put it together':'Pull it apart'}</button>
    <button type="button" className={s.ghost} data-curve-figure onClick={()=>openFigure('apart')}>Kick with spin</button>
    <button type="button" className={s.btn} data-tone="acc" data-bc-score onClick={()=>{sfx(museumSfx.whistle);setPhase('score');}}>Quick check</button>
   </div>
   {!wide&&<p className={s.say} data-caption aria-live="polite">{focus?<><b>{BALL_PARTS.indexOf(focus)+1} · {PART_NAME[focus]}.</b> {PART_TEXT[focus]}</>:showParts?'Tap a number to read about that part.':'Slide it apart to see the parts.'}</p>}
  </>:null;

 const T=tv.current;
 return <PaperRoom id="ball-curve" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose} onKeyDown={onKey}
  rootProps={{'data-phase':phase,'data-fan':fan.toFixed(2),'data-spin':spin.toFixed(1),'data-push':st.F.toFixed(2),'data-tasks':done.join(','),'data-challenge':phase==='launch'?c:undefined,
   'data-contact':`${strike.cx.toFixed(2)},${strike.cy.toFixed(2)}`,'data-power':strike.power.toFixed(2),'data-aim':aim,'data-last':last?.code,'data-solved':ORDER.filter(x=>solved[x]).join(',')||undefined,
   'data-flying':!!f||undefined,'data-apart':apart.toFixed(2),'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>Skills &amp; science · the Magnus effect</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note="right" fig={fig} title={title} hint={hint} readout="THE LAB" readoutRef={readRef} note={phase==='intro'||phase==='score'?null:note} banner={banner} cover={cover}>
   {phase==='figure'&&<FigureStage spec={curve.spec} active={figLit} reduced={reduced} onLabel={touchCurve} handle={figHandle} top={28}
    label="A spinning ball, a wall of three blocks and a goal: the spin, the air flow, the force and the curve path"
    extra={<button type="button" className={fs.pill} aria-pressed={curl===-1} data-fig-curl={curl===1?'right':'left'} onClick={flipCurl}>{curl===1?'Curl right':'Curl left'}</button>}/>}
   <div ref={stageRef} className={`${s.stage} ${bc.stage}`} tabIndex={0} role="application" aria-label={label} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
    data-stage={phase} data-active={active??undefined}>
    {(phase==='tunnel'||phase==='intro')&&PT&&<Tunnel P={PT} w={box.w} h={box.h} v={{fan,spin,phase:T.phase,yaw:T.yaw,flow:T.flow,active,showForce:true}}/>}
    {phase==='launch'&&PL&&<Lane P={PL} w={box.w} h={box.h} v={lane}/>}
    {(phase==='apart'||phase==='score')&&PB&&<Exploded P={PB} w={box.w} h={box.h} e={ex.current.e} yaw={yaw.current} focus={focus}/>}
    {overlay}{labels}{badges}
   </div>
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="bc-story">
   <p className={g.kicker}>The science</p>
   <h2 id="bc-story" className={g.h2}>Spin, air, and a push to one side</h2>
   <ol className={g.steps}>{exhibit.facts.map((t,i)=><li key={t}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{t}</p></li>)}</ol>
   <ol className={g.steps}>{MORE.map(m=><li key={m.tag}><span>{m.tag}</span><p className={g.body}>{m.text}</p></li>)}</ol>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

function EndArt(){
 return <svg viewBox="0 0 120 80" aria-hidden="true"><path d="M12 70Q40 70 66 46T110 14" fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="4 4"/>
  <circle cx={14} cy={68} r={7} fill="none" stroke="#1d1d1b" strokeWidth="2"/><circle cx={108} cy={15} r={5} fill={ACCENT}/></svg>;
}
