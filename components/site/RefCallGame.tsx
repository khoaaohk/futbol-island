'use client';
import {useEffect,useRef,useState} from 'react';
import {fill,levelFor,shuffled,toneOf,type CallGame,type CallId} from '@/lib/site/refCall';
import styles from '@/app/(site)/site.module.css';
import g from './refCallGame.module.css';
/**
 * "Make the call" swipe game (cards page, Nov 16 2026; data: lib/site/refCall.ts; also the back-pass, throw-in, handball and
 * fouls pages' games, lib/site/rulePlay.ts, with two or three choices whose colour is their `tone`). The
 * scenarios are shuffled on Start; each is a card you swipe (up / right / left, as the game's choices say) or answer with the
 * big buttons (one per choice), which are always there. The card then turns to show the right call and why, read out by a polite live
 * region, and Next moves on. At the end: the score, a referee level and Play again. Keyboard: the buttons, or the arrow keys
 * that match the swipes while the card has focus. State lives here only: nothing is stored or sent.
 */
const SWIPE=80,FLICK=.5;
type Phase='intro'|'play'|'done';
const ARROW:Record<string,'up'|'right'|'left'>={ArrowUp:'up',ArrowRight:'right',ArrowLeft:'left'};
const GLYPH={up:'↑',right:'→',left:'←'} as const;
export default function RefCallGame({game,lang}:{game:CallGame;lang?:'es'}){
 const W=game.words,id=game.id;
 const [phase,setPhase]=useState<Phase>('intro');
 const [order,setOrder]=useState(game.scenarios);
 const [i,setI]=useState(0);
 const [picks,setPicks]=useState<CallId[]>([]);
 const [off,setOff]=useState<{x:number;y:number}|null>(null);
 const drag=useRef<{x:number;y:number;t:number;pid:number}|null>(null);
 const nextBtn=useRef<HTMLButtonElement>(null),cardRef=useRef<HTMLDivElement>(null),endRef=useRef<HTMLHeadingElement>(null),focusCard=useRef(false);
 const cur=order[i],picked=picks[i] as CallId|undefined,answered=picked!==undefined;
 const score=picks.filter((p,k)=>p===order[k]?.answer).length,total=order.length;
 const choice=(c:CallId)=>game.choices.find(x=>x.id===c)!;
 const callWord=(c:CallId)=>choice(c).label;
 const start=()=>{setOrder(shuffled(game.scenarios));setI(0);setPicks([]);setOff(null);focusCard.current=true;setPhase('play');};
 const pick=(c:CallId)=>{if(phase!=='play'||answered)return;setPicks(p=>{const n=[...p];n[i]=c;return n;});setOff(null);};
 const next=()=>{if(i+1>=total){setPhase('done');return;}focusCard.current=true;setI(i+1);};
 useEffect(()=>{if(answered)nextBtn.current?.focus({preventScroll:true});},[answered]);
 useEffect(()=>{if(phase==='play'&&focusCard.current){focusCard.current=false;cardRef.current?.focus({preventScroll:true});}if(phase==='done')endRef.current?.focus({preventScroll:true});},[phase,i]);
 const dirOf=(x:number,y:number):'up'|'right'|'left'|null=>{if(-y>Math.abs(x)&&-y>SWIPE*.5)return 'up';if(Math.abs(x)>=-y&&Math.abs(x)>SWIPE*.5)return x>0?'right':'left';return null;};
 const lean=off?dirOf(off.x,off.y):null,leanChoice=lean?game.choices.find(c=>c.swipe===lean):undefined;
 const onDown=(e:React.PointerEvent)=>{if(answered||(e.pointerType==='mouse'&&e.button!==0))return;drag.current={x:e.clientX,y:e.clientY,t:e.timeStamp,pid:e.pointerId};
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);};
 const onMove=(e:React.PointerEvent)=>{const d=drag.current;if(!d||d.pid!==e.pointerId)return;setOff({x:e.clientX-d.x,y:Math.min(40,e.clientY-d.y)});};
 const onUp=(e:React.PointerEvent)=>{const d=drag.current;drag.current=null;if(!d)return;
  const x=e.clientX-d.x,y=e.clientY-d.y,dt=Math.max(1,e.timeStamp-d.t),v=Math.hypot(x,y)/dt;
  const far=Math.max(Math.abs(x),-y)>SWIPE||(v>FLICK&&Math.max(Math.abs(x),-y)>30);
  const dir=far?(-y>Math.abs(x)?'up':x>0?'right':'left'):null;
  const c=dir?game.choices.find(k=>k.swipe===dir):undefined;
  if(c)pick(c.id);else setOff(null);};
 const onKey=(e:React.KeyboardEvent)=>{const dir=ARROW[e.key];if(!dir||answered)return;const c=game.choices.find(k=>k.swipe===dir);if(c){e.preventDefault();pick(c.id);}};
 const level=levelFor(game.levels,score,total);
 const right=answered&&picked===cur.answer;
 return <section className={styles.section} aria-labelledby={id} data-ref-call={id} data-playbar-hide="">
  <h2 className={styles.h2} id={id}>{W.title}</h2>
  {phase==='intro'&&<div className={g.intro}>
   <p>{W.intro}</p>
   <p className={styles.caption}>{W.how} {W.privacy}</p>
   <noscript><p className={styles.caption}>{W.noScript}</p></noscript>
   <p><button type="button" className={g.start} onClick={start}>{W.start}</button></p>
  </div>}
  {phase==='play'&&cur&&<div className={g.play} lang={lang}>
   <p className={g.progress}>{fill(W.progress,{n:i+1,total})}</p>
   <div className={g.stage}>
    <div ref={cardRef} className={g.card} tabIndex={-1} data-answered={answered?'':undefined} data-call={answered?toneOf(choice(cur.answer)):undefined} data-lean={leanChoice?toneOf(leanChoice):undefined}
     role="group" aria-roledescription="scenario card" aria-label={fill(W.progress,{n:i+1,total})}
     style={off&&!answered?{transform:`translate3d(${off.x}px,${off.y}px,0) rotate(${off.x*.04}deg)`}:undefined} data-dragging={off?'':undefined}
     onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={()=>{drag.current=null;setOff(null);}} onKeyDown={onKey}>
     <div className={g.front} aria-hidden={answered||undefined}>
      <p className={g.text}>{cur.text}</p>
      {leanChoice&&<p className={g.lean} data-call={toneOf(leanChoice)} aria-hidden="true">{leanChoice.label}</p>}
     </div>
     <div className={g.back} aria-hidden={!answered||undefined}>
      {answered&&<><p className={g.scenario}>{cur.text}</p>
       <p className={g.verdict}>{right?W.right:W.wrong} {fill(W.answerIs,{call:callWord(cur.answer)})}</p>
       <p>{cur.why}</p></>}
     </div>
    </div>
   </div>
   <p className={g.sr} aria-live="polite" aria-atomic="true">{answered?`${right?W.right:W.wrong} ${fill(W.answerIs,{call:callWord(cur.answer)})} ${cur.why}`:''}</p>
   {!answered
    ?<div className={g.choices} data-n={game.choices.length} role="group" aria-label={W.title}>
      {game.choices.map(c=><button key={c.id} type="button" className={g.choice} data-call={toneOf(c)} onClick={()=>pick(c.id)}>
       {c.swipe==='left'&&<span aria-hidden="true">{GLYPH.left} </span>}{c.label}{c.swipe==='up'&&<span aria-hidden="true"> {GLYPH.up}</span>}{c.swipe==='right'&&<span aria-hidden="true"> {GLYPH.right}</span>}</button>)}
     </div>
    :<p className={g.nextRow}><button ref={nextBtn} type="button" className={g.start} onClick={next}>{i+1>=total?W.finish:W.next}</button></p>}
   <p className={styles.caption}>{W.how}</p>
  </div>}
  {phase==='done'&&<div className={g.done} aria-live="polite">
   <h3 className={styles.h3} ref={endRef} tabIndex={-1}>{fill(W.score,{score,total})}</h3>
   <p className={g.level}><span>{W.levelIs}</span> <b>{level.name}</b></p>
   <p>{level.line}</p>
   <p><button type="button" className={g.start} onClick={start}>{W.again}</button></p>
  </div>}
 </section>;
}
