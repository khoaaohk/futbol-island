import * as T from 'three';
import {createArcadeStage} from './arcadeStage';
import {createPlayer,type PlayerMotion,type PlayerRig} from '../graphics/player';
import {DEFAULT_CUSTOMIZATION} from '../town/customization';
import {matchPlayerDress} from '../town/beanLooks';
import type {Scenario,PuzzleState,Prediction,Vec2,PuzzleEvent} from '../passPuzzle/types';

/**
 * Pass Puzzles scene: a broadcast view from behind the attack on a sand-framed island pitch.
 * All meshes are built once per level (rigs are pooled across levels). Nothing here owns a
 * render loop: the game component calls update()/render() only while something moves.
 */
export type AimView={prediction:Prediction|null;receiver?:number;loft:number;stroke:Vec2[]};
type Actor={tag:T.Sprite|null;rig:PlayerRig;motion:PlayerMotion;reactionLeft:number;reactionTotal:number;receiveLeft:number;kickLeft:number;called:number;callWave:number;dejected:boolean};
const REACTION_SECONDS={chest:.62,thigh:.55,header:.5,stumble:.8,deflect:.55,slide:.75,dejected:1.3} as const;
const PATH_DOTS=72,THREAT_RINGS=8,RIG_SCALE=1.3,BALL_R=.21,Y_SCALE=RIG_SCALE*.9;/* heights read against the scaled rigs */
const crossbar=(goalWidth:number)=>goalWidth>=7?2.44:goalWidth>=6?2.13:1.98;


/**
 * Classic position numbers from where each player stands, so the pitch teaches numbering (1 keeper,
 * 2/3 full-backs, 4/5 centre-backs, 6/8 midfield, 10 playmaker, 7/11 wingers, 9 striker).
 * Attackers face +z, defenders face −z, so "right" flips between the teams. Pure and deterministic:
 * briefs and hints can use the same numbers ("find your 9").
 */
export function shirtNumbersFor(s:Scenario){
 const hw=s.pitch.halfWidth,half=s.pitch.length/2,wideAt=Math.max(7,hw*.4);
 // gap = metres from the goal this team attacks (attackers) or guards (defenders).
 const assign=(list:{x:number;z:number}[],gap:(p:{x:number;z:number})=>number,rightIsNegX:boolean,attack:boolean)=>{
  const out=new Array<number>(list.length).fill(0),used=new Set<number>();
  const take=(i:number,prefs:number[])=>{const n=[...prefs,9,10,7,11,8,6,4,5,2,3,14,15,16,17,18,19,20].find(v=>!used.has(v))!;used.add(n);out[i]=n;};
  // Attackers: most advanced first (the striker earns the 9). Defenders: deepest first (centre-backs 4/5).
  const order=list.map((_,i)=>i).sort((a,b)=>attack?gap(list[a])-gap(list[b]):gap(list[a])-gap(list[b]));
  for(const i of order){const p=list[i],g=gap(p),wide=Math.abs(p.x)>wideAt,right=rightIsNegX?p.x<0:p.x>0,wing=right?[7,11]:[11,7],back=right?[2,3]:[3,2];
   if(attack&&g>s.pitch.length-7&&Math.abs(p.x)<9){take(i,[1]);continue;}
   const zone=attack?(g<16.5?2:g<27?1:0):(g<18?0:g<30?1:2);
   if(zone===2)take(i,wide?wing:[9,10]);else if(zone===1)take(i,wide?wing:attack?[10,8,6]:[6,8,10]);else take(i,wide?back:[5,4,6]);}
  return out;};
 return{attackers:assign(s.attackers,p=>half-p.z,true,true),defenders:assign(s.defenders,p=>half-p.z,false,false),keeper:1};
}

