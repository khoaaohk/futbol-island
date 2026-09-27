// Skill moves for the procedural player rig (docs/player-moves/MOVES.md; hooks in docs/bean-characters/CONTRACT.md,
// "Skill moves lane"). Pure maths, no three.js and no allocation per frame.
//
// A move is authored once for `side = +1` (the active foot is the rig's `right-*` leg, +x) and mirrored for −1.
// The rig reads `PlayerMotion.skill = {type, progress, side}` and this module writes the pose into the rig's
// one-shot reaction channels (the same channels lane B's reactions and signature moves use), so the existing leg
// solver, foot locks, spine and arm blending do the rest:
//   • legs: a rig-local ankle target per leg (x, z, lift, toe) with a weight; a weight-bearing ("hold") leg is
//     world-planted by the rig's kick-support lock, so the body can turn and travel over it;
//   • body: pelvis drop/pitch/yaw/roll, torso pitch/yaw/roll, chest arch, head pitch/yaw/roll;
//   • arms: shoulder x/z and elbow targets per arm.
// The host owns the root: it moves the player by `skillFrame` (travel + heading, in the frame the move started in)
// and the ball by `skillBall`. `applySkill` does both in one call. Every ball contact is pinned at module load:
// the touching boot's keyframe is solved from the ball path, so boot and ball meet by construction
// (tests/skill-moves.cjs checks it on the solved rig).
//
// Teaching purpose (AGENTS.md): each move is a named, real football skill with a coaching line (`teach`) and its
// history where it is verified (`history`), so a child sees HOW a dribbler beats a defender, protects the ball or
// checks their shoulder, and can name the move.

export type SkillMove='bodyFeint'|'stepover'|'scissors'|'cruyffTurn'|'dragBack'|'croqueta'|'elastico'|'roulette'|'rainbowFlick'|'shield'|'shoulderCharge'|'scan'
  // Batch 2 (docs/player-moves/MOVES.md § F): turns, finishing, defending, goalkeeping and celebrations.
  |'insideCut'|'outsideCut'|'fakeShot'|'nutmeg'|'chipShot'|'trivela'|'toePoke'|'finesseShot'|'knuckleball'|'blockTackle'|'pokeTackle'
  |'keeperThrow'|'keeperRoll'|'keeperPunt'|'airplane'|'kneeSlide'|'thankPasser'|'highFive'|'fistBump';
/** `progress` 0 → 1 over `SKILL_MOVES[type].seconds`; `side` is the active foot (−1 left rig leg, +1 right). */
export type SkillMotion={type:SkillMove;progress:number;side:-1|1};
export type SkillSurface='inside'|'outside'|'sole'|'toe'|'heel'|'flick'|'toeLift'|'laces';
/** What a move teaches (the preview groups its arrows by it). */
export type SkillGroup='dribble'|'shoot'|'defend'|'keeper'|'celebrate'|'vision';
export type SkillContact={p:number;leg:'s'|'o';surface:SkillSurface};
export type SkillSpec={
  label:string;seconds:number;group:SkillGroup;
  /** Start of the action, follow-through and recovery (anticipation runs from 0 to the first). */
  phases:readonly [number,number,number];
  contacts:readonly SkillContact[];
  priority:1|2|3;teach:string;history?:string;trigger:string;
  /** true: a ball move (skillBall returns a position); false: body only (scan, shoulder charge). */
  ball:boolean;
  /** The host may freeze progress inside this window to hold the pose (shield). */
  holdWindow?:readonly [number,number];
};
export const SKILL_BALL_RADIUS=.19;
/** Rig-frame metres from the ankle joint to the ball centre for each boot surface (σ = +1 for a +x leg). */
const SURFACE:Record<SkillSurface,(σ:number)=>[number,number,number]>={
  inside:σ=>[-σ*.2,.095,.1],outside:σ=>[σ*.2,.095,.1],sole:()=>[0,-.26,.05],toe:()=>[0,.115,.34],
  heel:()=>[0,.115,-.26],flick:()=>[0,.2,-.16],toeLift:()=>[0,.13,.3],laces:()=>[0,.03,.24],
};
export const skillSurfaceOffset=(surface:SkillSurface,legSide:number):[number,number,number]=>SURFACE[surface](legSide);
/** Reaction channel layout (mirrors REACT in player.ts; tests/skill-moves.cjs asserts they match). */
export const SKILL_CHANNELS={pelvisPitch:0,pelvisYaw:1,pelvisRoll:2,pelvisDrop:3,torsoPitch:4,torsoYaw:5,torsoRoll:6,headPitch:7,headYaw:8,headRoll:9,chestArch:10,lumbarBend:11,toesUp:12,hold:13,arm:14,leg:22,size:34} as const;

type K=number[];
const smooth=(v:number)=>{const t=v<0?0:v>1?1:v;return t*t*(3-2*t);};
/** Smoothstep keyframes [t0,v0,t1,v1,…]; holds the end values outside. */
const kf=(p:number,k:readonly number[])=>{if(p<=k[0])return k[1];for(let i=2;i<k.length;i+=2)if(p<=k[i]){const a=k[i-2];return k[i-1]+(k[i+1]-k[i-1])*smooth((p-a)/(k[i]-a||1));}return k[k.length-1];};
const PIN=NaN;
type LegDef={w:K;x?:K;z?:K;lift?:K;toe?:K};
type ArmDef={w:K;sx:K;sz:K;el:K};
type Body=Partial<Record<'pelvisDrop'|'pelvisPitch'|'pelvisYaw'|'pelvisRoll'|'torsoPitch'|'torsoYaw'|'torsoRoll'|'headPitch'|'headYaw'|'headRoll'|'chestArch',K>>;
/** Ball waypoint [p, x, y, z, ease to the next, bend]: h hold, s smooth, l linear, o ease-out (a pushed ball), b ballistic.
 *  `bend` (ballistic only, metres, + toward the side +1 leg) bows the flight sideways: a curled or swerving strike. */
type BallKey=[number,number,number,number,'h'|'s'|'l'|'o'|'b',number?];
type MoveDef={
  spec:SkillSpec;s?:LegDef;o?:LegDef;
  /** Weight-bearing leg over progress: +1 = the other (o) leg, −1 = the active (s) leg, 0 = none (gait). Stepwise. */
  hold?:K;body:Body;armS?:ArmDef;armO?:ArmDef;
  heading?:K;travelX?:K;travelZ?:K;ball?:BallKey[];squash?:[number,number][];
};
const R=SKILL_BALL_RADIUS;
// Body channels mirrored with the side (lateral): x, yaw and roll flip for a left-footed move.
const LATERAL=new Set(['pelvisYaw','pelvisRoll','torsoYaw','torsoRoll','headYaw','headRoll']);

