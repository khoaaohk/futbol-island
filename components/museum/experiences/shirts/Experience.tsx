'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import ExperienceBack from '../ExperienceBack';
import type {ExperienceProps} from '../types';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {ISO_CSS} from '../anatomy/iso-kit';
import {fit,frameFor,useBox} from '../anatomy/bench';
import {BoardLive,Clock,RoomStatic,SHIRT_D,Stamp,TrayShirt,Vats,pegScreens,roomPoints} from './scene';
import {SPOTS,spotOf,hintFor,swatch,EXTRA_FACTS,SOURCES,type Kits} from './data';
import {MILESTONES,DECADE_SOURCES} from './eras';
import {BEATS,BEST_KEY,CHECK,PRACTICE_NOTE} from './content';
import {COL_SECONDS,CLASH_PENALTY,HOME,JOBS,KIT_POINTS,NUM_SECONDS,TEAM_BONUS,VATS,dye,pile,shirtPoints,timeBonus,type Job} from './model';
import s from './Experience.module.css';

/**
 * shirts · "The kit room, matchday 1928" (Oct 12 2026 anatomy restyle; user: "these games should not be the pixel style", "larger
 * and fill the entire screen", then every exhibit except the penalty kick in the anatomy isometric Paper style). The pixel game's
 * rules are kept; the drawing is a crafted kit-room bench that fills the play area at every size.
 *
 * A bench with the tactics board (the eleven pegs of the 1928 2-3-5), the number press and eight dye vats. Two halves:
 *  1. Numbers (40 s): a shirt lies on the press with its number; drag it onto the peg where that number played, or tap the peg
 *     (each peg is a button). Right: a red player stands there wearing the number (10 + a streak bonus); wrong: a nudge.
 *  2. Colours (30 s): your team is red. Dye the other team's kit, both keepers' and the referee's from the vats (or the swatches
 *     under the board). Law 4: all five must look different (data.clash); a clash is refused, a red wire shows who it looks like.
 * Full time: the score, the quick check, then the gallery ending (onComplete once, via Ending `reached`). Best per device.
 * Heat: no frame loop at all. React draws on change; the stamp drops by a CSS transform transition; the clock is a 1 s timeout
 * chain that runs only during a half and waits while the tab is hidden. Reduced motion: no clock, no stamp motion.
 */
