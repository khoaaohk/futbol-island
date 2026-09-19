import * as T from 'three';
import type {PlayerRig} from './player';
export type NpcActivityKind='watering'|'sweeping'|'serving';
/** Work poses run after the rig's base pose; never alter collision/root transforms. */
export function createNpcActivity(kind:NpcActivityKind,rig:PlayerRig){
 const root=new T.Group();root.name=`npc-activity-${kind}`;rig.root.add(root);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[];
 const mat=(color:string)=>{const m=new T.MeshStandardMaterial({color,roughness:.8});materials.push(m);return m;};
 const wood=mat('#a47d53'),metal=mat('#6e9b8b'),cream=mat('#f4dda3'),water=mat('#6fc5df');
 const mesh=(geometry:T.BufferGeometry,material:T.Material,parent:T.Object3D=root)=>{geometries.push(geometry);const object=new T.Mesh(geometry,material);object.castShadow=true;parent.add(object);return object;};
 const left=rig.root.getObjectByName('left-shoulder'),right=rig.root.getObjectByName('right-shoulder'),leftElbow=rig.root.getObjectByName('left-elbow'),rightElbow=rig.root.getObjectByName('right-elbow');
 const tool=new T.Group();root.add(tool);const drops:T.Mesh[]=[];
 if(kind==='watering'){
  mesh(new T.CylinderGeometry(.14,.18,.3,10),metal,tool);
  const handle=mesh(new T.TorusGeometry(.16,.025,5,12),wood,tool);handle.position.set(0,.17,0);handle.rotation.y=Math.PI/2;
  const spout=mesh(new T.CylinderGeometry(.025,.045,.42,6),metal,tool);spout.rotation.x=Math.PI/2-.35;spout.position.set(0,.05,.28);
  const rose=mesh(new T.SphereGeometry(.075,8,6),metal,tool);rose.scale.y=.4;rose.position.set(0,.12,.49);
  const geometry=new T.SphereGeometry(.025,5,4);geometries.push(geometry);for(let i=0;i<12;i++){const drop=new T.Mesh(geometry,water);root.add(drop);drops.push(drop);}
 }else if(kind==='sweeping'){
  const staff=mesh(new T.CylinderGeometry(.025,.025,1.2,6),wood,tool);staff.position.y=-.42;
  const brush=mesh(new T.BoxGeometry(.38,.12,.16),cream,tool);brush.position.y=-1.05;
  for(let i=0;i<6;i++){const bristle=mesh(new T.BoxGeometry(.035,.12,.13),wood,tool);bristle.position.set((i-2.5)*.06,-1.13,0);}
 }else{
  mesh(new T.CylinderGeometry(.34,.34,.045,16),wood,tool);
  for(const x of [-.15,.15]){const cup=mesh(new T.CylinderGeometry(.06,.05,.13,10),cream,tool);cup.position.set(x,.09,0);const handle=mesh(new T.TorusGeometry(.04,.012,4,8),cream,tool);handle.position.set(x+.065,.1,0);}
 }
 const handL=new T.Vector3(),handR=new T.Vector3(),tip=new T.Vector3();
 root.visible=false;
 return {root,update(dt:number,time:number,reduced:boolean,working:boolean){
  root.visible=working;if(!working)return;const wave=reduced?0:Math.sin(time*(kind==='sweeping'?2.8:1.3));
  if(left&&right&&leftElbow&&rightElbow){
   if(kind==='watering'){right.rotation.set(-.8-wave*.12,0,.12);rightElbow.rotation.x=-.55;left.rotation.set(-.3,0,-.25);}
   else if(kind==='sweeping'){left.rotation.set(-.7-wave*.18,0,-.16);right.rotation.set(-.95+wave*.18,0,.2);leftElbow.rotation.x=-.5;rightElbow.rotation.x=-.45;}
   else{left.rotation.set(-.75,0,-.16);right.rotation.set(-.75,0,.16);leftElbow.rotation.x=rightElbow.rotation.x=-.9;}
  }
  rig.handPositions(handL,handR);root.worldToLocal(handL);root.worldToLocal(handR);
  if(kind==='serving'){tool.position.copy(handL).add(handR).multiplyScalar(.5);tool.position.z+=.06;tool.position.y+=.015;tool.rotation.set(0,0,0);}
  else if(kind==='sweeping'){tool.position.copy(handR);tool.position.y=Math.max(1.1,tool.position.y);tool.rotation.set(-.18,0,wave*.16);}
  else{tool.position.copy(handR);tool.position.y-=.12;tool.rotation.set(.35+wave*.12,0,0);tool.updateMatrix();tip.set(0,.12,.49).applyMatrix4(tool.matrix);for(let i=0;i<drops.length;i++){const t=((time*1.5+i/drops.length)%1+1)%1;drops[i].visible=!reduced;drops[i].position.set(tip.x+Math.sin(i*3)*t*.12,Math.max(.08,tip.y-t*t*1.25),tip.z+t*.5);drops[i].scale.set(.65,1.8,.65);}}
 },dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
