import * as T from 'three';
import {separateArcadeBody} from './arcadeBodyCollision';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {createArcadeRoomCrowd} from './arcadeRoomCrowd';
import {createArcadeCabinetAttract} from './arcadeCabinetAttract';
import {createBuildingGlow} from '../graphics/buildingGlow';
import {createArcadeRoomSound} from '../audio/arcadeRoomSound';
import {createArcadeRoomProps} from './arcadeRoomProps';
import {frameCapSlot} from '../town/frameCap';
import {createMatchBallTexture} from '../graphics/matchBallTexture';
import {createPlayer,type PlayerMotion} from '../graphics/player';
import {createSocialPose,socialRoutine,soloRoutine,keepUpAge,socialPath,type SocialRoutine} from './arcadeSocial';
import {createBallEffects} from '../graphics/ballEffects';
import {createWalkBall} from '../town/walkBall';
import {createBallReactions} from '../graphics/ballReactions';
import {SKILL_MOVES,skillBall,skillFrame,type SkillMotion} from '../graphics/skillMoves';
import {BALL_COLORS,loadCustomization,beanLookFor,playerOutfit} from '../town/customization';
import {getQuizProgress} from '../town/quizProgress';
import {arcadeCabinets,type ArcadeCabinetId} from './arcadeCatalog';

export type ArcadeBallAction='shoot'|'rainbow'|'keepups'|'scissors';
export type ArcadeRoomAction=ArcadeBallAction|'jump'|'wave'|'applaud'|'celebrate';

