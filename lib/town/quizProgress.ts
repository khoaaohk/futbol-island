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
/** Whether this question has ever been answered correctly on this device (card rewards check a whole lesson's quiz). */
export function hasCorrectQuizAnswer(format:string,lessonId:string,index:number){read();return completed.has(`${format}:${lessonId}:${index}`);}
/** Lessons (`format:lessonId`) whose every quiz question has been answered correctly on this device (card-reward catch-up). */
export function passedQuizLessons():{id:string;questions:number}[]{read();return Object.entries(manifest).flatMap(([format,lessons])=>Object.entries(lessons as Record<string,number>).filter(([id,count])=>count>0&&Array.from({length:count},(_,i)=>completed.has(`${format}:${id}:${i}`)).every(Boolean)).map(([id,count])=>({id:`${format}:${id}`,questions:count})));}
export function getQuizProgress(){read();return {completed:completed.size,total:TOTAL_QUIZ_QUESTIONS};}
export function useQuizProgress(){const count=useSyncExternalStore(subscribe,()=>{read();return completed.size;},()=>0);return {completed:count,total:TOTAL_QUIZ_QUESTIONS};}

/** Stable primitive snapshot also handles cross-tab changes with the same total count. */
export function useQuizCompletions(){
 const snapshot=useSyncExternalStore(subscribe,()=>{read();return [...completed].sort().join('|');},()=> '');
 return useMemo(()=>new Set(snapshot?snapshot.split('|'):[]),[snapshot]);
}

/**
 * THE quiz → card rule (docs/quiz-design.md, user Sep 24 2026). A lesson quiz is card-eligible only when it has at least
 * MIN_CARD_QUIZ_QUESTIONS questions and every one of them is answered correctly. Wrong answers show the "why" and the child
 * retries, but with CARD_QUIZ_FIRST_TRY (on: the user's Sep 24 2026 rule) the card needs a clean run, every question right first time.
 * cardRewardTriggers.quizEligibleForCard delegates here; FieldLearning builds the run with quizRunAllCorrect.
 */
export const MIN_CARD_QUIZ_QUESTIONS=5;
export const CARD_QUIZ_FIRST_TRY=true;
export function quizCardEligible(questions:number,allCorrect:boolean):boolean{return questions>=MIN_CARD_QUIZ_QUESTIONS&&allCorrect;}
/** One quiz run: indexes answered correctly (after any retries) and indexes answered correctly on the first try. */
export type QuizRun={lessonId:string;correct:Set<number>;firstTry:Set<number>;tried:Set<number>};
export const newQuizRun=(lessonId:string):QuizRun=>({lessonId,correct:new Set(),firstTry:new Set(),tried:new Set()});
/** Record an answer in a run (first answer to each question decides first-try). */
export function recordRunAnswer(run:QuizRun,index:number,correct:boolean){if(!run.tried.has(index)){run.tried.add(index);if(correct)run.firstTry.add(index);}if(correct)run.correct.add(index);}
/** Whether a finished run answered every question correctly under the current rule. */
export function quizRunAllCorrect(questions:number,run:Pick<QuizRun,'correct'|'firstTry'>):boolean{const set=CARD_QUIZ_FIRST_TRY?run.firstTry:run.correct;return questions>0&&Array.from({length:questions},(_,i)=>set.has(i)).every(Boolean);}
/** The answers a finished run hands to the card trigger (earnForQuiz → quizEligibleForCard → quizCardEligible). Empty when the
 *  run belongs to another lesson or, with CARD_QUIZ_FIRST_TRY, when any question needed a retry. */
export function quizRunCardAnswers(lessonId:string,questions:number,run:QuizRun):Set<number>{return run.lessonId===lessonId&&(!CARD_QUIZ_FIRST_TRY||quizRunAllCorrect(questions,run))?run.correct:new Set();}
