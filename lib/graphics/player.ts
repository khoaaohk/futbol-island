import {acquireSpineSurfaces,applySpineSurface,LUMBAR_HEIGHT,CHEST_HEIGHT} from './spineSurface';
import {batchRigidMeshes} from './batchMeshes';
import type {JuggleTouch} from '../town/walkBall';
import * as T from 'three';
import type { CharacterCustomization } from '../town/customization';
import type { FlightPose } from './flightMotion';
import type { TravelMode } from '../town/travelModes';
import {createClubCostume} from './clubCostume';
import {inertialResponse,poseResponse} from './poseResponse';
import {strikePose,STRIKE_CONTACT,type StrikePose} from './strikeMotion';
import {createLegContactSolver} from './legContact';
import {sampleMotionReference} from './sampleMotionReference';

export const PLAYER_KICK_CONTACT = STRIKE_CONTACT;
export type PlayerMotion = {
  /** World heading in radians, including while stationary or receiving. */
  facing?: number;
  /** Optional world-space ball attention; supplied only for involved actors. */
  lookX?: number;
  lookZ?: number;
  lookY?: number;
  scanYaw?: number;
  actionKind?: 'pass'|'shot'|'loft';
  /** Upcoming travel direction and remaining distance supplied by the movement owner. */
  intentHeading?: number;
  stopDistance?: number;
  /** Contact centre in rig-local metres, fixed for the committed strike. */
  strikeX?: number;
  strikeZ?: number;
  jockey?: number;
  /** Normalized effort before live-match playback scaling; gait still follows travelled distance. */
  runIntensity?: number;
  keeper?: number;
  keeperReach?: number;
  /** Authored teaching sample: independent of previous playback or seek history. */
  samplePose?: {speed:number;distance:number;heading:number};
  /** Resume after offscreen posing without integrating hidden travel as a sprint. */
  resumePose?: boolean;
  /** Normalized action progress; ball release belongs at PLAYER_KICK_CONTACT. */
  kick?: number;
  /** Repeating keep-up phase, alternating the kicking foot. */
  juggle?: number;
  juggleTouch?: JuggleTouch;
  stunAge?: number;
  shotCharge?: number;
  powerKick?: boolean;
  shotPower?: number;
  shotStep?: number;
  kickSide?: -1 | 1;
  receive?: number;
  /** 0 at first contact, 1 after cushioning; approaches hold 0. */
  receiveProgress?: number;
  dribbling?: boolean;
  travelMode?: TravelMode;
  truckRiding?: boolean;
  truckSpeed?: number;
  flyingCar?: boolean;
  rocketboard?: boolean;
  mopedStand?: number;
  mopedSuperman?: number;
  wallSplat?: boolean;
  parachute?: boolean;
  parachuteJuggle?: {phase:number;side:-1|1};
  parachuteSpin?: number;
  turnSmoothing?: number;
  flight?: FlightPose;
  rooftopPose?: 'hang'|'fall'|'dizzy';
  /** Retreating while facing the ball: short quick toe-first steps, upright, arms out (0..1). */
  backpedal?: number;
  /** Explicit deceleration/stop request from the sim; the rig also infers braking from its own acceleration (0..1). */
  brake?: number;
  /** A hard plant impulse (direction change / stop); decays inside the rig (0..1). */
  plant?: number;
  /** Defensive ready stance (staggered feet, low, arms out) even when still. */
  stance?: 'ready';
};
const smooth = (value: number) => { const t = T.MathUtils.clamp(value, 0, 1); return t * t * (3 - 2 * t); };

/**
 * Body and motion profile per player type. Body fields are joint-GROUP scales only
 * (no new geometry, so playerBatch instancing keeps sharing every mesh); the rest
 * are motion multipliers read by the gait, brake, plant and stance code.
 */
export type PlayerProfile = {
  height: number;   // uniform root scale multiplier, 1 = current (0.94–1.08)
  build: number;    // torso/shoulder width scale (0.9 lean … 1.18 broad)
  legs: number;     // leg length scale applied to hip groups (0.96–1.06); reach clamps follow it
  stride: number;   // stride length multiplier (0.9–1.15)
  cadence: number;  // step frequency multiplier for the same speed (0.9–1.15)
  lean: number;     // forward-lean multiplier at speed (0.8–1.3)
  armSwing: number; // arm swing amplitude multiplier (0.8–1.25)
  agility: number;  // how quickly the body re-plants/turns (0.85 heavy … 1.2 nimble)
  weight: number;   // plant/brake force look: sink, dwell, bounce (0.85 light … 1.25 heavy)
  crouch: number;   // defensive ready-stance depth multiplier (0.8–1.3)
};
export const PROFILE_RANGES: Record<keyof PlayerProfile, [number, number]> = {
  height: [.94, 1.08], build: [.9, 1.18], legs: [.96, 1.06], stride: [.9, 1.15], cadence: [.9, 1.15],
  lean: [.8, 1.3], armSwing: [.8, 1.25], agility: [.85, 1.2], weight: [.85, 1.25], crouch: [.8, 1.3],
};
const IDENTITY_PROFILE: PlayerProfile = { height: 1, build: 1, legs: 1, stride: 1, cadence: 1, lean: 1, armSwing: 1, agility: 1, weight: 1, crouch: 1 };
export const ROLE_PROFILES: Record<'gk'|'def'|'mid'|'fwd'|'you'|'npc', PlayerProfile> = {
  fwd: { height: 1.02, build: .94, legs: 1.04, stride: 1.12, cadence: 1.08, lean: 1.1, armSwing: 1.15, agility: 1.15, weight: .9, crouch: .85 },
  mid: { ...IDENTITY_PROFILE, stride: 1.04, cadence: 1.02, agility: 1.05 },
  def: { height: 1.03, build: 1.14, legs: 1, stride: .98, cadence: .95, lean: .95, armSwing: .95, agility: .92, weight: 1.22, crouch: 1.2 },
  gk: { height: 1.05, build: 1.16, legs: 1.02, stride: .95, cadence: 1, lean: .85, armSwing: .9, agility: 1.1, weight: 1.15, crouch: 1.3 },
  you: { ...IDENTITY_PROFILE },
  npc: { ...IDENTITY_PROFILE },
};
/** Role preset with ±6 % seeded variance per field, clamped to the bible ranges. `you`/`npc` stay identity. */
export function profileFor(role: keyof typeof ROLE_PROFILES, seed: number): PlayerProfile {
  const base = ROLE_PROFILES[role] ?? ROLE_PROFILES.npc, out = { ...base };
  if (role === 'you' || role === 'npc') return out;
  let state = (Math.floor(Math.abs(seed)) * 2654435761 + 97) >>> 0;
  for (const key of Object.keys(PROFILE_RANGES) as (keyof PlayerProfile)[]) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const [low, high] = PROFILE_RANGES[key];
    out[key] = T.MathUtils.clamp(base[key] * (1 + (state / 4294967296 - .5) * .12), low, high);
  }
  return out;
}

// Visual rig only. The lesson remains the authority for world position.
export type PlayerRig = {
  readonly bikeRoll: number;
  readonly rideTurnRoll: number;
  readonly juggleHead: {bottom:number;top:number;front:number;width:number}|undefined;
  /** Root-scale multiplier from the profile; hosts that overwrite root.scale multiply by it. */
  readonly profileScale: number;
  readonly profile: PlayerProfile;
  root: T.Group;
  ballContact: (side:-1|1,out:T.Vector3) => T.Vector3;
  dribbleContact: (out:T.Vector3) => T.Vector3;
  handPositions: (left:T.Vector3,right:T.Vector3) => void;
  setAppearance: (value: CharacterCustomization) => void;
  /** Applies group scales once (no new geometry) and stores the motion multipliers. */
  setProfile: (profile: PlayerProfile) => void;
  update: (x: number, z: number, dt: number, time: number, reduced: boolean, motion?: PlayerMotion) => void;
  dispose: () => void;
};

