'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import {CALLS,CASE_FACTS,FIRSTS,LADDER,SCENES,SOURCES,STORY_1966,STORY_TAGS,TWO_YELLOWS,type Call} from './content';
import QuickCheck from './Check';
import {MatchStage,StreetStage,focusLines,INK,PAPER} from './Stage';
import {Scrubber,useClip,useScrubDrag} from './Clip';
import {SPRING,springKeyframes} from './motion';
import styles from './Experience.module.css';

/**
 * cards-1970 · "The Junction", told as a sports manga (Oct 9 2026 style + motion pass; first built Oct 5 2026). Ken Aston's
 * idea came from a traffic light, so the visitor's answer pad is one, drawn in ink with the only colour on the page.
 *
 * Beats the visitor drives:
 *  1. 1966, a night street in London (a manga panel): tap the amber, then the red lamp; the driver's thought balloon has the idea.
 *  2. Six practice calls (made up, labelled). Each plays once in manga style (speed lines, focus lines, sound effects), then the
 *     visitor is the referee: SPOT IT (drag the film strip or the panel with momentum to the moment and blow the whistle),
 *     then MAKE THE CALL on the traffic light.
 *  3. The hero moment: the lamp you pressed flies into the referee's hand (FLIP) and the card turns over (spring) to show what
 *     Law 12 says: careless (no card), reckless (yellow), excessive force (red).
 *  4. Full time: Law 12 as a traffic light, the real 1970/1974 firsts, sources.
 *
 * Motion: rAF springs only for direct manipulation (Clip.tsx, sleeps when settled); one-shot moments are spring-sampled Web
 * Animations keyframes on the compositor (motion.ts); no View Transitions. Reduced motion: no playback, no flight, no flip;
 * the key still, the result and every word are all there.
 */
