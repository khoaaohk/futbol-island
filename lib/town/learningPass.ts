/**
 * Draw-the-pass for the "Make yourself an option" coach lesson (docs/pass-puzzle/CONTRACT.md, lane F).
 * Pure TS, no DOM and no three.js, so tests/lesson-draw-pass.cjs can run it headless.
 *
 * Lesson world coordinates are Town metres: the passer stands at PASSER (z 21) and plays toward -z.
 * The pass-puzzle engine (lib/passPuzzle, lane C) uses pitch metres with the attacking goal at +z;
 * `toPitch` / `fromPitch` adapt at this boundary so the lesson keeps its own world.
 *
 * Heat: `predictLessonPass` (one bounded engine look-ahead) runs only when the stroke changes (pointer
 * move), never in the render loop. During the pass and the slow-motion replay Town steps the engine
 * (fixed 1/120 ticks, three players) and reads `lessonFrame`; nothing runs while the child is aiming.
 */
import {PASSER,DEFENDER,type Point} from './learning';
import {createPuzzle,predict,readStroke,replay} from '../passPuzzle';
import type {Scenario,PuzzleWorld,PuzzleState,PuzzleSnapshot,PuzzleInput,Kick} from '../passPuzzle';
export {replay as replayLessonPass};

export type LessonFormat='7v7'|'9v9'|'11v11';
export const LESSON_FORMATS:LessonFormat[]=['7v7','9v9','11v11'];
export const LESSON_ATTEMPTS=3;
/** Slow-motion "Watch again" speed, shared with the pass-puzzle replay. */
export const REPLAY_SPEED=.38;
export const LESSON_FORMAT_KEY='fi2-lesson-format-v1',PATH_FORMAT_KEY='fi2-path-format-v1';
/** The passer faces down the court (-z, toward the receiver) before the pass. */
export const PASSER_FACING=Math.PI;
/** A stroke must begin this close to the ball (metres on the ground). */
export const STROKE_GRAB=2.2;

export type StrokePoint={x:number;z:number;t:number};
export type PathPoint={x:number;y:number;z:number;t:number};
export type LessonPrediction={
 path:PathPoint[];
 end:'receive'|'intercept'|'rest'|'out';
 /** Indices into the defender list whose reach beats the ball somewhere on the path. */
 threats:number[];
 interceptAt?:PathPoint;
 receiveAt?:PathPoint;
 /** Passer wind-up before the ball leaves the foot (windupSeconds). */
 windup:number;
 /** Seconds from the start of the wind-up until the ball settles. */
 duration:number;
};
/** Everything needed to re-run an attempt deterministically (engine replay at REPLAY_SPEED). */
export type AttemptRecord={kick:Kick;prediction:LessonPrediction;receiver:Point;defender:Point;start:PuzzleSnapshot;inputs:PuzzleInput[];outcome?:'receive'|'intercept'|'rest'|'out'};

/** Kid wording scaled 7v7 → 9v9 → 11v11 (AGENTS.md; docs/quiz-design.md). */
export const PASS_COPY:Record<LessonFormat,{brief:string;hint:string;threat:string;clear:string;miss:string;rest:string;success:string}>={
 '7v7':{
  brief:'Draw the pass. Put your finger on the ball and drag it to your teammate.',
  hint:'See a red ring? That defender can steal it. Take two big steps sideways, then draw again.',
  threat:'Red ring: that defender can reach your pass.',
  clear:'Clear line. Let go to pass!',
  miss:'The defender got there first. Move to a new angle and try again.',
  rest:'Nobody was there to get it. Draw the pass right to your teammate.',
  success:'It got through! Moving sideways made a clear line.',
 },
 '9v9':{
  brief:'Draw the pass from the ball to the receiver. A red ring means a defender can reach the line before the ball does.',
  hint:'Check the gap between the defender and your line. Move until the gap is big, then pass with pace so they can’t close it.',
  threat:'Red ring: the defender can step into this lane in time.',
  clear:'The lane is clear of the defender’s reach. Release to pass.',
  miss:'Intercepted. The lane was inside the defender’s reach. Change your angle, then play it again.',
  rest:'That pass ran into empty space. Aim for the receiver’s feet.',
  success:'Through the lane. Your angle kept the ball away from the defender’s reach.',
 },
 '11v11':{
  brief:'Play the pass along a lane the defender can’t close. Red means they reach the line before the ball. Angle and pace both matter.',
  hint:'Make a diagonal: step off the defender’s shoulder so the lane opens, then play it firm to the receiver’s far foot, away from pressure.',
  threat:'Red: the defender closes this lane before the ball arrives.',
  clear:'Lane open: no defender can reach it in time. Release to play it.',
  miss:'Cut out. The defender closed the lane in time. Improve the receiving angle, then pass again.',
  rest:'Nobody arrived, so the pass died in space. Play to the receiver or just ahead of them.',
  success:'Clean pass. Your angle and the pace beat the defender’s recovery.',
 },
};

