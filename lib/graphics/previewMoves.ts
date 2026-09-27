// In-place move showcase for the character preview (Make it yours) and the skill lab (?skill=showcase).
// Pure maths on top of the rig's public motion fields: skill moves (lib/graphics/skillMoves.ts, via its public
// helpers), lane B's signature moves / jump / keeper dive, the treadmill gait (`samplePose`), keep-ups (`juggle`)
// and the celebration (lib/graphics/celebrations.ts). No three.js here and nothing to dispose.
//
// A move is a list of steps played by `createPreviewDriver`. The driver owns a root frame (x, z, heading) and the
// ball, and hands both from step to step: every step starts where the previous one left the player and the ball,
// and short "reset" steps walk the player back toward the middle of the stage carrying the ball, so nothing ever
// teleports (only a far-away ball after a finish is hidden and re-served). Ball contacts come from the moves'
// own contact data (skillBall) or from the rig's measured contact limb (tests/preview-moves.cjs checks them on
// the solved rig), and a host may pass a probe (live ankle / hand positions) for the touches that follow a limb.
import {MOVE_PHASE,JUMP_PHASE,type PlayerMotion,type SignatureMove} from './player';
import {SKILL_MOVES,applySkill,skillBall,skillFrame,type SkillMove} from './skillMoves';
import {juggleContact,type JuggleHead,type JuggleTouch} from '../town/walkBall';
import {CELEBRATION_SECONDS,celebrationMotion} from './celebrations';

/** Batch 2 skill moves shown as their own preview moves (the id is the skill type). */
export type PreviewSkillId='insideCut'|'outsideCut'|'fakeShot'|'nutmeg'|'chipShot'|'finesseShot'|'trivela'|'toePoke'|'knuckleball'|'blockTackle'|'pokeTackle'|'keeperThrow'|'keeperRoll'|'keeperPunt'|'thankPasser'|'airplane'|'kneeSlide';
export type PreviewMoveId='showcase'|'idle'|'walk'|'run'|'keepUps'|'volley'|'header'|'bicycle'|'scissor'|'stepover'|'cruyff'|'dragBack'|'rainbow'|'soleRoll'|'flickUp'|'keeperDive'|'celebrate'|PreviewSkillId;
/** What the move is for: the arrows walk the list group by group and the caption names the group. */
export type PreviewGroup='Movement'|'Ball mastery'|'Dribbles'|'Shooting'|'Defending'|'Goalkeeping'|'Celebrations';
export type PreviewMove={id:PreviewMoveId;label:string;/** Uses a ball at all. */ball:boolean;/** Times the move plays before idling. */loops:number;group?:PreviewGroup};
/** The preview's move list, in arrow order (grouped). The showcase is the default. */
export const PREVIEW_MOVES:readonly PreviewMove[]=[
  {id:'showcase',label:'Skills showcase',ball:true,loops:1},
  {id:'idle',label:'Ready stance',ball:false,loops:1,group:'Movement'},
  {id:'walk',label:'Walking',ball:false,loops:1,group:'Movement'},
  {id:'run',label:'Running',ball:false,loops:1,group:'Movement'},
  {id:'keepUps',label:'Keep-ups',ball:true,loops:2,group:'Ball mastery'},
  {id:'soleRoll',label:'Sole roll',ball:true,loops:3,group:'Ball mastery'},
  {id:'flickUp',label:'Flick-up',ball:true,loops:3,group:'Ball mastery'},
  {id:'stepover',label:'Stepover',ball:true,loops:3,group:'Dribbles'},
  {id:'insideCut',label:'Inside cut',ball:true,loops:2,group:'Dribbles'},
  {id:'outsideCut',label:'Outside cut',ball:true,loops:2,group:'Dribbles'},
  {id:'cruyff',label:'Cruyff turn',ball:true,loops:2,group:'Dribbles'},
  {id:'dragBack',label:'Drag-back',ball:true,loops:2,group:'Dribbles'},
  {id:'fakeShot',label:'Fake shot',ball:true,loops:2,group:'Dribbles'},
  {id:'nutmeg',label:'Nutmeg',ball:true,loops:2,group:'Dribbles'},
  {id:'rainbow',label:'Rainbow flick',ball:true,loops:2,group:'Dribbles'},
  {id:'chipShot',label:'Chip shot',ball:true,loops:2,group:'Shooting'},
  {id:'finesseShot',label:'Curled shot',ball:true,loops:2,group:'Shooting'},
  {id:'trivela',label:'Trivela',ball:true,loops:2,group:'Shooting'},
  {id:'toePoke',label:'Toe poke',ball:true,loops:3,group:'Shooting'},
  {id:'knuckleball',label:'Knuckleball',ball:true,loops:2,group:'Shooting'},
  {id:'volley',label:'Volley',ball:true,loops:3,group:'Shooting'},
  {id:'header',label:'Jumping header',ball:true,loops:3,group:'Shooting'},
  {id:'bicycle',label:'Bicycle kick',ball:true,loops:2,group:'Shooting'},
  {id:'scissor',label:'Scissor kick',ball:true,loops:2,group:'Shooting'},
  {id:'blockTackle',label:'Block tackle',ball:true,loops:2,group:'Defending'},
  {id:'pokeTackle',label:'Poke tackle',ball:true,loops:2,group:'Defending'},
  {id:'keeperDive',label:'Keeper dive',ball:true,loops:2,group:'Goalkeeping'},
  {id:'keeperThrow',label:'Overarm throw',ball:true,loops:2,group:'Goalkeeping'},
  {id:'keeperRoll',label:'Roll-out',ball:true,loops:2,group:'Goalkeeping'},
  {id:'keeperPunt',label:'Punt',ball:true,loops:2,group:'Goalkeeping'},
  {id:'celebrate',label:'Jump for joy',ball:false,loops:2,group:'Celebrations'},
  {id:'thankPasser',label:'Thank the passer',ball:false,loops:1,group:'Celebrations'},
  {id:'airplane',label:'Airplane',ball:false,loops:1,group:'Celebrations'},
  {id:'kneeSlide',label:'Knee slide',ball:false,loops:1,group:'Celebrations'},
];
export const PREVIEW_MOVE_IDS=PREVIEW_MOVES.map(m=>m.id);
/** Arrow stepping with wrap-around. */
export function stepMoveIndex(index:number,dir:number,count=PREVIEW_MOVES.length){return ((index+Math.sign(dir))%count+count)%count;}
/** "Shooting · Bicycle kick 22/33" (the showcase has no group: "Skills showcase 1/33"). */
export function moveCaption(index:number){const m=PREVIEW_MOVES[index];return `${m.group?m.group+' · ':''}${m.label} ${index+1}/${PREVIEW_MOVES.length}`;}
/** Keeper distributions start with the ball held in both hands (the rig's own keeper hold); this is where it sits. */
const HANDS_BALL={x:0,y:1.08,z:.5};

