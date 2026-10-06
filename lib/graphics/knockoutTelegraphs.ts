import * as T from 'three';
import {AIM_LOCK} from '../games/rooftopKnockout';

type Bot={id:number;x:number;z:number;alive:boolean;windup:number;windupTotal:number;aimYaw:number;target:number};
type Hit={x:number;z:number;time:number;ko:boolean};
/** Oct 4 2026 polish (A6): readable threats and impacts in three small pooled meshes (draw calls only while visible).
 *  - Wind-up arrows: a ground arrow grows from each bot that is about to kick, amber while it still tracks, red once
 *    the aim locks. That is the "tell" a child reads and sidesteps.
 *  - Danger ring: a red ring under the user while a bot is winding up at them or a shot is on course.
 *  - Shock rings: one expanding ring per recent impact (bigger and gold for a knockout).
 *  No per-frame allocation; reduced motion keeps the shapes but drops the pulse. */
export const SHOCK_LIFE=.36,KO_SHOCK_LIFE=.55;
export function createKnockoutTelegraphs(parent:T.Group,maxBots=6,maxHits=8){
 // Arrow along +z from 0 to 1: a soft-tailed shaft and a head, with alpha fading toward the bot.
 const shape=new T.Shape();shape.moveTo(-.16,0);shape.lineTo(.16,0);shape.lineTo(.16,.72);shape.lineTo(.42,.72);shape.lineTo(0,1);shape.lineTo(-.42,.72);shape.lineTo(-.16,.72);shape.closePath();
 const arrowGeometry=new T.ShapeGeometry(shape);arrowGeometry.rotateX(Math.PI/2);
 {const p=arrowGeometry.attributes.position,colors=new Float32Array(p.count*4);for(let i=0;i<p.count;i++){const along=p.getZ(i);colors[i*4]=colors[i*4+1]=colors[i*4+2]=1;colors[i*4+3]=.4+.6*Math.min(1,along/.7);}arrowGeometry.setAttribute('color',new T.BufferAttribute(colors,4));}
 const arrowMaterial=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const arrows=new T.InstancedMesh(arrowGeometry,arrowMaterial,maxBots);arrows.name='knockout-windup-arrows';
 arrows.instanceColor=new T.InstancedBufferAttribute(new Float32Array(maxBots*3),3);
 const ringGeometry=new T.RingGeometry(.72,.92,32);ringGeometry.rotateX(-Math.PI/2);
 const dangerMaterial=new T.MeshBasicMaterial({color:'#ff3b47',transparent:true,opacity:.8,depthWrite:false,toneMapped:false});
 const danger=new T.Mesh(ringGeometry,dangerMaterial);danger.name='knockout-danger-ring';
 const shockMaterial=new T.MeshBasicMaterial({transparent:true,opacity:.85,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending});
 const shocks=new T.InstancedMesh(ringGeometry,shockMaterial,maxHits);shocks.name='knockout-shock-rings';
 shocks.instanceColor=new T.InstancedBufferAttribute(new Float32Array(maxHits*3),3);
 for(const mesh of [arrows,shocks]){mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;}
 for(const mesh of [arrows,danger,shocks]){mesh.visible=false;mesh.renderOrder=2;parent.add(mesh);}
 const dummy=new T.Object3D(),color=new T.Color(),amber=new T.Color('#ffb547'),red=new T.Color('#ff3341'),white=new T.Color('#fff3c4'),gold=new T.Color('#ffd23f');
 return {
  update(bots:Bot[],hits:Hit[],time:number,threat:number,me:{x:number;z:number}|null,reduced:boolean){
   arrows.count=0;
   for(const b of bots){if(!b.alive||b.windup<=0||b.windupTotal<=0)continue;
    const charge=1-b.windup/b.windupTotal,locked=charge>=AIM_LOCK;
    dummy.position.set(b.x+Math.sin(b.aimYaw)*.55,.08,b.z+Math.cos(b.aimYaw)*.55);dummy.rotation.set(0,b.aimYaw,0);
    const grow=.35+.65*Math.min(1,charge/AIM_LOCK);dummy.scale.set(2.1,1,5.6*grow);dummy.updateMatrix();
    arrows.setMatrixAt(arrows.count,dummy.matrix);
    color.copy(locked?red:amber);if(!reduced&&locked)color.lerp(white,.35*Math.max(0,Math.sin(time*40)));arrows.setColorAt(arrows.count++,color);
   }
   arrows.visible=arrows.count>0;if(arrows.count){arrows.instanceMatrix.needsUpdate=true;arrows.instanceColor!.needsUpdate=true;}
   danger.visible=!!me&&threat>0;
   if(me&&threat>0){danger.position.set(me.x,.09,me.z);const pulse=reduced?1:1+.12*Math.sin(time*18);danger.scale.setScalar(pulse*(1.05-.15*threat));dangerMaterial.opacity=.45+.45*threat;}
   shocks.count=0;
   for(const h of hits){const life=h.ko?KO_SHOCK_LIFE:SHOCK_LIFE,age=time-h.time;if(age<0||age>=life)continue;const u=age/life;
    dummy.position.set(h.x,.1,h.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(reduced?(h.ko?1.6:1.1):(.5+u*(h.ko?2.6:1.6)));dummy.updateMatrix();
    shocks.setMatrixAt(shocks.count,dummy.matrix);color.copy(h.ko?gold:white).multiplyScalar(1-u);shocks.setColorAt(shocks.count++,color);}
   shocks.visible=shocks.count>0;if(shocks.count){shocks.instanceMatrix.needsUpdate=true;shocks.instanceColor!.needsUpdate=true;}
  },
  get visibleMeshes(){return [arrows,danger,shocks].filter(m=>m.visible).length;},
  dispose(){arrows.dispose();shocks.dispose();arrowGeometry.dispose();ringGeometry.dispose();arrowMaterial.dispose();dangerMaterial.dispose();shockMaterial.dispose();for(const m of [arrows,danger,shocks])m.removeFromParent();}
 };
}
