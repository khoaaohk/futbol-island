import {GRADUATION_FORMATS,type GradFormat} from './graduationModel';

/**
 * The Matchday Ferry finale (Lane 2, Sep 30 2026; docs/endgame-2026-09-30.md). Pure rules: which review questions the coach's
 * exam asks, the draw-the-pass rounds and their judging. The UI is components/MatchdayFinale.tsx.
 *
 * Teach by review: the exam asks two picture questions from every format's own starter lessons (ones the player has passed),
 * then two draw-the-pass problems. Wrong answers explain why and the child tries again, so the trophy is always reachable;
 * the score only counts first-try answers, and it is framed positively.
 */
export const EXAM_PER_FORMAT=2;
/** Question kinds the exam uses (all rendered by the existing VisualQuestion; 'order' drags are left for the lessons). */
export const EXAM_KINDS=new Set(['tapSpot','bestPass','pickPicture','dragToZone','whatNext','trueFalse']);
export type ExamSource={format:GradFormat;lessons:{id:string;name:string;questions:readonly object[]}[];starter:readonly string[]};
export type ExamPick={format:GradFormat;lessonId:string;lessonName:string;index:number};

/** Small deterministic PRNG (mulberry32) so a seed replays the same exam (tests) and each ride can differ. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
/**
 * Picks EXAM_PER_FORMAT questions per format, each from a different starter lesson, in path order (futsal, 7v7, 9v9, 11v11).
 * Falls back to fewer when a format has too few eligible questions (never throws, never repeats a question).
 */
export function pickExam(sources:readonly ExamSource[],seed:number):ExamPick[]{
 const random=rng(seed),out:ExamPick[]=[];
 for(const format of GRADUATION_FORMATS){
  const src=sources.find(s=>s.format===format);if(!src)continue;const starter=new Set(src.starter);
  const pool=src.lessons.filter(l=>starter.has(l.id)).map(l=>({l,qs:l.questions.map((q,i)=>({q,i})).filter(({q})=>{const v=(q as {visual?:{kind?:unknown}}).visual;return !!v&&typeof v.kind==='string'&&EXAM_KINDS.has(v.kind);})})).filter(x=>x.qs.length);
  for(let k=pool.length-1;k>0;k--){const j=Math.floor(random()*(k+1));[pool[k],pool[j]]=[pool[j],pool[k]];}
  for(const {l,qs} of pool.slice(0,EXAM_PER_FORMAT)){const {i}=qs[Math.floor(random()*qs.length)];out.push({format,lessonId:l.id,lessonName:l.name,index:i});}
 }
 return out;
}

// ---- Draw the pass ---------------------------------------------------------------------------------------------------------
/** A 100×64 pitch, attacking to the right (x grows toward the goal). */
export type P={x:number;y:number};
export type DrawPassProblem={id:string;title:string;prompt:string;carrier:P;mates:(P&{label:string})[];defenders:P[];
 /** Why each team-mate is (or isn't) the pass, in team-mate order. */
 why:string[];concept:string};
/** A pass is blocked when a defender stands within this distance of the ball's straight path. */
export const LANE_RADIUS=4.2;
export function distanceToSegment(p:P,a:P,b:P){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));}
export const laneBlocked=(from:P,to:P,defenders:readonly P[],radius=LANE_RADIUS)=>defenders.some(d=>distanceToSegment(d,from,to)<radius);
/** The right pass: the open lane that gets the ball furthest forward (the lessons' "forward if you can, safe if you can't"). */
export function bestTarget(problem:DrawPassProblem):number{
 let best=-1;problem.mates.forEach((m,i)=>{if(laneBlocked(problem.carrier,m,problem.defenders))return;if(best<0||m.x>problem.mates[best].x)best=i;});return best;
}
/** Which team-mate a drawn line ends at (the nearest within `reach` of the release point), or -1. */
export function targetAt(problem:DrawPassProblem,end:P,reach=9){let best=-1,d=reach;problem.mates.forEach((m,i)=>{const k=Math.hypot(m.x-end.x,m.y-end.y);if(k<d){d=k;best=i;}});return best;}
export const DRAW_PASS_PROBLEMS:DrawPassProblem[]=[
 {id:'open-lane',title:'Find the open lane',concept:'Passing lanes',prompt:'Draw a pass from the ball to the team-mate who is really free.',
  carrier:{x:30,y:32},mates:[{x:52,y:32,label:'A'},{x:48,y:12,label:'B'},{x:22,y:52,label:'C'}],defenders:[{x:41,y:32},{x:56,y:40}],
  why:['A is furthest forward, but a defender stands right in that lane: the pass would be cut out.','Yes! A is further forward, but a defender blocks that lane. B is the furthest-forward team-mate with an open lane. Forward if you can.','C is free, but it goes backwards. B is open and further forward than C.']},
 {id:'switch',title:'Switch the play',concept:'Width and switching',prompt:'Your side is crowded. Draw the pass that changes the side of the attack.',
  carrier:{x:44,y:10},mates:[{x:54,y:14,label:'A'},{x:34,y:22,label:'B'},{x:60,y:54,label:'C'}],defenders:[{x:50,y:12},{x:38,y:17},{x:53,y:8}],
  why:['Three defenders crowd that side: the lane to A is blocked.','A defender sits in the lane to B, and B is going backwards into the crowd.','Yes! The far side is empty. A switch finds the team-mate with space and time.']},
];
export const drawPassJudge=(problem:DrawPassProblem,target:number)=>({ok:target>=0&&target===bestTarget(problem),why:target>=0?problem.why[target]:'Draw your line all the way to a team-mate.'});

/** Credits: the concepts the player learned, per format (the 12 starter lesson names), and the thank-you roll. */
export const CREDITS_THANKS=['Thank you for playing Futbol Island!','You learned football on four pitches: a futsal court, and 7v7, 9v9 and 11v11 grass.','Take one idea to your next training session and try it for real.','The Academy island is still being built. Keep exploring, keep learning, and come back for the next Matchday.'];