type V3={x:number;y:number;z:number};
type Frame={x:number;z:number;yaw:number};
/** Optional live limbs (in the rig's parent space) for touches that follow a limb, plus bean head data for keep-ups. */
export type PreviewProbe={ankle?:(side:-1|1,out:V3)=>V3;hands?:(out:V3)=>V3;headTop?:number;juggleHead?:JuggleHead};
export type PreviewFrame={
  motion:PlayerMotion;x:number;z:number;ball:V3;ballVisible:boolean;
  /** Celebration progress for applyCelebrationArms, or −1. */
  celebrate:number;expression:'neutral'|'happy'|'focused';
  /** Name of the step playing (debug/tests) and whether the move has finished and settled into its idle. */
  step:string;done:boolean;
};

// ---------------------------------------------------------------------------------------------- contact data
// Rig-local contact points for side +1 (x mirrors), measured on the solved rig at the move's contact phase
// (bean and classic agree to 1 cm): ball centre ≈ one radius beyond the touching boot / forehead / gloves.
const R=.19;
export const SIG_BALL:Record<'volley'|'bicycle'|'scissor',{from:V3;contact:V3;to:V3;inArc:number;outArc:number;height?:number}>={
  volley:{from:{x:-1.5,y:.4,z:2.3},contact:{x:.13,y:.72,z:.7},to:{x:-1.2,y:1.4,z:4.2},inArc:1.3,outArc:.4,height:.6},
  bicycle:{from:{x:.17,y:.35,z:2.7},contact:{x:.17,y:2.12,z:-.18},to:{x:.17,y:1.5,z:-4.2},inArc:.9,outArc:.9},
  scissor:{from:{x:1.9,y:.55,z:1.3},contact:{x:.02,y:1.52,z:.98},to:{x:-1.6,y:1.9,z:4},inArc:.85,outArc:.3},
};
export const HEADER_BALL={from:{x:-1.5,y:.8,z:2.4},contact:{x:0,y:2.1,z:.5},to:{x:-1.2,y:2.6,z:4.2},inArc:1.1,outArc:.3,height:.35};
export const DIVE_BALL={from:{x:.1,y:.3,z:3.2},contact:{x:.97,y:.98,z:.33},inArc:.45};
/** Gloves (midpoint, + a little forward) through a side catch when no live probe is given. */
const DIVE_HANDS=[.3,.97,.98,.33, .42,.35,.31,.47, .6,.35,.31,.47, .9,.03,.81,.43, 1,0,.9,.4];
/** Sole roll: the ball under the sole, rolled across (x by progress) — measured sole track. */
const SOLE_X=[0,.19,.12,.19,.25,.18,.5,.08,.71,.03,1,.03],SOLE_Z=.56;
const FLICK_REST={x:.11,y:R,z:.62};
export const DRIBBLE_Z=.5;
export const JUGGLE_PERIOD=.9,JUGGLE_ARC=.7;
/** The rig's keep-up tap peaks ~.08 s after its phase 0 (inertial legs): it is fed slightly ahead of the ball. */
const JUGGLE_RIG_LEAD=.09;
/** Instep keep-up: where the rig's tapping boot actually meets the ball (walkBall's authored point is higher/further). */
const FOOT_TOUCH={x:.11,y:.46,z:.27},KNEE_TOUCH={x:.11,y:.95,z:.42};
const DIVE_SECONDS=1.6,JUMP_SECONDS=.95,HEADER_SNAP=.28,HEADER_SECONDS=.6;
/** Resting ball in front of the idle player. */
const REST_BALL={x:.12,y:R,z:.55};

