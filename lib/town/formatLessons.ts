import type {Format} from './venues';
export type VoiceClips=Record<string,{src:string;duration:number}>;
export type Point={x:number;y:number};
export type FieldActor=Point&{id:string;label:string};
export type CuePoint=Point|{id:string;dx?:number;dy?:number};
export type LessonCue={kind:string;style?:string;ids?:string[];text?:string;anchor?:string;color?:number[];from?:CuePoint;to?:CuePoint;arrow?:boolean;label?:string;x?:number;y?:number;rx?:number;ry?:number;vertex?:CuePoint;a?:CuePoint;b?:CuePoint};
export type QuizInteraction={kind:string;paths?:{from:Point;to:Point;correct:boolean;why?:string}[];candidates?:{id:string;correct:boolean;why?:string}[];spots?:{x:number;y:number;r:number;correct:boolean;why?:string}[];zones?:{x:number;y:number;w:number;h:number;correct:boolean;why?:string}[]};
export type FieldBeat={label:string;start:number;end:number;moves?:{id:string;to:Point;via?:Point}[];ball?:Point;overlays?:LessonCue[];links?:[string,string][];focusIds?:string[]};
export type FieldStep={arrows?:[string,string][];fieldZones?:{x:number;y:number;w:number;h:number;label?:string;color?:number[]}[];defensiveCues?:{id:string;markId?:string;attention?:string}[];beats?:FieldBeat[];voice?:VoiceClips;cameraFocusIds?:string[];camView?:string;desc:string;say?:string;ball:Point;moves:{id:string;to:Point;via?:Point}[];dur?:number;ballPathType?:string;highlight?:{ids:string[];color:number[]}[];links?:[string,string][];focusIds?:string[];overlays?:LessonCue[]};
export type FieldQuestion={choiceExplanations?:string[];choiceVoices?:VoiceClips[];interact?:QuizInteraction;feedback?:{highlight?:{ids:string[];color:number[]}[];overlays?:LessonCue[]};voice?:VoiceClips;explainVoice?:VoiceClips;step:number;q:string;options:string[];correct:number;explain:string;outcomeStep?:number|null};
export type FieldLesson={id:string;name:string;fmt:Format;ball:Point;offense:FieldActor[];defense:FieldActor[];steps:FieldStep[];questions:FieldQuestion[];catalog:{category:string;what:string}};
export type FieldSession={renderedBall?:{x:number;z:number;landed:boolean};format:Format;lesson:FieldLesson;step:number;progress:number;playing:boolean;quiz:boolean;question:number;answer:number|null;voicePending?:boolean;outcomeProgress?:number;outcomePreview?:boolean;outcomePaused?:boolean;cameraMode?:'guided'|'broadcast';onAnswer?:(index:number)=>void;onPlaying?:(playing:boolean)=>void;onStep:(step:number)=>void};
export const catalogs=new Map<Format,Promise<FieldLesson[]>>();
export function loadCatalog(format:Format){let promise=catalogs.get(format);if(!promise){promise=fetch('/lessons/'+format+'.json').then(r=>{if(!r.ok)throw Error('Lessons could not load. Please try again.');return r.json() as Promise<FieldLesson[]>;}).catch(e=>{catalogs.delete(format);throw e;});catalogs.set(format,promise);}return promise;}
const smooth=(t:number)=>t*t*(3-2*t);
// Ported from the original island's lessonPresentation: plan once, never push actors apart mid-frame.
type PlannedFrame={step:FieldStep;from:Record<string,Point>;to:Record<string,Point>;vias:Map<string,Point>;start:number;end:number;label?:string};
const plannedRuns=new WeakMap<FieldLesson,PlannedFrame[][]>();
function runPoint(a:Point,b:Point,via:Point|undefined,t:number):Point {
 if(!via||(a.x===b.x&&a.y===b.y))return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
 const u=1-t;return {x:u*u*a.x+2*u*t*via.x+t*t*b.x,y:u*u*a.y+2*u*t*via.y+t*t*b.y};
}
/** Plan a small curved detour before playback, never react by swapping sides mid-run.
 * Endpoints, ball carriers and authored quiz answers remain intact. */
function planLessonRuns(steps:readonly FieldStep[],frames:readonly Record<string,Point>[],scale:{x:number;y:number},ambientIds:readonly string[]=[]) {
  return steps.map((step,i)=>{
    const from=frames[i],to=frames[i+1],ids=Object.keys(from).filter(id=>id!=='__ball__'&&!ambientIds.includes(id));
    const vias=new Map(step.moves.filter(m=>m.via).map(m=>[m.id,{...m.via!}]));
    const distance=(a:Point,b:Point)=>Math.hypot((a.x-b.x)*scale.x,(a.y-b.y)*scale.y);
    const point=(id:string,t:number,via=vias.get(id))=>runPoint(from[id],to[id],via,t);
    const penalty=(id:string,via:Point|undefined)=>{
      let score=0;
      for(let n=1;n<40;n++){
        const t=n/40,p=point(id,t,via);
        for(const other of ids)if(other!==id){const gap=1.05-distance(p,point(other,t));if(gap>0)score+=gap*gap;}
      }
      return score;
    };
    for(let pass=0;pass<2;pass++)for(const id of ids){
      const a=from[id],b=to[id];
      if(distance(a,b)<.5)continue;
      // Keep the controlled ball attached to its runner, including defensive recoveries.
      if([from,to].some(f=>f.__ball__&&distance(f[id],f.__ball__)<.8))continue;
      let best=penalty(id,vias.get(id));if(best<.001)continue;
      const dx=(b.x-a.x)*scale.x,dy=(b.y-a.y)*scale.y,len=Math.hypot(dx,dy);
      const base=vias.get(id)??{x:(a.x+b.x)/2,y:(a.y+b.y)/2};let chosen=vias.get(id);
      for(const offset of [1,-1,2,-2,3,-3,4,-4]){
        const v={x:base.x-dy/len*offset/scale.x,y:base.y+dx/len*offset/scale.y};
        if(v.x<8||v.x>262||v.y<8||v.y>392)continue;
        const score=penalty(id,v);
        if(score<best-.0001){best=score;chosen=v;}
        if(best<.001)break;
      }
      if(chosen)vias.set(id,chosen);
    }
    return vias;
  });
}