export function lessonFormat(storage?:{getItem(key:string):string|null}|null):LessonFormat{
 try{const own=storage?.getItem(LESSON_FORMAT_KEY);if(own&&(LESSON_FORMATS as string[]).includes(own))return own as LessonFormat;
  const path=storage?.getItem(PATH_FORMAT_KEY);if(path&&(LESSON_FORMATS as string[]).includes(path))return path as LessonFormat;}catch{}
 return '7v7';
}

// ── Engine boundary ──────────────────────────────────────────────────────────────────────────
// Lesson world (Town metres, passer at z 21 playing toward -z) ⇄ pass-puzzle pitch (goal at +z).
// A half-turn about the court centre keeps handedness, so stroke bends and curl keep their sign.
const CENTER={x:11,z:13.5};
export const toPitch=(p:Point):Point=>({x:CENTER.x-p.x,z:CENTER.z-p.z});
export const fromPitch=(p:Point):Point=>({x:CENTER.x-p.x,z:CENTER.z-p.z});
/** Engine ball radius is 0.11 m; Town's lesson ball is 0.19 m. */
const BALL_LIFT=.19-.11;

/** The frozen lesson situation as an engine scenario: passer (0), the child as receiver (1), one marker. */
export function lessonScenario(receiver:Point,format:LessonFormat,defender:Point=DEFENDER):Scenario{
 const copy=PASS_COPY[format],same=(text:string)=>({'7v7':text,'9v9':text,'11v11':text});
 const passer=toPitch(PASSER),you=toPitch(receiver),marker=toPitch(defender);
 return {id:'lesson-passing-lane',pack:'coach-lessons',title:'Find a passing lane',concept:'support-angle',
  brief:{...same(copy.brief),[format]:copy.brief},hint:{'7v7':PASS_COPY['7v7'].hint,'9v9':PASS_COPY['9v9'].hint,'11v11':PASS_COPY['11v11'].hint},
  pitch:{halfWidth:9.2,length:29,goalWidth:3},carrier:0,attackers:[{x:passer.x,z:passer.z},{x:you.x,z:you.z}],defenders:[{x:marker.x,z:marker.z}],
  attempts:1,require:{minPasses:1,finish:'reach-zone',zone:{x:0,z:0,r:99}},lesson:'Being open means the passer has a clear lane to you.'};
}
export const createLessonWorld=(receiver:Point,format:LessonFormat,defender:Point=DEFENDER)=>createPuzzle(lessonScenario(receiver,format,defender));

export const strokeStartsAtBall=(p:Point,ball:Point=PASSER,radius=STROKE_GRAB)=>Math.hypot(p.x-ball.x,p.z-ball.z)<=radius;

/** Stroke (lesson world points) → engine Kick. The lesson teaches ground passing lanes, so a held
 * finger never turns into a chip over the marker: loft is always 0 here. */
