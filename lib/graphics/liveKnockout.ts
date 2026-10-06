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
import {createKnockoutTelegraphs} from './knockoutTelegraphs';
import {createKnockout,KNOCKOUT_ROOF as roof,ARENA_QUEUES,MAX_LEVEL} from '../games/rooftopKnockout';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {sideGameDress} from '../town/beanLooks';
/** Oct 4 2026 polish (A6), controls: kick fires on press (not on release of the island's charged-shot hold) and is
 *  buffered for KICK_BUFFER s, so a press just before a ball reaches your feet or the cooldown ends still kicks.
 *  The second action button becomes a short dodge. Aim follows the stick (not the smoothed body turn) with a soft
 *  assist cone. Feel: a brief hit-stop on hits you are part of, knock-back, impact bursts and a knockout banner. */
export const KICK_BUFFER=.25,DODGE_BUFFER=.2,DODGE_FOLLOW=.22,DODGE_TIME=.18,DODGE_SPEED=9,DODGE_COOLDOWN=.9;
export const HIT_STOP={hit:.06,meHit:.09,ko:.12};
type Sound={ball(kind:'kick'|'bounce'|'receive'):void;impact():void;boost(direction?:'forward'|'up'):void;ui?(kind:string):void};
type Buttons={kick:boolean;juggle:boolean;charging?:boolean;shotPower?:number};
export function createLiveKnockout(scene:T.Scene){
 const root=new T.Group();root.name='live-rooftop-knockout';root.position.set(roof.x,roof.height,roof.z);scene.add(root);
 // Source rigs stay detached: their matrices are local to the translated arena.
 const batchScene=new T.Scene();batchScene.name='knockout-player-batches';root.add(batchScene);const batch=playerBatch(batchScene,256);
 const viewProjection=new T.Matrix4(),frustum=new T.Frustum();
 // Includes players, cage-height effects and a generous allowance for cast shadows.
 const visibilitySphere=new T.Sphere(new T.Vector3(roof.x,roof.height+3,roof.z),42);
 const rigs=Array.from({length:6},(_,i)=>{const r=createPlayer('roof-player-'+i,i%2?'home':'away',false);r.setAppearance({...DEFAULT_CUSTOMIZATION,character:i%2?'female':'male',clothing:i%2?'coast':'sunset',face:i%3?'light':'deep'});const dress=sideGameDress('roof-player-'+i,i%2?'home':'away');r.setBeanLook(dress.look,dress.outfit);return r;});
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
 const telegraphs=createKnockoutTelegraphs(root);
 const coarse=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(pointer: coarse)').matches;
 let reducedMotion=false;
 // Difficulty ramp across rounds: a win steps up, getting knocked out steps down (never below 0).
 let level=0,rounds=0;
 let game=createKnockout(),joined=false,resetAge=0,pendingSpawn=false,countdown=3,arrival=0;
 // Controls state (no allocation per frame).
 let dodgeFollow=0;const dodgePose={type:'bodyFeint' as const,progress:0,side:1 as -1|1};
 let kickBuffer=0,dodgeBuffer=0,dodgeTime=0,dodgeCooldown=0,dodgeX=0,dodgeZ=0,stickX=0,stickZ=0,stickAge=99,holdSeen=false,lastFacing=0;
 // Feedback state: hit-stop, event diffs, banner.
 let hitStop=0,banner='',bannerAge=99,threat=0;
 const seen={kicks:0,botKicks:0,hits:0,kos:0,meHit:0,meOut:0,myHits:0,myKos:0};
 const pending={kick:0,botKick:0,hit:0,meHit:0,meOut:0,myHit:0,myKo:0,dodge:0,won:0};
 const syncSeen=()=>{Object.assign(seen,game.state.events);};
 const restart=()=>{ballTrails.reset();game=createKnockout({level,seed:1+rounds++*7919});if(!joined){game.state.players[0].alive=false;game.state.remaining=6;}countdown=3;arrival=0;resetAge=0;kickBuffer=dodgeBuffer=dodgeTime=dodgeFollow=0;hitStop=0;bannerAge=99;syncSeen();};restart();
 const queuePoint=(id:number)=>{const p=game.state.players[id],q=ARENA_QUEUES[Math.max(0,p.queue)];return{x:roof.x+q.x,z:roof.z+q.z-1.2+p.queueSlot*1.1,y:roof.height};};
 const flash=(text:string)=>{banner=text;bannerAge=0;};
 const plural=(n:number,word:string)=>n+' '+word+(n===1?'':'s');
 return {root,get state(){return game.state;},get joined(){return joined;},get level(){return level;},get hasBall(){return joined&&game.state.balls.some(b=>b.heldBy===0);},get waiting(){return joined&&!game.state.players[0].alive;},get countdown(){return countdown>0?String(Math.ceil(countdown)):game.state.time<.8?'Go!':'';},get frozen(){return joined&&(!game.state.players[0].alive||game.state.players[0].hitFlash>0||countdown>0);},get kickPose(){return game.state.players[0].kick>0?1-game.state.players[0].kick/.28:0;},
  get dodging(){return dodgeTime>0;},
  /** Rig pose for the user's dodge (A7's bodyFeint: shoulder drop + sidestep); pass as the player's `skill` option. */
  get dodgeSkill(){if(dodgeTime<=0&&dodgeFollow<=0)return undefined;dodgePose.progress=Math.min(1,1-(dodgeTime+dodgeFollow)/(DODGE_TIME+DODGE_FOLLOW));return dodgePose;},get threat(){return threat;},
  /** Status line for the HUD: short, plural-safe, names the buttons, and flashes hits and knockouts. */
  get status(){
   if(countdown>0||game.state.time<.8&&game.state.phase==='playing')return this.countdown;
   const s=game.state,me=s.players[0];
   if(s.phase==='won')return 'You win! Last one standing · next round: level '+(level+1);
   if(s.phase!=='playing')return 'Round over · next round starting…';
   if(!me.alive)return bannerAge<1.6&&banner?banner:'Knocked out · wait in the corner line';
   if(bannerAge<1.4&&banner)return banner;
   const head='Free-for-all · '+s.remaining+' left · '+plural(3-me.hits,'hit')+' left';
   if(threat>.5)return head+' · Red arrow on you: dodge sideways!';
   if(me.shield>0)return head+' · Shield on';
   const has=s.balls.some(b=>b.heldBy===0);
   return head+(has?(coarse?' · Kick ahead of a runner':' · Kick ahead of a runner (Space)'):(coarse?' · Grab a ball · Dodge to sidestep':' · Grab a ball · J to dodge'));
  },
  /** Called at the top of the island tick: turns the island buttons into knockout actions before anything clears them. */
  buttons(input:Buttons){
   if(!joined){holdSeen=false;return;}
   const charging=!!input.charging;
   // Kick on press: the rising edge of the charged-shot hold; its release kick is then ignored. A tap that starts
   // and ends between ticks arrives only as the release kick, which also counts.
   if(charging&&!holdSeen){kickBuffer=KICK_BUFFER;holdSeen=true;}
   if(input.kick){if(!holdSeen)kickBuffer=KICK_BUFFER;holdSeen=charging;input.kick=false;input.shotPower=0;}
   else if(!charging)holdSeen=false;
   if(input.juggle){dodgeBuffer=DODGE_BUFFER;input.juggle=false;}
  },
  /** Called just before the island walk step with the screen-relative stick (ix, iz): dodges and stick-aim. */
  steer(velocity:{x:number;z:number},ix:number,iz:number,dt:number){
   if(!joined)return;
   const length=Math.hypot(ix,iz);if(length>.2){stickX=ix/length;stickZ=iz/length;stickAge=0;}else stickAge+=dt;
   dodgeCooldown=Math.max(0,dodgeCooldown-dt);
   if(dodgeBuffer>0&&dodgeTime<=0&&dodgeCooldown<=0&&countdown<=0&&game.state.phase==='playing'){
    const me=game.state.players[0];
    if(me.alive&&me.hitFlash<=0){const yaw=length>.2?Math.atan2(ix,iz):lastFacing;dodgeX=Math.sin(yaw);dodgeZ=Math.cos(yaw);dodgePose.side=dodgeX*Math.cos(lastFacing)-dodgeZ*Math.sin(lastFacing)>=0?1:-1;dodgeFollow=DODGE_FOLLOW;dodgeTime=DODGE_TIME;dodgeCooldown=DODGE_COOLDOWN;dodgeBuffer=0;pending.dodge++;}
   }
   // Hold the burst speed for DODGE_TIME; the island walk step then eases it back to a walk (a short follow-through).
   if(dodgeTime<=0)dodgeFollow=Math.max(0,dodgeFollow-dt);
   if(dodgeTime>0){dodgeTime=Math.max(0,dodgeTime-dt);velocity.x=dodgeX*DODGE_SPEED;velocity.z=dodgeZ*DODGE_SPEED;}
  },
  kick(yaw:number){if(!joined)return false;game.state.players[0].yaw=yaw;return game.kick(0,true);},
  playerPosition(){if(pendingSpawn){pendingSpawn=false;return{x:roof.x,z:roof.z+16,y:roof.height};}const me=game.state.players[0];if(!joined)return null;if(!me.alive)return me.outAge>=OUT_TELEPORT?queuePoint(0):{x:roof.x+me.x,z:roof.z+me.z,y:roof.height};
   // While knocked back the arena moves the body; the island only follows.
   return me.hitFlash>0?{x:roof.x+me.x,z:roof.z+me.z,y:roof.height}:null;},
  /** Plays this frame's knockout sounds and haptics through the island's synthesized sound (no new assets). */
  feedback(sound:Sound,reduced:boolean){
   if(!(pending.kick||pending.botKick||pending.hit||pending.dodge))return;
   const vibrate=(pattern:number|number[])=>{if(!reduced&&typeof navigator!=='undefined')navigator.vibrate?.(pattern);};
   if(pending.kick)sound.ball('kick');
   if(pending.botKick&&!pending.kick)sound.ball('receive');
   if(pending.meOut||pending.myKo){sound.impact();vibrate(pending.meOut?[40,30,60]:[25,20,35]);}
   else if(pending.meHit){sound.ball('bounce');sound.impact();vibrate([30,25,30]);}
   else if(pending.myHit){sound.ball('bounce');vibrate(15);}
   else if(pending.hit)sound.ball('bounce');
   if(pending.dodge)sound.boost('forward');
   pending.kick=pending.botKick=pending.hit=pending.meHit=pending.meOut=pending.myHit=pending.myKo=pending.dodge=pending.won=0;
  },
  update(dt:number,position:{x:number;z:number},height:number,onFoot:boolean,camera:T.Camera,enabled:boolean,reduced:boolean,facing=0){
   reducedMotion=reduced;
   viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);
   root.visible=enabled&&(joined||(Math.hypot(camera.position.x-roof.x,camera.position.z-roof.z)<120&&frustum.intersectsSphere(visibilitySphere)));
   if(!root.visible)return;
   const onRoof=onFoot&&height>=roof.height-.6&&height<roof.height+6&&Math.abs(position.x-roof.x)<14&&Math.abs(position.z-roof.z)<25.3;
   const enter=onRoof&&Math.abs(position.x-roof.x)<11.6&&Math.abs(position.z-roof.z)<21.6;
   if(!joined&&enter){joined=true;restart();}else if(joined&&!onRoof){joined=false;restart();}
   lastFacing=facing;
   const me=game.state.players[0];
   if(joined&&me.alive&&me.hitFlash<=0){const nx=position.x-roof.x,nz=position.z-roof.z;if(dt>0){me.vx=(nx-me.x)/dt;me.vz=(nz-me.z)/dt;}me.x=nx;me.z=nz;me.yaw=stickAge<.15?Math.atan2(stickX,stickZ):facing;}
   kickBuffer=Math.max(0,kickBuffer-dt);dodgeBuffer=Math.max(0,dodgeBuffer-dt);bannerAge+=dt;
   // Buffered kick: retried every frame until it lands or the buffer runs out.
   if(joined&&kickBuffer>0&&countdown<=0&&me.alive&&me.hitFlash<=0&&game.kick(0,true))kickBuffer=0;
   const previousPhase=game.state.phase;arrival+=dt;
   // Hit-stop: the arena holds still for a few frames on hits the user is part of.
   const simDt=hitStop>0?0:dt;hitStop=Math.max(0,hitStop-dt);
   if(countdown>0){countdown=Math.max(0,countdown-dt);if(countdown===0)game.start();}else game.update(simDt,{x:0,z:0});
   const e=game.state.events;
   if(e.kicks!==seen.kicks){const mine=(e.kicks-seen.kicks)-(e.botKicks-seen.botKicks);if(mine>0&&joined)pending.kick++;else if(joined)pending.botKick++;}
   if(joined&&e.hits!==seen.hits){pending.hit++;
    if(e.meOut!==seen.meOut){pending.meOut++;hitStop=Math.max(hitStop,HIT_STOP.ko);level=Math.max(0,level-1);flash('Knocked out! Wait in the corner line');kickBuffer=0;}
    else if(e.meHit!==seen.meHit){pending.meHit++;hitStop=Math.max(hitStop,HIT_STOP.meHit);flash('Ouch! Shield on for 5 s · '+plural(3-me.hits,'hit')+' left');kickBuffer=0;dodgeTime=0;}
    if(e.myKos!==seen.myKos){pending.myKo++;hitStop=Math.max(hitStop,HIT_STOP.ko);flash('KNOCKOUT! '+game.state.remaining+' left');}
    else if(e.myHits!==seen.myHits){pending.myHit++;hitStop=Math.max(hitStop,HIT_STOP.hit);flash('Good hit! Shielded players are safe for 5 s');}
   }
   syncSeen();
   if(joined&&previousPhase!=='won'&&game.state.phase==='won'){recordExploreActivity('knockoutWins');level=Math.min(MAX_LEVEL,level+1);pending.won++;}
   if(game.state.phase==='won'||game.state.phase==='lost'){resetAge+=dt;if(resetAge>4){restart();if(joined)pendingSpawn=true;}}
   // Threat 0..1 on the user: a bot winding up at them, or a live shot on course within 0.7 s.
   threat=0;
   if(joined&&me.alive&&me.shield<=0){for(const p of game.state.players)if(p.id&&p.alive&&p.windup>0&&p.target===0)threat=Math.max(threat,.4+.6*(1-p.windup/Math.max(.01,p.windupTotal)));const t=game.incoming(0);if(t<Infinity)threat=1;}
   counter.update(countdown,game.state.time,reduced);queueWalls.update(dt,game.state.players,joined,reduced);
   for(let i=0;i<rings.length;i++){const p=game.state.players[i],ring=rings[i],a=p.alive?arrival:p.outAge;ring.visible=(i!==0||joined)&&(p.alive?a<.7:a<OUT_TELEPORT+OUT_ARRIVAL);if(ring.visible){const queued=!p.alive&&a>=OUT_TELEPORT,q=ARENA_QUEUES[Math.max(0,p.queue)];ring.position.set(queued?q.x:p.x,.15+Math.sin(Math.min(1,a)*Math.PI)*2,queued?q.z-1.2+p.queueSlot*1.1:p.z);ring.scale.setScalar(.7+Math.sin(a*8)**2*.8);}}
   batch.begin();
   for(let i=0;i<rigs.length;i++){const p=game.state.players[i+1],r=rigs[i],queued=!p.alive&&p.outAge>=OUT_TELEPORT,q=ARENA_QUEUES[Math.max(0,p.queue)];
    const moving=p.alive&&p.hitFlash<=0&&simDt>0,charge=p.alive&&p.windup>0&&p.windupTotal>0?1-p.windup/p.windupTotal:undefined;
    r.update(queued?q.x:p.x,queued?q.z-1.2+p.queueSlot*1.1:p.z,moving?dt:0,game.state.time,reduced,{facing:queued?(q.z<0?0:Math.PI):p.yaw,dribbling:game.state.balls.some(b=>b.heldBy===p.id),kick:p.kick>0?.15+.85*(1-p.kick/.28):charge===undefined?0:undefined,windup:charge,kickSide:p.id%2?-1:1,shotPower:.6});
    r.root.rotation.z=0;r.root.scale.setScalar(p.alive?Math.min(1,arrival*2):1);
    
    applyPose(r.root,p,reduced);batch.draw(r.root);}
   batch.end();
   // Shared match batches disable frustum culling; restore it for this compact arena.
   // Three tests these same bounds independently against the view and shadow cameras.
   // Heat pass 5 (audit F19): one arena-sized sphere (arena-local; players, queues and knock-back fit within 40 m), assigned once,
   // instead of recomputing every mesh's bounds over all instances each frame.
   for(const object of batchScene.children){const mesh=object as T.InstancedMesh;if(!mesh.visible)continue;mesh.frustumCulled=true;if(!mesh.userData.arenaBounds){mesh.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),40);mesh.userData.arenaBounds=true;}}

   hitEffects.update(game.state.players,game.state.time,joined,camera,reduced,game.state.hitLog);
   telegraphs.update(game.state.players,game.state.hitLog,game.state.time,threat,joined&&me.alive?me:null,reduced);
   shields.count=0;
   for(const p of game.state.players)if(p.alive&&p.shield>0&&(p.id!==0||joined)){dummy.position.set(p.x,1,p.z);const age=SHIELD_DURATION-p.shield,pulse=Math.min(1,age/.18)*(1+Math.sin(age*9)*.06)*Math.min(1,p.shield/.25);dummy.scale.set(1.05*pulse,1.25*pulse,1.05*pulse);dummy.updateMatrix();shields.setMatrixAt(shields.count++,dummy.matrix);}
   shields.visible=shields.count>0;if(shields.count)shields.instanceMatrix.needsUpdate=true;dummy.scale.setScalar(1);
   ballTrails.update(simDt,game.state.balls,reduced);
   balls.count=game.state.balls.length;game.state.balls.forEach((b,i)=>{dummy.position.set(b.x,.4,b.z);dummy.updateMatrix();balls.setMatrixAt(i,dummy.matrix);});if(balls.count)balls.instanceMatrix.needsUpdate=true;
  },
  posePlayer(object:T.Object3D){if(!joined)return;const me=game.state.players[0];
   // Face the (assisted) kick direction for the strike, whatever the smoothed walk facing says.
   if(me.alive&&me.kick>0)object.rotation.y=me.yaw;
   applyPose(object,me,reducedMotion);if(me.alive)object.scale.multiplyScalar(Math.min(1,arrival*2));},
  dispose(){batch.dispose();ballTrails.dispose();hitEffects.dispose();telegraphs.dispose();shields.dispose();shieldGeo.dispose();shieldMat.dispose();counter.dispose();queueWalls.dispose();ringGeo.dispose();ringMat.dispose();rigs.forEach(r=>r.dispose());balls.dispose();geo.dispose();mat.dispose();root.removeFromParent();}
 };
}
