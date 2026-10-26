import * as T from 'three';
import {SHORE_FOAM_GLSL,SHORE_FOAM_UNIFORMS} from './shoreFoamFx';
import {WATER_UNIFORMS,CLEAR_WIN_GLSL,CLEAR_WIN_UNIFORMS,SHORE_GLSL,SHORE_PULL_GLSL,SHORE_LAND_LIFT,SHORE_VIS_LIFT,SHORE_VIS_SLOPE,SHORE_HIGH,setIsleField,shoreDrape,shoreRough} from './waterSurface';

// Self-contained (the fishing shoreline in lib/town/fishing/shoreWater.ts has its own copies and its own owner).
const WATER_Y=-.42,STRIP_Y=-.403;
/** Only the static ground: opaque island chunks and the island base meshes. */
const GROUND=new Set(['curved-island-foundation','interior-island-grass','continuous-sandy-shore']);
const isGround=(o:T.Object3D)=>(o instanceof T.Mesh)&&(GROUND.has(o.name)||o.name.startsWith('island-chunk-')&&!(Array.isArray(o.material)?o.material.some(m=>m.transparent):o.material.transparent));
/** Ground this far over the water (m) or higher is "overhead" for the bake (see OVERHEAD in sampleIslandHeights). */
const OVERHEAD=3;
/** R/G: height over the water (−0.5 … 1.5 m, 16 bits); B: 1 where the surface is OVERHEAD or higher; A: 1 = something drawn. */
function heightMaterial(){
 return new T.ShaderMaterial({uniforms:{uWater:{value:WATER_Y}},
  vertexShader:'varying float vY;void main(){vec4 p=vec4(position,1.);\n#ifdef USE_INSTANCING\np=instanceMatrix*p;\n#endif\nvec4 w=modelMatrix*p;vY=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`uniform float uWater;varying float vY;void main(){float v=clamp((vY-uWater+.5)/2.,0.,1.)*255.;gl_FragColor=vec4(floor(v)/255.,fract(v),vY-uWater>${OVERHEAD.toFixed(1)}?1.:0.,1.);}`,side:T.DoubleSide});
}
/** Smooth value noise on an n×n grid (lattice every `cell` texels). */
function valueNoise(n:number,cell:number,seed:number){
 const g=Math.ceil(n/cell)+2,lattice=new Float32Array(g*g);let s=seed;for(let i=0;i<lattice.length;i++){s=(s*16807)%2147483647;lattice[i]=s/2147483647;}
 const out=new Float32Array(n*n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
  const a=lattice[iy*g+ix],b=lattice[iy*g+ix+1],c=lattice[(iy+1)*g+ix],d=lattice[(iy+1)*g+ix+1];out[y*n+x]=(a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy;}
 return out;
}
/**
 * Tileable 64² foam noise, four different noises in one RGBA8 texture (16 KB, RepeatWrapping, mipmapped), all read in ONE fetch:
 * R big lace patches (8-texel cells: where the foam edge breaks up), G the original lace (8 + 3 texel mix, unchanged look),
 * B bubbles (2-texel blobs, sharpened: pops in the high-water mark, holes in the trailing foam), A medium cells (sparkle mask).
 * Oct 26 2026: was the G mix copied into all four channels (three wasted).
 */
export function laceNoise(){
 const n=64,a=valueNoise(n,8,3),b=valueNoise(n,3,5),c=valueNoise(n,2,9),m=valueNoise(n,4,13),data=new Uint8Array(n*n*4);
 const tile=(f:Float32Array,x:number,y:number)=>{const wx=Math.sin(Math.PI*x/n)**2,wy=Math.sin(Math.PI*y/n)**2,h=n/2;
  return (f[y*n+x]*wx+f[y*n+(x+h)%n]*(1-wx))*wy+(f[((y+h)%n)*n+x]*wx+f[((y+h)%n)*n+(x+h)%n]*(1-wx))*(1-wy);};
 const byte=(v:number)=>Math.round(Math.min(1,Math.max(0,v))*255),sharp=(v:number,lo:number,hi:number)=>{const t=Math.min(1,Math.max(0,(v-lo)/(hi-lo)));return t*t*(3-2*t);};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,ta=tile(a,x,y);
  data[i]=byte((ta-.5)*1.8+.5);data[i+1]=byte((ta*.65+tile(b,x,y)*.35-.2)*1.6);data[i+2]=byte(sharp(tile(c,x,y),.35,.75));data[i+3]=byte((tile(m,x,y)-.5)*1.8+.5);}
 const t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;t.name='island-shore-lace';
 return t;
}
/** View depth (m) over which the strip stops reading the lace noise (it mips to flat grey that far out anyway): full detail nearer
 *  than `near`, a blend to the flat value, no texture fetch at all past `far` (map view, flight, the far side of a bay). */
export const STRIP_FAR={near:45,far:65} as const;

/**
 * Island-wide moving shoreline ("tier B", Oct 12 2026; docs/performance-guide.md "Island-wide moving water").
 *
 * Baked ONCE when Town first mounts the world (no per-frame CPU, no render targets after the bake):
 * 1. One top-down render (1 m texels, 1036×626, opaque island ground only, no shadows) reads the real waterline everywhere: the main
 *    island's beaches and seawall, Coral Cay's sloping skirt, the causeway and sandbars, the East Pier's rock armour and boulders,
 *    the ferry dock. (There are no ponds or rivers.) Exact Euclidean distance transforms give a signed distance-to-shore (m).
 * 2. A 2 m half-float RGBA texture (518×313, ~1.3 MB): R signed distance (+ sea, − land), G/B static noise, A "beach" (1) or hard edge
 *    (0: seawalls, pier kerbs, the dock), shared with the ocean shader (waterSurface.ts: depth gradient, drifting ripple lines,
 *    whitecaps, desktop sparkles).
 * 3. One strip mesh along every shore (−3.5 … +3 m, 1 m grid, split into 128 m tiles so each is frustum-culled), drawing the swash:
 *    a foam edge lapping up the sand and sliding back on the swell's 5.6 s cycle (each wave a different height), the wet sand it
 *    leaves, white water where the swell breaks and clear shallows with the sand showing through. Scaled for the island camera
 *    (~40 m away): a wider foam line and a longer run-up than the fishing strip, no caustics. Inside a fishing box it fades out and
 *    the fishing strip (lib/town/fishing/shoreWater.ts) takes over.
 * Detail 0 (reduced motion, governor "slow", heat tiers 3–4): no lace read, a soft static foam line and a damp band.
 */
// Oct 12 2026: the whole playable rectangle (x −152…864, z −318…300) plus a rim, so Summit Isle, its sandbar and every corner of
// the map's sea are covered (was x −132…752, z −296…256: +31% texels).
const MIN_X=-156,MIN_Z=-322,SIZE_X=1036,SIZE_Z=626,STEP=2,TILE=128,BAND_IN=-2.4,BAND_OUT=2.6;
const NX=SIZE_X,NZ=SIZE_Z,TX=SIZE_X/STEP,TZ=SIZE_Z/STEP;

/**
 * Height above the water (m, −0.5 … 1.5) on the 1 m grid, row k at z = MIN_Z + k + .5, from a top-down render of the ground.
 *
 * Thin things high overhead are not ground (Oct 14 2026, user: "not sure what this is to the left of the sand bar, remove this").
 * The zipline cable is baked into the static island chunks, so the top-down render read it, 16–24 m over the sandbar channel, as
 * a dotted line of tall land in the sea: each dot got its own foam ring (octagons: a 1 m cell's distance field), a pale shallow
 * patch round it from the ocean's depth gradient, and where it crosses Summit Isle's north beach the wet skirt under it turned to
 * dry sand, a hard-edged wedge poking into the water. So where the top-down height is OVERHEAD or more but only as a thin line
 * (gone after a 3×3 opening: a cable, a pole, a frond, never a building or the mountain), the cell takes the mean of the lower
 * ground round it (open sea counting as −0.5): open water under the cable, the beach under it where it crosses the sand, and
 * the slope unchanged at a ragged cell of the mountain's 3 m contour (its lower neighbours read 1.5 like it did).
 */
function sampleIslandHeights(renderer:T.WebGLRenderer,scene:T.Scene){
 const target=new T.WebGLRenderTarget(NX,NZ,{depthBuffer:true}),camera=new T.OrthographicCamera(-SIZE_X/2,SIZE_X/2,SIZE_Z/2,-SIZE_Z/2,1,300);
 const cx=MIN_X+SIZE_X/2,cz=MIN_Z+SIZE_Z/2;camera.position.set(cx,200,cz);camera.up.set(0,0,-1);camera.lookAt(cx,0,cz);camera.updateMatrixWorld();
 const material=heightMaterial(),hidden:T.Object3D[]=[],shown:T.Object3D[]=[];
 // Every ground chunk counts (the cay gate or focus mode may have hidden some); everything else is hidden for the one render.
 for(const o of scene.children){const ground=isGround(o);if(ground&&!o.visible){o.visible=true;shown.push(o);}else if(!ground&&o.visible){o.visible=false;hidden.push(o);}}
 const prev={target:renderer.getRenderTarget(),override:scene.overrideMaterial,auto:renderer.shadowMap.autoUpdate,needs:renderer.shadowMap.needsUpdate,clear:renderer.getClearColor(new T.Color()),alpha:renderer.getClearAlpha(),bg:scene.background};
 const pixels=new Uint8Array(NX*NZ*4);
 try{
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;scene.overrideMaterial=material;scene.background=null;
  renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,camera);
  renderer.readRenderTargetPixels(target,0,0,NX,NZ,pixels);
 }finally{
  renderer.setRenderTarget(prev.target);scene.overrideMaterial=prev.override;scene.background=prev.bg;renderer.setClearColor(prev.clear,prev.alpha);
  renderer.shadowMap.autoUpdate=prev.auto;renderer.shadowMap.needsUpdate=prev.needs;for(const o of hidden)o.visible=true;for(const o of shown)o.visible=false;target.dispose();material.dispose();
 }
 // Pixel row j (from the bottom) looks at z = maxZ − (j + .5) (camera up is −Z): flip into z-ascending rows.
 const lift=new Float32Array(NX*NZ),high=new Uint8Array(NX*NZ),drawn=new Uint8Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const p=(j*NX+i)*4,k=(NZ-1-j)*NX+i;lift[k]=(pixels[p]+pixels[p+1]/255)/255*2-.5;high[k]=pixels[p+2]>127?1:0;drawn[k]=pixels[p+3]>127?1:0;}
 dropOverheadLines(lift,high,drawn,NX,NZ);
 return lift;
}
/**
 * Thin overhead lines out of a w×h height grid (in place): `high` cells (OVERHEAD or more over the water) not covered by any 3×3
 * block of high cells take the mean of their lower 8-neighbours (undrawn ones, open sea, count as −0.5). Exported for the tests.
 */
