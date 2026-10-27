import {RUNNER_SKILLS,RUNNER_SKILL_FOR,RUNNER_SKILL_WINDOW,runnerContactTime,runnerMultiplier,runnerOver,runnerSkillTarget,type RunnerGame} from './runnerGame';
import {runnerMissionSummary} from './runnerMissions';
import {RUNNER_MODES} from './runnerModes';
import {routeCurve,routeGrade,ROUTE_BEND_MIN,ROUTE_STEEP} from '../../components/games/runnerRoute';

/** Breakaway Run heads-up display: one short status line, one coaching line and the
 * Skill button's live label (it names the real move that beats the defender ahead). */
export type RunnerHud={score:string;detail:string;message:string;over:boolean;ready:boolean;skillLabel:string;skillReady:boolean;
 /** First-run coach: the one button to light ('' = none). */coach:string};
// Action first, in a 7-year-old's words: what to do, then the named skill that also works.
const ROLE_TIP={
 presser:'GREEN PRESSER runs at you · move early, or ROULETTE',
 tackler:'CORAL SLIDE TACKLE · JUMP it, or DRAG-BACK',
 sweeper:'BLUE SWEEPER · change lane, or RAINBOW FLICK',
 wall:'GOLD WALL, legs wide · NUTMEG it',
 pair:'PINK PAIR · go round, or CROQUETA between',
 line:'BACK LINE · run to the open side',
 jockey:'PURPLE DEFENDER · change lane, or STEP-OVER',
} as const;
/** Chances as hearts: a child reads ♥♥♡ faster than "2 chances". */
export const runnerHearts=(lives:number,max=3)=>'♥'.repeat(Math.max(0,Math.min(max,lives)))+'♡'.repeat(Math.max(0,max-Math.max(0,lives)));
const FRESH=new Set(['best','inside','skillmove','early','onetwo','mission','boss','route','shield','goal','save','mud','close','hit','terrain','finalhill','combo','power']);
/** Round 3: one line about the route for the full-time card. */
export function runnerFinishLine(r:RunnerGame){
 const m=RUNNER_MODES[r.mode];if(!m.finish)return '';
 if(r.won)return m.bossKeeper?`${m.name}: BOSS KEEPER BEATEN!`:`${m.name}: goal-line finish!`;
 if(r.finished)return `${m.name}: you reached the goal line!`;
 return `${m.name}: ${Math.floor(r.distance)} of ${m.finish} m`;
}
/** One short after-run takeaway about the game's lesson: beat the tackle, then find the goal. */
export function runnerLessonTakeaway(r:RunnerGame){
 if(r.beatScores>0)return `Beat the tackle, then scored: ${r.beatScores}×!`;
 if(r.goals>0&&r.skills+r.nearMisses+r.hurdles>0)return 'Next: beat a defender, then shoot straight away';
 return '';
}
/** One short after-run takeaway about the route: the short way round bends. */
export function runnerRouteTakeaway(r:RunnerGame){
 if(r.bends<2)return 'Look up early: plan your next move';
 return r.insideCuts*2>=r.bends?`Bends cut inside: ${r.insideCuts}/${r.bends}. Great racing line!`:`Bends cut inside: ${r.insideCuts}/${r.bends}. Next time hug the inside: it is the short way`;
}
/** Route tip for the coaching line: bends ahead and slopes. Lowest priority after every football cue. */
function routeTip(r:RunnerGame){
 const ahead=routeCurve(r.distance+18),now=r.bendDir,dir=now||(Math.abs(ahead)>ROUTE_BEND_MIN?Math.sign(ahead):0);
 if(dir)return r.lane===dir?`INSIDE LINE · hold it round the bend ${dir>0?'→':'←'}`:`BEND ${dir>0?'RIGHT':'LEFT'} · cut inside if the lane is open`;
 const g=routeGrade(r.distance+12);
 if(g>ROUTE_STEEP)return 'CLIMB · you slow down: take an extra look';
 if(g<-ROUTE_STEEP)return 'DOWNHILL · faster! Keep it close, decide early';
 return '';
}
export function runnerHud(runner:RunnerGame):RunnerHud{
 const over=runnerOver(runner);
 const target=runnerSkillTarget(runner,-16),time=target?runnerContactTime(runner,target):9;
 const goal=runner.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<0&&o.z>-40);
 const chip=!!goal?.keeper&&!!goal.rush&&(goal.kout??0)>.2&&goal.z>-26&&goal.z<-6;
 const skillLabel=target?RUNNER_SKILLS[RUNNER_SKILL_FOR[target.role??'jockey']].label:chip?'Chip':'Skill';
 const skillReady=runner.balls>0&&(target?time<=RUNNER_SKILL_WINDOW.early&&time>=RUNNER_SKILL_WINDOW.late:chip);
 const threat=runner.objects.find(o=>o.kind==='defender'&&!o.passed&&!o.beaten&&o.z> -24&&Math.abs(runner.x-(o.x??o.lane*2.4))<1.4);
 const mate=runner.objects.find(o=>o.kind==='mate'&&!o.passed&&o.z>-26&&o.z<-4);
 const fork=runner.objects.find(o=>o.kind==='fork'&&!o.passed&&o.z>-80);
 const finalGoal=runner.finishPhase==='keeper'?runner.objects.find(o=>o.kind==='goal'&&o.final&&!o.passed):undefined;
 const gauntlet=runner.objects.find(o=>o.gauntlet&&!o.passed&&o.z>-40);
 const roller=runner.objects.find(o=>o.kind==='roller'&&!o.passed&&o.z>-30);
 const magnet=runner.objects.find(o=>o.kind==='magnet'&&!o.passed&&o.z>-30);
 const drifting=runner.objects.find(o=>o.kind==='defender'&&o.drift!==undefined&&!o.passed&&o.z>-45);
 const status=runner.finishPhase==='hill'?'HILL!':runner.finishPhase==='keeper'?(runner.bossKeeper?'BOSS!':'GOAL!'):runner.magnet>0?'MAGNET':runner.boost>0?(runner.shield?'POWER RUN + SHIELD':'POWER RUN'):runner.boss>0?'BACK LINE!':runner.route==='wing'?'WING ROUTE':runner.route==='middle'?'GOALS ×2':`Stage ${runner.level}`;
 const lesson=over?runnerLessonTakeaway(runner):'';
 // Full time: one fact per line (the card breaks on \n) instead of one long run-on sentence a child will not read.
 const finishLine=over?runnerFinishLine(runner):'';
 const detail=over?`${finishLine?finishLine+'\n':''}${runner.newBest?'NEW PERSONAL BEST!\n':''}${runner.goals} goal${runner.goals===1?'':'s'} · ${Math.floor(runner.distance)} m · stage ${runner.level}\n${runnerMissionSummary(runner)}\n${lesson?lesson+'\n':''}${runnerRouteTakeaway(runner)}`:
  // Two short lines for the phone header pill (its text column is ~130 px): what you HAVE (chances, balls, combo),
  // then WHERE you are (distance, stage or the live route/power state). Distance never swaps out (no jitter); the
  // stage's lesson name is announced on the coaching line when the stage starts, not crammed in here.
  `${runnerHearts(runner.lives,runner.maxLives)} · ⚽ ${runner.balls}/5${runnerMultiplier(runner)>1?` · ×${runnerMultiplier(runner)}`:''}\n${runner.finish?`${Math.max(0,Math.ceil(runner.finish-runner.distance))} m to go`:`${Math.floor(runner.distance)} m`} · ${status}`;
 // Teaching moments (skill names, one-twos, missions, goals) stay on screen briefly before tips return.
 const fresh=runner.time-runner.eventAt<1.3&&FRESH.has(runner.eventKind);
 const message=runner.coachPrompt&&!over?runner.coachPrompt:fresh?runner.message:runner.shots.some(p=>p.active&&(p.returner||p.returning))?'RETURN BALL · jump or change lanes'
  :finalGoal&&finalGoal.z>-30?(finalGoal.keeper?`BOSS KEEPER ${(finalGoal.vx??0)>.3?'MOVING RIGHT':(finalGoal.vx??0)<-.3?'MOVING LEFT':'SET'} · shoot the other side`:'GOAL LINE · centre lane, then SHOOT!')
  :gauntlet?(gauntlet.role==='tackler'?'COMBO · JUMP the slide tackles, then SLIDE':'NOW SLIDE · under the line (or jump again)')
  :roller?'LOOSE BALL ROLLING · JUMP it'
  :drifting?'MOVING DEFENDER · watch where they stop'
  :magnet?'MAGNET ORB · grab it: balls fly to you'
  :runner.charging?(runner.charge>=.8?'BLAST READY · release to break through':`HOLD TO CHARGE · ${Math.round(runner.charge*100)}%`)
  :runner.pass.phase?'ONE-TWO · keep running, it is coming back'
  :fork&&fork.z<-20?'FORK · LEFT = wing (safer, cross) · CENTRE/RIGHT = middle (goals ×2)'
  :chip?'KEEPER RUSHING · CHIP (Skill) or go round him'
  :goal?.cross&&goal.z>-26&&goal.z<-6?'CROSS COMING · jump, then shoot in the air'
  :goal?.keeper&&!goal.rush&&goal.z>-24&&goal.z<-8?`KEEPER ${(goal.vx??0)>.3?'MOVING RIGHT':(goal.vx??0)<-.3?'MOVING LEFT':'SET'} · shoot the other side`
  :threat?.role==='line'?`BACK LINE · open side: ${threat.openLane<0?'← LEFT':'RIGHT →'} (follow the gold arrows)`
 :threat&&!threat.closing&&threat.closeTo===undefined?ROLE_TIP[threat.role??'jockey']
  :threat?.closeTo!==undefined||threat?.closing?'GAP CLOSING · cut into the space they leave'
  :mate&&runner.balls>0?(runner.lane===mate.lane?'TEAMMATE · Shoot to pass: ONE-TWO':`TEAMMATE ON THE ${mate.lane<0?'LEFT':'RIGHT'} · move over for a one-two`)
  :goal&&!goal.keeper&&goal.z> -22&&goal.z< -8&&Math.abs(runner.x-goal.openLane*2.4)<.65?'FINISH NOW · timed shots earn +150'
  :(!goal&&routeTip(runner))||runner.message;
 return{score:String(runner.score),detail,message,over,ready:false,skillLabel,skillReady,coach:over?'':runner.coachButton};
}
