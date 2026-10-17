import * as T from 'three';

/**
 * Ground decals (Oct 17 2026): static, opaque, low-poly detail on the beaches and beside trails/buildings so the lawn and sand are
 * not empty. Built ONCE at load, never animated, no colliders, no transparency, no shadows (they neither cast nor receive).
 * Per island: ONE InstancedMesh per kind (3 draws): stones (pebbles and shells on sand; an octahedron, 8 tris), tufts (5 crossed
 * blades, 5 tris, two-sided) and flowers/clover (a 6-tri shallow hex cone). Per-instance colour, MeshLambertMaterial, no map. The
 * total is capped (DECAL_CAPS, ≤ 1200 per island); the placement is a seeded RNG over fixed data, so every device gets the same spots.
 * A spot inside any obstacle, building, road, path/garden area or pitch (with a margin) is skipped. Cost: 3 extra draw calls per
 * island while it is in view (frustum culled), ≤ 8 tris x 500 + 5 x 450 + 6 x 250 ≈ 7.8k triangles on the main island, no per-frame JS.
 */
export type Pt={x:number;z:number};
export type Rect={x:number;z:number;w:number;d:number};
export type Site={x:number;y:number;z:number;s:number;r:number;c:number};
/** Macro detail (Oct 17 2026, lib/town/macroDetail.ts): bigger features for the open sand and lawn, placed in open regions. Each site carries its own
 *  transform and colour; it is hosted by an existing decal mesh (hex mound, octahedron, tuft) or the one new flat-strip mesh, so it costs +1 draw per island. */
/** User Oct 17 2026 ("undo what you just added for the bare parts of the beach, it looks messy now"): the macro-detail layer is OFF. The code stays for a later, calmer pass. */
export const MACRO_DETAIL_ENABLED=true;
/** Only these macro kinds are kept (user Oct 17 2026: "let's keep the driftwood, rocks and seaweed"); the dunes, ripples, towels, shells and lawn kinds are filtered out. */
export const MACRO_KINDS_KEPT:readonly string[]=['log','rock','weed'];
export type MacroKind='dune'|'ripple'|'log'|'rock'|'weed'|'shell'|'towel'|'tuft'|'flower'|'bare'|'litter';
export type MacroSite={k:MacroKind;x:number;y:number;z:number;r:number;sx:number;sy:number;sz:number;col:string};
export type MacroHost='mounds'|'stones'|'tufts'|'strips';
export const MACRO_HOST:Record<MacroKind,MacroHost>={dune:'mounds',bare:'mounds',litter:'mounds',flower:'mounds',log:'stones',rock:'stones',shell:'stones',tuft:'tufts',ripple:'strips',weed:'strips',towel:'strips'};
export const MACRO_HOST_TRIS:Record<MacroHost,number>={mounds:6,stones:8,tufts:5,strips:2};
export const MACRO_CAP=900;
export type DecalPlan={stones:Site[];tufts:Site[];flowers:Site[];macro:MacroSite[];open?:unknown};
export const DECAL_TRIS={stone:8,tuft:5,flower:6} as const;
export const DECAL_CAPS={
 main:{stones:500,tufts:450,flowers:250},
 cay:{stones:300,tufts:300,flowers:150},
 summit:{stones:250,tufts:300,flowers:150},
} as const;
/** Decals are 1.6x bigger and a notch more contrasty than the first pass (Oct 17 2026), same counts and triangles. */
export const DECAL_SCALE=1.6;
export const STONE_COLORS=['#8a847a','#a89a82','#6c6862','#d9c9ae','#fbf0e0','#e3a898'] as const;
export const TUFT_COLORS=['#5f8d52','#7fae5e','#4a8059','#9fc578'] as const;
export const FLOWER_COLORS=['#fff4dc','#f6d56a','#f0a9b8','#c7b6f0','#4f8a58'] as const;

/** Seeded generator (mulberry32): the same sequence everywhere. */
export function decalRng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

