import * as T from 'three';

/**
 * Fishing post stalls: a kit of seven stall types (Nov 10 2026, owner: "all of them are the same. give them variety in shape and
 * styles"). Before this pass every post was the same 1.2 × 1.25 × 0.7 m cabinet with the same notice board, roof slab and rods;
 * only colours, the roof tilt and small props varied (Oct 26 2026), so at the island camera's distance they all read as one model.
 *
 * Now each post is one of seven types with its own silhouette, height, footprint, roof and props, picked per spot to suit the place
 * (STALL_BY_SPOT) so that no two neighbouring spots share a type:
 *   shack       weathered plank shack, pitched plank roof, rod rack, lifebuoy           2.0 × 1.5 m, 3.0 m ridge
 *   cart        beach cart on two big wheels with a striped canopy and handles          1.8 × 0.9 m, 2.4 m (pennant 2.9)
 *   tiki        thatched tiki hut on bamboo posts, two-tier straw roof, torch           2.3 × 2.3 m roof, 3.5 m
 *   lighthouse  keeper's lean-to against a striped mini lighthouse, buoy stack          2.3 × 1.3 m, 3.65 m lamp
 *   rowboat     rowboat turned on its side as the counter, oars, a mast with the sign   2.5 × 0.5 m hull, 3.4 m mast
 *   booth       tall harbour-master booth: window band, hipped roof, flag, tide board   1.4 × 1.4 m, 3.0 m (flag 4.35)
 *   market      trestle table under a round parasol, crates, fish on ice               2.6 × 0.9 m, 2.6 m
 * The one cue every type keeps: the cream fish sign (teal rim, fish emblem) and a pair of rods, so each stall still reads as
 * "you can fish here".
 *
 * Cost, unchanged in kind from Oct 26: build-time only. Each part is a transformed copy of one of ≤ 11 shared low-poly primitives,
 * written straight into ONE vertex-coloured geometry per post; fishingWorld.ts merges every post into its single static mesh
 * ('fishing-posts': one draw + one shadow draw, no new material, texture, light or animation). KIOSK_TRI_CAP bounds each post.
 * Colliders: each type's solid footprint is 1-3 circles (STALL_TYPES.solids) turned with the stall, pushed into world.obstacles by
 * Town.tsx through fishingKioskObstacles (tests/fishing-stall-styles.cjs keeps them off the standing spot, the cast and the sea).
 */
export type StallType='shack'|'cart'|'tiki'|'lighthouse'|'rowboat'|'booth'|'market';
type Circle=readonly [x:number,z:number,r:number];
export type StallSpec={label:string;yaw:number;solids:readonly Circle[];glow:{w:number;d:number;h:number};top:number};
/** The kit. Local frame: counter/front faces +z, ground at y = 0, the stall centred on the kiosk point. `yaw` turns it in the world
 *  (π/4 faces the island camera, which looks from the south-east). `top` is the main mass's height (thin poles and flags excluded). */
