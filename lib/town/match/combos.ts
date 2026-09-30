// Combination plays for live matches (docs/bean-characters/CONTRACT.md, "Combos lane").
// The attract-mode sim (matchSim.ts) picks one action per beat; this module plans the
// multi-step sequences a coach draws on a whiteboard and reacts to what happens next:
//   - rebounds: a parry into the six-yard area or a ball off the post stays live, the nearest
//     attackers and defenders race for it and the winner may follow up first time (tap-in,
//     volley or header) while the keeper is still on the grass;
//   - box attacks from wide: an overlap, then a low ball to the near post, a high ball to the
//     far post for a header, or a cut-back / pull-back to a midfielder arriving at the spot;
//   - one-two finishes, lay-offs (the futsal pivô's hold-up play), through balls behind the line;
//   - futsal: sole rolls under pressure, the flick-up and (rarely) the rainbow flick over a
//     defender, 3-1 rotations (a team-mate fills the space a runner leaves) and kick-in routines;
//   - 1v1 skills (stepover, feint, drag-back, Cruyff turn, inside/outside cut, fake shot, nutmeg) shown when the
//     sim's own duel logic lets a dribbler knock the ball past a defender.
// The view layer (createComboView, render only) also picks, from the match context, how a shot is struck (chip over
// a keeper off his line, curl or trivela from an angle, knuckleball from distance, toe poke in a crowd), how a keeper
// distributes (roll-out, overarm throw, punt), the defender's block or poke tackle and the scorer's celebration.
// Every outcome is decided at the moment of the action (the sim's own philosophy: the pass is
// "decided at launch"), with a private seeded RNG so the sim's random stream is untouched and
// each seed stays deterministic. The sim calls in through small, marked hooks:
//   step · onBall · onParry · onBeatMan · runTarget · passLead · finishOnClaim · pinned.
// Teaching purpose: each sequence is announced in the match feed with the reason it works.
import type {MatchSim,SimPlayer,Team,Role,TouchKind,KickWindup} from './matchSim';
import type {PlayerMotion,SignatureMove} from '../../graphics/player';
import {MOVE_CONTACT,MOVE_SECONDS} from './choreo';
import {SKILL_MOVES,SKILL_BALL_RADIUS,skillBall,skillFrame,type SkillMove,type SkillMotion} from '../../graphics/skillMoves';

/** Master switch (balance harnesses turn it off to measure the "before" game on the same code). */
export const comboSettings={enabled:true,/** Futsal's creative layer (take-ons, the whole 1v1 library, flick volleys, the futsal finishing kit, back-heel lay-offs); false = the batch-2 game, for before/after reports. */futsalCreative:true,/** Balance experiments: override the per-format trailing boosts (NaN = use TUNE). */trail1:NaN,trail2:NaN,/** Balance experiments: override the per-format lead brakes (NaN = use TUNE). */brakeLead1:NaN,brakeLead2:NaN,/** Feature names switched off (balance attribution): rebound, box, layOff, through, skill, beat, kickIn, rotation, oneTwo. */off:{} as Record<string,boolean>};

export type SkillKind='soleRoll'|'flickUp'|'rainbow'|'stepover'|'feint'|'dragBack'|'cruyff'|'croqueta'|'shield'|'insideCut'|'outsideCut'|'fakeShot'|'nutmeg'|'elastico'|'roulette'|'scissors';
export type FinishKind='flickVolley'|'rebound'|'reboundHeader'|'reboundVolley'|'reboundPost'|'cutback'|'cutbackVolley'|'nearPost'|'farPost'|'oneTwo'|'layOff'|'pivotLayOff'|'throughBall'|'kickIn';
/** Everything counted for the balance report (attempts; `*Goal` keys count goals from that sequence). */
export const COMBO_KEYS=['rebound','reboundPost','reboundShot','reboundGoal','boxAttack','overlap','cutback','cutbackVolley','nearPost','farPost','boxShot','boxGoal','oneTwo','oneTwoShot','oneTwoGoal','layOff','pivotLayOff','layOffShot','layOffGoal','throughBall','throughGoal','rotation','kickIn','kickInGoal','soleRoll','flickUp','rainbow','skillBeaten','stepover','feint','dragBack','cruyff','croqueta','shield','insideCut','outsideCut','fakeShot','nutmeg','elastico','roulette','scissors','takeOn','flickVolley','flickVolleyGoal'] as const;
export type ComboKey=typeof COMBO_KEYS[number];

/** Skill-moves lane poses (lib/graphics/skillMoves.ts) for the combo skills; flick-up and sole roll are lane B's signature moves. */
export const SKILL_MOVE:Partial<Record<SkillKind,SkillMove>>={rainbow:'rainbowFlick',stepover:'stepover',feint:'bodyFeint',dragBack:'dragBack',cruyff:'cruyffTurn',croqueta:'croqueta',shield:'shield',insideCut:'insideCut',outsideCut:'outsideCut',fakeShot:'fakeShot',nutmeg:'nutmeg',elastico:'elastico',roulette:'roulette',scissors:'scissors'};
// Real seconds of each skill and where its decisive ball contact falls (the push past the defender, the flick):
// flick-up / sole roll = lane B's MOVE_PHASE, the rest = the skill-moves lane's SKILL_MOVES (last contact).
/** Live-match tempo (real seconds) where a match wants a quicker move than the lab's teaching tempo. The host drives
 * `SkillMotion.progress`, so this needs nothing from skillMoves.ts: the same poses and contacts, played faster. */
export const LIVE_SKILL_SECONDS:Partial<Record<SkillKind,number>>={rainbow:1.3,fakeShot:1.1,nutmeg:1.3,roulette:1.1};
const lastContact=(m:SkillMove)=>{const c=SKILL_MOVES[m].contacts;return c.length?c[c.length-1].p:SKILL_MOVES[m].phases[0];};
export const SKILL_TIMING=Object.fromEntries((['soleRoll','flickUp','rainbow','stepover','feint','dragBack','cruyff','croqueta','shield','insideCut','outsideCut','fakeShot','nutmeg','elastico','roulette','scissors'] as SkillKind[]).map(k=>{
 const m=SKILL_MOVE[k];
 return [k,m?{seconds:LIVE_SKILL_SECONDS[k]??SKILL_MOVES[m].seconds,contact:lastContact(m)}:{seconds:MOVE_SECONDS[k as 'soleRoll'|'flickUp'],contact:MOVE_CONTACT[k as 'soleRoll'|'flickUp']}];
})) as Record<SkillKind,{seconds:number;contact:number}>;
/** Sim seconds from the start of a skill to its decisive ball contact at this playback rate. */
export const skillLead=(k:SkillKind,rate:number)=>SKILL_TIMING[k].contact*SKILL_TIMING[k].seconds*rate;

/** The private sim members the hooks read and write (a structural view; see matchSim.ts). */
interface Host{
 players:Record<string,SimPlayer>;ids:string[];ball:MatchSim['ball'];possession:Team;score:{gold:number;blue:number};
 stats:MatchSim['stats'];restart:{kind:'kickoff'|'kickin'|'goalkick'|'corner';t:number;x:number;y:number;taker:string;carry?:string}|null;goalHold:number;
 ballFlight:number;ballIsShot:boolean;shotIsGoal:boolean;loftDur:number;loftT:number;loftPeak:number;headerBall:boolean;acro:{to:string}|null;
 lastFrom:string|null;passIntended:string|null;kicks:number;lastKick:MatchSim['lastKick'];protect:number;passCd:number;carrying:boolean;hold:number;
 windup:KickWindup|null;windupScale:number;frameContact:MatchSim['frameContact'];combination:{runner:string;wall:string;team:Team;x:number;y:number;expires:number}|null;
 tacticalReason:string;msg:string;msgT:number;fatigue:number;userId:string|null;
 trapT:number;trapDur:number;trapVX:number;trapVY:number;touchX:number;touchY:number;recv:MatchSim['recv'];
 T:{shotRange:number;finish:number;laneReq:number};goalVenue:{id:string};passMul:number;useOffside:boolean;groundFriction:number;
 persona:Record<Team,{carry:number;width:number}>;
 isOffside(t:Team,y:number):boolean;offsideLine(t:Team):number;nearestFoe(id:string,x:number,y:number):{p:SimPlayer;d:number}|null;
 atkGoalY(t:Team):number;ownGoalY(t:Team):number;dirY(t:Team):number;mates(t:Team):string[];foes(t:Team):string[];depth(t:Team,y:number):number;lastManRisk(id:string):boolean;
 doPass(from:string,to:string,firm?:number):void;doLoft(from:string,to:string,kind?:'through'|'cross'|'switch'):void;
 launch(from:string,tx:number,ty:number,speed:number,height:number,target:string|null,loft?:number):void;touch(kind:TouchKind,id:string,other:string|null,height:number,speed:number,heavy?:boolean):void;
}

type Pt={x:number;y:number};
type Finish={to:string;kind:FinishKind;mult:number;until:number};
type Expect={from:string;to:string;until:number;lead?:Pt;run?:Pt;peak?:number;header?:boolean;acro?:boolean;finish?:{kind:FinishKind;mult:number};count?:ComboKey;msg?:string;reason?:string};
type BoxPlan={kind:'box';team:Team;carrier:string;near:string|null;far:string|null;cut:string|null;overlap:string|null;side:number;start:number;until:number;delivered:boolean};
type RunPlan={kind:'run';team:Team;until:number};
type KickInPlan={kind:'kickIn';team:Team;taker:string;runner:string;until:number};
type Plan=BoxPlan|RunPlan|KickInPlan;
type Rebound={team:Team;gk:string|null;until:number;pinUntil:number;winner:string|null};
type PendingSkill={id:string;kind:SkillKind;foe:string;fireAt:number;land:Pt;peak:number;dur:number};
/** A knock past the defender held back until the skill's push contact (stepover, feint, drag-back, Cruyff, croqueta). */
/** A futsal pivô shielding the ball (back to goal) before his lay-off. */
type ShieldHold={id:string;mate:string;until:number;hold:Pt};
type PendingKnock={id:string;fireAt:number;lead:number;tx:number;ty:number;foot:'L'|'R';hold:Pt};

const SHOT_KEY:Partial<Record<FinishKind,ComboKey>>={flickVolley:'flickVolley',rebound:'reboundShot',reboundHeader:'reboundShot',reboundVolley:'reboundShot',reboundPost:'reboundShot',cutback:'boxShot',cutbackVolley:'boxShot',nearPost:'boxShot',farPost:'boxShot',oneTwo:'oneTwoShot',layOff:'layOffShot',pivotLayOff:'layOffShot'};
const GOAL_KEY:Record<FinishKind,ComboKey>={flickVolley:'flickVolleyGoal',rebound:'reboundGoal',reboundHeader:'reboundGoal',reboundVolley:'reboundGoal',reboundPost:'reboundGoal',cutback:'boxGoal',cutbackVolley:'boxGoal',nearPost:'boxGoal',farPost:'boxGoal',oneTwo:'oneTwoGoal',layOff:'layOffGoal',pivotLayOff:'layOffGoal',throughBall:'throughGoal',kickIn:'kickInGoal'};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const dist=(ax:number,ay:number,bx:number,by:number)=>Math.hypot(ax-bx,ay-by);
function segDist(px:number,py:number,ax:number,ay:number,bx:number,by:number){
 const abx=bx-ax,aby=by-ay,L2=abx*abx+aby*aby||1,t=clamp(((px-ax)*abx+(py-ay)*aby)/L2,0,1);
 return Math.hypot(ax+abx*t-px,ay+aby*t-py);
}
/** state = [trailing by 1, trailing by 2+, leading by 1, leading by 2+] combination-rate factors. Outdoors a side
 * ahead sits deeper and one behind takes risks; in futsal, where combinations don't decide who wins (1,728-game
 * attribution), only the finish quality follows the score. Per-format rates, balance-tuned on 96 seeds (7v7 shoots and parries most, so it needs the fewest extras). */
