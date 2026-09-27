import {createSocialPose,type SocialRoutine} from './arcadeSocial';
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createPlayer,profileFor,type PlayerMotion} from '../graphics/player';
import {defaultBeanLookFor,DEFAULT_CASUAL_OUTFIT} from '../graphics/beanLook';

export type ArcadePropCollider={x:number;z:number;halfX:number;halfZ:number;yaw?:number};
/** Merged dressing, a few pooled attract parts and one attendant, driven only by the room clock. */
export function createArcadeRoomProps(scene:T.Scene){
 const root=new T.Group();root.name='arcade-room-props';scene.add(root);
 const batches=new Map<string,T.BufferGeometry[]>(),geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 let activeBatch=batches;
 const placement=new T.Matrix4();
 function place(fromX:number,fromZ:number,toX:number,toZ:number,yaw:number){placement.makeTranslation(toX,0,toZ).multiply(new T.Matrix4().makeRotationY(yaw)).multiply(new T.Matrix4().makeTranslation(-fromX,0,-fromZ));}
 const matrix=new T.Matrix4(),position=new T.Vector3(),rotation=new T.Quaternion(),size=new T.Vector3();
 const boxBase=new T.BoxGeometry(1,1,1),ballBase=new T.SphereGeometry(1,10,7),cylinderBase=new T.CylinderGeometry(1,1,1,10);
 function part(base:T.BufferGeometry,x:number,y:number,z:number,sx:number,sy:number,sz:number,color:string,yaw=0){const g=base.clone();position.set(x,y,z);rotation.setFromAxisAngle(T.Object3D.DEFAULT_UP,yaw);size.set(sx,sy,sz);matrix.compose(position,rotation,size);g.applyMatrix4(matrix).applyMatrix4(placement);let batch=activeBatch.get(color);if(!batch){batch=[];activeBatch.set(color,batch);}batch.push(g);}
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,c:string,yaw=0)=>part(boxBase,x,y,z,w,h,d,c,yaw);
 const ball=(x:number,y:number,z:number,r:number,c:string)=>part(ballBase,x,y,z,r,r,r,c);
 const tube=(x:number,y:number,z:number,r:number,h:number,c:string)=>part(cylinderBase,x,y,z,r,h,r,c);
 const ink='#19152e',cream='#c8b5d1',gold='#e8b654',teal='#447d89',coral='#a34f87',wood='#65506d';
 function merge(batch:Map<string,T.BufferGeometry[]>,parent:T.Group){for(const [color,parts] of batch){const geometry=mergeGeometries(parts,false)!;geometries.push(geometry);for(const g of parts)g.dispose();const material=new T.MeshStandardMaterial({color,roughness:.82,emissive:color===gold?gold:'#000000',emissiveIntensity:color===gold?.22:0});materials.push(material);parent.add(new T.Mesh(geometry,material));}batch.clear();}
 // Geometry is still merged by palette inside each independently moving part.
 function animated(name:string,build:()=>void){const group=new T.Group();group.name=name;root.add(group);const batch=new Map<string,T.BufferGeometry[]>();activeBatch=batch;build();activeBatch=batches;merge(batch,group);return group;}
 function sign(text:string,sub:string,x:number,y:number,z:number,w:number,h:number,color=gold){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d')!;ctx.fillStyle=ink;ctx.fillRect(0,0,512,160);ctx.strokeStyle=color;ctx.lineWidth=8;ctx.strokeRect(5,5,502,150);ctx.textAlign='center';ctx.fillStyle=cream;ctx.font='bold 44px sans-serif';ctx.fillText(text,256,67);ctx.fillStyle=color;ctx.font='22px sans-serif';ctx.fillText(sub,256,116);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const mat=new T.MeshBasicMaterial({map:tex});materials.push(mat);const g=new T.PlaneGeometry(w,h);geometries.push(g);const mesh=new T.Mesh(g,mat);mesh.position.set(x,y,z);mesh.updateMatrix();mesh.applyMatrix4(placement);root.add(mesh);}
 function football(x:number,y:number,z:number,r:number){ball(x,y,z,r,cream);ball(x,y+r*.1,z+r*.88,r*.28,ink);ball(x-r*.75,y+r*.36,z+r*.4,r*.22,ink);ball(x+r*.64,y+r*.57,z+r*.42,r*.2,ink);}
 function plush(x:number,y:number,z:number,color:string){ball(x,y+.2,z,.23,color);ball(x,y+.5,z,.2,color);ball(x-.15,y+.67,z,.085,color);ball(x+.15,y+.67,z,.085,color);ball(x-.07,y+.53,z+.18,.022,ink);ball(x+.07,y+.53,z+.18,.022,ink);ball(x,y+.43,z+.18,.075,cream);ball(x-.18,y+.03,z+.1,.095,color);ball(x+.18,y+.03,z+.1,.095,color);}
 place(10,-9.6,13,-2,-Math.PI/3);
 const prizePlacement=placement.clone();
 const prizePoint=(x:number,z:number)=>new T.Vector3(x,0,z).applyMatrix4(prizePlacement);
 const attendantPosition=prizePoint(10,-9.35),counterPosition=prizePoint(10,-7.9),shelfPosition=prizePoint(10,-10.6);
 // Prize counter: a staffed display of football culture, not a spendable currency flow.
 // A 1.4m service aisle separates the shelf front from the countertop back.
 // Keep the counter at waist height so the attendant can greet over it.
 box(10,.52,-7.9,5.2,1.04,1.25,teal);box(10,1.12,-7.9,5.5,.16,1.5,cream);box(10,.54,-7.26,4.8,.74,.045,ink);
 for(let k=0;k<9;k++)box(7.9+k*.52,.54,-7.22,.035,.66,.02,gold);
 box(10,1.85,-11,5.7,3.7,.24,wood);for(const x of [7.25,10,12.75])box(x,2.03,-10.65,.13,3.5,.7,cream);
 for(const y of [.45,1.45,2.45,3.45])box(10,y,-10.62,5.6,.12,.82,cream);
 for(let i=0;i<4;i++){plush(7.8+i*.67,2.53,-10.35,i%2?coral:teal);football(10.4+i*.65,1.75,-10.35,.24);}
 for(let i=0;i<4;i++){const x=7.75+i*.62;box(x,1.56,-10.3,.38,.13,.3,ink);tube(x,1.77,-10.3,.055,.32,gold);ball(x,2,-10.3,.17,gold);}
 for(let i=0;i<5;i++){box(10.2+i*.5,.76,-10.33,.36,.48,.3,i%2?gold:coral);box(10.2+i*.5,.76,-10.15,.07,.48,.03,cream);}
 sign('PRIZES & TICKETS','FOOTBALL FAVOURITES',10,4.05,-10.55,5.7,.95);
 // Paper ticket fan and countertop bell; decorative, with no redemption UI.
 for(let i=0;i<7;i++){box(8.25+i*.13,1.22,-7.75,.18,.025,.48,i%2?cream:coral);box(8.25+i*.13,1.238,-7.64,.08,.008,.045,ink);}tube(11.8,1.24,-7.7,.16,.07,ink);ball(11.8,1.3,-7.7,.13,gold);
 placement.identity();
 // Air hockey: raised table, sunk play surface, goals, centre line and two paddles.
 for(const x of [-11,-9])for(const z of [-2.6,.6])box(x,.53,z,.24,1.05,.24,ink);
 box(-10,1.13,-1,2.9,.55,4.6,coral);box(-10,1.44,-1,2.56,.08,4.2,cream);
 for(const x of [-11.39,-8.61])box(x,1.55,-1,.18,.2,4.6,wood);
 for(const z of [-3.2,1.2]){box(-10,1.55,z,2.9,.2,.18,wood);box(-10,1.57,z,.92,.21,.2,ink);}
 box(-10,1.488,-1,2.52,.012,.04,teal);
 const ring=new T.TorusGeometry(.52,.024,6,24);ring.rotateX(-Math.PI/2);part(ring,-10,1.5,-1,1,1,1,coral);ring.dispose();
 const paddles=[teal,coral].map((color,i)=>animated(`arcade-hockey-paddle-${i}`,()=>{tube(-10,1.53,-1,.2,.07,color);tube(-10,1.64,-1,.065,.2,color);}));
 const puck=animated('arcade-hockey-puck',()=>tube(-10,1.53,-1,.12,.05,ink));
 place(-12,8,-12,8,Math.PI/3);
 // Claw machine: open front window reveals a toy pile and suspended grabber.
 box(-12,.55,8,2.05,1.1,1.7,coral);box(-12,3.15,8,2.2,.55,1.85,coral);box(-12,1.98,7.22,1.9,2.05,.1,ink);
 for(const x of [-12.97,-11.03])for(const z of [7.22,8.77])box(x,2.02,z,.1,2.14,.1,cream);
 box(-12,1.14,8,1.9,.1,1.6,gold);for(let i=0;i<4;i++)plush(-12.65+i*.4,1.21,7.9+(i%2)*.45,i%2?teal:gold);
 box(-12,2.96,8.15,1.5,.055,.07,ink);
 const claw=animated('arcade-claw-carriage',()=>{box(-12,2.95,8.15,.22,.1,.18,cream);tube(-12,2.62,8.15,.025,.62,cream);ball(-12,2.3,8.15,.09,ink);for(const x of [-12.13,-11.87])box(x,2.18,8.15,.045,.22,.045,cream);});
 box(-12,.75,8.89,.6,.38,.06,ink);box(-12,1.18,8.99,2.1,.17,.4,cream);tube(-12.4,1.37,8.98,.055,.25,ink);ball(-12.4,1.49,8.98,.1,coral);tube(-11.6,1.3,8.98,.1,.04,teal);sign('CLAW CLUB','BEAN BUDDIES',-12,3.17,8.94,2,.48);
 place(12,8,12,8,-Math.PI/3);
 // Vending machine: readable bottles, selection buttons, lower collection tray.
 box(12,1.55,8,2,3.1,1.55,teal);box(11.72,1.85,8.81,1.15,1.75,.08,ink);box(12,.47,8.81,1.55,.48,.09,ink);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){const x=11.32+col*.38,y=1.24+row*.51;box(x,y,8.89,.2,.32,.12,col===1?coral:cream);tube(x,y+.2,8.89,.045,.08,gold);}for(let i=0;i<4;i++)box(12.68,1.48+i*.28,8.82,.19,.13,.1,gold);sign('REFRESH','TAKE A BREATHER',12,2.88,8.83,1.75,.45);
 const stock=animated('arcade-vending-stock-light',()=>box(12.68,2.57,8.83,.19,.08,.055,gold));
 const stockMaterial=(stock.children[0] as T.Mesh).material as T.MeshStandardMaterial;
 // Most furniture stays one immutable batch per palette colour.
 merge(batches,root);boxBase.dispose();ballBase.dispose();cylinderBase.dispose();
 const attendant=createPlayer('arcade-prize-attendant','neutral',true,true);attendant.root.name='arcade-prize-attendant';attendant.setProfile(profileFor('npc',82));const look=defaultBeanLookFor('arcade-prize-attendant');attendant.setBeanLook(look,{...DEFAULT_CASUAL_OUTFIT,shirt:cream,shirt2:teal});root.add(attendant.root);
 const motion:PlayerMotion={travelMode:'walk',facing:-Math.PI/3,lookX:10,lookZ:-2,lookY:1.4,ready:.2};attendant.update(attendantPosition.x,attendantPosition.z,0,0,false,motion);
 let attentive=false;let disposed=false,social:SocialRoutine|null=null,socialAge=-1;const socialPose=createSocialPose();
 const colliders:ArcadePropCollider[]=[{x:counterPosition.x,z:counterPosition.z,halfX:2.75,halfZ:.75,yaw:-Math.PI/3},{x:shelfPosition.x,z:shelfPosition.z,halfX:2.85,halfZ:.55,yaw:-Math.PI/3},{x:-10,z:-1,halfX:1.55,halfZ:2.4},{x:-12,z:8,halfX:1.615,halfZ:1.596},{x:12,z:8,halfX:1.374,halfZ:1.428}];
 // Triangle reflection gives exact table-edge bounces; paddles arrive at each
 // interception point before the puck instead of orbiting independently.
 const reflect=(phase:number)=>1-Math.abs(((phase%4)+4)%4-2);
 // Three side-wall traversals per end-to-end cycle keep paddle contacts away
 // from the corners while the puck reaches the actual inner side rail.
 const hockeyX=(time:number)=>reflect(time*1.05+1.3)*1.18;
 const cycle=4/.7;
 function animate(time:number,reduced:boolean){const t=reduced?0:time;
  puck.position.set(hockeyX(t),0,reflect(t*.7+1)*1.55);
  for(let i=0;i<2;i++){const impact=(i===0?3:1)/.7,next=impact+Math.ceil((t-impact)/cycle)*cycle,previous=next-cycle,u=(t-previous)/cycle,ease=u*u*(3-2*u);paddles[i].position.set(hockeyX(previous)+(hockeyX(next)-hockeyX(previous))*ease,0,i===0?-1.87:1.87);}
  const slide=reduced?0:Math.sin(t*.43)*.52;claw.position.set(slide*Math.cos(Math.PI/3),0,-slide*Math.sin(Math.PI/3));
  stockMaterial.emissiveIntensity=reduced?.28:.25+(1+Math.sin(t*.9))*.14;
 }
 animate(0,true);let greeting=0,wasNear=false,greetTime=0;
 return{setAttention(value:boolean){attentive=value;},beginSocial(routine:SocialRoutine){social=routine;socialAge=-1;},setSocialAge(age:number){socialAge=age;},releaseSocial(){social=null;socialAge=-1;},interactionPoint:prizePoint(10,-6.1),colliders,attendantBody:{x:attendantPosition.x,z:attendantPosition.z},get debug(){return{claw:[claw.position.x,claw.position.z],puck:[puck.position.x,puck.position.z],paddles:paddles.map(p=>[p.position.x,p.position.z]),stock:stockMaterial.emissiveIntensity,greeting,attendant:!!attendant.root.userData.beanBody,attendantPosition:{x:attendantPosition.x,z:attendantPosition.z},serviceAisle:1.4,social:!!social,socialAge};},update(dt:number,time:number,playerX=0,playerZ=0,reduced=false){if(disposed||dt<=0)return;animate(time,reduced);const near=Math.hypot(playerX-attendantPosition.x,playerZ-attendantPosition.z)<(wasNear?5.8:5);if(near&&!wasNear)greetTime=2.4;wasNear=near;greetTime=Math.max(0,greetTime-dt);
  greeting=T.MathUtils.damp(greeting,near&&greetTime>0?1:0,4,Math.min(.1,dt));motion.ready=.2;motion.called=reduced?0:greeting*.85;motion.lookX=near?playerX:10;motion.lookZ=near?playerZ:-2;motion.skill=undefined;motion.jump=undefined;if(!social)motion.facing=attentive?Math.atan2(playerX-attendantPosition.x,playerZ-attendantPosition.z):-Math.PI/3;if(social){motion.facing=Math.atan2(playerX-attendantPosition.x,playerZ-attendantPosition.z);socialPose(motion,social,socialAge,true,reduced);}attendant.setExpression(near||social?'happy':'neutral');attendant.update(attendantPosition.x,attendantPosition.z,Math.min(.1,dt),time,reduced,motion);
 },dispose(){if(disposed)return;disposed=true;attendant.dispose();root.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
