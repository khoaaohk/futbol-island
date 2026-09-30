import * as T from 'three';
import {LUMBAR_HEIGHT,CHEST_HEIGHT,SPINE_LIMIT} from './spineSurface';
import {DIGIT_GLYPHS,DIGIT_HEIGHT} from './shirtDigits';
import type {LiveFormat} from '../town/venues';

/*
 * Back numbers for the procedural rig, drawn in Barlow Condensed Bold (SIL OFL, outlines in
 * ./shirtDigits.ts). Every number, on every rig, shares ONE small atlas texture (the ten
 * digits) and ONE panel geometry per body shape. The number itself is not in the geometry:
 * the material colour carries a code (r = number/100, g = ink), so the rig's existing
 * playerBatch instancing turns every visible back number into a single instanced draw
 * (instance colour = code), and an individually rendered rig uses the same shader with its
 * own material colour. The fragment shader lays the digits out (two digits at ×0.9, tight
 * tracking) and samples the atlas; the vertex shader hides the panel when the number would
 * be only a few pixels tall, so distant players cost almost nothing.
 *
 * The panel is built on the jersey's own back facets (same lathe profile, 20 segments) and
 * carries the jersey's spine morph targets, sharing the jersey's morph weights, so it bends,
 * twists and leans with the shirt at no per-frame cost.
 */

// ---------------------------------------------------------------- layout (metres, torso space)
/** Digit (cap) height of a one-digit number; two-digit numbers are ×0.9 (flicco: 116px vs 104px). */
export const SHIRT_DIGIT_HEIGHT=.2, SHIRT_TWO_DIGIT_SCALE=.9;
/** Vertical centre of the number on the back, torso-local (between the shoulder blades). */
export const SHIRT_NUMBER_Y=.283;
/** Gap between the two digits' ink, in font units (tight, like printed shirt numbers). */
export const SHIRT_TRACKING=34;
/** Outline half-width in font units (for white ink on darker shirts). */
export const SHIRT_OUTLINE=24;
/** Below this on-screen digit height (CSS px) the number is not drawn; it fades in up to FULL. */
export const SHIRT_LOD_MIN_PX=6, SHIRT_LOD_FULL_PX=9;
/** Panel extent: rows between these heights, columns ±PANEL_STEPS half-facets (9° each) round the back centre. */
const PANEL_Y0=.16, PANEL_Y1=.405, PANEL_STEPS=7, OFFSET=.0045;
/** The jersey lathe (spineSurface.ts): radii at heights, 20 segments, depth scaled by .64. */
const PROFILE_HEIGHTS=[0,.08,.23,.38,.43,.49];
const PROFILE_RADII={male:[.145,.155,.175,.245,.225,.105],female:[.155,.15,.16,.222,.205,.105]};
const LATHE_SEGMENTS=20, DEPTH=.64;

export type ShirtInk='#23232a'|'#ffffff';
const scratch=new T.Color();
/** flicco's rule: dark ink on light shirts (sRGB luminance above .62), white ink otherwise. */
export function shirtInk(shirt:T.ColorRepresentation):ShirtInk{
 const c=scratch.set(shirt).getRGB({r:0,g:0,b:0},T.SRGBColorSpace);
 return .2126*c.r+.7152*c.g+.0722*c.b>.62?'#23232a':'#ffffff';
}

export type ShirtGlyphBox={digit:number;x0:number;x1:number;y0:number;y1:number};
/**
 * Where each digit's ink sits, in metres on the back as seen from BEHIND: x grows to the
 * viewer's right, y is torso height. Mirrors the fragment shader exactly (same table/gap).
 */
export function shirtNumberLayout(n:number){
 const value=Math.max(0,Math.min(99,Math.round(n))),two=value>=10;
 const digits=two?[Math.floor(value/10),value%10]:[value];
 const scale=two?SHIRT_TWO_DIGIT_SCALE:1,height=SHIRT_DIGIT_HEIGHT*scale,unit=height/DIGIT_HEIGHT;
 const widths=digits.map(d=>DIGIT_GLYPHS[d].xMax-DIGIT_GLYPHS[d].xMin);
 const total=widths.reduce((a,b)=>a+b,0)+(two?SHIRT_TRACKING:0);
 const top=SHIRT_NUMBER_Y+height/2;let x=-total/2;const boxes:ShirtGlyphBox[]=[];
 digits.forEach((digit,i)=>{boxes.push({digit,x0:x*unit,x1:(x+widths[i])*unit,y0:top-height,y1:top});x+=widths[i]+SHIRT_TRACKING;});
 return {value,digits,scale,height,width:total*unit,boxes};
}

