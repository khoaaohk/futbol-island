import * as T from 'three';
import {DEFAULT_CUSTOMIZATION,type CharacterCustomization} from '../town/customization';
import type { FlightPose } from './flightMotion';
import type { TravelMode } from '../town/travelModes';
import {createFlightExtras} from './flightExtras';
import {characterStyle} from './characterStyle';
import {beanShapeOf,beanBackExtent,beanBrimY,beanHalfWidth,beanStrapPaths,beanSurfaceOffset,sameShape,gearState,BEAN_SOLE_DROP,FLIGHT_TORSO_REST,type BeanShape} from './beanGearFit';

type V3=[number,number,number];
/**
 * Procedural rides share one material palette; no external assets or animation loop.
 * Bean fit (docs/bean-characters/CONTRACT.md, lane F): the rig's ride poses are fixed, so the rides meet the round
 * bean instead. Seats drop to the bean's lowest point, the scooter deck and moped footrest drop to its boot soles,
 * bike pedals follow the feet, and the packs ride the bean's back surface. `fits` holds both placements of every
 * moved part; the classic body gets exactly the original geometry.
 */
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
  const fits:((bean:boolean)=>void)[]=[];
  const mesh = (group:T.Group,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number) => {
    geometries.push(geometry); const object=new T.Mesh(geometry,material);
    object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;group.add(object);return object;
  };
  const up=new T.Vector3(0,1,0),barDirection=new T.Vector3();
  const placeBar=(object:T.Object3D,a:readonly number[],b:readonly number[],length:number)=>{
    barDirection.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const l=barDirection.length();
    object.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);object.quaternion.setFromUnitVectors(up,barDirection.normalize());object.scale.set(1,l/length,1);
  };
  const bar = (group:T.Group,a:readonly number[],b:readonly number[],radius=.025,material:T.Material=metal) => {
    const length=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
    const object=mesh(group,new T.CylinderGeometry(radius,radius,length,8),material,0,0,0);
    placeBar(object,a,b,length);object.scale.y=1;return object;
  };
  /** Bean placement for a mesh (classic keeps where it was built). */
  const fitAt=(object:T.Object3D,bean:V3)=>{const classic=object.position.toArray() as V3;fits.push(on=>object.position.set(...(on?bean:classic)));return object;};
  /** Bean endpoints for a bar (classic keeps its own). */
  const fitBar=(object:T.Object3D,a:readonly number[],b:readonly number[],beanA:readonly number[],beanB:readonly number[])=>{
    const length=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);fits.push(on=>placeBar(object,on?beanA:a,on?beanB:b,length));return object;
  };
  const beanOnly:T.Object3D[]=[],classicOnly:T.Object3D[]=[];
  // Bean deck/seat/footrest heights (vehicle units; the town renders rides at 1.12 while the rider stays unit scale).
  // Seat top meets the bean's lowest point in the bike/moped pose (≈ .875 m), the scooter deck and the moped footrest
  // meet the boot soles (ankle targets .235 and .36 m minus the sole drop). The crank sits at the centre of the circle
  // the soles trace (the rig pedals its ankles round .39 m, .15 m radius), so the pedals stay on a true crank.
  const SCOOTER_DROP=.07,SEAT_Y=.735,SEAT_NODE=.76,CRANK:V3=[0,(.39-BEAN_SOLE_DROP-.012)/1.12,.06/1.12],FOOTREST_Y=(.36-BEAN_SOLE_DROP)/1.12-.035;
  const pedals:{pedal:T.Mesh;arm:T.Mesh}[]=[];
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
      const deck=mesh(group,new T.BoxGeometry(.19,.065,.75),paint,0,.17,-.07);deck.name='scooter-deck';fitAt(deck,[0,.17-SCOOTER_DROP,-.07]);
      fitBar(bar(group,[0,.17,.4],[0,1.25,.47],.032),[0,.17,.4],[0,1.25,.47],[0,.17-SCOOTER_DROP,.4],[0,1.25,.47]);
      fitBar(bar(group,[0,.17,-.38],[0,.12,rear]),[0,.17,-.38],[0,.12,rear],[0,.17-SCOOTER_DROP,-.38],[0,.12,rear]);
    } else {
      const seat=[0,.94,-.12],crank=[0,.39,.03],head=[0,.91,.43],beanSeat=[0,SEAT_NODE,-.12];
      for(const [a,b] of [[seat,crank],[crank,head],[head,seat],[[0,radius,rear],seat],[[0,radius,rear],crank],[head,[0,radius,front]]]){
        const object=bar(group,a,b,mode==='bike'?.032:.045,paint);
        // The moped's top tube steps through under the bean (its round belly would sit on a straight head–seat tube).
        const swap=(p:number[],other:number[])=>p===seat?(mode==='moped'&&other===head?[0,.64,-.04]:beanSeat):p===crank?CRANK:p;fitBar(object,a,b,swap(a,b),swap(b,a));
      }
      const saddle=mesh(group,new T.BoxGeometry(mode==='bike'?.22:.32,.09,mode==='bike'?.28:.52),rubber,0,.92,mode==='bike'?-.15:-.18);saddle.name=mode+'-seat';fitAt(saddle,[0,SEAT_Y,mode==='bike'?-.15:-.18]);
      if(mode==='moped') {
        // Narrow body in bean fit: the knees sit either side of it rather than inside it.
        const body=mesh(group,new T.BoxGeometry(.3,.34,.45),paint,0,.59,.16);body.name='moped-body';fits.push(on=>body.scale.set(on?.55:1,1,1));
        fitAt(mesh(group,new T.BoxGeometry(.24,.15,.3),metal,0,.32,.01),[0,.17,.01]);
        mesh(group,new T.SphereGeometry(.11,10,6),cream,0,1.06,.52);
        const rest=bar(group,[-.22,.34,.13],[.22,.34,.13],.035);rest.name='moped-footrest';fitBar(rest,[-.22,.34,.13],[.22,.34,.13],[-.22,FOOTREST_Y,.13],[.22,FOOTREST_Y,.13]);
      }
      bar(group,head,[0,1.13,.48],.025);
      if(mode==='bike')for(let i=0;i<2;i++){
        // Bean fit only: crank arms and pedals follow the feet (placed from the ankles in syncArmor).
        const arm=bar(group,CRANK,[0,CRANK[1]-.13,CRANK[2]],.018,metal),pedal=mesh(group,new T.BoxGeometry(.1,.024,.07),rubber,0,0,0);
        pedal.name='bike-pedal-'+(i?'right':'left');beanOnly.push(arm,pedal);pedals.push({pedal,arm});
      }
    }
    const handleY=mode==='scooter'?1.25:1.13;
    bar(group,[-.235,handleY,.48],[.235,handleY,.48]).name=mode+'-handlebar';
    for(const side of [-1,1])bar(group,[side*.18,handleY,.48],[side*.29,handleY,.48],.038,rubber).name=mode+'-grip-'+(side<0?'left':'right');
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
    if(mode==='scooter'){fitAt(mesh(group,new T.BoxGeometry(.27,.04,.7),cream,0,.21,-.07),[0,.21-SCOOTER_DROP,-.07]);}
    if(mode==='moped'){fitAt(mesh(group,new T.BoxGeometry(.36,.23,.34),cream,0,1.12,-.52),[0,1.12-.17,-.52]);}
    if(mode==='bike'){for(const side of [-1,1])bar(sport,[side*.24,1.13,.48],[side*.28,1.04,.62],.04,rubber);fitAt(mesh(sport,new T.BoxGeometry(.18,.08,.28),cream,0,.82,.08),[0,.87,.27]);}
    if(mode==='scooter'){for(const side of [-1,1]){const a=[side*.105,.24,-.36],b=[side*.105,.24,.23];fitBar(bar(sport,a,b,.023,cream),a,b,[a[0],a[1]-SCOOTER_DROP,a[2]],[b[0],b[1]-SCOOTER_DROP,b[2]]);}}
    if(mode==='moped'){const fairing=mesh(sport,new T.SphereGeometry(1,12,8),paint,0,.94,.5);fairing.scale.set(.29,.26,.16);fitAt(fairing,[0,.92,.66]);}
    group.visible=false;sport.visible=false;
  }
  // New ground models retain the contact points used by the existing riding poses.
  const groundPalettes:Record<string,string>={mint:'#78c9a6',stunt:'#eeae43',comet:'#687ed1',bmx:'#dc7859',road:'#70a5bf',mountain:'#829850',retro:'#dfad99',delivery:'#66a58e',sport:'#b4658a'};
  const groundVariant=(mode:'scooter'|'bike'|'moped',id:string)=>{const group=new T.Group();group.name=`${mode}-${id}`;group.visible=false;groups[mode].add(group);extras[mode]![id]=group;return group;};
  const wheelCover=(group:T.Group,z:number,radius:number,material:T.Material=paint)=>{const cover=mesh(group,new T.TorusGeometry(radius,.045,6,12,Math.PI),material,0,radius,z);cover.rotation.y=Math.PI/2;};
  const drop=(p:number[],d:number)=>[p[0],p[1]-d,p[2]];
  const mint=groundVariant('scooter','mint');
  fitAt(mesh(mint,new T.BoxGeometry(.3,.07,.83),cream,0,.205,-.075),[0,.093,-.075]).name='scooter-mint-deck';
  const mintShield=mesh(mint,new T.BoxGeometry(.29,.39,.09),paint,0,.77,.49);mintShield.rotation.x=-.07;
  mesh(mint,new T.BoxGeometry(.17,.055,.045),cream,0,.87,.55);
  fitBar(bar(mint,[0,.24,.33],[0,.48,.45],.055,paint),[0,.24,.33],[0,.48,.45],[0,.24-SCOOTER_DROP,.33],[0,.48,.45]);wheelCover(mint,-.4,.15);
  const stunt=groundVariant('scooter','stunt');
  for(const z of [-.4,.5])bar(stunt,[-.25,.12,z],[.25,.12,z],.035,metal);
  bar(stunt,[-.22,1.07,.47],[.22,1.07,.47],.03,paint);
  for(const side of [-1,1]){const a=[side*.115,.21,-.36],b=[side*.115,.21,.31];fitBar(bar(stunt,a,b,.036,paint),a,b,drop(a,SCOOTER_DROP),drop(b,SCOOTER_DROP));}
  const stuntBrace=mesh(stunt,new T.BoxGeometry(.065,.23,.19),paint,0,.3,.32);stuntBrace.rotation.x=-.5;fitAt(stuntBrace,[0,.3-SCOOTER_DROP,.32]);
  const comet=groundVariant('scooter','comet');
  for(const side of [-1,1]){const rail=mesh(comet,new T.BoxGeometry(.1,.13,.8),paint,side*.13,.22,-.055);rail.rotation.z=side*.12;fitAt(rail,[side*.13,.22-SCOOTER_DROP,-.055]);const a=[side*.1,.24,.33],b=[side*.1,.84,.47];fitBar(bar(comet,a,b,.025,cream),a,b,drop(a,SCOOTER_DROP),b);}
  const cometNose=mesh(comet,new T.ConeGeometry(.2,.48,4),paint,0,.76,.47);cometNose.rotation.y=Math.PI/4;
  mesh(comet,new T.BoxGeometry(.23,.045,.06),cream,0,.85,.59);
  const bmx=groundVariant('bike','bmx');
  for(const z of [-.53,.62])bar(bmx,[-.29,.32,z],[.29,.32,z],.038,metal);
  bar(bmx,[-.23,1.02,.48],[.23,1.02,.48],.035,paint);
  mesh(bmx,new T.BoxGeometry(.3,.18,.035),cream,0,1.03,.51);
  mesh(bmx,new T.BoxGeometry(.035,.11,.012),paint,0,1.03,.535);
  const road=groundVariant('bike','road');
  for(const side of [-1,1]){bar(road,[side*.23,1.13,.48],[side*.23,1.1,.69],.028,metal);bar(road,[side*.23,1.1,.69],[side*.23,.94,.69],.035,rubber);bar(road,[side*.23,.94,.69],[side*.23,.94,.55],.035,rubber);}
  fitBar(bar(road,[0,.41,.06],[0,.87,.43],.055,paint),[0,.41,.06],[0,.87,.43],[0,CRANK[1]+.02,.06],[0,.87,.43]);
  mesh(road,new T.CylinderGeometry(.045,.045,.19,8),cream,0,.63,.18).rotation.x=.45;
  const mountain=groundVariant('bike','mountain');
  for(const z of [-.53,.62]){const tire=mesh(mountain,new T.TorusGeometry(.282,.065,6,16),rubber,0,.32,z);tire.rotation.y=Math.PI/2;}
  for(const side of [-1,1]){bar(mountain,[side*.075,.35,.61],[side*.075,.79,.48],.042,cream);bar(mountain,[side*.075,.7,.51],[side*.075,.92,.43],.048,paint);}
  fitBar(bar(mountain,[0,.48,.08],[0,.82,-.08],.07,metal),[0,.48,.08],[0,.82,-.08],[0,.45,.07],[0,SEAT_NODE-.06,-.1]);
  mesh(mountain,new T.BoxGeometry(.18,.035,.4),paint,0,.72,.59).rotation.x=.15;
  const retro=groundVariant('moped','retro');
  const shield=mesh(retro,new T.SphereGeometry(1,12,8),paint,0,.75,.4);shield.scale.set(.31,.4,.105);
  fitAt(mesh(retro,new T.BoxGeometry(.41,.045,.6),cream,0,.32,.025),[0,FOOTREST_Y-.01,.025]);
  wheelCover(retro,-.53,.28);wheelCover(retro,.62,.28);
  for(const side of [-1,1]){bar(retro,[side*.2,1.1,.48],[side*.3,1.36,.48],.018);mesh(retro,new T.SphereGeometry(.065,8,6),cream,side*.3,1.36,.48).scale.z=.3;}
  const delivery=groundVariant('moped','delivery');
  // The rear box rides lower with the lower bean seat (it stays behind the bean's back).
  const RACK=.17;
  fitAt(mesh(delivery,new T.BoxGeometry(.54,.42,.48),paint,0,1.19,-.53),[0,1.19-RACK,-.56]);
  fitAt(mesh(delivery,new T.BoxGeometry(.57,.045,.51),cream,0,1.42,-.53),[0,1.42-RACK,-.56]);
  fitAt(mesh(delivery,new T.BoxGeometry(.36,.15,.015),cream,0,1.2,-.779),[0,1.2-RACK,-.809]);
  for(const side of [-1,1]){const a=[side*.2,.53,-.45],b=[side*.2,.98,-.65];fitBar(bar(delivery,a,b,.025),a,b,a,[b[0],b[1]-RACK,b[2]]);}
  const sport=groundVariant('moped','sport');
  const sportNose=mesh(sport,new T.ConeGeometry(.34,.51,4),paint,0,.84,.49);sportNose.rotation.y=Math.PI/4;sportNose.rotation.x=.22;fitAt(sportNose,[0,.84,.6]);
  const visor=mesh(sport,new T.BoxGeometry(.34,.2,.035),rubber,0,1.08,.57);visor.rotation.x=-.3;
  for(const side of [-1,1]){mesh(sport,new T.BoxGeometry(.12,.055,.03),cream,side*.14,.95,.67);const sidePanel=mesh(sport,new T.BoxGeometry(.08,.22,.47),paint,side*.2,.61,.06);sidePanel.rotation.z=side*.22;}
  fitAt(mesh(sport,new T.BoxGeometry(.4,.055,.25),paint,0,.95,-.55),[0,.95-RACK,-.58]);
  const car=new T.Group();car.name='flying-car';root.add(car);
  const body=mesh(car,new T.SphereGeometry(1,20,12),paint,0,.62,.05);body.scale.set(.72,.28,1.05);body.name='flying-car-body';
  mesh(car,new T.BoxGeometry(.95,.15,1.35),carAccent,0,.73,.05).name='flying-car-cockpit';
  // Seat back sits behind the (deeper) bean back; the steering bar meets the bean's hands.
  fitAt(mesh(car,new T.BoxGeometry(.48,.33,.15),rubber,0,1.02,-.35),[0,1.02,-.44]);
  const screen=mesh(car,new T.BoxGeometry(.93,.3,.055),metal,0,1.05,.57);screen.rotation.x=-.3;
  for(const side of [-1,1]){
    mesh(car,new T.SphereGeometry(.11,10,6),cream,side*.46,.66,.9);
    for(const z of [-.64,.64]){const pod=mesh(car,new T.TorusGeometry(.19,.07,6,14),carAccent,side*.73,.48,z);pod.rotation.x=Math.PI/2;}
  }
  const carExhaust:T.Mesh[]=[];for(const side of [-1,1]){mesh(car,new T.CylinderGeometry(.13,.13,.18,10),metal,side*.53,.28,-.83).rotation.x=Math.PI/2;const plume=mesh(car,new T.ConeGeometry(.13,.6,10),exhaustMaterial,side*.53,.24,-1.2);plume.rotation.x=-Math.PI/2;plume.castShadow=false;carExhaust.push(plume);}
  const wheelBar=bar(car,[-.25,1.15,.35],[.25,1.15,.35],.035,rubber);wheelBar.name='flying-car-wheel';fitBar(wheelBar,[-.25,1.15,.35],[.25,1.15,.35],[-.27,1.01,.36],[.27,1.01,.36]);
  const helicopter=new T.Group();helicopter.name='helicopter-pack';root.add(helicopter);
  mesh(helicopter,new T.BoxGeometry(.48,.58,.3),paint,0,1.26,-.34);
  for(const side of [-1,1]){
    // Classic shoulder straps; the bean (no shoulders) wears the harness belts below instead.
    classicOnly.push(bar(helicopter,[side*.2,1.55,-.36],[side*.2,1.1,.12],.035,rubber));
    mesh(helicopter,new T.CylinderGeometry(.1,.1,.42,10),cream,side*.28,1.2,-.36);
  }
  bar(helicopter,[0,1.5,-.35],[0,2.24,-.35],.055,metal);
  const rotor=new T.Group();rotor.name='helicopter-rotor';rotor.position.set(0,2.24,-.35);helicopter.add(rotor);
  mesh(rotor,new T.CylinderGeometry(.12,.12,.1,10),paint,0,0,0);
  for(let i=0;i<2;i++){const blade=mesh(rotor,new T.BoxGeometry(2.2,.035,.13),rubber,0,0,0);blade.rotation.y=i*Math.PI/2;}
  bar(helicopter,[0,1.25,-.5],[0,1.35,-1.1],.045,metal);
  const tailRotor=new T.Group();tailRotor.position.set(.04,1.35,-1.1);helicopter.add(tailRotor);
  for(let i=0;i<2;i++){const blade=mesh(tailRotor,new T.BoxGeometry(.035,.5,.06),cream,0,0,0);blade.rotation.x=i*Math.PI/2;}
  // Bean harness: two belts hug the shell (waist and chest) and hold either pack on; rebuilt only when the build changes.
  // Bean harness: two flat backpack straps over the shoulders and down the front, plus a slim sternum strap, laid on
  // the bean's own surface (they hug every build); rebuilt only when the build changes.
  const strapPaths=beanStrapPaths();
  const harness:{group:T.Group;belts:T.Mesh[]}[]=[pack,helicopter].map(group=>{const belts:T.Mesh[]=[];for(let i=0;i<strapPaths.length;i++){const belt=new T.Mesh(new T.BufferGeometry(),rubber);belt.name='bean-harness-belt';belt.castShadow=true;group.add(belt);belts.push(belt);beanOnly.push(belt);}return {group,belts};});
  /** Flat strap (width w, thickness t) through surface stations: outer/inner faces plus edges, in pack-group units. */
  const strapGeometry=(s:BeanShape,path:{closed:boolean;stations:[number,number][]},map:(p:[number,number,number])=>T.Vector3,w=.036,t=.007)=>{
    const {closed,stations}=path,n=stations.length,pos:number[]=[],idx:number[]=[],A=new T.Vector3(),B=new T.Vector3(),tan=new T.Vector3(),side=new T.Vector3();
    const outer=stations.map(([u,a])=>map(beanSurfaceOffset(s,u,a,.004+t))),inner=stations.map(([u,a])=>map(beanSurfaceOffset(s,u,a,.004)));
    for(let i=0;i<n;i++){
      const prev=closed?(i+n-1)%n:Math.max(0,i-1),next=closed?(i+1)%n:Math.min(n-1,i+1);
      tan.subVectors(outer[next],outer[prev]).normalize();const normal=A.subVectors(outer[i],inner[i]).normalize();side.crossVectors(tan,normal).normalize().multiplyScalar(w/2/1.12);
      for(const q of [outer[i],inner[i]]){B.copy(q).add(side);pos.push(B.x,B.y,B.z);B.copy(q).sub(side);pos.push(B.x,B.y,B.z);}
    }
    const seg=closed?n:n-1;
    for(let i=0;i<seg;i++){const a=i*4,b=((i+1)%n)*4;
      idx.push(a,b,a+1, a+1,b,b+1); // outer
      idx.push(a+2,a+3,b+2, a+3,b+3,b+2); // inner
      idx.push(a,a+2,b, a+2,b+2,b, a+1,b+1,a+3, a+3,b+1,b+3);} // edges
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
  };
  const flightExtras=createFlightExtras();root.add(flightExtras.armor,flightExtras.board,flightExtras.plane);
  let customization={...DEFAULT_CUSTOMIZATION};
  const setCustomization=(value:CharacterCustomization)=>{customization={...value};};
  let angle=0,thrustClock=0,rotorAngle=0,tailAngle=0,lastPaint='';
  const displaced:{mesh:T.Object3D;position:T.Vector3;rotation:T.Euler}[]=[];
  const restore=()=>{for(const part of displaced){part.mesh.position.copy(part.position);part.mesh.rotation.copy(part.rotation);}displaced.length=0;};
  // ---- bean fit state
  let beanFit:boolean|undefined,fitShape:BeanShape|undefined,packShift=0,heliShift=0;
  // Packs ride a little lower on a bean (its head starts where a classic neck would be): the tops stay under the
  // widest brim (bucket hat) and the longest back hair (ponytail).
  let PACK_DROP=.07,HELI_DROP=.12;
  const applyFit=(bean:boolean)=>{
    if(bean===beanFit)return;beanFit=bean;restore();
    for(const f of fits)f(bean);for(const o of beanOnly)o.visible=bean;for(const o of classicOnly)o.visible=!bean;
    flightExtras.setBeanFit(bean);
    if(!bean){gearState.packBack=0;for(const g of [pack,helicopter]){g.matrixAutoUpdate=true;g.position.set(0,0,0);g.quaternion.identity();g.scale.set(1,1,1);}}
  };
  /** Pack z shift (vehicle units) that puts a pack face at classic z `front` flush on this bean's back. */
  const shiftFor=(s:BeanShape,front:number)=>(beanBackExtent(s,.06,.7)-.012-front*1.12)/1.12;
  const fitShapeTo=(s:BeanShape)=>{
    if(sameShape(s,fitShape))return;fitShape=s;
    const brim=beanBrimY(s)-.02;PACK_DROP=Math.max(.07,1.5*1.12-FLIGHT_TORSO_REST-brim);HELI_DROP=Math.max(.12,1.55*1.12-FLIGHT_TORSO_REST-brim);
    packShift=Math.min(0,shiftFor(s,-.3+.12));heliShift=Math.min(0,shiftFor(s,-.34+.15));
    harness.forEach(({belts},k)=>{const shift=k?heliShift:packShift,drop=k?HELI_DROP:PACK_DROP;belts.forEach((belt,i)=>{
      belt.geometry.dispose();belt.geometry=strapGeometry(s,strapPaths[i],([x,py,z])=>new T.Vector3(x/1.12,(py+FLIGHT_TORSO_REST+drop)/1.12,z/1.12-shift));
    });});
  };
  applyFit(characterStyle()==='bean');
  const inverse=new T.Matrix4(),relative=new T.Matrix4(),rest=new T.Matrix4(),v=new T.Vector3(),w=new T.Vector3();
  let boundRig:T.Object3D|undefined,torso:T.Object3D|undefined,ankles:(T.Object3D|undefined)[]=[];
  /** Bean packs ride the torso: pack = torso · (rest offset) · ride scale · back shift, so the pack stays on the back. */
  const followTorso=(group:T.Group,shift:number,drop:number)=>{
    if(!torso)return;group.matrixAutoUpdate=true;
    // rest = translate(0,-torsoRest,0) · scale(1.12) · translate(0,0,shift), written out (no per-frame allocation).
    rest.set(1.12,0,0,0, 0,1.12,0,-FLIGHT_TORSO_REST-drop, 0,0,1.12,shift*1.12, 0,0,0,1);
    relative.multiplyMatrices(inverse,torso.matrixWorld).multiply(rest);relative.decompose(group.position,group.quaternion,group.scale);
  };
  /** Parachute harness: the lines leave the bean's shoulder sides (torso y .4) front and back; false on the classic body. */
  const harnessAnchor=(side:-1|1,z:-1|1,out:T.Vector3)=>{
    if(!beanFit||!fitShape||!torso)return false;
    out.set(side*(beanHalfWidth(fitShape,.4)+.01),.4,z*.05).applyMatrix4(torso.matrixWorld);return true;
  };
  const fitToRig=(rig:T.Object3D)=>{
    if(boundRig!==rig){boundRig=rig;torso=rig.getObjectByName('armor-torso');ankles=['left-ankle','right-ankle'].map(n=>rig.getObjectByName(n));}
    const s=beanShapeOf(rig);applyFit(!!s);if(!s)return;fitShapeTo(s);
    if(!root.visible)return;
    rig.updateWorldMatrix(true,true);root.updateWorldMatrix(true,false);inverse.copy(root.matrixWorld).invert();
    if(pack.visible)followTorso(pack,packShift,PACK_DROP);if(helicopter.visible)followTorso(helicopter,heliShift,HELI_DROP);
    gearState.packBack=pack.visible?-packShift*1.12:0;
    if(groups.bike.visible){
      // Pedals sit under the boot soles; each crank arm points from the crank to its pedal.
      const bike=groups.bike;bike.updateWorldMatrix(true,false);const toBike=relative.copy(bike.matrixWorld).invert();
      pedals.forEach(({pedal,arm},i)=>{const ankle=ankles[i];if(!ankle)return;ankle.getWorldPosition(v).applyMatrix4(toBike);
        w.set(v.x>0?.1:-.1,v.y-BEAN_SOLE_DROP/1.12-.012,v.z+.03);pedal.position.copy(w);
        placeBar(arm,CRANK,[w.x*.6,w.y,w.z],.13);});
    }
  };

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
    // Bean fit: the packs follow the torso in syncArmor (compression and sway come with the body).
    if(helicopter.visible){rotor.rotation.y=rotorAngle;tailRotor.rotation.x=tailAngle;if(!beanFit)helicopter.position.y=-(flight?.compression??0);}
    if(pack.visible&&!beanFit){pack.position.y=-(flight?.compression??0);
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
  },syncArmor(rig:T.Object3D,powered=true){fitToRig(rig);flightExtras.syncArmor(rig,powered);},setCrash(amount:number){
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
  },/** Bean-fit Iron Man face: 'open' shows the bean's face through the helmet, 'plate' closes it with a faceplate. */
  setArmorFace:flightExtras.setBeanFace,harnessAnchor,
  get beanFit(){return !!beanFit;},
  dispose(){root.removeFromParent();flightExtras.dispose();geometries.forEach(g=>g.dispose());harness.forEach(h=>h.belts.forEach(b=>b.geometry.dispose()));[metal,rubber,paint,cream,exhaustMaterial,carAccent].forEach(m=>m.dispose());}};
}