export const STALL_TYPES:Record<StallType,StallSpec>={
 shack:{label:'weathered pier shack',yaw:.5,solids:[[-.48,0,.74],[.5,0,.74]],glow:{w:2.1,d:1.6,h:3},top:3},
 cart:{label:'striped beach cart',yaw:1,solids:[[-.38,0,.46],[.42,0,.46]],glow:{w:1.9,d:1.2,h:2.45},top:2.45},
 tiki:{label:'thatched tiki hut',yaw:Math.PI/4,solids:[[-.42,.05,.68],[.42,.05,.68]],glow:{w:2.2,d:2.2,h:3.45},top:3.45},
 lighthouse:{label:"lighthouse keeper's lean-to",yaw:.6,solids:[[.55,-.1,.55],[-.45,.05,.6],[1.02,.42,.26]],glow:{w:2.3,d:1.4,h:3.65},top:3.65},
 rowboat:{label:'rowboat counter with a mast sign',yaw:.3,solids:[[-.8,0,.34],[0,0,.36],[.78,0,.34]],glow:{w:2.5,d:.7,h:1.2},top:1.2},
 booth:{label:"harbour-master's booth",yaw:Math.PI/4,solids:[[0,0,.8]],glow:{w:1.45,d:1.45,h:3},top:3},
 market:{label:'market table with a parasol',yaw:.8,solids:[[-.45,0,.46],[.4,0,.46],[1.15,-.1,.32]],glow:{w:2.6,d:1,h:2.6},top:2.6},
};
export const STALL_TYPE_IDS=Object.keys(STALL_TYPES) as StallType[];
/** Which stall stands at which post, chosen for the place; the two nearest posts (and any within 150 m) never share a type. */
export const STALL_BY_SPOT:Readonly<Record<string,StallType>>={
 'south-pier':'shack','west-pier':'lighthouse','harbour-wall':'booth','north-rocks':'rowboat','west-cove':'market','east-pier':'cart',
 'causeway-gate':'cart','causeway-channel':'lighthouse','turtle-bank':'rowboat',
 'coral-garden':'tiki','sharks-beach':'booth','farm-beach':'market',
 'summit-cove':'cart','summit-palm':'tiki','summit-lookout':'lighthouse','summit-ledge':'shack',
 'park-pond':'rowboat',
 // Nov 13 2026: the north-west coast (a harbour-master's booth on the rocky point, a weathered shack on the rocks, a tiki hut on the sunset sand).
 'north-point':'booth','stadium-rocks':'shack','sunset-shoals':'tiki',
};
/** Per-spot turn where a type's default yaw would bring its colliders within 0.85 m of the standing spot (radians). */
const YAW_BY_SPOT:Readonly<Record<string,number>>={'west-pier':1.25,'farm-beach':1.4,'summit-ledge':-.35};

function hashId(s:string){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
export const stallType=(id:string):StallType=>STALL_BY_SPOT[id]??STALL_TYPE_IDS[hashId(id)%STALL_TYPE_IDS.length];
export const stallYaw=(id:string)=>YAW_BY_SPOT[id]??STALL_TYPES[stallType(id)].yaw;

/** How far the stall stands from the standing spot, square to the cast (the rule since Sep 30 2026). */
export const KIOSK_OFFSET=2.1;
type SpotLike={x:number;z:number;buoy:{x:number;z:number};boat?:{prompt:{x:number;z:number}}};
/** Where a fishing post's stall stands: beside the standing spot, square to the cast (boats: over the rod holders). */
export function kioskAt(s:SpotLike){if(s.boat)return {x:s.boat.prompt.x,z:s.boat.prompt.z};const dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz)||1;return {x:s.x+(-dz/l)*KIOSK_OFFSET,z:s.z+(dx/l)*KIOSK_OFFSET};}
/** A local stall point (x right, z front) in the world, for a stall at k turned `yaw` (same rotation as buildKioskGeometry). */
export const stallToWorld=(k:{x:number;z:number},yaw:number,x:number,z:number)=>({x:k.x+x*Math.cos(yaw)+z*Math.sin(yaw),z:k.z-x*Math.sin(yaw)+z*Math.cos(yaw)});
/** The solid footprint as round colliders ({x,z,w,d,cornerRadius} like trunkCollider), turned with the stall. */
export function stallColliders(s:SpotLike&{id:string}){
 const k=kioskAt(s),yaw=stallYaw(s.id);
 return STALL_TYPES[stallType(s.id)].solids.map(([x,z,r])=>{const p=stallToWorld(k,yaw,x,z);return {x:p.x,z:p.z,w:2*r,d:2*r,cornerRadius:r};});
}

export type KioskVariant={id:string;type:StallType;yaw:number;palette:number;emblem:number;board:number;
 /** Everything above as one string: two posts with the same signature would look the same. */
 signature:string};
/** Triangle budget per post (the old identical post was ≈ 240 triangles; the Oct 26 variants ≈ 600). */
export const KIOSK_TRI_CAP=720;

