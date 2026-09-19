'use client';
import {pathText} from '@/lib/paths/pathText';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import {Icon} from './Icon';
import {COIN_QUEST,allCostumesEarned} from '@/lib/town/coinQuest';
import {useCoinProgress,setCoinHint} from '@/lib/town/coinProgress';
import styles from './CoinQuest.module.css';
const BallHuntLesson=dynamic(()=>import('./BallHuntLesson'),{ssr:false});
export function BallHuntSummary({onDiscover}:{onDiscover:()=>void}){
 const progress=useCoinProgress(),total=COIN_QUEST.length,collected=progress.collected.length;
 return <button type="button" className={styles.summaryCard} onClick={onDiscover} aria-haspopup="dialog">
  <span className={styles.summaryTitle}><strong>Ball hunt</strong></span><span className={styles.summaryArrow}><Icon name="arrow" size={24}/></span>
  <span className={styles.summaryCount}>{collected} / {total} found</span>
 </button>;
}

export default function CoinQuest({onStore}:{onStore?:()=>void}){
 const progress=useCoinProgress(),[selected,setSelected]=useState(COIN_QUEST[0].id),[clues,setClues]=useState<Record<string,number>>({}),[replay,setReplay]=useState<string|null>(null),[practice,setPractice]=useState(false);
 const total=COIN_QUEST.length,earned=allCostumesEarned(progress),index=COIN_QUEST.findIndex(ball=>ball.id===selected),ball=COIN_QUEST[index],found=progress.collected.includes(ball.id),level=clues[ball.id]??0;
 return <section className={styles.quest} id="matchday-coin-quest" aria-labelledby="coin-quest-title">
 <h3 id="coin-quest-title">The Missing Matchday Balls</h3>
 <p>Find all {total} balls to unlock every costume. Choose a ball to see its clue or revisit what you learned.</p>
 <strong>{progress.collected.length} / {total} found{earned?' · All costumes unlocked!':''}</strong>
 <div className={styles.ballSelector} role="group" aria-label="Choose a matchday ball">{COIN_QUEST.map((c,i)=><button type="button" key={c.id} data-earned={progress.collected.includes(c.id)} aria-pressed={selected===c.id} aria-controls="selected-ball-detail" aria-label={`Ball ${i+1}${progress.collected.includes(c.id)?', found':''}`} onClick={()=>setSelected(c.id)}>{i+1}{progress.collected.includes(c.id)&&<span aria-hidden="true">✓</span>}</button>)}</div>
 <section id="selected-ball-detail" className={styles.selectedBall} aria-labelledby="selected-ball-title">
  <h4 id="selected-ball-title">{found?'✓ ':''}Ball {index+1}{found||level>0?` · ${ball.name}`:''}</h4>
  {found?<><p>{pathText(ball.teaching)}</p><div className={styles.discoveryActions}><button type="button" className={styles.secondary} aria-haspopup="dialog" onClick={()=>{setPractice(false);setReplay(ball.id);}}>Watch tip again</button>{ball.id!=='museum'&&<button type="button" className={styles.secondary} aria-haspopup="dialog" onClick={()=>{setPractice(true);setReplay(ball.id);}}>Practice idea</button>}</div></>:<>
   {level>0&&<p aria-live="polite">{pathText(level===1?ball.clue:ball.detail)}</p>}
   {progress.revealed.includes(ball.id)&&<p>Parcel opened—return to collect the ball.</p>}
   <button type="button" className={styles.secondary} onClick={()=>{if(level>=2){setCoinHint(ball.id);window.dispatchEvent(new Event('fi2-coin-hint'));}else setClues(v=>({...v,[ball.id]:level+1}));}}>{level===0?'Give me a clue':level===1?'A little more help':'Show a clue marker'}</button>
  </>}
 </section>
 {onStore&&<button type="button" className={styles.primary} onClick={onStore}>{earned?'Choose a costume in the Store':'Explore the costumes'}</button>}
 {replay&&<BallHuntLesson key={replay} spotId={replay} practice={practice} replay onDismiss={()=>setReplay(null)}/>}
 </section>;
}