const TUNE:Record<string,{danger:number;thru:number;box:number;fin:number;state:[number,number,number,number]}>={futsal:{danger:.4,thru:.16,box:0,fin:1,state:[1,1,1,1]},'7v7':{danger:.26,thru:.1,box:.5,fin:1,state:[1.25,1.5,.5,0]},'9v9':{danger:.3,thru:.1,box:.35,fin:.85,state:[1.25,1.5,.5,0]},'11v11':{danger:.5,thru:.24,box:.5,fin:1,state:[1.25,1.5,.5,0]},
 // Beach (sand, 5 a side, no offside): parries drop into the box on a soft court, balls over the top are common.
 beach:{danger:.4,thru:.2,box:.45,fin:1,state:[1.25,1.5,.5,0]}};
/** Futsal take-ons per decision beat with a close defender (balance-tuned, see the contract). */
const TAKE_ON_RATE=.3;
const TAKE_ON_TEXT:Partial<Record<SkillKind,[string,string]>>={stepover:['Stepover','Sell one way with your foot round the ball: the defender has to guess'],croqueta:['La Croqueta','Inside of one foot to the other: in tight futsal spaces the ball moves faster than the defender'],
 elastico:['Elastico','Out and back in with the same foot: soft ankles buy you a yard'],scissors:['Scissors','Swing round the front of the ball, then take it the other way'],feint:['Body feint','Drop the shoulder: the defender leans, you keep the ball'],fakeShot:['Fake shot','Shape to shoot: when the defender blocks, keep it and look again'],
 roulette:['Roulette','Spin with your body between the ball and the defender'],dragBack:['Pull-back','Sole on top and pull it back: futsal players use the sole to keep the ball away from the tackle'],cruyff:['Cruyff turn','Fake the pass, drag it behind the standing leg and turn away from the pressure']};
const RUN_SPEED=84,ROLE_SPEED:Record<Role,number>={fwd:1.04,mid:1,def:.98,gk:1};
/** Air drag while lofted (= the sim's friction 2.2 × .35) and on the ground. */
const DRAG_AIR=2.2*.35,DRAG_GROUND=2.2;
/** Launch pace that covers `d` units in `t` sim seconds under exponential drag. */
const paceFor=(d:number,t:number,drag:number)=>d*drag/Math.max(1e-3,1-Math.exp(-drag*t));

export class Combos{
 private h:Host;private rng:()=>number;
 counts:Record<ComboKey,number>=Object.fromEntries(COMBO_KEYS.map(k=>[k,0])) as Record<ComboKey,number>;
 /** Teaching feed: the newest line and a serial (matchEffects announces it). */
 feed={serial:0,text:'',reason:''};
 /** The newest skill move (read by createComboView): who, what, which side and when the ball is touched (sim s). */
 skill={serial:0,id:'',kind:'soleRoll' as SkillKind,side:1 as -1|1,start:0,contact:0};
 /** Render hint (liveBallPhysics): the launch with this kick serial leaves from `h` m above the grass (NaN = the ball's current height). */
 launchLift={kicks:-1,h:0};
 plan:Plan|null=null;
 finish:Finish|null=null;
 rebound:Rebound|null=null;
 private runs=new Map<string,Pt>();
 private expect:Expect|null=null;
 private pending:PendingSkill|null=null;
 private knock:PendingKnock|null=null;
 private shieldHold:ShieldHold|null=null;
 private roll:{id:string;until:number;x:number;y:number}|null=null;
 /** A futsal take-on (a skill to keep the ball against a close defender): over the ball until the contact, then out along the move's exit. */
 private takeOn:{id:string;contact:number;until:number;hold:Pt;exit:Pt}|null=null;
 private rotation:{id:string;x:number;y:number;until:number}|null=null;
 private lastFinish:{kind:FinishKind;id:string;time:number}|null=null;
 private kicks=0;private frameSerial=0;private returns=0;private goals=0;private lastComb:object|null=null;private restartSeen:object|null=null;
 private next:Record<string,number>={};
 constructor(sim:MatchSim,seed:number){
  this.h=sim as unknown as Host;
  let s=(seed^0x9e3779b9)>>>0;this.rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  this.kicks=this.h.kicks;this.frameSerial=this.h.frameContact.serial;
 }
 private get now(){return this.h.stats.time;}
 private futsal(){return this.h.goalVenue.id==='futsal';}
 /** Beach soccer: the ball is played in the air (flick-ups, flick volleys, chipped kick-ins). */
 private sand(){return this.h.goalVenue.id==='beach';}
 private get tune(){return TUNE[this.h.goalVenue.id]??TUNE['11v11'];}
 /** A render-only teaching line from the view (how a shot was struck, a keeper's throw): the feed only, never the sim's own message. */
 announce(text:string,reason=''){this.feed.serial++;this.feed.text=text;this.feed.reason=reason;}
 private say(text:string,reason?:string){this.feed.serial++;this.feed.text=text;this.feed.reason=reason??'';this.h.msg=text;this.h.msgT=1.6;if(reason)this.h.tacticalReason=reason;}
 private cool(key:string,s:number){this.next[key]=this.now+s;}
 private ready(key:string){return this.now>=(this.next[key]??0);}
 /** Game state: two goals up, a side sits on its lead and risks fewer combinations; two down, it throws more at it. */
 /** Game state (teams ahead sit deeper and take fewer risks; teams behind throw bodies forward): how often this side
  * tries a combination and how clean its first-time finish is. It pulls lopsided scores back toward a contest, so
  * the combinations add drama without snowballing (balance: docs/bean-characters/CONTRACT.md, "Combos lane"). */
 private lead(t:Team){return t==='gold'?this.h.score.gold-this.h.score.blue:this.h.score.blue-this.h.score.gold;}
 private urgency(t:Team){const d=this.lead(t);const tr=this.tune.state,t1=Number.isNaN(comboSettings.trail1)?tr[0]:comboSettings.trail1,t2=Number.isNaN(comboSettings.trail2)?tr[1]:comboSettings.trail2;const b1=Number.isNaN(comboSettings.brakeLead1)?tr[2]:comboSettings.brakeLead1,b2=Number.isNaN(comboSettings.brakeLead2)?tr[3]:comboSettings.brakeLead2;return d>=2?b2:d===1?b1:d<=-2?t2:d===-1?t1:1;}
 private finishScale(t:Team){const d=this.lead(t);return this.tune.fin*(d>=2?.6:d===1?.85:d<=-2?1.15:d===-1?1.08:1);}
 private toGoal(p:SimPlayer){return dist(p.x,p.y,135,this.h.atkGoalY(p.team));}
 private lineDist(p:SimPlayer){return Math.abs(p.y-this.h.atkGoalY(p.team));}
 /** A point `d` units out from the attacking goal line of `team`, at x. */
 private goalPt(team:Team,x:number,d:number):Pt{const gy=this.h.atkGoalY(team);return {x:clamp(x,16,254),y:gy-this.h.dirY(team)*d};}
 private open(id:string){const p=this.h.players[id],f=this.h.nearestFoe(id,p.x,p.y);return f?f.d:40;}
 private laneClear(a:Pt,b:Pt,team:Team,w=this.h.T.laneReq){
  for(const fid of this.h.foes(team)){const f=this.h.players[fid];if(f.isGK||dist(f.x,f.y,a.x,a.y)<8)continue;if(segDist(f.x,f.y,a.x,a.y,b.x,b.y)<w)return false;}
  return true;
 }
 private keeperOf(team:Team){for(const id of this.h.mates(team))if(this.h.players[id].isGK)return id;return null;}
 /** xG multiplier for a first-time finish, capped so the chance never exceeds `cap`. */
 private finishMult(p:SimPlayer,want:number,cap:number){
  const d=this.toGoal(p),angle=Math.abs(p.x-135);
  const base=clamp(.34-(d-28)*.0035,.05,.34)*clamp(1.15-angle/60,.35,1)*this.h.T.finish;
  return Math.max(.2,Math.min(want,cap/Math.max(.01,base)));
 }
 /** A futsal flick over a defender lands within ~13 m of goal: close enough to volley it before it bounces. */
 private volleyRange(p:SimPlayer){return this.toGoal(p)<140&&Math.abs(p.x-135)<55;}
 private inRange(p:SimPlayer,max=70){return this.toGoal(p)<Math.min(max,this.h.T.shotRange*.75)&&Math.abs(p.x-135)<44;}
 private clearPlans(){this.plan=null;this.runs.clear();this.expect=null;this.pending=null;this.knock=null;this.shieldHold=null;this.roll=null;this.takeOn=null;this.rotation=null;this.finish=null;this.rebound=null;}

