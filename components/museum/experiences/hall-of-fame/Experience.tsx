'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {GRAD_TITLES,capRewardFor} from '@/lib/endgame/graduationModel';
import {isCertificateId,type CertificateId} from '@/lib/endgame/certificate';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import {COPY,IDEAS,PLINTHS,SOURCES,ferryLine,nextStep,type Plinth} from './hallData';
import {END,LEGENDS,LEGEND_SOURCES,POSITIONS,QUIZ,STYLE_NOTES,handlePath,progressAt,type Legend} from './legends';
import {flipFrom,glide,reduced,springEasing,springTo} from './motion';
import Print,{type PrintHandle} from './Print';
import {lessonNames,readPathProgress,type PathProgress} from './progress';
import styles from './Experience.module.css';

/**
 * Hall of Fame as a gallery of woodblock prints (Oct 9 2026; user: "the museum is a playground for different styles … Japanese
 * style"; the room's style is ukiyo-e: flat colour, bold key-block outlines, bokashi gradients, a cartouche for the name).
 *
 * Beat 1, the legends: six original prints, one legend per position, printed block by block as the room opens. Pick one and it
 * flies forward (FLIP); the brush line on the print is the move that position is famous for. Drag along it and the move plays
 * under your finger (the run, the dive, the pass); reach the red circle and it finishes by itself, then the job, a takeaway
 * and one sourced fact appear. Keyboard: the print is a slider (arrows), and "Play the move" plays it.
 * Beat 2, your print: the player's four paths as four panels. A graduated path is printed in colour and holds its certificate;
 * the rest are key-block proofs, waiting for their colours. "Same idea, different space" lights each path's lesson, and the
 * Matchday Ferry rail closes the room. The case's own facts and takeaway (lib/endgame/museum.ts) are kept word for word.
 *
 * Heat: SVG + DOM. No loop at rest: a spring or glide runs animation frames only while a move settles (motion.ts), a drag
 * writes attributes straight from pointer events, the entrance is finite CSS, and progress is read from storage once.
 */
const sfx=(cue:'reveal'|'click'|'look'|'kick'|'stamp'|'net')=>{try{museumSfx[cue]();}catch{/* sound is optional */}};

/** Development only: /museum-lab/hall-of-fame?earned=grad:futsal,grad:7v7,diploma previews earned states (the lab passes none). */
function devEarned(earned:readonly CertificateId[]):readonly CertificateId[]{
 if(process.env.NODE_ENV==='production'||typeof location==='undefined')return earned;
 const q=new URLSearchParams(location.search).get('earned');return q==null?earned:q.split(',').filter(isCertificateId);
}

