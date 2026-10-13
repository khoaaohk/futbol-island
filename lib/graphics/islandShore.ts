import * as T from 'three';
import {WATER_UNIFORMS,SHORE_GLSL,SHORE_PULL_GLSL,SHORE_LAND_LIFT,setIsleField,shoreDrape,shoreRough} from './waterSurface';

// Self-contained (the fishing shoreline in lib/town/fishing/shoreWater.ts has its own copies and its own owner).
const WATER_Y=-.42,STRIP_Y=-.403;
/** Only the static ground: opaque island chunks and the island base meshes. */
const GROUND=new Set(['curved-island-foundation','interior-island-grass','continuous-sandy-shore']);
const isGround=(o:T.Object3D)=>(o instanceof T.Mesh)&&(GROUND.has(o.name)||o.name.startsWith('island-chunk-')&&!(Array.isArray(o.material)?o.material.some(m=>m.transparent):o.material.transparent));
function heightMaterial(){
 return new T.ShaderMaterial({uniforms:{uWater:{value:WATER_Y}},
  vertexShader:'varying float vY;void main(){vec4 p=vec4(position,1.);\n#ifdef USE_INSTANCING\np=instanceMatrix*p;\n#endif\nvec4 w=modelMatrix*p;vY=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float uWater;varying float vY;void main(){float v=clamp((vY-uWater+.5)/2.,0.,1.)*255.;gl_FragColor=vec4(floor(v)/255.,fract(v),0.,1.);}',side:T.DoubleSide});
}
/** Smooth value noise on an n×n grid (lattice every `cell` texels). */
function valueNoise(n:number,cell:number,seed:number){
 const g=Math.ceil(n/cell)+2,lattice=new Float32Array(g*g);let s=seed;for(let i=0;i<lattice.length;i++){s=(s*16807)%2147483647;lattice[i]=s/2147483647;}
 const out=new Float32Array(n*n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
  const a=lattice[iy*g+ix],b=lattice[iy*g+ix+1],c=lattice[(iy+1)*g+ix],d=lattice[(iy+1)*g+ix+1];out[y*n+x]=(a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy;}
 return out;
}
/** Tileable 64² foam-lace noise (one channel, RepeatWrapping, mipmapped). */
function laceNoise(){
 const n=64,a=valueNoise(n,8,3),b=valueNoise(n,3,5),data=new Uint8Array(n*n*4);
 const tile=(f:Float32Array,x:number,y:number)=>{const wx=Math.sin(Math.PI*x/n)**2,wy=Math.sin(Math.PI*y/n)**2,h=n/2;
  return (f[y*n+x]*wx+f[y*n+(x+h)%n]*(1-wx))*wy+(f[((y+h)%n)*n+x]*wx+f[((y+h)%n)*n+(x+h)%n]*(1-wx))*(1-wy);};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=Math.round(Math.min(1,Math.max(0,(tile(a,x,y)*.65+tile(b,x,y)*.35-.2)*1.6))*255),i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
 const t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;t.name='island-shore-lace';
 return t;
}

/**
 * Island-wide moving shoreline ("tier B", Oct 12 2026; docs/performance-guide.md "Island-wide moving water").
 *
 * Baked ONCE when Town first mounts the world (no per-frame CPU, no render targets after the bake):
 * 1. One top-down render (1 m texels, 884×552, opaque island ground only, no shadows) reads the real waterline everywhere: the main
 *    island's beaches and seawall, Coral Cay's sloping skirt, the causeway and sandbars, the East Pier's rock armour and boulders,
 *    the ferry dock. (There are no ponds or rivers.) Exact Euclidean distance transforms give a signed distance-to-shore (m).
 * 2. A 2 m half-float RGBA texture (442×276, ~1 MB): R signed distance (+ sea, − land), G/B static noise, A "beach" (1) or hard edge
 *    (0: seawalls, pier kerbs, the dock), shared with the ocean shader (waterSurface.ts: depth gradient, drifting ripple lines,
 *    whitecaps, desktop sparkles).
 * 3. One strip mesh along every shore (−3.5 … +3 m, 1 m grid, split into 128 m tiles so each is frustum-culled), drawing the swash:
 *    a foam edge lapping up the sand and sliding back on the swell's 5.6 s cycle (each wave a different height), the wet sand it
 *    leaves, white water where the swell breaks and clear shallows with the sand showing through. Scaled for the island camera
 *    (~40 m away): a wider foam line and a longer run-up than the fishing strip, no caustics. Inside a fishing box it fades out and
 *    the fishing strip (lib/town/fishing/shoreWater.ts) takes over.
 * Detail 0 (reduced motion, governor "slow", heat tiers 3–4): no lace read, a soft static foam line and a damp band.
 */
const MIN_X=-132,MIN_Z=-296,SIZE_X=884,SIZE_Z=552,STEP=2,TILE=128,BAND_IN=-3.5,BAND_OUT=3;
const NX=SIZE_X,NZ=SIZE_Z,TX=SIZE_X/STEP,TZ=SIZE_Z/STEP;

/** Height above the water (m, −0.5 … 1.5) on the 1 m grid, row k at z = MIN_Z + k + .5, from one top-down render. */
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
  renderer.setRenderTarget(target);renderer.setClearColor(0x000000,1);renderer.clear();renderer.render(scene,camera);
  renderer.readRenderTargetPixels(target,0,0,NX,NZ,pixels);
 }finally{
  renderer.setRenderTarget(prev.target);scene.overrideMaterial=prev.override;scene.background=prev.bg;renderer.setClearColor(prev.clear,prev.alpha);
  renderer.shadowMap.autoUpdate=prev.auto;renderer.shadowMap.needsUpdate=prev.needs;for(const o of hidden)o.visible=true;for(const o of shown)o.visible=false;target.dispose();material.dispose();
 }
 // Pixel row j (from the bottom) looks at z = maxZ − (j + .5) (camera up is −Z): flip into z-ascending rows.
 const lift=new Float32Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const p=(j*NX+i)*4;lift[(NZ-1-j)*NX+i]=(pixels[p]+pixels[p+1]/255)/255*2-.5;}
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

