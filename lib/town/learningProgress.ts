'use client';
import {useSyncExternalStore} from 'react';
import {emptyLearning,sanitizeLearning,freshJourney,journeyById,stageVariant,nextLearningStage,REVIEW_DELAY,LEARNING_VERSION,type LearningId,type LearningProgress,type JourneyRecord,type LearningCursor} from './learningJourneys';
export const LEARNING_KEY='fi2-football-learning-v1',LEARNING_LAUNCH='fi2-learning-launch';
let previewState:LearningProgress|null=null,previewToken=0;
export const learningPreviewToken=()=>previewToken;
export const isLearningPreview=()=>previewState!==null;
export function endLearningPreview(token?:number){if(previewState&&(token===undefined||token===previewToken)){previewState=null;notify();}}
const server=emptyLearning();let state:LearningProgress=server,loaded=false;
const listeners=new Set<()=>void>();
function read(){if(previewState)return previewState;if(!loaded&&typeof window!=='undefined'){loaded=true;try{state=sanitizeLearning(JSON.parse(localStorage.getItem(LEARNING_KEY)??'null'));}catch{state=emptyLearning();}}return state;}
function notify(){listeners.forEach(fn=>fn());}
function storage(e:StorageEvent){if(e.key===LEARNING_KEY||e.key===null){loaded=false;read();notify();}}
function subscribe(fn:()=>void){listeners.add(fn);window.addEventListener('storage',storage);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',storage);};}
export const useLearning=()=>useSyncExternalStore(subscribe,read,()=>server);
export const readLearning=read;
function write(next:LearningProgress){if(previewState){previewState=next;notify();return;}state=next;try{localStorage.setItem(LEARNING_KEY,JSON.stringify(next));}catch{}notify();}
function change(id:LearningId,fn:(r:JourneyRecord)=>JourneyRecord){const s=read(),r=s.journeys[id];if(r)write({...s,journeys:{...s.journeys,[id]:fn(r)}});}
export function launchLearning(id:LearningId,source='passport',replayStage?:number){
 if(process.env.NODE_ENV==='production'&&source==='paths-preview')return;
 const preview=process.env.NODE_ENV!=='production'&&source==='paths-preview';
 endLearningPreview();
 if(preview){previewState={...read()};previewToken++;}
 const s=read(),r=s.journeys[id]??freshJourney(source),next=nextLearningStage(r);
 const stage=replayStage??next??2;
 const cursor=stage===r.cursor.stage?r.cursor:{stage,step:0,quiz:stage>0,question:0,answer:null};
 write({...s,celebration:undefined,active:id,journeys:{...s.journeys,[id]:{...r,cursor}}});
 window.dispatchEvent(new CustomEvent(LEARNING_LAUNCH,{detail:{id,nonce:Date.now()}}));
}
export function saveLearningCursor(id:LearningId,cursor:LearningCursor){change(id,r=>JSON.stringify(r.cursor)===JSON.stringify(cursor)?r:{...r,cursor});}
export function exposeLearning(id:LearningId,variant:string,kind:string){const key=`${variant}:${kind}`;const r=read().journeys[id];if(r&&!r.exposures.includes(key))change(id,r=>({...r,exposures:[...r.exposures,key]}));}
export function answerLearning(id:LearningId,stage:number,lessonId:string,questionIndex:number,responseId:number,correct:boolean){
 if(isLearningPreview())return;
 change(id,r=>{const variantId=stageVariant(id,stage),previous=r.attempts.filter(a=>a.variantId===variantId&&a.questionIndex===questionIndex),j=journeyById(id)!;
 // Exposure survives leaving, replaying and reloading. First responses are never overwritten.
 const assistance=[...(stage<2?['guided-example']:[]),...(r.exposures.includes(`${variantId}:solution`)?['solution-demo']:[]),...(r.exposures.includes(`${variantId}:hint`)?['hint']:[]),...(previous.length?['previous-feedback']:[])];
 const attemptNumber=previous.length+1,at=Date.now(),eventId=`${variantId}:${questionIndex}:${attemptNumber}`;
 return {...r,attempts:[...r.attempts,{eventId,questId:id,conceptId:j.concept,format:j.format,lessonId,questionIndex,variantId,contentVersion:LEARNING_VERSION,at,responseId,correct,attemptNumber,assistance,mode:stage<2?'practice':stage<4?'independent-check':'delayed-review'}],cursor:{...r.cursor,answer:responseId}};
 });
}
export function completeLearningStage(id:LearningId,stage:number){
 if(isLearningPreview())return;
 const s=read(),r=s.journeys[id];if(!r||!Number.isInteger(stage)||stage<0||stage>5||r.completed.includes(stage))return;
 write({...s,celebration:{id,stage},journeys:{...s.journeys,[id]:{...r,completed:[...r.completed,stage],reviewAt:stage===3&&r.reviewAt===undefined?Date.now()+REVIEW_DELAY:r.reviewAt}}});
}
export function dismissLearningCelebration(){const s=read();if(s.celebration)write({...s,celebration:undefined});}
export function favoriteLearning(id:LearningId){change(id,r=>({...r,favorite:!r.favorite}));}
