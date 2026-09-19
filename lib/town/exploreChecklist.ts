'use client';
import {useQuestEvidence} from './questProgress';
import {useQuizCompletions} from './quizProgress';
import {getIslandQuests,type QuestEvidence} from './questModel';
import {COIN_QUEST} from './coinQuest';
import {useCoinProgress} from './coinProgress';
import quizManifest from './quizManifest.json';
import {useExploreActivity,type ExploreActivity} from './exploreActivity';
export const EXPLORE_ITEMS=[
 {id:'visit-futsal',title:'Visit the futsal court',detail:'See how a smaller court changes space and quick passing.'},
 {id:'visit-7v7',title:'Visit the 7v7 field',detail:'Notice the positions and how teammates spread out.'},
 {id:'visit-9v9',title:'Visit the 9v9 field',detail:'Explore how more players create new passing options.'},
 {id:'visit-11v11',title:'Visit the 11v11 field',detail:'See the full game and how the team stays connected.'},
 {id:'watch-plays',title:'Watch 5 plays',detail:'Follow each play from start to finish. Look for runs, passing angles, and open space.'},
 {id:'try-quizzes',title:'Complete 5 quizzes',detail:'Make your decisions, watch the explanations, and retry when you need to.'},
 {id:'talk-characters',title:'Talk to 10 island characters',detail:'Meet different people and discover their futbol stories and tips.'},
 {id:'visit-store',title:'Visit the Store',detail:'Explore the gear and the stories behind the animal costumes.'},
 {id:'play-arcade',title:'Play arcade games',detail:'Try a game and practice your timing, control, and decisions.'},
 {id:'ramp-trick',title:'Use a ramp and do a trick',detail:'Pick a ride, find a ramp, and time your approach and landing.'},
 {id:'ride-truck',title:'Ride a truck',detail:'Land on a pickup and steer around the island. Scan ahead and find open routes.'},
 {id:'shoot-target',title:'Shoot 5 targets',detail:'Aim your kicks and break open 5 different marked targets on the island.'},
 {id:'use-parachute',title:'Use the parachute',detail:'Glide down and choose your landing space before you arrive.'},
 {id:'roof-drop',title:'Drop off a building',detail:'Step off a roof and land below. Look ahead and judge the space.'},
 {id:'knock-characters',title:'Knock over 20 island characters',detail:'In island play, practice aiming your ball at moving targets. On a real pitch, play safely.'},
 {id:'win-knockout',title:'Win 5 knockout games',detail:'Use ball control, accurate shots, and movement into space to be the last player standing.'},
] as const;
export type ExploreId=typeof EXPLORE_ITEMS[number]['id'];
const quizzes=Object.entries(quizManifest).flatMap(([format,lessons])=>Object.entries(lessons).map(([id,count])=>({key:`${format}:${id}`,count})));
export function exploreProgress(evidence:QuestEvidence,quizKeys:ReadonlySet<string>,activity:ExploreActivity,revealedTargets:readonly string[]=[]){
 const watched=getIslandQuests(evidence,quizKeys).find(q=>q.id==='first-play')!.value;
 const completedQuizzes=quizzes.filter(q=>q.count>0&&Array.from({length:q.count},(_,i)=>`${q.key}:${i}`).every(key=>quizKeys.has(key))).length;
 const values:Record<ExploreId,[number,number,string]>={
 'visit-futsal':[Number(evidence.visits.includes('futsal')),1,''],
 'visit-7v7':[Number(evidence.visits.includes('7v7')),1,''],
 'visit-9v9':[Number(evidence.visits.includes('9v9')),1,''],
 'visit-11v11':[Number(evidence.visits.includes('11v11')),1,''],
 'watch-plays':[watched,5,'plays'], 'try-quizzes':[completedQuizzes,5,'quizzes'],
 'talk-characters':[activity.characters.length,10,'characters'],
 'visit-store':[Number(activity.store||evidence.equipment),1,''],
 'ride-truck':[Number(activity.truck),1,''], 'shoot-target':[Math.max(Number(activity.target),COIN_QUEST.filter(spot=>spot.wall&&revealedTargets.includes(spot.id)).length),5,'targets'],
 'use-parachute':[Number(activity.parachute),1,''], 'roof-drop':[Number(activity.roofDrop),1,''],
 'knock-characters':[activity.knockovers??0,20,'knockovers'], 'win-knockout':[activity.knockoutWins??0,5,'wins'],
 'play-arcade':[Number(activity.arcade),1,''], 'ramp-trick':[Number(activity.ramp),1,''],
 };
 return EXPLORE_ITEMS.map(item=>{const [value,target,unit]=values[item.id];return{...item,value:Math.min(value,target),target,unit,complete:value>=target};});
}
export function useExploreChecklist(){const evidence=useQuestEvidence(),quizzes=useQuizCompletions(),activity=useExploreActivity(),balls=useCoinProgress();return exploreProgress(evidence,quizzes,activity,balls.revealed);}
