'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type KeyboardEvent as RKeyboardEvent,type MutableRefObject,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {AKERS_PLAY,WINNER_COLOR} from './data';
import {BeanCut,ballCut} from './papercut';
import {PitchSheet} from './FinalReplay';
import {rubber,stepSpring} from './spring';
import styles from './wwc.module.css';

/**
 * "Your turn: score Akers's winner" (Oct 9 2026). The 78th minute of the 1991 final as a game you drive: Norway's defender
 * plays a slow back pass to her goalkeeper; you drag Michelle Akers to win it first, then flick (or press Shoot) to score.
 * Teaching point: keep pressing; a defender's mistake can become your goal (the real goal: she chased a back pass, won it,
 * went round the keeper and scored).
 * Motion: Akers follows your finger on a 2-D spring (velocity-aware, interruptible, speed-capped like a real sprinter), the
 * target is rubber-banded at the pitch edges, a release flick's velocity becomes the shot (momentum + rolling friction), and the
 * keeper reacts (comes for the pass, closes Akers down, dives at the shot).
 * Heat: one rAF, only while the move is live or Akers is still settling; it stops at every result, when the tab hides and on
 * unmount. Positions are written straight to SVG transforms (no React render per frame). Reduced motion: Akers jumps to your
 * finger (no spring) and "Show me" jumps to the finished goal.
 */
type V={x:number;y:number};
type Phase='ready'|'chase'|'have'|'shot'|'goal'|'miss';
type Why='keeper'|'tackle'|'saved'|'wide'|'soft';
const P=AKERS_PLAY,GOAL_X=105,[POST_A,POST_B]=P.posts;
const MAX_RUN=12.5,KEEPER_COME=1.2,KEEPER_PRESS=2.6,KEEPER_DIVE=5.5,WIN_R=2.8,KEEP_R=1.5,SAVE_R=1.35;
const BOUNDS={x0:56,x1:104.5,y0:.5,y1:67.5};
const dist=(a:V,b:V)=>Math.hypot(a.x-b.x,a.y-b.y);
const MSG:Record<Phase|Why,string>={
 ready:'Drag Akers to the ball. Norway’s defender is about to pass back to her keeper!',
 chase:'Go, go! Get to the ball before the keeper does.',
 have:'You won it! Now flick the ball into the goal, or press Shoot. Try going round the keeper.',
 shot:'Shot!',
 goal:'GOAL! USA 2–1 Norway. That’s just how Michelle Akers won the first Women’s World Cup.',
 miss:'',
 keeper:'The keeper got there first. Start running sooner!',
 tackle:'The keeper grabbed it. Shoot sooner, or go round her!',
 saved:'Saved! Aim for the side of the goal the keeper isn’t on.',
 wide:'Just wide! Aim between the posts.',
 soft:'Too soft! Flick harder toward the goal.',
};