// ---------------------------------------------------------------- classic numbers by slot
const CLASSIC:Record<LiveFormat,Record<string,number>>={
 // 4-3-3: 1 keeper, 2/3 full-backs, 4/5 centre-backs, 6 holding, 8 box-to-box, 10 playmaker, 7/11 wingers, 9 striker.
 '11v11':{gk:1,rb:2,lb:3,rcb:4,lcb:5,cm:6,rcm:8,lcm:10,rw:7,st:9,lw:11},
 // 3-2-3: a back three (2 5 3), a holding 6 beside the playmaking 10, wingers 7/11, striker 9.
 '9v9':{gk:1,rcb:2,cb:5,lcb:3,lcm:6,rcm:10,rw:7,st:9,lw:11},
 // 2-3-1: two centre-backs, the 10 in the middle of three, wide 7/11, striker 9.
 '7v7':{gk:1,rcb:4,lcb:5,rm:7,cm:10,lm:11,st:9},
 // Futsal: goleiro 1, fixo 4, alas 7/11, pivô 9.
 futsal:{gk:1,cb:4,rm:7,lm:11,st:9},
 // Beach soccer diamond: keeper 1, defender 4, wingers 7/11, pivot 9.
 beach:{gk:1,cb:4,rm:7,lm:11,st:9},
};
/** Position-appropriate classic number for a live-match slot id (away ids carry a leading "d"). */
export function classicShirtNumber(format:LiveFormat,slotId:string):number|null{
 const table=CLASSIC[format],id=slotId.toLowerCase();
 return table?.[id]??(id.startsWith('d')?table?.[id.slice(1)]:undefined)??null;
}
/** The player's own character wears the playmaker's 10 unless they pick another. */
export const DEFAULT_PLAYER_NUMBER=10;

// ---------------------------------------------------------------- atlas (ten digit cells)
/** Font units of padding round each glyph in its cell (outline + mip bleed). */
const PAD=56, CELL_TOP=20;
const CELL_W_FU=Math.max(...DIGIT_GLYPHS.map(g=>g.xMax))+2*PAD, CELL_H_FU=DIGIT_HEIGHT+2*CELL_TOP+2*PAD;
/** Atlas pixels per font unit: a 700-unit digit is ~105px tall. */
export const ATLAS_SCALE=.15;
export const ATLAS_CELL_W=Math.ceil(CELL_W_FU*ATLAS_SCALE), ATLAS_CELL_H=Math.ceil(CELL_H_FU*ATLAS_SCALE);
export const ATLAS_W=ATLAS_CELL_W*10, ATLAS_H=ATLAS_CELL_H;
/** A digit's cell in atlas UVs (v = 0 at the top row: the texture is uploaded without flipY). */
export function atlasCell(digit:number){return {u0:digit*ATLAS_CELL_W/ATLAS_W,u1:(digit+1)*ATLAS_CELL_W/ATLAS_W,v0:0,v1:1};}
/** Atlas UV of a glyph-space point (font units, y down from the cap line). */
export function atlasUv(digit:number,gx:number,gy:number){return {u:(digit*ATLAS_CELL_W+(gx+PAD)*ATLAS_SCALE)/ATLAS_W,v:((gy+CELL_TOP+PAD)*ATLAS_SCALE)/ATLAS_H};}

let atlas:T.Texture|undefined;
/** Shared, lazily baked digit atlas: R = fill coverage, G = outline coverage (includes the fill). */
export function shirtDigitAtlas():T.Texture{
 if(atlas)return atlas;
 const canvas=typeof document!=='undefined'?document.createElement('canvas'):undefined;
 const ctx=canvas?.getContext('2d');
 if(!canvas||!ctx||typeof Path2D==='undefined'){
  // Headless (Node tests): an empty stand-in keeps the material valid.
  atlas=new T.DataTexture(new Uint8Array(4),1,1);atlas.needsUpdate=true;return atlas;
 }
 canvas.width=ATLAS_W;canvas.height=ATLAS_H;
 ctx.fillStyle='#000';ctx.fillRect(0,0,ATLAS_W,ATLAS_H);
 DIGIT_GLYPHS.forEach((glyph,digit)=>{
  const path=new Path2D(glyph.path);
  ctx.save();ctx.translate(digit*ATLAS_CELL_W+PAD*ATLAS_SCALE,(CELL_TOP+PAD)*ATLAS_SCALE);ctx.scale(ATLAS_SCALE,ATLAS_SCALE);
  ctx.globalCompositeOperation='source-over';
  ctx.lineJoin='round';ctx.lineWidth=SHIRT_OUTLINE*2;ctx.strokeStyle='#00ff00';ctx.fillStyle='#00ff00';
  ctx.stroke(path);ctx.fill(path,'nonzero');
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff0000';ctx.fill(path,'nonzero');
  ctx.restore();
 });
 const texture=new T.CanvasTexture(canvas);
 texture.flipY=false;texture.colorSpace=T.NoColorSpace;texture.anisotropy=4;
 texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=true;
 texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;texture.name='shirt-digit-atlas';
 return atlas=texture;
}

