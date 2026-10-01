import {answerReview,applyElsewhere,dueCount,dueKeys,emptyReview,enrollPassed,isEnrolled,payReview,sanitizeReview,tick,REVIEW_SESSION_SIZE,type ReviewState} from './review';
import {conceptLessons,conceptWords,conceptsForLesson,splitLessonKey,type ConceptId} from './conceptMap';
import {BOOK_CHECKS} from './bookChecks';
/**
 * The review store's logic with its ports injected (the browser singleton is lib/learning/reviewStore.ts; tests pass fakes).
 * Every write merges the freshest saved state first, so another tab's reviews are never erased.
 */
export type ReviewPorts={
 load:()=>unknown;save:(s:ReviewState)=>void;now:()=>number;day:(now:number)=>string;
 /** Lesson keys (`format:lessonId`) whose quiz is fully passed on this device. */
 passed:()=>string[];
 /** Pays learning coins once per id (the wallet's creditOnce); resolves to the coins paid now. */
 pay:(kind:'review'|'book',id:string,reason:string)=>Promise<number>;
 validKey:(key:string)=>boolean;
 lessonName:(key:string)=>string;
 notify:()=>void;
};
export type DueReview={key:string;format:string;lessonId:string;name:string;concept:string|null};
export function createReviewStore(ports:ReviewPorts){
 let state:ReviewState=emptyReview(),loaded=false;
 const read=()=>{if(!loaded){loaded=true;state=sanitizeReview(ports.load(),ports.validKey);}return state;};
 const fresh=()=>{loaded=false;return read();};
 const write=(next:ReviewState)=>{if(next===state)return;state=next;try{ports.save(next);}catch{}ports.notify();};
 /** Enroll newly passed lessons (first review tomorrow). Cheap: runs when a surface opens, never on a timer. */
 function sync(now=ports.now()){const s=fresh(),passed=ports.passed();write(enrollPassed(s,passed,now));return state;}
 function describe(key:string):DueReview{const {format,lessonId}=splitLessonKey(key),c=conceptsForLesson(key)[0];return {key,format,lessonId,name:ports.lessonName(key),concept:c?conceptWords(c,format).title:null};}
 /** Lessons due now (at most one warm-up's worth). The welcome-back card and the Paths entry call this. */
 function getDueReviews(now=ports.now()):{count:number;items:DueReview[]}{const s=sync(now);return {count:dueCount(s,now),items:dueKeys(s,now,REVIEW_SESSION_SIZE).map(describe)};}
 /**
  * A warm-up question's FIRST answer. Moves the lesson along its boxes when it is due, and pays LEARN_COINS.review for a right
  * answer while today's REVIEW_PAID_PER_DAY allowance lasts. Resolves to the coins paid now.
  */
 async function answer(key:string,correct:boolean,now=ports.now()):Promise<number>{
  const s=fresh(),r=s.lessons[key];if(!isEnrolled(r))return 0;const wasDue=r!.due<=now;
  let next=answerReview(s,key,correct,now);let index=0;
  if(correct&&wasDue){const paid=payReview(next,ports.day(now));if(paid.pay){next=paid.state;index=paid.index;}}
  write(next);
  return index?ports.pay('review',`${ports.day(now)}:${index}`,`Warm-up: ${ports.lessonName(key)}`):0;
 }
 /** The book check. `firstTry` right = counts toward the lesson's review; any right answer pays the book's coins once ever. */
 async function bookCheck(bookId:string,correct:boolean,firstTry:boolean,now=ports.now()):Promise<{coins:number;lesson:string|null}>{
  const check=BOOK_CHECKS[bookId as keyof typeof BOOK_CHECKS];if(!check)return {coins:0,lesson:null};
  const key=bookLesson(bookId);if(!key)return {coins:0,lesson:null};
  if(!correct)return {coins:0,lesson:key};
  if(firstTry){sync(now);write(applyElsewhere(fresh(),key,now,`book:${bookId}`));}
  return {coins:await ports.pay('book',bookId,`Take it to your game: ${ports.lessonName(key)}`),lesson:key};
 }
 /** "Seen around the island": ticks every lesson of the concept once per source (evidence only). */
 function creditTick(concept:ConceptId,source:string,format?:string):string[]{
  const keys=conceptLessons(concept,format).filter(ports.validKey);if(!keys.length)return [];
  let s=fresh();for(const k of keys)s=tick(s,k,source);write(s);return keys;
 }
 return {read,sync,getDueReviews,answer,bookCheck,creditTick,describe};
}
/** The lesson a book check credits: the concept's lesson in the book's format, else the first format that teaches it. */
export function bookLesson(bookId:string):string|null{const c=BOOK_CHECKS[bookId as keyof typeof BOOK_CHECKS];return c?conceptLessons(c.concept,c.format)[0]??null:null;}
