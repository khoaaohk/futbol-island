import type {Format} from './venues';
export const LEARNING_VERSION='pilot-1';
export const REVIEW_DELAY=2*24*60*60*1000;
export const LEARNING_JOURNEYS=[
 {id:'support',title:'Support angles',concept:'Support angles',club:'barcelona',host:'Cove',format:'futsal' as Format,lesson:'prn_f_support',situation:'Cove’s teammate keeps hiding behind a defender. Help them find a clear return pass.',objective:'Move to an angle where the defender cannot block the passing lane.'},
 {id:'width',title:'Make room on the wing',concept:'Width and timing',club:'arsenal',host:'Pebble',format:'7v7' as Format,lesson:'prn_7_spread',situation:'Pebble’s team is crowding the ball. Help them create another option.',objective:'Read who already occupies the wide lane before choosing your support run.'},
 {id:'movement',title:'Arrive in scoring space',concept:'Off ball movement',club:'bayern',host:'Moss',format:'futsal' as Format,lesson:'expf_kickinthird',situation:'Moss’s runner is closely marked. Help the team create a lane before the pass arrives.',objective:'Read the marker, change direction and coordinate the run with the pass.'},
] as const;
export type LearningId=typeof LEARNING_JOURNEYS[number]['id'];
export type LearningAttempt={eventId:string;questId:LearningId;conceptId:string;format:Format;lessonId:string;questionIndex:number;variantId:string;contentVersion:string;at:number;responseId:number;correct:boolean;attemptNumber:number;assistance:string[];mode:'practice'|'independent-check'|'delayed-review'};
export type LearningCursor={stage:number;step:number;quiz:boolean;question:number;answer:number|null};
export type JourneyRecord={started:number;source:string;cursor:LearningCursor;completed:number[];exposures:string[];attempts:LearningAttempt[];reviewAt?:number;favorite?:boolean};
export type LearningProgress={version:1;journeys:Partial<Record<LearningId,JourneyRecord>>;active?:LearningId;celebration?:{id:LearningId;stage:number}};
export const emptyLearning=():LearningProgress=>({version:1,journeys:{}});
export const journeyById=(id:string)=>LEARNING_JOURNEYS.find(j=>j.id===id);
export function freshJourney(source:string,now=Date.now()):JourneyRecord{return {started:now,source,cursor:{stage:0,step:0,quiz:false,question:0,answer:null},completed:[],exposures:[],attempts:[]};}
export const isJourneyComplete=(r?:JourneyRecord)=>!!r&&[0,1,2,3].every(stage=>r.completed.includes(stage));
export const stageVariant=(id:LearningId,stage:number)=>stage===0?journeyById(id)!.lesson:`quest_${id}_${stage}`;
export function learningStatus(r?:JourneyRecord){
 if(!r)return {label:'Ready to explore',detail:'Start with a visual example.'};
 const independent=r.attempts.filter(a=>a.correct&&a.attemptNumber===1&&!a.assistance.length&&a.mode!=='practice');
 const applied=new Set(independent.map(a=>a.variantId)).size>=2;
 const remembered=applied&&independent.some(a=>a.mode==='delayed-review'&&r.reviewAt!==undefined&&a.at>=r.reviewAt);
 return remembered?{label:'Remembered',detail:'You spotted the idea in a new situation on a later visit.'}:applied?{label:'Applied',detail:'You found the answer independently in two different situations.'}:r.attempts.length?{label:'Practicing',detail:'You have tried the idea. Help and retries count as practice.'}:r.exposures.length?{label:'Introduced',detail:'You have seen how this football idea works.'}:{label:'In progress',detail:'Continue your saved football situation.'};
}
export function nextLearningStage(r:JourneyRecord,now=Date.now()){
 for(let i=0;i<4;i++)if(!r.completed.includes(i))return i;
 if(r.reviewAt!==undefined&&now>=r.reviewAt){for(let i=4;i<6;i++)if(!r.completed.includes(i)&&now>=r.reviewAt+(i===5?5*24*60*60*1000:0))return i;}
 return null;
}
export function sanitizeLearning(raw:unknown):LearningProgress{
 const result=emptyLearning();if(!raw||typeof raw!=='object')return result;
 const value=raw as LearningProgress;
 for(const j of LEARNING_JOURNEYS){const r=value.journeys?.[j.id];if(!r||!Number.isFinite(r.started))continue;
 const c=r.cursor;const cursor:LearningCursor={stage:Math.max(0,Math.min(5,Number.isInteger(c?.stage)?c.stage:0)),step:Math.max(0,Number.isInteger(c?.step)?c.step:0),quiz:c?.quiz===true,question:Math.max(0,Number.isInteger(c?.question)?c.question:0),answer:Number.isInteger(c?.answer)&&c.answer!==null?c.answer:null};
 result.journeys[j.id]={started:r.started,source:typeof r.source==='string'?r.source.slice(0,80):'passport',cursor,completed:Array.isArray(r.completed)?[...new Set(r.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<=5))]:[],exposures:Array.isArray(r.exposures)?r.exposures.filter(x=>typeof x==='string').slice(-200):[],attempts:Array.isArray(r.attempts)?r.attempts.filter(a=>a&&a.questId===j.id&&a.contentVersion===LEARNING_VERSION&&Number.isFinite(a.at)&&typeof a.eventId==='string'&&Number.isInteger(a.questionIndex)&&Number.isInteger(a.responseId)&&Number.isInteger(a.attemptNumber)&&a.attemptNumber>0&&typeof a.correct==='boolean'&&Array.isArray(a.assistance)&&a.assistance.every(x=>typeof x==='string')&&['practice','independent-check','delayed-review'].includes(a.mode)).slice(-500):[],reviewAt:Number.isFinite(r.reviewAt)?r.reviewAt:undefined,favorite:r.favorite===true};
 }
 if(value.active&&journeyById(value.active))result.active=value.active;
 const pending=value.celebration;if(pending&&journeyById(pending.id)&&Number.isInteger(pending.stage)&&result.journeys[pending.id]?.completed.includes(pending.stage))result.celebration={id:pending.id,stage:pending.stage};return result;
}
