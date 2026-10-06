'use client';
import {Fragment,useCallback,useEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {flushSync} from 'react-dom';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import type {Chart} from './voyage';
import {CASE_FACTS,DATES,FINAL,GOALS,GROUPS,PORTS,SEA_NOTES,SEMIS,SOURCES,TEAMS,score,type Group,type Tie} from './data';
import s from './Experience.module.css';

/**
 * worldcup-1930 · "Two weeks at sea" (Oct 5 2026). One long scroll in four acts:
 *  1. The voyage: scrolling sails the Conte Verde from Genoa to Montevideo across a hand-drawn sea chart (Canvas 2D, lazily
 *     loaded), picking up Romania, France, Belgium and Brazil; a keepy-up on the rolling deck in mid-ocean.
 *  2. Arrival: the Estadio Centenario and the first kick-off.
 *  3. The bracket you build: pick each group winner, then the semi-finals and the final; the real results flip over.
 *  4. The final with two balls: drag the match clock; at half-time you swap Argentina's ball for Uruguay's.
 * Heat: no loop runs unless something moves. The chart draws on scroll and eases for a moment, then sleeps; the keepy-up and
 * the match clock run only while the ball is in the air / the clock is playing; everything stops when the tab is hidden and
 * is torn down on unmount. Sound: the museum's shared one-shots (they respect the island's mute), only after a tap.
 */
const CHAPTERS=[{id:'voyage',label:'Sail'},{id:'arrive',label:'Arrive'},{id:'bracket',label:'Bracket'},{id:'final',label:'Final'},{id:'end',label:'Sources'}] as const;
type ChapterId=typeof CHAPTERS[number]['id'];
const DRILL_P=.505;// between "Training at sea" (.44) and "Crossing the Equator" (.58)
const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const play=(f:()=>void)=>{try{f();}catch{}};

export default function Experience({exhibit,onClose}:ExperienceProps){
 const scroller=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),track=useRef<HTMLDivElement>(null);
 const dayRef=useRef<HTMLSpanElement>(null),dateRef=useRef<HTMLSpanElement>(null),barRef=useRef<HTMLSpanElement>(null);
 const [chapter,setChapter]=useState<ChapterId>('voyage'),[sailing,setSailing]=useState(true),[chartFailed,setChartFailed]=useState(false);
 const chapterRef=useRef<ChapterId>('voyage'),sailingRef=useRef(true);

 // ---- The voyage: scroll → target progress → (eased) chart frame. ------------------------------------------------------
 useEffect(()=>{
  const el=scroller.current,cv=canvas.current;if(!el||!cv)return;
  let chart:Chart|null=null,raf=0,last=0,cur=0,target=0,phase=0,disposed=false;const still=reduced();
  const progress=()=>{const t=track.current;if(!t)return 0;const top=t.offsetTop,H=t.offsetHeight,vh=el.clientHeight;return Math.max(0,Math.min(1,(el.scrollTop-top+vh/2)/H));};
  const hud=(p:number)=>{
   const d=interp(p);const day=Math.max(1,Math.round(d)-20),date=Math.round(d);
   if(dayRef.current)dayRef.current.textContent=`Day ${day}`;
   if(dateRef.current)dateRef.current.textContent=date<=30?`${date} June 1930`:`${date-30} July 1930`;
   if(barRef.current)barRef.current.style.transform=`scaleX(${Math.min(1,Math.max(0,(p-.03)/.92))})`;
  };
  const frame=(now:number)=>{raf=0;if(!chart||document.hidden)return;const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;
   if(still)cur=target;else{cur+=(target-cur)*Math.min(1,dt*7);phase+=dt*2.2;}
   chart.draw(cur,phase);hud(cur);
   if(Math.abs(target-cur)>.0004)raf=requestAnimationFrame(frame);else{if(cur!==target){cur=target;chart.draw(cur,phase);hud(cur);}last=0;}};
  const kick=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);};
  const onScroll=()=>{
   const t=track.current;if(!t)return;const vh=el.clientHeight,inChart=el.scrollTop<t.offsetTop+t.offsetHeight;
   if(inChart!==sailingRef.current){sailingRef.current=inChart;setSailing(inChart);}
   // Which chapter is in the middle of the screen (state only changes when the chapter does).
   let ch:ChapterId='voyage';for(const c of CHAPTERS){const n=el.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`);if(n&&n.offsetTop<=el.scrollTop+vh*.5)ch=c.id;}
   if(ch!==chapterRef.current){chapterRef.current=ch;setChapter(ch);}
   if(!inChart)return;target=progress();kick();
  };
  const onResize=()=>{chart?.resize();target=progress();if(still)cur=target;kick();};
  const onVis=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else kick();};
  import('./voyage').then(({createChart})=>{if(disposed)return;try{chart=createChart(cv,{coarse:matchMedia('(pointer:coarse)').matches});target=cur=progress();chart.draw(cur,0);hud(cur);}catch(err){console.error('worldcup-1930 chart failed',err);setChartFailed(true);}})
   .catch(()=>{if(!disposed)setChartFailed(true);});
  el.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onResize);document.addEventListener('visibilitychange',onVis);
  (window as unknown as {__wc1930?:unknown}).__wc1930={progress:()=>cur,looping:()=>raf!==0};
  return()=>{disposed=true;cancelAnimationFrame(raf);raf=0;el.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize);document.removeEventListener('visibilitychange',onVis);
   chart?.dispose();chart=null;delete (window as unknown as {__wc1930?:unknown}).__wc1930;};
 },[]);

 // Escape leaves; focus the scroller so the arrow keys / space scroll the voyage straight away.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}};window.addEventListener('keydown',key);scroller.current?.focus({preventScroll:true});
  return()=>window.removeEventListener('keydown',key);},[onClose]);
 const jump=(id:ChapterId)=>{const el=scroller.current,n=el?.querySelector<HTMLElement>(`[data-chapter="${id}"]`);if(!el||!n)return;
  el.scrollTo({top:id==='voyage'?0:n.offsetTop,behavior:reduced()?'auto':'smooth'});};

 return <section className={s.root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: two weeks at sea`} data-museum-experience="worldcup-1930" data-chapter-now={chapter}>
  <canvas ref={canvas} className={s.chart} aria-hidden="true" style={{visibility:sailing?'visible':'hidden'}}/>
  <ExperienceBack onClose={onClose}/>
  <header className={s.header}>
   <nav className={s.chapters} aria-label="Chapters">
    {CHAPTERS.map((c,i)=><button key={c.id} type="button" className={s.chapterBtn} aria-current={chapter===c.id?'step':undefined} onClick={()=>jump(c.id)}><i aria-hidden="true">{i+1}</i><span>{c.label}</span></button>)}
   </nav>
  </header>
  <div className={s.hud} data-on={sailing} aria-hidden={!sailing}>
   <span className={s.hudDay} ref={dayRef}>Day 1</span><span className={s.hudDate} ref={dateRef}>21 June 1930</span>
   <span className={s.hudBar}><span ref={barRef}/></span>
   <span className={s.hudEnds}><span>Genoa</span><span>Montevideo</span></span>
  </div>

  <div ref={scroller} className={s.scroller} tabIndex={0} aria-label="The 1930 World Cup story. Scroll to sail.">
   {/* ---- Act 1: the voyage ---- */}
   <div className={s.hero} data-chapter="voyage">
    <p className={s.kicker}>{exhibit.year} · {exhibit.title}</p>
    <h1 className={s.title}>Two weeks<br/>at sea.</h1>
    <p className={s.lede}>{CASE_FACTS.host} Uruguay is far from Europe, so the European teams had to sail there. Four of them shared one ship.</p>
    <p className={s.scrollHint} aria-hidden="true"><span>Scroll to set sail</span><b>↓</b></p>
    {chartFailed&&<p className={s.note}>The sea chart couldn’t load on this device, but the story still scrolls.</p>}
   </div>
   <div ref={track} className={s.track} aria-label="The voyage">
    {PORTS.map(p=><article key={p.id} className={s.card} data-port={p.id} style={{'--p':p.p} as CSSProperties}>
     <p className={s.cardKicker}>{p.date??'Port of call'} · {p.name}</p>
     <h2 className={s.cardTitle}>{p.who}</h2>
     <p>{p.text}</p>
    </article>)}
    {SEA_NOTES.map(n=><article key={n.id} className={`${s.card} ${s.sea}`} data-note={n.id} style={{'--p':n.p} as CSSProperties}>
     <p className={s.cardKicker}>At sea</p><h2 className={s.cardTitle}>{n.title}</h2><p>{n.text}</p>
    </article>)}
    {/* The keepy-up gets its own card just after "Training at sea", so neither card outgrows a phone screen. */}
    <article className={`${s.card} ${s.sea} ${s.drillCard}`} data-note="drill" style={{'--p':DRILL_P} as CSSProperties}>
     <p className={s.cardKicker}>On deck · your turn</p><DeckDrill/>
    </article>
   </div>

   {/* ---- Act 2: arrival ---- */}
   <section className={s.arrive} data-chapter="arrive" aria-labelledby="wc30-arrive">
    <p className={s.kicker}>Montevideo · July 1930</p>
    <h2 id="wc30-arrive" className={s.bigHead}>A brand-new stadium</h2>
    <Stadium/>
    <div className={s.factGrid}>
     <div className={s.fact}><b>Estadio Centenario</b><p>Uruguay built it for the World Cup, in about nine months. “Centenario” means 100 years: the country’s first constitution was from 1830.</p></div>
     <div className={s.fact}><b>Not ready on day one</b><p>The first games were played at two other grounds. The Centenario’s first match was Uruguay 1–0 Peru on 18 July.</p></div>
     <div className={s.fact}><b>13 July 1930: kick-off</b><p>Two games started at the same time. Lucien Laurent of France scored the first World Cup goal, a volley, in France 4–1 Mexico.</p></div>
    </div>
   </section>

   {/* ---- Act 3: the bracket ---- */}
   <Bracket/>

   {/* ---- Act 4: the final ---- */}
   <FinalMatch/>

   {/* ---- Outro ---- */}
   <section className={s.end} data-chapter="end" aria-labelledby="wc30-end">
    <p className={s.kicker}>Take it to your game</p>
    <h2 id="wc30-end" className={s.quote}>{exhibit.forYourGame}</h2>
    <p className={s.endLine}>And if you’re losing at half-time, keep going. Uruguay were 2–1 down and won 4–2.</p>
    <ul className={s.recap}>{[CASE_FACTS.host,CASE_FACTS.final,CASE_FACTS.teams].map(f=><li key={f}>{f}</li>)}</ul>
    <details className={s.sources}><summary>Sources</summary><ul>{[...exhibit.sources,...SOURCES.filter(x=>!exhibit.sources.some(e=>e.url===x.url))].map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul>
     <p className={s.small}>Everything here is real history. The sea chart is drawn by hand and simplified; the ship’s line joins the real ports but is not its logged course. Team colours are just colours, not 1930 flags.</p></details>
    <div className={s.endRow}>
     <button type="button" className={s.againBtn} data-museum-own-cue onClick={()=>jump('voyage')}><span aria-hidden="true">↑</span> Sail it again</button>
     <p className={s.fin} aria-hidden="true">Fin · 1930</p>
    </div>
   </section>
  </div>
 </section>;
}
function interp(p:number){if(p<=DATES[0].p)return DATES[0].day;for(let i=1;i<DATES.length;i++)if(p<=DATES[i].p){const a=DATES[i-1],b=DATES[i];return a.day+(b.day-a.day)*(p-a.p)/(b.p-a.p);}return DATES[DATES.length-1].day;}

// ---- Keepy-up on a rolling deck ------------------------------------------------------------------------------------------
/** Tap under the ball to keep it up while the deck rolls; where you touch it steers it (soft, central touches win). The loop
 *  only runs while the ball is in the air. */
const CHEERS:Record<number,string>={5:'Five in a row!',10:'Ten! The sailors are cheering',20:'Twenty! Romania’s coach wants you'};
function DeckDrill(){
 const stage=useRef<HTMLButtonElement>(null),ball=useRef<HTMLSpanElement>(null),deck=useRef<HTMLSpanElement>(null),shadow=useRef<HTMLSpanElement>(null);
 const st=useRef({x:0,y:0,vx:0,vy:0,t:0,air:false,raf:0,last:0});
 const [count,setCount]=useState(0),[best,setBest]=useState(0),[msg,setMsg]=useState('Tap the ball to start'),[cheer,setCheer]=useState('');
 const paint=()=>{const b=st.current;if(ball.current)ball.current.style.transform=`translate(${b.x}px,${-b.y}px)`;if(deck.current)deck.current.style.transform=`rotate(${tilt(b.t)}deg)`;
  if(shadow.current){const k=Math.max(.35,1-b.y/260);shadow.current.style.transform=`translateX(${b.x}px) scale(${k})`;shadow.current.style.opacity=String(.2+.4*k);}};
 const still=useRef(false);useEffect(()=>{still.current=reduced();},[]);
 const tilt=(t:number)=>still.current?0:Math.sin(t*1.1)*5;
 const step=useCallback((now:number)=>{const b=st.current;b.raf=0;if(document.hidden){b.last=0;return;}const dt=Math.min(.04,b.last?(now-b.last)/1000:.016);b.last=now;b.t+=dt;
  const w=(stage.current?.clientWidth??260)/2-18;b.vy-=900*dt;b.vx+=tilt(b.t)*14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y<=0||Math.abs(b.x)>w){b.air=false;b.y=0;b.x=Math.max(-w,Math.min(w,b.x));b.vx=b.vy=0;b.last=0;paint();
   setCheer('');setCount(c=>{setBest(x=>Math.max(x,c));setMsg(c?`Dropped after ${c}. Tap to go again`:'Tap the ball to start');return 0;});return;}
  paint();b.raf=requestAnimationFrame(step);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const touch=(e:ReactPointerEvent<HTMLButtonElement>|null)=>{const b=st.current,r=stage.current?.getBoundingClientRect();
  let off=0;if(e&&r&&e.clientX){off=(e.clientX-(r.left+r.width/2+b.x))/30;}// tap left of the ball → it goes right
  off=Math.max(-1.2,Math.min(1.2,off));b.vy=430;b.vx=-off*120+b.vx*.3;setMsg('');play(museumSfx.kick);
  setCount(c=>{const n=c+1;const m=CHEERS[n];if(m){setCheer(m);play(museumSfx.crowd);}return n;});
  if(!b.air){b.air=true;b.last=0;}if(!b.raf)b.raf=requestAnimationFrame(step);};
 useEffect(()=>{const onVis=()=>{const b=st.current;if(!document.hidden&&b.air&&!b.raf)b.raf=requestAnimationFrame(step);};document.addEventListener('visibilitychange',onVis);
  const b=st.current;return()=>{cancelAnimationFrame(b.raf);b.raf=0;document.removeEventListener('visibilitychange',onVis);};},[step]);
 return <div className={s.drill}>
  <h2 className={s.cardTitle}>Keep it up on deck</h2>
  <button ref={stage} type="button" className={s.stage} data-museum-own-cue aria-label={`Keepy-up on the ship’s deck. Tap to touch the ball up. ${count} touches.`}
   onPointerDown={e=>{e.preventDefault();touch(e);}} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();touch(null);}}}>
   <span className={s.swell} aria-hidden="true"/>
   <span ref={deck} className={s.deck} aria-hidden="true"><i/></span>
   <span ref={shadow} className={s.drillShadow} aria-hidden="true"/>
   <span ref={ball} className={s.drillBall} aria-hidden="true"/>
   <span key={count} className={s.drillCount} data-pop={count>0||undefined} aria-hidden="true">{count}</span>
  </button>
  <p className={s.drillMsg} aria-live="polite" data-cheer={cheer?true:undefined}>{cheer||msg||`${count} touches`}{best?<span className={s.best}>Best {best}</span>:null}</p>
  <p className={s.small}>Tap under the middle of the ball to keep it straight. Off-centre taps make it drift.</p>
 </div>;
}