/** A self-contained room; visible idle activity runs at 15 fps and hidden rooms sleep. No island, match, game scene or world imports. */
export function createArcadeRoomScene(canvas:HTMLCanvasElement,onNear:(id:ArcadeCabinetId|null)=>void,start?:{x:number;z:number},onPrompt?:(x:number,y:number,visible:boolean)=>void,onExit?:()=>void,onSocialNear?:(id:number|null)=>void){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const cabinets=arcadeCabinets.map((c,i)=>({...c,yaw:i===3?.55:i===4?-.55:c.yaw}));
 const sound=createArcadeRoomSound();const scene=new T.Scene();scene.background=new T.Color('#090916');const camera=new T.OrthographicCamera(-8,8,8,-8,.1,70);camera.position.set(0,16,19);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight('#aca0e5','#111021',.95));const sun=new T.DirectionalLight('#e4d9ff',1.5);sun.position.set(-4,10,8);scene.add(sun);
 const geometry=new RoundedBoxGeometry(1,1,1,2,.055),materials=new Map<string,T.MeshStandardMaterial>(),textures:T.Texture[]=[];
 function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,color:string){let mat=materials.get(color);if(!mat){const neon=['#ff65c8','#60e9f2','#b991ff'].includes(color);mat=new T.MeshStandardMaterial({color,roughness:neon?.38:.72,emissive:neon?color:'#000000',emissiveIntensity:neon?1.2:0});materials.set(color,mat);}const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
 box(scene,0,-.2,-2,90,.4,90,'#101020');box(scene,0,4,-12,32,8,.3,'#171328');box(scene,-15.8,2.5,0,.3,5,26,'#171328');box(scene,15.8,2.5,0,.3,5,26,'#171328');
 for(let x=-14;x<=14;x+=2)for(let z=-10;z<=12;z+=2)if((x+z)%4===0)box(scene,x,.006,z,1.97,.015,1.97,'#201a35');

 // Neon rails and low-key confetti carpet: merged static geometry, no bloom pass or extra lights.
 for(const side of[-1,1]){const neon=side<0?'#ff65c8':'#60e9f2';box(scene,side*15.45,.35,0,.045,.05,24,neon);box(scene,side*15.45,3.6,0,.045,.05,24,neon);box(scene,side*7.5,.15,11.7,9,.035,.04,neon);}
 box(scene,0,3.9,-11.7,30,.045,.04,'#b991ff');
 for(let i=0;i<72;i++){const px=-13+(i*7.31)%26,pz=-10+(i*4.73)%21;const fleck=box(scene,px,.032,pz,.23,.012,.045,i%2?'#443154':'#264454');fleck.rotation.y=(i%5)*.6;}
 const sign=(parent:T.Object3D,text:string,sub:string,color:string,w:number,h:number,x:number,y:number,z:number)=>{const c=document.createElement('canvas');c.width=768;c.height=256;const p=c.getContext('2d')!;p.fillStyle='#0b091b';p.fillRect(0,0,768,256);p.strokeStyle=color;p.lineWidth=10;p.strokeRect(8,8,752,240);p.textAlign='center';p.fillStyle=color;p.shadowColor=color;p.shadowBlur=18;p.font='900 64px monospace';p.lineWidth=2;p.strokeText(text,384,112);p.fillStyle='#ffeffb';p.fillText(text,384,112);p.shadowBlur=0;p.fillStyle='#dcd4f7';p.font='28px sans-serif';p.fillText(sub,384,178);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const mat=new T.MeshBasicMaterial({map:tex});const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 sign(scene,'THE ARCADE','FIVE GAMES · ALL FOOTBALL','#ff65c8',18,3,0,6,-11.75);
 // Bent neon tubing around the marquee, with cached translucent jackets instead of postprocessing.
 function marqueeTube(w:number,h:number,color:string){
  const y=6,z=-11.57,r=.28,l=-w/2,rr=w/2,b=y-h/2,t=y+h/2,path=new T.CurvePath<T.Vector3>();
  const v=(x:number,y:number)=>new T.Vector3(x,y,z),line=(ax:number,ay:number,bx:number,by:number)=>path.add(new T.LineCurve3(v(ax,ay),v(bx,by))),corner=(ax:number,ay:number,cx:number,cy:number,bx:number,by:number)=>path.add(new T.QuadraticBezierCurve3(v(ax,ay),v(cx,cy),v(bx,by)));
  line(l+r,b,rr-r,b);corner(rr-r,b,rr,b,rr,b+r);line(rr,b+r,rr,t-r);corner(rr,t-r,rr,t,rr-r,t);line(rr-r,t,l+r,t);corner(l+r,t,l,t,l,t-r);line(l,t-r,l,b+r);corner(l,b+r,l,b,l+r,b);
  const core=new T.MeshBasicMaterial({color,toneMapped:false}),jacket=new T.MeshBasicMaterial({color,transparent:true,opacity:.18,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  scene.add(new T.Mesh(new T.TubeGeometry(path,100,.035,6,true),core),new T.Mesh(new T.TubeGeometry(path,100,.105,6,true),jacket));
 }
 marqueeTube(18.55,3.5,'#60e9f2');marqueeTube(17.95,2.95,'#ff65c8');
 for(const side of[-1,1])box(scene,side*8.6,2.9,-11.8,.25,5.8,.25,'#171328');
 // A little room beyond the machines: lounge, trophy plinth and pennants.
 for(const seatZ of[-6,2.5]){const side=-1,lx=-13;box(scene,lx,.35,seatZ,2.1,.7,3.7,'#50365f');box(scene,lx+side*.85,1,seatZ,.4,1.2,3.7,'#795282');for(const dz of[-1.4,1.4])box(scene,lx,.8,seatZ+dz,2.1,.6,.32,'#795282');box(scene,lx,.83,seatZ-.8,1.55,.25,.85,'#a776a5');}

 for(const side of[-1,1]){const px=side*14;box(scene,px,1,-10.5,.75,2,.75,'#eedbb5');box(scene,px,2.2,-10.5,.48,.4,.48,'#edb957');}
 for(const side of[-1,1]){for(const z of[-9,-1,8]){box(scene,side*15.3,1.9,z,.75,3.8,.75,'#36555f');box(scene,side*15.3,3.8,z,1,.18,1,side<0?'#ff65c8':'#60e9f2');}}
 
 const lightCanvas=document.createElement('canvas');lightCanvas.width=lightCanvas.height=128;const lightPaint=lightCanvas.getContext('2d')!,gradient=lightPaint.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.8)');gradient.addColorStop(.45,'rgba(255,255,255,.28)');gradient.addColorStop(1,'rgba(255,255,255,0)');lightPaint.fillStyle=gradient;lightPaint.fillRect(0,0,128,128);const glowTexture=new T.CanvasTexture(lightCanvas);textures.push(glowTexture);
 const cabinetScreens:T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>[]=[],cabinetPools:T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>[]=[],cabinetGlitch=new Float32Array(5);let cabinetHits=0,pendingCabinet=-1;
 const cabinetRoots:T.Group[]=[],attract:{id:ArcadeCabinetId;demo:ReturnType<typeof createArcadeCabinetAttract>;bound:T.Sphere;active:boolean}[]=[],highlights:ReturnType<typeof createBuildingGlow>[]=[];
 const discGeometry=new T.CircleGeometry(1,32);const shadowMaterial=new T.MeshBasicMaterial({color:'#152e35',transparent:true,opacity:.22,depthWrite:false});
 function shadow(x:number,z:number,sx:number,sz:number){const disc=new T.Mesh(discGeometry,shadowMaterial);disc.rotation.x=-Math.PI/2;disc.position.set(x,.08,z);disc.scale.set(sx,sz,1);scene.add(disc);return disc;}

 cabinets.forEach((cabinet,i)=>{const g=new T.Group();g.name=`cabinet-${cabinet.id}`;g.position.set(cabinet.x,0,cabinet.z);g.rotation.y=cabinet.yaw;scene.add(g);cabinetRoots.push(g);const pool=new T.Mesh(new T.PlaneGeometry(6,6),new T.MeshBasicMaterial({map:glowTexture,color:cabinet.color,transparent:true,opacity:.38,depthWrite:false,blending:T.AdditiveBlending}));pool.rotation.x=-Math.PI/2;pool.position.set(cabinet.x,.082,cabinet.z+1.8);scene.add(pool);cabinetPools.push(pool);highlights.push(createBuildingGlow(g,1.9,1.35,3.1,'cabinet'));box(scene,cabinet.x,.035,cabinet.z+1.5,4,.035,5,'#302344');box(scene,cabinet.x,.055,cabinet.z+1.5,3.7,.018,4.7,'#19162d');shadow(cabinet.x,cabinet.z+.3,1.5,1.35);
 box(g,0,.65,.05,1.9,1.3,1.35,'#20182f');box(g,0,2,-.13,1.9,1.5,.96,'#20182f');box(g,0,.32,.71,1.64,.52,.08,'#171525');box(g,0,1.86,.68,1.58,1.35,.09,'#100f21');const console=box(g,0,1.31,.97,1.98,.22,.7,'#544266');console.rotation.x=.12;box(g,0,2.8,.33,2.05,.58,1.04,'#342345');sign(g,cabinet.short,'FREE PLAY',cabinet.color,1.85,.52,0,2.8,.88);
 const demo=createArcadeCabinetAttract(cabinet.id),screen=new T.Mesh(new T.PlaneGeometry(1.37,1.1),new T.MeshBasicMaterial({map:demo.texture}));screen.position.set(0,1.98,.735);screen.rotation.x=-.08;g.add(screen);cabinetScreens.push(screen);attract.push({id:cabinet.id,demo,bound:new T.Sphere(new T.Vector3(cabinet.x+Math.sin(cabinet.yaw)*.735,1.98,cabinet.z+Math.cos(cabinet.yaw)*.735),.95),active:false});
 box(g,-.91,1.3,.7,.045,2.4,.055,cabinet.color);box(g,.91,1.3,.7,.045,2.4,.055,cabinet.color);
 box(g,0,.19,.75,1.7,.035,.045,cabinet.color);box(g,0,2.48,.755,1.62,.035,.045,cabinet.color);
 box(g,-.42,1.58,1.05,.1,.35,.1,'#253c44');box(g,-.42,1.78,1.05,.23,.16,.23,cabinet.color);for(let k=0;k<2;k++)box(g,.3+k*.3,1.46,1.14,.18,.08,.18,k?'#ed8c74':'#456b67');box(g,0,.67,.71,.42,.12,.05,'#edb957');
 });
 // Static palette batches: the large room does not cost a draw for every tile/trim.
 scene.updateMatrixWorld(true);const batches=new Map<T.Material,T.BufferGeometry[]>(),staticBoxes:T.Mesh[]=[];
 scene.traverse(o=>{if(o instanceof T.Mesh&&o.geometry===geometry&&o.material instanceof T.MeshStandardMaterial){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);let parts=batches.get(o.material);if(!parts){parts=[];batches.set(o.material,parts);}parts.push(g);staticBoxes.push(o);}});
 for(const mesh of staticBoxes)mesh.removeFromParent();for(const [material,parts] of batches){const merged=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());scene.add(new T.Mesh(merged,material));}batches.clear();
 const cabinetBounds=cabinets.map(c=>new T.Box3(new T.Vector3(c.x-1.25,0,c.z-1.25),new T.Vector3(c.x+1.25,3.2,c.z+1.25)));
 const player=createPlayer('you','home',true,true),progress=getQuizProgress(),custom=loadCustomization(progress.completed,progress.total);player.setAppearance(custom);player.setBeanLook(beanLookFor(custom),playerOutfit(custom));player.root.name='arcade-room-player';scene.add(player.root);const playerShadow=shadow(0,0,.43,.28);
 const ballTexture=createMatchBallTexture();textures.push(ballTexture);const ball=new T.Mesh(new T.SphereGeometry(.19,20,14),new T.MeshStandardMaterial({map:ballTexture,roughness:.7}));ball.name='arcade-dribble-ball';scene.add(ball);const ballShadow=shadow(0,0,.2,.15),ballAim=new T.Vector3(),ballFrom=new T.Vector3(),ballTo=new T.Vector3(),rollAxis=new T.Vector3();let ballReady=false;
 let heldAction:ArcadeBallAction|null=null,actionCycles=0;
 let ballAction:{kind:ArcadeBallAction;age:number;duration:number;range:number}|null=null;const ballSkill:SkillMotion={type:'rainbowFlick',progress:0,side:1},skillLocal={x:0,y:0,z:0},skillRoot={x:0,z:0,heading:0};
 const ballEffects=createBallEffects();scene.add(ballEffects.root);ballEffects.root.visible=false;let ballEffectTail=0;
 const shot=createWalkBall(),reactions=createBallReactions(scene),shotPlayer={x:0,y:0,z:0,yaw:0};let shotHeldAt:number|null=null;
 const props=createArcadeRoomProps(scene);const obstacles=[...props.colliders,{x:-13,z:2.5,halfX:1.2,halfZ:2,yaw:0},{x:-13,z:-6,halfX:1.2,halfZ:2,yaw:0}].map(o=>({...o,cos:Math.cos(o.yaw??0),sin:Math.sin(o.yaw??0)}));
 const crowd=createArcadeRoomCrowd({scene,mobile,reduced,reactions,cabinets:[cabinets[3],cabinets[1],cabinets[4],cabinets[0],cabinets[2]],bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});
 const people=[...crowd.debugStates,props.attendantBody],body={x:0,z:0};
 let x=start?.x??0,z=start?.z??10.3,vx=0,vz=0,time=0,yaw=Math.PI,target:{x:number;z:number}|null=null,route:{x:number;z:number}[]=[],near:ArcadeCabinetId|null=null,disposed=false,covered=false,leaving=false,frame=0,last=0,slot=0,settle=.7,draws=0,activity=12,cameraX=0,cameraZ=z;
 type Interaction={id:number;action:ArcadeRoomAction;routine:SocialRoutine;phase:'approach'|'play';age:number;elapsed:number;stalled:number;goal:{x:number;z:number};cue:boolean};
 let attentionIdle=0,attentionExpired=false,attentionX=x,attentionZ=z,attentionYaw=yaw;
 let nearbyNpc:number|null=null,solo:{action:ArcadeRoomAction;routine:SocialRoutine;age:number}|null=null;const encounters=new Uint16Array(24);
 let social:Interaction|null=null,lastSocial:{id:number;name:string;result:string}|null=null;const socialPose=createSocialPose();
 const partnerRing=new T.Mesh(new T.RingGeometry(.47,.53,28),new T.MeshBasicMaterial({color:'#edca70',transparent:true,opacity:.8,depthWrite:false}));partnerRing.rotation.x=-Math.PI/2;partnerRing.visible=false;scene.add(partnerRing);
 const partner=()=>social?.id===5?props.attendantBody:crowd.debugStates[social?.id??-1];
 function cancelSocial(result='canceled'){if(!social)return;lastSocial={id:social.id,name:social.routine.name,result};if(social.id===5)props.releaseSocial();else crowd.release(social.id);social=null;partnerRing.visible=false;motion.skill=undefined;motion.jump=undefined;motion.juggle=undefined;motion.juggleTouch=undefined;motion.kickSide=undefined;motion.called=0;motion.lookX=undefined;motion.lookZ=undefined;target=null;route=[];}
 function proximity(){
  let best:number|null=null,distance=Infinity;
  for(let id=0;id<6;id++){const npc=id===5?props.attendantBody:crowd.debugStates[id];if(!npc||(id!==5&&reactions.get(`arcade-visitor-${id}`)))continue;
   const point=id===5?props.interactionPoint:npc,d=Math.hypot(point.x-x,point.z-z),limit=id===5?1.8:nearbyNpc===id?2.9:2.6;
   if(d>limit||d>=distance)continue;const faceX=npc.x-x,faceZ=npc.z-z,faceDistance=Math.hypot(faceX,faceZ);if((Math.sin(yaw)*faceX+Math.cos(yaw)*faceZ)/Math.max(.01,faceDistance)<(nearbyNpc===id?.35:.55))continue;
   let clear=true;for(let t=.25;t<d-(id===5?0:1);t+=.25){const px=x+(point.x-x)*t/d,pz=z+(point.z-z)*t/d;for(const c of cabinets)if(Math.hypot(px-c.x,pz-c.z)<1.3)clear=false;for(const o of obstacles){const wx=px-o.x,wz=pz-o.z;if(Math.abs(wx*o.cos-wz*o.sin)<o.halfX+.2&&Math.abs(wx*o.sin+wz*o.cos)<o.halfZ+.2){clear=false;break;}}if(!clear)break;}
   if(clear){best=id;distance=d;}
  }return best;
 }
 function updateSocialHint(dt:number){
  const moved=Math.hypot(x-attentionX,z-attentionZ)>.025||Math.abs(Math.atan2(Math.sin(yaw-attentionYaw),Math.cos(yaw-attentionYaw)))>.03;
  if(moved||social||ballAction||heldAction||shot.state.mode!=='attached'){attentionIdle=0;attentionExpired=false;attentionX=x;attentionZ=z;attentionYaw=yaw;}
  const candidate=target||ballAction||heldAction||shot.state.mode!=='attached'?null:proximity();
  if(!social&&!attentionExpired&&candidate!==null){attentionIdle=candidate===nearbyNpc?attentionIdle+dt:0;if(attentionIdle>=15)attentionExpired=true;}else if(candidate===null)attentionIdle=0;
  const id=social?.id??(attentionExpired?null:candidate);crowd.focus(id===5?null:id);props.setAttention(id===5);if(id!==nearbyNpc){nearbyNpc=id;onSocialNear?.(id);}if(!social){partnerRing.visible=id!==null;if(id!==null){const npc=id===5?props.attendantBody:crowd.debugStates[id];partnerRing.position.set(npc.x,.09,npc.z);partnerRing.scale.setScalar(1);partnerRing.material.opacity=.28;}}else partnerRing.material.opacity=.75;}
 function floorFree(px:number,pz:number){if(px< -13.7||px>13.7||pz< -10.7||pz>11.1)return false;for(const c of cabinets)if(Math.hypot(px-c.x,pz-c.z)<1.5)return false;for(const o of obstacles){const wx=px-o.x,wz=pz-o.z;if(Math.abs(wx*o.cos-wz*o.sin)<o.halfX+.4&&Math.abs(wx*o.sin+wz*o.cos)<o.halfZ+.4)return false;}for(const person of people)if(Math.hypot(px-person.x,pz-person.z)<.95)return false;return true;}

 const keys=new Set<string>(),stick={x:0,z:0},motion:PlayerMotion={travelMode:'walk'},ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3(),projected=new T.Vector3();let viewportW=1,viewportH=1,viewportLeft=0,viewportTop=0,hovered:ArcadeCabinetId|null=null,promptId:ArcadeCabinetId|null=null,pinnedPrompt:ArcadeCabinetId|null=null,hoverGrace=0;const hoverPoint={x:0,y:0,active:false},frustum=new T.Frustum(),viewProjection=new T.Matrix4();
 player.update(x,z,0,0,reduced,{facing:yaw,resumePose:true});
 function hitCabinet(clientX:number,clientY:number){pointer.set((clientX-viewportLeft)/viewportW*2-1,1-(clientY-viewportTop)/viewportH*2);ray.setFromCamera(pointer,camera);let nearestHit=-1,hitDistance=Infinity;for(let i=0;i<cabinetBounds.length;i++){const hit=ray.ray.intersectBox(cabinetBounds[i],point);if(hit){const d=hit.distanceToSquared(ray.ray.origin);if(d<hitDistance){hitDistance=d;nearestHit=i;}}}return nearestHit;}
 function nearest(){let best:ArcadeCabinetId|null=null,distance=2.3;for(const c of cabinets){const tx=c.x+Math.sin(c.yaw)*1.45,tz=c.z+Math.cos(c.yaw)*1.45,d=Math.hypot(x-tx,z-tz);if(d<distance){distance=d;best=c.id;}}if(best!==near){near=best;}}
 const sparkGeometry=new T.BoxGeometry(.045,.2,.045),sparkMaterial=new T.MeshBasicMaterial({color:'#ffdb82',toneMapped:false}),sparks=new T.InstancedMesh(sparkGeometry,sparkMaterial,16),sparkMatrix=new T.Object3D();sparks.visible=false;sparks.frustumCulled=false;scene.add(sparks);let sparkAge=1,sparkX=0,sparkY=0,sparkZ=0,sparkStrength=1;
 function cabinetImpact(index:number){if(cabinetGlitch[index]>.1)return;cabinetGlitch[index]=.48;cabinetHits++;sparkAge=0;const cabinet=cabinets[index],dx=shot.state.x-cabinet.x,dz=shot.state.z-cabinet.z,d=Math.hypot(dx,dz)||1;sparkX=cabinet.x+dx/d*1.5;sparkY=Math.min(3,Math.max(.55,shot.state.y));sparkZ=cabinet.z+dz/d*1.5;sparkStrength=Math.min(1.5,Math.hypot(shot.state.vx,shot.state.vz)/38);}
 function updateCabinetImpacts(dt:number){for(let i=0;i<cabinetGlitch.length;i++){if(cabinetGlitch[i]<=0)continue;const t=cabinetGlitch[i]=Math.max(0,cabinetGlitch[i]-dt),screen=cabinetScreens[i],pulse=Math.sin((.48-t)*22);screen.material.color.set(t>0?(reduced?'#a8b3c8':pulse>0?'#ff91d8':'#54617c'):'#ffffff');screen.position.x=t>0&&!reduced?Math.sin(t*90)*.025:0;cabinetPools[i].material.opacity=t>0?(reduced?.45:.38+pulse*.14):.38;}
  sparkAge+=dt;sparks.visible=!reduced&&sparkAge<.48;if(!sparks.visible)return;for(let i=0;i<16;i++){const a=i*2.399,t=sparkAge,v=(1+(i%4)*.35)*sparkStrength;sparkMatrix.position.set(sparkX+Math.cos(a)*t*v,Math.max(.1,sparkY+t*(1.3+(i%3)*.45)-5*t*t),sparkZ+Math.sin(a)*t*v);sparkMatrix.rotation.set(a,t*8,a);sparkMatrix.scale.setScalar(Math.max(.01,1-t/.48));sparkMatrix.updateMatrix();sparks.setMatrixAt(i,sparkMatrix.matrix);}sparks.instanceMatrix.needsUpdate=true;
 }
 const ceilingHit={x:0,y:4.8,z:0,nx:0,ny:-1,nz:0,t:0,part:'crossbar' as const};
 const shotEnvironment={floor:()=>0,blocked:(px:number,pz:number,py:number)=>{
  if(Math.abs(px)>14.6||pz< -11.6||pz>12.6)return true;
  if(py<3.5)for(let i=0;i<cabinets.length;i++){const c=cabinets[i];if(Math.hypot(px-c.x,pz-c.z)<1.1){pendingCabinet=i;return true;}}
  if(py<2.6)for(const o of obstacles){const dx=px-o.x,dz=pz-o.z;if(Math.abs(dx*o.cos-dz*o.sin)<o.halfX+.19&&Math.abs(dx*o.sin+dz*o.cos)<o.halfZ+.19)return true;}return false;
 },frame:(from:{x:number;y:number;z:number},to:{x:number;y:number;z:number})=>{if(from.y<=4.8&&to.y>4.8){const t=(4.8-from.y)/(to.y-from.y);ceilingHit.t=t;ceilingHit.x=from.x+(to.x-from.x)*t;ceilingHit.z=from.z+(to.z-from.z)*t;return ceilingHit;}return null;},
 hit:(px:number,py:number,pz:number,bvx:number,bvz:number)=>{if(py>1.95)return false;for(const npc of crowd.debugStates){const id=`arcade-visitor-${npc.id}`;if(!reactions.get(id)&&Math.hypot(px-npc.x,pz-npc.z)<.65){const hit=reactions.hit({id,x:npc.x,y:0,z:npc.z},bvx,bvz);const state=reactions.get(id);if(state)state.distance=0;return hit;}}return false;},impact:(bx:number,by:number,bz:number)=>{ballEffects.impact(bx,by,bz);ballEffectTail=.45;if(pendingCabinet>=0){cabinetImpact(pendingCabinet);pendingCabinet=-1;}sound.ball('bounce');},strike:()=>{sound.ball('kick');ballEffects.launch(shot.state.x,shot.state.y,shot.state.z,shot.state.charge);ballEffectTail=.45;}};
 function syncShotPlayer(){shotPlayer.x=x;shotPlayer.z=z;shotPlayer.yaw=yaw;return shotPlayer;}
 function beginShot(){if(leaving||disposed||covered||shotHeldAt!==null)return;cancelSocial();solo=null;heldAction=null;ballAction=null;sound.unlock();shot.reset(syncShotPlayer());shot.beginCharge(shotPlayer,yaw);shotHeldAt=performance.now();wake();}
 function endShot(cancel=false){if(shotHeldAt===null)return;const power=Math.max(0,Math.min(1,(performance.now()-shotHeldAt-180)/1800));shotHeldAt=null;if(cancel){shot.reset(syncShotPlayer());return;}shot.shoot(syncShotPlayer(),yaw,power);wake();}
 function tick(now:number){frame=0;if(disposed||covered||document.hidden)return;const dt=Math.min(activity>0?.04:.09,last?(now-last)/1000:1/60);const nextSlot=frameCapSlot(now,slot,activity>0?(mobile?1000/30:1000/60):1000/15);if(nextSlot<0){frame=requestAnimationFrame(tick);return;}slot=nextSlot;last=now;time+=dt;activity=Math.max(0,activity-dt);let ix=stick.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),iz=stick.z+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));if(ix||iz){cancelSocial();target=null;route=[];}else if(target){const dx=target.x-x,dz=target.z-z,d=Math.hypot(dx,dz);if(d<.09)target=route.shift()??null;else{ix=dx/d*Math.min(1,d*2);iz=dz/d*Math.min(1,d*2);}}const length=Math.max(1,Math.hypot(ix,iz)),response=1-Math.exp(-dt*14);vx+=(ix/length*4.3-vx)*response;vz+=(iz/length*4.3-vz)*response;const oldX=x,oldZ=z;x=T.MathUtils.clamp(x+vx*dt,-14,14);z=T.MathUtils.clamp(z+vz*dt,-11,12);
 for(const c of cabinets){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d<1.25){const a=Math.atan2(dz||.001,dx);x=c.x+Math.cos(a)*1.25;z=c.z+Math.sin(a)*1.25;}}
 for(const obstacle of obstacles){const wx=x-obstacle.x,wz=z-obstacle.z,dx=wx*obstacle.cos-wz*obstacle.sin,dz=wx*obstacle.sin+wz*obstacle.cos,px=obstacle.halfX+.3-Math.abs(dx),pz=obstacle.halfZ+.3-Math.abs(dz);if(px>0&&pz>0){if(px<pz){const push=Math.sign(dx||1)*px;x+=obstacle.cos*push;z-=obstacle.sin*push;}else{const push=Math.sign(dz||1)*pz;x+=obstacle.sin*push;z+=obstacle.cos*push;}}}
 body.x=x;body.z=z;for(let pass=0;pass<3;pass++)for(const person of people)separateArcadeBody(body,person);x=body.x;z=body.z;
 // Remove blocked velocity; sliding still follows the actual displacement.
 vx=(x-oldX)/dt;vz=(z-oldZ)/dt;
 if(!leaving&&Math.abs(x)<2.1&&z>11.5&&vz>.2){leaving=true;keys.clear();stick.x=stick.z=0;target=null;route=[];vx=vz=0;onExit?.();}
 if(social){
  social.elapsed+=dt;const npc=partner()!,distance=Math.hypot(social.goal.x-x,social.goal.z-z),speed=Math.hypot(vx,vz);
  if(social.phase==='approach'){
   social.stalled=speed<.07?social.stalled+dt:0;
   if(distance<.105){social.phase='play';social.age=-.35;target=null;route=[];vx=vz=0;}
   else if(social.stalled>2.5||social.elapsed>18)cancelSocial('unreachable');
  }else{
   social.age+=dt;if(!social.cue&&social.age>social.routine.contactAt){social.cue=true;sound.social();}
   if(social.age>social.routine.seconds)cancelSocial('complete');
  }
  if(social){const poseAge=social.phase==='play'?social.age:-1;if(social.id===5)props.setSocialAge(poseAge);else crowd.setSocialAge(social.id,poseAge);socialPose(motion,social.routine,poseAge,false,reduced);partnerRing.visible=true;partnerRing.position.set(npc.x,.09,npc.z);const pulse=reduced?1:1+Math.sin(Math.min(1,Math.max(0,social.age-social.routine.contactAt)*3)*Math.PI)*.2;partnerRing.scale.setScalar(pulse);motion.lookX=npc.x;motion.lookZ=npc.z;motion.lookY=1.55;}
 }else if(solo){solo.age+=dt;socialPose(motion,solo.routine,solo.age,false,reduced);if(solo.age>=solo.routine.seconds)solo=null;}else{motion.skill=undefined;motion.jump=undefined;motion.juggle=undefined;motion.juggleTouch=undefined;motion.kickSide=undefined;motion.called=0;}
 if(ballAction){const a=ballAction;a.age+=dt;motion.kick=undefined;motion.skill=undefined;motion.juggle=undefined;motion.juggleTouch=undefined;
  if(a.kind==='shoot'){motion.kick=Math.min(1,a.age/.8);motion.kickSide=1;}
  else if(a.kind==='keepups'){motion.juggle=(a.age%1.05)/1.05;motion.juggleTouch='foot';motion.kickSide=Math.floor(a.age/1.05)%2?1:-1;}
  else{ballSkill.type=a.kind==='rainbow'?'rainbowFlick':'scissors';ballSkill.progress=Math.min(1,a.age/SKILL_MOVES[ballSkill.type].seconds);motion.skill=ballSkill;}
  if(a.age>=a.duration&&heldAction===a.kind){a.age%=a.duration;actionCycles++;}else if(a.age>=a.duration){ballAction=null;motion.kick=undefined;motion.skill=undefined;motion.juggle=undefined;motion.juggleTouch=undefined;}
 }else motion.kick=undefined;
 syncShotPlayer();pendingCabinet=-1;if(shot.state.mode!=='attached')shot.update(dt,shotPlayer,shotEnvironment);
 if(shot.state.mode==='charging'||shot.state.mode==='windup'||shot.state.kick>0){motion.kick=shot.state.kick;motion.shotCharge=shot.state.mode==='charging'?shot.state.charge:undefined;motion.shotPower=shot.state.charge;motion.powerKick=shot.state.mode!=='charging';motion.actionKind='shot';motion.kickSide=1;}else{motion.shotCharge=undefined;motion.powerKick=false;}
 reactions.update(dt,camera,reduced,true);updateCabinetImpacts(dt);
 updateSocialHint(dt);
 const speed=Math.hypot(x-oldX,z-oldZ)/dt;if((keys.size||Math.hypot(stick.x,stick.z)>.08)&&Math.hypot(ix,iz)>.08)yaw=Math.atan2(ix,iz);else if(target&&speed>.08)yaw=Math.atan2(x-oldX,z-oldZ);else if(social){const npc=partner()!;yaw+=Math.atan2(Math.sin(Math.atan2(npc.x-x,npc.z-z)-yaw),Math.cos(Math.atan2(npc.x-x,npc.z-z)-yaw))*(1-Math.exp(-dt*9));}motion.dribbling=shot.state.mode==='attached'&&!ballAction&&(!social||social.phase==='approach');motion.facing=yaw;motion.intentHeading=speed>.08?yaw:undefined;motion.stopDistance=target?Math.hypot(target.x-x,target.z-z):undefined;sound.update(dt,x,z,speed);props.update(dt,time,x,z,reduced);crowd.update(dt,time,x,z);player.setExpression(social||solo?'happy':'neutral');player.update(x,z,dt,time,reduced,motion);updateBall(dt);playerShadow.position.set(x,.085,z);nearest();const follow=reduced?1:1-Math.exp(-dt*5);const halfViewW=(camera.right-camera.left)/2;const desiredX=T.MathUtils.clamp(x,-16.1+halfViewW,16.1-halfViewW),desiredZ=T.MathUtils.clamp(z,-5.8,7.5);cameraX+=(desiredX-cameraX)*follow;cameraZ+=(desiredZ-cameraZ)*follow;camera.position.set(cameraX,14,cameraZ+14);camera.lookAt(cameraX,0,cameraZ-3.5);camera.updateMatrixWorld();const effectActive=shot.state.mode==='shot'||shot.state.mode==='charging';if(effectActive)ballEffectTail=.45;else ballEffectTail=Math.max(0,ballEffectTail-dt);if(effectActive||ballEffectTail>0||ballEffects.root.visible){ballEffects.root.visible=effectActive||ballEffectTail>0;ballEffects.update(dt,ball.position,shot.state.mode==='shot',reduced,camera,shot.state.charge,shot.state.mode==='charging'?shot.state.charge:-1,BALL_COLORS[custom.ball],custom.ball);}viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);for(const item of attract){item.active=frustum.intersectsSphere(item.bound);item.demo.update(dt,time,item.active,reduced);}hoverGrace=Math.max(0,hoverGrace-dt);if(hoverPoint.active){const hit=hitCabinet(hoverPoint.x,hoverPoint.y);hovered=hit>=0?cabinets[hit].id:null;}else if(!pinnedPrompt&&hoverGrace===0)hovered=null;const selected=social?null:pinnedPrompt??hovered??near;if(selected!==promptId){promptId=selected;onNear(promptId);}for(let i=0;i<highlights.length;i++)highlights[i].update(!social&&(cabinets[i].id===near||cabinets[i].id===hovered||cabinets[i].id===pinnedPrompt),dt,reduced);if(promptId){const c=cabinets.find(c=>c.id===promptId)!;projected.set(c.x,3.5,c.z+.5).project(camera);onPrompt?.((projected.x*.5+.5)*viewportW,(-projected.y*.5+.5)*viewportH,Math.abs(projected.x)<.92&&projected.y<.87&&projected.y>-.8);}else onPrompt?.(0,0,false);renderer.render(scene,camera);draws++;if(shot.state.mode!=='attached'||reactions.states.size||ballAction||social||solo||speed>.025||target||keys.size||Math.hypot(stick.x,stick.z)>.02){settle=.55;activity=12;}else settle-=dt;frame=requestAnimationFrame(tick);}
 function myJugglePoint(side:number,out:T.Vector3){return out.set(x+Math.cos(yaw)*side*.108+Math.sin(yaw)*.45,.48,z-Math.sin(yaw)*side*.108+Math.cos(yaw)*.45);}
 function updateBall(dt:number){
  player.dribbleContact(ballAim);ballAim.y=.19;
  const age=social?.phase==='play'?keepUpAge(social.routine,social.age):-1;
  if(social&&age>=0&&social.id!==5){
   if(age<2.1||(age>=2.7&&age<4.8)){const npc=age>=2.7,t=age-(npc?2.7:0),p=(t%1.05)/1.05,side=Math.floor(t/1.05)%2?1:-1,blend=p*p*(3-2*p);if(npc){crowd.jugglePoint(social.id,side,ballFrom);crowd.jugglePoint(social.id,-side,ballTo);}else{myJugglePoint(side,ballFrom);myJugglePoint(-side,ballTo);}ballAim.lerpVectors(ballFrom,ballTo,blend);ballAim.y=.48+4*p*(1-p)*.7;
   }else{const returning=age>=4.8,p=T.MathUtils.clamp((age-(returning?4.8:2.1))/.6,0,1);myJugglePoint(-1,returning?ballTo:ballFrom);crowd.jugglePoint(social.id,-1,returning?ballFrom:ballTo);ballAim.lerpVectors(ballFrom,ballTo,p);ballAim.y=.48+4*p*(1-p)*.65;}
  }else if(social?.phase==='play'){ballAim.set(x+Math.sin(yaw+.7)*.48,.19,z+Math.cos(yaw+.7)*.48);}
  if(ballAction){const a=ballAction;
   if(a.kind==='keepups'){const p=(a.age%1.05)/1.05,side=Math.floor(a.age/1.05)%2?1:-1;myJugglePoint(side,ballFrom);myJugglePoint(-side,ballTo);ballAim.lerpVectors(ballFrom,ballTo,p*p*(3-2*p));ballAim.y=.48+4*p*(1-p)*.7;}
   else if(a.kind==='shoot'){const t=Math.max(0,a.age-.28),out=Math.min(1,t/.48),back=Math.max(0,Math.min(1,(t-.48)/.9)),d=.48+a.range*(t<.48?out:1-back);ballAim.set(x+Math.sin(yaw)*d,.19+Math.sin(Math.PI*(t<.48?out:back))*.24,z+Math.cos(yaw)*d);}
   else{const kind=a.kind==='rainbow'?'rainbowFlick':'scissors',p=Math.min(1,a.age/SKILL_MOVES[kind].seconds);skillBall(kind,p,1,skillLocal);skillFrame(kind,p,1,skillRoot);const bx=skillLocal.x-skillRoot.x,bz=skillLocal.z-skillRoot.z;ballAim.set(x+bx*Math.cos(yaw)+bz*Math.sin(yaw),skillLocal.y,z-bx*Math.sin(yaw)+bz*Math.cos(yaw));}
  }
  if(shot.state.mode!=='attached')ballAim.set(shot.state.x,shot.state.y,shot.state.z);
  const oldX=ball.position.x,oldZ=ball.position.z;if(shot.state.mode!=='attached'){ball.position.copy(ballAim);ballReady=true;}else if(!ballReady){ball.position.copy(ballAim);ballReady=true;}else ball.position.lerp(ballAim,1-Math.exp(-dt*(age>=0||ballAction?35:18)));
  const dx=ball.position.x-oldX,dz=ball.position.z-oldZ,d=Math.hypot(dx,dz);if(d>.0001){rollAxis.set(dz,0,-dx).normalize();ball.rotateOnWorldAxis(rollAxis,d/.19);}ballShadow.position.set(ball.position.x,.086,ball.position.z);ballShadow.scale.setScalar(.2*(1+Math.min(1,ball.position.y)*.18));
 }
 function wake(){activity=12;if(!frame&&!covered&&!document.hidden&&!disposed){settle=.7;activity=12;last=slot=0;frame=requestAnimationFrame(tick);}}
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);viewportW=w;viewportH=h;const rect=canvas.getBoundingClientRect();viewportLeft=rect.left;viewportTop=rect.top;const a=w/Math.max(1,h),halfH=mobile?(a<1?6.7:4.5):7,halfW=halfH*a;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();if(draws===0){cameraX=T.MathUtils.clamp(x,-16.1+halfW,16.1-halfW);cameraZ=T.MathUtils.clamp(z,-5.8,7.5);}wake();}
 function clear(){heldAction=null;ballEffectTail=0;ballEffects.root.visible=false;ballEffects.update(0,ball.position,false,reduced,camera);endShot(true);shot.reset(syncShotPlayer());ballAction=null;motion.kick=undefined;cancelSocial();solo=null;keys.clear();stick.x=stick.z=0;target=null;route=[];vx=vz=0;wake();}
 function action(kind:ArcadeRoomAction){
  if(leaving||disposed||covered||social?.action===kind)return;sound.unlock();cancelSocial();heldAction=null;
  if(kind==='shoot'){beginShot();endShot();return;}
  endShot(true);shot.reset(syncShotPlayer());
  if(kind==='rainbow'||kind==='keepups'||kind==='scissors'){
   solo=null;actionCycles=0;const range=0;
   ballAction={kind,age:0,duration:kind==='keepups'?4.2:SKILL_MOVES[kind==='rainbow'?'rainbowFlick':'scissors'].seconds,range};wake();return;
  }
  ballAction=null;keys.clear();stick.x=stick.z=0;target=null;route=[];vx=vz=0;
  const id=proximity();if(id===null){solo={action:kind,routine:soloRoutine(kind),age:0};wake();return;}solo=null;
  const countIndex=id*4+(['jump','wave','applaud','celebrate'] as const).indexOf(kind);
  const npc=id===5?props.attendantBody:crowd.debugStates[id],routine=socialRoutine(id,kind,id===5,encounters[countIndex]),angle=Math.atan2(z-npc.z,x-npc.x);
  let path:{x:number;z:number}[]|null=null,goal:{x:number;z:number}={x:props.interactionPoint.x,z:props.interactionPoint.z};
  if(id===5)path=socialPath({x,z},goal,floorFree);else for(let i=0;i<16&&!path;i++){const a=angle+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/8;const spacing=routine.beats.includes('keepUps')?2.15:1.15;goal={x:npc.x+Math.cos(a)*spacing,z:npc.z+Math.sin(a)*spacing};path=socialPath({x,z},goal,floorFree);}
  if(!path){lastSocial={id,name:routine.name,result:'unreachable'};return;}
  encounters[countIndex]++;if(id===5)props.beginSocial(routine);else crowd.reserve(id,routine);social={id,action:kind,routine,phase:'approach',age:-1,elapsed:0,stalled:0,goal,cue:false};route=path;target=route.shift()??goal;wake();
 }

 function beginAction(kind:ArcadeRoomAction){if(kind==='wave'||kind==='jump'||kind==='applaud'||kind==='celebrate'){action(kind);return;}if(kind==='shoot'){beginShot();return;}if(leaving||disposed||covered)return;action(kind);heldAction=kind;}
 function endAction(kind:ArcadeRoomAction,cancel=false){if(kind==='wave'||kind==='jump'||kind==='applaud'||kind==='celebrate')return;if(kind==='shoot'){endShot(cancel);return;}if(heldAction!==kind)return;heldAction=null;if(cancel&&ballAction?.kind===kind)ballAction=null;}
 function key(e:KeyboardEvent){if(leaving)return;if(e.code==='Space'&&!(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea'))){e.preventDefault();if(e.type==='keydown'&&!e.repeat){if(nearbyNpc!==null)action('jump');else beginShot();}else if(e.type==='keyup')endShot();return;}if((e.code==='Space'||e.code==='KeyQ'||e.code==='KeyF'||e.code==='KeyC')&&!(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea'))){e.preventDefault();const kind=e.code==='KeyQ'?'keepups':e.code==='KeyF'?'rainbow':'scissors';if(e.type==='keydown'&&!e.repeat){if(nearbyNpc!==null)action(kind==='keepups'?'wave':kind==='rainbow'?'applaud':'celebrate');else beginAction(kind);}else if(e.type==='keyup')endAction(kind);return;}if(!/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code)||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;e.preventDefault();if(e.type==='keydown'){sound.unlock();keys.add(e.code);}else keys.delete(e.code);wake();}
 function visibility(){clear();if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();}
 const hover=(event:PointerEvent)=>{if(event.pointerType==='touch')return;hoverPoint.x=event.clientX;hoverPoint.y=event.clientY;hoverPoint.active=true;wake();},unhover=()=>{hoverPoint.active=false;hoverGrace=.22;wake();};canvas.addEventListener('pointermove',hover);canvas.addEventListener('pointerleave',unhover);
 const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',visibility);resize();
 return {setCovered(value:boolean){covered=value;if(value){clear();cancelAnimationFrame(frame);frame=0;}else{last=0;wake();}},clearInput:clear,action,beginShot,endShot,beginAction,endAction,holdPrompt:(id:ArcadeCabinetId|null)=>{pinnedPrompt=id;if(!id){hovered=null;hoverGrace=0;}wake();},setMuted:(value:boolean)=>sound.setMuted(value),get state(){return{x,z,yaw,heldAction,actionCycles,attentionIdle,attentionExpired,ballAction:shot.state.mode!=='attached'?'shoot':ballAction?.kind??null,shot:{...shot.state},ballTrail:ballEffects.root.visible&&ballEffects.root.children.some(o=>o instanceof T.Line&&o.visible),cabinetHits,sparks:sparks.visible,knocked:reactions.states.size,ball:{x:ball.position.x,y:ball.position.y,z:ball.position.z,dribbling:motion.dribbling,keepUp:social?keepUpAge(social.routine,social.age):-1},near,hovered,nearbyNpc,partnerRing:{visible:partnerRing.visible,opacity:partnerRing.material.opacity},solo:solo?.action??null,social:social?{id:social.id,action:social.action,name:social.routine.name,phase:social.phase,age:social.age,contactAt:social.routine.contactAt,goal:social.goal}:null,lastSocial,props:props.debug,attract:attract.map(item=>({id:item.id,active:item.active,frames:item.demo.frames})),render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},sound:sound.debug,crowd:crowd.debugStates,sleeping:frame===0,moving:!!target||Math.hypot(vx,vz)>.03,cadence:activity>0?(mobile?30:60):15,draws};},walkTo(id:ArcadeCabinetId){if(leaving)return;cancelSocial();sound.unlock();const c=cabinets.find(c=>c.id===id)!;const dest={x:c.x+Math.sin(c.yaw)*1.8,z:c.z+Math.cos(c.yaw)*1.8};route=[{x:0,z:dest.z},dest];target={x:0,z};wake();},setStick(a:number,b:number){if(leaving)return;if(a||b)sound.unlock();stick.x=a;stick.z=b;wake();},pick(clientX:number,clientY:number){if(leaving)return;cancelSocial();sound.unlock();const nearestHit=hitCabinet(clientX,clientY);if(nearestHit>=0){this.walkTo(cabinets[nearestHit].id);return;}if(ray.ray.intersectPlane(plane,point)){route=[];target={x:T.MathUtils.clamp(point.x,-13.8,13.8),z:T.MathUtils.clamp(point.z,-10.8,11.8)};wake();}},dispose(){cancelSocial();ballEffects.dispose();reactions.dispose();sound.dispose();disposed=true;cancelAnimationFrame(frame);frame=0;observer.disconnect();canvas.removeEventListener('pointermove',hover);canvas.removeEventListener('pointerleave',unhover);highlights.forEach(effect=>effect.dispose());attract.forEach(item=>item.demo.dispose());window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',visibility);props.dispose();crowd.dispose();player.dispose();const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
