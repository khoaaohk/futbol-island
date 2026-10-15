'use client';
import {useEffect,useMemo,useReducer,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import Slider from '../modern/Slider';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {IntroPanel,StartDock} from '../modern/StartDock';
import {PaperRoom,PaperCard,Banner,ScoreCover,Chips,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,local,toFloor,clamp,follow} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {ACCENT,BEATS,CHECKS as QUIZ,HISTORY,LAYER_TEXT,MODEL_NOTE,RESULT,SOURCES} from './content';
import {AIM_MAX,CHECKS,CHECK_NAME,FAIR_REASON,FOOT_MAX,FOOT_MIN,LIFTS,REASON,ROUNDS,START_RIG,TRIES,flightTime,footZone,judge,resolve,
 type Check,type Lift,type Result,type Rig} from './model';
import {AT,LAYERS,Scene,anchors,armFromDial,layoutOf,projectionFor,type Ctl,type View} from './Rig';
import ti from './ti.module.css';

/**
 * throw-in · "The throw-in" (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do something", "more
 * like the stadiums": a real breakdown of the parts). Anatomy Paper room, ONE object: the throw-in trainer (Rig.tsx).
 *  1. Intro (the card's cover) and ONE centred start button (StartDock).
 *  2. SET UP THE THROW: drag the two foot carriages across the line, flip the lift lever (flat, heel up, off the ground) and the
 *     hands switch, turn the arm knob. The referee's box judges every change at once (Law 15): four flags flip up for the four
 *     checks, the lamp turns green or red, the whistle tips up on a foul. Make it fair. "Take it apart" (a slider) lifts the
 *     mannequin into four labelled layers: feet, body, arms, hands, each with what the Law asks of it.
 *  3. THROW TO A TEAM-MATE: the view pulls back to the model pitch; team-mates and defenders slide in on rails. Turn the aim dial,
 *     push the power slide, press the release: the arms come over and the ball flies. A foul throw goes to the other team.
 *  4. Score + quick check (StepCheck) → Ending → onComplete once.
 * Heat: SVG drawn by React only when something changes; the shared Paper loop (anatomy/paper-loop.ts) runs only while the view
 * eases (zoom, explode, rails), the whistle shakes or the ball flies; it parks off-screen and stops at rest (0 rAF). Reduced
 * motion: the loop runs each motion straight to its end (instant states).
 */
type Phase='intro'|'build'|'throw'|'score';
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
type Anim={zoom:number;zoomT:number;explode:number;explodeT:number;slide:number;press:number;whistle:number;fly:View['fly']};

/** A tick or a cross drawn as strokes (no glyphs). */
function Mark({ok}:{ok:boolean}){
 return <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" focusable="false" className={ti.mark} data-ok={ok||undefined}>
  <circle cx="8" cy="8" r="7.2"/>{ok?<path d="M4.6 8.4l2.3 2.3 4.6-5"/>:<path d="M5.4 5.4l5.2 5.2M10.6 5.4l-5.2 5.2"/>}</svg>;
}

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const [,bump]=useReducer((n:number)=>n+1,0);
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),readRef=useRef<HTMLSpanElement>(null);
 const [top,setTop]=useState(40);
 const said=useRef('');const say=(t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;};
 useEffect(()=>{const k=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k);},[onClose]);

 // ── The trainer's settings ──
 const [rig,setRigS]=useState<Rig>(START_RIG);
 const [aim,setAim]=useState(-10),[power,setPower]=useState(.3);
 const [fairDone,setFairDone]=useState(false),[heelSeen,setHeelSeen]=useState(false),[apartSeen,setApartSeen]=useState(false),[apart,setApart]=useState(0);
 const verdict=judge(rig);
 const A=useRef<Anim>({zoom:0,zoomT:0,explode:0,explodeT:0,slide:1,press:0,whistle:0,fly:null});

 // ── The throw ──
 const [round,setRound]=useState(0),[tries,setTries]=useState(0),[points,setPoints]=useState<number[]>([0,0,0]),[out,setOut]=useState<Result|null>(null);
 const [checked,setChecked]=useState(false);
 const R=ROUNDS[round];

 const loop=usePaperLoop(dt=>{const a=A.current;let more=false;
  const step=(cur:number,tgt:number,tau:number)=>{const n=follow(cur,tgt,dt,tau,1e-3);if(n!==tgt)more=true;return n;};
  a.zoom=step(a.zoom,a.zoomT,.32);a.explode=step(a.explode,a.explodeT,.16);
  if(a.slide<1){a.slide=Math.min(1,a.slide+dt/.9);more=true;}
  if(a.press>0){a.press=Math.max(0,a.press-dt*3);more=true;}
  if(a.whistle>0){a.whistle=Math.max(0,a.whistle-dt*1.4);more=true;}
  const f=a.fly;if(f){f.t+=dt;const end=.25+f.dur+(f.result==='caught'?.45:.15);if(f.t>=end){a.fly=null;landed(f.result as Result);}else more=true;}
  bump();return more;},stageRef,reduced);
 const kick=()=>loop.wake();

 const setRig=(next:Rig)=>{
  const before=judge(rig),after=judge(next);
  if(next.lift!==rig.lift||next.hands!==rig.hands||footZone(next.footL)!==footZone(rig.footL)||footZone(next.footR)!==footZone(rig.footR)||(after.fouls.includes('over')!==before.fouls.includes('over')))sfx(museumSfx.tick);
  if(before.fair&&!after.fair){A.current.whistle=1;sfx(museumSfx.whistle);kick();}
  if(!before.fair&&after.fair)sfx(museumSfx.stamp);
  if(after.fair){setFairDone(true);if(next.lift===1)setHeelSeen(true);}
  setRigS(next);if(phase==='throw'&&out)setOut(null);
 };
 const setExplode=(v:number)=>{setApart(v);A.current.explodeT=v;if(v>.6)setApartSeen(true);kick();};

 const startThrowPhase=()=>{unlockMuseumAudio();sfx(museumSfx.whistle);setExplode(0);setPhase('throw');setRound(0);setTries(0);setPoints([0,0,0]);setOut(null);
  A.current.zoomT=1;A.current.slide=0;kick();};
 const goRound=(i:number)=>{setRound(i);setTries(0);setOut(null);A.current.slide=0;sfx(museumSfx.whistle);kick();};
 const release=()=>{const a=A.current;if(phase!=='throw'||a.fly||out)return;unlockMuseumAudio();a.press=1;
  const res=resolve(R,aim,power,rig);
  if(res.result==='foul'){a.whistle=1;sfx(museumSfx.whistle);sfx(museumSfx.card);setOut('foul');setTries(t=>t+1);kick();return;}
  a.fly={t:0,dur:flightTime(power),at:res.at,power,result:res.result,mate:res.mate};sfx(museumSfx.kick);kick();};
 function landed(r:Result){setOut(r);setTries(t=>t+1);if(r==='caught'){setPoints(p=>p.map((v,i)=>i===round?1:v));sfx(museumSfx.net);}else sfx(museumSfx.look);}
 const scored=out==='caught',canNext=scored||tries>=TRIES;

 // ── The camera, the controls and their hit targets ──
 const P=box.w?projectionFor(box.w,box.h,A.current.zoom,top,26,A.current.explode):null;
 useEffect(()=>{setTop(cardRef.current?.querySelector('[data-paper-note]')?noteSpace(cardRef.current,40):40);},[phase,box.w,box.h,round,out,cardRef]);
 const drag=useRef<{c:Ctl;id:number}|null>(null);
 const floorAt=(e:{clientX:number;clientY:number},z:number):[number,number]|null=>{const el=stageRef.current;if(!P||!el)return null;const [sx,sy]=local(e,el);return toFloor(sx,sy,P,z);};
 const dragTo=(c:Ctl,e:{clientX:number;clientY:number})=>{
  if(c==='footL'||c==='footR'){const p=floorAt(e,6);if(!p)return;const y=Math.round(clamp(p[1],FOOT_MIN,FOOT_MAX));setRig({...rig,[c]:y});}
  else if(c==='arm'){const p=floorAt(e,12);if(!p)return;setRig({...rig,arm:Math.round(armFromDial(Math.atan2(p[0]-AT.arm[0],p[1]-AT.arm[1]))*100)/100});}
  else if(c==='aim'){const p=floorAt(e,12);if(!p)return;const d=Math.atan2(p[0]-AT.aim[0],p[1]-AT.aim[1])*180/Math.PI;if(Math.abs(d)<=AIM_MAX+40){setAim(Math.round(clamp(d,-AIM_MAX,AIM_MAX)));if(out)setOut(null);}}
  else if(c==='power'){const p=floorAt(e,8);if(!p)return;setPower(Math.round(clamp((p[0]-(AT.power[0]-26))/52,0,1)*100)/100);if(out)setOut(null);}
 };
 const press=(c:Ctl)=>{
  if(c==='lift')setRig({...rig,lift:((rig.lift+1)%3) as Lift});
  else if(c==='hands')setRig({...rig,hands:rig.hands===2?1:2});
  else if(c==='release')release();
 };
 const onCtlDown=(c:Ctl,e:RPointerEvent<SVGElement>)=>{e.stopPropagation();unlockMuseumAudio();
  if(c==='lift'||c==='hands'||c==='release'){press(c);return;}
  drag.current={c,id:e.pointerId};try{stageRef.current?.setPointerCapture(e.pointerId);}catch{/* fine */}dragTo(c,e);};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;dragTo(d.c,e);};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{if(drag.current?.id===e.pointerId)drag.current=null;};
 const onCtlKey=(c:Ctl,e:KeyboardEvent<SVGElement>)=>{const k=e.key,up=k==='ArrowUp'||k==='ArrowRight',dn=k==='ArrowDown'||k==='ArrowLeft',fine=e.shiftKey?.25:1;
  if(k==='Enter'||k===' '){e.preventDefault();if(c==='lift'||c==='hands'||c==='release')press(c);return;}
  if(!up&&!dn)return;e.preventDefault();const d=up?1:-1;
  if(c==='footL'||c==='footR')setRig({...rig,[c]:clamp(rig[c]+d*4*fine,FOOT_MIN,FOOT_MAX)});
  else if(c==='lift')setRig({...rig,lift:clamp(rig.lift+d,0,2) as Lift});
  else if(c==='hands')setRig({...rig,hands:d>0?2:1});
  else if(c==='arm')setRig({...rig,arm:Math.round(clamp(rig.arm+d*.05*fine,0,1)*100)/100});
  else if(c==='aim'){setAim(clamp(aim+d*5*fine,-AIM_MAX,AIM_MAX));if(out)setOut(null);}
  else if(c==='power'){setPower(Math.round(clamp(power+d*.05*fine,0,1)*100)/100);if(out)setOut(null);}};

 const a=A.current;
 const view:View={rig,aim,power,zoom:a.zoom,explode:a.explode,round,phase,fly:a.fly,slide:a.slide,press:a.press,whistle:a.whistle};
 useEffect(()=>{if(phase==='build'||phase==='intro')say(verdict.fair?'REF · FAIR THROW':`REF · FOUL THROW · ${verdict.fouls.length}`);
  else if(phase==='throw')say(out?RESULT[out].big.toUpperCase():`AIM ${Math.round(aim)}° · POWER ${Math.round(power*100)}%`);});

 // The exploded layers' labels (HTML, with leader lines in the SVG).
 const showLabels=phase==='build'&&a.explode>.45&&P;
 const labelGeom=useMemo(()=>{if(!showLabels||!P)return null;const an=anchors(view,P),L=layoutOf(box.w,box.h),wide=L.wide,lw=wide?260:168;
  const list=LAYERS.map(l=>{const at=an[l.id],t=LAYER_TEXT[l.id],lines=Math.ceil(t.text.length*(wide?6.4:6)/(lw-20));return {id:l.id,at,x:wide?box.w-lw-24:at[0]>box.w*.45?8:box.w-lw-8,y:at[1]-18,lw,h:(wide?34:30)+lines*(wide?17.5:15.5)};}).sort((p,q)=>p.y-q.y);
  // no overlaps: push each label below the one above it, then pull the stack up if it runs off the bottom
  let floor=top+4;for(const l of list){l.y=Math.max(l.y,floor);floor=l.y+l.h+6;}
  const over=floor-(box.h-30);if(over>0)for(const l of list)l.y-=over;
  return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[showLabels,P?.scale,P?.origin[0],P?.origin[1],a.explode,rig,box.w,box.h,top]);
 const ok=(c:Check)=>!verdict.fouls.includes(c);
 const labels=labelGeom?<g opacity={Math.min(1,(a.explode-.45)*3)} data-ti-leaders>{labelGeom.map(l=><g key={l.id}>
  <path d={`M${l.at[0]} ${l.at[1]}L${l.x+(l.x>l.at[0]?0:l.lw)} ${l.y+18}`} stroke="var(--acc)" strokeWidth={1} fill="none"/>
  <circle cx={l.at[0]} cy={l.at[1]} r={3} fill="var(--acc)"/></g>)}</g>:null;
 const layerOk=(id:'feet'|'body'|'arms'|'ball')=>id==='feet'?ok('feet')&&ok('ground'):id==='arms'?ok('over'):id==='ball'?ok('hands'):true;

 const items:CheckItem[]=useMemo(()=>QUIZ.map(c=>({q:c.q,options:c.options,right:c.right,why:c.why})),[]);
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const total=points.reduce((x,y)=>x+y,0);

 const note=phase==='build'?(verdict.fair
   ?<><span className={s.tag} data-tone="acc">Fair</span>{heelSeen?'Heel up, toes down is still fair: part of the foot is on the ground. ':'Try the lift lever: is a heel up still fair? '}Then <b>take it apart</b>, or go to the pitch.</>
   :<><span className={s.tag}>Foul throw</span>{REASON[verdict.fouls[0]]}</>)
  :phase==='throw'&&!out&&!a.fly?<><span className={s.tag} data-tone="acc">{R.title}</span>{R.goal} <span className={ti.tip}>{R.tip}</span></>:null;
 const banner=phase==='throw'&&out?<Banner kind={RESULT[out].kind} big={RESULT[out].big} line={out==='foul'?`${REASON[verdict.fouls[0]??'hands']} ${RESULT.foul.line}`:RESULT[out].line}/>:null;
 const cover=phase==='intro'?<IntroPanel kicker={<>Skills &amp; science · {exhibit.year}</>} title={<>The <em>throw-in</em> trainer</>} deck={exhibit.facts[1]} beats={BEATS}/>
  :phase==='score'?<ScoreCover kicker="Three throw-ins" score={total} unit="of 3 caught"
    notes={<><p><b>{total>=3?'A throw-in expert!':total>=2?'Good throwing.':'Throw-ins are a skill: keep practising.'}</b> To feet, down the line, to the free player: three ways to keep the ball.</p><p>{exhibit.facts[2]}</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-ti-again onClick={startThrowPhase}>Throw again</button>
     <button type="button" className={s.ghost} data-ti-rebuild onClick={()=>{A.current.zoomT=0;kick();setPhase('build');}}>Back to the trainer</button></>}>
    <StepCheck items={items} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={o=>sfx(o?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<EndArt/>} seen="You set up a fair throw like a referee and found your team-mate." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const dock=phase==='intro'?<StartDock label="Set up the trainer" line="Move the feet, flip the switches, turn the knob: the referee’s box judges every throw." onStart={()=>{unlockMuseumAudio();sfx(museumSfx.whistle);setPhase('build');}}/>
  :phase==='build'?<>
   <ul className={ti.checks} aria-label="The referee’s four checks" data-ti-checks>{CHECKS.map((c,i)=><li key={c} data-check={c} data-ok={ok(c)||undefined}><Mark ok={ok(c)}/><span><small>{i+1}</small>{CHECK_NAME[c]}</span></li>)}</ul>
   <div className={s.row}>
    <span className={s.grow}><Slider name="apart" label="Take it apart" value={Math.round(apart*100)} min={0} max={100} step={1} onChange={v=>setExplode(v/100)} show={apart>.6?'Apart':apart>0?'Opening':'Together'}/></span>
    <button type="button" className={s.btn} data-tone="acc" data-ti-to-pitch disabled={!fairDone} onClick={startThrowPhase}>Go to the pitch</button>
   </div>
   <p className={s.say} data-ti-say>{!verdict.fair?`Make the lamp go green: ${4-verdict.fouls.length} of 4 checks pass.`:!fairDone?'':apartSeen?'You know the four checks. Now throw to a team-mate.':'Fair! Pull the slider to take the throw apart.'}</p></>
  :phase==='throw'?<>
   <div className={ti.twin}>
    <Slider name="aim" label="Aim dial" value={aim} min={-AIM_MAX} max={AIM_MAX} step={1} onChange={v=>{setAim(v);if(out)setOut(null);}} show={aim===0?'Straight':aim<0?`${-aim}° left`:`${aim}° right`}/>
    <Slider name="power" label="Power slide" value={Math.round(power*100)} min={0} max={100} step={1} onChange={v=>{setPower(v/100);if(out)setOut(null);}} show={`${Math.round(power*100)}%`}/>
   </div>
   <div className={s.row}>
    <span className={s.grow}><Chips items={[{k:'sit',label:'Situation',value:`${round+1}/3`},{k:'try',label:'Try',value:`${Math.min(TRIES,tries+(canNext?0:1))}/${TRIES}`},{k:'pts',label:'Caught',value:total}]}/></span>
   </div>
   <div className={s.row}>
    {canNext?(round<2?<button type="button" className={s.btn} data-tone="acc" data-ti-next onClick={()=>goRound(round+1)}>Next situation</button>
      :<button type="button" className={s.btn} data-tone="acc" data-ti-score onClick={()=>{sfx(museumSfx.whistle);setPhase('score');}}>See your score</button>)
     :<button type="button" className={s.btn} data-tone="acc" data-ti-go disabled={!!a.fly||!!out} onClick={release}>Release</button>}
    {out&&!canNext&&<button type="button" className={s.ghost} data-ti-retry onClick={()=>setOut(null)}>Try again</button>}
    <p className={`${s.say} ${s.grow}`}>Turn the aim dial, push the power slide, press the release.</p>
   </div></>
  :null;

 const label=phase==='build'||phase==='intro'?`The throw-in trainer. Left foot ${footZone(rig.footL)}, right foot ${footZone(rig.footR)} the line. Back foot: ${LIFTS[rig.lift]}. ${rig.hands===2?'Two hands':'One hand'}. The referee says: ${verdict.fair?FAIR_REASON:verdict.fouls.map(x=>REASON[x]).join(' ')}`
  :`The model pitch. ${R.title}: ${R.goal}`;
 return <PaperRoom id="throw-in" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose}
  rootProps={{'data-phase':phase,'data-rig':`${rig.footL},${rig.footR},${rig.lift},${rig.hands},${rig.arm}`,'data-verdict':verdict.fair?'fair':'foul','data-fouls':verdict.fouls.join(',')||undefined,
   'data-fair-done':fairDone||undefined,'data-situation':R.id,'data-result':out??undefined,'data-points':points.join(','),'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Skills &amp; science</>}/>}
  card={<PaperCard ref={cardRef} fig="Fig. Law 15" title={phase==='throw'||phase==='score'?'Find a team-mate':'The throw-in trainer'} hint={phase==='throw'?'Turn the aim dial · slide the power · press release':'Drag the feet · flip the switches · turn the knob'} readout="LAW 15" readoutRef={readRef}
   note={note} banner={banner} cover={cover} data-wide-note>
   <div ref={stageRef} className={`${s.stage} ${ti.stage}`} role="application" aria-label={label} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    {P&&<Scene w={box.w} h={box.h} P={P} v={view} focusCtl={null} onCtlDown={onCtlDown} onCtlKey={onCtlKey} labels={labels}/>}
   </div>
   {labelGeom&&<div className={ti.labels} style={{opacity:Math.min(1,(a.explode-.45)*3)}}>{labelGeom.map(l=>{const t=LAYER_TEXT[l.id],good=layerOk(l.id);
    return <div key={l.id} className={ti.label} data-layer={l.id} data-ok={good||undefined} style={{left:l.x,top:l.y,width:l.lw}}>
     <b><i>{t.n}</i>{t.head}<Mark ok={good}/></b><span>{t.text}</span></div>;})}</div>}
  </PaperCard>}
  dock={dock}>
  <section className={g.section} aria-labelledby="ti-story">
   <p className={g.kicker}>Law 15</p>
   <h2 id="ti-story" className={g.h2}>Two hands, both feet, over the head</h2>
   <ol className={g.steps}>{exhibit.facts.map((t,i)=><li key={t}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{t}</p></li>)}</ol>
   <p className={g.kicker}>How the throw-in grew up</p>
   <ol className={g.steps}>{HISTORY.map(h=><li key={h.tag}><span>{h.tag}</span><p className={g.body}>{h.text}</p></li>)}</ol>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}

function EndArt(){
 return <svg viewBox="0 0 120 80" aria-hidden="true"><line x1="0" x2="120" y1="70" y2="70" stroke="#1d1d1b" strokeWidth="1"/><rect x="30" y="68" width="6" height="4" fill="#1d1d1b"/>
  <path d="M33 30Q70 -6 104 62" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3 3"/><circle cx={33} cy={26} r={6} fill={ACCENT}/><circle cx={104} cy={62} r={5} fill="none" stroke="#1d1d1b" strokeWidth="1.5"/></svg>;
}