/** A coarse grid of blocked rectangles (centre + size) so each spot test is a handful of comparisons, not a scan of the island. */
export class RectIndex{
 private cells=new Map<number,Rect[]>();private cell=16;
 constructor(rects:Iterable<Rect>,private margin=.5){for(const r of rects)this.add(r);}
 private key(i:number,j:number){return (i+4096)*8192+(j+4096);}
 add(r:Rect){const m=this.margin,c=this.cell,x0=Math.floor((r.x-r.w/2-m)/c),x1=Math.floor((r.x+r.w/2+m)/c),z0=Math.floor((r.z-r.d/2-m)/c),z1=Math.floor((r.z+r.d/2+m)/c);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=this.key(i,j);let l=this.cells.get(k);if(!l){l=[];this.cells.set(k,l);}l.push(r);}}
 blocked(x:number,z:number){const l=this.cells.get(this.key(Math.floor(x/this.cell),Math.floor(z/this.cell)));if(!l)return false;
  for(const r of l)if(Math.abs(x-r.x)<=r.w/2+this.margin&&Math.abs(z-r.z)<=r.d/2+this.margin)return true;return false;}
}
export function insidePoly(poly:Pt[],x:number,z:number){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;}

/** A random point `min..max` m outside a random rectangle's perimeter (for "near trails and buildings"). */
export function edgePoint(rects:Rect[],rng:()=>number,min=.7,max=3.2):Pt|null{
 if(!rects.length)return null;const r=rects[Math.floor(rng()*rects.length)%rects.length],out=min+rng()*(max-min),side=Math.floor(rng()*4),u=(rng()-.5);
 if(side===0)return {x:r.x+u*r.w,z:r.z-r.d/2-out};if(side===1)return {x:r.x+u*r.w,z:r.z+r.d/2+out};
 if(side===2)return {x:r.x-r.w/2-out,z:r.z+u*r.d};return {x:r.x+r.w/2+out,z:r.z+u*r.d};
}
/** A random point in the band of a coastline ring: `t` metres inward of point i (toward `inside`), up to `widthOf(i)`. */
export function ringBandPoint(ring:Pt[],widthOf:(p:Pt,i:number)=>number,inside:Pt,rng:()=>number,minT=.8,wholeBand=false):Pt{
 // wholeBand: the same density per AREA across the whole band, inner beach included (rings picked in proportion to their width, depth uniform).
 const n=ring.length;let i=Math.floor(rng()*n)%n;
 if(wholeBand){let wMax=0;for(let k=0;k<n;k++)wMax=Math.max(wMax,widthOf(ring[k],k));for(let tries=0;tries<12&&rng()*wMax>widthOf(ring[i],i);tries++)i=Math.floor(rng()*n)%n;}
 const p=ring[i],a=ring[(i+n-1)%n],b=ring[(i+1)%n];let nx=b.z-a.z,nz=-(b.x-a.x);const len=Math.hypot(nx,nz)||1;nx/=len;nz/=len;
 if(nx*(inside.x-p.x)+nz*(inside.z-p.z)<0){nx=-nx;nz=-nz;}
 const w=widthOf(p,i),r=rng(),t=minT+(wholeBand?r:r*r)*Math.max(.1,w-minT-.3); // squared: more toward the waterline (the wrack line)
 return {x:p.x+nx*t,z:p.z+nz*t};
}

export type DecalInput={seed:number;caps:{stones:number;tufts:number;flowers:number};
 /** A random candidate on the sand band / beside a trail or building (or null). */sandAt:(rng:()=>number)=>Pt|null;grassAt:(rng:()=>number)=>Pt|null;
 /** Final test per kind: on the right ground and not blocked. */ok:(x:number,z:number,kind:'sand'|'grass')=>boolean;
 /** Ground height at the spot. */y:(x:number,z:number,kind:'sand'|'grass')=>number};
export function planGroundDecals(input:DecalInput):DecalPlan{
 const rng=decalRng(input.seed),plan:DecalPlan={stones:[],tufts:[],flowers:[],macro:[]};
 const fill=(list:Site[],cap:number,kind:'sand'|'grass',make:()=>Omit<Site,'x'|'y'|'z'>)=>{
  // Clumps: a base spot plus up to four neighbours within ~1.3 m (pebble drifts, flower patches, grass clumps), each tested on its own.
  for(let tries=0;list.length<cap&&tries<cap*4;tries++){const base=(kind==='sand'?input.sandAt:input.grassAt)(rng);if(!base)break;const group=1+Math.floor(rng()*5);
   for(let j=0;j<group&&list.length<cap;j++){const p=j?{x:base.x+(rng()-.5)*2.6,z:base.z+(rng()-.5)*2.6}:base,m=make();
    if(!input.ok(p.x,p.z,kind))continue;list.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+input.y(p.x,p.z,kind).toFixed(3),...m});}}};
 // Pebbles are mostly small and grey/tan; about a quarter are pale or pink shells.
 fill(plan.stones,input.caps.stones,'sand',()=>({s:(.08+rng()*rng()*.2)*DECAL_SCALE,r:rng()*6.283,c:Math.floor(rng()*STONE_COLORS.length)}));
 fill(plan.tufts,input.caps.tufts,'grass',()=>({s:(.35+rng()*.35)*DECAL_SCALE,r:rng()*6.283,c:Math.floor(rng()*TUFT_COLORS.length)}));
 fill(plan.flowers,input.caps.flowers,'grass',()=>({s:(.1+rng()*.09)*DECAL_SCALE,r:rng()*6.283,c:Math.floor(rng()*FLOWER_COLORS.length)}));
 return plan;
}

