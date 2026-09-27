/** Riso athlete — the shared footballer figure library for the iconic-play films (lib/plays/riso/<film>.ts).
 *
 * WHY: film figures were thin, stiff and stick-like ("needs more range of motion", then "the body artwork needs to be more fluid").
 * This library poses a 3D skeleton with full range of motion and prints ONE continuous, organic, kitted body through the riso Sheet,
 * so a figure 90–140 css px tall in a 360×240 card window reads as a flowing footballer (sports illustration / riso poster), not a pictogram.
 *
 * ─── DROP-IN ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *   import {drawAthlete,runCycle,strike,figureCam,makeCamera} from './athlete';
 *   const cam=figureCam({x:gx,y:gy,height:h,azimuth:0});                 // or makeCamera({pos,target,fov,size,center}) / your own projector
 *   drawAthlete(s,strike(t),cam,KIT,{},{prev:strike(t-1/12)});           // pose + camera + style (+ place, + previous pose for secondary motion)
 *   A KIT is plain data: {shirt:'red',shorts:'navy',socks:'red',boots:'navy',skin:[['yellow',.88],['red',.2]],hair:'navy',line:'navy',number:10}.
 *
 * ─── COORDINATES ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *  World: metres, RIGHT-HANDED, y up, ground at y = 0. A figure with place.yaw = 0 faces +x; its right side is +z; positive yaw turns it
 *  left (counter-clockwise seen from above). A film whose world is left-handed (e.g. X right, Z away from the camera) wraps its projector
 *  to negate z, or the players kick with the wrong foot.
 *  Sheet: drawAthlete draws in the sheet's CURRENT world units (whatever camera()/transform the film has set). The projector maps metres to
 *  those units; line weight and the auto detail level read the sheet transform, so they hold a constant css-px weight at any zoom.
 *
 * ─── POSE ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *  `Pose` = joint ANGLES (radians) + root offsets (metres), 32 numbers (POSE_KEYS) — not joint positions: solve() runs forward
 *  kinematics, so every bone keeps its length in every pose and every blend. Channels:
 *   dx,dz      root shift on the ground (m, local: dx forward, dz right)      air   height of the lowest body point above the ground (m)
 *   yaw        whole body turn (+ = left)     pitch  whole body tilt forward (+) / back (−)     roll  whole body tilt to its right (+; a dive ≈ ±90°)
 *   twist      shoulders vs hips (+ = shoulders turned left)     lean  spine flex forward (+) / arch back (−)     bend  spine side-bend right (+)
 *   neckP      head nod (+ chin down)       neckY  head turn (+ left)
 *   l|r HipF   thigh swing forward (+) / back (−)    HipA  thigh out to the side (+) / across the midline (−)    HipR  thigh rotation, toes out (+)
 *   l|r Knee   knee bend (0 straight … 150° heel to glute)      Ank  toe pointed (+) / pulled up (−)
 *   l|r ShF    arm swing forward/up (+, 180° overhead) / back (−)    ShA  arm out to the side / up (+)    ShR  upper-arm rotation (+ out)
 *   l|r Elb    elbow bend       l|r Hand  0 fist … 1 open palm (keepers reaching)
 *   squash     squash (−) / stretch (+) along the body axis, volume preserving, drawn only (the skeleton stays rigid): landings, plants, strikes
 *  Grounding is automatic: after FK the lowest contact surface (toes, heels, knees, hands, hips, back, head) sits at y = air, so the pelvis
 *  bobs through a stride, a slide lands on the hip and a knee slide on the shins with no hand tuning. LIMITS (degrees, slightly exaggerated
 *  as an animator would) are enforced by clampPose(); every generator returns a clamped pose.
 *
 * ─── GENERATORS (return a Pose; phase / t ∈ [0,1]; left/right via foot / side / hand; mirrorPose() swaps any pose) ─────────────
 *  stand()                                    ready stance on the balls of the feet
 *  runCycle(phase,{speed,stride,armOut})      jog (0) … sprint (1): high knee drive, heel kick to the glute, bent-elbow arm drive, lean from the
 *                                             ankles, flight phase; squash through the loading stance, stretch in flight. phase 0 = right foot
 *                                             down, .5 = left. Advance phase by dt·runCadence(speed).
 *  dribble(phase,{foot,speed})                short quick stride, head over the ball; the touch foot reaches the ball at phase touchPhase (.97)
 *  strike(t,{foot,power})                     approach → plant (.22) → backswing (.4) → CONTACT (STRIKE_CONTACT .52) → big follow-through (.7) → land
 *  volley(t,{foot,height})                    side-on, swivel on the standing leg, kicking leg high and round; contact .5
 *  header(t)                                  crouch → take-off (.22) → arched peak (.42) → neck snap / CONTACT (.52) → land
 *  keeperSet(t) (loops)                       set position with a small bounce on the toes
 *  keeperDive(t,{side,height})                load → launch (.35) → full extension, palms reaching (.55; angled up for a top-corner dive) → land (.9)
 *  keeperTip(t,{hand})                        back-pedal leap, one palm up and over the bar (touch .62, palm above 2.44 m)
 *  keeperScoop(t)                             drop onto one knee, gather a low ball into the chest
 *  slideTackle(t,{foot})                      run → drop → slide on the hip, lead leg long and low, tucked shin flat under it, arm back
 *  backpedal(phase) (loops) / lunge(t,{side}) defender: low backward shuffle; a jab/lunge leg toward the ball (full reach .6)
 *  celebrate(t,{kind})                        'arms' (loops: jump, both arms up), 'kneeSlide' (run, drop, slide on the knees, arms up, head back),
 *                                             'run' (loops: airplane arms)
 *  rabona(t,{foot})                           plant (.25), wind-up (.42), the kicking leg WRAPS BEHIND the standing leg to strike (RABONA_CONTACT .58)
 *  Author new moves with posed({...degrees}) and keyPoses(t, [[t0, pose], ...]).
 *
 * ─── MOTION PRINCIPLES (built in) ────────────────────────────────────────────────────────────────────────────────────────────────
 *  • Continuous interpolation: keyPoses is a C¹ monotone Hermite spline through the keys (no pops, no overshoot) with a touch of slow-in /
 *    slow-out at every key and zero velocity at the ends; cycles are periodic splines. Hands, feet and head travel on smooth arcs because
 *    the ANGLES are splined and the bones are rigid.
 *  • Overlapping action: in keyed moves the torso, arms and head sample the spline slightly late (OVERLAP; keyPoses(t,keys,lag)), so they
 *    trail the hips; in the run cycle the arms and shoulders trail the legs.
 *  • Squash & stretch: the squash channel (plants and landings squash, take-offs and strikes stretch).
 *  • Follow-through and secondary motion: pass motion.prev (the pose one drawn frame earlier) to drawAthlete and long hair / ponytails and
 *    the shirt hem trail the movement; motionSmear() adds echo limbs and speed arcs for fast feet and hands.
 *  blendPose(a,b,t): per-channel mix of the angles (t ≤ 0 → a exactly, t ≥ 1 → b exactly); ease t yourself for a transition.
 *  solve(pose,build?,place?,scale?) → Skeleton: world joints (pelvis, chest, neck, head, face, l/r Sh, El, Ha, Hip, Kn, An, Toe, Heel) + frames
 *  — put the ball on a boot (sk.rToe) or a glove (sk.lHa).
 *
 * ─── CAMERA ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *  makeCamera({pos,target,fov,size?,center?}) pinhole camera; fov = vertical degrees spanning `size` sheet units (1080); target lands on
 *                                              `center`. Side, broadcast-high and low three-quarter views are just positions; close + wide
 *                                              fov = strong foreshortening.
 *  figureCam({x,y,height,azimuth,elevation,fov,at})  one billboarded figure: the ground under `at` lands on sheet (x,y) and a 1.8 m body is
 *                                              `height` units tall. azimuth 0 = seen from its right (side view), 90 = front, −90 = behind.
 *  Any {eye, project(p)→[x,y,depth], scale?(p)} is accepted, so a film can pass its own projector.
 *
 * ─── DRAW ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *  drawAthlete(sheet,pose,camera,style,place?,motion?) → {sk, joints (sheet points), heightPx, detail, ops}
 *    style: kit inks shirt / shorts / socks / boots / trim / hair / skin screens / gloves; pattern 'plain'|'stripes'|'hoops' + patternInk
 *           ('paper' = white stripes); number + numberInk ('paper' = a hole in the shirt ink); hairStyle 'short'|'long'|'bald'|'balding'|
 *           'ponytail'|'curly'; sleeves 'short'|'long'; build {height, bulk, thighs, head}; scale; detail 'auto'|'low'|'mid'|'high'; shadow;
 *           line (key ink); shade; lineWeight; seed. InkFill = ink name (solid) | [ink, coverage] (halftone) | 'paper' | null (skip).
 *           Skin reads best as one flat screen (≥ .75) + at most one light screen (≤ .2): the engine's halftone pitch is ~4.5 css px.
 *    place: {x, z, y?, yaw?} on the ground (metres, yaw radians).   motion: {prev?, prevPlace?} for hair / hem secondary motion.
 *  THE BODY IS ONE ORGANIC SILHOUETTE. Limbs are dense Catmull-Rom spans through muscle knots (quad swelling forward, calf bulging behind
 *  the shin into a slim ankle, deltoid and biceps, forearm swell into the wrist) with round joint caps; the torso is a rounded hull of
 *  elliptical rings (V-taper, deltoid caps, hips); the head is a sphere + jaw + nose (the face points where the head looks) with a 3D hair
 *  cap; boots are the hull of a shaped last. Each DEPTH LAYER (limbs behind the torso · torso + head · limbs in front) prints its contour
 *  ribbons FIRST and then its knockout, which erases the inner half of every contour and every seam between the layer's parts — what is
 *  left is one continuous outline around the union: no joint seams, no stiff segments. Attached limbs have OPEN contours that taper into
 *  the body (soft shoulders and hips). Kit edges are ink changes, not lines. Shade: a halftone band on the side away from the light
 *  (overprinting the kit), far limbs a step darker. Ground shadow first.
 *  motionSmear(sheet,prevPose,pose,camera,style,place?,{prevPlace}) — call BEFORE drawAthlete. groundShadow(...) is exported too.
 *
 * ─── BUDGET (plate ops per figure on a 4-ink sheet; a knockout costs one op per plate) ─────────────────────────────────────────
 *  'mid' ≈ 28–36 (card-window figure 50–170 px; auto), 'high' ≈ 28–36 (≥ 170 px: the same ops, more geometry and detail lines),
 *  'low' ≈ 9–10 (wide shots < 50 px: one layer, stroked outline, one skin screen). motionSmear ≤ 2 ops. Desktop CPU (warm): ≈ 0.4 ms per
 *  card figure, ≈ 1 ms per hero figure, ≈ 0.13 ms per low figure (22 in 2.8 ms). Everything is a pure function of its inputs (no clock,
 *  no Math.random); wobble is seeded by style.seed.
 */
import type {Sheet} from '../../paths/riso/sheet';
import {clamp,ribbon,smoothPts,TAU,type Pt} from '../../paths/riso/motion';
import {crescent} from '../../paths/riso/shapes';

// ─────────────────────────────────────────── vectors & frames ───────────────────────────────────────────
export type V3=[number,number,number];
type M3=number[];// row-major 3×3; columns are the frame's x (forward), y (up), z (right) axes
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const len=(a:V3)=>Math.hypot(a[0],a[1],a[2]);
const nrm=(a:V3):V3=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];};
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const mm=(a:M3,b:M3):M3=>{const r:number[]=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];return r;};
const mv=(m:M3,v:V3):V3=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
const Rx=(a:number):M3=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,c,-s,0,s,c];};
const Ry=(a:number):M3=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,s,0,1,0,-s,0,c];};
const Rz=(a:number):M3=>{const c=Math.cos(a),s=Math.sin(a);return[c,-s,0,s,c,0,0,0,1];};
const axis=(m:M3,i:0|1|2):V3=>[m[i],m[3+i],m[6+i]];
/** point in frame m at local offset o from base b */
const at=(b:V3,m:M3,o:V3):V3=>add(b,mv(m,o));

// ─────────────────────────────────────────── pose model ───────────────────────────────────────────
export const POSE_KEYS=['dx','dz','air','yaw','pitch','roll','twist','lean','bend','neckP','neckY',
 'lHipF','lHipA','lHipR','lKnee','lAnk','rHipF','rHipA','rHipR','rKnee','rAnk',
 'lShF','lShA','lShR','lElb','rShF','rShA','rShR','rElb','lHand','rHand','squash'] as const;
