import manifest from './questLessonManifest.json';
export const QUEST_FORMATS=['futsal','7v7','9v9','11v11'] as const;
export type QuestEvidence={visits:string[];steps:string[];equipment:boolean};
export const EMPTY_QUEST_EVIDENCE:QuestEvidence={visits:[],steps:[],equipment:false};
const lessonSteps=new Map(Object.entries(manifest).flatMap(([format,lessons])=>Object.entries(lessons).map(([id,count])=>[`${format}:${id}`,count] as const)));
const validSteps=new Set([...lessonSteps].flatMap(([key,count])=>Array.from({length:count},(_,i)=>`${key}:${i}`)));
export function sanitizeQuestEvidence(value:unknown):QuestEvidence{
 const v=value&&typeof value==='object'?value as Partial<QuestEvidence>:{};
 return {visits:Array.isArray(v.visits)?[...new Set(v.visits.filter(x=>QUEST_FORMATS.includes(x as typeof QUEST_FORMATS[number])))]:[],steps:Array.isArray(v.steps)?[...new Set(v.steps.filter(x=>validSteps.has(x)))]:[],equipment:v.equipment===true};
}
export type QuestEvent={type:'visit';format:string}|{type:'step';format:string;lessonId:string;step:number}|{type:'equip'};
export function applyQuestEvent(evidence:QuestEvidence,event:QuestEvent):QuestEvidence{
 if(event.type==='equip')return evidence.equipment?evidence:{...evidence,equipment:true};
 if(event.type==='visit')return !QUEST_FORMATS.includes(event.format as typeof QUEST_FORMATS[number])||evidence.visits.includes(event.format)?evidence:{...evidence,visits:[...evidence.visits,event.format]};
 const key=`${event.format}:${event.lessonId}:${event.step}`;
 return !validSteps.has(key)||evidence.steps.includes(key)?evidence:{...evidence,steps:[...evidence.steps,key]};
}
export type IslandQuest={id:string;title:string;goal:string;value:number;target:number;points:number;action:'map'|'learn'|'store';cta:string};
export function getIslandQuests(evidence:QuestEvidence,quizKeys:ReadonlySet<string>):IslandQuest[]{
 const seen=new Set(evidence.steps),watched=[...lessonSteps].filter(([key,count])=>count>0&&Array.from({length:count},(_,i)=>`${key}:${i}`).every(key=>seen.has(key))).length;
 const quizFormats=new Set([...quizKeys].map(key=>key.split(':')[0])).size;
 return [
  {id:'first-play',title:'Read the game',goal:'Play every step of one lesson. You can pause and return.',value:watched,target:1,points:20,action:'learn',cta:'Choose a play'},
  {id:'first-answer',title:'Make your first read',goal:'Answer one quiz question correctly. Use the feedback and retry freely.',value:quizKeys.size,target:1,points:10,action:'learn',cta:'Try a quiz'},
  {id:'explorer',title:'Find another pitch',goal:'Arrive on foot or a ground ride near two different pitches. Map travel counts.',value:evidence.visits.length,target:2,points:20,action:'map',cta:'Explore the map'},
  {id:'your-style',title:'Make it yours',goal:'Equip any item from the Island Store. Every item is free.',value:evidence.equipment?1:0,target:1,points:10,action:'store',cta:'Visit the Store'},
  {id:'playbook',title:'Build your playbook',goal:'Play every step of three different lessons.',value:watched,target:3,points:30,action:'learn',cta:'Choose another play'},
  {id:'two-formats',title:'See a different game',goal:'Answer a quiz question correctly in two different formats.',value:quizFormats,target:2,points:20,action:'learn',cta:'Explore plays'},
  {id:'island-tour',title:'Know your island',goal:'Arrive near all four pitches: futsal, 7v7, 9v9 and 11v11.',value:evidence.visits.length,target:4,points:30,action:'map',cta:'Find a pitch'},
  {id:'ten-reads',title:'Grow your game',goal:'Answer ten different quiz questions correctly, in any format.',value:quizKeys.size,target:10,points:40,action:'learn',cta:'Keep learning'},
 ];
}
/** Derived rewards cannot be claimed twice, including after reload or replay. */
export const questPoints=(quests:IslandQuest[])=>quests.reduce((total,q)=>total+(q.value>=q.target?q.points:0),0);
