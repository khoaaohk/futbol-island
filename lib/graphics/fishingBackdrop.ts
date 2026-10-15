import * as T from 'three';

/**
 * Fishing backdrop (Oct 15 2026, user: "the background while fishing is not rendering fully. we need it to render but, not detailed"
 * and "save on heat"). See lib/graphics/focusMode.ts for when it is used.
 *
 * The old focus mode hid static island chunks by distance, one material batch at a time. A 50 m chunk is split by material, so a
 * building's walls, roof, windows and the lamp beside it sit in different batches with different bounds: the cut kept some and hid
 * others, leaving half-built buildings, lone lamp posts and floating roofs and signs.
 *
 * The backdrop is a low-detail copy of every static chunk, built once (in slices, the first time a fishing shot needs it) from the
 * merged chunk buffers already in memory:
 * - one vertex colour per source piece (material colour × paint colour, or a texture's average colour), byte-packed normals,
 *   no UVs, no textures: one small shader with the Lambert sun + sky terms only (boxes shaded flat), no shadows cast or received;
 * - small props are dropped as a whole category (every lamp, pole, signal, flag, sign, bench, table, planter, fence, net, post, bike,
 *   crate, bollard, lifebuoy, and any untagged piece under SMALL_PIECE m: windows, sills, tiny props): nothing is half-drawn; trees,
 *   palms and goals stay, small rounded ones (palm trunk rings, canopy blobs) as their 12-triangle bounding box;
 * - cells past COARSE_FROM_M draw a coarse subset (pieces of COARSE_PIECE m or more + every tree, palm and goal): the skyline;
 * - one mesh per island region (main island, East Jetty, causeway + Coral Cay, Summit Isle) sharing ONE vertex buffer, so the
 *   whole skyline is at most four draws, each frustum-culled against the camera actually being rendered.
 * For a fishing session the cells near the angler keep their real chunks (full detail where you stand); every other cell is
 * drawn ONLY by the backdrop, so each piece of scenery is drawn exactly once: real or low detail, never both, never neither.
 */
export const SMALL_PIECE=2;
/** Cells farther than this from the angler draw only their coarse set: pieces of COARSE_PIECE m or more, plus every tree, palm and
 *  goal (whole, as boxes when small): the skyline, the shore's palms and the pitches stay; window frames and awnings go. */
export const COARSE_FROM_M=160,COARSE_PIECE=4;
const COARSE_KINDS:ReadonlySet<string>=new Set(['tree','palm','goal']);
/** Kept pieces under this size with more than 12 triangles (palm trunk rings, round canopies, rocks) become their bounding box. */
export const BOX_PIECE=2.5;
/** A box's 12 triangles over corners k = x + 2y + 4z (bit set = max side), wound outwards. */
const BOX_INDEX=[0,2,3,0,3,1, 4,5,7,4,7,6, 0,1,5,0,5,4, 2,6,7,2,7,3, 0,4,6,0,6,2, 1,3,7,1,7,5];
/** Prop kinds (lib/graphics/propReactions.ts) dropped from the backdrop as a whole category. */
export const DROPPED_KINDS:ReadonlySet<string>=new Set(['lamp','pole','signal','flag','sign','bench','table','planter','fence','net','post','bike','crate','bollard','lifebuoy']);
export type BackdropRegion='main'|'jetty'|'cay'|'isle';
export const BACKDROP_REGIONS:readonly BackdropRegion[]=['main','jetty','cay','isle'];
/** Same split as lib/town/world.ts (Coral Cay / Summit Isle region gates); cell = 50 m chunk coordinates. */
export function regionOfCell(cx:number,cz:number):BackdropRegion{
 if(cx>=8&&cz>=0)return 'isle';
 if(cx>=5&&cx<=7&&cz>=0&&cz<=2)return 'jetty';
 if(cx>=5)return 'cay';
 return 'main';
}
const CHUNK='island-chunk-';
export const isChunk=(o:T.Object3D):o is T.Mesh=>o instanceof T.Mesh&&o.name.startsWith(CHUNK);
export const chunkCellKey=(o:T.Object3D)=>{const [cx,cz]=o.name.slice(CHUNK.length).split(':');return cx+':'+cz;};
/** A piece: one source object of the static batching pass, inside a merged chunk buffer. */
type Piece={mesh:T.Mesh;v0:number;v1:number;i0:number;i1:number};
type Cell={key:string;region:BackdropRegion;box:T.Box3;start:number;count:number;cstart:number;ccount:number;on:boolean;coarse:boolean};
export type BackdropStats={built:boolean;sources:number;pieces:number;kept:number;boxed:number;coarseTriangles:number;drawnTriangles:number;workMs:number;dropped:number;droppedKinds:Record<string,number>;vertices:number;triangles:number;buildMs:number};