/** The field: 1 m signed distance + lift (CPU, for the strip) and the 2 m texture (GPU, for the shaders). */
function buildIslandField(renderer:T.WebGLRenderer,scene:T.Scene){
 const lift=sampleIslandHeights(renderer,scene),n=NX*NZ;
 const land=new Uint8Array(n),water=new Uint8Array(n),hard=new Uint8Array(n);
 for(let i=0;i<n;i++){land[i]=lift[i]>SHORE_LAND_LIFT?1:0;water[i]=1-land[i];}
 const toLand=distanceTo(land,NX,NZ),toWater=distanceTo(water,NX,NZ),sdf=new Float32Array(n);
 for(let i=0;i<n;i++){sdf[i]=land[i]?-(toWater[i]-.5):toLand[i]-.5;/* a wall, kerb or deck within 3 m of the water: waves slap, they don't run up */hard[i]=land[i]&&lift[i]>.4&&toWater[i]<=3?1:0;}
 const toHard=distanceTo(hard,NX,NZ);
 // 2 m texture: 2×2 averages, then one light 3×3 pass so the swash edge follows a smooth curve.
 let coarse=new Float32Array(TX*TZ);const beach=new Float32Array(TX*TZ);
 for(let y=0;y<TZ;y++)for(let x=0;x<TX;x++){const a=(2*y)*NX+2*x,b=a+NX;coarse[y*TX+x]=(sdf[a]+sdf[a+1]+sdf[b]+sdf[b+1])/4;
  const h=Math.min(toHard[a],toHard[a+1],toHard[b],toHard[b+1]);beach[y*TX+x]=Math.min(1,Math.max(0,(h-1.5)/2.5));}
 {const next=new Float32Array(TX*TZ);for(let y=0;y<TZ;y++)for(let x=0;x<TX;x++){let sum=0,w=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=TX||yy>=TZ)continue;const k=dx||dy?1:2;sum+=coarse[yy*TX+xx]*k;w+=k;}next[y*TX+x]=sum/w;}coarse=next;}
 // Noise: ~14 m sets of waves along the shore (G) and ~5 m detail (B).
 const big=valueNoise(TX,7,7),small=valueNoise(TX,2.5,11),data=new Uint16Array(TX*TZ*4),h16=T.DataUtils.toHalfFloat;
 for(let i=0;i<TX*TZ;i++){data[i*4]=h16(coarse[i]);data[i*4+1]=h16(big[i]);data[i*4+2]=h16(small[i]);data[i*4+3]=h16(beach[i]);}
 const texture=new T.DataTexture(data,TX,TZ,T.RGBAFormat,T.HalfFloatType);texture.magFilter=texture.minFilter=T.LinearFilter;texture.generateMipmaps=false;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.needsUpdate=true;texture.name='island-shore-field';
 return {sdf,lift,texture,box:new T.Vector4(MIN_X,MIN_Z,SIZE_X,SIZE_Z)};
}

