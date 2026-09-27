import * as T from 'three';

/**
 * Football manhole covers for every road junction: three instanced draws in total (rims, covers and an
 * on-demand glint), one shared baked texture, receive-only shadows. Nothing here runs per frame except an
 * active opening or settling tween; glints only write matrices when their on/off state changes.
 * Once its ball is collected a cover slides back into its rim as a plain street cover (user, Sep 25 2026): the shared
 * texture is a two-cell atlas (football design | plain cover) and a per-instance attribute picks the cell, so it costs no
 * extra draw call and nothing runs once it has settled.
 */
export type ManholeSite={x:number;z:number};
const COVER_RADIUS=1,RIM_OUTER=1.22,COVER_Y=.034,OPEN_TIME=.6,OPEN_DISTANCE=2.35,SETTLE_TIME=.45;
const TEXTURE_SIZE=128;

/** Cast-iron covers, baked side by side: the football panel relief (a brass centre pentagon, five hexagons and a studded rim)
 *  and a plain street cover (concentric grooves and a diamond grip pattern inside the same studded rim). */
function bakeCoverTextures(){
 const size=TEXTURE_SIZE,width=size*2,color=new Uint8Array(width*size*4),height=new Uint8Array(width*size*4);
 const polar=(r:number,a:number)=>[.5+Math.cos(a)*r,.5+Math.sin(a)*r] as const;
 const vertex=(i:number,r:number,offset=0)=>polar(r,-Math.PI/2+(i+offset)*Math.PI*2/5);
 const pentagon=[0,1,2,3,4].map(i=>vertex(i,.13)),spoke=[0,1,2,3,4].map(i=>vertex(i,.27)),outer=[0,1,2,3,4].map(i=>vertex(i,.33,.5));
 const segments:[number,number,number,number][]=[];
 for(let i=0;i<5;i++){const j=(i+1)%5;segments.push([...pentagon[i],...pentagon[j]],[...pentagon[i],...spoke[i]],[...spoke[i],...outer[i]],[...outer[i],...spoke[j]],[...outer[i],...vertex(i,.43,.5)],[...spoke[i],...vertex(i,.43)]);}
 const decagon=[0,1,2,3,4].flatMap(i=>[spoke[i],outer[i]]);
 const inside=(poly:readonly (readonly [number,number])[],x:number,y:number)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;}return hit;};
 const segmentDistance=(x:number,y:number,[ax,ay,bx,by]:[number,number,number,number])=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-ax-dx*t,y-ay-dy*t);};
 for(let cell=0;cell<2;cell++)for(let py=0;py<size;py++)for(let px=0;px<size;px++){
  const x=(px+.5)/size,y=(py+.5)/size,r=Math.hypot(x-.5,y-.5),angle=Math.atan2(y-.5,x-.5);
  let rgb=[78,82,78],h=120;
  if(cell===0){
   if(inside(pentagon,x,y)){rgb=[201,164,92];h=190;}
   else if(inside(decagon,x,y)){rgb=[104,108,101];h=165;}
   let groove=Infinity;for(const s of segments)groove=Math.min(groove,segmentDistance(x,y,s));
   if(r<.44&&groove<.012){rgb=[38,41,39];h=40;}
  }else{
   // Plain cover: a raised diamond grip pattern with two concentric grooves, no emblem.
   const u=(x-y)*14,v=(x+y)*14,du=Math.abs(u-Math.round(u)),dv=Math.abs(v-Math.round(v));
   if(r<.4&&Math.min(du,dv)<.12){rgb=[62,66,63];h=90;}else if(r<.4){rgb=[86,90,85];h=150;}
   if(Math.abs(r-.4)<.012||Math.abs(r-.18)<.01){rgb=[38,41,39];h=40;}
  }
  // Raised outer ring with twelve studs; a groove separates it from the panels.
  if(r>.44&&r<.458){rgb=[34,37,35];h=30;}
  if(r>=.458){rgb=[92,96,90];h=175;const step=Math.PI/6,da=((angle%step)+step)%step,stud=Math.hypot(r-.478,.478*Math.min(da,step-da));if(stud<.013){rgb=[150,138,104];h=225;}}
  // Tiny cast grain keeps large flat panels from looking plastic.
  const grain=((px*73856093)^(py*19349663))%11-5;
  const i=(py*width+px+cell*size)*4;color[i]=Math.max(0,Math.min(255,rgb[0]+grain));color[i+1]=Math.max(0,Math.min(255,rgb[1]+grain));color[i+2]=Math.max(0,Math.min(255,rgb[2]+grain));color[i+3]=255;
  height[i]=height[i+1]=height[i+2]=h;height[i+3]=255;
 }
 // Each cover samples one cell (repeat .5); the per-instance `plain` attribute adds .5 to x (see the material below).
 const texture=(data:Uint8Array,srgb:boolean)=>{const t=new T.DataTexture(data,width,size,T.RGBAFormat);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.generateMipmaps=false;t.repeat.set(.5,1);if(srgb)t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;};
 return {map:texture(color,true),bump:texture(height,false)};
}

