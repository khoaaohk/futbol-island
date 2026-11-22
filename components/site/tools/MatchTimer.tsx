'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {addTime,crossed,elapsed,endPeriod,goal,mmss,MIN,newClock,nextSub,pause,periodLength,periodWord,readClock,remaining,start,subMarks,type Clock,type PeriodWord,type Setup} from '@/lib/site/tools/matchTimer';
import {closeAudio,doubleBeep,keepAwake,makeAudio,store,whistle} from './toolAudio';
import s from './newTools.module.css';
/**
 * The match timer and scoreboard (Nov 22 2026; /tools/soccer-match-timer and its Spanish twin). The clock is timestamps
 * (lib/site/tools/matchTimer.ts), so it is right after a locked screen or a reload; the display redraws 4 times a second only
 * while the clock runs AND the page is visible (AGENTS.md heat rule). Sound is off until the coach turns it on; the screen wake
 * lock is held only while the clock runs. Team names and the score stay in localStorage on this device.
 */
export type TimerPreset={id:string;label:string;periods:number;periodMin:number};
const KEY='fi-match-timer-v1';
const W={
 en:{home:'Lions',away:'Tigers',example:'Example',periodName:(w:PeriodWord,n:number)=>({half:['1st half','2nd half'],quarter:['1st quarter','2nd quarter','3rd quarter','4th quarter'],third:['1st third','2nd third','3rd third'],period:['Game']}[w][n]??`Period ${n+1}`),
  end:(w:PeriodWord)=>({half:'End half',quarter:'End quarter',third:'End third',period:'End game'}[w]),endGame:'End game',start:'Start',resume:'Resume',pause:'Pause',nextStart:(p:string)=>`Start ${p}`,
  ready:'Ready for kick-off',paused:'Paused',breakFor:(t:string)=>`Break: ${t}`,full:'Full time',over:'Added time',nextSub:(t:string)=>`Next change in ${t}`,subNow:'Time to make your changes',
  addMin:'+ 1 min',added:(n:number)=>`${n} min added`,goal:'Tap to add a goal',minus:'− goal',goalAt:(m:number)=>`${m}′`,
  setup:'Game settings',game:'Game',custom:'Custom',periods:'Periods',length:'Minutes each',breakLen:'Break (minutes)',subs:'Sub reminder',subOff:'Off',subEvery:(n:number)=>`Every ${n} min`,
  homeName:'Home team',awayName:'Away team',sound:'Sounds (end-of-period beep and sub reminders)',awake:'Keep the screen on while the clock runs',reset:'New game',confirm:'Start a new game? The score will be cleared.',
  locked:'Settings are locked while a game is on. Tap New game to change them.',saved:'This game is saved on this device.',aria:'Soccer match clock'},
 es:{home:'Leones',away:'Tigres',example:'Ejemplo',periodName:(w:PeriodWord,n:number)=>({half:['1.er tiempo','2.º tiempo'],quarter:['1.er cuarto','2.º cuarto','3.er cuarto','4.º cuarto'],third:['1.er tercio','2.º tercio','3.er tercio'],period:['Partido']}[w][n]??`Periodo ${n+1}`),
  end:(w:PeriodWord)=>({half:'Fin del tiempo',quarter:'Fin del cuarto',third:'Fin del tercio',period:'Fin del partido'}[w]),endGame:'Fin del partido',start:'Empezar',resume:'Seguir',pause:'Pausa',nextStart:(p:string)=>`Empezar ${p}`,
  ready:'Listos para el saque inicial',paused:'En pausa',breakFor:(t:string)=>`Descanso: ${t}`,full:'Final del partido',over:'Tiempo añadido',nextSub:(t:string)=>`Próximo cambio en ${t}`,subNow:'Hora de hacer los cambios',
  addMin:'+ 1 min',added:(n:number)=>`${n} min añadidos`,goal:'Toca para sumar un gol',minus:'− gol',goalAt:(m:number)=>`${m}′`,
  setup:'Ajustes del partido',game:'Partido',custom:'Personalizado',periods:'Periodos',length:'Minutos cada uno',breakLen:'Descanso (minutos)',subs:'Aviso de cambios',subOff:'No',subEvery:(n:number)=>`Cada ${n} min`,
  homeName:'Equipo local',awayName:'Equipo visitante',sound:'Sonidos (pitido al final y avisos de cambios)',awake:'Mantener la pantalla encendida con el reloj en marcha',reset:'Partido nuevo',confirm:'¿Empezar un partido nuevo? Se borrará el marcador.',
  locked:'Los ajustes se bloquean durante el partido. Toca Partido nuevo para cambiarlos.',saved:'Este partido se guarda en este dispositivo.',aria:'Reloj del partido de fútbol'},
};
type Saved={clock:Clock;names:[string,string];sound:boolean;awake:boolean;preset:string;edited:boolean};
export default function MatchTimer({presets,initialPreset,lang}:{presets:readonly TimerPreset[];initialPreset:string;lang?:'es'}){
 const w=W[lang==='es'?'es':'en'];
 const first=presets.find(p=>p.id===initialPreset)??presets[0];
 const [preset,setPreset]=useState(first.id);
 const [clock,setClock]=useState<Clock>(()=>newClock({periods:first.periods,periodMin:first.periodMin,breakMin:5,subEvery:5}));
 const [names,setNames]=useState<[string,string]>([w.home,w.away]);
 const [edited,setEdited]=useState(false);
 const [sound,setSound]=useState(false);
 const [awake,setAwake]=useState(true);
 const [now,setNow]=useState(0);
 const [flash,setFlash]=useState(0);
 const board=useRef<HTMLElement|null>(null),audio=useRef<AudioContext|null>(null),last=useRef(0),release=useRef<()=>void>(()=>{}),loaded=useRef(false),whistled=useRef(-1);
 /* read the saved game once, after the first paint (the server renders the default) */
 useEffect(()=>{const v=store.get<Saved>(KEY);const c=v?readClock(v.clock):null;
  if(v&&c){setClock(c);setNames([String(v.names?.[0]??w.home).slice(0,24),String(v.names?.[1]??w.away).slice(0,24)]);setSound(!!v.sound);setAwake(v.awake!==false);setEdited(!!v.edited);if(presets.some(p=>p.id===v.preset)||v.preset==='custom')setPreset(v.preset);}
  setNow(Date.now());loaded.current=true;},[]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(loaded.current)store.set(KEY,{clock,names,sound,awake,preset,edited} satisfies Saved);},[clock,names,sound,awake,preset,edited]);
 const live=clock.phase==='running'||clock.phase==='break';
 /* the redraw: only while the clock runs and the page is visible */
 useEffect(()=>{
  if(!live)return;let id=0;
  const tick=()=>setNow(Date.now());
  const on=()=>{window.clearInterval(id);if(document.visibilityState==='visible'){tick();id=window.setInterval(tick,250);}};
  on();document.addEventListener('visibilitychange',on);
  return ()=>{window.clearInterval(id);document.removeEventListener('visibilitychange',on);};
 },[live]);
 /* wake lock while running; asked again when the page comes back */
 useEffect(()=>{
  if(clock.phase!=='running'||!awake)return;let alive=true;
  const get=()=>{void keepAwake().then(r=>{if(alive){release.current();release.current=r;}else r();});};
  get();const vis=()=>{if(document.visibilityState==='visible')get();};document.addEventListener('visibilitychange',vis);
  return ()=>{alive=false;document.removeEventListener('visibilitychange',vis);release.current();release.current=()=>{};};
 },[clock.phase,awake]);
 useEffect(()=>()=>closeAudio(audio.current),[]);
 useEffect(()=>{const el=board.current;if(!flash||!el)return;el.classList.remove(s.flash);void el.offsetWidth;el.classList.add(s.flash);},[flash]);
 /* beeps for the marks the clock passed since the last redraw */
 const played=clock.phase==='running'?elapsed(clock,now):clock.banked;
 useEffect(()=>{
  if(clock.phase!=='running'){last.current=played;return;}
  const from=last.current;last.current=played;if(played<from)return;
  const subs=crossed(subMarks(clock.setup).map(m=>m*MIN),from,played),end=periodLength(clock);
  if(subs.length){setFlash(f=>f+1);if(sound&&audio.current)doubleBeep(audio.current);}
  if(from<end&&played>=end&&whistled.current!==clock.period){whistled.current=clock.period;setFlash(f=>f+1);if(sound&&audio.current)whistle(audio.current);}
 },[played,clock,sound]);
 const ensureAudio=useCallback(()=>{if(sound&&!audio.current)audio.current=makeAudio();else void audio.current?.resume();},[sound]);
 const t=Date.now;
 const onStart=()=>{ensureAudio();if(clock.phase==='break')whistled.current=-1;setClock(c=>start(c,t()));setNow(t());};
 const onPause=()=>{setClock(c=>pause(c,t()));setNow(t());};
 const onEnd=()=>{setClock(c=>endPeriod(c,t()));setNow(t());};
 const onGoal=(team:0|1,d:1|-1=1)=>setClock(c=>goal(c,team,t(),d));
 const onReset=()=>{if(clock.phase!=='ready'&&!window.confirm(w.confirm))return;whistled.current=-1;setClock(c=>newClock(c.setup));};
 const setup=(patch:Partial<Setup>,id?:string)=>{if(clock.phase!=='ready')return;if(id)setPreset(id);setClock(c=>newClock({...c.setup,...patch}));};
 const onPreset=(id:string)=>{const p=presets.find(x=>x.id===id);if(p)setup({periods:p.periods,periodMin:p.periodMin},id);else setPreset('custom');};
 const wd=periodWord(clock.setup.periods),pname=w.periodName(wd,clock.period),last1=clock.period>=clock.setup.periods-1;
 const shown=clock.phase==='running'||clock.phase==='paused'?remaining(clock,clock.phase==='running'?now:0):clock.phase==='ready'?periodLength(clock):0;
 const over=shown<0&&(clock.phase==='running'||clock.phase==='paused');
 const ns=clock.phase==='running'||clock.phase==='paused'?nextSub(clock.setup,played):null;
 const breakMs=clock.phase==='break'&&clock.breakAt?Math.max(0,now-clock.breakAt):0;
 const top=clock.phase==='break'?w.breakFor(mmss(breakMs).replace('+','')):clock.phase==='done'?w.full:pname;
 const under=clock.phase==='ready'?w.ready:clock.phase==='paused'?w.paused:clock.phase==='done'?'':over?w.over:ns!==null?(ns-played<15000&&ns-played>0?w.subNow:w.nextSub(mmss(ns-played))):'';
 const nextName=w.periodName(wd,clock.period+1);
 const goalsOf=(team:0|1)=>clock.events.filter(e=>e.team===team).map(e=>w.goalAt(e.t+1)).join(' ');
 const subOpts=[0,3,4,5,6,7,8,10,12,15];
 const isEx=!edited&&names[0]===w.home&&names[1]===w.away;
 return <div className={s.tool} data-tool="timer">
  <section className={s.board} ref={board} aria-label={w.aria}>
   <div className={s.boardTop}><div aria-live="polite">{top}</div><span>{clock.added[clock.period]?w.added(clock.added[clock.period]):clock.setup.periods>1?`${clock.setup.periods} × ${clock.setup.periodMin} min`:`${clock.setup.periodMin} min`}{isEx&&<> <i className={s.example}>{w.example}</i></>}</span></div>
   <p className={`${s.clock} ${over?s.clockOver:''}`} role="timer" aria-live="off">{mmss(clock.phase==='break'?periodLength({...clock,period:Math.min(clock.period+1,clock.setup.periods-1)}):shown)}</p>
   <p className={s.under} aria-live="polite">{under}</p>
   <div className={s.scores}>
    {([0,1] as const).map(team=><div className={s.scoreCol} key={team}>
     <button type="button" className={s.score} onClick={()=>onGoal(team)} aria-label={`${names[team]}: ${clock.goals[team]}. ${w.goal}`}><span>{names[team]}</span><b>{clock.goals[team]}</b></button>
     <p className={s.goals}>{goalsOf(team)}</p>
     <button type="button" className={s.minus} onClick={()=>onGoal(team,-1)} disabled={clock.goals[team]===0}>{w.minus}</button>
    </div>)}
   </div>
   <div className={s.controls}>
    {clock.phase==='running'?<button type="button" className={s.bigBtn} onClick={onPause}>{w.pause}</button>
     :<button type="button" className={s.bigBtn} onClick={onStart} disabled={clock.phase==='done'}>{clock.phase==='paused'?w.resume:clock.phase==='break'?w.nextStart(nextName):w.start}</button>}
    <button type="button" className={`${s.bigBtn} ${s.ghost}`} onClick={onEnd} disabled={clock.phase==='ready'||clock.phase==='break'||clock.phase==='done'}>{last1?w.endGame:w.end(wd)}</button>
    <button type="button" className={`${s.bigBtn} ${s.ghost}`} onClick={()=>setClock(c=>addTime(c,1))} disabled={clock.phase!=='running'&&clock.phase!=='paused'}>{w.addMin}</button>
    <button type="button" className={`${s.bigBtn} ${s.ghost}`} onClick={onReset}>{w.reset}</button>
   </div>
  </section>
  <section className={s.panel} aria-label={w.setup}>
   <h3>{w.setup}</h3>
   <div className={`${s.grid} ${s.grid4}`}>
    <label className={`${s.label} ${s.wide}`}>{w.game}
     <select className={s.input} value={preset} onChange={e=>onPreset(e.target.value)} disabled={clock.phase!=='ready'}>{presets.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}<option value="custom">{w.custom}</option></select></label>
    <label className={s.label}>{w.periods}<select className={s.input} value={clock.setup.periods} onChange={e=>setup({periods:Number(e.target.value)},'custom')} disabled={clock.phase!=='ready'}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label className={s.label}>{w.length}<select className={s.input} value={clock.setup.periodMin} onChange={e=>setup({periodMin:Number(e.target.value)},'custom')} disabled={clock.phase!=='ready'}>{Array.from({length:60},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label className={s.label}>{w.breakLen}<select className={s.input} value={clock.setup.breakMin} onChange={e=>setup({breakMin:Number(e.target.value)})} disabled={clock.phase!=='ready'}>{[0,2,3,5,10,15].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label className={s.label}>{w.subs}<select className={s.input} value={clock.setup.subEvery} onChange={e=>setup({subEvery:Number(e.target.value)})} disabled={clock.phase!=='ready'}>{subOpts.map(n=><option key={n} value={n}>{n?w.subEvery(n):w.subOff}</option>)}</select></label>
    <label className={s.label}>{w.homeName}<input className={s.input} value={names[0]} maxLength={24} onChange={e=>{setEdited(true);setNames([e.target.value,names[1]]);}}/></label>
    <label className={s.label}>{w.awayName}<input className={s.input} value={names[1]} maxLength={24} onChange={e=>{setEdited(true);setNames([names[0],e.target.value]);}}/></label>
    <label className={`${s.check} ${s.wide}`}><input type="checkbox" checked={sound} onChange={e=>{setSound(e.target.checked);if(e.target.checked&&!audio.current){audio.current=makeAudio();if(audio.current)doubleBeep(audio.current);}}}/>{w.sound}</label>
    <label className={`${s.check} ${s.wide}`}><input type="checkbox" checked={awake} onChange={e=>setAwake(e.target.checked)}/>{w.awake}</label>
   </div>
   <p className={s.hint}>{clock.phase!=='ready'?w.locked:w.saved}</p>
  </section>
 </div>;
}