export type PoseKey=typeof POSE_KEYS[number];
export type Pose=Record<PoseKey,number>;
/** channels that are NOT angles (metres or 0..1) */
const LINEAR:ReadonlySet<PoseKey>=new Set<PoseKey>(['dx','dz','air','lHand','rHand','squash']);
const R=Math.PI/180;
/** joint limits: angles in DEGREES, linear channels in their own units */
export const LIMITS:Record<PoseKey,[number,number]>={
 dx:[-6,6],dz:[-6,6],air:[0,2],yaw:[-360,360],pitch:[-100,100],roll:[-100,100],twist:[-70,70],lean:[-45,80],bend:[-45,45],neckP:[-55,60],neckY:[-85,85],
 lHipF:[-55,135],lHipA:[-45,95],lHipR:[-50,60],lKnee:[0,150],lAnk:[-30,65],rHipF:[-55,135],rHipA:[-45,95],rHipR:[-50,60],rKnee:[0,150],rAnk:[-30,65],
 lShF:[-80,195],lShA:[-15,180],lShR:[-90,90],lElb:[0,150],rShF:[-80,195],rShA:[-15,180],rShR:[-90,90],rElb:[0,150],lHand:[0,1],rHand:[0,1],squash:[-.3,.3],
};
const ZERO=():Pose=>{const p={} as Pose;for(const k of POSE_KEYS)p[k]=0;return p;};
/** the neutral stance every authored pose starts from (degrees) */
const BASE_DEG:Partial<Pose>={lShA:9,rShA:9,lShF:4,rShF:4,lElb:18,rElb:18,lKnee:6,rKnee:6,lHipF:4,rHipF:4,lHipA:4,rHipA:4,lAnk:2,rAnk:2,neckP:2,lean:3};
/** posed({...}): author a pose in DEGREES (and metres for dx/dz/air, 0..1 for hands); unspecified channels take the neutral stance. */
export function posed(d:Partial<Pose>={},base:Partial<Pose>=BASE_DEG):Pose{const p=ZERO();for(const k of POSE_KEYS){const v=d[k]??base[k]??0;p[k]=LINEAR.has(k)?v:v*R;}return p;}
/** clampPose: every channel inside LIMITS (non-finite → 0). */
export function clampPose(p:Pose):Pose{const o=ZERO();for(const k of POSE_KEYS){const[lo,hi]=LIMITS[k],s=LINEAR.has(k)?1:R,v=Number.isFinite(p[k])?p[k]:0;o[k]=clamp(v,lo*s,hi*s);}return o;}
/** blendPose(a,b,t): t ≤ 0 → a exactly, t ≥ 1 → b exactly, else a per-channel mix (rigid bones: angles are blended, not points). */
export function blendPose(a:Pose,b:Pose,t:number):Pose{const o=ZERO();for(const k of POSE_KEYS)o[k]=t<=0?a[k]:t>=1?b[k]:a[k]+(b[k]-a[k])*t;return o;}
/** mirrorPose: the same move on the other side (left foot ↔ right foot). */
export function mirrorPose(p:Pose):Pose{const o={...p};
 for(const k of POSE_KEYS){if(k[0]==='l'&&k!=='lean'){const r=('r'+k.slice(1)) as PoseKey;o[k]=p[r];o[r]=p[k];}}
 for(const k of ['yaw','roll','twist','bend','neckY','dz'] as PoseKey[])o[k]=-p[k];return o;}
/** mix several channel overrides into a pose with weight w (0..1) */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as PoseKey[]){const v=LINEAR.has(k)?d[k]!:d[k]!*R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}

/** channel groups for overlapping action: the torso trails the hips, the arms trail the torso, the head settles last */
const TORSO_KEYS:PoseKey[]=['twist','lean','bend'],ARM_KEYS:PoseKey[]=['lShF','lShA','lShR','lElb','rShF','rShA','rShR','rElb','lHand','rHand'],HEAD_KEYS:PoseKey[]=['neckP','neckY'];
export type Lag={torso?:number;arms?:number;head?:number};
/** default overlap for keyed moves, in units of the move's t (≈ 30–60 ms on a 1.2 s move) */
export const OVERLAP:Required<Lag>={torso:.025,arms:.05,head:.018};
function hermite(t:number,keys:[number,Pose][],k:PoseKey):number{
 const n=keys.length;if(t<=keys[0][0])return keys[0][1][k];if(t>=keys[n-1][0])return keys[n-1][1][k];
 let i=0;while(i<n-2&&t>=keys[i+1][0])i++;
 const t1=keys[i][0],t2=keys[i+1][0],h=t2-t1,u=(t-t1)/h,u2=u*u,u3=u2*u;
 // monotone tangents (no overshoot), eased slightly (×.9) so every key gets a touch of slow-in / slow-out; zero velocity at the ends
 const tan=(j:number)=>{if(j<=0||j>=n-1)return 0;const a=keys[j-1],b=keys[j],c=keys[j+1],d1=(b[1][k]-a[1][k])/(b[0]-a[0]),d2=(c[1][k]-b[1][k])/(c[0]-b[0]);if(d1*d2<=0)return 0;const m=(d1+d2)/2;return .9*m*Math.min(1,3*Math.min(Math.abs(d1),Math.abs(d2))/Math.max(1e-9,Math.abs(m)));};
 return(2*u3-3*u2+1)*keys[i][1][k]+(u3-2*u2+u)*h*tan(i)+(-2*u3+3*u2)*keys[i+1][1][k]+(u3-u2)*h*tan(i+1);
}
/** keyPoses(t, keys, lag?): a continuous spline through key poses (C¹ monotone Hermite: no pops, no overshoot, eased at the ends).
 * Overlapping action: torso / arm / head channels are sampled slightly LATE (lag in units of t, strongest mid-move, zero at t = 0 and 1,
 * so the first and last keys are still hit exactly). Pass lag = {} for none; default OVERLAP. Keys sorted by time. */
export function keyPoses(t:number,keys:[number,Pose][],lag:Lag=OVERLAP):Pose{
 const t0=keys[0][0],t1=keys[keys.length-1][0],w=Math.sin(Math.PI*clamp((t-t0)/Math.max(1e-9,t1-t0)));
 const o=ZERO();for(const k of POSE_KEYS)o[k]=hermite(t,keys,k);
 const late=(ks:PoseKey[],l:number|undefined)=>{if(!l)return;const tt=t-l*w;for(const k of ks)o[k]=hermite(tt,keys,k);};
 late(TORSO_KEYS,lag.torso);late(ARM_KEYS,lag.arms);late(HEAD_KEYS,lag.head);
 return clampPose(o);
}
/** periodic smooth curve through (phase, value) samples (phase ∈ [0,1), sorted) */
function loop(ph:number,xs:number[],ys:number[]):number{
 const n=xs.length,p=((ph%1)+1)%1;let i=n-1;for(let k=0;k<n;k++)if(xs[k]<=p)i=k;
 const x=(k:number)=>xs[((k%n)+n)%n]+Math.floor(k/n)*1,y=(k:number)=>ys[((k%n)+n)%n];
 const x1=x(i),x2=x(i+1),h=x2-x1,u=((p<x1?p+1:p)-x1)/h;
 const m=(k:number)=>(y(k+1)-y(k-1))/(x(k+1)-x(k-1));
 const u2=u*u,u3=u2*u;return(2*u3-3*u2+1)*y(i)+(u3-2*u2+u)*h*m(i)+(-2*u3+3*u2)*y(i+1)+(u3-u2)*h*m(i+1);
}
const bump=(u:number,c:number,w:number)=>{const d=Math.abs(((u-c+1.5)%1)-.5)/w;return d>=1?0:.5+.5*Math.cos(d*Math.PI);};
const sideOf=(p:Pose,side:'l'|'r'|undefined)=>side==='l'?mirrorPose(p):p;
/** squash & stretch track: smoothstep between [t, amount] keys (− squash on landings/plants, + stretch on take-offs/strikes) */
function sq(t:number,k:[number,number][]):number{if(t<=k[0][0])return k[0][1];for(let i=0;i+1<k.length;i++){const[a,va]=k[i],[b,vb]=k[i+1];if(t<b){const u=(t-a)/(b-a);return va+(vb-va)*u*u*(3-2*u);}}return k[k.length-1][1];}
const withSq=(p:Pose,v:number)=>{p.squash=clamp(v,-.3,.3);return p;};

// ─────────────────────────────────────────── generators ───────────────────────────────────────────
export function stand():Pose{return clampPose(posed({lHipF:12,rHipF:12,lKnee:18,rKnee:18,lAnk:-4,rAnk:-4,lean:8,pitch:3,neckP:-6,lShA:14,rShA:14,lElb:30,rElb:30}));}

