'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {EDITIONS,WINNER_COLOR,titles,SOURCES,type Edition} from './data';
import {FinalPitch,FinalPanel,useReplay} from './FinalReplay';
import {DarkStage,DarkPanel,useDarkYears} from './DarkYears';
import {ChinaStage,ChinaPanel,useFold} from './China91';
import {AkersPitch,AkersPanel,useAkers} from './AkersGame';
import {QuizStage,QuizPanel,useQuiz} from './Quiz';
import {Medallion,starPath} from './papercut';
import {flip,pop} from './spring';
import {Chevron,Play} from './icons';
import styles from './wwc.module.css';

/**
 * wwc-1991 · "Cut from paper" (Oct 9 2026 restyle of "A Sky of Firsts", Oct 5). The first FIFA Women's World Cup (China 1991)
 * told as Chinese paper-cut (剪纸 jianzhi): red sheets with sawtooth and crescent cuts layered on cream paper, 1991 poster type.
 * Five beats the visitor drives:
 *  1. Shut out: scrub 1920 → 1991; each ban on women's football is a red shutter across a country's lane that lifts when it ends.
 *  2. China 1991: drag a folded paper open into a 12-petal window flower, one petal per team (12 teams, 80-minute matches).
 *  3. The final: replay USA 2–1 Norway as a paper goal map, then YOUR TURN: drag Michelle Akers to win Norway's back pass and
 *     flick in the winner (Akers scored both US goals).
 *  4. Every star since: each Women's World Cup as a paper star; tap one for its host, final and star player.
 *  5. Cut your star (quick check): five questions on beats 1–3; each right answer cuts one point of a paper star, then it ignites.
 * Real history, sourced in data.ts. Heat: no canvas and no loop at rest; the only rAF loops are the replay, the time-travel
 * play button, the paper unfold spring and the Akers game, each running only while it moves and stopping when finished,
 * hidden or unmounted. Paper texture is CSS (an SVG noise tile the browser rasterises once). Transitions between beats are
 * FLIP / WAAPI on spring-sampled keyframes (no View Transitions).
 */
