import * as T from 'three';

/** Three lightweight rides; armor follows the selected character's animated joints. */
export function createFlightExtras(){
 const armor=new T.Group(),board=new T.Group(),plane=new T.Group();armor.name='ironman';board.name='rocketboard';plane.name='mini-plane';
 const red=new T.MeshStandardMaterial({color:'#b82e35',metalness:.45,roughness:.4}),gold=new T.MeshStandardMaterial({color:'#efbf57',metalness:.35,roughness:.45}),teal=new T.MeshStandardMaterial({color:'#29a8b5',roughness:.55}),navy=new T.MeshStandardMaterial({color:'#324467',roughness:.65}),white=new T.MeshStandardMaterial({color:'#fff0c9',roughness:.6});
 const cyan=new T.MeshBasicMaterial({color:'#91efff',toneMapped:false}),orange=new T.MeshBasicMaterial({color:'#ffb768',toneMapped:false}),blue=new T.MeshBasicMaterial({color:'#b6ddff',toneMapped:false});
 const dark=new T.MeshStandardMaterial({color:'#40282b',metalness:.3,roughness:.5});
 const geometries:T.BufferGeometry[]=[];
 function mesh(parent:T.Group,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);geometries.push(geometry);return m;}
 const box=(parent:T.Group,mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number)=>mesh(parent,new T.BoxGeometry(w,h,d),mat,x,y,z);
 const parts:{group:T.Group;anchor:string}[]=[],jets:T.Mesh[]=[];
 function part(anchor:string,x:number,y:number,z:number){const g=new T.Group();g.name=anchor+'-armor';g.position.set(x,y,z);armor.add(g);parts.push({group:g,anchor});const shell=new T.Group();shell.name=anchor+'-armor-shell';shell.scale.set(1.625,1.12,1.625);g.add(shell);return shell;}
 const torso=part('armor-torso',0,.98,0);
 // Oversized armor follows the animated character without changing the saved appearance.
 box(torso,red,0,.27,.15,.43,.38,.09);box(torso,red,0,.26,-.14,.4,.35,.08);
 box(torso,gold,0,.055,.125,.29,.11,.09);
 for(const side of [-1,1])box(torso,gold,side*.145,.39,.2,.105,.095,.04);
 const reactor=mesh(torso,new T.CylinderGeometry(.07,.07,.035,12),cyan,0,.29,.212);reactor.rotation.x=Math.PI/2;reactor.name='arc-reactor';
 for(const side of [-1,1]){const prefix=side<0?'left':'right';
  const shoulder=part(prefix+'-shoulder',side*.25,1.36,0);box(shoulder,red,0,-.07,0,.2,.2,.21);box(shoulder,gold,0,-.21,0,.13,.15,.14);
  const hand=part(prefix+'-elbow',side*.29,1.08,0);box(hand,red,0,-.14,0,.13,.27,.15);
  mesh(hand,new T.CylinderGeometry(.052,.052,.025,10),cyan,0,-.29,0);
  const handJet=mesh(hand,new T.ConeGeometry(.045,.42,8),cyan,0,-.5,0);handJet.rotation.z=Math.PI;handJet.name='hand-repulsor';jets.push(handJet);
  const hip=part(prefix+'-hip',side*.11,.98,0);box(hip,gold,0,-.21,0,.18,.35,.18);
  const knee=part(prefix+'-knee',side*.11,.55,0);box(knee,red,0,-.16,.01,.15,.37,.17);
  const boot=part(prefix+'-ankle',side*.11,.15,0);box(boot,red,0,-.025,.055,.17,.13,.3);
  mesh(boot,new T.CylinderGeometry(.058,.058,.03,10),cyan,0,-.105,.035);
  const plume=mesh(boot,new T.ConeGeometry(.065,.5,8),cyan,0,-.37,.035);plume.rotation.z=Math.PI;plume.name='boot-repulsor';jets.push(plume);
 }
 // A full, oversized helmet sits above the shoulders. The original head (including
 // mascot ears, horns and snouts) is temporarily occluded while this armor is worn.
 const helmet=part('player-head',0,1.67,.005);helmet.name='ironman-helmet';helmet.scale.set(1,1,1);
 const shell=mesh(helmet,new T.SphereGeometry(1,8,6),red,0,.34,0);shell.scale.set(.56,.61,.49);shell.name='helmet-red-shell';
 for(const side of [-1,1])box(helmet,red,side*.49,.30,0,.13,.55,.46);
 const face=new T.Shape();face.moveTo(-.36,.81);face.lineTo(.36,.81);face.lineTo(.43,.48);face.lineTo(.34,.12);face.lineTo(.23,-.12);face.lineTo(-.23,-.12);face.lineTo(-.34,.12);face.lineTo(-.43,.48);face.closePath();
 const plate=mesh(helmet,new T.ExtrudeGeometry(face,{depth:.055,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.018}),gold,0,0,.465);plate.name='helmet-gold-faceplate';
 box(helmet,red,0,.84,.41,.19,.18,.16);
 for(const side of [-1,1]){const socket=box(helmet,dark,side*.22,.46,.548,.29,.105,.035);socket.rotation.z=side*.09;const eye=box(helmet,cyan,side*.22,.46,.57,.235,.044,.018);eye.rotation.z=side*.09;eye.name='helmet-glowing-eye';box(helmet,gold,side*.34,.20,.54,.10,.19,.035);}
 box(helmet,dark,0,.055,.552,.31,.024,.015);box(helmet,red,0,-.14,.43,.45,.11,.18);
 const deck=mesh(board,new T.SphereGeometry(1,16,8),teal,0,.13,0);deck.scale.set(.43,.105,1.18);
 box(board,navy,0,.23,0,.43,.025,1.45);box(board,white,0,.245,.45,.07,.015,.55);
 for(const side of [-1,1]){box(board,white,side*.34,.14,-.55,.18,.09,.85);const engine=mesh(board,new T.CylinderGeometry(.13,.13,.55,10),navy,side*.25,.045,-.7);engine.rotation.x=Math.PI/2;const flame=mesh(board,new T.ConeGeometry(.1,.7,8),orange,side*.25,.045,-1.24);flame.rotation.x=-Math.PI/2;flame.name='board-thruster';}
 const fuselage=mesh(plane,new T.SphereGeometry(1,16,8),gold,0,.63,.03);fuselage.scale.set(.4,.31,1.3);
 box(plane,navy,0,.88,-.3,.44,.23,.22);box(plane,red,0,.58,.15,3.5,.12,.65);
 for(const side of [-1,1]){box(plane,white,side*1.48,.65,.15,.25,.025,.65);box(plane,navy,side*.55,.25,.25,.08,.5,.1);mesh(plane,new T.SphereGeometry(.15,8,6),navy,side*.55,.11,.25);}
 box(plane,red,0,.74,-.95,1.25,.1,.36);box(plane,red,0,.95,-1,.1,.65,.38);
 const nose=mesh(plane,new T.CylinderGeometry(.22,.23,.22,12),red,0,.64,1.27);nose.rotation.x=Math.PI/2;
 const propeller=new T.Group();propeller.name='plane-propeller';propeller.position.set(0,.64,1.43);plane.add(propeller);
 box(propeller,navy,0,0,0,.085,1.15,.065);box(propeller,navy,0,0,0,1.15,.085,.065);mesh(propeller,new T.SphereGeometry(.11,8,6),white,0,0,.045);
 for(const side of [-1,1]){const wake=mesh(plane,new T.ConeGeometry(.06,.5,8),blue,side*1.65,.56,-.42);wake.rotation.x=-Math.PI/2;wake.name='wingtip-wake';}
 const inverse=new T.Matrix4(),relative=new T.Matrix4();let bound:T.Object3D|undefined,boundHead:T.Object3D|undefined,coveredHead:T.Object3D|undefined,headWasVisible=true;
 const uncoverHead=()=>{if(coveredHead){coveredHead.visible=headWasVisible;coveredHead=undefined;}};
 let propellerAngle=0;
 let anchors:(T.Object3D|undefined)[]=[];
 return {armor,board,plane,update(dt:number,thrust:number,speed:number){propellerAngle+=dt*(24+speed);if(plane.visible)propeller.rotation.z=propellerAngle;if(armor.visible)for(const jet of jets)jet.scale.y=.65+thrust*.35+speed/45;},syncArmor(rig:T.Object3D,powered=true){
  for(const jet of jets)jet.visible=powered;
  let visible=true;for(let node:T.Object3D|null=armor;node;node=node.parent)if(!node.visible){visible=false;break;}
  if(!visible){uncoverHead();return;}if(bound!==rig){uncoverHead();bound=rig;boundHead=rig.getObjectByName('player-head');anchors=parts.map(p=>rig.getObjectByName(p.anchor));}
  const head=boundHead;if(head&&coveredHead!==head){uncoverHead();coveredHead=head;headWasVisible=head.visible;}if(coveredHead)coveredHead.visible=false;
  rig.updateWorldMatrix(true,true);armor.updateWorldMatrix(true,false);inverse.copy(armor.matrixWorld).invert();
  parts.forEach((part,i)=>{const anchor=anchors[i];if(anchor){relative.multiplyMatrices(inverse,anchor.matrixWorld);relative.decompose(part.group.position,part.group.quaternion,part.group.scale);}});
 },dispose(){uncoverHead();geometries.forEach(g=>g.dispose());[red,gold,teal,navy,white,cyan,orange,blue,dark].forEach(m=>m.dispose());}};
}
