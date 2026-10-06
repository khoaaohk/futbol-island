'use client';
import {Fragment,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent as RPointerEvent} from 'react';
import ExperienceBack from '../ExperienceBack';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import {THREADS,MILESTONES,FIRST_YEAR,TODAY,LAW_SOURCES,versionIndexAt,milestoneAt,yearLabel,eraOf,diffWords,type LawThread} from './laws';
import s from './Experience.module.css';

/**
 * laws-1863 · "The Living Rulebook" (Oct 5 2026; polish pass the same day). The FA's first printed Laws (1863) set as a period
 * broadsheet; drag the year rule and every rule rewrites itself word by word into today's Laws, each amendment stamped with the
 * year and why it changed. Typography carries the story: a rule is set in the type of its own era (letterpress serif → book face →
 * modern sans). Wide screens print the rules as a three/two-column broadsheet; phones turn them into a swipeable deck of cards
 * (one rule per card, a dot shows which rules have been rewritten), ending on a "Take it to your game" card that is stamped when
 * the visitor reaches today.
 * Heat: no animation loop at all. Every movement is a one-shot CSS animation started by the visitor; nothing runs while idle,
 * nothing runs in a hidden tab, and the only timers (word-morph clean-up) are cleared on change and on unmount. The one
 * IntersectionObserver (which card is showing) is disconnected on unmount.
 */
const SPAN=TODAY-FIRST_YEAR;
const pct=(y:number)=>((y-FIRST_YEAR)/SPAN)*100;
const mix=(a:number[],b:number[],t:number)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;
const PAPER_OLD=[236,222,186],PAPER_NEW=[248,247,242],INK_OLD=[46,30,16],INK_NEW=[18,32,58];
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

/* ---- engraved figures for the three rules that are easiest to see. Decorative: the text says it all. One stroke scale
   (hairline 1, line 1.6, post 4), light from the top left, ink on paper, red only for "you" and for the line that decides. ---- */
const Ball=({x,y,r=5}:{x:number;y:number;r?:number})=><g className={s.figBallG}><circle cx={x} cy={y} r={r} className={s.figBallBody}/><path d={`M${x} ${y-r*.45} l${r*.43} ${r*.31} l-${r*.16} ${r*.5} h-${r*.54} l-${r*.16} -${r*.5} z`} className={s.figBallPatch}/></g>;

function GoalFigure({i}:{i:number}){
 const today=i>=3,top=i===0?6:26;
 return <svg key={i} className={s.fig} viewBox="0 0 220 104" aria-hidden="true">
  <path d="M8 86 H212" className={s.figGround}/>
  {[22,40,58,162,180,198].map(x=><path key={x} d={`M${x} 86 l-3 5 M${x+6} 86 l-3 5`} className={s.figTurf}/>)}
  {today&&<g className={s.figNet}>
   <path d="M66 32 H154 M66 32 L58 26 M154 32 L162 26 M66 32 V86 M154 32 V86"/>
   {[76,88,100,110,122,134,144].map(x=><path key={x} d={`M${x} 32 V86`}/>)}{[44,56,68,78].map(y=><path key={y} d={`M66 ${y} H154`}/>)}
  </g>}
  <path d={`M58 86 V${top}`} className={s.figPost}/><path d={`M162 86 V${top}`} className={s.figPost}/>
  {i===0&&<><path d="M110 82 Q112 40 118 12" className={s.figArrow}/><Ball x={118} y={12}/>
   <text x="128" y="44" className={s.figNote}>any height</text><text x="128" y="56" className={s.figNote}>still a goal</text></>}
  {i===1&&<path d="M58 27 Q110 40 162 27" className={`${s.figTape} ${s.figDraw}`}/>}
  {i>=2&&<path d="M56 26 H164" className={`${s.figBar} ${s.figDraw}`}/>}
  <path d="M58 97 H162" className={s.figDim}/><path d="M58 94 v6 M162 94 v6" className={s.figDim}/>
  <text x="110" y="95" className={s.figCap}>{today?'7.32 m':'8 yards'}</text>
  {i>=1&&<><path d="M176 28 V86" className={s.figDim}/><path d="M173 28 h6 M173 86 h6" className={s.figDim}/>
   <text x="184" y="60" className={`${s.figCap} ${s.figCapStart}`}>{today?'2.44 m':'8 ft'}</text></>}
 </svg>;
}

