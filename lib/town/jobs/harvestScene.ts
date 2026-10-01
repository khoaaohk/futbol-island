/**
 * Harvest day props and animations (Sep 30 2026, docs/island-jobs.md §6). Built when the job starts, disposed with the other
 * job props. Heat: 4 instanced meshes (ripe fruit, canopy sway shells, veg bodies, leafy tops) = 4 draws while the job runs;
 * per-frame work only while a tree sways or a root is being pulled; the arcs, hops and bursts are bounded tweens (jobFx.ts).
 * The orchard trees themselves are merged static scenery, so a tree "sways" through a slightly larger copy of its canopy
 * (same shape and colour) that tilts around the trunk top while it is shaken; the ripe fruit hang from that copy.
 */
import * as T from 'three';
import type {JobDef,HarvestSpot} from './jobCatalog';
import {harvestSlots,harvestFruitCount,HARVEST,type JobEvent,type JobRun} from './jobRules';
import {goodById} from '../market/goods';
import {ease,wobble,type JobFx} from './jobFx';

type Own=<X extends {dispose:()=>void}>(x:X)=>X;
type P3={x:number;y:number;z:number};
const TRUNK_TOP=1.6;
export function createHarvestProps(def:JobDef,group:T.Group,own:Own,floor:(x:number,z:number)=>number,fx:JobFx,cue:(kind:string)=>void){
 const task=def.task?.type==='harvest'?def.task:null;if(!task)return null;
 const spots:HarvestSpot[]=task.spots,slots=harvestSlots(spots),fruitTotal=harvestFruitCount(spots);
 const color=(good:string)=>goodById(good)?.color??'#e8be71',c=new T.Color(),hidden=new T.Matrix4().makeScale(0,0,0);
 const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z),Q=new T.Quaternion(),E=new T.Euler();
 const mat4=(x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>new T.Matrix4().compose(V(x,y,z),Q.clone().setFromEuler(E.set(rx,ry,rz)),V(sx,sy,sz));
 // ---- Canopy sway shells (one instance per canopy tree) ----
 const canopyTrees=spots.map((s,i)=>({s,i})).filter(({s})=>s.action==='shake'&&s.canopy&&s.canopy!=='banana');
 const shells=new T.InstancedMesh(own(new T.IcosahedronGeometry(1,0)),own(new T.MeshStandardMaterial({color:'#ffffff',roughness:.8})),Math.max(1,canopyTrees.length));
 shells.name='harvest-canopy-sway';shells.frustumCulled=false;group.add(shells);
 const tilt=spots.map(()=>({t:9,amp:0,ax:1,az:0}));
 /** The tree's sway transform about its trunk top. */
 function treeMatrix(i:number){const s=spots[i],w=tilt[i],a=w.t<1.6?w.amp*Math.sin(w.t*22)*Math.exp(-3.2*w.t):0;
  return new T.Matrix4().compose(V(s.x,floor(s.x,s.z)+TRUNK_TOP,s.z),new T.Quaternion().setFromAxisAngle(V(w.ax,0,w.az).normalize(),a),V(1,1,1));}
 function paintShell(k:number){const {s,i}=canopyTrees[k],cn=s.canopy as {y:number;r:number;sy:number;color:string};
  shells.setMatrixAt(k,treeMatrix(i).multiply(mat4(0,cn.y-TRUNK_TOP,0,cn.r*1.05,cn.r*cn.sy*1.05,cn.r*1.05)));}
 canopyTrees.forEach(({s},k)=>{shells.setColorAt(k,c.set((s.canopy as {color:string}).color));paintShell(k);});shells.instanceMatrix.needsUpdate=true;
 // ---- Ripe fruit: hanging under the canopy (or in the banana bunch), then falling, lying and picked ----
 const fruit=new T.InstancedMesh(own(new T.IcosahedronGeometry(.18,1)),own(new T.MeshStandardMaterial({color:'#ffffff',roughness:.5,emissive:'#4a3510',emissiveIntensity:.35})),Math.max(1,fruitTotal));
 fruit.name='harvest-ripe-fruit';fruit.frustumCulled=false;group.add(fruit);
 type FruitState={spot:number;local:T.Matrix4;mode:'hang'|'move'|'ground'|'gone';pos:P3;banana:boolean};
 const fruits:FruitState[]=[];
 spots.forEach((s,i)=>{if(s.action!=='shake')return;const n=s.fruit??3,banana=s.canopy==='banana';
  for(let k=0;k<n;k++){let local:T.Matrix4;
   if(banana)local=mat4(-.3,-.3+k*.14,(k-1)*.16,.75,1.7,.75,0,0,.5);
   // Half out of the canopy's surface on its sunny south / camera side (+z), so ripe fruit reads from the follow camera above.
   else{const cn=s.canopy as {y:number;r:number;sy:number},a=Math.PI/2+(k-1)*1.05+(i%2?.3:-.2),dy=[-.35,.15,-.1][k%3];local=mat4(Math.cos(a)*cn.r*.98,cn.y-TRUNK_TOP+dy*cn.r*cn.sy,Math.sin(a)*cn.r*.98,1.2,1.2,1.2);}
   const f={spot:i,local,mode:'hang' as const,pos:{x:s.x,y:0,z:s.z},banana};fruits[slots[i]+k]=f;fruit.setColorAt(slots[i]+k,c.set(color(s.good)));}});
 const fruitMatrix=(slot:number)=>{const f=fruits[slot];if(f.mode==='hang')return treeMatrix(f.spot).multiply(f.local);if(f.mode==='gone')return hidden;
  return mat4(f.pos.x,f.pos.y,f.pos.z,f.banana?.75:1,f.banana?1.7:1,f.banana?.75:1,0,0,f.banana&&f.mode==='ground'?1.45:0);};
 const paintFruit=(slot:number)=>{fruit.setMatrixAt(slot,fruitMatrix(slot));fruit.instanceMatrix.needsUpdate=true;};
 const hangingWorld=(slot:number)=>{const v=V(0,0,0).applyMatrix4(fruitMatrix(slot));return {x:v.x,y:v.y,z:v.z};};
 for(let i=0;i<fruitTotal;i++)paintFruit(i);
 // ---- Veg: a body per veg spot (root under the soil, tomato/pepper on the plant, greens clump) and a leafy top per root ----
 const bodies=new T.InstancedMesh(own(new T.IcosahedronGeometry(.16,1)),own(new T.MeshStandardMaterial({color:'#ffffff',roughness:.6})),spots.length);
 bodies.name='harvest-veg';bodies.frustumCulled=false;group.add(bodies);
 const tops=new T.InstancedMesh(own(new T.ConeGeometry(.3,.7,5)),own(new T.MeshStandardMaterial({color:'#6fb84f',roughness:.7})),spots.length);
 tops.name='harvest-veg-tops';tops.frustumCulled=false;group.add(tops);
 type VegState={pos:P3;scale:[number,number,number];rz:number;top:number;topRz:number;shown:boolean;topShown:boolean};
 const veg:VegState[]=spots.map(s=>{const y=floor(s.x,s.z);
  if(s.action==='pull')return {pos:{x:s.x,y:y-.3,z:s.z},scale:[1.5,.95,1.05],rz:0,top:1,topRz:0,shown:false,topShown:true};
  if(s.action==='twist'){const pepper=s.good==='pepper';return {pos:{x:s.x+.06,y:y+(pepper?.42:.62),z:s.z+(pepper?.34:.4)},scale:pepper?[.75,1.35,.75]:[.95,.9,.95],rz:0,top:0,topRz:0,shown:true,topShown:false};}
  if(s.action==='cut')return {pos:{x:s.x,y:y+.2,z:s.z},scale:[2.7,1.3,2.7],rz:0,top:0,topRz:0,shown:true,topShown:false};
  return {pos:{x:s.x,y,z:s.z},scale:[1,1,1],rz:0,top:0,topRz:0,shown:false,topShown:false};});
 spots.forEach((s,i)=>{bodies.setColorAt(i,c.set(s.action==='cut'?'#6fae4f':s.ripe===false?'#7fae4f':color(s.good)));});
 const paintVeg=(i:number)=>{const v=veg[i],s=spots[i];bodies.setMatrixAt(i,v.shown?mat4(v.pos.x,v.pos.y,v.pos.z,...v.scale,0,0,v.rz):hidden);
  tops.setMatrixAt(i,v.topShown?mat4(s.x,floor(s.x,s.z)+.26*v.top,s.z,1,v.top,1,0,0,v.topRz):hidden);bodies.instanceMatrix.needsUpdate=true;tops.instanceMatrix.needsUpdate=true;};
 spots.forEach((_,i)=>paintVeg(i));
 const toHand=(from:P3,p:P3,set:(x:number,y:number,z:number)=>void,end:()=>void,reduced:boolean)=>{if(reduced){end();return;}fx.arc((x,y,z)=>set(x,y,z),from,{x:p.x,y:p.y+1.1,z:p.z},.5,.3,end);};

 function onEvent(e:JobEvent,run:JobRun,p:P3,reduced:boolean){
  const h=run.harvest;if(!h)return;const i=e.index??-1;
  switch(e.type){
   case 'shake':{const s=spots[i],w=tilt[i],away=Math.atan2(s.z-p.z,s.x-p.x);w.ax=-Math.sin(away);w.az=Math.cos(away);w.amp=reduced?0:Math.min(.13,(w.t<1.6?w.amp*Math.exp(-3.2*w.t):0)+.06);w.t=0;
    if(!reduced)fx.burst(s.x,floor(s.x,s.z)+(s.canopy==='banana'?1.9:2.3),s.z,s.canopy==='banana'?'#7a9e67':'#6f9a55',2,1.2,.6,true,1.4);cue('rustle');break;}
   case 'miss':{const s=spots[i];if(!reduced)fx.burst(s.x,floor(s.x,s.z)+2.2,s.z,'#6f9a55',5,1.6,.5,true,1.4);cue('rustle');break;}
   case 'drop':{const f=fruits[i],g=h.ground.find(q=>q.slot===i);if(!f||!g)break;const from=hangingWorld(i),gy=floor(g.x,g.z)+(f.banana?.1:.17);f.mode='move';
    const land=()=>{f.mode='ground';f.pos={x:g.x,y:gy,z:g.z};paintFruit(i);};
    if(reduced){land();cue('thud');break;}
    fx.tween(.5,k=>{const q=k*k;f.pos={x:from.x+(g.x-from.x)*k,y:from.y+(gy-from.y)*q,z:from.z+(g.z-from.z)*k};paintFruit(i);},()=>{cue('thud');
     fx.tween(.26,k=>{f.pos={x:g.x,y:gy+Math.sin(k*Math.PI)*.2,z:g.z};paintFruit(i);},land);});break;}
   case 'gather':{if(e.value===0){const f=fruits[i];if(!f)break;f.mode='move';const from={...f.pos};toHand(from,p,(x,y,z)=>{f.pos={x,y,z};paintFruit(i);},()=>{f.mode='gone';paintFruit(i);},reduced);}
    else{const v=veg[i];const from={...v.pos};toHand(from,p,(x,y,z)=>{v.pos={x,y,z};paintVeg(i);},()=>{v.shown=false;paintVeg(i);},reduced);}
    cue('pick');break;}
   case 'clear':{if(e.value===0){const f=fruits[i];if(f){f.mode='gone';paintFruit(i);}}else{veg[i].shown=false;paintVeg(i);}break;}
   case 'tug':cue('tug');break;
   case 'pop':{const s=spots[i],v=veg[i],g=h.ground.find(q=>q.slot===i&&q.kind==='veg');if(!g)break;const y0=floor(s.x,s.z),gy=floor(g.x,g.z)+.12;
    v.shown=true;v.topShown=false;v.top=1;v.topRz=0;v.rz=.5;cue('pop');
    if(!reduced){fx.burst(s.x,y0+.1,s.z,'#8b6a4a',10,1.6,2.6,false,1.1);fx.burst(s.x,y0+.3,s.z,'#5f9a4a',4,1.2,1.6,true,1.5);
     fx.arc((x,y,z,k)=>{v.pos={x,y,z};v.rz=.5+k*4;paintVeg(i);},{x:s.x,y:y0+.05,z:s.z},{x:g.x,y:gy,z:g.z},.9,.6,()=>{v.pos={x:g.x,y:gy,z:g.z};v.rz=1.4;paintVeg(i);cue('thud');});}
    else{v.pos={x:g.x,y:gy,z:g.z};v.rz=1.4;paintVeg(i);}break;}
   case 'snap':{const v=veg[i],from=v.top;cue('spring');if(reduced){v.top=1;v.topRz=0;v.pos.y=floor(spots[i].x,spots[i].z)-.3;v.shown=false;paintVeg(i);break;}
    fx.tween(.45,k=>{v.top=1+(from-1)*(1-k)+wobble(k,2)*.25;v.topRz=wobble(k,3)*.3;v.pos.y=floor(spots[i].x,spots[i].z)-.3;v.shown=false;paintVeg(i);});break;}
   case 'twist':{const v=veg[i],from={...v.pos};cue('twist');
    if(reduced){v.shown=false;paintVeg(i);break;}
    fx.tween(.22,k=>{v.rz=wobble(k,2)*.6;paintVeg(i);},()=>fx.arc((x,y,z)=>{v.pos={x,y,z};paintVeg(i);},from,{x:p.x,y:p.y+1.1,z:p.z},.6,.35,()=>{v.shown=false;paintVeg(i);}));break;}
   case 'unripe':{const v=veg[i];cue('nope');if(!reduced)fx.tween(.4,k=>{v.rz=wobble(k,3)*.35;paintVeg(i);});break;}
   case 'snip':{const s=spots[i];cue('snip');if(!reduced)fx.burst(s.x,floor(s.x,s.z)+.35,s.z,'#6fae4f',3,1,1.4,true,1.3);break;}
   case 'cut':{const s=spots[i],v=veg[i];cue('cut');if(!reduced)fx.burst(s.x,floor(s.x,s.z)+.35,s.z,'#6fae4f',12,1.8,2.6,true,1.5);
    const sc=[...v.scale] as [number,number,number];if(reduced){v.shown=false;paintVeg(i);break;}
    fx.tween(.22,k=>{const q=1-ease.out(k)*.8;v.scale=[sc[0]*q,sc[1]*q,sc[2]*q];paintVeg(i);},()=>{v.shown=false;paintVeg(i);});break;}
  }
 }
 /** Per frame while the job runs: sway trees that were shaken, stretch the leafy top being pulled. Idle = two cheap checks. */
 function update(dt:number,run:JobRun,reduced:boolean){
  let swaying=false;
  canopyTrees.forEach(({i},k)=>{const w=tilt[i];if(w.t>=1.6)return;w.t+=dt;swaying=true;paintShell(k);});
  spots.forEach((s,i)=>{if(s.action==='shake'&&s.canopy==='banana'&&tilt[i].t<1.6){tilt[i].t+=dt;swaying=true;}});
  if(swaying){shells.instanceMatrix.needsUpdate=true;for(let j=0;j<fruitTotal;j++)if(fruits[j].mode==='hang'&&tilt[fruits[j].spot].t<1.7)fruit.setMatrixAt(j,fruitMatrix(j));fruit.instanceMatrix.needsUpdate=true;}
  const h=run.harvest;
  if(h&&h.pulling>=0){const i=h.pulling,v=veg[i],k=h.pull/HARVEST.pullMax;v.top=1+k*.8;v.topRz=reduced?0:Math.sin(run.seconds*34)*.1*k;v.shown=true;v.pos.y=floor(spots[i].x,spots[i].z)-.3+k*.2;paintVeg(i);}
 }
 return {onEvent,update};
}
