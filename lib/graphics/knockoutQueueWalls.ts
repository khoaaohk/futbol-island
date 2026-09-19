import * as T from 'three';
import {ARENA_QUEUES} from '../games/rooftopKnockout';
import {OUT_TELEPORT} from '../games/knockoutAnimation';

type WaitingPlayer={id:number;alive:boolean;outAge:number;queue:number};
/** Occupied corner pens share one static wall batch and one small rising-spark pool. */
export function createKnockoutQueueWalls(parent:T.Group){
 const root=new T.Group();root.name='knockout-queue-energy';root.visible=false;parent.add(root);
 const geometry=new T.PlaneGeometry(1,1,1,8),position=geometry.attributes.position;
 const colors=new Float32Array(position.count*4),red=new T.Color('#ff4e58');
 for(let i=0;i<position.count;i++){const height=position.getY(i)+.5;colors[i*4]=red.r;colors[i*4+1]=red.g;colors[i*4+2]=red.b;colors[i*4+3]=.34*(1-height)**2;}
 geometry.setAttribute('color',new T.BufferAttribute(colors,4));
 const material=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});material.forceSinglePass=true;
 const walls=new T.InstancedMesh(geometry,material,ARENA_QUEUES.length*4);walls.name='knockout-red-queue-walls';walls.instanceMatrix.setUsage(T.DynamicDrawUsage);walls.frustumCulled=false;walls.count=0;root.add(walls);
 const sparkGeometry=new T.OctahedronGeometry(1,0),sparkMaterial=new T.MeshBasicMaterial({color:'#ff797c',transparent:true,opacity:.8,depthWrite:false,toneMapped:false});
 const sparks=new T.InstancedMesh(sparkGeometry,sparkMaterial,ARENA_QUEUES.length*12);sparks.name='knockout-red-queue-particles';sparks.instanceMatrix.setUsage(T.DynamicDrawUsage);sparks.frustumCulled=false;sparks.count=0;sparks.visible=false;root.add(sparks);
 const dummy=new T.Object3D();let previousMask=-1,previousOccupied=0,elapsed=0,credit=0,lastReduced=false;
 return {root,update(dt:number,players:WaitingPlayer[],joined:boolean,reduced:boolean){
  if(dt<=0)return;
  let occupied=0;
  for(const p of players)if(!p.alive&&p.outAge>=OUT_TELEPORT&&p.queue>=0&&(p.id!==0||joined))occupied|=1<<p.queue;
  const mask=(1<<ARENA_QUEUES.length)-1;
  const changed=occupied!==previousOccupied||reduced!==lastReduced;previousOccupied=occupied;
  if(mask!==previousMask){
   walls.count=0;
   for(let i=0;i<ARENA_QUEUES.length;i++)if(mask&(1<<i)){
    const q=ARENA_QUEUES[i];
    for(let side=0;side<4;side++){
     const alongX=side<2,sign=side%2?-1:1;
     dummy.position.set(q.x+(alongX?0:sign*q.w/2),2.45,q.z+(alongX?sign*q.d/2:0));
     dummy.rotation.set(0,alongX?0:Math.PI/2,0);dummy.scale.set(alongX?q.w:q.d,4.8,1);dummy.updateMatrix();walls.setMatrixAt(walls.count++,dummy.matrix);
    }
   }
   if(walls.count)walls.instanceMatrix.needsUpdate=true;
   root.visible=mask!==0;previousMask=mask;
  }
  lastReduced=reduced;
  if(!occupied||reduced){if(sparks.visible){sparks.visible=false;sparks.count=0;}credit=0;return;}
  elapsed+=dt;credit+=dt;if(!changed&&credit<1/20)return;credit%=1/20;
  sparks.count=0;dummy.rotation.set(0,0,0);
  for(let i=0;i<ARENA_QUEUES.length;i++)if(occupied&(1<<i)){
   const q=ARENA_QUEUES[i];
   for(let j=0;j<12;j++){
    const phase=(elapsed*.34+j/12+i*.17)%1,side=j%4,alongX=side<2,sign=side%2?-1:1,offset=((j*.618+i*.27)%1)-.5;
    dummy.position.set(q.x+(alongX?offset*q.w:sign*q.w/2),.12+phase*4.6,q.z+(alongX?sign*q.d/2:offset*q.d));
    const size=.065*Math.sin(phase*Math.PI);dummy.scale.set(size,size*(1.3+phase),size);dummy.updateMatrix();sparks.setMatrixAt(sparks.count++,dummy.matrix);
   }
  }
  sparks.visible=true;sparks.instanceMatrix.needsUpdate=true;
 },dispose(){walls.dispose();sparks.dispose();geometry.dispose();material.dispose();sparkGeometry.dispose();sparkMaterial.dispose();root.removeFromParent();}};
}
