'use client';
import {Fragment,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as RPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import {THREADS,MILESTONES,FIRST_YEAR,TODAY,LAW_SOURCES,versionIndexAt,milestoneAt,yearLabel,eraOf,diffWords,type LawThread} from './laws';
import {SORT_SOURCES} from './sort';
import Sorter from './Sorter';
import LineMorph from './LineMorph';
import Prologue from './Prologue';
import QuickCheck from './QuickCheck';
import {FIG_VB,THREAD_LINE,THREAD_VB,ruleDrawing} from './drawings';
import s from './Experience.module.css';

/**
 * laws-1863 · "The Living Rulebook" (Oct 5 2026), retold on Oct 9 2026 as THIN LINE ART IN MOTION. One hairline ink on a clean
 * light ground, one accent for what changed, lots of white space, and motion that tells the story:
 *  - the masthead is the museum's own Hairline rulebook figure (the timeline's port of the Hairline engine, used read-only);
 *  - one continuous line runs between the beats and loops round a ball (it draws itself on as it comes into view);
 *  - beat 1, "Still a rule?" (Sorter.tsx): line-drawn cards, each telling its 1863 Law as a tiny line story, sorted by drag/flick;
 *  - beat 2, the living rulebook: drag the year and every rule rewrites itself word by word while its line drawing MORPHS between
 *    eras (LineMorph: the tape sags then straightens into a crossbar, scattered players walk into an eleven, a referee arrives,
 *    lifts a card, gets a screen), new strokes drawing themselves on and retired ones drawing themselves off.
 * Wide screens set the rules in three/two columns; phones turn them into a swipeable deck ending on "Take it to your game".
 * Heat: no loop at rest. Draw-on/off are one-shot CSS animations; the morphs and the sorter's throws run one rAF chain (spring.ts)
 * only while points move; the Hairline figure's shared loop sleeps when its springs rest. Timers and observers are cleaned up.
 */
const SPAN=TODAY-FIRST_YEAR;
const pct=(y:number)=>((y-FIRST_YEAR)/SPAN)*100;
const shortName=(t:LawThread)=>t.title.replace(/^Of (the )?/,'');
/** Ruler labels that have room on a wide dock (the others would collide with a neighbour). */
const LABELLED=new Set([1863,1882,1891,1912,1925,1970,1990,2018,TODAY]);

function useReducedMotion(){
 const [r,setR]=useState(false);
 useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');setR(q.matches);const on=()=>setR(q.matches);q.addEventListener('change',on);return()=>q.removeEventListener('change',on);},[]);
 return r;
}

/** Spring easing (CSS linear(), a critically-damped-ish spring with a small overshoot) shared by the word glide, stamps and thumb. */
const SPRING='linear(0, 0.007, 0.029 2.2%, 0.118 4.7%, 0.625 14.4%, 0.826 19%, 0.902, 0.962, 1.008 27.3%, 1.041 31.2%, 1.05 34.5%, 1.045 38.3%, 1.016 46.5%, 0.998 55.2%, 0.994 63.5%, 1.001 80%, 1)';
type Ghost={w:string;x:number;y:number;width:number;k:number};
type Morph={gen:number;pairs:[number,number,number][];ghosts:Ghost[];added:Set<number>};
const visualPos=(el:HTMLElement):[number,number]=>{const m=getComputedStyle(el).transform;if(!m||m==='none')return [el.offsetLeft,el.offsetTop];const d=new DOMMatrix(m);return [el.offsetLeft+d.e,el.offsetTop+d.f];};

/**
 * A rule's words, FLIP-animated (First, Last, Invert, Play). When the rule changes: words that survive glide from where they
 * were to where they now sit (one Web Animation each, spring-eased); struck words stay behind as red ghosts that are inked out;
 * new words are set in one by one. Every word is an inline-block both idle and mid-morph, so the end state is the idle layout
 * and nothing snaps when the morph is cleaned up. All one-shot; reduced motion swaps the text instantly.
 */
function MorphText({text,reduced,cap}:{text:string;reduced:boolean;cap:boolean}){
 const box=useRef<HTMLSpanElement>(null),[cur,setCur]=useState(text),[morph,setMorph]=useState<Morph|null>(null),gen=useRef(0);
 useLayoutEffect(()=>{
  if(text===cur)return;
  const el=box.current;
  if(reduced||!el){setCur(text);setMorph(null);return;}
  const old=[...el.querySelectorAll<HTMLElement>('[data-k]')].map(w=>{const [x,y]=visualPos(w);return {x,y,width:w.offsetWidth};});
  const tokens=diffWords(cur,text),pairs:[number,number,number][]=[],ghosts:Ghost[]=[],added=new Set<number>();
  let o=0,n=0;
  for(const t of tokens){
   if(t.kind==='same'){const p=old[o];if(p)pairs.push([n,p.x,p.y]);o++;n++;}
   else if(t.kind==='del'){const p=old[o];if(p)ghosts.push({w:t.w,x:p.x,y:p.y,width:p.width,k:o});o++;}
   else{added.add(n);n++;}
  }
  gen.current++;setCur(text);setMorph({gen:gen.current,pairs,ghosts,added});
 },[text,cur,reduced]);
 useLayoutEffect(()=>{
  const el=box.current;if(!morph||!el)return;
  const words=el.querySelectorAll<HTMLElement>('[data-k]');
  for(const [k,x,y] of morph.pairs){const w=words[k];if(!w)continue;w.getAnimations().forEach(a=>a.cancel());
   const dx=x-w.offsetLeft,dy=y-w.offsetTop;if(Math.abs(dx)<.5&&Math.abs(dy)<.5)continue;
   w.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:640,easing:SPRING});}
  const t=setTimeout(()=>setMorph(null),1300);
  return()=>clearTimeout(t);
 },[morph]);
 const words=cur.split(/\s+/);let added=0;
 return <span ref={box} className={s.morph}>
  {cap&&<span key={'c'+cur[0]} className={s.cap}>{cur[0]}</span>}
  {words.map((w,k)=><Fragment key={k}><span data-k={k} className={morph?.added.has(k)?s.add:s.w}
   style={morph?.added.has(k)?{animationDelay:`${300+Math.min(added++*34,600)}ms`}:undefined}>{cap&&k===0?w.slice(1):w}</span> </Fragment>)}
  {morph?.ghosts.map(g=><span key={`${morph.gen}-${g.k}`} className={s.del} style={{left:g.x,top:g.y,width:g.width}} aria-hidden="true">{g.w}</span>)}
 </span>;
}