const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smooth=(v:number)=>{const t=clamp01(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
const kf=(p:number,k:readonly number[],stride=2,col=1)=>{if(p<=k[0])return k[col];for(let i=stride;i<k.length;i+=stride)if(p<=k[i]){const a=k[i-stride],u=(p-a)/(k[i]-a||1);return lerp(k[i-stride+col],k[i+col],u);}return k[k.length-stride+col];};
/** Rig-local point (side-mirrored) → stage point for a frame. */
function toStage(f:Frame,l:V3,side:number,out:V3){const c=Math.cos(f.yaw),s=Math.sin(f.yaw),lx=l.x*side;out.x=f.x+lx*c+l.z*s;out.z=f.z-lx*s+l.z*c;out.y=l.y;return out;}
function toLocal(f:Frame,p:V3,out:V3){const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.yaw),s=Math.sin(f.yaw);out.x=dx*c-dz*s;out.z=dx*s+dz*c;out.y=p.y;return out;}
/** A ball flight from a to b with an extra apex height h (a lob's parabola over the straight line). */
function arc(a:V3,b:V3,u:number,h:number,out:V3){out.x=lerp(a.x,b.x,u);out.z=lerp(a.z,b.z,u);out.y=lerp(a.y,b.y,u)+4*u*(1-u)*h;return out;}
/** The keep-up arc (lib/town/walkBall.ts juggle): x/z ease between contacts, y rises over the straight line. */
function juggleArc(a:V3,b:V3,phase:number,out:V3){const e=smooth(phase);out.x=lerp(a.x,b.x,e);out.z=lerp(a.z,b.z,e);out.y=lerp(a.y,b.y,phase)+4*phase*(1-phase)*JUGGLE_ARC;return out;}

// ----------------------------------------------------------------------------------------------------- steps
type Step=
  |{k:'idle';dur:number;ready?:boolean;keeper?:boolean;ball:'rest'|'keep'|'hide'|'hands'}
  |{k:'gait';dur:number;speed:number;run:number}
  |{k:'dribble';dur:number}
  |{k:'skill';type:SkillMove;side:-1|1;/** A fresh ball is played in at the start (tackles, keeper) instead of carried. */serve?:boolean}
  |{k:'sig';move:'volley'|'bicycle'|'scissor';side:-1|1}
  |{k:'ground';move:'soleRoll';side:-1|1}
  |{k:'flickJuggle';side:-1|1;touches:JuggleTouch[];drop:V3}
  |{k:'header'}
  |{k:'dive';dir:-1|1}
  |{k:'celebrate';roll:boolean}
  |{k:'serveOut'}
  |{k:'reset';dur?:number;recentre:number;turn:number;/** Walk to this stage point instead (a move that travels far starts off-centre). */to?:{x:number;z:number}};
const SIG_LEAD=.55,SIG_TAIL=.55,HEADER_LEAD=.5,DIVE_LEAD=.2,SIG_SLOW=1.25;
const sigSeconds=(m:SignatureMove)=>MOVE_PHASE[m].seconds*SIG_SLOW;
function flickSeconds(s:{touches:JuggleTouch[]}){const f=MOVE_PHASE.flickUp,after=(1-f.contact)*f.seconds;return f.seconds+(JUGGLE_PERIOD-after)+s.touches.length*JUGGLE_PERIOD;}
function stepSeconds(s:Step):number{
  switch(s.k){
    case 'idle':case 'gait':case 'dribble':return s.dur;
    case 'skill':return SKILL_MOVES[s.type].seconds;
    case 'sig':return SIG_LEAD+sigSeconds(s.move)+SIG_TAIL;
    case 'ground':return sigSeconds(s.move);
    case 'flickJuggle':return flickSeconds(s);
    case 'header':return HEADER_LEAD+JUMP_SECONDS+.4;
    case 'dive':return DIVE_LEAD+DIVE_SECONDS;
    case 'celebrate':return CELEBRATION_SECONDS;
    case 'serveOut':return .8;
    case 'reset':return s.dur??.35;
  }
}
/** Where a step wants the ball when it starts (stage coords), or null when it hides/keeps the ball. */
function startBall(s:Step,f:Frame,out:V3):V3|null{
  switch(s.k){
    case 'skill':{const b=skillBall(s.type,0,s.side);return b?toStage(f,b,1,out):null;}
    case 'sig':return toStage(f,SIG_BALL[s.move].from,s.side,out);
    case 'ground':return toStage(f,{x:SOLE_X[1],y:R,z:SOLE_Z},s.side,out);
    case 'flickJuggle':return toStage(f,FLICK_REST,s.side,out);
    case 'header':return toStage(f,HEADER_BALL.from,1,out);
    case 'dive':return toStage(f,DIVE_BALL.from,s.dir,out);
    case 'dribble':return toStage(f,{x:0,y:R,z:DRIBBLE_Z},1,out);
    case 'idle':return s.ball==='rest'?toStage(f,REST_BALL,1,out):s.ball==='hands'?toStage(f,HANDS_BALL,1,out):null;
    default:return null;
  }
}
const needsBall=(s:Step)=>!['gait','reset','serveOut','celebrate'].includes(s.k)&&!(s.k==='idle'&&s.ball==='hide')&&!(s.k==='skill'&&!SKILL_MOVES[s.type].ball);

/** Steps for one move; `loops` repeats the body with a reset (walk back to the middle, ball carried) between. */
function program(id:PreviewMoveId):Step[]{
  const reset=(recentre=Infinity,turn=Infinity):Step=>({k:'reset',recentre,turn});
  const rest=(dur:number,ball:'rest'|'keep'|'hide'='keep',extra:Partial<{ready:boolean;keeper:boolean}>={}):Step=>({k:'idle',dur,ball,...extra});
  const end=(ball:'rest'|'hide'):Step[]=>[reset(),{k:'idle',dur:Infinity,ball}];
  const loops=PREVIEW_MOVES.find(m=>m.id===id)!.loops;
  const repeat=(body:(k:number)=>Step[],gap:Step[]):Step[]=>{const out:Step[]=[];for(let k=0;k<loops;k++){out.push(...body(k));if(k<loops-1)out.push(...gap);}return out;};
  const touches:JuggleTouch[]=['foot','foot','knee','knee','head','head','foot'];
  switch(id){
    case 'showcase':return [
      {k:'dribble',dur:1.8},reset(.2,.5),
      {k:'skill',type:'bodyFeint',side:1},reset(.7,.5),
      {k:'skill',type:'stepover',side:-1},reset(.8,.5),
      {k:'skill',type:'insideCut',side:1},reset(.8,.6),
      {k:'skill',type:'dragBack',side:1},reset(.3,.3),
      {k:'skill',type:'cruyffTurn',side:-1},reset(.45,.6),
      {k:'skill',type:'fakeShot',side:-1},reset(.8,.6),
      {k:'ground',move:'soleRoll',side:1},reset(.2,.4),
      {k:'flickJuggle',side:1,touches:['foot','knee'],drop:{x:.1,y:R,z:.55}},{k:'reset',recentre:0,turn:0,dur:.5},
      {k:'skill',type:'rainbowFlick',side:1},
      {k:'celebrate',roll:true},...end('rest')];
    case 'idle':return [{k:'idle',dur:Infinity,ball:'hide',ready:true}];
    case 'walk':return [{k:'gait',dur:6,speed:1.35,run:0},{k:'idle',dur:Infinity,ball:'hide'}];
    case 'run':return [{k:'gait',dur:5,speed:5.2,run:.85},{k:'idle',dur:Infinity,ball:'hide'}];
    case 'keepUps':return [...repeat(()=>[{k:'flickJuggle',side:1,touches,drop:REST_BALL},rest(.5,'keep')],[reset()]),...end('rest')];
    case 'volley':case 'bicycle':case 'scissor':{const move=id;return [...repeat(k=>[{k:'sig',move,side:id==='scissor'&&k%2?-1:1}],[rest(.45,'hide')]),...end('hide')];}
    case 'header':return [...repeat(()=>[{k:'header'}],[rest(.45,'hide')]),...end('hide')];
    case 'stepover':case 'cruyff':case 'dragBack':case 'rainbow':{
      const type:SkillMove=id==='cruyff'?'cruyffTurn':id==='rainbow'?'rainbowFlick':id;
      return [...repeat(k=>[{k:'skill',type,side:(k%2?-1:1)}],[rest(.25),reset()]),...end('rest')];}
    case 'soleRoll':return [...repeat(k=>[{k:'ground',move:'soleRoll',side:(k%2?-1:1)}],[rest(.2),reset()]),...end('rest')];
    case 'flickUp':return [...repeat(()=>[{k:'flickJuggle',side:1,touches:[],drop:REST_BALL},rest(.3)],[reset()]),...end('rest')];
    case 'keeperDive':return [rest(.5,'hide',{keeper:true,ready:true}),...repeat(k=>[{k:'dive',dir:(k%2?-1:1)},{k:'serveOut'}],[rest(.3,'hide',{keeper:true,ready:true})]),reset(),{k:'idle',dur:Infinity,ball:'hide',keeper:true}];
    case 'celebrate':return [...repeat(()=>[{k:'celebrate',roll:false}],[rest(.3,'hide')]),{k:'idle',dur:Infinity,ball:'hide'}];
    default:return skillProgram(id as PreviewSkillId,loops,repeat,reset,rest,end);
  }
}
type Rep=(body:(k:number)=>Step[],gap:Step[])=>Step[];
/** Batch 2 moves: the skill itself, both feet on alternate loops (keepers throw with alternate hands). Moves that
 *  travel far start off-centre so the whole move stays on the stage; keepers first take the ball into their hands. */
function skillProgram(type:PreviewSkillId,loops:number,repeat:Rep,reset:(r?:number,t?:number)=>Step,rest:(d:number,b?:'rest'|'keep'|'hide')=>Step,end:(b:'rest'|'hide')=>Step[]):Step[]{
  void loops;const g=SKILL_MOVES[type].group,side=(k:number)=>(k%2?-1:1) as -1|1;
  const at=(x:number,z:number):Step=>({k:'reset',recentre:Infinity,turn:Infinity,to:{x,z}});
  switch(g){
    case 'keeper':return [...repeat(k=>[{k:'idle',dur:.45,ball:'hands',keeper:true},{k:'skill',type,side:side(k),serve:true}],[reset()]),reset(),{k:'idle',dur:Infinity,ball:'hide',keeper:true}];
    case 'celebrate':{const pre:Step[]=type==='airplane'?[at(-.7,0)]:type==='kneeSlide'?[at(0,-.8)]:[];return [...repeat(()=>[...pre,{k:'skill',type,side:1}],[rest(.3,'hide')]),...end('hide')];}
    case 'defend':return [...repeat(k=>[{k:'skill',type,side:side(k),serve:true},rest(.3)],[reset()]),...end('rest')];
    case 'shoot':return [...repeat(k=>[{k:'skill',type,side:side(k)},rest(.25,'hide')],[reset()]),...end('rest')];
    default:{const pre:Step[]=type==='nutmeg'?[at(0,-1.15)]:[];return [...repeat(k=>[...pre,{k:'skill',type,side:side(k)}],[rest(.25),reset()]),...end('rest')];}
  }
}
/** Total seconds until the move settles into its final idle (Infinity steps excluded). */
export function moveSeconds(id:PreviewMoveId){
  const d=createPreviewDriver();d.set(id);let t=0;while(!d.finished&&t<60){d.step(1/60);t+=1/60;}return t;
}
/** Seconds into the move of its still key pose (reduced motion shows this instead of looping). */
export const KEY_POSE:Record<PreviewMoveId,{step:number;at:number}>={
  // step: index into the move's steps; at: seconds into that step.
  showcase:{step:4,at:SKILL_MOVES.stepover.seconds*.4},idle:{step:0,at:.5},walk:{step:0,at:.9},run:{step:0,at:.62},
  keepUps:{step:0,at:MOVE_PHASE.flickUp.seconds+(JUGGLE_PERIOD-(1-MOVE_PHASE.flickUp.contact)*MOVE_PHASE.flickUp.seconds)+4*JUGGLE_PERIOD+.02},
  volley:{step:0,at:SIG_LEAD+MOVE_PHASE.volley.contact*sigSeconds('volley')},header:{step:0,at:HEADER_LEAD+JUMP_PHASE.peak*JUMP_SECONDS},
  bicycle:{step:0,at:SIG_LEAD+MOVE_PHASE.bicycle.contact*sigSeconds('bicycle')},scissor:{step:0,at:SIG_LEAD+MOVE_PHASE.scissor.contact*sigSeconds('scissor')},
  stepover:{step:0,at:SKILL_MOVES.stepover.seconds*.4},cruyff:{step:0,at:SKILL_MOVES.cruyffTurn.seconds*.4},dragBack:{step:0,at:SKILL_MOVES.dragBack.seconds*.28},
  rainbow:{step:0,at:SKILL_MOVES.rainbowFlick.seconds*.62},soleRoll:{step:0,at:sigSeconds('soleRoll')*.5},flickUp:{step:0,at:MOVE_PHASE.flickUp.contact*MOVE_PHASE.flickUp.seconds+.25},
  keeperDive:{step:1,at:DIVE_LEAD+.3*DIVE_SECONDS},celebrate:{step:0,at:.2*CELEBRATION_SECONDS},
  // Batch 2: the decisive moment of each move (the cut, the strike, the release, the block, the celebration's peak).
  insideCut:{step:0,at:SKILL_MOVES.insideCut.seconds*.42},outsideCut:{step:0,at:SKILL_MOVES.outsideCut.seconds*.4},fakeShot:{step:0,at:SKILL_MOVES.fakeShot.seconds*.3},
  nutmeg:{step:1,at:SKILL_MOVES.nutmeg.seconds*.45},chipShot:{step:0,at:SKILL_MOVES.chipShot.seconds*.36},finesseShot:{step:0,at:SKILL_MOVES.finesseShot.seconds*.36},
  trivela:{step:0,at:SKILL_MOVES.trivela.seconds*.36},toePoke:{step:0,at:SKILL_MOVES.toePoke.seconds*.32},knuckleball:{step:0,at:SKILL_MOVES.knuckleball.seconds*.34},blockTackle:{step:0,at:SKILL_MOVES.blockTackle.seconds*.38},
  pokeTackle:{step:0,at:SKILL_MOVES.pokeTackle.seconds*.35},keeperThrow:{step:1,at:SKILL_MOVES.keeperThrow.seconds*.4},keeperRoll:{step:1,at:SKILL_MOVES.keeperRoll.seconds*.42},
  keeperPunt:{step:1,at:SKILL_MOVES.keeperPunt.seconds*.43},thankPasser:{step:0,at:SKILL_MOVES.thankPasser.seconds*.4},airplane:{step:1,at:SKILL_MOVES.airplane.seconds*.3},
  kneeSlide:{step:1,at:SKILL_MOVES.kneeSlide.seconds*.5},
};

// ---------------------------------------------------------------------------------------------------- driver
/** Plays one move at a time. `step(dt)` advances and returns the frame to apply (motion + root + ball). */
export function createPreviewDriver(){
  let id:PreviewMoveId='showcase',steps:Step[]=[],index=0,t=0,total=0,first=true,prepended=false;
  const F:Frame={x:0,z:0,yaw:0},S:Frame={x:0,z:0,yaw:0},T1:Frame={x:0,z:0,yaw:0};
  const B:V3={x:REST_BALL.x,y:R,z:REST_BALL.z},B0:V3={x:0,y:R,z:0},B1:V3={x:0,y:R,z:0},tmp:V3={x:0,y:0,z:0},tmp2:V3={x:0,y:0,z:0},tmp3:V3={x:0,y:0,z:0};
  let visible=false,vis1=false,resetDur=.35,dribbleX=0,endBall:V3|null=null;
  const out:PreviewFrame={motion:{},x:0,z:0,ball:B,ballVisible:false,celebrate:-1,expression:'neutral',step:'idle',done:false};
  const enter=()=>{
    const s=steps[index];S.x=F.x;S.z=F.z;S.yaw=F.yaw;B0.x=B.x;B0.y=B.y;B0.z=B.z;t=0;
    if(s.k==='reset'){
      const d=Math.hypot(F.x,F.z),k=d>1e-6?Math.min(1,s.recentre/d):0,turn=wrap(-F.yaw);
      T1.x=F.x*(1-k);T1.z=F.z*(1-k);T1.yaw=F.yaw+Math.sign(turn)*Math.min(Math.abs(turn),s.turn);
      if(s.to){T1.x=s.to.x;T1.z=s.to.z;}
      const next=steps[index+1],nb=next?startBall(next,T1,B1):null;
      // A ball far away (after a finish) is re-served at the next start instead of flying back in; so is a fresh
      // ball played in for a tackle or a keeper's hands.
      if(visible&&(Math.hypot(B.x-F.x,B.z-F.z)>1.6||B.y>1.4||next?.k==='skill'&&next.serve||next?.k==='idle'&&next.ball==='hands'))visible=false;
      vis1=!!nb&&(visible||!!next&&needsBall(next));
      const moved=Math.hypot(T1.x-F.x,T1.z-F.z),turned=Math.abs(wrap(T1.yaw-F.yaw)),ballGap=vis1&&visible?Math.hypot(B1.x-B.x,B1.z-B.z):0;
      resetDur=Math.max(s.dur??.3,moved/1.7,turned/3.2,ballGap/2.2,vis1&&visible&&B.y>.3?.45:0);
      if(!visible&&vis1){B.x=B1.x;B.y=B1.y;B.z=B1.z;B0.x=B1.x;B0.y=B1.y;B0.z=B1.z;}
    }
    if(s.k==='dribble'){const l=toLocal(F,B,tmp);dribbleX=l.x;}
    if(s.k==='celebrate'){endBall=visible?{x:B.x,y:R,z:B.z}:null;}
  };
  const durNow=()=>{const s=steps[index];return s.k==='reset'?resetDur:stepSeconds(s);};
  const set=(next:PreviewMoveId)=>{
    // Continue from where the player is shown right now (mid-move), not from where the interrupted step began.
    if(!first){F.x=out.x;F.z=out.z;F.yaw=wrap(out.motion.facing??F.yaw);}
    id=next;const body=program(id);
    // Every move starts with a short reset from wherever the last one left off (switching blends, never jumps).
    prepended=!first;steps=first?body:[{k:'reset',recentre:Infinity,turn:Infinity},...body];first=false;index=0;total=0;
    enter();
  };
  const finishStep=()=>{
    const s=steps[index];
    if(s.k==='skill'){const f=skillFrame(s.type,1,s.side,{x:0,z:0,heading:0});toStage(S,{x:f.x,y:0,z:f.z},1,tmp);F.x=tmp.x;F.z=tmp.z;F.yaw=S.yaw+f.heading;}
    if(s.k==='reset'){F.x=T1.x;F.z=T1.z;F.yaw=wrap(T1.yaw);visible=vis1;}
    F.yaw=wrap(F.yaw);
  };
  const evaluate=(dt:number,probe?:PreviewProbe,reduced=false)=>{
    const s=steps[index],m:PlayerMotion={facing:F.yaw};out.motion=m;out.celebrate=-1;out.expression='neutral';out.step=s.k;
    let rx=F.x,rz=F.z;
    switch(s.k){
      case 'idle':{if(s.ready)m.stance='ready';if(s.keeper){m.keeper=1;m.keeperReach=s.ball==='hands'?.65:0;}
        if(s.ball==='hide')visible=false;else if(s.ball==='rest'&&!visible&&t===0){toStage(F,REST_BALL,1,B);visible=true;}
        else if(s.ball==='hands'){toStage(F,HANDS_BALL,1,B);visible=true;}break;}
      case 'gait':{const d=s.speed*t;m.samplePose={speed:s.speed,distance:d,heading:F.yaw};m.runIntensity=s.run;visible=false;break;}
      case 'dribble':{
        // Treadmill jog with the ball tapped between the boots: it follows the leading boot's line, close in front.
        const d=1.9*t;m.samplePose={speed:1.9,distance:d,heading:F.yaw};m.runIntensity=.15;m.dribbling=true;
        let target=.1*Math.sin(t*Math.PI*2/.62);
        if(probe?.ankle){const L=toLocal(F,probe.ankle(-1,tmp2),tmp2),Rt=toLocal(F,probe.ankle(1,tmp3),tmp3);target=(L.z>Rt.z?L.x:Rt.x)*.75;}
        dribbleX+=(target-dribbleX)*(1-Math.exp(-(dt||1/60)*9));
        const settle=smooth(t/.25);const l0=toLocal(F,B0,tmp);
        toStage(F,{x:lerp(l0.x,dribbleX,settle),y:R,z:lerp(l0.z,DRIBBLE_Z,settle)},1,B);visible=true;m.lookX=B.x;m.lookZ=B.z;break;}
      case 'skill':{const spec=SKILL_MOVES[s.type],p=clamp01(t/spec.seconds);const root={x:0,z:0};applySkill(m,s.type,p,s.side,{x:S.x,z:S.z,yaw:S.yaw},root,spec.ball?B:undefined);rx=root.x;rz=root.z;
        if(spec.group==='keeper')m.keeper=1;visible=spec.ball;out.expression=spec.group==='celebrate'?'happy':'focused';break;}
      case 'sig':{
        const spec=SIG_BALL[s.move],sec=sigSeconds(s.move),M=MOVE_PHASE[s.move],p=(t-SIG_LEAD)/sec,tc=SIG_LEAD+M.contact*sec;
        if(p>=0&&p<=1)m.move={kind:s.move,progress:p,side:s.side,height:spec.height};else if(p<0)m.ready=.6;
        const from=toStage(F,spec.from,s.side,tmp),c=toStage(F,spec.contact,s.side,tmp2),to=toStage(F,spec.to,s.side,tmp3);
        if(t<=tc)arc(from,c,t/tc,spec.inArc,B);else arc(c,to,clamp01((t-tc)/(SIG_TAIL+.25)),spec.outArc,B);
        visible=t<tc+SIG_TAIL+.25;m.lookX=B.x;m.lookZ=B.z;out.expression='focused';break;}
      case 'ground':{const sec=sigSeconds(s.move),p=clamp01(t/sec);m.move={kind:s.move,progress:p,side:s.side};m.dribbling=true;
        toStage(F,{x:kf(p,SOLE_X),y:R,z:SOLE_Z},s.side,B);visible=true;out.expression='focused';break;}
      case 'flickJuggle':{
        const f=MOVE_PHASE.flickUp,fs=f.seconds,tc=f.contact*fs,sd=s.side,J=(k:number)=>(k%2?sd:-sd) as -1|1;
        const head=probe?.juggleHead,top=probe?.headTop;
        const contact=(k:number,o:V3)=>{if(k>=s.touches.length)return toStage(F,s.drop,1,o);const c=s.touches[k]==='foot'?FOOT_TOUCH:s.touches[k]==='knee'?KNEE_TOUCH:juggleContact(s.touches[k],1,head,top);return toStage(F,c,J(k),o);};
        if(t<fs)m.move={kind:'flickUp',progress:t/fs,side:sd};m.dribbling=t<tc;
        if(t<tc){toStage(F,FLICK_REST,sd,B);}
        else{
          // After the flick the ball is on a keep-up arc: touch −1 is the flick itself, then each listed touch.
          const u=(t-tc)/JUGGLE_PERIOD,k=Math.floor(u),ph=u-k; // k = −1… arc index (0 = the flick's arc)
          const a=k===0?toStage(F,{x:FLICK_REST.x,y:R+.04,z:FLICK_REST.z},sd,tmp):contact(k-1,tmp),b=contact(k,tmp2);
          if(k>s.touches.length){b.y=R;B.x=b.x;B.y=R;B.z=b.z;}
          else if(k===s.touches.length){const e=smooth(ph);B.x=lerp(a.x,b.x,e);B.z=lerp(a.z,b.z,e);B.y=Math.max(R,lerp(a.y,R,ph)+4*ph*(1-ph)*JUGGLE_ARC*.8);}
          else juggleArc(a,b,ph,B);
          // Rig keep-up pose: touch k−1 opens arc k; the rig is fed JUGGLE_RIG_LEAD ahead so its tap meets the ball.
          if(t>=fs&&k<=s.touches.length&&s.touches.length){
            const early=ph>=1-JUGGLE_RIG_LEAD&&k<s.touches.length,touch=early?k:k-1;
            if(touch>=0){m.juggle=early?ph+JUGGLE_RIG_LEAD-1:Math.min(.999,ph+JUGGLE_RIG_LEAD);m.juggleTouch=s.touches[touch];m.kickSide=J(touch);}
            else{m.juggle=.5+ph*.4;m.juggleTouch='foot';m.kickSide=J(0);} // the flick's own arc: no tap yet
          }
        }
        visible=true;m.lookX=B.x;m.lookZ=B.z;m.lookY=B.y;out.expression='focused';break;}
      case 'header':{
        const tc=HEADER_LEAD+JUMP_PHASE.peak*JUMP_SECONDS,jp=(t-HEADER_LEAD)/JUMP_SECONDS;
        if(jp>=0&&jp<=1)m.jump={progress:jp,height:HEADER_BALL.height};
        const rp=(t-(tc-HEADER_SNAP))/HEADER_SECONDS;if(rp>=0&&rp<=1){m.reaction='header';m.reactionProgress=rp;}
        const from=toStage(F,HEADER_BALL.from,1,tmp),c=toStage(F,HEADER_BALL.contact,1,tmp2),to=toStage(F,HEADER_BALL.to,1,tmp3);
        if(t<=tc)arc(from,c,t/tc,HEADER_BALL.inArc,B);else arc(c,to,clamp01((t-tc)/.6),HEADER_BALL.outArc,B);
        visible=t<tc+.6;m.lookX=B.x;m.lookZ=B.z;m.lookY=B.y;out.expression='focused';break;}
      case 'dive':{
        const p=(t-DIVE_LEAD)/DIVE_SECONDS,tc=DIVE_LEAD+.3*DIVE_SECONDS;m.keeper=1;
        if(p>=0&&p<=1)m.dive={progress:p,dir:s.dir,height:.5,kind:'side',outcome:'catch'};else{m.stance='ready';m.keeperReach=0;}
        if(t<=tc){arc(toStage(F,DIVE_BALL.from,s.dir,tmp),toStage(F,DIVE_BALL.contact,s.dir,tmp2),t/tc,DIVE_BALL.inArc,B);}
        else if(probe?.hands){const h=probe.hands(tmp);const l=toLocal(F,h,tmp2);const fwd=.1;toStage(F,{x:l.x,y:h.y,z:l.z+fwd},1,B);}
        else{const q=clamp01(p);toStage(F,{x:kf(q,DIVE_HANDS,4,1),y:kf(q,DIVE_HANDS,4,2),z:kf(q,DIVE_HANDS,4,3)},s.dir,B);}
        visible=true;m.lookX=B.x;m.lookZ=B.z;out.expression='focused';break;}
      case 'serveOut':{
        // The keeper rolls the ball back out (so the next shot can come from there): hands → ground → away.
        const u=clamp01(t/.8),a=B0,b=toStage(F,{x:0,y:R,z:4.6},1,tmp);B.x=lerp(a.x,b.x,u*u);B.z=lerp(a.z,b.z,u*u);B.y=Math.max(R,lerp(a.y,R,smooth(u/.3)));m.keeper=1;visible=u<.95;break;}
      case 'celebrate':{
        const p=clamp01(t/CELEBRATION_SECONDS);celebrationMotion(p,m,reduced);out.celebrate=p;out.expression='happy';
        if(s.roll&&endBall){const l=toLocal(F,endBall,tmp2),dir=Math.hypot(l.x,l.z)||1,e=1-Math.pow(1-clamp01(t/.9),2);toStage(F,{x:l.x+l.x/dir*.3*e,y:R,z:l.z+l.z/dir*.3*e},1,B);visible=true;}
        else visible=false;break;}
      case 'reset':{
        const u=clamp01(t/resetDur),e=smooth(u);rx=lerp(S.x,T1.x,e);rz=lerp(S.z,T1.z,e);m.facing=S.yaw+wrap(T1.yaw-S.yaw)*e;m.runIntensity=.2;
        // Walking up to take the ball into the keeper's hands: the arms come up to the hold on the way.
        const nx=steps[index+1];if(nx?.k==='idle'&&nx.ball==='hands'){m.keeper=1;m.keeperReach=.65*e;}
        if(vis1){const air=B0.y>.3;B.x=lerp(B0.x,B1.x,e);B.z=lerp(B0.z,B1.z,e);B.y=air?Math.max(R,lerp(B0.y,B1.y,u*u)):lerp(B0.y,B1.y,e);m.dribbling=!air;}
        visible=vis1;break;}
    }
    out.x=rx;out.z=rz;out.ballVisible=visible;
    out.done=steps[index].k==='idle'&&(steps[index] as {dur:number}).dur===Infinity&&t>.9;
    return out;
  };
  return {
    set,
    get id(){return id;},
    /** True once the move is in its final idle (the host may stop rendering after `done`). */
    get finished(){const s=steps[index];return s?.k==='idle'&&s.dur===Infinity;},
    get elapsed(){return total;},
    /** Index into the move's own steps (a reset prepended by a switch counts as −1). */
    get stepIndex(){return index-(prepended?1:0);},
    get frame():Readonly<Frame>{return F;},
    get ball():Readonly<V3>{return B;},
    /** Advances `dt` seconds (step boundaries are crossed exactly) and returns the frame. */
    step(dt:number,probe?:PreviewProbe,reduced=false):PreviewFrame{
      if(!steps.length)set(id);
      let left=dt;
      while(true){const d=durNow();if(t+left<=d||index>=steps.length-1){t+=left;break;}left-=d-t;t=d;evaluate(0,probe,reduced);finishStep();index++;enter();}
      total+=dt;return evaluate(dt,probe,reduced);
    },
    /** Reduced motion: the move's still key pose (the driver jumps there without playing; call once per move). */
    still(next:PreviewMoveId,probe?:PreviewProbe):PreviewFrame{
      set(next);const key=KEY_POSE[next];
      let i=0;while(index<steps.length-1&&i<key.step+(prepended?1:0)){const d=durNow();t=Number.isFinite(d)?d:0;evaluate(0,probe,true);finishStep();index++;enter();i++;}
      t=Math.min(key.at,durNow());return evaluate(0,probe,true);
    },
  };
}
export type PreviewDriver=ReturnType<typeof createPreviewDriver>;

export type MoveBox={minX:number;maxX:number;minY:number;maxY:number;minZ:number;maxZ:number};
const boxes=new Map<PreviewMoveId,{all:MoveBox;steps:MoveBox[]}>();
const emptyBox=():MoveBox=>({minX:Infinity,maxX:-Infinity,minY:0,maxY:1.9,minZ:Infinity,maxZ:-Infinity});
function sampleBounds(id:PreviewMoveId){
  const hit=boxes.get(id);if(hit)return hit;
  const all=emptyBox(),steps:MoveBox[]=[];
  const d=createPreviewDriver();d.set(id);
  for(let t=0;t<40&&(t===0||!d.finished);t+=1/30){
    const f=d.step(1/30),m=f.motion,yaw=m.facing??0,c=Math.cos(yaw),s=Math.sin(yaw),box=steps[d.stepIndex]??=emptyBox();
    const add=(x:number,y:number,z:number)=>{for(const b of [all,box]){b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.maxY=Math.max(b.maxY,y);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}};
    // Body extent around the root in its own frame: [left, right, back, front, top].
    let e=[.42,.42,.38,.5,1.95];
    if(m.move?.kind==='bicycle')e=[.35,.35,.95,.6,2.3];
    else if(m.move?.kind==='scissor')e=m.move.side>0?[1.05,.6,.4,1.1,1.95]:[.6,1.05,.4,1.1,1.95];
    else if(m.dive)e=m.dive.dir>0?[.4,1.45,.4,.6,1.7]:[1.45,.4,.4,.6,1.7];
    else if(m.jump)e=[.45,.45,.4,.6,1.95+m.jump.height+.35];
    else if(f.celebrate>=0)e=[.5,.5,.4,.5,2.35];
    else if(m.skill?.type==='airplane')e=[.95,.95,.55,.55,1.95];
    else if(m.skill&&SKILL_MOVES[m.skill.type].group==='keeper')e=[.6,.6,.6,.7,2.3];
    for(const [lx,lz] of [[-e[0],-e[2]],[e[1],-e[2]],[-e[0],e[3]],[e[1],e[3]]])add(f.x+lx*c+lz*s,e[4],f.z-lx*s+lz*c);
    if(f.ballVisible&&Math.hypot(f.ball.x-f.x,f.ball.z-f.z)<1.2&&f.ball.y<3)for(const q of [-R,R])add(f.ball.x+q,f.ball.y+R,f.ball.z+q);
  }
  for(let i=0;i<steps.length;i++)steps[i]??=steps[i-1]??all;
  const out={all,steps};boxes.set(id,out);return out;
}
/** Stage box that keeps the whole move in view (body poses + travel + the ball while it is near the player):
 *  e.g. the bicycle kick's height and the keeper dive's width. Cached; sampled from the driver itself. */
export function moveBounds(id:PreviewMoveId):MoveBox{return sampleBounds(id).all;}
/** The box for one step of a move (and the step after it), for a camera that follows a long chained move. */
export function stepBounds(id:PreviewMoveId,stepIndex:number,out:MoveBox=emptyBox()):MoveBox{
  const {steps,all}=sampleBounds(id),a=steps[Math.max(0,stepIndex)]??all,b=steps[Math.max(0,stepIndex)+1]??a;
  out.minX=Math.min(a.minX,b.minX);out.maxX=Math.max(a.maxX,b.maxX);out.minY=0;out.maxY=Math.max(a.maxY,b.maxY);out.minZ=Math.min(a.minZ,b.minZ);out.maxZ=Math.max(a.maxZ,b.maxZ);return out;
}