const EMBLEM=['#3f7a78','#2f5f86','#c9655a','#6f8fa6','#9b6a3e'];
const BOARD=['#fff0cf','#f3e3c3','#e8efe6','#fbe6d6'];
/** Two or three palettes per type; the n-th post of a type (STALL_BY_SPOT order) takes the n-th, so two posts of one type differ. */
const PALETTES:Record<StallType,readonly (readonly string[])[]>={
 // wall, trim/dark, roof, roof stripe, accent
 shack:[['#a08c74','#5f5246','#6b5646','#836b56','#c45d5d'],['#7f908a','#4f5a55','#6b4f3a','#80634b','#e0b04f'],/* Nov 13 2026: Stadium Rocks' kelp green */['#6f7f6a','#3f4a40','#4f5f4a','#6a7a5e','#e8c040']],
 // body, trim, canopy, canopy stripe, accent
 cart:[['#3f8fb0','#fbf6ee','#e0513f','#fff3df','#e8c040'],['#f0b43f','#fbf6ee','#2f8f8a','#f4efe2','#e0513f'],['#e0513f','#fbf6ee','#3f8fb0','#fbf6ee','#e8c040']],
 // bamboo, dark bamboo, straw, dark straw, accent
 tiki:[['#c9a66b','#8c6c4f','#d9b56a','#b08a4a','#e0703f'],['#b8955c','#7a5a3e','#cfae6e','#a3823f','#d9483b'],/* Nov 13 2026: Sunset Shoals' sunset orange */['#c99a5c','#8a5f3e','#e0b26a','#c0803f','#f08a3c']],
 // band red, band white, roof, roof stripe, accent
 lighthouse:[['#d9483b','#f4efe2','#2f4f6f','#f4efe2','#e8c040'],['#2f6f9a','#f4efe2','#c94f3f','#f4efe2','#e0703f'],['#3f8a5a','#f4efe2','#2f4f6f','#f4efe2','#e0513f']],
 // hull, stripe, boot-top, wood, accent
 rowboat:[['#2f6f9a','#fbf6ee','#d9483b','#a67d55','#e8c040'],['#4f8a6a','#fbf6ee','#c9a23f','#9c7550','#e0513f'],/* Nov 13 2026: the park pond's boat-hire green */['#3f6f45','#f4efe2','#e8c040','#8c6a48','#d9483b']],
 // lower walls, frame, roof, flag, accent
 booth:[['#2f4f6f','#f4efe2','#c94f3f','#e8c040','#d9483b'],['#3f7a78','#fbf6ee','#2f4f6f','#e0513f','#e8c040'],/* Nov 13 2026: North Point's slate and red */['#5a6470','#f4efe2','#d9483b','#e8c040','#2f4f6f']],
 // wood, cloth A, cloth B, parasol, parasol trim
 market:[['#a67d55','#e0513f','#fff3df','#3f8fb0','#fbf6ee'],['#8f6a48','#4f8a6a','#f1ecd8','#e08a4f','#fde9d0']],
};

/** The post's look, from its id alone (deterministic: no runtime randomness, every load and every player sees the same stall). */
export function kioskVariant(id:string):KioskVariant{
 const type=stallType(id),yaw=stallYaw(id),h=hashId('kiosk:'+id),nth=Object.keys(STALL_BY_SPOT).filter(k=>STALL_BY_SPOT[k]===type).indexOf(id);
 const palette=(nth<0?h:nth)%PALETTES[type].length,emblem=(h>>>3)%EMBLEM.length,board=(h>>>7)%BOARD.length;
 return {id,type,yaw,palette,emblem,board,signature:[type,yaw.toFixed(2),'p'+palette,'e'+emblem,'b'+board].join('|')};
}

