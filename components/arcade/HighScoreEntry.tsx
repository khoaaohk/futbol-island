'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {BOARD_ICONS,BOARD_RULES,cleanInitials,initialsBlocked,qualifies,rankFor,type BoardGame} from '@/lib/arcade/leaderboard';
import {fetchIslandBoards,hasBoardSession,postScore,readLocalBoards,type IslandBoards,type PostResult} from '@/lib/arcade/boardClient';
import {BoardDialog,BoardsPanel} from './BoardsPanel';
import {BoardIcon} from './BoardIcon';
import styles from './Leaderboard.module.css';

const A=65;
const letterAt=(s:string,i:number)=>s.charCodeAt(i)-A;
const withLetter=(s:string,i:number,n:number)=>s.slice(0,i)+String.fromCharCode(A+((n%26)+26)%26)+s.slice(i+1);
/** Where the score lands: its place on the island all-time board (only then is the entry offered; Nov 17 2026). */
type Place={all:number;island:IslandBoards};
/** The seven arcade-room games show their results card first (owner, Nov 10 2026); anywhere else the entry opens at once, as before. */
const RESULTS_FIRST=['kitrush','snake','airhockey','lineup','trophydrop','rollball','ballblaster','runner','tennis','pinball','pass-puzzle'].map(k=>`[data-arcade-kind="${k}"]`).join(',');
const ISLAND_WHY:Record<string,string>={short:'The island board needs a full game. Play a little longer next time!',fast:'That score couldn’t be checked, so it isn’t on the island board. Your score is saved.',
 'not-top':'Someone just beat that score on the island. Your score is saved.',busy:'The island board is busy. Your score is saved.',unavailable:'The island board can’t be reached right now. Your score is saved.',
 invalid:'The island board couldn’t take that score. Your score is saved.',none:'The island board can’t be reached right now. Your score is saved.'};

/**
 * Game over → "New high score!" when the score makes the island ALL-TIME board (its top 20, or 10 before the SQL; Nov 17 2026,
 * owner: "for the high score only have all time. remove this week and device."). Any other score is still kept on the device
 * silently (postScore, island off, under the letters used last time), exactly as before; no device board or rank is shown.
 * Lazy-loaded by the games only after a scored game ends; renders nothing (and calls onClose) when the score doesn't qualify.
 * The player picks three letters on arcade wheels (no typing, no names) and, if they like, a picture. Skip saves on this
 * device only (never on the island board).
 * Results first (Nov 10 2026): in the seven arcade games a qualifying score no longer opens the dialog over the results card. A short
 * strip ("New high score! · Add my initials") sits in the card's `[data-hs-slot]` (or docks just under the score bar when the game
 * has no slot), so the score, medal and near-miss line stay readable and Play again stays one tap away. The strip opens the same
 * dialog; leaving without opening it saves exactly as Skip does (the device only, under the letters used last time).
 */
