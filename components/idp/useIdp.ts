'use client';
/**
 * IDP v2 state hooks: the plan (synced-safe), the device-only text, and what the island saves show. Static reads on open and on
 * the `storage` event only: no polling, no timers. Island links close the dialog and open the lesson, arcade game, card or story.
 */
import {useCallback,useEffect,useMemo,useState} from 'react';
import {FORMAT_PATHS,FORMAT_PATH_LAUNCH,lessonEvidence} from '@/lib/paths/formatPaths';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {endLearningPreview} from '@/lib/town/learningProgress';
import {STORY_KEY,readStoryProgress} from '@/lib/paths/stories';
import {openEndgame} from '@/lib/endgame/graduationStore';
import {showCardInBinder} from '@/lib/town/cardRewardStore';
import {readCollection} from '@/lib/town/cardCollection';
import {loadPlayFormat} from '@/lib/grownups/prefs';
import {IDP_KEY} from '@/lib/coaches/idp';
import {IDP2_KEY,IDP_TEXT_KEY,emptyIdp2,emptyText,loadIdp2,loadText,saveIdp2,saveText,type IdpState2,type IdpText} from '@/lib/coaches/idp/store';
import type {Evidence,IslandSaves} from '@/lib/coaches/idp/journey';
import type {ArcadeId} from '@/lib/coaches/idp/skills';
import {countIdp} from '@/lib/coaches/idp/analytics';

export function useIdpState(){
 const [state,setState]=useState<IdpState2>(()=>emptyIdp2());
 const [text,setText]=useState<IdpText>(emptyText);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const load=()=>{setState(loadIdp2(undefined,loadPlayFormat()??'7v7'));setText(loadText());};
  load();setReady(true);
  const sync=(e:StorageEvent)=>{if(e.key===IDP2_KEY||e.key===IDP_TEXT_KEY||e.key===IDP_KEY||e.key===null)load();};
  window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
 },[]);
 const commit=useCallback((next:IdpState2)=>{setState(next);saveIdp2(next);},[]);
 const commitText=useCallback((next:IdpText)=>{setText(next);saveText(next);},[]);
 return {state,commit,text,commitText,ready};
}

/** Arcade cabinets with any saved progress on this device ("played": evidence of exploring, not of skill). */
const ARCADE_KEYS:Record<ArcadeId,string[]>={live:['fi2-strikers-stars-v1','fi2-strikers-cup-v1'],runner:['fi2-runner-missions-v1','fi.game.runner.best'],tennis:['fi2-tennis-stars-v1'],pinball:['fi2-pinball-stars-v1'],puzzle:['fi2-pass-puzzles-v1']};
const hasProgress=(raw:string|null):boolean=>{if(!raw)return false;let v:unknown;try{v=JSON.parse(raw);}catch{return /[1-9]/.test(raw);}
 const walk=(x:unknown,d:number):boolean=>d>4?false:typeof x==='number'?x>0:Array.isArray(x)?x.some(y=>walk(y,d+1)):!!x&&typeof x==='object'&&Object.values(x as object).some(y=>walk(y,d+1));return walk(v,0);};
export function readArcadePlayed():Set<ArcadeId>{
 const out=new Set<ArcadeId>();try{for(const [id,keys] of Object.entries(ARCADE_KEYS))if(keys.some(k=>hasProgress(localStorage.getItem(k))))out.add(id as ArcadeId);}catch{}return out;
}
export function useIslandSaves():IslandSaves{
 const evidence=useQuestEvidence(),answers=useQuizCompletions();
 const [extra,setExtra]=useState<{arcadePlayed:Set<ArcadeId>;cards:Set<string>;stories:Set<string>}>(()=>({arcadePlayed:new Set(),cards:new Set(),stories:new Set()}));
 useEffect(()=>{let stories:string[]=[];try{stories=readStoryProgress(JSON.parse(localStorage.getItem(STORY_KEY)??'[]'));}catch{}
  setExtra({arcadePlayed:readArcadePlayed(),cards:new Set(readCollection()),stories:new Set(stories)});},[]);
 const steps=useMemo(()=>new Set(evidence.steps),[evidence]);
 return useMemo(()=>({steps,answers,...extra}),[steps,answers,extra]);
}

/** Opens an island link from the plan: closes the plan's dialog first (onLaunch), then goes there. */
export function openIslandLink(e:Evidence['open'],onLaunch:()=>void,saves?:IslandSaves){
 countIdp('link');
 if(e.kind==='lesson'){
  const path=FORMAT_PATHS.find(p=>p.format===e.format),l=path&&[...path.chapters.flatMap(c=>c.lessons),...path.depth].find(x=>x.id===e.lessonId);if(!l)return;
  const s=lessonEvidence(e.format,l,saves?.steps??new Set(),saves?.answers??new Set());
  endLearningPreview();onLaunch();
  window.dispatchEvent(new CustomEvent(FORMAT_PATH_LAUNCH,{detail:{format:e.format,lessonId:l.id,step:s.complete?0:s.step,quiz:!s.complete&&s.quiz,question:s.complete?0:s.question,nonce:Date.now()}}));
 }else if(e.kind==='arcade'){onLaunch();window.location.assign('/arcade?game='+encodeURIComponent(e.game));}
 else if(e.kind==='card'){onLaunch();showCardInBinder(e.name);}
 else{onLaunch();openEndgame({target:'paths',format:e.format});}
}
