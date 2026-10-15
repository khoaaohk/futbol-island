import * as T from 'three';
import {ROOM,WING,WING_PARTITION} from './museumLayout';

/**
 * Museum walls that read as walls (Oct 14 2026, user, of the wing's east wall seen from the hall: "fix this wall, it blends in and
 * hard to tell it's a wall"). Before, every wall was one gallery-white box under the hall's two lights, so its long side facing the
 * camera (the −x face) came out #dddad3, the floor's own grey, and read as a floor stripe; the player behind it was cut by its
 * vertical edge. Now (pure data + maths here, built by museumScene.ts into the SAME merged meshes, so no extra draw calls):
 *  - every face is baked to a target ON-SCREEN tone (`faceAlbedo` divides out the hall's lighting): lit faces (+z, facing the
 *    camera and the key light) warm white, shaded faces (±x, −z) a soft mid-grey clearly darker than the floor, the top cap
 *    brightest;
 *  - a crisp muted-ink rim along the top edge and a darker skirting line at the foot;
 *  - a soft contact-shadow band on the floor along every foot (strips on the existing soft-shadow mesh and its 64² gradient);
 *  - a cutaway: wall fragments in front of the player within a small screen-space ellipse round them are dithered away
 *    (`CUT_GLSL`, mirrored by `cutKeep` for the tests), so a wall between the camera and the player never hides or slices them.
 *    The uniforms are set in the frame loop, which only runs while something moves (0 rAF at rest, as before).
 */

/** The hall's two lights (museumScene.ts uses these; the wall tones are solved against them). */
export const MUSEUM_LIGHT={sky:'#ffffff',ground:'#e6e2da',hemi:2.5,sun:'#ffffff',sunIntensity:.9,sunPos:[-3,10,6] as const} as const;
/** On-screen tones (sRGB) of the wall faces. The floor renders ≈ #dfdbd1 (pale concrete #dcd8cf under the same lights). */
export const WALL_TONES={cap:'#fbfaf6',lit:'#f3f0e9',shade:'#c6c1b8',rim:'#77736b',skirt:'#9d988e'} as const;
/** The floor's albedo (museumScene P.floor), for the contrast tests. */
export const FLOOR_ALBEDO='#dcd8cf';
export const SKIRT_H=.07,RIM_H=.026,LIP=.008,AO_WIDTH=.5;

export type Side='+x'|'-x'|'+z'|'-z';
/** One wall box (axis-aligned): centre x/z, size w (x) × d (z) × h, from `y0` up. `ao`: floor contact-shadow bands, each on one
 *  side between `a` and `b` along the wall (absolute x for ±z sides, z for ±x sides). `skirt`: false for the lintel. */
export type WallSpec={id:string;x:number;z:number;w:number;d:number;h:number;y0:number;skirt:boolean;ao:{side:Side;a:number;b:number}[]};

/** Every wall in the museum: the shell, the opening's stubs and lintel, the kit-wall partition, the wing's partition and the low
 *  front sills. */