 // ---------------------------------------------------------------- per-step bookkeeping
 /** Called once per sim substep, after the ball logic. */
 step(_dt:number){
  const h=this.h,now=this.now;
  // Goals: credit the sequence whose finish produced it.
  const g=h.score.gold+h.score.blue;
  if(g!==this.goals){
   this.goals=g;const lf=this.lastFinish;
   if(lf&&h.lastFrom===lf.id&&now-lf.time<(lf.kind==='throughBall'?4:2.5)){
    const k=GOAL_KEY[lf.kind];
    this.counts[k]++;
    if(k==='reboundGoal')this.say('Rebound goal! Following up the save pays off','Follow in every shot: keepers parry, posts ricochet — the striker who gambles scores the rebound');
   }
   this.lastFinish=null;
  }
  if(h.restart||h.goalHold>0){
   if(this.plan?.kind!=='kickIn'||!h.restart){this.clearPlans();}
   if(h.restart&&h.restart!==this.restartSeen){this.restartSeen=h.restart;this.clearPlans();this.planKickIn();}
   this.kicks=h.kicks;this.frameSerial=h.frameContact.serial;this.returns=h.stats.combinationReturns;
   return;
  }
  // A shot off the post / bar: a live rebound, the nearest shirts race for it.
  if(h.frameContact.serial!==this.frameSerial){
   this.frameSerial=h.frameContact.serial;if(!comboSettings.off.rebound){
   this.rebound={team:h.possession,gk:null,until:now+1.4,pinUntil:0,winner:null};
   this.counts.reboundPost++;this.planRacers(h.possession,{x:h.ball.x+h.ball.vx*.3,y:h.ball.y+h.ball.vy*.3},null);}
  }
  // A launched ball: was it the pass a plan asked for? Shape it and arm the first-time finish.
  if(h.kicks!==this.kicks){
   this.kicks=h.kicks;const e=this.expect;
   // A first-time finish the strike did not decide as a goal must not go in by accident (the keeper is often
   // out of position after a cross or a parry): with the keeper still on the grass it is snatched wide; otherwise
   // a shot on target is placed where the keeper can reach it (a save), exactly as the sim's own misses are.
   const lf=this.lastFinish,rb=this.rebound;
   if(lf&&lf.time===now&&h.lastFrom===lf.id&&h.ballIsShot&&!h.shotIsGoal){
    const sp=Math.hypot(h.ball.vx,h.ball.vy),gy=h.lastKick.goalY,down=!!rb?.gk&&now<rb.pinUntil;
    const gk=this.keeperOf(h.players[lf.id].team==='gold'?'blue':'gold'),g=gk?h.players[gk]:null;
    let ax=h.lastKick.aimX;
    if(down){const side=Math.sign(h.ball.x-135)||1;ax=135+side*19*(1.3+this.rng()*.4);this.say('Snatched at it — wide!','Even with the keeper down, stay calm: pass it into the net');}
    else if(Math.abs(ax-135)<19&&g)ax=clamp(g.x+(this.rng()-.5)*4,135-17,135+17);
    if(ax!==h.lastKick.aimX){const L=Math.hypot(ax-h.ball.x,gy-h.ball.y)||1;h.ball.vx=(ax-h.ball.x)/L*sp;h.ball.vy=(gy-h.ball.y)/L*sp;h.lastKick.aimX=ax;if(down)h.lastKick.shotHeight=.45;}
    // From close range the strike's .16 s keep-out would carry the ball past the keeper before he may touch it.
    if(!down)h.ballFlight=Math.min(h.ballFlight,.02);
   }
   if(e&&h.lastFrom===e.from){
    if(h.ball.target===e.to){
     if(e.peak!==undefined&&h.ball.lofted){h.loftPeak=e.peak;h.lastKick.loft=e.peak;}
     if(e.run&&h.ball.lofted)this.leadCross(e.to,e.run);
     if(e.header!==undefined)h.headerBall=e.header;
     if(e.acro===true)h.acro={to:e.to};else if(e.acro===false)h.acro=null;
     if(e.finish)this.finish={to:e.to,kind:e.finish.kind,mult:e.finish.mult,until:now+2};
     if(e.count)this.counts[e.count]++;
     // A through ball has no first-time finish: the runner goes one-on-one, credited if he scores.
     if(e.count==='throughBall')this.lastFinish={kind:'throughBall',id:e.to,time:now};
     if(e.msg)this.say(e.msg,e.reason);
    }
    this.expect=null;
   }
  }
  if(this.expect&&now>this.expect.until)this.expect=null;
  // The wall's return in a one-two: the runner may finish it first time in the box.
  if(h.stats.combinationReturns!==this.returns){
   this.returns=h.stats.combinationReturns;const to=h.ball.target,p=to?h.players[to]:null;
   if(p&&p.team===h.possession&&h.depth(p.team,p.y)>200&&!comboSettings.off.oneTwo){
    this.counts.oneTwo++;
    if(this.inRange(p,62)){this.finish={to:p.id,kind:'oneTwo',mult:this.finishMult(p,1.15,.5),until:now+1.6};this.say('One-two!','Wall pass: give it, run past your marker, get it back in the space behind him');}
   }
  }
  // Futsal 3-1 rotation: when a pass-and-go runner leaves his spot, the nearest team-mate fills it.
  const comb=h.combination;
  if(comb&&comb!==this.lastComb&&this.futsal()&&!comboSettings.off.rotation){
   const r=h.players[comb.runner];let best:string|null=null,bd=60;
   for(const id of h.mates(comb.team)){const q=h.players[id];if(q.isGK||id===comb.runner||id===comb.wall||id===h.ball.owner)continue;const d=dist(q.x,q.y,r.x,r.y);if(d<bd){bd=d;best=id;}}
   if(best&&h.depth(comb.team,r.y)<260){this.rotation={id:best,x:r.x,y:r.y-h.dirY(comb.team)*6,until:now+1.4};this.counts.rotation++;}
  }
  this.lastComb=comb;
  if(this.rotation&&(now>this.rotation.until||h.possession!==h.players[this.rotation.id].team))this.rotation=null;
  if(this.roll&&(now>this.roll.until||h.ball.owner!==this.roll.id))this.roll=null;
  if(this.takeOn&&(now>this.takeOn.until||h.ball.owner!==this.takeOn.id))this.takeOn=null;
  // A skill whose ball contact has come: launch the flick over the defender (or lose it to him).
  if(this.shieldHold&&h.ball.owner!==this.shieldHold.id)this.shieldHold=null;
  const kn=this.knock;
  if(kn&&now>=kn.fireAt){this.knock=null;if(h.ball.owner===kn.id&&!h.windup)this.fireKnock(kn);}
  const ps=this.pending;
  if(ps&&now>=ps.fireAt){
   this.pending=null;
   if(h.ball.owner===ps.id&&!h.windup)this.fireLob(ps);
  }
  const pl=this.plan;
  if(pl&&(now>pl.until||h.possession!==pl.team)){this.plan=null;this.runs.clear();}
  if(this.finish&&now>this.finish.until)this.finish=null;
  const rb=this.rebound;
  if(rb&&(now>rb.until||(h.ball.owner&&h.players[h.ball.owner].team!==rb.team&&now>rb.pinUntil))){this.rebound=null;if(!this.plan)this.runs.clear();}
 }

 /** A cross is played into the runner's path (the near / far post), not to where he stands when it is struck:
  * aim at the point of his run he reaches as the ball drops, keeping the ball's pace, and re-time the flight. */
 private leadCross(to:string,spot:Pt){
  const h=this.h,r=h.players[to],b=h.ball,sp=Math.hypot(b.vx,b.vy);if(!r||sp<1)return;
  const run=dist(r.x,r.y,spot.x,spot.y)||1,speed=RUN_SPEED*ROLE_SPEED[r.role];
  let aim:Pt=spot;
  for(let i=0;i<3;i++){const D=dist(b.x,b.y,aim.x,aim.y),q=1-DRAG_AIR*D/sp,T=q>.05?-Math.log(q)/DRAG_AIR:.6,k=Math.min(1,speed*T*.95/run);aim={x:r.x+(spot.x-r.x)*k,y:r.y+(spot.y-r.y)*k};}
  const D=dist(b.x,b.y,aim.x,aim.y)||1,q=1-DRAG_AIR*D/sp;if(q<=.05)return;
  b.vx=(aim.x-b.x)/D*sp;b.vy=(aim.y-b.y)/D*sp;h.loftDur=Math.max(.3,-Math.log(q)/DRAG_AIR);h.lastKick.dur=h.loftDur;h.lastKick.goalY=aim.y;h.lastKick.aimX=aim.x;
  this.runs.set(to,aim);
 }

 // ---------------------------------------------------------------- on the ball
 /** A decision beat for the AI carrier. Returns true when a combination took the beat. */
 onBall(id:string,pressured:boolean,foeId:string|null,foeD:number):boolean{
  const h=this.h,o=h.players[id];
  if(o.isGK||id===h.userId||h.windup)return false;
  if(this.pending||this.knock)return (this.pending??this.knock)!.id===id;
  if(this.takeOn&&this.takeOn.id===id&&this.now<this.takeOn.contact)return true;
  const sh=this.shieldHold;
  if(sh){this.shieldHold=null;if(sh.id===id)return this.layOff(h.players[id],sh.mate,true);}
  const pl=this.plan;
  if(pl&&pl.team===o.team){
   if(pl.kind==='box'&&pl.carrier===id&&!pl.delivered)return this.deliver(pl,pressured);
   if(pl.kind==='kickIn'&&pl.taker===id)return this.kickInPass(pl);
  }
  const off=comboSettings.off;
  if(!off.skill&&this.trySkill(o,foeId,foeD))return true;
  if(!off.layOff&&this.tryLayOff(o,pressured))return true;
  if(!off.box&&this.tryBox(o,foeD))return true;
  if(!off.through&&this.tryThrough(o,foeD))return true;
  return false;
 }

