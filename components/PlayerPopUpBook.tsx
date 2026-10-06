'use client';
import {useEffect,useRef,useState} from 'react';
import {BOOK_PROGRESS_KEY,boundedBookPage} from '@/lib/books/messi';
import {BOOKS,loadSpreads} from '@/lib/books/library';
import type {SpreadDef} from '@/lib/books/popupEngine';
import type {PlayerBookId} from '@/lib/books/catalog';
import {holdVideoPlayback} from '@/lib/videoPlayback';
import StoryPlaybackBar from './StoryPlaybackBar';
import {BackButton} from './BackButton';
import {Icon} from './Icon';
import {getSoundVolume,isSoundEnabled} from '@/lib/games/sound';
import {createBookAudio} from '@/lib/books/bookAudio';
import {useBookNarration} from '@/lib/books/useBookNarration';
import PlayerBookScene from './PlayerBookScene';
import BookGameCheck from './BookGameCheck';
import styles from './PlayerPopUpBook.module.css';

function readProgress():Record<string,number>{try{const saved=JSON.parse(localStorage.getItem(BOOK_PROGRESS_KEY)||'null');return saved?.version===1&&typeof saved==='object'?saved:{};}catch{return {};}}
function savedPage(bookId:PlayerBookId){return boundedBookPage(readProgress()[bookId],BOOKS[bookId].pages.length);}

