'use client';
/**
 * The Fishbook's content pages (Oct 15 2026, docs/fishing.md "Content systems"): Trophies (Island Legends, the Fishbook milestones
 * and the Golden Rod, the rod and float choice, the four lures) and Requests (today's islander requests). Not in the museum.
 * Removed 15 Oct 2026 (user: "too complicated"): the Records and Photos pages, the derby cups and the weather switch.
 * Kid-safe: no chances shown (progress reads as words), no links.
 */
import FishArt from './FishArt';
import styles from './FishbookExtras.module.css';
import {FISH,spotById} from '@/lib/town/fishing/fishCatalog';
const FISH_COUNT=FISH.length;
import {LEGEND_FISH,LEGEND_INFO,legendBefore} from '@/lib/town/fishing/legendary';
import {LURES} from '@/lib/town/fishing/lures';
import {FLOAT_SKINS,MILESTONES,MILESTONE_REWARDS,MILESTONE_WORD,fishbookPercent,type FishingLog,type FloatSkin} from '@/lib/town/fishing/fishingLog';
import {chooseFloat,chooseLure,chooseRod,todaysLog} from '@/lib/town/fishing/fishingLogStore';
import {requestHint,requestsForDay} from '@/lib/town/fishing/requests';
import {dayKey} from '@/lib/town/fishing/timeOfDay';
import {FISH_REQUEST_COINS} from '@/lib/economy';
// Nov 7 2026 return hooks (docs/fishing.md "Return hooks"): sets, today's visitors, golden and visitor marks, story chapters.
import {FISH_SETS,legendChapters,pacificDay,setProgress,speciesChapters,visitorHint,visitorsFor,type HooksSave} from '@/lib/town/fishing/fishingHooks';
import type {Fishbook} from '@/lib/town/fishing/fishingCore';
import type {FishSpecies} from '@/lib/town/fishing/fishCatalog';

export type FishbookPage='fish'|'sets'|'trophies'|'requests';
export const FISHBOOK_PAGES:readonly [FishbookPage,string][]=[['fish','Fish'],['sets','Sets'],['trophies','Trophies'],['requests','Requests']];

/** Today's visitors (one per area, the same for everyone on a Pacific day): where and when to look, never how likely. */
export function VisitorBanner({hooks,now=Date.now()}:{hooks:HooksSave;now?:number}){
 const day=pacificDay(now),list=visitorsFor(day);if(!list.length)return null;
 return <section className={styles.visitors} aria-labelledby="fishbook-visitors" data-fishbook-visitors>
  <h3 id="fishbook-visitors">Today&apos;s visitors</h3>
  <p className={styles.note}>One special animal drops by each part of the island today. Catch it today for a Visitor mark in your Fishbook. A new one comes tomorrow.</p>
  <ul>{list.map(({area,fish})=>{const got=hooks.visits[fish.id]?.day===day;return <li key={area.id} data-visitor-area={area.id} data-got={got||undefined}>
   <FishArt fish={fish} size={56}/><div><b>{fish.name}</b><span>{area.name} · {visitorHint(fish)}</span>{got&&<em>Caught today ✓</em>}</div></li>;})}</ul>
 </section>;
}

/** The marks and story chapters on a caught species' Fishbook card. */
export function SpeciesHooks({fish,count,hooks}:{fish:FishSpecies;count:number;hooks:HooksSave}){
 const golden=hooks.golden[fish.id]??0,visits=hooks.visits[fish.id]?.n??0,ch=speciesChapters(fish,count);
 return <>
  {(golden>0||visits>0)&&<p className={styles.marks} data-fish-marks>{golden>0&&<span data-mark="golden">Golden{golden>1?` ×${golden}`:''}</span>}{visits>0&&<span data-mark="visitor">Visitor{visits>1?` ×${visits}`:''}</span>}</p>}
  {ch.total>1&&ch.unlocked.length>1&&<div className={styles.chapters} data-fish-chapters>{ch.unlocked.slice(1).map((t,i)=><p key={i}><b>Chapter {i+2}</b> {t}</p>)}</div>}
  {ch.next!==null&&<p className={styles.nextChapter} data-next-chapter>Chapter {ch.unlocked.length+1} of {ch.total}: catch it {ch.next-count} more time{ch.next-count===1?'':'s'}.</p>}
 </>;
}