export function dropOverheadLines(lift:Float32Array,high:Uint8Array,drawn:Uint8Array,w:number,h:number){
 const core=new Uint8Array(w*h),top=lift.slice();
 for(let z=1;z<h-1;z++)for(let x=1;x<w-1;x++){let all=1;for(let dz=-1;dz<=1&&all;dz++)for(let dx=-1;dx<=1;dx++)if(!high[(z+dz)*w+x+dx]){all=0;break;}core[z*w+x]=all;}
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const k=z*w+x;if(!high[k])continue;
  let kept=false;for(let dz=-1;dz<=1&&!kept;dz++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,zz=z+dz;if(xx>=0&&zz>=0&&xx<w&&zz<h&&core[zz*w+xx]){kept=true;break;}}
  if(kept)continue;
  let sum=0,n=0;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=w||zz>=h)continue;const i=zz*w+xx;if(high[i])continue;sum+=drawn[i]?top[i]:-.5;n++;}
  lift[k]=n?sum/n:-.5;}
 return lift;
}
/** Felzenszwalb–Huttenlocher 1D squared distance transform over `n` samples. */
function edt1(f:Float64Array,n:number,d:Float64Array,v:Int32Array,z:Float64Array){
 let k=0;v[0]=0;z[0]=-Infinity;z[1]=Infinity;
 for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=z[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);}k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
 k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])*(q-v[k])+f[v[k]];}
}
/** Euclidean distance (texels) to the nearest feature texel on a w×h grid. */
function distanceTo(feature:Uint8Array,w:number,h:number){
 const INF=1e12,m=Math.max(w,h),out=new Float32Array(w*h),f=new Float64Array(m),d=new Float64Array(m),v=new Int32Array(m),z=new Float64Array(m+1);
 for(let i=0;i<w*h;i++)out[i]=feature[i]?0:INF;
 for(let x=0;x<w;x++){for(let y=0;y<h;y++)f[y]=out[y*w+x];edt1(f,h,d,v,z);for(let y=0;y<h;y++)out[y*w+x]=d[y];}
 for(let y=0;y<h;y++){for(let x=0;x<w;x++)f[x]=out[y*w+x];edt1(f,w,d,v,z);for(let x=0;x<w;x++)out[y*w+x]=Math.sqrt(d[x]);}
 return out;
}

