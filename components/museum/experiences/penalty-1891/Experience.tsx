'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as RPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {ACCENT,springLinear} from '../modern/tokens';
import {useReduced,useSeen} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import pc from '../modern/pieces.module.css';
import {BALL_R,GOAL_H,GOAL_W,HUB_Y,MARK,POST_X,POWERS,SIX_YARDS,WOBBLE,flightTime,keeperDepth,keeperTime,landing,odds,pickDive,reach,shotResult,toGoal,zoneOf,type Dive,type Era,type Power,type Result} from './model';
import {CHECKS,ERA_NAME,ERA_TEXT,HISTORY,MODEL_NOTE,RESEARCH,RESULT_TEXT,SOURCES,STORY,ZONE_TEXT,compareText} from './content';
import Cabinet from './Cabinet';
import s from './Experience.module.css';

/**
 * penalty-1891 · "Step up to the spot", retold on Oct 10 2026 in the museum's MODERN GALLERY language
 * (docs/museum-modern-style.md; before: a 16-bit arcade stadium). One accent: red. The penalty is abstract: a sphere and a line
 * at 11 m, a goal drawn as a 7.32 × 2.44 m frame (to scale), the keeper reduced to a circle head and a rounded body, his reach a
 * pale oval, the kicker's wobble a spray of red dots (the model's own samples).
 *  1. Wall label + the hero composition, drawn to scale: the goal, the line, the sphere on the spot 11 m away; "Take a penalty →".
 *  1b. THE ARCADE CABINET (Oct 10 2026, user: "keep the white modern design, but add on the pixel penalty from the last design";
 *     "that was more interactive"): the 16-bit shootout from the Oct 9 arcade pass, framed on the wall as an exhibit within the
 *     exhibit (Cabinet.tsx). It is the hands-on centrepiece, right after the opening: cutscene, aim, hold-to-power, the keeper's
 *     dive, the crowd, five kicks, the score screen with a quick check per round. The page explains, the cabinet plays; both run
 *     on model.ts, so the numbers agree. A finished round (with its question answered) is a real ending too.
 *  2. How it happened: four numbered history steps (fouls that stopped goals → McCrum's idea → the handball on the line → a Law).
 *  3. Up close: same kick, two rules (the explainer; rounds of five live in the cabinet): drag on the goal to aim, pick how hard, shoot. The spray grows with
 *     power while the keeper's reach shrinks (less time). Switch the rules to 1891 and the keeper walks 6 yards out on the 11 m
 *     line above, his shadow covering much more of the goal; "Same kick in 1891" replays the same landing and the same dive under
 *     the other rule, which is why since 1905 the keeper stays on his line.
 *  4. The rule then and now, what studies found, the practice-model note, sources; quick check (shared); ending → onComplete.
 * Heat: this page 0 rAF (the cabinet sleeps off-screen and at rest, see Cabinet.tsx). The aim follows the finger by pointer events (no loop) and settles on a CSS spring transition; the shot and the dive
 * are one-shot Web Animations (transform only); reveals are CSS. Reduced motion: no flight, no dive, the result appears.
 */
const AIM_X=[-5.2,5.2] as const,AIM_Y=[BALL_R,3.4] as const,MARKS=5;
const clamp=(v:number,[a,b]:readonly [number,number])=>Math.max(a,Math.min(b,v));
const POWER_KEYS=Object.keys(POWERS) as Power[];
const ZONE_LABEL={outside:'Off target','top-corner':'Top corner','low-corner':'Low corner',middle:'The middle',near:'Near the keeper'} as const;
type Kick={x:number;y:number;dive:Dive;power:Power;era:Era;result:Result};
const SPRAY=WOBBLE.slice(0,90);
const EASE=springLinear(170,.72);
const kSc=(era:Era)=>MARK/(MARK-keeperDepth(era));
const pct=(v:number)=>`${Math.round(v*100)}%`;

/** The hero: the goal frame, the line and the sphere on the spot, all at the same scale (30 units a metre). */
function ToScale(){
 const [ref,seen]=useSeen<HTMLDivElement>(.2);const M=30,top=20,line=top+GOAL_H*M,spot=line+MARK*M;
 return <div ref={ref} data-in={seen||undefined} className={s.scaleArt}>
  <svg viewBox={`0 0 300 ${spot+30}`} aria-hidden="true">
   <line x1={0} x2={300} y1={line} y2={line} className={s.hair}/>
   <path d={`M${150-GOAL_W/2*M} ${line}V${top}H${150+GOAL_W/2*M}V${line}`} pathLength={1} className={`${g.draw} ${s.ln}`}/>
   <line x1={150} x2={150} y1={line} y2={spot} pathLength={1} className={`${g.draw} ${s.ln}`} style={{transitionDelay:'.35s'}}/>
   <line x1={150-GOAL_W/2*M} x2={150+GOAL_W/2*M} y1={spot+18} y2={spot+18} className={s.hair}/>
   <g className={s.pop} style={{transitionDelay:'.9s'}}><circle cx={150} cy={spot} r={13} className={s.ball}/></g>
  </svg>
  <p className={s.scaleTag}><span className={g.numeral}>11<small>m</small></span><span className={g.small}>From the spot to the goal line. Goal 7.32 m × 2.44 m. Drawn to scale.</span></p>
 </div>;
}