const STRIP_GLSL=/* glsl */`
 vec4 sh=isleSample(vWaterXZ);float d=sh.r,n1=sh.g,n2=sh.b,beach=sh.a;
 // Inside a fishing box the fishing strip draws the shore instead (same fade, opposite sense).
 float own=1.-uShore*shoreEdge(vWaterXZ);
 float t=uWaterTime,sea=smoothstep(-.15,.35,d);
 vec3 wetSand=vec3(.42,.3,.14),thru=vec3(.2,.55,.58),sheet=vec3(.22,.42,.4),foamC=vec3(.97,.98,.96);
 vec3 col;float alpha,foam;
 // Seam fix (Oct 12 2026): near-opaque across the waterline itself, so the edge is this smooth field curve and never the ocean
 // plane's or the strip's own cut through the sand's facets; the land side fades out before it climbs a deck or a rock.
 float high=1.-smoothstep(.38,.42,vLift),edgeA=smoothstep(-.75,-.25,d)*(1.-smoothstep(.7,1.6,d))*mix(1.,high,1.-sea)*vOpen*.94;
 if(uWaterDetail<.5){
  // Still: a soft foam line just up the sand, a damp band behind it and clear shallows in front.
  float u=-d+(n2-.5)*.35;foam=exp(-abs(u-.3)/.2)*.8*smoothstep(-.6,.1,-d+.6);
  float wet=smoothstep(1.4,-.2,u)*(1.-sea)*.45*high;
  col=mix(wetSand,thru,sea);alpha=max(max(sea*mix(.85,.45,smoothstep(.2,1.,d))*(1.-smoothstep(.4,2.6,d)),wet),edgeA);
 }else{
  float lace=texture2D(uWaterNoise,vWaterXZ*.13+vec2(t*.004,t*.002)).g;
  // The swash cycle, in step with the ocean's swell (same phase offset n1); each wave runs up a different height.
  float cyc=t/SWASH_P+n1*.35,ci=floor(cyc),ph=fract(cyc);const float UP=.3;
  // Wave heights vary along the shore without seams: blend the per-wave hash between neighbouring noise bands.
  float nb=n2*3.,fb=floor(nb),amp=.62+.38*mix(waterHash(ci+fb),waterHash(ci+fb+1.),smoothstep(0.,1.,nb-fb));
  float reachB=mix(.35,2.3*(.7+.6*n2),beach)*high,reachM=reachB*amp;
  float r=ph<UP?sin(1.5708*ph/UP):pow(1.-(ph-UP)/(1.-UP),1.6);
  float front=reachM*r-.15,u=-d+(lace-.5)*.45+(n2-.5)*.3;
  float covered=(1.-smoothstep(front-.08,front+.08,u))*(1.-sea),behind=front-u;
  float fw=.2+.13*r,rush=ph<UP?mix(.45,1.,smoothstep(0.,.08,ph)):.45+.55*r;
  float foamFront=exp(-abs(u-front)/fw)*rush*smoothstep(-.1,.4,lace+.1)*smoothstep(-.3,.2,-d+.7)*1.1;
  float trail=covered*smoothstep(1.,0.,behind)*smoothstep(.5,.8,lace)*rush*.45;
  // Wet sand: when did the backwash last uncover this point? Dries over ~2.5 s; a damp band always stays near the water.
  // Uses the mean wave height (not this wave's), so nothing jumps where one wave hands over to the next along the beach.
  float reachW=reachB*.81,uu=clamp((u+.15)/max(reachW,.01),0.,1.),phU=UP+(1.-UP)*(1.-pow(uu,1./1.6)),since=(ph>=phU?ph-phU:ph+1.-phU)*SWASH_P;
  float wet=max(smoothstep(reachW+.1,reachW-.1,u)*exp(-since/2.6)*(1.-covered),smoothstep(reachW*1.15+.3,-.3,u)*.38)*high*(1.-smoothstep(-.2,.2,d));
  // The swell breaking: a white band rolls in over the last metres, then churns at the waterline as the swash starts. Both fade
  // to nothing at the cycle's wrap (ph 0/1), so no seam shows where neighbouring stretches of beach are on different waves.
  float dc=SWELL_L*(1.-ph),breaker=exp(-abs(d-dc)/(.4+.25*dc))*smoothstep(3.,.6,dc)*smoothstep(0.,.9,dc)*smoothstep(.3,.7,lace+.15)*step(-.2,d)*.8;
  float churn=smoothstep(1.4,0.,d)*step(-.3,d)*smoothstep(0.,.05,ph)*(1.-smoothstep(.06,.25,ph))*smoothstep(.3,.65,lace)*.8;
  col=mix(wetSand,mix(sheet,thru,sea),max(sea,covered));
  alpha=max(max(sea*mix(.85,.45,smoothstep(.2,1.,d))*(1.-smoothstep(.4,2.6,d)),edgeA),max(covered*(.3+.3*smoothstep(0.,1.1,behind)),wet*.55));
  foam=clamp(max(max(foamFront,trail),max(breaker,churn)),0.,1.);
 }
 col=mix(col,foamC,foam);alpha=max(alpha,foam*.92);
 diffuseColor=vec4(col,alpha*own);
 float waterLight=foam*.22*own;vec3 waterGlow=col*sea*.2*own;`;

