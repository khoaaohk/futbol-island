/**
 * The Claw Club machine in 3D (Nov 21 2026; owner: "the machine needs to feel like a real machine and not flat" / "this claw machine
 * is the only one that doesn't need to look like the arcade games ... it's more like the vending machines").
 *
 * Two builds in the machine's own frame (x right, z toward the player, y up from the floor; the arcade props place it):
 *  - `buildClawLod()`: the room view. One vertex-coloured merged mesh + one glass plane + the marquee sign + the idle carriage
 *    (4 draws), no textures beyond the sign. Always in the room.
 *  - `buildClawDetail()`: the zoomed machine, built on the first zoom and kept: painted metal with clearcoat, chrome posts and
 *    gantry, glass with an environment reflection + streaks (no realtime reflection pass), the inner LED strip and marquee bulbs
 *    (emissive, no extra light), the gantry rails / crossbar / carriage, cable, hub and three curled prongs, the clear chute
 *    baffle, the prize flap + tray, a joystick and a drop button that move, the coin slot, and a credit display on the sloped control deck. The pile toys are
 *    the real gashapon toy models built with the capped low-poly kit (buildToy `lo`), one merged vertex-coloured mesh each on
 *    one shared material; the won toy is swapped for its full-detail model (merged per finish) once it lands in the tray.
 *    Soft contact shadows (one instanced draw) ground the toys and the claw.
 * Physics lives in lib/claw/clawPhysics.ts; `update()` here only copies its state onto the meshes (no allocation per frame).
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {buildToy} from '../gashapon/toyModels';
import {gashaponToy} from '../gashapon/toys';
import {CHUTE,CLAW_BOX,PRONG,type ClawSim} from './clawPhysics';
import {clawPrize,clawToyScale} from './clawPrizes';

/** Machine frame: the play floor's height, the sim → machine offset, and the cabinet's outline. */
export const CLAW_FLOOR_Y=1.14;
export const CLAW_SIZE={halfW:1,front:.92,back:-.82,glassZ:.64,glassX:.92,top:3.45,canopy:2.84} as const;
const PAINT='#c8365f',PAINT_DARK='#8e2443',CREAM='#f4e8d4',FELT='#3d2f6e',INTERIOR='#16121e',BACKDROP='#56a35c';
const PHI=[-Math.PI/2,Math.PI/6,Math.PI*5/6];
/**
 * The sloped control deck (Nov 21 2026 fix pass): a console that juts out of the base front BELOW the glass floor, tilted toward
 * the player, so from the zoom camera the joystick and DROP button sit under the pile instead of over it. Machine frame.
 * `deckAt(x, along, up)`: a point `up` above the deck's top face, `along` metres from its middle (− = toward the glass).
 */
export const CLAW_DECK={x0:-.28,x1:.94,z:1.06,y:-.19,depth:.32,thick:.05,tilt:.34,stickX:.02,buttonX:.68,screenX:.35} as const;
function deckAt(x:number,along:number,up:number,out=new T.Vector3()){const D=CLAW_DECK,c=Math.cos(D.tilt),s=Math.sin(D.tilt),h=D.thick/2+up;return out.set(x,CLAW_FLOOR_Y+D.y+h*c-along*s,D.z+h*s+along*c);}
function deckBody(push:(g:Geo,part:'deck'|'support')=>void){const D=CLAW_DECK,w=D.x1-D.x0,cx=(D.x0+D.x1)/2;
 push(placed(new T.BoxGeometry(w,D.thick,D.depth),cx,CLAW_FLOOR_Y+D.y,D.z,D.tilt,0,0),'deck');
 push(placed(new T.BoxGeometry(w-.04,.1,.24),cx,CLAW_FLOOR_Y+D.y-.08,CLAW_SIZE.front+.12),'support');}

