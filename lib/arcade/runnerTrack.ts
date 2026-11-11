import * as T from 'three';
import type {ArcadeStage} from './arcadeStage';
import {RUNNER_INK,RUNNER_PAPER} from './looks/runner';
import {comicShaderEdit,createComicUniforms} from './comic/shading';
import {bakeParts,flipFaces,inkedPart,partAt} from './comic/ink';
import {routeBendTable,routeCurve,routeGrade,routeHeadingAhead,routeHeight,terrainAt,terrainOfZone,terrainZoneAt,TERRAINS,TERRAIN_ZONE,ROUTE_BEND_MIN,type TerrainId} from '../../components/games/runnerRoute';

/* ---- the coast road (Nov 10 2026, docs/arcade-aaa/runner-direction.md): one shader on the one terrain mesh, no extra draws ----
 * Road surface per terrain zone (turf stripes, sand ripples, cobbles, chalk, wet mud, a painted pier court, roof tiles, boards),
 * painted lane dashes and edge lines, a striped kerb, the promenade, the sea wall, the beach, a moving foam line and the sea with
 * its glitter path toward the sun are all computed per fragment from the absolute route distance. The sea side drops in the
 * vertex shader (wall, beach, sea level); the land side rolls into a terraced hillside from 22 m out (past every near prop).
 * Two zones at most are visible (zone 240 m > the 180 m window), so two colour sets and one boundary are enough. */
const terrainUniforms={uTerr:{value:new T.Vector4()},uZone:{value:new T.Vector4(1e9,0,0,0)},uSeaSide:{value:new T.Vector2()},
 uRoadA:{value:new T.Color()},uLandA:{value:new T.Color()},uAccA:{value:new T.Color()},uRoadB:{value:new T.Color()},uLandB:{value:new T.Color()},uAccB:{value:new T.Color()},
 uPaper:{value:new T.Color(RUNNER_PAPER)},uSand:{value:new T.Color('#f2d49a')},uSeaNear:{value:new T.Color('#1f8f96')},uSeaFar:{value:new T.Color('#2b6fa3')},uGlitter:{value:new T.Color('#fff1b0')},
 /** x: sun azimuth (radians from straight ahead), y: night lamp pools 0..1, z: glitter strength, w: foam/wave clock. */uSea:{value:new T.Vector4(-.4,0,1,0)},uLampCol:{value:new T.Color('#ffb14a')},
 /** The sun in the straight frame (x across, y up, z along): shades the hillside per fragment. */uSunS:{value:new T.Vector3(-.3,.27,-.9)}};
const TERRAIN_VERT_PARS=/* glsl */`uniform vec4 uTerr;uniform vec4 uZone;uniform vec2 uSeaSide;varying float vAlong;varying float vSide;varying float vHill;varying vec3 vWpos;`;
const TERRAIN_VERT_BEGIN=/* glsl */`#include <begin_vertex>
{float ax=abs(transformed.x),sAbs=uTerr.x-transformed.z;
 // Land side: a terraced hillside from 22 m out (scrolls with the route). Sea side: wall, beach, sea level.
 float k=clamp((ax-22.)/40.,0.,1.),hill=k*(3.2*sin(sAbs*.045+ax*.07)+1.8*sin(sAbs*.11-ax*.05)+3.4)*(1.+k*1.6);
 float coast=-(smoothstep(8.2,9.2,ax)*1.5+smoothstep(9.2,16.,ax)*.9);
 float seaR=mix(uSeaSide.x,uSeaSide.y,smoothstep(uZone.x-14.,uZone.x+14.,sAbs)),sea=transformed.x<0.?1.:seaR;
 vHill=mix(hill,coast,sea);transformed.y+=vHill;}`;
