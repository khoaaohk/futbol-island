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
import {Machine,LEVER_LEN,S,layoutFor,leverHandle,projFor,switchHandle,type Ctl,type View} from './Machine';
import {angleAt,toFrame} from './rig';
import {DEPTH_RANGE,ERA_ANGLES,ERAS,KNOWN,LIFT_ANGLES,SWITCH_ANGLES,TASKS,WIDTH_RANGE,YOUTH,eraIndex,factorOf,lineNames,liftOfLever,readShape,snapHole,swarm,tOf,warp,
 type Mode,type Pt,type TaskId} from './model';
import {BALANCE,QUIZ,SOURCES} from './content';
import f from './machine.module.css';

/**
 * formations-history · "Formations through time" (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it
 * do something", "the stadiums did a great job of showing the breakdown of the layers"). ONE object fills the card: THE TACTICS
 * MACHINE (Machine.tsx), a pegboard tactics table with brass controls.
 *  1. Intro over the card (IntroPanel); ONE centred start button (StartDock).
 *  2. The machine. Every control does something:
 *     - the ERA SELECTOR (drag round, six detents; arrows): 2-3-5 → WM → 4-2-4 → 4-4-2 → 4-3-3 → 4-2-3-1, the pegs hop into each;
 *     - the WIDTH and DEPTH sliders (drag; arrows): squeeze or stretch the shape; the WIDTH, DEPTH and GAP needles leave the green;
 *     - the LIFT lever (drag or tap; Enter): the lines rise apart on labelled trays (defence, midfield, attack) and snap back;
 *     - the HISTORY / BUILD switch (tap; Enter): in BUILD the pegs are yours (drag them hole to hole, or focus one and use arrows).
 *     Four tasks open the quick check.
 *  3. Quick check (StepCheck) → Ending → onComplete once (Ending `reached`).
 * Heat: SVG only. The one shared loop (anatomy/paper-loop.ts) runs while pegs hop, a control eases or a drag is live; 0 frames at
 * rest; parked off screen. Reduced motion: every move lands at once.
 */
