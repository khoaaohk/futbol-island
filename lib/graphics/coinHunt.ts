import {createCoinEffects} from './coinEffects';
import type {Obstacle} from '../town/simulation';
import * as T from 'three';
import {COIN_QUEST,type CoinSpot} from '../town/coinQuest';
import {readCoinProgress,recordCoin,subscribeCoins} from '../town/coinProgress';
type Point={x:number;y:number;z:number};
export function createCoinHunt(scene:T.Scene,onCollect:(coin:CoinSpot)=>void,onNear:(text:string)=>void,onCollectionFinished?:(coin:CoinSpot)=>void){
 const pendingLessons:CoinSpot[]=[];
 const root=new T.Group();root.name='matchday-coin-hunt';scene.add(root);
 const materials=[0xc19861,0xe9c75f,0x477c6a,0xffe9a1,0xf7edd1,0xffffff,0x253c35,0xac936b,0xbaa27e,0x8d795a].map(color=>new T.MeshStandardMaterial({color,roughness:.75}));
 const box=new T.BoxGeometry(1,1,1),disc=new T.SphereGeometry(.34,16,12),ring=new T.TorusGeometry(.45,.045,5,20),targetDisc=new T.CircleGeometry(.12,5);
 const aerialRingGeometry=new T.TorusGeometry(2.6,.13,5,40),aerialRingMaterial=new T.MeshBasicMaterial({color:0xffd36c});
 const mesh=(g:T.BufferGeometry,m:number,p:T.Object3D,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const o=new T.Mesh(g,materials[m]);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=false;p.add(o);return o;};
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=64;const labelContext=labelCanvas.getContext('2d')!;labelContext.fillStyle='#294f43';labelContext.fillRect(0,0,256,64);labelContext.fillStyle='#ffe39b';labelContext.font='bold 42px Arial';labelContext.textAlign='center';labelContext.textBaseline='middle';labelContext.fillText('KICK',128,34);const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.colorSpace=T.SRGBColorSpace;const labelMaterial=new T.MeshBasicMaterial({map:labelTexture}),labelGeo=new T.PlaneGeometry(1,.25);
 // Bake colored details into one draw per object; keep textured labels separate.
 const packedMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.75});
 const packedGeometries:T.BufferGeometry[]=[];
 function pack(parent:T.Group,castShadow=false){
  parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert();
  const positions:number[]=[],normals:number[]=[],colors:number[]=[],parts:T.Mesh[]=[];
  parent.traverse(o=>{if(!(o instanceof T.Mesh)||!(o.material instanceof T.MeshStandardMaterial))return;
   const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
   const position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),color=o.material.color;
   for(let i=0;i<position.count;i++){positions.push(position.getX(i),position.getY(i),position.getZ(i));normals.push(normal.getX(i),normal.getY(i),normal.getZ(i));colors.push(color.r,color.g,color.b);}
   geometry.dispose();parts.push(o);
  });
  if(!parts.length)return null;
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();packedGeometries.push(geometry);
  parts.forEach(p=>p.removeFromParent());const empty:T.Object3D[]=[];parent.traverse(o=>{if(o!==parent&&o.children.length===0&&o instanceof T.Group)empty.push(o);});empty.forEach(o=>o.removeFromParent());
  const combined=new T.Mesh(geometry,packedMaterial);combined.castShadow=castShadow;combined.matrixAutoUpdate=false;parent.add(combined);return geometry;
 }
 const ballTemplate=new T.Group();mesh(disc,5,ballTemplate,0,0,0);
 const phi=(1+Math.sqrt(5))/2;
 for(const a of [-1,1])for(const b of [-1,1])for(const raw of [[0,a,b*phi],[a,b*phi,0],[a*phi,0,b]]){const n=new T.Vector3(...raw).normalize();const patch=mesh(targetDisc,6,ballTemplate,n.x*.339,n.y*.339,n.z*.339,.82,.82,.82);patch.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);}
 const ballGeometry=pack(ballTemplate)!;
 const entries=COIN_QUEST.map(original=>{const spot={...original};
  const group=new T.Group();group.name='coin-spot-'+spot.id;group.position.set(spot.x,spot.y,spot.z);root.add(group);
  const parcel=new T.Group();group.add(parcel);
  if(spot.wall){
   const east=spot.wall.facing==='east',faceDepth=east?spot.wall.x-spot.x:spot.wall.z-spot.z;
   if(east)parcel.rotation.y=Math.PI/2;
   const wallMesh=(g:T.BufferGeometry,m:number,p:T.Object3D,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>mesh(g,spot.wall!.high?(m===1?7:m===5||m===4?8:m===6?9:m):m,p,x,y,z,sx,sy,sz);
   if(spot.wall.round){
    const face=faceDepth;
    wallMesh(disc,5,parcel,0,spot.wall.y,face,1.5,1.5,.1);
    wallMesh(ring,1,parcel,0,spot.wall.y,face+.075,1.15,1.15,1);
    wallMesh(targetDisc,6,parcel,0,spot.wall.y,face+.09,1.6,1.6,1);
    const label=new T.Mesh(labelGeo,labelMaterial);label.position.set(0,spot.wall.y-1.12,face+.08);if(!spot.wall.high)parcel.add(label);
   }else{
   wallMesh(box,spot.wall.high?0:2,parcel,0,spot.wall.y,faceDepth,spot.wall.high?2.2:3.75,spot.wall.high?.95:1.25,spot.wall.high?.22:.1);
   for(const x of (spot.wall.high?[-.97,.97]:[-1.72,1.72]))wallMesh(box,1,parcel,x,spot.wall.y,faceDepth+(spot.wall.high?.12:.055),.06,1.1,.012);
   const label=new T.Mesh(labelGeo,labelMaterial);label.position.set(1.08,spot.wall.y,faceDepth+(spot.wall.high?.28:.065));if(!spot.wall.high)parcel.add(label);
   }
   if(!spot.wall.high)for(let n=0;n<3;n++)for(const side of [-1,1]){const arrow=wallMesh(box,1,parcel,side*.13,.025,.9+n*.7,.055,.015,.4);arrow.rotation.y=side*.65;}

   if(!spot.wall.round){wallMesh(ring,1,parcel,0,spot.wall.y,faceDepth+(spot.wall.high?.13:.06));wallMesh(targetDisc,4,parcel,0,spot.wall.y,faceDepth+(spot.wall.high?.14:.07),2.1,2.1,1);wallMesh(targetDisc,6,parcel,0,spot.wall.y,faceDepth+(spot.wall.high?.15:.08),.85,.85,1);}
  }else if(spot.grass){
   mesh(box,0,parcel,0,-.12,0,2.5,.3,2.5);mesh(box,2,parcel,0,.08,0,2.6,.12,2.6);
   for(const side of [-1,1]){mesh(box,1,parcel,side*1.23,.15,0,.05,.015,2.5);mesh(box,1,parcel,0,.15,side*1.23,2.5,.015,.05);}
   const mark=mesh(ring,1,parcel,0,.16,0,1.5,1.5,1.5);mark.rotation.x=-Math.PI/2;
   const football=mesh(targetDisc,4,parcel,0,.17,0,2,2,2);football.rotation.x=-Math.PI/2;
   for(const side of [-1,1]){const arrow=mesh(box,1,parcel,side*.18,.17,.95,.06,.015,.5);arrow.rotation.y=side*.7;}
  }else if(spot.kind==='hidden'&&!spot.parachute&&!spot.ramp&&spot.truck===undefined){
   if(spot.id==='roof'){mesh(box,2,parcel,0,.9,.12,1.5,1.1,.15);for(const x of [-.62,.62])mesh(box,0,parcel,x,.5,.12,.08,1,.1);for(const x of [-.4,0,.4])mesh(box,4,parcel,x,.9,.21,.04,.85,.02);}
   else{mesh(box,spot.id==='museum'?0:2,parcel,0,.35,.2,1.1,.65,.65);mesh(box,1,parcel,0,.69,.2,.12,.035,.68);}
  }else if(!spot.parachute&&!spot.ramp&&spot.truck===undefined){
   const height=spot.kind==='landing'?.55:.9;mesh(box,0,parcel,0,(height-.12)/2,0,1.5,height-.12,1.2);mesh(box,spot.kind==='landing'?2:1,parcel,0,height-.06,0,1.6,.12,1.3);
   for(const x of [-.58,.58])mesh(box,1,parcel,x,.42,.61,.04,.75,.015);
   for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const face=new T.Group();face.rotation.y=yaw;parcel.add(face);mesh(ring,1,face,0,.45,.77,.64,.64,.64);mesh(targetDisc,4,face,0,.45,.785);}
  }
  const coin=new T.Group();group.add(coin);coin.position.set(0,1.25,spot.kind==='hidden'&&!spot.parachute&&!spot.ramp&&spot.truck===undefined?-1.35:0);const ballMesh=new T.Mesh(ballGeometry,packedMaterial);ballMesh.matrixAutoUpdate=false;coin.add(ballMesh);pack(parcel,!spot.wall&&!spot.grass);
  const aerialHighlight=spot.parachute?new T.Mesh(aerialRingGeometry,aerialRingMaterial):null;
  if(aerialHighlight){aerialHighlight.name='parachute-ball-highlight';aerialHighlight.rotation.x=-Math.PI/2;aerialHighlight.position.y=1.25;aerialHighlight.visible=false;group.add(aerialHighlight);}
  return {spot,group,parcel,coin,aerialHighlight,revealAge:99,dropArmed:false};
 });
 const effects=createCoinEffects(ballGeometry);root.add(effects.root);let time=0,nearText='',enabled=false,lastReduced=false;
 const marker=new T.Mesh(new T.TorusGeometry(1.1,.07,5,28),materials[1]);marker.rotation.x=-Math.PI/2;root.add(marker);marker.visible=false;
 const stats={reveals:0,collections:0,animated:0};
 const colliders=COIN_QUEST.filter(s=>!s.parachute&&!s.wall&&!s.ramp&&s.truck===undefined).map(s=>({spot:s,box:{dynamic:true,x:s.x,z:s.z+(s.kind==='hidden'?.2:0),w:s.grass?2.6:s.kind==='hidden'?1.5:1.6,d:s.grass?2.6:s.kind==='hidden'?.8:1.3,floor:s.y,top:s.y+(s.grass?.14:s.kind==='landing'?.55:s.kind==='hidden'?.75:.9),noLanding:s.kind!=='landing'}}));
 const dimensions=colliders.map(c=>({w:c.box.w,d:c.box.d,top:c.box.top}));
 function syncCollisions(){colliders.forEach((c,i)=>{const opened=(c.spot.kind==='hidden'?readCoinProgress().collected:readCoinProgress().revealed).includes(c.spot.id);c.box.w=opened?0:dimensions[i].w;c.box.d=opened?0:dimensions[i].d;c.box.top=opened?c.spot.y:dimensions[i].top;});}
 function connectCollisions(obstacles:Obstacle[],props:(Obstacle&{floor:number;top:number;noLanding?:boolean})[]){syncCollisions();for(const c of colliders){props.push(c.box);if(c.spot.y===0)obstacles.push(c.box);}}

 let progress=readCoinProgress(),collected=new Set(progress.collected),revealedIds=new Set(progress.revealed);const unsubscribe=subscribeCoins(()=>{progress=readCoinProgress();collected=new Set(progress.collected);revealedIds=new Set(progress.revealed);syncCollisions();});
 function reveal(e:typeof entries[number]){if(!recordCoin(e.spot.id,'reveal'))return false;e.revealAge=0;stats.reveals++;effects.breakBox(e.spot,lastReduced);return true;}
 // Called inside the ball simulator's <=12cm swept substeps, after wall collision.
 function hit(x:number,y:number,z:number,vx:number,vz:number){if(!enabled||Math.hypot(vx,vz)<2)return false;const e=entries.find(e=>{const s=e.spot;if(s.kind==='hidden'||s.grass||revealedIds.has(s.id))return false;if(s.wall){const east=s.wall.facing==='east',normal=east?x-s.wall.x:z-s.wall.z,tangent=east?z-s.wall.z:x-s.wall.x,velocity=east?vx:vz;return velocity<-.5&&normal>=-.05&&Math.abs(normal)<(s.wall.high?.5:.32)&&(s.wall.round?Math.hypot(tangent,y-s.wall.y)<1.05:Math.abs(tangent)<1.9&&Math.abs(y-s.wall.y)<.8);}return Math.abs(x-s.x)<.95&&Math.abs(z-s.z)<.95&&y>s.y+.05&&y<s.y+1.25;});return e?reveal(e):false;}
 function land(p:Point){if(!enabled)return;for(const e of entries)if(e.spot.kind==='landing'&&(!e.spot.grass||e.dropArmed)&&!revealedIds.has(e.spot.id)&&Math.abs(p.y-e.spot.y)<.8&&Math.hypot(p.x-e.spot.x,p.z-e.spot.z)<1.8)reveal(e);}
 function aim(p:Point,yaw:number,clear:(x:number,z:number)=>boolean){let best:typeof entries[number]|undefined,dist=9;for(const e of entries){const s=e.spot,dx=s.x-p.x,dz=s.z-p.z,d=Math.hypot(dx,dz);if(s.kind==='hidden'||s.grass||revealedIds.has(s.id)||Math.abs(s.y-p.y)>.7||d>dist||d<.5)continue;const angle=Math.atan2(dx,dz)-yaw;if(Math.cos(angle)<.82)continue;let visible=true;const steps=Math.ceil(d/.3);for(let i=1;i<=steps;i++)if(!clear(p.x+dx*i/steps,p.z+dz*i/steps)){visible=false;break;}if(!visible)continue;dist=d;best=e;}return best?Math.atan2(best.spot.x-p.x,best.spot.z-p.z):null;}
 function update(dt:number,p:Point,active:boolean,reduced:boolean,airRamp:string|null=null,parachuting=false){enabled=active;lastReduced=reduced;root.visible=active;if(!active){if(nearText){nearText='';onNear('');}return;}time+=dt;stats.animated=0;let near:typeof entries[number]|undefined,nearest=5;
  for(const e of entries){const s=e.spot,done=collected.has(s.id),revealed=s.kind==='hidden'||revealedIds.has(s.id);e.group.visible=!done;if(done)continue;const distanceSquared=(p.x-s.x)**2+(p.z-s.z)**2;if(e.aerialHighlight){const show=parachuting&&distanceSquared<150*150&&Math.abs(p.y-s.y)<160;e.aerialHighlight.visible=show;const size=show?1.65:1;if(e.coin.scale.x!==size)e.coin.scale.setScalar(size);if(show)e.aerialHighlight.scale.setScalar(reduced?1:1+Math.sin(time*3+s.x)*.07);}
   e.revealAge+=dt;e.parcel.visible=!revealed||s.kind==='hidden'||!!s.grass&&e.revealAge<.6;if(s.grass){e.parcel.rotation.x=revealed?-Math.min(1,e.revealAge/.6)*1.5:0;if(Math.hypot(p.x-s.x,p.z-s.z)<6&&p.y>s.y+2)e.dropArmed=true;if(Math.hypot(p.x-s.x,p.z-s.z)>8)e.dropArmed=false;}e.coin.visible=revealed;if(revealed&&distanceSquared<64*64){stats.animated++;e.coin.rotation.y=reduced?0:time*1.8;e.coin.position.y=1.25+(s.wall?.high&&!reduced?Math.max(0,1-e.revealAge/.6)*(s.wall.y-1.25):0)+(reduced?0:Math.sin(time*2+s.x)*.09);}
   const d=Math.sqrt(distanceSquared),sameFloor=Math.abs(p.y-s.y)<(s.parachute?2.5:s.ramp?2.5:.75);if(sameFloor&&d<nearest){nearest=d;near=e;}const pickupDistance=s.kind==='hidden'&&!s.parachute&&!s.ramp&&s.truck===undefined?Math.hypot(p.x-s.x,p.z-(s.z-1.35)):d;if(revealed&&(!s.parachute||parachuting)&&s.truck===undefined&&(!s.ramp||airRamp===s.ramp)&&sameFloor&&pickupDistance<(s.parachute?3:s.ramp?2:s.kind==='hidden'?.7:1.3)&&e.revealAge>.6&&recordCoin(s.id,'collect')){stats.collections++;effects.collect(s);pendingLessons.push(s);onCollect(s);}
  }
  const hint=entries.find(e=>e.spot.id===progress.hint&&!collected.has(e.spot.id));marker.visible=!!hint;if(hint){marker.position.set(hint.spot.x,hint.spot.y+.08,hint.spot.z);marker.scale.setScalar(reduced?1:1+Math.sin(time*2)*.08);}
  const text=near?(near.spot.parachute?'Open your parachute above the ball and steer down through it.':near.spot.truck!==undefined?'Fly near the truck and choose Land on truck. Steer to drive; use Hop off to leave.':near.spot.ramp?'Ride the third rooftop ramp through the floating ball.':progress.revealed.includes(near.spot.id)||near.spot.kind==='hidden'?'A hidden soccer ball is nearby. Look around!':near.spot.truck!==undefined?'Fly near the truck and choose Land on truck. Steer to drive; use Hop off to leave.':near.spot.ramp?'Ride the third rooftop ramp through the floating ball.':near.spot.grass?'Drop from the roof onto the gold-marked grass lid.':near.spot.wall?.round?'Look up! Hold Kick for a high shot at the round football target.':near.spot.wall?.high?'Look up! Use a high shot or wall juggle to break the raised box.':near.spot.wall?'Face the soccer wall and kick its target.':near.spot.kind==='landing'?'Land on the padded box—or face it and kick the target.':'Face the football-marked parcel and kick its target.')+(hint&&near.spot.id===hint.spot.id?' Follow the gold ring.':''):'';
  if(text!==nearText){nearText=text;onNear(text);}
  effects.update(dt,reduced);
  // Handoff follows rendered-effect simulation, never a wall-clock timeout.
  // Wait for every overlapping collection to settle before pausing the island.
  if(pendingLessons.length&&effects.settled){for(const spot of pendingLessons)onCollectionFinished?.(spot);pendingLessons.length=0;}
 }
 function moveTruck(index:number,p:Point,riding:boolean){const e=entries.find(e=>e.spot.truck===index);if(!e)return;Object.assign(e.spot,p);if(!collected.has(e.spot.id))e.group.position.set(p.x,p.y,p.z);if(enabled&&riding&&!collected.has(e.spot.id)&&recordCoin(e.spot.id,'collect')){stats.collections++;effects.collect(e.spot);pendingLessons.push(e.spot);onCollect(e.spot);}}
 return{root,stats,moveTruck,connectCollisions,hit,land,aim,update,dispose(){aerialRingGeometry.dispose();aerialRingMaterial.dispose();effects.dispose();unsubscribe();root.removeFromParent();box.dispose();disc.dispose();ring.dispose();targetDisc.dispose();marker.geometry.dispose();labelGeo.dispose();labelMaterial.dispose();labelTexture.dispose();materials.forEach(m=>m.dispose());packedMaterial.dispose();packedGeometries.forEach(g=>g.dispose());}};
}
