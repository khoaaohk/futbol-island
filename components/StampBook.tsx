'use client';
/**
 * The Island stamp book (owner, Nov 23 2026): a small paper book with a page per stamp, like a Japanese eki stamp book. Flippable
 * pages (owner): a cheap CSS page turn (one leaf, two faces, rotateY round the spine; the pop-up books' prev / next / swipe / arrow
 * keys), two pages per spread on wide screens and one page at a time on phones. An empty page shows a dashed circle and how to get
 * that stamp; a stamped page shows the ink stamp (its tilt and offset fixed when stamped), "Location" and "Date" in the island's
 * brush hand, and its football fact (AGENTS.md: every stamp teaches).
 *
 * The stamping moment (`fresh`, owner Nov 25 2026: slower, so the process shows, ~2.3 s): the rubber stamp slides in and hovers with a
 * little wiggle, a short inking dab, lifts, presses down hard (squash + a ~250 ms shake of the page, the thump: the Fishbook stamp cue,
 * lib/audio/islandSound.ts 'fish-stamp'), rocks to push the ink in, lifts away with a bounce (the soft 'pop'), then the ink spreads
 * from the centre with a few specks and settles to its tilt, and Location, Date, the fact and "+N coins" write in one after another
 * (paid by StampBookHost via islandStampsReward.ts). CSS animations only. Reduced motion: no press or page travel, the ink is there.
 * While the book is open <html data-stamp-book-open> hides the "New update ready" pill (NetSaveNotice), which sat over the header.
 *
 * A modal <dialog> (top layer: opens above the Backpack, a room or a conversation). Heat: the SVGs exist only while the book is
 * open; two short timers for the stamping moment, cleared on close; no rAF.
 */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {STAMPS,STAMP_PAGES,STAMP_IDS,readStamps,stampById,stampCount,lineComplete,bookComplete,stampDate,stampPlateDate,STAMP_BOOK_BONUS,type StampId,type StampSave} from '@/lib/town/islandStamps';
import {stampSvg} from '@/lib/town/stampArt';
import {STAMP_COINS} from '@/lib/town/islandStampsReward';
import {playFishCue} from '@/lib/town/fishing/fishingDelightStore';
import {DoneButton} from './DoneButton';
import {Icon} from './Icon';
import styles from './StampBook.module.css';

const PAGES=STAMP_PAGES.length;
const SINGLE_QUERY='(max-width: 759px)';
/** The stamping beats (ms): the press starts, the rubber touches the page (thump + shake), it has lifted away (pop, the ink spreads). */
const PRESS_AT=150,PRESS_MS=2300,CONTACT_AT=PRESS_AT+Math.round(PRESS_MS*.52),LIFT_AT=PRESS_AT+Math.round(PRESS_MS*.86);
/** A spread's or page's label in the same numbers as the page corners (stamp pages 1-8; the cover and the rally page by name). */
const pageName=(i:number)=>STAMP_PAGES[i]==='cover'?'Cover':STAMP_PAGES[i]==='back'?'Stamp rally':`Page ${STAMP_IDS.indexOf(STAMP_PAGES[i] as StampId)+1}`;
type Turn={from:number;to:number;dir:1|-1};

