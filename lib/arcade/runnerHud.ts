import {RUNNER_SKILLS,RUNNER_SKILL_FOR,RUNNER_SKILL_WINDOW,runnerContactTime,runnerMultiplier,runnerOver,runnerSkillTarget,type RunnerGame} from './runnerGame';
import {runnerMissionSummary} from './runnerMissions';
import {routeCurve,routeGrade,ROUTE_BEND_MIN,ROUTE_STEEP} from '../../components/games/runnerRoute';

/** Breakaway Run heads-up display: one short status line, one coaching line and the
 * Skill button's live label (it names the real move that beats the defender ahead). */
export type RunnerHud={score:string;detail:string;message:string;over:boolean;ready:boolean;skillLabel:string;skillReady:boolean};
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
export const runnerHearts=(lives:number)=>'♥'.repeat(Math.max(0,Math.min(3,lives)))+'♡'.repeat(Math.max(0,3-Math.max(0,lives)));
const FRESH=new Set(['inside','skillmove','early','onetwo','mission','boss','route','shield','goal','save','mud','close','hit']);
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
 const status=runner.boost>0?(runner.shield?'POWER RUN · SHIELD':'POWER RUN'):runner.boss>0?'BOSS · BACK LINE':runner.route==='wing'?'WING ROUTE':runner.route==='middle'?'MIDDLE · GOALS ×2':`STAGE ${runner.level} · ${runner.stageName}`;
 const lesson=over?runnerLessonTakeaway(runner):'';
 const detail=over?`${runner.goals} goal${runner.goals===1?'':'s'} · ${Math.floor(runner.distance)} m · stage ${runner.level} · ${runnerMissionSummary(runner)} · ${lesson?lesson+' · ':''}${runnerRouteTakeaway(runner)}`:
  `${runnerHearts(runner.lives)} · ⚽ ${runner.balls}/5 · ${runnerMultiplier(runner)>1?`×${runnerMultiplier(runner)}`:`${Math.floor(runner.distance)} m`} · ${status}`;
 // Teaching moments (skill names, one-twos, missions, goals) stay on screen briefly before tips return.
 const fresh=runner.time-runner.eventAt<1.3&&FRESH.has(runner.eventKind);
 const message=fresh?runner.message:runner.shots.some(p=>p.active&&(p.returner||p.returning))?'RETURN BALL · jump or change lanes'
  :runner.charging?(runner.charge>=.8?'BLAST READY · release to break through':`HOLD TO CHARGE · ${Math.round(runner.charge*100)}%`)
  :runner.pass.phase?'ONE-TWO · keep running, it is coming back'
  :fork&&fork.z<-20?'FORK · LEFT = wing (safer, cross) · CENTRE/RIGHT = middle (goals ×2)'
  :chip?'KEEPER RUSHING · CHIP (Skill) or go round him'
  :goal?.cross&&goal.z>-26&&goal.z<-6?'CROSS COMING · jump, then shoot in the air'
  :goal?.keeper&&!goal.rush&&goal.z>-24&&goal.z<-8?`KEEPER ${(goal.vx??0)>.3?'MOVING RIGHT':(goal.vx??0)<-.3?'MOVING LEFT':'SET'} · shoot the other side`
  :threat&&!threat.closing&&threat.closeTo===undefined?ROLE_TIP[threat.role??'jockey']
  :threat?.closeTo!==undefined||threat?.closing?'GAP CLOSING · cut into the space they leave'
  :mate&&runner.balls>0?(runner.lane===mate.lane?'TEAMMATE · Shoot to pass: ONE-TWO':`TEAMMATE ON THE ${mate.lane<0?'LEFT':'RIGHT'} · move over for a one-two`)
  :goal&&!goal.keeper&&goal.z> -22&&goal.z< -8&&Math.abs(runner.x-goal.openLane*2.4)<.65?'FINISH NOW · timed shots earn +150'
  :(!goal&&routeTip(runner))||runner.message;
 return{score:String(runner.score),detail,message,over,ready:false,skillLabel,skillReady};
}
