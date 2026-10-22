// Kid-friendly goal celebration for the procedural rig: two bouncy jumps with both arms up in a V, then a fist pump.
// No player.ts hook: the jump is the rig's own `PlayerMotion.jump` (lift, tuck, landing squash), and the arms are
// posed right after `rig.update` on the named shoulder/elbow joints. The bean skin reads those joints in
// onBeforeRender, so the pose shows on the bean body, the classic body and costume bodies alike.
import type * as T from 'three';
import type {PlayerMotion} from './player';

/** Seconds for one celebration. */
export const CELEBRATION_SECONDS=2.2;
/** Two hops: [start, end] of each jump on celebration progress, and its peak lift (m). */
export const CELEBRATION_HOPS:readonly {start:number;end:number;height:number}[]=[{start:0,end:.36,height:.3},{start:.34,end:.66,height:.22}];
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smooth=(v:number)=>{const t=clamp01(v);return t*t*(3-2*t);};

/** Arm pose at progress p: per arm shoulder x/z and elbow x (rig conventions: −x swings the arm forward/up,
 *  +side·z lifts it out sideways, −x bends the elbow). `w` is the override weight (0 = leave the rig's arms). */
export function celebrationArms(p:number){
  const up=smooth(p/.1)*(1-smooth((p-.66)/.08)); // arms-up V through both hops
  const pump=smooth((p-.66)/.06)*(1-smooth((p-.9)/.1)); // then a fist pump with the right arm
  const beat=Math.max(0,Math.sin((p-.68)/.22*Math.PI*2)); // two pumps
  const w=Math.max(up,pump);
  // Left: V up, then fist at the chest. Right: V up, then elbow-bent pump.
  const left={sx:-2.85*up+(-.5)*pump,sz:-(.42*up+.18*pump),el:-.25*up-1.9*pump};
  const right={sx:-2.85*up+(-.9-.9*beat)*pump,sz:.42*up+.3*pump,el:-.25*up-(1.5+.5*beat)*pump};
  return {w,left,right};
}
/** The jump for progress p (undefined between hops). */
export function celebrationJump(p:number):PlayerMotion['jump']{
  for(const h of CELEBRATION_HOPS)if(p>=h.start&&p<=h.end)return {progress:clamp01((p-h.start)/(h.end-h.start)),height:h.height};
  return undefined;
}
/** Writes the celebration's rig fields into `motion` (it keeps `facing`). */
export function celebrationMotion(p:number,motion:PlayerMotion,reduced=false){
  motion.jump=reduced?undefined:celebrationJump(p);
  return motion;
}
type Joints={ls:T.Object3D;rs:T.Object3D;le:T.Object3D;re:T.Object3D};
const cache=new WeakMap<T.Object3D,Joints|null>();
function joints(root:T.Object3D):Joints|null{
  if(cache.has(root))return cache.get(root)!;
  const ls=root.getObjectByName('left-shoulder'),rs=root.getObjectByName('right-shoulder'),le=root.getObjectByName('left-elbow'),re=root.getObjectByName('right-elbow');
  const j=ls&&rs&&le&&re?{ls,rs,le,re}:null;cache.set(root,j);return j;
}
/** Poses the arms on top of the rig's own pose (call right after `rig.update`, before rendering). */
export function applyCelebrationArms(root:T.Object3D,p:number,weight=1){
  const j=joints(root);if(!j)return;const a=celebrationArms(p),k=a.w*clamp01(weight);if(k<=0)return;
  const set=(s:T.Object3D,e:T.Object3D,t:{sx:number;sz:number;el:number})=>{s.rotation.x+=(t.sx-s.rotation.x)*k;s.rotation.y*=1-k;s.rotation.z+=(t.sz-s.rotation.z)*k;e.rotation.x+=(t.el-e.rotation.x)*k;};
  set(j.ls,j.le,a.left);set(j.rs,j.re,a.right);
}
/** Well played (user, Oct 22 2026): a clap in front of the chest, both hands meeting about 2.6 times a second. `w` is the 0..1 weight. Call after `rig.update`. */
export function applyApplause(root:T.Object3D,age:number,w:number){
  const j=joints(root);if(!j||w<=0)return;
  const k=clamp01(w),open=.5+.5*Math.sin(age*Math.PI*2*2.6),sx=-1.35+.1*(1-open),sz=.04+.34*open,el=-1.15-.15*(1-open);
  const set=(s:T.Object3D,e:T.Object3D,side:number)=>{s.rotation.x+=(sx-s.rotation.x)*k;s.rotation.y*=1-k;s.rotation.z+=(side*sz-s.rotation.z)*k;e.rotation.x+=(el-e.rotation.x)*k;};
  set(j.ls,j.le,-1);set(j.rs,j.re,1);
}
/** Emotes on a scooter, bike or moped: ONE arm only (the right), so the left hand stays on the bar and the vehicle keeps its pose.
 *  emote 0 Wave (a waving hand), 2 High five (an "air five": hand high), 1 Cheer (fist pump up), 5 Well played / 6 Thumbs up (thumbs-up: forearm up, nodding). */
export function applyRideEmote(root:T.Object3D,emote:number,age:number,w:number){
  const j=joints(root);if(!j||w<=0)return;
  const k=clamp01(w),wave=Math.sin(age*9);let sx=-1.5,sz=.25,el=-1.4+.15*Math.sin(age*7);
  if(emote===0){sx=-.3;sz=2.62+.2*wave;el=-.2-.1*wave;}
  else if(emote===2){sx=-2.85;sz=.3+.1*wave;el=-.2;}
  else if(emote===1){sx=-2.85-.15*Math.sin(age*8);sz=.42;el=-.25-.3*Math.max(0,Math.sin(age*8));}
  const s=j.rs;s.rotation.x+=(sx-s.rotation.x)*k;s.rotation.y*=1-k;s.rotation.z+=(sz-s.rotation.z)*k;j.re.rotation.x+=(el-j.re.rotation.x)*k;
}
