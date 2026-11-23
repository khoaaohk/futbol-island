'use client';
import {useEffect,useRef,useState} from 'react';
import {LEVELS,MAX_TOUCHES,best,dayNumber,exampleState,headAllowed,level,logAttempt,readState,streak,undo,variationsFor,week,type AgeBand,type JuggleState,type Variation} from '@/lib/site/tools/juggling';
import {VARIATION_NAME} from '@/lib/site/tools/moreToolTables';
import {store} from './toolAudio';
import s from './newTools.module.css';
import m from './moreTools.module.css';
/**
 * The juggling challenge tracker (Nov 22 2026; /tools/soccer-juggling-challenge and its Spanish twin). The rules are pure
 * (lib/site/tools/juggling.ts); tries, bests and the streak stay in localStorage on this device. The page shows a labelled
 * example until the first try is saved. The celebration is one short CSS flash (none with reduced motion); no timers run.
 */
const KEY='fi-juggling-v1';
const SERVER_DAY=dayNumber(2026,11,22);
const today=()=>{const d=new Date();return dayNumber(d.getFullYear(),d.getMonth()+1,d.getDate());};
const TIPS:Record<'en'|'es',Record<Variation,readonly string[]>>={
 en:{feet:['Let the ball bounce between kicks. Kick, bounce, kick, then catch.','Lock your ankle and point your toes a little up, so the ball comes straight back.','Keep the kicks below your waist. Small touches are easier to control.','Drop the bounce: let the ball fall straight onto your foot.','Swap feet every touch: right, left, right, left.','Stay on your toes and bend your standing knee. Balance does half the work.','Watch the bottom of the ball, not your foot.','Relax your shoulders and breathe. Long runs need calm touches.','Mix in a thigh touch when the ball goes high, then back to the feet.'],
  weak:['Start with a bounce between every touch, using only your weaker foot.','Touch the middle of the ball with your laces. A soft, flat foot.','Keep it low: no higher than your knee.','Try three weak-foot touches, then one with the strong foot to rescue it.','Count out loud. Rhythm helps the weaker foot more than power.','Weak-foot only, no bounces. This is a big one: well done for trying.'],
  thigh:['Lift your knee until your thigh is flat, like a table.','Meet the ball in the middle of the thigh, not near the knee.','Push up gently: the ball should rise only to your chest.','Swap thighs: left, right, left, right.','Keep your arms out a little for balance.','Thigh only, no feet. Strong legs and a soft touch.'],
  head:['Use the flat part of your forehead, eyes open, with a light ball. Count every header towards your weekly limit.','Small taps, just above your head. Stop when your neck feels tired.','Ten in a row is plenty. Go back to feet and thighs for the rest of the practice.']},
 es:{feet:['Deja que el balón bote entre toques. Toque, bote, toque y atrapa.','Tobillo firme y punta del pie un poco hacia arriba, para que el balón suba recto.','Toques por debajo de la cintura. Los toques pequeños se controlan mejor.','Quita el bote: deja caer el balón directo sobre el pie.','Cambia de pie en cada toque: derecho, izquierdo, derecho, izquierdo.','Ponte de puntillas y dobla la rodilla de apoyo. El equilibrio hace la mitad del trabajo.','Mira la parte de abajo del balón, no tu pie.','Relaja los hombros y respira. Las series largas necesitan toques tranquilos.','Si el balón sube mucho, mete un toque de muslo y vuelve a los pies.'],
  weak:['Empieza con un bote entre cada toque, solo con el pie malo.','Toca el centro del balón con el empeine. Pie suave y plano.','Bajito: no más alto que la rodilla.','Prueba tres toques con el pie malo y uno con el bueno para rescatarlo.','Cuenta en voz alta. El ritmo ayuda al pie malo más que la fuerza.','Solo pie malo y sin botes. Es un gran reto: bien por intentarlo.'],
  thigh:['Sube la rodilla hasta que el muslo quede plano, como una mesa.','Recibe el balón en el centro del muslo, no cerca de la rodilla.','Empuja suave: el balón solo debe subir hasta el pecho.','Cambia de muslo: izquierdo, derecho, izquierdo, derecho.','Abre un poco los brazos para mantener el equilibrio.','Solo muslos, sin pies. Piernas fuertes y toque suave.'],
  head:['Usa la parte plana de la frente, con los ojos abiertos y un balón ligero. Cuenta cada cabezazo en tu límite semanal.','Toques pequeños, justo por encima de la cabeza. Para cuando el cuello se canse.','Diez seguidos es suficiente. Vuelve a pies y muslos el resto de la práctica.']},
};
const W={
 en:{example:'Example: a week of practice',age:'Age',ages:{'10-under':'10 or under','11-12':'11 or 12','13-up':'13 and up'} as Record<AgeBand,string>,challenge:'Challenge',best:'Personal best',next:'Next level',done:'Every level done!',
  touches:'touches',tip:'Tip for this level',count:'Touches in this try',less:'One fewer',more:'One more',save:'Save try',newBest:(n:number)=>`New best: ${n} touches!`,passed:(n:number)=>`Level ${n} done!`,saved:(n:number)=>`Saved: ${n} touches.`,
  streak:'Streak',days:(n:number)=>n===1?'1 day':`${n} days`,week:'This week',goal:'Weekly goal',goalDays:(n:number)=>n===1?'1 day a week':`${n} days a week`,met:'Goal reached this week!',of:(a:number,b:number)=>`${a} of ${b} days`,
  recent:'Recent tries',undo:'Undo last try',none:'No tries yet. Juggle, count, and save your first one.',level:(d:number,o:number)=>`Level ${d} of ${o}`,headNote:'Head juggling is only for players aged 11 and over, inside the weekly heading limits.',
  privacy:'Saved on this device only.',cheer:'New personal best!',game:'Play Keepy-Uppy Beat',reset:'Start over',resetAsk:'Delete every try on this device?',yes:'Yes, delete',no:'Keep them'},
 es:{example:'Ejemplo: una semana de práctica',age:'Edad',ages:{'10-under':'10 o menos','11-12':'11 o 12','13-up':'13 o más'} as Record<AgeBand,string>,challenge:'Reto',best:'Récord personal',next:'Siguiente nivel',done:'¡Todos los niveles hechos!',
  touches:'toques',tip:'Consejo para este nivel',count:'Toques en este intento',less:'Uno menos',more:'Uno más',save:'Guardar intento',newBest:(n:number)=>`¡Nuevo récord: ${n} toques!`,passed:(n:number)=>`¡Nivel ${n} superado!`,saved:(n:number)=>`Guardado: ${n} toques.`,
  streak:'Racha',days:(n:number)=>n===1?'1 día':`${n} días`,week:'Esta semana',goal:'Meta semanal',goalDays:(n:number)=>n===1?'1 día por semana':`${n} días por semana`,met:'¡Meta de la semana cumplida!',of:(a:number,b:number)=>`${a} de ${b} días`,
  recent:'Últimos intentos',undo:'Deshacer el último',none:'Aún no hay intentos. Haz dominadas, cuenta y guarda el primero.',level:(d:number,o:number)=>`Nivel ${d} de ${o}`,headNote:'Las dominadas de cabeza son solo para jugadores de 11 años o más, dentro de los límites semanales.',
  privacy:'Se guarda solo en este dispositivo.',cheer:'¡Nuevo récord personal!',game:'Jugar a Keepy-Uppy Beat',reset:'Empezar de cero',resetAsk:'¿Borrar todos los intentos de este dispositivo?',yes:'Sí, borrar',no:'Conservarlos'},
};
export default function JugglingTracker({lang,gamePath}:{lang?:'es';gamePath?:string}){
 const L=lang==='es'?'es':'en',w=W[L];
 const [st,setSt]=useState<JuggleState>(()=>exampleState(SERVER_DAY)),[isEx,setIsEx]=useState(true),[day,setDay]=useState(SERVER_DAY);
 const [v,setV]=useState<Variation>('feet'),[n,setN]=useState(10),[msg,setMsg]=useState(''),[party,setParty]=useState(0),[ask,setAsk]=useState(false);
 const loaded=useRef(false);
 useEffect(()=>{const t=today();setDay(t);const raw=store.get<unknown>(KEY);if(raw){setSt(readState(raw));setIsEx(false);}else setSt(exampleState(t));loaded.current=true;},[]);
 useEffect(()=>{if(loaded.current&&!isEx)store.set(KEY,st);},[st,isEx]);
 const vs=variationsFor(st.age),cur=vs.includes(v)?v:'feet',b=best(st,cur),lv=level(cur,b),tips=TIPS[L][cur],tip=tips[Math.min(lv.done,tips.length-1)];
 const save=()=>{const t=today();setDay(t);const from=isEx?{...st,log:[]}:st,r=logAttempt(from,{day:t,v:cur,n});setSt(r.state);setIsEx(false);
  setMsg(r.newBest?(r.passed?`${w.newBest(n)} ${w.passed(r.passed)}`:w.newBest(n)):w.saved(n));if(r.newBest)setParty(x=>x+1);};
 const setAge=(a:AgeBand)=>{setSt(x=>({...x,age:a}));if(!headAllowed(a)&&v==='head')setV('feet');};
 const wk=week(st,day),stk=streak(st,day),recent=st.log.slice(-5).reverse();
 const clamp=(x:number)=>Math.max(0,Math.min(MAX_TOUCHES,Math.round(x)||0));
 return <div className={s.tool} data-tool="">
  <div className={m.field}><span className={s.label} id="jg-age">{w.age}</span>
   <div className={s.seg} role="group" aria-labelledby="jg-age">{(['10-under','11-12','13-up'] as const).map(a=><button key={a} type="button" aria-pressed={st.age===a} onClick={()=>setAge(a)}>{w.ages[a]}</button>)}</div></div>
  <div className={m.field}><span className={s.label} id="jg-ch">{w.challenge}</span>
   <div className={m.chipSet} role="group" aria-labelledby="jg-ch">{vs.map(x=><button key={x} type="button" aria-pressed={cur===x} onClick={()=>{setV(x);setMsg('');}}>{VARIATION_NAME[L][x]}</button>)}</div>
   {cur==='head'&&<p className={s.hint}>{w.headNote}</p>}</div>
  <div className={`${s.board} ${party?m.party:''}`} key={party}>
   {party>0&&<p className={m.cheer} role="presentation">{w.cheer}</p>}
   <div className={s.boardTop}><span>{VARIATION_NAME[L][cur]}</span>{isEx&&<span className={s.example}>{w.example}</span>}</div>
   <div className={s.level}>
    <div><b>{b}</b><span>{w.best}</span></div>
    <div><b>{lv.next??'★'}</b><span>{lv.next?w.next:w.done}</span></div>
   </div>
   <svg className={m.levelBar} viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="4" rx="2"/><rect width={100*lv.done/lv.of} height="4" rx="2"/></svg>
   <p className={s.under}>{w.level(lv.done,lv.of)} · {LEVELS[cur].join(' · ')}</p>
   <p className={m.tip}><b>{w.tip}:</b> {tip}</p>
  </div>
  <div className={s.panel}>
   <label className={s.label} htmlFor="jg-n">{w.count}</label>
   <div className={m.counter}>
    <button type="button" className={m.round} aria-label={w.less} onClick={()=>setN(x=>clamp(x-1))}>−</button>
    <input id="jg-n" className={m.bigInput} inputMode="numeric" pattern="[0-9]*" value={n} onChange={e=>setN(clamp(Number(e.target.value.replace(/\D/g,''))))}/>
    <button type="button" className={m.round} aria-label={w.more} onClick={()=>setN(x=>clamp(x+1))}>+</button>
   </div>
   <button type="button" className={`${s.bigBtn} ${m.full} ${m.onLight}`} onClick={save}>{w.save}</button>
   <p className={s.status} role="status" aria-live="polite">{msg}</p>
  </div>
  <div className={m.stats3}>
   <div><span>{w.streak}</span><b>{w.days(stk)}</b></div>
   <div><span>{w.week}</span><b>{w.of(wk.days,wk.goal)}</b>{wk.met&&<small>{w.met}</small>}</div>
   <div><span>{w.goal}</span><div className={m.stepper}><button type="button" className={s.x} aria-label={`${w.goal} −1`} disabled={st.weeklyGoal<=1} onClick={()=>setSt(x=>({...x,weeklyGoal:Math.max(1,x.weeklyGoal-1)}))}>−</button>
    <output>{st.weeklyGoal}</output><button type="button" className={s.x} aria-label={`${w.goal} +1`} disabled={st.weeklyGoal>=7} onClick={()=>setSt(x=>({...x,weeklyGoal:Math.min(7,x.weeklyGoal+1)}))}>+</button></div><small>{w.goalDays(st.weeklyGoal)}</small></div>
  </div>
  <div className={s.panel}>
   <h3>{w.recent}</h3>
   {recent.length?<ul className={s.results}>{recent.map((a,i)=><li key={i}><span>{VARIATION_NAME[L][a.v]}</span><b>{a.n}</b><small>{a.day===day?(L==='es'?'hoy':'today'):L==='es'?`hace ${day-a.day} d`:`${day-a.day} d ago`}</small></li>)}</ul>:<p className={s.hint}>{w.none}</p>}
   <div className={s.actions}>{!isEx&&st.log.length>0&&<button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>{setSt(undo(st));setMsg('');}}>{w.undo}</button>}
    {!isEx&&!ask&&st.log.length>0&&<button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setAsk(true)}>{w.reset}</button>}
    {gamePath&&<a className={`${s.btn} ${m.linkBtn}`} href={gamePath}>{w.game}</a>}</div>
   {ask&&<div className={m.confirm} role="alertdialog" aria-label={w.resetAsk}><p>{w.resetAsk}</p><div className={s.actions}>
    <button type="button" className={s.btn} onClick={()=>{store.del(KEY);setSt({...exampleState(day),log:[]});setIsEx(false);setAsk(false);setMsg('');}}>{w.yes}</button>
    <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setAsk(false)}>{w.no}</button></div></div>}
   <p className={s.hint}>{w.privacy}</p>
  </div>
 </div>;
}