// ---------------------------------------------------------------- panel geometry on the back
const ease=(x:number)=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
/** The jersey's lathe radius at torso height y (piecewise linear, like its profile). */
export function jerseyRadius(female:boolean,y:number){
 const r=PROFILE_RADII[female?'female':'male'],h=PROFILE_HEIGHTS;
 for(let i=0;i<h.length-1;i++)if(y<=h[i+1])return T.MathUtils.lerp(r[i],r[i+1],T.MathUtils.clamp((y-h[i])/(h[i+1]-h[i]),0,1));
 return r[r.length-1];
}
/** Same skin weights / signed-joint morphs as spineSurface.ts, applied to any torso-space geometry. */
function addSpineMorphs(g:T.BufferGeometry){
 g.morphTargetsRelative=true;g.morphAttributes.position=[];g.morphAttributes.normal=[];
 const base=g.getAttribute('position'),normal=g.getAttribute('normal'),v=new T.Vector3(),rotated=new T.Vector3(),q=new T.Quaternion(),axis=new T.Vector3();
 for(let joint=0;joint<2;joint++)for(let a=0;a<3;a++)for(const sign of [1,-1]){
  const copy=g.clone(),pos=copy.getAttribute('position'),pivot=joint?CHEST_HEIGHT:LUMBAR_HEIGHT;
  axis.set(a===0?1:0,a===1?1:0,a===2?1:0);q.setFromAxisAngle(axis,sign*SPINE_LIMIT);
  for(let i=0;i<base.count;i++){
   v.fromBufferAttribute(base,i);const weight=joint?ease((v.y-.2)/.18):ease((v.y-.025)/.22);
   rotated.copy(v);rotated.y-=pivot;rotated.applyQuaternion(q);rotated.y+=pivot;v.lerp(rotated,weight);pos.setXYZ(i,v.x,v.y,v.z);
  }
  copy.computeVertexNormals();const n=copy.getAttribute('normal'),dp=new Float32Array(base.count*3),dn=new Float32Array(base.count*3);
  for(let i=0;i<base.count*3;i++){dp[i]=pos.array[i]-base.array[i];dn[i]=n.array[i]-normal.array[i];}
  g.morphAttributes.position.push(new T.Float32BufferAttribute(dp,3));g.morphAttributes.normal.push(new T.Float32BufferAttribute(dn,3));copy.dispose();
 }
}
/**
 * Rows at the jersey's ring heights (creases at .23 and .38 fall on rows) and columns at the
 * lathe's facet angles, halved, so every panel cell lies inside one flat jersey facet and the
 * panel floats a constant few millimetres off the shirt. uv = (x as seen from behind, y) in metres.
 */
