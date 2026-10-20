import * as T from 'three';
import {distanceToLandableDeck} from '../landableDecks';
import {WATER_UNIFORMS,SHORE_GLSL,SHORE_PULL_GLSL,SHORE_LAND_LIFT,setShore,shoreDrape,shoreRough} from '../../graphics/waterSurface';
import {dropOverheadLines} from '../../graphics/islandShore';
import {CLEAR_SHARE,UNDERWATER_GLSL,UW_UNIFORMS,buildSeabedProps,createOceanClear,reefSeed,reefTheme,type SeabedProps} from './underwater';

/**
 * Moving shoreline for the fishing view (Oct 12 2026, "animate the water so it's moving and washing ashore … more realistic").
 *
 * Built once per fishing spot when a session begins, from what is actually drawn there:
 * 1. ONE small top-down render (160², opaque island ground only, no shadows) reads the ground height round the spot, so the
 *    waterline is where the sand really meets the sea (main-island step, the cay's sloping skirt, piers, rocks), then a signed
 *    distance-to-shore field (metres, + at sea, − on land) is made from it on the CPU (exact Euclidean transform, lightly smoothed).
 *    G and B carry static noise, A says "beach" (1) or hard edge (0: piers, sea walls) so waves wash up sand but only slap a pier.
 * 2. The field is ONE half-float texture shared with the island ocean shader (lib/graphics/waterSurface.ts: rolling swells, depth
 *    gradient, sparkle) and with ONE strip mesh along the shore (−4.5 … +7.5 m) whose shader draws the swash: a thin, bright,
 *    irregular foam edge that runs up the sand and slides back on the swell's 5.6 s cycle (each wave a different height), the darker
 *    wet sand it leaves that dries out, the white water where the swell breaks, clear shallows with the sand showing through and
 *    moving caustics on the seabed.
 * Cost: one draw (+ the ocean's existing one), 3–4 texture reads per strip pixel (2–3 on phones), no render targets after the build,
 * no extra passes, time from the shared water clock (advances only when the island renders). Disposed with the fishing visuals.
 */
export const WATER_Y=-.42,STRIP_Y=-.403;
// SEA_OUT (Oct 13 2026, "cast farther out … make sure the underwater rendering's depth tint … handle the larger area"):
// 24 → 34 m so the clear, tinted strip (and its seabed/fish view-through) still covers a float cast up to ~29 m out,
// with a margin; FIELD_SIZE (the 80 m top-down field) already spans that without change.
const FIELD_SIZE=80,FIELD_N=160,BAND_IN=-4.2,BAND_OUT=4.7,SEA_OUT=34,COARSE=4;
export type ShoreField={box:T.Vector4;n:number;size:number;sdf:Float32Array;lift:Float32Array;texture:T.DataTexture;
 /** Bilinear signed distance (m) at a world point; large positive outside the box. */distance(x:number,z:number):number};

/** Only the static ground: opaque island chunks and the three island base meshes. */
const GROUND=new Set(['curved-island-foundation','interior-island-grass','continuous-sandy-shore']);
const isGround=(o:T.Object3D)=>(o instanceof T.Mesh)&&(GROUND.has(o.name)||o.name.startsWith('island-chunk-')&&!(Array.isArray(o.material)?o.material.some(m=>m.transparent):o.material.transparent));