// ---- The stadium (SVG) ---------------------------------------------------------------------------------------------------
/** The crowd: seeded dots on rings between the rim and the pitch wall, made once (no randomness at render). */
const CROWD=(()=>{const out:{x:number;y:number;c:string}[]=[];const pal=['#1f2a44','#b8322a','#f4efe3','#5fa8dc','#3b3530','#8a6a45','#f4efe3','#1f2a44'];let r=1930;
 for(let ring=0;ring<6;ring++){const t=.12+ring*.14,rx=300-(300-214)*t,ry=64-(64-40)*t,cy=180+(192-180)*t,n=Math.round(80+rx*.22);
  for(let i=0;i<n;i++){r=(Math.imul(r,1664525)+1013904223)>>>0;const a=(i+(ring%2)*.5)/n*Math.PI*2,j=((r>>>8)&255)/255-.5;
   out.push({x:+(320+Math.cos(a)*rx+j*1.6).toFixed(1),y:+(cy+Math.sin(a)*ry+j).toFixed(1),c:pal[(r>>>16)%pal.length]});}}
 return out;})();
function Stadium(){
 return <svg className={s.stadium} viewBox="0 0 640 260" role="img" aria-label="A drawing of the Estadio Centenario: a full oval bowl around the pitch, with a tall tower on the far side.">
  <defs>
   <linearGradient id="wc30sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3cf96"/><stop offset=".55" stopColor="#f2dfb8"/><stop offset="1" stopColor="#efe5cc"/></linearGradient>
   <radialGradient id="wc30sun" cx="12%" cy="22%" r="40%"><stop offset="0" stopColor="#fff6dc" stopOpacity=".95"/><stop offset="1" stopColor="#fff6dc" stopOpacity="0"/></radialGradient>
   <linearGradient id="wc30stand" x1="0" x2="1"><stop offset="0" stopColor="#efe2bf"/><stop offset=".55" stopColor="#ddcb9f"/><stop offset="1" stopColor="#c4af80"/></linearGradient>
   <linearGradient id="wc30wall" x1="0" x2="1"><stop offset="0" stopColor="#e3d3ad"/><stop offset="1" stopColor="#b59f72"/></linearGradient>
   <linearGradient id="wc30shade" x1="0" x2="1"><stop offset=".45" stopColor="#1f2a44" stopOpacity="0"/><stop offset="1" stopColor="#1f2a44" stopOpacity=".22"/></linearGradient>
   <clipPath id="wc30pitch"><ellipse cx="320" cy="194" rx="206" ry="35"/></clipPath>
  </defs>
  <rect width="640" height="260" fill="url(#wc30sky)"/><rect width="640" height="260" fill="url(#wc30sun)"/>
  {/* Montevideo on the horizon. */}
  <path d="M0 150 L0 132 L26 132 L26 120 L40 120 L40 128 L70 128 L74 112 L80 112 L84 126 L120 126 L120 116 L150 116 L150 130 L200 130 L210 124 L240 128 L640 132 L640 150Z" fill="#a9b6bf" opacity=".45"/>
  <ellipse cx="320" cy="214" rx="318" ry="42" fill="#1f2a44" opacity=".12"/>
  {/* The outside wall of the near stand, then the stands' slope, the crowd, the pitch wall and the pitch. */}
  <path d="M20 180 A300 64 0 0 0 620 180 L620 198 A300 64 0 0 1 20 198Z" fill="url(#wc30wall)" stroke="#1f2a44" strokeWidth="1.5"/>
  <g stroke="#1f2a44" strokeOpacity=".22" strokeWidth="1">{Array.from({length:23},(_,i)=>{const x=40+i*25,dy=64*Math.sqrt(Math.max(0,1-((x-320)/300)**2));return <line key={i} x1={x} y1={180+dy+3} x2={x} y2={196+dy}/>;})}</g>
  <ellipse cx="320" cy="180" rx="300" ry="64" fill="url(#wc30stand)" stroke="#1f2a44" strokeWidth="1.5"/>
  <g>{CROWD.map((d,i)=><circle key={i} cx={d.x} cy={d.y} r="1.9" fill={d.c} opacity=".8"/>)}</g>
  <ellipse cx="320" cy="180" rx="300" ry="64" fill="url(#wc30shade)"/>
  <ellipse cx="320" cy="193" rx="214" ry="40" fill="#e9dcb8" stroke="#1f2a44" strokeWidth="1.2"/>
  <g clipPath="url(#wc30pitch)">
   <rect x="110" y="155" width="420" height="80" fill="#5f8f4f"/>
   {Array.from({length:10},(_,i)=><rect key={i} x={114+i*42} y="155" width="21" height="80" fill="#6c9c59"/>)}
   <rect x="110" y="155" width="420" height="80" fill="url(#wc30shade)"/>
  </g>
  <ellipse cx="320" cy="194" rx="206" ry="35" fill="none" stroke="#1f2a44" strokeWidth="1.2"/>
  <g stroke="#f4efe3" strokeWidth="1.4" fill="none" opacity=".9" strokeLinejoin="round">
   <path d="M196 178 L444 178 L462 210 L178 210Z"/><path d="M320 178 L320 210"/><ellipse cx="320" cy="194" rx="20" ry="5.5"/>
   <path d="M196 185 L172 185 L162 203 L189 203"/><path d="M444 185 L468 185 L478 203 L451 203"/>
  </g>
  {/* Torre de los Homenajes: lit from the left. */}
  <g transform="translate(402 0)">
   <path d="M-12 128 L12 128 L12 42 L-12 42Z" fill="#f4efe3" stroke="#1f2a44" strokeWidth="1.6"/>
   <path d="M2 128 L12 128 L12 42 L2 42Z" fill="#1f2a44" opacity=".16"/>
   {[52,64,76,88,100,112].map(y=><rect key={y} x="-7" y={y} width="5" height="7" fill="#1f2a44" opacity=".55"/>)}
   {[52,64,76,88,100,112].map(y=><rect key={y} x="4" y={y} width="5" height="7" fill="#1f2a44" opacity=".7"/>)}
   <path d="M-15 42 L15 42 L15 36 L-15 36Z M-10 36 L10 36 L10 26 L-10 26Z M-6 26 L6 26 L6 18 L-6 18Z" fill="#f4efe3" stroke="#1f2a44" strokeWidth="1.4"/>
   <line x1="0" y1="18" x2="0" y2="-2" stroke="#1f2a44" strokeWidth="1.6"/>
   <g transform="translate(1 -2)"><rect width="24" height="15" fill="#f4efe3" stroke="#1f2a44" strokeWidth=".8"/>
    {[3.3,6.7,10,13.3].map(y=><rect key={y} x={y<7?8:0} y={y-.8} width={y<7?16:24} height="1.7" fill="#2f6fb5"/>)}<rect width="8" height="7" fill="#f4efe3"/><circle cx="4" cy="3.6" r="2.3" fill="#e2b53b"/></g>
  </g>
  <text x="24" y="34" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic" fill="#1f2a44">Estadio Centenario, Montevideo</text>
  <text x="24" y="52" fontFamily="Georgia, serif" fontSize="11" fill="#1f2a44" opacity=".7">Opened 18 July 1930</text>
 </svg>;
}