type Mode='dark'|'china'|'final'|'stars'|'quiz';
const BEATS:[Mode,string,string][]=[['dark','1','Shut out'],['china','2','China'],['final','3','Final'],['stars','4','Stars'],['quiz','5','Quiz']];
const WIDE:[number,number][]=[[8,74],[18,52],[28,66],[37,40],[47,58],[56,32],[66,50],[75,24],[85,38],[93,70]];
const TALL:[number,number][]=[[22,90],[70,80],[26,69],[74,59],[28,48],[72,38],[26,28],[68,18],[30,8],[82,6]];
const color=(e:Edition)=>e.winner?WINNER_COLOR[e.winner]:'#b9a989';
const size=(e:Edition)=>e.year===1991?32:15+e.teams/4;

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [mode,setMode]=useState<Mode>('dark');
 const [sub,setSub]=useState<'watch'|'play'>('watch');
 const [sel,setSel]=useState(0);
 const [touched,setTouched]=useState(false);
 const [tall,setTall]=useState(false);
 const [seen,setSeen]=useState<ReadonlySet<number>>(()=>new Set([0]));
 const [complete,setComplete]=useState(false);
 const stage=useRef<HTMLDivElement>(null),tabs=useRef<HTMLDivElement>(null),pill=useRef<HTMLSpanElement>(null),pillFrom=useRef<DOMRect|null>(null);
 const reduced=useRef(false);
 useEffect(()=>{reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;},[]);
 const replay=useReplay(reduced);
 const dark=useDarkYears(reduced);
 const fold=useFold(reduced);
 const akers=useAkers(reduced);
 const quiz=useQuiz(reduced);

 // Portrait vs landscape constellation (measured, not polled).
 useEffect(()=>{const st=stage.current;if(!st)return;const measure=()=>{const r=st.getBoundingClientRect();setTall(r.width<600||r.width/Math.max(1,r.height)<1.05);};
  measure();const ro=new ResizeObserver(measure);ro.observe(st);return()=>ro.disconnect();},[]);

 // The beat rail's paper tab slides to the chosen beat (FLIP on a spring), instead of jumping.
 useLayoutEffect(()=>{const t=tabs.current,p=pill.current;if(!t||!p)return;const b=t.querySelector<HTMLElement>('[aria-selected="true"]');if(!b)return;
  p.style.left=b.offsetLeft+'px';p.style.width=b.offsetWidth+'px';const from=pillFrom.current;pillFrom.current=null;if(from&&!reduced.current)flip(p,from,{scale:true,k:300,c:24});},[mode]);

 const go=useCallback((m:Mode)=>{if(m===mode)return;pillFrom.current=pill.current?.getBoundingClientRect()??null;try{museumSfx.flap();}catch{}
  setMode(m);if(m==='final'){setSub('watch');replay.start();}else replay.pause();if(m!=='dark')dark.pause();},[mode,replay,dark]);
 const visit=useCallback((i:number)=>{setSel(i);setTouched(true);if(seen.has(i))return;const n=new Set(seen);n.add(i);setSeen(n);if(n.size===EDITIONS.length){museumSfx.reveal();setComplete(true);}},[seen]);
 const pick=useCallback((i:number)=>{const j=Math.max(0,Math.min(EDITIONS.length-1,i));visit(j);museumSfx.flap();
  if(!reduced.current)pop(document.querySelector(`[data-wwc-star="${j}"] svg`),.7);},[visit]);
 const play=useCallback(()=>{replay.pause();setSub('play');},[replay]);

 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();return;}
  if(mode!=='stars'||(e.target instanceof HTMLElement&&e.target.matches('input,summary,a')))return;
  if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();pick(sel+1);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();pick(sel-1);}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[mode,onClose,pick,sel]);

 const pos=tall?TALL:WIDE,ar=tall?.75:5/3,e=EDITIONS[sel];
 return <section className={styles.root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="wwc-1991" data-mode={mode}>
  <Medallion className={`${styles.deco} ${styles.decoA}`} r={50} n={12}/>
  <Medallion className={`${styles.deco} ${styles.decoB}`} r={50} n={8}/>
  <ExperienceBack onClose={onClose}/>
  <header className={styles.header}>
   <h1 className={styles.title}><span className={styles.hanziSm} lang="zh">中国 1991</span> The first Women’s World Cup</h1>
   <span className={styles.real}>Real history</span>
  </header>

  <div ref={stage} className={styles.stage}>
   <div key={mode+(mode==='final'?sub:'')} className={styles.scene}>
   {mode==='dark'&&<DarkStage d={dark} onLit={()=>go('china')}/>}
   {mode==='china'&&<ChinaStage f={fold}/>}
   {mode==='final'&&(sub==='watch'?<FinalPitch r={replay}/>:<AkersPitch g={akers}/>)}
   {mode==='quiz'&&<QuizStage q={quiz}/>}
   {mode==='stars'&&<div className={styles.sky} data-complete={complete||undefined} style={{'--ar':ar} as CSSProperties} role="group" aria-label="Every FIFA Women’s World Cup as a paper star. Bigger stars had more teams.">
    <svg className={styles.lines} viewBox={`0 0 ${100*ar} 100`} aria-hidden="true">
     {pos.slice(1).map((p,i)=>{const a=pos[i],fut=EDITIONS[i+1].upcoming,on=sel===i||sel===i+1;
      return <line key={i} className={styles.thread} data-future={fut||undefined} data-on={on||undefined} x1={a[0]*ar} y1={a[1]} x2={p[0]*ar} y2={p[1]} style={{'--i':i} as CSSProperties}/>;})}
    </svg>
    {EDITIONS.map((ed,i)=><button key={ed.year} type="button" className={styles.star} data-wwc-star={i} data-first={ed.year===1991||undefined} data-future={ed.upcoming||undefined} aria-pressed={i===sel} data-seen={seen.has(i)||undefined} data-museum-own-cue
      data-side={tall?(pos[i][0]<50?'l':'r'):'b'}
      aria-label={`${ed.year}, ${ed.host}. ${ed.upcoming?'Not played yet':`Won by ${ed.winner}`}. ${ed.teams} teams.`} onClick={()=>pick(i)}
      style={{left:`${pos[i][0]}%`,top:`${pos[i][1]}%`,'--r':`${size(ed)}px`,'--c':color(ed),'--i':i} as CSSProperties}>
     <svg viewBox="-12 -12 24 24" aria-hidden="true"><path d={starPath(10.5)} transform="translate(.5 .8)" className={styles.starShadow}/><path d={starPath(10.5)} fillRule="evenodd" className={styles.starPaper}/></svg>
     <span className={styles.yr}>{ed.year}<small>{ed.upcoming?'next':ed.winner}</small></span></button>)}
    {complete&&<p className={styles.done} role="status"><b>Every star visited</b><span>9 World Cups played. One star still to cut.</span></p>}
    {!touched&&<span className={styles.hint}><i aria-hidden="true"/>Tap any star to visit that World Cup</span>}
   </div>}
   </div>
  </div>

  <aside className={styles.panel} aria-label="The story">
   <div ref={tabs} className={styles.tabs} role="tablist" aria-label="Story beats">
    <span ref={pill} className={styles.pill} aria-hidden="true"/>
    {BEATS.map(([m,n,l])=><button key={m} type="button" role="tab" aria-selected={mode===m} data-museum-own-cue onClick={()=>go(m)}><i>{n}</i><span>{l}</span></button>)}
   </div>
   <div key={mode} className={styles.pane}>
    {mode==='dark'&&<DarkPanel d={dark} onLit={()=>go('china')}/>}
    {mode==='china'&&<ChinaPanel f={fold} onNext={()=>go('final')}/>}
    {mode==='final'&&<>{sub==='watch'?<FinalPanel r={replay} onPlay={play}/>:<AkersPanel g={akers} onWatch={()=>{setSub('watch');}}/>}
     <div className={styles.row}><span className={styles.grow}/><button type="button" className={styles.btn} data-museum-own-cue onClick={()=>go('stars')}>Next: every World Cup since →</button></div></>}
    {mode==='stars'&&<><StarCard e={e} sel={sel} seen={seen.size} pick={pick} onReplay={()=>go('final')} onDark={()=>go('dark')}/>
     <div className={styles.row}><span className={styles.grow}/><button type="button" className={`${styles.btn} ${styles.gold}${complete?' '+styles.pop:''}`} data-museum-own-cue data-wwc-to-quiz onClick={()=>go('quiz')}>Next: cut your star →</button></div></>}
    {mode==='quiz'&&<QuizPanel q={quiz} onAgain={()=>{quiz.reset();go('dark');}}/>}
   </div>
   <details className={styles.sources}><summary>Sources</summary>
    <p>Everything here is real football history, not part of the island’s story. The 1991 goal spots and the “Your turn” game are drawn to show how each goal happened.</p>
    <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}</ul>
   </details>
  </aside>
 </section>;
}

