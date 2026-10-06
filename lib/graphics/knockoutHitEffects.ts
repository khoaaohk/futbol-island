import * as T from 'three';
import {OUT_TELEPORT,OUT_ARRIVAL,OUT_DISSOLVE,SHIELD_DURATION,knockoutPose} from '../games/knockoutAnimation';
import {ARENA_QUEUES,createKnockout} from '../games/rooftopKnockout';
/** Impact bursts (Oct 4 2026, A6): up to BURST_CAP extra sparks from the sim's fixed hit log, no new draw call. */
const BURST_SPARKS=10,BURST_CAP=40;
/** Fixed, event-only pools; no emitters, timers, or independent render loop. */
export function createKnockoutHitEffects(root:T.Group){
 const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.4:1;i?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();
 const starGeo=new T.ShapeGeometry(shape),starMat=new T.MeshBasicMaterial({color:'#ffe578',side:T.DoubleSide,depthWrite:false});
 const sparkGeo=new T.OctahedronGeometry(1,0),sparkMat=new T.MeshBasicMaterial({color:'#80d9ff',depthWrite:false});
 const stars=new T.InstancedMesh(starGeo,starMat,21),sparks=new T.InstancedMesh(sparkGeo,sparkMat,112+BURST_CAP),dummy=new T.Object3D();
 stars.name='knockout-daze-stars';sparks.name='knockout-hit-particles';
 for(const mesh of [stars,sparks]){mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.visible=false;root.add(mesh);}
 return {update(players:ReturnType<typeof createKnockout>['state']['players'],time:number,joined:boolean,camera:T.Camera,reduced:boolean,hits?:ReturnType<typeof createKnockout>['state']['hitLog']){
  stars.count=sparks.count=0;
  // Impact burst: sparks fly out from the hit and drop (smaller, slower and fewer with reduced motion).
  if(hits)for(const h of hits){const age=time-h.time,life=h.ko?.5:.32;if(age<0||age>=life)continue;const u=age/life,n=reduced?4:BURST_SPARKS;
   for(let i=0;i<n&&sparks.count<BURST_CAP;i++){const a=i*2.399+h.time*7,r=.3+u*(h.ko?2.2:1.4)*(reduced?.4:1);dummy.position.set(h.x+Math.cos(a)*r,.9+Math.sin(i*1.7)*.35+u*(1-u)*2.2-u*u*.8,h.z+Math.sin(a)*r);dummy.quaternion.identity();dummy.scale.setScalar((h.ko?.13:.09)*(1-u));dummy.updateMatrix();sparks.setMatrixAt(sparks.count++,dummy.matrix);}}
  for(const p of players){if(p.id===0&&!joined)continue;const pose=knockoutPose(p,reduced);
   if(pose.daze){for(let i=0;i<3;i++){const a=time*(reduced?0:4)+i*Math.PI*2/3;dummy.position.set(p.x+Math.cos(a)*.5,pose.roll>1?.75:2.1+Math.sin(a*2)*.08,p.z+Math.sin(a)*.5);dummy.quaternion.copy(camera.quaternion);dummy.scale.setScalar(.13);dummy.updateMatrix();stars.setMatrixAt(stars.count++,dummy.matrix);}}
   const teleport=!p.alive&&p.outAge>OUT_DISSOLVE-.2&&p.outAge<OUT_TELEPORT+OUT_ARRIVAL,shield=p.alive&&p.shield>0;
   if(!teleport&&!shield)continue;
   const q=ARENA_QUEUES[Math.max(0,p.queue)],x=pose.queued?q.x:p.x,z=pose.queued?q.z-1.2+p.queueSlot*1.1:p.z;
   const age=teleport?(pose.queued?p.outAge-OUT_TELEPORT:p.outAge-(OUT_DISSOLVE-.2)):SHIELD_DURATION-p.shield;
   const count=reduced?6:16;
   for(let i=0;i<count;i++){const phase=(age*(teleport?1.5:.65)+i/count)%1,a=i*2.399+age*(reduced?0:2),r=teleport?.25+(1-phase)*.7:Math.sqrt(Math.max(0,1-(phase*2-1)**2))*1.08;
    dummy.position.set(x+Math.cos(a)*r,.15+phase*(teleport?2.8:2.3),z+Math.sin(a)*r);dummy.quaternion.identity();dummy.scale.setScalar((teleport?.1:.055)*Math.sin(phase*Math.PI));dummy.updateMatrix();sparks.setMatrixAt(sparks.count++,dummy.matrix);
   }
  }
  for(const mesh of [stars,sparks]){mesh.visible=mesh.count>0;if(mesh.count)mesh.instanceMatrix.needsUpdate=true;}
 },dispose(){stars.dispose();sparks.dispose();starGeo.dispose();starMat.dispose();sparkGeo.dispose();sparkMat.dispose();stars.removeFromParent();sparks.removeFromParent();}};
}
