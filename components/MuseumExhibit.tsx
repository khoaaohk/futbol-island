'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {EXHIBIT_INTERACTIVES,type ExhibitInteractive} from '@/lib/endgame/museum';
import {CERT_SLOTS} from '@/lib/museum/museumAtlas';
import {museumSfx} from '@/lib/museum/museumSound';
import styles from './MuseumRoom.module.css';

/**
 * The hands-on part of an open case in the walk-in museum (Oct 3 2026). Config and every quoted line come from
 * lib/endgame/museum.ts EXHIBIT_INTERACTIVES (copied word for word from the case's own sourced facts; no new facts). DOM only:
 * buttons ≥ 44 px, nothing animates on its own except the one-shot card raise (none with reduced motion).
 */
export type ExhibitHooks={spin:(dir:1|-1)=>void;rain:(on:boolean)=>void;certificate:(id:string)=>void;earned:readonly string[]};
export default function MuseumExhibit({id,hooks}:{id:string;hooks:ExhibitHooks}){
 const cfg=EXHIBIT_INTERACTIVES[id];if(!cfg)return null;
 return <section className={styles.hands} data-museum-interactive={cfg.kind} aria-label={cfg.label}>
  <h4>{cfg.label}</h4>
  <Body cfg={cfg} hooks={hooks}/>
 </section>;
}

function Body({cfg,hooks}:{cfg:ExhibitInteractive;hooks:ExhibitHooks}){
 switch(cfg.kind){
  case 'whistle':return <Whistle quote={cfg.quote}/>;
  case 'cards':return <Cards cards={cfg.cards}/>;
  case 'var':return <Var cfg={cfg}/>;
  case 'compare':return <Compare cfg={cfg} rain={hooks.rain}/>;
  case 'spin':return <Spin quote={cfg.quote} spin={hooks.spin}/>;
  case 'kit':return <Kit numbers={cfg.numbers}/>;
  case 'hall':return <Certificates earned={hooks.earned} open={hooks.certificate}/>;
 }
}

function Whistle({quote}:{quote:string}){
 const [blown,setBlown]=useState(0);
 return <><button type="button" className={styles.gold} data-museum-own-cue data-museum-whistle onClick={()=>{museumSfx.whistle();setBlown(n=>n+1);try{navigator.vibrate?.([30,40,60]);}catch{/* no haptics */}}}>Blow the whistle</button>
  {blown>0&&<p className={styles.quote} role="status" data-museum-whistle-blown={blown}>Penalty! {quote}</p>}</>;
}

/** The raised card sits over the hall, not inside the scrolling card (its translate would trap position:fixed). */
const portal=(node:React.ReactNode)=>{const host=typeof document!=='undefined'?document.querySelector('[data-museum-room]'):null;return host?createPortal(node,host):node;};
function Cards({cards}:{cards:Extract<ExhibitInteractive,{kind:'cards'}>['cards']}){
 const [up,setUp]=useState<{i:number;key:number}|null>(null);
 useEffect(()=>{if(!up)return;const t=setTimeout(()=>setUp(null),2600);return()=>clearTimeout(t);},[up]);
 const card=up?cards[up.i]:null;
 return <><div className={styles.row}>{cards.map((c,i)=><button key={c.color} type="button" className={styles.cardButton} data-color={c.color} data-museum-own-cue data-museum-card-button={c.color} onClick={()=>{museumSfx.card();setUp({i,key:Date.now()});}}>
   <i aria-hidden="true"/>{c.color==='yellow'?'Yellow card':'Red card'}</button>)}</div>
  {card&&portal(<div key={up!.key} className={styles.bigCard} data-color={card.color} data-museum-card-up={card.color} role="status" onClick={()=>setUp(null)}>
   <span className={styles.bigCardFace} aria-hidden="true"/><b>{card.word}!</b><p>{card.quote.charAt(0).toUpperCase()+card.quote.slice(1)}{/[.!?]$/.test(card.quote)?'':'.'}</p></div>)}</>;
}

