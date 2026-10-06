'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {GRAD_TITLES,capRewardFor} from '@/lib/endgame/graduationModel';
import {isCertificateId,type CertificateId} from '@/lib/endgame/certificate';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {COPY,IDEAS,PLINTHS,SOURCES,ferryLine,nextStep,type Plinth} from './hallData';
import {lessonNames,readPathProgress,type PathProgress} from './progress';
import styles from './Experience.module.css';

/**
 * Hall of Fame (Oct 5 2026): the one museum room about the PLAYER. Four plinths step up like stairs (futsal → 7v7 → 9v9 →
 * 11v11, the spaces grow); an earned one is lit by a beam and holds its certificate (tap → the host's certificate view), an
 * unearned one holds an empty frame waiting for its certificate, and the next one to win gets a pilot light and a "Next up" tag.
 * "Same idea, different space" lights the lesson where each big idea comes back in every path, and a rail at the bottom
 * tracks the Matchday Ferry goal.
 *
 * Polish pass (Oct 5 2026): on phones (and short landscape screens) the four plinths stay on one row so the whole staircase
 * is on the first screen; the per-plinth notes move into one caption card under the stairs (tap a plinth to read it).
 *
 * Heat: no canvas, no WebGL, no animation loop. The entrance (plinths rise, beams switch on) is a finite CSS animation that
 * runs once; everything else is static until the player taps. Progress is read from storage once on open. Sound is a
 * one-shot after a tap through the museum's shared, mute-aware AudioContext.
 */
const sfx=(cue:'reveal'|'click'|'look')=>{try{museumSfx[cue]();}catch{/* sound is optional */}};
/** Compact layout: phone portrait or a short (phone landscape) screen. Must match the CSS media queries. */
const COMPACT='(max-width:620px),(max-height:480px)';

/** Development only: /museum-lab/hall-of-fame?earned=grad:futsal,grad:7v7,diploma previews earned states (the lab passes none). */
function devEarned(earned:readonly CertificateId[]):readonly CertificateId[]{
 if(process.env.NODE_ENV==='production'||typeof location==='undefined')return earned;
 const q=new URLSearchParams(location.search).get('earned');return q==null?earned:q.split(',').filter(isCertificateId);
}
function useCompact(){
 const [compact,setCompact]=useState(false);
 useEffect(()=>{const m=matchMedia(COMPACT),on=()=>setCompact(m.matches);on();m.addEventListener('change',on);return()=>m.removeEventListener('change',on);},[]);
 return compact;
}

