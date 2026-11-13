/**
 * Stadium Park orchard fruit (Nov 13 2026, owner N3; rules and placement: lib/town/stadiumOrchard.ts). The fruit hangs ON each
 * orchard tree's baked canopy (fruitTrees.ts hangPoint, the same placement as Summit Isle's), in Summit Isle's fruit shapes and
 * shader (fruitMaterial). Walk up to a tree with fruit and it is picked, one at a time, into the island market basket (the
 * backpack's pocket), with the forage notes ("+1 Mango in your basket", the first-time tip, basket full, today's cap) and the
 * island's 'pick' cue; a picked fruit grows back on its tree after ORCHARD_RULES.regrowMin minutes.
 * Heat: ONE instanced mesh (14 trees × 3 fruit = 42 instances of a 84-triangle sphere, 1 draw, no shadow), shown only while the
 * west region is shown and the player is within NEAR m of an orchard. Off there update() is one box test. Near: a few distances per
 * frame; the regrow check once a second; instance uploads only when fruit changes. No timers, no rAF, no allocation per frame.
 * Reduced motion: a picked fruit vanishes at once (no flight to the hand).
 */
import * as T from 'three';
import {hangPoint,fruitMaterial} from './fruitTrees';
import {orchardRig} from '../town/summitOrchard';
import {FRUIT_LOOK,FORAGE_TIP,FORAGE_SAVE_KEY,readForage,forageStore,type FruitTree,type ForageSave} from '../town/summitForage';
import {ORCHARD_RULES,orchardPlanOf,readOrchard,writeOrchard,hanging,orchardCapLeft,recordOrchardPick,type StadiumOrchardTree} from '../town/stadiumOrchard';
import {goodById} from '../town/market/goods';

const NEAR=70,FLY=.3;
type Ports={trees:readonly StadiumOrchardTree[];gather:(good:string)=>number;cue?:(k:string)=>void;haptic?:()=>void;now?:()=>number;
 read?:()=>string|null;write?:(v:string)=>void;readSummit?:()=>string|null};
export type OrchardInput={dt:number;x:number;z:number;y:number;onFoot:boolean;shown:boolean;reduced:boolean};