export default function HighScoreEntry({game,score,detail,onClose}:{game:BoardGame;score:number;detail?:string;onClose:()=>void}){
 const [place,setPlace]=useState<Place|null>(null),[initials,setInitials]=useState('AAA'),[icon,setIcon]=useState(''),[active,setActive]=useState(0);
 const [roll,setRoll]=useState<{i:number;dir:'up'|'down';n:number}|null>(null),[saving,setSaving]=useState(false),[result,setResult]=useState<PostResult|null>(null);
 const closeRef=useRef(onClose);closeRef.current=onClose;
 const [open,setOpen]=useState(()=>typeof document==='undefined'||!document.querySelector(RESULTS_FIRST)),[slot,setSlot]=useState<Element|null>(null);
 const leave=useRef<(()=>void)|null>(null);useEffect(()=>()=>{leave.current?.();},[]);
 useEffect(()=>{let live=true;const local=readLocalBoards();if(local.me){setInitials(local.me.initials);setIcon(local.me.icon);}
  const device=qualifies(local.boards[game]??[],score);
  const check=async()=>{const island=hasBoardSession(game)?await fetchIslandBoards(game,{fresh:true}):null;if(!live)return;
   if(!island||!qualifies(island.all,score,island.size)){
    // Not an all-time place (or no island board): no entry, but the device keeps the score as it always has (personal bests).
    if(device)void postScore(game,score,local.me?.initials??'AAA',local.me?.icon??'',false);
    closeRef.current();return;}
   setSlot(document.querySelector('[data-hs-slot]'));setPlace({all:rankFor(island.all,score),island});};
  void check();return()=>{live=false;};
 },[game,score]);
 const set=(i:number,delta:number)=>{setInitials(s=>withLetter(s,i,letterAt(s,i)+delta));setActive(i);setRoll(r=>({i,dir:delta>0?'up':'down',n:(r?.n??0)+1}));};
 const blocked=initialsBlocked(initials),valid=!!cleanInitials(initials);
 const save=async(skip:boolean)=>{if(saving||(!skip&&!valid))return;setSaving(true);
  // Skip still keeps the score on this device, under the letters on the wheels (or AAA if those are blocked), and goes no further.
  const r=await postScore(game,score,valid?initials:'AAA',valid?icon:'',!skip&&!!place);
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
 // Never opened: the score is kept the way Skip keeps it, once, when the strip goes away (Play again, Arcade, a new game), and the
 // host hears onClose exactly as it does after Skip (Pass Puzzles holds its Escape key while an entry is pending).
 leave.current=!open&&place&&!saving&&!result?()=>{void postScore(game,score,valid?initials:'AAA',valid?icon:'',false);closeRef.current();}:null;
 if(!place)return null;
 const rules=BOARD_RULES[game];
 if(result){
  const isl=result.island,onBoard=isl.ok&&isl.all!==null?isl.all:null;
  const cheer=onBoard===1?'You’re #1 on the island, of all time!':onBoard!==null?`You’re #${onBoard} on the island, all time!`:'Score saved.';
  // Accepted but no longer on the all-time board (beaten in the meantime) reads like not-top.
  const why=isl.ok?(onBoard===null?ISLAND_WHY['not-top']:''):ISLAND_WHY[isl.reason];
  return <BoardDialog label={`${rules.name} high scores`} title="High scores" onClose={()=>closeRef.current()}>
   <p className={styles.cheer} data-board-cheer role="status">{cheer}</p>
   {why&&<p className={styles.small} data-board-small>{why}</p>}
   <BoardsPanel game={game} island={isl.ok?isl.boards:undefined} fresh={{id:onBoard!==null&&isl.ok?isl.id:undefined}}/>
   <div className={styles.actions} data-board-actions><button type="button" className={`${styles.pill} ${styles.gold}`} data-board-btn="primary" onClick={()=>closeRef.current()}>Done</button></div>
  </BoardDialog>;
 }
 const where=place.all===1?'That’s #1 on the island, of all time!':`That’s #${place.all} on the island, all time!`;
 if(!open){
  const strip=<aside className={styles.prompt} data-hs-prompt={slot?'inline':'docked'} aria-label="New high score">
   <p role="status"><b>New high score!</b><span>{where}</span></p>
   <button type="button" data-hs-open onClick={()=>setOpen(true)}>Add my initials</button>
  </aside>;
  return slot&&slot.isConnected?createPortal(strip,slot):strip;
 }
 return <BoardDialog label="New high score" title="New high score!" gold closeLabel="Skip" onClose={()=>void save(true)} onKeyDown={keys}>
  <div className={styles.pick} data-hs-pick><div>
  <div className={styles.lead} data-hs-lead><span>{rules.name}</span><strong>{score.toLocaleString('en-US')}</strong><span>{rules.unit}</span><em>{where}</em></div>
  {detail&&<p className={styles.learn} data-board-learn>{detail}</p>}
  <span className={styles.label} data-hs-label id="hs-letters">Your three letters</span>
  <div className={styles.wheels} data-hs-wheels role="group" aria-labelledby="hs-letters">{[0,1,2].map(i=><div key={i} className={styles.wheel} data-hs-wheel>
   <button type="button" className={styles.step} data-hs-step="up" aria-label={`Letter ${i+1}: next letter`} onClick={()=>set(i,1)}>▲</button>
   <button type="button" data-wheel={i} data-autofocus={i===0||undefined} className={styles.tile} aria-current={active===i?'true':undefined} aria-label={`Letter ${i+1}: ${initials[i]}. Drag up or down, or type a letter.`}
    onClick={()=>setActive(i)} onPointerDown={wheelDown(i)} onPointerMove={wheelMove} onPointerUp={wheelUp} onPointerCancel={wheelUp} onLostPointerCapture={wheelUp}>
    <span key={roll?.i===i?roll.n:0} data-dir={roll?.i===i?roll.dir:undefined}>{initials[i]}</span></button>
   <button type="button" className={styles.step} data-hs-step="down" aria-label={`Letter ${i+1}: previous letter`} onClick={()=>set(i,-1)}>▼</button>
  </div>)}</div>
  <p className={styles.blocked} data-hs-blocked role="status" aria-live="polite">{blocked?'Those letters aren’t allowed. Try different ones!':''}</p>
  </div><div>
  <span className={styles.label} data-hs-label id="hs-icons">Pick a picture (optional)</span>
  <div className={styles.icons} data-hs-icons role="group" aria-labelledby="hs-icons">
   <button type="button" className={styles.icon} data-hs-icon aria-pressed={icon===''} aria-label="No picture" onClick={()=>setIcon('')}><small>none</small></button>
   {BOARD_ICONS.map(p=><button key={p.id} type="button" className={styles.icon} data-hs-icon aria-pressed={icon===p.id} aria-label={p.label} onClick={()=>setIcon(p.id)}><BoardIcon id={p.id} size={30}/></button>)}
  </div>
  <div className={styles.actions} data-board-actions>
   <button type="button" className={`${styles.pill} ${styles.gold}`} data-board-btn="primary" disabled={!valid||saving} onClick={()=>void save(false)}>{saving?'Saving…':'Save to the board'}</button>
   <button type="button" className={`${styles.pill} ${styles.cream}`} data-board-btn="secondary" disabled={saving} onClick={()=>void save(true)}>Skip</button>
   <p className={styles.small} data-board-small>Only your three letters and picture show on the island board. Skip saves your score without adding it to the board.</p>
  </div>
  </div></div>
 </BoardDialog>;
}
