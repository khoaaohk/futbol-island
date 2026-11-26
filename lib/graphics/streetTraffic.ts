import {createTruckRampPose} from '../town/truckRampPose';
import type {RideRamp} from '../town/rideRamps';
import {truckGoalClear} from '../town/truckCollisions';
import {recordExploreActivity} from '../town/exploreActivity';
import {canSeparateVehicle,vehicleOverlap,type VehicleFootprint} from '../town/trafficSeparation';
import {createTrafficRouteSamples} from '../town/trafficRouteSamples';
import {TRAVEL_MODES} from '../town/travelModes';
import * as T from 'three';
import {characterStyle} from './characterStyle';
import {createTruckLandingGlowAssets} from './truckLandingGlow';
import {buildRoadNetwork,type TrafficRoad,type RoadNode} from '../town/roadNetwork';
import {blocked,type Obstacle} from '../town/simulation';
import {createObstacleGrid} from '../town/obstacleGrid';
import {findTruckRoadRoute,truckRoadRouteSearch} from '../town/truckNavigation';
import {extendRoadNetworkWithCay} from '../town/cayTraffic';
import {DRIVE,stopSpeed,stepSpeed,turnSpeed,personStopGap,personInLane} from '../town/trafficDriving';
import {signalLight,signalStop,signalledNodes,type SignalHead,type SignalAxis} from '../town/trafficSignals';
import {buildVehicleGeometry,createVehicleMaterial,CAR_STYLES,WHEEL_RADIUS} from './trafficVehicles';
import {createTrafficSignalLamps} from './trafficSignalLamps';
import {elevationOn,groundLift} from '../town/elevation';
import {townDepthOn} from '../town/townDepth';
/** A townsperson the traffic stops for: anything with a position (islandNpcs.entries). */
export type TrafficPerson={position:{x:number;y:number;z:number}};
/** Stop line: STOP_ZONE metres before a route's end. Routes end TURN_MARGIN short of the node, so a waiting vehicle's centre is
 *  10.5 m from the junction centre and its nose about 2 m short of the crossing stripes. A vehicle that has the box keeps it until
 *  it is LEAVE_CLEAR metres past the end of its turn (6.5 m past the centre going straight on, its tail clear of the crossing
 *  lanes). Letting go sooner (a flat 8 m of route) locked the island within minutes once the stop lines moved this close. */
const STOP_ZONE=5.5,LEAVE_CLEAR=1.5,TURN_MARGIN=5,LANE=2,MAX_YAW_RATE=2.2,LAMP_RANGE=130;
/** Nine cars (two start at Coral Cay's end of the causeway: the roundabout's west arm and the boulevard; the causeway itself is
 *  one road link, so no node sits on it) and two collectible pickup trucks navigate the authored road graph, yielding to visitors and traffic.
 *  Nov 18 2026: every vehicle has a speed that eases toward the lowest of its limits (lib/town/trafficDriving.ts), keeps a
 *  following distance, slows for bends, stops for people and obeys the traffic lights (lib/town/trafficSignals.ts). Each vehicle
 *  is one merged mesh (lib/graphics/trafficVehicles.ts); all signal lamps are one instanced draw (trafficSignalLamps.ts). */