export function createStadiumOrchard(scene:T.Scene,ports:Ports){
 const now=ports.now??(()=>Date.now()),trees=ports.trees,PER=ORCHARD_RULES.perTree,N=Math.max(1,trees.length*PER);
 const note=(text:string,tip=false)=>{const v=forageStore.get();forageStore.set({note:text,notes:v.notes+1,tip});};
 // Each tree as Summit Isle's runtime sees one (for hangPoint): the rig from the same plan the chunks baked.
 const sites:FruitTree[]=trees.map((o,i)=>{const rig=orchardRig(orchardPlanOf(o));return {kind:'tree',x:o.x,z:o.z,y:0,size:o.s,seed:o.seed,top:{x:rig.crown.x,y:rig.crown.y,z:rig.crown.z},tid:-1-i,rig,form:o.form,fruit:o.fruit,id:o.id,stand:{x:o.x,z:o.z},sides:[]};});
 const hang=sites.flatMap(s=>Array.from({length:PER},(_,k)=>hangPoint(s,k,'')));
 const geo=new T.SphereGeometry(1,7,6),form=new Float32Array(N*4),pat=new Float32Array(N);
 trees.forEach((o,i)=>{const L=FRUIT_LOOK[o.fruit];for(let k=0;k<PER;k++){form.set([L.elong,L.width,L.bend,L.taper],(i*PER+k)*4);pat[i*PER+k]=L.pattern;}});
 geo.setAttribute('aForm',new T.InstancedBufferAttribute(form,4));geo.setAttribute('aPattern',new T.InstancedBufferAttribute(pat,1));
 const mat=fruitMaterial(),mesh=new T.InstancedMesh(geo,mat,N);mesh.name='stadium-orchard-fruit';mesh.castShadow=false;mesh.receiveShadow=false;mesh.visible=false;
 const c=new T.Color();trees.forEach((o,i)=>{for(let k=0;k<PER;k++)mesh.setColorAt(i*PER+k,c.set(FRUIT_LOOK[o.fruit].color));});
 const box={x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity};for(const o of trees){box.x0=Math.min(box.x0,o.x);box.x1=Math.max(box.x1,o.x);box.z0=Math.min(box.z0,o.z);box.z1=Math.max(box.z1,o.z);}
 scene.add(mesh);
 let save:ForageSave=readOrchard(now(),ports.read);
 /** Fruit shown per tree (hanging now), and one flying to the hand (index, age). */
 const shown=new Int8Array(trees.length).fill(-1),fly={i:-1,age:0,x:0,y:0,z:0};
 const D=new T.Object3D(),HIDE=new T.Matrix4().makeScale(0,0,0);
 const paint=(i:number,n:number)=>{const L=FRUIT_LOOK[trees[i].fruit];for(let k=0;k<PER;k++){const q=i*PER+k;
  if(k<n){D.position.copy(hang[q]);D.rotation.set(0,k*1.3,0);D.scale.setScalar(L.r);D.updateMatrix();mesh.setMatrixAt(q,D.matrix);}else{HIDE.setPosition(hang[q]);mesh.setMatrixAt(q,HIDE);}}
  mesh.instanceMatrix.needsUpdate=true;};
 const refresh=()=>{const t=now();let changed=false;for(let i=0;i<trees.length;i++){const n=hanging(save,trees[i].id,t);if(n!==shown[i]){shown[i]=n;paint(i,n);changed=true;}}return changed;};
 refresh();mesh.computeBoundingSphere();
 let sinceCheck=0,pickWait=0,capNoted=false,fullNoted=false;
 const stats={picks:0,refreshes:0,idle:0,full:0,capped:0};
 function pick(i:number,p:OrchardInput){const o=trees[i],good=goodById(o.fruit);if(!good)return false;const t=now();
  const summit=readForage(t,ports.readSummit??(()=>localStorage.getItem(FORAGE_SAVE_KEY)));
  if(orchardCapLeft(save,summit,t)<=0){stats.capped++;if(!capNoted){capNoted=true;note("That's all the fruit for today. Come back tomorrow!");}return false;}
  if(!ports.gather(good.id)){stats.full++;if(!fullNoted){fullNoted=true;note('Your basket is full! Sell some at a farm stand, then come back for it.');}return false;}
  fullNoted=false;const first=!save.tip;save={...recordOrchardPick(save,o.id,t),tip:true};writeOrchard(save,ports.write);stats.picks++;
  const n=shown[i]-1,q=i*PER+n;shown[i]=n;
  if(!p.reduced){fly.i=q;fly.age=0;fly.x=hang[q].x;fly.y=hang[q].y;fly.z=hang[q].z;}else paint(i,n);
  ports.cue?.('pick');ports.haptic?.();note(first?FORAGE_TIP:`+1 ${good.name} in your basket`,first);return true;}
 return {mesh,stats,trees,hang,
  hangingOn:(i:number)=>shown[i],
  update(p:OrchardInput){
   const near=p.shown&&p.x>box.x0-NEAR&&p.x<box.x1+NEAR&&p.z>box.z0-NEAR&&p.z<box.z1+NEAR;
   if(!near){if(mesh.visible)mesh.visible=false;stats.idle++;return;}
   mesh.visible=true;
   // Regrow: once a second, recount (the clock or another tab's save).
   sinceCheck+=p.dt;if(sinceCheck>=1){sinceCheck=0;stats.refreshes++;if(fly.i<0)refresh();}
   // A fruit flying to the hand: shrinks toward the player's chest over FLY s.
   if(fly.i>=0){fly.age+=p.dt;const k=Math.min(1,fly.age/FLY),q=fly.i,i=Math.floor(q/PER),L=FRUIT_LOOK[trees[i].fruit];
    D.position.set(fly.x+(p.x-fly.x)*k,fly.y+(p.y+1-fly.y)*k,fly.z+(p.z-fly.z)*k);D.rotation.set(k*4,0,0);D.scale.setScalar(L.r*Math.max(.05,1-k));D.updateMatrix();mesh.setMatrixAt(q,D.matrix);mesh.instanceMatrix.needsUpdate=true;
    if(k>=1){fly.i=-1;paint(i,shown[i]);}return;}
   // Walk up: on foot within reach of a trunk with fruit, one fruit every pickGap s.
   pickWait=Math.max(0,pickWait-p.dt);if(!p.onFoot||pickWait>0)return;
   const r2=ORCHARD_RULES.reach*ORCHARD_RULES.reach;
   for(let i=0;i<trees.length;i++){if(shown[i]<=0)continue;const dx=trees[i].x-p.x,dz=trees[i].z-p.z;if(dx*dx+dz*dz>r2)continue;
    pickWait=ORCHARD_RULES.pickGap;pick(i,p);return;}
   capNoted=false;
  },
  dispose(){mesh.removeFromParent();mesh.dispose();geo.dispose();mat.dispose();},
 };
}
export type StadiumOrchard=ReturnType<typeof createStadiumOrchard>;