export type Akers=ReturnType<typeof useAkers>;
export function useAkers(reduced:MutableRefObject<boolean>){
 const [phase,setPhaseRaw]=useState<Phase>('ready'),[why,setWhy]=useState<Why|null>(null),[tries,setTries]=useState(0),[scored,setScored]=useState(0);
 const svg=useRef<SVGSVGElement>(null),gA=useRef<SVGGElement>(null),gK=useRef<SVGGElement>(null),gB=useRef<SVGGElement>(null),ring=useRef<SVGCircleElement>(null),pass=useRef<SVGPathElement>(null);
 const E=useRef({a:{x:P.akers[0],y:P.akers[1]},ax:{x:P.akers[0],v:0},ay:{x:P.akers[1],v:0},t:{x:P.akers[0],y:P.akers[1]},
  k:{x:P.keeper[0],y:P.keeper[1]},b:{x:P.defender[0]+1.2,y:P.defender[1]-.6},bv:{x:0,y:0},phase:'ready' as Phase,raf:0,last:0,drag:false,auto:false,chase:false,
  samples:[] as {t:number;x:number;y:number}[]});
 const setPhase=useCallback((p:Phase,w:Why|null=null)=>{E.current.phase=p;setPhaseRaw(p);setWhy(w);},[]);

 const paint=useCallback(()=>{const e=E.current;
  gA.current?.setAttribute('transform',`translate(${e.ax.x.toFixed(2)} ${e.ay.x.toFixed(2)})`);
  gK.current?.setAttribute('transform',`translate(${e.k.x.toFixed(2)} ${e.k.y.toFixed(2)})`);
  gB.current?.setAttribute('transform',`translate(${e.b.x.toFixed(2)} ${e.b.y.toFixed(2)})`);
  if(ring.current){ring.current.setAttribute('cx',e.t.x.toFixed(2));ring.current.setAttribute('cy',e.t.y.toFixed(2));ring.current.style.opacity=e.drag?'1':'0';}
 },[]);

 const end=useCallback((p:'goal'|'miss',w:Why|null)=>{setPhase(p,w);setTries(n=>n+1);
  if(p==='goal'){setScored(n=>n+1);try{museumSfx.net();museumSfx.crowd();}catch{}}else{try{museumSfx.look();}catch{}}},[setPhase]);

 const shootAt=useCallback((dx:number,dy:number,speed:number)=>{const e=E.current;if(e.phase!=='have')return;const L=Math.hypot(dx,dy)||1;
  e.bv={x:dx/L*speed,y:dy/L*speed};e.phase='shot';setPhase('shot');try{museumSfx.kick();}catch{}},[setPhase]);
 /** The Shoot button / Space: aim inside the post on the side away from the keeper. */
 const shoot=useCallback(()=>{const e=E.current;if(e.phase!=='have')return;const aim=e.k.y>34?POST_A+1.3:POST_B-1.3;shootAt(GOAL_X-e.b.x,aim-e.b.y,24);},[shootAt]);

 const frame=useCallback((now:number)=>{const e=E.current;e.raf=0;if(document.hidden){e.last=0;return;}
  const dt=Math.min(.04,e.last?(now-e.last)/1000:1/60);e.last=now;const live=e.phase==='chase'||e.phase==='have'||e.phase==='shot';
  // Autopilot ("Show me"): lead the pass, then go round the keeper and finish.
  if(e.chase&&e.phase==='chase'&&!e.auto)e.t={x:e.b.x+e.bv.x*.45,y:e.b.y+e.bv.y*.45};
  if(e.auto&&live){if(e.phase==='chase'){e.t={x:e.b.x+e.bv.x*.45,y:e.b.y+e.bv.y*.45};}
   else if(e.phase==='have'){const side=e.k.y>34?-1:1;if(e.ax.x>=100.5||Math.abs(e.ay.x-e.k.y)>3.4&&e.ax.x>=98.5){e.auto=false;shootAt(GOAL_X-e.b.x,34+side*1.9-e.b.y,22);e.auto=true;}
    else e.t={x:101.5,y:e.k.y+side*6.5};}}
  // Akers: a 2-D spring toward the target, speed-capped.
  let settled=true;
  if(reduced.current){e.ax.x=e.t.x;e.ay.x=e.t.y;e.ax.v=e.ay.v=0;}
  else{const sx=stepSpring(e.ax,e.t.x,dt,60,13,.01),sy=stepSpring(e.ay,e.t.y,dt,60,13,.01);settled=sx&&sy;
   const sp=Math.hypot(e.ax.v,e.ay.v);if(sp>MAX_RUN){e.ax.v*=MAX_RUN/sp;e.ay.v*=MAX_RUN/sp;}}
  const a={x:e.ax.x,y:e.ay.x};
  if(e.phase==='chase'){const to={x:P.passTo[0],y:P.passTo[1]},d=dist(e.b,to);
   if(d>.05){e.bv={x:(to.x-e.b.x)/d*P.passSpeed,y:(to.y-e.b.y)/d*P.passSpeed};e.b.x+=e.bv.x*dt;e.b.y+=e.bv.y*dt;}
   moveTo(e.k,e.b,KEEPER_COME*dt,{x0:96,x1:104.5});
   if(dist(a,e.b)<WIN_R){setPhase('have');try{museumSfx.stamp();}catch{}}
   else if(dist(e.k,e.b)<KEEP_R){e.bv={x:0,y:0};end('miss','keeper');}}
  else if(e.phase==='have'){const L=Math.hypot(GOAL_X-a.x,34-a.y)||1;e.b={x:a.x+(GOAL_X-a.x)/L*1.1,y:a.y+(34-a.y)/L*1.1};
   moveTo(e.k,e.b,KEEPER_PRESS*dt,{x0:93,x1:104.5});if(dist(e.k,e.b)<KEEP_R-.1){end('miss','tackle');}}
  else if(e.phase==='shot'||e.phase==='goal'){e.b.x+=e.bv.x*dt;e.b.y+=e.bv.y*dt;const fr=Math.exp(-.55*dt);e.bv.x*=fr;e.bv.y*=fr;
   if(e.phase==='shot'){
    // The keeper dives toward where the ball will cross her line.
    const tt=e.bv.x>0?Math.max(0,(e.k.x-e.b.x)/e.bv.x):0,cy=e.b.y+e.bv.y*tt;moveTo(e.k,{x:e.k.x,y:cy},KEEPER_DIVE*dt,{x0:93,x1:104.5});
    if(dist(e.k,e.b)<SAVE_R){e.bv={x:-e.bv.x*.25,y:e.bv.y*.25};end('miss','saved');}
    else if(e.b.x>=GOAL_X){if(e.b.y>POST_A&&e.b.y<POST_B)end('goal',null);else{e.bv={x:0,y:0};end('miss','wide');}}
    else if(Math.hypot(e.bv.x,e.bv.y)<2.5){e.bv={x:0,y:0};end('miss','soft');}}
   else if(e.b.x>=GOAL_X+2){e.b.x=GOAL_X+2;e.bv={x:0,y:0};}}
  else if(e.phase==='miss'&&Math.hypot(e.bv.x,e.bv.y)>.3){e.b.x+=e.bv.x*dt;e.b.y+=e.bv.y*dt;e.bv.x*=Math.exp(-3*dt);e.bv.y*=Math.exp(-3*dt);}
  paint();
  const moving=e.phase==='chase'||e.phase==='have'||e.phase==='shot'||e.drag||!settled||Math.hypot(e.bv.x,e.bv.y)>.3;
  if(moving)e.raf=requestAnimationFrame(frame);else e.last=0;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[paint,end,setPhase,shootAt]);
 const kick=useCallback(()=>{const e=E.current;if(!e.raf&&!document.hidden)e.raf=requestAnimationFrame(frame);},[frame]);

 const reset=useCallback(()=>{const e=E.current;cancelAnimationFrame(e.raf);e.raf=0;e.last=0;e.auto=false;e.drag=false;e.chase=false;
  e.ax={x:P.akers[0],v:0};e.ay={x:P.akers[1],v:0};e.t={x:P.akers[0],y:P.akers[1]};e.k={x:P.keeper[0],y:P.keeper[1]};e.b={x:P.defender[0]+1.2,y:P.defender[1]-.6};e.bv={x:0,y:0};
  setPhase('ready');paint();},[paint,setPhase]);
 const start=useCallback(()=>{const e=E.current;if(e.phase!=='ready')return;setPhase('chase');try{museumSfx.tick();}catch{}kick();},[kick,setPhase]);
 /** "Sprint!" (button, or Space while the pass is rolling): Akers runs to meet the ball. */
 const sprint=useCallback(()=>{const e=E.current;if(e.phase!=='chase')return;e.chase=true;kick();},[kick]);
 const showMe=useCallback(()=>{reset();const e=E.current;
  if(reduced.current){// The finished moment, still: Akers round the keeper, the ball in the net.
   e.ax.x=e.t.x=101.8;e.ay.x=e.t.y=28.5;e.k={x:101,y:35.5};e.b={x:GOAL_X+1.6,y:32.6};e.phase='goal';setPhase('goal');setTries(n=>n+1);paint();return;}
  e.auto=true;setPhase('chase');kick();},[reset,kick,paint,reduced,setPhase]);

 // Pointer: press anywhere on the pitch and Akers runs to your finger; a quick flick while she has the ball shoots.
 const toPitch=(ev:{clientX:number;clientY:number}):V|null=>{const s=svg.current,m=s?.getScreenCTM();if(!s||!m)return null;const p=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(m.inverse());return {x:p.x,y:p.y};};
 const aimAt=(p:V)=>{const e=E.current;e.t={x:rubber(p.x,BOUNDS.x0,BOUNDS.x1,3),y:rubber(p.y,BOUNDS.y0,BOUNDS.y1,3)};};
 const onDown=(ev:RPointerEvent<SVGSVGElement>)=>{if(!ev.isPrimary)return;const e=E.current;if(e.phase==='goal'||e.phase==='miss'||e.phase==='shot'||e.auto)return;const p=toPitch(ev);if(!p)return;
  ev.currentTarget.setPointerCapture?.(ev.pointerId);e.drag=true;e.samples=[{t:performance.now(),...p}];aimAt(p);if(e.phase==='ready')start();kick();};
 const onMove=(ev:RPointerEvent<SVGSVGElement>)=>{const e=E.current;if(!e.drag)return;const p=toPitch(ev);if(!p)return;aimAt(p);
  const now=performance.now();e.samples.push({t:now,...p});while(e.samples.length>2&&now-e.samples[0].t>90)e.samples.shift();};
 const onUp=()=>{const e=E.current;if(!e.drag)return;e.drag=false;const s=e.samples,n=s.length;
  if(n>=2&&e.phase==='have'){const a=s[0],b=s[n-1],dt=Math.max(.016,(b.t-a.t)/1000),vx=(b.x-a.x)/dt,vy=(b.y-a.y)/dt,sp=Math.hypot(vx,vy);
   if(sp>9&&vx>0){
    // A little aim help for young hands: a flick within ~20° of the goal mouth is bent toward the nearest spot inside the posts.
    const gy=e.b.y+vy/vx*(GOAL_X-e.b.x),ty=Math.max(POST_A+.9,Math.min(POST_B-.9,gy)),want=Math.atan2(ty-e.b.y,GOAL_X-e.b.x),got=Math.atan2(vy,vx),diff=want-got;
    const a=Math.abs(diff)<.35?got+diff*.7:got;shootAt(Math.cos(a),Math.sin(a),Math.max(15,Math.min(32,sp*1.4)));}}
  kick();};
 const onKey=(ev:RKeyboardEvent<SVGSVGElement>)=>{const e=E.current,step=4;let dx=0,dy=0;
  if(ev.key==='ArrowRight')dx=step;else if(ev.key==='ArrowLeft')dx=-step;else if(ev.key==='ArrowUp')dy=-step;else if(ev.key==='ArrowDown')dy=step;
  else if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();if(e.phase==='ready')start();else if(e.phase==='chase'){e.chase=true;kick();}else if(e.phase==='have')shoot();else if(e.phase==='goal'||e.phase==='miss')reset();return;}
  else return;
  ev.preventDefault();if(e.phase==='goal'||e.phase==='miss'||e.phase==='shot'||e.auto)return;
  e.chase=false;aimAt({x:e.t.x+dx,y:e.t.y+dy});if(e.phase==='ready')start();kick();};

 useEffect(()=>{const vis=()=>{const e=E.current;if(document.hidden){cancelAnimationFrame(e.raf);e.raf=0;e.last=0;}else if(e.phase==='chase'||e.phase==='have'||e.phase==='shot')kick();};
  document.addEventListener('visibilitychange',vis);const e=E.current;
  return()=>{document.removeEventListener('visibilitychange',vis);cancelAnimationFrame(e.raf);e.raf=0;};},[kick]);
 useEffect(()=>{paint();},[paint]);

 const msg=why?MSG[why]:MSG[phase];
 return {phase,why,msg,tries,scored,start,shoot,sprint,showMe,reset,paint,svg,gA,gK,gB,ring,pass,on:{onPointerDown:onDown,onPointerMove:onMove,onPointerUp:onUp,onPointerCancel:onUp,onKeyDown:onKey}};
}
/** Move point p toward q by at most `step`, staying inside an x range. */
function moveTo(p:V,q:V,step:number,r:{x0:number;x1:number}){const d=dist(p,q);if(d>1e-3){const k=Math.min(1,step/d);p.x+=(q.x-p.x)*k;p.y+=(q.y-p.y)*k;}p.x=Math.max(r.x0,Math.min(r.x1,p.x));}