// ---- shared bits --------------------------------------------------------------------------------------------------------------
function signTexture(w:number,h:number,draw:(c:CanvasRenderingContext2D,w:number,h:number)=>void){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;draw(c,w,h);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function marquee(c:CanvasRenderingContext2D,w:number,h:number){
 c.fillStyle='#1b1230';c.fillRect(0,0,w,h);c.fillStyle='#f9c74f';c.fillRect(10,10,w-20,6);c.fillRect(10,h-16,w-20,6);
 c.textAlign='center';c.textBaseline='middle';c.font=`900 ${Math.round(h*.44)}px "Arial Black",Arial,sans-serif`;
 c.lineWidth=h*.06;c.strokeStyle='#7a1838';c.strokeText('CLAW CLUB',w/2,h*.43);c.fillStyle='#fff4e0';c.fillText('CLAW CLUB',w/2,h*.43);
 c.font=`800 ${Math.round(h*.15)}px Arial,sans-serif`;c.fillStyle='#ffd166';c.fillText('BEAN BUDDIES · WIN A TOY',w/2,h*.79);
}
type Geo=T.BufferGeometry;
const tmpM=new T.Matrix4(),tmpQ=new T.Quaternion(),tmpV=new T.Vector3(),tmpS=new T.Vector3(),tmpE=new T.Euler();
function placed(g:Geo,x:number,y:number,z:number,rx=0,ry=0,rz=0){tmpM.compose(tmpV.set(x,y,z),tmpQ.setFromEuler(tmpE.set(rx,ry,rz)),tmpS.set(1,1,1));g.applyMatrix4(tmpM);return g;}
function colored(g:Geo,color:string){const c=new T.Color(color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)c.toArray(a,i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;}
function mergeAll(list:Geo[]){const ok=list.map(g=>g.index?g:g);const m=mergeGeometries(ok,false);list.forEach(g=>g.dispose());if(!m)throw new Error('claw merge failed');m.computeBoundingSphere();return m;}

// ---- the room LOD -------------------------------------------------------------------------------------------------------------
export function buildClawLod(){
 const group=new T.Group();group.name='arcade-claw-lod';
 const parts:Geo[]=[],box=(x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>parts.push(colored(placed(new T.BoxGeometry(w,h,d),x,y,z),c));
 const cyl=(x:number,y:number,z:number,r:number,h:number,c:string)=>parts.push(colored(placed(new T.CylinderGeometry(r,r,h,10),x,y,z),c));
 const ball=(x:number,y:number,z:number,r:number,c:string)=>parts.push(colored(placed(new T.SphereGeometry(r,10,7),x,y,z),c));
 const S=CLAW_SIZE,F=CLAW_FLOOR_Y;
 box(0,F/2,.05,2,F,1.74,PAINT);box(0,.035,.05,2.02,.07,1.76,'#1a1420');box(0,F-.06,.93,2.02,.06,.04,CREAM);
 box(-.61,.65,.935,.5,.44,.02,INTERIOR);box(0,F+.015,.78,1.98,.03,.28,CREAM);deckBody((g,part)=>parts.push(colored(g,part==='deck'?CREAM:PAINT_DARK)));{const p=deckAt(CLAW_DECK.stickX,-.02,.15);ball(p.x,p.y,p.z,.045,'#e0303c');const q=deckAt(CLAW_DECK.buttonX,-.02,0);ball(q.x,q.y,q.z,.07,'#e0303c');}
 box(.55,.66,.93,.26,.32,.02,'#c9ced6');
 for(const x of [-S.glassX,S.glassX])for(const z of [-S.glassZ,S.glassZ])cyl(x,(F+S.canopy)/2,z,.04,S.canopy-F,'#d7dbe2');
 box(0,(F+S.canopy)/2,-.66,1.84,S.canopy-F,.03,BACKDROP);box(0,F-.01,0,1.84,.02,1.3,FELT);
 box(0,(S.canopy+S.top)/2,0,2,S.top-S.canopy,1.74,PAINT);box(0,S.canopy+.02,0,2.02,.04,1.76,PAINT_DARK);
 for(const x of [-.86,.86])box(x,2.76,0,.04,.04,1.24,'#b8bec8');
 // toy blobs in the real toys' colours (body + head)
 const ids=['claw-club-bean','maneki-mika','mango-max','tennis-tess','beachball-bea','glove-frog','clownfish-coco','juice-box-jun','pixel-ball'];
 const spots=[[.1,-.2],[.45,-.35],[-.25,-.3],[.6,.1],[.25,.2],[-.05,.15],[.7,-.25],[-.55,-.35],[.4,-.02]];
 ids.forEach((id,i)=>{const t=gashaponToy(id),[x,z]=spots[i];if(!t)return;ball(x,F+.11,z,.12,t.colors[0]);ball(x,F+.27,z+.02,.09,t.colors[0]);ball(x,F+.3,z+.1,.025,t.colors[1]);});
 // chute baffle hint
 box(CHUTE.x1,F+.07,(CHUTE.z0+CHUTE.z1)/2,.015,.14,CHUTE.z1-CHUTE.z0,'#9fd8e8');box((CHUTE.x0+CHUTE.x1)/2,F+.07,CHUTE.z0,CHUTE.x1-CHUTE.x0,.14,.015,'#9fd8e8');
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.55,metalness:.05});const mesh=new T.Mesh(mergeAll(parts),mat);mesh.name='claw-lod-body';group.add(mesh);
 const glassMat=new T.MeshStandardMaterial({color:'#cfe8ff',transparent:true,opacity:.16,roughness:.1,depthWrite:false});
 const glassGeo=mergeAll([placed(new T.PlaneGeometry(1.84,S.canopy-F),0,(F+S.canopy)/2,S.glassZ),placed(new T.PlaneGeometry(1.28,S.canopy-F),-S.glassX,(F+S.canopy)/2,0,0,-Math.PI/2),placed(new T.PlaneGeometry(1.28,S.canopy-F),S.glassX,(F+S.canopy)/2,0,0,Math.PI/2)]);
 const glass=new T.Mesh(glassGeo,glassMat);glass.renderOrder=2;group.add(glass);
 const tex=signTexture(512,160,marquee),signMat=new T.MeshBasicMaterial({map:tex,toneMapped:false}),signGeo=new T.PlaneGeometry(1.84,.54);
 const sign=new T.Mesh(signGeo,signMat);sign.position.set(0,(S.canopy+S.top)/2,.875);group.add(sign);
 // the idle carriage (slides in the room, arcadeRoomProps.ts)
 const cp:Geo[]=[];cp.push(colored(placed(new T.BoxGeometry(1.72,.05,.06),0,2.74,0),'#b8bec8'),colored(placed(new T.BoxGeometry(.16,.09,.13),0,2.72,0),'#3a3f4a'),
  colored(placed(new T.CylinderGeometry(.008,.008,.42,5),0,2.48,0),'#2a2a30'),colored(placed(new T.CylinderGeometry(.05,.05,.07,10),0,2.25,0),'#d7dbe2'));
 for(const a of PHI)cp.push(colored(placed(new T.BoxGeometry(.03,.2,.03),Math.cos(a)*.07,2.13,Math.sin(a)*.07,Math.sin(a)*.35,0,-Math.cos(a)*.35),'#d7dbe2'));
 const carriageMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.4});const carriage=new T.Mesh(mergeAll(cp),carriageMat);carriage.name='arcade-claw-carriage';group.add(carriage);
 const geos=[mesh.geometry,glassGeo,signGeo,carriage.geometry],mats=[mat,glassMat,signMat,carriageMat];
 return {group,carriage,dispose(){group.removeFromParent();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());tex.dispose();}};
}