/** Same threshold as the island bake (lib/graphics/islandShore.ts OVERHEAD): a thin line this high over the water is not land. */
const OVERHEAD=3;
function heightMaterial(){
 return new T.ShaderMaterial({uniforms:{uWater:{value:WATER_Y}},
  vertexShader:'varying float vY;void main(){vec4 p=vec4(position,1.);\n#ifdef USE_INSTANCING\np=instanceMatrix*p;\n#endif\nvec4 w=modelMatrix*p;vY=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',
  // B: 1 where the surface is OVERHEAD or higher (cables, poles, fronds; see dropOverheadLines); A: 1 = something drawn.
  fragmentShader:`uniform float uWater;varying float vY;void main(){float v=clamp((vY-uWater+.5)/2.,0.,1.)*255.;gl_FragColor=vec4(floor(v)/255.,fract(v),vY-uWater>${OVERHEAD.toFixed(1)}?1.:0.,1.);}`,side:T.DoubleSide});
}
/** Height above the water (m, −0.5 … 1.5) on an n×n grid, row k at z = minZ + (k + .5)·texel, from one top-down render. */
function sampleHeights(renderer:T.WebGLRenderer,scene:T.Scene,minX:number,minZ:number){
 const n=FIELD_N,target=new T.WebGLRenderTarget(n,n,{depthBuffer:true}),camera=new T.OrthographicCamera(-FIELD_SIZE/2,FIELD_SIZE/2,FIELD_SIZE/2,-FIELD_SIZE/2,.1,80);
 camera.position.set(minX+FIELD_SIZE/2,40,minZ+FIELD_SIZE/2);camera.up.set(0,0,-1);camera.lookAt(minX+FIELD_SIZE/2,0,minZ+FIELD_SIZE/2);camera.updateMatrixWorld();
 const material=heightMaterial(),toggled:T.Object3D[]=[];
 for(const o of scene.children)if(o.visible&&!isGround(o)){o.visible=false;toggled.push(o);}
 const prev={target:renderer.getRenderTarget(),override:scene.overrideMaterial,auto:renderer.shadowMap.autoUpdate,needs:renderer.shadowMap.needsUpdate,clear:renderer.getClearColor(new T.Color()),alpha:renderer.getClearAlpha(),bg:scene.background};
 const pixels=new Uint8Array(n*n*4);
 try{
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;scene.overrideMaterial=material;scene.background=null;
  renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,camera);
  renderer.readRenderTargetPixels(target,0,0,n,n,pixels);
 }finally{
  renderer.setRenderTarget(prev.target);scene.overrideMaterial=prev.override;scene.background=prev.bg;renderer.setClearColor(prev.clear,prev.alpha);
  renderer.shadowMap.autoUpdate=prev.auto;renderer.shadowMap.needsUpdate=prev.needs;for(const o of toggled)o.visible=true;target.dispose();material.dispose();
 }
 // Pixel row j (from the bottom) looks at z = maxZ − (j + .5)·texel (camera up is −Z): flip into z-ascending rows.
 const lift=new Float32Array(n*n),high=new Uint8Array(n*n),drawn=new Uint8Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const p=(j*n+i)*4,v=(pixels[p]+pixels[p+1]/255)/255,k=(n-1-j)*n+i;lift[k]=v*2-.5;high[k]=pixels[p+2]>127?1:0;drawn[k]=pixels[p+3]>127?1:0;}
 // Oct 14 2026: the zipline cable (and any thin raised line: poles, fronds) must not read as land (fake foam rings and shallows in
 // the sea); same pass as the island bake.
 dropOverheadLines(lift,high,drawn,n,n);
 return lift;
}
/** Felzenszwalb–Huttenlocher squared distance transform, one line. */
function edt1(f:Float64Array,n:number,d:Float64Array,v:Int32Array,z:Float64Array){
 let k=0;v[0]=0;z[0]=-Infinity;z[1]=Infinity;
 for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=z[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);}k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
 k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])*(q-v[k])+f[v[k]];}
}
function distanceTo(feature:Uint8Array,n:number){
 const INF=1e12,out=new Float64Array(n*n),f=new Float64Array(n),d=new Float64Array(n),v=new Int32Array(n),z=new Float64Array(n+1);
 for(let i=0;i<n*n;i++)out[i]=feature[i]?0:INF;
 for(let x=0;x<n;x++){for(let y=0;y<n;y++)f[y]=out[y*n+x];edt1(f,n,d,v,z);for(let y=0;y<n;y++)out[y*n+x]=d[y];}
 for(let y=0;y<n;y++){for(let x=0;x<n;x++)f[x]=out[y*n+x];edt1(f,n,d,v,z);for(let x=0;x<n;x++)out[y*n+x]=Math.sqrt(d[x]);}
 return out;
}
function valueNoise(n:number,cell:number,seed:number){
 const g=Math.ceil(n/cell)+2,lattice=new Float32Array(g*g);let s=seed;for(let i=0;i<lattice.length;i++){s=(s*16807)%2147483647;lattice[i]=s/2147483647;}
 const out=new Float32Array(n*n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
  const a=lattice[iy*g+ix],b=lattice[iy*g+ix+1],c=lattice[(iy+1)*g+ix],d=lattice[(iy+1)*g+ix+1];out[y*n+x]=(a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy;}
 return out;
}

/** Build the shore field for a box centred at (cx, cz). One render + ~2 ms of CPU on a desktop; call once per spot. */
export function buildShoreField(renderer:T.WebGLRenderer,scene:T.Scene,cx:number,cz:number):ShoreField{
 const n=FIELD_N,texel=FIELD_SIZE/n,minX=cx-FIELD_SIZE/2,minZ=cz-FIELD_SIZE/2;
 const lift=sampleHeights(renderer,scene,minX,minZ);
 const land=new Uint8Array(n*n),water=new Uint8Array(n*n);for(let i=0;i<n*n;i++){land[i]=lift[i]>SHORE_LAND_LIFT?1:0;water[i]=1-land[i];}
 const toLand=distanceTo(land,n),toWater=distanceTo(water,n);
 let sdf=new Float32Array(n*n);for(let i=0;i<n*n;i++)sdf[i]=(land[i]?-(toWater[i]-.5):toLand[i]-.5)*texel;
 // Two light 3×3 passes round off the texel steps so the swash edge follows a smooth curve.
 for(let pass=0;pass<2;pass++){const next=new Float32Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let sum=0,w=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=n||yy>=n)continue;const k=dx||dy?1:2;sum+=sdf[yy*n+xx]*k;w+=k;}next[y*n+x]=sum/w;}sdf=next;}
 const big=valueNoise(n,18,7),small=valueNoise(n,5,11),data=new Uint16Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,wx=minX+(x+.5)*texel,wz=minZ+(y+.5)*texel,deck=distanceToLandableDeck(wx,wz),beach=Math.min(1,Math.max(0,(deck-1.5)/2.5));
  data[i*4]=T.DataUtils.toHalfFloat(sdf[i]);data[i*4+1]=T.DataUtils.toHalfFloat(big[i]);data[i*4+2]=T.DataUtils.toHalfFloat(small[i]);data[i*4+3]=T.DataUtils.toHalfFloat(beach);}
 const texture=new T.DataTexture(data,n,n,T.RGBAFormat,T.HalfFloatType);texture.magFilter=texture.minFilter=T.LinearFilter;texture.generateMipmaps=false;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.needsUpdate=true;texture.name='fishing-shore-field';
 const box=new T.Vector4(minX,minZ,FIELD_SIZE,FIELD_SIZE);
 const distance=(x:number,z:number)=>{const fx=(x-minX)/texel-.5,fz=(z-minZ)/texel-.5;if(fx<0||fz<0||fx>n-1||fz>n-1)return 99;const ix=Math.min(n-2,Math.floor(fx)),iz=Math.min(n-2,Math.floor(fz)),tx=fx-ix,tz=fz-iz;
  return (sdf[iz*n+ix]*(1-tx)+sdf[iz*n+ix+1]*tx)*(1-tz)+(sdf[(iz+1)*n+ix]*(1-tx)+sdf[(iz+1)*n+ix+1]*tx)*tz;};
 return {box,n,size:FIELD_SIZE,sdf,lift,texture,distance};
}

