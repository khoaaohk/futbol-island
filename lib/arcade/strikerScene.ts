import * as T from 'three';
import {createArcadeStage,type ArcadePoseOptions} from './arcadeStage';
import type {StrikerMatch} from './strikerMatch';
import {matchPlayerDress} from '../town/beanLooks';
export function createStrikerScene(canvas:HTMLCanvasElement,match:StrikerMatch){
 const stage=createArcadeStage(canvas);stage.scenery.visible=false;const nets:{side:number;attribute:T.BufferAttribute;rest:Float32Array;dirty:boolean}[]=[];
 stage.box(0,-.09,0,52,.16,30,'#427f6c').castShadow=false;
 const grass=new T.PlaneGeometry(1,1),grassMaterials=['#478673','#4b8b75'].map(color=>new T.MeshStandardMaterial({color,roughness:1}));for(let i=0;i<10;i++){const patch=new T.Mesh(grass,grassMaterials[i%2]);patch.rotation.x=-Math.PI/2;patch.position.set(-22.5+i*5,.012,0);patch.scale.set(5,28,1);patch.receiveShadow=true;stage.scene.add(patch);}
 for(const z of [-14,14]){stage.box(0,.35,z,52,.7,.35,'#f1ce83');stage.box(0,.04,z,50,.025,.09,'#fff1d5');}
 for(const side of [-1,1]){for(const z of [-9.5,9.5])stage.box(side*25,.35,z,.35,.7,9,'#f1ce83');const goal=stage.goal(side*25,0,9.2);goal.rotation.y=-side*Math.PI/2;goal.scale.y=1.32;const net=goal.children.find(child=>child instanceof T.LineSegments) as T.LineSegments;const attribute=net.geometry.getAttribute('position') as T.BufferAttribute;nets.push({side,attribute,rest:new Float32Array(attribute.array),dirty:false});for(const z of [-5,5])stage.box(side*21,.04,z,8,.025,.09,'#fff1d5');stage.box(side*17,.04,0,.09,.025,10,'#fff1d5');}
 stage.box(0,.04,0,.08,.025,28,'#fff1d5');stage.ring(0,0,4,'#fff1d5');
 for(const side of [-1,1])for(let i=0;i<3;i++){stage.box(0,.35+i*.4,side*(16+i*1.1),56,.6,1,'#bd7e69');for(let n=0;n<20;n++){const color=['#e8bf65','#91c3bd','#b196c8'][n%3];stage.sphere(-24+n*2.5,.95+i*.4,side*(16+i*1.1),.24,color);}}
 const rigs=match.state.players.map(p=>stage.player(p.keeper?'#cf826c':p.team===0?'#f4c355':'#6099c0',matchPlayerDress('striker-'+p.id,p.team===0?'home':'away',p.keeper)));rigs.forEach(r=>r.root.scale.setScalar(stage.mobile?2.05:1.8));
 const poseOptions:ArcadePoseOptions[]=rigs.map(()=>({vx:0,vz:0,charge:0,slide:0,stun:0,celebrate:0,anticipate:0}));
 const savePoses=rigs.map(()=>({progress:1,dir:1 as -1|1,kind:'stand' as const,outcome:'parry' as const}));
 const warnings=match.state.players.map(()=>{const r=stage.ring(0,0,1.25,'#ed8b68');r.visible=false;return r;});
 const ball=stage.football(.36),ring=stage.ring(0,0,.85,'#ffe36e');ring.renderOrder=3;
 const aim=stage.box(0,.07,0,.13,.035,2.4,'#ffe36e');aim.castShadow=false;
 const trail=Array.from({length:8},()=>{const m=stage.sphere(0,0,0,.15,'#efc66d');m.castShadow=false;m.visible=false;return m;});let trailAge=0,cursor=0,lastEvent=0;
 const receiverRing=stage.ring(0,0,1.1,'#fff3d2'),passLine=stage.box(0,.045,0,.09,.02,1,'#fff3d2');passLine.castShadow=false;receiverRing.visible=passLine.visible=false;
 const ballShadow=new T.Mesh(new T.CircleGeometry(.4,20),new T.MeshBasicMaterial({color:'#193e37',transparent:true,opacity:.35,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;stage.scene.add(ballShadow);
 const axes={x:0,z:0};let portrait=false;
 function screenAxes(x:number,y:number){axes.x=portrait?-y:x;axes.z=portrait?x:y;return axes;}

 function fit(){const camera=stage.camera,w=canvas.clientWidth,h=canvas.clientHeight;stage.renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();portrait=camera.aspect<.85;
  const corner=new T.Vector3();let low=10,high=200;for(let i=0;i<24;i++){const d=(low+high)/2;camera.position.set(portrait?-d*.52:0,d,portrait?0:d*.52);camera.lookAt(0,0,0);camera.updateMatrixWorld();let fits=true;for(const x of [-28,28])for(const z of (stage.mobile?[-16.2,16.2]:[-18,18])){corner.set(x,2.5,z).project(camera);if(Math.abs(corner.x)>.94||Math.abs(corner.y)>.91)fits=false;}if(fits)high=d;else low=d;}
  camera.position.set(portrait?-high*.52:0,high,portrait?0:high*.52);camera.lookAt(0,0,0);camera.updateMatrixWorld();const distance=camera.position.length();camera.far=distance+150;
  // Landscape phones reserve the right-hand edge for the action buttons.
  if(stage.mobile&&!portrait)camera.setViewOffset(w,h,w*.075,0,w,h);
  camera.updateProjectionMatrix();const fog=stage.scene.fog as T.Fog;fog.near=distance+35;fog.far=distance+115;
 }
 function update(dt:number){const s=match.state;
  for(const p of s.players){const rig=rigs[p.id],warning=warnings[p.id],pose=poseOptions[p.id];warning.visible=p.windup>0&&s.goalPause<=0;warning.position.set(p.x,.07,p.z);warning.scale.setScalar(.7+Math.max(0,p.windup)/.26*.3);
   pose.keeper=p.keeper?1:0;pose.jockey=!p.keeper&&s.ball.owner!==p.id&&p.windup>0?.7:0;pose.actionKind=p.strikeKind==='pass'?'pass':'shot';pose.shotPower=p.strikePower;
   const save=savePoses[p.id];if(p.keeper&&p.strikeKind==='save'&&p.kick>.01){save.progress=.3+(1-p.kick)*.7;pose.dive=save;}else pose.dive=undefined;
   pose.dribbling=s.ball.owner===p.id;pose.vx=p.vx;pose.vz=p.vz;pose.charge=s.ball.owner===p.id?s.charge:0;pose.slide=p.tackle>0?Math.sin(Math.min(1,p.tackle/.28)*Math.PI)*.8:0;pose.stun=Math.min(1,p.stun/.5);pose.celebrate=s.goalPause>0&&p.team===s.ball.lastTeam?Math.sin((1.65-s.goalPause)/1.65*Math.PI):0;
   const near=Math.max(0,1-Math.hypot(s.ball.x-p.x,s.ball.z-p.z)/7);pose.anticipate=p.windup>0?.8:!s.goalPause&&s.ball.owner!==p.id?near*.55:0;
   const follow=p.strikeKind==='save'?0:p.kick*.8+Math.sin(p.kick*Math.PI)*.25,facing=p.keeper?Math.atan2(s.ball.x-p.x,s.ball.z-p.z):p.kick>0?p.strikeYaw:p.yaw;
   rig.root.position.set(p.x,0,p.z);rig.pose(dt,Math.hypot(p.vx,p.vz),facing,follow,stage.reduced?0:(pose.celebrate??0)*.12,p.vx*.035,pose);
  }
  let bx=s.ball.x,bz=s.ball.z,by=s.ball.y;if(s.ball.owner>=0){const owner=s.players[s.ball.owner],speed=Math.min(1,Math.hypot(owner.vx,owner.vz)/5),step=rigs[owner.id].motion.stride,touch=Math.sin(step*2)*.095*speed;bx+=Math.sin(owner.yaw)*touch;bz+=Math.cos(owner.yaw)*touch;by+=Math.max(0,Math.sin(step*2))*.065*speed;}ball.position.set(bx,Math.max(.36,by),bz);ball.rotation.set(s.ball.spin*.7,0,s.ball.spin);const p=s.players[s.selected];ring.position.set(p.x,.065,p.z);ring.scale.setScalar(1+s.charge*.35);aim.visible=s.charge>0&&s.ball.owner===s.selected;const aimX=27-p.x,aimZ=s.aim*4.5-p.z,aimLength=Math.hypot(aimX,aimZ);aim.position.set(p.x+aimX*.5,.07,p.z+aimZ*.5);aim.rotation.y=Math.atan2(aimX,aimZ);aim.scale.z=aimLength;aim.scale.x=.1+s.charge*.08;
  const receiver=s.passTarget>=0?s.players[s.passTarget]:null;receiverRing.visible=passLine.visible=!!receiver&&s.goalPause<=0;if(receiver){receiverRing.position.set(receiver.x,.06,receiver.z);const dx=receiver.x-p.x,dz=receiver.z-p.z;passLine.position.set((receiver.x+p.x)/2,.046,(receiver.z+p.z)/2);passLine.scale.z=Math.hypot(dx,dz);passLine.rotation.y=Math.atan2(dx,dz);}
  ballShadow.position.set(s.ball.x,.055,s.ball.z);ballShadow.scale.setScalar(1+s.ball.y*.16);(ballShadow.material as T.MeshBasicMaterial).opacity=.4/(1+s.ball.y*.35);
  if(dt>0){trailAge+=dt;if(trailAge>.035){trailAge=0;const dot=trail[cursor++%trail.length];dot.position.copy(ball.position);dot.scale.setScalar(s.ball.owner<0&&Math.hypot(s.ball.vx,s.ball.vz)>12&&!stage.reduced?.14:0);dot.visible=true;}for(const dot of trail)dot.scale.multiplyScalar(Math.exp(-dt*4));}
  if(s.event!==lastEvent){lastEvent=s.event;if(['shot','goal','hit','post','save'].includes(s.eventKind))stage.burst(s.eventX,.6,s.eventZ,s.eventKind==='goal'?2:1);}
  for(const net of nets){const active=s.goalPause>0&&Math.sign(s.eventX)===net.side&&!stage.reduced;if(!active&&!net.dirty)continue;const t=1.65-s.goalPause,amount=active?Math.sin(t*14)*Math.exp(-t*3.8)*.45:0;for(let i=0;i<net.rest.length;i+=3){const x=net.rest[i],y=net.rest[i+1],z=net.rest[i+2],falloff=Math.exp(-((x-s.eventZ*net.side)**2+(y-.8)**2)*.45);net.attribute.setZ(i/3,z+(z<-.1?-amount*falloff:0));}net.attribute.needsUpdate=true;net.dirty=active;}
  const zoom=stage.reduced||s.goalPause<=0?1:1+Math.sin((1.65-s.goalPause)/1.65*Math.PI)*.018;if(Math.abs(stage.camera.zoom-zoom)>.0001){stage.camera.zoom=zoom;stage.camera.updateProjectionMatrix();}
  stage.effects(dt);stage.lighting(s.time);
  // Portrait play attacks upward; controls are transformed into this view.
 }
 fit();update(0);return{stage,fit,update,screenAxes,rigs,get portrait(){return portrait;}};
}