function buildPanel(female:boolean){
 const rows:number[]=[];
 for(let i=0;i<PROFILE_HEIGHTS.length-1;i++)for(let j=0;j<3;j++){const y=T.MathUtils.lerp(PROFILE_HEIGHTS[i],PROFILE_HEIGHTS[i+1],j/3);if(y>PANEL_Y0&&y<PANEL_Y1)rows.push(y);}
 rows.push(PANEL_Y0,PANEL_Y1);for(let y=PANEL_Y0;y<PANEL_Y1;y+=.03)rows.push(y);
 const ys=[...new Set(rows.map(y=>+y.toFixed(5)))].sort((a,b)=>a-b);
 const step=Math.PI*2/LATHE_SEGMENTS,cols:number[]=[];for(let k=-PANEL_STEPS;k<=PANEL_STEPS;k++)cols.push(Math.PI+k*step/2);
 const positions:number[]=[],uvs:number[]=[],index:number[]=[];
 const facet=(angle:number,y:number,out:T.Vector3)=>{
  // Point on the flat facet between the two lathe vertices around `angle`, like the jersey mesh.
  const r=jerseyRadius(female,y),k=Math.floor((angle+1e-9)/step),t=(angle-k*step)/step,a0=k*step,a1=(k+1)*step;
  return out.set(r*T.MathUtils.lerp(Math.sin(a0),Math.sin(a1),t),y,DEPTH*r*T.MathUtils.lerp(Math.cos(a0),Math.cos(a1),t));
 };
 const p=new T.Vector3(),n=new T.Vector3(),e=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
 for(const y of ys)for(const angle of cols){
  facet(angle,y,p);
  // Outward normal of the ellipse at this angle (averaged across a facet edge), then a small lift.
  n.set(Math.sin(angle)*DEPTH,0,Math.cos(angle)).normalize();
  // Tilt with the profile slope so the lift stays perpendicular on the tapering torso.
  facet(angle,y+.004,a);facet(angle,y-.004,b);e.subVectors(a,b).normalize();n.addScaledVector(e,-n.dot(e)).normalize();
  p.addScaledVector(n,OFFSET);positions.push(p.x,p.y,p.z);uvs.push(-p.x,p.y);
 }
 const w=cols.length;
 for(let r=0;r<ys.length-1;r++)for(let c=0;c<w-1;c++){
  const i=r*w+c,j=i+1,k=i+w,l=k+1;
  // Columns run toward -x across the back (angles past π), so this winding faces outward (-z).
  index.push(i,j,k,j,l,k);
 }
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(index);
 g.computeVertexNormals();addSpineMorphs(g);g.computeBoundingSphere();g.boundingSphere!.radius+=.12;
 g.name=female?'shirt-number-panel-female':'shirt-number-panel-male';
 return g;
}
const panels:{male?:T.BufferGeometry;female?:T.BufferGeometry}={};
/** Shared (never disposed, ~1k floats) back panel for each body shape. */
export function shirtNumberPanel(female:boolean){const key=female?'female':'male';return panels[key]??=buildPanel(female);}

