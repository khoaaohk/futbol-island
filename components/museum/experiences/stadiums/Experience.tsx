'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as RPE} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {ISO_CSS,fitProjection,type Projection} from '../anatomy/iso-kit';
import {useBox} from '../anatomy/bench';
import {usePaperLoop} from '../anatomy/paper-loop';
import {BEATS,BEST_KEY,CHECK,EXTRA_SOURCES,LAYERS,LAYER_NAME,STADIUMS,aboutSeats,type LayerId} from './data';
import {buildPose,explodePose,fitPoints,renderStadium,type Pose} from './geometry';
import {MAX_POINTS,MAX_SEATS,ROUNDS,buildScore,follow,makeRounds,pickLayer,seatShare,total,turnTo,verdict,type Round} from './model';
import s from './Experience.module.css';

/**
 * stadiums · "Stadiums of the World" (Oct 12 2026; replaces the yellow and red cards. User: "replace the yellow and red cards with
 * stadiums of the world", "show a bunch of stadiums and breakdown how they are built"). Anatomy Paper style, full screen.
 *
 *  1. Explore: seven stadiums on a turntable (drag to turn it, or ⟲ ⟳ / the arrow keys). Pull the "Take it apart" slider (or tap
 *     Explode) and the model comes apart into its five layers, each with a leader-line label and one line on how it's built; a
 *     block cut from the pitch slides out to show the drains, gravel, warm pipes, sand and grass. A stat card compares the seats.
 *  2. Build it: the layers are off; snap them back on from the bottom up (foundations → pitch → stands → roof → outside). A wrong
 *     pick says what has to go underneath first.
 *  3. Which stadium?: five rounds: a silhouette on the turntable, or a written clue. Four names to pick from.
 *  4. Score, the quick check, then the gallery ending (onComplete once, via Ending `reached`). Best score saved (BEST_KEY).
 * Heat: the drawing is one SVG string written into the card (geometry.ts), redrawn only on a change; the one shared loop
 * (anatomy/paper-loop.ts) runs only while the turntable eases, the layers move or a layer drops, parks off screen and is
 * disposed on unmount; while things move the faint texture lines are left out (lite). Reduced motion: every move lands at once.
 */