// ------------------------------------------------------------------------------------------------ the moves
// Conventions (side +1): the active foot is the +x leg (lane x ≈ +.12), the other foot the −x leg (−.12).
// Leg x/z are rig-local ankle positions (metres), lift is the ankle height above standing (.075), toe + = pointed.
// torsoRoll − leans the chest toward +x; torsoYaw/pelvisYaw/headYaw + turn toward +x; heading + turns toward +x.
const MOVES:Record<SkillMove,MoveDef>={
  highFive:{
    spec:{label:'High five',group:'celebrate',seconds:1.5,phases:[.18,.52,.82],contacts:[],priority:1,ball:false,teach:'Acknowledge a teammate and celebrate together.',trigger:'Face a teammate and meet their raised hand.'},
    body:{torsoPitch:[0,0,.3,-.05,.52,.04,.75,0,1,0],headPitch:[0,0,.3,-.12,.65,-.08,1,0]},
    armS:{w:[0,0,.2,1,.76,1,1,0],sx:[0,-.3,.3,-2.1,.48,-2.25,.58,-2.15,.76,-1.2,1,0],sz:[0,0,.3,.08,.65,.08,1,0],el:[0,-.7,.3,-.15,.52,-.08,.68,-.3,1,-.7]},
    armO:{w:[0,0,.22,.5,.7,.5,1,0],sx:[0,0,1,0],sz:[0,0,.35,-.25,1,0],el:[0,-.25,1,-.25]},
    squash:[[.52,-.5]],
  },
  fistBump:{
    spec:{label:'Fist bump',group:'celebrate',seconds:1.35,phases:[.18,.5,.82],contacts:[],priority:1,ball:false,teach:'Encourage your teammate after the effort, not only after a goal.',trigger:'Meet a teammate hand-to-hand at chest height.'},
    body:{torsoPitch:[0,0,.4,.06,.65,.02,1,0],headPitch:[0,0,.48,.12,.75,0]},
    armS:{w:[0,0,.2,1,.78,1,1,0],sx:[0,0,.35,-1.4,.5,-1.57,.7,-1,1,0],sz:[0,0,.3,.06,.7,.06,1,0],el:[0,-.8,.35,-.2,.5,-.08,.7,-.6,1,-.8]},
    squash:[[.5,-.65]],
  },

  // Matthews feint: dip the shoulder and fake a step toward the active side (the weight really goes there), push
  // off it and take the ball away the other way with the outside of the other boot.
  bodyFeint:{
    spec:{label:'Body feint',group:'dribble',seconds:1.05,phases:[.16,.56,.7],contacts:[{p:.56,leg:'o',surface:'outside'}],priority:1,ball:true,
      teach:'Sell it with your body: make the defender lean one way, then go the other way.',
      history:'Sir Stanley Matthews made the shoulder-drop feint famous: dip one way, burst away with the outside of the other foot.',
      trigger:'A dribbler meets a defender square on, 1.5 to 3 m away.'},
    hold:[0,1,.38,1,.41,-1,.67,-1,.69,1,.8,1,.84,0],
    s:{w:[0,0,.15,0,.2,1,.42,1,.5,0],x:[.2,.12,.3,.32,.39,.42],z:[.2,0,.39,.14],lift:[.2,0,.29,.12,.39,0],toe:[.2,0,.3,.15,.39,0]},
    o:{w:[.39,0,.43,1,.72,1,.8,0],x:[.43,-.12,.5,-.02,.56,PIN,.68,-.3],z:[.43,0,.5,.2,.56,PIN,.68,.5],lift:[.43,0,.5,.07,.56,PIN,.61,.06,.68,0],toe:[.43,0,.56,-.1,.68,0]},
    body:{pelvisDrop:[0,0,.3,.1,.5,.1,.62,.05,1,0],torsoRoll:[0,0,.18,0,.38,-.46,.5,-.4,.62,.2,.82,.08,1,0],torsoYaw:[0,0,.38,.32,.5,.26,.62,-.24,.85,-.06,1,0],pelvisRoll:[0,0,.38,-.07,.5,-.06,.62,.05,1,0],
      pelvisYaw:[0,0,.36,.14,.52,.12,.64,-.18,1,0],torsoPitch:[0,.05,.4,.14,.62,.3,.85,.22,1,.08],headPitch:[0,.15,.3,.1,.52,.3,.62,0,1,0],headRoll:[0,0,.38,.2,.6,0]},
    armS:{w:[0,0,.18,1,.75,1,.95,0],sx:[0,0,.38,-.3,.62,.5,.8,-.4],sz:[0,.2,.38,.95,.62,.35],el:[0,-.5,.38,-.6,.62,-1.2]},
    armO:{w:[0,0,.18,1,.75,1,.95,0],sx:[0,0,.38,.35,.62,-.6,.8,.4],sz:[0,.2,.38,.4,.62,.55,.8,.3],el:[0,-.5,.62,-1.3]},
    heading:[0,0,.56,0,.78,-.5,1,-.4],travelX:[0,0,.16,0,.42,.1,.56,.06,1,-.62],travelZ:[0,0,.42,.06,.56,.1,1,.95],
    ball:[[0,-.1,R,.5,'h'],[.56,-.1,R,.5,'o'],[1,-.8,R,1.45,'h']],squash:[[.4,-1.4],[.56,.9]],
  },
  // Stepover (pedalada): the active boot goes over the top and round the front of the ball, lands beside it and
  // the body leans that way; the other boot takes it away with the outside.
  stepover:{
    spec:{label:'Stepover',group:'dribble',seconds:1.15,phases:[.14,.44,.64],contacts:[{p:.58,leg:'o',surface:'outside'}],priority:1,ball:true,
      teach:'Your foot goes round the ball, not on it. Lean with it, then go the other way.',
      history:'Called the pedalada in Brazil; Ronaldo Nazário and Cristiano Ronaldo made the stepover a trademark.',
      trigger:'1v1 at walking or jogging pace with the defender in front.'},
    hold:[0,1,.43,1,.45,-1,.64,-1,.66,1,.8,1,.84,0],
    s:{w:[0,0,.12,0,.16,1,.45,1,.52,0],x:[.16,.12,.24,-.06,.31,-.22,.37,.02,.44,.34],z:[.16,0,.24,.2,.31,.44,.37,.56,.44,.42],lift:[.16,0,.24,.24,.31,.43,.37,.26,.44,0],toe:[.16,0,.3,.35,.44,0]},
    o:{w:[.44,0,.47,1,.7,1,.78,0],x:[.47,-.12,.53,-.02,.58,PIN,.65,-.3],z:[.47,0,.53,.2,.58,PIN,.65,.48],lift:[.47,0,.53,.08,.58,PIN,.61,.06,.65,0]},
    body:{pelvisDrop:[0,0,.3,.06,.46,.08,.6,.04,1,0],torsoRoll:[0,0,.16,.05,.3,-.12,.44,-.28,.56,-.2,.68,.14,.85,.05,1,0],torsoYaw:[0,0,.3,.15,.44,.3,.58,.1,.7,-.2,1,0],
      pelvisYaw:[0,0,.3,.2,.44,.15,.66,-.15,1,0],torsoPitch:[0,.06,.3,.12,.6,.18,.85,.18,1,.08],headPitch:[0,.3,.5,.3,.62,.1,1,0]},
    armS:{w:[0,0,.14,1,.78,1,.95,0],sx:[0,0,.3,-.3,.44,.1,.68,.3,.85,-.3],sz:[0,.25,.3,.6,.44,.8,.68,.35],el:[0,-.6,.44,-.5,.68,-1.1]},
    armO:{w:[0,0,.14,1,.78,1,.95,0],sx:[0,0,.3,.2,.44,-.1,.68,-.45,.85,.3],sz:[0,.25,.3,.5,.44,.3,.68,.5,.85,.3],el:[0,-.6,.68,-1.2]},
    heading:[0,0,.58,0,.8,-.5,1,-.4],travelX:[0,0,.44,.06,.58,.03,1,-.6],travelZ:[0,0,.3,.08,.58,.14,1,.95],
    ball:[[0,-.18,R,.5,'h'],[.58,-.18,R,.5,'o'],[1,-.95,R,1.45,'h']],squash:[[.45,-1.6],[.58,.9]],
  },
  // Scissors: the active boot swings round the FRONT of the ball the other way (outside to inside) and lands across
  // it, the body leans across; then weight goes back to the other foot and the SAME boot takes it out with the outside.
  scissors:{
    spec:{label:'Scissors',group:'dribble',seconds:1.15,phases:[.14,.44,.62],contacts:[{p:.6,leg:'s',surface:'outside'}],priority:2,ball:true,
      teach:'Swing your foot round the front of the ball and across, then take it out the other way.',
      trigger:'1v1 when the defender has already bought one stepover.'},
    hold:[0,1,.41,1,.43,-1,.51,-1,.53,1,.71,1,.73,-1,.84,-1,.88,0],
    s:{w:[0,0,.12,0,.16,1,.43,1,.48,0,.52,0,.55,1,.76,1,.84,0],x:[.16,.12,.25,.32,.33,.1,.41,-.34,.51,-.34,.56,-.28,.6,PIN,.72,.3],z:[.16,0,.25,.26,.33,.62,.41,.4,.51,.4,.6,PIN,.72,.62],
      lift:[.16,0,.25,.14,.33,.2,.41,0,.51,0,.55,.06,.6,PIN,.66,.05,.72,0],toe:[.16,0,.3,.25,.41,0,.6,-.1,.72,0]},
    body:{pelvisDrop:[0,0,.4,.08,.6,.05,1,0],torsoRoll:[0,0,.2,-.06,.42,.26,.5,.22,.62,-.14,.85,-.05,1,0],torsoYaw:[0,0,.3,-.2,.44,-.3,.6,.1,.75,.2,1,0],
      pelvisYaw:[0,0,.3,-.1,.44,-.2,.62,.12,1,0],torsoPitch:[0,.06,.4,.12,.62,.2,1,.08],headPitch:[0,.3,.5,.3,.64,.1,1,0]},
    armS:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.3,.25,.44,-.2,.62,-.3,.8,.3],sz:[0,.25,.3,.7,.44,.35,.62,.45],el:[0,-.6,.62,-1.1]},
    armO:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.3,-.2,.44,.2,.62,.35,.8,-.3],sz:[0,.25,.3,.35,.44,.75,.62,.35],el:[0,-.6,.44,-.5,.62,-1.1]},
    heading:[0,0,.6,0,.8,.5,1,.4],travelX:[0,0,.42,-.06,.6,-.03,1,.6],travelZ:[0,0,.3,.08,.6,.14,1,.95],
    ball:[[0,.02,R,.5,'h'],[.6,.02,R,.5,'o'],[1,.95,R,1.45,'h']],squash:[[.43,-1.5],[.6,.9]],
  },
  // Cruyff turn: shape to pass or cross, then drag the ball back behind the standing leg with the inside of the
  // boot, pivot on the standing foot and go the other way.
  cruyffTurn:{
    spec:{label:'Cruyff turn',group:'dribble',seconds:1.3,phases:[.2,.46,.72],contacts:[{p:.36,leg:'s',surface:'inside'}],priority:1,ball:true,
      teach:'Pretend to kick, hide the ball behind your standing leg, then turn away.',
      history:'Johan Cruyff first did it at the 1974 World Cup against Sweden, leaving defender Jan Olsson behind.',
      trigger:'A winger with a defender blocking the pass or cross in front.'},
    hold:[0,1,.72,1,.76,0],
    s:{w:[0,0,.06,0,.1,1,.7,1,.78,0],x:[.1,.12,.22,.18,.31,.34,.36,PIN,.44,.16,.56,.06,.7,.12],z:[.1,0,.22,-.36,.31,.24,.36,PIN,.44,.02,.56,-.04,.7,.2],
      lift:[.1,0,.22,.34,.31,.12,.36,PIN,.42,.06,.5,.12,.62,.08,.7,0],toe:[.1,0,.22,.45,.31,.05,.36,-.05,.5,0]},
    body:{pelvisDrop:[0,0,.2,.06,.36,.09,.6,.08,.8,.03,1,0],torsoPitch:[0,.05,.22,-.12,.36,.22,.6,.16,.8,.22,1,.1],torsoYaw:[0,0,.22,-.4,.34,.12,.46,-.25,.62,-.3,.8,0],
      pelvisYaw:[0,0,.22,-.25,.34,.05,.5,-.2,.7,0],torsoRoll:[0,0,.22,.1,.36,-.06,.6,.12,.85,0],headPitch:[0,.25,.2,.3,.36,.4,.5,.1,.62,-.05,1,0],headYaw:[0,0,.4,0,.52,-.45,.66,-.2,.8,0]},
    armS:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.22,.55,.34,-.2,.6,.3,.8,-.3],sz:[0,.2,.22,.6,.36,.35,.6,.45],el:[0,-.5,.22,-.5,.6,-1.1]},
    armO:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.22,-.7,.34,.3,.6,-.3,.8,.3],sz:[0,.2,.22,1.05,.36,.6,.6,.5],el:[0,-.5,.22,-.6,.6,-1.1]},
    heading:[0,0,.42,0,.72,-Math.PI,1,-Math.PI],travelX:[0,0,.3,0,.46,-.06,.72,-.1,1,-.18],travelZ:[0,0,.46,-.02,.72,-.1,1,-.75],
    ball:[[0,.14,R,.34,'h'],[.36,.14,R,.34,'l'],[.5,.13,R,-.12,'o'],[.72,-.25,R,-.62,'o'],[1,-.25,R,-1.3,'h']],squash:[[.36,.8]],
  },
  // Drag-back (pull-back): sole on top of the ball, roll it back under the body while stepping back, then turn.
  dragBack:{
    spec:{label:'Drag-back',group:'dribble',seconds:1.1,phases:[.14,.34,.6],contacts:[{p:.26,leg:'s',surface:'sole'},{p:.46,leg:'s',surface:'sole'}],priority:1,ball:true,
      teach:'Sole on top, pull it back: the defender\'s tackle hits nothing.',
      history:'Ferenc Puskás\'s drag-back beat England captain Billy Wright at Wembley in 1953 (England 3–6 Hungary).',
      trigger:'A defender lunges in, or the carrier needs to change direction.'},
    hold:[0,1,.62,1,.66,0],
    s:{w:[0,0,.1,0,.14,1,.62,1,.72,0],x:[.14,.12,.26,PIN,.46,PIN,.58,.14],z:[.14,0,.2,.22,.26,PIN,.46,PIN,.58,.04],lift:[.14,0,.2,.44,.26,PIN,.46,PIN,.53,.2,.6,0],toe:[.14,0,.22,-.3,.46,-.3,.58,0]},
    body:{pelvisDrop:[0,0,.2,.03,.4,.08,.62,.06,1,0],torsoPitch:[0,.06,.26,-.04,.46,-.1,.62,.12,.85,.18,1,.08],torsoYaw:[0,0,.3,.08,.5,.12,.64,-.3,.8,0],pelvisYaw:[0,0,.5,.05,.64,-.25,.8,0],
      headPitch:[0,.3,.26,.45,.5,.35,.66,0,1,0],headYaw:[0,0,.5,0,.6,-.4,.75,0]},
    armS:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.26,-.25,.46,-.35,.66,.3,.85,-.3],sz:[0,.2,.26,.5,.46,.6,.66,.4],el:[0,-.5,.46,-.7,.66,-1.1]},
    armO:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.26,-.2,.46,-.3,.66,-.4,.85,.3],sz:[0,.2,.26,.45,.46,.6,.66,.5],el:[0,-.5,.46,-.7,.66,-1.1]},
    heading:[0,0,.46,0,.68,-2.8,1,-2.9],travelX:[0,0,.46,0,.68,-.06,1,-.18],travelZ:[0,0,.26,.02,.46,-.2,.68,-.26,1,-.7],
    ball:[[0,.12,R,.44,'h'],[.26,.12,R,.44,'l'],[.46,.12,R,.02,'o'],[.68,-.12,R,-.34,'o'],[1,-.25,R,-1.15,'h']],squash:[[.26,-.9],[.62,.8]],
  },
  // La Croqueta: the inside of one boot pushes the ball across to the inside of the other, past the tackle.
  croqueta:{
    spec:{label:'La Croqueta',group:'dribble',seconds:.95,phases:[.2,.56,.7],contacts:[{p:.3,leg:'s',surface:'inside'},{p:.56,leg:'o',surface:'inside'}],priority:2,ball:true,
      teach:'Fast feet: the ball goes from one foot to the other, right past the tackle.',
      history:'Michael Laudrup used it first; Andrés Iniesta made La Croqueta his signature.',
      trigger:'Tight space, a defender stepping in to tackle.'},
    hold:[0,1,.36,1,.38,-1,.64,-1,.67,1,.78,1,.82,0],
    s:{w:[0,0,.18,0,.22,1,.38,1,.46,0],x:[.22,.12,.3,PIN,.36,.08],z:[.22,.04,.3,PIN,.36,.3],lift:[.22,0,.26,.05,.3,PIN,.33,.04,.36,0],toe:[.22,0,.3,-.05,.36,0]},
    o:{w:[.37,0,.41,1,.7,1,.78,0],x:[.41,-.12,.47,-.08,.56,PIN,.66,-.3],z:[.41,0,.56,PIN,.66,.45],lift:[.41,0,.48,.06,.56,PIN,.6,.04,.66,0]},
    body:{pelvisDrop:[0,0,.2,.08,.6,.08,1,0],torsoRoll:[0,0,.2,-.05,.4,.12,.6,.1,1,0],torsoYaw:[0,0,.3,-.12,.56,.1,1,0],torsoPitch:[0,.08,.3,.14,.6,.14,1,.08],headPitch:[0,.35,.6,.35,.8,.1,1,0]},
    armS:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.3,-.2,.56,.2,.8,-.2],sz:[0,.2,.3,.5,.56,.55],el:[0,-.6,.56,-.9]},
    armO:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.3,.2,.56,-.2,.8,.2],sz:[0,.2,.3,.55,.56,.4],el:[0,-.6,.56,-.9]},
    heading:[0,0,.6,0,1,-.15],travelX:[0,0,.3,0,.56,-.18,.8,-.35,1,-.42],travelZ:[0,0,.56,.08,1,.7],
    ball:[[0,.14,R,.36,'h'],[.3,.14,R,.36,'l'],[.56,-.26,R,.42,'o'],[1,-.48,R,1.15,'h']],squash:[[.3,.6],[.56,.6]],
  },
  // Elastico (flip-flap): the outside of the boot pushes the ball out, then the ankle whips round and the inside of
  // the same boot snaps it back across.
  elastico:{
    spec:{label:'Elastico',group:'dribble',seconds:1,phases:[.14,.5,.64],contacts:[{p:.28,leg:'s',surface:'outside'},{p:.5,leg:'s',surface:'inside'}],priority:3,ball:true,
      teach:'Out, then in, with the same foot. It needs soft ankles and a lot of practice.',
      history:'Rivelino made the elastico famous (he credited Sérgio Echigo); Ronaldinho brought it back.',
      trigger:'Flair move; a defender close and square on.'},
    hold:[0,1,.69,1,.71,-1,.8,-1,.84,0],
    s:{w:[0,0,.14,0,.18,1,.74,1,.82,0],x:[.18,.1,.28,PIN,.4,.12,.5,PIN,.6,-.05,.68,-.18],z:[.18,.05,.28,PIN,.5,PIN,.6,.4,.68,.34],lift:[.18,.02,.28,PIN,.38,.06,.5,PIN,.56,.06,.66,.04,.7,0],toe:[.2,0,.28,.1,.5,-.1,.6,0]},
    body:{pelvisDrop:[0,0,.3,.09,.6,.07,1,0],torsoRoll:[0,0,.2,-.12,.42,-.48,.5,-.3,.6,.32,.8,.1,1,0],torsoYaw:[0,0,.42,.32,.56,-.26,1,0],pelvisYaw:[0,0,.42,.15,.56,-.14,1,0],pelvisRoll:[0,0,.42,-.07,.6,.06,1,0],
      torsoPitch:[0,.06,.4,.12,.6,.18,1,.08],headPitch:[0,.3,.5,.35,.7,.1,1,0]},
    armS:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.4,.3,.55,-.3,.8,.2],sz:[0,.2,.4,.75,.55,.3],el:[0,-.5,.4,-.6,.55,-1]},
    armO:{w:[0,0,.14,1,.8,1,.95,0],sx:[0,0,.4,-.3,.55,.3,.8,-.2],sz:[0,.2,.4,.3,.55,.7],el:[0,-.5,.4,-1,.55,-.6]},
    heading:[0,0,.55,0,.85,-.4,1,-.3],travelX:[0,0,.3,.04,.5,.06,1,-.55],travelZ:[0,0,.5,.05,1,.8],
    ball:[[0,.08,R,.4,'h'],[.28,.08,R,.4,'o'],[.46,.2,R,.45,'l'],[.5,.21,R,.46,'o'],[1,-.72,R,1.3,'h']],squash:[[.28,.5],[.5,.8]],
  },
  // Roulette (Marseille turn): sole drag, spin with the back to the defender, the other sole drags it on round.
  roulette:{
    spec:{label:'Roulette',group:'dribble',seconds:1.3,phases:[.12,.62,.8],contacts:[{p:.26,leg:'s',surface:'sole'},{p:.52,leg:'o',surface:'sole'}],priority:3,ball:true,
      teach:'Keep your body between the ball and the defender while you spin round.',
      history:'Zinedine Zidane and Diego Maradona made the roulette (Marseille turn) famous.',
      trigger:'A defender coming in from the side.'},
    hold:[0,1,.37,1,.39,-1,.64,-1,.67,1,.78,1,.82,0],
    s:{w:[0,0,.14,0,.18,1,.4,1,.46,0],x:[.18,.12,.26,PIN,.36,.14],z:[.18,.05,.26,PIN,.36,-.06],lift:[.18,0,.22,.42,.26,PIN,.33,.26,.37,0],toe:[.18,0,.22,-.3,.34,0]},
    o:{w:[.37,0,.41,1,.7,1,.78,0],x:[.41,-.12,.52,PIN,.64,-.14],z:[.41,0,.52,PIN,.64,.1],lift:[.41,0,.47,.42,.52,PIN,.6,.26,.66,0],toe:[.41,0,.47,-.3,.6,0]},
    body:{pelvisDrop:[0,0,.2,.06,.6,.07,1,0],torsoPitch:[0,.05,.3,.1,.6,.1,1,.05],headPitch:[0,.3,.6,.3,.8,.05,1,0],torsoRoll:[0,0,.3,-.08,.6,.06,1,0]},
    armS:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.3,-.2,.6,.1],sz:[0,.2,.3,.95,.6,.8,.8,.3],el:[0,-.5,.3,-.4,.8,-.9]},
    armO:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.3,.1,.6,-.2],sz:[0,.2,.3,.8,.6,.95,.8,.3],el:[0,-.5,.3,-.4,.8,-.9]},
    heading:[0,0,.14,0,.26,.5,.4,2.3,.52,3.7,.64,5.4,.76,6.2832,1,6.2832],travelX:[0,0,.2,0,.52,.2,.76,.4,1,.5],travelZ:[0,0,.52,-.04,.76,.1,1,.6],
    ball:[[0,.1,R,.36,'h'],[.26,.1,R,.36,'l'],[.4,.18,R,.2,'l'],[.52,.3,R,.16,'l'],[.64,.44,R,.3,'o'],[1,.56,R,1.1,'h']],squash:[[.26,-.6],[.52,-.6]],
  },
  // Rainbow flick (lambreta): the ball is trapped behind the active heel, the other boot rolls it up the back of the
  // active calf, then the active heel flicks it up and over the head; land, look up and run on to it.
  rainbowFlick:{
    spec:{label:'Rainbow flick',group:'dribble',seconds:2.4,phases:[.1,.42,.56],contacts:[{p:.14,leg:'o',surface:'toe'},{p:.36,leg:'o',surface:'toeLift'},{p:.43,leg:'s',surface:'flick'}],priority:3,ball:true,
      teach:'Roll it up the back of your leg, flick your heel, and look up to find it. A trick for practice: in a match it only works on a flat-footed defender.',
      history:'Known in Brazil as the lambreta; Jay-Jay Okocha and Neymar have done it in top matches.',
      trigger:'Flair: the ball at the feet, running straight at a defender who is standing still.'},
    hold:[0,1,.08,1,.1,-1,.39,-1,.41,1,.6,1,.62,-1,.74,-1,.78,0],
    s:{w:[0,0,.02,1,.1,1,.16,0,.37,0,.39,1,.64,1,.72,0],x:[0,.12,.08,.1,.4,.1,.43,PIN,.5,.1,.6,.12],z:[0,0,.08,.26,.4,.26,.43,PIN,.5,-.2,.6,.08],
      lift:[0,0,.05,.08,.08,0,.4,0,.43,PIN,.5,.46,.6,0],toe:[.39,0,.43,.3,.5,.4,.6,0]},
    o:{w:[.08,0,.11,1,.39,1,.46,0],x:[.11,-.12,.14,PIN,.36,PIN,.39,-.1],z:[.11,0,.14,PIN,.36,PIN,.39,-.1],lift:[.11,0,.125,.06,.14,PIN,.36,PIN,.39,0],toe:[.11,0,.14,-.2,.36,-.5,.39,0]},
    body:{torsoPitch:[0,.05,.1,.15,.36,.3,.44,.35,.56,.05,.66,-.16,.82,-.12,1,.12],headPitch:[0,.3,.36,.35,.46,-.2,.6,-.45,.85,-.15,1,.1],pelvisDrop:[0,0,.1,.06,.36,.08,.44,.04,.6,0],
      torsoYaw:[0,0,.2,.12,.4,.1,.5,0]},
    armS:{w:[0,0,.08,1,.8,1,.95,0],sx:[0,0,.3,-.2,.44,-.5,.6,-.2,.8,-.3],sz:[0,.2,.3,.55,.44,.8,.6,.4],el:[0,-.5,.44,-.3,.6,-.9]},
    armO:{w:[0,0,.08,1,.8,1,.95,0],sx:[0,0,.3,-.2,.44,-.5,.6,-.2,.8,.3],sz:[0,.2,.3,.55,.44,.8,.6,.4],el:[0,-.5,.44,-.3,.6,-.9]},
    travelZ:[0,0,.6,0,.8,.06,1,.25],
    ball:[[0,.06,R,-.01,'h'],[.14,.06,R,-.01,'s'],[.36,.08,.4,-.02,'s'],[.43,.08,.42,-.01,'l'],[.47,.07,1.16,-.48,'b'],[.96,.04,R,.74,'o'],[1,.03,R,.9,'h']],squash:[[.4,-.8],[.43,1.2]],
  },
  // Shield (hold-up): low, wide, back and side to the defender on the active side, that arm out for feel (not a
  // push), the ball on the far boot. Freeze progress inside holdWindow to keep holding.
  shield:{
    spec:{label:'Shield',group:'dribble',seconds:1.6,phases:[.2,.8,.9],contacts:[],priority:1,ball:true,holdWindow:[.2,.8],
      teach:'Get low, make yourself big, arm out to feel the defender (no pushing), ball on your far foot.',
      trigger:'The carrier pressured from behind; a striker holding the ball up.'},
    hold:[0,-1,.08,-1,.1,1,.92,1,.96,0],
    o:{w:[0,0,.01,1,.1,1,.16,0],x:[0,-.12,.08,-.26],z:[0,0,.08,.1],lift:[0,0,.05,.06,.08,0]},
    s:{w:[.08,0,.11,1,.84,1,.98,0],x:[.11,.12,.2,.34],z:[.11,0,.2,-.1],lift:[.11,0,.16,.07,.2,0]},
    body:{pelvisDrop:[0,0,.2,.14,.8,.14,1,0],torsoYaw:[0,0,.2,-.3,.8,-.3,1,0],pelvisYaw:[0,0,.2,-.12,.8,-.12,1,0],torsoRoll:[0,0,.2,-.12,.8,-.12,1,0],torsoPitch:[0,.04,.2,.22,.8,.22,1,.04],
      headPitch:[0,.1,.2,.3,.8,.3,1,0],headYaw:[.2,0,.34,.5,.46,.1,.6,.1,.7,.45,.8,0]},
    armS:{w:[0,0,.18,1,.82,1,.95,0],sx:[0,0,.2,.75,.8,.75],sz:[0,.2,.2,.95,.8,.95],el:[0,-.5,.2,-.45,.8,-.45]},
    armO:{w:[0,0,.18,1,.82,1,.95,0],sx:[0,0,.2,-.1,.8,-.1],sz:[0,.2,.2,.45,.8,.45],el:[0,-.5,.2,-1,.8,-1]},
    heading:[0,0,.2,-.7,.8,-.7,1,-.6],
    ball:[[0,-.12,R,.42,'s'],[.2,-.32,R,.26,'h'],[1,-.32,R,.26,'h']],
  },
  // Fair charge (Law 12): shoulder to shoulder, arms in, ball within playing distance, both feet on the ground.
  shoulderCharge:{
    spec:{label:'Shoulder challenge',group:'defend',seconds:.9,phases:[.25,.45,.7],contacts:[],priority:2,ball:false,
      teach:'Shoulder to shoulder, arms in, ball close: that is a fair challenge (Law 12). No pushing with hands or elbows.',
      trigger:'Two players racing side by side for a loose ball.'},
    hold:[0,1,.2,1,.23,-1,.72,-1,.76,0],
    s:{w:[0,0,.06,1,.24,1,.3,0],x:[.06,.12,.21,.3],z:[.06,0,.21,.08],lift:[.06,0,.14,.07,.21,0]},
    o:{w:[.22,0,.26,1,.7,1,.8,0],x:[.26,-.12,.45,-.2,.6,-.18],z:[.26,0,.45,-.06,.6,.1],lift:[.26,0,.5,.03,.6,0]},
    body:{pelvisDrop:[0,0,.25,.1,.5,.1,.8,0],torsoRoll:[0,0,.25,-.42,.4,-.48,.6,-.2,.85,0],torsoYaw:[0,0,.25,.26,.45,.3,.8,0],pelvisRoll:[0,0,.3,-.06,.6,0],torsoPitch:[0,.05,.3,.14,.6,.1,1,.04],headRoll:[0,0,.3,.18,.7,0]},
    armS:{w:[0,0,.12,1,.75,1,.9,0],sx:[0,0,.25,.05,.6,.05],sz:[0,.18,.25,.08,.6,.1],el:[0,-.5,.25,-1.45,.6,-1.3]},
    armO:{w:[0,0,.12,1,.75,1,.9,0],sx:[0,0,.25,-.2,.6,.1],sz:[0,.2,.25,.6,.6,.45],el:[0,-.5,.25,-.8,.6,-.9]},
    travelX:[0,0,.25,.06,.4,.14,.6,.12,1,.12],travelZ:[0,0,1,.5],squash:[[.35,-1.2]],
  },
  // Scan (shoulder check): look over one shoulder, back to the ball, over the other. Legs free: overlays any gait.
  scan:{
    spec:{label:'Scan',group:'vision',seconds:1.4,phases:[.12,.5,.92],contacts:[],priority:1,ball:false,
      teach:'Look before you get it: check your shoulder so you know where your teammates and the space are.',
      history:'Research by Geir Jordet found top midfielders scan about every two seconds before receiving, and complete more forward passes when they do.',
      trigger:'About a second before a pass arrives, or a midfielder when the ball is far away.'},
    body:{headYaw:[0,0,.12,0,.26,.6,.38,.56,.46,0,.58,0,.7,-.6,.82,-.56,.92,0],torsoYaw:[0,0,.26,.62,.38,.58,.46,0,.58,0,.7,-.62,.82,-.58,.92,0],
      headPitch:[0,0,.26,-.08,.4,-.06,.46,0,.7,-.08,.84,-.06,.92,0],pelvisYaw:[0,0,.26,.16,.4,.14,.46,0,.7,-.16,.84,-.14,.92,0]},
  },
  // ======================================================================================== batch 2 (MOVES.md § F)
  // ---------------------------------------------------------------------------------- turns and ball mastery
  // Inside cut (inside hook): plant the other boot beside the ball, hook the inside of the active boot round it and
  // cut it sharply across the body; the body follows it the other way.
  insideCut:{
    spec:{label:'Inside cut',group:'dribble',seconds:1,phases:[.2,.46,.62],contacts:[{p:.42,leg:'s',surface:'inside'}],priority:1,ball:true,
      teach:'Hook the inside of your foot round the ball and cut it across your body: a sharp change of direction leaves the defender running the wrong way.',
      trigger:'A dribbler with a defender running alongside or closing from the front.'},
    hold:[0,-1,.21,-1,.23,1,.5,1,.52,-1,.6,-1,.64,0],
    o:{w:[.04,0,.08,1,.5,1,.6,0],x:[.08,-.12,.21,-.22],z:[.08,0,.21,.34],lift:[.08,0,.14,.08,.21,0]},
    s:{w:[.21,0,.25,1,.54,1,.62,0],x:[.25,.12,.34,.36,.42,PIN,.5,.02],z:[.25,0,.34,.5,.42,PIN,.5,.5],lift:[.25,0,.34,.1,.42,PIN,.46,.05,.5,0],toe:[.25,0,.34,.1,.42,-.15,.5,0]},
    body:{pelvisDrop:[0,0,.24,.08,.46,.1,.7,.03,1,0],torsoRoll:[0,0,.2,-.08,.42,.22,.6,.3,.8,.1,1,0],torsoYaw:[0,0,.3,.1,.44,-.3,.62,-.35,1,0],pelvisYaw:[0,0,.44,-.15,.62,-.2,1,0],
      torsoPitch:[0,.06,.3,.16,.5,.2,.8,.16,1,.08],headPitch:[0,.25,.4,.4,.6,.1,1,0]},
    armS:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.4,-.35,.62,.3],sz:[0,.25,.42,.45,.62,.35],el:[0,-.6,.42,-.8,.62,-1.1]},
    armO:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.4,.3,.62,-.4],sz:[0,.25,.42,.8,.62,.5],el:[0,-.6,.62,-1.1]},
    heading:[0,0,.4,0,.62,-1.05,1,-1.2],travelX:[0,0,.42,-.04,.62,-.2,1,-.85],travelZ:[0,0,.2,.08,.42,.14,.62,.28,1,.5],
    ball:[[0,.1,R,.52,'h'],[.42,.1,R,.52,'o'],[1,-1.15,R,.95,'h']],squash:[[.23,-.8],[.42,.8]],
  },
  // Outside cut (outside hook): the active boot crosses in front of the ball and pushes it away with the outside,
  // the body leans after it and bursts that way; the body stays between the defender and the ball.
  outsideCut:{
    spec:{label:'Outside cut',group:'dribble',seconds:1,phases:[.18,.44,.6],contacts:[{p:.4,leg:'s',surface:'outside'}],priority:1,ball:true,
      teach:'Push it away with the outside of your foot and go with it: your body stays between the defender and the ball.',
      trigger:'A dribbler with space on the side of the ball away from the defender.'},
    hold:[0,1,.5,1,.52,-1,.6,-1,.64,0],
    s:{w:[.08,0,.14,1,.58,1,.66,0],x:[.14,.12,.26,-.02,.4,PIN,.5,.3],z:[.14,0,.26,.34,.4,PIN,.5,.58],lift:[.14,0,.26,.1,.4,PIN,.46,.06,.52,0],toe:[.14,0,.26,.2,.4,.3,.52,0]},
    body:{pelvisDrop:[0,0,.2,.07,.45,.09,1,0],torsoRoll:[0,0,.2,.1,.4,-.25,.6,-.3,.8,-.1,1,0],torsoYaw:[0,0,.26,-.2,.42,.25,.62,.3,1,0],pelvisYaw:[0,0,.3,-.1,.5,.18,1,0],
      torsoPitch:[0,.06,.3,.14,.6,.2,1,.08],headPitch:[0,.25,.4,.4,.6,.1,1,0]},
    armS:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.4,.3,.62,-.4],sz:[0,.25,.42,.8,.62,.5],el:[0,-.6,.62,-1.1]},
    armO:{w:[0,0,.15,1,.8,1,.95,0],sx:[0,0,.4,-.35,.62,.3],sz:[0,.25,.42,.45,.62,.35],el:[0,-.6,.42,-.8,.62,-1.1]},
    heading:[0,0,.38,0,.6,.95,1,1.05],travelX:[0,0,.4,.04,.6,.25,1,.8],travelZ:[0,0,.4,.1,.6,.28,1,.55],
    ball:[[0,.05,R,.5,'h'],[.4,.05,R,.5,'o'],[1,1.15,R,1.05,'h']],squash:[[.18,-.6],[.4,.8]],
  },
  // Fake shot (shot fake, then an inside cut): plant as if to shoot, full back-swing, the boot stops over the ball
  // and lands in front of it; then its inside cuts the ball back across the body and he goes the other way.
  fakeShot:{
    spec:{label:'Fake shot',group:'dribble',seconds:1.35,phases:[.14,.52,.66],contacts:[{p:.56,leg:'s',surface:'inside'}],priority:1,ball:true,
      teach:'Shape to shoot and swing, but stop your foot over the ball. When the defender blocks or dives in, cut it inside and go.',
      trigger:'In shooting range with a defender stretching or sliding to block the shot.'},
    hold:[0,-1,.14,-1,.16,1,.62,1,.64,-1,.74,-1,.78,0],
    o:{w:[.02,0,.06,1,.6,1,.7,0],x:[.06,-.12,.14,-.28],z:[.06,0,.14,.3],lift:[.06,0,.1,.08,.14,0]},
    s:{w:[.14,0,.18,1,.66,1,.74,0],x:[.18,.12,.3,.16,.4,.3,.47,.38,.56,PIN,.64,.02],z:[.18,0,.3,-.4,.4,.3,.47,.68,.56,PIN,.64,.45],
      lift:[.18,0,.3,.36,.4,.25,.47,.1,.52,.07,.56,PIN,.61,.04,.66,0],toe:[.18,0,.3,.5,.44,.3,.52,0,.56,-.15,.66,0]},
    body:{pelvisDrop:[0,0,.16,.06,.44,.08,.62,.1,.8,.04,1,0],torsoPitch:[0,.05,.3,.1,.44,.24,.6,.2,.85,.16,1,.06],headPitch:[0,.3,.44,.45,.6,.3,.8,.05,1,0],
      torsoRoll:[0,0,.3,-.1,.46,.05,.6,.28,.8,.1,1,0],torsoYaw:[0,0,.3,.2,.46,-.05,.6,-.3,.78,-.35,1,0],pelvisYaw:[0,0,.3,.12,.5,0,.66,-.2,1,0]},
    armS:{w:[0,0,.12,1,.82,1,.95,0],sx:[0,0,.3,.45,.46,-.3,.62,.3,.8,-.2],sz:[0,.25,.3,.6,.46,.45,.62,.4],el:[0,-.5,.3,-.5,.62,-1.1]},
    armO:{w:[0,0,.12,1,.82,1,.95,0],sx:[0,0,.3,-.45,.46,.3,.62,-.35,.8,.3],sz:[0,.25,.3,1.1,.46,.7,.62,.5],el:[0,-.5,.3,-.4,.62,-1.1]},
    heading:[0,0,.54,0,.72,-1.3,1,-1.45],travelX:[0,0,.56,-.04,.72,-.25,1,-.9],travelZ:[0,0,.14,.06,.56,.12,.72,.2,1,.28],
    ball:[[0,.1,R,.58,'h'],[.56,.1,R,.58,'o'],[1,-1.2,R,.55,'h']],squash:[[.16,-.7],[.47,.9],[.56,.6]],
  },
  // Nutmeg: sell a little dip, then side-foot the ball straight on (through the defender's legs) and run round him
  // to collect it.
  nutmeg:{
    spec:{label:'Nutmeg',group:'dribble',seconds:1.6,phases:[.18,.36,.6],contacts:[{p:.34,leg:'s',surface:'inside'}],priority:2,ball:true,
      teach:'Watch the defender\'s feet: when they open, slide the ball through the legs and run round to collect it.',
      trigger:'A tight 1v1 with the defender square on and the feet wide apart.'},
    hold:[0,-1,.12,-1,.14,1,.42,1,.46,0],
    o:{w:[.02,0,.06,1,.42,1,.5,0],x:[.06,-.12,.14,-.24],z:[.06,0,.14,.3],lift:[.06,0,.1,.07,.14,0]},
    s:{w:[.12,0,.16,1,.44,1,.52,0],x:[.16,.12,.26,.32,.34,PIN,.42,.24],z:[.16,0,.26,.12,.34,PIN,.42,.62],lift:[.16,0,.26,.12,.34,PIN,.42,.06,.46,0],toe:[.16,0,.26,-.2,.34,-.25,.46,0]},
    body:{pelvisDrop:[0,0,.16,.08,.34,.08,.6,.05,1,0],torsoRoll:[0,0,.1,-.2,.2,-.1,.34,.05,.5,0],torsoPitch:[0,.08,.2,.15,.34,.2,.6,.26,.85,.2,1,.1],headPitch:[0,.3,.34,.4,.5,.15,1,0],torsoYaw:[0,0,.2,.15,.34,.05,.5,0]},
    armS:{w:[0,0,.1,1,.5,1,.62,0],sx:[0,0,.2,-.3,.34,.2],sz:[0,.25,.2,.55,.34,.4],el:[0,-.6,.34,-.9]},
    armO:{w:[0,0,.1,1,.5,1,.62,0],sx:[0,0,.2,.3,.34,-.3],sz:[0,.25,.2,.4,.34,.7],el:[0,-.6,.34,-.9]},
    heading:[0,0,.38,0,.5,-.55,.72,-.1,.88,.3,1,0],travelX:[0,0,.4,-.02,.6,-.78,.78,-.88,.9,-.5,1,-.08],travelZ:[0,0,.36,.06,.6,.8,.78,1.5,.9,1.95,1,2.3],
    ball:[[0,.08,R,.55,'h'],[.34,.08,R,.55,'l'],[.78,.05,R,2.6,'o'],[1,.03,R,2.85,'h']],squash:[[.14,-.6],[.34,.7]],
  },
  // ------------------------------------------------------------------------------------- finishing and passing
  // Chip: plant beside the ball, a short back-swing, stab the toe under the ball and lean back: it floats up and
  // drops (a real gravity arc, apex ~2.6 m, ~8 m out).
  chipShot:{
    spec:{label:'Chip shot',group:'shoot',seconds:2,phases:[.15,.32,.44],contacts:[{p:.3,leg:'s',surface:'toe'}],priority:2,ball:true,
      teach:'When the keeper rushes off the line, stab your foot under the ball and lean back: it floats over them and drops into the goal.',
      trigger:'Through on goal with the keeper off the line.'},
    hold:[0,-1,.15,-1,.16,1,.5,1,.54,0],
    o:{w:[.02,0,.06,1,.5,1,.58,0],x:[.06,-.12,.15,-.27],z:[.06,0,.15,.3],lift:[.06,0,.1,.08,.15,0]},
    s:{w:[.16,0,.2,1,.5,1,.58,0],x:[.16,.12,.23,.14,.3,PIN,.36,.12,.46,.12],z:[.16,-.1,.23,-.3,.3,PIN,.36,.55,.46,.3],lift:[.16,0,.23,.26,.3,PIN,.36,.22,.46,.05,.52,0],toe:[.16,0,.23,.35,.28,-.1,.36,.1,.5,0]},
    body:{pelvisDrop:[0,0,.2,.06,.35,.04,1,0],torsoPitch:[0,.06,.22,.2,.3,-.12,.42,-.18,.6,-.1,1,.05],headPitch:[0,.3,.3,.4,.4,-.1,.6,-.35,.8,-.2,1,0],torsoYaw:[0,0,.22,.1,.36,-.05,.6,0]},
    armS:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.22,.4,.36,-.3,.7,-.1],sz:[0,.2,.22,.5,.4,.6,.7,.3],el:[0,-.5,.4,-.6,.8,-.5]},
    armO:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.22,-.4,.36,-.2,.7,0],sz:[0,.2,.22,1.1,.4,.8,.7,.3],el:[0,-.5,.4,-.4,.8,-.5]},
    travelZ:[0,0,.15,.1,.3,.14,.5,.2,1,.25],
    ball:[[0,.12,R,.6,'h'],[.3,.12,R,.6,'b'],[.94,.05,R,8.2,'o'],[1,.05,R,8.6,'h']],squash:[[.17,-.6],[.3,.9]],
  },
  // Trivela: plant wide, the boot swings across from inside to outside, toes turned in, and the OUTSIDE of the boot
  // strikes: the ball swerves away (its flight bows toward the other side, then bends back).
  trivela:{
    spec:{label:'Trivela',group:'shoot',seconds:1.9,phases:[.16,.34,.46],contacts:[{p:.32,leg:'s',surface:'outside'}],priority:3,ball:true,
      teach:'Point your toes in and strike with the outside of your foot: the ball swerves away from the defender or the keeper.',
      history:'Called the trivela in Portugal and Brazil; Ricardo Quaresma and Luka Modrić are famous for it.',
      trigger:'A shot or pass where the angle is closed for the inside of the foot.'},
    hold:[0,-1,.16,-1,.18,1,.52,1,.56,0],
    o:{w:[.02,0,.06,1,.52,1,.6,0],x:[.06,-.12,.16,-.34],z:[.06,0,.16,.22],lift:[.06,0,.1,.08,.16,0]},
    s:{w:[.18,0,.21,1,.52,1,.6,0],x:[.18,.12,.26,.02,.32,PIN,.4,.4,.5,.3],z:[.18,-.08,.26,-.26,.32,PIN,.4,.55,.5,.35],lift:[.18,0,.26,.3,.32,PIN,.4,.3,.5,.05,.56,0],toe:[.18,0,.26,.5,.32,.6,.42,.3,.56,0]},
    body:{pelvisDrop:[0,0,.2,.06,.4,.05,1,0],torsoRoll:[0,0,.2,.1,.32,.28,.45,.2,.7,.05,1,0],torsoYaw:[0,0,.24,-.25,.34,.15,.5,.25,1,0],torsoPitch:[0,.06,.26,.18,.34,.2,.5,.1,1,.05],headPitch:[0,.3,.32,.45,.45,.1,1,0]},
    armS:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,.3,.36,-.2],sz:[0,.2,.26,.4,.4,.6,.7,.3],el:[0,-.5,.4,-.7]},
    armO:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,-.3,.36,.2],sz:[0,.2,.26,1.2,.4,.9,.7,.3],el:[0,-.5,.4,-.3]},
    travelZ:[0,0,.16,.08,.32,.12,.55,.22,1,.28],
    ball:[[0,.12,R,.58,'h'],[.32,.12,R,.58,'b',-1.1],[.9,1.6,R,11,'o'],[1,1.7,R,11.6,'h']],squash:[[.18,-.6],[.32,1]],
  },
  // Toe poke (futsal finish): no back-lift, a quick knee lift and a jab with the toe; the ball flies low and hard.
  toePoke:{
    spec:{label:'Toe poke',group:'shoot',seconds:.9,phases:[.12,.34,.5],contacts:[{p:.3,leg:'s',surface:'toe'}],priority:2,ball:true,
      teach:'No back-lift: poke it with your toe before the defender can block. Quick beats pretty.',
      history:'Ronaldinho\'s famous goal against Chelsea in the 2005 Champions League was a toe poke with almost no back-lift.',
      trigger:'A shot in a crowded box or a futsal finish with a defender about to block.'},
    hold:[0,1,.52,1,.56,0],
    s:{w:[.06,0,.12,1,.52,1,.6,0],x:[.12,.12,.22,.12,.3,PIN,.4,.1,.5,.12],z:[.12,0,.22,.02,.3,PIN,.4,.45,.5,.25],lift:[.12,0,.2,.1,.3,PIN,.4,.06,.5,0],toe:[.12,0,.22,.1,.3,-.05,.5,0]},
    body:{pelvisDrop:[0,0,.2,.06,.4,.05,1,0],torsoPitch:[0,.06,.22,.18,.32,.22,.6,.1,1,.05],headPitch:[0,.3,.3,.45,.6,.15,1,0]},
    armS:{w:[0,0,.1,1,.7,1,.9,0],sx:[0,0,.3,-.3],sz:[0,.2,.3,.45],el:[0,-.5,.3,-.8]},
    armO:{w:[0,0,.1,1,.7,1,.9,0],sx:[0,0,.3,.3],sz:[0,.2,.3,.7],el:[0,-.5,.3,-.6]},
    travelZ:[0,0,.3,.06,.6,.12,1,.14],
    ball:[[0,.1,R,.62,'h'],[.3,.1,R,.62,'b'],[.8,.18,R,5.5,'o'],[1,.2,R,6.2,'h']],squash:[[.3,1]],
  },
  // Finesse (curled) shot: plant wide and a little behind (hips open), the boot swings in from outside and wraps its
  // inside round the ball; the arm opposite the kicking foot goes up; the flight bows out and curls back in.
  finesseShot:{
    spec:{label:'Curled shot',group:'shoot',seconds:1.9,phases:[.16,.34,.46],contacts:[{p:.32,leg:'s',surface:'inside'}],priority:2,ball:true,
      teach:'Open your hips, wrap the inside of your foot round the ball and curl it: aim outside the post and let it bend back in.',
      trigger:'A shot from the edge of the box toward the far corner.'},
    hold:[0,-1,.16,-1,.18,1,.52,1,.56,0],
    o:{w:[.02,0,.06,1,.52,1,.6,0],x:[.06,-.12,.16,-.3],z:[.06,0,.16,.2],lift:[.06,0,.1,.08,.16,0]},
    s:{w:[.18,0,.21,1,.52,1,.6,0],x:[.18,.12,.26,.3,.32,PIN,.42,-.2,.52,-.05],z:[.18,-.08,.26,-.25,.32,PIN,.42,.58,.52,.35],lift:[.18,0,.26,.3,.32,PIN,.42,.35,.52,.05,.58,0],toe:[.18,0,.26,.3,.32,0,.42,.2,.56,0]},
    body:{pelvisDrop:[0,0,.2,.06,.4,.05,1,0],torsoRoll:[0,0,.26,.08,.34,.15,.5,.1,1,0],torsoYaw:[0,0,.26,.25,.34,-.1,.5,-.3,1,0],torsoPitch:[0,.06,.26,.12,.34,.04,.5,-.02,1,.05],headPitch:[0,.3,.32,.45,.45,.05,1,0],pelvisYaw:[0,0,.26,.15,.4,-.2,1,0]},
    armS:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,.35,.4,-.35],sz:[0,.2,.26,.45,.4,.5,.7,.3],el:[0,-.5,.4,-.8]},
    armO:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,-.3,.36,-.4,.6,-.2],sz:[0,.2,.26,1.35,.4,1.2,.7,.4],el:[0,-.5,.4,-.25]},
    travelZ:[0,0,.16,.08,.32,.12,.55,.22,1,.28],
    ball:[[0,.1,R,.58,'h'],[.32,.1,R,.58,'b',1.3],[.9,-1.4,R,11,'o'],[1,-1.5,R,11.5,'h']],squash:[[.18,-.6],[.32,1]],
  },
  // Knuckleball: plant close, laces through the middle of the ball with the ankle locked and toes down, and stop the
  // leg short (a stab, almost no follow-through). Little spin: the flight wobbles and darts (its segments all lie on
  // one gravity arc, so the height stays smooth while the line zig-zags).
  knuckleball:{
    spec:{label:'Knuckleball',group:'shoot',seconds:1.9,phases:[.16,.34,.46],contacts:[{p:.32,leg:'s',surface:'laces'}],priority:3,ball:true,
      teach:'Hit the middle of the ball with your laces, ankle locked, and stop your leg short: with almost no spin it wobbles and dips, which is hard for a keeper.',
      history:'Juninho Pernambucano was famous for his knuckleball free kicks.',
      trigger:'A long-range shot or free kick straight at goal.'},
    hold:[0,-1,.16,-1,.18,1,.5,1,.54,0],
    o:{w:[.02,0,.06,1,.5,1,.58,0],x:[.06,-.12,.16,-.24],z:[.06,0,.16,.34],lift:[.06,0,.1,.08,.16,0]},
    s:{w:[.18,0,.21,1,.5,1,.58,0],x:[.18,.12,.26,.13,.32,PIN,.4,.1,.5,.12],z:[.18,-.08,.26,-.36,.32,PIN,.38,.52,.46,.36,.54,.2],lift:[.18,0,.26,.36,.32,PIN,.38,.14,.46,.06,.54,0],toe:[.18,0,.26,.6,.32,.7,.4,.5,.54,0]},
    body:{pelvisDrop:[0,0,.2,.06,.36,.07,1,0],torsoPitch:[0,.06,.26,.24,.34,.3,.5,.18,1,.05],headPitch:[0,.3,.32,.5,.46,.2,1,0],torsoYaw:[0,0,.26,.15,.34,-.05,.6,0]},
    armS:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,.35,.36,-.25],sz:[0,.2,.26,.7,.4,.8,.7,.3],el:[0,-.5,.4,-.5]},
    armO:{w:[0,0,.1,1,.8,1,.95,0],sx:[0,0,.26,-.35,.36,.25],sz:[0,.2,.26,1.1,.4,1,.7,.3],el:[0,-.5,.4,-.4]},
    travelZ:[0,0,.16,.1,.32,.14,.55,.18,1,.2],
    ball:[[0,.1,R,.6,'h'],[.32,.1,R,.6,'b',.1],[.465,.22,1.307,4.45,'b',-.12],[.61,.02,1.679,8.3,'b',.12],[.755,.24,1.306,12.15,'b',-.08],[.9,.1,R,16,'o'],[1,.1,R,17.2,'h']],squash:[[.18,-.6],[.32,1.2]],
  },
  // ----------------------------------------------------------------------------------------------- defending
  // Block tackle: step in, get low, and block the rolling ball with the inside of the boot, weight through it; the
  // ball stops dead and stays with the defender.
  blockTackle:{
    spec:{label:'Block tackle',group:'defend',seconds:1.3,phases:[.18,.4,.6],contacts:[{p:.36,leg:'s',surface:'inside'}],priority:1,ball:true,
      teach:'Get close, bend your knees and block the ball with the inside of your foot. Put your weight through it and stay on your feet.',
      trigger:'The dribbler takes a touch toward a close, balanced defender.'},
    hold:[0,-1,.2,-1,.22,1,.6,1,.64,0],
    o:{w:[.04,0,.08,1,.6,1,.7,0],x:[.08,-.12,.2,-.2],z:[.08,0,.2,.35],lift:[.08,0,.14,.08,.2,0]},
    s:{w:[.22,0,.25,1,.6,1,.7,0],x:[.24,.12,.3,.32,.36,PIN,.5,.28,.6,.14],z:[.24,-.11,.3,.36,.36,PIN,.5,.52,.6,.25],lift:[.24,0,.3,.08,.36,PIN,.5,.05,.6,0],toe:[.24,0,.3,-.25,.4,-.3,.6,0]},
    body:{pelvisDrop:[0,0,.25,.13,.5,.13,.8,.05,1,0],torsoPitch:[0,.05,.3,.3,.5,.3,.8,.15,1,.05],headPitch:[0,.3,.36,.45,.7,.2,1,0],torsoYaw:[0,0,.3,.12,.5,.1,1,0]},
    armS:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.3,-.25,.6,-.1],sz:[0,.2,.3,.6,.6,.4],el:[0,-.5,.3,-.8]},
    armO:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.3,-.2,.6,-.1],sz:[0,.2,.3,.7,.6,.4],el:[0,-.5,.3,-.8]},
    travelZ:[0,0,.2,.1,.36,.16,1,.18],
    ball:[[0,.05,R,2.6,'l'],[.36,.05,R,.72,'o'],[.5,.04,R,.62,'s'],[1,.04,R,.62,'h']],squash:[[.22,-.8],[.36,-1.4]],
  },
  // Poke tackle: from a low, patient stance the front boot lunges and pokes the ball away with the toe, then the
  // defender recovers his balance.
  pokeTackle:{
    spec:{label:'Poke tackle',group:'defend',seconds:1.2,phases:[.2,.4,.6],contacts:[{p:.34,leg:'s',surface:'toe'}],priority:1,ball:true,
      teach:'Stay patient on your feet. When the ball leaves the dribbler\'s foot, poke it away with your toe and keep your balance.',
      trigger:'A defender jockeying a dribbler who takes a heavy touch.'},
    hold:[0,1,.62,1,.66,0],
    s:{w:[.06,0,.14,1,.6,1,.7,0],x:[.14,.12,.24,.14,.34,PIN,.44,.2,.6,.14],z:[.14,0,.24,.2,.34,PIN,.44,.46,.6,.1],lift:[.14,0,.24,.1,.34,PIN,.4,.06,.46,0],toe:[.14,0,.28,.2,.34,.35,.5,0]},
    body:{pelvisDrop:[0,0,.2,.12,.34,.15,.6,.1,1,0],torsoPitch:[0,.08,.2,.18,.34,.28,.6,.15,1,.05],headPitch:[0,.3,.34,.45,.7,.2,1,0],torsoYaw:[0,0,.34,.12,.6,0]},
    armS:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.24,-.4,.34,.2,.6,0],sz:[0,.2,.24,.5,.6,.45],el:[0,-.5,.34,-.7]},
    armO:{w:[0,0,.12,1,.8,1,.95,0],sx:[0,0,.24,.3,.34,-.35,.6,0],sz:[0,.2,.24,.7,.6,.5],el:[0,-.5,.34,-.7]},
    travelZ:[0,0,.2,.04,.34,.18,.7,.1,1,.06],
    ball:[[0,.25,R,1.35,'l'],[.34,.15,R,1,'o'],[.8,.95,R,1.9,'o'],[1,1.05,R,2,'h']],squash:[[.34,1]],
  },
  // -------------------------------------------------------------------------------------------- goalkeeping
  // Keeper distribution. The ball is in the hands, so its path is authored on the hands (measured on the solved rig,
  // tests/skill-moves.cjs checks the fit); the release hands it to a real flight.
  // Overarm throw: side-on, the far arm points at the target, the ball goes back behind the head, the arm whips over
  // the top and releases high; the back leg follows through.
  keeperThrow:{
    spec:{label:'Keeper overarm throw',group:'keeper',seconds:1.6,phases:[.2,.5,.64],contacts:[],priority:1,ball:true,
      teach:'Stand side-on, point at your team-mate, then bring the ball over your head like a bowler and let go high. It goes further than a roll.',
      trigger:'The keeper has caught the ball and a team-mate is free 15 to 30 metres away.'},
    hold:[0,-1,.18,-1,.2,1,.62,1,.66,0],
    o:{w:[.04,0,.08,1,.62,1,.7,0],x:[.08,-.12,.2,-.16],z:[.08,0,.2,.45],lift:[.08,0,.14,.1,.2,0]},
    s:{w:[.5,0,.54,1,.72,1,.8,0],x:[.54,.12,.66,.1],z:[.54,-.02,.66,.3],lift:[.54,0,.6,.1,.66,0],toe:[.5,.3,.66,0]},
    body:{torsoYaw:[0,0,.2,.45,.42,.55,.52,-.25,.7,-.35,1,0],pelvisYaw:[0,0,.2,.25,.42,.3,.55,-.12,1,0],torsoRoll:[0,0,.42,-.1,.52,.1,1,0],
      torsoPitch:[0,.02,.42,-.12,.55,.25,.75,.18,1,.04],headPitch:[0,.1,.42,-.05,.6,.1,1,0],pelvisDrop:[0,0,.2,.05,.55,.07,1,0]},
    armS:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.34,-2.7,.44,-2.75,.5,-2.3,.6,-1,.8,-.4],sz:[0,-.2,.12,-.2,.34,.7,.44,.65,.5,.3,.6,-.1,.8,.15],el:[0,-1.5,.12,-1.5,.34,-1.8,.44,-1.75,.5,-.35,.6,-.3,.8,-.5]},
    armO:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.3,-1.1,.46,-1.05,.56,-.3,.8,-.2],sz:[0,-.2,.12,-.2,.3,.8,.46,.8,.56,.5,.8,.25],el:[0,-1.5,.12,-1.5,.3,-.1,.46,-.15,.56,-.6,.8,-.5]},
    travelZ:[0,0,.2,.12,.55,.2,.7,.32,1,.36],
    ball:[[0,0,1.08,.5,'s'],[.07,.08,1.2,.55,'s'],[.14,.22,1.18,.53,'s'],[.2,.45,1.45,.3,'s'],[.26,.3,1.64,-.1,'s'],[.32,.08,1.5,-.4,'s'],[.44,.04,1.45,-.41,'l'],[.46,.27,1.65,-.27,'l'],[.48,.46,1.83,.31,'l'],[.5,.3,1.74,.76,'b'],[.95,.1,R,10,'o'],[1,.1,R,10.6,'h']],squash:[[.2,-.6],[.5,1]],
  },
  // Rolled throw: step long toward the target and bend low, the arm swings back then forward like a bowler and lets
  // the ball go by the front foot so it rolls without bouncing.
  keeperRoll:{
    spec:{label:'Keeper roll-out',group:'keeper',seconds:1.5,phases:[.2,.46,.6],contacts:[],priority:1,ball:true,
      teach:'Bend low and roll it like a bowling ball so it does not bounce. Step toward your team-mate: it is the safest pass to a close defender.',
      trigger:'The keeper has the ball and a defender is free nearby.'},
    hold:[0,-1,.22,-1,.24,1,.66,1,.7,0],
    o:{w:[.04,0,.1,1,.66,1,.74,0],x:[.1,-.12,.22,-.16],z:[.1,0,.22,.6],lift:[.1,0,.16,.1,.22,0]},
    s:{w:[.22,0,.28,1,.64,1,.72,0],x:[.28,.12,.4,.14],z:[.28,0,.4,-.12],lift:[.28,0,.4,.02,.62,.02,.7,0],toe:[.28,0,.4,.35,.62,.3,.7,0]},
    body:{pelvisDrop:[0,0,.22,.1,.4,.3,.56,.3,.8,.08,1,0],torsoPitch:[0,.04,.22,.2,.4,.62,.56,.62,.8,.2,1,.04],headPitch:[0,.1,.4,-.25,.56,-.3,.8,-.05,1,0],
      torsoYaw:[0,0,.3,-.25,.46,.1,.6,.15,1,0],pelvisYaw:[0,0,.3,-.15,.46,.08,1,0]},
    armS:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.32,.9,.46,-.85,.6,-1.4,.8,-.6],sz:[0,-.2,.12,-.2,.32,.25,.46,.1,.6,.1,.8,.2],el:[0,-1.5,.12,-1.5,.32,-.25,.46,-.15,.6,-.2,.8,-.5]},
    armO:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.32,-.9,.46,-.8,.6,-.5,.8,-.2],sz:[0,-.2,.12,-.2,.32,.5,.46,.6,.6,.45,.8,.25],el:[0,-1.5,.12,-1.5,.32,-.4,.6,-.5,.8,-.5]},
    travelZ:[0,0,.22,.2,.46,.3,.7,.36,1,.4],
    ball:[[0,0,1.08,.5,'s'],[.07,-.02,1.14,.59,'s'],[.13,-.07,1,.7,'s'],[.2,.08,.6,.62,'s'],[.24,.3,.5,.23,'s'],[.28,.48,.62,.01,'s'],[.32,.57,.74,-.05,'s'],[.36,.48,.58,-.03,'l'],[.4,.35,.27,.27,'l'],[.43,.37,.22,.59,'l'],[.46,.39,.2,.72,'o'],[1,.2,R,5.5,'h']],squash:[[.24,-.8],[.46,.6]],
  },
  // Punt: ball held out in front, step, drop it onto the laces and kick it before it bounces; big follow-through.
  keeperPunt:{
    spec:{label:'Keeper punt',group:'keeper',seconds:1.6,phases:[.2,.42,.56],contacts:[{p:.42,leg:'s',surface:'laces'}],priority:2,ball:true,
      teach:'Drop the ball onto your laces and kick it before it bounces: long and high. The other team can win it, so a throw or a roll is often better.',
      history:'In US Youth Soccer 7v7 (under-10s) goalkeepers are not allowed to punt or drop-kick; they roll, throw or pass instead.',
      trigger:'The keeper has the ball in the hands and the team wants to clear it long (9v9 and 11v11).'},
    hold:[0,-1,.2,-1,.22,1,.62,1,.66,0],
    o:{w:[.04,0,.08,1,.62,1,.7,0],x:[.08,-.12,.2,-.16],z:[.08,0,.2,.38],lift:[.08,0,.14,.1,.2,0]},
    s:{w:[.22,0,.26,1,.62,1,.72,0],x:[.26,.12,.33,.12,.42,PIN,.5,.1,.62,.12],z:[.26,0,.33,-.3,.42,PIN,.5,.62,.62,.35],lift:[.26,0,.33,.35,.42,PIN,.5,.92,.62,.05,.68,0],toe:[.26,0,.33,.5,.42,.8,.52,.6,.66,0]},
    body:{pelvisDrop:[0,0,.2,.05,.4,.04,1,0],torsoPitch:[0,.04,.3,.12,.42,-.1,.52,-.22,.7,-.05,1,.04],headPitch:[0,.1,.3,.4,.42,.45,.55,-.1,.8,-.1,1,0],torsoYaw:[0,0,.3,.1,.5,-.1,1,0]},
    armS:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.26,-1.05,.32,-.9,.42,-.3,.6,-.1],sz:[0,-.2,.12,-.2,.26,-.12,.32,.3,.42,.9,.6,.6],el:[0,-1.5,.12,-1.5,.26,-.45,.32,-.4,.42,-.3,.6,-.4]},
    armO:{w:[0,0,.06,1,.82,1,.96,0],sx:[0,-.6,.12,-.6,.26,-1.05,.32,-.9,.42,-.5,.6,-.3],sz:[0,-.2,.12,-.2,.26,-.12,.32,.3,.42,1.1,.6,.7],el:[0,-1.5,.12,-1.5,.26,-.45,.32,-.4,.42,-.3,.6,-.4]},
    travelZ:[0,0,.2,.12,.42,.2,.62,.3,1,.34],
    ball:[[0,0,1.08,.5,'s'],[.07,.01,1.17,.57,'s'],[.14,.02,1.12,.64,'s'],[.2,.03,1.08,.72,'s'],[.26,.05,1.04,.79,'s'],[.3,.05,1,.78,'b'],[.42,.07,.5,.76,'b'],[1,.1,2.8,9,'h']],squash:[[.22,-.5],[.42,1.2]],
  },
  // ---------------------------------------------------------------------------------------------- celebrations
  // Airplane: arms out like wings, banking round a small circle (the legs are the rig's own gait).
  airplane:{
    spec:{label:'Airplane',group:'celebrate',seconds:2.6,phases:[.08,.82,.94],contacts:[],priority:3,ball:false,
      teach:'Arms out like wings: enjoy the goal with your team, then jog back for the kick-off. Celebrate, never tease the other team.',
      trigger:'After a goal.'},
    body:{torsoRoll:[0,0,.1,-.28,.3,-.34,.45,-.18,.6,-.36,.8,-.28,.95,0],torsoPitch:[0,0,.1,.08,.85,.08,1,0],headPitch:[0,0,.1,-.12,.85,-.12,1,0],headRoll:[0,0,.1,.12,.85,.12,1,0]},
    armS:{w:[0,0,.08,1,.86,1,.97,0],sx:[0,0,.1,.05,.86,.05],sz:[0,.2,.1,1.5,.86,1.5],el:[0,-.3,.1,-.06,.86,-.06]},
    armO:{w:[0,0,.08,1,.86,1,.97,0],sx:[0,0,.1,.05,.86,.05],sz:[0,.2,.1,1.5,.86,1.5],el:[0,-.3,.1,-.06,.86,-.06]},
    heading:[0,0,.05,0,.2,.785,.35,1.571,.5,2.356,.65,3.142,.8,3.927,.9,4.4,1,4.5],
    travelX:[0,0,.05,0,.2,.2,.35,.7,.5,1.2,.65,1.4,.8,1.2,.9,1.02,1,.98],travelZ:[0,0,.05,0,.2,.5,.35,.7,.5,.5,.65,0,.8,-.5,.9,-.66,1,-.68],
    squash:[[.08,.8]],
  },
  // Knee slide: a few quick steps, drop onto both knees and slide on the grass with the arms up, then get up.
  kneeSlide:{
    spec:{label:'Knee slide',group:'celebrate',seconds:2.6,phases:[.24,.64,.82],contacts:[],priority:3,ball:false,
      teach:'A knee slide is fun on soft grass. On a hard pitch, jump and hug your team-mates instead.',
      trigger:'After a goal, on soft grass.'},
    s:{w:[.24,0,.3,1,.76,1,.84,0],x:[.24,.12,.3,.14],z:[.24,0,.3,-.42],lift:[.24,.05,.3,.03,.76,.03,.84,0],toe:[.24,0,.3,.9,.76,.9,.84,0]},
    o:{w:[.24,0,.3,1,.76,1,.84,0],x:[.24,-.12,.3,-.14],z:[.24,0,.3,-.42],lift:[.24,.05,.3,.03,.76,.03,.84,0],toe:[.24,0,.3,.9,.76,.9,.84,0]},
    body:{pelvisDrop:[0,0,.22,.06,.32,.46,.76,.46,.86,.05,1,0],torsoPitch:[0,.04,.22,.04,.34,-.3,.7,-.34,.84,.1,1,0],headPitch:[0,0,.3,-.3,.72,-.35,.86,0],chestArch:[.3,0,.4,.15,.72,.15,.84,0]},
    armS:{w:[0,0,.26,0,.36,1,.78,1,.9,0],sx:[.26,0,.36,-2.8,.78,-2.8],sz:[.26,.2,.36,.45,.78,.45],el:[.26,-.4,.36,-.2,.78,-.2]},
    armO:{w:[0,0,.26,0,.36,1,.78,1,.9,0],sx:[.26,0,.36,-2.8,.78,-2.8],sz:[.26,.2,.36,.45,.78,.45],el:[.26,-.4,.36,-.2,.78,-.2]},
    travelZ:[0,0,.24,.9,.32,1.15,.5,1.5,.62,1.58,1,1.62],
    squash:[[.3,-1.6],[.84,.6]],
  },
  // Thank the passer: turn to the team-mate who set up the goal, point at them with both arms, then clap twice.
  thankPasser:{
    spec:{label:'Thank the passer',group:'celebrate',seconds:2.2,phases:[.12,.72,.88],contacts:[],priority:1,ball:false,
      teach:'Point to the team-mate who set up the goal and thank them: every goal is a team goal.',
      trigger:'After a goal from a team-mate\'s pass.'},
    body:{torsoPitch:[0,0,.2,-.06,.5,-.06,.62,.1,.8,.1,1,0],headPitch:[0,0,.2,-.1,.55,-.1,.8,0],torsoYaw:[0,0,.2,.12,.5,.12,.6,0]},
    armS:{w:[0,0,.18,0,.26,1,.84,1,.95,0],sx:[.26,-1.5,.5,-1.55,.56,-1.3,.62,-1.3,.68,-1.3,.74,-1.3],sz:[.26,.1,.5,.1,.56,.75,.6,-.2,.66,.75,.7,-.2,.76,.5],el:[.26,-.05,.5,-.05,.56,-.55,.76,-.55]},
    armO:{w:[0,0,.18,0,.26,1,.84,1,.95,0],sx:[.26,-1.5,.5,-1.55,.56,-1.3,.62,-1.3,.68,-1.3,.74,-1.3],sz:[.26,.1,.5,.1,.56,.75,.6,-.2,.66,.75,.7,-.2,.76,.5],el:[.26,-.05,.5,-.05,.56,-.55,.76,-.55]},
    heading:[0,0,.25,.9,1,.9],travelX:[0,0,.1,.02,.25,.18,.45,.45,.55,.5,1,.5],travelZ:[0,0,.1,.08,.25,.25,.45,.4,.55,.42,1,.42],
    squash:[[.6,-.6],[.7,-.6]],
  },
};
export const SKILL_TYPES=Object.keys(MOVES) as SkillMove[];
export const SKILL_MOVES:Record<SkillMove,SkillSpec>=Object.fromEntries(SKILL_TYPES.map(k=>[k,MOVES[k].spec])) as Record<SkillMove,SkillSpec>;

