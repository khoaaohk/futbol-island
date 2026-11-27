// Palm Street parking garage (Nov 27 2026, owner on the space under the rooftop futsal court: "this inside below the futsal doesn't
// make sense … should be a parking garage with cars"). The timber frame stays outside (the island's look); inside it is concrete:
// a painted deck floor (bay lines, bay numbers, arrows: one canvas texture), rounded concrete columns with yellow / black safety
// sleeves, low rounded parapets instead of the old blank panels (you see in), wheel stops, a booth, a lifting barrier, a 2.1 m height
// bar, P / PARKING / EXIT signs and soft ceiling light strips. Five rounded street cars (trafficVehicles.ts, as-is) are parked.
// HEAT: no lights; 4 draws in all (one vertex-coloured mesh for every plain part and the cars, the floor, one sign atlas, one
// emissive strip batch), nothing animated, no shadow casters. See-in only: the deck above is the walkable court (venues.ts
// parkingSurfaceHeight returns the roof height over the whole footprint), so the barrier is down and the walls keep their colliders.
import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {buildVehicleGeometry,type VehicleStyle} from '../graphics/trafficVehicles';

/** Inside faces of the frame (the timber posts stand on x -3 / 25 and z -10 / 46). */
export const GARAGE={minX:-2.65,maxX:24.65,minZ:-9.65,maxZ:45.65,floorY:.07,ceilingY:5.62};
/** The way in / out on the street side (between the front posts at x 2.4 and 9.4), facing the north sidewalk and the street at z 65. */
export const GARAGE_ENTRANCE={x:5.9,z:46,w:6.3,apronTo:58.6};
/** Bays, 2.6 m wide. Rows run along z (the west wall row, the middle double row back to back on x 14.2) or along x (the street-side
 *  row behind the front parapet: the one the high play camera sees through the openings, the deck hides the rest). `d0..d1` is the
 *  bay depth across the row, `s0` where the row starts, `nose` the side the wheel stops are on (+/- along the depth axis). */
const BAY_W=2.6;
type Row={along:'z'|'x';d0:number;d1:number;s0:number;n:number;nose:1|-1};
const ROWS:Row[]=[{along:'z',d0:-2.65,d1:2.6,s0:-6.4,n:17,nose:-1},{along:'z',d0:9.2,d1:14.2,s0:-6.4,n:15,nose:1},{along:'z',d0:14.2,d1:19.2,s0:-6.4,n:15,nose:-1},{along:'x',d0:40.45,d1:45.65,s0:10.3,n:5,nose:1}];
let bayN=0;
export const GARAGE_BAYS=ROWS.flatMap((r,row)=>Array.from({length:r.n},(_,i)=>{const s=r.s0+BAY_W*(i+.5),d=(r.d0+r.d1)/2;return {row,n:++bayN,x:r.along==='z'?d:s,z:r.along==='z'?s:d,nose:r.nose};}));
export const GARAGE_COLUMNS=[2.6,14.2].flatMap(x=>[-6.4,4,14.4,24.8,32.6].map(z=>({x,z})));
/** Parked cars: bay number, style, paint (fixed: the same six every visit). */
const CARS:[number,VehicleStyle,string][]=[[16,'sedan','#e0574a'],[13,'hatch','#4f8fc9'],[31,'wagon','#f2c14e'],[46,'jeep','#6fbf8a'],[48,'taxi','#f4d35e'],[51,'hatch','#f1ece1'],[6,'van','#9ab7d3']];
export const GARAGE_BARRIER={x:5.9,z:45.55,w:6.0};
export const GARAGE_BOOTH={x:.95,z:43.9,w:2,d:1.8};
export const GARAGE_LABELS=['PARKING','EXIT','2.1 m','P'] as const;

const CONCRETE='#d9d3c6',CONCRETE_DARK='#c2bcaf',YELLOW='#f2c230',BLACK='#2b2f30',RED='#d9503f',WHITE='#f4efe4',GLASS='#8fb3b0',GREEN='#477c6a',CREAM='#efe1bd',CEILING='#f1ece2';

/** A soft box: a BoxGeometry whose edge bands are bent round (seg 1 = a 45 degree chamfer, 2 = a rounder edge). Local, not three's
 *  RoundedBoxGeometry: the node sandboxes that build the island (tests) load only three's core and BufferGeometryUtils. */
