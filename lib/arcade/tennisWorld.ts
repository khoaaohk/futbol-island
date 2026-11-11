import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type {TennisState} from '@/lib/games/soccerTennis';
import {tennisCourtMarks,tennisAtlas,tennisAtlasUv,TENNIS_ATLAS} from './tennisArena';
import {TENNIS_VENUES,TENNIS_SURFACE_INK,tennisVenueFor,type TennisVenue} from './tennisVenues';
import {aimComicSun,comicDotCell,comicMaterial,createComicUniforms,COMIC_INK,COMIC_PAPER,type ComicShaderOptions} from './comic/shading';
import {inkedPart,bakeParts,flipFaces} from './comic/ink';

/** Futbol Tennis world ("Club Marea, printed", Nov 10 2026): the beach club around the court in the arcade's comic house style
 * (lib/arcade/comic; docs/arcade-aaa/tennis-direction.md). Built once per stage.
 * Draw budget (main pass): sea + sky panel 1, sand 1, court 1, net cloth 1 + tape 1, core props 1, set props (beach
 * casters 1 + parasol row OR grandstand 1 + uncast detail 1, or the pier 1), club members 1 (instanced; idle life, head turns and
 * reactions in the vertex shader), lantern rig + bulbs 1 (evening), wind props 1 + palm fronds 1 (vertex-shader sway), bounce
 * puffs 1 / ball smudges 1 / gust lines 1 (each only while it has something to show). Shadow pass: core, beach casters,
 * row/stand, wind, fronds, tape. Everything static is merged into flat vertex-coloured meshes with their ink outline baked in as
 * an inverted hull (0 draws); nothing allocates per frame. The wind you feel in the rules (`tennis.wind`) drives flags, fronds,
 * the net shiver, the puffs, the gust lines and the whitecaps, so the wind is readable in the world. */
export const TENNIS_WORLD={dust:20,marks:10,gusts:8,lanterns:18,lanternsFar:9,markLife:9,netCols:30,members:48} as const;
/** Owner, Oct 27 2026: "no crowd, stands or umpire". The comic pass keeps the club members and the centre-court grandstand as flat
 * comic figures behind this one flag: set it to false and no member, umpire or stand is built (the parasol row stays on every beach stop).
 * Nov 11 2026 (owner: "remove crowd"): off. */
export const TENNIS_CLUB_CROWD=false;
type Kit={scene:T.Scene;mobile:boolean;reduced:boolean};
type Lights={sun:T.DirectionalLight;hemi:T.HemisphereLight;renderer:T.WebGLRenderer;scene:T.Scene};
const rng=(seed:number)=>()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
/** The shoreline (world z of the water's edge at world x): shared by the sand mesh and the sea shader. */
export const tennisShoreZ=(x:number)=>-14.6+Math.sin(x*.11)*.5+Math.sin(x*.31+1)*.2;
/** The printed horizon: the ground line (world z) the sky panel hangs from. Nothing is built beyond it. */
export const TENNIS_HORIZON_Z=-17.6;
/** Wind as the world shows it: signed strength in -1..1 from the rules' sideways push (m/s², peak 1.5) plus the venue's own breeze. */
export const tennisWorldWind=(wind:number,breeze:number)=>Math.abs(wind)>.01?Math.sign(wind)*Math.min(1,.35+Math.abs(wind)/1.5*.65):breeze;

