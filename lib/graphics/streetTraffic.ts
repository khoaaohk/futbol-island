import {truckGoalClear} from '../town/truckCollisions';
import {recordExploreActivity} from '../town/exploreActivity';
import {createTrafficTangentCache} from '../town/trafficTangentCache';
import {canSeparateVehicle,vehicleOverlap,type VehicleFootprint} from '../town/trafficSeparation';
import {createTrafficRouteSamples} from '../town/trafficRouteSamples';
import {TRAVEL_MODES} from '../town/travelModes';
import * as T from 'three';
import {batchRigidMeshes} from './batchMeshes';
import {createTruckLandingGlowAssets} from './truckLandingGlow';
import {buildRoadNetwork,type TrafficRoad,type RoadNode} from '../town/roadNetwork';
import {blocked,type Obstacle} from '../town/simulation';
import {createObstacleGrid} from '../town/obstacleGrid';
import {findTruckRoadRoute,truckRoadRouteSearch} from '../town/truckNavigation';
/** Seven cars and two collectible pickup trucks navigate the authored road graph, yielding to visitors and traffic. */
export function createStreetTraffic(scene:T.Scene,obstacles:Obstacle[],roads:TrafficRoad[]){
 const comments=["Watch where you're going!","Dude, come on!","Are you blind?","Hey! Eyes on the road!","Easy! This is not a racetrack!","Whoa! Give me some room!","I was right here!","Careful with the paint!","Brakes! Try the brakes!","You good? That was a bump!","My car is not a football!","A little space, please!","Come on, I just washed this!","Wrong way, my friend!","Save the tackles for the pitch!","Whoa there, island racer!","Next time, go around!","That is one way to say hello!"];
 const speechTextures:T.Texture[]=[];
 const root=new T.Group();root.name='island-street-cars';scene.add(root);
 const geometry:T.BufferGeometry[]=[],materials:T.Material[]=[];
 const black=new T.MeshStandardMaterial({color:'#303d3c'}),glass=new T.MeshStandardMaterial({color:'#769994',roughness:.35}),cream=new T.MeshStandardMaterial({color:'#efe1bd'});materials.push(black,glass,cream);
 const mesh=(parent:T.Group,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{geometry.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const nodes=buildRoadNetwork(roads),usedStarts=new Set<number>();
 const segment=(from:RoadNode,to:RoadNode,start?:T.Vector3)=>{const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz),x=dx/length,z=dz/length,margin=Math.min(3,length*.25),entry=new T.Vector3(from.x+x*margin-z*2,0,from.z+z*margin+x*2),end=new T.Vector3(to.x-x*margin-z*2,0,to.z-z*margin+x*2),curve=new T.CurvePath<T.Vector3>();if(start)curve.add(new T.QuadraticBezierCurve3(start.clone(),new T.Vector3(from.x,0,from.z),entry));curve.add(new T.LineCurve3(entry,end));return curve;};
 const starts=[[124,-45],[-45,20],[48,90],[124,-140],[218,70],[48,-100],[130,170],[48,-40],[218,110]];
 const cars=['#bb6857','#638d9c','#d9b563','#7eaa81','#ab8eaf','#e1b796','#6a919e','#319c8c','#efad45'].map((color,i)=>{const group=new T.Group();group.name='street-car-'+i;root.add(group);const paint=new T.MeshStandardMaterial({color,roughness:.7});materials.push(paint);
  const pickup=i>=7;if(pickup){group.name='matchday-pickup-'+(i-7);
   mesh(group,new T.BoxGeometry(2,.4,4.4),paint,0,.65,0);
   mesh(group,new T.BoxGeometry(1.9,.12,2.25),cream,0,.92,-.95);
   mesh(group,new T.BoxGeometry(1.65,.85,1.25),glass,0,1.25,.8);mesh(group,new T.BoxGeometry(1.9,.12,1.4),paint,0,1.73,.8);
   for(const side of [-1,1])mesh(group,new T.BoxGeometry(.14,.55,2.4),paint,side*.94,1.1,-.95);
   mesh(group,new T.BoxGeometry(2,.55,.14),paint,0,1.1,-2.12);
   const mark=mesh(group,new T.TorusGeometry(.48,.045,5,20),cream,0,1,-.95);mark.rotation.x=-Math.PI/2;
  }else{
  mesh(group,new T.BoxGeometry(1.7,.55,3.4),paint,0,.68,0);mesh(group,new T.BoxGeometry(1.45,.65,1.7),glass,0,1.22,-.15);mesh(group,new T.BoxGeometry(1.56,.1,1.8),paint,0,1.58,-.15);}
  for(const side of [-1,1]){for(const z of [-1.05,1.05]){const wheel=mesh(group,new T.CylinderGeometry(.32,.32,.19,12),black,side*.83,.34,z);wheel.rotation.z=Math.PI/2;}mesh(group,new T.BoxGeometry(.32,.18,.055),cream,side*.52,.76,1.72);mesh(group,new T.BoxGeometry(.25,.16,.055),paint,side*.55,.75,-1.72);}
  geometry.push(...batchRigidMeshes(group));
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;speechTextures.push(texture);const speechMaterial=new T.SpriteMaterial({map:texture,depthTest:true,depthWrite:false});materials.push(speechMaterial);const speech=new T.Sprite(speechMaterial);speech.name='driver-reaction';speech.position.set(0,3.8,0);speech.scale.set(9,2.25,1);speech.visible=false;group.add(speech);
  const obstacle={dynamic:true,x:0,z:0,w:pickup?2.1:1.9,d:pickup?4.5:3.6};obstacles.push(obstacle);const from=nodes.filter(n=>n.links.length&&!usedStarts.has(n.id)).sort((a,b)=>Math.hypot(a.x-starts[i][0],a.z-starts[i][1])-Math.hypot(b.x-starts[i][0],b.z-starts[i][1]))[0];usedStarts.add(from.id);const to=nodes[from.links[i%from.links.length]],path=segment(from,to);return{pickup,index:i,group,obstacle,speech,canvas,texture,freeDriven:false,driveSpeed:0,rejoin:null as ReturnType<typeof findTruckRoadRoute>,rejoinAttempted:false,rejoinSearch:null as ReturnType<typeof truckRoadRouteSearch>|null,crashAge:99,crashes:0,from:from.id,to:to.id,path,routeSamples:createTrafficRouteSamples(path),decisionAge:0,trafficWaiting:false,length:path.getLength(),distance:0,visits:new Map<string,number>(),speed:pickup?4.2:5.8+i*.25};
 });
 const landingGlowAssets=createTruckLandingGlowAssets();
 const pickupMarkers=cars.filter(c=>c.pickup).map(car=>{const glow=landingGlowAssets.create();car.group.add(glow.root);return{car,glow};});
 const rider={index:-1,landingAge:99,waitForNeutral:false,boostTime:0,boostCooldown:0};
 const boost=()=>{if(rider.index>=0&&rider.boostCooldown<=0){rider.boostTime=1.4;rider.boostCooldown=2.2;rider.waitForNeutral=false;}};
 const touchdown=(index:number)=>{recordExploreActivity('truck');rider.index=index;rider.landingAge=0;rider.waitForNeutral=true;cars[index].group.userData.landings=(cars[index].group.userData.landings??0)+1;};
 const overTruck=(x:number,z:number)=>cars.find(c=>{if(!c.pickup)return false;const dx=x-c.group.position.x,dz=z-c.group.position.z,yaw=c.group.rotation.y;return Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw))<1.15&&Math.abs(dx*Math.sin(yaw)+dz*Math.cos(yaw))<2.35;});
 // A generous local footprint works on turns too; select the closest eligible pickup.
 const pickupNear=(x:number,z:number,halfWidth:number,halfLength:number)=>{let selected:typeof cars[number]|undefined,best=Infinity;for(const c of cars){if(!c.pickup)continue;const dx=x-c.group.position.x,dz=z-c.group.position.z,yaw=c.group.rotation.y,side=dx*Math.cos(yaw)-dz*Math.sin(yaw),along=dx*Math.sin(yaw)+dz*Math.cos(yaw),distance=dx*dx+dz*dz;if(Math.abs(side)<halfWidth&&Math.abs(along)<halfLength&&distance<best){selected=c;best=distance;}}return selected;};
 const landingTruckAt=(x:number,z:number)=>{const c=pickupNear(x,z,8,8);return c&&Math.hypot(x-c.group.position.x,z-c.group.position.z)<=8?c:undefined;};
 const bedPoint=(index:number)=>{const c=cars[index];return{x:c.group.position.x-Math.sin(c.group.rotation.y)*.95,y:.98,z:c.group.position.z-Math.cos(c.group.rotation.y)*.95};};
 const bedAt=(x:number,z:number)=>cars.find(c=>{if(!c.pickup)return false;const p=bedPoint(c.index),dx=x-p.x,dz=z-p.z,yaw=c.group.rotation.y;return Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw))<.65&&Math.abs(dx*Math.sin(yaw)+dz*Math.cos(yaw))<.85;});
 function updateLandingIndicator(x:number,z:number,visible:boolean,time:number,reduced:boolean,landingIndex:number|null=null){
  const ready=visible?landingTruckAt(x,z):undefined;
  const hovered=visible?(landingIndex===null?ready??pickupNear(x,z,9,9):cars[landingIndex]):undefined;
  for(const entry of pickupMarkers)entry.glow.update(hovered===entry.car,ready===entry.car||landingIndex===entry.car.index,time,reduced);
  return hovered!==undefined;
 }
 const drivingGrid=createObstacleGrid(obstacles);
 const trafficObstacles=new Set(cars.map(c=>c.obstacle));
 const currentFootprint:VehicleFootprint={x:0,z:0,yaw:0,width:0,length:0},nextFootprint={...currentFootprint},otherFootprint={...currentFootprint};
 const footprint=(car:typeof cars[number],out:VehicleFootprint)=>{out.x=car.group.position.x;out.z=car.group.position.z;out.yaw=car.group.rotation.y;out.width=car.pickup?2.1:1.9;out.length=car.pickup?4.5:3.6;};
 const trafficClear=(car:typeof cars[number],x:number,z:number,yaw:number)=>{
  footprint(car,currentFootprint);nextFootprint.x=x;nextFootprint.z=z;nextFootprint.yaw=yaw;nextFootprint.width=currentFootprint.width;nextFootprint.length=currentFootprint.length;
  for(const other of cars){if(other===car)continue;if(Math.abs(other.group.position.x-x)>7||Math.abs(other.group.position.z-z)>7)continue;footprint(other,otherFootprint);if(!canSeparateVehicle(currentFootprint,nextFootprint,otherFootprint))return false;}return true;
 };
 const overlapsCar=(car:typeof cars[number],other:typeof cars[number])=>{footprint(car,currentFootprint);footprint(other,otherFootprint);return vehicleOverlap(currentFootprint,otherFootprint)>0;};
 const canDrive=(car:typeof cars[number],x:number,z:number,yaw:number)=>{if(!truckGoalClear(x,z,yaw))return false;const nearby=drivingGrid.query(x,z,4).filter(o=>!trafficObstacles.has(o as typeof car.obstacle));for(const offset of [-1.15,0,1.15])if(blocked(x+Math.sin(yaw)*offset,z+Math.cos(yaw)*offset,nearby,1.05))return false;return trafficClear(car,x,z,yaw);};
 function freeDrive(car:typeof cars[number],dt:number,drive:{x:number;z:number}|undefined,amount:number,reduced:boolean){
  car.freeDriven=true;
  let yaw=car.group.rotation.y;
  if(car.index===rider.index&&rider.boostTime>0&&amount<=.15){drive={x:Math.sin(yaw),z:Math.cos(yaw)};amount=1;}
  const reverse=car.index===rider.index&&drive&&amount>.15&&(drive.x*Math.sin(yaw)+drive.z*Math.cos(yaw))/Math.hypot(drive.x,drive.z)<-.5;
  const target=drive&&amount>.15&&(car.index!==rider.index||!rider.waitForNeutral)?(reverse?-8:car.index===rider.index?(rider.boostTime>0?40:TRAVEL_MODES.moped.maxSpeed):7.5)*amount:0;
  car.driveSpeed=target===0?0:T.MathUtils.damp(car.driveSpeed,target,5,dt);
  if(target!==0&&drive){const desired=Math.atan2(drive.x,drive.z)+(reverse?Math.PI:0),delta=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw)),turned=yaw+T.MathUtils.clamp(delta,-dt*2.8,dt*2.8);if(canDrive(car,car.group.position.x,car.group.position.z,turned))yaw=turned;}
  const distance=car.driveSpeed*dt,steps=Math.max(1,Math.ceil(Math.abs(distance)/.15));
  for(let i=0;i<steps;i++){const x=car.group.position.x+Math.sin(yaw)*distance/steps,z=car.group.position.z+Math.cos(yaw)*distance/steps;if(!canDrive(car,x,z,yaw)){car.driveSpeed=0;break;}car.group.position.x=x;car.group.position.z=z;}
  car.group.rotation.y=yaw;car.group.rotation.z=0;car.group.position.y=0;
  if(!reduced&&rider.landingAge<.9){const t=rider.landingAge;car.group.position.y=-Math.sin(t*18)*Math.exp(-t*5)*.09;car.group.rotation.z=Math.sin(t*23)*Math.exp(-t*5)*.045;}
  car.obstacle.x=car.group.position.x;car.obstacle.z=car.group.position.z;car.obstacle.w=Math.abs(Math.sin(yaw))*4.5+Math.abs(Math.cos(yaw))*2.1;car.obstacle.d=Math.abs(Math.cos(yaw))*4.5+Math.abs(Math.sin(yaw))*2.1;
  car.speech.visible=false;car.group.userData.controlled=car.index===rider.index;car.group.userData.waiting=car.driveSpeed===0;
 }
 function resumeRoaming(car:typeof cars[number],dt:number,reduced:boolean){
  if(!car.rejoinAttempted){car.rejoinAttempted=true;const trafficObstacles=new Set(cars.map(c=>c.obstacle));car.rejoinSearch=truckRoadRouteSearch({x:car.group.position.x,z:car.group.position.z},nodes,(a,b)=>{const distance=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(distance));for(let i=1;i<=steps;i++){const x=T.MathUtils.lerp(a.x,b.x,i/steps),z=T.MathUtils.lerp(a.z,b.z,i/steps);if(blocked(x,z,drivingGrid.query(x,z,3).filter(o=>!trafficObstacles.has(o as typeof car.obstacle)),2.35))return false;}return true;});}
  if(car.rejoinSearch){const next=car.rejoinSearch.next();if(next.done){car.rejoin=next.value;car.rejoinSearch=null;}}
  const target=car.rejoin?.points[0];if(!target){freeDrive(car,dt,undefined,0,reduced);return;}
  const dx=target.x-car.group.position.x,dz=target.z-car.group.position.z,distance=Math.hypot(dx,dz);
  // Slow down at each bend; the same swept collision checks apply off-road.
  freeDrive(car,dt,{x:dx,z:dz},Math.min(.55,distance/3),reduced);
  if(distance<.65){car.rejoin!.points.shift();if(!car.rejoin!.points.length){const node=nodes[car.rejoin!.node],to=nodes[node.links[car.index%node.links.length]];car.from=node.id;car.to=to.id;car.path=segment(node,to,car.group.position);car.routeSamples=createTrafficRouteSamples(car.path);car.length=car.path.getLength();car.distance=0;car.freeDriven=false;car.rejoin=null;car.rejoinAttempted=false;}}
 }
 const routePosition=new T.Vector3(),routeTangent=new T.Vector3(),tangents=createTrafficTangentCache();
 const stats={trafficChecks:0,deferredDecisions:0};
 // Hold a junction until the owner clears its turn; waiting cars stay outside it.
 const junctionOwners=new Map<number,number>();
 const junctionFor=(car:typeof cars[number])=>car.freeDriven||car.index===rider.index?-1:car.distance<10&&nodes[car.from].links.length>2?car.from:car.length-car.distance<10&&nodes[car.to].links.length>2?car.to:-1;
 function update(dt:number,player:{x:number;y:number;z:number},interaction?:{vx:number;vz:number;reduced:boolean;onCrash:()=>void;drive?:{x:number;z:number}}){stats.trafficChecks=stats.deferredDecisions=0;for(const [node,index] of junctionOwners)if(junctionFor(cars[index])!==node)junctionOwners.delete(node);for(const car of cars){const node=junctionFor(car);if(node>=0&&!junctionOwners.has(node))junctionOwners.set(node,car.index);}rider.landingAge+=Math.max(0,dt);rider.boostTime=Math.max(0,rider.boostTime-dt);rider.boostCooldown=Math.max(0,rider.boostCooldown-dt);const drive=interaction?.drive,driveAmount=drive?Math.min(1,Math.hypot(drive.x,drive.z)):0;if(driveAmount<.15)rider.waitForNeutral=false;for(const car of cars){car.crashAge+=Math.max(0,dt);
  if(car.index===rider.index){car.rejoin=null;car.rejoinAttempted=false;car.rejoinSearch=null;freeDrive(car,Math.min(.05,Math.max(0,dt)),drive,driveAmount,interaction?.reduced??false);continue;}
  if(car.freeDriven){resumeRoaming(car,Math.min(.05,Math.max(0,dt)),interaction?.reduced??false);continue;}
  const progress=Math.min(1,car.distance/Math.max(.01,car.length)),pos=car.routeSamples.sample(progress,routePosition),direction=tangents.sample(car.path,progress,routeTangent),dx=player.x-pos.x,dz=player.z-pos.z,ahead=dx*direction.x+dz*direction.z,lateral=Math.abs(dx*direction.z-dz*direction.x);
  const speed=Math.hypot(interaction?.vx??0,interaction?.vz??0),headOn=interaction&&speed>4&&(interaction.vx*direction.x+interaction.vz*direction.z)/speed<-.5;
  if(car.index!==rider.index&&dt>0&&headOn&&player.y<2.4&&ahead>0&&ahead<3.9&&lateral<1.65&&car.crashAge>6){
   car.crashAge=0;const text=comments[(car.index*3+car.crashes++)%comments.length];car.group.userData.driverComment=text;car.group.userData.crashes=car.crashes;const ctx=car.canvas.getContext('2d')!;ctx.clearRect(0,0,768,192);ctx.fillStyle='#fff8e5';ctx.strokeStyle='#315845';ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(6,6,756,158,28);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(366,162);ctx.lineTo(384,190);ctx.lineTo(402,162);ctx.fill();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 40px sans-serif';ctx.fillStyle='#315845';if(ctx.measureText(text).width<700)ctx.fillText(text,384,84);else{const words=text.split(' '),half=Math.ceil(words.length/2);ctx.fillText(words.slice(0,half).join(' '),384,57);ctx.fillText(words.slice(half).join(' '),384,111);}car.texture.needsUpdate=true;interaction.onCrash();
  }
  const visitor=rider.index<0&&player.y<2.4&&ahead>-.5&&ahead<9&&lateral<2.5;
  car.decisionAge+=dt;
  // Only distant ordinary traffic defers yielding decisions; positions keep moving each frame.
  // Pickups and controlled/rejoining trucks keep their immediate interaction path.
  if(car.pickup||dx*dx+dz*dz<10000||car.decisionAge>=.1||dt===0){
   car.decisionAge=0;stats.trafficChecks++;car.trafficWaiting=false;
   for(const other of cars){if(other===car)continue;const ox=other.group.position.x-pos.x,oz=other.group.position.z-pos.z;if(ox*ox+oz*oz>64||overlapsCar(car,other))continue;
    const forward=ox*direction.x+oz*direction.z,side=Math.abs(ox*direction.z-oz*direction.x);
    if(forward>0&&forward<7&&side<2.3&&(Math.sin(other.group.rotation.y)*direction.x+Math.cos(other.group.rotation.y)*direction.z>.4||other.index<car.index)){car.trafficWaiting=true;break;}
   }
  }else stats.deferredDecisions++;
  const traffic=car.trafficWaiting;
  const controlled=car.index===rider.index,throttle=controlled?(rider.waitForNeutral?0:driveAmount):1;const junction=junctionFor(car),junctionWaiting=junction>=0&&junctionOwners.get(junction)!==car.index;const waiting=visitor||traffic||junctionWaiting||car.crashAge<2.2||throttle<.15;if(!waiting){const proposed=car.distance+Math.min(.05,Math.max(0,dt))*(controlled?7.5:car.speed)*throttle,t=Math.min(1,proposed/Math.max(.01,car.length));car.routeSamples.sample(t,routePosition);tangents.sample(car.path,t,routeTangent);if(trafficClear(car,routePosition.x,routePosition.z,Math.atan2(routeTangent.x,routeTangent.z)))car.distance=proposed;}car.group.userData.controlled=controlled;
  if(car.distance>=car.length){const node=nodes[car.to],choices=node.links.filter(id=>id!==car.from),options=controlled?[...node.links]:choices.length?choices:node.links;options.sort((a,b)=>controlled&&drive?((nodes[b].x-node.x)*drive.x+(nodes[b].z-node.z)*drive.z)/Math.hypot(nodes[b].x-node.x,nodes[b].z-node.z)-((nodes[a].x-node.x)*drive.x+(nodes[a].z-node.z)*drive.z)/Math.hypot(nodes[a].x-node.x,nodes[a].z-node.z):(car.visits.get(node.id+':'+a)??0)-(car.visits.get(node.id+':'+b)??0)||((a+car.index)%nodes.length)-((b+car.index)%nodes.length));const next=options[0],key=node.id+':'+next;car.visits.set(key,(car.visits.get(key)??0)+1);car.path=segment(node,nodes[next],car.path.getPointAt(1));car.routeSamples=createTrafficRouteSamples(car.path);car.from=node.id;car.to=next;car.distance=0;car.length=car.path.getLength();}
  const t=Math.min(1,car.distance/Math.max(.01,car.length)),p=car.routeSamples.sample(t,routePosition),tangent=tangents.sample(car.path,t,routeTangent);car.group.position.copy(p);car.group.rotation.y=Math.atan2(tangent.x,tangent.z);car.group.rotation.z=interaction?.reduced?0:Math.sin(car.crashAge*30)*Math.exp(-car.crashAge*5)*.15;car.group.position.y=interaction?.reduced?0:Math.sin(Math.min(1,car.crashAge/.4)*Math.PI)*.12;if(car.index===rider.index&&!interaction?.reduced&&rider.landingAge<.9){const t=rider.landingAge;car.group.position.y-=Math.sin(t*18)*Math.exp(-t*5)*.09;car.group.rotation.z+=Math.sin(t*23)*Math.exp(-t*5)*.045;}car.speech.visible=car.crashAge<4.5;car.group.userData.waiting=waiting;car.group.userData.roadFrom=car.from;car.group.userData.roadTo=car.to;car.obstacle.x=p.x;car.obstacle.z=p.z;car.obstacle.w=Math.abs(tangent.x)*(car.pickup?4.5:3.6)+Math.abs(tangent.z)*(car.pickup?2.1:1.9);car.obstacle.d=Math.abs(tangent.z)*(car.pickup?4.5:3.6)+Math.abs(tangent.x)*(car.pickup?2.1:1.9);
 }}
 update(0,{x:0,y:99,z:0});
 return {stats,tangentStats:tangents.stats,root,cars,nodes,rider,boost,bedAt,bedPoint,overTruck,landingTruckAt,touchdown,updateLandingIndicator,update,dispose(){pickupMarkers.forEach(p=>p.glow.dispose());landingGlowAssets.dispose();for(const car of cars){const index=obstacles.indexOf(car.obstacle);if(index>=0)obstacles.splice(index,1);}root.removeFromParent();speechTextures.forEach(t=>t.dispose());geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