/** Purchased paper story. Only finite scene interactions render; narration uses native media events. */
export default function PlayerPopUpBook({bookId,onClose}:{bookId:PlayerBookId;onClose:()=>void}){
 const audio=useRef<ReturnType<typeof createBookAudio>|null>(null);
 const [musicMuted,setMusicMuted]=useState(()=>!isSoundEnabled()||getSoundVolume()===0);
 const [turning,setTurning]=useState(false);
 const [closing,setClosing]=useState(false),[fading,setFading]=useState(false),fadeTimer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(fadeTimer.current)clearTimeout(fadeTimer.current);},[]);
 /** After the book has folded shut, the whole reader fades out (one short CSS transition), then unmounts. */
 const finishClose=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}setFading(true);fadeTimer.current=setTimeout(onClose,260);};
 const [page,setPage]=useState(()=>savedPage(bookId)),[ready,setReady]=useState(false),[steps,setSteps]=useState<Record<number,number>>({});
 const swiped=useRef(false);
 const gesture=useRef<{x:number;y:number;id:number}|null>(null);
 const stage=useRef<HTMLElement>(null);
 const root=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null);
 const [spreads,setSpreads]=useState<Record<string,SpreadDef>|null>(null);
 const story=BOOKS[bookId],current=story.pages[page],amount=steps[page]??0,target=current.steps??1;
 const narration=useBookNarration(current.id,bookId);
 useEffect(()=>{let live=true;void loadSpreads(bookId).then(s=>{if(live)setSpreads(s);}).catch(()=>{if(live)setSpreads({});});return()=>{live=false;};},[bookId]);
 // Oct 5 2026 (user: "when clicking next … flip the pages and auto play so the user doesn't have to click play"): a page turn
 // asks Coach Bella to start the new page once the flip has landed. `seen` notes that the flip began, so narration never
 // starts mid-fold; a one-shot fallback covers turns that don't animate (reduced motion, spreads still loading).
 const autoPlay=useRef<{page:number;seen:boolean;at:number}|null>(null);
 const turn=(next:number)=>{if(turning||next<0||next>=story.pages.length)return;narration.onPause();autoPlay.current={page:next,seen:false,at:performance.now()};audio.current?.setMuted(musicMuted);void audio.current?.play(next,'turn');setPage(next);stage.current?.scrollTo({top:0});try{localStorage.setItem(BOOK_PROGRESS_KEY,JSON.stringify({...readProgress(),version:1,[bookId]:next}));}catch{/* Reading remains available without storage. */}};
 useEffect(()=>{const a=autoPlay.current;if(!a||a.page!==page||closing)return;if(turning){a.seen=true;return;}
  const start=()=>{if(autoPlay.current!==a)return;autoPlay.current=null;narration.onReplay();};
  if(a.seen||matchMedia('(prefers-reduced-motion: reduce)').matches){start();return;}
  const fallback=setTimeout(()=>{if(autoPlay.current===a&&!a.seen)start();},900);return()=>clearTimeout(fallback);
 },[page,turning,closing,narration.onReplay]);
 const interact=()=>{if(turning||closing)return;void audio.current?.play(page,'action');setSteps(s=>({...s,[page]:(s[page]??0)>=target?0:(s[page]??0)+1}));};
 useEffect(()=>{const sound=createBookAudio(musicMuted,getSoundVolume());audio.current=sound;void sound.play(page,'open');return()=>{sound.dispose();audio.current=null;};},[]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{audio.current?.setMuted(musicMuted||narration.playing);},[musicMuted,narration.playing]);
 // When Coach Bella finishes the page, her narration has already performed the page action, so the button switches to
 // "Try the page again" (tapping it undoes, then redoes the action) instead of offering an action that already happened.
 useEffect(()=>{if(narration.completed)setSteps(s=>(s[page]??0)>=target?s:{...s,[page]:target});},[narration.completed,page,target]);
 useEffect(()=>{
  const release=holdVideoPlayback(),before=document.activeElement instanceof HTMLElement?document.activeElement:null;
  setReady(true);close.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&root.current?.querySelector('[aria-label="Story transcript"]')){e.preventDefault();e.stopPropagation();root.current.querySelector<HTMLButtonElement>('[data-transcript-back]')?.click();return;}// Bug audit B11: while the "Take it to your game" card is open, Escape closes only the card and Tab stays inside it.
  const check=root.current?.querySelector<HTMLElement>('[data-book-check]')??null,trap=check??root.current;
  if(e.key==='Escape'&&check){e.preventDefault();e.stopPropagation();check.querySelector<HTMLButtonElement>('[data-book-check-close]')?.click();return;}
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current?.click();return;}if(e.key==='Tab'){
   const nodes=Array.from(trap?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],summary,input:not([disabled]),[tabindex="0"]')??[]).filter(n=>n.getClientRects().length>0);
   const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||!trap?.contains(document.activeElement))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||!trap?.contains(document.activeElement))){e.preventDefault();first?.focus();}
  }};
  document.addEventListener('keydown',key,true);return()=>{release();document.removeEventListener('keydown',key,true);before?.focus({preventScroll:true});};
 },[bookId,story.pages.length]);
 const label=`${current.title}. A paper pop-up spread. ${amount>=target?current.response:current.prompt}.`;
 const swipe={onPointerDown:(e:React.PointerEvent)=>{swiped.current=false;if(e.isPrimary)gesture.current={x:e.clientX,y:e.clientY,id:e.pointerId};},onPointerCancel:()=>{gesture.current=null;},onPointerUp:(e:React.PointerEvent)=>{const g=gesture.current;gesture.current=null;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6){swiped.current=true;turn(page+(dx<0?1:-1));}}};
 return <section ref={root} className={styles.reader} data-fading={fading||undefined} role="dialog" aria-modal="true" aria-labelledby="player-book-title" data-player-book={bookId} data-page={page} onKeyDown={e=>{if(e.altKey||e.ctrlKey||e.metaKey||(e.target instanceof HTMLElement&&e.target.closest('input,textarea,select,[contenteditable=true],[data-story-playback-bar],[data-book-check]')))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();turn(page+(e.key==='ArrowRight'?1:-1));}}}>
  <h1 id="player-book-title" className={styles.srOnly}>{story.title}: {story.subtitle}</h1>
  <header className={styles.header}><BackButton ref={close} onBack={()=>{narration.onPause();setClosing(true);}}/></header>
  <div className={styles.chapterLine} data-chapter-line><span className={styles.year}>{current.year}</span><h2>{current.title}</h2></div>
  <main ref={stage} className={styles.stage}>
   {ready&&spreads&&<div className={styles.picture} role="button" tabIndex={0} aria-label={amount>=target?'Try the page again':current.prompt} onClick={()=>{if(!swiped.current)interact();swiped.current=false;}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();interact();}}} {...swipe}>
    <PlayerBookScene book={story} bookId={bookId} spreads={spreads} pageIndex={page} progress={Math.min(1,amount/target)} onTurning={setTurning} clock={narration.readClock} narrationTime={narration.time} narrationStarted={narration.started} narrationPlaying={narration.playing} closing={closing} onClosed={finishClose} label={label}/>
   </div>}
  </main>
  {/* Lane 3: after the last page, one "Take it to your game" question tied to a Paths lesson (lib/learning/bookChecks.ts). */}
  {ready&&page===story.pages.length-1&&<BookGameCheck bookId={bookId} onOpenLesson={onClose}/>}
  <nav className={styles.navigation} aria-label="Book pages">
   <button type="button" data-page-nav="prev" disabled={page===0||turning} onClick={()=>{turn(page-1);}} aria-label="Previous page"><Icon name="back" size={22}/></button>
   <div className={styles.activity}>
    <button type="button" data-book-action disabled={turning} onClick={interact}>{amount>=target?'Try the page again':current.prompt}{target>1&&amount<target?` · ${amount}/${target}`:''}<span aria-hidden="true">↗</span></button>
    <p className={styles.srOnly} role="status">{turning?'The paper world is unfolding…':amount>=target?current.response:''}</p>
   </div>
   <button type="button" data-page-nav="next" disabled={turning} onClick={()=>{if(page===story.pages.length-1){turn(0);}else turn(page+1);}} aria-label={page===story.pages.length-1?'Read again':'Next page'}><Icon name={page===story.pages.length-1?'reset':'arrow'} size={22}/></button>
  </nav>
  <StoryPlaybackBar className={styles.playback} title={`${story.title} · ${current.title}`} playing={narration.playing} started={narration.started} completed={narration.completed} muted={narration.muted} time={narration.time} duration={narration.duration} caption={narration.caption||'Press Play to hear Coach Bella tell this chapter, or Read to explore the story.'} captionStart={narration.captionStart} captionDuration={narration.captionDuration} captionId={current.id} transcript={[{label:current.title,narration:current.text},{label:'Take it to your game',narration:current.lesson}]} onToggle={narration.onToggle} onReplay={narration.onReplay} onPause={narration.onPause} onMute={()=>{const muted=!narration.muted;narration.onMute();setMusicMuted(muted);audio.current?.setMuted(muted||narration.playing);}} onSeekTime={narration.onSeekTime} error={narration.error}/>
 </section>;
}
