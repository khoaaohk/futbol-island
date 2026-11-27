/**
 * Café by the Sea scenery (Nov 24 2026; data and rules: seasideCafe.ts). Built inside buildTown with the island's own helpers
 * (box / cylinder / put / line / lit), so every piece joins the existing 50 m spatial paint batches: the café, deck, posts, railings,
 * tables, chairs, rowboat, steps, pots and the whole flower garden add NO draw call, material or texture. Windows and the string-light
 * bulbs are marked `lit` (machineNightGlow.ts): they glow warm at night from the shared night factor, emissive only, no light.
 * One extra draw: the signs atlas (one canvas texture, one mesh): the round café sign on the gable, the fixtures chalkboard (redrawn
 * once with today's real fixtures when the player comes near: drawFixtures) and the garden sign. It joins the night signs.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {Obstacle} from './simulation';
import {CAFE,CAFE_BALCONY_Y,CAFE_DECKS,CAFE_STEPS,CAFE_LADDER,CAFE_POSTS,CAFE_POST_R,CAFE_BOAT,CAFE_TABLES,CAFE_CHALKBOARD,CAFE_GARDEN_SIGN,CAFE_GARDEN,CAFE_NAME,CAFE_VIEW_SEAT,cafeViewSeatObstacles,cafeWalkSurfaces,type ChalkLine} from './seasideCafe';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';
import {broadleafTreesOn,broadleafBush} from './broadleafTrees';
import {depthLowTier} from './townDepth';
import {softOn,SoftBoxGeometry} from '../graphics/softBox';

type Mesh=T.Mesh;
export type CafeTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number,p?:T.Group)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number,p?:T.Group)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number,p?:T.Group)=>Mesh;
 line:(a:T.Vector3,b:T.Vector3,r:number,c:string)=>Mesh;
 lit:(m:Mesh,w:number,warm?:boolean)=>Mesh;
 town:T.Group;obstacles:Obstacle[];walkSurfaces:(Obstacle&{height:number})[];
 buildings:{x:number;z:number;w:number;d:number;height:number;name:string;cornerRadius?:number}[];
 textures:T.Texture[];materials:T.Material[];nightSigns:T.MeshStandardMaterial[];prop?:PropTagger;
};
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
const jit=(i:number,k=1)=>{const s=Math.sin(i*12.9898+k*78.233)*43758.5453;return s-Math.floor(s);};
// Palette (the island's bright low-poly look; a few new paint colours only).
const WOOD='#b9814f',WOOD_D='#8a5a36',DECK='#c99b67',DECK_D='#a97c4f',TRIM='#f6efe0',PLASTER='#d9e8df',ROOF='#3f6670',ROOF_D='#335660',
 GLASS='#5f8794',STONE='#a8a49a',STONE_D='#8d887e',AWN='#ea8a3e',AWN2='#f6e3c4',LEAF='#5f9a5a',LEAF_D='#4c8250',PINK='#f08fb4',PINK2='#e7609a',
 CREAM='#f3ead7',TEAL='#3f8f8a',CORAL='#e0775a',POT='#c8693f',SOIL='#7a5a3e',RED='#e4505a',WHITE='#fbf7ea',YEL='#f4cc4c',BULB='#ffe3a1',ROPE='#e3d3ae',HULL='#b86b3c',HULL_D='#7d4a2a',FOAM='#eef0e6';

export type CafeBuild={signs:Mesh;drawFixtures:(title:string,lines:ChalkLine[])=>void};
export function buildSeasideCafe(t:CafeTools):CafeBuild{
 const {box,cylinder,put,line,lit,town,obstacles,walkSurfaces,buildings}=t,prop=t.prop??untaggedProp,C=CAFE,F=C.floor;
 const x0=C.x-C.w/2,x1=C.x+C.w/2,zb=C.z-C.d/2,zf=C.front,top=CAFE_BALCONY_Y;
 const skip=(m:Mesh)=>{m.userData.skipRoofObstacle=true;return m;};
 // ---- Floors: the walk surfaces and their colliders (step access), the building's footprint and its walkable balcony top.
 for(const s of cafeWalkSurfaces()){walkSurfaces.push(s);obstacles.push({x:s.x,z:s.z,w:s.w,d:s.d,stepAccess:true});}
 obstacles.push({x:C.x,z:C.z,w:C.w,d:C.d});buildings.push({x:C.x,z:C.z,w:C.w,d:C.d,height:top+.08,name:CAFE_NAME.toUpperCase()});
 // ---- Stone base where it meets the shore, and the deck.
 skip(box(C.w+.3,1.05,C.d+.3,STONE,C.x,F-.52,C.z));
 for(const d of CAFE_DECKS){skip(box(d.w,.14,d.d,DECK,d.x,F-.07,d.z));
  const along=d.w>d.d;for(let k=.55;k<(along?d.d:d.w)-.2;k+=.55)skip(along?box(d.w-.04,.012,.04,DECK_D,d.x,F+.004,d.z-d.d/2+k):box(.04,.012,d.d-.04,DECK_D,d.x-d.w/2+k,F+.004,d.z));}
 // Deck skirt on the sand (stone), a fascia board over the water, boulders along the waterline.
 skip(box(13.8,F+.1,.35,STONE_D,706.9,(F-.1)/2,-88.15));skip(box(.35,F+.1,7.5,STONE_D,713.63,(F-.1)/2,-91.75));
 for(const [z0,z1] of [[-95.5,-93.75],[-89.75,-88]] as const)skip(box(.35,F+.1,z1-z0,STONE_D,700.15,(F-.1)/2,(z0+z1)/2));
 skip(box(.08,.22,10.5,DECK_D,719.03,F-.2,-100.75));skip(box(7,.22,.08,DECK_D,715.5,F-.2,-106.03));skip(box(5.2,.22,.08,DECK_D,716.4,F-.2,-95.47));
 for(let i=0;i<16;i++){const z=-106+i*1.1,x=(z<-99?711.6+(z+106)*.45:714.6+(z+99)*.25)+jit(i,2)*.9,r=.38+jit(i,3)*.35,rock=skip(put(new T.IcosahedronGeometry(r,0),i%3?STONE:STONE_D,x,-.12,z));rock.scale.y=.6;rock.rotation.y=i;}
 // Posts over the water (swim colliders: seasideCafe.ts cafeSwimBlocked) with a static foam ring where each meets the sea.
 for(const p of CAFE_POSTS){skip(cylinder(CAFE_POST_R,2.1,WOOD_D,p.x,F-1.12,p.z));const ring=skip(put(new T.RingGeometry(.24,.46,12),FOAM,p.x,-.405,p.z));ring.rotation.x=-Math.PI/2;}
 // ---- Railings round the deck's outer edges (openings: the steps at the west end and the ladder on the east). Thin colliders keep a
 // walker on the deck (from below, the deck's own .7 m edge already stops one).
 const rail=(ax:number,az:number,bx:number,bz:number)=>{const len=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(len/1.3));
  for(let i=0;i<=n;i++){const x=ax+(bx-ax)*i/n,z=az+(bz-az)*i/n;skip(box(.08,.95,.08,WOOD_D,x,F+.475,z));}
  const mx=(ax+bx)/2,mz=(az+bz)/2,horiz=Math.abs(bz-az)<.01;
  skip(box(horiz?len:.09,.07,horiz?.09:len,WOOD,mx,F+.95,mz));skip(box(horiz?len:.05,.05,horiz?.05:len,WOOD,mx,F+.5,mz));
  obstacles.push({x:mx,z:mz,w:horiz?len:.2,d:horiz?.2:len});};
 rail(700.05,-88.05,713.75,-88.05);rail(713.75,-88.05,713.75,-95.45);rail(713.75,-95.45,718.95,-95.45);rail(718.95,-95.45,718.95,-101.45);rail(718.95,-102.55,718.95,-105.95);rail(712.05,-105.95,718.95,-105.95);rail(712.05,-102.55,712.05,-105.95);
 rail(700.05,-95.45,700.05,-93.8);rail(700.05,-89.7,700.05,-88.05);
 // ---- Ladder down to the sea (east edge).
 {const L=CAFE_LADDER;for(const dz of [-.42,.42]){line(V(L.x-.25,F+.9,L.z+dz),V(L.x+.25,-1.1,L.z+dz),.035,WOOD_D);}
  for(let y=F-.05;y>-1;y-=.32){const k=(F+.9-y)/(F+2),x=L.x-.25+.5*k;skip(box(.06,.05,.84,WOOD,x,y,L.z));}}
 // ---- Stone steps up from the beach with potted flowers.
 for(const s of CAFE_STEPS){skip(box(s.w,s.height,s.d,'#c4bdb0',s.x,s.height/2,s.z));skip(box(s.w+.02,.03,s.d+.02,'#d6d0c3',s.x,s.height+.015,s.z));}
 const pot=(x:number,y:number,z:number,c:string,i:number)=>prop('bush',()=>{skip(cylinder(.2,.32,POT,x,y+.16,z));const b=skip(put(new T.IcosahedronGeometry(.27,0),LEAF,x,y+.43,z));b.scale.y=.75;
  for(let k=0;k<3;k++){const a=k*2.1+i;skip(put(new T.IcosahedronGeometry(.08,0),c,x+Math.cos(a)*.18,y+.55,z+Math.sin(a)*.18));}});
 [[698.4,0,-94.25],[698.4,0,-89.25],[699.3,.47,-94.1],[699.3,.47,-89.4],[700.5,F,-95],[700.5,F,-88.55],[713.3,F,-88.55],[718.5,F,-95.95]].forEach(([x,y,z],i)=>pot(x,y,z,i%2?PINK:RED,i));
 // ---- The ground floor: timber walls, big warm windows, the door, trims.
 box(C.w,C.wallH,C.d,WOOD,C.x,F+C.wallH/2,C.z);
 for(const x of [x0+.12,x1-.12])for(const z of [zf-.12,zb+.12])box(.26,C.wallH,.26,WOOD_D,x,F+C.wallH/2,z);
 const pane=(x:number,z:number,w:number,h:number,y:number,face:'z'|'x')=>{const g=face==='z'?box(w,h,.06,GLASS,x,y,z):box(.06,h,w,GLASS,x,y,z);lit(g,.95,true);
  if(face==='z'){box(w+.16,.1,.1,TRIM,x,y+h/2,z);box(w+.16,.12,.14,TRIM,x,y-h/2,z+.02);box(.07,h,.08,TRIM,x,y,z);}
  else{box(.1,.1,w+.16,TRIM,x,y+h/2,z);box(.14,.12,w+.16,TRIM,x+.02,y-h/2,z);box(.08,h,.07,TRIM,x,y,z);}};
 for(const x of [706.5,708.6,710.7])pane(x,zf+.02,1.85,1.95,F+1.45,'z');
 for(const z of [-101.2,-97.8])pane(x1+.02,z,2,1.8,F+1.5,'x');
 box(1.3,2.25,.08,'#6e4429',C.door.x,F+1.125,zf+.03);lit(box(.9,.8,.09,GLASS,C.door.x,F+1.7,zf+.04),.95,true);box(.08,.08,.12,'#e8c45a',C.door.x+.45,F+1.1,zf+.08);
 box(C.w+.2,.16,.2,TRIM,C.x,F+.08,zf+.04);
 // Counter hatch on the east side (where Malia serves the deck tables): a lit opening and a ledge.
 lit(box(.05,.9,1.6,'#f2c983',x1+.03,F+1.3,-99.5),.8,true);box(.4,.08,1.8,TRIM,x1+.22,F+.86,-99.5);
 // ---- The awning: orange and cream stripes sloping out over the front, scalloped edge.
 {const len=2.4,ang=-.27,yc=F+2.82,zc=zf+1.12,stripes=9,w=9.4/stripes,xs=C.x+.35-9.4/2;
  for(let i=0;i<stripes;i++){const s=box(w+.01,.07,len,i%2?AWN2:AWN,xs+w*(i+.5),yc,zc);s.rotation.x=ang;}
  const edgeZ=zc+Math.cos(ang)*len/2+.01,edgeY=yc+Math.sin(ang)*len/2-.02;
  for(let i=0;i<stripes*2;i++){const sc=put(new T.CircleGeometry(.26,7,Math.PI,Math.PI),i%4<2?AWN:AWN2,xs+w*(i+.5)/2,edgeY,edgeZ);sc.userData.skipRoofObstacle=true;}
  for(const x of [xs+.1,xs+9.3])line(V(x,yc+.2,zf),V(x,edgeY+.06,edgeZ-.05),.03,'#5a4636');}
 // ---- Balcony: the floor ledge, railing, flower planters spilling pink-flowered greenery (front and sea side).
 box(C.w+.5,.16,C.d+.5,WOOD_D,C.x,top,C.z);
 {const bx0=x0-.2,bx1=x1+.2,bz0=zb-.2,bz1=zf+.2,y=top+.08;
  const brail=(ax:number,az:number,bx:number,bz:number)=>{const len=Math.hypot(bx-ax,bz-az),horiz=Math.abs(bz-az)<.01,n=Math.round(len/.45);
   for(let i=0;i<=n;i++)box(.05,.85,.05,WOOD,ax+(bx-ax)*i/n,y+.42,az+(bz-az)*i/n);box(horiz?len+.06:.08,.07,horiz?.08:len+.06,WOOD_D,(ax+bx)/2,y+.86,(az+bz)/2);};
  brail(bx0,bz1,bx1,bz1);brail(bx1,bz1,bx1,bz0);brail(bx0,bz0,bx1,bz0);brail(bx0,bz1,bx0,bz0);
  // planters hang on the outside of the front and east rails; flowers and trailing vines
  let i=0;const bloom=(x:number,yy:number,z:number)=>{put(new T.IcosahedronGeometry(.075,0),i%3?PINK:PINK2,x,yy,z);i++;};
  for(let x=bx0+.4;x<bx1-.2;x+=.9){box(.8,.28,.3,LEAF_D,x,y-.02,bz1+.16);const g=put(new T.IcosahedronGeometry(.3,0),LEAF,x,y+.18,bz1+.2);g.scale.set(1.4,.7,.8);
   bloom(x-.2,y+.3,bz1+.32);bloom(x+.15,y+.26,bz1+.38);bloom(x+.3,y+.12,bz1+.4);
   if(jit(x)>.35){const h=.5+jit(x,2)*.9;box(.12,h,.08,LEAF,x+.1,y-.15-h/2,bz1+.3);bloom(x+.1,y-.2-h*.6,bz1+.36);}}
  for(let z=bz0+.5;z<bz1-.3;z+=.95){box(.3,.28,.8,LEAF_D,bx1+.16,y-.02,z);const g=put(new T.IcosahedronGeometry(.3,0),LEAF,bx1+.2,y+.18,z);g.scale.set(.8,.7,1.4);
   bloom(bx1+.34,y+.3,z-.2);bloom(bx1+.38,y+.16,z+.25);if(jit(z,4)>.4){const h=.6+jit(z,5)*.8;box(.08,h,.12,LEAF,bx1+.3,y-.15-h/2,z);bloom(bx1+.36,y-.2-h*.5,z);}}
  // climbing greenery up the front corner post from the deck
  for(let k=0;k<7;k++){const yy=F+.4+k*.48;const g=put(new T.IcosahedronGeometry(.22,0),k%2?LEAF:LEAF_D,x0-.05+jit(k,7)*.15,yy,zf+.05);g.scale.set(.8,1.1,.7);bloom(x0+.1,yy+.1,zf+.2);}}
 // ---- Upper floor (inset: the balcony walkway runs round it), its windows and French door, and the gable roof with the round sign.
 const uy=top+.08,uz=C.z-.3,ufront=uz+C.upperD/2;
 box(C.upperW,C.upperH,C.upperD,PLASTER,C.x,uy+C.upperH/2,uz);
 for(const x of [C.x-2.7,C.x+2.7]){lit(box(1.1,1.1,.06,GLASS,x,uy+1.45,ufront+.03),.85,true);box(1.26,.09,.1,TRIM,x,uy+2.04,ufront+.04);box(1.26,.09,.12,TRIM,x,uy+.86,ufront+.05);box(.06,1.1,.08,TRIM,x,uy+1.45,ufront+.05);}
 lit(box(1.4,2.05,.06,GLASS,C.x,uy+1.03,ufront+.03),.85,true);box(.08,2.05,.08,TRIM,C.x,uy+1.03,ufront+.05);box(1.56,.1,.1,TRIM,C.x,uy+2.1,ufront+.05);
 lit(box(.06,1,1.2,GLASS,C.x+C.upperW/2+.03,uy+1.45,uz),.85,true);
 {const rise=C.roofRise,half=C.upperW/2+.55,len=Math.hypot(half,rise),ang=Math.atan2(rise,half),deep=C.upperD+1.1,ry=uy+C.upperH;
  for(const s of [-1,1]){const slab=box(len+.1,.2,deep,s<0?ROOF:ROOF_D,C.x+s*half/2,ry+rise/2+.06,uz);slab.rotation.z=-s*ang;}
  box(.2,.2,deep+.04,'#2c4a52',C.x,ry+rise+.1,uz);
  const tri=new T.Shape();tri.moveTo(-C.upperW/2,0);tri.lineTo(C.upperW/2,0);tri.lineTo(0,rise);tri.closePath();
  put(new T.ShapeGeometry(tri),PLASTER,C.x,ry,ufront+.005);const back=put(new T.ShapeGeometry(tri),PLASTER,C.x,ry,uz-C.upperD/2-.005);back.rotation.y=Math.PI;
  // round sign: a gold rim and cream disc (batched); the lettering is the atlas sign below
  const rim=put(new T.CylinderGeometry(.82,.82,.08,20),'#d8b24c',C.x,ry+.78,ufront+.05);rim.rotation.x=Math.PI/2;
  cylinder(.07,.5,'#d8b24c',C.x,ry+rise+.42,uz);put(new T.IcosahedronGeometry(.12,0),'#d8b24c',C.x,ry+rise+.7,uz);}
 // ---- String lights along the deck front, on three poles (bulbs glow at night; emissive only).
 {const poles=[700.3,707,713.5],hy=F+2.55,z=-88.25;
  for(const x of poles)skip(cylinder(.05,2.55,WOOD_D,x,F+1.27,z));
  for(let k=0;k<poles.length-1;k++){const a=poles[k],b=poles[k+1],n=10;let prev=V(a,hy,z);
   for(let i=1;i<=n;i++){const u=i/n,x=a+(b-a)*u,y=hy-Math.sin(u*Math.PI)*.45,p=V(x,y,z);skip(line(prev,p,.008,'#3b3530'));prev=p;
    if(i<n){const bulb=skip(put(new T.IcosahedronGeometry(.065,0),BULB,x,y-.07,z));lit(bulb,1);}}}
  // and a short run from the awning's corner to the first pole
  for(let i=1;i<6;i++){const u=i/6,bulb=skip(put(new T.IcosahedronGeometry(.06,0),BULB,x0+(700.3-x0)*u,F+2.7-Math.sin(u*Math.PI)*.3,zf+1.9+(-88.25-zf-1.9)*u));lit(bulb,1);}}
 // ---- Tables and chairs on the deck (colliders: a table and its chairs).
 CAFE_TABLES.forEach((tb,i)=>{skip(cylinder(.46,.05,CREAM,tb.x,F+.74,tb.z));skip(cylinder(.05,.72,'#5a4636',tb.x,F+.37,tb.z));
  for(let k=0;k<tb.chairs;k++){const a=k*Math.PI*2/tb.chairs+i*.6,cx=tb.x+Math.cos(a)*.72,cz=tb.z+Math.sin(a)*.72,c=k%2?TEAL:CORAL;
   skip(box(.42,.05,.42,c,cx,F+.45,cz));skip(box(.06,.45,.06,'#5a4636',cx,F+.22,cz));
   const back=skip(box(.42,.42,.05,c,cx+Math.cos(a)*.2,F+.68,cz+Math.sin(a)*.2));back.rotation.y=-a+Math.PI/2;}
  if(tb.chairs)obstacles.push({x:tb.x,z:tb.z,w:1.5,d:1.5});});
 // ---- The view seat (Nov 25 2026): a short bench behind the corner table, facing Summit Isle. Island-bench section (npcSeatPose BENCH:
 // seat top .64 over the floor, backrest at local z −.25) so the bench pose fits; 1.3 m long. Batched like the chairs (no draw call).
 {const V=CAFE_VIEW_SEAT,B=V.bench,g=new T.Group();g.position.set(B.x,F,B.z);g.rotation.y=V.yaw;town.add(g);
  skip(box(B.w,.12,.65,'#a67d55',0,.58,0,g));skip(box(B.w,.45,.09,'#a67d55',0,.91,-.25,g));for(const dx of [-.48,.48])skip(box(.12,.5,.5,'#5a4636',dx,.27,0,g));
  obstacles.push(...cafeViewSeatObstacles());}
 // ---- The rowboat moored off the east deck, tied to a post.
 const BOAT_Y=.05;
 {const B=CAFE_BOAT,g=new T.Group();g.position.set(B.x,BOAT_Y,B.z);g.rotation.y=B.yaw;town.add(g);/* owner shot 83: it sat under the water; now the hull rides on top (waterline ~ a third up) */
  if(softOn()){// soft sweep (Nov 27 2026): one rounded hull tapering to a soft bow (no rotated-box bow), a pillowed floor, rounded thwarts;
   // it rocks gently in place through the island wind's vertex sway (userData.swayRock, world.ts batching: 0 draws, the same clock).
   const L=B.len*.92,hl=L/2,taper=(geo:T.BufferGeometry,ox:number)=>{const P=geo.getAttribute('position');for(let i=0;i<P.count;i++){const u=(P.getX(i)+ox)/hl;if(u>0)P.setZ(i,P.getZ(i)*(1-.72*Math.pow(Math.min(1,u),2.2)));else P.setZ(i,P.getZ(i)*(1-.16*u*u));}P.needsUpdate=true;return geo;};
   const rock=[BOAT_Y-.2,.7,.35];
   for(const [geo,c,x,y] of [[taper(new SoftBoxGeometry(L,.42,B.beam,{radius:.2,seg:2}),0),HULL,0,0],[taper(new SoftBoxGeometry(L-.3,.1,B.beam-.22,{radius:.05,seg:1,dome:.02}),0),HULL_D,0,.17],
    [new SoftBoxGeometry(.24,.06,B.beam-.3,{radius:.03,seg:1}),CREAM,-.1,.24],[new SoftBoxGeometry(.24,.06,B.beam-.26,{radius:.03,seg:1}),CREAM,-1,.24]] as [T.BufferGeometry,string,number,number][])
    put(geo,c,x,y,0,g).userData.swayRock=rock;
   for(const sd of [-1,1])put(taper(new T.CylinderGeometry(.04,.04,L-.1,8).rotateZ(Math.PI/2).translate(0,0,sd*(B.beam/2-.02)),0),TRIM,0,.22,0,g).userData.swayRock=rock;}
  else{box(B.len*.72,.42,B.beam,HULL,-.2,0,0,g);const bow=box(B.beam*.71,.42,B.beam*.71,HULL,B.len*.36-.2,0,0,g);bow.rotation.y=Math.PI/4;
  box(B.len*.68,.1,B.beam-.22,HULL_D,-.2,.17,0,g);box(.24,.06,B.beam-.18,CREAM,-.1,.24,0,g);box(.24,.06,B.beam-.18,CREAM,-1,.24,0,g);
  box(B.len*.72+.04,.06,.06,TRIM,-.2,.2,B.beam/2,g);box(B.len*.72+.04,.06,.06,TRIM,-.2,.2,-B.beam/2,g);}
  for(const s of [-1,1]){const oar=line(V(B.x-.3,BOAT_Y+.3,B.z+s*.5),V(B.x-1.5,BOAT_Y+.4,B.z+s*.85),.03,WOOD);oar.userData.skipRoofObstacle=true;}
  skip(line(V(B.x-1.5,BOAT_Y+.25,B.z-.3),V(718.7,F-.3,-100.5),.015,ROPE));
  obstacles.push({x:B.x,z:B.z,w:B.len,d:B.beam+.6});}
 // ---- The fixtures chalkboard (A-frame) and the garden sign: frames batched; faces are the atlas below.
 {const K=CAFE_CHALKBOARD,g=new T.Group();g.position.set(K.x,0,K.z);g.rotation.y=K.yaw;town.add(g);
  for(const s of [-1,1]){box(.07,1.35,.07,WOOD_D,s*(K.w/2+.04),.67,.12,g);box(.07,1.35,.07,WOOD_D,s*(K.w/2+.04),.67,-.28,g);}
  box(K.w+.16,K.h+.14,.05,WOOD,0,.45+K.h/2,.08,g);box(K.w+.2,.06,.12,WOOD_D,0,.42,.12,g);obstacles.push({x:K.x,z:K.z,w:1.2,d:.8});}
 {const S=CAFE_GARDEN_SIGN;cylinder(.05,1,WOOD_D,S.x,.5,S.z);const b=box(S.w+.1,S.h+.1,.05,WOOD,S.x,.95,S.z-.03);b.rotation.y=S.yaw;}
 // ---- The butterfly garden: stone-edged beds of hibiscus, daisies and pink climbers (all batched).
 CAFE_GARDEN.forEach((bed,bi)=>{const {x,z,w,d}=bed;
  skip(box(w,.1,d,SOIL,x,.05,z));for(const [ex,ez,ew,ed] of [[x,z-d/2,w+.2,.16],[x,z+d/2,w+.2,.16],[x-w/2,z,.16,d],[x+w/2,z,.16,d]])skip(box(ew,.16,ed,'#c4bdb0',ex,.08,ez));
  if(bed.kind==='hibiscus'){for(let i=0;i<6;i++){const px=x-w/2+.6+jit(i,bi)*(w-1.2),pz=z-d/2+.6+jit(i,bi+3)*(d-1.2);
    prop('bush',()=>{if(broadleafTreesOn()){const b=broadleafBush(px,pz,.45,{soft:true,low:depthLowTier()});skip(put(b.leaves,i%2?LEAF:LEAF_D,px,.42,pz)).userData.leafShade=b.shade;}else{const s=skip(put(new T.IcosahedronGeometry(.42,0),i%2?LEAF:LEAF_D,px,.42,pz));s.scale.y=.85;}
     for(let k=0;k<4;k++){const a=k*1.6+i;const f=skip(put(new T.IcosahedronGeometry(.11,0),k%2?RED:'#f07aa0',px+Math.cos(a)*.34,.55+jit(k,i)*.2,pz+Math.sin(a)*.34));f.scale.y=.6;}});}}
  else if(bed.kind==='daisy'){const n=Math.round(w*d*2.4);for(let i=0;i<n;i++){const px=x-w/2+.2+jit(i,bi+5)*(w-.4),pz=z-d/2+.2+jit(i,bi+9)*(d-.4);
    skip(put(new T.ConeGeometry(.09,.22,4),LEAF,px,.2,pz));const f=skip(put(new T.IcosahedronGeometry(.07,0),i%5===0?YEL:i%7===0?'#b98ae0':WHITE,px,.33,pz));f.scale.y=.5;}}
  else{// pink climbers on a trellis along the steps
   for(const zz of [z-d/2+.3,z+d/2-.3])skip(box(.07,1.6,.07,WOOD_D,x,.8,zz));for(const yy of [.6,1.1,1.55])skip(box(.05,.05,d-.5,WOOD,x,yy,z));
   for(let i=0;i<14;i++){const zz=z-d/2+.5+i*(d-1)/13,yy=.35+jit(i,11)*1.2;const g=skip(put(new T.IcosahedronGeometry(.26,0),i%2?LEAF:LEAF_D,x+(jit(i,12)-.5)*.3,yy,zz));g.scale.set(.7,1,.9);
    for(let k=0;k<2;k++)skip(put(new T.IcosahedronGeometry(.08,0),k?PINK:PINK2,x+(k?.2:-.2),yy+.15,zz+(k?.1:-.1)));}}});
 // ---- Signs atlas (one texture, one material, one draw): round café sign | chalkboard | garden sign.
 const W=1024,H=512,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d')!;
 const R={sign:[0,0,512,512],board:[512,0,512,384],garden:[512,384,512,128]} as const;
 const fit=(text:string,max:number,size:number,font:(s:number)=>string)=>{let s=size;ctx.font=font(s);while(s>10&&ctx.measureText(text).width>max){s-=2;ctx.font=font(s);}return s;};
 const sans=(s:number)=>`800 ${s}px "Trebuchet MS", "Avenir Next", system-ui, sans-serif`,chalk=(s:number)=>`700 ${s}px "Chalkboard SE", "Marker Felt", "Trebuchet MS", sans-serif`;
 const drawSign=()=>{const [x,y,w]=R.sign,cx=x+w/2,cy=y+w/2;ctx.clearRect(x,y,w,w);
  ctx.fillStyle='#d8b24c';ctx.beginPath();ctx.arc(cx,cy,w/2-4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fbf3df';ctx.beginPath();ctx.arc(cx,cy,w/2-26,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2f5f66';ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,w/2-44,0,Math.PI*2);ctx.stroke();
  // Nov 25 2026 (owner: the name swap): CAFÉ / BY THE SEA. Both lines stay inside the inner ring's chord at their height (r 212).
  ctx.fillStyle='#2f5f66';ctx.textAlign='center';ctx.textBaseline='middle';fit('CAFÉ',300,104,sans);ctx.fillText('CAFÉ',cx,cy-62);
  ctx.fillStyle='#e07a3a';fit('BY THE SEA',340,78,sans);ctx.fillText('BY THE SEA',cx,cy+52);
  // a little ball between the words
  ctx.fillStyle='#2f5f66';ctx.beginPath();ctx.arc(cx,cy-2,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fbf3df';ctx.beginPath();ctx.arc(cx,cy-2,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2f5f66';fit('EST. ON CORAL CAY',260,26,sans);ctx.fillText('EST. ON CORAL CAY',cx,cy+128);};
 const drawGarden=()=>{const [x,y,w,h]=R.garden;ctx.fillStyle='#fbf3df';ctx.fillRect(x,y,w,h);ctx.fillStyle='#4c8250';ctx.textAlign='center';ctx.textBaseline='middle';
  fit('BUTTERFLY GARDEN',470,52,sans);ctx.fillText('BUTTERFLY GARDEN',x+w/2,y+44);ctx.fillStyle='#7a5a3e';fit('Zigzag like a winger: they change direction to beat the birds',480,24,sans);
  ctx.fillText('Zigzag like a winger: they change direction to beat the birds',x+w/2,y+96);};
 const drawFixtures=(title:string,lines:ChalkLine[])=>{const [x,y,w,h]=R.board;ctx.fillStyle='#2e3b36';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=18;ctx.strokeRect(x+18,y+18,w-36,h-36);
  ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillStyle='#f6f1df';fit(title,w-80,48,chalk);ctx.fillText(title,x+w/2,y+58);
  ctx.strokeStyle='#f4cc4c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+90,y+92);ctx.lineTo(x+w-90,y+92);ctx.stroke();
  if(!lines.length){ctx.fillStyle='#dfe8de';fit('Ask Malia for today’s games',w-90,32,chalk);ctx.fillText('Ask Malia for today’s games',x+w/2,y+190);
   ctx.fillStyle='#f4cc4c';fit('Water · Fruit at half-time · Refuel after',w-90,26,chalk);ctx.fillText('Water · Fruit at half-time · Refuel after',x+w/2,y+260);}
  else lines.forEach((l,i)=>{const yy=y+140+i*58;ctx.textAlign='left';ctx.fillStyle='#f6f1df';fit(l.left,w-170,32,chalk);ctx.fillText(l.left,x+44,yy);
   ctx.textAlign='right';ctx.fillStyle=l.live?'#ff9b7a':'#f4cc4c';ctx.font=chalk(28);ctx.fillText(l.right,x+w-40,yy);});
  texture.needsUpdate=true;};
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;t.textures.push(texture);
 drawSign();drawGarden();
 const material=new T.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffe1aa',emissiveIntensity:0,roughness:.9,alphaTest:.5});material.name='half-time-cafe-signs';t.materials.push(material);t.nightSigns.push(material);
 const quad=(w:number,h:number,r:readonly number[],m:T.Matrix4)=>{const g=new T.PlaneGeometry(w,h),uv=g.getAttribute('uv') as T.BufferAttribute;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(r[0]+uv.getX(i)*r[2])/W,1-(r[1]+(1-uv.getY(i))*r[3])/H);return g.applyMatrix4(m);};
 const M=(x:number,y:number,z:number,yaw=0,tilt=0)=>new T.Matrix4().compose(V(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(tilt,yaw,0,'YXZ')),V(1,1,1));
 const K=CAFE_CHALKBOARD,S=CAFE_GARDEN_SIGN,ry=uy+C.upperH,fz=uz+C.upperD/2+.1,kc=Math.cos(K.yaw),ks=Math.sin(K.yaw);
 const parts=[quad(1.5,1.5,R.sign,M(C.x,ry+.78,fz)),quad(K.w,K.h,R.board,M(K.x+ks*.12,.45+K.h/2,K.z+kc*.12,K.yaw,-.08)),quad(S.w,S.h,R.garden,M(S.x+Math.sin(S.yaw)*.01,.95,S.z+Math.cos(S.yaw)*.01-.0,S.yaw))];
 const geo=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());
 const signs=new T.Mesh(geo,material);signs.name='half-time-cafe-signs';signs.userData.skipRoofObstacle=true;signs.castShadow=false;town.add(signs);
 drawFixtures('TODAY’S FIXTURES',[]);
 return {signs,drawFixtures};
}
