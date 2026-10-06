'use client';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import styles from './Experience.module.css';
import StoryDrawer from './StoryDrawer';
import {BALL_R,GOAL_H,POWERS,WOBBLE,flightTime,keeperTime,landing,odds,pickDive,shotResult,zoneOf,type Era,type Power,type Result} from './model';
import {ERA_TEXT,RESULT_TEXT,ZONE_TEXT} from './content';
import type {PenaltyScene,SceneState,Shot} from './scene';

/**
 * penalty-1891 · "Step up to the spot" (Oct 5 2026 redesign: a broadcast penalty). The island's own bean characters in a small
 * three.js stadium: your saved character takes the kick over the shoulder, a keeper waits in a real 7.32 × 2.44 m goal 11 m away.
 * Drag to aim: broadcast graphics on the goal plane show the keeper's reach, the spray of where your shot can land and the zone
 * you're in, and three numbers say how often that aim is on target, reachable and a goal (the practice model in model.ts).
 * Switch to 1891 and the keeper runs 6 yards out, the pitch shows the 12-yard line, and the ball turns to laced leather.
 * Five kicks make a round with a shot map and the takeaway. The story opens as a slide-out drawer.
 * Heat: the three.js stage (and the character rig) is lazy-loaded, draws only on change or while a shot plays, and is disposed.
 */
const AIM_X=[-5.2,5.2] as const,AIM_Y=[BALL_R,3.4] as const,ROUND=5;
const clamp=(v:number,[a,b]:readonly [number,number])=>Math.max(a,Math.min(b,v));
type Phase='intro'|'aim'|'flying'|'result';
const ZONE_LABEL={outside:'Off target','top-corner':'Top corner','low-corner':'Low corner',middle:'The middle',near:'Near the keeper'} as const;

