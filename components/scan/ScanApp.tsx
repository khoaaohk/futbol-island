'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {count} from '@/lib/analytics/tracker';
import {AGES,applyPreset,better,COLOUR_IDS,COLOURS,cuesIn,DIR_ANGLE,DIRS,fmtTime,MAX_INTERVAL,MAX_TEAMMATES,MIN_INTERVAL,MIN_TEAMMATES,MODES,nextCue,pauseRun,phaseAt,RANGES,resumeRun,runMs,
 seeded,SESSIONS,SOUNDS,startRun,tally,type Cue,type Dir,type Result,type Run,type Score,type Settings,type Sound} from '@/lib/scan/engine';
import {emptyStore,loadStore,saveStore,type Lang,type Store} from '@/lib/scan/store';
import {WORDS,type Words} from '@/lib/scan/words';
import c from './scan.module.css';
import {AppHeader,HeaderBack,HeaderGoldBack} from '@/components/motion/AppHeader';
import {miniBackHref,noteAppEntry,screenChange,useCountUp,useSheet,useSwipeDown} from '@/components/motion/motion';
import '@/components/motion/motion.css';
/**
 * Scan Trainer (/scan and the club embed /embed/soccer-scanning-trainer; Nov 16 2026; docs/scan-trainer/HANDOFF.md).
 * Three screens: settings, the full-screen cue (3-2-1, then a new cue every interval; tap anywhere to pause) and the summary.
 * Settings and the coach-tap score stay on this device (lib/scan/store.ts). Counters are totals only: sn:start, sn:finish.
 * `embed`: no service worker, no manifest, no counters (the tracker is off in embeds anyway).
 */
