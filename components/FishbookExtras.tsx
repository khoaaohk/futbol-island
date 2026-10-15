'use client';
/**
 * The Fishbook's new pages (Oct 15 2026, docs/fishing.md "Content systems"): Trophies (Island Legends, the Fishbook milestones and
 * the Golden Rod, derby cups, lures and floats), Records (every spot's record board), Requests (today's islander requests, the
 * day's weather and its on/off switch) and Photos (photo-mode snapshots, on this device only). Not in the museum.
 * Kid-safe: no chances shown (progress reads as words), no links.
 */
import {useSyncExternalStore} from 'react';
import FishArt from './FishArt';
import styles from './FishbookExtras.module.css';
import {FISH,FISH_SPOTS,fishById,spotById} from '@/lib/town/fishing/fishCatalog';
const FISH_COUNT=FISH.length;
import {LEGEND_FISH,LEGEND_INFO} from '@/lib/town/fishing/legendary';
import {LURES} from '@/lib/town/fishing/lures';
import {FLOAT_SKINS,MILESTONES,MILESTONE_REWARDS,MILESTONE_WORD,REQUEST_UNLOCKS,fishbookPercent,type FishingLog,type FloatSkin} from '@/lib/town/fishing/fishingLog';
import {chooseFloat,chooseRod,setWeatherOn,todaysLog,todaysWeather,weatherOn,timeOfDay} from '@/lib/town/fishing/fishingLogStore';
import {DERBY_TROPHIES,derbyTrophies} from '@/lib/town/fishing/derby';
import {requestHint,requestsForDay} from '@/lib/town/fishing/requests';
import {WEATHER_HINT,WEATHER_LABEL,dayKey} from '@/lib/town/fishing/weather';
import {deletePhoto,readPhotos,subscribePhotos} from '@/lib/town/fishing/photo';
import {FISH_REQUEST_COINS} from '@/lib/economy';

export type FishbookPage='fish'|'trophies'|'records'|'requests'|'photos';
export const FISHBOOK_PAGES:readonly [FishbookPage,string][]=[['fish','Fish'],['trophies','Trophies'],['records','Records'],['requests','Requests'],['photos','Photos']];
const EMPTY:never[]=[];
const usePhotos=()=>useSyncExternalStore(subscribePhotos,readPhotos,()=>EMPTY);

/** The Fishbook milestone bar (25 / 50 / 75 / 100 %) with each reward. */
export function MilestoneBar({caught,log}:{caught:number;log:FishingLog}){
 const pct=fishbookPercent(caught);
 return <div className={styles.milestones} data-fishbook-milestones>
  <div className={styles.bar} role="progressbar" aria-label="Fishbook filled" aria-valuemin={0} aria-valuemax={FISH_COUNT} aria-valuenow={caught} aria-valuetext={`${caught} of ${FISH_COUNT} species`}><i style={{transform:`scaleX(${pct/100})`}}/>{MILESTONES.map(m=><b key={m} style={{'--m':m/100} as React.CSSProperties} data-got={log.milestones.includes(m)||undefined}/>)}</div>
  <ul>{MILESTONES.map(m=><li key={m} data-got={log.milestones.includes(m)||undefined}><b>{MILESTONE_WORD[m]}:</b> {MILESTONE_REWARDS[m].label}{log.milestones.includes(m)?' ✓':''}</li>)}</ul>
 </div>;
}