export default function Experience({exhibit,onClose}:ExperienceProps){
 const canvas=useRef<HTMLCanvasElement>(null),scene=useRef<PenaltyScene|null>(null),dock=useRef<HTMLDivElement>(null),header=useRef<HTMLElement>(null),root=useRef<HTMLElement>(null),intro=useRef<HTMLDivElement>(null),chip=useRef<HTMLDivElement>(null);
 const [phase,setPhase]=useState<Phase>('intro'),[era,setEra]=useState<Era>('today'),[power,setPower]=useState<Power>('firm');
 const [aim,setAim]=useState({x:1.3,y:1.2}),[shots,setShots]=useState<Shot[]>([]),[roundStart,setRoundStart]=useState(0),[last,setLast]=useState<Result|null>(null);
 const [story,setStory]=useState(false),[failed,setFailed]=useState(false),[moved,setMoved]=useState(false),[summary,setSummary]=useState(false),[busy,setBusy]=useState(false);
 const [ready,setReady]=useState(0),[layout,setLayout]=useState(0);
 const reduced=useRef(false);
 const roundShots=shots.slice(roundStart);

 // Lazy-load the three.js stage (three + the island's character rig); dispose it on unmount.
 useEffect(()=>{let cancelled=false;const node=canvas.current;if(!node)return;
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  import('./scene').then(({createPenaltyScene})=>{if(cancelled)return;try{scene.current=createPenaltyScene(node,{coarse:matchMedia('(pointer: coarse)').matches,reducedMotion:reduced.current,onLayout:()=>!cancelled&&setLayout(n=>n+1)});setReady(r=>r+1);}catch{setFailed(true);}}).catch(()=>!cancelled&&setFailed(true));
  return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};},[]);
 const mode:SceneState['mode']=phase;
 const sceneState:SceneState=useMemo(()=>({era,power,aimX:aim.x,aimY:aim.y,shots:roundShots,mode}),[era,power,aim,roundShots.length,mode]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{scene.current?.set(sceneState);},[sceneState,ready]);

 // Tell the stage which part of the screen is free (not under the header, the dock or the intro card): the goal is centred there.
 useLayoutEffect(()=>{const r=root.current;if(!r)return;
  const measure=()=>{const s=scene.current;if(!s)return;const R=r.getBoundingClientRect(),h=header.current?.getBoundingClientRect(),W=R.width,H=R.height;
   const top=Math.max(64,(h?h.bottom-R.top:64)+6);let right=0,bottom=8,left=0;
   const box=(phase==='intro'?intro.current:dock.current)?.getBoundingClientRect();
   if(box&&box.width>0){if(box.left>W*.4)right=R.right-box.left+8;else if(box.right<W*.62&&box.height>H*.5)left=box.right-R.left+8;else bottom=Math.max(8,R.bottom-box.top+8);}
   s.setInsets({top:phase==='intro'?(left?24:top):top,right,bottom,left});};
  measure();const ro=new ResizeObserver(measure);ro.observe(r);if(dock.current)ro.observe(dock.current);if(intro.current)ro.observe(intro.current);if(header.current)ro.observe(header.current);
  return()=>ro.disconnect();},[ready,phase]);

 // The live goal-chance chip rides above the reticle (written straight to the DOM: no re-render per drag move).
 useLayoutEffect(()=>{const s=scene.current,c=chip.current;if(!s||!c)return;const p=s.project(aim.x,aim.y+.42,0);c.style.transform=`translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-100%)`;},[aim,layout,ready,phase]);

 // Every fifth kick ends a round: let the result land, then show the round card.
 useEffect(()=>{if(phase!=='result'||!roundShots.length||roundShots.length<ROUND)return;const t=setTimeout(()=>setSummary(true),reduced.current?0:1000);return()=>clearTimeout(t);},[roundShots.length,phase]);

 const live=useMemo(()=>odds(era,power,aim.x,aim.y),[era,power,aim]);
 const zone=zoneOf(aim.x,aim.y);
 const goals=shots.filter(s=>s.result==='goal').length,roundGoals=roundShots.filter(s=>s.result==='goal').length;

 const ready2=useCallback(()=>{if(phase==='result'&&!busy){setPhase('aim');setLast(null);setSummary(false);scene.current?.reset();}},[phase,busy]);
 const nudge=useCallback((dx:number,dy:number)=>{ready2();setMoved(true);setAim(a=>({x:clamp(a.x+dx,AIM_X),y:clamp(a.y+dy,AIM_Y)}));},[ready2]);

 const shoot=useCallback(()=>{
  if(phase!=='aim'&&!(phase==='result'&&!busy))return;const s=scene.current;if(!s)return;setSummary(false);
  if(roundShots.length>=ROUND)setRoundStart(shots.length);
  const w=WOBBLE[Math.floor(Math.random()*WOBBLE.length)],l=landing(aim.x,aim.y,power,w),dive=pickDive(Math.random()),result=shotResult(era,power,dive,l.x,l.y);
  setPhase('flying');setLast(null);setBusy(true);setMoved(true);museumSfx.kick();
  s.shoot({x:l.x,y:l.y,dive,result},()=>{
   setShots(list=>[...list.slice(-29),{x:l.x,y:l.y,result}]);setLast(result);setPhase('result');
   if(!reduced.current&&result==='goal')navigator.vibrate?.(14);
   if(result==='goal'){museumSfx.net();museumSfx.crowd();}else if(result==='post'||result==='bar')museumSfx.stamp();else museumSfx.look();
  },()=>setBusy(false));
 },[phase,busy,aim,power,era,roundShots.length,shots.length]);

 // Drag to aim. Touch and pen move the aim by how far you drag (the finger never hides the target); a mouse click on the goal
 // puts the aim right there, then drags it.
 const drag=useRef<{id:number;x:number;y:number}|null>(null);
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(phase==='intro'||phase==='flying'||busy||drag.current||summary)return;ready2();
  drag.current={id:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);
  if(e.pointerType==='mouse'&&scene.current){const r=e.currentTarget.getBoundingClientRect(),p=scene.current.unproject(e.clientX-r.left,e.clientY-r.top);
   if(p.x>AIM_X[0]-.5&&p.x<AIM_X[1]+.5&&p.y>-.5&&p.y<AIM_Y[1]+.4){setAim({x:clamp(p.x,AIM_X),y:clamp(p.y,AIM_Y)});setMoved(true);}}};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current,s=scene.current;if(!d||d.id!==e.pointerId||!s)return;
  const r=e.currentTarget.getBoundingClientRect(),a=s.unproject(d.x-r.left,d.y-r.top),b=s.unproject(e.clientX-r.left,e.clientY-r.top);d.x=e.clientX;d.y=e.clientY;
  // Touch: a little gain, so a thumb sweep across a phone reaches either post.
  const g=e.pointerType==='mouse'?1:1.25;nudge((b.x-a.x)*g,(b.y-a.y)*g);};
 const up=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(drag.current?.id===e.pointerId)drag.current=null;};

 // Keyboard: arrows aim, Enter/Space shoot, Escape closes the round card first, then the exhibit (the story drawer handles its own).
 useEffect(()=>{const key=(e:KeyboardEvent)=>{
  if(story)return;
  if(e.key==='Escape'){e.preventDefault();if(summary)setSummary(false);else onClose();return;}
  if(phase==='intro'||summary)return;const step=e.shiftKey?.4:.12;
  if(e.key==='ArrowLeft'){e.preventDefault();nudge(-step,0);}else if(e.key==='ArrowRight'){e.preventDefault();nudge(step,0);}
  else if(e.key==='ArrowUp'){e.preventDefault();nudge(0,step);}else if(e.key==='ArrowDown'){e.preventDefault();nudge(0,-step);}
  else if((e.key==='Enter'||e.key===' ')&&!(e.target instanceof HTMLButtonElement)&&!(e.target instanceof HTMLElement&&e.target.closest('summary'))){e.preventDefault();shoot();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[phase,story,summary,nudge,shoot,onClose]);

 const begin=()=>{museumSfx.whistle();setPhase('aim');};
 const pct=(v:number)=>`${Math.round(v*100)}%`;
 const aimLabel=`Aim ${Math.abs(aim.x).toFixed(1)} m ${aim.x<0?'left':'right'} of the middle, ${aim.y.toFixed(1)} m up. On target ${pct(live.onTarget)}, goal chance ${pct(live.goal)}.`;
 const eraIndex=era==='1891'?0:1,powerIndex=(Object.keys(POWERS) as Power[]).indexOf(power);
 // Stage geometry for the result banner and round card (the goal's centre column; the pitch in front of the goal).
 const s=scene.current,stageX=s&&ready?s.project(0,GOAL_H/2,0).x:undefined,bannerY=s&&ready?s.project(0,0,6.2).y:undefined;void layout;
 // The round card centres on the goal but never runs off the screen.
 const cardLeft=(x:number)=>{const W=root.current?.clientWidth??0,H=root.current?.clientHeight??0,half=Math.min(W>H*1.1&&H<=560?260:220,(W-32)/2)+16;return {left:Math.min(Math.max(x,half),W-half)};};
 const fresh=roundShots.length>=ROUND&&phase==='aim',dots=Array.from({length:ROUND},(_,i)=>fresh?undefined:roundShots[i]?.result);

 return <section ref={root} className={styles.root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="penalty-1891" data-era={era} data-phase={phase} data-summary={summary||undefined}>
  <canvas ref={canvas} className={styles.canvas} role="img" aria-label={`A penalty at real size: a goal 7.32 metres wide, 11 metres away, and you at the spot. ${aimLabel}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>
  <div className={styles.vignette} aria-hidden="true"/>
  {failed&&<p className={styles.error}>The penalty spot couldn’t load on this device.</p>}

  <ExperienceBack onClose={onClose}/>
  <header ref={header} className={styles.header}>
   {phase!=='intro'&&<div className={styles.era} role="group" aria-label="Which rules" style={{'--i':eraIndex} as CSSProperties}>
    <span className={styles.thumb} aria-hidden="true"/>
    {(['1891','today'] as const).map(v=><button key={v} type="button" aria-pressed={era===v} data-era-button={v} disabled={busy} onClick={()=>{ready2();setEra(v);}}>{v==='today'?'Today':'1891'}</button>)}
   </div>}
   <button type="button" className={styles.storyButton} aria-haspopup="dialog" onClick={()=>setStory(true)}>Story</button>
   {phase!=='intro'&&<p className={styles.eraNote} key={era} data-hidden={phase!=='aim'||summary||undefined} aria-live="polite"><b>{era==='1891'?'1891 rules':'Today’s rules'}</b>{ERA_TEXT[era].replace(/^[^:]*:\s*/,'')}</p>}
  </header>

  {phase!=='intro'&&<div ref={chip} className={styles.chip} data-hidden={phase!=='aim'||undefined} aria-hidden="true"><span>Goal</span><b>{pct(live.goal)}</b></div>}
  {phase==='aim'&&!moved&&<p className={styles.hint} style={stageX!=null&&bannerY!=null?{left:stageX,top:bannerY}:undefined} aria-hidden="true"><span className={styles.hintDot}/>Drag to aim, then Shoot</p>}

  {phase==='result'&&last&&!summary&&<div className={styles.result} style={stageX!=null&&bannerY!=null?{left:stageX,top:bannerY}:undefined} data-result={last} role="status">
   <b>{RESULT_TEXT[last].big}</b><span>{RESULT_TEXT[last].line}</span>
  </div>}

  {phase!=='intro'&&<div ref={dock} className={styles.dock}>
   <div className={styles.line}>
    <span className={styles.zoneTag} data-zone={zone}>{ZONE_LABEL[zone]}</span>
    <p className={styles.zone} aria-live="polite">{roundShots.length>=3&&phase==='result'?exhibit.forYourGame:ZONE_TEXT[zone]}</p>
    <ol className={styles.round} aria-label={`This round: ${roundShots.length} of ${ROUND} kicks taken, ${roundGoals} scored`}>{dots.map((r,i)=><li key={i} data-result={r}/>)}</ol>
   </div>
   <p className={styles.eraNoteDock} key={era} aria-hidden="true">{ERA_TEXT[era]}</p>
   <dl className={styles.stats}>
    <div data-k="target"><dt>On target</dt><dd>{pct(live.onTarget)}</dd><i style={{transform:`scaleX(${live.onTarget})`}}/></div>
    <div data-k="reach"><dt>Keeper reach</dt><dd>{pct(live.reach)}</dd><i style={{transform:`scaleX(${live.reach})`}}/></div>
    <div data-k="goal"><dt>Goal chance</dt><dd>{pct(live.goal)}</dd><i style={{transform:`scaleX(${live.goal})`}}/></div>
   </dl>
   <div className={styles.controls}>
    <div className={styles.power} role="group" aria-label="How hard" style={{'--i':powerIndex} as CSSProperties}>
     <span className={styles.thumb} aria-hidden="true"/>
     {(Object.keys(POWERS) as Power[]).map(p=><button key={p} type="button" aria-pressed={power===p} disabled={busy} onClick={()=>{ready2();setPower(p);}} aria-label={`${POWERS[p].label}: ${POWERS[p].kmh} kilometres an hour`}>
      <b>{POWERS[p].label}</b><small>{POWERS[p].kmh} km/h</small></button>)}
    </div>
    <button type="button" className={styles.shoot} data-museum-own-cue onClick={shoot} disabled={busy||phase==='flying'||!!failed||summary}>{phase==='result'?'Again':'Shoot'}</button>
   </div>
   <p className={styles.meta}>Ball flies <b>{flightTime(power).toFixed(2)} s</b> · keeper gets <b>{keeperTime(era,power).toFixed(2)} s</b>{shots.length>0&&<span className={styles.metaWide}> · goals <b>{goals}/{shots.length}</b></span>} · <span className={styles.model}>practice model</span></p>
  </div>}

  {summary&&<div className={styles.scrim} aria-hidden="true" onClick={()=>setSummary(false)}/>}
  {summary&&<div className={styles.summary} role="dialog" aria-label="Your five penalties" style={stageX!=null?cardLeft(stageX):undefined}>
   <p className={styles.kicker}>Full time · five penalties</p>
   <h2 className={styles.summaryHead}>{roundGoals}<span>/{ROUND}</span> <em>scored</em></h2>
   <svg className={styles.map} viewBox={`${-4.3} ${-GOAL_H-.5} 8.6 ${GOAL_H+.7}`} aria-label={`Your shot map: ${roundGoals} goals, ${ROUND-roundGoals} misses or saves`}>
    <rect x={-3.66} y={-GOAL_H} width={7.32} height={GOAL_H} className={styles.mapMouth}/>
    <path d={`M-3.66 0V${-GOAL_H}H3.66V0`} className={styles.mapFrame}/>
    <line x1={-4.3} x2={4.3} y1={0} y2={0} className={styles.mapLine}/>
    {roundShots.map((r,i)=><circle key={i} cx={r.x} cy={-r.y} r={.17} className={styles.mapDot} data-result={r.result} style={{'--d':`${i*90}ms`} as CSSProperties}/>)}
   </svg>
   <p className={styles.summaryTake}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <div className={styles.summaryButtons}>
    <button type="button" className={styles.primary} data-museum-own-cue onClick={()=>{setSummary(false);setRoundStart(shots.length);ready2();}}>Take five more</button>
    <button type="button" className={styles.ghost} onClick={()=>{setSummary(false);setStory(true);}}>Read the story</button>
   </div>
  </div>}

  {phase==='intro'&&<div className={styles.intro}><div ref={intro} className={styles.introCard}>
   <p className={styles.kicker}>{exhibit.year} · Milford, County Armagh</p>
   <h1 className={styles.headline}>A goalkeeper invented the <em>penalty</em>.</h1>
   <p className={styles.deck}>{exhibit.facts[0]} Defenders kept fouling attackers to stop goals, so McCrum asked for a free shot at goal: just the kicker against the keeper.</p>
   <dl className={styles.scale} aria-label="Everything is real size">
    <div><dt>Goal wide</dt><dd>7.32<small> m</small></dd></div><div><dt>Goal high</dt><dd>2.44<small> m</small></dd></div><div><dt>To the spot</dt><dd>11<small> m</small></dd></div>
   </dl>
   <div className={styles.introButtons}>
    <button type="button" className={styles.primary} data-museum-own-cue onClick={begin}>Step up to the spot</button>
    <button type="button" className={styles.ghost} onClick={()=>setStory(true)}>The story</button>
   </div>
  </div></div>}

  {story&&<StoryDrawer exhibit={exhibit} onClose={()=>setStory(false)}/>}
 </section>;
}
