import {batchRigidMeshes} from './batchMeshes';
import type {JuggleTouch} from '../town/walkBall';
import * as T from 'three';
import type { CharacterCustomization } from '../town/customization';
import type { FlightPose } from './flightMotion';
import type { TravelMode } from '../town/travelModes';
import {createClubCostume} from './clubCostume';

export const PLAYER_KICK_CONTACT = .36;
export type PlayerMotion = {
  /** World heading in radians, including while stationary or receiving. */
  facing?: number;
  /** Optional world-space ball attention; supplied only for involved actors. */
  lookX?: number;
  lookZ?: number;
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
  turnSmoothing?: number;
  flight?: FlightPose;
  rooftopPose?: 'hang'|'fall'|'dizzy';
};
const smooth = (value: number) => { const t = T.MathUtils.clamp(value, 0, 1); return t * t * (3 - 2 * t); };

// Visual rig only. The lesson remains the authority for world position.
export type PlayerRig = {
  readonly bikeRoll: number;
  readonly rideTurnRoll: number;
  readonly juggleHead: {bottom:number;top:number;front:number;width:number}|undefined;
  root: T.Group;
  ballContact: (side:-1|1,out:T.Vector3) => T.Vector3;
  handPositions: (left:T.Vector3,right:T.Vector3) => void;
  setAppearance: (value: CharacterCustomization) => void;
  update: (x: number, z: number, dt: number, time: number, reduced: boolean, motion?: PlayerMotion) => void;
  dispose: () => void;
};