// ---- Shared primitives: built once per module, non-indexed, position + normal only (colour is written per post).
type Prim='box'|'cyl5'|'cyl8'|'cyl6'|'sphere'|'ico'|'cone3'|'cone4'|'cone6'|'torus'|'arc';
const PRIM_CACHE=new Map<Prim,T.BufferGeometry>();
function prim(k:Prim):T.BufferGeometry{
 let g=PRIM_CACHE.get(k);if(g)return g;
 const src=k==='box'?new T.BoxGeometry(1,1,1):k==='cyl5'?new T.CylinderGeometry(1,1,1,5):k==='cyl8'?new T.CylinderGeometry(1,1,1,8):k==='cyl6'?new T.CylinderGeometry(1,1,1,6)
  :k==='sphere'?new T.SphereGeometry(1,6,3):k==='ico'?new T.IcosahedronGeometry(1,0):k==='cone3'?new T.ConeGeometry(1,1,3):k==='cone4'?new T.ConeGeometry(1,1,4):k==='cone6'?new T.ConeGeometry(1,1,6)
  :k==='torus'?new T.TorusGeometry(1,.28,3,8):new T.TorusGeometry(1,.22,3,2,Math.PI/2);
 g=src.index?src.toNonIndexed():src;if(g!==src)src.dispose();g.deleteAttribute('uv');PRIM_CACHE.set(k,g);return g;
}
/** How many shared primitives exist (the cache is per module, not per post). */
export const kioskPrimitiveCount=()=>PRIM_CACHE.size;
export const kioskPrimitive=(k:Prim)=>prim(k);

