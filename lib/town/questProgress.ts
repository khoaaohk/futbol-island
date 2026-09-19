'use client';
import {isLearningPreview} from './learningProgress';
import {useMemo,useSyncExternalStore} from 'react';
import {applyQuestEvent,EMPTY_QUEST_EVIDENCE,sanitizeQuestEvidence,type QuestEvent} from './questModel';
export const QUEST_STORAGE_KEY='futbol-island-quests-v1';
const listeners=new Set<()=>void>();
let evidence=EMPTY_QUEST_EVIDENCE,loaded=false,snapshot=JSON.stringify(evidence);
const emptySnapshot=snapshot;
function read(){if(typeof window==='undefined'||loaded)return;loaded=true;try{evidence=sanitizeQuestEvidence(JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)??'null'));}catch{evidence=EMPTY_QUEST_EVIDENCE;}snapshot=JSON.stringify(evidence);}
function notify(){snapshot=JSON.stringify(evidence);listeners.forEach(listener=>listener());}
function storage(event:StorageEvent){if(event.key===QUEST_STORAGE_KEY||event.key===null){loaded=false;read();notify();}}
function subscribe(listener:()=>void){listeners.add(listener);if(listeners.size===1)window.addEventListener('storage',storage);return()=>{listeners.delete(listener);if(!listeners.size)window.removeEventListener('storage',storage);};}
export function recordQuestEvent(event:QuestEvent){
 if(isLearningPreview())return;
 read();if(applyQuestEvent(evidence,event)===evidence)return;
 // The HUD records arrivals with no mounted quest subscriber. Merge other-tab facts
 // before writing a new event so a stale in-memory snapshot cannot erase them.
 try{const persisted=sanitizeQuestEvidence(JSON.parse(localStorage.getItem(QUEST_STORAGE_KEY)??'null'));evidence={visits:[...new Set([...evidence.visits,...persisted.visits])],steps:[...new Set([...evidence.steps,...persisted.steps])],equipment:evidence.equipment||persisted.equipment};}catch{}
 const next=applyQuestEvent(evidence,event);if(next===evidence){notify();return;}
 evidence=next;try{localStorage.setItem(QUEST_STORAGE_KEY,JSON.stringify(evidence));}catch{}notify();
}
export const recordQuestVisit=(format:string)=>recordQuestEvent({type:'visit',format});
export const recordQuestStep=(format:string,lessonId:string,step:number)=>recordQuestEvent({type:'step',format,lessonId,step});
export function useQuestEvidence(){const value=useSyncExternalStore(subscribe,()=>{read();return snapshot;},()=>emptySnapshot);return useMemo(()=>sanitizeQuestEvidence(JSON.parse(value)),[value]);}
