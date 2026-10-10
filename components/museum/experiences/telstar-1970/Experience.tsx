'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import type {BallKind,Shot,TvScene} from './tvScene';
import TestCard from './TestCard';
import StitchBench,{PIECE,type BenchEvent} from './StitchBench';
import type {Bench,BenchCounts} from './stitch';
import {Lamp,Stand} from './Room';
import {ColdOpen,EndCard,Quiz,QUIZ} from './FullTime';
import styles from './Experience.module.css';

/**
 * telstar-1970 · "The broadcast" (Oct 5 2026). The whole screen is a 1970 television set in a dark living room. Switch it on,
 * read the test card, tune in to a (pretend) match and work the knobs: BALL (old brown leather ↔ the Telstar), PICTURE
 * (black and white ↔ colour) and CAMERA (wide ↔ close-up). In the wide shot the ball is a few pixels, as it was on a real
 * broadcast: on a black-and-white set the brown ball turns the same grey as the grass and vanishes, the Telstar's black and
 * white panels don't. In the close-up an eye test spins the ball: which way did it turn? The results table fills in for every
 * ball and picture, so the visitor proves for themselves why 32 black-and-white panels were easy to follow.
 *
 * Polish (Oct 5 2026): the set now stands on a teak stand in a 1970s living room (wallpaper, skirting, carpet, a lamp on
 * wide screens, the screen's glow on the wall), and the side column is a paper TV guide the height of the set: tonight's
 * programme (four steps), the step, the facts, your scores and a Full-time ending. Knob turns flash an on-screen setting and a
 * right answer gets a broadcast lower-third.
 *
 * Heat: the 3D picture (tvScene.ts, three) is lazy-loaded when the TV is switched on, renders at a capped TV resolution and
 * only while the ball moves; the test card is static SVG; the static "snow" is one small tile shown for half a second.
 */

type Caption={id:string;text:string;tag:string};
type Results=Record<string,{right:number;total:number}>;
const EXTRA={
 name:'The ball was named after Telstar, a ball-shaped satellite launched in 1962 and covered in flat panels, a bit like a football. It sent the first live TV pictures across the Atlantic Ocean.',
 made:'Only 20 Telstars were made for the 1970 World Cup. The 32-panel pattern was not new (a Danish company, Select, made one in 1962), but the World Cup on TV made it famous.',
 live:'In 1970, World Cup games were shown live around the world by satellite. A few places saw them in colour, but many families still watched in black and white.',
 panels:'The 32 panels are 12 black pentagons (5 sides) and 20 white hexagons (6 sides).',
};
const EXTRA_SOURCES=[
 {title:'Wikipedia · Telstar 1',url:'https://en.wikipedia.org/wiki/Telstar_1'},
 {title:'Science Museum · Telstar, Intelsat and the first global satellite broadcast',url:'https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast'},
 {title:'Britannica · Telstar communications satellite',url:'https://www.britannica.com/technology/Telstar-communications-satellite'},
 {title:'Smithsonian National Museum of American History · Soccer ball',url:'https://americanhistory.si.edu/collections/object/nmah_682185'},
 {title:'Wikipedia · List of FIFA World Cup official match balls',url:'https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls'},
];
const BALL_NAME:Record<BallKind,string>={leather:'Brown leather',telstar:'Telstar'};
const key=(b:BallKind,colour:boolean)=>`${b}-${colour?'colour':'bw'}`;

function Knob({label,options,value,onTurn}:{label:string;options:readonly [string,string];value:0|1;onTurn:()=>void}){
 return <div className={styles.knobWrap}>
  <span className={styles.knobLabel} aria-hidden="true">{label}</span>
  <button type="button" className={styles.knob} data-value={value} onClick={onTurn} data-museum-own-cue aria-label={`${label} knob: ${options[value]}. Turn to ${options[1-value]}.`}>
   <span className={styles.knobFace}/>
  </button>
  <span className={styles.knobValue} aria-hidden="true" key={value}>{options[value]}</span>
 </div>;
}

