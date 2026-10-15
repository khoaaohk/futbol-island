'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
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
import {useBox,clamp,follow,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {ERA_NAME,GLOVE_ERAS,KEY_TURN,LAYERS,TASKS,clampToHalf,crank,flip,gloveLayers,handsOK,sayHands,taskAt,zoneOf,type Era,type GloveEra,type Layer,type Task} from './model';
import {BEATS,CHECKS,EXTRA,GLOVE_FACT,LAYER_TEXT,MODEL_NOTE,SOURCES} from './content';
import {Board,M,type BoardApi,type BoardView} from './Board';
import {GloveStand,type GloveApi,type GloveView} from './Glove';
import s from './Experience.module.css';

/**
 * keeper-hands-1912 · "The goalkeeper’s hands" (Oct 14 2026 redo; user: a real anatomy instrument you operate, with a layered
 * breakdown like the stadiums). Two machines on one paper card:
 *  1. Intro over the card (IntroPanel); ONE centred start button in the dock (StartDock).
 *  2. THE GLOVE-ZONE GANTRY (Board.tsx): a to-scale half pitch on a bench with an XY gantry. Turn the OUT crank (the bridge runs
 *     out from the goal line) and the ACROSS crank (the carriage runs across), or drag / tap the pitch, or the arrow keys. Flip the
 *     LAW SWITCH between 1887 and 1912: the allowed area lights up (the whole half, or only the penalty area) and the keeper's
 *     gloves open round the ball where the hands may work, or close into fists with the ball at the feet.
 *  3. THE GLOVE STAND (Glove.tsx), the breakdown: turn its crank (or the slider) and the glove comes apart on two guide pillars into
 *     grip palm, hand, finger protectors, segmented back and wrist strap, each labelled; the era buttons show which layers a keeper
 *     had before the 1970s, in the 1970s and since the 1980s.
 *  Four things to find (three on the pitch, the glove apart) open the quick check (StepCheck) → the Ending (onComplete once).
 * Heat: one Paper loop (anatomy/paper-loop.ts) runs only while the keeper, the switch or the glove eases; it stops at rest, parks
 * off screen and is disposed on unmount. Reduced motion: every motion lands at once (the loop runs to its end synchronously).
 */
type Phase='intro'|'play'|'check';type Mode='pitch'|'glove';
type TaskId=Task|'glove';
const ALL:readonly {id:TaskId;text:string}[]=[...TASKS,{id:'glove',text:'Take a modern glove fully apart'}];
const ACC=ACCENT.green;
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro'),[mode,setModeS]=useState<Mode>('pitch');
 const [era,setEraS]=useState<Era>('before'),[pos,setPosS]=useState<[number,number]>([0,6]);
 const [gEra,setGEraS]=useState<GloveEra>('today'),[apart,setApartS]=useState(0);
 const [found,setFound]=useState<ReadonlySet<TaskId>>(()=>new Set());
 const [checked,setChecked]=useState(false),[round,setRound]=useState(0);
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),board=useRef<BoardApi>(null),stand=useRef<GloveApi>(null),readRef=useRef<HTMLSpanElement>(null),overRef=useRef<SVGSVGElement>(null);
 const labelRefs=useRef<Partial<Record<Layer,HTMLButtonElement|null>>>({});
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeRef.current();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);

 const ok=handsOK(era,pos[0],pos[1]),word=sayHands(era,pos[0],pos[1]);
 const bv=useRef<BoardView>({pos:[0,6],era:'before',ok:true,lamp:0,focus:null});
 const gv=useRef<GloveView>({era:'today',apart:0,crank:0,focus:null});
 const tgt=useRef({pos:[0,6] as [number,number],apart:0,crankDrag:false});
 bv.current.era=era;bv.current.ok=handsOK(era,bv.current.pos[0],bv.current.pos[1]);gv.current.era=gEra;

 const say=(t:string)=>{if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;};
 const placeLabels=()=>{const a=stand.current,o=overRef.current,v=gv.current;if(!o)return;
  const show=!!a&&mode==='glove'&&phase==='play'&&v.apart>.3;let html='';
  if(show&&a){const list=LAYERS.map(l=>({l,p:a.anchor(l)})).filter(x=>x.p).sort((m,n)=>m.p![1]-n.p![1]);
   const W=box.w,minX=Math.min(...list.map(x=>x.p![0])),colR=Math.max(120,minX-(W<600?14:36)),lw=Math.max(112,Math.min(260,colR-12));
   const hs=list.map(({l})=>{const el=labelRefs.current[l];if(el)el.style.width=lw+'px';return el?.offsetHeight||44;});
   const ys=list.map((x,i)=>x.p![1]-hs[i]/2);let low=36;for(let i=0;i<ys.length;i++){ys[i]=Math.max(ys[i],low);low=ys[i]+hs[i]+6;}
   const maxB=box.h-26;for(let i=ys.length-1;i>=0;i--){if(ys[i]+hs[i]>maxB)ys[i]=maxB-hs[i];if(i>0&&ys[i-1]+hs[i-1]+6>ys[i])ys[i-1]=ys[i]-hs[i-1]-6;}
   list.forEach(({l,p:pt},i)=>{const el=labelRefs.current[l];if(!el||!pt)return;const y=ys[i],my=y+Math.min(hs[i]/2,18);el.dataset.show='';
    el.style.transform=`translate(${(colR-lw).toFixed(0)}px,${y.toFixed(0)}px)`;
    html+=`<path d="M${pt[0].toFixed(1)} ${pt[1].toFixed(1)}L${(colR+10).toFixed(1)} ${my.toFixed(1)}L${(colR+1).toFixed(1)} ${my.toFixed(1)}"/><circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="3"/>`;});}
  else for(const l of LAYERS){const el=labelRefs.current[l];if(el)delete el.dataset.show;}
  o.style.opacity=String(clamp((v.apart-.3)/.25,0,1));o.innerHTML=html;};
 const draw=()=>{board.current?.draw();stand.current?.draw();};

 const loop=usePaperLoop(dt=>{const b=bv.current,G=gv.current,T=tgt.current;let moving=false;
  const ease=(cur:number,to:number,tau:number,eps=1e-3)=>{const n=follow(cur,to,dt,tau,eps);if(n!==to)moving=true;return n;};
  b.pos=[ease(b.pos[0],T.pos[0],.12,.01),ease(b.pos[1],T.pos[1],.12,.01)];
  b.lamp=ease(b.lamp,b.era==='after'?1:0,.07);
  b.ok=handsOK(b.era,b.pos[0],b.pos[1]);
  if(!T.crankDrag){G.apart=ease(G.apart,T.apart,.2,.002);G.crank=G.apart;}
  draw();placeLabels();
  if(!moving&&Math.abs(G.apart-apartRef.current)>.004){apartRef.current=G.apart;setApartS(G.apart);}
  return moving;},stageRef,reduced);
 const wake=loop.wake;
 const apartRef=useRef(0);
 useLayoutEffect(()=>{placeLabels();});

 // ── state changes ──
 const foundRef=useRef(found);foundRef.current=found;
 const find=(t:TaskId|null)=>{if(!t||foundRef.current.has(t))return;const n=new Set(foundRef.current);n.add(t);foundRef.current=n;setFound(n);sfx(museumSfx.stamp);};
 const prevOk=useRef(true);
 useEffect(()=>{if(phase!=='play')return;if(prevOk.current!==ok)sfx(ok?museumSfx.card:museumSfx.look);prevOk.current=ok;find(taskAt(era,pos[0],pos[1]));},[ok,era,pos,phase]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(phase==='play'&&gEra==='today'&&apart>.9)find('glove');},[apart,gEra,phase]);// eslint-disable-line react-hooks/exhaustive-deps
 const moveTo=(q:[number,number],ease=true)=>{const c=clampToHalf(q[0],q[1]);tgt.current.pos=c;setPosS(c);if(!ease||reduced)bv.current.pos=c;wake();};
 const setEra=(e:Era)=>{if(e===era)return;setEraS(e);bv.current.era=e;sfx(museumSfx.flap);wake();};
 const setGEra=(e:GloveEra)=>{if(e===gEra)return;setGEraS(e);gv.current.era=e;sfx(museumSfx.flapBook);draw();};
 const setApart=(x:number,ease=true)=>{tgt.current.apart=x;if(!ease||reduced){gv.current.apart=x;gv.current.crank=x;apartRef.current=x;setApartS(x);}wake();};
 const setMode=(m:Mode)=>{if(m===mode)return;setModeS(m);sfx(museumSfx.flapBook);};

 // ── pointer: the cranks, the switch, the pitch; the stand's crank ──
 const drag=useRef<{id:string;pid:number;a0:number;base:[number,number]|number;moved:boolean;x0:number;y0:number}|null>(null);
 const local=(e:{clientX:number;clientY:number}):[number,number]=>{const r=stageRef.current!.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 const angleAt=(e:{clientX:number;clientY:number},c:[number,number])=>{const [x,y]=local(e);return Math.atan2(y-c[1],x-c[0]);};
 const pitchAt=(e:{clientX:number;clientY:number}):[number,number]|null=>{const P=board.current?.proj();if(!P)return null;const [lx,ly]=local(e);const [wx,wy]=toFloor(lx,ly,P,1.7);return [wx/M,wy/M];};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(phase!=='play')return;unlockMuseumAudio();const hit=(e.target as Element).closest?.('[data-hit]')?.getAttribute('data-hit')??null;
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  if(mode==='glove'){if(hit!=='glovecrank')return;const c=stand.current?.crankCentre();if(!c)return;tgt.current.crankDrag=true;gv.current.focus='crank';
   drag.current={id:hit,pid:e.pointerId,a0:angleAt(e,c),base:gv.current.apart,moved:false,x0:e.clientX,y0:e.clientY};draw();return;}
  if(hit==='xcrank'||hit==='ycrank'){const c=board.current?.crankCentre(hit==='xcrank'?'x':'y');if(!c)return;bv.current.focus=hit;
   drag.current={id:hit,pid:e.pointerId,a0:angleAt(e,c),base:[...tgt.current.pos],moved:false,x0:e.clientX,y0:e.clientY};draw();return;}
  if(hit==='switch'){drag.current={id:hit,pid:e.pointerId,a0:0,base:0,moved:false,x0:e.clientX,y0:e.clientY};return;}
  const q=pitchAt(e);if(!q)return;drag.current={id:'pitch',pid:e.pointerId,a0:0,base:0,moved:false,x0:e.clientX,y0:e.clientY};moveTo(q);};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>4)d.moved=true;
  if(d.id==='glovecrank'){const c=stand.current?.crankCentre();if(!c)return;let da=angleAt(e,c)-d.a0;da=Math.atan2(Math.sin(da),Math.cos(da));
   const x=clamp((d.base as number)+da/(Math.PI*2),0,1);if(Math.abs(da)>Math.PI*.6){d.a0=angleAt(e,c);d.base=x;}gv.current.apart=x;gv.current.crank=x;tgt.current.apart=x;draw();placeLabels();return;}
  if(d.id==='xcrank'||d.id==='ycrank'){const c=board.current?.crankCentre(d.id==='xcrank'?'x':'y');if(!c)return;let da=angleAt(e,c)-d.a0;
   if(Math.abs(da)>Math.PI){da=Math.atan2(Math.sin(da),Math.cos(da));}
   // Unwrap: re-base each time the hand passes half a turn, so many turns in a row keep adding up.
   if(Math.abs(da)>Math.PI*.5){d.base=crank(d.base as [number,number],d.id==='xcrank'?'x':'y',da/(Math.PI*2));d.a0=angleAt(e,c);da=0;}
   moveTo(crank(d.base as [number,number],d.id==='xcrank'?'x':'y',da/(Math.PI*2)),false);return;}
  if(d.id==='pitch'){const q=pitchAt(e);if(q)moveTo(q,false);}};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;drag.current=null;
  if(d.id==='switch'){setEra(flip(era));return;}
  if(d.id==='glovecrank'){tgt.current.crankDrag=false;const a=gv.current.apart;apartRef.current=a;setApartS(a);sfx(museumSfx.tick);wake();return;}
  if(d.id==='xcrank'||d.id==='ycrank')sfx(museumSfx.tick);};
 const onKey=(e:KeyboardEvent<HTMLDivElement>)=>{if(phase!=='play')return;const id=(e.target as Element).getAttribute?.('data-hit');
  const dir=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;
  if(id==='switch'&&(dir||e.key===' '||e.key==='Enter')){e.preventDefault();setEra(dir>0?'after':dir<0?'before':flip(era));return;}
  if((id==='xcrank'||id==='ycrank')&&dir){e.preventDefault();moveTo(crank(tgt.current.pos,id==='xcrank'?'x':'y',dir*KEY_TURN*(e.shiftKey?4:1)));sfx(museumSfx.tick);return;}
  if(id==='glovecrank'&&dir){e.preventDefault();setApart(clamp(tgt.current.apart+dir*.25,0,1));sfx(museumSfx.tick);return;}
  if(!id&&mode==='pitch'){const k=e.shiftKey?5:1,m:Record<string,[number,number]>={ArrowLeft:[-k,0],ArrowRight:[k,0],ArrowUp:[0,k],ArrowDown:[0,-k]};
   if(m[e.key]){e.preventDefault();moveTo([tgt.current.pos[0]+m[e.key][0],tgt.current.pos[1]+m[e.key][1]]);}}};
 const onFocus=(e:React.FocusEvent<HTMLDivElement>)=>{const id=(e.target as Element).getAttribute?.('data-hit');bv.current.focus=id;gv.current.focus=id==='glovecrank'?'crank':null;draw();};
 const onBlur=()=>{if(!drag.current){bv.current.focus=null;gv.current.focus=null;draw();}};

 // ── derived ──
 const allFound=found.size===ALL.length;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const GE=GLOVE_ERAS.find(x=>x.id===gEra)!;
 useEffect(()=>{say(mode==='glove'?`${GE.tab.toUpperCase()} · ${Math.round(apart*100)}% APART`:`${Math.round(Math.abs(pos[0]))} M ${pos[0]<-.5?'LEFT':pos[0]>.5?'RIGHT':'MID'} · ${Math.round(pos[1])} M OUT · ${ok?'HANDS OK':'NO HANDS'}`);});
 const start=()=>{unlockMuseumAudio();setPhase('play');sfx(museumSfx.whistle);wake();};
 const again=()=>{setChecked(false);setRound(n=>n+1);setPhase('play');};
 const [x,y]=pos;
 const label=mode==='pitch'?`A half pitch on a bench under an XY gantry, the goal at the back. ${ERA_NAME[era]}: ${era==='before'?'the whole half is lit':'only the penalty area is lit'}. The keeper is ${Math.round(y)} metres from the goal line, ${Math.abs(x)<1?'in the middle':`${Math.round(Math.abs(x))} metres to the ${x<0?'left':'right'}`}. ${word.big}. Use the arrow keys to move, or the two cranks.`
  :`A goalkeeper's glove on a stand, ${Math.round(apart*100)} percent apart. ${GE.tab}: ${GE.head}. Layers: ${gloveLayers(gEra).map(l=>LAYER_TEXT[l].name).join(', ')}.`;
 const hint=mode==='pitch'?'Turn the cranks · flip the Law switch':'Turn the crank · pick an era';
 const top=mode==='pitch'&&box.w>=600?14:40,bottom=box.w<600?18:34;

 const intro=phase==='intro'&&<IntroPanel kicker={`The Laws · ${exhibit.year}`} title={<>The goalkeeper’s <em>hands</em></>} deck={exhibit.facts[0]} beats={BEATS}/>;
 const check=phase==='check'&&<ScoreCover kicker="Quick check · when to come out" score="1912" unit="hands only in the penalty area"
  notes={<><p><b>Before 1912</b> the hands worked anywhere in the keeper’s own half. <b>From 1912</b>, only in the penalty area.</p><p>{EXTRA.backpass}</p></>}
  buttons={<button type="button" className={p.ghost} data-move-again onClick={again}>Back to the machines</button>}>
  <StepCheck key={round} items={CHECKS} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={good=>sfx(good?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
   renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You cranked the keeper round the half, flipped the Law, and took a glove apart." take={exhibit.forYourGame}/>}/>
 </ScoreCover>;

 return <PaperRoom id="keeper-hands-1912" accent={ACC} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-mode':mode,'data-era':era,'data-hands':ok?'ok':'no','data-zone':zoneOf(x,y),'data-found':found.size,'data-glove-era':gEra,'data-apart':apart.toFixed(2),'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · The Laws of the Game</>}/>}
  card={<PaperCard ref={cardRef} fig={`Fig. ${mode==='pitch'?(era==='before'?'1887':'1912'):'Glove'}`} title={mode==='pitch'?(box.w>520?'The glove-zone gantry':ERA_NAME[era]):'The glove stand'} hint={hint}
    readout="" readoutRef={readRef} cover={intro||check||null}>
   <div ref={stageRef} className={s.stage} tabIndex={phase==='play'?0:-1} role="application" aria-label={label}
    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} data-stage>
    {box.w>0&&mode==='pitch'&&<Board ref={board} w={box.w} h={box.h} view={bv} top={top} bottom={bottom}/>}
    {box.w>0&&mode==='glove'&&<GloveStand ref={stand} w={box.w} h={box.h} view={gv} top={top} bottom={bottom} side="left"/>}
    <svg ref={overRef} className={s.leaders} viewBox={`0 0 ${box.w||1} ${box.h||1}`} aria-hidden="true"/>
    {mode==='glove'&&LAYERS.map(l=>{const T=LAYER_TEXT[l],on=gloveLayers(gEra).includes(l);return <button key={l} type="button" tabIndex={-1} className={s.layerLabel} data-layer-label={l} data-on={on||undefined}
     ref={el=>{labelRefs.current[l]=el;}} onClick={()=>{gv.current.focus=gv.current.focus===l?null:l;draw();sfx(museumSfx.tick);}}>
     <b><i>{T.n}</i>{T.name}</b><span>{on?(box.w<600?T.short:T.line):`Not on a ${GE.tab.toLowerCase()} keeper`}</span></button>;})}
   </div>
  </PaperCard>}
  dock={phase==='intro'?<StartDock label="Crank the keeper" line="Two cranks, one Law switch, one glove to take apart." onStart={start}/>
   :phase==='play'?<>
    <div className={p.row}>
     <span className={s.seg} role="group" aria-label="Which machine?">{(['pitch','glove'] as const).map(m=><button key={m} type="button" aria-pressed={mode===m} data-mode-btn={m} onClick={()=>setMode(m)}>{m==='pitch'?'The pitch':'The glove'}</button>)}</span>
     {mode==='pitch'?<span className={s.seg} role="group" aria-label="Which Law? (the Law switch)">{(['before','after'] as const).map(v=><button key={v} type="button" aria-pressed={era===v} data-era-opt={v} onClick={()=>setEra(v)}>{v==='before'?'1887':'1912'}</button>)}</span>
      :<span className={s.seg} role="group" aria-label="Which era of glove?">{GLOVE_ERAS.map(v=><button key={v.id} type="button" aria-pressed={gEra===v.id} data-glove-era-btn={v.id} onClick={()=>setGEra(v.id)}>{v.tab}</button>)}</span>}
    </div>
    <div className={p.row}>
     {mode==='pitch'?<p className={`${p.say} ${p.grow}`} aria-live="polite"><b data-hands-word>{word.big}.</b> {word.line}</p>
      :<div className={s.apart}><Slider name="apart" label="Take it apart" value={Math.round(apart*100)} min={0} max={100} onChange={v=>setApart(v/100,false)} show={`${Math.round(apart*100)}%`}/></div>}
     <button type="button" className={`${p.btn} ${s.go}`} data-tone={allFound?'acc':undefined} data-to-check data-museum-own-cue disabled={!allFound} onClick={()=>{setPhase('check');sfx(museumSfx.flapBook);}}>Quick check<StepIcon kind="next"/></button>
    </div>
    <ul className={s.tasks} aria-label="Find all four">{ALL.map(t=><li key={t.id} data-task={t.id} data-done={found.has(t.id)||undefined}>
     <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" className={s.tick}/>{found.has(t.id)&&<path d="M4.6 8.2l2.2 2.2 4.6-4.8" className={s.tickMark}/>}</svg>
     <span>{t.text}</span><span className={p.srOnly}>{found.has(t.id)?' (found)':' (not yet)'}</span></li>)}</ul>
   </>:null}>
  <section className={g.section} aria-labelledby="kh-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="kh-story" className={g.h2}>How the keeper’s hands got a box</h2>
   <ol className={g.steps}>{[...exhibit.facts,EXTRA.first,EXTRA.half,EXTRA.roose,GLOVE_FACT,EXTRA.backpass].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
   <p className={g.small}>{MODEL_NOTE}</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: the penalty area as a green field with two open gloves inside. */
function EndArt(){
 return <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="16" width="32" height="18" fill={ACC} opacity=".9"/><path d="M4 34h32" stroke="#1d1d1b" strokeWidth="1"/>
  <circle cx="14" cy="24" r="3" fill="#f6f4ef" stroke="#1d1d1b" strokeWidth=".8"/><circle cx="26" cy="24" r="3" fill="#f6f4ef" stroke="#1d1d1b" strokeWidth=".8"/><circle cx="20" cy="18" r="3.4" fill="#fff" stroke="#1d1d1b" strokeWidth=".8"/></svg>;
}
