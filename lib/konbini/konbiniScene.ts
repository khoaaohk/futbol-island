import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createPlayer,profileFor,type PlayerMotion} from '../graphics/player';
import {loadCustomization,beanLookFor,playerOutfit} from '../town/customization';
import {getQuizProgress} from '../town/quizProgress';
import {npcDress} from '../town/beanLooks';
import {addBallPatches,createBallAppearance} from '../graphics/ballAppearance';
import {frameCapSlot} from '../town/frameCap';
import {tierSettings} from '../graphics/heatTier';
import {KONBINI_VARIANTS,type Fixture,type KonbiniVariant} from './konbiniVariants';
import {paintKonbiniAtlas,cellRect,DECOR,magazineCell,SIGN_RECT,CAY_SIGN_RECT,POSTER_RECTS,SURFBOARD_RECT,ATLAS_W,ATLAS_H} from './konbiniAtlas';
import {shopMenu,type KonbiniShop} from './food';
import {CASHIERS,MAGAZINES,type ShelfId} from './konbiniContent';
import {createKonbiniSound} from './konbiniSound';
import {createProductCache,hasProduct,stockJitter,PRODUCT_NOMINAL,STOCK,fridgeDoors,riceFacings,gondolaFacings} from './productMeshes';
import {findFloorPath,createStuckWatch} from './konbiniPath';
import {createKonbiniBall,type BallEvent} from './konbiniBall';
import {konbiniSfx} from './konbiniSound';
import {zoomTargets,nearestTarget,easeZoom,ZOOM_IN_SECONDS,ZOOM_OUT_SECONDS,type ZoomSection,type ZoomTarget} from './konbiniZoom';

/**
 * The Konbini interior (one engine, two data-driven variants: konbiniVariants.ts). Heat (docs/performance-guide.md,
 * "Konbini interior"): the island is not loaded at all (document boundary, like the Arcade); every static box is ONE merged
 * vertex-coloured Lambert mesh, every printed thing (products, magazines, posters, signs) ONE merged mesh on one canvas
 * atlas, the fridge glass ONE mesh, the sliding doors one 2-instance mesh; two lights, no shadow maps (fake contact discs).
 * The loop runs only while something moves (walking, doors, greeting, eating, camera settle) and sleeps otherwise; phones
 * are capped at 30 fps (frameCap) with the heat tier's pixel-ratio and frame caps.
 */
/** A tappable product on a real shelf (food, gear or a magazine) with its world position. */
export type KonbiniSlot={key:string;kind:'food'|'gear'|'magazine'|'decor';ref:string;fi:number;lx:number;cell:number;pos:T.Vector3;size:number;
 /** 3D shelf product (lib/konbini/productMeshes.ts): its key, base point, yaw and scale, for the tap lift. Magazines have none. */
 product?:{key:string;base:T.Vector3;yaw:number;scale:number;bi:number}};
/** A slot projected to the screen while zoomed (CSS px, centre + square size ≥ 44). */
export type KonbiniSlotView={key:string;kind:KonbiniSlot['kind'];ref:string;x:number;y:number;size:number};
export type KonbiniZoomView={index:number;count:number;label:string;poi:ShelfId;arrived:boolean};
export type KonbiniPoi={id:ShelfId;label:string;a:{x:number;z:number};b:{x:number;z:number};face:{x:number;z:number};box:T.Box3;verb:string};
type Rect={x:number;y:number;w:number;h:number};
/** A collision box; `fi` is the fixture it belongs to (−1 for the shell), so a shot knows which bay it hit. */
type Obstacle={minX:number;maxX:number;minZ:number;maxZ:number;fi:number};
const VERB:Record<ShelfId,string>={rice:'Look',drinks:'Look',snacks:'Look',hot:'Look',gear:'Look',beach:'Look',magazines:'Read',counter:'Talk',atm:'Check'};
const LABEL:Record<ShelfId,string>={rice:'Rice case',drinks:'Drinks fridge',snacks:'Snack shelf',hot:'Hot counter',gear:'Toys & gear',beach:'Beach corner',magazines:'Magazines',counter:'Cashier',atm:'ATM & copier'};

