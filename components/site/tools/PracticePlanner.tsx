'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {AGE_LENGTH,DEFAULT_PLAN,FOCUSES,MAX_PLAYERS,MIN_PLAYERS,PLAN_AGES,PLAN_LENGTHS,decodePlan,encodePlan,groups,makePlan,mmss,type BlockKind,type CatalogDrill,type Focus,type PlanOptions} from '@/lib/site/tools/practicePlan';
import s from './newTools.module.css';
import m from './moreTools.module.css';
/**
 * The practice plan generator (Nov 22 2026; /tools/soccer-practice-plan-generator and its Spanish twin). The plan is a pure
 * function of the options (lib/site/tools/practicePlan.ts) over the site's drills (passed in by the page), so the server renders
 * the example plan and the browser keeps the options in the URL (replaceState, no reload): a copied link opens the same plan.
 * No storage, no timers.
 */
const W={
 en:{example:'Example plan',age:'Age group',length:'Practice length',min:'min',players:'Players',focus:'Focus',
  focuses:{passing:'Passing',shooting:'Shooting',dribbling:'Dribbling',defending:'Defending',goalkeeping:'Goalkeeping',fun:'Fun, all-round'} as Record<Focus,string>,
  kinds:{warm:'Warm-up',drill:'Drill',water:'Water break',game:'Small-sided game',cool:'Cool-down'} as Record<BlockKind,string>,
  water:'Drinks, shade, and one question: what worked?',cool:'Easy touches with a ball each, a gentle stretch, and ask each player one thing they learned.',
  swap:'Swap',swapOf:(n:string)=>`Swap ${n} for another drill`,newPlan:'New plan',print:'Print',share:'Share link',copied:'Link copied. Paste it to another coach.',noCopy:'Could not copy; copy the address from the address bar.',
  plan:(a:string,mins:number,f:string)=>`${a} · ${mins} minutes · ${f}`,
  long:(a:string,lo:number,hi:number)=>`Long for ${a}: US Youth Soccer suggests ${lo===hi?lo:`${lo} to ${hi}`} minutes. Keep the game long and the drills short.`,
  short:(a:string,lo:number)=>`Short for ${a}: about ${lo} minutes is usual. That is fine for a busy week.`,
  gk:'Goalkeeping drills start at U10 (no goalkeepers in 4v4), so this plan uses fun ball games instead.',
  game:(g:ReturnType<typeof groups>)=>`${g.games===1?'One game':`${g.games} games side by side`} of ${g.perSide}v${g.perSide}${g.spare?`; ${g.spare===1?'the extra player joins':`the ${g.spare} extra players join`} a team or rotate in`:''}.`,
  open:'Open the drill'},
 es:{example:'Plan de ejemplo',age:'Categoría',length:'Duración',min:'min',players:'Jugadores',focus:'Objetivo',
  focuses:{passing:'Pase',shooting:'Tiro',dribbling:'Regate',defending:'Defensa',goalkeeping:'Porteros',fun:'Diversión, de todo'} as Record<Focus,string>,
  kinds:{warm:'Calentamiento',drill:'Ejercicio',water:'Pausa para beber',game:'Partido reducido',cool:'Vuelta a la calma'} as Record<BlockKind,string>,
  water:'Agua, sombra y una pregunta: ¿qué funcionó?',cool:'Toques suaves con un balón cada uno, estiramientos suaves y pregunta a cada jugador una cosa que aprendió.',
  swap:'Cambiar',swapOf:(n:string)=>`Cambiar ${n} por otro ejercicio`,newPlan:'Plan nuevo',print:'Imprimir',share:'Compartir enlace',copied:'Enlace copiado. Pégalo para otro entrenador.',noCopy:'No se pudo copiar; copia la dirección de la barra.',
  plan:(a:string,mins:number,f:string)=>`${a} · ${mins} minutos · ${f}`,
  long:(a:string,lo:number,hi:number)=>`Largo para ${a}: US Youth Soccer sugiere ${lo===hi?lo:`de ${lo} a ${hi}`} minutos. Alarga el partido y acorta los ejercicios.`,
  short:(a:string,lo:number)=>`Corto para ${a}: lo habitual son unos ${lo} minutos. Está bien para una semana con prisa.`,
  gk:'Los ejercicios de porteros empiezan en U10 (en 4v4 no hay porteros), así que este plan usa juegos con balón.',
  game:(g:ReturnType<typeof groups>)=>`${g.games===1?'Un partido':`${g.games} partidos a la vez`} de ${g.perSide}v${g.perSide}${g.spare?`; ${g.spare===1?'el jugador que sobra se une':`los ${g.spare} que sobran se unen`} a un equipo o rotan`:''}.`,
  open:'Abrir el ejercicio'},
};
export default function PracticePlanner({catalog,lang}:{catalog:readonly CatalogDrill[];lang?:'es'}){
 const L=lang==='es'?'es':'en',w=W[L],pre=L==='es'?'/es':'';
 const [o,setO]=useState<PlanOptions>(DEFAULT_PLAN),[status,setStatus]=useState(''),[touched,setTouched]=useState(false);
 const ready=useRef(false);
 useEffect(()=>{if(location.search.includes('age=')){setO(decodePlan(location.search));setTouched(true);}ready.current=true;},[]);
 useEffect(()=>{if(ready.current&&touched)history.replaceState(null,'',`${location.pathname}?${encodePlan(o)}${location.hash}`);},[o,touched]);
 const set=(p:Partial<PlanOptions>)=>{setO(x=>({...x,...p}));setTouched(true);setStatus('');};
 const plan=useMemo(()=>makePlan(catalog,o),[catalog,o]),g=groups(o.players,o.age),[lo,hi]=AGE_LENGTH[o.age];
 const swapIdx=(i:number)=>plan.blocks.slice(0,i).filter(b=>b.swappable).length;
 const swap=(i:number)=>{const k=swapIdx(i),sw=[...(o.swaps??[0,0,0,0])];sw[k]=(sw[k]??0)+1;set({swaps:sw});};
 const link=()=>`${location.origin}${location.pathname}?${encodePlan(o)}`;
 const share=async()=>{const u=link();try{if(navigator.share){await navigator.share({title:document.title,url:u});return;}await navigator.clipboard.writeText(u);setStatus(w.copied);}catch{try{await navigator.clipboard.writeText(u);setStatus(w.copied);}catch{setStatus(w.noCopy);}}};
 return <div className={s.tool} data-tool="">
  <div className={`${s.panel} ${s.noPrint}`}>
   <div className={m.field}><span className={s.label} id="pp-age">{w.age}</span>
    <div className={s.seg} role="group" aria-labelledby="pp-age">{PLAN_AGES.map(a=><button key={a} type="button" aria-pressed={o.age===a} onClick={()=>set({age:a})}>{a}</button>)}</div></div>
   <div className={m.field}><span className={s.label} id="pp-len">{w.length}</span>
    <div className={s.seg} role="group" aria-labelledby="pp-len">{PLAN_LENGTHS.map(n=><button key={n} type="button" aria-pressed={o.minutes===n} onClick={()=>set({minutes:n})}>{n}</button>)}</div></div>
   <div className={m.field}><span className={s.label} id="pp-pl">{w.players}</span>
    <div className={m.stepper} role="group" aria-labelledby="pp-pl">
     <button type="button" className={s.x} aria-label={`${w.players} −1`} disabled={o.players<=MIN_PLAYERS} onClick={()=>set({players:Math.max(MIN_PLAYERS,o.players-1)})}>−</button>
     <output aria-live="polite">{o.players}</output>
     <button type="button" className={s.x} aria-label={`${w.players} +1`} disabled={o.players>=MAX_PLAYERS} onClick={()=>set({players:Math.min(MAX_PLAYERS,o.players+1)})}>+</button></div></div>
   <div className={m.field}><span className={s.label} id="pp-focus">{w.focus}</span>
    <div className={m.chipSet} role="group" aria-labelledby="pp-focus">{FOCUSES.map(f=><button key={f} type="button" aria-pressed={o.focus===f} onClick={()=>set({focus:f})}>{w.focuses[f]}</button>)}</div></div>
  </div>
  <section className={m.planCard} aria-labelledby="pp-title">
   <div className={m.resultsHead}><h3 id="pp-title">{w.plan(o.age,plan.total,w.focuses[plan.gkFallback?'fun':o.focus])}</h3>{!touched&&<span className={s.example}>{w.example}</span>}</div>
   {(plan.ageNote!=='ok'||plan.gkFallback)&&<p className={m.note}>{plan.gkFallback?w.gk:plan.ageNote==='long'?w.long(o.age,lo,hi):w.short(o.age,lo)}</p>}
   <ol className={m.blocks}>{plan.blocks.map((b,i)=><li key={i} data-kind={b.kind}>
    <div className={m.time}><b>{mmss(b.start)}</b><span>{b.minutes} {w.min}</span></div>
    <div className={m.blockBody}><span className={m.kind}>{w.kinds[b.kind]}</span>
     {b.slug?<a href={`${pre}/learn/soccer-drills/${b.slug}`} className={m.drill}>{b.name}</a>:<span className={m.drillPlain}>{b.kind==='water'?w.water:w.cool}</span>}
     {b.line&&<p>{b.line}</p>}{b.kind==='game'&&<p>{w.game(g)}</p>}</div>
    {b.swappable&&<button type="button" className={`${s.btn} ${s.btnQuiet} ${m.swap} ${s.noPrint}`} aria-label={w.swapOf(b.name??'')} onClick={()=>swap(i)}>{w.swap}</button>}
   </li>)}</ol>
  </section>
  <div className={`${s.actions} ${s.noPrint}`}>
   <button type="button" className={s.btn} onClick={()=>window.print()}>{w.print}</button>
   <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={share}>{w.share}</button>
   <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>set({seed:(o.seed%999)+1,swaps:[0,0,0,0]})}>{w.newPlan}</button>
  </div>
  <p className={`${s.status} ${s.noPrint}`} role="status">{status}</p>
 </div>;
}