export default function Experience({exhibit,onClose,earned:given,openCertificate}:ExperienceProps){
 const root=useRef<HTMLElement>(null);
 const compact=useCompact();
 const [earned,setEarned]=useState(given);useEffect(()=>setEarned(devEarned(given)),[given]);
 const [progress,setProgress]=useState<Record<string,PathProgress>>(lessonNames);
 const [idea,setIdea]=useState<string|null>(null);
 const [picked,setPicked]=useState<number|null>(null);
 const has=useMemo(()=>new Set<CertificateId>(earned),[earned]);
 const won=(p:Plinth)=>has.has(`grad:${p.format}`);
 const count=PLINTHS.filter(won).length,champion=has.has('diploma');
 const nextAt=PLINTHS.findIndex(p=>!won(p));
 const sel=picked??(nextAt<0?PLINTHS.length-1:nextAt);
 const chosen=IDEAS.find(i=>i.id===idea)??null;
 const prog=(p:Plinth)=>progress[p.format]??{done:0,total:12,names:{}};
 const lessonIn=(p:Plinth)=>chosen?prog(p).names[chosen.lessons[p.format]]:null;

 useEffect(()=>{setProgress(readPathProgress());root.current?.focus();},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape'||e.defaultPrevented)return;if(document.querySelector('dialog[open]'))return;/* the host's certificate is on top: let it close first */onClose();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);

 const open=(id:CertificateId)=>{sfx('reveal');openCertificate(id);};
 const pick=(i:number)=>{sfx('click');setPicked(i);};
 const cur=PLINTHS[sel],curWon=won(cur),curProg=prog(cur),curLesson=lessonIn(cur);

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.title}: ${count} of 4 paths graduated`} data-museum-experience="hall-of-fame" data-earned={count} data-compact={compact} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <div className={styles.scroll} data-hof-scroll>
   <header className={styles.head}>
    <p className={styles.kicker}>{COPY.kicker}</p>
    <h1 className={styles.title}>{COPY.title}</h1>
    <p className={styles.lede}>{COPY.fact1} <span className={styles.count}>{count===0?'Your first one is waiting.':count>=4?'All 4 are here!':`${count} of 4 so far.`}</span></p>
   </header>

   <div className={styles.show}>
    <ol className={styles.stage} aria-label="Your four paths, from the smallest space to the biggest">
     {PLINTHS.map((p,i)=>{const id=`grad:${p.format}` as CertificateId,w=won(p),cap=capRewardFor(p.format),pr=prog(p),lesson=lessonIn(p),next=i===nextAt;
      return <li key={p.format} className={styles.slot} data-earned={w} data-next={next} data-lit={!!lesson} data-sel={compact&&i===sel}
       style={{'--i':i,'--cap':cap.color,'--cap2':p.glow} as CSSProperties}>
       {compact&&<button type="button" className={styles.pick} data-pick={p.format} aria-pressed={i===sel} onClick={()=>pick(i)}
        aria-label={`${p.name}, ${p.aSide} a side: ${w?'graduated':`${pr.done} of ${pr.total} lessons`}. Show details.`}/>}
       {(w||next)&&<span className={styles.beam} aria-hidden="true"/>}
       <div className={styles.object}>
        {next&&!w&&<span className={styles.nextTag} aria-hidden="true">Next up</span>}
        {w
         ?<button type="button" className={styles.cert} onClick={()=>open(id)} aria-label={`${GRAD_TITLES[p.format]} Graduate certificate. Open it.`}>
           <span className={styles.certBand}/>
           <span className={styles.certKicker}>Graduate</span>
           <span className={styles.certTitle}>{p.name}</span>
           <span className={styles.certTicks} aria-hidden="true">{Array.from({length:6},(_,k)=><i key={k}/>)}</span>
           <span className={styles.certSeal} aria-hidden="true"/>
           <span className={styles.certOpen}>Open</span>
          </button>
         :<div className={styles.frame} aria-hidden="true"><Ring done={pr.done} total={pr.total}/><span className={styles.frameNote}>Your certificate goes here</span></div>}
       </div>
       <div className={styles.plinth}>
        <Pitch plinth={p} lit={w}/>
        <div className={styles.plate}>
         <p key={'name-'+(idea??'')} className={styles.name}>{p.name}</p>
         <p className={styles.aside}>{p.aSide} a side</p>
        </div>
        {!compact&&<p key={'note-'+(idea??'')} className={styles.note} aria-live="polite">
         {lesson?<><span className={styles.noteTag}>In this path</span>{lesson}</>
          :w?'Graduated! Tap your certificate.'
          :nextStep(p.name,pr.done,pr.total)}
        </p>}
       </div>
      </li>;})}
    </ol>

    {compact&&<div className={styles.card} data-earned={curWon} style={{'--at':sel,'--cap':capRewardFor(cur.format).color,'--cap2':cur.glow} as CSSProperties} aria-live="polite">
     <div key={`${cur.format}-${idea??''}`} className={styles.cardIn}>
      <p className={styles.cardKicker}>{curWon?'Graduated':sel===nextAt?'Next up':'Still to come'} · {cur.aSide} a side</p>
      <h2 className={styles.cardTitle}>{cur.name}</h2>
      <p className={styles.cardText}>
       {curLesson?<><span className={styles.noteTag}>In this path · {chosen?.label}</span>{curLesson}</>
        :curWon?`You graduated the ${cur.name} path. Your certificate hangs on its plinth.`
        :nextStep(cur.name,curProg.done,curProg.total)}
      </p>
      {curWon
       ?<button type="button" className={styles.cardBtn} onClick={()=>open(`grad:${cur.format}`)}>Open certificate</button>
       :<div className={styles.bar} role="img" aria-label={`${curProg.done} of ${curProg.total} starter lessons done`}><i style={{width:`${curProg.total?Math.round(100*curProg.done/curProg.total):0}%`}}/><span>{curProg.done} of {curProg.total} lessons</span></div>}
     </div>
    </div>}
   </div>

   <section className={styles.ideas} aria-labelledby="hof-ideas">
    <h2 id="hof-ideas" className={styles.h2}>{COPY.ideasTitle}</h2>
    <p key={'hint-'+(idea??'')} className={styles.hint}>{chosen?chosen.why:COPY.ideasHint}</p>
    <div className={styles.chips} role="group" aria-label="Big ideas">
     {IDEAS.map(x=><button key={x.id} type="button" className={styles.chip} aria-pressed={idea===x.id} onClick={()=>{sfx('click');setIdea(idea===x.id?null:x.id);}}>{x.label}</button>)}
    </div>
    {chosen&&compact&&<ul key={'list-'+chosen.id} className={styles.ideaList} aria-label={`${chosen.label}: the lesson in each path`}>{PLINTHS.map(p=><li key={p.format} data-earned={won(p)} style={{'--i':PLINTHS.indexOf(p)} as CSSProperties}><b>{p.name}</b><span>{prog(p).names[chosen.lessons[p.format]]}</span></li>)}</ul>}
    <p className={styles.takeaway}>{COPY.takeaway}</p>
   </section>

   <section className={styles.ferry} aria-label="The Matchday Ferry goal">
    <ol className={styles.rail} aria-hidden="true">
     {PLINTHS.map(p=><li key={p.format} data-on={won(p)} style={{'--cap':capRewardFor(p.format).color} as CSSProperties}><span>{p.name}</span></li>)}
     <li className={styles.boat} data-on={count>=4} data-gold={champion}><Boat/></li>
    </ol>
    <p className={styles.ferryText}>{champion?COPY.champion:ferryLine(count)}</p>
    {count<4&&<p className={styles.ferryFact}>{COPY.fact2}</p>}
    {champion&&<button type="button" className={styles.diploma} onClick={()=>open('diploma')}>Open your Island Diploma</button>}
   </section>

   <details className={styles.sources}>
    <summary>Sources and what’s game fiction</summary>
    <p>{COPY.gameNote} The little pitches show one team’s shape as a picture only, not to scale.</p>
    <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
   </details>
  </div>
 </section>;
}

/** One team's shape on its pitch, drawn bigger as the paths get bigger (picture only, not to scale). */
function Pitch({plinth,lit}:{plinth:Plinth;lit:boolean}){
 return <svg className={styles.pitch} viewBox="0 0 100 64" style={{width:`${plinth.scale*100}%`}} role="img" aria-label={`${plinth.name}: ${plinth.aSide} players a side, shape ${plinth.shape}`}>
  <rect x="1" y="1" width="98" height="62" rx="3" className={styles.turf}/>
  {lit&&[0,2,4,6,8].map(k=><rect key={k} x={1+k*12.25} y="1" width="12.25" height="62" className={styles.stripe}/>)}
  <line x1="50" y1="1" x2="50" y2="63" className={styles.line}/><circle cx="50" cy="32" r="9" className={styles.line}/><circle cx="50" cy="32" r="1" className={styles.spot}/>
  <rect x="1" y="18" width="12" height="28" className={styles.line}/><rect x="87" y="18" width="12" height="28" className={styles.line}/>
  <rect x="1" y="1" width="98" height="62" rx="3" className={styles.edge}/>
  {plinth.dots.map(([x,y],k)=><circle key={k} cx={x} cy={y} r={k===0?3.6:3.2} className={k===0?styles.keeper:styles.dot} data-lit={lit}/>)}
 </svg>;
}
function Ring({done,total}:{done:number;total:number}){
 const r=22,c=2*Math.PI*r,f=total?Math.min(1,done/total):0;
 return <svg viewBox="0 0 56 56" className={styles.ring}><circle cx="28" cy="28" r={r} className={styles.ringBg}/>{f>0&&<circle cx="28" cy="28" r={r} className={styles.ringFg} strokeDasharray={`${c*f} ${c}`} transform="rotate(-90 28 28)"/>}
  <text x="28" y={total?27:32} className={styles.ringNum}>{done}</text><text x="28" y="38" className={styles.ringOf}>of {total}</text></svg>;
}
function Boat(){
 return <svg viewBox="0 0 48 32" width="44" height="30"><path d="M4 20h40l-6 9H10z" className={styles.hull}/><rect x="14" y="11" width="18" height="9" rx="2" className={styles.cabin}/><rect x="24" y="4" width="4" height="7" className={styles.cabin}/><path d="M2 30q5-3 10 0t10 0 10 0 10 0" className={styles.wave}/></svg>;
}
