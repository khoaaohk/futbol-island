import * as T from 'three';
import {CHEST_HEIGHT} from './spineSurface';
import {beanShapeOf,beanSurface,sameShape,BEAN_FACE,BEAN_Y0,DEFAULT_BEAN_SHAPE,type BeanShape} from './beanGearFit';

export type BeanArmorFace='open'|'plate';
/** Three lightweight rides; armor follows the selected character's animated joints. */
export function createFlightExtras(){
 const armor=new T.Group(),board=new T.Group(),plane=new T.Group();armor.name='ironman';board.name='rocketboard';plane.name='mini-plane';
 const red=new T.MeshStandardMaterial({color:'#b82e35',metalness:.45,roughness:.4}),gold=new T.MeshStandardMaterial({color:'#efbf57',metalness:.35,roughness:.45}),teal=new T.MeshStandardMaterial({color:'#29a8b5',roughness:.55}),navy=new T.MeshStandardMaterial({color:'#324467',roughness:.65}),white=new T.MeshStandardMaterial({color:'#fff0c9',roughness:.6});
 const cyan=new T.MeshBasicMaterial({color:'#91efff',toneMapped:false}),orange=new T.MeshBasicMaterial({color:'#ffb768',toneMapped:false}),blue=new T.MeshBasicMaterial({color:'#b6ddff',toneMapped:false});
 const dark=new T.MeshStandardMaterial({color:'#40282b',metalness:.3,roughness:.5});
 const geometries:T.BufferGeometry[]=[];
 function mesh(parent:T.Group,geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);geometries.push(geometry);return m;}
 const box=(parent:T.Group,mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number)=>mesh(parent,new T.BoxGeometry(w,h,d),mat,x,y,z);
 const parts:{group:T.Group;anchor:string;bean:boolean}[]=[],jets:T.Mesh[]=[];
 function part(anchor:string,x:number,y:number,z:number){const g=new T.Group();g.name=anchor+'-armor';g.position.set(x,y,z);armor.add(g);parts.push({group:g,anchor,bean:false});const shell=new T.Group();shell.name=anchor+'-armor-shell';shell.scale.set(1.625,1.12,1.625);g.add(shell);return shell;}
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

 // ---- Bean-fit suit (docs/bean-characters/CONTRACT.md, lane F): a rounded red shell that follows the bean
 // (lower half on the torso, upper half + helmet on the chest joint so it bends with the spine), gold waist band
 // and face rim, arc reactor, and rounded pieces on the noodle limbs. The face is either left open (the bean's
 // own expression shows through a gold rim) or closed with a gold faceplate and glowing eye slits.
 function beanPart(anchor:string){const g=new T.Group();g.name=anchor+'-bean-armor';armor.add(g);parts.push({group:g,anchor,bean:true});return g;}
 const beanTorso=beanPart('armor-torso'),beanChest=beanPart('player-chest');
 const shellMaterial=new T.MeshStandardMaterial({vertexColors:true,metalness:.42,roughness:.42});
 const shellLower=new T.Mesh(new T.BufferGeometry(),shellMaterial),shellUpper=new T.Mesh(new T.BufferGeometry(),shellMaterial),facePlate=new T.Group();
 shellLower.name='bean-armor-shell';shellUpper.name='bean-armor-helmet';facePlate.name='bean-armor-faceplate';
 for(const m of [shellLower,shellUpper]){m.castShadow=true;}
 beanTorso.add(shellLower);beanChest.add(shellUpper,facePlate);
 const beanReactor=mesh(beanTorso,new T.CylinderGeometry(.06,.06,.03,14),cyan,0,.3,.2);beanReactor.rotation.x=Math.PI/2;beanReactor.name='arc-reactor';
 const eyeGeometry=new T.BoxGeometry(.075,.022,.02);geometries.push(eyeGeometry);
 const beanEyes=[-1,1].map(side=>{const eye=new T.Mesh(eyeGeometry,cyan);eye.name='helmet-glowing-eye';eye.rotation.z=side*.12;facePlate.add(eye);return eye;});
 const capsule=(parent:T.Group,material:T.Material,r:number,length:number,y:number)=>mesh(parent,new T.CapsuleGeometry(r,length,4,10),material,0,y,0);
 const ellipsoid=(parent:T.Group,material:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const m=mesh(parent,new T.SphereGeometry(1,14,10),material,x,y,z);m.scale.set(sx,sy,sz);return m;};
 for(const prefix of ['left','right']){
  const shoulder=beanPart(prefix+'-shoulder');ellipsoid(shoulder,red,0,-.035,0,.085,.075,.085);capsule(shoulder,red,.064,.12,-.15);
  const elbow=beanPart(prefix+'-elbow');capsule(elbow,red,.06,.11,-.11);mesh(elbow,new T.TorusGeometry(.062,.016,6,14),gold,0,-.205,0).rotation.x=Math.PI/2;
  const hand=beanPart(prefix+'-hand');ellipsoid(hand,red,0,-.02,0,.066,.074,.06);
  mesh(hand,new T.CylinderGeometry(.04,.04,.02,10),cyan,0,-.094,0);
  const handJet=mesh(hand,new T.ConeGeometry(.04,.38,8),cyan,0,-.29,0);handJet.rotation.z=Math.PI;handJet.name='hand-repulsor';jets.push(handJet);
  const hip=beanPart(prefix+'-hip');capsule(hip,gold,.078,.2,-.2);
  const knee=beanPart(prefix+'-knee');capsule(knee,red,.068,.2,-.2);ellipsoid(knee,gold,0,0,.045,.055,.05,.04);
  const boot=beanPart(prefix+'-ankle');ellipsoid(boot,red,0,-.028,.055,.088,.07,.152);
  mesh(boot,new T.CylinderGeometry(.05,.05,.02,10),cyan,0,-.1,.04);
  const plume=mesh(boot,new T.ConeGeometry(.058,.45,8),cyan,0,-.34,.04);plume.rotation.z=Math.PI;plume.name='boot-repulsor';jets.push(plume);
 }
 let beanFace:BeanArmorFace='plate'/* user (Sep 26 2026): gold faceplate is the default */,shellShape:BeanShape|undefined,beanFit=false;
 /** Shell vertices: the bean scaled out by a few centimetres; face coords match lane A's inset face panel. */
 function buildShell(s:BeanShape){
  shellShape=s;
  const open=beanFace==='open',span=s.H-BEAN_Y0,yFace=BEAN_Y0+BEAN_FACE.u*span,SEG=64,NU=52,GAP=.028;
  const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
  const redC=new T.Color('#b82e35'),goldC=new T.Color('#efbf57'),c=new T.Color();
  // Every vertex sits on the bean pushed out along its normal. Round the face the offset eases down: open, it
  // dips just under the bean's face panel (so the expression shows through a smooth gold rim, no cut edges);
  // closed, it stays proud of the face as a gold faceplate. Colour is per vertex: red, gold rim and waist band.
  const at=(u:number,a:number)=>{const q=beanSurface(s,u,a);return [q.x,q.y,q.z];};
  const vertex=(u:number,a:number)=>{
   const p=at(u,a),du=[0,0,0],da=[0,0,0],hi=at(Math.min(1,u+.01),a),lo=at(Math.max(0,u-.01),a),l=at(u,a-.02),r=at(u,a+.02);
   for(let k=0;k<3;k++){du[k]=hi[k]-lo[k];da[k]=r[k]-l[k];}
   let nx=da[1]*du[2]-da[2]*du[1],ny=da[2]*du[0]-da[0]*du[2],nz=da[0]*du[1]-da[1]*du[0],nl=Math.hypot(nx,ny,nz);
   if(nl<1e-9){nx=0;ny=u>.5?1:-1;nz=0;nl=1;}nx/=nl;ny/=nl;nz/=nl;
   const rr=Math.hypot(p[0]-s.leanX*u*u*span,(p[2]-s.leanZ*u*u*span)/s.D)||1e-3,px=(a>Math.PI?a-Math.PI*2:a)*rr,py=p[1]-yFace;
   const d=(px/BEAN_FACE.rx)**2+(py/BEAN_FACE.ry)**2,edge=smooth(.9,1.22,d);
   const off=open?-.012+(GAP+.012)*edge:GAP*(.6+.4*edge);
   const rim=open?smooth(.9,1.02,d)*(1-smooth(1.4,1.55,d)):1-smooth(1.12,1.24,d),band=smooth(.12,.13,u)*(1-smooth(.18,.19,u));
   c.copy(redC).lerp(goldC,Math.max(rim,band));
   return {x:p[0]+nx*off,y:p[1]+ny*off-.02*(1-u)*(1-u),z:p[2]+nz*off,c:[c.r,c.g,c.b]};
  };
  const grid:ReturnType<typeof vertex>[][]=[];for(let i=0;i<=NU;i++){const row=[];for(let j=0;j<=SEG;j++)row.push(vertex(i/NU,j/SEG*Math.PI*2));grid.push(row);}
  const build=(uFrom:number,uTo:number,dy:number)=>{
   const pos:number[]=[],col:number[]=[],idx:number[]=[],W=SEG+1,a0=Math.floor(uFrom*NU),a1=Math.ceil(uTo*NU);
   for(let i=a0;i<=a1;i++)for(const v of grid[i]){pos.push(v.x,v.y+dy,v.z);col.push(...v.c);}
   for(let i=0;i<a1-a0;i++)for(let j=0;j<SEG;j++){const a=i*W+j,b=a+W;idx.push(a,a+1,b,b,a+1,b+1);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;
  };
  shellLower.geometry.dispose();shellLower.geometry=build(0,.5,0);
  shellUpper.geometry.dispose();shellUpper.geometry=build(.45,1,-CHEST_HEIGHT);
  facePlate.visible=!open;
  const eyeU=(yFace+.035-BEAN_Y0)/span;
  beanEyes.forEach((eye,i)=>{const side=i?1:-1,a=side*.3,p=beanSurface(s,eyeU,a);eye.position.set(p.x*1.1,p.y-CHEST_HEIGHT,p.z+GAP*.6+.006);eye.rotation.set(0,a*.9,side*.14);});
  const chest=beanSurface(s,(.3-BEAN_Y0)/span,0);beanReactor.position.set(0,.3,chest.z+GAP+.006);
 }
 const deck=mesh(board,new T.SphereGeometry(1,16,8),teal,0,.13,0);deck.scale.set(.43,.105,1.18);
 box(board,navy,0,.23,0,.43,.025,1.45);box(board,white,0,.245,.45,.07,.015,.55);
 for(const side of [-1,1]){box(board,white,side*.34,.14,-.55,.18,.09,.85);const engine=mesh(board,new T.CylinderGeometry(.13,.13,.55,10),navy,side*.25,.045,-.7);engine.rotation.x=Math.PI/2;const flame=mesh(board,new T.ConeGeometry(.1,.7,8),orange,side*.25,.045,-1.24);flame.rotation.x=-Math.PI/2;flame.name='board-thruster';}
 const fuselage=mesh(plane,new T.SphereGeometry(1,16,8),gold,0,.63,.03);fuselage.scale.set(.4,.31,1.3);fuselage.name='mini-plane-fuselage';
 const seatBack=box(plane,navy,0,.88,-.3,.44,.23,.22);box(plane,red,0,.58,.15,3.5,.12,.65);
 for(const side of [-1,1]){box(plane,white,side*1.48,.65,.15,.25,.025,.65);box(plane,navy,side*.55,.25,.25,.08,.5,.1);mesh(plane,new T.SphereGeometry(.15,8,6),navy,side*.55,.11,.25);}
 box(plane,red,0,.74,-.95,1.25,.1,.36);box(plane,red,0,.95,-1,.1,.65,.38);
 const nose=mesh(plane,new T.CylinderGeometry(.22,.23,.22,12),red,0,.64,1.27);nose.rotation.x=Math.PI/2;
 const propeller=new T.Group();propeller.name='plane-propeller';propeller.position.set(0,.64,1.43);plane.add(propeller);
 box(propeller,navy,0,0,0,.085,1.15,.065);box(propeller,navy,0,0,0,1.15,.085,.065);mesh(propeller,new T.SphereGeometry(.11,8,6),white,0,0,.045);
 for(const side of [-1,1]){const wake=mesh(plane,new T.ConeGeometry(.06,.5,8),blue,side*1.65,.56,-.42);wake.rotation.x=-Math.PI/2;wake.name='wingtip-wake';}
 // Bean fit: a control yoke meets the bean's hands (the classic pose keeps its hands on the cockpit rim).
 const yoke=new T.Group();yoke.name='mini-plane-yoke';plane.add(yoke);
 box(yoke,navy,0,1.01,.36,.56,.05,.05);box(yoke,navy,0,.93,.36,.05,.16,.05);yoke.visible=false;
 const inverse=new T.Matrix4(),relative=new T.Matrix4();let bound:T.Object3D|undefined,boundHead:T.Object3D|undefined,coveredHead:T.Object3D|undefined,headWasVisible=true;
 // Bean hair and headwear would poke through the helmet; they are hidden with the head and restored with it.
 let boundCover:T.Object3D[]=[];const covered:{object:T.Object3D;visible:boolean}[]=[];
 const uncoverHead=()=>{if(coveredHead){coveredHead.visible=headWasVisible;coveredHead=undefined;}for(const c of covered)c.object.visible=c.visible;covered.length=0;};
 let propellerAngle=0;
 let anchors:(T.Object3D|undefined)[]=[];
 const setBeanFit=(bean:boolean)=>{
  beanFit=bean;for(const p of parts)p.group.visible=p.bean===bean;
  seatBack.position.z=bean?-.44:-.3;yoke.visible=bean;
  // Feet of the rocket-surf stance sit ~.17 m lower than the classic deck: the board drops to meet the soles.
  board.position.y=bean?-.15:0;
  if(bean&&!shellShape)buildShell(DEFAULT_BEAN_SHAPE);
 };
 setBeanFit(false);
 return {armor,board,plane,setBeanFit,setBeanFace(mode:BeanArmorFace){if(mode===beanFace)return;beanFace=mode;if(shellShape)buildShell(shellShape);},
  get beanFace(){return beanFace;},
  update(dt:number,thrust:number,speed:number){propellerAngle+=dt*(24+speed);if(plane.visible)propeller.rotation.z=propellerAngle;if(armor.visible)for(const jet of jets)jet.scale.y=.65+thrust*.35+speed/45;},syncArmor(rig:T.Object3D,powered=true){
  for(const jet of jets)jet.visible=powered;
  let visible=true;for(let node:T.Object3D|null=armor;node;node=node.parent)if(!node.visible){visible=false;break;}
  if(!visible){uncoverHead();return;}if(bound!==rig){uncoverHead();bound=rig;boundHead=rig.getObjectByName('player-head');anchors=parts.map(p=>rig.getObjectByName(p.anchor));boundCover=[];rig.traverse(o=>{if(o.name==='bean-hair'||o.name==='bean-hat')boundCover.push(o);});}
  const head=boundHead;if(head&&coveredHead!==head){uncoverHead();coveredHead=head;headWasVisible=head.visible;}if(coveredHead)coveredHead.visible=false;
  if(beanFit){const s=beanShapeOf(rig);if(s&&!sameShape(s,shellShape))buildShell(s);for(const o of boundCover)if(o.visible){covered.push({object:o,visible:true});o.visible=false;}}
  rig.updateWorldMatrix(true,true);armor.updateWorldMatrix(true,false);inverse.copy(armor.matrixWorld).invert();
  parts.forEach((part,i)=>{const anchor=anchors[i];if(anchor){relative.multiplyMatrices(inverse,anchor.matrixWorld);relative.decompose(part.group.position,part.group.quaternion,part.group.scale);}});
 },dispose(){uncoverHead();geometries.forEach(g=>g.dispose());[shellLower,shellUpper].forEach(m=>m.geometry.dispose());shellMaterial.dispose();[red,gold,teal,navy,white,cyan,orange,blue,dark].forEach(m=>m.dispose());}};
}
