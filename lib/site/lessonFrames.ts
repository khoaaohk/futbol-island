import fs from 'node:fs';
import path from 'node:path';
/**
 * Pitch frames for the lesson reading pages (visual pass, Nov 17 2026; audit rank 1). Every frame is a freeze of the lesson's
 * OWN data in public/lessons/<format>.json, the same file the game plays: the starting `offense` / `defense` / `ball`, then each
 * step's `moves` and `ball` applied in order (the end pose of a step is its authored endpoint, as lib/town/formatLessons.ts
 * plays it). Nothing here is drawn by hand, so a frame can never show tactics the coach does not teach.
 *
 * Coordinates are the game's 270x400 lesson space: the field runs x 10-260 and y 10-390, the gold team (offense) attacks up
 * toward y=0. The reading page shows the coach's steps in 2 or 3 chapters (`chapterRanges`), each with one frame: the pose at
 * the end of the chapter, dashed arrows for players who moved during it, solid arrows for the ball's path.
 * Quiz data (the correct index, tap spots) is never read here.
 */
type P={x:number;y:number};
type RawActor=P&{id:string;label?:string};
type RawStep={desc?:string;ball?:P;moves?:{id:string;to:P}[];focusIds?:string[];voice?:Record<string,{duration?:number}>};
type RawLesson={id:string;offense?:RawActor[];defense?:RawActor[];ball?:P;steps?:RawStep[];questions?:unknown[]};
export type FramePlayer=P&{id:string;label:string;team:'gold'|'opp';focus:boolean};
export type FrameRun={label:string;team:'gold'|'opp';from:P;to:P};
/** One frame: `step` is the 1-based last step of its chapter (the text step the picture freezes). `view` is the vertical crop. */
export type LessonFrameData={step:number;players:FramePlayer[];ball:P;runs:FrameRun[];ballPath:P[];holder?:string;receiver?:string;view:{y0:number;y1:number}};
export const FIELD={x0:10,x1:260,y0:10,y1:390,w:270,h:400} as const;

let RAW:Map<string,RawLesson>|null=null;
function raw(id:string){
 if(!RAW){RAW=new Map();for(const f of ['7v7','9v9','11v11','futsal'])for(const l of JSON.parse(fs.readFileSync(path.join(process.cwd(),'public/lessons',f+'.json'),'utf8')) as RawLesson[])RAW.set(l.id,l);}
 return RAW.get(id);
}
const clean=(s:unknown)=>typeof s==='string'?s.replace(/\s+/g,' ').trim():'';
const dist=(a:P,b:P)=>Math.hypot(a.x-b.x,a.y-b.y);

/** Split n steps into chapters: 2 for up to 7 steps, 3 above that; earlier chapters take the extra step. [start,end) 0-based. */
export function chapterRanges(n:number):[number,number][]{
 if(n<=0)return [];
 const c=n<=3?1:n<=7?2:3,base=Math.floor(n/c),extra=n%c,out:[number,number][]=[];let s=0;
 for(let i=0;i<c;i++){const len=base+(i<extra?1:0);out.push([s,s+len]);s+=len;}
 return out;
}

/** The raw step index that ends each reading-page step (the page drops empty and repeated step text, lib/site/lessons.ts). */
function stepEnds(steps:RawStep[]){
 const ends:number[]=[];let last='';
 steps.forEach((s,i)=>{const t=clean(s.desc);if(t&&t!==last){ends.push(i);last=t;}else if(ends.length)ends[ends.length-1]=i;});
 return ends;
}

/** About how long the lesson takes on the island: the coach's spoken steps plus ~20 s a question, in whole minutes (min 1). */
export function lessonMinutes(id:string):number|null{
 const l=raw(id);if(!l?.steps?.length)return null;
 let s=0;for(const st of l.steps){const v=st.voice&&Object.values(st.voice)[0];s+=v?.duration??4;}
 return Math.max(1,Math.round((s+20*(l.questions?.length??0))/60));
}