// ---- the detailed machine -----------------------------------------------------------------------------------------------------
type ToyView={id:string;root:T.Group;scale:number;r:number;yaw:number;materials:T.Material[];geometries:Geo[];hi:boolean};
/**
 * A pile toy (Nov 21 2026 fix pass, owner: "lower-detail toy models for the pile"): the capped low-poly kit (buildToy `lo`), every
 * part merged into ONE vertex-coloured mesh on the pile's shared material, so each toy is one draw. The won toy is swapped for the
 * full-detail model (flattenToy) once it is in the tray; the Toy Shelf / "Look closer" viewer always builds its own full model.
 */
function pileToy(id:string,mat:T.Material):ToyView|null{
 const rig=buildToy(id,{lo:true}),prize=clawPrize(id);if(!rig||!prize)return null;
 rig.root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(rig.root.matrixWorld).invert(),list:Geo[]=[];
 for(const m of rig.meshes){let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='color')g.deleteAttribute(k);
  if(!g.getAttribute('color'))g=colored(g,'#ffffff');g.applyMatrix4(tmpM.multiplyMatrices(inv,m.matrixWorld));list.push(g);}
 rig.dispose();const merged=mergeAll(list),root=new T.Group();root.name=`claw-toy-${id}`;const mesh=new T.Mesh(merged,mat);mesh.name='claw-pile-toy';root.add(mesh);
 return {id,root,scale:clawToyScale(prize),r:0,yaw:0,materials:[],geometries:[merged],hi:false};
}
/** One toy rig re-merged per material (draws = finishes used), standing on y = 0. */
function flattenToy(id:string,env:T.Texture|null):ToyView|null{
 const rig=buildToy(id),prize=clawPrize(id);if(!rig||!prize)return null;
 rig.root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(rig.root.matrixWorld).invert(),by=new Map<T.Material,Geo[]>();
 for(const m of rig.meshes){const g=m.geometry.clone();g.applyMatrix4(tmpM.multiplyMatrices(inv,m.matrixWorld));const mat=Array.isArray(m.material)?m.material[0]:m.material;let l=by.get(mat);if(!l){l=[];by.set(mat,l);}l.push(g);}
 const root=new T.Group();root.name=`claw-toy-${id}`;const geometries:Geo[]=[];
 for(const [mat,list] of by){let merged:Geo|null=null;try{merged=mergeGeometries(list,false);}catch{merged=null;}
  if(merged){list.forEach(g=>g.dispose());merged.computeBoundingSphere();geometries.push(merged);const mesh=new T.Mesh(merged,mat);mesh.renderOrder=(mat as T.Material).transparent?3:0;root.add(mesh);}
  else for(const g of list){geometries.push(g);root.add(new T.Mesh(g,mat));}}
 for(const m of rig.meshes)m.geometry.dispose();for(const p of rig.proxies){p.geometry.dispose();(p.material as T.Material).dispose();}
 for(const mat of rig.materials){const std=mat as T.MeshStandardMaterial;if(env&&'envMap' in std){std.envMap=env;std.envMapIntensity=.75;std.needsUpdate=true;}}
 return {id,root,scale:clawToyScale(prize),r:0,yaw:0,materials:rig.materials,geometries,hi:true};
}

