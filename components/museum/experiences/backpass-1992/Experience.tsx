'use client';
import {useEffect,useMemo,useRef,useState,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import {Corners,Items,PaperDefs,Parts,Room,Shadow,Sheet,useBox,useFrames} from '../anatomy/PaperStage';
import s from '../anatomy/PaperStage.module.css';
import {CLOCK_END,CROWD_MAX,STEP_HOLD,clockText,flowWord} from './board';
import {BALLS,BEST_KEY,combo,current,free,onlyLong,outcomeText,pressMs,verdict,type Choice,type Outcome} from './pressRules';
import {CALLS,EXTRA_SOURCES,FICTION_NOTE,HISTORY} from './content';
import {aimFrom,decide,holdFor,kickBack,newBP,rollOut,settle,stepBP,type BP,type V} from './model';
import {actorItems,benchParts,cameraFor,figureAt,floorAt} from './scene';
import b from './Experience.module.css';

/**
 * backpass-1992 · "The back-pass rule" (Oct 12 2026 anatomy Paper rebuild; user: only the penalty kick stays pixel; every other
 * exhibit is an isometric technical illustration in the Paper theme, LARGE, filling the screen, a mini-game the child ACTS in).
 * A bench model of your penalty area (scene.ts): goal and net, a stand of paper fans, the stadium clock, paper players.
 *  1. Story sheet (1990: 2.21 goals a game; Bonner's six minutes; the 1992 law).
 *  2. KILL THE CLOCK · 1990 rules (board.ts): you lead 1–0 at 88:00. Kick it back, the keeper picks it up; HOLD the button and
 *     the stadium clock runs while nobody may tackle, and the fans in the stand nod off. Roll it out and do it again. 90:00: you
 *     won, and nobody played football.
 *  3. The 1992 rule sheet (the case's first fact).
 *  4. BEAT THE PRESS · 1992 rules (pressRules.ts): eight balls come back KICKED (red ring: feet only) or HEADED (green ring:
 *     hands allowed). Their 9 runs at the keeper. Drag from the keeper to the free team-mate, drag up the pitch to boot it
 *     long, or tap the keeper to pick it up. Points for a good choice made fast, a combo for keeping it going.
 *  5. Full-time sheet (your 1990 clock and your 1992 points) and a quick check, then the ending: onComplete once.
 * Heat: one frame loop (anatomy/paper-loop.ts useFrames) runs only while the ball or a player moves, while you hold, and while their 9 runs;
 * it pauses off-screen and is cancelled on unmount. Reduced motion: HOLD is a tap worth STEP_HOLD match seconds, their 9 never
 * arrives (turn-based, no speed bonus), every move lands at once.
 */
type Phase='intro'|'r1'|'rule'|'r2'|'score';
const BEATS=[
 {when:'1990 · World Cup, Italy',head:'2.21 goals a game',text:HISTORY[0].text},
 {when:'1990 · Ireland v Egypt',head:'Six minutes',text:HISTORY[1].text},
 {when:'1992 · The new law',head:'Feet only',text:'A ball a team-mate KICKS back to the keeper on purpose may not be picked up. Headers are still fine: the law is about kicks.'},
] as const;
const Q=CALLS[0],CHECK={q:Q.q,options:Q.options,right:Q.answer,why:Q.why};
const WORD:Record<Outcome,{kind:'good'|'ok'|'bad';big:string}>={pass:{kind:'good',big:'Good feet'},catch:{kind:'good',big:'Caught'},long:{kind:'ok',big:'Booted'},
 intercepted:{kind:'bad',big:'Cut out'},freeKick:{kind:'bad',big:'Free kick'},stolen:{kind:'bad',big:'Too slow'}};
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const saveBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');
 const st=useRef<BP>(newBP('r1',1,reduced));
 const [tick,setTick]=useState(0);const bump=()=>setTick(t=>t+1);
 const aimTo=useRef<V|null>(null),downAt=useRef<{x:number;y:number}|null>(null);
 const [holding,setHolding]=useState(false);
 const [r1,setR1]=useState<{held:number;flow:number}|null>(null);
 const [best,setBest]=useState(0);useEffect(()=>{setBest(readBest());},[]);
 const [checked,setChecked]=useState(false);const completed=useRef(false);
 const readout=useRef<HTMLSpanElement>(null),say=(t:string)=>{if(readout.current)readout.current.textContent=t;};
 const [boxRef,box]=useBox<HTMLDivElement>();

 const lastSeen=useRef({step:'',phase:'',i:0,clock:0});
 const loop=useFrames(dt=>{const bp=st.current,more=stepBP(bp,dt),L=lastSeen.current;
  if(bp.mode==='r1'){say(`${clockText(bp.game.clock)} · ${flowWord(bp.game.crowd).toUpperCase()}`);
   if(Math.floor(bp.game.clock/5)!==Math.floor(L.clock/5))sfx(museumSfx.tick);L.clock=bp.game.clock;
   if(bp.game.step==='fullTime'&&L.step!=='fullTime'){sfx(museumSfx.whistle);setHolding(false);bp.holding=false;setR1({held:Math.round(bp.game.held),flow:bp.game.crowd});}}
  else{const r=current(bp.press);if(bp.phase==='decide'&&r)say(`${r.kind==='kick'?'KICKED · FEET ONLY':'HEADED · HANDS OK'}${reduced?'':` · ${Math.max(0,(pressMs(bp.press)-bp.ms)/1000).toFixed(1)} S`}`);
   if(bp.phase==='outcome'&&L.phase!=='outcome'&&bp.outcome){const o=bp.outcome;sfx(o==='pass'||o==='catch'?museumSfx.net:o==='long'?museumSfx.kick:o==='freeKick'?museumSfx.whistle:museumSfx.look);}
   if(bp.phase==='over'&&L.phase!=='over')finishPress();}
  L.step=bp.game.step;L.phase=bp.phase;L.i=bp.press.i;bump();return more;},boxRef);

 const finishPress=()=>{const sc=st.current.press.score;if(sc>best){saveBest(sc);setBest(sc);}setPhase('score');sfx(museumSfx.reveal);};
 const go=()=>{if(reduced){settle(st.current);if(st.current.phase==='over')finishPress();bump();return;}loop.wake();};

 // ── Round 1 ──
 const doKickBack=()=>{unlockMuseumAudio();if(kickBack(st.current)){sfx(museumSfx.kick);bump();go();}};
 const doRollOut=()=>{if(rollOut(st.current)){sfx(museumSfx.kick);bump();go();}};
 const holdDown=(e:RPointerEvent<HTMLButtonElement>)=>{if(reduced||st.current.game.step!=='held')return;unlockMuseumAudio();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  st.current.holding=true;setHolding(true);loop.wake();};
 const armed=useRef(false);
 const holdUp=()=>{if(!st.current.holding)return;st.current.holding=false;setHolding(false);bump();};
 const holdTap=()=>{if(!reduced||st.current.game.step!=='held')return;holdFor(st.current,STEP_HOLD/10);sfx(museumSfx.tick);
  if((st.current.game.step as string)==='fullTime'){sfx(museumSfx.whistle);setR1({held:Math.round(st.current.game.held),flow:st.current.game.crowd});}bump();};
 const holdKey=(e:RKeyboardEvent<HTMLButtonElement>,down:boolean)=>{if(reduced||(e.key!==' '&&e.key!=='Enter'))return;e.preventDefault();
  if(down){if(!e.repeat&&st.current.game.step==='held'){st.current.holding=true;setHolding(true);loop.wake();}}else holdUp();};

 // ── Round 2: drag from the keeper to aim, tap a player, keys, buttons ──
 const choose=(c:Choice)=>{const o=decide(st.current,c);if(!o)return;aimTo.current=null;bump();go();};
 const P=useMemo(()=>cameraFor(box.w||1,box.h||1),[box.w,box.h]);
 const local=(e:RPointerEvent<SVGSVGElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const onDown=(e:RPointerEvent<SVGSVGElement>)=>{if(phase!=='r2'||st.current.phase!=='decide'||e.button>0)return;unlockMuseumAudio();downAt.current=local(e);try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}};
 const onMove=(e:RPointerEvent<SVGSVGElement>)=>{const d=downAt.current;if(!d)return;const p=local(e);if(Math.hypot(p.x-d.x,p.y-d.y)<8)return;aimTo.current=floorAt(P,p.x,p.y);bump();};
 const onUp=(e:RPointerEvent<SVGSVGElement>,cancel=false)=>{const d=downAt.current;downAt.current=null;const a=aimTo.current;aimTo.current=null;if(!d||cancel){bump();return;}
  const p=local(e);if(Math.hypot(p.x-d.x,p.y-d.y)<8){const id=figureAt(act?.figs??[],P,d.x,d.y,Math.max(34,box.w*.03));if(id==='K')choose('hands');else if(id==='L'||id==='R')choose(id);bump();return;}
  const c=a?aimFrom(st.current,a):null;if(c)choose(c);else bump();};
 const onKey=(e:RKeyboardEvent)=>{const k=e.key,btn=e.target instanceof HTMLButtonElement;
  if(phase==='r2'){const m:Record<string,Choice>={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'long',ArrowDown:'hands'};if(m[k]){e.preventDefault();choose(m[k]);return;}}
  if((k===' '||k==='Enter')&&!btn&&phase==='r1'){e.preventDefault();if(st.current.game.step==='start')doKickBack();else if(st.current.game.step==='held'&&reduced)holdTap();}};

 const startR2=()=>{unlockMuseumAudio();st.current=newBP('r2',Date.now()%100000,reduced);aimTo.current=null;setPhase('r2');sfx(museumSfx.card);go();};
 const again=()=>{st.current=newBP('r1',1,reduced);setR1(null);setChecked(false);setPhase('r1');};
 useEffect(()=>{if(phase==='r1')say('88:00 · STEADY');},[phase]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{st.current.reduced=reduced;},[reduced]);
 useEffect(()=>{if(!reduced)return;const bp=st.current;
  if(phase==='r1')say(`${clockText(bp.game.clock)} · ${flowWord(bp.game.crowd).toUpperCase()}`);
  else if(phase==='r2'){const r=current(bp.press);say(bp.phase==='outcome'&&bp.outcome?WORD[bp.outcome].big.toUpperCase():r?(r.kind==='kick'?'KICKED · FEET ONLY':'HEADED · HANDS OK'):'FULL TIME');}},[tick,phase,reduced]);// eslint-disable-line react-hooks/exhaustive-deps
 // The real end: both rounds played AND the quick check answered (the ending shows). Gold stamp, once.
 const finish=()=>{if(!completed.current){completed.current=true;onComplete?.();}};
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...EXTRA_SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 const bp=st.current,gm=bp.game,Pr=bp.press,rally=current(Pr),fullTime=gm.step==='fullTime';
 const bench=box.w?benchParts(bp,P):[],act=box.w?actorItems(bp,P,aimTo.current):null;
 const lastEntry=Pr.log.at(-1),showOutcome=phase==='r2'&&bp.phase==='outcome'&&bp.outcome;
 const banner=showOutcome&&bp.outcome?{...WORD[bp.outcome],line:lastEntry?`${outcomeText[lastEntry.outcome]} ${lastEntry.points>0?`+${lastEntry.points}`:lastEntry.points<0?String(lastEntry.points):''}`:''}
  :phase==='r1'&&fullTime?{kind:'ok' as const,big:'Full time',line:'1–0 · and zero football'}:null;
 const label=phase==='r2'?`Your penalty area, 1992 rules. Ball ${Math.min(Pr.i+1,BALLS)} of ${BALLS}: ${rally?.kind==='kick'?'kicked back, feet only':'headed back, hands allowed'}. Their 9 presses your keeper.`
  :`Your penalty area, 1990 rules. ${clockText(gm.clock)}, you lead 1–0. ${gm.step==='held'?'Your keeper holds the ball.':'Your number 4 has the ball.'}`;

 const stage=<div className={b.stage} ref={boxRef}>
  {box.w>0&&<svg className={`iso-svg ${s.svg}`} viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h} tabIndex={0} role="img" aria-label={label} data-bp-pitch
   onPointerDown={onDown} onPointerMove={onMove} onPointerUp={e=>onUp(e)} onPointerCancel={e=>onUp(e,true)}>
   <PaperDefs id="bp"/>
   <Parts parts={bench} id="bp"/>
   {act?.ring&&<g data-bp-ring={act.ring.ok?'hands':'feet'}>
    <path d={act.ring.d} fill={act.ring.ok?'#1f8a5b22':'#e4322b1f'} stroke={act.ring.ok?'#1f8a5b':'#e4322b'} strokeWidth="1.6"/>
    <path d={act.ring.d2} fill="none" stroke={act.ring.ok?'#1f8a5b':'#e4322b'} strokeWidth=".8"/></g>}
   {act&&<>{act.shadows.map((h,i)=><Shadow key={i} id="bp" {...h}/>)}<Items items={act.items}/></>}
   {act?.aim&&<g data-bp-aim><path d={act.aim.d} fill="none" stroke={act.aim.ok?'var(--accent)':'#76766f'} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 6"/>
    {act.aim.target&&<path d={act.aim.target} fill="none" stroke="var(--accent)" strokeWidth="1.6"/>}</g>}
  </svg>}
  {banner&&<div className={b.banner} data-kind={banner.kind} role="status"><b>{banner.big}</b><span>{banner.line}</span></div>}
  <Corners fig={`Fig. ${exhibit.year}`} title={phase==='r2'||phase==='rule'?'Beat the press · 1992':'Kill the clock · 1990'}
   hint={phase==='r2'?(reduced?'Drag, tap or use the buttons':'Drag from the keeper · tap him for hands'):reduced?`Tap Hold: ${STEP_HOLD} match seconds`:'Kick it back, then HOLD'} readoutRef={readout} readout="88:00"/>
  {phase==='intro'&&<Sheet label="The story" wide>
   <p className={s.kicker}>Real history · {exhibit.year}</p>
   <h2 className={s.big}>Kill the clock, then <em>beat the press</em>.</h2>
   <p className={s.lead}>{exhibit.facts[1]}</p>
   <ol className={s.beats}>{BEATS.map(x=><li key={x.head}><span>{x.when}</span><p style={{margin:0}}><b>{x.head}.</b> {x.text}</p></li>)}</ol>
   <div className={s.buttons} style={{justifyContent:'flex-start'}}><button type="button" className={s.btn} data-accent data-bp-start onClick={()=>{unlockMuseumAudio();setPhase('r1');}}>Play the 1990 rules ▸</button></div>
  </Sheet>}
  {phase==='rule'&&<Sheet label="The 1992 rule">
   <p className={s.kicker}>1992 · The new law</p>
   <h2 className={s.big}>A kicked back-pass is for <em>feet only</em>.</h2>
   <p className={s.lead}>{exhibit.facts[0]}</p>
   <ul className={b.rules}><li><i data-ring="feet"/><span><b>Kicked back</b> on purpose: feet only. Red ring.</span></li><li><i data-ring="hands"/><span><b>Headed or chested</b> back: hands allowed. Green ring.</span></li>
    <li><i data-ring="whistle"/><span><b>Handle a kicked one:</b> {HISTORY[3].text.replace(/^If a keeper handles a ball a team-mate deliberately kicked back, /,'')}</span></li></ul>
   <div className={s.buttons} style={{justifyContent:'flex-start'}}><button type="button" className={s.btn} data-accent data-museum-own-cue data-bp-start-press onClick={startR2}>Beat the press ▸</button></div>
  </Sheet>}
  {phase==='score'&&<Sheet label="Full time" wide>
   <p className={s.kicker}>Full time · {BALLS} balls</p>
   <div className={s.score}><b>{Pr.score}</b><span>points · {verdict(Pr.score)}</span></div>
   <p className={s.note}><b>1990:</b> {r1?`${r1.held} seconds in the keeper’s hands. Football: ${flowWord(r1.flow)}.`:'The keeper held it and the clock ran.'} <b>1992:</b> {Pr.log.filter(e=>e.outcome==='pass').length} passes with the feet, {Pr.log.filter(e=>e.outcome==='catch').length} headers caught. Best: {Math.max(best,Pr.score)}.</p>
   <p className={s.note}><b>{exhibit.facts[1]}</b> {exhibit.facts[2]}</p>
   {!checked?<StepCheck items={[CHECK]} kicker={()=>'Quick check'} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} doneLabel="Finish" onDone={()=>setChecked(true)}/>
    :<Ending reached onComplete={finish} art={<svg className={b.endArt} viewBox="0 0 120 90" aria-hidden="true"><g stroke="#3a3a37" strokeWidth=".8">
      <ellipse cx="60" cy="62" rx="44" ry="18" fill="#e4322b22" stroke="#e4322b" strokeWidth="1.6"/><ellipse cx="60" cy="62" rx="36" ry="14" fill="none" stroke="#e4322b"/>
      <circle cx="60" cy="50" r="10" fill="#f7f7f3"/><circle cx="57" cy="47" r="6" fill="#fbfbf8" stroke="none"/></g></svg>}
     seen={<>You’ve played both laws: the clock you could kill in 1990, and the feet you need since 1992.</>} take={exhibit.forYourGame}/>}
   <div className={s.buttons} style={{justifyContent:'flex-start'}}>
    <button type="button" className={s.btn} data-museum-own-cue data-bp-again onClick={startR2}>Beat the press again</button>
    <button type="button" className={s.ghost} onClick={again}>Play 1990 again</button></div>
  </Sheet>}
 </div>;

 const dock=phase==='r2'||phase==='score'?<>
  <p className={s.say} aria-live="polite">{showOutcome&&lastEntry?<><b>{outcomeText[lastEntry.outcome]}</b></>
   :rally?<>{rally.kind==='kick'?<><b>Kicked back:</b> feet only.</>:<><b>Headed back:</b> hands allowed.</>} {rally.marked==='both'?'Both team-mates are marked.':`Number ${free(rally)==='L'?7:8} is free.`} Drag from the keeper to pass or boot it, or tap him to pick it up.</>:'…'}</p>
  <div className={b.choices} role="group" aria-label="Your move">
   <button type="button" className={s.ghost} data-bp-choice="L" disabled={bp.phase!=='decide'} onClick={()=>choose('L')}>◀ Pass to 7</button>
   <button type="button" className={s.ghost} data-bp-choice="long" disabled={bp.phase!=='decide'} onClick={()=>choose('long')}>Boot it ▼</button>
   <button type="button" className={s.ghost} data-bp-choice="hands" disabled={bp.phase!=='decide'} onClick={()=>choose('hands')}>Hands</button>
   <button type="button" className={s.ghost} data-bp-choice="R" disabled={bp.phase!=='decide'} onClick={()=>choose('R')}>Pass to 8 ▶</button></div></>
 :<>
  <p className={s.say} aria-live="polite">{fullTime?<><b>Full time. You won 1–0.</b> {r1?.held??Math.round(gm.held)} seconds in the keeper’s hands, and nobody played football.</>
   :gm.step==='held'?<>1990 rules: he may pick it up and <b>nobody may tackle him</b>. {reduced?'Tap Hold to keep the ball.':'Press and HOLD to keep the ball.'} Watch the clock and the fans.</>
   :<>You lead 1–0 with two minutes to go. Your mission: run down the clock. <b>Kick it back</b> to your keeper.</>}</p>
  <div className={s.buttons}>
   {phase!=='r1'?null:fullTime?<button type="button" className={s.btn} data-accent data-bp-to-rule onPointerDown={()=>{armed.current=true;}} onClick={e=>{if(e.detail!==0&&!armed.current)return;/* the finger still pressing Hold at full time lifts over this button: not a click */armed.current=false;setPhase('rule');sfx(museumSfx.card);}}>The 1992 law ▸</button>
    :gm.step==='held'?<><button type="button" className={b.hold} data-holding={holding||undefined} data-bp-hold disabled={bp.phase==='incoming'} onPointerDown={holdDown} onPointerUp={holdUp} onPointerCancel={holdUp}
      onLostPointerCapture={holdUp} onClick={holdTap} onKeyDown={e=>holdKey(e,true)} onKeyUp={e=>holdKey(e,false)} onContextMenu={e=>e.preventDefault()}
      aria-label={reduced?`Hold the ball for ${STEP_HOLD} more match seconds`:'Hold the ball: press and hold'}>{holding?'Holding…':reduced?`Hold +${STEP_HOLD}s`:'Hold'}</button>
     <button type="button" className={s.ghost} data-bp-rollout onClick={doRollOut} disabled={holding||bp.phase==='incoming'}>Roll it out</button></>
    :<button type="button" className={s.btn} data-accent data-bp-kickback disabled={bp.phase==='incoming'} onClick={doKickBack}>Kick it back</button>}
  </div></>;

 const pips=Array.from({length:BALLS},(_,i)=>{const e=Pr.log[i];return e?e.outcome==='pass'||e.outcome==='catch'||(e.outcome==='long'&&onlyLong(Pr.rallies[i]))?'good':e.outcome==='long'?'ok':'miss':'';});
 const head=<><WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Laws of the Game</>}/>
  <div className={s.headStats} aria-label="Score">{phase==='r2'||phase==='score'?<>
   <span><b>{Pr.score}</b><i>Points</i></span><span><b>×{combo(Pr.streak)}</b><i>Combo</i></span><span><b className={b.pips}>{pips.map((p,i)=><u key={i} data-p={p||undefined}/>)}</b><i>{Pr.log.length} of {BALLS}</i></span></>
   :<><span><b>{clockText(gm.clock)}</b><i>Match clock</i></span><span><b>{flowWord(gm.crowd)}</b><i>Football</i></span><span><b>{Math.round(gm.held)} s</b><i>In his hands</i></span></>}</div></>;

 return <Room id="backpass-1992" label={`${exhibit.year} · ${exhibit.title}`} onClose={onClose} onKeyDown={onKey} accent="#e4322b" head={head} stage={stage} dock={dock}
  data={{'data-phase':phase,'data-step':phase==='r1'?gm.step:bp.phase,'data-ball':Pr.i,'data-score':Pr.score,'data-clock':Math.round(gm.clock),'data-result':bp.outcome??undefined,
   'data-kind':phase==='r2'?rally?.kind:undefined,'data-marked':phase==='r2'?rally?.marked:undefined,'data-reduced':reduced||undefined,'data-flow':Math.round(gm.crowd/CROWD_MAX*100),'data-clock-end':CLOCK_END}}>
  <p className={s.kicker}>Real history</p>
  <h2 className={s.h2}>Why keepers learned to use their feet</h2>
  <ol className={s.facts}>
   {exhibit.facts.map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p style={{margin:0}}>{f}</p></li>)}
   {HISTORY.map(h=><li key={h.text}><span>{h.year}</span><p style={{margin:0}}>{h.text}</p></li>)}
  </ol>
  <ol className={s.facts} aria-label="The ref’s calls">{CALLS.map((c,i)=><li key={c.q}><span>Call {i+1}</span><p style={{margin:0}}><b>{c.q}</b> {c.options[c.answer]}. {c.why}</p></li>)}</ol>
  <p className={s.note}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
  <p className={s.small}>{FICTION_NOTE} The pictures are paper models made for this museum.</p>
  <details className={s.sources}><summary>Sources</summary>
   <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
 </Room>;
}