 /** Futsal flick-up / rainbow over a close defender with space behind him, and the sole roll to shield. */
 private trySkill(o:SimPlayer,foeId:string|null,foeD:number){
  const h=this.h;if(!foeId||!this.ready('skill:'+o.team))return false;
  const f=h.players[foeId],fut=this.futsal(),sand=this.sand(),dir=h.dirY(o.team),speed=Math.hypot(o.vx,o.vy);
  if(h.depth(o.team,o.y)<(fut?120:170)||h.lastManRisk(o.id))return false;
  const ux=(f.x-o.x)/(foeD||1),uy=(f.y-o.y)/(foeD||1),ahead=uy*dir;
  // Beat him in the air: he is square in front and close, and nobody covers the space behind him.
  if(foeD>3&&foeD<9&&ahead>.6){
   const land={x:clamp(f.x+ux*2,20,250),y:clamp(f.y+dir*10,16,384)};
   let covered=false;for(const fid of h.foes(o.team)){if(fid===foeId)continue;const q=h.players[fid];if(dist(q.x,q.y,land.x,land.y)<(q.isGK?9:12)){covered=true;break;}}
   if(!covered&&this.rng()<(fut?.17:sand?.15:.012)*this.urgency(o.team)){
    // The rainbow only works on a flat-footed defender (skillMoves: "a defender who is standing still"); a lunging one gets the flick-up.
    const closing=((o.x-f.x)*f.vx+(o.y-f.y)*f.vy)/(foeD||1),flat=closing<14,rainbow=flat&&speed>24&&this.rng()<(fut?(comboSettings.futsalCreative?.45:.3):.25);
    this.startLob(o,f,rainbow?'rainbow':'flickUp',land);return true;
   }
  }
  // Futsal take-on: a close defender in the carrier's space. The carrier keeps the ball with a skill (stepover,
  // elastico, croqueta, scissors against a square defender; roulette, pull-back or Cruyff turn against one at his side),
  // standing over it until the touch and then going the way the move exits. Nothing is decided here: after the touch
  // the defender can still tackle him (the sim's own duel), exactly as after a sole roll.
  if(fut&&comboSettings.futsalCreative&&!comboSettings.off.takeOn&&foeD>3.5&&foeD<11&&ahead>-.3&&this.rng()<TAKE_ON_RATE*this.urgency(o.team))return this.startTakeOn(o,f,foeD,ahead);
  // Futsal sole roll: shield the ball under the sole and roll it across, away from the presser.
  if(fut&&foeD<9&&speed<40&&this.rng()<.2*this.urgency(o.team)){
   const side=(o.x-f.x)>=0?1:-1,lead=skillLead('soleRoll',h.windupScale);
   this.roll={id:o.id,until:this.now+.34,x:clamp(o.x+side*9,18,252),y:o.y-dir*1.5};
   h.protect=Math.max(h.protect,.3);h.passCd=Math.max(h.passCd,.32);h.carrying=false;
   this.emitSkill(o.id,'soleRoll',side as -1|1,lead);this.counts.soleRoll++;this.cool('skill:'+o.team,2.2);
   this.say('Sole roll','Futsal shielding: the sole rolls the ball across your body, away from the defender');
   return true;
  }
  return false;
 }
 private startTakeOn(o:SimPlayer,f:SimPlayer,foeD:number,ahead:number){
  const h=this.h,r=this.rng(),square=ahead>.55;
  let kind:SkillKind=square?(r<.3?'stepover':r<.52?'croqueta':r<.72?'elastico':r<.86?'scissors':'feint'):(r<.36?'roulette':r<.7?'dragBack':'cruyff');
  // In shooting range the feint is a fake shot (shape to shoot, the defender blocks, keep the ball).
  const gY=h.atkGoalY(o.team),tg=this.toGoal(o),btw=((f.x-o.x)*(135-o.x)+(f.y-o.y)*(gY-o.y))/((foeD||1)*(tg||1));
  if(tg<h.T.shotRange*1.15&&btw>.3&&(kind==='feint'||kind==='scissors'&&r>.8))kind='fakeShot';
  const m=SKILL_MOVE[kind]!,sp=Math.hypot(o.vx,o.vy),dirY=h.dirY(o.team);
  // Facing: his run, else up the pitch. rig +x in sim terms is (f.y, −f.x) (fieldRuntime: sim right ≠ rig side).
  const fx=sp>6?o.vx/sp:0,fy=sp>6?o.vy/sp:dirY,rx=fy,ry=-fx;
  // The side whose exit goes away from the defender.
  const end=skillBall(m,1,1,{x:0,y:0,z:0})||{x:0,y:0,z:1},fr=skillFrame(m,1,1),ex=end.x,lat=(f.x-o.x)*rx+(f.y-o.y)*ry;
  const side=(Math.abs(ex)<.05?(r<.5?1:-1):-Math.sign(lat||1)*Math.sign(ex)) as -1|1;
  const exl=Math.hypot(end.x*side,end.z)||1,ux=(end.x*side)/exl,uz=end.z/exl,len=9+Math.hypot(fr.x,fr.z)*4;
  const lead=skillLead(kind,h.windupScale);
  this.takeOn={id:o.id,contact:this.now+lead,until:this.now+lead+.35,hold:{x:o.x,y:o.y},exit:{x:clamp(o.x+(ux*rx+uz*fx)*len,18,252),y:clamp(o.y+(ux*ry+uz*fy)*len,14,386)}};
  h.protect=Math.max(h.protect,lead);h.passCd=Math.max(h.passCd,lead+.25);h.carrying=false;
  this.emitSkill(o.id,kind,side,lead);this.counts.takeOn++;this.counts[kind]++;this.cool('skill:'+o.team,2.6);
  if(this.ready('takeSay:'+o.team)){this.cool('takeSay:'+o.team,7);const [a,b]=TAKE_ON_TEXT[kind]??['Skill','Keep the ball with a skill'];this.say(a,b);}
  void foeD;return true;
 }
 private startLob(o:SimPlayer,f:SimPlayer,kind:'flickUp'|'rainbow',land:Pt){
  const h=this.h,lead=skillLead(kind,h.windupScale);
  const side=((f.x-o.x)*h.dirY(o.team)>=0?1:-1) as -1|1;
  // Air time: the rainbow's heel flick lands at 96 % of the move (skillMoves ball path); the flick-up is a short hop.
  // Rainbow air time from real gravity for its peak (over the defender's head), not from the pose tempo.
  const peak=kind==='rainbow'?2:1.15,dur=kind==='rainbow'?Math.sqrt(8*peak/9.81)*h.windupScale:.38;
  this.pending={id:o.id,kind,foe:f.id,fireAt:this.now+lead,land,peak,dur};
  h.protect=Math.max(h.protect,lead+.06);h.passCd=Math.max(h.passCd,lead+.12);
  this.emitSkill(o.id,kind,side,lead);this.cool('skill:'+o.team,kind==='rainbow'?14:5);
 }
 /** The flick leaves the boot: decided now from the duel (a lunging defender is easier to beat in the air). */
 private fireLob(ps:PendingSkill){
  const h=this.h,o=h.players[ps.id],f=h.players[ps.foe];
  const closing=Math.max(0,((o.x-f.x)*f.vx+(o.y-f.y)*f.vy)/(dist(o.x,o.y,f.x,f.y)||1));
  const pWin=clamp((ps.kind==='rainbow'?.44:.5)+.25*clamp(closing/60,0,1),.3,.8)*h.persona[o.team].carry*(1-h.fatigue*.3);
  const won=this.rng()<pWin,d=dist(o.x,o.y,ps.land.x,ps.land.y);
  h.launch(o.id,ps.land.x,ps.land.y,paceFor(d,ps.dur,DRAG_AIR),0,won?o.id:null,ps.peak);
  // The rainbow leaves from the heel (the skill's ball path at the flick contact), the flick-up from the grass.
  if(ps.kind==='rainbow'){const b=skillBall('rainbowFlick',SKILL_TIMING.rainbow.contact,1,{x:0,y:0,z:0});this.launchLift.kicks=h.kicks;this.launchLift.h=b?b.y-SKILL_BALL_RADIUS:0;}
  h.loftDur=ps.dur;h.lastKick.dur=ps.dur;h.passIntended=null;o.kick=0;
  if(!won)h.ball.intBy=f.id;
  this.counts[ps.kind]++;if(won)this.counts.skillBeaten++;
  // Futsal: a flick won in shooting range is volleyed before it lands (lane B's volley via the acrobatic finish).
  if(won&&ps.kind==='flickUp'&&(this.futsal()&&comboSettings.futsalCreative||this.sand())&&!comboSettings.off.flickVolley&&this.volleyRange(o)){
   h.acro={to:o.id};this.finish={to:o.id,kind:'flickVolley',mult:this.finishMult(o,1,.34),until:this.now+ps.dur+.6};
   this.say('Flick and volley!','Flick it over the defender and hit it before it bounces: the keeper has no time to set');return;}
  if(ps.kind==='rainbow')this.say(won?'Rainbow flick!':'Rainbow flick — read and blocked',won?'A showpiece: roll it up the back of the leg and flick it over the defender, then run round him':'Showboating costs the ball when the defender stays on his feet');
  else this.say(won?'Flick over the defender!':'Flick blocked',won?'Lift it over a lunging defender and collect behind him':'He stayed patient and blocked the flick');
 }
 private emitSkill(id:string,kind:SkillKind,side:-1|1,lead:number){
  const s=this.skill;s.serial++;s.id=id;s.kind=kind;s.side=side;s.start=this.now;s.contact=this.now+lead;
 }

 /** Hold-up play: a striker with his back to goal and a marker tight behind lays it off to a runner arriving to shoot. */
 private tryLayOff(o:SimPlayer,pressured:boolean){
  const h=this.h;if(o.role!=='fwd'||!pressured||h.hold>.9||!this.ready('lay:'+o.team))return false;
  const dir=h.dirY(o.team),fut=this.futsal();if(this.lineDist(o)>(fut?150:125))return false;
  const m=h.nearestFoe(o.id,o.x,o.y);if(!m||m.d>11||(m.p.y-o.y)*dir<=0)return false; // the marker is goal-side: back to goal
  let best:string|null=null,bs=-Infinity;
  for(const id of h.mates(o.team)){
   const q=h.players[id];if(q.isGK||id===o.id)continue;
   const behind=(o.y-q.y)*dir,d=dist(o.x,o.y,q.x,q.y);
   if(behind<6||d<12||d>44||this.open(id)<9||h.isOffside(o.team,q.y)||!this.laneClear(o,q,o.team))continue;
   if(this.toGoal(q)>h.T.shotRange*.8)continue;
   const s=this.open(id)-d*.3+(q.role==='mid'?6:0);if(s>bs){bs=s;best=id;}
  }
  if(!best||this.rng()>(fut?.55:.45)*this.urgency(o.team))return false;
  this.cool('lay:'+o.team,4);h.carrying=false;
  if(fut){
   // The pivô shields first: low, wide, arm out, ball on the far foot — then sets it for the runner.
   const shieldT=.5*h.windupScale/.48,side=((m.p.x-o.x)>=0?1:-1) as -1|1;
   this.shieldHold={id:o.id,mate:best,until:this.now+shieldT,hold:{x:o.x,y:o.y}};
   h.protect=Math.max(h.protect,shieldT+.1);h.passCd=Math.max(h.passCd,shieldT+skillLead('shield',0));
   this.emitSkill(o.id,'shield',side,skillLead('shield',h.windupScale));this.counts.shield++;
   this.say('Pivô holds it up','Futsal pivô: back to goal, body between the ball and the defender, waiting for a team-mate to arrive');
   return true;
  }
  return this.layOff(o,best,false);
 }
 private layOff(o:SimPlayer,best:string,pivot:boolean){
  const h=this.h,q=h.players[best];
  if(!q||h.isOffside(o.team,q.y)||!this.laneClear(o,q,o.team))return false;
  const arrive=this.goalPt(o.team,q.x+(135-q.x)*.25,Math.max(24,this.lineDist(q)-12));
  this.runs.clear();this.runs.set(best,arrive);this.plan={kind:'run',team:o.team,until:this.now+1.4};
  const kind:FinishKind=pivot?'pivotLayOff':'layOff';
  this.expect={from:o.id,to:best,until:this.now+1,finish:{kind,mult:this.finishMult(q,1.1,.42)},count:kind,msg:pivot?'Pivô lay-off':'Lay-off',reason:pivot?'The pivô holds the ball with his back to goal and sets it for a team-mate arriving to shoot':'Back to goal: the striker lays it off for a team-mate running onto it'};
  h.carrying=false;h.doPass(o.id,best,.82);
  return true;
 }

