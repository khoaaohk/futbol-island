import * as T from 'three';
import {ISLAND_SUN_POSITION,type TimeOfDay} from './islandLighting';
/**
 * Sky dome, layered clouds and the far horizon (Nov 26 2026, owner shot 129: "add clouds in the background and improve the skyline
 * distance ... make sure the clouds have depth and look nice"). Switch: `?sky=0` (lib/graphics/skySwitch.ts) never builds it.
 *
 * ONE draw, no render target, no pass. A sphere around the camera whose vertices are pushed to the far plane (z = w) and drawn LAST
 * among the opaques (renderOrder) with the depth test on: only pixels nothing else covered (the sky the clear colour used to fill)
 * run its fragment shader, so it adds no overdraw where the island or the sea is. Layer 1 only (the island camera enables it), so
 * load-time bakes with an override material (islandShore.ts, shoreWater.ts) and the shadow map never see it.
 *
 * The horizon colour IS the scene background Color (the same object the haze fog and the day / sunset / night lerp use), written as
 * the fog's own sRGB uniform, so where the far sea fades into fog it meets the sky with no line. Below the horizon the dome is that
 * colour (a high camera sees the old flat haze there, unchanged).
 *  - Gradient: deeper overhead, lighter and warmer at the horizon; a soft glow + small disc on the side of the island's sun
 *    (ISLAND_SUN_POSITION: the shadows' direction), a warm horizon band under it; at night the same spot is the moon, and stars.
 *  - Clouds: three layers on virtual planes 900 / 1500 / 3200 m up (so perspective flattens them toward the horizon, shrinks and
 *    hazes them with distance, and they parallax against each other as the camera moves; never reachable by the jetpack / parachute):
 *    far thin streaks, mid puffs, near cumulus. Each puff layer is shaded from TWO reads of one 128² noise texture: the density here
 *    and a step toward the sun, so the sun side is lit (rim colour) and the thick base is shaded (the time of day's shade colour).
 *    5 texture reads per sky pixel, ~120 ALU. Drift: one time uniform, frozen on the still path (reduced motion, heat tier >= 2,
 *    Battery saver, the governor's slow mode: the same gate as the sea's sun glitter).
 *  - Far islets: three low haze-coloured silhouettes on the western horizon (a function of azimuth: at infinity, never reachable,
 *    never in front of anything; Summit Isle and Coral Cay are east of the main island, so they never share a skyline).
 */
const LOOK:Record<TimeOfDay,{zenith:string;glow:string;lit:string;shade:string;rim:string;disc:number;stars:number}>={
 day:{zenith:'#5d9cd0',glow:'#fff1d6',lit:'#ffffff',shade:'#a7b5c6',rim:'#fff8ea',disc:1,stars:0},
 sunset:{zenith:'#7f8db8',glow:'#ffd29a',lit:'#ffe6c8',shade:'#b88f93',rim:'#ffc493',disc:.85,stars:0},
 night:{zenith:'#0b1230',glow:'#c7d2f0',lit:'#7d86ab',shade:'#2a2f4e',rim:'#b9c4e6',disc:.7,stars:1},
};
export const SKY_CLOUD_HEIGHTS=[900,1500,3200] as const;
/** The cloud noise: 128² RGBA, tileable value-noise fbm (R: puffs, 4 octaves; G: streaks, 3 low octaves). Built once (~0.1 MB). */
function cloudNoise(){
 const N=128,data=new Uint8Array(N*N*4),lat=(p:number,seed:number)=>{const g=new Float32Array(p*p);let s=seed;for(let i=0;i<g.length;i++){s=(s*1664525+1013904223)>>>0;g[i]=s/4294967296;}return g;};
 const oct=(gx:number,gy:number,p:number,g:Float32Array)=>{const x=gx*p/N,y=gy*p/N,x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=g[(y0%p)*p+x0%p],b=g[(y0%p)*p+(x0+1)%p],c=g[((y0+1)%p)*p+x0%p],d=g[((y0+1)%p)*p+(x0+1)%p];return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;};
 const R=[4,8,16,32].map((p,i)=>({p,g:lat(p,11+i*7),w:.5**i})),G=[2,4,8].map((p,i)=>({p,g:lat(p,97+i*13),w:.55**i}));
 const sum=(L:typeof R,x:number,y:number)=>{let v=0,w=0;for(const o of L){v+=oct(x,y,o.p,o.g)*o.w;w+=o.w;}return v/w;};
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const o=(y*N+x)*4,r=sum(R,x,y),g=sum(G,x,y);
  data[o]=Math.round(Math.min(1,Math.max(0,(r-.5)*1.6+.5))*255);data[o+1]=Math.round(Math.min(1,Math.max(0,(g-.5)*1.7+.5))*255);data[o+2]=0;data[o+3]=255;}
 const t=new T.DataTexture(data,N,N,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}