export function readLessonStroke(points:StrokePoint[],world:PuzzleWorld):Kick|null{
 if(points.length<2||!strokeStartsAtBall(points[0]))return null;
 const end=points[points.length-1];if(Math.hypot(end.x-PASSER.x,end.z-PASSER.z)<2)return null;
 const kick=readStroke(points.map(p=>({...toPitch(p),t:p.t})),world);
 return {...kick,kind:kick.kind==='pass-feet'||kick.kind==='header'?'pass-feet':'pass-space',loft:0};
}

/** Predict one pass with the engine (bounded: one flight, ≤ 4 s) and express it in lesson world. */
export function predictLessonPass(world:PuzzleWorld,kick:Kick):LessonPrediction{
 const p=predict(world,kick),{windup}=world.turnFor(kick);
 const path:PathPoint[]=p.path.map((q,i)=>({...fromPitch(q),y:q.y+BALL_LIFT,t:windup+i*SAMPLE_DT}));
 if(!path.length){const at=PASSER;path.push({x:at.x,y:.19,z:at.z,t:windup});}
 const last=path[path.length-1];
 const end:LessonPrediction['end']=p.end==='intercept'?'intercept':p.end==='out'?'out':p.receiver===1?'receive':'rest';
 return {path,end,threats:p.threats,interceptAt:end==='intercept'?last:undefined,receiveAt:end==='receive'?last:undefined,windup,duration:last.t+.35};
}
const SAMPLE_DT=1/30;

/** Engine state → what Town poses: ball, receiver, marker and the passer's kick progress/facing. */
export function lessonFrame(state:PuzzleState){
 const b=state.ball.p,kicker=state.attackers[0],marker=state.defenders[0];
 const pending=state.pending,flight=state.flight;
 // Kick progress for the passer rig: contact (0.36) lands on the release.
 const kick=pending?(1-pending.left/Math.max(.05,pending.total))*.36:flight&&flight.kicker===0?Math.min(1,.36+flight.elapsed/.45*.64):state.chain.length?1:0;
 return {ball:{...fromPitch(b),y:b.y+BALL_LIFT},receiver:fromPitch(state.attackers[1].p),defender:fromPitch(marker.p),
  kick,passerFacing:kicker.facing+Math.PI,defenderSliding:!!marker.slide,flying:!!flight,done:state.phase==='success'||state.phase==='fail'||state.phase==='aiming'&&state.chain.length>0,outcome:lessonOutcome(state)};
}

/** Brief → hint → 3 attempts. The hint unlocks after the first miss (or on request). */
export type AttemptState={format:LessonFormat;used:number;hint:boolean;result:'aiming'|'success'|'miss'|'spent';last?:AttemptRecord};
export const newAttempts=(format:LessonFormat):AttemptState=>({format,used:0,hint:false,result:'aiming'});
export function recordAttempt(state:AttemptState,record:AttemptRecord):AttemptState{
 const used=state.used+1,success=(record.outcome??record.prediction.end)==='receive';
 return {...state,used,last:record,hint:state.hint||!success,result:success?'success':used>=LESSON_ATTEMPTS?'spent':'miss'};
}
export const attemptsLeft=(s:AttemptState)=>Math.max(0,LESSON_ATTEMPTS-s.used);
export function attemptMessage(s:AttemptState){const copy=PASS_COPY[s.format],p=s.last?.prediction;
 if(!p)return copy.brief;const end=s.last?.outcome??p.end;if(end==='receive')return copy.success;return end==='intercept'?copy.miss:copy.rest;}
/** Engine state → lesson outcome. A deflection that ends with someone collecting the loose ball
 * returns the engine to aiming with a dirty chain: the marker got a touch, so it counts as cut out. */
export function lessonOutcome(state:PuzzleState):AttemptRecord['outcome']{
 if(state.phase==='success')return 'receive';
 const r=state.result?.reason;if(state.phase==='fail')return r==='intercept'||r==='save'?'intercept':r==='out'?'out':'rest';
 return state.chain.length?'intercept':undefined;
}
