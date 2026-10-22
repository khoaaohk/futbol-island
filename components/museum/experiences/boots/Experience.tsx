'use client';
import {useCallback,useEffect,useMemo,useReducer,useRef,useState,type CSSProperties,type PointerEvent as RPE} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {ISO_CSS} from '../anatomy/iso-kit';
import {fit,frameFor,useBox,useLive,useRaf} from '../anatomy/bench';
import {draw} from './mesh';
import {buildBoot,type Boot,type BootSpec,type Part,type PartId} from './boot';
import {anchors,fitBench,labelsSvg,turntable} from './stage';
import {BOOT_CSS,BalanceLive,BalanceStatic,GripLive,GripStatic,Swatch,balPoints,hideInner,rigPoints,thumb} from './scene';
import {ACCENT,BEST_KEY,BUILD_NOTE,CHECK,COMPARE,COMPARE_NOTE,ERAS,GRIP_NOTE,GRIP_ROUNDS,GRIP_STUDS,ICONS,ICON_NOTE,MATS,MAX_NEW,NEW_G,OLD_G,PLATES,POWERS,SOURCES,SURFACES,
 balanceOf,verdictOf,type CompareLayer,type EraId,type GripStud,type PlateId,type Power,type Verdict} from './facts';
import {matOf,namesFor,withPlate,MAX_SCORE,buildOrder,buildScore,degOf,ease,flip,matchRound,newSpin,nudge,release,shuffled,stepSpin,total,tryPlace,verdict as scoreVerdict,DRAG_RAD_PX,ROLL_RAD_PX,STEP} from './game';
import {FigureStage,type FigureHandle} from '../anatomy/FigureStage';
import fs from '../anatomy/FigureStage.module.css';
import {STEPS,makeBootFigure} from './figure';
import {FIGURE_INTRO,FIGURE_SAY} from './facts';
import s from './Experience.module.css';

/**
 * boots · "Boots through time" (Oct 12 2026; replaces the back-pass rule exhibit). The user chose: "exploded boots from 1900s
 * leather toe-caps → screw-in studs → blades → today's knit; kids build a boot layer by layer, then test studs on mud, grass and
 * turf to see which grips", then: "can we see through the layers of each boot and what they are made of?", "they can spin the
 * boots around and see them", "show for todays, go into details and show the best selling boots of the last 30 years".
 * Drawn in the anatomy isometric Paper style (docs/museum-paper-style.md), no figures.
 *
 *  1. Timeline: five boots on a turntable (early 1900s, 1950s, 1970s–80s, 1990s, today). Drag to spin a full 360° (a flick glides,
 *     then springs to the nearest of 8 angles), drag up or tap Sole to roll it over; ← → and ↑ ↓ too. Explode (slider) lifts the
 *     layers apart with leader-line labels; See-through turns the outside skins to glass so the heel counter, padding, insole and
 *     the stud screws or nails show in place. Tap any layer: its material, a swatch and one line. Compare materials: one layer
 *     across the eras with weight / keeps water out / bends bars. Today's boot: FG / SG / AG / TF / IC plates.
 *  2. Build: snap the layers back together from the ground up (first-try placements score).
 *  3. Grip test: five pitches, pick the studs, pull: the dial and the meter show grip or slip (a practice model, labelled).
 *  4. Weigh: how many modern boots balance one old boot?
 *  5. Icons: famous boot lines as plain Paper boots (no logos), spin and open each; then match four to their superpower.
 *  6. Finish: the score (best kept under BEST_KEY), the quick check, then the gallery ending (onComplete once, via `reached`).
 * Heat: the SVG is written only when something changes; the frame loop (anatomy/paper-loop.ts via bench useRaf) runs only while
 * the boot turns or settles, a layer moves, the tester pulls or the beam swings; it parks off screen or in a hidden tab and is
 * cancelled on unmount. 0 frames at rest. Reduced motion: 8 fixed angles, instant explode and see-through, instant results.
 */
type Phase='intro'|'bench'|'build'|'grip'|'weigh'|'icons'|'score'|'figure';
const STATIONS:[Exclude<Phase,'intro'>,string][]=[['bench','Timeline'],['build','Build'],['grip','Grip test'],['weigh','Weigh'],['icons','Icons'],['score','Finish']];
const capture=(e:{currentTarget:EventTarget;pointerId:number})=>{try{(e.currentTarget as Element).setPointerCapture?.(e.pointerId);}catch{/* no active pointer */}};
const readBest=()=>{try{const n=Number(localStorage.getItem(BEST_KEY));return Number.isFinite(n)&&n>0?n:0;}catch{return 0;}};
const saveBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode */}};