const VERT=/* glsl */`
varying vec3 vSkyDir;
void main(){vSkyDir=position;vec4 p=projectionMatrix*viewMatrix*vec4(position+cameraPosition,1.);gl_Position=p.xyww;}`;// z = w: on the far plane
const FRAG=/* glsl */`
uniform vec3 uHorizon,uZenith,uGlow,uLit,uShade,uRim,uSunDir;uniform float uTime,uDisc,uStars,uCamY;uniform vec2 uCam;uniform sampler2D uCloud;
varying vec3 vSkyDir;
// One puff layer: density at the hit point and one read toward the sun -> premultiplied colour + alpha.
vec4 puffs(vec2 uv,vec2 toSun,float lo,float hi,float haze){
 float n=texture2D(uCloud,uv).r,a=smoothstep(lo,hi,n);if(a<=0.)return vec4(0.);
 float ns=texture2D(uCloud,uv+toSun).r,lit=clamp(.55+(n-ns)*5.,0.,1.);
 vec3 c=mix(uShade,uLit,lit);c=mix(c,uRim,(1.-smoothstep(lo,hi+.12,n))*lit*.7);// sun-side edges glow
 c=mix(c,uShade*.92,smoothstep(hi,hi+.22,n)*(1.-lit)*.6);// thick, sun-away base: shaded
 c=mix(c,uHorizon,haze);return vec4(c*a,a);}
float islet(float az,float e,float c,float w,float h){float x=(az-c)/w;if(abs(x)>1.)return 0.;float p=h*(1.-x*x)*(.75+.25*sin(x*7.+c*3.));return step(0.,e)*(1.-smoothstep(p-.0012,p,e));}
void main(){
 vec3 d=normalize(vSkyDir);float e=d.y,eu=max(e,0.);
 vec3 col=mix(uZenith,uHorizon,pow(1.-eu,3.2));
 float mu=max(dot(d,uSunDir),0.),az=dot(normalize(d.xz+1e-5),normalize(uSunDir.xz));
 col+=uGlow*(pow(mu,10.)*.28+pow(mu,90.)*.35)*uDisc;// halo
 col=mix(col,uGlow,max(az,0.)*max(az,0.)*.38*exp(-eu*14.)*smoothstep(0.,.035,e));// warm band on the sun's side of the horizon (0 at the horizon: meets the fog)
 col=mix(col,uGlow*1.06,smoothstep(.99965,.99985,mu)*uDisc);// the disc (sun; at night the moon)
 if(uStars>.01&&e>0.){vec3 p=d*170.,c=floor(p),f=fract(p)-.5;float h=fract(sin(dot(c,vec3(12.99,78.23,37.72)))*43758.55);
  col+=vec3(.85,.9,1.)*step(.9965,h)*(1.-smoothstep(.06,.22,length(f)))*smoothstep(.02,.18,e)*uStars;}
 if(e>.004){
  vec2 toSun=normalize(uSunDir.xz)*.012;vec4 acc=vec4(0.);
  // far streaks (3200 m): stretched, low, faint; then mid puffs (1500 m), then the near cumulus (900 m): far to near, near over far
  {float t=(${SKY_CLOUD_HEIGHTS[2].toFixed(1)}-uCamY)/e;vec2 h=uCam+d.xz*t;float n=texture2D(uCloud,h*vec2(1./14000.,1./4200.)+vec2(uTime*.0006,0.)).g;
   float a=smoothstep(.56,.82,n)*.55*smoothstep(.004,.05,e);vec3 c=mix(uRim,uLit,.4);c=mix(c,uHorizon,exp(-e*9.)*.55);acc=vec4(c*a,a);}
  {float t=(${SKY_CLOUD_HEIGHTS[1].toFixed(1)}-uCamY)/e;vec4 p=puffs((uCam+d.xz*t)/3400.+vec2(uTime*.0011,uTime*.0003),toSun,.54,.74,exp(-e*7.)*.6);p*=smoothstep(.01,.08,e);acc=p+acc*(1.-p.a);}
  {float t=(${SKY_CLOUD_HEIGHTS[0].toFixed(1)}-uCamY)/e;vec4 p=puffs((uCam+d.xz*t)/2300.+vec2(37.3+uTime*.0019,11.1+uTime*.0005),toSun*1.3,.6,.78,exp(-e*5.)*.5);p*=smoothstep(.02,.12,e);acc=p+acc*(1.-p.a);}
  col=col*(1.-acc.a)+acc.rgb;}
 // far islets: haze silhouettes on the western horizon
 float an=atan(d.z,d.x),il=max(islet(an,e,2.55,.07,.011),max(islet(an,e,-2.2,.05,.008),islet(an,e,2.95,.035,.014)));
 col=mix(col,mix(uHorizon,uZenith,.22)*.93,il*.55);
 gl_FragColor=vec4(e<0.?uHorizon:col,1.);}`;