function softBox(w:number,h:number,d:number,seg:number,r:number){
 const n=2*seg+1,g=new T.BoxGeometry(1,1,1,n,n,n),p=g.getAttribute('position') as T.BufferAttribute,nr=g.getAttribute('normal') as T.BufferAttribute,half=[w/2,h/2,d/2];
 const v=[0,0,0],inner=[0,0,0],o=[0,0,0];
 for(let i=0;i<p.count;i++){
  for(let a=0;a<3;a++){const t=(a===0?p.getX(i):a===1?p.getY(i):p.getZ(i)),k=Math.round((t+.5)*n),H=half[a];
   v[a]=k<=seg?-H+r*k/seg:k>=n-seg?H-r*(n-k)/seg:0;inner[a]=Math.max(-(H-r),Math.min(H-r,v[a]));o[a]=v[a]-inner[a];}
  const L=Math.hypot(o[0],o[1],o[2])||1;p.setXYZ(i,inner[0]+o[0]/L*r,inner[1]+o[1]/L*r,inner[2]+o[2]/L*r);nr.setXYZ(i,o[0]/L,o[1]/L,o[2]/L);}
 return g;
}
type Piece={g:T.BufferGeometry;color:string};
function rounded(w:number,h:number,d:number,r:number,color:string,x:number,y:number,z:number,seg=1,yaw=0):Piece{
 const g=softBox(w,h,d,seg,Math.min(r,w/2-.001,h/2-.001,d/2-.001));if(yaw)g.rotateY(yaw);g.translate(x,y,z);return {g,color};
}
const paint=(p:Piece)=>{const g=(p.g.index?p.g.toNonIndexed():p.g);g.deleteAttribute('uv');const c=new T.Color(p.color),n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));return g;};

/** The floor: concrete, joints, bay lines and numbers, aisle arrows, a zebra walk at the door. One 512 x 1024 canvas. */
function floorTexture(doc:Document){
 const W=512,H=1024,c=doc.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d')!;
 const G=GARAGE,sx=W/(G.maxX-G.minX),sz=H/(G.maxZ-G.minZ),px=(v:number)=>(v-G.minX)*sx,pz=(v:number)=>(v-G.minZ)*sz;
 x.fillStyle='#a9a498';x.fillRect(0,0,W,H);
 // soft stains (fixed seed) and the pour joints
 let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<70;i++){x.fillStyle=`rgba(${rnd()<.5?120:255},${rnd()<.5?115:250},110,${.03+rnd()*.04})`;x.beginPath();x.ellipse(rnd()*W,rnd()*H,8+rnd()*40,6+rnd()*26,rnd()*3,0,7);x.fill();}
 x.strokeStyle='rgba(90,86,80,.25)';x.lineWidth=1;for(let v=G.minX+6.8;v<G.maxX;v+=6.8){x.beginPath();x.moveTo(px(v),0);x.lineTo(px(v),H);x.stroke();}
 for(let v=G.minZ+6.9;v<G.maxZ;v+=6.9){x.beginPath();x.moveTo(0,pz(v));x.lineTo(W,pz(v));x.stroke();}
 // bay lines + numbers
 x.strokeStyle=WHITE;x.lineWidth=2.6;x.fillStyle=WHITE;x.textAlign='center';x.textBaseline='middle';x.font='900 20px monospace';
 const seg=(r:Row,a0:number,a1:number,s:number)=>{x.beginPath();if(r.along==='z'){x.moveTo(px(a0),pz(s));x.lineTo(px(a1),pz(s));}else{x.moveTo(px(s),pz(a0));x.lineTo(px(s),pz(a1));}x.stroke();};
 for(const r of ROWS){const open=r.nose<0?r.d1:r.d0,end=r.s0+BAY_W*r.n;for(let i=0;i<=r.n;i++)seg(r,r.d0+.15,r.d1-.15,r.s0+BAY_W*i);
  x.beginPath();if(r.along==='z'){x.moveTo(px(open),pz(r.s0));x.lineTo(px(open),pz(end));}else{x.moveTo(px(r.s0),pz(open));x.lineTo(px(end),pz(open));}x.stroke();}
 for(const b of GARAGE_BAYS){const r=ROWS[b.row],open=r.nose<0?r.d1:r.d0,k=-r.nose*1.1;x.fillText(String(b.n),px(r.along==='z'?open+(-k):b.x),pz(r.along==='z'?b.z:open-k));}
 // aisle arrows (one way round: in down the west aisle, out up the east one and back along the north end)
 // arrow(x, z, turn): drawn pointing south (+z), turned clockwise on the canvas (PI = north, PI/2 = west)
 const arrow=(ax:number,az:number,turn:number)=>{x.save();x.translate(px(ax),pz(az));x.rotate(turn);x.scale(sx,sx);x.fillStyle='rgba(244,239,228,.92)';x.beginPath();x.moveTo(-.25,-1.2);x.lineTo(.25,-1.2);x.lineTo(.25,.2);x.lineTo(.7,.2);x.lineTo(0,1.3);x.lineTo(-.7,.2);x.lineTo(-.25,.2);x.closePath();x.fill();x.restore();};
 for(const z of [30,16,0])arrow(5.9,z,0);for(const z of [0,16,30])arrow(21.9,z,Math.PI);arrow(12.5,36.5,Math.PI/2);
 // yellow kerb paint round the column feet and the zebra walk across the door
 x.fillStyle=YELLOW;for(const c0 of GARAGE_COLUMNS){x.fillRect(px(c0.x-.55),pz(c0.z-.55),1.1*sx,1.1*sz);}
 x.fillStyle='rgba(244,239,228,.9)';for(let v=3.05;v<8.9;v+=.8)x.fillRect(px(v),pz(41.4),.42*sx,2.2*sz);
 x.font='900 34px monospace';x.fillStyle=YELLOW;x.save();x.translate(px(17.2),pz(36.5));x.fillText('EXIT',0,0);x.restore();
 x.fillStyle=YELLOW;x.fillRect(0,0,W,4);x.fillRect(0,H-4,W,4);x.fillRect(0,0,4,H);x.fillRect(W-4,0,4,H);
 return c;
}