/** Signed distance (m, + sea) to the land cells of `land` (1 m grid). */
function signedDistance(land:Uint8Array){
 const n=NX*NZ,water=new Uint8Array(n);for(let i=0;i<n;i++)water[i]=1-land[i];
 const toLand=distanceTo(land,NX,NZ),toWater=distanceTo(water,NX,NZ),sdf=new Float32Array(n);
 for(let i=0;i<n;i++)sdf[i]=land[i]?-(toWater[i]-.5):toLand[i]-.5;
 return {sdf,toWater};
}
/** Land for the drawn waterline: above the water, except the low sand skirts sloping into the sea (SHORE_VIS_LIFT) within 4 m of
 *  it (so a low ramp inland never becomes a pond). `toWater`: distance (m) to the true water.
 *  A boulder (or any rough ground over SHORE_HIGH) next to a gentle sand skirt isn't let spike that skirt's slope reading (it
 *  wasn't the skirt that got steep, the neighbour is just tall): such a neighbour reads as the cell's own height instead, so the
 *  skirt right round a rock still measures as the same gentle slope and counts as sea (Oct 13 2026, "sand sticking out in the
 *  water" round every boulder: without this, flat sand wedges stood past the foam, hard-edged, next to each rock). */
function visibleLand(lift:Float32Array,toWater:Float32Array){
 const land=new Uint8Array(NX*NZ);
 const near=(i:number,h:number)=>lift[i]>SHORE_HIGH?h:lift[i];
 for(let z=0;z<NZ;z++)for(let x=0;x<NX;x++){const i=z*NX+x,h=lift[i];if(h<=SHORE_LAND_LIFT)continue;if(h>=SHORE_VIS_LIFT||toWater[i]>4){land[i]=1;continue;}
  const gx=Math.abs(near(z*NX+Math.min(NX-1,x+1),h)-near(z*NX+Math.max(0,x-1),h))/2,gz=Math.abs(near(Math.min(NZ-1,z+1)*NX+x,h)-near(Math.max(0,z-1)*NX+x,h))/2,g=Math.max(gx,gz);
  land[i]=g>SHORE_VIS_SLOPE[0]&&g<SHORE_VIS_SLOPE[1]?0:1;}
 return land;
}
/** Two separable 1-2-1 passes (σ ≈ 1 m): the 1 m distance field's stair steps become one smooth curve. */
function smooth121(f:Float32Array,w:number,h:number,passes:number){
 const tmp=new Float32Array(w*h);
 for(let p=0;p<passes;p++){
  for(let y=0;y<h;y++){const r=y*w;for(let x=0;x<w;x++)tmp[r+x]=(f[r+Math.max(0,x-1)]+2*f[r+x]+f[r+Math.min(w-1,x+1)])/4;}
  for(let y=0;y<h;y++){const a=Math.max(0,y-1)*w,b=y*w,c=Math.min(h-1,y+1)*w;for(let x=0;x<w;x++)f[b+x]=(tmp[a+x]+2*tmp[b+x]+tmp[c+x])/4;}
 }
}
/**
 * The field: 1 m signed distances + lift (CPU, for the strip) and the 2 m texture (GPU, for the shaders).
 * Two waterlines (beach waves, Oct 12 2026: "the waves don't look good here"): `sdf` is the true one (where the ocean plane meets
 * the ground: the strip's drape and its fade into the ocean), `vis` the one drawn. Every beach ends in a sand skirt sloping 1–3 m
 * into the sea (fields.ts, coralCayWorld.ts); measured from the true waterline the foam lapped up that skirt and the skirt read as
 * a tan, faceted step between the foam and the sea. `vis` is the edge of the flat sand (the skirt counts as sea), so the water, the foam
 * and the ocean's depth gradient start there and the strip paints the skirt as shallow water.
 */