export default function Experience({exhibit,onClose,earned:given,openCertificate}:ExperienceProps){
 const root=useRef<HTMLElement>(null);
 const [earned,setEarned]=useState(given);useEffect(()=>setEarned(devEarned(given)),[given]);
 const [progress,setProgress]=useState<Record<string,PathProgress>>(lessonNames);
 const [idea,setIdea]=useState<string|null>(null);
 const [open,setOpen]=useState<number|null>(null);
 const [played,setPlayed]=useState<ReadonlySet<string>>(()=>new Set());
 const has=useMemo(()=>new Set<CertificateId>(earned),[earned]);
 const won=(p:Plinth)=>has.has(`grad:${p.format}`);
 const count=PLINTHS.filter(won).length,champion=has.has('diploma');
 const nextAt=PLINTHS.findIndex(p=>!won(p));
 const chosen=IDEAS.find(i=>i.id===idea)??null;
 const prog=(p:Plinth)=>progress[p.format]??{done:0,total:12,names:{}};

 useEffect(()=>{setProgress(readPathProgress());root.current?.focus();},[]);
 const closeViewer=useRef<()=>void>(()=>{});
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape'||e.defaultPrevented)return;if(document.querySelector('dialog[open]'))return;/* the host's certificate is on top: let it close first */
   e.preventDefault();if(document.querySelector('[data-hof-viewer]')){closeViewer.current();return;}onClose();};
  document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);

 const openCert=(id:CertificateId)=>{sfx('reveal');openCertificate(id);};
 const thumbs=useRef<(HTMLButtonElement|null)[]>([]),scroller=useRef<HTMLDivElement>(null);
 // The viewer is modal: the room behind it is inert while it is open.
 useEffect(()=>{scroller.current?.toggleAttribute('inert',open!==null);},[open]);
 const pick=(i:number)=>{sfx('look');setOpen(i);};

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.title}: ${count} of 4 paths graduated`} data-museum-experience="hall-of-fame" data-earned={count} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <div ref={scroller} className={styles.scroll} data-hof-scroll>
   <header className={styles.head}>
    <p className={styles.kicker}>{COPY.kicker}</p>
    <h1 className={styles.title}><span>{COPY.title}</span></h1>
    <p className={styles.lede}>{COPY.fact1} <span className={styles.count}>{count===0?'Your first one is waiting.':count>=4?'All 4 are here!':`${count} of 4 so far.`}</span></p>
   </header>

   <section className={styles.legends} aria-labelledby="hof-legends">
    <h2 id="hof-legends" className={styles.h2}>Legends of the game</h2>
    <p className={styles.sub}>Every position has a job, and every job has its heroes: one from the women’s game and one from the men’s. Pick a print and play the move!</p>
    <ul className={styles.gallery}>
     {POSITIONS.map((pos,k)=><li key={pos.position} className={styles.pair} style={{'--k':k} as CSSProperties}>
      <div className={styles.pairPrints}>
       {pos.legends.map(l=>{const i=LEGENDS.indexOf(l);return <button key={l.id} type="button" ref={el=>{thumbs.current[i]=el;}} className={styles.thumb} data-legend={l.id} data-game={l.game} data-played={played.has(l.id)||undefined} data-hidden={open===i||undefined}
        style={{'--i':i} as CSSProperties} onClick={()=>pick(i)} aria-label={`${l.name}, ${l.position}. ${played.has(l.id)?'Played. ':''}Open the print and play the move.`}>
        <Print legend={l} t={.55} label=""/>
        <span className={styles.thumbName}>{l.name}</span>
        {played.has(l.id)&&<span className={styles.playedSeal} aria-hidden="true">Played</span>}
       </button>;})}
      </div>
      <span className={styles.thumbPos}>{pos.position}</span>
     </li>)}
    </ul>
    <p className={styles.playedCount} aria-live="polite">{played.size===0?'12 prints, 6 jobs.':played.size>=LEGENDS.length?'Every move played. What a gallery!':`${played.size} of ${LEGENDS.length} moves played.`}</p>
   </section>

   <JobCheck/>

   <section className={styles.yours} aria-labelledby="hof-yours">
    <h2 id="hof-yours" className={styles.h2}>Your print</h2>
    <p className={styles.sub}>Each path you graduate prints its panel in colour. Until then it waits as a black-line proof.</p>
    <ol className={styles.panels} aria-label="Your four paths, from the smallest space to the biggest">
     {PLINTHS.map((p,i)=>{const id=`grad:${p.format}` as CertificateId,w=won(p),pr=prog(p),lesson=chosen?pr.names[chosen.lessons[p.format]]:null,next=i===nextAt;
      return <li key={p.format} className={styles.panel} data-earned={w} data-next={next||undefined} style={{'--i':i,'--cap':capRewardFor(p.format).color} as CSSProperties}>
       <PathPanel plinth={p} lit={w}/>
       {next&&!w&&<span className={styles.nextTag}>Next up</span>}
       <div className={styles.panelText}>
        {lesson?<p key={'l-'+idea} className={styles.lesson}><span className={styles.noteTag}>In this path</span>{lesson}</p>
         :w?<p className={styles.note}>Graduated! Your {GRAD_TITLES[p.format]} certificate hangs here.</p>
         :<p className={styles.note}>{nextStep(p.name,pr.done,pr.total)}</p>}
        {w?<button type="button" className={styles.certBtn} onClick={()=>openCert(id)} aria-label={`${GRAD_TITLES[p.format]} Graduate certificate. Open it.`}>Open certificate</button>
         :<div className={styles.bar} role="img" aria-label={`${pr.done} of ${pr.total} starter lessons done`}><i style={{width:`${pr.total?Math.round(100*pr.done/pr.total):0}%`}}/><span>{pr.done} of {pr.total}</span></div>}
       </div>
      </li>;})}
    </ol>

    <div className={styles.ideas}>
     <h3 className={styles.h3}>{COPY.ideasTitle}</h3>
     <p key={'hint-'+(idea??'')} className={styles.hint} aria-live="polite">{chosen?chosen.why:COPY.ideasHint}</p>
     <div className={styles.chips} role="group" aria-label="Big ideas">
      {IDEAS.map(x=><button key={x.id} type="button" className={styles.chip} aria-pressed={idea===x.id} onClick={()=>{sfx('click');setIdea(idea===x.id?null:x.id);}}>{x.label}</button>)}
     </div>
     <p className={styles.takeaway}>{COPY.takeaway}</p>
    </div>
   </section>

   <section className={styles.ferry} aria-label="The Matchday Ferry goal">
    <ol className={styles.rail} aria-hidden="true">
     {PLINTHS.map(p=><li key={p.format} data-on={won(p)}><span>{p.name}</span></li>)}
     <li className={styles.boat} data-on={count>=4} data-gold={champion}><Boat/></li>
    </ol>
    <p className={styles.ferryText}>{champion?COPY.champion:ferryLine(count)}</p>
    {count<4&&<p className={styles.ferryFact}>{COPY.fact2}</p>}
    {champion&&<button type="button" className={styles.diploma} onClick={()=>openCert('diploma')}>Open your Island Diploma</button>}
   </section>

   <details className={styles.sources}>
    <summary>Sources and what’s game fiction</summary>
    <p>{COPY.gameNote} The little pitches show one team’s shape as a picture only, not to scale. The legends’ moves are pictures of each position’s job, not replays of real matches.</p>
    <p>{STYLE_NOTES}</p>
    <ul>{[...SOURCES,...LEGEND_SOURCES].map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
   </details>
  </div>

  {open!==null&&<Viewer key="viewer" index={open} from={thumbs.current[open]} closeRef={closeViewer}
   onClose={()=>{const i=open;setOpen(null);setTimeout(()=>thumbs.current[i]?.focus(),0);}}
   onNext={()=>setOpen(o=>o===null?null:(o+1)%LEGENDS.length)}
   onPlayed={id=>setPlayed(s=>new Set(s).add(id))}/>}
 </section>;
}

/**
 * The print, brought forward. The finger drags the ball (or the player) along the brush line; t follows the finger directly
 * (no easing under the finger). Let go before the red circle and the move springs back to the start with the release velocity;
 * reach it and the rest of the move plays by itself. Keys: arrows scrub, Enter or "Play the move" plays it.
 */
function Viewer({index,from,onClose,onNext,onPlayed,closeRef}:{index:number;from:HTMLElement|null;onClose:()=>void;onNext:()=>void;onPlayed:(id:string)=>void;closeRef:{current:()=>void}}){
 const l:Legend=LEGENDS[index];
 const print=useRef<PrintHandle>(null),frame=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null),seal=useRef<HTMLSpanElement>(null);
 const t=useRef(0),stop=useRef<()=>void>(()=>{}),path=useMemo(()=>handlePath(l),[l]);
 const [done,setDone]=useState(false),[pct,setPct]=useState(0),[nudge,setNudge]=useState(false);
 const set=useCallback((x:number)=>{t.current=x;print.current?.apply(x);const p=Math.round(Math.min(1,x)*100);setPct(q=>q===p?q:p);},[]);

 // Shared-element entrance: the thumbnail's print flies into the viewer on a spring; the words follow in a stagger (CSS).
 useEffect(()=>{const el=frame.current;if(el&&from)flipFrom(el,from.getBoundingClientRect());panel.current?.focus({preventScroll:true});},[]);// eslint-disable-line react-hooks/exhaustive-deps
 // A new legend: reset the move.
 useEffect(()=>{stop.current();setDone(false);setNudge(false);set(0);},[index,set]);
 useEffect(()=>()=>stop.current(),[]);

 const finish=useCallback(()=>{stop.current();sfx(l.scene==='goal'?'net':'kick');
  stop.current=glide(t.current,END,900,set,()=>{setDone(true);onPlayed(l.id);sfx('reveal');
   const s=seal.current;if(s&&!reduced()){const e=springEasing(320,17);s.animate([{transform:'scale(1.8) rotate(-14deg)',opacity:0},{transform:'rotate(-6deg)',opacity:1}],{duration:e.ms,easing:e.easing});}});},[l,set,onPlayed]);
 const play=()=>{if(done){stop.current();set(0);setDone(false);}stop.current();sfx('click');stop.current=glide(t.current<1?t.current:0,1,1100,set,finish);};

 // ---- drag along the brush line ----
 const drag=useRef<{id:number;s:[number,number][]}|null>(null);
 const toView=(ev:{clientX:number;clientY:number})=>{const svg=print.current?.svg,m=svg?.getScreenCTM();if(!svg||!m)return null;const pt=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(m.inverse());return pt;};
 const down=(ev:ReactPointerEvent<HTMLDivElement>)=>{if(done||t.current>=1)return;stop.current();const p=toView(ev);if(!p)return;
  ev.currentTarget.setPointerCapture(ev.pointerId);drag.current={id:ev.pointerId,s:[[performance.now(),t.current]]};setNudge(false);
  set(progressAt(path,p.x,p.y,t.current));};
 const move=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==ev.pointerId)return;const p=toView(ev);if(!p)return;
  const x=progressAt(path,p.x,p.y,t.current),now=performance.now();d.s.push([now,x]);while(d.s.length>2&&now-d.s[0][0]>100)d.s.shift();set(x);
  if(x>=.97){drag.current=null;finish();}};
 const up=(ev:ReactPointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==ev.pointerId)return;drag.current=null;
  const a=d.s[0],b=d.s[d.s.length-1],v=b&&a&&b[0]>a[0]?(b[1]-a[1])/((b[0]-a[0])/1e3):0;
  if(t.current>=.8||t.current+v*.15>=.97){finish();return;}
  if(t.current>.05)setNudge(true);stop.current=springTo(t.current,0,set,{v,k:120,c:16});};
 const key=(ev:ReactKeyboardEvent)=>{if(done)return;const m:Record<string,number>={ArrowRight:.1,ArrowUp:.1,ArrowLeft:-.1,ArrowDown:-.1};
  if(ev.key in m){ev.preventDefault();stop.current();const x=Math.max(0,Math.min(1,t.current+m[ev.key]));set(x);if(x>=1)finish();}
  else if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();play();}};

 // Leaving: the print flies back into its place in the gallery.
 const leave=useCallback(()=>{stop.current();const el=frame.current,to=from?.getBoundingClientRect();
  if(el&&to&&!reduced()){const r=el.getBoundingClientRect(),a=el.animate([{transformOrigin:'0 0',transform:'none'},{transformOrigin:'0 0',transform:`translate(${to.left-r.left}px,${to.top-r.top}px) scale(${to.width/r.width})`}],{duration:300,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
   root(el)?.animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'});a.finished.then(onClose,onClose);}else onClose();},[from,onClose]);
 closeRef.current=leave;

 return <div className={styles.viewer} data-hof-viewer={l.id} role="dialog" aria-modal="true" aria-label={`${l.name}, ${l.position}`}>
  <div className={styles.viewerBack} aria-hidden="true" onClick={leave}/>
  <div className={styles.viewerBody}>
   <div ref={frame} className={styles.viewerPrint} data-done={done||undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
    role="slider" tabIndex={0} aria-label={`${l.position} move: ${l.try}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={done?'Done':`${pct}%`} onKeyDown={key} data-hof-move>
    <Print key={l.id} ref={print} legend={l} t={0} guide/>
    <span ref={seal} className={styles.doneSeal} data-show={done||undefined} aria-hidden="true">Well played</span>
    {!done&&pct===0&&<span className={styles.dragMe} aria-hidden="true">Drag me</span>}
   </div>
   <div ref={panel} key={l.id} className={styles.viewerText} tabIndex={-1}>
    <p className={styles.vKicker}>{l.position} · {l.country}</p>
    <h2 className={styles.vName}>{l.name}</h2>
    <p className={styles.vTry} aria-live="polite">{done?l.done:nudge?'Nearly! Keep going all the way to the red circle.':l.try}</p>
    {done&&<div className={styles.vDone}>
     <p className={styles.vJob}><span className={styles.noteTag}>The job</span>{l.job}</p>
     <p className={styles.vFact}>{l.fact} <a href={l.source.url} target="_blank" rel="noreferrer">Source</a></p>
    </div>}
    <div className={styles.vBtns}>
     <button type="button" className={styles.vPlay} data-hof-play onClick={play}>{done?'Play it again':'Play the move'}</button>
     <button type="button" className={styles.vNext} data-hof-next onClick={()=>{sfx('click');onNext();}}>Next legend</button>
     <button type="button" className={styles.vClose} data-hof-close onClick={()=>{sfx('click');leave();}}>Back to the prints</button>
    </div>
   </div>
  </div>
 </div>;
}
const root=(el:HTMLElement)=>el.closest<HTMLElement>('[data-hof-viewer]');

