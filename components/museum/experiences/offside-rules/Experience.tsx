'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import Slider from '../modern/Slider';
import StepIcon from '../StepIcon';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,ScoreCover,paper as p} from '../anatomy/PaperRoom';
import {useBox,clamp,follow,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {CAMS,ERAS,LEVEL,OPEN_AT,START,TASKS,camIn,clampRail,detentOf,dialAngle,eraOf,judge,passAt,snapLevel,stepEra,type CamId,type Era,type Scene,type TaskId,type Verdict} from './model';
import {BEATS,CAM_TEXT,KID_RULE,MILESTONES,MODEL_NOTE,QUIZ,SOURCES} from './content';
import {DIAL,Machine,type MachineApi,type MachineView} from './Machine';
import s from './Experience.module.css';

/**
 * offside-rules · "The offside rule through time" (Oct 14 2026 redo; user: make it a real anatomy object you operate, with a
 * breakdown like the stadiums). THE OFFSIDE LINE MACHINE (Machine.tsx):
 *  1. Intro over the card; ONE centred start button in the dock (StartDock).
 *  2. Play: drag any player's carriage along its rail (or focus it and use the arrow keys); turn the ERA DIAL (drag it round, or
 *     focus it and use the arrow keys; the year buttons under the card do the same). The line gantry runs to that year's offside
 *     line; the cams that are not in that year's law slide out of the judge. Pull the PASS LEVER (drag it down, tap it, Space):
 *     the ball rolls to the striker, each cam in the judge clicks its lamp green (onside) or red, and the flag pops up for offside.
 *     "Open the judge" (slider): the sleeve lifts, the cams spread on their spindle and the camera leans in; labels say what
 *     each cam checks. Four tasks (model.ts) open the quick check.
 *  3. Quick check (StepCheck), then the Ending (onComplete once, only after the check).
 * Heat: one Paper loop (anatomy/paper-loop.ts) runs only while something eases (gantry, dial, cams, lever, ball, flag, the
 * judge opening) and stops at rest; parked off screen; disposed on unmount. Reduced motion: every motion lands at once.
 */
type Phase='intro'|'play'|'check';
const ACC='#e4322b';
const IN0=(era:Era)=>Object.fromEntries(CAMS.map(c=>[c,camIn(era,c)?1:0])) as Record<CamId,number>;
const NOLAMPS={ball:null,count:null,half:null,level:null} as Record<CamId,boolean|null>;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro'),[era,setEraS]=useState<Era>('1990');
 const [scene,setScene]=useState<Scene>(START),[result,setResult]=useState<Verdict|null>(null);
 const [done,setDone]=useState<TaskId[]>([]),[passes,setPasses]=useState(0),[news,setNews]=useState(''),[open,setOpenS]=useState(0);
 const [checked,setChecked]=useState(false),[round,setRound]=useState(0);
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),api=useRef<MachineApi>(null),readRef=useRef<HTMLSpanElement>(null),overRef=useRef<SVGSVGElement>(null);
 const labelRefs=useRef<Partial<Record<CamId,HTMLButtonElement|null>>>({});
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();closeRef.current();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);

 const live=judge(era,scene);
 // Everything the drawing moves lives in one ref; the loop eases it toward its targets and stops at rest.
 const view=useRef<MachineView>({scene:START,era:'1990',dial:dialAngle('1990'),lever:0,roll:null,line:live.line,flag:0,camIn:IN0('1990'),lamps:{...NOLAMPS},open:0,focus:null,wide:true});
 const tgt=useRef({dial:dialAngle('1990'),open:0,dialDrag:false});
 const pass=useRef<{t:number;snap:Scene;v:Verdict}|null>(null);
 view.current.scene=scene;view.current.era=era;

 const say=(t:string)=>{if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;};
 const placeLabels=()=>{const a=api.current,o=overRef.current,v=view.current;if(!a||!o)return;
  const show=v.open>OPEN_AT&&phase==='play';let html='';
  const list=CAMS.map(c=>({c,p:a.camAnchor(c)})).filter(x=>x.p).sort((m,n)=>m.p![1]-n.p![1]);
  const W=box.w,minX=Math.min(...list.map(x=>x.p![0])),colR=Math.max(130,minX-(W<600?18:40)),lw=Math.max(118,Math.min(260,colR-14));
  // Labels in a column left of the stack, each as near its cam's height as the ones above allow; then pushed up from the bottom.
  const hs=list.map(({c})=>{const el=labelRefs.current[c];if(el)el.style.width=lw+'px';return el?.offsetHeight||48;});
  const ys=list.map(x=>x.p![1]-hs[0]/2);let low=Math.max(36,0);for(let i=0;i<ys.length;i++){ys[i]=Math.max(ys[i],low);low=ys[i]+hs[i]+6;}
  const maxB=box.h-30;for(let i=ys.length-1;i>=0;i--){if(ys[i]+hs[i]>maxB)ys[i]=maxB-hs[i];if(i>0&&ys[i-1]+hs[i-1]+6>ys[i])ys[i-1]=ys[i]-hs[i-1]-6;}
  list.forEach(({c,p:pt},i)=>{const el=labelRefs.current[c];if(!el||!pt)return;
   if(!show){delete el.dataset.show;return;}
   const y=ys[i],my=y+Math.min(hs[i]/2,18);el.dataset.show='';el.style.transform=`translate(${(colR-lw).toFixed(0)}px,${y.toFixed(0)}px)`;
   html+=`<path d="M${pt[0].toFixed(1)} ${pt[1].toFixed(1)}L${(colR+10).toFixed(1)} ${my.toFixed(1)}L${(colR+1).toFixed(1)} ${my.toFixed(1)}"/><circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="3"/>`;});
  o.style.opacity=String(clamp((v.open-OPEN_AT)/.25,0,1));o.innerHTML=show?html:'';};
 const draw=()=>{api.current?.draw();};

 const loop=usePaperLoop(dt=>{const v=view.current,T=tgt.current;let moving=false;
  const ease=(cur:number,to:number,tau:number,eps=1e-3)=>{const n=follow(cur,to,dt,tau,eps);if(n!==to)moving=true;return n;};
  const lineT=judge(v.era,v.scene).line;
  v.line=ease(v.line,pass.current?pass.current.v.line:lineT,.16,.01);
  if(!T.dialDrag)v.dial=ease(v.dial,T.dial,.1,.05);
  for(const c of CAMS)v.camIn[c]=ease(v.camIn[c],camIn(v.era,c)?1:0,.14);
  v.open=ease(v.open,T.open,.22,.002);
  const P=pass.current;
  if(P){P.t+=dt;const n=eraOf(P.v.era).cams.length,q=passAt(P.t,n);v.lever=q.lever;v.roll=q.roll;
   v.lamps={...NOLAMPS};P.v.cams.forEach((r,i)=>{if(i<q.lit)v.lamps[r.cam]=r.clears;});
   if(q.lit>(P as {said?:number}).said!){(P as {said?:number}).said=q.lit;museumSfx.tick();}
   v.flag=P.v.offside?q.flag:0;
   if(q.done){const r=P.v,snap=P.snap;pass.current=null;landPass(r,snap);}else moving=true;}
  else if(v.lever>0&&!leverDrag.current){v.lever=Math.max(0,v.lever-dt*3.2);moving=moving||v.lever>0;}
  draw();placeLabels();
  if(T.open>.5&&v.open>.9)markOpen();
  return moving;},stageRef,reduced);
 const wake=loop.wake;
 useLayoutEffect(()=>{placeLabels();});

 // ── actions ──
 const doneRef=useRef(done);doneRef.current=done;
 const tick=(id:TaskId,msg:string)=>{if(doneRef.current.includes(id))return;doneRef.current=[...doneRef.current,id];setDone(doneRef.current);setNews(msg);museumSfx.stamp();};
 const markOpen=()=>{if(!doneRef.current.includes('open'))tick('open',TASKS.find(t=>t.id==='open')!.done);};
 const clearResult=()=>{if(pass.current)return;const v=view.current;v.lamps={...NOLAMPS};v.flag=0;v.roll=null;setResult(null);};
 const landPass=(r:Verdict,snap:Scene)=>{setResult(r);setPasses(n=>n+1);r.offside?museumSfx.whistle():museumSfx.look();
  const fresh=TASKS.filter(t=>t.test&&!doneRef.current.includes(t.id)&&t.test(snap));
  if(fresh.length){for(const t of fresh)tick(t.id,t.done);setNews(fresh[0].done);}else setNews('');
  say(`${eraOf(r.era).tab} · ${r.offside?'OFFSIDE':'ONSIDE'}`);};
 const firePass=()=>{if(phase!=='play'||pass.current)return;unlockMuseumAudio();const snap=view.current.scene,v=judge(view.current.era,snap);
  view.current.lamps={...NOLAMPS};view.current.flag=0;view.current.roll=0;setResult(null);
  pass.current={t:0,snap,v};(pass.current as {said?:number}).said=0;museumSfx.kick();say('PASS!');wake();};
 const setEra=(e:Era,fromDial=false)=>{if(e===view.current.era&&!fromDial)return;
  if(e!==view.current.era){museumSfx.flap();view.current.era=e;setEraS(e);clearResult();}
  if(!fromDial)tgt.current.dial=dialAngle(e);wake();};
 const setOpen=(x:number)=>{tgt.current.open=x;setOpenS(x);if(reduced){view.current.open=x;}wake();};
 const moveRider=(id:string,bx:number)=>{if(pass.current)return;clearResult();setNews('');
  setScene(sc=>{const x=clampRail(bx);if(id==='att'){const sn=snapLevel(x,sc);
   // a key step that would snap back to where it is steps clear of the level line instead
   return {...sc,att:sn===sc.att&&Math.abs(x-sc.att)>.01?clampRail(sc.att+Math.sign(x-sc.att)*(LEVEL+.3)):sn};}if(id==='ball')return {...sc,ball:x};const i=Number(id.slice(3));return {...sc,defs:sc.defs.map((d,n)=>n===i?x:d)};});
  wake();};
 const reset=()=>{if(pass.current)return;setScene(START);clearResult();setNews('');museumSfx.tick();wake();};

 // ── pointer: carriages, the dial, the lever ──
 const drag=useRef<{id:string;pid:number;x0:number;y0:number;moved:boolean;pull0:number}|null>(null),leverDrag=useRef(false);
 const toLocal=(e:{clientX:number;clientY:number}):[number,number]=>{const r=stageRef.current!.getBoundingClientRect(),z=api.current?.zoom()??{Z:1,tx:0,ty:0};
  return [(e.clientX-r.left-z.tx)/z.Z,(e.clientY-r.top-z.ty)/z.Z];};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(phase!=='play')return;const hit=(e.target as Element).closest?.('[data-hit]');if(!hit)return;
  const id=hit.getAttribute('data-hit')!;unlockMuseumAudio();e.preventDefault();
  drag.current={id,pid:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,pull0:view.current.lever};view.current.focus=id;
  if(id==='dial')tgt.current.dialDrag=true;if(id==='lever')leverDrag.current=true;
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}draw();};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;const P=api.current?.proj();if(!P)return;
  if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>4)d.moved=true;if(!d.moved)return;
  const [lx,ly]=toLocal(e);
  if(d.id==='dial'){const [wx,wy]=toFloor(lx,ly,P,10),deg=clamp(Math.atan2(wx-DIAL.x,-(wy-DIAL.y))*180/Math.PI,-96,96);view.current.dial=deg;setEra(detentOf(deg),true);draw();return;}
  if(d.id==='lever'){const pull=clamp(d.pull0+((e.clientY-d.y0)*.6+(e.clientX-d.x0)*.6)/90,0,1);view.current.lever=pull;draw();if(pull>=.96){drag.current=null;leverDrag.current=false;firePass();}return;}
  const [wx]=toFloor(lx,ly,P,8);moveRider(d.id,wx/5+40);};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;drag.current=null;
  if(d.id==='dial'){tgt.current.dialDrag=false;tgt.current.dial=dialAngle(view.current.era);museumSfx.tick();}
  if(d.id==='lever'){leverDrag.current=false;if(!d.moved)firePass();}
  else if(d.moved&&d.id!=='dial')museumSfx.tick();
  wake();};
 const onKey=(e:KeyboardEvent<HTMLDivElement>)=>{if(phase!=='play')return;const id=(e.target as Element).getAttribute?.('data-hit');
  const dir=e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:e.key==='ArrowRight'||e.key==='ArrowUp'?1:0;
  if(id==='dial'&&dir){e.preventDefault();setEra(stepEra(view.current.era,dir as -1|1));return;}
  if(id==='lever'&&(e.key===' '||e.key==='Enter')){e.preventDefault();firePass();return;}
  if(id&&id!=='dial'&&id!=='lever'&&dir){e.preventDefault();const sc=view.current.scene,cur=id==='att'?sc.att:id==='ball'?sc.ball:sc.defs[Number(id.slice(3))];moveRider(id,cur+dir*(e.shiftKey?5:1));return;}
  if((e.key===' '||e.key==='Enter')&&!id&&e.target===e.currentTarget){e.preventDefault();firePass();}};
 const onFocus=(e:React.FocusEvent<HTMLDivElement>)=>{const id=(e.target as Element).getAttribute?.('data-hit');view.current.focus=id;draw();};
 const onBlur=()=>{if(!drag.current){view.current.focus=null;draw();}};

 // ── derived ──
 const task=TASKS.find(t=>!done.includes(t.id))??null;
 const canCheck=done.length>=TASKS.length||(passes>=8&&done.includes('open'));
 const E=eraOf(era),wide=box.w/Math.max(1,box.h)>1.1;view.current.wide=wide;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...SOURCES,...exhibit.sources].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 useEffect(()=>{say(result?`${eraOf(result.era).tab} · ${result.offside?'OFFSIDE':'ONSIDE'}`:`${E.tab} · LINE ${Math.round((100-live.line)*1.05)} M OUT`);});
 const start=()=>{unlockMuseumAudio();setPhase('play');museumSfx.whistle();wake();};
 const again=()=>{setChecked(false);setRound(n=>n+1);setPhase('play');};
 const label=`The offside line machine set to ${E.tab}: ${E.rule} The striker is ${live.offside?'offside':'onside'} if the pass is played now. ${result?`Last pass: ${result.offside?'offside':'onside'}. ${result.reason}`:''}`;

 const top=wide?40:(result||phase!=='play'?92:40),bottom=wide?34:20;
 const verdict=phase==='play'&&result&&!(box.w<600&&open>.5)&&<div className={s.verdict} role="status" data-verdict={result.offside?'offside':'onside'} data-kind={result.offside?'bad':'good'}>
  <b>{result.offside?'Offside':'Onside'} <small>· {eraOf(result.era).tab}</small></b><span>{result.reason}</span></div>;

 const intro=phase==='intro'&&<IntroPanel kicker={`${exhibit.year} to today · Law 11`} title={<>The offside <em>line machine</em></>}
  deck="The offside law is the reason a striker can’t just wait next to the goalkeeper. It has changed again and again. This machine judges one pass by the law of any year, from 1863 to today." beats={BEATS}/>;
 const check=phase==='check'&&<ScoreCover kicker="Quick check · the offside law" score={`${done.length}/${TASKS.length}`} unit={`tasks done · ${passes} passes judged`}
  notes={<><p><b>Today:</b> {E.id==='1990'?E.rule:eraOf('1990').rule}</p><p>{KID_RULE}</p></>}
  buttons={<button type="button" className={p.ghost} data-back-to-board onClick={again}>Back to the machine</button>}>
  <StepCheck key={round} items={QUIZ.map(x=>({q:x.q,options:x.options,right:x.answer,why:x.why}))} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`}
   onPick={ok=>ok?museumSfx.reveal():museumSfx.look()} doneLabel="Finish" onDone={()=>setChecked(true)}
   renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You ran the line through five rulebooks, from 1863 to today, and opened the judge." take={exhibit.forYourGame}/>}/>
 </ScoreCover>;

 return <PaperRoom id="offside-rules" accent={ACC} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-era':era,'data-tasks':done.length,'data-passes':passes,'data-open':open.toFixed(2),'data-verdict':result?(result.offside?'offside':'onside'):undefined,'data-live':live.offside?'offside':'onside','data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={`${exhibit.year} to today · Law 11`}/>}
  card={<PaperCard ref={cardRef} fig={`Fig. ${E.year}`} title={box.w>520?'The offside line machine':E.tab} hint={phase==='play'?'Drag a player · turn the dial · pull the lever':'Five rulebooks · one machine'}
    readout="" readoutRef={readRef} cover={intro||check||null}>
   <div ref={stageRef} className={s.stage} role="application" aria-label={label} tabIndex={-1}
    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} data-stage>
    {box.w>0&&<Machine ref={api} w={box.w} h={box.h} view={view} top={top} bottom={bottom}/>}
    <svg ref={overRef} className={s.leaders} viewBox={`0 0 ${box.w||1} ${box.h||1}`} aria-hidden="true"/>
    {CAMS.map(c=>{const T=CAM_TEXT[c],on=camIn(era,c);return <button key={c} type="button" tabIndex={-1} className={s.camLabel} data-cam-label={c} data-on={on||undefined} ref={el=>{labelRefs.current[c]=el;}}
     onClick={()=>{view.current.focus=view.current.focus==='cam-'+c?null:'cam-'+c;draw();museumSfx.tick();}}>
     <b><i>{T.n}</i>{T.name}</b><span>{on?(box.w<600?T.short:T.line):`Not in the ${E.tab} law · ${T.since.toLowerCase()}`}</span></button>;})}
   </div>
   {verdict}
  </PaperCard>}
  dock={phase==='intro'?<StartDock label="Run the line" line="Turn the era dial, slide the players, pull the pass lever. You are the assistant referee." onStart={start}/>
   :phase==='play'?<>
    <div className={p.row}>
     <span className={`${p.seg} ${s.eras}`} role="group" aria-label="Which year’s law (the era dial)">{ERAS.map(x=><button key={x.id} type="button" aria-pressed={era===x.id} data-era-btn={x.id} onClick={()=>{setEra(x.id);}}>{x.tab}</button>)}</span>
     <p className={`${p.say} ${p.grow}`} aria-live="polite">{news?<><b>Done:</b> {news}</>:task?<><span className={s.pips} role="img" aria-label={`${done.length} of ${TASKS.length} tasks done`}>{TASKS.map(t=><i key={t.id} data-done={done.includes(t.id)||undefined}/>)}</span>{task.ask}</>
      :<><b>All four done.</b> {E.rule}</>}</p>
    </div>
    <div className={p.row}>
     <div className={s.open}><Slider name="open" label="Open the judge" value={Math.round(open*100)} min={0} max={100} onChange={x=>setOpen(x/100)} show={open>.5?'Open':'Closed'}/></div>
     <button type="button" className={p.ghost} data-reset onClick={reset}>Reset</button>
     {canCheck&&<button type="button" className={p.ghost} data-to-check onClick={()=>{setOpen(0);setPhase('check');museumSfx.reveal();}}>Quick check<StepIcon kind="next"/></button>}
     <button type="button" className={p.btn} data-tone="acc" data-pass data-museum-own-cue disabled={!!pass.current} onClick={firePass}>Pass</button>
    </div></>:null}>
  <section className={g.section} aria-labelledby="off-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="off-story" className={g.h2}>Why the offside line keeps moving</h2>
   <ol className={g.steps}>{exhibit.facts.map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{x}</p></li>)}</ol>
   <ol className={g.steps}>{MILESTONES.map(m=><li key={m.when}><span>{m.when}</span><p className={g.body}><b>{m.head}.</b> {m.text}</p></li>)}</ol>
   <p className={g.body}><b>For kids, in one breath:</b> {KID_RULE}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

/** The ending's mark: two rails, a defender and the striker level, the red line through both. */
function EndArt(){
 return <svg viewBox="0 0 40 40" aria-hidden="true">
  <path d="M4 14h32M4 28h32" stroke="#1d1d1b" strokeWidth="1.2"/>
  <circle cx="22" cy="14" r="4.2" fill="#5c5c5e" stroke="#1d1d1b" strokeWidth=".8"/><circle cx="22" cy="28" r="4.2" fill="#fbfbf8" stroke="#1d1d1b" strokeWidth=".8"/>
  <path d="M22 5v31" stroke={ACC} strokeWidth="2" strokeLinecap="round"/>
 </svg>;
}