const TERRAIN_VERT_PROJECT=/* glsl */`#include <project_vertex>
vAlong=-transformed.z;vSide=transformed.x;vWpos=rbW.xyz;`;
const TERRAIN_FRAG_PARS=/* glsl */`uniform vec4 uTerr;uniform vec4 uZone;uniform vec2 uSeaSide;uniform vec4 uSea;uniform vec3 uRoadA,uLandA,uAccA,uRoadB,uLandB,uAccB,uPaper,uSand,uSeaNear,uSeaFar,uGlitter,uLampCol,uSunS;
varying float vAlong;varying float vSide;varying float vHill;varying vec3 vWpos;
vec4 rtGlow=vec4(0.);float rtShade=1.;
float rbHash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}`;
const TERRAIN_FRAG=/* glsl */`#include <color_fragment>
{float s=uTerr.x+vAlong,ax=abs(vSide),tB=smoothstep(uZone.x-7.,uZone.x+7.,s),pat=tB<.5?uZone.y:uZone.z,line=0.;
 vec3 road=mix(uRoadA,uRoadB,tB),land=mix(uLandA,uLandB,tB),acc=mix(uAccA,uAccB,tB),ink=vec3(.016,.01,.027),col;
 if(ax<=4.5){col=road;
  if(pat<.5)col*=.88+.12*step(.5,fract(s/6.));
  else if(pat<1.5)line=.16*step(.82,fract(s*.9+sin(vSide*1.3)*1.2));
  else if(pat<2.5){vec2 c=vec2(vSide*1.5+floor(s*1.5)*.5,s*1.5),f=fract(c);float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y));line=.5*(1.-smoothstep(.03,.1,e));col*=.86+.22*rbHash(floor(c));}
  else if(pat<3.5){col*=.94+.06*step(.5,fract(s/5.));line=.1*step(.93,rbHash(floor(vec2(vSide,s)*3.)));}
  else if(pat<4.5)col*=.78+.3*step(.5,sin(s*.7+vSide*1.1)*.5+.5+.2*sin(s*2.3-vSide*3.));
  else if(pat<5.5){float g=max(step(.95,fract(s/6.)),step(.94,fract(vSide/2.4+.5)));col=mix(col,uPaper,g*.75);col=mix(col,acc,.8*step(abs(fract(s/12.)-.5),.012*12./6.)*step(ax,1.2));}
  else if(pat<6.5){line=.34*step(.9,fract(s*1.2));col*=.9+.14*step(.5,fract(vSide*.8+floor(s*1.2)*.5));}
  else{line=.5*step(.93,fract(s*1.6));col*=.9+.16*rbHash(vec2(floor(s*1.6),1.));}
  // Painted lines: two dashed lane lines and a solid edge line each side.
  col=mix(col,uPaper,.94*max(step(abs(ax-1.2),.075)*step(fract(s/4.),.5),step(abs(ax-4.12),.07)));
  // Night: a pool of lamp light every 30 m, on the lamp's side (runnerTrack puts the lamp post at the same spot).
  if(uSea.y>.01){float cell=floor(s/30.),sd=mod(cell,2.)<.5?-1.:1.;vec2 lp=vec2(vSide-sd*3.6,(s-cell*30.-15.)*.72);float pool=1.-smoothstep(2.2,5.2,length(lp));rtGlow.a=pool*uSea.y;rtGlow.rgb=uLampCol*pool*pool*uSea.y*.22;}}
 else if(ax<=5.4){col=mix(uPaper,acc,step(.5,fract(s/3.)));line=max(step(ax,4.58),step(5.32,ax));}
 else if(vSide<0.||mix(uSeaSide.x,uSeaSide.y,tB)>.5){
  if(ax<=8.2){col=uPaper*vec3(.95,.86,.76);vec2 f=fract(vec2(ax*.72,s*.36+floor(ax*.72)*.5));line=max(.3*step(min(f.x,f.y),.035),step(7.9,ax));}
  else if(ax<=9.25){col=uPaper*vec3(.78,.66,.66);line=max(.45*step(fract(s*.9+ax*3.),.1),.9*step(9.15,ax));}
  else{float shore=13.4+sin(s*.21)*.9+sin(s*.057+1.7)*.7,foam=shore+.55+.4*sin(uSea.w*1.2+s*.35);
   if(ax<shore){col=uSand;line=.14*step(.86,fract(ax*1.7+sin(s*.5)*.4));col*=.9+.1*step(shore-1.1,ax);}
   else if(ax<foam)col=mix(uPaper,vec3(1.),.6);
   else{float d=ax-foam+sin(s*.13)*1.6;col=d<5.?mix(uSeaNear,uPaper,.28):d<22.?uSeaNear:d<70.?mix(uSeaNear,uSeaFar,.55):uSeaFar;
    // Wave strokes: short pale dashes in rows parallel to the shore, drifting.
    vec2 gd=vWpos.xz-cameraPosition.xz;float dist=length(gd),row=floor(ax*.7),seg=fract(s*.09+rbHash(vec2(row,3.))*9.+uSea.w*.04*(1.+rbHash(vec2(row,7.))));
    col=mix(col,uPaper,.5*step(seg,.3)*step(fract(ax*.7),.2)*(1.-smoothstep(45.,95.,dist)));
    // Glitter path: dashes that crowd toward the sun's bearing.
    float az=atan(gd.x,-gd.y),gl=exp(-pow((az-uSea.x)/.12,2.)),gv=log(max(dist,1.))*19.-uSea.w*.7,gr=floor(gv),gu=az*22.+rbHash(vec2(gr,1.))*7.;
    float gdash=step(fract(gv),.38)*step(abs(fract(gu)-.5),.36)*step(rbHash(vec2(floor(gu),gr)),gl*1.15);
    col=mix(col,uGlitter,gdash*uSea.z);}}}
 else if(ax<=6.55){col=mix(land,road,.3)*.94;line=.4*step(.93,rbHash(floor(vec2(vSide*3.,s*1.5))));}
 // A dry-stone wall top between the verge and the fields.
 else if(ax<=7.1){col=uPaper*vec3(.9,.82,.78)*(.9+.14*rbHash(vec2(floor(s*.9+floor(ax*3.6)*.5),floor(ax*3.6))));line=max(max(step(ax,6.62),step(7.03,ax)),.5*step(.88,fract(s*.9+floor(ax*3.6)*.5)));}
 else{// Land: the slope of the hill (same function as the vertex shader) decides its print band, so hills have a lit and a shaded side.
  float k=clamp((ax-22.)/40.,0.,1.),p1=s*.045+ax*.07,p2=s*.11-ax*.05,hA=3.2*sin(p1)+1.8*sin(p2)+3.4,hK=k*(1.+k*1.6);
  float hx=(k>0.&&k<1.?(1.+3.2*k)/40.:0.)*hA+hK*(.224*cos(p1)-.09*cos(p2)),hs=hK*(.144*cos(p1)+.198*cos(p2));
  rtShade=(.175+.83*max(0.,dot(normalize(vec3(-hx*sign(vSide),1.,hs)),uSunS)))/(.175+.83*uSunS.y);
  if(vHill>.9){// Terraces: a dry-stone riser every 2.4 m of height, planted rows that follow the contour on each step.
   float tv=vHill*.42,ti=floor(tv),tf=fract(tv),th=rbHash(vec2(ti,floor(s*.025+ti*.37)));
   col=land*(.78+.36*th);col=mix(col,acc,step(.8,th)*.25);col=mix(col,uSand,step(th,.22)*.45);
   line=.22*step(.3,tf)*step(fract(tf*4.3+th),.2);
   if(tf<.2){col=mix(uPaper,land,.25)*vec3(.92,.84,.8);line=max(.9*step(tf,.03),max(.9*step(.172,tf),.4*step(.84,fract(s*.8+ti*.37))));}}
  else{// Patchwork fields with planted rows, parted by hedgerows.
   vec2 fc=vec2(ax*.085+sin(s*.02)*.6,s*.04),cell=floor(fc),ff=fract(fc);float h=rbHash(cell),he=min(min(ff.x,1.-ff.x)/.085,min(ff.y,1.-ff.y)/.04);
   col=land*(.84+.3*h);col=mix(col,acc,step(.86,h)*.3);col=mix(col,uSand,step(h,.14)*.5);
   col*=1.-.2*step(.45,h)*step(fract((h>.72?ax:s)*.9),.2);
   if(he<.6){col=vec3(.1,.36,.25)*(.85+.4*rbHash(floor(vec2(ax,s)*1.3)));line=.8*step(.46,he);}}}
 col=mix(col,ink,clamp(line,0.,1.));
 diffuseColor.rgb*=col;}`;
