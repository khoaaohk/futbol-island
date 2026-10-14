'use client';
import StepIcon from '../StepIcon';
import {useCallback,useEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as RPointerEvent} from 'react';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {PaperRoom,PaperCard,Banner,Intro,ScoreCover,Pips,Chips,noteSpace,paper as s} from '../anatomy/PaperRoom';
import {useBox,local,toFloor} from '../anatomy/paper-kit';
import {usePaperLoop} from '../anatomy/paper-loop';
import {BANS,CHINA_1991,EDITIONS,FINAL_1991,QUIZ,SOURCES,TAKE_IT} from './data';
import {CHANCES,GOAL_PTS,PRESS_PTS,ROUND,ROUND_PTS,cleanRun,demoRun,gateNews,newGates,newPlay,pointsOf,settleGates,stepGates,stepPlay,yearAtX,
 type GateState,type Outcome,type Play,type V} from './model';
import {Gates,type GatesApi} from './Gates';
import {Final,type FinalApi} from './Final';
import w from './wwc.module.css';

/**
 * wwc-1991 · "The first Women’s World Cup" (Oct 12 2026 anatomy Paper restyle; user: "these games should not be the pixel style …
 * it needs to be larger and fill the entire screen", the anatomy skill's Paper theme). One big paper card fills the first screen:
 *  1. Story intro (4 beats).
 *  2. OPEN THE GATES (Gates.tsx): drag the slider along the year rail, 1920 → 1991. The bans (England 1921–71, Brazil 1941–79,
 *     West Germany 1955–70) lock and unlock their gates; at 1991 the World Cup gate opens.
 *  3. SCORE AKERS'S WINNER (Final.tsx): the 1991 final, minute 78, 1–1. Draw Michelle Akers's run with a finger: cut out Norway's
 *     back pass, go round the diving keeper, finish. Five chances, each back pass faster. 100 a goal, +up to 50 for pressing
 *     early, +50 for going round the keeper.
 *  4. Score (ScoreCover): points, the real goal, the quick check (StepCheck) → the Ending → onComplete (passport gold) once.
 * Heat: one Paper loop (anatomy/paper-loop.ts) runs only while a run plays or the gates move; it parks off-screen and is
 * disposed on unmount. Reduced motion: the run resolves at once (its trail is drawn), the gates snap: fully playable, turn by turn.
 */