type Phase='intro'|'explore'|'build'|'quiz'|'score';
/** The score shown in the readout (the same sum as the score panel). */
const points0=(u:{rounds:Round[];answers:(string|null)[];mistakes:number})=>total(u.answers.filter((a,i)=>a!=null&&a===u.rounds[i]?.answer).length,u.mistakes);
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY)||0)||0;}catch{return 0;}};
const saveBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode */}};
const GLOWS=[{id:'red',c:'#e4322b',label:'Red'},{id:'blue',c:'#2a5bd7',label:'Blue'},{id:'white',c:'#ffffff',label:'White'}] as const;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const card=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null),modelRef=useRef<SVGGElement>(null),overRef=useRef<SVGGElement>(null);
 const readRef=useRef<HTMLSpanElement>(null),endRef=useRef<HTMLDivElement>(null),labelRefs=useRef<Partial<Record<LayerId,HTMLButtonElement|null>>>({});
 const box=useBox(card);
 const [phase,setPhase]=useState<Phase>('intro');
 const [si,setSi]=useState(0),S=STADIUMS[si];
 const [seen,setSeen]=useState<string[]>([STADIUMS[0].id]);
 const [apart,setApart]=useState(0);// the slider's value (0–1), mirrored from the loop when it lands
 const [focus,setFocus]=useState<LayerId|null>(null);
 const [glow,setGlow]=useState<string>(GLOWS[0].c);
 // build
 const [built,setBuilt]=useState(0),[mistakes,setMistakes]=useState(0),[note,setNote]=useState(''),[shake,setShake]=useState<LayerId|null>(null);
 // quiz
 const [rounds,setRounds]=useState<Round[]>(()=>makeRounds(()=>.42));
 const [qi,setQi]=useState(0),[answers,setAnswers]=useState<(string|null)[]>([]);
 const [picked,setPicked]=useState<number|null>(null),[best,setBest]=useState(0);
 useEffect(()=>{setBest(readBest());},[]);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{const kk=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};window.addEventListener('keydown',kk);return()=>window.removeEventListener('keydown',kk);},[onClose]);

 // ── The view: everything the drawing needs, kept in a ref and drawn by paint() (never a React render per frame) ───────────
 const v=useRef({az:45,azT:45,e:0,eT:0,fall:null as number|null,dirty:false,drag:null as null|{x:number;az:number;id:number}});
 const ui=useRef({phase,S,focus,glow,built,qi,rounds,answers,mistakes});ui.current={phase,S,focus,glow,built,qi,rounds,answers,mistakes};
 const W=box.w||1,H=box.h||1,wide=W>=H*1.05&&W>=720;
 const say=useCallback((t:string)=>{if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;},[]);

 /** The rectangle of the card the model is fitted into (the stat card and the label column keep their sides on a wide card). */
 const area=useCallback(()=>{const p=ui.current.phase;
  if(wide){const side=p==='explore'?Math.min(300,W*.22):0,right=p==='explore'?Math.min(280,W*.21):0;return {x:side+(side?28:16),y:p==='quiz'?92:38,w:W-side-right-(side?28:16)-(right?24:16),h:H-(p==='quiz'?92:38)-34};}
  const top=p==='quiz'?96:34,bot=p==='explore'?72:30;return {x:6,y:top,w:W-12,h:H-top-bot};},[W,H,wide]);
 const poseNow=useCallback(():Pose=>{const u=ui.current,V=v.current;
  if(u.phase==='build')return buildPose(u.built,V.fall);
  if(u.phase==='quiz'){const r=u.rounds[u.qi];const p=explodePose(0);if(r?.kind==='clue'&&u.answers[u.qi]===undefined)for(const id of LAYERS)p[id]={...p[id],show:false};return p;}
  return explodePose(V.e);},[]);
 const paint=useCallback((lite=false)=>{
  const el=modelRef.current,over=overRef.current;if(!el||!over||!box.w)return;
  const u=ui.current,V=v.current,A=area(),pose=poseNow();
  const S0=u.phase==='quiz'?STADIUMS.find(x=>x.id===u.rounds[u.qi]?.answer)??u.S:u.S;
  // Build mode frames the finished stadium from the start (no zooming as layers arrive); a shape round looks from low down, so
  // the outline (arch, towers, pylons, tent) is what you read.
  const r0=u.rounds[u.qi],sil=u.phase==='quiz'&&r0?.kind==='shape'&&u.answers[u.qi]===undefined;
  // A phone frames the stadium, not the plate: a steeper camera and the turntable's rim may run past the card's sides.
  const wider=wide?1:1.14,aw=Math.max(40,A.w)*wider;
  const P0=fitProjection(fitPoints(S0,u.phase==='build'||u.phase==='quiz'?explodePose(0):pose),aw,Math.max(40,A.h),{pad:wide?14:4,azimuth:V.az,elevation:sil?9:wide?30:44});
  const P:Projection={...P0,origin:[P0.origin[0]+A.x-(aw-A.w)/2,P0.origin[1]+A.y]};
  const r=renderStadium(S0,P,pose,{lite,glow:S0.id==='allianz'?u.glow:undefined});
  el.innerHTML=r.svg;
  // labels: shown once the model is apart (explore only)
  let o='';const showLabels=u.phase==='explore'&&V.e>.3;
  const list=LAYERS.filter(id=>r.anchors[id]).map(id=>({id,a:r.anchors[id]!})).sort((p,q)=>p.a[1]-q.a[1]);
  if(showLabels&&wide){const colX=W-Math.min(280,W*.21)-8,gap=Math.max(74,Math.min(110,(H-80)/5));let y=40;
   for(const it of list){const ly=Math.max(y,Math.min(it.a[1]-24,H-40-gap*(list.length-list.indexOf(it)-1)-gap*.6));y=ly+gap;
    const lab=labelRefs.current[it.id];if(lab){lab.style.transform=`translate(${colX+12}px,${ly}px)`;lab.dataset.show='';}
    o+=`<path class="st-leader" d="M${it.a[0].toFixed(1)} ${it.a[1].toFixed(1)}L${(colX-26).toFixed(1)} ${(ly+11).toFixed(1)}L${(colX+4).toFixed(1)} ${(ly+11).toFixed(1)}"/><circle class="st-leader-end" cx="${it.a[0].toFixed(1)}" cy="${it.a[1].toFixed(1)}" r="3"/><circle class="st-leader-dot" cx="${(colX+4).toFixed(1)}" cy="${(ly+11).toFixed(1)}" r="2"/>`;}}
  else for(const id of LAYERS){const lab=labelRefs.current[id];if(lab)delete lab.dataset.show;}
  let lastY=-99;if(showLabels&&!wide)for(const it of list){const n=LAYERS.indexOf(it.id)+1,x=Math.min(W-16,Math.max(16,it.a[0])).toFixed(1),y=Math.max(it.a[1],lastY+28);lastY=y;o+=`<g class="st-badge"${u.focus===it.id?' data-on=""':''} data-layer="${it.id}"><circle cx="${x}" cy="${y.toFixed(1)}" r="13"/><text x="${x}" y="${(y+4).toFixed(1)}">${n}</text></g>`;}
  over.innerHTML=o;
  const svg=svgRef.current;if(svg){if(u.focus&&u.phase==='explore'&&V.e>.3)svg.dataset.focus=u.focus;else delete svg.dataset.focus;}
  const deg=`${Math.round(((V.az%360)+360)%360)}°`;
  say(u.phase==='score'?`${points0(u)} points`:u.phase==='build'?`${deg} · ${u.built} of ${LAYERS.length} layers on`:u.phase==='quiz'?`${deg} · round ${u.qi+1} of ${ROUNDS}`:`${deg} · ${Math.round(V.e*100)}% apart`);
 },[area,poseNow,box.w,wide,W,H,say]);

 // One loop: the turntable easing, the layers moving apart or together, a dropping layer, or a pending redraw from a drag.
 const landRef=useRef<()=>void>(()=>{});
 const loop=usePaperLoop((dt)=>{const V=v.current;let moving=false;
  if(V.az!==V.azT){V.az=follow(V.az,V.azT,dt,8,.05);moving=moving||V.az!==V.azT;}
  if(V.e!==V.eT){V.e=follow(V.e,V.eT,dt,5,.002);moving=moving||V.e!==V.eT;if(V.e===V.eT)setApart(V.e);}
  if(V.fall!=null){V.fall=follow(V.fall,0,dt,7,.4);if(V.fall===0){V.fall=null;landRef.current();}else moving=true;}
  V.dirty=false;
  paint(moving||!!V.drag);
  return moving;},card,reduced);
 const wake=loop.wake;
 useLayoutEffect(()=>{paint();},[paint,phase,si,focus,glow,built,qi,rounds,answers]);

 // ── Explore ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const go=(i:number)=>{const n=(i+STADIUMS.length)%STADIUMS.length;setSi(n);setFocus(null);setSeen(x=>x.includes(STADIUMS[n].id)?x:[...x,STADIUMS[n].id]);museumSfx.flapBook();};
 const turn=(deg:number)=>{const V=v.current;V.azT=Math.round((V.azT+deg)/15)*15;wake();museumSfx.tick();};
 const setE=(e:number,ease=true)=>{const V=v.current;V.eT=Math.max(0,Math.min(1,e));if(!ease||reduced){V.e=V.eT;setApart(V.eT);paint();}else wake();};
 const toggleApart=()=>{const V=v.current;setE(V.eT>.5?0:1);museumSfx.reveal();};
 const startExplore=()=>{setPhase('explore');ui.current.phase='explore';const V=v.current;V.e=0;V.eT=.0;setApart(0);
  if(!reduced){V.eT=1;later(()=>wake(),350);}else{V.e=V.eT=1;setApart(1);}museumSfx.whistle();};

 // drag the turntable (all phases with a model)
 const local=(e:{clientX:number})=>{const r=svgRef.current?.getBoundingClientRect();return r?e.clientX-r.left:0;};
 const onDown=(e:RPE<SVGSVGElement>)=>{const t=e.target as Element,badge=t.closest?.('[data-layer]');if(badge){setFocus(badge.getAttribute('data-layer') as LayerId);return;}
  if(phase==='intro'||phase==='score')return;try{e.currentTarget.setPointerCapture?.(e.pointerId);}catch{/* synthetic */}v.current.drag={x:local(e),az:v.current.az,id:e.pointerId};};
 const onMove=(e:RPE<SVGSVGElement>)=>{const V=v.current;if(!V.drag||V.drag.id!==e.pointerId)return;V.az=V.azT=V.drag.az-(local(e)-V.drag.x)*.45;if(!V.dirty){V.dirty=true;wake();}};
 const onUp=()=>{const V=v.current;if(!V.drag)return;V.drag=null;V.azT=Math.round(V.az/5)*5;V.az=V.azT;paint();};
 const keyDown=(e:React.KeyboardEvent)=>{if(phase==='intro'||phase==='score')return;
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowLeft'?-45:45);}
  if(phase==='explore'&&(e.key==='e'||e.key==='E'||e.key===' ')){e.preventDefault();toggleApart();}
  if(phase==='explore'&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();go(si+(e.key==='ArrowDown'?1:-1));}};

 // ── Build it ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 const order=useMemo(()=>[...LAYERS].sort((a,b)=>'oprgs'.indexOf(a[1])-'oprgs'.indexOf(b[1])||a.localeCompare(b)),[]);// a fixed mixed order for the chips
 const startBuild=()=>{setPhase('build');ui.current.phase='build';setBuilt(0);ui.current.built=0;setMistakes(0);setFocus(null);v.current.fall=null;
  setNote('The layers are off. Snap them back on from the bottom up: tap the layer that goes next.');museumSfx.whistle();};
 landRef.current=()=>{const u=ui.current;const n=u.built+1;setBuilt(n);ui.current.built=n;museumSfx.stamp();
  if(n>=LAYERS.length){setNote(`Built! ${u.S.name} is back together.`);museumSfx.crowd();}};
 const pick=(id:LayerId)=>{if(phase!=='build'||v.current.fall!=null||built>=LAYERS.length)return;const r=pickLayer(built,id);
  if(!r.ok){setMistakes(m=>m+(LAYERS.indexOf(id)<built?0:1));setNote(r.say);setShake(id);later(()=>setShake(null),450);museumSfx.tick();return;}
  setNote(`${LAYER_NAME[id]}: ${S.lines[id]}`);museumSfx.kick();
  if(reduced){landRef.current();return;}
  v.current.fall=70;paint();wake();};

 // ── Which stadium? ─────────────────────────────────────────────────────────────────────────────────────────────────────
 const startQuiz=()=>{const rs=makeRounds();setRounds(rs);setQi(0);setAnswers([]);setPhase('quiz');ui.current.phase='quiz';const V=v.current;V.az=V.azT=rs[0].azimuth;V.e=V.eT=0;museumSfx.whistle();};
 const round=rounds[Math.min(qi,rounds.length-1)];
 const answered=answers[qi]!==undefined&&phase==='quiz';
 const guess=(id:string)=>{if(answered)return;const ok=id===round.answer;setAnswers(a=>{const n=[...a];n[qi]=id;return n;});museumSfx[ok?'net':'tick']();
  const V=v.current;V.azT=V.az+(reduced?0:180);if(!reduced)wake();};
 const nextRound=()=>{if(qi+1>=ROUNDS){finish();return;}const n=qi+1;setQi(n);const V=v.current;V.az=V.azT=rounds[n].azimuth;};
 const quizRight=answers.filter((a,i)=>a!=null&&a===rounds[i]?.answer).length;
 const points=total(quizRight,mistakes);
 const finish=()=>{setPhase('score');museumSfx.crowd();setBest(b=>{const n=Math.max(b,points);saveBest(n);return n;});};
 const again=()=>{setPicked(null);startExplore();};

 const checked=picked!=null;
 const sources=useMemo(()=>{const seenU=new Set<string>();return [...exhibit.sources,...EXTRA_SOURCES].filter(x=>seenU.has(x.url)?false:(seenU.add(x.url),true));},[exhibit.sources]);
 const quizS=STADIUMS.find(x=>x.id===round?.answer)!;
 const hint=phase==='explore'?(wide?'Drag to turn · slide to take it apart':'Drag to turn'):phase==='build'?'Bottom up: tap the next layer':phase==='quiz'?(round.kind==='shape'?'Whose shape is this?':'Read the clue'):'Stadiums of the world';
 const title=phase==='build'?`Build ${S.name}`:phase==='quiz'?`Which stadium? ${qi+1}/${ROUNDS}`:S.name;
 const label=phase==='quiz'?(round.kind==='shape'?'A stadium drawn as a dark shape on a turntable. Which one is it?':`A clue: ${quizS.clue}`)
  :`${S.name}, ${S.city}, on a turntable${apart>.3?', taken apart into foundations, pitch, stands, roof and outside':''}.`;
 const ready=box.w>0;
 const sorted=useMemo(()=>[...STADIUMS].sort((a,b)=>b.seats-a.seats),[]);

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="stadiums"
  className={`${g.room} iso ${s.root}`} data-theme="light" data-phase={phase} data-stadium={S.id} data-apart={apart.toFixed(2)} data-built={built} data-round={qi} data-score={points} data-wide={wide||undefined} data-reduced={reduced||undefined}
  style={{'--accent':'#e4322b'} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={`${g.scroll} ${s.scroll}`} data-scroll>
   <div className={s.screen} data-play-screen>
    <header className={s.head}><WallLabel as="h1" title={exhibit.title} meta={`${exhibit.year} → today`} caption="Turn famous stadiums, take them apart, build one back up." className={s.label}/></header>

    <div ref={card} className={s.card} data-play-area data-fill-screen tabIndex={0} onKeyDown={keyDown} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">Fig. {phase==='quiz'?'?':S.opened}</span><span data-corner="title">{title}</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout" ref={readRef}>45° · 0% apart</span>
     </div>
     {ready&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} data-sil={phase==='quiz'&&round.kind==='shape'&&!answered?'':undefined}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <g ref={modelRef} data-model=""/><g ref={overRef} data-over=""/>
     </svg>}

     {phase==='explore'&&wide&&<aside className={s.stat} data-stat-card>
      <p className={s.statWhere}>{S.city} · {S.country}</p>
      <h2 className={s.statName}>{S.name}</h2>
      <dl className={s.statNums}><div><dt>Opened</dt><dd>{S.opened}</dd></div><div><dt>Seats</dt><dd>{aboutSeats(S.seats).replace('about ','~')}</dd></div></dl>
      <ol className={s.bars} aria-label="Seats in each stadium">{sorted.map(x=><li key={x.id} data-on={x.id===S.id||undefined}><button type="button" onClick={()=>go(STADIUMS.indexOf(x))}>
       <span>{x.name}</span><i style={{'--w':`${(seatShare(x.seats)*100).toFixed(1)}%`} as CSSProperties}/></button></li>)}</ol>
      <p className={s.famous}><b>Famous:</b> {S.famous}</p>
      {S.id==='allianz'&&<div className={s.glow} role="group" aria-label="Light the cushions">{GLOWS.map(x=><button key={x.id} type="button" aria-pressed={glow===x.c} onClick={()=>{setGlow(x.c);museumSfx.reveal();}} style={{'--c':x.c} as CSSProperties}>{x.label}</button>)}</div>}
     </aside>}
     {phase==='explore'&&LAYERS.map((id,i)=><button key={id} type="button" ref={el=>{labelRefs.current[id]=el;}} className={s.leaderLabel} data-layer-label={id} aria-pressed={focus===id}
      onClick={()=>setFocus(f=>f===id?null:id)}><b><i>{i+1}</i>{LAYER_NAME[id]}</b><span>{S.lines[id]}</span></button>)}
     {phase==='explore'&&!wide&&apart>.3&&<p className={s.caption} data-caption>{focus?<><b>{LAYERS.indexOf(focus)+1} · {LAYER_NAME[focus]}.</b> {S.lines[focus]}</>:'Tap a number to read how that part is built.'}</p>}
     {phase==='quiz'&&round.kind==='clue'&&!answered&&<div className={s.mystery} aria-hidden="true">?</div>}
     {phase==='quiz'&&<div className={s.clue} data-clue>{round.kind==='clue'&&!answered?<><b>Clue</b><span>{quizS.clue}</span></>:answered?<><b>{answers[qi]===round.answer?'Right!':'Not this time.'}</b><span>That was {quizS.name}, {quizS.city}.</span></>:<><b>Shape</b><span>Whose outline is this? Drag to turn it.</span></>}</div>}

     {phase==='intro'&&<div className={s.panel} data-intro>
      <p className={g.kicker}>{exhibit.year} → today</p>
      <h2 className={s.panelTitle}>How do you build a stadium?</h2>
      <p className={g.body}>{exhibit.facts[0]}</p>
      <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><b>{b.head}</b><p>{b.text}</p></li>)}</ol>
      <div className={g.row}><button type="button" className={g.btn} data-start onClick={startExplore} data-museum-own-cue>Open the workshop</button></div>
     </div>}

     {phase==='score'&&<div className={s.panel} data-score-panel>
      <p className={g.kicker}>Final whistle</p>
      <p className={s.big}><b>{points}</b><span>of {MAX_POINTS} points</span></p>
      <ul className={s.tally}><li><b>{buildScore(mistakes)}/5</b> Built {S.name}{mistakes?` (${mistakes} wrong pick${mistakes===1?'':'s'})`:' with no wrong picks'}</li>
       <li><b>{quizRight}/{ROUNDS}</b> stadiums spotted</li></ul>
      <p className={g.body}><b>{verdict(points)}</b></p>
      {best>0&&<p className={g.small} data-best>Best · {best} of {MAX_POINTS}</p>}
      <StepCheck items={[{q:CHECK.q,options:CHECK.options,right:CHECK.answer,why:CHECK.why}]} kicker={()=>'Quick check'} onPick={ok=>{setPicked(ok?CHECK.answer:-1);if(ok)museumSfx.reveal();else museumSfx.tick();}}
       doneLabel="See the ending" onDone={()=>later(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60)}/>
      <div className={g.row}><button type="button" className={g.ghost} data-play-again onClick={again}>Back to the stadiums</button></div>
     </div>}
    </div>

    <div className={s.dock} data-dock data-phase={phase}>
     {phase==='intro'?<><button type="button" className={g.btn} data-start-dock onClick={startExplore}>Open the workshop</button><p className={s.say}>Seven famous stadiums are waiting on the workbench.</p></>
     :phase==='explore'?<>
       <div className={s.carousel} role="group" aria-label="Choose a stadium">
        <button type="button" className={s.round} aria-label="Previous stadium" data-prev onClick={()=>go(si-1)}>‹</button>
        <div className={s.names}>{STADIUMS.map((x,i)=><button key={x.id} type="button" className={s.name} data-stadium-chip={x.id} aria-pressed={i===si} onClick={()=>go(i)}>{x.name}</button>)}
         <span className={s.only}><b>{S.name}</b> {si+1}/{STADIUMS.length}</span></div>
        <button type="button" className={s.round} aria-label="Next stadium" data-next onClick={()=>go(si+1)}>›</button>
       </div>
       <div className={s.controls}>
        <button type="button" className={s.round} aria-label="Turn left" data-turn-left onClick={()=>turn(-45)}>⟲</button>
        <button type="button" className={s.round} aria-label="Turn right" data-turn-right onClick={()=>turn(45)}>⟳</button>
        <label className={s.slider}><span>Take it apart</span><input type="range" min={0} max={100} step={1} value={Math.round(apart*100)} data-apart-slider
         onChange={e=>{const x=Number(e.target.value)/100;setApart(x);setE(x,false);}}/></label>
        <button type="button" className={g.ghost} data-explode onClick={toggleApart}>{apart>.5?'Put together':'Explode'}</button>
        <button type="button" className={g.btn} data-build onClick={startBuild}>Build it ▸</button>
       </div>
       {!wide&&<p className={s.mini} data-stat-line><b>{S.city}</b> · opened {S.opened} · {aboutSeats(S.seats)} seats<i style={{'--w':`${(seatShare(S.seats)*100).toFixed(1)}%`} as CSSProperties}/></p>}
       {wide&&<p className={s.say}>Explored {seen.length} of {STADIUMS.length}. Biggest here: {sorted[0].name} ({aboutSeats(MAX_SEATS)} seats).</p>}
      </>
     :phase==='build'?<>
       <div className={s.chips} role="group" aria-label="Layers">{order.map(id=>{const i=LAYERS.indexOf(id),on=i<built;return <button key={id} type="button" className={s.chip} data-layer-chip={id} data-on={on||undefined} data-shake={shake===id||undefined}
        disabled={on||built>=LAYERS.length} onClick={()=>pick(id)}>{LAYER_NAME[id]}</button>;})}</div>
       <ol className={s.pips} aria-label={`${built} of 5 layers on`}>{LAYERS.map((id,i)=><li key={id} data-on={i<built||undefined}/>)}</ol>
       <p className={s.say} aria-live="polite">{note}</p>
       {built>=LAYERS.length&&<button type="button" className={g.btn} data-to-quiz onClick={startQuiz}>Next: which stadium? ▸</button>}
      </>
     :phase==='quiz'?<>
       <div className={s.options} role="group" aria-label="Which stadium is it?">{round.options.map(id=>{const x=STADIUMS.find(t=>t.id===id)!;
        return <button key={id} type="button" className={s.option} data-option={id} disabled={answered} data-a={answered?(id===round.answer?'right':id===answers[qi]?'wrong':undefined):undefined} onClick={()=>guess(id)}>{x.name}</button>;})}</div>
       <ol className={s.pips} aria-label={`${quizRight} right`}>{Array.from({length:ROUNDS},(_,i)=><li key={i} data-on={answers[i]!=null&&answers[i]===rounds[i]?.answer||undefined} data-miss={answers[i]!=null&&answers[i]!==rounds[i]?.answer||undefined}/>)}</ol>
       {answered&&<button type="button" className={g.btn} data-next-round onClick={nextRound}>{qi+1<ROUNDS?'Next ▸':'See your score ▸'}</button>}
      </>
     :<p className={s.say}>Every stadium stands on its foundations.</p>}
    </div>
   </div>

   <div className={s.below}>
    <section className={g.section} aria-labelledby="st-facts">
     <p className={g.kicker}>The real story</p>
     <h2 id="st-facts" className={g.h2}>Seven stadiums, one way of building</h2>
     <ol className={g.steps}>{exhibit.facts.map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
     <table className={s.table} data-stadium-table><caption>The stadiums in this exhibit</caption>
      <thead><tr><th scope="col">Stadium</th><th scope="col">Opened</th><th scope="col">Seats</th><th scope="col">Famous for</th></tr></thead>
      <tbody>{STADIUMS.map(x=><tr key={x.id}><th scope="row">{x.name}<small>{x.city}</small></th><td>{x.opened}</td><td>{aboutSeats(x.seats)}</td><td>{x.famous}</td></tr>)}</tbody></table>
     <p className={g.small}>The models are drawings in proportion, not plans. The pitch’s layers are drawn thicker than they really are, so you can see them. Seat numbers change after every rebuild, so they are rounded.</p>
    </section>
    <div ref={endRef}>{checked&&<Ending art={<EndArt/>} seen="You’ve taken seven stadiums apart and built one back up, from the foundations to the roof." take={exhibit.forYourGame} onComplete={onComplete} reached={checked}/>}</div>
    <footer><details className={g.sources}><summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details></footer>
   </div>
  </div>
 </section>;
}