function terrainShader(m:T.Material){
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,terrainUniforms);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+TERRAIN_VERT_PARS).replace('#include <begin_vertex>',TERRAIN_VERT_BEGIN).replace('#include <project_vertex>',TERRAIN_VERT_PROJECT);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+TERRAIN_FRAG_PARS).replace('#include <color_fragment>',TERRAIN_FRAG);};
 m.customProgramCacheKey=()=>'runner-terrain-coast-2';
}
/** JS mirrors of the terrain vertex offsets, so props stand on the beach and on the hillside. */
const coastY=(ax:number)=>{const a=Math.min(1,Math.max(0,ax-8.2)),b=Math.min(1,Math.max(0,(ax-9.2)/6.8));return-(a*a*(3-2*a)*1.5+b*b*(3-2*b)*.9);};
const hillY=(ax:number,s:number)=>{const k=Math.min(1,Math.max(0,(ax-22)/40));return k*(3.2*Math.sin(s*.045+ax*.07)+1.8*Math.sin(s*.11-ax*.05)+3.4)*(1+k*1.6);};
/** The coast road per terrain zone: road surface, land beside it, accent (kerb stripe, shutters, bunting), sea on both sides? */
const COAST:Record<TerrainId,{road:string;land:string;accent:string;seaR:number}>={
 grass:{road:'#57b56a',land:'#86c867',accent:'#f0452e',seaR:0},
 sand:{road:'#f4d08c',land:'#e7c27e',accent:'#19b5a5',seaR:0},
 cobbles:{road:'#b3a3b0',land:'#cdb78c',accent:'#2f6fb0',seaR:0},
 snow:{road:'#f6f0e4',land:'#d9d0bd',accent:'#2f6fb0',seaR:0},
 mud:{road:'#96694c',land:'#7fae62',accent:'#ffc83a',seaR:0},
 neon:{road:'#2f66b3',land:'#cdb78c',accent:'#ffc83a',seaR:0},
 rooftop:{road:'#dd6a42',land:'#ecd9b8',accent:'#2f6fb0',seaR:0},
 bridge:{road:'#c2915e',land:'#2b6fa3',accent:'#f0452e',seaR:1},
};

/* ---- comic shading (Nov 10 2026): chained onto every lit runner material next to the bend, so it costs no pass and no draw ----
 * The shading itself (shadow / light bands, the 45 degree halftone turn, tinted shadows, the sun rim and the ink edge of constant
 * pixel width) is the shared arcade kit: lib/arcade/comic/shading.ts. This file keeps what only the coast road has: the hill-slope
 * print band and lamp glow on the terrain, the lamp pools and lightning rim on characters, and the switch that keeps materials
 * shared with other scenes unshaded there (runnerBendCfg.w, the same switch as the bend). */
const inkUniforms={...createComicUniforms({ink:RUNNER_INK}),
 /** x: route distance, y: lamp pools 0..1, z: lightning 0..1. Characters walk through the same pools the road shows. */uInkLamp:{value:new T.Vector4()},uInkLampCol:terrainUniforms.uLampCol};
const INK_PARS=/* glsl */`uniform vec4 uInkLamp;uniform vec3 uInkLampCol;
#ifdef RUNNER_RIM
varying vec2 vRbS;
#endif
#ifndef RUNNER_BEND_FRAG
#define RUNNER_BEND_FRAG
uniform vec4 runnerBendCfg;
#endif`;
const INK_HOOKS={
 terrainLit:/* glsl */`rkLit*=rtShade;rkT=max(clamp((rkLit-uInkBand.x)/(uInkBand.y-uInkBand.x),0.,1.),rtGlow.a);`,
 terrainGlow:/* glsl */`rkCol+=rtGlow.rgb;`,
 // Night: the street-lamp pools the road shows (same cells, same side) warm whoever runs through them.
 lamp:/* glsl */`if(uInkLamp.y>.01){float rs=uInkLamp.x-vRbS.y,cell=floor(rs/30.),sd=mod(cell,2.)<.5?-1.:1.;vec2 lp=vec2(vRbS.x-sd*3.6,(rs-cell*30.-15.)*.72);
  float pool=(1.-smoothstep(2.4,5.8,length(lp)))*uInkLamp.y;rkCol=mix(rkCol,rkBase*uInkLampCol*1.12,pool*.9);rkCol=mix(rkCol,uInkLampCol*1.15,pool*smoothstep(.4,.52,rkNV)*.75);}`,
 // Lightning prints a white rim all round.
 lightning:/* glsl */`rkCol=mix(rkCol,vec3(1.),uInkLamp.z*smoothstep(.3,.45,rkNV));`,
};
/** Exposed for tests: the comic shading edit (fragment side) with the runner's hooks. Skips unlit and depth shaders. */
export function runnerInkShader(shader:{fragmentShader?:string;uniforms:Record<string,T.IUniform>},rim=false,terrain=false){
 return comicShaderEdit(shader,{uniforms:{...inkUniforms,...bendUniforms},rim,gate:'runnerBendCfg.w>.5',defines:(rim?'#define RUNNER_RIM\n':'')+(terrain?'#define RUNNER_TERRAIN\n':''),pars:INK_PARS,
  afterLit:terrain?INK_HOOKS.terrainLit:'',afterTone:terrain?INK_HOOKS.terrainGlow:'',rimLight:INK_HOOKS.lamp,rimAfter:INK_HOOKS.lightning});
}

/* ---- props with their ink outline baked in: inkedPart / partAt / bakeParts are the kit's (lib/arcade/comic/ink.ts) ---- */
export {inkedPart,partAt,bakeParts};
const at=partAt;
/** Whitewashed village house: plinth band, terracotta hip roof, chimney, blue door and shutters. Door faces +z (the camera). */
function houseGeometry(){const out:T.BufferGeometry[]=[];
 inkedPart(out,new T.BoxGeometry(3.6,2.5,3.2),'#ffffff',at(0,1.25,0),.075);
 inkedPart(out,new T.BoxGeometry(3.66,2.4,3.26),'#e9b35a',at(0,-.65,0),0);
 const roof=new T.ConeGeometry(2.75,1.3,4,1);roof.scale(1,1,.9);inkedPart(out,roof,'#e2643c',at(0,3.15,0,Math.PI/4),.075,true);
 inkedPart(out,new T.BoxGeometry(.42,.95,.42),'#ffffff',at(1,3.35,.35),.05);
 inkedPart(out,new T.BoxGeometry(.78,1.4,.1),'#2f6fb0',at(-.65,.7,1.63),.04);
 inkedPart(out,new T.BoxGeometry(.66,.72,.1),'#2f6fb0',at(.8,1.55,1.63),.04);
 for(const z of[-.75,.75])inkedPart(out,new T.BoxGeometry(.1,.72,.6),'#2f6fb0',at(-1.83,1.55,z),.04);
 return bakeParts(out);}