// run tables: phase [contact, .08, .16 mid-stance, .3 toe-off, .42, .55 heel-to-glute, .7 high knee, .82, .92 reach]
const RX=[0,.08,.16,.3,.42,.55,.7,.82,.92];
const SPRINT={hip:[28,16,2,-34,-26,22,78,88,52],knee:[16,34,44,22,100,146,128,72,22],ank:[-8,-12,-4,44,48,28,6,-6,-10]};
const JOG={hip:[22,12,0,-20,-14,10,36,40,30],knee:[14,30,38,20,66,92,74,38,16],ank:[-6,-10,-4,32,28,12,0,-5,-8]};
/** strides (full cycles) per second for a run speed 0..1 — use phase += dt*runCadence(speed) */
export const runCadence=(speed=1)=>1.25+.3*clamp(speed);
export function runCycle(phase:number,o:{speed?:number;stride?:number;armOut?:number}={}):Pose{
 const s=clamp(o.speed??1),st=o.stride??1,ph=((phase%1)+1)%1,p=ZERO();
 const leg=(q:number)=>{const hip=loop(q,RX,JOG.hip.map((v,i)=>v+(SPRINT.hip[i]-v)*s)),knee=loop(q,RX,JOG.knee.map((v,i)=>v+(SPRINT.knee[i]-v)*s)),ank=loop(q,RX,JOG.ank.map((v,i)=>v+(SPRINT.ank[i]-v)*s));return[hip*st,knee,ank];};
 const[rh,rk,ra]=leg(ph),[lh,lk,la]=leg(ph+.5);
 p.rHipF=rh*R;p.rKnee=Math.max(0,rk)*R;p.rAnk=ra*R;p.lHipF=lh*R;p.lKnee=Math.max(0,lk)*R;p.lAnk=la*R;
 p.rHipA=p.lHipA=3*R;p.rHipR=p.lHipR=4*R;
 // arms and shoulders trail the legs slightly (overlapping action)
 const sw=(q:number)=>Math.cos(TAU*(q-.36)),ampF=34+36*s,cr=sw(ph-.035),cl=sw(ph+.5-.035);
 p.rShF=(6+ampF*cr)*R;p.lShF=(6+ampF*cl)*R;p.rElb=(84+22*cr)*R;p.lElb=(84+22*cl)*R;
 p.rShA=p.lShA=(10+(o.armOut??0))*R;p.rShR=p.lShR=-8*R;
 const tw=(8+8*s)*sw(ph-.018);p.twist=tw*R;p.yaw=-.55*(8+8*s)*sw(ph)*R;
 p.pitch=(3+9*s)*R;p.lean=(5+10*s)*R;p.neckP=(-(3+9*s)-(5+10*s)*.7+4)*R;p.neckY=-.45*tw*R;p.bend=0;
 const stance=.36-.08*s,u=ph%.5,fl=u>stance?Math.sin(Math.PI*(u-stance)/(.5-stance)):0;p.air=(.025+.075*s)*fl;
 // squash through the loading stance, stretch in flight
 p.squash=(.4+.6*s)*(.04*fl-.055*(bump(ph,.06,.09)+bump(ph,.56,.09)));
 return clampPose(p);
}
/** dribble: short quick strides; the touch foot meets the ball at phase touchPhase (≈ .97, just before that foot lands). */
export const touchPhase=.97;
export function dribble(phase:number,o:{foot?:'l'|'r';speed?:number}={}):Pose{
 const ph=((phase%1)+1)%1;let p=runCycle(ph,{speed:(o.speed??.35)*.6,stride:.72});
 p=over(p,{rHipF:34,rKnee:22,rAnk:30,rHipR:12},bump(ph,touchPhase,.14));
 p=over(p,{neckP:30,lShA:26,rShA:22,lean:14},1);
 return clampPose(sideOf(p,o.foot));
}
/** strike (right foot by default): contact at t ≈ .52 (see STRIKE_CONTACT). power 0..1 scales backswing/follow-through. */
export const STRIKE_CONTACT=.52;
export function strike(t:number,o:{foot?:'l'|'r';power?:number}={}):Pose{
 const w=clamp(o.power??1),k=(a:number,b:number)=>a+(b-a)*w;
 const keys:[number,Pose][]=[
  [0,posed({lHipF:42,lKnee:22,lAnk:-8,rHipF:-28,rKnee:64,rAnk:36,lShF:-34,lElb:78,rShF:42,rElb:84,lean:12,pitch:6,air:.04,twist:-8})],
  [.22,posed({lHipF:26,lKnee:26,lAnk:-10,rHipF:-36,rKnee:92,rAnk:38,lShA:62,lShF:22,lElb:34,rShA:30,rShF:-30,rElb:40,lean:12,pitch:3,yaw:-10,twist:10,bend:-8,neckP:24})],
  [.4,posed({lHipF:16,lKnee:36,rHipF:k(-30,-52),rKnee:k(100,132),rAnk:44,rHipA:12,yaw:k(-12,-26),twist:k(16,30),lShA:k(80,100),lShF:40,lElb:22,rShA:46,rShF:-48,rElb:30,lean:8,bend:-16,neckP:30,neckY:10})],
  [STRIKE_CONTACT,posed({lHipF:20,lKnee:34,lAnk:12,rHipF:24,rKnee:22,rAnk:58,rHipA:4,yaw:6,twist:0,lShA:82,lShF:-6,lElb:26,rShA:34,rShF:26,rElb:40,lean:20,bend:-12,neckP:40,pitch:5})],
  [.7,posed({lHipF:6,lKnee:20,lAnk:38,air:.1*w,rHipF:k(70,108),rKnee:14,rAnk:48,yaw:20,twist:-20,lShA:62,lShF:-44,lElb:30,rShF:k(40,66),rShA:26,rElb:44,lean:4,pitch:2,neckP:22})],
  [.85,posed({lHipF:-6,lKnee:30,lAnk:30,air:.05*w,rHipF:k(50,66),rKnee:40,rAnk:30,yaw:18,twist:-12,lShA:44,lShF:-28,rShF:30,rShA:22,rElb:50,lean:0,neckP:8})],
  [1,posed({lHipF:-22,lKnee:56,lAnk:26,rHipF:26,rKnee:30,rAnk:0,yaw:10,twist:-6,lShA:30,lShF:-20,rShA:22,rShF:20,lElb:50,rElb:60,lean:10,pitch:5,neckP:6})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.22,-.06],[.4,.02],[STRIKE_CONTACT,-.02],[.7,.06],[1,-.05]])),o.foot));
}
/** volley (right foot by default): side-on, swivel on the standing leg, kicking leg high; contact at .5. height 0..1 = ball height. */
export function volley(t:number,o:{foot?:'l'|'r';height?:number}={}):Pose{
 const h=clamp(o.height??.6),hi=(a:number,b:number)=>a+(b-a)*h;
 const keys:[number,Pose][]=[
  [0,posed({yaw:-62,lKnee:24,rKnee:24,lHipF:16,rHipF:18,lShA:40,rShA:40,lElb:40,rElb:40,neckY:-24,neckP:8,lean:8})],
  [.3,posed({yaw:-72,lKnee:36,lHipF:26,rHipA:hi(30,44),rHipF:-8,rKnee:112,rAnk:42,bend:-16,roll:-6,lShA:64,lShF:10,rShA:hi(80,100),rShF:18,rElb:30,neckP:22,neckY:-26,twist:-12})],
  [.5,posed({yaw:-24,roll:hi(-8,-14),bend:hi(-16,-26),lKnee:26,lHipF:14,lAnk:22,rHipA:hi(38,78),rHipF:hi(30,44),rKnee:14,rAnk:58,rHipR:-6,lShA:58,lShF:-24,lElb:24,rShA:hi(110,128),rShF:28,rElb:30,neckP:36,neckY:-12,twist:16,air:.04})],
  [.7,posed({yaw:26,roll:-8,bend:-14,rHipA:hi(30,52),rHipF:hi(52,64),rKnee:30,rAnk:40,air:.12,lKnee:36,lAnk:34,lShA:82,lShF:-10,rShA:72,rShF:30,neckP:18,twist:12})],
  [1,posed({yaw:34,rHipA:10,rHipF:22,rKnee:44,lKnee:36,lHipF:10,lShA:36,rShA:34,lElb:44,rElb:44,lean:10,neckP:8})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.3,-.03],[.5,.04],[.72,.03],[1,-.05]])),o.foot));
}
/** header: contact (neck snap) at t ≈ .52 */
export function header(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,posed({lHipF:58,rHipF:58,lKnee:84,rKnee:84,lAnk:-18,rAnk:-18,lean:22,pitch:8,lShF:-50,rShF:-50,lElb:28,rElb:28,lShA:14,rShA:14,neckP:-14})],
  [.22,posed({lHipF:2,rHipF:4,lKnee:10,rKnee:12,lAnk:48,rAnk:48,lean:4,pitch:2,lShF:86,rShF:86,lShA:30,rShA:30,lElb:64,rElb:64,air:.06,neckP:-22})],
  [.42,posed({air:.62,lean:-26,pitch:-10,neckP:-44,lHipF:-22,rHipF:-8,lKnee:96,rKnee:84,lAnk:42,rAnk:42,lShA:84,rShA:84,lShF:52,rShF:52,lElb:74,rElb:74})],
  [.52,posed({air:.58,lean:30,pitch:10,neckP:46,lHipF:30,rHipF:36,lKnee:64,rKnee:58,lAnk:40,rAnk:40,lShA:54,rShA:54,lShF:-22,rShF:-22,lElb:60,rElb:60})],
  [.75,posed({air:.24,lean:12,pitch:4,neckP:18,lHipF:22,rHipF:22,lKnee:30,rKnee:34,lAnk:30,rAnk:30,lShA:34,rShA:34,lShF:10,rShF:10,lElb:44,rElb:44})],
  [1,posed({lHipF:48,rHipF:48,lKnee:62,rKnee:62,lAnk:-12,rAnk:-12,lean:20,pitch:6,lShA:32,rShA:32,lShF:14,rShF:14,lElb:44,rElb:44,neckP:4})],
 ];
 return withSq(keyPoses(t,keys),sq(t,[[0,-.07],[.22,.08],[.42,0],[.52,.03],[.8,0],[1,-.09]]));
}
const GK_SET={lHipF:52,rHipF:52,lHipA:16,rHipA:16,lKnee:62,rKnee:62,lAnk:-6,rAnk:-6,lean:20,pitch:8,lShF:48,rShF:48,lShA:34,rShA:34,lElb:66,rElb:66,lShR:24,rShR:24,lHand:1,rHand:1,neckP:-12};
export function keeperSet(t=0):Pose{const b=.5+.5*Math.sin(TAU*t);return clampPose(posed({...GK_SET,air:.035*b,lKnee:62-10*b,rKnee:62-10*b,lAnk:-6+14*b,rAnk:-6+14*b}));}
/** keeper dive (to the keeper's right by default): full extension at .55. height 0..1 = low … top corner. */
export function keeperDive(t:number,o:{side?:'l'|'r';height?:number}={}):Pose{
 const h=clamp(o.height??.5),hi=(a:number,b:number)=>a+(b-a)*h;
 const keys:[number,Pose][]=[
  [0,posed(GK_SET)],
  [.18,posed({...GK_SET,dz:.3,rHipA:30,rKnee:74,rHipF:44,lKnee:44,lHipA:20,lean:18,roll:10,lShA:62,rShA:66,lShF:60,rShF:60,neckY:-10})],
  [.35,posed({dz:.7,roll:hi(46,40),air:hi(.1,.22),lHipA:28,lHipF:8,lKnee:8,lAnk:48,rHipF:64,rKnee:92,rHipA:22,lShA:132,rShA:138,lElb:28,rElb:30,lShF:20,rShF:24,bend:10,lHand:1,rHand:1,neckP:-8})],
  [.55,posed({dz:1.55,roll:hi(92,70),air:hi(.3,1.05),bend:hi(14,20),lShA:176,rShA:172,lShF:12,rShF:18,lElb:2,rElb:6,lHipA:12,lHipF:2,lKnee:6,lAnk:44,rHipA:-4,rHipF:30,rKnee:48,rAnk:40,neckP:-10,lHand:1,rHand:1})],
  [.75,posed({dz:2.05,roll:hi(96,82),air:hi(.12,.5),bend:12,lShA:168,rShA:164,lShF:18,rShF:24,lElb:10,rElb:14,lHipA:8,lKnee:16,rHipF:34,rKnee:60,lAnk:40,rAnk:40,neckP:-4,lHand:1,rHand:1})],
  [.9,posed({dz:2.25,roll:94,air:0,lShA:158,rShA:150,lShF:26,rShF:32,lElb:24,rElb:30,lHipA:6,lHipF:14,lKnee:26,rHipF:40,rKnee:62,lAnk:36,rAnk:36,bend:8,lean:8,neckP:0,lHand:1,rHand:1})],
  [1,posed({dz:2.3,roll:92,air:0,lShA:150,rShA:142,lShF:34,rShF:40,lElb:44,rElb:50,lHipA:4,lHipF:22,lKnee:40,rHipF:48,rKnee:74,lAnk:30,rAnk:30,bend:4,lean:14,neckP:8,lHand:.7,rHand:.7})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.18,-.06],[.35,.06],[.55,.08],[.75,.03],[.9,-.08],[1,-.03]])),o.side));
}
/** keeper tips the ball over the bar with one hand (right by default): touch at .6 */
export function keeperTip(t:number,o:{hand?:'l'|'r'}={}):Pose{
 const keys:[number,Pose][]=[
  [0,posed(GK_SET)],
  [.25,posed({...GK_SET,lKnee:84,rKnee:84,lHipF:62,rHipF:62,rShF:80,rShA:30,lShF:40,neckP:-30,dx:-.1})],
  [.5,posed({air:.76,pitch:-18,lean:-16,dx:-.45,rShF:176,rShA:18,rElb:6,lShA:62,lShF:34,lElb:40,rHipF:34,rKnee:78,lHipF:-8,lKnee:26,lAnk:44,rAnk:40,neckP:-50,twist:12,rHand:1,lHand:1})],
  [.62,posed({air:.8,pitch:-26,lean:-22,dx:-.6,rShF:192,rShA:12,rElb:10,lShA:74,lShF:20,lElb:44,rHipF:26,rKnee:70,lHipF:-14,lKnee:34,lAnk:40,rAnk:40,neckP:-54,twist:14,rHand:1,lHand:1})],
  [.85,posed({air:.18,pitch:-34,lean:-10,dx:-.85,rShF:150,rShA:30,rElb:30,lShA:70,lShF:30,lElb:50,rHipF:40,rKnee:60,lHipF:10,lKnee:40,neckP:-24,rHand:1,lHand:1})],
  [1,posed({air:0,pitch:-20,lean:18,dx:-1,rShF:70,rShA:40,rElb:50,lShA:50,lShF:40,lElb:50,rHipF:60,rKnee:80,lHipF:50,lKnee:74,neckP:4,rHand:.6,lHand:.6})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.25,-.07],[.5,.07],[.62,.04],[.85,0],[1,-.07]])),o.hand));
}
export function keeperScoop(t:number):Pose{
 const keys:[number,Pose][]=[
  [0,posed(GK_SET)],
  [.4,posed({lHipF:6,lKnee:112,lAnk:40,rHipF:84,rKnee:96,rHipR:20,lean:44,pitch:4,lShF:72,rShF:72,lShA:10,rShA:10,lElb:18,rElb:18,lShR:30,rShR:30,neckP:40,lHand:1,rHand:1})],
  [.7,posed({lHipF:8,lKnee:110,lAnk:40,rHipF:80,rKnee:94,rHipR:20,lean:30,pitch:2,lShF:52,rShF:52,lShA:18,rShA:18,lElb:128,rElb:128,lShR:40,rShR:40,neckP:36,lHand:.8,rHand:.8})],
  [1,posed({lHipF:26,lKnee:60,rHipF:34,rKnee:50,lean:18,lShF:22,rShF:22,lShA:22,rShA:22,lElb:118,rElb:118,lShR:40,rShR:40,neckP:10,lHand:.6,rHand:.6})],
 ];
 return keyPoses(t,keys);
}
/** slide tackle leading with the right foot by default: on the ground from .4 */
export function slideTackle(t:number,o:{foot?:'l'|'r'}={}):Pose{
 const keys:[number,Pose][]=[
  [0,runCycle(.72,{speed:.9})],
  [.2,posed({lHipF:22,lKnee:96,lAnk:30,rHipF:62,rKnee:22,rAnk:-4,pitch:-18,lean:-8,roll:-8,lShA:52,lShF:-40,rShA:40,rShF:52,rElb:50,dx:.3})],
  [.42,posed({pitch:-48,lean:10,roll:-20,rHipF:38,rKnee:4,rAnk:-18,lHipF:20,lHipA:15,lKnee:140,lHipR:58,lAnk:36,lShF:-60,lShA:46,lElb:8,rShF:62,rShA:50,rElb:40,neckP:30,neckY:-8,dx:1.1})],
  [.75,posed({pitch:-50,lean:12,roll:-22,rHipF:36,rKnee:6,rAnk:-18,lHipF:20,lHipA:15,lKnee:142,lHipR:58,lAnk:36,lShF:-66,lShA:48,lElb:10,rShF:56,rShA:54,rElb:44,neckP:32,neckY:-8,dx:2})],
  [1,posed({pitch:-44,lean:18,roll:-18,rHipF:38,rKnee:18,rAnk:0,lHipF:22,lHipA:14,lKnee:136,lHipR:50,lAnk:30,lShF:-54,lShA:42,lElb:20,rShF:46,rShA:44,rElb:50,neckP:24,dx:2.3})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.2,-.06],[.42,-.03],[1,0]])),o.foot));
}
/** defender backpedal: low, short backward shuffle (phase loops; pair with ~2.2 cycles/s) */
export function backpedal(phase:number):Pose{
 const ph=((phase%1)+1)%1,c=Math.cos(TAU*ph),sn=Math.sin(TAU*ph),c2=Math.cos(TAU*(ph+.5)),s2=Math.sin(TAU*(ph+.5));
 return clampPose(posed({rHipF:40+16*c,rKnee:58+26*Math.max(0,sn),rAnk:6+10*Math.max(0,-c),lHipF:40+16*c2,lKnee:58+26*Math.max(0,s2),lAnk:6+10*Math.max(0,-c2),lHipA:14,rHipA:14,lHipR:10,rHipR:10,
  lean:24,pitch:4,twist:6*c,lShA:34,rShA:34,lShF:18-10*c,rShF:18+10*c,lElb:64,rElb:64,neckP:-18,air:.02*Math.abs(sn)}));
}
/** defender lunge/jab toward a ball on the given side (right by default): full reach at .6 */
export function lunge(t:number,o:{side?:'l'|'r'}={}):Pose{
 const keys:[number,Pose][]=[
  [0,backpedal(0)],
  [.3,posed({lHipF:52,rHipF:40,lKnee:80,rKnee:70,lHipA:16,rHipA:22,lean:28,pitch:4,lShA:40,rShA:40,lElb:60,rElb:60,neckP:-6,bend:6})],
  [.6,posed({rHipF:58,rHipA:36,rKnee:12,rAnk:-18,rHipR:42,lKnee:98,lHipF:72,lHipA:10,lean:34,bend:16,roll:12,dz:.25,dx:.25,lShA:62,lShF:-22,lElb:40,rShA:48,rShF:40,rElb:40,neckP:26})],
  [1,posed({rHipF:40,rHipA:24,rKnee:44,lKnee:74,lHipF:56,lHipA:14,lean:26,bend:6,dz:.3,dx:.3,lShA:40,rShA:40,lElb:56,rElb:56,neckP:10})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.3,.02],[.6,-.05],[1,0]])),o.side));
}
/** celebrations: 'arms' (t loops: a jump with both arms up), 'kneeSlide' (t 0..1: run, drop, slide), 'run' (t loops: airplane arms) */
export function celebrate(t:number,o:{kind?:'arms'|'kneeSlide'|'run'}={}):Pose{
 const kind=o.kind??'arms';
 if(kind==='run'){const ph=((t%1)+1)%1,p=runCycle(ph,{speed:.7});return clampPose(over(p,{lShA:96,rShA:96,lShF:0,rShF:0,lElb:6,rElb:6,roll:12*Math.sin(TAU*t*.5),neckP:-16,lean:4},1));}
 if(kind==='kneeSlide'){const keys:[number,Pose][]=[
  [0,runCycle(.2,{speed:.8})],
  [.25,posed({lKnee:104,rKnee:100,lHipF:18,rHipF:30,lAnk:50,rAnk:50,pitch:-4,lean:-6,lShA:80,rShA:80,lShF:10,rShF:10,lElb:30,rElb:30,neckP:-10,dx:.5})],
  [.55,posed({lKnee:112,rKnee:112,lHipF:8,rHipF:10,lAnk:55,rAnk:55,pitch:-18,lean:-22,lShA:132,rShA:132,lShF:24,rShF:24,lElb:18,rElb:18,neckP:-40,lHand:1,rHand:1,dx:1.8,lHipA:12,rHipA:12})],
  [1,posed({lKnee:115,rKnee:115,lHipF:4,rHipF:6,lAnk:55,rAnk:55,pitch:-22,lean:-28,lShA:150,rShA:150,lShF:20,rShF:20,lElb:12,rElb:12,neckP:-46,lHand:1,rHand:1,dx:2.5,lHipA:12,rHipA:12})],
 ];return withSq(keyPoses(t,keys),sq(t,[[0,0],[.25,-.09],[.45,.02],[1,.03]]));}
 const u=((t%1)+1)%1,keys:[number,Pose][]=[
  [0,posed({lHipF:40,rHipF:40,lKnee:56,rKnee:56,lAnk:-10,rAnk:-10,lean:14,lShA:70,rShA:70,lShF:20,rShF:20,lElb:60,rElb:60,neckP:0})],
  [.3,posed({air:.42,lHipF:-8,rHipF:4,lKnee:70,rKnee:40,lAnk:44,rAnk:44,lean:-16,pitch:-4,lShA:166,rShA:166,lShF:18,rShF:18,lElb:14,rElb:14,neckP:-34,lHand:1,rHand:1})],
  [.55,posed({air:.3,lHipF:4,rHipF:14,lKnee:40,rKnee:30,lAnk:36,rAnk:36,lean:-12,lShA:160,rShA:160,lShF:22,rShF:22,lElb:30,rElb:30,neckP:-30,lHand:1,rHand:1})],
  [.8,posed({air:0,lHipF:34,rHipF:34,lKnee:48,rKnee:48,lAnk:-6,rAnk:-6,lean:10,lShA:110,rShA:110,lShF:20,rShF:20,lElb:50,rElb:50,neckP:-10})],
  [1,posed({lHipF:40,rHipF:40,lKnee:56,rKnee:56,lAnk:-10,rAnk:-10,lean:14,lShA:70,rShA:70,lShF:20,rShF:20,lElb:60,rElb:60,neckP:0})],
 ];
 return withSq(keyPoses(u,keys,{torso:.02,arms:.06,head:.03}),sq(u,[[0,-.07],[.18,.06],[.3,.04],[.55,.02],[.8,-.08],[1,-.07]]));
}
/** rabona (right foot by default): the kicking leg wraps BEHIND the standing leg; contact at .58 (RABONA_CONTACT). */
export const RABONA_CONTACT=.58;
export function rabona(t:number,o:{foot?:'l'|'r'}={}):Pose{
 const keys:[number,Pose][]=[
  [0,posed({lHipF:38,lKnee:20,lAnk:-6,rHipF:-26,rKnee:70,rAnk:36,lShF:-30,lElb:70,rShF:36,rElb:80,lean:10,pitch:5,air:.03})],
  [.25,posed({lHipF:22,lKnee:26,lAnk:-6,rHipF:-26,rHipA:26,rKnee:92,rAnk:40,lean:-4,bend:14,roll:8,lShA:72,rShA:60,lElb:30,rElb:30,yaw:-14,neckP:32,neckY:22})],
  [.42,posed({lHipF:18,lKnee:30,rHipF:-30,rHipA:34,rKnee:104,rAnk:44,rHipR:-14,yaw:-26,twist:16,lean:-8,bend:18,roll:8,lShA:88,rShA:84,lElb:24,rElb:24,neckP:34,neckY:22})],
  [RABONA_CONTACT,posed({lHipF:16,lKnee:34,lAnk:8,rHipF:-2,rHipA:-28,rKnee:18,rAnk:54,rHipR:-18,yaw:16,twist:-16,bend:20,roll:10,lean:-4,lShA:78,lShF:-20,lElb:24,rShA:98,rShF:22,rElb:24,neckP:40,neckY:16})],
  [.76,posed({lHipF:8,lKnee:26,lAnk:28,air:.04,rHipF:22,rHipA:-40,rKnee:16,rAnk:44,rHipR:-10,yaw:26,twist:-18,bend:14,roll:8,lean:-8,lShA:70,lShF:-28,rShA:86,rShF:30,neckP:22,neckY:10})],
  [1,posed({lHipF:-6,lKnee:34,lAnk:20,rHipF:20,rHipA:-12,rKnee:40,rAnk:10,yaw:20,twist:-8,bend:4,lShA:40,rShA:40,lElb:44,rElb:44,lean:8,neckP:8})],
 ];
 return clampPose(sideOf(withSq(keyPoses(t,keys),sq(t,[[0,0],[.25,-.05],[.42,0],[RABONA_CONTACT,.03],[.76,.02],[1,-.03]])),o.foot));
}

