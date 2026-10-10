import * as T from 'three';
import type {ArcadeStage} from './arcadeStage';
import {routeBendTable,routeCurve,routeGrade,routeHeadingAhead,ROUTE_BEND_MIN} from '../../components/games/runnerRoute';

/**
 * Breakaway Run winding route (Oct 9 2026).
 *
 * The simulation stays a straight three-lane treadmill (runner at z=0, forward = -z). Every runner
 * material gets one vertex-shader bend: a world position at along-track distance d = -z is moved onto
 * the curved, hilly centreline (heading, height, bank) sampled from `runnerRoute`. So lanes, obstacles,
 * tackles, shots and shadows all sit on the curved, sloped surface with no change to the game rules.
 *
 * Heat budget:
 *  - ONE 40×vec4 uniform table, refilled per frame into a preallocated Float32Array (no allocation).
 *  - Fixed, reused geometry: one tessellated terrain/road mesh, one rail mesh, one sky dome and four
 *    instanced prop meshes (boxes, canopies, glows, flags) recycled in 30 m route chunks. A chunk is
 *    rewritten only when it wraps (about twice a second); scrolling is one group matrix per frame.
 *  - The stage's straight ground, grid, pitch strip, side bars and ~150-mesh palm/house scenery are
 *    removed from the scene for the runner, which is where the draw-call saving comes from.
 * Reduced motion: smaller, slower camera look-ahead and a flatter horizon; no flag flutter boost.
 */
const BEND_N=40,BEND_D0=-24,BEND_STEP=4;
const bendData=new Float32Array(BEND_N*4);
const bendCfg=new T.Vector4(BEND_D0,1/BEND_STEP,1.7,0);
const bendUniforms={runnerBendData:{value:bendData},runnerBendCfg:{value:bendCfg}};
let activeRenderer:T.WebGLRenderer|null=null;

