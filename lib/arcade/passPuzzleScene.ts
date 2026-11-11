import * as T from 'three';
import {puzzleLook,PITCH,GROUND_Y,PUZZLE_SUN} from './looks/puzzle';
import {aimComicSun,comicDotCell,comicMaterial,createComicUniforms} from './comic/shading';
import {comicStarGeometry} from './comic/ink';
import {comicCoastTexture,COMIC_COAST} from './comic/backdrop';
import {createArcadeStage} from './arcadeStage';
import type {Scenario,PuzzleState,Prediction,Vec2,PuzzleEvent} from '../passPuzzle/types';
import type {LaneStatus} from '../passPuzzle/explain';
import {stripedPlaneGeometry} from '../graphics/pitchStripes';
import {SKILL_MOVES,type SkillMotion} from '../graphics/skillMoves';
import {celebrationFor} from '../passPuzzle/combo';
import {marksAtlas,MARK,markGeometry,shaftGeometry,headGeometry,ribbonGeometry,flagAtlas,flagUV,flagBatchGeometry,flatMaterial,boardBounds,pitchSideGeometry,sunDirection,goalGeometry,ballGeometry,type MarkCell,type FlagTeam,type BoardView,type BoardCrop} from './puzzleComic';
import {matchPlayerDress,teamBodyColour,type MatchKits} from '../town/beanLooks';
import type {ArcadePoseOptions} from './arcadePlayerMotion';

/**
 * Pass Puzzles scene, "The Tactics Pitch" (docs/arcade-aaa/puzzle-direction.md): a comic-print training pitch on the Breakaway
 * coast at golden hour, in the arcade house style (lib/arcade/comic). Players are the island's real bean characters (the shared
 * arcade rigs from the stage, in print kits, with the comic bands, sun rim and ink edge): they run, wind up, strike, cushion the
 * ball, lunge, dive and celebrate. A rig is posed only while it moves, so a frozen moment costs no CPU and draws no frames. The pass
 * is an inked brush stroke the ball then follows with speed lines; defenders' reach
 * is red ink hatching. The pitch-side world (beach, surf, sea, kerb, boards, palms) is one merged mesh per level. Nothing here owns
 * a render loop: the game component calls update()/render() only while something moves.
 */
export type AimView={prediction:Prediction|null;receiver?:number;loft:number;stroke:Vec2[];status?:LaneStatus;
 /** Aim anywhere (Nov 11 2026): the spot on the goal face a placed shot is pointed at, and its scatter radius (m). */
 place?:{x:number;y:number;sigma:number}};
const LANE_COLOR:Record<LaneStatus,string>={clear:PITCH.markClear,tight:PITCH.markTight,blocked:PITCH.markBlocked,offside:'#ffb347',save:PITCH.markBlocked};
type Reaction='chest'|'thigh'|'header'|'stumble'|'deflect'|'slide'|'dejected';
type Rig=ReturnType<ReturnType<typeof createArcadeStage>['player']>;
/** One player: a pooled bean rig, its pose options (reused every frame) and the seconds of posing it still needs (0 = asleep). */
type Actor={team:FlagTeam;slot:number;flag:number;number:number;rig:Rig;o:ArcadePoseOptions;x:number;z:number;placed:boolean;face:number;stateFace:number;speed:number;awake:number;topX:number;topY:number;topZ:number;
 reaction:Reaction|null;reactionLeft:number;reactionTotal:number;receiveLeft:number;kickLeft:number;called:number;calledShown:number;callWave:number;dejected:boolean;celebrate:string|null};
const REACTION_SECONDS={chest:.62,thigh:.55,header:.5,stumble:.8,deflect:.55,slide:.75,dejected:1.3} as const;
const PATH_DOTS=48,AIR_DOTS=24,THREAT_RINGS=8,RIG_SCALE=1.9,BALL_R=.4,Y_SCALE=RIG_SCALE*.9;/* heights read against the players, who are drawn big so a phone can read them */
const HEAD_TOP=1.5*RIG_SCALE,MAX_TEAM=11,RING=1.28;/* a ring mark of scale s has radius s / RING */
const crossbar=(goalWidth:number)=>goalWidth>=7?2.44:goalWidth>=6?2.13:1.98;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

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

