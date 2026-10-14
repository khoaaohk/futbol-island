'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {BOARD_ICONS,BOARD_RULES,cleanInitials,initialsBlocked,qualifies,rankFor,type BoardGame} from '@/lib/arcade/leaderboard';
import {fetchIslandBoards,hasBoardSession,postScore,readLocalBoards,type IslandBoards,type PostResult} from '@/lib/arcade/boardClient';
import {BoardDialog,BoardsPanel} from './BoardsPanel';
import type {BoardTab} from './BoardTable';
import styles from './Leaderboard.module.css';

const A=65;
const letterAt=(s:string,i:number)=>s.charCodeAt(i)-A;
const withLetter=(s:string,i:number,n:number)=>s.slice(0,i)+String.fromCharCode(A+((n%26)+26)%26)+s.slice(i+1);
/** Where the score lands: island week / island all-time (when a play session is held) and this device. */
type Place={week:number|null;all:number|null;device:number|null;island:IslandBoards|null};
const ISLAND_WHY:Record<string,string>={short:'The island board needs a full game. Play a little longer next time!',fast:'That score couldn’t be checked, so it stayed on this device.',
 'not-top':'Someone just beat that score on the island. It’s saved on this device.',busy:'The island board is busy. Your score is saved on this device.',unavailable:'The island board can’t be reached right now. Your score is saved on this device.',
 invalid:'The island board couldn’t take that score. It’s saved on this device.',none:''};

/**
 * Game over → "New high score!" when the score makes a top 10 (the island's week or all-time board, or this device's).
 * Lazy-loaded by the games only after a scored game ends; renders nothing (and calls onClose) when the score doesn't qualify.
 * The player picks three letters on arcade wheels (no typing, no names) and, if they like, a picture. Skip saves on this
 * device only.
 */