export default function StampBook({initialPage,fresh,onClose}:{initialPage:number;fresh:StampId|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 const [save]=useState<StampSave>(()=>readStamps());
 const [single,setSingle]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia(SINGLE_QUERY).matches);
 const reduced=useMemo(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
 const viewOf=useCallback((page:number,one:boolean)=>one?page:Math.floor(page/2),[]);
 const [view,setView]=useState(()=>viewOf(initialPage,single));
 const [turn,setTurn]=useState<Turn|null>(null);
 const views=single?PAGES:Math.ceil(PAGES/2);
 // The stamping moment: wait → press (the rubber stamp comes down) → inked (the ink is on the page) → done.
 const [phase,setPhase]=useState<'wait'|'press'|'inked'|'done'>(fresh?(reduced?'inked':'wait'):'done');
 useEffect(()=>{if(!fresh)return;const timers:ReturnType<typeof setTimeout>[]=[];
  if(reduced){playFishCue('fish-stamp');timers.push(setTimeout(()=>setPhase('done'),2400));}
  else{timers.push(setTimeout(()=>setPhase('press'),PRESS_AT));timers.push(setTimeout(()=>playFishCue('fish-stamp'),CONTACT_AT));
   timers.push(setTimeout(()=>{setPhase('inked');playFishCue('pop');},LIFT_AT));timers.push(setTimeout(()=>setPhase('done'),LIFT_AT+2400));}
  return()=>timers.forEach(clearTimeout);},[fresh,reduced]);
 useEffect(()=>{const root=document.documentElement;root.setAttribute('data-stamp-book-open','');return()=>root.removeAttribute('data-stamp-book-open');},[]);
 useEffect(()=>{const d=dialog.current;if(!d)return;try{if(!d.open)d.showModal();}catch{d.setAttribute('open','');}close.current?.focus({preventScroll:true});
  const mq=typeof matchMedia!=='undefined'?matchMedia(SINGLE_QUERY):null;
  const onMq=()=>{if(!mq)return;setTurn(null);setSingle(one=>{if(one===mq.matches)return one;setView(v=>one?Math.floor(v/2):Math.min(PAGES-1,v*2+1));return mq.matches;});};
  mq?.addEventListener('change',onMq);return()=>{mq?.removeEventListener('change',onMq);try{d.close();}catch{/* already closed */}};},[]);
 const go=(to:number)=>{if(to<0||to>=views||to===view)return;if(turn)return;if(reduced){setView(to);return;}setTurn({from:view,to,dir:to>view?1:-1});};
 const landed=()=>{if(!turn)return;setView(turn.to);setTurn(null);};
 const gesture=useRef<{x:number;y:number;id:number}|null>(null);
 const onKey=(e:React.KeyboardEvent)=>{if(e.key==='ArrowRight'){e.preventDefault();go(view+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(view-1);}};
 const count=stampCount(save),line=lineComplete(save),full=bookComplete(save);
 const page=(i:number,slot:string)=>i<0||i>=PAGES?<div className={styles.blank}/>:<Page key={i} index={i} save={save} slot={slot} fresh={fresh} phase={phase} count={count} line={line} full={full} onJump={id=>go(viewOf(STAMP_PAGES.indexOf(id),single))}/>;
 // What the book shows: the settled view, or — mid-turn — the pages under the leaf plus the leaf's two faces.
 let base:[number,number],leaf:{front:number;back:number;side:'left'|'right'}|null=null;
 if(single){base=[turn?(turn.dir>0?turn.to:turn.from):view,-1];if(turn)leaf=turn.dir>0?{front:turn.from,back:-1,side:'right'}:{front:turn.to,back:-1,side:'right'};}
 else if(!turn)base=[view*2,view*2+1];
 else if(turn.dir>0){base=[turn.from*2,turn.to*2+1];leaf={front:turn.from*2+1,back:turn.to*2,side:'right'};}
 else{base=[turn.to*2,turn.from*2+1];leaf={front:turn.from*2,back:turn.to*2+1,side:'left'};}
 const pageLabel=single?(view===0||view===PAGES-1?pageName(view):stampById(STAMP_PAGES[view] as string)?.name)
  :STAMP_PAGES[view*2+1]&&STAMP_PAGES[view*2]!=='cover'&&STAMP_PAGES[view*2+1]!=='back'?`Pages ${STAMP_IDS.indexOf(STAMP_PAGES[view*2] as StampId)+1}–${STAMP_IDS.indexOf(STAMP_PAGES[view*2+1] as StampId)+1}`
  :`${pageName(view*2)} · ${view*2+1<PAGES?pageName(view*2+1):''}`.replace(/ · $/,'');
 return <dialog ref={dialog} className={styles.dialog} aria-labelledby="stamp-book-title" data-stamp-book data-single={single||undefined} data-view={view}
  onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={onKey} onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className={styles.wrap} onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}>
   <header className={styles.bar}>
    <p className={styles.tally} data-stamp-count={count} aria-label={`${count} of ${STAMPS.length} stamps`}>{count} of {STAMPS.length}<span className={styles.tallyWord}> stamps</span></p>
    <h2 id="stamp-book-title">Island stamp book</h2>
    <DoneButton ref={close} onDone={onClose} className={styles.done}/>
   </header>
   <div className={styles.stage} onPointerDown={e=>{if(e.isPrimary)gesture.current={x:e.clientX,y:e.clientY,id:e.pointerId};}} onPointerCancel={()=>{gesture.current=null;}}
    onPointerUp={e=>{const g=gesture.current;gesture.current=null;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)go(view+(dx<0?1:-1));}}>
    <div className={styles.book} data-turning={turn?turn.dir:undefined}>
     <div className={`${styles.side} ${styles.left}`}>{page(base[0],'a')}</div>
     {!single&&<div className={`${styles.side} ${styles.right}`}>{page(base[1],'b')}</div>}
     {leaf&&<div className={`${styles.leaf} ${leaf.side==='left'?styles.leafLeft:styles.leafRight}`} data-dir={turn!.dir} data-single={single||undefined} onAnimationEnd={landed} aria-hidden="true">
      <div className={`${styles.face} ${leaf.side==='left'?styles.left:styles.right}`}>{page(leaf.front,'c')}</div>
      {!single&&<div className={`${styles.face} ${styles.back} ${leaf.side==='left'?styles.right:styles.left}`}>{page(leaf.back,'d')}</div>}
     </div>}
    </div>
   </div>
   <nav className={styles.nav} aria-label="Stamp book pages">
    <button type="button" className={styles.turn} data-stamp-nav="prev" disabled={view===0} onClick={()=>go(view-1)} aria-label="Previous page"><Icon name="back" size={22}/></button>
    <p className={styles.where} aria-live="polite">{pageLabel}</p>
    <button type="button" className={styles.turn} data-stamp-nav="next" disabled={view===views-1} onClick={()=>go(view+1)} aria-label="Next page"><Icon name="arrow" size={22}/></button>
   </nav>
  </div>
 </dialog>;
}