// ------------------------------------------------------------------------------------------------ frame + ball
const G=9.81;
/** Travel (x, z in the start frame, metres) and heading offset (radians, + toward +x) for side +1. */
function frame1(d:MoveDef,p:number,out:{x:number;z:number;heading:number}){
  out.x=d.travelX?kf(p,d.travelX):0;out.z=d.travelZ?kf(p,d.travelZ):0;out.heading=d.heading?kf(p,d.heading):0;return out;
}
/** Ball centre in the start frame (side +1). */
function ball1(d:MoveDef,p:number,out:{x:number;y:number;z:number}){
  const b=d.ball!;
  if(p<=b[0][0]){out.x=b[0][1];out.y=b[0][2];out.z=b[0][3];return out;}
  for(let i=0;i<b.length-1;i++){
    const a=b[i],c=b[i+1];if(p>c[0])continue;
    const u=(p-a[0])/(c[0]-a[0]||1),e=a[4];
    if(e==='h'){out.x=a[1];out.y=a[2];out.z=a[3];return out;}
    if(e==='b'){
      // Ballistic: linear over the ground, gravity on y (real seconds from the move length).
      const T=(c[0]-a[0])*d.spec.seconds,t=u*T,vy=(c[2]-a[2]+.5*G*T*T)/T;
      out.x=a[1]+(c[1]-a[1])*u+(a[5]??0)*4*u*(1-u);out.z=a[3]+(c[3]-a[3])*u;out.y=a[2]+vy*t-.5*G*t*t;return out;
    }
    const q=e==='s'?smooth(u):e==='o'?1-(1-u)*(1-u):u;
    out.x=a[1]+(c[1]-a[1])*q;out.y=a[2]+(c[2]-a[2])*q;out.z=a[3]+(c[3]-a[3])*q;return out;
  }
  const l=b[b.length-1];out.x=l[1];out.y=l[2];out.z=l[3];return out;
}
const tmpF={x:0,z:0,heading:0},tmpB={x:0,y:0,z:0};
/** Pins every contact: the touching boot's x/z/lift keyframe at the contact time is solved from the ball path. */
function pin(d:MoveDef){
  for(const c of d.spec.contacts){
    const leg=d[c.leg]!,σ=c.leg==='s'?1:-1;frame1(d,c.p,tmpF);ball1(d,c.p,tmpB);
    const dx=tmpB.x-tmpF.x,dz=tmpB.z-tmpF.z,h=tmpF.heading,cs=Math.cos(h),sn=Math.sin(h);
    const lx=dx*cs-dz*sn,lz=dx*sn+dz*cs,off=SURFACE[c.surface](σ);
    const set=(k:K|undefined,v:number)=>{if(!k)return;for(let i=0;i<k.length;i+=2)if(Math.abs(k[i]-c.p)<1e-9&&Number.isNaN(k[i+1]))k[i+1]=v;};
    set(leg.x,lx-off[0]);set(leg.z,lz-off[2]);set(leg.lift,tmpB.y-off[1]-.075);
  }
}
for(const k of SKILL_TYPES)pin(MOVES[k]);