export function museumWalls():WallSpec[]{
 const W=ROOM.halfW,D=ROOM.halfD,H=ROOM.wallH,WX0=WING.x0,WX1=WING.x1,WZ1=WING.z1,O=WING.open,WCX=(WX0+WX1)/2,WCZ=(WZ1-D)/2,WD=WZ1+D;
 const out:WallSpec[]=[
  {id:'back',x:(WX0+W)/2,z:-D-.1,w:W-WX0+.4,d:.2,h:H,y0:0,skirt:true,ao:[{side:'+z',a:WX0,b:W}]},
  {id:'wing-west',x:WX0-.1,z:WCZ,w:.2,d:WD+.4,h:H,y0:0,skirt:true,ao:[{side:'+x',a:-D,b:WZ1}]},
  {id:'hall-east',x:W+.1,z:0,w:.2,d:D*2+.4,h:H,y0:0,skirt:true,ao:[{side:'-x',a:-D,b:D}]},
  {id:'west-north',x:WX1,z:(-D-O)/2,w:.24,d:D-O,h:H,y0:0,skirt:true,ao:[{side:'-x',a:-D,b:-O},{side:'+x',a:-D,b:-O}]},
  // The wing's east wall (the certificate wall inside the wing; the hall's west wall south of the opening).
  {id:'west-south',x:WX1,z:(O+WZ1)/2,w:.24,d:WZ1-O,h:H,y0:0,skirt:true,ao:[{side:'-x',a:O,b:WZ1},{side:'+x',a:O,b:D}]},
  {id:'lintel',x:WX1,z:0,w:.24,d:O*2+.24,h:.5,y0:H-.5,skirt:false,ao:[]},
 ];
 for(const s of [-1,1]){const x0=s<0?ROOM.partitionWest:ROOM.aisleHalf,x1=s<0?-ROOM.aisleHalf:W;
  out.push({id:s<0?'partition-west':'partition-east',x:(x0+x1)/2,z:ROOM.partitionZ,w:x1-x0,d:.24,h:ROOM.partitionH,y0:0,skirt:true,ao:[{side:'+z',a:x0,b:x1},{side:'-z',a:x0,b:x1}]});}
 {const P=WING_PARTITION;out.push({id:'wing-partition',x:(P.x0+P.x1)/2,z:P.z,w:P.x1-P.x0,d:.24,h:ROOM.partitionH,y0:0,skirt:true,ao:[{side:'+z',a:P.x0,b:P.x1},{side:'-z',a:P.x0,b:P.x1}]});}
 // The low front sills (the camera looks in over them), either side of the door, and the wing's.
 const dl=ROOM.doorX-ROOM.doorHalf-.1,dr=ROOM.doorX+ROOM.doorHalf+.1;
 out.push({id:'sill-west',x:(WX1+dl)/2,z:D+.05,w:dl-WX1+.1,d:.18,h:.5,y0:0,skirt:true,ao:[{side:'-z',a:WX1,b:dl}]},
  {id:'sill-east',x:(dr+W+.1)/2,z:D+.05,w:W+.1-dr,d:.18,h:.5,y0:0,skirt:true,ao:[{side:'-z',a:dr,b:W}]},
  {id:'sill-wing',x:WCX,z:WZ1+.05,w:WX1-WX0+.2,d:.18,h:.5,y0:0,skirt:true,ao:[{side:'-z',a:WX0,b:WX1}]});
 return out;
}

const sunDir=new T.Vector3(...MUSEUM_LIGHT.sunPos).normalize(),sky=new T.Color(MUSEUM_LIGHT.sky),ground=new T.Color(MUSEUM_LIGHT.ground),sun=new T.Color(MUSEUM_LIGHT.sun);
/** What a Lambert surface with normal `n` receives in the hall, per linear channel (three r169: (hemi + sun·n⁺) / π). */
export function faceIrradiance(n:{x:number;y:number;z:number}){
 const w=.5*n.y+.5,h=ground.clone().lerp(sky,w).multiplyScalar(MUSEUM_LIGHT.hemi),d=Math.max(0,n.x*sunDir.x+n.y*sunDir.y+n.z*sunDir.z)*MUSEUM_LIGHT.sunIntensity;
 return h.add(sun.clone().multiplyScalar(d)).multiplyScalar(1/Math.PI);
}
/** The vertex colour (linear; may exceed 1) that makes a face with normal `n` render as `target` (sRGB hex). */
export function faceAlbedo(target:string,n:{x:number;y:number;z:number}){const c=new T.Color(target),e=faceIrradiance(n);return new T.Color(c.r/e.r,c.g/e.g,c.b/e.b);}
/** The on-screen sRGB colour of an albedo (sRGB hex) on a face with normal `n`, clamped like the framebuffer. */
export function rendered(albedo:string,n:{x:number;y:number;z:number}){const c=new T.Color(albedo),e=faceIrradiance(n);return new T.Color(Math.min(1,c.r*e.r),Math.min(1,c.g*e.g),Math.min(1,c.b*e.b));}
/** Which tone a wall face takes: the top cap, lit (+z: toward the camera and the key light) or shaded (everything else). */
export const toneFor=(n:{x:number;y:number;z:number}):keyof typeof WALL_TONES=>n.y>.5?'cap':n.z>.5?'lit':'shade';
/** WCAG relative luminance and contrast ratio (the tests' "clearly lighter / darker than the floor"). */
/** (three.js Colors hold linear values, so this is WCAG's relative luminance directly.) */
export const luminance=(c:T.Color)=>.2126*c.r+.7152*c.g+.0722*c.b;
export const contrast=(a:T.Color,b:T.Color)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

