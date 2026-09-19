'use client';
import {useSyncExternalStore} from 'react';
import {awardPassportAnswer,emptyPassport,sanitizePassport,type PassportEvidence} from './passport';
export const PASSPORT_STORAGE_KEY='fi2-passport-v1',STORY_STORAGE_KEY='fi2-club-stories-v1';
const listeners=new Set<()=>void>();
let evidence=emptyPassport(),loaded=false;
const serverEvidence=emptyPassport();
function read(){if(loaded||typeof window==='undefined')return;loaded=true;try{evidence=sanitizePassport(JSON.parse(localStorage.getItem(PASSPORT_STORAGE_KEY)??'{}'));}catch{evidence=emptyPassport();}try{const stories=JSON.parse(localStorage.getItem(STORY_STORAGE_KEY)??'[]');evidence=sanitizePassport({...evidence,stories:[...evidence.stories,...(Array.isArray(stories)?stories:[])]});}catch{}}
function notify(){listeners.forEach(fn=>fn());}
function refresh(event:StorageEvent){if(event.key===null||event.key===PASSPORT_STORAGE_KEY||event.key===STORY_STORAGE_KEY){loaded=false;read();notify();}}
function subscribe(fn:()=>void){listeners.add(fn);if(listeners.size===1)window.addEventListener('storage',refresh);return()=>{listeners.delete(fn);if(!listeners.size)window.removeEventListener('storage',refresh);};}
export function recordPassportAnswer(kind:'story'|'player'|'pitch',id:string,answer:number){read();const next=awardPassportAnswer(evidence,kind,id,answer);if(next===evidence)return;evidence=next;try{localStorage.setItem(PASSPORT_STORAGE_KEY,JSON.stringify(evidence));localStorage.setItem(STORY_STORAGE_KEY,JSON.stringify(evidence.stories));}catch{}notify();}
export function usePassport(){return useSyncExternalStore(subscribe,()=>{read();return evidence;},()=>serverEvidence);}