export type KioskPart={prim:Prim;m:T.Matrix4;color:string;tag?:'sign'|'rod'};
const _q=new T.Quaternion(),_e=new T.Euler(),_p=new T.Vector3(),_s=new T.Vector3();
const mat=(x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(_p.set(x,y,z),_q.setFromEuler(_e.set(rx,ry,rz)),_s.set(sx,sy,sz));
const tint=(hex:string,k:number)=>'#'+new T.Color(hex).multiplyScalar(k).getHexString();

/** The parts of one stall in its local frame (front faces +z, centred on the origin, ground at y = 0). */
export function kioskPlan(v:KioskVariant):KioskPart[]{
 const parts:KioskPart[]=[];let tag:KioskPart['tag'];
 const add=(p:Prim,color:string,m:T.Matrix4)=>{parts.push({prim:p,m,color,tag});};
 const box=(c:string,x:number,y:number,z:number,w:number,h:number,d:number,rx=0,ry=0,rz=0)=>add('box',c,mat(x,y,z,rx,ry,rz,w,h,d));
 /** A cylinder / cone of radius r and height h centred at (x, y, z). */
 const cyl=(k:Prim,c:string,x:number,y:number,z:number,r:number,h:number,rx=0,ry=0,rz=0)=>add(k,c,mat(x,y,z,rx,ry,rz,r,h,r));
 const P=PALETTES[v.type][v.palette],emblem=EMBLEM[v.emblem],board=BOARD[v.board];
 const fish=(x:number,y:number,z:number,ry:number,col:string,s=1)=>{add('ico',col,mat(x,y,z,0,ry,0,.11*s,.045*s,.04*s));add('cone3',col,mat(x+Math.cos(ry)*.13*s,y,z-Math.sin(ry)*.13*s,0,ry,-Math.PI/2,.05*s,.08*s,.02*s));};
 /** The shared cue: the cream fish sign (teal rim, fish emblem with tail and eye), facing +z, centred at (x, y, z). */
 const sign=(x:number,y:number,z:number,s=1)=>{tag='sign';
  box('#2f5f58',x,y,z-.02*s,.98*s,.6*s,.04*s);box(board,x,y,z+.01*s,.88*s,.5*s,.03*s);
  add('ico',emblem,mat(x-.06*s,y,z+.04*s,0,0,0,.25*s,.12*s,.03*s));add('cone3',emblem,mat(x+.26*s,y,z+.04*s,0,0,-Math.PI/2,.11*s,.16*s,.03*s));
  add('sphere','#fff0cf',mat(x-.2*s,y+.03*s,z+.07*s,0,0,0,.03*s,.03*s,.03*s));tag=undefined;};
 /** The shared rods: two rods leaning out from a base at (x, z), tipping toward `lean` (+1 right, -1 left), with one reel each. */
 const rods=(x:number,z:number,lean:number,base=0)=>{tag='rod';
  for(const k of [-1,1]){const zz=z+k*.09;add('cyl5','#6e5540',mat(x+lean*.22,base+1.2,zz,k*.06,0,-lean*.18,.022,2.4,.022));add('cyl5','#d6a15d',mat(x+lean*.05,base+.5,zz+.06,Math.PI/2,0,0,.06,.07,.06));}
  tag=undefined;};
 if(v.type==='shack'){
  const [wall,dark,roof,roofB,accent]=P,seam=tint(wall,.78);
  box(dark,0,.06,0,2.1,.12,1.6);
  box(wall,0,1.17,-.66,1.9,2.1,.08);for(const sx of [-1,1])box(wall,sx*.91,1.17,0,.08,2.1,1.4);
  box(wall,0,.62,.66,1.9,1,.08);box(dark,0,1.14,.76,2,.06,.38);box(wall,0,2.05,.66,1.9,.34,.08);
  for(const sx of [-1,1])for(const y of [.5,1,1.55])box(seam,sx*.956,y,0,.012,.05,1.4);
  for(const y of [.36,.8])box(seam,0,y,.705,1.9,.05,.012);
  box(wall,0,2.22,0,1.84,1.03,1.03,Math.PI/4);/* the gable ends */
  const a=.62;for(const sz of [-1,1])for(let i=0;i<4;i++)box(i%2?roofB:roof,-.86+i*.573,2.6,sz*.5,.573,.09,1.26,sz*a);
  box(dark,0,2.97,0,2.4,.08,.08);
  sign(0,2.02,.74,.9);
  box(dark,1.12,.8,-.38,.06,1.6,.06);box(dark,1.12,.8,.38,.06,1.6,.06);box(dark,1.12,1.45,0,.06,.06,.84);/* rod rack */
  for(let i=0;i<3;i++)add('cyl5',['#6e5540','#4a4f55','#8a5a3a'][i],mat(1.14,1.3,-.25+i*.25,0,0,-.08,.02,2.5,.02));
  add('torus',accent,mat(-.97,1.45,.1,0,Math.PI/2,0,.24,.24,.24));
  cyl('cyl8','#4a4f55',.62,.18,1.02,.14,.34);fish(.6,.38,1.02,.4,'#6f8fa6',.8);
  box('#3a3a3a',-.86,1.85,.84,.01,.2,.01);box('#f2c25c',-.86,1.68,.84,.12,.16,.12);
  rods(-.62,.9,-1);
 }else if(v.type==='cart'){
  const [body,trim,canopy,stripe,accent]=P;
  box(body,0,.86,0,1.3,.7,.72);box(trim,0,1.24,0,1.38,.07,.8);box(tint(body,.8),0,.52,0,1.34,.06,.76);
  sign(-.22,.92,.38,.82);
  for(const sz of [-1,1]){cyl('cyl8','#3a3a3a',.4,.38,sz*.43,.38,.07,Math.PI/2);cyl('cyl6',accent,.4,.38,sz*.475,.1,.04,Math.PI/2);}
  box('#4a4f55',-.52,.26,0,.06,.52,.5);
  for(const sz of [-1,1])add('cyl5',trim,mat(.85,1.02,sz*.26,0,0,Math.PI/2+.12,.025,.5,.025));
  add('cyl5','#3a3a3a',mat(1.1,1.05,0,Math.PI/2,0,0,.03,.6,.03));
  for(const [px,pz] of [[-.6,-.33],[.6,-.33],[-.6,.33],[.6,.33]])add('cyl5',trim,mat(px,1.77,pz,0,0,0,.022,1.06,.022));
  for(let i=0;i<5;i++)box(i%2?stripe:canopy,-.72+i*.36,2.33,0,.36,.07,1.16,.07);
  for(let i=0;i<5;i++)add('cone3',i%2?stripe:canopy,mat(-.72+i*.36,2.2,.6,Math.PI,0,0,.12,.2,.03));
  add('cyl5','#4a4f55',mat(0,2.6,0,0,0,0,.015,.5,.015));box(accent,.15,2.77,0,.28,.16,.012);
  box('#eef3f2',.32,1.45,-.05,.5,.36,.42);box(canopy,.32,1.66,-.05,.52,.06,.44);
  box('#e9f2f2',-.32,1.3,.1,.42,.04,.3);fish(-.4,1.34,.05,.1,'#6f8fa6',.9);fish(-.24,1.34,.16,.1,'#c9655a',.9);
  rods(-.7,0,-1,.35);
 }else if(v.type==='tiki'){
  const [bamboo,dark,straw,strawB,accent]=P;
  for(const [px,pz] of [[-.72,-.55],[.72,-.55],[-.72,.55],[.72,.55]])cyl('cyl5',bamboo,px,1.05,pz,.07,2.1);
  box(dark,0,.55,.56,1.6,1.1,.3);for(const x of [-.5,0,.5])box(bamboo,x,.55,.715,.12,1.1,.02);
  box(tint(dark,.85),0,1.13,.6,1.8,.07,.46);
  cyl('cone4',strawB,0,2.18,0,1.72,.42,0,Math.PI/4);
  cyl('cone4',straw,0,2.78,0,1.42,1.3,0,Math.PI/4);
  cyl('cone4',strawB,0,3.4,0,.3,.22,0,Math.PI/4);add('sphere',dark,mat(0,3.5,0,0,0,0,.07,.07,.07));
  for(let i=0;i<7;i++)add('cone3',i%2?strawB:straw,mat(-1.05+i*.35,1.9,1.2,Math.PI,0,0,.1,.22,.03));
  for(const sx of [-1,1])for(let i=0;i<3;i++)add('cone3',i%2?strawB:straw,mat(sx*1.2,1.9,-.7+i*.7,Math.PI,Math.PI/2,0,.1,.22,.03));
  for(let i=0;i<3;i++)add('cone3','#4f8a4a',mat(Math.cos(i*2.1)*.35,3.38,Math.sin(i*2.1)*.35,Math.PI/2.4,-i*2.1+Math.PI/2,0,.14,.7,.02));
  cyl('cyl5',dark,.95,.85,.95,.04,1.7);cyl('cone4',accent,.95,1.82,.95,.08,.24);cyl('cone4','#f7d36b',.95,1.78,.95,.05,.14);
  for(const x of [-.55,-.36])add('sphere','#6b4a2e',mat(x,1.23,.6,0,0,0,.09,.09,.09));
  box('#e9dcc0',-.38,1.86,1.02,.01,.18,.01);box('#e9dcc0',.38,1.86,1.02,.01,.18,.01);
  sign(0,1.55,1.02,.85);
  rods(-.95,-.1,-1);
 }else if(v.type==='lighthouse'){
  const [band,white,roof,roofB,accent]=P,tx=.55,tz=-.1;
  for(let i=0;i<4;i++){const r=.5-.035*i;cyl('cyl8',i%2?white:band,tx,.36+.7*i,tz,r,.72);}
  cyl('cyl8','#3a3a3a',tx,2.86,tz,.48,.08);cyl('cyl6','#f7d36b',tx,3.1,tz,.28,.42);cyl('cone6',band,tx,3.46,tz,.38,.34);
  add('sphere','#3a3a3a',mat(tx,3.66,tz,0,0,0,.05,.05,.05));
  for(const pz of [-.48,.52])cyl('cyl5',tint(roof,1.15),-1.0,.95,pz,.05,1.9);
  for(let i=0;i<3;i++)box(i%2?roofB:roof,-.4,2.08,-.5+i*.5,1.42,.07,.5,0,0,.36);
  box('#a67d55',-.45,.5,.28,1,1,.5);box(tint('#a67d55',.75),-.45,1.03,.32,1.08,.06,.58);
  sign(-.45,1.58,.62,.82);
  for(let i=0;i<3;i++)cyl('cyl8',[accent,white,band][i],1.02,.16+.32*i,.42,.21-.02*i,.3);cyl('cone6',band,1.02,1.08,.42,.16,.2);
  add('torus',band,mat(tx+.08,1.2,tz+.5,-.25,.25,0,.22,.22,.22));
  box('#4a4f55',-.15,.16,.45,.34,.3,.3,0,.4,0);
  rods(-.95,.1,-1);
 }else if(v.type==='rowboat'){
  const [hull,stripe,boot,wood,accent]=P;
  box(hull,-.25,.48,0,1.7,.86,.42);box(stripe,-.25,.78,.215,1.7,.12,.01);box(boot,-.25,.13,.215,1.7,.16,.01);
  add('cone4',hull,mat(.88,.48,0,0,0,-Math.PI/2,.43,.56,.21));
  box(tint(hull,.8),-1.12,.48,0,.08,.88,.44,0,0,.12);
  box(wood,-.2,.94,.02,2.1,.06,.5);box(tint(wood,.8),-.2,.9,.27,2.1,.04,.03);
  box('#e9f2f2',.1,1,.05,.6,.04,.34);fish(.02,1.04,0,.1,'#6f8fa6',.9);fish(.18,1.04,.1,.1,'#c9655a',.9);
  cyl('cyl8',accent,-.65,1.08,0,.12,.24);
  add('cone6','#4f6f5a',mat(.75,.98,.05,0,0,-.3,.3,.12,.26));
  const mx=-.45,mz=-.12;
  cyl('cyl5',tint(wood,.85),mx,1.7,mz,.045,3.4);cyl('cyl5',tint(wood,.85),mx,2.95,mz,.03,1.2,0,0,Math.PI/2);
  box('#e9dcc0',mx-.4,2.75,mz,.01,.4,.01);box('#e9dcc0',mx+.4,2.75,mz,.01,.4,.01);
  sign(mx,2.32,mz+.05,.9);
  add('cone3',boot,mat(mx+.2,3.32,mz,0,0,-Math.PI/2,.08,.4,.01));
  for(const k of [-1,1]){add('cyl5',tint(wood,1.1),mat(-1.32,1,k*.15,k*.12,0,.18,.025,2,.025));box(tint(wood,1.1),-1.5,.12,k*.2,.12,.42,.03,k*.12,0,.18);}
  rods(.85,-.1,1,.12);
 }else if(v.type==='booth'){
  const [lower,frame,roof,flag,accent]=P;
  box('#b8b0a0',0,.08,0,1.42,.16,1.42);
  box(lower,0,.66,0,1.15,1,1.15);box('#bfe3ee',0,1.62,0,1.05,.92,1.05);
  for(const [px,pz] of [[-.55,-.55],[.55,-.55],[-.55,.55],[.55,.55]])box(frame,px,1.62,pz,.1,.92,.1);
  box(frame,0,1.14,0,1.2,.06,1.2);box(lower,0,2.17,0,1.17,.2,1.17);box(frame,0,2.29,0,1.38,.05,1.38);
  cyl('cone4',roof,0,2.64,0,.98,.7,0,Math.PI/4);
  cyl('cyl5','#4a4f55',0,3.66,0,.025,1.4);box(flag,.27,4.12,0,.5,.32,.015);box(accent,.27,4.04,.01,.5,.08,.012);
  box('#f4efe2',.8,1.35,.42,.26,2.1,.04);for(let i=0;i<6;i++)box(i%2?'#2f4f6f':'#d9483b',.74,.55+i*.3,.445,.12,.04,.012);
  box('#4a4f55',.8,1.2,.38,.05,2.4,.05);
  sign(0,.72,.6,.82);
  add('torus',accent,mat(-.6,1.5,0,0,Math.PI/2,0,.22,.22,.22));
  rods(-.75,.6,-1);
 }else{
  const [wood,clothA,clothB,parasol,trim]=P;
  box(wood,0,.86,0,1.7,.07,.8);for(const [px,pz] of [[-.78,-.33],[.78,-.33],[-.78,.33],[.78,.33]])box(tint(wood,.8),px,.41,pz,.06,.82,.06);
  for(let i=0;i<4;i++)box(i%2?clothB:clothA,-.6375+i*.425,.66,.41,.425,.34,.01);
  box('#e9f2f2',-.3,.93,.05,.8,.06,.55);fish(-.5,.98,-.05,.2,'#6f8fa6');fish(-.25,.98,.12,-.2,'#3f7a78');fish(-.08,.98,-.05,.1,'#c9655a');
  cyl('cyl8','#4a4f55',.45,.97,.1,.12,.16);fish(.42,1.08,.1,.4,'#9b8a5e',.8);
  box(tint(wood,1.1),1.15,.22,-.1,.46,.44,.46);box(tint(wood,.85),1.15,.62,-.1,.42,.36,.42,0,.3,0);
  for(const y of [.12,.32])box(tint(wood,.7),1.15,y,.135,.46,.04,.01);
  cyl('cyl5','#4a4f55',-.1,1.3,-.28,.03,2.6);
  cyl('cone6',parasol,-.1,2.38,-.28,1.3,.5);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;add('cone3',i%2?trim:parasol,mat(-.1+Math.sin(a)*1.13,2.06,-.28+Math.cos(a)*1.13,Math.PI,a,0,.16,.18,.03));}
  add('sphere',trim,mat(-.1,2.66,-.28,0,0,0,.06,.06,.06));
  sign(-.1,1.5,-.24,.82);
  rods(-.95,-.1,-1);
 }
 return parts;
}

