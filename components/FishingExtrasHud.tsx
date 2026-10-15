'use client';
/**
 * The fishing content HUD (Oct 15 2026, docs/fishing.md "Content systems"), rendered inside the fishing HUD by one hook line in
 * FishingHost.tsx. Small, phone-first, and event-driven (it re-renders on the fishing view's phase changes and the fishing log,
 * never per frame; the only timer is the derby clock's 1 s tick, and only while a derby is on):
 *  - a chip with the time of day and the day's weather, and the next islander request (B3, C4, B4);
 *  - four round buttons: the lure (C3), the Fishing Derby (C2), photo mode (C6) and the spot's record board + legend (B5, C1);
 *  - one short toast for what a catch did (a record, a request done, a reward, a legend's clue, a legend released).
 * Kid-safe: no chances shown, no numbers about catching, no links.
 */
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import styles from './FishingExtrasHud.module.css';
import {fishingSession} from '@/lib/town/fishing/fishingStore';
import {beginDerby,clearDerbyResult,derbyRun,lastCatchEffects,lastDerbyResult,chooseLure,subscribeFishingLog,tickDerby,stopDerby,timeOfDay,todaysWeather,useFishingLog,todaysLog,DERBY_LENGTH} from '@/lib/town/fishing/fishingLogStore';
import {LURES,lureById} from '@/lib/town/fishing/lures';
import {WEATHER_HINT,WEATHER_LABEL,dayKey} from '@/lib/town/fishing/weather';
import {fishById,spotById} from '@/lib/town/fishing/fishCatalog';
import {requestsForDay,requestHint} from '@/lib/town/fishing/requests';
import {LEGEND_INFO,legendForSpot} from '@/lib/town/fishing/legendary';
import {MILESTONE_REWARDS,MILESTONE_WORD,REQUEST_UNLOCKS} from '@/lib/town/fishing/fishingLog';
import {RIVAL_NAME,clockText,derbyLeft,rivalScore} from '@/lib/town/fishing/derby';
import {takeFishingPhoto} from '@/lib/town/fishing/photo';
import {FISH_REQUEST_COINS} from '@/lib/economy';
import {count} from '@/lib/analytics/tracker';
import {Icon} from './Icon';

