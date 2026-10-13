'use client';
import {useEffect,useMemo,useRef,useState,type KeyboardEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import {CASE_FACTS,CHECK,FIRSTS,LADDER,SOURCES,STORY_1966,STORY_TAGS,TWO_YELLOWS} from './content';
import {ROUND,judge,lampOf,makeRound,maxRound,verdictLine,type Card,type Moment,type Outcome} from './model';
import {actorItems,benchParts,cameraFor,contactOn,type View} from './scene';
import {Corners,Items,PaperDefs,Parts,Room,Shadow,Sheet,useBox,useFrames} from '../anatomy/PaperStage';
import s from '../anatomy/PaperStage.module.css';
import c from './cards.module.css';

/**
 * cards-1970 · "Ref at match speed" (Oct 12 2026 anatomy Paper rebuild; user: only the penalty kick stays pixel, every other
 * exhibit is an isometric technical illustration in the Paper theme, LARGE and filling the screen, a real mini-game; earlier:
 * "I can't tell what is a foul or not"). You are the referee at a table-top match model (scene.ts): a base plate on feet,
 * a turf deck, boards and Ken Aston's traffic light; the players are paper mannequins (figure.ts).
 *  1. Story sheet: London 1966, Rattín, Charlton, Ken Aston at the traffic lights.
 *  2. The game: six made-up moments (model.ts) play at match speed. Tap the pitch / Space / Whistle when you see a foul, or let
 *     a fair challenge run on. The film freezes and the contact replays slowly under a magnifier, with one line saying what to
 *     look at; show the card (none = free kick, yellow, red). The light lights your colour and the referee holds the card up.
 *     Points for speed and the right card; a best score is kept (BEST_KEY).
 *  3. Full time sheet: score, Law 12's ladder, a quick check, then the ending → onComplete (once, only then).
 * Heat: one frame loop (anatomy/paper-loop.ts useFrames) runs only while a film or a replay plays, pauses off-screen, is cancelled on
 * unmount. Reduced motion: no film. Each moment is shown frozen on its contact under the magnifier (turn-based): Whistle or
 * Play on, then the card.
 */
const BEST_KEY='futbol.museum.cards-1970.liveBest';
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const writeBest=(n:number)=>{try{localStorage.setItem(BEST_KEY,String(n));}catch{/* private mode: fine */}};
const HEADS=['The 1966 World Cup','Sent off, without words','A warning nobody heard','Red, yellow, green'];
type Phase='intro'|'ready'|'watch'|'card'|'verdict'|'score';
type Result={m:Moment;o:Outcome;card:Card|null;whistleAt:number|null};
const CARD_KEYS:{card:Card;label:string;sub:string;key:string}[]=[
 {card:'none',label:'No card',sub:'Free kick',key:'n'},
 {card:'yellow',label:'Yellow',sub:'Careful',key:'y'},
 {card:'red',label:'Red',sub:'Stop: off',key:'r'},
];
const REPLAY_FROM=.55,REPLAY_TO=.3,REPLAY_SPEED=.32,HOLD=.12;

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced(),timed=!reduced;
 const [round,setRound]=useState<Moment[]>(()=>makeRound(1970));
 const [idx,setIdx]=useState(0),[phase,setPhase]=useState<Phase>('intro'),[results,setResults]=useState<Result[]>([]);
 const [best,setBest]=useState(0),[games,setGames]=useState(0),[checked,setChecked]=useState(false);
 const m=round[Math.min(idx,round.length-1)],last=results[idx]&&phase==='verdict'?results[idx]:null;
 const view=useRef<View>({t:0,ref:'stand',lamp:null}),[,setT]=useState(0),whistleAt=useRef<number|null>(null),replay=useRef<number|null>(null);
 const done=useRef(false),cb=useRef(onComplete);cb.current=onComplete;
 const readout=useRef<HTMLSpanElement>(null),say=(t:string)=>{if(readout.current)readout.current.textContent=t;};
 useEffect(()=>{setBest(readBest());},[]);
 const [boxRef,box]=useBox<HTMLDivElement>();
 const mRef=useRef(m);mRef.current=m;const idxRef=useRef(idx);idxRef.current=idx;const phaseRef=useRef(phase);phaseRef.current=phase;
 const draw=()=>setT(x=>x+1);
 const setView=(p:Partial<View>)=>{view.current={...view.current,...p};draw();};

 // ── the one loop: the film (watch) or the slow replay (card) ──
 const loop=useFrames(dt=>{const v=view.current,mm=mRef.current;
  if(phaseRef.current==='watch'){v.t=Math.min(mm.T,v.t+dt);say(`PLAY ${v.t.toFixed(1)} S`);draw();if(v.t>=mm.T){resolve(null,null);return false;}return true;}
  if(phaseRef.current==='card'&&replay.current!=null){replay.current+=dt*REPLAY_SPEED;const end=mm.tc+REPLAY_TO;
   if(replay.current>=end){replay.current=null;v.t=mm.tc+HOLD;say('REPLAY · HELD ON THE CONTACT');draw();return false;}
   v.t=replay.current;say(`REPLAY ×${REPLAY_SPEED.toFixed(2)} · ${(v.t-mm.tc>=0?'+':'')}${(v.t-mm.tc).toFixed(2)} S`);draw();return true;}
  return false;},boxRef);

 const ready=(k:number,list:Moment[]=round)=>{const mm=list[k];whistleAt.current=null;replay.current=null;
  view.current=reduced?{t:mm.tc+HOLD,ref:'stand',lamp:null}:{t:0,ref:'stand',lamp:'green'};
  setIdx(k);setPhase('ready');say(`CALL ${k+1}/${list.length}`);draw();};
 const start=()=>{if(phase!=='ready'||reduced)return;museumSfx.kick();view.current={t:0,ref:'stand',lamp:'green'};setPhase('watch');phaseRef.current='watch';loop.wake();};
 const whistle=()=>{
  if(phase==='watch'){const t=view.current.t;loop.stop();whistleAt.current=t;museumSfx.whistle();
   if(!m.answer.whistle){resolve(t,null);return;}
   view.current={...view.current,ref:'whistle',lamp:null};replay.current=m.tc-REPLAY_FROM;view.current.t=replay.current;
   setPhase('card');phaseRef.current='card';say(`WHISTLE ${t-m.tc>=0?'+':''}${(t-m.tc).toFixed(2)} S`);loop.wake();draw();}
  else if(phase==='ready'&&reduced){whistleAt.current=m.tc;museumSfx.whistle();if(!m.answer.whistle){resolve(m.tc,null);return;}setView({ref:'whistle'});say('WHISTLE');setPhase('card');}};
 const playOn=()=>{if(phase==='ready'&&reduced)resolve(null,null);};
 const resolve=(wAt:number|null,card:Card|null)=>{const mm=mRef.current,o=judge(mm,wAt,card,timed);loop.stop();replay.current=null;
  const lit=card?lampOf(card):wAt==null?'green':null;
  view.current={t:mm.tc+HOLD,ref:card?'card':wAt!=null?'whistle':'stand',card:card??undefined,lamp:lit};
  if(card&&card!=='none')museumSfx.card();if(o.right)museumSfx.reveal();else museumSfx.look();
  say(o.points?`+${o.points}`:'+0');
  setResults(r=>{const n=[...r];n[idxRef.current]={m:mm,o,card,whistleAt:wAt};return n;});setPhase('verdict');phaseRef.current='verdict';draw();};
 const show=(card:Card)=>{if(phase!=='card')return;resolve(whistleAt.current,card);};
 const scored=useRef(false);
 const next=()=>{if(phase!=='verdict')return;if(idx+1<round.length){ready(idx+1);return;}
  if(!scored.current){scored.current=true;const total=results.reduce((a,r)=>a+(r?.o.points??0),0);if(total>best){setBest(total);writeBest(total);}museumSfx.crowd();}
  setPhase('score');};
 const again=()=>{const r=makeRound(Date.now());scored.current=false;setGames(g=>g+1);setChecked(false);setRound(r);setResults([]);ready(0,r);};
 const finish=()=>{if(!done.current){done.current=true;cb.current?.();}};

 const onKey=(e:KeyboardEvent)=>{const k=e.key.toLowerCase(),btn=e.target instanceof HTMLButtonElement;
  if((k===' '||k==='enter')&&!btn){e.preventDefault();if(phase==='ready')reduced?whistle():start();else if(phase==='watch')whistle();else if(phase==='verdict')next();return;}
  if(phase==='card'){const ck=CARD_KEYS.find(x=>x.key===k);if(ck){e.preventDefault();show(ck.card);}}
  if(phase==='ready'&&reduced&&k==='p'){e.preventDefault();playOn();}};

 // ── drawing ──
 const narrow=box.w>0&&box.w/box.h<=1.15,v=view.current,P=useMemo(()=>cameraFor(m,box.w||1,box.h||1),[m,box.w,box.h]);
 const bench=useMemo(()=>box.w?benchParts(m,v.lamp,P,narrow):[],[m,v.lamp,P,box.w,narrow]);
 const act=box.w?actorItems(m,v,P,narrow):null;
 const lensOn=phase==='card'||(reduced&&phase==='ready');
 const cp=contactOn(m,P),lr=Math.round(Math.min(box.w,box.h)*(box.w>700?.27:.25)),edge=box.w>600?28:16,lx=cp[0]>box.w*.5&&box.w>600?lr+edge:box.w-lr-edge,ly=lr+(box.w>600?46:40),zoom=box.w>700?2.4:2.1;

 const points=results.reduce((a,r)=>a+(r?.o.points??0),0),right=results.filter(r=>r?.o.right).length,early=results.filter(r=>r?.o.early).length;
 const banner=last?(last.o.right?{kind:'good',big:m.answer.whistle?'Right call':'Play on: right'}:last.o.wrongWhistle?{kind:'bad',big:'No foul there'}:last.o.missed?{kind:'bad',big:'Missed it'}:last.o.early?{kind:'ok',big:'Too early'}:{kind:'bad',big:'Wrong card'}):null;
 const lineFor=(r:Result)=>r.o.early?`You blew before the contact. ${r.m.verdict}`:r.m.verdict;
 const sayLine=phase==='ready'?<><span className={s.tag}>{idx+1}/{round.length}</span>{m.watch} {reduced?'Foul or fair? Whistle, or let it play on.':'Press Play, then blow the whistle the moment you see a foul.'}</>
  :phase==='watch'?<><b>Watch!</b> Tap the pitch (or press Space) to blow the whistle.</>
  :phase==='card'?<><b>Whistle!</b> {m.tell} Which card?</>
  :last?<><b>{last.m.law}.</b> {last.m.why}</>:phase==='intro'?<>Six moments. Whistle the fouls, let the fair ones run, show the right card.</>:null;
 const checkI=games%CHECK.length;

 const stage=<div className={c.stage} ref={boxRef}>
  {box.w>0&&<svg className={`iso-svg ${s.svg}`} viewBox={`0 0 ${box.w} ${box.h}`} width={box.w} height={box.h} tabIndex={0} role="img" data-cards-pitch
   aria-label={`A table-top pitch model. Number 9 in a white shirt attacks, number ${m.who===9?4:m.who} in a grey shirt defends, and you are the referee in dark grey. Ken Aston's traffic light stands beside the pitch. ${m.watch}`}
   onPointerDown={e=>{if(phase==='watch'&&e.button<=0){e.preventDefault();whistle();}}}>
   <PaperDefs id="cards"/>
   <defs><clipPath id="cards-lens"><circle cx={lx} cy={ly} r={lr}/></clipPath></defs>
   <g id="cards-world">
    <Parts parts={bench} id="cards"/>
    {act&&<>{act.shadows.map((h,i)=><Shadow key={i} id="cards" {...h}/>)}<Items items={act.items}/></>}
   </g>
   {lensOn&&<g data-cards-lens>
    <circle cx={cp[0]} cy={cp[1]} r={Math.max(16,lr/(zoom*1.9))} fill="none" stroke={m.contact.hit?'var(--accent)':'var(--anatomy-hi)'} strokeWidth="1.4" strokeDasharray={m.contact.hit?undefined:'1 4'} strokeLinecap="round"/>
    <circle cx={lx} cy={ly} r={lr+7} fill="#00000014" style={{filter:'blur(8px)'}}/>
    <g clipPath="url(#cards-lens)"><rect x={lx-lr} y={ly-lr} width={lr*2} height={lr*2} fill="var(--anatomy-card)"/>
     <use href="#cards-world" transform={`translate(${lx-cp[0]*zoom} ${ly-cp[1]*zoom}) scale(${zoom})`}/></g>
    <circle cx={lx} cy={ly} r={lr+3.5} fill="none" stroke="#f7f7f3" strokeWidth="7"/>
    <circle cx={lx} cy={ly} r={lr} fill="none" stroke="var(--anatomy-hi)" strokeWidth=".8"/>
    <circle cx={lx} cy={ly} r={lr+7} fill="none" stroke="var(--anatomy-hi)" strokeWidth=".8"/>
    {Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2,r0=lr+(i%4===0?.8:2.2),r1=lr+6;return <line key={i} x1={lx+Math.cos(a)*r0} y1={ly+Math.sin(a)*r0} x2={lx+Math.cos(a)*r1} y2={ly+Math.sin(a)*r1} stroke="var(--anatomy-lo)" strokeWidth=".6"/>;})}
   </g>}
  </svg>}
  {lensOn&&box.w>0&&<span className={c.lensCap} style={{left:lx,top:ly+lr+14}}>Replay ×{zoom}</span>}
  {banner&&last&&<div className={c.banner} data-kind={banner.kind} role="status"><b>{banner.big}</b><span>{lineFor(last)}</span></div>}
  <Corners fig={`Fig. ${exhibit.year}`} title="Ref at match speed" hint={phase==='watch'?'Tap the pitch to whistle':'9 white · 4 grey · you dark'} readoutRef={readout} readout="READY"/>
  {phase==='intro'&&<Sheet label="The story" wide>
   <p className={s.kicker}>1966 → 1970 · the cards</p>
   <h2 className={s.big}>Be the <em>referee</em>.</h2>
   <p className={s.lead}>{CASE_FACTS.aston}</p>
   <ol className={s.beats}>{STORY_1966.map((text,i)=><li key={i}><span>{STORY_TAGS[i]}</span><p style={{margin:0}}><b>{HEADS[i]}.</b> {text}</p></li>)}</ol>
   <p className={s.note}>The practice moments are made-up, acted by paper players: <b>number 9 wears white</b>, <b>number 4 grey</b>, and you referee in dark grey.</p>
   <div className={s.buttons} style={{justifyContent:'flex-start'}}><button type="button" className={s.btn} data-accent data-start onClick={()=>ready(0)}>Kick off ▸</button></div>
  </Sheet>}
  {phase==='score'&&<Sheet label="Full time" wide>
   <p className={s.kicker}>Full time · {round.length} calls</p>
   <div className={s.score}><b data-points={points}>{points}</b><span>of {maxRound(round.length)} points</span></div>
   <p className={s.note}><b>{right} of {round.length} right.</b> {verdictLine(right,round.length,early)}{best?` Best: ${best}.`:''}</p>
   <p className={s.note}><b>Law 12, in three steps.</b> {LADDER.map(l=>`${l.word}: ${l.card}.`).join(' ')} {TWO_YELLOWS}</p>
   <p className={s.note}><b>Why colours?</b> {CASE_FACTS.language} {CASE_FACTS.mexico}</p>
   {!checked?<StepCheck key={games} items={[CHECK[checkI]]} kicker={()=>'Quick check'} onPick={ok=>ok?museumSfx.reveal():museumSfx.look()} doneLabel="Finish" onDone={()=>setChecked(true)}/>
    :<Ending reached onComplete={finish} art={<svg className={c.endArt} viewBox="0 0 120 90" aria-hidden="true"><g stroke="#3a3a37" strokeWidth=".8" strokeLinejoin="round">
      <path d="M18 74 62 52 102 72 58 94Z" fill="#00000012" style={{filter:'blur(3px)'}}/>
      <path d="M30 20 58 8 66 58 38 70Z" fill="#f2c230"/><path d="M38 70 66 58 67.5 61 39.5 73Z" fill="#c99d1c"/>
      <path d="M56 26 84 14 92 64 64 76Z" fill="#e4322b"/><path d="M64 76 92 64 93.5 67 65.5 79Z" fill="#a8241f"/></g></svg>}
     seen={<>You’ve refereed at match speed, the way Ken Aston imagined it in 1966.</>} take={CASE_FACTS.forYourGame}/>}
   <div className={s.buttons} style={{justifyContent:'flex-start'}}>
    <button type="button" className={s.btn} data-museum-own-cue data-again onClick={again}>{ROUND} more calls</button>
    <button type="button" className={s.ghost} onClick={()=>setPhase('verdict')}>Look at the pitch</button></div>
  </Sheet>}
 </div>;

 const dock=<>
  <p className={s.say} aria-live="polite">{sayLine}</p>
  <div className={s.buttons}>
   {phase==='ready'&&!reduced&&<button type="button" className={s.btn} data-accent data-play onClick={start}>Play ▸</button>}
   {phase==='ready'&&reduced&&<><button type="button" className={s.btn} data-accent data-whistle onClick={whistle}>Whistle · foul</button>
    <button type="button" className={s.ghost} data-playon onClick={playOn}>Play on · fair</button></>}
   {phase==='watch'&&<button type="button" className={s.btn} data-accent data-whistle onClick={whistle}>Whistle!</button>}
   {phase==='verdict'&&<button type="button" className={s.btn} data-next onClick={next}>{idx+1<round.length?'Next call ▸':'Full time ▸'}</button>}
  </div>
  {phase==='card'&&<div className={c.cards} role="group" aria-label="Show a card">{CARD_KEYS.map(k=>
   <button key={k.card} type="button" className={c.cardBtn} data-card={k.card} data-museum-own-cue onClick={()=>show(k.card)}><i aria-hidden="true"/><span>{k.label}<small>{k.sub}</small></span></button>)}</div>}
 </>;

 return <Room id="cards-1970" label={`${exhibit.year} · ${exhibit.title}: ref at match speed`} onClose={onClose} onKeyDown={onKey} accent="#e4322b"
  data={{'data-phase':phase,'data-moment':m.id,'data-result':last?(last.o.right?'right':'wrong'):undefined,'data-points':points,'data-reduced':reduced||undefined}}
  head={<><WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · Mexico · Law 12</>}/>
   <div className={s.headStats} aria-label="Score"><span><b>{points}</b><i>Points</i></span><span><b>{right}/{results.filter(Boolean).length}</b><i>Right</i></span><span><b>{best}</b><i>Best</i></span></div></>}
  stage={stage} dock={dock}>
  <p className={s.kicker}>{exhibit.year} · Mexico</p>
  <h2 className={s.h2}>Yellow means careful, red means stop</h2>
  <ol className={s.facts}>{exhibit.facts.map((f,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p style={{margin:0}}>{f}</p></li>)}</ol>
  <ul className={c.list}>{FIRSTS.map(f=><li key={f}>{f}</li>)}</ul>
  <ul className={c.list}>{LADDER.map(l=><li key={l.call}><b>{l.word}</b>: {l.card}. {l.plain}</li>)}<li>{TWO_YELLOWS}</li></ul>
  <p className={s.small}>Take it to your game: {CASE_FACTS.forYourGame} The practice moments in the game are made-up, acted by paper players and judged by Law 12.</p>
  <Sources list={[...SOURCES,...exhibit.sources]}/>
 </Room>;
}

function Sources({list}:{list:readonly {title:string;url:string}[]}){const seen=new Set<string>();const l=list.filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));
 return <details className={s.sources}><summary>Sources</summary><ul>{l.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul></details>;}