/** Where the host puts the root and which way it faces, relative to where the move started (side applied). */
export function skillFrame(type:SkillMove,progress:number,side:-1|1,out:{x:number;z:number;heading:number}={x:0,z:0,heading:0}){
  frame1(MOVES[type],Math.min(1,Math.max(0,progress)),out);out.x*=side;out.heading*=side;return out;
}
/** Ball centre relative to where the move started (start frame: +z forward, +x the side +1 leg). False for body-only moves. */
export function skillBall(type:SkillMove,progress:number,side:-1|1,out:{x:number;y:number;z:number}={x:0,y:0,z:0}):{x:number;y:number;z:number}|false{
  const d=MOVES[type];if(!d.ball)return false;ball1(d,Math.min(1,Math.max(0,progress)),out);out.x*=side;return out;
}
/** Start-frame point → world, for a move that started at (x, z) facing `yaw` (the rig's heading convention). */
export function skillToWorld(start:{x:number;z:number;yaw:number},local:{x:number;z:number},scale:number,out:{x:number;z:number}){
  const c=Math.cos(start.yaw),s=Math.sin(start.yaw),lx=local.x*scale,lz=local.z*scale;
  out.x=start.x+lx*c+lz*s;out.z=start.z-lx*s+lz*c;return out;
}
const tmpW={x:0,z:0};
/** One call for a host: sets `motion.skill` (the object is reused), `motion.facing` and a tight turn smoothing,
 *  writes the root position to `root` and the world ball to `ball` (ball.y is the centre height). Returns false when
 *  the move is over (progress ≥ 1): clear `motion.skill` then. */
