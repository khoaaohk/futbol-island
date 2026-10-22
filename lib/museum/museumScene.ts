import * as T from 'three';
import {wearBackpack} from '@/lib/graphics/backpack';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createPlayer,profileFor,type PlayerMotion} from '../graphics/player';
import {loadCustomization,beanLookFor,playerOutfit} from '../town/customization';
import {getQuizProgress} from '../town/quizProgress';
import {npcDress} from '../town/beanLooks';
import {frameCapSlot} from '../town/frameCap';
import {tierSettings} from '../graphics/heatTier';
import {EXHIBITS,GALLERIES,galleryOf,timelineOrder,type Exhibit} from '../endgame/museum';
import {easeZoom,ZOOM_IN_SECONDS,ZOOM_OUT_SECONDS} from '../konbini/konbiniZoom';
import {createStuckWatch} from '../konbini/konbiniPath';
import {BALL_PLINTH,ROOM,WING,FLOOR,CASE,CASE_PLACES,DESK,GUIDE,TIMELINE,KIT_WALL,WING_PARTITION,GALLERY_SIGNS,ZOOM_STOPS,museumPois,museumObstacles,museumBlocked,findMuseumPath,type MuseumPoi} from './museumLayout';
import {paintMuseumAtlas,ATLAS,SIGN_RECTS,SIGN_ASPECT,PLACARD,placardRect,TIMELINE_RECT,KIT_RECTS,DESK_RECT,GLOW_RECT,accentOf,type Rect} from './museumAtlas';
import {museumSfx} from './museumSound';
import {createExhibitSculptures,SCULPTURE_TOP} from './museumExhibits';
import {createBallMaterial} from './wcBalls/ballViewer';
import {ballDesign} from './wcBalls/designs';
import {museumRoomHooks,type MuseumHookSource} from '../multiplayer/rooms/museumHooks';
import {museumWalls,MUSEUM_LIGHT,WALL_TONES,SKIRT_H,RIM_H,LIP,AO_WIDTH,faceAlbedo,toneFor,addCutaway,cutUniforms,updateCut,type WallSpec} from './museumWalls';

/**
 * The walk-in History Museum interior (Oct 3 2026; docs/performance-guide.md "Walk-in History Museum"). The Konbini recipe:
 * an orthographic iso camera from the front-left corner, every box ONE merged vertex-coloured Lambert mesh, every printed thing
 * ONE merged unlit mesh on one canvas atlas (museumAtlas.ts), the vitrine glass ONE mesh, the doors one 2-instance mesh; two
 * lights, no shadow maps (soft contact shadows: ONE merged mesh on a 64² gradient). Oct 10 2026: restyled as a modern gallery
 * (docs/museum-modern-style.md): gallery white, pale concrete with hairline joints, white plinths on shadow gaps, Swiss wall
 * labels, and one sculpture per case (museumExhibits.ts: still, recognisable objects merged into the static mesh; Oct 13 2026). The World Cup ball
 * plinth is unchanged. No music; the loop runs only while something moves and sleeps otherwise; phones are capped at 30 fps
 * with the heat tier's pixel-ratio and frame caps; dispose() frees everything.
 */
export type MuseumZoomView={index:number;count:number;id:string;label:string;arrived:boolean};
/** Oct 14 2026: the Your Collection wing (found balls, cards, books, certificates) is gone; the hall only needs which cases are open. */
export type MuseumSceneInput={open:Readonly<Record<string,boolean>>};
type Cam={pos:T.Vector3;look:T.Vector3;hw:number;hh:number};
/** `piece`: a case, framed from its wall label (`bot`) to the top of its sculpture (`top`), clear of the card. */
type Stop={id:string;label:string;x:number;y:number;z:number;yaw:number;w:number;h:number;elev:number;piece?:{top:number;bot:number}};

/** The modern gallery (Oct 10 2026; docs/museum-modern-style.md): gallery white, pale concrete, ink, hairlines. */
/** Remote-only frame rate on phones (design 3.2; MUSEUM_ROOM.wake.remoteFpsPhone). */
const MUSEUM_REMOTE_FPS=20;
const P={ground:'#f6f4ef',floor:'#dcd8cf',joint:'#cfcac0',wall:'#f7f5f0',reveal:'#cbc7be',plinth:'#fbfaf7',ink:'#1d1d1b',hair:'#d9d6cf',wood:'#e9e6df'};