 /** From a wide area in the final third: set the box runs and drive to the byline before delivering. */
 private tryBox(o:SimPlayer,foeD:number){
  const h=this.h;if(this.futsal()||this.plan||!this.ready('box:'+o.team)||foeD<9)return false;
  const side=Math.sign(o.x-135)||1,ld=this.lineDist(o);
  if(Math.abs(o.x-135)<(this.h.goalVenue.id==='7v7'?44:50)||ld<12||ld>80)return false;
  const t=o.team,taken=new Set<string>([o.id]);
  const pick=(spot:Pt,roles:Role[])=>{let best:string|null=null,bd=Infinity;
   for(const id of h.mates(t)){const q=h.players[id];if(q.isGK||taken.has(id)||!roles.includes(q.role))continue;if(this.lineDist(q)>170)continue;const d=dist(q.x,q.y,spot.x,spot.y)-(q.role==='fwd'?12:0);if(d<bd){bd=d;best=id;}}
   if(best)taken.add(best);return best;};
  const nearSpot=this.goalPt(t,135+side*10,13),farSpot=this.goalPt(t,135-side*15,21),cutSpot=this.goalPt(t,135+side*14,38);
  const near=pick(nearSpot,['fwd','mid']),far=pick(farSpot,['fwd','mid']),cut=pick(cutSpot,['mid','fwd']);
  // Only when the runners can actually arrive in time (about a second of running).
  const reach=(id:string|null,spot:Pt,r:number)=>!!id&&dist(h.players[id].x,h.players[id].y,spot.x,spot.y)<r;
  if(!reach(near,nearSpot,85)||!reach(far,farSpot,90)){this.cool('box:'+o.team,1.5);return false;}
  if(this.rng()>this.tune.box*this.urgency(o.team)){this.cool('box:'+o.team,3);return false;}
  // The cut-back man only if he can arrive at the spot too.
  const cutter=reach(cut,cutSpot,95)?cut:null;if(cut&&!cutter)taken.delete(cut);
  // An overlap: a team-mate on the same flank behind the carrier bombs past him on the outside.
  let overlap:string|null=null;
  for(const id of h.mates(t)){const q=h.players[id];if(q.isGK||taken.has(id))continue;const behind=(o.y-q.y)*h.dirY(t);if(Math.sign(q.x-135)===side&&behind>4&&behind<55&&Math.abs(q.x-o.x)<50){overlap=id;break;}}
  this.runs.clear();
  this.plan={kind:'box',team:t,carrier:o.id,near,far,cut:cutter,overlap,side,start:this.now,until:this.now+2.6,delivered:false};
  this.runs.set(near!,nearSpot);this.runs.set(far!,farSpot);if(cutter)this.runs.set(cutter,cutSpot);
  if(overlap)this.runs.set(overlap,this.goalPt(t,135+side*112,Math.max(14,ld-30)));
  this.runs.set(o.id,this.goalPt(t,o.x+(Math.abs(o.x-135)>100?-side*6:0),Math.max(12,ld-34)));
  h.passCd=Math.max(h.passCd,.3+this.rng()*.2);h.carrying=false;
  this.counts.boxAttack++;this.cool('box:'+t,12);
  this.say(overlap?'Overlap on the wing':'Attack the box',overlap?'The full-back runs round the outside: two against one on the wing':'Runners attack the near post, the far post and the penalty spot before the cross comes in');
  return true;
 }
 private deliver(pl:BoxPlan,pressured:boolean){
  const h=this.h,o=h.players[pl.carrier],t=pl.team;
  const ok=(id:string|null)=>!!id&&!h.isOffside(t,h.players[id].y);
  type Opt={kind:'cutback'|'cutbackVolley'|'nearPost'|'farPost'|'overlap';to:string;score:number};
  const opts:Opt[]=[];
  // A cut-back: the crosser is deep (near the byline) and the arriving man is BEHIND him, 20-60 u out.
  let cutLead:Pt|undefined;
  if(ok(pl.cut)&&this.lineDist(o)<48){const c=h.players[pl.cut!],ld=this.lineDist(c),op=this.open(pl.cut!);if(ld>20&&ld<72&&ld>this.lineDist(o)+4&&op>7&&this.laneClear(o,c,t,5)){
   // Still arriving: play it into his path toward the penalty spot, so he meets it in stride.
   if(ld>46){const spot=this.goalPt(t,135+pl.side*14,38),dd=dist(c.x,c.y,spot.x,spot.y)||1,k=Math.min(1,16/dd);cutLead={x:c.x+(spot.x-c.x)*k,y:c.y+(spot.y-c.y)*k};}
   opts.push({kind:'cutback',to:pl.cut!,score:31+op});opts.push({kind:'cutbackVolley',to:pl.cut!,score:29+op});}}
  // Near / far post only once that runner is really arriving there (the cross is led into his last strides).
  const early=pressured?10:0,near=(id:string|null,d:number)=>{const q=h.players[id!],sp=this.runs.get(id!);return !!sp&&dist(q.x,q.y,sp.x,sp.y)<d+early;};
  if(ok(pl.near)&&near(pl.near,24)){const op=this.open(pl.near!);if(op>3.5)opts.push({kind:'nearPost',to:pl.near!,score:22+op*.9});}
  if(ok(pl.far)&&near(pl.far,30)){const op=this.open(pl.far!);if(op>4.5)opts.push({kind:'farPost',to:pl.far!,score:21+op});}
  if(ok(pl.overlap)&&!pressured){const v=h.players[pl.overlap!],op=this.open(pl.overlap!);if((v.y-o.y)*h.dirY(t)>6&&op>10&&this.laneClear(o,v,t))opts.push({kind:'overlap',to:pl.overlap!,score:18+op});}
  // Wait (driving on toward the byline) until a runner is in place, unless he is being closed down.
  const placed=(id:string|null,d:number)=>!!id&&this.lineDist(h.players[id])<d;
  const set=opts.some(q=>q.kind!=='overlap')&&(placed(pl.near,26)||placed(pl.far,32)||placed(pl.cut,50));
  if(!pressured&&this.now<pl.start+1.1&&this.lineDist(o)>16&&(!opts.length||!set)){h.passCd=Math.max(h.passCd,.2);return true;}
  if(!opts.length){pl.delivered=true;this.plan=null;this.runs.clear();return false;} // nothing on: the sim's own pick
  let best=opts[0];for(const q of opts){q.score+=this.rng()*14;if(q.score>best.score)best=q;}
  const to=best.to,r=h.players[to];pl.delivered=true;pl.until=this.now+1.8;
  switch(best.kind){
   case 'overlap':{
    // Slip the overlapping runner; he becomes the crosser with the same box runs.
    this.plan={...pl,carrier:to,overlap:null,delivered:false,start:this.now,until:this.now+2.2};this.runs.delete(to);
    this.runs.set(to,this.goalPt(t,135+pl.side*108,12));
    this.expect={from:o.id,to,until:this.now+1,count:'overlap'};h.doPass(o.id,to,1.1);break;
   }
   case 'cutback':
    this.expect={from:o.id,to,until:this.now+1,lead:cutLead,finish:{kind:'cutback',mult:this.finishMult(r,1.2,.46)},count:'cutback',msg:'Cut-back!',reason:'Cut-back: the defenders sprint toward their goal, so the pass goes BACK to the free player arriving at the penalty spot'};
    h.doPass(o.id,to,1.04);break;
   case 'cutbackVolley':
    this.expect={from:o.id,to,until:this.now+1,run:cutLead,peak:.95,header:false,acro:true,finish:{kind:'cutbackVolley',mult:this.finishMult(r,1,.4)},count:'cutbackVolley',msg:'Pull-back for a volley',reason:'A pulled-back cross at knee height: the arriving midfielder strikes it first time on the volley'};
    h.doLoft(o.id,to,'cross');break;
   case 'nearPost':
    this.expect={from:o.id,to,until:this.now+1,run:this.runs.get(to),peak:1.4,header:true,acro:true,finish:{kind:'nearPost',mult:this.finishMult(r,.95,.4)},count:'nearPost',msg:'Near-post cross',reason:'A low, fast cross to the near post: the striker gets in front of his marker and flicks it goalward'};
    h.doLoft(o.id,to,'cross');break;
   case 'farPost':
    this.expect={from:o.id,to,until:this.now+1,run:this.runs.get(to),peak:3,header:true,acro:false,finish:{kind:'farPost',mult:this.finishMult(r,.85,.34)},count:'farPost',msg:'Far-post header',reason:'A high cross over the defence to the far post: attack the ball, meet it at the top of your jump and head it DOWN'};
    h.doLoft(o.id,to,'cross');break;
  }
  return true;
 }

 /** A through ball into the space behind the last line for a runner level with it (onside). */
 private tryThrough(o:SimPlayer,foeD:number){
  const h=this.h,t=o.team;if(foeD<7||!this.ready('thru:'+t))return false;
  const dep=h.depth(t,o.y);if(dep<140||this.lineDist(o)<60)return false;
  // The last line: the deepest outfield defender (the offside line where offside applies).
  let line=0;for(const fid of h.foes(t)){const f=h.players[fid];if(!f.isGK)line=Math.max(line,h.depth(t,f.y));}
  if(h.useOffside)line=Math.max(line,h.offsideLine(t));
  const room=392-line;if(room<44)return false;
  const gk=this.keeperOf(t==='gold'?'blue':'gold'),g=gk?h.players[gk]:null;
  for(const id of h.mates(t)){
   const q=h.players[id];if(q.isGK||id===o.id||q.role==='def')continue;
   const qd=h.depth(t,q.y);if(qd<line-18||qd>line+1||h.isOffside(t,q.y))continue;
   const d=dist(o.x,o.y,q.x,q.y);if(d<28||d>150)continue;
   const into=Math.min(26,room-18),lead={x:clamp(q.x+(135-q.x)*.3,24,246),y:q.y+h.dirY(t)*(line-qd+into)};
   if(g&&dist(g.x,g.y,lead.x,lead.y)<24)continue;
   if(!this.laneClear(o,lead,t))continue;
   if(this.rng()>this.tune.thru*this.urgency(t)){this.cool('thru:'+t,2);return false;}
   this.runs.clear();this.runs.set(id,lead);this.plan={kind:'run',team:t,until:this.now+1.3};
   this.expect={from:o.id,to:id,until:this.now+1,lead,count:'throughBall',msg:'Through ball!',reason:'Through ball: played into the space BEHIND the back line, timed so the runner is onside when it is struck'};
   this.cool('thru:'+t,11);h.carrying=false;h.doPass(o.id,id,1.18);
   return true;
  }
  return false;
 }

 /** Futsal kick-in in the attacking half: a rehearsed blind-side run for a first-time shot. */
 private planKickIn(){
  const h=this.h,r=h.restart;if(!r||r.kind!=='kickin'||!(this.futsal()||this.sand())||comboSettings.off.kickIn)return;
  const tk=h.players[r.taker],t=tk.team;if(h.depth(t,r.y)<230||this.rng()>.5)return;
  let best:string|null=null,bd=Infinity;const spot=this.goalPt(t,135-Math.sign(r.x-135)*8,34);
  for(const id of h.mates(t)){const q=h.players[id];if(q.isGK||id===r.taker)continue;const d=dist(q.x,q.y,spot.x,spot.y);if(d<bd){bd=d;best=id;}}
  if(!best)return;
  this.plan={kind:'kickIn',team:t,taker:r.taker,runner:best,until:this.now+r.t+3};this.runs.set(best,spot);
 }
 private kickInPass(pl:KickInPlan){
  const h=this.h,r=h.players[pl.runner],o=h.players[pl.taker];
  this.plan=null;this.runs.clear();
  if(this.sand()){
   // Beach kick-in: lifted over the defenders to the runner, who meets it first time (volley or overhead kick).
   if(this.open(pl.runner)<5)return false;
   this.expect={from:pl.taker,to:pl.runner,until:this.now+1,peak:1.7,header:true,acro:true,finish:{kind:'kickIn',mult:this.finishMult(r,1.05,.38)},count:'kickIn',msg:'Kick-in chipped into the box',reason:'On sand you choose how to restart: this kick-in is lifted over the defenders for a first-time volley'};
   h.doLoft(pl.taker,pl.runner,'cross');return true;
  }
  if(!this.laneClear(o,r,pl.team,5)||this.open(pl.runner)<6)return false;
  this.expect={from:pl.taker,to:pl.runner,until:this.now+1,finish:{kind:'kickIn',mult:this.finishMult(r,1.1,.4)},count:'kickIn',msg:'Kick-in routine',reason:'A rehearsed futsal kick-in: the runner leaves his marker and arrives to shoot first time'};
  h.doPass(pl.taker,pl.runner,1.05);return true;
 }