export function buildClawDetail(renderer:T.WebGLRenderer,pile:readonly string[],sim:ClawSim){
 const group=new T.Group();group.name='arcade-claw-detail';
 const geometries:Geo[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 // Environment reflection (one PMREM, built once): chrome, clearcoat and glass reflect a soft room. No realtime pass.
 const pmrem=new T.PMREMGenerator(renderer),envScene=new RoomEnvironment(),envRT=pmrem.fromScene(envScene,.04);envScene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});pmrem.dispose();
 const env=envRT.texture;
 const mat=<M extends T.Material>(m:M)=>{materials.push(m);return m;};
 const paint=mat(new T.MeshPhysicalMaterial({color:PAINT,roughness:.42,metalness:.15,clearcoat:1,clearcoatRoughness:.12,envMap:env,envMapIntensity:.9}));
 const paintDark=mat(new T.MeshPhysicalMaterial({color:PAINT_DARK,roughness:.5,metalness:.2,clearcoat:.8,clearcoatRoughness:.2,envMap:env,envMapIntensity:.7}));
 const cream=mat(new T.MeshPhysicalMaterial({color:CREAM,roughness:.5,clearcoat:.6,clearcoatRoughness:.25,envMap:env,envMapIntensity:.7}));
 const chrome=mat(new T.MeshStandardMaterial({color:'#f2f4f8',metalness:1,roughness:.13,envMap:env,envMapIntensity:1.25}));
 const brushed=mat(new T.MeshStandardMaterial({color:'#b9bec7',metalness:.9,roughness:.38,envMap:env,envMapIntensity:.9}));
 const darkMetal=mat(new T.MeshStandardMaterial({color:'#2b2f38',metalness:.6,roughness:.45,envMap:env,envMapIntensity:.6}));
 const rubber=mat(new T.MeshStandardMaterial({color:'#15131a',roughness:.85}));
 const interior=mat(new T.MeshStandardMaterial({color:INTERIOR,roughness:.9,side:T.DoubleSide}));
 const felt=mat(new T.MeshStandardMaterial({color:FELT,roughness:1}));
 const red=mat(new T.MeshPhysicalMaterial({color:'#e3263a',roughness:.25,clearcoat:1,clearcoatRoughness:.05,emissive:'#5a0710',emissiveIntensity:.6,envMap:env,envMapIntensity:.8}));
 const glass=mat(new T.MeshStandardMaterial({color:'#e8f4ff',metalness:0,roughness:.03,transparent:true,opacity:.1,depthWrite:false,envMap:env,envMapIntensity:2.4,side:T.DoubleSide}));
 const strip=mat(new T.MeshBasicMaterial({color:'#fff6ea',toneMapped:false}));
 const S=CLAW_SIZE,F=CLAW_FLOOR_Y,H=S.canopy-F;
 const add=(g:Geo,m:T.Material,name?:string)=>{geometries.push(g);const mesh=new T.Mesh(g,m);if(name)mesh.name=name;group.add(mesh);return mesh;};
 const statics=new Map<T.Material,Geo[]>(),st=(m:T.Material,g:Geo)=>{let l=statics.get(m);if(!l){l=[];statics.set(m,l);}l.push(g);};
 const rbox=(w:number,h:number,d:number)=>new T.BoxGeometry(w,h,d);
 // Base cabinet: body, front panel with the prize opening, kick plate, cream trim, the control deck in front of the glass.
 const ox0=CHUTE.x0,ox1=CHUTE.x1,oy0=.42,oy1=.88;
 // (built around the chute shaft and the tray recess, so both stay open)
 const zc=CHUTE.z0,zt=CHUTE.z1,fd=S.front-zt,fz=(S.front+zt)/2;
 st(paint,placed(rbox(2,F,zc-S.back),0,F/2,(S.back+zc)/2));st(paint,placed(rbox(1-ox1,F,zt-zc),(1+ox1)/2,F/2,(zc+zt)/2));st(paint,placed(rbox(1+ox0,F,zt-zc),(-1+ox0)/2,F/2,(zc+zt)/2));
 st(paint,placed(rbox(1+ox0,F,fd),(-1+ox0)/2,F/2,fz));st(paint,placed(rbox(1-ox1,F,fd),(1+ox1)/2,F/2,fz));
 st(paint,placed(rbox(ox1-ox0,oy0,fd),(ox0+ox1)/2,oy0/2,fz));st(paint,placed(rbox(ox1-ox0,F-oy1,fd),(ox0+ox1)/2,(F+oy1)/2,fz));
 st(rubber,placed(rbox(2.02,.07,1.76),0,.035,.05));st(cream,placed(rbox(2.03,.05,1.77),0,F-.05,.05));st(cream,placed(rbox(2.03,.035,1.77),0,.3,.05));
 // the prize opening: chrome bezel, the dark tray recess, a "PUSH" flap at its back
 for(const [x,y,w,h] of [[ox0-.02,(oy0+oy1)/2,.03,oy1-oy0+.06],[ox1+.02,(oy0+oy1)/2,.03,oy1-oy0+.06],[(ox0+ox1)/2,oy1+.02,ox1-ox0+.07,.03],[(ox0+ox1)/2,oy0-.02,ox1-ox0+.07,.03]])st(chrome,placed(rbox(w,h,.03),x,y,S.front+.005));
 st(interior,placed(rbox(ox1-ox0,.02,S.front-CHUTE.z1),(ox0+ox1)/2,F+CHUTE.trayY-.01,(S.front+CHUTE.z1)/2));
 st(interior,placed(new T.PlaneGeometry(S.front-CHUTE.z1,oy1-oy0),ox0+.001,(oy0+oy1)/2,(S.front+CHUTE.z1)/2,0,Math.PI/2));st(interior,placed(new T.PlaneGeometry(S.front-CHUTE.z1,oy1-oy0),ox1-.001,(oy0+oy1)/2,(S.front+CHUTE.z1)/2,0,-Math.PI/2));
 st(interior,placed(new T.PlaneGeometry(ox1-ox0,S.front-CHUTE.z1),(ox0+ox1)/2,oy1-.001,(S.front+CHUTE.z1)/2,Math.PI/2,0,0));
 // control deck on the base top, in front of the glass
 st(cream,placed(rbox(1.98,.03,S.front-S.glassZ),0,F+.015,(S.front+S.glassZ)/2));
 // the sloped control deck below the glass floor (CLAW_DECK): cream top, dark support, a chrome edge, the stick plate and button ring
 deckBody((g,part)=>st(part==='deck'?cream:paintDark,g));
 {const D=CLAW_DECK,e=deckAt((D.x0+D.x1)/2,D.depth/2,-D.thick/2);st(chrome,placed(rbox(D.x1-D.x0+.01,.02,.02),e.x,e.y,e.z));
  const pl=deckAt(D.stickX,-.02,.008),rg=deckAt(D.buttonX,-.02,.008);st(darkMetal,placed(new T.CylinderGeometry(.07,.08,.016,24),pl.x,pl.y,pl.z,D.tilt,0,0));st(chrome,placed(new T.CylinderGeometry(.095,.095,.016,28),rg.x,rg.y,rg.z,D.tilt,0,0));}
 // coin door + credit display on the base front
 st(brushed,placed(rbox(.3,.38,.025),.58,.64,S.front+.012));st(rubber,placed(rbox(.018,.1,.01),.58,.68,S.front+.026));st(chrome,placed(rbox(.06,.14,.012),.58,.68,S.front+.026));
 st(rubber,placed(rbox(.09,.05,.01),.58,.53,S.front+.026));
 // glass box: chrome posts, back panel, felt floor with the chute hole, the shaft walls, the clear baffle with chrome caps
 for(const x of [-S.glassX,S.glassX])for(const z of [-S.glassZ,S.glassZ])st(chrome,placed(new T.CylinderGeometry(.042,.042,H,20),x,F+H/2,z));
 for(const y of [F+.02,S.canopy-.02])for(const z of [-S.glassZ,S.glassZ])st(chrome,placed(rbox(1.84,.035,.035),0,y,z));
 for(const y of [F+.02,S.canopy-.02])for(const x of [-S.glassX,S.glassX])st(chrome,placed(rbox(.035,.035,1.28),x,y,0));
 st(felt,placed(rbox(1.84,.04,CHUTE.z0+.66),0,F-.02,(CHUTE.z0-.66)/2));st(felt,placed(rbox(.92-ox1,.04,.66-CHUTE.z0),(ox1+.92)/2,F-.02,(CHUTE.z0+.66)/2));
 st(felt,placed(rbox(ox0+.92,.04,.66-CHUTE.z0),(ox0-.92)/2,F-.02,(CHUTE.z0+.66)/2));
 st(interior,placed(new T.PlaneGeometry(CHUTE.z1-CHUTE.z0,.6),ox1,F-.3,(CHUTE.z0+CHUTE.z1)/2,0,Math.PI/2));st(interior,placed(new T.PlaneGeometry(ox1-ox0,.6),(ox0+ox1)/2,F-.3,CHUTE.z0));
 st(interior,placed(new T.PlaneGeometry(ox1-ox0,.62),(ox0+ox1)/2,F+CHUTE.slopeY0-.17,(CHUTE.z0+CHUTE.z1)/2,-Math.PI/2+Math.atan(CHUTE.slopeK),0,0));
 st(chrome,placed(rbox(.02,.02,CHUTE.z1-CHUTE.z0),ox1,F+CHUTE.baffle,(CHUTE.z0+CHUTE.z1)/2));st(chrome,placed(rbox(ox1-ox0,.02,.02),(ox0+ox1)/2,F+CHUTE.baffle,CHUTE.z0));
 // inner LED strip along the top front + down the front posts (emissive: this IS the cabinet's light)
 st(strip,placed(rbox(1.78,.025,.03),0,S.canopy-.06,S.glassZ-.05));for(const x of [-S.glassX+.05,S.glassX-.05])st(strip,placed(rbox(.018,H-.2,.018),x,F+H/2,S.glassZ-.05));
 // canopy: body, a darker skirt, the gantry rails under it
 st(paint,placed(rbox(2,S.top-S.canopy,1.74),0,(S.canopy+S.top)/2,0));st(paintDark,placed(rbox(2.03,.06,1.77),0,S.canopy+.03,0));st(cream,placed(rbox(2.03,.04,1.77),0,S.top-.02,0));
 st(darkMetal,placed(rbox(1.84,.02,1.3),0,S.canopy-.005,0));for(const x of [-.86,.86])st(brushed,placed(rbox(.045,.045,1.26),x,2.77,0));
 for(const [m,list] of statics){const g=mergeAll(list);add(g,m);}
 // glass panes (front + sides) and the baffle; streaks are a faint additive texture on the front pane
 const pane=(w:number,h:number)=>new T.PlaneGeometry(w,h);
 const glassGeo=mergeAll([placed(pane(1.8,H-.04),0,F+H/2,S.glassZ),placed(pane(1.24,H-.04),-S.glassX,F+H/2,0,0,Math.PI/2),placed(pane(1.24,H-.04),S.glassX,F+H/2,0,0,Math.PI/2),
  placed(pane(CHUTE.z1-CHUTE.z0,CHUTE.baffle),ox1,F+CHUTE.baffle/2,(CHUTE.z0+CHUTE.z1)/2,0,Math.PI/2),placed(pane(ox1-ox0,CHUTE.baffle),(ox0+ox1)/2,F+CHUTE.baffle/2,CHUTE.z0)]);
 const glassMesh=add(glassGeo,glass,'claw-glass');glassMesh.renderOrder=4;
 const streakTex=signTexture(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.globalCompositeOperation='lighter';for(const [x,wd,a] of [[.18,.07,.22],[.3,.02,.3],[.62,.12,.12],[.78,.03,.25]] as const){c.fillStyle=`rgba(255,255,255,${a})`;c.save();c.translate(x*w,0);c.transform(1,0,-.45,1,0,0);c.fillRect(0,0,wd*w,h);c.restore();}});
 textures.push(streakTex);const streakMat=mat(new T.MeshBasicMaterial({map:streakTex,transparent:true,opacity:.35,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));
 const streak=add(placed(pane(1.8,H-.04),0,F+H/2,S.glassZ+.003),streakMat,'claw-glass-streaks');streak.renderOrder=5;
 // backdrop: a printed pitch seen from above (mown stripes, the lines, the centre circle and both boxes), so the pile reads
 // against a light, busy ground like a real machine's poster, and the poster is football (house rule)
 const backTex=signTexture(512,384,(c,w,h)=>{for(let i=0;i<10;i++){c.fillStyle=i%2?'#4f9a55':'#5aa960';c.fillRect(i*w/10,0,w/10,h);}
  c.strokeStyle='#eef7e8';c.lineWidth=5;const m=18;c.strokeRect(m,m,w-2*m,h-2*m);c.beginPath();c.moveTo(w/2,m);c.lineTo(w/2,h-m);c.stroke();
  c.beginPath();c.arc(w/2,h/2,52,0,Math.PI*2);c.stroke();c.fillStyle='#eef7e8';c.beginPath();c.arc(w/2,h/2,5,0,Math.PI*2);c.fill();
  for(const side of [0,1]){const x=side?w-m:m,dir=side?-1:1;c.strokeRect(side?x-78:x,h/2-92,78,184);c.strokeRect(side?x-28:x,h/2-44,28,88);c.beginPath();c.arc(x+dir*58,h/2,4,0,Math.PI*2);c.fill();
   c.beginPath();c.arc(x+dir*58,h/2,46,side?Math.PI*.71:-Math.PI*.29,side?Math.PI*1.29:Math.PI*.29);c.stroke();}});
 textures.push(backTex);const backMat=mat(new T.MeshStandardMaterial({map:backTex,roughness:.8,emissive:'#ffffff',emissiveMap:backTex,emissiveIntensity:.18}));add(placed(pane(1.84,H),0,F+H/2,-.655),backMat,'claw-backdrop');
 // marquee + chase bulbs
 const marqTex=signTexture(1024,300,marquee);textures.push(marqTex);const marqMat=mat(new T.MeshBasicMaterial({map:marqTex,toneMapped:false}));
 add(placed(pane(1.8,.52),0,(S.canopy+S.top)/2,.874),marqMat,'claw-marquee');
 const bulbGeo=new T.SphereGeometry(.022,10,8);geometries.push(bulbGeo);const bulbMat=mat(new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}));
 const bulbSpots:number[]=[];for(let i=0;i<12;i++){const x=-.92+i*(1.84/11);bulbSpots.push(x,S.top-.045,x,S.canopy+.09);}for(const x of [-.96,.96])for(let j=1;j<4;j++)bulbSpots.push(x,S.canopy+.09+j*(S.top-S.canopy-.14)/4);
 const bulbCount=bulbSpots.length/2,bulbs=new T.InstancedMesh(bulbGeo,bulbMat,bulbCount);bulbs.name='claw-bulbs';const o=new T.Object3D();
 for(let i=0;i<bulbCount;i++){o.position.set(bulbSpots[2*i],bulbSpots[2*i+1],.885);o.updateMatrix();bulbs.setMatrixAt(i,o.matrix);bulbs.setColorAt(i,new T.Color('#ffd27a'));}group.add(bulbs);
 // credit display (canvas, redrawn only when its text changes)
 const dispCanvas=document.createElement('canvas');dispCanvas.width=256;dispCanvas.height=72;const dc=dispCanvas.getContext('2d')!;const dispTex=new T.CanvasTexture(dispCanvas);dispTex.colorSpace=T.SRGBColorSpace;textures.push(dispTex);
 const dispMat=mat(new T.MeshBasicMaterial({map:dispTex,toneMapped:false}));{const p=deckAt(CLAW_DECK.screenX,-.02,.003);add(placed(pane(.3,.085),p.x,p.y,p.z,-Math.PI/2+CLAW_DECK.tilt,0,0),dispMat,'claw-display');}
 let dispText='';
 function display(text:string){if(text===dispText)return;dispText=text;dc.fillStyle='#120a0a';dc.fillRect(0,0,256,72);dc.font='700 40px "Courier New",monospace';dc.textAlign='center';dc.textBaseline='middle';dc.fillStyle='#ff4b3e';dc.shadowColor='#ff2a1a';dc.shadowBlur=10;dc.fillText(text,128,38);dc.shadowBlur=0;dispTex.needsUpdate=true;}
 display('INSERT 10');
 // printed decals on the base: a band under the prize door and a PRIZE label over it
 const bandTex=signTexture(1024,128,(c,w,h)=>{c.fillStyle=CREAM;c.fillRect(0,0,w,h);c.fillStyle=PAINT_DARK;c.font='900 54px "Arial Black",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('WIN A BEAN BUDDY',w*.36,h/2+2);
  for(const x of [w*.78,w*.9]){c.fillStyle='#ffffff';c.beginPath();c.arc(x,h/2,40,0,Math.PI*2);c.fill();c.lineWidth=5;c.strokeStyle=PAINT_DARK;c.stroke();c.fillStyle=PAINT_DARK;c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.lineTo(x+Math.cos(a)*15,h/2+Math.sin(a)*15);}c.fill();}});textures.push(bandTex);
 const bandMat=mat(new T.MeshStandardMaterial({map:bandTex,roughness:.45,envMap:env,envMapIntensity:.5}));add(placed(pane(1.9,.2),0,.19,S.front+.003),bandMat,'claw-band');
 const prizeTex=signTexture(256,64,(c,w,h)=>{c.fillStyle=CREAM;c.fillRect(0,0,w,h);c.fillStyle=PAINT_DARK;c.font='900 40px "Arial Black",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('PRIZE',w/2,h/2+2);});textures.push(prizeTex);
 const prizeMat=mat(new T.MeshStandardMaterial({map:prizeTex,roughness:.45,envMap:env,envMapIntensity:.5}));add(placed(pane(.34,.085),(ox0+ox1)/2,oy1+.1,S.front+.003),prizeMat,'claw-prize-label');
 // the prize flap (hinged at its top edge, swings out toward the tray)
 const flapGeo=new T.BoxGeometry(ox1-ox0-.02,CHUTE.flapLen,.012);flapGeo.translate(0,-CHUTE.flapLen/2,0);geometries.push(flapGeo);
 const flapMat=mat(new T.MeshStandardMaterial({color:'#2a2333',roughness:.3,metalness:.1,transparent:true,opacity:.86,envMap:env,envMapIntensity:.8}));
 const flap=new T.Mesh(flapGeo,flapMat);flap.position.set((ox0+ox1)/2,F+CHUTE.flapTop,CHUTE.z1);group.add(flap);
 // joystick (pivot at the base) and the drop button
 const deckTilt=new T.Group();deckTilt.rotation.x=CLAW_DECK.tilt;deckAt(CLAW_DECK.stickX,-.02,.016,deckTilt.position);group.add(deckTilt);
 const stick=new T.Group();deckTilt.add(stick);
 const shaftGeo=new T.CylinderGeometry(.012,.014,.13,12);shaftGeo.translate(0,.065,0);geometries.push(shaftGeo);stick.add(new T.Mesh(shaftGeo,chrome));
 const knobGeo=new T.SphereGeometry(.045,24,18);knobGeo.translate(0,.15,0);geometries.push(knobGeo);stick.add(new T.Mesh(knobGeo,red));
 const bootGeo=new T.SphereGeometry(.04,16,8,0,Math.PI*2,0,Math.PI/2);bootGeo.scale(1,.45,1);geometries.push(bootGeo);const boot=new T.Mesh(bootGeo,rubber);deckTilt.add(boot);
 const buttonGeo=new T.SphereGeometry(.075,28,14,0,Math.PI*2,0,Math.PI/2);buttonGeo.scale(1,.5,1);geometries.push(buttonGeo);
 const buttonTilt=new T.Group();buttonTilt.rotation.x=CLAW_DECK.tilt;deckAt(CLAW_DECK.buttonX,-.02,.016,buttonTilt.position);group.add(buttonTilt);const button=new T.Mesh(buttonGeo,red);buttonTilt.add(button);
 // gantry: crossbar (moves in z), carriage (moves in x), cable, hub, three prongs
 const crossGeo=new T.BoxGeometry(1.72,.045,.06);geometries.push(crossGeo);const cross=new T.Mesh(crossGeo,brushed);cross.position.y=2.745;group.add(cross);
 const carriage=new T.Group();group.add(carriage);
 for(const [g,m,y] of [[new T.BoxGeometry(.17,.085,.13),darkMetal,2.71],[new T.CylinderGeometry(.035,.035,.12,16),brushed,2.71],[new T.CylinderGeometry(.03,.03,.02,16),chrome,2.66]] as const){
  const geo=g as Geo;if(g instanceof T.CylinderGeometry&&y===2.71)geo.rotateZ(Math.PI/2);geometries.push(geo);const mesh=new T.Mesh(geo,m as T.Material);mesh.position.y=(y as number)-2.7;carriage.add(mesh);}
 carriage.position.y=2.7;
 const cableGeo=new T.CylinderGeometry(.0045,.0045,1,6);cableGeo.translate(0,-.5,0);geometries.push(cableGeo);const cable=new T.Mesh(cableGeo,rubber);group.add(cable);
 const hub=new T.Group();group.add(hub);
 for(const [g,m,y] of [[new T.CylinderGeometry(.052,.058,.07,28),chrome,0],[new T.CylinderGeometry(.03,.05,.04,24),darkMetal,.05],[new T.CylinderGeometry(.06,.06,.012,28),brushed,-.035]] as const){const geo=g as Geo;geometries.push(geo);const mesh=new T.Mesh(geo,m as T.Material);mesh.position.y=y as number;hub.add(mesh);}
 // a prong in its own frame (radial = +x): a curved finger knuckle → joint, then the tip curling inward
 const hkx=Math.sin(-1.75)*PRONG.tip,hky=-Math.cos(-1.75)*PRONG.tip;// the tip hook, as in clawPhysics.ts fingers()
 const fingerCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.014,-PRONG.len*.5,0),new T.Vector3(0,-PRONG.len,0),new T.Vector3(hkx*.55,-PRONG.len+hky*.55-.006,0),new T.Vector3(hkx,-PRONG.len+hky,0)]);
 const fingerGeo=new T.TubeGeometry(fingerCurve,24,PRONG.rad,10,false);geometries.push(fingerGeo);
 const knuckleGeo=new T.SphereGeometry(PRONG.rad*1.4,12,8);geometries.push(knuckleGeo);
 const fingers=PHI.map(a=>{const arm=new T.Group();arm.rotation.y=-a;const pivot=new T.Group();pivot.position.set(PRONG.knuckle,-PRONG.drop,0);arm.add(pivot);
  pivot.add(new T.Mesh(fingerGeo,chrome));pivot.add(new T.Mesh(knuckleGeo,darkMetal));const tip=new T.Mesh(knuckleGeo,rubber);tip.position.copy(fingerCurve.points[4]);pivot.add(tip);hub.add(arm);return pivot;});
 // contact shadows: one soft disc per toy + one under the claw
 const shadowTex=signTexture(64,64,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});textures.push(shadowTex);
 const shadowGeo=new T.PlaneGeometry(1,1);shadowGeo.rotateX(-Math.PI/2);geometries.push(shadowGeo);const shadowMat=mat(new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false}));
 const shadows=new T.InstancedMesh(shadowGeo,shadowMat,pile.length+1);shadows.renderOrder=1;shadows.frustumCulled=false;group.add(shadows);
 // the toys
 // the toys: low-poly pile toys on one shared material (one draw each); `hi` swaps a slot to the full-detail model (the won toy)
 const pileMat=mat(new T.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:0,envMap:env,envMapIntensity:.7}));
 const toys:(ToyView|null)[]=pile.map((id,i)=>{const v=pileToy(id,pileMat);if(v){v.yaw=((i*2.399)%1.6)-.8;group.add(v.root);}return v;});
 function setToy(slot:number,id:string,hi=false){const old=toys[slot];
  if(old?.id===id&&old.hi===hi)return;
  const v=hi?flattenToy(id,env):pileToy(id,pileMat);if(!v)return;// keep the old model rather than leave a gap
  if(old){v.root.position.copy(old.root.position);v.root.quaternion.copy(old.root.quaternion);v.root.scale.copy(old.root.scale);v.root.visible=old.root.visible;
   old.root.removeFromParent();old.geometries.forEach(g=>g.dispose());old.materials.forEach(m=>{(m as T.MeshStandardMaterial).normalMap?.dispose();m.dispose();});}
  v.yaw=((slot*2.399)%1.6)-.8;group.add(v.root);toys[slot]=v;}

 // ---- per-frame copy of the sim state (no allocation) ----
 const up=new T.Vector3(0,1,0),axis=new T.Vector3(),q=new T.Quaternion(),qy=new T.Quaternion(),cableDir=new T.Vector3();
 let chase=0,chaseT=0,idleT=0;const bulbColor=new T.Color(),warm=new T.Color('#ffd27a'),hot=new T.Color('#ffffff'),pink=new T.Color('#ff5c8a'),dim=new T.Color('#6b4a2a');
 function update(dt:number,input:{x:number;z:number;pressed:number}){
  const s=sim.state;
  cross.position.z=s.cz;carriage.position.set(s.cx,2.7,s.cz);
  const ax=s.cx,ay=CLAW_BOX.gantryY-.06+F,az=s.cz,hx=s.hx,hy=s.hy+F,hz=s.hz;
  cableDir.set(hx-ax,hy-ay,hz-az);const len=cableDir.length()||1e-3;cable.position.set(ax,ay,az);cable.scale.set(1,len,1);
  cableDir.multiplyScalar(-1/len);cable.quaternion.setFromUnitVectors(up,cableDir);
  hub.position.set(hx,hy,hz);hub.quaternion.copy(cable.quaternion);
  for(let k=0;k<3;k++)fingers[k].rotation.z=sim.theta[k];
  for(let i=0;i<toys.length;i++){const v=toys[i];if(!v)continue;const on=!!sim.active[i];v.root.visible=on;if(!on)continue;
   const a=2*i,b=a+1,r=sim.pr[a];axis.set(sim.px[b]-sim.px[a],sim.py[b]-sim.py[a],sim.pz[b]-sim.pz[a]).normalize();
   q.setFromUnitVectors(up,axis);qy.setFromAxisAngle(up,v.yaw);v.root.quaternion.multiplyQuaternions(q,qy);
   v.root.position.set(sim.px[a]-axis.x*r,sim.py[a]-axis.y*r+F,sim.pz[a]-axis.z*r);
   const sq=sim.squash[i],sc=v.scale;v.root.scale.set(sc*(1-sq*.5),sc*(1+sq),sc*(1-sq*.5));}
  // shadows: on the floor under each toy (fading with height), hidden in the chute
  for(let i=0;i<=toys.length;i++){let x=0,z=0,y=0,size=0;
   if(i<toys.length){const on=!!sim.active[i]&&toys[i];const cx=(sim.px[2*i]+sim.px[2*i+1])/2,cz=(sim.pz[2*i]+sim.pz[2*i+1])/2,lo=Math.min(sim.py[2*i],sim.py[2*i+1])-sim.pr[2*i];
    const overHole=cx<CHUTE.x1&&cz>CHUTE.z0;if(on&&!overHole&&lo>-.02){x=cx;z=cz;y=F+.004+i*.0003;size=(sim.pr[2*i]*3.2)*Math.max(.3,1-lo*.9);}}
   else{const overHole=hx<CHUTE.x1&&hz>CHUTE.z0;if(!overHole){x=hx;z=hz;y=F+.006;size=.3*Math.max(.25,1-s.hy*.55);}}
   o.position.set(x,y,z);o.scale.set(size||1e-4,1,size||1e-4);o.updateMatrix();shadows.setMatrixAt(i,o.matrix);}
  shadows.instanceMatrix.needsUpdate=true;
  flap.rotation.x=s.flap;
  // controls follow the hand
  stick.rotation.x+=((input.z*.38)-stick.rotation.x)*Math.min(1,dt*18);stick.rotation.z+=((-input.x*.38)-stick.rotation.z)*Math.min(1,dt*18);
  const press=Math.max(0,input.pressed);button.position.y=-.012*press;button.scale.y=1-.25*press;
  // bulbs: a slow idle chase; a fast pink/white chase after a win (`celebrate`)
  chaseT=Math.max(0,chaseT-dt);idleT+=dt;const fast=chaseT>0,step=Math.floor(idleT*(fast?14:3));
  if(step!==chase){chase=step;for(let i=0;i<bulbCount;i++){const on=fast?(i+step)%3===0:(i+step)%4===0;bulbColor.copy(fast?(on?hot:pink):(on?warm:dim));bulbs.setColorAt(i,bulbColor);}bulbs.instanceColor!.needsUpdate=true;}
 }
 return {group,update,display,setToy,celebrate(seconds=3){chaseT=seconds;},
  stats(){let draws=0,tris=0;group.traverse(o=>{if((o as T.Mesh).isMesh&&o.visible){draws++;const g=(o as T.Mesh).geometry;tris+=((g.index?g.index.count:g.getAttribute('position').count)/3)*((o as T.InstancedMesh).isInstancedMesh?(o as T.InstancedMesh).count:1);}});return {draws,tris};},
  dispose(){group.removeFromParent();for(const v of toys)if(v){v.geometries.forEach(g=>g.dispose());v.materials.forEach(m=>{(m as T.MeshStandardMaterial).normalMap?.dispose();m.dispose();});}
   geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());bulbs.dispose();shadows.dispose();envRT.dispose();}};
}
export type ClawDetail=ReturnType<typeof buildClawDetail>;
