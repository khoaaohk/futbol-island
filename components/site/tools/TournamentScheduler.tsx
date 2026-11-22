'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {clock,makeSchedule,MAX_FIELDS,MAX_TEAMS,parseClock,parseTeams,standings,type Score} from '@/lib/site/tools/roundRobin';
import {store} from './toolAudio';
import s from './newTools.module.css';
/**
 * The round-robin tournament schedule maker (Nov 22 2026; /tools/soccer-tournament-schedule-maker and its Spanish twin). The
 * schedule is a pure function (lib/site/tools/roundRobin.ts) run when an input changes; no timers, no network. Team names and
 * scores stay in this component and in localStorage on this device. The server renders the example schedule, so it is real
 * content without JavaScript.
 */
const KEY='fi-tournament-v1';
const W={
 en:{example:['Lions','Tigers','Sharks','Eagles','Wolves','Bears'],exampleTag:'Example teams: replace them with yours',teams:'Teams, one per line',fields:'Fields',game:'Game length (minutes)',gap:'Break between games',start:'First kick-off',
  rounds:'Each pair plays',once:'Once',twice:'Twice (home and away)',schedule:'Schedule',field:(n:number)=>`Field ${n}`,rest:(t:string)=>`Resting: ${t}`,vs:'v',
  summary:(g:number,sl:number,end:string)=>`${g} games in ${sl} time slots, finishing at ${end}.`,few:'Type at least two teams.',table:'Standings',
  head:['#','Team','P','W','D','L','GF','GA','GD','Pts'],headLong:['Position','Team','Played','Won','Drawn','Lost','Goals for','Goals against','Goal difference','Points'],
  print:'Print',copy:'Copy as text',clear:'Clear scores',copied:'Copied. Paste it into your team chat.',noCopy:'Could not copy; select the text and copy it.',cleared:'Scores cleared.',
  score:(a:string,b:string)=>`Score of ${a} against ${b}`,goalsOf:(t:string)=>`Goals for ${t}`,max:`Up to ${MAX_TEAMS} teams.`,saved:'Your teams and scores are saved on this device only.'},
 es:{example:['Leones','Tigres','Tiburones','Águilas','Lobos','Osos'],exampleTag:'Equipos de ejemplo: cámbialos por los tuyos',teams:'Equipos, uno por línea',fields:'Canchas',game:'Duración de cada partido (minutos)',gap:'Descanso entre partidos',start:'Primer saque inicial',
  rounds:'Cada pareja juega',once:'Una vez',twice:'Dos veces (ida y vuelta)',schedule:'Calendario',field:(n:number)=>`Cancha ${n}`,rest:(t:string)=>`Descansan: ${t}`,vs:'vs',
  summary:(g:number,sl:number,end:string)=>`${g} partidos en ${sl} turnos; termina a las ${end}.`,few:'Escribe al menos dos equipos.',table:'Clasificación',
  head:['#','Equipo','PJ','G','E','P','GF','GC','DG','Pts'],headLong:['Posición','Equipo','Jugados','Ganados','Empatados','Perdidos','Goles a favor','Goles en contra','Diferencia de goles','Puntos'],
  print:'Imprimir',copy:'Copiar como texto',clear:'Borrar resultados',copied:'Copiado. Pégalo en el chat del equipo.',noCopy:'No se pudo copiar; selecciona el texto y cópialo.',cleared:'Resultados borrados.',
  score:(a:string,b:string)=>`Resultado de ${a} contra ${b}`,goalsOf:(t:string)=>`Goles de ${t}`,max:`Hasta ${MAX_TEAMS} equipos.`,saved:'Tus equipos y resultados se guardan solo en este dispositivo.'},
};
type Saved={text:string;fields:number;matchMin:number;breakMin:number;start:string;double:boolean;scores:Record<string,Score>};
export default function TournamentScheduler({lang}:{lang?:'es'}){
 const w=W[lang==='es'?'es':'en'];
 const [text,setText]=useState(w.example.join('\n'));
 const [fields,setFields]=useState(2),[matchMin,setMatchMin]=useState(12),[breakMin,setBreakMin]=useState(3),[startAt,setStartAt]=useState('09:00'),[double,setDouble]=useState(false);
 const [scores,setScores]=useState<Record<string,Score>>({});
 const [status,setStatus]=useState('');
 const loaded=useRef(false);
 useEffect(()=>{const v=store.get<Saved>(KEY);
  if(v&&typeof v.text==='string'){setText(v.text.slice(0,800));setFields(Math.min(MAX_FIELDS,Math.max(1,Number(v.fields)||2)));setMatchMin(Number(v.matchMin)||12);setBreakMin(Number(v.breakMin)||0);
   setStartAt(parseClock(String(v.start))!==null?String(v.start):'09:00');setDouble(!!v.double);setScores(v.scores&&typeof v.scores==='object'?v.scores:{});}
  loaded.current=true;},[]);
 useEffect(()=>{if(loaded.current)store.set(KEY,{text,fields,matchMin,breakMin,start:startAt,double,scores} satisfies Saved);},[text,fields,matchMin,breakMin,startAt,double,scores]);
 const teams=useMemo(()=>parseTeams(text),[text]);
 const sched=useMemo(()=>makeSchedule({teams,fields,matchMin,breakMin,startMin:parseClock(startAt)??540,double}),[teams,fields,matchMin,breakMin,startAt,double]);
 const games=useMemo(()=>sched.slots.flatMap(x=>x.games),[sched]);
 const table=useMemo(()=>standings(sched.teams,games,scores),[sched,games,scores]);
 const isExample=text===w.example.join('\n');
 const setGoal=(id:string,side:0|1,v:string)=>{const n=v===''?NaN:Math.max(0,Math.min(99,Math.floor(Number(v))));setScores(sc=>{const cur=sc[id]??[NaN,NaN];const next:Score=[cur[0],cur[1]];next[side]=n;
  const out={...sc};if(Number.isNaN(next[0])&&Number.isNaN(next[1]))delete out[id];else out[id]=next;return out;});};
 const val=(id:string,side:0|1)=>{const x=scores[id]?.[side];return x===undefined||x===null||Number.isNaN(x)?'':String(x);};
 const name=(i:number)=>sched.teams[i]??'';
 const asText=()=>[...sched.slots.map(sl=>`${clock(sl.start)}  ${sl.games.map(g=>{const sc=scores[g.id];const r=sc&&Number.isFinite(sc[0])&&Number.isFinite(sc[1])?` ${sc[0]}-${sc[1]} `:` ${w.vs} `;return `${w.field(g.field)}: ${name(g.a)}${r}${name(g.b)}`;}).join(' | ')}`),'',
  `${w.table}:`,...table.map((r,i)=>`${i+1}. ${r.name}  ${r.pts} (${r.w}-${r.d}-${r.l}, ${r.gd>0?'+':''}${r.gd})`)].join('\n');
 const copy=async()=>{try{await navigator.clipboard.writeText(asText());setStatus(w.copied);}catch{setStatus(w.noCopy);}};
 const num=(v:number,set:(n:number)=>void,opts:number[])=><select className={s.input} value={v} onChange={e=>set(Number(e.target.value))}>{opts.map(n=><option key={n} value={n}>{n}</option>)}</select>;
 return <div className={s.tool} data-tool="schedule">
  <section className={`${s.panel} ${s.noPrint}`} aria-label={w.teams}>
   <div className={`${s.grid} ${s.grid4}`}>
    <label className={`${s.label} ${s.wide}`}>{w.teams}{isExample&&<span className={`${s.example} ${s.start}`}>{w.exampleTag}</span>}
     <textarea className={s.input} value={text} onChange={e=>setText(e.target.value.slice(0,800))} rows={6} spellCheck={false} aria-describedby="rr-max"/></label>
    <p className={`${s.hint} ${s.wide}`} id="rr-max">{w.max} {w.saved}</p>
    <label className={s.label}>{w.fields}{num(fields,setFields,Array.from({length:MAX_FIELDS},(_,i)=>i+1))}</label>
    <label className={s.label}>{w.game}{num(matchMin,setMatchMin,[5,6,7,8,10,12,15,20,25,30,40])}</label>
    <label className={s.label}>{w.gap}{num(breakMin,setBreakMin,[0,2,3,5,10,15])}</label>
    <label className={s.label}>{w.start}<input className={s.input} type="time" value={startAt} onChange={e=>setStartAt(e.target.value||'09:00')}/></label>
    <div className={`${s.label} ${s.wide}`} role="group" aria-label={w.rounds}>{w.rounds}<div className={s.seg}><button type="button" aria-pressed={!double} onClick={()=>setDouble(false)}>{w.once}</button><button type="button" aria-pressed={double} onClick={()=>setDouble(true)}>{w.twice}</button></div></div>
   </div>
  </section>
  <section className={s.panel} aria-labelledby="rr-schedule">
   <h3 id="rr-schedule">{w.schedule}</h3>
   {teams.length<2?<p className={s.hint}>{w.few}</p>:<>
    <p className={s.summaryLine} data-games={games.length}>{w.summary(games.length,sched.slots.length,clock(sched.endMin))}</p>
    <ol className={s.slots}>{sched.slots.map((sl,i)=><li className={s.slot} key={i}>
     <div className={s.slotHead}><span>{clock(sl.start)}–{clock(sl.end)}</span></div>
     {sl.games.map(g=><div className={s.game} key={g.id} role="group" aria-label={w.score(name(g.a),name(g.b))}>
      <span className={s.field}>{w.field(g.field)}</span>
      <span className={s.team}>{name(g.a)}</span>
      <span className={s.goalsIn}><input inputMode="numeric" type="number" min={0} max={99} aria-label={w.goalsOf(name(g.a))} value={val(g.id,0)} onChange={e=>setGoal(g.id,0,e.target.value)}/>–<input inputMode="numeric" type="number" min={0} max={99} aria-label={w.goalsOf(name(g.b))} value={val(g.id,1)} onChange={e=>setGoal(g.id,1,e.target.value)}/></span>
      <span className={s.team}>{name(g.b)}</span>
     </div>)}
     {sl.resting.length>0&&<p className={s.rest}>{w.rest(sl.resting.map(name).join(', '))}</p>}
    </li>)}</ol>
   </>}
  </section>
  {teams.length>=2&&<section className={s.panel} aria-labelledby="rr-table">
   <h3 id="rr-table">{w.table}</h3>
   <div className={s.tableWrap}><table className={s.table} data-standings="">
    <thead><tr>{w.head.map((h,i)=><th key={h} scope="col"><abbr title={w.headLong[i]} className={s.abbr}>{h}</abbr></th>)}</tr></thead>
    <tbody>{table.map((r,i)=><tr key={r.team}><td>{i+1}</td><td>{r.name}</td><td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd>0?`+${r.gd}`:r.gd}</td><td>{r.pts}</td></tr>)}</tbody>
   </table></div>
   <div className={`${s.actions} ${s.noPrint}`}><button type="button" className={s.btn} onClick={()=>window.print()}>{w.print}</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={copy}>{w.copy}</button>
    <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>{setScores({});setStatus(w.cleared);}}>{w.clear}</button></div>
   <p className={`${s.status} ${s.noPrint}`} aria-live="polite">{status}</p>
  </section>}
 </div>;
}