const BEND_PARS=/* glsl */`
uniform vec4 runnerBendData[${BEND_N}];
uniform vec4 runnerBendCfg;
#ifndef RUNNER_WORLD_HOOK
#define RUNNER_WORLD_HOOK
#endif
void runnerBendAt(float z,out vec4 c,out float extra,out float bank,out float slope){
 float f=(-z-runnerBendCfg.x)*runnerBendCfg.y;
 float fc=clamp(f,0.,${BEND_N-1}.0-.001);
 int i=int(fc);float t=fc-float(i);
 vec4 a=runnerBendData[i],b=runnerBendData[i+1];
 c=mix(a,b,t);extra=(f-fc)/runnerBendCfg.y;
 bank=clamp((b.z-a.z)*runnerBendCfg.y*runnerBendCfg.z,-.16,.16);
 slope=abs(extra)>0.?0.:(b.w-a.w)*runnerBendCfg.y;
}
vec3 runnerBend(vec3 p){
 if(runnerBendCfg.w<.5)return p;
 vec4 c;float extra,bank,slope;runnerBendAt(p.z,c,extra,bank,slope);
 float ch=cos(c.z),sh=sin(c.z);
 return vec3(c.x+ch*p.x+sh*extra,p.y+c.w-p.x*bank,c.y+sh*p.x-ch*extra);
}
vec3 runnerBendNormal(vec3 p,vec3 n){
 if(runnerBendCfg.w<.5)return n;
 vec4 c;float extra,bank,slope;runnerBendAt(p.z,c,extra,bank,slope);
 vec3 m=vec3(n.x+bank*n.y,n.y,n.z+slope*n.y);
 float ch=cos(c.z),sh=sin(c.z);
 return normalize(vec3(m.x*ch-m.z*sh,m.y,m.x*sh+m.z*ch));
}
`;
const PROJECT=/* glsl */`
vec4 rbW=vec4(transformed,1.0);
#ifdef USE_BATCHING
 rbW=batchingMatrix*rbW;
#endif
#ifdef USE_INSTANCING
 rbW=instanceMatrix*rbW;
#endif
rbW=modelMatrix*rbW;
RUNNER_WORLD_HOOK
rbW.xyz=runnerBend(rbW.xyz);
vec4 mvPosition=viewMatrix*rbW;
gl_Position=projectionMatrix*mvPosition;
`;
const WORLD=/* glsl */`#include <worldpos_vertex>
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
 worldPosition.xyz=runnerBend(worldPosition.xyz);
#endif
`;
const NORMAL=/* glsl */`#include <defaultnormal_vertex>
{vec4 rbP=vec4(position,1.0);
#ifdef USE_INSTANCING
 rbP=instanceMatrix*rbP;
#endif
 rbP=modelMatrix*rbP;
 transformedNormal=mat3(viewMatrix)*runnerBendNormal(rbP.xyz,transformedNormal*mat3(viewMatrix));}
`;
/** Exposed for tests: the shader edit applied to every runner material. */
export function runnerBendShader(shader:{vertexShader:string;uniforms:Record<string,T.IUniform>}){
 Object.assign(shader.uniforms,bendUniforms);
 let v=shader.vertexShader;if(v.includes('runnerBend('))return shader;
 v=v.replace('#include <common>','#include <common>\n'+BEND_PARS).replace('#include <project_vertex>',PROJECT).replace('#include <worldpos_vertex>',WORLD).replace('#include <defaultnormal_vertex>',NORMAL);
 shader.vertexShader=v;return shader;
}
const defaultKey=T.Material.prototype.customProgramCacheKey;
/** Chain the bend onto a material's own shader edits (bean skin, costumes, crowd bob, flag wave). */
export function bendMaterial(m:T.Material){
 if(m.userData.runnerBend||(m as T.ShaderMaterial).isShaderMaterial)return;m.userData.runnerBend=true;
 const base=m.onBeforeCompile,baseKey=m.customProgramCacheKey,key=baseKey===defaultKey?base.toString():null,before=m.onBeforeRender;
 m.onBeforeCompile=(shader,renderer)=>{base.call(m,shader,renderer);runnerBendShader(shader);};
 m.customProgramCacheKey=()=>(key??baseKey.call(m))+'|runner-bend-1';
 // Materials can be shared with other scenes (e.g. costume parts): only the runner's renderer bends.
 m.onBeforeRender=(renderer,scene,camera,geometry,object,group)=>{before.call(m,renderer,scene,camera,geometry,object,group);bendCfg.w=renderer===activeRenderer?1:0;};
 m.needsUpdate=true;
}
const depthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});bendMaterial(depthMaterial);
const patchOne=(o:T.Object3D)=>{
 if(o.userData.runnerNoBend)return;
 const mesh=o as T.Mesh;if(!(mesh.isMesh||(o as T.Line).isLine||(o as T.Points).isPoints))return;
 const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const m of mats)if(m&&!m.userData.runnerBend)bendMaterial(m);
 if(mesh.isMesh&&mesh.castShadow){if(!mesh.customDepthMaterial)mesh.customDepthMaterial=depthMaterial;else if(!mesh.customDepthMaterial.userData.runnerBend)bendMaterial(mesh.customDepthMaterial);}
};
/** Bend every material under `root` (cheap when already patched: one flag check per object). */
export function bendTree(root:T.Object3D){root.traverse(patchOne);}

const smoothTo=(v:number,target:number,rate:number,dt:number)=>v+(target-v)*(1-Math.exp(-rate*dt));
const CHUNK=30,SLOTS=7,PER={box:16,leaf:4,glow:8,flag:8};
type RouteState={distance:number;speed:number;lives:number};