/** What each version of each rule's drawing shows, said in words under it (Hairline keeps words out of the figure itself). */
const CAPTION:Record<string,readonly string[]>={
 players:['How many a side? Agree before kick-off.','Eleven a side.','Eleven a side, and one is the goalkeeper.'],
 goal:['No top: a goal at any height.','A tape, eight feet up.','A solid crossbar, eight feet up.','7.32 m wide, 2.44 m high, and a net.'],
 hands:['Catch it, and mark the spot with your heel.','Feet only: no more catching.','The goalkeeper may use his hands.','The keeper’s hands stop at his penalty area.','Not from a team-mate’s back-pass.','Only the keeper, only in his box.'],
 offside:['In front of the ball = offside.','Three opponents ahead = onside.','Two opponents ahead = onside.','Level = onside.','Level = onside.'],
 throw:['A race: the first to the ball throws it.','No race: the other team throws it.','Two hands.','Two hands, from behind and over the head.'],
 fair:['No tripping, no hacking.','A referee takes charge.','Yellow and red cards.','A video screen helps the referee.','Tripping is still a foul.'],
};

/** The museum's own Hairline line figure for this case (the rulebook; move the pointer up and its cover opens), mounted read-only
 *  from the timeline's port of the Hairline engine, drawn on once as it appears. Its loop sleeps when nothing moves. */
function Book(){
 const el=useRef<HTMLDivElement>(null);
 useEffect(()=>{const h=el.current;if(!h)return;let f:{destroy():void}|null=null,dead=false;
  void import('../timeline/hairline/figures').then(({FIGURES})=>import('../timeline/hairline/figure').then(({mountFigure})=>{if(dead||!FIGURES['laws-1863'])return;
   f=mountFigure(h,FIGURES['laws-1863'],true);h.querySelectorAll('path,ellipse').forEach((p,k)=>{p.setAttribute('pathLength','1');(p as SVGElement).style.setProperty('--i',String(k));});h.dataset.ready='';}));
  return()=>{dead=true;f?.destroy();};},[]);
 return <div ref={el} className={s.book} aria-hidden="true"/>;
}

/** The masthead year as a printer's odometer: each digit is a column of 0-9 that rolls (CSS transform transition, spring-eased). */
function Odometer({year}:{year:number}){
 if(year>=TODAY)return <span key="today" className={`${s.bigYear} ${s.odoToday}`} aria-hidden="true">Today</span>;
 return <span key="odo" className={`${s.bigYear} ${s.odo}`} aria-hidden="true">{String(year).split('').map((d,k)=><span key={k} className={s.odoCol}>
  <span className={s.odoReel} style={{transform:`translateY(${-Number(d)*10}%)`}}>{'0123456789'.split('').map(n=><span key={n}>{n}</span>)}</span></span>)}</span>;
}