/** Coconut palm: leaning three-part trunk and six cut-paper fronds, each with a dark under-leaf as its outline. */
function palmGeometry(){const out:T.BufferGeometry[]=[];let x=0,y=0;const lean=[.08,.17,.27];
 for(let i=0;i<3;i++){const h=1.4,l=lean[i];inkedPart(out,new T.CylinderGeometry(.12-i*.015,.16-i*.015,h+.06,5,1,true),i%2?'#c79763':'#b5834f',at(x+Math.sin(l)*h/2,y+Math.cos(l)*h/2,0,0,-l),.05,true);x+=Math.sin(l)*h;y+=Math.cos(l)*h;}
 const P=[[0,0,.03],[.95,.4,.36],[1.9,-.2,.27],[2.4,-.95,0]];
 const blade=(grow:number,drop:number)=>{const v:number[]=[],p=P.map(([px,py,w])=>[px*grow,py-drop,w*grow]),tri=(a:number[],b:number[],c:number[])=>v.push(...a,...b,...c),L=(i:number)=>[p[i][0],p[i][1],-p[i][2]],R=(i:number)=>[p[i][0],p[i][1],p[i][2]];
  tri(L(0),R(1),L(1));tri(L(1),R(1),L(2));tri(R(1),R(2),L(2));tri(L(2),R(2),L(3));
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));return g;};
 for(let k=0;k<6;k++){const m=at(x,y,0,k/6*Math.PI*2+.35,(k%2)*.14-.02);
  const top=blade(1,0);top.computeVertexNormals();inkedPart(out,top,k%2?'#3f9f5f':'#2f8a5a',m,0);
  const under=flipFaces(blade(1,0));under.computeVertexNormals();inkedPart(out,under,'#27765a',m,0);
  const edge=blade(1.13,.045);edge.computeVertexNormals();inkedPart(out,edge,RUNNER_INK,m,0);}
 return bakeParts(out);}
/** Beach parasol: striped canopy, pole and a towel. */
function parasolGeometry(){const out:T.BufferGeometry[]=[];
 inkedPart(out,new T.CylinderGeometry(.035,.035,2,5,1,true),'#fff3d6',at(0,1,0),0);
 inkedPart(out,new T.ConeGeometry(1.3,.52,8,1,true),tri=>tri%2?'#ffffff':'#f0452e',at(0,2.1,0,0,.12),.06,true);
 inkedPart(out,new T.BoxGeometry(1.7,.05,.8),'#19b5a5',at(1.1,.03,.5,.3),0);
 return bakeParts(out);}

/** Cypress: the dark flame-shaped tree of every terraced hillside. */
function cypressGeometry(){const out:T.BufferGeometry[]=[];
 inkedPart(out,new T.CylinderGeometry(.09,.12,.6,4,1,true),'#8a5a3c',at(0,.3,0),0);
 inkedPart(out,new T.ConeGeometry(.62,3.6,5,1),tri=>tri%2?'#2f7a52':'#256a4e',at(0,2.3,0),.075,true);
 return bakeParts(out);}
/** Sail boat for the bay: inked hull, mast, a mainsail and a jib (both sides drawn). */
function boatGeometry(){const out:T.BufferGeometry[]=[];
 const hull=new T.CylinderGeometry(.6,.34,.5,4,1);hull.rotateY(Math.PI/4);hull.scale(2.5,1,.85);inkedPart(out,hull,'#ffffff',at(0,.22,0),.07,true);
 inkedPart(out,new T.BoxGeometry(.08,2.9,.08),RUNNER_INK,at(.1,1.75,0),0);
 const sail=(p:number[],hex:string)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...p,p[0],p[1],p[2],p[6],p[7],p[8],p[3],p[4],p[5]],3));g.computeVertexNormals();inkedPart(out,g,hex,at(0,0,0),0);};
 sail([.2,.62,0,1.55,.62,0,.2,3.1,0],'#ffffff');sail([0,.62,0,-1.25,.62,0,0,2.6,0],'#ffc83a');
 return bakeParts(out);}

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
varying vec2 vRbS;
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
vRbS=rbW.xz;
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
 // Comic shading rides the same edit. Characters (bean skin) and anything flagged userData.runnerRim also get the rim and ink edge.
 const rim=!!m.userData.runnerRim||'beanUniforms' in m,terrain=!!m.userData.runnerTerrain;
 m.onBeforeCompile=(shader,renderer)=>{base.call(m,shader,renderer);runnerBendShader(shader);runnerInkShader(shader,rim,terrain);};
 m.customProgramCacheKey=()=>(key??baseKey.call(m))+'|runner-bend-1'+(rim?'|rim':'')+'|ink-2';
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
const CHUNK=30,SLOTS=7,PER={box:16,house:5,palm:4,parasol:1,glow:1,flag:8,tree:6,boat:1};
type RouteState={distance:number;speed:number;lives:number};