/** Tileable 128² noise (built once per visuals, ~4 ms on a desktop): R = caustic network (thin, wobbly light lines), G = foam lace, B = soft noise. */
export function createWaterNoise(){
 const n=128,data=new Uint8Array(n*n*4),pts:[number,number][]=[];let s=99;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 for(let i=0;i<30;i++)pts.push([r()*n,r()*n]);
 const lace=valueNoise(n,10,3),lace2=valueNoise(n,4,5),soft=valueNoise(n,20,13),wx=valueNoise(n,11,17),wy=valueNoise(n,11,19);
 // Seamless: blend four half-shifted copies with sin² weights (each copy's seam sits where its weight is 0).
 const tile=(a:Float32Array,x:number,y:number)=>{const fx=Math.sin(Math.PI*x/n)**2,fy=Math.sin(Math.PI*y/n)**2,h=n/2;
  return (a[y*n+x]*fx+a[y*n+(x+h)%n]*(1-fx))*fy+(a[((y+h)%n)*n+x]*fx+a[((y+h)%n)*n+(x+h)%n]*(1-fx))*(1-fy);};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let f1=1e9,f2=1e9;
  // Caustics: cell edges of a wrapped Voronoi pattern, the lookup point wobbled by smooth noise so the lines curve like real ones.
  const qx=x+(tile(wx,x,y)-.5)*20,qy=y+(tile(wy,x,y)-.5)*20;
  for(const [px,py] of pts){let dx=Math.abs(qx-px)%n,dy=Math.abs(qy-py)%n;if(dx>n/2)dx=n-dx;if(dy>n/2)dy=n-dy;const d=Math.hypot(dx,dy);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
  const edge=Math.exp(-(f2-f1)/1.6),i=(y*n+x)*4;
  data[i]=Math.round(Math.min(1,edge*1.05)*255);data[i+1]=Math.round(Math.min(1,Math.max(0,(tile(lace,x,y)*.65+tile(lace2,x,y)*.35-.2)*1.6))*255);data[i+2]=Math.round(tile(soft,x,y)*255);data[i+3]=255;}
 const t=new T.DataTexture(data,n,n,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;t.name='fishing-water-noise';
 return t;
}

/** The swash / shallows strip over the field's shoreline band, extended (coarser) over the clear water the camera looks into. */
export function createShoreStrip(field:ShoreField,noise:T.Texture){
 const {n,sdf,lift,box}=field,texel=field.size/n,rough=shoreRough(lift,n,n,texel),C=n-1,wanted=new Uint8Array(C*C),band=new Uint8Array(C*C);
 const index=new Int32Array(n*n).fill(-1),positions:number[]=[],lifts:number[]=[],opens:number[]=[],indices:number[]=[];
 const vertex=(x:number,z:number)=>{const k=z*n+x;if(index[k]<0){index[k]=positions.length/3;const [y,h,open]=shoreDrape(lift,sdf,rough,n,n,x,z,WATER_Y,STRIP_Y,3);positions.push(box.x+(x+.5)*texel,y,box.y+(z+.5)*texel);lifts.push(h);opens.push(open);}return index[k];};
 for(let z=0;z<C;z++)for(let x=0;x<C;x++){const c=[z*n+x,z*n+x+1,(z+1)*n+x,(z+1)*n+x+1];let lo=Infinity,hi=-Infinity,tall=false;
  for(const k of c){lo=Math.min(lo,sdf[k]);hi=Math.max(hi,sdf[k]);if(sdf[k]<=0&&lift[k]>.75)tall=true;}
  if(hi>BAND_IN&&!tall&&lo<SEA_OUT){wanted[z*C+x]=1;if(lo<BAND_OUT)band[z*C+x]=1;}}
 const quad=(x0:number,z0:number,x1:number,z1:number)=>{const a=vertex(x0,z0),b=vertex(x1,z0),c=vertex(x0,z1),d=vertex(x1,z1);indices.push(a,c,b,b,c,d);};
 // Open water: 4×4-cell (2 m) quads where a whole block is water outside the swash band (flat, so the T-joins cannot crack).
 for(let bz=0;bz<C;bz+=COARSE)for(let bx=0;bx<C;bx+=COARSE){
  let whole=bx+COARSE<=C&&bz+COARSE<=C;
  for(let z=bz;z<Math.min(C,bz+COARSE)&&whole;z++)for(let x=bx;x<Math.min(C,bx+COARSE);x++)if(!wanted[z*C+x]||band[z*C+x]){whole=false;break;}
  if(whole){quad(bx,bz,bx+COARSE,bz+COARSE);continue;}
  for(let z=bz;z<Math.min(C,bz+COARSE);z++)for(let x=bx;x<Math.min(C,bx+COARSE);x++)if(wanted[z*C+x])quad(x,z,x+1,z+1);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('lift',new T.Float32BufferAttribute(lifts,1));geometry.setAttribute('open',new T.Float32BufferAttribute(opens,1));geometry.setIndex(indices);
 geometry.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(positions.length).map((_,i)=>i%3===1?1:0),3));geometry.computeBoundingSphere();
 const material=new T.MeshLambertMaterial({color:'#ffffff',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 material.onBeforeCompile=shader=>{
  // The spot's water tint, clarity and sand (Oct 13 2026, per-spot reef themes) come in with the shared underwater uniforms.
  Object.assign(shader.uniforms,WATER_UNIFORMS,UW_UNIFORMS,{uWaterNoise:{value:noise}});
  // Clear water (Oct 12 2026): where the view ray meets the seabed is worked out per VERTEX (it is smooth: the field, the ray and the
  // beach slope), so each water pixel only reads the foam lace and the caustics. The seabed is taken as locally flat along the ray
  // (its slope from one field read 1 m further on): one closed-form step, stable where the ray is flatter than the beach slope.
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float lift,open;varying float vLift,vVy,vOpen;varying vec2 vWaterXZ;varying vec4 vField,vSea,vTrans;varying vec3 vTint;\n'+SHORE_GLSL+UNDERWATER_GLSL+SHORE_PULL_GLSL)
   .replace('#include <project_vertex>',/* glsl */`#include <project_vertex>
   vLift=lift;vec3 uwW=(modelMatrix*vec4(transformed,1.)).xyz;vWaterXZ=uwW.xz;vec4 f=shoreSample(uwW.xz);vField=f;
   vec3 uwV=normalize(vec3(uwW.x,UW_Y,uwW.z)-cameraPosition);float hl=max(length(uwV.xz),1e-3),vy=max(.12,-uwV.y);vec2 dirH=uwV.xz/hl;
   float g=clamp(f.r-shoreSample(uwW.xz+dirH).r,0.,1.)*step(0.,f.r);
   float h0=uwDepthAt(f.r),slope=uUwFloor/3.4*exp(-max(f.r,0.)/3.4)*g,tH=h0/(vy/hl+slope),h=tH*vy/hl;
   vSea=vec4(uwW.xz+dirH*tH,h,sqrt(tH*tH+h*h));vVy=vy;
   // What the water does to the seabed colour (absorption, its own tint) and the sky it reflects: smooth, so per vertex too.
   vTrans=vec4(uwTrans(h,vSea.w),pow(1.-vy,3.)*.3);vTint=uwTint(h);
   vOpen=open;shorePull(mvPosition,f.r,open);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLift,vVy,vOpen;varying vec2 vWaterXZ;varying vec4 vField,vSea,vTrans;varying vec3 vTint;uniform vec3 uSandA,uSandB;uniform vec4 uSandWeed;\n'+SHORE_GLSL+UNDERWATER_GLSL)
   .replace('#include <map_fragment>',/* glsl */`
   float d=vField.r,n1=vField.g,n2=vField.b,beach=vField.a,edgeFade=shoreEdge(vWaterXZ)*uShore;
   float t=uWaterTime;
   vec4 laceT=texture2D(uWaterNoise,vWaterXZ*.21+vec2(t*.004,t*.002));float lace=laceT.g;
   float sea=smoothstep(-.25,0.,d);
   // ---- The seabed seen through the water: sand ripples and patches, moving caustics, tinted by the water crossed (underwater.ts,
   // the same as coral and fish).
   // Refraction (Oct 14 2026): the seabed seen through the moving surface sways a little, more the deeper it is (the reef and fish
   // sway the same way in their vertex shaders, underwater.ts).
   float h=vSea.z,pathL=vSea.w,vy=vVy;vec2 P=vSea.xy-uwWobble(vSea.xy,h);
   // Stretch check (polish): see the caustics below; where the seabed hit point is smeared, the sand ripples and caustics settle.
   vec2 pdx=dFdx(P),pdy=dFdy(P);float pa=length(pdx),pb=length(pdy),aniso=min(pa,pb)/max(max(pa,pb),1e-5),unsmear=smoothstep(.1,.45,aniso);
   float rip=mix(.5,sin(dot(P,vec2(1.7,.9))*2.4+n1*10.+n2*5.)*.5+.5,unsmear);
   // Sand tone and weed patches per spot (the theme's light / dark sand, weed colour and amount: a meadow covers more).
   vec3 sand=mix(uSandA,uSandB,n2)*(.9+.14*rip*rip);float wlo=mix(.74,.42,uSandWeed.a);
   sand=mix(sand,uSandWeed.rgb,smoothstep(wlo,wlo+.18,n1)*smoothstep(1.2,3.,d)*mix(.35,.8,uSandWeed.a));
   // Oct 19 2026: the clear water window's bed ramp (clearWindow.ts): sand at the beach, teal over the first metres, deep blue by 9-24 m, so the fishing bed
   // and the walking bed are one seabed at the box edge.
   sand=mix(sand,vec3(.2,.5,.52),smoothstep(1.5,9.,d)*.75);sand=mix(sand,vec3(.08,.36,.42),smoothstep(9.,24.,d));
   // Depth (Oct 14 2026): caustics fade fast with depth (squared), and less light reaches the deeper sand, so the seabed visibly
   // slopes away and darkens.
   // Polish (Oct 14 2026): right at the waterline the low camera's rays all meet nearly the same seabed point, so the caustic network
   // was smeared into pale vertical streaks under the swash. Where the hit point is stretched (its screen derivatives very
   // uneven), the caustics fade out instead.
   float caus=uwCaustic(P)*uwCausticFade(h)*unsmear;sand*=(1.+caus*.5)*mix(1.,.62,smoothstep(.5,uUwFloor,h));
   // The float's (and line's) soft shadow on the seabed, cast along the sun (uniforms written while fishing, no extra draw).
   if(uUwFloatOn>0.){vec2 q=P+uSunDir.xz/max(uSunDir.y,.35)*h,fl=uUwFloat.xy,ln=uUwFloat.zw-fl;float tl=clamp(dot(q-fl,ln)/max(dot(ln,ln),1e-4),0.,1.);
    float fs=1.-smoothstep(.07,.17+.06*h,length(q-fl)),ls=(1.-smoothstep(.012,.03+.012*h,length(q-fl-ln*tl)))*step(.0,d)*smoothstep(0.,.6,d);
    sand*=1.-max(fs*.42,ls*.22)*uUwFloatOn*(1.-smoothstep(1.,4.,h)*.6);}
   vec3 uwT=vTrans.rgb,col=sand*uwT+vTint*(1.-uwT);
   // Light shafts (in-scattering, Oct 14 2026): the same term the reef and fish get (underwater.ts uwSurfaceOver), from the same read.
   col+=vTint*smoothstep(.45,.85,laceT.b)*(1.-exp(-pathL*.35))*.1;
   float alpha=sea*(1.-smoothstep(21.,32.,d));
   float foam=0.,swell=0.;
   // ---- The swash band (near the waterline only: nothing in it reaches past 3.4 m).
   if(d<3.8){
    // Foam lace and the swash cycle, in step with the ocean's swell (same phase offset n1).
    float cyc=t/SWASH_P+n1*.35,ci=floor(cyc),ph=fract(cyc);const float UP=.3;
    // The swash itself (front, sheet, wet sand) only runs up the sand and the first metre of water.
    if(d<.9){
     float amp=.62+.38*waterHash(ci+floor(n2*3.));
     // Seam fix (Oct 12 2026): the land side fades out before a deck or a rock (the strip stays low under them, shoreDrape).
     float high=1.-smoothstep(.38,.42,vLift);
     float reachM=mix(.3,3.1*(.7+.6*n2),beach)*amp*high;
     float r=ph<UP?sin(1.5708*ph/UP):pow(1.-(ph-UP)/(1.-UP),1.6);
     float front=reachM*r-.12,u=-d+(lace-.5)*.32+(n2-.5)*.22;
     float covered=(1.-smoothstep(front-.05,front+.05,u))*(1.-sea),behind=front-u;
     float fw=.11+.09*r,rush=ph<UP?1.:.35+.65*r;
     float foamFront=exp(-abs(u-front)/fw)*rush*smoothstep(-.1,.4,lace+.1)*smoothstep(-.3,.2,-d+.6)*1.15;
     float trail=covered*smoothstep(.8,0.,behind)*smoothstep(.5,.8,lace)*rush*.5;
     // Wet sand: when did the backwash last uncover this point? Dries over ~2.5 s; a damp band always stays near the water.
     float wet=0.;if(d<.2){float uu=clamp((u+.12)/max(reachM,.01),0.,1.),phU=UP+(1.-UP)*(1.-pow(uu,1./1.6)),since=(ph>=phU?ph-phU:ph+1.-phU)*SWASH_P;
      wet=max((u<reachM?exp(-since/2.6):0.)*(1.-covered),smoothstep(reachM*1.15+.3,-.3,u)*.38)*high*(1.-smoothstep(-.2,.2,d));}
     // On the sand: the thin swash sheet (clear, a touch of turquoise) and the wet band it leaves.
     vec3 wetSand=vec3(.36,.25,.11),sheetC=mix(vec3(.42,.33,.18),vec3(.16,.5,.48),.4);
     // Near-opaque right at the waterline: the edge is this smooth field curve, never a cut through the sand's facets.
     float landA=max(max(covered*(.25+.3*smoothstep(0.,1.1,behind)),wet*.55),smoothstep(-.6,-.2,d)*.94*high*vOpen);
     col=mix(col,mix(wetSand,sheetC,covered),1.-sea);alpha=mix(alpha,landA,1.-sea);
     foam=max(foamFront,trail);
    }
    // The swell breaking: a white band rolls in over the last metres, then churns at the waterline as the swash starts.
    float dc=SWELL_L*(1.-ph);float breaker=exp(-abs(d-dc)/(.35+.25*dc))*smoothstep(3.4,.6,dc)*smoothstep(.25,.7,lace+.15)*step(-.2,d);
    float churn=smoothstep(1.6,0.,d)*step(-.3,d)*(1.-smoothstep(0.,.22,ph))*smoothstep(.3,.65,lace);
    foam=clamp(max(foam,max(breaker,churn)),0.,1.);
   }
   // ---- The surface over the clear water: swells rolling in (same phase as the ocean's), shimmering ripple lines, and more sky
   // reflected at grazing angles so it settles into the island ocean further out.
   // Oct 14 2026 polish ("a gentle, layered surface"): the swell crest is broader and broken up by the soft noise (it used to draw
   // hard straight bands across the phone screen), and the ripple lines come and go in slow wind gusts drifting across the water
   // (one ALU wave over the noise already read: no extra texture reads). Period 20 s divides the water clock's wrap.
   float sph=swellPhase(d,n1);swell=smoothstep(.74,1.,sph)*(.5+.5*smoothstep(.25,.75,laceT.b))*smoothstep(.2,1.5,d)*smoothstep(32.,6.,d);
   float gust=.5+.5*sin(dot(vWaterXZ,vec2(.19,.12))-t*.314159+n2*5.+laceT.b*3.);
   float lines=smoothstep(.5,.56,lace)*smoothstep(.64,.58,lace)*smoothstep(.3,2.,d)*(.45+.95*gust);
   float fres=vTrans.a;
   col=mix(col,vec3(.42,.72,.7),sea*(swell*.24+lines*.1));col=mix(col,vec3(.2,.42,.47),sea*fres);
   vec3 foamC=vec3(.97,.98,.96);col=mix(col,foamC,foam);alpha=max(alpha,foam*.95);
   float glint=0.;if(uWaterDetail>1.5){float g2=texture2D(uWaterNoise,vWaterXZ*.33-vec2(t*.01,t*.004)).g;glint=smoothstep(.8,.9,min(lace,g2))*sea*smoothstep(1.,4.,d)*(.4+.6*swell);}
   // Phones (detail 1, polish): a light sparkle from the lace already read, where a gust ruffles the water (ALU only).
   else if(uWaterDetail>.5)glint=smoothstep(.87,.93,lace)*smoothstep(.55,.95,gust)*sea*smoothstep(1.,4.,d)*.5;
   diffuseColor=vec4(col,alpha*edgeFade);
   float waterLight=(foam*.22+glint*.9)*edgeFade;vec3 waterGlow=(col*.08+vTint*(1.-uwT)*UW_GLOW)*sea*alpha*edgeFade;`)
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=waterLight*vec3(1.,.97,.9)+waterGlow;');
 };
 material.customProgramCacheKey=()=>'fishing-shore-strip-v12';
 const mesh=new T.Mesh(geometry,material);mesh.name='fishing-shore-water';mesh.renderOrder=.5;mesh.frustumCulled=true;mesh.matrixAutoUpdate=false;mesh.raycast=()=>{};
 return {mesh,dispose(){geometry.dispose();material.dispose();}};
}

/** Fishing water lifecycle for the visuals module: build per spot (cached), fade in/out, detail, dispose. */
export function createFishingWater(scene:T.Scene,renderer:T.WebGLRenderer,phone=false){
 type Entry={field:ShoreField;strip:ReturnType<typeof createShoreStrip>;props:SeabedProps|null};
 const fields=new Map<string,Entry>(),ocean=createOceanClear(scene);let noise:T.Texture|null=null;
 // `own` (Oct 19 2026, one shore: underwater.ts CLEAR_SHARE): 1 = this strip and the seabed props draw the fishing water, 0 = the
 // clear water window does (it stays exactly as it was while walking). Eases like the strength, so a heat tier change cross-fades.
 let current:Entry|null=null,strength=0,target=0,own=1,windowOk=false;
 return {
  get field(){return current?.field??null;},
  get busy(){return strength>0||target>0;},
  /** Triangles in the current seabed (perf readout). */
  get seabedTriangles(){return current?.props?.triangles??0;},
  /** Anemones with a clownfish pair in the current seabed (fishSchools.ts). */
  get homes(){return current?.props?.homes??[];},
  /** Reef pieces in the current seabed (bubble sources, darting reef fish; Oct 14 2026 polish). */
  get pieces(){return current?.props?.pieces??[];},
  /** Show the moving shore round the angler at `stand` casting along `dir`; `spot` picks the seabed (coral, sea grass, piles).
   *  `viewDepth` (Oct 13 2026, farther casts): how far out the seabed scatter reaches, in metres; the caller passes the
   *  spot's real cast distance plus a few metres, so coral and rocks still surround a float cast much farther out. */
  /** Whether the clear water window serves this session (set at begin, before the water fades in: deep-sea spots never). */
  get windowServes(){return windowOk&&CLEAR_SHARE.available;},
  begin(stand:{x:number;z:number},dir:{x:number;z:number},spot?:{id:string;area?:string;reef?:string;x:number;z:number}|null,halfWidth=9,viewDepth?:number,useWindow=false){
   windowOk=useWindow;if(strength<=0)own=windowOk&&CLEAR_SHARE.available?0:1;
   const cx=Math.round((stand.x+dir.x*14)/4)*4,cz=Math.round((stand.z+dir.z*14)/4)*4,key=cx+':'+cz;
   let entry=fields.get(key);
   if(!entry){const field=buildShoreField(renderer,scene,cx,cz);noise??=createWaterNoise();UW_UNIFORMS.uWaterNoise.value=noise;
    const props=spot?buildSeabedProps(field,reefTheme(spot),stand,dir,phone,reefSeed(spot.id),halfWidth,viewDepth):null;
    entry={field,strip:createShoreStrip(field,noise),props};fields.set(key,entry);}
   if(current&&current!==entry){current.strip.mesh.removeFromParent();current.props?.mesh.removeFromParent();}
   current=entry;scene.add(entry.strip.mesh);entry.strip.mesh.updateMatrix();if(entry.props){scene.add(entry.props.mesh);entry.props.mesh.updateMatrix();}target=1;
  },
  end(){target=0;},
  frame(dt:number,reduced:boolean){
   if(!current){CLEAR_SHARE.served=0;return;}const ease=(v:number,to:number)=>reduced?to:T.MathUtils.clamp(v+Math.sign(to-v)*Math.min(Math.abs(to-v),dt/.8),0,1);
   strength=ease(strength,target);own=ease(own,windowOk&&CLEAR_SHARE.available?0:1);
   // Served by the window: the shore texture stays bound (the catch and the schools read the field) but uShore is 0, so the ocean,
   // the island's shore strip and the window look exactly as while walking; no strip or props draw. The ocean still stops writing
   // depth (createOceanClear), or the transparent catch and fish schools under it would fail the depth test.
   const on=strength>0,s=strength*own,mine=s>0;CLEAR_SHARE.served=strength*(1-own);
   current.strip.mesh.visible=mine;setShore(on?current.field.texture:null,current.field.box,s);ocean.set(on);
   const props=current.props;if(props){props.mesh.visible=mine;(props.mesh.material as T.Material).opacity=s;}
  },
  dispose(){setShore(null,null,0);CLEAR_SHARE.served=0;ocean.set(false);for(const e of fields.values()){e.strip.mesh.removeFromParent();e.strip.dispose();e.props?.dispose();e.field.texture.dispose();}fields.clear();noise?.dispose();noise=null;UW_UNIFORMS.uWaterNoise.value=null;current=null;},
 };
}
