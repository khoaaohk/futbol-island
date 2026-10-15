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
import {local,toFloor,easeInOut,easeOut,follow} from '../anatomy/paper-kit';
import {iso} from '../anatomy/iso-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {ACCENT,BEATS,CHALLENGES,CHECKS,HISTORY,MODEL_NOTE,PART_NAME,PART_TEXT,RESULT_TEXT,SOURCES,VIA_WORD} from './content';
import {CHALLENGE,CHALLENGE_IDS,CREEP,DRAG,LIFT,SOLUTION,SPOT,START,WALL_MIN,PARTS,AIM,atWall,cockOf,curveOf,flight,kick,kmh,passes,refFix,speedOf,wallAim,wallFor,wallGeom,wallLegal,
 type Controls,type KickResult,type PartId,type Via,type Wall} from './model';
import {Bench,CTL,W,leverAxis,leverTip,partAnchors,pinAt,useBenchProjection,type BenchView} from './Bench';
import {alongPath,knobValue} from './rig-parts';
import fk from './fk.module.css';

/**
 * free-kick-wall · "Free kicks and the wall" (Oct 14 2026 REDO; user: "the new exhibits don't look great … make it possible to
 * turn knobs and things to make it do something … the stadiums did a great job of showing the breakdown of the layers").
 * One crafted instrument fills the card: THE FREE-KICK TEST BENCH (Bench.tsx), a scale pitch with a kicking rig and a control desk.
 *  1. Intro (the card's cover) and ONE centred start button in the dock.
 *  2. TEN YARDS: the wall has crept in to 7.4 m. Roll the referee's measuring wheel (the dock button, the wheel, Enter) or drag
 *     the wall's carriage: the wheel clicks out 9.15 m, the can sprays the foam line, the wall is pushed back on its rail.
 *  3. THREE FREE KICKS, each against a different wall: over a standing wall, round a jumping wall, under a jumping wall. The
 *     controls are on the bench: the POWER knob winds the leg's spring (the dial reads the ball speed), the LIFT lever, the CONTACT
 *     pin on the printed ball (left of the middle = it curves right), the TURNTABLE aims the leg. The dashed trace previews the
 *     flight as far as the wall; the height staff's telltale records how high the ball went past the wall.
 *  4. TAKE THE WALL APART (the breakdown, like the stadiums): a slider pulls the wall into its five parts (the foam line, the
 *     players, the jump, the player lying down, the 1 m gap), each numbered with a leader line and its one line of why.
 *  5. Score + quick check (StepCheck) → Ending → onComplete once.
 * Heat: React redraws on a change; the shared Paper loop (anatomy/paper-loop.ts) runs only while the wheel rolls, a kick flies or
 * the wall comes apart, sleeps off-screen and in a hidden tab; 0 frames at rest. Reduced motion: every motion lands at once.
 */
