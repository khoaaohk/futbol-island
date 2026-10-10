'use client';
import {useCallback,useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import {createSim,step,FIELDS,type Input,type Mode,type Sim} from './sim';
import {drawBurst,drawDots,drawField,drawPlayers,drawTarget,drawYouTag,fitView,SLAB,RED,CREAM,INK,type View} from './draw';
import css from './futsal.module.css';

/**
 * Beat 2 · "O jogo" (the game): "Count the touches" (Oct 5 2026), re-cut as a woodcut print on Oct 9 2026. A top-down physics
 * match you play twice for 30 seconds: first on a futsal court (40 × 20 m, 5 v 5), then on a grass pitch (105 × 68 m, 11 v 11)
 * drawn at the same scale with the court printed in red inside it. A big live "touches per minute" counter and a red cut star
 * for every touch show why small-sided games build skill. The match is a game model, labelled as one.
 *
 * Oct 9 fixes: the View Transitions cross-fade is gone (cards enter with their own spring keyframes, so nothing global can
 * fight the museum); the field fits the beat's stage under the cordel header instead of the whole screen; the loop also stops
 * when the beat is left (unmount).
 *
 * Heat: one Canvas 2D, DPR ≤ 1.5 on coarse pointers; the rAF loop runs only during a 30 s round or the 1.8 s zoom, stops when
 * the round ends, when the case notes open (`paused`), when the tab is hidden and on unmount. Between rounds the canvas is a
 * still frame. The paper grain is painted once and cached. The result count-up is a finite 0.9 s rAF.
 */
const ROUND=30,ZOOM_MS=1800,STEP=1/60,WHISTLE_MS=1500;
type Phase='intro'|'court'|'fulltime'|'zoom'|'between'|'pitch'|'result';
export type Round={touches:number;rate:number;dots:{x:number;y:number}[]};
type Pop={x:number;y:number;t:number;label:string};
type Splash={k:number;big:string;small:string;tone:'go'|'end'};
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{}};
const isReduced=()=>typeof window!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/** A damped spring sampled into a CSS linear() easing (overshoots, then settles): the counter's bounce. */
const SPRING=(()=>{const k=320,c=13,w0=Math.sqrt(k),z=c/(2*w0),wd=w0*Math.sqrt(1-z*z),pts:string[]=[];
 for(let i=0;i<=32;i++){const t=i/32*.75,x=1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t));pts.push((i===32?1:x).toFixed(3));}return `linear(${pts.join(',')})`;})();
let springOk:boolean|null=null;
function bounce(el:Element|null,from=1.22){if(!el||isReduced())return;if(springOk==null)springOk=typeof CSS!=='undefined'&&CSS.supports('animation-timing-function','linear(0, 1)');
 try{el.animate([{transform:`scale(${from})`},{transform:'scale(1)'}],{duration:springOk?620:260,easing:springOk?SPRING:'cubic-bezier(.2,.8,.3,1)'});}catch{}}
const gaugeMax=(court?:number)=>Math.max(40,Math.ceil(((court??0)*1.5)/10)*10);
const clock=(t:number)=>`0:${String(Math.max(0,Math.ceil(ROUND-t))).padStart(2,'0')}`;