const USA=WINNER_COLOR.USA,NOR=WINNER_COLOR.Norway;
export function AkersPitch({g}:{g:Akers}){
 const ready=g.phase==='ready',{paint}=g;
 // The figures are positioned by the game loop through refs; place them as soon as this pitch mounts.
 useLayoutEffect(()=>{paint();},[paint]);
 return <div className={styles.gameWrap} data-phase={g.phase}>
  <svg ref={g.svg} className={styles.game} viewBox="54 -5 58 78" role="application" tabIndex={0} data-museum-own-cue
   aria-label="Your turn: Akers’s winner. Arrow keys move Akers. Space starts the move, Space again sprints to the ball, and Space shoots." aria-describedby="wwc-akers-msg" {...g.on}>
   <PitchSheet x0={48}/>
   <path ref={g.pass} className={styles.passLine} d={`M${P.defender[0]+1.2} ${P.defender[1]-.6}L${P.passTo[0]} ${P.passTo[1]}`} data-on={ready||g.phase==='chase'||undefined}/>
   <circle ref={g.ring} className={styles.target} r={2.2} cx={P.akers[0]} cy={P.akers[1]}/>
   {/* Norway's defender who plays the back pass (stays put once she has passed). */}
   <g transform={`translate(${P.defender[0]} ${P.defender[1]})`}><BeanCut fill={NOR}/><text className={styles.whoTag} y={2.6} textAnchor="middle">Norway</text></g>
   <g ref={g.gK}><BeanCut fill="#e3a72f" edge="#fff7e6"/><text className={styles.whoTag} y={2.6} textAnchor="middle">Keeper</text></g>
   <g ref={g.gA} className={styles.akers}>
    {ready&&<circle className={styles.tryRing} r={3.6} cy={-2}/>}
    <BeanCut fill={USA} label="10"/><text className={styles.whoTag} y={2.6} textAnchor="middle">Akers</text>
   </g>
   <g ref={g.gB}><circle r={.95} fill="#fff7e6" stroke="#3a1d0e" strokeWidth={.18}/><path d={ballCut(.95).join('')} fill="#3a1d0e"/></g>
   {ready&&<g transform={`translate(${P.akers[0]-1} ${P.akers[1]+6.4})`}><g className={styles.tryTag}><rect x={-9} y={-2.4} width={18} height={4.2} rx={.6}/><text y={.7} textAnchor="middle">DRAG ME TO THE BALL</text></g></g>}
   {g.phase==='goal'&&<text className={styles.goalWord} x={96} y={14} textAnchor="middle">GOAL!</text>}
  </svg>
 </div>;
}
export function AkersPanel({g,onWatch}:{g:Akers;onWatch:()=>void}){
 const done=g.phase==='goal'||g.phase==='miss';
 return <div>
  <p className={styles.eyebrow}>Your turn · 78th minute · 1–1</p>
  <p id="wwc-akers-msg" className={styles.gameMsg} data-phase={g.phase} role="status" aria-live="polite">{g.msg}</p>
  <div className={styles.row}>
   {g.phase==='ready'&&<button type="button" className={`${styles.btn} ${styles.gold}`} data-museum-own-cue onClick={g.start}>Go!</button>}
   {g.phase==='chase'&&<button type="button" className={`${styles.btn} ${styles.gold}`} data-museum-own-cue onClick={g.sprint}>Sprint!</button>}
   {(g.phase==='have'||g.phase==='shot')&&<button type="button" className={`${styles.btn} ${styles.gold}`} data-museum-own-cue disabled={g.phase==='shot'} onClick={g.shoot}>Shoot</button>}
   {done&&<button type="button" className={`${styles.btn} ${styles.gold}`} data-museum-own-cue onClick={g.reset}>Try again</button>}
   <button type="button" className={styles.btn} data-museum-own-cue onClick={g.showMe}>Show me</button>
   <button type="button" className={styles.btn} onClick={onWatch}>Watch it</button>
  </div>
  {g.scored>0&&<p className={styles.take} data-on><b>Take it to your game</b>Keep pressing: a defender’s mistake can become your goal. Akers chased a back pass nobody expected her to reach.</p>}
  <p className={styles.illus}>The minute and how the goal happened are real. The spots and the game are drawn to teach it.</p>
 </div>;
}