// ---------------------------------------------------------------- material
const GLYPH_TABLE=DIGIT_GLYPHS.map(g=>`vec2(${g.xMin.toFixed(1)},${(g.xMax-g.xMin).toFixed(1)})`).join(',');
const f=(v:number)=>v.toFixed(6);
const viewport={value:800};
const VERTEX_PARS=/* glsl */`
uniform float uShirtViewport;
varying float vShirtAspect;
varying float vShirtFade;`;
const VERTEX_LOD=/* glsl */`
{
 mat4 shirtModel=modelMatrix;
 #ifdef USE_INSTANCING
  shirtModel=modelMatrix*instanceMatrix;
 #endif
 float sx=length(shirtModel[0].xyz),sy=length(shirtModel[1].xyz);
 vShirtAspect=sx/max(sy,1e-5);
 vec4 shirtCentre=projectionMatrix*viewMatrix*shirtModel*vec4(0.,${f(SHIRT_NUMBER_Y)},0.,1.);
 float shirtPx=${f(SHIRT_DIGIT_HEIGHT)}*sy*projectionMatrix[1][1]*uShirtViewport*.5/max(shirtCentre.w,1e-3);
 vShirtFade=smoothstep(${f(SHIRT_LOD_MIN_PX)},${f(SHIRT_LOD_FULL_PX)},shirtPx);
 // Too small to read: push the whole panel outside the clip volume (no fragments at all).
 if(shirtPx<${f(SHIRT_LOD_MIN_PX)})gl_Position=vec4(0.,0.,2.,1.);
}`;
const FRAGMENT_PARS=/* glsl */`
varying float vShirtAspect;
varying float vShirtFade;
const vec2 SHIRT_GLYPH[10]=vec2[10](${GLYPH_TABLE});`;
const FRAGMENT_MAP=/* glsl */`
{
 vec3 shirtCode=diffuse;
 // Instanced (playerBatch): the instance colour arrives as vColor (USE_COLOR in the fragment stage).
 #ifdef USE_COLOR
  shirtCode=vColor;
 #endif
 float shirtN=floor(shirtCode.r*100.+.5);
 float tens=floor(shirtN/10.+.001),ones=shirtN-tens*10.;
 bool two=tens>.5;
 float unit=${f(SHIRT_DIGIT_HEIGHT)}*(two?${f(SHIRT_TWO_DIGIT_SCALE)}:1.)/${f(DIGIT_HEIGHT)};
 vec2 g0=SHIRT_GLYPH[int(tens)],g1=SHIRT_GLYPH[int(ones)];
 float total=two?g0.y+${f(SHIRT_TRACKING)}+g1.y:g1.y;
 // Font units: X from the number's left ink edge (viewer's left), Y down from the cap line.
 float X=vMapUv.x*vShirtAspect/unit+total*.5;
 float Y=(${f(SHIRT_NUMBER_Y)}-vMapUv.y)/unit+${f(DIGIT_HEIGHT/2)};
 float digit=ones,gx=X+g1.x;
 if(two){if(X<g0.y+${f(SHIRT_TRACKING/2)}){digit=tens;gx=X+g0.x;}else gx=X-g0.y-${f(SHIRT_TRACKING)}+g1.x;}
 // Continuous atlas-space coordinates for the gradients: no mip seams where the digit switches.
 vec2 shirtCont=vec2(X*${f(ATLAS_SCALE/ATLAS_W)},Y*${f(ATLAS_SCALE/ATLAS_H)});
 vec2 shirtUv=vec2((digit*${f(ATLAS_CELL_W)}+(gx+${f(PAD)})*${f(ATLAS_SCALE)})/${f(ATLAS_W)},(Y+${f(CELL_TOP+PAD)})*${f(ATLAS_SCALE/ATLAS_H)});
 float inCell=step(-${f(PAD)},gx)*step(gx,${f(CELL_W_FU-PAD)})*step(-${f(CELL_TOP+PAD)},Y)*step(Y,${f(DIGIT_HEIGHT+CELL_TOP+PAD)})*step(.5,shirtN);
 vec2 cover=textureGrad(map,shirtUv,dFdx(shirtCont),dFdy(shirtCont)).rg*inCell;
 bool whiteInk=shirtCode.g>.5;
 // Linear-space inks: #ffffff, or #23232a on light shirts; white ink gets a soft dark keyline.
 vec3 ink=whiteInk?vec3(1.):vec3(.01681,.01681,.02315);
 float edge=whiteInk?max(cover.g,cover.r)*.5:0.;
 diffuseColor.rgb=mix(vec3(.01681,.01681,.02315),ink,cover.r);
 diffuseColor.a=opacity*max(cover.r,edge)*vShirtFade;
 if(diffuseColor.a<.004)discard;
}`;