type Phase='intro'|'measure'|'kick'|'apart'|'score';
type Ctl='power'|'lift'|'contact'|'aim'|'wall';
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const MEASURE_T=3.3,SLOW=1.5,KICK_T0=.16;
const STEP:Record<Ctl,number>={power:.05,lift:1,contact:.05,aim:1,wall:.25};
const MEASURE_WALL:Wall={n:4,dist:CREEP,aim:wallAim(4),jump:false,lying:false};
type Fly={t:number;r:ReturnType<typeof kick>;c:Controls;wallT:number};
const curveWord=(c:number)=>Math.abs(c)<.05?'no curl':`curls ${curveOf(c)>0?'right':'left'}`;
/** Ground distance (m) covered after τ seconds, slowing with drag (the inverse of model.timeAt). */
const distAt=(tau:number,vh:number)=>Math.log(1+DRAG*vh*tau)/DRAG;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');const phaseRef=useRef(phase);phaseRef.current=phase;
 const [,bump]=useReducer((n:number)=>n+1,0);
 const cardRef=useRef<HTMLDivElement>(null),stageRef=useRef<HTMLDivElement>(null),readRef=useRef<HTMLSpanElement>(null);
 const [box,setBox]=useState({w:0,h:0});
 useEffect(()=>{const el=stageRef.current;if(!el)return;const read=()=>{const r=el.getBoundingClientRect();setBox(b=>Math.round(r.width)===b.w&&Math.round(r.height)===b.h?b:{w:Math.round(r.width),h:Math.round(r.height)});};read();
  if(typeof ResizeObserver==='undefined'){addEventListener('resize',read);return()=>removeEventListener('resize',read);}const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[]);
 const [top,setTop]=useState(40);
 const [c,setC]=useState<Controls>(START);
 const [wall,setWall]=useState<Wall>(MEASURE_WALL);
 const [sprayed,setSprayed]=useState(false),[measured,setMeasured]=useState(false);
 const [ci,setCi]=useState(0),[tries,setTries]=useState([0,0,0]),[passed,setPassed]=useState([false,false,false]);
 const [last,setLast]=useState<{result:KickResult;via:Via|null;pass:boolean;r:ReturnType<typeof kick>}|null>(null);
 const [active,setActive]=useState<Ctl|null>(null);
 const [apart,setApart]=useState(0),[focus,setFocus]=useState<PartId|null>(null);
 const [checked,setChecked]=useState(false),[games,setGames]=useState(0);
 const meas=useRef<{t:number;from:number}|null>(null),fly=useRef<Fly|null>(null),ex=useRef({e:0,eT:0});
 const telltale=useRef<number|null>(null);
 const said=useRef('');const say=(t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;};
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k);},[onClose]);

 const mode=phase==='apart'?'apart':'bench';
 const P=useBenchProjection(box.w,box.h,top,34,mode,wall);
 useEffect(()=>{if(cardRef.current?.querySelector('[data-paper-note]'))setTop(noteSpace(cardRef.current,40));},[phase,box.w,box.h,ci,last,measured]);
 const cid=CHALLENGE_IDS[Math.min(ci,2)],ch=CHALLENGES[cid];

 // ── The one loop: the measuring wheel, a kick in flight, the wall coming apart. It stops when all three are at rest. ──
 const loop=usePaperLoop(dt=>{let more=false;
  const m=meas.current;if(m){m.t=Math.min(MEASURE_T,m.t+dt);const e=easeInOut(clamp((m.t-2.4)/.8,0,1));
   setWall(w=>({...w,dist:m.from+(Math.max(m.from,WALL_MIN)-m.from)*e}));
   say(`MEASURING ${(WALL_MIN*easeInOut(clamp(m.t/1.6,0,1))).toFixed(2)} M`);
   if(m.t>=MEASURE_T){meas.current=null;setSprayed(true);setMeasured(true);setWall(w=>refFix(w));sfx(museumSfx.whistle);say('9.15 M · TEN YARDS');}else more=true;}
  const f=fly.current;if(f){f.t+=dt;const tau=(f.t-KICK_T0)/SLOW,d=tau>0?distAt(tau,f.r.vh):0,i=Math.floor(d/.2);
   if(f.r.wall&&i>=f.r.wall.i&&telltale.current==null){telltale.current=f.r.wallZ;}
   const tEnd=KICK_T0+SLOW*((Math.exp(DRAG*f.r.pts[f.r.stop].d)-1)/(DRAG*f.r.vh))+.55;
   if(f.t>=tEnd){fly.current=null;land(f);}else more=true;}
  const X=ex.current;if(X.e!==X.eT){X.e=follow(X.e,X.eT,dt,.22,.002);if(X.e===X.eT)setApart(X.e);else more=true;}
  bump();return more;},stageRef,reduced);

 // ── Ten yards ──
 const startMeasure=()=>{unlockMuseumAudio();sfx(museumSfx.whistle);setPhase('measure');setWall(MEASURE_WALL);setSprayed(false);setMeasured(false);say('WALL 7.40 M');};
 const rollWheel=()=>{if(meas.current||measured)return;unlockMuseumAudio();meas.current={t:0,from:wall.dist};sfx(museumSfx.click);loop.wake();};
 // ── Kicks ──
 const loadChallenge=(i:number)=>{const id=CHALLENGE_IDS[i];setCi(i);setWall(wallFor(id));setLast(null);telltale.current=null;setPhase('kick');sfx(museumSfx.whistle);say(`FREE KICK ${i+1} / 3`);};
 const shoot=()=>{if(fly.current||phase!=='kick')return;unlockMuseumAudio();const r=kick(c,wall);telltale.current=null;
  fly.current={t:0,r,c,wallT:r.wall?(Math.exp(DRAG*r.wall.p.d)-1)/(DRAG*r.vh):9};setLast(null);sfx(museumSfx.kick);
  setTries(t=>{const n=[...t];n[ci]++;return n;});loop.wake();};
 function land(f:Fly){const r=f.r,pass=passes(cid,r);setLast({result:r.result,via:r.via,pass,r});
  if(pass){setPassed(p=>{const n=[...p];n[ci]=true;return n;});if(cid==='under')setWall(w=>({...w,lying:true}));sfx(museumSfx.net);sfx(museumSfx.crowd);}
  else sfx(r.result==='goal'?museumSfx.net:r.result==='blocked'||r.result==='post'||r.result==='bar'?museumSfx.stamp:museumSfx.look);
  say(r.result==='goal'?`GOAL · ${r.via?VIA_WORD[r.via].toUpperCase():''}`:RESULT_TEXT[r.result].big.toUpperCase());}
 const showMe=()=>{setC(SOLUTION[cid]);setLast(null);sfx(museumSfx.tick);};
 const next=()=>{if(ci<2)loadChallenge(ci+1);else startApart();};
 // ── The wall apart ──
 const startApart=()=>{setPhase('apart');setWall({...wallFor('under'),lying:true});setFocus(null);ex.current={e:0,eT:0};setApart(0);sfx(museumSfx.reveal);
  if(reduced){ex.current={e:1,eT:1};setApart(1);}else{ex.current.eT=1;setTimeout(()=>loop.wake(),300);}};
 const setE=(x:number,ease:boolean)=>{const X=ex.current;X.eT=clamp(x,0,1);if(!ease||reduced){X.e=X.eT;setApart(X.e);}else loop.wake();};
 const toScore=()=>{sfx(museumSfx.whistle);setPhase('score');};
 const again=()=>{setC(START);setTries([0,0,0]);setPassed([false,false,false]);setGames(n=>n+1);setChecked(false);loadChallenge(0);};

 // ── Controls: drag (pointer) and arrow keys ──
 const ctlRef=useRef<{id:Ctl;pid:number;x0:number;y0:number;v0:number;a0:number}|null>(null);
 const valueOf=(id:Ctl)=>id==='wall'?wall.dist:c[id];
 const setCtl=(id:Ctl,raw:number)=>{
  if(id==='wall'){const d=clamp(Math.round(raw/STEP.wall)*STEP.wall,4,13.5);if(d!==wall.dist){setWall(w=>({...w,dist:d}));sfx(museumSfx.tick);}say(`WALL ${d.toFixed(2)} M`);return;}
  const lim:Record<'power'|'lift'|'contact'|'aim',[number,number]>={power:[0,1],lift:[LIFT[0],LIFT[1]],contact:[-1,1],aim:[AIM[0],AIM[1]]};
  const st=STEP[id],v=clamp(Math.round(raw/st)*st,lim[id][0],lim[id][1]);
  if(Math.abs(v-c[id])>1e-9){setC(o=>({...o,[id]:v}));setLast(null);telltale.current=null;sfx(museumSfx.tick);}};
 const locked=()=>!!fly.current||!!meas.current;
 const worldAngle=(sx:number,sy:number)=>{if(!P)return 0;const [x,y]=toFloor(sx,sy,P,2.8);return Math.atan2(y-W(SPOT.x,SPOT.y)[1],x-W(SPOT.x,SPOT.y)[0]);};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{const t=(e.target as Element).closest?.('[data-ctl]') as HTMLElement|SVGElement|null;
  if(!t||!P||locked())return;const id=t.getAttribute('data-ctl') as Ctl;if(id==='wall'&&phase!=='measure')return;if(id!=='wall'&&phase!=='kick')return;
  unlockMuseumAudio();const [x,y]=local(e,e.currentTarget);ctlRef.current={id,pid:e.pointerId,x0:x,y0:y,v0:valueOf(id),a0:worldAngle(x,y)};setActive(id);
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}e.preventDefault();if(id==='power')setCtl('power',knobValue(CTL.power,P,x,y));};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=ctlRef.current;if(!d||d.pid!==e.pointerId||!P)return;const [x,y]=local(e,e.currentTarget),dx=x-d.x0,dy=y-d.y0;
  if(d.id==='power')setCtl('power',knobValue(CTL.power,P,x,y));
  else if(d.id==='lift')setCtl('lift',alongPath(v=>iso(leverTip(v,leverAxis(P)),P),d.v0,dx,dy,.5));
  else if(d.id==='contact')setCtl('contact',alongPath(v=>iso(pinAt(v),P),d.v0,dx,dy));
  else if(d.id==='wall'){const g0=wallGeom(wall);setCtl('wall',alongPath(m=>iso(W(SPOT.x+g0.u.x*m,SPOT.y+g0.u.y*m),P),d.v0,dx,dy,.1));}
  else{let da=worldAngle(x,y)-d.a0;da=Math.atan2(Math.sin(da),Math.cos(da));setCtl('aim',aimTurn(d.v0,da));}};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=ctlRef.current;if(!d||d.pid!==e.pointerId)return;ctlRef.current=null;setActive(null);
  if(d.id==='wall'&&!wallLegal(wall)&&!measured)rollWheel();};
 const onKey=(e:KeyboardEvent<HTMLElement>)=>{const k=e.key,el=e.target as Element,btn=el instanceof HTMLButtonElement||el instanceof HTMLInputElement;if(btn)return;
  const id=el.getAttribute?.('data-ctl') as Ctl|null;
  if(id&&(k.startsWith('Arrow'))&&!locked()){e.preventDefault();const dir=k==='ArrowLeft'||k==='ArrowDown'?-1:1,big=e.shiftKey?4:1;
   if(id==='wall'){if(phase==='measure'){setCtl('wall',wall.dist+dir*STEP.wall*big);}}
   else if(phase==='kick')setCtl(id,c[id]+dir*STEP[id]*big);return;}
  if(k==='Enter'||k===' '){if(phase==='measure'&&!measured){e.preventDefault();rollWheel();}else if(phase==='kick'&&!last?.pass){e.preventDefault();shoot();}}};

 // ── What the bench shows right now ──
 const f=fly.current,prev=useMemo(()=>flight(c),[c]);
 const preUpto=useMemo(()=>{const w=atWall(prev.pts,wall);return w?Math.min(prev.pts.length,w.i+8):prev.pts.length;},[prev,wall]);
 let ball:BenchView['ball']=null,trace:BenchView['trace']=null,leg=cockOf(c.power),jump=0,dive=0;
 const r=f?.r??last?.r??null;
 if(phase==='kick'){
  if(f){const tau=(f.t-KICK_T0)/SLOW,d=tau>0?distAt(tau,f.r.vh):0,i=Math.min(f.r.stop,Math.floor(d/.2));
   ball=tau>0?f.r.pts[i]:null;trace={pts:f.r.pts,upto:i+1,preview:false};
   const ck=cockOf(f.c.power);leg=f.t<KICK_T0?ck*(1-easeOut(f.t/KICK_T0)**2):f.t<.42?-30*Math.sin(Math.min(1,(f.t-KICK_T0)/.26)*Math.PI/2):-30+(30+ck)*easeInOut(clamp((f.t-.42)/.9,0,1));
   if(wall.jump&&tau>0){const tw=f.wallT;jump=tau<tw?easeOut(Math.min(1,tau/.22)):1-easeInOut(clamp((tau-tw-.12)/.35,0,1));}
   const T=f.r.time,want=f.r.result==='blocked'?0:clamp(f.r.end.x-f.r.keeperX,-f.r.reach,f.r.reach);dive=want*easeInOut(clamp((tau-.3)/Math.max(.2,T-.3),0,1));}
  else if(last){const R=last.r;ball=R.pts[R.stop];trace={pts:R.pts,upto:R.stop+1,preview:false};dive=R.result==='blocked'?0:clamp(R.end.x-R.keeperX,-R.reach,R.reach);}
  else trace={pts:prev.pts,upto:preUpto,preview:true};
 }
 const kx=r?.keeperX??(phase==='kick'?kick(c,wall).keeperX:1.6);
 const view:BenchView={c,wall,leg,ball,trace,keeper:{x:kx,dive},jump,
  measure:meas.current?{m:.6+(WALL_MIN-.6)*easeInOut(clamp(meas.current.t/1.6,0,1)),spray:clamp((meas.current.t-1.7)/.7,0,1)}:phase==='measure'&&!measured?{m:.6,spray:0}:null,
  sprayed,telltale:phase==='kick'?telltale.current:null,apart:phase==='apart'?ex.current.e:0,focus,active,mode,showLying:wall.lying,
  hot:phase==='measure'&&!measured?['wall']:[]};

 // Readout (the corner): the instrument's live numbers.
 useEffect(()=>{if(meas.current||fly.current)return;
  if(phase==='measure')say(measured?'9.15 M · TEN YARDS':`WALL ${wall.dist.toFixed(2)} M · TOO CLOSE`);
  else if(phase==='kick'&&!last)say(`${kmh(speedOf(c.power))} KM/H · LIFT ${Math.round(c.lift)}° · ${curveWord(c.contact).toUpperCase()}`);
  else if(phase==='kick'&&last&&last.r.wallZ!=null)say(`${last.r.wallZ.toFixed(2)} M AT THE WALL · ${RESULT_TEXT[last.result].big.toUpperCase()}`);
  else if(phase==='apart')say(`${Math.round(apart*100)}% APART`);});

 const goals=passed.filter(Boolean).length,allTries=tries.reduce((a,b)=>a+b,0);
 const items:CheckItem[]=useMemo(()=>CHECKS.map(q=>({q:q.q,options:q.options,right:q.right,why:q.why})),[]);
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const misses=tries[ci]-(passed[ci]?1:0);
 const wide=box.w/Math.max(1,box.h)>1.1;

 const note=phase==='measure'?(measured?null:<><span className={s.tag} data-tone="acc">Ten yards</span>The wall has crept in to <b>{wall.dist.toFixed(1)} m</b>. Roll the referee’s measuring wheel out to 9.15 m.</>)
  :phase==='kick'&&!f&&!last?<><span className={s.tag} data-tone="acc">{ci+1} · {ch.name}</span>{ch.goal}{misses>=2&&<> <b>Tip:</b> {ch.tip}</>}</>
    :phase==='apart'&&!wide?<><span className={s.tag} data-tone="acc">Take the wall apart</span>Slide it apart, then tap a number to read each part.</>:null;
 const banner=phase==='measure'&&measured?<Banner kind="good" big="Ten yards: 9.15 m" line="The referee rolled out 9.15 m, sprayed the foam line and moved the wall back to it (Law 13)."/>
  :phase==='kick'&&last?(last.pass?<Banner kind="good" big={`Goal! ${VIA_WORD[CHALLENGE[cid].via]}`} line={ch.win}/>
   :last.result==='goal'?<Banner kind="ok" big={`Goal, ${last.via?VIA_WORD[last.via]:''}`} line={ch.other}/>
   :<Banner kind={RESULT_TEXT[last.result].kind} big={RESULT_TEXT[last.result].big} line={RESULT_TEXT[last.result].line}/>):null;

 const cover=phase==='intro'?<IntroPanel kicker={<>Skills &amp; science · {exhibit.year}</>} title={<>Free kicks and <em>the wall</em></>} deck={exhibit.facts[0]} beats={BEATS}/>
  :phase==='score'?<ScoreCover kicker="Three free kicks" score={`${goals}/3`} unit={`walls beaten · ${allTries} ${allTries===1?'kick':'kicks'}`}
    notes={<><p><b>{goals===3?'A free-kick expert!':goals>=1?'You beat the wall.':'Walls are hard to beat.'}</b> Over it, round it, or under it when it jumps: every wall leaves one way open, and every new trick gets a new answer.</p>
     <p>{exhibit.facts[1]}</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-fk-again onClick={again}>Play again</button>
     <button type="button" className={s.ghost} data-fk-reapart onClick={startApart}>Take the wall apart again</button></>}>
    <StepCheck key={games} items={items} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You measured ten yards, beat three walls and took one apart." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const title=phase==='measure'?'Ten yards':phase==='kick'?`Free kick ${ci+1} of 3`:phase==='apart'?'The wall, taken apart':'The free-kick bench';
 const hint=phase==='kick'?'Turn the knob · pull the lever · slide the pin · turn the table':phase==='measure'?'Roll the wheel · or drag the wall':phase==='apart'?'Slide it apart · tap a number':'Free-kick test bench';
 const label=phase==='apart'?`The wall taken apart: ${PARTS.map(p=>PART_NAME[p]).join(', ')}.`
  :`A free-kick test bench: a scale pitch with a goal, a keeper on a sprung carriage, a wall of ${wall.n} on a rail ${wall.dist.toFixed(1)} metres from the ball${wall.jump?' that jumps':''}, and a kicking leg on a turntable. Power ${kmh(speedOf(c.power))} km/h, lift ${Math.round(c.lift)} degrees, ${curveWord(c.contact)}, aimed ${Math.abs(Math.round(c.aim))} degrees ${c.aim<0?'left':'right'}.`;

 // the breakdown's numbered parts: a column of labels with leader lines (wide), or numbered badges and a caption (phone)
 const anchors=phase==='apart'&&P?partAnchors(P,wall,ex.current.e):null;
 const showParts=!!anchors&&ex.current.e>.35;
 const colX=box.w-Math.min(330,box.w*.3)+8,rowH=Math.max(70,Math.min(140,(box.h-top-50)/5));
 const labelY=(i:number)=>top+16+i*rowH;
 const order=anchors?[...PARTS].sort((a,b)=>anchors[a][1]-anchors[b][1]):PARTS;
 const overlay=showParts&&anchors?<svg className={fk.over} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
  {order.map((id,i)=>{const a=anchors[id],n=PARTS.indexOf(id)+1;
   if(wide){const y=labelY(i)+11;return <g key={id} data-on={focus===id||undefined}><path className={fk.leader} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${(colX-26).toFixed(1)} ${y.toFixed(1)}L${(colX+2).toFixed(1)} ${y.toFixed(1)}`}/>
    <circle className={fk.leaderEnd} cx={a[0]} cy={a[1]} r={3.2}/></g>;}
   return <g key={id} className={fk.badge} data-on={focus===id||undefined}><circle cx={a[0]} cy={a[1]} r={14}/><text x={a[0]} y={a[1]+4.5}>{n}</text></g>;})}
 </svg>:null;
 const badges=showParts&&anchors&&!wide?order.map(id=>{const a=anchors[id];return <button key={id} type="button" className={fk.badgeHit} style={{left:a[0]-22,top:a[1]-22}} aria-label={`${PARTS.indexOf(id)+1}: ${PART_NAME[id]}`}
  aria-pressed={focus===id} data-part={id} onClick={()=>{setFocus(id);sfx(museumSfx.tick);}}/>;}):null;
 const labels=showParts&&wide?order.map((id,i)=><button key={id} type="button" className={fk.label} style={{left:colX+8,top:labelY(i),width:Math.min(310,box.w*.3)-24} as CSSProperties} data-part-label={id} aria-pressed={focus===id}
  onClick={()=>setFocus(x=>x===id?null:id)}><b><i>{PARTS.indexOf(id)+1}</i>{PART_NAME[id]}</b><span>{PART_TEXT[id]}</span></button>):null;

 const dock=phase==='intro'?<StartDock label="Open the bench" line="Measure ten yards, beat three walls, then take the wall apart." onStart={startMeasure}/>
  :phase==='measure'?<div className={s.row}>
    {measured?<button type="button" className={s.btn} data-tone="acc" data-fk-to-kick onClick={()=>loadChallenge(0)}>Take the free kicks</button>
     :<button type="button" className={s.btn} data-tone="acc" data-fk-measure disabled={!!meas.current} onClick={rollWheel}>Roll out ten yards</button>}
    <span className={s.grow}><Chips items={[{k:'wall',label:'Wall',value:`${wall.dist.toFixed(2)} m`},{k:'law',label:'Law 13',value:'9.15 m'}]}/></span>
   </div>
  :phase==='kick'?<>
   <div className={s.row}>
    <Pips results={passed.map((p,i)=>p?'good':i<ci?'miss':undefined)} total={3} label={`${goals} of 3 walls beaten`}/>
    <span className={s.grow}><Chips items={[{k:'speed',label:'Speed',value:`${kmh(speedOf(c.power))} km/h`},{k:'lift',label:'Lift',value:`${Math.round(c.lift)}°`},{k:'curl',label:'Spin',value:Math.abs(c.contact)<.05?'none':curveOf(c.contact)>0?'curls right':'curls left'}]}/></span>
   </div>
   <div className={s.row}>
    {last?.pass?<button type="button" className={s.btn} data-tone="acc" data-fk-next onClick={next}>{ci<2?'Next free kick':'Take the wall apart'}</button>
     :<button type="button" className={`${s.btn} ${fk.kick}`} data-tone="acc" data-fk-shoot disabled={!!f} onClick={shoot}>Kick</button>}
    {!last?.pass&&misses>=3&&<button type="button" className={s.ghost} data-fk-show disabled={!!f} onClick={showMe}>Show me</button>}
    {!last?.pass&&misses>=5&&<button type="button" className={s.ghost} data-fk-skip disabled={!!f} onClick={next}>Skip</button>}
   </div></>
  :phase==='apart'?<>
   <div className={s.row}>
    <label className={fk.slider}><span>Take it apart</span><input type="range" min={0} max={100} step={1} value={Math.round(apart*100)} data-apart-slider aria-valuetext={`${Math.round(apart*100)}% apart`}
     onChange={e=>{const x=Number(e.currentTarget.value)/100;setE(x,false);}}/></label>
    <button type="button" className={s.ghost} data-fk-explode onClick={()=>{setE(ex.current.eT>.5?0:1,true);sfx(museumSfx.reveal);}}>{apart>.5?'Put it together':'Pull it apart'}</button>
    <button type="button" className={s.btn} data-tone="acc" data-fk-score onClick={toScore}>Quick check</button>
   </div>
   {!wide&&<p className={s.say} data-caption aria-live="polite">{focus?<><b>{PARTS.indexOf(focus)+1} · {PART_NAME[focus]}.</b> {PART_TEXT[focus]}</>:showParts?'Tap a number to read how that part works.':'Slide it apart to see the parts.'}</p>}
  </>:null;

 return <PaperRoom id="free-kick-wall" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose} onKeyDown={onKey}
  rootProps={{'data-phase':phase,'data-wall':`${wall.n},${wall.dist.toFixed(2)},${wall.jump?'jump':'stand'}`,'data-measured':measured||undefined,'data-challenge':phase==='kick'?cid:undefined,
   'data-passed':passed.map(Number).join(''),'data-last':last?.result,'data-via':last?.via??undefined,'data-flying':!!f||undefined,'data-apart':apart.toFixed(2),
   'data-controls':`${c.power.toFixed(2)},${c.lift},${c.contact.toFixed(2)},${c.aim}`,'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Skills &amp; science</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note="right" fig="Fig. 9.15 m" title={title} hint={hint} readout="THE BENCH" readoutRef={readRef} note={phase==='intro'||phase==='score'?null:note} banner={banner} cover={cover}>
   <div ref={stageRef} className={`${s.stage} ${fk.stage}`} tabIndex={0} role="application" aria-label={label} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
    data-stage={phase} data-active={active??undefined}>
    {P&&<Bench P={P} w={box.w} h={box.h} v={view}/>}
    {overlay}{labels}{badges}
    {phase==='measure'&&!measured&&P&&!meas.current&&<button type="button" className={fk.wheelHit} aria-label="Roll the measuring wheel out to 9.15 metres" data-fk-wheel onClick={rollWheel}
     style={(()=>{const g0=wallGeom(wall),p=iso(W(SPOT.x+g0.u.x*.6+g0.side.x*-(g0.half+1.1),SPOT.y+g0.u.y*.6-g0.side.y*(g0.half+1.1),.56),P);return {left:p[0]-24,top:p[1]-24};})()}><span/></button>}
   </div>
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="fk-story">
   <p className={g.kicker}>The Laws</p>
   <h2 id="fk-story" className={g.h2}>Ten yards, one metre, and a raised arm</h2>
   <ol className={g.steps}>{exhibit.facts.map((t,i)=><li key={t}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{t}</p></li>)}</ol>
   <p className={g.kicker}>How the free kick grew up</p>
   <ol className={g.steps}>{HISTORY.map(h=><li key={h.tag}><span>{h.tag}</span><p className={g.body}>{h.text}</p></li>)}</ol>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The turntable turned by a world angle da (radians) from a starting aim: the new aim in degrees. */
function aimTurn(aim0:number,da:number){
 const u0=Math.atan2(-SPOT.y,(SPOT.y*Math.tan(aim0*Math.PI/180)));// the aim direction in pitch metres (x across, y out)
 // a world angle turns the pitch direction the same way round
 const u=u0+da,dx=Math.cos(u),dy=Math.sin(u);if(dy>=-.05)return aim0;
 return Math.atan2(dx,-dy)*180/Math.PI;
}

function EndArt(){
 return <svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 70V14H110V70" fill="none" stroke="#1d1d1b" strokeWidth="2"/><line x1="0" x2="120" y1="70" y2="70" stroke="#1d1d1b" strokeWidth="1"/>
  {[0,1,2,3].map(i=><circle key={i} cx={30+i*9} cy={62} r={4} fill="#1d1d1b"/>)}<path d="M20 78Q50 0 98 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 3"/><circle cx={98} cy={24} r={6} fill={ACCENT}/></svg>;
}