/** The ending's mark: a stadium bowl in layers, the pitch in the middle (the same paper tones as the game). */
function EndArt(){
 return <svg viewBox="0 0 240 200" aria-hidden="true">
  <ellipse cx="120" cy="168" rx="100" ry="20" fill="#8a8a80" opacity=".25"/>
  <ellipse cx="120" cy="140" rx="100" ry="40" fill="#d3d3ce" stroke="#3a3a3c" strokeWidth="1"/>
  <ellipse cx="120" cy="120" rx="96" ry="38" fill="#f7f7f3" stroke="#3a3a3c" strokeWidth="1"/>
  <ellipse cx="120" cy="122" rx="70" ry="26" fill="#e9e9e4" stroke="#6f6f72" strokeWidth=".8"/>
  <ellipse cx="120" cy="126" rx="48" ry="16" fill="#6aa363" stroke="#3a3a3c" strokeWidth=".8"/>
  <path d="M120 110v32M72 126h96" stroke="#fbfbf6" strokeWidth="1"/>
  <path d="M30 96 Q120 -10 210 96" fill="none" stroke="#3a3a3c" strokeWidth="7" strokeLinecap="round"/><path d="M30 96 Q120 -10 210 96" fill="none" stroke="#fbfbf8" strokeWidth="5" strokeLinecap="round"/>
  <circle cx="120" cy="126" r="4" fill="#e4322b"/>
 </svg>;
}