// ---- The bracket you build -----------------------------------------------------------------------------------------------
function Chip({id,on,dim}:{id:string;on?:boolean;dim?:boolean}){const t=TEAMS[id];return <span className={s.chip} data-on={on||undefined} data-dim={dim||undefined}>
 <i style={{background:t.color}} aria-hidden="true"/>{t.name}{t.ship&&<ShipIcon/>}</span>;}
function ShipIcon(){return <svg className={s.shipIcon} viewBox="0 0 24 14" aria-label="came on the ship" role="img"><path d="M1 8h22l-3 5H4z" fill="currentColor"/><rect x="7" y="4" width="10" height="4" fill="currentColor" opacity=".7"/><rect x="9" y="0" width="2.4" height="4" fill="#d9a441"/><rect x="13" y="0" width="2.4" height="4" fill="#d9a441"/></svg>;}

function Bracket(){
 const [pick,setPick]=useState<Record<string,string>>({});
 // A group pick morphs: the team you tapped flies to its place in the real table (a same-document View Transition, where the
 // browser has one and motion is allowed; otherwise the result simply flips in).
 const choose=(id:string,team:string)=>{if(pick[id])return;play(museumSfx.stamp);
  const doc=document as Document&{startViewTransition?:(cb:()=>void)=>unknown},btn=document.querySelector<HTMLElement>(`[data-group="${id}"] [data-team="${team}"]`);
  if(doc.startViewTransition&&btn&&!reduced()){btn.style.setProperty('view-transition-name',`wc30-${id}`);
   try{doc.startViewTransition(()=>{flushSync(()=>setPick(p=>({...p,[id]:team})));});return;}catch{btn.style.removeProperty('view-transition-name');}}
  setPick(p=>({...p,[id]:team}));};
 const groupsDone=GROUPS.every(g=>pick[g.id]),semisDone=groupsDone&&SEMIS.every(t=>pick[t.id]),finalDone=semisDone&&!!pick.f;
 const right=[...GROUPS.map(g=>pick[g.id]===g.winner),...SEMIS.map(t=>pick[t.id]===t.winner)].filter(Boolean).length;
 return <section className={s.bracket} data-chapter="bracket" aria-labelledby="wc30-bracket">
  <p className={s.kicker}>13 – 30 July 1930</p>
  <h2 id="wc30-bracket" className={s.bigHead}>Build the bracket</h2>
  <p className={s.lede}>{CASE_FACTS.teams} Nobody had to qualify: they were invited. Seven came from South America, four from Europe and two from North America.</p>
  <div className={s.howTo}>
   <p><b>Groups.</b> Every team plays every other team in its group once. Only the top team goes through.</p>
   <p><b>Knockouts.</b> Win and you go on. Lose once and you are out.</p>
  </div>
  <p className={s.instr}>Tap the team you think won each group. Then the real result flips over.</p>
  <div className={s.groups}>{GROUPS.map(g=><GroupCard key={g.id} g={g} pick={pick[g.id]} onPick={t=>choose(g.id,t)}/>)}</div>
  {groupsDone&&<p className={s.callout} data-reveal><ShipIcon/> All four teams from the ship went home after the groups: France, Brazil, Romania and Belgium.</p>}
  <h3 className={s.stageHead}>Semi-finals</h3>
  {!groupsDone&&<p className={s.locked}>Pick all four groups first.</p>}
  <div className={s.ties} data-locked={!groupsDone||undefined}>{SEMIS.map(t=><TieCard key={t.id} t={t} pick={pick[t.id]} locked={!groupsDone} onPick={x=>choose(t.id,x)}/>)}</div>
  <h3 className={s.stageHead}>The final</h3>
  {!semisDone&&<p className={s.locked}>Pick both semi-finals first.</p>}
  <div className={s.ties} data-locked={!semisDone||undefined}><TieCard t={FINAL} pick={pick.f} locked={!semisDone} onPick={x=>choose('f',x)} final/></div>
  {finalDone&&<p className={s.tally} aria-live="polite">You called <b>{right}</b> of 6 right so far. Was your final pick right? Play the final ↓</p>}
 </section>;
}
function GroupCard({g,pick,onPick}:{g:Group;pick?:string;onPick:(t:string)=>void}){
 return <div className={s.group} data-group={g.id} data-revealed={!!pick||undefined}>
  <h4>{g.label}</h4>
  {!pick?<div className={s.pickList} role="group" aria-label={`${g.label}: who won it?`}>{g.teams.map(t=><button key={t} type="button" className={s.pickBtn} data-museum-own-cue data-team={t} onClick={()=>onPick(t)}><Chip id={t}/></button>)}</div>
  :<div className={s.result} aria-live="polite">
   <p className={s.verdict} data-right={pick===g.winner}>{pick===g.winner?'You got it!':`You picked ${TEAMS[pick].name}.`}</p>
   <ol className={s.table}>{[g.winner,...g.teams.filter(t=>t!==g.winner)].map((t,i)=><li key={t} style={t===pick?{viewTransitionName:`wc30-${g.id}`} as CSSProperties:undefined}><Chip id={t} on={i===0} dim={i>0}/>{i===0&&<em>through</em>}</li>)}</ol>
   <p className={s.line}>{g.line}</p>
   <details className={s.games}><summary>All the scores</summary><ul>{g.games.map(x=><li key={x}>{x}</li>)}</ul></details>
  </div>}
 </div>;
}
function TieCard({t,pick,locked,onPick,final}:{t:Tie;pick?:string;locked:boolean;onPick:(x:string)=>void;final?:boolean}){
 return <div className={s.tie} data-tie={t.id} data-final={final||undefined}>
  <p className={s.tieDate}>{t.date}{final?' · Estadio Centenario':''}</p>
  {!pick?<div className={s.tieRow} role="group" aria-label={`${TEAMS[t.a].name} against ${TEAMS[t.b].name}: who won?`}>
   {[t.a,t.b].map((x,i)=><Fragment key={x}>{i===1&&<span className={s.vs}>v</span>}<button type="button" className={s.pickBtn} data-museum-own-cue data-team={x} disabled={locked} onClick={()=>onPick(x)}><Chip id={x}/></button></Fragment>)}
  </div>:<div className={s.result} aria-live="polite">
   {final?<p className={s.verdict} data-right="wait">Your pick: {TEAMS[pick].name}</p>:<p className={s.verdict} data-right={pick===t.winner}>{pick===t.winner?'You got it!':`You picked ${TEAMS[pick].name}.`}</p>}
   {final?<p className={s.tieScore}>Who won? Play the final below and find out.</p>:<p className={s.tieScore}>{t.score}</p>}
  </div>}
 </div>;
}