export default function HighScoreEntry({game,score,detail,onClose}:{game:BoardGame;score:number;detail?:string;onClose:()=>void}){
 const [place,setPlace]=useState<Place|null>(null),[initials,setInitials]=useState('AAA'),[icon,setIcon]=useState(''),[active,setActive]=useState(0);
 const [roll,setRoll]=useState<{i:number;dir:'up'|'down';n:number}|null>(null),[saving,setSaving]=useState(false),[result,setResult]=useState<PostResult|null>(null);
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{let live=true;const local=readLocalBoards();if(local.me){setInitials(local.me.initials);setIcon(local.me.icon);}
  const device=qualifies(local.boards[game]??[],score)?rankFor(local.boards[game]??[],score):null;
  const check=async()=>{const island=hasBoardSession(game)?await fetchIslandBoards(game,{fresh:true}):null;if(!live)return;
   const week=island&&qualifies(island.weekly,score)?rankFor(island.weekly,score):null,all=island&&qualifies(island.all,score)?rankFor(island.all,score):null;
   if(week===null&&all===null&&device===null){closeRef.current();return;}
   setPlace({week,all,device,island});};
  void check();return()=>{live=false;};
 },[game,score]);
 const set=(i:number,delta:number)=>{setInitials(s=>withLetter(s,i,letterAt(s,i)+delta));setActive(i);setRoll(r=>({i,dir:delta>0?'up':'down',n:(r?.n??0)+1}));};
 const blocked=initialsBlocked(initials),valid=!!cleanInitials(initials);
 const save=async(skip:boolean)=>{if(saving||(!skip&&!valid))return;setSaving(true);
  // Skip still keeps the score on this device, under the letters on the wheels (or AAA if those are blocked), and goes no further.
  const r=await postScore(game,score,valid?initials:'AAA',valid?icon:'',!skip&&!!place&&(place.week!==null||place.all!==null));
  if(skip){closeRef.current();return;}setResult(r);setSaving(false);};
 // Desktop: type a letter to set the lit wheel, arrows roll and move, Backspace steps back, Enter saves.
 const keys=(e:React.KeyboardEvent<HTMLDialogElement>)=>{if(result||!place)return;const t=e.target as HTMLElement;
  if(/^Key[A-Z]$/.test(e.code)&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();const ch=e.code.slice(3);setInitials(s=>s.slice(0,active)+ch+s.slice(active+1));setActive(a=>Math.min(2,a+1));return;}
  if(e.code==='ArrowUp'||e.code==='ArrowDown'){e.preventDefault();set(active,e.code==='ArrowUp'?1:-1);return;}
  if(e.code==='ArrowLeft'||e.code==='ArrowRight'){if(t.tagName==='BUTTON'&&!t.dataset.wheel)return;e.preventDefault();setActive(a=>Math.max(0,Math.min(2,a+(e.code==='ArrowLeft'?-1:1))));return;}
  if(e.code==='Backspace'){e.preventDefault();setActive(a=>Math.max(0,a-1));return;}
  if(e.code==='Enter'&&t.tagName!=='BUTTON'){e.preventDefault();void save(false);}};
 // A vertical drag on a letter rolls it (one letter per 28 px), like flicking a real wheel.
 const drag=useRef<{id:number;y:number;i:number}|null>(null);
 const wheelDown=(i:number)=>(e:PointerEvent<HTMLButtonElement>)=>{drag.current={id:e.pointerId,y:e.clientY,i};setActive(i);try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}};
 const wheelMove=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const steps=Math.trunc((e.clientY-d.y)/28);if(steps){d.y+=steps*28;set(d.i,-steps);}};
 const wheelUp=()=>{drag.current=null;};
 if(!place)return null;
 const rules=BOARD_RULES[game],islandOn=place.week!==null||place.all!==null;
 if(result){
  const isl=result.island,tab:BoardTab=isl.ok?(isl.all!==null&&isl.week===null?'all':isl.week!==null?'week':'device'):'device';
  const cheer=isl.ok&&isl.all===1?'You’re #1 on the island, of all time!':isl.ok&&isl.week!==null?`You’re #${isl.week} on the island this week!`:isl.ok&&isl.all!==null?`You’re #${isl.all} on the island, all time!`:result.local!==null?`You’re #${result.local} on this device!`:'Score saved.';
  return <BoardDialog label={`${rules.name} high scores`} title="High scores" onClose={()=>closeRef.current()}>
   <p className={styles.cheer} role="status">{cheer}</p>
   {!isl.ok&&isl.reason!=='none'&&islandOn&&<p className={styles.small}>{ISLAND_WHY[isl.reason]}</p>}
   <BoardsPanel game={game} tab={tab} island={isl.ok?isl.boards:undefined} fresh={{id:isl.ok?isl.id:undefined,seq:result.local!==null?result.seq:undefined}}/>
   <div className={styles.actions}><button type="button" className={`${styles.pill} ${styles.gold}`} onClick={()=>closeRef.current()}>Done</button></div>
  </BoardDialog>;
 }
 const where=place.week!==null?`That’s #${place.week} on the island this week!`:place.all!==null?`That’s #${place.all} on the island, all time!`:`That’s #${place.device} on this device!`;
 return <BoardDialog label="New high score" title="New high score!" gold closeLabel="Skip" onClose={()=>void save(true)} onKeyDown={keys}>
  <div className={styles.pick}><div>
  <div className={styles.lead}><span>{rules.name}</span><strong>{score.toLocaleString('en-US')}</strong><span>{rules.unit}</span><em>{where}</em></div>
  {detail&&<p className={styles.learn}>{detail}</p>}
  <span className={styles.label} id="hs-letters">Your three letters</span>
  <div className={styles.wheels} role="group" aria-labelledby="hs-letters">{[0,1,2].map(i=><div key={i} className={styles.wheel}>
   <button type="button" className={styles.step} aria-label={`Letter ${i+1}: next letter`} onClick={()=>set(i,1)}>▲</button>
   <button type="button" data-wheel={i} data-autofocus={i===0||undefined} className={styles.tile} aria-current={active===i?'true':undefined} aria-label={`Letter ${i+1}: ${initials[i]}. Drag up or down, or type a letter.`}
    onClick={()=>setActive(i)} onPointerDown={wheelDown(i)} onPointerMove={wheelMove} onPointerUp={wheelUp} onPointerCancel={wheelUp} onLostPointerCapture={wheelUp}>
    <span key={roll?.i===i?roll.n:0} data-dir={roll?.i===i?roll.dir:undefined}>{initials[i]}</span></button>
   <button type="button" className={styles.step} aria-label={`Letter ${i+1}: previous letter`} onClick={()=>set(i,-1)}>▼</button>
  </div>)}</div>
  <p className={styles.blocked} role="status" aria-live="polite">{blocked?'Those letters aren’t allowed. Try different ones!':''}</p>
  </div><div>
  <span className={styles.label} id="hs-icons">Pick a picture (optional)</span>
  <div className={styles.icons} role="group" aria-labelledby="hs-icons">
   <button type="button" className={styles.icon} aria-pressed={icon===''} aria-label="No picture" onClick={()=>setIcon('')}><small>none</small></button>
   {BOARD_ICONS.map(p=><button key={p.id} type="button" className={styles.icon} aria-pressed={icon===p.id} aria-label={p.label} onClick={()=>setIcon(p.id)}>{p.emoji}</button>)}
  </div>
  <div className={styles.actions}>
   <button type="button" className={`${styles.pill} ${styles.gold}`} disabled={!valid||saving} onClick={()=>void save(false)}>{saving?'Saving…':islandOn?'Save to the boards':'Save my score'}</button>
   <button type="button" className={`${styles.pill} ${styles.cream}`} disabled={saving} onClick={()=>void save(true)}>Skip</button>
   <p className={styles.small}>{islandOn?'Only your three letters and picture show on the island board. Skip keeps the score on this device only.':'Skip keeps the score on this device too.'}</p>
  </div>
  </div></div>
 </BoardDialog>;
}
