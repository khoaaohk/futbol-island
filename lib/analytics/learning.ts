/**
 * The "Learning" section of the admin report (Oct 9 2026), built on the SERVER from the range's merged totals (core.ts
 * mergeRollups: counts, countSessions, flags). Small-number suppression happens here, before anything leaves the server: every
 * cell that rests on fewer than MIN_SESSIONS sessions in the range is sent as null (shown as "<5") or merged into a hidden
 * remainder, and `hidden` says how many were withheld. Question and option text is looked up from the generated lesson text
 * (learningText.generated.ts); the browser only ever sent indices.
 */
import {COACH_VOICE_IDS,GRAD_BANDS,LEARN_FORMATS,LESSON_STAGES,ONBOARDING_STEPS,PROGRESS_BANDS,SETTING_BITS,lessonKey,optionKey,questionKey,type LearnFormat} from './countIds';
import {LESSON_TEXT} from './learningText.generated';

/** A cell resting on fewer sessions than this in the range is not shown. */
export const MIN_SESSIONS=5;
/** null = withheld (under MIN_SESSIONS sessions). */
export type Cell=number|null;
export type FunnelLesson={id:string;name:string;stages:Cell[];drop:{stage:number;share:number}|null};
export type QuestionOption={text:string;correct:boolean;share:Cell};
export type QuestionRow={lesson:string;format:LearnFormat;lessonName:string;index:number;text:string;sessions:number;attempts:number;firstTry:number;
 options:QuestionOption[];hiddenOptions:number};
export type LearningReport={
 hasData:boolean;min:number;hidden:number;
 formats:{format:LearnFormat;lessons:FunnelLesson[];quiet:number}[];
 questions:QuestionRow[];
 walkthrough:{steps:{id:string;label:string;seen:Cell;skipped:Cell}[];explore:Cell;lesson:Cell};
 progress:{n:Cell;bands:{label:string;sessions:Cell}[];grads:{label:string;sessions:Cell}[]};
 paths:{launches:{format:LearnFormat;sessions:Cell;launches:Cell}[];grads:{key:string;label:string;sessions:Cell}[];reviews:{answered:Cell;right:Cell;done:Cell}};
 settings:{n:Cell;bits:{key:string;label:string;sessions:Cell}[];voices:{id:string;label:string;sessions:Cell}[]};
};

let text:Map<string,(typeof LESSON_TEXT)[number]>|null=null;
const lessonText=(id:string)=>(text??=new Map(LESSON_TEXT.map(l=>[l[1],l]))).get(id);

export function emptyLearning():LearningReport{return buildLearning({},{},{});}

export function buildLearning(counts:Record<string,number>,sessions:Record<string,number>,flags:Record<string,number>):LearningReport{
 let hidden=0;
 /** A sessions-based cell: the number when it rests on ≥ MIN_SESSIONS sessions, else null (and counted as withheld). */
 const cell=(n:number|undefined):Cell=>{const v=n||0;if(v>=MIN_SESSIONS)return v;if(v>0)hidden++;return v>0?null:0;};
 /** A count shown only when the sessions behind it reach MIN_SESSIONS. */
 const guarded=(c:number|undefined,s:number|undefined):Cell=>(s||0)>=MIN_SESSIONS?(c||0):(s||0)>0?(hidden++,null):0;

 const formats=LEARN_FORMATS.map(format=>{
  let quiet=0;const lessons:FunnelLesson[]=[];
  for(const [f,id,name] of LESSON_TEXT){if(f!==format)continue;
   const raw=LESSON_STAGES.map(([st])=>sessions[lessonKey(st,id)]||0);
   if(raw.every(v=>v===0))continue;
   if(raw.every(v=>v<MIN_SESSIONS)){quiet++;hidden+=raw.filter(v=>v>0).length;continue;}
   const stages=raw.map(v=>cell(v));
   let drop:FunnelLesson['drop']=null;
   for(let i=1;i<stages.length;i++){const a=stages[i-1],b=stages[i];if(a===null||b===null||!a)continue;const share=Math.max(0,1-b/a);if(!drop||share>drop.share)drop={stage:i,share};}
   lessons.push({id,name,stages,drop});
  }
  lessons.sort((a,b)=>(b.drop?.share??-1)-(a.drop?.share??-1)||(b.stages[0]??0)-(a.stages[0]??0)||a.name.localeCompare(b.name));
  return {format,lessons,quiet};
 });

 const questions:QuestionRow[]=[];
 for(const [f,id,name,qs] of LESSON_TEXT)qs.forEach(([q,opts,correct],i)=>{
  const s=sessions[questionKey(id,i)]||0,attempts=counts[questionKey(id,i)]||0;
  if(!s)return;if(s<MIN_SESSIONS||!attempts){hidden++;return;}
  let hiddenOptions=0;
  const options=opts.map((o,j)=>{const c=counts[optionKey(id,i,j)]||0,os=sessions[optionKey(id,i,j)]||0;
   if(j===correct||os>=MIN_SESSIONS||!os)return {text:o,correct:j===correct,share:c/attempts};
   hiddenOptions++;hidden++;return {text:o,correct:false,share:null};});
  questions.push({lesson:id,format:f as LearnFormat,lessonName:name,index:i,text:q,sessions:s,attempts,firstTry:(counts[optionKey(id,i,correct)]||0)/attempts,options,hiddenOptions});
 });

 const walkthrough={steps:ONBOARDING_STEPS.map(([id,label])=>({id,label,seen:cell(sessions['ob:seen:'+id]),skipped:cell(sessions['ob:skip:'+id])})),
  explore:cell(sessions['ob:explore']),lesson:cell(sessions['ob:lesson'])};
 const progress={n:cell(flags.n),bands:PROGRESS_BANDS.map((label,i)=>({label,sessions:cell(flags['p'+i])})),grads:GRAD_BANDS.map((label,i)=>({label,sessions:cell(flags['g'+i])}))};
 const paths={launches:LEARN_FORMATS.map(format=>({format,sessions:cell(sessions['pf:'+format]),launches:guarded(counts['pf:'+format],sessions['pf:'+format])})),
  grads:[...LEARN_FORMATS.map(f=>['gr:'+f,f+' path'] as const),['gr:finale','Matchday Ferry final'] as const].map(([key,label])=>({key,label,sessions:cell(sessions[key])})),
  reviews:{answered:guarded(counts['rv:q'],sessions['rv:q']),right:guarded(counts['rv:ok'],sessions['rv:ok']),done:cell(sessions['rv:done'])}};
 const settings={n:cell(flags.n),bits:SETTING_BITS.map(([key,,label])=>({key,label,sessions:cell(flags[key])})),
  voices:COACH_VOICE_IDS.map(([id,label],i)=>({id,label,sessions:cell(flags['v'+i])}))};
 const hasData=Object.keys(counts).length>0||(flags.n||0)>0;
 return {hasData,min:MIN_SESSIONS,hidden,formats,questions,walkthrough,progress,paths,settings};
}
