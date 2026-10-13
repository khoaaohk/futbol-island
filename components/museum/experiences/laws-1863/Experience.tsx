'use client';
import {useEffect,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,Banner,Intro,ScoreCover,Pips,Chips,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,clamp,scaleOf} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {LAW_SOURCES,MILESTONES,yearLabel} from './laws';
import {SORT_SOURCES,type SortCard} from './sort';
import {CALL_MS,callPoints,makeRound,maxRound,rng,type RefCall} from './refcalls';
import {BEATS,CHECK} from './story';
import {FILMS,MATCH_N,PRESS_N,PRESS_PTS,matchVerdict,pressInit,pressRound,pressVerdict,truthOf,type Die,type MatchView,type PressState} from './model';
import {Press,GLYPH,type PressApi} from './Press';
import {Pitch,type PitchApi} from './Pitch';

/**
 * laws-1863 · "Write the first Laws" (Oct 12 2026 anatomy Paper restyle; user: "these games should not be the pixel style. only
 * the penalty kick should be pixel game", "it needs to be larger and fill the entire screen", the anatomy skill's Paper theme).
 * One big paper card fills the first screen; two machines drawn with the anatomy kit:
 *  1. Story intro (Intro): before 1863 → the Freemasons' Tavern, 26 October 1863 → thirteen Laws, Blackheath walks out.
 *  2. THE RULE PRESS (Press.tsx): six of the 1863 Laws, one at a time, on the bed of a cast-iron lever press. Tap a tray to set
 *     the die (✓ still a rule today, ✗ changed since), then drag the lever down (or the Pull button / Space): the ram drives
 *     the platen onto the card, the card is stamped and slides into its tray. Then the truth (sort.ts).
 *  3. REF THE MATCH (Pitch.tsx): six moments on a table-top pitch, each under the Laws of 1863 (two posts with flags, no bar,
 *     no net, no lines) or today's (the goal, the net, the lines). The pegs play the moment; a stopwatch gives you six seconds
 *     to call it; speed and a streak score more (refcalls.ts). Then the why, under that rulebook.
 *  4. Full time (ScoreCover): both scores, a best, the three-question check (StepCheck) → the Ending → onComplete (once).
 * Heat: one Paper loop (anatomy/paper-loop.ts) runs only while the press moves, a film plays or the stopwatch runs; it parks
 * off-screen and is disposed on unmount. Reduced motion: the press jumps to the end of each pull; each match moment is shown on
 * its last frame, untimed (turn-based).
 */