export function Match({paused,forYourGame,onNext,onResult}:{paused:boolean;forYourGame:string;onNext:()=>void;onResult?:(r:{court:Round;pitch:Round})=>void}){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [phase,setPhase]=useState<Phase>('intro'),phaseRef=useRef<Phase>('intro');phaseRef.current=phase;
 const pausedRef=useRef(paused);pausedRef.current=paused;
 const [holding,setHolding]=useState(false),holdRef=useRef(false);
 const [moved,setMoved]=useState(false),movedRef=useRef(false);
 const [results,setResults]=useState<{court?:Round;pitch?:Round}>({}),courtRate=useRef<number|undefined>(undefined);
 const [splash,setSplash]=useState<Splash|null>(null),[announce,setAnnounce]=useState('');
 const sim=useRef<Sim>(createSim('court',Date.now()%9973));
 const input=useRef<Input&{last:number;keys:Set<string>;down:number}>({to:null,dir:null,idle:99,pass:false,passTo:-1,last:0,keys:new Set(),down:-1});
 const raf=useRef(0),lastT=useRef<number|null>(null),acc=useRef(0),zoomStart=useRef(0),zoomE=useRef(1),pops=useRef<Pop[]>([]),timers=useRef<number[]>([]),lastLeft=useRef(ROUND);
 const view=useRef<View|null>(null),size=useRef({w:0,h:0,dpr:1}),bg=useRef<HTMLCanvasElement|null>(null);
 const hud={rate:useRef<HTMLSpanElement>(null),count:useRef<HTMLSpanElement>(null),time:useRef<HTMLSpanElement>(null),bar:useRef<SVGCircleElement>(null),gauge:useRef<HTMLSpanElement>(null),clock:useRef<HTMLDivElement>(null)};
 const reduced=useRef(false);
 const playing=(p:Phase)=>p==='court'||p==='pitch';
 const mode=():Mode=>sim.current.field.mode;
 const later=(f:()=>void,ms:number)=>{timers.current.push(window.setTimeout(f,ms));};

 /** The box the field fits in: clear of the bottom counter. */
 const box=useCallback(()=>{const {w,h}=size.current,portrait=h>w*1.05,short=h<380;const top=8,bottom=portrait?196:short?78:126,side=portrait?8:20;
  return {x:side,y:top,w:Math.max(10,w-side*2),h:Math.max(10,h-top-bottom)};},[]);
 const paintBg=useCallback((m:Mode,extent?:{l:number;w:number},courtArt=0)=>{const {w,h,dpr}=size.current;if(!w)return;
  const v=fitView(m,box(),extent);view.current=v;const c=bg.current??(bg.current=document.createElement('canvas'));c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
  const g=c.getContext('2d')!;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(new DOMMatrix().scale(dpr).multiply(v.m));
  drawField(g,m,v,{ghostCourt:m==='pitch',ghostLabel:m==='pitch'&&courtArt<.5,courtArt});},[box]);
 const draw=useCallback(()=>{const c=canvas.current,v=view.current;if(!c||!v)return;const g=c.getContext('2d')!,{dpr}=size.current,s=sim.current,p=phaseRef.current,live=playing(p);
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);if(bg.current)g.drawImage(bg.current,0,0);
  g.setTransform(new DOMMatrix().scale(dpr).multiply(v.m));
  if(p==='zoom')g.globalAlpha=zoomE.current;
  drawDots(g,s.dots,v);
  const now=s.t;pops.current=pops.current.filter(q=>now-q.t<.8);
  if(!reduced.current)for(const q of pops.current)if(now-q.t<.5)drawBurst(g,q.x,q.y,(now-q.t)/.5,v);
  const i=input.current,you=s.players[s.youIdx],age=performance.now()-i.last;
  if(i.to&&live&&age<1500&&Math.hypot(i.to.x-you.x,i.to.y-you.y)>.8)drawTarget(g,you,i.to,v,age<1100?1:1-(age-1100)/400);
  drawPlayers(g,s,v,{t:live&&!reduced.current?s.t:undefined,passHint:live});
  g.globalAlpha=1;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.font=`17px ${SLAB}`;g.textAlign='center';g.lineJoin='round';
  for(const q of pops.current){const a=(now-q.t)/.8,pt=v.m.transformPoint(new DOMPoint(q.x,q.y));g.globalAlpha=a<.15?a/.15:1-(a-.15)/.85;g.fillStyle=RED;g.strokeStyle=CREAM;g.lineWidth=5;
   const y=pt.y-22-(reduced.current?0:(1-Math.pow(1-a,2))*26);g.strokeText(q.label,pt.x,y);g.fillText(q.label,pt.x,y);}
  g.globalAlpha=p==='zoom'?zoomE.current:1;drawYouTag(g,s,v);g.globalAlpha=1;
 },[]);
 const updateHud=useCallback(()=>{const s=sim.current,t=Math.min(ROUND,s.t),rate=Math.round(s.touches/(Math.max(t,5)/60));
  if(hud.count.current)hud.count.current.textContent=`${s.touches} ${s.touches===1?'touch':'touches'}`;
  if(hud.rate.current)hud.rate.current.textContent=String(rate);
  if(hud.time.current)hud.time.current.textContent=clock(t);
  if(hud.bar.current)hud.bar.current.style.strokeDashoffset=String(100*t/ROUND);
  if(hud.gauge.current)hud.gauge.current.style.transform=`scaleX(${Math.min(1,rate/gaugeMax(mode()==='pitch'?courtRate.current:undefined))})`;
  const left=Math.ceil(ROUND-t),el=hud.clock.current;
  if(left!==lastLeft.current){lastLeft.current=left;if(el){const urgent=playing(phaseRef.current)&&left<=5&&left>0;el.toggleAttribute('data-urgent',urgent);if(urgent)bounce(hud.time.current,1.3);}}
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 const stopLoop=()=>{if(raf.current)cancelAnimationFrame(raf.current);raf.current=0;lastT.current=null;};
 const endRound=useCallback(()=>{stopLoop();const s=sim.current,r:Round={touches:s.touches,rate:Math.round(s.touches/(ROUND/60)),dots:s.dots.slice()},court=phaseRef.current==='court';
  sfx(museumSfx.whistle);holdRef.current=false;setHolding(false);hud.clock.current?.removeAttribute('data-urgent');
  if(court){setResults(x=>({...x,court:r}));courtRate.current=r.rate;}else setResults(x=>{const n={...x,pitch:r};if(n.court)onResult?.({court:n.court,pitch:r});return n;});
  setSplash({k:Date.now(),big:court?'Time!':'Full time!',small:`${r.rate} touches a minute`,tone:'end'});setAnnounce(`${court?'Time':'Full time'}: ${r.rate} touches per minute.`);
  phaseRef.current='fulltime';setPhase('fulltime');
  later(()=>{setSplash(null);
   if(court){sim.current=createSim('pitch',(Date.now()%9973)+7);pops.current=[];
    if(reduced.current){phaseRef.current='between';setPhase('between');}else{zoomStart.current=performance.now();zoomE.current=0;phaseRef.current='zoom';setPhase('zoom');}}
   else{sfx(museumSfx.reveal);phaseRef.current='result';setPhase('result');}},reduced.current?900:WHISTLE_MS);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const frame=useCallback((now:number)=>{raf.current=0;if(pausedRef.current||document.hidden)return;const p=phaseRef.current;
  if(p==='zoom'){const k=Math.min(1,(now-zoomStart.current)/ZOOM_MS),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,c=FIELDS.court,pf=FIELDS.pitch;zoomE.current=Math.max(0,(k-.55)/.45);
   paintBg('pitch',{l:c.L+(pf.L-c.L)*e,w:c.W+(pf.W-c.W)*e},1-Math.min(1,k/.7));draw();
   if(k>=1){zoomE.current=1;phaseRef.current='between';setPhase('between');return;}raf.current=requestAnimationFrame(frame);return;}
  if(!playing(p))return;
  const dt=lastT.current==null?STEP:Math.min(.05,(now-lastT.current)/1000);lastT.current=now;acc.current+=dt;
  const i=input.current,k=i.keys;i.idle=(performance.now()-i.last)/1000;
  const kx=(k.has('ArrowRight')||k.has('KeyD')?1:0)-(k.has('ArrowLeft')||k.has('KeyA')?1:0),ky=(k.has('ArrowDown')||k.has('KeyS')?1:0)-(k.has('ArrowUp')||k.has('KeyW')?1:0);
  if(kx||ky){const v=view.current;i.dir=v?.rot?{x:-ky,y:kx}:{x:kx,y:ky};i.idle=0;}else i.dir=null;
  const s=sim.current;let touched=false,milestone=false;
  while(acc.current>=STEP){acc.current-=STEP;const ev=step(s,STEP,i);i.pass=false;i.passTo=-1;
   for(const e of ev){if(e.type==='touch'){touched=true;const combo=s.touches%5===0;if(combo)milestone=true;
    pops.current.push({x:e.x,y:e.y,t:s.t,label:combo?`${s.touches} touches!`:e.kind==='dribble'?'+1 sole':e.kind==='pass'?'+1 pass':e.kind==='win'?'+1 won it':'+1'});sfx(combo?museumSfx.flap:museumSfx.tick);}
    else if(e.type==='goal')sfx(museumSfx.net);}
   if(s.t>=ROUND)break;}
  const h=s.ball.owner===s.youIdx;if(h!==holdRef.current){holdRef.current=h;setHolding(h);}
  draw();updateHud();if(touched){bounce(hud.rate.current,milestone?1.45:1.22);bounce(hud.count.current,1.4);}
  if(milestone){hud.gauge.current?.parentElement?.animate?.([{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:reduced.current?1:450});try{navigator.vibrate?.(10);}catch{}}
  if(s.t>=ROUND){endRound();return;}
  raf.current=requestAnimationFrame(frame);
 },[draw,endRound,paintBg,updateHud]);
 const ensureLoop=useCallback(()=>{const p=phaseRef.current;if(!raf.current&&(playing(p)||p==='zoom')&&!pausedRef.current&&!document.hidden){lastT.current=null;raf.current=requestAnimationFrame(frame);}},[frame]);

 // Size the canvas to the stage (DPR capped: 1.5 on touch screens) and repaint the still frame once the slab font is in.
 useEffect(()=>{reduced.current=isReduced();const el=root.current,c=canvas.current;if(!el||!c)return;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const fit=()=>{const r=el.getBoundingClientRect(),dpr=Math.min(coarse?1.5:2,window.devicePixelRatio||1);size.current={w:r.width,h:r.height,dpr};
   c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);if(phaseRef.current!=='zoom')paintBg(mode());draw();};
  fit();const ro=new ResizeObserver(fit);ro.observe(el);document.fonts?.ready.then(()=>{if(root.current&&phaseRef.current!=='zoom'){paintBg(mode());draw();}}).catch(()=>{});
  const vis=()=>{if(document.hidden)stopLoop();else ensureLoop();};document.addEventListener('visibilitychange',vis);
  return()=>{ro.disconnect();document.removeEventListener('visibilitychange',vis);stopLoop();bg.current=null;timers.current.forEach(clearTimeout);timers.current=[];};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(phase!=='zoom'){paintBg(mode());draw();updateHud();}ensureLoop();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[phase]);
 useEffect(()=>{if(paused)stopLoop();else ensureLoop();},[paused,ensureLoop]);

 const start=(m:Mode)=>{unlockMuseumAudio();sfx(museumSfx.whistle);
  sim.current=createSim(m,(Date.now()%9973)+(m==='pitch'?7:0));pops.current=[];lastLeft.current=ROUND;movedRef.current=false;setMoved(false);
  input.current.to=null;input.current.last=performance.now();setSplash({k:Date.now(),big:'Kick off!',small:m==='court'?'5 v 5 · 40 × 20 m':'11 v 11 · 105 × 68 m',tone:'go'});setAnnounce('');
  phaseRef.current=m;setPhase(m);
  later(()=>setSplash(s=>s?.tone==='go'?null:s),reduced.current?700:1100);};
 const again=()=>{timers.current.forEach(clearTimeout);timers.current=[];setResults({});courtRate.current=undefined;setSplash(null);sim.current=createSim('court',Date.now()%9973);phaseRef.current='intro';setPhase('intro');};
 const steer=()=>{if(!movedRef.current){movedRef.current=true;setMoved(true);}};
 const pass=()=>{input.current.pass=true;input.current.passTo=-1;input.current.last=performance.now();};

 const toWorld=(e:ReactPointerEvent)=>{const v=view.current,r=canvas.current!.getBoundingClientRect();if(!v)return null;const p=v.m.inverse().transformPoint(new DOMPoint(e.clientX-r.left,e.clientY-r.top));return {x:p.x,y:p.y};};
 const onDown=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(!playing(phaseRef.current))return;const w=toWorld(e);if(!w)return;e.currentTarget.setPointerCapture(e.pointerId);steer();
  const i=input.current,s=sim.current;i.down=e.pointerId;i.last=performance.now();
  if(s.ball.owner===s.youIdx){const tol=Math.max(2.2,28/(view.current?.s??10));let best=-1,bd=tol;s.players.forEach((p,j)=>{if(p.team!==0||p.you)return;const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<bd){bd=d;best=j;}});
   if(best>=0){i.pass=true;i.passTo=best;return;}}
  i.to=w;};
 const onMove=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const i=input.current;if(i.down!==e.pointerId)return;const w=toWorld(e);if(w){i.to=w;i.last=performance.now();}};
 const onUp=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(input.current.down===e.pointerId)input.current.down=-1;};

 // Keyboard: arrows/WASD run, Space passes (Escape is handled by the exhibit).
 useEffect(()=>{const k=input.current.keys;
  const down=(e:KeyboardEvent)=>{if(!playing(phaseRef.current)||pausedRef.current)return;
   if(e.code==='Space'){if(e.target instanceof HTMLButtonElement)return;e.preventDefault();pass();return;}
   if(/^(Arrow(Up|Down|Left|Right)|Key[WASD])$/.test(e.code)){e.preventDefault();k.add(e.code);input.current.last=performance.now();steer();}};
  const up=(e:KeyboardEvent)=>{k.delete(e.code);};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);k.clear();};
 },[]);

 const onCourt=mode()==='court',f=FIELDS[onCourt?'court':'pitch'],round=onCourt?1:2;
 const c=results.court,p=results.pitch,ratio=c&&p?(p.rate>0?c.rate/p.rate:null):null;
 const hint=playing(phase)?(holding?'Tap a ringed team-mate to pass':!moved?'Tap or drag to run to the ball':null):null;
 return <div ref={root} className={css.match} data-phase={phase}>
  <canvas ref={canvas} className={css.canvas} aria-label={`${f.label}, ${f.size}. You are the red player. Tap or drag to run; tap a black team-mate to pass. Arrow keys run, Space passes.`}
   role="img" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}/>
  <div className={css.hud} aria-live="off">
   <div className={css.roundInfo}><span className={css.kicker}>Round {round} of 2</span><b>{f.label}</b><span className={css.dim}>{f.size}</span></div>
   <div className={css.meter} role="group" aria-label="Touches per minute">
    <div className={css.rateRow}><span ref={hud.rate} className={css.rate}>0</span><span className={css.rateLabel}>touches<br/>per minute</span></div>
    <span className={css.gaugeRow}><span className={css.gauge}><span ref={hud.gauge} className={css.gaugeFill}/>
     {round===2&&c&&<span className={css.mark} style={{left:`${Math.min(100,c.rate/gaugeMax(c.rate)*100)}%`}}/>}</span>
     {round===2&&c&&<span className={css.markLabel}>Court {c.rate}</span>}</span>
   </div>
   <div ref={hud.clock} className={css.clock}>
    <span className={css.ring}><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" className={css.ringTrack}/><circle ref={hud.bar} cx="24" cy="24" r="21" pathLength={100} className={css.ringFill}/></svg>
     <span ref={hud.time} className={css.time}>{clock(0)}</span></span>
    <span ref={hud.count} className={css.count}>0 touches</span></div>
  </div>
  {holding&&playing(phase)&&<button type="button" className={`${css.btn} ${css.pass}`} onClick={pass} aria-label="Pass the ball">Pass</button>}
  {hint&&<p key={hint} className={css.hint} aria-hidden="true">{hint}</p>}
  {splash&&<div key={splash.k} className={`${css.splash} ${splash.tone==='end'?css.splashEnd:''}`} aria-hidden="true"><b>{splash.big}</b><span>{splash.small}</span></div>}
  <p className={css.sr} aria-live="polite">{announce}</p>

  {phase==='intro'&&<div className={css.overlay}><div className={`${css.card} ${css.split}`}>
   <div className={css.colA}>
    <span className={css.kicker}>Round 1 of 2 · 30 seconds</span>
    <h2>Count the touches</h2>
    <p>Play 30 seconds on a small court, then 30 on a big grass pitch. Which one gives you more touches of the ball?</p>
   </div>
   <div className={css.colB}>
    <ul className={css.legend}>
     <li><Fig kit="you"/><span><b className={css.redInk}>You.</b> Tap or drag to run.</span></li>
     <li><Fig kit="home"/><span><b>Team-mates.</b> Tap one to pass.</span></li>
     <li><Fig kit="away"/><span><b>Opponents.</b> They press you.</span></li>
    </ul>
    <button type="button" className={css.btn} onClick={()=>start('court')}>Kick off on the court</button>
   </div>
  </div></div>}

  {phase==='between'&&c&&<div className={`${css.overlay} ${css.low}`}><div className={`${css.card} ${css.split}`}>
   <div className={css.colA}>
    <span className={css.kicker}>Round 2 of 2 · 30 seconds</span>
    <h2>Now the grass pitch</h2>
    <p className={css.score}><b className={css.scoreNum}>{c.rate}</b><span>touches per minute on the court. That is your mark to beat.</span></p>
   </div>
   <div className={css.colB}>
    <p>Same players, same speed, same rules. But the pitch is 105 × 68 m with 11 a side. The <b className={css.redInk}>red box</b> is the futsal court at the same scale.</p>
    <button type="button" className={css.btn} onClick={()=>start('pitch')}>Kick off on grass</button>
   </div>
  </div></div>}

  {phase==='result'&&c&&p&&<div className={css.overlay}><div className={`${css.card} ${css.wide} ${css.split}`}>
   <div className={css.colA}>
    <span className={css.kicker}>Full time · your result</span>
    {ratio&&ratio>=1.2?<h2 className={css.verdict}><span className={css.ratio}>{ratio>=10?'10+':<CountUp to={ratio} dec={1}/>}×</span><span>more touches on the court</span></h2>
     :<h2>{p.rate===0?<>The ball never found you on grass</>:<>You worked hard on grass!</>}</h2>}
    <div className={css.compare}>
     <ResultRow label="Futsal court" sub="40 × 20 m · 5 v 5" round={c} max={Math.max(c.rate,p.rate,1)} mode="court" delay={0}/>
     <ResultRow label="Grass pitch" sub="105 × 68 m · 11 v 11" round={p} max={Math.max(c.rate,p.rate,1)} mode="pitch" delay={250}/>
    </div>
   </div>
   <div className={css.colB}>
    <p>Small space and fewer players mean the ball comes back to you again and again. {forYourGame}</p>
    <div className={`${css.row} ${css.endRow}`}><button type="button" className={css.btn} onClick={onNext}>Next: spin the team</button><button type="button" className={css.ghost} onClick={again}>Play again</button></div>
    <p className={css.small}>The match here is a game model, not a measurement of real matches.</p>
   </div>
  </div></div>}
 </div>;
}