/** A made-up practice replay (labelled): three frames of a ball flying at the line, then you decide. */
function Var({cfg}:{cfg:Extract<ExhibitInteractive,{kind:'var'}>}){
 // The practice moment alternates: the ball ends clearly over the line (goal) or clearly still on it (no goal). Random start.
 const [scene,setScene]=useState<'over'|'on'>(()=>Math.random()<.5?'over':'on'),[step,setStep]=useState(0),[call,setCall]=useState<'goal'|'no-goal'|null>(null);
 const frames=cfg.frames,correct=scene==='over'?'goal':'no-goal',close=step>=frames.length-1;
 const bx=step===0?22:scene==='over'?96:84;
 return <div className={styles.var} data-museum-var-scene={scene}>
  {!close?<svg viewBox="0 0 120 64" className={styles.varScreen} role="img" aria-label={`Practice replay, frame ${step+1} of ${frames.length}: ${frames[step]}`}>
   <rect width="120" height="64" rx="6" fill="#1d3a2c"/><rect x="4" y="4" width="112" height="56" rx="3" fill="#3f8f55"/>
   <path d="M84 4v56" stroke="#fff1d3" strokeWidth="2.5"/><path d="M84 14h28v36H84" fill="none" stroke="#fff1d3" strokeWidth="1.5" strokeDasharray="3 2"/>
   <circle cx={bx} cy="34" r="5" fill="#fff" stroke="#22366b" strokeWidth="1.2"/>
   <text x="8" y="14" fontSize="8" fontWeight="900" fill="#fff1d3">VAR · PRACTICE</text></svg>
  :<svg viewBox="0 0 120 64" className={styles.varScreen} role="img" aria-label={`Practice replay close-up: ${scene==='over'?'the whole ball is past the goal line':'part of the ball is still on the goal line'}`} data-museum-var-closeup={scene}>
   <rect width="120" height="64" rx="6" fill="#1d3a2c"/><rect x="4" y="4" width="112" height="56" rx="3" fill="#3f8f55"/>
   <rect x="56" y="4" width="6" height="56" fill="#fff1d3"/><text x="8" y="14" fontSize="8" fontWeight="900" fill="#fff1d3">CLOSE-UP</text>
   <text x="64" y="58" fontSize="6" fontWeight="800" fill="#fff1d3">GOAL ›</text>
   <circle cx={scene==='over'?89:59} cy="34" r="17" fill="#fff" stroke="#22366b" strokeWidth="2"/></svg>}
  <p className={styles.small} aria-live="polite" data-museum-var-frame={step}>{frames[step]}</p>
  {!close?<button type="button" className={styles.gold} data-museum-var-next onClick={()=>{museumSfx.look();setStep(s=>s+1);}}>Next frame</button>
   :!call?<div className={styles.row}><button type="button" className={styles.gold} data-museum-var-call="goal" onClick={()=>{museumSfx.reveal();setCall('goal');}}>Goal</button><button type="button" className={styles.mint} data-museum-var-call="no-goal" onClick={()=>{museumSfx.reveal();setCall('no-goal');}}>No goal</button></div>
   :<><p className={styles.quote} role="status" data-museum-var-decision={call} data-correct={call===correct}><b>{call===correct?'Right!':'Not quite.'}</b> {scene==='over'?cfg.over:cfg.on} {cfg.rule} {cfg.quote}</p>
    <button type="button" className={styles.mint} data-museum-var-again onClick={()=>{setScene(s=>s==='over'?'on':'over');setStep(0);setCall(null);}}>Watch another</button></>}
 </div>;
}

function Compare({cfg,rain}:{cfg:Extract<ExhibitInteractive,{kind:'compare'}>;rain:(on:boolean)=>void}){
 const [wet,setWet]=useState(false);
 useEffect(()=>()=>rain(false),[rain]);
 return <><div className={styles.compare}>
   <div data-wet={wet||undefined}><b>{cfg.old.title}</b><small>{wet?cfg.old.quote:'Brown leather with laces.'}</small></div>
   <div><b>{cfg.now.title}</b><small>{cfg.now.quote.charAt(0).toUpperCase()+cfg.now.quote.slice(1)}.</small></div>
  </div>
  <button type="button" className={wet?styles.mint:styles.gold} aria-pressed={wet} data-museum-rain={wet} onClick={()=>{const next=!wet;setWet(next);rain(next);museumSfx.look();}}>{wet?'Dry it out':'Rainy day'}</button>
  <p className={styles.small}>{cfg.young.quote}</p></>;
}

function Spin({quote,spin}:{quote:string;spin:(dir:1|-1)=>void}){
 return <><div className={styles.row}><button type="button" className={styles.round} data-museum-own-cue data-museum-spin="-1" aria-label="Spin the ball left" onClick={()=>spin(-1)}>⟲</button>
  <button type="button" className={styles.round} data-museum-own-cue data-museum-spin="1" aria-label="Spin the ball right" onClick={()=>spin(1)}>⟳</button><span className={styles.small}>Or drag the ball to spin it.</span></div>
  <p className={styles.quote}>{quote}</p></>;
}

function Kit({numbers}:{numbers:{n:number;quote:string}[]}){
 const [pick,setPick]=useState<number|null>(null),q=numbers.find(x=>x.n===pick);
 return <><div className={styles.row}>{numbers.map(x=><button key={x.n} type="button" className={styles.shirt} data-museum-kit={x.n} aria-pressed={pick===x.n} aria-label={`Shirt number ${x.n}`} onClick={()=>{setPick(x.n);museumSfx.look();}}><span aria-hidden="true">{x.n}</span></button>)}</div>
  <p className={styles.quote} role="status">{q?`Classic numbers followed positions: ${q.quote}.`:'Tap a shirt on the kit wall.'}</p></>;
}

export function Certificates({earned,open}:{earned:readonly string[];open:(id:string)=>void}){
 return <ul className={styles.certs} role="list">{CERT_SLOTS.map(c=>{const got=earned.includes(c.id);return <li key={c.id}>
  {got?<button type="button" className={styles.gold} data-museum-cert={c.id} onClick={()=>open(c.id)}>{c.title}</button>
   :<span className={styles.certEmpty} data-museum-cert-empty={c.id}><b>{c.title}</b>{c.id==='diploma'?'Graduate all four paths and win your Matchday final to hang it here.':'Graduate a path to hang one here.'}</span>}
 </li>;})}</ul>;
}