/** The HUD's measured screen insets in CSS px (PassPuzzleGame measureRoom): no piece is framed under them. */
export type FitRoom={top:number;bottom:number;left:number;right:number};
export function createPassPuzzleScene(canvas:HTMLCanvasElement){
 const stage=createArcadeStage(canvas,puzzleLook),{scene,camera}=stage,reducedMotion=stage.reduced;
 const sun=scene.children.find(o=>(o as T.DirectionalLight).isDirectionalLight) as T.DirectionalLight|undefined;
 // Painted once per visit: the ink marks atlas, the number badges and the painted horizon (lib/arcade/comic/backdrop.ts).
 const marks=marksAtlas(),flagsMap=flagAtlas(),coast=comicCoastTexture({sunX:.34,horizon:.8,palette:{seaNear:COMIC_COAST.seaFar}});
 // Comic house style (lib/arcade/comic): one uniform set for the whole game; every lit material gets the print bands and the
 // halftone turn, the players, ball and goal also the sun rim and the ink edge. No pass, no draw, no texture.
 const ink=createComicUniforms();comicDotCell(ink,stage.renderer);const sunDir=new T.Vector3(.5,.4,.6).normalize();
 const setMat=comicMaterial(flatMaterial(),{uniforms:ink}),pieceMat=comicMaterial(flatMaterial(),{uniforms:ink,rim:true,inkWidth:1.2});
 const apronMat=comicMaterial(new T.MeshLambertMaterial({color:PITCH.verge}),{uniforms:ink}),lineMat=comicMaterial(new T.MeshLambertMaterial({color:PITCH.line}),{uniforms:ink}),lineShadeMat=new T.MeshBasicMaterial({color:PITCH.ink,transparent:true,opacity:.82,depthWrite:false});
 const coastMat=new T.MeshBasicMaterial({map:coast,fog:false,toneMapped:false});
 const netMat=new T.LineBasicMaterial({color:'#fffaf0',transparent:true,opacity:.85});
 let pitch=new T.Group();scene.add(pitch);
 let goalAge=-1,scorer=-1,keeperDiveAge=-1,keeperWasDiving=false,keeperDiveDir=1,keeperDiveKind='side';const keeperDive:NonNullable<ArcadePoseOptions['dive']>={progress:0,dir:1,height:.4,kind:'side',outcome:'parry'};
 let attackers:Actor[]=[],defenders:Actor[]=[],keeper:Actor|null=null,scenario:Scenario|null=null,elapsed=0;
 const newActor=(team:FlagTeam,slot:number,flag:number,number:number):Actor=>({team,slot,flag,number,rig:rigFor(team,slot),o:{vx:0,vz:0},x:0,z:0,placed:false,face:0,stateFace:0,speed:0,awake:0,topX:0,topY:HEAD_TOP,topZ:0,reaction:null,reactionLeft:0,reactionTotal:1,receiveLeft:0,kickLeft:0,called:0,calledShown:0,callWave:0,dejected:false,celebrate:null});
 const everyone=()=>[...attackers,...defenders,...(keeper?[keeper]:[])];

 // The players: the shared arcade bean rigs (lib/arcade/islandArcadePlayer.ts, through the stage), pooled per team and built the
 // first time a board needs them. Kits are the page's print colours: attack sun yellow with paper trim, defence shutter blue, the
 // keeper tackle red with gloves. The first attack rig is the child's own bean (the stage's player 0) in the team kit.
 const KITS:MatchKits={home:{shirt:PITCH.attack,shirt2:PITCH.card,shorts:PITCH.attackDark,socks:PITCH.attack,socks2:PITCH.card,boots:PITCH.ink},away:{shirt:PITCH.defend,shirt2:'#9cc4e4',shorts:PITCH.defendDark,socks:PITCH.defend,socks2:'#9cc4e4',boots:PITCH.ink},homeKeeper:{shirt:PITCH.keeper,shirt2:PITCH.card,shorts:PITCH.keeperDark,socks:PITCH.keeper,boots:PITCH.ink},awayKeeper:{shirt:PITCH.keeper,shirt2:PITCH.card,shorts:PITCH.keeperDark,socks:PITCH.keeper,boots:PITCH.ink}};
 // Comic figures, as in Pinball: the shared rig modules are untouched; inside this scene each rig material is cloned once as a matte
 // print colour with the kit's bands, sun rim and ink edge. No rig mesh casts a shadow (about 5k triangles of limbs each, drawn
 // twice): one instanced low-poly proxy casts them all. The printed back number is off the camera's layer (the flag carries it).
 const rigMats=new Map<T.Material,T.Material>(),rigHsl={h:0,s:0,l:0};
 const inkRig=(root:T.Object3D)=>root.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh||Array.isArray(m.material))return;if(/shirt-number/.test(m.name)){m.layers.set(31);return;}const src=m.material as T.MeshStandardMaterial;if(typeof src.roughness!=='number')return;
  m.castShadow=false;if(m.name==='bean-body'||m.name==='bean-limbs')m.geometry=farView(m);let made=rigMats.get(src);if(!made){const c=src.clone();c.roughness=.9;c.metalness=0;c.envMap=null;if(!c.map){c.color.getHSL(rigHsl);c.color.setHSL(rigHsl.h,Math.min(1,rigHsl.s*1.2+.04),Math.max(.08,Math.round(rigHsl.l*5)/5));}made=comicMaterial(c,{uniforms:ink,rim:true,inkWidth:1.2});rigMats.set(src,made);}m.material=made;});
 // Far-camera views of the shared bean geometry (one per part, cached): the same vertex buffers with a coarser index. The body is
 // a 30 x 32 grid of quads and each limb a tube of 22 x 10: seen from the coach's seat half the rings and half the sides draw the
 // same silhouette (body 1920 -> 480 triangles, limbs 3032 -> about 1830: the mittens and boots are kept whole). The layout is
 // checked first; if the shared module ever changes it, the full geometry is used as before.
 const farViews=new Map<T.BufferGeometry,T.BufferGeometry>();
 function farView(mesh:T.Mesh):T.BufferGeometry{const base=mesh.geometry;let view=farViews.get(base);if(view)return view;view=base;
  const index=base.index,src=index?.array,n=base.getAttribute('position')?.count??0;let idx:number[]|null=null;
  if(index&&src){
   if(mesh.name==='bean-body'&&n===31*33&&index.count===30*32*6&&src[1]===1&&src[2]===33){idx=[];for(let i=0;i<30;i+=2)for(let j=0;j<32;j+=2){const a=i*33+j,c=a+66;idx.push(a,a+2,c,c,a+2,c+2);}}
   else if(mesh.name==='bean-limbs'&&n>4*23*11&&index.count>=4*22*10*6&&src[0]===0&&src[1]===11&&src[2]===1){const rings=[0,1,2,3,5,6,8,10,12,14,16,18,19,20,22];idx=[];
    for(let k=0;k<4;k++)for(let r=0;r<rings.length-1;r++)for(let j=0;j<10;j+=2){const a=k*253+rings[r]*11+j,b=k*253+rings[r+1]*11+j;idx.push(a,b,a+2,a+2,b,b+2);}
    for(let i=4*22*10*6;i<index.count;i++)idx.push(src[i]);}}
  if(idx){view=new T.BufferGeometry();for(const [name,attribute] of Object.entries(base.attributes))view.setAttribute(name,attribute);view.setIndex(idx);view.boundingSphere=base.boundingSphere?.clone()??null;view.boundingBox=base.boundingBox?.clone()??null;view.name=base.name;}
  farViews.set(base,view);return view;}
 const sparks=scene.children.find(o=>(o as T.InstancedMesh).isInstancedMesh&&(o as T.InstancedMesh).geometry.type==='IcosahedronGeometry');
 const rigPool:Record<FlagTeam,Rig[]>={attack:[],defend:[],keeper:[]};
 function rigFor(team:FlagTeam,slot:number){const list=rigPool[team];
  while(list.length<=slot){const i=list.length,rig=stage.player(PITCH[team],matchPlayerDress(`puzzle-${team}-${i}`,team==='attack'?'home':'away',team==='keeper',null,KITS));rig.root.name=`puzzle-${team}-${i}`;rig.root.scale.setScalar(RIG_SCALE);rig.root.visible=false;inkRig(rig.root);list.push(rig);}
  return list[slot];}
 rigFor('attack',0);
 const rigShadows=new T.InstancedMesh((()=>{const body=new T.CylinderGeometry(.17,.25,.72,6).translate(0,.5,0).toNonIndexed(),head=new T.SphereGeometry(.27,6,4).translate(0,1.06,0).toNonIndexed(),g=new T.BufferGeometry(),n=body.attributes.position.count+head.attributes.position.count,pos=new Float32Array(n*3);pos.set(body.attributes.position.array,0);pos.set(head.attributes.position.array,body.attributes.position.count*3);g.setAttribute('position',new T.BufferAttribute(pos,3));body.dispose();head.dispose();return g;})(),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false}),MAX_TEAM*2+1);
 rigShadows.name='puzzle-rig-shadows';rigShadows.castShadow=true;rigShadows.frustumCulled=false;rigShadows.count=0;rigShadows.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(rigShadows);
 // Contact shadows (slot 0 is the ball, then the players: a flat violet disc with a dotted edge under each) and the number flags on their pins: one draw each.
 const BLOBS=MAX_TEAM*2+2,blobs=new T.InstancedMesh(markGeometry(MARK.blob),new T.MeshBasicMaterial({map:marks,color:'#3b2a5a',transparent:true,opacity:.34,depthWrite:false}),BLOBS);blobs.name='puzzle-contact-shadows';blobs.frustumCulled=false;blobs.count=1;blobs.instanceMatrix.setUsage(T.DynamicDrawUsage);blobs.renderOrder=1;scene.add(blobs);
 const FLAGS=MAX_TEAM*2+1,flagGeo=flagBatchGeometry(FLAGS),flagMesh=new T.Mesh(flagGeo,new T.MeshBasicMaterial({map:flagsMap,transparent:true,alphaTest:.05,depthWrite:false,toneMapped:false,fog:false}));flagMesh.name='puzzle-number-flags';(flagMesh.material as T.MeshBasicMaterial).side=T.DoubleSide;flagMesh.frustumCulled=false;flagMesh.renderOrder=6;scene.add(flagMesh);
 const flagPos=flagGeo.getAttribute('position') as T.BufferAttribute,flagUv=flagGeo.getAttribute('uv') as T.BufferAttribute;

 // Hand-drawn marks: every ring, cross and hatch is a flat quad on the pitch mapped to one cell of the marks atlas.
 const markGeos=new Map<MarkCell,T.BufferGeometry>(),markGeo=(cell:MarkCell)=>{let g=markGeos.get(cell);if(!g){g=markGeometry(cell);markGeos.set(cell,g);}return g;};
 const chalk=(color:string,opacity=1)=>new T.MeshBasicMaterial({map:marks,color,transparent:true,opacity,depthWrite:false,toneMapped:false});
 const flatMark=(cell:MarkCell,color:string,opacity=1,order=3)=>{const m=new T.Mesh(markGeo(cell),chalk(color,opacity));m.renderOrder=order;m.visible=false;scene.add(m);return m;};
 const shaftGeo=shaftGeometry(),headGeo=headGeometry();

 // Aim graphics: the ink line (one ribbon), paper beads for the part of a lifted pass that is in the air, pooled marks.
 const ribbonGeo=ribbonGeometry(PATH_DOTS),ribbonMat=chalk(PITCH.mark),ribbon=new T.Mesh(ribbonGeo,ribbonMat);ribbon.name='puzzle-chalk-pass';ribbonMat.side=T.DoubleSide;ribbon.frustumCulled=false;ribbon.renderOrder=4;scene.add(ribbon);
 const ribbonPos=ribbonGeo.getAttribute('position') as T.BufferAttribute;let ribbonCount=0,strokeArmed=false,strokeCommitted=false;
 // Completed passes stay on the pitch as rubbed-out ink (the coach's diagram builds up over a move): a pool of three older lines.
 const HISTORY=3,historyMat=chalk(PITCH.ink,.78),history=Array.from({length:HISTORY},()=>{const g=ribbonGeometry(PATH_DOTS),m=new T.Mesh(g,historyMat);m.name='puzzle-chalk-history';m.frustumCulled=false;m.renderOrder=3;m.visible=false;scene.add(m);return m;});historyMat.side=T.DoubleSide;let historyNext=0;
 function keepStroke(){if(!strokeCommitted||ribbonCount<2)return;const m=history[historyNext++%HISTORY],p=m.geometry.getAttribute('position') as T.BufferAttribute;{const src=ribbonPos.array as Float32Array,dst=p.array as Float32Array;/* kept as thinner ink: each pair of edge points is pulled toward the middle of the stroke */for(let i=0;i<PATH_DOTS;i++){const a=i*6;for(let k=0;k<3;k++){const mid=(src[a+k]+src[a+3+k])/2;dst[a+k]=mid+(src[a+k]-mid)*.42;dst[a+3+k]=mid+(src[a+3+k]-mid)*.42;}}}p.needsUpdate=true;m.geometry.setDrawRange(0,(PATH_DOTS-1)*6);m.visible=true;}
 function wipeHistory(){for(const m of history)m.visible=false;historyNext=0;}
 const dotGeo=new T.SphereGeometry(1,8,6),dotMat=new T.MeshBasicMaterial({color:PITCH.mark,toneMapped:false}),dots=new T.InstancedMesh(dotGeo,dotMat,AIR_DOTS);dots.name='puzzle-air-beads';dots.frustumCulled=false;dots.count=0;dots.instanceMatrix.setUsage(T.DynamicDrawUsage);dots.renderOrder=4;scene.add(dots);
 const dummy=new T.Object3D();
 function hideDots(){ribbonCount=0;ribbonGeo.setDrawRange(0,0);dots.count=0;strokeCommitted=false;}
 /** An aim that was cancelled (pointer cancel, blur, a stroke too short to play) must not leave an armed line for the next kick to commit. */
 function clearStroke(){strokeArmed=false;if(!strokeCommitted){ribbonCount=0;ribbonGeo.setDrawRange(0,0);dots.count=0;}}
 const threats=Array.from({length:THREAT_RINGS},()=>{const m=flatMark(MARK.hatch,PITCH.markBlocked,.9);m.scale.setScalar(1.95);return m;}); // red pencil hatching: this defender reaches the pass
 const keeperThreat=flatMark(MARK.hatch,PITCH.markBlocked,.9);keeperThreat.scale.setScalar(2.2);
 const receiverRing=flatMark(MARK.ring,PITCH.mark);receiverRing.scale.setScalar(1.95);
 const carrierRing=flatMark(MARK.ring,PITCH.markTight);carrierRing.scale.setScalar(1.7);
 const clockRing=flatMark(MARK.dashRing,PITCH.markRun,.85);clockRing.name='puzzle-first-time-clock';
 const endGoal=flatMark(MARK.ticks,PITCH.markTight),endRest=flatMark(MARK.smudge,PITCH.mark,.9),endOut=flatMark(MARK.cross,PITCH.markBlocked);endGoal.scale.setScalar(1.1);endRest.scale.setScalar(.8);
 // Aim anywhere: an inked reticle standing on the goal face (sun ticks inside a dashed ring as wide as the scatter). Two draws, only while a placed shot is being aimed.
 const aimSpot=flatMark(MARK.ticks,PITCH.sun,1,9),aimRing=flatMark(MARK.dashRing,PITCH.ink,.95,9);for(const m of [aimSpot,aimRing]){m.rotation.x=-Math.PI/2;(m.material as T.MeshBasicMaterial).depthTest=false;(m.material as T.MeshBasicMaterial).side=T.DoubleSide;m.name='puzzle-aim-reticle';}
 const zoneRing=flatMark(MARK.dashRing,PITCH.mark,.9);
 // Offside line (Law 11): a dashed ink line at the second-last defender while the pass is drawn,
 // plus a small paper flag over any teammate who would be offside. One mesh + a 3-sprite pool, built once.
 const dashCanvas=document.createElement('canvas');dashCanvas.width=64;dashCanvas.height=8;{const g=dashCanvas.getContext('2d')!;g.fillStyle=PITCH.ink;g.fillRect(0,0,42,8);g.fillStyle=PITCH.sun;g.fillRect(1.5,1.5,39,5);}
 const dashTexture=new T.CanvasTexture(dashCanvas);dashTexture.wrapS=T.RepeatWrapping;dashTexture.colorSpace=T.SRGBColorSpace;
 const offsideLine=new T.Mesh(new T.PlaneGeometry(1,.4),new T.MeshBasicMaterial({map:dashTexture,transparent:true,depthWrite:false,toneMapped:false}));offsideLine.rotation.x=-Math.PI/2;offsideLine.renderOrder=3;offsideLine.visible=false;offsideLine.name='puzzle-offside-line';scene.add(offsideLine);
 const flagCanvas=document.createElement('canvas');flagCanvas.width=flagCanvas.height=64;{const g=flagCanvas.getContext('2d')!;g.fillStyle=PITCH.ink;g.fillRect(13,4,5,57);g.fillRect(16,6,40,30);g.fillStyle=PITCH.sun;g.fillRect(19,9,34,24);g.fillStyle=PITCH.red;g.fillRect(19,9,17,12);g.fillRect(36,21,17,12);}
 const flagTexture=new T.CanvasTexture(flagCanvas);flagTexture.colorSpace=T.SRGBColorSpace;const flagMaterial=new T.SpriteMaterial({map:flagTexture,depthWrite:false,transparent:true,toneMapped:false,fog:false,sizeAttenuation:false});
 const flags=Array.from({length:3},()=>{const f=new T.Sprite(flagMaterial);f.scale.setScalar(.034);f.center.set(-.25,-.9);f.renderOrder=7;f.visible=false;f.name='puzzle-offside-flag';scene.add(f);return f;});
 let flagged:number[]=[],calledOffside=-1;
 /** z of the offside line: the second-last opponent (keeper or an implied keeper on the goal line). */
 function lineOf(state:PuzzleState){const goalZ=(scenario?.pitch.length??0)/2;let a=state.keeper?state.keeper.p.z:goalZ,b=-1e9;for(const d of state.defenders){const z=d.p.z;if(z>a){b=a;a=z;}else if(z>b)b=z;}return b;}
 // Readable defender intent while aiming (what each defender WILL do when you pass): a pencilled paper tag over trap,
 // hunter and recovering defenders, and a tinted claim zone for a sweeper keeper. Built once, pooled.
 const intentCanvas=(glyph:'up'|'back'|'!',bg:string)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;g.save();g.translate(32,32);g.rotate(-.07);g.fillStyle=PITCH.ink;g.fillRect(-22,-18,50,42);g.fillRect(-27,-23,50,42);g.fillStyle=PITCH.card;g.fillRect(-24,-20,44,36);g.fillStyle=bg;g.fillRect(-24,-20,44,8);g.strokeStyle=g.fillStyle=bg;g.lineWidth=5;g.lineCap=g.lineJoin='round';
  // Pass 2: the marks are drawn, not typed (an arrow glyph can come out as an emoji on Android).
  if(glyph==='!'){g.font='800 30px "Arial Rounded MT Bold",system-ui,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',0,5);}
  else if(glyph==='up'){g.beginPath();g.moveTo(0,16);g.lineTo(0,-4);g.stroke();g.beginPath();g.moveTo(-9,2);g.lineTo(0,-8);g.lineTo(9,2);g.stroke();g.lineWidth=3;g.setLineDash([5,5]);g.beginPath();g.moveTo(-16,16);g.lineTo(16,16);g.stroke();}
  else{g.beginPath();g.moveTo(12,14);g.lineTo(12,4);g.quadraticCurveTo(12,-4,2,-4);g.lineTo(-12,-4);g.stroke();g.beginPath();g.moveTo(-5,-11);g.lineTo(-13,-4);g.lineTo(-5,3);g.stroke();}
  g.restore();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;};
 const intentTextures={trap:intentCanvas('up','#d9623b'),hunt:intentCanvas('!',PITCH.red),recover:intentCanvas('back',PITCH.blue),react:intentCanvas('!','#ff5a3c')};
 const intentMaterials=Object.fromEntries(Object.entries(intentTextures).map(([k,t])=>[k,new T.SpriteMaterial({map:t,depthWrite:false,transparent:true,toneMapped:false,fog:false,sizeAttenuation:false})])) as Record<keyof typeof intentTextures,T.SpriteMaterial>;
 const intents=Array.from({length:8},()=>{const sp=new T.Sprite(intentMaterials.trap);sp.scale.setScalar(.034);sp.center.set(.5,-1);sp.renderOrder=7;sp.visible=false;sp.name='puzzle-intent';scene.add(sp);return sp;});
 const sweeperZone=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:PITCH.red,transparent:true,opacity:.2,depthWrite:false}));sweeperZone.rotation.x=-Math.PI/2;sweeperZone.renderOrder=2;sweeperZone.visible=false;sweeperZone.name='puzzle-sweeper-zone';scene.add(sweeperZone);
 // A defender who reads the pass shows a quick "!" as he sets off to intercept (reaction telegraph).
 const reactAge=new Float32Array(16).fill(-1),prevMode:string[]=[];
 // Chalk arrows. Called runs: sky-blue ink from the runner to where they will go (pool of 4, plus one live preview).
 const arrowMat=chalk(PITCH.markRun,.95);
 const makeArrow=(mat:T.Material,name:string)=>{const g=new T.Group(),shaft=new T.Mesh(shaftGeo,mat),head=new T.Mesh(headGeo,mat);shaft.renderOrder=head.renderOrder=3;g.add(shaft,head);g.visible=false;g.name=name;scene.add(g);return{g,shaft,head};};
 const layArrow=(a:{g:T.Group;shaft:T.Mesh;head:T.Mesh},from:Vec2,to:Vec2,y:number,width:number,min:number)=>{const dx=to.x-from.x,dz=to.z-from.z,len=Math.hypot(dx,dz);if(len<min){a.g.visible=false;return;}const tip=Math.min(1.5,len*.45);
  a.g.visible=true;a.g.position.set(from.x,y,from.z);a.g.rotation.set(0,Math.atan2(dx,dz),0);a.shaft.scale.set(width,1,Math.max(.1,len-tip*.8));a.head.position.set(0,0,len-tip);a.head.scale.set(width*2.7,1,tip);};
 const arrows=Array.from({length:6},()=>makeArrow(arrowMat,'puzzle-run-arrow'));
 // Threat preview: a red pencil arrow from each defender who can reach the pass to the spot they would reach
 // ("#4 gets here"), a cross where the ball would be stopped, and a tight-lane yellow arrow for a near miss.
 const dangerMat=chalk(PITCH.markBlocked,.95),nearMat=chalk(PITCH.markTight,.85);
 const dangerArrows=Array.from({length:3},()=>makeArrow(dangerMat,'puzzle-danger-arrow'));
 // The sweeper keeper's claim zone is ruled on the pitch in red pencil (three strips; the goal line closes it), over a faint wash.
 const sweeperEdge=Array.from({length:3},()=>{const m=new T.Mesh(shaftGeo,dangerMat);m.renderOrder=2;m.visible=false;m.name='puzzle-sweeper-edge';scene.add(m);return m;});
 const placeDanger=(i:number,from:Vec2|null,to:Vec2|null,near=false)=>{const a=dangerArrows[i];if(!a)return;if(!from||!to){a.g.visible=false;return;}const m=near?nearMat:dangerMat;a.shaft.material=m;a.head.material=m;layArrow(a,from,to,.06,.3,.5);};
 // Where the move broke down (set once on a failed attempt): the grease-pencil cross pops in and the camera eases toward it
 // during the beat before the result card, so the child SEES the interception instead of reading about it.
 let stop:{at:T.Vector3;age:number;mark:T.Object3D}|null=null;const stopAt=new T.Vector3();const STOP_PUSH=.55,CUT=1.15;
 // A fail lands as an ink splat with the red cross scrawled over it.
 const splat=flatMark(MARK.smudge,PITCH.ink,.92,4);splat.name='puzzle-fail-splat';
 const cutMark=flatMark(MARK.cross,PITCH.markBlocked,1,5);cutMark.scale.setScalar(CUT);cutMark.name='puzzle-cut-mark';endOut.scale.setScalar(CUT);
 // Hint spot: where the next pass of the coach's route goes (tier-2 hint), with its run arrow when one is needed.
 const hintRing=flatMark(MARK.ring,PITCH.markRun,.98);hintRing.name='puzzle-hint-spot';const hintDot=flatMark(MARK.smudge,PITCH.markRun,.85);hintDot.name='puzzle-hint-dot';hintDot.scale.setScalar(.55);let hint:{spot:Vec2;run?:{from:Vec2;to:Vec2}}|null=null;
 let hintAge=-1;const HINT_REVEAL=.8;
 function setHint(h:{spot:Vec2;run?:{from:Vec2;to:Vec2}}|null){const fresh=!!h&&(!hint||hint.spot.x!==h.spot.x||hint.spot.z!==h.spot.z);hint=h;if(fresh)hintAge=reducedMotion?HINT_REVEAL:0;hintRing.visible=hintDot.visible=!!h;if(h){hintRing.position.set(h.spot.x,.05,h.spot.z);hintDot.position.set(h.spot.x,.05,h.spot.z);}placeArrow(5,h?.run?.from??null,h?.run?.to??null);}
 // "Look up" scan: a broad ink lane from the ball to each teammate, green-white (open), yellow (tight) or red
 // (shut), with a ring at their feet. Pooled (5), placed once per aim on request; static, so no frames.
 const scanMats:Record<string,T.MeshBasicMaterial>={clear:chalk(PITCH.markClear,.62),tight:chalk(PITCH.markTight,.6),blocked:chalk(PITCH.markBlocked,.6)};
 scanMats.offside=scanMats.save=scanMats.blocked;const SCAN_OPACITY=[scanMats.clear.opacity,scanMats.tight.opacity,scanMats.blocked.opacity],scanFaded=(k:number)=>{[scanMats.clear,scanMats.tight,scanMats.blocked].forEach((m,i)=>m.opacity=SCAN_OPACITY[i]*k);};let scanShown=false,scanFade=1;
 const scanLanes=Array.from({length:5},()=>{const g=new T.Group(),shaft=new T.Mesh(shaftGeo,scanMats.clear),ring=new T.Mesh(markGeo(MARK.ring),scanMats.clear);shaft.renderOrder=ring.renderOrder=2;g.add(shaft);g.visible=ring.visible=false;g.name='puzzle-scan-lane';scene.add(g,ring);return{g,shaft,ring};});
 function setScan(lanes:{from:Vec2;to:Vec2;status:string}[]|null){scanFade=1;scanFaded(1);scanShown=!!lanes?.length;scanLanes.forEach((l,i)=>{const lane=lanes?.[i],dx=lane?lane.to.x-lane.from.x:0,dz=lane?lane.to.z-lane.from.z:0,len=Math.hypot(dx,dz);
  if(!lane||len<2){l.g.visible=l.ring.visible=false;return;}const m=scanMats[lane.status]??scanMats.clear,start=1.2,span=Math.max(.2,len-start-1.7);
  l.shaft.material=l.ring.material=m;l.g.visible=l.ring.visible=true;l.g.position.set(lane.from.x,.04,lane.from.z);l.g.rotation.set(0,Math.atan2(dx,dz),0);l.shaft.scale.set(1.5,1,span);l.shaft.position.set(0,0,start);l.ring.position.set(lane.to.x,.045,lane.to.z);l.ring.scale.setScalar(1.95);});}
 // Replays show every run as it happens, so the movement that made the pass is visible.
 let replayRuns=false;const setReplayRuns=(on:boolean)=>{replayRuns=on;};
 function placeArrow(i:number,from:Vec2|null,to:Vec2|null){const a=arrows[i];if(!a)return;if(!from||!to){a.g.visible=false;return;}layArrow(a,from,to,.055,.36,.6);}
 /** Show the runs the child has called (and the one being dragged right now). */
 function setCalls(state:PuzzleState,live?:{from:number;to:Vec2}|null){let n=0;state.attackers.forEach(a=>{if(a.call&&a.call.startAt==null&&n<4)placeArrow(n++,a.p,a.call.to);});for(let i=n;i<4;i++)placeArrow(i,null,null);
  placeArrow(4,live&&state.attackers[live.from]?state.attackers[live.from].p:null,live?.to??null);}
 function placeIntents(state:PuzzleState,dt:number){let n=0;const aiming=state.phase==='aiming'||state.phase==='windup';
  state.defenders.forEach((d,i)=>{const def=scenario?.defenders[i];if(!def)return;
   if(prevMode[i]!=='intercept'&&d.mode==='intercept')reactAge[i]=0;prevMode[i]=d.mode;
   const kind:keyof typeof intentTextures|null=reactAge[i]>=0&&reactAge[i]<.7?'react':aiming&&def.trap?'trap':aiming&&def.hunt?'hunt':aiming&&def.recover?'recover':null;
   if(reactAge[i]>=0)reactAge[i]+=dt;if(kind&&n<intents.length){const sp=intents[n++];sp.visible=true;sp.material=intentMaterials[kind];sp.position.set(d.p.x,HEAD_TOP+.3,d.p.z);}});
  for(let i=n;i<intents.length;i++)intents[i].visible=false;
  return reactAge.some(a=>a>=0&&a<.7);}
 function placeFlags(state:PuzzleState){const list=calledOffside>=0?[calledOffside]:flagged;flags.forEach((f,i)=>{const a=state.attackers[list[i]];f.visible=!!a&&i<list.length;if(a)f.position.set(a.p.x,HEAD_TOP+.3,a.p.z);});}

 // Speed streaks behind a moving ball: one small instanced mesh, alive only while the ball travels.
 const liveTrail=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:PITCH.mark,transparent:true,opacity:.9,depthWrite:false}),24);/* speed lines: ink-brush streaks laid along the ball's path */liveTrail.name='puzzle-flight-trail';liveTrail.frustumCulled=false;liveTrail.count=0;liveTrail.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(liveTrail);
 const trailPoints=new Float32Array(72);let trailHead=0,trailCount=0,trailClock=0,trailLife=0;const trailMaterial=liveTrail.material as T.MeshBasicMaterial;
 // The goal burst (the kit's impact star, as on Breakaway's struck ball): an ink star behind a sun-yellow one, facing the camera. Two draws, only while it shows.
 const starGeo=comicStarGeometry(),goalStars=[PITCH.ink,PITCH.sun].map((color,i)=>{const m=new T.Mesh(starGeo,new T.MeshBasicMaterial({color,transparent:true,depthWrite:false,depthTest:false,side:T.DoubleSide,toneMapped:false,fog:false}));m.name='puzzle-goal-star-'+i;m.renderOrder=8+i;m.visible=false;scene.add(m);return m;});
 const goalRings=[PITCH.markTight,PITCH.mark].map(color=>flatMark(MARK.ticks,color,.9));goalRings.forEach((r,i)=>r.name='puzzle-goal-pulse-'+i);
 // Goal celebrations (Oct 25): one pooled skill motion per attacker, each run over its authored length (combo.ts picks the move).
 // On the pitch the move names become wooden ones: the scorer's airplane is a rolling wobble, a knee slide leans right back, the rest hop.
 const celebrations:SkillMotion[]=Array.from({length:11},(_,i)=>({type:'thankPasser',progress:0,side:i%2?-1:1}));
 const CELEBRATE_SECONDS=Math.max(...(['airplane','kneeSlide','highFive','fistBump','thankPasser'] as const).map(k=>SKILL_MOVES[k].seconds));
 let goalSerial=0,assister=-2,flightReceiver=-1,lastKicker=-1;
 // The fail beat: the passer and receiver bow their heads, the defender or keeper who won it hops on the spot.
 const winnerMotion:SkillMotion={type:'fistBump',progress:0,side:1};let failAge=-1,stopBy:{defender:number;keeper:boolean}={defender:-1,keeper:false};
 // Goal confetti: one pooled instanced mesh (48 hole-punch dots, instance colours). They fall for about 2.2 s and stay on the pitch.
 const CONFETTI=48,CONFETTI_LIFE=2.2,confettiGeo=new T.CircleGeometry(.2,7),confettiMat=new T.MeshBasicMaterial({side:T.DoubleSide,toneMapped:false,fog:false});
 const confetti=new T.InstancedMesh(confettiGeo,confettiMat,CONFETTI);confetti.name='puzzle-confetti';confetti.frustumCulled=false;confetti.count=0;confetti.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(confetti);
 {const palette=[PITCH.card,PITCH.sun,PITCH.red,PITCH.teal,PITCH.blue,PITCH.orange].map(c=>new T.Color(c));for(let i=0;i<CONFETTI;i++)confetti.setColorAt(i,palette[i%palette.length]);}
 const confettiP=new Float32Array(CONFETTI*3),confettiV=new Float32Array(CONFETTI*3),confettiSpin=new Float32Array(CONFETTI);let confettiAge=-1;
 function launchConfetti(x:number,z:number,width:number){let seed=7+goalSerial*31;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<CONFETTI;i++){const j=i*3;confettiP[j]=x+(rnd()-.5)*width;confettiP[j+1]=2.2+rnd()*1.2;confettiP[j+2]=z-.6+rnd()*.8;confettiV[j]=(rnd()-.5)*4;confettiV[j+1]=2.5+rnd()*3.5;confettiV[j+2]=-1-rnd()*2.5;confettiSpin[i]=(rnd()-.5)*14;}
  confettiAge=0;confetti.count=CONFETTI;}
 // A completed pass: ink tick marks knock out from the receiver's base.
 const passPop=flatMark(MARK.ticks,PITCH.mark,.9);passPop.name='puzzle-pass-pop';let passPopAge=-1;
 // Nov 8 2026: the same pooled ring flashes red where a defender steals the ball (no new mesh or draw), and the cups tint the
 // pass trail (Pro Cup gold, Legend Cup violet ink). popColor/passTint are reused Colors (no allocation).
 const popMat=passPop.material as T.MeshBasicMaterial,POP_RECEIVE=new T.Color(PITCH.mark),POP_STEAL=new T.Color('#ff6b5d');let passTint:string=PITCH.mark;
 function setTier(look:'gold'|'violet'|null){passTint=look==='gold'?PITCH.markGold:look==='violet'?PITCH.markViolet:PITCH.mark;}
 function clearBeats(){confettiAge=-1;confetti.count=0;passPopAge=-1;passPop.visible=false;failAge=-1;assister=-2;flightReceiver=lastKicker=-1;stopBy={defender:-1,keeper:false};}
 // The ball: an inked 32-panel football (lib/arcade/puzzleComic.ts), in the props' rim-and-ink material.
 const ball=new T.Mesh(ballGeometry(BALL_R),pieceMat);ball.name='puzzle-ball';ball.castShadow=true;scene.add(ball);
 let net:{attribute:T.BufferAttribute;rest:Float32Array;hit:number;x:number;y:number;z:number}|null=null,goalHigh=0;
 let stripeMaterials:T.MeshLambertMaterial[]=[];

 /** What the coach must read (players, their scripted runs, the goal mouth, a target zone), which way the view is turned, and
  * from that the board itself: where it is cropped on the coach's side and where the sand goes out of focus. Pure per scenario
  * and orientation, so the board build and fit() always agree. */
 const MARGIN=3.4;
 function framing(s:Scenario,portrait:boolean){
  const half=s.pitch.length/2,bar=crossbar(s.pitch.goalWidth)*Y_SCALE,pts:[number,number,number][]=[];const add=(x:number,z:number,y=0)=>pts.push([x,y,z]);
  for(const p of [...s.attackers,...s.defenders,...(s.keeper?[s.keeper]:[])]){add(p.x,p.z);add(p.x,p.z,HEAD_TOP+.3+.9);}
  for(const a of s.attackers)for(const p of a.run?.path??[])add(p.x,p.z);
  if(s.require.finish==='goal')for(const x of [-s.pitch.goalWidth/2-1,s.pitch.goalWidth/2+1]){add(x,half);add(x,half,bar);add(x,half+1.2);}
  if(s.require.zone){const z=s.require.zone;add(z.x-z.r,z.z-z.r);add(z.x+z.r,z.z+z.r);}
  // View from behind the ball carrier, turned toward the action: a wide crosser gets a
  // camera out on the wing looking in, so the play runs up a portrait screen instead of across it.
  // The play's long axis (principal axis of the points) runs up a portrait screen and across a wide one.
  let mx=0,mz=0,n=0;for(const p of pts)if(p[1]===0){mx+=p[0];mz+=p[2];n++;}mx/=n;mz/=n;let sxx=0,szz=0,sxz=0;for(const p of pts)if(p[1]===0){const x=p[0]-mx,z=p[2]-mz;sxx+=x*x;szz+=z*z;sxz+=x*z;}
  const axis=.5*Math.atan2(2*sxz,sxx-szz),wrap=(a:number)=>{while(a>Math.PI/2)a-=Math.PI;while(a<-Math.PI/2)a+=Math.PI;return a;};
  const along=wrap(Math.PI/2-axis),across=wrap(-axis),limit=portrait?(s.require.finish==='goal'?1.05:1.45):.32,heading=Math.max(-limit,Math.min(limit,portrait?along:across*.6));
  let cx=0,cz=0;for(const p of pts){cx+=p[0];cz+=p[2];}cx/=pts.length;cz/=pts.length;
  const dx=Math.sin(heading),dz=Math.cos(heading);let near=1e9,far=-1e9,x0=1e9,x1=-1e9,z0=1e9;
  for(const p of pts)if(p[1]===0){const d=(p[0]-cx)*dx+(p[2]-cz)*dz;near=Math.min(near,d);far=Math.max(far,d);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);}
  // The board ends just behind the deepest player; a camera out on a wing also brings that side rail in.
  const crop:BoardCrop={z0:z0-MARGIN};if(dx>.3)crop.x0=x0-MARGIN;else if(dx<-.3)crop.x1=x1+MARGIN;
  // A wide screen shows the whole board as an object: it is trimmed to the play on both sides too, and never thinner than a real board.
  if(!portrait){crop.x0=x0-9;crop.x1=x1+9;const b=boardBounds(s.pitch.halfWidth,s.pitch.length,crop);crop.z0=Math.min(crop.z0!,b.z1-(b.x1-b.x0)*.6);}
  const view:BoardView={cx,cz,dx,dz,near,far:far+7,crop};return{pts,cx,cz,dx,dz,view};
 }
 let horizon:{mesh:T.Mesh;shore:number}|null=null;
 let builtPortrait=false;
 function buildPitch(s:Scenario){
  scene.remove(pitch);pitch.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments)o.geometry.dispose();});pitch=new T.Group();scene.add(pitch);
  const {halfWidth:hw,length:L,goalWidth:gw}=s.pitch,half=L/2;builtPortrait=canvas.clientWidth/Math.max(1,canvas.clientHeight)<.8;
  const fr=framing(s,builtPortrait),b=boardBounds(hw,L,fr.view.crop),zc=(b.z0+b.z1)/2,xc=(b.x0+b.x1)/2,bw=b.x1-b.x0;
  // The turf apron inside the frame, then the mown pitch on top of it.
  const apron=new T.PlaneGeometry(bw,b.z1-b.z0);apron.rotateX(-Math.PI/2);apron.translate(xc,-.012,zc);apronMat.color.set(s.weather?.wet?PITCH.vergeWet:PITCH.verge);const base=new T.Mesh(apron,apronMat);base.name='pass-puzzle-apron';base.receiveShadow=true;pitch.add(base);
  // Mown bands about 5 m long in one mesh, two draws (pitchStripes.ts; was one mesh per band).
  {const stripes=Math.max(4,Math.round(L/5)),wet=s.weather?.wet;stripeMaterials.forEach(m=>m.dispose());stripeMaterials=(wet?[PITCH.turfWet,PITCH.turfWetMown]:[PITCH.turf,PITCH.turfMown]).map(color=>comicMaterial(new T.MeshLambertMaterial({color}),{uniforms:ink}));
   const m=new T.Mesh(stripedPlaneGeometry(hw*2,L,stripes),stripeMaterials);
   // A cropped board cuts the mown bands off at the frame (clamped vertices: a band outside the board collapses to nothing).
   {const q=m.geometry.getAttribute('position') as T.BufferAttribute;for(let i=0;i<q.count;i++)q.setXYZ(i,clamp(q.getX(i),b.x0,b.x1),0,Math.max(b.z0,q.getZ(i)));}m.name='pass-puzzle-grass';m.position.y=.008;m.receiveShadow=true;pitch.add(m);}
  // Painted lines: every strip is a quad in one mesh, with an ink copy of the mesh offset under it (the hard print shadow of the HUD's caption boxes).
  const quads:number[]=[],W=.26;
  const paint=(x1:number,z1:number,x2:number,z2:number)=>{if(x1===x2&&(x1<b.x0+.2||x1>b.x1-.2)||z1===z2&&z1<b.z0+.2)return;x1=clamp(x1,b.x0,b.x1);x2=clamp(x2,b.x0,b.x1);z1=Math.max(z1,b.z0);z2=Math.max(z2,b.z0);if(x1===x2&&z1===z2)return;const ax=Math.min(x1,x2)-(x1===x2?W/2:0),bx=Math.max(x1,x2)+(x1===x2?W/2:0),az=Math.min(z1,z2)-(z1===z2?W/2:0),bz=Math.max(z1,z2)+(z1===z2?W/2:0);quads.push(ax,bz,bx,bz,bx,az,ax,az);};
  paint(-hw,half,hw,half);paint(-hw,-half,-hw,half);paint(hw,-half,hw,half);
  const boxDepth=Math.min(16.5,L*.36),boxHalf=Math.min(hw-.5,gw/2+11),six=Math.min(5.5,boxDepth*.35),sixHalf=gw/2+Math.min(5.5,boxHalf-gw/2-1);
  paint(-boxHalf,half-boxDepth,boxHalf,half-boxDepth);paint(-boxHalf,half-boxDepth,-boxHalf,half);paint(boxHalf,half-boxDepth,boxHalf,half);
  paint(-sixHalf,half-six,sixHalf,half-six);paint(-sixHalf,half-six,-sixHalf,half);paint(sixHalf,half-six,sixHalf,half);
  {const z=half-Math.min(11,boxDepth*.66);quads.push(-.17,z+.17,.17,z+.17,.17,z-.17,-.17,z-.17);}
  if(L>=40)paint(-hw,-half+.05,hw,-half+.05);
  {const n=quads.length/8,pos=new Float32Array(n*12),nor=new Float32Array(n*12),index:number[]=[];for(let i=0;i<n;i++){for(let k=0;k<4;k++){pos[i*12+k*3]=quads[i*8+k*2];pos[i*12+k*3+2]=quads[i*8+k*2+1];nor[i*12+k*3+1]=1;}const a=i*4;index.push(a,a+1,a+2,a,a+2,a+3);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setIndex(index);
   const shade=new T.Mesh(g,lineShadeMat);shade.position.set(-.13,.02,-.11);shade.renderOrder=1;const lines=new T.Mesh(g,lineMat);lines.name='pass-puzzle-paper-lines';lines.position.y=.03;lines.receiveShadow=true;pitch.add(shade,lines);}
  // Everything round the pitch (beach, surf, sea, kerb, boards, palms, the coach's cones): two merged meshes (one receives shadows, one casts them), ink hulls baked in.
  const side=pitchSideGeometry(hw,L,fr.view),set=new T.Mesh(side.ground,setMat),props=new T.Mesh(side.props,setMat);set.name='pass-puzzle-ground';set.receiveShadow=true;props.name='pass-puzzle-pitch-side';props.castShadow=true;pitch.add(set,props);
  // The painted horizon stands beyond the water, square to the view (sky bands, the sun cut as discs, headlands): one unlit quad.
  {const W=520,H=150,d=side.shore+150,g=new T.PlaneGeometry(W,H),far=new T.Mesh(g,coastMat);far.name='pass-puzzle-horizon';far.position.set(fr.cx+fr.dx*d,GROUND_Y+H*.5-H*.2,fr.cz+fr.dz*d);far.rotation.y=Math.atan2(fr.dx,fr.dz)+Math.PI;pitch.add(far);horizon={mesh:far,shore:side.shore};}
  // The goal: inked posts and a line net.
  const goal=goalGeometry(gw,crossbar(gw)*Y_SCALE,half),frame=new T.Mesh(goal.frame,pieceMat);frame.name='pass-puzzle-goal';frame.castShadow=true;const netLines=new T.LineSegments(goal.net,netMat);netLines.name='pass-puzzle-net';pitch.add(frame,netLines);
  {const attribute=goal.net.getAttribute('position') as T.BufferAttribute;net={attribute,rest:new Float32Array(attribute.array),hit:0,x:0,y:.8,z:half};}
  // The low sun sits far and to the left of this view (long shadows toward the coach); its shadow frustum hugs this pitch.
  sunDirection(fr.view,sunDir);
  if(sun){const r=Math.max(bw/2+10,(b.z1-b.z0)/2+11)*1.04,c=sun.shadow.camera;sun.target.position.set(xc,0,zc);sun.position.set(xc+sunDir.x*PUZZLE_SUN.distance,sunDir.y*PUZZLE_SUN.distance,zc+sunDir.z*PUZZLE_SUN.distance);c.left=-r;c.right=r;c.top=r;c.bottom=-r;c.updateProjectionMatrix();}
  offsideLine.scale.x=hw*2;dashTexture.repeat.set(hw*2/1.9,1);
  sweeperZone.visible=!!s.keeper?.sweeper;for(const m of sweeperEdge)m.visible=sweeperZone.visible;if(s.keeper?.sweeper){const zw=gw+24,zd=16;sweeperZone.scale.set(zw,zd,1);sweeperZone.position.set(0,.036,half-zd/2);
   sweeperEdge[0].position.set(-zw/2,.04,half-zd);sweeperEdge[0].rotation.y=Math.PI/2;sweeperEdge[0].scale.set(.34,1,zw);for(const i of [1,2]){sweeperEdge[i].position.set(i===1?-zw/2:zw/2,.04,half-zd);sweeperEdge[i].rotation.y=0;sweeperEdge[i].scale.set(.34,1,zd);}}
  if(s.require.finish==='reach-zone'&&s.require.zone){const z=s.require.zone;zoneRing.visible=true;zoneRing.position.set(z.x,.04,z.z);zoneRing.scale.setScalar(z.r*1.22);}else zoneRing.visible=false;
 }

 function load(s:Scenario){
  stop=null;cutMark.scale.setScalar(CUT);endOut.scale.setScalar(CUT);cutMark.visible=endOut.visible=false;scenario=s;elapsed=0;flagged=[];calledOffside=-1;reactAge.fill(-1);prevMode.length=0;for(let i=0;i<arrows.length;i++)arrows[i].g.visible=false;hint=null;hintRing.visible=hintDot.visible=false;setScan(null);goalAge=keeperDiveAge=-1;keeperWasDiving=false;trailHead=trailCount=trailClock=trailLife=0;liveTrail.count=0;clearBeats();hideDots();wipeHistory();strokeArmed=false;buildPitch(s);for(const a of everyone())a.rig.root.visible=false;
  const numbers=shirtNumbersFor(s);let flag=0;
  attackers=s.attackers.slice(0,MAX_TEAM).map((_,i)=>newActor('attack',i,flag++,numbers.attackers[i]));defenders=s.defenders.slice(0,MAX_TEAM).map((_,i)=>newActor('defend',i,flag++,numbers.defenders[i]));keeper=s.keeper?newActor('keeper',0,flag++,numbers.keeper):null;
  for(const a of everyone()){a.rig.root.visible=true;a.rig.root.position.y=0;a.rig.resetPose();}rigShadows.count=flag;blobs.count=1+flag;flagGeo.setDrawRange(0,flag*6);
  for(const a of everyone()){const r=flagUV(a.team,a.number),k=a.flag*8;flagUv.array.set([r.u0,r.v0,r.u1,r.v0,r.u1,r.v1,r.u0,r.v1],k);}flagUv.needsUpdate=true;
  fit();
 }

 // Seated coach's view from behind the attack: fixed pitch angle, distance solved on load/resize only.
 const base={pos:new T.Vector3(),target:new T.Vector3()},focus=new T.Vector3(),corner=new T.Vector3();let replayFocus:T.Vector3|null=null,replayAmount=0;
 // Nov 11 2026 (owner, tablet: "the controls cover the players"): the frame-up reserves the HUD's REAL boxes, measured from the DOM by the
 // game (PassPuzzleGame measureRoom: the control tray, the top bar, the Endless chips) and passed in as screen insets. A change of tray
 // (Shoot opens its sliders, rotation) re-fits with a short eased move, instant under reduced motion; the move ends and the game sleeps.
 let room:FitRoom|null=null;const view={x:0,y:0,w:1,h:1},glide={t:1,dur:.34,pos:new T.Vector3(),ox:0,oy:0,toPos:new T.Vector3(),tox:0,toy:0};
 function fit(next?:FitRoom|null,smooth=false){
  if(next!==undefined)room=next;
  const was=scenario&&view.w>1?{pos:base.pos.clone(),ox:glide.t<1?glide.ox+(glide.tox-glide.ox)*easeGlide(glide.t):view.x,oy:glide.t<1?glide.oy+(glide.toy-glide.oy)*easeGlide(glide.t):view.y,w:view.w,h:view.h}:null;
  if(was&&glide.t<1)was.pos.lerpVectors(glide.pos,glide.toPos,easeGlide(glide.t));
  const w=canvas.clientWidth,h=canvas.clientHeight;stage.renderer.setSize(w,h,false);camera.clearViewOffset();camera.aspect=w/Math.max(1,h);camera.zoom=1;camera.updateProjectionMatrix();
  if(!scenario)return;
  const s=scenario,portrait=camera.aspect<.8;if(portrait!==builtPortrait)buildPitch(s);/* the board is cropped for the way it is looked at */
  const fr=framing(s,portrait),{cx,cz,dx,dz}=fr,short=h<520,desk=!portrait&&!short;let pts=fr.pts;base.target.set(cx,0,cz);
  // Each piece's footprint (feet ring and body width, not just its centre) joins the frame-up, so a near player's boots never dip under the tray.
  {const foot:[number,number,number][]=[];for(const p of [...s.attackers,...s.defenders,...(s.keeper?[s.keeper]:[])])for(const [ox,oz] of [[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]]){foot.push([p.x+ox,0,p.z+oz]);foot.push([p.x+ox,HEAD_TOP+1.2,p.z+oz]);}pts=[...pts,...foot];}
  // A wide screen has room for the whole board as an object on the sand: its corners (and a little sand) join the frame-up.
  const play=pts;if(desk){const b=boardBounds(s.pitch.halfWidth,s.pitch.length,fr.view.crop),m=b.frame+2.5;pts=[...pts];for(const x of [b.x0-m,b.x1+m])for(const z of [b.z0-m,b.z1+m])pts.push([x,0,z]);}
  // Upright phone: the play sits between the top props and the control tray, with room under it for the near frame and the sand.
  // Measured room (fitRoom): the HUD insets in px; an upright phone keeps its painted coast band above the play (up to 178 px).
  const R=room,top=R?Math.max(R.top,portrait?Math.min(178,h*.21):0):desk?64:short?56:portrait?178:86,bottom=R?R.bottom:portrait?188:short?108:desk?34:165,left=R?R.left:0,right=R?R.right:0,
   roomY=Math.max(.12,(h-top-bottom)/h),roomX=(portrait?.8:desk?.95:.82)*Math.max(.3,(w-left-right)/w);
  let tilt=portrait?.76:.68;
  const place=(d:number)=>{camera.position.set(cx-dx*Math.cos(tilt)*d,Math.sin(tilt)*d,cz-dz*Math.cos(tilt)*d);camera.lookAt(base.target);camera.updateMatrixWorld();};
  const extent=()=>{let x0=1,x1=-1,y0=1,y1=-1;for(const p of pts){corner.set(p[0],p[1],p[2]).project(camera);x0=Math.min(x0,corner.x);x1=Math.max(x1,corner.x);y0=Math.min(y0,corner.y);y1=Math.max(y1,corner.y);}return{x0,x1,y0,y1};};
  // A player is never framed bigger than a hand's width of the screen (tiny set-ups do not become close-ups).
  const minD=portrait?44:short?30:46;let high=240;
  // Solve the distance; on a phone a play that is wider than it is deep gets a higher seat (up to about 53 degrees) so it still
  // fills the board area instead of leaving a band of empty turf.
  for(const t of portrait?[.76,.84,.92]:[tilt]){tilt=t;let low=4;high=240;
   for(let i=0;i<24;i++){const d=(low+high)/2;place(d);const e=extent();if(e.x1-e.x0<=roomX*2&&e.y1-e.y0<=roomY*2)high=d;else low=d;}
   high=Math.max(high,minD);place(high);const e=extent();if(e.y1-e.y0>=roomY*2*.9)break;}
  // A board much bigger than its play runs off the screen rather than shrinking the players: the play alone never frames smaller than about two thirds of the screen.
  if(desk){const all=pts;pts=play;let low=4,cap=240;for(let i=0;i<24;i++){const d=(low+cap)/2;place(d);const e=extent();if(e.x1-e.x0<=Math.min(1.24,roomX*2)&&e.y1-e.y0<=roomY*1.3)cap=d;else low=d;}const whole=high;high=Math.max(minD,Math.min(high,cap));pts=high<whole-.01?play:all;/* an overflowing board is centred on its play */}
  place(high);base.pos.copy(camera.position);const e=extent();
  // Centre the action in the room between the HUD and the tip (off-centre projection, no second viewport).
  view.x=(e.x0+e.x1)/2*w/2+(right-left)/2;view.y=(bottom-top)/2-(e.y0+e.y1)/2*h/2;view.w=w;view.h=h;camera.far=high+300;
  // The re-fit glide: from where the camera was to the new seat, eased (update() steps it; it ends, so the game goes back to sleep).
  if(smooth&&was&&!stage.reduced&&was.pos.distanceTo(base.pos)+Math.abs(was.ox-view.x)+Math.abs(was.oy-view.y)>.5){glide.pos.copy(was.pos);glide.ox=was.ox;glide.oy=was.oy;glide.toPos.copy(base.pos);glide.tox=view.x;glide.toy=view.y;glide.t=0;applyGlide();}
  else{glide.t=1;camera.setViewOffset(w,h,view.x,view.y,w,h);camera.updateProjectionMatrix();}
  // Upright phone: the seat is too high to ever see a far horizon, so the painted coast stands just behind the boards, square to the
  // lens (a screen-space horizon in effect, as Tennis has): a strip of painted sea, the horizon line, the poster sun and the
  // headlands fill the frame above the pitch. The play keeps its size: it sits 40 px lower, in room the near sand had to spare.
  if(horizon){const m=horizon.mesh,sh=horizon.shore;
   if(portrait){const d=sh+.5,gx=cx+dx*d,gz=cz+dz*d,D=corner.set(gx,GROUND_Y,gz).distanceTo(camera.position),W=2*D*Math.tan(camera.fov*Math.PI/360)*camera.aspect*1.3,H=W/2;
    m.quaternion.copy(camera.quaternion);m.scale.set(W/520,H/150,1);m.position.set(gx,GROUND_Y,gz).addScaledVector(corner.set(0,1,0).applyQuaternion(camera.quaternion),H*.5-Math.max(0,H*.2-2.4));}
   else{m.scale.set(1,1,1);m.rotation.set(0,Math.atan2(dx,dz)+Math.PI,0);m.position.set(cx+dx*(sh+150),GROUND_Y+150*.5-150*.2,cz+dz*(sh+150));}}
  // No haze: the fog range is pushed past everything that is drawn.
  const fog=scene.fog as T.Fog;fog.near=high+500;fog.far=high+1400;
 }
 function easeGlide(t:number){return t<=0?0:t>=1?1:1-Math.pow(1-t,3);}
 function applyGlide(){const k=easeGlide(glide.t);camera.position.lerpVectors(glide.pos,glide.toPos,k);camera.lookAt(base.target);camera.updateMatrixWorld();
  camera.setViewOffset(view.w,view.h,glide.ox+(glide.tox-glide.ox)*k,glide.oy+(glide.toy-glide.oy)*k,view.w,view.h);camera.updateProjectionMatrix();}
 /** Steps the re-fit glide; true while it is still moving (a bounded few frames, never a loop). */
 function stepGlide(dt:number){if(glide.t>=1)return false;glide.t=Math.min(1,glide.t+dt/glide.dur);if(!replayFocus&&!playerCam)applyGlide();else{camera.setViewOffset(view.w,view.h,glide.ox+(glide.tox-glide.ox)*easeGlide(glide.t),glide.oy+(glide.toy-glide.oy)*easeGlide(glide.t),view.w,view.h);camera.updateProjectionMatrix();}return glide.t<1;}
 /** Layout probe (tests): every piece's screen box from feet to flag at the coach's seat, the ball, the goal mouth and the reserved room. */
 function layoutProbe(){if(!scenario)return null;const s=scenario,r=canvas.getBoundingClientRect(),P=(x:number,y:number,z:number)=>{projected.set(x,y,z).project(camera);return{x:r.left+(projected.x+1)/2*r.width,y:r.top+(1-projected.y)/2*r.height};};
  const box=(x:number,z:number,y0:number,y1:number,rad:number)=>{let x0=1e9,x1=-1e9,ya=1e9,yb=-1e9;for(const dx of [-rad,rad])for(const dz of [-rad,rad])for(const y of [y0,y1]){const q=P(x+dx,y,z+dz);x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);ya=Math.min(ya,q.y);yb=Math.max(yb,q.y);}return{x0,x1,y0:ya,y1:yb};};
  const pieces=[...s.attackers.map((p,i)=>({kind:'attacker',i,...box(p.x,p.z,0,HEAD_TOP+.3+.9,.45)})),...s.defenders.map((p,i)=>({kind:'defender',i,...box(p.x,p.z,0,HEAD_TOP+.3+.9,.45)})),...(s.keeper?[{kind:'keeper',i:0,...box(s.keeper.x,s.keeper.z,0,HEAD_TOP+.3+.9,.45)}]:[])];
  const b=s.attackers[s.carrier]??s.attackers[0];const half=s.pitch.length/2,bar=crossbar(s.pitch.goalWidth)*Y_SCALE,g=s.pitch.goalWidth/2;
  const goal=box(0,half,0,bar,0);{const a=P(-g,0,half),d=P(g,bar,half);goal.x0=Math.min(a.x,d.x);goal.x1=Math.max(a.x,d.x);}
  return{room,pieces,ball:box(b.x,b.z,0,BALL_R*2,BALL_R),goal:s.require.finish==='goal'?goal:null,canvas:{x:r.left,y:r.top,w:r.width,h:r.height}};}
 /** Replay camera: ease toward the key moment, a gentle push-in. amount 0..1. */
 const look=new T.Vector3(),push=new T.Vector3();
 function setReplayFocus(point:Vec2|null,amount=0){replayFocus=point?focus.set(point.x,0,point.z):null;replayAmount=replayFocus?amount:0;const t=replayAmount;
  camera.position.copy(base.pos);look.copy(base.target);
  if(replayFocus){look.lerp(replayFocus,t*.7);push.copy(base.pos).sub(base.target).multiplyScalar(.62).add(replayFocus);camera.position.lerp(push,t*.55);}
  camera.lookAt(look);const zoom=1+t*.18;if(camera.zoom!==zoom){camera.zoom=zoom;camera.updateProjectionMatrix();}
 }

 /** Player view for replays: a low camera just behind whoever is about to play the ball, looking at it (a player's-eye view of the pitch). */
 const eye=new T.Vector3(),eyeLook=new T.Vector3(),wantEye=new T.Vector3(),wantLook=new T.Vector3();let playerCam=false;
 function followPlayer(state:PuzzleState|null,dt:number){
  if(!state){if(playerCam){playerCam=false;setReplayFocus(null);}return;}
  const f=state.flight,hero=state.attackers[f?.receiver??state.carrier]??state.attackers[state.carrier],b=state.ball.p;
  const goalZ=(scenario?.pitch.length??0)/2,tx=f?b.x:0,tz=f?b.z:goalZ,dx=tx-hero.p.x,dz=tz-hero.p.z,l=Math.hypot(dx,dz)||1;
  wantEye.set(hero.p.x-dx/l*8.5,5,hero.p.z-dz/l*8.5);wantLook.set(b.x,Math.max(.5,b.y*Y_SCALE),b.z);
  const k=playerCam?1-Math.exp(-dt*5):1;eye.lerp(wantEye,k);eyeLook.lerp(wantLook,k);if(!playerCam){eye.copy(wantEye);eyeLook.copy(wantLook);playerCam=true;}
  camera.position.copy(eye);camera.lookAt(eyeLook);if(camera.zoom!==1){camera.zoom=1;camera.updateProjectionMatrix();}
 }
 function setAim(view:AimView|null,state:PuzzleState){
  const p=view?.prediction;
  // Releasing the pass keeps the ink on the pitch (the 'kick' event commits it); anything else wipes it.
  // Back to choosing with a played line still on the pitch: it joins the rubbed-out history before the live ribbon is wiped (pass 2: this ran too late and never kept one).
  if(strokeCommitted&&state.phase==='aiming')keepStroke();
  if(!(strokeCommitted&&state.phase!=='aiming'&&!p)){ribbonGeo.setDrawRange(0,0);dots.count=0;strokeCommitted=false;if(view)ribbonCount=0;}
  for(const r of threats)r.visible=false;keeperThreat.visible=receiverRing.visible=endGoal.visible=endRest.visible=endOut.visible=aimSpot.visible=aimRing.visible=false;
  const carrier=state.attackers[state.carrier];carrierRing.visible=state.phase==='aiming';if(carrier)carrierRing.position.set(carrier.p.x,.045,carrier.p.z);
  for(const a of attackers)a.called=0;
  flagged=p?.offside?.slice(0,3)??[];placeFlags(state);(receiverRing.material as T.MeshBasicMaterial).color.set(p?.end==='offside'?'#ffb347':PITCH.mark);
  for(let i=0;i<dangerArrows.length;i++)placeDanger(i,null,null);cutMark.visible=false;if(stop)stop.mark.visible=true;/* the failure mark stays until the next try */
  if(!view||!p){return;}
  const status=view.status??'clear';ribbonMat.color.set(LANE_COLOR[status]);ribbonMat.opacity=1;dotMat.color.set(LANE_COLOR[status]);strokeArmed=true;
  // Who can reach it, and where: arrows from the threat defenders, plus a cross where the ball is stopped.
  let shown=0;p.threats.forEach((d,i)=>{const s=state.defenders[d],at=p.threatAt?.[i];if(s&&at&&shown<dangerArrows.length)placeDanger(shown++,s.p,at);});
  if(status==='tight'&&p.closest&&shown<dangerArrows.length){const s=state.defenders[p.closest.defender];if(s)placeDanger(shown++,s.p,p.closest.at,true);}
  const cutAt=p.cut??(p.threats.length&&p.threatAt?.[0]?p.threatAt[0]:null);if(cutAt&&(status==='blocked'||status==='save')){cutMark.visible=true;cutMark.scale.setScalar(CUT);cutMark.position.set(cutAt.x,.07,cutAt.z);}
  // The ink line: the predicted path resampled onto the ribbon, pressed onto the pitch; it thins where the ball is in the air,
  // and paper beads float along that part at the ball's real height.
  const path=p.path,n=path.length;let air=0;
  if(n>1){for(let i=0;i<PATH_DOTS;i++){const f=i/(PATH_DOTS-1)*(n-1),i0=Math.min(n-2,Math.floor(f)),a=path[i0],b=path[i0+1],t=f-i0,qx=a.x+(b.x-a.x)*t,qy=a.y+(b.y-a.y)*t,qz=a.z+(b.z-a.z)*t;let nx=-(b.z-a.z),nz=b.x-a.x;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
    const up=qy>.4,w=(up?.2:.48)*(i===0||i===PATH_DOTS-1?.45:i===1||i===PATH_DOTS-2?.8:1);ribbonPos.setXYZ(i*2,qx-nx*w,.05,qz-nz*w);ribbonPos.setXYZ(i*2+1,qx+nx*w,.05,qz+nz*w);
    if(up&&i%2===0&&air<AIR_DOTS){dummy.position.set(qx,qy*Y_SCALE,qz);dummy.scale.setScalar(.13);dummy.updateMatrix();dots.setMatrixAt(air++,dummy.matrix);}}
   ribbonPos.needsUpdate=true;ribbonGeo.setDrawRange(0,(PATH_DOTS-1)*6);ribbonCount=PATH_DOTS;}
  dots.count=air;if(air)dots.instanceMatrix.needsUpdate=true;
  const end=p.receiveAt??p.path[p.path.length-1];
  if(view.place&&scenario){const gz=scenario.pitch.length/2-.08,r=Math.max(.34,view.place.sigma+.11)*2;aimSpot.visible=aimRing.visible=true;aimSpot.position.set(view.place.x,view.place.y*Y_SCALE,gz);aimRing.position.copy(aimSpot.position);aimSpot.scale.setScalar(1.05);aimRing.scale.setScalar(r);}
  if(end){if(p.end==='goal'&&!view.place){endGoal.visible=true;endGoal.position.set(end.x,.05,Math.min(end.z,(scenario?.pitch.length??0)/2-.3));}else if(p.end==='out'){endOut.visible=true;endOut.position.set(end.x,.06,end.z);}else if(p.end==='rest'&&p.receiver===undefined){endRest.visible=true;endRest.position.set(end.x,.05,end.z);}}
  p.threats.forEach((d,i)=>{const s=state.defenders[d];if(!s||i>=threats.length)return;const r=threats[i];r.visible=true;r.position.set(s.p.x,.04,s.p.z);});
  if(p.keeperThreat&&state.keeper){keeperThreat.visible=true;keeperThreat.position.set(state.keeper.p.x,.04,state.keeper.p.z);}
  const receiver=p.receiver??view.receiver;
  if(receiver!==undefined&&state.attackers[receiver]){const r=state.attackers[receiver];receiverRing.visible=true;receiverRing.position.set(r.p.x,.045,r.p.z);if(attackers[receiver])attackers[receiver].called=1;}
 }

 /** First-time window: a dashed ring around the carrier that shrinks to nothing as the one-touch chance runs out. */
 function setClock(fraction:number|null,state:PuzzleState){const c=state.attackers[state.carrier];clockRing.visible=fraction!==null&&!!c;if(clockRing.visible&&c){clockRing.position.set(c.p.x,.05,c.p.z);clockRing.scale.setScalar((1.2+fraction!*1.1)*RING);(clockRing.material as T.MeshBasicMaterial).opacity=.4+.5*fraction!;}}
 function resetActors(){clearStop();clockRing.visible=false;reactAge.fill(-1);prevMode.length=0;calledOffside=-1;flagged=[];goalAge=keeperDiveAge=-1;keeperWasDiving=false;trailCount=trailHead=trailLife=0;liveTrail.count=0;clearBeats();hideDots();wipeHistory();ribbonGeo.setDrawRange(0,0);strokeArmed=false;
  for(const a of everyone()){a.reactionLeft=a.receiveLeft=a.kickLeft=a.callWave=0;a.dejected=false;a.reaction=null;a.celebrate=null;a.placed=false;a.awake=0;a.o.reaction=undefined;a.o.reactionProgress=undefined;a.o.dive=undefined;a.o.skill=undefined;a.o.receive=0;a.o.charge=0;a.rig.root.position.y=0;a.rig.resetPose();}}
 function react(actor:Actor|undefined,kind:Reaction,squash=0){if(!actor)return;actor.reaction=kind;actor.reactionTotal=actor.reactionLeft=REACTION_SECONDS[kind];if(squash&&!reducedMotion){actor.o.squash=squash;actor.o.squashSerial=(actor.o.squashSerial??0)+1;}}
 /** Mark where the attempt was stopped (null clears it). kind picks the mark; the camera push eases in update(). */
 function showStop(at:Vec2|null,kind:'cut'|'out'|'save'|'offside'='cut'){clearStop();if(!at)return;
  const mark=kind==='out'?endOut:cutMark;if(kind!=='offside'){mark.visible=true;mark.position.set(at.x,kind==='out'?.06:.07,at.z);mark.scale.setScalar(CUT*(reducedMotion?1:1.7));splat.visible=true;splat.position.set(at.x,.055,at.z);splat.rotation.y=at.x*1.7+at.z;splat.scale.setScalar(CUT*(reducedMotion?2.1:.6));}
  stop={at:stopAt.set(at.x,0,at.z),age:reducedMotion?STOP_PUSH:0,mark};if(reducedMotion)mark.scale.setScalar(CUT);}
 function clearStop(){if(!stop)return;stop.mark.scale.setScalar(CUT);stop=null;cutMark.visible=endOut.visible=splat.visible=false;setReplayFocus(null);}
 /** Event → action layer: every touch type is its own player of body language on the rig. */
 let ballVX=0,ballVZ=1;
 function onEvent(e:PuzzleEvent){
  const att=e.attacker!==undefined?attackers[e.attacker]:undefined,def=e.defender!==undefined?defenders[e.defender]:undefined;
  switch(e.type){
   case 'kick':lastKicker=e.attacker??-1;trailCount=trailHead=trailClock=0;trailLife=.35;trailMaterial.color.set(e.kind==='shot'?PITCH.markTight:e.kind==='header'?PITCH.markViolet:passTint);
    // The drawn line stays on the pitch for the ball to follow.
    if(strokeArmed&&ribbonCount>1){ribbonGeo.setDrawRange(0,(PATH_DOTS-1)*6);strokeCommitted=true;}strokeArmed=false;
    if(att){att.kickLeft=KICK_SECONDS;att.o.actionKind=e.kind==='shot'?'shot':'pass';if(e.kind==='header')react(att,'header',.08);}break;
   case 'receive':if(att){if(e.touch==='chest')react(att,'chest',-.1);else if(e.touch==='thigh')react(att,'thigh',-.08);else if(e.touch==='header')react(att,'header',.1);else att.receiveLeft=.45;
    if(!reducedMotion){passPopAge=0;popMat.color.copy(POP_RECEIVE);passPop.visible=true;passPop.position.set(e.at.x,.05,e.at.z);}}break;
   case 'heavy_touch':react(att,'stumble',-.12);break;
   case 'intercept':react(def,(e.speed??0)>9?'slide':'deflect',-.1);stopBy={defender:e.defender??-1,keeper:false};if(!reducedMotion){passPopAge=0;popMat.color.copy(POP_STEAL);passPop.visible=true;passPop.position.set(e.at.x,.05,e.at.z);}break;
   case 'deflect':react(def,'deflect',-.1);stopBy={defender:e.defender??-1,keeper:false};break;
   case 'save':case 'parry':stopBy={defender:-1,keeper:true};if(keeper){if(keeperDiveAge<0){keeperDiveAge=.2;keeperDiveKind='stand';}if(keeperDiveKind==='stand')react(keeper,'deflect',-.1);}break;
   case 'goal':goalAge=0;goalSerial++;assister=-2;scorer=e.attacker??0;for(const r of goalRings)r.position.set(e.at.x,.065,e.at.z-.5);for(const m of goalStars)m.position.set(e.at.x,1.5,e.at.z+.4);for(const d of defenders){react(d,'dejected');d.dejected=true;}if(keeper){react(keeper,'dejected');}
    // A rebound or deflection earlier in the move must not leave an attacker bowed through the celebration.
    for(const a of attackers){a.dejected=false;a.reactionLeft=0;a.reaction=null;}
    // The net bulges where the ball went in; a top-corner finish gets the bigger star.
    goalHigh=e.at.y>1.25?Math.min(1,(e.at.y-1.25)/.8):0;if(goalHigh>0)for(const m of goalStars)m.position.y=Math.max(1.5,e.at.y*Y_SCALE);
    if(net&&!reducedMotion){net.hit=1;net.x=e.at.x;net.y=Math.max(.5,e.at.y*Y_SCALE);}stage.burst(e.at.x,goalHigh>0?e.at.y*Y_SCALE:1.2,e.at.z,goalHigh>.5?5:3);if(!stage.reduced)launchConfetti(e.at.x,e.at.z,(scenario?.pitch.goalWidth??6)*.9);break;
   case 'offside':calledOffside=e.attacker??-1;react(att,'dejected');break;
   case 'out':break;
   // Post or bar: a knock of sparks at the frame (the HUD prints POST! / BAR!).
   case 'woodwork':stage.burst(e.at.x,Math.max(.3,e.at.y*Y_SCALE),e.at.z-.2,3);break;
  }
 }

 const UP=new T.Vector3(0,1,0),axis=new T.Vector3(),qTilt=new T.Quaternion(),qYaw=new T.Quaternion(),quat=new T.Quaternion(),vPos=new T.Vector3(),vScale=new T.Vector3(),mat4=new T.Matrix4();
 // A rig keeps posing for this long after its last cause of motion, so every blend (stance, recovery, turn) settles; then it sleeps.
 const SETTLE=.5,KICK_SECONDS=.46,FOOT_R=.42*RIG_SCALE,headAt=new T.Vector3();
 /** Number flags face the camera at a near-constant screen size, pinned to the top of each (possibly leaning) player. */
 function layFlags(){camera.updateMatrixWorld();const e=camera.matrixWorld.elements,cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
  for(const a of everyone()){const dxp=a.topX-cx,dyp=a.topY-cy,dzp=a.topZ-cz,depth=-(dxp*e[8]+dyp*e[9]+dzp*e[10]),size=Math.max(1.5,depth*.029/camera.zoom),h=size/2,t=((a.number*37+a.slot*11)%7-3)*.03,c=Math.cos(t),s=Math.sin(t);
   const rx=e[0]*c+e[4]*s,ry=e[1]*c+e[5]*s,rz=e[2]*c+e[6]*s,ux=-e[0]*s+e[4]*c,uy=-e[1]*s+e[5]*c,uz=-e[2]*s+e[6]*c,k=a.flag*4,bx=a.topX,by=a.topY-.08,bz=a.topZ;
   flagPos.setXYZ(k,bx-rx*h,by-ry*h,bz-rz*h);flagPos.setXYZ(k+1,bx+rx*h,by+ry*h,bz+rz*h);flagPos.setXYZ(k+2,bx+rx*h+ux*size,by+ry*h+uy*size,bz+rz*h+uz*size);flagPos.setXYZ(k+3,bx-rx*h+ux*size,by-ry*h+uy*size,bz-rz*h+uz*size);}
  flagPos.needsUpdate=true;}
 /** Advance visuals by dt (0 = re-pose only). Returns true while an animation still needs frames. */
 function update(state:PuzzleState,dt:number,idleThinking=false):boolean{
  elapsed+=dt;if(goalAge>=0)goalAge+=dt;let busy=stepGlide(dt);const reduced=stage.reduced,ballP=state.ball.p;
  {const v=state.ball.v,sp=Math.hypot(v.x,v.z);if(sp>.5){ballVX=v.x/sp;ballVZ=v.z/sp;}}
  const pose=(a:Actor,s:{p:Vec2;facing:number},extra:(o:ArcadePoseOptions)=>boolean)=>{
   const o=a.o,moved=!a.placed||Math.abs(s.p.x-a.x)+Math.abs(s.p.z-a.z)>1e-4||Math.abs(s.facing-a.stateFace)>1e-3;let vx=0,vz=0;
   if(dt>0&&a.placed){vx=(s.p.x-a.x)/dt;vz=(s.p.z-a.z)/dt;if(Math.hypot(vx,vz)>40)vx=vz=0;/* a rewind or a retry, not a run */}
   a.speed=Math.hypot(vx,vz);a.x=s.p.x;a.z=s.p.z;a.face=a.stateFace=s.facing;let live=moved;
   if(a.reactionLeft>0){a.reactionLeft=Math.max(0,a.reactionLeft-dt);o.reaction=a.reaction??undefined;o.reactionProgress=1-a.reactionLeft/a.reactionTotal;live=true;if(a.reactionLeft===0&&!a.dejected){a.reaction=null;o.reaction=undefined;o.reactionProgress=undefined;}}
   if(a.receiveLeft>0){a.receiveLeft=Math.max(0,a.receiveLeft-dt);o.receive=a.receiveLeft>0?1:0;o.receiveProgress=1-a.receiveLeft/.45;live=true;}else{o.receive=0;o.receiveProgress=undefined;}
   // The player you are about to pass to raises an arm for a moment ("me!").
   if(a.calledShown!==a.called){a.calledShown=a.called;a.callWave=.9;}
   if(a.callWave>0){a.callWave=Math.max(0,a.callWave-dt);live=true;}
   o.celebrate=a.called;o.charge=0;o.skill=undefined;o.anticipate=0;o.jockey=0;
   if(extra(o))live=true;
   if(live)a.awake=SETTLE;else if(dt>0)a.awake=Math.max(0,a.awake-dt);
   // Only a rig that is moving (or still settling) is posed: the rest keep their last matrices and cost nothing.
   if(live||a.awake>0){o.vx=vx/RIG_SCALE;o.vz=vz/RIG_SCALE;a.rig.root.position.set(a.x,0,a.z);a.rig.pose(a.placed?dt:0,a.speed/RIG_SCALE,a.face,a.kickLeft>0?1:0,0,0,o);a.rig.finalizePose();
    a.rig.head.getWorldPosition(headAt);a.topX=headAt.x;a.topY=Math.max(HEAD_TOP*.55,headAt.y+.4*RIG_SCALE);a.topZ=headAt.z;if(dt>0&&a.awake>0)busy=true;}
   a.placed=true;
   dummy.position.set(a.x,0,a.z);dummy.scale.setScalar(RIG_SCALE);dummy.updateMatrix();rigShadows.setMatrixAt(a.flag,dummy.matrix);
   dummy.position.set(a.x-.12,.034,a.z-.08);dummy.scale.setScalar(1.55);dummy.updateMatrix();blobs.setMatrixAt(1+a.flag,dummy.matrix);
  };
  if(state.flight)flightReceiver=state.flight.receiver??-1;
  // The assist: whoever played the pass the scorer finished (none for a direct shot or a solo rebound).
  if(goalAge>=0&&assister===-2){const c=state.chain,last=c[c.length-1],prev=c[c.length-2];assister=last&&last.kicker===scorer&&prev&&prev.kicker!==scorer?prev.kicker:-1;}
  // The fail beat starts on the first moving frame of a failed attempt (not after a goal that broke a rule).
  if(state.phase==='fail'&&failAge<0&&dt>0&&goalAge<0){failAge=0;
   for(const k of new Set([lastKicker,flightReceiver])){const a=attackers[k];if(a&&!a.dejected){react(a,'dejected');a.dejected=true;}}}
  else if(failAge>=0&&failAge<2.8)failAge+=dt;
  if(failAge>=0&&failAge<2.8)busy=true;
  const winnerLen=SKILL_MOVES.fistBump.seconds;
  state.attackers.forEach((s,i)=>{const a=attackers[i];if(!a)return;pose(a,s,o=>{let live=false;
   const pending=state.pending&&state.pending.kicker===i?state.pending:null;a.celebrate=null;
   // Anticipation: the passer turns to the target, plants and draws the leg back while the kick winds up; the 'kick' event swings it through.
   if(pending){const k=pending.kick,u=1-pending.left/Math.max(.001,pending.total);a.face=Math.atan2(k.target.x-s.p.x,k.target.z-s.p.z);o.actionKind=k.kind==='shot'?'shot':k.loft>.35?'loft':'pass';o.shotPower=k.power;o.charge=u*(.35+.65*k.power);live=busy=true;}
   else if(a.kickLeft>0){a.kickLeft=Math.max(0,a.kickLeft-dt);live=busy=true;}
   if(goalAge>=0&&goalAge<CELEBRATE_SECONDS){
    // Each move at its authored length; teammates join a beat later, turned toward the scorer.
    const c=celebrations[i%celebrations.length];c.type=celebrationFor(i,scorer,assister,goalSerial);const len=SKILL_MOVES[c.type].seconds,age=goalAge-(i===scorer?0:.18+(i%3)*.08);
    if(age>=0&&age<len){c.progress=age/len;a.celebrate=c.type;o.skill=c;}
    if(i!==scorer){const sc=state.attackers[scorer];if(sc)a.face=Math.atan2(sc.p.x-s.p.x,sc.p.z-s.p.z);}
    live=busy=true;}
   // The intended receiver opens up to the ball while it travels (turns to it in the approach pose, before first contact).
   else if(state.phase==='flight'&&state.flight?.receiver===i&&a.receiveLeft<=0&&!pending){a.face=Math.atan2(ballP.x-s.p.x,ballP.z-s.p.z);o.receive=1;o.receiveProgress=0;live=true;}
   return live;});});
  state.defenders.forEach((s,i)=>{const a=defenders[i];if(!a)return;pose(a,s,o=>{let live=false;
   // Defenders stand ready on their toes, jockey when they press, and the one who won the ball pumps a fist.
   o.anticipate=s.mode==='intercept'?.4:.65;o.jockey=s.mode==='press'?.6:0;
   if(stopBy.defender===i&&!stopBy.keeper&&failAge>=.6&&failAge-.6<winnerLen){winnerMotion.progress=(failAge-.6)/winnerLen;o.skill=winnerMotion;live=busy=true;}
   return live;});});
  if(keeper&&state.keeper){const k=state.keeper,diving=k.mode==='dive';
   if(diving&&!keeperWasDiving&&keeperDiveAge<0){keeperDiveAge=0;keeperDiveDir=k.diveDir>0?1:-1;const saveY=state.flight?.aim?state.flight.aim.y:ballP.y;/* a placed shot: dive to the height it is going to, not where the ball is now */keeperDiveKind=saveY<.55?'collapse':saveY>1.8?'tip':'side';keeperDive.dir=k.diveDir>0?-1:1;keeperDive.kind=keeperDiveKind as typeof keeperDive.kind;keeperDive.height=Math.min(1,saveY/2.5);keeperDive.outcome='parry';}keeperWasDiving=diving;
   if(keeperDiveAge>=0){keeperDiveAge+=dt;keeperDive.progress=Math.min(1,keeperDiveAge/1.05);busy=true;if(keeperDiveAge>1.2)keeperDiveAge=-1;}
   pose(keeper,k,o=>{let live=keeperDiveAge>=0;
    // The rig owns the dive: set, push off the near foot, hands leading, land, roll and get up. A standing save only flinches.
    o.keeper=1;o.anticipate=keeperDiveAge<0?.75:0;o.dive=keeperDiveAge>=0&&keeperDiveKind!=='stand'?keeperDive:undefined;
    if(stopBy.keeper&&keeperDiveAge<0&&failAge>=1.3&&failAge-1.3<winnerLen){winnerMotion.progress=(failAge-1.3)/winnerLen;o.skill=winnerMotion;live=busy=true;}
    return live;});
  }
  rigShadows.instanceMatrix.needsUpdate=true;
  // Ball: held at the carrier's feet while aiming, otherwise the engine's flight.
  // A ball at a player's feet rests against the boots instead of sinking into them.
  let bx=ballP.x,bz=ballP.z;const ballY=Math.max(BALL_R,ballP.y*Y_SCALE);
  if(ballY<1.2)for(const a of everyone()){const dx=bx-a.x,dz=bz-a.z,d=Math.hypot(dx,dz),min=FOOT_R+BALL_R*.8;if(d<min){const ux=d>.02?dx/d:Math.sin(a.face),uz=d>.02?dz/d:Math.cos(a.face);bx=a.x+ux*min;bz=a.z+uz*min;}}
  ball.position.set(bx,ballY,bz);
  // It rolls: spun about the axis across its path, by the distance it covered (a little under true, so the panels do not strobe at 30 fps).
  if(dt>0){const v=state.ball.v,speed=Math.hypot(v.x,v.z);if(speed>.05){qTilt.setFromAxisAngle(axis.set(v.z/speed,0,-v.x/speed),Math.min(.9,speed*dt/BALL_R*.6));ball.quaternion.premultiply(qTilt);}}
  dummy.position.set(bx-.05-ballP.y*.3,.036,bz-.03-ballP.y*.12);dummy.scale.setScalar(.62/(1+ballP.y*.25));dummy.updateMatrix();blobs.setMatrixAt(0,dummy.matrix);blobs.instanceMatrix.needsUpdate=true;
  layFlags();
  const flying=state.phase==='flight'&&Math.hypot(state.ball.v.x,state.ball.v.y,state.ball.v.z)>3;
  if(flying&&!reduced){trailLife=.3;trailClock+=dt;if(trailClock>=1/60){trailClock%=1/60;trailPoints[trailHead*3]=ball.position.x;trailPoints[trailHead*3+1]=ball.position.y;trailPoints[trailHead*3+2]=ball.position.z;trailHead=(trailHead+1)%24;trailCount=Math.min(24,trailCount+1);}}
  else trailLife=Math.max(0,trailLife-dt);
  liveTrail.count=reduced?0:trailLife>0?trailCount:0;
  for(let i=0;i<liveTrail.count;i++){const index=(trailHead-1-i+24)%24;const lane=(index%3)-1,k=(1-i/24)*Math.min(1,trailLife/.3);dummy.position.fromArray(trailPoints,index*3);dummy.position.x+=ballVZ*lane*.3;dummy.position.z-=ballVX*lane*.3;dummy.rotation.set(0,Math.atan2(ballVX,ballVZ),0);dummy.scale.set(.03+.09*k,.03+.05*k,(lane?.7:1.25)*(.35+k));dummy.updateMatrix();liveTrail.setMatrixAt(i,dummy.matrix);}dummy.rotation.set(0,0,0);if(liveTrail.count){liveTrail.instanceMatrix.needsUpdate=true;busy=true;}
  // The committed ink line fades a little once the ball has gone, so the next decision reads cleanly.
  if(strokeArmed&&!strokeCommitted&&ribbonCount>1&&state.phase==='windup'){ribbonGeo.setDrawRange(0,(PATH_DOTS-1)*6);strokeCommitted=true;strokeArmed=false;}
  if(strokeCommitted){if(state.phase==='aiming'){keepStroke();hideDots();ribbonGeo.setDrawRange(0,0);}else if(dt>0&&ribbonMat.opacity>.5){ribbonMat.opacity=Math.max(.5,ribbonMat.opacity-dt*.5);busy=true;}}
  for(let i=0;i<goalStars.length;i++){const m=goalStars[i],age=goalAge-i*.03;m.visible=goalAge>=0&&age>=0&&age<(reduced?1:.62);if(m.visible){const pop=reduced?1:Math.min(1,age/.08),out=reduced?0:Math.max(0,(age-.44)/.18);m.quaternion.copy(camera.quaternion);m.rotateZ(i*.26+(reduced?0:age*.5));m.scale.setScalar((i?2.5:3.2)*(1+.5*goalHigh)*(pop*(1.18-.18*Math.min(1,age/.22)))*(1-out));busy=true;}}
  for(let i=0;i<goalRings.length;i++){const ring=goalRings[i],age=goalAge-i*.12;ring.visible=!reduced&&goalAge>=0&&age>=0&&age<.9;if(ring.visible){ring.scale.setScalar((1+age*5)*RING);ring.rotation.y=i*.6;(ring.material as T.MeshBasicMaterial).opacity=(1-age/.9)*.9;busy=true;}}
  // Confetti: drag-limited fall with a paper flutter; each dot lies flat where it lands and stays there (no frames once all are down).
  if(confettiAge>=0&&dt>0){confettiAge+=dt;if(reduced){confettiAge=-1;confetti.count=0;}else{const drag=Math.exp(-dt*1.6),done=confettiAge>=CONFETTI_LIFE;
   for(let i=0;i<CONFETTI;i++){const j=i*3,down=done||confettiP[j+1]<=.05;
    if(!down){confettiV[j+1]-=dt*4.2;confettiV[j]*=drag;confettiV[j+1]*=drag;confettiV[j+2]*=drag;confettiP[j]+=(confettiV[j]+Math.sin(confettiAge*5+i)*.6)*dt;confettiP[j+1]=Math.max(.05,confettiP[j+1]+confettiV[j+1]*dt);confettiP[j+2]+=confettiV[j+2]*dt;}
    dummy.position.set(confettiP[j],down?.05+i*.0006:confettiP[j+1],confettiP[j+2]);if(down)dummy.rotation.set(-Math.PI/2,0,i*.7);else dummy.rotation.set(confettiSpin[i]*confettiAge,i*.7,confettiSpin[i]*confettiAge*.6);dummy.scale.setScalar(1);dummy.updateMatrix();confetti.setMatrixAt(i,dummy.matrix);}
   dummy.rotation.set(0,0,0);confetti.instanceMatrix.needsUpdate=true;if(done)confettiAge=-1;else busy=true;}}
  if(passPopAge>=0&&dt>0){passPopAge+=dt;const u=passPopAge/.5;if(u>=1){passPopAge=-1;passPop.visible=false;}else{passPop.scale.setScalar((1+u*1.3)*RING);(passPop.material as T.MeshBasicMaterial).opacity=.95*(1-u)*(1-u);busy=true;}}
  if(net&&(net.hit>0)){net.hit=Math.max(0,net.hit-dt*.9);const t=1-net.hit,amount=net.hit>0?Math.sin(t*14)*Math.exp(-t*3.8)*.5:0;for(let i=0;i<net.rest.length;i+=3){const x=net.rest[i],y=net.rest[i+1],z=net.rest[i+2],fall=Math.exp(-((x-net.x)**2+(y-net.y)**2)*.4);net.attribute.setZ(i/3,z+(z>net.z+.1?amount*fall:0));}net.attribute.needsUpdate=true;busy=true;}
  stage.effects(dt);if(stage.effectsActive())busy=true;
  // Heat: the stage's spark pool and the pass ribbon are skipped while they have nothing to draw (a draw call each otherwise).
  if(sparks)sparks.visible=stage.effectsActive();ribbon.visible=ribbonGeo.drawRange.count>0;
  // The failure beat: the stop mark settles from a pop and the camera leans in (none with reduced motion).
  if(stop&&dt>0&&stop.age<STOP_PUSH){stop.age=Math.min(STOP_PUSH,stop.age+dt);const u=stop.age/STOP_PUSH,e=u*u*(3-2*u);stop.mark.scale.setScalar(CUT*(1+.7*(1-u)*(1-u)));if(splat.visible)splat.scale.setScalar(CUT*(.6+1.5*Math.min(1,u*3.2)*(1+.25*(1-u)*(1-u))));setReplayFocus({x:stop.at.x,z:stop.at.z},e*.65);busy=true;}
  if(state.phase!=='aiming'){carrierRing.visible=false;}
  // The scan reads the frozen moment: once the ball is struck it fades off the pitch instead of lying stale over the ink (visual only).
  if(scanShown&&state.phase!=='aiming'){scanFade=dt>0?Math.max(0,scanFade-dt*5):0;if(scanFade<=0)setScan(null);else{scanFaded(scanFade);busy=true;}}
  // The line shows while the pass is being chosen and struck (defenders shift during the wind-up).
  const line=scenario?.require.offside&&(state.phase==='aiming'||state.phase==='windup')?lineOf(state):-1;
  offsideLine.visible=line>0&&line<(scenario?.pitch.length??0)/2-.2;if(offsideLine.visible)offsideLine.position.set(0,.042,line);
  if(state.phase==='flight')flagged=[];placeFlags(state);
  if(placeIntents(state,dt))busy=true;
  if(state.phase!=='aiming'){for(let i=0;i<arrows.length;i++)arrows[i].g.visible=false;hintRing.visible=hintDot.visible=false;
   // Replay: an arrow on each called or scripted run while the runner is still going.
   if(replayRuns){let n=0;state.attackers.forEach((a,i)=>{if(n>=4)return;const to=a.call&&a.call.startAt!=null?a.call.to:a.mode==='run'?(scenario?.attackers[i]?.run?.path.at(-1)??null):null;if(to&&Math.hypot(to.x-a.p.x,to.z-a.p.z)>1.2)placeArrow(n++,a.p,to);});}
  }else if(hint){hintRing.visible=hintDot.visible=true;
   // Round 3: the best-pass hint is revealed slowly: a ink dot rolls from the ball to the spot and the ring opens.
   if(hintAge>=0&&hintAge<HINT_REVEAL){hintAge=Math.min(HINT_REVEAL,hintAge+dt);const u=hintAge/HINT_REVEAL,e=u*u*(3-2*u);
    hintDot.position.set(ballP.x+(hint.spot.x-ballP.x)*e,.06,ballP.z+(hint.spot.z-ballP.z)*e);hintRing.scale.setScalar((.2+1.1*e)*RING);busy=true;}
   else{hintDot.position.set(hint.spot.x,.05,hint.spot.z);hintRing.scale.setScalar(1.3*RING);}}
  return busy;
 }
 const ray=new T.Raycaster(),ndc=new T.Vector2(),ground=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
 function pick(clientX:number,clientY:number,bounds?:DOMRect):Vec2|null{const r=bounds??canvas.getBoundingClientRect();ndc.set((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);ray.setFromCamera(ndc,camera);const p=ray.ray.intersectPlane(ground,hit);return p?{x:p.x,z:p.z}:null;}
 const projected=new T.Vector3();
 /** Aim anywhere: where the pointer's ray meets the goal face (pitch x, metres up; y <= 0 means the finger is on the grass in front), with the
  *  height of the frame on screen in CSS px there (the caller widens a small goal's aim). Pure maths on input, no render. */
 const goalPlane=new T.Plane(new T.Vector3(0,0,-1),0),goalHit=new T.Vector3();
 function pickGoal(clientX:number,clientY:number,bounds?:DOMRect):{x:number;y:number;barPx:number}|null{if(!scenario)return null;const r=bounds??canvas.getBoundingClientRect(),gz=scenario.pitch.length/2,bar=crossbar(scenario.pitch.goalWidth);ndc.set((clientX-r.left)/r.width*2-1,1-(clientY-r.top)/r.height*2);ray.setFromCamera(ndc,camera);goalPlane.constant=gz;const p=ray.ray.intersectPlane(goalPlane,goalHit);if(!p)return null;const x=p.x,y=p.y/Y_SCALE;
  projected.set(x,0,gz).project(camera);const y0=projected.y;projected.set(x,bar*Y_SCALE,gz).project(camera);return{x,y,barPx:Math.abs(projected.y-y0)/2*r.height};}
 function toScreen(x:number,y:number,z:number){const r=canvas.getBoundingClientRect();projected.set(x,y,z).project(camera);return{x:(projected.x+1)/2*r.width,y:(1-projected.y)/2*r.height};}
 /** Test/inspection hook: what the aim overlay is showing right now. */
 /** The rim follows the sun in view space, so it is re-aimed for the camera of every frame that is drawn. */
 function render(){aimComicSun(ink,sunDir,camera);stage.render();}
 function debug(){return{keeperDiveAge,goalAge,trailCount:liveTrail.count,keeperRootRoll:0,keeperLean:0,keeperDive:keeperDiveAge>=0?+keeperDive.progress.toFixed(2):null,strokePoints:0,strokeEnd:null,pathDots:ribbonGeo.drawRange.count>0?ribbonCount:0,strokeCommitted,threatRings:threats.filter(r=>r.visible).length+(keeperThreat.visible?1:0),receiverRing:receiverRing.visible,called:attackers.map(a=>a.called),clock:clockRing.visible,arrows:arrows.filter(a=>a.g.visible).length,intents:intents.filter(i=>i.visible).length,sweeperZone:sweeperZone.visible,offsideLine:offsideLine.visible?+offsideLine.position.z.toFixed(2):null,flags:flags.filter(f=>f.visible).length,end:endGoal.visible?'goal':endOut.visible?'out':endRest.visible?'rest':null,zoom:camera.zoom,dangerArrows:dangerArrows.filter(a=>a.g.visible).length,cut:cutMark.visible,hint:hintRing.visible,stop:stop?{x:+stop.at.x.toFixed(2),z:+stop.at.z.toFixed(2),age:+stop.age.toFixed(2)}:null,scan:scanLanes.filter(l=>l.g.visible).length,pathColor:'#'+ribbonMat.color.getHexString(),confetti:confetti.count,passPop:passPop.visible,failAge:+failAge.toFixed(2),assister,celebrations:goalAge>=0&&goalAge<CELEBRATE_SECONDS?attackers.map(a=>a.celebrate):null,pieces:everyone().length,rigs:rigPool.attack.length+rigPool.defend.length+rigPool.keeper.length,awake:everyone().filter(a=>a.awake>0).length,motion:everyone().map(a=>[+a.speed.toFixed(2),+a.awake.toFixed(2),a.reaction??a.celebrate??'']),historyLines:history.filter(m=>m.visible).length,scanFade:+scanFade.toFixed(2)};}
 function dispose(){stripeMaterials.forEach(m=>m.dispose());confettiGeo.dispose();confettiMat.dispose();confetti.dispose();new Set(Object.values(scanMats)).forEach(m=>m.dispose());markGeos.forEach(g=>g.dispose());Object.values(intentTextures).forEach(t=>t.dispose());Object.values(intentMaterials).forEach(m=>m.dispose());arrowMat.dispose();shaftGeo.dispose();headGeo.dispose();dangerMat.dispose();nearMat.dispose();dashTexture.dispose();flagTexture.dispose();flagMaterial.dispose();
  rigShadows.geometry.dispose();(rigShadows.material as T.Material).dispose();rigShadows.dispose();blobs.dispose();dots.dispose();liveTrail.dispose();
  // Every mark and painted canvas lives in the scene, and the bean rigs belong to the stage (stage.player), so the stage's walk and
  // its own rig disposal free the geometries, materials and textures; the comic clones of the rig materials are freed here; the shared maps are named here too in case nothing visible was using them.
  stage.dispose();for(const m of rigMats.values())m.dispose();rigMats.clear();coast.dispose();coastMat.dispose();starGeo.dispose();for(const m of goalStars)(m.material as T.Material).dispose();marks.dispose();flagsMap.dispose();setMat.dispose();pieceMat.dispose();apronMat.dispose();lineMat.dispose();lineShadeMat.dispose();netMat.dispose();}
 return{stage,debug,setTier,load,fit,layoutProbe,update,setAim,clearStroke,setClock,setCalls,setHint,setScan,setReplayRuns,followPlayer,onEvent,resetActors,showStop,setReplayFocus,pick,pickGoal,toScreen,render,dispose,get replayAmount(){return replayAmount;}};
}
export type PassPuzzleScene=ReturnType<typeof createPassPuzzleScene>;