// ---- The final: two balls, one clock ---------------------------------------------------------------------------------------
function FinalMatch(){
 const [min,setMin]=useState(0),[swapped,setSwapped]=useState(false),[playing,setPlaying]=useState(false);
 const minRef=useRef(0),swapRef=useRef(false),raf=useRef(0),last=useRef(0);
 const sc=score(min),half=min>=45&&!swapped,ballArg=!swapped,ft=min>=90;
 const setMinute=useCallback((v:number,sound=true)=>{const cap=swapRef.current?90:45,next=Math.max(0,Math.min(cap,v)),prev=minRef.current;
  if(sound&&next>prev){if(GOALS.some(g=>g.min>prev&&g.min<=next))play(museumSfx.crowd);if((prev<45&&next>=45)||(prev<90&&next>=90))play(museumSfx.whistle);}
  minRef.current=next;setMin(next);return next;},[]);
 const stop=useCallback(()=>{cancelAnimationFrame(raf.current);raf.current=0;last.current=0;setPlaying(false);},[]);
 const tick=useCallback((now:number)=>{raf.current=0;if(document.hidden){last.current=0;setPlaying(false);return;}const dt=Math.min(.05,last.current?(now-last.current)/1000:.016);last.current=now;
  const before=minRef.current,next=setMinute(before+dt*(reduced()?12:6));
  if(next>=(swapRef.current?90:45)){stop();return;}raf.current=requestAnimationFrame(tick);},[setMinute,stop]);
 const start=()=>{if(raf.current)return stop();if(minRef.current>=90){minRef.current=0;setMin(0);setSwapped(false);swapRef.current=false;}
  if(minRef.current===0)play(museumSfx.whistle);if(!swapRef.current&&minRef.current>=45)return;setPlaying(true);last.current=0;raf.current=requestAnimationFrame(tick);};
 const swap=()=>{swapRef.current=true;setSwapped(true);play(museumSfx.spin);};
 useEffect(()=>()=>{cancelAnimationFrame(raf.current);raf.current=0;},[]);
 useEffect(()=>{const v=()=>{if(document.hidden&&raf.current)stop();};document.addEventListener('visibilitychange',v);return()=>document.removeEventListener('visibilitychange',v);},[stop]);
 const shown=GOALS.filter(g=>g.min<=min);
 return <section className={s.final} data-chapter="final" aria-labelledby="wc30-final" data-half={min<45?1:2} data-swapped={swapped}>
  <p className={s.kickerLight}>30 July 1930 · Estadio Centenario · 68,346 fans</p>
  <h2 id="wc30-final" className={s.bigHeadLight}>The final with two balls</h2>
  <p className={s.ledeLight}>Uruguay and Argentina could not agree whose ball to use. So they used one each: Argentina’s ball in the first half, Uruguay’s in the second. Drag the clock, or press Play.</p>
  <div className={s.board} role="status" aria-live="polite" aria-label={`${Math.floor(min)} minutes. Uruguay ${sc.uru}, Argentina ${sc.arg}.`}>
   <span className={`${s.team} ${s.teamA}`}><i aria-hidden="true" style={{background:TEAMS.uru.color}}/>Uruguay</span>
   <span key={`u${sc.uru}`} className={`${s.num} ${s.numA}`} data-pop={sc.uru>0||undefined}>{sc.uru}</span><span className={s.dash}>–</span>
   <span key={`a${sc.arg}`} className={`${s.num} ${s.numB}`} data-pop={sc.arg>0||undefined}>{sc.arg}</span>
   <span className={`${s.team} ${s.teamB}`}>Argentina<i aria-hidden="true" style={{background:TEAMS.arg.color}}/></span>
   <span className={s.minute}>{ft?'Full time':half?'Half-time':`${Math.floor(min)}′`}</span>
  </div>
  <div className={s.balls}>
   <Ball kind="arg" active={ballArg}/><Ball kind="uru" active={!ballArg}/>
  </div>
  {half&&<div className={s.swapBox}><p>Half-time. Argentina lead 2–1 with their ball. Now it’s Uruguay’s turn.</p>
   <button type="button" className={s.swapBtn} data-museum-own-cue data-swap onClick={swap}>Swap the ball</button></div>}
  <div className={s.clock}>
   <button type="button" className={s.playBtn} data-museum-own-cue onClick={start} aria-label={playing?'Pause the clock':'Play the match clock'} disabled={half}>{playing?'Pause':ft?'Replay':min>0?'Play on':'Kick off'}</button>
   <div className={s.rangeWrap}>
    <input type="range" min={0} max={90} step={1} value={Math.floor(min)} aria-label="Match clock, minutes" aria-valuetext={`${Math.floor(min)} minutes`}
     onChange={e=>{if(raf.current)stop();setMinute(+e.target.value);}} className={s.range}/>
    <span className={s.halfMark} aria-hidden="true"/>
    {GOALS.map(g=><span key={g.min} className={s.goalMark} data-team={g.team} data-on={g.min<=min||undefined} style={{left:`${g.min/90*100}%`}} aria-hidden="true"/>)}
    <span className={s.rangeEnds} aria-hidden="true"><span>0′</span><span>45′</span><span>90′</span></span>
   </div>
  </div>
  <ol className={s.goals} aria-label="Goals">{shown.map(g=><li key={g.min} data-team={g.team}><b>{g.min}′</b> {g.who} <i>{g.team==='uru'?'Uruguay':'Argentina'}</i></li>)}</ol>
  {ft&&<div className={s.champions}>
   <div className={s.trophyWrap}>
    {/* The full-time payoff: a one-shot ring of gold rays behind the trophy (CSS, plays once; skipped with reduced motion). */}
    <svg className={s.burst} viewBox="-60 -60 120 120" aria-hidden="true">{Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;
     return <line key={i} x1={Math.cos(a)*22} y1={Math.sin(a)*22} x2={Math.cos(a)*(i%2?40:52)} y2={Math.sin(a)*(i%2?40:52)}/>;})}</svg>
    <Trophy/>
   </div>
   <div><p className={s.champHead}>{CASE_FACTS.final}</p>
    <ul className={s.champFacts}>
     <li>Uruguay scored three goals with their own ball in the second half.</li>
     <li>Argentina’s Guillermo Stábile was the top scorer of the World Cup, with 8 goals.</li>
     <li>The referee, John Langenus of Belgium, had sailed over on the Conte Verde.</li>
     <li>Today, Law 2 of the Laws of the Game sets one size and weight for every match ball: 68–70 cm around and 410–450 g.</li>
    </ul></div>
  </div>}
 </section>;
}
/** The two 1930 balls, drawn: Argentina's (about 12 panels) and Uruguay's T-Model (11 T-shaped panels), both laced leather. */
function Ball({kind,active}:{kind:'arg'|'uru';active:boolean}){
 const arg=kind==='arg';
 return <figure className={s.ball} data-ball={kind} data-active={active||undefined}>
  <svg viewBox="-60 -60 120 120" role="img" aria-label={arg?'Argentina’s ball, used in the first half':'Uruguay’s T-Model ball, used in the second half'}>
   <defs><radialGradient id={`wc30b-${kind}`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor={arg?'#c98a52':'#f0cf96'}/><stop offset=".7" stopColor={arg?'#8e5528':'#c08a4c'}/><stop offset="1" stopColor="#4d2c12"/></radialGradient>
    <clipPath id={`wc30c-${kind}`}><circle r="52"/></clipPath></defs>
   <circle r="52" fill={`url(#wc30b-${kind})`}/>
   <g clipPath={`url(#wc30c-${kind})`} stroke="#3a2210" strokeWidth="1.6" fill="none" opacity=".75">
    {arg?<><path d="M-52 -14 Q0 -24 52 -14 M-52 14 Q0 24 52 14"/><path d="M-18 -52 Q-24 0 -18 52 M18 -52 Q24 0 18 52"/></>
    :<><path d="M-52 -18 L52 -18 M-6 -18 L-6 52 M6 -18 L6 52"/><path d="M-52 20 Q-30 22 -6 20 M6 20 Q30 22 52 20"/><path d="M-30 -52 L-30 -18 M30 -52 L30 -18"/></>}
   </g>
   <g stroke="#f1dfbf" strokeWidth="2" strokeLinecap="round">{[-12,-6,0,6,12].map(y=><line key={y} x1="-6" y1={y-28} x2="6" y2={y-28}/>)}</g>
   <path d="M-6 -42 L-6 -14 M6 -42 L6 -14" stroke="#3a2210" strokeWidth="1.4"/>
   <ellipse cx="-20" cy="-24" rx="14" ry="8" fill="#fff" opacity=".12" transform="rotate(-30 -20 -24)"/>
  </svg>
  <figcaption><b>{arg?'Argentina’s ball':'Uruguay’s ball'}</b><span>{arg?'1st half':'2nd half'}</span></figcaption>
 </figure>;
}
function Trophy(){
 return <svg className={s.trophy} viewBox="0 0 120 170" role="img" aria-label="A drawing of the World Cup trophy: a winged figure holding a cup, on a base.">
  <defs><linearGradient id="wc30gold" x1="0" x2="1"><stop offset="0" stopColor="#9b7424"/><stop offset=".45" stopColor="#f3d27a"/><stop offset="1" stopColor="#a87d2a"/></linearGradient></defs>
  <rect x="30" y="140" width="60" height="22" rx="3" fill="#2b3550"/><rect x="38" y="128" width="44" height="14" rx="2" fill="url(#wc30gold)"/>
  <path d="M60 128 C46 120 48 96 52 80 C40 70 22 52 14 30 C30 40 44 50 54 60 L56 48 C50 46 46 40 48 34 L72 34 C74 40 70 46 64 48 L66 60 C76 50 90 40 106 30 C98 52 80 70 68 80 C72 96 74 120 60 128Z" fill="url(#wc30gold)"/>
  <path d="M44 34 Q60 10 76 34Z" fill="url(#wc30gold)"/><ellipse cx="60" cy="34" rx="16" ry="3" fill="#f7e2a3"/>
 </svg>;
}
