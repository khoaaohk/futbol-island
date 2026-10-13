'use client';
import {Fragment,useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type HTMLAttributes,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import type {Chart} from './voyage';
import {CASE_FACTS,DATES,FINAL,GOALS,GROUPS,PORTS,QUIZ,SEA_NOTES,SEMIS,SOURCES,TEAMS,score,type Group,type Tie} from './data';
import {flip,rubber,stepSpring} from './spring';
import Composition from './Composition';
import WallLabel from '../modern/WallLabel';
import Ending from '../modern/Ending';
import m from '../modern/modern.module.css';
import s from './Experience.module.css';

/**
 * worldcup-1930 · "Two weeks at sea" (Oct 5 2026; Oct 10 2026 modern gallery pass, docs/museum-modern-style.md: gallery-white
 * ground, Swiss type with wall labels, ONE accent (blue #2a5bd7), abstract geometry, precise spring motion). One long scroll in
 * beats the visitor drives:
 *  1. The composition: Genoa as a dot, Montevideo as a blue disc, one arc between them, 13 squares for 13 teams (Composition.tsx).
 *  2. The voyage: scrolling sails the ship (a blue disc) from Genoa to Montevideo across a map of land drawn as dots (Canvas 2D,
 *     lazily loaded), picking up Romania, France, Belgium and Brazil; a keepy-up on the rolling deck (a tilting line) mid-ocean.
 *  3. Arrival: the Estadio Centenario as rings, a pitch rectangle and the tower as one blue bar; the first kick-off.
 *  4. The bracket you build: pick each group winner; your team flies (spring FLIP) to where it really finished.
 *  5. The final with two balls: drag the ball along the match clock (spring follow, flick momentum, rubber-band at the
 *     half-time wall), then drag Uruguay's ball (the blue disc) onto the pitch at half-time; the balls trade places (spring FLIP).
 *  6. Ticket check (the quick check): four questions; every right answer punches a hole (a ring fills blue). Done: onComplete.
 *  7. The ending: the arc from the opening completes into a full circle; "You've seen…", the take-it line, sources.
 * Heat: no loop runs unless something moves. The chart draws on scroll and eases for a moment, then sleeps; the keepy-up, the
 * clock and the ball spring run only while the ball is in the air / you drag / it settles / Play runs; everything stops when
 * the tab is hidden and is torn down on unmount. Motion is transform, opacity and stroke-dashoffset only. Sound: the museum's
 * shared one-shots (they respect the island's mute).
 */
const CHAPTERS=[{id:'voyage',label:'Sail'},{id:'arrive',label:'Arrive'},{id:'bracket',label:'Bracket'},{id:'final',label:'Final'},{id:'quiz',label:'Ticket'},{id:'end',label:'Sources'}] as const;
type ChapterId=typeof CHAPTERS[number]['id'];
const DRILL_P=.505;// between "Training at sea" (.44) and "Crossing the Equator" (.58)
const reduced=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const play=(f:()=>void)=>{try{f();}catch{}};
export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const scroller=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),track=useRef<HTMLDivElement>(null);
 const hudRef=useRef<HTMLDivElement>(null),dayRef=useRef<HTMLSpanElement>(null),dateRef=useRef<HTMLSpanElement>(null),barRef=useRef<HTMLSpanElement>(null);
 const [chapter,setChapter]=useState<ChapterId>('voyage'),[sailing,setSailing]=useState(true),[chartFailed,setChartFailed]=useState(false);
 const chapterRef=useRef<ChapterId>('voyage'),sailingRef=useRef(true);
 // The ticket check is the real end: once it is punched, the shared Ending mounts with `reached` and calls onComplete once.
 const [ticketDone,setTicketDone]=useState(false);
 const ticketed=useCallback(()=>setTicketDone(true),[]);

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
   // The day/date band only shows once the poster has scrolled away (it would sit on the poster otherwise).
   const hudOn=inChart&&el.scrollTop>t.offsetTop-vh*.55;if(hudRef.current&&hudRef.current.dataset.on!==String(hudOn))hudRef.current.dataset.on=String(hudOn);
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

 return <section className={`${m.ground} ${s.root}`} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: two weeks at sea`} data-museum-experience="worldcup-1930" data-chapter-now={chapter}>
  <canvas ref={canvas} className={s.chart} aria-hidden="true" style={{visibility:sailing?'visible':'hidden'}}/>
  <ExperienceBack onClose={onClose}/>
  <header className={s.header}>
   <nav className={s.chapters} aria-label="Chapters">
    {CHAPTERS.map((c,i)=><button key={c.id} type="button" className={s.chapterBtn} aria-current={chapter===c.id?'step':undefined} onClick={()=>jump(c.id)}><i aria-hidden="true">{i+1}</i><span>{c.label}</span></button>)}
   </nav>
  </header>
  <div ref={hudRef} className={s.hud} data-on="false" aria-hidden={!sailing}>
   <span className={s.hudDay} ref={dayRef}>Day 1</span><span className={s.hudDate} ref={dateRef}>21 June 1930</span>
   <span className={s.hudBar}><span ref={barRef}/></span>
   <span className={s.hudEnds}><span>Genoa</span><span>Montevideo</span></span>
  </div>

  <div ref={scroller} className={s.scroller} tabIndex={0} aria-label="The 1930 World Cup story. Scroll to sail.">
   {/* ---- Act 1: the voyage ---- */}
   <div className={s.hero} data-chapter="voyage">
    <div className={s.posterWrap}><Composition/></div>
    <div className={s.heroText}>
     <WallLabel as="h1" title="Two weeks at sea" meta={`${exhibit.year} · Genoa → Montevideo · ${exhibit.title}`}
      caption={<>{CASE_FACTS.host} Uruguay is far from Europe, so the European teams had to sail there. Four of them shared one ship.</>}/>
     <p className={s.scrollHint} aria-hidden="true"><span>Scroll to set sail</span><b>↓</b></p>
     {chartFailed&&<p className={s.note}>The route map couldn’t load on this device, but the story still scrolls.</p>}
    </div>
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
    <WallLabel className={s.secLabel} id="wc30-arrive" title="A brand-new stadium" meta="July 1930 · Montevideo, Uruguay"/>
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

   {/* ---- Quick check: punch your ticket home ---- */}
   <TicketCheck onDone={ticketed}/>

   {/* ---- Outro ---- */}
   <section className={s.end} data-chapter="end" aria-labelledby="wc30-end">
    <h2 id="wc30-end" className={m.labelMeta}>The end of the voyage</h2>
    {ticketDone?<Ending art={<EndMark/>} reached onComplete={onComplete}
      seen="You’ve seen the first World Cup: two weeks at sea, 13 teams, and a final played with two balls."
      take={exhibit.forYourGame}/>
    :<>
     <EndMark/>
     <p className={s.seen}>You’ve seen the first World Cup: two weeks at sea, 13 teams, and a final played with two balls.</p>
     <p className={s.kicker}>Take it to your game</p>
     <p className={s.quote}>{exhibit.forYourGame}</p>
     <p className={s.endWait}>Punch all four holes in your ticket ↑ to finish your visit.</p>
    </>}
    <p className={s.endLine}>And if you’re losing at half-time, keep going. Uruguay were 2–1 down and won 4–2.</p>
    <ul className={s.recap}>{[CASE_FACTS.host,CASE_FACTS.final,CASE_FACTS.teams].map(f=><li key={f}>{f}</li>)}</ul>
    <details className={s.sources}><summary>Sources</summary><ul>{[...exhibit.sources,...SOURCES.filter(x=>!exhibit.sources.some(e=>e.url===x.url))].map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul>
     <p className={s.small}>Everything here is real history. The pictures are abstract compositions made for this museum, not real posters, maps or photos. The route map is simplified (land drawn as dots); the ship’s line joins the real ports but is not its logged course. Team colours are just colours, not 1930 flags.</p></details>
    <div className={s.endRow}>
     <button type="button" className={s.againBtn} data-museum-own-cue onClick={()=>jump('voyage')}><span aria-hidden="true">↑</span> Sail it again</button>
    </div>
   </section>
  </div>
 </section>;
}
function interp(p:number){if(p<=DATES[0].p)return DATES[0].day;for(let i=1;i<DATES.length;i++)if(p<=DATES[i].p){const a=DATES[i-1],b=DATES[i];return a.day+(b.day-a.day)*(p-a.p)/(b.p-a.p);}return DATES[DATES.length-1].day;}

// ---- Keepy-up on a rolling deck ------------------------------------------------------------------------------------------
/** "Deck drill" (Oct 10 2026 play pass): a scored round of three balls. Tap under the ball when it drops into the touch zone
 *  (the hairline band just above the deck): a central touch is Clean (+2), an off-centre one is Edge (+1) and sends the ball
 *  drifting, and a tap while the ball is still high is Too early (it breaks your streak). Five Clean touches in a row double
 *  the points. The longer you keep it up, the rougher the sea: the deck rolls further and pushes the ball sideways, so you have
 *  to touch it a little on the side it is rolling towards. Lose a ball when it lands or rolls off the deck; three balls make a
 *  round, then you get a rank and your best. Teaches: soft, central touches under the ball keep it straight; Romania's coach
 *  really drilled his players on deck. The loop only runs while the ball is in the air. Reduced motion: the same rules, one
 *  touch at a time (the ball waits in the air, the deck tilts a little more after each touch, you tap to correct the drift). */
const BALLS=3,GRAV=1100;
/** The ball's launch speed and the touch zone fit the stage height, so the ball never leaves the frame on a phone. */
const launch=(h:number)=>Math.sqrt(2*GRAV*Math.max(40,h-68)),zoneH=(h:number)=>Math.max(30,(h-68)*.5);
const RANKS:[number,string][]=[[0,'Deck hand'],[20,'Sailor'],[45,'First mate'],[80,'Captain’s pick']];
const rankOf=(n:number)=>RANKS.filter(r=>n>=r[0]).pop()![1];
type DrillView={phase:'ready'|'play'|'over';score:number;touches:number;ballTouches:number;combo:number;left:number;best:number;bestTouches:number;msg:string};
type DrillHit={k:number;x:number;y:number;label:string;q:'clean'|'edge'|'early'};
function DeckDrill(){
 const stage=useRef<HTMLButtonElement>(null),ball=useRef<HTMLSpanElement>(null),deck=useRef<HTMLSpanElement>(null),shadow=useRef<HTMLSpanElement>(null);
 const st=useRef({x:0,y:0,vx:0,vy:0,t:0,air:false,raf:0,last:0,phase:'ready' as DrillView['phase'],score:0,touches:0,ballTouches:0,combo:0,left:BALLS,best:0,bestTouches:0,hk:0});
 const first='Tap under the ball to start. You have three balls.';
 const [v,setV]=useState<DrillView>({phase:'ready',score:0,touches:0,ballTouches:0,combo:0,left:BALLS,best:0,bestTouches:0,msg:first});
 const [hit,setHit]=useState<DrillHit|null>(null);
 const still=useRef(false);useEffect(()=>{still.current=reduced();},[]);
 const sync=(msg?:string)=>{const b=st.current;setV(o=>({phase:b.phase,score:b.score,touches:b.touches,ballTouches:b.ballTouches,combo:b.combo,left:b.left,best:b.best,bestTouches:b.bestTouches,msg:msg??o.msg}));};
 /** The sea gets rougher the longer the round goes on: the deck rolls 3° at first, up to 10°. */
 const amp=()=>3+Math.min(7,st.current.touches*.3);
 const tilt=(t:number)=>still.current?Math.sin(st.current.touches*1.7+.6)*amp():Math.sin(t*1.1)*amp();
 const paint=()=>{const b=st.current;if(ball.current)ball.current.style.transform=`translate(${b.x}px,${-b.y}px)`;if(deck.current)deck.current.style.transform=`rotate(${tilt(b.t)}deg)`;
  if(shadow.current){const k=Math.max(.35,1-b.y/260);shadow.current.style.transform=`translateX(${b.x}px) scale(${k})`;shadow.current.style.opacity=String(.2+.4*k);}};
 /** A ball is lost (it landed on the deck or rolled off it). The third one ends the round. */
 const lose=()=>{const b=st.current;b.combo=0;b.left--;b.x=0;b.y=0;paint();play(museumSfx.look);const n=b.ballTouches;b.ballTouches=0;
  if(b.left<=0){b.phase='over';const record=b.score>b.best;b.best=Math.max(b.best,b.score);b.bestTouches=Math.max(b.bestTouches,b.touches);play(museumSfx.whistle);
   sync(record&&b.score>0?`New best! ${b.score} points. You are a ${rankOf(b.score)}.`:`Round over: ${b.score} points. You are a ${rankOf(b.score)}.`);return;}
  sync(`${n?`Dropped after ${n}.`:'Dropped.'} ${b.left} ${b.left===1?'ball':'balls'} left: tap to go again.`);};
 const step=useCallback((now:number)=>{const b=st.current;b.raf=0;if(document.hidden){b.last=0;return;}const dt=Math.min(.04,b.last?(now-b.last)/1000:.016);b.last=now;b.t+=dt;
  const w=(stage.current?.clientWidth??260)/2-18;b.vy-=GRAV*dt;b.vx+=tilt(b.t)*14*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y<=0||Math.abs(b.x)>w){b.air=false;b.y=0;b.x=Math.max(-w,Math.min(w,b.x));b.vx=b.vy=0;b.last=0;paint();setHit(null);lose();return;}
  paint();b.raf=requestAnimationFrame(step);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const begin=()=>{const b=st.current;Object.assign(b,{phase:'play',score:0,touches:0,ballTouches:0,combo:0,left:BALLS,x:0,y:0,vx:0,vy:0});};
 const touch=(clientX:number|null,push=0)=>{const b=st.current;
  if(b.phase!=='play'){if(b.air)return;begin();}
  const w=(stage.current?.clientWidth??260)/2-18;
  // Timing: the ball only answers a touch once it has dropped into the touch zone.
  const H=stage.current?.clientHeight??150;
  if(b.air&&b.y>zoneH(H)){b.combo=0;setHit({k:++b.hk,x:b.x,y:b.y,label:'Too early',q:'early'});play(museumSfx.tick);sync('Wait for it to drop into the zone.');return;}
  const r=stage.current?.getBoundingClientRect();let off=0;if(clientX!==null&&r)off=(clientX-(r.left+r.width/2+b.x))/30;// tap left of the ball → it goes right
  if(clientX===null)off=push;
  off=Math.max(-1.2,Math.min(1.2,off));const q:'clean'|'edge'=Math.abs(off)<.5?'clean':'edge';
  b.combo=q==='clean'?b.combo+1:0;const mult=b.combo>=5?2:1,pts=(q==='clean'?2:1)*mult;b.score+=pts;b.touches++;b.ballTouches++;
  setHit({k:++b.hk,x:b.x,y:b.y,label:`${q==='clean'?'Clean':'Edge'} +${pts}`,q});play(museumSfx.kick);
  let msg='';if(b.combo===5){msg='Five clean in a row: double points!';play(museumSfx.crowd);}else if(b.touches===10)msg='The sea is getting rougher. Watch the deck.';
  else if(b.touches===20){msg='Twenty! Romania’s coach wants you.';play(museumSfx.crowd);}else if(q==='edge')msg='Off-centre: the ball drifts. Touch it right underneath.';
  if(still.current){// One touch at a time: where you touch it, plus the deck's roll, decides where it goes next.
   b.t+=1;b.x+=-off*34+tilt(b.t)*2.6;b.y=zoneH(H)*.6;if(Math.abs(b.x)>w){b.x=Math.max(-w,Math.min(w,b.x));lose();return;}paint();sync(msg||`${b.ballTouches} on this ball. The deck tilts: tap on the side it rolls to.`);return;}
  b.vy=launch(H);b.vx=-off*120+b.vx*.3;sync(msg||'');
  if(!b.air){b.air=true;b.last=0;}if(!b.raf)b.raf=requestAnimationFrame(step);};
 const again=()=>{const b=st.current;if(b.air)return;begin();b.phase='ready';b.y=0;paint();setHit(null);sync(first);stage.current?.focus({preventScroll:true});};
 useEffect(()=>{const onVis=()=>{const b=st.current;if(!document.hidden&&b.air&&!b.raf)b.raf=requestAnimationFrame(step);};document.addEventListener('visibilitychange',onVis);
  const b=st.current;return()=>{cancelAnimationFrame(b.raf);b.raf=0;document.removeEventListener('visibilitychange',onVis);};},[step]);
 const over=v.phase==='over';
 return <div className={s.drill} data-drill={v.phase}>
  <h2 className={s.cardTitle}>Deck drill</h2>
  <div className={s.drillHud} aria-hidden="true">
   <span className={s.drillPips}>{Array.from({length:BALLS},(_,i)=><i key={i} data-on={i<v.left||undefined}/>)}</span>
   <span className={s.drillCombo} data-hot={v.combo>=5||undefined}>{v.combo>=5?'×2 streak':v.combo>1?`${v.combo} clean in a row`:' '}</span>
  </div>
  <button ref={stage} type="button" className={s.stage} data-museum-own-cue aria-label={`Keepy-up on the ship’s deck. Tap under the ball when it drops low. Space touches it in the middle; the left and right arrows nudge it that way. ${v.score} points, ${v.left} balls left.`}
   onPointerDown={e=>{e.preventDefault();touch(e.clientX);}} onKeyDown={e=>{const k:Record<string,number>={' ':0,Enter:0,ArrowLeft:.8,ArrowRight:-.8};if(e.key in k){e.preventDefault();touch(null,k[e.key]);}}}>
   <span className={s.swell} aria-hidden="true"/>
   <span className={s.touchZone} aria-hidden="true"/>
   <span ref={deck} className={s.deck} aria-hidden="true"><i/></span>
   <span ref={shadow} className={s.drillShadow} aria-hidden="true"/>
   <span ref={ball} className={s.drillBall} aria-hidden="true"/>
   {hit&&<span key={hit.k} className={s.drillHit} data-q={hit.q} style={{'--hx':`${hit.x}px`,'--hy':`${-hit.y}px`} as CSSProperties} aria-hidden="true">{hit.label}</span>}
   <span key={v.score} className={s.drillCount} data-pop={v.score>0||undefined} aria-hidden="true">{v.score}</span>
  </button>
  <p className={s.drillMsg} aria-live="polite" data-cheer={/double|Twenty|best/i.test(v.msg)||undefined}>{v.msg||`${v.ballTouches} touches on this ball`}{v.best?<span className={s.best}>Best {v.best}</span>:null}</p>
  {over&&<div className={s.drillOver} role="status">
   <p><b>{v.score}</b> points · {v.touches} touches · <em>{rankOf(v.score)}</em></p>
   <button type="button" className={s.againBtn} data-museum-own-cue onClick={again}><span aria-hidden="true">↺</span> Play again</button>
  </div>}
  {!over&&<p className={s.small}>Touch it right under the middle. When the deck tilts, the ball rolls downhill: tap a little on that side.</p>}
 </div>;
}

// ---- The stadium (SVG) ---------------------------------------------------------------------------------------------------
/** The Estadio Centenario, abstracted: the bowl as dotted rings (the stands), the pitch as a rectangle, the Torre de los
 *  Homenajes as ONE blue bar. Static; drawn once. */
function Stadium(){
 return <svg className={s.stadium} viewBox="0 0 640 300" role="img" aria-label="An abstract plan of the Estadio Centenario: dotted rings for the stands around a rectangular pitch, and the tower as one tall blue bar.">
  <g fill="none" strokeLinecap="round">{[0,1,2,3,4,5].map(i=><ellipse key={i} cx="300" cy="176" rx={268-i*20} ry={112-i*9} stroke="var(--ink)" strokeWidth={i===0?1.5:1.6} strokeDasharray={i===0?undefined:'0 7'} opacity={i===0?1:.55}/>)}</g>
  <rect x="190" y="128" width="220" height="96" fill="none" stroke="var(--ink)" strokeWidth="1.5"/>
  <line x1="300" y1="128" x2="300" y2="224" stroke="var(--ink)" strokeWidth="1"/>
  <circle cx="300" cy="176" r="16" fill="none" stroke="var(--ink)" strokeWidth="1"/>
  <rect x="190" y="156" width="22" height="40" fill="none" stroke="var(--ink)" strokeWidth="1"/><rect x="388" y="156" width="22" height="40" fill="none" stroke="var(--ink)" strokeWidth="1"/>
  <rect className={s.tower} x="536" y="22" width="16" height="150" fill="var(--accent)"/>
  <line x1="544" y1="22" x2="544" y2="6" stroke="var(--accent)" strokeWidth="2"/>
  <text x="530" y="194" textAnchor="end" className={s.svgSmall}>Torre de los Homenajes</text>
  <text x="0" y="22" className={s.svgTitle}>Estadio Centenario</text>
  <text x="0" y="42" className={s.svgSmall}>Montevideo · opened 18 July 1930</text>
 </svg>;
}

// ---- The bracket you build -----------------------------------------------------------------------------------------------
function Chip({id,on,dim}:{id:string;on?:boolean;dim?:boolean}){const t=TEAMS[id];return <span className={s.chip} data-chip data-on={on||undefined} data-dim={dim||undefined}>
 <i style={{background:t.color}} aria-hidden="true"/>{t.name}{t.ship&&<ShipIcon/>}</span>;}
function ShipIcon(){return <svg className={s.shipIcon} viewBox="0 0 24 14" aria-label="came on the ship" role="img"><line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 3" strokeLinecap="round"/><circle cx="19" cy="7" r="4.5" fill="var(--accent)"/></svg>;}

function Bracket(){
 const [pick,setPick]=useState<Record<string,string>>({});
 // A group pick morphs: the team you tapped flies (FLIP, spring-sampled) from its button to its real place in the table, so
 // you SEE whether your team finished top or further down. Reduced motion: the table simply appears.
 const from=useRef<{id:string;team:string;rect:DOMRect}|null>(null);
 const choose=(id:string,team:string)=>{if(pick[id])return;play(museumSfx.stamp);
  const btn=document.querySelector<HTMLElement>(`[data-group="${id}"] [data-team="${team}"] [data-chip]`);
  from.current=btn&&!reduced()?{id,team,rect:btn.getBoundingClientRect()}:null;
  setPick(p=>({...p,[id]:team}));};
 useLayoutEffect(()=>{const f=from.current;if(!f)return;from.current=null;
  const el=document.querySelector<HTMLElement>(`[data-group="${f.id}"] [data-row="${f.team}"] [data-chip]`);if(el)flip(el,f.rect,{k:210,c:20});},[pick]);
 const groupsDone=GROUPS.every(g=>pick[g.id]),semisDone=groupsDone&&SEMIS.every(t=>pick[t.id]),finalDone=semisDone&&!!pick.f;
 const right=[...GROUPS.map(g=>pick[g.id]===g.winner),...SEMIS.map(t=>pick[t.id]===t.winner)].filter(Boolean).length;
 return <section className={s.bracket} data-chapter="bracket" aria-labelledby="wc30-bracket">
  <WallLabel className={s.secLabel} id="wc30-bracket" title="Build the bracket" meta="13–30 July 1930 · Montevideo"/>
  <p className={s.lede}>{CASE_FACTS.teams} Nobody had to qualify: they were invited. Seven came from South America, four from Europe and two from North America.</p>
  <div className={s.howTo}>
   <p><b>Groups.</b> Every team plays every other team in its group once. Only the top team goes through.</p>
   <p><b>Knockouts.</b> Win and you go on. Lose once and you are out.</p>
  </div>
  <p className={s.instr}>Tap the team you think won each group. Watch where your team really finished.</p>
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
   <ol className={s.table}>{[g.winner,...g.teams.filter(t=>t!==g.winner)].map((t,i)=><li key={t} data-row={t} data-mine={t===pick||undefined} style={{'--i':i} as CSSProperties}><Chip id={t} on={i===0} dim={i>0}/>{i===0&&<em>through</em>}</li>)}</ol>
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

// ---- Ticket check: the quick learning check --------------------------------------------------------------------------------
/** Four questions on what the story taught, in the shared quick-check pattern (outlined pills; the right one fills blue; one
 *  line of why). A right answer punches the next hole in the ticket stub (a ring fills blue with a CSS spring, no loop); a wrong
 *  one is struck through and you try again. All four punched: the stub is complete, a quiet "Visited" mark, and onDone (the
 *  passport's gold stamp). */
function TicketCheck({onDone}:{onDone?:()=>void}){
 const [i,setI]=useState(0),[picked,setPicked]=useState<number|null>(null),[wrong,setWrong]=useState<number[]>([]),[first,setFirst]=useState(0);
 const done=i>=QUIZ.length,q=QUIZ[Math.min(i,QUIZ.length-1)],ok=picked!==null,punched=i+(ok?1:0);
 const answer=(k:number)=>{if(ok||done)return;if(k===q.right){setPicked(k);if(!wrong.length)setFirst(n=>n+1);play(museumSfx.stamp);}else{setWrong(w=>[...w,k]);play(museumSfx.look);}};
 const next=()=>{setPicked(null);setWrong([]);setI(n=>n+1);if(i+1>=QUIZ.length)play(museumSfx.crowd);else play(museumSfx.click);};
 const again=()=>{setI(0);setPicked(null);setWrong([]);setFirst(0);};
 const completed=useRef(false);
 useEffect(()=>{if(done&&!completed.current){completed.current=true;onDone?.();}},[done,onDone]);
 return <section className={s.quiz} data-chapter="quiz" aria-labelledby="wc30-quiz">
  <WallLabel className={s.secLabel} id="wc30-quiz" title="Ticket check" meta="Quick check · four questions before you sail home"/>
  <div className={s.ticket} data-done={done||undefined}>
   <div className={s.ticketStub} aria-hidden="true"><b>1930</b><span>Montevideo → Home</span>
    <ol className={s.holes}>{QUIZ.map((_,k)=><li key={k} data-on={k<punched||undefined}/>)}</ol></div>
   {!done?<div key={i} className={`${m.check} ${s.ticketBody}`}>
    <p className={s.ticketNo}>Question {i+1} of {QUIZ.length}</p>
    <p className={m.checkQ}>{q.q}</p>
    <div className={m.pills} role="group" aria-label="Answers">{q.choices.map((c,k)=><button key={c} type="button" className={m.pill} data-museum-own-cue
     data-a={ok&&k===q.right?'right':wrong.includes(k)?'wrong':undefined} disabled={ok||wrong.includes(k)} onClick={()=>answer(k)}>{c}</button>)}</div>
    <p className={m.why} aria-live="polite">{ok?<><b>Punched.</b> {q.why}</>:wrong.length?<><b>Not that one.</b> Try another.</>:'Every right answer punches a hole in your ticket.'}</p>
    {ok&&<button type="button" className={s.againBtn} data-museum-own-cue onClick={next}>{i+1<QUIZ.length?'Next question':'Complete the ticket'} <span aria-hidden="true">→</span></button>}
   </div>
   :<div className={`${m.check} ${s.ticketBody}`} role="status">
    <span className={m.visited}><i aria-hidden="true"/>Visited · Montevideo 1930</span>
    <p className={m.checkQ}>{first===QUIZ.length?'All four, first time. Bon voyage.':`${first} of ${QUIZ.length} first time. Bon voyage.`}</p>
    <p className={m.why}>You sailed with the teams, built the bracket and played the final with two balls.</p>
    <button type="button" className={s.againBtn} data-museum-own-cue onClick={again}><span aria-hidden="true">↺</span> Check again</button>
   </div>}
  </div>
 </section>;
}

/** The ending's accent shape: the opening composition's arc, completed into a full blue circle (stroke-dashoffset, drawn once
 *  when the ending scrolls into view; an IntersectionObserver, not a loop). Reduced motion: drawn complete. */
function EndMark(){
 const ref=useRef<SVGSVGElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;if(typeof IntersectionObserver==='undefined'||reduced()){el.dataset.seen='true';return;}
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){el.dataset.seen='true';io.disconnect();}},{threshold:.5});io.observe(el);return()=>io.disconnect();},[]);
 return <svg ref={ref} className={s.endMark} viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="44" fill="none" stroke="var(--hair)" strokeWidth="1"/>
  <circle className={s.endRing} cx="60" cy="60" r="44" fill="none" stroke="var(--accent)" strokeWidth="6" pathLength={1} strokeDasharray="1 1" transform="rotate(-90 60 60)"/>
  <circle className={s.endDot} cx="60" cy="60" r="10" fill="var(--accent)"/>
 </svg>;
}

// ---- The final: two balls, one clock -------------------------------------------------------------------------------------
/** The match clock is a drag-scrubbed track: the ball-thumb follows your finger on a stiff spring, a flick keeps the clock
 *  rolling (momentum with friction), and it rubber-bands at 0′, at 90′, and at the half-time wall until you swap the ball.
 *  At half-time you DRAG Uruguay's ball onto the centre spot (or press Swap): the two balls trade places with a spring FLIP.
 *  One rAF loop, only while you drag, while it coasts or settles, or while Play runs; it stops when hidden or unmounted. */
type Eng={x:number;v:number;drag:boolean;to:number|null;target:number;play:boolean;raf:number;last:number;shown:number;samples:{t:number;m:number}[]};
function FinalMatch(){
 const [min,setMin]=useState(0),[swapped,setSwapped]=useState(false),[playing,setPlaying]=useState(false),[bump,setBump]=useState(0),[touched,setTouched]=useState(false);
 const [nudge,setNudge]=useState(''),[hot,setHot]=useState(false);
 const swapRef=useRef(false),trackRef=useRef<HTMLDivElement>(null),thumbRef=useRef<HTMLSpanElement>(null),fillRef=useRef<HTMLSpanElement>(null);
 const eng=useRef<Eng>({x:0,v:0,drag:false,to:null,target:0,play:false,raf:0,last:0,shown:0,samples:[]});
 const sc=score(min),half=min>=45&&!swapped,ft=min>=90;
 const cap=()=>swapRef.current?90:45;
 const paint=useCallback(()=>{const e=eng.current,w=trackRef.current?.clientWidth??0;
  if(thumbRef.current)thumbRef.current.style.transform=`translateX(${(e.x/90*w).toFixed(1)}px) rotate(${(e.x*14).toFixed(0)}deg)`;
  if(fillRef.current)fillRef.current.style.transform=`scaleX(${Math.max(0,Math.min(1,e.x/90)).toFixed(4)})`;},[]);
 const hitWall=useCallback(()=>{setBump(b=>b+1);setNudge('Half-time! Swap the ball to play the second half.');},[]);
 /** The clock's minute (clamped to what's allowed) drives the score; sounds play as you pass a goal or a whistle, going forward. */
 const commit=useCallback((x:number)=>{const e=eng.current,m=Math.max(0,Math.min(cap(),x)),prev=e.shown;if(Math.floor(m)===Math.floor(prev)&&!(m>=90&&prev<90))return;
  if(m>prev){if(GOALS.some(g=>g.min>prev&&g.min<=m))play(museumSfx.crowd);if((prev<45&&m>=45)||(prev<90&&m>=90))play(museumSfx.whistle);}
  e.shown=m;setMin(m);},[]);
 const frame=useCallback((now:number)=>{const e=eng.current;e.raf=0;
  if(document.hidden){e.last=0;if(e.play){e.play=false;setPlaying(false);}return;}
  const dt=Math.min(.05,e.last?(now-e.last)/1000:1/60);e.last=now;const c=cap(),still=reduced();let settled=false;
  if(e.drag){if(still){e.x=e.target;e.v=0;}else stepSpring(e,e.target,dt,900,55,.001);}
  else if(e.play){e.x+=dt*(still?12:6);e.v=0;if(e.x>=c){e.x=c;e.play=false;setPlaying(false);if(c===45)hitWall();}}
  else{
   // Past a limit (a flick into the half-time wall, or a rubber-banded drag): spring back to it, carrying the velocity.
   if(e.to===null&&(e.x>c||e.x<0)){if(e.x>c&&c===45&&e.v>3)hitWall();e.to=Math.max(0,Math.min(c,e.x));}
   if(e.to!==null){settled=still?(e.x=e.to,true):stepSpring(e,e.to,dt,e.v?260:300,e.v?24:30,.01);if(settled)e.to=null;}
   else{e.v*=Math.exp(-3*dt);e.x+=e.v*dt;if(Math.abs(e.v)<.5&&e.x>=0&&e.x<=c){e.v=0;settled=true;}}}
  paint();commit(e.x);
  if(e.drag||e.play||!settled)e.raf=requestAnimationFrame(frame);else e.last=0;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const kick=useCallback(()=>{const e=eng.current;if(!e.raf&&!document.hidden)e.raf=requestAnimationFrame(frame);},[frame]);
 const stop=useCallback(()=>{const e=eng.current;e.play=false;setPlaying(false);},[]);
 const toMin=(clientX:number)=>{const r=trackRef.current?.getBoundingClientRect();return r&&r.width?(clientX-r.left)/r.width*90:0;};
 const down=(ev:ReactPointerEvent<HTMLDivElement>)=>{if(!ev.isPrimary||ev.button>0)return;const e=eng.current;ev.currentTarget.setPointerCapture?.(ev.pointerId);
  setTouched(true);setNudge('');stop();e.drag=true;e.to=null;e.target=rubber(toMin(ev.clientX),0,cap(),5);e.samples=[{t:ev.timeStamp,m:e.target}];thumbRef.current?.focus({preventScroll:true});kick();};
 const move=(ev:ReactPointerEvent<HTMLDivElement>)=>{const e=eng.current;if(!e.drag)return;const raw=toMin(ev.clientX);e.target=rubber(raw,0,cap(),5);
  if(raw>cap()&&cap()===45&&e.shown>=44.5&&!nudge)hitWall();
  e.samples.push({t:ev.timeStamp,m:raw});while(e.samples.length>2&&ev.timeStamp-e.samples[0].t>90)e.samples.shift();};
 const up=(ev:ReactPointerEvent<HTMLDivElement>)=>{const e=eng.current;if(!e.drag)return;e.drag=false;const a=e.samples[0],b=e.samples[e.samples.length-1],dt=(ev.timeStamp-a.t)/1000;
  // Release velocity (minutes per second) from the last ~90 ms of the drag: a flick keeps the clock rolling.
  e.v=!reduced()&&b&&dt>.008?Math.max(-90,Math.min(90,(b.m-a.m)/dt)):0;if(Math.abs(e.v)<4)e.v=0;kick();};
 const key=(ev:ReactKeyboardEvent<HTMLSpanElement>)=>{const e=eng.current,c=cap();const base=e.to??e.x;
  const step:Record<string,number>={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:10,PageDown:-10};
  let next:number|null=null;if(ev.key in step)next=base+step[ev.key];else if(ev.key==='Home')next=0;else if(ev.key==='End')next=c;if(next===null)return;
  ev.preventDefault();setTouched(true);stop();if(next>c&&c===45)hitWall();e.to=Math.max(0,Math.min(c,Math.round(next)));e.v=0;kick();};
 const start=()=>{const e=eng.current;setTouched(true);if(e.play)return stop();
  if(e.shown>=90){resetBalls();e.x=0;e.to=null;e.shown=0;setMin(0);paint();}
  if(e.shown<=0)play(museumSfx.whistle);if(!swapRef.current&&e.shown>=45){hitWall();return;}
  e.to=null;e.v=0;e.play=true;setPlaying(true);kick();};
 useEffect(()=>{const e=eng.current;const v=()=>{if(document.hidden&&e.raf){cancelAnimationFrame(e.raf);e.raf=0;e.last=0;if(e.play){e.play=false;setPlaying(false);}if(e.drag)e.drag=false;}};
  const rs=()=>paint();document.addEventListener('visibilitychange',v);window.addEventListener('resize',rs);
  return()=>{cancelAnimationFrame(e.raf);e.raf=0;document.removeEventListener('visibilitychange',v);window.removeEventListener('resize',rs);};},[paint]);

 // ---- The ball swap: drag Uruguay's ball onto the centre spot (a FLIP trades the two balls' places). ----
 const ballsRef=useRef<HTMLDivElement>(null),spotRef=useRef<HTMLSpanElement>(null),flipFrom=useRef<Record<string,DOMRect>|null>(null);
 const measure=()=>{const out:Record<string,DOMRect>={};ballsRef.current?.querySelectorAll<HTMLElement>('[data-ball]').forEach(el=>{out[el.dataset.ball!]=el.getBoundingClientRect();});return out;};
 const setSwap=(v:boolean)=>{if(swapRef.current===v)return;flipFrom.current=reduced()?null:measure();swapRef.current=v;setSwapped(v);};
 const resetBalls=()=>setSwap(false);
 const swap=()=>{if(swapRef.current)return;setSwap(true);setNudge('');setHot(false);play(museumSfx.spin);
  // The clock can run again: give it a little push off the wall so you see the second half begin.
  const e=eng.current;if(!e.drag&&!e.play&&e.shown>=45){e.to=Math.min(90,Math.max(e.x,45)+1);kick();}};
 useLayoutEffect(()=>{const f=flipFrom.current;if(!f)return;flipFrom.current=null;
  ballsRef.current?.querySelectorAll<HTMLElement>('[data-ball]').forEach(el=>{el.style.transform='';const r=f[el.dataset.ball!];if(r)flip(el,r,{k:230,c:21,scale:true});});},[swapped]);
 const bd=useRef({on:false,x0:0,y0:0,dx:0,dy:0,vx:0,vy:0,t:0,raf:0,last:0});
 const ballDown=(ev:ReactPointerEvent<HTMLElement>)=>{if(swapRef.current||!ev.isPrimary)return;const b=bd.current;ev.currentTarget.setPointerCapture?.(ev.pointerId);cancelAnimationFrame(b.raf);b.raf=0;
  Object.assign(b,{on:true,x0:ev.clientX-b.dx,y0:ev.clientY-b.dy,vx:0,vy:0,t:ev.timeStamp});setTouched(true);};
 const ballMove=(ev:ReactPointerEvent<HTMLElement>)=>{const b=bd.current;if(!b.on)return;const allowed=eng.current.shown>=45;
  // Before half-time the ball is heavy (rubber-banded to a few px): it's Argentina's half.
  let dx=ev.clientX-b.x0,dy=ev.clientY-b.y0;if(!allowed){dx=rubber(dx,0,0,14);dy=rubber(dy,0,0,14);}
  const dt=Math.max(.001,(ev.timeStamp-b.t)/1000);b.vx=(dx-b.dx)/dt;b.vy=(dy-b.dy)/dt;b.t=ev.timeStamp;b.dx=dx;b.dy=dy;
  ev.currentTarget.style.transform=`translate(${dx}px,${dy}px) rotate(${dx*.6}deg)`;
  const sp=spotRef.current?.getBoundingClientRect();if(sp&&allowed){const h=Math.hypot(ev.clientX-(sp.left+sp.width/2),ev.clientY-(sp.top+sp.height/2))<sp.width*.75;if(h!==hot)setHot(h);}};
 const ballUp=(ev:ReactPointerEvent<HTMLElement>)=>{const b=bd.current;if(!b.on)return;b.on=false;const el=ev.currentTarget;const allowed=eng.current.shown>=45;
  const sp=spotRef.current?.getBoundingClientRect();const over=!!sp&&Math.hypot(ev.clientX-(sp.left+sp.width/2),ev.clientY-(sp.top+sp.height/2))<sp.width*.75;
  if(!allowed&&Math.hypot(b.dx,b.dy)>4)setNudge('Not yet! Argentina’s ball is used in the first half.');
  if(allowed&&over){b.dx=b.dy=0;swap();return;}
  setHot(false);
  // Miss: spring home from where you let go, carrying the throw's velocity.
  if(reduced()){b.dx=b.dy=0;el.style.transform='';return;}
  const sx={x:b.dx,v:Math.max(-3000,Math.min(3000,b.vx))},sy={x:b.dy,v:Math.max(-3000,Math.min(3000,b.vy))};b.last=0;
  const tick=(now:number)=>{b.raf=0;if(document.hidden){sx.x=sy.x=0;}const dt=Math.min(.05,b.last?(now-b.last)/1000:1/60);b.last=now;
   const a=stepSpring(sx,0,dt,260,20,.3),c=stepSpring(sy,0,dt,260,20,.3);b.dx=sx.x;b.dy=sy.x;el.style.transform=a&&c?'':`translate(${sx.x}px,${sy.x}px) rotate(${sx.x*.6}deg)`;
   if(!(a&&c)&&!document.hidden)b.raf=requestAnimationFrame(tick);else{b.dx=b.dy=0;el.style.transform='';}};
  b.raf=requestAnimationFrame(tick);};
 useEffect(()=>{const b=bd.current;return()=>{cancelAnimationFrame(b.raf);b.raf=0;};},[]);

 const shown=GOALS.filter(g=>g.min<=min);
 const status=ft?'Full time':half?'Half-time':`${Math.floor(min)}′`;
 const ballProps=(kind:'arg'|'uru')=>{const drag=kind==='uru'&&!swapped;return drag?{onPointerDown:ballDown,onPointerMove:ballMove,onPointerUp:ballUp,onPointerCancel:ballUp,'data-drag':half?'ready':'wait'}:{};};
 return <section className={s.final} data-chapter="final" aria-labelledby="wc30-final" data-half={min<45?1:2} data-swapped={swapped}>
  <WallLabel className={s.secLabel} id="wc30-final" title="The final with two balls" meta="30 July 1930 · Estadio Centenario · 68,346 fans"/>
  <p className={s.lede}>Uruguay and Argentina could not agree whose ball to use. So they used one each: Argentina’s ball in the first half, Uruguay’s in the second. Drag the ball along the clock to play the match.</p>
  <div className={s.board} role="status" aria-live="polite" aria-label={`${status}. Uruguay ${sc.uru}, Argentina ${sc.arg}.`}>
   <span className={`${s.team} ${s.teamA}`}><i aria-hidden="true" style={{background:TEAMS.uru.color}}/>Uruguay</span>
   <span key={`u${sc.uru}`} className={`${s.num} ${s.numA}`} data-pop={sc.uru>0||undefined}>{sc.uru}</span><span className={s.dash}>–</span>
   <span key={`a${sc.arg}`} className={`${s.num} ${s.numB}`} data-pop={sc.arg>0||undefined}>{sc.arg}</span>
   <span className={`${s.team} ${s.teamB}`}>Argentina<i aria-hidden="true" style={{background:TEAMS.arg.color}}/></span>
   <span className={s.minute}>{status}</span>
  </div>
  <div ref={ballsRef} className={s.balls} data-hot={hot||undefined}>
   <span ref={spotRef} className={s.spot} aria-hidden="true"><i>Match ball</i></span>
   <Ball kind="arg" slot={swapped?'benchL':'spot'}/>
   <Ball kind="uru" slot={swapped?'spot':'benchR'} {...ballProps('uru')}/>
  </div>
  <p className={s.ballMsg} aria-live="polite">{nudge||(half?'Half-time. Argentina lead 2–1. Drag Uruguay’s ball onto the pitch.':swapped?(ft?'Uruguay won with their own ball in the second half.':'Second half: Uruguay’s ball is in play.'):'First half: Argentina’s ball is in play.')}</p>
  {half&&<div className={s.swapBox}><p>Can’t drag? Use the button.</p>
   <button type="button" className={s.swapBtn} data-museum-own-cue data-swap onClick={swap}>Swap the ball</button></div>}
  <div className={s.clock}>
   <button type="button" className={s.playBtn} data-museum-own-cue onClick={start} aria-label={playing?'Pause the clock':'Play the match clock'} disabled={half}>{playing?'Pause':ft?'Replay':min>0?'Play on':'Kick off'}</button>
   <div className={s.rangeWrap}>
    <div ref={trackRef} className={s.scrub} data-wall={!swapped||undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
     <span className={s.scrubRail} aria-hidden="true"><span ref={fillRef}/></span>
     <span key={bump} className={s.halfMark} data-bump={bump>0||undefined} aria-hidden="true"/>
     {GOALS.map(g=><span key={g.min} className={s.goalMark} data-team={g.team} data-on={g.min<=min||undefined} style={{left:`${g.min/90*100}%`}} aria-hidden="true"/>)}
     <span ref={thumbRef} className={s.thumb} role="slider" tabIndex={0} aria-label="Match clock" aria-valuemin={0} aria-valuemax={90} aria-valuenow={Math.floor(min)} aria-valuetext={`${status}, Uruguay ${sc.uru}, Argentina ${sc.arg}`} onKeyDown={key}/>
     {!touched&&<span className={s.tryIt} aria-hidden="true">Drag me →</span>}
    </div>
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
     <li>Today, Law 2 of the Laws of the Game sets one size and weight for every match ball: 68–70 cm around and 410–450 g. No more arguing!</li>
    </ul></div>
  </div>}
 </section>;
}
/** The two 1930 balls, abstracted: Argentina's as an ink ring with its panel seams as two pairs of arcs; Uruguay's T-Model as
 *  the exhibit's blue disc with a white T. Static SVG; only their slots change (spring FLIP). */
function Ball({kind,slot,...rest}:{kind:'arg'|'uru';slot:'spot'|'benchL'|'benchR'}&HTMLAttributes<HTMLElement>&{'data-drag'?:string}){
 const arg=kind==='arg';
 return <figure className={s.ball} data-ball={kind} data-slot={slot} data-active={slot==='spot'||undefined} {...rest}>
  <svg viewBox="-60 -60 120 120" role="img" aria-label={arg?'Argentina’s ball, used in the first half':'Uruguay’s T-Model ball, used in the second half'}>
   {arg?<><circle r="50" fill="var(--ground)" stroke="var(--ink)" strokeWidth="3"/>
    <g fill="none" stroke="var(--ink)" strokeWidth="1.5"><path d="M-50 -14 Q0 -26 50 -14 M-50 14 Q0 26 50 14"/><path d="M-16 -48 Q-24 0 -16 48 M16 -48 Q24 0 16 48"/></g></>
   :<><circle r="50" fill="var(--accent)"/>
    <g fill="none" stroke="var(--ground)" strokeWidth="3" strokeLinecap="round"><path d="M-30 -18 H30 M0 -18 V34"/></g></>}
  </svg>
  <figcaption><b>{arg?'Argentina’s ball':'Uruguay’s ball'}</b><span>{arg?'1st half':'2nd half'}</span></figcaption>
 </figure>;
}
function Trophy(){
 return <svg className={s.trophy} viewBox="0 0 120 170" role="img" aria-label="An abstract trophy: a blue disc held up on a thin line above a stepped base.">
  <circle cx="60" cy="50" r="30" fill="var(--accent)"/>
  <line x1="60" y1="80" x2="60" y2="128" stroke="var(--ink)" strokeWidth="2"/>
  <rect x="38" y="128" width="44" height="12" fill="var(--ink)"/><rect x="28" y="142" width="64" height="16" fill="var(--ink)"/>
 </svg>;
}