// ─────────────────────────────────────────── skeleton (forward kinematics) ───────────────────────────────────────────
export type Build={/** metres (1.8) */height?:number;/** body width (1 = athletic, .9 slim, 1.15 stocky) */bulk?:number;/** extra thigh size (Roberto Carlos 1.25) */thighs?:number;/** head size (1) */head?:number};
export type Place={x?:number;y?:number;z?:number;/** radians, + = turn left; 0 faces +x */yaw?:number};
export const JOINTS=['pelvis','chest','neck','head','face','lSh','rSh','lEl','rEl','lHa','rHa','lHip','rHip','lKn','rKn','lAn','rAn','lToe','rToe','lHeel','rHeel'] as const;
export type JointName=typeof JOINTS[number];
type Frames={P:M3;T1:M3;T:M3;H:M3;lUp:M3;lFo:M3;rUp:M3;rFo:M3;lTh:M3;lSn:M3;lFt:M3;rTh:M3;rSn:M3;rFt:M3};
export type Skeleton=Record<JointName,V3>&{fr:Frames;/** body scale (height / 1.8 m) */s:number};
/** parent → child bones, all rigid under solve() */
export const BONES:[JointName,JointName][]=[['pelvis','chest'],['chest','neck'],['neck','head'],['head','face'],['chest','lSh'],['chest','rSh'],['lSh','lEl'],['lEl','lHa'],['rSh','rEl'],['rEl','rHa'],
 ['pelvis','lHip'],['pelvis','rHip'],['lHip','lKn'],['lKn','lAn'],['lAn','lToe'],['lAn','lHeel'],['rHip','rKn'],['rKn','rAn'],['rAn','rToe'],['rAn','rHeel']];
/** segment lengths for a 1.8 m athlete (metres) */
const SEG={thigh:.45,shin:.45,hipDown:.06,hipSide:.095,spine1:.2,spine2:.25,shUp:.21,shSide:.19,upper:.3,fore:.265,headUp:.17,headFwd:.015,headR:.105};
const CONTACT:[JointName,number][]=[['lToe',.02],['rToe',.02],['lHeel',.03],['rHeel',.03],['lKn',.06],['rKn',.06],['lHa',.045],['rHa',.045],['lEl',.05],['rEl',.05],['pelvis',.14],['lHip',.1],['rHip',.1],['chest',.15],['head',.11],['lSh',.08],['rSh',.08]];
export function solve(p:Pose,build:Build={},place:Place={},scale=1):Skeleton{
 const s=(build.height??1.8)/1.8*scale,S=(v:V3):V3=>mul(v,s);
 const W=mm(mm(Ry(p.yaw),Rz(-p.pitch)),Rx(p.roll)),P=W;
 const pelvis:V3=[p.dx,0,p.dz];
 const half=mm(mm(Ry(p.twist/2),Rz(-p.lean/2)),Rx(p.bend/2)),T1=mm(P,half),T=mm(T1,half);
 const chest=at(pelvis,T1,S([0,SEG.spine1,0])),neck=at(chest,T,S([0,SEG.spine2,0]));
 const H=mm(mm(T,Ry(p.neckY)),Rz(-p.neckP)),head=at(neck,H,S([SEG.headFwd,SEG.headUp,0])),face=at(head,H,S([.118,-.012,0]));
 const lSh=at(chest,T,S([0,SEG.shUp,-SEG.shSide])),rSh=at(chest,T,S([0,SEG.shUp,SEG.shSide]));
 const lUp=mm(mm(mm(T,Rx(p.lShA)),Rz(p.lShF)),Ry(p.lShR)),rUp=mm(mm(mm(T,Rx(-p.rShA)),Rz(p.rShF)),Ry(-p.rShR));
 const lEl=at(lSh,lUp,S([0,-SEG.upper,0])),rEl=at(rSh,rUp,S([0,-SEG.upper,0]));
 const lFo=mm(lUp,Rz(p.lElb)),rFo=mm(rUp,Rz(p.rElb));
 const lHa=at(lEl,lFo,S([0,-SEG.fore,0])),rHa=at(rEl,rFo,S([0,-SEG.fore,0]));
 const lHip=at(pelvis,P,S([0,-SEG.hipDown,-SEG.hipSide])),rHip=at(pelvis,P,S([0,-SEG.hipDown,SEG.hipSide]));
 const lTh=mm(mm(mm(P,Rx(p.lHipA)),Rz(p.lHipF)),Ry(p.lHipR)),rTh=mm(mm(mm(P,Rx(-p.rHipA)),Rz(p.rHipF)),Ry(-p.rHipR));
 const lKn=at(lHip,lTh,S([0,-SEG.thigh,0])),rKn=at(rHip,rTh,S([0,-SEG.thigh,0]));
 const lSn=mm(lTh,Rz(-p.lKnee)),rSn=mm(rTh,Rz(-p.rKnee));
 const lAn=at(lKn,lSn,S([0,-SEG.shin,0])),rAn=at(rKn,rSn,S([0,-SEG.shin,0]));
 const lFt=mm(lSn,Rz(-p.lAnk)),rFt=mm(rSn,Rz(-p.rAnk));
 const lToe=at(lAn,lFt,S([.17,-.06,0])),rToe=at(rAn,rFt,S([.17,-.06,0])),lHeel=at(lAn,lFt,S([-.055,-.06,0])),rHeel=at(rAn,rFt,S([-.055,-.06,0]));
 const sk={pelvis,chest,neck,head,face,lSh,rSh,lEl,rEl,lHa,rHa,lHip,rHip,lKn,rKn,lAn,rAn,lToe,rToe,lHeel,rHeel,fr:{P,T1,T,H,lUp,lFo,rUp,rFo,lTh,lSn,lFt,rTh,rSn,rFt},s} as Skeleton;
 // ground the body: the lowest contact surface sits at y = air
 let low=Infinity;for(const[j,r] of CONTACT)low=Math.min(low,sk[j][1]-r*s);
 const Y=Ry(place.yaw??0),lift=p.air-low,off:V3=[place.x??0,(place.y??0),place.z??0];
 for(const j of JOINTS){const q=sk[j];sk[j]=add(mv(Y,[q[0],q[1]+lift,q[2]]),off);}
 if(place.yaw){const f=sk.fr;for(const k of Object.keys(f) as (keyof Frames)[])f[k]=mm(Y,f[k]);}
 return sk;
}

