'use client';
import {DoneButton} from './DoneButton';
import {useEffect,useRef,useState} from 'react';
import type {LiveMatchView} from '@/lib/town/fieldRuntime';
import {BEACH_QUIZ,BEACH_WATCH_FOR} from '@/lib/town/beachSoccer';
import chat from './FieldTranscript.module.css';
import styles from './BeachMatchGuide.module.css';

/**
 * "Learn beach soccer" for the live 5-a-side match on Coral Cay's court: the live commentary (the sim's own beach
 * teaching lines — overhead kicks, keeper throws, kick-ins, no offside, periods and extra time) and a short rules quiz.
 * The same glass panel as the pitches' live transcript (FieldTranscript), non-modal so the match stays in view.
 * Heat: reads the match only while open, twice a second, and re-renders only when the feed or the score changed.
 */
export default function BeachMatchGuide({open,onClose,readMatch}:{open:boolean;onClose:()=>void;readMatch:()=>LiveMatchView|null}){
 const [tab,setTab]=useState<'live'|'quiz'>('live'),[match,setMatch]=useState<LiveMatchView|null>(null);
 const [question,setQuestion]=useState(0),[answer,setAnswer]=useState<number|null>(null),[right,setRight]=useState(0),[done,setDone]=useState(false);
 const body=useRef<HTMLDivElement>(null),follow=useRef(true),done$=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const update=()=>{const next=readMatch();setMatch(old=>old&&next&&old.events.length===next.events.length&&old.events[old.events.length-1]?.id===next.events[next.events.length-1]?.id&&old.score.gold===next.score.gold&&old.score.blue===next.score.blue&&old.period===next.period?old:next);};update();const timer=setInterval(update,500);return()=>clearInterval(timer);},[open,readMatch]);
 useEffect(()=>{if(open)done$.current?.focus({preventScroll:true});},[open]);
 const events=(match?.events??[]).slice(-40);
 useEffect(()=>{const el=body.current;if(tab==='live'&&follow.current&&el)el.scrollTop=el.scrollHeight;},[events.length,tab]);
 if(!open)return null;
 const q=BEACH_QUIZ[question],period=match?.period;
 const periodLabel=!period?'Warming up':period<=3?`Period ${period} of 3`:period===4?'Extra time':'Full time';
 const choose=(i:number)=>{if(answer!==null)return;setAnswer(i);if(i===q.correct)setRight(n=>n+1);};
 const next=()=>{if(question+1>=BEACH_QUIZ.length){setDone(true);return;}setQuestion(question+1);setAnswer(null);};
 const restart=()=>{setQuestion(0);setAnswer(null);setRight(0);setDone(false);};
 return <section className={`${chat.panel} ${chat.entering} ${styles.panel}`} id="beach-match-guide" aria-label="Beach soccer: live match and rules" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onClose();}}} onKeyUp={e=>e.stopPropagation()}>
  <header className={chat.header}><div><strong>Sharks Beach · Live</strong><small>{periodLabel} · barefoot 5-a-side</small></div><span className={chat.score} aria-label={`Gold ${match?.score.gold??0}, Blue ${match?.score.blue??0}`}>{match?.score.gold??0} — {match?.score.blue??0}</span><DoneButton ref={done$} onDone={onClose}/></header>
  <div className={styles.tabs} role="group" aria-label="Beach soccer guide"><button type="button" aria-pressed={tab==='live'} onClick={()=>setTab('live')}>Live commentary</button><button type="button" aria-pressed={tab==='quiz'} onClick={()=>setTab('quiz')}>Rules quiz</button></div>
  {tab==='live'?<div ref={body} className={chat.body} role="log" aria-label="Live beach soccer play-by-play" aria-live="polite" onScroll={e=>{const el=e.currentTarget;follow.current=el.scrollHeight-el.scrollTop-el.clientHeight<35;}}>
   <p className={chat.intro}>Five a side on sand, keeper included, everyone barefoot. Watch for:</p>
   <ul className={styles.watch}>{BEACH_WATCH_FOR.map(w=><li key={w.id}><strong>{w.title}</strong> {w.text}</li>)}</ul>
   {events.map((e,i)=><article key={e.id} className={`${chat.message} ${i===events.length-1?chat.current:''}`} data-current={i===events.length-1}><small>{`${Math.floor(e.time/60)}:${String(Math.floor(e.time%60)).padStart(2,'0')}`}</small><p>{e.text}</p></article>)}
   {!events.length&&<p className={chat.intro}>The teams are getting started…</p>}
  </div>:<div className={chat.body} aria-label="Beach soccer rules quiz">
   {done?<article className={`${chat.message} ${chat.current}`}><small>Quiz done</small><p>{`${right} of ${BEACH_QUIZ.length} right. ${right===BEACH_QUIZ.length?'You know your beach soccer rules!':'Watch the live match for these moments, then try again.'}`}</p><button type="button" className={styles.next} onClick={restart}>Try again</button></article>:<>
    <small className={styles.count}>{`Question ${question+1} / ${BEACH_QUIZ.length}`}</small>
    <p className={styles.question}>{q.q}</p>
    <div className={styles.options}>{q.options.map((option,i)=><button key={option} type="button" disabled={answer!==null} data-result={answer===null?undefined:i===q.correct?'correct':i===answer?'wrong':undefined} onClick={()=>choose(i)}><span aria-hidden="true">{String.fromCharCode(65+i)}</span>{option}</button>)}</div>
    {answer!==null&&<p role="status" className={styles.result}><strong>{answer===q.correct?'Correct. ':'Look again. '}</strong>{q.explain}</p>}
    {answer!==null&&<button type="button" className={styles.next} onClick={next}>{question+1<BEACH_QUIZ.length?'Next question':'See my score'}</button>}
   </>}
  </div>}
 </section>;
}
