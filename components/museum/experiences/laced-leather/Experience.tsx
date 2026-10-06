'use client';
import {useCallback,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import {AGE_CHOICES,EXTRA_SOURCES,LEATHER,LEATHER_GAIN,LEATHER_GAIN_PCT,SIZES,type SizeId} from './facts';
import {createWeatherMachine,type Machine} from './machine';
import styles from './Experience.module.css';

/**
 * laced-leather · "The Weather Machine" (Oct 5 2026). A material-study lightbox: hang a laced leather ball on a dial scale,
 * hold the rain button (or press and hold the lightbox) and watch it darken and gain weight (the lab's real numbers: 410 g dry
 * → 595 g after 90 minutes in water), then put it on a beam balance against a modern size 5 and the youth sizes 4 and 3,
 * drawn to scale (tap a ball to swap it). Ends on the exhibit's lesson: use the right size ball for your age.
 * Canvas 2D (machine.ts, ballRender.ts) sleeps whenever nothing moves. The shared ExperienceBack sits top-left.
 */
const CHAPTERS=[{id:'weigh',tab:'Weigh'},{id:'rain',tab:'Rain'},{id:'balance',tab:'Balance'},{id:'fit',tab:'Your size'}] as const;
const ORDER:SizeId[]=['5','4','3'];

export default function Experience({exhibit,onClose}:ExperienceProps){
 const canvas=useRef<HTMLCanvasElement|null>(null),machine=useRef<Machine|null>(null);
 const [chapter,setChapter]=useState(0);
 const [hung,setHung]=useState(false),[raining,setRaining]=useState(false),[soak,setSoak]=useState(0);
 const [leftWet,setLeftWet]=useState(true),[right,setRight]=useState<SizeId>('5'),[swapped,setSwapped]=useState(false);
 const soaked=soak>=1;
 const grams=hung?Math.round(LEATHER.dry+(LEATHER.wet-LEATHER.dry)*soak):0;

 const hint=chapter===0&&!hung?'Tap the ball to hang it on the scale'
  :chapter===1&&!soaked&&!raining?'Press and hold here to make it rain'
  :chapter===2&&!swapped?'Tap a ball to swap it':'';

 useEffect(()=>{const node=canvas.current;if(!node)return;
  const m=createWeatherMachine(node,{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,coarse:matchMedia('(pointer: coarse)').matches,onSoak:setSoak});
  machine.current=m;return()=>{m.dispose();machine.current=null;};},[]);
 useEffect(()=>{machine.current?.set({scene:chapter>=2?'balance':'scale',hung,raining,leftWet,right,hint});},[chapter,hung,raining,leftWet,right,hint]);
 useEffect(()=>{if(soaked&&raining){setRaining(false);museumSfx.reveal();}},[soaked,raining]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);

 const go=(i:number)=>{setRaining(false);if(i>=1&&!hung)setHung(true);if(i===2)setLeftWet(true);setChapter(i);};
 const hang=()=>{if(hung)return;setHung(true);museumSfx.stamp();};
 const startRain=useCallback(()=>{if(soaked)return;if(!hung)setHung(true);setRaining(true);museumSfx.look();},[soaked,hung]);
 const stopRain=useCallback(()=>setRaining(false),[]);
 const rainKey=(e:ReactKeyboardEvent)=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(e.type==='keydown'&&!e.repeat)startRain();if(e.type==='keyup')stopRain();}};
 const dry=()=>{machine.current?.dry();setSoak(0);setRaining(false);};
 const pick=(s:SizeId)=>{setRight(s);setSwapped(true);museumSfx.stamp();};
 const restart=()=>{machine.current?.dry();setSoak(0);setRaining(false);setHung(false);setLeftWet(true);setRight('5');setSwapped(false);setChapter(0);};

 // Direct manipulation on the lightbox: tap the ball to hang it, press and hold to rain, tap a pan's ball to swap it.
 const stageDown=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const m=machine.current;if(!m)return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(chapter===0){if(!hung&&m.hit(x,y)==='ball')hang();return;}
  if(chapter===1){if(!soaked){e.currentTarget.setPointerCapture?.(e.pointerId);startRain();}return;}
  const side=m.hit(x,y);if(side==='left'){setLeftWet(v=>!v);setSwapped(true);museumSfx.stamp();}
  else if(side==='right')pick(ORDER[(ORDER.indexOf(right)+1)%ORDER.length]);};
 const stageUp=()=>{if(chapter===1)stopRain();};
 const actionable=(chapter===0&&!hung)||(chapter===1&&!soaked)||chapter>=2;

 const fact=(i:number)=>exhibit.facts[i]??'';
 const sources=[...exhibit.sources,...EXTRA_SOURCES];
 const status=chapter===0?(hung?`On the scale: ${LEATHER.dry} grams dry.`:'Step 1: weigh it dry.'):chapter===1?(soaked?`Soaked: ${LEATHER.wet} grams, ${LEATHER_GAIN} grams heavier.`:'Step 2: make it rain.'):chapter===2?'Step 3: the balance.':'Step 4: a ball that fits you.';

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.title}: the weather machine`} data-museum-experience="laced-leather" className={styles.root}>
  <div className={styles.stage}>
   <canvas ref={canvas} className={styles.canvas} data-actionable={actionable} onPointerDown={stageDown} onPointerUp={stageUp} onPointerCancel={stageUp} onLostPointerCapture={stageUp} onContextMenu={e=>e.preventDefault()}
    role="img" aria-label={chapter<2
    ?`A laced brown leather ball ${hung?'hanging from a dial scale':'resting on a stand'} in a lightbox. ${hung?(soaked?`Soaked: the needle reads ${LEATHER.wet} grams.`:soak>0?'It is getting wet and heavier.':`Dry: the needle reads ${LEATHER.dry} grams.`):'The scale reads zero.'}`
    :`A beam balance: ${leftWet?'soaked':'dry'} leather ball (${leftWet?LEATHER.wet:LEATHER.dry} grams) on the left, ${SIZES[right].name} ball (${SIZES[right].weight}) on the right. The leather side sinks lower.`}/>
   <p className={styles.plate} aria-hidden="true">Material study Nº 1 · Leather + rain</p>
  </div>

  <aside className={styles.panel} aria-label="Exhibit notes">
   <header className={styles.head}>
    <p className={styles.eyebrow}>{exhibit.year} · Kit gallery</p>
    <h1 className={styles.title}>The Weather Machine</h1>
    <p className={styles.sub}>{exhibit.title}</p>
   </header>

   <nav className={styles.tabs} aria-label="Steps" style={{['--i' as string]:String(chapter)}}>
    <i className={styles.tabMark} aria-hidden="true"/>
    {CHAPTERS.map((c,i)=><button key={c.id} type="button" className={styles.tab} aria-pressed={chapter===i} aria-label={`Step ${i+1}: ${c.tab}`} onClick={()=>go(i)}><b>{i+1}</b><span>{c.tab}</span></button>)}
   </nav>
   <p className={styles.sr} aria-live="polite">{status}</p>

   <div className={styles.body} key={chapter}>
    {chapter===0&&<>
     <h2 className={styles.h2}>Weigh it dry</h2>
     <p className={styles.quote}>{fact(0).split('. ')[0]}.</p>
     <p>Inside was a rubber bladder. You pumped it up, then laced the leather shut.</p>
     {!hung?<button type="button" className={`${styles.primary} ${styles.cue}`} data-museum-own-cue onClick={hang}>Hang it on the scale</button>
      :<><p className={`${styles.readout} ${styles.enter}`}><span>{LEATHER.dry}</span> g <small>dry</small></p>
       <p>That is what a real leather World Cup ball from {LEATHER.ballYear} weighed in a {LEATHER.labYear} lab test. Dry, it fits inside today’s size 5 range (the green band). So far, so good…</p>
       <button type="button" className={`${styles.primary} ${styles.enter}`} onClick={()=>go(1)}>Next: make it rain →</button></>}
    </>}

    {chapter===1&&<>
     <h2 className={styles.h2}>Make it rain</h2>
     {!soaked?<>
      <p>Leather drinks water. Hold the button and watch the needle.</p>
      <p className={styles.readout} aria-hidden="true" data-live={raining}><span>{grams}</span> g <small>{soak>0?'and rising…':'dry'}</small></p>
      <button type="button" className={`${styles.primary} ${styles.rain} ${soak===0?styles.cue:''}`} data-museum-own-cue data-raining={raining}
       aria-label="Hold to make it rain" onPointerDown={e=>{e.currentTarget.setPointerCapture?.(e.pointerId);startRain();}} onPointerUp={stopRain} onPointerCancel={stopRain} onLostPointerCapture={stopRain}
       onKeyDown={rainKey} onKeyUp={rainKey} onContextMenu={e=>e.preventDefault()}>
       <svg className={styles.cloud} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.8 9.1 4 4 0 0 1 17 17Z" fill="currentColor"/><path d="M8 19.5l-1 2M12 19.5l-1 2M16 19.5l-1 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
       {raining?'Raining…':'Hold to make it rain'}
       <i className={styles.meter} style={{['--soak' as string]:String(soak)}} aria-hidden="true"/>
      </button>
      {soak>0&&<p className={styles.small}>Soaking… {Math.round(soak*100)}%. The needle shows the change; the lab weighed it dry and after {LEATHER.soakMinutes} minutes in water.</p>}
     </>:<>
      <p className={styles.quote}>{fact(0).split('. ').slice(1).join('. ')}</p>
      <p className={`${styles.readout} ${styles.enter} ${styles.wet}`}><span>{LEATHER.wet}</span> g <small>after {LEATHER.soakMinutes} min in water</small></p>
      <p>That’s <b>{LEATHER_GAIN} g heavier</b>, about {LEATHER_GAIN_PCT}% more. A modern ball in the same test didn’t get any heavier at all.</p>
      <p>Imagine kicking, or heading, that ball late in a rainy match!</p>
      <div className={styles.row}><button type="button" className={styles.primary} onClick={()=>go(2)}>Next: the balance →</button><button type="button" className={styles.secondary} onClick={dry}>Dry it off</button></div>
     </>}
    </>}

    {chapter===2&&<>
     <h2 className={styles.h2}>Put it on the balance</h2>
     <p className={styles.quote}>{fact(1)}</p>
     <div className={styles.group} role="group" aria-label="Leather ball">
      <button type="button" className={styles.chip} aria-pressed={!leftWet} onClick={()=>{setLeftWet(false);setSwapped(true);}}>Dry leather</button>
      <button type="button" className={styles.chip} aria-pressed={leftWet} onClick={()=>{setLeftWet(true);setSwapped(true);}}>Soaked leather</button>
     </div>
     <div className={styles.group} role="group" aria-label="Modern ball">
      {ORDER.map(s=><button key={s} type="button" className={styles.chip} data-museum-own-cue aria-pressed={right===s} onClick={()=>pick(s)}>{SIZES[s].name}</button>)}
     </div>
     <p>{leftWet
      ?<>The soaked ball ({LEATHER.wet} g) is heavier than any {SIZES[right].name} ({SIZES[right].weight}), by at least {LEATHER.wet-SIZES[right].maxG} g.</>
      :<>Dry, the old ball ({LEATHER.dry} g) {right==='5'?'weighs the same as the lightest size 5':`is still heavier than a ${SIZES[right].name}`} ({SIZES[right].weight}).</>}</p>
     <p className={styles.small}>Same size, different stuff: since 1872 the rules have asked for a round ball about the same size as today’s. What changed was the material.</p>
     <button type="button" className={styles.primary} onClick={()=>setChapter(3)}>Next: your size →</button>
    </>}

    {chapter===3&&<>
     <h2 className={styles.h2}>A ball that fits you</h2>
     <p className={styles.quote}>{fact(2)}</p>
     <div className={styles.group} role="group" aria-label="Your age">
      {AGE_CHOICES.map(a=><button key={a.size} type="button" className={styles.chip} data-museum-own-cue aria-pressed={right===a.size} onClick={()=>pick(a.size)}>{a.label}</button>)}
     </div>
     <dl className={styles.spec}>
      <div><dt>Ball</dt><dd>{SIZES[right].name}</dd></div>
      <div><dt>Around</dt><dd>{SIZES[right].around}</dd></div>
      <div><dt>Weight</dt><dd>{SIZES[right].weight}</dd></div>
      <div><dt>Usually for</dt><dd>{SIZES[right].ages}</dd></div>
     </dl>
     <p>A ball that fits your foot and your strength is easier to control, pass and strike cleanly, so you practise good habits instead of fighting the ball. Your league decides the exact size, so ask your coach.</p>
     <p className={`${styles.game} ${styles.enter}`}><span>Take it to your game</span>{exhibit.forYourGame}</p>
     <button type="button" className={styles.secondary} onClick={restart}>Start again</button>
    </>}
   </div>

   <details className={styles.sources}>
    <summary>Sources</summary>
    <p className={styles.small}>Real history and real measurements. The dry and soaked weights come from one 1966 leather World Cup ball tested in a lab in 2023; older laced balls were leather too, but each ball was different. Size 3 and 4 numbers are the usual youth sizes from size guides.</p>
    <ul>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a></li>)}</ul>
   </details>
  </aside>
  <ExperienceBack onClose={onClose}/>
 </section>;
}