export function applySkill(motion:{skill?:SkillMotion;facing?:number;turnSmoothing?:number},type:SkillMove,progress:number,side:-1|1,
  start:{x:number;z:number;yaw:number},root:{x:number;z:number},ball?:{x:number;y:number;z:number},scale=1){
  const p=Math.min(1,Math.max(0,progress));
  if(motion.skill){motion.skill.type=type;motion.skill.progress=p;motion.skill.side=side;}else motion.skill={type,progress:p,side};
  skillFrame(type,p,side,tmpF);motion.facing=start.yaw+tmpF.heading;motion.turnSmoothing=30;skillToWorld(start,tmpF,scale,root);
  if(ball){const b=skillBall(type,p,side,tmpB);if(b){skillToWorld(start,b,scale,tmpW);ball.x=tmpW.x;ball.z=tmpW.z;ball.y=R+(b.y-R)*scale;}}
  return progress<1;
}

// ------------------------------------------------------------------------------------------------ rig driver
/** Per-rig state: progress, fade-out (~.15 s after the host clears the field), and the contact squash. A move that
 *  starts part-way through (a live tackle joined at its lunge) fades in over ~.08 s instead of popping. */
export function createSkillDriver(){
  let type:SkillMove='bodyFeint',p=0,side:-1|1=1,fade=0,last=-1;
  const C=SKILL_CHANNELS;
  return {
    /** Reads the host's field; `snap` (teleport/resume/rides) drops a cleared move at once. */
    input(m:SkillMotion|undefined,dt:number,snap:boolean){
      if(m&&MOVES[m.type]){const np=m.progress<0?0:m.progress>1?1:m.progress,fresh=fade===0||m.type!==type||np<p-.3;if(fresh)last=-1;
        fade=fresh&&np>.05&&!snap?Math.min(1,dt/.08):fade>0&&fade<1&&!fresh?Math.min(1,fade+dt/.08):1;type=m.type;p=np;side=m.side<0?-1:1;}
      else if(fade>0){fade=snap?0:Math.max(0,fade-dt/.15);if(fade===0)last=-1;}
    },
    get active(){return fade>0;},
    get type(){return type;},get progress(){return p;},get side(){return side;},
    /** Adds the pose to the reaction channels. Returns the weight-bearing rig side (−1/+1) or 0 (gait/none).
     *  Reduced motion calms the body and arms (×.6); the legs keep full reach so boot and ball still meet. */
    write(out:Float64Array,reduced:boolean):-1|0|1{
      const d=MOVES[type],w=smooth(fade),wb=w*(reduced?.6:1),s=side,o=-s as -1|1;
      for(const key in d.body){const k=d.body[key as keyof Body]!,ch=C[key as keyof typeof C];out[ch]+=kf(p,k)*(LATERAL.has(key)?s:1)*wb;}
      const hv=d.hold?kf(p,d.hold):0,support:-1|0|1=hv>.5?o:hv<-.5?s:0;
      if(support!==0)out[C.hold]+=w;
      const leg=(L:LegDef|undefined,σ:-1|1)=>{
        // A weight-bearing leg belongs to the rig's support lock (planted where the boot stood when it took the
        // weight, i.e. on this target): no target of ours may drag it while the body travels or turns over it.
        if(!L||support===σ)return;const k=kf(p,L.w)*w;if(k<=0)return;
        const b=C.leg+(σ<0?0:1)*6,ax=(L.x?kf(p,L.x):σ*s*.12)*s;
        // While a free leg blends between its target and wherever the gait or a lock left it, the boot lifts (a step,
        // never a skid): the rig blends height first, so the hand-over happens in the air.
        const clear=.07*4*k*(1-k);
        out[b]+=k;out[b+1]+=k*(ax-σ*.108);out[b+2]+=k*(L.z?kf(p,L.z):0);out[b+3]+=k*((L.lift?kf(p,L.lift):0)+clear);out[b+4]+=k*(L.toe?kf(p,L.toe):0);
        out[b+5]=Math.max(out[b+5],k);
      };
      leg(d.s,s);leg(d.o,o);
      const arm=(A:ArmDef|undefined,σ:-1|1)=>{if(!A)return;const k=kf(p,A.w)*wb;if(k<=0)return;const b=C.arm+(σ<0?0:1)*4;out[b]+=k;out[b+1]+=k*kf(p,A.sx);out[b+2]+=k*σ*kf(p,A.sz);out[b+3]+=k*kf(p,A.el);};
      arm(d.armS,s);arm(d.armO,o);
      return support;
    },
    /** Squash-spring impulse for contacts crossed since the last call (one each); 0 on a cut or a held frame. */
    squash(cut:boolean,dt:number){
      let v=0;const q=MOVES[type].squash;
      if(q&&!cut&&dt>0&&last>=0)for(const [at,imp] of q)if(last<at&&p>=at)v+=imp;
      last=fade>0?p:-1;return v;
    },
  };
}
export type SkillDriver=ReturnType<typeof createSkillDriver>;