function CountUp({to,dec=0,delay=0}:{to:number;dec?:number;delay?:number}){
 const [v,setV]=useState(()=>isReduced()?to:0);
 useEffect(()=>{if(isReduced()){setV(to);return;}let id=0,t0=0;
  const tick=(now:number)=>{if(!t0)t0=now+delay;const k=Math.max(0,Math.min(1,(now-t0)/900));setV(to*(1-Math.pow(1-k,3)));if(k<1)id=requestAnimationFrame(tick);};
  id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[to,delay]);
 return <>{v.toFixed(dec)}</>;
}
/** One result line: the rate bar plus a little touch map of that field (drawn once). */
function ResultRow({label,sub,round,max,mode,delay}:{label:string;sub:string;round:Round;max:number;mode:Mode;delay:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current;if(!c)return;const w=c.clientWidth||160,h=c.clientHeight||80,dpr=Math.min(2,window.devicePixelRatio||1);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
  const g=c.getContext('2d')!,s=Math.min((w-4)/(FIELDS[mode].L+6),(h-4)/(FIELDS[mode].W+6)),m=new DOMMatrix().translate(w/2,h/2).scale(s).translate(-FIELDS[mode].L/2,-FIELDS[mode].W/2),vv:View={m,s,rot:false};
  g.setTransform(new DOMMatrix().scale(dpr).multiply(m));drawField(g,mode,vv,{ghostCourt:mode==='pitch'});drawDots(g,round.dots,vv);
 },[mode,round]);
 return <div className={css.result}>
  <canvas ref={ref} className={css.thumb} role="img" aria-label={`${label}: ${round.touches} touches, one red star each`}/>
  <div className={css.resultText}><b>{label}</b><span className={css.dim}>{sub}</span>
   <span className={css.track2}><span className={css.fill} style={{width:`${Math.round(round.rate/max*100)}%`,animationDelay:`${delay}ms`}}/></span>
   <span><b className={css.bigNum}><CountUp to={round.rate} delay={delay}/></b> touches per minute <span className={css.dim}>({round.touches} in 30 s)</span></span></div>
 </div>;
}
/** A tiny top-down player, matching the ones on the court. */
function Fig({kit}:{kit:'you'|'home'|'away'}){const body={you:RED,home:INK,away:'#fffaf0'}[kit];
 return <svg className={css.fig} viewBox="-16 -16 32 32" aria-hidden="true">
  <ellipse cx="-4" cy="-7" rx="3.8" ry="2.4" fill={INK}/><ellipse cx="4" cy="7" rx="3.8" ry="2.4" fill={INK}/>
  <ellipse cx="0" cy="0" rx="7" ry="11" transform="rotate(90)" fill={body} stroke={INK} strokeWidth="2"/><circle cx="0" cy="0" r="4.8" fill={INK}/></svg>;}