export function createPassPuzzleScene(canvas:HTMLCanvasElement){
 const stage=createArcadeStage(canvas),{scene,camera}=stage;stage.scenery.visible=false;
 // The stage ground is a sand plate; this pitch sits on it like the island fields.
 let pitch=new T.Group();scene.add(pitch);
 const pool:{attack:PlayerRig[];defend:PlayerRig[];keeper:PlayerRig|null}={attack:[],defend:[],keeper:null};
 let lastDive=0,attackers:Actor[]=[],defenders:Actor[]=[],keeper:Actor|null=null,scenario:Scenario|null=null,elapsed=0;
 const newActor=(rig:PlayerRig):Actor=>({tag:null,rig,motion:{},reactionLeft:0,reactionTotal:1,receiveLeft:0,kickLeft:0,called:0,callWave:0,dejected:false});
 function rigFor(kind:'attack'|'defend'|'keeper',index:number){
  if(kind==='keeper'){if(!pool.keeper){pool.keeper=createPlayer('pp-keeper','away');pool.keeper.setAppearance({...DEFAULT_CUSTOMIZATION,clothing:'sunset',face:'deep'});const dress=matchPlayerDress('pp-keeper','away',true,1);pool.keeper.setBeanLook(dress.look,dress.outfit);}return pool.keeper;}
  const list=pool[kind];
  while(list.length<=index){const i=list.length,rig=createPlayer(`pp-${kind}-${i}`,kind==='attack'?'home':'away');rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:i%3===1?'female':'male',face:(['warm','light','deep'] as const)[i%3],clothing:kind==='attack'?'classic':'coast'});const dress=matchPlayerDress(`pp-${kind}-${i}`,kind==='attack'?'home':'away',false);rig.setBeanLook(dress.look,dress.outfit);list.push(rig);}
  return list[index];
 }


 // Number tags above heads while aiming: the back numbers are too small from a match camera, and
 // "find your 9" only teaches if the 9 is readable. One cached 64px texture per team+number.
 const tagTextures=new Map<string,T.CanvasTexture>(),tagMaterials=new Map<string,T.SpriteMaterial>();let tagsVisible=false;
 function tagMaterial(n:number,team:'attack'|'defend'|'keeper'){const key=team+n;let m=tagMaterials.get(key);if(m)return m;
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;g.beginPath();g.arc(32,32,27,0,Math.PI*2);g.fillStyle=team==='attack'?'#efc776':team==='keeper'?'#c8734f':'#356478';g.fill();g.lineWidth=5;g.strokeStyle='#fff3d9';g.stroke();
  g.fillStyle=team==='attack'?'#244b43':'#fff3d9';g.font='700 30px system-ui,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),32,34);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;tagTextures.set(key,t);m=new T.SpriteMaterial({map:t,depthWrite:false,transparent:true,toneMapped:false,fog:false,sizeAttenuation:false});tagMaterials.set(key,m);return m;}
 function setTag(a:Actor,n:number,team:'attack'|'defend'|'keeper'){if(!a.tag){a.tag=new T.Sprite();a.tag.renderOrder=6;a.tag.scale.setScalar(.023);}a.tag.material=tagMaterial(n,team);scene.add(a.tag);}

 // Aim graphics: one instanced dot trail + its ground shadow, pooled rings, one stroke line.
 const dotGeo=new T.SphereGeometry(1,8,6),dotMat=new T.MeshBasicMaterial({color:'#ffe36e'}),dots=new T.InstancedMesh(dotGeo,dotMat,PATH_DOTS);dots.frustumCulled=false;dots.instanceMatrix.setUsage(T.DynamicDrawUsage);dots.renderOrder=4;scene.add(dots);
 const shadowGeo=new T.CircleGeometry(1,12),shadowMat=new T.MeshBasicMaterial({color:'#1d3f36',transparent:true,opacity:.28,depthWrite:false}),shadows=new T.InstancedMesh(shadowGeo,shadowMat,PATH_DOTS);shadows.frustumCulled=false;shadows.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(shadows);
 const dummy=new T.Object3D();
 function hideDots(){dummy.scale.setScalar(0);dummy.updateMatrix();for(let i=0;i<PATH_DOTS;i++){dots.setMatrixAt(i,dummy.matrix);shadows.setMatrixAt(i,dummy.matrix);}dots.instanceMatrix.needsUpdate=shadows.instanceMatrix.needsUpdate=true;}
 hideDots();
 const flatRing=(inner:number,outer:number,color:string,opacity=1)=>{const m=new T.Mesh(new T.RingGeometry(inner,outer,40),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:opacity<1,opacity,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;m.visible=false;scene.add(m);return m;};
 const threats=Array.from({length:THREAT_RINGS},()=>flatRing(.78,.98,'#e8604c'));
 const keeperThreat=flatRing(.9,1.12,'#e8604c');
 const receiverRing=flatRing(.72,.9,'#fff3d2');
 const carrierRing=flatRing(.55,.68,'#ffe36e');
 const endGoal=flatRing(.45,.75,'#ffe36e'),endRest=flatRing(.35,.55,'#fff3d2'),endOut=new T.Group();
 for(const a of [1,-1]){const bar=new T.Mesh(new T.BoxGeometry(1.1,.04,.2),new T.MeshBasicMaterial({color:'#e8604c'}));bar.rotation.y=a*Math.PI/4;endOut.add(bar);}endOut.visible=false;scene.add(endOut);
 const zoneRing=flatRing(.94,1,'#fff3d2',.8);
 const strokeGeo=new T.BufferGeometry(),strokePositions=new Float32Array(256*3);strokeGeo.setAttribute('position',new T.BufferAttribute(strokePositions,3));strokeGeo.setDrawRange(0,0);
 const strokeLine=new T.Line(strokeGeo,new T.LineBasicMaterial({color:'#fff3d2',transparent:true,opacity:.55,depthWrite:false}));strokeLine.frustumCulled=false;scene.add(strokeLine);

 const ball=stage.football(BALL_R),ballShadow=new T.Mesh(new T.CircleGeometry(.24,16),new T.MeshBasicMaterial({color:'#193e37',transparent:true,opacity:.35,depthWrite:false}));ballShadow.rotation.x=-Math.PI/2;scene.add(ballShadow);
 let net:{attribute:T.BufferAttribute;rest:Float32Array;hit:number;x:number}|null=null;

 function buildPitch(s:Scenario){
  scene.remove(pitch);pitch.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments)o.geometry.dispose();});pitch=new T.Group();scene.add(pitch);
  const {halfWidth:hw,length:L,goalWidth:gw}=s.pitch,line='#fff1d5',half=L/2;
  const base=new T.Mesh(new T.PlaneGeometry(hw*2+6,L+10),new T.MeshStandardMaterial({color:'#427f6c',roughness:1}));base.rotation.x=-Math.PI/2;base.position.set(0,.004,1);base.receiveShadow=true;pitch.add(base);
  const stripes=Math.max(4,Math.round(L/5)),stripeMats=['#478673','#4d8e77'].map(color=>new T.MeshStandardMaterial({color,roughness:1}));
  for(let i=0;i<stripes;i++){const m=new T.Mesh(new T.PlaneGeometry(hw*2,L/stripes),stripeMats[i%2]);m.rotation.x=-Math.PI/2;m.position.set(0,.008,-half+(i+.5)*L/stripes);m.receiveShadow=true;pitch.add(m);}
  const paint=(x1:number,z1:number,x2:number,z2:number)=>{const m=new T.Mesh(new T.PlaneGeometry(Math.max(.1,Math.abs(x2-x1)),Math.max(.1,Math.abs(z2-z1))),new T.MeshBasicMaterial({color:line}));m.rotation.x=-Math.PI/2;m.position.set((x1+x2)/2,.014,(z1+z2)/2);pitch.add(m);};
  paint(-hw,half,hw,half);paint(-hw,-half,-hw,half);paint(hw,-half,hw,half);
  const boxDepth=Math.min(16.5,L*.36),boxHalf=Math.min(hw-.5,gw/2+11),six=Math.min(5.5,boxDepth*.35),sixHalf=gw/2+Math.min(5.5,boxHalf-gw/2-1);
  paint(-boxHalf,half-boxDepth,boxHalf,half-boxDepth);paint(-boxHalf,half-boxDepth,-boxHalf,half);paint(boxHalf,half-boxDepth,boxHalf,half);
  paint(-sixHalf,half-six,sixHalf,half-six);paint(-sixHalf,half-six,-sixHalf,half);paint(sixHalf,half-six,sixHalf,half);
  const spot=new T.Mesh(new T.CircleGeometry(.14,12),new T.MeshBasicMaterial({color:line}));spot.rotation.x=-Math.PI/2;spot.position.set(0,.015,half-Math.min(11,boxDepth*.66));pitch.add(spot);
  if(L>=40)paint(-hw,-half+.05,hw,-half+.05);
  // Boards frame the play area like the island's Strikers court (low, so they never hide a player).
  const boards=new T.Group();pitch.add(boards);for(const side of [-1,1]){const b=new T.Mesh(new T.BoxGeometry(.3,.5,L+6),new T.MeshStandardMaterial({color:'#f1ce83',roughness:.8}));b.position.set(side*(hw+2.6),.25,1);b.castShadow=true;boards.add(b);}
  const back=new T.Mesh(new T.BoxGeometry(hw*2+5.5,.6,.3),new T.MeshStandardMaterial({color:'#bd7e69',roughness:.8}));back.position.set(0,.3,half+4.2);pitch.add(back);
  const goal=stage.goal(0,half,gw);scene.remove(goal);pitch.add(goal);goal.rotation.y=Math.PI;goal.scale.y=crossbar(gw)/2.1*Y_SCALE;
  const netLines=goal.children.find(c=>c instanceof T.LineSegments) as T.LineSegments|undefined;
  if(netLines){const attribute=netLines.geometry.getAttribute('position') as T.BufferAttribute;net={attribute,rest:new Float32Array(attribute.array),hit:0,x:0};}
  if(s.require.finish==='reach-zone'&&s.require.zone){const z=s.require.zone;zoneRing.visible=true;zoneRing.position.set(z.x,.03,z.z);zoneRing.scale.setScalar(z.r);}else zoneRing.visible=false;
 }

 function load(s:Scenario){
  scenario=s;elapsed=0;buildPitch(s);
  for(const rig of [...pool.attack,...pool.defend,...(pool.keeper?[pool.keeper]:[])])rig.root.removeFromParent();
  attackers=s.attackers.map((_,i)=>newActor(rigFor('attack',i)));defenders=s.defenders.map((_,i)=>newActor(rigFor('defend',i)));keeper=s.keeper?newActor(rigFor('keeper',0)):null;
  for(const t of scene.children.filter(o=>o instanceof T.Sprite))scene.remove(t);
  const numbers=shirtNumbersFor(s);attackers.forEach((a,i)=>{a.rig.setShirtNumber(numbers.attackers[i]);setTag(a,numbers.attackers[i],'attack');});defenders.forEach((a,i)=>{a.rig.setShirtNumber(numbers.defenders[i]);setTag(a,numbers.defenders[i],'defend');});if(keeper){keeper.rig.setShirtNumber(numbers.keeper);setTag(keeper,numbers.keeper,'keeper');}
  for(const a of [...attackers,...defenders,...(keeper?[keeper]:[])]){scene.add(a.rig.root);a.rig.root.rotation.set(0,0,0);a.rig.root.scale.setScalar(RIG_SCALE*a.rig.profileScale);a.motion={resumePose:true};}
  keeper&&(keeper.motion.keeper=1);
  fit();
 }

 // Broadcast camera behind the attack: fixed pitch angle, distance solved on load/resize only.
 const base={pos:new T.Vector3(),target:new T.Vector3()},focus=new T.Vector3(),corner=new T.Vector3();let replayFocus:T.Vector3|null=null,replayAmount=0;
 function fit(){
  const w=canvas.clientWidth,h=canvas.clientHeight;stage.renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/Math.max(1,h);camera.zoom=1;camera.updateProjectionMatrix();
  if(!scenario)return;
  const s=scenario,half=s.pitch.length/2,portrait=camera.aspect<.8,tilt=portrait?.8:.74,bar=crossbar(s.pitch.goalWidth)*Y_SCALE;
  // Everything the child must read: players, their scripted runs, the goal mouth (and a target zone).
  const pts:[number,number,number][]=[];const add=(x:number,z:number,y=0)=>pts.push([x,y,z]);
  for(const p of [...s.attackers,...s.defenders,...(s.keeper?[s.keeper]:[])]){add(p.x,p.z);add(p.x,p.z,2.3);}
  for(const a of s.attackers)for(const p of a.run?.path??[])add(p.x,p.z);
  if(s.require.finish==='goal')for(const x of [-s.pitch.goalWidth/2-1,s.pitch.goalWidth/2+1]){add(x,half);add(x,half,bar);add(x,half+1.2);}
  if(s.require.zone){const z=s.require.zone;add(z.x-z.r,z.z-z.r);add(z.x+z.r,z.z+z.r);}
  // Broadcast view from behind the ball carrier, turned toward the action: a wide crosser gets a
  // camera out on the wing looking in, so the play runs up a portrait screen instead of across it.
  // The play's long axis (principal axis of the points) runs up a portrait screen and across a wide one.
  let mx=0,mz=0,n=0;for(const p of pts)if(p[1]===0){mx+=p[0];mz+=p[2];n++;}mx/=n;mz/=n;let sxx=0,szz=0,sxz=0;for(const p of pts)if(p[1]===0){const x=p[0]-mx,z=p[2]-mz;sxx+=x*x;szz+=z*z;sxz+=x*z;}
  const axis=.5*Math.atan2(2*sxz,sxx-szz),wrap=(a:number)=>{while(a>Math.PI/2)a-=Math.PI;while(a<-Math.PI/2)a+=Math.PI;return a;};
  const along=wrap(Math.PI/2-axis),across=wrap(-axis),limit=portrait?(s.require.finish==='goal'?1.05:1.45):.32,heading=Math.max(-limit,Math.min(limit,portrait?along:across*.6));
  let cx=0,cz=0;for(const p of pts){cx+=p[0];cz+=p[2];}cx/=pts.length;cz/=pts.length;base.target.set(cx,0,cz);
  const dx=Math.sin(heading),dz=Math.cos(heading);
  const top=portrait?140:118,bottom=portrait?128:100,roomY=Math.max(.3,(h-top-bottom)/h),roomX=portrait?.8:.82;
  const place=(d:number)=>{camera.position.set(cx-dx*Math.cos(tilt)*d,Math.sin(tilt)*d,cz-dz*Math.cos(tilt)*d);camera.lookAt(base.target);camera.updateMatrixWorld();};
  const extent=()=>{let x0=1,x1=-1,y0=1,y1=-1;for(const p of pts){corner.set(p[0],p[1],p[2]).project(camera);x0=Math.min(x0,corner.x);x1=Math.max(x1,corner.x);y0=Math.min(y0,corner.y);y1=Math.max(y1,corner.y);}return{x0,x1,y0,y1};};
  let low=4,high=240;
  for(let i=0;i<24;i++){const d=(low+high)/2;place(d);const e=extent();if(e.x1-e.x0<=roomX*2&&e.y1-e.y0<=roomY*2)high=d;else low=d;}
  place(high);base.pos.copy(camera.position);const e=extent();
  // Centre the action in the room between the HUD and the tip (off-centre projection, no second viewport).
  camera.setViewOffset(w,h,(e.x0+e.x1)/2*w/2,(bottom-top)/2-(e.y0+e.y1)/2*h/2,w,h);camera.far=high+140;camera.updateProjectionMatrix();
  const fog=scene.fog as T.Fog;fog.near=high+30;fog.far=high+110;
 }
 /** Replay camera: ease toward the key moment, a gentle push-in. amount 0..1. */
 const look=new T.Vector3(),push=new T.Vector3();
 function setReplayFocus(point:Vec2|null,amount=0){replayFocus=point?focus.set(point.x,0,point.z):null;replayAmount=replayFocus?amount:0;const t=replayAmount;
  camera.position.copy(base.pos);look.copy(base.target);
  if(replayFocus){look.lerp(replayFocus,t*.7);push.copy(base.pos).sub(base.target).multiplyScalar(.62).add(replayFocus);camera.position.lerp(push,t*.55);}
  camera.lookAt(look);const zoom=1+t*.18;if(camera.zoom!==zoom){camera.zoom=zoom;camera.updateProjectionMatrix();}
 }

 // Quadratic midpoint interpolation softens sparse pointer samples without changing
 // the engine's raw gesture. Reuse one fixed GPU buffer, including the exact tip.
 function setStroke(points:Vec2[]){
  let count=0;const put=(x:number,z:number)=>{strokePositions[count*3]=x;strokePositions[count*3+1]=.06;strokePositions[count*3+2]=z;count++;};
  if(points.length){put(points[0].x,points[0].z);for(let i=1;i<points.length-1&&count<253;i++){
   const a=points[i-1],b=points[i],c=points[i+1],sx=i===1?a.x:(a.x+b.x)/2,sz=i===1?a.z:(a.z+b.z)/2,ex=(b.x+c.x)/2,ez=(b.z+c.z)/2;
   for(let j=1;j<=2;j++){const t=j/2,u=1-t;put(u*u*sx+2*u*t*b.x+t*t*ex,u*u*sz+2*u*t*b.z+t*t*ez);}
  }const end=points[points.length-1];if(points.length>1)put(end.x,end.z);}
  strokeGeo.attributes.position.needsUpdate=true;strokeGeo.setDrawRange(0,count);
 }
 function setAim(view:AimView|null,state:PuzzleState){
  const p=view?.prediction;hideDots();for(const r of threats)r.visible=false;keeperThreat.visible=receiverRing.visible=endGoal.visible=endRest.visible=endOut.visible=false;
  const carrier=state.attackers[state.carrier];carrierRing.visible=state.phase==='aiming';if(carrier)carrierRing.position.set(carrier.p.x,.035,carrier.p.z);
  setStroke(view?.stroke??[]);
  for(const a of attackers)a.called=0;
  if(!view||!p){return;}
  // Dotted, fading path: every other sample, shrinking and thinning toward the end.
  const step=Math.max(1,Math.ceil(p.path.length/PATH_DOTS)),count=Math.min(PATH_DOTS,Math.ceil(p.path.length/step));
  for(let i=0;i<count;i++){const q=p.path[i*step],fade=1-i/Math.max(1,count)*.72,r=.085*fade+.025;dummy.position.set(q.x,Math.max(.1,q.y*Y_SCALE),q.z);dummy.scale.setScalar(i%2?0:r*1.45);dummy.updateMatrix();dots.setMatrixAt(i,dummy.matrix);
   dummy.position.set(q.x,.02,q.z);dummy.rotation.x=-Math.PI/2;dummy.scale.setScalar(q.y>.4&&i%2===0?r*1.2:0);dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);dummy.rotation.x=0;}
  dots.instanceMatrix.needsUpdate=shadows.instanceMatrix.needsUpdate=true;
  const end=p.receiveAt??p.path[p.path.length-1];
  if(end){if(p.end==='goal'){endGoal.visible=true;endGoal.position.set(end.x,.04,Math.min(end.z,(scenario?.pitch.length??0)/2-.3));}else if(p.end==='out'){endOut.visible=true;endOut.position.set(end.x,.05,end.z);}else if(p.end==='rest'&&p.receiver===undefined){endRest.visible=true;endRest.position.set(end.x,.04,end.z);}}
  p.threats.forEach((d,i)=>{const s=state.defenders[d];if(!s||i>=threats.length)return;const r=threats[i];r.visible=true;r.position.set(s.p.x,.04,s.p.z);});
  if(p.keeperThreat&&state.keeper){keeperThreat.visible=true;keeperThreat.position.set(state.keeper.p.x,.04,state.keeper.p.z);}
  const receiver=p.receiver??view.receiver;
  if(receiver!==undefined&&state.attackers[receiver]){const r=state.attackers[receiver];receiverRing.visible=true;receiverRing.position.set(r.p.x,.035,r.p.z);if(attackers[receiver])attackers[receiver].called=1;}
 }

 function resetActors(){for(const a of [...attackers,...defenders,...(keeper?[keeper]:[])]){a.reactionLeft=a.receiveLeft=a.kickLeft=0;a.dejected=false;a.motion.reaction=undefined;a.motion.reactionProgress=undefined;a.motion.kick=undefined;a.motion.resumePose=true;a.rig.root.rotation.z=0;}}
 function react(actor:Actor|undefined,kind:NonNullable<PlayerMotion['reaction']>,squash=0){if(!actor)return;actor.motion.reaction=kind;actor.reactionTotal=actor.reactionLeft=REACTION_SECONDS[kind];if(squash){actor.motion.squash=squash;actor.motion.squashSerial=(actor.motion.squashSerial??0)+1;}}
 /** Event → action layer: every touch type looks different. */
 function onEvent(e:PuzzleEvent){
  const att=e.attacker!==undefined?attackers[e.attacker]:undefined,def=e.defender!==undefined?defenders[e.defender]:undefined;
  switch(e.type){
   case 'kick':if(att){att.kickLeft=.34;att.motion.squash=e.kind==='header'?3.2:2.4;att.motion.squashSerial=(att.motion.squashSerial??0)+1;if(e.kind==='header')react(att,'header');}break;
   case 'receive':if(att){if(e.touch==='chest')react(att,'chest',-2.6);else if(e.touch==='thigh')react(att,'thigh',-2.2);else if(e.touch==='header')react(att,'header',2.8);else{att.receiveLeft=.45;att.motion.squash=-1.8;att.motion.squashSerial=(att.motion.squashSerial??0)+1;}}break;
   case 'heavy_touch':react(att,'stumble',-3);break;
   case 'intercept':react(def,(e.speed??0)>9?'slide':'deflect',-2.2);break;
   case 'deflect':react(def,'deflect',-2);break;
   case 'save':case 'parry':if(keeper){keeper.motion.squash=-2.4;keeper.motion.squashSerial=(keeper.motion.squashSerial??0)+1;}break;
   case 'goal':for(const d of defenders){react(d,'dejected');d.dejected=true;}if(keeper){react(keeper,'dejected');}if(net&&!stage.reduced){net.hit=1;net.x=e.at.x;}stage.burst(e.at.x,1,e.at.z,2);break;
   case 'out':break;
  }
 }

 const ballTarget=new T.Vector3();
 /** Advance visuals by dt (0 = re-pose only). Returns true while an animation still needs frames. */
 function update(state:PuzzleState,dt:number):boolean{
  elapsed+=dt;let busy=false;tagsVisible=state.phase==='aiming';const reduced=stage.reduced,ballP=state.ball.p;
  const pose=(a:Actor,s:{p:Vec2;facing:number},extra:(m:PlayerMotion)=>void)=>{
   const m=a.motion;m.facing=s.facing;m.lookX=ballP.x;m.lookZ=ballP.z;m.lookY=ballP.y;
   if(a.reactionLeft>0){a.reactionLeft=Math.max(0,a.reactionLeft-dt);m.reactionProgress=1-a.reactionLeft/a.reactionTotal;busy=true;if(a.reactionLeft===0&&!a.dejected){m.reaction=undefined;m.reactionProgress=undefined;}}
   if(a.receiveLeft>0){a.receiveLeft=Math.max(0,a.receiveLeft-dt);m.receive=a.receiveLeft>0?1:0;m.receiveProgress=1-a.receiveLeft/.45;busy=true;}else{m.receive=undefined;m.receiveProgress=undefined;}
   // The rig eases and waves the call itself; keep frames for a short wave after it changes, then sleep.
   if((m.called??0)!==a.called){m.called=a.called||undefined;a.callWave=1.4;}if(a.callWave>0){a.callWave=Math.max(0,a.callWave-dt);busy=true;}
   extra(m);a.rig.update(s.p.x,s.p.z,dt,elapsed,reduced,m);m.resumePose=undefined;if(a.tag){a.tag.visible=tagsVisible;a.tag.position.set(s.p.x,2.85,s.p.z);}
  };
  state.attackers.forEach((s,i)=>{const a=attackers[i];if(!a)return;pose(a,s,m=>{
   const pending=state.pending&&state.pending.kicker===i?state.pending:null;
   if(pending){const k=pending.kick;m.actionKind=k.kind==='shot'?'shot':k.loft>.35?'loft':'pass';m.facing=Math.atan2(k.target.x-s.p.x,k.target.z-s.p.z);m.kick=(1-pending.left/Math.max(.001,pending.total))*.5;busy=true;}
   else if(a.kickLeft>0){a.kickLeft=Math.max(0,a.kickLeft-dt);m.kick=a.kickLeft>0?.5+(1-a.kickLeft/.34)*.5:undefined;busy=true;}
   else m.kick=undefined;
   m.dribbling=false;m.ready=undefined;
  });});
  state.defenders.forEach((s,i)=>{const a=defenders[i];if(!a)return;pose(a,s,m=>{m.stance='ready';m.ready=s.mode==='intercept'?.4:1;m.jockey=s.mode==='press'?.6:0;});});
  if(keeper&&state.keeper){const k=state.keeper;pose(keeper,k,m=>{m.keeper=1;m.ready=k.mode==='set'?1:undefined;m.keeperReach=k.dive;});
   // The dive is a committed body roll: the rig lies out along x, lifted off the grass.
   const root=keeper.rig.root,dive=reduced?Math.min(k.dive,.5):k.dive;root.rotation.z=-k.diveDir*dive*1.25;root.position.y=Math.sin(dive*Math.PI)*.45+dive*.25;root.position.x+=k.diveDir*dive*.5;if(Math.abs(k.dive-lastDive)>1e-4)busy=true;lastDive=k.dive;}
  // Ball: held at the carrier's feet while aiming, otherwise the engine's flight.
  ballTarget.set(ballP.x,Math.max(BALL_R,ballP.y*Y_SCALE),ballP.z);ball.position.copy(ballTarget);
  if(dt>0){const v=state.ball.v,speed=Math.hypot(v.x,v.z);ball.rotation.x+=speed*dt/BALL_R*Math.sign(v.z||1);ball.rotation.z-=v.x*dt/BALL_R;}
  ballShadow.position.set(ballP.x,.02,ballP.z);ballShadow.scale.setScalar(1+ballP.y*.12);(ballShadow.material as T.MeshBasicMaterial).opacity=.38/(1+ballP.y*.3);
  if(net&&(net.hit>0)){net.hit=Math.max(0,net.hit-dt*.9);const t=1-net.hit,amount=net.hit>0?Math.sin(t*14)*Math.exp(-t*3.8)*.4:0;for(let i=0;i<net.rest.length;i+=3){const x=net.rest[i],y=net.rest[i+1],z=net.rest[i+2],fall=Math.exp(-((x-(-net.x))**2+(y-.8)**2)*.45);net.attribute.setZ(i/3,z+(z<-.1?-amount*fall:0));}net.attribute.needsUpdate=true;busy=true;}
  stage.effects(dt);if(stage.effectsActive())busy=true;
  if(state.phase!=='aiming'){carrierRing.visible=false;}
  return busy;
 }
 const ray=new T.Raycaster(),ndc=new T.Vector2(),ground=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
 function pick(clientX:number,clientY:number):Vec2|null{const r=canvas.getBoundingClientRect();ndc.set((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);ray.setFromCamera(ndc,camera);const p=ray.ray.intersectPlane(ground,hit);return p?{x:p.x,z:p.z}:null;}
 const projected=new T.Vector3();
 function toScreen(x:number,y:number,z:number){const r=canvas.getBoundingClientRect();projected.set(x,y,z).project(camera);return{x:(projected.x+1)/2*r.width,y:(1-projected.y)/2*r.height};}
 /** Test/inspection hook: what the aim overlay is showing right now. */
 function debug(){const m=new T.Matrix4(),v=new T.Vector3();let pathDots=0;for(let i=0;i<PATH_DOTS;i++){dots.getMatrixAt(i,m);v.setFromMatrixScale(m);if(v.x>0)pathDots++;}return{strokePoints:strokeGeo.drawRange.count,strokeEnd:strokeGeo.drawRange.count?{x:strokePositions[(strokeGeo.drawRange.count-1)*3],z:strokePositions[(strokeGeo.drawRange.count-1)*3+2]}:null,pathDots,threatRings:threats.filter(r=>r.visible).length+(keeperThreat.visible?1:0),receiverRing:receiverRing.visible,called:attackers.map(a=>a.called),end:endGoal.visible?'goal':endOut.visible?'out':endRest.visible?'rest':null,zoom:camera.zoom};}
 function dispose(){tagTextures.forEach(t=>t.dispose());tagMaterials.forEach(m=>m.dispose());for(const rig of [...pool.attack,...pool.defend,...(pool.keeper?[pool.keeper]:[])])rig.dispose();pitch.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});strokeGeo.dispose();stage.dispose();}
 return{stage,debug,load,fit,update,setAim,setStroke,onEvent,resetActors,setReplayFocus,pick,toScreen,render:stage.render,dispose,get replayAmount(){return replayAmount;}};
}
export type PassPuzzleScene=ReturnType<typeof createPassPuzzleScene>;
