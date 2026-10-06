'use client';
import {readRunnerProgress,runnerBallFor,runnerMissionRows,RUNNER_BALLS,RUNNER_MISSION_SETS} from '@/lib/arcade/runnerMissions';
import type {RunnerGame} from '@/lib/arcade/runnerGame';
import styles from './RunnerMissionCard.module.css';

/** Breakaway Run: the three current missions (one star each) and the ball they unlock. */
export function RunnerMissionCard({state,phase}:{state?:RunnerGame;phase:'ready'|'playing'|'paused'|'over'}){
 const progress=readRunnerProgress(),rows=runnerMissionRows(phase==='ready'?undefined:state),ball=runnerBallFor(progress);
 return <section className={styles.missions} aria-label="Missions">
  <strong>Missions · set {(phase==='ready'?progress.set:progress.set)+1} · ★ {progress.stars}</strong>
  <ul>{rows.map(r=><li key={r.label} data-done={r.done||undefined}><span aria-hidden="true">{r.done?'★':'☆'}</span>{r.label}{r.progress&&<em> {r.progress}</em>}<span className={styles.sr}>{r.done?' (done)':''}</span></li>)}</ul>
  <ol className={styles.path} aria-label={`Mission path: ${Math.min(progress.set,RUNNER_MISSION_SETS.length)} of ${RUNNER_MISSION_SETS.length} sets complete`}>{RUNNER_MISSION_SETS.map((_,i)=>{const prize=RUNNER_BALLS[Math.min(RUNNER_BALLS.length-1,i+1)];return <li key={i} data-done={i<progress.set||undefined} data-current={i===progress.set%RUNNER_MISSION_SETS.length||undefined} title={`Set ${i+1}: unlocks ${prize.name}`} style={{['--ball' as string]:prize.base,['--patch' as string]:prize.patch}}><span className={styles.sr}>Set {i+1}{i<progress.set?' complete':''}: {prize.name}</span></li>;})}</ol>
  <small>Your ball: {ball.name}. {ball.fact}</small>
 </section>;
}
