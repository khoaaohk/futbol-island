/**
 * The open gashapon machine, animated (owner, Nov 9 2026: "when buying, the machine needs to interact to show the gashapon being
 * dropped down"). While one island machine is open its static copy in the town batches is folded away (world.ts gashaponStatic)
 * and this live copy stands in exactly the same place, built from the same pieces (lib/graphics/gashaponMesh.ts), split into
 * the parts that move:
 *   body (cabinet, globe seat, cap, topper) · crank (turn-knob) · pool (the capsules in the globe) · capsule (the next one) ·
 *   flap (the tray's swing flap) · glass (the globe).
 * A spin plays, in order: the knob turns a full turn while the cabinet rattles and the capsules tumble; the bottom capsule sinks
 * into the seat, shows again at the top of the chute window, slides down it, hops into the tray with a bounce as the flap swings
 * open, and waits there (`onTray`). `crack()` pops the capsule open (the two halves fly apart and shrink away); the next capsule then
 * settles back into the globe.
 *
 * Cost: 6 small vertex-coloured meshes (body, knob, pool, the capsule's two halves, flap) sharing ONE material + 1 glass mesh, only while a machine is open (created on open, disposed
 * on close). No lights, no textures, no shadows cast; per frame only a few transform writes, and nothing at all while idle.
 * Reduced motion: no rattle, tumble or travel; the capsule fades from the globe into the tray.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {GashaponMachine} from '../gashapon/machines';
import {gashaponPieces,gashaponBases,disposeBases,gashaponGlassMaterial,gashaFace,type GashaFace,type GashaPart} from './gashaponMesh';

export type GashaponLivePhase='idle'|'turn'|'chute'|'tray'|'crack';
/** Seconds: knob turn + rattle, sink and chute slide, hop into the tray, the crack. */
export const LIVE_TIMES={turn:.9,sink:.22,slide:.42,hop:.34,crack:.36,settle:.4} as const;
const paint=(g:T.BufferGeometry,hex:string)=>{const c=new T.Color(hex),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;};
const plain=(g:T.BufferGeometry)=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();for(const k of Object.keys(n.attributes))if(k!=='position'&&k!=='normal')n.deleteAttribute(k);return n;};
const smooth=(t:number)=>t*t*(3-2*t);
/** Spring-back speed of a knob let go early (rad / s: three quarters of a turn in ~0.3 s). */
const SPRING=15;

