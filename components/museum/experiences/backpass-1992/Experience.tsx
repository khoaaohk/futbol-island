'use client';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import styles from './Experience.module.css';
import {createWorld,step,passBack,footPass,pickUp,isBusy,freeTarget,clockText,type Era,type World,type SimEvent,type Target} from './sim';
import {drawWorld,hitActor} from './draw';
import {HISTORY,EXTRA_SOURCES,FICTION_NOTE} from './content';
import Film from './Film';
import {springSamples} from './spring';

/**
 * backpass-1992 · The Time-Wasting Machine (Oct 5 2026). Two mini-matches side by side: the same team, the same 1–0 lead, the
 * same two minutes to go. One world plays under the old law (before 1992), the other under the new one (after 1992). One
 * button passes back to both keepers at once: on the left the keeper picks it up and the "seconds wasted" meter climbs while
 * nobody may tackle; on the right the keeper must play it with the feet, fast, to the free team-mate, before the striker arrives.
 * After three back-passes each, a full-time card compares the two meters.
 *
 * Polish (Oct 5 2026): a broadcast camera behind the goal with lit upright players and TV name tags (draw.ts), broadcast
 * "stingers" for every outcome, and a full-time card. Motion techniques: a 90 ms hit-stop plus a Web Animations punch/shake on the feed, CSS `linear()` spring easing, `@starting-style`
 * entrances, a View Transition crossfade for the replay (guarded, skipped under reduced motion), and a CSS-only
 * count-up on the full-time numbers through a registered `@property`.
 *
 * Heat: one Canvas 2D per world, drawn only when something moves. The requestAnimationFrame loop runs only while a world is
 * busy, stops as soon as both are idle, stops when the tab is hidden, and is cancelled on unmount. No WebGL, no timers, no
 * polling; sound is the museum's own one-shots (muted with the island).
 */
type Hud={phase:World['phase'];clock:number;wasted:number;chances:number;good:number;hands:number;rounds:number;marked:Target};
type Tone='calm'|'good'|'bad'|'warn';
type Note={text:string;tone:Tone};
type Sting={text:string;tone:Tone;id:number}|null;
type Unlock='intro'|'law'|'faster'|'feet'|'handball'|'verdict';
const snap=(w:World):Hud=>({phase:w.phase,clock:Math.floor(w.clock),wasted:Math.round(w.wasted),chances:w.chances,good:w.goodPasses,hands:w.handballs,rounds:w.rounds,marked:w.marked});
const same=(a:Hud,b:Hud)=>a.phase===b.phase&&a.clock===b.clock&&a.wasted===b.wasted&&a.chances===b.chances&&a.good===b.good&&a.hands===b.hands&&a.rounds===b.rounds&&a.marked===b.marked;
const IDLE_NOTE:Record<Era,Note>={old:{text:'Old law: the keeper may pick up a back-pass.',tone:'calm'},new:{text:'New law: no hands from a kicked back-pass.',tone:'calm'}};
const WASTE_MAX=150,ROUNDS=3;
/** FLIP with a real spring: play an element from a measured box (`from`) into where it now sits, keyframes sampled from a
 *  damped spring (Web Animations, finite). Skipped under reduced motion. */
function flipFrom(el:HTMLElement,from:DOMRect,delay:number,reduced:boolean){
 if(reduced||typeof el.animate!=='function')return;const to=el.getBoundingClientRect();if(!to.width||!to.height)return;
 const dx=from.left-to.left,dy=from.top-to.top,sx=from.width/to.width,sy=from.height/to.height,{frames,ms}=springSamples(190,21);
 el.style.transformOrigin='0 0';
 el.animate(frames.map(f=>{const q=1-f.p;return {transform:`translate(${(dx*q).toFixed(2)}px,${(dy*q).toFixed(2)}px) scale(${(1+(sx-1)*q).toFixed(4)},${(1+(sy-1)*q).toFixed(4)})`,opacity:delay?Math.min(1,f.p*1.6):1,offset:f.offset};}),{duration:ms,delay,fill:'backwards'});
}