/**
 * Quick check, "Whose job is it?": a job is read out, you pick the position. A right answer stamps a vermilion seal on the round
 * (WAAPI on a sampled spring, no loop); a wrong one gives a hint and lets you try again. Four rounds, then a seal for the room.
 */
function JobCheck(){
 const [round,setRound]=useState(0),[wrong,setWrong]=useState<string|null>(null),[got,setGot]=useState<string|null>(null),[firstTry,setFirstTry]=useState(0);
 const seal=useRef<HTMLSpanElement>(null),fin=useRef<HTMLDivElement>(null),tries=useRef(0);
 const done=round>=QUIZ.length,q=QUIZ[Math.min(round,QUIZ.length-1)],pos=POSITIONS.find(p=>p.position===q.position)!;
 const stamp=(el:HTMLElement|null)=>{if(!el||reduced())return;const e=springEasing(330,16);el.animate([{transform:'scale(1.9) rotate(-16deg)',opacity:0},{transform:'rotate(-6deg)',opacity:1}],{duration:e.ms,easing:e.easing});};
 useEffect(()=>{if(got)stamp(seal.current);},[got]);
 useEffect(()=>{if(done)stamp(fin.current);},[done]);
 const answer=(c:string)=>{if(got)return;tries.current++;
  if(c===q.position){sfx('stamp');setGot(c);setWrong(null);if(tries.current===1)setFirstTry(n=>n+1);}
  else{sfx('look');setWrong(c);}};
 const next=()=>{sfx('click');tries.current=0;setGot(null);setWrong(null);setRound(r=>r+1);};
 const again=()=>{sfx('click');tries.current=0;setGot(null);setWrong(null);setFirstTry(0);setRound(0);};
 const wrongPos=wrong?POSITIONS.find(p=>p.position===wrong):null;
 return <section className={styles.check} aria-labelledby="hof-check" data-hof-check>
  <h2 id="hof-check" className={styles.h2}>Quick check: whose job?</h2>
  {!done?<div key={round} className={styles.checkCard}>
   <p className={styles.checkRound}>Job {round+1} of {QUIZ.length}</p>
   <p className={styles.checkJob}>“{pos.job}”</p>
   <div className={styles.chips} role="group" aria-label="Which position does this job?">
    {q.choices.map(c=><button key={c} type="button" className={styles.chip} data-answer={c===got?'right':c===wrong?'wrong':undefined} disabled={!!got} onClick={()=>answer(c)}>{c}</button>)}
   </div>
   <p className={styles.checkMsg} aria-live="polite">{got?<>Yes! That’s the {got.toLowerCase()}’s job, like {pos.legends.map(l=>l.name).join(' and ')}.</>
    :wrongPos?<>Not quite. A {wrongPos.position.toLowerCase()}’s job is different: {wrongPos.job.charAt(0).toLowerCase()+wrongPos.job.slice(1)} Try again!</>:'Tap the position that does this job.'}</p>
   {got&&<div className={styles.checkNext}><span ref={seal} className={styles.checkSeal} aria-hidden="true">正</span>
    <button type="button" className={styles.certBtn} onClick={next}>{round+1<QUIZ.length?'Next job':'Finish'}</button></div>}
  </div>
  :<div ref={fin} className={styles.checkDone} role="status">
   <span className={styles.checkBig} aria-hidden="true">極</span>
   <p><b>{firstTry===QUIZ.length?'All four on the first try!':`${firstTry} of ${QUIZ.length} on the first try.`}</b> You know who does what. On the pitch, know your job, and know your teammates’ jobs too.</p>
   <button type="button" className={styles.chip} onClick={again}>Play the check again</button>
  </div>}
 </section>;
}

