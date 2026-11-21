'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {count} from '@/lib/analytics/tracker';
import {AGES,applyPreset,better,COLOUR_IDS,COLOURS,cuesIn,DIR_ANGLE,DIRS,fmtTime,MAX_INTERVAL,MAX_TEAMMATES,MIN_INTERVAL,MIN_TEAMMATES,MODES,nextCue,pauseRun,phaseAt,RANGES,resumeRun,runMs,
 seeded,SESSIONS,SOUNDS,startRun,tally,type Cue,type Dir,type Result,type Run,type Score,type Settings,type Sound} from '@/lib/scan/engine';
import {emptyStore,loadStore,saveStore,type Lang,type Store} from '@/lib/scan/store';
import {WORDS,type Words} from '@/lib/scan/words';
import c from './scan.module.css';
import {BackButton} from '@/components/BackButton';
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
  document.querySelectorAll('link[rel=manifest]').forEach((l,i)=>{if(i===0)(l as HTMLLinkElement).href='/scan/manifest.webmanifest';else l.remove();});
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
  setResult({r:res,best:isBest&&!!prev,prevBest:prev,cues:shown,sec:Math.round(ms/1000)});setView('summary');setRun(null);
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
    {ph.phase==='count'?<div className={c.cue} style={{background:'#14221d',color:'#fbf7ee'}} data-cue="count"><span className={c.countLabel}>{w.getReady}</span><span className={c.num} style={{fontSize:'70vmin'}} key={ph.n}>{ph.n}</span></div>
     :cue?<CueView cue={cue} s={s} w={w}/>:null}
   </button>
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
  return <div className={c.app} data-scan-view="summary"><Top w={w} lang={lang} embed={embed} onLang={()=>update(x=>({...x,lang:lang==='es'?'en':'es'}))} onBack={()=>setView('settings')}/>
   <main className={c.main}>
    <h1 className={c.h1}>{w.done}</h1>
    <dl className={c.stats}>
     <div><dt>{w.cuesShown}</dt><dd>{result.cues}</dd></div>
     <div><dt>{w.time}</dt><dd>{fmtTime(result.sec)}</dd></div>
     {s.score&&r.total>0&&<div className={c.statWide}><dt>{w.scoreHead}</dt><dd>{w.ofN(r.hit,r.total)}</dd></div>}
    </dl>
    {s.score&&r.total>0?<p className={c.resultLine}>{result.best?w.newBest:result.prevBest?w.toBeat(w.ofN(result.prevBest.hit,result.prevBest.total)):w.toBeat(w.ofN(r.hit,r.total))}</p>:<p className={c.note}>{w.noScore}</p>}
    <div className={c.btnCol}>
     <button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide}`} onClick={start} autoFocus>{w.goAgain}</button>
     <button type="button" className={`${c.btn} ${c.btnGhost} ${c.btnWide}`} onClick={()=>setView('settings')}>{w.change}</button>
    </div>
   </main></div>;
 }
 return <div className={c.app} data-scan-view="settings"><Top w={w} lang={lang} embed={embed} onLang={()=>update(x=>({...x,lang:lang==='es'?'en':'es'}))}/>
  <main className={c.main}>
   <h1 className={c.h1}>{w.app}</h1>
   <p className={c.lead}>{w.tagline}</p>
   <figure className={c.preview} aria-label={w.preview}><CueView cue={sample} s={s} w={w} small/><figcaption>{w.modeLines[s.mode]}</figcaption></figure>
   <Seg id="sg-age" label={w.age} value={s.age??('' as never)} options={AGES} names={a=>w.ages[a]} onPick={a=>update(x=>({...x,settings:applyPreset(x.settings,a)}))}/>
   <Seg id="sg-mode" label={w.show} value={s.mode} options={MODES} names={m=>w.modes[m]} onPick={m=>set({mode:m})}/>
   <div className={c.group} role="group" aria-labelledby="sg-every"><h2 className={c.h2} id="sg-every">{w.every}: <span className={c.val}>{w.sec(s.interval)}</span></h2>
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
   {s.mode==='pass'&&<div className={c.group} role="group" aria-labelledby="sg-tm"><h2 className={c.h2} id="sg-tm">{w.teammates}: <span className={c.val}>{s.teammates}</span></h2><p className={c.note}>{w.teammatesNote} {s.teammates}.</p>
    <div className={c.seg}>{Array.from({length:MAX_TEAMMATES-MIN_TEAMMATES+1},(_,i)=>i+MIN_TEAMMATES).map(n=><button key={n} type="button" className={c.chip} aria-pressed={s.teammates===n} onClick={()=>set({teammates:n})}>{n}</button>)}</div></div>}
   <div className={c.group} role="group" aria-labelledby="sg-screen"><h2 className={c.h2} id="sg-screen">{w.screen}</h2>
    <Toggle label={w.bg} line={w.bgLine} on={s.bg} onFlip={()=>set({bg:!s.bg})}/>
    <Toggle label={w.names} line={w.namesLine} on={s.names} onFlip={()=>set({names:!s.names})}/>
    <Toggle label={w.score} line={w.scoreLine} on={s.score} onFlip={()=>set({score:!s.score})}/>
   </div>
   <Seg id="sg-sound" label={w.sound} value={s.sound} options={SOUNDS} names={x=>w.sounds[x]} onPick={x=>{set({sound:x});try{const AC=window.AudioContext;if(x!=='off'&&AC){audio.current??=new AC();void audio.current.resume();play(audio.current,x);}}catch{/* none */}}}/>
   {res?.best&&<p className={c.note} data-scan-best="">{w.modes[s.mode]}: {w.lastBest(res.last?w.ofN(res.last.hit,res.last.total):'–',w.ofN(res.best.hit,res.best.total))}</p>}
   <p className={c.note}>{w.place}</p>
   <p className={c.note}>{w.offline}{!embed&&<> <a href={lang==='es'?'/es/tools/soccer-scanning-trainer':'/tools/soccer-scanning-trainer'}>{w.guide}</a></>}</p>
  </main>
  <div className={c.dock}><button type="button" className={`${c.btn} ${c.btnGold} ${c.btnWide} ${c.startBtn}`} onClick={start} data-scan-start="">{w.start}</button></div>
 </div>;
}
/** Back (owner, Nov 20 2026): the app mark in this corner looked like a back button and did nothing. It is now the game's own Back
 *  button (components/BackButton.tsx). From the summary it returns to the settings; from the settings it leaves for the trainer's
 *  guide page. The embed has no Back: the page that frames it is the way out. */
function Top({w,lang,embed,onLang,onBack}:{w:Words;lang:Lang;embed:boolean;onLang:()=>void;onBack?:()=>void}){
 const leave=()=>{window.location.assign(lang==='es'?'/es/tools/soccer-scanning-trainer':'/tools/soccer-scanning-trainer');};
 return <header className={c.top}>
  {/* key: the button locks itself once pressed (it expects its screen to go away), and React kept the same one from the summary to
      the settings, so Back was dead on the settings after a session (found Nov 20 2026). A fresh button per screen. */}
  {!embed&&<BackButton key={onBack?'summary':'settings'} data-scan-back label={lang==='es'?'Volver':'Back'} onBack={onBack??leave}/>}
  <span className={c.topTitle}><b>{w.app}</b><span>Futbol Island</span></span>
  <button type="button" className={c.langBtn} lang={lang==='es'?'en':'es'} onClick={onLang}>{w.lang}</button>
 </header>;
}