function buildIslandField(renderer:T.WebGLRenderer,scene:T.Scene){
 const lift=sampleIslandHeights(renderer,scene);
 const n=NX*NZ,land=new Uint8Array(n);for(let i=0;i<n;i++)land[i]=lift[i]>SHORE_LAND_LIFT?1:0;
 const {sdf,toWater}=signedDistance(land),vis=signedDistance(visibleLand(lift,toWater)).sdf;smooth121(vis,NX,NZ,2);
 const hard=new Uint8Array(n);
 // A wall, kerb or deck within 3 m of the water: waves slap, they don't run up.
 for(let i=0;i<n;i++)hard[i]=sdf[i]<=0&&lift[i]>.4&&toWater[i]<=3?1:0;
 const toHard=distanceTo(hard,NX,NZ);
 // 2 m texture: 2×2 averages of the drawn waterline, then one light 3×3 pass.
 let coarse=new Float32Array(TX*TZ);const beach=new Float32Array(TX*TZ);
 for(let y=0;y<TZ;y++)for(let x=0;x<TX;x++){const a=(2*y)*NX+2*x,b=a+NX;coarse[y*TX+x]=(vis[a]+vis[a+1]+vis[b]+vis[b+1])/4;
  const h=Math.min(toHard[a],toHard[a+1],toHard[b],toHard[b+1]);beach[y*TX+x]=Math.min(1,Math.max(0,(h-1.5)/2.5));}
 {const next=new Float32Array(TX*TZ);for(let y=0;y<TZ;y++)for(let x=0;x<TX;x++){let sum=0,w=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=TX||yy>=TZ)continue;const k=dx||dy?1:2;sum+=coarse[yy*TX+xx]*k;w+=k;}next[y*TX+x]=sum/w;}coarse=next;}
 // Noise: ~14 m sets of waves along the shore (G) and ~5 m detail (B).
 const big=valueNoise(TX,7,7),small=valueNoise(TX,2.5,11),data=new Uint16Array(TX*TZ*4),h16=T.DataUtils.toHalfFloat;
 for(let i=0;i<TX*TZ;i++){data[i*4]=h16(coarse[i]);data[i*4+1]=h16(big[i]);data[i*4+2]=h16(small[i]);data[i*4+3]=h16(beach[i]);}
 const texture=new T.DataTexture(data,TX,TZ,T.RGBAFormat,T.HalfFloatType);texture.magFilter=texture.minFilter=T.LinearFilter;texture.generateMipmaps=false;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.needsUpdate=true;texture.name='island-shore-field';
 // The shader's copy of the true distance (the strip's fade into the ocean and its depth pull) is smoothed the same way.
 const sdfSmooth=sdf.slice();smooth121(sdfSmooth,NX,NZ,2);
 // The CPU copy of what the shaders read (Oct 19 2026, clear water window, lib/town/water/clearWindow.ts): the 2 m drawn-waterline
 // distance (the texture's R) and the highest ground in each 2 m cell (decks, rocks, sandbars). Two small arrays (~0.6 MB each).
 const high2=new Float32Array(TX*TZ);for(let y=0;y<TZ;y++)for(let x=0;x<TX;x++){const a=(2*y)*NX+2*x,b=a+NX;high2[y*TX+x]=Math.max(lift[a],lift[a+1],lift[b],lift[b+1]);}
 const cpu=isleCpuField(coarse,high2);
 return {sdf,sdfSmooth,vis,lift,texture,cpu,box:new T.Vector4(MIN_X,MIN_Z,SIZE_X,SIZE_Z)};
}
/** CPU lookups on the 2 m field, bilinear like the GPU's LinearFilter (texel centres), open sea (40 m) outside its rect. */
export type IsleCpuField={distance(x:number,z:number):number;lift(x:number,z:number):number};
function isleCpuField(dist:Float32Array,high:Float32Array):IsleCpuField{
 const at=(f:Float32Array,x:number,z:number,out:number)=>{const fx=(x-MIN_X)/STEP-.5,fz=(z-MIN_Z)/STEP-.5;if(fx<0||fz<0||fx>TX-1||fz>TZ-1)return out;
  const ix=Math.min(TX-2,Math.floor(fx)),iz=Math.min(TZ-2,Math.floor(fz)),tx=fx-ix,tz=fz-iz,i=iz*TX+ix;
  return (f[i]*(1-tx)+f[i+1]*tx)*(1-tz)+(f[i+TX]*(1-tx)+f[i+TX+1]*tx)*tz;};
 return {distance:(x,z)=>at(dist,x,z,40),lift:(x,z)=>{const fx=Math.floor((x-MIN_X)/STEP),fz=Math.floor((z-MIN_Z)/STEP);return fx<0||fz<0||fx>=TX||fz>=TZ?-.5:high[fz*TX+fx];}};
}

