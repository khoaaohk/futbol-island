// Freestyle tricks for the island's freestylers (Oct 4 2026, docs/player-moves/MOVES.md § G). Pure maths and data, no three.js,
// no allocation per frame: every sample writes into a caller-owned TrickFrame.
//
// A trick is a list of beats. Each beat starts with a CONTACT (the ball meets a boot, thigh, chest, neck or head, or rests on the
// ground) and then either HOLDS it (a stall, a sole roll) or sends the ball on an arc to the next beat's contact. Two kinds of contact:
// - posture contacts (laces, thigh, head, chest, neck): the body part goes to a fixed posture and the ball sits on it;
// - ball contacts (sole, inside, outside, heel, scoop, ground): the ball is at an authored spot and the boot is placed on it.
// The legs reach their targets through the rig's own analytic solve (trickPose.ts `solveTrickLeg`), so boot and ball meet by
// construction; tests/freestyle-tricks.cjs checks every contact on the solved bean rig and that the ball never sinks into the body.
//
// Every trick starts and ends in the same state: standing, the trick foot's sole on the ball at TRICK_REST. Routines
// (freestyleRoutine.ts) can therefore chain tricks and idle beats with no jumps, and loop.
// Frame: rig root, +z forward, +x = the side of the +1 (right) leg; `side` mirrors a trick for the left foot.
// Teaching purpose (AGENTS.md): each trick has a real name (WFFA / freestyle vocabulary, or The FA's ball-mastery drills) and a
// one-line football purpose, shown in the name tag, the conversation and the skill lab.
import {createTrickPose,type TrickPose,type TrickLeg} from './trickPose';

export const TRICK_R=.19;
export const TRICK_REST={x:0,y:.19,z:.55} as const;
export type TrickStance='stand'|'low'|'head'|'lean'|'bow'|'sit'|'lie';
export type TrickContact='laces'|'thigh'|'head'|'chest'|'neck'|'sole'|'inside'|'outside'|'heel'|'scoop'|'ground';
/** atw/atwIn: the kicking foot circles the ball (outside-in / inside-out); cross: the OTHER foot circles it; cushion: the
 *  stalling part gives with the ball; roll: the ball rolls across the shoulders; lin: constant horizontal speed (a pass);
 *  late: the ball rises first and moves forward later (behind-the-back flick). */
export type TrickFx='atw'|'atwIn'|'cross'|'cushion'|'roll'|'lin'|'late';
type P3=readonly [number,number,number];
export type TrickBeat={d:number;c:TrickContact;s:-1|0|1;st:TrickStance;h?:number;hold?:boolean;fx?:TrickFx;at?:P3;to?:P3;who?:'L'|'F';tb?:readonly [number,number]};
export type TrickCategory='sit'|'upper'|'lower'|'ground'|'pair';
export type TrickDef={id:string;label:string;purpose:string;category:TrickCategory;beats:readonly TrickBeat[];seconds:number;starts:readonly number[];pair:boolean;followSt:TrickStance};
/** Rig measurements the maths needs (root frame, before the root's scale). `ground` = the body's (y, radius) profile on the torso
 *  axis (bean `beanBody.ground`, else the classic one). Partner fields are used by pair tricks only. */
export type TrickCtx={legs:number;pelvisRest:number;headTop:number;ground:readonly number[];partnerD:number;partner:TrickCtx|null};
export type TrickFrame={pose:TrickPose;ball:{x:number;y:number;z:number};look:{x:number;y:number;z:number};air:boolean;contact:TrickContact|null};
export const CLASSIC_GROUND:readonly number[]=[.08,.17,.3,.19,.5,.18];
export const createTrickCtx=(o:Partial<TrickCtx>={}):TrickCtx=>({legs:1,pelvisRest:.88,headTop:1.89,ground:CLASSIC_GROUND,partnerD:5,partner:null,...o});
export const createTrickFrame=():TrickFrame=>({pose:createTrickPose(),ball:{x:TRICK_REST.x,y:TRICK_REST.y,z:TRICK_REST.z},look:{x:0,y:.2,z:.6},air:false,contact:null});

// ------------------------------------------------------------------------------------------------ authoring helpers
const R0:P3=[TRICK_REST.x,TRICK_REST.y,TRICK_REST.z];
type B=TrickBeat;
const J=(c:TrickContact,s:-1|0|1,d:number,h:number,st:TrickStance='stand',more:Partial<B>={}):B=>({c,s,d,h,st,...more});
const H=(c:TrickContact,s:-1|0|1,d:number,st:TrickStance='stand',more:Partial<B>={}):B=>({c,s,d,st,hold:true,...more});
/** Sole drag-back, the boot slides behind the ball, toe flick-up onto the first contact. */
const intro=(st:TrickStance='stand',h=.32):B[]=>[H('sole',1,.38,'stand',{at:R0,to:[0,.19,.42]}),J('ground',0,.3,0,'stand',{at:[0,.19,.42]}),J('scoop',1,.5,h,st,{at:[0,.19,.42]})];
/** The last flight lands in front (small bounce), then the trick foot steps on it: back to TRICK_REST. */
const outro=():B[]=>[J('ground',0,.34,.07,'stand',{at:R0}),H('sole',1,.36,'stand',{at:R0,to:R0})];
const F=(b:B):B=>({...b,who:'F'});

