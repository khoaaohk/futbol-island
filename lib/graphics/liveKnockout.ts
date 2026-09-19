import {recordExploreActivity} from '../town/exploreActivity';
import * as T from 'three';
import {knockoutPose,OUT_TELEPORT,OUT_ARRIVAL,SHIELD_DURATION} from '../games/knockoutAnimation';
import {createPlayer} from './player';
import {createKnockoutGrounding} from './knockoutGrounding';
import {createKnockoutCountdown} from './knockoutCountdown';
import {createKnockoutQueueWalls} from './knockoutQueueWalls';
import {playerBatch} from './playerBatch';
import {createKnockoutBallTrails} from './knockoutBallTrails';
import {createKnockoutHitEffects} from './knockoutHitEffects';
import {createKnockout,KNOCKOUT_ROOF as roof,ARENA_QUEUES} from '../games/rooftopKnockout';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
export function createLiveKnockout(scene:T.Scene){
 const root=new T.Group();root.name='live-rooftop-knockout';root.position.set(roof.x,roof.height,roof.z);scene.add(root);
 // Source rigs stay detached: their matrices are local to the translated arena.
 const batchScene=new T.Scene();batchScene.name='knockout-player-batches';root.add(batchScene);const batch=playerBatch(batchScene,256);
 const viewProjection=new T.Matrix4(),frustum=new T.Frustum();
 // Includes players, cage-height effects and a generous allowance for cast shadows.
 const visibilitySphere=new T.Sphere(new T.Vector3(roof.x,roof.height+3,roof.z),42);
 const rigs=Array.from({length:6},(_,i)=>{const r=createPlayer('roof-player-'+i,i%2?'home':'away',false);r.setAppearance({...DEFAULT_CUSTOMIZATION,character:i%2?'female':'male',clothing:i%2?'coast':'sunset',face:i%3?'light':'deep'});return r;});
 const geo=new T.SphereGeometry(.25,10,8),mat=new T.MeshStandardMaterial({color:'#fff5db'}),balls=new T.InstancedMesh(geo,mat,32),dummy=new T.Object3D();balls.instanceMatrix.setUsage(T.DynamicDrawUsage);balls.frustumCulled=false;root.add(balls);
 const counter=createKnockoutCountdown(root);
 const queueWalls=createKnockoutQueueWalls(root);
 const ringGeo=new T.TorusGeometry(1,.08,6,32),ringMat=new T.MeshBasicMaterial({color:'#baffd9',transparent:true,opacity:.85,depthWrite:false});
 const rings=Array.from({length:7},()=>{const ring=new T.Mesh(ringGeo,ringMat);ring.rotation.x=Math.PI/2;root.add(ring);return ring;});
 const shieldGeo=new T.SphereGeometry(1,16,12),shieldMat=new T.MeshBasicMaterial({color:'#309aff',transparent:true,opacity:.3,depthWrite:false});
 const shields=new T.InstancedMesh(shieldGeo,shieldMat,7);shields.instanceMatrix.setUsage(T.DynamicDrawUsage);shields.frustumCulled=false;root.add(shields);
 const groundKnockout=createKnockoutGrounding();
 const poseFloor=new T.Vector3();
 function applyPose(object:T.Object3D,p:ReturnType<typeof createKnockout>['state']['players'][number],reduced:boolean){const pose=knockoutPose(p,reduced),grounded=p.hitFlash>0||(!p.alive&&p.outAge<OUT_TELEPORT+OUT_ARRIVAL);if(grounded)object.getWorldPosition(poseFloor);const floorY=poseFloor.y;object.rotation.z+=pose.roll;object.rotation.y+=pose.turn;object.position.y+=pose.lift;object.scale.multiplyScalar(Math.max(.001,pose.scale));object.scale.y*=1+pose.stretch*1.5;object.scale.x*=1-pose.stretch*.65;groundKnockout(object,grounded,floorY);}
 const hitEffects=createKnockoutHitEffects(root);
 const ballTrails=createKnockoutBallTrails(root);
 let reducedMotion=false;
 let game=createKnockout(),joined=false,resetAge=0,pendingSpawn=false,countdown=3,arrival=0;
 const restart=()=>{ballTrails.reset();game=createKnockout();if(!joined){game.state.players[0].alive=false;game.state.remaining=6;}countdown=3;arrival=0;resetAge=0;};restart();
 const queuePoint=(id:number)=>{const p=game.state.players[id],q=ARENA_QUEUES[Math.max(0,p.queue)];return{x:roof.x+q.x,z:roof.z+q.z-1.2+p.queueSlot*1.1,y:roof.height};};
 return {root,get state(){return game.state;},get joined(){return joined;},get hasBall(){return joined&&game.state.balls.some(b=>b.heldBy===0);},get waiting(){return joined&&!game.state.players[0].alive;},get countdown(){return countdown>0?String(Math.ceil(countdown)):game.state.time<.8?'Go!':'';},get frozen(){return joined&&(!game.state.players[0].alive||game.state.players[0].hitFlash>0||countdown>0);},get kickPose(){return game.state.players[0].kick>0?1-game.state.players[0].kick/.28:0;},
  kick(yaw:number){if(!joined)return false;game.state.players[0].yaw=yaw;return game.kick(0);},
  playerPosition(){if(pendingSpawn){pendingSpawn=false;return{x:roof.x,z:roof.z+16,y:roof.height};}const me=game.state.players[0];return joined&&!me.alive?(me.outAge>=OUT_TELEPORT?queuePoint(0):{x:roof.x+me.x,z:roof.z+me.z,y:roof.height}):null;},
  update(dt:number,position:{x:number;z:number},height:number,onFoot:boolean,camera:T.Camera,enabled:boolean,reduced:boolean,facing=0){
   reducedMotion=reduced;
   viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);
   root.visible=enabled&&(joined||(Math.hypot(camera.position.x-roof.x,camera.position.z-roof.z)<120&&frustum.intersectsSphere(visibilitySphere)));
   if(!root.visible)return;
   const onRoof=onFoot&&height>=roof.height-.6&&height<roof.height+6&&Math.abs(position.x-roof.x)<14&&Math.abs(position.z-roof.z)<25.3;
   const enter=onRoof&&Math.abs(position.x-roof.x)<11.6&&Math.abs(position.z-roof.z)<21.6;
   if(!joined&&enter){joined=true;restart();}else if(joined&&!onRoof){joined=false;restart();}
   const me=game.state.players[0];if(joined&&me.alive){me.x=position.x-roof.x;me.z=position.z-roof.z;me.yaw=facing;}
   const previousPhase=game.state.phase;arrival+=dt;if(countdown>0){countdown=Math.max(0,countdown-dt);if(countdown===0)game.start();}else game.update(dt,{x:0,z:0});
   if(joined&&previousPhase!=='won'&&game.state.phase==='won')recordExploreActivity('knockoutWins');
   if(game.state.phase==='won'||game.state.phase==='lost'){resetAge+=dt;if(resetAge>4){restart();if(joined)pendingSpawn=true;}}
   counter.update(countdown,game.state.time,reduced);queueWalls.update(dt,game.state.players,joined,reduced);
   for(let i=0;i<rings.length;i++){const p=game.state.players[i],ring=rings[i],a=p.alive?arrival:p.outAge;ring.visible=(i!==0||joined)&&(p.alive?a<.7:a<OUT_TELEPORT+OUT_ARRIVAL);if(ring.visible){const queued=!p.alive&&a>=OUT_TELEPORT,q=ARENA_QUEUES[Math.max(0,p.queue)];ring.position.set(queued?q.x:p.x,.15+Math.sin(Math.min(1,a)*Math.PI)*2,queued?q.z-1.2+p.queueSlot*1.1:p.z);ring.scale.setScalar(.7+Math.sin(a*8)**2*.8);}}
   batch.begin();
   for(let i=0;i<rigs.length;i++){const p=game.state.players[i+1],r=rigs[i],queued=!p.alive&&p.outAge>=OUT_TELEPORT,q=ARENA_QUEUES[Math.max(0,p.queue)];r.update(queued?q.x:p.x,queued?q.z-1.2+p.queueSlot*1.1:p.z,p.alive&&p.hitFlash<=0?dt:0,game.state.time,reduced,{facing:queued?(q.z<0?0:Math.PI):p.yaw,dribbling:game.state.balls.some(b=>b.heldBy===p.id),kick:p.kick>0?1-p.kick/.28:0});r.root.rotation.z=0;r.root.scale.setScalar(p.alive?Math.min(1,arrival*2):1);applyPose(r.root,p,reduced);batch.draw(r.root);}
   batch.end();
   // Shared match batches disable frustum culling; restore it for this compact arena.
   // Three tests these same bounds independently against the view and shadow cameras.
   for(const object of batchScene.children){const mesh=object as T.InstancedMesh;if(!mesh.visible)continue;mesh.frustumCulled=true;mesh.computeBoundingSphere();}

   hitEffects.update(game.state.players,game.state.time,joined,camera,reduced);
   shields.count=0;
   for(const p of game.state.players)if(p.alive&&p.shield>0&&(p.id!==0||joined)){dummy.position.set(p.x,1,p.z);const age=SHIELD_DURATION-p.shield,pulse=Math.min(1,age/.18)*(1+Math.sin(age*9)*.06)*Math.min(1,p.shield/.25);dummy.scale.set(1.05*pulse,1.25*pulse,1.05*pulse);dummy.updateMatrix();shields.setMatrixAt(shields.count++,dummy.matrix);}
   shields.visible=shields.count>0;if(shields.count)shields.instanceMatrix.needsUpdate=true;dummy.scale.setScalar(1);
   ballTrails.update(dt,game.state.balls,reduced);
   balls.count=game.state.balls.length;game.state.balls.forEach((b,i)=>{dummy.position.set(b.x,.4,b.z);dummy.updateMatrix();balls.setMatrixAt(i,dummy.matrix);});if(balls.count)balls.instanceMatrix.needsUpdate=true;
  },
  posePlayer(object:T.Object3D){if(!joined)return;applyPose(object,game.state.players[0],reducedMotion);if(game.state.players[0].alive)object.scale.multiplyScalar(Math.min(1,arrival*2));},
  dispose(){batch.dispose();ballTrails.dispose();hitEffects.dispose();shields.dispose();shieldGeo.dispose();shieldMat.dispose();counter.dispose();queueWalls.dispose();ringGeo.dispose();ringMat.dispose();rigs.forEach(r=>r.dispose());balls.dispose();geo.dispose();mat.dispose();root.removeFromParent();}
 };
}
