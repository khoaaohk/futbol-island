import * as T from 'three';
import {DEFAULT_CUSTOMIZATION,type CharacterCustomization} from '../town/customization';
import type { FlightPose } from './flightMotion';
import type { TravelMode } from '../town/travelModes';
import {createFlightExtras} from './flightExtras';

/** Procedural rides share one material palette; no external assets or animation loop. */
export function createVehicle() {
  const root = new T.Group(); root.name = 'island-vehicle';
  const metal = new T.MeshStandardMaterial({color:'#b4bbb0',roughness:.65});
  const rubber = new T.MeshStandardMaterial({color:'#303830',roughness:.95});
  const paint = new T.MeshStandardMaterial({color:'#c68853',roughness:.78});
  const cream = new T.MeshStandardMaterial({color:'#eee0bc',roughness:.8});
  const carAccent=new T.MeshStandardMaterial({color:'#68b878',roughness:.6});
  const exhaustMaterial=new T.MeshBasicMaterial({color:'#a6ff91',transparent:true,opacity:.82,depthWrite:false,toneMapped:false});
  const geometries: T.BufferGeometry[] = [];
  const groups = {} as Record<Exclude<TravelMode,'walk'>,T.Group>;
  const wheels: { mesh:T.Mesh; radius:number; mode:TravelMode }[] = [];
  const mesh = (group:T.Group,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number) => {
    geometries.push(geometry); const object=new T.Mesh(geometry,material);
    object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;group.add(object);return object;
  };
  const bar = (group:T.Group,a:number[],b:number[],radius=.025,material:T.Material=metal) => {
    const start=new T.Vector3(...a),end=new T.Vector3(...b),direction=end.clone().sub(start);
    const object=mesh(group,new T.CylinderGeometry(radius,radius,direction.length(),8),material,0,0,0);
    object.position.copy(start.add(end).multiplyScalar(.5));object.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
  };
  for(const mode of ['scooter','bike','moped'] as const) {
    const group=new T.Group();group.name=mode;groups[mode]=group;root.add(group);
    const radius=mode==='scooter'?.12:mode==='bike'?.32:.24;
    const rear=mode==='scooter'?-.4:-.53,front=mode==='scooter'?.5:.62;
    for(const z of [rear,front]) {
      const wheel=mesh(group,new T.TorusGeometry(radius-.035,.035,6,16),rubber,0,radius,z);wheel.rotation.y=Math.PI/2;
      // Spokes rotate with their wheel and make bicycle pedalling visually legible.
      for(let i=0;i<4;i++){const spoke=new T.Mesh(new T.BoxGeometry((radius-.035)*2,.014,.014),metal);geometries.push(spoke.geometry);spoke.rotation.z=i*Math.PI/4;wheel.add(spoke);}
      wheels.push({mesh:wheel,radius,mode});
    }
    if(mode==='scooter') {
      mesh(group,new T.BoxGeometry(.19,.065,.75),paint,0,.17,-.07);
      bar(group,[0,.17,.4],[0,1.25,.47],.032);
      bar(group,[0,.17,-.38],[0,.12,rear]);
    } else {
      const seat=[0,.94,-.12],crank=[0,.39,.03],head=[0,.91,.43];
      for(const [a,b] of [[seat,crank],[crank,head],[head,seat],[[0,radius,rear],seat],[[0,radius,rear],crank],[head,[0,radius,front]]])bar(group,a,b,mode==='bike'?.032:.045,paint);
      mesh(group,new T.BoxGeometry(mode==='bike'?.22:.32,.09,mode==='bike'?.28:.52),rubber,0,.92,mode==='bike'?-.15:-.18);
      if(mode==='moped') {
        mesh(group,new T.BoxGeometry(.3,.34,.45),paint,0,.59,.16);
        mesh(group,new T.BoxGeometry(.24,.15,.3),metal,0,.32,.01);
        mesh(group,new T.SphereGeometry(.11,10,6),cream,0,1.06,.52);
        bar(group,[-.22,.34,.13],[.22,.34,.13],.035);
      }
      bar(group,head,[0,1.13,.48],.025);
    }
    const handleY=mode==='scooter'?1.25:1.13;
    bar(group,[-.235,handleY,.48],[.235,handleY,.48]);
    for(const side of [-1,1])bar(group,[side*.18,handleY,.48],[side*.29,handleY,.48],.038,rubber);
  }
  const pack=new T.Group();pack.name='jetpack';groups.jetpack=pack;root.add(pack);
  mesh(pack,new T.BoxGeometry(.5,.5,.24),paint,0,1.25,-.3);
  const flames:T.Mesh[]=[];
  for(const side of [-1,1]){
    mesh(pack,new T.CylinderGeometry(.13,.13,.65,10),metal,side*.28,1.2,-.3);
    mesh(pack,new T.CylinderGeometry(.14,.1,.14,10),rubber,side*.28,.83,-.3);
    const flame=mesh(pack,new T.ConeGeometry(.1,.5,8),cream,side*.28,.52,-.3);flame.rotation.z=Math.PI;flame.castShadow=false;flames.push(flame);
  }
  const extras:Partial<Record<TravelMode,Record<string,T.Group>>>={};
  for(const mode of ['scooter','bike','moped'] as const){
    const group=new T.Group(),sport=new T.Group();group.name=mode+'-coast';sport.name=mode+'-sunset';groups[mode].add(group,sport);extras[mode]={coast:group,sunset:sport};
    if(mode==='bike'){mesh(group,new T.BoxGeometry(.38,.22,.3),cream,0,1.08,.7);}
    if(mode==='scooter'){mesh(group,new T.BoxGeometry(.27,.04,.7),cream,0,.21,-.07);}
    if(mode==='moped'){mesh(group,new T.BoxGeometry(.36,.23,.34),cream,0,1.12,-.52);}
    if(mode==='bike'){for(const side of [-1,1])bar(sport,[side*.24,1.13,.48],[side*.28,1.04,.62],.04,rubber);mesh(sport,new T.BoxGeometry(.18,.08,.28),cream,0,.82,.08);}
    if(mode==='scooter'){for(const side of [-1,1])bar(sport,[side*.105,.24,-.36],[side*.105,.24,.23],.023,cream);}
    if(mode==='moped'){const fairing=mesh(sport,new T.SphereGeometry(1,12,8),paint,0,.94,.5);fairing.scale.set(.29,.26,.16);}
    group.visible=false;sport.visible=false;
  }
  // New ground models retain the contact points used by the existing riding poses.
  const groundPalettes:Record<string,string>={mint:'#78c9a6',stunt:'#eeae43',comet:'#687ed1',bmx:'#dc7859',road:'#70a5bf',mountain:'#829850',retro:'#dfad99',delivery:'#66a58e',sport:'#b4658a'};
  const groundVariant=(mode:'scooter'|'bike'|'moped',id:string)=>{const group=new T.Group();group.name=`${mode}-${id}`;group.visible=false;groups[mode].add(group);extras[mode]![id]=group;return group;};
  const wheelCover=(group:T.Group,z:number,radius:number,material:T.Material=paint)=>{const cover=mesh(group,new T.TorusGeometry(radius,.045,6,12,Math.PI),material,0,radius,z);cover.rotation.y=Math.PI/2;};
  const mint=groundVariant('scooter','mint');
  mesh(mint,new T.BoxGeometry(.3,.07,.83),cream,0,.205,-.075);
  const mintShield=mesh(mint,new T.BoxGeometry(.29,.39,.09),paint,0,.77,.49);mintShield.rotation.x=-.07;
  mesh(mint,new T.BoxGeometry(.17,.055,.045),cream,0,.87,.55);
  bar(mint,[0,.24,.33],[0,.48,.45],.055,paint);wheelCover(mint,-.4,.15);
  const stunt=groundVariant('scooter','stunt');
  for(const z of [-.4,.5])bar(stunt,[-.25,.12,z],[.25,.12,z],.035,metal);
  bar(stunt,[-.22,1.07,.47],[.22,1.07,.47],.03,paint);
  for(const side of [-1,1])bar(stunt,[side*.115,.21,-.36],[side*.115,.21,.31],.036,paint);
  const stuntBrace=mesh(stunt,new T.BoxGeometry(.065,.23,.19),paint,0,.3,.32);stuntBrace.rotation.x=-.5;
  const comet=groundVariant('scooter','comet');
  for(const side of [-1,1]){const rail=mesh(comet,new T.BoxGeometry(.1,.13,.8),paint,side*.13,.22,-.055);rail.rotation.z=side*.12;bar(comet,[side*.1,.24,.33],[side*.1,.84,.47],.025,cream);}
  const cometNose=mesh(comet,new T.ConeGeometry(.2,.48,4),paint,0,.76,.47);cometNose.rotation.y=Math.PI/4;
  mesh(comet,new T.BoxGeometry(.23,.045,.06),cream,0,.85,.59);
  const bmx=groundVariant('bike','bmx');
  for(const z of [-.53,.62])bar(bmx,[-.29,.32,z],[.29,.32,z],.038,metal);
  bar(bmx,[-.23,1.02,.48],[.23,1.02,.48],.035,paint);
  mesh(bmx,new T.BoxGeometry(.3,.18,.035),cream,0,1.03,.51);
  mesh(bmx,new T.BoxGeometry(.035,.11,.012),paint,0,1.03,.535);
  const road=groundVariant('bike','road');
  for(const side of [-1,1]){bar(road,[side*.23,1.13,.48],[side*.23,1.1,.69],.028,metal);bar(road,[side*.23,1.1,.69],[side*.23,.94,.69],.035,rubber);bar(road,[side*.23,.94,.69],[side*.23,.94,.55],.035,rubber);}
  bar(road,[0,.41,.06],[0,.87,.43],.055,paint);
  mesh(road,new T.CylinderGeometry(.045,.045,.19,8),cream,0,.63,.18).rotation.x=.45;
  const mountain=groundVariant('bike','mountain');
  for(const z of [-.53,.62]){const tire=mesh(mountain,new T.TorusGeometry(.282,.065,6,16),rubber,0,.32,z);tire.rotation.y=Math.PI/2;}
  for(const side of [-1,1]){bar(mountain,[side*.075,.35,.61],[side*.075,.79,.48],.042,cream);bar(mountain,[side*.075,.7,.51],[side*.075,.92,.43],.048,paint);}
  bar(mountain,[0,.48,.08],[0,.82,-.08],.07,metal);
  mesh(mountain,new T.BoxGeometry(.18,.035,.4),paint,0,.72,.59).rotation.x=.15;
  const retro=groundVariant('moped','retro');
  const shield=mesh(retro,new T.SphereGeometry(1,12,8),paint,0,.75,.4);shield.scale.set(.31,.4,.105);
  mesh(retro,new T.BoxGeometry(.41,.045,.6),cream,0,.32,.025);
  wheelCover(retro,-.53,.28);wheelCover(retro,.62,.28);
  for(const side of [-1,1]){bar(retro,[side*.2,1.1,.48],[side*.3,1.36,.48],.018);mesh(retro,new T.SphereGeometry(.065,8,6),cream,side*.3,1.36,.48).scale.z=.3;}
  const delivery=groundVariant('moped','delivery');
  mesh(delivery,new T.BoxGeometry(.54,.42,.48),paint,0,1.19,-.53);
  mesh(delivery,new T.BoxGeometry(.57,.045,.51),cream,0,1.42,-.53);
  mesh(delivery,new T.BoxGeometry(.36,.15,.015),cream,0,1.2,-.779);
  for(const side of [-1,1])bar(delivery,[side*.2,.53,-.45],[side*.2,.98,-.65],.025);
  const sport=groundVariant('moped','sport');
  const sportNose=mesh(sport,new T.ConeGeometry(.34,.51,4),paint,0,.84,.49);sportNose.rotation.y=Math.PI/4;sportNose.rotation.x=.22;
  const visor=mesh(sport,new T.BoxGeometry(.34,.2,.035),rubber,0,1.08,.57);visor.rotation.x=-.3;
  for(const side of [-1,1]){mesh(sport,new T.BoxGeometry(.12,.055,.03),cream,side*.14,.95,.67);const sidePanel=mesh(sport,new T.BoxGeometry(.08,.22,.47),paint,side*.2,.61,.06);sidePanel.rotation.z=side*.22;}
  mesh(sport,new T.BoxGeometry(.4,.055,.25),paint,0,.95,-.55);
  const car=new T.Group();car.name='flying-car';root.add(car);
  const body=mesh(car,new T.SphereGeometry(1,20,12),paint,0,.62,.05);body.scale.set(.72,.28,1.05);
  mesh(car,new T.BoxGeometry(.95,.15,1.35),carAccent,0,.73,.05);
  mesh(car,new T.BoxGeometry(.48,.33,.15),rubber,0,1.02,-.35);
  const screen=mesh(car,new T.BoxGeometry(.93,.3,.055),metal,0,1.05,.57);screen.rotation.x=-.3;
  for(const side of [-1,1]){
    mesh(car,new T.SphereGeometry(.11,10,6),cream,side*.46,.66,.9);
    for(const z of [-.64,.64]){const pod=mesh(car,new T.TorusGeometry(.19,.07,6,14),carAccent,side*.73,.48,z);pod.rotation.x=Math.PI/2;}
  }
  const carExhaust:T.Mesh[]=[];for(const side of [-1,1]){mesh(car,new T.CylinderGeometry(.13,.13,.18,10),metal,side*.53,.28,-.83).rotation.x=Math.PI/2;const plume=mesh(car,new T.ConeGeometry(.13,.6,10),exhaustMaterial,side*.53,.24,-1.2);plume.rotation.x=-Math.PI/2;plume.castShadow=false;carExhaust.push(plume);}
  bar(car,[-.25,1.15,.35],[.25,1.15,.35],.035,rubber);
  const helicopter=new T.Group();helicopter.name='helicopter-pack';root.add(helicopter);
  mesh(helicopter,new T.BoxGeometry(.48,.58,.3),paint,0,1.26,-.34);
  for(const side of [-1,1]){
    bar(helicopter,[side*.2,1.55,-.36],[side*.2,1.1,.12],.035,rubber);
    mesh(helicopter,new T.CylinderGeometry(.1,.1,.42,10),cream,side*.28,1.2,-.36);
  }
  bar(helicopter,[0,1.5,-.35],[0,2.24,-.35],.055,metal);
  const rotor=new T.Group();rotor.name='helicopter-rotor';rotor.position.set(0,2.24,-.35);helicopter.add(rotor);
  mesh(rotor,new T.CylinderGeometry(.12,.12,.1,10),paint,0,0,0);
  for(let i=0;i<2;i++){const blade=mesh(rotor,new T.BoxGeometry(2.2,.035,.13),rubber,0,0,0);blade.rotation.y=i*Math.PI/2;}
  bar(helicopter,[0,1.25,-.5],[0,1.35,-1.1],.045,metal);
  const tailRotor=new T.Group();tailRotor.position.set(.04,1.35,-1.1);helicopter.add(tailRotor);
  for(let i=0;i<2;i++){const blade=mesh(tailRotor,new T.BoxGeometry(.035,.5,.06),cream,0,0,0);blade.rotation.x=i*Math.PI/2;}
  const flightExtras=createFlightExtras();root.add(flightExtras.armor,flightExtras.board,flightExtras.plane);
  let customization={...DEFAULT_CUSTOMIZATION};
  const setCustomization=(value:CharacterCustomization)=>{customization={...value};};
  let angle=0,thrustClock=0,rotorAngle=0,tailAngle=0,lastPaint='';
  const displaced:{mesh:T.Object3D;position:T.Vector3;rotation:T.Euler}[]=[];
  const restore=()=>{for(const part of displaced){part.mesh.position.copy(part.position);part.mesh.rotation.copy(part.rotation);}displaced.length=0;};


  return {root,setCustomization,update(mode:TravelMode,x:number,z:number,yaw:number,dt:number,speed:number,flight?:FlightPose) {
    restore();
    const wearingArmor=customization.jetpack==='ironman'&&mode==='jetpack';
    root.visible=mode!=='walk'||wearingArmor;root.position.set(x,0,z);root.rotation.y=yaw;
    for(const key of ['scooter','bike','moped','jetpack'] as const)groups[key].visible=mode===key;
    const variant=mode==='walk'?'classic':customization[mode];
    let paintColor=variant==='helicopter'?'#9464c4':variant==='coast'?'#589aa0':variant==='sunset'?'#c8734f':variant==='flying-car'?'#c94f4d':'#c68853';
    if(mode==='scooter'||mode==='bike'||mode==='moped'){const groundColor=groundPalettes[customization[mode]];if(groundColor)paintColor=groundColor;}
    if(paintColor!==lastPaint){paint.color.set(paintColor);lastPaint=paintColor;}
    for(const key of ['scooter','bike','moped'] as const)for(const [id,group] of Object.entries(extras[key]!))group.visible=customization[key]===id;
    helicopter.visible=mode==='jetpack'&&customization.jetpack==='helicopter';
    car.visible=mode==='jetpack'&&customization.jetpack==='flying-car';
    pack.visible=mode==='jetpack'&&customization.jetpack==='classic';
    flightExtras.armor.visible=wearingArmor;
    flightExtras.board.visible=mode==='jetpack'&&customization.jetpack==='rocketboard';
    flightExtras.plane.visible=mode==='jetpack'&&customization.jetpack==='mini-plane';
    flightExtras.update(dt,flight?.thrust??1,speed);
    thrustClock+=Math.max(0,Math.min(dt,.1));
    rotorAngle+=dt*(flight?.thrust??1)*32;tailAngle+=dt*44;
    if(helicopter.visible){rotor.rotation.y=rotorAngle;tailRotor.rotation.x=tailAngle;helicopter.position.y=-(flight?.compression??0);}
    if(pack.visible){pack.position.y=-(flight?.compression??0);
    pack.rotation.set((flight?.secondary??0)*.7,0,flight?.secondary??0);}
    if(pack.visible)for(let i=0;i<flames.length;i++){
      const flame=flames[i];
      const stretch=(flight?.thrust??1)*(.9+Math.sin(thrustClock*18+i*.9)*.16)+speed/90;
      flame.scale.y=stretch;
      // Top of the flame stays at the nozzle when thrust length changes.
      flame.position.y=.77-.25*stretch;
    }
    if(car.visible)for(const plume of carExhaust){const thrust=.6+Math.min(speed/24,1.5)+Math.max(0,(flight?.thrust??1)-1)*1.4;plume.scale.y=thrust;plume.position.z=-.92-.3*thrust;}
    angle+=Math.max(0,Math.min(dt,.1))*Math.max(0,speed);
    for(const wheel of wheels)if(wheel.mode===mode){wheel.mesh.rotation.set(0,Math.PI/2,0);wheel.mesh.rotateZ(-angle/wheel.radius);}
  },syncArmor:flightExtras.syncArmor,setCrash(amount:number){
    restore();if(amount<=0)return;
    const spread=Math.min(1,amount*3);
    for(const mode of ['scooter','bike','moped'] as const){if(!groups[mode].visible)continue;
      groups[mode].children.forEach((part,i)=>{
        displaced.push({mesh:part,position:part.position.clone(),rotation:part.rotation.clone()});
        const angle=i*2.399;
        part.position.x+=Math.cos(angle)*spread*(.5+i%3*.25);
        part.position.z+=Math.sin(angle)*spread*(.5+i%3*.25);
        part.position.y*=1-spread*.85;
        part.rotation.x+=Math.sin(angle)*spread*1.4;part.rotation.z+=Math.cos(angle)*spread*1.4;
      });
    }
  },dispose(){root.removeFromParent();flightExtras.dispose();geometries.forEach(g=>g.dispose());[metal,rubber,paint,cream,exhaustMaterial,carAccent].forEach(m=>m.dispose());}};
}