/** One path as a print panel: in colour once graduated, a black-line proof until then. One team's shape on its pitch. */
function PathPanel({plinth:p,lit}:{plinth:Plinth;lit:boolean}){
 const id='hof-pp-'+p.format;
 return <svg className={styles.pitchPrint} viewBox="0 0 120 128" role="img" aria-label={`${p.name}: ${p.aSide} players a side, shape ${p.shape}${lit?', graduated':''}`}>
  {lit&&<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f2a66"/><stop offset=".3" stopColor="#0f2a66"/><stop offset=".75" stopColor="#3d64a8" stopOpacity=".7"/><stop offset="1" stopColor="#e9a45c" stopOpacity=".9"/></linearGradient></defs>
   <g transform="translate(1.2 .9)"><rect x="4" y="4" width="112" height="46" fill={`url(#${id})`}/><path d="M58 49L84 30Q90 26 96 30L115 44V49Z" className={styles.ppHill}/><path d="M80 33Q90 24 100 33L96 36L92 33L88 37L84 34Z" fill="#f6ecd4"/><rect x="4" y="48" width="112" height="76" className={styles.ppGround}/></g>
   <path d="M58 49L84 30Q90 26 96 30L115 44M80 33L84 34L88 37L92 33L96 36L100 33" className={styles.ppKey}/><path d="M4 49H116" className={styles.ppKey}/></>}
  <rect x="4" y="4" width="112" height="120" className={styles.ppFrame}/>
  <g transform={`translate(60 88) scale(${(.7+p.scale*.3).toFixed(2)}) translate(-50 -32)`}>
   <rect x="1" y="1" width="98" height="62" rx="2" className={styles.ppPitch}/>
   {lit&&<path className={styles.ppEdge} d="M50 1V63M1 18h12v28H1M99 18H87v28h12"/>}
   <path className={styles.ppLine} d="M50 1V63M1 18h12v28H1M99 18H87v28h12"/><circle cx="50" cy="32" r="9" className={styles.ppLine}/>
   {p.dots.map(([x,y],k)=><circle key={k} cx={x} cy={y} r={k===0?3.8:3.4} className={lit?styles.ppDotOn:styles.ppDot}/>)}
  </g>
  <rect x="10" y="10" width="56" height="30" className={styles.ppCart}/>
  <text x="38" y="24" textAnchor="middle" className={styles.ppName}>{p.name}</text>
  <text x="38" y="35" textAnchor="middle" className={styles.ppSide}>{p.aSide} a side</text>
 </svg>;
}
function Boat(){
 return <svg viewBox="0 0 48 32" width="44" height="30"><path d="M4 20h40l-6 9H10z" className={styles.hull}/><rect x="14" y="11" width="18" height="9" rx="2" className={styles.cabin}/><rect x="24" y="4" width="4" height="7" className={styles.cabin}/><path d="M2 30q5-3 10 0t10 0 10 0 10 0" className={styles.wave}/></svg>;
}
