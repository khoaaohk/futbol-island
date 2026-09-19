'use client';
import {useEffect,useState,type MutableRefObject} from 'react';
import {lessonVisualFrame,type FieldSession} from '@/lib/town/formatLessons';
import {teachingPresentation} from '@/lib/town/teachingPresentation';
import styles from './FieldLearning.module.css';
/** Reflect the playback clock without rerendering the lesson UI every animation frame. */
export default function FieldVisualBeat({session,hidden}:{session:MutableRefObject<FieldSession|null>;hidden:boolean}){
 const [beat,setBeat]=useState<{key:string;label:string;index:number;count:number}|null>(null);
 useEffect(()=>{if(hidden)return;const read=()=>{const s=session.current;if(!s||s.quiz){setBeat(old=>old?null:old);return;}const frame=lessonVisualFrame(s.lesson,s.step,s.progress);const cue=teachingPresentation(frame.step,frame.progress,frame.label);const key=s.lesson.id+':'+s.step+':'+frame.index+':'+cue.index;setBeat(old=>old?.key===key?old:{key,label:cue.text,index:cue.index,count:cue.count});};read();const timer=setInterval(read,120);return()=>clearInterval(timer);},[session,hidden]);
 if(hidden||!beat)return null;
 return <aside className={styles.visualBeat} aria-label="Teaching sequence" data-teaching-beat={beat.index}>{beat.count>1&&<span>{beat.index+1} / {beat.count}</span>}<strong>{beat.label}</strong><div aria-hidden="true">{Array.from({length:beat.count},(_,i)=><i key={i} data-active={i===beat.index}/>)}</div></aside>;
}