export default function Experience({exhibit,onClose}:ExperienceProps){
 const worlds=useRef<Record<Era,World>>({old:createWorld('old'),new:createWorld('new')});
 const canvases=useRef<Record<Era,HTMLCanvasElement|null>>({old:null,new:null});
 const sizes=useRef<Record<Era,{w:number;h:number}>>({old:{w:0,h:0},new:{w:0,h:0}});
 const raf=useRef(0),last=useRef(0),reduced=useRef(false),dpr=useRef(1),passRef=useRef<HTMLButtonElement>(null),stingId=useRef(0),freeze=useRef(0);
 const [hud,setHud]=useState<Record<Era,Hud>>(()=>({old:snap(worlds.current.old),new:snap(worlds.current.new)}));
 const [notes,setNotes]=useState<Record<Era,Note>>(IDLE_NOTE);
 const [stings,setStings]=useState<Record<Era,Sting>>({old:null,new:null});
 const [unlocked,setUnlocked]=useState<Unlock[]>(['intro']);
 const [story,setStory]=useState(false);
 const [fullTime,setFullTime]=useState(false);
 // The room opens on the tape (the story beats); the two-pitch match follows it.
 const [mode,setMode]=useState<'film'|'match'>('film');
 const flipRect=useRef<DOMRect|null>(null),stageRef=useRef<HTMLDivElement>(null);
 const unlock=useCallback((u:Unlock)=>setUnlocked(l=>l.includes(u)?l:[...l,u]),[]);
 const sting=useCallback((era:Era,text:string,tone:Tone)=>setStings(s=>({...s,[era]:{text,tone,id:++stingId.current}})),[]);

 const draw=useCallback((era:Era,now=performance.now())=>{
  const c=canvases.current[era],z=sizes.current[era];if(!c||!z.w)return;const ctx=c.getContext('2d');if(!ctx)return;
  drawWorld(ctx,worlds.current[era],z.w,z.h,dpr.current,now,reduced.current);
 },[]);

 /** Impact feedback on the feed itself (Web Animations, compositor-only, finite): a punch for a good pass, a shake for a loss. */
 const impact=useCallback((era:Era,good:boolean)=>{
  const c=canvases.current[era];if(!c||reduced.current||typeof c.animate!=='function')return;
  if(good){freeze.current=performance.now()+90;c.animate([{transform:'scale(1)'},{transform:'scale(1.025)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.34,1.56,.64,1)'});}
  else c.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-2px)'},{transform:'translateX(0)'}],{duration:180,easing:'ease-out'});
 },[]);

 const onEvent=useCallback((era:Era,e:SimEvent)=>{
  const w=worlds.current[era];
  if(e==='kick')museumSfx.kick();
  if(era==='old'){
   if(e==='catch'){setNotes(n=>({...n,old:{text:'Keeper picks it up. Nobody may tackle. Tick, tock…',tone:'warn'}}));sting('old','No challenge allowed','warn');unlock('law');}
   if(e==='kick'&&w.phase==='roll')setNotes(n=>({...n,old:{text:'Roll it out… then do it all again.',tone:'warn'}}));
   if(e==='idle'){setNotes(n=>({...n,old:IDLE_NOTE.old}));if(w.wasted>=50)unlock('faster');}
  }else{
   if(e==='good'){museumSfx.net();setNotes(n=>({...n,new:{text:'Good feet! The ball keeps moving.',tone:'good'}}));sting('new','Good feet!','good');impact('new',true);unlock('feet');}
   if(e==='stolen'){museumSfx.crowd();setNotes(n=>({...n,new:{text:'Too slow! Their striker nicked it.',tone:'bad'}}));sting('new','Too slow','bad');impact('new',false);}
   if(e==='intercepted'){museumSfx.crowd();setNotes(n=>({...n,new:{text:'Intercepted! Look for the free team-mate.',tone:'bad'}}));sting('new','Intercepted','bad');impact('new',false);}
   if(e==='idle')setNotes(n=>({...n,new:IDLE_NOTE.new}));
  }
 },[unlock,sting,impact]);

 const frame=useCallback((now:number)=>{
  raf.current=0;
  if(now<freeze.current){last.current=now;raf.current=requestAnimationFrame(frame);return;}// hit-stop: a 90 ms freeze-frame on a good pass
  const dt=Math.min(.05,Math.max(0,(now-last.current)/1000));last.current=now;
  for(const era of ['old','new'] as Era[]){
   const w=worlds.current[era],before=w.phase;
   const e=step(w,dt);if(e)onEvent(era,e);
   if(era==='new'&&before==='back'&&w.phase==='feet')setNotes(n=>({...n,new:{text:'No hands! Tap 7 or 8 to pass before number 9 arrives.',tone:'warn'}}));
   draw(era,now);
  }
  setHud(h=>{const o=snap(worlds.current.old),n=snap(worlds.current.new);return same(h.old,o)&&same(h.new,n)?h:{old:o,new:n};});
  const busy=isBusy(worlds.current.old)||isBusy(worlds.current.new);
  if(busy&&document.visibilityState==='visible')raf.current=requestAnimationFrame(frame);// sleeps when both worlds are idle
 },[draw,onEvent]);

 const wake=useCallback(()=>{if(raf.current||document.visibilityState!=='visible')return;last.current=performance.now();raf.current=requestAnimationFrame(frame);},[frame]);

 // Size the canvases (and repaint once) whenever their boxes change; the pointer type caps the pixel ratio.
 useEffect(()=>{
  reduced.current=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;dpr.current=Math.min(window.devicePixelRatio||1,coarse?1.5:2);
  const ro=new ResizeObserver(entries=>{for(const en of entries){const c=en.target as HTMLCanvasElement,era=c.dataset.era as Era;const {width,height}=en.contentRect;
   sizes.current[era]={w:width,h:height};c.width=Math.max(1,Math.round(width*dpr.current));c.height=Math.max(1,Math.round(height*dpr.current));draw(era);}});
  for(const era of ['old','new'] as Era[]){const c=canvases.current[era];if(c)ro.observe(c);}
  const vis=()=>{if(document.visibilityState!=='visible'){cancelAnimationFrame(raf.current);raf.current=0;}else if(isBusy(worlds.current.old)||isBusy(worlds.current.new))wake();};
  document.addEventListener('visibilitychange',vis);
  return()=>{ro.disconnect();document.removeEventListener('visibilitychange',vis);cancelAnimationFrame(raf.current);raf.current=0;
   for(const era of ['old','new'] as Era[]){const c=canvases.current[era];if(c){c.width=1;c.height=1;}}};// release the bitmaps
 },[draw,wake,mode]);

 // Escape closes the story panel first, then the full-time card, then the room.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;e.preventDefault();if(story)setStory(false);else if(fullTime)setFullTime(false);else onClose();};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[story,fullTime,onClose]);

 const bothIdle=hud.old.phase==='idle'&&hud.new.phase==='idle';
 const done=bothIdle&&hud.old.rounds>=ROUNDS&&hud.new.rounds>=ROUNDS;
 // The verdict: after three back-passes in each world, the whistle goes and the full-time card compares the meters.
 useEffect(()=>{if(!done)return;unlock('verdict');museumSfx.reveal();setFullTime(true);},[done,unlock]);

 const doPassBack=()=>{
  unlockMuseumAudio();
  if(done)return;
  const a=passBack(worlds.current.old),b=passBack(worlds.current.new);
  if(!a&&!b)return;museumSfx.kick();
  if(a)setNotes(n=>({...n,old:{text:'Back to the keeper…',tone:'calm'}}));
  if(b)setNotes(n=>({...n,new:{text:'Back to the keeper…',tone:'calm'}}));
  wake();
 };
 const doFoot=(t:Target)=>{if(footPass(worlds.current.new,t)){museumSfx.kick();setNotes(n=>({...n,new:{text:`Passed with the feet to number ${t==='W'?7:8}…`,tone:'calm'}}));wake();}};
 const doHands=()=>{if(pickUp(worlds.current.new)){museumSfx.whistle();setNotes(n=>({...n,new:{text:'Whistle! Indirect free kick to the other team.',tone:'bad'}}));sting('new','Free kick to them','bad');impact('new',false);unlock('handball');wake();}};
 const replay=()=>{
  worlds.current={old:createWorld('old'),new:createWorld('new')};
  setHud({old:snap(worlds.current.old),new:snap(worlds.current.new)});setNotes(IDLE_NOTE);setStings({old:null,new:null});setFullTime(false);
  draw('old');draw('new');passRef.current?.focus({preventScroll:true});
  // a quick "new tape" blink on both feeds (WAAPI, finite) instead of a View Transition
  if(!reduced.current)stageRef.current?.querySelectorAll<HTMLElement>('[data-era]').forEach((el,i)=>el.animate?.([{opacity:.25,transform:'scale(.985)'},{opacity:1,transform:'none'}],{duration:320,delay:i*60,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
 };
 const toMatch=(from:DOMRect|null)=>{flipRect.current=from;setStory(false);setMode('match');};
 // FLIP: the tape's TV grows into the "before" feed, the "after" feed follows (staggered).
 useLayoutEffect(()=>{if(mode!=='match')return;const from=flipRect.current;flipRect.current=null;
  const ws=stageRef.current?.querySelectorAll<HTMLElement>(':scope>section[data-era]');
  if(from&&ws)ws.forEach((el,i)=>flipFrom(el,from,i*90,reduced.current));
  passRef.current?.focus({preventScroll:true});},[mode]);

 // Direct manipulation: tap your number 4 to pass back; on the new-law pitch tap 7 or 8 to pass, or the keeper to grab it.
 const tap=(era:Era)=>(e:ReactPointerEvent<HTMLCanvasElement>)=>{
  const c=e.currentTarget,r=c.getBoundingClientRect(),w=worlds.current[era],a=hitActor(w,r.width,r.height,e.clientX-r.left,e.clientY-r.top);
  if(!a)return;
  if(w.phase==='idle'&&a==='D'&&bothIdle)doPassBack();
  else if(era==='new'&&w.phase==='feet'){if(a==='W'||a==='M')doFoot(a);else if(a==='K')doHands();}
 };

 const latest=unlocked[unlocked.length-1];
 const ticker:Record<Unlock,string>={
  intro:'Your team leads 1–0 with two minutes to go. Press “Pass it back” and watch both keepers.',
  law:exhibit.facts[0],faster:exhibit.facts[1],feet:exhibit.facts[2],handball:HISTORY[3].text,
  verdict:`Three back-passes each: ${hud.old.wasted} seconds wasted before 1992, ${hud.new.wasted} after. ${exhibit.facts[1]}`,
 };
 const newFeet=hud.new.phase==='feet';
 const sources=[...exhibit.sources,...EXTRA_SOURCES];
 const roundsLeft=Math.max(0,ROUNDS-hud.old.rounds);

 const panel=(era:Era)=>{const h=hud[era],old=era==='old',note=notes[era],s=stings[era];
  return <section className={styles.world} data-era={era} aria-label={old?'Before 1992: the old law':'After 1992: the new law'}>
   <header className={styles.hud}>
    <div className={styles.tag}><span className={styles.eraYear}>{old?'Before 1992':'After 1992'}</span><span className={styles.eraLaw}>{old?'Hands allowed':'Feet only'}</span></div>
    <div className={styles.bug} aria-label={`Score 1–0, match clock ${clockText(h.clock)}`}>
     <span className={styles.bugTeam}><i className={styles.chipUs}/>YOU</span><b>1–0</b><span className={styles.bugTeam}>THEM<i className={styles.chipThem}/></span>
     <span className={styles.clock}>{clockText(h.clock)}</span>
    </div>
    <div className={styles.meter} role="meter" aria-valuemin={0} aria-valuemax={WASTE_MAX} aria-valuenow={Math.min(WASTE_MAX,h.wasted)} aria-label={`Seconds wasted: ${h.wasted}`}
     data-hot={h.phase==='hold'||h.phase==='foul'||undefined}>
     <span className={styles.meterNum}>{h.wasted}<small>s</small></span><span className={styles.meterLabel}>wasted</span>
     <span className={styles.bar} aria-hidden="true"><i style={{transform:`scaleX(${Math.min(1,h.wasted/WASTE_MAX)})`}}/></span>
    </div>
   </header>
   <div className={styles.pitchBox} data-phase={h.phase}>
    <canvas ref={c=>{canvases.current[era]=c;}} data-era={era} className={styles.canvas} onPointerDown={tap(era)}
     aria-label={old?'Old-law pitch, seen from behind your goal: your keeper (1), defender (4), team-mates 7 and 8; their players 9 and 6.':'New-law pitch, seen from behind your goal: your keeper (1), defender (4), team-mates 7 and 8; their players 9 and 6.'} role="img"/>
    {old&&<span className={styles.scan} aria-hidden="true"/>}
    {s&&s.tone==='good'&&<i key={'f'+s.id} className={styles.flash} aria-hidden="true"/>}
    {s&&<div key={s.id} className={styles.sting} data-tone={s.tone} aria-hidden="true"><span>{s.text}</span></div>}
   </div>
   <footer className={styles.foot}>
    {!old&&newFeet?<div className={styles.choices} role="group" aria-label="The ball is at your keeper's feet. What now?">
      <button type="button" data-museum-own-cue className={styles.choice} onClick={()=>doFoot('W')}>Pass to 7</button>
      <button type="button" data-museum-own-cue className={styles.choice} onClick={()=>doFoot('M')}>Pass to 8</button>
      <button type="button" data-museum-own-cue className={`${styles.choice} ${styles.hands}`} onClick={doHands}>Pick it up</button>
     </div>
     :<p className={styles.note} data-tone={note.tone} aria-live="polite" key={note.text}>{note.text}</p>}
    <p className={styles.stat}>{old?`Chances for them: ${h.chances}`:`Chances for them: ${h.chances} · good passes: ${h.good}`}</p>
   </footer>
  </section>;};

 const ftMax=Math.max(1,hud.old.wasted,hud.new.wasted);
 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: the time-wasting machine`} data-museum-experience="backpass-1992" data-mode={mode} className={styles.root}>
  <ExperienceBack onClose={onClose}/>
  <div className={styles.top}>
   <h1 className={styles.title}><span className={styles.kicker}>{exhibit.year} · {exhibit.title}</span>{mode==='film'?'The Time-Wasting Tape':'The Time-Wasting Machine'}</h1>
   <div className={styles.topBtns}>
    {mode==='match'&&<button type="button" className={styles.storyBtn} onClick={()=>setMode('film')}>The tape</button>}
    <button type="button" className={styles.storyBtn} onClick={()=>setStory(true)} aria-haspopup="dialog">The real story</button>
   </div>
  </div>
  {mode==='film'?<Film facts={exhibit.facts} forYourGame={exhibit.forYourGame} onPlayMatch={toMatch} onStory={()=>setStory(true)}/>:<>
  <div className={styles.stage} ref={stageRef}>
   {panel('old')}{panel('new')}
   {fullTime&&<div className={styles.ft} role="dialog" aria-modal="false" aria-labelledby="bp-ft-title" onClick={e=>{if(e.target===e.currentTarget)setFullTime(false);}}>
    <div className={styles.ftCard}>
     <p className={styles.ftKicker}>Full time · three back-passes each</p>
     <h2 id="bp-ft-title" className={styles.ftTitle}>The new law gave the game back its minutes.</h2>
     <ul className={styles.ftRows}>
      {(['old','new'] as Era[]).map(era=><li key={era} data-era={era}>
       <span className={styles.ftEra}>{era==='old'?'Before 1992':'After 1992'}</span>
       <span className={styles.ftNum} style={{'--to':hud[era].wasted} as CSSProperties} aria-label={`${hud[era].wasted} seconds wasted`}><b>{hud[era].wasted}</b>s</span>
       <span className={styles.ftBar} aria-hidden="true"><i style={{'--w':Math.max(.02,hud[era].wasted/ftMax)} as CSSProperties}/></span>
      </li>)}
     </ul>
     <p className={styles.ftFact}>{exhibit.facts[1]}</p>
     <div className={styles.ftBtns}>
      <button type="button" data-museum-own-cue className={styles.pass} onClick={replay}>Play again</button>
      <button type="button" className={styles.storyBtn} onClick={()=>setStory(true)}>The real story</button>
     </div>
    </div>
   </div>}
  </div>
  <div className={styles.bottom}>
   <p className={styles.ticker} aria-live="polite" data-kind={latest} key={latest}>
    <span className={styles.tickNum}>{unlocked.length-1}/5</span>{ticker[latest]}
   </p>
   <button ref={passRef} type="button" data-museum-own-cue className={styles.pass} onClick={done?()=>setFullTime(true):doPassBack} disabled={!bothIdle||fullTime} data-hint={hud.old.rounds===0||undefined}
    aria-label={done?'Show the full-time result':'Pass it back to both keepers'}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
    <span className={styles.passText}>{done?'Full time':'Pass it back'}{!done&&hud.old.rounds>0&&<small>{roundsLeft} left</small>}</span>
   </button>
  </div>
  </>}
  {story&&<div className={styles.sheetWrap} onClick={e=>{if(e.target===e.currentTarget)setStory(false);}}>
   <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="bp-story-title">
    <div className={styles.sheetHead}><h2 id="bp-story-title">The real story of 1992</h2>
     <button type="button" className={styles.close} onClick={()=>setStory(false)} aria-label="Close the story" autoFocus>Close</button></div>
    <ol className={styles.facts}>
     {exhibit.facts.map((f,i)=><li key={i}><b>The law</b>{f}</li>)}
     {HISTORY.map((h,i)=><li key={'h'+i}><b>{h.year}</b>{h.text}</li>)}
    </ol>
    <p className={styles.game}><b>Take it to your game</b>{exhibit.forYourGame}</p>
    <p className={styles.fiction}>{FICTION_NOTE}</p>
    <details className={styles.sources}><summary>Sources</summary>
     <ul>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
    </details>
   </div>
  </div>}
 </section>;
}