export function createMuseumScene(canvas:HTMLCanvasElement,input:MuseumSceneInput,callbacks:{
 onNear?:(poi:MuseumPoi|null)=>void;onPrompt?:(x:number,y:number,visible:boolean)=>void;onArrive?:(poi:MuseumPoi)=>void;onExit?:()=>void;
 onZoom?:(view:MuseumZoomView|null)=>void;onFirstFrame?:()=>void;onZoomArrive?:(id:string)=>void;
 /** The walk-through timeline: the case whose year tile you stand on (null when you step off). */
 onTimeline?:(id:string|null)=>void;}={}){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 const pixelRatio=()=>Math.min(devicePixelRatio||1,mobile?Math.min(1.5,tierSettings().maxPixelRatio):Math.min(2,tierSettings().maxPixelRatio));
 renderer.setPixelRatio(pixelRatio());renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color(P.ground);
 const camera=new T.OrthographicCamera(-8,8,6,-6,.1,80);
 // Gallery light: an even, neutral white wash from above (no warm cast), one key from the front left for form.
 scene.add(new T.HemisphereLight(MUSEUM_LIGHT.sky,MUSEUM_LIGHT.ground,MUSEUM_LIGHT.hemi));const sun=new T.DirectionalLight(MUSEUM_LIGHT.sun,MUSEUM_LIGHT.sunIntensity);sun.position.set(...MUSEUM_LIGHT.sunPos);scene.add(sun);

 // ---- Shared materials + atlas ---------------------------------------------------------------------------------------------
 const atlasCanvas=paintMuseumAtlas(document.createElement('canvas'),input.open);const atlas=new T.CanvasTexture(atlasCanvas);atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=2;
 const printMat=new T.MeshBasicMaterial({map:atlas,alphaTest:.4,side:T.DoubleSide});
 const staticMat=new T.MeshLambertMaterial({vertexColors:true});
 const glassMat=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.34,depthWrite:false});
 const boxes:T.BufferGeometry[]=[],glass:T.BufferGeometry[]=[],prints:T.BufferGeometry[]=[],shades:T.BufferGeometry[]=[],glows:T.BufferGeometry[]=[];
 const color=new T.Color(),m=new T.Matrix4(),q=new T.Quaternion(),euler=new T.Euler(),v=new T.Vector3(),one=new T.Vector3(1,1,1),sv=new T.Vector3();
 /** Colour a geometry, place it, and add it to the merged static mesh (everything non-indexed so the merge always matches). */
 function add(geo:T.BufferGeometry,x:number,y:number,z:number,hex:string,rx=0,ry=0,rz=0,s=1,target=boxes){
  let g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();
  q.setFromEuler(euler.set(rx,ry,rz,'YXZ'));m.compose(v.set(x,y,z),q,sv.set(s,s,s));g.applyMatrix4(m);
  if(target===boxes&&!g.attributes.color){color.set(hex);const n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++){c[i*3]=color.r;c[i*3+1]=color.g;c[i*3+2]=color.b;}g.setAttribute('color',new T.BufferAttribute(c,3));}
  else g.deleteAttribute('uv');
  if(!g.attributes.uv&&target===boxes)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  target.push(g);return g;
 }
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,hex:string,ry=0)=>add(new T.BoxGeometry(w,h,d),x,y,z,hex,0,ry);
 /** A printed quad from the atlas; `ry` turns it to face that way (0 = +z). */
 function print(r:Rect,x:number,y:number,z:number,w:number,h:number,ry=0,rx=0){
  const g=new T.PlaneGeometry(w,h),uv=g.attributes.uv as T.BufferAttribute,u0=r.x/ATLAS,u1=(r.x+r.w)/ATLAS,v1=1-r.y/ATLAS,v0=1-(r.y+r.h)/ATLAS;
  uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);q.setFromEuler(euler.set(rx,ry,0,'YXZ'));m.compose(v.set(x,y,z),q,one);g.applyMatrix4(m);
  g.setAttribute('aCut',new T.BufferAttribute(new Float32Array(4).fill(onWall),1));prints.push(g);
 }
 /** 1 while building things hung on a wall (signs, frames, shirts): they are cut away round the player with their wall. */
 let onWall=0;
 /** A soft contact shadow (the ball gallery's sweep shadow): a flat quad on the soft-shadow texture, all merged into ONE mesh. */
 function shade(x:number,y:number,z:number,rx:number,rz=rx){const g=new T.PlaneGeometry(rx*2,rz*2);g.rotateX(-Math.PI/2);g.translate(x,y,z);shades.push(g);}
 const mix=(a:string,b:string,k:number)=>'#'+new T.Color(a).lerp(new T.Color(b),k).getHexString();

 // ---- Room shell: the main hall plus the west wing (four history galleries) through a wide opening (an L, like the building) --
 const W=ROOM.halfW,D=ROOM.halfD,H=ROOM.wallH,WX0=WING.x0,WX1=WING.x1,WZ1=WING.z1,WW=WX1-WX0,WCX=(WX0+WX1)/2,WCZ=(WZ1-D)/2,WD=WZ1+D;
 // Pale polished concrete, one plane each for hall and wing, with hairline joints on a 2 m grid.
 {const f=(w:number,d:number,x:number,z:number)=>{const g=new T.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);add(g,x,.012,z,P.floor);};f(W*2,D*2,0,0);f(WW,WD,WCX,WCZ);
  const joint=(w:number,d:number,x:number,z:number)=>{const g=new T.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);add(g,x,.014,z,P.joint);};
  for(let xx=-W+2;xx<W;xx+=2)joint(.018,D*2,xx,0);for(let zz=-D+2;zz<D;zz+=2)joint(W*2,.018,0,zz);
  for(let xx=WX0+1.5;xx<WX1;xx+=2)joint(.018,WD,xx,WCZ);for(let zz=-D+2;zz<WZ1;zz+=2)joint(WW,.018,WCX,zz);}
 box(W*2+.4,.12,D*2+.4,0,-.06,0,P.joint);box(WW+.4,.12,WD+.4,WCX,-.06,WCZ,P.joint);
 // Walls (Oct 14 2026, user: "fix this wall, it blends in and hard to tell it's a wall"; lib/museum/museumWalls.ts): the shell,
 // the opening's stubs and lintel, the low kit-wall partition (open central aisle, a gap by the wing opening) and the low front
 // sills (the camera looks in over them, as at the Konbini). Every face is baked to its on-screen tone (lit faces warm white,
 // shaded faces a soft grey darker than the floor, the cap brightest), with a muted-ink rim round the top, a darker skirting line
 // at the foot and a soft contact-shadow band on the floor. All of it joins the static and soft-shadow meshes (no extra draws);
 // wall fragments carry aCut = 1 for the cutaway round the player.
 const nrm=new T.Vector3();
 function wallBox(w:number,h:number,d:number,x:number,y:number,z:number,tone:(n:T.Vector3)=>string){
  const g=new T.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);const n=g.attributes.position.count,nr=g.attributes.normal as T.BufferAttribute,c=new Float32Array(n*3);
  for(let i=0;i<n;i+=6){nrm.fromBufferAttribute(nr,i);const a=faceAlbedo(tone(nrm),nrm);for(let k=i;k<i+6;k++){c[k*3]=a.r;c[k*3+1]=a.g;c[k*3+2]=a.b;}}
  g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('aCut',new T.BufferAttribute(new Float32Array(n).fill(1),1));boxes.push(g);}
 /** A contact-shadow band along one foot: u at the gradient's centre column, v from its darkest (.5, at the wall) to clear (1). */
 function aoBand(s:WallSpec,a:WallSpec['ao'][number]){
  const alongX=a.side[1]==='z',sign=a.side[0]==='+'?1:-1,len=Math.abs(a.b-a.a),mid=(a.a+a.b)/2,face=alongX?s.z+sign*s.d/2:s.x+sign*s.w/2;
  const g=new T.PlaneGeometry(alongX?len:AO_WIDTH,alongX?AO_WIDTH:len);g.rotateX(-Math.PI/2);const p=g.attributes.position as T.BufferAttribute,uv=g.attributes.uv as T.BufferAttribute;
  for(let i=0;i<p.count;i++)uv.setXY(i,.5,(alongX?p.getZ(i):p.getX(i))*sign>0?1:.5);
  g.translate(alongX?mid:face+sign*AO_WIDTH/2,.015,alongX?face+sign*AO_WIDTH/2:mid);shades.push(g);}
 // (The wing's low partition, Oct 14 2026: Firsts behind it, Rules & tactics in front, is in museumWalls() with the rest.)
 for(const s of museumWalls()){const top=s.y0+s.h;
  wallBox(s.w,s.h,s.d,s.x,s.y0+s.h/2,s.z,n=>WALL_TONES[toneFor(n)]);
  wallBox(s.w+LIP*2,RIM_H,s.d+LIP*2,s.x,top-RIM_H/2+.002,s.z,n=>n.y>.5?WALL_TONES.cap:WALL_TONES.rim);
  if(s.skirt)wallBox(s.w+LIP*2,SKIRT_H,s.d+LIP*2,s.x,s.y0+SKIRT_H/2,s.z,()=>WALL_TONES.skirt);
  for(const a of s.ao)aoBand(s,a);}
 box(2.6,.012,.4,ROOM.doorX,.018,D+.05,P.joint);
 const doorGeo=new T.BoxGeometry(ROOM.doorHalf-.04,2.4,.05),doors=new T.InstancedMesh(doorGeo,glassMat,2);doors.frustumCulled=false;scene.add(doors);
 const doorFrame=new T.Object3D();let doorOpen=1,doorTarget=1;
 function placeDoors(){for(let i=0;i<2;i++){const s=i?1:-1;doorFrame.position.set(ROOM.doorX+s*(ROOM.doorHalf/2+doorOpen*(ROOM.doorHalf-.1)),1.25,D+.02);doorFrame.updateMatrix();doors.setMatrixAt(i,doorFrame.matrix);}doors.instanceMatrix.needsUpdate=true;}
 placeDoors();
 // Gallery wall panels (title in the sans, one accent rule). Hung on walls: cut away with them round the player.
 onWall=1;
 // Oct 14 2026: one sign per gallery (museumLayout GALLERY_SIGNS), the wing's four included; the kit wall keeps its small label.
 for(const [id,g] of Object.entries(GALLERY_SIGNS))if(SIGN_RECTS[id]){const h=g.w*SIGN_ASPECT;
  // a free-standing sign: a white board on two slim ink legs, the print on its front (all merged: no draw of its own)
  if(g.stand){box(g.w+.08,h+.08,.04,g.x,g.y,g.z-.025,P.plinth);for(const s of [-1,1])box(.025,g.y-h/2,.025,g.x+s*(g.w/2-.08),(g.y-h/2)/2,g.z-.025,P.ink);}
  print(SIGN_RECTS[id],g.x,g.y,g.z,g.w,h,g.ry);}
 print(SIGN_RECTS.kit,-2.75,1.16,ROOM.partitionZ+.135,1.7,1.7*SIGN_ASPECT);

 // ---- Timeline wall, kit wall, information desk -----------------------------------------------------------------------------
 print(TIMELINE_RECT,TIMELINE.x,TIMELINE.y,TIMELINE.z,TIMELINE.w,TIMELINE.w*TIMELINE_RECT.h/TIMELINE_RECT.w);
 KIT_WALL.xs.forEach((x,i)=>print(KIT_RECTS[i],x,KIT_WALL.y,KIT_WALL.z,.8,.8));
 onWall=0;
 box(DESK.w,DESK.h,DESK.d,DESK.x,DESK.h/2,DESK.z,P.plinth);box(DESK.w-.06,.04,DESK.d-.06,DESK.x,.02,DESK.z,P.reveal);print(DESK_RECT,DESK.x,.7,DESK.z+DESK.d/2+.004,1.5,.43);
 shade(DESK.x,.016,DESK.z+.08,DESK.w*.72,DESK.d*.9);

 // ---- Exhibit plinths ----------------------------------------------------------------------------------------------------------
 const TOP=CASE.plinthH+.04;
 // The sculptures (lib/museum/museumExhibits.ts): one still object per open case, merged into the static mesh.
 // Pieces that should read as lit (the floodlight heads) are unlit prints on the atlas's glow swatch: no extra draw.
 const glowUv=[(GLOW_RECT.x+GLOW_RECT.w/2)/ATLAS,1-(GLOW_RECT.y+GLOW_RECT.h/2)/ATLAS];
 const exhibits=createExhibitSculptures({open:input.open,add:(geo,x,y,z,hex,rx,ry,rz,s)=>add(geo,x,y,z,hex,rx,ry,rz,s),shadow:(x,y,z,rx,rz)=>shade(x,y,z,rx,rz),
  glow:geo=>{const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
   const n=g.attributes.position.count,uv=new Float32Array(n*2);for(let i=0;i<n;i++){uv[i*2]=glowUv[0];uv[i*2+1]=glowUv[1];}g.setAttribute('uv',new T.BufferAttribute(uv,2));
   g.setAttribute('aCut',new T.BufferAttribute(new Float32Array(n),1));glows.push(g);}});
 // The World Cup ball plinth (Oct 5 2026): a round pedestal with the 2026 ball on a brass cup; looking at it opens the gallery.
 {const P=BALL_PLINTH;add(new T.CylinderGeometry(P.r,P.r*1.08,P.h,28),P.x,P.h/2,P.z,'#294f43');add(new T.CylinderGeometry(P.r*1.12,P.r*1.12,.05,28),P.x,P.h+.025,P.z,'#e7b94a');
  add(new T.CylinderGeometry(.11,.15,.06,20),P.x,P.h+.08,P.z,'#e7b94a');add(new T.CylinderGeometry(P.r*1.14,P.r*1.14,.04,28),P.x,.02,P.z,'#e7b94a');
  const ballMat=createBallMaterial(ballDesign('2026-trionda'));const bm=new T.Mesh(new T.SphereGeometry(P.ball,48,32),ballMat);bm.position.set(P.x,P.h+.11+P.ball,P.z);bm.quaternion.setFromUnitVectors(new T.Vector3(1,1,-1).normalize(),new T.Vector3(-.35,.75,.75).normalize());/* the three colour waves face the hall camera (the plain 4th panel faces away) */bm.name='museum-wc-ball';scene.add(bm);}
 // "Stand where they stood": a single ink spot on the floor in front of the penalty case.
 {const p=CASE_PLACES['penalty-1891'];add(new T.CylinderGeometry(.06,.06,.006,20),p.x,.016,p.z+1.1,P.ink);}
 EXHIBITS.forEach((e,i)=>{const p=CASE_PLACES[e.id],isOpen=!!input.open[e.id];if(!p)return;// a case without a place yet is not built
  // A white plinth floating on a recessed shadow-gap base, a soft floor shadow, and its wall label on the front face.
  box(CASE.w-.06,.04,CASE.d-.06,p.x,.02,p.z,P.reveal);box(CASE.w,TOP-.04,CASE.d,p.x,.04+(TOP-.04)/2,p.z,P.plinth);
  shade(p.x,.016,p.z+.06,CASE.w*.82,CASE.d*.82);
  print(placardRect(i),p.x,TOP-.17,p.z+CASE.d/2+.004,.5,.5*PLACARD.h/PLACARD.w);
  if(isOpen&&exhibits.built.has(e.id))return;
  // Not yet on view: a frosted acrylic vitrine, empty.
  add(new T.BoxGeometry(CASE.w-.1,CASE.glassH,CASE.d-.1),p.x,TOP+CASE.glassH/2,p.z,'',0,0,0,1,glass);box(CASE.w-.1,.012,CASE.d-.1,p.x,TOP+.006,p.z,P.hair);
 });

 // ---- Merge static, glass and prints ---------------------------------------------------------------------------------------
 // ---- The walk-through timeline: a runner of year tiles along the back wall. Step on a year: its tile glows, a beam of light
 // finds that case across the room, and the year + title pop up (the cases' own years and titles; nothing new).
 const TL=timelineOrder().filter(e=>CASE_PLACES[e.id]),tileW=Math.min(.4,7.4/TL.length),tileX0=-(TL.length-1)*tileW/2,tileZ=TIMELINE.z+.95;
 TL.forEach((e,i)=>{box(tileW-.04,.012,.5,tileX0+i*tileW,.02,tileZ,input.open[e.id]?mix(accentOf(e.gallery),P.floor,.6):P.hair);});
 const tileGlow=new T.Mesh(new T.BoxGeometry(tileW-.02,.02,.52),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.75}));tileGlow.visible=false;tileGlow.name='museum-timeline-glow';scene.add(tileGlow);
 const beam=new T.Mesh(new T.CylinderGeometry(.35,.6,3.2,20,1,true),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide}));beam.visible=false;beam.name='museum-timeline-beam';scene.add(beam);
 let tileIndex=-1;
 function stepTimeline(){const i=Math.abs(z-tileZ)<.35&&Math.abs(x-tileX0-(TL.length-1)*tileW/2)<TL.length*tileW/2?Math.round((x-tileX0)/tileW):-1;const idx=i>=0&&i<TL.length?i:-1;if(idx===tileIndex)return;tileIndex=idx;
  if(idx<0){tileGlow.visible=beam.visible=false;callbacks.onTimeline?.(null);return;}const e=TL[idx],c=CASE_PLACES[e.id];tileGlow.visible=true;tileGlow.position.set(tileX0+idx*tileW,.035,tileZ);
  beam.visible=true;beam.position.set(c.x,1.6,c.z);museumSfx.flap();callbacks.onTimeline?.(e.id);}
 // The cutaway (museumWalls.ts): walls and what hangs on them, in front of the player within a small ellipse round them, are
 // dithered away, so a wall between the camera and the player never hides or slices them. Two uniforms, set per rendered frame.
 const cut=cutUniforms();
 for(const g of boxes)if(!g.attributes.aCut)g.setAttribute('aCut',new T.BufferAttribute(new Float32Array(g.attributes.position.count),1));
 const wallMat=staticMat.clone();addCutaway(wallMat,cut);addCutaway(printMat,cut);
 const staticMesh=new T.Mesh(mergeGeometries(boxes,false)!,wallMat);staticMesh.name='museum-static';scene.add(staticMesh);
 // (Every open case is a sculpture, with no vitrine: an empty glass list gets an empty mesh.)
 const glassMesh=new T.Mesh(glass.length?mergeGeometries(glass,false)!:new T.BufferGeometry(),glassMat);glassMesh.renderOrder=2;scene.add(glassMesh);
 const printMesh=new T.Mesh(mergeGeometries(glows.length?[...prints,...glows.map(g=>{const ix=new T.BufferGeometry();for(const k of Object.keys(g.attributes))ix.setAttribute(k,g.attributes[k]);ix.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));return ix;})]:prints,false)!,printMat);printMesh.name='museum-prints';scene.add(printMesh);
 // Soft contact shadows: one radial-gradient texture (64²), every plinth, desk and sculpture shadow in ONE transparent mesh.
 const shadeCanvas=document.createElement('canvas');shadeCanvas.width=shadeCanvas.height=64;{const g=shadeCanvas.getContext('2d');if(g){const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.26)');gr.addColorStop(.45,'rgba(0,0,0,.12)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);}}
 const shadeTex=new T.CanvasTexture(shadeCanvas);
 const shadeMesh=new T.Mesh(shades.length?mergeGeometries(shades,false)!:new T.BufferGeometry(),new T.MeshBasicMaterial({map:shadeTex,color:'#2a2722',transparent:true,depthWrite:false}));shadeMesh.name='museum-shadows';shadeMesh.renderOrder=1;scene.add(shadeMesh);
 for(const g of [...boxes,...glass,...prints,...shades,...glows])g.dispose();
 staticMesh.matrixAutoUpdate=glassMesh.matrixAutoUpdate=printMesh.matrixAutoUpdate=shadeMesh.matrixAutoUpdate=false;staticMesh.updateMatrix();glassMesh.updateMatrix();printMesh.updateMatrix();shadeMesh.updateMatrix();

 // ---- Characters -------------------------------------------------------------------------------------------------------------
 const shadowGeo=new T.CircleGeometry(1,24),shadowMat=new T.MeshBasicMaterial({color:'#2a2722',transparent:true,opacity:.16,depthWrite:false});
 const disc=(s:number)=>{const d=new T.Mesh(shadowGeo,shadowMat);d.rotation.x=-Math.PI/2;d.scale.set(s,s*.7,1);scene.add(d);return d;};
 const progress=getQuizProgress(),custom=loadCustomization(progress.completed,progress.total);
 const player=createPlayer('you','home',true,true);player.setAppearance(custom);player.setBeanLook(beanLookFor(custom),playerOutfit(custom));const pack=wearBackpack(player.root,playerOutfit(custom));/* Oct 21 2026: the always-worn pack, folded (docs/backpack.md) */player.root.name='museum-player';scene.add(player.root);const playerShadow=disc(.42);
 const guide=createPlayer('museum-guide-ada','neutral',true,true);guide.setProfile(profileFor('npc',44));
 {const d=npcDress({id:'museum-guide-ada',role:'Museum guide',character:'female',face:'deep',clothing:'classic'});d.look.headwear='none';guide.setBeanLook(d.look,{...d.outfit,shirt:P.ink,shirt2:P.plinth});}
 guide.root.name='museum-guide';scene.add(guide.root);const guideShadow=disc(.42);guideShadow.position.set(GUIDE.x,.03,GUIDE.z);
 const guideMotion:PlayerMotion={travelMode:'walk',facing:GUIDE.yaw,lookY:1.4,ready:.1};

 // ---- State ------------------------------------------------------------------------------------------------------------------
 const obstacles=museumObstacles(),pois=museumPois(),camYaw=-.36;
 const blocked=(px:number,pz:number,r=.3)=>museumBlocked(px,pz,obstacles,r);
 let x:number=ROOM.doorX,z=D+.2,vx=0,vz=0,yaw=Math.PI,time=0,frame=0,last=0,slot=0,disposed=false,covered=false,leaving=false,settle=1,draws=0,frames=0,greet=reduced?0:1.8,stride=0,steps=0;
 let leaveStarted=0,firstFrameSent=false,remoteOnly=false;const stuck=createStuckWatch(.5);
 let target:{x:number;z:number}|null=null,route:{x:number;z:number}[]=[],arrivePoi:MuseumPoi|null=null,near:MuseumPoi|null=null,promptVisible=false;
 let cameraX=0,cameraZ=0,halfW=8,halfH=6,viewportW=1,viewportH=1,viewportLeft=0,viewportTop=0;
 const keys=new Set<string>(),stick={x:0,z:0},motion:PlayerMotion={travelMode:'walk'};
 const ray=new T.Raycaster(),pointer=new T.Vector2(),floor=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3(),projected=new T.Vector3(),tmpPos=new T.Vector3(),tmpLook=new T.Vector3(),curLook=new T.Vector3();
 const frameMs=()=>{const t=tierSettings();return mobile?Math.max(1000/30,t.frameMs):t.cap30Everywhere?t.frameMs:0;};
 // Telstar spin (drag, ⟲ ⟳ buttons): a little inertia, then it sleeps. Reduced motion: it turns only while you drag / per press.
 // The ball and the boot are the two sculpture pieces with a mesh of their own (one draw call each), on the static mesh's material.
 let spinV=0,spinTurns=0,rain=false;
 let telstar:T.Mesh|null=null;
 for(const o of exhibits.solo){const mesh=new T.Mesh(o.geometry,staticMat);mesh.position.set(o.x,o.y,o.z);mesh.rotation.set(o.rx,o.ry,0);mesh.scale.setScalar(o.s);mesh.name=o.name;
  if(o.name==='museum-telstar')telstar=mesh;else{mesh.matrixAutoUpdate=false;mesh.updateMatrix();}scene.add(mesh);}

 // ---- Zoom (the vending/Konbini close-up: an eased orthographic move onto the real case) ------------------------------------
 const stops:Stop[]=ZOOM_STOPS.map(id=>{
  if(id==='timeline')return {id,label:'Timeline wall',x:TIMELINE.x,y:TIMELINE.y,z:TIMELINE.z,yaw:0,w:TIMELINE.w,h:TIMELINE.h+.3,elev:.12};
  const e=EXHIBITS.find(x=>x.id===id)!,p=CASE_PLACES[id];
  // A case (Oct 13 2026: every case opens on its full card): the sculpture and its wall label, as big as the room beside or above
  // the card allows. The stadium is seen from higher up, so you look into the bowl.
  return {id,label:e.title,x:p.x,y:TOP,z:p.z,yaw:0,w:CASE.w,h:1,elev:id==='stadiums'?.5:.22,piece:{top:TOP+(input.open[id]?SCULPTURE_TOP[id]??.62:CASE.glassH+.04),bot:TOP-.3}};});
 const ZD=9;let zoomIndex:number|null=null,zoom:{from:Cam;to:number|null;t:number;dur:number}|null=null,arrived=false;
 const walkCam=():Cam=>({pos:new T.Vector3(cameraX+Math.sin(camYaw)*12.5,10.8,cameraZ+Math.cos(camYaw)*12.5),look:new T.Vector3(cameraX,.6,cameraZ),hw:halfW,hh:halfH});
 const snapshot=():Cam=>({pos:camera.position.clone(),look:curLook.clone(),hw:camera.right,hh:camera.top});
 function zoomCam(s:Stop):Cam{
  const a=viewportW/Math.max(1,viewportH),yv=s.yaw-.14,look=new T.Vector3(s.x,s.y,s.z);
  let hw=s.w/2*1.08+.12,hh=s.h/2*1.1+.15;if(hw/hh>a)hh=hw/a;else hw=hh*a;
  // Leave room for the exhibit card: below the case on portrait, beside it (right) on landscape.
  if(s.piece){const ce=Math.cos(s.elev),span=(s.piece.top-s.piece.bot)*ce+.08,mid=(s.piece.top+s.piece.bot)/2;
   if(a<1.2){
    // Portrait (the card fills the bottom 46 %): the piece sits in the band between the header (13 %) and the card (53 %), centred
    // at 33 %, as big as the band allows while the sculpture stays clear of the side arrows (the middle 66 % of the width).
    hh=Math.max(span/.8,(s.w/2+.2)/.66/a);hw=hh*a;look.y=mid-.34*hh/ce;}
   else{
    // Landscape (the card on the right): the piece fills ~60 % of the height, centred a third of the way across.
    const short=viewportH<=520;hh=span/(short?1.1:1.2);hw=hh*a;const rx=Math.cos(yv),rz=-Math.sin(yv),k=short?.4:.34;look.x+=rx*hw*k;look.z+=rz*hw*k;look.y=mid-(short?.02:.06)*hh/ce;}}
  else if(a<1){hh*=1.14;hw=hh*a;look.y-=hh*.4;}
  else{hw*=1.65;hh=hw/a;const rx=Math.cos(yv),rz=-Math.sin(yv);look.x+=rx*hw*.4;look.z+=rz*hw*.4;look.y-=hh*.06;}
  return {pos:look.clone().add(new T.Vector3(Math.sin(yv)*Math.cos(s.elev),Math.sin(s.elev),Math.cos(yv)*Math.cos(s.elev)).multiplyScalar(ZD)),look,hw,hh};
 }
 function applyCam(pos:T.Vector3,look:T.Vector3,hw:number,hh:number){camera.position.copy(pos);camera.lookAt(look);curLook.copy(look);if(camera.right!==hw||camera.top!==hh){camera.left=-hw;camera.right=hw;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();}camera.updateMatrixWorld();}
 function setClip(zoomed:boolean){const n=zoomed?ZD-1.3:.1,f=zoomed?ZD+6:90;if(camera.near!==n||camera.far!==f){camera.near=n;camera.far=f;camera.updateProjectionMatrix();}}
 const zoomView=():MuseumZoomView|null=>zoomIndex===null?null:{index:zoomIndex,count:stops.length,id:stops[zoomIndex].id,label:stops[zoomIndex].label,arrived};
 function zoomToIndex(i:number,dur=ZOOM_IN_SECONDS){if(i<0||i>=stops.length||leaving)return;const from=snapshot();setClip(false);zoom={from,to:i,t:0,dur};zoomIndex=i;arrived=false;spinV=0;
  keys.clear();stick.x=stick.z=0;target=null;route=[];arrivePoi=null;if(near){near=null;callbacks.onNear?.(null);}callbacks.onZoom?.(zoomView());wake();}
 function zoomOut(){if(zoomIndex===null)return;const from=snapshot();setClip(false);zoom={from,to:null,t:0,dur:ZOOM_OUT_SECONDS};arrived=false;spinV=0;callbacks.onZoom?.(zoomView());wake();}

 function collide(){for(let pass=0;pass<2;pass++)for(const o of obstacles){const r=.3;if(x>o.minX-r&&x<o.maxX+r&&z>o.minZ-r&&z<o.maxZ+r){const dl=x-(o.minX-r),dr=o.maxX+r-x,db=z-(o.minZ-r),df=o.maxZ+r-z,mn=Math.min(dl,dr,db,df);if(mn===dl)x=o.minX-r;else if(mn===dr)x=o.maxX+r;else if(mn===db)z=o.minZ-r;else z=o.maxZ+r;}}
  x=T.MathUtils.clamp(x,FLOOR.minX+.6,W-.6);z=T.MathUtils.clamp(z,-D+.6,x<WX1?WZ1-.6:Math.abs(x-ROOM.doorX)<ROOM.doorHalf-.15?D+.5:D-.6);}
 const findPath=(tx:number,tz:number)=>findMuseumPath({x,z},{x:tx,z:tz},(a,b)=>blocked(a,b));
 const segPoint=(p:MuseumPoi,px:number,pz:number)=>{const dx=p.b.x-p.a.x,dz=p.b.z-p.a.z,l=dx*dx+dz*dz||1,t=T.MathUtils.clamp(((px-p.a.x)*dx+(pz-p.a.z)*dz)/l,0,1);return {x:p.a.x+dx*t,z:p.a.z+dz*t};};
 function nearest(){let best:MuseumPoi|null=null,dist=1.2;for(const p of pois){const s=segPoint(p,x,z),d=Math.hypot(s.x-x,s.z-z);if(d<dist){dist=d;best=p;}}return best;}
 function walkToPoi(p:MuseumPoi){const s=segPoint(p,x,z);if(Math.hypot(s.x-x,s.z-z)<.3){target=null;route=[];arrivePoi=null;yaw=Math.atan2(p.face.x-x,p.face.z-z);wake();callbacks.onArrive?.(p);return;}route=findPath(s.x,s.z);target=route.shift()??{x:s.x,z:s.z};arrivePoi=p;wake();}

 function tick(now:number){frame=0;if(disposed||covered||document.hidden)return;
  // Friends-only frames (room party layer, docs/multiplayer-rooms-design.md 3.2): 20 fps on phones; never without a layer.
  const interval=remoteOnly&&mobile?Math.max(1000/MUSEUM_REMOTE_FPS,frameMs()):frameMs();if(interval>0){const next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(tick);return;}slot=next;}
  const dt=Math.max(.001,Math.min(.05,last?(now-last)/1000:1/60));last=now;time+=dt;frames++;
  const zoomed=zoomIndex!==null;
  let ix=zoomed?0:stick.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),iz=zoomed?0:stick.z+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(ix||iz){target=null;route=[];arrivePoi=null;}
  else if(target){const dx=target.x-x,dz=target.z-z,d=Math.hypot(dx,dz);
   if(!leaving&&!leaveStarted&&stuck.step(target,d,dt)){target=null;route=[];arrivePoi=null;stuck.reset();}
   else if(d<.12){target=route.shift()??null;if(!target&&arrivePoi){const p=arrivePoi;arrivePoi=null;yaw=Math.atan2(p.face.x-x,p.face.z-z);callbacks.onArrive?.(p);}}else{ix=dx/d*Math.min(1,d*2.2);iz=dz/d*Math.min(1,d*2.2);}}
  // Museum pace: a calm walk (no running in the galleries).
  const len=Math.max(1,Math.hypot(ix,iz)),resp=1-Math.exp(-dt*12),top=3;vx+=(ix/len*top-vx)*resp;vz+=(iz/len*top-vz)*resp;
  const ox=x,oz=z;x+=vx*dt;z+=vz*dt;collide();vx=(x-ox)/dt;vz=(z-oz)/dt;const speed=Math.hypot(vx,vz);
  // Soft footsteps on the wood, one per stride, only while walking.
  stride+=speed*dt;if(speed>.4&&stride>.62){stride=0;steps++;if(!leaving)museumSfx.footstep();}
  if(!leaving&&leaveStarted&&performance.now()-leaveStarted>4000){x=ROOM.doorX;z=D+.1;vz=1;}
  if(!leaving&&z>D-.1&&Math.abs(x-ROOM.doorX)<ROOM.doorHalf&&vz>.15){leaving=true;keys.clear();stick.x=stick.z=0;target=null;route=[];doorTarget=1;callbacks.onExit?.();}
  if(Math.hypot(ix,iz)>.08)yaw=Math.atan2(ix,iz);
  doorTarget=leaving||Math.hypot(x-ROOM.doorX,z-D)<2.4?1:0;const prevDoor=doorOpen;doorOpen=reduced?doorTarget:T.MathUtils.damp(doorOpen,doorTarget,7,dt);if(Math.abs(doorOpen-doorTarget)<.003)doorOpen=doorTarget;if(doorOpen!==prevDoor)placeDoors();
  motion.facing=yaw;motion.intentHeading=speed>.08?Math.atan2(vx,vz):undefined;motion.stopDistance=target?Math.hypot(target.x-x,target.z-z):undefined;motion.dribbling=false;
  player.update(x,z,dt,time,reduced,motion);playerShadow.position.set(x,.03,z);
  // The guide faces you when you're close and waves hello on arrival.
  greet=Math.max(0,greet-dt);const gd=Math.hypot(x-GUIDE.x,z-GUIDE.z),wantFace=gd<5?Math.atan2(x-GUIDE.x,z-GUIDE.z):GUIDE.yaw;
  const gf=guideMotion.facing??GUIDE.yaw,turn=Math.atan2(Math.sin(wantFace-gf),Math.cos(wantFace-gf));guideMotion.facing=Math.abs(turn)<.002?wantFace:gf+turn*(1-Math.exp(-dt*6));
  guideMotion.called=greet>0?Math.sin(Math.min(1,greet/1.8)*Math.PI)*.9:0;guideMotion.lookX=gd<5?x:undefined;guideMotion.lookZ=gd<5?z:undefined;guide.setExpression(greet>0||gd<2.6?'happy':'neutral');
  guide.update(GUIDE.x,GUIDE.z,dt,time,reduced,guideMotion);
  // Telstar inertia.
  if(telstar&&spinV){telstar.rotation.y+=spinV*dt;spinTurns+=Math.abs(spinV*dt);spinV*=Math.exp(-dt*2.4);if(Math.abs(spinV)<.05)spinV=0;}
  const n=leaving||zoomed?null:nearest();if(n!==near){near=n;callbacks.onNear?.(n);}
  const follow=reduced?1:1-Math.exp(-dt*5),cx=camX(),cz=camZ();cameraX+=(cx-cameraX)*follow;cameraZ+=(cz-cameraZ)*follow;
  if(zoom){zoom.t=reduced?1:Math.min(1,zoom.t+dt/zoom.dur);const A=zoom.from,B=zoom.to!==null?zoomCam(stops[zoom.to]):walkCam(),k=easeZoom(zoom.t);
   applyCam(tmpPos.lerpVectors(A.pos,B.pos,k),tmpLook.lerpVectors(A.look,B.look,k),A.hw+(B.hw-A.hw)*k,A.hh+(B.hh-A.hh)*k);
   if(zoom.t>=1){if(zoom.to===null){zoom=null;zoomIndex=null;arrived=false;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();placeCamera();callbacks.onZoom?.(null);}
    else{zoom=null;arrived=true;setClip(true);callbacks.onZoom?.(zoomView());if(zoomIndex!==null){callbacks.onZoomArrive?.(stops[zoomIndex].id);}}}}
  else if(zoomIndex!==null){const c=zoomCam(stops[zoomIndex]);applyCam(c.pos,c.look,c.hw,c.hh);}
  else placeCamera();
  const hidePlayer=zoomIndex!==null&&(zoom===null||(zoom.to!==null?zoom.t>.35:zoom.t<.6));player.root.visible=playerShadow.visible=!hidePlayer;
  if(near&&!zoomed){const c=segPoint(near,x,z);projected.set((c.x+near.face.x)/2,2.4,(c.z+near.face.z)/2).project(camera);const vis=Math.abs(projected.x)<.92&&projected.y<.85&&projected.y>-.8;callbacks.onPrompt?.((projected.x*.5+.5)*viewportW,(-projected.y*.5+.5)*viewportH,vis);promptVisible=vis;}else if(promptVisible){promptVisible=false;callbacks.onPrompt?.(0,0,false);}
  if(!leaving)stepTimeline();
  // Friends in the room (no-op false until a room party layer attaches: lib/multiplayer/rooms/museumHooks.ts).
  const remote=museumRoomHooks.frame(dt,now,camera);
  // The wall cutaway follows the player (view space; this loop only runs while something moves).
  updateCut(cut,player.root.visible,x,z,camera);
  renderer.render(scene,camera);draws++;if(!firstFrameSent){firstFrameSent=true;callbacks.onFirstFrame?.();}
  const busy=!!zoom||speed>.03||!!target||keys.size>0||Math.hypot(stick.x,stick.z)>.02||greet>0||spinV!==0||doorOpen!==doorTarget||Math.abs(cameraX-cx)>.005||Math.abs(cameraZ-cz)>.005||Math.abs(turn)>.01;
  if(busy)settle=.5;else settle-=dt;remoteOnly=remote&&!busy&&settle<=0;
  if(settle>0||leaving||remote)frame=requestAnimationFrame(tick);else{last=0;slot=0;remoteOnly=false;}
 }
 /** The walking camera follows you across the L: x within the whole floor, z further toward the front inside the wing. */
 function camX(){const lo=FLOOR.minX-.4+halfW,hi=FLOOR.maxX+.4-halfW;return lo>=hi?(FLOOR.minX+FLOOR.maxX)/2:T.MathUtils.clamp(x,lo,hi);}
 function camZ(){return T.MathUtils.clamp(z,-2.4,x<WX1+1?WZ1-7:halfW<halfH?-.6:2.2);}
 function placeCamera(){camera.position.set(cameraX+Math.sin(camYaw)*12.5,10.8,cameraZ+Math.cos(camYaw)*12.5);curLook.set(cameraX,.6,cameraZ);camera.lookAt(curLook);camera.updateMatrixWorld();}
 function wake(){if(!frame&&!covered&&!disposed&&!document.hidden){settle=.5;last=0;slot=0;frame=requestAnimationFrame(tick);}}
 function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;renderer.setPixelRatio(pixelRatio());renderer.setSize(w,h,false);viewportW=w;viewportH=h;const r=canvas.getBoundingClientRect();viewportLeft=r.left;viewportTop=r.top;
  const a=w/h;halfH=a<1?7.4:a<1.25?6.6:6.4;halfW=halfH*a;if(halfW>11){halfW=11;halfH=halfW/a;}
  if(zoomIndex===null){camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();}
  else if(arrived){const c=zoomCam(stops[zoomIndex]);applyCam(c.pos,c.look,c.hw,c.hh);callbacks.onZoom?.(zoomView());}
  if(draws===0){cameraX=camX();cameraZ=camZ();}wake();}
 function clearInput(){keys.clear();stick.x=stick.z=0;target=null;route=[];arrivePoi=null;vx=vz=0;wake();}
 function key(e:KeyboardEvent){if(leaving||covered)return;
  if(zoomIndex!==null){if(e.type==='keydown'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLElement&&e.target.closest('[data-museum-card]'))){
    if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();if(!zoom)zoomToIndex(zoomIndex+(e.code==='ArrowLeft'?-1:1),.6);}else if(e.code==='Escape'){e.preventDefault();zoomOut();}}return;}
  if(!/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code)||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;e.preventDefault();if(e.type==='keydown')keys.add(e.code);else keys.delete(e.code);wake();}
 function visibility(){if(document.hidden){keys.clear();stick.x=stick.z=0;spinV=0;cancelAnimationFrame(frame);frame=0;}else wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',visibility);
 player.update(x,z,0,0,reduced,{facing:yaw,resumePose:true,travelMode:'walk'});guide.update(GUIDE.x,GUIDE.z,0,0,reduced,guideMotion);resize();
 // Arrival: walk in a few steps from the door (the doors are already open from the transition).
 placeDoors();const arrival={x:ROOM.doorX,z:D-1.6},slotPoint={x:0,z:0};target=arrival;
 // The room party layer's view of this scene (museumHooks.ts): pose, wake, sleeping, and re-aiming the walk-in at a free slot.
 const hookSource:MuseumHookSource={scene,camera,player:player.root,
  readPose(o){o.x=x;o.y=0;o.z=z;o.yaw=yaw;o.moving=Math.hypot(vx,vz)>.08;},wake,sleeping:()=>frame===0,
  arrive(px,pz){if(target===arrival&&!leaving){slotPoint.x=px;slotPoint.z=pz;route=[slotPoint];wake();}}};
 museumRoomHooks.register(hookSource);
 const stopIndex=(id:string)=>stops.findIndex(s=>s.id===id);

 return {
  pois,
  setStick(a:number,b:number){if(leaving)return;stick.x=a;stick.z=b;wake();},
  /** A tap in the hall: a case/wall/guide walks there (and looks); the floor walks to that spot. */
  pick(clientX:number,clientY:number){if(leaving||covered||zoomIndex!==null)return null;pointer.set((clientX-viewportLeft)/viewportW*2-1,1-(clientY-viewportTop)/viewportH*2);ray.setFromCamera(pointer,camera);
   let best:MuseumPoi|null=null,bd=Infinity;const b3=new T.Box3();for(const p of pois){b3.min.set(p.box.minX,0,p.box.minZ);b3.max.set(p.box.maxX,p.box.h,p.box.maxZ);const h=ray.ray.intersectBox(b3,hit);if(h){const d=h.distanceToSquared(ray.ray.origin);if(d<bd){bd=d;best=p;}}}
   if(best){walkToPoi(best);return best.id;}
   if(ray.ray.intersectPlane(floor,hit)){route=findPath(T.MathUtils.clamp(hit.x,FLOOR.minX+.7,W-.7),T.MathUtils.clamp(hit.z,-D+.7,WZ1-.7));target=route.shift()??null;arrivePoi=null;wake();}return null;},
  walkTo(id:string){const p=pois.find(p=>p.id===id);if(p)walkToPoi(p);},
  /** Walk out through the doors (Done); onExit fires as you cross them. */
  leave(){if(leaving)return;if(zoomIndex!==null){zoom=null;zoomIndex=null;arrived=false;setClip(false);callbacks.onZoom?.(null);}
   route=[...findPath(ROOM.doorX,D-1),{x:ROOM.doorX,z:D+.4}];target=route.shift()??{x:ROOM.doorX,z:D+.4};arrivePoi=null;leaveStarted=performance.now();wake();},
  zoomTo(id:string){const i=stopIndex(id);if(i>=0)zoomToIndex(i);},
  zoomStep(dir:1|-1){if(zoomIndex!==null&&!zoom){const i=Math.max(0,Math.min(stops.length-1,zoomIndex+dir));if(i!==zoomIndex){museumSfx.turn();zoomToIndex(i,.6);}}},
  zoomOut,
  greet(){greet=reduced?0:1.8;wake();},
  /** Telstar: drag by `dx` CSS px (a turn), release with a flick velocity (rad/s); `nudge` turns it by an eighth. */
  spinDrag(dx:number){if(!telstar)return;telstar.rotation.y+=dx*.012;spinTurns+=Math.abs(dx*.012);spinV=0;wake();},
  spinRelease(velocity:number){if(!telstar||reduced)return;spinV=T.MathUtils.clamp(velocity,-14,14);if(Math.abs(spinV)>.3)museumSfx.spin();wake();},
  spinNudge(dir:1|-1){if(!telstar)return;museumSfx.spin();if(reduced){telstar.rotation.y+=dir*Math.PI/4;spinTurns+=Math.PI/4;wake();return;}spinV=dir*6;wake();},
  /** The laced leather ball soaks up rain (darker, heavier-looking) or dries out. */
  setRain(on:boolean){rain=on;wake();},
  setCovered(value:boolean){covered=value;if(value){keys.clear();stick.x=stick.z=0;spinV=0;cancelAnimationFrame(frame);frame=0;}else wake();},
  clearInput,
  /** Test/measurement hooks. */
  measureRender(n=60){const t=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);return (performance.now()-t)/n;},
  debugPlace(px:number,pz:number,a:number){if(leaving)return;x=px;z=pz;yaw=a;vx=vz=0;target=null;route=[];arrivePoi=null;wake();},
  get state(){return {exhibits:{sculptures:[...exhibits.built]},x,z,yaw,zoom:zoomView(),zooming:!!zoom,near:near?.id??null,leaving,doorOpen,sleeping:frame===0,draws,frames,steps,spin:{turns:spinTurns,v:spinV,angle:telstar?.rotation.y??0},rain,
   render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},pixelRatio:renderer.getPixelRatio(),frameMs:frameMs(),stops:stops.map(s=>s.id)};},
  dispose(){disposed=true;museumRoomHooks.unregister(hookSource);cancelAnimationFrame(frame);frame=0;observer.disconnect();window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);
   pack?.dispose();player.dispose();guide.dispose();const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(mm=>mats.add(mm));}});
   geos.forEach(g=>g.dispose());mats.forEach(mm=>mm.dispose());doorGeo.dispose();atlas.dispose();shadeTex.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
export type MuseumScene=ReturnType<typeof createMuseumScene>;