function StarCard({e,sel,seen,pick,onReplay,onDark}:{e:Edition;sel:number;seen:number;pick:(i:number)=>void;onReplay:()=>void;onDark:()=>void}){
 const eyebrow=e.year===1991?'The very first Women’s World Cup':e.upcoming?'The next Women’s World Cup':`Women’s World Cup number ${sel+1}`;
 return <div className={styles.starCard} style={{'--c':color(e)} as CSSProperties}>
  <div key={e.year} className={styles.card} aria-live="polite">
   <p className={styles.eyebrow}>{eyebrow}</p>
   <div className={styles.big}><span className={styles.bigYear}>{e.year}</span><span className={styles.host}><b>{e.host}</b><span>{e.teams} teams</span></span></div>
   <p className={styles.score}>{e.upcoming?e.final:<>Final: {e.final}</>}</p>
  </div>
  <div key={'b'+e.year} className={`${styles.card} ${styles.cardBody}`}>
   <p className={styles.who}><b>{e.upcoming?e.star:e.star+'.'}</b> {e.starWhy}</p>
   <p className={styles.note}>{e.note}</p>
  </div>
  <div className={styles.row}>
   <button type="button" className={`${styles.btn} ${styles.icon}`} aria-label="Earlier World Cup" disabled={sel===0} onClick={()=>pick(sel-1)}><Chevron left/></button>
   <span className={styles.count}>{seen} of {EDITIONS.length}<small>visited</small></span>
   <button type="button" className={`${styles.btn} ${styles.icon}`} aria-label="Later World Cup" disabled={sel===EDITIONS.length-1} onClick={()=>pick(sel+1)}><Chevron/></button>
   <span className={styles.grow}/>
   {e.year===1991?<button type="button" className={`${styles.btn} ${styles.gold}`} onClick={onReplay}><Play/>Replay the final</button>
    :<button type="button" className={styles.btn} onClick={onDark}>Before 1991</button>}
  </div>
  <div className={styles.extra}>
   <p className={styles.eyebrow}>Teams at each World Cup</p>
   <div className={styles.growth} role="img" aria-label="The number of teams grew from 12 in 1991 to 16 in 1999, 24 in 2015 and 32 in 2023.">
    {EDITIONS.map((ed,i)=><span key={ed.year} data-on={i===sel||undefined} data-future={ed.upcoming||undefined} style={{'--h':ed.teams/32,'--c':color(ed)} as CSSProperties}>
     <i/>{(i===0||EDITIONS[i-1].teams!==ed.teams)&&!ed.upcoming&&<em>{ed.teams}</em>}</span>)}
   </div>
   <div className={styles.growthAxis} aria-hidden="true"><span>1991</span><span>2027</span></div>
  </div>
  <div className={styles.titlesBox}>
   <p className={styles.eyebrow}>Titles so far</p>
   <ul className={styles.legend}>{titles().map(([t,n])=><li key={t} style={{'--c':WINNER_COLOR[t as keyof typeof WINNER_COLOR]} as CSSProperties}>
    <b>{t}</b><span className={styles.pips} aria-label={`${n} ${n===1?'title':'titles'}`}>{Array.from({length:n},(_,k)=><i key={k}/>)}</span></li>)}</ul>
  </div>
 </div>;
}