type Phase='intro'|'play'|'check';
const W0=tOf(1,WIDTH_RANGE),D0=tOf(1,DEPTH_RANGE);
const ease=(u:number)=>u<.5?2*u*u:1-(-2*u+2)**2/2;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [done,setDone]=useState<TaskId[]>([]),[visited,setVisited]=useState<number[]>([0]),[focus,setFocus]=useState<Ctl|null>(null),[checked,setChecked]=useState(false);
 const [,bump]=useReducer((n:number)=>n+1,0);
 const cardRef=useRef<HTMLDivElement>(null),[stageRef,box]=useBox<HTMLDivElement>();
 const m=useRef({mode:'history' as Mode,era:0,knob:ERA_ANGLES[0],knobT:ERA_ANGLES[0],lever:LIFT_ANGLES[0] as number,leverT:LIFT_ANGLES[0] as number,sw:SWITCH_ANGLES.history,swT:SWITCH_ANGLES.history,
  wT:W0,wTT:W0,dT:D0,dTT:D0,from:null as Pt[]|null,p:1,built:swarm(),moved:false,
  drag:null as null|{c:Ctl;id:number;moved:boolean;x:number;y:number;last:number}});
 const ui=useRef({done,visited});ui.current={done,visited};

 const wide=box.w>=640&&box.w/Math.max(1,box.h)>1.08;
 const L=useMemo(()=>layoutFor(wide),[wide]);
 const [top,setTop]=useState(40);
 useEffect(()=>{setTop(noteSpace(cardRef.current,40));},[box.w,box.h,phase,done.length]);
 const P=useMemo(()=>box.w>0?projFor(L,box.w,box.h,top,wide?30:22):null,[L,box.w,box.h,top,wide]);

 const tick=(t:TaskId)=>setDone(d=>d.includes(t)?d:(museumSfx.stamp(),[...d,t]));
 const target=():Pt[]=>{const st=m.current;return st.mode==='build'?st.built:warp(ERAS[st.era].pts,factorOf(st.wT,WIDTH_RANGE),factorOf(st.dT,DEPTH_RANGE));};
 const shown=():Pt[]=>{const st=m.current,to=target();if(!st.from||st.p>=1)return to;const u=ease(st.p);return to.map((q,i)=>({x:st.from![i].x+(q.x-st.from![i].x)*u,y:st.from![i].y+(q.y-st.from![i].y)*u}));};
 const hopTo=()=>{const st=m.current;st.from=shown().map(p=>({...p}));st.p=reduced?1:0;};

 const loop=usePaperLoop(dt=>{const st=m.current,dr=st.drag?.c;let mv=false;
  if(st.p<1){st.p=Math.min(1,st.p+dt/.55);mv=true;if(st.p>=1){st.from=null;museumSfx.tick();}}
  if(dr!=='knob'&&st.knob!==st.knobT){st.knob=follow(st.knob,st.knobT,dt,.07,.05);mv=mv||st.knob!==st.knobT;}
  if(dr!=='lever'&&st.lever!==st.leverT){st.lever=follow(st.lever,st.leverT,dt,.12,.05);mv=mv||st.lever!==st.leverT;}
  if(dr!=='switch'&&st.sw!==st.swT){st.sw=follow(st.sw,st.swT,dt,.05,.05);mv=mv||st.sw!==st.swT;}
  if(dr!=='width'&&st.wT!==st.wTT){st.wT=follow(st.wT,st.wTT,dt,.08,.002);mv=mv||st.wT!==st.wTT;}
  if(dr!=='depth'&&st.dT!==st.dTT){st.dT=follow(st.dT,st.dTT,dt,.08,.002);mv=mv||st.dT!==st.dTT;}
  bump();return mv;},cardRef,reduced);
 const wake=()=>{loop.wake();bump();};

 // ── what each control does
 const setEra=(i:number)=>{const st=m.current,n=clamp(i,0,ERAS.length-1);if(st.mode==='build'){lockedKnob();return;}
  if(n!==st.era){hopTo();st.era=n;museumSfx.flap();const v0=ui.current.visited,nv=v0.includes(n)?v0:[...v0,n];ui.current.visited=nv;setVisited(nv);if(nv.length>=4)tick('eras');}wake();};
 const lockedKnob=()=>{setNote('The era knob is locked in BUILD. Flip the switch back to HISTORY to turn it.');museumSfx.look();};
 const [note,setNote]=useState<string|null>(null);
 const setSlider=(c:'width'|'depth',t:number,ease2=false)=>{const st=m.current;if(st.mode==='build'){setNote('The sliders work on the famous shapes. Flip the switch back to HISTORY to use them.');return;}
  const v=clamp(t,0,1);if(c==='width'){st.wTT=v;if(!ease2)st.wT=v;}else{st.dTT=v;if(!ease2)st.dT=v;}setNote(null);wake();};
 const setLift=(on:boolean)=>{const st=m.current;st.leverT=LIFT_ANGLES[on?1:0];museumSfx.reveal();wake();};
 const setMode=(x:Mode)=>{const st=m.current;st.swT=SWITCH_ANGLES[x];if(x!==st.mode){hopTo();st.mode=x;if(x==='build'){st.built=swarm();st.moved=false;st.knobT=ERA_ANGLES[st.era];}museumSfx.flap();setNote(null);}wake();};
 const resetSliders=()=>{const st=m.current;st.wTT=W0;st.dTT=D0;wake();};

 const svgEl=useRef<Element|null>(null);
 const local=(e:{clientX:number;clientY:number},el:Element):[number,number]=>{const r=el.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 const read=(c:Ctl,sx:number,sy:number)=>{if(!P)return 0;const F=L.F;
  if(c==='knob')return angleAt(F,P,sx,sy,L.knob.a,L.knob.b,11.8,L.up,L.right);
  if(c==='lever'||c==='switch'){const h=c==='lever'?leverHandle(L,m.current.lever):switchHandle(L,m.current.sw),o=c==='lever'?L.lever:L.sw,[pa,pb]=toFrame(F,P,sx,sy,h[2]),d=(pa-o.a)*L.right[0]+(pb-o.b)*L.right[1];
   return Math.asin(clamp(d/(c==='lever'?LEVER_LEN:15),-.62,.62))*180/Math.PI;}
  if(c==='width'){const r=L.wrail,[,pb]=toFrame(F,P,sx,sy,10);return (pb-r.b-8)/(r.len-16);}
  if(c==='depth'){const r=L.drail,[pa]=toFrame(F,P,sx,sy,10);return (pa-r.a-8)/(r.len-16);}
  return 0;};
 const onDown=(c:Ctl,e:RPE<SVGElement>)=>{if(phase!=='play')return;e.preventDefault();const el=(e.currentTarget as SVGElement).ownerSVGElement;if(!el)return;svgEl.current=el;
  try{(e.currentTarget as Element).setPointerCapture?.(e.pointerId);}catch{/* synthetic */}
  const [sx,sy]=local(e,el),st=m.current;if(c==='knob'&&st.mode==='build'){lockedKnob();return;}
  if((c==='width'||c==='depth')&&st.mode==='build'){setSlider(c,0);return;}
  st.drag={c,id:e.pointerId,moved:false,x:sx,y:sy,last:read(c,sx,sy)};};
 const onMove=(e:RPE<HTMLDivElement>)=>{const st=m.current,d=st.drag;if(!d||d.id!==e.pointerId||!svgEl.current||!P)return;const [sx,sy]=local(e,svgEl.current);
  if(Math.hypot(sx-d.x,sy-d.y)>4)d.moved=true;
  if(d.c==='knob'){const v=clamp(read('knob',sx,sy),-150,150);st.knob=st.knobT=v;const n=eraIndex(v);if(n!==st.era)setEra(n);}
  else if(d.c==='lever'){st.lever=st.leverT=clamp(read('lever',sx,sy),LIFT_ANGLES[0],LIFT_ANGLES[1]);}
  else if(d.c==='switch'){st.sw=st.swT=clamp(read('switch',sx,sy),-30,30);}
  else if(d.c==='width'||d.c==='depth'){setSlider(d.c,read(d.c,sx,sy));return;}
  else if(d.c.startsWith('peg')){const i=Number(d.c.slice(3)),[pa,pb]=toFrame(L.F,P,sx,sy,6);st.built=st.built.map((q,j)=>j===i?{x:clamp(pa/S,3,97),y:clamp(pb/S,2,62)}:q);st.moved=true;}
  wake();};
 const onUp=(e:RPE<HTMLDivElement>)=>{const st=m.current,d=st.drag;if(!d||d.id!==e.pointerId)return;st.drag=null;
  if(d.c==='knob'){st.knobT=ERA_ANGLES[st.era];}
  else if(d.c==='lever'){setLift(d.moved?st.lever>0:st.leverT<0);}
  else if(d.c==='switch'){setMode(d.moved?(st.sw>0?'build':'history'):(st.mode==='build'?'history':'build'));}
  else if(d.c.startsWith('peg')){const i=Number(d.c.slice(3));st.built=st.built.map((q,j)=>j===i?snapHole(q):q);museumSfx.tick();}
  wake();};
 const onKey=(c:Ctl,e:RKE<SVGElement>)=>{if(phase!=='play')return;const k=e.key,inc=k==='ArrowRight'||k==='ArrowUp',dec=k==='ArrowLeft'||k==='ArrowDown',press=k==='Enter'||k===' ';
  if(!(inc||dec||press||k==='Home'||k==='End'))return;e.preventDefault();e.stopPropagation();const st=m.current;
  if(c==='knob'){if(inc||dec)setEra(st.era+(inc?1:-1));else if(k==='Home')setEra(0);else if(k==='End')setEra(ERAS.length-1);}
  else if(c==='width'||c==='depth'){const t=c==='width'?st.wTT:st.dTT;setSlider(c,k==='Home'?0:k==='End'?1:press?(c==='width'?W0:D0):t+(inc?.1:-.1),true);}
  else if(c==='lever')setLift(inc?true:dec?false:st.leverT<0);
  else if(c==='switch')setMode(inc?'build':dec?'history':st.mode==='build'?'history':'build');
  else if(c.startsWith('peg')&&!press){const i=Number(c.slice(3)),q=st.built[i];
   const [dx,dy]=wide?(k==='ArrowRight'?[4,0]:k==='ArrowLeft'?[-4,0]:k==='ArrowUp'?[0,-4]:[0,4]):(k==='ArrowUp'?[4,0]:k==='ArrowDown'?[-4,0]:k==='ArrowRight'?[0,4]:[0,-4]);
   st.built=st.built.map((p,j)=>j===i?snapHole({x:q.x+dx,y:q.y+dy}):p);st.moved=true;museumSfx.tick();wake();}};

 // ── this render
 const st=m.current,pos=shown(),reading=readShape(pos),lift=liftOfLever(st.lever),era=ERAS[st.era],hop=st.p<1?7*Math.sin(Math.PI*st.p):0;
 const names=st.mode==='history'&&reading.lines.length===era.lines.length?era.lines:lineNames(reading.lines.length);
 // tasks that follow from what the needles read
 useEffect(()=>{const s0=m.current;
  if(phase!=='play')return;
  if(s0.mode==='history'&&!reading.all&&(Math.abs(s0.wT-W0)>.05||Math.abs(s0.dT-D0)>.05))tick('squeeze');
  if(lift>=.9)tick('lines');
  if(s0.mode==='build'&&s0.moved&&reading.all&&!s0.drag&&s0.p>=1&&reading.lines.length>=2)tick('build');
 });
 const view:View={mode:st.mode,era:st.era,knobDeg:st.knob,wT:st.wT,dT:st.dT,lift,leverDeg:st.lever,switchDeg:st.sw,pos,hop,reading,names,focus};
 const task=TASKS.find(t=>!done.includes(t.id))??null,allDone=done.length>=TASKS.length;
 const aria={knob:{label:'Era selector knob',text:`${era.name}, ${era.shape}, ${era.when}`,now:st.era+1,min:1,max:ERAS.length},
  width:{label:'Width slider',text:`${Math.round(reading.width)} metres wide`,now:Math.round(st.wTT*100),min:0,max:100},
  depth:{label:'Depth slider',text:`${Math.round(reading.depth)} metres deep`,now:Math.round(st.dTT*100),min:0,max:100},
  lever:{label:lift>.5?'Lift lever: lines apart':'Lift lever: lines together',text:''},
  switch:{label:`Mode switch: ${st.mode==='build'?'build your own':'history'}`,text:''}};
 const known=KNOWN[reading.shape];
 const sayNote=phase!=='play'?null:note?<>{note}</>
  :st.mode==='build'?<><b>{reading.lines.length<2?'Your shape: one big bunch.':`Your shape: ${reading.shape}${known&&reading.all&&!known.endsWith(reading.shape)?` (${known})`:''}.`}</b> {reading.say}</>
  :lift>.3?<><b>{era.shape} = {reading.lines.map((l,i)=>`${l.length} ${names[i]?.toLowerCase()}`).join(', ')}.</b> Count the trays from your own goal: that is the formation.</>
  :!reading.all?<><b>{era.name}, squeezed.</b> {reading.say}</>
  :<><b>{era.name} · {era.shape} · {era.when}.</b> {era.who}. {era.why}</>;
 const readout=st.mode==='build'?`BUILD · ${reading.shape}`:`${era.shape} · ${era.when.toUpperCase()}`;
 const label=`The tactics machine. ${st.mode==='build'?`Your own shape reads ${reading.shape}.`:`${era.name}, ${era.shape}.`} Width ${Math.round(reading.width)} metres, depth ${Math.round(reading.depth)} metres, biggest gap ${Math.round(reading.gap)} metres.`;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...SOURCES,...exhibit.sources].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const BEATS=ERAS.slice(0,4).map(e=>({when:`${e.when} · ${e.shape}`,head:e.name,text:e.who+'.'}));

 const cover=phase==='intro'?<IntroPanel kicker="1880s → today · tactics" title={<>Ten players. <em>One</em> plan.</>}
   deck="A formation is how a team spreads out, counted from its own goal: 4-3-3 means four defenders, three midfielders, three forwards. Turn the machine’s knob through 140 years of shapes, pull them apart, then build your own." beats={BEATS}/>
  :phase==='check'?<ScoreCover kicker="Quick check" score={`${visited.length}/${ERAS.length}`} unit="famous shapes explored">
   {!checked?<StepCheck items={QUIZ.map(x=>({q:x.q,options:x.options,right:x.answer,why:x.why}))} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`}
     onPick={ok=>ok?museumSfx.reveal():museumSfx.tick()} doneLabel="Finish" onDone={()=>setChecked(true)}/>
    :<Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You’ve turned 140 years of shapes, pulled one apart into its lines and built your own." take={exhibit.forYourGame}/>}
   <div className={s.row}><button type="button" className={s.ghost} data-back-to-board onClick={()=>setPhase('play')}>Back to the machine</button></div>
  </ScoreCover>:null;
 const dock=phase==='intro'?<StartDock label="Open the tactics machine" line="Six famous shapes, from 1880 to today, on a pegboard you can turn, pull apart and rebuild." onStart={()=>{setPhase('play');museumSfx.whistle();}}/>
  :phase==='play'?<div className={f.dock}>
   <p className={s.say} aria-live="polite"><Pips results={TASKS.map(t=>done.includes(t.id)?'good':undefined)} total={TASKS.length} label={`${done.length} of ${TASKS.length} tasks done`}/>{' '}
    {task?task.ask:<><b>All four done.</b> Take the quick check.</>}</p>
   <div className={s.row}>
    {st.mode==='history'?<button type="button" className={s.ghost} data-reset-sliders onClick={resetSliders}>Reset the sliders</button>
     :<button type="button" className={s.ghost} data-new-swarm onClick={()=>{m.current.built=swarm();m.current.moved=false;wake();}}>Start again</button>}
    <button type="button" className={s.btn} data-tone="acc" data-to-check disabled={!allDone} onClick={()=>{setPhase('check');museumSfx.reveal();}}>Quick check</button>
   </div></div>
  :<p className={s.say}>{BALANCE}</p>;

 return <PaperRoom id="formations-history" accent="#1f8a5b" ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-mode':st.mode,'data-era':era.id,'data-shape':reading.shape,'data-all':reading.all||undefined,'data-lift':lift.toFixed(2),'data-width':Math.round(reading.width),'data-depth':Math.round(reading.depth),
   'data-gap':Math.round(reading.gap),'data-tasks':done.join(' ')||undefined,'data-visited':visited.length,'data-reduced':reduced||undefined,'data-wide':wide||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} → today · tactics</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note="" fig={`Fig. ${st.mode==='build'?'yours':era.when}`} title={box.w>520?'The tactics machine':''} hint={wide?'Turn the era knob · slide · pull the lever':'Turn the knob'} readout={readout}
   note={sayNote} cover={cover}>
   <div ref={stageRef} className={`${s.stage} ${f.stage}`} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-stage>
    {P&&<Machine L={L} P={P} w={box.w} h={box.h} v={view} label={label} onDown={onDown} onKey={onKey} onFocus={setFocus} aria={aria}/>}
   </div>
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="fh-story">
   <p className={g.kicker}>{exhibit.year} → today</p>
   <h2 id="fh-story" className={g.h2}>From five forwards to a back four</h2>
   <ol className={g.steps}>{exhibit.facts.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{x}</p></li>)}</ol>
   <ol className={g.steps}>{ERAS.map(x=><li key={x.id}><span>{x.shape}</span><p className={g.body}><b>{x.name}, {x.when}.</b> {x.why}</p></li>)}</ol>
   <p className={g.body}><b>In your game:</b> 7v7 often plays {YOUTH[0].shape}, 9v9 {YOUTH[1].shape} and 11v11 {YOUTH[2].shape}, like the Paths lessons. {BALANCE}</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>The machine’s shapes are drawn simply: real teams move all the time. Its green zones (at least 40 m wide, 26 to 50 m from the back line to the front line, no gap over 19 m) are rules of thumb for this board, not laws.</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: a 2-3-5 above a 4-3-3, its lines coloured like the machine's trays. */
function EndArt(){
 const row=(n:number,y:number,w:number)=>Array.from({length:n},(_,i)=>n===1?120:120-w/2+w*i/(n-1)).map(x=>[x,y] as const);
 const lines:[number,number,number,string][]=[[4,140,160,'#2f5f9f'],[3,108,110,'#d9a521'],[3,76,150,'#c8372d']];
 return <svg viewBox="0 0 240 170" aria-hidden="true">
  <rect x="14" y="20" width="212" height="140" rx="4" fill="#b7cda3" stroke="#3a3a3c" strokeWidth="1"/>
  {lines.map(([n,y,w,c])=><g key={y}><rect x={120-w/2-10} y={y-7} width={w+20} height={14} rx={7} fill={c} opacity={.28}/>{row(n,y,w).map(([x,yy],i)=><circle key={i} cx={x} cy={yy} r="6.5" fill={c} stroke="#1d1d1b" strokeWidth="1"/>)}</g>)}
  <circle cx="120" cy="154" r="5" fill="#f6f4ec" stroke="#1d1d1b"/>
 </svg>;
}
