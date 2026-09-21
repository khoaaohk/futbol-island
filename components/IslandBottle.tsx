'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {DoneButton} from './DoneButton';
import styles from './IslandBottle.module.css';
const messages=[
  "Take a moment to notice what went well today.",
  "Check in with someone you haven’t spoken to in a while.",
  "A good teammate listens as well as they speak.",
  "Pick one thing to practise. Give it your attention.",
  "Leave a little time for something you enjoy.",
  "Thank someone for something specific.",
  "Invite someone into the game.",
  "You can ask for help before you have it figured out.",
  "A missed chance is something to learn from.",
  "Try to understand before offering advice.",
  "A short walk can be a useful break.",
  "Notice the effort behind someone’s improvement.",
  "Make room for someone else’s idea.",
  "It’s fine to take your time learning something new.",
  "Say hello to someone you usually walk past.",
  "One focused practice is enough for today.",
  "You don’t need to fill every quiet moment.",
  "Give someone your attention without checking your phone.",
  "Ask a teammate what they’re working on.",
  "There’s usually more than one way to solve a problem.",
  "Rest is part of getting ready for the next game.",
  "If someone helped you, let them know.",
  "Try something without worrying about being good at it yet.",
  "Let the last mistake go before the next play.",
  "A small favour can make someone’s day easier.",
  "Keep one promise you made to yourself.",
  "Ask a question you’ve been putting off.",
  "Look for the teammate who hasn’t had a turn.",
  "Take a breath before you respond.",
  "Enjoy a game without keeping score.",
  "You can change your mind after learning something new.",
  "Offer a hand with something ordinary.",
  "Pay attention to what makes practice enjoyable.",
  "Give credit to the person who set up the chance.",
  "You don’t have to solve everything today.",
  "Tell someone what you appreciated about their help.",
  "Listen to the end of someone’s story.",
  "Try a different approach if the first one isn’t working.",
  "Keep the next step small enough to start.",
  "Make it easy for someone new to join in.",
  "Ask how someone’s day went, and leave time for the answer.",
  "Share something you’ve learned recently.",
  "Put a little care into an everyday task.",
  "Let someone else choose the game today.",
  "Take a break before frustration takes over.",
  "A good question can be more useful than a quick answer.",
  "Notice a detail you usually miss.",
  "Be patient with someone learning the basics.",
  "Follow up on something a friend told you.",
  "Bring the same respect to practice as you do to a match.",
  "Try to leave shared spaces ready for the next person.",
  "Ask for feedback on one thing, not everything.",
  "Make time for a conversation that isn’t about results.",
  "You can disagree and still listen carefully.",
  "Keep practising the part you find interesting.",
  "Let a teammate know when their pass helped.",
  "Share the useful tip someone once gave you.",
  "Choose a pace you can keep up.",
  "Give yourself a moment to enjoy finishing something.",
  "Find a reason to get outside today."
];
function dailyNote(){const now=new Date();const key=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;const day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);return{key,text:messages[((day%messages.length)+messages.length)%messages.length],date:now.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})};}
function OceanWaves({leaving,pattern,origin}:{leaving:boolean;pattern:string;origin:{x:number;y:number;width:number;tileHeight:number}}){
 const canvas=useRef<HTMLCanvasElement>(null),exitAt=useRef<number|null>(null);
 useEffect(()=>{exitAt.current=leaving?performance.now():null;},[leaving]);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const page=el.parentElement?.parentElement?.querySelector<HTMLElement>(':scope>section');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,started=performance.now();let frame=0,last=0,w=0,h=0,grain:CanvasPattern|null=null;const paper=new Image();paper.onload=()=>{grain=ctx.createPattern(paper,'repeat');if(!document.hidden)draw(performance.now());};paper.src='/stories/films/assets/entry-grain.png';
  const ease=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
  const draw=(now:number)=>{
   ctx.clearRect(0,0,w,h);if(!w||!h)return;
   const elapsed=now-started,closing=exitAt.current!==null;
   const outgoing=closing?ease((now-exitAt.current!)/900):0;
   const progress=reduced?(closing?0:1):closing?1-outgoing:ease(elapsed/2100);
   if(page){const position=`0 ${h*progress}px`;if(page.style.translate!==position){page.style.setProperty('transition','none','important');page.style.translate=position;}}
   const ocean=reduced?0:ease((elapsed-2100)/1100)*(1-outgoing);
   const time=now/1000;
   // One continuous patterned surface meets the moving page at the same origin.
   // No separate color wipes, borders, or reloaded exit canvas.
   ctx.beginPath();ctx.moveTo(0,0);
   ctx.lineTo(0,h*progress);ctx.lineTo(w,h*progress);
   ctx.lineTo(w,0);ctx.closePath();
   {
    ctx.save();ctx.clip();ctx.fillStyle='#1255ee';ctx.fillRect(0,0,w,h);
    const offset=origin.y+h*progress,tile=origin.tileHeight;
    const edge=(t:number,base:number,cycle:number)=>{
     const u=1-t,curve=u*u*u*400+3*u*u*t*285+3*u*t*t*(-90)+t*t*t*(-200);
     const water=(Math.sin(t*Math.PI*2.4-time*1.2+cycle*.4)*26+Math.sin(t*Math.PI*4+time*.7)*9)*ocean;
     return offset+(curve+base+cycle*1200)/1200*tile+water;
    };
    const first=Math.floor(-offset/tile)-1,lastCycle=Math.ceil((h-offset)/tile)+1;
    for(let cycle=first;cycle<=lastCycle;cycle++)for(const [base,color]of [[0,'#087451'],[400,'#ffd03e']] as const){
     ctx.fillStyle=color;ctx.beginPath();
     for(let n=0;n<=64;n++){const t=n/64,x=origin.x+t*origin.width,y=edge(t,base,cycle);if(n===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
     for(let n=64;n>=0;n--){const t=n/64;ctx.lineTo(origin.x+t*origin.width,edge(t,base+400,cycle));}ctx.closePath();ctx.fill();
    }
    if(grain){ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.36;ctx.fillStyle=grain;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}ctx.restore();
   }
  };
  const resize=()=>{const box=el.getBoundingClientRect();w=box.width;h=box.height;const ratio=Math.min(devicePixelRatio,2);el.width=Math.round(w*ratio);el.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw(performance.now());};
  const tick=(now:number)=>{if(now-last>=1000/24){draw(now);last=now;}frame=requestAnimationFrame(tick);};
  const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden&&!reduced)frame=requestAnimationFrame(tick);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();visibility();document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();if(page){page.style.removeProperty('translate');page.style.removeProperty('transition');}paper.onload=null;document.removeEventListener('visibilitychange',visibility);};
 },[pattern,origin]);
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
 useEffect(()=>{if(!host)return;const siblings=Array.from(host.children).filter(n=>!n.hasAttribute('data-bottle-overlay')) as HTMLElement[];const previous=siblings.map(n=>n.inert);siblings.forEach(n=>n.inert=true);host.setAttribute('data-bottle-open','true');(focus.current??host.querySelector<HTMLButtonElement>('[data-bottle-overlay] button'))?.focus();document.dispatchEvent(new CustomEvent('fi2-bottle-ocean',{detail:true}));return()=>{siblings.forEach((n,i)=>n.inert=previous[i]);host.removeAttribute('data-bottle-open');host.removeAttribute('data-bottle-leaving');document.dispatchEvent(new CustomEvent('fi2-bottle-ocean',{detail:false}));trigger.current?.focus({preventScroll:true});};},[host]);
 const close=()=>{if(leaving)return;clearTimeout(noteTimer.current);setLeaving(true);host?.setAttribute('data-bottle-leaving','true');timer.current=setTimeout(()=>{setHost(null);setLeaving(false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:940);};
 return <><button ref={trigger} data-island-logo aria-label="Your daily message in a bottle" className={styles.logo} onClick={()=>{const n=dailyNote();setNote(n);const parent=trigger.current?.closest('dialog');const surfaces=parent?Array.from(parent.querySelectorAll<HTMLElement>('section,section>div')):[];const surface=surfaces.find(el=>getComputedStyle(el).backgroundImage.includes('/stories/paths/'));const background=surface?getComputedStyle(surface):null;const bounds=surface?.getBoundingClientRect();setPattern(background?.backgroundImage.match(/url\(["']?([^"')]+)/)?.[1]??'/stories/paths/abstract-island.svg');setOrigin({x:bounds?.x??0,y:(bounds?.y??0)-(background?.backgroundAttachment==='local'?(surface?.scrollTop??0):0),width:bounds?.width??innerWidth,tileHeight:parseFloat(background?.backgroundSize.split(' ')[1]??'')||1200});setOpened(false);setOpening(false);setHost(trigger.current?.closest('dialog')??document.querySelector<HTMLElement>('.town-app')??document.body);}}><img src="/stories/paths/island-mark.svg" alt=""/><span className={styles.sparkles} aria-hidden="true"/></button>{host&&createPortal(<div data-bottle-overlay className={`${styles.ocean} ${leaving?styles.leaving:''}`} role="dialog" aria-modal="true" aria-labelledby="bottle-title" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
 <header><span>A NOTE FOR TODAY</span><DoneButton onDone={close}/></header>
 <OceanWaves leaving={leaving} pattern={pattern} origin={origin}/>
 <main className={styles.center}><p className={styles.date}>{note.date}</p><h2 id="bottle-title">A little message<br/>for you.</h2>
 {!opened?<button ref={focus} className={`${styles.bottleButton} ${opening?styles.opening:''}`} aria-label="Open today's message in a bottle" aria-disabled={opening} onClick={()=>{if(opening)return;document.dispatchEvent(new Event('fi2-bottle-pop'));setOpening(true);noteTimer.current=setTimeout(()=>{setOpened(true);setOpening(false);try{localStorage.setItem('fi2-bottle-open-date',note.key);}catch{}},matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);}}><svg className={styles.bottle} viewBox="0 0 180 270" role="img" aria-label="A glass bottle with a note inside"><path d="M69 26H111V78L133 107L146 142V231L130 253H50L34 231V142L47 107L69 78Z" fill="#b8e3d48c" stroke="#e6f5d9" strokeWidth="4"/><path d="M35 144L57 132L62 231L51 251L35 230Z" fill="#6fb2a860"/><path d="M125 116L145 144V230L131 250L121 219Z" fill="#eef7d947"/><path d="M73 13h34v30H73Z" fill="#bc8b56" stroke="#ffdc91" strokeWidth="3"/><path d="M62 132l63-9 6 83-64 9Z" fill="#fff1ce"/><path d="m76 149 33-4m-32 18 35-5m-33 19 27-4" stroke="#769582" strokeWidth="3" strokeLinecap="round"/><path d="M49 149v70" stroke="#fff7de" strokeWidth="5" strokeLinecap="round" opacity=".6"/></svg><span className={styles.bottleLabel}>Open me</span><span className={styles.bottleSparkles} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></button>:<article className={styles.note} aria-live="polite"><span aria-hidden="true">✦</span><p>{note.text}</p><small>From Futbol Island.</small></article>}
 {opened&&<p className={styles.tomorrow}>Your next little message arrives tomorrow.</p>}</main>
 </div>,host)}</>;
}
