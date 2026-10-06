'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import ExperienceBack from '../ExperienceBack';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import {CALLS,CASE_FACTS,FIRSTS,LADDER,SCENES,SOURCES,STORY_1966,TWO_YELLOWS,type Call} from './content';
import {MatchStage,StreetStage} from './Stage';
import styles from './Experience.module.css';

/**
 * cards-1970 · "The Junction" (Oct 5 2026). Ken Aston's idea came from a traffic light, so the whole exhibit is one: a big
 * signal head is the visitor's answer pad. First, 1966 London at night: tap the amber and red lamps to see the idea. Then six
 * practice calls play as back-lit silhouettes and the visitor, as the referee, presses a lamp: green = no card, amber = yellow,
 * red = red. The light changes and explains Law 12 (careless → reckless → excessive force), about fairness and safety, not
 * punishment. The practice calls are made up (labelled), the history is real and sourced (content.ts).
 */
type Phase='intro'|'watch'|'call'|'verdict'|'end';
const COLOR:Record<Call,string>={none:'var(--green)',yellow:'var(--amber)',red:'var(--red)'};
const NAME:Record<Call,string>={none:'No card',yellow:'Yellow card',red:'Red card'};
type VT={startViewTransition?:(cb:()=>void)=>unknown};

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [phase,setPhase]=useState<Phase>('intro');
 const [index,setIndex]=useState(0),[token,setToken]=useState(0),[rate,setRate]=useState(1);
 const [picked,setPicked]=useState<Call|null>(null),[results,setResults]=useState<boolean[]>([]);
 const [introLit,setIntroLit]=useState<Call|null>(null),[seen,setSeen]=useState<{yellow?:boolean;red?:boolean}>({});
 const [reduced,setReduced]=useState(false),[compact,setCompact]=useState(false);
 const root=useRef<HTMLElement>(null),panel=useRef<HTMLDivElement>(null);
 const scene=SCENES[index];

 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),c=matchMedia('(max-width:760px),(max-height:520px)');
  const f=()=>{setReduced(q.matches);setCompact(c.matches);};f();q.addEventListener('change',f);c.addEventListener('change',f);root.current?.focus();
  return ()=>{q.removeEventListener('change',f);c.removeEventListener('change',f);};},[]);
 useEffect(()=>{panel.current?.scrollTo?.({top:0});},[phase,index,seen.red]);

 /** Big scene changes cross-fade with a same-document View Transition (Chrome, Safari 18+, Firefox 133+); a plain update
  *  elsewhere and with reduced motion. */
 const go=useCallback((fn:()=>void)=>{const d=document as Document&VT;
  if(reduced||typeof d.startViewTransition!=='function'){fn();return;}
  try{d.startViewTransition(()=>flushSync(fn));}catch{fn();}},[reduced]);
 const start=useCallback((i:number)=>{setIndex(i);setPicked(null);setRate(1);setToken(x=>x+1);setPhase('watch');},[]);
 const replay=()=>{setRate(.5);setToken(x=>x+1);setPhase(p=>p==='verdict'?'verdict':'watch');};
 const ended=useCallback(()=>setPhase(p=>p==='watch'?'call':p),[]);

 const press=useCallback((c:Call)=>{
  if(phase==='intro'){museumSfx.tick();setIntroLit(c);if(c!=='none')setSeen(s=>({...s,[c]:true}));return;}
  if(phase!=='call')return;
  go(()=>{setPicked(c);setResults(r=>{const n=[...r];n[index]=c===scene.answer;return n;});setPhase('verdict');});
  if(scene.answer==='none')museumSfx.tick();else museumSfx.card();
  if(c===scene.answer)museumSfx.reveal();
 },[phase,index,scene,go]);
 const next=()=>{if(index+1<SCENES.length)go(()=>start(index+1));else{museumSfx.whistle();go(()=>setPhase('end'));}};

 useEffect(()=>{const k=(e:KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();onClose();return;}
  if(e.target instanceof HTMLElement&&e.target.closest('summary,a'))return;
  const c=CALLS.find(x=>x.key.toLowerCase()===e.key.toLowerCase());if(c&&!e.metaKey&&!e.ctrlKey)press(c.call);
 };window.addEventListener('keydown',k);return ()=>window.removeEventListener('keydown',k);},[press,onClose]);

 const lit:Call|null=phase==='intro'?introLit:phase==='verdict'?scene.answer:null;
 const right=results.filter(Boolean).length;
 const tint=phase==='intro'?introLit:null;
 const invite:Call|null=phase==='intro'?(!seen.yellow?'yellow':!seen.red?'red':null):null;
 const good=phase==='verdict'&&picked===scene.answer;

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: be the referee`} data-museum-experience="cards-1970" data-phase={phase} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <header className={styles.top}>
   <p className={styles.eyebrow}><span>{exhibit.year}</span> · {exhibit.title}</p>
  </header>

  <div className={styles.stage} data-tint={tint??undefined} data-street={phase==='intro'||undefined} data-end={phase==='end'||undefined} data-good={good||undefined}>
   {phase==='intro'?<StreetStage lit={introLit}/>
    :phase==='end'?<Ladder/>
    :<MatchStage scene={scene} token={token} rate={rate} reduced={reduced} onEnd={ended} revealed={phase==='verdict'?scene.answer:null}/>}
   {phase==='verdict'&&<div className={styles.flood} data-call={scene.answer} aria-hidden="true" key={'f'+index+token}/>}
   {phase==='verdict'&&scene.answer!=='none'&&<CardRaise call={scene.answer} key={'r'+index}/>}
   {(phase==='watch'||phase==='call'||phase==='verdict')&&<div className={styles.tag}>
    <span>Call {index+1} of {SCENES.length}<em> · made-up moment</em>{rate<1&&phase!=='call'?' · slow':''}</span>
    <ol className={styles.pips} aria-label={`${right} right so far`}>{SCENES.map((s,i)=><li key={s.id} data-state={i===index&&phase!=='verdict'?'now':results[i]===true?'right':results[i]===false?'wrong':undefined}/>)}</ol>
   </div>}
  </div>

  <div ref={panel} className={styles.panel} aria-live="polite">
   {phase==='intro'&&<Intro seen={seen} lit={introLit} onPlay={()=>go(()=>start(0))}/>}
   {(phase==='watch'||phase==='call')&&<div className={styles.block} key={'w'+index}>
    <p className={styles.kicker}>You are the referee</p>
    <h2 className={styles.big}>Watch number {scene.watch}.</h2>
    <p className={styles.lead}>{phase==='watch'?'What happens? Watch the moment it slows down.':compact?'Make the call: tap a light below.':'Make the call: tap a light.'} <span className={styles.keys}>Keys: G, Y, R</span></p>
    <div className={`${styles.row} ${styles.actions}`}><button type="button" className={styles.btn} onClick={replay} disabled={phase==='watch'}>Watch again (slow)</button></div>
   </div>}
   {phase==='verdict'&&picked&&<div className={styles.block} data-call={scene.answer} key={'v'+index}>
    <p className={styles.kicker} data-good={good||undefined}>{good?'Good call, ref!':`You said: ${NAME[picked]}. The Law says:`}</p>
    <h2 className={styles.big} style={{color:COLOR[scene.answer]}}>{scene.answer!=='none'&&<span className={styles.card} data-card={scene.answer} aria-hidden="true"/>}{scene.verdict}</h2>
    <p className={styles.law}>{scene.law}</p>
    <p className={styles.lead}>{scene.why}</p>
    <div className={`${styles.row} ${styles.actions}`}>
     <button type="button" className={styles.btn} onClick={replay}>Watch again</button>
     <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={next}>{index+1<SCENES.length?'Next call':'See the Law'}</button>
    </div>
   </div>}
   {phase==='end'&&<div className={styles.block}>
    <p className={styles.kicker}>Full time</p>
    <h2 className={styles.big}><span className={styles.score}>{right}<small>/{SCENES.length}</small></span>calls made like a referee.</h2>
    <p className={styles.lead}>Cards are not about punishing. They keep the game fair and keep players safe. {TWO_YELLOWS}</p>
    <p className={styles.take}><b>Take it to your game:</b> {CASE_FACTS.forYourGame}</p>
    <details className={styles.more} open={!compact}><summary>From the traffic light to the World Cup</summary>
     <ul className={styles.list}>
      <li>{CASE_FACTS.mexico}</li><li>{CASE_FACTS.language}</li>{FIRSTS.map(f=><li key={f}>{f}</li>)}
     </ul>
    </details>
    <Sources/>
    <div className={`${styles.row} ${styles.actions}`}><button type="button" className={`${styles.btn} ${styles.primary}`} onClick={()=>go(()=>{setResults([]);start(0);})}>Play again</button></div>
   </div>}
  </div>

  <div className={styles.signalWrap}>
   <div className={styles.signal} role="group" aria-label="Traffic light: your call">
    {CALLS.map(c=>{const on=lit===c.call||phase==='end',enabled=phase==='call'||phase==='intro';
     return <button key={c.call} type="button" data-museum-own-cue className={styles.lamp} data-call={c.call} data-on={on||undefined}
      data-picked={phase==='verdict'&&picked===c.call&&picked!==scene.answer||undefined} data-ready={phase==='call'||invite===c.call||undefined}
      disabled={!enabled} aria-pressed={on} aria-label={`${c.label}: ${c.sub} (key ${c.key})`} onClick={()=>press(c.call)}>
      <span className={styles.bulb} aria-hidden="true">{c.call==='none'?<svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>:<i/>}</span>
      <span className={styles.lampLabel} aria-hidden="true">{c.label}</span>
     </button>;})}
   </div>
   <div className={styles.pole} aria-hidden="true"/>
  </div>
 </section>;
}

function Intro({seen,lit,onPlay}:{seen:{yellow?:boolean;red?:boolean};lit:Call|null;onPlay:()=>void}){
 const both=seen.yellow&&seen.red;
 return <div className={styles.block} key={both?'b':'a'}>
  <p className={styles.kicker}>Real history · 1966</p>
  <h2 className={styles.big}>A light that changed football</h2>
  {both?<>
   <p className={styles.idea}>{CASE_FACTS.aston}</p>
   <p className={styles.story}>{CASE_FACTS.mexico} {CASE_FACTS.language}</p>
   <div className={`${styles.row} ${styles.actions}`}><button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onPlay}>Be the referee</button></div>
  </>:<>
   {!seen.yellow&&<p className={styles.prompt}>Tap the <b style={{color:'var(--amber)'}}>amber</b> light to see Ken Aston’s idea.</p>}
   {seen.yellow&&<p className={styles.prompt}><span style={{color:'var(--amber)'}}>Yellow means careful…</span> Now tap the <b style={{color:'var(--red)'}}>red</b> light.</p>}
   {lit==='none'&&<p className={styles.story}>Green means go: the game flows on.</p>}
   {STORY_1966.map(l=><p key={l} className={styles.story}>{l}</p>)}
  </>}
  <Sources/>
 </div>;
}

/** The referee's arm raising the card from the bottom corner of the replay (a CSS spring, once). */
function CardRaise({call}:{call:Call}){
 return <svg className={styles.raise} viewBox="0 0 120 200" aria-hidden="true">
  <path d="M48,200 L58,128 Q60,116 70,114 L84,112 Q92,112 92,122 L90,200 Z" fill="#0b0c10"/>
  <path d="M56,132 L92,128" stroke="#e9e6dc" strokeWidth="4" opacity=".75"/>
  <g transform="rotate(-8 74 60)"><rect x="46" y="10" width="56" height="80" rx="6" fill={call==='red'?'var(--red)':'var(--amber)'}/><rect x="46" y="10" width="56" height="80" rx="6" fill="url(#c70cardSheen)"/></g>
  <defs><linearGradient id="c70cardSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35"/><stop offset=".5" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".18"/></linearGradient></defs>
  <path d="M62,118 Q58,96 66,86 L72,82 Q78,80 80,86 L82,96 L86,84 Q90,80 94,86 L92,118 Z" fill="#0b0c10"/>
 </svg>;
}

function Ladder(){
 return <div className={styles.ladder} role="img" aria-label="Law 12 as a traffic light: careless is a free kick with no card, reckless is a yellow card, excessive force is a red card.">
  <p className={styles.kicker}>Law 12 as a traffic light</p>
  {[...LADDER].reverse().map((s,i)=><div key={s.call} className={styles.rung} data-call={s.call} style={{animationDelay:`${.15+i*.22}s`}}><i aria-hidden="true"/><div><b>{s.word}</b><span>{s.card}</span><small>{s.plain}</small></div></div>)}
 </div>;
}

function Sources(){
 return <details className={styles.sources}><summary>Sources</summary>
  <p>The six practice calls are made-up moments, judged by the Laws of the Game. The history is real:</p>
  <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
 </details>;
}
