import * as T from 'three';
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
import {BALL_PLINTH,ROOM,WING,FLOOR,CASE,CASE_PLACES,DESK,GUIDE,TIMELINE,CERT_WALL,KIT_WALL,PEGBOARD,CARD_TABLE,BOOKCASE,ZOOM_STOPS,museumPois,museumObstacles,museumBlocked,findMuseumPath,type MuseumPoi} from './museumLayout';
import {paintMuseumAtlas,ATLAS,SIGN_RECTS,placardRect,TIMELINE_RECT,KIT_RECTS,VAR_RECT,COURT_RECT,SHIRT_NUMBER_RECT,STAR_RECT,certRect,CERT_SLOTS,DESK_RECT,COLLECTION_SIGN_RECT,type Rect} from './museumAtlas';
import {museumSfx} from './museumSound';
import {createStoryExhibits} from './museumExhibits';
import {isStoryCase} from './museumStories';
import {createBallMaterial} from './wcBalls/ballViewer';
import {ballDesign} from './wcBalls/designs';

/**
 * The walk-in History Museum interior (Oct 3 2026; docs/performance-guide.md "Walk-in History Museum"). The Konbini recipe:
 * an orthographic iso camera from the front-left corner, every box ONE merged vertex-coloured Lambert mesh, every printed thing
 * ONE merged unlit mesh on one canvas atlas (museumAtlas.ts), the vitrine glass ONE mesh, the doors one 2-instance mesh; two
 * lights, no shadow maps (contact discs). Only two exhibit objects are their own meshes, because they move: the Telstar (spin it)
 * and the laced leather ball (it darkens when it soaks up rain). No music; the loop runs only while something moves and sleeps
 * otherwise; phones are capped at 30 fps with the heat tier's pixel-ratio and frame caps; dispose() frees everything.
 */
export type MuseumZoomView={index:number;count:number;id:string;label:string;arrived:boolean};
export type MuseumSceneInput={open:Readonly<Record<string,boolean>>;earned:readonly string[];
 /** Your Collection: which ball-hunt spots are found (COIN_QUEST order), and how many cards and books the player has. */
 found:readonly boolean[];cards:number;books:number};
type Cam={pos:T.Vector3;look:T.Vector3;hw:number;hh:number};
/** Story exhibits' medium shots: the working machine fills the frame; the penalty drops low behind the ball. */
const STORY_FRAMES:Record<string,{y:number;w:number;h:number;elev:number;dz:number}>={'laws-1863':{y:.33,w:.7,h:.74,elev:.2,dz:0},'penalty-1891':{y:.2,w:.8,h:.56,elev:.1,dz:.04},'backpass-1992':{y:.34,w:.7,h:.74,elev:.16,dz:.02},'worldcup-1930':{y:.42,w:.8,h:.72,elev:.12,dz:-.04},'cards-1970':{y:.36,w:.86,h:.74,elev:.12,dz:0},'var-2018':{y:.4,w:.8,h:.7,elev:.14,dz:0},'wwc-1991':{y:.34,w:.86,h:.72,elev:.14,dz:0},'futsal-1989':{y:.2,w:.9,h:.6,elev:.32,dz:.04},'laced-leather':{y:.3,w:.76,h:.66,elev:.16,dz:.02},'telstar-1970':{y:.32,w:.82,h:.7,elev:.14,dz:0},'shirts':{y:.3,w:.8,h:.66,elev:.12,dz:0},'hall-of-fame':{y:.34,w:.86,h:.74,elev:.14,dz:0}};
type Stop={id:string;label:string;x:number;y:number;z:number;yaw:number;w:number;h:number;elev:number;story?:boolean};

const P={floor:'#d9b68c',floor2:'#cfa97c',wall:'#f6ecd6',wallLow:'#e3d3b2',trim:'#294f43',brass:'#d6b46a',plinth:'#efe4cc',plinthBase:'#294f43',cover:'#e6d7b8',coverShade:'#d8c6a2',sky:'#efe3c9',ink:'#22366b'};