type Phase='intro'|'numbers'|'between'|'colours'|'score';
const readBest=()=>{try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}};
const saveBest=(v:number)=>{try{localStorage.setItem(BEST_KEY,String(v));}catch{/* private mode */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const card=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null),endRef=useRef<HTMLDivElement>(null);
 const box=useBox(card);
 const [phase,setPhase]=useState<Phase>('intro');
 const [order,setOrder]=useState<number[]>(()=>pile());
 const [hung,setHung]=useState<ReadonlySet<number>>(()=>new Set());
 const [kits,setKits]=useState<Partial<Kits>>({home:HOME});
 const [jobIdx,setJobIdx]=useState(0);
 const [clock,setClock]=useState(NUM_SECONDS);
 const [score,setScore]=useState({numbers:0,colours:0,streak:0,misses:0,clashes:0});
 const [note,setNote]=useState('A shirt is on the press. Drag it to the peg where that number plays.');
 const [flash,setFlash]=useState<{big:string;line:string}|null>(null);
 const [picked,setPicked]=useState<number|null>(null),[best,setBest]=useState(0);
 const [mark,setMark]=useState<{good:string|null;bad:string|null;clash:(keyof Kits)|null}>({good:null,bad:null,clash:null});
 const [stamp,setStamp]=useState(false);
 const [drag,setDrag]=useState<{x:number;y:number;x0:number;y0:number}|null>(null);
 useEffect(()=>{setBest(readBest());},[]);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[onClose]);

 const W=box.w||1,H=box.h||1,orient=W>=H*1.05?'wide':'tall',F=useMemo(()=>frameFor(orient),[orient]);
 const pad=Math.round(Math.max(16,Math.min(W,H)*.045));
 const P0=useMemo(()=>fit(F,roomPoints(),W,H-34,pad,orient==='wide'?36:50),[F,W,H,pad,orient]);
 const P=useMemo(()=>({...P0,origin:[P0.origin[0],P0.origin[1]+12] as [number,number]}),[P0]);

 const shirt=phase==='numbers'?order.find(n=>!hung.has(n))??null:null;
 const job:Job|null=phase==='colours'?JOBS[jobIdx]?.key??null:null;

 // The press: the stamp drops when a new shirt is numbered (CSS transition; reduced motion: no drop).
 const press=useCallback(()=>{if(reduced)return;setStamp(true);museumSfx.stamp();later(()=>setStamp(false),220);},[reduced]);
 const blink=(m:Partial<typeof mark>)=>{setMark(x=>({...x,...m}));later(()=>setMark({good:null,bad:null,clash:null}),m.clash?1400:450);};

 // The clock: a 1 s timeout chain during a half (not under reduced motion); a hidden tab pauses it.
 const running=(phase==='numbers'||phase==='colours')&&!reduced;
 useEffect(()=>{if(!running)return;let id:ReturnType<typeof setTimeout>;
  const tick=()=>{id=setTimeout(()=>{if(document.hidden){tick();return;}setClock(c=>c-1);tick();},1000);};tick();return()=>clearTimeout(id);},[running]);
 useEffect(()=>{if(!running||clock>0)return;museumSfx.whistle();if(phase==='numbers')endNumbers(false);else endColours(false);// eslint-disable-next-line react-hooks/exhaustive-deps
 },[clock,running]);

 const startNumbers=()=>{setOrder(pile());setHung(new Set());setKits({home:HOME});setJobIdx(0);setScore({numbers:0,colours:0,streak:0,misses:0,clashes:0});setPicked(null);
  setClock(NUM_SECONDS);setNote('A shirt is on the press. Drag it to the peg where that number plays.');setFlash(null);setPhase('numbers');museumSfx.whistle();press();};
 function endNumbers(full:boolean){const left=clock;setPhase('between');
  setScore(sc=>({...sc,numbers:sc.numbers+(full?TEAM_BONUS+(reduced?0:timeBonus(left)):0)}));
  setFlash({big:full?'Full team':'Whistle',line:full?`All eleven! +${TEAM_BONUS}${reduced?'':` and +${timeBonus(left)} for time`}.`:'Time up. Now the colours.'});later(()=>setFlash(null),2400);
  setNote(EXTRA_FACTS.shape);}
 const startColours=()=>{setJobIdx(0);setKits(k=>({home:k.home??HOME}));setClock(COL_SECONDS);setNote(`Your team plays in red. Dye a kit for the ${JOBS[0].label.toLowerCase()}: pick a colour.`);setPhase('colours');museumSfx.whistle();};
 function endColours(full:boolean){const left=clock;setPhase('score');museumSfx.crowd();
  setScore(sc=>{const n={...sc,colours:sc.colours+(full&&!reduced?timeBonus(left):0)};const total=n.numbers+n.colours;if(total>readBest()){saveBest(total);setBest(total);}return n;});}

 const hang=(n:number)=>{if(phase!=='numbers'||shirt==null)return;
  if(hung.has(n)){museumSfx.tick();setNote(`Spot ${n} already has its shirt. Where does ${shirt} play?`);return;}
  if(n!==shirt){museumSfx.flap();blink({bad:'peg-'+n});setScore(sc=>({...sc,streak:0,misses:sc.misses+1}));setNote(hintFor(shirt,spotOf(n)));return;}
  const pts=shirtPoints(score.streak);museumSfx.card();blink({good:'peg-'+n});const next=new Set(hung);next.add(n);setHung(next);
  setScore(sc=>({...sc,numbers:sc.numbers+pts,streak:sc.streak+1}));setNote(`+${pts} · ${spotOf(n).say}`);
  if(next.size===11){museumSfx.reveal();endNumbers(true);}else press();};
 const dyeKit=(id:string)=>{if(phase!=='colours'||!job)return;const r=dye(job,id,kits);
  if(!r.ok){museumSfx.flap();blink({bad:'vat-'+id,clash:r.with});setScore(sc=>({...sc,colours:Math.max(0,sc.colours-CLASH_PENALTY),clashes:sc.clashes+1}));setNote(`Clash! ${r.say}`);return;}
  museumSfx.card();blink({good:'vat-'+id});const k={...kits,[job]:id};setKits(k);setScore(sc=>({...sc,colours:sc.colours+KIT_POINTS}));
  if(jobIdx+1>=JOBS.length){museumSfx.reveal();setNote(r.say);endColours(true);return;}
  setJobIdx(jobIdx+1);setNote(`${r.say} Next: the ${JOBS[jobIdx+1].label.toLowerCase()}.`);};

 // Drag the shirt from the press onto a peg (a tap on the shirt does nothing; tapping a peg hangs it).
 const local=(e:{clientX:number;clientY:number})=>{const r=svgRef.current?.getBoundingClientRect();return r?[e.clientX-r.left,e.clientY-r.top] as const:[0,0] as const;};
 const grabShirt=(e:React.PointerEvent)=>{if(phase!=='numbers'||shirt==null)return;e.preventDefault();e.stopPropagation();const [x,y]=local(e);setDrag({x,y,x0:x,y0:y});museumSfx.flapBook();};
 useEffect(()=>{if(!drag)return;
  const move=(e:PointerEvent)=>{const [x,y]=local(e);setDrag(d=>d&&{...d,x,y});};
  const up=(e:PointerEvent)=>{const [x,y]=local(e);setDrag(null);if(Math.hypot(x-drag.x0,y-drag.y0)<10)return;
   const near=pegScreens(F,P,new Set()).map(p=>({n:p.n,d:Math.hypot(p.xy[0]-x,p.xy[1]-y)})).sort((A,B)=>A.d-B.d)[0];
   if(near&&near.d<Math.max(34,Math.min(W,H)*.06))hang(near.n);else setNote('Drop the shirt right on a peg.');};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[drag?.x0,drag?.y0,F,P,shirt,hung]);
 const onKey=(e:React.KeyboardEvent)=>{if(phase==='between'&&(e.key==='Enter'||e.key===' ')&&e.target===e.currentTarget){e.preventDefault();startColours();}};

 const total=score.numbers+score.colours;
 const checked=picked!=null;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...SOURCES,...DECADE_SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const hint=phase==='numbers'?'Drag the shirt to its peg':phase==='colours'?'Dye a kit nobody else wears':phase==='between'?'Half time in the kit room':'Matchday, 1928';
 const label=`The kit room: a number press, a tactics board with the 1928 2-3-5 (${hung.size} of 11 shirts on their pegs) and eight dye vats.${kits.away?` The other team wears ${swatch(kits.away).name.toLowerCase()}.`:''}`;
 const readout=phase==='numbers'?`Shirt ${shirt??'–'}${reduced?'':` · ${clock} s`}`:phase==='colours'?`${JOBS[jobIdx]?.tag??''}${reduced?'':` · ${clock} s`}`:`${total} points`;
 const chip=(k:keyof Kits,lab:string)=><li key={k} data-k={k} data-now={job===k||undefined}><i style={{'--c':kits[k]?swatch(kits[k]!).hex:'transparent'} as CSSProperties} data-empty={!kits[k]||undefined} aria-hidden="true"/>{lab}<b>{kits[k]?swatch(kits[k]!).name:'?'}</b></li>;
 const ready=box.w>0;

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="shirts"
  className={`${g.room} iso ${s.root}`} data-theme="light" data-phase={phase} data-shirt={shirt??undefined} data-job={job??undefined} data-score={total} data-orient={orient} data-reduced={reduced||undefined} style={{'--accent':'#e4322b'} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={`${g.scroll} ${s.scroll}`} data-scroll>
   <div className={s.screen} data-play-screen>
    <header className={s.head}><WallLabel as="h1" title={exhibit.title} meta={`${exhibit.year} · England`} caption="Run the kit room: number the shirts, then dye kits that never clash." className={s.label}/></header>

    <div ref={card} className={s.card} data-play-area data-fill-screen tabIndex={0} onKeyDown={onKey} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">Fig. 1928</span><span data-corner="title">The kit room · matchday</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout">{readout}</span>
     </div>
     {ready&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="group" aria-label={label} data-drag={drag?'':undefined}>
      <RoomStatic F={F} P={P}/>
      <Clock F={F} P={P} secs={phase==='numbers'||phase==='colours'?clock:phase==='intro'?NUM_SECONDS:0} hot={running&&clock<=5}/>
      {(shirt!=null||job)&&!drag&&<TrayShirt F={F} P={P} n={job?null:shirt} color={job?'#f7f7f3':'#e4322b'} onDown={grabShirt}/>}
      <Stamp F={F} P={P} down={stamp}/>
      <Vats F={F} P={P} flash={mark.good} wrong={mark.bad} onPick={dyeKit} disabled={phase!=='colours'}/>
      <BoardLive F={F} P={P} hung={hung} kits={kits} job={job} wrongPeg={mark.bad?.startsWith('peg-')?+mark.bad.slice(4):null} flashPeg={mark.good?.startsWith('peg-')?+mark.good.slice(4):null}
       clashWith={mark.clash} onPeg={hang} pegsLive={phase==='numbers'}/>
      {drag&&shirt!=null&&<g transform={`translate(${drag.x} ${drag.y})`} data-ghost style={{pointerEvents:'none'}}>
       <ellipse className="iso-halo" cx={6} cy={28} rx={26} ry={7}/>
       <path d={SHIRT_D} transform="scale(1.3)" fill="#e4322b" stroke="#3a3a3c" strokeWidth={1} vectorEffect="non-scaling-stroke"/>
       <text y={9} textAnchor="middle" className={s.ghostNum}>{shirt}</text>
      </g>}
     </svg>}
     {flash&&<div className={s.flash} role="status"><b>{flash.big}</b><span>{flash.line}</span></div>}

     {phase==='intro'&&<div className={s.panel} data-intro>
      <p className={g.kicker}>1928 · England</p>
      <h2 className={s.panelTitle}>Numbers and colours.</h2>
      <p className={g.body}>{exhibit.facts[0]}</p>
      <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><b>{b.head}</b><p>{b.text}</p></li>)}</ol>
      <div className={g.row}><button type="button" className={g.btn} data-start onClick={startNumbers} data-museum-own-cue>Open the kit room</button></div>
     </div>}

     {phase==='score'&&<div className={s.panel} data-score-panel>
      <p className={g.kicker}>Full time · the kit room</p>
      <p className={s.big}><b>{total}</b><span>points</span></p>
      <dl className={s.split} data-split><div><dt>Numbers</dt><dd>{score.numbers}</dd></div><div><dt>Colours</dt><dd>{score.colours}</dd></div><div><dt>Best</dt><dd>{Math.max(best,total)}</dd></div></dl>
      <p className={g.body}><b>Numbers:</b> {exhibit.facts[1]}</p>
      <p className={g.body}><b>Colours:</b> {exhibit.facts[2]}</p>
      <StepCheck items={[CHECK]} kicker={()=>'Quick check'} onPick={ok=>{setPicked(ok?CHECK.right:-1);if(ok)museumSfx.reveal();else museumSfx.tick();}}
       doneLabel="See the ending" onDone={()=>later(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60)}/>
      <div className={g.row}><button type="button" className={g.btn} data-museum-own-cue data-play-again onClick={startNumbers}>Play again</button></div>
     </div>}
    </div>

    <div className={s.dock} data-dock>
     {phase==='intro'?<><button type="button" className={g.btn} data-start-dock onClick={startNumbers}>Open the kit room</button><p className={s.say}>Matchday, 1928: the first numbered shirts.</p></>
     :phase==='numbers'?<>
       <dl className={s.stats}><div><dt>Shirt</dt><dd className={s.shirtNo}>{shirt??'–'}</dd></div><div><dt>Points</dt><dd>{score.numbers}</dd></div><div><dt>In a row</dt><dd>{score.streak}</dd></div><div><dt>Clock</dt><dd>{reduced?'–':`${clock}s`}</dd></div></dl>
       <p className={s.say} aria-live="polite">{note}</p>
       <div className={s.pad} role="group" aria-label={`Formation: where does shirt ${shirt} play?`}>{SPOTS.map(sp=><button key={sp.n} type="button" data-peg={sp.n} disabled={hung.has(sp.n)} onClick={()=>hang(sp.n)} data-museum-own-cue aria-label={hung.has(sp.n)?`${sp.role}: number ${sp.n}`:sp.role}>{hung.has(sp.n)?sp.n:sp.short}</button>)}</div>
      </>
     :phase==='colours'?<>
       <div className={s.vats} role="group" aria-label={`Dyes: pick a colour for the ${JOBS[jobIdx]?.label.toLowerCase()}`}>{VATS.map(id=><button key={id} type="button" data-vat={id} onClick={()=>dyeKit(id)} data-museum-own-cue aria-label={swatch(id).name} data-bad={mark.bad==='vat-'+id||undefined}>
        <i style={{'--c':swatch(id).hex} as CSSProperties} aria-hidden="true"/><span>{swatch(id).name}</span></button>)}</div>
       <ul className={s.chips} aria-label="Kits so far">{chip('home','Your team')}{JOBS.map(j=>chip(j.key,j.label))}</ul>
       <p className={s.say} aria-live="polite">{note}</p>
      </>
     :phase==='between'?<><button type="button" className={g.btn} data-start-colours onClick={startColours}>Colours</button><p className={s.say} aria-live="polite">Numbers: <b>{score.numbers} points</b>. {note} Next: dye four kits so nobody can be mixed up. Law 4.</p></>
     :<p className={s.say}>1928 numbers, Law 4 colours: read a team at a glance.</p>}
    </div>
   </div>

   <div className={s.below}>
    <section className={g.section} aria-labelledby="sh-facts">
     <p className={g.kicker}>The real story</p>
     <h2 id="sh-facts" className={g.h2}>Why shirts got numbers and colours</h2>
     <ol className={g.steps}>{[exhibit.facts[0],EXTRA_FACTS.firstDay,EXTRA_FACTS.shape,exhibit.facts[1],EXTRA_FACTS.cupFinal,exhibit.facts[2]].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
     <p className={g.kicker}>Through the decades</p>
     <ol className={g.steps}>{MILESTONES.map(m=><li key={m.year}><span>{m.tag}</span><p className={g.body}><b>{m.title}.</b> {m.text}</p></li>)}</ol>
     <p className={g.small}>{PRACTICE_NOTE}</p>
    </section>
    <div ref={endRef}>{checked&&<Ending art={<EndShirt/>} seen="You’ve seen how numbers and colours let every player read a team at a glance: 1928 numbers, Law 4 colours." take={exhibit.forYourGame} onComplete={onComplete} reached={checked}/>}</div>
    <footer><details className={g.sources}><summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details></footer>
   </div>
  </div>
 </section>;
}

/** The ending's mark: the red number 9 shirt, laid flat with a soft shadow. */
function EndShirt(){
 return <svg viewBox="-40 -36 80 80" aria-hidden="true"><ellipse cx="2" cy="30" rx="30" ry="5" fill="#8a8a80" opacity=".3"/>
  <path d={SHIRT_D} fill="#e4322b" stroke="#1d1d1b" strokeWidth=".8"/><path d="M-15 -5L-15 21L15 21L15 -5" fill="none" stroke="#000" strokeOpacity=".12"/>
  <text y="10" textAnchor="middle" fontFamily="Helvetica Neue,Helvetica,Arial,sans-serif" fontWeight="700" fontSize="20" fill="#fff">9</text></svg>;
}