/** Triangles a plan draws (for the cost caps). */
export const kioskTriangles=(parts:readonly KioskPart[])=>parts.reduce((n,p)=>n+prim(p.prim).getAttribute('position').count/3,0);

const _n=new T.Matrix3(),_w=new T.Matrix4(),_m=new T.Matrix4(),_v=new T.Vector3(),_c=new T.Color();
/**
 * One stall as ONE non-indexed, vertex-coloured geometry (position, normal, color) placed at (x, z) and turned `yaw`: the shared
 * primitives are transformed straight into three typed arrays (no per-part geometry, nothing to dispose but the result).
 */
export function buildKioskGeometry(v:KioskVariant,x:number,z:number,yaw=v.yaw):T.BufferGeometry{
 const parts=kioskPlan(v);let count=0;for(const p of parts)count+=prim(p.prim).getAttribute('position').count;
 const pos=new Float32Array(count*3),nor=new Float32Array(count*3),col=new Float32Array(count*3);
 _w.makeRotationY(yaw).setPosition(x,0,z);let o=0;
 for(const p of parts){
  const g=prim(p.prim),ps=g.getAttribute('position'),ns=g.getAttribute('normal');_m.multiplyMatrices(_w,p.m);_n.getNormalMatrix(_m);_c.set(p.color);
  for(let i=0;i<ps.count;i++,o+=3){
   _v.fromBufferAttribute(ps,i).applyMatrix4(_m);pos[o]=_v.x;pos[o+1]=_v.y;pos[o+2]=_v.z;
   _v.fromBufferAttribute(ns,i).applyMatrix3(_n).normalize();nor[o]=_v.x;nor[o+1]=_v.y;nor[o+2]=_v.z;
   col[o]=_c.r;col[o+1]=_c.g;col[o+2]=_c.b;
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));
 return geo;
}
