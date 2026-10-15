import * as T from 'three';
import {UW_SURFACE,UW_UNIFORMS,type ReefTheme} from './underwater';

/**
 * The deep-sea boats' water column (Oct 14 2026, user: "update the water scene for the boat. it doesn't look good. not sure what
 * that is"): the old 'blue-abyss' reef scattered tube sponges and table corals just under the surface of open water, which read
 * as floating junk. Deep water shows no bottom at all, so instead (with fishSchools.ts deep mode for the life):
 * - soft light shafts slanting down from the surface and fading into the dark (additive quads that turn to face the camera);
 * - faint plankton specks drifting slowly, fading with depth;
 * - one or two jellyfish pulsing gently as they drift (a dome and trailing tentacles).
 * Oct 14 2026 polish: the bell glows a little brighter as it contracts, the plankton twinkles, the light shafts breathe slowly
 * (all in the same shaders from the same time uniform: no extra draw, no CPU work).
 * The water itself darkens with depth through the theme's tint (underwater.ts applyReefWater), so no seabed is drawn.
 *
 * Heat (AGENTS.md): ONE merged mesh and ONE additive shader for everything (one draw), built once in boat-local space and
 * moved to the boat when a session begins; every motion is in the vertex shader from one time uniform. It exists only with the
 * fishing visuals, is visible only while fishing at a deep spot (fading in and out), and `frame()` is one uniform write.
 */
const KIND={shaft:0,speck:1,jelly:2};
type Build={center:number[];local:number[];kind:number[];seed:number[];uv:number[];index:number[]};
function quad(b:Build,c:[number,number,number],kind:number,seed:number,w:number,h:number,y0=-.5){
 const base=b.center.length/3;
 for(const [lx,ly,u,v] of [[-w/2,y0*h,0,0],[w/2,y0*h,1,0],[w/2,(y0+1)*h,1,1],[-w/2,(y0+1)*h,0,1]]){b.center.push(...c);b.local.push(lx,ly,0);b.kind.push(kind);b.seed.push(seed);b.uv.push(u,v);}
 b.index.push(base,base+1,base+2,base,base+2,base+3);
}
function jelly(b:Build,c:[number,number,number],seed:number){
 // Dome: a low-poly hemisphere (local y up), uv.y = 1 at the crown.
 const R=.28,seg=8,rings=3,base=b.center.length/3;
 for(let j=0;j<=rings;j++){const t=j/rings,phi=t*Math.PI/2;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;b.center.push(...c);b.local.push(Math.cos(a)*Math.cos(phi)*R,Math.sin(phi)*R*.8,Math.sin(a)*Math.cos(phi)*R);b.kind.push(KIND.jelly);b.seed.push(seed);b.uv.push(i/seg,.55+.45*t);}}
 for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=base+j*(seg+1)+i,d=a+seg+1;b.index.push(a,d,a+1,a+1,d,d+1);}
 // Tentacles: thin ribbons hanging below the rim (uv.y 0.5 at the rim to 0 at the tip; the shader sways them).
 for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3,x=Math.cos(a)*R*.7,z=Math.sin(a)*R*.7,len=.55+(k%3)*.18,w=.025,tb=b.center.length/3;// seed + k·0.1 stays on its jelly's side of 10
  for(const [lx,ly,u,v] of [[x-w,0,0,.5],[x+w,0,1,.5],[x+w,-len,1,0],[x-w,-len,0,0]]){b.center.push(...c);b.local.push(lx,ly,z);b.kind.push(KIND.jelly);b.seed.push(seed+k*.1);b.uv.push(u,v);}
  b.index.push(tb,tb+2,tb+1,tb,tb+3,tb+2);}
}
/** Boat-local layout: +z is out along the cast, +x across it (the mesh turns to the cast direction when a session begins). */
function buildColumn(phone:boolean){
 const b:Build={center:[],local:[],kind:[],seed:[],uv:[],index:[]};let s=7;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 const shafts=phone?3:5,specks=phone?60:140;
 for(let i=0;i<shafts;i++){const a=4+i/Math.max(1,shafts-1)*10+r()*2,x=(r()*2-1)*(2+a*.35);quad(b,[x,UW_SURFACE-.05,a],KIND.shaft,r()*100,.6+r()*.8,9,-1);}
 for(let i=0;i<specks;i++){const a=1.5+r()*15,x=(r()*2-1)*(1.5+a*.5),y=UW_SURFACE-.5-r()*5.5;quad(b,[x,y,a],KIND.speck,r()*100,.05+r()*.04,.05+r()*.04);}
 // Seeds: the first jelly below 10, the second above (the shader hides the second when the theme or a phone shows one).
 jelly(b,[-1.6,UW_SURFACE-2.4,7.5],1);jelly(b,[2.4,UW_SURFACE-3.2,11],11);
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(b.center,3));g.setAttribute('aLocal',new T.Float32BufferAttribute(b.local,3));
 g.setAttribute('aKind',new T.Float32BufferAttribute(b.kind,1));g.setAttribute('aSeed',new T.Float32BufferAttribute(b.seed,1));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));
 g.setIndex(b.index);return g;
}
const VERT=/* glsl */`
uniform float uTime,uJellies;attribute vec3 aLocal;attribute float aKind,aSeed;varying vec2 vUv;varying float vKind,vDepth,vSeed,vPulse;
void main(){
 vUv=uv;vKind=aKind;vSeed=aSeed;vPulse=0.;
 vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),up=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
 vec3 c=(modelMatrix*vec4(position,1.)).xyz,p;
 if(aKind<.5){// Light shaft: hangs from the surface, turned to face the camera about the vertical, slanting with the sun, swaying.
  vec3 side=normalize(vec3(right.x,0.,right.z));float sway=sin(uTime*.23+aSeed)*.25;
  p=c+side*(aLocal.x+(aLocal.y)*(-.32+sway*.2))+vec3(0.,aLocal.y,0.);}
 else if(aKind<1.5){// Plankton: tiny camera-facing specks drifting slowly.
  vec3 drift=vec3(sin(uTime*.11+aSeed)*.6,sin(uTime*.07+aSeed*1.7)*.35+mod(uTime*.03+aSeed,1.)*.3,cos(uTime*.09+aSeed*.6)*.6);
  p=c+drift+right*aLocal.x+up*aLocal.y;}
 else{// Jellyfish: the dome pulses (wider then taller), the tentacles trail and sway; it drifts in a slow loop and bobs.
  float hidden=step(10.,aSeed)*step(uJellies,1.5);float ph=uTime*1.7+aSeed,pulse=sin(ph);vec3 l=aLocal;vPulse=max(0.,-pulse);
  if(uv.y>.5){l.xz*=1.+.13*pulse;l.y*=1.-.1*pulse;}else{float k=(.5-uv.y)*2.;l.x+=sin(ph-k*2.5)*.08*k;l.z+=cos(ph*.8-k*2.)*.06*k;}
  vec3 drift=vec3(sin(uTime*.05+aSeed)*1.2,sin(uTime*.31+aSeed)*.25+max(0.,-pulse)*.05,cos(uTime*.04+aSeed)*1.2);
  p=c+drift+l*(1.-hidden);}
 vDepth=max(0.,${UW_SURFACE.toFixed(3)}-p.y);
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`;
const FRAG=/* glsl */`
uniform float uStrength,uShafts,uTime;uniform vec3 uUwShallow,uUwDeep,uPlankton,uJelly;varying vec2 vUv;varying float vKind,vDepth,vSeed,vPulse;
void main(){
 vec3 col;float a;
 if(vKind<.5){float across=1.-abs(vUv.x*2.-1.);a=pow(across,2.2)*smoothstep(0.,.35,vUv.y)*smoothstep(1.,.75,vUv.y)*pow(vUv.y,1.3)*.07*uShafts*(.78+.22*sin(uTime*.4+vSeed));col=mix(uUwShallow*1.6+vec3(.25,.3,.28),vec3(.8,.95,1.),.35);}
 else if(vKind<1.5){vec2 d=vUv*2.-1.;a=(1.-smoothstep(.2,1.,length(d)))*.55*exp(-vDepth*.28)*smoothstep(.1,.6,vDepth)*(.55+.45*sin(uTime*1.3+vSeed*7.));col=uPlankton;}
 else{float rim=vUv.y>.5?.35+.65*smoothstep(.55,1.,vUv.y):.55*vUv.y*2.;a=rim*.28*exp(-vDepth*.2)*(1.+.6*vPulse);col=uJelly*(.8+.35*vPulse);}
 // Into the haze: the deeper, the more of the water's own colour (matches the depth tint of everything else under the surface).
 col=mix(col,uUwDeep*2.,clamp(vDepth/7.,0.,.85));
 gl_FragColor=vec4(col*a*uStrength,1.);
 #include <colorspace_fragment>
}`;

