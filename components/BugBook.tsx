'use client';
/**
 * The Bug book (Oct 20 2026, docs/island-jobs.md §15 "Bug extras"): the eight Bug squad bugs and the eight firefly calls, each with
 * its football position or call and the lesson from its catch. Locked pages are silhouettes until caught on a shift. Completing
 * all sixteen earns the "Full squad" sticker and a one-time learning bonus (lib/town/jobs/bugBookReward.ts). The Fishbook's
 * look and drawer (Fishbook.module.css, ModalShell): a side drawer on desktop, full screen on phones. Opened with OPEN_BUG_BOOK
 * from the bug jobs' cards. Reads the save when it opens; no timers but the close slide.
 */
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import styles from './Fishbook.module.css';
import own from './BugBook.module.css';
import {BUG_BOOK_PAGES,BUG_IDS,bugBookComplete,bugsCaught,firefliesCaught,nightBookComplete,emptyBugBook,pageCaught,readBugBook,type BugBookPage,type BugBookSave} from '@/lib/town/jobs/bugBook';
import {storyFor} from '@/lib/town/jobs/bugCatch';
import {BUG_JOB_LESSON,FIREFLY_JOB_LESSON} from '@/lib/town/jobs/bugScout';
import {claimBugBookReward} from '@/lib/town/jobs/bugBookReward';
import {countBugBookOpen} from '@/lib/analytics/summitEvents';
import {LEARN_COINS} from '@/lib/economy';

/** Pentagon points around (cx, cy). */
const penta=(cx:number,cy:number,r:number)=>Array.from({length:5},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;}).join(' ');
/** Flat top-down art from the same shape as the 3D bug (lib/town/jobs/bugShape.ts): tinted wings with dark pentagon spots, a
 *  dark body. Fireflies: a small body with a glowing tail. Locked: one flat silhouette colour, no details. */
export function BugArt({page,hidden,size=72}:{page:BugBookPage;hidden:boolean;size?:number}){
 const sil='#4f6f66',dark=hidden?sil:'#2b2620';
 if(page.kind==='firefly')return <svg viewBox="0 0 80 64" width={size} height={size*.8} aria-hidden="true" className={own.art} data-locked={hidden||undefined}>
  {!hidden&&<><circle cx="40" cy="44" r="18" fill="#e9ff6b" opacity=".22"/><circle cx="40" cy="44" r="11" fill="#e9ff6b" opacity=".45"/></>}
  <ellipse cx="29" cy="28" rx="11" ry="6" fill={hidden?sil:'#d9e4ea'} opacity={hidden?1:.8} transform="rotate(-25 29 28)"/><ellipse cx="51" cy="28" rx="11" ry="6" fill={hidden?sil:'#d9e4ea'} opacity={hidden?1:.8} transform="rotate(25 51 28)"/>
  <rect x="35" y="14" width="10" height="24" rx="5" fill={dark}/><circle cx="40" cy="44" r="7" fill={hidden?sil:'#f4ff9a'}/><circle cx="40" cy="12" r="5" fill={dark}/>
 </svg>;
 const w=14+page.span*22,h=10+page.length*12;
 return <svg viewBox="0 0 80 64" width={size} height={size*.8} aria-hidden="true" className={own.art} data-locked={hidden||undefined}>
  <ellipse cx={40-w*.55} cy="32" rx={w*.6} ry={h*.75} fill={hidden?sil:page.color} stroke={hidden?'none':'#2b2620'} strokeWidth="1.5"/>
  <ellipse cx={40+w*.55} cy="32" rx={w*.6} ry={h*.75} fill={hidden?sil:page.color} stroke={hidden?'none':'#2b2620'} strokeWidth="1.5"/>
  {!hidden&&[-1,1].flatMap(sd=>[[.5,-.3],[.8,.3],[.35,.45]].map(([dx,dy],k)=><polygon key={`${sd}${k}`} points={penta(40+sd*w*dx,32+dy*h,3.4)} fill="#1d1b1b"/>))}
  <rect x="36" y={32-h} width="8" height={h*2} rx="4" fill={dark}/><circle cx="40" cy={30-h} r="5" fill={dark}/>
 </svg>;
}