/** A soft four-point sparkle, baked once. */
function bakeGlintTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let py=0;py<size;py++)for(let px=0;px<size;px++){
  const x=(px+.5)/size-.5,y=(py+.5)/size-.5,r=Math.hypot(x,y),ray=Math.max(0,1-Math.abs(x)*22)*Math.max(0,1-Math.abs(y)*2.1)+Math.max(0,1-Math.abs(y)*22)*Math.max(0,1-Math.abs(x)*2.1);
  const ring=Math.max(0,1-Math.abs(r-.4)*18)*.95,core=Math.max(0,1-r*6),v=Math.min(1,ray*1.2+ring+core);const i=(py*size+px)*4;
  data[i]=255;data[i+1]=214;data[i+2]=108;data[i+3]=Math.round(v*255);
 }
 const t=new T.DataTexture(data,size,size,T.RGBAFormat);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;
}

/** Flat rim and dark shaft opening, merged with vertex colours (no texture). */
function rimGeometry(){
 const positions:number[]=[],normals:number[]=[],colors:number[]=[],segments=28;
 const push=(x:number,y:number,z:number,c:readonly number[])=>{positions.push(x,y,z);normals.push(0,1,0);colors.push(c[0],c[1],c[2]);};
 const iron=[.2,.215,.205],shaft=[.035,.04,.038],shaftEdge=[.1,.105,.1];
 for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
  // Ring from the cover edge to the rim, slightly above the road surface.
  const ri=COVER_RADIUS-.03,ro=RIM_OUTER,y=.03;
  push(ri*ca,y,ri*sa,iron);push(ro*cb,y,ro*sb,iron);push(ro*ca,y,ro*sa,iron);
  push(ri*ca,y,ri*sa,iron);push(ri*cb,y,ri*sb,iron);push(ro*cb,y,ro*sb,iron);
  // Dark opening, only visible once the cover has slid aside.
  push(0,.014,0,shaft);push(ri*cb,.014,ri*sb,shaftEdge);push(ri*ca,.014,ri*sa,shaftEdge);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;
}

