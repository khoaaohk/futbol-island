'use client';
import {useCallback,useEffect,useMemo,useReducer,useRef,useState,type CSSProperties,type PointerEvent as RPE} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import {ISO_CSS,fitProjection,type Projection,type Point3} from '../anatomy/iso-kit';
import {useSize} from '../anatomy/hooks';
import {useFrameLoop} from '../anatomy/paper-loop';
import type {ExperienceProps} from '../types';
import {COPY,SOURCES} from './hallData';
import {TROPHIES,byId,reach,type Trophy,type TrophyId} from './trophies';
import {drawTrophy,trophyBox} from './model';
import {BEST_KEY,COMPARE,MATCH,coast,follow,sanitizeSave,stars,tiltFor,winner,type Save} from './game';
import {AZ,AZ_BENCH,AZ_CAB,EL,BENCH_PLAN,Beam,BenchStatic,CAB_TALL,CAB_WIDE,Cabinet,Crank,Cursors,Gauge,KG,Leaders,Marks,PLINTH_GAP,PlinthLetter,PlinthsStatic,StandStatic,TrophyArt,TrophyDefs,
 benchPoints,cabinet,kOf,panZ,plinths,poseAt,stand,type Box} from './scene';
import s from './Experience.module.css';

/**
 * hall-of-fame · the Trophy room (Oct 12 2026; user: "Change the your hall of fame exhibit to something else. don't like this
 * idea", chose "Trophy room"; Oct 14 2026: the player's own shelf of cups and certificates was removed — the room is now purely
 * the real trophies). A full-screen game in the anatomy Paper style (docs/museum-paper-style.md):
 *  1. The cabinet: eight of football's great trophies behind glass, all at true size. Tap one.
 *  2. The turntable: drag to spin it; a height gauge's arm rests on its top (the readout is the arm's height); "Take it apart"
 *     lifts its parts with leader lines (base, malachite bands, handles, globe…). Facts and one story per trophy, all sourced.
 *  3. Match it: six rounds, the trophy for a story, a tournament or a shadow on a paper screen.
 *  4. Measure and weigh: six pairs on a pan balance with a ruler column. Taller is not always heavier.
 *  Then the quick check (StepCheck) → the shared Ending (`reached`) → onComplete, once.
 * Heat: one loop (anatomy/paper-loop.ts via useFrameLoop) runs only while something eases (a coasting turntable, the explode, the
 * gauge arm, the balance, the cursors); 0 frames at rest, parked off-screen, disposed on unmount. Reduced motion: every motion
 * lands at once, the turntable turns in 45° steps. Progress (trophies seen, best scores) is kept under BEST_KEY.
 */