function OffsideFigure({i}:{i:number}){
 // Left to right: the passer (ink) and ball, the attacker (red), defenders (open), the goal line (right). The dashed red line is
 // the line that decides offside in that year: the ball (1863), the third-last defender (1866), the second-last (1925 on).
 const cfg=[{me:116,defs:[150,190],line:56,cap:'in front of the ball = offside',off:true},
  {me:112,defs:[124,154,190],line:124,cap:'3 opponents ahead = onside'},
  {me:126,defs:[140,190],line:140,cap:'2 opponents ahead = onside'},
  {me:144,defs:[144,190],line:144,cap:'level = onside'}][Math.min(i,3)];
 return <svg key={i} className={s.fig} viewBox="0 0 220 84" aria-hidden="true">
  <path d="M8 58 H200" className={s.figGround}/><path d="M200 10 V62" className={s.figPost}/>
  <path d={`M${cfg.line} 8 V66`} className={`${s.figLevel} ${s.figDrawY}`}/>
  <circle cx="36" cy="46" r="7" className={s.figMate}/><Ball x={50} y={52} r={4}/>
  <path d={`M56 48 Q${(56+cfg.me)/2} 10 ${cfg.me-9} 33`} className={s.figArrow}/>
  <circle cx={cfg.me} cy="36" r="7.5" className={s.figMe}/>
  {cfg.off&&<path d={`M${cfg.me-5} 16 l10 10 M${cfg.me+5} 16 l-10 10`} className={s.figCross}/>}
  {cfg.defs.map((x,k)=><circle key={k} cx={x} cy={k===cfg.defs.length-1?42:50} r="6.5" className={s.figThem}/>)}
  <text x="110" y="80" className={s.figCap}>{cfg.cap}</text>
 </svg>;
}

const FORMATION:[number,number][]=[[20,32],[40,12],[40,25],[40,39],[40,52],[64,12],[64,25],[64,39],[64,52],[88,22],[88,42]];
const SCATTER_L:[number,number][]=[[24,20],[38,40],[52,14],[58,48],[74,30],[86,18],[90,46]];
const SCATTER_R:[number,number][]=[[132,16],[136,42],[150,28],[164,12],[166,50],[178,34],[192,20],[196,46],[184,52]];
function PlayersFigure({i}:{i:number}){
 return <svg key={i} className={s.fig} viewBox="0 0 220 84" aria-hidden="true">
  <rect x="8" y="2" width="204" height="60" rx="4" className={s.figPitch}/><path d="M110 2 V62" className={s.figPitchLine}/><circle cx="110" cy="32" r="10" className={s.figPitchLine}/>
  {i===0?<>
   {[...SCATTER_L,...SCATTER_R].map(([x,y],k)=><circle key={k} cx={x} cy={y} r="5" className={s.figUnknown}/>)}
   <text x="60" y="40" className={s.figQ}>?</text><text x="162" y="40" className={s.figQ}>?</text>
  </>:<>
   {FORMATION.map(([x,y],k)=><circle key={'a'+k} cx={x} cy={y} r="5" className={k===0&&i>=2?s.figMe:s.figMate}/>)}
   {FORMATION.map(([x,y],k)=><circle key={'b'+k} cx={220-x} cy={y} r="5" className={k===0&&i>=2?s.figKeeper:s.figThem}/>)}
  </>}
  <text x="110" y="80" className={s.figCap}>{i===0?'how many a side? agree before kick-off':i>=2?'11 a side · one is the goalkeeper':'11 a side'}</text>
 </svg>;
}

/** The masthead year as a printer's odometer: each digit is a column of 0-9 that rolls (CSS transform transition, spring-eased). */
function Odometer({year}:{year:number}){
 if(year>=TODAY)return <span key="today" className={`${s.bigYear} ${s.odoToday}`} aria-hidden="true">Today</span>;
 return <span key="odo" className={`${s.bigYear} ${s.odo}`} aria-hidden="true">{String(year).split('').map((d,k)=><span key={k} className={s.odoCol}>
  <span className={s.odoReel} style={{transform:`translateY(${-Number(d)*10}%)`}}>{'0123456789'.split('').map(n=><span key={n}>{n}</span>)}</span></span>)}</span>;
}