type View='settings'|'run'|'summary';
type WakeLockNav=Navigator&{wakeLock?:{request(t:'screen'):Promise<{release():Promise<void>}>}};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
/* ---- soft sounds (WebAudio, created on the Start tap: browsers allow sound only after a gesture) ---- */
function play(ctx:AudioContext|null,kind:Sound,count3=false){
 if(!ctx||kind==='off')return;
 try{const t=ctx.currentTime,g=ctx.createGain();g.connect(ctx.destination);
  const tone=(f:number,type:OscillatorType,at:number,len:number,vol:number,to?:number)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t+at);if(to)o.frequency.exponentialRampToValueAtTime(to,t+at+len);
   v.gain.setValueAtTime(0.0001,t+at);v.gain.exponentialRampToValueAtTime(vol,t+at+0.01);v.gain.exponentialRampToValueAtTime(0.0001,t+at+len);o.connect(v);v.connect(g);o.start(t+at);o.stop(t+at+len+0.02);};
  if(count3){tone(660,'sine',0,0.12,0.18);return;}
  if(kind==='tick')tone(1200,'sine',0,0.06,0.22);
  else if(kind==='pop')tone(420,'triangle',0,0.12,0.3,880);
  else{tone(880,'sine',0,0.5,0.16);tone(1320,'sine',0,0.35,0.08);}
 }catch{/* no audio */}
}
function Arrow({dir,size}:{dir:Dir;size:string}){
 return <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true" style={{transform:`rotate(${DIR_ANGLE[dir]}deg)`}} className={c.arrowSvg}>
  <path d="M0 -44 L34 -6 L13 -6 L13 42 L-13 42 L-13 -6 L-34 -6 Z" fill="currentColor"/></svg>;
}
/** One cue, as big as the screen allows. `bg`: a colour cue fills the screen; numbers, arrows and passes sit on pitch green. */
function CueView({cue,s,w,small}:{cue:Cue;s:Settings;w:Words;small?:boolean}){
 const big=small?'34vmin':'78vmin';
 if(cue.kind==='colour'){const col=COLOURS[cue.colour],name=w.colourNames[cue.colour];
  return <div className={c.cue} data-cue={`colour:${cue.colour}`} style={s.bg?{background:col.hex,color:col.ink}:{background:'#000',color:'#fff'}} aria-label={name}>
   {!s.bg&&<span className={c.disc} style={{background:col.hex,width:small?'30vmin':'70vmin',height:small?'30vmin':'70vmin',boxShadow:cue.colour==='black'?'0 0 0 4px #fff':undefined}}/>}
   {s.names&&<span className={small?c.nameSmall:c.name}>{name}</span>}
  </div>;}
 const field={background:s.bg?'#1d6b55':'#000',color:'#fff'};
 if(cue.kind==='number')return <div className={c.cue} style={field} data-cue={`number:${cue.n}`} aria-label={String(cue.n)}><span className={c.num} style={{fontSize:small?'30vmin':cue.n>=10?'62vmin':'78vmin'}}>{cue.n}</span></div>;
 if(cue.kind==='arrow')return <div className={c.cue} style={field} data-cue={`arrow:${cue.dir}`} aria-label={w.dirNames[cue.dir]}><Arrow dir={cue.dir} size={big}/></div>;
 return <div className={c.cue} style={field} data-cue={`pass:${cue.n}:${cue.dir}`} aria-label={`${w.passTo(cue.n)}, ${w.dirNames[cue.dir]}`}>
  <span className={small?c.nameSmall:c.passLabel}>{w.passTo(cue.n)}</span>
  <span className={c.passRow}><span className={c.shirt} style={{fontSize:small?'18vmin':'44vmin'}}>{cue.n}</span><Arrow dir={cue.dir} size={small?'20vmin':'46vmin'}/></span>
 </div>;
}
function Seg<T extends string|number>({label,value,options,names,onPick,id}:{label:string;value:T;options:readonly T[];names:(v:T)=>string;onPick:(v:T)=>void;id:string}){
 return <div className={c.group} role="group" aria-labelledby={id}><h2 className={c.h2} id={id}>{label}</h2>
  <div className={c.seg}>{options.map(o=><button key={String(o)} type="button" className={c.chip} aria-pressed={o===value} onClick={()=>onPick(o)}>{names(o)}</button>)}</div></div>;
}
function Toggle({label,line,on,onFlip}:{label:string;line?:string;on:boolean;onFlip:()=>void}){
 return <button type="button" role="switch" aria-checked={on} className={c.toggle} onClick={onFlip}><span className={c.toggleText}><b>{label}</b>{line&&<span>{line}</span>}</span><span className={c.knob} aria-hidden="true"/></button>;
}
/** Summary numbers count up from 0 once (about 600 ms); reduced motion shows them at once. */
function Count({n}:{n:number}){return <>{useCountUp(n,600,0)}</>;}
function CountOf({w,hit,total}:{w:Words;hit:number;total:number}){return <>{w.ofN(useCountUp(hit,600,0),total)}</>;}
/** A personal best: a short star burst, CSS only, once (700 ms), then nothing. */
function Burst(){return <span className={c.burst} aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} style={{'--a':`${i*36}deg`} as React.CSSProperties}/>)}</span>;}
export default function ScanApp({embed=false,initialLang}:{embed?:boolean;initialLang?:Lang}){
 const [store,setStore]=useState<Store>(()=>({...emptyStore(),...(initialLang?{lang:initialLang}:{})}));
 const [ready,setReady]=useState(false);
 const [view,setView]=useState<View>('settings');
 const [run,setRun]=useState<Run|null>(null);
 const [now,setNow]=useState(0);
 const [cues,setCues]=useState<Cue[]>([]);
 const [score,setScore]=useState<Score>({hit:0,miss:0});
 const [result,setResult]=useState<{r:Result;best:boolean;prevBest?:Result;cues:number;sec:number}|null>(null);
 const [wake,setWake]=useState<'on'|'none'|'off'>('off');
 const sheetS=useSheet<true>(),sheet=!!sheetS.value,setSheet=(v:boolean)=>{if(v)sheetS.open(true);else sheetS.close();},panel=useRef<HTMLDivElement>(null),swipe=useSwipeDown(panel,sheetS.close);
 const audio=useRef<AudioContext|null>(null),rand=useRef<()=>number>(Math.random),lastSound=useRef(-9),finished=useRef(false);
 const s=store.settings,lang:Lang=store.lang??'en',w=WORDS[lang];
 const update=useCallback((f:(x:Store)=>Store)=>setStore(f),[]);
 const set=(p:Partial<Settings>)=>update(x=>({...x,settings:{...x.settings,...p,...('age' in p?{}:{age:null})}}));
 /* load once: saved settings, the language (?lang=, saved, the phone's), the app's own service worker */
 useEffect(()=>{let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* blocked */}
  const st=loadStore(ls),q=new URLSearchParams(window.location.search).get('lang');
  if(q==='es'||q==='en')st.lang=q;else if(initialLang)st.lang=initialLang;else if(!st.lang)st.lang=(navigator.language||'').toLowerCase().startsWith('es')?'es':'en';
  setStore(st);setReady(true);
  if(embed)return;
  noteAppEntry('scan');
  /* point every manifest link at the app's own; never remove one: React owns them, and a removed node made its next head update
     throw "Cannot read properties of null (reading 'removeChild')" (Nov 22 2026) */
  document.querySelectorAll('link[rel=manifest]').forEach(l=>{(l as HTMLLinkElement).href='/scan/manifest.webmanifest';});
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('/scan-sw.js',{scope:'/scan'}).catch(()=>{});
 },[embed,initialLang]);
 useEffect(()=>{if(!ready)return;let ls:Storage|null=null;try{ls=window.localStorage;}catch{/* blocked */}saveStore(ls,store);if(!embed)document.documentElement.lang=lang;},[store,ready,lang,embed]);
 /* the run clock: one animation frame loop while the cue screen is open */
 useEffect(()=>{if(view!=='run')return;let raf=0;const tick=()=>{setNow(Date.now());raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(raf);},[view]);
 /* keep the screen on during a run */
 useEffect(()=>{if(view!=='run')return;const nav=navigator as WakeLockNav;let lock:{release():Promise<void>}|null=null,gone=false;
  const req=async()=>{if(!nav.wakeLock){setWake('none');return;}try{const l=await nav.wakeLock.request('screen');if(gone){void l.release();return;}lock=l;setWake('on');}catch{setWake('none');}};
  void req();const vis=()=>{if(document.visibilityState==='visible')void req();};document.addEventListener('visibilitychange',vis);
  return ()=>{gone=true;document.removeEventListener('visibilitychange',vis);lock?.release().catch(()=>{});};},[view]);
 const ph=run?phaseAt(run,s,now||run.startedAt):null;
 /* grow the cue list as the clock passes each change; one sound per change */
 const idx=ph?.phase==='run'?ph.cue:-1;
 useEffect(()=>{if(idx<0)return;setCues(list=>{if(list.length>idx)return list;const out=[...list];while(out.length<=idx)out.push(nextCue(s,out[out.length-1]??null,rand.current));return out;});
  if(lastSound.current!==idx&&run?.pausedAt==null){lastSound.current=idx;play(audio.current,s.sound);}},[idx,s,run]);
 const cd=ph?.phase==='count'?ph.n:0;
 useEffect(()=>{if(cd>0&&run?.pausedAt==null)play(audio.current,s.sound,true);},[cd,s.sound,run]);
 const finish=useCallback((r:Run,at:number)=>{
  if(finished.current)return;finished.current=true;
  const ms=Math.max(0,Math.min(runMs(r,at),s.session?s.session*1000:Infinity)),shown=cuesIn(ms,s.interval*1000),total=score.hit+score.miss;
  const res:Result={hit:score.hit,total,cues:shown,sec:Math.round(ms/1000),interval:s.interval,at:today()};
  const prev=store.results[s.mode]?.best,isBest=s.score&&better(res,prev);
  if(s.score&&total>0)update(x=>({...x,results:{...x.results,[s.mode]:{last:res,best:isBest?res:prev}}}));
  screenChange('fade',()=>{setResult({r:res,best:isBest&&!!prev,prevBest:prev,cues:shown,sec:Math.round(ms/1000)});setView('summary');setRun(null);});
  if(!embed)count('sn:finish');
  try{if(document.fullscreenElement)void document.exitFullscreen();}catch{/* none */}
 },[s,score,store.results,update,embed]);
 useEffect(()=>{if(ph?.phase==='done'&&run)finish(run,Date.now());},[ph?.phase,run,finish]);
 const start=()=>{
  try{const AC=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(s.sound!=='off'&&AC){audio.current??=new AC();void audio.current.resume();}}catch{/* no audio */}
  try{const el=document.documentElement;if(!embed&&el.requestFullscreen&&!document.fullscreenElement)void el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}catch{/* none */}
  const t=Date.now();rand.current=seeded(t);finished.current=false;lastSound.current=-9;setCues([]);setScore({hit:0,miss:0});setResult(null);setRun(startRun(t));setNow(t);setView('run');
  if(!embed)count('sn:start');
 };
 const togglePause=()=>{if(!run)return;const t=Date.now();setRun(run.pausedAt!=null?resumeRun(run,t):pauseRun(run,t));setNow(t);};
 const mark=(ok:boolean)=>{if(run?.pausedAt==null&&ph?.phase==='run')setScore(x=>tally(x,ok));};
 const res=store.results[s.mode];
 const sample=useMemo<Cue>(()=>s.mode==='colours'||s.mode==='mix'?{kind:'colour',colour:s.colours[0]}:s.mode==='numbers'?{kind:'number',n:RANGES[s.range][1]>9?12:7}:s.mode==='arrows'?{kind:'arrow',dir:s.dirs.includes('left')?'left':s.dirs[0]}:{kind:'pass',n:Math.min(3,s.teammates),dir:s.dirs.includes('right')?'right':s.dirs[0]},[s]);
 const showColours=s.mode==='colours'||s.mode==='mix',showNumbers=s.mode==='numbers'||s.mode==='mix',showArrows=s.mode==='arrows'||s.mode==='mix'||s.mode==='pass';

 if(view==='run'&&run&&ph){
  const paused=run.pausedAt!=null,cue=cues[ph.phase==='run'?ph.cue:-1];
  return <div className={`${c.app} ${c.stage}`} data-scan-view="run" data-paused={paused?'':undefined}>
   <button type="button" className={c.tapZone} onClick={togglePause} aria-label={paused?w.resume:w.tapPause}>
    {ph.phase==='count'?<div className={c.cue} style={{background:'#14221d',color:'#fbf7ee'}} data-cue="count"><span className={c.countLabel}>{w.getReady}</span><span className={`${c.num} ${c.countNum}`} style={{fontSize:'70vmin'}} key={ph.n}>{ph.n}</span></div>
     :cue?<div className={c.cueIn} key={ph.phase==='run'?ph.cue:-1}><CueView cue={cue} s={s} w={w}/></div>:null}
   </button>
   {ph.phase==='run'&&s.session>0&&<div className={c.progress} aria-hidden="true"><i style={{transform:`scaleX(${Math.min(1,ph.ms/(s.session*1000))})`}}/></div>}
   <div className={c.hud} aria-live="off"><span>{ph.phase==='run'?(ph.left!=null?w.left(fmtTime(ph.left)):fmtTime(ph.ms/1000)):''}</span><span>{w.tapPause}</span></div>
   {s.score&&ph.phase==='run'&&!paused&&<div className={c.scoreStrip}>
    <button type="button" className={c.scoreBtn} data-score="hit" onClick={()=>mark(true)} aria-label={`${w.right}: ${score.hit}`}><span aria-hidden="true">✓</span> {score.hit}</button>
    <button type="button" className={`${c.scoreBtn} ${c.scoreMiss}`} data-score="miss" onClick={()=>mark(false)} aria-label={`${w.wrong}: ${score.miss}`}><span aria-hidden="true">✗</span> {score.miss}</button>
   </div>}
   {paused&&<div className={c.pause} role="dialog" aria-modal="true" aria-labelledby="scan-paused">
    <h1 className={c.pauseH} id="scan-paused">{w.paused}</h1>
    {s.score&&<p className={c.pauseScore}>{w.ofN(score.hit,score.hit+score.miss)}</p>}
    <button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={togglePause} autoFocus>{w.resume}</button>
    <button type="button" className={`${c.btn} ${c.btnLight} ${c.btnWide}`} onClick={()=>finish(run,run.pausedAt??Date.now())}>{w.end}</button>
    {wake==='none'&&<p className={c.pauseNote}>{w.wake}</p>}
   </div>}
  </div>;
 }
 if(view==='summary'&&result){
  const r=result.r;
  return <div className={c.app} translate="no" data-scan-view="summary"><Top w={w} lang={lang} embed={embed} onLang={()=>update(x=>({...x,lang:lang==='es'?'en':'es'}))} onBack={()=>screenChange('back',()=>setView('settings'))}/>
   <main className={c.main}>
    <h1 className={c.h1}>{w.done}</h1>
    <p className={c.sumCtx}>{w.modes[s.mode]} · {w.every} {w.sec(r.interval)}</p>
    <dl className={c.stats}>
     <div className="fi-in" style={{'--i':1} as React.CSSProperties}><dt>{w.cuesShown}</dt><dd><Count n={result.cues}/></dd></div>
     <div className="fi-in" style={{'--i':2} as React.CSSProperties}><dt>{w.time}</dt><dd>{fmtTime(result.sec)}</dd></div>
     {s.score&&r.total>0&&<div className={`${c.statWide} fi-in`}><dt>{w.scoreHead}</dt><dd><CountOf w={w} hit={r.hit} total={r.total}/></dd>{result.best&&<Burst/>}</div>}
    </dl>
    {s.score&&r.total>0?<p className={`${c.resultLine} fi-in`} style={{'--i':3} as React.CSSProperties}>{result.best?w.newBest:result.prevBest?w.toBeat(w.ofN(result.prevBest.hit,result.prevBest.total)):w.toBeat(w.ofN(r.hit,r.total))}</p>:<p className={c.note}>{w.noScore}</p>}
    <div className={c.btnCol}>
     <button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={start} autoFocus>{w.goAgain}</button>
     <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnWide}`} onClick={()=>screenChange('back',()=>setView('settings'))}>{w.change}</button>
    </div>
   </main></div>;
 }
 const glyph=(m:typeof MODES[number])=>m==='colours'?<span className={c.modeDot} aria-hidden="true"/>:m==='numbers'?<span className={c.modeNum} aria-hidden="true">7</span>
  :m==='arrows'?<Arrow dir="up" size="22px"/>:m==='mix'?<span className={c.modeMix} aria-hidden="true"><i/><b>3</b></span>:<span className={c.modeNum} aria-hidden="true">3<Arrow dir="right" size="14px"/></span>;
 /* Nov 22 2026 redesign (owner: "simple, sleek, modern"): the start screen shows the cue, the five modes and one summary of the
    settings; everything else lives in the Settings sheet. Same settings, same store (fi-scan-v1), same Start. */
 return <div className={c.app} translate="no" data-scan-view="settings"><Top w={w} lang={lang} embed={embed} onLang={()=>update(x=>({...x,lang:lang==='es'?'en':'es'}))}/>
  <main className={`${c.main} ${c.home}`}>
   <h1 className={c.srOnly}>{w.app}</h1>
   <figure className={c.preview} aria-label={w.preview}><CueView cue={sample} s={s} w={w} small/><figcaption>{w.modeLines[s.mode]}</figcaption></figure>
   <div className={c.homeSide}>
    <div className={c.modes} role="group" aria-label={w.show}>{MODES.map(m=><button key={m} type="button" className={c.mode} aria-pressed={s.mode===m} onClick={()=>set({mode:m})}>{glyph(m)}<span>{w.modes[m]}</span></button>)}</div>
    <button type="button" className={c.summaryCard} onClick={()=>setSheet(true)} data-scan-settings="" aria-haspopup="dialog">
     <span><small>{w.age}</small><b>{s.age?w.ages[s.age]:'–'}</b></span>
     <span><small>{w.every}</small><b>{w.sec(s.interval)}</b></span>
     <span><small>{w.session}</small><b>{w.sessions[s.session]}</b></span>
     <span className={c.summaryGo}><span className={c.srOnly}>{w.settings}</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    </button>
    {res?.best&&<p className={c.best} data-scan-best="">{w.modes[s.mode]}: {w.lastBest(res.last?w.ofN(res.last.hit,res.last.total):'–',w.ofN(res.best.hit,res.best.total))}</p>}
    <p className={c.place}>{w.place}</p>
    {/* fixed to the bottom on a phone; in the column beside the cue on a wide screen */}
  <div className={c.dock}><button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide} ${c.startBtn}`} onClick={start} data-scan-start="">{w.start}</button></div>
   </div>
  </main>
  {sheet&&<div className={c.sheet} data-closing={sheetS.closing?'':undefined} onClick={e=>{if(e.target===e.currentTarget)setSheet(false);}} onKeyDown={e=>{if(e.key==='Escape')setSheet(false);}}>
   <div className={c.sheetIn} ref={panel} role="dialog" aria-modal="true" aria-labelledby="scan-settings">
    <div className={c.sheetHead} {...swipe}><span className={c.grab} aria-hidden="true"/><h2 className={c.sheetTitle} id="scan-settings">{w.settings}</h2><button type="button" className={c.doneBtn} onClick={()=>setSheet(false)} autoFocus>{w.doneBtn}</button></div>
    <div className={c.sheetBody}>
   <Seg id="sg-age" label={w.age} value={s.age??('' as never)} options={AGES} names={a=>w.ages[a]} onPick={a=>update(x=>({...x,settings:applyPreset(x.settings,a)}))}/>
   <div className={c.group} role="group" aria-labelledby="sg-every"><h2 className={`${c.h2} ${c.h2Val}`} id="sg-every"><span>{w.every}</span><span className={c.val}>{w.sec(s.interval)}</span></h2>
    <div className={c.stepper}>
     <button type="button" className={c.stepBtn} onClick={()=>set({interval:Math.min(MAX_INTERVAL,s.interval+.5)})} disabled={s.interval>=MAX_INTERVAL} aria-label={w.slower}>−</button>
     <input type="range" min={MIN_INTERVAL} max={MAX_INTERVAL} step={0.5} value={MAX_INTERVAL+MIN_INTERVAL-s.interval} onChange={e=>set({interval:MAX_INTERVAL+MIN_INTERVAL-Number(e.target.value)})} aria-label={w.every} aria-valuetext={w.sec(s.interval)} className={c.range}/>
     <button type="button" className={c.stepBtn} onClick={()=>set({interval:Math.max(MIN_INTERVAL,s.interval-.5)})} disabled={s.interval<=MIN_INTERVAL} aria-label={w.faster}>+</button>
    </div>
    <p className={c.scale}><span>{w.slower}</span><span>{w.faster}</span></p>
   </div>
   <Seg id="sg-session" label={w.session} value={s.session} options={SESSIONS} names={x=>w.sessions[x]} onPick={x=>set({session:x})}/>
   {showColours&&<div className={c.group} role="group" aria-labelledby="sg-col"><h2 className={c.h2} id="sg-col">{w.colours}</h2><p className={c.note}>{w.coloursNote}</p>
    <div className={c.swatches}>{COLOUR_IDS.map(id=>{const on=s.colours.includes(id);return <button key={id} type="button" className={c.swatch} aria-pressed={on}
     onClick={()=>{const next=on?s.colours.filter(x=>x!==id):[...s.colours,id];if(next.length>=2)set({colours:COLOUR_IDS.filter(x=>next.includes(x))});}}>
     <span className={c.swatchDot} style={{background:COLOURS[id].hex}} aria-hidden="true"/>{w.colourNames[id]}</button>;})}</div></div>}
   {showNumbers&&<Seg id="sg-num" label={w.numbers} value={s.range} options={Object.keys(RANGES) as (keyof typeof RANGES)[]} names={r=>r.replace('-','–')} onPick={r=>set({range:r})}/>}
   {showArrows&&<div className={c.group} role="group" aria-labelledby="sg-arr"><h2 className={c.h2} id="sg-arr">{w.arrows}</h2><p className={c.note}>{w.arrowsNote}</p>
    <div className={c.compass}>{(['upLeft','up','upRight','left','','right','downLeft','down','downRight'] as (Dir|'')[]).map((d,i)=>d===''?<span key={i} className={c.compassMid} aria-hidden="true"/>:
     <button key={d} type="button" className={c.dirBtn} aria-pressed={s.dirs.includes(d)} aria-label={w.dirNames[d]}
      onClick={()=>{const on=s.dirs.includes(d),next=on?s.dirs.filter(x=>x!==d):[...s.dirs,d];if(next.length>=2)set({dirs:DIRS.filter(x=>next.includes(x))});}}><Arrow dir={d} size="28px"/></button>)}</div></div>}
   {s.mode==='pass'&&<div className={c.group} role="group" aria-labelledby="sg-tm"><h2 className={`${c.h2} ${c.h2Val}`} id="sg-tm"><span>{w.teammates}</span><span className={c.val}>{s.teammates}</span></h2><p className={c.note}>{w.teammatesNote} {s.teammates}.</p>
    <div className={c.seg}>{Array.from({length:MAX_TEAMMATES-MIN_TEAMMATES+1},(_,i)=>i+MIN_TEAMMATES).map(n=><button key={n} type="button" className={c.chip} aria-pressed={s.teammates===n} onClick={()=>set({teammates:n})}>{n}</button>)}</div></div>}
   <div className={c.group} role="group" aria-labelledby="sg-screen"><h2 className={c.h2} id="sg-screen">{w.screen}</h2>
    <Toggle label={w.bg} line={w.bgLine} on={s.bg} onFlip={()=>set({bg:!s.bg})}/>
    <Toggle label={w.names} line={w.namesLine} on={s.names} onFlip={()=>set({names:!s.names})}/>
    <Toggle label={w.score} line={w.scoreLine} on={s.score} onFlip={()=>set({score:!s.score})}/>
   </div>
   <Seg id="sg-lang" label={lang==='es'?'Idioma':'Language'} value={lang} options={['en','es'] as const} names={x=>x==='es'?'Español':'English'} onPick={x=>update(st=>({...st,lang:x}))}/>
   <Seg id="sg-sound" label={w.sound} value={s.sound} options={SOUNDS} names={x=>w.sounds[x]} onPick={x=>{set({sound:x});try{const AC=window.AudioContext;if(x!=='off'&&AC){audio.current??=new AC();void audio.current.resume();play(audio.current,x);}}catch{/* none */}}}/>
   <p className={c.note}>{w.offline}{!embed&&<> <a href={lang==='es'?'/es/tools/soccer-scanning-trainer':'/tools/soccer-scanning-trainer'}>{w.guide}</a></>}</p>
    </div>
   </div>
  </div>}
 </div>;
}
/** The shared coach-apps header (components/motion/AppHeader; owner Nov 22 2026): the title centred; on the left, from the summary a
 *  back arrow to the start screen, else "Coach" back to the coach app's Home when it opened the trainer (?from=coach); on the right the
 *  language and then Exit (back to the page the coach came from). The embed has no header buttons: the page that frames it is the way out. */
function Top({w,lang,embed,onLang,onBack}:{w:Words;lang:Lang;embed:boolean;onLang:()=>void;onBack?:()=>void}){
 const guide=lang==='es'?'/es/tools/soccer-scanning-trainer':'/tools/soccer-scanning-trainer';
 /* left: from the summary a light Back to the start screen; on the start screen the gold Back (the coach app's Home when it opened
    the trainer, else the page the coach came from); no Exit in a mini app (owner, Nov 22 2026: Exit only on the coach app's Home) */
 const left=embed?null:onBack?<HeaderBack label={lang==='es'?'Volver':'Back'} text={lang==='es'?'Volver':'Back'} icon="back" onClick={onBack} data={{'data-scan-back':''}}/>
  :<HeaderGoldBack key="settings" lang={lang} onBack={()=>{window.location.assign(miniBackHref(lang,guide));}} data={{'data-scan-coach':''}}/>;
 void onLang;/* the language moved to the settings sheet (owner, Nov 22 2026: the language button only on the coach app's Home) */
 return <AppHeader lang={lang} left={left} title={w.app} sub="Futbol Island" exitAria="" exit={false}/>;
}