type Phase='intro'|'watch'|'spot'|'call'|'verdict'|'end';
const COLOR:Record<Call,string>={none:'var(--green-ink)',yellow:'var(--amber-ink)',red:'var(--red-ink)'};
const NAME:Record<Call,string>={none:'No card',yellow:'Yellow card',red:'Red card'};
/** How close (seconds) the whistle must be to the key moment. */
export const SPOT_WINDOW=.3;

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [phase,setPhase]=useState<Phase>('intro');
 const [index,setIndex]=useState(0);
 const [picked,setPicked]=useState<Call|null>(null),[results,setResults]=useState<boolean[]>([]);
 const [introLit,setIntroLit]=useState<Call|null>(null),[seen,setSeen]=useState<{yellow?:boolean;red?:boolean}>({});
 const [misses,setMisses]=useState(0),[spotMsg,setSpotMsg]=useState<string|null>(null),[spotted,setSpotted]=useState<'self'|'shown'|null>(null);
 const [reduced,setReduced]=useState(false),[compact,setCompact]=useState(false);
 /** The 1966 story unfolds one manga panel at a time; the lamps are the last beat. */
 const [beat,setBeat]=useState(0);
 const storyDone=beat>=STORY_1966.length-1;
 const nextBeat=useCallback(()=>{unlockMuseumAudio();museumSfx.tick();setBeat(b=>Math.min(STORY_1966.length-1,b+1));},[]);
 const root=useRef<HTMLElement>(null),panel=useRef<HTMLDivElement>(null),stageEl=useRef<HTMLDivElement>(null);
 const lampRects=useRef<Partial<Record<Call,HTMLElement|null>>>({});
 const scene=SCENES[index];

 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),c=matchMedia('(max-width:760px),(max-height:520px)');
  const f=()=>{setReduced(q.matches);setCompact(c.matches);};f();q.addEventListener('change',f);c.addEventListener('change',f);root.current?.focus();
  return ()=>{q.removeEventListener('change',f);c.removeEventListener('change',f);};},[]);
 useEffect(()=>{panel.current?.scrollTo?.({top:0});},[phase,index,seen.red,beat]);

 const ended=useCallback(()=>setPhase(p=>p==='watch'?'spot':p),[]);
 const clip=useClip({duration:scene.duration,moment:scene.moment,whistle:scene.whistle,reduced,onEnd:ended});
 // The panel itself scrubs too: a horizontal drag on the replay moves time (pan-y keeps vertical page gestures for the browser).
 const scrubbing=phase==='watch'||phase==='spot'||phase==='call'||phase==='verdict';
 const grabbed=useCallback(()=>{unlockMuseumAudio();setPhase(p=>p==='watch'?'spot':p);},[]);
 const stageDrag=useScrubDrag(clip,()=>scene.duration/Math.max(280,(stageEl.current?.getBoundingClientRect().width??600)*1.1),grabbed);

 /** A new call: the panel wipes in (CSS, keyed) and the clip plays once from the start. */
 const start=useCallback((i:number)=>{setIndex(i);setPicked(null);setMisses(0);setSpotMsg(null);setSpotted(null);setPhase('watch');},[]);
 // Play whenever a call starts (after the scene's clock has been rebuilt for it).
 const playToken=useRef(-1);
 useEffect(()=>{if(phase==='watch'&&playToken.current!==index){playToken.current=index;clip.play(1);}},[phase,index,clip]);
 const replay=()=>{unlockMuseumAudio();setSpotMsg(null);clip.play(.5);};

 /** Spot it: blow the whistle on the moment. */
 const blow=()=>{
  unlockMuseumAudio();if(phase!=='spot')return;
  const d=clip.t-scene.moment;
  if(Math.abs(d)<=SPOT_WINDOW){museumSfx.whistle();setSpotted('self');setSpotMsg(null);clip.springTo(scene.moment);setPhase('call');return;}
  museumSfx.card();const m=misses+1;setMisses(m);
  if(m>=3){setSpotted('shown');setSpotMsg('Here it is. The film jumps to the moment.');clip.springTo(scene.moment);setPhase('call');return;}
  setSpotMsg(d<0?(m>=2?'Too early. Look for the glow on the film strip, a bit further on.':'Too early! Drag the film forward a little.'):(m>=2?'Too late. Look for the glow on the film strip, a little before.':'Too late! Drag the film back a little.'));
 };

 const press=useCallback((c:Call)=>{
  unlockMuseumAudio();
  if(phase==='intro'){museumSfx.tick();setBeat(STORY_1966.length-1);setIntroLit(c);if(c!=='none')setSeen(s=>({...s,[c]:true}));return;}
  if(phase!=='call')return;
  setPicked(c);setResults(r=>{const n=[...r];n[index]=c===scene.answer;return n;});setPhase('verdict');clip.springTo(scene.moment);
  if(scene.answer==='none')museumSfx.tick();else museumSfx.card();
  if(c===scene.answer)museumSfx.reveal();
 },[phase,index,scene,clip]);
 const next=()=>{if(index+1<SCENES.length)start(index+1);else{museumSfx.whistle();setPhase('end');}};

 useEffect(()=>{const k=(e:KeyboardEvent)=>{
  if(e.key==='Escape'){e.preventDefault();onClose();return;}
  if(e.target instanceof HTMLElement&&e.target.closest('summary,a,[role=slider]'))return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(phase==='spot'&&(e.key==='w'||e.key==='W'||e.key==='Enter')&&!(e.target instanceof HTMLButtonElement)){e.preventDefault();blow();return;}
  const c=CALLS.find(x=>x.key.toLowerCase()===e.key.toLowerCase());if(c)press(c.call);
 };window.addEventListener('keydown',k);return ()=>window.removeEventListener('keydown',k);});

 const lit:Call|null=phase==='intro'?introLit:phase==='verdict'?scene.answer:null;
 const right=results.filter(Boolean).length;
 const invite:Call|null=phase==='intro'&&storyDone?(!seen.yellow?'yellow':!seen.red?'red':null):null;
 const good=phase==='verdict'&&picked===scene.answer;
 const zone:[number,number]|null=phase==='spot'&&misses>=2||phase==='call'&&spotted==='shown'?[scene.moment-SPOT_WINDOW,scene.moment+SPOT_WINDOW]:null;

 return <section ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: be the referee`} data-museum-experience="cards-1970" data-phase={phase} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <header className={styles.top}>
   <p className={styles.eyebrow}><span>{exhibit.year}</span> · {exhibit.title}</p>
   {(phase!=='intro'&&phase!=='end')&&<p className={styles.chapter}>Call {index+1}<small>/{SCENES.length}</small></p>}
  </header>

  <div ref={stageEl} className={styles.stage} data-street={phase==='intro'||undefined} data-flashback={phase==='intro'&&!storyDone||undefined} data-end={phase==='end'||undefined} data-good={good||undefined} key={phase==='intro'?'i':phase==='end'?'e':'m'+index}>
   {phase==='intro'&&<p className={styles.narration} key={'n'+beat} aria-hidden="true">{STORY_TAGS[beat]}</p>}
   {phase==='intro'&&!storyDone&&<button type="button" className={styles.turnPage} onClick={nextBeat} aria-label="Next panel"><span aria-hidden="true">▶</span></button>}
   {phase==='intro'?<StreetStage lit={introLit}/>
    :phase==='end'?<Ladder/>
    :<MatchStage scene={scene} t={clip.t} playing={clip.playing} revealed={phase==='verdict'?scene.answer:null} scrub={scrubbing?stageDrag:undefined}/>}
   {(phase==='watch'||phase==='spot'||phase==='call'||phase==='verdict')&&<div className={styles.tag}>
    <span>Made-up moment{clip.playing&&!reduced?' · replay':''}</span>
    <ol className={styles.pips} aria-label={`${right} right so far`}>{SCENES.map((s,i)=><li key={s.id} data-state={i===index&&phase!=='verdict'?'now':results[i]===true?'right':results[i]===false?'wrong':undefined}/>)}</ol>
   </div>}
   {phase==='spot'&&!clip.playing&&<p className={styles.tryIt} aria-hidden="true"><span>⟵ drag ⟶</span></p>}
  </div>

  {phase==='verdict'&&picked&&<CardShow call={scene.answer} picked={picked} from={lampRects.current[picked]??null} reduced={reduced} key={'c'+index}/>}

  <div ref={panel} className={styles.panel}>
   <div aria-live="polite" className={styles.live}>
   {phase==='intro'&&<Intro seen={seen} lit={introLit} beat={beat} onNext={nextBeat} onPlay={()=>{unlockMuseumAudio();start(0);}}/>}
   {(phase==='watch'||phase==='spot'||phase==='call')&&<div className={styles.block} key={'w'+index+(phase==='call'?'c':'')}>
    <p className={styles.kicker}>You are the referee</p>
    <h2 className={styles.big}>{phase==='call'?'Now make the call.':phase==='spot'?'Spot it!':`Watch number ${scene.watch}.`}</h2>
    {phase==='watch'&&<p className={styles.box}>Watch closely. The film slows down at the key moment.</p>}
    {phase==='spot'&&<p className={styles.box}>Drag the film to {scene.spot}. Then blow the whistle.</p>}
    {phase==='call'&&<p className={styles.box}>{spotted==='self'?'Good eye! You froze it at the moment. ':''}What does Law 12 say? {compact?'Tap a light below.':'Tap a light.'} <span className={styles.keys}>Keys: G, Y, R</span></p>}
    {spotMsg&&<p className={styles.shout} role="status" key={spotMsg+misses}>{spotMsg}</p>}
   </div>}
   {phase==='verdict'&&picked&&<div className={styles.block} data-call={scene.answer} key={'v'+index}>
    <p className={styles.kicker} data-good={good||undefined}>{good?'Good call, ref!':`You said: ${NAME[picked]}. The Law says:`}</p>
    <h2 className={styles.big} style={{color:COLOR[scene.answer]}}>{scene.verdict}</h2>
    <p className={styles.law}>{scene.law}</p>
    <p className={styles.box}>{scene.why}</p>
   </div>}
   {phase==='end'&&<div className={styles.block}>
    <p className={styles.kicker}>Full time</p>
    <h2 className={styles.big}><span className={styles.score}>{right}<small>/{SCENES.length}</small></span>calls made like a referee.</h2>
    <p className={styles.box}>Cards are not about punishing. They keep the game fair and keep players safe. {TWO_YELLOWS}</p>
    <QuickCheck reduced={reduced}/>
    <p className={styles.idea}>From one red light on Kensington High Street to every pitch in the world, yours too.</p>
    <p className={styles.take}><b>Take it to your game:</b> {CASE_FACTS.forYourGame}</p>
    <details className={styles.more} open={!compact}><summary>From the traffic light to the World Cup</summary>
     <ul className={styles.list}>
      <li>{CASE_FACTS.mexico}</li><li>{CASE_FACTS.language}</li>{FIRSTS.map(f=><li key={f}>{f}</li>)}
     </ul>
    </details>
    <Sources/>
   </div>}
   </div>
   {(phase==='watch'||phase==='spot'||phase==='call'||phase==='verdict')&&<div className={styles.controls}>
    <Scrubber clip={clip} duration={scene.duration} zone={zone} label={`Replay film for call ${index+1}: drag, or use the arrow keys`} onUserMove={grabbed}/>
    <div className={`${styles.row} ${styles.actions}`}>
     {phase==='spot'&&<button type="button" data-museum-own-cue className={`${styles.btn} ${styles.whistle}`} onClick={blow}><WhistleIcon/>Blow the whistle</button>}
     {phase!=='verdict'?<button type="button" className={styles.btn} onClick={replay} disabled={clip.playing} aria-label="Play it again, slowly">{compact?'Slow-mo':'Play it again (slow)'}</button>
      :<><button type="button" className={styles.btn} onClick={replay} disabled={clip.playing}>Watch again</button>
       <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={next}>{index+1<SCENES.length?'Next call':'See the Law'}</button></>}
    </div>
   </div>}
   {phase==='end'&&<div className={styles.controls}><div className={`${styles.row} ${styles.actions}`}><button type="button" className={`${styles.btn} ${styles.primary}`} onClick={()=>{setResults([]);playToken.current=-1;start(0);}}>Play again</button></div></div>}
  </div>

  <div className={styles.signalWrap}>
   <div className={styles.signal} role="group" aria-label="Traffic light: your call">
    {CALLS.map(c=>{const on=lit===c.call||phase==='end',enabled=phase==='call'||phase==='intro';
     return <button key={c.call} ref={el=>{lampRects.current[c.call]=el;}} type="button" data-museum-own-cue className={styles.lamp} data-call={c.call} data-on={on||undefined}
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

function Intro({seen,lit,beat,onNext,onPlay}:{seen:{yellow?:boolean;red?:boolean};lit:Call|null;beat:number;onNext:()=>void;onPlay:()=>void}){
 const both=seen.yellow&&seen.red,storyDone=beat>=STORY_1966.length-1;
 return <div className={styles.block} key={both?'b':storyDone?'a':'s'}>
  <p className={styles.kicker}>Real history · 1966</p>
  <h2 className={styles.big}>A light that changed football</h2>
  {both?<>
   <p className={styles.idea}>{CASE_FACTS.aston}</p>
   <p className={styles.box}>{CASE_FACTS.mexico} {CASE_FACTS.language}</p>
   <div className={`${styles.row} ${styles.actions}`}><button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onPlay}>Be the referee</button></div>
  </>:<>
   {/* the story so far: earlier panels stay as small grey captions, the new one lands on top of the pile */}
   {STORY_1966.slice(0,beat).map((l,i)=><p key={i} className={styles.past}>{l}</p>)}
   <p key={'b'+beat} ref={el=>{if(el&&beat>0)el.scrollIntoView?.({block:'nearest'});}} className={`${styles.box} ${styles.beatBox}`}>{STORY_1966[beat]}</p>
   <ol className={styles.beats} aria-label={`Panel ${beat+1} of ${STORY_1966.length}`}>{STORY_1966.map((_,i)=><li key={i} data-on={i<=beat||undefined}/>)}</ol>
   {!storyDone&&<div className={`${styles.row} ${styles.actions}`}><button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onNext}>Next panel ▶</button></div>}
   {storyDone&&!seen.yellow&&<p className={styles.prompt}>Tap the <b style={{color:'var(--amber-ink)'}}>amber</b> light to see Ken Aston’s idea.</p>}
   {storyDone&&seen.yellow&&<p className={styles.prompt}><span>Yellow means careful…</span> Now tap the <b style={{color:'var(--red)'}}>red</b> light.</p>}
   {lit==='none'&&<p className={styles.box}>Green means go: the game flows on.</p>}
  </>}
  <Sources/>
 </div>;
}

/**
 * The hero moment. The lamp the visitor pressed becomes a card: it flies from the traffic light into the referee's raised hand
 * (FLIP: measure both boxes, animate the inverse transform away with a spring), then turns over with a springy flip to show the
 * Law's answer. The back of the card is the visitor's pick, the face is the right call, so a wrong call visibly turns into the
 * right one. Both are spring-sampled Web Animations (compositor only, no loop). Reduced motion: the card is simply there.
 */
function CardShow({call,picked,from,reduced}:{call:Call;picked:Call;from:HTMLElement|null;reduced:boolean}){
 const fly=useRef<HTMLDivElement>(null),flip=useRef<HTMLDivElement>(null),arm=useRef<SVGSVGElement>(null),lines=useRef<SVGSVGElement>(null);
 useLayoutEffect(()=>{
  const f=fly.current,p=flip.current;if(!f||!p||reduced||typeof f.animate!=='function')return;
  const a=from?.querySelector('span')?.getBoundingClientRect(),b=f.getBoundingClientRect();
  const anims:Animation[]=[];
  if(a&&b.width>0){const dx=a.left+a.width/2-(b.left+b.width/2),dy=a.top+a.height/2-(b.top+b.height/2),s=Math.max(.3,a.width/b.width);
   const k=springKeyframes(SPRING.fly,u=>({transform:`translate(${(dx*(1-u)).toFixed(1)}px,${(dy*(1-u)).toFixed(1)}px) scale(${(s+(1-s)*u).toFixed(3)}) rotate(${(-24*(1-u)).toFixed(1)}deg)`}));
   anims.push(f.animate(k.keyframes,{duration:k.duration,fill:'backwards'}));}
  const k2=springKeyframes(SPRING.flip,u=>({transform:`rotateY(${(180*(1-u)).toFixed(1)}deg)`}));
  anims.push(p.animate(k2.keyframes,{duration:k2.duration,delay:380,fill:'backwards'}));
  if(arm.current){const k3=springKeyframes(SPRING.fly,u=>({transform:`translateY(${(70*(1-u)).toFixed(1)}%)`}));anims.push(arm.current.animate(k3.keyframes,{duration:k3.duration,fill:'backwards'}));}
  if(lines.current)anims.push(lines.current.animate([{opacity:0,transform:'scale(1.25)'},{opacity:1,transform:'none'}],{duration:260,delay:420,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'}));
  return ()=>anims.forEach(x=>x.cancel());
 },[from,reduced]);
 const label:Record<Call,string>={none:'Play on',yellow:'Yellow',red:'Red'};
 // Two layers over the replay panel: the focus lines and the arm are clipped to the panel; the card is not, so it can fly in
 // from the traffic light across the gutter.
 return <div className={styles.showLayer} aria-hidden="true"><div className={styles.showClip}><div className={styles.show}>
  <svg ref={lines} className={styles.showLines} viewBox="-200 -200 400 400"><path d={focusLines(0,0,70,300,72,5)} fill={INK}/></svg>
  <svg ref={arm} className={styles.arm} viewBox="0 0 120 200"><path d="M48,200 L58,128 Q60,116 70,114 L84,112 Q92,112 92,122 L90,200 Z" fill={INK} stroke={PAPER} strokeWidth="3"/>
   <path d="M62,118 Q58,96 66,86 L72,82 Q78,80 80,86 L82,96 L86,84 Q90,80 94,86 L92,118 Z" fill={INK} stroke={PAPER} strokeWidth="3"/></svg>
 </div></div><div className={styles.show}>
  <div ref={fly} className={styles.fly}>
   <div ref={flip} className={styles.flip}>
    <div className={styles.face} data-card={call}><b>{label[call]}</b>{call==='none'?<svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>:null}</div>
    <div className={`${styles.face} ${styles.back}`} data-card={picked}><b>You: {label[picked]}</b></div>
   </div>
  </div>
  <span className={styles.showSfx}>バッ</span>
 </div></div>;
}

function Ladder(){
 return <div className={styles.ladder} role="img" aria-label="Law 12 as a traffic light: careless is a free kick with no card, reckless is a yellow card, excessive force is a red card.">
  {[...LADDER].reverse().map((s,i)=><div key={s.call} className={styles.rung} data-call={s.call} style={{animationDelay:`${.12+i*.16}s`}}><i aria-hidden="true"/><div><b>{s.word}</b><span>{s.card}</span><small>{s.plain}</small></div></div>)}
 </div>;
}

function Sources(){
 return <details className={styles.sources}><summary>Sources</summary>
  <p>The six practice calls are made-up moments, judged by the Laws of the Game. The history is real:</p>
  <ul>{SOURCES.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
 </details>;
}
const WhistleIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 10h9l3-3h6v6a6 6 0 1 1-12 0v-1H3z" fill="currentColor"/><circle cx="15" cy="13" r="2.2" fill="#fff"/></svg>;