/** Sign atlas (512 x 256): PARKING header (top half), EXIT (bottom left), MAX 2.1 m (bottom right). */
function signAtlas(doc:Document){
 const c=doc.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d')!;x.textAlign='center';x.textBaseline='middle';
 const pill=(X:number,Y:number,w:number,h:number,r:number)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();x.fill();};
 x.fillStyle=GREEN;x.fillRect(0,0,512,128);x.fillStyle='#2f6fb0';pill(14,14,100,100,22);x.fillStyle='#fff';x.font='900 84px sans-serif';x.fillText('P',64,68);
 x.fillStyle=CREAM;x.font='900 64px monospace';x.fillText('PARKING',318,68);
 x.fillStyle='#2f8a57';x.fillRect(0,128,256,128);x.fillStyle='#fff';x.font='900 62px monospace';x.fillText('EXIT',128,194);
 x.fillStyle=YELLOW;x.fillRect(256,128,256,128);x.fillStyle=BLACK;x.font='900 30px monospace';x.fillText('MAX',384,160);x.font='900 60px monospace';x.fillText('2.1 m',384,212);
 return c;
}
function atlasPlane(w:number,h:number,u0:number,v0:number,u1:number,v1:number,x:number,y:number,z:number,yaw:number){
 const g=new T.PlaneGeometry(w,h),uv=g.getAttribute('uv') as T.BufferAttribute;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)?u1:u0,uv.getY(i)?v1:v0);g.rotateY(yaw);g.translate(x,y,z);return g;
}