type Station='cabinet'|'turn'|'match'|'compare'|'check';
const STATIONS:{id:Station;label:string;short:string}[]=[{id:'cabinet',label:'Cabinet',short:'Cabinet'},{id:'match',label:'Match it',short:'Match'},{id:'compare',label:'Measure',short:'Measure'},{id:'check',label:'Check',short:'Check'}];
const sfx=(c:'click'|'reveal'|'look'|'tick'|'card')=>{try{(museumSfx as unknown as Record<string,()=>void>)[c]?.();}catch{/* sound is optional */}};
const readSave=():Save=>{try{return sanitizeSave(JSON.parse(localStorage.getItem(BEST_KEY)??'null'));}catch{return sanitizeSave(null);}};
const writeSave=(v:Save)=>{try{localStorage.setItem(BEST_KEY,JSON.stringify(v));}catch{/* private mode */}};
const CHECK=[
 {q:'Which trophy is the smallest in the cabinet, but heavier than the Women’s World Cup trophy?',options:['The World Cup trophy','The Asian Cup trophy','The Copa América trophy'],right:0,why:'36.8 cm of solid 18-carat gold weighs 6.175 kg.'},
 {q:'Who found the stolen Jules Rimet trophy in 1966?',options:['A police officer','A dog called Pickles','A goalkeeper'],right:1,why:'Pickles the dog sniffed it out under a garden hedge in south London, seven days after it was stolen.'},
 {q:'How many of football’s great trophies stand in this cabinet?',options:['Six','Eight','Ten'],right:1,why:'Eight trophies, from the World Cup to the FA Cup, each at its true size.'},
] as const;
const capture=(e:{currentTarget:EventTarget;pointerId:number})=>{try{(e.currentTarget as Element).setPointerCapture?.(e.pointerId);}catch{/* no active pointer */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const root=useRef<HTMLElement>(null),card=useRef<HTMLDivElement>(null),endRef=useRef<HTMLDivElement>(null);
 const reduced=useReduced();
 const {w:W,h:H}=useSize(card);
 // the note card comes and goes with the station: measure whichever one is mounted (a callback ref, one ResizeObserver)
 const [noteEl,setNoteEl]=useState<HTMLDivElement|null>(null),[noteH,setNoteH]=useState(0);
 useEffect(()=>{if(!noteEl){setNoteH(0);return;}const read=()=>setNoteH(Math.round(noteEl.getBoundingClientRect().height));read();
  if(typeof ResizeObserver==='undefined')return;const ro=new ResizeObserver(read);ro.observe(noteEl);return()=>ro.disconnect();},[noteEl]);
 const tall=W>0&&W<H*1.05;
 const [,bump]=useReducer((n:number)=>n+1,0);
 const [station,setStation]=useState<Station>('cabinet');
 const [save,setSave]=useState<Save>(()=>sanitizeSave(null));
 const [ti,setTi]=useState<TrophyId>('worldcup');
 const [mi,setMi]=useState(0),[mPick,setMPick]=useState<TrophyId|null>(null),[mScore,setMScore]=useState(0),[mDone,setMDone]=useState(false);
 const [ci,setCi]=useState(0),[cPick,setCPick]=useState<'left'|'right'|null>(null),[cScore,setCScore]=useState(0),[cDone,setCDone]=useState(false);
 const [checked,setChecked]=useState(false);
 const [hot,setHot]=useState<string|null>(null);
 const completed=useRef(false);
 const complete=useCallback(()=>{if(completed.current)return;completed.current=true;onComplete?.();},[onComplete]);
 useEffect(()=>{setSave(readSave());root.current?.focus({preventScroll:true});},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape'||e.defaultPrevented)return;if(document.querySelector('dialog[open]'))return;/* the host's certificate is on top: let it close first */
  e.preventDefault();onClose();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);
 const store=useCallback((f:(v:Save)=>Save)=>setSave(v=>{const n=f(v);writeSave(n);return n;}),[]);

 // ── motion: one loop for everything that eases ───────────────────────────────────────────────────────────────────────
 const mo=useRef({spin:.5,vel:0,apart:0,apartTo:0,arm:0,armTo:0,tilt:0,tiltTo:0,cl:0,cr:0,clTo:0,crTo:0});
 const loop=useFrameLoop(dt=>{const m=mo.current;let more=false;
  if(m.vel){m.spin+=m.vel*dt;m.vel=coast(m.vel,dt);more=more||m.vel!==0;}
  const ease=(a:'apart'|'arm'|'tilt'|'cl'|'cr',to:number,tau:number,eps:number)=>{m[a]=follow(m[a],to,dt,tau);if(Math.abs(m[a]-to)<eps)m[a]=to;else more=true;};
  ease('apart',m.apartTo,.28,.004);ease('arm',m.armTo,.32,.02);ease('tilt',m.tiltTo,.42,.0005);ease('cl',m.clTo,.36,.03);ease('cr',m.crTo,.36,.03);
  bump();return more;},card,reduced);
 const wake=loop.wake;

 const trophy=byId(ti)!;
 const go=(st:Station)=>{sfx('look');setStation(st);if(st==='compare')setupCompare(ci,cPick);};
 const openTrophy=(id:TrophyId)=>{const t=byId(id)!;setTi(id);setStation('turn');sfx('card');const m=mo.current;m.apartTo=0;m.apart=0;m.vel=0;m.armTo=t.heightCm??0;if(!t.heightCm)m.arm=0;
  store(v=>v.seen.includes(id)?v:{...v,seen:[...v.seen,id]});wake();};
 const stepTrophy=(d:number)=>{const i=TROPHIES.findIndex(t=>t.id===ti);openTrophy(TROPHIES[(i+d+TROPHIES.length)%TROPHIES.length].id);};
 const flick=(dir:number)=>{const m=mo.current;if(reduced){m.spin+=dir*Math.PI/4;bump();return;}m.vel=dir*5.5;wake();};
 const toggleApart=()=>{const m=mo.current;m.apartTo=m.apartTo>.5?0:1;sfx('click');wake();};

 // ── match ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const round=MATCH[Math.min(mi,MATCH.length-1)];
 const pickMatch=(id:TrophyId)=>{if(mPick||mDone)return;setMPick(id);const ok=id===round.right;sfx(ok?'reveal':'tick');if(ok)setMScore(v=>v+1);};
 const nextMatch=()=>{if(mi+1>=MATCH.length){setMDone(true);const sc=mScore;store(v=>({...v,match:Math.max(v.match,sc)}));return;}setMi(mi+1);setMPick(null);sfx('click');};
 const replayMatch=()=>{setMi(0);setMPick(null);setMScore(0);setMDone(false);};

 // ── measure and weigh ───────────────────────────────────────────────────────────────────────────────────────────────────
 const cr=COMPARE[Math.min(ci,COMPARE.length-1)];
 function setupCompare(i:number,picked:'left'|'right'|null){const r=COMPARE[i],m=mo.current,L=byId(r.left)!,R=byId(r.right)!;
  if(!picked){m.tiltTo=0;m.clTo=0;m.crTo=0;}
  else if(r.ask==='heavier'){m.tiltTo=tiltFor(L.weightKg!,R.weightKg!);m.clTo=0;m.crTo=0;}
  else{m.tiltTo=0;m.clTo=L.heightCm!;m.crTo=R.heightCm!;}
  wake();}
 const pickCompare=(side:'left'|'right')=>{if(cPick||cDone)return;setCPick(side);const ok=side===winner(cr);sfx(ok?'reveal':'tick');if(ok)setCScore(v=>v+1);setupCompare(ci,side);};
 const nextCompare=()=>{if(ci+1>=COMPARE.length){setCDone(true);const sc=cScore;store(v=>({...v,compare:Math.max(v.compare,sc)}));return;}setCi(ci+1);setCPick(null);setupCompare(ci+1,null);sfx('click');};
 const replayCompare=()=>{setCi(0);setCPick(null);setCScore(0);setCDone(false);setupCompare(0,null);};

 // ── spin by drag on the turntable ───────────────────────────────────────────────────────────────────────────────────────
 const drag=useRef<{x:number;t:number;v:number}|null>(null);
 const onDown=(e:RPE<SVGSVGElement>)=>{if(station!=='turn')return;drag.current={x:e.clientX,t:e.timeStamp,v:0};mo.current.vel=0;capture(e);};
 const onMove=(e:RPE<SVGSVGElement>)=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dt=Math.max(1,e.timeStamp-d.t);
  mo.current.spin+=dx*.011;d.v=d.v*.5+(dx*.011/(dt/1000))*.5;d.x=e.clientX;d.t=e.timeStamp;bump();};
 const onUp=()=>{const d=drag.current;drag.current=null;if(!d||reduced)return;if(Math.abs(d.v)>.4){mo.current.vel=Math.max(-9,Math.min(9,d.v));wake();}};
 const onKey=(e:React.KeyboardEvent)=>{if(station!=='turn')return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();mo.current.spin+=(e.key==='ArrowLeft'?-1:1)*Math.PI/12;bump();}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleApart();}};

 // ── layout: the scene fills the card; on wide cards a note sits at the right, on tall ones across the top ───────────────────
 const hasNote=station!=='cabinet'&&station!=='check';
 const noteW=Math.round(Math.min(400,Math.max(300,W*.3)));
 const region:Box=useMemo(()=>{const top=tall?(hasNote?noteH+18:34):34,bottom=tall?30:34;
  return hasNote&&!tall?{x:12,y:top,w:Math.max(80,W-noteW-40),h:Math.max(80,H-top-bottom)}:{x:8,y:top,w:Math.max(80,W-16),h:Math.max(80,H-top-bottom)};},[W,H,tall,hasNote,noteH,noteW]);
 const fitTo=useCallback((pts:Point3[],pad:number,az=AZ):Projection=>{const P=fitProjection(pts,region.w,region.h,{pad,azimuth:az,elevation:EL});return {...P,origin:[P.origin[0]+region.x,P.origin[1]+region.y]};},[region]);
 const cabL=tall?CAB_TALL:CAB_WIDE;
 const P=useMemo(()=>{
  if(station==='turn')return fitTo(stand(trophy).points,tall?10:18);
  if(station==='match'){const n=round.kind==='silhouette'?1:3;return fitTo(plinths(n).points,tall?6:16);}
  if(station==='compare')return fitTo(benchPoints(82),tall?6:16,tall?58:AZ_BENCH);
  return fitTo(cabinet(cabL).points,tall?6:14,AZ_CAB);
 },[station,trophy,tall,round.kind,fitTo,cabL]);
 const ready=W>0&&H>0;
 const m=mo.current;

 // ── what the card says (corner captions) ───────────────────────────────────────────────────────────────────────────────
 const seen=useMemo(()=>new Set(save.seen),[save.seen]);
 const readout=station==='turn'?(trophy.heightCm?`${trophy.heightCm} cm · ${KG(trophy.weightKg!)} kg`:'Height not published')
  :station==='match'?`Round ${Math.min(mi+1,MATCH.length)} / ${MATCH.length} · ${mScore} right`
  :station==='compare'?`Pair ${Math.min(ci+1,COMPARE.length)} / ${COMPARE.length} · ${cScore} right`
  :`${seen.size} of 8 looked at`;
 const hint=station==='turn'?(reduced?'Use the turn buttons':'Drag to spin · take it apart'):station==='match'?(round.kind==='silhouette'?'Pick the name that fits':'Tap the trophy that fits'):station==='compare'?(cr.ask==='taller'?'Which is taller?':'Which is heavier?')
  :'Tap a trophy to spin it';
 const title=station==='turn'?trophy.short:station==='match'?'Match it':station==='compare'?'Measure and weigh':'Trophy room';

 // ── scene ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
 let art:React.ReactNode=null,label='';
 if(ready&&station==='cabinet'){const C=cabinet(cabL);
  label=`A glass-fronted trophy cabinet with eight trophies at true size. ${seen.size} of 8 looked at.`;
  art=<g><Cabinet L={cabL} P={P} seen={seen} spin={.3} hot={hot}/>
   {C.slots.map(sl=>{const id=sl.id,t=byId(id)!,b=trophyBox(Math.min(reach(t),(sl.x1-sl.x0)/2),t.drawH+4,poseAt(P,sl.x,sl.y,sl.z,0));
    return <rect key={id} {...rect(b)} className={s.hit} fill="transparent" data-hof-open={id} aria-label={t.name} onPointerEnter={()=>setHot(id)} onPointerLeave={()=>setHot(null)} onClick={()=>openTrophy(id)}/>;})}
  </g>;}
 else if(ready&&station==='turn'){const S=stand(trophy),pose=poseAt(P,0,0,S.Z0,m.spin,m.apart);
  const drawn=drawTrophy(trophy,pose),crankFront=Math.cos(Math.PI*.42-m.spin-(AZ*Math.PI/180))>0;
  label=`${trophy.name} on a turntable${m.apart>.5?', taken apart into its parts':''}. ${trophy.heightCm?`The height gauge reads ${trophy.heightCm} cm.`:'Its height is not published.'}`;
  const lx=pose.c[0]+S.R*pose.k+24;
  art=<g>
   <StandStatic t={trophy} P={P}/>
   <Gauge t={trophy} P={P} armZ={m.arm} show={false} part="column"/>
   {!crankFront&&<Crank t={trophy} P={P} spin={m.spin}/>}
   <path className="iso-halo" d={`M${pose.c[0]-S.R*pose.k*.7} ${pose.c[1]}a${S.R*pose.k*.7} ${S.R*pose.k*.2} 0 1 0 ${S.R*pose.k*1.4} 0a${S.R*pose.k*.7} ${S.R*pose.k*.2} 0 1 0 ${-S.R*pose.k*1.4} 0Z`} opacity={.5}/>
   <Marks list={drawn.marks}/>
   {crankFront&&<Crank t={trophy} P={P} spin={m.spin}/>}
   <Gauge t={trophy} P={P} armZ={m.arm} show={!!trophy.heightCm&&m.apart<.05} part="arm"/>
   {m.apart>.6&&<g opacity={Math.min(1,(m.apart-.6)/.3)}><Leaders anchors={drawn.anchors} labels={Object.fromEntries(trophy.parts.map(p=>[p.id,p.label]))} x0={lx} box={region}/></g>}
  </g>;}
 else if(ready&&station==='match'){const S=plinths(round.kind==='silhouette'?1:3),sil=round.kind==='silhouette';
  label=sil?`A shadow of a trophy on a paper screen. ${mPick?'It is the '+byId(round.right)!.name+'.':''}`:`Three trophies on plinths: ${round.choices.map(id=>byId(id)!.short).join(', ')}.`;
  art=<g><PlinthsStatic n={S.xs.length} P={P} screen={sil}/>
   {sil?<TrophyArt t={byId(round.right)!} pose={poseAt(P,0,0,S.h,.5,0,!mPick)}/>
    :round.choices.map((id,i)=>{const t=byId(id)!,x=S.xs[i],pick=mPick===id,right=!!mPick&&id===round.right;
     return <g key={id} data-hof-choice={id} data-right={right||undefined} data-picked={pick||undefined}>
      <TrophyArt t={t} pose={poseAt(P,x,0,S.h,.5)}/>
      <PlinthLetter x={x} P={P} letter={'ABC'[i]} lit={right}/>
      <rect {...rect(trophyBox(Math.min(reach(t),PLINTH_GAP/2),t.drawH+S.h,poseAt(P,x,0,0,0)))} className={s.hit} fill="transparent" data-hof-pick={id} onClick={()=>pickMatch(id)}/>
     </g>;})}
  </g>;}
 else if(ready&&station==='compare'){const L=byId(cr.left)!,R=byId(cr.right)!,show=!!cPick&&cr.ask==='taller';
  label=`A pan balance with the ${L.short} trophy on the left and the ${R.short} trophy on the right, and a ruler between them.`;
  const zl=panZ(-1,m.tilt),zr=panZ(1,m.tilt),xl=-Math.cos(m.tilt)*46,xr=Math.cos(m.tilt)*46;
  art=<g><BenchStatic P={P} ruler={80}/>
   <Beam P={P} tilt={m.tilt} locked={cr.ask==='taller'||!cPick}/>
   <Cursors P={P} left={m.cl} right={m.cr} show={show}/>
   {[[L,xl,zl,'left'],[R,xr,zr,'right']].map(([t,x,z,side])=>{const tt=t as Trophy;return <g key={side as string} data-hof-side={side as string} data-right={!!cPick&&winner(cr)===side||undefined}>
    <TrophyArt t={tt} pose={poseAt(P,x as number,0,z as number,.5)}/>
    <rect {...rect(trophyBox(Math.min(reach(tt),40),tt.drawH+2,poseAt(P,x as number,0,z as number,0)))} className={s.hit} fill="transparent" data-hof-pick={side as string} onClick={()=>pickCompare(side as 'left'|'right')}/></g>;})}
  </g>;}
 else if(ready&&station==='check'){const C=cabinet(cabL);label='The trophy cabinet behind the quick check.';art=<g opacity={.5}><Cabinet L={cabL} P={P} seen={seen} spin={.3} hot={null}/></g>;void C;}

 const matchRight=mPick!=null&&mPick===round.right,compareRight=cPick!=null&&cPick===winner(cr);
 const canCheck=mDone&&cDone;

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${COPY.title}: eight trophies behind glass`} data-museum-experience="hall-of-fame"
  className={`${s.root} iso`} data-theme="light" data-station={station} data-orient={tall?'tall':'wide'} data-reduced={reduced||undefined} style={{'--accent':'#f2c230'} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={s.scroll} data-hof-scroll>
   <div className={s.screen} data-hof-screen>
    <header className={s.head}>
     <WallLabel as="h1" title={COPY.title} meta={<>{COPY.kicker} · {COPY.fact1}</>}/>
    </header>
    <div ref={card} className={s.card} data-fill-screen data-hof-stage tabIndex={0} onKeyDown={onKey} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">Fig. {station==='turn'?`1.${TROPHIES.findIndex(t=>t.id===ti)+1}`:{cabinet:1,match:2,compare:3,check:4}[station]}</span><span data-corner="title">{title}</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout" data-hof-readout>{readout}</span>
     </div>
     {ready&&<svg className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} data-hof-art={station}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-spin={station==='turn'||undefined}>
      <TrophyDefs/>{art}
     </svg>}
     {hasNote&&<div ref={setNoteEl} className={s.note} data-wide-note={!tall||undefined} style={tall?undefined:{width:noteW}} data-hof-note={station}>
      {station==='turn'&&<TrophyNote t={trophy}/>}
      {station==='match'&&(mDone?<div data-hof-match-done>
        <p className={s.noteKicker}>Match it · done</p><h2 className={s.noteTitle}>{mScore} of {MATCH.length} right</h2>
        <p className={s.stars} aria-label={`${stars(mScore,MATCH.length)} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<stars(mScore,MATCH.length)||undefined}/>)}</p>
        <p className={s.noteBody}>Best: {Math.max(save.match,mScore)} of {MATCH.length}. Next, put two trophies on the balance.</p></div>
       :<div data-hof-round={mi}>
        <p className={s.noteKicker}>Round {mi+1} of {MATCH.length} · {round.kind==='story'?'the story':round.kind==='tournament'?'the tournament':'the shadow'}</p>
        <h2 className={s.noteQ}>{round.ask}</h2>
        {mPick&&<p className={s.noteBody} role="status" data-hof-result={matchRight?'right':'wrong'}><b>{matchRight?'Right! ':'Not quite. '}</b>{round.why}</p>}
       </div>)}
      {station==='compare'&&(cDone?<div data-hof-compare-done>
        <p className={s.noteKicker}>Measure and weigh · done</p><h2 className={s.noteTitle}>{cScore} of {COMPARE.length} right</h2>
        <p className={s.stars} aria-label={`${stars(cScore,COMPARE.length)} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<stars(cScore,COMPARE.length)||undefined}/>)}</p>
        <p className={s.noteBody}>Taller isn’t always heavier: gold is heavy, and a tall cup can be thin silver.</p></div>
       :<div data-hof-pair={ci}>
        <p className={s.noteKicker}>Pair {ci+1} of {COMPARE.length} · {cr.ask==='taller'?'the ruler':'the balance'}</p>
        <h2 className={s.noteQ}>Which is {cr.ask}: the {byId(cr.left)!.short} trophy or the {byId(cr.right)!.short} trophy?</h2>
        {cPick&&<><p className={s.measure} data-hof-measure>{[cr.left,cr.right].map(id=>{const t=byId(id)!;return <span key={id}><small>{t.short}</small><b>{cr.ask==='taller'?`${t.heightCm} cm`:`${KG(t.weightKg!)} kg`}</b></span>;})}</p>
         <p className={s.noteBody} role="status" data-hof-result={compareRight?'right':'wrong'}><b>{compareRight?'Right! ':'Not quite. '}</b>{cr.why}</p></>}
       </div>)}
     </div>}
     {station==='check'&&<div className={s.panel} data-hof-final>
      <p className={s.noteKicker}>Quick check</p>
      {checked?<><h2 className={s.noteTitle}>The cabinet is yours.</h2><p className={s.noteBody}>Scroll down for your ending.</p></>
       :<StepCheck items={CHECK} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>sfx(ok?'reveal':'tick')} doneLabel="See the ending"
        onDone={()=>{setChecked(true);setTimeout(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60);}}/>}
     </div>}
    </div>

    <div className={s.dock} data-dock>
     <div className={s.stations} role="tablist" aria-label="Rooms of the game">{STATIONS.map((x,i)=>{const on=x.id===station||(x.id==='cabinet'&&station==='turn'),lock=x.id==='check'&&!canCheck;
      return <button key={x.id} type="button" role="tab" aria-selected={on} disabled={lock} data-hof-station={x.id}
       data-done={(x.id==='match'&&mDone)||(x.id==='compare'&&cDone)||(x.id==='check'&&checked)||undefined} onClick={()=>go(x.id)}><i>{i+1}</i><span data-long>{x.label}</span><span data-short>{x.short}</span></button>;})}</div>
     <div className={s.controls}>
      {station==='cabinet'&&<><p className={s.say}>{seen.size?`${seen.size} of 8 looked at. `:''}Tap a trophy to spin it. Then play <b>Match it</b>.</p>
       <button type="button" className={s.btn} data-hof-start onClick={()=>go('match')}>Play: match it</button></>}
      {station==='turn'&&<>
       <button type="button" className={s.ghost} data-hof-back onClick={()=>go('cabinet')} aria-label="Back to the cabinet">Cabinet</button>
       <button type="button" className={s.round} onClick={()=>stepTrophy(-1)} aria-label="Previous trophy">‹</button>
       <button type="button" className={s.round} onClick={()=>flick(-1)} aria-label="Turn left" data-hof-turn="left">⟲</button>
       <button type="button" className={s.round} onClick={()=>flick(1)} aria-label="Turn right" data-hof-turn="right">⟳</button>
       <button type="button" className={s.round} onClick={()=>stepTrophy(1)} aria-label="Next trophy">›</button>
       <button type="button" className={s.btn} data-hof-apart aria-pressed={m.apartTo>.5} onClick={toggleApart}>{m.apartTo>.5?'Put it together':'Take it apart'}</button>
      </>}
      {station==='match'&&(mDone?<><button type="button" className={s.ghost} onClick={replayMatch}>Play again</button><button type="button" className={s.btn} data-hof-next-room onClick={()=>go('compare')}>Next: measure and weigh</button></>
       :<>{round.choices.map((id,i)=><button key={id} type="button" className={s.choice} data-hof-answer={id} disabled={!!mPick}
         data-a={mPick?(id===round.right?'right':id===mPick?'wrong':undefined):undefined} onClick={()=>pickMatch(id)}><i>{round.kind==='silhouette'?i+1:'ABC'[i]}</i>{byId(id)!.short}</button>)}
        {mPick&&<button key="next" type="button" className={s.btn} data-hof-next onClick={nextMatch}>{mi+1<MATCH.length?'Next round':'See your score'}</button>}</>)}
      {station==='compare'&&(cDone?<><button type="button" className={s.ghost} onClick={replayCompare}>Play again</button>
        {canCheck?<button type="button" className={s.btn} data-hof-next-room onClick={()=>go('check')}>Quick check</button>
         :<p className={s.say}>Play Match it to unlock the quick check.</p>}</>
       :<>{(['left','right'] as const).map(side=>{const id=cr[side];return <button key={side} type="button" className={s.choice} data-hof-answer={side} disabled={!!cPick}
         data-a={cPick?(side===winner(cr)?'right':side===cPick?'wrong':undefined):undefined} onClick={()=>pickCompare(side)}><i>{side==='left'?'L':'R'}</i>{byId(id)!.short}</button>;})}
        {cPick&&<button key="next" type="button" className={s.btn} data-hof-next onClick={nextCompare}>{ci+1<COMPARE.length?'Next pair':'See your score'}</button>}</>)}
      {station==='check'&&<p className={s.say}>Three questions about the cabinet.</p>}
     </div>
    </div>
   </div>

   <div className={s.below}>
    <div ref={endRef}>{checked&&<Ending art={<EndCup/>} reached={checked} onComplete={complete}
     seen="You’ve seen eight great trophies: spun them, taken them apart, matched their stories, and weighed gold against silver." take={exhibit.forYourGame}/>}</div>
    <details className={s.sources}>
     <summary>Sources and what’s game fiction</summary>
     <p>{COPY.trophyNote}</p>
     <p>{COPY.gameNote}</p>
     <ul>{[...TROPHIES.flatMap(t=>t.sources),...SOURCES].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i).map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul>
    </details>
   </div>
  </div>
 </section>;
}
const rect=(b:Box)=>({x:b.x,y:b.y,width:b.w,height:b.h});

/** The facts for the trophy on the turntable. */
function TrophyNote({t}:{t:Trophy}){
 return <div data-hof-trophy={t.id}>
  <p className={s.noteKicker}>{t.tournament}</p>
  <h2 className={s.noteTitle}>{t.name}</h2>
  {t.official&&<p className={s.noteKicker} data-hof-official>Officially the {t.official}</p>}
  <dl className={s.facts}>
   <div><dt>Height</dt><dd>{t.heightCm?`${t.heightCm} cm`:'not published'}</dd></div>
   <div><dt>Weight</dt><dd>{t.weightKg?`${KG(t.weightKg)} kg`:'not published'}</dd></div>
   <div><dt>First won</dt><dd>{t.first}</dd></div>
  </dl>
  <p className={s.noteBody}><b>Made of:</b> {t.made}</p>
  <p className={s.noteBody}><b>Story:</b> {t.story}</p>
  <p className={s.noteMore}>{t.fun} {t.keeper}</p>
  <p className={s.noteSrc}>{t.firstNote} · {t.sources.map((x,i)=><a key={x.url} href={x.url} target="_blank" rel="noreferrer">{i?', ':''}{x.title.replace(/^Wikipedia · /,'Wikipedia: ')}</a>)}</p>
 </div>;
}
/** The ending's mark: the World Cup trophy, assembled. */
function EndCup(){
 const t=byId('worldcup')!,{marks}=drawTrophy(t,{c:[60,150],k:3.4,elev:EL,spin:.5});
 return <svg viewBox="0 0 120 160" aria-hidden="true"><TrophyDefs/><ellipse cx="60" cy="152" rx="32" ry="6" fill="#8a8a80" opacity=".3"/><Marks list={marks}/></svg>;
}
void kOf;void BENCH_PLAN;
