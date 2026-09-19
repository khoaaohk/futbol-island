'use client';
import {DoneButton} from './DoneButton';
import {Icon} from './Icon';
import {useEffect,useRef,useState,type MutableRefObject,type RefObject,type PointerEvent} from 'react';
import type {FieldLesson,FieldSession} from '@/lib/town/formatLessons';
import type {LiveMatchView} from '@/lib/town/fieldRuntime';
import styles from './FieldTranscript.module.css';

type Message={id:string;label:string;text:string};
type Props={docked?:boolean;onResizeSound?:()=>void;open:boolean;onClose:()=>void;trigger:RefObject<HTMLButtonElement>;session:MutableRefObject<FieldSession|null>;readMatch?:()=>LiveMatchView|null;chosen:FieldLesson|null;step:number;quiz:boolean;question:number;answer:number|null};
/** Original PlayChat/MatchChat presentation: retained messages, live score and upward resize grip. */
export default function FieldTranscript({docked=false,onResizeSound,open,onClose,trigger,readMatch,chosen,step,quiz,question,answer}:Props){
 const [mounted,setMounted]=useState(false),[feed,setFeed]=useState<Message[]>([]),[match,setMatch]=useState<LiveMatchView|null>(null),[height,setHeight]=useState(320);
 const resizeSound=useRef({time:-Infinity,height:320});
 const tickResize=(h:number,start=false)=>{const now=performance.now();if(now-resizeSound.current.time<140||(!start&&Math.abs(h-resizeSound.current.height)<8))return;resizeSound.current={time:now,height:h};onResizeSound?.();};
 const panel=useRef<HTMLElement>(null),body=useRef<HTMLDivElement>(null),resizeGrip=useRef<HTMLButtonElement>(null),seen=useRef(new Set<string>()),follow=useRef(true),gesture=useRef<{id:number;button:HTMLButtonElement;y:number;height:number}|null>(null);
 useEffect(()=>{seen.current.clear();setFeed([]);},[chosen?.id]);
 useEffect(()=>{if(!chosen)return;const q=chosen.questions[question];let message:Message;
  if(quiz&&q){if(answer===null)message={id:`${chosen.id}:q${question}`,label:`Question ${question+1}`,text:q.q+'\n'+q.options.map((option,i)=>`${String.fromCharCode(65+i)} · ${option}`).join('\n')};
   else message={id:`${chosen.id}:q${question}:a${answer}`,label:'Your answer',text:`${String.fromCharCode(65+answer)} · ${q.options[answer]}\n${answer===q.correct?'Correct. ':'Look again. '}${answer!==q.correct?q.choiceExplanations?.[answer]??q.explain:q.explain}`};
  }else message={id:`${chosen.id}:s${step}`,label:`Step ${step+1}`,text:chosen.steps[step].say??chosen.steps[step].desc};
  if(!seen.current.has(message.id)){seen.current.add(message.id);setFeed(old=>[...old,message]);}
 },[chosen,step,quiz,question,answer]);
 useEffect(()=>{if(chosen)return;const update=()=>setMatch(readMatch?.()??null);update();const timer=setInterval(update,500);return()=>clearInterval(timer);},[chosen,readMatch]);
 useEffect(()=>{if(open){setMounted(true);return;}if(!mounted)return;const finish=()=>{const restore=panel.current?.contains(document.activeElement);setMounted(false);if(restore)trigger.current?.focus({preventScroll:true});};if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}const timer=setTimeout(finish,240);return()=>clearTimeout(timer);},[open,trigger]);
 useEffect(()=>{if(open&&mounted){resizeGrip.current?.focus({preventScroll:true});follow.current=true;}},[open,mounted]);
 const currentId=chosen?`${chosen.id}:${quiz?'q'+question+(answer===null?'':':a'+answer):'s'+step}`:null;
 const messages=chosen?feed.filter(m=>!(quiz&&answer===null&&m.id.startsWith(`${chosen.id}:q${question}:a`))):(match?.events??[]).map(e=>({id:String(e.id),label:`${Math.floor(e.time/60)}:${String(Math.floor(e.time%60)).padStart(2,'0')}`,text:e.text}));
 useEffect(()=>{const el=body.current;if(!follow.current||!el)return;const active=el.querySelector<HTMLElement>('[data-current="true"]');el.scrollTop=chosen&&active?Math.max(0,active.offsetTop-el.offsetTop-8):el.scrollHeight;},[messages.length,mounted,currentId,chosen]);
 useEffect(()=>{const resize=()=>setHeight(h=>Math.min(h,Math.max(180,innerHeight-110)));window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 const start=(e:PointerEvent<HTMLButtonElement>)=>{if(e.button!==0||!panel.current)return;e.preventDefault();e.stopPropagation();const box=panel.current.getBoundingClientRect();e.currentTarget.setPointerCapture(e.pointerId);gesture.current={id:e.pointerId,button:e.currentTarget,y:e.clientY,height:box.height};tickResize(box.height,true);};
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const h=Math.max(180,Math.min(innerHeight-110,g.height+g.y-e.clientY));setHeight(h);tickResize(h);};
 const end=()=>{const g=gesture.current;gesture.current=null;if(g?.button.hasPointerCapture(g.id))g.button.releasePointerCapture(g.id);};
 useEffect(()=>{window.addEventListener('blur',end);return()=>{window.removeEventListener('blur',end);end();};},[]);
 if(!mounted)return null;
 return <section ref={panel} className={`${styles.panel} ${docked?styles.docked:''} ${open?styles.entering:styles.leaving}`} style={{height}} id="field-transcript" aria-label={chosen?'Coach transcript':'Live commentary'} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();onClose();}}} onKeyUp={e=>e.stopPropagation()}>
  <button ref={resizeGrip} className={styles.grip} aria-label="Resize transcript" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();const before=panel.current?.offsetHeight??height,next=Math.max(180,Math.min(innerHeight-110,before+(e.key==='ArrowUp'?24:-24)));setHeight(next);if(Math.abs(next-before)>.5)tickResize(next,true);}}}><span/></button>
  <header className={styles.header}><div><strong>{chosen?'Coach':'Live game'}</strong><small>{chosen?.name??'Gold vs Blue'}</small></div>{!chosen&&<span className={styles.score}>{match?.score.gold??0} — {match?.score.blue??0}</span>}<DoneButton onDone={onClose}/></header>
  {chosen&&<div className={styles.legend}><Icon name="target"/> Players <span><Icon name="arrow"/> Routes</span></div>}
  <div ref={body} className={styles.body} role="log" aria-label={chosen?'Lesson transcript messages':'Live play-by-play'} aria-live={open?'polite':'off'} onScroll={e=>{const el=e.currentTarget;follow.current=el.scrollHeight-el.scrollTop-el.clientHeight<35;}}>
   {!chosen&&<p className={styles.intro}>Follow the live match here. Choose plays to learn the ideas behind the game.</p>}
   {messages.map((m,i)=><article className={`${styles.message} ${(chosen?m.id===currentId:i===messages.length-1)?styles.current:''}`} data-current={chosen?m.id===currentId:i===messages.length-1} key={m.id}><small>{m.label}</small><p>{m.text}</p></article>)}
   {!chosen&&!messages.length&&<p className={styles.intro}>The teams are getting started…</p>}
  </div>
 </section>;
}