// Oct 26 2026 shore foam pass (docs/SHORE_FOAM_OCT26.md): wave sets on an irregular clock (uSwashClock, waveSet), a high-water mark
// (darker damp line + bubbles that pop) after each wave, the foam edge breaking into lacy patches as it slows and slides back, thin
// foam tinted see-through aqua, desktop glints, the player/ball interaction block (shoreFoamFx.ts), and no lace fetch far away.
// Same two texture reads as before (field + one lace fetch, now four noises in it), one fewer far from the camera.
const STRIP_GLSL=/* glsl */`
 vec4 sh=isleSample(vWaterXZ);float n1=sh.g,n2=sh.b,beach=sh.a;
 // Inside a fishing box the fishing strip draws the shore instead (same fade, opposite sense).
 float own=1.-uShore*shoreEdge(vWaterXZ);
 // d: the drawn waterline (the flat sand's edge, + sea); dt: the true one. The strip never climbs a deck, a kerb or a rock (high),
 // and past the true waterline it fades into the ocean, whose depth gradient starts from the same drawn line.
 float t=uWaterTime,d=vVis,dt=vTrue,high=1.-smoothstep(.38,.42,vLift),outA=1.-smoothstep(.2,1.7,dt),bandA=1.-smoothstep(1.9,2.5,dt);
 vec3 wetSand=vec3(.5,.36,.17),sheetC=vec3(.36,.78,.86),shallowC=vec3(.04,.46,.6),foamC=vec3(.97,.98,.96);
 vec4 lz=vec4(.5);float lace=.5,e,rush,wet,breaker=0.,mark=0.,markBub=0.,sparkle=0.;
 if(uWaterDetail<.5){
  // Still: the water a little way up the sand, a soft foam band and a damp band behind it.
  e=-.25;rush=.5;wet=smoothstep(-1.4,-.2,d-e)*.5*high;
 }else{
  // One fetch of the four baked noises; none past STRIP_FAR (gradients taken outside the branch, so the mip choice stays right).
  vec2 luv=vWaterXZ*.19+vec2(t*.004,t*.002),gx=dFdx(luv),gy=dFdy(luv);
  if(vFar<.999)lz=mix(textureGrad(uWaterNoise,luv,gx,gy),vec4(.5),vFar);
  lace=lz.g;
  // The swash cycle, in step with the ocean's swell (same irregular clock, same phase offset n1); each wave runs up a different
  // height (blended between neighbouring noise bands so nothing seams along the beach), and every few waves a set runs further.
  float cyc=uSwashClock+n1*.35,ci=floor(cyc),ph=fract(cyc);const float UP=.32;
  float nb=n2*3.,fb=floor(nb),amp=(.6+.4*mix(waterHash(ci+fb),waterHash(ci+fb+1.),smoothstep(0.,1.,nb-fb)))*waveSet(ci);
  float reachB=mix(.3,1.5*(.75+.5*n2),beach)*high,reachM=min(reachB*amp,1.95);
  float r=ph<UP?sin(1.5708*ph/UP):pow(1.-(ph-UP)/(1.-UP),1.4);
  e=.1-reachM*r;rush=ph<UP?mix(.5,1.,smoothstep(0.,.1,ph)):.25+.75*r;
  // Wet sand: when did the backwash last uncover this point? Dries over ~2.5 s; a damp band always stays by the water.
  // Uses the mean wave height (not this wave's), so nothing jumps where one wave hands over to the next along the beach.
  float reachW=reachB*.8,x=.1-d,rr=clamp(x/max(reachW,.01),0.,1.),phU=UP+(1.-UP)*(1.-pow(rr,1./1.4)),since=(ph>=phU?ph-phU:ph+1.-phU)*SWASH_P;
  wet=max(smoothstep(reachW+.15,reachW-.15,x)*exp(-since/2.4),smoothstep(reachW+.6,0.,x)*.45)*high;
  // High-water mark: where this wave topped out stays a darker damp line, edged with bubbles that pop over ~2.5 s; it has faded
  // before the next wave (no seam at the cycle's wrap).
  float markA=step(UP,ph)*exp(-max(ph-UP,0.)*SWASH_P/2.2)*(1.-smoothstep(.84,.98,ph))*high,ml=abs(x-reachM+.04+(lz.r-.5)*.14);
  mark=markA*(1.-smoothstep(.02,.13,ml));
  markBub=markA*(1.-smoothstep(.04,.3,ml))*smoothstep(.45+.4*(1.-markA),.6+.4*(1.-markA),lz.b);
  // The swell breaking over the slope just before it surges up the sand: a soft white line rolling in, a few small gaps in it
  // (fades out at the cycle's wrap: no seam along the beach).
  float dc=SWELL_L*(1.-ph)-.3,bl=1.-smoothstep(0.,.26+.06*dc,abs(d-dc));breaker=bl*bl*amp*smoothstep(3.2,1.,dc)*smoothstep(-.2,.6,dc)*smoothstep(.22,.5,lace+.08*n1)*.6;
  // Desktop only: a few glints twinkling on the thin sheet and the foam (one sine, no extra read).
  if(uWaterDetail>1.5)sparkle=smoothstep(.78,.95,lz.a)*smoothstep(.8,1.,sin(t*2.6+lz.r*31.+lz.b*17.));
 }
 // Soft, slightly irregular edge (5 m noise + the lace), never a jittery line.
 float u=d+(n2-.5)*.32+(lace-.5)*.16,cover=smoothstep(e-.05,e+.07,u),wd=max(u-e,0.);
 // Water: a clear sheet over the sand at its edge, turquoise over the sand slope and out to where the ocean takes over.
 vec3 waterC=mix(sheetC,shallowC,smoothstep(-.1,1.1,max(d,0.)+wd*.4));
 float waterA=mix(.5,.95,smoothstep(0.,.8,wd))*outA*mix(high,1.,smoothstep(-.2,.3,dt));
 // Inside the clear water window (clearWindow.ts) the sheet over the skirt thins, so the shallows read clear, not as a band.
 waterA*=1.-.55*clearWinMask(vWaterXZ,1.);
 wet=max(wet,mark*.8);
 vec3 col=mix(wetSand*(1.-.16*mark),waterC,cover);float alpha=max(cover*waterA,(1.-cover)*wet*.7);
 // Foam: a bright soft edge with some body that breaks into lacy patches as the wave slows and slides back (big lace R and the
 // bubbles B), lacy patches with bubble holes trailing behind it, and the bubbles left along the high-water mark.
 float fw=mix(.3,.75,rush);
 float edge=smoothstep(e-.1,e+.03,u)*(1.-smoothstep(e+.02,e+.02+fw*.5,u));
 float breakup=smoothstep(mix(.42,-.3,rush),mix(.64,-.08,rush),lz.r*.6+lz.b*.4);
 float trail=smoothstep(e,e+.12,u)*(1.-smoothstep(e+fw*.35,e+fw*1.4,u))*smoothstep(.42,.68,lace)*smoothstep(.3,.55,lz.b+.2*rush);
 float foam=max(edge*(.62+.33*rush)*breakup,trail*.7)*mix(smoothstep(.22,.55,lace+.15),1.,rush);
 foam=clamp(max(max(foam,markBub*.75*(1.-cover))*high,breaker*cover),0.,1.)*bandA;
 // The player and the ball (shoreFoamFx.ts): foam parts round the ankles, rings from steps and the ball. Uniform branch: off = free.
 if(uFoamFxOn>.5){vec2 fx=foamFx(vWaterXZ,max(cover,foam));foam=max(foam*(1.-fx.x),fx.y*high*bandA);}
 // Thin foam is see-through and picks up the water's aqua; thick foam is white.
 col=mix(col,mix(vec3(.78,.92,.94),foamC,smoothstep(.15,.75,foam)),foam);alpha=max(alpha,foam*(.6+.35*foam));
 diffuseColor=vec4(col,alpha*own);
 float waterLight=(foam*.2+sparkle*.55*max(cover*waterA,foam))*own;vec3 waterGlow=waterC*cover*.06*own;`;