export default function BugBook({open,onClose}:{open:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null),restore=useRef<HTMLElement|null>(null);
 const [save,setSave]=useState<BugBookSave>(emptyBugBook);
 const [leaving,setLeaving]=useState(false),closing=useRef(false),timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const requestClose=()=>{if(closing.current)return;closing.current=true;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onClose();return;}
  setLeaving(true);timer.current=setTimeout(onClose,240);};
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open){closing.current=false;setLeaving(false);const s=readBugBook();setSave(s);countBugBookOpen();
   // A complete book always holds its bonus (paid once ever by the wallet id), even if the catch-time event was missed.
   if((bugBookComplete(s)&&!s.reward)||(nightBookComplete(s)&&!s.nightReward))void claimBugBookReward().then(()=>setSave(readBugBook())).catch(()=>{});
   restore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;el.showModal();close.current?.focus();}
  else if(!open&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[open]);
 const got=bugsCaught(save),nights=firefliesCaught(save),done=bugBookComplete(save);
 const sections=[{id:'bug',title:'Bug squad · Day',lesson:BUG_JOB_LESSON,where:'Catch it on a Bug squad shift (the sign on the summit\'s south-west corner), by Day or at Sunset: up on the mountain, along the trails or near the water.'},
  {id:'firefly',title:'Fireflies · Night',lesson:FIREFLY_JOB_LESSON,where:'Cup it in the glass jar on a Bug squad shift at Night (the same sign on the summit).'}] as const;
 return <dialog ref={dialog} className={`${styles.dialog} ${leaving?styles.leaving:styles.entering}`} aria-labelledby="bugbook-title" data-bugbook onCancel={e=>{e.preventDefault();requestClose();}} onClick={e=>{if(e.target===e.currentTarget)requestClose();}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  <section className={`${styles.panel} ${shell.shell} ${shell.drawer}`}>
   <header className={`${shell.header} ${styles.header}`}><div><h2 id="bugbook-title">Bug book</h2></div><DoneButton ref={close} onDone={requestClose}/></header>
   <div className={shell.body}>{open&&<div className={styles.book}>
    <div className={`${styles.intro} ${own.cover}`}>
     <div className={own.sticker} data-earned={done||undefined} data-bugbook-sticker aria-label={done?'Full squad sticker earned':'Full squad sticker: not earned yet'}><span aria-hidden="true">★</span><small>Full squad</small></div>
     <p><b data-bugbook-count>{got} / {BUG_IDS.length} bugs · {nights} / 8 fireflies</b>{done?`You found the whole 20-bug squad! The Full squad sticker is yours${save.reward?`, with a +${LEARN_COINS.book} coin bonus`:''}.${save.squads?` Squads completed: ${save.squads}.`:''}`:`Every bug plays a squad role (11 starters, the subs and the staff) and has a real football story. Catch all ${BUG_IDS.length} on Bug squad shifts for the Full squad sticker and +${LEARN_COINS.book} coins; all 8 fireflies earn +${LEARN_COINS.book} more.`}</p>
    </div>
    {sections.map(sec=>{const list=BUG_BOOK_PAGES.filter(p=>p.kind===sec.id),n=list.filter(p=>pageCaught(save,p)>0).length;return <section key={sec.id} className={styles.spot} data-bugbook-section={sec.id}>
     <h3 className={styles.spotTitle}>{sec.title} <small>{n} / {list.length}</small></h3>
     <ul className={styles.grid}>{list.map(p=>{const c=pageCaught(save,p);return <li key={p.id} data-caught={c>0} data-bugbook-page={p.id} className={p.kind==='firefly'&&c>0?own.night:undefined}>
      <BugArt page={p} hidden={!c}/>
      {c?<><h3>{p.name}</h3><p className={styles.eyebrow}>{p.role} · caught {c} time{c===1?'':'s'}</p>
       <div className={styles.fact}><span className={styles.tag}>{p.kind==='bug'?'Squad role':'Football call'}</span><p>{p.lesson}</p></div>
       {storyFor(p.stories,c)&&<div className={styles.fact} data-bugbook-story><span className={styles.tag}>Real football fact</span><p>{storyFor(p.stories,c)!.text}</p></div>}</>
      :<><h3>Not caught yet</h3><p className={styles.eyebrow}>{p.kind==='bug'?'A squad player':'A football call'}</p><p className={styles.found}>{sec.where}</p></>}
     </li>;})}</ul>
    </section>;})}
    <section className={styles.keeper}><h3>The bug scout&apos;s rule</h3><p><b>Look, learn, let go.</b> Every bug and firefly in this book was caught gently in a jar and set free again at the end of the shift.</p></section>
    <p className={styles.help}>Insect facts and the Laws of the Game are real. Bugs playing football positions is an island story (game fiction).</p>
   </div>}</div>
  </section>
 </dialog>;
}