export function TrophyPage({log}:{log:FishingLog}){
 const caughtLegends=LEGEND_FISH.filter(f=>log.legends[f.id]).length,cups=derbyTrophies(log.derby.points);
 return <div className={styles.page} data-fishbook-page="trophies">
  <section className={styles.card}><h3>Island Legends <small>{caughtLegends} / {LEGEND_FISH.length}</small></h3>
   <p className={styles.note}>One giant lives at every fishing spot. Find its clue (help an islander, or catch 3 different kinds at the spot), then catch it once and let it go. Legends are never sold.</p>
   <ul className={styles.legends}>{LEGEND_FISH.map(f=>{const info=LEGEND_INFO[f.id],got=!!log.legends[f.id],clue=log.clues.includes(info.spot);
    return <li key={f.id} data-legend={got?'caught':clue?'clue':'unknown'}>
     <FishArt fish={f} hidden={!got} size={84}/>
     <div><h4>{got?f.name:clue?'A legend is out there…':'???'}</h4><p className={styles.where}>{spotById(info.spot)?.name}</p>
      {got?<><p>{info.story}</p><p className={styles.fact}><span>Real football legend</span><b>{f.club.name}</b>{f.club.nickname?` · “${f.club.nickname}”`:''}. {f.club.fact}</p><p className={styles.released}>Caught and released</p></>
       :clue?<p><b>Clue:</b> {info.clue}</p>:<p>No clue yet.</p>}</div></li>;})}</ul>
  </section>
  <section className={styles.card}><h3>Derby cups</h3><p className={styles.note}>Best derby: <b>{log.derby.best}</b> points · {log.derby.played} played · {log.derby.points} points in all.</p>
   <ul className={styles.cups}>{DERBY_TROPHIES.map(t=><li key={t.id} data-got={cups.some(c=>c.id===t.id)||undefined}><b>{t.name}</b><span>{cups.some(c=>c.id===t.id)?'Won!':`${t.points} derby points`}</span></li>)}</ul></section>
  <section className={styles.card}><h3>Rod and float</h3>
   <p className={styles.note}>Cosmetic only: they never change which fish bite.</p>
   <div className={styles.choices} role="group" aria-label="Rod">
    <button type="button" aria-pressed={log.rod==='standard'} onClick={()=>chooseRod('standard')}>Island rod</button>
    <button type="button" aria-pressed={log.rod==='golden'} disabled={!log.goldenRod} onClick={()=>chooseRod('golden')} data-golden>{log.goldenRod?'Golden Rod':'Golden Rod: fill your Fishbook'}</button></div>
   <div className={styles.choices} role="group" aria-label="Float">{(Object.keys(FLOAT_SKINS) as FloatSkin[]).map(k=>{const owned=log.floats.includes(k),req=REQUEST_UNLOCKS.find(u=>u.float===k);
    return <button type="button" key={k} aria-pressed={log.float===k} disabled={!owned} onClick={()=>chooseFloat(k)} style={{'--float':FLOAT_SKINS[k].color} as React.CSSProperties}><i aria-hidden="true"/>{owned?FLOAT_SKINS[k].name:req?`${FLOAT_SKINS[k].name}: ${req.at} requests`:`${FLOAT_SKINS[k].name}: fill your Fishbook`}</button>;})}</div>
  </section>
  <section className={styles.card}><h3>Lures</h3><ul className={styles.lureList}>{LURES.map(l=>{const owned=log.lures.includes(l.id);return <li key={l.id} data-owned={owned}><b style={{'--lure':l.color} as React.CSSProperties}><i aria-hidden="true"/>{l.name}</b> <span>{owned?l.effect:'Not earned yet.'}</span>{owned&&<small className={styles.fact}><span>Real football fact</span>{l.fact}</small>}</li>;})}</ul></section>
 </div>;
}

export function RecordsPage({log}:{log:FishingLog}){
 return <div className={styles.page} data-fishbook-page="records">
  <p className={styles.note}>The 3 biggest catches at every spot. Size never changes what Rosa pays: records are just for bragging.</p>
  <ul className={styles.boards}>{FISH_SPOTS.map(s=>{const list=log.records[s.id]??[];return <li key={s.id} data-records-spot={s.id}><h4>{s.name}</h4>
   {list.length?<ol>{list.map((r,i)=><li key={i}><b>{fishById(r.f)?.name??r.f}</b> {r.s} cm</li>)}</ol>:<p>No catches here yet.</p>}</li>;})}</ul>
 </div>;
}

export function RequestsPage({log}:{log:FishingLog}){
 const now=Date.now(),day=dayKey(now),today=todaysLog(now),reqs=requestsForDay(day),on=weatherOn(),w=todaysWeather(now),time=timeOfDay();void log;
 return <div className={styles.page} data-fishbook-page="requests">
  <section className={styles.card}><h3>Today&apos;s requests</h3>
   <p className={styles.note}>Three islanders ask for a fish each day. Each one finished pays {FISH_REQUEST_COINS} coins (part of today&apos;s training pay) and can reveal a legend&apos;s clue. {log.reqTotal} finished so far.</p>
   <ul className={styles.reqs}>{reqs.map(q=>{const done=today.req.done.includes(q.id);return <li key={q.id} data-done={done}><b>{q.text}</b> <em>{done?'Done!':`${Math.min(q.count,today.req.progress[q.id]??0)}/${q.count}`}</em><span>{done?q.thanks:requestHint(q)}</span></li>;})}</ul>
   <p className={styles.note}>Rewards: {REQUEST_UNLOCKS.map(u=>`${u.label} after ${u.at}`).join(' · ')}.</p></section>
  <section className={styles.card}><h3>Island weather</h3>
   <p className={styles.note}>{on?<>Today: <b>{WEATHER_LABEL[w]}</b>. {WEATHER_HINT[w]}</>:'Weather is off: every day is clear.'} It is {time==='day'?'daytime':time} on the island: change it in Settings to meet the night and sunset fish.</p>
   <button type="button" className={styles.toggle} aria-pressed={on} onClick={()=>setWeatherOn(!on)} data-weather-toggle>{on?'Weather: on':'Weather: off'}</button></section>
 </div>;
}

export function PhotosPage(){
 const photos=usePhotos();
 return <div className={styles.page} data-fishbook-page="photos">
  <p className={styles.note}>Photos stay on this device only. Take one with the camera button while fishing. The newest {6} are kept.</p>
  {photos.length?<ul className={styles.photos}>{photos.map(p=><li key={p.id}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.img} alt={p.caption||'Fishing photo'}/><button type="button" onClick={()=>deletePhoto(p.id)} aria-label={`Delete photo: ${p.caption}`}>Delete</button></li>)}</ul>:<p className={styles.empty}>No photos yet.</p>}
 </div>;
}