function Rule({thread,year,reduced,onPick}:{thread:LawThread;year:number;reduced:boolean;onPick:(y:number)=>void}){
 const i=versionIndexAt(thread,year),v=thread.versions[i],era=eraOf(v.year),last=i===thread.versions.length-1;
 const drawing=useMemo(()=>ruleDrawing(thread.id,i),[thread.id,i]);
 return <article className={s.rule} data-era={era} data-rule={thread.id} data-slide aria-labelledby={`law-${thread.id}`}>
  <header className={s.ruleHead}>
   <span className={s.lawLine}>
    {(v.old||last)&&<span className={s.lawNo}>{v.old?thread.lawThen:thread.lawNow}</span>}
    {!v.old&&<span key={v.year} className={s.stamp} data-today={last||undefined}>{last?'In force today':`Amended ${v.year}`}</span>}
   </span>
   <h2 id={`law-${thread.id}`} className={s.ruleTitle}>{thread.title}</h2>
  </header>
  <p className={s.ruleText} aria-hidden="true"><MorphText text={v.text} reduced={reduced} cap={false}/></p>
  <p className={s.srOnly}>{v.old?'The 1863 Law says: ':`From ${yearLabel(v.year)}: `}{v.text}</p>
  <figure className={s.figBox}>
   <LineMorph className={s.fig} vb={FIG_VB} drawing={drawing} reduced={reduced} whenSeen/>
   <figcaption key={i} className={s.figCap}>{CAPTION[thread.id]?.[i]}</figcaption>
  </figure>
  <p key={`why-${v.year}`} className={s.why}><b>{v.old?'In 1863':last?'Today':`Why, ${v.year}`}</b> {v.why}</p>
  <nav className={s.versions} aria-label={`${thread.title}: every version`}>
   {thread.versions.map((x,k)=><button key={x.year} type="button" className={s.versionBtn} aria-pressed={k===i} aria-label={`Show ${thread.title.toLowerCase()} in ${yearLabel(x.year)}`} onClick={()=>onPick(x.year)}>{yearLabel(x.year)}</button>)}
  </nav>
 </article>;
}

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [year,setYear]=useState(FIRST_YEAR),[touched,setTouched]=useState(false),[dragging,setDragging]=useState(false);
 const [scrolled,setScrolled]=useState(false),[active,setActive]=useState(0),[done,setDone]=useState(false);
 const reduced=useReducedMotion(),slider=useRef<HTMLInputElement>(null),closeRef=useRef(onClose);closeRef.current=onClose;
 const rootRef=useRef<HTMLElement>(null),deckRef=useRef<HTMLDivElement>(null),rulerRef=useRef<HTMLDivElement>(null);
 const t=(year-FIRST_YEAR)/SPAN,era=eraOf(year),m=milestoneAt(year),atToday=year>=TODAY;
 const idx=THREADS.map(th=>versionIndexAt(th,year)),changed=idx.filter(Boolean).length,sig=idx.join('.');

 useEffect(()=>{rootRef.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();closeRef.current();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);

 // A soft rubber stamp whenever a rule is amended (throttled so a fast drag is not a drum roll); a short fanfare the first time
 // the visitor reaches today's Laws. Mute is respected by museumSfx.
 const lastSig=useRef(sig),lastStamp=useRef(0);
 useEffect(()=>{if(sig===lastSig.current)return;lastSig.current=sig;const now=performance.now();if(now-lastStamp.current>240){lastStamp.current=now;museumSfx.stamp();}},[sig]);
 useEffect(()=>{if(atToday&&!done){setDone(true);museumSfx.reveal();}},[atToday,done]);

 const go=useCallback((y:number)=>{setTouched(true);setYear(Math.max(FIRST_YEAR,Math.min(TODAY,Math.round(y))));},[]);

 // Which card is showing in the phone deck (a no-op on the broadsheet grid, where every card is visible).
 useEffect(()=>{const deck=deckRef.current;if(!deck||typeof IntersectionObserver==='undefined')return;
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){const k=[...deck.children].indexOf(e.target);if(k>=0)setActive(k);}},{root:deck,threshold:.6});
  [...deck.children].forEach(c=>io.observe(c));return()=>io.disconnect();},[]);

 /** Bring a card into view: slide the deck sideways on phones, scroll the broadsheet on wide screens. */
 const reveal=useCallback((k:number)=>{const deck=deckRef.current,el=deck?.children[k] as HTMLElement|undefined;if(!deck||!el)return;
  const behavior:ScrollBehavior=reduced?'auto':'smooth';
  if(deck.scrollWidth>deck.clientWidth+4){deck.scrollTo({left:el.offsetLeft-deck.offsetLeft-parseFloat(getComputedStyle(deck).paddingLeft||'0'),behavior});
   // The deck may be below the sorter: bring the pager + deck into view too.
   const sc=deck.closest<HTMLElement>('[data-scroll]'),pg=sc?.querySelector<HTMLElement>('[data-pager]'),r=(pg??deck).getBoundingClientRect(),v=sc?.getBoundingClientRect();
   if(sc&&v&&(r.top<v.top+60||r.top>v.top+v.height*.4))sc.scrollTo({top:sc.scrollTop+r.top-v.top-64,behavior});return;}
  const sc=el.closest<HTMLElement>('[data-scroll]');if(!sc)return;const r=el.getBoundingClientRect(),v=sc.getBoundingClientRect();
  if(r.top>=v.top+8&&r.bottom<=v.bottom)return;el.scrollIntoView({block:'start',behavior});},[reduced]);
 // Earlier/next change: show the first rule the jump rewrote (or the closing card when it reaches today).
 const step=(y:number)=>{const k=y>=TODAY?THREADS.length:THREADS.findIndex(th=>versionIndexAt(th,y)!==versionIndexAt(th,year));go(y);if(k>=0)setJump(j=>({k,n:(j?.n??0)+1}));};
 const [jump,setJump]=useState<{k:number;n:number}|null>(null);
 useEffect(()=>{if(jump)reveal(jump.k);},[jump,reveal]);
 /** From the sorter: set the year to when that Law changed and show its rule. */
 const see=useCallback((id:string,y:number)=>{const k=THREADS.findIndex(th=>th.id===id);go(y);if(k>=0)setJump(j=>({k,n:(j?.n??0)+1}));},[go]);
 const prev=MILESTONES.filter(x=>x.year<year).at(-1),next=MILESTONES.find(x=>x.year>year);
 const sources=useMemo(()=>{const seen=new Set<string>();return [...LAW_SOURCES,...SORT_SOURCES,...exhibit.sources].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 // The year rule: drag anywhere along it (touch, pen or mouse). Let go near a change and it clicks onto that year.
 const yearAt=(clientX:number)=>{const r=rulerRef.current!.getBoundingClientRect(),pad=28;return FIRST_YEAR+Math.max(0,Math.min(1,(clientX-r.left-pad)/(r.width-pad*2)))*SPAN;};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(e.button>0)return;e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);go(yearAt(e.clientX));};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{if(dragging)go(yearAt(e.clientX));};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{if(!dragging)return;setDragging(false);const y=yearAt(e.clientX),near=MILESTONES.reduce((a,b)=>Math.abs(b.year-y)<Math.abs(a.year-y)?b:a);if(Math.abs(near.year-y)<=2.5)go(near.year);};

 const style={'--p':String(t)} as CSSProperties;

 return <section ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: the living rulebook`} data-museum-experience="laws-1863" data-era={era} className={s.root} style={style}>
  <div className={s.topFade} data-show={scrolled||undefined} aria-hidden="true"/>
  <ExperienceBack onClose={onClose}/>

  <div className={s.scroll} data-scroll onScroll={e=>setScrolled(e.currentTarget.scrollTop>12)}>
   <header className={s.masthead} data-era={era}>
    <p className={s.topline}><span>{exhibit.year} · {exhibit.title}</span><span>The living rulebook</span></p>
    <Book/>
    <h1 className={s.title}><span className={s.titleSmall}>The</span> Laws of the Game</h1>
    <div className={s.doubleRule} aria-hidden="true"/>
    <p className={s.dateline}>
     <span className={s.dateLeft}>{year<1886?'Framed by the Football Association, London':'Looked after by the IFAB since 1886'}</span>
     <Odometer year={year}/>
     <span className={s.dateRight}>{changed===0?'As first printed, 1863':`${changed} of ${THREADS.length} rules rewritten`}</span>
    </p>
    <p className={s.standfirst}>{exhibit.facts.join(' ')}</p>
   </header>

   <Prologue reduced={reduced}/>
   <LineMorph className={s.thread} vb={THREAD_VB} drawing={THREAD_LINE} reduced={reduced} whenSeen/>
   <Sorter reduced={reduced} onSee={see}/>
   <LineMorph className={s.thread} vb={THREAD_VB} drawing={THREAD_LINE} reduced={reduced} whenSeen/>

   <h2 className={s.bookHead}><span>The living rulebook</span><small>Drag the year at the bottom: every rule rewrites itself.</small></h2>
   <nav className={s.pager} data-pager aria-label="The rules">
    {THREADS.map((th,k)=><button key={th.id} type="button" className={s.pageBtn} aria-current={active===k||undefined} data-changed={idx[k]>0||undefined}
     aria-label={`${shortName(th)}${idx[k]>0?' (rewritten)':''}`} onClick={()=>reveal(k)}><i/></button>)}
    <button type="button" className={s.pageBtn} data-end aria-current={active===THREADS.length||undefined} data-changed={atToday||undefined} aria-label="Take it to your game" onClick={()=>reveal(THREADS.length)}><i/></button>
   </nav>

   <div ref={deckRef} className={s.columns}>
    {THREADS.map(th=><Rule key={th.id} thread={th} year={year} reduced={reduced} onPick={go}/>)}
    <aside className={s.finale} data-slide data-done={atToday||undefined} aria-label="Take it to your game">
     <div className={s.finaleInner}>
      {atToday&&<span className={s.seal} aria-hidden="true"><svg viewBox="0 0 80 80"><path pathLength={1} d="M40 6a34 34 0 1 1-.1 0"/></svg><b>{THREADS.length}/{THREADS.length}</b>rules up to date</span>}
      <p className={s.finaleKicker}>Take it to your game</p>
      <p className={s.finaleLine}>{exhibit.forYourGame}</p>
      <p className={s.finaleNote}>{atToday
       ?'Thirteen Laws were printed in 1863; today there are seventeen. Tripping has been against the Laws the whole time.'
       :<>Drag the year all the way to <b>Today</b> to finish the rulebook.</>}</p>
      {!atToday&&<button type="button" className={s.finaleBtn} onClick={()=>step(TODAY)}>Jump to today</button>}
      {atToday&&<button type="button" className={s.finaleBtn} onClick={()=>document.getElementById('check-title')?.scrollIntoView({block:'start',behavior:reduced?'auto':'smooth'})}>Quick check ↓</button>}
     </div>
    </aside>
   </div>

   <LineMorph className={s.thread} vb={THREAD_VB} drawing={THREAD_LINE} reduced={reduced} whenSeen/>
   <QuickCheck/>

   <footer className={s.foot}>
    <p className={s.standfirstFoot}>{exhibit.facts.join(' ')}</p>
    <p className={s.footNote}>The 1863 rules above quote the FA’s first printed Laws (a few are shortened); the later ones are short summaries in plain words. Everything here is real history.</p>
    <details className={s.sources}>
     <summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>)}</ul>
    </details>
   </footer>
  </div>

  <div className={s.dock}>
   <div className={s.dockRow}>
    <button type="button" className={s.step} disabled={!prev} aria-label={prev?`Earlier change: ${yearLabel(prev.year)}`:'No earlier change'} onClick={()=>prev&&step(prev.year)}>
     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <p className={s.now} aria-live="polite"><span key={m.year} className={s.nowYear}>{yearLabel(year)}</span><span key={'h'+m.year} className={s.nowHead}>{m.year===year?m.headline:`Still the Laws of ${yearLabel(m.year)}`}</span></p>
    <button type="button" className={s.step} data-pulse={!touched||undefined} disabled={!next} aria-label={next?`Next change: ${yearLabel(next.year)}`:'No later change'} onClick={()=>next&&step(next.year)}>
     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
   </div>
   <div ref={rulerRef} className={s.ruler} data-dragging={dragging||undefined} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    <div className={s.track} aria-hidden="true">
     <span className={s.fill}/>
     {MILESTONES.map(x=><span key={x.year} className={s.notch} data-passed={x.year<=year||undefined} data-label={(LABELLED.has(x.year)&&Math.abs(x.year-year)>10)||undefined} style={{left:`${pct(x.year)}%`}}><i>{yearLabel(x.year)}</i></span>)}
    </div>
    <input ref={slider} className={s.range} type="range" min={FIRST_YEAR} max={TODAY} step={1} value={year} tabIndex={0}
     aria-label="Year of the Laws" aria-valuetext={`${yearLabel(year)}. ${changed} of ${THREADS.length} rules changed since 1863.`}
     onChange={e=>go(Number(e.target.value))}/>
    <span className={s.thumb} aria-hidden="true"><span>{yearLabel(year)}</span></span>
    {!touched&&<span className={s.hint} aria-hidden="true">Drag the year <span className={s.hintArrow}>→</span><span className={s.hintTail}> the Laws rewrite themselves</span></span>}
   </div>
  </div>
 </section>;
}