/** The Sets page: every set's "N of M", its stamp and any float it gives. Nothing here is timed. */
export function SetsPage({book,hooks,fresh}:{book:Fishbook;hooks:HooksSave;fresh?:ReadonlySet<string>}){
 const done=FISH_SETS.filter(s=>hooks.sets.includes(s.id)).length;
 return <div className={styles.page} data-fishbook-page="sets">
  <section className={styles.card}><h3>Fishbook sets <small>{done} of {FISH_SETS.length} complete</small></h3>
   <p className={styles.note}>Catch every animal in a set to win its stamp. Some sets also give a new float. Sets never run out of time: take as long as you like, like building a squad one player at a time.</p>
   <ul className={styles.sets}>{FISH_SETS.map(set=>{const p=setProgress(set,book),got=hooks.sets.includes(set.id);
    return <li key={set.id} data-set={set.id} data-done={got||undefined} data-celebrate={got&&fresh?.has(set.id)||undefined}>{got&&fresh?.has(set.id)&&<span className={styles.setBurst} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></span>}
     <div className={styles.setHead}><h4>{set.title}</h4><b data-set-count>{p.got} of {p.total}</b></div>
     <div className={styles.setBar} role="progressbar" aria-label={`${set.title}: caught`} aria-valuemin={0} aria-valuemax={p.total} aria-valuenow={p.got}><i style={{transform:`scaleX(${p.total?p.got/p.total:0})`}}/></div>
     <p>{set.blurb}</p>
     <p className={styles.setReward}>{got?<><span className={styles.stampMark}>{set.stamp}</span>{set.float?` + ${FLOAT_SKINS[set.float].name}`:''}</>:<>Reward: {set.stamp}{set.float?` and the ${FLOAT_SKINS[set.float].name}`:''}</>}</p>
    </li>;})}</ul></section>
 </div>;
}

/** The Fishbook milestone bar (a quarter / half / all) with each reward. */
export function MilestoneBar({caught,log}:{caught:number;log:FishingLog}){
 const pct=fishbookPercent(caught);
 return <div className={styles.milestones} data-fishbook-milestones>
  <div className={styles.bar} role="progressbar" aria-label="Fishbook filled" aria-valuemin={0} aria-valuemax={FISH_COUNT} aria-valuenow={caught} aria-valuetext={`${caught} of ${FISH_COUNT} species`}><i style={{transform:`scaleX(${pct/100})`}}/>{MILESTONES.map(m=><b key={m} style={{'--m':m/100} as React.CSSProperties} data-got={log.milestones.includes(m)||undefined}/>)}</div>
  <ul>{MILESTONES.map(m=><li key={m} data-got={log.milestones.includes(m)||undefined}><b>{MILESTONE_WORD[m]}:</b> {MILESTONE_REWARDS[m].label}{log.milestones.includes(m)?' ✓':''}</li>)}</ul>
 </div>;
}

