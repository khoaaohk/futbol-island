'use client';
import {BackButton} from './BackButton';
import IslandSelect from './IslandSelect';
import {DoneButton} from './DoneButton';
import shell from './ModalShell.module.css';
import {useEffect,useRef,type RefObject} from 'react';
import type {FieldLesson} from '@/lib/town/formatLessons';
import drawer from './IslandSettings.module.css';
import styles from './FieldLearning.module.css';
import picker from './PlaysPicker.module.css';
import {Icon} from './Icon';
import {useQuizCompletions} from '@/lib/town/quizProgress';

type Props={open:boolean;onClose:()=>void;trigger:RefObject<HTMLButtonElement>;format:string;title:string;lessons:FieldLesson[];chosen?:string;category:string;onCategory:(value:string)=>void;onSelect:(lesson:FieldLesson)=>void;error:string;onRetry:()=>void};
export default function PlaysPicker({open,onClose,trigger,format,title,lessons,chosen,category,onCategory,onSelect,error,onRetry}:Props){
 const completed=useQuizCompletions();
 const earned=(lesson:FieldLesson)=>lesson.questions.reduce((count,_,index)=>count+Number(completed.has(`${lesson.fmt}:${lesson.id}:${index}`)),0);
 const visible=lessons.filter(l=>category==='All'||l.catalog.category===category);
 const total=lessons.reduce((count,l)=>count+l.questions.length,0),banked=lessons.reduce((count,l)=>count+earned(l),0),mastered=lessons.filter(l=>l.questions.length>0&&earned(l)===l.questions.length).length;
 const categoryTotal=visible.reduce((count,l)=>count+l.questions.length,0),categoryEarned=visible.reduce((count,l)=>count+earned(l),0);
 const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const element=dialog.current;if(!element)return;let timer:ReturnType<typeof setTimeout>|undefined;
  if(open){if(!element.open){element.showModal();element.scrollLeft=0;close.current?.focus({preventScroll:true});}}
  else if(element.open){const finish=()=>{element.close();trigger.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else timer=setTimeout(finish,240);}
  return()=>{if(timer)clearTimeout(timer);};
 },[open,trigger]);
 return <dialog ref={dialog} className={`${drawer.dialog} ${picker.dialog} ${open?drawer.entering:drawer.leaving}`} aria-labelledby="choose-plays-title" onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onClose();}}} onKeyUp={e=>e.stopPropagation()} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <section className={`${drawer.panel} ${picker.panel} ${shell.shell}`}>
   <header className={`${drawer.header} ${picker.header} ${shell.header}`}><BackButton ref={close} onBack={onClose}/><div><h2 id="choose-plays-title">Choose plays</h2></div></header>
   {/* Mobile: the category picker sits between the title and the scrolling list, so it stays put and nothing scrolls above it. */}
   {!error&&lessons.length>0&&<IslandSelect label="Category" value={category} onChange={onCategory} className={picker.mobileCategory} dataAttrs={{'data-play-category':''}} options={['All',...Array.from(new Set(lessons.map(l=>l.catalog.category)))].map(c=>({value:c,label:`${c==='All'?'All plays':c} (${c==='All'?lessons.length:lessons.filter(l=>l.catalog.category===c).length})`}))}/>}
   <div className={picker.body}>
   <div className={picker.intro}><p className={drawer.copy}>{title} · Watch a play, then try Quiz yourself.</p>
    <div className={picker.mastery} aria-label="Playbook star progress"><div><span><Icon name="star" size={18}/><strong>{banked} / {total} stars earned</strong></span><small>{mastered} / {lessons.length} plays completed</small></div><progress max={total||1} value={banked} aria-label="Stars earned in this playbook"/><p>Earn a star for each quiz question you get right.</p></div>
   </div>
   {error?<p role="alert">{error} <button className={styles.retry} onClick={onRetry}>Try again</button></p>:!lessons.length?<p role="status">Loading lessons…</p>:<>
    <section className={`${styles.categories} ${picker.categories}`} aria-label="Play categories"><h3>Categories</h3><div role="group" aria-label="Choose a category">{['All',...Array.from(new Set(lessons.map(l=>l.catalog.category)))].map(c=><button key={c} type="button" aria-pressed={category===c} onClick={()=>onCategory(c)}><span>{c==='All'?'All plays':c}</span><small>{c==='All'?lessons.length:lessons.filter(l=>l.catalog.category===c).length}</small></button>)}</div></section>
    <section className={picker.categoryContent} aria-label="Plays in selected category"><div className={picker.categoryHeading}><h3>{category==='All'?'All plays':category}</h3>{category!=='All'&&<p><Icon name="star" size={16}/>{categoryEarned} / {categoryTotal} stars</p>}</div>
    <div className={`${picker.plays} field-lesson-list`}>{visible.map(l=>{const stars=earned(l),available=l.questions.length-stars;return <button key={l.id} className={picker.play} aria-pressed={chosen===l.id} onClick={()=>onSelect(l)}><span className={picker.playInfo}><strong>{l.name}</strong><span className={picker.description}>{l.catalog.what}</span><span className={picker.reward}><span className={picker.starIcons} aria-hidden="true">{l.questions.map((_,i)=><Icon key={i} name="star" size={15} style={i<stars?{fill:'currentColor'}:undefined}/>)}</span><span>{stars} / {l.questions.length} stars earned · {available?`${available} left to earn`:'Complete'}</span></span></span><span className={picker.watch}><Icon name="play" size={14}/>Watch</span></button>;})}</div>
    </section>
   </>}
   </div>
  </section>
 </dialog>;
}