const gripSpec=(st:GripStud):BootSpec=>{const G=GRIP_STUDS[st],b=st==='nailed'?ERAS[0].spec:ERAS[4].spec;return {...b,studs:G.kind,mats:{...b.mats,studs:G.mat,tip:G.tip,sole:G.sole}};};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const card=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null),stageG=useRef<SVGGElement>(null),readRef=useRef<HTMLSpanElement>(null),endRef=useRef<HTMLDivElement>(null);
 const box=useBox(card),live=useLive(card);
 const say=useCallback((t:string)=>{if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;},[]);
 const [phase,setPhase]=useState<Phase>('intro');const phaseRef=useRef(phase);phaseRef.current=phase;
 const [,redraw]=useReducer((n:number)=>n+1,0);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 // Run, plant, kick (museum-figures-2, figure kit v2): one turnable boot, made once; `figFrom` is the phase to go back to. The
 // three steps run on timers (no frame loop of their own: the figure's tick eases the pose, then the Paper loop sleeps).
 const bootFig=useMemo(()=>makeBootFigure(),[]),figHandle=useRef<FigureHandle|null>(null),figFrom=useRef<Phase>('intro'),figTimers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const [figLit,setFigLit]=useState<string[]>([]),[figNote,setFigNote]=useState(FIGURE_INTRO),[screw,setScrew]=useState(false),[running,setRunning]=useState(false);
 const stopRun=()=>{figTimers.current.forEach(clearTimeout);figTimers.current=[];setRunning(false);};
 useEffect(()=>()=>figTimers.current.forEach(clearTimeout),[]);
 const openFigure=()=>{figFrom.current=phaseRef.current;setPhase('figure');phaseRef.current='figure';museumSfx.card();};
 const touchBoot=(id:string)=>{if(running)return;setFigLit([id]);setFigNote(FIGURE_SAY[id==='studs'&&bootFig.screw?'screw':id]??FIGURE_INTRO);museumSfx.tick();later(()=>setFigLit(l=>l[0]===id?[]:l),1800);};
 const swapStuds=()=>{const on=!bootFig.screw;bootFig.setScrew(on);setScrew(on);setFigLit(['studs']);setFigNote(FIGURE_SAY[on?'screw':'studs']);figHandle.current?.invalidate();museumSfx.card();};
 const runPlantKick=()=>{stopRun();setRunning(true);const h=figHandle.current;h?.setLabels(true);h?.setSeeThrough(true);
  STEPS.forEach((st,i)=>figTimers.current.push(setTimeout(()=>{bootFig.pose(st.id,reduced);setFigLit([...st.lit]);setFigNote(FIGURE_SAY[st.id]);museumSfx.tick();figHandle.current?.invalidate();},i*1500)));
  figTimers.current.push(setTimeout(()=>{bootFig.pose(null,reduced);setFigLit([]);setRunning(false);figHandle.current?.invalidate();},STEPS.length*1500+300));};
 const closeFigure=()=>{stopRun();bootFig.pose(null,true);setFigLit([]);setFigNote(FIGURE_INTRO);setPhase(figFrom.current);phaseRef.current=figFrom.current;later(()=>paint(),0);};
 useEffect(()=>{const kk=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};window.addEventListener('keydown',kk);return()=>window.removeEventListener('keydown',kk);},[onClose]);
 const [best,setBest]=useState(0);useEffect(()=>{setBest(readBest());},[]);

 // ── Which boot is on the turntable ─────────────────────────────────────────────────────────────────────────────────────
 const [era,setEra]=useState<EraId>('early'),[plate,setPlate]=useState<PlateId>('fg'),[icon,setIcon]=useState('copa');
 const eraObj=ERAS.find(e=>e.id===era)!;
 const spec=useMemo(()=>phase==='icons'?ICONS.find(i=>i.id===icon)!.spec:era==='today'?withPlate(eraObj.spec,plate):eraObj.spec,[phase,icon,era,plate,eraObj]);
 const boot=useMemo(()=>buildBoot(spec),[spec]);
 // a lighter mesh of the same boot for frames in motion (spin, explode); the full one is drawn the moment it comes to rest
 const bootLo=useMemo(()=>buildBoot(spec,.6),[spec]);const loRef=useRef<Boot>(bootLo);loRef.current=bootLo;
 const names=useMemo(()=>namesFor(spec),[spec]);
 const bootRef=useRef<Boot>(boot);bootRef.current=boot;const namesRef=useRef(names);namesRef.current=names;

 // ── View state (refs: the frame loop reads them; React draws only the controls) ────────────────────────────────────────
 const spin=useRef(newSpin());
 const A=useRef({ex:0,exTo:0,xr:0,xrTo:0,place:{} as Partial<Record<PartId,number>>,placeTo:{} as Partial<Record<PartId,number>>});
 const [exTo,setExTo]=useState(0),[xray,setXray]=useState(false),[sel,setSel]=useState<PartId|null>(null);const selRef=useRef(sel);selRef.current=sel;
 const [compare,setCompare]=useState<CompareLayer|null>(null);

 const W=box.w||1,H=box.h||1,wide=W>=700,orient=W>=H*1.05?'wide':'tall';
 const dims=useRef({W,H,wide});dims.current={W,H,wide};
 const noteRef=useRef<HTMLDivElement>(null),noteBottom=useRef(0);
 useEffect(()=>{const n=noteRef.current,c=card.current;noteBottom.current=n&&c?Math.round(n.getBoundingClientRect().bottom-c.getBoundingClientRect().top+14):0;paint();});

 // ── The one paint for the turntable stations ───────────────────────────────────────────────────────────────────────────
 const paint=useCallback((moving=false)=>{
  const gEl=stageG.current,ph=phaseRef.current;if(!gEl||!(ph==='bench'||ph==='build'||ph==='icons'||ph==='intro'||ph==='score'))return;
  const b=moving?loRef.current:bootRef.current,a=A.current,sp=spin.current,{W,H,wide}=dims.current,nm=namesRef.current;
  const e=(id:PartId)=>ph==='build'?(a.place[id]??1):a.ex;
  const off=(p:Part):[number,number,number]=>{const t=e(p.id);return [p.out[0]*t,p.out[1]*t,p.out[2]*t];};
  // keep every layer above the platter, upright or rolled over (a conservative bound while it rolls)
  const cp=Math.cos(sp.phi),sn=Math.abs(Math.sin(sp.phi));let lift=0;
  for(const p of b.parts){const o=p.out[2]*e(p.id),z0=p.box!.z0+o-b.C[2],z1=p.box!.z1+o-b.C[2];lift=Math.max(lift,-(b.C[2]+Math.min(z0*cp,z1*cp)-p.box!.r*sn*.45));}
  const upperIn=e('upper')<.08,inner=new Set(b.parts.filter(p=>p.inner).map(p=>p.id));
  const hidden=(id:string)=>inner.has(id as PartId)&&a.xr<.05&&e(id as PartId)<.08&&upperIn;
  const showAll=ph==='build'||a.ex>.25,labT=ph==='build'?1:Math.min(1,a.ex*2.2);
  const shelf=ph==='icons'&&wide&&a.exTo<.25?250:0,side=wide?Math.max(shelf,Math.round(Math.min(178,W*.15)*labT)):0,top=wide?44:Math.min(150,Math.round(H*.2)),bottom=wide?40:30;
  const P0=fitBench(b,off,lift,ph==='score'&&wide?W-600:W,H,{side,top,bottom,pad:wide?20:10});
  const P=ph==='score'&&wide?{...P0,origin:[P0.origin[0]+600,P0.origin[1]] as [number,number]}:P0;
  const pose={theta:sp.theta,phi:sp.phi,C:b.C,lift};
  const byId=Object.fromEntries(b.parts.map(p=>[p.id,p]));
  const body=draw(b.parts.flatMap(p=>p.meshes),b.parts.flatMap(p=>p.marks),P,pose,{mats:MATS,offset:id=>off(byId[id]),hidden,xray:a.xr,skins:new Set(b.parts.filter(p=>p.skin).map(p=>p.id)),sel:selRef.current,assembled:id=>e(id as PartId)<.08});
  const ids=b.parts.map(p=>p.id).filter(id=>!hidden(id)&&(showAll?(ph!=='build'||e(id)>.5||id===selRef.current):id===selRef.current));
  const labels=ids.length?labelsSvg(anchors(b,ids,off,P,pose,nm),W,H,selRef.current,wide?'side':'dots',top,bottom,noteBottom.current):'';
  gEl.innerHTML=turntable(P,sp.theta)+body.svg+labels;gEl.toggleAttribute('data-moving',moving);
  gEl.setAttribute('data-faces',String(body.faces));
 },[]);

 // ── The frame loop: spin, explode, see-through, build placement, the grip pull, the balance ────────────────────────────
 const grip=useRef({t:0,running:false,force:0,slide:0,peak:0,v:'grips' as Verdict});
 const bal=useRef({tilt:0,to:0});
 const wake=useRaf(dt=>{
  const ph=phaseRef.current,a=A.current;let moving=false;
  if(ph==='bench'||ph==='build'||ph==='icons'){
   moving=stepSpin(spin.current,dt)||moving;
   if(a.ex!==a.exTo){a.ex=ease(a.ex,a.exTo,dt,.22);moving=true;}
   if(a.xr!==a.xrTo){a.xr=ease(a.xr,a.xrTo,dt,.2);moving=true;}
   for(const id of Object.keys(a.placeTo) as PartId[]){const to=a.placeTo[id]!,cur=a.place[id]??1;if(cur!==to){a.place[id]=ease(cur,to,dt,.18);moving=true;}}
   paint(moving);if(!moving&&!spin.current.dragging)paint(false);say(readout());
  }
  if(ph==='grip'&&grip.current.running){const G=grip.current;G.t+=dt;const rise=Math.min(1,G.t/1.05);
   if(G.v==='grips'){G.force=G.peak*easeOut(rise);if(G.t>1.5){G.running=false;finishTest();}}
   else{G.force=G.t<.85?G.peak*easeOut(Math.min(1,G.t/.85)):G.peak*(.45+.55*Math.exp(-(G.t-.85)*5));if(G.t>.85)G.slide=Math.min(96,G.slide+dt*(70+G.slide*1.4));if(G.t>2.1){G.running=false;finishTest();}}
   say(`Grip ${Math.round(G.force)} / 100${G.slide>2?' · slipping':''}`);redraw();moving=moving||G.running;}
  if(ph==='weigh'){const B=bal.current;if(B.tilt!==B.to){B.tilt=ease(B.tilt,B.to,dt,.28);redraw();moving=true;}}
  return moving;
 },live);
 const easeOut=(t:number)=>1-Math.pow(1-t,3);
 const readout=()=>{const sp=spin.current,a=A.current;return `${degOf(sp.theta)}°${sp.phi>1.5?' · sole':''}${a.ex>.05?` · apart ${Math.round(a.ex*100)}%`:''}${a.xr>.5?' · see-through':''}`;};
 // repaint when the boot, the size or the selection changes (no frames)
 useEffect(()=>{paint();say(phase==='grip'?`Grip ${Math.round(grip.current.force)} / 100`:phase==='weigh'?`${OLD_G} g · ${nNew*NEW_G} g`:readout());},[paint,boot,W,H,sel,phase]);// eslint-disable-line react-hooks/exhaustive-deps

 // ── Controls ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 const setExplode=(v:number)=>{const a=A.current;a.exTo=v;setExTo(v);if(reduced){a.ex=v;paint();say(readout());}else wake();};
 const setSee=(on:boolean)=>{const a=A.current;a.xrTo=on?1:0;setXray(on);if(reduced){a.xr=a.xrTo;paint();say(readout());}else wake();museumSfx.look();};
 const turn=(d:number)=>{nudge(spin.current,d,reduced);museumSfx.spin();if(reduced)paint();else wake();say(readout());};
 const roll=(up?:boolean)=>{flip(spin.current,reduced,up);museumSfx.turn();if(reduced)paint();else wake();};
 const pick=(id:PartId|null)=>{setSel(v=>v===id?null:id);if(id)museumSfx.tick();};
 const chooseEra=(id:EraId)=>{setEra(id);setSel(null);museumSfx.card();};
 const choosePlate=(p:PlateId)=>{setPlate(p);setSel(null);museumSfx.card();};

 // Drag to spin (horizontal) and roll (vertical); a short tap picks a layer.
 const drag=useRef<{x:number;y:number;t:number;th:number;ph:number;lx:number;lt:number;moved:boolean}|null>(null);
 const onDown=(e:RPE<SVGSVGElement>)=>{if(!(phase==='bench'||phase==='build'||phase==='icons'))return;capture(e);
  const sp=spin.current;drag.current={x:e.clientX,y:e.clientY,t:performance.now(),th:sp.theta,ph:sp.phi,lx:e.clientX,lt:performance.now(),moved:false};
  if(!reduced){sp.dragging=true;sp.to=null;sp.omega=0;}};
 const onMove=(e:RPE<SVGSVGElement>)=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>6)d.moved=true;if(!d.moved||reduced)return;
  const sp=spin.current,now=performance.now(),th=d.th+dx*DRAG_RAD_PX,dt=Math.max(1,now-d.lt)/1000;sp.omega=sp.omega*.6+((th-sp.theta)/dt)*.4;sp.theta=th;
  sp.phi=Math.max(0,Math.min(Math.PI,d.ph+(-dy)*ROLL_RAD_PX));d.lx=e.clientX;d.lt=now;wake();};
 const onUp=(e:RPE<SVGSVGElement>)=>{const d=drag.current;drag.current=null;if(!d)return;const sp=spin.current;
  if(!d.moved){sp.dragging=false;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-part]');const id=el?.getAttribute('data-part') as PartId|null;
   if(phase==='build'&&id&&(A.current.place[id]??1)>.5){placePart(id);return;}if(id)pick(id);else setSel(null);wake();return;}
  if(reduced){const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>30)roll(dy<0);else if(Math.abs(dx)>24)turn(dx>0?1:-1);return;}
  if(performance.now()-d.lt>90)sp.omega=0;release(sp);museumSfx.spin();wake();};
 const onKey=(e:React.KeyboardEvent)=>{if(!(phase==='bench'||phase==='build'||phase==='icons'))return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}
  else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();roll(e.key==='ArrowUp');}
  else if(phase!=='build'&&(e.key==='e'||e.key==='E')){setExplode(A.current.exTo>.5?0:1);}
  else if(e.key==='x'||e.key==='X'){setSee(!xray);}};

 // ── Build ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const order=useMemo(()=>buildOrder(boot),[boot]);
 const [placed,setPlaced]=useState<ReadonlySet<PartId>>(()=>new Set()),[firstTry,setFirstTry]=useState(0),[missed,setMissed]=useState<ReadonlySet<PartId>>(()=>new Set());
 const [chips,setChips]=useState<PartId[]>([]),[note,setNote]=useState(''),[wrong,setWrong]=useState<PartId|null>(null),[buildPts,setBuildPts]=useState<number|null>(null);
 const startBuild=()=>{spin.current=newSpin();const a=A.current;a.place={};a.placeTo={};for(const id of order){a.place[id]=1;a.placeTo[id]=1;}a.ex=0;a.exTo=0;a.xr=0;a.xrTo=0;setXray(false);setExTo(0);
  setPlaced(new Set());setMissed(new Set());setFirstTry(0);setBuildPts(null);setChips(shuffled(order));setSel(null);setNote('All the layers are apart. Build the boot from the ground up: what goes at the very bottom?');
  setPhase('build');phaseRef.current='build';later(()=>{paint();},0);};
 const placePart=(id:PartId)=>{if(placed.has(id))return;const r=tryPlace(order,placed,id,names);
  if(!r.ok){museumSfx.flap();setNote(r.say);setWrong(id);later(()=>setWrong(null),450);setMissed(m=>{const n=new Set(m);n.add(nextOf()!);return n;});return;}
  const n=new Set(placed);n.add(id);setPlaced(n);const ft=!missed.has(id);if(ft)setFirstTry(v=>v+1);museumSfx.card();
  A.current.placeTo[id]=0;if(reduced){A.current.place[id]=0;paint();}else wake();setSel(id);
  if(n.size===order.length){const pts=buildScore(firstTry+(ft?1:0),order.length);setBuildPts(pts);museumSfx.reveal();setNote(`Built! ${firstTry+(ft?1:0)} of ${order.length} layers right first time.`);setSel(null);}
  else setNote(`${r.say} ${LAYERS_LINE(id)}`);};
 const nextOf=()=>order.find(id=>!placed.has(id))??null;
 const LAYERS_LINE=(id:PartId)=>`${names[id].does}`;

 // ── Grip test ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 const [round,setRound]=useState(0),[stud,setStud]=useState<GripStud>('fg'),[gripRes,setGripRes]=useState<({pts:number;v:Verdict;stud:GripStud}|undefined)[]>([]),[lastTest,setLastTest]=useState<ReturnType<typeof verdictOf>|null>(null);
 const surface=GRIP_ROUNDS[Math.min(round,GRIP_ROUNDS.length-1)];
 const gBoot=useMemo(()=>buildBoot(gripSpec(stud),.8),[stud]);
 const startGrip=()=>{setRound(0);setGripRes([]);setLastTest(null);grip.current={t:0,running:false,force:0,slide:0,peak:0,v:'grips'};setPhase('grip');phaseRef.current='grip';museumSfx.whistle();};
 const runTest=()=>{const G=grip.current;if(G.running)return;const r=verdictOf(stud,surface);G.t=0;G.slide=0;G.force=0;G.peak=r.grip;G.v=r.v==='grips'?'grips':r.v;setLastTest(null);museumSfx.kick();
  if(reduced){G.force=r.v==='grips'?r.grip:r.grip*.45;G.slide=r.v==='grips'?0:80;finishTest();redraw();return;}G.running=true;wake();};
 function finishTest(){const r=verdictOf(stud,surface);setLastTest(r);museumSfx[r.v==='grips'?'reveal':'tick']();
  setGripRes(list=>{if(list[round])return list;const n=[...list];n[round]={pts:r.pts,v:r.v,stud};return n;});}
 const nextRound=()=>{grip.current={t:0,running:false,force:0,slide:0,peak:0,v:'grips'};setLastTest(null);if(round+1<GRIP_ROUNDS.length){setRound(round+1);museumSfx.whistle();}else{setRound(GRIP_ROUNDS.length);}};
 const gripPts=gripRes.reduce((a,r)=>a+(r?.pts??0),0);

 // ── Weigh ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const [nNew,setNNew]=useState(0);
 const oldBoot=useMemo(()=>phase==='weigh'?buildBoot(ERAS[0].spec,.5):null,[phase]),newBoot=useMemo(()=>phase==='weigh'?buildBoot(ERAS[4].spec,.5):null,[phase]);
 const setN=(n:number)=>{const v=Math.max(0,Math.min(MAX_NEW,n));setNNew(v);say(`${OLD_G} g · ${v*NEW_G} g`);const B=bal.current;B.to=-balanceOf(v)*.24;if(reduced){B.tilt=B.to;}else wake();museumSfx.tick();};
 const startWeigh=()=>{setNNew(0);const B=bal.current;B.to=-balanceOf(0)*.24;B.tilt=B.to;setPhase('weigh');phaseRef.current='weigh';};

 // ── Icons ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const thumbs=useMemo(()=>phase==='icons'?Object.fromEntries(ICONS.map(i=>[i.id,thumb(i.spec)])):{} as Record<string,string>,[phase]);
 const [powerOpen,setPowerOpen]=useState(false),[answers,setAnswers]=useState<Record<string,{pick:Power;ok:boolean;first:boolean}>>({});
 const powerPts=Object.values(answers).filter(a=>a.ok&&a.first).length;
 const answer=(id:string,p:Power)=>{const ic=ICONS.find(i=>i.id===id)!;const ok=ic.power===p;setAnswers(m=>{if(m[id]?.ok)return m;return {...m,[id]:{pick:p,ok,first:!m[id]}};});museumSfx[ok?'reveal':'flap']();};

 // ── Score ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const score=total(buildPts??0,gripPts,powerPts);
 const [checked,setChecked]=useState(false);
 const goto=(p:Exclude<Phase,'intro'>)=>{setCompare(null);setPowerOpen(false);setSel(null);
  if(p==='build'){startBuild();return;}if(p==='grip'){startGrip();return;}if(p==='weigh'){startWeigh();return;}
  if(p==='score'){setBest(b=>{const n=Math.max(b,score);saveBest(n);return n;});museumSfx.crowd();}
  if(p==='bench'||p==='icons'||p==='score'){const a=A.current;a.ex=0;a.exTo=0;a.xr=0;a.xrTo=0;setExTo(0);setXray(false);spin.current=newSpin();}
  setPhase(p);phaseRef.current=p;later(()=>paint(),0);};
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 // ── Words on the card ──────────────────────────────────────────────────────────────────────────────────────────────────
 const turnable=phase==='bench'||phase==='build'||phase==='icons'||phase==='intro'||phase==='score';
 const iconObj=ICONS.find(i=>i.id===icon)!;
 const title=phase==='grip'?'The grip tester':phase==='weigh'?'The balance':phase==='build'?'Build a boot':phase==='icons'?'Iconic boots':phase==='score'?'Full time':'Boots through time';
 const hint=phase==='score'?'':turnable?(reduced?'← → turn · ↑ sole · tap a layer':'Drag to spin · drag up for the sole · tap a layer'):phase==='grip'?'Pick the studs, then pull':phase==='weigh'?'Add modern boots until it balances':'';
 const fig=phase==='icons'?`Fig. ${iconObj.year}`:phase==='grip'?'Fig. 5 pitches':phase==='weigh'?`Fig. ${OLD_G} g`:`Fig. ${eraObj.when}`;
 const selMat=sel?MATS[matOf(spec,sel)]:null;
 const label=phase==='grip'?`A grip tester: a boot with ${GRIP_STUDS[stud].name} studs on ${SURFACES[surface]?.name??'a pitch'}, pulled by a cord through a spring to a force dial.`
  :phase==='weigh'?`A balance: one early 1900s leather boot (about ${OLD_G} g) against ${nNew} modern boots (about ${NEW_G} g each).`
  :`A ${phase==='icons'?iconObj.name:eraObj.when} football boot on a turntable${exTo>0?', its layers lifted apart':''}${xray?', seen through':''}.`;

 const G=grip.current;const gripF=useMemo(()=>frameFor(orient),[orient]);
 const Pg=useMemo(()=>{const P=fit(gripF,rigPoints(),W,H-34,Math.round(Math.max(14,Math.min(W,H)*.04)),orient==='wide'?30:48);return {...P,origin:[P.origin[0],P.origin[1]+(wide?6:Math.min(110,H*.14))] as [number,number]};},[gripF,W,H,orient,wide]);
 const balF=useMemo(()=>frameFor('wide'),[]);
 const Pb=useMemo(()=>{const P=fit(balF,balPoints(),W,H-34,Math.round(Math.max(14,Math.min(W,H)*.04)),orient==='wide'?24:40);return {...P,origin:[P.origin[0],P.origin[1]+(wide?14:Math.min(120,H*.15))] as [number,number]};},[balF,W,H,orient,wide]);
 const ready=box.w>0;
 const gripDone=round>=GRIP_ROUNDS.length;

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="boots"
  className={`${g.room} iso ${s.root}`} data-theme="light" data-phase={phase} data-era={phase==='icons'?icon:era} data-plate={plate} data-explode={exTo} data-xray={xray||undefined} data-sel={sel??undefined}
  data-score={score} data-orient={orient} data-reduced={reduced||undefined} style={{'--accent':ACCENT} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS+BOOT_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={`${g.scroll} ${s.scroll}`} data-scroll>
   <div className={s.screen} data-play-screen>
    <header className={s.head}>
     <WallLabel as="h1" title={exhibit.title} meta={exhibit.year} caption="Spin, open up and build a football boot, then test its studs." className={s.label}/>
     {phase!=='intro'&&<nav className={s.stations} aria-label="Stations">{STATIONS.map(([id,name],i)=><button key={id} type="button" aria-current={phase===id?'step':undefined} data-station={id} onClick={()=>goto(id)}><i>{i+1}</i>{name}</button>)}</nav>}
    </header>

    <div ref={card} className={s.card} data-play-area data-fill-screen tabIndex={0} onKeyDown={onKey} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">{fig}</span><span data-corner="title">{title}</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout" ref={readRef}/>
     </div>
     {ready&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {turnable&&<g ref={stageG} data-stage=""/>}
      {phase==='grip'&&<g><GripStatic F={gripF} P={Pg} surface={surface}/><GripLive F={gripF} P={Pg} boot={gBoot} force={G.force} slide={G.slide} surface={surface} sink={surface==='mud'?3:0}/></g>}
      {phase==='weigh'&&oldBoot&&newBoot&&<g><BalanceStatic F={balF} P={Pb}/><BalanceLive F={balF} P={Pb} tilt={bal.current.tilt} old={oldBoot} modern={newBoot} n={nNew}/></g>}
     </svg>}

     {/* the note: the tapped layer, or the boot's story */}
     {(phase==='bench'||phase==='icons'||phase==='build')&&!compare&&!powerOpen&&<div ref={noteRef} className={s.note} data-note>
      {phase==='build'?<><p className={s.kick}>Layer by layer · {placed.size} of {order.length}</p><p className={s.mat} aria-live="polite">{note}</p>
        {sel&&selMat&&<p className={s.does}><i className={s.sw} style={{background:selMat.color==='paper'?'#f7f7f3':selMat.color}}/> <b>{names[sel].name}:</b> {selMat.name}. {selMat.line}</p>}</>
       :sel&&selMat?<><p className={s.kick}><i className={s.sw} style={{background:selMat.color==='paper'?'#f7f7f3':selMat.color}}/>{names[sel].name}</p>
        <p className={s.mat}><b>{selMat.name}.</b> {selMat.line}</p><p className={s.does}>{names[sel].does}</p></>
       :phase==='icons'?<><p className={s.kick}>{iconObj.year}</p><p className={s.big}>{iconObj.name}</p><p className={s.mat}>{iconObj.special}</p><p className={s.does}><b>Suits:</b> {iconObj.suits} <b>Over time:</b> {iconObj.changed}</p></>
       :<><p className={s.kick}>{eraObj.when}</p><p className={s.big}>{eraObj.title}</p><p className={s.mat}>{eraObj.what}</p><p className={s.does}><b>Weight:</b> {eraObj.weight}.</p>{!wide&&exTo>.3&&<p className={s.tapHint}>Tap a number to see that layer.</p>}
         {era==='today'&&<p className={s.does} data-plate-line><b>{PLATES[plate].code} · {PLATES[plate].name}:</b> {PLATES[plate].line}</p>}</>}
     </div>}

     {phase==='bench'&&compare&&<div className={s.sheet} data-compare={compare} role="group" aria-label="Compare materials">
      <div className={s.sheetHead}><p className={s.kick}>Compare materials</p>
       <span className={s.seg} role="group" aria-label="Layer">{(Object.keys(COMPARE) as CompareLayer[]).map(id=><button key={id} type="button" aria-pressed={compare===id} onClick={()=>setCompare(id)}>{COMPARE[id].label}</button>)}</span>
       <button type="button" className={s.x} onClick={()=>setCompare(null)} aria-label="Close compare">×</button></div>
      <ol className={s.strip}>{COMPARE[compare].rows.map(r=><li key={r.era} data-era={r.era}><Swatch mat={r.mat}/><small>{ERAS.find(e=>e.id===r.era)!.when}</small><b>{MATS[r.mat].name}</b>
       {([['heavy','Weight'],['dry','Keeps water out'],['bend','Bends']] as const).map(([key,lab])=><span key={key} className={s.bar} data-bar={key}><em>{lab}</em><i style={{'--v':r[key]} as CSSProperties}/></span>)}</li>)}</ol>
      <p className={s.small}>{COMPARE_NOTE}</p>
     </div>}

     {phase==='icons'&&wide&&!powerOpen&&exTo<.25&&<ol className={s.shelf} data-shelf aria-label="Iconic boot lines">{ICONS.map(i=><li key={i.id}>
      <button type="button" aria-pressed={icon===i.id} data-shelf-btn={i.id} onClick={()=>{setIcon(i.id);setSel(null);museumSfx.card();}}>
       <svg viewBox="0 0 150 96" aria-hidden="true" dangerouslySetInnerHTML={{__html:thumbs[i.id]??''}}/><span><b>{i.name}</b><small>{i.year}</small></span></button></li>)}</ol>}
     {phase==='icons'&&powerOpen&&<div className={s.sheet} data-power role="group" aria-label="Superpower round">
      <div className={s.sheetHead}><p className={s.kick}>Match the boot to its superpower</p><button type="button" className={s.x} onClick={()=>setPowerOpen(false)} aria-label="Close">×</button></div>
      <ol className={s.powers}>{matchRound().map(ic=>{const a=answers[ic.id];return <li key={ic.id} data-icon={ic.id} data-ok={a?.ok||undefined}>
       <svg viewBox="0 0 150 96" aria-hidden="true" dangerouslySetInnerHTML={{__html:thumbs[ic.id]??''}}/><b>{ic.name}</b>
       <span className={s.seg} role="group" aria-label={`${ic.name}: superpower`}>{(Object.keys(POWERS) as Power[]).map(p=><button key={p} type="button" aria-pressed={a?.pick===p} data-a={a?.pick===p?(a.ok?'right':'wrong'):undefined} onClick={()=>answer(ic.id,p)}>{POWERS[p]}</button>)}</span>
       <small>{a?(a.ok?ic.special:'Not quite. Look at what makes it special.'):' '}</small></li>;})}</ol>
      <p className={s.small}>{ICON_NOTE}</p>
     </div>}

     {phase==='grip'&&<div className={s.note} data-grip-note>
      <p className={s.kick}>{gripDone?'All five pitches':`Pitch ${round+1} of ${GRIP_ROUNDS.length}`}</p>
      {!gripDone&&<><p className={s.big}>{SURFACES[surface].name}</p><p className={s.mat}>{SURFACES[surface].line}</p></>}
      {lastTest&&<p className={s.mat} data-verdict={lastTest.v}><b>{lastTest.v==='grips'?'Grips!':lastTest.v==='ok'?'OK':lastTest.v==='not'?'Not for this pitch':'Slips!'}</b> {lastTest.say}</p>}
      {gripDone&&<p className={s.mat}>You scored <b>{gripPts}</b> of 10. Players change studs for the pitch: long ones for mud, short ones for firm or plastic grass, and a flat sole indoors.</p>}
     </div>}

     {phase==='weigh'&&<div className={s.note} data-weigh-note>
      <p className={s.kick}>How many modern boots balance one old boot?</p>
      <p className={s.mat}>Left: an early 1900s leather boot, about <b>{OLD_G} g</b> (and even heavier when wet). Right: <b>{nNew}</b> modern speed boot{nNew===1?'':'s'}, about <b>{NEW_G} g</b> each.</p>
      <p className={s.does} aria-live="polite">{nNew===0?'Add a modern boot.':Math.abs(nNew*NEW_G-OLD_G)<60?`Nearly level: ${nNew} modern boots weigh about as much as one old boot!`:nNew*NEW_G<OLD_G?`${nNew*NEW_G} g: still lighter. Add another.`:`${nNew*NEW_G} g: now the modern side is heavier.`}</p>
     </div>}

     {phase==='figure'&&<FigureStage spec={bootFig.spec} active={figLit} reduced={reduced} onLabel={touchBoot} handle={figHandle} top={28}
      label="A football boot on a patch of turf: the upper, laces, soleplate and studs"
      extra={<button type="button" className={fs.pill} aria-pressed={screw} data-fig-screw onClick={swapStuds}>{screw?'Screw-in studs':'Moulded studs'}</button>}/>}
     {phase==='intro'&&<div className={s.panel} data-intro>
      <p className={g.kicker}>{exhibit.year}</p>
      <h2 className={s.panelTitle}>From heavy leather to knit.</h2>
      <p className={g.body}>{exhibit.facts[0]}</p>
      <ol className={s.beats}>{[['Spin and open up','Five boots from the early 1900s to today. Spin them, lift the layers apart, see through them.'],['Build one','Put the layers back together from the ground up.'],['Test the studs','Mud, grass, plastic grass, a hall floor: which studs grip?']].map(([h,t])=><li key={h}><b>{h}</b><p>{t}</p></li>)}</ol>
     </div>}

     {phase==='score'&&<div className={s.panel} data-score-panel>
      <p className={g.kicker}>Full time</p>
      <p className={s.bigScore}><b>{score}</b><span>of {MAX_SCORE} points</span></p>
      <ul className={s.tally}><li>Build <b>{buildPts??'–'}</b>/10</li><li>Grip test <b>{gripPts}</b>/10</li><li>Superpowers <b>{powerPts}</b>/4</li></ul>
      <p className={g.body}><b>{scoreVerdict(score)}</b></p>
      {best>0&&<p className={g.small} data-best>Best · {best} of {MAX_SCORE}</p>}
      <StepCheck items={CHECK.map(c=>({q:c.q,options:c.options,right:c.answer,why:c.why}))} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>{if(ok)museumSfx.reveal();else museumSfx.tick();}}
       doneLabel="See the ending" onDone={()=>{setChecked(true);later(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60);}}/>
     </div>}
    </div>

    <div className={s.dock} data-dock>
     {phase==='figure'&&<div className={s.introDock}><p className={s.say} aria-live="polite" data-fig-note>{figNote}</p>
      <span className={s.tools}><button type="button" className={g.btn} data-run-plant-kick disabled={running} onClick={runPlantKick}>Run, plant, kick</button>
      <button type="button" className={g.ghost} data-fig-back onClick={closeFigure}>{figFrom.current==='intro'?'Back to the start':'Back to the bench'}</button></span></div>}
     {phase==='intro'&&<div className={s.introDock}><button type="button" className={g.btn} data-start data-start-dock data-museum-own-cue onClick={()=>goto('bench')}>Open the bench</button><button type="button" className={g.ghost} data-boot-figure onClick={openFigure}>Run, plant, kick</button><p className={s.say}>Boots have changed a lot. Let’s take five of them apart.</p></div>}
     {(phase==='bench'||phase==='icons')&&<>
      {phase==='bench'?<span className={s.eras} role="group" aria-label="Boot">{ERAS.map(e=><button key={e.id} type="button" aria-pressed={era===e.id} data-era-btn={e.id} onClick={()=>chooseEra(e.id)}>{e.when}</button>)}</span>
       :<span className={s.eras} role="group" aria-label="Boot line">{ICONS.map(i=><button key={i.id} type="button" aria-pressed={icon===i.id} data-icon-btn={i.id} onClick={()=>{setIcon(i.id);setSel(null);museumSfx.card();}}>{i.name.replace(/^(adidas|Nike|Puma) /,'')}</button>)}</span>}
      <span className={s.tools}>
       <button type="button" className={s.tool} onClick={()=>turn(-1)} aria-label="Turn left">⟲</button>
       <button type="button" className={s.tool} onClick={()=>turn(1)} aria-label="Turn right">⟳</button>
       <button type="button" className={s.tool} aria-pressed={spin.current.phiTo>1.5} onClick={()=>{roll();redraw();}} data-sole>Sole</button>
       <label className={s.slider}><span>Apart</span><input type="range" min={0} max={100} step={1} value={Math.round(exTo*100)} onChange={e=>setExplode(Number(e.target.value)/100)} data-explode-slider aria-label="Lift the layers apart"/></label>
       <button type="button" className={s.tool} aria-pressed={xray} onClick={()=>setSee(!xray)} data-see>See-through</button>
       {phase==='bench'&&<button type="button" className={s.tool} data-boot-figure onClick={openFigure}>Run, plant, kick</button>}
       {phase==='bench'&&<button type="button" className={s.tool} aria-pressed={!!compare} onClick={()=>setCompare(c=>c?null:'upper')} data-compare-btn>Materials</button>}
       {phase==='icons'&&<button type="button" className={s.tool} aria-pressed={powerOpen} onClick={()=>setPowerOpen(v=>!v)} data-power-btn>Superpowers</button>}
      </span>
      {phase==='bench'&&era==='today'&&<span className={s.eras} role="group" aria-label="Soleplate">{(Object.keys(PLATES) as PlateId[]).map(p=><button key={p} type="button" aria-pressed={plate===p} data-plate-btn={p} onClick={()=>choosePlate(p)} title={PLATES[p].name}>{PLATES[p].code}</button>)}</span>}
      <button type="button" className={g.btn} data-next onClick={()=>goto(phase==='bench'?'build':'score')}>{phase==='bench'?'Next: build one':'Finish'}</button>
     </>}
     {phase==='build'&&<>
      <span className={s.chips} role="group" aria-label="Layers to place">{chips.map(id=><button key={id} type="button" disabled={placed.has(id)} data-chip={id} data-wrong={wrong===id||undefined} onClick={()=>placePart(id)}>{names[id].name}</button>)}</span>
      <span className={s.tools}><button type="button" className={s.tool} onClick={()=>turn(-1)} aria-label="Turn left">⟲</button><button type="button" className={s.tool} onClick={()=>turn(1)} aria-label="Turn right">⟳</button>
       <button type="button" className={s.tool} onClick={startBuild} data-build-again>Start again</button></span>
      <p className={s.say}>{buildPts!=null?<>Built: <b>{buildPts}</b>/10. {BUILD_NOTE}</>:`${placed.size} of ${order.length} layers in.`}</p>
      {buildPts!=null&&<button type="button" className={g.btn} data-next onClick={()=>goto('grip')}>Next: grip test</button>}
     </>}
     {phase==='grip'&&<>
      {!gripDone&&<span className={s.chips} role="group" aria-label="Studs">{(Object.keys(GRIP_STUDS) as GripStud[]).map(id=><button key={id} type="button" aria-pressed={stud===id} data-stud={id} disabled={G.running} onClick={()=>{setStud(id);setLastTest(null);grip.current.slide=0;grip.current.force=0;}}>{GRIP_STUDS[id].name}</button>)}</span>}
      {!gripDone&&<button type="button" className={s.hold} data-test onClick={runTest} disabled={G.running}>Pull!</button>}
      <span className={s.meter} data-meter={Math.round(G.force)} role="meter" aria-label="Grip" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(G.force)}><em>Grip</em><i style={{'--v':G.force/100} as CSSProperties} data-slip={G.slide>2||undefined}/><b>{Math.round(G.force)}</b></span>
      {!gripDone&&lastTest&&<button type="button" className={g.btn} data-next-pitch onClick={nextRound}>{round+1<GRIP_ROUNDS.length?'Next pitch':'See the score'}</button>}
      {gripDone&&<button type="button" className={g.btn} data-next onClick={()=>goto('weigh')}>Next: weigh</button>}
      <p className={s.small}>{GRIP_NOTE}</p>
     </>}
     {phase==='weigh'&&<>
      <span className={s.tools}><button type="button" className={s.tool} onClick={()=>setN(nNew-1)} disabled={nNew<=0} data-less>− modern boot</button><button type="button" className={s.hold} onClick={()=>setN(nNew+1)} disabled={nNew>=MAX_NEW} data-more>+ modern boot</button></span>
      <dl className={s.stats}><div><dt>Old boot</dt><dd>{OLD_G} g</dd></div><div><dt>Modern</dt><dd>{nNew*NEW_G} g</dd></div></dl>
      <button type="button" className={g.btn} data-next onClick={()=>goto('icons')}>Next: iconic boots</button>
     </>}
     {phase==='score'&&<p className={s.say}>Scroll down for the real story and the sources.</p>}
    </div>
   </div>

   <div className={s.below}>
    <section className={g.section} aria-labelledby="bt-facts">
     <p className={g.kicker}>The real story</p>
     <h2 id="bt-facts" className={g.h2}>Boots through time</h2>
     <ol className={s.eraList}>{ERAS.map(e=><li key={e.id}><span>{e.when}</span><b>{e.title}</b><ul>{e.facts.map(f=><li key={f}>{f}</li>)}</ul></li>)}</ol>
     <ol className={g.steps}>{exhibit.facts.map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
     <table className={s.table} data-icons-table><caption>Iconic boot lines</caption><thead><tr><th scope="col">Line</th><th scope="col">Since</th><th scope="col">What made it special</th><th scope="col">How it changed</th></tr></thead>
      <tbody>{ICONS.map(i=><tr key={i.id}><th scope="row">{i.name}</th><td>{i.year}</td><td>{i.special}</td><td>{i.changed}</td></tr>)}</tbody></table>
     <p className={g.small}>{ICON_NOTE} {GRIP_NOTE}</p>
    </section>
    <div ref={endRef}>{checked&&<Ending art={<EndBoot/>} seen="You’ve seen a football boot change from heavy nailed leather to a light knitted boot with a plate." take={exhibit.forYourGame} onComplete={onComplete} reached={checked}/>}</div>
    <footer><details className={g.sources}><summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details></footer>
   </div>
  </div>
 </section>;
}

/** The ending's mark: the old boot and today's, side by side (the same Paper boots, small and still). */
function EndBoot(){
 const art=useMemo(()=>thumb(ERAS[0].spec,240,150)+'',[]),art2=useMemo(()=>thumb(ERAS[4].spec,240,150),[]);
 return <svg viewBox="0 0 240 200" aria-hidden="true"><g transform="translate(0 0) scale(.62)" dangerouslySetInnerHTML={{__html:art}}/><g transform="translate(92 92) scale(.62)" dangerouslySetInnerHTML={{__html:art2}}/></svg>;
}
export {STEP,hideInner};