// ---- Cutaway ----------------------------------------------------------------------------------------------------------------
/** The cut: an ellipse in view units (the orthographic camera: view x/y are screen axes in metres) round the player's middle,
 *  applied only to wall fragments (a) at least `margin` m on the camera's side of the player along the floor and (b) on a face
 *  the player stands behind (the player's middle is on the far side of the face's plane, so the face really can hide them). So
 *  the back wall or a partition behind them, however tall, or a wall beside them, is never cut; a wall in front is, right down to
 *  its foot. */
export const CUT={centreY:.8,rx:.78,ry:1.08,inner:.74,margin:.15} as const;
export type CutUniforms={uCutOn:{value:number};uCutCentre:{value:T.Vector3};uCutPlayer:{value:T.Vector2};uCutDir:{value:T.Vector2}};
export const cutUniforms=():CutUniforms=>({uCutOn:{value:0},uCutCentre:{value:new T.Vector3()},uCutPlayer:{value:new T.Vector2()},uCutDir:{value:new T.Vector2(0,1)}});
/** Per rendered frame (the loop only runs while something moves): where the player is, on screen and on the floor, and which
 *  way the camera looks along the floor. No allocation. */
export function updateCut(u:CutUniforms,on:boolean,x:number,z:number,camera:T.Camera){
 u.uCutOn.value=on?1:0;if(!on)return;u.uCutCentre.value.set(x,CUT.centreY,z).applyMatrix4(camera.matrixWorldInverse);u.uCutPlayer.value.set(x,z);
 const e=camera.matrixWorld.elements;u.uCutDir.value.set(e[8],e[10]).normalize();// the camera's +z axis: toward the camera
}
/** How much of a wall fragment survives (0 = cut, 1 = kept; between = dithered): the CPU mirror of CUT_GLSL. `world` is the
 *  fragment's world position, `view` its view-space position. */
export function cutKeep(u:CutUniforms,world:{x:number;y:number;z:number},view:{x:number;y:number},n:{x:number;y:number;z:number}){
 if(u.uCutOn.value<.5)return 1;const d=u.uCutDir.value,p=u.uCutPlayer.value,c=u.uCutCentre.value;
 if((world.x-p.x)*d.x+(world.z-p.y)*d.y<=CUT.margin)return 1;
 if(n.x*(p.x-world.x)+n.y*(CUT.centreY-world.y)+n.z*(p.y-world.z)>=0)return 1;
 const r=Math.hypot((view.x-c.x)/CUT.rx,(view.y-c.y)/CUT.ry);if(r>=1)return 1;
 const t=Math.min(1,Math.max(0,(r-CUT.inner)/(1-CUT.inner)));return t*t*(3-2*t);
}
const f3=(v:number)=>v.toFixed(3);
export const CUT_GLSL=`if(uCutOn>.5&&vCut>.5&&dot(vCutWorld.xz-uCutPlayer,uCutDir)>${f3(CUT.margin)}&&dot(vCutN,vec3(uCutPlayer.x,${f3(CUT.centreY)},uCutPlayer.y)-vCutWorld)<0.){
 float r=length((vCutView.xy-uCutCentre.xy)/vec2(${f3(CUT.rx)},${f3(CUT.ry)}));
 if(r<1.){float k=smoothstep(${f3(CUT.inner)},1.,r);float n=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(k<=n)discard;}}`;
/** Patch a material (Lambert or Basic) so fragments with aCut = 1 are cut away round the player. Shares `uniforms`. */
export function addCutaway(mat:T.Material,uniforms:CutUniforms){
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,uniforms);
  sh.vertexShader='attribute float aCut;\nvarying float vCut;\nvarying vec3 vCutView;\nvarying vec3 vCutWorld;\nvarying vec3 vCutN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vCut=aCut;vCutView=mvPosition.xyz;vCutWorld=(modelMatrix*vec4(transformed,1.)).xyz;vCutN=mat3(modelMatrix)*normal;');
  sh.fragmentShader='uniform float uCutOn;\nuniform vec3 uCutCentre;\nuniform vec2 uCutPlayer;\nuniform vec2 uCutDir;\nvarying float vCut;\nvarying vec3 vCutView;\nvarying vec3 vCutWorld;\nvarying vec3 vCutN;\n'+sh.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+CUT_GLSL);};
 mat.customProgramCacheKey=()=>'museum-cutaway';
}