type Phase='intro'|'gate'|'final'|'score';
type Result={outcome:Outcome;points:number;press:number;round:boolean};
const ACCENT='#d6342b';
const BEATS=[
 {when:'1920 · Goodison Park',head:'53,000 fans',text:BANS[0].before??''},
 {when:'1921 to 1979',head:'Shut out',text:'Then England’s FA banned women’s teams from its grounds for 50 years. Brazil (1941) and West Germany (1955) banned them too.'},
 {when:'November 1991 · China',head:'The first World Cup',text:`${CHINA_1991.trial} 12 teams came. ${CHINA_1991.minutes}`},
 {when:`${FINAL_1991.date} · ${FINAL_1991.place}`,head:'USA 2–1 Norway',text:`${FINAL_1991.goals[2].who}, minute ${FINAL_1991.goals[2].min} of 80: ${FINAL_1991.goals[2].how}`},
] as const;
const Q=QUIZ[2],CHECK:CheckItem={q:Q.q,options:Q.choices,right:Q.right,why:Q.why};
const WORD:Record<Outcome,{kind:'good'|'ok'|'bad';big:string;line:string}>={
 goal:{kind:'good',big:'Goal!',line:'Won the back pass, scored the winner.'},
 saved:{kind:'ok',big:'Saved',line:'Cut sideways as the keeper dives, then finish.'},
 keeper:{kind:'bad',big:'Too late',line:'The keeper picked up the pass. Run at the pass sooner.'},
 tackled:{kind:'bad',big:'Tackled',line:'Norway’s defender got back. Be quicker to goal.'},
 blocked:{kind:'bad',big:'Blocked',line:'The defender was on the line. Aim away from her.'},
 wide:{kind:'bad',big:'Wide',line:'Finish between the posts.'},
 short:{kind:'bad',big:'No shot',line:'Draw the run on toward the goal.'},
};
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{/* no audio */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const [phase,setPhase]=useState<Phase>('intro');const phaseRef=useRef(phase);phaseRef.current=phase;
 const [cardRef,box]=useBox<HTMLDivElement>();
 const stageRef=useRef<HTMLDivElement>(null),gatesApi=useRef<GatesApi>(null),finalApi=useRef<FinalApi>(null),readRef=useRef<HTMLSpanElement>(null);
 const said=useRef('');const say=useCallback((t:string)=>{if(t===said.current)return;said.current=t;if(readRef.current)readRef.current.textContent=t;},[]);
 const draw=()=>{gatesApi.current?.draw();finalApi.current?.draw();};
 // Per-frame state lives in refs; React state only for what the controls show.
 const gates=useRef<GateState>(newGates());
 const [year,setYear]=useState(gates.current.year),[gateDone,setGateDone]=useState(false);
 const play=useRef<Play|null>(null),run=useRef<V[]>([]),pts=useRef<V[]>([]),cursor=useRef<V|null>(null),demo=useRef(false);
 const [ci,setCi]=useState(0),[results,setResults]=useState<Result[]>([]),[last,setLast]=useState<Result|null>(null),[busy,setBusy]=useState(false),[drawn,setDrawn]=useState(false);
 const [checked,setChecked]=useState(false),[games,setGames]=useState(0);
 const src=useMemo(()=>({play,run,cursor}),[]);
 const chance=CHANCES[Math.min(ci,ROUND-1)];
 const total=results.reduce((a,r)=>a+r.points,0),goals=results.filter(r=>r.outcome==='goal').length;
 const [top,setTop]=useState(40);
 useEffect(()=>{setTop(noteSpace(cardRef.current));},[phase,ci,last,busy,box.w,box.h,cardRef]);

 // ── The loop: alive only while a run plays or the gates move ──
 const loop=usePaperLoop(dt=>{
  if(phaseRef.current==='gate'){const moving=stepGates(gates.current,dt);draw();return moving;}
  const p=play.current;if(!p)return false;const more=stepPlay(p,dt);draw();
  say(p.done?WORD[p.outcome!].big.toUpperCase():p.won!=null?'WON IT! GO ROUND HER':'CHASE THE PASS');
  if(!more){finish();return false;}return true;},stageRef,reduced);

 const finish=()=>{const p=play.current;if(!p||!p.done)return;setBusy(false);
  if(demo.current){demo.current=false;setLast(null);say('YOUR TURN: DRAW THE RUN');play.current=null;run.current=[];draw();return;}
  const pt=pointsOf(p),r:Result={outcome:p.outcome!,points:pt.total,press:pt.press,round:pt.round>0};
  setLast(r);say(r.outcome==='goal'?`GOAL +${r.points}`:WORD[r.outcome].big.toUpperCase());
  sfx(r.outcome==='goal'?museumSfx.net:r.outcome==='saved'?museumSfx.stamp:museumSfx.look);if(r.outcome==='goal')sfx(museumSfx.crowd);
  setResults(list=>[...list,r]);};
 const startRun=(r:V[],isDemo=false)=>{if(play.current&&!play.current.done)return;unlockMuseumAudio();
  demo.current=isDemo;run.current=r;play.current=newPlay(chance,r);setBusy(true);setLast(null);setDrawn(false);sfx(museumSfx.kick);loop.wake();};
 const nextChance=()=>{if(results.length>=ROUND){setPhase('score');return;}play.current=null;run.current=[];pts.current=[];cursor.current=null;setLast(null);setDrawn(false);
  setCi(results.length);say(`CHANCE ${results.length+1} OF ${ROUND}`);draw();};
 useEffect(()=>{if(phase==='final'&&results.length&&!busy&&last&&results.length>=ROUND){const t=setTimeout(()=>setPhase('score'),reduced?0:1600);return()=>clearTimeout(t);}},[phase,results,busy,last,reduced]);

 // ── Input: the year slider (drag along the rail, or tap the rail) and the run (draw with a finger) ──
 const setGateYear=useCallback((y:number)=>{const gs=gates.current,prev=gs.year,ny=Math.max(1920,Math.min(1991,Math.round(y)));if(ny===prev)return;
  const before=gateNews(prev),after=gateNews(ny);gs.year=ny;setYear(ny);
  if(after.text!==before.text){sfx(after.kind==='bad'?museumSfx.stamp:after.kind==='good'?museumSfx.reveal:museumSfx.flap);}else sfx(museumSfx.tick);
  if(ny>=1991&&!gateDone){setGateDone(true);sfx(museumSfx.crowd);}
  say(`${ny}`);loop.wake();draw();},[gateDone,loop,say]);
 const floorAt=(e:{clientX:number;clientY:number},z=0)=>{const P=(phase==='gate'?gatesApi:finalApi).current?.proj(),el=stageRef.current;if(!P||!el)return null;const [sx,sy]=local(e,el),[x,y]=toFloor(sx,sy,P,z);return {x:x/10,y:y/10};};
 const ptr=useRef<number|null>(null);
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{
  if(phase==='gate'){const p=floorAt(e,4);if(!p)return;unlockMuseumAudio();ptr.current=e.pointerId;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}setGateYear(yearAtX(p.x));return;}
  if(phase!=='final'||busy||results.length>=ROUND||last)return;const p=floorAt(e);if(!p)return;unlockMuseumAudio();ptr.current=e.pointerId;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  pts.current=[p];cursor.current=null;run.current=cleanRun(chance.akers,pts.current);draw();};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{if(ptr.current!==e.pointerId)return;
  if(phase==='gate'){const p=floorAt(e,4);if(p)setGateYear(yearAtX(p.x));return;}
  const p=floorAt(e);if(!p)return;const lp=pts.current[pts.current.length-1];if(!lp||Math.hypot(p.x-lp.x,p.y-lp.y)>.2){pts.current.push(p);run.current=cleanRun(chance.akers,pts.current);
   say(`RUN ${(run.current.length*.25).toFixed(1)} M`);draw();}};
 const onUp=(e:RPointerEvent<HTMLDivElement>,cancelled=false)=>{if(ptr.current!==e.pointerId)return;ptr.current=null;if(phase!=='final')return;
  if(cancelled||run.current.length<4){run.current=[];draw();return;}startRun(run.current);};

 // Keyboard: the slider ← → (Shift: 10 years); the run: arrows move a cursor, Enter adds a point, the Go button runs it.
 const keyMove=(dx:number,dy:number,fine:boolean)=>{if(phase==='gate'){setGateYear(gates.current.year+(dx||-dy)*(fine?10:1));return;}
  if(phase!=='final'||busy||last)return;const c=cursor.current??{...chance.akers},k=fine?.25:.6;cursor.current={x:c.x+dx*k,y:c.y+dy*k};say('ENTER: ADD A POINT');draw();};
 const onKey=(e:KeyboardEvent<HTMLElement>)=>{const k=e.key,btn=e.target instanceof HTMLButtonElement;
  if(k==='Escape'){e.preventDefault();onClose();return;}
  const mv:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(mv[k]&&!btn){e.preventDefault();keyMove(mv[k][0],mv[k][1],e.shiftKey);return;}
  if((k==='Enter'||k===' ')&&!btn&&phase==='final'&&!busy&&!last&&cursor.current){e.preventDefault();pts.current.push({...cursor.current});run.current=cleanRun(chance.akers,pts.current);setDrawn(true);draw();}};

 // Phase changes redraw; the gate settles at once when entered.
 useEffect(()=>{if(phase==='gate'){settleGates(gates.current);say(`${gates.current.year}`);}if(phase==='final'&&!play.current)say(`CHANCE ${ci+1} OF ${ROUND}`);draw();},[phase]);// eslint-disable-line react-hooks/exhaustive-deps

 const again=()=>{setResults([]);setLast(null);setCi(0);setChecked(false);setGames(n=>n+1);play.current=null;run.current=[];pts.current=[];setPhase('final');say(`CHANCE 1 OF ${ROUND}`);};
 const news=gateNews(year),word=last?WORD[last.outcome]:null;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const pips=results.map(r=>r.outcome==='goal'?'good':r.outcome==='saved'?'ok':'miss');
 const atGate=phase==='gate'||phase==='intro';

 const note=phase==='gate'?<><span className={s.tag} data-tone={news.kind==='bad'?'acc':undefined}>{year}</span>{news.text}</>
  :phase==='final'&&!busy&&!last?<><span className={s.tag} data-tone="acc">Chance {ci+1} of {ROUND}</span>The dashed line is Norway’s back pass. Draw Akers’s run from her ring: cut out the pass, go round the keeper, finish.</>:null;
 const banner=phase==='final'&&word&&!busy?<Banner kind={word.kind} big={last?.outcome==='goal'?`Goal! +${last.points}`:word.big} line={last?.outcome==='goal'?(last.round?'Round the keeper, like Akers in 1991.':'Next time go round the keeper for +50.'):word.line}/>
  :phase==='gate'&&gateDone?<Banner kind="good" big="1991" line="The World Cup gate is open: the first Women’s World Cup, in China."/>:null;

 const cover=phase==='intro'?<Intro kicker={<>Real history · {exhibit.year}</>} title={<>The first <em>Women’s</em> World Cup</>} deck={exhibit.facts[0]} beats={BEATS}
   onStart={()=>{unlockMuseumAudio();setPhase('gate');}} startLabel="Open the gates ▸"/>
  :phase==='score'?<ScoreCover kicker={`Full time · ${ROUND} chances`} score={total} unit={`of ${ROUND*(GOAL_PTS+PRESS_PTS+ROUND_PTS)} points · ${goals} of ${ROUND} goals`}
    notes={<><p><b>{goals} of {ROUND} goals.</b> {exhibit.facts[1]} {exhibit.facts[2]}</p>
     <p><b>The real winner:</b> minute {FINAL_1991.goals[2].min} of 80. {FINAL_1991.goals[2].how} {TAKE_IT}</p></>}
    buttons={<><button type="button" className={s.btn} data-museum-own-cue data-wwc-again onClick={again}>Five more</button>
     <button type="button" className={s.ghost} onClick={()=>{gates.current=newGates();setYear(1920);setGateDone(false);setPhase('gate');}}>Open the gates again</button></>}>
    <StepCheck key={games} items={[CHECK]} kicker={()=>'Quick check'} onPick={ok=>sfx(ok?museumSfx.stamp:museumSfx.look)} onDone={()=>setChecked(true)} doneLabel="Finish"
     renderDone={()=><Ending reached={checked} onComplete={onComplete} art={<svg viewBox="0 0 40 40"><path d="M20 5l4.4 9 9.9 1.4-7.2 7 1.7 9.8L20 27.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z" fill={ACCENT}/></svg>}
      seen="You opened the gates and scored Akers’s winner." take={exhibit.forYourGame}/>}/>
   </ScoreCover>:null;

 const title=atGate?'Open the gates':'Score Akers’s winner';
 const hint=atGate?'Drag the slider · 1920 to 1991':reduced?'Draw her run: it plays at once':'Draw Akers’s run · let go to play';
 const label=atGate?`A stadium wall with gates for England, Brazil and West Germany and the World Cup gate, and a year rail in front. The year is ${year}. ${news.text}`
  :`The 1991 final, minute 78, 1–1. Norway’s defender is about to pass back to the keeper. Michelle Akers, the lit player in the red ring, waits. Chance ${ci+1} of ${ROUND}.`;

 return <PaperRoom id="wwc-1991" accent={ACCENT} ariaLabel={`${exhibit.year} · ${exhibit.title}`} onClose={onClose} onKeyDown={onKey}
  rootProps={{'data-phase':phase,'data-chance':ci+1,'data-result':last?.outcome,'data-score':total,'data-year':year,'data-reduced':reduced||undefined}}
  head={<WallLabel as="h1" title={exhibit.title} meta={<>{exhibit.year} · {CHINA_1991.region}, China</>}/>}
  card={<PaperCard ref={cardRef} data-wide-note="right" fig={`Fig. ${exhibit.year}`} title={title} hint={hint} readout={atGate?String(year):`CHANCE ${ci+1} OF ${ROUND}`} readoutRef={readRef} note={note} banner={banner} cover={cover}>
   <div ref={stageRef} className={s.stage} tabIndex={0} role="application" aria-label={label} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={e=>onUp(e)} onPointerCancel={e=>onUp(e,true)}
    data-stage={atGate?'gates':'final'} style={{cursor:atGate?'ew-resize':phase==='final'&&!busy&&!last?'crosshair':undefined}}>
    {atGate?<Gates ref={gatesApi} w={box.w} h={box.h} top={top} bottom={40} g={gates.current}/>
     :<Final ref={finalApi} w={box.w} h={box.h} top={top} bottom={40} src={src} chance={chance}/>}
   </div>
  </PaperCard>}
  dock={phase==='gate'?<div className={s.row}>
    <button type="button" className={s.ghost} aria-label="Ten years earlier" onClick={()=>setGateYear(year-10)} disabled={year<=1920}><StepIcon kind="prev10"/></button>
    <button type="button" className={s.ghost} aria-label="One year earlier" onClick={()=>setGateYear(year-1)} disabled={year<=1920}><StepIcon kind="prev"/></button>
    <span className={s.big} data-wwc-year={year} aria-live="polite">{year}</span>
    <button type="button" className={s.ghost} aria-label="One year later" onClick={()=>setGateYear(year+1)} disabled={year>=1991}><StepIcon kind="next"/></button>
    <button type="button" className={s.ghost} aria-label="Ten years later" onClick={()=>setGateYear(year+10)} disabled={year>=1991}><StepIcon kind="next10"/></button>
    {gateDone&&<button type="button" className={s.btn} data-tone="acc" data-museum-own-cue data-wwc-to-final onClick={()=>{setPhase('final');sfx(museumSfx.whistle);}}>To the final ▸</button>}
   </div>
  :phase==='final'?<>
   <div className={s.row}>
    <Pips results={pips} total={ROUND} label={`${results.length} of ${ROUND} chances, ${goals} goals`}/>
    <span className={s.grow}><Chips items={[{k:'pts',label:'Points',value:total},{k:'goals',label:'Goals',value:`${goals}/${results.length}`},{k:'pass',label:'Pass speed',value:`${chance.speed.toFixed(1)} m/s`}]}/></span>
   </div>
   <div className={s.row}>
    {last&&results.length<ROUND?<button type="button" className={s.btn} data-tone="acc" data-wwc-next onClick={nextChance}>Next chance ▸</button>
     :<button type="button" className={s.btn} data-tone={drawn?'acc':undefined} disabled={busy||!!last} data-wwc-go onClick={()=>{if(drawn&&run.current.length>1)startRun(run.current);else startRun(demoRun(chance),true);}}>{drawn?'Go!':'Show me'}</button>}
    {busy&&<span className={s.say}>{demo.current?'Watch: meet the pass, cut away from the keeper, walk it in.':'…'}</span>}
   </div></>:null}>
  <section className={g.section} aria-labelledby="wwc-story">
   <p className={g.kicker}>Real history</p>
   <h2 id="wwc-story" className={g.h2}>From locked gates to the first star</h2>
   <ol className={g.steps}>
    {exhibit.facts.map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}
    {BANS.map(b=><li key={b.country}><span>{b.from}</span><p className={g.body}><b>{b.country}, {b.from} to {b.to}.</b> {b.banned} {b.who} {b.after}</p></li>)}
    <li><span>1991</span><p className={g.body}>{CHINA_1991.trial} {CHINA_1991.opener} {CHINA_1991.minutes} Its official name: the {CHINA_1991.officialName}.</p></li>
    <li><span>Final</span><p className={g.body}>{FINAL_1991.date}, {FINAL_1991.place}, {FINAL_1991.crowd} fans. {FINAL_1991.goals.map(x=>`${x.min}′ ${x.who} (${x.team}): ${x.how}`).join(' ')}</p></li>
   </ol>
   <p className={g.small}>The game’s spots on the pitch are drawn for teaching and squeezed onto one screen. The machines are drawings made for this museum.</p>
  </section>
  <section className={g.section} aria-labelledby="wwc-since">
   <p className={g.kicker}>Every Women’s World Cup since</p>
   <ul className={w.cups}>{EDITIONS.map(e=><li key={e.year} data-first={e.year===1991||undefined}><b>{e.year}</b><span>{e.host} · {e.teams} teams</span><span>{e.final}</span><span>{e.star}: {e.starWhy}</span></li>)}</ul>
   <p className={g.body}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
   <details className={g.sources}><summary>Sources</summary>
    <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details>
  </section>
 </PaperRoom>;
}