 // ---------------------------------------------------------------- 1v1 skills (the sim's duel logic decided the win)
 /** The sim's carrier just won the duel and knocked the ball past an isolated defender (its own 1v1 roll). Show HOW
  * with a skill: the knock is held back until the pose's push contact (the carrier stands over the ball, protected,
  * while he sells it), then released exactly as the sim chose it. A drag-back / Cruyff turns away from the tackle. */
 onBeatMan(id:string,foe:string,side:number){
  const h=this.h,o=h.players[id];if(o.isGK||!h.players[foe]||comboSettings.off.beat||this.knock||this.pending)return;
  const fut=this.futsal(),r=this.rng(),nearLine=Math.abs(o.x-135)>95,dir=h.dirY(o.team);
  // Futsal, the creative game, uses the whole library; the grass formats keep the core moves.
  const creative=fut&&comboSettings.futsalCreative;
  let kind:SkillKind=fut&&!creative?(r<.3?'dragBack':r<.5?'croqueta':r<.68?'stepover':r<.84?'insideCut':'feint'):fut?(r<.2?'dragBack':r<.34?'croqueta':r<.48?'stepover':r<.62?'insideCut':r<.7?'elastico':r<.78?'roulette':r<.84?'cruyff':'feint'):nearLine&&r<.3?'cruyff':r<.45?'stepover':r<.62?'feint':r<.8?'insideCut':'dragBack';
  // Context picks the version of the move that fits (no extra roll, so the combos' random stream is unchanged): half
  // the cuts are taken with the outside of the foot, a feint in shooting range with the defender between him and goal
  // becomes a fake shot, and a stepover against a close defender squarely in the way becomes a nutmeg (1v1 distances
  // here are 7.5–12 u; "close" is the nearer half).
  const f=h.players[foe],fd=dist(o.x,o.y,f.x,f.y),goalY=h.atkGoalY(o.team),toGoal=this.toGoal(o);
  const between=((f.x-o.x)*(135-o.x)+(f.y-o.y)*(goalY-o.y))/((fd||1)*(toGoal||1));
  if(kind==='insideCut'&&r>=(creative?.55:fut?.76:.71))kind='outsideCut';
  else if(kind==='feint'&&(!fut||creative)&&toGoal<h.T.shotRange*(creative?1.15:1)&&Math.abs(o.x-135)<50&&between>.5)kind='fakeShot';
  else if((kind==='stepover'||creative&&kind==='croqueta')&&fd<(creative?10.5:9.5)&&between>(creative?.6:.7)&&r<(fut?.6:.38))kind='nutmeg';
  const lead=skillLead(kind,h.windupScale);let sd=(side>=0?1:-1) as -1|1;
  // Match the pose's exit to the sim's knock: the knock's side of his run in rig terms (rig +x = (vy, −vx) in the
  // sim), and whether the move exits toward the other foot (stepover, feint, cuts inside) or the active one.
  const sp=Math.hypot(o.vx,o.vy);
  if(sp>6&&kind!=='dragBack'&&kind!=='cruyff'){const lat=h.touchX*o.vy/sp-h.touchY*o.vx/sp,exitActive=kind==='outsideCut'||kind==='roulette';if(Math.abs(lat)>.5)sd=(Math.sign(lat)*(exitActive?1:-1)) as -1|1;}
  // The sim's knock (touchX/Y) — turned away from the tackle for the drag-back and the Cruyff turn.
  let tx=h.touchX,ty=h.touchY;
  if(kind==='dragBack'||kind==='cruyff'){tx=sd*6;ty=-dir*3;}
  this.knock={id,fireAt:this.now+lead,lead,tx,ty,foot:h.recv.foot,hold:{x:o.x,y:o.y}};
  h.trapT=0;h.recv.id=null;h.recv.t=0; // not yet: the touch comes at the pose's contact
  // While he sells it the defender may still read it and tackle (the sim's own roll): the .3 s of protection the
  // knock buys starts at the touch, as it did before the skill existed, so dribblers gain no free time.
  h.protect=Math.min(h.protect,.15);h.passCd=Math.max(h.passCd,lead+.42);
  this.emitSkill(id,kind,sd,lead);
  this.counts[kind]++;
  if(this.ready('skillSay:'+o.team)){
   this.cool('skillSay:'+o.team,6);
   const text:Record<string,[string,string]>={insideCut:['Inside cut','Hook it across your body with the inside of the foot: a sharp change of direction'],outsideCut:['Outside cut','Push it away with the outside of the foot and burst past him'],fakeShot:['Fake shot','Shape to shoot and stop over the ball: he blocks nothing, then cut it inside'],nutmeg:['Nutmeg!','His feet were apart: through the legs, then run round him to collect it'],stepover:['Stepover','Step OVER the ball to sell a move one way, then push it the other'],feint:['Body feint','Drop the shoulder: the defender leans, you go the other way (Stanley Matthews)'],dragBack:['Drag-back','Sole on top, pull it back: the tackle hits nothing (Puskás, Wembley 1953)'],cruyff:['Cruyff turn','Fake the cross, drag it behind the standing leg and turn (Johan Cruyff, 1974)'],croqueta:['La Croqueta','Inside of one foot to the inside of the other, right past the tackle (Laudrup, Iniesta)'],elastico:['Elastico','Out, then back in with the same foot, past him (Rivelino)'],roulette:['Roulette','Spin round the ball with your body shielding it, and away (Zidane, Maradona)'],scissors:['Scissors','Round the front of the ball, then out the other way']};
   const [a,b]=text[kind]??['Skill','Beat your man with a skill'];this.say(a,b);
  }
 }
 private fireKnock(k:PendingKnock){
  const h=this.h,dur=.22,kl=Math.hypot(k.tx,k.ty)||1;
  h.trapDur=h.trapT=dur;h.trapVX=0;h.trapVY=0;h.touchX=k.tx;h.touchY=k.ty;
  h.recv.id=k.id;h.recv.t=h.recv.dur=dur;h.recv.foot=k.foot;h.recv.faceX=k.tx/kl;h.recv.faceY=k.ty/kl;
  h.protect=Math.max(h.protect,.3);h.passCd=Math.max(h.passCd,.42);
 }

 // ---------------------------------------------------------------- rebounds
 /** A keeper just parried a shot (the sim already set a wide parry). Some parries drop into the danger zone. */
 onParry(gk:string,outcome:string){
  const h=this.h;if(outcome==='tip'||comboSettings.off.rebound)return;
  const g=h.players[gk],att:Team=g.team==='gold'?'blue':'gold',now=this.now;
  const pin=.85*h.windupScale;
  if(this.rng()>this.tune.danger*this.urgency(att)){
   // Pushed wide: still a loose ball, keeper on the grass for a moment, shirts converge.
   this.rebound={team:att,gk,until:now+1,pinUntil:now+pin,winner:null};
   this.planRacers(att,{x:h.ball.x+h.ball.vx*.35,y:h.ball.y+h.ball.vy*.35},null);return;
  }
  const side=Math.sign(h.ball.x-135)||(this.rng()<.5?-1:1),into=Math.sign(200-h.ownGoalY(g.team));
  const land={x:135+side*(5+this.rng()*22),y:h.ownGoalY(g.team)+into*(11+this.rng()*17)};
  // Who gets there first? Strikers gamble on rebounds (a head start), defenders ball-watch.
  let ta=Infinity,td=Infinity,bestA:string|null=null,bestD:string|null=null;
  for(const id of h.ids){const q=h.players[id];if(q.isGK)continue;const tt=.1+dist(q.x,q.y,land.x,land.y)/(RUN_SPEED*ROLE_SPEED[q.role])+(q.team===att?-.06:.04);
   if(q.team===att){if(tt<ta){ta=tt;bestA=id;}}else if(tt<td){td=tt;bestD=id;}}
  const pA=clamp(.45+(td-ta)*2.2,.1,.72),r=this.rng();
  const winner=bestA&&r<pA?bestA:bestD&&td<.95?bestD:null;
  const winT=winner===bestA?ta:td;
  // How it comes off the keeper: along the ground, a bouncing ball at knee height, or looping up for a header.
  const k=this.rng(),kind:FinishKind=k<.5?'rebound':k<.78?'reboundVolley':'reboundHeader';
  const peak=kind==='rebound'?0:kind==='reboundVolley'?1:2.1;
  const Tf=clamp(Number.isFinite(winT)?winT:.45,.28,.6),d=dist(h.ball.x,h.ball.y,land.x,land.y);
  const pace=paceFor(d,Tf,peak>0?DRAG_AIR:(h.groundFriction??DRAG_GROUND));
  h.ball.vx=(land.x-h.ball.x)/(d||1)*pace;h.ball.vy=(land.y-h.ball.y)/(d||1)*pace;
  h.ball.target=winner;h.ball.intBy=null;h.passIntended=null;h.acro=null;h.headerBall=false;
  if(peak>0){h.ball.lofted=true;h.loftPeak=peak;h.loftT=0;h.loftDur=Tf;h.headerBall=kind==='reboundHeader';if(kind==='reboundVolley'&&winner===bestA)h.acro={to:winner!};}
  else{h.ball.lofted=false;h.loftDur=0;h.ball.height=.2;}
  h.kicks++;this.launchLift.kicks=h.kicks;this.launchLift.h=NaN;const lk=h.lastKick;lk.height=0;lk.loft=peak;lk.dur=peak>0?Tf:0;lk.shotHeight=0;lk.fromY=h.ball.y;lk.goalY=land.y;lk.aimX=land.x;
  this.rebound={team:att,gk,until:now+Tf+1,pinUntil:now+pin,winner};
  this.counts.rebound++;
  if(winner&&winner===bestA){const p=h.players[winner];this.finish={to:winner,kind,mult:this.finishMult(p,kind==='rebound'?2.2:kind==='reboundVolley'?1.6:1.4,kind==='rebound'?.5:.38),until:now+Tf+.8};}
  this.say('Parried — rebound!','The keeper can only push it out: first to the second ball wins');
  this.planRacers(att,land,winner);
 }
 /** The second-nearest attacker crashes the far side of the loose ball; a defender covers the goal line. */
 private planRacers(att:Team,spot:Pt,winner:string|null){
  const h=this.h;this.runs.clear();
  const def:Team=att==='gold'?'blue':'gold',gy=h.atkGoalY(att);
  const near=(t:Team)=>h.mates(t).filter(id=>!h.players[id].isGK&&id!==winner&&id!==h.ball.target).sort((a,b)=>dist(h.players[a].x,h.players[a].y,spot.x,spot.y)-dist(h.players[b].x,h.players[b].y,spot.x,spot.y));
  const a=near(att),d=near(def);
  if(a[0])this.runs.set(a[0],{x:clamp(spot.x+(135-spot.x)*.8+(spot.x<135?14:-14),20,250),y:spot.y});
  if(a[1])this.runs.set(a[1],{x:clamp(270-spot.x,40,230),y:spot.y+(spot.y<200?14:-14)});
  if(d[0])this.runs.set(d[0],{x:spot.x,y:spot.y});
  if(d[1])this.runs.set(d[1],{x:clamp(135+(spot.x-135)*.3,120,150),y:gy+(gy<200?4:-4)});
  if(!this.plan)this.plan={kind:'run',team:att,until:this.now+1.2};
 }