function Page({index,save,slot,fresh,phase,count,line,full,onJump}:{index:number;save:StampSave;slot:string;fresh:StampId|null;phase:'wait'|'press'|'inked'|'done';count:number;line:boolean;full:boolean;onJump:(id:StampId)=>void}){
 const key=STAMP_PAGES[index];
 if(key==='cover')return <section className={`${styles.page} ${styles.cover}`} data-stamp-page="cover">
  <h3 className={styles.coverTitle}>Island stamp book</h3>
  <p className={styles.coverSub}>Island Line · Futbol Island</p>
  <p className={styles.coverCount}><b>{count}</b><span>of {STAMPS.length}</span></p>
  <div className={styles.seals}>
   <span className={styles.seal} data-earned={line||undefined} data-stamp-seal="line">{line?'Line complete':'5 stations'}</span>
   <span className={`${styles.seal} ${styles.gold}`} data-earned={full||undefined} data-stamp-seal="book">{full?'Book complete':'All 8'}</span>
  </div>
  <p className={styles.coverNote}>Collect a round ink stamp at every Island Line station, the Konbini, the History Museum and the Kit Shop. Each stamp comes with a football fact.</p>
 </section>;
 if(key==='back')return <section className={`${styles.page} ${styles.rally}`} data-stamp-page="back">
  <h3>Stamp rally</h3>
  <ul>{STAMPS.map(s=>{const got=!!save.stamps[s.id];return <li key={s.id}><button type="button" onClick={()=>onJump(s.id)} data-got={got||undefined}>
   <span className={styles.dot} style={{color:s.ink}} aria-hidden="true"/><span><b>{s.name}</b><small>{s.where==='station'?'Station house':s.place.split(' · ')[1]}</small></span><em>{got?'Stamped':'Not yet'}</em></button></li>;})}</ul>
  <p className={styles.rallyNote}>+{STAMP_COINS} coins for each new stamp, +{STAMP_BOOK_BONUS} when the book is full.</p>
 </section>;
 const def=stampById(key)!,mark=save.stamps[def.id],isFresh=fresh===def.id,showInk=!!mark&&(!isFresh||phase==='inked'||phase==='done');
 const svg=mark?stampSvg(def.id,`${def.id}-${slot}`,stampPlateDate(mark.at)):'';
 const writing=isFresh&&(phase==='inked'||phase==='done'),hideText=isFresh&&!writing;
 return <section className={styles.page} data-stamp-page={def.id} data-stamped={mark?'1':undefined} data-pressing={isFresh&&phase==='press'||undefined} data-writing={writing||undefined}>
  <p className={styles.pageNo}>{STAMP_IDS.indexOf(def.id)+1}</p>
  <div className={styles.slot} data-empty={!mark||undefined}>
   {!mark&&<p className={styles.how}>{def.how}</p>}
   {mark&&<div className={styles.ink} data-shown={showInk||undefined} style={{transform:`translate(${mark.dx}%,${mark.dy}%) rotate(${mark.tilt}deg)`}} dangerouslySetInnerHTML={{__html:svg}}/>}
   {isFresh&&phase==='press'&&<div className={styles.stamper} style={{color:def.ink}} aria-hidden="true"><span className={styles.knob}/><span className={styles.block}/><span className={styles.rubber}/></div>}
   {writing&&<span className={styles.specks} style={{color:def.ink}} aria-hidden="true"><i/><i/><i/><i/><i/></span>}
   {isFresh&&(phase==='inked'||phase==='done')&&<p className={styles.coins} role="status">New stamp! +{STAMP_COINS} coins</p>}
  </div>
  <dl className={styles.fields}>
   <div><dt>Location</dt><dd>{mark&&!hideText?def.place:''}</dd></div>
   <div><dt>Date</dt><dd>{mark&&!hideText?stampDate(mark.at):''}</dd></div>
  </dl>
  {mark&&!hideText?<div className={styles.fact} data-fresh={isFresh||undefined}><h4>Football fact</h4><p>{def.fact}</p><small>Source: {def.source}</small></div>
   :hideText?null:<p className={styles.locked}>Collect this stamp to read its football fact.</p>}
 </section>;
}