/** The average colour of a texture (linear), or null if it cannot be read. */
const averageCache=new WeakMap<T.Texture,T.Color|null>();
function textureAverage(texture:T.Texture):T.Color|null{
 if(averageCache.has(texture))return averageCache.get(texture)!;
 let out:T.Color|null=null;
 try{
  const image=texture.image as (CanvasImageSource&{width?:number;height?:number;data?:ArrayLike<number>})|undefined;
  let r=0,g=0,b=0,n=0;
  if(image&&image.data&&typeof image.width==='number'&&typeof image.height==='number'&&image.data.length>=image.width*image.height*4){
   const d=image.data,step=Math.max(4,Math.floor(d.length/4/256)*4);for(let i=0;i+3<d.length;i+=step){if(d[i+3]<16)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
  }else if(image&&typeof document!=='undefined'){
   const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d',{willReadFrequently:true});
   if(x){x.drawImage(image as CanvasImageSource,0,0,8,8);const d=x.getImageData(0,0,8,8).data;for(let i=0;i<d.length;i+=4){if(d[i+3]<16)continue;r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}
  }
  if(n){out=new T.Color(r/n/255,g/n/255,b/n/255);if(texture.colorSpace===T.SRGBColorSpace)out.convertSRGBToLinear();}
 }catch{out=null;}
 averageCache.set(texture,out);return out;
}

/** The colour one source chunk contributes per vertex (before its own vertex colours), or null when it is not drawn at all. */
function baseColor(material:T.Material):T.Color|null{
 const m=material as T.MeshStandardMaterial;
 if(!m.visible||m.transparent&&m.opacity<.6)return null;
 const c=m.color?m.color.clone():new T.Color(1,1,1);
 if(m.map){const a=textureAverage(m.map);if(a)c.multiply(a);}
 return c;
}

export function createFishingBackdrop(scene:T.Scene,sources?:{chunks:T.Mesh[];extras:T.Mesh[]}){
 const stats:BackdropStats={built:false,sources:0,pieces:0,kept:0,boxed:0,coarseTriangles:0,drawnTriangles:0,workMs:0,dropped:0,droppedKinds:{},vertices:0,triangles:0,buildMs:0};
 // One cheap shader instead of the island's lit materials: the sun (no shadows) and the sky / ground / ambient fill, exactly the
 // Lambert terms three uses (so the backdrop meets the real near cells without a colour step), but none of the four pitch spot
 // lights every island material loops over per pixel, no shadow lookups, no maps. Smooth pieces (terrain, the summit's slopes,
 // round towers) keep their byte normals; boxes and double-sided pieces carry a zero normal and are shaded flat (screen
 // derivatives). Fog, tone mapping and the output colour space come from three's own chunks.
 const uniforms={uSunDir:{value:new T.Vector3(0,1,0)},uSun:{value:new T.Color(0,0,0)},uSky:{value:new T.Color(0,0,0)},uGround:{value:new T.Color(0,0,0)},uHemiDir:{value:new T.Vector3(0,1,0)},uAmbient:{value:new T.Color(0,0,0)}};
 const material=new T.ShaderMaterial({name:'fishing-backdrop',vertexColors:true,fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{}]),
  vertexShader:`varying vec3 vColorB;varying vec3 vNormalB;varying vec3 vViewPosition;
#include <fog_pars_vertex>
void main(){vColorB=color;vNormalB=normal;vec4 mvPosition=modelViewMatrix*vec4(position,1.);vViewPosition=-mvPosition.xyz;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
  fragmentShader:`#include <common>
uniform vec3 uSunDir;uniform vec3 uSun;uniform vec3 uSky;uniform vec3 uGround;uniform vec3 uHemiDir;uniform vec3 uAmbient;
varying vec3 vColorB;varying vec3 vNormalB;varying vec3 vViewPosition;
#include <fog_pars_fragment>
void main(){
 vec3 n=dot(vNormalB,vNormalB)<.25?(vec4(normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))),0.)*viewMatrix).xyz:normalize(vNormalB);
 vec3 irradiance=uSun*saturate(dot(n,uSunDir))+mix(uGround,uSky,.5*dot(n,uHemiDir)+.5)+uAmbient;
 gl_FragColor=vec4(vColorB*irradiance*RECIPROCAL_PI,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`});
 Object.assign(material.uniforms,uniforms);
 /** Copy the scene's sun / hemisphere / ambient into the backdrop (once per focused frame: a few vector copies). */
 const lights={sun:null as T.DirectionalLight|null,hemi:[] as T.HemisphereLight[],ambient:[] as T.AmbientLight[],found:false};
 const tmp=new T.Vector3();
 function updateLights(){
  if(!lights.found){lights.found=true;scene.traverse(o=>{if(o instanceof T.DirectionalLight&&!lights.sun)lights.sun=o;else if(o instanceof T.HemisphereLight)lights.hemi.push(o);else if(o instanceof T.AmbientLight)lights.ambient.push(o);});}
  const sun=lights.sun;
  if(sun&&sun.visible){sun.updateWorldMatrix(true,false);sun.target.updateWorldMatrix(true,false);uniforms.uSunDir.value.setFromMatrixPosition(sun.matrixWorld).sub(tmp.setFromMatrixPosition(sun.target.matrixWorld)).normalize();uniforms.uSun.value.copy(sun.color).multiplyScalar(sun.intensity);}else uniforms.uSun.value.setRGB(0,0,0);
  uniforms.uSky.value.setRGB(0,0,0);uniforms.uGround.value.setRGB(0,0,0);uniforms.uAmbient.value.setRGB(0,0,0);
  for(const h of lights.hemi)if(h.visible){uniforms.uSky.value.r+=h.color.r*h.intensity;uniforms.uSky.value.g+=h.color.g*h.intensity;uniforms.uSky.value.b+=h.color.b*h.intensity;uniforms.uGround.value.r+=h.groundColor.r*h.intensity;uniforms.uGround.value.g+=h.groundColor.g*h.intensity;uniforms.uGround.value.b+=h.groundColor.b*h.intensity;h.updateWorldMatrix(true,false);uniforms.uHemiDir.value.setFromMatrixPosition(h.matrixWorld).normalize();}
  for(const a of lights.ambient)if(a.visible){uniforms.uAmbient.value.r+=a.color.r*a.intensity;uniforms.uAmbient.value.g+=a.color.g*a.intensity;uniforms.uAmbient.value.b+=a.color.b*a.intensity;}
 }
 const meshes=new Map<BackdropRegion,T.Mesh>();const cells=new Map<string,Cell>();
 let fullIndex:Uint32Array|null=null,coarseIndex:Uint32Array|null=null,selectedOnce=false;
 /** Extras: loose static meshes outside the chunks (beach umbrella canopies), copied whole into their cell. */
 const collect=()=>{
  const chunks:T.Mesh[]=[],extras:T.Mesh[]=[];
  for(const o of scene.children)if(isChunk(o))chunks.push(o);
  for(const o of scene.children)if(o.type==='Group'&&!o.name)o.traverse(c=>{if(c instanceof T.Mesh&&c.userData.umbrellaAnimated&&!Array.isArray(c.material))extras.push(c);});
  return {chunks,extras};
 };
 const cellOf=(key:string)=>{let c=cells.get(key);if(!c){const [cx,cz]=key.split(':').map(Number);c={key,region:regionOfCell(cx,cz),box:new T.Box3(),start:0,count:0,cstart:0,ccount:0,on:false,coarse:false};cells.set(key,c);}return c;};
 const extraCell=(m:T.Mesh)=>{const p=new T.Vector3().setFromMatrixPosition(m.matrixWorld);return Math.floor(p.x/50)+':'+Math.floor(p.z/50);};

 /** Builds the backdrop a slice at a time: each `next()` does roughly `budgetMs` of work. Raw typed arrays throughout (the merged
  *  chunk buffers are plain, non-interleaved Float32 positions / colours), so the whole island is ~100 ms on a desktop. */
 function* build(budgetMs:number):Generator<void,void,void>{
  const t0=performance.now();let sliceStart=t0;
  const tick=()=>{const now=performance.now();if(now-sliceStart<=budgetMs)return false;stats.workMs+=now-sliceStart;return true;};
  const src=sources??collect();stats.sources=src.chunks.length+src.extras.length;
  // Pass 1: which pieces stay (and which become a box), per cell.
  type Kept={piece:Piece;color:T.Color;colors:ArrayLike<number>|null;twoSided:boolean;box:number[]|null;coarse:boolean};
  const keep=new Map<string,Kept[]>();
  for(const mesh of src.chunks){
   const color=baseColor(mesh.material as T.Material);if(!color)continue;
   const g=mesh.geometry,pos=g.getAttribute('position') as T.BufferAttribute|undefined,index=g.index;if(!pos||!index||pos.itemSize!==3||(pos as unknown as {isInterleavedBufferAttribute?:boolean}).isInterleavedBufferAttribute)continue;
   const info=mesh.userData.pieces as {starts:number[];kinds:string[]}|undefined;
   const starts=info?.starts??[0],kinds=info?.kinds??[''];
   const key=chunkCellKey(mesh),list=keep.get(key)??[];keep.set(key,list);const cellBox=cellOf(key).box;
   const ca=g.getAttribute('color') as T.BufferAttribute|undefined;
   const colors=(mesh.material as T.MeshStandardMaterial).vertexColors&&ca&&ca.itemSize===3&&!ca.normalized?ca.array:null;
   // Double-sided sources (leaves, flags, thin panels) get their triangles twice, reversed, so the single-sided backdrop keeps them.
   const twoSided=(mesh.material as T.Material).side===T.DoubleSide;
   const pa=pos.array,idx=index.array;let tri=0;
   // Index runs per piece: the merged index is the pieces' indices concatenated in order.
   for(let p=0;p<starts.length;p++){
    const v0=starts[p],v1=p+1<starts.length?starts[p+1]:pos.count,i0=tri;
    while(tri<idx.length&&idx[tri]<v1&&idx[tri]>=v0)tri+=3;
    stats.pieces++;
    const kind=kinds[p]??'';
    if(DROPPED_KINDS.has(kind)){stats.dropped++;stats.droppedKinds[kind]=(stats.droppedKinds[kind]??0)+1;continue;}
    let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
    for(let i=v0*3,e=v1*3;i<e;i+=3){const x=pa[i],y=pa[i+1],z=pa[i+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z;}
    const size=Math.max(x1-x0,y1-y0,z1-z0);
    if(!kind&&size<SMALL_PIECE){stats.dropped++;stats.droppedKinds.small=(stats.droppedKinds.small??0)+1;continue;}
    if(tri===i0)continue;
    cellBox.expandByPoint(new T.Vector3(x0,y0,z0)).expandByPoint(new T.Vector3(x1,y1,z1));
    // A small rounded piece (palm trunk ring, canopy blob, rock) is its bounding box: 12 triangles instead of 40–200.
    const asBox=size<BOX_PIECE&&(tri-i0)/3>12;if(asBox)stats.boxed++;
    list.push({piece:{mesh,v0,v1,i0,i1:tri},color,colors,twoSided,box:asBox?[x0,y0,z0,x1,y1,z1]:null,coarse:size>=COARSE_PIECE||COARSE_KINDS.has(kind)});stats.kept++;
   }
   if(tick()){yield;sliceStart=performance.now();}
  }
  for(const mesh of src.extras){
   const color=baseColor(mesh.material as T.Material);if(!color)continue;
   const g=mesh.geometry,pos=g.getAttribute('position');if(!pos)continue;
   const key=extraCell(mesh),list=keep.get(key)??[];keep.set(key,list);
   const b=new T.Box3().setFromBufferAttribute(pos as T.BufferAttribute).applyMatrix4(mesh.matrixWorld);cellOf(key).box.union(b);
   list.push({piece:{mesh,v0:0,v1:pos.count,i0:0,i1:g.index?g.index.count:pos.count},color,colors:null,twoSided:(mesh.material as T.Material).side===T.DoubleSide,box:null,coarse:true});stats.pieces++;stats.kept++;
  }
  // Pass 2: copy positions + one colour per vertex, indices grouped by cell (so a session's index is a few range copies).
  let vertices=0,indices=0,coarseCount=0;for(const list of keep.values())for(const {piece,twoSided,box,coarse} of list){const n=box?36:(piece.i1-piece.i0)*(twoSided?2:1);vertices+=box?8:piece.v1-piece.v0;indices+=n;if(coarse)coarseCount+=n;}
  const positions=new Float32Array(vertices*3),colors=new Uint8Array(vertices*3),normals=new Int8Array(vertices*3),all=new Uint32Array(indices),coarseAll=new Uint32Array(coarseCount);let co=0;
  let vo=0,io=0;const w=new T.Vector3();
  const byte=(v:number)=>v<=0?0:v>=1?255:Math.round(v*255);
  const order=[...keep.keys()].sort();
  for(const key of order){
   const cell=cellOf(key);cell.start=io;cell.cstart=co;
   for(const {piece,color,colors:vc,twoSided,box,coarse} of keep.get(key)!){
    const {mesh,v0,v1,i0,i1}=piece,g=mesh.geometry,from=io;
    if(box){
     const r=vc?vc[v0*3]*color.r:color.r,gg=vc?vc[v0*3+1]*color.g:color.g,b=vc?vc[v0*3+2]*color.b:color.b;
     for(let k=0;k<8;k++){const o=(vo+k)*3;positions[o]=box[k&1?3:0];positions[o+1]=box[k&2?4:1];positions[o+2]=box[k&4?5:2];colors[o]=byte(r);colors[o+1]=byte(gg);colors[o+2]=byte(b);}
     for(const k of BOX_INDEX)all[io++]=vo+k;
     if(coarse){coarseAll.set(all.subarray(from,io),co);co+=io-from;}
     vo+=8;continue;
    }
    const pa=(g.getAttribute('position') as T.BufferAttribute).array,index=g.index,ia=index?index.array:null;
    const na0=g.getAttribute('normal') as T.BufferAttribute|undefined,na=!twoSided&&na0&&na0.itemSize===3&&!na0.normalized&&!(na0 as unknown as {isInterleavedBufferAttribute?:boolean}).isInterleavedBufferAttribute&&mesh.name.startsWith(CHUNK)?na0.array:null;
    const extra=!mesh.name.startsWith(CHUNK);if(extra)mesh.updateWorldMatrix(true,false);
    for(let i=v0;i<v1;i++){
     const o=(vo+i-v0)*3;
     if(extra){w.set(pa[i*3],pa[i*3+1],pa[i*3+2]).applyMatrix4(mesh.matrixWorld);positions[o]=w.x;positions[o+1]=w.y;positions[o+2]=w.z;}
     else{positions[o]=pa[i*3];positions[o+1]=pa[i*3+1];positions[o+2]=pa[i*3+2];}
     if(vc){colors[o]=byte(vc[i*3]*color.r);colors[o+1]=byte(vc[i*3+1]*color.g);colors[o+2]=byte(vc[i*3+2]*color.b);}
     else{colors[o]=byte(color.r);colors[o+1]=byte(color.g);colors[o+2]=byte(color.b);}
     if(na){normals[o]=Math.round(na[i*3]*127);normals[o+1]=Math.round(na[i*3+1]*127);normals[o+2]=Math.round(na[i*3+2]*127);}
    }
    const shift=vo-v0;
    if(ia)for(let i=i0;i<i1;i++)all[io++]=ia[i]+shift;else for(let i=i0;i<i1;i++)all[io++]=i+shift;
    if(twoSided)for(let i=i0;i+2<i1;i+=3){const a=ia?ia[i]:i,b=ia?ia[i+1]:i+1,c=ia?ia[i+2]:i+2;all[io++]=a+shift;all[io++]=c+shift;all[io++]=b+shift;}
    if(coarse){coarseAll.set(all.subarray(from,io),co);co+=io-from;}
    vo+=v1-v0;
   }
   cell.count=io-cell.start;cell.ccount=co-cell.cstart;
   if(tick()){yield;sliceStart=performance.now();}
  }
  fullIndex=all;coarseIndex=coarseAll;stats.coarseTriangles=coarseCount/3;
  const position=new T.BufferAttribute(positions,3),color=new T.BufferAttribute(colors,3,true),normal=new T.BufferAttribute(normals,3,true);
  for(const region of BACKDROP_REGIONS){
   let count=0;for(const cell of cells.values())if(cell.region===region)count+=cell.count;if(!count)continue;
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',position);geometry.setAttribute('normal',normal);geometry.setAttribute('color',color);
   const index=new T.BufferAttribute(new Uint32Array(count),1);index.setUsage(T.DynamicDrawUsage);geometry.setIndex(index);geometry.setDrawRange(0,0);
   geometry.boundingSphere=new T.Sphere();geometry.boundingBox=new T.Box3();
   const mesh=new T.Mesh(geometry,material);mesh.name='fishing-backdrop-'+region;mesh.castShadow=false;mesh.receiveShadow=false;
   mesh.matrixAutoUpdate=false;mesh.matrixWorldAutoUpdate=false;mesh.visible=false;mesh.userData.backdrop=true;mesh.raycast=()=>{};
   scene.add(mesh);mesh.updateMatrixWorld(true);meshes.set(region,mesh);
  }
  for(const cell of cells.values())cell.box.expandByScalar(1);
  stats.workMs=Math.round(stats.workMs+performance.now()-sliceStart);
  stats.vertices=vertices;stats.triangles=indices/3;stats.built=true;stats.buildMs=Math.round(performance.now()-t0);
 }

 let builder:Generator<void,void,void>|null=null;
 /** Every cell the backdrop covers (each holds the low-detail copy of that 50 m chunk). */
 const covered=()=>[...cells.values()];
 return {stats,material,meshes,updateLights,
  get ready(){return stats.built;},
  /** Advance the build by about `budgetMs` (call once per frame until `ready`); `budgetMs` Infinity builds at once. */
  step(budgetMs=4){if(stats.built)return true;builder??=build(budgetMs);if(budgetMs===Infinity){while(!builder.next().done){/* all at once */}}else builder.next();return stats.built;},
  cells:covered,
  /** Show every cell except `near` (whose real chunks stay drawn): rewrites each region's index (one upload per session). */
  /** Show every cell except `near` (whose real chunks stay drawn), and, with a frustum, only cells that can be in that view (the
   *  fishing camera holds still, so a session usually uploads its index once; a cell entering or leaving the view re-selects).
   *  Returns true when the drawn set changed. */
  select(near:ReadonlySet<string>,frustum?:T.Frustum,from?:{x:number;z:number}){
   if(!fullIndex||!coarseIndex)return false;
   let changed=false;
   for(const cell of cells.values()){
    const on=!!cell.count&&!near.has(cell.key)&&(!frustum||frustum.intersectsBox(cell.box));
    const b=cell.box,coarse=!!from&&Math.hypot(Math.max(b.min.x-from.x,0,from.x-b.max.x),Math.max(b.min.z-from.z,0,from.z-b.max.z))>COARSE_FROM_M;
    if(on!==cell.on||coarse!==cell.coarse){cell.on=on;cell.coarse=coarse;changed=true;}}
   if(!changed&&selectedOnce)return false;selectedOnce=true;stats.drawnTriangles=0;
   for(const [region,mesh] of meshes){
    const g=mesh.geometry,index=g.index!,out=index.array as Uint32Array;let n=0;const box=g.boundingBox!.makeEmpty();
    for(const cell of cells.values()){if(cell.region!==region||!cell.on)continue;
     if(cell.coarse){out.set(coarseIndex.subarray(cell.cstart,cell.cstart+cell.ccount),n);n+=cell.ccount;}else{out.set(fullIndex.subarray(cell.start,cell.start+cell.count),n);n+=cell.count;}
     box.union(cell.box);}
    g.setDrawRange(0,n);index.needsUpdate=true;index.clearUpdateRanges();index.addUpdateRange(0,n);stats.drawnTriangles+=n/3;
    if(n)box.getBoundingSphere(g.boundingSphere!);else g.boundingSphere!.set(new T.Vector3(),0);
    mesh.userData.drawn=n>0;
   }
   return true;
  },
  dispose(){for(const mesh of meshes.values()){mesh.removeFromParent();mesh.geometry.dispose();}meshes.clear();material.dispose();cells.clear();fullIndex=null;builder=null;},
 };
}
export type FishingBackdrop=ReturnType<typeof createFishingBackdrop>;