/** The island shoreline: call `bake` once with the renderer (Town, at mount). `group` is a scenery root (world.setVisible). */
export function createIslandShore(group:T.Group){
 let noise:T.Texture|null=null,texture:T.Texture|null=null,cpu:IsleCpuField|null=null;const geometries:T.BufferGeometry[]=[];let material:T.MeshLambertMaterial|null=null;
 const stats={bakeMs:0,tiles:0,triangles:0,baked:false};
 return {
  stats,
  /** The baked field on the CPU (null before the bake). */
  get field(){return cpu;},
  bake(renderer:T.WebGLRenderer,scene:T.Scene){
   if(stats.baked)return;stats.baked=true;const t0=performance.now();
   const field=buildIslandField(renderer,scene);texture=field.texture;cpu=field.cpu;noise=laceNoise();
   setIsleField(field.texture,field.box);
   const {sdf,sdfSmooth,vis,lift}=field,rough=shoreRough(lift,NX,NZ,1),keepTall=(k:number)=>sdf[k]<=0&&lift[k]>.75;
   // Sand skirts drawn as shallow water (vis > 0, above the true water): shoreDrape keeps the strip off a boulder or a kerb and off
   // the ground next to it, which cut a tan hole round every rock on the causeway banks. Here the strip stays draped on the skirt,
   // on a rock at its foot (the lowest beach ground in 3×3), and the rock stands up through the water.
   // The same on the flat sand above the skirt (Oct 13 2026, "sand sticking out in the water" / "the ground is sticking out under
   // the rocks" on Summit Isle's headlands): a boulder a metre or two up the beach is within shoreDrape's reach of the water, so the
   // sand round it (0.3 m over the sea) had its strip vertices sunk to the water, under the sand. The strip's triangles dived into
   // the beach there, and each rock had flat, dry, hard-edged sand wedges cut out of the wet band and foam on its seaward side.
   // Ground standing clear of the water (over DRY m) keeps the strip draped on it, right up to the rock.
   const DRY=.06;
   const skirtDrape=(x:number,z:number,drape:[number,number,number]):[number,number,number]=>{const k=z*NX+x;if(sdf[k]>0)return drape;
    const h=Math.max(0,lift[k]),skirt=vis[k]>0;
    // Sand (even when it's rough only for the rock beside it) that the drape left under the ground: back on the sand.
    if(h<=SHORE_HIGH&&(skirt||h>DRY)&&drape[0]<WATER_Y+h-.01)return [WATER_Y+h+.02,h,0];
    if(drape[1]<SHORE_HIGH)return drape;
    // The rock's own cells: on the lowest sand round them (under the rock).
    let low=Infinity;
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=NX||zz>=NZ)continue;const i=zz*NX+xx;if(!rough[i])low=Math.min(low,Math.max(0,lift[i]));}
    return (skirt?low<SHORE_VIS_LIFT:low>DRY&&low<=SHORE_HIGH)?[WATER_Y+low+.02,low,0]:drape;};
   // shoreDrape's `open` (the depth pull) is 0 within 2 m of any rough ground, so rocks and piles in the water keep their crisp
   // edge. A boulder up on the dry beach isn't in the water: there the pull stays on, or the beach's slope creases poke little sand
   // teeth through the unpulled strip beside it. Only rough ground within 1.5 m of the true waterline turns it off.
   const wetRough=new Uint8Array(NX*NZ);for(let i=0;i<NX*NZ;i++)wetRough[i]=rough[i]&&sdf[i]>-1.5?1:0;
   const nearWetRough=(x:number,z:number)=>{for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,zz=z+dz;if(xx>=0&&zz>=0&&xx<NX&&zz<NZ&&wetRough[zz*NX+xx])return true;}return false;};
   // Quads in the band, bucketed into 128 m tiles.
   const tiles=new Map<number,{index:Map<number,number>;positions:number[];lifts:number[];shores:number[];viss:number[];opens:number[];indices:number[]}>();
   const tileOf=(x:number,z:number)=>{const key=Math.floor(x/TILE)*1000+Math.floor(z/TILE);let t=tiles.get(key);if(!t){t={index:new Map(),positions:[],lifts:[],shores:[],viss:[],opens:[],indices:[]};tiles.set(key,t);}return t;};
   // A boulder's rim on the dry beach (sand over DRY m beside it) isn't skipped like a deck: its quads are drawn on that sand (under
   // the rock), so the wet band and the foam run right up to the rock instead of stopping a texel short in a dry notch.
   const rockOnSand=(k:number)=>{if(vis[k]>0)return false;const x=k%NX,z=(k-x)/NX;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=NX||zz>=NZ)continue;const i=zz*NX+xx;if(!rough[i]&&lift[i]>DRY&&lift[i]<=SHORE_HIGH)return true;}return false;};
   const skip=(k:number)=>keepTall(k)&&!rockOnSand(k);
   for(let z=0;z<NZ-1;z++)for(let x=0;x<NX-1;x++){
    const c0=z*NX+x,c1=c0+1,c2=c0+NX,c3=c2+1;
    // The band: from up the beach of the drawn waterline (the swash's reach) out past the true one (the fade into the ocean).
    const lo=Math.min(sdf[c0],sdf[c1],sdf[c2],sdf[c3]),hi=Math.max(vis[c0],vis[c1],vis[c2],vis[c3]);
    if(!(lo<BAND_OUT&&hi>BAND_IN)||skip(c0)||skip(c1)||skip(c2)||skip(c3))continue;
    const tile=tileOf(x,z);
    const vertex=(k:number)=>{let i=tile.index.get(k);if(i===undefined){i=tile.positions.length/3;tile.index.set(k,i);const kx=k%NX,kz=(k-kx)/NX,[y,h,open]=skirtDrape(kx,kz,shoreDrape(lift,sdf,rough,NX,NZ,kx,kz,WATER_Y,STRIP_Y,2));
     tile.positions.push(MIN_X+kx+.5,y,MIN_Z+kz+.5);tile.lifts.push(h);tile.shores.push(sdfSmooth[k]);tile.viss.push(vis[k]);tile.opens.push(open||!nearWetRough(kx,kz)?1:0);}return i;};
    const a=vertex(c0),b=vertex(c1),c=vertex(c2),d=vertex(c3);tile.indices.push(a,c,b,b,c,d);
   }
   material=new T.MeshLambertMaterial({color:'#ffffff',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
   const waterNoise=noise;
   material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,WATER_UNIFORMS,CLEAR_WIN_UNIFORMS,SHORE_FOAM_UNIFORMS,{uWaterNoise:{value:waterNoise}});
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float lift,shore,vis,open;varying float vLift,vOpen,vVis,vTrue,vFar;varying vec2 vWaterXZ;'+SHORE_PULL_GLSL)
     .replace('#include <project_vertex>','#include <project_vertex>\nvLift=lift;vWaterXZ=(modelMatrix*vec4(transformed,1.)).xz;vOpen=open;vVis=vis;vTrue=shore;vFar=smoothstep('+STRIP_FAR.near.toFixed(1)+','+STRIP_FAR.far.toFixed(1)+',-mvPosition.z);shorePull(mvPosition,shore,open);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLift,vOpen,vVis,vTrue,vFar;varying vec2 vWaterXZ;uniform sampler2D uWaterNoise;\n'+SHORE_GLSL+CLEAR_WIN_GLSL+SHORE_FOAM_GLSL)
     .replace('#include <map_fragment>',STRIP_GLSL)
     .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=waterLight*vec3(1.,.97,.9)+waterGlow;');
   };
   material.customProgramCacheKey=()=>'island-shore-strip-v6';
   for(const tile of tiles.values()){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(tile.positions,3));g.setAttribute('lift',new T.Float32BufferAttribute(tile.lifts,1));g.setAttribute('shore',new T.Float32BufferAttribute(tile.shores,1));g.setAttribute('vis',new T.Float32BufferAttribute(tile.viss,1));g.setAttribute('open',new T.Float32BufferAttribute(tile.opens,1));
    g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(tile.positions.length).map((_,i)=>i%3===1?1:0),3));g.setIndex(tile.indices);g.computeBoundingSphere();geometries.push(g);
    const mesh=new T.Mesh(g,material);mesh.name='island-shore-water';mesh.renderOrder=.5;mesh.matrixAutoUpdate=false;mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};mesh.updateMatrix();group.add(mesh);
    stats.triangles+=tile.indices.length/3;
   }
   stats.tiles=tiles.size;stats.bakeMs=Math.round(performance.now()-t0);
  },
  /** Debug A/B only (`__fi2.islandWater.enabled=false`): hides the strip and the field. */
  set enabled(on:boolean){group.visible=on;setIsleField(on?texture:null,null);},
  dispose(){setIsleField(null,null);for(const g of geometries)g.dispose();geometries.length=0;material?.dispose();texture?.dispose();noise?.dispose();group.clear();},
 };
}