// ─────────────────────────────────────────── cameras ───────────────────────────────────────────
export type Projector={eye:V3;project(p:V3):[number,number,number];/** sheet units per metre at p (optional; estimated if absent) */scale?(p:V3):number};
export type CameraSpec={pos:V3;target:V3;/** vertical degrees */fov:number;/** sheet units spanned by the fov (1080) */size?:number;/** where target lands (sheet units) */center?:Pt};
export type Camera=Projector&{F:number;f:V3;r:V3;u:V3;center:Pt};
export function makeCamera(c:CameraSpec):Camera{
 const f=nrm(sub(c.target,c.pos));let r=cross(f,[0,1,0]);if(len(r)<1e-6)r=[1,0,0];r=nrm(r);const u=cross(r,f),F=((c.size??1080)/2)/Math.tan(Math.max(.1,c.fov)*R/2),center=c.center??[0,0];
 return{eye:c.pos,F,f,r,u,center,
  project(p){const d=sub(p,c.pos),z=Math.max(.05,dot(d,f));return[center[0]+F*dot(d,r)/z,center[1]-F*dot(d,u)/z,z];},
  scale(p){return F/Math.max(.05,dot(sub(p,c.pos),f));}};
}
/** figureCam: a camera for one billboarded figure. The ground point under `at` (default origin) lands on sheet (x,y); a 1.8 m body is
 * `height` sheet units. azimuth: 0 = from the figure's right (side view of a figure facing +x), 90 = front, −90 = behind, 45 = front
 * three-quarter; elevation: 0 eye level … 35 broadcast high. fov: 6 almost flat … 40 strong perspective. */
export function figureCam(o:{x:number;y:number;height:number;azimuth?:number;elevation?:number;fov?:number;at?:V3;aim?:number}):Camera{
 const a=(o.azimuth??0)*R,e=(o.elevation??6)*R,fov=o.fov??18,base=o.at??[0,0,0],target:V3=[base[0],base[1]+(o.aim??.95),base[2]];
 const D=1.25/Math.tan(fov*R/2),dir:V3=[Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)],pos=add(target,mul(dir,D));
 const size=2*Math.tan(fov*R/2)*D*o.height/1.8;const cam=makeCamera({pos,target,fov,size,center:[0,0]});
 const g=cam.project(base);cam.center[0]=o.x-g[0];cam.center[1]=o.y-g[1];return cam;
}
const asProjector=(c:Projector|CameraSpec):Projector=>'project' in c?c:makeCamera(c);
function scaleAt(c:Projector,p:V3){if(c.scale)return c.scale(p);let side=cross(sub(p,c.eye),[0,1,0]);if(len(side)<1e-6)side=[1,0,0];side=mul(nrm(side),.1);const a=c.project(p),b=c.project(add(p,side));return Math.hypot(b[0]-a[0],b[1]-a[1])/.1;}

// ─────────────────────────────────────────── style ───────────────────────────────────────────
/** ink name (solid) | [ink, coverage] (halftone) | 'paper' (leave the knockout paper) | null (skip) */
export type InkFill=string|[string,number]|null;
export type HairStyle='short'|'long'|'bald'|'balding'|'ponytail'|'curly';
export type Detail='low'|'mid'|'high';
export type AthleteStyle={
 shirt:InkFill;shorts:InkFill;socks:InkFill;boots:InkFill;/** skin as overprinted screens, e.g. [['yellow',.35],['red',.2]] */skin:InkFill[];hair:InkFill;
 /** key line ink (navy) */line:string;/** shade screen on the side away from the light (default [line,.3]) */shade?:InkFill;trim?:InkFill;
 pattern?:'plain'|'stripes'|'hoops';patternInk?:InkFill;number?:number|string|null;numberInk?:InkFill;
 hairStyle?:HairStyle;gloves?:InkFill;sleeves?:'short'|'long';build?:Build;scale?:number;detail?:'auto'|Detail;
 /** ground shadow fill (default [line,.26]); false = none */shadow?:InkFill|false;/** line weight multiplier */lineWeight?:number;seed?:number;
};
const inkOf=(f:InkFill):[string,number]|null=>f==null||f==='paper'?null:typeof f==='string'?[f,1]:f;


// ─────────────────────────────────────────── 2D geometry ───────────────────────────────────────────
/** Convex hull (Andrew's monotone chain), lower chain then upper chain. The hottest function of a card film frame (every torso, head,
 * hand, boot and ground shadow). Performance (Sep 26 2026): a stable merge sort by x then y (insertion-sorted runs of 8, then bottom-up
 * merges; the same order as the stable sort((a,b)=>a[0]-b[0]||a[1]-b[1]) without a comparator call per step) and one stack for both
 * chains: ~2× faster, same points in the same order (tests/riso-engine-perf.cjs). */
let hullTmp:Pt[]=[];
function hull(pts:Pt[]):Pt[]{const n=pts.length;if(n<3)return pts.slice();const p=pts.slice();
 for(let s=0;s<n;s+=8){const e=Math.min(n,s+8);for(let i=s+1;i<e;i++){const v=p[i],x=v[0],y=v[1];let j=i-1;while(j>=s){const w=p[j];if(w[0]>x||(w[0]===x&&w[1]>y)){p[j+1]=w;j--;}else break;}p[j+1]=v;}}
 if(n>8){let src=p,dst=hullTmp.length>=n?hullTmp:(hullTmp=new Array(n));
  for(let w=8;w<n;w*=2){for(let lo=0;lo<n;lo+=2*w){const mid=Math.min(n,lo+w),hi=Math.min(n,lo+2*w);let i=lo,j=mid,k=lo;
    while(i<mid&&j<hi){const a=src[i],b=src[j];if(b[0]<a[0]||(b[0]===a[0]&&b[1]<a[1])){dst[k++]=b;j++;}else{dst[k++]=a;i++;}}while(i<mid)dst[k++]=src[i++];while(j<hi)dst[k++]=src[j++];}
   const t=src;src=dst;dst=t;}
  if(src!==p)for(let i=0;i<n;i++)p[i]=src[i];}
 const h:Pt[]=[];for(let i=0;i<n;i++){const q=p[i];while(h.length>=2){const o=h[h.length-2],a=h[h.length-1];if((a[0]-o[0])*(q[1]-o[1])-(a[1]-o[1])*(q[0]-o[0])<=0)h.pop();else break;}h.push(q);}
 const lower=h.length;for(let i=n-2;i>=0;i--){const q=p[i];while(h.length>lower){const o=h[h.length-2],a=h[h.length-1];if((a[0]-o[0])*(q[1]-o[1])-(a[1]-o[1])*(q[0]-o[0])<=0)h.pop();else break;}h.push(q);}
 h.pop();return h;}
function orient(q:Pt[]):Pt[]{let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}return A<0?q.slice().reverse():q;}
function poly(q:Pt[]){const p=new Path2D();if(q.length<2)return p;const r=orient(q);p.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)p.lineTo(r[i][0],r[i][1]);p.closePath();return p;}
function ellipse(c:Pt,rx:number,ry:number,rot=0,n=14):Pt[]{const o:Pt[]=[],cs=Math.cos(rot),sn=Math.sin(rot);for(let i=0;i<n;i++){const a=i/n*TAU,x=Math.cos(a)*rx,y=Math.sin(a)*ry;o.push([c[0]+x*cs-y*sn,c[1]+x*sn+y*cs]);}return o;}
/** a closed hull, rounded: Catmull-Rom through its corners (soft, organic contour) */
const softHull=(pts:Pt[],step:number)=>smoothPts(hull(pts),true,step,2.6);
const cr2=(p0:Pt,p1:Pt,p2:Pt,p3:Pt,u:number):Pt=>{const u2=u*u,u3=u2*u,f=(a:number,b:number,c:number,d:number)=>.5*(2*b+(c-a)*u+(2*a-5*b+4*c-d)*u2+(3*b-a-3*c+d)*u3);return[f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])];};

/** A limb span: a dense Catmull-Rom centreline through projected knots (so a bone curves with its muscles instead of running
 * straight) and smoothly interpolated widths. k[i] = dense index of knot i, so kit regions split exactly at a knot. */
type Span={c:Pt[];w:number[];k:number[];n:Pt[]};
function span(P:Pt[],W:number[]):Span{
 const c:Pt[]=[],w:number[]=[],k:number[]=[],m=P.length;
 for(let i=0;i<m-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(m-1,i+2)],L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),q=Math.max(1,Math.min(7,Math.ceil(L/Math.max(1e-6,(W[i]+W[i+1])*.28))));
  k.push(c.length);for(let j=0;j<q;j++){const u=j/q,e=u*u*(3-2*u);c.push(cr2(p0,p1,p2,p3,u));w.push(W[i]+(W[i+1]-W[i])*e);}}
 k.push(c.length);c.push(P[m-1]);w.push(W[m-1]);
 const N=c.length,n:Pt[]=[];let last:Pt=[0,-1];
 // normals from the whole centreline, so neighbouring regions share exact edges; a foreshortened stub falls back to its chord
 let cx=c[N-1][0]-c[0][0],cy=c[N-1][1]-c[0][1];const cl=Math.hypot(cx,cy);if(cl>1e-9){cx/=cl;cy/=cl;last=[-cy,cx];}
 for(let i=0;i<N;i++){const a=c[Math.max(0,i-1)],b=c[Math.min(N-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l>1e-9)last=[-dy/l,dx/l];n.push(last);}
 return{c,w,k,n};
}
const spanLen=(sp:Span)=>{let L=0;for(let i=1;i<sp.c.length;i++)L+=Math.hypot(sp.c[i][0]-sp.c[i-1][0],sp.c[i][1]-sp.c[i-1][1]);return L;};
/** outline of dense samples i0..i1: left side, round end cap (capB), right side back, round start cap (capA).
 * With capA = false the list is also the OPEN contour of an attached limb (no line across the attachment). */
function spanPoly(sp:Span,i0:number,i1:number,capA:boolean,capB:boolean):Pt[]{
 const{c,w,n}=sp;i1=Math.min(i1,c.length-1);i0=Math.max(0,Math.min(i0,i1));
 const wmax=Math.max(...w.slice(i0,i1+1));if(spanLen(sp)<wmax*.1)return ellipse(c[Math.floor((i0+i1)/2)],wmax/2,wmax/2,0,16);
 const out:Pt[]=[];for(let i=i0;i<=i1;i++)out.push([c[i][0]+n[i][0]*w[i]/2,c[i][1]+n[i][1]*w[i]/2]);
 const cap=(i:number,sgn:1|-1)=>{const a0=Math.atan2(n[i][1]*sgn,n[i][0]*sgn),r=w[i]/2;for(let j=1;j<8;j++){const a=a0-j/8*Math.PI;out.push([c[i][0]+Math.cos(a)*r,c[i][1]+Math.sin(a)*r]);}};
 if(capB)cap(i1,1);
 for(let i=i1;i>=i0;i--)out.push([c[i][0]-n[i][0]*w[i]/2,c[i][1]-n[i][1]*w[i]/2]);
 if(capA)cap(i0,-1);
 return out;
}
/** remove the little self-loops an offset line makes on the inside of a tight bend (keeps the outline one clean curve) */
function unloop(q:Pt[]):Pt[]{
 const out=q.slice(),X=(a:Pt,b:Pt,c:Pt,d:Pt)=>{const r1x=b[0]-a[0],r1y=b[1]-a[1],r2x=d[0]-c[0],r2y=d[1]-c[1],den=r1x*r2y-r1y*r2x;if(Math.abs(den)<1e-12)return null;const u=((c[0]-a[0])*r2y-(c[1]-a[1])*r2x)/den,v=((c[0]-a[0])*r1y-(c[1]-a[1])*r1x)/den;return u>0&&u<1&&v>0&&v<1?[a[0]+r1x*u,a[1]+r1y*u] as Pt:null;};
 for(let i=0;i+1<out.length;i++)for(let j=Math.min(out.length-2,i+24);j>=i+2;j--){const p=X(out[i],out[i+1],out[j],out[j+1]);if(p){out.splice(i+1,j-i,p);break;}}
 return out;
}
/** one continuous open outline around a chain of spans (shoulder → elbow → wrist): left sides joined, round end cap, right sides back */
function chainContour(sps:Span[]):Pt[]{
 const L:Pt[]=[],Rr:Pt[]=[];for(const sp of sps)for(let i=0;i<sp.c.length;i++){const{c,w,n}=sp;L.push([c[i][0]+n[i][0]*w[i]/2,c[i][1]+n[i][1]*w[i]/2]);Rr.push([c[i][0]-n[i][0]*w[i]/2,c[i][1]-n[i][1]*w[i]/2]);}
 const last=sps[sps.length-1],e=last.c.length-1,cap:Pt[]=[],a0=Math.atan2(last.n[e][1],last.n[e][0]),r=last.w[e]/2;for(let j=1;j<8;j++){const a=a0-j/8*Math.PI;cap.push([last.c[e][0]+Math.cos(a)*r,last.c[e][1]+Math.sin(a)*r]);}
 return[...unloop(L),...cap,...unloop(Rr).reverse()];
}
/** the shade side of samples i0..i1: a thinner band shifted toward the shade direction, inside the limb (no clip needed) */
function spanShade(sp:Span,i0:number,i1:number,sd:Pt):Pt[]{
 const{c,w,n}=sp,cc:Pt[]=[],ww:number[]=[];i1=Math.min(i1,c.length-1);
 for(let i=i0;i<=i1;i++){let nx=n[i][0],ny=n[i][1];if(nx*sd[0]+ny*sd[1]<0){nx=-nx;ny=-ny;}cc.push([c[i][0]+nx*w[i]*.24,c[i][1]+ny*w[i]*.24]);ww.push(w[i]*.5);}
 if(cc.length<2)return[];const s2=span(cc,ww);return spanPoly(s2,0,s2.c.length-1,true,true);
}