export type GarageBuild={root:T.Group;triangles:number;draws:number;stripMaterial:T.MeshStandardMaterial};
export function buildParkingGarage(o:{doc:Document;textures:T.Texture[];materials:T.Material[];nightSigns:T.MeshStandardMaterial[]}):GarageBuild{
 const G=GARAGE,root=new T.Group();root.name='parking-garage';const parts:Piece[]=[];
 // Low rounded parapets between the posts (the old blank panels and mid rails are gone: you see in); the door gap is open.
 const len=G.maxZ-G.minZ,wid=G.maxX-G.minX;
 parts.push(rounded(.32,1.05,len,.12,CONCRETE,-2.8,.55,(G.minZ+G.maxZ)/2,2),rounded(.32,1.05,len,.12,CONCRETE,24.8,.55,(G.minZ+G.maxZ)/2,2),rounded(wid,1.05,.32,.12,CONCRETE,11,.55,-9.8,2));
 const doorL=GARAGE_ENTRANCE.x-GARAGE_ENTRANCE.w/2,doorR=GARAGE_ENTRANCE.x+GARAGE_ENTRANCE.w/2;
 parts.push(rounded(doorL-G.minX,1.05,.32,.12,CONCRETE,(G.minX+doorL)/2,.55,45.8,2),rounded(G.maxX-doorR,1.05,.32,.12,CONCRETE,(doorR+G.maxX)/2,.55,45.8,2));
 // a pier behind the street-side P sign (it used to hang in front of a panel)
 parts.push(rounded(1.9,2.95,.26,.1,CONCRETE_DARK,23,1.47,46.3,2));
 // Columns: concrete, a yellow sleeve and two black bands at the foot (the safety stripes)
 for(const c of GARAGE_COLUMNS){parts.push(rounded(.6,G.ceilingY-.02,.6,.1,CONCRETE,c.x,G.ceilingY/2,c.z,1),rounded(.66,.9,.66,.1,YELLOW,c.x,.5,c.z,1));
  for(const y of [.32,.72])parts.push(rounded(.68,.17,.68,.06,BLACK,c.x,y,c.z,1));
}
 // Wheel stops at the nose of every bay
 for(const b of GARAGE_BAYS){const r=ROWS[b.row],d=r.nose<0?r.d0+.75:r.d1-.75;parts.push(r.along==='z'?rounded(.26,.15,1.5,.06,b.n%2?YELLOW:CONCRETE_DARK,d,G.floorY+.075,b.z,1):rounded(1.5,.15,.26,.06,b.n%2?YELLOW:CONCRETE_DARK,b.x,G.floorY+.075,d,1));}
 // Booth: cream walls, a glass band, a green roof with a soft overhang
 const B=GARAGE_BOOTH;
 parts.push(rounded(B.w,1.15,B.d,.18,CREAM,B.x,G.floorY+.58,B.z,2),rounded(B.w-.06,.85,B.d-.06,.08,GLASS,B.x,G.floorY+1.58,B.z,1),rounded(.16,.85,.16,.06,CREAM,B.x+B.w/2-.1,G.floorY+1.58,B.z+B.d/2-.1,1),
  rounded(B.w+.5,.24,B.d+.5,.11,GREEN,B.x,G.floorY+2.13,B.z,2));
 // Barrier: a post with a rounded head beside the booth, a red / white arm down across the door
 const bx=doorL+.25,bz=GARAGE_BARRIER.z;
 parts.push(rounded(.4,1.05,.4,.12,YELLOW,bx,G.floorY+.53,bz,2),rounded(.5,.32,.46,.14,BLACK,bx,G.floorY+1.12,bz,2));
 for(let i=0;i<6;i++){const seg=(GARAGE_BARRIER.w-.4)/6;parts.push(rounded(seg,.13,.13,.05,i%2?WHITE:RED,bx+.25+seg*(i+.5),G.floorY+1.05,bz,1));}
 parts.push(rounded(.12,.55,.12,.05,BLACK,doorR-.3,G.floorY+.28,bz,1),rounded(.2,.08,.2,.035,YELLOW,doorR-.3,G.floorY+.6,bz,1));// the arm's rest
 // Height bar (2.1 m) on two hangers outside the door: yellow / black blocks
 const hz=46.75,hy=2.25;
 for(let i=0;i<8;i++){const seg=GARAGE_ENTRANCE.w/8;parts.push(rounded(seg,.2,.2,.07,i%2?BLACK:YELLOW,doorL+seg*(i+.5),hy,hz,1));}
 for(const x of [doorL+.4,doorR-.4])parts.push(rounded(.06,5.4-hy,.06,.025,BLACK,x,(5.4+hy)/2,hz,1));
 // Ceiling paint (a plane facing down, never a landable canopy) and the strip lights' channels
 const ceil=new T.PlaneGeometry(wid,len);ceil.rotateX(Math.PI/2);ceil.translate(11,G.ceilingY,(G.minZ+G.maxZ)/2);parts.push({g:ceil,color:CEILING});
 const strips:T.BufferGeometry[]=[];
 for(const x of [5.9,21.9])for(let z=-7.5;z<=43.5;z+=4.25){const s=softBox(.26,.07,1.8,1,.03);s.translate(x,G.ceilingY-.06,z);strips.push(s.toNonIndexed());}// over the two aisles
 for(const [x,z] of [[21.9,44.2],[GARAGE_ENTRANCE.x,41.61]])for(const dx of [-.55,.55])parts.push(rounded(.05,.62,.05,.02,BLACK,x+dx,G.ceilingY-.3,z,1));// EXIT sign hangers
 // Cars (the street kit as-is, vertex colours; the wheel / lamp tags are dropped: these never move)
 const cars:T.BufferGeometry[]=[];
 for(const [n,style,paintHex] of CARS){const b=GARAGE_BAYS[n-1],g=buildVehicleGeometry(style,paintHex);g.deleteAttribute('aPart');for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);
  const along=ROWS[b.row].along;g.rotateY(along==='z'?b.nose*Math.PI/2:b.nose>0?0:Math.PI);g.translate(b.x+(along==='z'?b.nose*.25:0),G.floorY,b.z+(along==='x'?b.nose*.25:0));cars.push(g);}
 const body=mergeGeometries([...parts.map(paint),...cars],false)!;
 const bodyMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});o.materials.push(bodyMat);
 const mesh=new T.Mesh(body,bodyMat);mesh.name='parking-garage-body';mesh.receiveShadow=true;root.add(mesh);
 // Floor
 const ft=new T.CanvasTexture(floorTexture(o.doc));ft.colorSpace=T.SRGBColorSpace;ft.anisotropy=4;o.textures.push(ft);
 const floorMat=new T.MeshStandardMaterial({map:ft,roughness:.95});o.materials.push(floorMat);
 const fg=new T.PlaneGeometry(wid,len);fg.rotateX(-Math.PI/2);const floor=new T.Mesh(fg,floorMat);floor.name='parking-garage-floor';floor.position.set(11,G.floorY,(G.minZ+G.maxZ)/2);floor.receiveShadow=true;root.add(floor);
 // Signs: one atlas, emissive at night like every island sign
 const at=new T.CanvasTexture(signAtlas(o.doc));at.colorSpace=T.SRGBColorSpace;o.textures.push(at);
 const signMat=new T.MeshStandardMaterial({map:at,emissiveMap:at,emissive:'#ffe1aa',emissiveIntensity:0,roughness:.9});o.materials.push(signMat);o.nightSigns.push(signMat);
 const sg=mergeGeometries([
  atlasPlane(4.6,1.15,0,.5,1,1,GARAGE_ENTRANCE.x,4.35,46.42,0),// PARKING over the door, street side
  atlasPlane(1.5,.75,0,0,.5,.5,21.9,4.6,44.2,Math.PI),atlasPlane(1.5,.75,0,0,.5,.5,GARAGE_ENTRANCE.x,4.6,41.6,Math.PI),// EXIT, read from inside
  atlasPlane(1.5,.75,0,0,.5,.5,GARAGE_ENTRANCE.x,4.6,41.62,0),// and from the door
  atlasPlane(1.1,.55,.5,0,1,.5,GARAGE_ENTRANCE.x,hy,hz+.11,0),// MAX 2.1 m on the bar
 ])!;
 const signs=new T.Mesh(sg,signMat);signs.name='parking-garage-signs';root.add(signs);
 // Strip lights: soft by day, brighter at night (world.ts night sign pass: userData.nightGlow)
 const stripMat=new T.MeshStandardMaterial({color:'#fff8e6',emissive:'#fff0c8',emissiveIntensity:.45,roughness:.6});stripMat.userData.nightGlow=1.5;o.materials.push(stripMat);o.nightSigns.push(stripMat);
 const lights=new T.Mesh(mergeGeometries(strips,false)!,stripMat);lights.name='parking-garage-lights';root.add(lights);
 for(const m of [mesh,floor,signs,lights])m.castShadow=false;
 const tri=(g:T.BufferGeometry)=>(g.index?g.index.count:g.getAttribute('position').count)/3;
 return {root,triangles:tri(body)+tri(fg)+tri(sg)+tri(lights.geometry),draws:4,stripMaterial:stripMat};
}
