'use client';
import {COIN_QUEST,COIN_REWARD_ID,coinRewardEarned} from '@/lib/town/coinQuest';
import {readCoinProgress,useCoinProgress} from '@/lib/town/coinProgress';
import type {CharacterCustomization} from '@/lib/town/customization';
import styles from './CoinCostumeReward.module.css';

type Props={value:CharacterCustomization;preview?:string;onEquip:()=>void};
export default function CoinCostumeReward({value,preview,onEquip}:Props){
 const progress=useCoinProgress(),earned=coinRewardEarned(progress),equipped=value.costume===COIN_REWARD_ID;
 const count=progress.collected.length,total=COIN_QUEST.length;
 return <article className={styles.card} data-coin-costume-reward data-store-item="costume:matchday-fox" data-earned={earned}>
  <div className={styles.picture}>{preview?<img src={preview} width={320} height={280} alt="Your character in the gold Matchday Fox costume with a teal training kit"/>:<span>Gold fox costume</span>}<span className={styles.badge}>{earned?'QUEST REWARD EARNED':'BALL QUEST REWARD'}</span></div>
  <div className={styles.content}><span className={styles.eyebrow}>Gold fox costume</span><h3>Matchday Fox</h3><p>Our fictional island fox scans both shoulders before receiving, spots a teammate and chooses a clear passing lane. Take that habit into your next game.</p><p className={styles.note}>An original island character with no official club association. This outfit celebrates exploration, not football mastery.</p>
   <div className={styles.progress}><strong>{count} / {total} matchday soccer balls</strong><span>{earned?'Ready to wear':'Find the hidden soccer balls around the island'}</span></div><progress value={count} max={total} aria-label="Matchday soccer balls collected"/>
   <button type="button" disabled={!earned||equipped} onClick={()=>{if(coinRewardEarned(readCoinProgress()))onEquip();}}>{equipped?'Equipped ✓':earned?'Equip Matchday Fox':`Find all ${total} soccer balls to unlock`}</button>
   <button type="button" className={styles.secondary} onClick={()=>window.dispatchEvent(new CustomEvent('fi2-coin-quest-open'))}>{earned?'View collected soccer balls':'Follow the ball clues'}</button>
   <p className={styles.note}>{earned?'Your soccer balls stay collected when you equip. Your character stays underneath the costume.':'Open Paths to follow the ball clues. Find all 55 balls to unlock all costumes.'}</p>
  </div>
 </article>;
}