const BEST_KEY='futbol.museum.laws-1863.refBest';
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const writeBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};
const CHECKS:CheckItem[]=CHECK.map(q=>({q:q.q,options:q.options,right:q.answer,why:q.why}));
const ACCENT='#c8372d';
type Phase='intro'|'press'|'stamped'|'between'|'call'|'called'|'score';
type Anim={mode:'none'|'pull'|'release'|'after'|'film'|'fuse';t:number};
type CallResult={right:boolean;pts:number;timeout:boolean;pick:number|null};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced(),timed=!reduced;
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),pressApi=useRef<PressApi>(null),pitchApi=useRef<PitchApi>(null),readRef=useRef<HTMLSpanElement>(null);
 const [phase,setPhase]=useState<Phase>('intro');
 const [cards,setCards]=useState<SortCard[]>(()=>pressRound(rng(1863))),[ci,setCi]=useState(0),[pressRes,setPressRes]=useState<boolean[]>([]);
 const [calls,setCalls]=useState<RefCall[]>(()=>makeRound(1863,MATCH_N)),[mi,setMi]=useState(0),[callRes,setCallRes]=useState<CallResult[]>([]);
 const [die,setDieS]=useState<Die>('kept'),[best,setBest]=useState(0),[checked,setChecked]=useState(false),[games,setGames]=useState(0);
 const ps=useRef<PressState>(pressInit()),mv=useRef<MatchView>({event:calls[0].event,era:calls[0].era,t:0,fuse:null,answered:false});
 const anim=useRef<Anim>({mode:'none',t:0}),flash=useRef(0),callT0=useRef(0),streak=useRef(0);
 const said=useRef('');const say=(t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;};
 useEffect(()=>{setBest(readBest());},[]);
 const inMatch=phase==='call'||phase==='called'||(phase==='score'&&callRes.length>0);
 const draw=()=>{pressApi.current?.draw();pitchApi.current?.draw();};

 // ── press ──
 const card=cards[Math.min(ci,cards.length-1)];
 const loadCard=(k:number,list=cards)=>{const s=ps.current;s.card=list[k];s.pull=0;s.stamped=null;s.slide=0;setCi(k);setPhase('press');say(`LAW ${k+1}/${list.length} · PULL`);draw();};
 const setDie=(d:Die)=>{if(phase!=='press'||anim.current.mode!=='none'||ps.current.stamped)return;unlockMuseumAudio();ps.current.die=d;setDieS(d);museumSfx.tick();draw();};
 const stamp=()=>{const s=ps.current;if(s.stamped||!s.card)return;s.pull=1;s.stamped=s.die;museumSfx.stamp();flash.current=1;anim.current={mode:'after',t:0};say('STAMPED!');loop.wake();};
 const finishStamp=()=>{const s=ps.current,d=s.stamped!;s.stacks[d]++;const right=truthOf(s.card!)===d;s.card=null;s.slide=0;
  setPressRes(r=>{const n=[...r];n[ci]=right;return n;});right?museumSfx.reveal():museumSfx.look();say(right?`+${PRESS_PTS}`:'+0');setPhase('stamped');};
 const pullButton=()=>{if(phase!=='press'||anim.current.mode!=='none'||ps.current.stamped)return;unlockMuseumAudio();anim.current={mode:'pull',t:0};loop.wake();};
 const nextCard=()=>{if(ci+1<cards.length)loadCard(ci+1);else{setPhase('between');museumSfx.whistle();say('KICK-OFF');}};
 // Drag the lever: down (and a little right) pulls it; let go early and it springs back up.
 const drag=useRef<{y:number;x:number;pull:number;id:number}|null>(null);
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(phase!=='press'||anim.current.mode!=='none'||ps.current.stamped)return;unlockMuseumAudio();
  drag.current={x:e.clientX,y:e.clientY,pull:ps.current.pull,id:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const s=ps.current;if(s.stamped)return;
  const P=pressApi.current?.proj(),span=P?64*scaleOf(P):160;s.pull=clamp(d.pull+((e.clientY-d.y)+(e.clientX-d.x)*.25)/span,0,1);say(`PULL ${Math.round(s.pull*100)}%`);
  if(s.pull>=1){drag.current=null;stamp();}else draw();};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;const s=ps.current;
  if(!s.stamped&&s.pull>0){anim.current={mode:'release',t:0};loop.wake();}};

 // ── match ──
 const call=calls[Math.min(mi,calls.length-1)];
 const [filmDone,setFilmDone]=useState(false);
 const loadCall=(k:number,list=calls)=>{const rc=list[k],f=FILMS[rc.event.id];
  mv.current={event:rc.event,era:rc.era,t:reduced?f.T:0,fuse:reduced?null:1,answered:false};setMi(k);setPhase('call');setFilmDone(reduced);
  say(`${rc.era==='1863'?'1863':'TODAY'} · CALL ${k+1}/${list.length}`);
  if(!reduced){anim.current={mode:'film',t:0};museumSfx.kick();loop.wake();}else{callT0.current=performance.now();draw();}};
 const answer=(pick:number|null)=>{if(phase!=='call'||mv.current.answered)return;const v=mv.current,rc=call;
  if(anim.current.mode==='film'&&pick!=null)return;
  const ms=timed?performance.now()-callT0.current:null;
  anim.current={mode:'none',t:0};loop.stop();v.answered=true;v.t=FILMS[rc.event.id].T;
  const right=pick!=null&&pick===rc.event.answer[rc.era],pts=callPoints(right,timed&&pick!=null?ms:null,streak.current);
  streak.current=right?streak.current+1:0;right?museumSfx.reveal():museumSfx.look();say(right?`+${pts}`:pick==null?'TIME!':'+0');
  setCallRes(r=>{const n=[...r];n[mi]={right,pts,timeout:pick==null,pick};return n;});setPhase('called');draw();};
 const scored=useRef(false);
 const nextCall=()=>{if(mi+1<calls.length){loadCall(mi+1);return;}
  if(!scored.current){scored.current=true;const total=pressPts+matchPts;if(total>best){setBest(total);writeBest(total);}museumSfx.crowd();}setPhase('score');};

 // ── the one loop: press motion, films, the stopwatch ──
 const loop=usePaperLoop(dt=>{const a=anim.current,s=ps.current;a.t+=dt;
  if(flash.current>0)flash.current=Math.max(0,flash.current-dt*2.4);
  if(a.mode==='pull'){s.pull=Math.min(1,a.t/.4);if(s.pull>=1){stamp();}draw();return true;}
  if(a.mode==='release'){s.pull=Math.max(0,s.pull-dt*2.8);draw();if(s.pull<=0){a.mode='none';say('PULL');return false;}return true;}
  if(a.mode==='after'){s.pull=Math.max(0,1-Math.max(0,a.t-.12)/.4);s.slide=clamp((a.t-.4)/.75,0,1);draw();
   if(a.t>=1.2){a.mode='none';flash.current=0;finishStamp();draw();return false;}return true;}
  if(a.mode==='film'){const T=FILMS[mv.current.event.id].T;mv.current.t=Math.min(T,a.t);draw();
   if(a.t>=T){a.mode='fuse';a.t=0;callT0.current=performance.now();setFilmDone(true);}return true;}
  if(a.mode==='fuse'){const left=1-a.t*1000/CALL_MS;mv.current.fuse=Math.max(0,left);say(`TIME ${Math.max(0,CALL_MS/1000-a.t).toFixed(1)}`);draw();
   if(left<=0){a.mode='none';answer(null);return false;}return true;}
  a.mode='none';if(flash.current>0){draw();return true;}return false;},stageRef,reduced);

 const again=()=>{const r=rng(Date.now()),pc=pressRound(r),rc=makeRound(Date.now(),MATCH_N);scored.current=false;streak.current=0;
  ps.current=pressInit();setCards(pc);setCalls(rc);setPressRes([]);setCallRes([]);setGames(n=>n+1);setMi(0);setDieS('kept');loadCard(0,pc);};

 const onKey=(e:KeyboardEvent<HTMLElement>)=>{const k=e.key,btn=e.target instanceof HTMLButtonElement;
  if(k==='Escape'){e.preventDefault();onClose();return;}
  if(phase==='press'){if(k==='ArrowLeft'){e.preventDefault();setDie('kept');}else if(k==='ArrowRight'){e.preventDefault();setDie('changed');}else if((k===' '||k==='Enter')&&!btn){e.preventDefault();pullButton();}}
  else if(phase==='call'&&filmDone&&(k==='1'||k==='2')){e.preventDefault();answer(Number(k)-1);}
  else if((k===' '||k==='Enter')&&!btn){if(phase==='stamped'){e.preventDefault();nextCard();}else if(phase==='called'){e.preventDefault();nextCall();}else if(phase==='between'){e.preventDefault();loadCall(0);}}};

 const pressRight=pressRes.filter(Boolean).length,pressPts=pressRight*PRESS_PTS;
 const matchRight=callRes.filter(r=>r?.right).length,matchPts=callRes.reduce((n,r)=>n+(r?.pts??0),0);
 const maxAll=PRESS_N*PRESS_PTS+maxRound(MATCH_N,timed);
 const lastPress=phase==='stamped'?pressRes[ci]:null,lastCall=phase==='called'?callRes[mi]:null;
 const banner=phase==='stamped'&&card?<Banner kind={lastPress?'good':'bad'} big={lastPress?`Right! +${PRESS_PTS}`:'Not quite'} line={card.now}/>
  :phase==='called'&&lastCall?<Banner kind={lastCall.right?'good':lastCall.timeout?'ok':'bad'} big={lastCall.right?`Right call +${lastCall.pts}`:lastCall.timeout?'Time!':'Wrong call'}
    line={<>{call.era==='1863'?'In 1863':'Today'}: {call.event.why[call.era]}</>}/>
  :phase==='between'?<Banner kind="info" big="Kick-off" line={<>{pressRight} of {cards.length} rules sorted. {pressVerdict(pressRight,cards.length)} Now referee a match: some moments use the Laws of 1863, some today’s.</>}/>:null;
 const note=phase==='press'&&card?<><span className={s.tag}>{card.law}</span>{card.then} <b>Still a rule today, or changed?</b></>
  :phase==='call'?<><span className={s.tag} data-tone="acc">{call.era==='1863'?'Laws of 1863':'Today’s Laws'}</span>{call.event.text}</>:null;
 const pressPips=cards.map((_,i)=>pressRes[i]==null?undefined:pressRes[i]?'good':'miss');
 const callPips=calls.map((_,i)=>callRes[i]==null?undefined:callRes[i].right?'good':'miss');
 const [top,setTop]=useState(40),bottom=40;
 useEffect(()=>{setTop(noteSpace(cardRef.current));},[phase,ci,mi,box.w,box.h,cardRef]);

 const cover=phase==='intro'?<Intro kicker="London · 1863" title={<>Write the <em>first Laws</em>.</>} deck={exhibit.facts[0]} beats={BEATS} onStart={()=>{unlockMuseumAudio();loadCard(0);}} startLabel="To the press ▸"/>
  :phase==='score'?<ScoreCover kicker="Full time · the press and the match" score={pressPts+matchPts} unit={`of ${maxAll} points${best?` · best ${best}`:''}`}
    notes={<><p><b>The press: {pressRight} of {cards.length}.</b> {pressVerdict(pressRight,cards.length)}</p>
     <p><b>The match: {matchRight} of {calls.length}.</b> {matchVerdict(matchRight,calls.length)}</p>
     <p><b>Since 1886</b> the IFAB has looked after the Laws, so a game is played the same way all over the world.</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-again onClick={again}>Play again</button></>}>
    <StepCheck key={games} items={CHECKS} kicker={(i,n)=>`Quick check · ${i+1} of ${n}`} onPick={ok=>ok?museumSfx.stamp():museumSfx.look()} onDone={()=>setChecked(true)}
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<svg viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="3" fill="none" stroke={ACCENT} strokeWidth="2"/><path d={GLYPH.kept} transform="translate(10 11) scale(2)" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round"/></svg>}
      seen="You stamped the first Laws and refereed 1863 against today." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const fig=inMatch?(call.era==='1863'?'1863':'TODAY'):'1863';
 const title=inMatch?'Ref the match':'The rule press';
 const hint=phase==='press'||phase==='stamped'?'Tap a tray · drag the lever down':inMatch?(reduced?'Read the board · make the call':'Watch · call it before the watch runs out'):'Stamp the rules · ref the match';
 const stageLabel=inMatch||phase==='between'&&mi>0?`A table-top pitch refereed by the ${call.era==='1863'?'Laws of 1863: two posts with flags, no crossbar, no net, no lines':'Laws of today: a goal with a crossbar and net, and the lines'}. ${call.event.text}`
  :`A cast-iron rule press with a law card on its bed, a ✓ tray for rules still in force and a ✗ tray for rules that changed. The die is set to ${die==='kept'?'✓ still a rule':'✗ changed'}. ${card.then}`;

 return <PaperRoom id="laws-1863" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}: the rule press and the 1863 match`} onClose={onClose} onKeyDown={onKey}
  rootProps={{'data-phase':phase,'data-era':inMatch?call.era:'1863','data-card':phase==='press'||phase==='stamped'?card.id:undefined,'data-call':inMatch?call.event.id:undefined,
   'data-result':phase==='stamped'?(lastPress?'right':'wrong'):phase==='called'&&lastCall?(lastCall.right?'right':'wrong'):undefined,'data-points':pressPts+matchPts,'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Freemasons’ Tavern, London</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note={inMatch?"right":""} fig={`Fig. ${fig}`} title={title} hint={hint} readout="PULL" readoutRef={readRef} note={note} banner={banner} cover={cover}>
   <div ref={stageRef} className={s.stage} tabIndex={0} role="application" aria-label={stageLabel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
    data-stage={inMatch?'pitch':'press'} style={{cursor:phase==='press'?'grab':undefined}}>
    {inMatch?<Pitch ref={pitchApi} w={box.w} h={box.h} view={mv.current} top={top} bottom={bottom}/>
     :<Press ref={pressApi} w={box.w} h={box.h} state={ps.current} flash={flash} onTray={setDie} top={top} bottom={bottom}/>}
   </div>
  </PaperCard>}
  dock={phase==='intro'||phase==='score'?null:<>
   <div className={s.row}>
    <Pips results={inMatch?callPips:pressPips} total={inMatch?calls.length:cards.length} label={inMatch?`${callRes.length} of ${calls.length} calls`:`${pressRes.length} of ${cards.length} rules stamped`}/>
    <span className={s.grow}><Chips items={[{k:'press',label:'Rules',value:`${pressRight}/${cards.length}`},{k:'match',label:'Match',value:matchPts},{k:'streak',label:'Streak',value:streak.current}]}/></span>
   </div>
   <div className={s.row}>
    {phase==='press'&&<>
     <button type="button" className={die==='kept'?s.btn:s.ghost} data-tone={die==='kept'?'acc':undefined} aria-pressed={die==='kept'} data-die="kept" onClick={()=>setDie('kept')}>✓ Still a rule</button>
     <button type="button" className={die==='changed'?s.btn:s.ghost} data-tone={die==='changed'?'acc':undefined} aria-pressed={die==='changed'} data-die="changed" onClick={()=>setDie('changed')}>✗ Changed</button>
     <button type="button" className={s.btn} data-pull onClick={pullButton}>Pull the lever ▼</button></>}
    {phase==='stamped'&&<button type="button" className={s.btn} data-tone="acc" data-next onClick={nextCard}>{ci+1<cards.length?'Next law ▸':'To the match ▸'}</button>}
    {phase==='between'&&<button type="button" className={s.btn} data-tone="acc" data-next data-kickoff onClick={()=>loadCall(0)}>Kick off ▸</button>}
    {phase==='call'&&call.event.options.map((o,j)=><button key={j} type="button" className={j?s.ghost:s.btn} data-option={j} disabled={!filmDone} onClick={()=>answer(j)}>
     {o}<span className={s.srOnly}> (key {j+1})</span></button>)}
    {phase==='call'&&!filmDone&&<span className={s.say}>Watch the moment…</span>}
    {phase==='called'&&<button type="button" className={s.btn} data-tone="acc" data-next onClick={nextCall}>{mi+1<calls.length?'Next moment ▸':'Full time ▸'}</button>}
   </div>
  </>}>
  <section className={g.section} aria-labelledby="laws-wall">
   <p className={g.kicker}>{exhibit.year} · Freemasons’ Tavern, London</p>
   <h2 id="laws-wall" className={g.h2}>Thirteen Laws, so everyone could play the same game</h2>
   <ol className={g.steps}>{exhibit.facts.map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
   <ul className={g.steps}>{MILESTONES.map(m=><li key={m.year}><span>{yearLabel(m.year)}</span><p className={g.body}>{m.headline}</p></li>)}</ul>
   <p className={g.body}><b>Since 1886</b> the IFAB has looked after the Laws.</p>
   <p className={g.small}>Take it to your game: {exhibit.forYourGame} The 1863 rules in the game quote the FA’s first printed Laws in short; the match moments are made-up and judged by the Laws of each time. The machines are drawings made for this museum.</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{[...LAW_SOURCES,...SORT_SOURCES,...exhibit.sources].filter((x,i,a)=>a.findIndex(y=>y.url===x.url)===i).map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}
