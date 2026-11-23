'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {at,beats,levelsFor,score,SHUTTLE_M,type Mode} from '@/lib/site/tools/beepTest';
import {closeAudio,keepAwake,makeAudio,store,tone} from './toolAudio';
import CoachLink from './CoachLink';
import s from './newTools.module.css';
/**
 * The beep test (Nov 22 2026; /tools/soccer-beep-test and its Spanish twin). The beeps are scheduled on the AudioContext clock
 * a couple of seconds ahead (never thousands at once) and the screen follows that clock, so sound and display agree. The
 * redraw (requestAnimationFrame) runs only during a test; if the page is hidden the test stops (phones pause audio on a locked
 * screen, and nothing may run in the background: AGENTS.md). With no Web Audio the test still runs as a visual timer on the
 * page clock. Results are kept in localStorage on this device only.
 */
const KEY='fi-beep-results-v1',LEAD=3,AHEAD=2.5;
type Result={name:string;mode:Mode;label:string;metres:number;date:string};
const W={
 en:{kids:'Kids (gentler)',standard:'Standard',mode:'Version',start:'Start',stop:'Stop',get:'Get ready',level:'Level',shuttle:'Shuttle',of:(a:number,b:number)=>`${a} of ${b}`,
  kmh:(v:number)=>`${v.toFixed(1)} km/h`,run:(dir:boolean)=>dir?'Run to the far line':'Run back',next:'next beep in',newLevel:'New level: faster',
  result:'Result',reached:(l:string,m:number)=>`Reached level ${l}, ${m} m`,name:'Player’s first name',save:'Save result',saved:'Saved on this device.',results:'Results on this device',none:'No results yet. Run the test, stop it when a player drops out, then save their result.',
  remove:(n:string)=>`Remove ${n}`,clear:'Clear all',confirm:'Remove all saved results?',hidden:'The test stopped because the page was hidden. Keep the screen on during a test.',
  noAudio:'This browser cannot play the beeps. The test still runs: watch the bar and the count.',done:'Every level finished!',aria:'Beep test display',lane:`${SHUTTLE_M} m`,example:'Example result',exampleName:'Sam'},
 es:{kids:'Niños (más suave)',standard:'Estándar',mode:'Versión',start:'Empezar',stop:'Parar',get:'Prepárate',level:'Nivel',shuttle:'Tramo',of:(a:number,b:number)=>`${a} de ${b}`,
  kmh:(v:number)=>`${v.toFixed(1).replace('.',',')} km/h`,run:(dir:boolean)=>dir?'Corre a la línea del fondo':'Vuelve',next:'próximo pitido en',newLevel:'Nivel nuevo: más rápido',
  result:'Resultado',reached:(l:string,m:number)=>`Llegó al nivel ${l}, ${m} m`,name:'Nombre del jugador',save:'Guardar resultado',saved:'Guardado en este dispositivo.',results:'Resultados en este dispositivo',none:'Aún no hay resultados. Haz la prueba, párala cuando un jugador se retire y guarda su resultado.',
  remove:(n:string)=>`Quitar a ${n}`,clear:'Borrar todo',confirm:'¿Borrar todos los resultados guardados?',hidden:'La prueba se paró porque la página quedó oculta. Mantén la pantalla encendida durante la prueba.',
  noAudio:'Este navegador no puede reproducir los pitidos. La prueba sigue: mira la barra y la cuenta.',done:'¡Todos los niveles terminados!',aria:'Pantalla de la prueba de pitidos',lane:`${SHUTTLE_M} m`,example:'Resultado de ejemplo',exampleName:'Sam'},
};
export default function BeepTest({lang}:{lang?:'es'}){
 const w=W[lang==='es'?'es':'en'];
 const [mode,setMode]=useState<Mode>('kids');
 const levels=levelsFor(mode),bs=useMemo(()=>beats(levels),[levels]);
 const [running,setRunning]=useState(false);
 const [pos,setPos]=useState(0);/* seconds since the first shuttle began (negative during the count-in) */
 const [stopped,setStopped]=useState<number|null>(null);/* completed shuttles when stopped */
 const [msg,setMsg]=useState('');
 const [name,setName]=useState('');
 const [results,setResults]=useState<Result[]>([]);
 const bar=useRef<HTMLElement|null>(null),ctx=useRef<AudioContext|null>(null),t0=useRef(0),wall0=useRef(0),queued=useRef(0),raf=useRef(0),shown=useRef(-99),release=useRef<()=>void>(()=>{});
 useEffect(()=>{const r=store.get<Result[]>(KEY);if(Array.isArray(r))setResults(r.filter(x=>x&&typeof x.name==='string').slice(0,100));},[]);
 const saveResults=(r:Result[])=>{setResults(r);store.set(KEY,r);};
 const now=()=>ctx.current?ctx.current.currentTime-t0.current:(performance.now()-wall0.current)/1000;
 const schedule=()=>{const c=ctx.current;if(!c)return;const until=now()+AHEAD;
  while(queued.current<bs.length&&bs[queued.current].t<=until){const b=bs[queued.current],when=t0.current+b.t;
   if(b.levelEnd&&queued.current<bs.length-1){tone(c,when,988,.12,.5);tone(c,when+.16,988,.12,.5);tone(c,when+.32,988,.12,.5);}else tone(c,when,880,.22,.5);queued.current++;}};
 const finish=(completed:number,why=''):void=>{cancelAnimationFrame(raf.current);setRunning(false);setStopped(completed);setMsg(why);release.current();release.current=()=>{};closeAudio(ctx.current);ctx.current=null;};
 const loop=()=>{const t=now();schedule();const tenth=Math.floor(t*10);if(tenth!==shown.current){shown.current=tenth;setPos(t);}/* the numbers redraw 10 times a second; the bar every frame */
  if(t>=0){const a=at(levels,bs,t);if(bar.current)bar.current.style.transform=`scaleX(${a.progress.toFixed(4)})`;if(a.done){finish(bs.length,w.done);return;}}
  else if(bar.current)bar.current.style.transform=`scaleX(${(1+t/LEAD).toFixed(4)})`;
  raf.current=requestAnimationFrame(loop);};
 const startTest=()=>{
  ctx.current=makeAudio();setMsg(ctx.current?'':w.noAudio);queued.current=0;setStopped(null);
  if(ctx.current){t0.current=ctx.current.currentTime+LEAD;for(let i=LEAD;i>=1;i--)tone(ctx.current,t0.current-i,660,.1,.35);}
  wall0.current=performance.now()+LEAD*1000;setRunning(true);setPos(-LEAD);
  void keepAwake().then(r=>{release.current=r;});
  raf.current=requestAnimationFrame(loop);
 };
 const stopTest=()=>{const t=now();finish(t<0?0:at(levels,bs,t).completed);};
 /* nothing runs when the page is hidden: the test stops and says why */
 useEffect(()=>{if(!running)return;const vis=()=>{if(document.visibilityState!=='visible'){const t=now();finish(t<0?0:at(levels,bs,t).completed,w.hidden);}};
  document.addEventListener('visibilitychange',vis);return ()=>document.removeEventListener('visibilitychange',vis);});
 useEffect(()=>()=>{cancelAnimationFrame(raf.current);release.current();closeAudio(ctx.current);},[]);
 const a=pos>=0?at(levels,bs,pos):null,lv=a?levels[a.level-1]:levels[0];
 const res=stopped!==null?score(bs,stopped):null;
 const toNext=a&&!a.done?Math.max(0,bs[a.completed].t-pos):0;
 const levelStart=a&&a.shuttle===1&&a.level>1&&a.progress<.5;
 const save=()=>{if(!res)return;const n=name.replace(/[<>"`]/g,'').trim().slice(0,24);if(!n)return;
  saveResults([{name:n,mode,label:res.label,metres:res.metres,date:new Date().toISOString().slice(0,10)},...results].slice(0,100));setName('');setMsg(w.saved);};
 const example=results.length===0&&!running&&stopped===null;
 return <div className={s.tool} data-tool="beep">
  <section className={s.board} aria-label={w.aria}>
   <div className={s.boardTop}><div aria-live="polite">{running?(pos<0?w.get:levelStart?w.newLevel:w.run(a!==null&&a.completed%2===0)):res?w.reached(res.label,res.metres):w.get}</div><span>{w.kmh(lv.kmh)} · {w.lane}</span></div>
   <div className={s.level}>
    <div><b>{running&&pos<0?Math.ceil(-pos):a?a.level:res?res.level:1}</b><span>{running&&pos<0?'':w.level}</span></div>
    <div><b>{a?a.shuttle:res?res.shuttle:0}</b><span>{w.shuttle} {w.of(a?a.shuttle:res?res.shuttle:0,lv.shuttles)}</span></div>
   </div>
   <div className={s.bar} aria-hidden="true"><i ref={bar}/></div>
   <p className={s.under}>{running&&a?`${w.next} ${toNext.toFixed(1)} s`:msg}</p>
   <div className={s.controls}>
    {running?<button type="button" className={`${s.bigBtn} ${s.span2}`} onClick={stopTest}>{w.stop}</button>:<button type="button" className={`${s.bigBtn} ${s.span2}`} onClick={startTest}>{w.start}</button>}
   </div>
  </section>
  <section className={s.panel} aria-label={w.mode}>
   <div className={s.label} role="group" aria-label={w.mode}>{w.mode}<div className={s.seg}>
    <button type="button" aria-pressed={mode==='kids'} disabled={running} onClick={()=>{setMode('kids');setStopped(null);}}>{w.kids}</button>
    <button type="button" aria-pressed={mode==='standard'} disabled={running} onClick={()=>{setMode('standard');setStopped(null);}}>{w.standard}</button></div></div>
   {res&&!running&&<div className={s.grid}>
    <label className={`${s.label} ${s.wide}`}>{w.name}<input className={s.input} value={name} maxLength={24} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}}/></label>
    <button type="button" className={`${s.btn} ${s.wide}`} onClick={save} disabled={!name.trim()}>{w.save}</button>
   </div>}
   <h3>{w.results}</h3>
   {example?<ul className={s.results}><li><span>{w.exampleName} <small>· {w.kids}</small></span><b>5.3</b><span className={s.example}>{w.example}</span></li></ul>
    :results.length?<ul className={s.results}>{results.map((r,i)=><li key={`${r.name}-${i}`}><span>{r.name} <small>· {r.mode==='kids'?w.kids:w.standard} · {r.date}</small></span><b>{r.label}</b>
     <button type="button" className={s.x} aria-label={w.remove(r.name)} onClick={()=>saveResults(results.filter((_,j)=>j!==i))}>×</button></li>)}</ul>:<p className={s.hint}>{w.none}</p>}
   {example&&<p className={s.hint}>{w.none}</p>}
   {results.length>1&&<div className={s.actions}><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>{if(window.confirm(w.confirm))saveResults([]);}}>{w.clear}</button></div>}
  </section>
  <CoachLink kind="beep" lang={lang}/>
 </div>;
}