export function createPlayer(id: string, team: string, mergeRigidParts=true): PlayerRig {
  const root = new T.Group(), pelvis = new T.Group(), torso = new T.Group();pelvis.name='player-pelvis';
  torso.name='armor-torso'; root.add(pelvis); pelvis.position.y = .88; pelvis.add(torso);
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
  const profile = [[.145, 0], [.155, .08], [.175, .23], [.245, .38], [.225, .43], [.105, .49]].map(([r,y]) => new T.Vector2(r,y));
  const jersey = mesh(new T.LatheGeometry(profile, 20), shirt, torso); jersey.scale.z = .64;
  ellipsoid(torso, trim, 0, .49, 0, .115, .028, .085);
  mesh(new T.CylinderGeometry(.063, .073, .11, 12), skin, torso, 0, .535);
  const head = new T.Group(); head.name='player-head';head.position.set(0, .69, .005); torso.add(head);
  ellipsoid(head, skin, 0, 0, 0, .127, .17, .125);
  ellipsoid(head, skin, 0, -.015, .12, .033, .036, .04);
  for (const side of [-1,1]) ellipsoid(head, skin, side * .126, -.008, 0, .026, .044, .029);
  const cap = mesh(new T.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * .52), hair, head, 0, .045, -.01);
  cap.scale.set(.131, seed % 3 === 0 ? .15 : .125, .13);
  const legs: { hip: T.Group; knee: T.Group; ankle: T.Group }[] = [];
  const arms: { shoulder: T.Group; elbow: T.Group }[] = [];
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
    const shoulder = new T.Group(); shoulder.name=side<0?'left-shoulder':'right-shoulder'; shoulder.position.set(side * .235, .385, 0); torso.add(shoulder);
    ellipsoid(shoulder, shirt, 0, -.055, 0, .094, .125, .092);
    segment(shoulder, skin, .28, .065, .049);
    const elbow = new T.Group(); elbow.name=side<0?'left-elbow':'right-elbow'; elbow.position.y = -.28; shoulder.add(elbow);
    segment(elbow, skin, .255, .051, .035);
    ellipsoid(elbow, skin, 0, -.265, 0, .041, .063, .04);
    shoulder.rotation.z = side * .12; arms.push({ shoulder, elbow });
  }
  const longHair=new T.Group();longHair.name='female-long-hair';head.add(longHair);longHair.visible=false;
  // A low side ponytail stays clear of the jetpack; cheek-length strands frame the face.
  const hairCurve=new T.CatmullRomCurve3([new T.Vector3(.015,.035,-.135),new T.Vector3(.045,-.1,-.19),new T.Vector3(.16,-.29,-.19),new T.Vector3(.205,-.46,-.12)]);
  mesh(new T.TubeGeometry(hairCurve,16,.062,8,false),hair,longHair).name='long-ponytail';
  ellipsoid(longHair,hair,.205,-.46,-.12,.052,.078,.055);
  const tie=ellipsoid(longHair,trim,.035,-.055,-.175,.066,.024,.061);tie.rotation.z=-.18;
  for(const side of [-1,1]){const strand=ellipsoid(longHair,hair,side*.123,-.105,.012,.038,.205,.083);strand.rotation.z=side*.12;}
  const fringe=ellipsoid(longHair,hair,-.035,.115,.072,.115,.045,.075);fringe.rotation.z=-.3;
  const maleJersey=jersey.geometry,femaleJersey=new T.LatheGeometry([[.155,0],[.15,.08],[.16,.23],[.222,.38],[.205,.43],[.105,.49]].map(([r,y])=>new T.Vector2(r,y)),20);geometries.push(femaleJersey);
  const captainBand=mesh(new T.CylinderGeometry(.098,.098,.065,12),trim,arms[0].shoulder,0,-.1);captainBand.visible=false;
  const explorerHat=mesh(new T.CylinderGeometry(.2,.2,.035,16),shorts,head,0,.145);explorerHat.visible=false;
  const stripe=mesh(new T.BoxGeometry(.29,.065,.018),trim,torso,0,.28,.137);stripe.visible=false;
  const jacketZip=mesh(new T.BoxGeometry(.012,.34,.018),trim,torso,0,.23,.14);jacketZip.visible=false;
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
  const setAppearance=(value:CharacterCustomization)=>{
    skin.color.set({warm:'#bc8562',deep:'#765039',light:'#d4a17c'}[value.face]);
    shirt.color.set({classic:'#edb957',coast:'#356478',sunset:'#c8734f'}[value.clothing]);
    shorts.color.set(value.clothing==='sunset'?'#655549':'#26453e');
    const female=value.character==='female';longHair.visible=female;jersey.geometry=female?femaleJersey:maleJersey;
    arms.forEach((arm,i)=>arm.shoulder.position.x=(i===0?-1:1)*(female?.22:.235));
    captainBand.visible=value.character==='captain';explorerHat.visible=value.character==='explorer';
    head.scale.set((value.face==='deep'?1.07:value.face==='light'?.94:1)*(female?.96:1),1,1);
    torso.scale.x=value.body==='strong'?1.14:value.body==='slim'?.88:1;
    stripe.visible=value.clothing==='coast';jacketZip.visible=value.clothing==='sunset';
    const nextCostume=value.costume??'none';
    if(nextCostume!==costumeId){clubCostume?.dispose();clubCostume=createClubCostume(nextCostume,id,{head,torso,pelvis,arms,legs});costumeId=nextCostume;cacheBodyTransforms();}
    if(clubCostume){const b=clubCostume.headBounds;juggleHead={bottom:1.57+b.min.y,top:1.57+b.max.y,front:b.max.z,width:Math.max(Math.abs(b.min.x),Math.abs(b.max.x))*head.scale.x*torso.scale.x};}else juggleHead=undefined;
    if(clubCostume){longHair.visible=false;explorerHat.visible=false;cap.visible=false;}else cap.visible=true;
  };
  let bikeRoll = 0, rideTurnRoll=0, ridePhase=0, parachutePhase = 0;
  let initialized = false, previousX = 0, previousZ = 0, phase = seed, speed = 0, yaw = team === 'home' ? Math.PI : 0;
  let acceleration = 0, turn = 0, attentionYaw = 0, turnLead = 0;
  let truckPreviousSpeed=0,truckLean=0,truckSway=0,truckPhase=0,wasTruckRiding=false;
  const update = (x: number, z: number, dt: number, time: number, reduced: boolean, motion?: PlayerMotion) => {
    // A seek/teleport must not look like a sprint. Cap integration after a suspended tab.
    dt = Math.max(0, Math.min(dt, .1));
    const dx = x - previousX, dz = z - previousZ, distance = Math.hypot(dx, dz);
    const discontinuity = !initialized || !!motion?.resumePose || distance > (motion?.travelMode && motion.travelMode !== 'walk' ? 3 : 1.2);
    const velocity = motion?.truckRiding || discontinuity || dt <= 0 ? 0 : Math.min(distance / dt, 8);
    const oldSpeed = speed;
    speed = motion?.truckRiding || discontinuity ? 0 : T.MathUtils.damp(speed, velocity, 12, dt);
    acceleration = T.MathUtils.damp(acceleration, dt > 0 ? T.MathUtils.clamp((speed-oldSpeed)/dt, -5, 5) : 0, 8, dt);
    const previousYaw = yaw;
    let delta = 0;
    if (motion?.facing !== undefined || velocity > .05) {
      const target = motion?.facing ?? Math.atan2(dx, dz);
      delta = Math.atan2(Math.sin(target-yaw), Math.cos(target-yaw));
      if (discontinuity || dt===0) yaw = target;
      else yaw += delta * (1-Math.exp(-dt*(motion?.turnSmoothing??10)));
    }
    turn = T.MathUtils.damp(turn, discontinuity ? 0 : delta, 9, dt);
    const localForward=distance>.00001?(dx*Math.sin(yaw)+dz*Math.cos(yaw))/distance:1;
    const localSide=distance>.00001?(dx*Math.cos(yaw)-dz*Math.sin(yaw))/distance:0;
    const amount = smooth(speed / 1.5), run = smooth((speed-1.5)/4);

    const kick = T.MathUtils.clamp(motion?.kick ?? 0, 0, 1);
    const action = smooth(kick/.12) * (1-smooth((kick-.72)/.28));
    // A receiving pose yields continuously to the kick, without delaying ball contact.
    const receive = smooth(motion?.receive ?? 0)*(1-action);
    const kickSide = motion?.kickSide ?? 1;
    const rideBase = !!motion?.truckRiding || !!motion?.travelMode && motion.travelMode !== 'walk';
    const anticipates = !rideBase && !reduced && !discontinuity && dt > 0;
    const yawRate = anticipates ? Math.atan2(Math.sin(yaw-previousYaw),Math.cos(yaw-previousYaw))/dt : 0;
    turnLead = discontinuity || reduced ? 0 : T.MathUtils.damp(turnLead,T.MathUtils.clamp(yawRate*.025,-.1,.1),10,dt);
    // Same original-island movement principles, retargeted to II's shorter procedural limbs.
    // Travel drives gait; no clock-driven running while the replay is paused.
    const stride = (1.1 + .8*run) * (motion?.dribbling ? .82 : 1);
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
    const effort = amount*(1-.8*action)*(1-.35*receive);
    const bank = T.MathUtils.clamp(turn*speed*.055, -.18, .18)*effort;
    const coil = Math.sin(phase-.25)*(.055+.065*run)*effort;
    const breathing = reduced ? 0 : Math.sin(time*2+seed)*.004*(1-amount);
    pelvis.position.z = 0;
    pelvis.position.y = .88 + Math.cos(phase*2)*.012*effort + breathing - .018*receive - .012*action;
    pelvis.rotation.set(0, -coil*.35 + receive*.14*kickSide, -bank*.3);
    torso.rotation.set((.045+.10*run+.06*acceleration/5)*effort + .08*receive - .035*action,
      coil + (turn*.08+turnLead)*effort - .12*receive*kickSide - Math.sin(kick*Math.PI*2)*.13*action*kickSide,
      -bank + Math.sin(phase-.45)*.02*effort - kickSide*.07*action);
    head.rotation.y = reduced ? 0 : T.MathUtils.clamp(turn*.25,-.25,.25)*amount + Math.sin(time*.7+seed)*.05*(1-amount);
    head.rotation.x = -.035*effort + .04*receive;
    // Ride/flight/truck branches fully replace these limbs. Keep shared gait clocks,
    // but do not solve two walking legs whose transforms would be discarded.
    if (!rideBase) {
    for (let index = 0; index < legs.length; index++) {
      const { hip, knee, ankle } = legs[index];
      const side = index === 0 ? -1 : 1;
      const cycle = ((phase/(Math.PI*2)+index*.5)%1+1)%1;
      const stance = cycle < .6;
      const t = stance ? cycle/.6 : (cycle-.6)/.4;
      const swing = Math.sin(t*Math.PI);
      // Stance speed matches travel (stride * .6), with swing clearance and flat support feet.
      const reachZ = stride*.3;
      let footZ = (stance ? reachZ-2*reachZ*t : -reachZ+2*reachZ*smooth(t))*amount;
      let footX=footZ*localSide*.65;
      footZ*=localForward;
      let lift = stance ? 0 : swing*(.12+.12*run)*amount;
      if (action > 0) {
        let actionZ = -.025, actionLift = 0;
        if (side === kickSide) {
          // Wind-up -> ball contact -> follow-through -> recovery. Other leg bears weight.
          actionZ = kick < .16 ? -.27*smooth(kick/.16)
            : kick < PLAYER_KICK_CONTACT ? -.27+.66*smooth((kick-.16)/(PLAYER_KICK_CONTACT-.16))
            : .39*(1-smooth((kick-PLAYER_KICK_CONTACT)/(1-PLAYER_KICK_CONTACT)));
          actionLift = .065 + .11*Math.sin(kick*Math.PI);
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
        footZ += (.18-footZ)*receive;
        lift += (.055-lift)*receive;
      }
      // Compensate pelvis bob so the stance sole does not bob through the ground.
      const footY = .075-pelvis.position.y+lift;
      const reach = Math.max(.031, Math.min(Math.hypot(footY,footZ), .828));
      const hipAngle = Math.atan2(-footZ,-footY)-Math.acos(T.MathUtils.clamp((.43**2+reach**2-.40**2)/(2*.43*reach),-1,1));
      const kneeAngle = Math.PI-Math.acos(T.MathUtils.clamp((.43**2+.40**2-reach**2)/(2*.43*.40),-1,1));
      hip.rotation.set(hipAngle, side===kickSide ? receive*side*.18 : 0, Math.atan2(footX*(1-action)*(1-receive),-footY)-side*.025*action);
      knee.rotation.x = kneeAngle;
      ankle.rotation.x = -hipAngle-kneeAngle + (stance ? 0 : -.12*swing*effort);
      const arm = arms[index];
      arm.shoulder.rotation.x = Math.sin(phase+index*Math.PI-.2)*(.32+.23*run)*effort - .16*receive;
      arm.shoulder.rotation.z = side*(.12+.16*action+.09*receive) - bank*.3;
      arm.elbow.rotation.x = -.2-.65*effort-.12*action;
    }
    if(motion?.juggle!==undefined){
      const tap=Math.max(0,1-(motion.juggle%1)/.32),kind=motion.juggleTouch??'foot';
      if(kind==='shoulder'){torso.rotation.z-=kickSide*.15*tap;arms[kickSide===-1?0:1].shoulder.rotation.z+=kickSide*.22*tap;head.rotation.z=kickSide*.12*tap;}
      else head.rotation.z=0;
      if(kind==='head'){head.rotation.x-=.2*tap;pelvis.position.y+=.045*tap;torso.rotation.x-=.07*tap;}
    }else head.rotation.z=0;
    }
    // Only involved, nearby actors track the ball. No scene queries or extra loops.
    if (!rideBase && !motion?.parachute && !motion?.rooftopPose && motion?.stunAge===undefined && !motion?.juggle && !motion?.powerKick && !reduced && !clubCostume) {
      let target = 0;
      if (motion?.lookX!==undefined && motion.lookZ!==undefined) {
        const lx=motion.lookX-x,lz=motion.lookZ-z,d2=lx*lx+lz*lz;
        if(d2>.09&&d2<400)target=T.MathUtils.clamp(Math.atan2(Math.sin(Math.atan2(lx,lz)-yaw),Math.cos(Math.atan2(lx,lz)-yaw)),-.55,.55);
      }
      attentionYaw=discontinuity?0:T.MathUtils.damp(attentionYaw,target,9,dt);
      head.rotation.y=T.MathUtils.clamp(head.rotation.y+attentionYaw+turnLead*effort,-.65,.65);
    } else attentionYaw=0;
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
        const reach=T.MathUtils.clamp(Math.hypot(y,z),.035,.828);
        const hip=Math.atan2(-z,-y)-Math.acos(T.MathUtils.clamp((.43**2+reach**2-.4**2)/(2*.43*reach),-1,1));
        const knee=Math.PI-Math.acos(T.MathUtils.clamp((.43**2+.4**2-reach**2)/(2*.43*.4),-1,1));
        leg.hip.rotation.set(hip,0,0);leg.knee.rotation.x=knee;leg.ankle.rotation.x=-hip-knee;
        if(superman){leg.hip.rotation.x=T.MathUtils.lerp(hip,1.4,superman);leg.knee.rotation.x=T.MathUtils.lerp(knee,.12,superman);leg.ankle.rotation.x=T.MathUtils.lerp(-hip-knee,-.1,superman);}
        const arm=arms[i], lean=torso.rotation.x;
        const gripScale=motion.travelMode==='moped'?1.12:1;
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
    if(motion?.travelMode==='jetpack'){
      const flight=motion.flight, compress=flight?.compression??0;
      const sway=reduced?0:Math.sin(time*3.1-.5)*.06;
      const launch=flight?.phase==='takeoff'?Math.sin(flight.progress*Math.PI):0;
      const dashLean=Math.max(0,Math.min(1,((flight?.pitch??0)-.5)/.7));
      const cruise=Math.max(0,Math.min(1,(flight?.pitch??0)/.5)),boost=Math.max(0,(flight?.thrust??1)-1);
      const brace=flight?.phase==='landing'?smooth((flight.progress-.4)/.3):0;
      pelvis.position.set(0,1.01-compress,0);pelvis.rotation.set(0,sway*.25,0);
      torso.rotation.set(.06+compress*.45,0,-sway*.3);head.rotation.set(-.06-compress*.3,0,sway*.15);
      for(let i=0;i<2;i++){
        const side=i===0?-1:1,leg=legs[i],arm=arms[i];
        leg.hip.rotation.set(.04+.14*launch-.15*brace+compress*.2,0,side*(.055+.045*brace));
        leg.knee.rotation.x=.23+.32*launch+.8*compress+.07*side*sway;
        leg.ankle.rotation.x=-.17-.16*launch;
        // Arms remain connected at the shoulder; elbows absorb pack sway and braking.
        arm.shoulder.rotation.set(-.18-.13*launch-compress*.5+cruise*.65+dashLean*.5-boost*.28+(reduced?0:Math.sin(time*4+i*.8)*.12*(.3+cruise+boost*.4)),side*cruise*.12,side*(.27+.13*brace+cruise*.15+boost*.16)+sway);
        arm.elbow.rotation.x=-.65-.13*launch-.2*brace+cruise*.3+dashLean*.35-boost*.2+side*sway+(reduced?0:Math.sin(time*4-.7+i*.8)*.13*(cruise+boost*.4));
      }
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
    if(motion?.powerKick&&motion?.shotStep===undefined){
      const power=motion.shotPower??0,held=motion.shotCharge!==undefined,prep=Math.min(1,kick/PLAYER_KICK_CONTACT),release=smooth((prep-.55)/.45),follow=smooth((kick-PLAYER_KICK_CONTACT)/(1-PLAYER_KICK_CONTACT));
      const load=held?(.65+.35*(motion.shotCharge??0)):(1-release)*smooth(prep/.55),swing=held?0:release*(1-follow);
      pelvis.position.y-=.07*load+.035*swing;pelvis.rotation.y=-kickSide*.25*load+kickSide*.16*swing;
      torso.rotation.set(-(.23+power*.1)*load+(.34+power*.1)*swing,-kickSide*(.5+power*.22)*load+kickSide*(.38+power*.22)*swing,-kickSide*.14*load);
      head.rotation.x=.1*load;head.rotation.y=kickSide*.15*load;
      for(let i=0;i<2;i++){const side=i===0?-1:1,striking=side===kickSide;
        legs[i].hip.rotation.x=striking?(.75+power*.2)*load-(1.05+power*.2)*swing:-.12*load+(held?0:Math.sin(prep*Math.PI*2)*.18*load);
        legs[i].knee.rotation.x=striking?.95*load+.1*swing:.23*load+.1*swing;
        legs[i].ankle.rotation.x=striking?-.25*load+.12*swing:-.1*load;
        arms[i].shoulder.rotation.set((striking?.4:-.55)*load+(striking?-.5:.4)*swing,0,side*(.65*load+.35*swing));arms[i].elbow.rotation.x=-.25-.35*load;
      }
    }
    if(motion?.shotStep!==undefined){
      const phase=motion.shotStep*Math.PI*4;
      for(let i=0;i<2;i++){const side=i===0?-1:1,stride=Math.sin(phase+i*Math.PI);legs[i].hip.rotation.x=stride*.42;legs[i].knee.rotation.x=.15+Math.max(0,-stride)*.45;legs[i].ankle.rotation.x=-Math.max(0,-stride)*.15;arms[i].shoulder.rotation.set(-stride*.3,0,side*.25);arms[i].elbow.rotation.x=-.35;}
    }
    if(!motion?.parachute)parachutePhase=0;
    if(motion?.parachute){
      if(!reduced)parachutePhase+=dt*2.8;
      pelvis.position.set(0,.94,0);torso.rotation.set(0,0,T.MathUtils.clamp(-turn*.12,-.12,.12));head.rotation.set(0,0,0);
      for(let i=0;i<2;i++){const side=i===0?-1:1,swing=reduced?0:Math.sin(parachutePhase+i*Math.PI);arms[i].shoulder.rotation.set(-2.5+side*turn*.15,0,side*.3);arms[i].elbow.rotation.x=-.3;legs[i].hip.rotation.set(-.12+swing*.22,0,side*.08);legs[i].knee.rotation.x=.28+Math.max(0,swing)*.16;legs[i].ankle.rotation.x=-.12-swing*.08;}
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
    root.position.set(x, 0, z); root.rotation.y = yaw;
    previousX = x; previousZ = z; initialized = true;
  };
  return { root, update, ballContact:(side:-1|1,out:T.Vector3)=>{root.updateWorldMatrix(true,true);legs[side===-1?0:1].ankle.localToWorld(out.set(0,-.025,.405));const forward=(out.x-root.position.x)*Math.sin(yaw)+(out.z-root.position.z)*Math.cos(yaw);if(forward<.48){out.x+=Math.sin(yaw)*(.48-forward);out.z+=Math.cos(yaw)*(.48-forward);}
 out.y=Math.max(root.position.y+.19,out.y);return out;}, get juggleHead(){return juggleHead;}, get rideTurnRoll(){return rideTurnRoll;}, get bikeRoll(){return bikeRoll;}, setAppearance, handPositions:(left:T.Vector3,right:T.Vector3)=>{root.updateWorldMatrix(true,true);arms[0].elbow.localToWorld(left.set(0,-.265,0));arms[1].elbow.localToWorld(right.set(0,-.265,0));}, dispose: () => { clubCostume?.dispose();geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); root.removeFromParent(); } };
}
