import * as T from 'three';

/**
 * Fishing post kiosks, one look per post (Oct 26 2026, owner: "the fishing posts' little bait/fish kiosks all look identical; make
 * each one look slightly different so they feel hand-placed, while still clearly the same family").
 *
 * The family (never varies): the 1.2 × 1.25 × 0.7 m cabinet with its counter, the cream notice board with the fish emblem, a roof
 * over it and the two leaning rods with their reels. The cabinet is the collision footprint (fishingWorld.ts fishingKioskObstacles),
 * so it is the same box at every post, and nothing solid is added.
 *
 * What varies, seeded by the post id (FNV-1a hash → mulberry32; no runtime randomness, so every load and every player sees the same post):
 * plank wood tone, awning colours + stripe pattern, roof shape and tilt, the counter prop, the ground prop beside the cabinet and its
 * side, what hangs from the eave, a topper (flag, bunting, vane, sign), and props that fit the spot (kioskSetting): a shell garland
 * and conch on the beach, a rope coil and lifebuoy on piers, rocks and a crab pot on rocky shores, mossy stones and reeds by the river.
 *
 * Cost: build-time only. Each part is a transformed copy of a shared low-poly primitive (one cache for the whole module, built once),
 * written straight into ONE vertex-coloured geometry per post; fishingWorld.ts merges every post into its single static mesh, so the
 * draw count is unchanged (one draw + one shadow draw for all posts) and nothing runs per frame. KIOSK_TRI_CAP bounds each post.
 */
export type KioskSetting='beach'|'pier'|'rocks'|'river';
export type KioskVariant={
 id:string;setting:KioskSetting;
 wood:number;awning:number;pattern:'plain'|'stripes'|'wide'|'valance';roof:'flat'|'shed'|'gable';tilt:number;
 counter:'crate'|'bucket'|'jars'|'scale'|'tray';counterSide:-1|1;
 ground:'barrel'|'crates'|'icebox'|'creel'|'none';groundSide:-1|1;
 hang:'net'|'floats'|'fish'|'lantern'|'buoys';topper:'flag'|'bunting'|'vane'|'sign'|'none';
 emblem:number;board:number;
 /** Everything above as one string: two posts with the same signature would look the same. */
 signature:string;
};
/** The cabinet every post shares: it IS the collision footprint (1.2 × 0.7 m, turned 45° in fishingWorld.ts). */
export const KIOSK_CABINET={w:1.2,h:1.25,d:.7} as const;
/** Triangle budget per post (the old identical post was ≈ 240 triangles, ≈ 320 with its rocks). */
export const KIOSK_TRI_CAP=720;

const SETTINGS:Record<string,KioskSetting>={
 'south-pier':'pier','west-pier':'pier','east-pier':'pier','harbour-wall':'pier',
 'north-rocks':'rocks','summit-cove':'rocks','summit-lookout':'rocks','summit-ledge':'rocks',
 'west-cove':'river',
};
/** What the ground around a post is like (unknown ids: beach, the commonest). */
export const kioskSetting=(id:string):KioskSetting=>SETTINGS[id]??'beach';

const WOOD:[string,string][]=[['#a67d55','#7a5a3e'],['#8f6a48','#634631'],['#b8916a','#86654a'],['#8a7a68','#5f5246'],['#9c7550','#6d4f37'],['#c2a07a','#8c6c4f']];
const AWNING:[string,string][]=[['#bd7657','#fff0cf'],['#3f7a9a','#f4efe2'],['#c9a23f','#fff4dc'],['#4f8a6a','#f1ecd8'],['#c45d5d','#fbf6ee'],['#e08a4f','#fde9d0'],['#2f6f78','#e9e0c8'],['#7a6a9e','#f1ebf6']];
const EMBLEM=['#3f7a78','#2f5f86','#c9655a','#6f8fa6','#9b6a3e'];
const BOARD=['#fff0cf','#f3e3c3','#e8efe6','#fbe6d6'];