const ICON:Record<typeof STORY[number]['icon'],JSX.Element>={
 foul:<svg viewBox="0 0 64 40" aria-hidden="true"><circle cx={22} cy={20} r={10} className={s.solidInk}/><circle cx={40} cy={20} r={10} className={s.ln}/><path d="M27 33l8 6M35 33l-8 6" className={s.ln}/></svg>,
 idea:<svg viewBox="0 0 64 40" aria-hidden="true"><line x1={4} x2={60} y1={34} y2={34} className={s.hair}/><circle cx={32} cy={26} r={6} className={s.ball}/><path d="M12 6H52" className={s.ln}/></svg>,
 hand:<svg viewBox="0 0 64 40" aria-hidden="true"><path d="M8 36V6H56V36" className={s.ln}/><line x1={2} x2={62} y1={36} y2={36} className={s.ln}/><rect x={28} y={24} width={8} height={8} className={s.solidInk}/></svg>,
 law:<svg viewBox="0 0 64 40" aria-hidden="true">{[6,14,22,30].map((y,k)=><line key={y} x1={10} x2={k===3?34:54} y1={y} y2={y} className={k===3?s.redLine:s.ln}/>)}</svg>,
};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [era,setEra]=useState<Era>('today'),[power,setPower]=useState<Power>('firm'),[aim,setAim]=useState({x:1.3,y:1.2});
 const [kicks,setKicks]=useState<Kick[]>([]),[shown,setShown]=useState<Kick|null>(null);
 const [compare,setCompare]=useState<{from:Kick;to:Kick}|null>(null),[flying,setFlying]=useState(false),[dragging,setDragging]=useState(false),[moved,setMoved]=useState(false);
 const [checked,setChecked]=useState(false),[played,setPlayed]=useState(false),[cabWake,setCabWake]=useState(0);
 const cabSec=useRef<HTMLElement>(null),storySec=useRef<HTMLElement>(null);
 const root=useRef<HTMLElement>(null),svg=useRef<SVGSVGElement>(null),ballEl=useRef<SVGGElement>(null),keeperEl=useRef<SVGGElement>(null);
 const anims=useRef<Animation[]>([]),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>()=>{anims.current.forEach(a=>a.cancel());timers.current.forEach(clearTimeout);},[]);
 useEffect(()=>{root.current?.focus({preventScroll:true});},[]);

 const live=useMemo(()=>odds(era,power,aim.x,aim.y),[era,power,aim]);
 const zone=zoneOf(aim.x,aim.y);
 const round=kicks.slice(-MARKS);
 /** "Take a penalty →": scroll to the cabinet and focus its first control. */
 const toCabinet=()=>{cabSec.current?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});setCabWake(n=>n+1);museumSfx.whistle();};
 const toStory=()=>storySec.current?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});

 // Keeper reach on the goal plane (the 1891 keeper stands 5.5 m out: his shadow from the ball covers twice as much).
 const sc=MARK/(MARK-keeperDepth(era)),{a,b}=reach(keeperTime(era,power)),hubY=toGoal(era,0,HUB_Y).y;
 const spray=useMemo(()=>SPRAY.map(w=>landing(aim.x,aim.y,power,w)),[aim,power]);

 /** Play the shot: the sphere flies from the spot (near, big) to where it lands; the keeper dives. One-shot WAAPI, transform only. */
 const play=useCallback((k:Kick,done:()=>void)=>{
  anims.current.forEach(x=>x.cancel());anims.current=[];
  const bEl=ballEl.current,kEl=keeperEl.current;
  if(reduced||!bEl||typeof bEl.animate!=='function'){done();return;}
  const ms=Math.round(flightTime(k.power)*1300),dir=k.dive==='left'?-1:k.dive==='right'?1:0;
  anims.current.push(bEl.animate([{transform:'translate(0px,0.9px) scale(3.2)',opacity:0},{opacity:1,offset:.08},{transform:`translate(${k.x}px,${-k.y}px) scale(1)`,opacity:1}],{duration:ms,easing:'cubic-bezier(.25,.6,.35,1)',fill:'forwards'}));
  // The dive happens inside the keeper's (1891: doubled) shadow, so it is measured in his own scale and stays inside the oval.
  if(kEl&&dir)anims.current.push(kEl.animate([{transform:'none'},{transform:`translate(${(dir*Math.min(2.2/kSc(k.era),reach(keeperTime(k.era,k.power)).a*.8)).toFixed(3)}px,-0.3px) rotate(${dir*62}deg)`}],{duration:Math.round(ms*.9),delay:90,easing:EASE,fill:'forwards'}));
  else if(kEl)anims.current.push(kEl.animate([{transform:'none'},{transform:'translateY(-0.18px)'},{transform:'none'}],{duration:ms,easing:'ease-out'}));
  timers.current.push(setTimeout(done,ms+40));
 },[reduced]);
 const resetPose=()=>{anims.current.forEach(x=>x.cancel());anims.current=[];};

 const land=(k:Kick)=>{setShown(k);setFlying(false);
  if(k.result==='goal'){museumSfx.net();museumSfx.crowd();}else if(k.result==='post'||k.result==='bar')museumSfx.stamp();else museumSfx.look();};
 const shoot=()=>{if(flying)return;
  const w=WOBBLE[Math.floor(Math.random()*WOBBLE.length)],l=landing(aim.x,aim.y,power,w),dive=pickDive(Math.random());
  const k:Kick={x:l.x,y:l.y,dive,power,era,result:shotResult(era,power,dive,l.x,l.y)};
  setFlying(true);setCompare(null);setShown(null);setMoved(true);museumSfx.kick();
  play(k,()=>{setKicks(list=>[...list.slice(-29),k]);land(k);});};
 /** The same kick (same spot, same dive) under the other rules: the keeper walks to his 1891 spot (or back to his line) first. */
 const replayOther=()=>{const k=shown;if(!k||flying)return;const other:Era=k.era==='1891'?'today':'1891';
  setFlying(true);setShown(null);setEra(other);resetPose();museumSfx.whistle();
  const go=()=>{const k2:Kick={...k,era:other,result:shotResult(other,k.power,k.dive,k.x,k.y)};play(k2,()=>{setCompare({from:k,to:k2});land(k2);});};
  if(reduced)go();else timers.current.push(setTimeout(go,900));};

 // ── Aim: drag on the goal (the reticle follows the finger, no loop); a tap jumps there on the spring; arrows nudge.
 const toGoalPlane=(e:{clientX:number;clientY:number})=>{const el=svg.current,m=el?.getScreenCTM();if(!el||!m)return null;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return {x:clamp(p.x,AIM_X),y:clamp(-p.y,AIM_Y)};};
 const down=(e:RPointerEvent<SVGSVGElement>)=>{if(flying||e.button>0)return;const p=toGoalPlane(e);if(!p)return;e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);setMoved(true);if(shown){setShown(null);setCompare(null);resetPose();}setAim(p);};
 const move=(e:RPointerEvent<SVGSVGElement>)=>{if(!dragging)return;const p=toGoalPlane(e);if(p)setAim(p);};
 const up=()=>{if(dragging){setDragging(false);museumSfx.tick();}};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{
  if(e.defaultPrevented)return;
  if(e.key==='Escape'){e.preventDefault();closeRef.current();return;}
  const t=e.target as HTMLElement|null;if(!t?.closest?.('[data-aim]'))return;
  const st=e.shiftKey?.4:.12,d:{[k:string]:[number,number]}={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,st],ArrowDown:[0,-st]};
  if(d[e.key]){e.preventDefault();setMoved(true);setAim(p=>({x:clamp(p.x+d[e.key][0],AIM_X),y:clamp(p.y+d[e.key][1],AIM_Y)}));}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();shoot();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});


 const banner=compare?compare.to:shown;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const items=useMemo(()=>CHECKS.map(c=>({q:c.q,options:c.options,right:c.answer,why:c.why})),[]);
 const aimLabel=`Aim ${Math.abs(aim.x).toFixed(1)} m ${aim.x<0?'left':'right'} of the middle, ${aim.y.toFixed(1)} m up. On target ${pct(live.onTarget)}, goal chance ${pct(live.goal)}.`;

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="penalty-1891"
  data-era={era} className={`${g.room} ${s.root}`} style={{'--accent':ACCENT.red} as CSSProperties}>
  <div className={g.veil} aria-hidden="true"/>
  <ExperienceBack onClose={onClose}/>
  <div className={g.scroll} data-scroll><div className={g.col}>

   <header className={`${g.split} ${s.hero}`}>
    <div className={s.stack}>
     <WallLabel as="h1" title="The penalty kick" meta={<>{exhibit.year} · Milford, County Armagh</>} caption="A goalkeeper invented it."/>
     <p className={g.lead}>{exhibit.facts[0]}</p>
     <p className={g.body}>{exhibit.facts.slice(1).join(' ')}</p>
     <div className={g.row}><button type="button" className={`${g.btn} ${s.take}`} data-museum-own-cue data-take-penalty onClick={toCabinet}>Take a penalty →</button></div>
    </div>
    <ToScale/>
   </header>

   <section ref={cabSec} id="pk-cabinet" className={`${g.section} ${s.cabSec}`} aria-labelledby="pk-cab" data-cabinet-section>
    <div className={s.cabHead}>
     <WallLabel as="h2" id="pk-cab" title={<>Penalty, 16-bit <span className={s.playIt}>· Play it</span></>} meta="Arcade cabinet · the shootout" caption="Five kicks against the keeper, from the spot, 11 m out."/>
     <p className={g.small}>Drag the goal to aim, hold <b>Shoot</b> to power up, let go to kick. Switch the rules to 1891 and the keeper may come 6 yards out.</p>
    </div>
    <Cabinet exhibit={exhibit} reduced={reduced} wake={cabWake} onRound={()=>setPlayed(true)} onStory={toStory}/>
   </section>

   <section ref={storySec} className={g.section} aria-labelledby="pk-story">
    <p className={g.kicker}>How it happened</p>
    <h2 id="pk-story" className={g.h2}>Why football needed a free shot at goal</h2>
    <ol className={s.history}>{STORY.map((b,i)=><HistoryStep key={i} i={i} b={b}/>)}</ol>
   </section>

   <section className={`${g.section} ${g.split}`} aria-labelledby="pk-rule">
    <div className={s.stack}>
     <p className={g.kicker}>The rule, then and now</p>
     <h2 id="pk-rule" className={g.h2}>From a line across the pitch to a spot</h2>
     <ol className={g.steps}>{[...exhibit.facts,...HISTORY].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
    </div>
    <div className={s.stack}>
     <p className={g.kicker}>Where to aim? What studies found</p>
     {RESEARCH.map(f=><p key={f} className={g.lead}>{f}</p>)}
     <p className={g.small}>{MODEL_NOTE}</p>
    </div>
   </section>

   <section className={g.section} aria-labelledby="pk-check">
    <p className={g.kicker}>Quick check</p>
    <h2 id="pk-check" className={g.h2}>Three questions on the penalty</h2>
    <StepCheck items={items} kicker={(i,n)=>`${i+1} of ${n}`} onPick={ok=>ok?museumSfx.net():museumSfx.look()} doneLabel="Finish"
     onDone={()=>{museumSfx.reveal();setChecked(true);}}
     renderDone={(score,again)=><div className={pc.score} role="status"><b>{score}/{items.length}</b><span>{score===items.length?'Every one right.':'Good try. The answers are in the room.'}</span><button type="button" className={g.ghost} onClick={again}>Try again</button></div>}/>
   </section>

   {(checked||played)&&<Ending art={<EndArt/>} seen="You’ve seen why the keeper stays on his line." take={exhibit.forYourGame} onComplete={onComplete} reached={checked||played}/>}

   <footer className={s.stack}>
    <details className={g.sources}><summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
   </footer>
  </div></div>
 </section>;
}

function HistoryStep({i,b}:{i:number;b:typeof STORY[number]}){
 const [ref,seen]=useSeen<HTMLLIElement>(.35);
 return <li ref={ref} data-in={seen||undefined} className={s.hStep}>
  <span className={s.hNum}>{String(i+1).padStart(2,'0')}</span>
  <div className={s.hIcon}>{ICON[b.icon]}</div>
  <div className={s.hText}><p className={g.kicker}>{b.when}</p><h3 className={s.h3}>{b.head}</h3><p className={g.body}>{b.text}</p></div>
 </li>;
}

/** The ending: the frame completes and the sphere comes to rest inside it. */
function EndArt(){
 const [ref,seen]=useSeen<HTMLDivElement>(.3);
 return <div ref={ref} data-in={seen||undefined}><svg viewBox="0 0 260 120">
  <line x1={0} x2={260} y1={100} y2={100} className={s.hair}/>
  <path d="M20 100V20H240V100" pathLength={1} className={`${g.draw} ${s.ln}`}/>
  <g className={s.pop} style={{transitionDelay:'.8s'}}><circle cx={200} cy={44} r={12} className={s.ball}/></g>
 </svg></div>;
}
