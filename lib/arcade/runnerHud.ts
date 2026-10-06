import {RUNNER_SKILLS,RUNNER_SKILL_FOR,RUNNER_SKILL_WINDOW,runnerContactTime,runnerMultiplier,runnerOver,runnerSkillTarget,type RunnerGame} from './runnerGame';
import {runnerMissionSummary} from './runnerMissions';

/** Breakaway Run heads-up display: one short status line, one coaching line and the
 * Skill button's live label (it names the real move that beats the defender ahead). */
export type RunnerHud={score:string;detail:string;message:string;over:boolean;ready:boolean;skillLabel:string;skillReady:boolean};
const ROLE_TIP={
 presser:'GREEN PRESSER · cut away early, or ROULETTE',
 tackler:'CORAL TACKLER · jump it, or DRAG-BACK',
 sweeper:'BLUE SWEEPER · change lanes, or RAINBOW FLICK',
 wall:'GOLD WALL · feet wide apart: NUTMEG',
 pair:'PINK PAIR · go round, or CROQUETA between',
 line:'BACK LINE · go to the side they leave open',
 jockey:'PURPLE JOCKEY · STEP-OVER, shoot or slip past',
} as const;
const FRESH=new Set(['skillmove','early','onetwo','mission','boss','route','shield','goal','save','mud','close','hit']);
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
 const detail=over?`${runner.goals} goal${runner.goals===1?'':'s'} · ${Math.floor(runner.distance)} m · stage ${runner.level} · ${runnerMissionSummary(runner)}`:
  `${runner.lives} chances · ⚽ ${runner.balls}/5 · ${runnerMultiplier(runner)>1?`×${runnerMultiplier(runner)}`:`${Math.floor(runner.distance)} m`} · ${status}`;
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
  :runner.message;
 return{score:String(runner.score),detail,message,over,ready:false,skillLabel,skillReady};
}
