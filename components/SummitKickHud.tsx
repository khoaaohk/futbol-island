'use client';
/**
 * The Sunset Kick challenge's HUD (Summit Isle, Oct 12 2026): the world-anchored "Start the Summit Kick" prompt by the pitch
 * gate (placed by lib/graphics/summitActivities.ts like the other island prompts), the how-to card, the round's counter (hoops,
 * balls left, time) with an exit, and the end card (score, best, coins) with the arcade boards' new-high-score initials picker.
 * Reads lib/town/summitStore.ts (written only on changes); no timers or loops of its own.
 */
import {useState,useSyncExternalStore} from 'react';
import dynamic from 'next/dynamic';
import {BackButton} from './BackButton';
import {kickStore,summitActions} from '@/lib/town/summitStore';
import {HOOP_COUNT,KICK_RULES,kickEndLine} from '@/lib/town/summitKick';
import styles from './SummitActivities.module.css';

// The initials picker and the boards load only when a round with a score ends.
const HighScoreEntry=dynamic(()=>import('./arcade/HighScoreEntry'),{ssr:false});
const PARTY=['#f4cc7c','#ef7d3c','#9ff0b8','#fff3df','#7bc4d8'];

export default function SummitKickHud(){
 const v=useSyncExternalStore(kickStore.subscribe,kickStore.get,kickStore.server);
 const r=v.result,[boardDone,setBoardDone]=useState(0);// the round whose high-score picker has closed
 return <>
  <button type="button" className="store-enter-prompt" data-summit-kick-start aria-label="Start the Summit Kick" hidden onClick={()=>summitActions.startKick()}>Start the Summit Kick</button>
  {v.phase!=='idle'&&<div className={styles.hud} data-summit-kick-hud data-phase={v.phase}>
   {v.phase==='playing'&&<>
    <div className={styles.back}><BackButton aria-label="Stop the Summit Kick" onBack={()=>summitActions.exitKick()}/></div>
    <div className={styles.board} role="status" aria-label={`Hoops ${v.hits} of ${HOOP_COUNT}. ${v.maxKicks-v.kicks} balls left. ${v.secondsLeft} seconds.`}>
     <span><small>HOOPS</small><strong data-kick-hits>{v.hits}/{HOOP_COUNT}</strong></span>
     <span><small>BALLS</small><span className={styles.balls} aria-hidden="true">{Array.from({length:v.maxKicks},(_,i)=><i key={i} data-used={i<v.kicks||undefined}/>)}</span></span>
     <span><small>TIME</small><strong>{v.secondsLeft}</strong></span>
    </div>
    {v.note&&<p className={styles.note} aria-live="polite">{v.note}</p>}
    {v.pops>0&&v.popped&&<div key={v.pops} className={styles.cheer} aria-hidden="true">{v.hits===HOOP_COUNT?'5/5!':'HOOP!'}</div>}
   </>}
   {v.phase==='intro'&&<section className={styles.card} aria-label="Summit Kick: how to play" data-kick-intro>
    <span className={styles.eyebrow}>Summit 5s · Sunset challenge</span>
    <h2>Summit Kick</h2>
    <p>Five hoops hang in the goal: the four corners and one under the bar. Kick the ball through them!</p>
    <ol className={styles.steps}>
     <li>You get <b>{KICK_RULES.kicks} balls</b> and {KICK_RULES.seconds} seconds.</li>
     <li>Shoot from behind the <b>chalk line</b> ({KICK_RULES.minDistance} m from goal).</li>
     <li><b>Tap Kick</b> for the low hoops. <b>Hold Kick</b> a moment for the high ones.</li>
     <li>Walk left or right to change your angle. Hit all five for a bonus!</li>
    </ol>
    <p className={styles.learn}>Why corners? A keeper stands in the middle of the goal, so the corners are the hardest shots to save.</p>
    {!v.sunset&&<p className={styles.sunset}>Tip: it looks best at sunset (Settings → time of day), but it works any time.</p>}
    <div className={styles.actions}>
     <button type="button" className={styles.go} data-kick-go autoFocus onClick={()=>summitActions.beginRound()}>Let’s go!</button>
     <button type="button" className={styles.plain} onClick={()=>summitActions.exitKick()}>Not now</button>
    </div>
   </section>}
   {v.phase==='done'&&r&&<>
    {r.hits===HOOP_COUNT&&<div className={styles.party} aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,background:PARTY[i%PARTY.length],animationDelay:`${(i%7)*.08}s`}}/>)}</div>}
    <section className={styles.card} aria-label="Summit Kick result" data-kick-result>
     <span className={styles.eyebrow}>Summit Kick · round {r.round}</span>
     <h2>{r.hits===HOOP_COUNT?'Perfect! 5 out of 5!':`${r.hits} of ${HOOP_COUNT} hoops`}</h2>
     <p>{kickEndLine(r.end,r.hits)}</p>
     {r.end!=='quit'&&<div className={styles.score}>
      <span>Hoops ({r.hits} × 100)</span><b>{r.hoopPoints}</b>
      <span>Accuracy ({r.hits} in {r.kicks} kick{r.kicks===1?'':'s'})</span><b>{r.accuracy}</b>
      {r.hits===HOOP_COUNT&&<><span>Speed bonus ({r.seconds} s)</span><b>{r.speed}</b></>}
      <span className={styles.total}>Score</span><b className={styles.total} data-kick-score>{r.score}</b>
     </div>}
     <p>Best: <b>{r.best}</b>{r.newBest&&r.score>0&&<span className={styles.best}>NEW BEST</span>}{r.coins>0&&<> · <b>+{r.coins} coins</b></>}</p>
     <div className={styles.actions}>
      <button type="button" className={styles.go} data-kick-again onClick={()=>summitActions.beginRound()}>Play again</button>
      <button type="button" className={styles.plain} data-kick-done onClick={()=>summitActions.exitKick()}>Done</button>
     </div>
    </section>
    {r.score>0&&r.end!=='quit'&&boardDone!==r.round&&<HighScoreEntry key={r.round} game="kick" score={r.score} detail={`${r.hits} of ${HOOP_COUNT} hoops on the Summit 5s.`} onClose={()=>setBoardDone(r.round)}/>}
   </>}
  </div>}
 </>;
}