function Rule({thread,year,reduced,onPick}:{thread:LawThread;year:number;reduced:boolean;onPick:(y:number)=>void}){
 const i=versionIndexAt(thread,year),v=thread.versions[i],era=eraOf(v.year),last=i===thread.versions.length-1;
 return <article className={s.rule} data-era={era} data-rule={thread.id} data-slide aria-labelledby={`law-${thread.id}`}>
  <header className={s.ruleHead}>
   <span className={s.lawLine}>
    {(v.old||last)&&<span className={s.lawNo}>{v.old?thread.lawThen:thread.lawNow}</span>}
    {!v.old&&<span key={v.year} className={s.stamp} data-today={last||undefined}>{last?'In force today':`Amended ${v.year}`}</span>}
   </span>
   <h2 id={`law-${thread.id}`} className={s.ruleTitle}>{thread.title}</h2>
  </header>
  <p className={s.ruleText} aria-hidden="true"><MorphText text={v.text} reduced={reduced} cap={era==='letterpress'}/></p>
  <p className={s.srOnly}>{v.old?'The 1863 Law says: ':`From ${yearLabel(v.year)}: `}{v.text}</p>
  {thread.id==='goal'&&<GoalFigure i={i}/>}
  {thread.id==='offside'&&<OffsideFigure i={i}/>}
  {thread.id==='players'&&<PlayersFigure i={i}/>}
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
  if(deck.scrollWidth>deck.clientWidth+4){deck.scrollTo({left:el.offsetLeft-deck.offsetLeft-parseFloat(getComputedStyle(deck).paddingLeft||'0'),behavior});return;}
  const sc=el.closest<HTMLElement>('[data-scroll]');if(!sc)return;const r=el.getBoundingClientRect(),v=sc.getBoundingClientRect();
  if(r.top>=v.top+8&&r.bottom<=v.bottom)return;el.scrollIntoView({block:'start',behavior});},[reduced]);
 // Earlier/next change: show the first rule the jump rewrote (or the closing card when it reaches today).
 const step=(y:number)=>{const k=y>=TODAY?THREADS.length:THREADS.findIndex(th=>versionIndexAt(th,y)!==versionIndexAt(th,year));go(y);if(k>=0)setJump(j=>({k,n:(j?.n??0)+1}));};
 const [jump,setJump]=useState<{k:number;n:number}|null>(null);
 useEffect(()=>{if(jump)reveal(jump.k);},[jump,reveal]);
 const prev=MILESTONES.filter(x=>x.year<year).at(-1),next=MILESTONES.find(x=>x.year>year);
 const sources=useMemo(()=>{const seen=new Set<string>();return [...LAW_SOURCES,...exhibit.sources].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);

 // The year rule: drag anywhere along it (touch, pen or mouse). Let go near a change and it clicks onto that year.
 const yearAt=(clientX:number)=>{const r=rulerRef.current!.getBoundingClientRect(),pad=28;return FIRST_YEAR+Math.max(0,Math.min(1,(clientX-r.left-pad)/(r.width-pad*2)))*SPAN;};
 const onDown=(e:RPointerEvent<HTMLDivElement>)=>{if(e.button>0)return;e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);go(yearAt(e.clientX));};
 const onMove=(e:RPointerEvent<HTMLDivElement>)=>{if(dragging)go(yearAt(e.clientX));};
 const onUp=(e:RPointerEvent<HTMLDivElement>)=>{if(!dragging)return;setDragging(false);const y=yearAt(e.clientX),near=MILESTONES.reduce((a,b)=>Math.abs(b.year-y)<Math.abs(a.year-y)?b:a);if(Math.abs(near.year-y)<=2.5)go(near.year);};

 const style={'--paper':mix(PAPER_OLD,PAPER_NEW,t),'--ink':mix(INK_OLD,INK_NEW,t),'--age':String(1-t),'--p':String(t)} as CSSProperties;

 return <section ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: the living rulebook`} data-museum-experience="laws-1863" data-era={era} className={s.root} style={style}>
  <div className={s.age} aria-hidden="true"/>
  <div className={s.topFade} data-show={scrolled||undefined} aria-hidden="true"/>
  <ExperienceBack onClose={onClose}/>

  <div className={s.scroll} data-scroll onScroll={e=>setScrolled(e.currentTarget.scrollTop>12)}>
   <header className={s.masthead} data-era={era}>
    <p className={s.topline}><span>{exhibit.year} · {exhibit.title}</span><span>The living rulebook</span></p>
    <h1 key={era} className={s.title}><span className={s.titleSmall}>The</span> Laws of the Game</h1>
    <div className={s.doubleRule} aria-hidden="true"/>
    <p className={s.dateline}>
     <span className={s.dateLeft}>{year<1886?'Framed by the Football Association, London':'Looked after by the IFAB since 1886'}</span>
     <Odometer year={year}/>
     <span className={s.dateRight}>{changed===0?'As first printed, 1863':`${changed} of ${THREADS.length} rules rewritten`}</span>
    </p>
    <p className={s.standfirst}>{exhibit.facts.join(' ')}</p>
   </header>

   <nav className={s.pager} aria-label="The rules">
    {THREADS.map((th,k)=><button key={th.id} type="button" className={s.pageBtn} aria-current={active===k||undefined} data-changed={idx[k]>0||undefined}
     aria-label={`${shortName(th)}${idx[k]>0?' (rewritten)':''}`} onClick={()=>reveal(k)}><i/></button>)}
    <button type="button" className={s.pageBtn} data-end aria-current={active===THREADS.length||undefined} data-changed={atToday||undefined} aria-label="Take it to your game" onClick={()=>reveal(THREADS.length)}><i/></button>
   </nav>

   <div ref={deckRef} className={s.columns}>
    {THREADS.map(th=><Rule key={th.id} thread={th} year={year} reduced={reduced} onPick={go}/>)}
    <aside className={s.finale} data-slide data-done={atToday||undefined} aria-label="Take it to your game">
     <div className={s.finaleInner}>
      {atToday&&<span className={s.seal} aria-hidden="true"><b>{THREADS.length}/{THREADS.length}</b>rules up to date</span>}
      <p className={s.finaleKicker}>Take it to your game</p>
      <p className={s.finaleLine}>{exhibit.forYourGame}</p>
      <p className={s.finaleNote}>{atToday
       ?'Thirteen Laws were printed in 1863; today there are seventeen. Tripping has been against the Laws the whole time.'
       :<>Drag the year all the way to <b>Today</b> to finish the rulebook.</>}</p>
      {!atToday&&<button type="button" className={s.finaleBtn} onClick={()=>step(TODAY)}>Jump to today</button>}
     </div>
    </aside>
   </div>

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

