'use client';
import {useSyncExternalStore} from 'react';
import manifest from '../town/quizManifest.json';
import {passedQuizLessons} from '../town/quizProgress';
import {isLearningPreview} from '../town/learningProgress';
import {creditOnce} from '../arcade/arcadeWallet';
import {createLearnCoins,LEARN_COINS_EARNED} from '../town/learnCoins';
import {localPlayDay} from '../town/dailyPlay';
import {FORMAT_PATHS,FORMAT_PATH_LAUNCH} from '../paths/formatPaths';
import {emptyReview,type ReviewState} from './review';
import {createReviewStore,type DueReview} from './reviewStoreCore';
import {conceptLessons,splitLessonKey,type ConceptId} from './conceptMap';
/**
 * Browser review store (docs/learning/spaced-review.md). localStorage `fi2-lesson-review-v1`; nothing runs on a timer: the
 * schedule syncs when a surface asks (the Paths Review card, the warm-up).
 *
 * PUBLIC API (the Paths Review card; the mastery screen was removed Oct 1 2026, docs/learning/spaced-review.md):
 *  - getDueReviews(): {count, items:[{key, format, lessonId, name, concept}]} — at most 3 items (one warm-up);
 *  - openLearningReview(): opens the Daily warm-up (LearningHost listens);
 *  - useDueReviewCount(): live count for a badge.
 */
export const REVIEW_KEY='fi2-lesson-review-v1';
export const LEARNING_REVIEW_OPEN='fi2-learning-review-open';
const VALID=new Set(Object.entries(manifest as Record<string,Record<string,number>>).flatMap(([f,ls])=>Object.keys(ls).map(id=>`${f}:${id}`)));
const NAMES=new Map<string,string>(FORMAT_PATHS.flatMap(p=>[...p.chapters.flatMap(c=>c.lessons),...p.depth].map(l=>[`${p.format}:${l.id}`,l.name] as const)));
const listeners=new Set<()=>void>();
const learnCoins=createLearnCoins({creditOnce:(id,game,amount,reason)=>creditOnce(id,game,amount,reason),notify:detail=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(LEARN_COINS_EARNED,{detail}));}});
let snapshot:ReviewState|null=null;
const store=createReviewStore({
 load:()=>{try{return JSON.parse(localStorage.getItem(REVIEW_KEY)??'null');}catch{return null;}},
 save:s=>{if(isLearningPreview())return;localStorage.setItem(REVIEW_KEY,JSON.stringify(s));},
 now:()=>Date.now(),day:localPlayDay,
 passed:()=>passedQuizLessons().map(l=>l.id),
 pay:(kind,id,reason)=>isLearningPreview()?Promise.resolve(0):learnCoins.pay(kind,id,reason),
 validKey:key=>VALID.has(key),
 lessonName:key=>NAMES.get(key)??splitLessonKey(key).lessonId,
 notify:()=>{snapshot=store.read();listeners.forEach(fn=>fn());},
});
// The first subscriber (the Paths Review card…) enrolls lessons passed since the last visit, once per page load.
let synced=false;
function subscribe(fn:()=>void){listeners.add(fn);if(!synced){synced=true;queueMicrotask(()=>{try{store.sync();}catch{}});}const storage=(e:StorageEvent)=>{if(e.key===REVIEW_KEY||e.key===null){snapshot=store.sync();fn();}};window.addEventListener('storage',storage);return()=>{listeners.delete(fn);window.removeEventListener('storage',storage);};}
const readSnapshot=()=>snapshot??=store.read();
const SERVER=emptyReview();
/** Live review state (records per lesson). Call syncReviews() when a surface opens to enroll newly passed lessons. */
export const useReviewState=()=>useSyncExternalStore(subscribe,readSnapshot,()=>SERVER);
export const syncReviews=()=>store.sync();
export function getDueReviews():{count:number;items:DueReview[]}{return store.getDueReviews();}
export const answerReviewQuestion=(key:string,correct:boolean)=>store.answer(key,correct);
export const recordBookCheck=(bookId:string,correct:boolean,firstTry:boolean)=>store.bookCheck(bookId,correct,firstTry);
/** Credit a "seen around the island" tick to every lesson of a concept (magazines, jobs, fishing, the ball hunt). */
export function creditConceptTick(concept:ConceptId|null,source:string,format?:string){if(!concept||isLearningPreview())return [];try{return store.creditTick(concept,source,format);}catch{return [];}}
export function useDueReviewCount(){useReviewState();const now=Date.now();return Object.values(readSnapshot().lessons).filter(r=>r.enrolled>0&&r.due<=now).length;}
export function openLearningReview(){window.dispatchEvent(new CustomEvent(LEARNING_REVIEW_OPEN));}
/** Open a Paths lesson from anywhere (replay from the start); Town travels to the pitch and opens it. */
export function openPathLesson(key:string){const {format,lessonId}=splitLessonKey(key);window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format,lessonId,step:0,quiz:false,question:0,nonce:Date.now()}}));}
/** The lesson the player has passed for this concept (same format first), or null: the live-match "spot it" gate. */
export function learnedLessonFor(concept:ConceptId,format?:string):string|null{
 const passed=new Set(passedQuizLessons().map(l=>l.id));return conceptLessons(concept,format,true).find(k=>passed.has(k))??null;
}
export const lessonName=(key:string)=>NAMES.get(key)??splitLessonKey(key).lessonId;