function lessonRuns(lesson:FieldLesson){
 let plan=plannedRuns.get(lesson);if(plan)return plan;
 const frames:Record<string,Point>[]=[Object.fromEntries([...lesson.offense,...lesson.defense].map(a=>[a.id,{x:a.x,y:a.y}]))];frames[0].__ball__=lesson.ball;
 const flat:FieldStep[]=[],ranges:{start:number;end:number;label?:string}[][]=[];
 for(const base of lesson.steps){
  const beats:FieldBeat[]=base.beats?.length?base.beats:[{start:0,end:1,label:'',moves:base.moves,ball:base.ball}];
  const canonical={...frames[frames.length-1]};for(const move of base.moves)canonical[move.id]=move.to;
  const windows:{start:number;end:number;label?:string}[]=[];
  for(let i=0;i<beats.length;i++){
   const beat=beats[i],last=i===beats.length-1,previous=frames[frames.length-1];
   // The final pose remains the authored step endpoint, preserving every quiz setup.
   const moves=last?(base.beats?.length?Object.entries(canonical).filter(([id])=>id!=='__ball__').map(([id,to])=>({id,to,via:base.moves.find(m=>m.id===id)?.via})):base.moves):(beat.moves??[]),ball=last?base.ball:(beat.ball??previous.__ball__);
   const part:FieldStep={...base,beats:undefined,moves,ball,overlays:beat.overlays??base.overlays,links:beat.links??base.links,focusIds:beat.focusIds??base.focusIds};
   if(beat.focusIds){part.highlight=[{ids:beat.focusIds,color:[.92,.76,.42]}];part.cameraFocusIds=beat.focusIds;}
   const next:Record<string,Point>={...previous,__ball__:ball};for(const move of moves)next[move.id]=move.to;
   frames.push(next);flat.push(part);windows.push({start:i===0?0:beats[i-1].end,end:last?1:beat.end,label:beat.label});
  }
  ranges.push(windows);
 }
 const [width,length]=lesson.fmt==='11v11'?[68,105]:lesson.fmt==='futsal'?[20,40]:lesson.fmt==='7v7'?[37,55]:[45.7,73.2];
 const vias=planLessonRuns(flat,frames,{x:width/270,y:length/400});let index=0;
 plan=ranges.map(windows=>windows.map(window=>{const n=index++;return{...window,step:flat[n],from:frames[n],to:frames[n+1],vias:vias[n]};}));
 plannedRuns.set(lesson,plan);return plan;
}
/** A deterministic visual beat: seeking, pause and replay use the same local clock. */
export function lessonVisualFrame(lesson:FieldLesson,step:number,progress:number){
 const frames=lessonRuns(lesson)[step],t=Math.max(0,Math.min(1,progress));
 const index=Math.max(0,frames.findIndex((frame,i)=>t<frame.end||i===frames.length-1)),frame=frames[index];
 return {step:frame.step,progress:Math.max(0,Math.min(1,(t-frame.start)/Math.max(.001,frame.end-frame.start))),start:frame.start,end:frame.end,label:frame.label,index,count:frames.length};
}
/** Preserve actor IDs and final endpoints, with multiple authored moves per teaching step. */
export function lessonPositions(lesson:FieldLesson,step:number,progress:number){
 const visual=lessonVisualFrame(lesson,step,progress),frame=lessonRuns(lesson)[step][visual.index],t=smooth(visual.progress);
 const positions=new Map<string,Point>();for(const [id,p]of Object.entries(frame.from))if(id!=='__ball__')positions.set(id,p);
 for(const move of frame.step.moves){const from=positions.get(move.id)??move.to;positions.set(move.id,runPoint(from,move.to,frame.vias.get(move.id),t));}
 const from=frame.from.__ball__,to=frame.to.__ball__;
 return {positions,ball:{x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t}};
}
/** Let the visual sequence use the narration time instead of rushing ahead of the explanation. */
export function lessonStepSeconds(step:FieldStep){
 const narration=Math.max(0,...Object.values(step.voice??{}).map(clip=>clip.duration));
 const reading=(step.say??step.desc).trim().split(/\s+/).length/2.7;
 return Math.max(3,(step.dur??1)*5,narration||reading,(step.beats?.length??1)*2);
}

/** A demonstration after a wrong answer never changes the recorded answer or awards credit. */
export function quizOutcomeStep(session:FieldSession|null):number|undefined{
 if(!session?.quiz||session.answer===null)return;
 const q=session.lesson.questions[session.question];
 if(!q||(session.answer!==q.correct&&!session.outcomePreview))return;
 return q.outcomeStep??undefined;
}
export function resetQuizOutcome(session:FieldSession){session.outcomeProgress=0;session.outcomePreview=false;session.outcomePaused=false;}