// ─────────────────────────────────────────── layers ───────────────────────────────────────────
/** A depth layer prints as: contour ribbons (line ink) → knockout of the silhouette → kit inks → shade → post lines.
 * The knockout erases the inner half of every contour and every seam between the layer's parts, so what is left is ONE continuous
 * outline around the union of the parts: no joint seams, costs one op. */
type Fill={ink:string;cov:number;p:Path2D};
class Layer{
 sil=new Path2D();pre=new Path2D();post=new Path2D();shade=new Path2D();fills=new Map<string,Fill>();
 clipped:{ink:string;cov:number;p:Path2D;outside:Path2D[]}[]=[];pattern:{ink:string;cov:number;p:Path2D;clip:Path2D;outside:Path2D[]}|null=null;num:{p:Path2D;fill:InkFill}|null=null;
 used={pre:false,post:false,shade:false};empty=true;lineInk:string;hasLeg=false;
 constructor(lineInk:string){this.lineInk=lineInk;}
 /** batch a fill by ink + coverage; a solid fill in the key-line ink joins the post-line op */
 add(f:InkFill,p:Path2D){const k=inkOf(f);if(!k)return;if(k[0]===this.lineInk&&k[1]>=.95){this.addPost(p);return;}const key=k[0]+'|'+k[1];let e=this.fills.get(key);if(!e){e={ink:k[0],cov:k[1],p:new Path2D()};this.fills.set(key,e);}e.p.addPath(p);}
 addPre(p:Path2D){this.pre.addPath(p);this.used.pre=true;}
 addPost(p:Path2D){this.post.addPath(p);this.used.post=true;}
 addShade(p:Path2D){this.shade.addPath(p);this.used.shade=true;}
}
export type Motion={prev?:Pose;prevPlace?:Place};
type Ctx={skin:InkFill[];s:Sheet;cam:Projector;sd:Pt;lw:number;step:number;seed:number;detail:Detail;style:AthleteStyle;px:(p:V3)=>Pt;k:(p:V3)=>number;big:Path2D;
 hairTrail:V3;hemTrail:V3};
/** contour of a part: closed (a hand, a boot) or open (an attached limb, fading into the body); pre = union outline, post = drawn over fills */
function contour(C:Ctx,L:Layer,pts:Pt[],closed:boolean,seed:number,post=false){
 if(pts.length<2||C.detail==='low')return;
 const r=ribbon(closed?orient(pts):pts,post?C.lw:C.lw*2,{seed:C.seed+seed,close:closed,pressure:.55,taper:closed?0:.85,wobble:C.lw*.3,step:C.step});
 if(post)L.addPost(r);else L.addPre(r);
}
/** fill region: into the silhouette and the ink batch(es) */
function region(L:Layer,pts:Pt[],fills:InkFill[]){if(pts.length<3)return null;const p=poly(pts);L.sil.addPath(p);L.empty=false;for(const f of fills)L.add(f,p);return p;}
function flush(C:Ctx,L:Layer){
 if(L.empty)return;const s=C.s,st=C.style,lineInk=st.line;
 if(C.detail==='low')s.stroke(lineInk,L.sil,C.lw*2);else if(L.used.pre)s.fill(lineInk,L.pre);
 s.knockout(L.sil);
 for(const f of L.fills.values())s.fill(f.ink,f.p,f.cov);
 const outside=(ps:Path2D[])=>{for(const q of ps){const o=new Path2D(C.big);o.addPath(q);s.clip(o,'evenodd');}};
 for(const f of L.clipped){s.save();outside(f.outside);s.fill(f.ink,f.p,f.cov);s.restore();}
 if(L.pattern){s.save();s.clip(L.pattern.clip);outside(L.pattern.outside);s.fill(L.pattern.ink,L.pattern.p,L.pattern.cov);s.restore();}
 const sh=inkOf(st.shade===undefined?[lineInk,.3]:st.shade);if(sh&&L.used.shade)s.fill(sh[0],L.shade,sh[1]);
 if(L.num){const k=inkOf(L.num.fill);if(k){if(k[0]===lineInk&&k[1]>=.95)L.addPost(L.num.p);else s.fill(k[0],L.num.p,k[1]);}}
 if(L.used.post)s.fill(lineInk,L.post);
}

// ─────────────────────────────────────────── the body ───────────────────────────────────────────
type Ring={c:V3;ax:V3;az:V3;rx:number;rz:number};
const ring=(base:V3,m:M3,y:number,rz:number,rx:number,s:number,bulk:number):Ring=>({c:at(base,m,[0,y*s,0]),ax:axis(m,0),az:axis(m,2),rx:rx*s*Math.sqrt(bulk),rz:rz*s*bulk});
const ringPt=(r:Ring,th:number):V3=>add(r.c,add(mul(r.ax,r.rx*Math.cos(th)),mul(r.az,r.rz*Math.sin(th))));
const ringN=(r:Ring,th:number):V3=>nrm(add(mul(r.ax,Math.cos(th)/r.rx),mul(r.az,Math.sin(th)/r.rz)));
const lerpRing=(a:Ring,b:Ring,u:number):Ring=>({c:mix3(a.c,b.c,u),ax:nrm(mix3(a.ax,b.ax,u)),az:nrm(mix3(a.az,b.az,u)),rx:a.rx+(b.rx-a.rx)*u,rz:a.rz+(b.rz-a.rz)*u});
const facing=(C:Ctx,p:V3,n:V3)=>dot(n,nrm(sub(C.cam.eye,p)));
/** 7-segment block digits, glyph box 1 × 2 */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd'};
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