const STEPS=['Switch on','Stitch the ball','Tune in','Follow the ball','Eye test'] as const;

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [power,setPower]=useState<'off'|'warming'|'card'|'build'|'live'>('off');
 const [counts,setCounts]=useState<BenchCounts>({pent:0,hex:0,total:0}),[benchMsg,setBenchMsg]=useState(''),[skipped,setSkipped]=useState(false);
 const bench=useRef<Bench|null>(null);
 const [ball,setBall]=useState<BallKind>('leather'),[colour,setColour]=useState(false),[shot,setShot]=useState<Shot>('wide');
 const [tuning,setTuning]=useState(false),[failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 const [spin,setSpin]=useState<{phase:'idle'|'spinning'|'ask'|'answered';dir:-1|1;answer?:-1|0|1}>({phase:'idle',dir:1});
 const [results,setResults]=useState<Results>({});
 const [passes,setPasses]=useState<Record<BallKind,number>>({leather:0,telstar:0});
 const [seen,setSeen]=useState<string[]>([]);
 const [capIndex,setCapIndex]=useState(-1);
 const [osd,setOsd]=useState<{text:string;n:number}|null>(null);
 const [cheer,setCheer]=useState(0),[fresh,setFresh]=useState('');
 const [floorY,setFloorY]=useState<number|null>(null);
 /** Full time: the closedown card on the TV and the quiz of the night in the guide. */
 const [ending,setEnding]=useState(false),[quizScore,setQuizScore]=useState<number|null>(null);
 const sceneEl=useRef<HTMLDivElement>(null),setEl=useRef<HTMLDivElement>(null);
 const canvas=useRef<HTMLCanvasElement>(null),scene=useRef<TvScene|null>(null),root=useRef<HTMLElement>(null);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const reduced=useMemo(()=>typeof window!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches,[]);

 // The captions: the case's three facts (verbatim) plus three sourced extras, revealed as you do things.
 const all:Caption[]=useMemo(()=>[
  {id:'f0',text:exhibit.facts[0],tag:'Fact'},{id:'name',text:EXTRA.name,tag:'Why the name?'},{id:'live',text:EXTRA.live,tag:'1970 on TV'},
  {id:'f1',text:exhibit.facts[1],tag:'Fact'},{id:'panels',text:EXTRA.panels,tag:'Count them'},{id:'f2',text:exhibit.facts[2],tag:'Fact'},{id:'made',text:EXTRA.made,tag:'Did you know?'},
  {id:'game',text:exhibit.forYourGame,tag:'Take it to your game'},
 ],[exhibit]);
 const reveal=useCallback((...ids:string[])=>setSeen(s=>{const add=ids.filter(id=>!s.includes(id));if(!add.length)return s;const next=[...s,...add];setCapIndex(s.length);return next;}),[]);
 const captions=seen.map(id=>all.find(c=>c.id===id)!).filter(Boolean);
 const cap=captions[Math.max(0,Math.min(capIndex,captions.length-1))];

 // Escape leaves.
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[onClose]);

 // Snow: one 96 px noise tile, drawn once.
 const [snow,setSnow]=useState('');
 useEffect(()=>{try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d')!,img=g.createImageData(96,96);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255|0;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;}g.putImageData(img,0,0);setSnow(`url(${c.toDataURL()})`);}catch{}},[]);

 // Warm the 3D chunk while the visitor reads the off screen (still a separate lazy chunk; nothing renders until power-on),
 // so the live picture is ready by the time they tune in, even on a cold cache.
 useEffect(()=>{const t=setTimeout(()=>{import('./tvScene').catch(()=>{});},400);return()=>clearTimeout(t);},[]);
 // The 3D picture: lazy-loaded the first time the TV is switched on, disposed on unmount.
 const wantScene=power!=='off';
 useEffect(()=>{if(!wantScene||scene.current||!canvas.current)return;let cancelled=false;const node=canvas.current;
  import('./tvScene').then(({createTvScene})=>{if(cancelled)return;try{
   scene.current=createTvScene(node,{reducedMotion:reduced,onSpinEnd:()=>setSpin(s=>s.phase==='spinning'?{...s,phase:'ask'}:s)});
   scene.current.setBall(ballRef.current);scene.current.setShot(shotRef.current);
   (window as unknown as {__telstarTv?:TvScene}).__telstarTv=scene.current;setReady(true);
  }catch(err){console.warn('telstar tv: 3D picture unavailable',err);setFailed(true);}}).catch(()=>!cancelled&&setFailed(true));
  return()=>{cancelled=true;};
 },[wantScene,reduced]);
 useEffect(()=>()=>{scene.current?.dispose();scene.current=null;delete (window as unknown as {__telstarTv?:TvScene}).__telstarTv;},[]);
 const ballRef=useRef(ball),shotRef=useRef(shot);ballRef.current=ball;shotRef.current=shot;
 useEffect(()=>{scene.current?.setBall(ball);},[ball]);
 useEffect(()=>{scene.current?.setShot(shot);},[shot]);

 // A short burst of snow, the sound of a TV between channels.
 const snowBurst=(ms=450)=>{setTuning(true);museumSfx.look();later(()=>setTuning(false),reduced?150:ms);};

 // Switching off: the picture squeezes to a bright line, then a dot, and fades (a CRT losing its scan), with WAAPI.
 const pic=useRef<HTMLDivElement>(null),cooling=useRef(false);
 const switchPower=()=>{museumSfx.tick();if(power==='off'){setPower('warming');later(()=>{setPower('card');reveal('f0','name');},reduced?60:900);return;}
  if(cooling.current)return;const off=()=>{cooling.current=false;setPower('off');setEnding(false);setBenchMsg('');setSpin({phase:'idle',dir:1});setOsd(null);setCheer(0);};
  const el=pic.current;if(reduced||!el||typeof el.animate!=='function'){off();return;}
  cooling.current=true;const a=el.animate([{transform:'scale(1,1)',filter:'brightness(1)',opacity:1},{transform:'scale(1,.012)',filter:'brightness(2.6)',opacity:1,offset:.5},{transform:'scale(.02,.012)',filter:'brightness(3)',opacity:1,offset:.82},{transform:'scale(0,0)',filter:'brightness(3)',opacity:0}],{duration:520,easing:'cubic-bezier(.55,0,1,.45)',fill:'forwards'});
  a.finished.then(()=>{off();a.cancel();},()=>{off();});};
 const tuneIn=()=>{snowBurst(600);later(()=>{setPower('live');reveal('live');},reduced?100:350);};
 // "How it's made": the stitching programme between the test card and the match.
 const toBench=()=>{snowBurst(450);later(()=>setPower('build'),reduced?80:260);};
 const skip=()=>{setSkipped(true);tuneIn();};
 const built=counts.total===32;
 const onBench=useCallback((c:BenchCounts,e:BenchEvent)=>{setCounts(c);
  if(e.kind==='place'){museumSfx.card();setBenchMsg('');if(c.total===1)reveal('panels');}
  else if(e.kind==='wrong'&&e.need){museumSfx.flap();const n=PIECE[e.need];setBenchMsg(`That gap has ${n.sides} sides. It needs a ${n.name}.`);}
  else if(e.kind==='turn'){museumSfx.spin();}
  else if(e.kind==='done'){museumSfx.reveal();museumSfx.crowd();setBenchMsg('');reveal('panels','f1');setCheer(c2=>c2+1);const n=Date.now();cheerAt.current=n;later(()=>{if(cheerAt.current===n)setCheer(0);},2400);}
 },[reveal]);
 // On-screen display: the new setting shows on the picture for a moment after every knob turn (the knob's own feedback).
 const showOsd=(text:string)=>{if(power!=='live')return;setOsd(o=>({text,n:(o?.n??0)+1}));const n=Date.now();osdAt.current=n;later(()=>{if(osdAt.current===n)setOsd(null);},1500);};
 const osdAt=useRef(0);
 const turnBall=()=>{museumSfx.tick();if(power==='live')snowBurst(300);const b:BallKind=ball==='leather'?'telstar':'leather';setBall(b);setSpin({phase:'idle',dir:1});showOsd('BALL · '+BALL_NAME[b].toUpperCase());};
 const turnColour=()=>{museumSfx.tick();setColour(c=>!c);showOsd('PICTURE · '+(colour?'BLACK & WHITE':'COLOUR'));};
 const turnCamera=()=>{museumSfx.tick();if(power==='live')snowBurst(250);setShot(s=>s==='wide'?'close':'wide');setSpin({phase:'idle',dir:1});showOsd('CAMERA · '+(shot==='wide'?'CLOSE-UP':'WIDE'));};

 // Facts follow what's on screen: the Telstar on a black-and-white picture is the case's second fact.
 useEffect(()=>{if(power==='live'&&ball==='telstar'&&!colour)reveal('f1','panels');},[power,ball,colour,reveal]);

 const pass=()=>{museumSfx.kick();scene.current?.pass();setPasses(p=>({...p,[ball]:p[ball]+1}));};
 const startSpin=()=>{const dir:(-1|1)=Math.random()<.5?-1:1;museumSfx.spin();setSpin({phase:'spinning',dir});scene.current?.spin(dir);};
 const answer=(a:-1|0|1)=>{const right=a===spin.dir;if(right)museumSfx.reveal();else museumSfx.tick();setSpin(s=>({...s,phase:'answered',answer:a}));
  const k=key(ball,colour);setResults(r=>({...r,[k]:{right:(r[k]?.right??0)+(right?1:0),total:(r[k]?.total??0)+1}}));
  setFresh(k+':'+Date.now());if(right){setCheer(c=>c+1);const n=Date.now();cheerAt.current=n;later(()=>{if(cheerAt.current===n)setCheer(0);},1900);}
  if(ball==='telstar')reveal('f2','made','game');};

 const cheerAt=useRef(0);

 // The floor line sits just behind the stand's feet, wherever the layout puts the set (measured on resize, never polled).
 useEffect(()=>{const sc=sceneEl.current,st=setEl.current;if(!sc||!st)return;
  const measure=()=>{const a=sc.getBoundingClientRect(),b=st.getBoundingClientRect();const stand=parseFloat(getComputedStyle(st).getPropertyValue('--stand-h'))||0;setFloorY(Math.round(b.bottom-a.top-Math.max(6,stand*.62)));};
  const ro=new ResizeObserver(measure);ro.observe(sc);ro.observe(st);measure();return()=>ro.disconnect();},[]);

 // Turning the ball by hand in the close-up.
 const drag=useRef<{id:number;x:number;y:number;t:number;vx:number;vy:number}|null>(null);
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(power!=='live'||drag.current||spin.phase==='spinning')return;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),vx:0,vy:0};e.currentTarget.setPointerCapture(e.pointerId);scene.current?.grab();};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y,now=performance.now(),dt=Math.max(8,now-d.t)/1000;
  d.vx=d.vx*.5+dx/dt*.5;d.vy=d.vy*.5+dy/dt*.5;d.x=e.clientX;d.y=e.clientY;d.t=now;scene.current?.drag(dx,dy);};
 const up=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;const still=performance.now()-d.t>90;scene.current?.release(still?0:d.vx,still?0:d.vy);
  if(ball==='telstar'&&shot==='close')reveal('f2','made','game');};

 const on=power!=='off';
 const hint=power==='off'?'Switch on the 1970 TV with its red power button.'
  :power==='build'?(benchMsg||(counts.total===0?'Drag a black or a white panel onto a gap with the same shape. Or just tap one!'
   :built?(colour?'Your Telstar! Now tune in to the match.':'32 panels: 12 black, 20 white. Black spots on white show up on a black-and-white TV.')
   :counts.total<6?`${counts.total} of 32 stitched. Spin the ball to find more gaps.`:`${counts.total} of 32! Keep going, or stitch the rest.`))
  :power==='warming'?'Warming up…'
  :power==='card'?'This is the test card. First, let’s see how the Telstar is made.'
  :shot==='wide'&&ball==='leather'&&!passes.leather?(colour?'Press Pass and follow the brown ball.':'Press Pass. Can you follow the brown ball on a black-and-white TV?')
  :shot==='wide'&&ball==='leather'?'Hard to see? Turn the BALL knob to the Telstar.'
  :shot==='wide'&&!passes.telstar?'Now press Pass. Can you follow the Telstar?'
  :shot==='wide'?'Now turn the CAMERA knob to the close-up for an eye test.'
  :spin.phase==='idle'?'Eye test: press Spin and watch which way the ball turns.'
  :spin.phase==='spinning'?'Watch the ball…'
  :spin.phase==='ask'?'Which way did the front of the ball turn?'
  :spin.answer===spin.dir?'Right! Try another ball or picture.'
  :spin.answer===0?`It turned ${spin.dir>0?'right':'left'}. ${ball==='leather'?'A plain ball gives your eyes little to follow.':'Watch one black panel and try again.'}`
  :`Not quite: it turned ${spin.dir>0?'right':'left'}. Try again.`;
 const picture=!on?'The TV is off.':power==='build'?'How it’s made: the Telstar on a bench.':power==='live'?`${colour?'Colour':'Black-and-white'} picture, ${shot==='wide'?'wide shot':'close-up'} of the ${BALL_NAME[ball].toLowerCase()} ball on the pitch.`:'Test card with the Telstar satellite.';

 // Tonight's programme: four steps, ticked off as you go; Full time once the Telstar has had its eye test.
 const done=[on,built||skipped,power==='live'||passes.leather+passes.telstar>0||Object.keys(results).length>0,passes.leather+passes.telstar>0,Object.keys(results).length>0];
 const current=done.findIndex(d=>!d);
 const fullTime=Object.keys(results).some(k=>k.startsWith('telstar'));
 const leatherTested=!!results[key('leather',false)];
 const freshKey=fresh.split(':')[0];
 const score=(b:BallKind,c:boolean)=>{const r=results[key(b,c)];return r?`${r.right}/${r.total}`:null;};
 const endRows=(['leather','telstar'] as const).flatMap(b=>[false,true].map(c=>({label:`${b==='leather'?'LEATHER':'TELSTAR'} · ${c?'COLOUR':'B&W'}`,score:score(b,c)}))).filter((r):r is {label:string;score:string}=>!!r.score);
 const lb=results[key('leather',false)],tb=results[key('telstar',false)];
 const compareLine=lb&&tb?`On black and white you read the brown ball’s spin ${lb.right} out of ${lb.total}, and the Telstar’s ${tb.right} out of ${tb.total}. ${tb.right/tb.total>lb.right/lb.total?'The black and white panels helped your eyes, just as they helped viewers in 1970.':'Sharp eyes! On a real 1970 broadcast the ball was only a few grey dots, and the panels made all the difference.'}`
  :'In 1970, viewers at home could follow the Telstar’s black and white panels, even on a grey picture.';
 const goFullTime=()=>{museumSfx.whistle();snowBurst(300);setQuizScore(null);setEnding(true);
  // the closedown card is on the TV: bring the set into view (phones stack the guide under it)
  root.current?.scrollTo?.({top:0,behavior:reduced?'auto':'smooth'});};

 return <section ref={root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="telstar-1970" className={styles.root} data-power={power} data-colour={colour}>
  <ExperienceBack onClose={onClose}/>
  <div ref={sceneEl} className={styles.room} style={{['--snow' as string]:snow,['--floor-y' as string]:floorY==null?undefined:floorY+'px'}}>
   <div className={styles.floor} aria-hidden="true"/>
   <Lamp className={styles.lamp}/>

   <header className={styles.top}>
    <p className={styles.title}><span>{exhibit.year}</span> {exhibit.title}</p>
   </header>

   <div className={styles.stage}>
    <div ref={setEl} className={styles.set}>
     <div className={styles.tv} data-power={power}>
      <div className={styles.bezel}>
       <div className={styles.screen} data-colour={colour} data-tuning={tuning||(power==='live'&&!ready&&!failed)} data-power={power}>
        <div ref={pic} className={styles.picture}>
        <canvas ref={canvas} className={styles.canvas} role="img" aria-label={picture} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-show={power==='live'}/>
        {power==='card'&&<div className={styles.card}><TestCard/></div>}
        {power==='build'&&<StitchBench reduced={reduced} counts={counts} onChange={onBench} bind={b=>{bench.current=b;}}/>}
        {power==='build'&&cheer>0&&<div key={'b'+cheer} className={styles.lower} aria-hidden="true"><b>✓ TELSTAR</b><span>32 PANELS</span></div>}
        {power==='live'&&!ending&&<div className={styles.bug} aria-hidden="true"><b>LIVE</b> VIA SATELLITE</div>}
        {power==='live'&&shot==='wide'&&!ending&&<div className={styles.bug2} aria-hidden="true">MEXICO 70</div>}
        {power==='live'&&osd&&<div key={osd.n} className={styles.osd} aria-hidden="true">{osd.text}</div>}
        {power==='live'&&cheer>0&&<div key={'c'+cheer} className={styles.lower} aria-hidden="true"><b>✓ RIGHT!</b><span>You read the spin</span></div>}
        {ending&&power==='live'&&<EndCard rows={endRows} quiz={quizScore==null?null:{right:quizScore,total:QUIZ.length}}/>}
        {failed&&power==='live'&&<p className={styles.fail}>The picture can’t show on this device.</p>}
        </div>
        {power==='live'&&cheer>0&&<div key={'f'+cheer} className={styles.flash} aria-hidden="true"/>}
        <div className={styles.roll} aria-hidden="true"/>
        <div className={styles.snow} aria-hidden="true"/>
        <div className={styles.scan} aria-hidden="true"/>
        <div className={styles.glass} aria-hidden="true"/>
        {power==='warming'&&<div className={styles.warm} aria-hidden="true"/>}
       </div>
      </div>
      <div className={styles.controls}>
       <div className={styles.brand} aria-hidden="true">TELE·70</div>
       <Knob label="BALL" options={['Leather','Telstar']} value={ball==='leather'?0:1} onTurn={turnBall}/>
       <Knob label="PICTURE" options={['B&W','Colour']} value={colour?1:0} onTurn={turnColour}/>
       <Knob label="CAMERA" options={['Wide','Close']} value={shot==='wide'?0:1} onTurn={turnCamera}/>
       <button type="button" className={styles.power} data-on={on} onClick={switchPower} data-museum-own-cue aria-pressed={on} aria-label={on?'Switch the TV off':'Switch the TV on'}><span/></button>
      </div>
     </div>
     <Stand className={styles.stand}/>
    </div>

    <aside className={styles.guide} aria-label="What’s on"><div className={styles.sheet}>
     <div className={styles.masthead} aria-hidden="true"><b>What’s on</b><span>Mexico 70 · Channel 1</span></div>
     {ending&&power==='live'?<Quiz forYourGame={exhibit.forYourGame} compareLine={compareLine} onDone={n=>setQuizScore(n)} onBack={()=>{setEnding(false);museumSfx.tick();}}/>
     :fullTime&&on?<div className={styles.fullTime} role="status">
      <b>{leatherTested?'Ready for full time':'Nearly full time'}</b>
      <p>{leatherTested?'Compare your two rows below. Which ball could your eyes follow on black and white?':'You tested the Telstar. Now try the brown leather ball on black and white, and compare your scores.'}</p>
      {power==='live'&&<button type="button" className={styles.whistleBtn} onClick={goFullTime} data-museum-own-cue>Blow for full time: quiz of the night</button>}
     </div>
     :<ol className={styles.steps} aria-label="Tonight’s programme">
      {STEPS.map((s,i)=><li key={s} data-state={done[i]?'done':i===current?'now':'next'}><i aria-hidden="true">{done[i]?'✓':i+1}</i><span>{s}</span>{done[i]&&<span className={styles.sr}> (done)</span>}</li>)}
     </ol>}

     {power==='off'&&<ColdOpen/>}
     {!(ending&&power==='live')&&<><p className={styles.hint} aria-live="polite" key={hint}>{hint}</p>
     <div className={styles.actions}>
      {power==='off'&&<button type="button" className={styles.action} onClick={switchPower} data-museum-own-cue>Switch on</button>}
      {power==='card'&&<><button type="button" className={styles.action} onClick={toBench} data-museum-own-cue>Stitch the Telstar</button><button type="button" className={styles.skip} onClick={skip} data-museum-own-cue>Skip to the match</button></>}
      {power==='build'&&!built&&counts.total>=6&&<button type="button" className={styles.action} onClick={()=>bench.current?.finish()} data-museum-own-cue>Stitch the rest</button>}
      {power==='build'&&built&&<button type="button" className={styles.action} onClick={tuneIn} data-museum-own-cue>Tune in to the match</button>}
      {power==='build'&&<p className={styles.tally} aria-live="polite"><span><i data-kind="pent" aria-hidden="true"/>{counts.pent}/12 black</span><span><i data-kind="hex" aria-hidden="true"/>{counts.hex}/20 white</span><b>{counts.total}/32</b></p>}
      {power==='live'&&shot==='wide'&&<button type="button" className={styles.action} onClick={pass} data-museum-own-cue>Pass</button>}
      {power==='live'&&shot==='close'&&(spin.phase==='idle'||spin.phase==='answered')&&<button type="button" className={styles.action} onClick={startSpin} data-museum-own-cue>{spin.phase==='answered'?'Spin again':'Spin'}</button>}
      {power==='live'&&shot==='close'&&spin.phase==='spinning'&&<button type="button" className={styles.action} disabled>Spinning…</button>}
      {power==='live'&&shot==='close'&&spin.phase==='ask'&&<div className={styles.answers} role="group" aria-label="Which way did it turn?">
       <button type="button" className={styles.answer} onClick={()=>answer(-1)} data-museum-own-cue aria-label="It turned left">← Left</button>
       <button type="button" className={styles.answer} onClick={()=>answer(0)} data-museum-own-cue>Couldn’t tell</button>
       <button type="button" className={styles.answer} onClick={()=>answer(1)} data-museum-own-cue aria-label="It turned right">Right →</button>
      </div>}
     </div></>}

     {Object.keys(results).length>0&&<table className={styles.results}>
      <caption>Your eye test · right answers</caption>
      <thead><tr><th scope="col"><span className={styles.sr}>Ball</span></th><th scope="col">Black & white</th><th scope="col">Colour</th></tr></thead>
      <tbody>{(['leather','telstar'] as const).map(b=><tr key={b}><th scope="row">{BALL_NAME[b]}</th>{[false,true].map(c=>{const k=key(b,c),r=results[k];return <td key={String(c)} data-now={b===ball&&c===colour}><span key={k===freshKey?fresh:k} data-fresh={k===freshKey}>{r?`${r.right} / ${r.total}`:'–'}</span></td>;})}</tr>)}</tbody>
     </table>}
     {cap&&<figure className={styles.caption}>
      <figcaption>{cap.tag}</figcaption>
      <p key={cap.id} aria-live="polite">{cap.text}</p>
      {captions.length>1&&<div className={styles.pager}>
       <button type="button" onClick={()=>setCapIndex(i=>Math.max(0,Math.min(i,captions.length-1)-1))} disabled={capIndex<=0} aria-label="Previous fact">‹</button>
       <span>{Math.min(capIndex,captions.length-1)+1} of {all.length} facts</span>
       <button type="button" onClick={()=>setCapIndex(i=>Math.min(captions.length-1,i+1))} disabled={capIndex>=captions.length-1} aria-label="Next fact">›</button>
      </div>}
     </figure>}

     <footer className={styles.foot}>
      <p className={styles.note}>The match on this TV is pretend, made for the eye test. The facts are real.</p>
      <details className={styles.sources}>
       <summary>Sources</summary>
       <ul>{[...exhibit.sources,...EXTRA_SOURCES].map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
       <p>Ball drawing: the museum’s World Cup ball gallery model of the 1970 Telstar. Test card, TV and room drawn for this exhibit.</p>
      </details>
     </footer>
    </div></aside>
   </div>
  </div>
 </section>;
}