 // ---------------------------------------------------------------- hooks the sim reads
 /** A movement target that overrides the sim's shape for this player this frame (runs, rolls, rebounds). */
 runTarget(id:string):Pt|null{
  const h=this.h;if(id===h.userId||h.goalHold>0)return null;
  const r=this.roll;if(r&&r.id===id)return {x:r.x,y:r.y};
  const tk=this.takeOn;if(tk&&tk.id===id)return this.now<tk.contact?{x:tk.hold.x,y:tk.hold.y}:{x:tk.exit.x,y:tk.exit.y};
  // Over the ball during a skill's build-up: the pose owns the feet until the decisive touch.
  const pk=this.knock??this.shieldHold,pl0=this.pending;
  if(pk&&pk.id===id)return {x:pk.hold.x,y:pk.hold.y};
  if(pl0&&pl0.id===id&&id===h.ball.owner){const o=h.players[id];return {x:o.x,y:o.y+h.dirY(o.team)*.5};}
  if(h.restart){const pl=this.plan;if(pl?.kind==='kickIn'&&pl.runner===id){const s=this.runs.get(id);return s?{x:s.x,y:s.y}:null;}return null;}
  const s=this.runs.get(id);if(s&&(this.plan||this.rebound))return {x:clamp(s.x,14,256),y:clamp(s.y,12,388)};
  const ro=this.rotation;if(ro&&ro.id===id&&id!==h.ball.owner)return {x:ro.x,y:ro.y};
  return null;
 }
 /** A through ball / planned pass is played into the runner's path, not to his feet. */
 passLead(from:string,to:string):Pt|null{
  const e=this.expect;if(!e||!e.lead||e.from!==from||e.to!==to)return null;
  return this.h.isOffside(this.h.players[to].team,this.h.players[to].y)?null:e.lead;
 }
 /** Called when a player claims the ball: > 0 = strike it first time with this xG multiplier. */
 finishOnClaim(id:string,via:string):number{
  const h=this.h,p=h.players[id],now=this.now;if(p.isGK||id===h.userId)return 0;
  const f=this.finish;
  if(f&&f.to===id&&now<=f.until&&(via==='recv'||via==='loose')){
   this.finish=null;if(f.kind==='flickVolley'?!this.volleyRange(p):!this.inRange(p,f.kind.startsWith('rebound')?80:70))return 0;
   let mult=f.mult;
   // The rebound is easiest while the keeper is still down.
   if(f.kind.startsWith('rebound')&&this.rebound&&now>this.rebound.pinUntil)mult=Math.min(mult,this.finishMult(p,1.2,.36));
   this.lastFinish={kind:f.kind,id,time:now};
   const shot=SHOT_KEY[f.kind];if(shot)this.counts[shot]++;
   return mult*this.finishScale(p.team);
  }
  const r=this.rebound;
  if(r&&now<r.until&&via==='loose'&&p.team===r.team&&this.inRange(p,60)){
   this.rebound=null;this.lastFinish={kind:'reboundPost',id,time:now};this.counts.reboundShot++;
   return this.finishMult(p,r.gk&&now<r.pinUntil?1.6:1.15,.4)*this.finishScale(p.team);
  }
  return 0;
 }
 /** A keeper who parried at full stretch is still on the grass (no steering) until he can get up. */
 pinned(id:string):boolean{
  const r=this.rebound;if(!r||r.gk!==id||this.now>=r.pinUntil)return false;
  // A follow-up that the sim did not decide as a goal: he scrambles up and gets across.
  return !(this.h.ballIsShot&&!this.h.shotIsGoal);
 }
}

// ------------------------------------------------------------------ view layer (render only)
/** Poses the rig already knows for skills that are not in skillMoves.ts (lane B's signature moves). */
const RIG_MOVE:Partial<Record<SkillKind,SignatureMove>>={soleRoll:'soleRoll',flickUp:'flickUp'};
const tmpFrame={x:0,z:0,heading:0},tmpBall={x:0,y:0,z:0};
/** A pose on one player. Sim skills run on the combos' clock (`kind`); the view's own picks (a shot, a keeper's
 *  distribution, a tackle, a celebration) warp their build-up so the decisive contact lands on the sim's release:
 *  progress runs p0 → pc from `start` to `tc`, then at the live tempo (`sec`) until `end`. */
type Active={kind:SkillKind|null;type:SkillMove;rig?:SignatureMove;start:number;side:-1|1;yaw:number|null;sec:number;end:number;
 tc?:number;p0?:number;pc?:number;noBall?:boolean;faceTravel?:boolean;windup?:object|null;
 move:{kind:SignatureMove;progress:number;side:-1|1;height:number};skill:SkillMotion};
/** Which view picks are shown and how often (tests + balance report; nothing here touches the sim). */
export const VIEW_MOVES=['chipShot','finesseShot','trivela','toePoke','knuckleball','keeperThrow','keeperRoll','keeperPunt','blockTackle','pokeTackle','thankPasser','airplane','kneeSlide','backHeel'] as const;
/** Teaching lines for how a shot was struck (the view announces them through the combos feed). */
const SHOT_TEXT:Record<ShotStyle,[string,string]>={toePoke:['Toe poke!','No back-lift: in a crowded box a quick poke beats the block before the keeper is set'],chipShot:['Chip over the keeper!','The keeper came off the line, so stab under the ball and float it over'],
 knuckleball:['Knuckleball','Laces through the middle, no spin: it wobbles and dips, so the keeper cannot read it'],finesseShot:['Curled to the far post','Wrap the inside of your foot round the ball: aim outside the post and let it bend in'],trivela:['Trivela!','Outside of the foot from the angle: the ball swerves away from the keeper']};
export type ViewMove=typeof VIEW_MOVES[number];
/** The ball leaves the keeper's hands at this progress (skillMoves' authored hand path). */
export const KEEPER_RELEASE:Record<'keeperThrow'|'keeperRoll'|'keeperPunt',number>={keeperThrow:.5,keeperRoll:.46,keeperPunt:.42};
const hash=(a:string,b:number)=>{let h=(b|0)^0x5bd1e995;for(let i=0;i<a.length;i++)h=Math.imul(h^a.charCodeAt(i),16777619);h^=h>>>13;h=Math.imul(h,0x5bd1e995);return ((h^(h>>>15))>>>0)%1000/1000;};
/** How a shot is struck, from what the shooter sees (sim units: 270 × 400 pitch, goal at x 135), only some of the time
 *  (`roll`) so ordinary strikes stay the norm. Rates were set from the shot contexts of 8 real matches per format:
 *  - chip: through on the keeper (within 40 u) who has come off his line;
 *  - toe poke: close in with a defender about to block (the futsal finish);
 *  - knuckleball: a long shot from straight on (long shots are common in futsal and 7v7, so rarer there);
 *  - trivela / curl: from an angle, the curl to the far post also from the edge of the box. */
export type ShotStyle='chipShot'|'finesseShot'|'trivela'|'toePoke'|'knuckleball';
export function shotStyle(o:{x:number;y:number},goalY:number,keeper:{x:number;y:number}|null,nearestFoe:number,roll:number,format:string):ShotStyle|null{
 const toGoal=Math.hypot(o.x-135,o.y-goalY),wide=Math.abs(o.x-135),off=keeper?Math.abs(keeper.y-goalY):0,futsal=format==='futsal',small=futsal||format==='7v7';
 // Futsal, the creative game (a court of ~20 × 40 m: 10 u ≈ 1 m): the full finishing kit, most of the time. The toe poke is
 // the classic futsal finish close in; the keeper plays high, so a chip; from distance a knuckleball; from an angle an
 // outside-foot trivela or a curl to the far post.
 if(futsal&&comboSettings.futsalCreative){
  if(keeper&&off>8&&Math.hypot(o.x-keeper.x,o.y-keeper.y)<45&&wide<45)return roll<.5?'chipShot':null;
  if(toGoal<70&&(nearestFoe<10||toGoal<50))return roll<.75?'toePoke':null;
  if(toGoal>125&&wide<35)return roll<.14?'knuckleball':roll<.24?'toePoke':null;
  if(wide>25)return roll<.22?'trivela':roll<.5?'finesseShot':null;
  if(toGoal>=70)return roll<.28?'finesseShot':roll<.4?'toePoke':null;
  return null;
 }
 if(keeper&&off>11&&Math.hypot(o.x-keeper.x,o.y-keeper.y)<40&&wide<40)return roll<.4?'chipShot':null;
 if(toGoal<(futsal?55:42)&&nearestFoe<8)return roll<(futsal?.8:.5)?'toePoke':null;
 if(toGoal>(futsal?120:small?105:85)&&wide<30)return roll<(small?.055:.15)?'knuckleball':null;
 if(wide>26&&toGoal<80)return roll<.12?'trivela':roll<.3?'finesseShot':null;
 if(wide>12&&toGoal>35&&toGoal<85)return roll<.15?'finesseShot':null;
 return null;
}
/** A keeper's distribution: a short pass is rolled out, a longer one thrown overarm, a clearance punted (9v9 and
 *  11v11 only: US Youth Soccer 7v7 bans punts, and futsal keepers throw). */