/** One frame per chapter, or null when the lesson has no positional data (the page then draws the format's shape instead). */
export function lessonFrames(id:string,stepCount:number):LessonFrameData[]|null{
 const l=raw(id);if(!l?.steps?.length||!l.offense?.length||!l.ball)return null;
 const ends=stepEnds(l.steps);if(ends.length!==stepCount)return null;
 const team=new Map<string,{label:string;team:'gold'|'opp'}>();
 for(const a of l.offense)team.set(a.id,{label:a.label||a.id.toUpperCase(),team:'gold'});
 for(const a of l.defense??[])team.set(a.id,{label:a.label||a.id.toUpperCase(),team:'opp'});
 // poses[i] = positions after raw step i-1 (poses[0] is the setup)
 const poses:{pos:Map<string,P>;ball:P}[]=[{pos:new Map([...l.offense,...(l.defense??[])].map(a=>[a.id,{x:a.x,y:a.y}])),ball:{...l.ball}}];
 for(const st of l.steps){const prev=poses[poses.length-1],pos=new Map(prev.pos);
  for(const m of st.moves??[])if(pos.has(m.id))pos.set(m.id,{x:m.to.x,y:m.to.y});
  poses.push({pos,ball:st.ball?{...st.ball}:prev.ball});}
 const frames:LessonFrameData[]=[];
 for(const [a,b] of chapterRanges(stepCount)){
  const rawFrom=a===0?0:ends[a-1]+1,rawTo=ends[b-1]+1,start=poses[rawFrom],end=poses[rawTo];
  // The coach's focus is a ring only when it picks out a few players (1-3); a whole-team focus is no information.
  const focusRaw=l.steps[ends[b-1]].focusIds??[],focus=new Set(focusRaw.length<=3?focusRaw:[]);
  const players:FramePlayer[]=[...end.pos].map(([pid,p])=>({id:pid,x:p.x,y:p.y,label:team.get(pid)!.label,team:team.get(pid)!.team,focus:focus.has(pid)}));
  const runs:FrameRun[]=[];
  for(const [pid,p] of end.pos){const s=start.pos.get(pid)!;if(dist(s,p)>=16)runs.push({label:team.get(pid)!.label,team:team.get(pid)!.team,from:s,to:p});}
  const ballPath:P[]=[start.ball];
  for(let r=rawFrom+1;r<=rawTo;r++){const q=poses[r].ball;if(dist(q,ballPath[ballPath.length-1])>=14)ballPath.push(q);}
  const near=(q:P,pose:Map<string,P>)=>{let best:string|undefined,bd=22;for(const [pid,p] of pose){const d=dist(p,q);if(d<bd){bd=d;best=pid;}}return best?team.get(best)!.label:undefined;};
  const holder=near(ballPath[0],start.pos),receiver=ballPath.length>1?near(ballPath[ballPath.length-1],end.pos):undefined;
  // Vertical crop around what matters (moved players, the ball's path, the coach's focus), full field width, at least 210 tall.
  const ys=[...runs.flatMap(r=>[r.from.y,r.to.y]),...ballPath.map(q=>q.y),...players.filter(p=>p.focus).map(p=>p.y)];
  if(ys.length<2)ys.push(...players.map(p=>p.y));
  let y0=Math.min(...ys)-36,y1=Math.max(...ys)+36;const min=210;
  if(y1-y0<min){const c=(y0+y1)/2;y0=c-min/2;y1=c+min/2;}
  if(y0<0){y1-=y0;y0=0;}if(y1>FIELD.h){y0-=y1-FIELD.h;y1=FIELD.h;}y0=Math.max(0,y0);
  // A dot cut in half by the crop edge reads as a glitch (as lib/town/visualQuiz.ts frameView): pull the edge just past it.
  for(const p of players){if(p.y<y0+15&&p.y>y0-15)y0=Math.max(0,p.y-17);if(p.y>y1-15&&p.y<y1+15)y1=Math.min(FIELD.h,p.y+17);}
  frames.push({step:b,players,ball:end.ball,runs:runs.sort((p,q)=>dist(q.from,q.to)-dist(p.from,p.to)).slice(0,6),ballPath,holder,receiver,view:{y0:Math.round(y0),y1:Math.round(y1)}});
 }
 return frames;
}