export function createRunnerTrack(stage:ArcadeStage){
 const {scene,mobile,reduced}=stage;
 activeRenderer=stage.renderer;bendCfg.w=1;
 // The look's environment is empty for the runner (lib/arcade/looks/runner.ts); the stage scenery group stays unused.
 stage.scenery.clear();stage.scenery.visible=false;
 let sunLight:T.DirectionalLight|null=null;scene.traverse(o=>{if((o as T.DirectionalLight).isDirectionalLight)sunLight=o as T.DirectionalLight;});
 const sun=sunLight as T.DirectionalLight|null,dotCell=stage.renderer.getPixelRatio();
 inkUniforms.uInkBand.value.z=3.4*dotCell;

 /* ---- terrain + road + sea: one tessellated mesh in the straight frame, bent by the shader ---- */
 const XS=[-230,-130,-75,-44,-26,-16,-13,-10.5,-9.2,-8.2,-7,-5.4,-4.5,-2.4,0,2.4,4.5,5.4,7,8.2,9.2,10.5,13,16,22,27,33,40,48,58,72,90,120,160],Z0=21,Z1=-147,ROW=3,rows=Math.round((Z0-Z1)/ROW)+1;
 const pos:number[]=[],idx:number[]=[];
 for(let r=0;r<rows;r++){const z=Z0-r*ROW;for(const x of XS)pos.push(x,-.005,z);}
 const W=XS.length;for(let r=0;r<rows-1;r++)for(let i=0;i<W-1;i++){const a=r*W+i,b=a+W;idx.push(a,a+1,b,a+1,b+1,b);}
 /** The hillside as the mesh draws it (straight between its columns), so houses and trees stand on the ground, not on the formula. */
 const LAND=XS.filter(x=>x>=22),hillAt=(ax:number,s:number)=>{let i=0;while(i<LAND.length-2&&ax>LAND[i+1])i++;const a=LAND[i],b=LAND[i+1],t=Math.min(1,Math.max(0,(ax-a)/(b-a))),ha=hillY(a,s);return ha+(hillY(b,s)-ha)*t;};
 const terrainGeo=new T.BufferGeometry();terrainGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));terrainGeo.setIndex(idx);terrainGeo.computeVertexNormals();
 const terrainMaterial=new T.MeshLambertMaterial({color:'#ffffff'});terrainMaterial.userData.runnerTerrain=true;terrainShader(terrainMaterial);
 const terrain=new T.Mesh(terrainGeo,terrainMaterial);terrain.name='runner-terrain';terrain.receiveShadow=true;terrain.frustumCulled=false;scene.add(terrain);

 /* ---- sky: one dome. Posterised bands, the stacked-disc sun (or moon), cut clouds, headlands, gulls, the far sea ---- */
 const fogColor=new T.Color('#ffcf7a');
 const skyUniforms={uYaw:{value:0},uTime:{value:0},uDot:{value:5*dotCell},uStars:{value:0},uStorm:{value:0},uSun:{value:new T.Vector3(-.4,.1,.085)},
  uTop:{value:new T.Color('#2f5fa8')},uMid:{value:new T.Color('#f08a5a')},uHaze:{value:fogColor},uSunCore:{value:new T.Color('#fff1b0')},uSunRing:{value:new T.Color('#ffb040')},
  uCloudLit:{value:new T.Color('#ffe1b0')},uCloudShade:{value:new T.Color('#d9707a')},uHeadA:{value:new T.Color('#7a4a78')},uHeadB:{value:new T.Color('#c9788a')},uSeaFar:{value:terrainUniforms.uSeaFar.value},uInkCol:{value:new T.Color(RUNNER_INK)}};
 const sky=new T.Mesh(new T.SphereGeometry(300,32,14),new T.ShaderMaterial({uniforms:skyUniforms,side:T.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec3 vDir;uniform float uYaw,uTime,uDot,uStars,uStorm;uniform vec3 uSun,uTop,uMid,uHaze,uSunCore,uSunRing,uCloudLit,uCloudShade,uHeadA,uHeadB,uSeaFar,uInkCol;
float h1(float n){return fract(sin(n*91.7)*43758.5);}
void main(){vec3 d=normalize(vDir);float e=d.y/max(.05,length(d.xz)),a=atan(d.x,-d.z);
 vec2 hp=mat2(.7071,-.7071,.7071,.7071)*gl_FragCoord.xy/uDot;float hd=length(fract(hp)-.5)*1.4142;
 // Posterised sky: six flat bands; the step from one band to the next is a dot screen.
 float gq=pow(clamp(e/.5,0.,1.),.72)*6.,q=(floor(gq)+step(hd*.5+.5,fract(gq)))/6.;
 vec3 col=q<.4?mix(uHaze,uMid,q/.4):mix(uMid,uTop,(q-.4)/.6);
 if(uStars>0.){vec2 sp=vec2(a*46.,e*46.),sc=floor(sp);float sh=h1(sc.x*7.3+sc.y*113.1);col+=uStars*step(.9,sh)*step(.1,e)*step(length(fract(sp)-.5),.07+.1*fract(sh*31.))*(.6+.4*sin(uTime*2.+sh*40.));}
 // Sun: stacked discs; the lower half is cut by widening slits, like a printed poster sun.
 vec2 sd=vec2(a-uSun.x,e-uSun.y);float sr=length(sd)/uSun.z;
 col=mix(col,uSunRing,.26*step(sr,2.7));col=mix(col,uSunRing,.5*step(sr,1.75));
 // Cut clouds: two layers of flat-bottomed cumulus, lit above, shaded below.
 for(int L=0;L<2;L++){float fl=float(L),b=(a+uYaw*(.5+.2*fl))*(3.2-fl)+uTime*(.004+.003*fl)+fl*7.3,cell=floor(b),x=fract(b)-.5,r=h1(cell+fl*31.);
  if(r>.36){float e0=.075+.07*fl+.05*h1(cell+3.),w=.3+.15*h1(cell+5.);
   float p=max(max(sqrt(max(0.,w*w-x*x)),.8*sqrt(max(0.,w*w*.5-(x-.17)*(x-.17)))),.7*sqrt(max(0.,w*w*.4-(x+.2)*(x+.2))))*(.17+.05*fl),y=e-e0;
   if(y>0.&&y<p)col=y<p*.34?uCloudShade:uCloudLit;}}
 // The disc goes in front of the clouds (it is the picture's anchor); the slits let the cloud colour through.
 if(sr<1.){float v=-sd.y/uSun.z,slit=step(0.,v)*step(.82-.5*v,fract(v*4.5));col=mix(uSunCore,col,slit);}
 // Storm front: a dark shelf of cloud with a scalloped edge; the sunset burns in the slit under it.
 if(uStorm>0.){float sb=a+uYaw*.6,edge=.2-.07*uStorm+.03*sin(sb*5.)+.02*abs(sin(sb*13.+uTime*.05));
  if(e>edge){float t=clamp((e-edge)/.22,0.,1.);col=mix(col,mix(uCloudShade,uTop,step(hd*.6+.2,t)),uStorm);}}
 // Gulls: three inked ticks that flap.
 for(int i=0;i<3;i++){float fi=float(i);vec2 gp=vec2(a+uYaw*.3-(-.45+fi*.4+.22*sin(uTime*.11+fi*2.)),e-(.2+.05*fi+.02*sin(uTime*.3+fi)));
  float gx=abs(gp.x),flap=.5+.45*sin(uTime*5.+fi*2.1);if(gx<.024&&abs(gp.y-gx*flap)<.0028+.0022*(1.-gx/.024))col=uInkCol;}
 // Far sea under the horizon (the terrain's sea runs into it), then two layers of headland.
 if(e<0.){col=mix(uSeaFar,uHaze,.3);float gl=exp(-pow((a-uSun.x)/.1,2.));col=mix(col,uSunCore,gl*step(.5,fract(e*240.+h1(floor(a*90.))*3.+uTime*.3)));}
 float q1=a+uYaw*.85,q2=a+uYaw,m1=sin(q1*3.1+1.)-.15,m2=sin(q2*2.3+2.9)-.3;
 if(e>-.004&&m1>0.&&e<.05*m1+.008*sin(q1*9.+.4)*min(1.,m1*4.))col=mix(uHeadB,uHaze,.4);
 float r2=.075*m2+.008*sin(q2*13.)*min(1.,m2*4.);
 if(e>-.006&&m2>0.&&e<r2){col=uHeadA;
  // A village on the near headland: whitewashed blocks with terracotta caps (windows lit once the stars are out).
  float vq=q2*62.,vc=floor(vq),vx=fract(vq),vh=h1(vc*3.7),vb=r2*(.16+.36*h1(vc+9.)),vt=vb+.008+.008*vh;
  if(m2>.2&&h1(floor(vq/7.)+.5)>.42&&vh>.3&&vx>.1&&vx<.9&&e>vb&&e<vt&&vt<r2*.92)col=e>vt-.0034?mix(vec3(.86,.36,.2),uHeadA,.15+.5*uStars):mix(mix(uCloudLit,vec3(1.),.35),vec3(1.,.8,.4),uStars*step(.55,fract(vx*2.6+vh))*step(vb+.002,e)*step(e,vt-.004));}
 // The lighthouse on the headland's seaward tip: striped tower, lantern, and a beam after dark.
 {float lu=(mod(q2*2.3+2.9-2.667+3.14159,6.28318)-3.14159)/2.3,lt=(e-.006)/.062,lw=.0062*(1.-.35*lt);
  if(lt>0.&&lt<1.){if(abs(lu)<lw+.0016)col=uInkCol;if(abs(lu)<lw)col=lt>.8?mix(uSunCore,vec3(1.),.4):mod(floor(lt*6.),2.)<.5?mix(uCloudLit,vec3(1.),.5):uSunRing;}
  if(lt>=1.&&lt<1.16&&abs(lu)<.0075*(1.16-lt)/.16)col=uInkCol;
  if(uStars>.05){vec2 lv=vec2(lu,(e-.058)*.8);float ld=length(lv),lb=abs(dot(lv/max(ld,1e-4),vec2(cos(uTime*.7),sin(uTime*.7)*.3)));col+=uSunCore*uStars*.34*step(.955,lb)*step(ld,.3)*(1.-ld/.3);}}
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`}));
 sky.name='runner-sky';sky.userData.runnerNoBend=true;sky.frustumCulled=false;sky.renderOrder=5;scene.add(sky);

 /* ---- route props: instanced, recycled in 30 m chunks that know the bend they sit on ---- */
 const props=new T.Group();props.name='runner-props';scene.add(props);
 const lambert=(vertexColors=false)=>new T.MeshLambertMaterial({color:'#ffffff',vertexColors});
 const boxes=new T.InstancedMesh(new T.BoxGeometry(1,1,1),lambert(),SLOTS*PER.box);boxes.castShadow=true;boxes.receiveShadow=true;
 const houses=new T.InstancedMesh(houseGeometry(),lambert(true),SLOTS*PER.house);houses.name='runner-houses';houses.receiveShadow=true;
 const palms=new T.InstancedMesh(palmGeometry(),lambert(true),SLOTS*PER.palm);palms.name='runner-palms';palms.castShadow=true;
 const parasols=new T.InstancedMesh(parasolGeometry(),lambert(true),SLOTS*PER.parasol);parasols.name='runner-parasols';
 /** Lamp lanterns: paper by day, lit by night (runnerWeather sets the colour). */
 const glowMaterial=new T.MeshBasicMaterial({color:RUNNER_PAPER});
 const glows=new T.InstancedMesh(new T.BoxGeometry(1,1,1),glowMaterial,SLOTS*PER.glow);
 const trees=new T.InstancedMesh(cypressGeometry(),lambert(true),SLOTS*PER.tree);trees.name='runner-cypress';
 const boats=new T.InstancedMesh(boatGeometry(),lambert(true),SLOTS*PER.boat);boats.name='runner-boats';
 const flagGeo=new T.PlaneGeometry(1.1,.66,6,1);flagGeo.translate(.55,0,0);
 const flagUniforms={uFlagTime:{value:0},uFlagAmp:{value:.08},uFlagRate:{value:7}};
 const flagMaterial=new T.MeshLambertMaterial({color:'#ffffff',side:T.DoubleSide});
 flagMaterial.onBeforeCompile=sh=>{Object.assign(sh.uniforms,flagUniforms);sh.vertexShader='uniform float uFlagTime;uniform float uFlagAmp;uniform float uFlagRate;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 {float fw=position.x/1.1,rz=modelMatrix[3].z+instanceMatrix[3].z,near=exp(-rz*rz/60.);
  float amp=uFlagAmp+near*.18;transformed.z+=sin(position.x*5.-uFlagTime*(uFlagRate+near*6.)+instanceMatrix[3].z*.7)*amp*fw;transformed.y-=fw*fw*max(0.,.14-amp*.6);}`);};
 flagMaterial.customProgramCacheKey=()=>'runner-flag-wave-1';
 const flags=new T.InstancedMesh(flagGeo,flagMaterial,SLOTS*PER.flag);
 const kinds=[[boxes,PER.box],[houses,PER.house],[palms,PER.palm],[parasols,PER.parasol],[glows,PER.glow],[flags,PER.flag],[trees,PER.tree],[boats,PER.boat]] as const;
 const dummy=new T.Object3D(),zero=new T.Matrix4().makeScale(0,0,0),colour=new T.Color();
 for(const [m,n] of kinds){m.frustumCulled=false;m.instanceMatrix.setUsage(T.DynamicDrawUsage);props.add(m);for(let i=0;i<SLOTS*n;i++){m.setMatrixAt(i,zero);m.setColorAt(i,colour.set('#ffffff'));}m.count=0;}
 // Heat (Nov 10 2026, pass 2): chunks write into staging arrays and the live instance buffers are packed, so a mesh only draws
 // the instances a chunk really placed (it used to draw every slot, most of them scaled to nothing).
 const stageM=kinds.map(([,n])=>new Float32Array(SLOTS*n*16)),stageC=kinds.map(([,n])=>new Float32Array(SLOTS*n*3)),usedN=kinds.map(()=>new Uint8Array(SLOTS));
 function pack(){for(let k=0;k<kinds.length;k++){const [m,per]=kinds[k],M=m.instanceMatrix.array as Float32Array,C=m.instanceColor!.array as Float32Array;let c=0;
   for(let slot=0;slot<SLOTS;slot++){const u=usedN[k][slot],o=slot*per;M.set(stageM[k].subarray(o*16,(o+u)*16),c*16);C.set(stageC[k].subarray(o*3,(o+u)*3),c*3);c+=u;}
   m.count=c;m.instanceMatrix.needsUpdate=true;m.instanceColor!.needsUpdate=true;}}
 const slotChunk=new Int32Array(SLOTS).fill(-99999);
 const hash=(a:number,b:number)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);};
 const FLAG_COLOURS=['#ffc83a','#f0452e','#19b5a5','#fff3d6','#2f6fb0'],WALLS=['#fff6e6','#ffe6cf','#ffdcdc','#e6efff','#fff0b4'],SHADES=['#ffffff','#ffe9a8','#bfeee6','#ffc9c0'];
 function buildChunk(slot:number,chunk:number){
  slotChunk[slot]=chunk;const n=[0,0,0,0,0,0,0,0];
  const put=(k:number,x:number,y:number,s:number,sx:number,sy:number,sz:number,hex:string,ry=0)=>{const [m,per]=kinds[k];if(n[k]>=per)return;dummy.position.set(x,y,-s);dummy.rotation.set(0,ry,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();const i=slot*per+n[k]++;dummy.matrix.toArray(stageM[k],i*16);colour.set(hex).toArray(stageC[k],i*3);void m;};
  const box=(x:number,y:number,s:number,w:number,h:number,d:number,hex:string)=>put(0,x,y,s,w,h,d,hex);
  const s0=chunk*CHUNK,curve=routeCurve(s0+CHUNK/2),bend=Math.abs(curve)>ROUTE_BEND_MIN*.8,outside=curve>0?-1:1;
  const tid=terrainAt(s0+CHUNK/2),pal=COAST[tid],sea2=pal.seaR>.5;
  // One street lamp per chunk, alternating sides: at night the terrain shader paints its pool of light at this very spot.
  {const side=(((chunk%2)+2)%2)?1:-1,x=side*8,s=s0+15;box(x,2.1,s,.11,4.2,.11,RUNNER_INK);box(x-side*.45,4.2,s,1,.09,.09,RUNNER_INK);box(x-side*.9,4.24,s,.52,.09,.52,RUNNER_INK);put(4,x-side*.9,4.03,s,.36,.32,.36,'#ffffff');}
  for(const side of[-1,1]){const k=hash(chunk,side),seaSide=side<0||sea2;
   // Bunting lines the outside of every bend: it marks the curve early and waves as you pass.
   if(bend&&side===outside)for(let f=0;f<4;f++){const s=s0+3+f*7.5,x=side*8.05;box(x,1.4,s,.08,2.8,.08,RUNNER_PAPER);put(5,x,2.35,s,1,1,1,FLAG_COLOURS[(chunk+f)%FLAG_COLOURS.length],side<0?Math.PI:0);}
   if(seaSide){
    // Sea side: palms rooted on the beach rise over the sea wall; parasols and towels on the sand.
    if(sea2){for(let p=0;p<3;p++)box(side*8.05,.55,s0+p*10+2,.14,1.1,.14,RUNNER_PAPER);box(side*8.05,1.08,s0+15,.1,.1,30,pal.accent);if(k<.5){box(side*8.5,3.6,s0+15,.34,7.2,.34,RUNNER_PAPER);box(side*8.5,7.3,s0+15,.6,.2,.6,pal.accent);}continue;}
    for(let p=0;p<2;p++){const h=hash(chunk+p*13,side+2);if(h<.62){const ax=10.1+h*3.2,g=.95+h*.6;put(2,side*ax,coastY(ax)-.1,s0+4+p*14+h*8,g,g,g,'#ffffff',h*17);}}
    if(k<.6){const ax=11.2+k*2.6;put(3,side*ax,coastY(ax),s0+9+k*22,1,1,1,SHADES[Math.floor(k*40)%SHADES.length],k*9);}
    // A sail boat out in the bay, most chunks.
    {const b=hash(chunk,side+21);if(b<.7){const ax=24+b*52,g=1.5+b*1.4;put(7,side*ax,-2.42,s0+4+b*30,g,g,g,b<.3?'#ffd9c2':'#ffffff',b*40);}}
    continue;}
   // Land side: a house or a pair of palms by the road, and the village climbing the hillside behind.
   const s=s0+4+k*20;
   if(tid==='rooftop'&&k<.5){const x=side*(9.6+k*4);box(x,.7,s,1.1,1.4,1.1,WALLS[1]);box(x,1.6,s,.5,.5,.5,pal.accent);}
   else if(k<.42){const x=side*(12.6+hash(chunk,side+5)*4.5),g=.95+k*.5;put(1,x,0,s,g,g,g,WALLS[Math.floor(k*50)%WALLS.length],-side*.12+k);}
   else if(k<.82){for(const dz of[0,9]){const ax=9.4+hash(chunk+dz,side)*3.4,g=1+hash(chunk+dz,side+7)*.45;put(2,side*ax,0,s+dz,g,g,g,'#ffffff',(chunk+dz)*1.7);}}
   // The village on the terraces: each house sits on the drawn slope (its plinth runs into the ground) with a cypress beside it.
   for(let v=0;v<3;v++){const h=hash(chunk*3+v,side+11);if(h>.82)continue;const ax=27+h*26,sv=s0+3+v*10+h*5,g=1.15+h*.8;put(1,side*ax,Math.min(hillAt(ax-2.2*g,sv),hillAt(ax+2.2*g,sv))+.15,sv,g,g,g,WALLS[(chunk+v)%WALLS.length],h*6);
    {const tx=ax+2.6*g+1,ts=sv-1.5,tg=1+h*.9;put(6,side*tx,hillAt(tx,ts)-.2,ts,tg,tg,tg,'#ffffff',h*9);}}
   // Mid-ground: cypresses along the field edges (the hedgerows are drawn on the fields), so the land steps back in layers.
   for(let v=0;v<3;v++){const h=hash(chunk*5+v,side+17);if(h>.7)continue;const ax=14.5+h*9,ts=s0+2+v*10+h*6,tg=.8+h*.7;put(6,side*ax,0,ts,tg,tg,tg,'#ffffff',h*5);}

  }
  for(let k=0;k<kinds.length;k++)usedN[k][slot]=n[k];
 }

 bendTree(scene);

 /* ---- per frame ---- */
 let yaw=0,viewSlope=0,lean=0,pitch=0,heading=0,lastS=NaN,patchClock=0,elapsed=0,zoneShown=-1,sunAz=-.4;
 const player=scene.getObjectByName('runner-player'),body=player?.getObjectByName('arcade-body-offset');
 const bendOptions={d0:BEND_D0,step:BEND_STEP,n:BEND_N,yaw:0,viewSlope:0,drop:.0006};
 /** Where the sun sits and how it lights: base azimuth (rad from straight ahead, negative = sea side), light elevation. runnerWeather tunes these per sky. */
 const sunAim={az:-.36,elev:.27,swing:.13},sunDir=new T.Vector3(),sunQ=new T.Quaternion();
 /** Yaw that centres the route point LOOK m ahead, measured from the last table (a damped feedback loop). */
 const LOOK=40,lookK=(LOOK-BEND_D0)/BEND_STEP*4,lookTarget=()=>Math.max(-.32,Math.min(.32,yaw+Math.atan2(bendData[lookK],-bendData[lookK+1])));
 function update(dt:number,s:RouteState,hype:number){
  elapsed+=dt;activeRenderer=stage.renderer;bendCfg.w=1;
  const d=s.distance;
  const jump=Number.isNaN(lastS)||Math.abs(d-lastS)>40;
  if(jump){lastS=d;viewSlope=(reduced?.6:.2)*routeGrade(d);yaw=0;for(let i=0;i<4;i++){bendOptions.yaw=yaw;routeBendTable(d,bendData,bendOptions);yaw=lookTarget();}}
  heading+=routeHeadingAhead(lastS,d-lastS);lastS=d;
  // Look-ahead: keep the road 40 m ahead (where the next defenders are read) centred on screen, so a
  // bend never carries a challenge out of a narrow portrait view. Reduced motion: same framing, slower turn.
  yaw=smoothTo(yaw,lookTarget(),reduced?1.2:2.6,dt);
  // Round 3: a smaller horizon correction so climbs and descents read clearly (the chase camera rises/pulls back instead).
  viewSlope=smoothTo(viewSlope,(reduced?.6:.2)*routeGrade(d),reduced?1.5:3,dt);
  bendOptions.yaw=yaw;bendOptions.viewSlope=viewSlope;routeBendTable(d,bendData,bendOptions);
  // Terrain zones: the boundary in view (or the next one) and its two looks.
  const zone=terrainZoneAt(d),start=zone*TERRAIN_ZONE,behind=zone>0&&d-start<40,za=behind?zone-1:zone,ta=terrainOfZone(za),tb=terrainOfZone(za+1),a=COAST[ta],b=COAST[tb];
  terrainUniforms.uTerr.value.set(d,routeHeight(d),viewSlope,bendOptions.drop);terrainUniforms.uZone.value.set((za+1)*TERRAIN_ZONE,TERRAINS[ta].pattern,TERRAINS[tb].pattern,elapsed);
  if(zoneShown!==za){zoneShown=za;terrainUniforms.uRoadA.value.set(a.road);terrainUniforms.uLandA.value.set(a.land);terrainUniforms.uAccA.value.set(a.accent);terrainUniforms.uRoadB.value.set(b.road);terrainUniforms.uLandB.value.set(b.land);terrainUniforms.uAccB.value.set(b.accent);terrainUniforms.uSeaSide.value.set(a.seaR,b.seaR);}
  // The sun slides along the horizon as the route turns (bounded, so it never leaves the picture); the light follows it,
  // swung further to the side than the disc so shadows rake across the lanes instead of straight down them.
  sunAz=sunAim.az+sunAim.swing*Math.sin(heading*1.3)-yaw*.6;
  skyUniforms.uYaw.value=heading+yaw;skyUniforms.uTime.value=reduced?0:elapsed;skyUniforms.uSun.value.x=sunAz;terrainUniforms.uSea.value.x=sunAz;terrainUniforms.uSea.value.w=reduced?0:elapsed;
  {const la=sunAz*2.1,ce=Math.cos(sunAim.elev);sunDir.set(Math.sin(la)*ce,Math.sin(sunAim.elev),-Math.cos(la)*ce);terrainUniforms.uSunS.value.copy(sunDir);inkUniforms.uInkLamp.value.x=d;inkUniforms.uInkLamp.value.y=terrainUniforms.uSea.value.y;if(sun){sun.target.position.set(0,0,-24);sun.position.copy(sun.target.position).addScaledVector(sunDir,70);}}
  props.position.z=d;
  // Chunks wholly behind the camera are not built (pass 2: nothing 16 m behind the runner is ever in view).
  const first=Math.floor((d-16)/CHUNK),last=Math.floor((d+146)/CHUNK);
  {let built=false;for(let chunk=first;chunk<=last;chunk++){const slot=((chunk%SLOTS)+SLOTS)%SLOTS;if(slotChunk[slot]!==chunk){buildChunk(slot,chunk);built=true;}}if(built)pack();}
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
  inkUniforms.uInkSunV.value.copy(sunDir).applyQuaternion(sunQ.copy(cam.quaternion).invert());
  const fog=scene.fog as T.Fog,len=cam.position.length();fog.color.copy(fogColor);fog.near=len+48;fog.far=len+128;
 }
 function reset(){lastS=NaN;heading=0;lean=pitch=0;slotChunk.fill(-99999);zoneShown=-1;}
 // Fill the table before the first (ready-screen) render, or every vertex would sit on the origin line.
 update(0,{distance:0,speed:13,lives:3},0);
 /** Teardown (Oct 9 2026 QA): drop the module-level hold on this game's renderer (it kept the last Breakaway Run's WebGL
  * context reachable after leaving), unless a newer runner has already taken over. */
 function dispose(){if(activeRenderer===stage.renderer)activeRenderer=null;}
 return{update,pose,reset,dispose,patch:bendTree,
  /** Sky, shading and sea colours, retinted per route sky by runnerWeather (mutated in place, no allocation). */
  sky:skyUniforms,fogColor,ink:inkUniforms,sea:terrainUniforms,lantern:glowMaterial.color,sunAim,
  /** Current camera pitch smoothing of the route grade (for the cinematic camera). */viewSlope:()=>viewSlope,
  debug:()=>({yaw,viewSlope,lean,pitch,heading,sunAz,table:Array.from(bendData.slice(0,8))}),
  /** Exposed for tests/debug: where a straight-frame point is drawn. */
  bendPoint(x:number,y:number,z:number,out:T.Vector3){const f=Math.max(0,Math.min(BEND_N-1.001,(-z-BEND_D0)/BEND_STEP)),i=Math.floor(f),t=f-i,j=i*4,
   cx=bendData[j]+(bendData[j+4]-bendData[j])*t,cz=bendData[j+1]+(bendData[j+5]-bendData[j+1])*t,h=bendData[j+2]+(bendData[j+6]-bendData[j+2])*t,H=bendData[j+3]+(bendData[j+7]-bendData[j+3])*t,extra=(-z-BEND_D0)-f*BEND_STEP,
   bank=Math.max(-.16,Math.min(.16,(bendData[j+6]-bendData[j+2])/BEND_STEP*bendCfg.z));
   return out.set(cx+Math.cos(h)*x+Math.sin(h)*extra,y+H-x*bank,cz+Math.sin(h)*x-Math.cos(h)*extra);},
 };
}
export type RunnerTrack=ReturnType<typeof createRunnerTrack>;
