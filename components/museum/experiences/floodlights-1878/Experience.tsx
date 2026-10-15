'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent as RKE,type PointerEvent as RPE} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import StepIcon from '../StepIcon';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import Slider from '../modern/Slider';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {ACCENT} from '../modern/tokens';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,ScoreCover,paper as p} from '../anatomy/PaperRoom';
import {useBox,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {axisVector,fitProjection,type Projection} from '../anatomy/iso-kit';
import {GX,GY,LIT,OMEGA_FULL,PARTS,READY_V,START_YAW,TOWER_AT,TOWER_NAME,angleStep,coast,coverage,crankSpeed,grid,isReady,lightAt,onWhenApart,pct,power,snapYaw,verdict,volts,type Coverage,type PartId,type Task} from './model';
import {AZ,EL,GX_RANGE,GY_RANGE,fitPoints,render,stationProj,towerFitPoints,type Anchors} from './scene';
import {BEATS,CHECKS,EXTRA,MODEL_NOTE,SOURCES} from './content';
import s from './Experience.module.css';

/**
 * floodlights-1878 · "Under the lights" (Oct 14 2026 redo; user: "more interactive with the anatomy skill … turn knobs and things
 * to make it do something … like the stadiums' breakdown of the layers"). The first floodlit football match, Bramall Lane,
 * Sheffield, 14 October 1878. Anatomy Paper room, one accent: yellow, the colour of the light.
 *
 * THE NIGHT RIG (scene.ts): a model ground on a bench, in the dark. Every control does something you can see:
 *  - the dynamo's CRANK: drag round the flywheel (or hold the right arrow). Faster turning, more volts on the voltmeter's needle,
 *    and the lamps' power grows with the square of the volts. Let go and the flywheel runs down and the lights fade.
 *  - the MOTOR LEVER: takes over the crank and holds full power, so your hands are free.
 *  - each tower's LAMP (a swivel with a 15° dial): drag a lamp head to point its beam (arrow keys: one detent). The light map on
 *    the grass, the beams and every player's shadows follow.
 *  - the LUX PROBE on the gantry: drag anywhere on the pitch; the gantry rides its rails and the meter reads the light there,
 *    with a mark at "enough to play".
 *  - TAKE A TOWER APART (a slider): footing, mast, platform, arc lamp (carbon rods), reflector and cable lift apart, numbered;
 *    tap a number to read what that part does.
 * Then the quick check (StepCheck) and the Ending (onComplete once).
 * Heat: one SVG string written into the card by paint(); the shared loop (anatomy/paper-loop.ts) runs only while a control is
 * being used or something settles (the flywheel running down, a lamp swinging to its detent, the tower coming apart) and stops
 * at rest: with the motor holding full power the wheel is drawn as a blur, still. Reduced motion: every settle lands at once.
 */
type Phase='intro'|'play'|'check';
const ACC=ACCENT.yellow;
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
type Drag={kind:'crank';id:number;a:number;acc:number}|{kind:'lamp';id:number;i:number}|{kind:'probe';id:number};
const TASKS:{id:Task;label:string}[]=[{id:'power',label:'Power up'},{id:'aim',label:'Light it all'},{id:'probe',label:'Measure'},{id:'apart',label:'Take apart'}];

/** The light map: one pixel per grid cell, night blue where it is dark, warm where it is lit (smoothed by the browser). */
function lightImage(cv:HTMLCanvasElement|null,gr:Float32Array){
 if(!cv)return undefined;const c=cv.getContext('2d');if(!c)return undefined;const im=c.createImageData(GX,GY);
 for(let i=0;i<gr.length;i++){const l=Math.min(1,gr[i]/(LIT*2.4)),o=i*4,dark=gr[i]<LIT;
  im.data[o]=Math.round(9+(255-9)*l);im.data[o+1]=Math.round(13+(214-13)*l);im.data[o+2]=Math.round(26+(110-26)*l);
  im.data[o+3]=Math.round(255*(dark?Math.max(.42,(1-l)*.9):Math.max((1-l)*.6,l*.26)));}
 c.putImageData(im,0,0);try{return cv.toDataURL();}catch{return undefined;}
}

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [cardRef,box]=useBox<HTMLDivElement>();
 const svgRef=useRef<SVGSVGElement>(null),modelRef=useRef<SVGGElement>(null),readRef=useRef<HTMLSpanElement>(null),cvRef=useRef<HTMLCanvasElement|null>(null);
 const [done,setDone]=useState<Record<Task,boolean>>({power:false,aim:false,probe:false,apart:false});
 const [word,setWord]=useState(()=>verdict({lit:0,dark:GX*GY,min:0,minAt:[0,0]},0));
 const [motor,setMotor]=useState(false),[apart,setApart]=useState(0),[focus,setFocus]=useState<PartId|null>(null);
 const [anchors,setAnchors]=useState<Anchors|null>(null),[probeVal,setProbeVal]=useState(0);
 const [checked,setChecked]=useState(false),[round,setRound]=useState(0);
 const R=useRef({yaw:[...START_YAW],yawT:[...START_YAW],omega:0,wheel:-.6,motor:false,gx:-20,gy:-12,apart:0,apartT:0,drag:null as Drag|null,
  lightKey:'',href:undefined as string|undefined,cov:coverage(new Float32Array(GX*GY)) as Coverage,word:'',focus:null as PartId|null,cue:'crank' as 'crank'|'knob'|'probe'|null,done:{power:false,aim:false,probe:false,apart:false} as Record<Task,boolean>});
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const kd=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeRef.current();}};window.addEventListener('keydown',kd);return()=>window.removeEventListener('keydown',kd);},[]);
 useEffect(()=>{cvRef.current=document.createElement('canvas');cvRef.current.width=GX;cvRef.current.height=GY;},[]);

 // ── The camera: the bench fills the card (a side column for the parts list while a tower is apart on a wide card) ──────
 const W=box.w||1,Hh=box.h||1,wide=W>=Hh*1.05&&W>=700;
 const projFor=useCallback((e:number):Projection=>{
  // Taking the tower apart also moves the camera in on it (the breakdown fills the card), and makes room for the parts list.
  const u=Math.max(0,Math.min(1,(e-.02)/.6)),z=u*u*(3-2*u),side=wide?Math.min(300,W*.26)*z:0,top=wide?34:30,bot=wide?30:26+132*z,aw=W-side-12,ah=Hh-top-bot;
  const opt={azimuth:wide?AZ.wide:AZ.tall,elevation:wide?EL.wide:EL.tall};
  const A=fitProjection(fitPoints(0,wide?'wide':'tall'),Math.max(40,aw),Math.max(40,ah),{pad:wide?18:-4,...opt});
  if(z<=0)return {...A,origin:[A.origin[0]+6,A.origin[1]+top]};
  const B=fitProjection(towerFitPoints(),Math.max(40,aw),Math.max(40,ah),{pad:wide?30:16,...opt}),m=(a:number,b:number)=>a+(b-a)*z;
  return {...A,scale:m(A.scale,B.scale),origin:[m(A.origin[0],B.origin[0])+6,m(A.origin[1],B.origin[1])+top]};
 },[W,Hh,wide]);
 const projRef=useRef<Projection|null>(null);

 const markDone=useCallback((t:Task)=>{const D=R.current.done;if(D[t])return;D[t]=true;setDone({...D});sfx(t==='aim'?museumSfx.reveal:museumSfx.stamp);},[]);
 const paint=useCallback((lite=false)=>{
  const el=modelRef.current;if(!el||!box.w)return;const V=R.current,P=projFor(V.apart);projRef.current=P;
  const v=volts(V.omega),pw=power(v),on=onWhenApart(V.apart),key=`${pw.toFixed(3)}|${V.yaw.map(y=>y.toFixed(1)).join(',')}|${on[1].toFixed(2)}`;
  if(key!==V.lightKey){const gr=grid({yaw:V.yaw,on},pw);V.cov=coverage(gr);V.href=lightImage(cvRef.current,gr);V.lightKey=key;}
  const cue=!V.done.power?'crank':!V.done.aim?'knob':!V.done.probe?'probe':null;V.cue=cue;
  const r=render(P,{yaw:V.yaw,omega:V.omega,wheel:V.wheel,motor:V.motor,gx:V.gx,gy:V.gy,apart:V.apart,lightHref:V.href,lite,focus:V.focus,cue:phase==='play'?cue:null},wide?'wide':'tall');
  el.innerHTML=r.svg;
  const reading=lightAt({yaw:V.yaw,on},pw,V.gx,V.gy);
  if(readRef.current){const t=`${Math.round(v)} V · ${pct(V.cov.lit)}% LIT · PROBE ${reading.toFixed(1)}`;if(readRef.current.textContent!==t)readRef.current.textContent=t;}
  setAnchors(a=>a&&a.crank[0]===r.anchors.crank[0]&&a.crank[1]===r.anchors.crank[1]&&a.probe[0]===r.anchors.probe[0]&&a.probe[1]===r.anchors.probe[1]&&a.knobs.every((k,i)=>k[0]===r.anchors.knobs[i][0]&&k[1]===r.anchors.knobs[i][1])&&Object.keys(a.parts).length===Object.keys(r.anchors.parts).length&&(V.apart===0||V.apart===V.apartT)?a:r.anchors);
  setProbeVal(x=>Math.abs(x-reading)<.05?x:reading);
  // tasks and the verdict
  if(phase==='play'){
   if(v>=READY_V)markDone('power');
   if(isReady(V.cov,v))markDone('aim');
   if(V.apart>=.9)markDone('apart');
   const w=verdict(V.cov,v),wk=w.kind+w.big+w.line;if(wk!==V.word){V.word=wk;setWord(w);}
  }
 },[box.w,projFor,phase,markDone]);

 const loop=usePaperLoop((dt)=>{const V=R.current;let moving=false;
  const d=V.drag;
  if(d?.kind==='crank'){V.omega=crankSpeed(V.omega,d.acc,dt);d.acc=0;moving=!reduced;}
  else if(reduced){const o=V.motor?OMEGA_FULL:0;if(o!==V.omega)V.omega=o;}// reduced motion: no run-down, the flywheel stops at once
  else{const o=coast(V.omega,V.motor,dt);if(o!==V.omega){V.omega=o;moving=!(V.motor&&o===OMEGA_FULL);}V.wheel+=V.omega*dt*(V.motor&&V.omega>=OMEGA_FULL?0:1);}
  for(let i=0;i<4;i++){const t=V.yawT[i],c=V.yaw[i],st=angleStep(c*Math.PI/180,t*Math.PI/180)*180/Math.PI;
   if(reduced)V.yaw[i]=t;else if(Math.abs(st)>.05){V.yaw[i]=c+st*(1-Math.exp(-dt/(d?.kind==='lamp'&&d.i===i?.04:.12)));moving=true;}else V.yaw[i]=t;}
  if(reduced&&V.apart!==V.apartT){V.apart=V.apartT;setApart(V.apart);}
  if(V.apart!==V.apartT){const n=V.apart+(V.apartT-V.apart)*(1-Math.exp(-dt/.22));V.apart=Math.abs(n-V.apartT)<.002?V.apartT:n;moving=true;if(V.apart===V.apartT)setApart(V.apart);}
  if(d&&!reduced)moving=true;
  paint(moving&&!reduced);
  return moving;},cardRef,reduced);
 const wake=loop.wake;
 useLayoutEffect(()=>{paint();},[paint,box.w,box.h,phase,focus]);

 // ── Controls ───────────────────────────────────────────────────────────────────────────────────────────────────────
 const wheelAngle=(e:{clientX:number;clientY:number})=>{const P=projRef.current,svg=svgRef.current;if(!P||!svg||!anchors)return 0;const r=svg.getBoundingClientRect();
  const Ps=stationProj(P,wide?'wide':'tall'),dx=e.clientX-r.left-anchors.crank[0],dy=e.clientY-r.top-anchors.crank[1],ex=axisVector(Ps,[1,0,0]),ez=axisVector(Ps,[0,0,1]);
  const det=ex[0]*ez[1]-ex[1]*ez[0]||1,c=(dx*ez[1]-dy*ez[0])/det,sn=(ex[0]*dy-ex[1]*dx)/det;return Math.atan2(sn,c);};
 const floorAt=(e:{clientX:number;clientY:number},z=2)=>{const P=projRef.current,svg=svgRef.current;if(!P||!svg)return [0,0] as [number,number];const r=svg.getBoundingClientRect();return toFloor(e.clientX-r.left,e.clientY-r.top,P,z);};
 const moveProbe=(x:number,y:number)=>{const V=R.current;V.gx=Math.max(GX_RANGE[0],Math.min(GX_RANGE[1],x));V.gy=Math.max(GY_RANGE[0],Math.min(GY_RANGE[1],y));
  if(V.omega>0)markDone('probe');};
 const capture=(e:RPE<Element>)=>{try{svgRef.current?.setPointerCapture?.(e.pointerId);}catch{/* synthetic */}};
 const down=(kind:'crank'|'lamp'|'probe'|'lever',i=0)=>(e:RPE<Element>)=>{if(phase!=='play')return;e.preventDefault();e.stopPropagation();const V=R.current;
  if(kind==='lever'){toggleMotor();return;}
  capture(e);
  if(kind==='crank'){if(V.motor)setMotorTo(false);const a=wheelAngle(e);V.drag={kind,id:e.pointerId,a,acc:0};V.wheel=a;sfx(museumSfx.turn);}
  else if(kind==='lamp'){V.drag={kind,id:e.pointerId,i};sfx(museumSfx.tick);}
  else{V.drag={kind,id:e.pointerId};const [x,y]=floorAt(e);moveProbe(x,y);}
  wake();};
 const move=(e:RPE<SVGSVGElement>)=>{const V=R.current,d=V.drag;if(!d||d.id!==e.pointerId)return;
  if(d.kind==='crank'){const a=wheelAngle(e);d.acc+=angleStep(d.a,a);d.a=a;V.wheel=a;}
  else if(d.kind==='lamp'){const [x,y]=floorAt(e),[tx,ty]=TOWER_AT[d.i];if(Math.hypot(x-tx,y-ty)>6){const yv=Math.atan2(y-ty,x-tx)*180/Math.PI;V.yawT[d.i]=yv;}}
  else{const [x,y]=floorAt(e);moveProbe(x,y);}
  wake();};
 const up=(e:RPE<SVGSVGElement>)=>{const V=R.current,d=V.drag;if(!d||d.id!==e.pointerId)return;V.drag=null;
  if(d.kind==='lamp'){V.yawT[d.i]=snapYaw(V.yawT[d.i]);sfx(museumSfx.tick);}
  wake();};
 const setMotorTo=(on:boolean)=>{const V=R.current;V.motor=on;setMotor(on);sfx(on?museumSfx.spin:museumSfx.tick);wake();};
 const toggleMotor=()=>setMotorTo(!R.current.motor);
 const keyCrank=(e:RKE)=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'||e.key===' '||e.key==='Enter'){e.preventDefault();const V=R.current;if(V.motor)setMotorTo(false);V.omega=Math.min(OMEGA_FULL*1.1,V.omega+OMEGA_FULL*.22);V.wheel+=.8;sfx(museumSfx.turn);wake();}};
 const keyLamp=(i:number)=>(e:RKE)=>{const st=e.key==='ArrowRight'||e.key==='ArrowUp'?15:e.key==='ArrowLeft'||e.key==='ArrowDown'?-15:0;if(!st)return;e.preventDefault();
  const V=R.current;V.yawT[i]=snapYaw(V.yawT[i]+st);sfx(museumSfx.tick);wake();};
 const keyProbe=(e:RKE)=>{const m:Record<string,[number,number]>={ArrowRight:[8,0],ArrowLeft:[-8,0],ArrowUp:[0,-8],ArrowDown:[0,8]},d=m[e.key];if(!d)return;e.preventDefault();
  const V=R.current;moveProbe(V.gx+d[0],V.gy+d[1]);wake();};
 const keyLever=(e:RKE)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleMotor();}};
 const setApartTo=(x:number,ease=true)=>{const V=R.current;V.apartT=Math.max(0,Math.min(1,x));if(!ease||reduced){V.apart=V.apartT;setApart(V.apart);}if(V.apartT<.3)setFocus(null);wake();};
 useEffect(()=>{R.current.focus=focus;},[focus]);

 const start=()=>{unlockMuseumAudio();setPhase('play');sfx(museumSfx.flapBook);};
 const toCheck=()=>{setPhase('check');sfx(museumSfx.flapBook);};
 const again=()=>{const V=R.current;V.yaw=[...START_YAW];V.yawT=[...START_YAW];V.omega=0;V.motor=false;V.apart=V.apartT=0;V.done={power:false,aim:false,probe:false,apart:false};
  setDone({...V.done});setMotor(false);setApart(0);setFocus(null);setChecked(false);setRound(n=>n+1);setPhase('play');};
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const canCheck=done.power&&done.aim&&done.apart;
 const showParts=phase==='play'&&apart>.3&&anchors;
 const kk=anchors?.scale??1,hitR=(r:number)=>Math.max(24,r);

 const label=`A model football ground on a bench at night: four light towers, a gantry with a light meter over the pitch, and a dynamo with a crank, a motor lever and a voltmeter in front.`;
 const intro=phase==='intro'&&<IntroPanel kicker={`Real history · ${exhibit.year}`} title={<>Under the <em>lights</em></>} deck={exhibit.facts[0]} beats={BEATS}/>;
 const check=phase==='check'&&<ScoreCover kicker="Quick check · under the lights" score="1878" unit="the first football match under floodlights"
  notes={<><p><b>Power and light from every side.</b> {EXTRA.match}</p><p>{EXTRA.power}</p></>}
  buttons={<button type="button" className={p.ghost} data-light-again onClick={again}>Back to the rig</button>}>
  <div className={s.ink}>
   <StepCheck key={round} items={CHECKS} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
    renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You powered the lamps with a dynamo, lit the pitch from every corner and took a light tower apart." take={exhibit.forYourGame}/>}/>
  </div>
 </ScoreCover>;

 const overlay=phase==='play'&&anchors&&<g data-hits>
  <path d={`M${anchors.pitch.map(q=>q.join(' ')).join('L')}Z`} className={s.hit} data-hit="probe" role="slider" tabIndex={0} aria-label="The light meter on the gantry. Drag it over the pitch, or use the arrow keys." aria-valuetext={`${probeVal.toFixed(1)} light, ${probeVal>=LIT?'enough to play':'a dark spot'}`}
   onPointerDown={down('probe')} onKeyDown={keyProbe}/>
  <circle cx={anchors.crank[0]} cy={anchors.crank[1]} r={hitR(anchors.crankR*1.25)} className={s.hit} data-hit="crank" role="slider" tabIndex={0} aria-label="The dynamo's crank. Drag round the wheel to turn it, or press the right arrow again and again."
   aria-valuetext={`${Math.round(volts(R.current.omega))} volts`} onPointerDown={down('crank')} onKeyDown={keyCrank}/>
  <circle cx={anchors.lever[0]} cy={anchors.lever[1]} r={hitR(11*kk)} className={s.hit} data-hit="lever" role="switch" aria-checked={motor} tabIndex={0} aria-label="Motor lever: the motor turns the dynamo for you"
   onPointerDown={down('lever')} onKeyDown={keyLever}/>
  {anchors.knobs.map((q,i)=><circle key={i} cx={q[0]} cy={q[1]} r={hitR(9*kk)} className={s.hit} data-hit="lamp" data-lamp={i} role="slider" tabIndex={0}
   aria-label={`${TOWER_NAME[i]} tower's lamp. Drag it to point the light, or use the arrow keys to swing it 15 degrees.`} aria-valuetext={`${Math.round(R.current.yawT[i])} degrees`}
   onPointerDown={down('lamp',i)} onKeyDown={keyLamp(i)}/>)}
 </g>;
 const badgeAt=useMemo(()=>{const out:Partial<Record<PartId,[number,number]>>={};if(!anchors)return out;const list=PARTS.map(pt=>({id:pt.id,q:anchors.parts[pt.id]})).filter(x=>x.q) as {id:PartId;q:[number,number]}[];
  if(!list.length)return out;const col=Math.min(W-22,Math.max(...list.map(x=>x.q[0]))+30);let y=-1e9;
  for(const it of [...list].sort((a,b)=>a.q[1]-b.q[1])){y=Math.max(it.q[1],y+30);out[it.id]=[col,y];}return out;},[anchors,W]);
 const badges=showParts&&<g data-badges>{PARTS.map((pt,i)=>{const q=anchors.parts[pt.id],b=badgeAt[pt.id];if(!q||!b)return null;
  return <g key={pt.id} className={s.badge} data-on={focus===pt.id||undefined} data-part={pt.id} role="button" tabIndex={0} aria-label={`${i+1}: ${pt.name}`} aria-pressed={focus===pt.id}
   onPointerDown={e=>{e.stopPropagation();setFocus(f=>f===pt.id?null:pt.id);sfx(museumSfx.tick);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setFocus(f=>f===pt.id?null:pt.id);}}}>
   <path d={`M${q[0]} ${q[1]}L${b[0]-12} ${b[1]}`}/><circle cx={q[0]} cy={q[1]} r={2.4} className={s.badgeEnd}/>
   <circle cx={b[0]} cy={b[1]} r={22} className={s.badgeHit}/><circle cx={b[0]} cy={b[1]} r={12}/><text x={b[0]} y={b[1]+4.5}>{i+1}</text></g>;})}</g>;

 return <PaperRoom id="floodlights-1878" accent={ACC} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-motor':motor||undefined,'data-apart':apart.toFixed(2),'data-tasks':TASKS.filter(t=>done[t.id]).map(t=>t.id).join(' '),'data-orient':wide?'wide':'tall','data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Bramall Lane, Sheffield</>}/>}
  card={<PaperCard ref={cardRef} className={`${p.card} iso ${s.card}`} fig={`Fig. ${exhibit.year}`} title="The night rig"
    hint={phase==='play'?(apart>.3?'Tap a number to read a part':'Crank · point the lamps · drag the meter'):'A model ground at night'} readout="0 V · 0% LIT" readoutRef={readRef} cover={intro||check||null}>
   <div className={s.stage} data-stage>
    {box.w>0&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${Hh}`} width={W} height={Hh} role="img" aria-label={label}
     onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
     <g ref={modelRef} data-model=""/>{overlay}{badges}
    </svg>}
   </div>
   {showParts&&<div className={s.parts} data-parts data-wide={wide||undefined}>
    {wide?<ol>{PARTS.map((pt,i)=><li key={pt.id}><button type="button" aria-pressed={focus===pt.id} data-part-label={pt.id} onClick={()=>setFocus(f=>f===pt.id?null:pt.id)}>
      <b><i>{i+1}</i>{pt.name}</b><span>{pt.line}</span></button></li>)}</ol>
     :<p>{focus?<><b>{PARTS.findIndex(x=>x.id===focus)+1} · {PARTS.find(x=>x.id===focus)!.name}.</b> {PARTS.find(x=>x.id===focus)!.line}</>:<>A light tower in six parts. <b>Tap a number</b> to read what each part does.</>}</p>}
   </div>}
  </PaperCard>}
  dock={phase==='intro'?<StartDock label="Switch on the rig" line="Crank the dynamo, aim four lamps, measure the light, take a tower apart." onStart={start}/>
  :phase==='play'?<>
   <div className={s.tasks} role="list" aria-label="Your jobs">{TASKS.map((t,i)=><span key={t.id} role="listitem" className={s.task} data-done={done[t.id]||undefined} data-task={t.id}><i>{i+1}</i>{t.label}</span>)}</div>
   <p className={p.say} aria-live="polite" data-verdict={word.kind}><b>{word.big}.</b> {word.line}{done.probe&&!done.apart?<> The meter reads <b>{probeVal.toFixed(1)}</b>{probeVal<LIT?': a dark spot.':': enough to play.'}</>:null}</p>
   <div className={p.row}>
    <button type="button" className={p.ghost} aria-pressed={motor} data-motor-btn onClick={toggleMotor}>{motor?'Motor on':'Motor off'}</button>
    <Slider name="apart" label="Take a tower apart" value={Math.round(apart*100)} min={0} max={100} step={1} show={`${Math.round(apart*100)}%`} onChange={x=>{setApart(x/100);setApartTo(x/100,false);}}/>
    <button type="button" className={`${p.btn} ${s.go}`} data-tone="acc" data-to-check data-museum-own-cue disabled={!canCheck} onClick={toCheck}>Quick check<StepIcon kind="next"/></button>
   </div>
  </>:null}>
  <section className={g.section} aria-labelledby="fl-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="fl-story" className={g.h2}>From two generators to every stadium</h2>
   <ol className={g.steps}>{[...exhibit.facts,EXTRA.match,EXTRA.power,EXTRA.arc,EXTRA.others,EXTRA.slow].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
   <p className={g.small}>{MODEL_NOTE}</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: a lit pitch with a lamp on a tower in each corner. */
function EndArt(){
 return <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="12" width="24" height="16" fill="#f3ecd0" stroke="#1d1d1b" strokeWidth=".8"/>
  {[[5,9],[35,9],[35,31],[5,31]].map(([x,y])=><circle key={x+'-'+y} cx={x} cy={y} r="3" fill={ACC} stroke="#1d1d1b" strokeWidth=".8"/>)}</svg>;
}