function def(id:string,label:string,purpose:string,category:TrickCategory,beats:B[],followSt:TrickStance='stand'):TrickDef{
 const starts:number[]=[];let t=0;for(const b of beats){starts.push(t);t+=b.d;}
 return {id,label,purpose,category,beats,seconds:t,starts,pair:beats.some(b=>b.who==='F'),followSt};
}
const L1=(d=.5,h=.48,st:TrickStance='stand',more:Partial<B>={})=>J('laces',1,d,h,st,more),L2=(d=.5,h=.45,st:TrickStance='stand',more:Partial<B>={})=>J('laces',-1,d,h,st,more);

export const FREESTYLE_TRICKS:readonly TrickDef[]=[
 // ---- lowers (WFFA "Lowers")
 def('keepUps','Keep-ups','Soft touches with a firm ankle: the base of every good first touch.','lower',
  [...intro(),L1(),L2(),L1(.48,.45),L2(.48,.45),L1(),L2(.55,.4),...outro()]),
 def('toeStall','Toe stall','Stop the ball dead on your foot: the perfect first touch.','lower',
  [...intro(),L1(.5,.45),L1(.5,.5),H('laces',1,1.4),L1(.5,.5),L2(.5,.4),...outro()]),
 def('instepCatch','Instep catch','Give with the foot to cushion a dropping ball.','lower',
  [...intro(),L1(.5,.5),L1(.72,1.1),H('laces',1,.8,'stand',{fx:'cushion'}),L1(.5,.45),L2(.5,.45),L1(.72,1.15),H('laces',1,.8,'stand',{fx:'cushion'}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('aroundWorld','Around the world','Fast feet that circle the ball and come back underneath: footwork for close control.','lower',
  [...intro(),L1(.5,.45),L1(.68,.6,'stand',{fx:'atw'}),L1(.5,.45),L2(.5,.45),L1(.68,.6,'stand',{fx:'atw'}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('aroundWorldIn','Inside around the world','Circling the other way trains balance and footwork on both sides of the ball.','lower',
  [...intro(),L1(.5,.45),L1(.68,.6,'stand',{fx:'atwIn'}),L1(.5,.45),L2(.5,.45),L1(.68,.6,'stand',{fx:'atwIn'}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('crossover','Crossover','The other leg goes around the ball: balance and coordination on one foot.','lower',
  [...intro(),L1(.5,.45),L1(.68,.6,'stand',{fx:'cross'}),L1(.5,.45),L2(.5,.45),L1(.68,.6,'stand',{fx:'cross'}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('heelFlick','Heel flick-up','Lift a ball off the ground without your hands, even from behind you.','lower',
  [H('sole',1,.45,'stand',{at:R0,to:[.32,.19,.18]}),H('sole',1,.5,'stand',{at:[.32,.19,.18],to:[.27,.19,-.47]}),J('ground',0,.4,0,'stand',{at:[.27,.19,-.47]}),
   J('heel',1,1.05,2.15,'stand',{at:[.27,.19,-.47],fx:'late'}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('kneeJuggles','Thigh juggles','Cushion a bouncing pass with the flat top of the thigh.','lower',
  [...intro('low'),J('thigh',1,.6,.5,'low'),J('thigh',-1,.6,.5,'low'),J('thigh',1,.6,.5,'low'),J('thigh',-1,.6,.4,'low'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('thighFoot','Thigh–foot combo','Choose the surface that fits the ball’s height: thigh for a high ball, foot for a low one.','lower',
  [...intro('low'),J('thigh',1,.6,.4,'low'),J('laces',1,.55,.55,'low'),J('thigh',-1,.6,.4,'low'),J('laces',-1,.55,.55,'low'),J('thigh',1,.6,.4,'low'),J('laces',1,.5,.45),L2(.55,.4),...outro()]),
 // ---- uppers
 def('headJuggles','Head juggles','Meet the ball with your forehead, eyes open and knees soft.','upper',
  [...intro(),L1(.5,.5),L1(.8,1.05,'head'),J('head',0,.56,.38,'head'),J('head',0,.56,.38,'head'),J('head',0,.56,.38,'head'),J('head',0,.62,.55,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('headStall','Head stall','Find the middle of the ball: the same skill that makes headers accurate.','upper',
  [...intro(),L1(.5,.5),L1(.8,1.05,'head'),J('head',0,.56,.35,'head'),H('head',0,1.7,'head'),J('head',0,.62,.55,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('chestJuggles','Chest juggles','Lean back and cushion a high ball on your chest.','upper',
  [...intro(),L1(.5,.5),L1(.82,1.0,'lean'),J('chest',0,.7,.42,'lean'),J('chest',0,.7,.42,'lean'),J('chest',0,.78,.35,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('neckStall','Neck stall','Keep your eyes on the ball and stay soft as it lands on you.','upper',
  [...intro(),L1(.5,.5),L1(.95,1.3,'bow',{tb:[0,.75]}),H('neck',0,1.8,'bow'),J('neck',0,.95,1.15,'stand',{tb:[.3,1]}),L1(.5,.45),L2(.55,.4),...outro()]),
 def('shoulderRoll','Shoulder roll','Move your body under the ball to keep it balanced.','upper',
  [...intro(),L1(.5,.5),L1(.95,1.3,'bow',{tb:[0,.75]}),H('neck',0,2.4,'bow',{fx:'roll'}),J('neck',0,.95,1.15,'stand',{tb:[.3,1]}),L1(.5,.45),L2(.55,.4),...outro()]),
 // ---- sit-downs (WFFA "Sitdowns")
 def('sitJuggle','Sitting juggles','Tiny touches with a soft ankle: the same cushion that settles a pass.','sit',
  [...intro(),L1(.5,.5),H('laces',1,1.3,'sit'),L1(.46,.32,'sit'),L2(.46,.32,'sit'),L1(.46,.32,'sit'),L2(.46,.32,'sit'),L1(.46,.32,'sit'),L2(.46,.32,'sit'),L1(.46,.32,'sit'),H('laces',1,1.3,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('sitCatch','Sit-down instep catch','Cushion a dropping ball so it stops dead on your foot.','sit',
  [...intro(),L1(.5,.5),H('laces',1,1.3,'sit'),L1(.46,.32,'sit'),L1(.75,.95,'sit'),H('laces',1,.9,'sit',{fx:'cushion'}),L1(.46,.32,'sit'),L1(.75,.95,'sit'),H('laces',1,.9,'sit',{fx:'cushion'}),H('laces',1,1.3,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('lieJuggle','Lying-down juggles','Both feet can control the ball, even from the ground.','sit',
  [...intro(),L1(.5,.5),H('laces',1,1.2,'sit'),H('laces',1,1.0,'lie'),L1(.5,.36,'lie'),L2(.5,.36,'lie'),L1(.5,.36,'lie'),L2(.5,.36,'lie'),L1(.5,.36,'lie'),H('laces',1,1.0,'sit'),H('laces',1,1.2,'stand'),L1(.5,.45),L2(.55,.4),...outro()]),
 def('sitToStand','Sit-up transition','Keep control while you get back up, like recovering after a fall in a match.','sit',
  [...intro(),L1(.5,.5),H('laces',1,1.3,'sit'),L1(.46,.32,'sit'),L2(.46,.32,'sit'),L1(.46,.32,'sit'),L1(1.05,1.35,'low',{tb:[.05,.8]}),J('thigh',1,.6,.45,'low'),L1(.5,.45),L2(.55,.4),...outro()]),
 // ---- ground ball mastery (The FA Foundation Phase: "love the ball")
 def('soleRolls','Sole rolls','Roll the ball with your sole to keep it close and shielded.','ground',
  [H('sole',1,.55,'stand',{at:R0,to:[-.2,.19,.55]}),J('ground',0,.26,0,'stand',{at:[-.2,.19,.55]}),H('sole',-1,.7,'stand',{at:[-.2,.19,.55],to:[.2,.19,.55]}),J('ground',0,.26,0,'stand',{at:[.2,.19,.55]}),
   H('sole',1,.7,'stand',{at:[.2,.19,.55],to:[-.2,.19,.55]}),J('ground',0,.26,0,'stand',{at:[-.2,.19,.55]}),H('sole',-1,.7,'stand',{at:[-.2,.19,.55],to:[.2,.19,.55]}),J('ground',0,.26,0,'stand',{at:[.2,.19,.55]}),H('sole',1,.55,'stand',{at:[.2,.19,.55],to:R0})]),
 def('toeTaps','Toe taps','Quick, light feet: stay on your toes, ready to move.','ground',
  [...Array.from({length:10},(_,i)=>J('sole',i%2?-1:1,.3,0,'stand',{at:R0})),H('sole',1,.32,'stand',{at:R0,to:R0})]),
 def('insideOutside','Inside–outside touches','Change direction with the ball glued to your foot.','ground',
  [H('sole',1,.4,'stand',{at:R0,to:[.24,.19,.55]}),J('ground',0,.22,0,'stand',{at:[.24,.19,.55]}),
   ...Array.from({length:6},(_,i)=>J(i%2?'outside':'inside',1,.34,0,'stand',{at:i%2?[-.04,.19,.55]:[.24,.19,.55]})),
   J('inside',1,.34,0,'stand',{at:[.24,.19,.55]}),J('ground',0,.26,0,'stand',{at:R0}),H('sole',1,.36,'stand',{at:R0,to:R0})]),
 // ---- pairs: two freestylers share one ball (the leader's); the partner's own ball waits beside them
 def('pairVolley','Keep-up passes','Control a lofted pass, then pass it back in two touches.','pair',
  [...intro(),L1(.5,.5),L1(1.05,1.15,'stand',{fx:'lin'}),F(J('thigh',1,.6,.5)),F(L1(.5,.45)),F(L1(1.05,1.15,'stand',{fx:'lin'})),J('thigh',1,.6,.5),L1(.5,.45),L1(1.05,1.15,'stand',{fx:'lin'}),
   F(J('thigh',1,.6,.5)),F(L1(1.05,1.15,'stand',{fx:'lin'})),J('thigh',1,.6,.5),L1(.5,.45),L2(.55,.4),...outro()]),
 def('pairHeader','Header rally','Head with your forehead, eyes open, aiming at your partner.','pair',
  [...intro(),L1(.5,.5),L1(.8,1.05,'head'),J('head',0,.56,.38,'head'),J('head',0,1.15,1.0,'head',{fx:'lin'}),F(J('head',0,1.15,1.0,'head',{fx:'lin'})),J('head',0,1.15,1.0,'head',{fx:'lin'}),
   F(J('head',0,1.15,1.0,'head',{fx:'lin'})),J('head',0,.62,.55,'stand'),L1(.5,.45),L2(.55,.4),...outro()],'head'),
 def('pairGround','Pass and flick-up','Pass along the ground with the inside of the foot; your partner receives it softly.','pair',
  [H('sole',1,.45,'stand',{at:R0,to:[-.06,.19,.62]}),J('ground',0,.3,0,'stand',{at:[-.06,.19,.62]}),J('inside',1,1.45,0,'stand',{at:[-.06,.19,.62],fx:'lin'}),
   F(H('sole',1,.5,'stand',{at:[0,.19,.6],to:[0,.19,.42]})),F(J('ground',0,.3,0,'stand',{at:[0,.19,.42]})),F(J('scoop',1,.5,.32,'stand',{at:[0,.19,.42]})),F(L1(.5,.45)),F(L1(1.05,1.15,'stand',{fx:'lin'})),
   J('thigh',1,.6,.5),L1(.5,.45),L2(.55,.4),...outro()]),
];
export type TrickId=string;
export const FREESTYLE_TRICK_IDS=FREESTYLE_TRICKS.map(t=>t.id);
export const trickById=(id:string)=>FREESTYLE_TRICKS.find(t=>t.id===id);

// ------------------------------------------------------------------------------------------------ maths
const sm=(v:number)=>{const t=v<0?0:v>1?1:v;return t*t*(3-2*t);};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
export function bodyRadius(ground:readonly number[],y:number){
 if(y<=ground[0])return ground[1];for(let k=2;k<ground.length;k+=2)if(y<=ground[k]){const a=ground[k-2],t=(y-a)/(ground[k]-a||1);return ground[k-1]+(ground[k+1]-ground[k-1])*t;}
 return ground[ground.length-1];
}
const setLeg=(l:TrickLeg,x:number,y:number,z:number,toe:number,w:number)=>{l.x=x;l.y=y;l.z=z;l.toe=toe;l.w=w;};
const setArm=(a:TrickPose['arms'][0],sx:number,sz:number,el:number,w:number)=>{a.sx=sx;a.sz=sz;a.el=el;a.w=w;};
/** The body for a stance (both legs at their rest spots, arms for balance). */
export function stancePose(st:TrickStance,ctx:TrickCtx,o:TrickPose){
 const PR=ctx.pelvisRest,L=o.legs,A=o.arms;
 o.w=1;o.pelvisZ=0;o.pelvisRoll=0;o.pelvisYaw=0;o.torsoRoll=0;o.torsoYaw=0;o.headYaw=0;
 setLeg(L[0],-.12,.075,.02,0,1);setLeg(L[1],.12,.075,.02,0,1);setArm(A[0],-.05,.7,-.35,.9);setArm(A[1],-.05,.7,-.35,.9);
 switch(st){
  case 'stand':o.pelvisY=PR-.03;o.pelvisPitch=.02;o.torsoPitch=0;o.headPitch=.35;break;
  case 'low':o.pelvisY=PR-.055;o.pelvisPitch=0;o.torsoPitch=-.04;o.headPitch=.4;break;
  case 'head':o.pelvisY=PR-.035;o.pelvisPitch=0;o.torsoPitch=0;o.headPitch=-.1;setArm(A[0],-.25,.62,-.55,.9);setArm(A[1],-.25,.62,-.55,.9);break;
  case 'lean':o.pelvisY=PR-.09;o.pelvisPitch=-.12;o.torsoPitch=-.33;o.headPitch=-.2;setLeg(L[0],-.15,.075,.1,0,1);setLeg(L[1],.15,.075,.1,0,1);setArm(A[0],.45,.75,-.35,1);setArm(A[1],.45,.75,-.35,1);break;
  case 'bow':o.pelvisY=PR-.1;o.pelvisZ=-.1;o.pelvisPitch=.5;o.torsoPitch=.9;o.headPitch=-1.2;setLeg(L[0],-.16,.075,-.04,0,1);setLeg(L[1],.16,.075,-.04,0,1);setArm(A[0],0,1.35,-.1,1);setArm(A[1],0,1.35,-.1,1);break;
  case 'sit':o.pelvisY=.25;o.pelvisPitch=-.35;o.torsoPitch=-.12;o.headPitch=.15;setLeg(L[0],-.15,.09,.8,-.2,1);setLeg(L[1],.15,.09,.8,-.2,1);setArm(A[0],.75,.32,-.15,1);setArm(A[1],.75,.32,-.15,1);break;
  case 'lie':o.pelvisY=.25;o.pelvisPitch=-1.4;o.torsoPitch=-.05;o.headPitch=.7;setLeg(L[0],-.12,.72,.24,0,1);setLeg(L[1],.12,.72,.24,0,1);setArm(A[0],0,1.15,-.1,1);setArm(A[1],0,1.15,-.1,1);break;
 }
 return o;
}
function lerpPose(a:TrickPose,b:TrickPose,k:number,o:TrickPose){
 const m=(x:number,y:number)=>x+(y-x)*k;
 o.w=m(a.w,b.w);o.pelvisY=m(a.pelvisY,b.pelvisY);o.pelvisZ=m(a.pelvisZ,b.pelvisZ);o.pelvisPitch=m(a.pelvisPitch,b.pelvisPitch);o.pelvisRoll=m(a.pelvisRoll,b.pelvisRoll);o.pelvisYaw=m(a.pelvisYaw,b.pelvisYaw);
 o.torsoPitch=m(a.torsoPitch,b.torsoPitch);o.torsoRoll=m(a.torsoRoll,b.torsoRoll);o.torsoYaw=m(a.torsoYaw,b.torsoYaw);o.headPitch=m(a.headPitch,b.headPitch);o.headYaw=m(a.headYaw,b.headYaw);
 for(let i=0;i<2;i++){const p=a.legs[i],q=b.legs[i],r=o.legs[i];r.x=m(p.x,q.x);r.y=m(p.y,q.y);r.z=m(p.z,q.z);r.toe=m(p.toe,q.toe);r.w=m(p.w,q.w);
  const s=a.arms[i],t=b.arms[i],u=o.arms[i];u.sx=m(s.sx,t.sx);u.sz=m(s.sz,t.sz);u.el=m(s.el,t.el);u.w=m(s.w,t.w);}
}
/** Boots step over a ball on the ground; posture touches (a raised foot or thigh) rise straight to the ball. */
/** (negative = a side touch: the boot swings round BEHIND the ball by that much instead of over it). */
const arcOf=(c:TrickContact)=>isPosture(c)||c==='scoop'||c==='heel'?0:c==='inside'||c==='outside'?-.3:.14;
const isPosture=(c:TrickContact)=>c==='laces'||c==='thigh'||c==='head'||c==='chest'||c==='neck';
const hasLimb=(c:TrickContact)=>c!=='head'&&c!=='chest'&&c!=='neck'&&c!=='ground';
/** Offsets from the ankle joint to the ball centre for each boot surface (σ = the leg's side), foot level with the ground. */
export const TRICK_SURFACE={laces:[0,.21,.16],sole:[0,-.265,.06],heel:[0,.115,-.26],inside:[-.2,.095,.1],outside:[.2,.095,.1]} as const;
type V={x:number;y:number;z:number};
const tmpPose=createTrickPose(),tmpPose2=createTrickPose();
/** Torso-frame point (0, y, z) of a stance pose → rig frame. */
function torsoPoint(p:TrickPose,y:number,z:number,o:V){const f=p.pelvisPitch+p.torsoPitch,c=Math.cos(f),s=Math.sin(f);o.x=0;o.y=p.pelvisY+y*c-z*s;o.z=p.pelvisZ+y*s+z*c;return o;}
/**
 * Where contact `c` puts the ball and the touching leg, for stance pose `p` (σ = the leg's side; `at` = the authored ball spot for
 * ball contacts, already mirrored). Returns false for contacts without a leg (head, chest, neck, ground).
 */
export function contactPlace(c:TrickContact,σ:number,p:TrickPose,st:TrickStance,ctx:TrickCtx,at:V,leg:TrickLeg,ball:V):boolean{
 const R=TRICK_R,g=ctx.legs;
 switch(c){
  case 'laces':{
   if(st==='sit')setLeg(leg,σ*.14,.42,.62,0,1);else if(st==='lie')setLeg(leg,σ*.12,.8,.3,0,1);else setLeg(leg,σ*.11,.24,.48,0,1);
   ball.x=leg.x;ball.y=leg.y+TRICK_SURFACE.laces[1];ball.z=leg.z+TRICK_SURFACE.laces[2];return true;}
  case 'thigh':setLeg(leg,σ*.108,p.pelvisY-.4*g,.43*g,0,1);ball.x=leg.x;ball.y=p.pelvisY+.09+R;ball.z=.41*g;return true;
  case 'head':torsoPoint(p,ctx.headTop-ctx.pelvisRest+R+.005,.02,ball);return false;
  case 'chest':torsoPoint(p,.46,bodyRadius(ctx.ground,.46)+R,ball);return false;
  case 'neck':torsoPoint(p,.7,-(bodyRadius(ctx.ground,.7)+R),ball);return false;
  case 'ground':ball.x=at.x;ball.y=at.y;ball.z=at.z;return false;
  case 'scoop':ball.x=at.x;ball.y=at.y;ball.z=at.z;setLeg(leg,at.x,.075,at.z-.36,0,1);return true;
  default:{const o=c==='sole'?TRICK_SURFACE.sole:c==='heel'?TRICK_SURFACE.heel:c==='inside'?TRICK_SURFACE.inside:TRICK_SURFACE.outside,ox=c==='inside'||c==='outside'?o[0]*σ:o[0];
   ball.x=at.x;ball.y=at.y;ball.z=at.z;setLeg(leg,at.x-ox,at.y-o[1],at.z-o[2],0,1);return true;}
 }
}
const sAt:V={x:0,y:0,z:0},sAt2:V={x:0,y:0,z:0},sBall:V={x:0,y:0,z:0},sBall2:V={x:0,y:0,z:0},sP0:V={x:0,y:0,z:0},sP1:V={x:0,y:0,z:0};
const sLeg:TrickLeg={x:0,y:0,z:0,toe:0,w:0},sLeg2:TrickLeg={x:0,y:0,z:0,toe:0,w:0};
const atOf=(b:TrickBeat,end:boolean,side:number,o:V)=>{const p=(end?b.to:undefined)??b.at??R0;o.x=p[0]*side;o.y=p[1];o.z=p[2];return o;};
/** Blend one leg of `pose` toward a target by w. */
/** Blend one leg of `pose` toward a target by w; mid-blend the boot lifts by `arc` so it steps over the ball, not through it. */
const pull=(pose:TrickPose,σ:number,t:TrickLeg,w:number,arc=.14)=>{if(w<=0)return;const l=pose.legs[σ<0?0:1],m=w<1?Math.sin(Math.PI*w):0;l.x+=(t.x-l.x)*w;l.y+=(t.y-l.y)*w+(arc>0?arc:arc<0?.06:0)*m;l.z+=(t.z-l.z)*w-(arc<0?-arc:0)*m;l.toe+=(t.toe-l.toe)*w;l.w+=(1-l.w)*w;};
/** Map a point in the partner's frame (facing each other, `d` apart) into ours. */
const fromPartner=(o:V,d:number)=>{o.x=-o.x;o.z=d-o.z;return o;};
const stanceAt=(def:TrickDef,i:number):TrickStance=>i<=0?(def.beats[0]?.st==='sit'||def.beats[0]?.st==='lie'?def.beats[0].st:'stand'):def.beats[i-1].st;
/** Ball spot of contact j under the stance it happens in (the previous beat's stance, the beat boundary). Who's frame: ours. */
function contactPoint(def:TrickDef,j:number,side:number,ctx:TrickCtx,ball:V,leg:TrickLeg|null,forFollow:boolean):boolean{
 const n=def.beats.length;
 if(j>=n){ball.x=R0[0];ball.y=R0[1];ball.z=R0[2];if(leg)contactPlace('sole',side,stancePose('stand',ctx,tmpPose2),'stand',ctx,ball,leg,sBall2);return !!leg;}
 const b=def.beats[j],partnerFrame=(b.who==='F')!==forFollow,c2=partnerFrame&&ctx.partner?ctx.partner:ctx,st=stanceAt(def,j);
 const stance=partnerFrame&&!forFollow?def.followSt:forFollow&&b.who==='F'?def.followSt:st;
 const p=stancePose(stance,c2,tmpPose2),prev=j>0?def.beats[j-1]:null,at=prev&&prev.hold&&prev.c===b.c&&prev.s===b.s&&!isPosture(b.c)?atOf(prev,true,side,sAt2):atOf(b,false,side,sAt2);
 const limb=contactPlace(b.c,b.s*side,p,stance,c2,at,leg??sLeg2,ball);
 if(partnerFrame)fromPartner(ball,ctx.partnerD);
 return limb&&!partnerFrame;
}
/**
 * Pose and ball for trick `def` at τ seconds (0 … def.seconds) with the trick foot `side`. role 'lead' = the pair's ball owner;
 * 'follow' = the partner (its own ball waits beside it; `look` follows the shared ball). Solo tricks ignore the role.
 */
export function sampleTrick(def:TrickDef,τ:number,side:-1|1,ctx:TrickCtx,out:TrickFrame,role:'solo'|'lead'|'follow'='solo'):TrickFrame{
 if(role==='follow')return sampleFollow(def,τ,side,ctx,out);
 const beats=def.beats,n=beats.length;τ=clamp(τ,0,def.seconds);
 let i=0;while(i<n-1&&τ>=def.starts[i+1])i++;
 const b=beats[i],q=clamp((τ-def.starts[i])/b.d,0,1),stPrev=stanceAt(def,i),pose=out.pose;
 const tb=b.tb??[0,1],k=stPrev===b.st?1:sm((q-tb[0])/(tb[1]-tb[0]));
 if(k>=1)stancePose(b.st,ctx,pose);else{stancePose(stPrev,ctx,tmpPose);stancePose(b.st,ctx,pose);lerpPose(tmpPose,pose,k,pose);}
 const own=b.who!=='F',σ=b.s*side,ball=out.ball;out.contact=null;out.air=false;
 if(b.hold){
  out.contact=b.c;
  if(isPosture(b.c)){
   // A posture held through a stance change (sit down / stand up / lie back with the ball stalled on the foot).
   const s0=k>=1?b.st:stPrev,pA=stancePose(s0,ctx,tmpPose);contactPlace(b.c,σ,pA,s0,ctx,sAt,sLeg,sBall);
   if(k<1){const pB=stancePose(b.st,ctx,tmpPose2);contactPlace(b.c,σ,pB,b.st,ctx,sAt,sLeg2,sBall2);
    sLeg.x+=(sLeg2.x-sLeg.x)*k;sLeg.y+=(sLeg2.y-sLeg.y)*k;sLeg.z+=(sLeg2.z-sLeg.z)*k;sBall.x+=(sBall2.x-sBall.x)*k;sBall.y+=(sBall2.y-sBall.y)*k;sBall.z+=(sBall2.z-sBall.z)*k;}
   ball.x=sBall.x;ball.y=sBall.y;ball.z=sBall.z;
  }else{atOf(b,false,side,sAt);atOf(b,true,side,sAt2);const e=sm(q);sAt.x+=(sAt2.x-sAt.x)*e;sAt.y+=(sAt2.y-sAt.y)*e;sAt.z+=(sAt2.z-sAt.z)*e;contactPlace(b.c,σ,pose,b.st,ctx,sAt,sLeg,ball);}
  if(b.fx==='cushion'){const c=.07*Math.sin(Math.PI*q);sLeg.y-=c;ball.y-=c;}
  if(b.fx==='roll'){const r=Math.sin(2*Math.PI*q);ball.x+=.2*r;pose.torsoRoll-=.1*r;pose.pelvisRoll-=.04*r;}
  if(b.who==='F')fromPartner(ball,ctx.partnerD);
  else if(hasLimb(b.c))pull(pose,σ,sLeg,1);
 }else{
  // In flight (or rolling): from this beat's contact to the next one.
  const limb0=contactPoint(def,i,side,ctx,sP0,sLeg,false),next=i+1<n?beats[i+1]:null,limb1=contactPoint(def,i+1,side,ctx,sP1,sLeg2,false);
  const h=b.h??0,hz=b.fx==='lin'?q:b.fx==='late'?sm((q-.3)/.5):sm(q);
  ball.x=sP0.x+(sP1.x-sP0.x)*hz;ball.z=sP0.z+(sP1.z-sP0.z)*hz;ball.y=sP0.y+(sP1.y-sP0.y)*q+4*q*(1-q)*h;out.air=h>.05;
  if(q<.02)out.contact=b.c;
  const decay=1-sm(q/.3);
  // A hold that ends on another contact (a sole roll before a pass) lets go over the first 30 %.
  const prev=i>0?beats[i-1]:null;
  if(prev&&prev.hold&&prev.who!=='F'&&hasLimb(prev.c)&&(prev.c!==b.c||prev.s!==b.s)){const σp=prev.s*side;atOf(prev,true,side,sAt);contactPlace(prev.c,σp,stancePose(stPrev,ctx,tmpPose),stPrev,ctx,sAt,sLeg,sBall);pull(pose,σp,sLeg,decay,arcOf(prev.c));contactPoint(def,i,side,ctx,sP0,sLeg,false);}
  if(limb0&&own)pull(pose,σ,sLeg,decay,arcOf(b.c));
  if(limb1&&next&&(next.who!=='F'||i+1>=n))pull(pose,(i+1<n?next.s:1)*side,sLeg2,sm((q-.62)/.38),arcOf(next.c));
  if(i+1>=n)pull(pose,side,sLeg2,sm((q-.62)/.38));
  if(own&&(b.fx==='atw'||b.fx==='atwIn'||b.fx==='cross')){
   const w=sm((q-.08)/.12)*(1-sm((q-.74)/.12)),a=2*Math.PI*sm((q-.12)/.6),cross=b.fx==='cross',σc=cross?-σ:σ,dir=b.fx==='atwIn'||cross?-1:1;
   sLeg.x=ball.x+σc*.31*Math.sin(a)*dir;sLeg.y=Math.max(.075,ball.y-.31*Math.cos(a));sLeg.z=ball.z-.1;sLeg.toe=0;pull(pose,σc,sLeg,w,0);
  }
 }
 look(pose,ball,b.st,out);
 return out;
}
/** Head follows the ball (not while heading, bowing or lying down, where the stance sets it). */
function look(pose:TrickPose,ball:V,st:TrickStance,out:TrickFrame){
 out.look.x=ball.x;out.look.y=ball.y;out.look.z=ball.z;
 if(st==='head'||st==='bow'||st==='lie')return;
 const f=pose.pelvisPitch+pose.torsoPitch,dz=Math.max(.25,ball.z-pose.pelvisZ),eye=pose.pelvisY+.95*Math.cos(f);
 pose.headPitch=clamp(Math.atan2(eye-ball.y,dz)-f,-.8,.9)*.8+pose.headPitch*.2;pose.headYaw=clamp(Math.atan2(ball.x,dz),-.5,.5);
}
const followBall=createTrickFrame();
const PARK_T=[.2,.4,1.1,1.3] as const;
/** The pair partner: parks its own ball beside it with the other foot, plays its touches on the shared ball, takes its ball back. */
function sampleFollow(def:TrickDef,τ:number,side:-1|1,ctx:TrickCtx,out:TrickFrame):TrickFrame{
 const beats=def.beats,n=beats.length,T=def.seconds;τ=clamp(τ,0,T);
 const pose=stancePose(def.followSt,ctx,out.pose),ball=out.ball,o=-side;
 // Own ball: the trick foot lets go, the other foot rolls the ball to the park spot (and back at the end).
 const e=Math.min(τ,T-τ),park=sm((e-PARK_T[1])/(PARK_T[2]-PARK_T[1])),px=o*.55,pz=.18;
 sAt.x=R0[0]+(px-R0[0])*park;sAt.y=R0[1];sAt.z=R0[2]+(pz-R0[2])*park;ball.x=sAt.x;ball.y=sAt.y;ball.z=sAt.z;
 contactPlace('sole',side,pose,def.followSt,ctx,sAt,sLeg,sBall);pull(pose,side,sLeg,1-sm(e/PARK_T[0]));
 contactPlace('sole',o,pose,def.followSt,ctx,sAt,sLeg,sBall);pull(pose,o,sLeg,sm((e-PARK_T[0])/(PARK_T[1]-PARK_T[0]))*(1-sm((e-PARK_T[2])/(PARK_T[3]-PARK_T[2]))));
 out.contact=null;out.air=false;
 // Its touches on the shared ball (the leader's beats marked F), in its own frame.
 let i=0;while(i<n-1&&τ>=def.starts[i+1])i++;
 const b=beats[i],q=clamp((τ-def.starts[i])/b.d,0,1);
 if(b.who==='F'&&b.hold&&hasLimb(b.c)){atOf(b,false,side,sAt);atOf(b,true,side,sAt2);const k=sm(q);sAt.x+=(sAt2.x-sAt.x)*k;sAt.z+=(sAt2.z-sAt.z)*k;contactPlace(b.c,b.s*side,pose,def.followSt,ctx,sAt,sLeg,sBall);pull(pose,b.s*side,sLeg,1);}
 else{
  if(b.who==='F'&&!b.hold&&contactPoint(def,i,side,ctx,sP0,sLeg,true))pull(pose,b.s*side,sLeg,1-sm(q/.3),arcOf(b.c));
  const prev=i>0?beats[i-1]:null;
  if(b.who!=='F'&&prev&&prev.who==='F'&&prev.hold&&hasLimb(prev.c)){atOf(prev,true,side,sAt);contactPlace(prev.c,prev.s*side,pose,def.followSt,ctx,sAt,sLeg,sBall);pull(pose,prev.s*side,sLeg,1-sm(q/.3),arcOf(prev.c));}
  const next=i+1<n?beats[i+1]:null;
  if(next&&next.who==='F'&&contactPoint(def,i+1,side,ctx,sP1,sLeg2,true))pull(pose,next.s*side,sLeg2,sm((q-.62)/.38),arcOf(next.c));
 }
 // Watch the shared ball (the leader's sample, mapped into our frame).
 if(ctx.partner){const lead=sampleTrick(def,τ,side,ctx.partner,followBall,'lead');sBall.x=lead.ball.x;sBall.y=lead.ball.y;sBall.z=lead.ball.z;fromPartner(sBall,ctx.partnerD);look(pose,sBall,def.followSt,out);}
 else look(pose,ball,def.followSt,out);
 return out;
}
/** Contacts the trick's own body makes: beat starts (and holds), for tests and the lab. */
export function trickContacts(def:TrickDef){return def.beats.map((b,i)=>({t:def.starts[i],beat:i,c:b.c,s:b.s,hold:!!b.hold,who:b.who??'L'}));}

/**
 * Idle beat between tricks (`dur` s): the sole rests on the ball at TRICK_REST and the head scans around the court; the resting
 * foot changes from `from` to `to` halfway when the next trick uses the other foot.
 */
export function sampleIdle(τ:number,dur:number,from:-1|1,to:-1|1,ctx:TrickCtx,out:TrickFrame,seed=0):TrickFrame{
 const pose=stancePose('stand',ctx,out.pose),q=dur>0?clamp(τ/dur,0,1):1;
 out.ball.x=R0[0];out.ball.y=R0[1];out.ball.z=R0[2];out.air=false;out.contact=null;
 contactPlace('sole',from,pose,'stand',ctx,out.ball,sLeg,sBall);
 const lift=from===to?(dur>2.4?sm((τ-.6)/.3)*(1-sm((τ-dur+.9)/.3)):0):sm((q-.35)/.15);
 pull(pose,from,sLeg,1-lift);
 if(from!==to){contactPlace('sole',to,pose,'stand',ctx,out.ball,sLeg,sBall);pull(pose,to,sLeg,sm((q-.5)/.15));}
 // Scanning: a shoulder check left and right, as a player does before receiving (eased in and out at the ends).
 const env=sm(τ/.5)*sm((dur-τ)/.5);pose.headYaw=.55*Math.sin(τ*1.3+seed)*env;pose.headPitch=.35-.25*env;
 out.look.x=Math.sin(pose.headYaw)*3;out.look.y=1.4;out.look.z=3;
 return out;
}
