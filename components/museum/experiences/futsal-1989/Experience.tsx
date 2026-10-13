'use client';
import {useEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,Banner,Intro,ScoreCover,Chips,Seg,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,local,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {BALL,MODEL_NOTE,MORE_FACTS,NEW_SOURCES} from './content';
import {CONTROL,E,LOST_MAX,REDUCED_PASSES,ROLES,ROUND_S,kick,newDrop,newRondo,powerOf,reboundCm,settleDrop,soleOut,stepDrop,stepRondo,
 type Drop,type Kind,type Lost,type Rondo} from './model';
import {Rig,type RigApi} from './Rig';
import {Court,type CourtApi} from './Court';

/**
 * futsal-1989 · "Futsal’s World Cup" (Oct 12 2026 anatomy Paper restyle; user: "these games should not be the pixel style … it
 * needs to be larger and fill the entire screen", the anatomy skill's Paper theme). One big paper card fills the first screen:
 *  1. Story intro (1930 Montevideo → the low ball → 5 a side → 1989 Rotterdam).
 *  2. THE DROP RIG (Rig.tsx): tap the ball you think bounces higher, then DROP: both balls fall 2 m onto hard court tiles with
 *     real gravity; a collar on each ruler stops at the first rebound (futsal ≈ 57 cm, in Law 2's 50–65 cm; grass ≈ 141 cm, in
 *     FIFA Quality Pro's 120–165 cm).
 *  3. THE RONDO (Court.tsx): Brazil keep the ball from two Dutch defenders. Drag from the ball toward a team-mate (the drag length
 *     is the power), let go to pass; the receiver traps it with the sole. 30 s with the grass ball and 30 s with the futsal ball:
 *     the bouncy ball squirts off the sole unless you pass softly, and soft passes get cut out.
 *  4. Score (ScoreCover): passes with each ball, the Laws' numbers, the quick check (StepCheck) → the Ending → onComplete once.
 * Heat: one Paper loop (anatomy/paper-loop.ts) runs only during the drop and a round; it parks off-screen and is disposed on
 * unmount. Reduced motion: the drop lands at once; the rondo is turn-based (no clock, no press: each pass resolves at once).
 */
type Phase='intro'|'rig'|'rondo'|'score';
type Result={passes:number;lost:number;best:number};
const ACCENT='#1f8a5b';
const BEATS=[
 {when:'1930 · Montevideo, Uruguay',head:'Five a side, indoors',text:'Juan Carlos Ceriani wrote rules for YMCA courts, borrowing ideas from basketball, handball and water polo.'},
 {when:'Futsal Law 2',head:'The ball that stays low',text:'Dropped from 2 metres, a futsal ball must bounce back only 50 to 65 cm. A top grass ball bounces back 120 to 165 cm.'},
 {when:'38–42 × 20–25 m',head:'Small court, many touches',text:'Five players a side: a fixo, two alas and a pivô, plus the goalkeeper. They can switch spots at any time.'},
 {when:'1989 · Rotterdam',head:'The first World Cup',text:'16 teams came to the Netherlands. In the final, Brazil beat the hosts 2–1.'},
] as const;
const CHECK:CheckItem={q:'Why is the futsal ball made to bounce low?',options:['So it flies over the goalkeeper','So it stays at your feet on a hard floor','So it is easier to head'],right:1,
 why:'On a hard court a bouncy ball runs away. A low ball stays down, so you can stop it with your sole, even after a hard pass.'};
const LOST:Record<Lost,{big:string;line:string}>={
 intercepted:{big:'Cut out',line:'Too slow: a defender got to it. Pass harder.'},
 bounced:{big:'Bounced off',line:'Too hard for this ball: it squirted off the sole.'},
 tackled:{big:'Tackled',line:'The press got you. Pass sooner.'},
 out:{big:'Out',line:'It ran off the court.'},short:{big:'Too soft',line:'It stopped before it got there.'},
};
const KIND_NAME:Record<Kind,string>={futsal:'Futsal ball',grass:'Grass ball'};
/** "1 pass", "3 passes". */
const passes=(n:number)=>`${n} ${n===1?'pass':'passes'}`;
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const [ceriani,brazil,lowBall]=exhibit.facts;
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');const phaseRef=useRef(phase);phaseRef.current=phase;
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),rigApi=useRef<RigApi>(null),courtApi=useRef<CourtApi>(null),readRef=useRef<HTMLSpanElement>(null);
 const said=useRef('');const say=(t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;};
 const drop=useRef<Drop>(newDrop());const [dropped,setDropped]=useState<{futsal:number;grass:number}|null>(null),[dropping,setDropping]=useState(false),[guess,setGuess]=useState<Kind|null>(null);
 const [kind,setKind]=useState<Kind>('grass');
 const rondo=useRef<Rondo>(newRondo('grass',reduced));const [playing,setPlaying]=useState(false);
 const [hud,setHud]=useState({passes:0,lost:0,best:0,why:null as Lost|null,last:0});
 const [results,setResults]=useState<Partial<Record<Kind,Result>>>({});
 const aimRef=useRef<{x:number;y:number;power:number}|null>(null),dragStart=useRef<{x:number;y:number;id:number}|null>(null);
 const [checked,setChecked]=useState(false),[games,setGames]=useState(0);
 const [top,setTop]=useState(40);
 useEffect(()=>{setTop(noteSpace(cardRef.current));},[phase,dropped,playing,results,box.w,box.h,cardRef]);
 const draw=()=>{rigApi.current?.draw();courtApi.current?.draw();};

 // The one loop: the drop while balls bounce, a round while it runs.
 const loop=usePaperLoop(dt=>{
  if(phaseRef.current==='rig'){const more=stepDrop(drop.current,dt);draw();const d=drop.current;
   say(`FUTSAL ${reboundCm(d.balls.futsal)} CM · GRASS ${reboundCm(d.balls.grass)} CM`);if(!more)endDrop();return more;}
  const r=rondo.current,before={p:r.passes,l:r.lost,st:r.state};const more=stepRondo(r,dt);draw();
  if(!r.reduced)say(`${Math.ceil(r.clock)} S · ${passes(r.passes).toUpperCase()}`);
  if(r.passes!==before.p){sfx(museumSfx.tick);setHud({passes:r.passes,lost:r.lost,best:r.best,why:null,last:r.lastOut});}
  if(r.lost!==before.l){sfx(museumSfx.look);setHud({passes:r.passes,lost:r.lost,best:r.best,why:r.why,last:r.lastOut});}
  if(before.st==='lost'&&r.state==='hold')setHud(o=>({...o,why:null}));
  if(!more&&r.state==='over')endRound();return more;},stageRef,reduced);

 const endDrop=()=>{const d=drop.current;setDropping(false);setDropped({futsal:reboundCm(d.balls.futsal),grass:reboundCm(d.balls.grass)});sfx(museumSfx.stamp);};
 const doDrop=()=>{if(dropping)return;unlockMuseumAudio();drop.current=newDrop();drop.current.dropped=true;setDropped(null);setDropping(true);sfx(museumSfx.flap);
  if(reduced){settleDrop(drop.current);endDrop();draw();return;}loop.wake();};
 const pickGuess=(k:Kind)=>{if(dropping)return;unlockMuseumAudio();setGuess(k);sfx(museumSfx.tick);if(dropped){drop.current=newDrop();setDropped(null);}draw();};
 const startRound=(k:Kind=kind)=>{unlockMuseumAudio();rondo.current=newRondo(k,reduced);setHud({passes:0,lost:0,best:0,why:null,last:0});setPlaying(true);sfx(museumSfx.whistle);
  say(reduced?`PASS 1 OF ${REDUCED_PASSES}`:`${ROUND_S} S`);if(!reduced)loop.wake();draw();};
 const endRound=()=>{const r=rondo.current;setPlaying(false);sfx(museumSfx.whistle);say(passes(r.passes).toUpperCase());
  setResults(o=>({...o,[r.kind]:{passes:r.passes,lost:r.lost,best:r.best}}));};
 const both=!!results.futsal&&!!results.grass;

 // Drag from the ball toward a team-mate: direction = holder → finger, power = how far you dragged.
 const floorAt=(e:{clientX:number;clientY:number})=>{const P=courtApi.current?.proj(),el=stageRef.current;if(!P||!el)return null;const [sx,sy]=local(e,el),[x,y]=toFloor(sx,sy,P);return {x:x/10,y:y/10};};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(phase!=='rondo'||!playing||rondo.current.state!=='hold')return;const w=floorAt(e);if(!w)return;unlockMuseumAudio();
  dragStart.current={...w,id:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const st=dragStart.current;if(!st||st.id!==e.pointerId)return;const w=floorAt(e);if(!w)return;const r=rondo.current,h=r.mates[r.holder];
  const power=powerOf(Math.hypot(w.x-st.x,w.y-st.y));aimRef.current={x:w.x-st.x||w.x-h.x,y:w.y-st.y||w.y-h.y,power};
  say(`PASS ${power.toFixed(1)} M/S${soleOut(r.kind,power)>CONTROL?' · TOO HARD':''}`);draw();};
 const onUp=(e:RPointerEvent<HTMLDivElement>,cancelled=false)=>{const st=dragStart.current;if(!st||st.id!==e.pointerId)return;const a=aimRef.current;aimRef.current=null;dragStart.current=null;
  if(!cancelled&&a&&Math.hypot(a.x,a.y)>.3&&a.power>3.2&&kick(rondo.current,a.x,a.y,a.power)){sfx(museumSfx.kick);loop.wake();}draw();};
 // Keyboard: ← → pick the team-mate, ↑ ↓ set the power, Enter passes.
 const keyAim=useRef({mate:1,power:7});
 const keyShow=()=>{const r=rondo.current,h=r.mates[r.holder],m=r.mates[keyAim.current.mate===r.holder?(keyAim.current.mate+1)%4:keyAim.current.mate];
  aimRef.current={x:m.x-h.x,y:m.y-h.y,power:keyAim.current.power};say(`PASS ${keyAim.current.power.toFixed(1)} M/S`);draw();};
 const onKey=(e:KeyboardEvent<HTMLElement>)=>{const k=e.key,btn=e.target instanceof HTMLButtonElement;
  if(k==='Escape'){e.preventDefault();onClose();return;}
  if(phase==='rig'){if(k==='ArrowLeft'){e.preventDefault();pickGuess('futsal');}else if(k==='ArrowRight'){e.preventDefault();pickGuess('grass');}else if((k===' '||k==='Enter')&&!btn){e.preventDefault();doDrop();}return;}
  if(phase!=='rondo')return;const fine=e.shiftKey;
  if(k==='ArrowLeft'){e.preventDefault();keyAim.current.mate=(keyAim.current.mate+3)%4;keyShow();}
  else if(k==='ArrowRight'){e.preventDefault();keyAim.current.mate=(keyAim.current.mate+1)%4;keyShow();}
  else if(k==='ArrowUp'){e.preventDefault();keyAim.current.power=Math.min(12,keyAim.current.power+(fine?.2:1));keyShow();}
  else if(k==='ArrowDown'){e.preventDefault();keyAim.current.power=Math.max(3.5,keyAim.current.power-(fine?.2:1));keyShow();}
  else if((k===' '||k==='Enter')&&!btn){e.preventDefault();if(!playing){startRound();return;}const a=aimRef.current;aimRef.current=null;if(a&&kick(rondo.current,a.x,a.y,a.power)){sfx(museumSfx.kick);loop.wake();}}};
 useEffect(()=>{draw();if(phase==='rig')say('TAP A BALL · DROP');if(phase==='rondo')say('KICK OFF');},[phase]);// eslint-disable-line react-hooks/exhaustive-deps
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...NEW_SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 const lostWord=hud.why&&playing?LOST[hud.why]:null;
 const higher:Kind|null=dropped?(dropped.futsal>dropped.grass?'futsal':'grass'):null;
 const note=phase==='rig'?(dropped?null:<><b>Which ball bounces back higher?</b> {guess?<>You picked the <b>{KIND_NAME[guess].toLowerCase()}</b>. Now drop them from 2 metres.</>:'Tap a ball to guess, then drop them both from 2 metres onto a hard court.'}</>)
  :phase==='rondo'&&!playing?<><span className={s.tag} data-tone="acc">{KIND_NAME[kind]}</span>Keep the ball from the two Dutch defenders. {reduced?`${REDUCED_PASSES} passes, ${LOST_MAX} lives.`:`${ROUND_S} seconds, ${LOST_MAX} lives.`} Drag from the ball to a team-mate; a longer drag is a harder pass.</>:null;
 const banner=phase==='rig'&&dropped?<Banner kind={guess===higher?'good':'info'} big={guess==null?'Same drop, same floor':guess===higher?'You guessed right!':'Surprise!'}
   line={<>Futsal ball: {dropped.futsal} cm (the Law: {BALL.futsal.lo}–{BALL.futsal.hi}). Grass ball: {dropped.grass} cm ({BALL.grass.law}: {BALL.grass.lo}–{BALL.grass.hi}).</>}/>
  :phase==='rondo'&&lostWord?<Banner kind="bad" big={lostWord.big} line={lostWord.line}/>
  :phase==='rondo'&&!playing&&results[kind]?<Banner kind="good" big={passes(results[kind]!.passes)} line={`${KIND_NAME[kind]}. ${both?'Now see the score.':kind==='grass'?'Now try the futsal ball.':'Now try the grass ball.'}`}/>:null;

 const cover=phase==='intro'?<Intro kicker={<>Real history · {exhibit.year}</>} title={<>Small court, <em>low ball</em></>} deck={brazil} beats={BEATS}
   onStart={()=>{unlockMuseumAudio();setPhase('rig');}} startLabel="To the drop rig ▸"/>
  :phase==='score'?<ScoreCover kicker="Full time · two balls" score={results.futsal?.passes??0} unit={`${(results.futsal?.passes??0)===1?'pass':'passes'} with the futsal ball`}
    notes={<><p><b>Grass ball: {passes(results.grass?.passes??0)}. Futsal ball: {passes(results.futsal?.passes??0)}.</b> The grass ball bounces back about {Math.round(E.grass*E.grass*100)}% of a drop, the futsal ball only {Math.round(E.futsal*E.futsal*100)}%: you can pass the low ball hard and still trap it.</p>
     <p><b>{lowBall}</b> {exhibit.forYourGame}</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-futsal-again onClick={()=>{setResults({});setChecked(false);setGames(n=>n+1);setKind('grass');rondo.current=newRondo('grass',reduced);setPhase('rondo');}}>Play again</button>
     <button type="button" className={s.ghost} onClick={()=>{drop.current=newDrop();setDropped(null);setGuess(null);setPhase('rig');}}>Drop test again</button></>}>
    <StepCheck key={games} items={[CHECK]} kicker={()=>'Quick check'} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" fill={ACCENT}/><path d="M4 36h32" stroke="#1d1d1b" strokeWidth="1.4"/></svg>}
      seen="You dropped both balls and kept the ball on a hard court." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const title=phase==='rig'||phase==='intro'?'The drop test':'Keep the ball';
 const hint=phase==='rig'||phase==='intro'?'Tap a ball to guess · press Drop':reduced?'Drag to a team-mate · it resolves at once':'Drag from the ball to a team-mate';
 const label=phase==='rig'||phase==='intro'?`A drop rig: a futsal ball and a grass ball held 2 metres over hard court tiles, each beside a ruler.${dropped?` The futsal ball bounced back ${dropped.futsal} cm, the grass ball ${dropped.grass} cm.`:''}`
  :`A table-top futsal court. Brazil’s ${ROLES.join(', ')} pass the ${KIND_NAME[kind].toLowerCase()} around two Dutch defenders. ${passes(hud.passes)}, ${hud.lost} lost.`;

 return <PaperRoom id="futsal-1989" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose} onKeyDown={onKey}
  rootProps={{'data-phase':phase,'data-ball':kind,'data-playing':playing||undefined,'data-passes':hud.passes,'data-lost':hud.lost,'data-drop':dropped?`${dropped.futsal},${dropped.grass}`:undefined,'data-guess':guess??undefined,'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Rotterdam, the Netherlands</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note={phase==='rig'?'right':''} fig={`Fig. ${exhibit.year}`} title={title} hint={hint} readout="TAP A BALL" readoutRef={readRef} note={note} banner={banner} cover={cover}>
   <div ref={stageRef} className={s.stage} tabIndex={0} role="application" aria-label={label} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={e=>onUp(e)} onPointerCancel={e=>onUp(e,true)}
    data-stage={phase==='rondo'||phase==='score'?'court':'rig'} style={{cursor:phase==='rondo'&&playing?'crosshair':undefined}}>
    {phase==='rondo'||phase==='score'?<Court ref={courtApi} w={box.w} h={box.h} top={top} bottom={40} r={rondo.current} aimRef={aimRef}/>
     :<Rig ref={rigApi} w={box.w} h={box.h} top={top} bottom={40} drop={drop.current} guess={guess} onGuess={pickGuess}/>}
   </div>
  </PaperCard>}
  dock={phase==='rig'?<>
   <div className={s.row}>
    <Seg label="Your guess: which bounces higher?" value={guess??('none' as Kind)} onChange={pickGuess} disabled={dropping}
     options={[{v:'futsal',label:'Futsal ball',aria:'Guess the futsal ball'},{v:'grass',label:'Grass ball',aria:'Guess the grass ball'}]}/>
    <span className={s.grow}><Chips items={[{k:'futsal',label:'Futsal',value:dropped?`${dropped.futsal} cm`:'?'},{k:'grass',label:'Grass',value:dropped?`${dropped.grass} cm`:'?'}]}/></span>
   </div>
   <div className={s.row}>
    <button type="button" className={s.btn} data-tone={dropped?undefined:'acc'} disabled={dropping} data-futsal-drop onClick={doDrop}>{dropped?'Drop again':'Drop!'}</button>
    {dropped&&!dropping&&<button type="button" className={s.btn} data-tone="acc" data-futsal-to-rondo onClick={()=>{setPhase('rondo');sfx(museumSfx.whistle);}}>To the rondo ▸</button>}
   </div></>
  :phase==='rondo'?<>
   <div className={s.row}>
    <Seg label="Which ball" value={kind} disabled={playing} onChange={k=>{setKind(k);rondo.current=newRondo(k,reduced);draw();}} options={[{v:'grass',label:'Grass ball'},{v:'futsal',label:'Futsal ball'}]}/>
    <span className={s.grow}><Chips items={[{k:'passes',label:'Passes',value:hud.passes},{k:'lost',label:'Lost',value:`${hud.lost}/${LOST_MAX}`},{k:'best',label:'Best run',value:hud.best}]}/></span>
   </div>
   <div className={s.row}>
    {both&&!playing?<button type="button" className={s.btn} data-tone="acc" data-futsal-score onClick={()=>setPhase('score')}>Score ▸</button>
     :<button type="button" className={s.btn} data-tone="acc" disabled={playing} data-futsal-kickoff onClick={()=>startRound()}>{playing?'Playing…':results[kind]?'Again':'Kick off'}</button>}
    {playing&&<span className={s.say}>{lostWord?<><b>{lostWord.big}.</b> {lostWord.line}</>:'Drag from the ball to a team-mate, let go to pass.'}</span>}
   </div></>:null}>
  <section className={g.section} aria-labelledby="futsal-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="futsal-story" className={g.h2}>From a YMCA court to a World Cup</h2>
   <ol className={g.steps}>
    <li><span>1930</span><p className={g.body}>{ceriani}</p></li>
    {MORE_FACTS.map(f=><li key={f.text}><span>{f.tag}</span><p className={g.body}>{f.text}</p></li>)}
    <li><span>1989</span><p className={g.body}>{brazil}</p></li>
    <li><span>Ball</span><p className={g.body}>{lowBall}</p></li>
   </ol>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <p className={g.small}>{MODEL_NOTE}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}