export function createPlayer(id: string, team: string, mergeRigidParts=true, articulatedHands=true): PlayerRig {
  const root = new T.Group(), pelvis = new T.Group(), torso = new T.Group();pelvis.name='player-pelvis';
  torso.name='armor-torso'; root.add(pelvis); pelvis.position.y = .88; pelvis.add(torso);
  const lumbar=new T.Group(),chest=new T.Group();lumbar.name='player-lumbar';chest.name='player-chest';
  lumbar.position.y=LUMBAR_HEIGHT;chest.position.y=CHEST_HEIGHT-LUMBAR_HEIGHT;torso.add(lumbar);lumbar.add(chest);
  const geometries: T.BufferGeometry[] = [], materials: T.Material[] = [];
  const seed = Array.from(id).reduce((n, c) => n + c.charCodeAt(0), 0);
  const material = (color: string) => { const m = new T.MeshStandardMaterial({ color, roughness: .82 }); materials.push(m); return m; };
  const shirt = material(team === 'home' ? '#edb957' : '#356478');
  const trim = material(team === 'home' ? '#fff4cd' : '#bcd9d3');
  const skin = material(['#a97250', '#d4a17c', '#765039', '#bc8562'][seed % 4]);
  const hair = material(['#302d27', '#574331', '#252828'][seed % 3]);
  const shorts = material('#26453e'), sock = material('#eee6cd'), boot = material('#27342f');
  const mesh = (geometry: T.BufferGeometry, mat: T.Material, parent: T.Group, x = 0, y = 0, z = 0) => {
    geometries.push(geometry); const m = new T.Mesh(geometry, mat); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; m.userData.playerId = id; parent.add(m); return m;
  };
  const ellipsoid = (parent: T.Group, mat: T.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const m = mesh(new T.SphereGeometry(1, 16, 12), mat, parent, x, y, z); m.scale.set(sx, sy, sz); return m;
  };
  const segment = (parent: T.Group, mat: T.Material, length: number, top: number, bottom: number) => mesh(new T.CylinderGeometry(top, bottom, length, 12), mat, parent, 0, -length / 2);
  // An athletic silhouette: tapered waist, broad shoulders and an oval ribcage.
  const spineSurfaces=acquireSpineSurfaces();
  const jersey=new T.Mesh(spineSurfaces.male,shirt);jersey.name='player-jersey';jersey.castShadow=true;jersey.receiveShadow=true;jersey.userData.playerId=id;torso.add(jersey);
  ellipsoid(chest, trim, 0, .49-CHEST_HEIGHT, 0, .115, .028, .085);
  mesh(new T.CylinderGeometry(.063, .073, .11, 12), skin, chest, 0, .535-CHEST_HEIGHT);
  const head = new T.Group(); head.name='player-head';head.position.set(0, .69-CHEST_HEIGHT, .005); chest.add(head);
  ellipsoid(head, skin, 0, 0, 0, .127, .17, .125);
  ellipsoid(head, skin, 0, -.015, .12, .033, .036, .04);
  for (const side of [-1,1]) ellipsoid(head, skin, side * .126, -.008, 0, .026, .044, .029);
  const cap = mesh(new T.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * .52), hair, head, 0, .045, -.01);
  cap.scale.set(.131, seed % 3 === 0 ? .15 : .125, .13);
  const legs: { hip: T.Group; knee: T.Group; ankle: T.Group }[] = [];
  const arms: { shoulder: T.Group; elbow: T.Group; hand:T.Group }[] = [];
  for (const side of [-1,1]) {
    const hip = new T.Group(); hip.name=side<0?'left-hip':'right-hip'; hip.position.set(side * .108, 0, 0); pelvis.add(hip);
    segment(hip, shorts, .23, .108, .095);
    segment(hip, skin, .43, .083, .065);
    const knee = new T.Group(); knee.name=side<0?'left-knee':'right-knee'; knee.position.y = -.43; hip.add(knee);
    ellipsoid(knee, skin, 0, 0, .008, .066, .069, .067);
    segment(knee, skin, .40, .067, .045);
    const stocking = mesh(new T.CylinderGeometry(.063, .043, .27, 12), sock, knee, 0, -.265);
    const ankle = new T.Group(); ankle.name=side<0?'left-ankle':'right-ankle'; ankle.position.y = -.40; knee.add(ankle);
    ellipsoid(ankle, boot, 0, -.025, .062, .071, .054, .145);
    ellipsoid(ankle, trim, side * .058, -.012, .067, .014, .016, .065);
    legs.push({ hip, knee, ankle });
    const shoulder = new T.Group(); shoulder.name=side<0?'left-shoulder':'right-shoulder'; shoulder.position.set(side * .235, .385-CHEST_HEIGHT, 0); chest.add(shoulder);
    ellipsoid(shoulder, shirt, 0, -.055, 0, .094, .125, .092);
    segment(shoulder, skin, .28, .065, .049);
    const elbow = new T.Group(); elbow.name=side<0?'left-elbow':'right-elbow'; elbow.position.y = -.28; shoulder.add(elbow);
    segment(elbow, skin, .255, .051, .035);
    const hand=new T.Group();hand.name=side<0?'left-hand':'right-hand';hand.position.y=-.265;
    if(articulatedHands){elbow.add(hand);ellipsoid(hand,skin,0,0,0,.041,.063,.04);}else ellipsoid(elbow,skin,0,-.265,0,.041,.063,.04);
    shoulder.rotation.z = side * .12; arms.push({ shoulder, elbow, hand });
  }
  const longHair=new T.Group();longHair.name='female-long-hair';head.add(longHair);longHair.visible=false;
  // A low side ponytail stays clear of the jetpack; cheek-length strands frame the face.
  const hairCurve=new T.CatmullRomCurve3([new T.Vector3(.015,.035,-.135),new T.Vector3(.045,-.1,-.19),new T.Vector3(.16,-.29,-.19),new T.Vector3(.205,-.46,-.12)]);
  mesh(new T.TubeGeometry(hairCurve,16,.062,8,false),hair,longHair).name='long-ponytail';
  ellipsoid(longHair,hair,.205,-.46,-.12,.052,.078,.055);
  const tie=ellipsoid(longHair,trim,.035,-.055,-.175,.066,.024,.061);tie.rotation.z=-.18;
  for(const side of [-1,1]){const strand=ellipsoid(longHair,hair,side*.123,-.105,.012,.038,.205,.083);strand.rotation.z=side*.12;}
  const fringe=ellipsoid(longHair,hair,-.035,.115,.072,.115,.045,.075);fringe.rotation.z=-.3;

  const captainBand=mesh(new T.CylinderGeometry(.098,.098,.065,12),trim,arms[0].shoulder,0,-.1);captainBand.visible=false;
  const explorerHat=mesh(new T.CylinderGeometry(.2,.2,.035,16),shorts,head,0,.145);explorerHat.visible=false;
  const stripe=mesh(new T.BoxGeometry(.29,.065,.018),trim,chest,0,.28-CHEST_HEIGHT,.137);stripe.visible=false;
  const jacketZip=mesh(new T.BoxGeometry(.012,.34,.018),trim,lumbar,0,.23-LUMBAR_HEIGHT,.14);jacketZip.visible=false;
  // Only invariant same-material pieces sharing one animated joint are merged.
  // Clothing switches, hair, joint pivots and costume attachments remain independent.
  if(mergeRigidParts)for(const joint of [head,...legs.map(leg=>leg.knee),...arms.map(arm=>arm.elbow)]){
    geometries.push(...batchRigidMeshes(joint));
    for(const child of joint.children)if(child instanceof T.Mesh)child.userData.playerId=id;
  }
  // Body meshes are rigid relative to animated joint groups. Cache only their
  // local matrices; world matrices still follow every joint and parent change.
  const cacheBodyTransforms=()=>root.traverse(object=>{if(object instanceof T.Mesh){object.updateMatrix();object.matrixAutoUpdate=false;}});
  cacheBodyTransforms();
  let juggleHead:{bottom:number;top:number;front:number;width:number}|undefined;
  let costumeId='none',clubCostume:ReturnType<typeof createClubCostume>;
  // Shape = customization × profile. Both are group scales/offsets on existing joints;
  // uniform hip scale avoids shearing the shin when the knee rotates.
  let P:PlayerProfile={...IDENTITY_PROFILE},strideScale=1,profileScale=1,bodyScaleX=1,faceScaleX=1,shoulderX=.235;
  const rootBase=new T.Vector3(1,1,1);
  const applyShape=()=>{
    const build=P.build,depth=1+(build-1)*.5;
    torso.scale.set(bodyScaleX*build,1,depth);
    head.scale.set(faceScaleX/build,1,1/depth);
    arms.forEach((arm,i)=>arm.shoulder.position.x=(i===0?-1:1)*shoulderX*(1+(build-1)*.25));
    for(const leg of legs)leg.hip.scale.setScalar(P.legs);
  };
  const setProfile=(value:PlayerProfile)=>{
    P={...IDENTITY_PROFILE,...value};
    // Speed = step length x step rate, so at one speed the two multipliers trade off. Stride wins
    // half of cadence: at each role's own top speed a forward shows longer AND quicker steps.
    strideScale=P.stride/Math.sqrt(P.cadence);
    rootBase.copy(root.scale).divideScalar(profileScale);profileScale=P.height;root.scale.copy(rootBase).multiplyScalar(profileScale);
    applyShape();cacheBodyTransforms();
  };
  const setAppearance=(value:CharacterCustomization)=>{
    skin.color.set({warm:'#bc8562',deep:'#765039',light:'#d4a17c'}[value.face]);
    shirt.color.set({classic:'#edb957',coast:'#356478',sunset:'#c8734f'}[value.clothing]);
    shorts.color.set(value.clothing==='sunset'?'#655549':'#26453e');
    const female=value.character==='female';longHair.visible=female;jersey.geometry=female?spineSurfaces.female:spineSurfaces.male;
    shoulderX=female?.22:.235;
    captainBand.visible=value.character==='captain';explorerHat.visible=value.character==='explorer';
    faceScaleX=(value.face==='deep'?1.07:value.face==='light'?.94:1)*(female?.96:1);
    bodyScaleX=value.body==='strong'?1.14:value.body==='slim'?.88:1;
    applyShape();
    stripe.visible=value.clothing==='coast'&&!female;jacketZip.visible=value.clothing==='sunset';
    const nextCostume=value.costume??'none';
    if(nextCostume!==costumeId){clubCostume?.dispose();clubCostume=createClubCostume(nextCostume,id,{head,torso,pelvis,arms,legs});costumeId=nextCostume;cacheBodyTransforms();}
    if(clubCostume){const b=clubCostume.headBounds;juggleHead={bottom:1.57+b.min.y,top:1.57+b.max.y,front:b.max.z,width:Math.max(Math.abs(b.min.x),Math.abs(b.max.x))*head.scale.x*torso.scale.x};}else juggleHead=undefined;
    if(clubCostume){longHair.visible=false;explorerHat.visible=false;cap.visible=false;}else cap.visible=true;
  };
  let bikeRoll = 0, rideTurnRoll=0, ridePhase=0, parachutePhase = 0;
  let flightClock=0,flightActive=false;const flightJoints=new Float64Array(30);
  let initialized = false, previousX = 0, previousZ = 0, phase = seed, speed = 0, yaw = team === 'home' ? Math.PI : 0, contactLead=.48,dribbleActive=false;
  let acceleration = 0, turn = 0, attentionYaw = 0, turnLead = 0;
  const supportFeet=[new T.Vector3(),new T.Vector3()],shownFeet=[new T.Vector3(),new T.Vector3()],footTarget=new T.Vector3(),inversePelvis=new T.Quaternion();
  const ankleParent=new T.Quaternion(),soleTarget=new T.Quaternion(),soleEuler=new T.Euler();
  let dribbleLead=.6;
  const spineResponse=new Float64Array(36);
  const bodyResponse=new Float64Array(132),supportResponse=new Float64Array(4);
  const strike:StrikePose={forward:0,height:.075,open:0,pitch:0,load:0,drive:0,follow:0};
  const solveContact=createLegContactSolver(),kneePole=new T.Vector3(),strikeOffset=new T.Vector3(),strikeAnkle=new T.Vector3();
  const contactOffsets=[new T.Vector3(0,-.025,.405),new T.Vector3(0,-.025,.405)];
  const contactHip=new T.Quaternion(),contactKnee=new T.Quaternion();
  const strikeStart=new T.Vector3();
  const referencePose=new Float64Array(12);
  let bodyMode=-1,priorKick=0,cutPreparation=0,retreat=0,opening=0,openingSide=1;
  let strikeFoot: -1|1=1,previousAction=0;
  let bodyResponseActive=false;
  const stancePlanted=[false,false],replant=[0,0],replantTotal=[.18,.18],replantAnchors=[new T.Vector3(),new T.Vector3()];
  const footVelocity=[new T.Vector3(),new T.Vector3()],replantVelocity=[new T.Vector3(),new T.Vector3()];
  let pivotSide=0,pivotYaw=0;
  // Weight: braking dwell, plant lock and ready-stance blend live here (all decay inside the rig).
  let brakeHold=0,brakeFront=0,previousBrake=0,plantSide=0,plantTimer=0,plantTotal=0,readyBlend=0;
  // Raw travel speed/deceleration (undamped) so a brake can predict where the body comes to rest.
  let travelSpeed=0,travelDecel=0,stopX=0,stopZ=0;
  // Turn rate of the TRAVEL direction: plants follow real cuts, not body yaw (live facing overrides snap yaw).
  let travelHeading=0,travelRate=0;
  const footLocked=[false,false],lockBlend=[0,0],lastFootZ=[0,0],staggerSide=seed%2?1:-1;
  // planted: the boot stood still on the pitch last frame (gait/brake lock or grounded at rest), so its
  // next move must start from there. liftOff: the running replant is a lift-off blend onto the swing curve.
  const planted=[false,false],liftOff=[false,false],spent=[false,false];
  // Rig-local metres per world metre (host root scale x profile height): world locks convert through it.
  let recoveryRemaining=0;
  let ws=1,pelvisY=.88,kickSupport=-1,sitBackBlend=0,gaitFwd=1,gaitSide=0,dutyState=.6;
  const anchorFoot=(index:number,px:number,pz:number,heading:number,lx:number,lz:number)=>{
    footLocked[index]=true;lockBlend[index]=0;lx*=ws;lz*=ws;
    supportFeet[index].set(px+lx*Math.cos(heading)+lz*Math.sin(heading),.075,pz-lx*Math.sin(heading)+lz*Math.cos(heading));
  };
  // A quick chop step: the boot arcs from where it stands to a new world anchor, then holds there.
  const stepFoot=(index:number,px:number,pz:number,heading:number,lx:number,lz:number,duration:number)=>{
    // Starts from where the boot really is (airborne height, reach-clamped position), never from a stale anchor.
    replantVelocity[index].copy(footVelocity[index]);
    replantAnchors[index].copy(shownFeet[index]);replant[index]=replantTotal[index]=duration;liftOff[index]=false;
    anchorFoot(index,px,pz,heading,lx,lz);lockBlend[index]=1;
  };
  // Where a locked foot sits in the heading frame of a (predicted) body position.
  // Predicted resting point from the raw speed/deceleration; never plants the front boot beyond comfortable reach of the body now.
  const predictStop=(x:number,z:number,dirX:number,dirZ:number,frontReach:number)=>{
    const ahead=Math.min(travelSpeed*travelSpeed/(2*Math.max(travelDecel,6)),.55,Math.max(0,.6-frontReach));
    stopX=x+dirX*ahead;stopZ=z+dirZ*ahead;
  };
  const footAhead=(index:number,px:number,pz:number,heading:number)=>((supportFeet[index].x-px)*Math.sin(heading)+(supportFeet[index].z-pz)*Math.cos(heading))/ws;
  const footAcross=(index:number,px:number,pz:number,heading:number)=>((supportFeet[index].x-px)*Math.cos(heading)-(supportFeet[index].z-pz)*Math.sin(heading))/ws;
  // Leaving a brake/plant lock always blends from the shown boot: if gait stance still holds it the
  // blend is a no-op (and lifts nothing), if the gait has moved on it carries the boot instead of popping.
  const releaseFoot=(index:number)=>{
    if(!footLocked[index])return;footLocked[index]=false;lockBlend[index]=0;
    replant[index]=replantTotal[index]=T.MathUtils.clamp(.18-.02*speed,.1,.18);replantAnchors[index].copy(shownFeet[index]);liftOff[index]=false;
  };
  let truckPreviousSpeed=0,truckLean=0,truckSway=0,truckPhase=0,wasTruckRiding=false;
  const update = (x: number, z: number, dt: number, time: number, reduced: boolean, motion?: PlayerMotion) => {
    // A seek/teleport must not look like a sprint. Cap integration after a suspended tab.
    dt = Math.max(0, Math.min(dt, .1));
    ws = Math.max(.05, Math.abs(root.scale.x));
    const dx = x - previousX, dz = z - previousZ, distance = Math.hypot(dx, dz);
    const discontinuity = !initialized || !!motion?.resumePose || distance > (motion?.travelMode && motion.travelMode !== 'walk' ? 3 : 1.2);
    const velocity = motion?.truckRiding || discontinuity || dt <= 0 ? 0 : Math.min(distance / dt, 8);
    if(motion?.samplePose){speed=motion.samplePose.speed;acceleration=turn=attentionYaw=turnLead=0;phase=seed;}
    const oldSpeed = speed;
    speed = motion?.truckRiding || discontinuity ? 0 : T.MathUtils.damp(speed, velocity, 12, dt);
    acceleration = discontinuity ? 0 : T.MathUtils.damp(acceleration, dt > 0 ? T.MathUtils.clamp((speed-oldSpeed)/dt, -5, 5) : 0, 8, dt);
    const rawDecel=discontinuity||dt<=0?0:T.MathUtils.clamp((travelSpeed-velocity)/dt,0,60);
    // A paused/held frame (dt 0) re-renders: it freezes the weight state instead of reading as a stop.
    const frozen=dt===0&&!discontinuity&&!motion?.samplePose;
    if(!frozen){travelDecel=discontinuity?0:Math.max(rawDecel,travelDecel*Math.exp(-10*dt));travelSpeed=velocity;}
    if(motion?.samplePose)speed=motion.samplePose.speed;
    if(discontinuity||velocity<.5){travelRate=0;if(distance>.00001)travelHeading=Math.atan2(dx,dz);}
    else{const h=Math.atan2(dx,dz),d=Math.atan2(Math.sin(h-travelHeading),Math.cos(h-travelHeading));travelRate=T.MathUtils.damp(travelRate,dt>0?d/dt:0,25,dt);travelHeading=h;}
    const previousYaw = yaw;
    let delta = 0;
    if (motion?.facing !== undefined || velocity > .05) {
      const target = motion?.facing ?? Math.atan2(dx, dz);
      delta = Math.atan2(Math.sin(target-yaw), Math.cos(target-yaw));
      if (discontinuity || dt===0 || motion?.samplePose) yaw = target;
      // The body turns over a planted boot: while the plant boot is still reaching in, the turn waits.
      else yaw += delta * (1-Math.exp(-dt*(motion?.turnSmoothing??10)*(plantSide!==0&&replant[plantSide<0?0:1]>0?.3:1)));
    }
    turn = T.MathUtils.damp(turn, discontinuity ? 0 : delta, 9, dt);
    const localForward=distance>.00001?(dx*Math.sin(yaw)+dz*Math.cos(yaw))/distance:1;
    const localSide=distance>.00001?(dx*Math.cos(yaw)-dz*Math.sin(yaw))/distance:0;
    const sample=motion?.samplePose;
    const forward=sample?Math.cos(sample.heading-yaw):localForward,sideways=sample?Math.sin(sample.heading-yaw):localSide;
    // The step curve follows the travel direction over a few frames: an instant change of direction
    // (a 90-degree cut) never swings a boot sideways in a single frame.
    if(sample||discontinuity){gaitFwd=forward;gaitSide=sideways;}
    else if(distance>.00001&&dt>0){const k=1-Math.exp(-25*dt);gaitFwd+=(forward-gaitFwd)*k;gaitSide+=(sideways-gaitSide)*k;}
    const rideBase = !!motion?.truckRiding || !!motion?.travelMode && motion.travelMode !== 'walk';
    const anticipates = !rideBase && !reduced && !discontinuity && dt > 0;
    const yawRate = anticipates ? Math.atan2(Math.sin(yaw-previousYaw),Math.cos(yaw-previousYaw))/dt : 0;
    turnLead = discontinuity || reduced ? 0 : T.MathUtils.damp(turnLead,T.MathUtils.clamp(yawRate*.025,-.1,.1),10,dt);
    const amount = smooth(speed / 1.5), run = motion?.runIntensity===undefined?smooth((speed-1.5)/4):smooth(T.MathUtils.clamp(motion.runIntensity,0,1))*amount;
    // Blend directional footwork continuously rather than switching animation clips.
    const backward=smooth((-forward-.15)/.65)*amount;
    const lateral=smooth((Math.abs(sideways)-.35)/.55)*amount;
    // The ready stance is a set position: it fades out as the player gets going (gone by ~2.5 m/s),
    // so a sprinting defender never runs in a lunge.
    const ready=motion?.stance==='ready'?1-smooth((speed-1)/1.5):0;
    readyBlend=discontinuity||sample||rideBase?ready:T.MathUtils.damp(readyBlend,ready,8,dt);
    const jockey=T.MathUtils.clamp(motion?.jockey??0,0,1),defensive=Math.max(jockey,readyBlend);
    // A defensive shuffle is a slow-speed footwork: running sideways fast becomes a crossover run.
    const shuffle=lateral*(.65+.35*defensive)*(1-smooth((speed-3.5)/2.5));
    // Backpedal: the sim's hint or the geometry (travelling against the facing).
    const retreatTarget=Math.max(backward,T.MathUtils.clamp(motion?.backpedal??0,0,1)*amount);
    if(discontinuity||sample||rideBase||reduced){retreat=retreatTarget;opening=0;cutPreparation=0;}
    else if(dt>0){
      if(retreat>.35&&retreatTarget<.25&&speed>.7){opening=Math.max(opening,retreat);openingSide=Math.sign(delta)||openingSide;}
      retreat=T.MathUtils.damp(retreat,retreatTarget,12,dt);opening=Math.max(0,opening-dt*2.8);
    }
    // Keep contact timing tied to travel; ease the chest balance separately.
    const backpedal=retreatTarget;
    const intentDelta=motion?.intentHeading===undefined?0:Math.atan2(Math.sin(motion.intentHeading-travelHeading),Math.cos(motion.intentHeading-travelHeading));
    const prepareTarget=anticipates?T.MathUtils.clamp(intentDelta/.9,-1,1)*smooth(speed/1.4):0;
    if(!frozen)cutPreparation=discontinuity||sample||rideBase||reduced?0:T.MathUtils.damp(cutPreparation,prepareTarget,18,dt);
    const sprint=run*(1-backpedal)*(1-shuffle);
    const compact=Math.max(backpedal*.7,shuffle,defensive*.6);

    const heldStrike=motion?.shotCharge!==undefined&&motion?.shotStep===undefined;
    const kick = heldStrike?.15:T.MathUtils.clamp(motion?.kick ?? 0, 0, 1);
    const strikeKind=motion?.powerKick||heldStrike?'shot':motion?.actionKind??'pass';
    strikePose(kick,strikeKind,motion?.shotPower??.5,strike);
    // Lesson dribbles also use ballContact: keep the ball clear of the stride, while
    // preserving the exact boot contact during an authored kick or first-touch cushion.
    dribbleActive=!!motion?.dribbling&&!kick&&!(motion.receive??0);
    contactLead=.48;
    const action = smooth(kick/.12) * (1-smooth((kick-.72)/.28));
    // A receiving pose yields continuously to the kick, without delaying ball contact.
    const receive = smooth(motion?.receive ?? 0)*(1-action);
    if(discontinuity||sample||action>0&&previousAction===0){strikeFoot=motion?.kickSide??(lastFootZ[0]>lastFootZ[1]?1:-1);}
    const kickSide = action>0?strikeFoot:motion?.kickSide??1;
    if(action>0&&previousAction===0)strikeStart.copy(shownFeet[kickSide<0?0:1]);
    const finishedStrike=previousAction>0&&action===0;
    previousAction=action;
    contactOffsets[0].set(0,-.025,.405);contactOffsets[1].set(0,-.025,.405);
    if(action>0)contactOffsets[kickSide<0?0:1].set(strikeKind==='pass'?-kickSide*.21:0,.08,strikeKind==='pass'?.062:.32);
    // A trace of receive (the live approach blend) is not a touch: it must not cancel brakes, plants and locks.
    const busy=action>0||receive>.05||motion?.juggle!==undefined;
    // Weight: the body's own momentum drives acceleration lean, braking and plants.
    const drive=anticipates||frozen&&!rideBase&&!reduced?T.MathUtils.clamp(acceleration/5,-1,1):0;
    const accelLean=Math.max(0,drive)*smooth(speed/.9)*(1-backpedal);
    const distanceBrake=motion?.stopDistance===undefined?0:(1-smooth(motion.stopDistance/Math.max(.2,speed*speed/8)))*smooth(speed/1.5);
    const brakeRequest=T.MathUtils.clamp(Math.max(motion?.brake??0,distanceBrake),0,1);
    const brakeNow=anticipates&&!busy?Math.max(smooth(-drive/.7)*smooth((speed+Math.max(0,-drive)*1.2)/1.2),brakeRequest*smooth(speed/.5)):0;
    // The body takes ~.08 s to load into a brake (no one-frame pose snap), then dwells and eases out.
    if(!frozen)brakeHold=!anticipates||sample?0:brakeNow>brakeHold?Math.min(brakeNow,brakeHold+dt/.08):Math.max(brakeNow,brakeHold-dt*(P.agility/(.3*P.weight)+4*Math.max(0,drive)));
    const brake=brakeHold;
    if(brake>.05&&previousBrake<=.05)brakeFront=(lastFootZ[0]-lastFootZ[1])*gaitFwd>=0?0:1;
    previousBrake=brake;
    // Same original-island movement principles, retargeted to II's shorter procedural limbs.
    // Travel drives gait; no clock-driven running while the replay is paused.
    let stride = (1.1 + .8*run) * (1-.38*compact) * (motion?.dribbling ? .82 : 1) * (1-.14*Math.max(0,drive)) * (1-.4*backpedal) * strideScale * (1-.12*Math.abs(cutPreparation)-.15*opening);
    // Duty factor: a walk keeps a boot down 60 % of the cycle, a sprint ~34 % (a flight phase). A fixed
    // 60 % asked a sprinting stance boot to sweep ~1.3 m under the hips, far past leg reach, so the reach
    // clamp dragged the planted boot along the pitch (players looked like they were skating).
    // The stance sweep (world stride x duty) must also fit the leg's reach along the travel direction at
    // the current hip height: fast running takes shorter stances (sideways running above all); walks and
    // jogs keep a support boot (duty >= .5) and take shorter, quicker steps instead of skating.
    const hipHeight=(sample||discontinuity?.88+(P.legs-1)*.83-(.035+.04*run)*amount:pelvisY)+.012;
    const reachAtHips=Math.sqrt(Math.max(.0004,(.828*P.legs)**2-(hipHeight-.075)**2));
    const sweepLimit=ws/Math.max(Math.abs(gaitFwd)/(1.7*reachAtHips),Math.abs(gaitSide)/(.5-.18*shuffle),.01);
    const naturalDuty=.6-.26*sprint;
    // The duty factor changes over a few frames (a cut flips the lateral terms instantly), so the step
    // curve is never remapped under a boot in one frame.
    const dutyTarget=Math.max(.24,Math.min(naturalDuty,.5)*(1-smooth((speed-3)/1.5)),Math.min(naturalDuty,sweepLimit/stride));
    dutyState=sample||discontinuity?dutyTarget:dutyState+T.MathUtils.clamp(dutyTarget-dutyState,-1.5*dt,1.5*dt);
    const duty=dutyState;
    stride=Math.min(stride,sweepLimit/duty);
    if (!discontinuity) phase += motion?.travelMode==='bike'
      ?dt*(.8+.85*Math.min(speed/8,1))*Math.PI*2*amount
      :distance / stride * Math.PI * 2;
    // Gentle alternating balance follows the same crank phase as the feet.
    const cycling=motion?.travelMode==='bike'&&!motion?.rooftopPose&&!reduced;
    bikeRoll=T.MathUtils.damp(bikeRoll,cycling?Math.sin(phase)*.07*amount:0,12,dt);
    if(!cycling||discontinuity)bikeRoll=0;
    const groundRiding=!!motion?.travelMode&&['scooter','bike','moped'].includes(motion.travelMode)&&!motion.rooftopPose&&!motion.truckRiding;
    if(groundRiding&&!reduced&&!discontinuity)ridePhase+=dt*(.65+Math.min(speed,8)*.08)*Math.PI*2*amount;
    rideTurnRoll=T.MathUtils.damp(rideTurnRoll,groundRiding&&!reduced?T.MathUtils.clamp(-turn*.65,-.24,.24)*amount:0,10,dt);
    if(!groundRiding||discontinuity||reduced)rideTurnRoll=0;
    if(sample){phase=seed+sample.distance/stride*Math.PI*2;acceleration=turn=turnLead=0;}
    const pivot=!rideBase&&!reduced&&!sample&&speed<.3?Math.min(1,Math.abs(yawRate)*.3):0;
    const oldPivotSide=pivotSide;
    if(frozen){}
    else if(pivot>.015&&action===0&&receive===0){if(!pivotSide||Math.abs(yaw-pivotYaw)>.55){pivotSide=-Math.sign(yawRate);pivotYaw=previousYaw;}}
    else pivotSide=0;
    if(oldPivotSide&&oldPivotSide!==pivotSide){const i=oldPivotSide<0?0:1;replant[i]=replantTotal[i]=.18;replantAnchors[i].copy(shownFeet[i]);}
    const hardReset=discontinuity||!!sample||rideBase||reduced;
    const flowingBody=!rideBase&&!reduced&&motion?.juggle===undefined&&motion?.shotStep===undefined&&!motion?.parachute&&!motion?.rooftopPose&&motion?.stunAge===undefined&&!motion?.wallSplat;
    const resetBody=hardReset||!flowingBody||!bodyResponseActive;
    const nextBodyMode=(action>0?1:0)+(receive>.05?2:0)+(jockey>.3?4:0)+(brake>.3?8:0)+(backpedal>.4?16:0)+(opening>.1?32:0)+(motion?.keeperReach&&motion.keeperReach>.1?64:0);
    const transitionBody=nextBodyMode!==bodyMode||kick>0&&kick<priorKick;
    if(dt>0||resetBody){bodyMode=nextBodyMode;priorKick=kick;}
    bodyResponseActive=flowingBody;
    // Kicking on the move: the non-kicking boot bears the weight, world-planted, stepping along with the body.
    const kickHold=action>0&&motion?.juggle===undefined&&!hardReset,supportIndex=kickSide<0?1:0;
    if(hardReset){replant[0]=replant[1]=0;stancePlanted[0]=stancePlanted[1]=false;footLocked[0]=footLocked[1]=false;lockBlend[0]=lockBlend[1]=0;plantSide=0;plantTimer=0;brakeHold=0;planted[0]=planted[1]=liftOff[0]=liftOff[1]=false;kickSupport=-1;}
    else if(busy){
      // A touch takes over the touching leg (both for keep-ups); a boot on the ground leaves from where it
      // stands (blended, never popped). The other leg keeps bearing weight on its gait/kick-support locks.
      for(let i=0;i<2;i++)if(motion?.juggle!==undefined||i!==supportIndex){releaseFoot(i);stancePlanted[i]=false;}
      plantSide=0;plantTimer=0;brakeHold=0;
    }
    if(hardReset||busy)recoveryRemaining=0;
    else if(dt>0)recoveryRemaining=Math.max(0,recoveryRemaining-dt);
    if(finishedStrike&&!hardReset&&flowingBody&&receive===0&&speed<.8){
      // At low speed, land the striking foot into a short next step rather than returning it
      // straight underneath the hip. Running already has a recovery stride;
      // forcing a second one would interrupt its support transfer.
      const i=strikeFoot<0?0:1,lead=Math.min(speed*.08,.18);
      recoveryRemaining=.18;
      stepFoot(i,x+Math.sin(yaw)*lead*ws,z+Math.cos(yaw)*lead*ws,yaw,strikeFoot*.14,.14,.18);
    }
    // After the kick the support boot hands over to the gait where it stands: a planted boot stays planted
    // (the gait lock or a lift-off blend takes it from there), a boot mid re-step lands first.
    if(kickSupport>=0&&!(kickHold&&kickSupport===supportIndex)&&replant[kickSupport]===0&&recoveryRemaining===0){
      const i=kickSupport;kickSupport=-1;
      if(busy||hardReset||speed<.3)releaseFoot(i);else if(footLocked[i]){footLocked[i]=false;lockBlend[i]=0;stancePlanted[i]=true;}
    }
    // PLANT: a hard cut (or the sim's impulse) locks the outside foot toward the old
    // travel direction while the body banks into the new one; heavy bodies dwell longer.
    const plantRequest=T.MathUtils.clamp(Math.max(motion?.plant??0,Math.abs(cutPreparation)*.65,opening*.6),0,1),yawSpeed=Math.abs(yawRate),cutSpeed=Math.abs(travelRate);
    if(plantSide===0&&anticipates&&!busy&&(speed>1.5&&cutSpeed>2.2||plantRequest>.3&&speed>.6||defensive>.5&&speed>.3&&cutSpeed>2.2)){
      plantSide=Math.abs(cutPreparation)>.3?-Math.sign(cutPreparation):opening>.2?-openingSide:cutSpeed>.5?-Math.sign(travelRate):yawSpeed>.5?-Math.sign(yawRate):staggerSide;plantTotal=plantTimer=.04+(.12+.05*plantRequest)*P.weight/P.agility;
      const i=plantSide<0?0:1;
      // A boot out of place reaches into the plant with a short arc (no one-frame snap); the dwell starts on landing.
      if(!(stancePlanted[i]&&lastFootZ[i]>-.08)){
        stepFoot(i,previousX,previousZ,previousYaw,plantSide*(.108+.1),.14,.05);
        // Include airborne height: a high swing must have time to descend into a cut.
        // Horizontal distance alone could drive a 28cm drop in roughly 34ms.
        const reachTime=T.MathUtils.clamp(Math.hypot(supportFeet[i].x-replantAnchors[i].x,supportFeet[i].z-replantAnchors[i].z)/ws*.12+Math.max(0,replantAnchors[i].y-.18)*.2,.034,.14);
        replantTotal[i]=reachTime;replant[i]=reachTime;plantTotal=plantTimer+=reachTime;
      }
      else{footLocked[i]=true;lockBlend[i]=1;}
    }
    // A lock never outlasts leg reach: once the hips carry past it the boot steps on instead of being dragged.
    for(let i=0;i<2;i++)if(footLocked[i]&&!(kickHold&&i===supportIndex)&&Math.hypot(supportFeet[i].x-x,supportFeet[i].z-z)>(plantSide!==0?.5:.62)*P.legs*ws){
      if(plantSide!==0&&i===(plantSide<0?0:1))plantTimer=0;else releaseFoot(i);
    }
    if(plantSide!==0){
      plantTimer-=dt;
      if(plantTimer<=0){const i=plantSide<0?0:1;releaseFoot(i);plantSide=0;plantTimer=0;}
    }
    const plantQ=plantSide!==0&&plantTotal>0?1-plantTimer/plantTotal:0,plantBlend=plantSide!==0?smooth(plantQ/.3)*(1-smooth((plantQ-.55)/.45)):0;
    // BRAKE: a hard stop plants the front foot ahead and the rear foot under the hips.
    const braking=footLocked[0]&&footLocked[1]&&plantSide===0&&recoveryRemaining===0;
    // Feet are anchored around where the body will come to REST (raw speed and deceleration), not
    // where the brake began: anchoring at the trigger left the rear boot behind the hips, beyond
    // leg reach, so the reach clamp dragged a nominally planted foot across the pitch.
    const brakeStep=T.MathUtils.clamp(.09+.03*(P.weight/P.agility-1),.075,.12),frontReach=.26+.04*P.weight;
    const travelX=distance>.00001?dx/distance:Math.sin(yaw),travelZ=distance>.00001?dz/distance:Math.cos(yaw);
    if(!braking&&!footLocked[0]&&!footLocked[1]&&plantSide===0&&anticipates&&!busy&&brakeNow>.45&&speed>.7){
      predictStop(x,z,travelX,travelZ,frontReach);
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,front=i===brakeFront,lz=front?frontReach:-.08;
        if(stancePlanted[i]){
          // A boot already on the ground holds if it is under the resting body; otherwise it chops forward.
          const ahead=footAhead(i,stopX,stopZ,yaw)*gaitFwd+footAcross(i,stopX,stopZ,yaw)*gaitSide,across=footAcross(i,stopX,stopZ,yaw);
          if(ahead>(front?.05:-.3)&&ahead<.55&&Math.abs(across)<.3){footLocked[i]=true;lockBlend[i]=1;}
          else stepFoot(i,stopX,stopZ,yaw,side*.128+lz*gaitSide,lz*gaitFwd,brakeStep);
        }else stepFoot(i,stopX,stopZ,yaw,side*.128+lz*gaitSide,lz*gaitFwd,brakeStep);
      }
    }else if(braking&&(brake<.2||drive>.4&&speed>1)){for(let i=0;i<2;i++)releaseFoot(i);}
    else if(braking&&replant[0]===0&&replant[1]===0&&speed>.4){
      // Still carrying momentum: a boot the hips have passed chops through to become the new front foot.
      for(let i=0;i<2;i++)if(footAhead(i,x,z,yaw)*gaitFwd+footAcross(i,x,z,yaw)*gaitSide<-.4){predictStop(x,z,travelX,travelZ,frontReach);brakeFront=i;stepFoot(i,stopX,stopZ,yaw,(i===0?-1:1)*.128+frontReach*gaitSide,frontReach*gaitFwd,brakeStep);break;}
    }
    if(kickHold){
      const i=supportIndex,side=i===0?-1:1,lead=Math.min(speed,8)*.09;kickSupport=i;
      // A grounded boot plants where it stands and cancels any old gait release.
      // An airborne one reaches down beside the body's path.
      if(!footLocked[i]){
        if(shownFeet[i].y<.09){supportFeet[i].set(shownFeet[i].x,.075,shownFeet[i].z);footLocked[i]=true;lockBlend[i]=1;replant[i]=0;liftOff[i]=false;}
        else stepFoot(i,x+travelX*lead*ws,z+travelZ*lead*ws,yaw,side*.14,.12,.08);
      // Once the hips carry past it, the support boot steps along instead of being dragged.
      }else if(replant[i]===0&&speed>.3&&(footAhead(i,x,z,yaw)<-.24||Math.hypot(supportFeet[i].x-x,supportFeet[i].z-z)>.5*P.legs*ws))
        stepFoot(i,x+travelX*lead*ws,z+travelZ*lead*ws,yaw,side*.14,.2,.09);
    }
    for(let i=0;i<2;i++)if(footLocked[i])lockBlend[i]=Math.min(1,lockBlend[i]+dt/.035);
    if(rideBase)for(const leg of legs)leg.hip.rotation.order='XYZ';
    const referenceRun=reduced||rideBase?0:amount*run*(1-backpedal)*(1-shuffle)*(1-action)*.18;
    const referenceShot=reduced||rideBase||strikeKind==='pass'?0:action*.22;
    if(referenceRun>0)sampleMotionReference('run',phase/(Math.PI*2)-duty,referencePose);
    if(referenceShot>0)sampleMotionReference('shot',kick,referencePose,6);
    const crouch=(Math.max(defensive,motion?.keeper??0)*.07+readyBlend*.05)*P.crouch+compact*.025+backpedal*.02;
    const effort = amount*(1-.8*action)*(1-.35*receive);
    const bank = T.MathUtils.clamp(turn*speed*.055, -.18, .18)*effort;
    const coilAmplitude=(.11+.08*sprint)*(1-.6*shuffle)*(1-.7*backpedal)*effort;
    const coil=Math.sin(phase-.25)*coilAmplitude;
    // Authored phase offset for chest counter-rotation; not a universal biological lag.
    // This preserves excursion without low-pass filtering the whole running pose.
    const chestCoil=Math.sin(phase-.43)*coilAmplitude;
    const spinePulse=flowingBody&&!reduced?.03*Math.cos(phase*2-.55)*effort*(1-action)*(1-receive)*(1-brake):0;
    const chestSway=flowingBody&&!reduced?-.035*Math.sin(phase-.65)*effort*(1-action)*(1-receive)*(1-brake):0;
    // Shift onto the stance side; pelvis leads, shoulders lag and counterbalance.
    const weightShift=reduced||rideBase?0:-Math.sin(phase-.3)*effort;
    const turnBalance=reduced||rideBase?0:T.MathUtils.clamp(yawRate*.035,-.12,.12)*amount;
    // Small distance-driven variation keeps running from repeating like a metronome.
    // It modulates support transfer, never the root path, and disappears at rest.
    const agilityFlow=reduced||rideBase?0:Math.sin(phase*.5+seed)*effort*sprint*(motion?.dribbling?.055:.025);
    const cutLean=reduced||rideBase?0:T.MathUtils.clamp(travelRate*.025+cutPreparation*.065,-.15,.15)*effort*(1-backpedal);
    // Previous-frame contacts define a support-centre estimate in body space.
    // A bounded pendulum offset h*a/g adds a little counterbalance in a cut.
    const supportCount=Number(planted[0])+Number(planted[1]);
    const supportX=supportCount?((planted[0]?(shownFeet[0].x-x)*Math.cos(yaw)-(shownFeet[0].z-z)*Math.sin(yaw):0)+(planted[1]?(shownFeet[1].x-x)*Math.cos(yaw)-(shownFeet[1].z-z)*Math.sin(yaw):0))/(supportCount*ws):0;
    const lateralAcceleration=T.MathUtils.clamp(travelRate*speed,-3,3);
    const supportTarget=flowingBody&&!reduced&&!sample?T.MathUtils.clamp(supportX*.18-lateralAcceleration*.8/9.81*.08,-.035,.035)*effort*(1-action)*(1-receive)*(1-Math.abs(drive))*defensive:0;
    const supportShift=poseResponse(supportResponse,0,supportTarget,dt,22,resetBody);
    // Move weight toward the support leg during loading, then release it into
    // the forward drive. Small, bounded shift preserves the ankle reach budget.
    const strikeTransfer=action*(.032*strike.load+.018*strike.drive)*(strikeKind==='pass'?.55:1);
    const balanceShift=-kickSide*strikeTransfer+supportShift-cutPreparation*.025-openingSide*opening*.022+weightShift*(.042-.012*run)*(1+Math.abs(agilityFlow)*2)-kickSide*.04*action-kickSide*.018*receive;
    const breathing = reduced ? 0 : Math.sin(time*2+seed)*.004*(1-amount);
    const pelvisRest=.88+(P.legs-1)*.83;
    // Whole-body pitch: pelvis carries ~35 %, torso the rest, head counter-pitches to keep the gaze level.
    const runLean=amount*(.15+.27*Math.pow(sprint,1.3))*P.lean*(1-backpedal)*(1-.5*shuffle);
    // Braking sits back: a firm brake (the sim's request or the body's own deceleration) replaces the
    // run lean outright, whatever the run intensity, instead of only scaling it down.
    // Critically damped loading eases both onset and release instead of reversing
    // chest pitch through a fixed-speed ramp with abrupt velocity changes.
    sitBackBlend=poseResponse(supportResponse,1,smooth(brake/.4),dt,20,hardReset);
    const sitBack=sitBackBlend;
    // Bracing opposes travel: retreating keeps the chest slightly forward, not in
    // the forward-run sit-back pose. Retain gait direction at rest through the dwell.
    const brakePitch=-(.06+.1*brake)*Math.max(0,gaitFwd)*(1-retreat)+.045*retreat;
    const lean=(runLean+accelLean*.18*P.lean+.025*backpedal+.055*jockey+.2*readyBlend*(1-.6*amount))*(1-sitBack)+brakePitch*sitBack;
    const sink=(.03+.075*P.weight)*brake+(.02+.04*P.weight)*plantBlend;
    pelvis.position.x = reduced||rideBase?0:balanceShift;
    pelvis.position.z = -.04*brake*gaitFwd+(.065*strike.drive+Math.max(0,(motion?.strikeZ??.65)-.65)*.55)*action;
    pelvis.position.y = pelvisRest + Math.cos(phase*2)*.012*effort*(1-brake) + breathing - .018*receive - (.05+.035*strike.load+Math.max(0,(motion?.strikeZ??.65)-.65)*.35)*action-crouch-(.05+.025*run)*effort-sink;
    // Hips carry mass: sinks, dwells and releases (brake, plant, stance, run effort) move the pelvis at
    // most ~2 cm per 1/60 s frame. Seeks, teleports, rides and authored samples still snap.
    if(!discontinuity&&!sample&&!rideBase)pelvis.position.y=pelvisY+T.MathUtils.clamp(pelvis.position.y-pelvisY,-1.2*dt,1.2*dt);
    pelvisY=pelvis.position.y;
    torso.position.x = reduced||rideBase?0:-balanceShift*.3;
    pelvis.rotation.set(lean*.35-spinePulse*.3, -coil*.5-agilityFlow*.35+openingSide*opening*.22+cutPreparation*.055 + receive*.14*kickSide - plantSide*.2*plantBlend*defensive, -bank*.3 + plantSide*.06*plantBlend+weightShift*.012);
    torso.rotation.set(lean*.65 + spinePulse + .08*receive - .035*action,
      chestCoil*(1.3+.5*(1-brake))+agilityFlow+cutLean*.65-openingSide*opening*.12+sideways*.1*backpedal + (turn*.08+turnLead)*effort - .12*receive*kickSide - Math.sin(kick*Math.PI*2)*.13*action*kickSide,
      -bank-cutLean-agilityFlow*.25 + chestSway - sideways*.085*shuffle + weightShift*.045 - turnBalance*.35 - kickSide*.07*action + plantSide*.16*plantBlend);
    head.rotation.y = reduced ? 0 : T.MathUtils.clamp(turn*.25,-.25,.25)*amount + Math.sin(time*.7+seed)*.05*(1-amount);
    head.rotation.x = -lean*.72 - .02*effort + .04*receive - .06*backpedal - .05*readyBlend*(1-amount) - (reduced?0:Math.sin(phase*2-.4)*.012*effort);
    if(action>0){
      const load=strike.load*action;
      const hipDrive=strike.drive*action,chestDrive=smooth((kick-.26)/.3)*(1-smooth((kick-.78)/.22))*action;
      const strength=strikeKind==='shot'?1+(motion?.shotPower??0)*.25:strikeKind==='loft'?.8:.5;
      const approach=T.MathUtils.clamp(Math.atan2(Math.sin((motion?.intentHeading??yaw)-yaw),Math.cos((motion?.intentHeading??yaw)-yaw)),-.45,.45);
      pelvis.rotation.y+=kickSide*(-.22*load+.22*hipDrive)*strength+approach*.22*load;
      torso.rotation.y+=kickSide*(-.32*load+.4*chestDrive)*strength;
      torso.rotation.x+=.14*chestDrive*strength;
    }

    torso.rotation.x+=referencePose[0]*referenceRun+referencePose[6]*referenceShot;
    torso.rotation.y+=referencePose[1]*referenceRun+referencePose[7]*referenceShot*kickSide;
    // Hips carry the contact-driven pose; the chest follows with a little inertia.
    // Keep lateral counterbalance in phase with the support foot, rather than delaying weight.
    torso.rotation.set(
      inertialResponse(bodyResponse,0,torso.rotation.x,dt,32,resetBody,transitionBody),
      inertialResponse(bodyResponse,1,torso.rotation.y,dt,32,resetBody,transitionBody),
      inertialResponse(bodyResponse,2,torso.rotation.z-weightShift*.045,dt,32,resetBody,transitionBody)+weightShift*.045);

    // Balance follows contact and momentum: quiet at rest, counter-sway in the upper body.
    if(!reduced&&!rideBase){head.rotation.z=-torso.rotation.z*.4;head.rotation.y-=coil*.3;}else head.rotation.z=0;
    // Ride/flight/truck branches fully replace these limbs. Keep shared gait clocks,
    // but do not solve two walking legs whose transforms would be discarded.
    const thigh=.43*P.legs,shin=.40*P.legs,maxReach=.828*P.legs;
    // Reset before posing: ground soles own all three axes; ride/action overrides start neutral.
    for(const leg of legs){leg.ankle.rotation.y=0;leg.ankle.rotation.z=0;}
    if (!rideBase) {
    inversePelvis.copy(pelvis.quaternion).invert();
    const pelvisPitch=pelvis.rotation.x,cosYaw=Math.cos(yaw),sinYaw=Math.sin(yaw);
    for (let index = 0; index < legs.length; index++) {
      const { hip, knee, ankle } = legs[index];
      const side = index === 0 ? -1 : 1;
      const cycle = ((phase/(Math.PI*2)+index*.5)%1+1)%1;
      const stance = cycle < duty;
      const t = stance ? cycle/duty : (cycle-duty)/(1-duty);
      // Recover the heel earlier at pace; leave stance and touchdown endpoints
      // untouched so the support solver still owns contact.
      const recoveryT=stance?t:t+.07*run*(1-backpedal)*(1-shuffle)*Math.sin(Math.PI*t);
      const swing = Math.sin(recoveryT*Math.PI);
      // Stance speed matches travel (stride * duty), with swing clearance and flat support feet.
      const reachZ = stride*duty*.5;
      let footZ = (stance ? reachZ-2*reachZ*t : -reachZ+2*reachZ*smooth(recoveryT))*amount;
      let footX=footZ*gaitSide;
      // A defensive shuffle opens the leading foot and gathers the trailing foot;
      // it never crosses one boot through the other on a lateral step.
      if(shuffle>0){const lateralTarget=side*(.045+.11*(1+Math.sin(phase+index*Math.PI))*.5);footX+=(lateralTarget-footX)*shuffle;}
      footZ*=gaitFwd;
      // Knee lift grows with sprint (~.42 m); backpedal and shuffles keep steps low.
      // Zero vertical velocity at lift-off and landing, with the same mid-step clearance.
      // A plain sine hits the ground at full downward speed and stops in one frame.
      let lift = stance ? 0 : swing*swing*(.15+.27*sprint)*(1-.65*compact)*amount;
      // A stationary change of heading lifts the outside foot instead of skating both boots.
      lift+=pivot*(side*Math.sign(yawRate)>0?.075:0);
      // Give each foot its own lane, with wider recovery steps when defending.
      // World contacts below remain authoritative: stance feet never slide outward.
      const stepWidth=(.025*amount+.055*compact+.025*readyBlend)*(1-action)*(1-receive);
      footX+=side*(crouch+.03*readyBlend+stepWidth+(stance?0:.035*swing*swing*effort));
      // Close-control steps approach the central ball lane rather than dragging
      // the ball sideways toward the wider ordinary running gait.
      if(motion?.dribbling)footX-=side*.055*amount*(1-action)*(1-receive)*(1-backpedal)*(1-shuffle);
      // Ready stance: staggered feet, weight on the balls of the feet.
      const still=readyBlend*(1-amount);
      footZ+=side*staggerSide*.09*still;
      if(brake>0){const brace=(index===brakeFront?.28:-.08)*(1-.4*amount);footZ+=(brace*gaitFwd-footZ)*brake;footX+=(side*.128+brace*gaitSide-side*.108-footX)*brake;lift*=1-brake;}
      if (action > 0) {
        let actionZ = -.025, actionLift = 0;
        if (side === kickSide) {
          actionZ=strike.forward;
          actionLift=strike.height-.075;
        }
        footZ += (actionZ-footZ)*action;
        lift += (actionLift-lift)*action;
      }
      if(motion?.juggle!==undefined&&side===kickSide){
        const phase=motion.juggle%1,tap=Math.max(0,1-phase/.32),kind=motion.juggleTouch??'foot';
        if(kind==='foot'||kind==='around-world'){footZ+=(.32-footZ)*tap;lift+=(.27-lift)*tap;}
        if(kind==='knee'){footZ+=(.48-footZ)*tap;lift+=(.52-lift)*tap;}
        if(kind==='around-world'&&!reduced){const arc=Math.sin(Math.PI*phase),angle=phase*Math.PI*2;footX+=side*Math.sin(angle)*.3*arc;footZ+=.4*arc;lift+=arc*(.65+.18*Math.cos(angle));}
      }
      if (receive > 0 && side === kickSide) {
        footZ += (.24-.10*smooth(motion?.receiveProgress??.6)-footZ)*receive;
        lift += (.055-lift)*receive;
      }
      // Compensate pelvis bob so the stance sole does not bob through the ground.
      let footY = .075-pelvis.position.y+lift+.025*still;
      const contactStrike=side===kickSide&&action>0&&motion?.juggle===undefined&&motion?.shotStep===undefined;
      if(contactStrike){
        soleTarget.setFromEuler(soleEuler.set(strike.pitch,kickSide*strike.open,0,'YXZ'));
        strikeOffset.copy(contactOffsets[index]).applyQuaternion(soleTarget);
        const ballX=motion?.strikeX??side*.14,ballZ=motion?.strikeZ??.65;
        // The contact centre stays in the outgoing frame; ankle orientation cannot displace it.
        strikeAnkle.set(ballX-strikeOffset.x-pelvis.position.x-side*.108,
          .19-strikeOffset.y+strike.height-.075-pelvis.position.y,
          ballZ-strikeOffset.z+strike.forward-.32-pelvis.position.z);
        footX+=(strikeAnkle.x-footX)*action;footZ+=(strikeAnkle.z-footZ)*action;footY+=(strikeAnkle.y-footY)*action;
        if(kick<.16&&!hardReset){
          const q=smooth(kick/.16),sx=(strikeStart.x-x)/ws,sz=(strikeStart.z-z)/ws;
          footX=(sx*cosYaw-sz*sinYaw-pelvis.position.x-side*.108)*(1-q)+footX*q;
          footZ=(sx*sinYaw+sz*cosYaw-pelvis.position.z)*(1-q)+footZ*q;
          footY=(strikeStart.y-pelvis.position.y)*(1-q)+footY*q+.09*Math.sin(Math.PI*q);
        }
      }
      // Raw travel counts too, so the first step off a standstill is already world-locked.
      const moving=speed>.3||velocity>.3,supportKick=kickHold&&index===supportIndex;
      // The weight-bearing leg while the other one kicks or receives (not during keep-ups).
      const supportLeg=index===supportIndex&&motion?.juggle===undefined&&(action>0||receive>0);
      const plantStance=!sample&&!reduced&&!motion?.juggle&&stance&&moving&&action===0&&(receive<.05||supportLeg);
      // World-locked feet: gait stance, stationary pivot, and brake/plant locks (blended in fast).
      if(!stance)spent[index]=false;
      // A boot still finishing a step (release or lift-off blend) lands when the blend ends, not mid-air.
      // A boot that was already on the pitch last frame locks on its first stance frame (no landing skid).
      // A late swing that is already back on the pitch has touched down: it holds too.
      const touchDown=!stance&&t>.7&&!sample&&!reduced&&!motion?.juggle&&moving&&action===0&&(receive<.05||supportLeg)&&shownFeet[index].y<.09&&!liftOff[index];
      const gaitLock=(plantStance||touchDown)&&(stancePlanted[index]||shownFeet[index].y<.09&&!liftOff[index])&&!spent[index]&&!(replant[index]>0&&!footLocked[index]);
      let lockWeight=(pivotSide===side||gaitLock)&&!discontinuity?1:0;
      if(footLocked[index]&&!discontinuity)lockWeight=Math.max(lockWeight,lockBlend[index]);
      const wx=(supportFeet[index].x-x)/ws,wz=(supportFeet[index].z-z)/ws,ly=.075-pelvis.position.y;
      const lockX=wx*cosYaw-wz*sinYaw-pelvis.position.x-side*.108,lockZ=wx*sinYaw+wz*cosYaw-pelvis.position.z;
      // A locked boot the hips are about to carry out of reach (within ~1.5 frames) steps off now, never
      // dragged by the reach clamp: a gait stance ends early, a brake/plant lock releases, a kick support re-steps.
      const reachLeft=Math.sqrt(Math.max(.0004,maxReach**2-ly**2))*.998,ahead=Math.max(speed,velocity)*dt*1.5/ws;
      // Wide shuffle support may remain reachable beyond the ordinary running lane.
      // The radial bound still enforces actual leg length.
      const nextX=lockX-sideways*ahead,nextZ=lockZ-forward*ahead,lateralReach=.3+.2*shuffle;
      if(lockWeight>0&&pivotSide!==side&&replant[index]===0&&(Math.max(Math.abs(lockX),Math.abs(nextX))>lateralReach||Math.max(Math.abs(lockZ),Math.abs(nextZ))>.62||Math.max(Math.hypot(lockX,lockZ),Math.hypot(nextX,nextZ))>reachLeft)){
        if(footLocked[index]){
          if(supportKick){const lead=Math.min(speed,8)*.09;stepFoot(index,x+travelX*lead*ws,z+travelZ*lead*ws,yaw,side*.14,.2,.09);}
          else{if(plantSide!==0&&index===(plantSide<0?0:1))plantTimer=0;releaseFoot(index);lockWeight=0;}
        // Release an exhausted stance even below running pace. Keeping a nominal lock
        // beyond leg reach makes the safety clamp drag the boot along the ground.
        }else if(gaitLock){spent[index]=true;lockWeight=0;}
      }
      // Lift-off: a boot that stood still leaves from where it really stands and blends onto the swing
      // curve (the lock and the curve part ways under lateral travel, duty changes and reach limits).
      if(planted[index]&&lockWeight===0&&replant[index]===0&&moving&&!hardReset&&!contactStrike){
        const swingTime=(1-duty)*stride*ws/Math.max(speed,velocity,.5);
        replant[index]=replantTotal[index]=T.MathUtils.clamp(.55*swingTime,.05,.12);replantAnchors[index].copy(shownFeet[index]);liftOff[index]=true;
      }
      if(lockWeight>0){
        const lx=T.MathUtils.clamp(lockX,-lateralReach,lateralReach),lz=T.MathUtils.clamp(lockZ,-.62,.62);
        footX+=(lx-footX)*lockWeight;footZ+=(lz-footZ)*lockWeight;footY+=(ly-footY)*lockWeight;
      }
      if(contactStrike){replant[index]=0;liftOff[index]=false;}
      if(replant[index]>0){
        const anchored=footLocked[index]&&!liftOff[index],u=T.MathUtils.clamp(1-(replant[index]-(anchored?dt:0))/replantTotal[index],0,1),q=smooth(u),anchor=replantAnchors[index],wx=(anchor.x-x)/ws,wz=(anchor.z-z)/ws;
        const ax=wx*cosYaw-wz*sinYaw-pelvis.position.x-side*.108,az=wx*sinYaw+wz*cosYaw-pelvis.position.z,ay=anchor.y-pelvis.position.y;
        // Clearance scales with how far the boot travels, so a boot already in place is not lifted; a
        // toe-off clearance starts at zero and rises with the transfer. A fixed initial
        // heel offset would pop the ankle upward on the first release frame.
        const travel=Math.hypot(ax-footX,az-footZ);
        footX=ax*(1-q)+footX*q;footZ=az*(1-q)+footZ*q;
        footY=ay*(1-q)+footY*q+Math.sin(q*Math.PI)*Math.min(.14,travel*.4)+(liftOff[index]?.02*smooth(q/.15)*(1-q):0);
        if(anchored){
          // Cubic Hermite start tangent carries swing momentum into the landing;
          // u(1-u)^2 fades it to zero velocity at the fixed world anchor.
          const v=replantVelocity[index],h=u*(1-u)*(1-u)*replantTotal[index];
          footX+=(v.x*cosYaw-v.z*sinYaw)/ws*h;footZ+=(v.x*sinYaw+v.z*cosYaw)/ws*h;footY+=v.y*h;
          footY=Math.max(.075-pelvis.position.y,footY);
        }
        replant[index]=Math.max(0,replant[index]-dt);
        if(replant[index]===0)liftOff[index]=false;
      }
      // Keep the requested sole within reach instead of solving an overlong leg,
      // which otherwise lifts a nominally planted boot above the pitch. Clamp in the
      // yaw-aligned frame: pulling a foot in along a pitched pelvis plane would dig it in.
      const horizontal=Math.hypot(footX,footZ),available=Math.sqrt(Math.max(.0004,maxReach**2-footY**2))*.998;
      // C1 soft saturation on free steps avoids a straight-knee reach snap.
      // Planted/striking feet keep exact targets and the existing hard safety bound.
      const softness=!contactStrike&&lockWeight===0&&moving?.025*P.legs*smooth(lift/.08):0;
      const softStart=Math.max(0,available-softness);
      const limited=softness>0&&horizontal>softStart?softStart+softness*(1-Math.exp(-(horizontal-softStart)/softness)):Math.min(horizontal,available);
      if(horizontal>limited){const ratio=limited/horizontal;footX*=ratio;footZ*=ratio;}
      // Two bounded support targets, no world-matrix traversals or ground raycasts.
      {
        const ox=pelvis.position.x+footX+side*.108,oz=pelvis.position.z+footZ;
        const nx=x+(ox*cosYaw+oz*sinYaw)*ws,ny=footY+pelvis.position.y,nz=z+(oz*cosYaw-ox*sinYaw)*ws;
        if(hardReset)footVelocity[index].set(0,0,0);
        else if(dt>0){footVelocity[index].set((nx-shownFeet[index].x)/dt,(ny-shownFeet[index].y)/dt,(nz-shownFeet[index].z)/dt);footVelocity[index].clampLength(0,6*ws);}
        shownFeet[index].set(nx,ny,nz);
        if(lockWeight===0)supportFeet[index].set(shownFeet[index].x,.075,shownFeet[index].z);
      }
      // A boot standing still (locked, or grounded at rest) is where its next move starts from.
      planted[index]=!hardReset&&replant[index]===0&&(lockWeight>=.5||!moving&&shownFeet[index].y<.08);
      stancePlanted[index]=plantStance||planted[index]&&!moving;lastFootZ[index]=footZ;
      // Targets are yaw-aligned; solve in the pitched/rolled pelvis frame so soles stay on the pitch.
      footTarget.set(footX+side*.108,footY,footZ).applyQuaternion(inversePelvis);
      footX=footTarget.x-side*.108;footY=footTarget.y;footZ=footTarget.z;
      // The planted support leg keeps solving its lateral offset through a kick (no sideways skid).
      const lateralSolve=supportLeg||action===0&&receive===0&&motion?.juggle===undefined,actionX=supportLeg?0:action,receiveX=supportLeg?0:receive;
      const sagittalY=lateralSolve?-Math.hypot(footY,footX):footY;
      const reach = Math.max(.031, Math.min(Math.hypot(sagittalY,footZ), maxReach));
      const hipAngle = Math.atan2(-footZ,-sagittalY)-Math.acos(T.MathUtils.clamp((thigh**2+reach**2-shin**2)/(2*thigh*reach),-1,1));
      const kneeAngle = Math.PI-Math.acos(T.MathUtils.clamp((thigh**2+shin**2-reach**2)/(2*thigh*shin),-1,1));
      hip.rotation.set(hipAngle, side===kickSide ? receive*side*.18+(motion?.actionKind==='pass'?side*.25*action:0) : 0, Math.atan2(footX*(1-actionX)*(1-receiveX),-footY)-side*.025*actionX,lateralSolve?'ZXY':'XYZ');
      knee.rotation.set(kneeAngle,0,0);
      if(lateralSolve&&flowingBody&&!reduced){
        // Point knees into the stance/turn while solving the same ankle target.
        // This frees hip rotation without displacing a planted foot.
        kneePole.set(side*(.08+.25*compact+.1*readyBlend)+cutPreparation*.12,0,1).applyQuaternion(inversePelvis);
        footTarget.set(footX,footY,footZ);
        solveContact(hip,knee,footTarget,kneePole,thigh,shin);
      }
      if(contactStrike){
        contactHip.copy(hip.quaternion);contactKnee.copy(knee.quaternion);
        footTarget.set(footX,footY,footZ);
        kneePole.set(Math.sin(kickSide*strike.open*.7),0,Math.cos(strike.open*.7)).applyQuaternion(inversePelvis);
        solveContact(hip,knee,footTarget,kneePole,thigh,shin);
        hip.quaternion.slerp(contactHip,1-action);knee.quaternion.slerp(contactKnee,1-action);
      }
      // Flat sole under a pitched pelvis; toe-first backpedal steps and heels up in the ready stance.
      const toe=(1-action)*(1-receive)*(backpedal*(stance?.06:.3*swing)+.14*still);
      ankle.rotation.x = -hipAngle-kneeAngle-pelvisPitch + (stance ? 0 : -.12*swing*effort) + toe;
      // Cancel the whole parent rotation, not only its sagittal angles. Abducted hips and
      // banking otherwise tip the support boot onto its edge (especially in a wide jockey).
      // Retain deliberate toe pitch and leave striking/receiving and special action feet alone.
      if(lateralSolve&&motion?.shotStep===undefined&&!motion?.parachute&&!motion?.rooftopPose&&motion?.stunAge===undefined&&!motion?.wallSplat){
        const solePitch=(lockWeight>0?0:stance?0:-.12*swing*effort)+toe;
        const freeAnkle=lockWeight===0&&!stance&&shownFeet[index].y>.13&&!reduced;
        soleTarget.setFromEuler(soleEuler.set(solePitch,openingSide*opening*.25+side*(.045+.1*compact),freeAnkle?side*.055*swing*effort*smooth((shownFeet[index].y-.13)/.08):0,'YXZ'));
        ankleParent.copy(pelvis.quaternion).multiply(hip.quaternion).multiply(knee.quaternion);
        ankle.quaternion.copy(ankleParent.invert()).multiply(soleTarget);
      }
      if(contactStrike){
        soleTarget.setFromEuler(soleEuler.set(strike.pitch,kickSide*strike.open,0,'YXZ'));
        ankleParent.copy(pelvis.quaternion).multiply(hip.quaternion).multiply(knee.quaternion);
        ankle.quaternion.copy(ankleParent.invert()).multiply(soleTarget);
      }
      const arm = arms[index];
      arm.shoulder.position.y=.385-CHEST_HEIGHT+(flowingBody&&!reduced?Math.sin(phase+index*Math.PI-.45)*(.012+.01*(1-brake))*effort:0);
      // Flight and parachuting twist this axis; walking owns a neutral shoulder yaw.
      arm.shoulder.rotation.y = reduced?0:side*(.065+.1*(.5+.5*Math.sin(phase+index*Math.PI-.5)))*effort-coil*.6+turnBalance*.3;
      // Arms swing from the shoulder; the elbow closes on the forward swing and opens behind.
      const armSwing=Math.sin(phase+index*Math.PI-.32),armAmp=(.42+.5*sprint)*(1-.65*shuffle)*(1-.7*backpedal)*P.armSwing*effort;
      let shoulderX=armSwing*armAmp - .16*receive - .15*defensive;
      let shoulderZ=side*(.12+.16*action+.09*receive+.2*compact)+(reduced?0:side*.075*Math.sin(phase+index*Math.PI-.6)*effort-weightShift*.04-turnBalance*.4)-bank*.3;
      let elbowX=-.3-(.5+.3*sprint)*effort-.12*action+(reduced?0:(.34+.32*sprint)*P.armSwing*Math.sin(phase+index*Math.PI-.55)*effort);
      // Balance arms for braking, planting, backpedalling and the ready stance: elbows bent, upper arms
      // out and turned out, hands low and wide beside the hips. Never both arms reaching straight ahead.
      const balance=Math.max(sitBack,plantBlend,backpedal,readyBlend)*(1-action)*(1-receive);
      if(balance>0){
        shoulderX+=(-.06+.35*backpedal*armSwing*armAmp-shoulderX)*balance;
        shoulderZ+=(side*(.5+.06*compact)-shoulderZ)*balance;
        elbowX+=(-1.05-elbowX)*balance;
        arm.shoulder.rotation.y+=(side*.3-arm.shoulder.rotation.y)*balance;
      }
      if(action>0&&!reduced){
        // The opposite arm opens during loading, then returns across the body
        // as the kicking hip comes through. Keep passes smaller than shots.
        const technique=strikeKind==='pass'?.45:strikeKind==='loft'?.75:1;
        const opposite=side!==kickSide;
        shoulderX+=technique*action*(opposite?-.32*strike.load+.22*strike.follow:.16*strike.load-.24*strike.follow);
        shoulderZ+=side*technique*action*(opposite?.24:.1)*strike.load;
        elbowX-=.18*technique*action*strike.load;
      }
      const refArm=2+index*2,refStrike=8+(kickSide>0?index:1-index)*2;
      shoulderX+=referencePose[refArm]*referenceRun+referencePose[refStrike]*referenceShot;
      elbowX+=referencePose[refArm+1]*referenceRun+referencePose[refStrike+1]*referenceShot;
      arm.shoulder.rotation.x = shoulderX;
      arm.shoulder.rotation.z = shoulderZ;
      arm.elbow.rotation.x = elbowX;
      if(motion?.keeper){const reach=motion.keeperReach??0;arm.shoulder.rotation.x=-.35-reach*.85;arm.shoulder.rotation.z=side*(.25+reach*.15);arm.elbow.rotation.x=-.65;}
      // Let shoulders and elbows carry through a change of intention instead of switching
      // instantly between running, balance and receiving silhouettes.
      const armChannel=3+index*4;
      arm.shoulder.rotation.set(
        inertialResponse(bodyResponse,armChannel,arm.shoulder.rotation.x,dt,30,resetBody,transitionBody),
        inertialResponse(bodyResponse,armChannel+1,arm.shoulder.rotation.y,dt,30,resetBody,transitionBody),
        inertialResponse(bodyResponse,armChannel+2,arm.shoulder.rotation.z,dt,30,resetBody,transitionBody));
      arm.elbow.rotation.x=inertialResponse(bodyResponse,armChannel+3,arm.elbow.rotation.x,dt,34,resetBody,transitionBody);

    }
    if(motion?.juggle!==undefined){
      const tap=Math.max(0,1-(motion.juggle%1)/.32),kind=motion.juggleTouch??'foot';
      if(kind==='shoulder'){torso.rotation.z-=kickSide*.15*tap;arms[kickSide===-1?0:1].shoulder.rotation.z+=kickSide*.22*tap;head.rotation.z=kickSide*.12*tap;}
      else head.rotation.z=0;
      if(kind==='head'){head.rotation.x-=.2*tap;pelvis.position.y+=.045*tap;torso.rotation.x-=.07*tap;}
    }else head.rotation.z=reduced?0:-torso.rotation.z*.18;
    }
    // Only involved, nearby actors track the ball. No scene queries or extra loops.
    if (!rideBase && !motion?.parachute && !motion?.rooftopPose && motion?.stunAge===undefined && !motion?.juggle && !motion?.powerKick && !reduced && !clubCostume) {
      let target = 0;
      if (motion?.lookX!==undefined && motion.lookZ!==undefined) {
        const lx=motion.lookX-x,lz=motion.lookZ-z,d2=lx*lx+lz*lz;
        if(d2>.09&&d2<400)target=T.MathUtils.clamp(Math.atan2(Math.sin(Math.atan2(lx,lz)-yaw),Math.cos(Math.atan2(lx,lz)-yaw)),-.55,.55);
      }
      attentionYaw=sample?target:discontinuity?0:T.MathUtils.damp(attentionYaw,target,9,dt);
      head.rotation.y+=motion?.scanYaw??0;
      if(motion?.lookY!==undefined)head.rotation.x-=T.MathUtils.clamp(Math.atan2(motion.lookY-1.6,Math.hypot((motion.lookX??x)-x,(motion.lookZ??z)-z)),-.18,.3);
      head.rotation.y=T.MathUtils.clamp(head.rotation.y+attentionYaw+turnLead*effort,-.65,.65);
    } else attentionYaw=0;
    head.rotation.set(
      inertialResponse(bodyResponse,11,head.rotation.x,dt,36,resetBody,transitionBody),
      inertialResponse(bodyResponse,12,head.rotation.y,dt,36,resetBody,transitionBody),
      inertialResponse(bodyResponse,13,head.rotation.z,dt,36,resetBody,transitionBody));
    if (motion?.travelMode && motion.travelMode !== 'walk' && motion.travelMode !== 'jetpack') {
      const scooter=motion.travelMode==='scooter', bicycle=motion.travelMode==='bike';
      const suspension=reduced?0:Math.sin(ridePhase*2)*.018*amount;
      pelvis.position.set(0,(scooter?1.04:1.0)+suspension,scooter?0:-.12);
      pelvis.rotation.set(0,0,0);torso.rotation.set(scooter?.04:.35,0,0);head.rotation.set(-torso.rotation.x,0,0);
      const superman=motion.travelMode==='moped'&&!reduced?T.MathUtils.clamp(motion.mopedSuperman??0,0,1):0;
      if(superman){pelvis.position.y+=.35*superman;pelvis.position.z-=.18*superman;torso.rotation.x=T.MathUtils.lerp(.35,1.35,superman);head.rotation.x=-torso.rotation.x;}
      // Solve the original limbs onto deck/pedals and grips instead of a running pose.
      for(let i=0;i<2;i++) {
        const leg=legs[i], pedal=phase+i*Math.PI;
        const push=!reduced&&scooter&&i===1?Math.sin(ridePhase):0;
        const flex=!reduced&&!scooter&&!bicycle?Math.sin(ridePhase+i*Math.PI)*amount:0;
        const footY=scooter?.235+Math.max(0,push)*.07*amount:bicycle?.39+Math.cos(pedal)*.15:.36+flex*.02;
        const footZ=scooter?(i===0?.09:-.17-Math.max(0,-push)*.23*amount):bicycle?.03+Math.sin(pedal)*.15:.13+flex*.035;
        const y=footY-pelvis.position.y,z=footZ-pelvis.position.z;
        const reach=T.MathUtils.clamp(Math.hypot(y,z),.035,maxReach);
        const hip=Math.atan2(-z,-y)-Math.acos(T.MathUtils.clamp((thigh**2+reach**2-shin**2)/(2*thigh*reach),-1,1));
        const knee=Math.PI-Math.acos(T.MathUtils.clamp((thigh**2+shin**2-reach**2)/(2*thigh*shin),-1,1));
        leg.hip.rotation.set(hip,0,0);leg.knee.rotation.x=knee;leg.ankle.rotation.x=-hip-knee;
        if(superman){leg.hip.rotation.x=T.MathUtils.lerp(hip,1.4,superman);leg.knee.rotation.x=T.MathUtils.lerp(knee,.12,superman);leg.ankle.rotation.x=T.MathUtils.lerp(-hip-knee,-.1,superman);}
        const arm=arms[i], lean=torso.rotation.x;
        // Town scales every ground vehicle, not only the moped, by 1.12.
        const gripScale=1.12;
        const targetY=(scooter?1.25:1.13)*gripScale-pelvis.position.y;
        const targetZ=.48*gripScale-pelvis.position.z;
        const ay=targetY*Math.cos(lean)+targetZ*Math.sin(lean)-.385;
        const az=-targetY*Math.sin(lean)+targetZ*Math.cos(lean);
        const length=T.MathUtils.clamp(Math.hypot(ay,az),.03,.534);
        const elbow=-(Math.PI-Math.acos(T.MathUtils.clamp((.28**2+.255**2-length**2)/(2*.28*.255),-1,1)));
        const shoulder=Math.atan2(-az,-ay)+Math.acos(T.MathUtils.clamp((.28**2+length**2-.255**2)/(2*.28*length),-1,1));
        arm.shoulder.rotation.set(shoulder,0,0);arm.elbow.rotation.x=elbow;
      }
    }
    if(motion?.truckRiding){
      const currentSpeed=motion.truckSpeed??0,moving=Math.min(1,Math.abs(currentSpeed)/12);
      const speedChange=wasTruckRiding&&dt>0?(currentSpeed-truckPreviousSpeed)/dt:0;
      truckPreviousSpeed=currentSpeed;wasTruckRiding=true;
      if(!reduced){
        truckPhase+=dt*(2.8+moving*1.4);
        truckLean=T.MathUtils.damp(truckLean,T.MathUtils.clamp(-speedChange*.003,-.08,.08),6,dt);
        truckSway=T.MathUtils.damp(truckSway,T.MathUtils.clamp(turn*.2,-.08,.08)*moving+Math.sin(truckPhase)*.025*moving,6,dt);
      }else{truckLean=0;truckSway=0;}
      pelvis.position.set(0,.44,-.28);pelvis.rotation.set(0,0,0);torso.rotation.set(.1+truckLean,0,truckSway);head.rotation.set(-.1-truckLean*.5,0,-truckSway*.45);
      for(let i=0;i<2;i++){const side=i===0?-1:1;legs[i].hip.rotation.set(-1.4,0,side*.1);legs[i].knee.rotation.x=1.35;legs[i].ankle.rotation.x=.05;arms[i].shoulder.rotation.set(-.4,0,side*.18);arms[i].elbow.rotation.x=-.65;}
    }
    if(!motion?.truckRiding){wasTruckRiding=false;truckPreviousSpeed=0;truckLean=0;truckSway=0;truckPhase=0;}
    if(motion?.travelMode==='moped'&&(motion.mopedStand??0)>0){
      const stand=motion.mopedStand!;pelvis.position.y+=.62*stand;torso.rotation.x*=1-stand;head.rotation.x*=1-stand;
      for(let i=0;i<2;i++){const side=i===0?-1:1;legs[i].hip.rotation.x*=1-stand;legs[i].knee.rotation.x*=1-stand;legs[i].ankle.rotation.x*=1-stand;arms[i].shoulder.rotation.x*=1-stand;arms[i].shoulder.rotation.z=side*1.1*stand;arms[i].elbow.rotation.x*=1-stand;}
    }
    for(let index=0;index<arms.length;index++){
      const arm=arms[index],side=index===0?-1:1,detail=flowingBody&&!reduced?amount*(1-.7*action):0;
      const follow=Math.sin(phase+index*Math.PI-.65),channel=14+index*4;
      // Forearm rotation and a delayed, relaxed wrist follow the arm swing.
      // Rest/vehicles reset these joints; no secondary animation timer is needed.
      arm.elbow.rotation.y=inertialResponse(bodyResponse,channel,side*(.12+.16*follow)*detail,dt,26,resetBody,transitionBody);
      arm.hand.rotation.set(
        inertialResponse(bodyResponse,channel+1,(-.08+.14*follow)*detail,dt,24,resetBody,transitionBody),
        inertialResponse(bodyResponse,channel+2,side*.08*detail,dt,24,resetBody,transitionBody),
        inertialResponse(bodyResponse,channel+3,side*(.06+.08*Math.cos(phase+index*Math.PI-.65))*detail,dt,24,resetBody,transitionBody));
    }
    const freeFlight=motion?.travelMode==='jetpack'&&!motion.parachute&&!motion.rocketboard&&!motion.flyingCar&&!motion.rooftopPose;
    if(!freeFlight){flightActive=false;flightClock=0;}
    if(motion?.travelMode==='jetpack'){
      const flight=motion.flight,compress=flight?.compression??0,p=flight?.progress??1;
      const takeoff=flight?.phase==='takeoff',landing=flight?.phase==='landing';
      const air=takeoff?smooth(p/.5):landing?1-smooth((p-.4)/.5):1;
      const launch=takeoff?Math.sin(p*Math.PI):0,brace=landing?smooth((p-.2)/.45)*(1-smooth((p-.78)/.22)):0;
      const cruise=T.MathUtils.clamp((flight?.pitch??0)/.5,0,1),boost=Math.max(0,(flight?.thrust??1)-1);
      const drive=reduced?0:flight?.acceleration??acceleration/5,steer=reduced?0:flight?.turn??T.MathUtils.clamp(turn,-1,1);
      if(freeFlight&&!reduced)flightClock+=dt*(2.1+cruise*.9+boost*.4);
      const flow=reduced?0:air*(.055+cruise*.07+boost*.025),sway=Math.sin(flightClock)*flow;
      // Joint-specific lag lets the hips lead, knees follow and feet trail.
      // This runs only in the existing player update; no new animation loop.
      const follow=(index:number,value:number,rate:number)=>{
        flightJoints[index]=!flightActive||discontinuity?value:T.MathUtils.damp(flightJoints[index],value,rate,dt);
        return flightJoints[index];
      };
      pelvis.position.set(0,.88+.13*air-compress,0);
      pelvis.rotation.set(0,follow(0,-steer*.13,4),follow(1,-steer*.055+sway*.16,5));
      torso.rotation.set(.035+compress*.7+drive*.06,follow(2,steer*.16,7),follow(3,-steer*.11-sway*.3,6));
      head.rotation.set(follow(4,-.04-cruise*.11-compress*.25+brace*.1,9),follow(5,steer*.32,10),follow(6,steer*.07,8));
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,leg=legs[i],arm=arms[i],n=7+i*11;
        const wave=Math.sin(flightClock+i*1.8)*flow,lag=Math.sin(flightClock-.75+i*1.8)*flow;
        leg.hip.rotation.set(follow(n,.06*air+cruise*.12+drive*.12+wave-.13*brace-compress*2.1,4.5),follow(n+1,-steer*.13,3.5),side*(.045+.055*brace)+follow(n+2,-steer*.09,4));
        leg.knee.rotation.x=follow(n+3,.1+.23*air+.2*launch+cruise*.14+Math.max(0,drive)*.18+lag*.9+compress*4.2,5);
        leg.ankle.rotation.set(follow(n+4,-.08-.12*air-cruise*.13-lag*.65+compress*.35,3.5),0,follow(n+5,steer*.06,4));
        arm.shoulder.rotation.set(follow(n+6,-.12-.22*launch-compress*.8+cruise*.6-boost*.18-drive*.16+wave*.7,7),side*cruise*.1,follow(n+7,side*(.2+.16*brace+cruise*.13)+steer*.14+sway*.4,6));
        arm.elbow.rotation.x=follow(n+8,-.48-.2*launch-.25*brace+cruise*.18-lag*.8-drive*.12,5);
        if(freeFlight)arm.hand.rotation.set(follow(n+9,-drive*.16+lag*.6,4),0,follow(n+10,side*.08+steer*.12,4));
      }
      flightActive=freeFlight;
    }
    if(motion?.travelMode==='jetpack'&&motion.rocketboard){
      pelvis.position.set(0,.96,0);pelvis.rotation.set(0,.35,0);torso.rotation.set(.04,-.2,0);
      for(let i=0;i<2;i++){const side=i===0?-1:1;legs[i].hip.rotation.set(side*.15,0,side*.3);legs[i].knee.rotation.x=.23;legs[i].ankle.rotation.x=-.2;arms[i].shoulder.rotation.set(-.2,0,side*.6);arms[i].elbow.rotation.x=-.3;}
    }
    if(motion?.travelMode==='jetpack'&&motion.flyingCar){
      pelvis.position.set(0,1.0,-.1);pelvis.rotation.set(0,0,0);torso.rotation.set(.08,0,0);head.rotation.set(-.08,0,0);
      for(const leg of legs){leg.hip.rotation.set(-1.1,0,0);leg.knee.rotation.x=1.25;leg.ankle.rotation.x=-.15;}
      for(const arm of arms){arm.shoulder.rotation.set(-.95,0,0);arm.elbow.rotation.x=-.5;}
    }
    if(motion?.shotStep!==undefined){
      const phase=motion.shotStep*Math.PI*4;
      for(let i=0;i<2;i++){const side=i===0?-1:1,stride=Math.sin(phase+i*Math.PI);legs[i].hip.rotation.x=stride*.42;legs[i].knee.rotation.x=.15+Math.max(0,-stride)*.45;legs[i].ankle.rotation.x=-Math.max(0,-stride)*.15;arms[i].shoulder.rotation.set(-stride*.3,0,side*.25);arms[i].elbow.rotation.x=-.35;}
    }
    if(!motion?.parachute)parachutePhase=0;
    if(motion?.parachute){
      if(!reduced)parachutePhase+=dt*2.8;
      const spin=reduced?0:T.MathUtils.clamp(motion.parachuteSpin??0,0,1);
      const juggle=motion.parachuteJuggle;
      // Counter-rotate the shoulders against trailing hips. Transfer weight toward
      // each touch continuously, including the boundary between alternating feet.
      const balance=juggle&&!reduced?juggle.side*Math.sin(juggle.phase*Math.PI):0;
      const sway=Math.sin(parachutePhase)*spin;
      pelvis.position.set(balance*.025,.94-spin*.025,spin*.035);
      pelvis.rotation.set(spin*.07,-spin*.24+sway*.055,-spin*.12+balance*.045);
      torso.rotation.set(spin*.09,spin*.4-sway*.09,-spin*.13-balance*.07+T.MathUtils.clamp(-turn*.12,-.12,.12));
      head.rotation.set(juggle?.12:0,spin*.12,-torso.rotation.z*.35);
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,swing=reduced?0:Math.sin(parachutePhase+i*Math.PI);
        arms[i].shoulder.rotation.set(-2.5+side*turn*.15-side*spin*.12,-spin*.1,side*(.3+spin*.06));
        arms[i].elbow.rotation.x=-.3-spin*.08;
        legs[i].hip.rotation.set(-.12+swing*.22+spin*.16,-spin*.16,side*(.08+spin*.1));
        legs[i].knee.rotation.x=.28+Math.max(0,swing)*.16+spin*.16;
        legs[i].ankle.rotation.x=-.12-swing*.08-spin*.06;
        if(juggle){
          const tap=side===juggle.side?Math.sin(Math.PI*Math.min(1,juggle.phase/.32)):0;
          legs[i].hip.rotation.x=-.12+spin*.08-tap*(reduced?.3:.65);
          legs[i].knee.rotation.x=.28+spin*.12+tap*.15;
          legs[i].ankle.rotation.x=-.12-spin*.04+tap*.2;
        }
      }
    }
    if(motion?.rooftopPose){
      const pose=motion.rooftopPose, frantic=pose==='hang'||pose==='fall', dizzy=pose==='dizzy';
      const wobble=reduced?0:Math.sin(time*5)*.18;
      pelvis.position.set(0,.93,0);pelvis.rotation.set(0,0,0);
      torso.rotation.set(dizzy?.16:0,0,dizzy?wobble:0);
      head.rotation.set(dizzy?.12:-.2,dizzy?wobble*1.5:0,dizzy?-wobble:.12);
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,cycle=reduced?0:Math.sin(time*(pose==='fall'?24:32)+i*Math.PI);
        legs[i].hip.rotation.set(frantic?cycle*1.15:dizzy?0:-.15,0,side*.12);
        legs[i].knee.rotation.x=frantic?.5+Math.max(0,-cycle)*1.1:.18;
        legs[i].ankle.rotation.x=frantic?-cycle*.45:0;
        arms[i].shoulder.rotation.set(frantic?-.4+cycle*.55:0,0,side*(dizzy?.55:2.3)+(frantic&&!reduced?cycle*.28:0));
        arms[i].elbow.rotation.x=frantic?-.7:-.25;
      }
    }
    if(motion?.stunAge!==undefined){
      const age=motion.stunAge,weight=smooth(age/.08)*(1-smooth((age-3.2)/.4)),down=age<1.15?1:1-smooth((age-1.15)/.7),flail=reduced?0:Math.exp(-age*1.7),dizzy=reduced?0:Math.sin(age*8)*.15;
      torso.rotation.x+=(.16*down+.08*(reduced?0:Math.sin(age*5)))*weight;head.rotation.z=dizzy*weight;head.rotation.x=.12*weight;
      for(let i=0;i<2;i++){const side=i===0?-1:1,flutter=Math.sin(age*21+i*2.4)*flail;
        arms[i].shoulder.rotation.set((-1.2*down+flutter*.75)*weight,0,side*(.7*down+.35+(1-down)*dizzy)*weight);
        arms[i].elbow.rotation.x=(-.6-.45*down+flutter*.4)*weight;
        legs[i].hip.rotation.x=(-.55*down+flutter*.45)*weight;legs[i].hip.rotation.z=side*.2*down*weight;
        legs[i].knee.rotation.x=(.85*down+Math.cos(age*17+i)*flail*.25)*weight;legs[i].ankle.rotation.x=(-.18*down-flutter*.15)*weight;
      }
    }
    if(motion?.wallSplat){pelvis.position.set(0,.94,0);pelvis.rotation.set(0,0,0);torso.rotation.set(0,0,0);head.rotation.set(0,0,0);for(let i=0;i<2;i++){const side=i===0?-1:1;arms[i].shoulder.rotation.set(0,0,side*2);arms[i].elbow.rotation.x=-.12;legs[i].hip.rotation.set(0,0,side*.5);legs[i].knee.rotation.x=.1;legs[i].ankle.rotation.x=0;}}
    // Gait-specific spine coupling. The carrier still owns balance/action lean;
    // the waist and ribcage articulate independently without disturbing leg IK.
    const spineEffort=flowingBody?effort*(1-action)*(1-receive)*(1-brake):0;
    const spinePhase=phase-.25-.22*backpedal+.18*shuffle;
    const strikeSpine=flowingBody? action*(strikeKind==='pass'?.5:1):0;
    const twist=.055*Math.sin(spinePhase)*spineEffort*(1-.55*backpedal)*(1-.45*shuffle);
    const waistTurn=kickSide*(-.035*strike.load+.025*strike.drive)*strikeSpine;
    const chestTurn=kickSide*(-.045*strike.load+.075*strike.follow)*strikeSpine;
    const bend=.022*Math.cos(phase*2-.4)*spineEffort*(1-.6*backpedal);
    const sway=.032*Math.sin(phase-.55)*spineEffort;
    lumbar.rotation.set(
      inertialResponse(spineResponse,0,bend+.018*strike.drive*strikeSpine,dt,30,resetBody,transitionBody),
      inertialResponse(spineResponse,1,-twist*.6+waistTurn,dt,30,resetBody,transitionBody),
      inertialResponse(spineResponse,2,sway,dt,30,resetBody,transitionBody));
    chest.rotation.set(
      inertialResponse(spineResponse,3,-bend*.55+.025*strike.follow*strikeSpine,dt,34,resetBody,transitionBody),
      inertialResponse(spineResponse,4,twist+chestTurn,dt,34,resetBody,transitionBody),
      inertialResponse(spineResponse,5,-sway*.65,dt,34,resetBody,transitionBody));
    applySpineSurface(jersey,lumbar.rotation,chest.rotation);
    // Keep the gaze stable while the upper spine moves beneath it.
    head.rotation.x-=(lumbar.rotation.x+chest.rotation.x)*.65;
    head.rotation.z-=(lumbar.rotation.z+chest.rotation.z)*.65;
    root.position.set(x, 0, z); root.rotation.y = yaw;
    // A rolling ball follows a quiet forward lane; the feet meet that lane.
    // Do not feed IK corrections back into the ball's trajectory.
    const nextLead=.6+.025*sprint;
    dribbleLead=hardReset?nextLead:frozen?dribbleLead:T.MathUtils.damp(dribbleLead,nextLead,12,dt);
    previousX = x; previousZ = z; initialized = true;
  };
  const dribbleContact=(out:T.Vector3)=>{
    const scale=Math.abs(root.scale.x);
    return out.set(root.position.x+Math.sin(yaw)*dribbleLead*scale,root.position.y+.19,root.position.z+Math.cos(yaw)*dribbleLead*scale);
  };
  return { root, update, dribbleContact, ballContact:(side:-1|1,out:T.Vector3)=>{if(dribbleActive)return dribbleContact(out);root.updateWorldMatrix(true,true);legs[side===-1?0:1].ankle.localToWorld(out.copy(contactOffsets[side===-1?0:1]).divideScalar(P.legs));const forward=(out.x-root.position.x)*Math.sin(yaw)+(out.z-root.position.z)*Math.cos(yaw);if(forward<contactLead){out.x+=Math.sin(yaw)*(contactLead-forward);out.z+=Math.cos(yaw)*(contactLead-forward);}
 out.y=Math.max(root.position.y+.19,out.y);return out;}, get juggleHead(){return juggleHead;}, get rideTurnRoll(){return rideTurnRoll;}, get bikeRoll(){return bikeRoll;}, get profileScale(){return profileScale;}, get profile(){return P;}, setAppearance, setProfile, handPositions:(left:T.Vector3,right:T.Vector3)=>{root.updateWorldMatrix(true,true);arms[0].elbow.localToWorld(left.set(0,-.265,0));arms[1].elbow.localToWorld(right.set(0,-.265,0));}, dispose: () => { clubCostume?.dispose();spineSurfaces.dispose();geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); root.removeFromParent(); } };
}