type Limb={kind:'arm'|'leg';side:'l'|'r';depth:number};
function drawLeg(C:Ctx,L:Layer,sk:Skeleton,side:'l'|'r',far:boolean){
 const st=C.style,s=sk.s,b=st.build?.bulk??1,th=(st.build?.thighs??1)*b,hip=sk[`${side}Hip`],kn=sk[`${side}Kn`],an=sk[`${side}An`],Th=sk.fr[`${side}Th`],Sn=sk.fr[`${side}Sn`],Ft=sk.fr[`${side}Ft`];
 const P=C.px,W=(p:V3,w:number)=>w*s*C.k(p),seed=side==='l'?10:40,low=C.detail==='low';L.hasLeg=true;
 const fwdT=axis(Th,0),backS=mul(axis(Sn,0),-1),dT=nrm(sub(kn,hip));
 // upper span: from inside the hips (open, no seam), shorts leg, quad swelling forward, tapering into a rounded knee
 const top=sub(hip,mul(dT,.07*s)),hem=mix3(hip,kn,.34),q1=add(mix3(hip,kn,.56),mul(fwdT,.016*s*th)),q2=add(mix3(hip,kn,.82),mul(fwdT,.006*s));
 const U=low?[top,hip,q1,kn]:[top,hip,hem,q1,q2,kn],UW=low?[.21*th,.21*th,.165*th,.105*b]:[.212*th,.214*th,.198*th,.168*th,.128*b,.104*b];
 const up=span(U.map(P),U.map((p,i)=>W(p,UW[i])));
 // lower span: knee, sock top, calf bulging BEHIND the shin, tapering to a slim ankle
 const sockTop=mix3(kn,an,.15),calf=add(mix3(kn,an,.33),mul(backS,.028*s*b)),s2=add(mix3(kn,an,.62),mul(backS,.008*s)),s3=mix3(kn,an,.86);
 const D=low?[kn,calf,an]:[kn,sockTop,calf,s2,s3,an],DW=low?[.104*b,.12*b,.066*b]:[.104*b,.104*b,.126*b,.09*b,.07*b,.064*b];
 const dn=span(D.map(P),D.map((p,i)=>W(p,DW[i])));
 const endU=up.c.length-1,endD=dn.c.length-1;
 if(low){region(L,spanPoly(up,0,up.k[2],false,false),[st.shorts]);region(L,spanPoly(up,up.k[2],endU,false,true),[C.skin[0]??null]);region(L,spanPoly(dn,0,dn.k[1],true,false),[C.skin[0]??null]);region(L,spanPoly(dn,dn.k[1],endD,false,true),[st.socks]);}
 else{
  region(L,spanPoly(up,0,up.k[2],false,false),[st.shorts]);
  region(L,spanPoly(up,up.k[2],endU,false,true),C.skin);
  region(L,spanPoly(dn,0,dn.k[1],true,false),C.skin);
  region(L,spanPoly(dn,dn.k[1],endD,false,true),[st.socks]);
  if(st.trim){const a=dn.k[1];region(L,spanPoly(dn,a,Math.min(endD,a+Math.max(1,Math.round((dn.k[2]-a)*.45))),false,false),[st.trim]);}
  L.addShade(poly(spanShade(up,up.k[2],endU,C.sd)));L.addShade(poly(spanShade(dn,0,endD,C.sd)));
  contour(C,L,spanPoly(up,0,endU,false,true),false,seed);contour(C,L,spanPoly(dn,0,endD,true,true),true,seed+1);
 }
 // boot: the hull of a shaped last (heel cup, flat sole, rounded toe, instep) seen from wherever the camera is
 const B:V3[]=[];for(const z of[-1,1])for(const[x,y,w] of [[-.075,-.02,.034],[-.07,-.072,.034],[.02,-.086,.042],[.14,-.082,.04],[.2,-.062,.026],[.19,-.036,.03],[.1,-.012,.04],[0,.03,.04],[-.058,.032,.034]])B.push(at(an,Ft,[x*s,y*s,z*w*s*b]));
 const boot=low?hull(B.map(P)):softHull(B.map(P),C.step*2);region(L,boot,[st.boots]);contour(C,L,boot,true,seed+2);
 if(C.detail==='high'){const so=[[-.07,-.09],[.05,-.1],[.18,-.088]].map(([x,y])=>P(at(an,Ft,[x*s,y*s,0])));L.addPost(ribbon(so,C.lw*1.3,{seed:C.seed+seed+7,taper:.6,wobble:0,step:C.step}));}
 if(far)L.addShade(poly(spanPoly(up,up.k[1],endU,false,true)));
}
function drawArm(C:Ctx,L:Layer,sk:Skeleton,side:'l'|'r',pose:Pose,far:boolean){
 const st=C.style,s=sk.s,b=st.build?.bulk??1,sh=sk[`${side}Sh`],el=sk[`${side}El`],ha=sk[`${side}Ha`],Up=sk.fr[`${side}Up`],Fo=sk.fr[`${side}Fo`];
 const P=C.px,W=(p:V3,w:number)=>w*s*C.k(p),long=st.sleeves==='long',seed=side==='l'?70:90,low=C.detail==='low',post=L.hasLeg;
 const dU=nrm(sub(el,sh)),fwd=axis(Up,0),dirF=nrm(sub(ha,el));
 // upper span from inside the shoulder: deltoid, biceps swelling forward, into a rounded elbow
 const top=sub(sh,mul(dU,.06*s)),u1=add(mix3(sh,el,.24),mul(fwd,.004*s)),cuff=mix3(sh,el,.46),u2=add(mix3(sh,el,.68),mul(fwd,.012*s));
 const U=low?[top,sh,el]:[top,sh,u1,cuff,u2,el],UW=low?[.13*b,.13*b,.08*b]:[.13*b,.142*b,.128*b,.112*b,.1*b,.08*b];
 const up=span(U.map(P),U.map((p,i)=>W(p,UW[i])));
 // forearm swelling below the elbow, tapering to the wrist
 const f1=add(mix3(el,ha,.26),mul(axis(Fo,0),-.006*s)),f2=mix3(el,ha,.66),D=low?[el,ha]:[el,f1,f2,ha],DW=low?[.08*b,.058]:[.08*b,.09*b,.07*b,.056*b];
 const dn=span(D.map(P),D.map((p,i)=>W(p,DW[i])));
 const endU=up.c.length-1,endD=dn.c.length-1,ci=low?endU:up.k[3];
 if(low){const mid=up.k[1]+Math.round((endU-up.k[1])*.45);region(L,spanPoly(up,0,long?endU:mid,false,long),[st.shirt]);if(!long)region(L,spanPoly(up,mid,endU,false,true),C.skin);region(L,spanPoly(dn,0,endD,true,true),long?[st.shirt]:C.skin);}
 else if(long){region(L,spanPoly(up,0,endU,false,true),[st.shirt]);region(L,spanPoly(dn,0,endD,true,true),[st.shirt]);}
 else{region(L,spanPoly(up,0,ci,false,false),[st.shirt]);region(L,spanPoly(up,ci,endU,false,true),C.skin);region(L,spanPoly(dn,0,endD,true,true),C.skin);
  if(st.trim&&C.detail==='high')region(L,spanPoly(up,Math.max(0,ci-1),ci,false,false),[st.trim]);}
 if(!low){L.addShade(poly(spanShade(up,up.k[1],endU,C.sd)));L.addShade(poly(spanShade(dn,0,endD,C.sd)));
  if(post)contour(C,L,chainContour([up,dn]),false,seed,true);else{contour(C,L,spanPoly(up,0,endU,false,true),false,seed);contour(C,L,spanPoly(dn,0,endD,true,true),true,seed+1);}}
 // hand: fist, open palm (keepers reaching) or glove, with a thumb
 const open=pose[`${side}Hand`],glove=st.gloves!=null,g=glove?1.22:1;
 const hc=add(ha,mul(dirF,(.045+.025*open)*s*g)),c=P(hc),kk=C.k(hc)*s,d2=P(add(ha,dirF)),ang=Math.atan2(d2[1]-c[1],d2[0]-c[0]);
 let hand=ellipse(c,(.05+.03*open)*g*kk,(.042+.01*open)*g*kk,ang,12);
 if(!low){const th=P(add(ha,add(mul(dirF,(.03+.015*open)*s*g),mul(axis(Fo,0),(.045+.02*open)*s*g))));hand=smoothPts(hull([...hand,th]),true,C.step*2,2.6);}
 region(L,hand,glove?[st.gloves??null]:C.skin);contour(C,L,hand,true,seed+3,post);
 if(far)L.addShade(poly(spanPoly(up,up.k[1],endU,false,true)));
}
function hairCap(style:HairStyle):{cap:(x:number,y:number,z:number)=>boolean;scale:number}|null{
 switch(style){
  case 'bald':return null;
  case 'balding':return{cap:(x,y)=>x<.28&&y>-.5&&y<.2,scale:1.02};
  case 'curly':return{cap:(x,y)=>y>Math.max(-.3,.18+.55*x),scale:1.16};
  default:return{cap:(x,y)=>y>Math.max(-.42,.26+.62*x),scale:1.05};
 }
}
/** deltoid cap directions in the torso frame (z = outward, mirrored per side) */
const DELT:V3[]=[[0,1,0],[0,.7,.7],[.7,.7,0],[-.7,.7,0],[.5,.5,.7],[-.5,.5,.7],[0,0,1],[.7,0,.7],[-.7,0,.7],[0,-.4,.9]];
const SPHERE:V3[]=(()=>{const o:V3[]=[];for(let i=1;i<12;i++){const la=-Math.PI/2+i/12*Math.PI;for(let j=0;j<16;j++){const lo=j/16*TAU;o.push([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]);}}o.push([0,1,0]);return o;})();
function drawTorsoHead(C:Ctx,L:Layer,sk:Skeleton){
 const st=C.style,s=sk.s,b=st.build?.bulk??1,{P:Pf,T1,T,H}=sk.fr,low=C.detail==='low',n=low?8:C.detail==='mid'?12:16,sm=(q:Pt[])=>low?hull(q):softHull(q,C.step*3);
 const Rg=(base:V3,m:M3,y:number,rz:number,rx:number)=>ring(base,m,y,rz,rx,s,b);
 const r0=Rg(sk.pelvis,Pf,-.1,.15,.115),r1=Rg(sk.pelvis,Pf,-.02,.172,.125),r2=Rg(sk.pelvis,Pf,.07,.158,.112);
 // shirt: hem (trailing with secondary motion), waist, ribcage, chest, shoulder line, trapezius
 const hem=Rg(sk.pelvis,Pf,.045,.162,.12);hem.c=add(hem.c,C.hemTrail);
 const shirtR=[hem,Rg(sk.chest,T1,-.05,.152,.112),Rg(sk.chest,T,.08,.2,.132),Rg(sk.chest,T,.185,.212,.106),Rg(sk.chest,T,.25,.085,.068)];
 const proj=(r:Ring)=>{const o:Pt[]=[];for(let i=0;i<n;i++)o.push(C.px(ringPt(r,i/n*TAU)));return o;};
 // rounded deltoid caps over the shoulder joints: the shoulder line is a curve from any view, the sleeves grow out of it
 const delt:Pt[]=[];for(const[j,sd] of [[sk.lSh,-1],[sk.rSh,1]] as [V3,number][])for(const d of DELT)delt.push(C.px(at(j,T,mul(nrm([d[0],d[1],d[2]*sd]),.072*s*b))));
 const shirtPts=sm([...shirtR.flatMap(proj),...delt]),shortsPts=sm([...proj(r0),...proj(r1),...proj(r2)]);
 const shirtP=poly(shirtPts);
 // head: sphere + jaw + nose (the face points where the head looks)
 const hs=(st.build?.head??1)*s,hr=SEG.headR*hs,hc=sk.head,kh=C.k(hc),c2=C.px(hc);
 const headPts=sm([...ellipse(c2,hr*kh,hr*kh,0,low?10:18),C.px(at(hc,H,[.055*hs,-.118*hs,0])),C.px(at(hc,H,[.02*hs,-.1*hs,.052*hs])),C.px(at(hc,H,[.02*hs,-.1*hs,-.052*hs])),C.px(sk.face)]);
 const headP=poly(headPts);
 // number on the back (a paper number is a hole in the shirt ink: no knockout needed)
 let num:Path2D|null=null;
 if(st.number!=null&&!low){const Tb=mul(axis(T,0),-1),o=add(ringPt(lerpRing(shirtR[2],shirtR[3],.1),Math.PI),mul(Tb,.012*s));
  if(facing(C,o,Tb)>.18){const str=String(st.number),S=.1*s,gw=1.45,w0=(str.length*gw-.45)/2,t=.34;num=new Path2D();
   // glyph x runs across the back, glyph y down it. Both are checked on the DEVICE (sheet transform × projection, so a mirroring
   // projector, a negative-x sheet scale or a camera roll all count): a mirrored pair flips x, so the digits never print back to front;
   // an upside-down pair (a keeper lying head-down, a fallen player seen from above) turns 180°, because a 7-segment 3 or 10 turned over
   // reads as its mirror image (Ɛ, 01). The bias keeps a torso near horizontal from toggling between frames.
   let X=axis(T,2),Y=mul(axis(T,1),-1);{const m=C.s.getTransform(),dv=(p:V3):Pt=>{const q=C.px(p);return[m.a*q[0]+m.c*q[1],m.b*q[0]+m.d*q[1]];};
    const p0=dv(o),px=dv(add(o,mul(X,S))),py=dv(add(o,mul(Y,S))),vx=[px[0]-p0[0],px[1]-p0[1]],vy=[py[0]-p0[0],py[1]-p0[1]];
    if(vx[0]*vy[1]-vx[1]*vy[0]<0)X=mul(X,-1);
    if(vy[1]<-.2*Math.hypot(vy[0],vy[1])){X=mul(X,-1);Y=mul(Y,-1);}}
   [...str].forEach((ch,ci)=>{for(const sg of DIGITS[ch]??''){const[[x0,y0],[x1,y1]]=SEGS[sg],ox=ci*gw-w0,hx=x1===x0?t/2:0,hy=y1===y0?t/2:0,ex=x1===x0?0:t/2,ey=y1===y0?0:t/2;
     const q:Pt[]=[[x0-hx-ex,y0-hy-ey],[x1+hx+ex,y0-hy-ey],[x1+hx+ex,y1+hy+ey],[x0-hx-ex,y1+hy+ey]].map(([gx,gy])=>C.px(add(o,add(mul(X,(gx+ox)*S),mul(Y,(gy-1)*S)))) as Pt);
     num!.addPath(poly(q));}});
   if(st.numberInk&&st.numberInk!=='paper')L.num={p:num,fill:st.numberInk};}}
 const paperNum=num&&(!st.numberInk||st.numberInk==='paper')?num:null;
 // shorts, neck, shirt: one silhouette (the knockout merges their contours), kit edges are ink changes only
 const shortsP=poly(shortsPts);L.sil.addPath(shortsP);L.empty=false;
 if(low)L.add(st.shorts,shortsP);else{const k=inkOf(st.shorts);if(k)L.clipped.push({ink:k[0],cov:k[1],p:shortsP,outside:[shirtP]});}
 const neckA=sk.neck,neckB=at(hc,H,[-.01*hs,-.07*hs,0]),neckPts=spanPoly(span([C.px(neckA),C.px(neckB)],[.124*s*b*C.k(neckA),.106*s*C.k(neckB)]),0,1e9,true,true),neckP=poly(neckPts);
 L.sil.addPath(neckP);for(const f of C.skin)L.add(f,neckP);
 L.sil.addPath(shirtP);
 if(low)L.add(st.shirt,shirtP);else{const k=inkOf(st.shirt);if(k)L.clipped.push({ink:k[0],cov:k[1],p:shirtP,outside:paperNum?[headP,neckP,paperNum]:[headP,neckP]});}
 contour(C,L,shortsPts,true,1);contour(C,L,shirtPts,true,2);contour(C,L,neckPts,true,5);
 // torso shade: a band down the side away from the light
 if(!low){const a=C.px(sk.pelvis),bq=C.px(sk.neck);let ux=bq[0]-a[0],uy=bq[1]-a[1];const ul=Math.hypot(ux,uy)||1;ux/=ul;uy/=ul;let nx=-uy,ny=ux;if(nx*C.sd[0]+ny*C.sd[1]<0){nx=-nx;ny=-ny;}
  const outer:Pt[]=[],inner:Pt[]=[];for(const r of shirtR.slice(0,4)){const q=proj(r),cc=C.px(r.c);let e=0;for(const p of q)e=Math.max(e,(p[0]-cc[0])*nx+(p[1]-cc[1])*ny);outer.push([cc[0]+nx*e*.97,cc[1]+ny*e*.97]);inner.push([cc[0]+nx*e*.3,cc[1]+ny*e*.3]);}
  L.addShade(poly(smoothPts([...outer,...inner.reverse()],true,C.step*3,1.4)));}
 // shirt pattern: stripes / hoops on the visible surface
 const pk=inkOf(st.patternInk??null),paperPat=st.patternInk==='paper';
 if((pk||paperPat)&&st.pattern&&st.pattern!=='plain'&&!low){const pat=new Path2D(),SR=shirtR.slice(0,4),rs=(v:number)=>{const x=v*(SR.length-1),i=Math.min(SR.length-2,Math.floor(x));return lerpRing(SR[i],SR[i+1],x-i);};
  const patch=(v0:number,v1:number,t0:number,t1:number)=>{const rm=rs((v0+v1)/2),tm=(t0+t1)/2;if(facing(C,ringPt(rm,tm),ringN(rm,tm))<-.05)return;const q:Pt[]=[];for(let k=0;k<=2;k++)q.push(C.px(ringPt(rs(v0),t0+(t1-t0)*k/2)));for(let k=2;k>=0;k--)q.push(C.px(ringPt(rs(v1),t0+(t1-t0)*k/2)));pat.addPath(poly(q));};
  if(st.pattern==='stripes'){const N=18;for(let j=0;j<N;j+=2)for(let v=0;v<3;v++)patch(v/3,(v+1)/3,j/N*TAU,(j+1)/N*TAU);}
  else{const N=7;for(let j=0;j<N;j+=2)for(let k=0;k<16;k++)patch(j/N,(j+1)/N,k/16*TAU,(k+1)/16*TAU);}
  // an ink pattern prints over the shirt; a paper pattern is a hole in the shirt ink (white stripes / hoops on a coloured shirt)
  if(pk)L.pattern={ink:pk[0],cov:pk[1],p:pat,clip:shirtP,outside:paperNum?[headP,neckP,paperNum]:[headP,neckP]};
  else{const sc=L.clipped.find(f=>f.p===shirtP);if(sc)sc.outside.push(pat);}}
 // collar
 if(!low){const r5=shirtR[4],q:Pt[]=[];for(let i=-5;i<=5;i++){const th=i/10*Math.PI,p=ringPt(r5,th);if(facing(C,p,ringN(r5,th))>-.1)q.push(C.px(p));}
  if(q.length>1){const t=inkOf(st.trim??null);if(t)L.add(st.trim!,ribbon(q,.026*s*C.k(r5.c),{seed:C.seed+3,taper:.3,wobble:0,step:C.step}));else L.addPost(ribbon(q,C.lw*.7,{seed:C.seed+3,taper:.5,wobble:0,step:C.step}));}}
 // head, ears, hair (trailing with secondary motion), eyes
 L.sil.addPath(headP);for(const f of C.skin)L.add(f,headP);contour(C,L,headPts,true,4);
 if(!low){L.addShade(crescent(c2[0],c2[1],hr*kh,[-.45,-.4]));
  for(const sg of[-1,1]){const e=at(hc,H,[-.01*hs,-.012*hs,sg*.1*hs]);if(facing(C,e,mul(axis(H,2),sg))>.3){const ear=ellipse(C.px(e),.026*hs*kh,.034*hs*kh,0,10);region(L,ear,C.skin);contour(C,L,ear,true,60+sg);}}}
 const hsty=st.hairStyle??'short',hp=hairCap(hsty),hk=inkOf(st.hair);
 if(hp&&hk){const v=nrm(sub(hc,C.cam.eye)),caps:V3[][]=hsty==='balding'?[[],[]]:[[]];
  for(const u of SPHERE){if(!hp.cap(u[0],u[1],u[2]))continue;let d=mv(H,u);if(dot(d,v)>0)d=nrm(sub(d,mul(v,dot(d,v))));caps[hsty==='balding'&&u[2]>0?1:0].push(add(hc,mul(d,hr*hp.scale)));}
  if(hsty==='long')for(const q of[[-.8,-1.5,.55],[-.8,-1.5,-.55],[-.3,-1.2,.85],[-.3,-1.2,-.85],[-.95,-.9,0]] as V3[])caps[0].push(add(at(hc,H,mul(q,hr)),mul(C.hairTrail,-q[1]*.7)));
  for(const cp of caps){if(cp.length<3)continue;let q=sm(cp.map(C.px));
   if(hsty==='curly'&&!low){const cx=q.reduce((a,p)=>a+p[0],0)/q.length,cy=q.reduce((a,p)=>a+p[1],0)/q.length;q=smoothPts(hull(q),true,Math.max(1e-3,hr*kh*.22),3).map((p,i)=>{const k=1+.08*Math.abs(Math.sin(i*1.9));return[cx+(p[0]-cx)*k,cy+(p[1]-cy)*k] as Pt;});}
   region(L,q,[st.hair]);contour(C,L,q,true,80);}
  if(hsty==='ponytail'){const a=at(hc,H,[-.9*hr,.25*hr,0]),b2=add(add(at(hc,H,[-1.55*hr,-.25*hr,0]),[0,-.07*s,0]),mul(C.hairTrail,.6)),c3=add(add(at(hc,H,[-1.6*hr,-.95*hr,0]),[0,-.13*s,0]),mul(C.hairTrail,1.3));
   const pt=span([a,b2,c3].map(C.px),[.075*s*kh,.062*s*kh,.02*s*kh]),q=spanPoly(pt,0,1e9,true,true);region(L,q,[st.hair]);contour(C,L,q,true,81);}}
 if(!low&&hr*kh*pxPer(C.s)>3.2){for(const sg of[-1,1]){const e=at(hc,H,[.088*hs,.018*hs,sg*.042*hs]);if(facing(C,e,nrm(mv(H,[.75,0,sg*.65])))>.2)L.addPost(poly(ellipse(C.px(e),.012*hs*kh,.016*hs*kh,0,8)));}}
}