export function keeperStyle(kind:'pass'|'loft'|'shot'|'clear',distance:number,format:string):'keeperThrow'|'keeperRoll'|'keeperPunt'{
 if(kind==='loft'||kind==='clear')return format==='9v9'||format==='11v11'?'keeperPunt':'keeperThrow';
 return distance<(format==='futsal'?55:70)?'keeperRoll':'keeperThrow';
}
/** Per live match: turns the sim's combo skill events into timed rig poses (call `apply` after choreo.apply). */
export function createComboView(/** The venue's turn (see createChoreo): the skill yaws below are computed in the pitch's own frame. */venueYaw=0){
 let clock=0,seen=0,touchSeen=-1,lastWindup:object|null=null,lastOwner:string|null=null,styleKick=-1,styleType:ViewMove|null=null,sayNext=0,keeperSayNext=0;
 const active=new Map<string,Active>(),passFrom=new Map<string,{from:string;time:number}>();
 const counts=Object.fromEntries(VIEW_MOVES.map(k=>[k,0])) as Record<ViewMove,number>;
 const progressOf=(a:Active)=>a.tc===undefined?(clock-a.start)/a.sec:clock<a.tc?a.p0!+(a.pc!-a.p0!)*Math.max(0,(clock-a.start)/Math.max(1e-6,a.tc-a.start)):a.pc!+(clock-a.tc)/a.sec;
 const make=(type:SkillMove,side:-1|1,start:number,sec:number,end:number,extra:Partial<Active>={}):Active=>({kind:null,type,start,side,yaw:null,sec,end,move:{kind:'soleRoll',progress:0,side,height:0},skill:{type,progress:0,side},...extra});
 /** A view pick with its contact on the sim's release, `lead` real seconds from now. */
 const timed=(id:string,type:SkillMove,side:-1|1,lead:number,pc:number,extra:Partial<Active>={})=>{
  // Played through the follow-through and half the recovery, so the body eases back instead of snapping upright.
  const spec=SKILL_MOVES[type],end=spec.phases[2]+(1-spec.phases[2])*.5;active.set(id,make(type,side,clock,spec.seconds*.8,end,{tc:clock+Math.max(.05,lead),p0:0,pc,...extra}));
  if((VIEW_MOVES as readonly string[]).includes(type))counts[type as ViewMove]++;
 };
 return {
  counts,
  consume(sim:MatchSim,realDt:number){
   clock+=Math.max(0,realDt);
   const rate=sim.windupScale>0?sim.windupScale:1,v=sim.venue,sx=v.width/250,sz=v.length/380,futsal=v.id==='futsal';
   const c=sim.combos;
   if(c){const s=c.skill;
    if(s.serial!==seen){
     seen=s.serial;const t=SKILL_TIMING[s.kind];
     // Start so the pose's decisive ball contact lands on the sim's touch.
     const start=clock+(s.contact-sim.stats.time)/rate-t.contact*t.seconds,m=SKILL_MOVE[s.kind];
     const a=make(m??'dragBack',s.side,start,t.seconds,1,{kind:s.kind,rig:m?undefined:RIG_MOVE[s.kind]??'soleRoll'});a.move.kind=a.rig??'soleRoll';active.set(s.id,a);
    }
   }
   const P=sim.players,keeperOf=(team:string)=>{for(const id of sim.ids)if(P[id].isGK&&P[id].team===team)return P[id];return null;};
   const attackY=(team:string)=>{const g=keeperOf(team);return g&&g.y<200?392:8;};
   // Passes: who fed each player last (a goal from a team-mate's pass is celebrated by thanking him).
   const owner=sim.ball.owner;
   if(owner!==lastOwner){if(owner&&lastOwner&&P[owner]&&P[lastOwner]&&P[owner].team===P[lastOwner].team)passFrom.set(owner,{from:lastOwner,time:clock});if(owner)lastOwner=owner;}
   // A new wind-up: a shot struck in the style the moment calls for, or the keeper's distribution.
   const w=sim.kickWindup;
   if(w&&w!==lastWindup){
    lastWindup=w;const o=P[w.id],cur=active.get(w.id);
    if(o&&(!cur||progressOf(cur)>=cur.end)){
     const lead=w.t/rate,yaw=Math.atan2((w.tx-o.x)*sx,(w.ty-o.y)*sz)+venueYaw;
     if(o.isGK){
      const type=keeperStyle(w.kind,Math.hypot(w.tx-o.x,w.ty-o.y),v.id);
      timed(w.id,type,hash(w.id,sim.kicks)<.5?1:-1,lead,KEEPER_RELEASE[type],{yaw,windup:w});
      if(futsal&&c&&clock>=keeperSayNext){c.announce(type==='keeperRoll'?'Roll-out':'Goalkeeper throw','Futsal goalkeepers restart with their hands: roll it to feet, or throw it long to switch play');keeperSayNext=clock+40;}
     }else if(futsal&&comboSettings.futsalCreative&&w.kind==='pass'&&w.to&&P[w.to]&&c?.skill.id===w.id&&c.skill.kind==='shield'&&(P[w.to].y-o.y)*(attackY(o.team)-o.y)<0){
      // The pivô's lay-off to a team-mate behind him after holding it up: a back heel (lane B), its flick on the release.
      const q=P[w.to],dx=(q.x-o.x)*sx,dz=(q.y-o.y)*sz,face=Math.atan2(-dx,-dz),lat=dx*Math.cos(face)-dz*Math.sin(face);
      const a=make('dragBack',lat>=0?1:-1,clock,MOVE_SECONDS.backHeel,1,{rig:'backHeel',tc:clock+Math.max(.05,lead),p0:0,pc:MOVE_CONTACT.backHeel,yaw:face+venueYaw,noBall:true,windup:w});a.move.kind='backHeel';active.set(w.id,a);counts.backHeel++;
      if(clock>=sayNext){c.announce('Back heel lay-off','The pivô holds it with his back to goal and flicks it behind him to the runner');sayNext=clock+6;}
     }else if(w.kind==='shot'){
      const goalY=attackY(o.team),g=keeperOf(o.team==='gold'?'blue':'gold');
      let near=99;for(const id of sim.ids){const q=P[id];if(q.team!==o.team&&!q.isGK)near=Math.min(near,Math.hypot(q.x-o.x,q.y-o.y));}
      const type=shotStyle(o,goalY,g,near,hash(w.id,sim.kicks*7+1),v.id);
      if(type){timed(w.id,type,hash(w.id,sim.kicks*3)<.5?1:-1,lead,SKILL_MOVES[type].contacts[0].p,{yaw,windup:w});styleKick=sim.kicks+1;styleType=type;
       // The teaching line (at most one every few seconds, so it reads and never spams).
       if(c&&clock>=sayNext){const line=SHOT_TEXT[type];if(line){c.announce(line[0],line[1]);sayNext=clock+6;}}}
     }
    }
   }
   if(!w)lastWindup=null;
   // Robbed mid wind-up: the pose stops (no ghost strike).
   for(const [id,a] of active)if(a.windup&&a.tc!==undefined&&clock<a.tc&&sim.kickWindup!==a.windup&&sim.ball.owner!==id)active.delete(id);
   // Touch events: a standing tackle is a block (front-on) or a poke (from the side); the scorer celebrates.
   const ring=sim.touches,latest=sim.touchSerial;
   if(touchSeen<0)touchSeen=latest;
   for(let serial=Math.max(touchSeen+1,latest-ring.length+1);serial<=latest;serial++){
    const ev=ring[(serial-1)%ring.length];if(ev.serial!==serial)continue;
    const p=P[ev.id];if(!p)continue;
    if(ev.kind==='tackle'&&!p.isGK&&ev.speed<25&&ev.other&&P[ev.other]){
     const q=P[ev.other],dx=q.x-p.x,dy=q.y-p.y,qs=Math.hypot(q.vx,q.vy)||1,front=-(dx*q.vx+dy*q.vy)/((Math.hypot(dx,dy)||1)*qs);
     const type:SkillMove=front>.3?'blockTackle':'pokeTackle',spec=SKILL_MOVES[type],pc=spec.contacts[0].p;
     const yaw=Math.atan2(dx*sx,dy*sz)+venueYaw;
     timed(ev.id,type,hash(ev.id,serial)<.5?1:-1,.1,pc,{yaw,noBall:true,p0:pc*.5});
    }else if(ev.kind==='goal'){
     const pf=passFrom.get(ev.id),mate=pf&&clock-pf.time<8&&P[pf.from]?P[pf.from]:null,r=hash(ev.id,sim.score.gold*31+sim.score.blue);
     const type:SkillMove=mate?'thankPasser':r<.6?'airplane':'kneeSlide',spec=SKILL_MOVES[type];
     const a=make(type,1,clock+.15,spec.seconds,1,{noBall:true,faceTravel:type!=='thankPasser'});
     if(type==='thankPasser'&&mate)a.yaw=Math.atan2((mate.x-p.x)*sx,(mate.y-p.y)*sz)+venueYaw-skillFrame(type,1,1,tmpFrame).heading;
     active.set(ev.id,a);counts[type as ViewMove]++;
    }
   }
   touchSeen=latest;
  },
  /** Writes `motion.skill` (skill-moves lane) or lane B's `motion.move` for this player; `yaw` is his current heading. */
  apply(id:string,motion:PlayerMotion,yaw=0){
   const a=active.get(id);
   if(!a){motion.skill=undefined;return;}
   const p=progressOf(a);
   if(p>=a.end){active.delete(id);motion.skill=undefined;return;}
   if(p<0)return;
   if(!a.rig){
    // Hold the heading the move started in; the move's own heading curve turns him (Cruyff, drag-back).
    if(a.yaw===null)a.yaw=yaw;
    a.skill.progress=Math.min(1,p);motion.skill=a.skill;
    if(!a.faceTravel){skillFrame(a.type,p,a.side,tmpFrame);motion.facing=a.yaw+tmpFrame.heading;motion.turnSmoothing=30;}
    motion.kick=undefined;motion.receive=undefined;
   }else if(!motion.move){a.move.progress=p;motion.move=a.move;motion.kick=undefined;if(a.yaw!==null&&a.windup){motion.facing=a.yaw;motion.turnSmoothing=30;}}
  },
  /** The ball at the carrier's boot (or in the keeper's hands) follows the skill's authored path (its contacts are
   *  pinned to the boots), relative to where the rig stands; it hands back to the sim through the recovery phase. */
  ball(id:string|null,out:{x:number;y:number;z:number},root:{x:number;z:number},scale=1,/** Ball centre height on the grass in `out`'s space. */base=.19){
   const a=id?active.get(id):undefined;if(!a||a.rig||a.noBall||a.yaw===null||!SKILL_MOVES[a.type].ball)return;
   const p=progressOf(a);if(p<0||p>=a.end)return;
   const b=skillBall(a.type,p,a.side,tmpBall);if(!b)return;
   skillFrame(a.type,p,a.side,tmpFrame);
   const lx=(b.x-tmpFrame.x)*scale,lz=(b.z-tmpFrame.z)*scale,c=Math.cos(a.yaw),s=Math.sin(a.yaw);
   const rec=SKILL_MOVES[a.type].phases[2],w=p<=rec?1:1-(p-rec)/(1-rec),blend=a.tc!==undefined?Math.min(1,(clock-a.start)/.12):1,k=w*w*(3-2*w)*blend*blend*(3-2*blend);
   out.x+=(root.x+lx*c+lz*s-out.x)*k;out.z+=(root.z-lx*s+lz*c-out.z)*k;out.y+=(base+(b.y-.19)*scale-out.y)*k;
  },
  /** The strike style of kick serial `kicks` when the view chose one (render arcs in liveBallPhysics: chip, knuckleball). */
  kickStyle(kicks:number):ViewMove|null{return kicks===styleKick?styleType:null;},
  /** True while this keeper's distribution holds the ball in his hands (the ball follows the authored hand path). */
  holds(id:string|null){const a=id?active.get(id):undefined;if(!a||!(a.type in KEEPER_RELEASE))return false;const p=progressOf(a);return p>=0&&p<KEEPER_RELEASE[a.type as keyof typeof KEEPER_RELEASE];},
  /** A header met at the top of a jump is the head's job: no leg swing on top of it. */
  settle(motion:PlayerMotion){if(motion.jump&&motion.reaction==='header')motion.kick=undefined;},
  skillOf(id:string){const a=active.get(id);return a?{kind:a.kind,type:a.type,progress:progressOf(a)}:undefined;},
  reset(){active.clear();passFrom.clear();lastWindup=null;lastOwner=null;touchSeen=-1;},
 };
}
export type ComboView=ReturnType<typeof createComboView>;