export function createManholeCovers(sites:ManholeSite[]){
 const root=new T.Group();root.name='manhole-covers';root.matrixAutoUpdate=false;
 const {map,bump}=bakeCoverTextures(),glintTexture=bakeGlintTexture();
 // Polygon offset keeps the flush discs stable above asphalt at parachute viewing distances.
 const offset={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2};
 const rimMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.8,...offset});
 const coverMaterial=new T.MeshStandardMaterial({map,bumpMap:bump,bumpScale:2.2,roughness:.6,metalness:.2,...offset});
 // Plain (collected) covers read the atlas's second cell: one instanced attribute, no extra draw.
 coverMaterial.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float plain;').replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x+=plain*.5;\n#endif\n#ifdef USE_BUMPMAP\nvBumpMapUv.x+=plain*.5;\n#endif');};
 coverMaterial.customProgramCacheKey=()=>'manhole-cover-atlas';
 const glintMaterial=new T.MeshBasicMaterial({map:glintTexture,transparent:true,depthWrite:false,toneMapped:false,...offset});
 const rimGeo=rimGeometry(),coverGeo=new T.CylinderGeometry(COVER_RADIUS-.02,COVER_RADIUS,.05,28,1),glintGeo=new T.PlaneGeometry(4.4,4.4).rotateX(-Math.PI/2);
 const count=Math.max(1,sites.length);
 const rims=new T.InstancedMesh(rimGeo,rimMaterial,count),covers=new T.InstancedMesh(coverGeo,coverMaterial,count),glints=new T.InstancedMesh(glintGeo,glintMaterial,count);
 rims.name='manhole-rims';covers.name='manhole-cover-instances';glints.name='manhole-glints';
 for(const mesh of [rims,covers,glints]){mesh.castShadow=false;mesh.receiveShadow=mesh!==glints;mesh.matrixAutoUpdate=false;mesh.count=sites.length;root.add(mesh);}
 const plainAttr=new T.InstancedBufferAttribute(new Float32Array(count),1);coverGeo.setAttribute('plain',plainAttr);
 covers.instanceMatrix.setUsage(T.DynamicDrawUsage);glints.instanceMatrix.setUsage(T.DynamicDrawUsage);glints.visible=false;glints.renderOrder=2;
 const dummy=new T.Object3D(),zero=new T.Matrix4().makeScale(0,0,0);
 // Each cover slides toward a fixed side so neighbouring junctions do not all look identical.
 const slide=sites.map((s,i)=>(i*2.39996+s.x*.01)%(Math.PI*2));
 const open=new Float32Array(sites.length),glinting=new Uint8Array(sites.length),tweens=new Map<number,number>();
 const stats={writes:0},settling=new Map<number,number>();
 function writeCover(i:number,t:number){
  const s=sites[i],e=t>=1?1:1-(1-t)**3,lift=t>=1?0:Math.sin(Math.PI*Math.min(1,t))*.42,tilt=t>=1?0:Math.sin(Math.PI*Math.min(1,t))*.55,a=slide[i];
  dummy.position.set(s.x+Math.cos(a)*e*OPEN_DISTANCE,COVER_Y+lift,s.z+Math.sin(a)*e*OPEN_DISTANCE);
  dummy.rotation.set(0,-a,tilt);dummy.rotateY(e*.6);dummy.updateMatrix();covers.setMatrixAt(i,dummy.matrix);covers.instanceMatrix.needsUpdate=true;open[i]=t;stats.writes++;
 }
 // Closing: from the open spot back into the rim, eased out, with a small hop; ends flat, like writeCover(i,0).
 function writeSettle(i:number,t:number){
  const s=sites[i],e=1-(1-t)**3,a=slide[i],back=1-e,hop=t>=1?0:Math.sin(Math.PI*t)*.25;
  dummy.position.set(s.x+Math.cos(a)*back*OPEN_DISTANCE,COVER_Y+hop,s.z+Math.sin(a)*back*OPEN_DISTANCE);
  dummy.rotation.set(0,-a,0);dummy.rotateY(back*.6);dummy.updateMatrix();covers.setMatrixAt(i,dummy.matrix);covers.instanceMatrix.needsUpdate=true;stats.writes++;
 }
 const writeClosed=(i:number)=>writeSettle(i,1);
 // Collected: the cover eases back from its open spot into the rim (reverse of the opening) and shows the plain design.
 const plain=new Uint8Array(sites.length);
 function setPlain(i:number,on:boolean){if(!!plain[i]===on)return;plain[i]=on?1:0;plainAttr.setX(i,on?1:0);plainAttr.needsUpdate=true;stats.writes++;}
 sites.forEach((s,i)=>{dummy.position.set(s.x,0,s.z);dummy.rotation.set(0,slide[i],0);dummy.updateMatrix();rims.setMatrixAt(i,dummy.matrix);glints.setMatrixAt(i,zero);writeCover(i,0);});
 rims.computeBoundingSphere();covers.computeBoundingSphere();stats.writes=0;
 // Glint instances start at zero scale, so a computed sphere would cull them; the mesh is hidden whenever none glint.
 glints.frustumCulled=false;
 let shown=0;
 function setGlint(i:number,on:boolean){
  if(!!glinting[i]===on)return;glinting[i]=on?1:0;shown+=on?1:-1;
  if(on){const s=sites[i];dummy.position.set(s.x,.09,s.z);dummy.rotation.set(0,slide[i],0);dummy.updateMatrix();glints.setMatrixAt(i,dummy.matrix);}else glints.setMatrixAt(i,zero);
  glints.instanceMatrix.needsUpdate=true;glints.visible=shown>0;stats.writes++;
 }
 return{root,stats,
  get tweening(){return tweens.size>0||settling.size>0;},
  isOpen:(i:number)=>open[i]>=1,
  /** Collected: a plain street cover back in its rim. */
  isPlain:(i:number)=>plain[i]===1,
  /** The cover's resting offset from its site (0 when closed in the rim). */
  offset:(i:number)=>{covers.getMatrixAt(i,dummy.matrix);dummy.matrix.decompose(dummy.position,dummy.quaternion,dummy.scale);return Math.hypot(dummy.position.x-sites[i].x,dummy.position.z-sites[i].z);},
  glinting:(i:number)=>glinting[i]===1,
  /** Start the one-shot opening; reduced motion jumps straight to the open state. */
  open(i:number,reduced:boolean){if(open[i]>=1||tweens.has(i)||plain[i])return;setGlint(i,false);if(reduced)writeCover(i,1);else tweens.set(i,0);},
  /** The ball is collected: slide back into the rim as a plain cover (after any opening still running); reduced motion snaps. */
  settle(i:number,reduced:boolean){if(plain[i]||settling.has(i))return;setGlint(i,false);setPlain(i,true);open[i]=1;if(reduced||!sites[i]){tweens.delete(i);writeClosed(i);}else settling.set(i,0);},
  /** Snap to saved progress (initial load, another tab), leaving any running tween alone: closed, open, or plain (collected). */
  setState(i:number,state:'closed'|'open'|'plain'){if(tweens.has(i)||settling.has(i))return;
   if(state==='plain'){if(plain[i])return;setPlain(i,true);open[i]=1;writeClosed(i);return;}
   if(plain[i])return;if((open[i]>=1)===(state==='open'))return;writeCover(i,state==='open'?1:0);},
  setGlint,
  clearGlints(){if(!shown)return;for(let i=0;i<sites.length;i++)setGlint(i,false);},
  update(dt:number){if(!tweens.size&&!settling.size)return;
   for(const [i,age] of tweens){const next=age+dt;writeCover(i,Math.min(1,next/OPEN_TIME));if(next>=OPEN_TIME)tweens.delete(i);else tweens.set(i,next);}
   for(const [i,age] of settling){if(tweens.has(i))continue;const next=age+dt,t=Math.min(1,next/SETTLE_TIME);writeSettle(i,t);if(t>=1)settling.delete(i);else settling.set(i,next);}},
  dispose(){root.removeFromParent();for(const mesh of [rims,covers,glints])mesh.dispose();rimGeo.dispose();coverGeo.dispose();glintGeo.dispose();rimMaterial.dispose();coverMaterial.dispose();glintMaterial.dispose();map.dispose();bump.dispose();glintTexture.dispose();}};
}