export function createDeepSeaScene(scene:T.Scene,phone=false){
 const geometry=buildColumn(phone);
 const uniforms={uTime:{value:0},uStrength:{value:0},uShafts:{value:1},uJellies:{value:2},uPlankton:{value:new T.Color('#cfefff')},uJelly:{value:new T.Color('#c9a6ff')},
  uUwShallow:UW_UNIFORMS.uUwShallow,uUwDeep:UW_UNIFORMS.uUwDeep};
 const material=new T.ShaderMaterial({uniforms,vertexShader:VERT,fragmentShader:FRAG,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const mesh=new T.Mesh(geometry,material);mesh.name='fishing-deep-column';mesh.renderOrder=.62;mesh.frustumCulled=false;mesh.visible=false;mesh.matrixAutoUpdate=false;mesh.raycast=()=>{};scene.add(mesh);
 let strength=0,target=0;
 return {mesh,
  get busy(){return mesh.visible;},
  /** Show the column round a deep spot: `stand` and unit `dir` (the cast direction), the theme's look. */
  begin(stand:{x:number;z:number},dir:{x:number;z:number},theme:ReefTheme){
   const d=theme.deep;if(!d){target=0;return;}
   mesh.position.set(stand.x,0,stand.z);mesh.rotation.set(0,Math.atan2(dir.x,dir.z),0);mesh.updateMatrix();
   uniforms.uShafts.value=d.shafts;uniforms.uJellies.value=phone?Math.min(1,d.jellies):d.jellies;uniforms.uPlankton.value.set(d.plankton);uniforms.uJelly.value.set(d.jelly);
   target=1;mesh.visible=true;},
  end(){target=0;},
  frame(dt:number,reduced:boolean){
   if(!mesh.visible)return;
   strength=reduced?target:T.MathUtils.clamp(strength+Math.sign(target-strength)*Math.min(Math.abs(target-strength),dt/.8),0,1);
   uniforms.uStrength.value=strength;if(!reduced)uniforms.uTime.value=(uniforms.uTime.value+Math.min(dt,.1))%3600;
   if(strength<=0&&target===0)mesh.visible=false;},
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();},
 };
}