// ─────────────────────────────────────────── public drawing ───────────────────────────────────────────
export type DrawResult={sk:Skeleton;joints:Record<JointName,Pt>;heightPx:number;detail:Detail;ops:number};
/** groundShadow: a soft footprint of the body on the ground (one op), fading as the body leaves the ground */
function groundShadowInner(s:Sheet,sk:Skeleton,camera:Projector|CameraSpec,fill:InkFill,groundY=0){
 const k=inkOf(fill);if(!k)return;const cam=asProjector(camera),pts:Pt[]=[];let low=Infinity;
 for(const j of ['lToe','rToe','lHeel','rHeel','lKn','rKn','pelvis','chest','head','lHa','rHa'] as JointName[]){const q=sk[j],h=q[1]-groundY;low=Math.min(low,h);if(h>1.3*sk.s)continue;const r=(.13-.05*Math.min(1,h))*sk.s;for(let i=0;i<8;i++){const a=i/8*TAU;const p=cam.project([q[0]+Math.cos(a)*r*1.4,groundY,q[2]+Math.sin(a)*r]);pts.push([p[0],p[1]]);}}
 if(pts.length<3)return;s.fill(k[0],poly(smoothPts(hull(pts),true,4,2.6)),k[1]*clamp(1-Math.max(0,low)*.5,.3,1));
}
/** drawAthlete(sheet, pose, camera, style, place?, motion?) — motion.prev (the pose one drawn frame earlier, e.g. gen(t − 1/12)) turns on
 * secondary motion: hair and the shirt hem trail the movement. */
function drawAthleteInner(s:Sheet,pose:Pose,camera:Projector|CameraSpec,style:AthleteStyle,place:Place={},motion:Motion={}):DrawResult{
 const ops0=s._ops,cam=asProjector(camera),sc=style.scale??1,sk=solve(pose,style.build,place,sc);
 // squash & stretch: a volume-preserving 2D scale along the body's axis, anchored at the lowest point
 const raw=(p:V3):Pt=>{const q=cam.project(p);return[q[0],q[1]];},kq=pose.squash||0;
 let px=raw,wf=1;
 if(Math.abs(kq)>1e-3){let lowJ:V3=sk.lToe;for(const j of ['rToe','lHeel','rHeel','lKn','rKn','pelvis','lHa','rHa','head'] as JointName[])if(sk[j][1]<lowJ[1])lowJ=sk[j];
  const c=raw(lowJ),a0=raw(sk.pelvis),a1=raw(sk.neck);let ax=a1[0]-a0[0],ay=a1[1]-a0[1];const al=Math.hypot(ax,ay);if(al<1e-6){ax=0;ay=-1;}else{ax/=al;ay/=al;}
  const along=1+kq,perp=1/(1+kq);wf=Math.sqrt(perp);
  px=(p:V3):Pt=>{const q=raw(p),dx=q[0]-c[0],dy=q[1]-c[1],t=dx*ax+dy*ay,ox=dx-ax*t,oy=dy-ay*t;return[c[0]+ax*t*along+ox*perp,c[1]+ay*t*along+oy*perp];};}
 const k=(p:V3)=>scaleAt(cam,p)*wf;
 const ppu=pxPer(s),heightPx=1.8*sk.s*scaleAt(cam,sk.pelvis)*ppu;
 const detail:Detail=!style.detail||style.detail==='auto'?(heightPx<50?'low':heightPx<170?'mid':'high'):style.detail;
 const lwPx=clamp(heightPx*.0115,.9,3.6)*(style.lineWeight??1);
 const big=new Path2D();big.rect(-1e6,-1e6,2e6,2e6);
 // secondary motion from the previous pose: hair trails the head, the hem trails the hips
 let hairTrail:V3=[0,0,0],hemTrail:V3=[0,0,0];
 if(motion.prev){const pk=solve(motion.prev,style.build,motion.prevPlace??place,sc),cap=(v:V3,m:number):V3=>{const l=len(v);return l>m?mul(v,m/l):v;};
  hairTrail=cap(mul(sub(pk.head,sk.head),.9),.16*sk.s);hemTrail=cap(mul(sub(pk.pelvis,sk.pelvis),.35),.045*sk.s);hemTrail[1]=Math.abs(hemTrail[1])*.5;}
 const skin=detail==='low'?style.skin.slice().sort((a,b)=>(inkOf(b)?.[1]??0)-(inkOf(a)?.[1]??0)).slice(0,1):style.skin;
 const C:Ctx={skin,s,cam,sd:[.94,.34],lw:lwPx/ppu,step:Math.max(2.2/ppu,1e-3),seed:style.seed??1,detail,style,px,k,big,hairTrail,hemTrail};
 if(style.shadow!==false)groundShadow(s,sk,cam,style.shadow===undefined?[style.line,.26]:style.shadow,place.y??0);
 // depth sort: limbs deeper than the torso print behind it
 const d=(p:V3)=>cam.project(p)[2],torso=(d(sk.pelvis)+d(sk.chest))/2;
 const limbs=([{kind:'leg',side:'l',depth:(d(sk.lHip)+d(sk.lKn)+d(sk.lAn))/3},{kind:'leg',side:'r',depth:(d(sk.rHip)+d(sk.rKn)+d(sk.rAn))/3},
  {kind:'arm',side:'l',depth:(d(sk.lSh)+d(sk.lEl)+d(sk.lHa))/3},{kind:'arm',side:'r',depth:(d(sk.rSh)+d(sk.rEl)+d(sk.rHa))/3}] as Limb[]).sort((a,b)=>a.kind===b.kind?b.depth-a.depth:a.kind==='leg'?-1:1);
 const back=limbs.filter(l=>l.depth>torso),front=limbs.filter(l=>l.depth<=torso);
 const drawLimb=(L:Layer,l:Limb,far:boolean)=>l.kind==='leg'?drawLeg(C,L,sk,l.side,far):drawArm(C,L,sk,l.side,pose,far);
 if(detail==='low'){const L=new Layer(style.line);for(const l of back)drawLimb(L,l,true);drawTorsoHead(C,L,sk);for(const l of front)drawLimb(L,l,false);flush(C,L);}
 else{const B=new Layer(style.line);for(const l of back)drawLimb(B,l,true);flush(C,B);
  const M=new Layer(style.line);drawTorsoHead(C,M,sk);flush(C,M);
  const F=new Layer(style.line);for(const l of front)drawLimb(F,l,false);flush(C,F);}
 const joints={} as Record<JointName,Pt>;for(const j of JOINTS)joints[j]=px(sk[j]);
 return{sk,joints,heightPx,detail,ops:s._ops-ops0};
}
/** motionSmear: for hands/feet/head that moved more than `threshold` css px since prevPose, print a halftone echo of the limb and
 * tapered speed lines along its arc — call BEFORE drawAthlete so the body prints over its own trail. ≤ 2 ops. */
function motionSmearInner(s:Sheet,prevPose:Pose,pose:Pose,camera:Projector|CameraSpec,style:AthleteStyle,place:Place={},o:{prevPlace?:Place;ink?:InkFill;threshold?:number;lines?:boolean}={}){
 const cam=asProjector(camera),pp=o.prevPlace??place,ppu=pxPer(s),thr=o.threshold??7,sc=style.scale??1;
 const mixPlace=(u:number):Place=>({x:(pp.x??0)+((place.x??0)-(pp.x??0))*u,y:(pp.y??0)+((place.y??0)-(pp.y??0))*u,z:(pp.z??0)+((place.z??0)-(pp.z??0))*u,yaw:(pp.yaw??0)+((place.yaw??0)-(pp.yaw??0))*u});
 const skAt=(u:number)=>solve(blendPose(prevPose,pose,u),style.build,mixPlace(u),sc),a=skAt(0),b=skAt(1),px=(p:V3):Pt=>{const q=cam.project(p);return[q[0],q[1]];};
 const ends:[JointName,JointName[],number[]][]=[['rToe',['rKn','rAn','rToe'],[.1,.07,.06]],['lToe',['lKn','lAn','lToe'],[.1,.07,.06]],['rHa',['rEl','rHa'],[.08,.06]],['lHa',['lEl','lHa'],[.08,.06]],['head',['head'],[.2]]];
 const echo=new Path2D(),lines=new Path2D();let any=false;const hPx=1.8*b.s*scaleAt(cam,b.pelvis)*ppu;
 for(const[e,chain,w] of ends){const pa=px(a[e]),pb=px(b[e]),dist=Math.hypot(pb[0]-pa[0],pb[1]-pa[1])*ppu;if(dist<thr)continue;any=true;
  for(const u of hPx<170?[.5]:[.33,.66]){const q=skAt(u),kk=scaleAt(cam,q[e])*q.s;const pts=chain.map(j=>px(q[j]));echo.addPath(poly(pts.length===1?ellipse(pts[0],w[0]*kk/2,w[0]*kk/2):spanPoly(span(pts,w.map(v=>v*kk)),0,1e9,true,true)));}
  if(o.lines!==false){const path=[0,.25,.5,.75,1].map(u=>px(skAt(u)[e])),dx=pb[0]-pa[0],dy=pb[1]-pa[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,gap=.035*b.s*scaleAt(cam,b[e]);
   for(const off of[-1,0,1])lines.addPath(ribbon(path.map(p=>[p[0]+nx*off*gap,p[1]+ny*off*gap] as Pt),(1.6-.4*Math.abs(off))/ppu,{seed:(style.seed??1)+off+7,taper:.9,pressure:.2,wobble:0}));}}
 if(!any)return;const ink=inkOf(o.ink??[style.line,.45]);if(ink)s.fill(ink[0],echo,ink[1]);if(o.lines!==false)s.fill(style.line,lines,.8);
}

// Figures are "action": while one prints, sheet._flat > 0 and the card films' "action" dot mode prints its tints without a screen
// (lib/paths/riso/sheet.ts DotMode). No effect in the classic riso mode.
const figure=<A extends unknown[],R>(fn:(s:Sheet,...a:A)=>R)=>(s:Sheet,...a:A):R=>{s._flat=(s._flat||0)+1;try{return fn(s,...a);}finally{s._flat--;}};
/** groundShadow: a soft footprint of the body on the ground (one op), fading as the body leaves the ground */
export const groundShadow=figure(groundShadowInner);
/** drawAthlete(sheet, pose, camera, style, place?, motion?) — see drawAthleteInner */
export const drawAthlete=figure(drawAthleteInner);
/** motionSmear: halftone echo and speed lines of fast limbs — see motionSmearInner */
export const motionSmear=figure(motionSmearInner);