export function createKonbiniScene(canvas:HTMLCanvasElement,shop:KonbiniShop,callbacks:{
 onNear?:(poi:KonbiniPoi|null)=>void;onPrompt?:(x:number,y:number,visible:boolean)=>void;onArrive?:(poi:KonbiniPoi)=>void;onExit?:()=>void;
 onZoom?:(view:KonbiniZoomView|null)=>void;onSlots?:(slots:KonbiniSlotView[])=>void;onFirstFrame?:()=>void;onZoomArrive?:(poi:ShelfId)=>void;onZoomStep?:()=>void;
 /** The ball actions (lib/konbini/konbiniBall.ts): strikes, shelf hits, keep-up touches, drops, the ball back at the feet. */
 onBall?:(e:BallEvent)=>void;}={}){
 const mobile=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const V:KonbiniVariant=KONBINI_VARIANTS[shop],P=V.palette;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 const tier=tierSettings(),pixelRatio=()=>Math.min(devicePixelRatio||1,mobile?Math.min(1.5,tierSettings().maxPixelRatio):Math.min(2,tierSettings().maxPixelRatio));
 renderer.setPixelRatio(pixelRatio());renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color(P.sky);
 const camera=new T.OrthographicCamera(-8,8,6,-6,.1,80);
 scene.add(new T.HemisphereLight(P.hemiSky,P.hemiGround,2.1));const sun=new T.DirectionalLight(P.sun,1.05);sun.position.set(-3,10,6);scene.add(sun);

 // ---- Atlas + shared materials ----------------------------------------------------------------------------------------------
 const atlasCanvas=paintKonbiniAtlas(document.createElement('canvas'));const atlas=new T.CanvasTexture(atlasCanvas);atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=2;
 const printMat=new T.MeshBasicMaterial({map:atlas,alphaTest:.45,side:T.DoubleSide});
 const staticMat=new T.MeshLambertMaterial({vertexColors:true});
 const glassMat=new T.MeshBasicMaterial({color:'#cfeef5',transparent:true,opacity:.22,depthWrite:false});
 const boxes:T.BufferGeometry[]=[],glass:T.BufferGeometry[]=[],prints:T.BufferGeometry[]=[],obstacles:Obstacle[]=[],pois:KonbiniPoi[]=[],slots:KonbiniSlot[]=[],sections:ZoomSection[]=[];let fixtureIndex=0;
 const euler=new T.Euler(),color=new T.Color(),m=new T.Matrix4(),q=new T.Quaternion(),yAxis=new T.Vector3(0,1,0),v=new T.Vector3(),one=new T.Vector3(1,1,1);
 type Frame={x:number;z:number;yaw:number};
 const toWorld=(f:Frame,lx:number,lz:number)=>({x:f.x+lx*Math.cos(f.yaw)+lz*Math.sin(f.yaw),z:f.z-lx*Math.sin(f.yaw)+lz*Math.cos(f.yaw)});
 function box(f:Frame,lx:number,ly:number,lz:number,w:number,h:number,d:number,hex:string,target=boxes){
  const g=new T.BoxGeometry(w,h,d);const p=toWorld(f,lx,lz);q.setFromAxisAngle(yAxis,f.yaw);m.compose(v.set(p.x,ly,p.z),q,one);g.applyMatrix4(m);
  if(target===boxes){color.set(hex);const n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++){c[i*3]=color.r;c[i*3+1]=color.g;c[i*3+2]=color.b;}g.setAttribute('color',new T.BufferAttribute(c,3));}
  target.push(g);return g;
 }
 function print(f:Frame,r:Rect,lx:number,ly:number,lz:number,w:number,h:number,turn=0,tilt=0){
  const g=new T.PlaneGeometry(w,h),uv=g.attributes.uv as T.BufferAttribute,u0=r.x/ATLAS_W,u1=(r.x+r.w)/ATLAS_W,v1=1-r.y/ATLAS_H,v0=1-(r.y+r.h)/ATLAS_H;
  uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);
  const p=toWorld(f,lx,lz);q.setFromEuler(euler.set(tilt,f.yaw+turn,0,'YXZ'));m.compose(v.set(p.x,ly,p.z),q,one);g.applyMatrix4(m);prints.push(g);
 }
 const cell=(n:number)=>cellRect(n);
 // ---- 3D shelf products (lib/konbini/productMeshes.ts): low-poly, vertex-coloured, merged into the ONE static mesh ----------
 /** Every 3D product's merged-mesh part and base height, per fixture: a shot that hits a bay wobbles that bay's products. */
 const bayProducts=new Map<number,{bi:number;baseY:number}[]>();
 const products=createProductCache(),decorKey=new Map<number,string>(Object.entries(DECOR).map(([k,n])=>[n,k])),scaleV=new T.Vector3();let stockSeed=0;
 /** Every placed front product (tappable or not) with its visual centre: the test hook checks each visible one has a hit target. */
 const fronts:{fi:number;kind:KonbiniSlot['kind']|null;ref:string;pos:T.Vector3;yaw:number}[]=[];
 function productKey(cellIndex:number,kind:KonbiniSlot['kind']|null,ref:string){if(kind==='magazine')return null;if(kind==='gear'&&ref.startsWith('ball:'))return ref;const k=foodOf.get(cellIndex)??decorKey.get(cellIndex);return k&&hasProduct(k)?k:null;}
 /** One product copy (seeded hand-stocked jitter), cloned into the merged static mesh. */
 function placeProduct(f:Frame,key:string,lx:number,base:number,lz:number,w:number,turn=0){
  const g=products.get(key).clone(),s=w/PRODUCT_NOMINAL,j=stockJitter(++stockSeed),yaw=f.yaw+turn+j.yaw,p=toWorld(f,lx+j.x,lz);
  q.setFromAxisAngle(yAxis,yaw);m.compose(v.set(p.x,base,p.z),q,scaleV.set(s,s,s));g.applyMatrix4(m);boxes.push(g);const bi=boxes.length-1;let bay=bayProducts.get(fixtureIndex);if(!bay)bayProducts.set(fixtureIndex,bay=[]);bay.push({bi,baseY:base});return {base:new T.Vector3(p.x,base,p.z),yaw,scale:s,bi};
 }
 /** A product on a shelf: a chunky 3D item (fronts plus `depth` copies behind) or, for magazines, the atlas print. Tappable when
  *  `kind` is set; the slot sits at the item's visual centre so hit areas, the tag card and the lift map to it. */
 function item(f:Frame,cellIndex:number,kind:KonbiniSlot['kind']|null,ref:string,lx:number,ly:number,lz:number,w:number,h:number,turn=0,tilt=0,depth=1,step=0,baseY?:number){
  const key=productKey(cellIndex,kind,ref);
  if(!key){print(f,cell(cellIndex),lx,ly,lz,w,h,turn,tilt);const p=toWorld(f,lx,lz);fronts.push({fi:fixtureIndex,kind,ref,pos:new T.Vector3(p.x,ly,p.z),yaw:f.yaw+turn});if(!kind)return;
   slots.push({key:`${fixtureIndex}:${slots.length}`,kind,ref,fi:fixtureIndex,lx,cell:cellIndex,pos:new T.Vector3(p.x,ly,p.z),size:Math.max(w,h)});return;}
  const base=baseY??ly-h/2+.004,back=Math.cos(turn);
  for(let d=depth-1;d>=1;d--)placeProduct(f,key,lx,base,lz-back*step*d,w,turn);
  const front=placeProduct(f,key,lx,base,lz,w,turn),tall=(products.get(key).boundingBox?.max.y??h)*front.scale;
  fronts.push({fi:fixtureIndex,kind,ref,pos:front.base.clone().setY(base+tall/2),yaw:front.yaw});if(!kind)return;
  slots.push({key:`${fixtureIndex}:${slots.length}`,kind,ref,fi:fixtureIndex,lx,cell:cellIndex,pos:front.base.clone().setY(base+tall/2),size:Math.max(w,tall),product:{key,...front}});
 }
 function section(poiId:ShelfId,label:string,f:Frame,len:number,height:number,cy:number,fz:number,lx=0,elev=.3){sections.push({poi:poiId,label,x:f.x,z:f.z,yaw:f.yaw,len,height,cy,fz,elev,fi:fixtureIndex,lx});}
 function block(f:Frame,halfLen:number,halfDepth:number,pad=.02,back=-halfDepth){
  const c=[toWorld(f,-halfLen,back),toWorld(f,halfLen,back),toWorld(f,-halfLen,halfDepth),toWorld(f,halfLen,halfDepth)];
  obstacles.push({minX:Math.min(...c.map(p=>p.x))-pad,maxX:Math.max(...c.map(p=>p.x))+pad,minZ:Math.min(...c.map(p=>p.z))-pad,maxZ:Math.max(...c.map(p=>p.z))+pad,fi:fixtureIndex});
 }
 function poi(id:ShelfId,f:Frame,halfLen:number,out:number,height=2){
  const a=toWorld(f,-halfLen,out),b=toWorld(f,halfLen,out),c=[toWorld(f,-halfLen,-.6),toWorld(f,halfLen,-.6),toWorld(f,-halfLen,out-.3),toWorld(f,halfLen,out-.3)];
  pois.push({id,label:LABEL[id],verb:VERB[id],a,b,face:toWorld(f,0,0),box:new T.Box3(new T.Vector3(Math.min(...c.map(p=>p.x)),0,Math.min(...c.map(p=>p.z))),new T.Vector3(Math.max(...c.map(p=>p.x)),height,Math.max(...c.map(p=>p.z))))});
 }
 const tag=(f:Frame,lx:number,ly:number,lz:number,w:number)=>box(f,lx,ly,lz,w,.06,.02,P.trim2);

 // ---- Room shell ------------------------------------------------------------------------------------------------------------
 const O:Frame={x:0,z:0,yaw:0};
 box(O,0,-.06,0,16.4,.12,12.4,P.grout);
 // Floor tiles: flat quads (2 triangles each instead of a 12-triangle box; their sides were never seen).
 for(let x=-7.5;x<=7.5;x+=1)for(let z=-5.5;z<=5.5;z+=1){const g=new T.PlaneGeometry(.94,.94);g.rotateX(-Math.PI/2);g.translate(x,.015,z);color.set((Math.round(x+z+20)%2)?P.floor:shadeHex(P.floor,-.025));g.setAttribute('color',new T.Float32BufferAttribute([0,1,2,3].flatMap(()=>[color.r,color.g,color.b]),3));boxes.push(g);}
 box(O,0,1.8,-6.1,16.4,3.6,.2,P.wall);box(O,-8.1,1.8,0,.2,3.6,12.4,P.wall);box(O,8.1,1.8,0,.2,3.6,12.4,P.wall);
 // Our brand stripes: teal over yellow over coral, round the three walls near the ceiling.
 for(const [y,h,c] of [[3.42,.14,P.trim],[3.3,.08,P.trim2],[3.22,.06,'#f07a5f']] as const){box(O,0,y,-5.99,16.2,h,.02,c);box(O,-7.99,y,0,.02,h,12.2,c);box(O,7.99,y,0,.02,h,12.2,c);}
 box(O,0,.08,-5.98,16.2,.16,.02,shadeHex(P.wall,-.12));box(O,-7.98,.08,0,.02,.16,12.2,shadeHex(P.wall,-.12));box(O,7.98,.08,0,.02,.16,12.2,shadeHex(P.wall,-.12));
 // Front: low sill + posts either side of the sliding doors (the camera looks in through the glass front).
 const doorL=V.doorX-1.15,doorR=V.doorX+1.15;
 box(O,(-8.1+doorL)/2,.25,6.05,doorL+8.1,.5,.18,P.wall);box(O,(doorR+8.1)/2,.25,6.05,8.1-doorR,.5,.18,P.wall);
 obstacles.push({minX:-9,maxX:doorL,minZ:5.62,maxZ:7,fi:-1},{minX:doorR,maxX:9,minZ:5.62,maxZ:7,fi:-1});
 for(const px of [-8,-4,doorL,doorR,4.5,8])box(O,px,.55,6.05,.12,1.1,.14,'#c9d2d0');
 box(O,V.doorX,.02,6.05,2.3,.04,.3,'#9aa7a1');
 const doorGeo=new T.BoxGeometry(1.12,2.4,.05),doors=new T.InstancedMesh(doorGeo,glassMat,2);doors.frustumCulled=false;scene.add(doors);
 const doorFrame=new T.Object3D();let doorOpen=0,doorTarget=0;
 function placeDoors(){for(let i=0;i<2;i++){const s=i?1:-1;doorFrame.position.set(V.doorX+s*(.56+doorOpen*1.02),1.25,6.02);doorFrame.updateMatrix();doors.setMatrixAt(i,doorFrame.matrix);}doors.instanceMatrix.needsUpdate=true;}
 placeDoors();

 // ---- Fixtures --------------------------------------------------------------------------------------------------------------
 const menu=shopMenu(shop),bySection=(s:string)=>menu.filter(f=>f.section===s).map(f=>f.cell);
 const cycle=(cells:number[],i:number)=>cells[i%cells.length];
 const foodOf=new Map(menu.map(f=>[f.cell,f.id]));
 // Every visible product is tappable (user, Sep 30 2026: "not all the items are selectable"): menu food opens its buy card,
 // shelf stock that isn't for sale (chip bags, cans, cones…) opens a look-only card (konbiniContent.DECOR_INFO).
 const asFood=(c:number)=>foodOf.has(c)?'food' as const:decorKey.has(c)?'decor' as const:null,refOf=(c:number)=>foodOf.get(c)??decorKey.get(c)??'';
 for(const fx of V.fixtures){build(fx);fixtureIndex++;}
 function build(fx:Fixture){
  const f:Frame={x:fx.x,z:fx.z,yaw:fx.yaw},len=fx.len??2,hl=len/2;
  switch(fx.kind){
   case 'fridgeWall':{
    box(f,0,1.2,-.4,len,2.4,.12,shadeHex(P.shelf,-.08));box(f,0,2.52,0,len,.26,.9,P.trim);box(f,0,.1,0,len,.2,.9,shadeHex(P.shelf,-.2));
    box(f,-hl,1.2,0,.08,2.4,.9,P.shelf);box(f,hl,1.2,0,.08,2.4,.9,P.shelf);box(f,0,2.36,.3,len-.1,.04,.3,'#ffffff');
    const doorsN=fridgeDoors(len),dw=len/doorsN,drinks=[...bySection('drinks'),DECOR.bottleRow,DECOR.cans];
    for(let d=0;d<doorsN;d++){const cx=-hl+dw*(d+.5);
     for(let r=0;r<4;r++){const y=.42+r*.5;box(f,cx,y-.2,0,dw-.06,.03,.8,'#dfe6e4');for(let k=0;k<2;k++){const c=cycle(drinks,d*3+r*2+k);item(f,c,asFood(c),refOf(c),cx-dw/4+k*dw/2,y+.02,.12,.4,.42,0,0,STOCK.fridgeDepth,STOCK.depthStep.fridge);}tag(f,cx,y-.2,.41,dw-.2);}
     box(f,cx+dw/2-.02,1.2,.44,.05,2.3,.04,'#c9d2d0');box(f,cx+dw/2-.14,1.25,.48,.035,.5,.05,'#9aa7a1');box(f,cx,1.2,.44,dw-.04,2.2,.02,'#000',glass);}
    block(f,hl,.46);poi(fx.poi??'drinks',f,Math.max(.2,hl-.6),1.15,2.6);section('drinks','Drinks fridge',f,len,2.7,1.3,.46);break;}
   case 'riceCase':{
    box(f,0,.28,0,len,.56,.95,P.shelf);box(f,0,1.05,-.42,len,2.1,.12,shadeHex(P.shelf,-.06));box(f,0,2.05,-.1,len,.14,.75,P.trim);box(f,0,1.96,-.05,len-.2,.04,.5,'#ffffff');
    const sets=[[...bySection('musubi')],[...bySection('onigiri'),...bySection('sando')],[...bySection('bento'),...bySection('musubi')]];
    for(let r=0;r<3;r++){const y=.62+r*.42,dz=.28-r*.14;box(f,0,y-.03,dz-.05,len-.1,.04,.55-r*.08,'#e6ecea');tag(f,0,y-.03,dz+.22-r*.04,len-.3);
     const n=riceFacings(len);for(let i=0;i<n;i++){const c=cycle(sets[r],i);item(f,c,asFood(c),refOf(c),-hl+.3+i*(len-.4)/Math.max(1,n-1),y+.17,dz,.36,.36,0,0,STOCK.riceDepth,STOCK.depthStep.rice);}}
    box(f,0,.56,.46,len,.06,.04,P.trim2);
    block(f,hl,.5);poi(fx.poi??'rice',f,Math.max(.2,hl-.6),1.2,2.2);section('rice','Rice case',f,len,2.2,1.1,.5);break;}
   case 'gondola':{
    box(f,0,.12,0,len,.24,.9,shadeHex(P.shelf,-.12));box(f,0,.8,0,len,1.4,.1,P.shelf);
    for(const e of [-1,1]){box(f,e*(hl+.04),.8,0,.08,1.55,.92,P.trim);}
    const gearCells=V.gear.map(id=>id.startsWith('pack')?DECOR.pack:DECOR.ball);
    const stock=fx.stock==='gear'?[...gearCells,DECOR.goal,DECOR.cone,DECOR.shinpads]:fx.stock==='sweets'?[...bySection('sweets'),DECOR.crackers,DECOR.cans]:[DECOR.bagA,...bySection('sweets').slice(0,2),DECOR.bagB,DECOR.crackers,DECOR.banana,DECOR.noodles];
    for(const side of [-1,1])for(let r=0;r<3;r++){const y=.38+r*.42;box(f,0,y-.03,side*.25,len-.1,.04,.38,'#dfe4e2');tag(f,0,y-.03,side*.45,len-.3);
     const n=gondolaFacings(len);for(let i=0;i<n;i++){const k=i+r*2+(side>0?0:1),c=cycle(stock,k),gear=fx.stock==='gear'&&k%stock.length<V.gear.length?V.gear[k%stock.length]:null;item(f,c,side<0?null:gear?'gear':asFood(c),gear??refOf(c),-hl+.25+i*(len-.5)/Math.max(1,n-1),y+.17,side*.26,.34,.34,side>0?0:Math.PI,0,side>0?STOCK.gondolaDepth:1,STOCK.depthStep.gondola);}}
    box(f,0,1.62,0,Math.min(len,1.6),.26,.06,P.trim2);
    block(f,hl+.08,.47);
    const front:Frame=f,back:Frame={x:f.x,z:f.z,yaw:f.yaw+Math.PI};poi(fx.poi??'snacks',front,Math.max(.2,hl-.4),.95,1.8);poi(fx.poi??'snacks',back,Math.max(.2,hl-.4),.95,1.8);
    section(fx.poi??'snacks',fx.stock==='gear'?'Toys & gear':fx.stock==='sweets'?'Sweets aisle':'Snack aisle',f,len,1.9,.85,.47);break;}
   case 'counter':{
    const wood=P.accentWood;box(f,0,.5,0,len,1,.8,P.counter);box(f,0,1.03,0,len+.1,.06,.9,P.counterTop);box(f,0,.08,.36,len,.16,.1,shadeHex(P.counter,-.2));
    if(wood)for(let i=0;i<Math.floor(len/.25);i++)box(f,-hl+.12+i*.25,.5,.41,.07,.9,.03,i%2?wood:shadeHex(wood,-.1));
    else{box(f,0,.72,.41,len,.08,.02,P.trim2);}
    // register, card-pay pad and a small pack display
    box(f,.3,1.2,-.1,.5,.28,.4,'#3a4a48');box(f,.3,1.47,-.05,.42,.26,.05,'#9fe0d6');box(f,.85,1.12,.15,.2,.12,.26,'#50605e');
    item(f,DECOR.pack,'decor','pack',hl-.45,1.23,.2,.34,.34,0,0,1,0,1.06);item(f,DECOR.ball,'decor','ball',hl-.85,1.21,.2,.3,.3,0,0,1,0,1.06);
    // hot-food warmer (glass case, lit) + the nikuman steamer / stone yaki-imo warmer at the front end
    const hot=bySection('hot'),hx=-hl+.75;box(f,hx,1.08,0,1.3,.06,.7,'#c9d2d0');box(f,hx,1.72,0,1.3,.06,.7,'#c9d2d0');box(f,hx,1.4,0,1.3,.62,.66,'#000',glass);box(f,hx,1.7,0,1.2,.03,.5,'#fff3c4');box(f,hx,1.405,0,1.24,.02,.6,'#dfe6e4');
    for(let i=0;i<Math.max(3,hot.length);i++){const c=cycle(hot.length?hot:[...bySection('bento'),...bySection('musubi')],i);const row=Math.floor(i/3);item(f,c,asFood(c),refOf(c),hx-.45+(i%3)*.45,1.22+row*.3,.05,.3,.3,0,0,1,0,row?1.415:1.11);}
    // back counter: coffee machine, hot-water dispenser (for cup noodles), cups
    const bz=-1.75;box(f,0,.5,bz,len,1,.5,shadeHex(P.counter,-.15));box(f,0,1.02,bz,len,.04,.52,P.counterTop);
    box(f,-.9,1.35,bz,.5,.62,.4,'#2d2d33');box(f,-.9,1.52,bz+.21,.3,.16,.02,'#9fe0d6');box(f,-.9,1.12,bz+.18,.14,.12,.12,'#fbfaf5');
    box(f,.2,1.3,bz,.4,.52,.36,'#fbfaf5');box(f,.12,1.44,bz+.19,.06,.06,.02,'#d8342c');box(f,.28,1.44,bz+.19,.06,.06,.02,'#1f6fb2');
    for(let i=0;i<5;i++)box(f,.9+i*.14,1.11,bz,.1,.14,.1,i%2?'#fbfaf5':'#f07a5f');
    block(f,hl,.46,.02,-2.1);
    poi('counter',{x:f.x,z:f.z,yaw:f.yaw},.5,1.1,2.2);poi('hot',{...toWorld(f,hx,0),yaw:f.yaw},.3,1.1,2.2);
    section('hot',hot.length?'Hot counter':'Deli counter',f,1.5,.9,1.38,.4,hx,.22);section('counter',`${CASHIERS[shop].name} at the register`,f,1.8,2.3,1.15,.45,.55,.2);break;}
   case 'gearRack':{
    // A small teal gear rack beside the counter: hooks for balls, a shelf of card packs and cones (regular vending stock).
    box(f,0,.9,-.2,len,1.8,.1,P.trim);box(f,0,.1,0,len,.2,.5,shadeHex(P.shelf,-.12));box(f,0,1.86,-.1,len+.06,.12,.3,P.trim2);
    for(let r=0;r<3;r++){const y=.45+r*.5;box(f,0,y-.05,-.02,len-.08,.04,.34,'#dfe4e2');tag(f,0,y-.05,.16,len-.2);
     const row=r===2?[0,1]:r===1?[2,3]:[-1,-2];row.forEach((g,i)=>{const lx=-len/4+i*len/2;if(g>=0&&g<V.gear.length){const id=V.gear[g];item(f,id.startsWith('pack')?DECOR.pack:DECOR.ball,'gear',id,lx,y+.16,.02,.36,.36);}else item(f,g===-1?DECOR.cone:DECOR.goal,'decor',g===-1?'cone':'goal',lx,y+.16,.02,.36,.36);});}
    block(f,len/2,.3);poi(fx.poi??'gear',f,.3,.95,2);section('gear','Toys & gear',f,len,2,1,.2,0,.25);break;}
   case 'magRack':{
    // A low slanted magazine table under the window: covers lie tilted up so they read from the room.
    box(f,0,.35,0,len,.7,.8,P.shelf);box(f,0,.72,0,len,.06,.86,shadeHex(P.shelf,-.08));
    const mags=MAGAZINES.map((m,i)=>({m,i})).filter(({m})=>m.shop===shop),count=Math.floor(len/.5);
    for(let r=0;r<2;r++)for(let i=0;i<count;i++){const mg=mags[(i+r*2)%mags.length];item(f,magazineCell(mg.i),'magazine',mg.m.id,-hl+.28+i*(len-.5)/Math.max(1,count-1),.8+r*.1,-.2+r*.36,.42,.5,Math.PI,-1.15);}
    // A low row of manga spines along the store side (below the covers, so they never hide them).
    for(let i=0;i<Math.floor(len/.12);i++)box(f,-hl+.1+i*.12,.82,.4,.09,.12,.12,['#f07a5f','#2f8f8a','#ffd35c','#5b6fb8','#e2578a'][i%5]);
    block(f,hl,.45);poi(fx.poi??'magazines',f,Math.max(.2,hl-.5),.95,1.6);section('magazines','Magazine table',{x:f.x,z:f.z,yaw:f.yaw+Math.PI},len,1.1,.9,.1,0,.95);break;}
   case 'atm':{
    box(f,0,.8,0,.9,1.6,.7,'#8a97a0');box(f,0,1.25,.36,.6,.4,.02,'#9fe0d6');box(f,0,.95,.37,.5,.14,.04,'#50605e');box(f,0,1.62,0,.92,.14,.72,P.trim);
    box(f,1.15,.55,0,1.1,1.1,.7,'#e6ecea');box(f,1.15,1.14,0,1,.08,.62,'#50605e');box(f,1.45,.85,.36,.3,.18,.02,'#9fe0d6');
    block(f,1.1,.36);block({x:toWorld(f,1.15,0).x,z:toWorld(f,1.15,0).z,yaw:f.yaw},.56,.36);poi('atm',{...toWorld(f,.55,0),yaw:f.yaw},.5,.95,1.8);break;}
   case 'beachCorner':{
    const wood=P.accentWood??'#c9a46a';box(f,0,.1,0,1.9,.2,1.5,wood);box(f,0,.9,-.65,1.9,1.6,.08,shadeHex(wood,-.1));
    print(f,SURFBOARD_RECT,-.55,1.05,-.55,.5,1.9);{const p=toWorld(f,-.55,-.55);slots.push({key:`${fixtureIndex}:${slots.length}`,kind:'decor',ref:'surfboard',fi:fixtureIndex,lx:-.55,cell:-1,pos:new T.Vector3(p.x,1.05,p.z),size:.9});fronts.push({fi:fixtureIndex,kind:'decor',ref:'surfboard',pos:new T.Vector3(p.x,1.05,p.z),yaw:f.yaw});}
    item(f,DECOR.beachball,'decor','beachball',.45,.5,.15,.5,.5);item(f,DECOR.flipflops,'decor','flipflops',.05,.42,.25,.42,.42);item(f,DECOR.sunscreen,'decor','sunscreen',.62,1.12,-.5,.36,.36);item(f,DECOR.sunscreen,'decor','sunscreen',.25,1.12,-.5,.36,.36);print(f,cell(DECOR.plant),-.1,1.25,-.55,.5,.5);
    block(f,.98,.78);poi(fx.poi??'beach',f,.5,1.3,2);section('beach','Beach corner',f,2,2.2,1.1,.3);break;}
   case 'plant':{box(f,0,.25,0,.5,.5,.5,'#c98a5a');print(f,cell(DECOR.plant),0,.95,0,1.1,1.1);print(f,cell(DECOR.plant),0,.95,0,1.1,1.1,Math.PI/2);block(f,.3,.3);break;}
   case 'poster':print(f,POSTER_RECTS[fx.poster??0],0,fx.y??2.2,.03,.8,1.2);break;
   case 'sign':print(f,shop==='cay'?CAY_SIGN_RECT:SIGN_RECT,0,fx.y??3,.05,4.2,.52);break;
   case 'mat':box(f,0,.012,0,2.2,.02,1.1,'#2d5a55');box(f,0,.024,0,1.9,.01,.12,P.trim2);break;
  }
 }
 // One mesh each: static boxes, glass, prints.
 // Where each part landed in the merged mesh (vertex ranges), so a tapped product's own triangles can be hidden while its one
 // lifted copy (liftMesh) hops: the product must show ONCE (user, Sep 30 2026: "it jumps and there's two of them").
 const vStart:number[]=[];{let n=0;for(const g of boxes){vStart.push(n);n+=g.attributes.position.count;}}
 const vCount=boxes.map(g=>g.attributes.position.count);
 const staticMesh=new T.Mesh(mergeGeometries(boxes,false)!,staticMat);staticMesh.name='konbini-static';scene.add(staticMesh);
 const staticPos=staticMesh.geometry.attributes.position as T.BufferAttribute;let hidden:{from:number;saved:Float32Array}|null=null;
 /** Collapse one product's vertices to a point (degenerate, invisible) or restore them: one small buffer sub-range upload. */
 function hideProduct(bi:number|null){
  if(hidden){const a=staticPos.array as Float32Array;a.set(hidden.saved,hidden.from*3);staticPos.clearUpdateRanges();staticPos.addUpdateRange(hidden.from*3,hidden.saved.length);staticPos.needsUpdate=true;hidden=null;}
  if(bi===null)return;const from=vStart[bi],n=vCount[bi],a=staticPos.array as Float32Array,saved=a.slice(from*3,(from+n)*3);
  for(let i=from;i<from+n;i++){a[i*3]=saved[0];a[i*3+1]=saved[1];a[i*3+2]=saved[2];}
  staticPos.clearUpdateRanges();staticPos.addUpdateRange(from*3,n*3);staticPos.needsUpdate=true;hidden={from,saved};
 }
 /**
  * A shot into a shelf: that bay's products lean with the ball and wobble back, a shear on their own merged vertices (≤ ~5 cm at
  * the top of a product, 0.45 s, one sub-range upload per frame only while it plays). Nothing leaves the shelf or breaks; reduced
  * motion skips the wobble (the thunk still plays).
  */
 let wobble:{fi:number;age:number;dx:number;dz:number;from:number;saved:Float32Array;parts:{from:number;n:number;baseY:number}[]}|null=null;
 const WOBBLE_TIME=.45;
 function endWobble(){if(!wobble)return;const a=staticPos.array as Float32Array;a.set(wobble.saved,wobble.from*3);staticPos.clearUpdateRanges();staticPos.addUpdateRange(wobble.from*3,wobble.saved.length);staticPos.needsUpdate=true;wobble=null;}
 function startWobble(fi:number,dx:number,dz:number){
  const bay=bayProducts.get(fi);if(!bay?.length||reduced||hidden)return false;endWobble();
  let from=Infinity,to=0;const parts=bay.map(b=>{const f=vStart[b.bi],n=vCount[b.bi];from=Math.min(from,f);to=Math.max(to,f+n);return {from:f,n,baseY:b.baseY};});
  const d=Math.hypot(dx,dz)||1;wobble={fi,age:0,dx:dx/d,dz:dz/d,from,saved:(staticPos.array as Float32Array).slice(from*3,to*3),parts};return true;}
 function stepWobble(dt:number){if(!wobble)return;const w=wobble;w.age+=dt;if(w.age>=WOBBLE_TIME){endWobble();return;}
  const k=.14*Math.exp(-w.age*6)*Math.sin(w.age*34),a=staticPos.array as Float32Array,sv=w.saved,off=w.from*3;
  for(const p of w.parts)for(let i=p.from;i<p.from+p.n;i++){const j=i*3,h=Math.max(0,sv[j-off+1]-p.baseY)*k;a[j]=sv[j-off]+w.dx*h;a[j+2]=sv[j-off+2]+w.dz*h;}
  staticPos.clearUpdateRanges();staticPos.addUpdateRange(off,sv.length);staticPos.needsUpdate=true;}
 const glassMesh=new T.Mesh(mergeGeometries(glass.map(g=>{g.deleteAttribute('uv');return g;}),false)!,glassMat);glassMesh.renderOrder=2;scene.add(glassMesh);
 const printMesh=new T.Mesh(mergeGeometries(prints,false)!,printMat);printMesh.name='konbini-prints';scene.add(printMesh);
 for(const g of [...boxes,...glass,...prints])g.dispose();
 staticMesh.matrixAutoUpdate=glassMesh.matrixAutoUpdate=printMesh.matrixAutoUpdate=false;

 // ---- Characters --------------------------------------------------------------------------------------------------------
 const shadowGeo=new T.CircleGeometry(1,24),shadowMat=new T.MeshBasicMaterial({color:'#20403c',transparent:true,opacity:.2,depthWrite:false});
 const disc=(sx:number)=>{const d=new T.Mesh(shadowGeo,shadowMat);d.rotation.x=-Math.PI/2;d.scale.set(sx,sx*.7,1);scene.add(d);return d;};
 const progress=getQuizProgress(),custom=loadCustomization(progress.completed,progress.total);
 const player=createPlayer('you','home',true,true);player.setAppearance(custom);player.setBeanLook(beanLookFor(custom),playerOutfit(custom));player.root.name='konbini-player';scene.add(player.root);const playerShadow=disc(.42);
 // The player's own ball (same mesh, patches and customised skin as outside, lib/graphics/ballAppearance.ts). Indoors it dribbles
 // gently, and the two ball actions (a soft capped shot, keep-ups) run through lib/konbini/konbiniBall.ts.
 const ballMaterial=new T.MeshStandardMaterial({color:'#f4edd3',roughness:.7}),ballLook=createBallAppearance(ballMaterial);ballLook.setStyle(custom.ball);
 const ball=new T.Mesh(new T.SphereGeometry(.19,20,16),ballMaterial);ball.name='konbini-ball';const ballPatches=addBallPatches(ball,.19);scene.add(ball);
 {// Heat: the six patches become one mesh (one draw instead of six).
  const parts=ball.children.filter((o):o is T.Mesh=>o instanceof T.Mesh);if(parts.length){const merged=new T.Mesh(mergeGeometries(parts.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);}),false)!,parts[0].material);parts.forEach(o=>ball.remove(o));ball.add(merged);}}const ballShadow=disc(.2);
 const ballAim=new T.Vector3(),rollAxis=new T.Vector3();let ballReady=false,ballMoving=false,shotHeldAt:number|null=null,wobbles=0;
 // The ball actions, stepped only while the ball is off the feet (heat: an idle store still renders 0 frames).
 const kb=createKonbiniBall(obstacles,e=>{
  if(e.type==='strike')konbiniSfx.kick(e.speed);
  else if(e.type==='hit'){if(e.fi>=0&&bayProducts.has(e.fi)){konbiniSfx.thunk();if(startWobble(e.fi,kb.state.vx,kb.state.vz))wobbles++;try{navigator.vibrate?.(14);}catch{/* no haptics */}}else konbiniSfx.bounce(e.speed);}
  else if(e.type==='bounce')konbiniSfx.bounce(e.speed);// the island's landing `impact`
  else if(e.type==='touch')konbiniSfx.touch(e.streak);
  else if(e.type==='drop'&&e.reason!=='stopped')konbiniSfx.bounce(1.5);
  callbacks.onBall?.(e);});
 const ballPlayer={x:0,z:0,yaw:0},bp=()=>{ballPlayer.x=x;ballPlayer.z=z;ballPlayer.yaw=yaw;return ballPlayer;};
 /** Stop any ball action on purpose (zoom, dialog, leaving, eating): the ball comes home and a shelf wobble settles at once. */
 function settleBall(){shotHeldAt=null;if(kb.moving)kb.settle(bp());endWobble();}
 const clerk=CASHIERS[shop],cashier=createPlayer(clerk.id,'neutral',true,true);cashier.setProfile(profileFor('npc',shop==='cay'?51:37));
 {const d=npcDress({id:clerk.id,role:clerk.role,character:clerk.look.character,face:clerk.look.face,clothing:shop==='cay'?'sunset':'classic'});d.look.headwear=clerk.look.headwear;if(clerk.look.headwear!=='none'){d.look.headwearColor=clerk.look.shirt;d.look.headwearColor2=clerk.look.shirt2;}cashier.setBeanLook(d.look,{...d.outfit,shirt:clerk.look.shirt,shirt2:clerk.look.shirt2});}
 cashier.root.name='konbini-cashier';scene.add(cashier.root);const cashierShadow=disc(.42);cashierShadow.position.set(V.cashier.x,.03,V.cashier.z);
 const cashierMotion:PlayerMotion={travelMode:'walk',facing:V.cashier.yaw,lookY:1.4,ready:.15};
 // Eating: one small atlas sprite + 8 pooled sparkles, visible only while a bite plays.
 const foodSprite=new T.Mesh(new T.PlaneGeometry(.62,.62),new T.MeshBasicMaterial({map:atlas,alphaTest:.45,side:T.DoubleSide,depthTest:false}));foodSprite.renderOrder=5;foodSprite.visible=false;scene.add(foodSprite);
 // The tapped 3D product lifts as ONE reusable mesh (its product geometry swapped in); magazines keep the atlas sprite.
 const liftMesh=new T.Mesh(products.get('pack'),new T.MeshLambertMaterial({vertexColors:true,emissive:'#fff1c2',emissiveIntensity:.07}));liftMesh.visible=false;liftMesh.renderOrder=5;scene.add(liftMesh);
 /** The selected product's single visible copy: at its own spot (same scale and yaw), lifted `hop` metres (≤ 4.5 cm, then settled). */
 function placeLift(pr:NonNullable<KonbiniSlot['product']>,hop:number){liftMesh.visible=true;liftMesh.position.copy(pr.base);liftMesh.position.y+=hop;liftMesh.scale.setScalar(pr.scale);liftMesh.rotation.set(0,pr.yaw,0);}
 const sparkles=new T.InstancedMesh(new T.PlaneGeometry(.07,.07),new T.MeshBasicMaterial({color:'#ffe27a',side:T.DoubleSide,depthTest:false}),8);sparkles.renderOrder=6;sparkles.visible=false;sparkles.frustumCulled=false;scene.add(sparkles);
 const sparkle=new T.Object3D();

 // ---- State ---------------------------------------------------------------------------------------------------------------
 let x=V.doorX,z=4.9,vx=0,vz=0,yaw=Math.PI,time=0,frame=0,last=0,slot=0,disposed=false,covered=false,leaving=false,settle=1,draws=0,frames=0,greet=reduced?0:1.6;
 let leaveStarted=0,firstFrameSent=false;
 const stuck=createStuckWatch(.5);
 let target:{x:number;z:number}|null=null,route:{x:number;z:number}[]=[],arrivePoi:KonbiniPoi|null=null,near:KonbiniPoi|null=null,promptVisible=false,eat:{age:number;sprite:boolean}|null=null;
 let cameraX=0,cameraZ=0,halfW=8,halfH=6,viewportW=1,viewportH=1,viewportLeft=0,viewportTop=0;
 const keys=new Set<string>(),stick={x:0,z:0},motion:PlayerMotion={travelMode:'walk'},sound=createKonbiniSound();
 const ray=new T.Raycaster(),pointer=new T.Vector2(),floor=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3(),projected=new T.Vector3();
 const frameMs=()=>{const t=tierSettings();return mobile?Math.max(1000/30,t.frameMs):t.cap30Everywhere?t.frameMs:0;};
 void tier;
 // ---- Shelf zoom (the vending-machine pattern: an eased, angled camera move onto the real shelf; no modal) ----------------
 type Cam={pos:T.Vector3;look:T.Vector3;hw:number;hh:number};
 const ZD=9,curLook=new T.Vector3(),tmpPos=new T.Vector3(),tmpLook=new T.Vector3();
 let targets:ZoomTarget[]=[],zoomIndex:number|null=null,zoom:{from:Cam;to:number|null;t:number;dur:number}|null=null,arrived=false;
 let highlight:{slot:KonbiniSlot;age:number;lift:boolean;done?:()=>void}|null=null;
 const walkCam=():Cam=>({pos:new T.Vector3(cameraX+Math.sin(V.camYaw)*12.5,10.8,cameraZ+Math.cos(V.camYaw)*12.5),look:new T.Vector3(cameraX,.6,cameraZ),hw:halfW,hh:halfH});
 const snapshot=():Cam=>({pos:camera.position.clone(),look:curLook.clone(),hw:camera.right,hh:camera.top});
 function zoomCam(t:ZoomTarget):Cam{
  const c=Math.cos(t.yaw),s=Math.sin(t.yaw),a=viewportW/Math.max(1,viewportH);
  const look=new T.Vector3(t.x+t.cx*c+t.fz*s,t.cy,t.z-t.cx*s+t.fz*c),yv=t.yaw+(V.camYaw<0?-.12:.12);
  let hw=t.width/2*1.06+.14,hh=t.height/2*1.1+.2;if(hw/hh>a)hh=hw/a;else hw=hh*a;
  // Leave room for the tag card: the shelf sits in the upper part of a portrait screen.
  if(a<1){hh*=1.16;hw=hh*a;look.y-=hh*.12;}else{hh*=1.12;hw=hh*a;look.y-=hh*.08;}
  return {pos:look.clone().add(new T.Vector3(Math.sin(yv)*Math.cos(t.elev),Math.sin(t.elev),Math.cos(yv)*Math.cos(t.elev)).multiplyScalar(ZD)),look,hw,hh};
 }
 function applyCam(pos:T.Vector3,look:T.Vector3,hw:number,hh:number){camera.position.copy(pos);camera.lookAt(look);curLook.copy(look);if(camera.right!==hw||camera.top!==hh){camera.left=-hw;camera.right=hw;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();}camera.updateMatrixWorld();}
 function setClip(zoomed:boolean){const near=zoomed?ZD-1.25:.1,far=zoomed?ZD+4:80;if(camera.near!==near||camera.far!==far){camera.near=near;camera.far=far;camera.updateProjectionMatrix();}}
 const zoomView=():KonbiniZoomView|null=>zoomIndex===null?null:{index:zoomIndex,count:targets.length,label:targets[zoomIndex].label,poi:targets[zoomIndex].poi,arrived};
 /** Hit areas come from the products' own placement: every tappable product of the zoomed fixture whose centre is on screen
  *  (the old section-width cut left visible neighbours at the frame edges dead). */
 function inTarget(sl:KonbiniSlot,t:ZoomTarget){return sl.fi===t.fi;}
 function emitSlots(){
  if(zoomIndex===null||!arrived){callbacks.onSlots?.([]);return;}const t=targets[zoomIndex],ppm=viewportW/(camera.right-camera.left);
  callbacks.onSlots?.(slots.filter(sl=>inTarget(sl,t)).map(sl=>{projected.copy(sl.pos).project(camera);return {key:sl.key,kind:sl.kind,ref:sl.ref,x:(projected.x*.5+.5)*viewportW,y:(-projected.y*.5+.5)*viewportH,size:Math.max(44,sl.size*ppm*1.05)};}).filter(v=>v.x>-10&&v.x<viewportW+10&&v.y>-10&&v.y<viewportH+10));
 }
 function zoomToIndex(i:number,dur=ZOOM_IN_SECONDS){if(i<0||i>=targets.length||leaving)return;settleBall();const from=snapshot();setClip(false);zoom={from,to:i,t:0,dur};zoomIndex=i;arrived=false;highlight=null;foodSprite.visible=false;liftMesh.visible=false;hideProduct(null);
  keys.clear();stick.x=stick.z=0;target=null;route=[];arrivePoi=null;if(near){near=null;callbacks.onNear?.(null);}callbacks.onSlots?.([]);callbacks.onZoom?.(zoomView());wake();}
 function zoomOut(){if(zoomIndex===null)return;const from=snapshot();setClip(false);zoom={from,to:null,t:0,dur:ZOOM_OUT_SECONDS};arrived=false;highlight=null;foodSprite.visible=false;liftMesh.visible=false;hideProduct(null);callbacks.onSlots?.([]);wake();}
 function setSpriteCell(cellIndex:number){const r=cellRect(cellIndex),uv=(foodSprite.geometry.attributes.uv as T.BufferAttribute),u0=r.x/ATLAS_W,u1=(r.x+r.w)/ATLAS_W,v1=1-r.y/ATLAS_H,v0=1-(r.y+r.h)/ATLAS_H;uv.setXY(0,u0,v1);uv.setXY(1,u1,v1);uv.setXY(2,u0,v0);uv.setXY(3,u1,v0);uv.needsUpdate=true;}

 function blocked(px:number,pz:number,r=.3){if(px<-7.7+r||px>7.7-r||pz< -5.9+r||pz>6.4)return true;for(const o of obstacles)if(px>o.minX-r&&px<o.maxX+r&&pz>o.minZ-r&&pz<o.maxZ+r)return true;return false;}
 function collide(){for(let pass=0;pass<2;pass++)for(const o of obstacles){const r=.3;if(x>o.minX-r&&x<o.maxX+r&&z>o.minZ-r&&z<o.maxZ+r){const dl=x-(o.minX-r),dr=o.maxX+r-x,db=z-(o.minZ-r),df=o.maxZ+r-z,mn=Math.min(dl,dr,db,df);if(mn===dl)x=o.minX-r;else if(mn===dr)x=o.maxX+r;else if(mn===db)z=o.minZ-r;else z=o.maxZ+r;}}x=T.MathUtils.clamp(x,-7.4,7.4);z=T.MathUtils.clamp(z,-5.6,Math.abs(x-V.doorX)<1.05?6.3:5.7);}
 /** Grid A* (0.25 m) for tap-to-walk; runs only on a tap. An unreachable goal (behind the counter) walks to the closest
  *  reachable spot instead (lib/konbini/konbiniPath.ts). */
 function findPath(tx:number,tz:number){return findFloorPath({x,z},{x:tx,z:tz},(a,b)=>blocked(a,b));}
 const segPoint=(p:KonbiniPoi,px:number,pz:number)=>{const dx=p.b.x-p.a.x,dz=p.b.z-p.a.z,l=dx*dx+dz*dz||1,t=T.MathUtils.clamp(((px-p.a.x)*dx+(pz-p.a.z)*dz)/l,0,1);return {x:p.a.x+dx*t,z:p.a.z+dz*t};};
 function nearest(){let best:KonbiniPoi|null=null,dist=1.25;for(const p of pois){const s=segPoint(p,x,z),d=Math.hypot(s.x-x,s.z-z);if(d<dist){dist=d;best=p;}}return best;}
 function walkToPoi(p:KonbiniPoi){const s=segPoint(p,x,z);if(Math.hypot(s.x-x,s.z-z)<.3){target=null;route=[];arrivePoi=null;yaw=Math.atan2(p.face.x-x,p.face.z-z);wake();callbacks.onArrive?.(p);return;}route=findPath(s.x,s.z);target=route.shift()??{x:s.x,z:s.z};arrivePoi=p;wake();}

 function tick(now:number){frame=0;if(disposed||covered||document.hidden)return;
  const interval=frameMs();if(interval>0){const next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(tick);return;}slot=next;}
  const dt=Math.max(.001,Math.min(.05,last?(now-last)/1000:1/60));last=now;time+=dt;frames++;
  const zoomed=zoomIndex!==null;
  let ix=zoomed?0:stick.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),iz=zoomed?0:stick.z+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(kb.state.mode==='windup'){ix=iz=0;}// plant for the strike
  if(ix||iz){target=null;route=[];arrivePoi=null;}
  else if(target){const dx=target.x-x,dz=target.z-z,d=Math.hypot(dx,dz);
   // No progress for 0.5 s (pushed against a fixture): give the target up so the room can go idle (code review finding 4).
   if(!leaving&&!leaveStarted&&stuck.step(target,d,dt)){target=null;route=[];arrivePoi=null;stuck.reset();}
   else if(d<.12){target=route.shift()??null;if(!target&&arrivePoi){const p=arrivePoi;arrivePoi=null;const f=p.face;yaw=Math.atan2(f.x-x,f.z-z);callbacks.onArrive?.(p);}}else{ix=dx/d*Math.min(1,d*2.2);iz=dz/d*Math.min(1,d*2.2);}}
  const len=Math.max(1,Math.hypot(ix,iz)),resp=1-Math.exp(-dt*14),top=kb.state.mode==='keepup'?1.6:3.6;vx+=(ix/len*top-vx)*resp;vz+=(iz/len*top-vz)*resp;
  const ox=x,oz=z;x+=vx*dt;z+=vz*dt;collide();vx=(x-ox)/dt;vz=(z-oz)/dt;const speed=Math.hypot(vx,vz);
  if(!leaving&&leaveStarted&&performance.now()-leaveStarted>4000){x=V.doorX;z=6.1;vz=1;}
  if(!leaving&&z>5.95&&Math.abs(x-V.doorX)<1.05&&vz>.15){leaving=true;keys.clear();stick.x=stick.z=0;target=null;route=[];doorTarget=1;sound.chime();callbacks.onExit?.();}
  if(Math.hypot(ix,iz)>.08)yaw=Math.atan2(ix,iz);
  const bm=kb.state.mode;if(bm==='windup'||bm==='shot'&&kb.state.kick>0)yaw=kb.state.yaw;
  // Sliding doors open for anyone near them.
  doorTarget=leaving||Math.hypot(x-V.doorX,z-6)<2.3?1:0;const prevDoor=doorOpen;doorOpen=reduced?doorTarget:T.MathUtils.damp(doorOpen,doorTarget,7,dt);if(Math.abs(doorOpen-doorTarget)<.003)doorOpen=doorTarget;if(doorOpen!==prevDoor)placeDoors();
  if(prevDoor<.05&&doorOpen>=.05&&!leaving)sound.chime();
  motion.facing=yaw;motion.intentHeading=speed>.08?Math.atan2(vx,vz):undefined;motion.stopDistance=target?Math.hypot(target.x-x,target.z-z):undefined;
  // Bite: the food rises to the mouth, three bites, a few sparkles.
  if(eat){eat.age+=dt;const a=eat.age,bite=a<.35?0:Math.min(3,Math.floor((a-.35)/.42)+1),rise=Math.min(1,a/.35);foodSprite.visible=eat.sprite&&a<1.7;
   const hx=x+Math.sin(yaw)*.25+Math.sin(V.camYaw)*.35,hz=z+Math.cos(yaw)*.25+Math.cos(V.camYaw)*.35;foodSprite.position.set(hx,1.05+rise*.45,hz+.02);foodSprite.scale.setScalar(Math.max(.05,1-bite*.3));
   const s=(a-.35)%.42,burst=bite>0&&s<.3;sparkles.visible=!reduced&&burst&&a<1.7;if(sparkles.visible){for(let i=0;i<8;i++){const ang=i/8*Math.PI*2;sparkle.position.set(hx+Math.cos(ang)*s*1.1,1.5+Math.sin(ang)*s*.9,hz+.05);sparkle.rotation.z=ang;sparkle.scale.setScalar(1-s/.3);sparkle.updateMatrix();sparkles.setMatrixAt(i,sparkle.matrix);}sparkles.instanceMatrix.needsUpdate=true;}
   player.setExpression(a<1.9?'happy':'neutral');motion.called=a<1.4?.35:0;if(a>2){eat=null;foodSprite.visible=false;sparkles.visible=false;motion.called=0;player.setExpression('neutral');}}
  // Ball actions: step the ball only while it's off the feet, then pose the rig like the island / Arcade room do.
  if(kb.moving)kb.update(dt,bp());
  const nm=kb.state.mode,shooting=nm==='charging'||nm==='windup'||nm==='shot'&&kb.state.kick>0;
  motion.kick=shooting?kb.state.kick:undefined;motion.shotCharge=nm==='charging'?kb.state.charge:undefined;motion.shotPower=shooting?kb.state.charge:undefined;motion.powerKick=nm==='windup'||nm==='shot'&&kb.state.kick>0;motion.actionKind=shooting?'shot':undefined;
  motion.juggle=kb.state.mode==='keepup'?kb.jugglePhase():undefined;motion.juggleTouch=kb.state.mode==='keepup'?'foot':undefined;motion.kickSide=shooting?1:kb.state.mode==='keepup'?kb.state.side:undefined;
  stepWobble(dt);
  motion.dribbling=!eat&&kb.state.mode==='feet';player.update(x,z,dt,time,reduced,motion);playerShadow.position.set(x,.03,z);
  // Dribble: the ball follows the rig's own dribble contact, stays out of shelves and rests at the feet when you stop.
  if(kb.state.mode!=='feet'){const ox=ball.position.x,oz=ball.position.z;ball.position.set(kb.state.x,kb.state.y,kb.state.z);ballReady=true;const bd=Math.hypot(ball.position.x-ox,ball.position.z-oz);if(bd>.0001){rollAxis.set(ball.position.z-oz,0,-(ball.position.x-ox)).normalize();ball.rotateOnWorldAxis(rollAxis,bd/.19);}else if(kb.state.mode==='keepup'&&!reduced)ball.rotateX(dt*5);ballShadow.position.set(ball.position.x,.028,ball.position.z);ballMoving=true;}
  else{player.dribbleContact(ballAim);ballAim.y=.19;for(const o of obstacles){const r=.2;if(ballAim.x>o.minX-r&&ballAim.x<o.maxX+r&&ballAim.z>o.minZ-r&&ballAim.z<o.maxZ+r){const dl=ballAim.x-(o.minX-r),dr=o.maxX+r-ballAim.x,db=ballAim.z-(o.minZ-r),df=o.maxZ+r-ballAim.z,mn=Math.min(dl,dr,db,df);if(mn===dl)ballAim.x=o.minX-r;else if(mn===dr)ballAim.x=o.maxX+r;else if(mn===db)ballAim.z=o.minZ-r;else ballAim.z=o.maxZ+r;}}
  {const ox=ball.position.x,oz=ball.position.z;if(!ballReady){ball.position.copy(ballAim);ballReady=true;}else ball.position.lerp(ballAim,1-Math.exp(-dt*18));const bd=Math.hypot(ball.position.x-ox,ball.position.z-oz);ballMoving=bd>.0015||ball.position.distanceTo(ballAim)>.01;if(bd>.0001){rollAxis.set(ball.position.z-oz,0,-(ball.position.x-ox)).normalize();ball.rotateOnWorldAxis(rollAxis,bd/.19);}ballShadow.position.set(ball.position.x,.028,ball.position.z);}}
  // Cashier: faces you when you're close, a bow-and-wave greeting when you arrive.
  greet=Math.max(0,greet-dt);const cd=Math.hypot(x-V.cashier.x,z-V.cashier.z),wantFace=cd<4.5?Math.atan2(x-V.cashier.x,z-V.cashier.z):V.cashier.yaw;
  const cf=cashierMotion.facing??V.cashier.yaw;const turn=Math.atan2(Math.sin(wantFace-cf),Math.cos(wantFace-cf));cashierMotion.facing=Math.abs(turn)<.002?wantFace:cf+turn*(1-Math.exp(-dt*6));
  cashierMotion.called=greet>0?Math.sin(Math.min(1,greet/1.6)*Math.PI)*.9:0;cashierMotion.lookX=cd<4.5?x:undefined;cashierMotion.lookZ=cd<4.5?z:undefined;cashier.setExpression(greet>0||cd<2.6?'happy':'neutral');
  cashier.update(V.cashier.x,V.cashier.z,dt,time,reduced,cashierMotion);
  // Nearest shelf → one contextual prompt.
  const n=leaving||zoomed||eat?null:nearest();if(n!==near){near=n;callbacks.onNear?.(n);}
  const follow=reduced?1:1-Math.exp(-dt*5),dxCam=halfW>=8.4?0:T.MathUtils.clamp(x,-8.4+halfW,8.4-halfW),dzCam=T.MathUtils.clamp(z,-2.2,halfW<halfH?-1.1:2);cameraX+=(dxCam-cameraX)*follow;cameraZ+=(dzCam-cameraZ)*follow;
  if(zoom){zoom.t=reduced?1:Math.min(1,zoom.t+dt/zoom.dur);const A=zoom.from,B=zoom.to!==null?zoomCam(targets[zoom.to]):walkCam(),k=easeZoom(zoom.t);
   applyCam(tmpPos.lerpVectors(A.pos,B.pos,k),tmpLook.lerpVectors(A.look,B.look,k),A.hw+(B.hw-A.hw)*k,A.hh+(B.hh-A.hh)*k);
   if(zoom.t>=1){if(zoom.to===null){zoom=null;zoomIndex=null;arrived=false;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();placeCamera();callbacks.onZoom?.(null);}
    else{zoom=null;arrived=true;setClip(true);callbacks.onZoom?.(zoomView());emitSlots();if(zoomIndex!==null)callbacks.onZoomArrive?.(targets[zoomIndex].poi);}}}
  else if(zoomIndex!==null){const c=zoomCam(targets[zoomIndex]);applyCam(c.pos,c.look,c.hw,c.hh);}
  else placeCamera();
  const hidePlayer=zoomIndex!==null&&(zoom===null||(zoom.to!==null?zoom.t>.35:zoom.t<.6));player.root.visible=playerShadow.visible=ball.visible=ballShadow.visible=!hidePlayer;
  // A tapped product lifts toward the camera (a magazine keeps coming, then its lesson opens).
  if(highlight){highlight.age+=dt;const h=highlight,k=Math.min(1,h.age/(h.lift?.45:.22)),hop=h.lift||reduced?0:Math.max(0,Math.sin(Math.min(1,h.age/.3)*Math.PI))*.045,toCam=tmpPos.copy(camera.position).sub(h.slot.pos).normalize();
   const pr=h.slot.product;
   if(pr){placeLift(pr,hop);}
   else if(h.slot.cell>=0){foodSprite.visible=true;foodSprite.position.copy(h.slot.pos).addScaledVector(toCam,(h.lift?1.6:.03)*easeZoom(k));foodSprite.position.y+=hop;foodSprite.scale.setScalar((h.slot.size/.62)*(1+(h.lift?1.2:0)*easeZoom(k)));foodSprite.quaternion.copy(camera.quaternion);}
   if(k>=1&&h.done){const d=h.done;h.done=undefined;d();}}
  if(near&&!zoomed){const c=segPoint(near,x,z);projected.set((c.x+near.face.x)/2,2.3,(c.z+near.face.z)/2).project(camera);const vis=Math.abs(projected.x)<.92&&projected.y<.85&&projected.y>-.8;callbacks.onPrompt?.((projected.x*.5+.5)*viewportW,(-projected.y*.5+.5)*viewportH,vis);promptVisible=vis;}else if(promptVisible){promptVisible=false;callbacks.onPrompt?.(0,0,false);}
  renderer.render(scene,camera);draws++;if(!firstFrameSent){firstFrameSent=true;callbacks.onFirstFrame?.();}
  const busy=ballMoving||kb.moving||!!wobble||!!zoom||!!highlight&&highlight.age<.5||speed>.03||!!target||keys.size>0||Math.hypot(stick.x,stick.z)>.02||!!eat||greet>0||doorOpen!==doorTarget||Math.abs(cameraX-dxCam)>.005||Math.abs(cameraZ-dzCam)>.005||Math.abs(turn)>.01;
  if(busy)settle=.5;else settle-=dt;
  if(settle>0||leaving)frame=requestAnimationFrame(tick);else{last=0;slot=0;}
 }
 // Each store is seen from its own front corner (main: front-left, cay: front-right) so shelf fronts face the camera.
 function placeCamera(){camera.position.set(cameraX+Math.sin(V.camYaw)*12.5,10.8,cameraZ+Math.cos(V.camYaw)*12.5);curLook.set(cameraX,.6,cameraZ);camera.lookAt(curLook);camera.updateMatrixWorld();}
 function wake(){if(!frame&&!covered&&!disposed&&!document.hidden){settle=.5;last=0;slot=0;frame=requestAnimationFrame(tick);}}
 function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;renderer.setPixelRatio(pixelRatio());renderer.setSize(w,h,false);viewportW=w;viewportH=h;const r=canvas.getBoundingClientRect();viewportLeft=r.left;viewportTop=r.top;
  const a=w/h;halfH=a<1?7.2:a<1.25?6.4:6;halfW=halfH*a;if(halfW>9.2){halfW=9.2;halfH=halfW/a;}
  camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
  targets=zoomTargets(sections,a);if(zoomIndex!==null){zoomIndex=Math.min(zoomIndex,targets.length-1);if(arrived){const c=zoomCam(targets[zoomIndex]);applyCam(c.pos,c.look,c.hw,c.hh);emitSlots();callbacks.onZoom?.(zoomView());}}
  if(draws===0){cameraX=halfW>=8.4?0:T.MathUtils.clamp(x,-8.4+halfW,8.4-halfW);cameraZ=T.MathUtils.clamp(z,-2.2,halfW<halfH?-1.1:2);}wake();}
 function clearInput(){if(shotHeldAt!==null){shotHeldAt=null;kb.cancelCharge();}keys.clear();stick.x=stick.z=0;target=null;route=[];arrivePoi=null;vx=vz=0;wake();}
 /** Ball actions work while walking (not zoomed, covered, leaving or eating). */
 const ballFree=()=>!leaving&&!leaveStarted&&!covered&&!disposed&&zoomIndex===null&&!zoom&&!eat;
 function beginShot(){if(!ballFree()||shotHeldAt!==null)return false;sound.unlock();if(kb.state.mode==='keepup')kb.settle(bp());if(!kb.beginCharge(bp()))return false;shotHeldAt=performance.now();wake();return true;}
 function endShot(cancel=false){if(shotHeldAt===null)return false;const held=performance.now()-shotHeldAt;shotHeldAt=null;if(cancel||!ballFree()){kb.cancelCharge();wake();return false;}const ok=kb.release(bp(),held);wake();return ok;}
 function keepUp(){if(!ballFree()||shotHeldAt!==null)return false;sound.unlock();const ok=kb.tap(bp());wake();return ok;}
 function key(e:KeyboardEvent){if(leaving||covered)return;
  if(zoomIndex!==null){if(e.type==='keydown'&&!(e.target instanceof HTMLInputElement)){if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();if(!zoom)zoomToIndex(zoomIndex+(e.code==='ArrowLeft'?-1:1),.6);}else if(e.code==='Escape'){e.preventDefault();zoomOut();}}return;}
  // The island's keys: Space = shoot (hold to charge, release to shoot), J = keep-up touch. A focused button handles its own.
  if((e.code==='Space'||e.code==='KeyJ')&&!(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea'))){e.preventDefault();
   if(e.code==='Space'){if(e.type==='keydown'&&!e.repeat)beginShot();else if(e.type==='keyup')endShot();}else if(e.type==='keydown'&&!e.repeat)keepUp();return;}if(!/^(Key[WASD]|Arrow(Up|Down|Left|Right))$/.test(e.code)||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;e.preventDefault();if(e.type==='keydown'){sound.unlock();keys.add(e.code);}else keys.delete(e.code);wake();}
 function visibility(){if(document.hidden){settleBall();keys.clear();stick.x=stick.z=0;cancelAnimationFrame(frame);frame=0;}else wake();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',visibility);
 player.update(x,z,0,0,reduced,{facing:yaw,resumePose:true,travelMode:'walk'});cashier.update(V.cashier.x,V.cashier.z,0,0,reduced,cashierMotion);resize();
 // Arrival: walk in a couple of steps from the door (the doors are already open from the transition).
 doorOpen=1;placeDoors();target={x:V.doorX,z:3.6};

 return {
  pois,shop,
  setStick(a:number,b:number){if(leaving)return;if(a||b)sound.unlock();stick.x=a;stick.z=b;wake();},
  pick(clientX:number,clientY:number){if(leaving||covered||zoomIndex!==null)return null;sound.unlock();pointer.set((clientX-viewportLeft)/viewportW*2-1,1-(clientY-viewportTop)/viewportH*2);ray.setFromCamera(pointer,camera);
   let best:KonbiniPoi|null=null,bd=Infinity;for(const p of pois){const h=ray.ray.intersectBox(p.box,hit);if(h){const d=h.distanceToSquared(ray.ray.origin);if(d<bd){bd=d;best=p;}}}
   if(best){walkToPoi(best);return best.id;}
   if(ray.ray.intersectPlane(floor,hit)){route=findPath(T.MathUtils.clamp(hit.x,-7.4,7.4),T.MathUtils.clamp(hit.z,-5.5,5.6));target=route.shift()??null;arrivePoi=null;wake();}return null;},
  walkTo(id:ShelfId){const p=pois.filter(p=>p.id===id).sort((a,b)=>Math.hypot(segPoint(a,x,z).x-x,segPoint(a,x,z).z-z)-Math.hypot(segPoint(b,x,z).x-x,segPoint(b,x,z).z-z))[0];if(p)walkToPoi(p);},
  /** Walk out through the sliding doors (the Exit button); onExit fires as you cross them. */
  leave(){if(leaving)return;settleBall();if(zoomIndex!==null){zoom=null;zoomIndex=null;arrived=false;setClip(false);callbacks.onZoom?.(null);}
   route=[...findPath(V.doorX,5.2),{x:V.doorX,z:6.3}];target=route.shift()??{x:V.doorX,z:6.3};arrivePoi=null;leaveStarted=performance.now();wake();},
  /** The eat flourish. `cellIndex` shows the food sprite and three bites; null = the bites already played in the big view
   *  (KonbiniReveal's eat sequence, Oct 1 2026), so only the happy face and sparkles play here. */
  eat(cellIndex:number|null){settleBall();highlight=null;liftMesh.visible=false;hideProduct(null);foodSprite.scale.setScalar(1);if(cellIndex!==null){setSpriteCell(cellIndex);const cam=camera.position;foodSprite.lookAt(cam.x,cam.y,cam.z);sound.bite();}eat={age:0,sprite:cellIndex!==null};wake();},
  /** Zoom onto a section (the nearest bay of that shelf) / a section index; step to the neighbour; back to walking. */
  zoomToPoi(id:ShelfId){zoomToIndex(nearestTarget(targets,id,x,z));},
  zoomTo:(i:number)=>zoomToIndex(i),
  zoomStep(dir:1|-1){if(zoomIndex!==null&&!zoom&&zoomIndex+dir>=0&&zoomIndex+dir<targets.length)callbacks.onZoomStep?.();if(zoomIndex!==null&&!zoom)zoomToIndex(Math.max(0,Math.min(targets.length-1,zoomIndex+dir)),.6);},
  zoomOut,
  get targets(){return targets.map(t=>({poi:t.poi,label:t.label}));},
  /** Highlight a tapped product (it lifts off the shelf); `lift` flies it toward the camera, then `done` (magazines). */
  highlightSlot(key:string|null,lift=false,done?:()=>void){const sl=key?slots.find(v=>v.key===key):undefined;if(!sl){highlight=null;foodSprite.visible=false;liftMesh.visible=false;hideProduct(null);wake();return;}foodSprite.visible=false;liftMesh.visible=false;hideProduct(null);
   // Swap in ONE copy in the same frame: hide the product's own triangles and show liftMesh at its spot (no first-frame double).
   if(sl.product){liftMesh.geometry=products.get(sl.product.key);hideProduct(sl.product.bi);placeLift(sl.product,0);}else if(sl.cell>=0)setSpriteCell(sl.cell);highlight={slot:sl,age:reduced?1:0,lift,done};wake();if(reduced&&done){highlight.done=undefined;done();}},
  greet(){greet=reduced?0:1.6;wake();},
  setCovered(value:boolean){covered=value;if(value){settleBall();keys.clear();stick.x=stick.z=0;cancelAnimationFrame(frame);frame=0;}else wake();},
  clearInput,sound,
  /** Test hook (scripts/check-konbini-taps.cjs): every placed FRONT product of the zoomed fixture that faces the camera and is
   *  on screen, projected to CSS px, with whether it has a hit target. Independent of emitSlots, so drift shows up. */
  debugFronts(){if(zoomIndex===null||!arrived)return [];const t=targets[zoomIndex],dir=tmpPos.copy(camera.position).sub(curLook).normalize();
   return fronts.map((fr,id)=>({fr,id})).filter(({fr})=>fr.fi===t.fi&&Math.sin(fr.yaw)*dir.x+Math.cos(fr.yaw)*dir.z>.15).map(({fr,id})=>{projected.copy(fr.pos).project(camera);return {id,kind:fr.kind,ref:fr.ref,x:(projected.x*.5+.5)*viewportW,y:(-projected.y*.5+.5)*viewportH};}).filter(v=>v.x>4&&v.x<viewportW-4&&v.y>4&&v.y<viewportH-4);},
  /** Test hook: the selected product's copies: its own merged triangles hidden?, the lifted copy shown, and how far it sits
   *  from its shelf spot (m). Exactly one visible copy = hidden && lift. */
  debugSelection(){const pr=highlight?.slot.product;if(!pr)return null;let collapsed=false;if(hidden){const a=staticPos.array as Float32Array,f=hidden.from*3;collapsed=a[f]===a[f+3]&&a[f+1]===a[f+4]&&a[f+2]===a[f+5];}
   return {hidden:!!hidden&&hidden.from===vStart[pr.bi]&&collapsed,lift:liftMesh.visible,offset:liftMesh.position.distanceTo(pr.base),scale:liftMesh.scale.x/pr.scale};},
  /** Test/measurement hook (scripts/check-konbini-browser.cjs): time N renders of the current view. */
  measureRender(n=60){const t=performance.now();for(let i=0;i<n;i++)renderer.render(scene,camera);return (performance.now()-t)/n;},
  /** The ball actions (the Shoot / Keep-ups buttons and Space / J): press-and-hold shot and a keep-up touch. */
  beginShot,endShot,keepUp,
  /** A quick tap shot (a soft pass): press and release at once. */
  kick(){return beginShot()&&endShot();},
  /** Test hook: shoot now at a given charge 0..1 (the release uses the same capped launch). */
  debugShot(charge:number){if(!ballFree())return false;if(kb.state.mode!=='feet')kb.settle(bp());kb.beginCharge(bp());const ok=kb.release(bp(),180+Math.max(0,Math.min(1,charge))*1800);wake();return ok;},
  /** Test hooks (scratchpad browser checks): a free standing spot 0.9 m in front of each stocked bay, facing it; stand there. */
  debugShotSpots(){const out:{fi:number;x:number;z:number;yaw:number}[]=[];for(const o of obstacles){if(o.fi<0||!bayProducts.get(o.fi)?.length)continue;const cx=(o.minX+o.maxX)/2,cz=(o.minZ+o.maxZ)/2;
   for(const [px,pz] of [[cx,o.maxZ+.9],[cx,o.minZ-.9],[o.maxX+.9,cz],[o.minX-.9,cz]] as const)if(!blocked(px,pz,.35)){out.push({fi:o.fi,x:px,z:pz,yaw:Math.atan2(cx-px,cz-pz)});break;}}return out;},
  debugPlace(px:number,pz:number,a:number){if(leaving)return;x=px;z=pz;yaw=a;vx=vz=0;target=null;route=[];arrivePoi=null;wake();},
  get state(){return {shop,x,z,yaw,ball:{x:ball.position.x,y:ball.position.y,z:ball.position.z,visible:ball.visible,moving:ballMoving||kb.moving,style:custom.ball},action:{mode:kb.state.mode,charge:kb.state.charge,streak:kb.state.streak,shots:kb.state.shots,hits:kb.state.hits,vx:kb.state.vx,vz:kb.state.vz,vy:kb.state.vy,held:shotHeldAt!==null,free:ballFree()},wobble:wobble?.fi??null,wobbles,zoom:zoomView(),zooming:!!zoom,slots:slots.length,highlight:highlight?.slot.key??null,near:near?.id??null,leaving,doorOpen,eating:!!eat,sleeping:frame===0,draws,frames,render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures},pixelRatio:renderer.getPixelRatio(),frameMs:frameMs(),pois:pois.map(p=>p.id)};},
  dispose(){disposed=true;cancelAnimationFrame(frame);frame=0;observer.disconnect();window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clearInput);document.removeEventListener('visibilitychange',visibility);
   sound.dispose();player.dispose();cashier.dispose();ballLook.dispose();ballPatches.dispose();const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(mm=>mats.add(mm));}});geos.forEach(g=>g.dispose());mats.forEach(mm=>mm.dispose());products.dispose();atlas.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
export type KonbiniScene=ReturnType<typeof createKonbiniScene>;
function shadeHex(hex:string,amount:number){const c=new T.Color(hex);const h={h:0,s:0,l:0};c.getHSL(h);c.setHSL(h.h,h.s,T.MathUtils.clamp(h.l+amount,0,1));return '#'+c.getHexString();}
