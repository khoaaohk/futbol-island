'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {BADGES,EXAMPLE_GAMES,ordered,readSeason,remove,summary,toCsv,upsert,type BadgeId,type Game,type Season} from '@/lib/site/tools/statsTracker';
import {store} from './toolAudio';
import s from './newTools.module.css';
import m from './moreTools.module.css';
/**
 * The youth soccer stats tracker for parents (Nov 22 2026; /tools/youth-soccer-stats-tracker and its Spanish twin). The season
 * is kept in localStorage on this device only (lib/site/tools/statsTracker.ts cleans it on the way in and out); the page shows a
 * labelled example season until the first game is added. The chart is one inline SVG; no timers, no network.
 */
const KEY='fi-stats-v1';
type Metric='goals'|'assists'|'saves'|'minutes';
const W={
 en:{example:'Example season',player:'Player nickname (optional)',playerPh:'For example: Kiki or #7',add:'Add game',edit:'Edit game',date:'Date',opp:'Other team (optional)',goals:'Goals',assists:'Assists',saves:'Saves',minutes:'Minutes played',
  badges:'Effort badges',note:'Note (optional)',save:'Save game',cancel:'Cancel',del:'Delete game',delAsk:'Delete this game?',yes:'Yes, delete',no:'Keep it',
  badge:{'new-skill':'Tried a new skill',helped:'Helped a teammate',attitude:'Great attitude','never-gave-up':'Never gave up',talked:'Talked to teammates','good-sport':'Good sport'} as Record<BadgeId,string>,
  season:'Season so far',games:'Games',perGame:'per game',chart:'Each game',chartOf:(x:string)=>`${x} in each game, oldest first`,top:'Most earned badge',list:'Games',vs:'v',none:'No games yet.',
  csv:'Export CSV',csvHead:['Date','Opponent','Goals','Assists','Saves','Minutes','Badges','Note'],privacy:'Saved on this device only. Nothing is sent anywhere.',savedMsg:'Game saved.',deleted:'Game deleted.',
  less:(x:string)=>`${x} −1`,more:(x:string)=>`${x} +1`,clearAll:'Delete the season',clearAsk:'Delete every game on this device?',cleared:'Season deleted.',file:'soccer-season'},
 es:{example:'Temporada de ejemplo',player:'Apodo del jugador (opcional)',playerPh:'Por ejemplo: Kiki o #7',add:'Añadir partido',edit:'Editar partido',date:'Fecha',opp:'Rival (opcional)',goals:'Goles',assists:'Asistencias',saves:'Paradas',minutes:'Minutos jugados',
  badges:'Insignias de esfuerzo',note:'Nota (opcional)',save:'Guardar partido',cancel:'Cancelar',del:'Borrar partido',delAsk:'¿Borrar este partido?',yes:'Sí, borrar',no:'Conservarlo',
  badge:{'new-skill':'Probó una habilidad nueva',helped:'Ayudó a un compañero',attitude:'Gran actitud','never-gave-up':'Nunca se rindió',talked:'Habló con los compañeros','good-sport':'Buen deportista'} as Record<BadgeId,string>,
  season:'La temporada hasta ahora',games:'Partidos',perGame:'por partido',chart:'Cada partido',chartOf:(x:string)=>`${x} en cada partido, del más antiguo al más reciente`,top:'Insignia más ganada',list:'Partidos',vs:'vs',none:'Aún no hay partidos.',
  csv:'Exportar CSV',csvHead:['Fecha','Rival','Goles','Asistencias','Paradas','Minutos','Insignias','Nota'],privacy:'Se guarda solo en este dispositivo. No se envía nada.',savedMsg:'Partido guardado.',deleted:'Partido borrado.',
  less:(x:string)=>`${x} −1`,more:(x:string)=>`${x} +1`,clearAll:'Borrar la temporada',clearAsk:'¿Borrar todos los partidos de este dispositivo?',cleared:'Temporada borrada.',file:'temporada-futbol'},
};
const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const blank=(id:string,date:string):Game=>({id,date,opponent:'',goals:0,assists:0,saves:0,minutes:30,badges:[],note:''});
function Counter({label,value,set,max,step=1,w}:{label:string;value:number;set:(n:number)=>void;max:number;step?:number;w:typeof W.en}){
 return <div className={m.countBox}><span>{label}</span><div className={m.stepper}>
  <button type="button" className={s.x} aria-label={w.less(label)} disabled={value<=0} onClick={()=>set(Math.max(0,value-step))}>−</button>
  <output aria-live="polite">{value}</output>
  <button type="button" className={s.x} aria-label={w.more(label)} disabled={value>=max} onClick={()=>set(Math.min(max,value+step))}>+</button></div></div>;
}
export default function StatsTracker({lang}:{lang?:'es'}){
 const L=lang==='es'?'es':'en',w=W[L];
 const [season,setSeason]=useState<Season>({player:'',games:[...EXAMPLE_GAMES]}),[isEx,setIsEx]=useState(true);
 const [form,setForm]=useState<Game|null>(null),[metric,setMetric]=useState<Metric>('goals'),[status,setStatus]=useState(''),[ask,setAsk]=useState<string|null>(null);
 const loaded=useRef(false);
 useEffect(()=>{const raw=store.get<unknown>(KEY);if(raw){setSeason(readSeason(raw));setIsEx(false);}loaded.current=true;},[]);
 useEffect(()=>{if(loaded.current&&!isEx)store.set(KEY,season);},[season,isEx]);
 const games=useMemo(()=>ordered(season.games),[season.games]),sm=useMemo(()=>summary(season.games),[season.games]);
 const real=isEx?{...season,games:[]}:season;
 const open=(g?:Game)=>{setForm(g?{...g}:blank(`g${Date.now().toString(36)}`,todayIso()));setStatus('');setAsk(null);};
 const commit=()=>{if(!form)return;setSeason(upsert(real,form));setIsEx(false);setForm(null);setStatus(w.savedMsg);};
 const csv=()=>{const blob=new Blob(['﻿'+toCsv(games,w.csvHead,b=>w.badge[b])],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`${w.file}-${todayIso()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
 const max=Math.max(1,...games.map(g=>g[metric])),bw=games.length?Math.min(64,Math.floor(600/games.length)-8):40,CH=180;
 const labels:Record<Metric,string>={goals:w.goals,assists:w.assists,saves:w.saves,minutes:w.minutes};
 return <div className={s.tool} data-tool="">
  <label className={s.label}>{w.player}<input className={s.input} value={season.player} maxLength={60} placeholder={w.playerPh} autoComplete="off" onChange={e=>{setSeason({...real,player:e.target.value.slice(0,60)});setIsEx(false);}}/></label>
  {form?<div className={s.panel} aria-labelledby="st-form"><h3 id="st-form">{season.games.some(g=>g.id===form.id)&&!isEx?w.edit:w.add}</h3>
   <div className={s.grid}>
    <label className={s.label}>{w.date}<input className={s.input} type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value||form.date})}/></label>
    <label className={s.label}>{w.opp}<input className={s.input} value={form.opponent} maxLength={60} onChange={e=>setForm({...form,opponent:e.target.value})}/></label></div>
   <div className={m.counts}>
    <Counter label={w.goals} value={form.goals} max={50} set={n=>setForm({...form,goals:n})} w={w}/>
    <Counter label={w.assists} value={form.assists} max={50} set={n=>setForm({...form,assists:n})} w={w}/>
    <Counter label={w.saves} value={form.saves} max={99} set={n=>setForm({...form,saves:n})} w={w}/>
    <Counter label={w.minutes} value={form.minutes} max={180} step={5} set={n=>setForm({...form,minutes:n})} w={w}/></div>
   <div className={m.field}><span className={s.label} id="st-badges">{w.badges}</span>
    <div className={m.chipSet} role="group" aria-labelledby="st-badges">{BADGES.map(b=><button key={b} type="button" aria-pressed={form.badges.includes(b)} onClick={()=>setForm({...form,badges:form.badges.includes(b)?form.badges.filter(x=>x!==b):[...form.badges,b]})}>{w.badge[b]}</button>)}</div></div>
   <label className={s.label}>{w.note}<input className={s.input} value={form.note} maxLength={200} onChange={e=>setForm({...form,note:e.target.value})}/></label>
   <div className={s.actions}><button type="button" className={s.btn} onClick={commit}>{w.save}</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setForm(null)}>{w.cancel}</button></div>
  </div>:<button type="button" className={`${s.bigBtn} ${m.full} ${m.onLight}`} onClick={()=>open()}>{w.add}</button>}
  <p className={s.status} role="status">{status}</p>
  <section className={m.planCard} aria-labelledby="st-season">
   <div className={m.resultsHead}><h3 id="st-season">{season.player?`${season.player}: `:''}{w.season}</h3>{isEx&&<span className={s.example}>{w.example}</span>}</div>
   <div className={m.tiles}>
    <div><b>{sm.games}</b><span>{w.games}</span></div><div><b>{sm.goals}</b><span>{w.goals}</span></div><div><b>{sm.assists}</b><span>{w.assists}</span></div>
    <div><b>{sm.saves}</b><span>{w.saves}</span></div><div><b>{sm.minutes}</b><span>{w.minutes}</span><small>{sm.perGame.minutes} {w.perGame}</small></div>
    <div><b>{sm.topBadge?sm.badges[sm.topBadge]:0}</b><span>{sm.topBadge?w.badge[sm.topBadge]:w.top}</span></div>
   </div>
   <ul className={m.badgeCounts}>{BADGES.filter(b=>sm.badges[b]>0).map(b=><li key={b}><span>{w.badge[b]}</span><b>{sm.badges[b]}</b></li>)}</ul>
   <h3>{w.chart}</h3>
   <div className={s.seg} role="group" aria-label={w.chart}>{(['goals','assists','saves','minutes'] as const).map(x=><button key={x} type="button" aria-pressed={metric===x} onClick={()=>setMetric(x)}>{labels[x]}</button>)}</div>
   {games.length?<svg viewBox={`0 0 ${Math.max(320,games.length*(bw+8)+16)} ${CH+44}`} className={m.chart} role="img" aria-labelledby="st-ct st-cd">
    <title id="st-ct">{w.chartOf(labels[metric])}</title><desc id="st-cd">{w.chartOf(labels[metric])+": "+games.map(g=>`${g.date}${g.opponent?` ${w.vs} ${g.opponent}`:''}: ${g[metric]} ${labels[metric].toLowerCase()}`).join('; ')}</desc>
    <line x1="8" x2={Math.max(320,games.length*(bw+8)+16)-8} y1={CH+4} y2={CH+4} stroke="#14221d" strokeOpacity=".2" strokeWidth="2"/>
    {games.map((g,i)=>{const h=Math.round(g[metric]/max*(CH-30)),x=16+i*(bw+8);return <g key={g.id}>
     <rect x={x} y={CH+4-Math.max(h,g[metric]?4:0)} width={bw} height={Math.max(h,g[metric]?4:0)} rx="6" fill="#1f6f8b"/>
     <text x={x+bw/2} y={CH-Math.max(h,4)-4} textAnchor="middle" fontSize="18" fontWeight="800" fill="#14221d">{g[metric]}</text>
     <text x={x+bw/2} y={CH+30} textAnchor="middle" fontSize="14" fill="#14221d" fillOpacity=".7">{g.date.slice(5).replace('-','/')}</text></g>;})}
   </svg>:<p className={s.hint}>{w.none}</p>}
  </section>
  <div className={s.panel}>
   <h3>{w.list}</h3>
   {games.length?<ul className={m.gameList}>{[...games].reverse().map(g=><li key={g.id}>
    <button type="button" className={m.gameBtn} onClick={()=>open(g)} disabled={isEx}>
     <span className={m.gameTop}><b>{g.date}</b>{g.opponent&&<span>{w.vs} {g.opponent}</span>}</span>
     <span className={m.gameNums}>{w.goals} {g.goals} · {w.assists} {g.assists} · {w.saves} {g.saves} · {g.minutes} min</span>
     {g.badges.length>0&&<span className={m.gameBadges}>{g.badges.map(b=>w.badge[b]).join(' · ')}</span>}</button>
    {!isEx&&(ask===g.id?<div className={m.confirm} role="alertdialog" aria-label={w.delAsk}><p>{w.delAsk}</p><div className={s.actions}>
     <button type="button" className={s.btn} onClick={()=>{setSeason(remove(season,g.id));setAsk(null);setStatus(w.deleted);}}>{w.yes}</button>
     <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setAsk(null)}>{w.no}</button></div></div>
     :<button type="button" className={s.x} aria-label={`${w.del}: ${g.date}`} onClick={()=>setAsk(g.id)}>×</button>)}
   </li>)}</ul>:<p className={s.hint}>{w.none}</p>}
   <div className={s.actions}><button type="button" className={s.btn} onClick={csv} disabled={!games.length}>{w.csv}</button>
    {!isEx&&season.games.length>0&&ask!=='all'&&<button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setAsk('all')}>{w.clearAll}</button>}</div>
   {ask==='all'&&<div className={m.confirm} role="alertdialog" aria-label={w.clearAsk}><p>{w.clearAsk}</p><div className={s.actions}>
    <button type="button" className={s.btn} onClick={()=>{setSeason({...season,games:[]});setAsk(null);setStatus(w.cleared);}}>{w.yes}</button>
    <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>setAsk(null)}>{w.no}</button></div></div>}
   <p className={s.hint}>{w.privacy}</p>
  </div>
 </div>;
}