const useView=()=>useSyncExternalStore(fishingSession.subscribe,fishingSession.getView,fishingSession.getView);
const useLogTick=()=>useSyncExternalStore(subscribeFishingLog,()=>`${derbyRun()?.elapsed??-1}|${derbyRun()?.score??-1}|${lastCatchEffects()?.key??0}|${lastDerbyResult()?.key??0}`,()=>'');
const TIME_WORD={day:'Day',sunset:'Sunset',night:'Night'} as const;
const Svg=({d,size=22}:{d:string;size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
const CAMERA='M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8';
const HOOK='M14 3v10a4 4 0 0 1-8 0v-2l2 2 M14 3a2 2 0 1 0 0 .1';
const CLOUD='M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18';
const RAIN='M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15 M9 18l-1 3 M13 18l-1 3 M17 18l-1 3';
const WIND='M3 9h11a3 3 0 1 0-3-3 M3 15h15a3 3 0 1 1-3 3';
type Panel='lure'|'derby'|'records'|'requests'|null;

export default function FishingExtrasHud(){
 const view=useView(),log=useFishingLog();useLogTick();
 const [panel,setPanel]=useState<Panel>(null),[toast,setToast]=useState<{text:string;key:number;now?:boolean}|null>(null),[shot,setShot]=useState<'idle'|'busy'>('idle');
 const castable=view.phase==='ready'||view.phase==='caught';
 const spot=view.spotId?spotById(view.spotId):undefined;
 const run=derbyRun(),result=lastDerbyResult();
 // The derby clock: 1 s ticks only while a derby runs and the island is not paused behind a dialog.
 useEffect(()=>{if(!run||run.done||!view.active)return;let last=performance.now();const id=setInterval(()=>{const now=performance.now(),dt=(now-last)/1000;last=now;if(!fishingSession.paused)tickDerby(dt);},1000);return()=>clearInterval(id);},[run?.startedAt,view.active]);// eslint-disable-line react-hooks/exhaustive-deps
 // Leaving the spot ends a derby (the score still counts).
 useEffect(()=>{if(!view.active)stopDerby();},[view.active]);
 // One toast per catch that did something.
 const effects=lastCatchEffects(),seen=useRef(0);
 useEffect(()=>{if(!effects||effects.key===seen.current)return;seen.current=effects.key;const e=effects.effects,parts:string[]=[];
  if(e.legend){const f=fishById(effects.id);parts.push(`Released! ${f?.name??'The legend'} swims free again. It is on your Fishbook trophy page.`);}
  if(e.rank===1)parts.push(`New record at ${spotById(effects.spot)?.name??'this spot'}!`);
  for(const q of e.requestsDone)parts.push(`${q.who}: ${q.thanks} +${FISH_REQUEST_COINS} coins`);
  for(const u of e.unlocked)parts.push(`You earned the ${u}!`);
  for(const s of e.newClues){const L=legendForSpot(s);if(L)parts.push(`Legend clue: ${LEGEND_INFO[L.id].clue}`);}
  if(parts.length)setToast({text:parts.join(' '),key:effects.key});
 },[effects]);
 // The catch card says the catch itself; its toast waits until the card is gone (the next cast), then shows for 6 s.
 const cardUp=view.phase==='caught'&&!toast?.now;
 useEffect(()=>{if(!toast||cardUp)return;const t=setTimeout(()=>setToast(null),6000);return()=>clearTimeout(t);},[toast?.key,cardUp]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(!view.active)setPanel(null);},[view.active]);
 if(!view.active)return null;
 const now=Date.now(),day=dayKey(now),time=timeOfDay(),weather=todaysWeather(now),today=todaysLog(now),reqs=requestsForDay(day);
 const open=reqs.filter(q=>!today.req.done.includes(q.id)),next=open[0];
 const lure=log.lure?lureById(log.lure):undefined;
 const toggle=(p:Panel)=>setPanel(v=>v===p?null:p);
 const photo=async()=>{if(shot==='busy')return;setShot('busy');const f=view.caught?fishById(view.caught.id):undefined;
  const caption=`${f?`${f.name} · `:''}${spot?.name??'Futbol Island'} · ${new Date().toLocaleDateString(undefined,{day:'numeric',month:'short'})}`;
  const p=await takeFishingPhoto(caption).catch(()=>null);setShot('idle');if(p){count('fi:photo');setToast({text:'Photo saved on this device. Find it in your Fishbook.',key:Date.now(),now:true});}};
 const L=spot?legendForSpot(spot.id):undefined,legendCaught=!!(L&&log.legends[L.id]),clue=!!(spot&&log.clues.includes(spot.id));
 const records=spot?log.records[spot.id]??[]:[];
 return <div className={styles.root} data-fishing-extras>
  <div className={styles.side}>
   <button type="button" className={styles.round} data-fish-lure aria-label={lure?`Lure: ${lure.short}`:'Choose a lure'} aria-expanded={panel==='lure'} style={lure?{'--lure':lure.color} as React.CSSProperties:undefined} data-on={!!lure||undefined} onClick={()=>toggle('lure')}><Svg d={HOOK}/><small>{lure?lure.short:'Lure'}</small></button>
   {run&&!run.done?<button type="button" className={`${styles.round} ${styles.clock}`} data-derby-clock aria-label={`Derby: ${clockText(derbyLeft(run))} left, ${run.score} points`} onClick={()=>toggle('derby')}><b>{clockText(derbyLeft(run))}</b><small>{run.score} pts</small></button>
    :<button type="button" className={styles.round} data-derby aria-label="Fishing Derby" aria-expanded={panel==='derby'} onClick={()=>toggle('derby')}><Icon name="clock" size={22}/><small>Derby</small></button>}
   <button type="button" className={styles.round} data-fish-photo aria-label="Take a photo" disabled={shot==='busy'} onClick={photo}><Svg d={CAMERA}/><small>Photo</small></button>
   <button type="button" className={styles.round} data-fish-records aria-label="Spot records and legend" aria-expanded={panel==='records'} onClick={()=>toggle('records')}><Icon name="star" size={22}/><small>Records</small></button>
  </div>
  <button type="button" className={styles.info} data-fish-conditions aria-expanded={panel==='requests'} onClick={()=>toggle('requests')}>
   <span className={styles.cond} data-weather={weather} data-time={time}><span aria-hidden="true" className={styles.condIcon}>{weather==='rain'?<Svg d={RAIN} size={18}/>:weather==='overcast'?<Svg d={CLOUD} size={18}/>:weather==='breezy'?<Svg d={WIND} size={18}/>:<Icon name={time==='night'?'moon':time==='sunset'?'sunset':'sun'} size={18}/>}</span>{TIME_WORD[time]} · {WEATHER_LABEL[weather]}</span>
   {next?<span className={styles.req} data-fish-request>{next.text} <em>{Math.min(next.count,today.req.progress[next.id]??0)}/{next.count}</em></span>:<span className={styles.req}>All of today&apos;s requests are done. New ones tomorrow!</span>}
  </button>
  {panel==='lure'&&<section className={styles.panel} aria-label="Lures" data-lure-panel>
   <h3>Lures</h3><p className={styles.note}>A lure changes which kinds of animal come, never how rare they are.{castable?'':' Change it before your next cast.'}</p>
   <ul className={styles.lures}>
    <li><button type="button" aria-pressed={!log.lure} disabled={!castable} onClick={()=>{chooseLure(null);setPanel(null);}}><b>No lure</b><span>Any fish at this spot.</span></button></li>
    {LURES.map(l=>{const owned=log.lures.includes(l.id),how=Object.entries(MILESTONE_REWARDS).find(([,r])=>r.lure===l.id)?.[0],req=REQUEST_UNLOCKS.find(r=>r.lure===l.id);
     return <li key={l.id} data-owned={owned}><button type="button" aria-pressed={log.lure===l.id} disabled={!owned||!castable} onClick={()=>{chooseLure(l.id);setPanel(null);}} style={{'--lure':l.color} as React.CSSProperties}>
      <b><i aria-hidden="true"/>{l.name}</b><span>{owned?l.effect:`Locked: ${how?`fill ${MILESTONE_WORD[Number(how)].toLowerCase()} of your Fishbook`:req?`finish ${req.at} islander request${req.at>1?'s':''}`:'keep fishing'}.`}</span>{owned&&<small className={styles.fact}><span>Real football fact</span>{l.fact}</small>}</button></li>;})}
   </ul>
  </section>}
  {panel==='derby'&&<section className={styles.panel} aria-label="Fishing Derby" data-derby-panel>
   <h3>Fishing Derby</h3>
   {run&&!run.done?<><p className={styles.big}>{clockText(derbyLeft(run))} left · {run.score} points</p><p className={styles.note}>1 point a catch, +1 for each new kind. Stoppage time!</p><button type="button" className={styles.action} onClick={()=>{stopDerby();setPanel(null);}}>Blow the whistle</button></>
    :<><p className={styles.note}>Catch as many as you can in {DERBY_LENGTH/60} minutes: 1 point a catch, +1 for every new kind. Fish sell the same as always.</p>
     <p className={styles.note}>Your best: <b>{log.derby.best}</b> · {RIVAL_NAME}, Rosa&apos;s nephew, scored <b>{rivalScore(day)}</b> today.</p>
     <button type="button" className={styles.action} data-derby-start onClick={()=>{beginDerby();setPanel(null);}}>Kick off!</button></>}
  </section>}
  {panel==='records'&&spot&&<section className={styles.panel} aria-label="Record board" data-records-panel>
   <h3>{spot.name}: record board</h3>
   {records.length?<ol className={styles.records}>{records.map((r,i)=><li key={i}><b>{fishById(r.f)?.name??r.f}</b> {r.s} cm</li>)}</ol>:<p className={styles.note}>No records here yet. Your first catch sets one!</p>}
   {L&&<p className={styles.legend} data-legend-state={legendCaught?'released':clue?'clue':'unknown'}>{legendCaught?<>Legend: <b>{L.name}</b> was caught and released.</>:clue?<>Legend clue: {LEGEND_INFO[L.id].clue}</>:<>A legend lives here. Help an islander or catch 3 different kinds here to find a clue.</>}</p>}
  </section>}
  {panel==='requests'&&<section className={styles.panel} aria-label="Today's requests" data-requests-panel>
   <h3>{WEATHER_LABEL[weather]}</h3><p className={styles.note}>{WEATHER_HINT[weather]}{time==='night'?' Some fish only come out at night.':time==='sunset'?' A golden fish visits at sunset.':''}</p>
   <h3>Today&apos;s requests</h3>
   <ul className={styles.reqs}>{reqs.map(q=>{const done=today.req.done.includes(q.id);return <li key={q.id} data-done={done}><b>{q.text}</b> <em>{done?'Done!':`${Math.min(q.count,today.req.progress[q.id]??0)}/${q.count}`}</em><span>{done?q.thanks:requestHint(q)}</span></li>;})}</ul>
  </section>}
  {toast&&!cardUp&&<p className={styles.toast} key={toast.key} role="status" data-fish-extras-toast>{toast.text}</p>}
  {result&&<DerbyResult score={result.score} best={result.best} rival={rivalScore(day)} key={result.key}/>}
 </div>;
}
function DerbyResult({score,best,rival}:{score:number;best:boolean;rival:number}){
 return <section className={styles.result} role="status" data-derby-result><h3>Full time!</h3><p className={styles.big}>{score} points</p>
  <p>{best?'A new personal best!':'Good game!'} {score>rival?`You beat ${RIVAL_NAME} (${rival})!`:score===rival?`A draw with ${RIVAL_NAME} (${rival}).`:`${RIVAL_NAME} scored ${rival} today. Try again!`}</p>
  <button type="button" className={styles.action} onClick={clearDerbyResult}>Done</button></section>;
}
