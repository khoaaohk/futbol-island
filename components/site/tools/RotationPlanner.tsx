'use client';
import TeamShare from '@/components/share/TeamShare';
import {useEffect,useMemo,useRef,useState} from 'react';
import {cleanName,decodePlan,encodePlan,MAX_PLAYERS,periodName,planRotation,rotationText,type PlanState} from '@/lib/site/tools/rotation';
import site from '@/app/(site)/site.module.css';
import t from './tools.module.css';
import rt from '@/components/site/railTarget.module.css';
import {ROTATION_ES as W,periodNameEs,playerNameEs,rotationTextEs} from './toolWordsEs';
/**
 * The playing-time planner (Nov 10 2026; /tools/soccer-playing-time-calculator and the 7v7 / 9v9 landings). A client component
 * (a tool the coach drives): a small form and a table. The plan is a pure function (lib/site/tools/rotation.ts) run when an
 * input changes; no timers, no canvas, no network (AGENTS.md, phone heat).
 * Privacy: names are optional and stay in this component, in localStorage (try/catch) and, only on "Copy link", in the URL
 * fragment. No analytics event carries a name or a plan.
 * The server renders the plan for the page's default numbers, so the table is real content without JavaScript.
 */
export type Preset={id:string;label:string;onField:number;periods:number;periodMin:number};
const KEY='fi-rotation-v1';
/** `lang="es"` (Spanish round D, Nov 16 2026): Spanish words (./toolWordsEs.ts; the page passes Spanish preset labels). English output is unchanged without it. */
/** `teamShare`: the quiet "Send your players the free game" line under the plan (the site pages; not the club embed). */
export default function RotationPlanner({presets,initial,lockKey,lang,teamShare}:{presets:readonly Preset[];initial:PlanState;lockKey?:string;lang?:'es';teamShare?:boolean}){
 const es=lang==='es';
 const [s,setS]=useState<PlanState>(initial);
 const [namesText,setNamesText]=useState('');
 const [status,setStatus]=useState('');
 const [link,setLink]=useState('');
 const loaded=useRef(false);
 useEffect(()=>{
  const fromHash=()=>{const m=/(?:^|[#&])r=([^&]+)/.exec(window.location.hash),p=m?decodePlan(m[1]):null;if(p){setS(p);setNamesText((p.names??[]).join('\n'));}return !!p;};
  if(!fromHash()){try{const raw=JSON.parse(window.localStorage.getItem(KEY)??'null');
   if(raw&&raw.key===(lockKey??'')&&typeof raw.code==='string'){const p=decodePlan(raw.code);if(p){setS(p);setNamesText((p.names??[]).join('\n'));}}}catch{/* start fresh */}}
  loaded.current=true;
  window.addEventListener('hashchange',fromHash);return ()=>window.removeEventListener('hashchange',fromHash);
 },[lockKey]);
 useEffect(()=>{if(!loaded.current)return;try{window.localStorage.setItem(KEY,JSON.stringify({key:lockKey??'',code:encodePlan(s)}));}catch{/* storage is optional */}},[s,lockKey]);
 const plan=useMemo(()=>planRotation(s),[s]);
 const set=(patch:Partial<PlanState>)=>setS(x=>({...x,...patch}));
 const num=(k:'players'|'onField'|'periods'|'periodMin'|'subEvery')=>(e:React.ChangeEvent<HTMLSelectElement>)=>{set({[k]:Number(e.target.value)});};
 const pick=(k:'players'|'onField'|'periodMin'|'subEvery',label:string,from:number,to:number)=><label className={t.fieldLabel}>{label}
  <select className={t.input} value={s[k]} onChange={num(k)}>{Array.from({length:to-from+1},(_,n)=>from+n).map(n=><option key={n} value={n}>{n}</option>)}</select></label>;
 const onNames=(v:string)=>{setNamesText(v);const names=v.split('\n').map(cleanName).filter(Boolean).slice(0,MAX_PLAYERS);set({names,...(names.length>=2?{players:Math.max(names.length,1)}:{})});};
 const preset=presets.find(p=>p.onField===s.onField&&p.periods===s.periods&&p.periodMin===s.periodMin)?.id??'';
 const copyText=()=>{const text=es?rotationTextEs(plan,s.team):rotationText(plan,s.team);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>setStatus(es?W.textCopied:'Plan copied as text. Paste it in your team chat.'),()=>setStatus(es?W.noCopy:'Could not copy. Select the table and copy it by hand.'));
  else setStatus(es?W.noCopy:'Could not copy. Select the table and copy it by hand.');};
 const copyLink=()=>{const url=`${window.location.origin}${window.location.pathname}#r=${encodePlan(s)}`;
  try{window.history.replaceState(null,'',url);}catch{/* the link is still shown below */}
  setLink(url);
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>setStatus(es?W.linkCopied:'Link copied. Anyone who opens it sees this plan.'),()=>setStatus(es?W.copyBelow:'Copy the link below.'));else setStatus(es?W.copyBelow:'Copy the link below.');};
 const i=plan.input,bench=i.players-i.onField,lo=Math.min(...plan.minutes),hi=Math.max(...plan.minutes);
 const nm=(p:number)=>es?playerNameEs(plan,p):plan.names[p],pName=es?periodNameEs:periodName;
 const rotating=i.keeperRotates?plan.minutes:plan.minutes.slice(1),rLo=rotating.length?Math.min(...rotating):lo,rHi=rotating.length?Math.max(...rotating):hi;
 return <div className={t.tool} data-tool="rotation">
  <div className={`${t.panel} ${t.noPrint}`}>
   <div className={t.grid3}>
    {presets.length>0&&<label className={`${t.fieldLabel} ${t.wide}`}>{es?W.game:'Game'}
     <select className={t.input} value={preset} onChange={e=>{const p=presets.find(x=>x.id===e.target.value);if(p)set({onField:p.onField,periods:p.periods,periodMin:p.periodMin,subEvery:Math.min(s.subEvery,p.periodMin)});}}>
      {!preset&&<option value="">{es?W.own:'Your own numbers'}</option>}{presets.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>}
    {pick('players',es?W.players:'Players at the game',3,MAX_PLAYERS)}
    {pick('onField',es?W.onField:'On the field',3,11)}
    <label className={t.fieldLabel}>{es?W.periods:'Periods'}<select className={t.input} value={s.periods} onChange={num('periods')}>{[1,2,3,4].map(n=><option key={n} value={n}>{es?W.periodOpt(n):n===1?'1 (no break)':n===2?'2 halves':n===4?'4 quarters':`${n} periods`}</option>)}</select></label>
    {pick('periodMin',es?W.periodMin:'Minutes per period',5,50)}
    {pick('subEvery',es?W.subEvery:'Change every (min)',2,25)}
    <label className={`${t.fieldLabel} ${t.wide}`}>{es?W.keeper:'Goalkeeper'}<select className={t.input} value={s.keeperRotates?'rotate':'fixed'} onChange={e=>set({keeperRotates:e.target.value==='rotate'})}><option value="rotate">{es?W.rotate:'A new goalkeeper each period'}</option><option value="fixed">{es?W.fixed:'One goalkeeper all game'}</option></select></label>
    <label className={`${t.fieldLabel} ${t.wide}`}>{es?W.team:'Team name (optional)'}<input className={t.input} value={s.team} maxLength={24} autoComplete="off" onChange={e=>setS(x=>({...x,team:e.target.value.slice(0,24)}))}/></label>
    <label className={`${t.fieldLabel} ${t.wide}`}>{es?W.names:'Names, one per line (optional)'}
     <textarea className={t.input} value={namesText} rows={4} autoComplete="off" placeholder={es?W.namesHint:'Ava\nBen\nCarlos'} onChange={e=>onNames(e.target.value)}/></label>
   </div>
   <p className={t.hint}>{es?W.privacy:'Names stay on your device. Nothing you type is sent to Futbol Island or stored on a server.'}{!s.keeperRotates&&(es?W.firstKeeper:' The first player in the list is the goalkeeper.')}</p>
  </div>
  <section className={site.section} aria-labelledby="plan">
   <h2 className={`${site.h2} ${rt.target}`} id="plan">{s.team?(es?W.planOf(s.team):`${s.team}: the plan`):(es?W.plan:'Your substitution plan')}</h2>
   <p data-summary="">{es?W.summary({players:i.players,onField:i.onField,gameMin:plan.gameMin,bench,rotates:i.keeperRotates,lo:rLo,hi:rHi,block:plan.blocks[0].minutes}):bench<=0?`With ${i.players} players and ${i.onField} on the field there are no substitutes: everyone plays the whole game of ${plan.gameMin} minutes.`
    :`${i.players} players share ${i.onField} places over ${plan.gameMin} minutes. ${i.keeperRotates?'Every player':'Every outfield player'} is on for ${rLo===rHi?`${rLo} minutes`:`${rLo} to ${rHi} minutes`}${i.keeperRotates?'':`, and the goalkeeper plays all ${plan.gameMin}`}. ${bench} sit out in each block of about ${plan.blocks[0].minutes} minutes.`}</p>
   <div className={`${site.tableWrap} ${t.printTable}`} tabIndex={0} role="region" aria-label={es?W.region:'Rotation table'} data-stack="">{/* phones: one card per block (site.module.css [data-stack]) */}<table className={site.table} aria-label={es?W.table:'Who is on the field in each block'}>
    <thead><tr><th scope="col">{es?W.time:'Time'}</th><th scope="col">{es?W.keeper:'Goalkeeper'}</th><th scope="col">{es?W.on:'On the field'}</th><th scope="col">{es?W.off:'Sitting out'}</th></tr></thead>
    <tbody>{plan.blocks.map((b,n)=><tr key={n}><th scope="row">{i.periods>1?`${pName(b.period,i.periods)}, `:''}{b.start}–{b.end} min</th>
     <td data-label={es?W.keeper:'Goalkeeper'}><b>{nm(b.keeper)}</b></td>
     <td data-label={es?W.on:'On the field'}>{b.on.filter(p=>p!==b.keeper).map(nm).join(', ')}</td>
     <td className={t.off} data-label={es?W.off:'Sitting out'}>{b.off.length?b.off.map(nm).join(', '):(es?W.nobody:'Nobody')}</td></tr>)}</tbody>
   </table></div>
   <h3 className={site.h3}>{es?W.minutes:'Minutes for each player'}</h3>
   <ul className={t.minutes} data-minutes="">{plan.names.map((_,p)=><li key={p}>{nm(p)}: {plan.minutes[p]} min</li>)}</ul>
   <p className={`${t.status} ${t.noPrint}`} role="status" aria-live="polite">{status}</p>
   <div className={`${t.actions} ${t.noPrint}`}>
    <button type="button" className={t.btn} onClick={()=>window.print()}>{es?W.print:'Print'}</button>
    <button type="button" className={t.btn} onClick={copyText}>{es?W.copyText:'Copy as text'}</button>
    <button type="button" className={t.btn} onClick={copyLink}>{es?W.copyLink:'Copy link'}</button>
   </div>
   {link&&<label className={`${t.fieldLabel} ${t.noPrint}`}>{es?W.linkLabel:'Link to this plan'}<input className={`${t.input} ${t.link}`} readOnly value={link} onFocus={e=>e.currentTarget.select()}/></label>}
   <p className={site.caption}>{es?W.made:'Made with futbolisland.app. Change at the next stoppage your league allows; the times are targets.'}</p>
   {teamShare&&<TeamShare surface="minutes" lang={es?'es':'en'} format={lockKey} team={s.team}/>}
  </section>
 </div>;
}