export function TrophyPage({log,hooks}:{log:FishingLog;hooks?:HooksSave}){
 const caughtLegends=LEGEND_FISH.filter(f=>log.legends[f.id]).length;
 return <div className={styles.page} data-fishbook-page="trophies">
  <section className={styles.card}><h3>Island Legends <small>{caughtLegends} / {LEGEND_FISH.length}</small></h3>
   <p className={styles.note}>One giant lives at every fishing spot, and four spots hide a second one that comes after the first. Find its clue (help an islander, or catch 3 different kinds at the spot), then catch it once and let it go. Legends are never sold.</p>
   <ul className={styles.legends}>{LEGEND_FISH.map(f=>{const info=LEGEND_INFO[f.id],got=!!log.legends[f.id],prev=legendBefore(f.id),waits=!!prev&&!log.legends[prev.id],clue=log.clues.includes(info.spot)&&!waits;
    return <li key={f.id} data-legend={got?'caught':clue?'clue':'unknown'}>
     <FishArt fish={f} hidden={!got} size={84}/>
     <div><h4>{got?f.name:clue?'A legend is out there…':'???'}</h4><p className={styles.where}>{spotById(info.spot)?.name}</p>
      {got?<><p>{info.story}</p>{(()=>{const ch=legendChapters(f.id,true,hooks?.legendSeen[f.id]??0);return <>{ch.unlocked.slice(1).map((t,i)=><p key={i} className={styles.legendChapter}><b>Seen again (chapter {i+2})</b> {t}</p>)}{ch.next!==null&&<p className={styles.nextChapter}>Chapter {ch.unlocked.length+1} of {ch.total}: keep fishing at {spotById(info.spot)?.name}.</p>}</>;})()}<p className={styles.fact}><span>Real football legend</span><b>{f.club.name}</b>{f.club.nickname?` · “${f.club.nickname}”`:''}. {f.club.fact}</p><p className={styles.released}>Caught and released</p></>
       :clue?<p><b>Clue:</b> {info.clue}</p>:waits?<p>A second giant. It swims here once the first legend of this spot is caught and released.</p>:<p>No clue yet.</p>}</div></li>;})}</ul>
  </section>
  <section className={styles.card}><h3>Rod and float</h3>
   <p className={styles.note}>Cosmetic only: they never change which fish bite. Fill your Fishbook and finish sets to earn them.</p>
   <div className={styles.choices} role="group" aria-label="Rod">
    <button type="button" aria-pressed={log.rod==='standard'} onClick={()=>chooseRod('standard')}>Island rod</button>
    <button type="button" aria-pressed={log.rod==='golden'} disabled={!log.goldenRod} onClick={()=>chooseRod('golden')} data-golden>{log.goldenRod?'Golden Rod':'Golden Rod: fill your Fishbook'}</button></div>
   <div className={styles.choices} role="group" aria-label="Float">{(Object.keys(FLOAT_SKINS) as FloatSkin[]).map(k=>{const owned=log.floats.includes(k),at=Object.entries(MILESTONE_REWARDS).find(([,r])=>r.float===k)?.[0],fromSet=FISH_SETS.find(x=>x.float===k);
    return <button type="button" key={k} aria-pressed={log.float===k} disabled={!owned} onClick={()=>chooseFloat(k)} style={{'--float':FLOAT_SKINS[k].color} as React.CSSProperties}><i aria-hidden="true"/>{owned?FLOAT_SKINS[k].name:fromSet?`${FLOAT_SKINS[k].name}: finish the ${fromSet.title} set`:`${FLOAT_SKINS[k].name}: ${at?MILESTONE_WORD[Number(at)].toLowerCase():'fill'} of your Fishbook`}</button>;})}</div>
  </section>
  <section className={styles.card}><h3>Lures</h3>
   <p className={styles.note}>A lure changes which kinds of animal come, never how rare they are. Pick one here or from the lure button while fishing; it works from your next cast.</p>
   <ul className={styles.lureList} role="group" aria-label="Lure">{LURES.map(l=><li key={l.id}><button type="button" aria-pressed={log.lure===l.id} data-lure={l.id} onClick={()=>chooseLure(log.lure===l.id?null:l.id)} style={{'--lure':l.color} as React.CSSProperties}><b><i aria-hidden="true"/>{l.name}</b> <span>{l.effect}</span><small className={styles.fact}><span>Real football fact</span>{l.fact}</small></button></li>)}</ul></section>
 </div>;
}

export function RequestsPage({log}:{log:FishingLog}){
 const now=Date.now(),day=dayKey(now),today=todaysLog(now),reqs=requestsForDay(day);
 return <div className={styles.page} data-fishbook-page="requests">
  <section className={styles.card}><h3>Today&apos;s requests</h3>
   <p className={styles.note}>Three islanders ask for a fish each day. Each one finished pays {FISH_REQUEST_COINS} coins (part of today&apos;s training pay) and reveals a legend&apos;s clue. {log.reqTotal} finished so far.</p>
   <ul className={styles.reqs}>{reqs.map(q=>{const done=today.req.done.includes(q.id);return <li key={q.id} data-done={done}><b>{q.text}</b> <em>{done?'Done!':`${Math.min(q.count,today.req.progress[q.id]??0)}/${q.count}`}</em><span>{done?q.thanks:requestHint(q)}</span></li>;})}</ul>
   <p className={styles.note}>Scouts read a match the way you read the water: look first, then choose where to cast. New requests every day.</p></section>
 </div>;
}