export function createRunnerTrack(stage:ArcadeStage){
 const {scene,mobile,reduced}=stage;
 activeRenderer=stage.renderer;bendCfg.w=1;

 /* ---- remove the straight stage pieces this route replaces (they cannot bend: 2-triangle boxes, 100 m lines) ---- */
 const remove:T.Object3D[]=[];let grain:T.Texture|null=null;
 for(const o of scene.children){
  const m=o as T.Mesh,s=o.scale;
  if((o as T.GridHelper).isLineSegments&&o.type==='GridHelper')remove.push(o);
  else if(m.isMesh&&Math.abs(s.x-90)<.01&&Math.abs(s.z-100)<.01){remove.push(o);grain=(m.material as T.MeshStandardMaterial).map;}
  else if(m.isMesh&&Math.abs(s.x-8.8)<.01&&Math.abs(s.z-76)<.01)remove.push(o);
  else if(m.isMesh&&Math.abs(s.y-70)<.5&&Math.abs(s.x-.06)<.01)remove.push(o);
 }
 for(const o of remove)scene.remove(o);
 // ~150 palm/house meshes, one draw each: replaced by four instanced prop meshes that follow the route.
 stage.scenery.clear();stage.scenery.visible=false;
 // The glass floor skin and its neon spill are single long quads: tessellate them so they bend.
 scene.traverse(o=>{const m=o as T.Mesh;if(!m.isMesh)return;const g=m.geometry as T.PlaneGeometry;
  if((o.name==='glass-surface'||o.name==='neon-court-spill')&&g.parameters&&g.parameters.heightSegments===1){const p=g.parameters,spill=o.name==='neon-court-spill';
   // The spill's glowing rim marked a hard "end of the road": stretch it past the fog line instead.
   m.geometry=new T.PlaneGeometry(p.width,p.height*(spill?2.3:1),1,Math.ceil(p.height/2.5));g.dispose();}});

 /* ---- terrain + road: one tessellated mesh in the straight frame, bent by the shader ---- */
 const XS=[-160,-90,-55,-32,-22,-15,-10,-7,-5.4,-4.5,-2.4,0,2.4,4.5,5.4,7,10,15,22,32,55,90,160],Z0=36,Z1=-144,ROW=3,rows=Math.round((Z0-Z1)/ROW)+1;
 const road=new T.Color('#192b43'),verge=new T.Color('#141c38'),land=new T.Color('#0c0f25'),far=new T.Color('#121033'),c=new T.Color();
 const pos:number[]=[],col:number[]=[],uv:number[]=[],idx:number[]=[];
 for(let r=0;r<rows;r++){const z=Z0-r*ROW;for(const x of XS){const ax=Math.abs(x);
  if(ax<=4.5)c.copy(road);else if(ax<=5.4)c.copy(verge);else c.copy(land).lerp(far,Math.min(1,(ax-5.4)/30));
  pos.push(x,-.005,z);col.push(c.r,c.g,c.b);uv.push(x/6,-z/6);}}
 const W=XS.length;for(let r=0;r<rows-1;r++)for(let i=0;i<W-1;i++){const a=r*W+i,b=a+W;idx.push(a,b,a+1,a+1,b,b+1);}
 const terrainGeo=new T.BufferGeometry();terrainGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));terrainGeo.setAttribute('color',new T.Float32BufferAttribute(col,3));terrainGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));terrainGeo.setIndex(idx);terrainGeo.computeVertexNormals();
 // Mowing stripes (with the stage paper grain) scroll with the route, so flat ground still reads as speed.
 const stripeCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;let stripes:T.Texture|null=null;
 if(stripeCanvas){stripeCanvas.width=stripeCanvas.height=64;const g=stripeCanvas.getContext('2d');if(g){g.fillStyle='#ffffff';g.fillRect(0,0,64,64);g.fillStyle='#d9dbe8';g.fillRect(0,32,64,32);for(let i=0;i<700;i++){g.fillStyle=`rgba(40,40,70,${.04+((i*37)%10)/200})`;g.fillRect((i*29)%64,(i*53)%64,1,1);}}
  stripes=new T.CanvasTexture(stripeCanvas);stripes.wrapS=stripes.wrapT=T.RepeatWrapping;stripes.colorSpace=T.SRGBColorSpace;}
 else stripes=grain;
 const terrain=new T.Mesh(terrainGeo,new T.MeshLambertMaterial({vertexColors:true,map:stripes}));terrain.name='runner-terrain';terrain.receiveShadow=true;terrain.frustumCulled=false;scene.add(terrain);
 // Neon edge rails along the road, segmented so they follow the bends.
 const railPos:number[]=[],railIdx:number[]=[];
 for(const side of[-1,1]){const base=railPos.length/3;for(let r=0;r<rows;r++){const z=Z0-r*ROW;railPos.push(side*4.4-.07,.03,z,side*4.4+.07,.03,z);}for(let r=0;r<rows-1;r++){const a=base+r*2;railIdx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const railGeo=new T.BufferGeometry();railGeo.setAttribute('position',new T.Float32BufferAttribute(railPos,3));railGeo.setIndex(railIdx);
 const rails=new T.Mesh(railGeo,new T.MeshBasicMaterial({color:'#73fff1',toneMapped:false,side:T.DoubleSide}));rails.name='runner-rails';rails.frustumCulled=false;scene.add(rails);

 // Lane dashes beyond the stage's 70 m set, so the road ahead keeps its markings into the fog (scrolls like them).
 const dash:number[]=[];for(const x of[-1.2,1.2])for(let z=-66;z>-142;z-=4)dash.push(x,.026,z,x,.026,z+2);
 const dashGeo=new T.BufferGeometry();dashGeo.setAttribute('position',new T.Float32BufferAttribute(dash,3));
 const farDashes=new T.LineSegments(dashGeo,new T.LineBasicMaterial({color:'#fff0cf',transparent:true,opacity:.5}));farDashes.name='runner-far-dashes';farDashes.frustumCulled=false;scene.add(farDashes);

 /* ---- sky: one dome with a horizon glow and two procedural skyline layers that turn with the route ---- */
 const fogColor=new T.Color('#150f36');
 const skyUniforms={uYaw:{value:0},uTop:{value:new T.Color('#05061a')},uHorizon:{value:fogColor},uGlow:{value:new T.Color('#5a2a7a')},uHills:{value:new T.Color('#0f0b2c')},uTowers:{value:new T.Color('#151236')},uWindow:{value:new T.Color('#ff62c2')}};
 const sky=new T.Mesh(new T.SphereGeometry(140,32,12),new T.ShaderMaterial({uniforms:skyUniforms,side:T.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec3 vDir;uniform float uYaw;uniform vec3 uTop,uHorizon,uGlow,uHills,uTowers,uWindow;
float h1(float n){return fract(sin(n*91.7)*43758.5);}
void main(){float e=vDir.y,a=atan(vDir.x,-vDir.z);
 vec3 col=mix(uHorizon,uTop,smoothstep(0.,.42,e))+uGlow*exp(-max(e,0.)*11.)*.55;
 float b=a*.8+uYaw*.8,cell=floor(b*9.),r=h1(cell),tower=r>.45?.025+.06*h1(cell+.5):0.;
 if(e<tower){col=uTowers;float wx=fract(b*9.*6.),wy=fract(e*90.);if(wx>.55&&wy>.5&&h1(floor(b*54.)+floor(e*90.)*3.1)>.82)col=mix(col,uWindow,.7);}
 float q=a+uYaw,hills=.03+.02*sin(q*3.+1.3)+.012*sin(q*7.+.4)+.005*sin(q*17.);
 if(e<hills)col=mix(uHills,uHorizon,.25);
 if(e<.002)col=uHorizon;
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`}));
 sky.name='runner-sky';sky.userData.runnerNoBend=true;sky.frustumCulled=false;sky.renderOrder=5;scene.add(sky);

 /* ---- route props: instanced, recycled in 30 m chunks that know the bend they sit on ---- */
 const props=new T.Group();props.name='runner-props';scene.add(props);
 const lambert=()=>new T.MeshLambertMaterial({color:'#ffffff'});
 const boxes=new T.InstancedMesh(new T.BoxGeometry(1,1,1),lambert(),SLOTS*PER.box);boxes.castShadow=true;boxes.receiveShadow=true;
 const leaves=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),lambert(),SLOTS*PER.leaf);leaves.castShadow=true;
 const glows=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),SLOTS*PER.glow);
 const flagGeo=new T.PlaneGeometry(1.1,.66,6,1);flagGeo.translate(.55,0,0);
 const flagUniforms={uFlagTime:{value:0},uFlagAmp:{value:.08},uFlagRate:{value:7}};
 const flagMaterial=new T.MeshLambertMaterial({color:'#ffffff',side:T.DoubleSide});
 flagMaterial.onBeforeCompile=sh=>{Object.assign(sh.uniforms,flagUniforms);sh.vertexShader='uniform float uFlagTime;uniform float uFlagAmp;uniform float uFlagRate;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 {float fw=position.x/1.1,rz=modelMatrix[3].z+instanceMatrix[3].z,near=exp(-rz*rz/60.);
  float amp=uFlagAmp+near*.18;transformed.z+=sin(position.x*5.-uFlagTime*(uFlagRate+near*6.)+instanceMatrix[3].z*.7)*amp*fw;transformed.y-=fw*fw*max(0.,.14-amp*.6);}`);};
 flagMaterial.customProgramCacheKey=()=>'runner-flag-wave-1';
 const flags=new T.InstancedMesh(flagGeo,flagMaterial,SLOTS*PER.flag);
 for(const m of[boxes,leaves,glows,flags]){m.frustumCulled=false;m.instanceMatrix.setUsage(T.DynamicDrawUsage);props.add(m);}
 const dummy=new T.Object3D(),zero=new T.Matrix4().makeScale(0,0,0),colour=new T.Color();
 for(const [m,n] of [[boxes,SLOTS*PER.box],[leaves,SLOTS*PER.leaf],[glows,SLOTS*PER.glow],[flags,SLOTS*PER.flag]] as const)for(let i=0;i<n;i++){m.setMatrixAt(i,zero);m.setColorAt(i,colour.set('#ffffff'));}
 const slotChunk=new Int32Array(SLOTS).fill(-99999);
 const hash=(a:number,b:number)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);};
 const FLAG_COLOURS=['#ffd36e','#73fff1','#ff62c2','#ffffff'];
 function buildChunk(slot:number,chunk:number){
  slotChunk[slot]=chunk;let nb=0,nl=0,ng=0,nf=0;
  const put=(m:T.InstancedMesh,base:number,i:number,x:number,y:number,s:number,sx:number,sy:number,sz:number,hex:string,ry=0)=>{dummy.position.set(x,y,-s);dummy.rotation.set(0,ry,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();m.setMatrixAt(base+i,dummy.matrix);m.setColorAt(base+i,colour.set(hex));};
  const box=(x:number,y:number,s:number,w:number,h:number,d:number,hex:string)=>{if(nb<PER.box)put(boxes,slot*PER.box,nb++,x,y,s,w,h,d,hex);};
  const glow=(x:number,y:number,s:number,w:number,h:number,d:number,hex:string)=>{if(ng<PER.glow)put(glows,slot*PER.glow,ng++,x,y,s,w,h,d,hex);};
  const s0=chunk*CHUNK,curve=routeCurve(s0+CHUNK/2),bend=Math.abs(curve)>ROUTE_BEND_MIN*.8,outside=curve>0?-1:1;
  for(const side of[-1,1]){const k=hash(chunk,side);
   if(bend&&side===outside){
    // Flags line the outside of every bend: they mark the curve early and wave as you pass.
    for(let f=0;f<4&&nf<PER.flag;f++){const s=s0+3+f*7.5,x=side*6.1;box(x,1.3,s,.07,2.6,.07,'#c9d6ff');put(flags,slot*PER.flag,nf++,x,2.25,s,1,1,1,FLAG_COLOURS[(chunk+f)%FLAG_COLOURS.length],side<0?Math.PI:0);}
    continue;}
   const s=s0+4+k*20;
   if(k<.34){const x=side*(13+hash(chunk,side+5)*5);box(x,1.3,s,3.6,2.6,3.2,'#292841');box(x,2.72,s,3.9,.24,3.5,'#8749bc');glow(x,2.5,s-1.62,3.4,.1,.08,'#ff62c2');
     for(const dz of[-.8,.8])glow(x-side*1.82,1.45,s+dz,.06,.5,.55,'#73fff1');}
   else if(k<.67){for(const dz of[0,8]){const x=side*(9.5+hash(chunk+dz,side)*4);box(x,1.3,s+dz,.24,2.6,.24,'#343052');if(nl<PER.leaf)put(leaves,slot*PER.leaf,nl++,x,3,s+dz,1.5,.9,1.5,dz?'#263454':'#2b3c5e');}}
   else if(k<.9){const x=side*8.8;box(x,2.2,s,.12,4.4,.12,'#324f56');glow(x,4.45,s,.42,.24,.42,'#ff62c2');}
  }
  for(;nb<PER.box;nb++)boxes.setMatrixAt(slot*PER.box+nb,zero);for(;nl<PER.leaf;nl++)leaves.setMatrixAt(slot*PER.leaf+nl,zero);
  for(;ng<PER.glow;ng++)glows.setMatrixAt(slot*PER.glow+ng,zero);for(;nf<PER.flag;nf++)flags.setMatrixAt(slot*PER.flag+nf,zero);
  for(const m of[boxes,leaves,glows,flags]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
 }

 bendTree(scene);

 /* ---- per frame ---- */
 let yaw=0,viewSlope=0,lean=0,pitch=0,heading=0,lastS=NaN,patchClock=0,elapsed=0;
 const player=scene.getObjectByName('runner-player'),body=player?.getObjectByName('arcade-body-offset');
 const bendOptions={d0:BEND_D0,step:BEND_STEP,n:BEND_N,yaw:0,viewSlope:0,drop:.0006};
 /** Yaw that centres the route point LOOK m ahead, measured from the last table (a damped feedback loop). */
 const LOOK=40,lookK=(LOOK-BEND_D0)/BEND_STEP*4,lookTarget=()=>Math.max(-.32,Math.min(.32,yaw+Math.atan2(bendData[lookK],-bendData[lookK+1])));
 function update(dt:number,s:RouteState,hype:number){
  elapsed+=dt;activeRenderer=stage.renderer;bendCfg.w=1;
  const d=s.distance;
  const jump=Number.isNaN(lastS)||Math.abs(d-lastS)>40;
  if(jump){lastS=d;viewSlope=(reduced?.6:.35)*routeGrade(d);yaw=0;for(let i=0;i<4;i++){bendOptions.yaw=yaw;routeBendTable(d,bendData,bendOptions);yaw=lookTarget();}}
  heading+=routeHeadingAhead(lastS,d-lastS);lastS=d;
  // Look-ahead: keep the road 40 m ahead (where the next defenders are read) centred on screen, so a
  // bend never carries a challenge out of a narrow portrait view. Reduced motion: same framing, slower turn.
  yaw=smoothTo(yaw,lookTarget(),reduced?1.2:2.6,dt);
  viewSlope=smoothTo(viewSlope,(reduced?.6:.35)*routeGrade(d),reduced?1.5:3,dt);
  bendOptions.yaw=yaw;bendOptions.viewSlope=viewSlope;routeBendTable(d,bendData,bendOptions);
  skyUniforms.uYaw.value=heading+yaw;
  props.position.z=d;farDashes.position.z=d%4;
  const first=Math.floor((d-36)/CHUNK),last=Math.floor((d+146)/CHUNK);
  for(let chunk=first;chunk<=last;chunk++){const slot=((chunk%SLOTS)+SLOTS)%SLOTS;if(slotChunk[slot]!==chunk)buildChunk(slot,chunk);}
  if(stripes&&stripes!==grain){stripes.offset.y=(d/6)%1;}
  flagUniforms.uFlagTime.value=elapsed;flagUniforms.uFlagAmp.value=reduced?.04:.07+hype*.14;flagUniforms.uFlagRate.value=reduced?4:6+hype*6;
  // Lean into the bend (centripetal) and into the climb; reset by the rig's own pose each frame.
  const k=routeCurve(d),g=routeGrade(d),alive=s.lives>0?1:0;
  lean=smoothTo(lean,reduced?0:Math.max(-.16,Math.min(.16,s.speed*s.speed*k*.045))*alive,6,dt);
  pitch=smoothTo(pitch,reduced?0:Math.max(-.07,Math.min(.15,g*1.4))*alive,5,dt);
  // Dress changes are patched by runnerFx before their first draw; as a safety net the scene is rechecked every 2 s.
  patchClock-=dt;if(patchClock<=0){patchClock=2;bendTree(scene);}
 }
 /** Called after the rig's pose for this frame, right before render. */
 function pose(cam:T.Camera){
  if(body){body.rotation.z-=lean;body.rotation.x+=pitch;}
  sky.position.copy(cam.position);
  const fog=scene.fog as T.Fog,len=cam.position.length();fog.color.copy(fogColor);fog.near=len+30;fog.far=len+115;
 }
 function reset(){lastS=NaN;heading=0;lean=pitch=0;slotChunk.fill(-99999);}
 // Fill the table before the first (ready-screen) render, or every vertex would sit on the origin line.
 update(0,{distance:0,speed:13,lives:3},0);
 /** Teardown (Oct 9 2026 QA): drop the module-level hold on this game's renderer (it kept the last Breakaway Run's WebGL
  * context reachable after leaving), unless a newer runner has already taken over. */
 function dispose(){if(activeRenderer===stage.renderer)activeRenderer=null;}
 return{update,pose,reset,dispose,patch:bendTree,
  debug:()=>({yaw,viewSlope,lean,pitch,heading,table:Array.from(bendData.slice(0,8))}),
  /** Exposed for tests/debug: where a straight-frame point is drawn. */
  bendPoint(x:number,y:number,z:number,out:T.Vector3){const f=Math.max(0,Math.min(BEND_N-1.001,(-z-BEND_D0)/BEND_STEP)),i=Math.floor(f),t=f-i,j=i*4,
   cx=bendData[j]+(bendData[j+4]-bendData[j])*t,cz=bendData[j+1]+(bendData[j+5]-bendData[j+1])*t,h=bendData[j+2]+(bendData[j+6]-bendData[j+2])*t,H=bendData[j+3]+(bendData[j+7]-bendData[j+3])*t,extra=(-z-BEND_D0)-f*BEND_STEP,
   bank=Math.max(-.16,Math.min(.16,(bendData[j+6]-bendData[j+2])/BEND_STEP*bendCfg.z));
   return out.set(cx+Math.cos(h)*x+Math.sin(h)*extra,y+H-x*bank,cz+Math.sin(h)*x-Math.cos(h)*extra);},
 };
}
export type RunnerTrack=ReturnType<typeof createRunnerTrack>;
