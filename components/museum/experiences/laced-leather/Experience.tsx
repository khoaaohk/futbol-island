'use client';
import {useCallback,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import {AGE_CHOICES,CHECK,EXTRA_SOURCES,NO_LACES_1966,OPENING,HEAD_BALLS,HEAD_MORE_PCT,HEAD_PAIN,HEAD_STUDY,LEATHER,LEATHER_GAIN,LEATHER_GAIN_PCT,SIZES,YEATS,type HeadBall,type SizeId} from './facts';
import {createWeatherMachine,type HeaderEvent,type Machine} from './machine';
import styles from './Experience.module.css';

/**
 * laced-leather · "The Weather Machine" (Oct 5 2026), told as a 1950s–60s science picture-book (variation, Oct 9 2026, replacing
 * the sepia album): flat geometric shapes, five cheerful inks on warm paper, rounded type. Five numbered experiments:
 *  I   Weigh: hang a laced leather ball on a dial scale (410 g dry; the lab's replica of the 1966 World Cup ball).
 *  II  Rain: hold the rain button and watch it darken and gain weight (595 g after 90 minutes in water).
 *  III Balance: a beam balance against a modern size 5 and the youth sizes 4 and 3, drawn to scale.
 *  IV  Head it: pull the ball on its string back to the brass peg and let go into a wooden head on a spring. Same peg, same
 *      speed: only the weight changes the push. The laces leave a print, as Ron Yeats remembered.
 *  V   Your size: the exhibit's lesson, use the right size ball for your age.
 * Canvas 2D (machine.ts, ballRender.ts) sleeps whenever nothing moves; the page and its print speckle are drawn once per size.
 */
const CHAPTERS=[{id:'weigh',tab:'Weigh'},{id:'rain',tab:'Rain'},{id:'balance',tab:'Balance'},{id:'head',tab:'Head it'},{id:'fit',tab:'Your size'}] as const;
const NUM=['1','2','3','4','5'];
const ORDER:SizeId[]=['5','4','3'];
const HEAD_ORDER:HeadBall[]=['wet','dry','modern'];

export default function Experience({exhibit,onClose}:ExperienceProps){
 const canvas=useRef<HTMLCanvasElement|null>(null),machine=useRef<Machine|null>(null);
 const [chapter,setChapter]=useState(0);
 const [hung,setHung]=useState(false),[raining,setRaining]=useState(false),[soak,setSoak]=useState(0);
 const [leftWet,setLeftWet]=useState(true),[right,setRight]=useState<SizeId>('5'),[swapped,setSwapped]=useState(false);
 const [picks,setPicks]=useState<number[]>([]);
 const answer=(i:number,j:number)=>{if(i!==picks.length)return;setPicks(p=>[...p,j]);if(i===CHECK.length-1)museumSfx.reveal();else if(j===CHECK[i].answer)museumSfx.stamp();else museumSfx.look();};
 const [headBall,setHeadBall]=useState<HeadBall>('wet'),[tried,setTried]=useState<Partial<Record<HeadBall,number>>>({}),[short,setShort]=useState(false),[say,setSay]=useState('');
 const soaked=soak>=1;
 const grams=hung?Math.round(LEATHER.dry+(LEATHER.wet-LEATHER.dry)*soak):0;
 const triedAny=Object.keys(tried).length>0,compared=!!tried.wet&&!!tried.modern,laced=!!tried.wet||!!tried.dry;

 const hint=chapter===0&&!hung?'Tap the ball to hang it on the scale'
  :chapter===1&&!soaked&&!raining?'Press and hold here to make it rain'
  :chapter===2&&!swapped?'Tap a ball to swap it'
  :chapter===3&&!triedAny?(short?'Pull it all the way to the brass peg':'Pull the ball back to the peg, then let go')
  :chapter===3&&!compared?(tried.wet?'Now try the modern ball':'Now try the soaked leather ball'):'';

 const onHeader=useCallback((e:HeaderEvent)=>{
  if(e.kind==='latch'){museumSfx.tick();setShort(false);}
  else if(e.kind==='short'){setShort(true);setSay('Pull it all the way back to the brass peg, then let go.');}
  else if(e.kind==='hit'&&e.ball){const b=e.ball;museumSfx.stamp();setTried(t=>({...t,[b]:(t[b]??0)+1}));
   setSay(`${HEAD_BALLS[b].label}: ${b==='modern'?'about ':''}${HEAD_BALLS[b].g} grams. ${b==='modern'?'A lighter ball, a smaller push.':b==='wet'?'Heavy and soggy: a big push, and the laces left a print.':'The laces left a print.'}`);}
 },[]);
 useEffect(()=>{const node=canvas.current;if(!node)return;
  const m=createWeatherMachine(node,{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,coarse:matchMedia('(pointer: coarse)').matches,onSoak:setSoak,onHeader});
  machine.current=m;return()=>{m.dispose();machine.current=null;};},[onHeader]);
 useEffect(()=>{machine.current?.set({scene:chapter===3?'header':chapter>=2?'balance':'scale',hung,raining,leftWet,right,hint,headBall});},[chapter,hung,raining,leftWet,right,hint,headBall]);
 useEffect(()=>{if(soaked&&raining){setRaining(false);museumSfx.reveal();}},[soaked,raining]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);

 const go=(i:number)=>{setRaining(false);if(i>=1&&!hung)setHung(true);if(i===2)setLeftWet(true);setChapter(i);};
 const hang=()=>{if(hung)return;setHung(true);museumSfx.stamp();};
 const startRain=useCallback(()=>{if(soaked)return;if(!hung)setHung(true);setRaining(true);museumSfx.look();},[soaked,hung]);
 const stopRain=useCallback(()=>setRaining(false),[]);
 const rainKey=(e:ReactKeyboardEvent)=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(e.type==='keydown'&&!e.repeat)startRain();if(e.type==='keyup')stopRain();}};
 const dry=()=>{machine.current?.dry();setSoak(0);setRaining(false);};
 const pick=(s:SizeId)=>{setRight(s);setSwapped(true);museumSfx.stamp();};
 const pickHead=(b:HeadBall)=>{setHeadBall(b);museumSfx.click();};
 const restart=()=>{machine.current?.dry();setSoak(0);setRaining(false);setHung(false);setLeftWet(true);setRight('5');setSwapped(false);setTried({});setHeadBall('wet');setSay('');setPicks([]);setChapter(0);};

 // Direct manipulation on the plate: tap the ball to hang it, press and hold to rain, tap a pan's ball to swap it, and on
 // experiment 4 grab the hanging ball, pull it back along its arc to the peg and let go.
 const pulling=useRef(false);
 const stageDown=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const m=machine.current;if(!m)return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(chapter===0){if(!hung&&m.hit(x,y)==='ball')hang();return;}
  if(chapter===1){if(!soaked){e.currentTarget.setPointerCapture?.(e.pointerId);startRain();}return;}
  if(chapter===3){if(m.grab(x,y)){pulling.current=true;e.currentTarget.setPointerCapture?.(e.pointerId);}return;}
  const side=m.hit(x,y);if(side==='left'){setLeftWet(v=>!v);setSwapped(true);museumSfx.stamp();}
  else if(side==='right')pick(ORDER[(ORDER.indexOf(right)+1)%ORDER.length]);};
 const stageMove=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(!pulling.current)return;const r=e.currentTarget.getBoundingClientRect();machine.current?.pull(e.clientX-r.left,e.clientY-r.top);};
 const stageUp=()=>{if(chapter===1)stopRain();if(pulling.current){pulling.current=false;machine.current?.letGo();}};
 const actionable=(chapter===0&&!hung)||(chapter===1&&!soaked)||chapter===2;

 const fact=(i:number)=>exhibit.facts[i]??'';
 const sources=[...exhibit.sources,...EXTRA_SOURCES];
 const status=chapter===0?(hung?`On the scale: ${LEATHER.dry} grams dry.`:'Experiment one: weigh it dry.'):chapter===1?(soaked?`Soaked: ${LEATHER.wet} grams, ${LEATHER_GAIN} grams heavier.`:'Experiment two: make it rain.'):chapter===2?'Experiment three: the balance.':chapter===3?(say||'Experiment four: head it.'):'Experiment five: a ball that fits you.';
 const sb=HEAD_BALLS[headBall];

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.title}: the weather machine`} data-museum-experience="laced-leather" className={styles.root}>
  <div className={styles.stage}>
   <canvas ref={canvas} className={styles.canvas} data-actionable={actionable} data-grab={chapter===3} onPointerDown={stageDown} onPointerMove={stageMove} onPointerUp={stageUp} onPointerCancel={stageUp} onLostPointerCapture={stageUp} onContextMenu={e=>e.preventDefault()}
    role="img" aria-label={chapter<2
    ?`A picture-book drawing: a laced brown leather ball ${hung?'hanging from a dial scale':'resting on a stand'}. ${hung?(soaked?`Soaked: the needle reads ${LEATHER.wet} grams.`:soak>0?'It is getting wet and heavier.':`Dry: the needle reads ${LEATHER.dry} grams.`):'The scale reads zero.'}`
    :chapter===2?`A beam balance: ${leftWet?'soaked':'dry'} leather ball (${leftWet?LEATHER.wet:LEATHER.dry} grams) on the left, ${SIZES[right].name} ball (${SIZES[right].weight}) on the right. The leather side sinks lower.`
    :`A heading rig: a ${sb.label.toLowerCase()} ball (${sb.g} grams) hangs on a string beside a wooden head on a spring. Pull it back to the brass peg and let go.`}/>
   <div className={styles.paper} aria-hidden="true"/>
   <p className={styles.plate} aria-hidden="true" key={chapter}>Experiment {NUM[chapter]} · {CHAPTERS[chapter].tab}</p>
  </div>

  <aside className={styles.panel} aria-label="Exhibit notes">
   <header className={styles.head}>
    <p className={styles.eyebrow}>{exhibit.year} · Kit gallery</p>
    <h1 className={styles.title}>The Weather Machine</h1>
    <p className={styles.sub}>{exhibit.title}, in five experiments</p>
   </header>

   <nav className={styles.tabs} aria-label="Experiments" style={{['--i' as string]:String(chapter)}}>
    <i className={styles.tabMark} aria-hidden="true"/>
    {CHAPTERS.map((c,i)=><button key={c.id} type="button" className={styles.tab} aria-pressed={chapter===i} aria-label={`Experiment ${i+1}: ${c.tab}`} onClick={()=>go(i)}><b>{NUM[i]}</b><span>{c.tab}</span></button>)}
   </nav>
   <p className={styles.sr} aria-live="polite">{status}</p>

   <div className={styles.body} key={chapter}>
    {chapter===0&&<>
     <h2 className={styles.h2}>Weigh it dry</h2>
     <p className={styles.story}>{OPENING}</p>
     <p className={styles.quote}>{fact(0).split('. ')[0]}.</p>
     <p>Inside was a rubber bladder. You pumped it up, then laced the leather shut.</p>
     {!hung?<button type="button" className={`${styles.primary} ${styles.cue}`} data-museum-own-cue onClick={hang}>Hang it on the scale</button>
      :<><p className={`${styles.readout} ${styles.enter}`}><span>{LEATHER.dry}</span> g <small>dry</small></p>
       <p>That is what a leather copy (a replica) of the {LEATHER.ballYear} World Cup ball weighed in a {LEATHER.labYear} lab test. Dry, it fits inside today’s size 5 range (the green band). So far, so good…</p>
       <p className={styles.small}>{NO_LACES_1966}</p>
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
     <button type="button" className={styles.primary} onClick={()=>go(3)}>Next: head it →</button>
    </>}

    {chapter===3&&<>
     <h2 className={styles.h2}>Head it</h2>
     <p className={styles.quote}>{HEAD_PAIN}</p>
     <p>Pull the ball back to the brass peg and let go. Every swing starts at the peg, so every ball hits the wooden head at the same speed.</p>
     <div className={styles.group} role="group" aria-label="Ball on the string">
      {HEAD_ORDER.map(b=><button key={b} type="button" className={styles.chip} data-museum-own-cue aria-pressed={headBall===b} onClick={()=>pickHead(b)}>{HEAD_BALLS[b].label}</button>)}
     </div>
     <button type="button" className={`${styles.primary} ${!triedAny?styles.cue:''}`} data-museum-own-cue onClick={()=>machine.current?.autoSwing()}>Pull back and let go</button>
     <div className={styles.bars} role="group" aria-label="Push on the head, same speed">
      <p className={styles.barsTitle}>Push on the head <small>same speed</small></p>
      {HEAD_ORDER.map(b=>{const n=tried[b];const k=HEAD_BALLS[b].g/HEAD_BALLS.wet.g;return <div key={b} className={styles.bar} data-ball={b} data-on={!!n}>
       <span className={styles.barName}>{HEAD_BALLS[b].label}</span>
       <span className={styles.barTrack}><i key={n??0} style={{['--k' as string]:n?String(k):'0'}}/></span>
       <span className={styles.barValue}>{n?`${b==='modern'?'≈':''}${HEAD_BALLS[b].g} g`:'try it'}</span>
      </div>;})}
     </div>
     {compared&&<p className={`${styles.takeaway} ${styles.enter}`}>Same speed, heavier ball: a bigger push. The soaked ball pushed about <b>{HEAD_MORE_PCT}% harder</b> than a modern ball.</p>}
     {laced&&<figure className={`${styles.yeats} ${styles.enter}`}><blockquote>“{YEATS.quote}”</blockquote><figcaption>{YEATS.who}</figcaption></figure>}
     {triedAny&&<p className={styles.small}>{HEAD_STUDY} Today’s balls have no laces and don’t soak up water.</p>}
     <button type="button" className={triedAny?styles.primary:styles.secondary} onClick={()=>go(4)}>Next: your size →</button>
    </>}

    {chapter===4&&<>
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
     <section className={styles.check} aria-labelledby="ll-check">
      <h3 id="ll-check" className={styles.checkTitle}>Quick check <small>{picks.length}/{CHECK.length}</small></h3>
      {CHECK.slice(0,Math.min(picks.length+1,CHECK.length)).map((c,i)=>{const p=picks[i];return <div key={i} className={styles.checkQ}>
       <p className={styles.checkAsk}>{c.q}</p>
       <div className={styles.group} role="group" aria-label={c.q}>{c.options.map((o,j)=><button key={j} type="button" className={styles.checkOpt} disabled={p!=null}
        data-state={p==null?undefined:j===c.answer?'right':j===p?'wrong':'off'} onClick={()=>answer(i,j)}>{o}</button>)}</div>
       {p!=null&&<p className={styles.checkWhy} role="status"><b>{p===c.answer?'Right!':'Not quite.'}</b> {c.why}</p>}
      </div>;})}
      {picks.length===CHECK.length&&<p className={styles.stamp} role="status"><b>{picks.filter((p,i)=>p===CHECK[i].answer).length}/{CHECK.length}</b> Experiments complete!</p>}
     </section>
     <p className={`${styles.game} ${styles.enter}`}><span>Take it to your game</span>{exhibit.forYourGame}</p>
     <button type="button" className={styles.secondary} onClick={restart}>Start again</button>
    </>}
   </div>

   <details className={styles.sources}>
    <summary>Sources</summary>
    <p className={styles.small}>Real history and real measurements. The dry and soaked weights come from a copy (replica) of the 1966 leather World Cup ball tested in a lab in 2023; older laced balls were leather too, but each ball was different. In experiment 4 the push is worked out from weight and speed (same speed for every ball); the 2023 study measured real headers. Size 3 and 4 numbers are the usual youth sizes from size guides. The pictures are drawn for this exhibit.</p>
    <ul>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a></li>)}</ul>
   </details>
  </aside>
  <ExperienceBack onClose={onClose}/>
 </section>;
}