export function createStreetTraffic(scene:T.Scene,obstacles:Obstacle[],roads:TrafficRoad[],ramps:RideRamp[]=[],signalHeads:readonly SignalHead[]=[]){
 const comments=["Watch where you're going!","Dude, come on!","Are you blind?","Hey! Eyes on the road!","Easy! This is not a racetrack!","Whoa! Give me some room!","I was right here!","Careful with the paint!","Brakes! Try the brakes!","You good? That was a bump!","My car is not a football!","A little space, please!","Come on, I just washed this!","Wrong way, my friend!","Save the tackles for the pitch!","Whoa there, island racer!","Next time, go around!","That is one way to say hello!"];
 const speechTextures:T.Texture[]=[];
 const root=new T.Group();root.name='island-street-cars';scene.add(root);
 const geometry:T.BufferGeometry[]=[],materials:T.Material[]=[];
 const nodes=buildRoadNetwork(roads),usedStarts=new Set<number>();
 // Coral Cay (Sep 29 2026): the winding causeway and a one-way roundabout join the graph; `forbidden` keeps cars from
 // going the wrong way round the ring (lib/town/cayTraffic.ts).
 const cayTraffic=extendRoadNetworkWithCay(nodes),forbidden=cayTraffic?.forbidden??new Set<string>();
 // Routes (Nov 18 2026): a lane 2 m right of the centre line, joined to the previous route by a cubic that leaves along the old
 // heading and arrives along the new one. Straight on is a straight line, a right turn a 3 m arc round the kerb, a left turn a wide
 // arc across the junction, a dead end a U-turn: the heading never snaps (it used to kink ~34 degrees at both ends of every join).
 const joinFrom=new T.Vector3();
 const segment=(from:RoadNode,to:RoadNode,start?:T.Vector3,heading?:{x:number;z:number})=>{
  const curve=new T.CurvePath<T.Vector3>();let entry:T.Vector3,ex:number,ez:number,rest:T.Curve<T.Vector3>;
  const lane=cayTraffic?.laneCurve(from.id,to.id);
  if(lane){const points=lane.map(p=>new T.Vector3(p.x,0,p.z));entry=points[0];ex=points[1].x-entry.x;ez=points[1].z-entry.z;rest=new T.CatmullRomCurve3(points,false,'centripetal');}
  else{const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz),x=dx/length,z=dz/length,margin=Math.min(TURN_MARGIN,length*.25);entry=new T.Vector3(from.x+x*margin-z*LANE,0,from.z+z*margin+x*LANE);ex=x;ez=z;
   // A sharp turn with little room (a right turn, a U-turn, the roundabout's entries) finishes a little further down the new lane.
   if(start){const room=joinFrom.copy(start).setY(0).distanceTo(entry),hl=heading?Math.hypot(heading.x,heading.z)||1:1;if(room<6&&(heading?(heading.x*x+heading.z*z)/hl:1)<.6){const slide=Math.min(length-margin*2-.3,6-room);if(slide>0){entry.x+=x*slide;entry.z+=z*slide;}}}
   rest=new T.LineCurve3(entry,new T.Vector3(to.x-x*margin-z*LANE,0,to.z-z*margin+x*LANE));}
  let turnLength=0,turnAngle=0;
  if(start&&start.distanceTo(entry)>.05){const l=Math.hypot(ex,ez)||1,ux=ex/l,uz=ez/l,hl=heading?Math.hypot(heading.x,heading.z)||1:1,hx=heading?heading.x/hl:ux,hz=heading?heading.z/hl:uz,gx=entry.x-start.x,gz=entry.z-start.z;
   // Handles: where the old heading's line and the new lane's line cross there is a corner; fit the arc that touches both lines
   // (a straight run first on the longer side). Otherwise (straight on, a U-turn, an S) both handles are 0.4 of the gap.
   let a=Math.min(6,Math.hypot(gx,gz)*.4),b=a;const det=hx*uz-hz*ux;
   if(det>.05||det<-.05){const t1=(gx*uz-gz*ux)/det,t2=(hx*gz-hz*gx)/det;if(t1>.2&&t2>.2){const reach=t1<t2?t1:t2,angle=Math.acos(T.MathUtils.clamp(hx*ux+hz*uz,-1,1)),k=4/3*Math.tan(angle/4)*reach/Math.tan(angle/2);a=t1-reach+k;b=t2-reach+k;}}
   const join=new T.CubicBezierCurve3(start.clone().setY(0),new T.Vector3(start.x+hx*a,0,start.z+hz*a),new T.Vector3(entry.x-ux*b,0,entry.z-uz*b),entry.clone());
   curve.add(join);turnLength=join.getLength();turnAngle=-Math.atan2(hx*uz-hz*ux,hx*ux+hz*uz);}
  curve.add(rest);return {curve,turnLength,turnAngle};};
 // Corners and dead ends are guarded too: every turn curve bends through the node centre, so an L-corner's left and
 // right turners cross paths and, unguarded, locked nose to nose with the queue behind them (the reported jam).
 const guarded=nodes.map(n=>{if(cayTraffic?.unguarded.has(n.id))return false;if(n.links.length!==2)return n.links.length>0;const a=nodes[n.links[0]],b=nodes[n.links[1]],ax=a.x-n.x,az=a.z-n.z,bx=b.x-n.x,bz=b.z-n.z;return (ax*bx+az*bz)/(Math.hypot(ax,az)*Math.hypot(bx,bz))>-.95;});
 // Guarded nodes joined by a street shorter than the two 10 m zones share one owner, so a car can never hold one box while waiting
 // for the next one that the other box's owner is heading out of (a two-junction deadlock).
 const box=nodes.map(n=>n.id);const boxOf=(id:number):number=>box[id]===id?id:(box[id]=boxOf(box[id]));
 for(const n of nodes)if(guarded[n.id])for(const id of n.links)if(guarded[id]&&!(cayTraffic?.armBoxes.has(n.id)&&cayTraffic.armBoxes.has(id))&&Math.hypot(nodes[id].x-n.x,nodes[id].z-n.z)<24)box[boxOf(id)]=boxOf(n.id);
 const starts=[[124,-45],[-45,20],[48,90],[124,-140],[218,70],[48,-100],[130,170],[48,-40],[218,110],[516,-159],[560,-159]];
 // Lights: `signalOffset[node]` is the node's cycle offset, -1 where no lights run the junction (corners have no heads; the
 // roundabout and the cay have none).
 const signalOffset=signalledNodes(nodes,signalHeads);if(cayTraffic){for(const id of cayTraffic.ring)signalOffset[id]=-1;signalOffset[cayTraffic.spurEnd]=-1;}
 // Two junctions close enough to share one box (under 24 m) run as one set of lights: the same cycle, and the short street between
 // them has no stop line of its own (a car stopped there would hold the shared box against the car behind it).
 for(const n of nodes)if(signalOffset[n.id]>=0&&signalOffset[boxOf(n.id)]>=0)signalOffset[n.id]=signalOffset[boxOf(n.id)];
 // Nov 24 2026 (owner: "fix this light ... it's just blinking yellow", the corner by Pier Bakery): nothing flashes yellow any more,
 // kids read it as broken. lib/town/world.ts hangs heads only at junctions with three or more streets and none over the short street
 // inside a shared box, so every head the game passes runs its junction's cycle. A head whose node has no lights (a tool's or test's
 // own heads) stays dark (-1) rather than flashing.
 const lamps=signalHeads.length?createTrafficSignalLamps(scene,signalHeads):null,headNode=signalHeads.map(h=>{const n=nodes.find(n=>Math.abs(n.x-h.jx)<.6&&Math.abs(n.z-h.jz)<.6);return !n||signalOffset[n.id]<0?-1:n.id;});
 let clock=0,lampTick=-1;
 // The lamp draw is skipped (and nothing is painted or uploaded) while no signal is within LAMP_RANGE of the visitor: from Coral Cay,
 // the stadium or the far beaches the whole town's lamps would otherwise be one more draw that the old per-chunk lenses never cost.
 const lampSites=signalHeads.filter((h,i)=>signalHeads.findIndex(o=>o.jx===h.jx&&o.jz===h.jz)===i).map(h=>({x:h.jx,z:h.jz}));
 const paintLamps=(x:number,z:number)=>{if(!lamps)return;let near=false;for(const site of lampSites){const dx=site.x-x,dz=site.z-z;if(dx*dx+dz*dz<LAMP_RANGE*LAMP_RANGE){near=true;break;}}lamps.mesh.visible=near;if(!near)return;let changed=false;for(let i=0;i<signalHeads.length;i++){const node=headNode[i];if(lamps.set(i,node>=0?signalLight(clock,signalOffset[node],signalHeads[i].axis):-1))changed=true;}if(changed)lamps.commit();};
 const glow={head:.12,tail:.06};
 const cars=['#bb6857','#638d9c','#d9b563','#7eaa81','#ab8eaf','#e1b796','#6a919e','#319c8c','#efad45',...(cayTraffic?['#6fa7c9','#c77d9d']:[])].map((color,i)=>{const group=new T.Group();group.name='street-car-'+i;group.rotation.order='YXZ';root.add(group);
  const pickup=i===7||i===8;if(pickup)group.name='matchday-pickup-'+(i-7);
  // Bean riders (lane F, docs/bean-characters/CONTRACT.md): the rig sits with its hips .44 m above the bed point
  // and its soles .12 m below it. The bean's round bottom is .31 m up, so it gets a cooler to sit on ('pickup-cooler-seat'), and the bed
  // floor drops .12 m so the boots rest on it instead of inside it. The bed point (rider, coins, landing) is unchanged.
  const beanBed=characterStyle()==='bean';
  const shape=buildVehicleGeometry(CAR_STYLES[i],color,{bedY:beanBed?.8:.92,coolerSeat:beanBed,variant:i-7}),look=createVehicleMaterial();geometry.push(shape);materials.push(look.material);
  const body=new T.Mesh(shape,look.material);body.name=pickup?'pickup-body':'car-body';body.castShadow=body.receiveShadow=true;body.matrixAutoUpdate=false;group.add(body);look.lamp.set(glow.head,glow.tail,0,0);
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;speechTextures.push(texture);const speechMaterial=new T.SpriteMaterial({map:texture,depthTest:true,depthWrite:false});materials.push(speechMaterial);const speech=new T.Sprite(speechMaterial);speech.name='driver-reaction';speech.position.set(0,3.8,0);speech.scale.set(9,2.25,1);speech.visible=false;group.add(speech);
  const obstacle={dynamic:true,x:0,z:0,w:pickup?2.1:1.9,d:pickup?4.5:3.6};obstacles.push(obstacle);const from=nodes.filter(n=>n.links.length&&!usedStarts.has(n.id)).sort((a,b)=>Math.hypot(a.x-starts[i][0],a.z-starts[i][1])-Math.hypot(b.x-starts[i][0],b.z-starts[i][1]))[0];usedStarts.add(from.id);const startLinks=from.links.filter(id=>!forbidden.has(from.id+':'+id)),to=nodes[(startLinks.length?startLinks:from.links)[i%(startLinks.length||from.links.length)]],first=segment(from,to),path=first.curve;
  return{rampPose:createTruckRampPose(ramps),pickup,index:i,group,obstacle,speech,canvas,texture,look,halfLength:pickup?2.25:1.8,freeDriven:false,driveSpeed:0,rejoin:null as ReturnType<typeof findTruckRoadRoute>,rejoinAttempted:false,rejoinSearch:null as ReturnType<typeof truckRoadRouteSearch>|null,crashAge:99,crashes:0,from:from.id,to:to.id,next:-1,path,routeSamples:createTrafficRouteSamples(path),decisionAge:0,trafficWaiting:false,length:path.getLength(),distance:0,visits:new Map<string,number>(),speed:pickup?4.2:5.8+i*.25,
   /** Current speed along the route, m/s. */v:0,/** Unit heading on the ground. */dirX:0,dirZ:1,
   /** The join at the start of this route: its length and the speed to take it at; the speed to leave this route at. */turnLength:0,turnSpeed:99,turnAngle:0,outSpeed:99,outAngle:0,
   /** How far along this route the vehicle is still "leaving the box" of the node behind it. */leaveZone:STOP_ZONE,axis:'z' as SignalAxis,signalNode:-1,
   /** Room to the vehicle ahead (m, bumper to bumper less the standing gap) and its speed; refreshed by the yielding scan. */gap:Infinity,leadV:0,
   /** Room to a townsperson in the lane, how long one has held this driver, and metres left of edging past. */peopleGap:Infinity,peopleAge:i*.009,peopleWait:0,peopleIgnore:0,
   /** Look and feel: wheel spin (rad), steer, body pitch (a spring) and roll, last heading. */spin:0,steer:0,pitch:0,pitchV:0,roll:0,yaw:0,yawRate:0,accel:0,
   /** Waiting at a stop line for a box or a light (nobody gives way to a vehicle that is itself waiting outside the junction). */held:false,/** The box this vehicle wants and since when (traffic clock): boxes are handed out first come, first served. */wantBox:-1,wantSince:0,boxNow:-1,junctionNow:-1,
   /** No other vehicle within 14 m at the last yielding scan: the footprint check has nothing to test. */alone:false};
 });

 type Car=typeof cars[number];
 const TAU=Math.PI*2,routePosition=new T.Vector3(),routeTangent=new T.Vector3();
 /** Where a vehicle goes after `node`: the least-used way on that is allowed (never straight back unless it is a dead end). */
 const choose=(car:Car,node:RoadNode,cameFrom:number)=>{const allowed=node.links.filter(id=>!forbidden.has(node.id+':'+id)),onward=allowed.filter(id=>id!==cameFrom),options=onward.length?onward:allowed.length?allowed:node.links.slice();
  options.sort((a,b)=>(car.visits.get(node.id+':'+a)??0)-(car.visits.get(node.id+':'+b)??0)||((a+car.index)%nodes.length)-((b+car.index)%nodes.length));const next=options[0],key=node.id+':'+next;car.visits.set(key,(car.visits.get(key)??0)+1);return next;};
 /** Put a vehicle on the street from -> to (joined smoothly from `start`/`heading` when given) and plan the turn after it, so it
  *  can slow down and indicate before it gets there. All the per-route numbers are worked out here, once. */
 function setRoute(car:Car,from:RoadNode,to:RoadNode,start?:T.Vector3,heading?:{x:number;z:number}){
  const route=segment(from,to,start,heading);car.path=route.curve;car.routeSamples=createTrafficRouteSamples(route.curve);car.length=route.curve.getLength();car.distance=0;car.from=from.id;car.to=to.id;
  car.turnLength=route.turnLength;car.turnAngle=route.turnAngle;car.turnSpeed=turnSpeed(car.speed,route.turnAngle);
  car.next=choose(car,to,from.id);const after=nodes[car.next],ox=after.x-to.x,oz=after.z-to.z;car.routeSamples.tangent(1,routeTangent);
  car.outAngle=-Math.atan2(routeTangent.x*oz-routeTangent.z*ox,routeTangent.x*ox+routeTangent.z*oz);car.outSpeed=turnSpeed(car.speed,car.outAngle);
  car.axis=Math.abs(to.x-from.x)>Math.abs(to.z-from.z)?'x':'z';car.signalNode=signalOffset[to.id]>=0&&boxOf(from.id)!==boxOf(to.id)?to.id:-1;
  // On a street too short for two full boxes the first one is let go early, so a car waiting at the far stop line never holds it.
  const leave=(route.turnLength>0?route.turnLength:STOP_ZONE)+LEAVE_CLEAR;car.leaveZone=car.length>=leave+STOP_ZONE+.5||!guarded[to.id]||boxOf(from.id)===boxOf(to.id)?leave:Math.max(0,car.length-STOP_ZONE-.5);
  car.gap=car.peopleGap=Infinity;car.leadV=0;
 }
 for(const car of cars){setRoute(car,nodes[car.from],nodes[car.to]);car.routeSamples.sample(0,routePosition);car.routeSamples.tangent(0,routeTangent);car.group.position.copy(routePosition);car.dirX=routeTangent.x;car.dirZ=routeTangent.z;car.yaw=car.group.rotation.y=Math.atan2(routeTangent.x,routeTangent.z);
  car.obstacle.x=routePosition.x;car.obstacle.z=routePosition.z;car.obstacle.w=Math.abs(car.dirX)*car.halfLength*2+Math.abs(car.dirZ)*(car.pickup?2.1:1.9);car.obstacle.d=Math.abs(car.dirZ)*car.halfLength*2+Math.abs(car.dirX)*(car.pickup?2.1:1.9);}
 const landingGlowAssets=createTruckLandingGlowAssets();
 const pickupMarkers=cars.filter(c=>c.pickup).map(car=>{const glow=landingGlowAssets.create();car.group.add(glow.root);return{car,glow};});
 const rider={index:-1,landingAge:99,waitForNeutral:false,boostTime:0,boostCooldown:0};
 const boost=()=>{if(rider.index>=0&&rider.boostCooldown<=0){rider.boostTime=1.4;rider.boostCooldown=2.2;rider.waitForNeutral=false;}};
 const touchdown=(index:number)=>{recordExploreActivity('truck');rider.index=index;rider.landingAge=0;rider.waitForNeutral=true;cars[index].group.userData.landings=(cars[index].group.userData.landings??0)+1;};
 const overTruck=(x:number,z:number)=>cars.find(c=>{if(!c.pickup)return false;const dx=x-c.group.position.x,dz=z-c.group.position.z,yaw=c.group.rotation.y;return Math.abs(dx*Math.cos(yaw)-dz*Math.sin(yaw))<1.15&&Math.abs(dx*Math.sin(yaw)+dz*Math.cos(yaw))<2.35;});
 // A generous local footprint works on turns too; select the closest eligible pickup.
 const pickupNear=(x:number,z:number,halfWidth:number,halfLength:number)=>{let selected:typeof cars[number]|undefined,best=Infinity;for(const c of cars){if(!c.pickup)continue;const dx=x-c.group.position.x,dz=z-c.group.position.z,yaw=c.group.rotation.y,side=dx*Math.cos(yaw)-dz*Math.sin(yaw),along=dx*Math.sin(yaw)+dz*Math.cos(yaw),distance=dx*dx+dz*dz;if(Math.abs(side)<halfWidth&&Math.abs(along)<halfLength&&distance<best){selected=c;best=distance;}}return selected;};
 const landingTruckAt=(x:number,z:number)=>{const c=pickupNear(x,z,8,8);return c&&Math.hypot(x-c.group.position.x,z-c.group.position.z)<=8?c:undefined;};
 const bedOffset=new T.Vector3();
 const bedPoint=(index:number)=>{const c=cars[index];bedOffset.set(0,.98,-.95).applyEuler(c.group.rotation).add(c.group.position);return{x:bedOffset.x,y:bedOffset.y,z:bedOffset.z};};
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
  const pose=car.rampPose.update(car.group.position.x,car.group.position.z,yaw,dt);
  car.group.rotation.order='YXZ';car.group.rotation.y=yaw;car.group.rotation.x=pose.pitch;car.group.rotation.z=0;car.group.position.y=pose.height;
  if(!reduced&&rider.landingAge<.9){const t=rider.landingAge;car.group.position.y-=Math.sin(t*18)*Math.exp(-t*5)*.09;car.group.rotation.z=Math.sin(t*23)*Math.exp(-t*5)*.045;}
  car.obstacle.x=car.group.position.x;car.obstacle.z=car.group.position.z;car.obstacle.w=Math.abs(Math.sin(yaw))*4.5+Math.abs(Math.cos(yaw))*2.1;car.obstacle.d=Math.abs(Math.cos(yaw))*4.5+Math.abs(Math.sin(yaw))*2.1;
  // Wheels turn and steer while driven too; the tail lamps brighten when the truck is held still.
  let turned=yaw-car.yaw;if(turned>Math.PI)turned-=TAU;else if(turned<-Math.PI)turned+=TAU;car.yaw=yaw;car.dirX=Math.sin(yaw);car.dirZ=Math.cos(yaw);car.v=0;car.held=false;
  if(dt>0){car.spin=(car.spin+distance/WHEEL_RADIUS)%TAU;const steer=T.MathUtils.clamp(turned/dt*2.1/Math.max(Math.abs(car.driveSpeed),1.5),-.5,.5);car.steer+=(steer-car.steer)*Math.min(1,dt*10);car.look.wheel.set(Math.cos(car.spin),Math.sin(car.spin),0,car.steer);car.look.lamp.set(glow.head,car.driveSpeed===0?1.7:glow.tail,0,0);}
  car.speech.visible=false;car.group.userData.controlled=car.index===rider.index;car.group.userData.waiting=car.driveSpeed===0;
 }
 function resumeRoaming(car:typeof cars[number],dt:number,reduced:boolean){
  if(!car.rejoinAttempted){car.rejoinAttempted=true;const trafficObstacles=new Set(cars.map(c=>c.obstacle));car.rejoinSearch=truckRoadRouteSearch({x:car.group.position.x,z:car.group.position.z},nodes,(a,b)=>{const distance=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(distance));for(let i=1;i<=steps;i++){const x=T.MathUtils.lerp(a.x,b.x,i/steps),z=T.MathUtils.lerp(a.z,b.z,i/steps);if(blocked(x,z,drivingGrid.query(x,z,3).filter(o=>!trafficObstacles.has(o as typeof car.obstacle)),2.35))return false;}return true;});}
  if(car.rejoinSearch){const next=car.rejoinSearch.next();if(next.done){car.rejoin=next.value;car.rejoinSearch=null;}}
  const target=car.rejoin?.points[0];if(!target){freeDrive(car,dt,undefined,0,reduced);return;}
  const dx=target.x-car.group.position.x,dz=target.z-car.group.position.z,distance=Math.hypot(dx,dz);
  // Slow down at each bend; the same swept collision checks apply off-road.
  freeDrive(car,dt,{x:dx,z:dz},Math.min(.55,distance/3),reduced);
  if(distance<.65){car.rejoin!.points.shift();if(!car.rejoin!.points.length){const node=nodes[car.rejoin!.node],links=node.links.filter(id=>!forbidden.has(node.id+':'+id)),pick=links.length?links:node.links,to=nodes[pick[car.index%pick.length]];/* honour the roundabout's one-way rule (code review finding 7) */const yaw=car.group.rotation.y;setRoute(car,node,to,car.group.position,{x:Math.sin(yaw),z:Math.cos(yaw)});car.group.rotation.x=car.group.rotation.z=0;car.group.position.y=0;car.freeDriven=false;car.rejoin=null;car.rejoinAttempted=false;}}
 }

 const stats={trafficChecks:0,deferredDecisions:0};
 // Hold a junction until the owner clears its turn; waiting cars stay outside it.
 const junctionOwners=new Map<number,number>(),boxClaims=new Map<number,number>();
 const leaving=(car:Car)=>car.distance<car.leaveZone&&guarded[car.from];
 /** The box a roaming vehicle is leaving, or the one ahead once it is close enough that braking for its stop line would have to begin. */
 const approachBox=(car:Car)=>car.freeDriven||car.index===rider.index?-1:leaving(car)?boxOf(car.from):car.length-car.distance<STOP_ZONE+2+car.v*car.v/(2*DRIVE.brake)&&guarded[car.to]?boxOf(car.to):-1;
 /** Red, or a yellow it can stop for comfortably: the vehicle may not take the box and waits at the stop line. Past the line it clears. */
 const heldByLight=(car:Car)=>car.signalNode>=0&&!leaving(car)&&signalStop(signalLight(clock,signalOffset[car.signalNode],car.axis),car.length-car.distance-STOP_ZONE,car.v,DRIVE.brake);
 /** Level-crossing barriers on a road (the Island Line's causeway crossing, train Phase 3): while `closed`, a vehicle heading for the
  *  point (within BARRIER_LOOK m ahead, BARRIER_HALF m of its lane) stops BARRIER_GAP m short of it. Town writes `closed` (no per-frame cost when open). */
 const barriers:{x:number;z:number;closed:boolean}[]=[],BARRIER_LOOK=40,BARRIER_HALF=6,BARRIER_GAP=7.5;
 function update(dt:number,player:{x:number;y:number;z:number},interaction?:{vx:number;vz:number;reduced:boolean;onCrash:()=>void;drive?:{x:number;z:number};people?:readonly TrafficPerson[]}){stats.trafficChecks=stats.deferredDecisions=0;
  const step=Math.min(.05,Math.max(0,dt));if(step>0){clock+=step;const tick=Math.floor(clock*5);if(tick!==lampTick){lampTick=tick;paintLamps(player.x,player.z);}}
  // Each vehicle's box is worked out once per frame (`boxNow`: the box it is in or needs; `junctionNow`: the same unless a light
  // holds it), then used to release, to claim and, below, to decide who waits. A free box goes to whoever has wanted it longest
  // (first come, first served; the lower index on a tie): handing it to the lowest index let a stream of cars starve a waiting truck.
  for(const car of cars){const box=car.boxNow=approachBox(car),node=car.junctionNow=box>=0&&heldByLight(car)?-1:box;if(node<0)car.wantBox=-1;else if(car.wantBox!==node){car.wantBox=node;car.wantSince=clock;}}
  for(const [node,index] of junctionOwners)if(cars[index].junctionNow!==node)junctionOwners.delete(node);
  for(const car of cars){const node=car.junctionNow;if(node<0||junctionOwners.has(node))continue;const rival=boxClaims.get(node);if(rival===undefined||car.wantSince<cars[rival].wantSince)boxClaims.set(node,car.index);}
  if(boxClaims.size){for(const [node,index] of boxClaims)junctionOwners.set(node,index);boxClaims.clear();}
  rider.landingAge+=Math.max(0,dt);rider.boostTime=Math.max(0,rider.boostTime-dt);rider.boostCooldown=Math.max(0,rider.boostCooldown-dt);const drive=interaction?.drive,driveAmount=drive?Math.min(1,Math.hypot(drive.x,drive.z)):0;if(driveAmount<.15)rider.waitForNeutral=false;
  const reduced=interaction?.reduced??false,people=interaction?.people,vx=interaction?.vx??0,vz=interaction?.vz??0,playerSpeed=Math.hypot(vx,vz),blinkOn=clock*2.4%1<.5?1.6:0;
  for(const car of cars){car.crashAge+=Math.max(0,dt);
  if(car.index===rider.index){car.rejoin=null;car.rejoinAttempted=false;car.rejoinSearch=null;freeDrive(car,step,drive,driveAmount,reduced);continue;}
  if(car.freeDriven){resumeRoaming(car,step,reduced);continue;}
  // Everything below is scalar work on last frame's pose: where the visitor is in this vehicle's frame, then one speed limit per
  // thing ahead. The route is sampled once, for the pose it moves to.
  const position=car.group.position,rotation=car.group.rotation,px=position.x,pz=position.z,dirX=car.dirX,dirZ=car.dirZ,dx=player.x-px,dz=player.z-pz,ahead=dx*dirX+dz*dirZ,sideways=dx*dirZ-dz*dirX,lateral=Math.abs(sideways),near=dx*dx+dz*dz<10000;
  if(interaction&&dt>0&&playerSpeed>4&&(vx*dirX+vz*dirZ)/playerSpeed<-.5&&player.y<2.4&&ahead>0&&ahead<3.9&&lateral<1.65&&car.crashAge>6){
   car.crashAge=0;const text=comments[(car.index*3+car.crashes++)%comments.length];car.group.userData.driverComment=text;car.group.userData.crashes=car.crashes;const ctx=car.canvas.getContext('2d')!;ctx.clearRect(0,0,768,192);ctx.fillStyle='#fff8e5';ctx.strokeStyle='#315845';ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(6,6,756,158,28);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(366,162);ctx.lineTo(384,190);ctx.lineTo(402,162);ctx.fill();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 40px sans-serif';ctx.fillStyle='#315845';if(ctx.measureText(text).width<700)ctx.fillText(text,384,84);else{const words=text.split(' '),half=Math.ceil(words.length/2);ctx.fillText(words.slice(0,half).join(' '),384,57);ctx.fillText(words.slice(half).join(' '),384,111);}car.texture.needsUpdate=true;interaction.onCrash();
  }
  const remaining=car.length-car.distance;let limit=car.speed;
  // Bends: the join at the start of this route, and the turn planned at its end.
  if(car.distance<car.turnLength&&car.turnSpeed<limit)limit=car.turnSpeed;
  if(car.outSpeed<limit){const s=stopSpeed(remaining-1,car.outSpeed);if(s<limit)limit=s;}
  // Junction box and lights: without the box (someone else has it, or the light says stop) the vehicle stops at the line.
  const box=car.boxNow,junctionWaiting=box>=0&&!leaving(car)&&junctionOwners.get(box)!==car.index;
  car.held=junctionWaiting;if(junctionWaiting){const s=stopSpeed(remaining-STOP_ZONE-.3);if(s<limit)limit=s;}
  // The visitor: in the lane ahead, or walking into it. Truck passengers are not pedestrians.
  const visitor=rider.index<0&&player.y<2.4&&personInLane(ahead,lateral,sideways>0?vz*dirX-vx*dirZ:vx*dirZ-vz*dirX,car.halfLength+DRIVE.personGap+3+car.v*car.v/(2*DRIVE.brake),2.5);
  for(let b=0;b<barriers.length;b++){const br=barriers[b];if(!br.closed)continue;const bx=br.x-px,bz=br.z-pz,fw=bx*dirX+bz*dirZ;if(fw<car.halfLength+1||fw>BARRIER_LOOK)continue;if(Math.abs(bx*dirZ-bz*dirX)>BARRIER_HALF)continue;const s=stopSpeed(Math.max(0,fw-car.halfLength-BARRIER_GAP));if(s<limit)limit=s;}// a closed level crossing
  if(visitor){const s=stopSpeed(personStopGap(ahead,car.halfLength));if(s<limit)limit=s;}
  // Townsfolk in the lane: looked for ten times a second per vehicle within 100 m of the visitor (194 townsfolk on the island:
  // a cheap box reject first; vehicles nobody can see skip it, as they always did).
  if(people&&near){car.peopleAge+=dt;if(car.peopleAge>=.1||dt===0){car.peopleAge=0;let room=Infinity;
    for(let k=0;k<people.length;k++){const q=people[k].position,ex=q.x-px;if(ex>16||ex<-16)continue;const ez=q.z-pz;if(ez>16||ez<-16||q.y>1.6||q.y<-1)continue;const forward=ex*dirX+ez*dirZ;if(forward<-.5||forward>16)continue;const side=ex*dirZ-ez*dirX;if(side<1.5&&side>-1.5){const g=personStopGap(forward,car.halfLength);if(g<room)room=g;}}
    car.peopleGap=room;}
   if(car.peopleIgnore>0){if(limit>1.6)limit=1.6;}
   else if(car.peopleGap<Infinity){const s=stopSpeed(car.peopleGap);if(s<limit)limit=s;if(car.v<.05){car.peopleWait+=dt;if(car.peopleWait>DRIVE.patience){car.peopleIgnore=10;car.peopleWait=0;}}}
   else car.peopleWait=0;}
  else if(car.peopleGap<Infinity)car.peopleGap=Infinity;
  car.decisionAge+=dt;
  // Only distant ordinary traffic defers yielding decisions; positions keep moving each frame.
  // Pickups and controlled/rejoining trucks keep their immediate interaction path.
  if(car.pickup||near||car.decisionAge>=.1||dt===0){
   car.decisionAge=0;stats.trafficChecks++;let room=Infinity,lead=0,alone=true;
   for(const other of cars){if(other===car)continue;const ox=other.group.position.x-px,oz=other.group.position.z-pz;if(ox*ox+oz*oz>196)continue;alone=false;
    const forward=ox*dirX+oz*dirZ;if(forward<=0)continue;const side=ox*dirZ-oz*dirX;if(side>=2.3||side<=-2.3)continue;
    // Same way: follow it, keeping DRIVE.gap behind its bumper. Crossing or oncoming in this lane: the higher index gives way,
    // but never to a vehicle that is itself held at a stop line (it is outside the box; waiting for it locked the roundabout arm).
    const along=other.dirX*dirX+other.dirZ*dirZ;let g:number,v=0;
    if(along>.4){g=forward-car.halfLength-other.halfLength-DRIVE.gap;v=other.freeDriven||other.index===rider.index?0:other.v*along;}else if(other.index<car.index&&forward<10&&!other.held)g=forward-7;else continue;
    if(g<room&&!overlapsCar(car,other)){room=g;lead=v;}
   }
   car.gap=room;car.leadV=lead;car.trafficWaiting=room<=0;car.alone=alone;
  }else stats.deferredDecisions++;
  if(car.gap<Infinity){const s=stopSpeed(car.gap,car.leadV);if(s<limit)limit=s;}
  // A join that bends harder than a car can turn (the roundabout's spur entry) is taken slowly enough to keep the heading smooth.
  if(car.yawRate>MAX_YAW_RATE||car.yawRate<-MAX_YAW_RATE){const s=car.v*MAX_YAW_RATE/(car.yawRate<0?-car.yawRate:car.yawRate);if(s<limit)limit=s<.8?.8:s;}
  if(car.crashAge<2.2)limit=0;
  const before=car.v;let moved=0;
  if(step>0){car.v=stepSpeed(car.v,limit,step);
   if(car.v>0){const proposed=car.distance+car.v*step,t=Math.min(1,proposed/Math.max(.01,car.length));car.routeSamples.sample(t,routePosition);car.routeSamples.tangent(t,routeTangent);const yaw=Math.atan2(routeTangent.x,routeTangent.z);
    // The footprint check stays the last word: whatever the limits said, no vehicle moves into another.
    if(car.alone||trafficClear(car,routePosition.x,routePosition.z,yaw)){moved=proposed-car.distance;car.distance=proposed;position.x=routePosition.x;position.z=routePosition.z;let turned=yaw-rotation.y;if(turned>Math.PI)turned-=TAU;else if(turned<-Math.PI)turned+=TAU;car.yawRate=turned/step;rotation.y=yaw;car.dirX=routeTangent.x;car.dirZ=routeTangent.z;
     car.obstacle.x=position.x;car.obstacle.z=position.z;car.obstacle.w=Math.abs(routeTangent.x)*(car.pickup?4.5:3.6)+Math.abs(routeTangent.z)*(car.pickup?2.1:1.9);car.obstacle.d=Math.abs(routeTangent.z)*(car.pickup?4.5:3.6)+Math.abs(routeTangent.x)*(car.pickup?2.1:1.9);
     car.gap-=moved;car.peopleGap-=moved;if(car.peopleIgnore>0)car.peopleIgnore-=moved;}
    else{car.v=0;car.yawRate=0;}}
   else car.yawRate=0;
   if(car.distance>=car.length)setRoute(car,nodes[car.to],nodes[car.next],position,{x:car.dirX,z:car.dirZ});
  }
  // Feel (near, drawn vehicles only): pitch under braking and pulling away (a soft spring, so it settles with one small bounce),
  // roll OUT of the bend (the body leans away from the turn: +x is the vehicle's left, a left turn has yawRate > 0 and lifts that
  // side), wheels that spin and steer, brake lamps, indicators before and through a turn. The body pitches and rolls on its
  // wheels: the shader takes the same two angles back out of the wheel vertices, so no tyre sinks into the road or lifts off it.
  let wobble=0,lift=0;if(!reduced&&car.crashAge<2.5){wobble=Math.sin(car.crashAge*30)*Math.exp(-car.crashAge*5)*.15;lift=Math.sin(Math.min(1,car.crashAge/.4)*Math.PI)*.12;}
  if(near&&car.group.visible&&step>0){
   const yawRate=car.yawRate;
   car.accel+=((car.v-before)/step-car.accel)*Math.min(1,step*8);
   if(reduced)car.pitch=car.pitchV=car.roll=0;
   else{const pitch=car.accel*-.008;car.pitchV+=(((pitch>.028?.028:pitch<-.028?-.028:pitch)-car.pitch)*70-car.pitchV*9)*step;car.pitch+=car.pitchV*step;const roll=yawRate*car.v*.012;car.roll+=((roll>.045?.045:roll<-.045?-.045:roll)-car.roll)*Math.min(1,step*7);}
   const steer=yawRate*2.1/(car.v>1.5?car.v:1.5);car.steer+=((steer>.5?.5:steer<-.5?-.5:steer)-car.steer)*Math.min(1,step*10);car.spin=(car.spin+moved/WHEEL_RADIUS)%TAU;
   car.look.wheel.set(Math.cos(car.spin),Math.sin(car.spin),0,car.steer);
   const blink=remaining<24&&(car.outAngle>.5||car.outAngle<-.5)?car.outAngle:car.distance<car.turnLength&&(car.turnAngle>.5||car.turnAngle<-.5)?car.turnAngle:0;
   car.look.lamp.set(glow.head,car.accel<-1||car.v<.05?1.7:glow.tail,blink>0?blinkOn:blink<0?-blinkOn:0,0);
  }else if(car.pitch!==0||car.roll!==0)car.pitch=car.pitchV=car.roll=0;
  rotation.x=car.look.wheel.z=car.pitch;rotation.z=car.look.lamp.w=car.roll+wobble;position.y=lift;
  // Elevation (lib/town/elevation.ts; 0 after one comparison with the flag off): the vehicle stands on the raised road and tips to its grade.
  if(elevationOn()||townDepthOn()/* the sunk carriageway (townDepth.ts) */){const g=groundLift(position.x,position.z);if(g!==0){const sx=Math.sin(rotation.y)*1.6,sz=Math.cos(rotation.y)*1.6;position.y+=g;rotation.x-=Math.atan2(groundLift(position.x+sx,position.z+sz)-groundLift(position.x-sx,position.z-sz),3.2);}}
  car.speech.visible=car.crashAge<4.5;const data=car.group.userData;data.controlled=false;data.waiting=car.v<.05||visitor||junctionWaiting;data.roadFrom=car.from;data.roadTo=car.to;
 }}
 /** Day, sunset or night (Town calls it beside world.updateTrafficSignals): headlamps and tail lamps come on. Emissive only. */
 function setTimeOfDay(mode:string){glow.head=mode==='night'?1.5:mode==='sunset'?.7:.12;glow.tail=mode==='night'?.55:mode==='sunset'?.3:.06;for(const car of cars){car.look.lamp.x=glow.head;car.look.lamp.y=glow.tail;}lamps?.setNight(mode==='night');}
 paintLamps(0,0);update(0,{x:0,y:99,z:0});
 return {barriers,stats,root,cars,nodes,cayTraffic,rider,boost,bedAt,bedPoint,overTruck,landingTruckAt,touchdown,updateLandingIndicator,update,setTimeOfDay,
  /** The lights: heads, which node each belongs to (-1: flashing yellow), per-node cycle offsets (-1: none), the lamp mesh, the clock. */
  signals:{stopZone:STOP_ZONE,heads:signalHeads,headNode,offset:signalOffset,lamps,get clock(){return clock;}},
  dispose(){pickupMarkers.forEach(p=>p.glow.dispose());landingGlowAssets.dispose();lamps?.dispose();for(const car of cars){const index=obstacles.indexOf(car.obstacle);if(index>=0)obstacles.splice(index,1);}root.removeFromParent();speechTextures.forEach(t=>t.dispose());geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