export function createMuseumScene(canvas:HTMLCanvasElement,input:MuseumSceneInput,callbacks:{
 onNear?:(poi:MuseumPoi|null)=>void;onPrompt?:(x:number,y:number,visible:boolean)=>void;onArrive?:(poi:MuseumPoi)=>void;onExit?:()=>void;
 onZoom?:(view:MuseumZoomView|null)=>void;onFirstFrame?:()=>void;onZoomArrive?:(id:string)=>void;
 /** The walk-through timeline: the case whose year tile you stand on (null when you step off). */
 onTimeline?:(id:string|null)=>void;}={}){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 const pixelRatio=()=>Math.min(devicePixelRatio||1,mobile?Math.min(1.5,tierSettings().maxPixelRatio):Math.min(2,tierSettings().maxPixelRatio));
 renderer.setPixelRatio(pixelRatio());renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color(P.sky);
 const camera=new T.OrthographicCamera(-8,8,6,-6,.1,80);
 scene.add(new T.HemisphereLight('#fff8ea','#cbb894',2.1));const sun=new T.DirectionalLight('#fff3dc',1.05);sun.position.set(-3,10,6);scene.add(sun);

 // ---- Shared materials + atlas ---------------------------------------------------------------------------------------------
 const atlasCanvas=paintMuseumAtlas(document.createElement('canvas'),input.open,input.earned);const atlas=new T.CanvasTexture(atlasCanvas);atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=2;
 const printMat=new T.MeshBasicMaterial({map:atlas,alphaTest:.4,side:T.DoubleSide});
 const staticMat=new T.MeshLambertMaterial({vertexColors:true});
 const glassMat=new T.MeshBasicMaterial({color:'#dff3f2',transparent:true,opacity:.2,depthWrite:false});
 const boxes:T.BufferGeometry[]=[],glass:T.BufferGeometry[]=[],prints:T.BufferGeometry[]=[];
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
  uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);q.setFromEuler(euler.set(rx,ry,0,'YXZ'));m.compose(v.set(x,y,z),q,one);g.applyMatrix4(m);prints.push(g);
 }
 const mix=(a:string,b:string,k:number)=>'#'+new T.Color(a).lerp(new T.Color(b),k).getHexString();

 // ---- Room shell: the main hall plus the west wing ("Your Collection") through a wide opening (an L, like the building) ------
 const W=ROOM.halfW,D=ROOM.halfD,H=ROOM.wallH,WX0=WING.x0,WX1=WING.x1,WZ1=WING.z1,WW=WX1-WX0,WCX=(WX0+WX1)/2,WCZ=(WZ1-D)/2,WD=WZ1+D;
 // Wood floor: long planks (flat quads, two shades), hall and wing.
 for(let i=0,z=-D+.25;z<D;z+=.5,i++){const g=new T.PlaneGeometry(W*2,.48);g.rotateX(-Math.PI/2);add(g,0,.012,z,i%2?P.floor:P.floor2);}
 for(let i=0,z=-D+.25;z<WZ1;z+=.5,i++){const g=new T.PlaneGeometry(WW,.48);g.rotateX(-Math.PI/2);add(g,WCX,.012,z,i%2?P.floor:P.floor2);}
 box(W*2+.4,.12,D*2+.4,0,-.06,0,'#b89468');box(WW+.4,.12,WD+.4,WCX,-.06,WCZ,'#b89468');
 // Gallery rugs: the gallery colour softened toward cream.
 const rug=(x0:number,x1:number,z0:number,z1:number,hex:string)=>{const g=new T.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-Math.PI/2);add(g,(x0+x1)/2,.022,(z0+z1)/2,mix(hex,P.wall,.55));const e=new T.PlaneGeometry(x1-x0+.24,z1-z0+.24);e.rotateX(-Math.PI/2);add(e,(x0+x1)/2,.018,(z0+z1)/2,mix(hex,'#000',.1));};
 const art=(id:string)=>galleryOf(id).art;
 rug(-11.2,-2.4,-7.3,-1.2,art('laws'));rug(2.4,11.2,-7.3,-4.2,art('worldcup'));rug(-10.8,-2.2,1.2,4.8,art('kit'));rug(5.6,11.2,1.6,5.6,art('kit'));rug(WX0+.7,WX1-.7,-7.3,WZ1-.7,art('hall'));
 // Walls: one long back wall (wing + hall), the wing's west wall, the hall's east wall, and the hall's west wall as two stubs either
 // side of the opening (the southern one runs on as the wing's east wall, which carries the certificate frames).
 box(W-WX0+.4,H,.2,(WX0+W)/2,H/2,-D-.1,P.wall);box(.2,H,WD+.4,WX0-.1,H/2,WCZ,P.wall);box(.2,H,D*2+.4,W+.1,H/2,0,P.wall);
 box(.24,H,D-WING.open,WX1,H/2,(-D-WING.open)/2,P.wall);box(.24,H,WZ1-WING.open,WX1,H/2,(WING.open+WZ1)/2,P.wall);
 box(.34,.5,WING.open*2+.34,WX1,H-.25,0,P.trim);for(const zz of [-WING.open,WING.open])box(.36,H,.36,WX1,H/2,zz,P.trim);
 box(W-WX0,.18,.04,(WX0+W)/2,.09,-D+.02,P.trim);box(.04,.18,D*2,W-.02,.09,0,P.trim);box(.04,.18,WZ1-WING.open,WX1-.13,.09,(WING.open+WZ1)/2,P.trim);
 box(WW,.18,.03,WCX,3.25,-D+.02,art('hall'));box(W,.18,.03,-W/2,3.25,-D+.02,art('laws'));box(W,.18,.03,W/2,3.25,-D+.02,art('worldcup'));
 box(.03,.18,D,W-.02,3.25,-D/2,art('worldcup'));box(.03,.18,D,W-.02,3.25,D/2,art('kit'));box(.03,.18,WZ1-WING.open,WX1-.13,3.25,(WING.open+WZ1)/2,art('hall'));
 box(W-WX0,.1,.03,(WX0+W)/2,3.45,-D+.02,P.trim);box(.03,.1,D*2,W-.02,3.45,0,P.trim);box(.03,.1,WZ1-WING.open,WX1-.13,3.45,(WING.open+WZ1)/2,P.trim);
 // Low partition between the back and front galleries (the kit wall on its front face), with an open central aisle and a gap
 // by the wing opening.
 for(const s of [-1,1]){const x0=s<0?ROOM.partitionWest:ROOM.aisleHalf,x1=s<0?-ROOM.aisleHalf:W,len=x1-x0,cx=(x0+x1)/2;box(len,ROOM.partitionH,.24,cx,ROOM.partitionH/2,ROOM.partitionZ,P.wallLow);box(len+.06,.08,.3,cx,ROOM.partitionH+.04,ROOM.partitionZ,P.trim);
  box(len,.1,.02,cx,ROOM.partitionH-.2,ROOM.partitionZ+.13,s<0?art('kit'):art('kit'));box(len,.1,.02,cx,ROOM.partitionH-.2,ROOM.partitionZ-.13,s<0?art('laws'):art('worldcup'));
  for(const px of s<0?[ROOM.partitionWest,-ROOM.aisleHalf]:[ROOM.aisleHalf]){box(.32,ROOM.partitionH+.25,.32,px,(ROOM.partitionH+.25)/2,ROOM.partitionZ,P.trim);add(new T.SphereGeometry(.13,10,8),px,ROOM.partitionH+.36,ROOM.partitionZ,P.brass);}}
 // Fronts: a low sill and posts (the camera looks in over them, as at the Konbini), the glass doors in the hall's.
 const dl=ROOM.doorX-ROOM.doorHalf-.1,dr=ROOM.doorX+ROOM.doorHalf+.1;
 box(dl-WX1+.1,.5,.18,(WX1+dl)/2,.25,D+.05,P.wall);box(W+.1-dr,.5,.18,(dr+W+.1)/2,.25,D+.05,P.wall);
 for(const px of [WX1,-6,dl,dr,6,W])box(.14,1.1,.16,px,.55,D+.05,P.trim);
 box(WW+.2,.5,.18,WCX,.25,WZ1+.05,P.wall);for(const px of [WX0,WCX,WX1])box(.14,1.1,.16,px,.55,WZ1+.05,P.trim);
 box(2.6,.04,.4,ROOM.doorX,.02,D+.05,'#9d805b');
 const doorGeo=new T.BoxGeometry(ROOM.doorHalf-.04,2.4,.05),doors=new T.InstancedMesh(doorGeo,glassMat,2);doors.frustumCulled=false;scene.add(doors);
 const doorFrame=new T.Object3D();let doorOpen=1,doorTarget=1;
 function placeDoors(){for(let i=0;i<2;i++){const s=i?1:-1;doorFrame.position.set(ROOM.doorX+s*(ROOM.doorHalf/2+doorOpen*(ROOM.doorHalf-.1)),1.25,D+.02);doorFrame.updateMatrix();doors.setMatrixAt(i,doorFrame.matrix);}doors.instanceMatrix.needsUpdate=true;}
 placeDoors();
 // Gallery signs.
 print(SIGN_RECTS.laws,-W/2,2.72,-D+.03,4.8,.75);print(SIGN_RECTS.worldcup,W/2,2.72,-D+.03,4.8,.75);
 print(SIGN_RECTS.kit,-3.6,1.02,ROOM.partitionZ+.135,3.4,.53);print(SIGN_RECTS.kit,W-.03,2.85,D/2,4.8,.75,-Math.PI/2);
 print(COLLECTION_SIGN_RECT,PEGBOARD.x,3.0,-D+.03,4.2,1.2);print(SIGN_RECTS.hall,CERT_WALL.x-.03,2.95,CERT_WALL.z,4.8,.75,-Math.PI/2);
 // Brass stanchions at the corners of the rugs (decor, outside the walking lines).
 for(const [x,z] of [[-10.6,-1.4],[2.6,-4.4],[-2.4,4.6],[11,5.4],[WX0+.9,WZ1-.9]] as const){add(new T.CylinderGeometry(.04,.04,.9,8),x,.45,z,P.brass);add(new T.CylinderGeometry(.14,.16,.06,10),x,.03,z,P.brass);add(new T.SphereGeometry(.06,8,6),x,.94,z,P.brass);}

 // ---- Timeline wall, kit wall, certificate wall, welcome desk -------------------------------------------------------------
 box(TIMELINE.w+.24,TIMELINE.h+.24,.06,TIMELINE.x,TIMELINE.y,TIMELINE.z-.06,P.trim);print(TIMELINE_RECT,TIMELINE.x,TIMELINE.y,TIMELINE.z,TIMELINE.w,TIMELINE.w*TIMELINE_RECT.h/TIMELINE_RECT.w);
 KIT_WALL.xs.forEach((x,i)=>{print(KIT_RECTS[i],x,KIT_WALL.y,KIT_WALL.z,.95,.95);add(new T.CylinderGeometry(.02,.02,1.02,6),x,KIT_WALL.y+.36,KIT_WALL.z+.02,P.brass,0,0,Math.PI/2);});
 CERT_SLOTS.forEach((_,i)=>{const z=CERT_WALL.frames[i];box(.06,1.2,.98,CERT_WALL.x+.03,CERT_WALL.y,z,i===4?'#c99a2e':'#9d805b');print(certRect(i),CERT_WALL.x-.01,CERT_WALL.y,z,.84,1.0,-Math.PI/2);});
 box(DESK.w,DESK.h,DESK.d,DESK.x,DESK.h/2,DESK.z,'#9d805b');box(DESK.w+.1,.06,DESK.d+.1,DESK.x,DESK.h+.03,DESK.z,P.trim);print(DESK_RECT,DESK.x,.62,DESK.z+DESK.d/2+.01,1.7,.48);
 // A little brass bell and a stack of guide leaflets on the desk.
 add(new T.SphereGeometry(.09,10,6,0,Math.PI*2,0,Math.PI/2),DESK.x-.6,DESK.h+.06,DESK.z,P.brass);box(.32,.06,.22,DESK.x+.55,DESK.h+.09,DESK.z+.05,'#f4cc7c');

 // ---- Your Collection: the player's own hidden balls, cards and books (no history here: only what they collected) ---------
 // Your Collection pieces that perform (instanced: one draw each): found balls, cards, books. See `rollcall` below.
 const wingBalls:{x:number;y:number;z:number}[]=[],wingCards:{x:number;y:number;z:number;a:number;c:string}[]=[],wingBooks:{x:number;y:number;z:number;h:number;c:string}[]=[];
 // Hidden-ball pegboard: one peg per ball-hunt spot (lib/town/coinQuest.ts order); a found ball sits on its peg.
 {const P0=PEGBOARD,cw=P0.w/P0.cols,rh=P0.h/P0.rows;box(P0.w+.24,P0.h+.24,.06,P0.x,P0.y,P0.z,'#6f5236');box(P0.w+.1,P0.h+.1,.02,P0.x,P0.y,P0.z+.04,'#9d805b');
  for(let i=0;i<P0.cols*P0.rows;i++){const px=P0.x-P0.w/2+(i%P0.cols+.5)*cw,py=P0.y+P0.h/2-(Math.floor(i/P0.cols)+.5)*rh;
   if(input.found[i])wingBalls.push({x:px,y:py,z:P0.z+.18});else add(new T.CylinderGeometry(.05,.05,.03,8),px,py,P0.z+.06,'#4a3826',Math.PI/2);}}
 // The card table: a fan of the player's cards (up to 10 shown), face up.
 {const t=CARD_TABLE;box(t.w,.06,t.d,t.x,t.h,t.z,'#9d805b');box(t.w+.08,.04,t.d+.08,t.x,t.h+.04,t.z,P.trim);for(const sx of [-1,1])for(const sz of [-1,1])box(.07,t.h,.07,t.x+sx*(t.w/2-.12),t.h/2,t.z+sz*(t.d/2-.12),'#6f5236');
  const n=Math.min(10,input.cards),cols=['#2f6fb0','#d8466f','#3a9e5c','#e0a33a','#477c6a'];
  for(let i=0;i<n;i++)wingCards.push({x:t.x+(i-(n-1)/2)*.2,y:t.h+.07+i*.004,z:t.z+Math.abs(i-(n-1)/2)*.03,a:(i-(n-1)/2)*.16,c:cols[i%cols.length]});
  if(!n)box(.24,.006,.34,t.x,t.h+.065,t.z,'#e6d7b8');}
 // The bookcase: the player's pop-up books on three shelves (up to 18 shown).
 {const b=BOOKCASE,bz=b.z-b.d/2;box(b.w,b.h,.04,b.x,b.h/2,bz+.02,'#6f5236');for(const sx of [-1,1])box(.06,b.h,b.d,b.x+sx*(b.w/2-.03),b.h/2,b.z,'#9d805b');
  for(let k=0;k<4;k++)box(b.w-.06,.05,b.d,b.x,.06+k*(b.h-.1)/3,b.z,'#9d805b');box(b.w+.08,.06,b.d+.08,b.x,b.h+.03,b.z,P.trim);
  const n=Math.min(18,input.books),cols=['#d8466f','#2f8f8a','#e0a33a','#2f6fb0','#477c6a','#bd7657'];
  for(let i=0;i<n;i++){const shelf=Math.floor(i/6),slot=i%6,hgt=.3+((i*7)%3)*.04;wingBooks.push({x:b.x-b.w/2+.35+slot*.36,y:.085+shelf*(b.h-.1)/3+hgt/2,z:b.z,h:hgt,c:cols[i%cols.length]});}}

 // ---- Exhibit cases ----------------------------------------------------------------------------------------------------------
 const leatherMat=new T.MeshLambertMaterial({vertexColors:true}),telstarMat=new T.MeshLambertMaterial({vertexColors:true});
 /** A ball as a faceted icosphere; faces near the 12 icosahedron vertices take `patch` (the Telstar's black pentagons). */
 function ballGeo(r:number,detail:number,base:string,patch:string|null,seam?:string){
  const g=new T.IcosahedronGeometry(r,detail),pos=g.attributes.position,c=new Float32Array(pos.count*3),dirs=new T.IcosahedronGeometry(1,0),dv=dirs.attributes.position,centres:T.Vector3[]=[];
  for(let i=0;i<dv.count;i++){const p=new T.Vector3().fromBufferAttribute(dv,i).normalize();if(!centres.some(o=>o.distanceTo(p)<.01))centres.push(p);}dirs.dispose();
  const a=new T.Color(base),b=new T.Color(patch??base),s=new T.Color(seam??base),cen=new T.Vector3();
  for(let f=0;f<pos.count;f+=3){cen.set(0,0,0);for(let k=0;k<3;k++)cen.add(sv.fromBufferAttribute(pos,f+k));cen.normalize();let best=-1;for(const o of centres)best=Math.max(best,o.dot(cen));
   const col=patch&&best>.952?b:seam&&Math.abs(cen.y)<.12?s:a;for(let k=0;k<3;k++){c[(f+k)*3]=col.r;c[(f+k)*3+1]=col.g;c[(f+k)*3+2]=col.b;}}
  g.setAttribute('color',new T.BufferAttribute(c,3));return g;
 }
 let telstar:T.Mesh|null=null,leather:T.Mesh|null=null;
 const TOP=CASE.plinthH+.04;
 function caseObject(e:Exhibit,x:number,z:number){
  const y=TOP;switch(e.object){
   case 'book':{add(new T.BoxGeometry(.5,.05,.06),x,y+.02,z,'#9d805b');for(const s of [-1,1]){add(new T.BoxGeometry(.24,.02,.32),x+s*.12,y+.12,z,'#2f8f8a',0,0,s*-.22);add(new T.BoxGeometry(.22,.025,.29),x+s*.115,y+.14,z,'#fff7e4',0,0,s*-.22);}break;}
   case 'whistle':{add(new T.CylinderGeometry(.08,.08,.12,14),x-.04,y+.1,z,'#c9ccd1',Math.PI/2,0,0,1.5);add(new T.BoxGeometry(.2,.06,.09),x+.12,y+.12,z,'#c9ccd1',0,0,0,1.5);add(new T.TorusGeometry(.05,.012,6,12),x-.18,y+.12,z,'#d6b46a',0,Math.PI/2,0,1.5);add(new T.BoxGeometry(.3,.03,.24),x,y+.015,z,'#294f43');break;}
   case 'cards':{add(new T.BoxGeometry(.3,.03,.18),x,y+.015,z,'#294f43');add(new T.BoxGeometry(.16,.24,.012),x-.08,y+.15,z,'#f8d651',0,.2,.12);add(new T.BoxGeometry(.16,.24,.012),x+.08,y+.16,z+.02,'#e0453d',0,-.2,-.1);break;}
   case 'glove':{add(new T.BoxGeometry(.24,.24,.07),x-.06,y+.17,z,'#f2a03d');for(let i=0;i<4;i++)add(new T.BoxGeometry(.05,.13,.06),x-.15+i*.06,y+.35,z,'#f2a03d');add(new T.BoxGeometry(.05,.11,.06),x+.09,y+.18,z,'#f2a03d',0,0,-.6);add(new T.BoxGeometry(.25,.07,.08),x-.06,y+.04,z,'#22366b');add(ballGeo(.1,1,'#f4edd3','#22366b'),x+.2,y+.1,z+.06,'#ffffff');break;}
   case 'screen':{add(new T.BoxGeometry(.58,.38,.06),x,y+.34,z,'#22366b');add(new T.BoxGeometry(.06,.14,.06),x,y+.08,z,'#22366b');add(new T.BoxGeometry(.26,.03,.16),x,y+.015,z,'#22366b');print(VAR_RECT,x,y+.34,z+.032,.52,.33);break;}
   case 'trophy':{add(new T.CylinderGeometry(.12,.14,.1,12),x,y+.05,z,'#294f43');add(new T.CylinderGeometry(.03,.05,.16,10),x,y+.18,z,'#f2bb45');add(new T.CylinderGeometry(.14,.07,.2,14),x,y+.36,z,'#f2bb45');for(const s of [-1,1])add(new T.TorusGeometry(.06,.016,6,10,Math.PI),x+s*.15,y+.38,z,'#f2bb45',0,0,s*Math.PI/2);break;}
   case 'globe':{add(ballGeo(.2,2,'#5fa8d3','#7fbf5a'),x,y+.34,z,'#ffffff');add(new T.CylinderGeometry(.03,.03,.14,8),x,y+.08,z,'#9d805b');add(new T.CylinderGeometry(.12,.14,.04,12),x,y+.02,z,'#9d805b');break;}
   case 'court':{add(new T.BoxGeometry(.6,.04,.4),x,y+.06,z,'#6aa5c2');print(COURT_RECT,x,y+.081,z,.56,.37,0,-Math.PI/2);add(new T.SphereGeometry(.035,8,6),x-.12,y+.11,z+.05,'#f8d651');break;}
   case 'leather':{// The laced leather ball (its own mesh: it darkens in the rain) beside a size 5 match ball.
    const lg=ballGeo(.15,2,'#8a5a33',null,'#e9dcc0');leather=new T.Mesh(lg,leatherMat);leather.position.set(x-.17,y+.15,z);leather.rotation.set(.2,.5,0);leather.name='museum-leather';scene.add(leather);
    add(ballGeo(.16,2,'#f6f1e2','#22366b'),x+.18,y+.16,z,'#ffffff');add(new T.BoxGeometry(.66,.02,.2),x,y+.01,z+.12,'#294f43');break;}
   case 'telstar':{const tg=ballGeo(.2,3,'#f6f1e2','#1c1f26');telstar=new T.Mesh(tg,telstarMat);telstar.position.set(x,y+.3,z);telstar.name='museum-telstar';scene.add(telstar);add(new T.CylinderGeometry(.09,.12,.08,12),x,y+.04,z,'#294f43');break;}
   case 'shirt':{add(new T.BoxGeometry(.34,.42,.05),x,y+.3,z,'#e0453d');for(const s of [-1,1])add(new T.BoxGeometry(.12,.1,.05),x+s*.21,y+.45,z,'#e0453d',0,0,s*-.5);add(new T.BoxGeometry(.03,.5,.03),x,y+.27,z-.04,'#9d805b');print(SHIRT_NUMBER_RECT,x,y+.27,z+.027,.22,.22);break;}
   case 'frame':{add(new T.BoxGeometry(.46,.36,.04),x,y+.24,z,'#e7b94a',-.15);print(STAR_RECT,x,y+.24,z+.025,.3,.26,0,-.15);add(new T.BoxGeometry(.04,.3,.04),x,y+.13,z-.08,'#9d805b',.35);break;}
  }
 }
 // Storytelling exhibits (Oct 4 2026): their machines replace the static case object; static parts join the merged mesh.
 const exhibits=createStoryExhibits(scene,{open:input.open,reduced,add:(geo,x,y,z,hex,rx,ry,rz,s)=>add(geo,x,y,z,hex,rx,ry,rz,s),material:staticMat,onReady:()=>setTimeout(()=>{if(!disposed)wake();},0),earned:input.earned.length});
 // The World Cup ball plinth (Oct 5 2026): a round pedestal with the 2026 ball on a brass cup; looking at it opens the gallery.
 {const P=BALL_PLINTH;add(new T.CylinderGeometry(P.r,P.r*1.08,P.h,28),P.x,P.h/2,P.z,'#294f43');add(new T.CylinderGeometry(P.r*1.12,P.r*1.12,.05,28),P.x,P.h+.025,P.z,'#e7b94a');
  add(new T.CylinderGeometry(.11,.15,.06,20),P.x,P.h+.08,P.z,'#e7b94a');add(new T.CylinderGeometry(P.r*1.14,P.r*1.14,.04,28),P.x,.02,P.z,'#e7b94a');
  const ballMat=createBallMaterial(ballDesign('2026-trionda'));const bm=new T.Mesh(new T.SphereGeometry(P.ball,48,32),ballMat);bm.position.set(P.x,P.h+.11+P.ball,P.z);bm.quaternion.setFromUnitVectors(new T.Vector3(1,1,-1).normalize(),new T.Vector3(-.35,.75,.75).normalize());/* the three colour waves face the hall camera (the plain 4th panel faces away) */bm.name='museum-wc-ball';scene.add(bm);}
 // "Stand where they stood": a painted penalty marker on the floor in front of the penalty case.
 {const p=CASE_PLACES['penalty-1891'];add(new T.CylinderGeometry(.42,.42,.008,24),p.x,.026,p.z+1.1,'#f4efe2');add(new T.CylinderGeometry(.3,.3,.01,24),p.x,.028,p.z+1.1,'#2f8f8a');add(new T.CylinderGeometry(.07,.07,.012,12),p.x,.03,p.z+1.1,'#f4efe2');}
 EXHIBITS.forEach((e,i)=>{const p=CASE_PLACES[e.id],isOpen=!!input.open[e.id],g=galleryOf(e.gallery);
  box(CASE.w+.08,.1,CASE.d+.08,p.x,.05,p.z,P.plinthBase);box(CASE.w,CASE.plinthH-.1,CASE.d,p.x,.1+(CASE.plinthH-.1)/2,p.z,P.plinth);
  box(CASE.w+.04,.05,CASE.d+.04,p.x,CASE.plinthH+.015,p.z,g.art);box(CASE.w-.02,.06,.02,p.x,.22,p.z+CASE.d/2+.005,g.art);
  // Story stages hang their year/title plaque on the proscenium (seen while walking, above the caption strip when zoomed).
  if(exhibits.built.has(e.id)){const top=exhibits.stageTops[e.id]??TOP+.8;print(placardRect(i),p.x,top+.13,p.z-.43,.5,.5*112/256);}else print(placardRect(i),p.x,.6,p.z+CASE.d/2+.012,.84,.84*112/256);
  // Story exhibits are open stages (a painted backdrop, no glass), so the machine can be big; other open cases keep the vitrine.
  if(isOpen&&exhibits.built.has(e.id)){}
  else if(isOpen){add(new T.BoxGeometry(CASE.w-.1,CASE.glassH,CASE.d-.1),p.x,TOP+CASE.glassH/2,p.z,'',0,0,0,1,glass);
   box(CASE.w-.06,.04,CASE.d-.06,p.x,TOP+CASE.glassH+.02,p.z,P.brass);caseObject(e,p.x,p.z);}
  else{// A cloth cover: a draped box with a wider hem, a soft top and a tied knot.
   box(CASE.w-.06,CASE.glassH-.06,CASE.d-.06,p.x,TOP+(CASE.glassH-.06)/2,p.z,P.cover);box(CASE.w+.02,.14,CASE.d+.02,p.x,TOP+.07,p.z,P.coverShade);
   add(new T.SphereGeometry((CASE.w-.06)/2,10,5,0,Math.PI*2,0,Math.PI/2).scale(1,.32,1),p.x,TOP+CASE.glassH-.08,p.z,P.cover);add(new T.IcosahedronGeometry(.07,0),p.x,TOP+CASE.glassH+.13,p.z,g.art);}
 });
 void GALLERIES;

 // ---- Merge static, glass and prints ---------------------------------------------------------------------------------------
 // ---- Your Collection roll-call: arrive at the pegboard and your found balls hop one after another; the cards flip face up
 // in turn; your books slide out and back. Instanced (3 draws), animated only for ~3 s after you arrive; reduced motion: none.
 const instOf=(geo:T.BufferGeometry,n:number,name:string)=>{const g=geo.index?geo.toNonIndexed():geo;const c=new Float32Array(g.attributes.position.count*3).fill(1);g.setAttribute('color',new T.BufferAttribute(c,3));const m=new T.InstancedMesh(g,staticMat,Math.max(1,n));m.count=n;m.name=name;m.frustumCulled=false;scene.add(m);return m;};
 const ballInst=instOf(new T.IcosahedronGeometry(.13,1),wingBalls.length,'museum-wing-balls'),cardInst=instOf(new T.BoxGeometry(.24,.012,.34),wingCards.length,'museum-wing-cards'),bookInst=instOf(new T.BoxGeometry(.11,1,.3),wingBooks.length,'museum-wing-books');
 wingBalls.forEach((_,i)=>ballInst.setColorAt(i,color.set('#f6f1e2')));wingCards.forEach((c,i)=>cardInst.setColorAt(i,color.set(c.c)));wingBooks.forEach((b,i)=>bookInst.setColorAt(i,color.set(b.c)));
 const io=new T.Object3D();let rollcall:{id:string;t:number}|null=null;
 function poseWing(){const r=rollcall,t=r?.t??0;
  wingBalls.forEach((b,i)=>{const k=r?.id==='my-balls'?Math.max(0,Math.sin(Math.min(1,Math.max(0,(t-i*.03)/.35))*Math.PI)):0;io.position.set(b.x,b.y+k*.12,b.z+k*.06);io.rotation.set(0,k*2,0);io.scale.setScalar(1+k*.25);io.updateMatrix();ballInst.setMatrixAt(i,io.matrix);});
  wingCards.forEach((c,i)=>{const k=r?.id==='my-cards'?Math.min(1,Math.max(0,(t-i*.22)/.4)):1,flip=r?.id==='my-cards'?(1-k)*Math.PI:0;io.position.set(c.x,c.y+Math.sin(k*Math.PI)*.12,c.z);io.rotation.set(0,c.a,flip);io.scale.setScalar(1);io.updateMatrix();cardInst.setMatrixAt(i,io.matrix);cardInst.setColorAt(i,color.set(flip>Math.PI/2?'#294f43':c.c));});
  wingBooks.forEach((b,i)=>{const k=r?.id==='my-books'?Math.max(0,Math.sin(Math.min(1,Math.max(0,(t-i*.1)/.5))*Math.PI)):0;io.position.set(b.x,b.y,b.z+k*.12);io.rotation.set(0,0,0);io.scale.set(1,b.h,1);io.updateMatrix();bookInst.setMatrixAt(i,io.matrix);});
  for(const m of [ballInst,cardInst,bookInst]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}}
 poseWing();
 function startRollcall(id:string){if(reduced||!['my-balls','my-cards','my-books'].includes(id))return;rollcall={id,t:0};if(id==='my-balls')museumSfx.reveal();}
 function stepRollcall(dt:number){if(!rollcall)return false;rollcall.t+=dt;const end=rollcall.id==='my-balls'?wingBalls.length*.03+.5:rollcall.id==='my-cards'?wingCards.length*.22+.5:wingBooks.length*.1+.6;
  if(rollcall.id==='my-cards'&&Math.floor((rollcall.t)/.22)!==Math.floor((rollcall.t-dt)/.22)&&rollcall.t<wingCards.length*.22)museumSfx.card();
  if(rollcall.t>end){rollcall=null;poseWing();return false;}poseWing();return true;}
 // ---- The walk-through timeline: a runner of year tiles along the back wall. Step on a year: its tile glows, a beam of light
 // finds that case across the room, and the year + title pop up (the cases' own years and titles; nothing new).
 const TL=timelineOrder(),tileW=.4,tileX0=-(TL.length-1)*tileW/2,tileZ=TIMELINE.z+.95;
 TL.forEach((e,i)=>{box(tileW-.04,.02,.5,tileX0+i*tileW,.03,tileZ,mix(galleryOf(e.gallery).art,P.wall,input.open[e.id]?.15:.6));});
 const tileGlow=new T.Mesh(new T.BoxGeometry(tileW-.02,.025,.52),new T.MeshBasicMaterial({color:'#fff1b8',transparent:true,opacity:.7}));tileGlow.visible=false;tileGlow.name='museum-timeline-glow';scene.add(tileGlow);
 const beam=new T.Mesh(new T.CylinderGeometry(.35,.6,3.2,20,1,true),new T.MeshBasicMaterial({color:'#fff3c4',transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide}));beam.visible=false;beam.name='museum-timeline-beam';scene.add(beam);
 let tileIndex=-1;
 function stepTimeline(){const i=Math.abs(z-tileZ)<.35&&Math.abs(x-tileX0-(TL.length-1)*tileW/2)<TL.length*tileW/2?Math.round((x-tileX0)/tileW):-1;const idx=i>=0&&i<TL.length?i:-1;if(idx===tileIndex)return;tileIndex=idx;
  if(idx<0){tileGlow.visible=beam.visible=false;callbacks.onTimeline?.(null);return;}const e=TL[idx],c=CASE_PLACES[e.id];tileGlow.visible=true;tileGlow.position.set(tileX0+idx*tileW,.035,tileZ);
  beam.visible=true;beam.position.set(c.x,1.6,c.z);museumSfx.flap();callbacks.onTimeline?.(e.id);}
 const staticMesh=new T.Mesh(mergeGeometries(boxes,false)!,staticMat);staticMesh.name='museum-static';scene.add(staticMesh);
 // (Every open case may be a story stage now, with no vitrine: an empty glass list gets an empty mesh.)
 const glassMesh=new T.Mesh(glass.length?mergeGeometries(glass,false)!:new T.BufferGeometry(),glassMat);glassMesh.renderOrder=2;scene.add(glassMesh);
 const printMesh=new T.Mesh(mergeGeometries(prints,false)!,printMat);printMesh.name='museum-prints';scene.add(printMesh);
 for(const g of [...boxes,...glass,...prints])g.dispose();
 staticMesh.matrixAutoUpdate=glassMesh.matrixAutoUpdate=printMesh.matrixAutoUpdate=false;staticMesh.updateMatrix();glassMesh.updateMatrix();printMesh.updateMatrix();

 // ---- Characters -------------------------------------------------------------------------------------------------------------
 const shadowGeo=new T.CircleGeometry(1,24),shadowMat=new T.MeshBasicMaterial({color:'#3a2b18',transparent:true,opacity:.18,depthWrite:false});
 const disc=(s:number)=>{const d=new T.Mesh(shadowGeo,shadowMat);d.rotation.x=-Math.PI/2;d.scale.set(s,s*.7,1);scene.add(d);return d;};
 const progress=getQuizProgress(),custom=loadCustomization(progress.completed,progress.total);
 const player=createPlayer('you','home',true,true);player.setAppearance(custom);player.setBeanLook(beanLookFor(custom),playerOutfit(custom));player.root.name='museum-player';scene.add(player.root);const playerShadow=disc(.42);
 const guide=createPlayer('museum-guide-ada','neutral',true,true);guide.setProfile(profileFor('npc',44));
 {const d=npcDress({id:'museum-guide-ada',role:'Museum guide',character:'female',face:'deep',clothing:'classic'});d.look.headwear='none';guide.setBeanLook(d.look,{...d.outfit,shirt:'#477c6a',shirt2:'#f4cc7c'});}
 guide.root.name='museum-guide';scene.add(guide.root);const guideShadow=disc(.42);guideShadow.position.set(GUIDE.x,.03,GUIDE.z);
 const guideMotion:PlayerMotion={travelMode:'walk',facing:GUIDE.yaw,lookY:1.4,ready:.1};

 // ---- State ------------------------------------------------------------------------------------------------------------------
 const obstacles=museumObstacles(),pois=museumPois(),camYaw=-.36;
 const blocked=(px:number,pz:number,r=.3)=>museumBlocked(px,pz,obstacles,r);
 let x:number=ROOM.doorX,z=D+.2,vx=0,vz=0,yaw=Math.PI,time=0,frame=0,last=0,slot=0,disposed=false,covered=false,leaving=false,settle=1,draws=0,frames=0,greet=reduced?0:1.8,stride=0,steps=0;
 let leaveStarted=0,firstFrameSent=false;const stuck=createStuckWatch(.5);
 let target:{x:number;z:number}|null=null,route:{x:number;z:number}[]=[],arrivePoi:MuseumPoi|null=null,near:MuseumPoi|null=null,promptVisible=false;
 let cameraX=0,cameraZ=0,halfW=8,halfH=6,viewportW=1,viewportH=1,viewportLeft=0,viewportTop=0;
 const keys=new Set<string>(),stick={x:0,z:0},motion:PlayerMotion={travelMode:'walk'};
 const ray=new T.Raycaster(),pointer=new T.Vector2(),floor=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3(),projected=new T.Vector3(),tmpPos=new T.Vector3(),tmpLook=new T.Vector3(),curLook=new T.Vector3();
 const frameMs=()=>{const t=tierSettings();return mobile?Math.max(1000/30,t.frameMs):t.cap30Everywhere?t.frameMs:0;};
 // Telstar spin (drag, ← → buttons): a little inertia, then it sleeps. Reduced motion: it turns only while you drag / per press.
 let spinV=0,spinTurns=0,rain=false;

 // ---- Zoom (the vending/Konbini close-up: an eased orthographic move onto the real case) ------------------------------------
 const stops:Stop[]=ZOOM_STOPS.map(id=>{
  if(id==='timeline')return {id,label:'Timeline wall',x:TIMELINE.x,y:TIMELINE.y,z:TIMELINE.z,yaw:0,w:TIMELINE.w,h:TIMELINE.h+.3,elev:.12};
  if(id==='hall-wall')return {id,label:'Certificate wall',x:CERT_WALL.x,y:CERT_WALL.y+.3,z:CERT_WALL.z,yaw:-Math.PI/2,w:CERT_WALL.w-1,h:2,elev:.12};
  if(id==='my-balls')return {id,label:'Your hidden balls',x:PEGBOARD.x,y:PEGBOARD.y,z:PEGBOARD.z,yaw:0,w:PEGBOARD.w+.3,h:PEGBOARD.h+.4,elev:.12,story:true};
  if(id==='my-cards')return {id,label:'Your player cards',x:CARD_TABLE.x,y:CARD_TABLE.h,z:CARD_TABLE.z,yaw:0,w:CARD_TABLE.w+.2,h:1,elev:.75,story:true};
  if(id==='my-books')return {id,label:'Your pop-up books',x:BOOKCASE.x,y:BOOKCASE.h/2,z:BOOKCASE.z,yaw:0,w:BOOKCASE.w+.2,h:BOOKCASE.h+.2,elev:.15,story:true};
  const e=EXHIBITS.find(x=>x.id===id)!,p=CASE_PLACES[id];
  // Story cases: a medium shot of the working machine; the penalty drops low behind the ball ("stand where they stood").
  if(isStoryCase(id)&&input.open[id]){const f=STORY_FRAMES[id]??{y:.2,w:.7,h:.45,elev:.24,dz:0};return {id,label:e.title,x:p.x,y:TOP+f.y,z:p.z+f.dz,yaw:0,w:f.w,h:f.h,elev:f.elev,story:true};}
  return {id,label:e.title,x:p.x,y:(TOP+CASE.glassH+.25)/2+.18,z:p.z,yaw:0,w:1.25,h:1.5,elev:.2};});
 const ZD=9;let zoomIndex:number|null=null,zoom:{from:Cam;to:number|null;t:number;dur:number}|null=null,arrived=false;
 const walkCam=():Cam=>({pos:new T.Vector3(cameraX+Math.sin(camYaw)*12.5,10.8,cameraZ+Math.cos(camYaw)*12.5),look:new T.Vector3(cameraX,.6,cameraZ),hw:halfW,hh:halfH});
 const snapshot=():Cam=>({pos:camera.position.clone(),look:curLook.clone(),hw:camera.right,hh:camera.top});
 function zoomCam(s:Stop):Cam{
  const a=viewportW/Math.max(1,viewportH),yv=s.yaw-.14,look=new T.Vector3(s.x,s.y,s.z);
  let hw=s.w/2*1.08+.12,hh=s.h/2*1.1+.15;if(hw/hh>a)hh=hw/a;else hw=hh*a;
  // Leave room for the exhibit card: below the case on portrait, beside it (right) on landscape.
  // Story cases keep the machine above the slim caption strip; other cases leave room for their card.
  if(s.story){if(a<1){
   // Phone: the whole stage, from its front edge up to its plaque, sits between the header (11 %) and the caption strip
   // (64 %), as big as the width allows.
   const yTop=(exhibits.stageTops[s.id]??TOP+.8)+.26,yBot=TOP-.16;hh=Math.max((yTop-yBot)/1.06,s.w/2*1.04/a);hw=hh*a;look.y=yTop-.78*hh;}else{hh=s.h/2*1.25+.05;hw=hh*a;look.y-=hh*.2;}}
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
  const interval=frameMs();if(interval>0){const next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(tick);return;}slot=next;}
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
    else{zoom=null;arrived=true;setClip(true);callbacks.onZoom?.(zoomView());if(zoomIndex!==null){callbacks.onZoomArrive?.(stops[zoomIndex].id);startRollcall(stops[zoomIndex].id);}}}}
  else if(zoomIndex!==null){const c=zoomCam(stops[zoomIndex]);applyCam(c.pos,c.look,c.hw,c.hh);}
  else placeCamera();
  const hidePlayer=zoomIndex!==null&&(zoom===null||(zoom.to!==null?zoom.t>.35:zoom.t<.6));player.root.visible=playerShadow.visible=!hidePlayer;
  if(near&&!zoomed){const c=segPoint(near,x,z);projected.set((c.x+near.face.x)/2,2.4,(c.z+near.face.z)/2).project(camera);const vis=Math.abs(projected.x)<.92&&projected.y<.85&&projected.y>-.8;callbacks.onPrompt?.((projected.x*.5+.5)*viewportW,(-projected.y*.5+.5)*viewportH,vis);promptVisible=vis;}else if(promptVisible){promptVisible=false;callbacks.onPrompt?.(0,0,false);}
  const exhibitBusy=exhibits.update(dt)||stepRollcall(dt);if(!leaving)stepTimeline();
  renderer.render(scene,camera);draws++;if(!firstFrameSent){firstFrameSent=true;callbacks.onFirstFrame?.();}
  const busy=exhibitBusy||!!zoom||speed>.03||!!target||keys.size>0||Math.hypot(stick.x,stick.z)>.02||greet>0||spinV!==0||doorOpen!==doorTarget||Math.abs(cameraX-cx)>.005||Math.abs(cameraZ-cz)>.005||Math.abs(turn)>.01;
  if(busy)settle=.5;else settle-=dt;
  if(settle>0||leaving)frame=requestAnimationFrame(tick);else{last=0;slot=0;}
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
 placeDoors();target={x:ROOM.doorX,z:D-1.6};
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
  /** Storytelling exhibits: play a beat's animation (seconds), turn the zoetrope crank, reset a story. */
  story:{play(id:string,anim:string,arg?:number){const d=exhibits.play(id,anim,arg);wake();return d;},crank(d:number){exhibits.crank(d);wake();},reset(id:string){exhibits.reset(id);wake();},has:(id:string)=>exhibits.has(id)},
  greet(){greet=reduced?0:1.8;wake();},
  /** Telstar: drag by `dx` CSS px (a turn), release with a flick velocity (rad/s); `nudge` turns it by an eighth. */
  spinDrag(dx:number){if(!telstar)return;telstar.rotation.y+=dx*.012;spinTurns+=Math.abs(dx*.012);spinV=0;wake();},
  spinRelease(velocity:number){if(!telstar||reduced)return;spinV=T.MathUtils.clamp(velocity,-14,14);if(Math.abs(spinV)>.3)museumSfx.spin();wake();},
  spinNudge(dir:1|-1){if(!telstar)return;museumSfx.spin();if(reduced){telstar.rotation.y+=dir*Math.PI/4;spinTurns+=Math.PI/4;wake();return;}spinV=dir*6;wake();},
  /** The laced leather ball soaks up rain (darker, heavier-looking) or dries out. */
  setRain(on:boolean){rain=on;leatherMat.color.set(on?'#6b5a52':'#ffffff');if(leather)leather.position.y=TOP+.15-(on?.02:0);wake();},
  setCovered(value:boolean){covered=value;if(value){keys.clear();stick.x=stick.z=0;spinV=0;cancelAnimationFrame(frame);frame=0;}else wake();},
  clearInput,
  /** Test/measurement hooks. */
  measureRender(n=60){const t=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);return (performance.now()-t)/n;},
  debugPlace(px:number,pz:number,a:number){if(leaving)return;x=px;z=pz;yaw=a;vx=vz=0;target=null;route=[];arrivePoi=null;wake();},
  get state(){return {exhibits:exhibits.debug,x,z,yaw,zoom:zoomView(),zooming:!!zoom,near:near?.id??null,leaving,doorOpen,sleeping:frame===0,draws,frames,steps,spin:{turns:spinTurns,v:spinV,angle:telstar?.rotation.y??0},rain,
   render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},pixelRatio:renderer.getPixelRatio(),frameMs:frameMs(),stops:stops.map(s=>s.id)};},
  dispose(){disposed=true;cancelAnimationFrame(frame);frame=0;observer.disconnect();window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);
   player.dispose();guide.dispose();const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(mm=>mats.add(mm));}});
   geos.forEach(g=>g.dispose());mats.forEach(mm=>mm.dispose());doorGeo.dispose();atlas.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
export type MuseumScene=ReturnType<typeof createMuseumScene>;