function tuftGeometry(){ // five crossed blades, each one upright triangle (5 tris, 15 vertices)
 const pos:number[]=[];for(let k=0;k<5;k++){const a=k*Math.PI/5,c=Math.cos(a)*.5,s=Math.sin(a)*.5;pos.push(-c,0,-s, c,0,s, c*.1,1,s*.1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const n=g.getAttribute('normal') as T.BufferAttribute;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);return g; // lit like the ground below
}
function flowerGeometry(){ // a shallow six-sided cone (6 tris)
 const pos:number[]=[],nor:number[]=[];for(let k=0;k<6;k++){const a0=k/6*6.283185,a1=(k+1)/6*6.283185;pos.push(0,.35,0,Math.cos(a1),0,Math.sin(a1),Math.cos(a0),0,Math.sin(a0));nor.push(0,1,0,0,1,0,0,1,0);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));return g;
}

function stripGeometry(){ // one flat quad (2 tris), long axis x, facing up
 const g=new T.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);return g;
}

/** Builds the instanced meshes under `parent` (call AFTER the static batching pass: it merges every plain Mesh, instanced ones included).
 *  Macro sites are appended to the mesh of their host kind (so only the flat-strip mesh is new: +1 draw per island, and only when it has sites). */
export function buildGroundDecals(parent:T.Object3D,plan:DecalPlan,name:string){
 const group=new T.Group();group.name=name;const owned:{dispose():void}[]=[];
 type Inst={x:number;y:number;z:number;r:number;sx:number;sy:number;sz:number;col:string};
 const from=(list:Site[],palette:readonly string[],stone:boolean):Inst[]=>list.map(s=>({x:s.x,y:s.y+(stone?s.s*.15:0),z:s.z,r:s.r,sx:s.s,sy:stone?s.s*.45:s.s,sz:stone?s.s*1.3:s.s,col:palette[s.c%palette.length]}));
 const macro=(h:MacroHost):Inst[]=>plan.macro.filter(m=>MACRO_HOST[m.k]===h);
 const make=(label:string,geo:T.BufferGeometry,insts:Inst[],double=false)=>{
  if(!insts.length){geo.dispose();return;}
  const mat=new T.MeshLambertMaterial({color:'#ffffff',side:double?T.DoubleSide:T.FrontSide});owned.push(geo,mat);
  const mesh=new T.InstancedMesh(geo,mat,insts.length),o=new T.Object3D(),col=new T.Color();
  insts.forEach((s,i)=>{o.position.set(s.x,s.y,s.z);o.rotation.set(0,s.r,0);o.scale.set(s.sx,s.sy,s.sz);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,col.set(s.col));});
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  mesh.name=name+'-'+label;mesh.castShadow=false;mesh.receiveShadow=false;mesh.matrixAutoUpdate=false;mesh.computeBoundingSphere();group.add(mesh);};
 make('stones',new T.OctahedronGeometry(1,0),[...from(plan.stones,STONE_COLORS,true),...macro('stones')]);
 make('tufts',tuftGeometry(),[...from(plan.tufts,TUFT_COLORS,false),...macro('tufts')],true);
 make('flowers',flowerGeometry(),[...from(plan.flowers,FLOWER_COLORS,false),...macro('mounds')]);
 make('strips',stripGeometry(),macro('strips'));
 parent.add(group);
 const macroTris=plan.macro.reduce((a,m)=>a+MACRO_HOST_TRIS[MACRO_HOST[m.k]],0);
 return {group,count:plan.stones.length+plan.tufts.length+plan.flowers.length+plan.macro.length,macroCount:plan.macro.length,macroTriangles:macroTris,
  triangles:plan.stones.length*DECAL_TRIS.stone+plan.tufts.length*DECAL_TRIS.tuft+plan.flowers.length*DECAL_TRIS.flower+macroTris,
  dispose(){group.removeFromParent();for(const o of owned)o.dispose();}};
}
