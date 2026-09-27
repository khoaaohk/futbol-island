import * as T from 'three';
import {beanShapeOf,beanSurface,BEAN_Y0} from './beanGearFit';
import {CHEST_HEIGHT} from './spineSurface';
import type {BeanExpression} from './beanLook';
import {setKnockdownGround} from './ballReactions';

/**
 * Falls and knockdowns with bean bodies (lane F, docs/bean-characters/CONTRACT.md).
 *
 * `knockdownLowest` finds the lowest point of a rig in its parent's space from local transforms only (no world
 * matrices, no scene traversal): the bean shell (sampled rings on the torso and chest joints, so the spine bend is
 * followed), the noodle limb joints with their tube/mitten/boot radii, or the classic body's joints. Root squash,
 * roll and pitch are included, so a pancake or a knocked-over rig can be kept on the ground with
 * `root.position.y += knockdownLift(root, floor)`. ~70 point transforms, run only while someone is down.
 */
const _m=new T.Matrix4(),_c=new T.Matrix4(),_v=new T.Vector3();
type Joints={root:T.Object3D;torso?:T.Object3D;chest?:T.Object3D;limbs:[T.Object3D,number,number][]};
const cache=new WeakMap<T.Object3D,Joints>();
function joints(root:T.Object3D):Joints{
 let j=cache.get(root);if(j)return j;
 const n=(name:string)=>root.getObjectByName(name);
 const limbs:[T.Object3D,number,number][]=[];
 // [joint, local y offset, radius]: shoulder/elbow/hand (mitten), hip/knee, ankle (boot, sole at −.088).
 for(const side of ['left','right']){
  const add=(name:string,y:number,r:number)=>{const o=n(side+'-'+name);if(o)limbs.push([o,y,r]);};
  add('shoulder',-.02,.06);add('elbow',0,.052);add('elbow',-.265,.062);add('hip',-.1,.07);add('knee',0,.062);add('ankle',-.03,.058);
 }
 j={root,torso:n('armor-torso'),chest:n('player-chest'),limbs};cache.set(root,j);return j;
}
/** Local chain matrix of `joint` up to and including `root` (root's own transform applied last). */
function chain(joint:T.Object3D,root:T.Object3D,out:T.Matrix4){
 out.identity();for(let o:T.Object3D|null=joint;o;o=o.parent){o.updateMatrix();out.premultiply(o.matrix);if(o===root)break;}return out;
}
const RING_U=[0,.06,.14,.24,.36,.48,.6,.72,.84,.93,1];
export function knockdownLowest(root:T.Object3D){
 const j=joints(root);let low=Infinity;
 const s=beanShapeOf(root);
 if(s&&j.torso&&j.chest){
  chain(j.torso,root,_m);chain(j.chest,root,_c);const span=s.H-BEAN_Y0;
  for(const u of RING_U){const upper=BEAN_Y0+u*span>.34,m=upper?_c:_m;
   for(let a=0;a<8;a++){const p=beanSurface(s,u,a/8*Math.PI*2);_v.set(p.x,upper?p.y-CHEST_HEIGHT:p.y,p.z).applyMatrix4(m);if(_v.y<low)low=_v.y;}}
 }else if(j.torso){chain(j.torso,root,_m);for(const y of [.05,.3,.55,.8]){_v.set(0,y,0).applyMatrix4(_m);low=Math.min(low,_v.y-.18*Math.abs(_m.elements[5]||1));}}
 for(const [joint,y,r] of j.limbs){chain(joint,root,_m);_v.set(0,y,joint.name.endsWith('ankle')?.05:0).applyMatrix4(_m);
  // Radius scaled by the chain's vertical stretch (a squashed root flattens the limbs too).
  const e=_m.elements,sy=Math.sqrt(e[1]*e[1]+e[5]*e[5]+e[9]*e[9]);low=Math.min(low,_v.y-r*Math.min(1,sy));}
 return low;
}
/** How far to raise the root so nothing is below `floor` + `clear` (0 when already clear). */
export function knockdownLift(root:T.Object3D,floor:number,clear=.01){const low=knockdownLowest(root);return Number.isFinite(low)?Math.max(0,floor+clear-low):0;}

/**
 * Face for a fall: surprised at the hit or the drop, beaten (dizzy) while down, happy on the get-up, then back to
 * neutral. Only touches the expression while a fall is running (plus the short get-up window), so it never fights
 * the called/goal expressions the rest of the time.
 */
export function createKnockdownFace(setExpression:(e:BeanExpression)=>void){
 let state:'idle'|'hit'|'down'|'up'='idle',age=0,shown:BeanExpression|undefined;
 const show=(e:BeanExpression)=>{if(e!==shown){shown=e;setExpression(e);}};
 return {
  get state(){return state;},
  update(dt:number,falling:boolean,down:boolean){
   age+=Math.max(0,dt);
   if(falling||down){
    if(state==='idle'||state==='up'){state='hit';age=0;}
    if(state==='hit'&&!falling&&age>.35){state='down';age=0;}
    show(state==='hit'?'surprised':'beaten');
   }else if(state==='hit'||state==='down'){state='up';age=0;show('happy');}
   else if(state==='up'&&age>1.1){state='idle';show('neutral');shown=undefined;}
  },
 };
}
// NPCs knocked over by a truck or a ball (ballReactions.apply) use the same ground keeper.
setKnockdownGround(knockdownLift);