/** The island shoreline: call `bake` once with the renderer (Town, at mount). `group` is a scenery root (world.setVisible). */
export function createIslandShore(group:T.Group){
 let noise:T.Texture|null=null,texture:T.Texture|null=null;const geometries:T.BufferGeometry[]=[];let material:T.MeshLambertMaterial|null=null;
 const stats={bakeMs:0,tiles:0,triangles:0,baked:false};
 return {
  stats,
  bake(renderer:T.WebGLRenderer,scene:T.Scene){
   if(stats.baked)return;stats.baked=true;const t0=performance.now();
   const field=buildIslandField(renderer,scene);texture=field.texture;noise=laceNoise();
   setIsleField(field.texture,field.box);
   const {sdf,lift}=field,rough=shoreRough(lift,NX,NZ,1),keepTall=(k:number)=>sdf[k]<=0&&lift[k]>.75;
   // Quads in the band, bucketed into 128 m tiles.
   const tiles=new Map<number,{index:Map<number,number>;positions:number[];lifts:number[];shores:number[];opens:number[];indices:number[]}>();
   const tileOf=(x:number,z:number)=>{const key=Math.floor(x/TILE)*1000+Math.floor(z/TILE);let t=tiles.get(key);if(!t){t={index:new Map(),positions:[],lifts:[],shores:[],opens:[],indices:[]};tiles.set(key,t);}return t;};
   for(let z=0;z<NZ-1;z++)for(let x=0;x<NX-1;x++){
    const c0=z*NX+x,c1=c0+1,c2=c0+NX,c3=c2+1;
    const lo=Math.min(sdf[c0],sdf[c1],sdf[c2],sdf[c3]),hi=Math.max(sdf[c0],sdf[c1],sdf[c2],sdf[c3]);
    if(!(lo<BAND_OUT&&hi>BAND_IN)||keepTall(c0)||keepTall(c1)||keepTall(c2)||keepTall(c3))continue;
    const tile=tileOf(x,z);
    const vertex=(k:number)=>{let i=tile.index.get(k);if(i===undefined){i=tile.positions.length/3;tile.index.set(k,i);const kx=k%NX,kz=(k-kx)/NX,[y,h,open]=shoreDrape(lift,sdf,rough,NX,NZ,kx,kz,WATER_Y,STRIP_Y,2);
     tile.positions.push(MIN_X+kx+.5,y,MIN_Z+kz+.5);tile.lifts.push(h);tile.shores.push(sdf[k]);tile.opens.push(open);}return i;};
    const a=vertex(c0),b=vertex(c1),c=vertex(c2),d=vertex(c3);tile.indices.push(a,c,b,b,c,d);
   }
   material=new T.MeshLambertMaterial({color:'#ffffff',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
   const waterNoise=noise;
   material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,WATER_UNIFORMS,{uWaterNoise:{value:waterNoise}});
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float lift,shore,open;varying float vLift,vOpen;varying vec2 vWaterXZ;'+SHORE_PULL_GLSL)
     .replace('#include <project_vertex>','#include <project_vertex>\nvLift=lift;vWaterXZ=(modelMatrix*vec4(transformed,1.)).xz;vOpen=open;shorePull(mvPosition,shore,open);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLift,vOpen;varying vec2 vWaterXZ;uniform sampler2D uWaterNoise;\n'+SHORE_GLSL)
     .replace('#include <map_fragment>',STRIP_GLSL)
     .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=waterLight*vec3(1.,.97,.9)+waterGlow;');
   };
   material.customProgramCacheKey=()=>'island-shore-strip-v2';
   for(const tile of tiles.values()){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(tile.positions,3));g.setAttribute('lift',new T.Float32BufferAttribute(tile.lifts,1));g.setAttribute('shore',new T.Float32BufferAttribute(tile.shores,1));g.setAttribute('open',new T.Float32BufferAttribute(tile.opens,1));
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
