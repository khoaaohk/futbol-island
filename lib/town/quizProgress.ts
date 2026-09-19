'use client';
import {isLearningPreview} from './learningProgress';
import {useMemo,useSyncExternalStore} from 'react';
import manifest from './quizManifest.json';

export const QUIZ_STORAGE_KEY='futbol-island-quiz-progress-v1';
const keys=new Set(Object.entries(manifest).flatMap(([format,lessons])=>Object.entries(lessons).flatMap(([id,count])=>Array.from({length:count},(_,index)=>`${format}:${id}:${index}`))));
export const TOTAL_QUIZ_QUESTIONS=keys.size;
const listeners=new Set<()=>void>();
let completed=new Set<string>(),loaded=false;
function read(){
  if(typeof window==='undefined'||loaded)return;
  loaded=true;
  try{const value=JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)??'[]');if(Array.isArray(value))completed=new Set(value.filter(key=>typeof key==='string'&&keys.has(key)));}catch{}
}
function notify(){listeners.forEach(listener=>listener());}
function storage(event:StorageEvent){if(event.key===QUIZ_STORAGE_KEY||event.key===null){loaded=false;completed=new Set();read();notify();}}
function subscribe(listener:()=>void){listeners.add(listener);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(listener);if(!listeners.size)window.removeEventListener('storage',storage);};}
export function recordCorrectQuizAnswer(format:string,lessonId:string,index:number){
 if(isLearningPreview())return;
  read();const key=`${format}:${lessonId}:${index}`;
  if(!keys.has(key)||completed.has(key))return;
  // Merge correct answers from other tabs before writing; never erase their progress.
  try{const stored=JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)??'[]');if(Array.isArray(stored))for(const item of stored)if(keys.has(item))completed.add(item);}catch{}
  completed.add(key);
  try{localStorage.setItem(QUIZ_STORAGE_KEY,JSON.stringify([...completed]));}catch{}
  notify();
}
export function getQuizProgress(){read();return {completed:completed.size,total:TOTAL_QUIZ_QUESTIONS};}
export function useQuizProgress(){const count=useSyncExternalStore(subscribe,()=>{read();return completed.size;},()=>0);return {completed:count,total:TOTAL_QUIZ_QUESTIONS};}

/** Stable primitive snapshot also handles cross-tab changes with the same total count. */
export function useQuizCompletions(){
 const snapshot=useSyncExternalStore(subscribe,()=>{read();return [...completed].sort().join('|');},()=> '');
 return useMemo(()=>new Set(snapshot?snapshot.split('|'):[]),[snapshot]);
}
