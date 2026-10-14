'use client';
import {BOARD_RULES,iconEmoji,type BoardGame,type BoardRow} from '@/lib/arcade/leaderboard';
import styles from './Leaderboard.module.css';

export type BoardTab='week'|'all'|'device';
export const BOARD_TABS:{id:BoardTab;label:string}[]=[{id:'week',label:'Island · week'},{id:'all',label:'Island · all-time'},{id:'device',label:'This device'}];
/** One board: rank, picture, three letters, score. `mine` rows get a YOU tag; `fresh` is the entry just posted. */
export function BoardTable({game,rows,mine,fresh,empty}:{game:BoardGame;rows:(BoardRow&{key:string})[];mine?:(r:BoardRow&{key:string})=>boolean;fresh?:string|null;empty:string}){
 if(!rows.length)return <p className={styles.empty}>{empty}</p>;
 const unit=BOARD_RULES[game].unit;
 return <ol className={styles.rows} aria-label={`Top ${rows.length}, ${unit}`}>{rows.map((r,i)=>{const own=mine?.(r)??false,now=fresh===r.key;
  return <li key={r.key} data-rank={i+1} data-mine={own||undefined} data-new={now||undefined} aria-current={now?'true':undefined}>
   <span className={styles.rank}>#{i+1}</span><span className={styles.pic} aria-hidden="true">{iconEmoji(r.icon)}</span>
   <span className={styles.who} aria-label={r.initials.split('').join(' ')}>{r.initials}{own&&<b className={styles.you}>YOU</b>}</span>
   <span className={styles.pts}>{r.score.toLocaleString('en-US')}</span></li>;})}</ol>;
}