function hashId(s:string){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
function mulberry(seed:number){let a=seed|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const pick=<V,>(r:()=>number,list:readonly V[])=>list[Math.floor(r()*list.length)%list.length];

/** The post's look, from its id alone (deterministic). */
export function kioskVariant(id:string,setting:KioskSetting=kioskSetting(id)):KioskVariant{
 const r=mulberry(hashId('kiosk:'+id));
 const wood=Math.floor(r()*WOOD.length),awning=Math.floor(r()*AWNING.length);
 const pattern=pick(r,['plain','stripes','wide','valance'] as const),roof=pick(r,['flat','shed','gable'] as const);
 const tilt=Math.round((r()*2-1)*100)/100;
 const counter=pick(r,['crate','bucket','jars','scale','tray'] as const),counterSide=r()<.5?-1:1;
 const ground=pick(r,['barrel','crates','icebox','creel','none'] as const),groundSide=r()<.5?-1:1;
 const hang=pick(r,['net','floats','fish','lantern','buoys'] as const),topper=pick(r,['flag','bunting','vane','sign','none'] as const);
 const emblem=Math.floor(r()*EMBLEM.length),board=Math.floor(r()*BOARD.length);
 const signature=[setting,'w'+wood,'a'+awning,pattern,roof,tilt.toFixed(2),counter+(counterSide<0?'L':'R'),ground+(groundSide<0?'L':'R'),hang,topper,'e'+emblem,'b'+board].join('|');
 return {id,setting,wood,awning,pattern,roof,tilt,counter,counterSide,ground,groundSide,hang,topper,emblem,board,signature};
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

export type KioskPart={prim:Prim;m:T.Matrix4;color:string;tag?:'cabinet'|'ground'|'setting'};
const _q=new T.Quaternion(),_e=new T.Euler(),_p=new T.Vector3(),_s=new T.Vector3();
const mat=(x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(_p.set(x,y,z),_q.setFromEuler(_e.set(rx,ry,rz)),_s.set(sx,sy,sz));
const tint=(hex:string,k:number)=>'#'+new T.Color(hex).multiplyScalar(k).getHexString();

/** The parts of one post in its local frame (counter faces +z, the cabinet centred on the origin, ground at y = 0). */
export function kioskPlan(v:KioskVariant):KioskPart[]{
 const r=mulberry(hashId('props:'+v.id));
 const parts:KioskPart[]=[];
 const add=(p:Prim,color:string,m:T.Matrix4,tag?:KioskPart['tag'])=>{parts.push({prim:p,m,color,tag});};
 const box=(color:string,x:number,y:number,z:number,w:number,h:number,d:number,rx=0,ry=0,rz=0,tag?:KioskPart['tag'])=>add('box',color,mat(x,y,z,rx,ry,rz,w,h,d),tag);
 const [wood,trim]=WOOD[v.wood],[awn,stripe]=AWNING[v.awning],emblem=EMBLEM[v.emblem];
 // The family: cabinet (the footprint), counter top, drawer pull, notice board on its rail, fish emblem, rods and reels.
 box(wood,0,.625,0,KIOSK_CABINET.w,KIOSK_CABINET.h,KIOSK_CABINET.d,0,0,0,'cabinet');
 box(trim,0,1.28,0,1.26,.12,.76);
 box('#e6c477',0,.95,.37,.5,.1,.04);
 box(tint(wood,.82),0,.42,.36,1.1,.05,.02);/* a plank seam across the front */
 box(BOARD[v.board],0,2.02,-.2,1.12,1.3,.08);
 box('#477c6a',0,1.38,-.2,1.22,.1,.12);
 add('ico',emblem,mat(0,2.08,-.14,0,0,0,.26*1.5,.26*.7,.26*.25));
 add('cone3',emblem,mat(.5,2.08,-.14,0,0,-Math.PI/2,.17,.3,.17));
 add('sphere','#fff0cf',mat(-.2,2.14,-.08,0,0,0,.04,.04,.04));
 for(const side of [-1,1]){
  add('cyl5','#6e5540',mat(side*.42,1.95,.36,.28,0,side*.12,.026,2.6,.026));
  add('cyl5','#d6a15d',mat(side*.42,1.05,.46,Math.PI/2,0,0,.07,.08,.07));
 }
 // Roof: a slab (or two for a gable), split into stripes; the eave's front edge sits at ~2.7 m whatever the shape.
 const slab=(cx:number,cy:number,cz:number,rx:number,w:number,d:number)=>{
  const base=mat(cx,cy,cz,rx,0,0);
  const strips=v.pattern==='stripes'?5:v.pattern==='wide'?3:1;
  for(let i=0;i<strips;i++){const sw=w/strips,x=-w/2+sw*(i+.5);
   add('box',i%2?stripe:awn,base.clone().multiply(mat(x,0,0,0,0,0,sw,.11,d)));}
  if(v.pattern==='plain')add('box',stripe,base.clone().multiply(mat(0,-.02,d/2+.015,0,0,0,w,.14,.03)));
  if(v.pattern==='valance')for(let i=0;i<6;i++)add('cone3',i%2?stripe:awn,base.clone().multiply(mat(-w/2+w/6*(i+.5),-.13,d/2,Math.PI,0,0,.12,.16,.03)));
 };
 if(v.roof==='flat')slab(0,2.8,.05,v.tilt*.06,1.4,.9);
 else if(v.roof==='shed')slab(0,2.84,.1,.18+v.tilt*.05,1.46,.98);
 else{const a=.4+v.tilt*.06,h=.29;
  slab(0,3-Math.sin(a)*h,.05+Math.cos(a)*h,a,1.44,.6);slab(0,3-Math.sin(a)*h,.05-Math.cos(a)*h,-a,1.44,.6);
  box(trim,0,3.01,.05,1.5,.07,.07,Math.PI/4);}
 const eave=2.68;
 // Counter prop (on the counter top, left or right of the middle).
 const cx=v.counterSide*.27,top=1.34;
 const fish=(x:number,y:number,z:number,ry:number,col:string,s=1)=>{add('ico',col,mat(x,y,z,0,ry,0,.11*s,.045*s,.04*s));add('cone3',col,mat(x+Math.cos(ry)*.13*s,y,z-Math.sin(ry)*.13*s,0,ry,-Math.PI/2,.05*s,.08*s,.02*s));};
 if(v.counter==='crate'){box(trim,cx,top+.08,0,.34,.16,.26);fish(cx-.05,top+.18,-.04,.2,'#6f8fa6');fish(cx+.04,top+.19,.06,-.3,'#3f7a78');}
 else if(v.counter==='bucket'){add('cyl8',pick(r,['#3f7a9a','#c45d5d','#e0b04f']),mat(cx,top+.11,0,0,0,0,.12,.22,.12));add('ico','#d98a6a',mat(cx,top+.23,0,0,0,0,.07,.04,.07));}
 else if(v.counter==='jars'){for(let i=0;i<3;i++){const x=cx+(i-1)*.12;add('cyl5',['#d9a441','#8fb08a','#e8d9c0'][i],mat(x,top+.07,0,0,0,0,.05,.14,.05));box('#c94f3f',x,top+.155,0,.09,.03,.09);}}
 else if(v.counter==='scale'){box('#4a4f55',cx,top+.02,0,.22,.04,.16);add('cyl5','#b8893a',mat(cx,top+.12,0,0,0,0,.02,.18,.02));add('cyl8','#d6a15d',mat(cx,top+.22,0,0,0,0,.12,.02,.12));fish(cx,top+.25,0,.5,'#9b8a5e',.8);}
 else{box('#e9f2f2',cx,top+.02,0,.42,.04,.28);fish(cx-.08,top+.06,-.06,.1,'#6f8fa6',.9);fish(cx+.08,top+.06,.06,.1,'#c9655a',.9);}
 // Ground prop beside the cabinet (inside ~1.1 m of the centre: tucked against the footprint, never in the walkway to the spot).
 const gx=v.groundSide*.86;
 if(v.ground==='barrel'){add('cyl8',tint(wood,.9),mat(gx,.28,.02,0,0,0,.22,.56,.22),'ground');for(const y of [.12,.44])add('cyl6','#4a4f55',mat(gx,y,.02,0,0,0,.226,.04,.226),'ground');}
 else if(v.ground==='crates'){box(trim,gx,.18,0,.36,.36,.36,0,0,0,'ground');box(wood,gx,.52,0,.32,.32,.32,0,.3,0,'ground');}
 else if(v.ground==='icebox'){box('#eef3f2',gx,.17,.02,.34,.34,.5,0,0,0,'ground');box(pick(r,['#3f7a9a','#c45d5d']),gx,.36,.02,.36,.05,.52,0,0,0,'ground');}
 else if(v.ground==='creel'){add('cyl6','#b99a62',mat(gx,.16,0,0,0,0,.19,.32,.19),'ground');add('cyl6','#8a6e44',mat(gx,.34,0,0,0,0,.2,.04,.2),'ground');}
 // Hanging from the eave (between the rods).
 const hz=.47;
 if(v.hang==='net'){box('#2f4d4a',0,eave-.06,hz,.62,.03,.02);box('#5d7a70',0,eave-.27,hz,.56,.38,.012);for(let i=0;i<3;i++)add('ico','#e0703f',mat(-.2+i*.2,eave-.47,hz,0,0,0,.04,.04,.04));}
 else if(v.hang==='floats'){box('#e9dcc0',0,eave-.04,hz,.6,.012,.012);for(let i=0;i<3;i++){const y=eave-.18-.06*(i%2);add('cone3','#e9dcc0',mat(-.2+i*.2,eave-.1-.03*(i%2),hz,Math.PI,0,0,.012,.14,.012));add('sphere',['#e0513f','#fff3df','#e8c040'][i],mat(-.2+i*.2,y,hz,0,0,0,.06,.06,.06));}}
 else if(v.hang==='fish'){add('cyl5',trim,mat(0,eave-.05,hz,0,0,Math.PI/2,.015,.62,.015));for(let i=0;i<3;i++){const x=-.2+i*.2;add('ico',['#9aa6aa','#8a9aa0','#b0a07a'][i],mat(x,eave-.2,hz,0,0,0,.05,.12,.025));add('cone3','#7d8a8e',mat(x,eave-.36,hz,0,0,Math.PI,.04,.07,.015));}}
 else if(v.hang==='lantern'){const x=v.counterSide*-.18;box('#3a3a3a',x,eave-.06,hz,.01,.12,.01);box('#f2c25c',x,eave-.2,hz,.1,.14,.1);add('cone4','#3a3a3a',mat(x,eave-.1,hz,0,Math.PI/4,0,.09,.07,.09));}
 else{for(let i=0;i<2;i++){const x=-.14+i*.28,len=.1+.08*i;box('#e9dcc0',x,eave-.02-len/2,hz,.008,len,.008);add('cyl8',i?stripe:awn,mat(x,eave-.1-len,hz,0,0,0,.07,.2,.07));}}
 // Topper.
 const roofTop=v.roof==='gable'?3.04:v.roof==='shed'?2.98:2.88;
 if(v.topper==='flag'){const x=-v.groundSide*.56;add('cyl5','#6e5540',mat(x,roofTop+.32,-.25,0,0,0,.02,.7,.02));box(pick(r,[stripe,awn,'#e0513f','#3f7a9a']),x+.17,roofTop+.56,-.25,.32,.2,.015);}
 else if(v.topper==='bunting'){box('#e9dcc0',0,3.12,.68,.86,.01,.01);for(let i=0;i<5;i++)add('cone3',i%2?stripe:['#e0513f','#3f7a9a','#e8c040'][i%3],mat(-.32+i*.16,3.05,.68,Math.PI,0,0,.06,.12,.012));}
 else if(v.topper==='vane'){add('cyl5','#4a4f55',mat(0,roofTop+.2,-.05,0,0,0,.016,.4,.016));fish(0,roofTop+.42,-.05,0,emblem,1.4);}
 else if(v.topper==='sign'){box(trim,0,roofTop+.12,-.1,.74,.2,.04);box(stripe,0,roofTop+.12,-.077,.6,.12,.01);add('ico',emblem,mat(0,roofTop+.12,-.07,0,0,0,.12,.05,.012));}
 // Setting props.
 const opp=-v.groundSide;
 if(v.setting==='beach'){
  for(let i=0;i<7;i++){const t=i/6-.5;add('cone4',['#f4d6c8','#fff3df','#e9b8a0','#f1e1b0'][i%4],mat(t*1.0,1.17-.07*(1-4*t*t),.39,Math.PI,i,0,.05,.07,.03),'setting');}
  add('cone6','#f0c9b0',mat(opp*.5,.08,.62,0,0,Math.PI/2*opp,.09,.22,.09),'setting');
  add('cyl8',pick(r,['#e8c040','#e0703f','#5fa3c0']),mat(opp*.88,.1,-.12,0,0,0,.1,.2,.1),'setting');
 }else if(v.setting==='pier'){
  for(let k=0;k<4;k++)add('arc',k%2?'#fff3df':'#d9483b',mat(opp*.635,.78,0,0,Math.PI/2,k*Math.PI/2,.2,.2,.2),'setting');
  add('torus','#c8b27e',mat(opp*.86,.05,.28,Math.PI/2,0,0,.2,.2,.32),'setting');
  add('cyl6','#4a4f55',mat(v.groundSide*.5,.15,.6,0,0,0,.07,.3,.07),'setting');
 }else if(v.setting==='rocks'){
  for(const [x,z,s] of [[-1.3,.6,.42],[1.5,.2,.5],[-.6,1.4,.3],[1.1,1.3,.36]] as const){const j=.85+r()*.3,rad=s*j;
   add('ico',pick(r,['#a39a88','#968e80','#b0a796']),mat(x+(r()-.5)*.2,rad*.35,z+(r()-.5)*.2,0,x+r(),0,rad,rad*.62,rad),'setting');}
  box('#5d4a3a',opp*.85,.16,.2,.34,.3,.3,0,.4,0,'setting');box('#c9a56a',opp*.85,.32,.2,.36,.03,.32,0,.4,0,'setting');
 }else{
  for(const [x,z,s] of [[-1.3,.6,.4],[1.45,.3,.46],[-.7,1.35,.3]] as const){const rad=s*(.85+r()*.3);
   add('ico','#8e9184',mat(x,rad*.35,z,0,x,0,rad,rad*.6,rad),'setting');add('cone6','#5f8a4a',mat(x,rad*.9,z,0,x+1,0,rad*.72,rad*.22,rad*.72),'setting');}
  for(let i=0;i<3;i++)add('cone4','#6f9a52',mat(opp*.9+(i-1)*.1,.3+.06*i,.45+(i%2)*.08,0,i,(i-1)*.12,.035,.6+.12*i,.035),'setting');
 }
 return parts;
}

/** Triangles a plan draws (for the cost caps). */
export const kioskTriangles=(parts:readonly KioskPart[])=>parts.reduce((n,p)=>n+prim(p.prim).getAttribute('position').count/3,0);

const _n=new T.Matrix3(),_w=new T.Matrix4(),_m=new T.Matrix4(),_v=new T.Vector3(),_c=new T.Color();
/**
 * One post as ONE non-indexed, vertex-coloured geometry (position, normal, color) placed at (x, z) and turned `yaw`: the shared
 * primitives are transformed straight into three typed arrays (no per-part geometry, nothing to dispose but the result).
 */
export function buildKioskGeometry(v:KioskVariant,x:number,z:number,yaw=Math.PI/4):T.BufferGeometry{
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