// ---- merged, flat-coloured geometry with the ink outline baked in (lib/arcade/comic/ink.ts) ------------------------------------
function builder(){
 const parts:T.BufferGeometry[]=[],m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),one=new T.Vector3(1,1,1);
 /** Adds a scaled, turned, placed copy of `g` in a flat `color` (or one per triangle). `ink` > 0 wraps it in an ink hull that many
  * metres fat (`round` grows the hull radially: cylinders, cones, canopies). */
 function put(g:T.BufferGeometry,color:string|((tri:number)=>string),x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,ink=0,round=false){
  const k=g.clone();k.scale(sx,sy,sz);inkedPart(parts,k,color,m.compose(p.set(x,y,z),q.setFromEuler(e.set(rx,ry,rz)),one),ink,round);}
 function build(){return parts.length?bakeParts(parts.splice(0)):new T.BufferGeometry();}
 return{put,build};
}
/** Wind props (flags, bunting, fronds): thin sheets, so the outline is an ink backing sheet instead of a hull. `sway` = [weight, phase, flag]. */
function windBuilder(){
 const parts:T.BufferGeometry[]=[],c=new T.Color();
 function put(g:T.BufferGeometry,color:string,x:number,y:number,z:number,sway:(lx:number,ly:number,lz:number)=>[number,number,number]){
  const k=g.index?g.toNonIndexed():g.clone(),pos=k.attributes.position,n=pos.count,col=new Float32Array(n*3),sw=new Float32Array(n*3);c.set(color);
  for(let i=0;i<n;i++){const v=sway(pos.getX(i),pos.getY(i),pos.getZ(i));sw[i*3]=v[0];sw[i*3+1]=v[1];sw[i*3+2]=v[2];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  k.translate(x,y,z);k.setAttribute('color',new T.BufferAttribute(col,3));k.setAttribute('sway',new T.BufferAttribute(sw,3));k.deleteAttribute('uv');if(!k.attributes.normal)k.computeVertexNormals();parts.push(k);}
 function build(){const g=parts.length?mergeGeometries(parts)!:new T.BufferGeometry();for(const k of parts)k.dispose();parts.length=0;return g;}
 return{put,build};
}

// ---- printed court sheet (drawn once per tour stop): flat colour, ink marks, inked lines -----------------------------------------
/** Paints one court surface (apron included) into `canvas`. World metres map to pixels through `ppm`; +z (your side) is down.
 * Nothing here fakes light: no tone blobs, dusk wash or lamp pools (the comic bands and the lamp-pool hook do the lighting). */
function paintCourt(canvas:HTMLCanvasElement,v:TennisVenue,ppm:number,W:number,L:number){
 const g=canvas.getContext('2d')!,rand=rng(v.seed),X=(x:number)=>(x+W/2)*ppm,Z=(z:number)=>(z+L/2)*ppm,S=v.surface,[court,court2,lineCol,apron,mark]=TENNIS_SURFACE_INK[S],cw=canvas.width,ch=canvas.height;
 g.globalAlpha=1;g.lineCap='round';g.fillStyle=apron;g.fillRect(0,0,cw,ch);g.fillStyle=court;g.fillRect(X(-5.6),Z(-8.9),11.2*ppm,17.8*ppm);
 const stroke=(x0:number,z0:number,x1:number,z1:number,col:string,w:number,a=1,bow=0)=>{g.strokeStyle=col;g.globalAlpha=a;g.lineWidth=Math.max(1.5,ppm*w);g.beginPath();g.moveTo(X(x0),Z(z0));g.quadraticCurveTo(X((x0+x1)/2+bow),Z((z0+z1)/2),X(x1),Z(z1));g.stroke();g.globalAlpha=1;};
 if(S==='rubber'){for(let ix=-5;ix<5;ix++)for(let iz=-8;iz<8;iz++)if((ix+iz)&1){g.fillStyle=court2;g.fillRect(X(ix),Z(iz),ppm,ppm);}
  for(let ix=-5;ix<=5;ix++)stroke(ix,-8,ix,8,mark,.022,.6);for(let iz=-8;iz<=8;iz++)stroke(-5,iz,5,iz,mark,.022,.6);}
 if(S==='lawn')for(let i=0;i<Math.ceil(L/1.6);i++){g.fillStyle=i&1?court2:court;g.fillRect(0,i*1.6*ppm,cw,1.6*ppm+1);}
 if(S==='deck'){const plank=.41;for(let z=-L/2,i=0;z<L/2;z+=plank,i++){g.fillStyle=rand()<.45?court2:court;g.fillRect(0,Z(z),cw,plank*ppm+1);stroke(-W/2,z,W/2,z,mark,.026,.8);const off=rand()*3;for(let x=-W/2+off;x<W/2;x+=3.3)stroke(x,z+.05,x,z+plank-.05,mark,.026,.8);}}
 if(S==='clay'||S==='sand'){
  // The drag-mat as ink strokes: long, slightly bowed sweeps along the court, dark and light.
  for(let i=0;i<110;i++){const x=(rand()-.5)*W,z=(rand()-.5)*L,len=1.2+rand()*3.2;stroke(x,z,x+(rand()-.5)*.2,z+len,i%3?mark:court2,.028+rand()*.02,i%3?.5:.9,(rand()-.5)*.5);}
  // The brush left arcs where it turned behind each baseline.
  g.lineWidth=Math.max(1.5,ppm*.03);for(const z of[-9.2,9.2])for(let i=0;i<9;i++){g.strokeStyle=court2;g.beginPath();g.arc(X(-4.6+i*1.15),Z(z),(.5+rand()*.5)*ppm,0,Math.PI,z<0);g.stroke();}
  if(S==='sand')for(let i=0;i<60;i++){const x=(rand()-.5)*W,z=(rand()-.5)*L,a=rand()*3;g.fillStyle=mark;g.globalAlpha=.6;for(const k of[-1,1]){g.beginPath();g.ellipse(X(x+k*.12),Z(z+k*.16),ppm*.05,ppm*.09,a,0,7);g.fill();}g.globalAlpha=1;} // footprints
 }
 if(S==='hard')for(let i=0;i<26;i++){const x=(rand()-.5)*9.6,z=[-7.3,7.3,-4,4][i%4]+(rand()-.5)*2.6,a=rand()*Math.PI;stroke(x,z,x+Math.cos(a)*.5,z+Math.sin(a)*.3,mark,.035,.7);}
 // Where feet work the surface (behind both baselines, at the service lines) it prints as a dot screen, plus a few ink scuffs.
 if(S!=='deck'&&S!=='rubber')for(const[cx,cz,r]of[[0,-8.6,2.4],[0,8.6,2.4],[-2,4.2,1.5],[2,-4.2,1.5]]){g.fillStyle=mark;const cell=.2;for(let x=cx-r;x<cx+r;x+=cell)for(let z=cz-r*.5,row=0;z<cz+r*.5;z+=cell*.5,row++){const px=x+(row&1?cell*.5:0),d=Math.hypot((px-cx)/r,(z-cz)/(r*.5));if(d<1){g.beginPath();g.arc(X(px),Z(z),ppm*cell*.3*(1-d),0,7);g.fill();}}}
 for(let i=0;i<34;i++){const zc=[-7.4,7.4,-4.6,4.6][i%4],x=(rand()-.5)*9.4,z=zc+(rand()-.5)*1.8,a=rand()*Math.PI,len=.2+rand()*.4;stroke(x,z,x+Math.cos(a)*len,z+Math.sin(a)*len*.5,COMIC_INK,.03,.3);}
 // Lines: paper (a blue rope on sand) over an ink keyline, so they stay bold on every surface.
 const rect=(x0:number,z0:number,x1:number,z1:number,grow:number)=>g.fillRect(X(x0-grow),Z(z0-grow),Math.max(2,(x1-x0+2*grow)*ppm),Math.max(2,(z1-z0+2*grow)*ppm));
 const o=.06,lines:number[][]=[[-5-o,-8-o,5+o,-8+o],[-5-o,8-o,5+o,8+o],[-5-o,-8,-5+o,8],[5-o,-8,5+o,8],...tennisCourtMarks().map(m=>[...m])];
 g.fillStyle=COMIC_INK;for(const[x0,z0,x1,z1]of lines)rect(x0,z0,x1,z1,.07);g.fillStyle=lineCol;for(const[x0,z0,x1,z1]of lines)rect(x0,z0,x1,z1,.015);
 if(S==='sand'){g.fillStyle=COMIC_PAPER;for(const[x0,z0,x1,z1]of lines){if(x1-x0>z1-z0)for(let x=x0;x<x1;x+=.5)rect(x,z0,x+.05,z1,0);else for(let z=z0;z<z1;z+=.5)rect(x0,z,x1,z+.05,0);}// rope stitches
  for(const[x,z]of[[-5,-8],[5,-8],[-5,8],[5,8]]){g.fillStyle=COMIC_INK;g.beginPath();g.arc(X(x),Z(z),ppm*.13,0,7);g.fill();g.fillStyle=COMIC_PAPER;g.beginPath();g.arc(X(x),Z(z),ppm*.08,0,7);g.fill();}} // corner anchors
 g.strokeStyle=COMIC_INK;g.lineWidth=ppm*.1;g.strokeRect(0,0,cw,ch);
}
/** Lets an instanced MeshBasicMaterial fade each instance: adds an `iAlpha` instanced attribute multiplied into the alpha. */
function instancedAlpha(mat:T.Material){mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float iAlpha;varying float vIAlpha;').replace('#include <begin_vertex>','#include <begin_vertex>\nvIAlpha=iAlpha;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vIAlpha;').replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.a*=vIAlpha;');};mat.customProgramCacheKey=()=>'tennis-ialpha';}

/** The sky panel, drawn in screen space by the sea mesh above the printed horizon line (its plane, far wall and side walls, so
 * every camera beat is covered by the one draw): three flat bands with dot-screen turns, the sun as stacked discs with poster bars (a moon and stars at
 * night), cut clouds, two headlands and a lighthouse. uSkyS = (sun x px, horizon y px, unit px, dot cell px); uSkyA = (sun
 * height in radii, night, headland side). */
const SKY_GLSL=/* glsl */`uniform vec4 uSkyS;uniform vec3 uSkyA,uS0,uS1,uS2,uD0,uD1,uD2,uC0,uC1,uH0,uH1,uSkyInk;
vec3 tnCloud(vec3 col,vec2 c,float w){if(length((c+vec2(0.,w*.035))/vec2(w*.5,w*.075))<1.)col=uC1;if(length((c+vec2(w*.03,0.))/vec2(w*.46,w*.062))<1.||length((c-vec2(w*.1,w*.045))/vec2(w*.22,w*.05))<1.)col=uC0;return col;}
vec3 tnSky(vec2 fc){vec2 p=(fc-uSkyS.xy)/uSkyS.z;float h=p.y;
 vec2 q=mat2(.7071,-.7071,.7071,.7071)*fc/uSkyS.w;float d=length(fract(q)-.5)*1.4142;
 vec3 col=mix(uS2,uS1,step(d,clamp((h-27.)/26.,0.,1.)*1.3-.1));col=mix(col,uS0,step(d,clamp((h-86.)/30.,0.,1.)*1.3-.1));
 if(uSkyA.y>.5){vec2 sc=fc/(uSkyS.z*9.),id=floor(sc);float sh=fract(sin(dot(id,vec2(12.99,78.23)))*43758.5);if(sh>.9&&h>18.&&length(fract(sc)-.5)<.1+.12*fract(sh*7.))col=uD0;}
 float R=30.;vec2 s=vec2(p.x,h-R*uSkyA.x);float r=length(s);
 if(r<R*1.5)col=mix(col,uD2,.4);if(r<R*1.22)col=uD1;if(r<R){col=uD0;if(uSkyA.y<.5&&s.y<0.&&fract(-s.y/R*4.2)>.66+.3*s.y/R)col=uD1;}
 float sd=uSkyA.z;col=tnCloud(col,p-vec2(sd*132.,31.),64.);col=tnCloud(col,p-vec2(-sd*52.,74.),52.);col=tnCloud(col,p-vec2(sd*250.,96.),88.);col=tnCloud(col,p-vec2(sd*520.,58.),120.);
 float hx=p.x*sd,f1=20.*sin(clamp((hx-150.)/330.,0.,1.)*3.1416)*(.78+.22*sin(hx*.09)),f0=13.*sin(clamp((hx-64.)/190.,0.,1.)*3.1416)*(.8+.2*sin(hx*.13+1.));
 if(h<f1)col=uH1;vec2 l=vec2(hx-196.,h-9.);if(abs(l.x)<2.4&&l.y>0.&&l.y<17.)col=fract(l.y/5.6)<.42?uD2:vec3(1.,.94,.86);if(abs(l.x)<3.6&&l.y>17.&&l.y<19.5)col=uSkyInk;if(h<f0)col=uH0;
 return col;}`;
/** Night panel: the comic light band only survives inside the warm lamp pools (four a side over the court, one long swag across
 * the far end); everything outside them prints in the blue shadow band. Appended to every lit tennis material's comic edit. */
const LAMP_GLSL=/* glsl */`uniform vec4 uTnLamp;float tnPool(vec3 w){float dz=abs(mod(w.z+9.9+3.25,6.5)-3.25),side=1.-length(vec2(2.6-abs(w.x),dz*.75))/3.9,far=1.-length(vec2(w.x*.42,w.z+10.8))/3.4;return clamp(max(side,far)*2.6,0.,1.);}`;

export function createTennisWorld(kit:Kit){
 const {scene,mobile,reduced}=kit,group=new T.Group();group.name='tennis-world';scene.add(group);
 const extra:{dispose():void}[]=[],uTime={value:0},uWind={value:new T.Vector3(.2,0,1)}; // x = signed strength, y = gust, z = smoothed direction (-1..1)
 // Comic house style: one uniform set for the game; every lit material here (and the stage's players and ball, see tennisGame.ts)
 // takes the print bands through comic(). The lamp-pool hook is inert by day.
 const ink=createComicUniforms(),uLamp={value:new T.Vector4(0,0,0,0)};
 const comic=(rim=false,inkWidth=1):ComicShaderOptions=>({uniforms:{...ink,uTnLamp:uLamp},rim,inkWidth,pars:LAMP_GLSL,afterLit:'if(uTnLamp.x>.5)rkT=min(1.,rkT+.35)*tnPool(cameraPosition+(-vViewPosition)*mat3(viewMatrix));'});
 const flat=()=>new T.MeshLambertMaterial({vertexColors:true});
 const box=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,8),cyl5=new T.CylinderGeometry(1,1,1,5),sph=new T.SphereGeometry(1,6,3),trunk=new T.CylinderGeometry(.8,1.12,1,6,1,true);
 // Parasol canopy: ten flat panels and a pointed valance; the stripes are per-triangle colour.
 const CANOPY=10,canopy=(()=>{const n=CANOPY,p:number[]=[];for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2,am=(a0+a1)/2,R0=[Math.cos(a0),-.5,Math.sin(a0)],R1=[Math.cos(a1),-.5,Math.sin(a1)],V=[Math.cos(am)*.99,-.84,Math.sin(am)*.99];p.push(0,.5,0,...R1,...R0,...R0,...R1,...V);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();return g;})();
 const sail=(()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1],3));g.computeVertexNormals();return g;})();
 const templates=[box,cyl,cyl5,sph,trunk,canopy,sail];
 const WHITE='#fff0dc',COPING='#d9623b',BLUE='#2f6fb0',TIMBER='#d9a868',RED='#f0452e',YELLOW='#ffc83a',LEAF='#2f8a5a',LEAF2='#1d5a55',TEAL='#19b5a5',PAPER=COMIC_PAPER,INK=COMIC_INK;

 // ---- sea + sky panel: ONE unlit draw (a sea plane with a far wall and two side walls for the low camera beats) ----------------
 const col=(hex='#ffffff')=>({value:new T.Color(hex)});
 const skyU={uSkyS:{value:new T.Vector4(100,400,1,6)},uSkyA:{value:new T.Vector3(1,0,1)},uS0:col(),uS1:col(),uS2:col(),uD0:col(),uD1:col(),uD2:col(),uC0:col(),uC1:col(),uH0:col(),uH1:col(),uSkyInk:col(INK)};
 // Sea: flat bands (surf line, near band, a dotted turn, far band), a glitter path under the sun, whitecaps as paper dashes that
 // multiply with the wind; above the printed horizon line the same plane draws the sky panel.
 const seaMat=new T.ShaderMaterial({fog:false,side:T.DoubleSide,uniforms:{...skyU,uTime,uWind:{value:0},uShore:{value:1},uFar:col(),uNear:col(),uGlit:col(),uFoam:col('#ffffff')},
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:SKY_GLSL+/* glsl */`
uniform float uTime,uWind,uShore;uniform vec3 uFar,uNear,uGlit,uFoam;varying vec3 vW;
float shoreZ(float x){return -14.6+sin(x*.11)*.5+sin(x*.31+1.)*.2;}
float h1(float n){return fract(sin(n*12.9898)*43758.5453);}
void main(){vec2 fc=gl_FragCoord.xy;vec3 col;
 if(fc.y>uSkyS.y)col=tnSky(fc);else{vec2 p=(fc-uSkyS.xy)/uSkyS.z;float tp=-p.y,fb=mix(34.,11.,uShore);
  vec2 q=mat2(.7071,-.7071,.7071,.7071)*fc/uSkyS.w;float dd=length(fract(q)-.5)*1.4142;
  col=mix(uFar,uNear,step(dd,clamp((tp-fb)/9.,0.,1.)*1.3-.1));
  // glitter path: paper dashes in rows under the sun, wider toward the shore
  float row=floor(tp/4.4),hs=h1(row+floor(uTime*2.2)*.37),off=(hs-.5)*2.*(9.+tp*.42),len=3.+8.*fract(hs*13.);
  if(tp>1.5&&tp<76.&&fract(tp/4.4)<.4&&abs(p.x-off)<len)col=uGlit;
  // whitecaps: dashes that drift downwind
  float aw=abs(uWind);vec2 c=vec2(vW.x*.8-uTime*1.3*sign(uWind+.0001),vW.z*2.4),id=floor(c),f=fract(c);
  if(h1(id.x*1.7+id.y*31.3)>1.02-.2*aw&&abs(f.y-.5)<.13&&abs(f.x-.5)<.36)col=uFoam;
  // the shore: a hard foam edge that laps, and one drawn swell line behind it
  float d=shoreZ(vW.x)-vW.z,lap=.34+.2*sin(uTime*.7+vW.x*.4)+.08*sin(uTime*1.3+vW.x*1.3);
  if(uShore>.5&&(d<lap||abs(d-lap-.62-.1*sin(vW.x*.9+uTime))<.05))col=uFoam;
  if(tp<1.4)col=uSkyInk;}
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`});
 const seaGeo=(()=>{const floor=new T.PlaneGeometry(200,160);floor.rotateX(-Math.PI/2);floor.translate(0,0,-40);const far=new T.PlaneGeometry(200,130);far.translate(0,65,-120);const parts=[floor,far];for(const sd of[-1,1]){const w=new T.PlaneGeometry(160,130);w.rotateY(-sd*Math.PI/2);w.translate(sd*100,65,-40);parts.push(w);}const g=mergeGeometries(parts)!;for(const k of parts)k.dispose();return g;})();
 const sea=new T.Mesh(seaGeo,seaMat);sea.position.y=-.16;sea.name='tennis-sea';sea.renderOrder=-10;sea.frustumCulled=false;group.add(sea);

 // ---- sand: a flat sheet that follows the shoreline, with a hard-edged wet band at the water --------------------------------
 {const cols=40,ts=[0,.02,.045,.0451,.2,.6,1],rows=ts.length-1,pos:number[]=[],colr:number[]=[],idx:number[]=[];
  for(let i=0;i<=cols;i++){const x=-90+i*180/cols,edge=tennisShoreZ(x)-.5;for(let j=0;j<=rows;j++){const t=ts[j],z=edge+t*(60-edge),wet=j<3;pos.push(x,t<.02?-.3+t*14:-.02,z);colr.push(wet?.84:1,wet?.78:1,wet?.72:1);}}
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=a+rows+1;idx.push(a,a+1,b,b,a+1,b+1);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeVertexNormals();
  var sandMat=comicMaterial(flat(),comic()),sand=new T.Mesh(g,sandMat);sand.receiveShadow=true;sand.name='tennis-sand';group.add(sand);}

 // ---- court: one printed sheet (surface, ink marks and every line baked in) ---------------------------------------------------
 const CW=12.8,CL=20.5,ppm=mobile?56:72,courtCanvas=document.createElement('canvas');courtCanvas.width=Math.round(CW*ppm);courtCanvas.height=Math.round(CL*ppm);
 const courtTex=new T.CanvasTexture(courtCanvas);courtTex.colorSpace=T.SRGBColorSpace;courtTex.anisotropy=mobile?4:8;
 const courtGeo=new T.PlaneGeometry(CW,CL);courtGeo.rotateX(-Math.PI/2);const courtMat=comicMaterial(new T.MeshLambertMaterial({map:courtTex}),comic()),court=new T.Mesh(courtGeo,courtMat);court.position.y=.002;court.receiveShadow=true;court.name='tennis-court-surface';group.add(court);

 // ---- net: inked cord cloth + paper tape, deformed on the CPU only while it moves ---------------------------------------------
 const NC=TENNIS_WORLD.netCols,clothGeo=new T.PlaneGeometry(10.6,1.0,NC,4),tapeGeo=new T.PlaneGeometry(10.6,.12,NC,1);
 {const uv=clothGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*10.6/.52,uv.getY(i)*1/.52);}
 // The cord is drawn by the fragment shader from the cloth's own UVs (paper cord, ink edge, holes discarded): no texture.
 const clothMat=new T.ShaderMaterial({side:T.DoubleSide,fog:false,uniforms:{uCord:col(PAPER),uEdge:col(INK)},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 uCord,uEdge;varying vec2 vUv;void main(){vec2 f=abs(fract(vUv*4.)-.5),w=fwidth(vUv*4.);float d=.5-max(f.x,f.y),px=max(w.x,w.y);if(d>max(.2,px*1.5))discard;gl_FragColor=vec4(d<max(.09,px*.7)?uCord:uEdge,1.);\n#include <colorspace_fragment>\n}'});extra.push(clothMat);
 const cloth=new T.Mesh(clothGeo,clothMat);cloth.name='tennis-net';cloth.renderOrder=3;group.add(cloth);
 const tape=new T.Mesh(tapeGeo,comicMaterial(new T.MeshLambertMaterial({color:PAPER,side:T.DoubleSide}),comic()));tape.name='tennis-tape';tape.castShadow=true;group.add(tape);
 const clothBase=(clothGeo.attributes.position.array as Float32Array).slice(),tapeBase=(tapeGeo.attributes.position.array as Float32Array).slice();
 const sag=(x:number)=>.06*(1-(x/5.3)*(x/5.3));
 let ripple=0,rippleAge=0,rippleX=0,rippleAmp=0,netDirty=true,netCalm=false;
 function shapeNet(wind:number,time:number){
  const cp=clothGeo.attributes.position,tp=tapeGeo.attributes.position,decay=ripple>0?Math.exp(-rippleAge*3.2):0;
  const disp=(x:number,top:number)=>{const pin=1-(x/5.3)*(x/5.3);let z=reduced?0:wind*.035*Math.sin(x*2.3-time*6*Math.sign(wind||1))*pin*(.4+top*.6);
   if(decay>0){const dx=Math.abs(x-rippleX);z+=rippleAmp*decay*Math.exp(-dx*.42)*Math.sin(rippleAge*24-dx*3.1)*pin*(.35+top*.65);}return z;};
  for(let i=0;i<cp.count;i++){const x=clothBase[i*3],y=clothBase[i*3+1],top=y+.5;cp.setXYZ(i,x,.6+y-sag(x)*top,disp(x,top));}
  for(let i=0;i<tp.count;i++){const x=tapeBase[i*3],y=tapeBase[i*3+1];tp.setXYZ(i,x,1.1+y*.9-sag(x)+(decay>0?Math.abs(disp(x,1))*.25:0),disp(x,1));}
  cp.needsUpdate=true;tp.needsUpdate=true;
 }

 // ---- static props: flat colour, ink hulls. Casters (core, beach, row, stand, pier) never receive: a hull would shade its own part. ----
 const core=builder(),beach=builder(),row=builder(),stand=builder(),detail=builder(),rig=builder(),pier=builder(),windB=windBuilder(),palmWind=windBuilder();
 type B=ReturnType<typeof builder>;
 // Club members (one instanced draw, built below): [x,y,z,yaw,seated,prop (0 none, 1 fan, 2 drink, 3 umpire),shirt,hat].
 type Member=[number,number,number,number,number,number,string,string];const SHIRTS=[PAPER,RED,TEAL,YELLOW,BLUE,'#ff8a3c',PAPER,LEAF],HATS=['#f4d08c',INK,PAPER,'#7a5230',BLUE,'#d9a868',RED,'#f4d08c'];
 const baseMembers:Member[]=[],beachMembers:Member[]=[],rowMembers:Member[]=[],standMembers:Member[]=[],pierMembers:Member[]=[];let memberSeed=0;
 const member=(list:Member[],x:number,y:number,z:number,yaw:number,seated=1,prop=-1)=>{if(!TENNIS_CLUB_CROWD)return;const i=memberSeed++;list.push([x,y,z,yaw,seated,prop<0?[0,1,0,2,0,0,1,0][i%8]:prop,SHIRTS[(i*3+1)%8],HATS[(i*5+2)%8]]);};
 const parasol=(b:B,x:number,z:number,a:string,r=1.5,h=2.25,tilt=0)=>{b.put(cyl5,INK,x,h/2,z,.035,h,.035);b.put(canopy,t=>(t>>1)&1?a:PAPER,x,h+.2,z,r,.5,r,tilt,x*1.7,tilt*.6,.06,true);};
 const lounger=(b:B,x:number,z:number,ry:number,towel:string)=>{const sn=Math.sin(ry),cs=Math.cos(ry);b.put(box,PAPER,x,.2,z,.62,.12,1.6,0,ry,0,.035);b.put(box,PAPER,x+sn*-.92,.4,z+cs*-.92,.62,.08,.58,-.6,ry,0,.03);b.put(box,towel,x,.275,z,.46,.03,.95,0,ry,0);};
 const palm=(x:number,z:number,h:number,lean:number,seed:number)=>{const r=rng(seed),segs=4;
  // Trunk: four tapered rings, alternating two flat browns (the leaf scars read as printed bands), one ink hull.
  for(let i=0;i<segs;i++){const t=(i+.5)/segs,w=.2-.08*t;beach.put(trunk,i&1?'#a8743f':'#c9945a',x+lean*t*t*1.6,h*t,z+Math.sin(seed)*t*t*.5,w,h/segs*1.04,w,0,i*.9,-lean*t*.5,.04,true);}
  const tx=x+lean*1.6,tz=z+Math.sin(seed)*.5;
  for(let f=0;f<7;f++){const ang=f/7*Math.PI*2+r()*.4,len=2.4+r()*.8,droop=.9+r()*.7,ph=r()*6.28;
   for(const back of[1,0]){const g=new T.PlaneGeometry(1,1,1,4),pp=g.attributes.position,k=back?1.22:1;
    for(let i=0;i<pp.count;i++){const w=pp.getX(i),t=pp.getY(i)+.5,width=.66*k*(Math.sin(Math.PI*Math.min(1,t*.92+.08))*.85+.15),lx=w*width,ly=t*.75-droop*t*t-Math.abs(w)*width*.55-(back?.035:0),lz=t*(len+(back?.12:0));pp.setXYZ(i,Math.cos(ang)*lz+Math.sin(ang)*lx,ly,Math.sin(ang)*lz-Math.cos(ang)*lx);}
    g.computeVertexNormals();const R=Math.hypot(len,1);palmWind.put(g,back?LEAF2:f&1?LEAF:'#3c9f66',tx,h,tz,(lx,_ly,lz)=>{const t=Math.min(1,Math.hypot(lx,lz)/R);return[t*t*.9,ph+t*2,0];});g.dispose();}}
 };
 const flag=(x:number,z:number,h:number,color:string,second:string,w=1.5,hh=.85)=>{core.put(cyl5,PAPER,x,h/2,z,.045,h,.045,0,0,0,.03,true);core.put(box,YELLOW,x,h+.06,z,.12,.12,.12,0,0,0,.025);
  const sw=(lx:number,ly:number):[number,number,number]=>[Math.min(1,Math.max(0,lx)/w)*.9,lx*3+ly,Math.max(0,lx)];
  for(const[gw,gh,c,dz]of[[w+.1,hh+.12,INK,-.012],[w,hh,color,0],[w,hh*.34,second,.006]] as const){const g=new T.PlaneGeometry(gw,gh,6,1);g.translate(gw/2-(gw-w)/2,0,0);windB.put(g,c,x,h-hh/2-.08,z+dz,sw);g.dispose();}};
 const bunting=(x0:number,z0:number,x1:number,z1:number,y:number,n:number,colors:string[])=>{
  for(let i=0;i<n;i++){const t=(i+.5)/n,dip=.38*4*t*(1-t);for(const[k,c,dz]of[[1.3,INK,-.01],[1,colors[i%colors.length],0]] as const){const tri=new T.BufferGeometry();tri.setAttribute('position',new T.Float32BufferAttribute([-.17*k,.03*(k-1)*4,0,.17*k,.03*(k-1)*4,0,0,-.44*k,0],3));windB.put(tri,c,x0+(x1-x0)*t,y-dip,z0+(z1-z0)*t+dz,(_lx,ly)=>[ly<-.1?.5:0,i*1.3,0]);tri.dispose();}}
  const len=Math.hypot(x1-x0,z1-z0),ry=-Math.atan2(z1-z0,x1-x0);for(let i=0;i<4;i++){const t0=i/4,t1=(i+1)/4,d0=.38*4*t0*(1-t0),d1=.38*4*t1*(1-t1);core.put(box,INK,x0+(x1-x0)*(t0+t1)/2,y-(d0+d1)/2,z0+(z1-z0)*(t0+t1)/2,len/4*1.02,.03,.03,0,ry,Math.atan2(d0-d1,len/4));}};
 // A gable roof as one flat prism: the tiles are the terracotta colour and the ink hull, nothing more.
 const gable=(b:B,cx:number,y0:number,cz:number,hw:number,rise:number,len:number,color:string,ink=.08)=>{const z0=-len/2,z1=len/2,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-hw,0,z0,hw,0,z0,0,rise,z0,-hw,0,z1,0,rise,z1,hw,0,z1,-hw,0,z0,0,rise,z0,0,rise,z1,-hw,0,z0,0,rise,z1,-hw,0,z1,hw,0,z0,hw,0,z1,0,rise,z1,hw,0,z0,0,rise,z1,0,rise,z0],3));flipFaces(g);g.computeVertexNormals();b.put(g,color,cx,y0,cz,1,1,1,0,0,0,ink);g.dispose();};
 const boat=(b:B,x:number,z:number,ry:number,hull:string,trim:string,sails?:string)=>{b.put(sph,hull,x,.0,z,.5,.3,1.3,0,ry,0,.05,true);b.put(box,trim,x,.2,z,.66,.06,1.8,0,ry,0);if(sails){b.put(cyl5,INK,x,1.3,z,.03,2.4,.03);for(const sd of[1,-1])b.put(sail,sails,x,.5,z+.06,1,1.9,sd*.95,0,ry,0);}};

 // Core (every stop): net posts, the centre strap, the umpire's chair under its parasol, a bench, the ball basket, kerbs, flags, bunting.
 for(const s of[-1,1]){core.put(cyl,PAPER,s*5.34,.6,0,.07,1.22,.07,0,0,0,.03,true);core.put(cyl,BLUE,s*5.34,1.25,0,.095,.09,.095,0,0,0,.025,true);}
 core.put(box,PAPER,0,.52,0,.06,1.02,.02);
 for(const[x,z,w,d]of[[0,-10.33,13.1,.18],[0,10.33,13.1,.18],[-6.48,0,.18,20.5],[6.48,0,.18,20.5]] as const)core.put(box,WHITE,x,.05,z,w,.14,d,0,0,0,.035);
 {const x=-6.05;for(const[dx,dz]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])core.put(box,INK,x+dx*1.15,.95,dz*1.15,.07,1.9,.07,0,0,dx>0?.07:-.07);
  core.put(box,BLUE,x,1.92,0,.74,.1,.7,0,0,0,.035);core.put(box,BLUE,x-.34,2.3,0,.08,.7,.7,0,0,0,.035);member(baseMembers,x,1.98,0,Math.PI/2,1,3);
  core.put(cyl5,INK,x-.3,2.9,-.25,.025,1.3,.025);core.put(canopy,t=>(t>>1)&1?BLUE:PAPER,x-.3,3.62,-.25,.85,.3,.85,0,0,0,.05,true);}
 core.put(box,TIMBER,6.05,.42,2.6,.4,.08,1.9,0,0,0,.035);for(const k of[-.8,.8])core.put(box,INK,6.05,.2,2.6+k,.3,.4,.07);core.put(box,RED,6.05,.48,2.2,.3,.05,.5,0,.2,0);
 core.put(cyl,TEAL,6.0,.3,-2.4,.26,.6,.26,0,0,0,.035,true);for(const[dx,dy,dz]of[[0,.68,0],[.12,.64,.1],[-.11,.65,-.06]])core.put(sph,PAPER,6+dx,dy,-2.4+dz,.12,.12,.12,0,0,0,.02,true);
 flag(-6.1,-9.9,4.6,RED,YELLOW);flag(6.1,-9.9,4.6,BLUE,PAPER);
 bunting(-6.1,-9.9,6.1,-9.9,3.5,20,[RED,PAPER,BLUE,YELLOW,TEAL]);

 // Beach club: back wall with a gate to the sand, one parasol row, palms, clubhouse (right), terrace (left), a jetty and boats
 // in the near sea. Casters go to 'beach' (+ 'row': the parasol row, swapped for the grandstand on centre court); small things
 // that only receive go to 'detail' (no shadow pass). Nothing stands beyond the printed horizon.
 {const wall=(x0:number,x1:number,z:number,h=1.05)=>{beach.put(box,WHITE,(x0+x1)/2,h/2,z,x1-x0,h,.34,0,0,0,.045);beach.put(box,COPING,(x0+x1)/2,h+.05,z,x1-x0+.08,.1,.46);};
  wall(-13,-2.3,-11.1);wall(2.3,13,-11.1);for(const s of[-1,1]){beach.put(box,WHITE,s*2.1,.85,-11.1,.55,1.7,.55,0,0,0,.045);beach.put(box,COPING,s*2.1,1.76,-11.1,.7,.12,.7,0,0,0,.03);}
  detail.put(box,WHITE,0,-.02,-11.5,3.6,.1,1.2,0,0,0,.03);
  for(const s of[-1,1])for(let i=0;i<3;i++){const x=s*(4.4+i*3);detail.put(cyl5,COPING,x,1.28,-11.1,.2,.3,.2,0,0,0,.03,true);detail.put(sph,i&1?'#f0608a':LEAF,x,1.62,-11.1,.32,.27,.32,0,0,0,.035,true);}
  const stripes=[RED,BLUE,YELLOW,TEAL,RED];
  for(let i=0;i<5;i++){const x=-8.4+i*4.2,z=-12.75+(i&1?.25:0);parasol(row,x,z,stripes[i],1.5,2.3,(i%3-1)*.06);if(i!==2){lounger(detail,x-.8,z+.3,.12,i&1?YELLOW:TEAL);lounger(detail,x+.8,z+.25,-.1,i&1?RED:BLUE);}}
  member(rowMembers,-3.5,0,-12.2,.2,0);member(rowMembers,3.9,0,-12.3,-.2,0);member(rowMembers,-7.4,0,-12.1,.3,0);member(rowMembers,.3,0,-12.9,0,0);
  palm(-11.7,-12.3,6.2,.5,1);palm(11.8,-12.4,6.8,-.45,2);palm(-11.5,-6,6.5,.3,3);palm(11.4,-4.2,7,-.3,4);palm(-9.4,7.5,5.8,.4,5);palm(10.2,9.2,6.4,-.5,6);
  // Clubhouse on the right: two whitewashed blocks under terracotta gables, blue shutters, a striped awning over the terrace bar.
  beach.put(box,WHITE,12.6,1.7,-1,5,3.4,8,0,0,0,.08);gable(beach,12.6,3.4,-1,2.8,.95,8.5,COPING);beach.put(box,WHITE,13.4,4.3,-2.5,3.2,1.6,4,0,0,0,.08);gable(beach,13.4,5.1,-2.5,1.9,.62,4.5,COPING);
  for(let i=0;i<3;i++)detail.put(box,BLUE,10.06,1.5,-3.6+i*2.6,.08,1.5,.8,0,0,0,.035);
  for(let i=0;i<4;i++)beach.put(box,i&1?PAPER:RED,9.2,2.38,-4+i*2,1.9,.06,2.0,0,0,.2,i?0:.04);for(const z of[-4.9,3.4])detail.put(cyl5,INK,8.35,1.15,z,.04,2.3,.04);
  detail.put(box,TIMBER,8.9,.5,-1,.7,1,4,0,0,0,.04);detail.put(box,PAPER,8.9,1.03,-1,.84,.07,4.14);
  member(beachMembers,9.5,0,-.2,-Math.PI/2,0,0);member(beachMembers,8.2,.41,-2.4,-Math.PI/2,1,2);member(beachMembers,8.2,.41,.45,-Math.PI/2,1,2);
  // Terrace on the left: a low deck, parasols, tables and members watching from their chairs, planter boxes along its edge.
  detail.put(box,TIMBER,-10.6,.1,1,5.2,.2,10,0,0,0,.04);for(let i=0;i<3;i++){const z=-2.4+i*3.4;parasol(beach,-10.4,z,[YELLOW,RED,BLUE][i],1.5,2.5);detail.put(cyl,PAPER,-10.4,.62,z,.42,.06,.42,0,0,0,.03,true);
   for(const[cx,cz]of[[-9.75,z+.2],[-11.05,z-.1]]){detail.put(box,PAPER,cx,.38,cz,.36,.36,.36,0,0,0,.03);member(beachMembers,cx,.57,cz,Math.PI/2);}}
  for(let i=0;i<3;i++){detail.put(box,WHITE,-7.9,.28,-2.6+i*3.4,.5,.56,.9,0,0,0,.035);detail.put(sph,i&1?LEAF:'#3c9f66',-7.9,.72,-2.6+i*3.4,.34,.3,.5,0,0,0,.035,true);}
  // Jetty, moored boats and swim buoys in the near sea.
  detail.put(box,TIMBER,5.6,.14,-15.6,1.4,.12,2.6,0,0,0,.04);for(const dz of[-.9,.9])for(const s of[-1,1])detail.put(cyl5,INK,5.6+s*.7,-.05,-15.6+dz,.07,.9,.07);
  boat(detail,7.6,-15.9,.4,PAPER,RED);boat(detail,-3.2,-16.3,1.2,PAPER,BLUE,PAPER);boat(detail,11.5,-16.6,-1.3,BLUE,PAPER,YELLOW);boat(detail,-12.5,-16.4,1.5,RED,PAPER,PAPER);
  for(let i=0;i<7;i++)detail.put(box,i&1?PAPER:RED,-9+i*1.9,-.06,-15.4+Math.sin(i)*.2,.2,.2,.2,0,i,0,.025);
  // Centre-court grandstand (afternoon, evening final, the lawn, both tours): two whitewashed blocks either side of the gate,
  // three tiers of blue benches, a club board behind. The big occasion: this is where the members come to watch.
  if(TENNIS_CLUB_CROWD)for(const s of[-1,1]){const cx=s*6.6;for(let k=0;k<3;k++){const top=.5+k*.38,z=-11.95-k*.62;stand.put(box,WHITE,cx,top/2,z,7.2,top,.62,0,0,0,k===2?.045:0);stand.put(box,BLUE,cx,top+.03,z+.08,7,.06,.34);
    for(let i=0;i<6;i++)member(standMembers,s*(3.7+i*1.15+(k&1?.32:0)),top+.06,z+.08,s*-.12);}
   stand.put(box,WHITE,cx,1.2,-13.75,7.2,2.4,.18,0,0,0,.05);stand.put(box,BLUE,cx,2.02,-13.64,7.2,.34,.05);stand.put(box,YELLOW,cx,1.76,-13.64,7.2,.08,.05);stand.put(box,COPING,cx,2.45,-13.75,7.34,.1,.3);
   for(const e of[-1,1])stand.put(box,WHITE,cx+e*3.66,.72,-12.7,.14,1.44,2.1,0,0,0,.045);}
 }
 // Lantern rig (evening stops): ink posts and the swagged ink wire the bulbs hang from; one long swag across the far end.
 const lanternAt=(sd:number,i:number):[number,number,number]=>{const n=TENNIS_WORLD.lanterns/2,t=i/(n-1),seg=(t*3)%1;return[sd*6.3,4.3-.6*4*seg*(1-seg),-9.9+t*19.5];};
 const lanternFar=(i:number):[number,number,number]=>{const t=(i+1)/(TENNIS_WORLD.lanternsFar+1);return[-6.3+12.6*t,4.3-.95*4*t*(1-t),-10.5];};
 for(const sd of[-1,1]){for(let k=0;k<4;k++)rig.put(cyl5,INK,sd*6.3,2.2,-9.9+k*6.5,.05,4.4,.05);rig.put(cyl5,INK,sd*6.3,2.2,-10.5,.05,4.4,.05);
  for(let i=0;i<TENNIS_WORLD.lanterns/2-1;i++){const a=lanternAt(sd,i),b=lanternAt(sd,i+1),len=Math.hypot(b[1]-a[1],b[2]-a[2]);rig.put(box,INK,sd*6.3,(a[1]+b[1])/2+.12,(a[2]+b[2])/2,.03,.03,len*1.03,Math.atan2(a[1]-b[1],b[2]-a[2]),0,0);}}
 for(let i=-1;i<TENNIS_WORLD.lanternsFar;i++){const a=i<0?[-6.3,4.3,-10.5]:lanternFar(i),b=i+1>=TENNIS_WORLD.lanternsFar?[6.3,4.3,-10.5]:lanternFar(i+1),len=Math.hypot(b[0]-a[0],b[1]-a[1]);rig.put(box,INK,(a[0]+b[0])/2,(a[1]+b[1])/2+.12,-10.5,len*1.03,.03,.03,0,0,Math.atan2(b[1]-a[1],b[0]-a[0]));}
 // Pier court: a timber platform over open water, rail posts and rope, a walkway, a boathouse, life rings, crates, moored boats.
 {pier.put(box,'#b98248',0,-.22,0,13.6,.4,21.3,0,0,0,.08);
  for(const s of[-1,1])for(let i=0;i<6;i++){const z=-10.2+i*4.08;pier.put(cyl5,PAPER,s*6.75,.5,z,.075,1.1,.075,0,0,0,.03,true);pier.put(cyl5,INK,s*6.75,-1.1,z,.15,1.6,.15);if(i<5)pier.put(box,INK,s*6.75,.9,z+2.04,.035,.035,4.08);}
  for(let i=1;i<5;i++){const x=-6.75+i*2.7;pier.put(cyl5,PAPER,x,.5,-10.45,.075,1.1,.075,0,0,0,.03,true);}pier.put(box,INK,0,.9,-10.45,13.5,.035,.035);
  pier.put(box,TIMBER,14.5,-.14,-3,15.6,.26,2.6,0,0,0,.06);for(let i=0;i<4;i++)pier.put(cyl5,INK,9+i*3.4,-1.1,-3,.15,1.8,.15);
  pier.put(box,WHITE,-12.4,1.3,-4,5,2.8,6,0,0,0,.08);gable(pier,-12.4,2.7,-4,2.9,1.2,6.6,BLUE);pier.put(box,'#b98248',-12.4,-.2,-4,5.8,.3,6.8,0,0,0,.06);
  pier.put(box,BLUE,-9.86,1.2,-4,.08,1.9,1.2,0,0,0,.035);pier.put(box,TIMBER,-8.4,-.12,-4,3,.24,1.8,0,0,0,.05);
  for(const[x,z,c]of[[-6.75,-4.4,RED],[6.75,1.4,RED],[6.75,-7.3,PAPER]] as const)pier.put(cyl,c,x+(x<0?.16:-.16),.6,z,.26,.1,.26,0,0,Math.PI/2,.035,true);
  for(const[x,z,s]of[[6,7.4,.5],[5.5,7.9,.36],[-5.9,8.3,.42]] as const)pier.put(box,TIMBER,x,s/2,z,s,s,s,0,x*.3,0,.035);
  member(pierMembers,6,.5,7.4,-Math.PI/2,1,0);member(pierMembers,9.3,0,-3.7,-Math.PI/2,0,1);member(pierMembers,10.5,0,-2.4,-Math.PI/2,0,0);member(pierMembers,-8.3,0,-3.6,Math.PI/2,0,2);member(pierMembers,-8.5,0,-4.6,Math.PI/2,0,0);
  for(const s of[-1,1])for(const z of[9.6,-9.6]){pier.put(cyl5,INK,s*6.75,2,z,.05,3.2,.05);pier.put(sph,'#ffe9a8',s*6.75,3.66,z,.17,.19,.17,0,0,0,.035,true);}
  boat(pier,-8.6,3.5,.15,PAPER,RED);boat(pier,8.7,5.6,-.2,BLUE,PAPER);boat(pier,-2.6,-13.4,1.4,PAPER,YELLOW,PAPER);boat(pier,9.5,-12.6,1.1,RED,PAPER,PAPER);boat(pier,-10.5,9.5,.6,TEAL,PAPER);boat(pier,-11.2,-15.6,1.7,BLUE,PAPER,YELLOW);
  for(let i=0;i<9;i++)pier.put(box,i&1?PAPER:RED,-12+i*3,-.08,-15.6+Math.sin(i*1.7)*.4,.22,.22,.22,0,0,0,.025);
 }
 const propMat=comicMaterial(flat(),comic());
 const mesh=(b:{build():T.BufferGeometry},name:string,mat:T.Material=propMat,cast=true)=>{const o=new T.Mesh(b.build(),mat);o.name=name;o.castShadow=cast;o.receiveShadow=!cast;group.add(o);return o;};
 const coreMesh=mesh(core,'tennis-club-core'),beachMesh=mesh(beach,'tennis-club-beach'),rowMesh=mesh(row,'tennis-club-row'),standMesh=TENNIS_CLUB_CROWD?mesh(stand,'tennis-grandstand'):null,detailMesh=mesh(detail,'tennis-club-detail',propMat,false),pierMesh=mesh(pier,'tennis-club-pier');pierMesh.visible=false;if(standMesh)standMesh.visible=false;void coreMesh;
 // Wind props share one material: the sway runs in the vertex shader (and in the shadow pass), driven by two uniforms.
 const swayPatch=(sh:{uniforms:Record<string,T.IUniform>;vertexShader:string})=>{sh.uniforms.uTime=uTime;sh.uniforms.uWind=uWind;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 sway;uniform float uTime;uniform vec3 uWind;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
{float w=sway.x,a=abs(uWind.x),ph=sway.y+uTime*(2.6+a*5.);
 transformed.x+=-sway.z+sway.z*uWind.z*(.55+.45*a)+w*(uWind.x*.5+sin(ph)*.1*(.35+a));
 transformed.y+=w*cos(ph*1.3)*.07*(.4+a)-sway.z*(1.-a)*.42*(1.-.5*abs(uWind.z))-w*a*.12*step(sway.z,.001);
 transformed.z+=w*sin(ph*.7+1.)*.13*(.4+a)+sway.z*sin(ph*.9)*.06;}`);};
 const windMat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});windMat.onBeforeCompile=swayPatch;windMat.customProgramCacheKey=()=>'tennis-sway';comicMaterial(windMat,comic());
 const windDepth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});windDepth.onBeforeCompile=swayPatch;windDepth.customProgramCacheKey=()=>'tennis-sway-depth';extra.push(windDepth);
 const windMesh=mesh(windB,'tennis-wind-props',windMat),palmMesh=mesh(palmWind,'tennis-palm-fronds',windMat);windMesh.customDepthMaterial=windDepth;palmMesh.customDepthMaterial=windDepth;windMesh.frustumCulled=false;palmMesh.frustumCulled=false;

 // ---- club members: flat comic figures, ONE instanced draw. Idle life (a fan, a drink, breathing), heads that follow the ball and
 // every reaction (clap, on their feet, the lean on a net cord, the umpire's arm) run in the vertex shader from four uniforms.
 // No shadow pass. Not built at all when TENNIS_CLUB_CROWD is off.
 const uBall={value:new T.Vector3()},uCrowd={value:new T.Vector4()}; // x clap, y stand, z lean, w umpire call (signed: + = the rival's side)
 const MAXM=TENNIS_WORLD.members;let seat=(_lists:Member[][])=>{};
 if(TENNIS_CLUB_CROWD){const memberGeo=(()=>{const parts:T.BufferGeometry[]=[],c=new T.Color();
  const add=(g0:T.BufferGeometry,color:string,part:number,mask:number,x=0,y=0,z=0)=>{const k=g0.index?g0.toNonIndexed():g0;if(k!==g0)g0.dispose();k.translate(x,y,z);const n=k.attributes.position.count,colr=new Float32Array(n*3),mp=new Float32Array(n*2);c.set(color);for(let i=0;i<n;i++){colr[i*3]=c.r;colr[i*3+1]=c.g;colr[i*3+2]=c.b;mp[i*2]=part;mp[i*2+1]=mask;}k.setAttribute('color',new T.BufferAttribute(colr,3));k.setAttribute('mp',new T.BufferAttribute(mp,2));k.deleteAttribute('uv');parts.push(k);};
  add(new T.CylinderGeometry(.17,.16,.12,5,1,true),BLUE,0,1,0,.06,0);add(new T.CylinderGeometry(.125,.17,.38,5,1,true),'#ffffff',0,0,0,.31,0);{const cap=new T.CircleGeometry(.125,5);cap.rotateX(-Math.PI/2);add(cap,'#ffffff',0,0,0,.5,0);}
  add(new T.SphereGeometry(.115,5,3),'#e9a878',1,1,0,.62,0);add(new T.SphereGeometry(.128,5,2,0,Math.PI*2,0,Math.PI*.5),'#ffffff',1,2,0,.637,0);add(new T.BoxGeometry(.17,.02,.11),'#ffffff',1,2,0,.652,.13);
  for(const sd of[-1,1])add(new T.CylinderGeometry(.034,.034,.26,4,1,true),'#e9a878',sd<0?2:3,1,sd*.185,.36,.03);
  const g=mergeGeometries(parts)!;for(const k of parts)k.dispose();return g;})();
 const memberMat=new T.MeshLambertMaterial({vertexColors:true});memberMat.onBeforeCompile=sh=>{sh.uniforms.uTime=uTime;sh.uniforms.uBall=uBall;sh.uniforms.uCrowd=uCrowd;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 mp;attribute vec4 iData;attribute vec3 iShirt;attribute vec3 iHat;uniform float uTime;uniform vec3 uBall;uniform vec4 uCrowd;')
   .replace('#include <color_vertex>','#include <color_vertex>\nvColor.rgb=mp.y<.5?color.rgb*iShirt:mp.y<1.5?color.rgb:color.rgb*iHat;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
{float part=mp.x,ph=iData.x,kind=iData.y,rnd=fract(ph*.618);vec3 ip=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 float want=atan(uBall.x-ip.x,uBall.z-ip.z)-iData.w;want=clamp(atan(sin(want),cos(want)),-1.2,1.2)+sin(uTime*.7+ph)*.1;
 float turn=want*(part>.5&&part<1.5?1.:.22),tc=cos(turn),ts=sin(turn);transformed.xz=vec2(transformed.x*tc+transformed.z*ts,-transformed.x*ts+transformed.z*tc);
 float up=mix(1.,clamp(uCrowd.y*1.7-rnd*.7,0.,1.),iData.z),clap=uCrowd.x*(.55+.45*rnd),beat=.5+.5*sin(uTime*(11.+rnd*5.)+ph*7.);
 if(part>1.5){float side=part>2.5?1.:-1.;transformed.x-=side*clap*(.06+.1*beat);transformed.z+=clap*.14;transformed.y+=clap*.1;
  if(part>2.5&&kind>.5&&kind<1.5){transformed.y+=.13;transformed.z+=.1;transformed.x+=sin(uTime*5.+ph)*.05*(1.-clap);}
  if(part>2.5&&kind>1.5&&kind<2.5){float sip=smoothstep(.8,1.,sin(uTime*.45+ph))*(1.-clap);transformed.y+=.2*sip;transformed.z+=.09*sip;transformed.x-=.08*sip;}
  if(kind>2.5){float c=part>2.5?max(0.,uCrowd.w):max(0.,-uCrowd.w);transformed.y+=.32*c;transformed.x+=side*.2*c;}}
 transformed.y+=step(.1,transformed.y)*(up*.3+sin(uTime*1.3+ph)*.006+clap*beat*.016);
 transformed.z+=uCrowd.z*.34*transformed.y*transformed.y*(.6+.4*rnd);}`);};memberMat.customProgramCacheKey=()=>'tennis-members';comicMaterial(memberMat,comic(true,.8));
 const members=new T.InstancedMesh(memberGeo,memberMat,MAXM);members.name='tennis-members';members.frustumCulled=false;members.count=0;group.add(members);
 const mData=new T.InstancedBufferAttribute(new Float32Array(MAXM*4),4),mShirt=new T.InstancedBufferAttribute(new Float32Array(MAXM*3),3),mHat=new T.InstancedBufferAttribute(new Float32Array(MAXM*3),3);memberGeo.setAttribute('iData',mData);memberGeo.setAttribute('iShirt',mShirt);memberGeo.setAttribute('iHat',mHat);
 /** Seats the members this stop has (umpire first), once per venue change. */
 seat=(lists:Member[][])=>{let n=0;const c=new T.Color(),E=new T.Euler(),Mx=new T.Matrix4(),Qx=new T.Quaternion(),Px=new T.Vector3(),Sx=new T.Vector3();
  for(const list of lists)for(const m of list){if(n>=MAXM)break;const k=.95+((n*37)%10)*.012;members.setMatrixAt(n,Mx.compose(Px.set(m[0],m[1],m[2]),Qx.setFromEuler(E.set(0,m[3],0)),Sx.set(k,k,k)));mData.setXYZW(n,n*2.399,m[5],m[4],m[3]);c.set(m[6]);mShirt.setXYZ(n,c.r,c.g,c.b);c.set(m[7]);mHat.setXYZ(n,c.r,c.g,c.b);n++;}
  members.count=n;members.instanceMatrix.needsUpdate=true;mData.needsUpdate=true;mShirt.needsUpdate=true;mHat.needsUpdate=true;};}
 for(const t of templates)t.dispose();

 // ---- lanterns (evening stops): the ink rig and its paper-yellow bulbs (each with an ink hull) as ONE static unlit mesh ------------
 {const bulb=new T.SphereGeometry(.13,6,3),at=(p:[number,number,number])=>rig.put(bulb,'#ffe9a8',p[0],p[1],p[2],1,1,1,0,0,0,.035,true);
  for(const sd of[-1,1])for(let i=0;i<TENNIS_WORLD.lanterns/2;i++)at(lanternAt(sd,i));for(let i=0;i<TENNIS_WORLD.lanternsFar;i++)at(lanternFar(i));bulb.dispose();}
 const lanterns=new T.Mesh(rig.build(),new T.MeshBasicMaterial({vertexColors:true,toneMapped:false}));lanterns.name='tennis-lanterns';lanterns.visible=false;group.add(lanterns);

 // ---- pooled effects, all drawn in ink from the decal sheet: bounce puffs and gust lines (billboards), ball smudges (flat) ------------
 const atlas=tennisAtlas(scene);
 function pool(name:string,count:number,geo:T.BufferGeometry,map:T.Texture,order:number){const mat=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide});instancedAlpha(mat);const alpha=new T.InstancedBufferAttribute(new Float32Array(count),1);alpha.setUsage(T.DynamicDrawUsage);geo.setAttribute('iAlpha',alpha);
  const m=new T.InstancedMesh(geo,mat,count);m.name=name;m.frustumCulled=false;m.count=0;m.renderOrder=order;m.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(m);return{mesh:m,alpha,mat};}
 const flatGeo=(cell:number)=>{const g=tennisAtlasUv(new T.PlaneGeometry(1,1),cell);g.rotateX(-Math.PI/2);return g;};
 const dust=pool('tennis-dust',TENNIS_WORLD.dust,tennisAtlasUv(new T.PlaneGeometry(1,1),TENNIS_ATLAS.puff),atlas,6),marks=pool('tennis-ball-marks',TENNIS_WORLD.marks,flatGeo(TENNIS_ATLAS.smudge),atlas,2),gusts=pool('tennis-gust-lines',TENNIS_WORLD.gusts,tennisAtlasUv(new T.PlaneGeometry(1,1),TENNIS_ATLAS.gust),atlas,6);
 const DN=TENNIS_WORLD.dust,dP=new Float32Array(DN*3),dV=new Float32Array(DN*3),dLife=new Float32Array(DN),dMax=new Float32Array(DN),dSize=new Float32Array(DN);let dCursor=0,dAlive=0;
 const MN=TENNIS_WORLD.marks,mX=new Float32Array(MN),mZ=new Float32Array(MN),mA=new Float32Array(MN),mLife=new Float32Array(MN),mLen=new Float32Array(MN);let mCursor=0,mAlive=0;
 const RN=TENNIS_WORLD.gusts,rX=new Float32Array(RN),rY=new Float32Array(RN),rZ=new Float32Array(RN),rS=new Float32Array(RN);{const r=rng(5);for(let i=0;i<RN;i++){rX[i]=(r()-.5)*16;rY[i]=.7+r()*2.3;rZ[i]=-8.5+(i+r()*.6)*17/RN;rS[i]=.7+r()*.6;}}
 const M=new T.Matrix4(),P=new T.Vector3(),S=new T.Vector3(),Q=new T.Quaternion(),QY=new T.Quaternion(),UP=new T.Vector3(0,1,0);
 /** A bounce puff: `n` small ink-edged clouds thrown out from (x,z), carried downwind. */
 function puff(x:number,z:number,n:number,power:number,y=.08){if(reduced)n=Math.min(n,2);for(let k=0;k<n;k++){const i=dCursor++%DN,a=Math.random()*Math.PI*2,sp=(.4+Math.random()*.9)*power;dP[i*3]=x;dP[i*3+1]=y;dP[i*3+2]=z;dV[i*3]=Math.cos(a)*sp;dV[i*3+1]=.5+Math.random()*.9*power;dV[i*3+2]=Math.sin(a)*sp*.7;dMax[i]=dLife[i]=.5+Math.random()*.4;dSize[i]=(.3+Math.random()*.3)*(.7+power*.4);}dAlive=1;}
 function mark(x:number,z:number,vx:number,vz:number,power:number){const i=mCursor++%MN;mX[i]=x;mZ[i]=z;mA[i]=Math.atan2(vx,vz);mLen[i]=.34+Math.min(.5,Math.hypot(vx,vz)*.03)*(.6+power*.4);mLife[i]=TENNIS_WORLD.markLife;mAlive=1;}

 // ---- venue (tour stop) -----------------------------------------------------------------------------------------------------------
 let venue:TennisVenue=TENNIS_VENUES[0],venueKey='',wind=venue.breeze,windDir=1,time=0,bounceSeen=-1,netSeen=-1,kickSeen=-1,lights:Lights|null=null,pointSeen=-1,cheer=0,cheerFor=1.7,stood=0,gasp=0,call=0,callAge=9;
 const sunDir=new T.Vector3(),size=new T.Vector2(),fwd=new T.Vector3(),hz=new T.Vector3();
 function applyVenue(level:number,tour:number,l:Lights,force=false){lights=l;const v=tennisVenueFor(level,tour),key=v.id;if(key===venueKey&&!force)return v;venueKey=key;venue=v;
  paintCourt(courtCanvas,v,ppm,CW,CL);courtTex.needsUpdate=true;
  // The comic base's white sun and neutral fill stay as they are (the band thresholds assume them): a stop only moves the sun
  // and swaps the two band tints. At night the pools decide where the light band survives.
  l.sun.position.set(...v.sun);sunDir.set(...v.sun).normalize();comicDotCell(ink,l.renderer);ink.uInkShade.value.setRGB(...v.shade);ink.uInkLight.value.setRGB(...v.light);uLamp.value.x=v.lanterns>0?1:0;
  (l.scene.background as T.Color).set(v.sky[0]);(l.scene.fog as T.Fog).color.set(v.sky[0]);
  skyU.uS0.value.set(v.sky[0]);skyU.uS1.value.set(v.sky[1]);skyU.uS2.value.set(v.sky[2]);skyU.uD0.value.set(v.disc[0]);skyU.uD1.value.set(v.disc[1]);skyU.uD2.value.set(v.disc[2]);skyU.uC0.value.set(v.cloud[0]);skyU.uC1.value.set(v.cloud[1]);skyU.uH0.value.set(v.head[0]);skyU.uH1.value.set(v.head[1]);skyU.uSkyA.value.set(v.sunAlt,v.night?1:0,-v.sunSide);
  seaMat.uniforms.uFar.value.set(v.sea[0]);seaMat.uniforms.uNear.value.set(v.sea[1]);seaMat.uniforms.uGlit.value.set(v.sea[2]);seaMat.uniforms.uShore.value=v.set==='pier'?0:1;
  sandMat.color.set(v.sand);{const isBeach=v.set==='beach',big=isBeach&&!!v.stand&&!!standMesh;sand.visible=beachMesh.visible=detailMesh.visible=palmMesh.visible=isBeach;rowMesh.visible=isBeach&&!big;if(standMesh)standMesh.visible=big;pierMesh.visible=!isBeach;seat(isBeach?[baseMembers,beachMembers,big?standMembers:rowMembers]:[baseMembers,pierMembers]);}
  lanterns.visible=v.lanterns>0;dust.mat.color.set(v.dust);marks.mat.color.set(v.mark);marks.mat.opacity=v.markOpacity;gusts.mat.color.set(v.night?'#c9d0ff':COMIC_PAPER);
  wind=v.breeze;windDir=Math.sign(v.breeze)||1;uWind.value.set(wind,0,windDir);mLife.fill(0);mAlive=0;marks.mesh.count=0;dLife.fill(0);dAlive=0;dust.mesh.count=0;netDirty=true;return v;}
 /** Before each render in which the camera moved: aims the comic rim at the sun and hangs the sky panel. The horizon is the
  * screen line of TENNIS_HORIZON_Z straight ahead of the camera, but never less than a band of sky from the top of the screen, so
  * the sun and sky are in frame in every rally framing (the rally camera looks down: a true horizon never is). */
 function frame(camera:T.PerspectiveCamera){if(!lights)return;aimComicSun(ink,sunDir,camera);lights.renderer.getDrawingBufferSize(size);
  const unit=lights.renderer.getPixelRatio()*Math.max(1,Math.min(2.2,Math.min(size.x,size.y)/lights.renderer.getPixelRatio()/390));
  camera.getWorldDirection(fwd);hz.set(Math.abs(fwd.z)>.05?camera.position.x+fwd.x/fwd.z*(TENNIS_HORIZON_Z-camera.position.z):camera.position.x,0,TENNIS_HORIZON_Z).project(camera);
  const top=Math.min(size.y*.28,(size.x>size.y?64:122)*unit),y=hz.z>1||hz.z<-1?size.y-top:Math.min((hz.y*.5+.5)*size.y,size.y-top);
  skyU.uSkyS.value.set(size.x*(venue.sunSide<0?.2:.8),y,unit,5*lights.renderer.getPixelRatio());}
 function reset(s:TennisState){pointSeen=s.pointsPlayed;cheer=stood=gasp=0;callAge=9;uCrowd.value.set(0,0,0,0);bounceSeen=s.bounceEvents;netSeen=s.netEvents;kickSeen=s.kickCount;ripple=0;netDirty=true;mLife.fill(0);mAlive=0;marks.mesh.count=0;dLife.fill(0);dAlive=0;dust.mesh.count=0;}
 /** Per frame while the loop runs. Returns true while something short-lived (a puff, a net ripple) still needs frames. */
 function sync(dt:number,s:TennisState,camera:T.Camera,matchPoint=false){
  time+=dt;uTime.value=reduced?0:time;
  // Wind: ease toward this point's wind (or the venue's breeze); the flag direction turns through zero so it furls and refills.
  const want=tennisWorldWind(s.wind,venue.breeze),k=1-Math.exp(-dt*1.6);wind+=(want-wind)*k;windDir+=((Math.sign(want)||1)-windDir)*(1-Math.exp(-dt*1.1));uWind.value.set(wind,0,windDir);seaMat.uniforms.uWind.value=wind;
  // Events from the rules: bounce = a puff + a smudge, net = ripple, kick = a scuff puff off the boot when the ball is low.
  if(s.bounceEvents!==bounceSeen){const fresh=bounceSeen>=0&&s.bounceEvents>bounceSeen;bounceSeen=s.bounceEvents;if(fresh){const b=s.ball,sp=Math.hypot(b.vx,b.vy),power=Math.min(1.6,.5+sp*.07);puff(s.fxLandX,s.fxLandY,venue.surface==='hard'||venue.surface==='rubber'||venue.surface==='deck'?2:4,power);if(venue.markOpacity>0)mark(s.fxLandX,s.fxLandY,b.vx,b.vy,power);}}
  if(s.netEvents!==netSeen){const fresh=netSeen>=0;netSeen=s.netEvents;if(fresh){ripple=1;rippleAge=0;rippleX=Math.max(-5,Math.min(5,s.ball.x));rippleAmp=reduced?.03:.16;gasp=1;}}
  if(s.kickCount!==kickSeen){const fresh=kickSeen>=0;kickSeen=s.kickCount;if(fresh&&s.ball.z<.7){const p=s.lastKicker==='you'?s.you:s.rival;puff(p.x+(s.ball.x-p.x)*.6,p.y+(s.ball.y-p.y)*.6,s.lastShot==='dive'?4:2,s.lastShot==='dive'?1.2:.7);}}
  // Net.
  if(ripple>0){rippleAge+=dt;if(rippleAge>1.5)ripple=0;}
  const moving=ripple>0||!reduced&&Math.abs(wind)>.3;if(moving||netDirty||!netCalm){shapeNet(wind,time);netDirty=false;netCalm=!moving;}
  // Puffs: they pop to size at once and shrink away (no soft fade until the last third).
  if(dAlive){let n=0;Q.copy(camera.quaternion);const d=dust.mesh;for(let i=0;i<DN;i++){if(dLife[i]<=0)continue;dLife[i]-=dt;const j=i*3,t=1-Math.max(0,dLife[i])/dMax[i];dV[j]+=wind*2.2*dt;dV[j+1]-=dt*1.4;const drag=Math.max(0,1-1.8*dt);dV[j]*=drag;dV[j+2]*=drag;dP[j]+=dV[j]*dt;dP[j+1]=Math.max(.05,dP[j+1]+dV[j+1]*dt);dP[j+2]+=dV[j+2]*dt;
    P.set(dP[j],dP[j+1],dP[j+2]);S.setScalar(dSize[i]*(1.5-t*.9)*Math.min(1,t*8+.4));d.setMatrixAt(n,M.compose(P,Q,S));dust.alpha.setX(n,t<.66?.95:.95*(1-(t-.66)/.34));n++;}
   d.count=n;d.instanceMatrix.needsUpdate=true;dust.alpha.needsUpdate=true;if(!n)dAlive=0;}
  // Ball smudges: stay, then fade.
  if(mAlive){let n=0;const mm=marks.mesh;for(let i=0;i<MN;i++){if(mLife[i]<=0)continue;mLife[i]-=dt;const life=Math.max(0,mLife[i])/TENNIS_WORLD.markLife;P.set(mX[i],.012+n*.0006,mZ[i]);QY.setFromAxisAngle(UP,mA[i]);S.set(.3,1,mLen[i]);mm.setMatrixAt(n,M.compose(P,QY,S));marks.alpha.setX(n,Math.min(1,life*3.2));n++;}
   mm.count=n;mm.instanceMatrix.needsUpdate=true;marks.alpha.needsUpdate=true;if(!n)mAlive=0;}
  // Gust lines: drawn wind strokes crossing above the court with the wind (none on a still day or under reduced motion).
  {const a=Math.abs(wind),on=!reduced&&a>.3&&venue.gust>0,gm=gusts.mesh;if(on){Q.copy(camera.quaternion);const dir=wind<0?-1:1;for(let i=0;i<RN;i++){rX[i]+=wind*(5+rS[i]*4)*dt;if(rX[i]>8.5)rX[i]-=17;else if(rX[i]<-8.5)rX[i]+=17;P.set(rX[i],rY[i]+Math.sin(time*1.1+i*2)*.12,rZ[i]);S.set(dir*2.3*rS[i]*(.6+a*.6),.5*rS[i],1);gm.setMatrixAt(i,M.compose(P,Q,S));gusts.alpha.setX(i,Math.min(1,venue.gust*(a-.3)/.5)*Math.min(1,(1-Math.abs(rX[i])/8.5)*3)*.85);}gm.count=RN;gm.instanceMatrix.needsUpdate=true;gusts.alpha.needsUpdate=true;}else if(gm.count)gm.count=0;}
  // Club members: eyes on the ball; a clap for a point (longer after a long rally), on their feet for a long rally,
  // match point and the finish, a lean on a net cord; the umpire's arm goes out to the side that won the point.
  uBall.value.set(s.ball.x,s.ball.z,s.ball.y);
  if(s.pointsPlayed!==pointSeen){const fresh=pointSeen>=0&&s.pointsPlayed>pointSeen;pointSeen=s.pointsPlayed;if(fresh){cheer=1;cheerFor=s.rally>=8||s.phase==='over'?2.8:1.7;call=s.pointWinner==='you'?-1:1;callAge=0;}}
  if(cheer>0)cheer=Math.max(0,cheer-dt/cheerFor);if(gasp>0)gasp=Math.max(0,gasp-dt*1.3);if(callAge<1.6)callAge+=dt;
  const wantStand=s.phase==='rally'&&s.rally>=8||matchPoint&&s.phase!=='over'||s.phase==='over'||cheer>0&&cheerFor>2?1:0;stood+=(wantStand-stood)*(1-Math.exp(-dt*3.2));if(Math.abs(wantStand-stood)<.004)stood=wantStand;
  const callLevel=callAge<1.6?Math.min(1,callAge*6)*Math.min(1,(1.6-callAge)*3):0;uCrowd.value.set(Math.min(1,cheer*2.6),stood,gasp*gasp*(3-2*gasp),call*callLevel);
  return dAlive>0||ripple>0||cheer>0||gasp>0||callAge<1.6||stood!==wantStand;
 }
 return{group,applyVenue,reset,sync,puff,frame,venue:()=>venue,wind:()=>wind,
  /** The game's comic shading options (one uniform set + the lamp-pool hook): the stage's players and ball take them too. */
  comic,
  /** Direction toward the sun (unit): the ball's cast shadow is projected along it. */
  sun:()=>sunDir,
  /** Debug/QA read of the members' reactions: [clap, stand, lean, umpire call]. */
  crowd:()=>uCrowd.value.toArray(),
  /** A net cord from the feel layer (same event the tape "tick" uses). */
  ripple(x:number,amp=.16){ripple=1;rippleAge=0;rippleX=x;rippleAmp=reduced?.03:amp;},
  dispose(){for(const t of[courtTex,atlas])t.dispose();delete scene.userData.tennisAtlas;for(const e of extra)e.dispose();},
 };
}
export type TennisWorld=ReturnType<typeof createTennisWorld>;