export function createGashaponLive(scene:T.Object3D){
 const solid=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,name:'gashapon-live'});let glassMat:T.Material|null=null;
 let F:GashaFace=gashaFace({id:''});
 let live:{m:GashaponMachine;root:T.Group;body:T.Mesh;crank:T.Group;pool:T.Group;capsule:T.Group;top:T.Mesh;bottom:T.Mesh;flap:T.Group;glass:T.Mesh}|null=null;
 let dropWanted=false,phase:GashaponLivePhase='idle',t=0,reduced=false,onTray:(()=>void)|null=null,settle=0,changed=false;
 // Hand turn (Nov 10 2026): `held` is the knob angle under the finger (clockwise +); `springing` while it eases back to 0;
 // `from` is where a committed hand turn hands over to the spin's own turn.
 let held=0,springing=false,from=0;
 const next=new T.Vector3(),chuteTop=new T.Vector3(),chuteEnd=new T.Vector3(),tray=new T.Vector3();
 // Per style (lib/graphics/gashaponMesh.ts gashaFace): the live unit's knob, globe, chute and tray.
 const aim=()=>{next.set(F.next.x,F.next.y,F.next.z);chuteTop.set(F.chute.x,F.chute.top-F.capsuleR*.7,F.chute.z+F.capsuleR*.8);chuteEnd.set(F.chute.x,F.chute.bottom+F.capsuleR*.7,F.chute.z+F.capsuleR*.8);
  tray.set(F.tray.x,F.tray.y-F.tray.h*.18,F.tray.z+F.capsuleR*.4);};
 function build(m:GashaponMachine,index:number){
  F=gashaFace(m);aim();const b=gashaponBases(),parts=new Map<GashaPart|'glass'|'top'|'bottom',T.BufferGeometry[]>();
  for(const p of gashaponPieces(m,index,b)){const g=plain(p.geometry);const key=p.glass?'glass':p.part==='next'?(p.color==='#fbfbf6'?'bottom':'top'):p.part;
   if(!p.glass)paint(g,p.color);let list=parts.get(key);if(!list)parts.set(key,list=[]);list.push(g);}
  disposeBases(b);
  const merged=(k:GashaPart|'glass'|'top'|'bottom',pivot?:T.Vector3)=>{const list=parts.get(k)??[];const g=mergeGeometries(list,false)!;list.forEach(x=>x.dispose());if(pivot)g.translate(-pivot.x,-pivot.y,-pivot.z);g.computeBoundingSphere();return g;};
  const mesh=(g:T.BufferGeometry,mat:T.Material,name:string)=>{const x=new T.Mesh(g,mat);x.name=name;x.castShadow=false;x.receiveShadow=true;return x;};
  const group=(pos:T.Vector3,...kids:T.Object3D[])=>{const g=new T.Group();g.position.copy(pos);kids.forEach(k=>g.add(k));return g;};
  const knob=new T.Vector3(F.knob.x,F.knob.y,0),globe=new T.Vector3(F.globe.x,F.globe.y,F.globe.z),hinge=new T.Vector3(F.tray.x,F.flapHinge.y,F.flapHinge.z);
  glassMat??=gashaponGlassMaterial();
  const root=new T.Group();root.name='gashapon-live';root.position.set(m.x,m.y,m.z);root.rotation.y=m.yaw;
  const body=mesh(merged('body'),solid,'gashapon-live-body'),glass=mesh(merged('glass'),glassMat,'gashapon-live-glass');glass.receiveShadow=false;glass.renderOrder=1;
  const crank=group(knob,mesh(merged('crank',knob),solid,'gashapon-live-crank'));
  const pool=group(globe,mesh(merged('pool',globe),solid,'gashapon-live-pool'));
  const top=mesh(merged('top',next),solid,'gashapon-live-capsule'),bottom=mesh(merged('bottom',next),solid,'gashapon-live-capsule-base');
  const capsule=group(next,top,bottom);
  const flap=group(hinge,mesh(merged('flap',hinge),solid,'gashapon-live-flap'));
  root.add(body,crank,pool,capsule,flap,glass);scene.add(root);root.updateMatrixWorld(true);
  return {m,root,body,crank,pool,capsule,top,bottom,flap,glass};
 }
 function pose(){
  if(!live)return;const L=live,{crank,pool,capsule,flap,root,m}=L;
  crank.rotation.z=0;pool.rotation.set(0,0,0);pool.position.set(F.globe.x,F.globe.y,F.globe.z);root.position.set(m.x,m.y,m.z);root.rotation.set(0,m.yaw,0);flap.rotation.x=0;
  capsule.visible=true;capsule.scale.setScalar(1);capsule.rotation.set(0,0,0);L.top.position.set(0,0,0);L.bottom.position.set(0,0,0);L.top.rotation.set(0,0,0);L.bottom.rotation.set(0,0,0);
  const S=LIVE_TIMES;
  if(phase==='idle'){capsule.position.copy(next);crank.rotation.z=held?-held:0;if(settle>0){const k=smooth(1-settle/S.settle);capsule.scale.setScalar(Math.max(.01,k));}}
  else if(phase==='turn'){
   const k=Math.min(1,t/S.turn),rest=Math.PI*2-Math.abs(from);crank.rotation.z=-(from+Math.sign(from||1)*smooth(k)*rest);capsule.position.copy(next);
   if(!reduced){const fade=Math.sin(k*Math.PI);root.rotation.z=Math.sin(t*46)*.012*fade;root.position.x=m.x+Math.sin(t*39)*.006*fade*Math.cos(m.yaw);root.position.z=m.z-Math.sin(t*39)*.006*fade*Math.sin(m.yaw);
    pool.rotation.set(Math.sin(t*17)*.22*fade,t*3.2*fade,Math.sin(t*23)*.18*fade);pool.position.y=F.globe.y+Math.abs(Math.sin(t*21))*.018*fade;
    capsule.position.y=next.y+Math.abs(Math.sin(t*25))*.012*fade;capsule.rotation.z=Math.sin(t*19)*.3*fade;}
  }else if(phase==='chute'){
   const a=S.sink,b=a+S.slide,c=b+S.hop;
   if(reduced){capsule.position.copy(tray);capsule.scale.setScalar(Math.min(1,t/.2));flap.rotation.x=-1.05;}
   else if(t<a){const k=smooth(t/a);capsule.position.set(next.x,next.y-k*(F.capsuleR*2.4),next.z);}// sinks into the seat (hidden by it)
   else if(t<b){const k=(t-a)/S.slide,g=k*k;capsule.scale.setScalar(.82);capsule.position.lerpVectors(chuteTop,chuteEnd,g);capsule.rotation.z=-g*2.4;}
   else{const k=Math.min(1,(t-b)/S.hop);capsule.scale.setScalar(.82+.18*k);capsule.position.lerpVectors(chuteEnd,tray,k);
    capsule.position.y+=Math.sin(k*Math.PI)*.05+(k>.7?Math.sin((k-.7)/.3*Math.PI)*.025:0);capsule.rotation.z=-2.4-k*1.4;}
   flap.rotation.x=reduced?-1.05:-1.05*smooth(T.MathUtils.clamp((t-b+.12)/.18,0,1));
   if(t>=(reduced?.2:c)){phase='tray';const fn=onTray;onTray=null;fn?.();}
  }
  if(phase==='tray'){capsule.position.copy(tray);capsule.rotation.z=reduced?0:-3.8;flap.rotation.x=-1.05;}
  if(phase==='crack'){const k=Math.min(1,t/S.crack);capsule.position.copy(tray);capsule.rotation.z=reduced?0:-3.8;flap.rotation.x=-1.05*(1-smooth(k));
   if(reduced)capsule.visible=k<.5;else{L.top.position.set(0,k*.16,k*.05);L.top.rotation.x=-k*1.2;L.bottom.position.set(0,-k*.02,k*.1);L.bottom.rotation.x=k*.8;capsule.scale.setScalar(1-.6*Math.max(0,k-.5)*2);capsule.visible=k<1;}
   if(k>=1){phase='idle';settle=LIVE_TIMES.settle;capsule.position.copy(next);}}
  root.updateMatrixWorld(true);
 }
 return {
  get open(){return live?.m.id??null;},get phase(){return phase;},
  /** Build the live copy of `m` (the caller hides its static copy). */
  show(m:GashaponMachine,index=0){if(live?.m.id===m.id)return;this.hide();live=build(m,index);phase='idle';t=0;settle=0;pose();},
  hide(){held=0;springing=false;from=0;if(!live)return;live.root.removeFromParent();live.root.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});live=null;phase='idle';onTray=null;},
  /** Knob turn + rattle + tumble, then the drop; `arrived` once the capsule rests in the tray. */
  spin(arrived:()=>void){if(!live)return;from=held;held=0;springing=false;phase='turn';t=0;dropWanted=false;settle=0;onTray=arrived;changed=true;},
  /** The coins are taken and the toy is saved: let the capsule go down the chute (after the turn ends). */
  drop(){if(!live)return;if(phase==='turn')dropWanted=true;else if(phase==='idle'){phase='chute';t=0;}},
  /** The spin failed: put everything back with no capsule out. */
  cancel(){if(!live)return;held=0;springing=false;from=0;phase='idle';t=0;settle=0;onTray=null;dropWanted=false;changed=true;},
  /** The knob held by hand at `angle` (radians, clockwise +), idle only: one pose, no loop. */
  hold(angle:number){if(!live||phase!=='idle')return;held=angle;springing=false;changed=true;},
  /** Let go before the commit: spring back to rest (reduced motion: at once). */
  letGo(reducedMotion:boolean){if(!live||phase!=='idle'||!held)return;if(reducedMotion){held=0;changed=true;}else springing=true;},
  /** Tap on the capsule in the tray: it cracks open. */
  crack(){if(!live||phase!=='tray')return;phase='crack';t=0;},
  /** Per frame while open. Returns true when something moved (nothing at all while idle). */
  update(dt:number,reducedMotion:boolean){
   if(!live)return false;reduced=reducedMotion;const d=Math.min(dt,.05);
   if(phase==='idle'&&springing){const step=d*SPRING;held=Math.abs(held)<=step||reduced?0:held-Math.sign(held)*step;if(!held)springing=false;pose();return true;}
   if(phase==='idle'&&settle<=0){if(changed){changed=false;pose();return true;}return false;}
   t+=d;if(phase==='idle')settle=Math.max(0,settle-d);
   if(phase==='turn'&&dropWanted&&(reduced||t>=LIVE_TIMES.turn)){phase='chute';t=0;dropWanted=false;}
   pose();return true;},
  dispose(){this.hide();solid.dispose();glassMat?.dispose();glassMat=null;},
 };
}
export type GashaponLive=ReturnType<typeof createGashaponLive>;