/** MeshStandardMaterial whose colour is a number code; clones (playerBatch) keep the shader. */
export class ShirtNumberMaterial extends T.MeshStandardMaterial{
 readonly isShirtNumberMaterial=true;
 constructor(){
  super({map:shirtDigitAtlas(),roughness:.82,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  this.name='shirt-number';
  this.onBeforeCompile=shader=>{
   shader.uniforms.uShirtViewport=viewport;
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>'+VERTEX_PARS).replace('#include <project_vertex>','#include <project_vertex>'+VERTEX_LOD);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>'+FRAGMENT_PARS).replace('#include <map_fragment>',FRAGMENT_MAP).replace('#include <color_fragment>','');
  };
  this.customProgramCacheKey=()=>'shirt-number-v1';
  // Keeps the LOD threshold in CSS pixels, read once per draw (one instanced draw in a match).
  const size=new T.Vector2();
  this.onBeforeRender=(renderer:T.WebGLRenderer)=>{viewport.value=renderer.getSize(size).y||800;};
 }
}
/** Material colour for a number + ink (linear working space, exact in Float32). */
export function encodeShirtNumber(n:number,ink:ShirtInk,out=new T.Color()){
 return out.setRGB(Math.max(0,Math.min(99,Math.round(n)))/100,ink==='#ffffff'?1:0,1,T.LinearSRGBColorSpace);
}
export function decodeShirtNumber(color:T.Color){return {number:Math.floor(color.r*100+.5),ink:(color.g>.5?'#ffffff':'#23232a') as ShirtInk};}

// ---------------------------------------------------------------- rig hook
export type ShirtNumber={
 readonly mesh:T.Mesh;
 readonly number:number|null;
 /** Show a 1–99 number (null hides it). The ink follows the shirt colour. */
 set:(n:number|null)=>void;
 /** After an appearance change: body shape (panel) and shirt colour (ink). */
 sync:(female:boolean)=>void;
 dispose:()=>void;
};
/**
 * Adds the (hidden) back-number panel as a child of the jersey. Call while building the rig, so
 * playerBatch's cached part list includes it; it stays hidden (skipped) until a number is set.
 */
export function createShirtNumber(jersey:T.Mesh,shirt:T.MeshStandardMaterial,female=false):ShirtNumber{
 const material=new ShirtNumberMaterial();
 const mesh=new T.Mesh(shirtNumberPanel(female),material);
 mesh.name='player-shirt-number';mesh.visible=false;mesh.castShadow=false;mesh.receiveShadow=true;
 // Batched draws skip shadows too (playerBatch reads this flag).
 mesh.userData.batchShadow=false;mesh.userData.playerId=jersey.userData.playerId;
 // Same morph weights object as the jersey: the rig's applySpineSurface bends both.
 if(jersey.morphTargetInfluences)mesh.morphTargetInfluences=jersey.morphTargetInfluences;
 mesh.raycast=()=>{};
 jersey.add(mesh);
 let value:number|null=null;
 const paint=()=>{if(value!==null)encodeShirtNumber(value,shirtInk(shirt.color),material.color);};
 return {
  mesh,get number(){return value;},
  set(n){value=n===null||!Number.isFinite(n)||n<1?null:Math.min(99,Math.round(n));mesh.visible=value!==null;paint();},
  sync(isFemale){const g=shirtNumberPanel(isFemale);if(mesh.geometry!==g)mesh.geometry=g;paint();},
  dispose(){material.dispose();mesh.removeFromParent();},
 };
}

// ---------------------------------------------------------------- bean back placement
/** Bean skin (beanSkin.ts): the number sits on the bean's back at this fraction of the bean height, digits this tall. */
export const BEAN_NUMBER_U=.42, BEAN_DIGIT_HEIGHT=.17;
/**
 * The same digit layout as the jersey panel, as a GLSL function for other surfaces (the bean back is shaded
 * in the bean body shader, so its number costs no extra draw). `p` is in metres as seen from BEHIND
 * (x to the viewer's right, y up) with the origin at the number's centre; dpdx/dpdy are its screen derivatives. Returns (fill, outline) coverage.
 */
export const SHIRT_NUMBER_COVER_GLSL=/* glsl */`
const vec2 SHIRT_GLYPH_B[10]=vec2[10](${GLYPH_TABLE});
vec2 shirtNumberCover(sampler2D atlas,vec2 p,float n,float digitHeight,vec2 dpdx,vec2 dpdy){
 float tens=floor(n/10.+.001),ones=n-tens*10.;
 bool two=tens>.5;
 float unit=digitHeight*(two?${f(SHIRT_TWO_DIGIT_SCALE)}:1.)/${f(DIGIT_HEIGHT)};
 vec2 g0=SHIRT_GLYPH_B[int(tens)],g1=SHIRT_GLYPH_B[int(ones)];
 float total=two?g0.y+${f(SHIRT_TRACKING)}+g1.y:g1.y;
 float X=p.x/unit+total*.5;
 float Y=-p.y/unit+${f(DIGIT_HEIGHT/2)};
 float digit=ones,gx=X+g1.x;
 if(two){if(X<g0.y+${f(SHIRT_TRACKING/2)}){digit=tens;gx=X+g0.x;}else gx=X-g0.y-${f(SHIRT_TRACKING)}+g1.x;}
 // Explicit gradients (callable inside non-uniform branches): continuous atlas-space derivatives.
 vec2 k=vec2(${f(ATLAS_SCALE/ATLAS_W)},-${f(ATLAS_SCALE/ATLAS_H)})/unit;
 vec2 uv=vec2((digit*${f(ATLAS_CELL_W)}+(gx+${f(PAD)})*${f(ATLAS_SCALE)})/${f(ATLAS_W)},(Y+${f(CELL_TOP+PAD)})*${f(ATLAS_SCALE/ATLAS_H)});
 float inCell=step(-${f(PAD)},gx)*step(gx,${f(CELL_W_FU-PAD)})*step(-${f(CELL_TOP+PAD)},Y)*step(Y,${f(DIGIT_HEIGHT+CELL_TOP+PAD)})*step(.5,n);
 return textureGrad(atlas,uv,dpdx*k,dpdy*k).rg*inCell;
}`;