export function createSkyDome(background:T.Color){
 const sun=new T.Vector3(...ISLAND_SUN_POSITION).normalize(),V3=()=>new T.Vector3();
 const u={uHorizon:{value:V3()},uZenith:{value:V3()},uGlow:{value:V3()},uLit:{value:V3()},uShade:{value:V3()},uRim:{value:V3()},uSunDir:{value:sun},
  uTime:{value:0},uDisc:{value:1},uStars:{value:0},uCamY:{value:0},uCam:{value:new T.Vector2()},uCloud:{value:cloudNoise()}};
 const mat=new T.ShaderMaterial({uniforms:u,vertexShader:VERT,fragmentShader:FRAG,depthWrite:false,fog:false,side:T.BackSide});
 const mesh=new T.Mesh(new T.SphereGeometry(100,32,16),mat);mesh.name='sky-dome';mesh.frustumCulled=false;mesh.renderOrder=1e6;mesh.matrixAutoUpdate=false;
 mesh.layers.set(1);mesh.castShadow=mesh.receiveShadow=false;
 const target=Object.fromEntries(Object.entries(LOOK).map(([k,l])=>[k,{zenith:new T.Color(l.zenith),glow:new T.Color(l.glow),lit:new T.Color(l.lit),shade:new T.Color(l.shade),rim:new T.Color(l.rim),disc:l.disc,stars:l.stars}])) as Record<TimeOfDay,{zenith:T.Color;glow:T.Color;lit:T.Color;shade:T.Color;rim:T.Color;disc:number;stars:number}>;
 const cur={zenith:new T.Color(),glow:new T.Color(),lit:new T.Color(),shade:new T.Color(),rim:new T.Color(),disc:1,stars:0},tmp=new T.Color();let first=true;
 /** The sea's glitter road colour (sRGB, written for the ocean shader: waterSurface SKY_SEA_UNIFORMS). */
 const glowOut=new T.Vector3();
 const srgb=(c:T.Color,v:T.Vector3)=>{c.getRGB(tmp as unknown as T.RGB,T.SRGBColorSpace);v.set(tmp.r,tmp.g,tmp.b);};
 return {mesh,glow:glowOut,
  /** Per frame, after the camera is final: follow the camera, ease toward the time of day's look, advance the drift if `animate`. */
  update(camera:T.Camera,mode:TimeOfDay,dt:number,animate:boolean){
   const t=target[mode]??target.sunset,k=first?1:1-Math.exp(-Math.max(0,dt)*4);first=false;
   cur.zenith.lerp(t.zenith,k);cur.glow.lerp(t.glow,k);cur.lit.lerp(t.lit,k);cur.shade.lerp(t.shade,k);cur.rim.lerp(t.rim,k);cur.disc+=(t.disc-cur.disc)*k;cur.stars+=(t.stars-cur.stars)*k;
   srgb(background,u.uHorizon.value);srgb(cur.zenith,u.uZenith.value);srgb(cur.glow,u.uGlow.value);srgb(cur.lit,u.uLit.value);srgb(cur.shade,u.uShade.value);srgb(cur.rim,u.uRim.value);
   glowOut.copy(u.uGlow.value);u.uDisc.value=cur.disc;u.uStars.value=cur.stars;
   u.uCamY.value=Math.min(camera.position.y,600);u.uCam.value.set(camera.position.x,camera.position.z);
   if(animate&&dt>0)u.uTime.value=(u.uTime.value+Math.min(dt,.1))%100000;},
  dispose(){mesh.geometry.dispose();mat.dispose();u.uCloud.value.dispose();mesh.removeFromParent();},
 };
}
