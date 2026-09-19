'use client';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import LoveFutslFilm from './LoveFutslFilm';
import {useEffect,useId,useRef,useState} from 'react';
import {type StoryId} from '@/lib/paths/stories';
import {STORIES,STORY_CHAPTERS} from '@/lib/paths/storyContent';
import {Icon} from './Icon';
import PathStoryScene from './PathStoryScene';
import GritFilm from './GritFilm';
import RegulatingEmotionsFilm from './RegulatingEmotionsFilm';
import MentalToughnessFilm from './MentalToughnessFilm';
import shell from './BallHuntLesson.module.css';
import modal from './ModalShell.module.css';
import store from './IslandStore.module.css';
import styles from './PathStoryModal.module.css';
function OtherPathStoryModal({storyId,onClose,onFinish,embedded=false}:{storyId:Exclude<StoryId,'futsl'>;onClose:()=>void;onFinish:()=>void;embedded?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),body=useRef<HTMLDivElement>(null),[page,setPage]=useState(0),[hidden,setHidden]=useState(false),[playing,setPlaying]=useState(0),uid=useId();
 const embeddedRoot=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!embedded)return;const root=embeddedRoot.current,outer=root?.closest('dialog'),label=outer?.getAttribute('aria-labelledby');outer?.setAttribute('aria-labelledby',uid);root?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});return()=>{if(label)outer?.setAttribute('aria-labelledby',label);};},[embedded,uid]);
 const story=STORIES[storyId],chapter=STORY_CHAPTERS[storyId],last=chapter.lines.length;
 const [completed,setCompleted]=useState(false);
 useEffect(()=>{if(page===last)setCompleted(true);},[page,last]);
 const dismiss=()=>{timers.current.forEach(clearTimeout);timers.current=[];if(completed){cue('finish');onFinish();}else onClose();};
 useEffect(()=>{const node=dialog.current,previous=document.activeElement as HTMLElement|null;if(!embedded)node?.showModal();const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);node?.close();previous?.focus?.({preventScroll:true});};},[]);
 useEffect(()=>{body.current?.scrollTo({top:0});},[page]);
 const [transitioning,setTransitioning]=useState(false),busy=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
 const moveScene=(change:()=>void)=>{
  if(busy.current)return;
  cue();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){change();setPlaying(n=>n+1);return;}
  busy.current=true;setTransitioning(true);
  timers.current=[setTimeout(()=>{change();setPlaying(n=>n+1);},180),setTimeout(()=>{busy.current=false;setTransitioning(false);timers.current=[];},440)];
 };
 const cue=(kind='step')=>document.dispatchEvent(new CustomEvent('fi2-story-cue',{detail:kind}));
 const dialogue=page===last?'“'+chapter.quote+'”':chapter.lines[page];


 const content=<section className={`${shell.panel} ${modal.shell}`}>
 <header className={`${modal.header} ${styles.header}`}><h2 id={uid}>Story</h2><DoneButton className={store.close} onDone={dismiss}/></header>
 <div ref={body} className={`${modal.body} ${styles.body}`}><div className={styles.game} data-story-game aria-busy={transitioning}>{transitioning&&<div className={styles.sceneWipe} aria-hidden="true"><i/></div>}<div className={styles.page}>
 <div className={styles.sceneButton} data-transitioning={transitioning}><PathStoryScene id={storyId} page={page} playing={playing}/><div key={`${page}-${playing}`} className={styles.speechBubble} id={`${uid}-speech`} aria-live="polite"><strong>{story.name.toUpperCase()}</strong><span key={dialogue}>{dialogue}</span></div><span className={styles.sceneHint}>{page===last?'Take this idea to your next game.':'Watch the moment unfold.'}</span></div>

 </div><nav className={styles.gameControls} aria-label="Story controls"><BackButton key={page} disabled={transitioning||page===0} onBack={()=>moveScene(()=>setPage(p=>p-1))}/><span className={styles.progress} aria-label={`Step ${page+1} of ${last+1}`}>{Array.from({length:last+1},(_,i)=>i).map(i=><i key={i} data-current={i===page}/>)}</span><button disabled={transitioning} onClick={()=>moveScene(()=>setPage(p=>p===last?0:p+1))}>{page===last?'Replay':'Next'}{page!==last&&<Icon name="arrow" size={16}/>}</button></nav></div></div>
 <footer className={styles.footer}><button className={shell.primary} onClick={dismiss}>Done</button></footer>
 </section>;
 if(embedded)return <div ref={embeddedRoot} className={styles.embeddedStory} data-hidden={hidden} data-story-view data-story-complete={completed} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}}} aria-labelledby={uid}>{content}</div>;
 return <dialog ref={dialog} className={`${store.dialog} ${styles.dialog}`} aria-labelledby={uid} data-hidden={hidden} onClick={e=>{if(e.target===e.currentTarget)dismiss();}} onCancel={e=>{e.preventDefault();e.stopPropagation();dismiss();}} onKeyDown={e=>e.stopPropagation()}>{content}</dialog>;
}

export default function PathStoryModal(props:{storyId:StoryId;onClose:()=>void;onFinish:()=>void;embedded?:boolean;origin?:{x:number;y:number;size:number;height:number;radius:string;color:string}}){return props.storyId==='futsl'?<LoveFutslFilm {...props}/>:props.storyId==='regulate'?<RegulatingEmotionsFilm {...props}/>:props.storyId==='grit'?<GritFilm {...props}/>:props.storyId==='reset'?<MentalToughnessFilm onClose={props.onClose} onFinish={props.onFinish} embedded={props.embedded}/>:<OtherPathStoryModal {...props} storyId={props.storyId}/>;}
