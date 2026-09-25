'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {BOTTLE_QUOTES} from '@/lib/content/bottleQuotes';
import {sampleBottleOcean,readBottleOceanTime} from '@/lib/audio/islandSound';
import {bottleWaterHeight,createBottleFloat,driftBottle,fitBottleToViewport} from '@/lib/graphics/bottleMotion';
import {DoneButton} from './DoneButton';
import styles from './IslandBottle.module.css';
function dailyNote(){const now=new Date();const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;const day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);return{key,...BOTTLE_QUOTES[((day%BOTTLE_QUOTES.length)+BOTTLE_QUOTES.length)%BOTTLE_QUOTES.length],date:now.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})};}
function OceanWaves({leaving,pattern,origin,bottleRef}:{leaving:boolean;pattern:string;bottleRef:{current:HTMLButtonElement|null};origin:{x:number;y:number;width:number;tileHeight:number}}){
 const canvas=useRef<HTMLCanvasElement>(null),exitAt=useRef<number|null>(null);
 useEffect(()=>{exitAt.current=leaving?performance.now():null;},[leaving]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const waterOrigin={...origin};
  const swell={wash:0,froth:0},floating=createBottleFloat(),bounds={x:0,y:0},arena={width:0,height:0,bottleWidth:0,bottleHeight:0};let motionAt=0,measuredBottle:HTMLButtonElement|null=null;
  const page=el.parentElement?.parentElement?.querySelector<HTMLElement>(':scope>section');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,started=performance.now();let frame=0,last=0,w=0,h=0,grain:CanvasPattern|null=null;const paper=new Image();paper.onload=()=>{grain=ctx.createPattern(paper,'repeat');if(!document.hidden)draw(performance.now());};paper.src='/stories/films/assets/entry-grain.png';
  const ease=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
  const draw=(now:number)=>{
   ctx.clearRect(0,0,w,h);if(!w||!h)return;
   const elapsed=now-started,closing=exitAt.current!==null;
   const outgoing=closing?ease((now-exitAt.current!)/900):0;
   const progress=reduced?(closing?0:1):closing?1-outgoing:ease(elapsed/2100);
   if(page){const position=`0 ${h*progress}px`;if(page.style.translate!==position){page.style.setProperty('transition','none','important');page.style.translate=position;}}
   const ocean=reduced?0:ease((elapsed-2100)/1100)*(1-outgoing);
   const time=readBottleOceanTime((now-started)/1000);
   sampleBottleOcean(time,swell);
   const dt=motionAt?Math.min(.08,(now-motionAt)/1000):0;motionAt=now;
   if(!reduced){
    const bottle=bottleRef.current;
    if(bottle&&measuredBottle!==bottle){const sea=bottle.parentElement!;arena.width=sea.clientWidth;arena.height=sea.clientHeight;arena.bottleWidth=bottle.offsetWidth;arena.bottleHeight=bottle.offsetHeight;measuredBottle=bottle;}
    if(bottle)fitBottleToViewport(floating,arena,w<=600);
    if(bottle&&!bottle.matches(':hover,:focus-visible')&&bottle.getAttribute('aria-disabled')!=='true'){driftBottle(floating,time,swell.wash,dt,bounds,w<=600,arena);}
    if(bottle){bottle.style.translate=`${floating.x.toFixed(2)}px ${floating.y.toFixed(2)}px`;bottle.style.rotate=`${floating.angle.toFixed(2)}deg`;}
   }
   el.dataset.swell=swell.wash.toFixed(3);
   // One continuous patterned surface meets the moving page at the same origin.
   // No separate color wipes, borders, or reloaded exit canvas.
   ctx.beginPath();ctx.moveTo(0,0);
   ctx.lineTo(0,h*progress);ctx.lineTo(w,h*progress);
   ctx.lineTo(w,0);ctx.closePath();
   {
    ctx.save();ctx.clip();ctx.fillStyle='#1255ee';ctx.fillRect(0,0,w,h);
    const offset=waterOrigin.y+h*progress,tile=waterOrigin.tileHeight;
    const edge=(t:number,base:number,cycle:number)=>{
     const u=1-t,curve=u*u*u*400+3*u*u*t*285+3*u*t*t*(-90)+t*t*t*(-200);
     const water=bottleWaterHeight(time,t,cycle,swell.wash)*ocean;
     return offset+(curve+base+cycle*1200)/1200*tile+water;
    };
    const first=Math.floor(-offset/tile)-1,lastCycle=Math.ceil((h-offset)/tile)+1;
    for(let cycle=first;cycle<=lastCycle;cycle++)for(const [base,color]of [[0,'#087451'],[400,'#ffd03e']] as const){
     ctx.fillStyle=color;ctx.beginPath();
     for(let n=0;n<=64;n++){const t=n/64,x=waterOrigin.x+t*waterOrigin.width,y=edge(t,base,cycle);if(n===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
     for(let n=64;n>=0;n--){const t=n/64;ctx.lineTo(waterOrigin.x+t*waterOrigin.width,edge(t,base+400,cycle));}ctx.closePath();ctx.fill();
    }
    if(grain){ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.36;ctx.fillStyle=grain;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}ctx.restore();
   }
  };
  const resize=()=>{measuredBottle=null;motionAt=0;
   // Re-read the underlying Paths pattern only on resize, subtracting our page displacement.
   const surfaces=page?[page,...Array.from(page.querySelectorAll<HTMLElement>(':scope>div'))]:[];
   const surface=surfaces.find(node=>getComputedStyle(node).backgroundImage.includes('/stories/paths/'));
   if(surface){const rect=surface.getBoundingClientRect(),css=getComputedStyle(surface),shift=parseFloat(page?.style.translate.split(' ')[1]??'0')||0;waterOrigin.x=rect.x;waterOrigin.y=rect.y-shift-(css.backgroundAttachment==='local'?surface.scrollTop:0);waterOrigin.width=rect.width;waterOrigin.tileHeight=parseFloat(css.backgroundSize.split(' ')[1]??'')||1200;}
   else{waterOrigin.x=0;waterOrigin.width=el.clientWidth;}
   const box=el.getBoundingClientRect();w=box.width;h=box.height;const ratio=Math.min(devicePixelRatio,2);el.width=Math.round(w*ratio);el.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw(performance.now());};
  const tick=(now:number)=>{if(now-last>=1000/24){draw(now);last=now;}frame=requestAnimationFrame(tick);};
  const visibility=()=>{motionAt=0;cancelAnimationFrame(frame);if(!document.hidden&&!reduced)frame=requestAnimationFrame(tick);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();visibility();document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();if(page){page.style.removeProperty('translate');page.style.removeProperty('transition');}paper.onload=null;document.removeEventListener('visibilitychange',visibility);};
 },[pattern,origin,bottleRef]);
 return <canvas ref={canvas} className={styles.waveCanvas} aria-hidden="true"/>;
}
export function IslandBottleLogo(){
 const trigger=useRef<HTMLButtonElement>(null),focus=useRef<HTMLButtonElement>(null);
 const [pattern,setPattern]=useState('/stories/paths/abstract-island.svg');
 const [origin,setOrigin]=useState({x:0,y:0,width:1600,tileHeight:1200});
 const [host,setHost]=useState<HTMLElement|null>(null),[opened,setOpened]=useState(false),[leaving,setLeaving]=useState(false),[note,setNote]=useState(dailyNote);
 const timer=useRef<ReturnType<typeof setTimeout>>(),noteTimer=useRef<ReturnType<typeof setTimeout>>();
 const [opening,setOpening]=useState(false);
 useEffect(()=>()=>{clearTimeout(timer.current);clearTimeout(noteTimer.current);},[]);
 useEffect(()=>{if(!host)return;const siblings=Array.from(host.children).filter(n=>!n.hasAttribute('data-bottle-overlay')) as HTMLElement[];const previous=siblings.map(n=>n.inert);siblings.forEach(n=>n.inert=true);host.setAttribute('data-bottle-open','true');host.querySelector<HTMLButtonElement>('[data-bottle-overlay] button')?.focus();document.dispatchEvent(new CustomEvent('fi2-bottle-ocean',{detail:true}));return()=>{siblings.forEach((n,i)=>n.inert=previous[i]);host.removeAttribute('data-bottle-open');host.removeAttribute('data-bottle-leaving');document.dispatchEvent(new CustomEvent('fi2-bottle-ocean',{detail:false}));trigger.current?.focus({preventScroll:true});};},[host]);
 const close=()=>{if(leaving)return;clearTimeout(noteTimer.current);setLeaving(true);host?.setAttribute('data-bottle-leaving','true');timer.current=setTimeout(()=>{setHost(null);setLeaving(false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:940);};
 return <><button ref={trigger} data-island-logo aria-label="Your daily message in a bottle" className={styles.logo} onClick={()=>{const n=dailyNote();setNote(n);const parent=trigger.current?.closest('dialog');const surfaces=parent?Array.from(parent.querySelectorAll<HTMLElement>('section,section>div')):[];const surface=surfaces.find(el=>getComputedStyle(el).backgroundImage.includes('/stories/paths/'));const background=surface?getComputedStyle(surface):null;const bounds=surface?.getBoundingClientRect();setPattern(background?.backgroundImage.match(/url\(["']?([^"')]+)/)?.[1]??'/stories/paths/abstract-island.svg');setOrigin({x:bounds?.x??0,y:(bounds?.y??0)-(background?.backgroundAttachment==='local'?(surface?.scrollTop??0):0),width:bounds?.width??innerWidth,tileHeight:parseFloat(background?.backgroundSize.split(' ')[1]??'')||1200});setOpened(false);setOpening(false);setHost(trigger.current?.closest('dialog')??document.querySelector<HTMLElement>('.town-app')??document.body);}}><img src="/stories/paths/island-mark.svg" alt=""/><span className={styles.sparkles} aria-hidden="true"/></button>{host&&createPortal(<div data-bottle-overlay className={`${styles.ocean} ${leaving?styles.leaving:''}`} role="dialog" aria-modal="true" aria-labelledby="bottle-title" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button,a[href]'));const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
 <header><span>FOOTBALL WISDOM</span><DoneButton onDone={close}/></header>
 <OceanWaves leaving={leaving} pattern={pattern} origin={origin} bottleRef={focus}/>
 <main className={styles.center} data-bottle-opened={opened}><p className={styles.date}>{note.date}</p><h2 id="bottle-title">A little inspiration<br/>for your game.</h2>
 {!opened?<div className={styles.bottleSea}><button ref={focus} data-floating-bottle className={`${styles.bottleButton} ${opening?styles.opening:''}`} aria-label="Open today's message in a bottle" aria-disabled={opening} onClick={()=>{if(opening)return;document.dispatchEvent(new Event('fi2-bottle-pop'));setOpening(true);noteTimer.current=setTimeout(()=>{setOpened(true);setOpening(false);try{localStorage.setItem('fi2-bottle-open-date',note.key);}catch{}},matchMedia('(prefers-reduced-motion: reduce)').matches?0:140);}}><svg className={styles.bottle} viewBox="28 7 124 252" role="img" aria-label="A glass bottle with a note inside"><path d="M69 26H111V78L133 107L146 142V231L130 253H50L34 231V142L47 107L69 78Z" fill="#b8e3d48c" stroke="#e6f5d9" strokeWidth="4"/><path d="M35 144L57 132L62 231L51 251L35 230Z" fill="#6fb2a860"/><path d="M125 116L145 144V230L131 250L121 219Z" fill="#eef7d947"/><path d="M73 13h34v30H73Z" fill="#bc8b56" stroke="#ffdc91" strokeWidth="3"/><path d="M62 132l63-9 6 83-64 9Z" fill="#fff1ce"/><path d="m76 149 33-4m-32 18 35-5m-33 19 27-4" stroke="#769582" strokeWidth="3" strokeLinecap="round"/><path d="M49 149v70" stroke="#fff7de" strokeWidth="5" strokeLinecap="round" opacity=".6"/></svg><span className={styles.bottleLabel}>Open me</span><span className={styles.bottleSparkles} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></button></div>:<article className={styles.note} aria-live="polite"><span aria-hidden="true">✦</span><blockquote cite={note.source}><p>“{note.text}”</p></blockquote><footer><strong>{note.author}</strong><small>{note.role}</small><a href={note.source} target="_blank" rel="noopener noreferrer" aria-label={`Read the source for ${note.author}’s quote (opens in a new tab)`}>Read the source ↗</a></footer></article>}
 {opened&&<p className={styles.tomorrow}>Another football quote arrives tomorrow.</p>}</main>
 </div>,host)}</>;
}
